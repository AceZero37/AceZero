const { SimpleEmbed, getUser } = require('../../functioon/function');
const mongoose = require('mongoose');
const { userSchema } = require('../../users/user');
const User = mongoose.model('User', userSchema);

module.exports = {
    name: 'remove_rune_forgotten',
    async execute(client, message, args) {
        try {
            const user = message.author;

            // Admin check - only allow specific users to run this command
            const adminIds = ['']; // Replace with actual admin IDs
            if (!adminIds.includes(user.id)) {
                // Allow bot owner or server admin
                if (!message.member.permissions.has('Administrator')) {
                    return message.reply({ embeds: [SimpleEmbed(`**<@${user.id}>**, you do not have permission to use this command!`)] });
                }
            }

            const mgs = await message.channel.send({ embeds: [SimpleEmbed(`**<@${user.id}>** is stripping passives from all **Rune of the Forgotten** weapons...`)] });

            // Find all users who have 'rune_of_the_forgotten' in their wp array
            const usersWithRune = await User.find({
                wp: { $regex: /rune_of_the_forgotten/i }
            });

            let totalUpdated = 0;
            let usersAffected = 0;

            for (const userData of usersWithRune) {
                let userModified = false;

                // Update each rune_of_the_forgotten weapon to have no passive
                userData.wp = userData.wp.map(wp => {
                    const str = `${wp}`;
                    const parts = str.split(' ');
                    // Format: weapon_id weapon_name rank passive rank_ran bool passive_two
                    const [id, name, rank, passive, percen, boolStr, passive_two] = parts;

                    if (name === 'rune_of_the_forgotten') {
                        // Check if it has a passive that needs to be changed to 'empty'
                        if (passive && passive !== 'empty' && passive !== '') {
                            totalUpdated++;
                            userModified = true;
                            // Rebuild weapon string with 'empty' passive
                            return `${id} ${name} ${rank} empty ${percen} ${boolStr || 'false'} `;
                        }
                    }
                    return wp;
                });

                if (userModified) {
                    usersAffected++;
                    try {
                        await userData.save();
                    } catch (saveError) {
                        console.error(`Error saving user ${userData.userId}:`, saveError);
                    }
                }
            }

            await mgs.edit({
                embeds: [SimpleEmbed(`✅ **<@${user.id}>** successfully stripped passives from **${totalUpdated}** Rune of the Forgotten weapons across **${usersAffected}** users!`).setColor('Green')]
            });

        } catch (error) {
            console.error(`remove_rune_forgotten error: ${error}`);
            message.reply({ embeds: [SimpleEmbed(`Error stripping passives: ${error.message}`).setColor('Red')] });
        }
    },
};
