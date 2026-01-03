const {getUser, gif, cooldown, customEmbed, SimpleEmbed, labelButton, ButtonStyle, twoButton, getCollectionButton, getRandomInt, toSuperscript} = require('../../functioon/function');

const cooldowns = new Map();
let CDT = 1000;
var getId = [];
var cdId = [];
var prem = [];

const space = '\u2006\u2006\u2006\u2006';
const SL = '\u2006\u2006';

module.exports = {
    name: 'autohunt',
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
            
            if(args[0] && !userData.autohunt.autohunting){
                let amount = parseInt(args[0]);
                let spend = 0;

                let showTime = '';
                let time_in_ms = 0;

                if(amount){
                    if(amount > 50000){
                        return message.channel.send({ embeds: [SimpleEmbed(`<@${user.id}> Maximum killing amount is 50,000!`)] });
                    }else if(amount < 50){
                        return message.channel.send({ embeds: [SimpleEmbed(`<@${user.id}> Killing amount must be 50 or higher!`)] });
                    }

                    // Calculate cost: 4000 per hunt
                    spend = amount * 4000;

                    // Calculate time: 8.4 seconds per hunt
                    time_in_ms = amount * 8400;

                    // Format display time
                    const totalSeconds = Math.floor(time_in_ms / 1000);
                    const hours = Math.floor(totalSeconds / 3600);
                    const minutes = Math.floor((totalSeconds % 3600) / 60);
                    const seconds = totalSeconds % 60;

                    if(hours > 0){
                        showTime = `${hours}h ${minutes}m ${seconds}s`;
                    }else if(minutes > 0){
                        showTime = `${minutes}m ${seconds}s`;
                    }else{
                        showTime = `${seconds}s`;
                    }

                    if(userData.balance < spend){
                        return message.channel.send({ embeds: [SimpleEmbed(`<@${user.id}> You need ${spend.toLocaleString()}${gif.cash} for killing!`)] });
                    }

                    const agree_button = labelButton('agree_button', 'Agree', ButtonStyle.Success);
                    const cancel_button = labelButton('cancel_button', 'Cancel', ButtonStyle.Danger);
                    const allButton = twoButton(agree_button, cancel_button);

                    const embed = SimpleEmbed(`<@${user.id}> now you start to killing **${amount}** animal\nand need to spend **${spend.toLocaleString()}**${gif.cash}\n\nAre you agree?`);

                    const mgs = await message.channel.send({ embeds: [embed], components: [allButton] });

                    const collector = getCollectionButton(mgs, 60_000);

                    collector.on('end', (collected, reason) =>{
                        if(reason === 'time'){
                            mgs.edit({ embeds: [embed], components: [] });
                            collector.stop();
                            return;
                        }
                    });

                    collector.on('collect', async (interaction) =>{
                        try{
                            if(interaction.member.user.id !== user.id){
                                await interaction.reply({ content: 'This button is not for you!', ephemeral: true });
                                return;
                            }

                            const userData = await getUser(user.id);
            
                            if(interaction.customId == 'agree_button'){
                                const currentTime = new Date();
                                const cooldownEnd = new Date(currentTime.getTime() + time_in_ms);

                                userData.autohunt.datekilling = cooldownEnd;
                                userData.autohunt.autohunting = true;
                                userData.autohunt.amount_animal = amount;
                                userData.balance -= spend;
                                userData.autohunt.killTotal += amount;
                                userData.autohunt.spendTotal += spend;

                                try{ await userData.save(); }catch(error){}

                                const embed = customEmbed()
                                    .setAuthor({ name: `${user.displayName}'s killing bot!`, iconURL: user.displayAvatarURL() })
                                    .setColor('Red')
                                    .setDescription(`\n\n!🤖 [**STARTING**]: KILLING BOT\n\nFOR ANIMAL: ${amount.toLocaleString()}\n\nFINISH TIME: ${showTime}\n\n`)
                                    .setTimestamp()
                                await interaction.update({ embeds: [embed], components: [] });
                                collector.stop();
                                return;
                            }
        
                            if(interaction.customId === 'cancel_button'){
                                mgs.delete();
                                collector.stop();
                                return;
                            }
                        }catch(error){}
                    });         
                }
            }else{
                const currentTime = new Date();
                if(currentTime >= userData.autohunt.datekilling && userData.autohunt.autohunting){
                    userData.autohunt.autohunting = false;

                    let killingMessage = ''; 

                    let rank_c = 0;
                    let rank_u = 0;
                    let rank_r = 0;
                    let rank_e = 0;
                    let rank_m = 0;
                    let rank_l = 0;
                    let rank_g = 0;
                    let rank_f = 0;
                    let rank_o = 0;
                    let rank_x = 0;
                    let rank_v = 0;
                    let rank_special = 0;

                    for(let i = 1; i <= userData.autohunt.amount_animal; i++){
                        const ran_rank = getRandomInt(1, 13);
                        if(ran_rank == 1){
                            rank_c += 1;

                        }else if(ran_rank == 2){
                            rank_u += 1;

                        }else if(ran_rank == 3){
                            rank_r += 1;

                        }else if(ran_rank == 4){
                            const ran_e = getRandomInt(1, 6);
                            if(ran_e == 1){
                                rank_e += 1; 
                            }else{
                                const ran_low = getRandomInt(1, 4);
                                if(ran_low == 1){
                                    rank_c += 1;
                                }else if(ran_low == 2){
                                    rank_u += 1;
                                }else if(ran_low == 3){
                                    rank_r += 1;
                                }
                            }

                        }else if(ran_rank == 5){
                            const ran_m = getRandomInt(1, 11);
                            if(ran_m == 1){
                                rank_m += 1;
                            }else{
                                const ran_low = getRandomInt(1, 4);
                                if(ran_low == 1){
                                    rank_c += 1;
                                }else if(ran_low == 2){
                                    rank_u += 1;
                                }else if(ran_low == 3){
                                    rank_r += 1;
                                }
                            }
                            
                        }else if(ran_rank == 6){
                            const ran_l = getRandomInt(1, 21);
                            if(ran_l == 1){
                                rank_l += 1;
                            }else{
                                const ran_low = getRandomInt(1, 4);
                                if(ran_low == 1){
                                    rank_c += 1;
                                }else if(ran_low == 2){
                                    rank_u += 1;
                                }else if(ran_low == 3){
                                    rank_r += 1;
                                }
                            }
                            
                        }else if(ran_rank == 7){
                            const ran_g = getRandomInt(1, 51);
                            if(ran_g == 1){
                                rank_g += 1;
                            }else{
                                const ran_low = getRandomInt(1, 4);
                                if(ran_low == 1){
                                    rank_c += 1;
                                }else if(ran_low == 2){
                                    rank_u += 1;
                                }else if(ran_low == 3){
                                    rank_r += 1;
                                }
                            }
                        }else if(ran_rank == 8){
                            const ran_f = getRandomInt(1, 101);
                            if(ran_f == 1){
                                rank_f += 1;
                            }else{
                                const ran_low = getRandomInt(1, 4);
                                if(ran_low == 1){
                                    rank_c += 1;
                                }else if(ran_low == 2){
                                    rank_u += 1;
                                }else if(ran_low == 3){
                                    rank_r += 1;
                                }
                            }
                        }else if(ran_rank == 9){
                            const ran_o = getRandomInt(1, 501);
                            if(ran_o == 1){
                                rank_o += 1;
                            }else{
                                const ran_low = getRandomInt(1, 4);
                                if(ran_low == 1){
                                    rank_c += 1;
                                }else if(ran_low == 2){
                                    rank_u += 1;
                                }else if(ran_low == 3){
                                    rank_r += 1;
                                }
                            }
                        }else if(ran_rank == 10){
                            const ran_x = getRandomInt(1, 1001);
                            if(ran_x == 1){
                                rank_x += 1;
                            }else{
                                const ran_low = getRandomInt(1, 4);
                                if(ran_low == 1){
                                    rank_c += 1;
                                }else if(ran_low == 2){
                                    rank_u += 1;
                                }else if(ran_low == 3){
                                    rank_r += 1;
                                }
                            }
                        }else if(ran_rank == 11){
                            const ran_v = getRandomInt(1, 5001);
                            if(ran_v == 1){
                                rank_v += 1;
                            }else{
                                const ran_low = getRandomInt(1, 4);
                                if(ran_low == 1){
                                    rank_c += 1; 
                                }else if(ran_low == 2){
                                    rank_u += 1;
                                }else if(ran_low == 3){
                                    rank_r += 1;
                                }
                            }
                        }else if(ran_rank == 12){
                            // Special pet rank - 1 in 10000 chance
                            const ran_special = getRandomInt(1, 10001);
                            if(ran_special == 1){
                                rank_special += 1;
                            }else{
                                const ran_low = getRandomInt(1, 4);
                                if(ran_low == 1){
                                    rank_c += 1;
                                }else if(ran_low == 2){
                                    rank_u += 1;
                                }else if(ran_low == 3){
                                    rank_r += 1;
                                }
                            }
                        }
                    }

                    let s_1_1 = '';
                    let s_1_2 = '';
                    let s_1_3 = '';
                    let s_1_4 = '';
                    let s_1_5 = '';

                    let animal_1_1 = 0;
                    let animal_1_2 = 0;
                    let animal_1_3 = 0;
                    let animal_1_4 = 0;
                    let animal_1_5 = 0;

                    if(rank_c > 0){
                        killingMessage += `${gif.animal_rank_1}${space}`;
                        for(let i = 1; i <= rank_c; i++){
                            const ran_c = getRandomInt(1, 6);
                            if(ran_c == 1){
                                animal_1_1 += 1;
                                s_1_1 = `${gif.rank_1_1}${toSuperscript(animal_1_1, animal_1_1)}${SL}`;
                                userData.sat.sat_1_1 += 1;
                                userData.sat.sat_1_1_h += 1;

                            }else if(ran_c == 2){
                                animal_1_2 += 1;
                                s_1_2 = `${gif.rank_1_2}${toSuperscript(animal_1_2, animal_1_2)}${SL}`;
                                userData.sat.sat_1_2 += 1;
                                userData.sat.sat_1_2_h += 1;

                            }else if(ran_c == 3){
                                animal_1_3 += 1;
                                s_1_3 = `${gif.rank_1_3}${toSuperscript(animal_1_3, animal_1_3)}${SL}`;
                                userData.sat.sat_1_3 += 1;
                                userData.sat.sat_1_3_h += 1;

                            }else if(ran_c == 4){
                                animal_1_4 += 1;
                                s_1_4 = `${gif.rank_1_4}${toSuperscript(animal_1_4, animal_1_4)}${SL}`;
                                userData.sat.sat_1_4 += 1;
                                userData.sat.sat_1_4_h += 1;

                            }else if(ran_c == 5){
                                animal_1_5 += 1;
                                s_1_5 = `${gif.rank_1_5}${toSuperscript(animal_1_5, animal_1_5)}${SL}`;
                                userData.sat.sat_1_5 += 1;
                                userData.sat.sat_1_5_h += 1;
                            }
                        }
                    }
                    killingMessage += `${s_1_1}${s_1_2}${s_1_3}${s_1_4}${s_1_5}`;

                    let s_2_1 = '';
                    let s_2_2 = '';
                    let s_2_3 = '';
                    let s_2_4 = '';
                    let s_2_5 = '';

                    let animal_2_1 = 0;
                    let animal_2_2 = 0;
                    let animal_2_3 = 0;
                    let animal_2_4 = 0;
                    let animal_2_5 = 0;

                    if(rank_u > 0){
                        killingMessage += `\n${gif.animal_rank_2}${space}`;
                        for(let i = 1; i <= rank_u; i++){
                            const ran_u = getRandomInt(1, 6);
                            if(ran_u == 1){
                                animal_2_1 += 1;
                                s_2_1 = `${gif.rank_2_1}${toSuperscript(animal_2_1, animal_2_1)}${SL}`;
                                userData.sat.sat_2_1 += 1;
                                userData.sat.sat_2_1_h += 1;

                            }else if(ran_u == 2){
                                animal_2_2 += 1;
                                s_2_2 = `${gif.rank_2_2}${toSuperscript(animal_2_2, animal_2_2)}${SL}`;
                                userData.sat.sat_2_2 += 1;
                                userData.sat.sat_2_2_h += 1;

                            }else if(ran_u == 3){
                                animal_2_3 += 1;
                                s_2_3 = `${gif.rank_2_3}${toSuperscript(animal_2_3, animal_2_3)}${SL}`;
                                userData.sat.sat_2_3 += 1;
                                userData.sat.sat_2_3_h += 1;

                            }else if(ran_u == 4){
                                animal_2_4 += 1;
                                s_2_4 = `${gif.rank_2_4}${toSuperscript(animal_2_4, animal_2_4)}${SL}`;
                                userData.sat.sat_2_4 += 1;
                                userData.sat.sat_2_4_h += 1;

                            }else if(ran_u == 5){
                                animal_2_5 += 1;
                                s_2_5 = `${gif.rank_2_5}${toSuperscript(animal_2_5, animal_2_5)}${SL}`;
                                userData.sat.sat_2_5 += 1;
                                userData.sat.sat_2_5_h += 1;
                            }
                        }
                    }
                    killingMessage += `${s_2_1}${s_2_2}${s_2_3}${s_2_4}${s_2_5}`;

                    let s_3_1 = '';
                    let s_3_2 = '';
                    let s_3_3 = '';
                    let s_3_4 = '';
                    let s_3_5 = '';

                    let animal_3_1 = 0;
                    let animal_3_2 = 0;
                    let animal_3_3 = 0;
                    let animal_3_4 = 0;
                    let animal_3_5 = 0;

                    if(rank_r > 0){
                        killingMessage += `\n${gif.animal_rank_3}${space}`;
                        for(let i = 1; i <= rank_r; i++){
                            const ran_r = getRandomInt(1, 6);
                            if(ran_r == 1){
                                animal_3_1 += 1;
                                s_3_1 = `${gif.rank_3_1}${toSuperscript(animal_3_1, animal_3_1)}${SL}`;
                                userData.sat.sat_3_1 += 1;
                                userData.sat.sat_3_1_h += 1;

                            }else if(ran_r == 2){
                                animal_3_2 += 1;
                                s_3_2 = `${gif.rank_3_2}${toSuperscript(animal_3_2, animal_3_2)}${SL}`;
                                userData.sat.sat_3_2 += 1;
                                userData.sat.sat_3_2_h += 1;

                            }else if(ran_r == 3){
                                animal_3_3 += 1;
                                s_3_3 = `${gif.rank_3_3}${toSuperscript(animal_3_3, animal_3_3)}${SL}`;
                                userData.sat.sat_3_3 += 1;
                                userData.sat.sat_3_3_h += 1;

                            }else if(ran_r == 4){
                                animal_3_4 += 1;
                                s_3_4 = `${gif.rank_3_4}${toSuperscript(animal_3_4, animal_3_4)}${SL}`;
                                userData.sat.sat_3_4 += 1;
                                userData.sat.sat_3_4_h += 1;

                            }else if(ran_r == 5){
                                animal_3_5 += 1;
                                s_3_5 = `${gif.rank_3_5}${toSuperscript(animal_3_5, animal_3_5)}${SL}`;
                                userData.sat.sat_3_5 += 1;
                                userData.sat.sat_3_5_h += 1;

                            }
                        }
                    }
                    killingMessage += `${s_3_1}${s_3_2}${s_3_3}${s_3_4}${s_3_5}`;

                    let s_4_1 = '';
                    let s_4_2 = '';
                    let s_4_3 = '';
                    let s_4_4 = '';
                    let s_4_5 = '';

                    let animal_4_1 = 0;
                    let animal_4_2 = 0;
                    let animal_4_3 = 0;
                    let animal_4_4 = 0;
                    let animal_4_5 = 0;

                    if(rank_e > 0){
                        killingMessage += `\n${gif.animal_rank_4}${space}`;
                        for(let i = 1; i <= rank_e; i++){
                            const ran_e = getRandomInt(1, 6);
                            if(ran_e == 1){
                                animal_4_1 += 1;
                                s_4_1 = `${gif.rank_4_1}${toSuperscript(animal_4_1, animal_4_1)}${SL}`;
                                userData.sat.sat_4_1 += 1;
                                userData.sat.sat_4_1_h += 1;

                            }else if(ran_e == 2){
                                animal_4_2 += 1;
                                s_4_2 = `${gif.rank_4_2}${toSuperscript(animal_4_2, animal_4_2)}${SL}`;
                                userData.sat.sat_4_2 += 1;
                                userData.sat.sat_4_2_h += 1;

                            }else if(ran_e == 3){
                                animal_4_3 += 1;
                                s_4_3 = `${gif.rank_4_3}${toSuperscript(animal_4_3, animal_4_3)}${SL}`;
                                userData.sat.sat_4_3 += 1;
                                userData.sat.sat_4_3_h += 1;

                            }else if(ran_e == 4){
                                animal_4_4 += 1;
                                s_4_4 = `${gif.rank_4_4}${toSuperscript(animal_4_4, animal_4_4)}${SL}`;
                                userData.sat.sat_4_4 += 1;
                                userData.sat.sat_4_4_h += 1;

                            }else if(ran_e == 5){
                                animal_4_5 += 1;
                                s_4_5 = `${gif.rank_4_5}${toSuperscript(animal_4_5, animal_4_5)}${SL}`;
                                userData.sat.sat_4_5 += 1;
                                userData.sat.sat_4_5_h += 1;
                            }
                        }
                    }
                    killingMessage += `${s_4_1}${s_4_2}${s_4_3}${s_4_4}${s_4_5}`; 

                    let s_5_1 = '';
                    let s_5_2 = '';
                    let s_5_3 = '';
                    let s_5_4 = '';
                    let s_5_5 = '';

                    let animal_5_1 = 0;
                    let animal_5_2 = 0;
                    let animal_5_3 = 0;
                    let animal_5_4 = 0;
                    let animal_5_5 = 0;

                    if(rank_m > 0){
                        killingMessage += `\n${gif.animal_rank_5}${space}`;
                        for(let i = 1; i <= rank_m; i++){
                            const ran_m = getRandomInt(1, 6);
                            if(ran_m == 1){
                                animal_5_1 += 1;
                                s_5_1 = `${gif.rank_5_1}${toSuperscript(animal_5_1, animal_5_1)}${SL}`;
                                userData.sat.sat_5_1 += 1;
                                userData.sat.sat_5_1_h += 1;

                            }else if(ran_m == 2){
                                animal_5_2 += 1;
                                s_5_2 = `${gif.rank_5_2}${toSuperscript(animal_5_2, animal_5_2)}${SL}`;
                                userData.sat.sat_5_2 += 1;
                                userData.sat.sat_5_2_h += 1;

                            }else if(ran_m == 3){
                                animal_5_3 += 1;
                                s_5_3 = `${gif.rank_5_3}${toSuperscript(animal_5_3, animal_5_3)}${SL}`;
                                userData.sat.sat_5_3 += 1;
                                userData.sat.sat_5_3_h += 1;

                            }else if(ran_m == 4){
                                animal_5_4 += 1;
                                s_5_4 = `${gif.rank_5_4}${toSuperscript(animal_5_4, animal_5_4)}${SL}`;
                                userData.sat.sat_5_4 += 1;
                                userData.sat.sat_5_4_h += 1;

                            }else if(ran_m == 5){
                                animal_5_5 += 1;
                                s_5_5 = `${gif.rank_5_5}${toSuperscript(animal_5_5, animal_5_5)}${SL}`;
                                userData.sat.sat_5_5 += 1;
                                userData.sat.sat_5_5_h += 1;
                            }
                        }
                    }
                    killingMessage += `${s_5_1}${s_5_2}${s_5_3}${s_5_4}${s_5_5}`; 

                    let s_6_1 = '';
                    let s_6_2 = '';
                    let s_6_3 = '';
                    let s_6_4 = '';
                    let s_6_5 = '';

                    let animal_6_1 = 0;
                    let animal_6_2 = 0;
                    let animal_6_3 = 0;
                    let animal_6_4 = 0;
                    let animal_6_5 = 0;
                    
                    if(rank_l > 0){
                        killingMessage += `\n${gif.animal_rank_6}${space}`;
                        for(let i = 1; i <= rank_l; i++){
                            const ran_l = getRandomInt(1, 6);
                            if(ran_l == 1){
                                animal_6_1 += 1;
                                s_6_1 = `${gif.rank_6_1}${toSuperscript(animal_6_1, animal_6_1)}${SL}`;
                                userData.sat.sat_6_1 += 1;
                                userData.sat.sat_6_1_h += 1;

                            }else if(ran_l == 2){
                                animal_6_2 += 1;
                                s_6_2 = `${gif.rank_6_2}${toSuperscript(animal_6_2, animal_6_2)}${SL}`;
                                userData.sat.sat_6_2 += 1;
                                userData.sat.sat_6_2_h += 1;

                            }else if(ran_l == 3){
                                animal_6_3 += 1;
                                s_6_3 = `${gif.rank_6_3}${toSuperscript(animal_6_3, animal_6_3)}${SL}`;
                                userData.sat.sat_6_3 += 1;
                                userData.sat.sat_6_3_h += 1;

                            }else if(ran_l == 4){
                                animal_6_4 += 1;
                                s_6_4 = `${gif.rank_6_4}${toSuperscript(animal_6_4, animal_6_4)}${SL}`;
                                userData.sat.sat_6_4 += 1;
                                userData.sat.sat_6_4_h += 1;

                            }else if(ran_l == 5){
                                animal_6_5 += 1;
                                s_6_5 = `${gif.rank_6_5}${toSuperscript(animal_6_5, animal_6_5)}${SL}`;
                                userData.sat.sat_6_5 += 1;
                                userData.sat.sat_6_5_h += 1;
                            }
                        }
                    }
                    killingMessage += `${s_6_1}${s_6_2}${s_6_3}${s_6_4}${s_6_5}`;

                    let s_7_1 = '';
                    let s_7_2 = '';
                    let s_7_3 = '';
                    let s_7_4 = '';
                    let s_7_5 = '';

                    let animal_7_1 = 0;
                    let animal_7_2 = 0;
                    let animal_7_3 = 0;
                    let animal_7_4 = 0;
                    let animal_7_5 = 0;

                    if(rank_g > 0){
                        killingMessage += `\n${gif.animal_rank_7}${space}`;
                        for(let i = 1; i <= rank_g; i++){
                            const ran_g = getRandomInt(1, 6);
                            if(ran_g == 1){
                                animal_7_1 += 1;
                                s_7_1 = `${gif.rank_7_1}${toSuperscript(animal_7_1, animal_7_1)}${SL}`;
                                userData.sat.sat_7_1 += 1;
                                userData.sat.sat_7_1_h += 1;

                            }else if(ran_g == 2){
                                animal_7_2 += 1;
                                s_7_2 = `${gif.rank_7_2}${toSuperscript(animal_7_2, animal_7_2)}${SL}`;
                                userData.sat.sat_7_2 += 1;
                                userData.sat.sat_7_2_h += 1;

                            }else if(ran_g == 3){
                                animal_7_3 += 1;
                                s_7_3 = `${gif.rank_7_3}${toSuperscript(animal_7_3, animal_7_3)}${SL}`;
                                userData.sat.sat_7_3 += 1;
                                userData.sat.sat_7_3_h += 1;

                            }else if(ran_g == 4){
                                animal_7_4 += 1;
                                s_7_4 = `${gif.rank_7_4}${toSuperscript(animal_7_4, animal_7_4)}${SL}`;
                                userData.sat.sat_7_4 += 1;
                                userData.sat.sat_7_4_h += 1;

                            }else if(ran_g == 5){
                                animal_7_5 += 1;
                                s_7_5 = `${gif.rank_7_5}${toSuperscript(animal_7_5, animal_7_5)}${SL}`;
                                userData.sat.sat_7_5 += 1;
                                userData.sat.sat_7_5_h += 1;
                            }
                        }
                    }
                    killingMessage += `${s_7_1}${s_7_2}${s_7_3}${s_7_4}${s_7_5}`;

                    let s_8_1 = '';
                    let s_8_2 = '';
                    let s_8_3 = '';
                    let s_8_4 = '';
                    let s_8_5 = '';

                    let animal_8_1 = 0;
                    let animal_8_2 = 0;
                    let animal_8_3 = 0;
                    let animal_8_4 = 0;
                    let animal_8_5 = 0;

                    if(rank_f > 0){
                        killingMessage += `\n${gif.animal_rank_8}${space}`;
                        for(let i = 1; i <= rank_f; i++){
                            const ran_f = getRandomInt(1, 6);
                            if(ran_f == 1){
                                animal_8_1 += 1;
                                s_8_1 = `${gif.rank_8_1}${toSuperscript(animal_8_1, animal_8_1)}${SL}`;
                                userData.sat.sat_8_1 += 1;
                                userData.sat.sat_8_1_h += 1;

                            }else if(ran_f == 2){
                                animal_8_2 += 1;
                                s_8_2 = `${gif.rank_8_2}${toSuperscript(animal_8_2, animal_8_2)}${SL}`;
                                userData.sat.sat_8_2 += 1;
                                userData.sat.sat_8_2_h += 1;

                            }else if(ran_f == 3){
                                animal_8_3 += 1;
                                s_8_3 = `${gif.rank_8_3}${toSuperscript(animal_8_3, animal_8_3)}${SL}`;
                                userData.sat.sat_8_3 += 1;
                                userData.sat.sat_8_3_h += 1;

                            }else if(ran_f == 4){
                                animal_8_4 += 1;
                                s_8_4 = `${gif.rank_8_4}${toSuperscript(animal_8_4, animal_8_4)}${SL}`;
                                userData.sat.sat_8_4 += 1;
                                userData.sat.sat_8_4_h += 1;

                            }else if(ran_f == 5){
                                animal_8_5 += 1;
                                s_8_5 = `${gif.rank_8_5}${toSuperscript(animal_8_5, animal_8_5)}${SL}`;
                                userData.sat.sat_8_5 += 1;
                                userData.sat.sat_8_5_h += 1;
                            }
                        }
                    }
                    killingMessage += `${s_8_1}${s_8_2}${s_8_3}${s_8_4}${s_8_5}`;

                    let s_12_1 = '';
                    let s_12_2 = '';
                    let s_12_3 = '';
                    let s_12_4 = '';
                    let s_12_5 = '';

                    let animal_12_1 = 0;
                    let animal_12_2 = 0;
                    let animal_12_3 = 0;
                    let animal_12_4 = 0;
                    let animal_12_5 = 0;

                    if(rank_o > 0){
                        killingMessage += `\n${gif.animal_rank_12}${space}`;
                        for(let i = 1; i <= rank_o; i++){
                            const ran_o = getRandomInt(1, 6);
                            if(ran_o == 1){
                                animal_12_1 += 1;
                                s_12_1 = `${gif.rank_12_1}${toSuperscript(animal_12_1, animal_12_1)}${SL}`;
                                userData.sat.sat_12_1 += 1;
                                userData.sat.sat_12_1_h += 1;

                            }else if(ran_o == 2){
                                animal_12_2 += 1;
                                s_12_2 = `${gif.rank_12_2}${toSuperscript(animal_12_2, animal_12_2)}${SL}`;
                                userData.sat.sat_12_2 += 1;
                                userData.sat.sat_12_2_h += 1;

                            }else if(ran_o == 3){
                                animal_12_3 += 1;
                                s_12_3 = `${gif.rank_12_3}${toSuperscript(animal_12_3, animal_12_3)}${SL}`;
                                userData.sat.sat_12_3 += 1;
                                userData.sat.sat_12_3_h += 1;

                            }else if(ran_o == 4){
                                animal_12_4 += 1;
                                s_12_4 = `${gif.rank_12_4}${toSuperscript(animal_12_4, animal_12_4)}${SL}`;
                                userData.sat.sat_12_4 += 1;
                                userData.sat.sat_12_4_h += 1;

                            }else if(ran_o == 5){
                                animal_12_5 += 1;
                                s_12_5 = `${gif.rank_12_5}${toSuperscript(animal_12_5, animal_12_5)}${SL}`;
                                userData.sat.sat_12_5 += 1;
                                userData.sat.sat_12_5_h += 1;
                            }
                        }
                    }
                    killingMessage += `${s_12_1}${s_12_2}${s_12_3}${s_12_4}${s_12_5}`;

                    let s_13_1 = '';
                    let s_13_2 = '';
                    let s_13_3 = '';
                    let s_13_4 = '';
                    let s_13_5 = '';

                    let animal_13_1 = 0;
                    let animal_13_2 = 0;
                    let animal_13_3 = 0;
                    let animal_13_4 = 0;
                    let animal_13_5 = 0;

                    if(rank_x > 0){
                        killingMessage += `\n${gif.animal_rank_13}${space}`;
                        for(let i = 1; i <= rank_x; i++){
                            const ran_x = getRandomInt(1, 6);
                            if(ran_x == 1){
                                animal_13_1 += 1;
                                s_13_1 = `${gif.rank_13_1}${toSuperscript(animal_13_1, animal_13_1)}${SL}`;
                                userData.sat.sat_13_1 += 1;
                                userData.sat.sat_13_1_h += 1;

                            }else if(ran_x == 2){
                                animal_13_2 += 1;
                                s_13_2 = `${gif.rank_13_2}${toSuperscript(animal_13_2, animal_13_2)}${SL}`;
                                userData.sat.sat_13_2 += 1;
                                userData.sat.sat_13_2_h += 1;

                            }else if(ran_x == 3){
                                animal_13_3 += 1;
                                s_13_3 = `${gif.rank_13_3}${toSuperscript(animal_13_3, animal_13_3)}${SL}`;
                                userData.sat.sat_13_3 += 1;
                                userData.sat.sat_13_3_h += 1;

                            }else if(ran_x == 4){
                                animal_13_4 += 1;
                                s_13_4 = `${gif.rank_13_4}${toSuperscript(animal_13_4, animal_13_4)}${SL}`;
                                userData.sat.sat_13_4 += 1;
                                userData.sat.sat_13_4_h += 1;

                            }else if(ran_x == 5){
                                animal_13_5 += 1;
                                s_13_5 = `${gif.rank_13_5}${toSuperscript(animal_13_5, animal_13_5)}${SL}`;
                                userData.sat.sat_13_5 += 1;
                                userData.sat.sat_13_5_h += 1;
                            }
                        }
                    }
                    killingMessage += `${s_13_1}${s_13_2}${s_13_3}${s_13_4}${s_13_5}`;

                    let s_14_1 = '';
                    let s_14_2 = '';
                    let s_14_3 = '';
                    let s_14_4 = '';
                    let s_14_5 = '';

                    let animal_14_1 = 0;
                    let animal_14_2 = 0;
                    let animal_14_3 = 0;
                    let animal_14_4 = 0;
                    let animal_14_5 = 0;

                    if(rank_v > 0){
                        killingMessage += `\n${gif.animal_rank_14}${space}`;
                        for(let i = 1; i <= rank_v; i++){
                            const ran_v = getRandomInt(1, 6);
                            if(ran_v == 1){
                                animal_14_1 += 1;
                                s_14_1 = `${gif.rank_14_1}${toSuperscript(animal_14_1, animal_14_1)}${SL}`;
                                userData.sat.sat_14_1 += 1;
                                userData.sat.sat_14_1_h += 1;

                            }else if(ran_v == 2){
                                animal_14_2 += 1;
                                s_14_2 = `${gif.rank_14_2}${toSuperscript(animal_14_2, animal_14_2)}${SL}`;
                                userData.sat.sat_14_2 += 1;
                                userData.sat.sat_14_2_h += 1;

                            }else if(ran_v == 3){
                                animal_14_3 += 1;
                                s_14_3 = `${gif.rank_14_3}${toSuperscript(animal_14_3, animal_14_3)}${SL}`;
                                userData.sat.sat_14_3 += 1;
                                userData.sat.sat_14_3_h += 1;

                            }else if(ran_v == 4){
                                animal_14_4 += 1;
                                s_14_4 = `${gif.rank_14_4}${toSuperscript(animal_14_4, animal_14_4)}${SL}`;
                                userData.sat.sat_14_4 += 1;
                                userData.sat.sat_14_4_h += 1;

                            }else if(ran_v == 5){
                                animal_14_5 += 1;
                                s_14_5 = `${gif.rank_14_5}${toSuperscript(animal_14_5, animal_14_5)}${SL}`;
                                userData.sat.sat_14_5 += 1;
                                userData.sat.sat_14_5_h += 1;
                            }
                        }
                    }
                    killingMessage += `${s_14_1}${s_14_2}${s_14_3}${s_14_4}${s_14_5}`;

                    // Special pet rank handling
                    let s_special_1 = '';
                    let s_special_2 = '';
                    let s_special_3 = '';
                    let s_special_4 = '';
                    let s_special_5 = '';

                    let animal_special_1 = 0;
                    let animal_special_2 = 0;
                    let animal_special_3 = 0;
                    let animal_special_4 = 0;
                    let animal_special_5 = 0;

                    if(rank_special > 0){
                        killingMessage += `\n${gif.animal_rank_special}${space}`;
                        for(let i = 1; i <= rank_special; i++){
                            const ran_special = getRandomInt(1, 6);
                            if(ran_special == 1){
                                animal_special_1 += 1;
                                s_special_1 = `${gif.rank_special_1}${toSuperscript(animal_special_1, animal_special_1)}${SL}`;
                                userData.sat.sat_special_1 += 1;
                                userData.sat.sat_special_1_h += 1;

                            }else if(ran_special == 2){
                                animal_special_2 += 1;
                                s_special_2 = `${gif.rank_special_2}${toSuperscript(animal_special_2, animal_special_2)}${SL}`;
                                userData.sat.sat_special_2 += 1;
                                userData.sat.sat_special_2_h += 1;

                            }else if(ran_special == 3){
                                animal_special_3 += 1;
                                s_special_3 = `${gif.rank_special_3}${toSuperscript(animal_special_3, animal_special_3)}${SL}`;
                                userData.sat.sat_special_3 += 1;
                                userData.sat.sat_special_3_h += 1;

                            }else if(ran_special == 4){
                                animal_special_4 += 1;
                                s_special_4 = `${gif.rank_special_4}${toSuperscript(animal_special_4, animal_special_4)}${SL}`;
                                userData.sat.sat_special_4 += 1;
                                userData.sat.sat_special_4_h += 1;

                            }else if(ran_special == 5){
                                animal_special_5 += 1;
                                s_special_5 = `${gif.rank_special_5}${toSuperscript(animal_special_5, animal_special_5)}${SL}`;
                                userData.sat.sat_special_5 += 1;
                                userData.sat.sat_special_5_h += 1;
                            }
                        }
                    }
                    killingMessage += `${s_special_1}${s_special_2}${s_special_3}${s_special_4}${s_special_5}`;

                    userData.autohunt.amount_animal = 0;

                    const embed = customEmbed()
                        .setAuthor({ name: `${user.displayName}'s killing bot!`, iconURL: user.displayAvatarURL() })
                        .setColor('Green')
                        .setDescription(`\n\n!🤖 [**DONE**]: KILLING BOT\n\nKILLED:\n${killingMessage}`)
                        .setTimestamp()
                    message.channel.send({ embeds: [embed] });

                    try{ await userData.save(); }catch(error){}
                    return;
                }

                const timeUntilReset = userData.autohunt.datekilling - currentTime;
                const hours = Math.floor(timeUntilReset / (1000 * 60 * 60));
                const minutes = Math.floor((timeUntilReset % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((timeUntilReset % (1000 * 60)) / 1000);

                if(!userData.autohunt.autohunting){
                    const embed = customEmbed()
                        .setAuthor({ name: `${user.displayName}'s killing bot!`, iconURL: user.displayAvatarURL() })
                        .setColor('Blue')
                        .setDescription(`\n\n!🤖 [**Free**]: KILLING BOT\n\nTOTAL SPEND: ${userData.autohunt.spendTotal.toLocaleString()}\n\nTOTAL KILL: ${userData.autohunt.killTotal.toLocaleString()}\n\n`)
                        .setTimestamp()
                    message.channel.send({ embeds: [embed] });
    
                }else{
                    const embed = customEmbed()
                        .setAuthor({ name: `${user.displayName}'s killing bot!`, iconURL: user.displayAvatarURL() })
                        .setColor('Red')
                        .setDescription(`\n\n!🤖 [**KILLING**]: KILLING BOT\n\nFINISH TIME: ${hours}h, ${minutes}m, ${seconds}s\n\n`)
                        .setTimestamp()
                    message.channel.send({ embeds: [embed] });
                }
            }
 
        }catch(error){
            console.log(`rank error ${error}`);
        }
    },
};