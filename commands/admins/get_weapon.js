const {getUser, SimpleEmbed, getAnimalIdByName, gif} = require('../../functioon/function');

module.exports = {
    name: 'wen',
    async execute(client, message, args) {
        try{
            const user = message.author;

            const animal_name = args[0];

            const mentions = message.mentions.users.first();
            if(!mentions){
                return;
            }

            let target = await getUser(mentions.id);
            if(target){

                const weapon_id = args[0];
                const weapon = args[1];
                const rank = args[2];
                const passive = args[3];
                const rank_ran = args[4];

                const weapon_gif = gif[`${weapon}_${rank}_gif`];

                information_weapon = `${weapon_id} ${weapon} ${rank} ${passive} ${rank_ran} false`;
                target.wp.push(`${information_weapon}`);
                
                message.channel.send({ embeds: [SimpleEmbed(`<@${mentions.id}> got ${weapon_gif}`)] });
                await target.save();
                return;
            }

        }catch(error){
            console.log(`error wen user : ${error}`);
        }
    },
};