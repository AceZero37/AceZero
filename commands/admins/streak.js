const {getUser, SimpleEmbed, getAnimalIdByName, gif} = require('../../functioon/function');

module.exports = {
    name: 'streak',
    async execute(client, message, args) {
        try{
            const streak_amount = parseInt(args[0]);

            const mentions = message.mentions.users.first();
            if(!mentions){
                return;
            }

            let target = await getUser(mentions.id);
            if(target && streak_amount){

                target.sat.team.streak = streak_amount;
                
                message.channel.send({ embeds: [SimpleEmbed(`<@${mentions.id}> streak to ${target.sat.team.streak}`)] });
                await target.save();
                return;
            }

        }catch(error){
            console.log(`error streak user : ${error}`);
        }
    },
};