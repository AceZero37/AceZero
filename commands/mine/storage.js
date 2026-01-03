const { SimpleEmbed, getUser, gif, syms, cooldown } = require('../../functioon/function');

const cooldowns = new Map();
let CDT = 25_000;
var getId = [];
var cdId = [];
var prem = [];

module.exports = {
    name: 'str',
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

            let sym = '';
            let per = '';

            let NLP = '';

            let BS = '';
            let BG = '';
            let BD = '';
            let BB = '';

            let box = '';
            let box_amount = '';

            let addDouble = '';
            let addDouble_amount = '';
            let BAD = '';

            let addRate = '';
            let addRate_amount = '';
            let BAR = '';

            let addPercen = '';
            let addPercen_amount = '';
            let BAP = '';

            let pickage = '';
            let pickage_percen = '';

            let stone = '';
            let stone_amount = '';

            let gold = '';
            let gold_amount = '';

            let diamond = '';
            let diamond_amount = '';

            if(userData.inventory.box > 0){
                box = `${gif.box_gif}: `;
                box_amount = userData.inventory.box;
                BB = '**';
            }

            let pick_KK = '';
            if(userData.inventory.pickage == true){
                pickage = `${gif.pickage_gif}, Percen: `;
                pickage_percen = userData.inventory.pickage_percen;
                sym = '%';
                per = '**';
                NLP = '\n';
                pick_KK = '`';
            }


            if(userData.tools.addDouble_amount >= 1){
                addDouble = `${gif.addDouble_gif}: `;
                addDouble_amount = userData.tools.addDouble_amount;
                BAD = '**';
            }
            if(userData.tools.addRate_amount >= 1){
                addRate = `${gif.addRate_gif}: `;
                addRate_amount = userData.tools.addRate_amount;
                BAR = '**';
            }
            if(userData.tools.addPercen_amount >= 1){
                addPercen = `${gif.addPercen_gif}: `;
                addPercen_amount = userData.tools.addPercen_amount;
                BAP = '**';
            }
            if(userData.inventory.stone > 0){
                stone = `${gif.stone_gif}: `;
                stone_amount = userData.inventory.stone;
                BS = '**';
            }
            if(userData.inventory.gold > 0){
                gold = `${gif.gold_gif}: `;
                gold_amount = userData.inventory.gold;
                BG = '**';
            }
            if(userData.inventory.diamond > 0){
                diamond = `${gif.diamond_gif}: `;
                diamond_amount = userData.inventory.diamond;
                BD = '**';
            }

            let fire = '';
            let fire_amount = '';
            let BF = '';
            if(userData.tools.fire_amount > 0){
                fire = `${gif.fire_gif}: `;
                fire_amount = userData.tools.fire_amount;
                BF = '**';
            }

            let zaz = '';
            let zaz_amount = '';
            let BZ = '';
            if(userData.tools.zaz_amount > 0){
                zaz = `${gif.zaz_gif}: `;
                zaz_amount = userData.tools.zaz_amount;
                BZ = '**';
            }

            let slot = [];
            let NLL3 = '';
            let NLL6 = '';
            let NLL9 = '';
            let ENL = '';

            let skip_stone = false;
            let skip_diamond = false;
            let skip_gold = false;

            let skip_addDouble = false;
            let skip_addRate = false;
            let skip_addPercen = false;
            let skip_fire = false;
            let skip_zaz = false;

            let skip_box = false;

            let NLL = 0;
            let K_K = '`'

            for(let i = 1; i<=9; i++){
                if(userData.tools.addDouble_amount > 0 && skip_addDouble == false){
                    slot[i] = `${addDouble}${BAD}${K_K}${addDouble_amount.toLocaleString()}${K_K}${BAD}`;
                    skip_addDouble = true;
                    NLL += 1;
                }
                else if(userData.tools.addRate_amount > 0 && skip_addRate == false){
                    slot[i] = `${addRate}${BAR}${K_K}${addRate_amount.toLocaleString()}${K_K}${BAR}`;
                    skip_addRate = true;
                    NLL += 1;
                }
                else if(userData.tools.addPercen_amount > 0 && skip_addPercen == false){
                    slot[i] = `${addPercen}${BAP}${K_K}${addPercen_amount.toLocaleString()}${K_K}${BAP}`;
                    skip_addPercen = true;
                    NLL += 1;
                }
                else if(userData.inventory.stone > 0 && skip_stone == false){
                    slot[i] = `${stone}${BS}${K_K}${stone_amount.toLocaleString()}${K_K}${BS}`;
                    skip_stone = true;
                    NLL += 1;
                }
                else if(userData.inventory.gold > 0 && skip_gold == false){
                    slot[i] = `${gold}${BG}${K_K}${gold_amount.toLocaleString()}${K_K}${BG}`;
                    skip_gold = true;
                    NLL += 1;
                }
                else if(userData.inventory.diamond > 0 && skip_diamond == false){
                    slot[i] = `${diamond}${BD}${K_K}${diamond_amount.toLocaleString()}${K_K}${BD}`;
                    skip_diamond = true;
                    NLL += 1;
                }else if(userData.inventory.box > 0 && skip_box == false){
                    slot[i] = `${box}${BB}${K_K}${box_amount.toLocaleString()}${K_K}${BB}`;
                    skip_box = true;
                    NLL += 1;
                }else if(userData.tools.fire_amount > 0 && skip_fire == false){
                    slot[i] = `${fire}${BF}${K_K}${fire_amount.toLocaleString()}${K_K}${BF}`
                    skip_fire = true;
                    NLL += 1;
                }else if(userData.tools.zaz_amount > 0 && skip_zaz == false){
                    slot[i] = `${zaz}${BZ}${K_K}${zaz_amount.toLocaleString()}${K_K}${BZ}`;
                    skip_zaz = true;
                    NLL += 1;
                }else{
                    slot[i] = '';
                }

                if(NLL == 3){
                    NLL3 = '\n';
                    ENL = '';
                }else if(NLL == 6){
                    NLL6 = '\n';
                    ENL = '';
                }else if(NLL == 9){
                    NLL9 = '\n';
                    ENL = '';
                }else{
                    ENL = '\n';
                }
            }

            message.channel.send({ embeds: [SimpleEmbed(`<@${user.id}>\n**=====Storage=====**\n${pickage}${per}${pick_KK}${pickage_percen.toLocaleString()}${pick_KK}${per}${sym}${NLP}${slot[1]}${slot[2]}${slot[3]}${NLL3}${slot[4]}${slot[5]}${slot[6]}${NLL6}${slot[7]}${slot[8]}${slot[9]}${NLL9}${ENL}**=================**`)] })

            await userData.save();
            return;
        }catch(error){
            console.log(`storage error ${error}`);
        }
    },
};