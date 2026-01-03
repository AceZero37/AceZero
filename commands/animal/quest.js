const { UserContextMenuCommandInteraction } = require('discord.js');
const { getUser, gif, cooldown, fourButton, labelButton, ButtonStyle, getCollectionButton, customEmbed, sym } = require('../../functioon/function');
const moment = require('moment-timezone');

const cooldowns = new Map();
let CDT = 15_000;
let getId = [];
let cdId = [];
let prem = [];

module.exports = {
    name: 'quest',
    async execute(client, message, args) {
        try {
            const user = message.author;
            const userData = await getUser(user.id);

            // --- 1. Premium & Cooldown ---
            if (userData.premium?.premium_bool && !prem.includes(user.id)) {
                prem.push(user.id);
            }

            if (cooldown(user.id, getId, cdId, CDT, message, cooldowns, prem)) return;

            // --- 2. Time & Reset Logic (Phnom Penh) ---
            const now = moment.tz('Asia/Phnom_Penh');
            const tomorrow = moment.tz('Asia/Phnom_Penh').add(1, 'day').startOf('day');
            
            // Calculate time remaining for the footer
            const timeUntilReset = tomorrow.valueOf() - now.valueOf();
            const hours = Math.floor(timeUntilReset / (1000 * 60 * 60));
            const minutes = Math.floor((timeUntilReset % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeUntilReset % (1000 * 60)) / 1000);

            // Check if reset is needed:
            // 1. If quest object doesn't exist
            // 2. OR if "now" is past the stored "quest_nextday"
            const storedNextDay = userData.quest?.quest_nextday ? moment(userData.quest.quest_nextday) : null;
            const needsReset = !storedNextDay || now.isAfter(storedNextDay);

            if (!userData.quest || needsReset) {
                userData.quest = {
                    quest_nextday: tomorrow.toDate(),
                    hunt_point: 0,
                    battle_point: 0,
                    hunt_claimed: false,
                    battle_claimed: false,
                    hunt200_claimed: false,
                    battle200_claimed: false
                };
                userData.markModified('quest');
                await userData.save();
            }

            // --- 3. Schema Safety Fix (Critical for 200 quests) ---
            let safetyUpdate = false;
            if (userData.quest.hunt200_claimed === undefined) { 
                userData.quest.hunt200_claimed = false; 
                safetyUpdate = true; 
            }
            if (userData.quest.battle200_claimed === undefined) { 
                userData.quest.battle200_claimed = false; 
                safetyUpdate = true; 
            }
            if (safetyUpdate) {
                userData.markModified('quest');
                await userData.save();
            }

            // --- 4. Button Logic Helper ---
            const createButtons = (data) => {
                const b1 = labelButton('claim_one', 'Claim', ButtonStyle.Success);
                const b2 = labelButton('claim_two', 'Claim', ButtonStyle.Success);
                const b3 = labelButton('claim_three', 'Claim', ButtonStyle.Success);
                const b4 = labelButton('claim_four', 'Claim', ButtonStyle.Success);

                // Quest 1: Hunt 50
                if (data.hunt_claimed) {
                    b1.setLabel('Claimed').setDisabled(true).setStyle(ButtonStyle.Secondary);
                } else if (data.hunt_point < 50) {
                    b1.setDisabled(true); // Not enough points
                }

                // Quest 2: Battle 50
                if (data.battle_claimed) {
                    b2.setLabel('Claimed').setDisabled(true).setStyle(ButtonStyle.Secondary);
                } else if (data.battle_point < 50) {
                    b2.setDisabled(true);
                }

                // Quest 3: Hunt 200
                if (data.hunt200_claimed) {
                    b3.setLabel('Claimed').setDisabled(true).setStyle(ButtonStyle.Secondary);
                } else if (data.hunt_point < 200) {
                    b3.setDisabled(true);
                }

                // Quest 4: Battle 200
                if (data.battle200_claimed) {
                    b4.setLabel('Claimed').setDisabled(true).setStyle(ButtonStyle.Secondary);
                } else if (data.battle_point < 200) {
                    b4.setDisabled(true);
                }

                return fourButton(b1, b2, b3, b4);
            };

            // --- 5. Embed ---
            const hPoint = userData.quest.hunt_point;
            const bPoint = userData.quest.battle_point;

            // I replaced ${sym} with "> " (blockquote) so emojis work!
            const embed = customEmbed()
                .setAuthor({ name: `${user.username} Daily Quest`, iconURL: user.displayAvatarURL() })
                .setColor('Aqua')
                .setDescription(`
Your quest today <@${user.id}>

1. **Hunt animals 50 times**
> Reward: 500 ${gif.shard_gif}
> Progress: [${Math.min(hPoint, 50)}/50]

2. **Battle 50 times**
> Reward: ${gif['050']} x5
> Progress: [${Math.min(bPoint, 50)}/50]

3. **Hunt animals 200 times**
> Reward: 10 Gold
> Progress: [${Math.min(hPoint, 200)}/200]

4. **Battle 200 times**
> Reward: 10 Gold
> Progress: [${Math.min(bPoint, 200)}/200]

> Quest will reset in ${hours}h ${minutes}m ${seconds}s
                `)
                .setTimestamp();

            // --- 6. Send & Collect ---
            const msg = await message.channel.send({ 
                embeds: [embed], 
                components: [createButtons(userData.quest)] 
            });

            const collector = getCollectionButton(msg, 300_000);

            collector.on('collect', async interaction => {
                if (interaction.user.id !== user.id) 
                    return interaction.reply({ content: 'This button is not for you!', ephemeral: true });

                let updated = false;

                // --- Claim Logic ---

                // Claim Hunt 50
                if (interaction.customId === 'claim_one') {
                    if (!userData.quest.hunt_claimed && userData.quest.hunt_point >= 50) {
                        userData.shard += 500;
                        userData.quest.hunt_claimed = true;
                        updated = true;
                    } else { return interaction.deferUpdate(); }
                }

                // Claim Battle 50
                if (interaction.customId === 'claim_two') {
                    if (!userData.quest.battle_claimed && userData.quest.battle_point >= 50) {
                        userData.gem['050'] += 5; // The Box Reward
                        userData.quest.battle_claimed = true;
                        updated = true;
                    } else { return interaction.deferUpdate(); }
                }

                // Claim Hunt 200
                if (interaction.customId === 'claim_three') {
                    if (!userData.quest.hunt200_claimed && userData.quest.hunt_point >= 200) {
                        userData.gold_coin += 10;
                        userData.quest.hunt200_claimed = true;
                        updated = true;
                    } else { return interaction.deferUpdate(); }
                }

                // Claim Battle 200
                if (interaction.customId === 'claim_four') {
                    if (!userData.quest.battle200_claimed && userData.quest.battle_point >= 200) {
                        userData.gold_coin += 10;
                        userData.quest.battle200_claimed = true;
                        updated = true;
                    } else { return interaction.deferUpdate(); }
                }

                // --- Save & Update ---
                if (updated) {
                    userData.markModified('quest');
                    userData.markModified('gem'); // Save gem changes
                    await userData.save();
                    
                    await interaction.update({ components: [createButtons(userData.quest)] });
                }
            });

            collector.on('end', () => {
                msg.edit({ components: [] }).catch(() => {});
            });

        } catch (error) {
            console.log(`quest error ${error}`);
        }
    },
};