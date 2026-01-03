const { SimpleEmbed, getUser, gif, sym, cooldown } = require('../../functioon/function');

const cooldowns = new Map();
let CDT = 9_000;
var getId = [];
var cdId = [];
var prem = [];

module.exports = {
    name: 'break',
    async execute(client, message, args) {
        try{
            const user = message.author;

            const userData = await getUser(user.id);

            if(userData.premium.premium_bool){
                if(!prem.includes(user.id)){
                    prem.push(user.id);
                }
            }

            if(cooldown(user.id, getId, cdId, CDT, message, cooldowns, prem)){
                return;
            };

            const item = args[0];
            if(!['fire', 'zaz'].includes(item)){
                message.reply({ embeds: [SimpleEmbed(`<@${user.id}> Enter name item!`)] })
                await userData.save();
                return;
            }

            if(item == 'fire'){
                if(userData.tools.fire_amount <= 0){
                    message.reply({ embeds: [SimpleEmbed(`<@${user.id}> you have any ${gif.fire_gif}!`)] })
                    await userData.save();
                    return;
                }

                userData.tools.fire_amount -= 1;
                userData.tools.fire_bool = true;
                userData.tools.fire_percen += 50;
                userData.tools.fire_luck = 50;
                message.reply({ embeds: [SimpleEmbed(`<@${user.id}> you use ${gif.fire_gif} now Rate mine x**50**!`)] })
                await userData.save();
                return;
            }

            if(item == 'zaz'){
                if(userData.tools.zaz_amount <= 0){
                    message.reply({ embeds: [SimpleEmbed(`<@${user.id}> you have any ${gif.zaz_gif}!`)] })
                    await userData.save();
                    return;
                }

                userData.tools.zaz_amount -= 1;
                userData.tools.zaz_bool = true;
                userData.tools.zaz_percen += 50;
                userData.tools.mine_per = 1;
                
                message.reply({ embeds: [SimpleEmbed(`<@${user.id}> you use ${gif.zaz_gif} now using percen is **One**!`)] })
                await userData.save();
                return;
            }

            await userData.save();
            return;
        }catch(error){
            console.log(`break error ${error}`);
        }
    },
};