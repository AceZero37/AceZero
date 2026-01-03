const { sleep, gif, getUser, getRandomInt, toSuperscript, cooldown, SimpleEmbed } = require('../../functioon/function');

const cooldowns = new Map();
let CDT = 5_000;
var getId = [];
var cdId = [];
var prem = [];

// =======================
// RARITY CHANCES (editable)
const LEGENDARY_CHANCE = 10; // 1/10
const FABLED_CHANCE = 20;    // 1/20
const SPECIAL_CHANCE = 30;   // 1/30
// =======================


module.exports = {
    name: 'lootbox',
    aliases: ['lb'],
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
            const Gem = userData.gem;
            let amount = args[0];

            if(amount == 'all'){ amount = userData.gem['050'] }
            if(!parseInt(amount)){ amount = 1; }

            if(amount > 50){
                amount = 50;
            }

            if(userData.gem['050'] < amount || userData.gem['050'] <= 0){ message.reply({ embeds: [SimpleEmbed(`**Now <@${user.id}>**, you do not have this item!`)] }); return; };

            userData.gem['050'] -= amount;
            try{ await userData.save(); }catch(error){}

            const mgs = await message.channel.send({ embeds: [SimpleEmbed(`**Now <@${user.id}>** opening ${amount} lootboxes\n\n${gif.box_gem_opening_gif} all you got ...`)] });

            let gem = '';
            let gem_id = ''; // ADDED: Declaration was missing
            let messageLootbox = '';

            let allGems = new Array(amount);
            let selectGems = [];
            let amountGem = [];

            for(let i = 0; i < amount; i++){
                gem = '>'; // FIXED: Reset gem at the start of each iteration
                while(gem.charAt(0) != '<'){
                    const gem_ran = getRandomInt(gif.startId+1, gif.engId+1);
                    if(gem_ran >= 10 && gem_ran <= 99){
                        gem_id = `0${gem_ran}`;
                    }else{
                        gem_id = `${gem_ran}`;
                    }

                    // Skip item 100 (weapon crate)
                    if(gem_id == '100'){
                        gem = `>`;
                        continue; // ADDED: continue to retry
                    }

                    // SPECIAL (079-085) : 1/30 chance to succeed (fail -> retry)
                    if(gem_id == '079' || gem_id == '080' || gem_id == '081' || gem_id == '082' || gem_id == '083' || gem_id == '084' || gem_id == '085'){
                        const s_ran = getRandomInt(1, SPECIAL_CHANCE + 1);
                        if(s_ran == 1){
                            gem = `${gif[`${gem_id}`]}`;
                            allGems[i] = gem_id;
                        }else{
                            gem = `>`;
                        }
                    }
                    // LEGENDARY (056,070,077) : 1/10 chance
                    else if(gem_id == '056' || gem_id == '070' || gem_id == '077'){
                        const l_ran = getRandomInt(1, LEGENDARY_CHANCE + 1);
                        if(l_ran == 1){
                            gem = `${gif[`${gem_id}`]}`;
                            allGems[i] = gem_id;
                        }else{
                            gem = `>`;
                        }
                    }
                    // FABLED (057,071,078) : 1/20 chance
                    else if(gem_id == '057' || gem_id == '071' || gem_id == '078'){
                        const f_ran = getRandomInt(1, FABLED_CHANCE + 1);
                        if(f_ran == 1){
                            gem = `${gif[`${gem_id}`]}`;
                            allGems[i] = gem_id;
                        }else{
                            gem = `>`;
                        }
                    }
                    // Normal gems (including commons/uncommons/rare/epic/mythical non-special)
                    else{
                        gem = `${gif[`${gem_id}`]}`;
                        allGems[i] = gem_id;
                    }
                }
            }

            // Count normal gems and save
            for (let i = 0; i < allGems.length; i++) {
                if (!allGems[i]) continue;

                if (!selectGems.includes(allGems[i])) {
                    let getAmountGem = 0;
                    for (const gem of allGems) {
                        if (gem === allGems[i]) {
                            getAmountGem += 1;
                        }
                    }
                    selectGems.push(allGems[i]);
                    amountGem.push(getAmountGem);
                    if(!userData.gem[`${allGems[i]}`]) userData.gem[`${allGems[i]}`] = 0;
                    userData.gem[`${allGems[i]}`] += getAmountGem;
                }
            }
            
            let number = 0;
            for (const gem of selectGems) {
                let gemName = gif[gem];
                messageLootbox += `${gemName}${toSuperscript(amountGem[number], 1)}\u2006`;
                number += 1;
            }

            await sleep(3000);
            mgs.edit({ embeds: [SimpleEmbed(`**Now <@${user.id}>** opened ${amount} lootboxes\n\n${gif.box_gem_opened_gif} all you got **${messageLootbox}**`)] });
            try{ await userData.save(); }catch(error){}
            return;
        }catch(error){
            console.log(`lootbox error ${error}`);
        }
    },
};