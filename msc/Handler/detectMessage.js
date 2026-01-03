const { PermissionsBitField } = require('discord.js');
const mongoose = require('mongoose');
const { userSchema } = require('../../users/user');
const User = mongoose.model('User', userSchema);
require('dotenv').config();
const { getUser, ButtonStyle, oneButton, labelButton, getCollectionButton, sym, EmbedBuilder } = require('../../functioon/function');

// Auto-ban log channel ID for spam/auto-click detection
const AUTO_BAN_LOG_CHANNEL_ID = '1451597788965109953';
const config = require('../../config');
const fs = require('fs').promises;
const fsSync = require('fs');

// ======================== CACHED DATA (LOAD ONCE) ========================
let banlist = [];
let serverlist = [];
let banlistLastModified = 0;
let serverlistLastModified = 0;

const AUTOMATION_THRESHOLD = 5;
const TIME_WINDOW = 10000;
let messageCache = {};

const userFirstCommandTimes = new Map();
const TIMES = 1 * 60 * 60 * 1000;

// ======================== USER DATA CACHE ========================
const userDataCache = new Map();
const USER_CACHE_TTL = 60000; // 1 minute cache

async function getCachedUser(userId) {
    const cached = userDataCache.get(userId);
    if (cached && Date.now() - cached.timestamp < USER_CACHE_TTL) {
        return cached.data;
    }
    const userData = await getUser(userId);
    if (userData) {
        userDataCache.set(userId, { data: userData, timestamp: Date.now() });
    }
    return userData;
}

// ======================== LOAD BANLISTS (CACHED) ========================
function loadBanlistSync() {
    try {
        if (!fsSync.existsSync('./banlist.json')) return [];
        const stats = fsSync.statSync('./banlist.json');
        if (stats.mtimeMs === banlistLastModified) return banlist; // No change
        banlistLastModified = stats.mtimeMs;
        const data = fsSync.readFileSync('./banlist.json', 'utf8');
        return JSON.parse(data || '[]');
    } catch (error) {
        console.error('Error loading banlist sync:', error);
        return banlist; // Return cached version on error
    }
}

function loadServerlistSync() {
    try {
        if (!fsSync.existsSync('./banServerlist.json')) return [];
        const stats = fsSync.statSync('./banServerlist.json');
        if (stats.mtimeMs === serverlistLastModified) return serverlist; // No change
        serverlistLastModified = stats.mtimeMs;
        const data = fsSync.readFileSync('./banServerlist.json', 'utf8');
        return JSON.parse(data || '[]');
    } catch (error) {
        console.error('Error loading serverlist sync:', error);
        return serverlist; // Return cached version on error
    }
}

async function saveBanlistToFile(list) {
    try {
        await fs.writeFile('./banlist.json', JSON.stringify(list, null, 2), 'utf8');
        banlistLastModified = Date.now();
        banlist = list;
    } catch (error) {
        console.error('Error saving banlist:', error);
    }
}

// ======================== RELOAD BANLISTS PERIODICALLY (NOT EVERY MESSAGE) ========================
setInterval(() => {
    banlist = loadBanlistSync();
    serverlist = loadServerlistSync();
}, 30000); // Reload every 30 seconds instead of every message

async function detectMessage(client) {
    try {
        const {
            getEconomy, getGambling, getUtility, getSocial, getGiveaway, getAdmin,
            getWork, getMine, getGame, getRank, getDragon, getAnimal, getFarm, getSlashCommands
        } = require('../../msc/Handler/commandHandler');
        const { leveling } = require('../../events/leveling');
        const { prem } = require('../../events/premium');

        // Initial load
        banlist = loadBanlistSync();
        serverlist = loadServerlistSync();

        // ======================== NON-BLOCKING LOG (Fire and forget) ========================
        function logToChannelAsync(channelId, text) {
            if (!channelId) return;
            setImmediate(async () => {
                try {
                    const logChannel = await client.channels.fetch(channelId).catch(() => null);
                    if (logChannel && typeof logChannel.send === 'function') {
                        await logChannel.send({ content: text }).catch(() => { });
                    }
                } catch (err) { /* Ignore logging errors */ }
            });
        }

        client.on('messageCreate', async (message) => {
            try {
                // ===== FAST EARLY RETURNS =====
                if (!message || message.author?.bot) return;
                if (!message.guild) return;
                if (banlist.includes(message.author.id) || serverlist.includes(message.guildId)) return;

                const messageContent = message.content || '';
                if (!messageContent) return;

                const lowerCaseMessageContent = messageContent.toLowerCase();
                const guildPrefix = getGuildPrefix(message.guild.id);

                // Check prefix early
                if (!(lowerCaseMessageContent.startsWith(guildPrefix.toLowerCase()) || lowerCaseMessageContent.startsWith(config.prefix.toLowerCase()))) return;

                const botMember = message.guild.members.me;
                if (!botMember) return;

                // ===== SIMPLIFIED PERMISSION CHECK =====
                if (!botMember.permissionsIn(message.channel).has(PermissionsBitField.Flags.SendMessages)) return;

                const userId = message.author.id;
                const content = message.content;
                const currentTime = Date.now();

                // ===== SPAM DETECTION (Simplified) =====
                if (!messageCache[userId]) messageCache[userId] = [];
                messageCache[userId].push({ content, timestamp: currentTime });
                messageCache[userId] = messageCache[userId].filter(msg => msg.timestamp > currentTime - TIME_WINDOW);
                const similarMessages = messageCache[userId].filter(msg => msg.content === content).length;

                if (!userFirstCommandTimes.has(userId)) {
                    userFirstCommandTimes.set(userId, currentTime);
                }

                // ===== AUTO-BAN CHECK =====
                if (currentTime - userFirstCommandTimes.get(userId) >= TIMES || similarMessages >= AUTOMATION_THRESHOLD) {
                    userFirstCommandTimes.delete(userId);

                    const banReason = similarMessages >= AUTOMATION_THRESHOLD
                        ? `Auto-click/Spam detected (${similarMessages} similar messages in ${TIME_WINDOW / 1000}s)`
                        : `Suspicious activity (possible automation)`;

                    if (!banlist.includes(userId)) {
                        banlist.push(userId);
                        await saveBanlistToFile(banlist);

                        // Log auto-ban (non-blocking)
                        setImmediate(async () => {
                            try {
                                const logChannel = await client.channels.fetch(AUTO_BAN_LOG_CHANNEL_ID).catch(() => null);
                                if (logChannel) {
                                    const bannedUser = await client.users.fetch(userId).catch(() => null);
                                    const displayName = bannedUser?.displayName || bannedUser?.username || 'Unknown';
                                    const autoBanLogEmbed = new EmbedBuilder()
                                        .setTitle('🤖 Auto-Ban: Spam/Auto-Click Detected')
                                        .setColor('#FF6600')
                                        .addFields(
                                            { name: '👤 User ID', value: `\`${userId}\``, inline: true },
                                            { name: '📛 Display Name', value: displayName, inline: true },
                                            { name: '📝 Reason', value: banReason, inline: false },
                                            { name: '📍 Room', value: message.channel?.name || 'Unknown', inline: true },
                                            { name: '🏠 Server', value: message.guild?.name || 'Unknown', inline: true }
                                        )
                                        .setTimestamp();
                                    await logChannel.send({ embeds: [autoBanLogEmbed] });
                                }
                            } catch (e) { /* Ignore */ }
                        });
                    }

                    const verify = labelButton('verify', 'Verify', ButtonStyle.Primary);
                    const allButton = oneButton(verify);
                    const mgs = await message.reply({
                        content: '`To verify you are human DM to Admin!` 🚫',
                        components: [allButton]
                    }).catch(() => null);

                    if (!mgs) return;

                    const collector = getCollectionButton(mgs, 60_000);
                    collector.on('collect', async (interaction) => {
                        try {
                            if (interaction.member.user.id !== userId) {
                                await interaction.reply({ content: 'This Button is not for you', ephemeral: true });
                                return;
                            }
                            if (interaction.customId === 'verify') {
                                verify.setDisabled(true);
                                banlist = banlist.filter(id => id !== userId);
                                await saveBanlistToFile(banlist);
                                await interaction.update({ content: `${sym} Verified! 🌻 ${sym}`, components: [allButton] }).catch(() => null);
                                collector.stop();
                            }
                        } catch (e) { /* Ignore */ }
                    });
                    return;
                }

                // ===== PARSE COMMAND =====
                const actualPrefix = lowerCaseMessageContent.startsWith(guildPrefix.toLowerCase()) ? guildPrefix : config.prefix;
                const raw = messageContent.slice(actualPrefix.length);
                const args = raw.trim().split(/ +/).filter(Boolean);
                let commandName = (args.shift() || '').toLowerCase();

                // ===== 🚀 FAST PATH FOR PING (NO DB CALLS) =====
                if (commandName === 'ping') {
                    const utility = getUtility.get('ping');
                    if (utility) {
                        utility.execute(client, message, args);
                        return; // Exit immediately, no further processing
                    }
                }

                // ===== GET CACHED USER DATA (SKIP FOR FAST COMMANDS) =====
                let userData = await getCachedUser(message.author.id);
                if (!userData) {
                    userData = new User({ userId: message.author.id, balance: 50000 });
                    try { await userData.save(); } catch (e) { /* Ignore */ }
                    userDataCache.set(message.author.id, { data: userData, timestamp: Date.now() });
                }

                // ===== NON-BLOCKING LEVELING/PREMIUM =====
                setImmediate(() => {
                    leveling(message);
                    prem(message);
                });

                // ===== SIMPLE JUMP LINK (NO INVITE CREATION) =====
                const jumpLink = `https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id}`;

                const adminLogChannelId = process.env.ADMIN_LOG_CHANNEL_ID || "1439118857154334801";
                const prefixLogChannelId = process.env.PREFIX_LOG_CHANNEL_ID || "1297919145438089328";

                // Check admin command
                const admin = getAdmin.get(commandName) || getAdmin.find?.(cmd => cmd.aliases?.includes(commandName));

                // ===== NON-BLOCKING LOGGING (Fire and forget) =====
                if (admin) {
                    logToChannelAsync(adminLogChannelId, `🛑 **Admin Command**\n**User:** ${message.author.tag}\n**Command:** ${commandName}\n**Jump:** ${jumpLink}`);
                }
                logToChannelAsync(prefixLogChannelId, `✅ ${message.author.tag} | ${commandName} | ${message.guild?.name}`);

                // ===== ADMIN COMMANDS =====
                const adminLockedCommands = ['leaveserver', 'nextday', 'clear', 'get', 'wish', 'del', 'grant', 'unequipe', 'dron', 'tr', 'blacklist', 'whitelist', 'wen', 'find', 'streak', 'remove_rune_forgotten'];
                if (adminLockedCommands.includes(commandName)) {
                    const adminCmd = getAdmin.get(commandName) || getAdmin.find?.(cmd => cmd.aliases?.includes(commandName));
                    if (!adminCmd) return;
                    const allowedIds = [process.env.devId, process.env.devId2, process.env.devId3, '1069079113261908008', '940949823505432616'].filter(Boolean);
                    if (allowedIds.includes(message.author.id)) {
                        adminCmd.execute(client, message, args);
                    }
                    return;
                }

                // ===== UTILITY =====
                if (['prem', 'premium', 'myid', 'ping', 'help', 'state', 'test', 'prefix', 'supporter', 'spp', 'policy'].includes(commandName)) {
                    if (commandName === 'spp') commandName = 'supporter';
                    if (commandName === 'prem') commandName = 'premium';
                    const utility = getUtility.get(commandName) || getUtility.find?.(cmd => cmd.aliases?.includes(commandName));
                    if (utility) utility.execute(client, message, args);
                    return;
                }

                // ===== ANIMAL/BATTLE =====
                const animalCommands = ['ah', 'autohunt', 'q', 'quest', 'br', 'rank', 'hunt', 'h', 'zoo', 'z', 'sell', 'inventory', 'i', 'use', 'lb', 'lootbox', 'tm', 'team', 'battle', 'b', 'weapon', 'w', 'crate', 'wc', 'dex', 'd', 'dismantle', 'dmt', 'bl', 'battlelog', 'log', 'battleOnline', 'bo', 'clan'];
                if (animalCommands.includes(commandName)) {
                    const aliasMap = { hunt: 'h', zoo: 'z', inventory: 'i', lb: 'lootbox', tm: 'team', battle: 'b', weapon: 'w', d: 'dex', wc: 'crate', dmt: 'dismantle', q: 'quest', ah: 'autohunt', bl: 'battlelog', log: 'battlelog', battleOnline: 'bo' };
                    if (aliasMap[commandName]) commandName = aliasMap[commandName];
                    const animal = getAnimal.get(commandName) || getAnimal.find?.(cmd => cmd.aliases?.includes(commandName));
                    if (animal) animal.execute(client, message, args);
                    return;
                }

                // ===== DRAGON =====
                if (['egg', 'fight', 'f', 'hold', 'item', 'upgrade', 'ug'].includes(commandName)) {
                    if (commandName === 'f') commandName = 'fight';
                    if (commandName === 'ug') commandName = 'upgrade';
                    const dragon = getDragon.get(commandName) || getDragon.find?.(cmd => cmd.aliases?.includes(commandName));
                    if (dragon) dragon.execute(client, message, args);
                    return;
                }

                // ===== RANK =====
                if (commandName === 'top') {
                    const rank = getRank.get(commandName) || getRank.find?.(cmd => cmd.aliases?.includes(commandName));
                    if (rank) rank.execute(client, message, args);
                    return;
                }

                // ===== GAMES =====
                const gameAliases = ['hm', 'ttt', 'c4', 'rps', 'trivia', 'connect4', 'rockpaperscissors', 'wordle', 'tictactoe', 'minesweeper', 'hangman', 'snake', 'sa', 'survival', 'race', 'bankrob', 'br', 'guess'];
                if (gameAliases.includes(commandName)) {
                    const gameMap = { br: 'bankrob', sa: 'survival', hm: 'hangman', ttt: 'tictactoe', c4: 'connect4', rps: 'rockpaperscissors' };
                    if (gameMap[commandName]) commandName = gameMap[commandName];
                    const game = getGame.get(commandName) || getGame.find?.(cmd => cmd.aliases?.includes(commandName));
                    if (game) game.execute(client, message, args);
                    return;
                }

                // ===== MINE =====
                if (['str', 'storage', 'buy', 'box', 'mine', 'm', 'tool', 'break', 'trade', 'transfer', 'tf'].includes(commandName)) {
                    const mineMap = { m: 'mine', transfer: 'tf', storage: 'str' };
                    if (mineMap[commandName]) commandName = mineMap[commandName];
                    const mine = getMine.get(commandName) || getMine.find?.(cmd => cmd.aliases?.includes(commandName));
                    if (mine) mine.execute(client, message, args);
                    return;
                }

                // ===== GIVEAWAY =====
                if (commandName === 'gstart') {
                    const giveaway = getGiveaway.get(commandName) || getGiveaway.find?.(cmd => cmd.aliases?.includes(commandName));
                    if (giveaway && [process.env.devId, '1069079113261908008', '940949823505432616'].includes(message.author.id)) {
                        giveaway.execute(client, message, args);
                    }
                    return;
                }

                // ===== SOCIAL =====
                if (['pf', 'profile', 'xp', 'level', 'lvl', 'avatar', 'background', 'bg'].includes(commandName)) {
                    const socialMap = { level: 'xp', lvl: 'xp', pf: 'profile', bg: 'background' };
                    if (socialMap[commandName]) commandName = socialMap[commandName];
                    const social = getSocial.get(commandName) || getSocial.find?.(cmd => cmd.aliases?.includes(commandName));
                    if (social) social.execute(client, message, args);
                    return;
                }

                // ===== ECONOMY =====
                if (['gold', 'cash', 'bal', 'give', 'pay', 'daily', 'shop', 'buygold', 'topup', 'recharge', 'purchasegold'].includes(commandName)) {
                    const econMap = { bal: 'cash', pay: 'give', topup: 'buygold', recharge: 'buygold', purchasegold: 'buygold' };
                    if (econMap[commandName]) commandName = econMap[commandName];
                    const economy = getEconomy.get(commandName) || getEconomy.find?.(cmd => cmd.aliases?.includes(commandName));
                    if (economy) economy.execute(client, message, args);
                    return;
                }

                // ===== GAMBLING =====
                if (['cup', 'lottery', 'cf', 'coin flip', 's', 'slot', 'bj', 'blackjack', 'kk', 'kla', 'pav', 'tl', 'tien len', 'pk', 'pokdeng'].includes(commandName)) {
                    const gamblingMap = { 'coin flip': 'cf', slot: 's', blackjack: 'bj', kla: 'kk', 'tien len': 'tl', pokdeng: 'pk' };
                    if (gamblingMap[commandName]) commandName = gamblingMap[commandName];
                    const gambling = getGambling.get(commandName) || getGambling.find?.(cmd => cmd.aliases?.includes(commandName));
                    if (gambling) gambling.execute(client, message, args);
                    return;
                }

                // ===== WORK =====
                if (['apply', 'resign', 'work', 'job', 'gowork'].includes(commandName)) {
                    const work = getWork.get(commandName) || getWork.find?.(cmd => cmd.aliases?.includes(commandName));
                    if (work) work.execute(client, message, args);
                    return;
                }

            } catch (err) {
                console.error('Error in messageCreate handler:', err);
            }
        });

        client.on('interactionCreate', async (interaction) => {
            try {
                if (interaction.isCommand()) {
                    const command = getSlashCommands.get(interaction.commandName);
                    if (command) {
                        await command.execute(interaction, client);
                    }
                }
            } catch (e) {
                console.error('interactionCreate error:', e);
            }
        });

    } catch (error) {
        console.log(`error detectMessage : ${error}`);
    }
}

function getGuildPrefix(guildId) {
    try {
        return config.prefixes?.[guildId] || config.prefix;
    } catch (e) {
        return config.prefix;
    }
}

// Cleanup caches periodically
setInterval(() => {
    const now = Date.now();
    // Cleanup user data cache
    userDataCache.forEach((value, key) => {
        if (now - value.timestamp > USER_CACHE_TTL * 2) {
            userDataCache.delete(key);
        }
    });
    // Cleanup message cache
    Object.keys(messageCache).forEach(userId => {
        messageCache[userId] = messageCache[userId].filter(msg => msg.timestamp > now - TIME_WINDOW);
        if (messageCache[userId].length === 0) delete messageCache[userId];
    });
    // Cleanup old user command times
    userFirstCommandTimes.forEach((time, id) => {
        if (now - time > TIMES) userFirstCommandTimes.delete(id);
    });
}, 60000);

module.exports = { detectMessage };
