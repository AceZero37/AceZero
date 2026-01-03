const moment = require('moment-timezone');
const { SimpleEmbed, gif, getUser } = require('../functioon/function');

module.exports = {
    name: 'daily',
    description: 'Collect daily earnings. Reset every 12 AM Cambodia time.',
    execute: async (interaction, client) => {
        try {
            const user = interaction.message.author;
            const userData = await getUser(user.id);

            const bonus = 500;
            const reward = userData.dailySystem.dailyStack + bonus;

            // Current time in Cambodia
            const now = moment.tz("Asia/Phnom_Penh");

            // Last claim date in Cambodia
            const lastClaim = userData.dailySystem.daily
                ? moment.tz(userData.dailySystem.daily, "Asia/Phnom_Penh")
                : null;

            // Check if already claimed today
            const claimedToday = lastClaim && now.isSame(lastClaim, "day");

            if (!claimedToday) {

                await interaction.reply({
                    embeds: [
                        SimpleEmbed(
                            `<@${user.id}> has claimed your daily reward: ${gif.cash} **${reward.toLocaleString()}**$`
                        )
                    ]
                });

                // Save claim time
                userData.balance += reward;
                userData.dailySystem.daily = Date.now();
                userData.dailySystem.dailyStack += 159; // keep if needed

                await userData.save();
                return;
            }

            // Calculate time until midnight
            const nextMidnight = now.clone().endOf("day");
            const msRemaining = nextMidnight.diff(now);

            const hours = Math.floor(msRemaining / 3600000);
            const minutes = Math.floor((msRemaining % 3600000) / 60000);
            const seconds = Math.floor((msRemaining % 60000) / 1000);

            await interaction.reply({
                embeds: [
                    SimpleEmbed(
                        `<@${user.id}> You already claimed. Try again in **${hours}H ${minutes}M ${seconds}S**`
                    )
                ]
            });

        } catch (error) {
            console.log(`daily error ${error}`);
        }
    },
};
