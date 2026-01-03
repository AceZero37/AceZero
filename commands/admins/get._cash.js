const {getUser, SimpleEmbed, gif} = require('../../functioon/function');

module.exports = {
    name: 'wish',
    async execute(client, message, args) {
        const user = message.author;

        let amount = parseInt(args[0]);
        if(isNaN(amount)){
            message.reply('DAK LUY');
            return;
        }

        const mentions = message.mentions.users.first();
        if(mentions){
            let target = await getUser(mentions.id);
            if(target){
                target.balance += amount;
                await target.save();
                message.channel.send({ embeds: [SimpleEmbed(`**${mentions.displayName}** got ${gif.s} **${amount.toLocaleString()}**$!!!`)] });
                return;
            }else{
                message.channel.send({ embeds: [SimpleEmbed(`**${mentions.displayName}** did not play Hemiko!`)] });
            }
        }

        let userData = await getUser(user.id);

        userData.balance += amount;
        await userData.save();

        message.channel.send({ embeds: [SimpleEmbed(`**${user.displayName}** got ${gif.cash} **${amount.toLocaleString()}**$!!!`)] });
    },
};