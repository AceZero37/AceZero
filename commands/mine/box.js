const { SimpleEmbed, getUser, gif, prefix, sym, getRandomInt, sleep, cooldown } = require('../../functioon/function');

const cooldowns = new Map();
let CDT = 9_000;
var getId = [];
var cdId = [];
var prem = [];

module.exports = {
    name: 'box',
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

            if(userData.inventory.box <= 0){
                message.channel.send({ embeds: [SimpleEmbed(`<@${user.id}> you don't have any ${gif.box_gif}`)] });
                await userData.save();
                return;
            };

            let amount_item = parseInt(args[0]);

            if(message.content == `${prefix}box all`){
                amount_item = userData.inventory.box;
            }

            if(isNaN(amount_item)){
                amount_item = 1;
            }

            if(amount_item > userData.inventory.box){
                message.reply({ embeds: [SimpleEmbed(`<@${user.id}> ${gif.box_gif} not enough!`)] });
                await userData.save();
                return;
            }

            if(userData.inventory.box >= 1){

                let addPercen_amount = 0;
                let addRate_amount = 0;
                let addDouble_amount = 0;

                let addDouble = '';
                let addRate = '';
                let addPercen = '';
                let got_item = '';

                for(let i = 1; i <= amount_item; i++){
                    const ran = getRandomInt(1, 51);

                    if(ran <= 5 && ran >= 1){
                        addDouble_amount += 1;
                    }

                    if(ran <= 25  && ran >= 6){    
                        addRate_amount += 1;
                    }

                    if(ran <= 50  && ran >= 26){
                        addPercen_amount += 1;
                    }
                }

                if((addDouble_amount + addRate_amount + addPercen_amount) != amount_item){
                    message.reply({ embeds: [SimpleEmbed(`<@${user.id}> please open againt!!!`)] });
                    await userData.save();
                    return;
                }

                if(addDouble_amount == 0){
                    addDouble_amount = '';
                }
                if(addRate_amount == 0){
                    addRate_amount = '';
                }
                if(addPercen_amount == 0){
                    addPercen_amount = '';
                }

                let BP = '';
                let BR = '';
                let BD = '';

                if(addDouble_amount >= 1){
                    addDouble = `,${gif.addDouble_gif}x`;
                    BD = '**';
                    got_item = ' you got ';
                }
                if(addRate_amount >= 1){
                    addRate = `,${gif.addRate_gif}x`;
                    BR = '**';
                    got_item = ' you got ';
                }
                if(addPercen_amount >= 1){
                    addPercen = `${gif.addPercen_gif}x`;
                    BP = '**';
                    got_item = ' you got ';
                }

                const mgs = await message.channel.send({ embeds: [SimpleEmbed(`<@${user.id}> you open ${gif.boxopening_gif}x**${amount_item}**`)] });
                userData.inventory.box -= amount_item;

                await sleep(3000);
                mgs.edit({ embeds: [SimpleEmbed(`<@${user.id}> you opened ${gif.boxopened_gif}x**${amount_item}**${got_item}${addPercen}${BP}${addPercen_amount}${BP}${addRate}${BR}${addRate_amount}${BR}${addDouble}${BD}${addDouble_amount}${BD}!`)] });

                userData.tools.addDouble_amount += addDouble_amount;
                userData.tools.addRate_amount += addRate_amount;
                userData.tools.addPercen_amount += addPercen_amount;
                await userData.save();
                return;
            }
            await userData.save();
            return;
        }catch(error){
            console.log(`box error ${error}`); 
        }
    },
};