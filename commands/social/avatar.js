const {getUser, SimpleEmbed, gif, AttachmentBuilder, customEmbed, cooldown, sym} = require('../../functioon/function');

const cooldowns = new Map();
let CDT = 25_000;
var getId = [];
var cdId = [];
var prem = [];

module.exports = {
    name: 'avatar',
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
                const avatarURL = mention.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 });

                const embed = customEmbed()
                    .setTitle('User Avatar')
                    .setImage(avatarURL)
                    .setColor('#7289DA');
                message.channel.send({ embeds: [embed] });
                return;
            }

            const avatarURL = user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 });

            const embed = customEmbed()
                .setTitle('User Avatar')
                .setImage(avatarURL)
                .setColor('#7289DA');
            message.channel.send({ embeds: [embed] });
        }catch(error){
            console.log(`avatar error ${error}`);
        }
    },
};