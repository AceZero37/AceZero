const {getUser, SimpleEmbed, gif, customEmbed, labelButton, twoButton, ButtonStyle, getCollectionButton} = require('../../functioon/function');

// Configuration for all animal ranks
const ANIMAL_RANKS = [
    { id: 1, name: 'Common', slots: 5, label: 'C' },
    { id: 2, name: 'Uncommon', slots: 5, label: 'U' },
    { id: 3, name: 'Rare', slots: 5, label: 'R' },
    { id: 4, name: 'Epic', slots: 5, label: 'E' },
    { id: 5, name: 'Mythical', slots: 5, label: 'M' },
    { id: 6, name: 'Legendary', slots: 5, label: 'L' },
    { id: 7, name: 'Gem', slots: 5, label: 'G' },
    { id: 8, name: 'Fabled', slots: 5, label: 'F' },
    { id: 9, name: 'Special', slots: 10, label: 'S' },
    // { id: 10, name: 'Custom Patreon', slots: 99, label: 'CP' },
    { id: 11, name: 'Patreon', slots: 5, label: 'P' },
    { id: 12, name: 'Bot', slots: 5, label: 'O' },
    { id: 13, name: 'Distorted', slots: 5, label: 'X' },
    { id: 14, name: 'Hidden', slots: 5, label: 'V' },
    { id: 15, name: 'Jujutsu Kaisen', slots: 5, label: 'JJK' },
    { id: 16, name: 'One Piece', slots: 5, label: 'OP' },
    { id: 17, name: 'One Punch Man', slots: 5, label: 'OPM' },
    { id: 18, name: 'Mashle', slots: 5, label: 'MS' },
    // { id: 19, name: 'Demon Slayer', slots: 5, label: 'DS' },
    // { id: 20, name: 'Collection Girl', slots: 5, label: 'CG' },
    { id: 21, name: 'Naruto', slots: 5, label: 'NT' },
    // { id: 22, name: 'Hanuman', slots: 5, label: 'NM' },
    // { id: 23, name: 'Chainsaw Man', slots: 5, label: 'CM' },
    { id: 24, name: 'KOF', slots: 5, label: 'KOF' },
    // { id: 25, name: 'Kaiju No 8', slots: 5, label: 'KN8' },
    { id: 26, name: 'Very Cool', slots: 10, label: 'VC' },
    { id: 27, name: 'Solo Leveling', slots: 5, label: 'SL' }
];

module.exports = {
    name: 'giveall',
    async execute(client, message, args) {
        try {
            const user = message.author;

            // Admin check
            if (user.id !== '741600112366583828') {
                return;
            }

            const mentions = message.mentions.users.first();

            // Validate mention
            if (!mentions) {
                return message.reply('Please mention a user! Usage: `!giveall @user`');
            }

            // Get target user
            const target = await getUser(mentions.id);
            if (!target) {
                return message.reply('User did not play Hemiko!');
            }

            // Always give everything with amount 1
            const ranksToGive = ANIMAL_RANKS;
            const amount = 1;

            // Build confirmation embed
            const totalAnimals = ranksToGive.reduce((sum, r) => sum + r.slots, 0);
            const rankLabels = ranksToGive.map(r => r.label).join(', ');
            
            const embed = customEmbed()
                .setColor('Red')
                .setTitle('⚠️ GIVE ALL ANIMALS')
                .setDescription(
                    `Are you sure you want to give **ALL ANIMALS** to <@${mentions.id}>?\n\n` +
                    `⚠️ **This will give every animal in the game!**\n\n` +
                    `**Total Unique Animals:** ${totalAnimals}\n` +
                    `**Amount Each:** ${amount}\n` +
                    `**Ranks:** ${rankLabels}`
                );

            const agree_button = labelButton('agree_button', 'Confirm', ButtonStyle.Success);
            const decline_button = labelButton('decline_button', 'Cancel', ButtonStyle.Danger);
            const allButton = twoButton(agree_button, decline_button);

            const mgs = await message.channel.send({ embeds: [embed], components: [allButton] });

            const collector = getCollectionButton(mgs, 30_000);

            collector.on('end', (collected, reason) => {
                if (reason === 'time') {
                    collector.stop();
                    agree_button.setDisabled(true);
                    decline_button.setDisabled(true);
                    mgs.edit({ embeds: [embed.setColor('#3D3D3D')], components: [allButton] });
                    return;
                } else {
                    collector.stop();
                    agree_button.setDisabled(true);
                    decline_button.setDisabled(true);
                    mgs.edit({ components: [] });
                    return;
                }
            });

            collector.on('collect', async (interaction) => {
                if (interaction.member.user.id !== user.id) {
                    await interaction.reply({ content: 'This button is not for you!', ephemeral: true });
                    return;
                }

                if (interaction.customId === 'agree_button') {
                    await interaction.deferUpdate();

                    let givenCount = 0;
                    let totalGiven = 0;

                    // Give all animals for selected ranks
                    for (const rank of ranksToGive) {
                        for (let i = 1; i <= rank.slots; i++) {
                            const key = `sat_${rank.id}_${i}`;
                            const historyKey = `sat_${rank.id}_${i}_h`;

                            // Add to current inventory
                            if (!target.sat[key]) target.sat[key] = 0;
                            target.sat[key] += amount;

                            // Add to history
                            if (!target.sat[historyKey]) target.sat[historyKey] = 0;
                            target.sat[historyKey] += amount;

                            givenCount++;
                            totalGiven += amount;
                        }
                    }

                    // Save to database
                    try {
                        await target.save();
                        
                        const successEmbed = customEmbed()
                            .setColor('Green')
                            .setTitle('✅ Animals Given Successfully!')
                            .setDescription(
                                `<@${user.id}> gave animals to <@${mentions.id}>\n\n` +
                                `**Ranks:** ${rankLabels}\n` +
                                `**Unique Animals:** ${givenCount}\n` +
                                `**Total Given:** ${totalGiven.toLocaleString()}`
                            );

                        mgs.edit({ embeds: [successEmbed], components: [] });
                    } catch (error) {
                        console.error('Error saving animals:', error);
                        mgs.edit({ 
                            embeds: [SimpleEmbed('❌ Error saving animals! Please try again.')], 
                            components: [] 
                        });
                    }

                    collector.stop();
                    return;
                }

                if (interaction.customId === 'decline_button') {
                    await interaction.deferUpdate();
                    mgs.edit({ 
                        embeds: [SimpleEmbed(`<@${user.id}> has cancelled the animal gift.`)], 
                        components: [] 
                    });
                    collector.stop();
                    return;
                }
            });

        } catch (error) {
            console.log(`giveall error: ${error}`);
            message.reply('An error occurred while giving animals!');
        }
    },
};