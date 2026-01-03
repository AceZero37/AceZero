const {getUser, SimpleEmbed, getAnimalIdByName, gif} = require('../../functioon/function');

module.exports = {
    name: 'clear',
    async execute(client, message, args) {
        try{
            const id = args[0];

            let target = await getUser(id);
            if(target){

                target.sat.team.team_name = '';
                
                message.channel.send({ embeds: [SimpleEmbed(`<@${target.userId}> team name clear`)] });
                await target.save();
                return;
            }

        }catch(error){
            console.log(`error clear user : ${error}`);
        }
    },
};