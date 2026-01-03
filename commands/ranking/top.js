const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { SimpleEmbed, getUser, sym, cooldown } = require('../../functioon/function');
const mongoose = require('mongoose');
const { userSchema } = require('../../users/user');
const { Clan } = require('../../users/clan');
const User = mongoose.model('User', userSchema);

const cooldowns = new Map();
const CDT = 25000;
let getId = [], cdId = [], prem = [];

// Custom emojis
const emoji = {
    cash: '<:dollar:1438135127673798657>',
    gold: '<:gold:1438135130177671280>',
};

module.exports = {
    name: 'top',
    async execute(client, message) {

        const author = message.author;
        const userData = await getUser(author.id);

        // Premium bypass logic
        if (userData.premium.premium_bool && !prem.includes(author.id)) {
            prem.push(author.id);
        }
        if (cooldown(author.id, getId, cdId, CDT, message, cooldowns, prem)) return;

        // === Leaderboard config === //
        const config = {
            cash: {
                sort: { balance: -1 },
                title: "<:image:1444716492175311050> Top 15 Global Coins <:image:1444716492175311050>",
                get: u => `${emoji.cash} ${u.balance.toLocaleString()}`,
                userField: "balance",
                footerLabel: "Coins"
            },
            str: {
                pipeline: [
                    { $addFields: { maxStreak: { $max: ["$sat.team.streak", "$sat.team.streak_two"] } } },
                    { $sort: { maxStreak: -1 } },
                    { $limit: 15 }
                ],
                title: "⚔️ Top Battle Streak",
                get: u => `T1: ${u.sat.team.streak || 0} • T2: ${u.sat.team.streak_two || 0}`,
                sort: { "sat.team.streak": -1 },
                footerLabel: "Streak",
                footerValue: u => `T1: ${u.sat.team.streak || 0} • T2: ${u.sat.team.streak_two || 0}`
            },
            xp: {
                sort: { "levelSystem.xp": -1 },
                title: "📈 Top Levels",
                get: u => `Lvl ${u.levelSystem.level}`,
                userField: "levelSystem.xp",
                footerLabel: "Level",
                footerValue: u => `Lvl ${u.levelSystem.level}`
            },
            cmd: {
                sort: { command_point: -1 },
                title: "⌨️ Top Commands",
                get: u => `${u.command_point.toLocaleString()} commands`,
                userField: "command_point",
                footerLabel: "Commands",
                footerValue: u => `${u.command_point.toLocaleString()}`
            },
            elo: {
                sort: { elo: -1 },
                title: "⭐ Top Elo",
                get: u => `${u.elo.toLocaleString()} elo`,
                userField: "elo",
                footerLabel: "Elo",
                footerValue: u => `${u.elo.toLocaleString()}`
            },
            clan: {
                isClan: true,
                title: "🏰 Top Clans",
                footerLabel: "Clan"
            },
        };

        // === Cache for leaderboard data === //
        const cache = {};

        // === Fetch all leaderboards upfront === //
        async function preloadLeaderboards() {
            const promises = Object.keys(config).map(async type => {
                const c = config[type];
                let result;

                if (c.pipeline) {
                    result = await User.aggregate(c.pipeline);
                } else {
                    result = await User.find({}).sort(c.sort).limit(15).lean(); // .lean() for faster queries
                }

                cache[type] = result;
            });

            await Promise.all(promises);
        }

        // === Find user's rank globally === //
        async function getUserRank(type) {
            const c = config[type];

            // Skip for clan type
            if (c.isClan) return null;

            if (c.pipeline) {
                // For streak, check if user is in cached top 15
                const cachedList = cache[type];
                const index = cachedList.findIndex(u => u.userId === author.id);
                if (index >= 0) return index + 1;

                // If not in top 15, calculate full rank
                const allUsers = await User.aggregate([
                    { $addFields: { maxStreak: { $max: ["$sat.team.streak", "$sat.team.streak_two"] } } },
                    { $sort: { maxStreak: -1 } }
                ]);
                const fullIndex = allUsers.findIndex(u => u.userId === author.id);
                return fullIndex >= 0 ? fullIndex + 1 : "?";
            } else {
                // Check cached list first
                const cachedList = cache[type];
                const index = cachedList.findIndex(u => u.userId === author.id);
                if (index >= 0) return index + 1;

                // If not in top 15, do a count query (much faster)
                let sortQuery = c.sort || { [c.userField]: -1 };
                const sortField = Object.keys(sortQuery)[0];
                const userValue = userData[c.userField] || 0;

                const count = await User.countDocuments({ [sortField]: { $gt: userValue } });
                return count + 1;
            }
        }

        // === Generate leaderboard from cache === //
        async function loadLeaderboard(type) {
            const c = config[type];

            // Handle clan leaderboard separately
            if (c.isClan) {
                return await loadClanLeaderboard();
            }

            const result = cache[type];

            // Title with decorative emojis
            let text = `### ${c.title}\n\n`;
            let rank = 0;

            for (const u of result) {
                const name =
                    u.username ||
                    u.displayName ||
                    u.userName ||
                    u.name ||
                    `User_${u.userId?.slice(0, 6) || "???"}`;

                rank++;

                // Format: medal for top 3, #number for rest
                let prefix;
                if (rank === 1) {
                    prefix = "<:modal_1:1444714282120904775>";
                } else if (rank === 2) {
                    prefix = "<:modal_2:1444714279835140136>";
                } else if (rank === 3) {
                    prefix = "<:modal_3:1444714276945399928>";
                } else {
                    prefix = `**#${rank}**`;
                }

                // Arrow style format: prefix > name: value
                text += `${prefix} ➤ **${name}**: ${c.get(u)}\n`;
            }

            // === User footer === //
            const userRank = await getUserRank(type);

            // Get footer value based on type
            let footerValue;
            if (c.footerValue) {
                footerValue = c.footerValue(userData);
            } else if (c.footerLabel === "Coins") {
                footerValue = `${userData.balance.toLocaleString()}`;
            } else {
                footerValue = `${userData[c.userField]?.toLocaleString() || 0}`;
            }

            const footerText = `Your Rank: #${userRank} | Your ${c.footerLabel}: ${footerValue}`;

            const embed = SimpleEmbed(text);
            embed.setFooter({ text: footerText });

            return embed;
        }

        // === Load Clan Leaderboard === //
        async function loadClanLeaderboard() {
            // Get all clans and update their stats
            const allClans = await Clan.find({});

            // Update stats for all clans (only ELO)
            for (const clan of allClans) {
                let totalElo = 0;

                for (const memberId of clan.members) {
                    const memberData = await getUser(memberId);
                    totalElo += memberData.elo || 0;
                }

                clan.totalElo = totalElo;
                await clan.save();
            }

            // Sort by total ELO only
            const sortedClans = allClans.sort((a, b) => b.totalElo - a.totalElo);
            const topClans = sortedClans.slice(0, 15);

            let text = `### 🏰 Top 15 Global Clans 🏰\n\n`;
            let rank = 0;

            for (const clan of topClans) {
                rank++;

                // Format: medal for top 3, #number for rest
                let prefix;
                if (rank === 1) {
                    prefix = "<:modal_1:1444714282120904775>";
                } else if (rank === 2) {
                    prefix = "<:modal_2:1444714279835140136>";
                } else if (rank === 3) {
                    prefix = "<:modal_3:1444714276945399928>";
                } else {
                    prefix = `**#${rank}**`;
                }

                // Get clan emoji and verify badge
                const clanIcon = clan.clanEmoji || '';
                const verifyBadge = clan.isVerified ? ' <a:verify:1441629070726267041>' : '';

                // Arrow style format with clan icon and verify badge
                text += `${prefix} ➤ ${clanIcon} **${clan.clanName}**${verifyBadge} (${clan.members.length}/${clan.maxMembers}): **${clan.totalElo.toLocaleString()}** 👑\n`;
            }

            if (topClans.length === 0) {
                text += `\n*No clans exist yet! Create one with* ${sym}clan create${sym}`;
            }

            // Find user's clan
            let userClan = await Clan.findOne({ ownerId: author.id });
            if (!userClan) {
                userClan = await Clan.findOne({ members: { $in: [author.id] } });
            }

            let footerText = 'Your Rank: N/A | Your Clan: None';
            if (userClan) {
                const clanRank = sortedClans.findIndex(c => c.clanId === userClan.clanId) + 1;
                footerText = `Your Rank: #${clanRank || '?'} | Your Clan: ${userClan.clanName}`;
            }

            const embed = SimpleEmbed(text);
            embed.setFooter({ text: footerText });

            return embed;
        }

        // === Preload all leaderboards === //
        await preloadLeaderboards();

        // === Cute Select Menu === //
        const menu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId("top_select")
                .setPlaceholder("🌸 Choose Leaderboard")
                .addOptions([
                    { label: "Top Coins", value: "cash", emoji: "<:image:1444716492175311050>" },
                    { label: "Top Battle Streak", value: "str", emoji: "⚔️" },
                    { label: "Top Level", value: "xp", emoji: "📈" },
                    { label: "Top Commands", value: "cmd", emoji: "⌨️" },
                    { label: "Top Elo", value: "elo", emoji: "⭐" },
                    { label: "Top Clans", value: "clan", emoji: "🏰" },
                ])
        );

        // Default leaderboard
        const defaultEmbed = await loadLeaderboard("cash");

        const mainMsg = await message.channel.send({
            embeds: [defaultEmbed],
            components: [menu]
        });

        // Collector with better error handling
        const collector = mainMsg.createMessageComponentCollector({ time: 60000 });

        collector.on("collect", async interaction => {
            // Check if user is authorized
            if (interaction.user.id !== author.id) {
                return interaction.reply({
                    content: "❌ This leaderboard menu is not for you!",
                    ephemeral: true
                });
            }

            try {
                // Defer the update to prevent timeout
                await interaction.deferUpdate();

                const type = interaction.values[0];
                const embed = await loadLeaderboard(type);

                await interaction.editReply({
                    embeds: [embed],
                    components: [menu]
                });
            } catch (error) {
                console.error('Error updating leaderboard:', error);
                try {
                    await interaction.followUp({
                        content: "❌ An error occurred while updating the leaderboard.",
                        ephemeral: true
                    });
                } catch (e) {
                    console.error('Failed to send error message:', e);
                }
            }
        });

        collector.on("end", () => {
            // Disable menu after timeout
            menu.components[0].setDisabled(true);
            mainMsg.edit({ components: [menu] }).catch(() => { });
        });
    }
};