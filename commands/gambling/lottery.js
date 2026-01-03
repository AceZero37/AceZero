const { SimpleEmbed, getUser, getRandomInt, sleep, blackjackEmbed, gif, cooldown, sym3, customEmbed } = require('../../functioon/function');

const cooldowns = new Map();
let CDT = 30_000;
var getId = [];
var cdId = [];
var prem = [];

module.exports = {
    name: 'lottery',
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

            const embed = customEmbed()
                .setAuthor({ name: `${user.displayName} in lottery`, iconURL: user.displayAvatarURL() })
                .setColor('Aqua')
                .setDescription(`Lottery will release new number at 12PM`)
                .addFields(
                    { name: `Number in today`, value: `${sym3}99${sym3}`, inline: true },
                )
                .addFields(
                    { name: `Ends in`, value: `${sym3}1h 1m 1s${sym3}`, inline: true },
                )
                .setTimestamp()
            
            message.channel.send({ embeds: [embed] });
            
        }catch(error){
            console.log(`lottery error ${error}`);
        }
    },
};