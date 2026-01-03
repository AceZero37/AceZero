const {cooldown, customEmbed, sym, getUser} = require('../../functioon/function');

const cooldowns = new Map();
let CDT = 25_000;
var getId = [];
var cdId = [];
var prem = [];

module.exports = {
    name: 'supporter',
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
                .setTitle('🪸 ====== Hemiko Supporter ====== 🪸')
                .setColor('Aqua')
                .addFields(
                    { name: ` `, value: `- ${sym}   Mikey   ${sym} ${sym}ID : 1069079113261908008 ${sym}` },
                    { name: ` `, value: `- ${sym}   Sarat   ${sym} ${sym}ID : 871391573462618153 ${sym}` },
                    { name: ` `, value: `- ${sym}   Jlerm   ${sym} ${sym}ID : ??? ${sym}` },
                    { name: ` `, value: `- ${sym}   Obuy   ${sym} ${sym}ID : 498014218654711809 ${sym}` },
                    { name: ` `, value: `- ${sym}   Cg_fy   ${sym} ${sym}ID : ??? ${sym}` },
                    { name: ` `, value: `- ${sym}   Roza   ${sym} ${sym}ID : 1166375653529112577 ${sym}` },
                    { name: `🪼 -------- Thanks for Support -------- 🪼`, value: ` ` },
                )
                .setTimestamp()

                message.channel.send({ embeds: [embed] });

        }catch(error){
            console.log(`supporter error ${error}`);
        }
    },
};
