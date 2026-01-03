const {getUser, gif, SimpleEmbed, sym, cooldown} = require('../../functioon/function');

const cooldowns = new Map();
let CDT = 25_000;
var getId = [];
var cdId = [];
var prem = [];

module.exports = {
    name: 'background',
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

            const background_id = args[0];

            if(['jjk', 'op', 'opm', 'ds', 'cg', 'nt', 'nm', 'ms', 'cm', 'kof', 'kn8'].includes(background_id)){
                for(const bg of userData.bg){
                    const str = `${bg}`;
                    if(str.includes(background_id)){
                        userData.lvl_bg = background_id;
                        message.channel.send({ embeds: [SimpleEmbed(`<@${user.id}> has changed Background to ${sym}${background_id}${sym}${gif.bg_gif}`)] });
                        await userData.save();
                        return;
                    }
                }
            }else if(background_id == 'remove'){
                userData.lvl_bg = '';
                message.channel.send({ embeds: [SimpleEmbed(`<@${user.id}> has removed Background`)] });
                await userData.save();
                return;
            }

            return;
        }catch(error){
            console.log(`background error ${error}`);
        }
    },
};