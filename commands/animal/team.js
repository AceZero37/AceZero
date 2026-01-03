const { sym, gif, getUser, xpToLevel, xpToRateXp, customEmbed, getAnimalNameByName, getAnimalIdByName, checkOwnAnimal, stateHP, stateSTR, statePR, stateWP, stateMAG, stateMR, cooldown, getRank, getWeaponRank, getPassive, SimpleEmbed, labelButton, ButtonStyle, threeButton, getCollectionButton } = require('../../functioon/function');

const cooldowns = new Map();
let CDT = 9_000;
var getId = [];
var cdId = [];
var prem = [];

module.exports = {
    name: 'team',
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

            const sat = userData.sat;
            const choice = args[0];

            if(choice){
                if(choice == 'rename'){
                    const command = message.content;
                    let text = command.slice(`team rename`.length);
                    userData.sat.team.team_name = text;
                    message.channel.send({ embeds: [SimpleEmbed(`**Now <@${user.id}>** You successfully changed your team name to: **${text}**`)] });
                    await userData.save();
                    return;

                }else if(choice == 'add'){
                    if(userData.sat.team.team_set == 1){
                        let messageTeam = `**Now <@${user.id}>** Your team has been updated!\n${gif.blank_gif}\nYour team: `;
                        const name_animal = args[1];
                        const name = getAnimalNameByName(name_animal); 
                        if(!await checkOwnAnimal(name, user.id)){ message.reply({ embeds: [SimpleEmbed(`**Now <@${user.id}>** you do not own this animal!`)] }); return; }
                        
                        const position = parseInt(args[2]);
                        if(position){
                            if(position > 3 || position < 1){ message.reply({ embeds: [SimpleEmbed(`**Now <@${user.id}>** Invalid team position! It must be between 1-3!`)] }); return }

                            if(position == 1){
                                if(name == sat.team.postion2 || name == sat.team.postion3){ message.reply({ embeds: [SimpleEmbed(`Now <@${user.id}>** This animal is already in your team!`)] }); return; }
                                sat.team.postion1 = name; 
                                sat.team.team_equipe1 = name;
                            }
                            else if(position == 2){ 
                                if(name == sat.team.postion1 || name == sat.team.postion3){ message.reply({ embeds: [SimpleEmbed(`Now <@${user.id}>** This animal is already in your team!`)] }); return; }
                                sat.team.postion2 = name; 
                                sat.team.team_equipe2 = name;
                            }
                            else if(position == 3){ 
                                if(name == sat.team.postion2 || name == sat.team.postion1){ message.reply({ embeds: [SimpleEmbed(`Now <@${user.id}>** This animal is already in your team!`)] }); return; }
                                sat.team.postion3 = name; 
                                sat.team.team_equipe3 = name;
                            }

                        }else{
                            if(!sat.team.postion1){
                                if(name == sat.team.postion2 || name == sat.team.postion3){ message.reply({ embeds: [SimpleEmbed(`Now <@${user.id}>** This animal is already in your team!`)] }); return; }
                                sat.team.postion1 = name;
                                sat.team.team_equipe1 = name;
            
                            }else if(!sat.team.postion2){
                                if(name == sat.team.postion1 || name == sat.team.postion3){ message.reply({ embeds: [SimpleEmbed(`Now <@${user.id}>** This animal is already in your team!`)] }); return; }
                                sat.team.postion2 = name;
                                sat.team.team_equipe2 = name;
            
                            }else if(!sat.team.postion3){
                                if(name == sat.team.postion2 || name == sat.team.postion1){ message.reply({ embeds: [SimpleEmbed(`Now <@${user.id}>** This animal is already in your team!`)] }); return; }
                                sat.team.postion3 = name;
                                sat.team.team_equipe3 = name;
            
                            }else{
                                message.reply({ embeds: [SimpleEmbed(`Now <@${user.id}>** Your team is full! Please specify a position with ${sym}team add {animal} {position}${sym}!`)] });
                                return;
                            }
                        }

                        if(sat.team.postion1){
                            const postion1_name = getAnimalNameByName(sat.team.postion1)
                            if(postion1_name){ messageTeam += `[1]${gif[`rank_${getAnimalIdByName(postion1_name)}`]} ` }
                        }
                        if(sat.team.postion2){
                            const postion2_name = getAnimalNameByName(sat.team.postion2)
                            if(postion2_name){ messageTeam += `[2]${gif[`rank_${getAnimalIdByName(postion2_name)}`]} ` }
                        }
                        if(sat.team.postion3){
                            const postion3_name = getAnimalNameByName(sat.team.postion3)
                            if(postion3_name){ messageTeam += `[3]${gif[`rank_${getAnimalIdByName(postion3_name)}`]}` }
                        }

                        message.channel.send({ embeds: [SimpleEmbed(messageTeam)] });
                        await userData.save();

                    }else if(userData.sat.team.team_set == 2){
                        let messageTeam = `**Now <@${user.id}>** Your team has been updated!\n${gif.blank_gif}\nYour team: `;
                        const name_animal = args[1];
                        const name = getAnimalNameByName(name_animal); 
                        if(!await checkOwnAnimal(name, user.id)){ message.reply({ embeds: [SimpleEmbed(`**Now <@${user.id}>** you do not own this animal!`)] }); return; }
                        
                        const position = parseInt(args[2]);
                        if(position){
                            if(position > 3 || position < 1){ message.reply({ embeds: [SimpleEmbed(`**Now <@${user.id}>** Invalid team position! It must be between 1-3!`)] }); return }

                            if(position == 1){
                                if(name == sat.team.postion5 || name == sat.team.postion6){ message.reply({ embeds: [SimpleEmbed(`Now <@${user.id}>** This animal is already in your team!`)] }); return; }
                                sat.team.postion4 = name; 
                                sat.team.team_equipe1 = name;
                            }
                            else if(position == 2){ 
                                if(name == sat.team.postion4 || name == sat.team.postion6){ message.reply({ embeds: [SimpleEmbed(`Now <@${user.id}>** This animal is already in your team!`)] }); return; }
                                sat.team.postion5 = name; 
                                sat.team.team_equipe2 = name;
                            }
                            else if(position == 3){ 
                                if(name == sat.team.postion5 || name == sat.team.postion4){ message.reply({ embeds: [SimpleEmbed(`Now <@${user.id}>** This animal is already in your team!`)] }); return; }
                                sat.team.postion6 = name; 
                                sat.team.team_equipe3 = name;
                            }

                        }else{
                            if(!sat.team.postion4){
                                if(name == sat.team.postion5 || name == sat.team.postion6){ message.reply({ embeds: [SimpleEmbed(`Now <@${user.id}>** This animal is already in your team!`)] }); return; }
                                sat.team.postion4 = name;
                                sat.team.team_equipe1 = name;
            
                            }else if(!sat.team.postion5){
                                if(name == sat.team.postion4 || name == sat.team.postion6){ message.reply({ embeds: [SimpleEmbed(`Now <@${user.id}>** This animal is already in your team!`)] }); return; }
                                sat.team.postion5 = name;
                                sat.team.team_equipe2 = name;
            
                            }else if(!sat.team.postion6){
                                if(name == sat.team.postion5 || name == sat.team.postion4){ message.reply({ embeds: [SimpleEmbed(`Now <@${user.id}>** This animal is already in your team!`)] }); return; }
                                sat.team.postion6 = name;
                                sat.team.team_equipe3 = name;
            
                            }else{
                                message.reply({ embeds: [SimpleEmbed(`Now <@${user.id}>** Your team is full! Please specify a position with ${sym}team add {animal} {position}${sym}!`)] });
                                return;
                            }
                        }

                        if(sat.team.postion4){
                            const postion1_name = getAnimalNameByName(sat.team.postion4)
                            if(postion1_name){ messageTeam += `[1]${gif[`rank_${getAnimalIdByName(postion1_name)}`]} ` }
                        }
                        if(sat.team.postion5){
                            const postion2_name = getAnimalNameByName(sat.team.postion5)
                            if(postion2_name){ messageTeam += `[2]${gif[`rank_${getAnimalIdByName(postion2_name)}`]} ` }
                        }
                        if(sat.team.postion6){
                            const postion3_name = getAnimalNameByName(sat.team.postion6)
                            if(postion3_name){ messageTeam += `[3]${gif[`rank_${getAnimalIdByName(postion3_name)}`]}` }
                        }

                        message.channel.send({ embeds: [SimpleEmbed(messageTeam)] });
                        await userData.save();
                    }
                }else if(choice == 'remove'){
                    if(userData.sat.team.team_set == 1){
                        let messageTeam = `Now <@${user.id}>** Your team has been updated!\n${gif.blank_gif}\nYour team: `;
                        const position = parseInt(args[1]);

                        if(position == 1){
                            if(!sat.team.postion2 && !sat.team.postion3){ message.reply({ embeds: [SimpleEmbed(`**Now <@${user.id}>**, You need to keep at least one animal in the team!`)] }); return; }
                            if(!sat.team.postion1){ messageTeam = (`**Now <@${user.id}>** failed to remove that animal!\n${gif.blank_gif} **|** Your team: `); return; }
                            sat.team.postion1 = '';
                            sat.team.team_equipe1 = '';
                        }
                        if(position == 2){
                            if(!sat.team.postion1 && !sat.team.postion3){ message.reply({ embeds: [SimpleEmbed(`**Now <@${user.id}>**, You need to keep at least one animal in the team!`)] }); return; }
                            if(!sat.team.postion2){ messageTeam = (`**Now <@${user.id}>** failed to remove that animal!\n${gif.blank_gif} **|** Your team: `); return; }
                            sat.team.postion2 = '';
                            sat.team.team_equipe2 = '';
                        }
                        if(position == 3){
                            if(!sat.team.postion2 && !sat.team.postion1){ message.reply({ embeds: [SimpleEmbed(`**Now <@${user.id}>**, You need to keep at least one animal in the team!`)] }); return; }
                            if(!sat.team.postion3){ messageTeam = (`**Now <@${user.id}>** failed to remove that animal!\n${gif.blank_gif} **|** Your team: `); return; }
                            sat.team.postion3 = '';
                            sat.team.team_equipe3 = '';
                        }

                        if(sat.team.postion1){
                            const postion1_name = getAnimalNameByName(sat.team.postion1)
                            if(postion1_name){ messageTeam += `[1]${gif[`rank_${getAnimalIdByName(postion1_name)}`]} ` }
                        }
                        if(sat.team.postion2){
                            const postion2_name = getAnimalNameByName(sat.team.postion2)
                            if(postion2_name){ messageTeam += `[2]${gif[`rank_${getAnimalIdByName(postion2_name)}`]} ` }
                        }
                        if(sat.team.postion3){
                            const postion3_name = getAnimalNameByName(sat.team.postion3)
                            if(postion3_name){ messageTeam += `[3]${gif[`rank_${getAnimalIdByName(postion3_name)}`]}` }
                        }

                        message.channel.send({ embeds: [SimpleEmbed(messageTeam)] });
                        await userData.save();
                        }
                    }else if(userData.sat.team.team_set == 2){
                        let messageTeam = `Now <@${user.id}>** Your team has been updated!\n${gif.blank_gif}\nYour team: `;
                        const position = parseInt(args[1]);

                        if(position == 1){
                            if(!sat.team.postion5 && !sat.team.postion6){ message.reply({ embeds: [SimpleEmbed(`**Now <@${user.id}>**, You need to keep at least one animal in the team!`)] }); return; }
                            if(!sat.team.postion4){ messageTeam = (`**Now <@${user.id}>** failed to remove that animal!\n${gif.blank_gif} **|** Your team: `); return; }
                            sat.team.postion4 = '';
                            sat.team.team_equipe1 = '';
                        }
                        if(position == 2){
                            if(!sat.team.postion4 && !sat.team.postion6){ message.reply({ embeds: [SimpleEmbed(`**Now <@${user.id}>**, You need to keep at least one animal in the team!`)] }); return; }
                            if(!sat.team.postion5){ messageTeam = (`**Now <@${user.id}>** failed to remove that animal!\n${gif.blank_gif} **|** Your team: `); return; }
                            sat.team.postion5 = '';
                            sat.team.team_equipe2 = '';
                        }
                        if(position == 3){
                            if(!sat.team.postion5 && !sat.team.postion4){ message.reply({ embeds: [SimpleEmbed(`**Now <@${user.id}>**, You need to keep at least one animal in the team!`)] }); return; }
                            if(!sat.team.postion6){ messageTeam = (`**Now <@${user.id}>** failed to remove that animal!\n${gif.blank_gif} **|** Your team: `); return; }
                            sat.team.postion6 = '';
                            sat.team.team_equipe3 = '';
                        }

                        if(sat.team.postion1){
                            const postion1_name = getAnimalNameByName(sat.team.postion1)
                            if(postion1_name){ messageTeam += `[1]${gif[`rank_${getAnimalIdByName(postion1_name)}`]} ` }
                        }
                        if(sat.team.postion2){
                            const postion2_name = getAnimalNameByName(sat.team.postion2)
                            if(postion2_name){ messageTeam += `[2]${gif[`rank_${getAnimalIdByName(postion2_name)}`]} ` }
                        }
                        if(sat.team.postion3){
                            const postion3_name = getAnimalNameByName(sat.team.postion3)
                            if(postion3_name){ messageTeam += `[3]${gif[`rank_${getAnimalIdByName(postion3_name)}`]}` }
                        }

                        message.channel.send({ embeds: [SimpleEmbed(messageTeam)] });
                        await userData.save();
                    }
                return;
            }

            const left_page = labelButton('left_page', '>', ButtonStyle.Primary);
            const right_page = labelButton('right_page', '<', ButtonStyle.Primary);
            const save_page = labelButton('save_page', '⭐', ButtonStyle.Primary);
            const allButton = threeButton(right_page, left_page, save_page);

            right_page.setDisabled(true);
            let save = '';

            if(sat.team.team_set == 1){ save_page.setDisabled(true); save = '⭐'; }else{ save_page.setDisabled(false); };

            const embed = customEmbed()
                .setAuthor({ name: `${user.displayName}`,iconURL: user.displayAvatarURL() })
                .setDescription(`${sym}team add {animal} {pos}${sym} Add an animal to your team\n${sym}team remove {pos}${sym} Removes an animal from your team\n${sym}team rename {name}${sym} Renames your team`)
                .setColor('#8EC3FF')
                .setFooter({ text: `Current Streak: ${userData.sat.team.streak} | Highest Streak: ${userData.sat.team.higher_streak} ${save}` })

            if(!getAnimalNameByName(sat.team.postion1)){ sat.team.postion1 = ''; }
            if(sat.team.postion1){
                const P_id = getAnimalIdByName(sat.team.postion1);
                const xp = parseInt(sat[`sat_${P_id}_xp`]);
                const lvl = xpToLevel(xp);
                const rateLvl = xpToRateXp(xp);

                let hp = stateHP(parseInt(`${gif[`rank_${P_id}_hp`]}`), lvl);
                let str = stateSTR(parseInt(`${gif[`rank_${P_id}_str`]}`), lvl);
                let pr = statePR(parseInt(`${gif[`rank_${P_id}_pr`]}`), lvl);

                let wp = stateWP(parseInt(`${gif[`rank_${P_id}_wp`]}`), lvl);
                let mag = stateMAG(parseInt(`${gif[`rank_${P_id}_mag`]}`), lvl);
                let mr = stateMR(parseInt(`${gif[`rank_${P_id}_mr`]}`), lvl);

                let weapon_message = '';
                for(const allwp of userData.wp){
                    const str = `${allwp}`;
                    const [id, name, rank, passive, percen, boolStr, passive_two] = str.split(' ');

                    let passive_two_gif = '';
                    if(passive_two){ passive_two_gif = getPassive(passive_two) }

                    if(boolStr == sat.team.postion1){
                        weapon_message = `\n${sym}${id}${sym} ${getRank(rank)} ${getWeaponRank(name, rank)} ${getPassive(passive)}${passive_two_gif} ${percen}%`;
                    }
                }

                embed.addFields(
                        { name: `[1] ${gif[`rank_${P_id}`]} ${sat.team.postion1}`, value: `Lvl ${lvl} ${sym}[${xp.toLocaleString()}/${rateLvl}]${sym}\n${gif.state_hp} ${sym}${hp}${sym} ${gif.state_wp} ${sym}${wp}${sym}\n${gif.state_str} ${sym}${str}${sym} ${gif.state_mag} ${sym}${mag}${sym}\n${gif.state_pr} ${sym}${pr}%${sym} ${gif.state_mr} ${sym}${mr}%${sym}${weapon_message}`, inline: true },
                    )
            }else if(!sat.team.postion1){
                embed.addFields(
                        { name: `[1] none`, value: `${sym}team add {animal} 1${sym}`, inline: true },
                    )
            }

            if(!getAnimalNameByName(sat.team.postion2)){ sat.team.postion2 = ''; }
            if(sat.team.postion2){
                const P_id = getAnimalIdByName(sat.team.postion2);
                const xp = parseInt(sat[`sat_${P_id}_xp`]);
                const lvl = xpToLevel(xp);
                const rateLvl = xpToRateXp(xp);

                let hp = stateHP(parseInt(`${gif[`rank_${P_id}_hp`]}`), lvl);
                let str = stateSTR(parseInt(`${gif[`rank_${P_id}_str`]}`), lvl);
                let pr = statePR(parseInt(`${gif[`rank_${P_id}_pr`]}`), lvl);

                let wp = stateWP(parseInt(`${gif[`rank_${P_id}_wp`]}`), lvl);
                let mag = stateMAG(parseInt(`${gif[`rank_${P_id}_mag`]}`), lvl);
                let mr = stateMR(parseInt(`${gif[`rank_${P_id}_mr`]}`), lvl);

                let weapon_message = '';
                for(const allwp of userData.wp){
                    const str = `${allwp}`;
                    const [id, name, rank, passive, percen, boolStr, passive_two] = str.split(' ');

                    let passive_two_gif = '';
                    if(passive_two){ passive_two_gif = getPassive(passive_two) }

                    if(boolStr == sat.team.postion2){
                        weapon_message = `\n${sym}${id}${sym} ${getRank(rank)} ${getWeaponRank(name, rank)} ${getPassive(passive)}${passive_two_gif} ${percen}%`;
                    }
                }

                embed.addFields(
                        { name: `[2] ${gif[`rank_${P_id}`]} ${sat.team.postion2}`, value: `Lvl ${lvl} ${sym}[${xp.toLocaleString()}/${rateLvl}]${sym}\n${gif.state_hp} ${sym}${hp}${sym} ${gif.state_wp} ${sym}${wp}${sym}\n${gif.state_str} ${sym}${str}${sym} ${gif.state_mag} ${sym}${mag}${sym}\n${gif.state_pr} ${sym}${pr}%${sym} ${gif.state_mr} ${sym}${mr}%${sym}${weapon_message}`, inline: true },
                    )
            }else if(!sat.team.postion2){
                embed.addFields(
                        { name: `[2] none`, value: `${sym}team add {animal} 2${sym}`, inline: true },
                    )
            }

            if(!getAnimalNameByName(sat.team.postion3)){ sat.team.postion3 = ''; }
            if(sat.team.postion3){
                const P_id = getAnimalIdByName(sat.team.postion3);
                const xp = parseInt(sat[`sat_${P_id}_xp`]);
                const lvl = xpToLevel(xp);
                const rateLvl = xpToRateXp(xp);

                let hp = stateHP(parseInt(`${gif[`rank_${P_id}_hp`]}`), lvl);
                let str = stateSTR(parseInt(`${gif[`rank_${P_id}_str`]}`), lvl);
                let pr = statePR(parseInt(`${gif[`rank_${P_id}_pr`]}`), lvl);

                let wp = stateWP(parseInt(`${gif[`rank_${P_id}_wp`]}`), lvl);
                let mag = stateMAG(parseInt(`${gif[`rank_${P_id}_mag`]}`), lvl);
                let mr = stateMR(parseInt(`${gif[`rank_${P_id}_mr`]}`), lvl);

                let weapon_message = '';
                for(const allwp of userData.wp){
                    const str = `${allwp}`;
                    const [id, name, rank, passive, percen, boolStr, passive_two] = str.split(' ');

                    let passive_two_gif = '';
                    if(passive_two){ passive_two_gif = getPassive(passive_two) }

                    if(boolStr == sat.team.postion3){
                        weapon_message = `\n${sym}${id}${sym} ${getRank(rank)} ${getWeaponRank(name, rank)} ${getPassive(passive)}${passive_two_gif} ${percen}%`;
                    }
                }

                embed.addFields(
                    { name: `[3] ${gif[`rank_${P_id}`]} ${sat.team.postion3}`, value: `Lvl ${lvl} ${sym}[${xp.toLocaleString()}/${rateLvl}]${sym}\n${gif.state_hp} ${sym}${hp}${sym} ${gif.state_wp} ${sym}${wp}${sym}\n${gif.state_str} ${sym}${str}${sym} ${gif.state_mag} ${sym}${mag}${sym}\n${gif.state_pr} ${sym}${pr}%${sym} ${gif.state_mr} ${sym}${mr}%${sym}${weapon_message}`, inline: true },
                    )
            }else if(!sat.team.postion3){
                embed.addFields(
                        { name: `[3] none`, value: `${sym}team add {animal} 3${sym}`, inline: true },
                    )
            }

            const mgs = await message.channel.send({ embeds: [embed], components: [allButton] });

            const collector = getCollectionButton(mgs, 60_000);

            collector.on('end', (collected, reason) => {
                if (reason === 'time') {
                    left_page.setDisabled(true);
                    right_page.setDisabled(true);
                    save_page.setDisabled(true);
                    mgs.edit({ embeds: [embed.setColor('#3D3D3D')], components: [allButton] });
                    return;
                }
            });

            let team = 1;

            collector.on('collect', async (interaction) => {
                if(interaction.member.user.id !== user.id){
                    await interaction.reply({ content: 'This button is not for you!', ephemeral: true });
                    return;
                }

                if(interaction.customId === 'left_page'){
                    let save = '';
                    if(sat.team.team_set == 2){ save_page.setDisabled(true); save = '⭐'; }else{ save_page.setDisabled(false); };
                    team = 2;
                    right_page.setDisabled(false);
                    left_page.setDisabled(true);

                    const embed = customEmbed()
                        .setAuthor({ name: `${user.displayName}`,iconURL: user.displayAvatarURL() })
                        .setDescription(`${sym}team add {animal} {pos}${sym} Add an animal to your team\n${sym}team remove {pos}${sym} Removes an animal from your team\n${sym}team rename {name}${sym} Renames your team`)
                        .setColor('#8EC3FF')
                        .setFooter({ text: `Current Streak: ${userData.sat.team.streak_two} | Highest Streak: ${userData.sat.team.higher_streak_two} ${save}` })

                    if(!getAnimalNameByName(sat.team.postion4)){ sat.team.postion4 = ''; }
                    if(sat.team.postion4){
                        const P_id = getAnimalIdByName(sat.team.postion4);
                        const xp = parseInt(sat[`sat_${P_id}_xp`]);
                        const lvl = xpToLevel(xp);
                        const rateLvl = xpToRateXp(xp);
        
                        let hp = stateHP(parseInt(`${gif[`rank_${P_id}_hp`]}`), lvl);
                        let str = stateSTR(parseInt(`${gif[`rank_${P_id}_str`]}`), lvl);
                        let pr = statePR(parseInt(`${gif[`rank_${P_id}_pr`]}`), lvl);
        
                        let wp = stateWP(parseInt(`${gif[`rank_${P_id}_wp`]}`), lvl);
                        let mag = stateMAG(parseInt(`${gif[`rank_${P_id}_mag`]}`), lvl);
                        let mr = stateMR(parseInt(`${gif[`rank_${P_id}_mr`]}`), lvl);
        
                        let weapon_message = '';
                        for(const allwp of userData.wp){
                            const str = `${allwp}`;
                            const [id, name, rank, passive, percen, boolStr, passive_two] = str.split(' ');
        
                            let passive_two_gif = '';
                            if(passive_two){ passive_two_gif = getPassive(passive_two) }
        
                            if(boolStr == sat.team.postion4){
                                weapon_message = `\n${sym}${id}${sym} ${getRank(rank)} ${getWeaponRank(name, rank)} ${getPassive(passive)}${passive_two_gif} ${percen}%`;
                            }
                        }
        
                        embed.addFields(
                                { name: `[1] ${gif[`rank_${P_id}`]} ${sat.team.postion4}`, value: `Lvl ${lvl} ${sym}[${xp.toLocaleString()}/${rateLvl}]${sym}\n${gif.state_hp} ${sym}${hp}${sym} ${gif.state_wp} ${sym}${wp}${sym}\n${gif.state_str} ${sym}${str}${sym} ${gif.state_mag} ${sym}${mag}${sym}\n${gif.state_pr} ${sym}${pr}%${sym} ${gif.state_mr} ${sym}${mr}%${sym}${weapon_message}`, inline: true },
                            )
                    }else if(!sat.team.postion4){
                        embed.addFields(
                                { name: `[1] none`, value: `${sym}team add {animal} 1${sym}`, inline: true },
                            )
                    }
        
                    if(!getAnimalNameByName(sat.team.postion5)){ sat.team.postion5 = ''; }
                    if(sat.team.postion5){
                        const P_id = getAnimalIdByName(sat.team.postion5);
                        const xp = parseInt(sat[`sat_${P_id}_xp`]);
                        const lvl = xpToLevel(xp);
                        const rateLvl = xpToRateXp(xp);
        
                        let hp = stateHP(parseInt(`${gif[`rank_${P_id}_hp`]}`), lvl);
                        let str = stateSTR(parseInt(`${gif[`rank_${P_id}_str`]}`), lvl);
                        let pr = statePR(parseInt(`${gif[`rank_${P_id}_pr`]}`), lvl);
        
                        let wp = stateWP(parseInt(`${gif[`rank_${P_id}_wp`]}`), lvl);
                        let mag = stateMAG(parseInt(`${gif[`rank_${P_id}_mag`]}`), lvl);
                        let mr = stateMR(parseInt(`${gif[`rank_${P_id}_mr`]}`), lvl);
        
                        let weapon_message = '';
                        for(const allwp of userData.wp){
                            const str = `${allwp}`;
                            const [id, name, rank, passive, percen, boolStr, passive_two] = str.split(' ');
        
                            let passive_two_gif = '';
                            if(passive_two){ passive_two_gif = getPassive(passive_two) }
        
                            if(boolStr == sat.team.postion5){
                                weapon_message = `\n${sym}${id}${sym} ${getRank(rank)} ${getWeaponRank(name, rank)} ${getPassive(passive)}${passive_two_gif} ${percen}%`;
                            }
                        }
        
                        embed.addFields(
                                { name: `[2] ${gif[`rank_${P_id}`]} ${sat.team.postion5}`, value: `Lvl ${lvl} ${sym}[${xp.toLocaleString()}/${rateLvl}]${sym}\n${gif.state_hp} ${sym}${hp}${sym} ${gif.state_wp} ${sym}${wp}${sym}\n${gif.state_str} ${sym}${str}${sym} ${gif.state_mag} ${sym}${mag}${sym}\n${gif.state_pr} ${sym}${pr}%${sym} ${gif.state_mr} ${sym}${mr}%${sym}${weapon_message}`, inline: true },
                            )
                    }else if(!sat.team.postion5){
                        embed.addFields(
                                { name: `[2] none`, value: `${sym}team add {animal} 2${sym}`, inline: true },
                            )
                    }
        
                    if(!getAnimalNameByName(sat.team.postion6)){ sat.team.postion6 = ''; }
                    if(sat.team.postion6){
                        const P_id = getAnimalIdByName(sat.team.postion6);
                        const xp = parseInt(sat[`sat_${P_id}_xp`]);
                        const lvl = xpToLevel(xp);
                        const rateLvl = xpToRateXp(xp);
        
                        let hp = stateHP(parseInt(`${gif[`rank_${P_id}_hp`]}`), lvl);
                        let str = stateSTR(parseInt(`${gif[`rank_${P_id}_str`]}`), lvl);
                        let pr = statePR(parseInt(`${gif[`rank_${P_id}_pr`]}`), lvl);
        
                        let wp = stateWP(parseInt(`${gif[`rank_${P_id}_wp`]}`), lvl);
                        let mag = stateMAG(parseInt(`${gif[`rank_${P_id}_mag`]}`), lvl);
                        let mr = stateMR(parseInt(`${gif[`rank_${P_id}_mr`]}`), lvl);
        
                        let weapon_message = '';
                        for(const allwp of userData.wp){
                            const str = `${allwp}`;
                            const [id, name, rank, passive, percen, boolStr, passive_two] = str.split(' ');
        
                            let passive_two_gif = '';
                            if(passive_two){ passive_two_gif = getPassive(passive_two) }
        
                            if(boolStr == sat.team.postion6){
                                weapon_message = `\n${sym}${id}${sym} ${getRank(rank)} ${getWeaponRank(name, rank)} ${getPassive(passive)}${passive_two_gif} ${percen}%`;
                            }
                        }
        
                        embed.addFields(
                            { name: `[3] ${gif[`rank_${P_id}`]} ${sat.team.postion6}`, value: `Lvl ${lvl} ${sym}[${xp.toLocaleString()}/${rateLvl}]${sym}\n${gif.state_hp} ${sym}${hp}${sym} ${gif.state_wp} ${sym}${wp}${sym}\n${gif.state_str} ${sym}${str}${sym} ${gif.state_mag} ${sym}${mag}${sym}\n${gif.state_pr} ${sym}${pr}%${sym} ${gif.state_mr} ${sym}${mr}%${sym}${weapon_message}`, inline: true },
                            )
                    }else if(!sat.team.postion6){
                        embed.addFields(
                                { name: `[3] none`, value: `${sym}team add {animal} 3${sym}`, inline: true },
                            )
                    }

                    interaction.update({ embeds: [embed.setColor('#8EC3FF')], components: [allButton] });
                }

                if(interaction.customId === 'right_page'){
                    let save = '';
                    if(sat.team.team_set == 1){ save_page.setDisabled(true); save = '⭐'; }else{ save_page.setDisabled(false); };
                    team = 1;
                    left_page.setDisabled(false);
                    right_page.setDisabled(true);

                    const embed = customEmbed()
                        .setAuthor({ name: `${user.displayName}`,iconURL: user.displayAvatarURL() })
                        .setDescription(`${sym}team add {animal} {pos}${sym} Add an animal to your team\n${sym}team remove {pos}${sym} Removes an animal from your team\n${sym}team rename {name}${sym} Renames your team`)
                        .setColor('#8EC3FF')
                        .setFooter({ text: `Current Streak: ${userData.sat.team.streak} | Highest Streak: ${userData.sat.team.higher_streak} ${save}` })

                    if(!getAnimalNameByName(sat.team.postion1)){ sat.team.postion1 = ''; }
                    if(sat.team.postion1){
                        const P_id = getAnimalIdByName(sat.team.postion1);
                        const xp = parseInt(sat[`sat_${P_id}_xp`]);
                        const lvl = xpToLevel(xp);
                        const rateLvl = xpToRateXp(xp);
        
                        let hp = stateHP(parseInt(`${gif[`rank_${P_id}_hp`]}`), lvl);
                        let str = stateSTR(parseInt(`${gif[`rank_${P_id}_str`]}`), lvl);
                        let pr = statePR(parseInt(`${gif[`rank_${P_id}_pr`]}`), lvl);
        
                        let wp = stateWP(parseInt(`${gif[`rank_${P_id}_wp`]}`), lvl);
                        let mag = stateMAG(parseInt(`${gif[`rank_${P_id}_mag`]}`), lvl);
                        let mr = stateMR(parseInt(`${gif[`rank_${P_id}_mr`]}`), lvl);
        
                        let weapon_message = '';
                        for(const allwp of userData.wp){
                            const str = `${allwp}`;
                            const [id, name, rank, passive, percen, boolStr, passive_two] = str.split(' ');
        
                            let passive_two_gif = '';
                            if(passive_two){ passive_two_gif = getPassive(passive_two) }
        
                            if(boolStr == sat.team.postion1){
                                weapon_message = `\n${sym}${id}${sym} ${getRank(rank)} ${getWeaponRank(name, rank)} ${getPassive(passive)}${passive_two_gif} ${percen}%`;
                            }
                        }
        
                        embed.addFields(
                                { name: `[1] ${gif[`rank_${P_id}`]} ${sat.team.postion1}`, value: `Lvl ${lvl} ${sym}[${xp.toLocaleString()}/${rateLvl}]${sym}\n${gif.state_hp} ${sym}${hp}${sym} ${gif.state_wp} ${sym}${wp}${sym}\n${gif.state_str} ${sym}${str}${sym} ${gif.state_mag} ${sym}${mag}${sym}\n${gif.state_pr} ${sym}${pr}%${sym} ${gif.state_mr} ${sym}${mr}%${sym}${weapon_message}`, inline: true },
                            )
                    }else if(!sat.team.postion1){
                        embed.addFields(
                                { name: `[1] none`, value: `${sym}team add {animal} 1${sym}`, inline: true },
                            )
                    }
        
                    if(!getAnimalNameByName(sat.team.postion2)){ sat.team.postion2 = ''; }
                    if(sat.team.postion2){
                        const P_id = getAnimalIdByName(sat.team.postion2);
                        const xp = parseInt(sat[`sat_${P_id}_xp`]);
                        const lvl = xpToLevel(xp);
                        const rateLvl = xpToRateXp(xp);
        
                        let hp = stateHP(parseInt(`${gif[`rank_${P_id}_hp`]}`), lvl);
                        let str = stateSTR(parseInt(`${gif[`rank_${P_id}_str`]}`), lvl);
                        let pr = statePR(parseInt(`${gif[`rank_${P_id}_pr`]}`), lvl);
        
                        let wp = stateWP(parseInt(`${gif[`rank_${P_id}_wp`]}`), lvl);
                        let mag = stateMAG(parseInt(`${gif[`rank_${P_id}_mag`]}`), lvl);
                        let mr = stateMR(parseInt(`${gif[`rank_${P_id}_mr`]}`), lvl);
        
                        let weapon_message = '';
                        for(const allwp of userData.wp){
                            const str = `${allwp}`;
                            const [id, name, rank, passive, percen, boolStr, passive_two] = str.split(' ');
        
                            let passive_two_gif = '';
                            if(passive_two){ passive_two_gif = getPassive(passive_two) }
        
                            if(boolStr == sat.team.postion2){
                                weapon_message = `\n${sym}${id}${sym} ${getRank(rank)} ${getWeaponRank(name, rank)} ${getPassive(passive)}${passive_two_gif} ${percen}%`;
                            }
                        }
        
                        embed.addFields(
                                { name: `[2] ${gif[`rank_${P_id}`]} ${sat.team.postion2}`, value: `Lvl ${lvl} ${sym}[${xp.toLocaleString()}/${rateLvl}]${sym}\n${gif.state_hp} ${sym}${hp}${sym} ${gif.state_wp} ${sym}${wp}${sym}\n${gif.state_str} ${sym}${str}${sym} ${gif.state_mag} ${sym}${mag}${sym}\n${gif.state_pr} ${sym}${pr}%${sym} ${gif.state_mr} ${sym}${mr}%${sym}${weapon_message}`, inline: true },
                            )
                    }else if(!sat.team.postion2){
                        embed.addFields(
                                { name: `[2] none`, value: `${sym}team add {animal} 2${sym}`, inline: true },
                            )
                    }
        
                    if(!getAnimalNameByName(sat.team.postion3)){ sat.team.postion3 = ''; }
                    if(sat.team.postion3){
                        const P_id = getAnimalIdByName(sat.team.postion3);
                        const xp = parseInt(sat[`sat_${P_id}_xp`]);
                        const lvl = xpToLevel(xp);
                        const rateLvl = xpToRateXp(xp);
        
                        let hp = stateHP(parseInt(`${gif[`rank_${P_id}_hp`]}`), lvl);
                        let str = stateSTR(parseInt(`${gif[`rank_${P_id}_str`]}`), lvl);
                        let pr = statePR(parseInt(`${gif[`rank_${P_id}_pr`]}`), lvl);
        
                        let wp = stateWP(parseInt(`${gif[`rank_${P_id}_wp`]}`), lvl);
                        let mag = stateMAG(parseInt(`${gif[`rank_${P_id}_mag`]}`), lvl);
                        let mr = stateMR(parseInt(`${gif[`rank_${P_id}_mr`]}`), lvl);
        
                        let weapon_message = '';
                        for(const allwp of userData.wp){
                            const str = `${allwp}`;
                            const [id, name, rank, passive, percen, boolStr, passive_two] = str.split(' ');
        
                            let passive_two_gif = '';
                            if(passive_two){ passive_two_gif = getPassive(passive_two) }
        
                            if(boolStr == sat.team.postion3){
                                weapon_message = `\n${sym}${id}${sym} ${getRank(rank)} ${getWeaponRank(name, rank)} ${getPassive(passive)}${passive_two_gif} ${percen}%`;
                            }
                        }
        
                        embed.addFields(
                            { name: `[3] ${gif[`rank_${P_id}`]} ${sat.team.postion3}`, value: `Lvl ${lvl} ${sym}[${xp.toLocaleString()}/${rateLvl}]${sym}\n${gif.state_hp} ${sym}${hp}${sym} ${gif.state_wp} ${sym}${wp}${sym}\n${gif.state_str} ${sym}${str}${sym} ${gif.state_mag} ${sym}${mag}${sym}\n${gif.state_pr} ${sym}${pr}%${sym} ${gif.state_mr} ${sym}${mr}%${sym}${weapon_message}`, inline: true },
                            )
                    }else if(!sat.team.postion3){
                        embed.addFields(
                                { name: `[3] none`, value: `${sym}team add {animal} 3${sym}`, inline: true },
                            )
                    }

                    interaction.update({ embeds: [embed.setColor('#8EC3FF')], components: [allButton] });
                }

                if(interaction.customId === 'save_page'){
                    save_page.setDisabled(true);
                    const embed = customEmbed()
                        .setAuthor({ name: `${user.displayName}`,iconURL: user.displayAvatarURL() })
                        .setDescription(`${sym}team add {animal} {pos}${sym} Add an animal to your team\n${sym}team remove {pos}${sym} Removes an animal from your team\n${sym}team rename {name}${sym} Renames your team`)
                        .setColor('#8EC3FF')
                        .setFooter({ text: `Current Streak: ${userData.sat.team.streak} | Highest Streak: ${userData.sat.team.higher_streak} ⭐` })

                    let showStreak = '';

                    if(team == 1){
                        userData.sat.team.team_equipe1 = sat.team.postion1;
                        userData.sat.team.team_equipe2 = sat.team.postion2;
                        userData.sat.team.team_equipe3 = sat.team.postion3;

                        userData.sat.team.team_set = 1;

                        showStreak = `Current Streak: ${userData.sat.team.streak} | Highest Streak: ${userData.sat.team.higher_streak} ⭐`;

                        if(!getAnimalNameByName(sat.team.postion1)){ sat.team.postion1 = ''; }
                        if(sat.team.postion1){
                            const P_id = getAnimalIdByName(sat.team.postion1);
                            const xp = parseInt(sat[`sat_${P_id}_xp`]);
                            const lvl = xpToLevel(xp);
                            const rateLvl = xpToRateXp(xp);
            
                            let hp = stateHP(parseInt(`${gif[`rank_${P_id}_hp`]}`), lvl);
                            let str = stateSTR(parseInt(`${gif[`rank_${P_id}_str`]}`), lvl);
                            let pr = statePR(parseInt(`${gif[`rank_${P_id}_pr`]}`), lvl);
            
                            let wp = stateWP(parseInt(`${gif[`rank_${P_id}_wp`]}`), lvl);
                            let mag = stateMAG(parseInt(`${gif[`rank_${P_id}_mag`]}`), lvl);
                            let mr = stateMR(parseInt(`${gif[`rank_${P_id}_mr`]}`), lvl);
            
                            let weapon_message = '';
                            for(const allwp of userData.wp){
                                const str = `${allwp}`;
                                const [id, name, rank, passive, percen, boolStr, passive_two] = str.split(' ');
            
                                let passive_two_gif = '';
                                if(passive_two){ passive_two_gif = getPassive(passive_two) }
            
                                if(boolStr == sat.team.postion1){
                                    weapon_message = `\n${sym}${id}${sym} ${getRank(rank)} ${getWeaponRank(name, rank)} ${getPassive(passive)}${passive_two_gif} ${percen}%`;
                                }
                            }
            
                            embed.addFields(
                                    { name: `[1] ${gif[`rank_${P_id}`]} ${sat.team.postion1}`, value: `Lvl ${lvl} ${sym}[${xp.toLocaleString()}/${rateLvl}]${sym}\n${gif.state_hp} ${sym}${hp}${sym} ${gif.state_wp} ${sym}${wp}${sym}\n${gif.state_str} ${sym}${str}${sym} ${gif.state_mag} ${sym}${mag}${sym}\n${gif.state_pr} ${sym}${pr}%${sym} ${gif.state_mr} ${sym}${mr}%${sym}${weapon_message}`, inline: true },
                                )
                        }else if(!sat.team.postion1){
                            embed.addFields(
                                    { name: `[1] none`, value: `${sym}team add {animal} 1${sym}`, inline: true },
                                )
                        }
            
                        if(!getAnimalNameByName(sat.team.postion2)){ sat.team.postion2 = ''; }
                        if(sat.team.postion2){
                            const P_id = getAnimalIdByName(sat.team.postion2);
                            const xp = parseInt(sat[`sat_${P_id}_xp`]);
                            const lvl = xpToLevel(xp);
                            const rateLvl = xpToRateXp(xp);
            
                            let hp = stateHP(parseInt(`${gif[`rank_${P_id}_hp`]}`), lvl);
                            let str = stateSTR(parseInt(`${gif[`rank_${P_id}_str`]}`), lvl);
                            let pr = statePR(parseInt(`${gif[`rank_${P_id}_pr`]}`), lvl);
            
                            let wp = stateWP(parseInt(`${gif[`rank_${P_id}_wp`]}`), lvl);
                            let mag = stateMAG(parseInt(`${gif[`rank_${P_id}_mag`]}`), lvl);
                            let mr = stateMR(parseInt(`${gif[`rank_${P_id}_mr`]}`), lvl);
            
                            let weapon_message = '';
                            for(const allwp of userData.wp){
                                const str = `${allwp}`;
                                const [id, name, rank, passive, percen, boolStr, passive_two] = str.split(' ');
            
                                let passive_two_gif = '';
                                if(passive_two){ passive_two_gif = getPassive(passive_two) }
            
                                if(boolStr == sat.team.postion2){
                                    weapon_message = `\n${sym}${id}${sym} ${getRank(rank)} ${getWeaponRank(name, rank)} ${getPassive(passive)}${passive_two_gif} ${percen}%`;
                                }
                            }
            
                            embed.addFields(
                                    { name: `[2] ${gif[`rank_${P_id}`]} ${sat.team.postion2}`, value: `Lvl ${lvl} ${sym}[${xp.toLocaleString()}/${rateLvl}]${sym}\n${gif.state_hp} ${sym}${hp}${sym} ${gif.state_wp} ${sym}${wp}${sym}\n${gif.state_str} ${sym}${str}${sym} ${gif.state_mag} ${sym}${mag}${sym}\n${gif.state_pr} ${sym}${pr}%${sym} ${gif.state_mr} ${sym}${mr}%${sym}${weapon_message}`, inline: true },
                                )
                        }else if(!sat.team.postion2){
                            embed.addFields(
                                    { name: `[2] none`, value: `${sym}team add {animal} 2${sym}`, inline: true },
                                )
                        }

                        if(!getAnimalNameByName(sat.team.postion3)){ sat.team.postion3 = ''; }
                        if(sat.team.postion3){
                            const P_id = getAnimalIdByName(sat.team.postion3);
                            const xp = parseInt(sat[`sat_${P_id}_xp`]);
                            const lvl = xpToLevel(xp);
                            const rateLvl = xpToRateXp(xp);
            
                            let hp = stateHP(parseInt(`${gif[`rank_${P_id}_hp`]}`), lvl);
                            let str = stateSTR(parseInt(`${gif[`rank_${P_id}_str`]}`), lvl);
                            let pr = statePR(parseInt(`${gif[`rank_${P_id}_pr`]}`), lvl);
            
                            let wp = stateWP(parseInt(`${gif[`rank_${P_id}_wp`]}`), lvl);
                            let mag = stateMAG(parseInt(`${gif[`rank_${P_id}_mag`]}`), lvl);
                            let mr = stateMR(parseInt(`${gif[`rank_${P_id}_mr`]}`), lvl);
            
                            let weapon_message = '';
                            for(const allwp of userData.wp){
                                const str = `${allwp}`;
                                const [id, name, rank, passive, percen, boolStr, passive_two] = str.split(' ');
            
                                let passive_two_gif = '';
                                if(passive_two){ passive_two_gif = getPassive(passive_two) }
            
                                if(boolStr == sat.team.postion3){
                                    weapon_message = `\n${sym}${id}${sym} ${getRank(rank)} ${getWeaponRank(name, rank)} ${getPassive(passive)}${passive_two_gif} ${percen}%`;
                                }
                            }
            
                            embed.addFields(
                                { name: `[3] ${gif[`rank_${P_id}`]} ${sat.team.postion3}`, value: `Lvl ${lvl} ${sym}[${xp.toLocaleString()}/${rateLvl}]${sym}\n${gif.state_hp} ${sym}${hp}${sym} ${gif.state_wp} ${sym}${wp}${sym}\n${gif.state_str} ${sym}${str}${sym} ${gif.state_mag} ${sym}${mag}${sym}\n${gif.state_pr} ${sym}${pr}%${sym} ${gif.state_mr} ${sym}${mr}%${sym}${weapon_message}`, inline: true },
                                )
                        }else if(!sat.team.postion3){
                            embed.addFields(
                                    { name: `[3] none`, value: `${sym}team add {animal} 3${sym}`, inline: true },
                                )
                        }
                    }else if(team == 2){
                        userData.sat.team.team_equipe1 = sat.team.postion4;
                        userData.sat.team.team_equipe2 = sat.team.postion5;
                        userData.sat.team.team_equipe3 = sat.team.postion6;

                        userData.sat.team.team_set = 2;

                        showStreak = `Current Streak: ${userData.sat.team.streak_two} | Highest Streak: ${userData.sat.team.higher_streak_two} ⭐`;

                        if(!getAnimalNameByName(sat.team.postion4)){ sat.team.postion4 = ''; }
                        if(sat.team.postion4){
                            const P_id = getAnimalIdByName(sat.team.postion4);
                            const xp = parseInt(sat[`sat_${P_id}_xp`]);
                            const lvl = xpToLevel(xp);
                            const rateLvl = xpToRateXp(xp);
            
                            let hp = stateHP(parseInt(`${gif[`rank_${P_id}_hp`]}`), lvl);
                            let str = stateSTR(parseInt(`${gif[`rank_${P_id}_str`]}`), lvl);
                            let pr = statePR(parseInt(`${gif[`rank_${P_id}_pr`]}`), lvl);
            
                            let wp = stateWP(parseInt(`${gif[`rank_${P_id}_wp`]}`), lvl);
                            let mag = stateMAG(parseInt(`${gif[`rank_${P_id}_mag`]}`), lvl);
                            let mr = stateMR(parseInt(`${gif[`rank_${P_id}_mr`]}`), lvl);
            
                            let weapon_message = '';
                            for(const allwp of userData.wp){
                                const str = `${allwp}`;
                                const [id, name, rank, passive, percen, boolStr, passive_two] = str.split(' ');
            
                                let passive_two_gif = '';
                                if(passive_two){ passive_two_gif = getPassive(passive_two) }
            
                                if(boolStr == sat.team.postion4){
                                    weapon_message = `\n${sym}${id}${sym} ${getRank(rank)} ${getWeaponRank(name, rank)} ${getPassive(passive)}${passive_two_gif} ${percen}%`;
                                }
                            }
            
                            embed.addFields(
                                    { name: `[1] ${gif[`rank_${P_id}`]} ${sat.team.postion1}`, value: `Lvl ${lvl} ${sym}[${xp.toLocaleString()}/${rateLvl}]${sym}\n${gif.state_hp} ${sym}${hp}${sym} ${gif.state_wp} ${sym}${wp}${sym}\n${gif.state_str} ${sym}${str}${sym} ${gif.state_mag} ${sym}${mag}${sym}\n${gif.state_pr} ${sym}${pr}%${sym} ${gif.state_mr} ${sym}${mr}%${sym}${weapon_message}`, inline: true },
                                )
                        }else if(!sat.team.postion4){
                            embed.addFields(
                                    { name: `[1] none`, value: `${sym}team add {animal} 1${sym}`, inline: true },
                                )
                        }
            
                        if(!getAnimalNameByName(sat.team.postion5)){ sat.team.postion5 = ''; }
                        if(sat.team.postion5){
                            const P_id = getAnimalIdByName(sat.team.postion5);
                            const xp = parseInt(sat[`sat_${P_id}_xp`]);
                            const lvl = xpToLevel(xp);
                            const rateLvl = xpToRateXp(xp);
            
                            let hp = stateHP(parseInt(`${gif[`rank_${P_id}_hp`]}`), lvl);
                            let str = stateSTR(parseInt(`${gif[`rank_${P_id}_str`]}`), lvl);
                            let pr = statePR(parseInt(`${gif[`rank_${P_id}_pr`]}`), lvl);
            
                            let wp = stateWP(parseInt(`${gif[`rank_${P_id}_wp`]}`), lvl);
                            let mag = stateMAG(parseInt(`${gif[`rank_${P_id}_mag`]}`), lvl);
                            let mr = stateMR(parseInt(`${gif[`rank_${P_id}_mr`]}`), lvl);
            
                            let weapon_message = '';
                            for(const allwp of userData.wp){
                                const str = `${allwp}`;
                                const [id, name, rank, passive, percen, boolStr, passive_two] = str.split(' ');
            
                                let passive_two_gif = '';
                                if(passive_two){ passive_two_gif = getPassive(passive_two) }
            
                                if(boolStr == sat.team.postion5){
                                    weapon_message = `\n${sym}${id}${sym} ${getRank(rank)} ${getWeaponRank(name, rank)} ${getPassive(passive)}${passive_two_gif} ${percen}%`;
                                }
                            }
            
                            embed.addFields(
                                    { name: `[2] ${gif[`rank_${P_id}`]} ${sat.team.postion2}`, value: `Lvl ${lvl} ${sym}[${xp.toLocaleString()}/${rateLvl}]${sym}\n${gif.state_hp} ${sym}${hp}${sym} ${gif.state_wp} ${sym}${wp}${sym}\n${gif.state_str} ${sym}${str}${sym} ${gif.state_mag} ${sym}${mag}${sym}\n${gif.state_pr} ${sym}${pr}%${sym} ${gif.state_mr} ${sym}${mr}%${sym}${weapon_message}`, inline: true },
                                )
                        }else if(!sat.team.postion5){
                            embed.addFields(
                                    { name: `[2] none`, value: `${sym}team add {animal} 2${sym}`, inline: true },
                                )
                        }
            
                        if(!getAnimalNameByName(sat.team.postion6)){ sat.team.postion6 = ''; }
                        if(sat.team.postion6){
                            const P_id = getAnimalIdByName(sat.team.postion6);
                            const xp = parseInt(sat[`sat_${P_id}_xp`]);
                            const lvl = xpToLevel(xp);
                            const rateLvl = xpToRateXp(xp);
            
                            let hp = stateHP(parseInt(`${gif[`rank_${P_id}_hp`]}`), lvl);
                            let str = stateSTR(parseInt(`${gif[`rank_${P_id}_str`]}`), lvl);
                            let pr = statePR(parseInt(`${gif[`rank_${P_id}_pr`]}`), lvl);
            
                            let wp = stateWP(parseInt(`${gif[`rank_${P_id}_wp`]}`), lvl);
                            let mag = stateMAG(parseInt(`${gif[`rank_${P_id}_mag`]}`), lvl);
                            let mr = stateMR(parseInt(`${gif[`rank_${P_id}_mr`]}`), lvl);
            
                            let weapon_message = '';
                            for(const allwp of userData.wp){
                                const str = `${allwp}`;
                                const [id, name, rank, passive, percen, boolStr, passive_two] = str.split(' ');
            
                                let passive_two_gif = '';
                                if(passive_two){ passive_two_gif = getPassive(passive_two) }
            
                                if(boolStr == sat.team.postion6){
                                    weapon_message = `\n${sym}${id}${sym} ${getRank(rank)} ${getWeaponRank(name, rank)} ${getPassive(passive)}${passive_two_gif} ${percen}%`;
                                }
                            }
            
                            embed.addFields(
                                { name: `[3] ${gif[`rank_${P_id}`]} ${sat.team.postion3}`, value: `Lvl ${lvl} ${sym}[${xp.toLocaleString()}/${rateLvl}]${sym}\n${gif.state_hp} ${sym}${hp}${sym} ${gif.state_wp} ${sym}${wp}${sym}\n${gif.state_str} ${sym}${str}${sym} ${gif.state_mag} ${sym}${mag}${sym}\n${gif.state_pr} ${sym}${pr}%${sym} ${gif.state_mr} ${sym}${mr}%${sym}${weapon_message}`, inline: true },
                                )
                        }else if(!sat.team.postion6){
                            embed.addFields(
                                    { name: `[3] none`, value: `${sym}team add {animal} 3${sym}`, inline: true },
                                )
                        }
                    }
                    try{ await userData.save(); }catch(error){}

                    interaction.update({ embeds: [embed.setColor('#8EC3FF').setFooter({ text: `${showStreak}` })], components: [allButton] });
                }
            });

        }catch(error){
            console.log(`team error ${error}`);
        }
    },
};