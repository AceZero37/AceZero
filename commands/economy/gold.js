const {getUser, SimpleEmbed, gif, sym, cooldown} = require('../../functioon/function');

const cooldowns = new Map();
let CDT = 9_000;
var getId = [];
var cdId = [];
var prem = [];

module.exports = {
    name: 'gold',
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

            const mention = message.mentions.users.first();
            if(mention){
                const targetData = await getUser(mention.id);
                if(!targetData){
                    return;
                }

                message.channel.send({ embeds: [SimpleEmbed(`<@${mention.id}> have ${gif.gold_coin} **${targetData.gold_coin.toLocaleString()}** now!`)] });
                return;
            }
            
            message.channel.send({ embeds: [SimpleEmbed(`<@${user.id}> have ${gif.gold_coin} **${userData.gold_coin.toLocaleString()}** now!`)] });
        }catch(error){
            console.log(`cash error ${error}`);
        }
    },
};