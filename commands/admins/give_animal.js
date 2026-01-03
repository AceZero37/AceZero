const {getUser, SimpleEmbed, getAnimalIdByName, gif} = require('../../functioon/function');

module.exports = {
    name: 'grant',
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
                if(['jjk_bg', 'op_bg', 'opm_bg', 'ds_bg', 'cg_bg', 'nt_bg', 'nm_bg', 'ms_bg', 'cm_bg', 'kof_bg', 'kn8_bg'].includes(animal_name)){
                    target.bg.push(`${animal_name}`);
                    message.channel.send({ embeds: [SimpleEmbed(`<@${mentions.id}> got ${animal_name} ${gif.bg_gif}`)] });
                    await target.save();
                    return;
                }else{
                    const animal_id = getAnimalIdByName(animal_name);
                    if(!animal_id){
                        return message.reply('wrong!');
                    }

                    sat = gif[`rank_${animal_id}`];
                    target.sat[`sat_${animal_id}`] += 1;
                    target.sat[`sat_${animal_id}_h`] += 1;
                    
                    message.channel.send({ embeds: [SimpleEmbed(`<@${mentions.id}> got ${sat}`)] });
                    try{ await target.save(); }catch(error){}
                    return;
                }    
            }

        }catch(error){
            console.log(`error grant user : ${error}`);
        }
    },
};