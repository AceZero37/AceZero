const {createCanvas, gif, AttachmentBuilder, SimpleEmbed, loadImage, User, generateRandomId, getUser, cooldown} = require('../../functioon/function');

const moment = require('moment-timezone');
const asiaTimezone = 'Asia/Phnom_Penh';

const cooldowns = new Map();
let CDT = 25_000;
var getId = [];
var cdId = [];
var prem = [];

module.exports = {
    name: 'premium',
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

            if(userData.premium.premium_bool == true){

                const now = moment.tz('Asia/Phnom_Penh');
                const premiumEndDate = moment.tz(userData.premium.premium_endDate, 'Asia/Phnom_Penh');

                // Calculate the difference in milliseconds
                const differenceInMs = premiumEndDate.diff(now);

                // Convert the difference to a duration object
                const duration = moment.duration(differenceInMs);

                // Extract days, hours, minutes, and seconds
                const days = duration.days();
                const hours = duration.hours();
                const minutes = duration.minutes();
                const seconds = duration.seconds();

                let message_timeleft = 'TL: ';
                message_timeleft += `**`;
                if(days > 0){
                    message_timeleft += `${days}d, `;
                }
                if(hours > 0){
                    message_timeleft += `${hours}h, `;
                }
                if(minutes > 0){
                    message_timeleft += `${minutes}m, `;
                }
                if(seconds > 0){
                    message_timeleft += `${seconds}s`;
                }
                message_timeleft += `**`;

                // For Discord timestamp (relative time format)
                const premiumEndUnix = Math.floor(premiumEndDate.valueOf() / 1000);
                const formattedTimestamp = `<t:${premiumEndUnix}:R>`;

                message.channel.send({ 
    embeds: [
        SimpleEmbed(
`Pe: **${formattedTimestamp}** left
${message_timeleft}
As: **PREMIUM Hemiko** ${gif.premium_Hemiko}

**Include**:
${gif.arrow_premium}**Limit Tranfer x2**
${gif.arrow_premium}**All cmd CD -50%**
${gif.arrow_premium}**Message[CMD] React ${gif.premium_Hemiko}**

**Daily claim**:
${gif.arrow_premium}${gif.cash}**500,000**$
${gif.arrow_premium}${gif['050']} **5**
${gif.arrow_premium}${gif['100']} **5**

**Note**: do not forget to claim your daily Reward!`
        )
        .setAuthor({ 
            name: `${user.displayName}'s Premium`, 
            iconURL: user.displayAvatarURL() 
        })
    ] 
});

            }

            return;

        }catch(error){
            console.log(`premium error ${error}`);
        }
    },
};


