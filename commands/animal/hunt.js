const { sym, gif, getUser, getRandomInt, cooldown, SimpleEmbed, getAnimalIdByName, getAnimalNameByName } = require('../../functioon/function');
const moment = require('moment-timezone');

const cooldowns = new Map();
const CDT = 15_000;
var getId = [];
var cdId = [];
var prem = [];

module.exports = {
    name: 'h',
    async execute(client, message, args){
        try{
            const user = message.author;
            const userData = await getUser(user.id);

            if(userData.premium.premium_bool){
                if(!prem.includes(user.id)){
                    prem.push(user.id);
                }
            }
            
            const now = moment.tz('Asia/Phnom_Penh');
            const tomorrow = moment.tz('Asia/Phnom_Penh').add(1, 'day').startOf('day').hours(0);
            const timeUntilReset = tomorrow - now;
            const hours = Math.floor(timeUntilReset / (1000 * 60 * 60));
            const minutes = Math.floor((timeUntilReset % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeUntilReset % (1000 * 60)) / 1000);

            if(cooldown(user.id, getId, cdId, CDT, message, cooldowns, prem)){
                return;
            };
            
            if (userData.quest.hunt_point < 200) { 
                userData.quest.hunt_point += 1; 
            }
            
            if(userData.balance <= 0){ 
                // CHANGED: Plain text reply
                message.reply(`❌ <@${user.id}> **You don't have enough cash!**`); 
                return; 
            }
            
            userData.balance -= 5;
            
            // CHANGED: Plain text message
            const mgs = await message.channel.send(`🏹 <@${user.id}> is hunting...`);
            
            const Sat = userData.sat;
            const Gem = userData.gem;
            let chance = userData.gem.lucky_Gem_addChance || 1;
            if(chance > 1){ chance = chance * 8; }
            let higher_rank_animal = true;
            let getAnimal = 0;
            let sat = '';
            let rank = '';
            let gainAnimalXp = 0;
            let amount_of_get = 1;
            let cashBonus = 0;

            let messageSat = ``;

            // Check if any gems are equipped
            if(!Gem.hunt_Gem_equipe && !Gem.empowering_Gem_equipe && !Gem.lucky_Gem_equipe && !Gem.special_Gem_equipe){
                // CHANGED: Added > blockquote for style
                messageSat = `> **Now <@${user.id}>**, You caught a `;
            }else{
                // Hunt Gem handling
                if(Gem.hunt_Gem_equipe != '' && Gem.hunt_Gem_addAnimal < 0){ 
                    Gem.hunt_Gem_equipe = ''; 
                    await userData.save(); 
                }
                let show_hunt_gem = '';
                if(Gem.hunt_Gem_equipe){
                    show_hunt_gem = `${gif[`${Gem.hunt_Gem_equipe}`]}${sym}[${Gem.hunt_Gem_percen}/${gif[`${Gem.hunt_Gem_equipe}_main_percen`]}]${sym} `;
                    if(Gem.hunt_Gem_percen < 0){ 
                        Gem.hunt_Gem_equipe = ''; 
                        Gem.hunt_Gem_addAnimal = 1; 
                    }else{ 
                        Gem.hunt_Gem_percen -= gif[`${Gem.hunt_Gem_equipe}_minus`]; 
                    }
                }

                // Empowering Gem handling
                if(Gem.empowering_Gem_equipe != '' && Gem.empowering_Gem_timeAniaml < 0){ 
                    Gem.empowering_Gem_equipe = ''; 
                    await userData.save(); 
                }
                let show_empowering_gem = '';
                if(Gem.empowering_Gem_equipe){
                    show_empowering_gem = `${gif[`${Gem.empowering_Gem_equipe}`]}${sym}[${Gem.empowering_Gem_percen}/${gif[`${Gem.empowering_Gem_equipe}_main_percen`]}]${sym} `;
                    if(Gem.empowering_Gem_percen < 0){ 
                        Gem.empowering_Gem_equipe = ''; 
                        Gem.empowering_Gem_timeAniaml = 1; 
                    }else{ 
                        Gem.empowering_Gem_percen -= gif[`${Gem.empowering_Gem_equipe}_minus`]; 
                    }
                }

                // Lucky Gem handling
                if(Gem.lucky_Gem_equipe != '' && Gem.lucky_Gem_addChance < 0){ 
                    Gem.lucky_Gem_equipe = ''; 
                    await userData.save(); 
                }
                let show_lucky_gem = ''
                if(Gem.lucky_Gem_equipe){
                    show_lucky_gem = `${gif[`${Gem.lucky_Gem_equipe}`]}${sym}[${Gem.lucky_Gem_percen}/${gif[`${Gem.lucky_Gem_equipe}_main_percen`]}]${sym} `;
                    if(Gem.lucky_Gem_percen < 0){ 
                        Gem.lucky_Gem_equipe = ''; 
                        Gem.lucky_Gem_addChance = 1; 
                    }else{ 
                        Gem.lucky_Gem_percen -= gif[`${Gem.lucky_Gem_equipe}_minus`]; 
                    }
                }

                // Special Gem handling - CASH BONUS GEM
                if(Gem.special_Gem_equipe != '' && Gem.special_gem_addChance <= 0){ 
                    Gem.special_Gem_equipe = ''; 
                    await userData.save(); 
                }
                let show_special_gem = '';
                if(Gem.special_Gem_equipe){
                    show_special_gem = `${gif[`${Gem.special_Gem_equipe}`]}${sym}[${Gem.special_Gem_percen}/${gif[`${Gem.special_Gem_equipe}_main_percen`]}]${sym}`;
                    cashBonus = Gem.special_gem_addChance; // Set the cash bonus amount
                    if(Gem.special_Gem_percen < 0){ 
                        Gem.special_Gem_equipe = ''; 
                        Gem.special_gem_addChance = 0; 
                    }else{ 
                        Gem.special_Gem_percen -= gif[`${Gem.special_Gem_equipe}_minus`]; 
                    }
                }

                // Calculate total animals to get
                amount_of_get = (Gem.hunt_Gem_addAnimal || 1) * (Gem.empowering_Gem_timeAniaml || 1);
                // CHANGED: Added > blockquote for style
                messageSat = `> **Now <@${user.id}>**, you using gems ${show_hunt_gem}${show_empowering_gem}${show_lucky_gem}${show_special_gem}!\n> You got animal like: `;
            }

            // Final cleanup for depleted gems
            if(Gem.hunt_Gem_percen < 0){ Gem.hunt_Gem_equipe = ''; Gem.hunt_Gem_addAnimal = 1; }
            if(Gem.empowering_Gem_percen < 0){ Gem.empowering_Gem_equipe = ''; Gem.empowering_Gem_timeAniaml = 1; }
            if(Gem.lucky_Gem_percen < 0){ Gem.lucky_Gem_equipe = ''; Gem.lucky_Gem_addChance = 1; }
            if(Gem.special_Gem_percen < 0){ Gem.special_Gem_equipe = ''; Gem.special_gem_addChance = 0; }

            // Anime collection hunt tracking
            if(userData.sat.jujutsu_kaisen.jjk_bool || userData.sat.jujutsu_kaisen.jjk_hunt > 0){
                if(userData.sat.jujutsu_kaisen.jjk_hunt <= 0){
                    userData.sat.jujutsu_kaisen.jjk_bool = false;
                    userData.sat.jujutsu_kaisen.jjk_hunt = 0;
                }
                userData.sat.jujutsu_kaisen.jjk_hunt -= 1; 
            }

            if(userData.sat.one_piece.op_bool || userData.sat.one_piece.op_hunt > 0){
                if(userData.sat.one_piece.op_hunt <= 0){
                    userData.sat.one_piece.op_bool = false;
                    userData.sat.one_piece.op_hunt = 0;
                }
                userData.sat.one_piece.op_hunt -= 1; 
            }

            if(userData.sat.one_punch_man.opm_bool || userData.sat.one_punch_man.opm_hunt > 0){
                if(userData.sat.one_punch_man.opm_hunt <= 0){
                    userData.sat.one_punch_man.opm_bool = false;
                    userData.sat.one_punch_man.opm_hunt = 0;
                }
                userData.sat.one_punch_man.opm_hunt -= 1; 
            }

            if(userData.sat.demon_slayer.ds_bool || userData.sat.demon_slayer.ds_hunt > 0){
                if(userData.sat.demon_slayer.ds_hunt <= 0){
                    userData.sat.demon_slayer.ds_bool = false;
                    userData.sat.demon_slayer.ds_hunt = 0;
                }
                userData.sat.demon_slayer.ds_hunt -= 1; 
            }

            if(userData.sat.collection_girl.cg_bool || userData.sat.collection_girl.cg_hunt > 0){
                if(userData.sat.collection_girl.cg_hunt <= 0){
                    userData.sat.collection_girl.cg_bool = false;
                    userData.sat.collection_girl.cg_hunt = 0;
                }
                userData.sat.collection_girl.cg_hunt -= 1; 
            }

            if(userData.sat.naruto.nt_bool || userData.sat.naruto.nt_hunt > 0){
                if(userData.sat.naruto.nt_hunt <= 0){
                    userData.sat.naruto.nt_bool = false;
                    userData.sat.naruto.nt_hunt = 0;
                }
                userData.sat.naruto.nt_hunt -= 1; 
            }

            if(userData.sat.hanuman.nm_bool || userData.sat.hanuman.nm_hunt > 0){
                if(userData.sat.hanuman.nm_hunt <= 0){
                    userData.sat.hanuman.nm_bool = false;
                    userData.sat.hanuman.nm_hunt = 0;
                }
                userData.sat.hanuman.nm_hunt -= 1; 
            }

            if(userData.sat.mashle.ms_bool || userData.sat.mashle.ms_hunt > 0){
                if(userData.sat.mashle.ms_hunt <= 0){
                    userData.sat.mashle.ms_bool = false;
                    userData.sat.mashle.ms_hunt = 0;
                }
                userData.sat.mashle.ms_hunt -= 1; 
            }

            if(userData.sat.chainsaw_man.cm_bool || userData.sat.chainsaw_man.cm_hunt > 0){
                if(userData.sat.chainsaw_man.cm_hunt <= 0){
                    userData.sat.chainsaw_man.cm_bool = false;
                    userData.sat.chainsaw_man.cm_hunt = 0;
                }
                userData.sat.chainsaw_man.cm_hunt -= 1; 
            }

            if(userData.sat.kaiju_no_8.kn8_bool || userData.sat.kaiju_no_8.kn8_hunt > 0){
                if(userData.sat.kaiju_no_8.kn8_hunt <= 0){
                    userData.sat.kaiju_no_8.kn8_bool = false;
                    userData.sat.kaiju_no_8.kn8_hunt = 0;
                }
                userData.sat.kaiju_no_8.kn8_hunt -= 1; 
            }

            // Hunt loop for each animal
            let top_ran = 0;
            for(let i = 1; i <= amount_of_get; i++){
                const luck_hunt = getRandomInt(1, 101);
                if(luck_hunt == 1){
                    top_ran = 8;
                }else if(luck_hunt >= 2 && luck_hunt <= 5){
                    top_ran = 7;
                }else if(luck_hunt >= 6 && luck_hunt <= 10){
                    top_ran = 6;
                }else if(luck_hunt >= 11 && luck_hunt <= 30){
                    top_ran = 5;
                }else if(luck_hunt >= 31 && luck_hunt <= 60){
                    top_ran = 4;
                }else if(luck_hunt >= 61 && luck_hunt <= 100){
                    top_ran = 3;
                }

                // Rank upgrade chances with lucky gem bonus
                if(top_ran == 4){
                    const e_ran = getRandomInt(1, 67-(chance*2));
                    if(e_ran == 1 && higher_rank_animal == true){
                        getAnimal = 4;
                        higher_rank_animal = false;
                    }else{
                        getAnimal = 3;
                    }
                }else if(top_ran == 5){
                    const m_ran = getRandomInt(1, 127-(chance*2));
                    if(m_ran == 1  && higher_rank_animal == true){
                        getAnimal = 5;
                        higher_rank_animal = false;
                    }else{
                        getAnimal = 3;
                    }
                }else if(top_ran == 6){
                    const l_ran = getRandomInt(1, 227-(chance*2));
                    if(l_ran == 1 && higher_rank_animal == true){
                        getAnimal = 6;
                        higher_rank_animal = false;
                    }else{
                        getAnimal = 3;
                    }
                }else if(top_ran == 7){
                    const g_ran = getRandomInt(1, 427-(chance*2));
                    if(g_ran == 1 && higher_rank_animal == true){
                        getAnimal = 7;
                        higher_rank_animal = false;
                    }else{
                        getAnimal = 3;
                    }
                }else if(top_ran == 8){
                    const f_ran = getRandomInt(1, 627-(chance*2));
                    if(f_ran == 1 && higher_rank_animal == true){
                        getAnimal = 8;
                        higher_rank_animal = false;
                    }else{
                        getAnimal = 3;
                    }
                }else{
                    getAnimal = 3;
                }

                // Process animal catches for rank 3 and below
                if(getAnimal <= 3){
                    const special_ran = getRandomInt(1, 2000);
                    if(special_ran == 1){
                        higher_rank_animal = false;
                        gainAnimalXp += 250;
                        rank = `**special** ${gif.animal_rank_9}`;
                        const sat_ran = getRandomInt(1, 11);
                        if(sat_ran == 1){
                            sat = gif.rank_9_1;
                            userData.sat.sat_9_1 += 1;
                            userData.sat.sat_9_1_h += 1;
                        }else if(sat_ran == 2){
                            sat = gif.rank_9_2;
                            userData.sat.sat_9_2 += 1;
                            userData.sat.sat_9_2_h += 1;
                        }else if(sat_ran == 3){
                            sat = gif.rank_9_3;
                            userData.sat.sat_9_3 += 1;
                            userData.sat.sat_9_3_h += 1;
                        }else if(sat_ran == 4){
                            sat = gif.rank_9_4;
                            userData.sat.sat_9_4 += 1;
                            userData.sat.sat_9_4_h += 1;
                        }else if(sat_ran == 5){
                            sat = gif.rank_9_5;
                            userData.sat.sat_9_5 += 1;
                            userData.sat.sat_9_5_h += 1;
                        }else if(sat_ran == 6){
                            sat = gif.rank_9_6;
                            userData.sat.sat_9_6 += 1;
                            userData.sat.sat_9_6_h += 1;
                        }else if(sat_ran == 7){
                            sat = gif.rank_9_7;
                            userData.sat.sat_9_7 += 1;
                            userData.sat.sat_9_7_h += 1;
                        }else if(sat_ran == 8){
                            sat = gif.rank_9_8;
                            userData.sat.sat_9_8 += 1;
                            userData.sat.sat_9_8_h += 1;
                        }else if(sat_ran == 9){
                            sat = gif.rank_9_9;
                            userData.sat.sat_9_9 += 1;
                            userData.sat.sat_9_9_h += 1;
                        }else if(sat_ran == 10){
                            sat = gif.rank_9_10;
                            userData.sat.sat_9_10 += 1;
                            userData.sat.sat_9_10_h += 1;
                        }
                    }else if(special_ran > 800 && userData.sat.patreon.patreon_bool == true && higher_rank_animal == true){
                        const patreon_ran_luck = getRandomInt(1, 10);
                        if((patreon_ran_luck == 1 && userData.sat.patreon.custom_patreon_left > 0) || userData.sat.patreon.patreon_left == 0){
                            higher_rank_animal = false;
                            gainAnimalXp += 25000;
                            rank = `**Custom Patreon** ${gif.animal_rank_10}`;
                            userData.sat.patreon.custom_patreon_left -= 1;
                            const custom_patreon = getRandomInt(1, 24);
                            if(custom_patreon == 1){
                                sat = gif.rank_10_1;
                                userData.sat.sat_10_1 += 1;
                                userData.sat.sat_10_1_h += 1;
                            }else if(custom_patreon == 2){
                                sat = gif.rank_10_2;
                                userData.sat.sat_10_2 += 1;
                                userData.sat.sat_10_2_h += 1;
                            }else if(custom_patreon == 3){
                                sat = gif.rank_10_3;
                                userData.sat.sat_10_3 += 1;
                                userData.sat.sat_10_3_h += 1;
                            }else if(custom_patreon == 4){
                                sat = gif.rank_10_4;
                                userData.sat.sat_10_4 += 1;
                                userData.sat.sat_10_4_h += 1;
                            }else if(custom_patreon == 5){
                                sat = gif.rank_10_5;
                                userData.sat.sat_10_5 += 1;
                                userData.sat.sat_10_5_h += 1;
                            }else if(custom_patreon == 6){
                                sat = gif.rank_10_6;
                                userData.sat.sat_10_6 += 1;
                                userData.sat.sat_10_6_h += 1;
                            }else if(custom_patreon == 7){
                                sat = gif.rank_10_7;
                                userData.sat.sat_10_7 += 1;
                                userData.sat.sat_10_7_h += 1;
                            }else if(custom_patreon == 8){
                                sat = gif.rank_10_8;
                                userData.sat.sat_10_8 += 1;
                                userData.sat.sat_10_8_h += 1;
                            }else if(custom_patreon == 9){
                                sat = gif.rank_10_9;
                                userData.sat.sat_10_9 += 1;
                                userData.sat.sat_10_9_h += 1;
                            }else if(custom_patreon == 10){
                                sat = gif.rank_10_10;
                                userData.sat.sat_10_10 += 1;
                                userData.sat.sat_10_10_h += 1;
                            }else if(custom_patreon == 11){
                                sat = gif.rank_10_11;
                                userData.sat.sat_10_11 += 1;
                                userData.sat.sat_10_11_h += 1;
                            }else if(custom_patreon == 12){
                                sat = gif.rank_10_12;
                                userData.sat.sat_10_12 += 1;
                                userData.sat.sat_10_12_h += 1;
                            }else if(custom_patreon == 13){
                                sat = gif.rank_10_13;
                                userData.sat.sat_10_13 += 1;
                                userData.sat.sat_10_13_h += 1;
                            }else if(custom_patreon == 14){
                                sat = gif.rank_10_14;
                                userData.sat.sat_10_14 += 1;
                                userData.sat.sat_10_14_h += 1;
                            }else if(custom_patreon == 15){
                                sat = gif.rank_10_15;
                                userData.sat.sat_10_15 += 1;
                                userData.sat.sat_10_15_h += 1;
                            }else if(custom_patreon == 16){
                                sat = gif.rank_10_16;
                                userData.sat.sat_10_16 += 1;
                                userData.sat.sat_10_16_h += 1;
                            }else if(custom_patreon == 17){
                                sat = gif.rank_10_17;
                                userData.sat.sat_10_17 += 1;
                                userData.sat.sat_10_17_h += 1;
                            }else if(custom_patreon == 18){
                                sat = gif.rank_10_18;
                                userData.sat.sat_10_18 += 1;
                                userData.sat.sat_10_18_h += 1;
                            }else if(custom_patreon == 19){
                                sat = gif.rank_10_19;
                                userData.sat.sat_10_19 += 1;
                                userData.sat.sat_10_19_h += 1;
                            }else if(custom_patreon == 20){
                                sat = gif.rank_10_20;
                                userData.sat.sat_10_20 += 1;
                                userData.sat.sat_10_20_h += 1;
                            }else if(custom_patreon == 21){
                                sat = gif.rank_10_21;
                                userData.sat.sat_10_21 += 1;
                                userData.sat.sat_10_21_h += 1;
                            }else if(custom_patreon == 22){
                                sat = gif.rank_10_22;
                                userData.sat.sat_10_22 += 1;
                                userData.sat.sat_10_22_h += 1;
                            }else if(custom_patreon == 23){
                                sat = gif.rank_10_23;
                                userData.sat.sat_10_23 += 1;
                                userData.sat.sat_10_23_h += 1;
                            }

                        }else if(userData.sat.patreon.patreon_left > 0){
                            higher_rank_animal = false;
                            gainAnimalXp += 500;
                            rank = `**Patreon** ${gif.animal_rank_11}`;
                            userData.sat.patreon.patreon_left -= 1;
                            const patreon = getRandomInt(1, 6);
                            if(patreon == 1){
                                sat = gif.rank_11_1;
                                userData.sat.sat_11_1 += 1;
                                userData.sat.sat_11_1_h += 1;
                            }else if(patreon == 2){
                                sat = gif.rank_11_2;
                                userData.sat.sat_11_2 += 1;
                                userData.sat.sat_11_2_h += 1;
                            }else if(patreon == 3){
                                sat = gif.rank_11_3;
                                userData.sat.sat_11_3 += 1;
                                userData.sat.sat_11_3_h += 1;
                            }else if(patreon == 4){
                                sat = gif.rank_11_4;
                                userData.sat.sat_11_4 += 1;
                                userData.sat.sat_11_4_h += 1;
                            }else if(patreon == 5){
                                sat = gif.rank_11_5;
                                userData.sat.sat_11_5 += 1;
                                userData.sat.sat_11_5_h += 1;
                            }
                        }
                        if(userData.sat.patreon.patreon_left <= 0 && userData.sat.patreon.custom_patreon_left <= 0){
                            userData.sat.patreon.patreon_bool = false;
                            userData.sat.patreon.custom_patreon_left = 0;
                            userData.sat.patreon.patreon_left = 0;
                        }

                    }else if(special_ran <= 20 && special_ran > 0 && userData.sat.kaiju_no_8.kn8_bool == true && higher_rank_animal == true){
                        higher_rank_animal = false;
                        gainAnimalXp += 50000;
                        rank = `**Kaiju no 8** ${gif.animal_rank_25}`;
                        const kn8 = getRandomInt(1, 6);
                        if(kn8 == 1){
                            sat = gif.rank_25_1;
                            userData.sat.sat_25_1 += 1;
                            userData.sat.sat_25_1_h += 1;
                        }else if(kn8 == 2){
                            sat = gif.rank_25_2;
                            userData.sat.sat_25_2 += 1;
                            userData.sat.sat_25_2_h += 1;
                        }else if(kn8 == 3){
                            sat = gif.rank_25_3;
                            userData.sat.sat_25_3 += 1;
                            userData.sat.sat_25_3_h += 1;
                        }else if(kn8 == 4){
                            sat = gif.rank_25_4;
                            userData.sat.sat_25_4 += 1;
                            userData.sat.sat_25_4_h += 1;
                        }else if(kn8 == 5){
                            sat = gif.rank_25_5;
                            userData.sat.sat_25_5 += 1;
                            userData.sat.sat_25_5_h += 1;
                        }
                    }else if(special_ran <= 20 && special_ran > 0 && userData.sat.chainsaw_man.cm_bool == true && higher_rank_animal == true){
                        higher_rank_animal = false;
                        gainAnimalXp += 50000;
                        rank = `**Chainsaw Man** ${gif.animal_rank_23}`;
                        const cm = getRandomInt(1, 6);
                        if(cm == 1){
                            sat = gif.rank_23_1;
                            userData.sat.sat_23_1 += 1;
                            userData.sat.sat_23_1_h += 1;
                        }else if(cm == 2){
                            sat = gif.rank_23_2;
                            userData.sat.sat_23_2 += 1;
                            userData.sat.sat_23_2_h += 1;
                        }else if(cm == 3){
                            sat = gif.rank_23_3;
                            userData.sat.sat_23_3 += 1;
                            userData.sat.sat_23_3_h += 1;
                        }else if(cm == 4){
                            sat = gif.rank_23_4;
                            userData.sat.sat_23_4 += 1;
                            userData.sat.sat_23_4_h += 1;
                        }else if(cm == 5){
                            sat = gif.rank_23_5;
                            userData.sat.sat_23_5 += 1;
                            userData.sat.sat_23_5_h += 1;
                        }
                    }else if(special_ran <= 20 && special_ran > 0 && userData.sat.mashle.ms_bool == true && higher_rank_animal == true){
                        higher_rank_animal = false;
                        gainAnimalXp += 50000;
                        rank = `**Mashle** ${gif.animal_rank_18}`;
                        const ms = getRandomInt(1, 6);
                        if(ms == 1){
                            sat = gif.rank_18_1;
                            userData.sat.sat_18_1 += 1;
                            userData.sat.sat_18_1_h += 1;
                        }else if(ms == 2){
                            sat = gif.rank_18_2;
                            userData.sat.sat_18_2 += 1;
                            userData.sat.sat_18_2_h += 1;
                        }else if(ms == 3){
                            sat = gif.rank_18_3;
                            userData.sat.sat_18_3 += 1;
                            userData.sat.sat_18_3_h += 1;
                        }else if(ms == 4){
                            sat = gif.rank_18_4;
                            userData.sat.sat_18_4 += 1;
                            userData.sat.sat_18_4_h += 1;
                        }else if(ms == 5){
                            sat = gif.rank_18_5;
                            userData.sat.sat_18_5 += 1;
                            userData.sat.sat_18_5_h += 1;
                        }
                    }else if(special_ran <= 20 && special_ran > 0 && userData.sat.hanuman.nm_bool == true && higher_rank_animal == true){
                        higher_rank_animal = false;
                        gainAnimalXp += 50000;
                        rank = `**Hanuman** ${gif.animal_rank_22}`;
                        const nm = getRandomInt(1, 6);
                        if(nm == 1){
                            sat = gif.rank_22_1;
                            userData.sat.sat_22_1 += 1;
                            userData.sat.sat_22_1_h += 1;
                        }else if(nm == 2){
                            sat = gif.rank_22_2;
                            userData.sat.sat_22_2 += 1;
                            userData.sat.sat_22_2_h += 1;
                        }else if(nm == 3){
                            sat = gif.rank_22_3;
                            userData.sat.sat_22_3 += 1;
                            userData.sat.sat_22_3_h += 1;
                        }else if(nm == 4){
                            sat = gif.rank_22_4;
                            userData.sat.sat_22_4 += 1;
                            userData.sat.sat_22_4_h += 1;
                        }else if(nm == 5){
                            sat = gif.rank_22_5;
                            userData.sat.sat_22_5 += 1;
                            userData.sat.sat_22_5_h += 1;
                        }
                    }else if(special_ran <= 20 && special_ran > 0 && userData.sat.naruto.nt_bool == true && higher_rank_animal == true){
                        higher_rank_animal = false;
                        gainAnimalXp += 50000;
                        rank = `**Naruto** ${gif.animal_rank_21}`;
                        const nt = getRandomInt(1, 6);
                        if(nt == 1){
                            sat = gif.rank_21_1;
                            userData.sat.sat_21_1 += 1;
                            userData.sat.sat_21_1_h += 1;
                        }else if(nt == 2){
                            sat = gif.rank_21_2;
                            userData.sat.sat_21_2 += 1;
                            userData.sat.sat_21_2_h += 1;
                        }else if(nt == 3){
                            sat = gif.rank_21_3;
                            userData.sat.sat_21_3 += 1;
                            userData.sat.sat_21_3_h += 1;
                        }else if(nt == 4){
                            sat = gif.rank_21_4;
                            userData.sat.sat_21_4 += 1;
                            userData.sat.sat_21_4_h += 1;
                        }else if(nt == 5){
                            sat = gif.rank_21_5;
                            userData.sat.sat_21_5 += 1;
                            userData.sat.sat_21_5_h += 1;
                        }
                    }else if(special_ran <= 20 && special_ran > 0 && userData.sat.collection_girl.cg_bool == true && higher_rank_animal == true){
                        higher_rank_animal = false;
                        gainAnimalXp += 50000;
                        rank = `**Collection Girl** ${gif.animal_rank_20}`;
                        const cg = getRandomInt(1, 6);
                        if(cg == 1){
                            sat = gif.rank_20_1;
                            userData.sat.sat_20_1 += 1;
                            userData.sat.sat_20_1_h += 1;
                        }else if(cg == 2){
                            sat = gif.rank_20_2;
                            userData.sat.sat_20_2 += 1;
                            userData.sat.sat_20_2_h += 1;
                        }else if(cg == 3){
                            sat = gif.rank_20_3;
                            userData.sat.sat_20_3 += 1;
                            userData.sat.sat_20_3_h += 1;
                        }else if(cg == 4){
                            sat = gif.rank_20_4;
                            userData.sat.sat_20_4 += 1;
                            userData.sat.sat_20_4_h += 1;
                        }else if(cg == 5){
                            sat = gif.rank_20_5;
                            userData.sat.sat_20_5 += 1;
                            userData.sat.sat_20_5_h += 1;
                        }
                    }else if(special_ran <= 20 && special_ran > 0 && userData.sat.demon_slayer.ds_bool == true && higher_rank_animal == true){
                        higher_rank_animal = false;
                        gainAnimalXp += 50000;
                        rank = `**Demon Slayer** ${gif.animal_rank_19}`;
                        const ds = getRandomInt(1, 6);
                        if(ds == 1){
                            sat = gif.rank_19_1;
                            userData.sat.sat_19_1 += 1;
                            userData.sat.sat_19_1_h += 1;
                        }else if(ds == 2){
                            sat = gif.rank_19_2;
                            userData.sat.sat_19_2 += 1;
                            userData.sat.sat_19_2_h += 1;
                        }else if(ds == 3){
                            sat = gif.rank_19_3;
                            userData.sat.sat_19_3 += 1;
                            userData.sat.sat_19_3_h += 1;
                        }else if(ds == 4){
                            sat = gif.rank_19_4;
                            userData.sat.sat_19_4 += 1;
                            userData.sat.sat_19_4_h += 1;
                        }else if(ds == 5){
                            sat = gif.rank_19_5;
                            userData.sat.sat_19_5 += 1;
                            userData.sat.sat_19_5_h += 1;
                        }
                    }else if(special_ran <= 20 && special_ran > 0 && userData.sat.jujutsu_kaisen.jjk_bool == true && higher_rank_animal == true){
                        higher_rank_animal = false;
                        gainAnimalXp += 50000;
                        rank = `**Jujutsu Kaisen** ${gif.animal_rank_15}`;
                        const jjk = getRandomInt(1, 6);
                        if(jjk == 1){
                            sat = gif.rank_15_1;
                            userData.sat.sat_15_1 += 1;
                            userData.sat.sat_15_1_h += 1;
                        }else if(jjk == 2){
                            sat = gif.rank_15_2;
                            userData.sat.sat_15_2 += 1;
                            userData.sat.sat_15_2_h += 1;
                        }else if(jjk == 3){
                            sat = gif.rank_15_3;
                            userData.sat.sat_15_3 += 1;
                            userData.sat.sat_15_3_h += 1;
                        }else if(jjk == 4){
                            sat = gif.rank_15_4;
                            userData.sat.sat_15_4 += 1;
                            userData.sat.sat_15_4_h += 1;
                        }else if(jjk == 5){
                            sat = gif.rank_15_5;
                            userData.sat.sat_15_5 += 1;
                            userData.sat.sat_15_5_h += 1;
                        }
                    }else if(special_ran <= 20 && special_ran > 0 && userData.sat.one_piece.op_bool == true && higher_rank_animal == true){
                        higher_rank_animal = false;
                        gainAnimalXp += 50000;
                        rank = `**One Piece** ${gif.animal_rank_16}`;
                        const op = getRandomInt(1, 6);
                        if(op == 1){
                            sat = gif.rank_16_1;
                            userData.sat.sat_16_1 += 1;
                            userData.sat.sat_16_1_h += 1;
                        }else if(op == 2){
                            sat = gif.rank_16_2;
                            userData.sat.sat_16_2 += 1;
                            userData.sat.sat_16_2_h += 1;
                        }else if(op == 3){
                            sat = gif.rank_16_3;
                            userData.sat.sat_16_3 += 1;
                            userData.sat.sat_16_3_h += 1;
                        }else if(op == 4){
                            sat = gif.rank_16_4;
                            userData.sat.sat_16_4 += 1;
                            userData.sat.sat_16_4_h += 1;
                        }else if(op == 5){
                            sat = gif.rank_16_5;
                            userData.sat.sat_16_5 += 1;
                            userData.sat.sat_16_5_h += 1;
                        }
                    }else if(special_ran <= 20 && special_ran > 0 && userData.sat.one_punch_man.opm_bool == true && higher_rank_animal == true){
                        higher_rank_animal = false;
                        gainAnimalXp += 50000;
                        rank = `**One Punch Man** ${gif.animal_rank_17}`;
                        const opm = getRandomInt(1, 6);
                        if(opm == 1){
                            sat = gif.rank_17_1;
                            userData.sat.sat_17_1 += 1;
                            userData.sat.sat_17_1_h += 1;
                        }else if(opm == 2){
                            sat = gif.rank_17_2;
                            userData.sat.sat_17_2 += 1;
                            userData.sat.sat_17_2_h += 1;
                        }else if(opm == 3){
                            sat = gif.rank_17_3;
                            userData.sat.sat_17_3 += 1;
                            userData.sat.sat_17_3_h += 1;
                        }else if(opm == 4){
                            sat = gif.rank_17_4;
                            userData.sat.sat_17_4 += 1;
                            userData.sat.sat_17_4_h += 1;
                        }else if(opm == 5){
                            sat = gif.rank_17_5;
                            userData.sat.sat_17_5 += 1;
                            userData.sat.sat_17_5_h += 1;
                        }
                    }else{
                        // Very cool rank (premium exclusive)
                        const very_cool_ran_chance = getRandomInt(1, 501);
                        if(very_cool_ran_chance == 1 && userData.premium.premium_bool == true && higher_rank_animal == true){
                            higher_rank_animal = false;
                            gainAnimalXp += 10000;
                            rank = `**Very cool** ${gif.animal_rank_26}`;
                            const ran_sat_very_cool = getRandomInt(1, 11);
                            if(ran_sat_very_cool == 1){
                                sat = gif.rank_26_1;
                                userData.sat.sat_26_1 += 1;
                                userData.sat.sat_26_1_h += 1;
                            }else if(ran_sat_very_cool == 2){
                                sat = gif.rank_26_2;
                                userData.sat.sat_26_2 += 1;
                                userData.sat.sat_26_2_h += 1;
                            }else if(ran_sat_very_cool == 3){
                                sat = gif.rank_26_3;
                                userData.sat.sat_26_3 += 1;
                                userData.sat.sat_26_3_h += 1;
                            }else if(ran_sat_very_cool == 4){
                                sat = gif.rank_26_4;
                                userData.sat.sat_26_4 += 1;
                                userData.sat.sat_26_4_h += 1;
                            }else if(ran_sat_very_cool == 5){
                                sat = gif.rank_26_5;
                                userData.sat.sat_26_5 += 1;
                                userData.sat.sat_26_5_h += 1;
                            }else if(ran_sat_very_cool == 6){
                                sat = gif.rank_26_6;
                                userData.sat.sat_26_6 += 1;
                                userData.sat.sat_26_6_h += 1;
                            }else if(ran_sat_very_cool == 7){
                                sat = gif.rank_26_7;
                                userData.sat.sat_26_7 += 1;
                                userData.sat.sat_26_7_h += 1;
                            }else if(ran_sat_very_cool == 8){
                                sat = gif.rank_26_8;
                                userData.sat.sat_26_8 += 1;
                                userData.sat.sat_26_8_h += 1;
                            }else if(ran_sat_very_cool == 9){
                                sat = gif.rank_26_9;
                                userData.sat.sat_26_9 += 1;
                                userData.sat.sat_26_9_h += 1;
                            }else if(ran_sat_very_cool == 10){
                                sat = gif.rank_26_10;
                                userData.sat.sat_26_10 += 1;
                                userData.sat.sat_26_10_h += 1;
                            }
                        }else{
                            // Standard common/uncommon/rare ranks
                            const rank_ran = getRandomInt(1, 4);
                            if(rank_ran == 1){
                                gainAnimalXp += 1;
                                rank = `**common** ${gif.animal_rank_1}`;
                                const sat_ran = getRandomInt(1, 6);
                                if(sat_ran == 1){
                                    sat = gif.rank_1_1;
                                    userData.sat.sat_1_1 += 1;
                                    userData.sat.sat_1_1_h += 1;
                                }else if(sat_ran == 2){
                                    sat = gif.rank_1_2;
                                    userData.sat.sat_1_2 += 1;
                                    userData.sat.sat_1_2_h += 1;
                                }else if(sat_ran == 3){
                                    sat = gif.rank_1_3;
                                    userData.sat.sat_1_3 += 1;
                                    userData.sat.sat_1_3_h += 1;
                                }else if(sat_ran == 4){
                                    sat = gif.rank_1_4;
                                    userData.sat.sat_1_4 += 1;
                                    userData.sat.sat_1_4_h += 1;
                                }else if(sat_ran == 5){
                                    sat = gif.rank_1_5;
                                    userData.sat.sat_1_5 += 1;
                                    userData.sat.sat_1_5_h += 1;
                                }
                            }else if(rank_ran == 2){
                                gainAnimalXp += 10;
                                rank = `**uncommon** ${gif.animal_rank_2}`;
                                const sat_ran = getRandomInt(1, 6);
                                if(sat_ran == 1){
                                    sat = gif.rank_2_1;
                                    userData.sat.sat_2_1 += 1;
                                    userData.sat.sat_2_1_h += 1;
                                }else if(sat_ran == 2){
                                    sat = gif.rank_2_2;
                                    userData.sat.sat_2_2 += 1;
                                    userData.sat.sat_2_2_h += 1;
                                }else if(sat_ran == 3){
                                    sat = gif.rank_2_3;
                                    userData.sat.sat_2_3 += 1;
                                    userData.sat.sat_2_3_h += 1;
                                }else if(sat_ran == 4){
                                    sat = gif.rank_2_4;
                                    userData.sat.sat_2_4 += 1;
                                    userData.sat.sat_2_4_h += 1;
                                }else if(sat_ran == 5){
                                    sat = gif.rank_2_5;
                                    userData.sat.sat_2_5 += 1;
                                    userData.sat.sat_2_5_h += 1;
                                }
                            }else if(rank_ran == 3){
                                gainAnimalXp += 20;
                                rank = `**rare** ${gif.animal_rank_3}`;
                                const sat_ran = getRandomInt(1, 6);
                                if(sat_ran == 1){
                                    sat = gif.rank_3_1;
                                    userData.sat.sat_3_1 += 1;
                                    userData.sat.sat_3_1_h += 1;
                                }else if(sat_ran == 2){
                                    sat = gif.rank_3_2;
                                    userData.sat.sat_3_2 += 1;
                                    userData.sat.sat_3_2_h += 1;
                                }else if(sat_ran == 3){
                                    sat = gif.rank_3_3;
                                    userData.sat.sat_3_3 += 1;
                                    userData.sat.sat_3_3_h += 1;
                                }else if(sat_ran == 4){
                                    sat = gif.rank_3_4;
                                    userData.sat.sat_3_4 += 1;
                                    userData.sat.sat_3_4_h += 1;
                                }else if(sat_ran == 5){
                                    sat = gif.rank_3_5;
                                    userData.sat.sat_3_5 += 1;
                                    userData.sat.sat_3_5_h += 1;
                                }
                            }
                        }
                    }
                }else if(getAnimal == 4){
                    // Epic rank
                    gainAnimalXp += 400;
                    rank = `**epic** ${gif.animal_rank_4}`;
                    const sat_ran = getRandomInt(1, 6);
                    if(sat_ran == 1){
                        sat = gif.rank_4_1;
                        userData.sat.sat_4_1 += 1;
                        userData.sat.sat_4_1_h += 1;
                    }else if(sat_ran == 2){
                        sat = gif.rank_4_2;
                        userData.sat.sat_4_2 += 1;
                        userData.sat.sat_4_2_h += 1;
                    }else if(sat_ran == 3){
                        sat = gif.rank_4_3;
                        userData.sat.sat_4_3 += 1;
                        userData.sat.sat_4_3_h += 1;
                    }else if(sat_ran == 4){
                        sat = gif.rank_4_4;
                        userData.sat.sat_4_4 += 1;
                        userData.sat.sat_4_4_h += 1;
                    }else if(sat_ran == 5){
                        sat = gif.rank_4_5;
                        userData.sat.sat_4_5 += 1;
                        userData.sat.sat_4_5_h += 1;
                    }
                }else if(getAnimal == 5){
                    // Mythic rank
                    gainAnimalXp += 1000;
                    rank = `**mythic** ${gif.animal_rank_5}`;
                    const sat_ran = getRandomInt(1, 6);
                    if(sat_ran == 1){
                        sat = gif.rank_5_1;
                        userData.sat.sat_5_1 += 1;
                        userData.sat.sat_5_1_h += 1;
                    }else if(sat_ran == 2){
                        sat = gif.rank_5_2;
                        userData.sat.sat_5_2 += 1;
                        userData.sat.sat_5_2_h += 1;
                    }else if(sat_ran == 3){
                        sat = gif.rank_5_3;
                        userData.sat.sat_5_3 += 1;
                        userData.sat.sat_5_3_h += 1;
                    }else if(sat_ran == 4){
                        sat = gif.rank_5_4;
                        userData.sat.sat_5_4 += 1;
                        userData.sat.sat_5_4_h += 1;
                    }else if(sat_ran == 5){
                        sat = gif.rank_5_5;
                        userData.sat.sat_5_5 += 1;
                        userData.sat.sat_5_5_h += 1;
                    }
                }else if(getAnimal == 6){
                    // Legendary rank
                    gainAnimalXp += 2000;
                    rank = `**legendary** ${gif.animal_rank_6}`;
                    const sat_ran = getRandomInt(1, 6);
                    if(sat_ran == 1){
                        sat = gif.rank_6_1;
                        userData.sat.sat_6_1 += 1;
                        userData.sat.sat_6_1_h += 1;
                    }else if(sat_ran == 2){
                        sat = gif.rank_6_2;
                        userData.sat.sat_6_2 += 1;
                        userData.sat.sat_6_2_h += 1;
                    }else if(sat_ran == 3){
                        sat = gif.rank_6_3;
                        userData.sat.sat_6_3 += 1;
                        userData.sat.sat_6_3_h += 1;
                    }else if(sat_ran == 4){
                        sat = gif.rank_6_4;
                        userData.sat.sat_6_4 += 1;
                        userData.sat.sat_6_4_h += 1;
                    }else if(sat_ran == 5){
                        sat = gif.rank_6_5;
                        userData.sat.sat_6_5 += 1;
                        userData.sat.sat_6_5_h += 1;
                    }
                }else if(getAnimal == 7){
                    // Gem rank
                    gainAnimalXp += 5000;
                    rank = `**gem** ${gif.animal_rank_7}`;
                    const sat_ran = getRandomInt(1, 6);
                    if(sat_ran == 1){
                        sat = gif.rank_7_1;
                        userData.sat.sat_7_1 += 1;
                        userData.sat.sat_7_1_h += 1;
                    }else if(sat_ran == 2){
                        sat = gif.rank_7_2;
                        userData.sat.sat_7_2 += 1;
                        userData.sat.sat_7_2_h += 1;
                    }else if(sat_ran == 3){
                        sat = gif.rank_7_3;
                        userData.sat.sat_7_3 += 1;
                        userData.sat.sat_7_3_h += 1;
                    }else if(sat_ran == 4){
                        sat = gif.rank_7_4;
                        userData.sat.sat_7_4 += 1;
                        userData.sat.sat_7_4_h += 1;
                    }else if(sat_ran == 5){
                        sat = gif.rank_7_5;
                        userData.sat.sat_7_5 += 1;
                        userData.sat.sat_7_5_h += 1;
                    }
                }else if(getAnimal == 8){
                    // Fabled rank
                    gainAnimalXp += 100000;
                    rank = `**fabled** ${gif.animal_rank_8}`;
                    const sat_ran = getRandomInt(1, 6);
                    if(sat_ran == 1){
                        sat = gif.rank_8_1;
                        userData.sat.sat_8_1 += 1;
                        userData.sat.sat_8_1_h += 1;
                    }else if(sat_ran == 2){
                        sat = gif.rank_8_2;
                        userData.sat.sat_8_2 += 1;
                        userData.sat.sat_8_2_h += 1;
                    }else if(sat_ran == 3){
                        sat = gif.rank_8_3;
                        userData.sat.sat_8_3 += 1;
                        userData.sat.sat_8_3_h += 1;
                    }else if(sat_ran == 4){
                        sat = gif.rank_8_4;
                        userData.sat.sat_8_4 += 1;
                        userData.sat.sat_8_4_h += 1;
                    }else if(sat_ran == 5){
                        sat = gif.rank_8_5;
                        userData.sat.sat_8_5 += 1;
                        userData.sat.sat_8_5_h += 1;
                    }
                }
                
                // Build message for each animal caught
                if(amount_of_get == 1){
                    messageSat += `${rank} ${sat}!`;
                }else{
                    messageSat += `${sat} `;
                } 
            }

            // SPECIAL GEM CASH BONUS SYSTEM
            if(cashBonus > 0){
                const totalCash = cashBonus * amount_of_get;
                userData.balance += totalCash;
                messageSat += `\n\n💰 **+${totalCash} cash** from Special Gem!`;
            }

            // Team XP distribution
            if(Sat.team.team_equipe1 || Sat.team.team_equipe2 || Sat.team.team_equipe3){ 
                messageSat += `\n\nYour team **[ `; 
            }
            if(Sat.team.team_equipe1){
                const postion1_name = getAnimalNameByName(Sat.team.team_equipe1)
                if(postion1_name){ 
                    messageSat += `${gif[`rank_${getAnimalIdByName(postion1_name)}`]} `
                }
                Sat[`sat_${getAnimalIdByName(postion1_name)}_xp`] += gainAnimalXp;
            }
            if(Sat.team.team_equipe2){
                const postion2_name = getAnimalNameByName(Sat.team.team_equipe2)
                if(postion2_name){ 
                    messageSat += `${gif[`rank_${getAnimalIdByName(postion2_name)}`]} `
                }
                Sat[`sat_${getAnimalIdByName(postion2_name)}_xp`] += gainAnimalXp;
            }
            if(Sat.team.team_equipe3){
                const postion3_name = getAnimalNameByName(Sat.team.team_equipe3)
                if(postion3_name){ 
                    messageSat += `${gif[`rank_${getAnimalIdByName(postion3_name)}`]} `
                }
                Sat[`sat_${getAnimalIdByName(postion3_name)}_xp`] += gainAnimalXp;
            }
            if(Sat.team.team_equipe1 || Sat.team.team_equipe2 || Sat.team.team_equipe3){ 
                messageSat += `]** xp up **${gainAnimalXp}**!`; 
            }

            // Update the hunt message
            // CHANGED: Edit with plain string instead of embed object
            mgs.edit(messageSat);

            // Daily lootbox system
            if(userData.daily_animal < tomorrow || !userData.daily_animal){
                userData.daily_animal = tomorrow;
                userData.daily_lootbox = 0;
                userData.daily_crate = 0;
            }

            const box_ran = getRandomInt(1, 5);
            if(box_ran == 1 && userData.daily_lootbox <= 4){
                userData.daily_lootbox += 1;
                message.channel.send(`You got ${gif['050']}**lootbox**! ${sym}[${userData.daily_lootbox}/5] will reset in ${hours}h, ${minutes}m, ${seconds}s${sym}`);
                userData.gem['050'] += 1;
            }
            
            // Save all changes to database
            try {
                await userData.save();
            }catch(error){
                console.log(`save error in hunt: ${error}`);
            }
            return;
        }catch(error){
            console.log(`hunt error ${error} userId: ${message.author.id}`);
        }
    },
};