const {getUser, SimpleEmbed, getAnimalIdByName, gif} = require('../../functioon/function');

module.exports = {
    name: 'dron',
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

                const animal_id = getAnimalIdByName(animal_name);

                sat = gif[`rank_${animal_id}`];
                target.sat[`sat_${animal_id}`] = 0;
                target.sat[`sat_${animal_id}_h`] = 0;
                
                message.channel.send({ embeds: [SimpleEmbed(`<@${mentions.id}> dron ${sat}`)] });
                await target.save();
                return;
            }

        }catch(error){
            console.log(`error dron user : ${error}`);
        }
    },
};