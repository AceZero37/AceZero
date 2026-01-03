const { SimpleEmbed, getUser, gif, cooldown, getRandomInt, sleep, sym } = require('../../functioon/function');

const cooldowns = new Map();
let CDT = 25_000;
var getId = [];
var cdId = [];
var prem = [];

module.exports = {
    name: 'mine',
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

            if(userData.inventory.pickage == false){
                message.reply({ embeds: [SimpleEmbed(`<@${user.id}> You don't have ${gif.pickage_gif}!`)] });
                await userData.save();
                return;
            }

            userData.inventory.pickage_percen -= 5;

            let addRate = '';
            let addRate_percen = '';
            let per_addRate = '';
            let K_K = '';

            let addDouble = '';
            let addDouble_percen = '';
            let per_addDouble = '';
            let K_L = '';

            let fire = '';
            let fire_percen = '';
            let per_fire = '';
            let K_F = '';

            let zaz = '';
            let zaz_percen = '';
            let per_zaz = '';
            let K_Z = '';

            if(userData.tools.zaz_bool == true && userData.tools.zaz_percen >= 1){
                zaz = `${gif.zaz_gif}:`;
                zaz_percen = userData.tools.zaz_percen;
                per_zaz = '%';
                K_Z = '`';
            }

            if(userData.tools.fire_bool == true && userData.tools.fire_percen >= 1){
                fire = `${gif.fire_gif}:`;
                fire_percen = userData.tools.fire_percen;
                per_fire = '%, ';
                K_F = '`';
            }

            if(userData.tools.addRate_Bool == true && userData.tools.addRate_percen >= 1){
                addRate = `${gif.addRate_gif}:`;
                addRate_percen = userData.tools.addRate_percen;
                per_addRate = '%, ';
                K_K = '`';
            }

            if(userData.tools.addDouble_Bool == true && userData.tools.addDouble_percen >= 1){
                addDouble = `${gif.addDouble_gif}:`;
                addDouble_percen = userData.tools.addDouble_percen;
                per_addDouble = '%, ';
                K_L = '`';
            }
            
            const mineMessage = await message.channel.send({ embeds: [SimpleEmbed(`<@${user.id}> ${zaz}${K_Z}${zaz_percen.toLocaleString()}${K_Z}${per_zaz}${fire}${K_F}${fire_percen.toLocaleString()}${K_F}${per_fire}${addRate}${K_K}${addRate_percen.toLocaleString()}${K_K}${per_addRate}${addDouble}${K_L}${addDouble_percen.toLocaleString()}${K_L}${per_addDouble}You mine...${gif.mining_gif}, with ${gif.pickage_gif}..`)] });
            await sleep(3000);
            
            const superLuck = getRandomInt(1, 101);
            const luckNumber = 50;

            let mines = getRandomInt(1, 51);
            const mine_luck = ( userData.tools.fire_luck + userData.tools.addrate_luck );
            const mine_per = userData.tools.mine_per;

            if(userData.tools.addDouble_Bool == true){

                if(userData.tools.addRate_percen <= 0 && userData.tools.addRate_Bool == true){
                    userData.tools.addRate_Bool = false;
                    userData.tools.addRate_percen = 0;
                    userData.tools.addrate_luck = 0;
                }
                if(userData.tools.addRate_Bool == true){
                    userData.tools.addRate_percen -= mine_per;
                }

                if(userData.tools.addDouble_percen <= 0){
                    userData.tools.addDouble_Bool = false;
                    userData.tools.addDouble_percen = 0;
                }
                if(userData.tools.addDouble_Bool == true){
                    userData.tools.addDouble_percen -= mine_per;
                }

                if(userData.tools.fire_percen <= 0 && userData.tools.fire_bool == true){
                    userData.tools.fire_bool = false;
                    userData.tools.fire_percen = 0;
                    userData.tools.fire_luck = 0;
                }
                if(userData.tools.fire_bool == true){
                    userData.tools.fire_percen -= mine_per;
                }

                if(userData.tools.zaz_percen <= 0 && userData.tools.zaz_bool == true){
                    userData.tools.zaz_bool = false;
                    userData.tools.zaz_percen = 0;
                    userData.tools.mine_per = 10;
                }
                if(userData.tools.zaz_bool == true){
                    userData.tools.zaz_percen -= mine_per;
                }

                let luck1 = 0;
                let addone = '';
                if(superLuck == luckNumber){
                    mines = 1;
                }
                if(mines <= 5){
                    luck1 = getRandomInt(1+mine_luck, 2+mine_luck);
                    addone = gif.diamond_gif;
                    userData.inventory.diamond += luck1;

                }else if(mines <= 25){
                    luck1 = getRandomInt(1+mine_luck, 3+mine_luck);
                    addone = gif.gold_gif;
                    userData.inventory.gold += luck1;

                }else if(mines <= 50){
                    luck1 = getRandomInt(1+mine_luck, 4+mine_luck);
                    addone = gif.stone_gif;
                    userData.inventory.stone += luck1;

                }

                let mines2 = getRandomInt(1, 51);
                let luck2 = 0;
                let addtwo = '';
                if(superLuck == luckNumber){
                    mines2 = 1;
                }
                if(mines2 <= 5){
                    luck2 = getRandomInt(1+mine_luck, 2+mine_luck);
                    addtwo = gif.diamond_gif;
                    userData.inventory.diamond += luck2;

                }else if(mines2 <= 25){
                    luck2 = getRandomInt(1+mine_luck, 3+mine_luck);
                    addtwo = gif.gold_gif;
                    userData.inventory.gold += luck2;


                }else if(mines2 <= 50){
                    luck2 = getRandomInt(1+mine_luck, 4+mine_luck);
                    addtwo = gif.stone_gif;
                    userData.inventory.stone += luck2;

                }

                let mines3 = getRandomInt(1, 51);
                let luck3 = 0;
                let addthree = '';
                if(superLuck == luckNumber){
                    mines3 = 1;
                }
                if(mines3 <= 5){
                    luck3 = getRandomInt(1+mine_luck, 2+mine_luck);
                    addthree = gif.diamond_gif;
                    userData.inventory.diamond += luck3;

                }else if(mines3 <= 25){
                    luck3 = getRandomInt(1+mine_luck, 3+mine_luck);
                    addthree = gif.gold_gif;
                    userData.inventory.gold += luck3;

                }else if(mines3 <= 50){
                    luck3 = getRandomInt(1+mine_luck, 4+mine_luck);
                    addthree = gif.stone_gif;
                    userData.inventory.stone += luck3;

                }

                mineMessage.edit({ embeds: [SimpleEmbed(`<@${user.id}> ${zaz}${K_Z}${zaz_percen.toLocaleString()}${K_Z}${per_zaz}${fire}${K_F}${fire_percen.toLocaleString()}${K_F}${per_fire}${addRate}${K_K}${addRate_percen.toLocaleString()}${K_K}${per_addRate}${addDouble}${K_L}${addDouble_percen.toLocaleString()}${K_L}${per_addDouble}You mined ${addone}**x${luck1}**,${addtwo}**x${luck2}**,${addthree}**x${luck3}**, with ${gif.pickage_gif}..`)] });

                if(userData.inventory.pickage_percen <= 0){
                    userData.inventory.pickage = false;
                    await userData.save();
                    message.reply({ embeds: [SimpleEmbed(`<@${user.id}> Your ${gif.pickage_gif} is Broken!!!`)] });
                    return;
                }

                await userData.save();
                return;
            }

            if(userData.tools.addRate_percen <= 0 && userData.tools.addRate_Bool == true){
                userData.tools.addRate_Bool = false;
                userData.tools.addRate_percen = 0;
                userData.tools.addrate_luck = 0;
            }

            if(userData.tools.addRate_Bool == true){
                userData.tools.addRate_percen -= mine_per;
            }

            if(userData.tools.fire_percen <= 0 && userData.tools.fire_bool == true){
                userData.tools.fire_bool = false;
                userData.tools.fire_percen = 0;
                userData.tools.fire_luck = 0;
            }
            if(userData.tools.fire_bool == true){
                userData.tools.fire_percen -= mine_per;
            }

            if(userData.tools.zaz_percen <= 0 && userData.tools.zaz_bool == true){
                userData.tools.zaz_bool = false;
                userData.tools.zaz_percen = 0;
                userData.tools.mine_per = 10;
            }
            if(userData.tools.zaz_bool == true){
                userData.tools.zaz_percen -= mine_per;
            }

            let luck = 0;
            let add = '';

            if(mines <= 5){
                luck = getRandomInt(1+mine_luck, 2+mine_luck);
                add = gif.diamond_gif;
                userData.inventory.diamond += luck;

            }else if(mines <= 25){
                luck = getRandomInt(1+mine_luck, 3+mine_luck);
                add = gif.gold_gif;
                userData.inventory.gold += luck;
        
            }else if(mines <= 50){
                luck = getRandomInt(1+mine_luck, 4+mine_luck);
                add = gif.stone_gif;
                userData.inventory.stone += luck;

            }

            await userData.save();

            mineMessage.edit({ embeds: [SimpleEmbed(`<@${user.id}> ${zaz}${K_Z}${zaz_percen.toLocaleString()}${K_Z}${per_zaz}${fire}${K_F}${fire_percen.toLocaleString()}${K_F}${per_fire}${addRate}${K_K}${addRate_percen.toLocaleString()}${K_K}${per_addRate}You mined ${add}**x${luck}**, with ${gif.pickage_gif}..`)] });

            if(userData.inventory.pickage_percen <= 0){
                userData.inventory.pickage = false;
                await userData.save();
                message.reply({ embeds: [SimpleEmbed(`<@${user.id}> Your ${gif.pickage_gif} is Broken!!!`)] });
                return;
            }
            return;
        }catch(error){
            console.log(`mine error ${error}`);
        }
    },
};