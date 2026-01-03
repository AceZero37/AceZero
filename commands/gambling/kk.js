const { getUser, getRandomInt, sleep, advanceEmbed, SimpleEmbed, gif, emojiButton, sym, threeButton, getCollectionButton, cooldown, ButtonStyle } = require('../../functioon/function');

const cooldowns = new Map();
const CDT = 15_000;
var getId = [];
var cdId = [];
var prem = [];

module.exports = {
    name: 'kk',
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

            let amount = parseInt(args[0]);
            let amount_cash = args[0];
            if(isNaN(amount)){
                amount = 1;
            }

            if(amount_cash == `${amount}k` || amount_cash == `${amount}K`){
                amount *= 1000;
            }

            if(args[0] == 'all'){
                amount = userData.balance;
            }
            if(amount >= 250000){
                amount = 250000;
            }

            if(userData.balance < amount || userData.balance <= 0){
                message.reply({ embeds: [SimpleEmbed(`<@${user.id}>** You don't have enough cash!**`)] });
                await userData.save();
                return;
            }

            const embed = advanceEmbed(`Dealer ${gif.dealer_gif} **Waiting!**\nbet! ${gif.cash} **${amount.toLocaleString()}**`, gif.kda, '🔢 ~ game in Process', user, 'Blue');

            userData.balance -= amount;
            await userData.save();

            const a1 = emojiButton('kla', gif.kla_gif, ButtonStyle.Primary);
            const a2 = emojiButton('klok', gif.klok_gif, ButtonStyle.Primary);
            const a3 = emojiButton('morn', gif.morn_gif, ButtonStyle.Primary);
            
            const b1 = emojiButton('bongKorng', gif.bongKorng_gif, ButtonStyle.Primary);
            const b2 = emojiButton('kdam', gif.kdam_gif, ButtonStyle.Primary);
            const b3 = emojiButton('trey', gif.trey_gif, ButtonStyle.Primary);

            const BT1 = threeButton(a1, a2, a3);
            const BT2 = threeButton(b1, b2, b3);

            const KK = getRandomInt(1, 7);
            const KK2 = getRandomInt(1, 7);
            const KK3 = getRandomInt(1, 7);

            let D1 = '';
            let D2 = '';
            let D3 = '';

            let G1 = '';
            let G2 = '';
            let G3 = '';

            if(KK == 1){
                D1 = gif.kla_gif;
                G1 = 'kla';
            }else if(KK == 2){
                D1 = gif.klok_gif;
                G1 = 'klok';
            }else if(KK == 3){
                D1 = gif.morn_gif;
                G1 = 'morn';
            }else if(KK == 4){
                D1 = gif.bongKorng_gif;
                G1 = 'bongKorng';
            }else if(KK == 5){
                D1 = gif.kdam_gif;
                G1 = 'kdam';
            }else if(KK == 6){
                D1 = gif.trey_gif
                G1 = 'trey';
            }

            if(KK2 == 1){
                D2 = gif.kla_gif;
                G2 = 'kla';
            }else if(KK2 == 2){
                D2 = gif.klok_gif;
                G2 = 'klok';
            }else if(KK2 == 3){
                D2 = gif.morn_gif;
                G2 = 'morn';
            }else if(KK2 == 4){
                D2 = gif.bongKorng_gif;
                G2 = 'bongKorng';
            }else if(KK2 == 5){
                D2 = gif.kdam_gif;
                G2 = 'kdam';
            }else if(KK2 == 6){
                D2 = gif.trey_gif
                G2 = 'trey';
            }
            
            if(KK3 == 1){
                D3 = gif.kla_gif;
                G3 = 'kla';
            }else if(KK3 == 2){
                D3 = gif.klok_gif;
                G3 = 'klok';
            }else if(KK3 == 3){
                D3 = gif.morn_gif;
                G3 = 'morn';
            }else if(KK3 == 4){
                D3 = gif.bongKorng_gif;
                G3 = 'bongKorng';
            }else if(KK3 == 5){
                D3 = gif.kdam_gif;
                G3 = 'kdam';
            }else if(KK3 == 6){
                D3 = gif.trey_gif
                G3 = 'trey';
            }

            let choice = '';
            
            const kk = await message.channel.send({ embeds: [embed] , components: [BT1, BT2]});

            const start_KK = getCollectionButton(kk, CDT);

            let win = false;

            start_KK.on('end', () =>{
                if(!win){
                    kk.edit({ embeds: [embed] , components: []});
                    start_KK.stop();
                    return;
                }else{
                    start_KK.stop();
                    return;
                }
            });

            start_KK.on('collect', async(interaction)=>{
                if (interaction.member.user.id != user.id){
                    await interaction.reply({ content: 'you are not hoster!', ephemeral: true });
                    await userData.save();
                    return;
                }

                const userData = await getUser(user.id);

                let pick;
                if(interaction.customId == 'kla'){
                    win = true;
                    choice = 'kla';
                    pick = gif.KK_pick_kla;
                }
                if(interaction.customId == 'klok'){
                    win = true;
                    choice = 'klok';
                    pick = gif.KK_pick_klok;
                }
                if(interaction.customId == 'morn'){
                    win = true;
                    choice = 'morn';
                    pick = gif.KK_pick_morn;
                }
                if(interaction.customId == 'bongKorng'){
                    win = true;
                    choice = 'bongKorng';
                    pick = gif.KK_pick_bongKorng;
                }
                if(interaction.customId == 'kdam'){
                    win = true;
                    choice = 'kdam';
                    pick = gif.KK_pick_kdam;
                }
                if(interaction.customId == 'trey'){
                    win = true;
                    choice = 'trey';
                    pick = gif.KK_pick_trey;
                }

                const coo = advanceEmbed(`Dealer ${gif.dealer_gif} **Spin**: | ${gif.kk_spin_gif} ${gif.kk_spin_gif} ${gif.kk_spin_gif} |\n Bet! ${gif.cash} **${amount.toLocaleString()}**`, pick, `🔢 ~ game in Process`, user, 'Blue');

                kk.edit({ embeds: [coo], components: [] });
                await sleep(5000);

                if(choice == G1 || choice == G2 ||choice == G3){
                    let winKK = 1;
                    if(choice == G1){
                        winKK += 1;
                    }
                    if(choice == G2){
                        winKK += 1;
                    }
                    if(choice == G3){
                        winKK += 1;
                    }

                    const winCash = amount*winKK;
                    userData.balance += winCash;

                    const result = advanceEmbed(`Dealer ${gif.dealer_gif} **Jenh**: | ${D1} ${D2} ${D3} |\n Won! ${gif.cash} **${winCash.toLocaleString()}**`, pick, `You win your choise is ${choice}`, user, 'Green');

                    kk.edit({ embeds: [result] , components: []});
                }else{

                    const result = advanceEmbed(`Dealer ${gif.dealer_gif} **Jenh**: | ${D1} ${D2} ${D3} |\n Lose ${gif.cash} ${amount.toLocaleString()}`, pick, `You lose your choise is ${choice}`, user, 'Red');

                    kk.edit({ embeds: [result] , components: []});
                }
                await userData.save();
                return;
            });
        }catch(error){
            console.log(`kla klok error ${error}`);
        }
    },
};