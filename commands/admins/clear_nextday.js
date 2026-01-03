const {getUser, SimpleEmbed, User, gif} = require('../../functioon/function');

module.exports = {
    name: 'nextday',
    async execute(client, message, args) {
        try{
            const mention = message.mentions.users.first();
            const userData = await getUser(mention.id);

            userData.next_day = '';

            try{ await userData.save(); }catch(error){}

            message.channel.send({ embeds: [SimpleEmbed(`<@${mention.id}> Successfully Reset Limit cash!`)] });

        }catch(error){
            console.log(`error nextday user : ${error}`);
        }
    },
};