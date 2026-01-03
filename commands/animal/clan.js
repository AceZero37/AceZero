const { cooldown, customEmbed, gif, sym, SimpleEmbed, getUser, getRandomInt, VERIFY_ICON } = require('../../functioon/function');
const { StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
const { Clan } = require('../../users/clan');

const cooldowns = new Map();
let CDT = 5_000;
var getId = [];
var cdId = [];
var prem = [];

const CLAN_CREATE_COST = 10000000; // 10 million cash
const BOT_OWNER_ID = '741600112366583828'; // Bot owner for verify command

module.exports = {
    name: 'clan',
    async execute(client, message, args) {
        try {
            const user = message.author;
            const userData = await getUser(user.id);

            if (userData.premium.premium_bool) {
                if (!prem.includes(user.id)) {
                    prem.push(user.id);
                }
            }

            if (cooldown(user.id, getId, cdId, CDT, message, cooldowns, prem)) {
                return;
            };

            const subCommand = args[0]?.toLowerCase();

            // ==================== NO ARGS - Show clan info or help ====================
            if (!subCommand) {
                // First check if user is in a clan
                let userClan = await Clan.findOne({ ownerId: user.id });
                if (!userClan) {
                    userClan = await Clan.findOne({ members: { $in: [user.id] } });
                }

                if (userClan) {
                    // User is in a clan - show their clan info
                    // Calculate total elo and build member data with ELO
                    let totalElo = 0;
                    let memberDataList = [];

                    for (const memberId of userClan.members) {
                        const memberData = await getUser(memberId);
                        const elo = memberData.elo || 0;
                        totalElo += elo;
                        memberDataList.push({
                            id: memberId,
                            elo: elo,
                            isOwner: memberId === userClan.ownerId
                        });
                    }

                    // Sort members: Owner always #1, then sort by ELO (highest first)
                    memberDataList.sort((a, b) => {
                        if (a.isOwner) return -1;
                        if (b.isOwner) return 1;
                        return b.elo - a.elo;
                    });

                    // Build member list with ranking
                    let memberList = memberDataList.map((member, index) => {
                        const rank = index + 1;
                        const rankDisplay = member.isOwner ? '👑' : `**#${rank}**`;
                        return `${rankDisplay} <@${member.id}> - ${member.elo.toLocaleString()} ELO`;
                    });

                    // Update clan stats
                    userClan.totalElo = totalElo;
                    await userClan.save();

                    const verifyBadge = userClan.isVerified ? ` ${VERIFY_ICON}` : '';

                    const embed = customEmbed()
                        .setTitle(`🏰 ${userClan.clanName}${verifyBadge}`)
                        .setColor(userClan.isVerified ? '#00FF00' : 'Gold')
                        .setDescription(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 **CLAN INFO**
🆔 **Clan ID:** ${sym}${userClan.clanId}${sym}
👑 **Owner:** <@${userClan.ownerId}>
👥 **Members:** ${userClan.members.length}/${userClan.maxMembers}
📝 **Description:** ${userClan.description}
${userClan.isVerified ? `✅ **Verified Clan** ${VERIFY_ICON}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 **CLAN STATS**
⚔️ **Total ELO:** ${totalElo.toLocaleString()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
👥 **MEMBERS (Ranked by ELO)**
${memberList.slice(0, 10).join('\n')}
${userClan.members.length > 10 ? `\n...and ${userClan.members.length - 10} more` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 **Created:** ${userClan.createdAt.toLocaleDateString()}
                        `)
                        .setFooter({ text: `Clan: ${userClan.clanName}`, iconURL: user.displayAvatarURL() })
                        .setTimestamp();

                    // Add clan logo as thumbnail if set
                    if (userClan.logo) {
                        embed.setThumbnail(userClan.logo);
                    }

                    return message.channel.send({ embeds: [embed] });
                }

                // User not in a clan - show help
                const helpEmbed = customEmbed()
                    .setTitle('🏰 Clan Commands')
                    .setColor('Gold')
                    .setDescription(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 **CLAN MANAGEMENT**
${sym}clan create {name}${sym} - Create a clan (${gif.cash} ${CLAN_CREATE_COST.toLocaleString()})
${sym}clan${sym} - View your clan info
${sym}clan {clanName}${sym} - View a clan's info

━━━━━━━━━━━━━━━━━━━━━━━━━━━
👥 **MEMBERS**
${sym}clan add @user${sym} - Invite a member (Owner only)
${sym}clan kick @user${sym} - Kick a member (Owner only)
${sym}clan leave${sym} - Leave your clan
${sym}clan transfer @user${sym} - Transfer ownership (Owner only)

━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 **LEADERBOARD**
${sym}clan top${sym} - View top clans leaderboard

━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚙️ **SETTINGS**
${sym}clan desc {description}${sym} - Set clan description (Owner only)
${sym}clan logo${sym} - Set clan logo (Owner only, attach image)
${sym}clan emoji :emoji:${sym} - Set clan icon emoji (Owner only)
                    `)
                    .setFooter({ text: 'Clan System v1.0', iconURL: user.displayAvatarURL() })
                    .setTimestamp();

                return message.channel.send({ embeds: [helpEmbed] });
            }


            // ==================== CREATE CLAN ====================
            if (subCommand === 'create') {
                // Name is all arguments after 'create', can have spaces
                if (args.length < 2) {
                    return message.reply({ embeds: [SimpleEmbed(`**<@${user.id}>**, invalid syntax! Use: ${sym}clan create {name}${sym}\nExample: ${sym}clan create My Cool Clan${sym}`)] });
                }

                const clanName = args.slice(1).join(' ');

                if (!clanName) {
                    return message.reply({ embeds: [SimpleEmbed(`**<@${user.id}>**, please provide a clan name!`)] });
                }

                if (clanName.length > 30) {
                    return message.reply({ embeds: [SimpleEmbed(`**<@${user.id}>**, clan name must be 30 characters or less!`)] });
                }

                // Check if user already has a clan
                let existingClan = await Clan.findOne({ ownerId: user.id });
                if (!existingClan) {
                    existingClan = await Clan.findOne({ members: { $in: [user.id] } });
                }

                if (existingClan) {
                    return message.reply({ embeds: [SimpleEmbed(`**<@${user.id}>**, you are already in a clan! Leave first with ${sym}clan leave${sym}`)] });
                }

                // Check if clan name already exists
                const nameExists = await Clan.findOne({ clanName: { $regex: new RegExp(`^${clanName}$`, 'i') } });
                if (nameExists) {
                    return message.reply({ embeds: [SimpleEmbed(`**<@${user.id}>**, a clan with that name already exists!`)] });
                }

                // Check if user has enough cash
                if (userData.balance < CLAN_CREATE_COST) {
                    return message.reply({ embeds: [SimpleEmbed(`**<@${user.id}>**, you need ${gif.cash} **${CLAN_CREATE_COST.toLocaleString()}** to create a clan! You have ${gif.cash} **${userData.balance.toLocaleString()}**`)] });
                }

                // Deduct cost and create clan
                userData.balance -= CLAN_CREATE_COST;
                await userData.save();

                const clanId = `CLAN_${Date.now()}_${getRandomInt(1000, 9999)}`;
                const newClan = new Clan({
                    clanId: clanId,
                    clanName: clanName,
                    ownerId: user.id,
                    ownerName: user.displayName,
                    members: [user.id],
                    totalPoints: userData.command_point || 0,
                    totalElo: userData.elo || 0
                });

                await newClan.save();

                const embed = customEmbed()
                    .setTitle('🏰 Clan Created!')
                    .setColor('Green')
                    .setDescription(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏷️ **Clan Name:** ${clanName}
👑 **Owner:** <@${user.id}>
👥 **Members:** 1/20

━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 **Cost:** ${gif.cash} -${CLAN_CREATE_COST.toLocaleString()}
🎉 Congratulations on your new clan!
                    `)
                    .setFooter({ text: `Clan ID: ${clanId}`, iconURL: user.displayAvatarURL() })
                    .setTimestamp();

                return message.channel.send({ embeds: [embed] });
            }

            // ==================== CLAN INFO (or just !clan / !clan {name}) ====================
            // Also handle: !clan (shows your clan), !clan {name} (searches by name)
            if (subCommand === 'info' || !['create', 'add', 'invite', 'accept', 'decline', 'leave', 'kick', 'transfer', 'desc', 'description', 'top', 'leaderboard', 'lb', 'verify', 'delete', 'logo', 'emoji', 'icon'].includes(subCommand)) {
                let searchName;

                if (subCommand === 'info') {
                    searchName = args.slice(1).join(' '); // !clan info {name}
                } else if (subCommand) {
                    searchName = args.join(' '); // !clan {name} - treat subCommand as part of the name
                    if (searchName) {
                        searchName = subCommand + (args.length > 0 ? ' ' + args.join(' ') : '');
                    } else {
                        searchName = subCommand;
                    }
                }

                let clan;

                if (searchName) {
                    // Search by name (case insensitive)
                    clan = await Clan.findOne({ clanName: { $regex: new RegExp(`^${searchName}$`, 'i') } });
                } else {
                    // First check if user is owner
                    clan = await Clan.findOne({ ownerId: user.id });

                    // If not owner, check if user is in members array
                    if (!clan) {
                        clan = await Clan.findOne({ members: { $in: [user.id] } });
                    }
                }

                if (!clan) {
                    if (searchName) {
                        return message.reply({ embeds: [SimpleEmbed(`**<@${user.id}>**, no clan found with name **${searchName}**!`)] });
                    }
                    // Show help if no clan found and no search name
                    const helpEmbed = customEmbed()
                        .setTitle('🏰 Clan Commands')
                        .setColor('Gold')
                        .setDescription(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 **CLAN MANAGEMENT**
${sym}clan create {name}${sym} - Create a clan (${gif.cash} ${CLAN_CREATE_COST.toLocaleString()})
${sym}clan${sym} - View your clan info
${sym}clan {clanName}${sym} - View a clan's info

━━━━━━━━━━━━━━━━━━━━━━━━━━━
👥 **MEMBERS**
${sym}clan add @user${sym} - Invite a member (Owner only)
${sym}clan kick @user${sym} - Kick a member (Owner only)
${sym}clan leave${sym} - Leave your clan
${sym}clan transfer @user${sym} - Transfer ownership (Owner only)

━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 **LEADERBOARD**
${sym}clan top${sym} - View top clans leaderboard

━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚙️ **SETTINGS**
${sym}clan desc {description}${sym} - Set clan description (Owner only)
${sym}clan logo${sym} - Set clan logo (Owner only, attach image)
${sym}clan emoji :emoji:${sym} - Set clan icon emoji (Owner only)
                        `)
                        .setFooter({ text: 'Clan System v1.0', iconURL: user.displayAvatarURL() })
                        .setTimestamp();

                    return message.channel.send({ embeds: [helpEmbed] });
                }

                // Calculate total elo and build member data with ELO
                let totalElo = 0;
                let memberDataList = [];

                for (const memberId of clan.members) {
                    const memberData = await getUser(memberId);
                    const elo = memberData.elo || 0;
                    totalElo += elo;
                    memberDataList.push({
                        id: memberId,
                        elo: elo,
                        isOwner: memberId === clan.ownerId
                    });
                }

                // Sort members: Owner always #1, then sort by ELO (highest first)
                memberDataList.sort((a, b) => {
                    if (a.isOwner) return -1; // Owner always first
                    if (b.isOwner) return 1;
                    return b.elo - a.elo; // Sort by ELO descending
                });

                // Build member list with ranking
                let memberList = memberDataList.map((member, index) => {
                    const rank = index + 1;
                    const rankDisplay = member.isOwner ? '👑' : `**#${rank}**`;
                    return `${rankDisplay} <@${member.id}> - ${member.elo.toLocaleString()} ELO`;
                });

                // Update clan stats
                clan.totalElo = totalElo;
                await clan.save();

                const verifyBadge = clan.isVerified ? ` ${VERIFY_ICON}` : '';

                const embed = customEmbed()
                    .setTitle(`🏰 ${clan.clanName}${verifyBadge}`)
                    .setColor(clan.isVerified ? '#00FF00' : 'Gold')
                    .setDescription(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 **CLAN INFO**
🆔 **Clan ID:** ${sym}${clan.clanId}${sym}
👑 **Owner:** <@${clan.ownerId}>
👥 **Members:** ${clan.members.length}/${clan.maxMembers}
📝 **Description:** ${clan.description}
${clan.isVerified ? `✅ **Verified Clan** ${VERIFY_ICON}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 **CLAN STATS**
⚔️ **Total ELO:** ${totalElo.toLocaleString()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
👥 **MEMBERS (Ranked by ELO)**
${memberList.slice(0, 10).join('\n')}
${clan.members.length > 10 ? `\n...and ${clan.members.length - 10} more` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 **Created:** ${clan.createdAt.toLocaleDateString()}
                    `)
                    .setFooter({ text: `Clan: ${clan.clanName}`, iconURL: user.displayAvatarURL() })
                    .setTimestamp();

                // Add clan logo as thumbnail if set
                if (clan.logo) {
                    embed.setThumbnail(clan.logo);
                }

                return message.channel.send({ embeds: [embed] });
            }


            // ==================== ADD MEMBER ====================
            if (subCommand === 'add' || subCommand === 'invite') {
                const { ButtonBuilder, ButtonStyle, ActionRowBuilder: ButtonRowBuilder } = require('discord.js');

                const targetUser = message.mentions.users.first();

                if (!targetUser) {
                    return message.reply({ embeds: [SimpleEmbed(`**<@${user.id}>**, please mention a user to invite! ${sym}clan add @user${sym}`)] });
                }

                if (targetUser.bot) {
                    return message.reply({ embeds: [SimpleEmbed(`**<@${user.id}>**, you cannot invite a bot to your clan!`)] });
                }

                const clan = await Clan.findOne({ ownerId: user.id });

                if (!clan) {
                    return message.reply({ embeds: [SimpleEmbed(`**<@${user.id}>**, you must be a clan owner to invite members!`)] });
                }

                if (clan.members.includes(targetUser.id)) {
                    return message.reply({ embeds: [SimpleEmbed(`**<@${user.id}>**, that user is already in your clan!`)] });
                }

                if (clan.members.length >= clan.maxMembers) {
                    return message.reply({ embeds: [SimpleEmbed(`**<@${user.id}>**, your clan is full! (${clan.members.length}/${clan.maxMembers})`)] });
                }

                // Check if target is in another clan
                let targetClan = await Clan.findOne({ ownerId: targetUser.id });
                if (!targetClan) {
                    targetClan = await Clan.findOne({ members: { $in: [targetUser.id] } });
                }

                if (targetClan) {
                    return message.reply({ embeds: [SimpleEmbed(`**<@${user.id}>**, that user is already in another clan!`)] });
                }

                // Add to pending invites
                if (!clan.pendingInvites.includes(targetUser.id)) {
                    clan.pendingInvites.push(targetUser.id);
                    await clan.save();
                }

                // Create Accept/Decline buttons
                const acceptButton = new ButtonBuilder()
                    .setCustomId(`clan_accept_${clan.clanId}_${user.id}`)
                    .setLabel('✅ Accept')
                    .setStyle(ButtonStyle.Success);

                const declineButton = new ButtonBuilder()
                    .setCustomId(`clan_decline_${clan.clanId}_${user.id}`)
                    .setLabel('❌ Decline')
                    .setStyle(ButtonStyle.Danger);

                const buttonRow = new ButtonRowBuilder().addComponents(acceptButton, declineButton);

                // Create DM embed for invited user
                const dmEmbed = customEmbed()
                    .setTitle('📨 Clan Invitation!')
                    .setColor('Blue')
                    .setDescription(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏰 **Clan:** ${clan.clanName}
👑 **Owner:** ${user.displayName} (<@${user.id}>)
👥 **Members:** ${clan.members.length}/${clan.maxMembers}
📝 **Description:** ${clan.description}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
You have been invited to join this clan!
Click **Accept** to join or **Decline** to refuse.
                    `)
                    .setFooter({ text: 'This invitation expires in 5 minutes', iconURL: user.displayAvatarURL() })
                    .setTimestamp();

                // Try to send DM to target user
                try {
                    const dmMessage = await targetUser.send({ embeds: [dmEmbed], components: [buttonRow] });

                    // Confirmation in channel
                    const channelEmbed = customEmbed()
                        .setTitle('📨 Clan Invite Sent!')
                        .setColor('Blue')
                        .setDescription(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━
📬 **Invited:** <@${targetUser.id}>
🏰 **Clan:** ${clan.clanName}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ A DM has been sent to <@${targetUser.id}> with Accept/Decline buttons!
You will receive a DM when they respond.
                        `)
                        .setFooter({ text: 'Invite expires in 5 minutes', iconURL: user.displayAvatarURL() })
                        .setTimestamp();

                    await message.channel.send({ embeds: [channelEmbed] });

                    // Create button collector for DM
                    const collector = dmMessage.createMessageComponentCollector({
                        time: 300000 // 5 minutes
                    });

                    collector.on('collect', async (interaction) => {
                        try {
                            // Re-fetch clan to ensure latest data
                            const currentClan = await Clan.findOne({ clanId: clan.clanId });

                            if (!currentClan) {
                                await interaction.update({
                                    embeds: [customEmbed().setTitle('❌ Error').setColor('Red').setDescription('This clan no longer exists!')],
                                    components: []
                                });
                                return;
                            }

                            if (interaction.customId.startsWith('clan_accept_')) {
                                // Check if still has pending invite
                                if (!currentClan.pendingInvites.includes(targetUser.id)) {
                                    await interaction.update({
                                        embeds: [customEmbed().setTitle('❌ Invite Expired').setColor('Red').setDescription('This invite is no longer valid!')],
                                        components: []
                                    });
                                    return;
                                }

                                // Check if already in another clan
                                let existingClan = await Clan.findOne({ ownerId: targetUser.id });
                                if (!existingClan) {
                                    existingClan = await Clan.findOne({ members: { $in: [targetUser.id] } });
                                }

                                if (existingClan) {
                                    await interaction.update({
                                        embeds: [customEmbed().setTitle('❌ Already in Clan').setColor('Red').setDescription('You are already in a clan!')],
                                        components: []
                                    });
                                    return;
                                }

                                // Add to clan
                                const targetData = await getUser(targetUser.id);
                                currentClan.members.push(targetUser.id);
                                currentClan.pendingInvites = currentClan.pendingInvites.filter(id => id !== targetUser.id);
                                currentClan.totalPoints += targetData.command_point || 0;
                                currentClan.totalElo += targetData.elo || 0;
                                await currentClan.save();

                                // Update DM to show accepted
                                const acceptedEmbed = customEmbed()
                                    .setTitle('🎉 Joined Clan!')
                                    .setColor('Green')
                                    .setDescription(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ You have joined **${currentClan.clanName}**!
👥 **Members:** ${currentClan.members.length}/${currentClan.maxMembers}
⚔️ **Clan ELO:** ${currentClan.totalElo.toLocaleString()}

Welcome to the clan! 🎊
                                    `)
                                    .setTimestamp();

                                await interaction.update({ embeds: [acceptedEmbed], components: [] });

                                // DM the owner about acceptance
                                try {
                                    const owner = await client.users.fetch(user.id);
                                    const ownerNotifyEmbed = customEmbed()
                                        .setTitle('✅ Invite Accepted!')
                                        .setColor('Green')
                                        .setDescription(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 **${targetUser.displayName}** (<@${targetUser.id}>) has joined your clan!

🏰 **Clan:** ${currentClan.clanName}
👥 **Members:** ${currentClan.members.length}/${currentClan.maxMembers}
                                        `)
                                        .setTimestamp();

                                    await owner.send({ embeds: [ownerNotifyEmbed] });
                                } catch (ownerDmError) {
                                    console.log('Could not DM owner about acceptance:', ownerDmError.message);
                                }

                            } else if (interaction.customId.startsWith('clan_decline_')) {
                                // Remove from pending invites
                                currentClan.pendingInvites = currentClan.pendingInvites.filter(id => id !== targetUser.id);
                                await currentClan.save();

                                // Update DM to show declined
                                const declinedEmbed = customEmbed()
                                    .setTitle('❌ Invite Declined')
                                    .setColor('Red')
                                    .setDescription(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━
You have declined the invite from **${currentClan.clanName}**.
                                    `)
                                    .setTimestamp();

                                await interaction.update({ embeds: [declinedEmbed], components: [] });

                                // DM the owner about decline
                                try {
                                    const owner = await client.users.fetch(user.id);
                                    const ownerNotifyEmbed = customEmbed()
                                        .setTitle('❌ Invite Declined')
                                        .setColor('Red')
                                        .setDescription(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━
😔 **${targetUser.displayName}** (<@${targetUser.id}>) has declined your clan invite.

🏰 **Clan:** ${currentClan.clanName}
                                        `)
                                        .setTimestamp();

                                    await owner.send({ embeds: [ownerNotifyEmbed] });
                                } catch (ownerDmError) {
                                    console.log('Could not DM owner about decline:', ownerDmError.message);
                                }
                            }

                            collector.stop();
                        } catch (collectError) {
                            console.log('Clan invite collector error:', collectError);
                        }
                    });

                    collector.on('end', async (collected, reason) => {
                        if (reason === 'time' && collected.size === 0) {
                            // Remove from pending invites when expired
                            try {
                                const expiredClan = await Clan.findOne({ clanId: clan.clanId });
                                if (expiredClan) {
                                    expiredClan.pendingInvites = expiredClan.pendingInvites.filter(id => id !== targetUser.id);
                                    await expiredClan.save();
                                }

                                // Update DM to show expired
                                await dmMessage.edit({
                                    embeds: [customEmbed().setTitle('⏰ Invite Expired').setColor('Grey').setDescription(`The invite from **${clan.clanName}** has expired.`)],
                                    components: []
                                }).catch(() => { });

                                // Notify owner about expiration
                                try {
                                    const owner = await client.users.fetch(user.id);
                                    await owner.send({
                                        embeds: [customEmbed()
                                            .setTitle('⏰ Invite Expired')
                                            .setColor('Grey')
                                            .setDescription(`Your invite to **${targetUser.displayName}** (<@${targetUser.id}>) for clan **${clan.clanName}** has expired.`)
                                            .setTimestamp()]
                                    });
                                } catch (e) { }
                            } catch (e) {
                                console.log('Error handling expired invite:', e);
                            }
                        }
                    });

                } catch (dmError) {
                    // Cannot DM target user
                    return message.reply({ embeds: [SimpleEmbed(`**<@${user.id}>**, could not send DM to <@${targetUser.id}>! They may have DMs disabled. Ask them to use ${sym}clan accept${sym} in a server instead.`)] });
                }

                return;
            }


            // ==================== ACCEPT INVITE ====================
            if (subCommand === 'accept') {
                // Find clan with pending invite for this user
                const clan = await Clan.findOne({ pendingInvites: user.id });

                if (!clan) {
                    return message.reply({ embeds: [SimpleEmbed(`**<@${user.id}>**, you have no pending clan invites!`)] });
                }

                // Check if already in another clan
                let existingClan = await Clan.findOne({ ownerId: user.id });
                if (!existingClan) {
                    existingClan = await Clan.findOne({ members: { $in: [user.id] } });
                }

                if (existingClan) {
                    return message.reply({ embeds: [SimpleEmbed(`**<@${user.id}>**, you are already in a clan!`)] });
                }

                // Add to clan
                clan.members.push(user.id);
                clan.pendingInvites = clan.pendingInvites.filter(id => id !== user.id);

                // Update clan stats
                clan.totalPoints += userData.command_point || 0;
                clan.totalElo += userData.elo || 0;
                await clan.save();

                const embed = customEmbed()
                    .setTitle('🎉 Joined Clan!')
                    .setColor('Green')
                    .setDescription(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ <@${user.id}> joined **${clan.clanName}**!
👥 **Members:** ${clan.members.length}/${clan.maxMembers}
⚔️ **Clan ELO:** ${clan.totalElo.toLocaleString()}
                    `)
                    .setFooter({ text: 'Welcome to the clan!', iconURL: user.displayAvatarURL() })
                    .setTimestamp();

                return message.channel.send({ embeds: [embed] });
            }

            // ==================== DECLINE INVITE ====================
            if (subCommand === 'decline') {
                const clan = await Clan.findOne({ pendingInvites: user.id });

                if (!clan) {
                    return message.reply({ embeds: [SimpleEmbed(`**<@${user.id}>**, you have no pending clan invites!`)] });
                }

                clan.pendingInvites = clan.pendingInvites.filter(id => id !== user.id);
                await clan.save();

                return message.reply({ embeds: [SimpleEmbed(`**<@${user.id}>**, you declined the invite from **${clan.clanName}**!`)] });
            }

            // ==================== LEAVE CLAN ====================
            if (subCommand === 'leave') {
                const clan = await Clan.findOne({ members: { $in: [user.id] } });

                if (!clan) {
                    return message.reply({ embeds: [SimpleEmbed(`**<@${user.id}>**, you are not in a clan!`)] });
                }

                if (clan.ownerId === user.id) {
                    if (clan.members.length > 1) {
                        return message.reply({ embeds: [SimpleEmbed(`**<@${user.id}>**, you must transfer ownership first with ${sym}clan transfer @user${sym} or kick all members!`)] });
                    }
                    // If owner and only member, delete clan
                    await Clan.deleteOne({ clanId: clan.clanId });
                    return message.reply({ embeds: [SimpleEmbed(`**<@${user.id}>**, your clan **${clan.clanName}** has been disbanded!`)] });
                }

                // Remove from clan
                clan.members = clan.members.filter(id => id !== user.id);
                clan.totalPoints -= userData.command_point || 0;
                clan.totalElo -= userData.elo || 0;
                await clan.save();

                return message.reply({ embeds: [SimpleEmbed(`**<@${user.id}>**, you left **${clan.clanName}**!`)] });
            }

            // ==================== KICK MEMBER ====================
            if (subCommand === 'kick') {
                const targetUser = message.mentions.users.first();

                if (!targetUser) {
                    return message.reply({ embeds: [SimpleEmbed(`**<@${user.id}>**, please mention a user to kick! ${sym}clan kick @user${sym}`)] });
                }

                const clan = await Clan.findOne({ ownerId: user.id });

                if (!clan) {
                    return message.reply({ embeds: [SimpleEmbed(`**<@${user.id}>**, you must be a clan owner to kick members!`)] });
                }

                if (targetUser.id === user.id) {
                    return message.reply({ embeds: [SimpleEmbed(`**<@${user.id}>**, you cannot kick yourself! Use ${sym}clan leave${sym}`)] });
                }

                if (!clan.members.includes(targetUser.id)) {
                    return message.reply({ embeds: [SimpleEmbed(`**<@${user.id}>**, that user is not in your clan!`)] });
                }

                // Remove from clan
                const targetData = await getUser(targetUser.id);
                clan.members = clan.members.filter(id => id !== targetUser.id);
                clan.totalPoints -= targetData.command_point || 0;
                clan.totalElo -= targetData.elo || 0;
                await clan.save();

                return message.reply({ embeds: [SimpleEmbed(`**<@${user.id}>**, kicked <@${targetUser.id}> from **${clan.clanName}**!`)] });
            }

            // ==================== TRANSFER OWNERSHIP ====================
            if (subCommand === 'transfer') {
                const targetUser = message.mentions.users.first();

                if (!targetUser) {
                    return message.reply({ embeds: [SimpleEmbed(`**<@${user.id}>**, please mention a user to transfer ownership to! ${sym}clan transfer @user${sym}`)] });
                }

                const clan = await Clan.findOne({ ownerId: user.id });

                if (!clan) {
                    return message.reply({ embeds: [SimpleEmbed(`**<@${user.id}>**, you must be a clan owner to transfer ownership!`)] });
                }

                if (targetUser.id === user.id) {
                    return message.reply({ embeds: [SimpleEmbed(`**<@${user.id}>**, you already own this clan!`)] });
                }

                if (!clan.members.includes(targetUser.id)) {
                    return message.reply({ embeds: [SimpleEmbed(`**<@${user.id}>**, that user must be a clan member first!`)] });
                }

                // Transfer ownership
                clan.ownerId = targetUser.id;
                clan.ownerName = targetUser.displayName;
                await clan.save();

                const embed = customEmbed()
                    .setTitle('👑 Ownership Transferred!')
                    .setColor('Purple')
                    .setDescription(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏰 **Clan:** ${clan.clanName}
👑 **New Owner:** <@${targetUser.id}>
📤 **Former Owner:** <@${user.id}>
                    `)
                    .setFooter({ text: 'Ownership has been transferred', iconURL: user.displayAvatarURL() })
                    .setTimestamp();

                return message.channel.send({ embeds: [embed] });
            }

            // ==================== SET DESCRIPTION ====================
            if (subCommand === 'desc' || subCommand === 'description') {
                const description = args.slice(1).join(' ');

                if (!description) {
                    return message.reply({ embeds: [SimpleEmbed(`**<@${user.id}>**, please provide a description! ${sym}clan desc {description}${sym}`)] });
                }

                if (description.length > 200) {
                    return message.reply({ embeds: [SimpleEmbed(`**<@${user.id}>**, description must be 200 characters or less!`)] });
                }

                const clan = await Clan.findOne({ ownerId: user.id });

                if (!clan) {
                    return message.reply({ embeds: [SimpleEmbed(`**<@${user.id}>**, you must be a clan owner to change the description!`)] });
                }

                clan.description = description;
                await clan.save();

                return message.reply({ embeds: [SimpleEmbed(`**<@${user.id}>**, clan description updated to: "${description}"`)] });
            }

            // ==================== SET LOGO ====================
            if (subCommand === 'logo') {
                const clan = await Clan.findOne({ ownerId: user.id });

                if (!clan) {
                    return message.reply({ embeds: [SimpleEmbed(`**<@${user.id}>**, you must be a clan owner to set the logo!`)] });
                }

                // Check for attached image
                const attachment = message.attachments.first();

                // Also check for URL in args
                const urlArg = args[1];

                if (!attachment && !urlArg) {
                    // Show current logo or instructions
                    if (clan.logo) {
                        const embed = customEmbed()
                            .setTitle('🖼️ Current Clan Logo')
                            .setColor('Blue')
                            .setDescription(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏰 **Clan:** ${clan.clanName}

To change the logo:
• Upload an image with ${sym}clan logo${sym}
• Or provide a URL: ${sym}clan logo {url}${sym}

To remove the logo:
• Use ${sym}clan logo remove${sym}
                            `)
                            .setThumbnail(clan.logo)
                            .setFooter({ text: 'Clan Logo', iconURL: user.displayAvatarURL() })
                            .setTimestamp();
                        return message.channel.send({ embeds: [embed] });
                    } else {
                        return message.reply({ embeds: [SimpleEmbed(`**<@${user.id}>**, please attach an image or provide a URL!\n\n• Upload image: ${sym}clan logo${sym} + attach image\n• URL: ${sym}clan logo {image_url}${sym}`)] });
                    }
                }

                // Check for remove command
                if (urlArg === 'remove' || urlArg === 'delete' || urlArg === 'clear') {
                    clan.logo = '';
                    await clan.save();
                    return message.reply({ embeds: [SimpleEmbed(`**<@${user.id}>**, clan logo has been removed!`)] });
                }

                // Get image URL from attachment or args
                let logoUrl = '';

                if (attachment) {
                    // Validate it's an image
                    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
                    if (!attachment.contentType || !validTypes.includes(attachment.contentType)) {
                        return message.reply({ embeds: [SimpleEmbed(`**<@${user.id}>**, please upload a valid image (PNG, JPG, GIF, WEBP)!`)] });
                    }
                    logoUrl = attachment.url;
                } else if (urlArg) {
                    // Basic URL validation
                    if (!urlArg.startsWith('http://') && !urlArg.startsWith('https://')) {
                        return message.reply({ embeds: [SimpleEmbed(`**<@${user.id}>**, please provide a valid image URL!`)] });
                    }
                    logoUrl = urlArg;
                }

                // Save logo
                clan.logo = logoUrl;
                await clan.save();

                const embed = customEmbed()
                    .setTitle('🖼️ Clan Logo Updated!')
                    .setColor('Green')
                    .setDescription(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Logo has been set for **${clan.clanName}**!
                    `)
                    .setThumbnail(logoUrl)
                    .setFooter({ text: 'Clan Logo', iconURL: user.displayAvatarURL() })
                    .setTimestamp();

                return message.channel.send({ embeds: [embed] });
            }

            // ==================== SET EMOJI ====================
            if (subCommand === 'emoji' || subCommand === 'icon') {
                const clan = await Clan.findOne({ ownerId: user.id });

                if (!clan) {
                    return message.reply({ embeds: [SimpleEmbed(`**<@${user.id}>**, you must be a clan owner to set the emoji!`)] });
                }

                const emojiArg = args[1];

                if (!emojiArg) {
                    // Show current emoji or instructions
                    if (clan.clanEmoji) {
                        const embed = customEmbed()
                            .setTitle('🎭 Current Clan Emoji')
                            .setColor('Blue')
                            .setDescription(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏰 **Clan:** ${clan.clanName}
🎭 **Current Emoji:** ${clan.clanEmoji}

**Preview:** ${clan.clanEmoji} ${clan.clanName}${clan.isVerified ? ` ${VERIFY_ICON}` : ''}

To change: ${sym}clan emoji :your_emoji:${sym}
To remove: ${sym}clan emoji remove${sym}
                            `)
                            .setFooter({ text: 'Clan Emoji', iconURL: user.displayAvatarURL() })
                            .setTimestamp();
                        return message.channel.send({ embeds: [embed] });
                    } else {
                        return message.reply({ embeds: [SimpleEmbed(`**<@${user.id}>**, please provide an emoji!\n\nUsage: ${sym}clan emoji :your_emoji:${sym}\n\n**Supports:** Custom Discord emojis or unicode emojis (🎮, 🐉, ✨, etc.)`)] });
                    }
                }

                // Check for remove command
                if (emojiArg === 'remove' || emojiArg === 'delete' || emojiArg === 'clear') {
                    clan.clanEmoji = '';
                    await clan.save();
                    return message.reply({ embeds: [SimpleEmbed(`**<@${user.id}>**, clan emoji has been removed!`)] });
                }

                // Validate emoji - accept custom Discord emojis OR unicode emojis
                // Custom Discord emoji: <:name:id> or <a:name:id>
                // Unicode emoji: any emoji characters
                const discordEmojiRegex = /^<a?:\w+:\d+>$/;
                const unicodeEmojiRegex = /^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}\u{1F100}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{231A}-\u{231B}\u{23E9}-\u{23F3}\u{23F8}-\u{23FA}\u{25AA}-\u{25AB}\u{25B6}\u{25C0}\u{25FB}-\u{25FE}\u{2614}-\u{2615}\u{2648}-\u{2653}\u{267F}\u{2693}\u{26A1}\u{26AA}-\u{26AB}\u{26BD}-\u{26BE}\u{26C4}-\u{26C5}\u{26CE}\u{26D4}\u{26EA}\u{26F2}-\u{26F3}\u{26F5}\u{26FA}\u{26FD}\u{2702}\u{2705}\u{2708}-\u{270D}\u{270F}]+$/u;

                // Also accept simple short emojis
                const isValidEmoji = discordEmojiRegex.test(emojiArg) || unicodeEmojiRegex.test(emojiArg) || emojiArg.length <= 4;

                if (!isValidEmoji) {
                    return message.reply({ embeds: [SimpleEmbed(`**<@${user.id}>**, please use a valid emoji!\n\n**Options:**\n• Custom emoji: ${sym}<:emoji_name:emoji_id>${sym}\n• Unicode emoji: 🎮 🐉 ✨ etc.\n\n**Tip:** Just type the emoji directly!`)] });
                }

                // Save emoji
                clan.clanEmoji = emojiArg;
                await clan.save();

                const embed = customEmbed()
                    .setTitle('🎭 Clan Emoji Updated!')
                    .setColor('Green')
                    .setDescription(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Emoji has been set for **${clan.clanName}**!

**Preview:** ${emojiArg} ${clan.clanName}${clan.isVerified ? ` ${VERIFY_ICON}` : ''}

This emoji will now show in:
• Battle displays
• Clan leaderboards
• Battle Rank displays
                    `)
                    .setFooter({ text: 'Clan Emoji', iconURL: user.displayAvatarURL() })
                    .setTimestamp();

                return message.channel.send({ embeds: [embed] });
            }

            // ==================== TOP CLANS ====================
            if (subCommand === 'top' || subCommand === 'leaderboard' || subCommand === 'lb') {
                // Get all clans and update their stats
                const allClans = await Clan.find({});

                // Update stats for all clans
                for (const clan of allClans) {
                    let totalPoints = 0;
                    let totalElo = 0;

                    for (const memberId of clan.members) {
                        const memberData = await getUser(memberId);
                        totalPoints += memberData.command_point || 0;
                        totalElo += memberData.elo || 0;
                    }

                    clan.totalPoints = totalPoints;
                    clan.totalElo = totalElo;
                    await clan.save();
                }

                // Sort by total ELO + Points
                const sortedClans = allClans.sort((a, b) => (b.totalElo + b.totalPoints) - (a.totalElo + a.totalPoints));
                const topClans = sortedClans.slice(0, 25);

                if (topClans.length === 0) {
                    return message.reply({ embeds: [SimpleEmbed(`**<@${user.id}>**, no clans exist yet! Create one with ${sym}clan create {name}${sym}`)] });
                }

                // Create select menu options
                const selectOptions = topClans.map((clan, index) => ({
                    label: `#${index + 1} ${clan.clanName}`,
                    description: `ELO: ${clan.totalElo.toLocaleString()} | Points: ${clan.totalPoints.toLocaleString()} | Members: ${clan.members.length}`,
                    value: clan.clanId
                }));

                const selectMenu = new StringSelectMenuBuilder()
                    .setCustomId('clan_top_select')
                    .setPlaceholder('📊 Select a clan to view details...')
                    .addOptions(selectOptions);

                const row = new ActionRowBuilder().addComponents(selectMenu);

                // Build leaderboard text
                const medals = ['🥇', '🥈', '🥉'];
                let leaderboardText = '';

                topClans.slice(0, 10).forEach((clan, index) => {
                    const medal = medals[index] || `**#${index + 1}**`;
                    const totalScore = clan.totalElo + clan.totalPoints;
                    leaderboardText += `${medal} **${clan.clanName}**\n`;
                    leaderboardText += `└─ ⚔️ ${clan.totalElo.toLocaleString()} ELO | 🏆 ${clan.totalPoints.toLocaleString()} Points | 👥 ${clan.members.length}\n\n`;
                });

                const embed = customEmbed()
                    .setTitle('🏆 Top Clans Leaderboard')
                    .setColor('Gold')
                    .setDescription(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━
${leaderboardText}
━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 **Total Clans:** ${allClans.length}
🔍 Select a clan below for details!
                    `)
                    .setFooter({ text: 'Clan rankings based on ELO + Points', iconURL: user.displayAvatarURL() })
                    .setTimestamp();

                const reply = await message.channel.send({ embeds: [embed], components: [row] });

                // Create collector for select menu
                const collector = reply.createMessageComponentCollector({
                    time: 60000
                });

                collector.on('collect', async (interaction) => {
                    if (interaction.user.id !== user.id) {
                        return interaction.reply({ content: 'This is not your menu!', ephemeral: true });
                    }

                    const selectedId = interaction.values[0];
                    const selectedClan = await Clan.findOne({ clanId: selectedId });

                    if (!selectedClan) {
                        return interaction.reply({ content: 'Clan not found!', ephemeral: true });
                    }

                    // Get member list
                    let memberList = [];
                    for (const memberId of selectedClan.members.slice(0, 5)) {
                        const memberData = await getUser(memberId);
                        const isOwner = memberId === selectedClan.ownerId;
                        memberList.push(`${isOwner ? '👑' : '👤'} <@${memberId}> - ${memberData.elo || 0} ELO`);
                    }

                    const detailEmbed = customEmbed()
                        .setTitle(`🏰 ${selectedClan.clanName}`)
                        .setColor('Blue')
                        .setDescription(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 **CLAN INFO**
👑 **Owner:** <@${selectedClan.ownerId}>
👥 **Members:** ${selectedClan.members.length}/${selectedClan.maxMembers}
📝 **Description:** ${selectedClan.description}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 **CLAN STATS**
🏆 **Total Points:** ${selectedClan.totalPoints.toLocaleString()}
⚔️ **Total ELO:** ${selectedClan.totalElo.toLocaleString()}
📈 **Combined Score:** ${(selectedClan.totalElo + selectedClan.totalPoints).toLocaleString()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
👥 **TOP MEMBERS**
${memberList.join('\n')}
${selectedClan.members.length > 5 ? `\n...and ${selectedClan.members.length - 5} more` : ''}
                        `)
                        .setFooter({ text: `Created: ${selectedClan.createdAt.toLocaleDateString()}`, iconURL: user.displayAvatarURL() })
                        .setTimestamp();

                    await interaction.update({ embeds: [detailEmbed], components: [row] });
                });

                collector.on('end', () => {
                    reply.edit({ components: [] }).catch(() => { });
                });
            }

            // ==================== VERIFY CLAN (ADMIN ONLY) ====================
            if (subCommand === 'verify') {
                // Check if user is bot owner
                if (user.id !== BOT_OWNER_ID) {
                    return message.reply({ embeds: [SimpleEmbed(`**<@${user.id}>**, you don't have permission to use this command!`)] });
                }

                const clanId = args[1];
                if (!clanId) {
                    return message.reply({ embeds: [SimpleEmbed(`**<@${user.id}>**, please provide a clan ID!\n${sym}clan verify {clanId}${sym}\n\nYou can find the clan ID using ${sym}clan info {clanName}${sym}`)] });
                }

                // Find clan by ID only (more secure)
                const clan = await Clan.findOne({ clanId: clanId });

                if (!clan) {
                    return message.reply({ embeds: [SimpleEmbed(`**<@${user.id}>**, no clan found with ID: ${sym}${clanId}${sym}`)] });
                }

                // Toggle verification status
                clan.isVerified = !clan.isVerified;
                await clan.save();

                const status = clan.isVerified ? `✅ **VERIFIED** ${VERIFY_ICON}` : '❌ **UNVERIFIED**';

                const embed = customEmbed()
                    .setTitle(`${clan.isVerified ? VERIFY_ICON : '🏰'} Clan Verification Updated!`)
                    .setColor(clan.isVerified ? '#00FF00' : '#FF0000')
                    .setDescription(`
**${clan.clanName}**

Status: ${status}
Clan ID: ${sym}${clan.clanId}${sym}
                    `)
                    .setFooter({ text: 'Admin Command', iconURL: user.displayAvatarURL() })
                    .setTimestamp();

                return message.channel.send({ embeds: [embed] });
            }

        } catch (error) {
            console.log(`error clan: ${error}`);
            message.reply({ embeds: [SimpleEmbed(`An error occurred! Please try again.`)] });
        }
    },
};
