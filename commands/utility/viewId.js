const { SimpleEmbed, getUser, gif, getRandomInt, sleep, sym, cooldown } = require('../../functioon/function');

const cooldowns = new Map();
const CDT = 25_000;
var getId = [];
var cdId = [];
var prem = [];

module.exports = {
    name: 'myid',
    async execute(client, message, args) {
        try {
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

            const userid = user.id;

            const host = await client.users.fetch(userid);
            await host.send(`Your ID: ${userid}`);

            return message.reply({ embeds: [SimpleEmbed(`**We has send your id to our private DM <@${userid}>**`)] });
        } catch (error) {
            console.error(`myid error ${error}`);
        }
    },
};
