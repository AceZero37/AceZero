const { SimpleEmbed, getUser, getRandomInt, sleep, blackjackEmbed, gif, cooldown, syms } = require('../../functioon/function');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

const cooldowns = new Map();
let CDT = 30_000;
var getId = [];
var cdId = [];
var prem = [];

// Active games tracker to prevent duplicate joins and exploits
const activeGames = new Map(); // gameId -> game data
const playersInGame = new Set(); // userId -> prevent multiple games
const activeChannels = new Set(); // channelId -> prevent multiple games per channel
const playerGameMap = new Map(); // userId -> gameId (track which game player is in)

// Helper function to get card value for blackjack
function getCardValue(cardRan) {
    if (cardRan >= 10 && cardRan <= 13) return 10; // 10, J, Q, K = 10
    if (cardRan === 1) return 11; // Ace = 11 (will adjust if bust)
    return cardRan; // 2-9 = face value
}

// Helper function to get card gif
function getCardGif(cardRan) {
    // Randomly choose red or black (50/50 chance)
    const isRed = Math.random() < 0.5;
    
    const cardMap = {
        1: isRed ? gif.one_red_gif : gif.one_black_gif,
        2: isRed ? gif.two_red_gif : gif.two_black_gif,
        3: isRed ? gif.three_red_gif : gif.three_black_gif,
        4: isRed ? gif.four_red_gif : gif.four_black_gif,
        5: isRed ? gif.five_red_gif : gif.five_black_gif,
        6: isRed ? gif.six_red_gif : gif.six_black_gif,
        7: isRed ? gif.seven_red_gif : gif.seven_black_gif,
        8: isRed ? gif.eight_red_gif : gif.eight_black_gif,
        9: isRed ? gif.nine_red_gif : gif.nine_black_gif,
        10: isRed ? gif.ten_red_gif : gif.ten_black_gif,
        11: isRed ? gif.j_red_gif : gif.j_black_gif,
        12: isRed ? gif.q_red_gif : gif.q_black_gif,
        13: isRed ? gif.k_red_gif : gif.k_black_gif,
    };
    return cardMap[cardRan] || gif.back_card_gif;
}

// Calculate hand total with Ace adjustment
function calculateHandTotal(cards) {
    let total = 0;
    let aces = 0;
    
    for (let card of cards) {
        let value = getCardValue(card);
        if (card === 1) aces++;
        total += value;
    }
    
    // Adjust for Aces if bust
    while (total > 21 && aces > 0) {
        total -= 10; // Convert Ace from 11 to 1
        aces--;
    }
    
    return total;
}

module.exports = {
    name: 'bj',
    async execute(client, message, args) {
        try{
            const host = message.author;
            const channelId = message.channel.id;

            // Security: Check if host is already in ANY game
            if (playersInGame.has(host.id)) {
                const existingGameId = playerGameMap.get(host.id);
                message.reply({ embeds: [SimpleEmbed(`<@${host.id}>** You are already in an active game! Finish your current game first.**`)] });
                return;
            }

            // Security: Check if channel already has an active game
            if (activeChannels.has(channelId)) {
                message.reply({ embeds: [SimpleEmbed(`**This channel already has an active Blackjack game! Wait for it to finish or use another channel.**`)] });
                return;
            }

            const hostData = await getUser(host.id);

            if(hostData.premium.premium_bool){
                if(!prem.includes(host.id)){
                    prem.push(host.id);
                }
            }

            if(cooldown(host.id, getId, cdId, CDT, message, cooldowns, prem)){
                return;
            };

            let amount = 0;
            let amount_cash = args[0];

            // Parse amount with k and m support
            if (!amount_cash) {
                message.reply({ embeds: [SimpleEmbed(`<@${host.id}>** Please enter a valid amount!**`)] });
                return;
            }

            const lowerCash = amount_cash.toLowerCase();
            
            if (lowerCash === 'all') {
                // Can't use 'all' - need to have 1.5x
                amount = Math.floor(hostData.balance / 1.5);
            } else if (lowerCash.endsWith('k')) {
                const numPart = parseFloat(lowerCash.slice(0, -1));
                if (isNaN(numPart)) {
                    message.reply({ embeds: [SimpleEmbed(`<@${host.id}>** Please enter a valid amount!**`)] });
                    return;
                }
                amount = Math.floor(numPart * 1000);
            } else if (lowerCash.endsWith('m')) {
                const numPart = parseFloat(lowerCash.slice(0, -1));
                if (isNaN(numPart)) {
                    message.reply({ embeds: [SimpleEmbed(`<@${host.id}>** Please enter a valid amount!**`)] });
                    return;
                }
                amount = Math.floor(numPart * 1000000);
            } else {
                amount = parseInt(amount_cash);
            }

            // Security: Validate bet amount
            if(isNaN(amount) || amount <= 0 || !isFinite(amount)){
                message.reply({ embeds: [SimpleEmbed(`<@${host.id}>** Please enter a valid amount!**`)] });
                return;
            }

            // Limit bet to 10M
            if(amount > 10000000){
                amount = 10000000;
            }

            // Check if host has 1.5x the bet amount (for potential blackjack payout)
            const requiredCash = Math.floor(amount * 1.5);
            if(hostData.balance < requiredCash || hostData.balance <= 0){
                // DM the user
                try {
                    await host.send({ embeds: [SimpleEmbed(`**You don't have enough cash to play Blackjack!**\n\n**Bet Amount:** ${amount.toLocaleString()}$\n**Required (for blackjack x1.5):** ${requiredCash.toLocaleString()}$\n**Your Balance:** ${hostData.balance.toLocaleString()}$\n**Need:** ${(requiredCash - hostData.balance).toLocaleString()}$ more`)] });
                } catch (error) {
                    // If DM fails, send in channel
                    message.reply({ embeds: [SimpleEmbed(`<@${host.id}>** You need ${requiredCash.toLocaleString()}$ (bet x1.5) to play in case of blackjack win!**`)] });
                }
                return;
            }

            // Generate unique game ID
            const gameId = `${channelId}-${Date.now()}-${host.id}`;
            
            // Security: Reserve channel and mark host as in game
            activeChannels.add(channelId);
            playersInGame.add(host.id);
            playerGameMap.set(host.id, gameId);

            // Lobby phase
            let players = [host.id];
            let lobbyEnded = false;
            let gameStarted = false;
            const playerBets = {}; // Track how much each player bet
            playerBets[host.id] = amount;

            // Register active game
            activeGames.set(gameId, {
                hostId: host.id,
                channelId: channelId,
                players: players,
                amount: amount,
                requiredCash: requiredCash,
                playerBets: playerBets,
                startTime: Date.now(),
                gameStarted: false
            });

            const hostUser = await client.users.fetch(host.id);
            const lobbyEmbed = new EmbedBuilder()
                .setColor('Blue')
                .setTitle('🃏 Blackjack Lobby')
                .setDescription(`**Bet Amount:** ${amount.toLocaleString()}$\n**Players:** (${players.length}/10)\n\n${hostUser.username} (Host) ✅\n\nWaiting for players to join...\n\n**Rules:**\n• Natural Blackjack (first 2 cards = 21): Win x1.5\n• Regular Win (hit to 21 or highest ≤21): Win x1\n• You need ${requiredCash.toLocaleString()}$ to join!`)
                .setFooter({ text: `Started by ${host.username} | Max bet: 10M`, iconURL: host.displayAvatarURL() })
                .setTimestamp();

            const lobbyButtons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('join')
                        .setLabel('Join 🎮')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('leave')
                        .setLabel('Leave 🚪')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('cancel')
                        .setLabel('Cancel ❌')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId('start')
                        .setLabel('Start Game ▶️')
                        .setStyle(ButtonStyle.Primary)
                );

            const lobbyMsg = await message.channel.send({
                embeds: [lobbyEmbed],
                components: [lobbyButtons]
            });

            const lobbyFilter = (i) => {
                if (i.customId === 'join' || i.customId === 'leave') return i.user.id !== client.user.id;
                if (i.customId === 'cancel' || i.customId === 'start') return true;
                return false;
            };

            const lobbyCollector = lobbyMsg.createMessageComponentCollector({
                filter: lobbyFilter,
                time: 60_000
            });

            lobbyCollector.on('collect', async (interaction) => {
                try {
                    if (interaction.customId === 'join') {
                        const joiner = interaction.user;
                        
                        // Security: Check if already in ANY game (anywhere)
                        if (playersInGame.has(joiner.id)) {
                            const joinerGameId = playerGameMap.get(joiner.id);
                            if (joinerGameId !== gameId) {
                                await interaction.reply({ 
                                    embeds: [SimpleEmbed(`${joiner.username} - You are already in another active game! Finish that game first.`)],
                                    ephemeral: true 
                                });
                            } else {
                                await interaction.reply({ 
                                    embeds: [SimpleEmbed(`${joiner.username} - You already joined this game!`)],
                                    ephemeral: true 
                                });
                            }
                            return;
                        }
                        
                        // Security: Check if already joined THIS game
                        if (players.includes(joiner.id)) {
                            await interaction.reply({ 
                                embeds: [SimpleEmbed(`${joiner.username} - You already joined!`)],
                                ephemeral: true 
                            });
                            return;
                        }
                        
                        // Security: Check if game already started
                        if (gameStarted) {
                            await interaction.reply({ 
                                embeds: [SimpleEmbed(`${joiner.username} - Game already started!`)],
                                ephemeral: true 
                            });
                            return;
                        }
                        
                        const joinerData = await getUser(joiner.id);

                        // Check if joiner has 1.5x the bet amount
                        if (joinerData.balance < requiredCash || joinerData.balance <= 0) {
                            // DM the joiner
                            try {
                                await joiner.send({ embeds: [SimpleEmbed(`**You don't have enough cash to join this Blackjack game!**\n\n**Bet Amount:** ${amount.toLocaleString()}$\n**Required (for blackjack x1.5):** ${requiredCash.toLocaleString()}$\n**Your Balance:** ${joinerData.balance.toLocaleString()}$\n**Need:** ${(requiredCash - joinerData.balance).toLocaleString()}$ more`)] });
                            } catch (error) {
                                // If DM fails, reply ephemeral
                            }
                            
                            await interaction.reply({ 
                                embeds: [SimpleEmbed(`${joiner.username} - You need ${requiredCash.toLocaleString()}$ to join!`)],
                                ephemeral: true 
                            });
                            return;
                        }

                        if (players.length >= 10) {
                            await interaction.reply({ 
                                embeds: [SimpleEmbed(`**Game is full! Maximum 10 players.**`)],
                                ephemeral: true 
                            });
                            return;
                        }

                        // Add to tracking (don't deduct money yet)
                        players.push(joiner.id);
                        playersInGame.add(joiner.id);
                        playerGameMap.set(joiner.id, gameId);
                        playerBets[joiner.id] = amount;
                        
                        // Update active game data
                        const gameData = activeGames.get(gameId);
                        if (gameData) {
                            gameData.players = players;
                            gameData.playerBets = playerBets;
                        }
                        
                        const playerNames = [];
                        for (let pId of players) {
                            const pUser = await client.users.fetch(pId);
                            playerNames.push(pId === host.id ? `${pUser.username} (Host) ✅` : `${pUser.username} ✅`);
                        }
                        
                        const updatedEmbed = new EmbedBuilder()
                            .setColor('Blue')
                            .setTitle('🃏 Blackjack Lobby')
                            .setDescription(`**Bet Amount:** ${amount.toLocaleString()}$\n**Players:** (${players.length}/10)\n\n${playerNames.join('\n')}\n\nWaiting for host to start...\n\n**Rules:**\n• Natural Blackjack (first 2 cards = 21): Win x1.5\n• Regular Win (hit to 21 or highest ≤21): Win x1\n• You need ${requiredCash.toLocaleString()}$ to join!`)
                            .setFooter({ text: `Started by ${host.username} | Max bet: 10M`, iconURL: host.displayAvatarURL() })
                            .setTimestamp();

                        await interaction.update({ embeds: [updatedEmbed] });
                    }

                    if (interaction.customId === 'leave') {
                        const leaver = interaction.user;
                        
                        // Security: Check if game already started
                        if (gameStarted) {
                            await interaction.reply({ 
                                embeds: [SimpleEmbed(`${leaver.username} - Cannot leave after game started!`)],
                                ephemeral: true 
                            });
                            return;
                        }
                        
                        // Host cannot leave
                        if (leaver.id === host.id) {
                            await interaction.reply({ 
                                embeds: [SimpleEmbed(`${leaver.username} - Host cannot leave! Use Cancel instead.`)],
                                ephemeral: true 
                            });
                            return;
                        }
                        
                        // Check if player is in the game
                        if (!players.includes(leaver.id)) {
                            await interaction.reply({ 
                                embeds: [SimpleEmbed(`${leaver.username} - You haven't joined yet!`)],
                                ephemeral: true 
                            });
                            return;
                        }

                        // Remove player from tracking (no money to refund since we haven't deducted yet)
                        players = players.filter(id => id !== leaver.id);
                        playersInGame.delete(leaver.id);
                        playerGameMap.delete(leaver.id);
                        delete playerBets[leaver.id];
                        
                        // Update active game data
                        const gameData = activeGames.get(gameId);
                        if (gameData) {
                            gameData.players = players;
                            gameData.playerBets = playerBets;
                        }
                        
                        const playerNames = [];
                        for (let pId of players) {
                            const pUser = await client.users.fetch(pId);
                            playerNames.push(pId === host.id ? `${pUser.username} (Host) ✅` : `${pUser.username} ✅`);
                        }
                        
                        const updatedEmbed = new EmbedBuilder()
                            .setColor('Blue')
                            .setTitle('🃏 Blackjack Lobby')
                            .setDescription(`**Bet Amount:** ${amount.toLocaleString()}$\n**Players:** (${players.length}/10)\n\n${playerNames.join('\n')}\n\nWaiting for host to start...\n\n**Rules:**\n• Natural Blackjack (first 2 cards = 21): Win x1.5\n• Regular Win (hit to 21 or highest ≤21): Win x1\n• You need ${requiredCash.toLocaleString()}$ to join!`)
                            .setFooter({ text: `Started by ${host.username} | Max bet: 10M`, iconURL: host.displayAvatarURL() })
                            .setTimestamp();

                        await interaction.update({ embeds: [updatedEmbed] });
                    }

                    if (interaction.customId === 'cancel') {
                        // Only host can cancel
                        if (interaction.user.id !== host.id) {
                            await interaction.reply({ 
                                embeds: [SimpleEmbed(`${interaction.user.username} - Only the host can cancel the game!`)],
                                ephemeral: true 
                            });
                            return;
                        }
                        
                        lobbyEnded = true;
                        
                        // Remove all players from tracking (no money to refund)
                        for (let playerId of players) {
                            playersInGame.delete(playerId);
                            playerGameMap.delete(playerId);
                        }
                        
                        // Cleanup
                        activeGames.delete(gameId);
                        activeChannels.delete(channelId);
                        
                        await interaction.update({
                            embeds: [SimpleEmbed('**Game cancelled by host.**')],
                            components: []
                        });
                        lobbyCollector.stop();
                    }

                    if (interaction.customId === 'start') {
                        // Only host can start
                        if (interaction.user.id !== host.id) {
                            await interaction.reply({ 
                                embeds: [SimpleEmbed(`${interaction.user.username} - Only the host can start the game!`)],
                                ephemeral: true 
                            });
                            return;
                        }
                        
                        if (players.length < 2) {
                            await interaction.reply({ 
                                embeds: [SimpleEmbed('**Need at least 2 players to start!**')],
                                ephemeral: true 
                            });
                            return;
                        }

                        // Security: Mark game as started
                        lobbyEnded = true;
                        gameStarted = true;
                        const gameData = activeGames.get(gameId);
                        if (gameData) {
                            gameData.gameStarted = true;
                        }
                        
                        await interaction.update({
                            embeds: [SimpleEmbed('**Starting game...**')],
                            components: []
                        });
                        lobbyCollector.stop();
                        
                        // Start the game (money will be deducted here)
                        await startBlackjackGame(client, message, players, amount, requiredCash, playerBets, lobbyMsg, gameId, channelId);
                    }
                } catch (error) {
                    console.log(`Lobby interaction error: ${error}`);
                }
            });

            lobbyCollector.on('end', async () => {
                if (!lobbyEnded) {
                    // Timeout - remove all players from tracking (no money to refund)
                    for (let playerId of players) {
                        playersInGame.delete(playerId);
                        playerGameMap.delete(playerId);
                    }
                    
                    // Cleanup
                    activeGames.delete(gameId);
                    activeChannels.delete(channelId);
                    
                    await lobbyMsg.edit({
                        embeds: [SimpleEmbed('**Lobby timed out.**')],
                        components: []
                    });
                }
            });

        }catch(error){
            console.log(`blackjack error ${error}`);
        }
    },
};

async function startBlackjackGame(client, message, playerIds, amount, requiredCash, playerBets, gameMsg, gameId, channelId) {
    try {
        // NOW deduct money from all players when game starts
        const totalPrizePool = amount * playerIds.length;
        
        const playerData = {};
        for (let playerId of playerIds) {
            const userData = await getUser(playerId);
            
            // Verify player still has 1.5x the bet amount
            if (userData.balance < requiredCash) {
                await gameMsg.edit({
                    embeds: [SimpleEmbed(`**Game cancelled! ${(await client.users.fetch(playerId)).username} no longer has enough cash (needs ${requiredCash.toLocaleString()}$).**`)],
                    components: []
                });
                // Cleanup
                for (let pId of playerIds) {
                    playersInGame.delete(pId);
                    playerGameMap.delete(pId);
                }
                activeGames.delete(gameId);
                activeChannels.delete(channelId);
                return;
            }
            
            // Deduct bet from player (only the bet amount, not 1.5x)
            const beforeBalance = userData.balance;
            userData.balance -= amount;
            await userData.save();
            
            // Verify deduction
            const verifyData = await getUser(playerId);
            if (verifyData.balance !== beforeBalance - amount) {
                console.log(`SECURITY WARNING: Balance mismatch for ${playerId}`);
            }
            
            playerData[playerId] = {
                userData: userData,
                cards: [],
                total: 0,
                status: 'playing', // playing, stand, bust, blackjack, twenty_one
                display: '',
                finished: false,
                betAmount: amount,
                hasReceivedPayout: false, // Security flag
                isNaturalBlackjack: false // Track if it's natural blackjack (first 2 cards)
            };
        }

        // Deal initial 2 cards to all players
        for (let playerId of playerIds) {
            playerData[playerId].cards.push(getRandomInt(1, 13));
            playerData[playerId].cards.push(getRandomInt(1, 13));
            playerData[playerId].total = calculateHandTotal(playerData[playerId].cards);
            playerData[playerId].display = playerData[playerId].cards.map(card => getCardGif(card)).join('');

            // Check for natural blackjack (21 with exactly 2 cards)
            if (playerData[playerId].total === 21 && playerData[playerId].cards.length === 2) {
                playerData[playerId].status = 'blackjack';
                playerData[playerId].isNaturalBlackjack = true;
                playerData[playerId].finished = true;
            } else if (playerData[playerId].total > 21) {
                playerData[playerId].status = 'bust';
                playerData[playerId].finished = true;
            }
        }

        // Check if anyone got natural blackjack (instant win x1.5)
        const blackjackPlayers = playerIds.filter(id => playerData[id].isNaturalBlackjack);
        if (blackjackPlayers.length > 0) {
            await handleBlackjackWin(client, gameMsg, playerIds, playerData, totalPrizePool, blackjackPlayers, gameId, channelId);
            return;
        }

        let currentPlayerIndex = 0;
        let gameFinished = false;

        // Update game display
        async function updateGameDisplay(highlightPlayer = null) {
            const fields = [];
            
            for (let i = 0; i < playerIds.length; i++) {
                const playerId = playerIds[i];
                const player = playerData[playerId];
                const user = await client.users.fetch(playerId);
                
                let statusEmoji = '';
                if (player.status === 'blackjack') statusEmoji = '🎰';
                else if (player.status === 'bust') statusEmoji = '💀';
                else if (player.status === 'stand' || player.status === 'twenty_one') statusEmoji = '🛑';
                else if (player.finished) statusEmoji = '✅';
                else statusEmoji = '⏳';

                const isCurrentPlayer = highlightPlayer === playerId;
                const name = isCurrentPlayer ? `► ${statusEmoji} ${user.username} ◄` : `${statusEmoji} ${user.username}`;
                
                fields.push({
                    name: name,
                    value: `**Total:** \`${player.total}\`\n${player.display}`,
                    inline: false
                });
            }

            const embed = new EmbedBuilder()
                .setColor('Blue')
                .setTitle('🃏 Blackjack Game')
                .setDescription(`**Bet:** ${amount.toLocaleString()}$\n**Natural Blackjack (2 cards = 21) = x1.5 | Regular Win = x1**\n\n⏳ = Playing | 🛑 = Stand | 💀 = Bust | 🎰 = BLACKJACK`)
                .addFields(fields)
                .setTimestamp();

            return embed;
        }

        // Initial display
        await gameMsg.edit({
            embeds: [await updateGameDisplay()],
            components: []
        });
        await sleep(2000);

        // Game loop for each player
        async function playTurn() {
            if (gameFinished) return;
            
            if (currentPlayerIndex >= playerIds.length) {
                // All players finished, determine winner
                await determineWinner();
                return;
            }

            const currentPlayerId = playerIds[currentPlayerIndex];
            const currentPlayer = playerData[currentPlayerId];

            // Skip if player already finished
            if (currentPlayer.finished) {
                currentPlayerIndex++;
                await playTurn();
                return;
            }

            const user = await client.users.fetch(currentPlayerId);

            const gameButtons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('hit')
                        .setLabel('Hit 👊')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('stand')
                        .setLabel('Stand 🛑')
                        .setStyle(ButtonStyle.Success)
                );

            await gameMsg.edit({
                content: `${user.username}, your turn!`,
                embeds: [await updateGameDisplay(currentPlayerId)],
                components: [gameButtons]
            });

            const filter = (i) => {
                // Security: Only allow current player to interact
                if (i.user.id === currentPlayerId) return true;
                
                // Block other players with message
                if (i.customId === 'hit' || i.customId === 'stand') {
                    i.reply({ 
                        embeds: [SimpleEmbed(`${i.user.username} - It's not your turn!`)],
                        ephemeral: true 
                    });
                    return false;
                }
                
                return false;
            };
            const collector = gameMsg.createMessageComponentCollector({
                filter,
                time: 30_000
            });

            let actionTaken = false;

            collector.on('collect', async (interaction) => {
                if (actionTaken || gameFinished) return;
                actionTaken = true;

                try {
                    if (interaction.customId === 'hit') {
                        await interaction.deferUpdate();
                        
                        const newCard = getRandomInt(1, 13);
                        currentPlayer.cards.push(newCard);
                        currentPlayer.total = calculateHandTotal(currentPlayer.cards);
                        currentPlayer.display = currentPlayer.cards.map(card => getCardGif(card)).join('');

                        await gameMsg.edit({
                            embeds: [await updateGameDisplay(currentPlayerId)],
                            components: [gameButtons]
                        });

                        await sleep(500);

                        if (currentPlayer.total > 21) {
                            currentPlayer.status = 'bust';
                            currentPlayer.finished = true;
                            collector.stop();
                            await gameMsg.edit({
                                content: `${user.username} BUST!`,
                                embeds: [await updateGameDisplay(currentPlayerId)],
                                components: []
                            });
                            await sleep(2000);
                            currentPlayerIndex++;
                            await playTurn();
                        } else if (currentPlayer.total === 21) {
                            // Hit to 21 = regular win (not natural blackjack)
                            currentPlayer.status = 'twenty_one';
                            currentPlayer.finished = true;
                            collector.stop();
                            await gameMsg.edit({
                                content: `${user.username} got 21!`,
                                embeds: [await updateGameDisplay(currentPlayerId)],
                                components: []
                            });
                            await sleep(2000);
                            currentPlayerIndex++;
                            await playTurn();
                        } else {
                            // Continue playing
                            actionTaken = false;
                        }
                    } else if (interaction.customId === 'stand') {
                        await interaction.deferUpdate();
                        currentPlayer.status = 'stand';
                        currentPlayer.finished = true;
                        collector.stop();
                        await gameMsg.edit({
                            content: `${user.username} stands at ${currentPlayer.total}!`,
                            embeds: [await updateGameDisplay(currentPlayerId)],
                            components: []
                        });
                        await sleep(2000);
                        currentPlayerIndex++;
                        await playTurn();
                    }
                } catch (error) {
                    console.log(`Game action error: ${error}`);
                }
            });

            collector.on('end', async (collected) => {
                if (!currentPlayer.finished && !gameFinished) {
                    // Timeout - auto stand
                    currentPlayer.status = 'stand';
                    currentPlayer.finished = true;
                    const user = await client.users.fetch(currentPlayerId);
                    await gameMsg.edit({
                        content: `${user.username} time's up! Auto stand at ${currentPlayer.total}`,
                        embeds: [await updateGameDisplay(currentPlayerId)],
                        components: []
                    });
                    await sleep(2000);
                    currentPlayerIndex++;
                    await playTurn();
                }
            });
        }

        async function determineWinner() {
            if (gameFinished) return;
            gameFinished = true;
            
            // Find highest score ≤ 21
            let highestScore = 0;
            let winners = [];

            for (let playerId of playerIds) {
                const player = playerData[playerId];
                if (player.status !== 'bust' && player.total <= 21) {
                    if (player.total > highestScore) {
                        highestScore = player.total;
                        winners = [playerId];
                    } else if (player.total === highestScore) {
                        winners.push(playerId);
                    }
                }
            }

            let resultText = '';

            if (winners.length === 0) {
                // Everyone busted - no winner, money lost
                resultText = '**🎲 Everyone Busted! No winner! All money lost!**\n\n';
            } else if (winners.length === 1) {
                // Single winner - gets bet x number of players (regular win x1)
                const winnerId = winners[0];
                const winnerData = playerData[winnerId].userData;
                const winnerUser = await client.users.fetch(winnerId);
                
                // Security: Verify no double payout
                if (playerData[winnerId].hasReceivedPayout) {
                    console.log(`SECURITY WARNING: Attempted double payout for ${winnerId}`);
                } else {
                    const beforeWinBalance = winnerData.balance;
                    winnerData.balance += totalPrizePool;
                    await winnerData.save();
                    playerData[winnerId].hasReceivedPayout = true;
                    
                    // Verify payout
                    const verifyWinData = await getUser(winnerId);
                    if (verifyWinData.balance !== beforeWinBalance + totalPrizePool) {
                        console.log(`SECURITY WARNING: Payout mismatch for ${winnerId}`);
                    }
                }
                
                const profit = totalPrizePool - playerData[winnerId].betAmount;
                resultText = `**🏆 Winner: ${winnerUser.username}!**\n**Winning Score:** ${highestScore}\n\n`;
            } else {
                // Multiple winners - split pool
                const splitAmount = Math.floor(totalPrizePool / winners.length);
                const winnerNames = [];
                for (let winnerId of winners) {
                    const winnerData = playerData[winnerId].userData;
                    const winnerUser = await client.users.fetch(winnerId);
                    
                    // Security: Verify no double payout
                    if (playerData[winnerId].hasReceivedPayout) {
                        console.log(`SECURITY WARNING: Attempted double payout for ${winnerId}`);
                        continue;
                    }
                    
                    const beforeSplitBalance = winnerData.balance;
                    winnerData.balance += splitAmount;
                    await winnerData.save();
                    playerData[winnerId].hasReceivedPayout = true;
                    
                    // Verify payout
                    const verifySplitData = await getUser(winnerId);
                    if (verifySplitData.balance !== beforeSplitBalance + splitAmount) {
                        console.log(`SECURITY WARNING: Split payout mismatch for ${winnerId}`);
                    }
                    
                    winnerNames.push(winnerUser.username);
                }
                resultText = `**🏆 Tie! Winners: ${winnerNames.join(', ')}**\n**Tied Score:** ${highestScore}\n\n`;
            }

            // Build final results
            const fields = [];
            for (let playerId of playerIds) {
                const player = playerData[playerId];
                const user = await client.users.fetch(playerId);
                const isWinner = winners.includes(playerId);
                
                let statusText = '';
                if (player.status === 'bust') {
                    statusText = `💀 BUST`;
                } else if (isWinner) {
                    const winAmount = winners.length === 1 ? totalPrizePool : Math.floor(totalPrizePool / winners.length);
                    const profit = winAmount - player.betAmount;
                    statusText = `🏆 WINNER (+${profit.toLocaleString()}$)`;
                } else {
                    statusText = `❌ Lost [${player.total}]`;
                }

                fields.push({
                    name: `${isWinner ? '🏆' : '❌'} ${user.username}`,
                    value: `**Total:** \`${player.total}\` - ${statusText}\n${player.display}`,
                    inline: false
                });
            }

            // Calculate footer text with winnings
            let footerText = '';
            if (winners.length === 0) {
                footerText = `Prize Pool: ${totalPrizePool.toLocaleString()}$ (Lost)`;
            } else if (winners.length === 1) {
                const winnerId = winners[0];
                const profit = totalPrizePool - playerData[winnerId].betAmount;
                footerText = `Won: +${profit.toLocaleString()}$ | Prize Pool: ${totalPrizePool.toLocaleString()}$`;
            } else {
                const splitAmount = Math.floor(totalPrizePool / winners.length);
                const profit = splitAmount - playerData[winners[0]].betAmount;
                footerText = `Each Won: +${profit.toLocaleString()}$ | Prize Pool: ${totalPrizePool.toLocaleString()}$`;
            }

            const finalEmbed = new EmbedBuilder()
                .setColor(winners.length > 0 ? 'Green' : 'Red')
                .setTitle('🃏 Game Over!')
                .setDescription(resultText)
                .addFields(fields)
                .setFooter({ text: footerText })
                .setTimestamp();

            await gameMsg.edit({
                content: '',
                embeds: [finalEmbed],
                components: []
            });
            
            // Cleanup - Free all players and channel
            for (let playerId of playerIds) {
                playersInGame.delete(playerId);
                playerGameMap.delete(playerId);
            }
            activeGames.delete(gameId);
            activeChannels.delete(channelId);
        }

        await playTurn();

    } catch (error) {
        console.log(`Game error: ${error}`);
        // Emergency cleanup
        for (let playerId of playerIds) {
            playersInGame.delete(playerId);
            playerGameMap.delete(playerId);
        }
        activeGames.delete(gameId);
        activeChannels.delete(channelId);
    }
}

async function handleBlackjackWin(client, gameMsg, playerIds, playerData, totalPrizePool, blackjackWinners, gameId, channelId) {
    try {
        // Natural Blackjack winners get x1.5 of their bet from each losing player
        // Total blackjack payout = (bet × number_of_losers × 1.5) / number_of_blackjack_winners
        const numLosers = playerIds.length - blackjackWinners.length;
        const totalBlackjackPayout = Math.floor((totalPrizePool / playerIds.length) * numLosers * 1.5);
        const winPerWinner = Math.floor(totalBlackjackPayout / blackjackWinners.length) + Math.floor(totalPrizePool / playerIds.length); // Add back their bet
        
        const winnerNames = [];
        for (let winnerId of blackjackWinners) {
            const winnerData = playerData[winnerId].userData;
            const winnerUser = await client.users.fetch(winnerId);
            
            // Security: Verify no double payout
            if (playerData[winnerId].hasReceivedPayout) {
                console.log(`SECURITY WARNING: Attempted double blackjack payout for ${winnerId}`);
                continue;
            }
            
            const beforeBJBalance = winnerData.balance;
            winnerData.balance += winPerWinner;
            await winnerData.save();
            playerData[winnerId].hasReceivedPayout = true;
            
            // Verify payout
            const verifyBJData = await getUser(winnerId);
            if (verifyBJData.balance !== beforeBJBalance + winPerWinner) {
                console.log(`SECURITY WARNING: Blackjack payout mismatch for ${winnerId}`);
            }
            
            winnerNames.push(winnerUser.username);
        }

        // Build results
        const fields = [];
        for (let playerId of playerIds) {
            const player = playerData[playerId];
            const user = await client.users.fetch(playerId);
            const isWinner = blackjackWinners.includes(playerId);
            
            let statusText = '';
            if (isWinner) {
                const profit = winPerWinner - player.betAmount;
                statusText = `🎰 BLACKJACK! (+${profit.toLocaleString()}$)`;
            } else {
                statusText = `❌ Lost`;
            }

            fields.push({
                name: `${isWinner ? '🎰' : '❌'} ${user.username}`,
                value: `**Total:** \`${player.total}\` - ${statusText}\n${player.display}`,
                inline: false
            });
        }

        const resultText = blackjackWinners.length === 1 
            ? `**🎰 NATURAL BLACKJACK! ${winnerNames[0]} WINS x1.5!**\n\n`
            : `**🎰 MULTIPLE BLACKJACKS! ${winnerNames.join(', ')}**\n\n`;

        // Calculate footer text with winnings
        const profit = winPerWinner - playerData[blackjackWinners[0]].betAmount;
        const footerText = blackjackWinners.length === 1 
            ? `Won: +${profit.toLocaleString()}$ (x1.5) | Prize Pool: ${totalPrizePool.toLocaleString()}$`
            : `Each Won: +${profit.toLocaleString()}$ (x1.5) | Prize Pool: ${totalPrizePool.toLocaleString()}$`;

        const finalEmbed = new EmbedBuilder()
            .setColor('Gold')
            .setTitle('🎰 BLACKJACK - INSTANT WIN!')
            .setDescription(resultText)
            .addFields(fields)
            .setFooter({ text: footerText })
            .setTimestamp();

        await gameMsg.edit({
            content: '',
            embeds: [finalEmbed],
            components: []
        });
        
        // Cleanup - Free all players and channel
        for (let playerId of playerIds) {
            playersInGame.delete(playerId);
            playerGameMap.delete(playerId);
        }
        activeGames.delete(gameId);
        activeChannels.delete(channelId);
    } catch (error) {
        console.log(`Blackjack win error: ${error}`);
        // Emergency cleanup
        for (let playerId of playerIds) {
            playersInGame.delete(playerId);
            playerGameMap.delete(playerId);
        }
        activeGames.delete(gameId);
        activeChannels.delete(channelId);
    }
}