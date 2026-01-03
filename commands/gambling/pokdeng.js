const { SimpleEmbed, getUser, getRandomInt, sleep, blackjackEmbed, gif, cooldown, syms } = require('../../functioon/function');
const { EmbedBuilder } = require('discord.js');

const cooldowns = new Map();
let CDT = 30_000;
var getId = [];
var cdId = [];
var prem = [];

// Active games tracker
const activeGames = new Map();
const playersInGame = new Set();
const activeChannels = new Set();
const playerGameMap = new Map();

// --- DECK FUNCTIONS ---
function createDeck() {
    const deck = [];
    // Standard 52-card deck
    for (let rank = 1; rank <= 13; rank++) deck.push({ rank: rank, color: 'black' });
    for (let rank = 1; rank <= 13; rank++) deck.push({ rank: rank, color: 'black' });
    for (let rank = 1; rank <= 13; rank++) deck.push({ rank: rank, color: 'red' });
    for (let rank = 1; rank <= 13; rank++) deck.push({ rank: rank, color: 'red' });
    
    // Weighted low/zero cards (Pok Deng Specific)
    for (let i = 0; i < 100; i++) {
        deck.push({ rank: 10, color: 'black' }); // 0
        deck.push({ rank: 11, color: 'black' }); // 0
        deck.push({ rank: 12, color: 'red' });   // 0
        deck.push({ rank: 13, color: 'black' }); // 0
        deck.push({ rank: 1, color: 'red' });    // 1
        deck.push({ rank: 2, color: 'black' });  // 2
        deck.push({ rank: 3, color: 'red' });    // 3
        deck.push({ rank: 4, color: 'black' });  // 4
        deck.push({ rank: 5, color: 'red' });    // 5
        deck.push({ rank: 6, color: 'black' });  // 6
    }
    return deck;
}

function shuffleDeck(deck) {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function getCardValue(card) {
    const rank = card.rank;
    if (rank >= 10 && rank <= 13) return 0;
    return rank;
}

function getCardGif(card) {
    const cardMap = {
        1: card.color === 'red' ? gif.one_red_gif : gif.one_black_gif,
        2: card.color === 'red' ? gif.two_red_gif : gif.two_black_gif,
        3: card.color === 'red' ? gif.three_red_gif : gif.three_black_gif,
        4: card.color === 'red' ? gif.four_red_gif : gif.four_black_gif,
        5: card.color === 'red' ? gif.five_red_gif : gif.five_black_gif,
        6: card.color === 'red' ? gif.six_red_gif : gif.six_black_gif,
        7: card.color === 'red' ? gif.seven_red_gif : gif.seven_black_gif,
        8: card.color === 'red' ? gif.eight_red_gif : gif.eight_black_gif,
        9: card.color === 'red' ? gif.nine_red_gif : gif.nine_black_gif,
        10: card.color === 'red' ? gif.ten_red_gif : gif.ten_black_gif,
        11: card.color === 'red' ? gif.j_red_gif : gif.j_black_gif,
        12: card.color === 'red' ? gif.q_red_gif : gif.q_black_gif,
        13: card.color === 'red' ? gif.k_red_gif : gif.k_black_gif,
    };
    return cardMap[card.rank] || gif.back_card_gif;
}

function calculateHandTotal(cards) {
    let total = 0;
    for (let card of cards) {
        total += getCardValue(card);
    }
    return total % 10;
}

function checkSpecialHand(cards) {
    if (cards.length !== 2) return null;
    const total = calculateHandTotal(cards);
    if (total === 9) return { type: 'pok9', multiplier: 4, name: 'Pok 9' };
    if (total === 8) return { type: 'pok8', multiplier: 3, name: 'Pok 8' };
    return null;
}

// --- MAIN EXECUTION ---
module.exports = {
    name: 'pk',
    async execute(client, message, args) {
        try {
            const host = message.author;
            const channelId = message.channel.id;

            if (playersInGame.has(host.id)) {
                message.reply({ embeds: [SimpleEmbed(`<@${host.id}> **You are already in an active game!**`)] });
                return;
            }

            if (activeChannels.has(channelId)) {
                message.reply({ embeds: [SimpleEmbed(`**This table is occupied! Wait for the current game to finish.**`)] });
                return;
            }

            const hostData = await getUser(host.id);
            if(hostData.premium.premium_bool && !prem.includes(host.id)) prem.push(host.id);
            if(cooldown(host.id, getId, cdId, CDT, message, cooldowns, prem)) return;

            let amount = 0;
            let amount_cash = args[0];

            if (!amount_cash) {
                message.reply({ embeds: [SimpleEmbed(`<@${host.id}> **Please specify a bet amount!**`)] });
                return;
            }

            const lowerCash = amount_cash.toLowerCase();
            if (lowerCash === 'all') amount = Math.floor(hostData.balance / 4);
            else if (lowerCash.endsWith('k')) amount = Math.floor(parseFloat(lowerCash.slice(0, -1)) * 1000);
            else if (lowerCash.endsWith('m')) amount = Math.floor(parseFloat(lowerCash.slice(0, -1)) * 1000000);
            else amount = parseInt(amount_cash);

            if (isNaN(amount) || amount <= 0 || !isFinite(amount)) {
                message.reply({ embeds: [SimpleEmbed(`<@${host.id}> **Invalid bet amount!**`)] });
                return;
            }

            if (amount > 10000000) amount = 10000000;

            const requiredCash = Math.floor(amount * 4);
            if (hostData.balance < requiredCash || hostData.balance <= 0) {
                message.reply({ embeds: [SimpleEmbed(`<@${host.id}> **Insufficient funds!**\nTo cover a potential x4 Pok 9 loss, you need: **${requiredCash.toLocaleString()}$**`)] });
                return;
            }

            // Init Game Data
            const gameId = `${channelId}-${Date.now()}-${host.id}`;
            activeChannels.add(channelId);
            playersInGame.add(host.id);
            playerGameMap.set(host.id, gameId);

            let players = [host.id];
            let lobbyEnded = false;
            let gameStarted = false;
            const playerBets = {};
            playerBets[host.id] = amount;

            activeGames.set(gameId, {
                hostId: host.id, channelId, players, amount, requiredCash, playerBets, startTime: Date.now(), gameStarted: false
            });

            // --- LOBBY EMBED DESIGN ---
            const hostUser = await client.users.fetch(host.id);
            
            const getLobbyEmbed = (currentPlayers) => {
                const potSize = amount * currentPlayers.length;
                const playerList = currentPlayers.map((pid, index) => {
                    const isHost = pid === host.id;
                    return `\`${index + 1}.\` ${isHost ? '👑' : '👤'} <@${pid}> ${isHost ? '(Host)' : ''}`;
                }).join('\n');

                // Progress Bar
                const totalSlots = 10;
                const filled = currentPlayers.length;
                const empty = totalSlots - filled;
                const progressBar = `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${filled}/${totalSlots}`;

                return new EmbedBuilder()
                    .setColor('#2b2d31') // Dark casino background
                    .setTitle('🎰 High Stakes Pok Deng Table')
                    .setDescription(`
**💵 Bet Per Player:** \`${amount.toLocaleString()}$\`
**💰 Current Pot:** \`${potSize.toLocaleString()}$\`
**🏦 Min. Cash Required:** \`${requiredCash.toLocaleString()}$\`

**📋 Players at Table:**
${playerList}

**📶 Table Capacity:**
\`${progressBar}\`

> **Game Rules:**
> 🃏 **Pok 9:** Instantly wins **x4**
> 🃏 **Pok 8:** Instantly wins **x3**
                    `)
                    .setFooter({ text: 'Waiting for players... | Host: Start ▶️ | Cancel ❌', iconURL: host.displayAvatarURL() })
                    .setTimestamp();
            };

            const lobbyMsg = await message.channel.send({ embeds: [getLobbyEmbed(players)] });

            try {
                await lobbyMsg.react('🎮');
                await lobbyMsg.react('🚪');
                await lobbyMsg.react('❌');
                await lobbyMsg.react('▶️');
            } catch (e) {}

            const lobbyCollector = lobbyMsg.createReactionCollector({
                filter: (r, u) => ['🎮', '🚪', '❌', '▶️'].includes(r.emoji.name) && !u.bot,
                time: 60_000,
                dispose: true
            });

            lobbyCollector.on('collect', async (reaction, user) => {
                try {
                    const sendTemp = async (txt) => {
                        const t = await message.channel.send({ embeds: [SimpleEmbed(txt)] });
                        setTimeout(() => t.delete().catch(() => {}), 3000);
                    };
                    
                    // Auto-remove reaction
                    try { await reaction.users.remove(user.id); } catch(e) {}

                    if (reaction.emoji.name === '🎮') { // JOIN
                        if (playersInGame.has(user.id)) return sendTemp(`${user.username} - You are already in a game!`);
                        if (players.includes(user.id)) return;
                        if (gameStarted) return sendTemp('Game already started!');
                        
                        const joinerData = await getUser(user.id);
                        if (joinerData.balance < requiredCash) return sendTemp(`${user.username} - You need ${requiredCash.toLocaleString()}$ to join!`);
                        if (players.length >= 10) return sendTemp('Table is full!');

                        players.push(user.id);
                        playersInGame.add(user.id);
                        playerGameMap.set(user.id, gameId);
                        playerBets[user.id] = amount;
                        
                        // Update active game
                        const gd = activeGames.get(gameId);
                        if(gd) { gd.players = players; gd.playerBets = playerBets; }

                        await lobbyMsg.edit({ embeds: [getLobbyEmbed(players)] });
                    }

                    if (reaction.emoji.name === '🚪') { // LEAVE
                        if (gameStarted) return;
                        if (user.id === host.id) return sendTemp('Host cannot leave, use Cancel (❌).');
                        if (!players.includes(user.id)) return;

                        players = players.filter(id => id !== user.id);
                        playersInGame.delete(user.id);
                        playerGameMap.delete(user.id);
                        delete playerBets[user.id];
                        
                        const gd = activeGames.get(gameId);
                        if(gd) { gd.players = players; gd.playerBets = playerBets; }

                        await lobbyMsg.edit({ embeds: [getLobbyEmbed(players)] });
                    }

                    if (reaction.emoji.name === '❌') { // CANCEL
                        if (user.id !== host.id) return;
                        lobbyEnded = true;
                        
                        players.forEach(pid => {
                            playersInGame.delete(pid);
                            playerGameMap.delete(pid);
                        });
                        activeGames.delete(gameId);
                        activeChannels.delete(channelId);

                        await lobbyMsg.edit({ embeds: [SimpleEmbed('**🚫 Table Closed by Host.**')], components: [] });
                        lobbyCollector.stop();
                    }

                    if (reaction.emoji.name === '▶️') { // START
                        if (user.id !== host.id) return;
                        if (players.length < 2) return sendTemp('Need at least 2 players!');

                        lobbyEnded = true;
                        gameStarted = true;
                        const gd = activeGames.get(gameId);
                        if(gd) gd.gameStarted = true;

                        await lobbyMsg.reactions.removeAll().catch(() => {});
                        lobbyCollector.stop();
                        
                        await startPokDengGame(client, message, players, amount, requiredCash, playerBets, lobbyMsg, gameId, channelId);
                    }
                } catch (err) { console.log(err); }
            });

            lobbyCollector.on('end', async () => {
                if (!lobbyEnded) {
                    players.forEach(pid => {
                        playersInGame.delete(pid);
                        playerGameMap.delete(pid);
                    });
                    activeGames.delete(gameId);
                    activeChannels.delete(channelId);
                    await lobbyMsg.edit({ embeds: [SimpleEmbed('**💤 Table timed out.**')] });
                    await lobbyMsg.reactions.removeAll().catch(() => {});
                }
            });

        } catch (error) { console.log(`pokdeng error ${error}`); }
    },
};

// --- GAME LOGIC ---

async function startPokDengGame(client, message, playerIds, amount, requiredCash, playerBets, gameMsg, gameId, channelId) {
    try {
        const totalPrizePool = amount * playerIds.length;
        const playerData = {};

        // Deduct money & Setup
        for (let playerId of playerIds) {
            const userData = await getUser(playerId);
            if (userData.balance < requiredCash) {
                await gameMsg.edit({ embeds: [SimpleEmbed(`**🚫 Game Cancelled:** <@${playerId}> insufficient funds.`)] });
                // Cleanup
                playerIds.forEach(p => { playersInGame.delete(p); playerGameMap.delete(p); });
                activeGames.delete(gameId);
                activeChannels.delete(channelId);
                return;
            }

            userData.balance -= amount;
            await userData.save();

            playerData[playerId] = {
                userData, cards: [], visibleTotal: 0, actualTotal: 0,
                status: 'playing', displayPublic: '', displayFull: '',
                betAmount: amount, hasReceivedPayout: false, specialHand: null,
                hasDrawn: false, finished: false, drawnCard: null
            };
        }

        let deck = shuffleDeck(createDeck());
        if (playerIds.length * 3 > deck.length) {
            // Deck size safety check
            await gameMsg.edit({ embeds: [SimpleEmbed(`**❌ Too many players for one deck!**`)] });
            return;
        }

        // Deal Cards
        let cardIndex = 0;
        for (let playerId of playerIds) {
            const c1 = deck[cardIndex++];
            const c2 = deck[cardIndex++];
            playerData[playerId].cards.push(c1, c2);
            
            const p = playerData[playerId];
            p.visibleTotal = calculateHandTotal(p.cards);
            p.actualTotal = p.visibleTotal;

            // --- CHANGED: ADDED SPACE BETWEEN CARDS ---
            p.displayPublic = getCardGif(c1) + ' ' + getCardGif(c2);
            
            p.displayFull = p.displayPublic;
            p.specialHand = checkSpecialHand(p.cards);
        }

        // Check for Auto-Win (Pok 8/9)
        const pokPlayers = playerIds.filter(id => playerData[id].specialHand);
        if (pokPlayers.length > 0) {
            await handlePokWin(client, gameMsg, playerIds, playerData, totalPrizePool, pokPlayers, gameId, channelId);
            return;
        }

        // --- HELPER FOR TURN EMBED ---
        const getBoardEmbed = async (currentPlayerId, showHidden = false) => {
            const fields = [];
            for (let playerId of playerIds) {
                const user = await client.users.fetch(playerId);
                const p = playerData[playerId];
                const isTurn = playerId === currentPlayerId;
                
                // Status Icons
                let statusIcon = '⏳'; // Waiting
                if (isTurn) statusIcon = '🤔'; // Thinking
                else if (p.finished) statusIcon = p.hasDrawn ? '🃏' : '🛑'; // Hit or Stand

                // Visual Styling
                const nameStr = isTurn ? `__**${user.username}**__` : user.username;
                const scoreDisplay = p.hasDrawn && !showHidden ? `[ ? ]` : `[ ${p.visibleTotal} ]`;
                
                // Cards
                let cardsDisplay = p.displayPublic;
                // --- CHANGED: ADDED SPACE BEFORE BACK CARD GIF ---
                if (p.hasDrawn && !showHidden) cardsDisplay += ' ' + gif.back_card_gif;

                fields.push({
                    name: `${statusIcon} ${nameStr}`,
                    value: `> **Score:** \`${scoreDisplay}\`\n${cardsDisplay}`,
                    inline: false
                });
            }

            return new EmbedBuilder()
                .setColor('#3498db') // Blue for playing phase
                .setTitle('🎴 Dealing Phase')
                .setDescription(`
**Current Turn:** <@${currentPlayerId}>
*Decide: Draw a 3rd card (hidden) or Stand?*
\n**Commands:**
🎴 **Hit** (Draw 1)
🛑 **Stand** (Keep hand)
                `)
                .addFields(fields)
                .setFooter({ text: `Total Pot: ${totalPrizePool.toLocaleString()}$` });
        };

        // Initial Display
        await gameMsg.edit({ embeds: [await getBoardEmbed(playerIds[0])] });
        await sleep(2000);

        // Turn Loop
        let currentPlayerIndex = 0;
        
        async function playTurn() {
            if (currentPlayerIndex >= playerIds.length) {
                await determineWinner(client, gameMsg, playerIds, playerData, totalPrizePool, gameId, channelId);
                return;
            }

            const currentPlayerId = playerIds[currentPlayerIndex];
            const currentPlayer = playerData[currentPlayerId];
            const user = await client.users.fetch(currentPlayerId);

            await gameMsg.edit({ 
                content: `<@${currentPlayerId}>`,
                embeds: [await getBoardEmbed(currentPlayerId)] 
            });

            // Reactions
            await gameMsg.reactions.removeAll().catch(() => {});
            try { await gameMsg.react('🎴'); await gameMsg.react('🛑'); } catch (e) {}

            const collector = gameMsg.createReactionCollector({
                filter: (r, u) => ['🎴', '🛑'].includes(r.emoji.name) && u.id === currentPlayerId,
                time: 30_000,
                max: 1
            });

            collector.on('collect', async (reaction) => {
                if (reaction.emoji.name === '🎴') { // HIT
                    const newCard = deck[cardIndex++];
                    currentPlayer.cards.push(newCard);
                    currentPlayer.drawnCard = newCard;
                    currentPlayer.actualTotal = calculateHandTotal(currentPlayer.cards);
                    
                    // --- CHANGED: JOIN WITH SPACE ---
                    // Update visuals
                    currentPlayer.displayFull = currentPlayer.cards.map(c => getCardGif(c)).join(' ');
                    
                    currentPlayer.hasDrawn = true;
                    currentPlayer.finished = true;

                    // DM Secret
                    try {
                        const dm = new EmbedBuilder()
                            .setColor('#2b2d31')
                            .setTitle('🤫 Shhh... Your Hidden Card')
                            .setDescription(`You drew:\n${getCardGif(newCard)}\n\n**Total Score:** ${currentPlayer.actualTotal}`)
                            .setTimestamp();
                        await user.send({ embeds: [dm] });
                    } catch (e) {}
                    
                    await gameMsg.channel.send({ embeds: [SimpleEmbed(`**${user.username}** drew a card... 🃏`)] }).then(m => setTimeout(() => m.delete(), 2000));
                } 
                else { // STAND
                    currentPlayer.finished = true;
                    await gameMsg.channel.send({ embeds: [SimpleEmbed(`**${user.username}** stands. 🛑`)] }).then(m => setTimeout(() => m.delete(), 2000));
                }

                await sleep(1000);
                currentPlayerIndex++;
                playTurn();
            });

            collector.on('end', async (c, reason) => {
                if (reason === 'time') {
                    currentPlayer.finished = true;
                    await gameMsg.channel.send({ content: `<@${currentPlayerId}> timed out! Auto-stand.` }).then(m => setTimeout(() => m.delete(), 2000));
                    currentPlayerIndex++;
                    playTurn();
                }
            });
        }

        await playTurn();

    } catch (error) {
        console.log(`Game Error: ${error}`);
        playerIds.forEach(p => { playersInGame.delete(p); playerGameMap.delete(p); });
        activeGames.delete(gameId);
        activeChannels.delete(channelId);
    }
}

async function determineWinner(client, gameMsg, playerIds, playerData, totalPrizePool, gameId, channelId) {
    try {
        await gameMsg.reactions.removeAll().catch(() => {});

        let highestScore = -1;
        let winners = [];
        
        // 1. Find the Winner(s)
        for (let playerId of playerIds) {
            const p = playerData[playerId];
            if (p.actualTotal > highestScore) {
                highestScore = p.actualTotal;
                winners = [playerId];
            } else if (p.actualTotal === highestScore) {
                winners.push(playerId);
            }
        }

        // 2. Payout Logic
        // Note: Money was ALREADY deducted at the start.
        // Winner gets: (Total Pot / Number of Winners)
        const totalPayout = totalPrizePool;
        const winAmountPerPlayer = Math.floor(totalPayout / winners.length);
        const winnerNames = [];

        for (let wId of winners) {
            if (!playerData[wId].hasReceivedPayout) {
                const wd = playerData[wId].userData;
                wd.balance += winAmountPerPlayer; // Give them the pot share
                await wd.save();
                playerData[wId].hasReceivedPayout = true;
            }
            winnerNames.push((await client.users.fetch(wId)).username);
        }

        // 3. Compact "In-Line" Display
        const fields = [];
        for (let playerId of playerIds) {
            const user = await client.users.fetch(playerId);
            const p = playerData[playerId];
            const isWinner = winners.includes(playerId);
            
            // Calculate Net Profit for Display only
            // If Win: (Pot Share) - (Original Bet)
            // If Lose: -(Original Bet)
            const netProfit = isWinner ? (winAmountPerPlayer - p.betAmount) : -p.betAmount;
            
            const emoji = isWinner ? '🏆' : '❌';
            const moneyDisplay = isWinner 
                ? `**+${netProfit.toLocaleString()}$**` // Green/Bold for win
                : `-${Math.abs(netProfit).toLocaleString()}$`; // Normal for loss
            
            // Format: "🏆 Username | Score: 9 | +1,000$"
            const headerLine = `${emoji} **${user.username}** •  Score: \`${p.actualTotal}\`  •  ${moneyDisplay}`;

            fields.push({
                name: headerLine,
                value: `${p.displayFull}`, // Cards directly below
                inline: false // Keeps each player on their own row
            });
        }

        const resultEmbed = new EmbedBuilder()
            .setColor(winners.length > 1 ? '#f1c40f' : '#2ecc71') // Gold for tie, Green for win
            .setTitle(winners.length > 1 ? `🤝 Round Draw - Pot Split` : `🎉 Winner: ${winnerNames[0]}`)
            .setDescription(`**Prize Pool:** ${totalPrizePool.toLocaleString()}$`)
            .addFields(fields)
            .setFooter({ text: 'Game Over' })
            .setTimestamp();

        await gameMsg.edit({ content: '', embeds: [resultEmbed] });

        // Cleanup
        playerIds.forEach(p => { playersInGame.delete(p); playerGameMap.delete(p); });
        activeGames.delete(gameId);
        activeChannels.delete(channelId);

    } catch (e) { console.log(e); }
}

async function handlePokWin(client, gameMsg, playerIds, playerData, totalPrizePool, pokPlayers, gameId, channelId) {
    try {
        await gameMsg.reactions.removeAll().catch(() => {});

        // 1. Identify best hand (Pok 9 > Pok 8)
        let highestMultiplier = 0;
        let topPokPlayers = [];
        for (let pid of pokPlayers) {
            const m = playerData[pid].specialHand.multiplier;
            if (m > highestMultiplier) {
                highestMultiplier = m;
                topPokPlayers = [pid];
            } else if (m === highestMultiplier) {
                topPokPlayers.push(pid);
            }
        }

        const betPerPlayer = totalPrizePool / playerIds.length;
        const losers = playerIds.filter(id => !topPokPlayers.includes(id));
        
        // 2. Validate Funds (Anti-Glitch)
        // If a loser cannot afford the multiplier (x3 or x4), void the game.
        const requiredPerLoser = betPerPlayer * highestMultiplier;
        for (let loserId of losers) {
            const ld = await getUser(loserId);
            // Current Balance + The bet they already put in
            const currentTotalAsset = ld.balance + betPerPlayer; 
            
            if (currentTotalAsset < requiredPerLoser) {
                // Refund Everyone
                for (let pid of playerIds) {
                    const d = await getUser(pid);
                    d.balance += betPerPlayer;
                    await d.save();
                }
                await gameMsg.edit({ embeds: [SimpleEmbed(`**⚠️ Game Voided:** A player cannot afford the x${highestMultiplier} Pok payout!`)] });
                // Clean
                playerIds.forEach(p => { playersInGame.delete(p); playerGameMap.delete(p); });
                activeGames.delete(gameId);
                activeChannels.delete(channelId);
                return;
            }
        }

        // 3. Process Extra Loss for Losers
        // They already paid 1x bet at start. We deduct the remaining (Multiplier - 1).
        const extraLossAmount = betPerPlayer * (highestMultiplier - 1);
        for (let lid of losers) {
            const ld = await getUser(lid);
            ld.balance -= extraLossAmount;
            await ld.save();
        }

        // 4. Process Payout for Winners
        // Total collected = (Bet * Players) + (Extra Loss * Losers)
        const totalExtraCollected = extraLossAmount * losers.length;
        const finalPot = totalPrizePool + totalExtraCollected;
        const payoutPerWinner = Math.floor(finalPot / topPokPlayers.length);

        const winnerNames = [];
        for (let wid of topPokPlayers) {
            const wd = playerData[wid].userData;
            wd.balance += payoutPerWinner; // Give total payout
            await wd.save();
            playerData[wid].hasReceivedPayout = true;
            winnerNames.push((await client.users.fetch(wid)).username);
        }

        // 5. Compact "In-Line" Display
        const fields = [];
        const pokType = playerData[topPokPlayers[0]].specialHand.name; // "Pok 9" or "Pok 8"

        for (let pid of playerIds) {
            const user = await client.users.fetch(pid);
            const p = playerData[pid];
            const isWinner = topPokPlayers.includes(pid);
            
            // Calculate Net Profit
            // Winner: Payout - Original Bet
            // Loser: -(Original Bet * Multiplier)
            const netProfit = isWinner 
                ? (payoutPerWinner - p.betAmount) 
                : -(p.betAmount * highestMultiplier);

            const emoji = isWinner ? '🎰' : '💀';
            const statusDisplay = isWinner ? `**${pokType}**` : `Score: \`${p.actualTotal}\``;
            const moneyDisplay = isWinner 
                ? `**+${netProfit.toLocaleString()}$**` 
                : `${netProfit.toLocaleString()}$`; // Shows as negative

            // Format: "🎰 Username | Pok 9 | +9,000$"
            const headerLine = `${emoji} **${user.username}** •  ${statusDisplay}  •  ${moneyDisplay}`;

            fields.push({
                name: headerLine,
                value: `${p.displayFull}`,
                inline: false
            });
        }

        const pokEmbed = new EmbedBuilder()
            .setColor('#e74c3c') // Red for Special Hand
            .setTitle(`🎰 INSTANT WIN: ${pokType.toUpperCase()} (x${highestMultiplier})`)
            .setDescription(`**Winners:** ${winnerNames.join(', ')}`)
            .addFields(fields)
            .setTimestamp();

        await gameMsg.edit({ content: '', embeds: [pokEmbed] });

        // Cleanup
        playerIds.forEach(p => { playersInGame.delete(p); playerGameMap.delete(p); });
        activeGames.delete(gameId);
        activeChannels.delete(channelId);

    } catch (e) { console.log(e); }
}