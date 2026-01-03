const { SimpleEmbed, getUser, gif, sym, getRandomInt, cooldown } = require('../../functioon/function');

const cooldowns = new Map();
let CDT = 25_000;
var getId = [];
var cdId = [];
var prem = [];

module.exports = {
    name: 'trade',
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

            if(args[0] == `all`){

                if((userData.inventory.stone) <= 0 && (userData.inventory.gold) <= 0 && (userData.inventory.diamond) <= 0) return message.reply({ embeds: [SimpleEmbed(`<@${user.id}> You don't have any ${gif.stone_gif},${gif.gold_gif},${gif.diamond_gif}!`)] });

                const allStone = userData.inventory.stone;
                const priceStone = getRandomInt(100, 200);
                const getStone = allStone * priceStone;

                const allGold = userData.inventory.gold;
                const priceGold = getRandomInt(300, 400);
                const getGold = allGold * priceGold;

                const allDiamond = userData.inventory.diamond;
                const priceDiamond = getRandomInt(600, 1000);
                const getDiamond = allDiamond * priceDiamond;

                const allGet = getStone + getGold + getDiamond;

                userData.balance += allGet;
                userData.inventory.stone -= allStone;
                userData.inventory.gold -= allGold;
                userData.inventory.diamond -= allDiamond;

                message.channel.send({ embeds: [SimpleEmbed(`<@${user.id}> You sold ${gif.stone_gif}**x${allStone}**, ${gif.gold_gif}**x${allGold}**, ${gif.diamond_gif}**x${allDiamond}** and get ${gif.cash} **${allGet.toLocaleString()}**$`)] });

                await userData.save();
                return;
            }

            const id = parseInt(args[0]);

            if(id == 1){
                if(userData.inventory.stone <= 0){
                    message.reply({ embeds: [SimpleEmbed(`<@${user.id}> You don't have any ${gif.stone_gif}!`)] });
                    await userData.save();
                    return;
                };
                const allStone = userData.inventory.stone;
                const price = 500;
                const get = allStone * price;

                userData.balance += get;
                userData.inventory.stone -= allStone;

                message.channel.send({ embeds: [SimpleEmbed(`<@${user.id}> You sold ${gif.stone_gif}**x${allStone}** and get ${gif.cash} **${get.toLocaleString()}**$`)] });
                await userData.save();
                return;
            }
            if(id == 2){
                if(userData.inventory.gold <= 0){
                    message.reply({ embeds: [SimpleEmbed(`<@${user.id}> You don't have any ${gif.gold_gif}!`)] });
                    await userData.save();
                    return;
                }

                const allGold = userData.inventory.gold;
                const price = 1000;
                const get = allGold * price;

                userData.balance += get;
                userData.inventory.gold -= allGold;

                message.channel.send({ embeds: [SimpleEmbed(`<@${user.id}> You sold ${gif.gold_gif}**x${allGold}** and get ${gif.cash} **${get.toLocaleString()}**$`)] });
                await userData.save();
                return;
            }
            if(id == 3){
                if(userData.inventory.diamond <= 0){
                    message.reply({ embeds: [SimpleEmbed(`<@${user.id}> You don't have any ${gif.diamond_gif}!`)] });
                    await userData.save();
                    return;
                }

                const allDiamond = userData.inventory.diamond;
                const price = 2000;
                const get = allDiamond * price;

                userData.balance += get;
                userData.inventory.diamond -= allDiamond;

                message.channel.send({ embeds: [SimpleEmbed(`<@${user.id}> You sold ${gif.diamond_gif}**x${allDiamond}** and get ${gif.cash} **${get.toLocaleString()}**$`)] });
                await userData.save();
                return;
            }
            await userData.save();
            return;
        }catch(error){
            console.log(`trade error ${error}`);
        }
    },
};