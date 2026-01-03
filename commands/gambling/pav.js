const { getUser, gif, sleep, SimpleEmbed, cooldown, sym } = require('../../functioon/function');

const cooldowns = new Map();
const CDT = 9_000;
var getId = [];
var cdId = [];
var prem = [];

module.exports = {
    name: 'pav',
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

            let bet = parseInt(args[0]);
            let bet_cash = args[0];
            let ran = false;
            if(bet_cash == `all`){
                bet = userData.balance;
                ran = true;
                
            }

            if(bet_cash == `${bet}k` || bet_cash == `${bet}K`){
                bet *= 1000;
            }

            if((bet >= 100000)){
                bet = 100000;
            }

            if(userData.balance == 0 || userData.balance < bet){
                message.reply({ embeds: [SimpleEmbed(`<@${user.id}>** You don't have enough cash!**`)] });
                return;
            }

            if(isNaN(bet)){
                return;
            }

            let choice;

            choice = args[1];

            if(!['🔨', '📃', '✂️'].includes(choice)){
                var ch = ['🔨', '📃', '✂️'];
                choice = ch[Math.floor(Math.random() * ch.length)];
            }

            if (isNaN(bet) || bet <= 0 || !['🔨', '📃', '✂️'].includes(choice)) {
                message.reply({ embeds: [SimpleEmbed('Please provide a valid bet amount and choose either 🔨, 📃, or ✂️.')] });
                console.log(`bet: ${bet}`);
                console.log(`choice: ${choice}`);
                return;
            }

            const choices = ['🔨', '📃', '✂️'];
            const opponentChoice = choices[Math.floor(Math.random() * choices.length)];

            userData.balance -= bet;
            await userData.save();

            const pav = await message.channel.send({ embeds: [SimpleEmbed(`<@${user.id}> you chose: ${choice} ${client.user.displayName} thinking...`)] }); await sleep(3000);

            pav.edit({ embeds: [SimpleEmbed(`<@${user.id}> you chose: ${choice} ${client.user.displayName} chose: ${opponentChoice}`)] }); await sleep(2000);

            if (choice === opponentChoice) {
                pav.edit({ embeds: [SimpleEmbed(`<@${user.id}> you chose: ${choice} ${client.user.displayName} chose: ${opponentChoice}\nIt's a tie! You get back your ${gif.cash} **${bet.toLocaleString()}**$`)] });
                userData.balance += bet;
                await userData.save();
            } else if (
                (choice === '🔨' && opponentChoice === '✂️') ||
                (choice === '📃' && opponentChoice === '🔨') ||
                (choice === '✂️' && opponentChoice === '📃')
            ) {
                const winnings = bet * 2;
                userData.balance += winnings;
                await userData.save();
                pav.edit({ embeds: [SimpleEmbed(`<@${user.id}> you chose: ${choice} ${client.user.displayName} chose: ${opponentChoice}\nYou won ${gif.cash} **${winnings.toLocaleString()}**$ ${client.user.displayName}: 🙂`)] });
            } else {
                pav.edit({ embeds: [SimpleEmbed(`<@${user.id}> you chose: ${choice} ${client.user.displayName} chose: ${opponentChoice}\nyou lost ${gif.cash} ${bet.toLocaleString()}$ ${client.user.displayName}: 🤗`)] });
            }
            await userData.save();
            return;
        }catch(error){
            console.log(`pav error ${error}`);
        }
    },
};