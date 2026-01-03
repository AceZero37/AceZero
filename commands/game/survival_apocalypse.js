const { SimpleEmbed, cooldown, getUser, sleep, getRandomInt, labelButton, twoButton, getCollectionButton, customEmbed, gif, sym, survival, AttachmentBuilder, ButtonStyle, threeButton, oneButton, fourButton, fiveButton } = require('../../functioon/function');

const cooldowns = new Map();
let CDT = 15_000;
var getId = [];
var cdId = [];
var prem = [];

module.exports = {
    name: 'survival',
    async execute(client, message, args) {
        try{
            const user = message.author;

            const userData = await getUser(user.id);

            if(!userData.premium.premium_bool){ return; }

            if(userData.premium.premium_bool){
                if(!prem.includes(user.id)){
                    prem.push(user.id);
                }
            }

            if(cooldown(user.id, getId, cdId, CDT, message, cooldowns, prem)){
                return;
            };

            let option = {
                dead: false,

                camfire_theme: true,
                Storage_theme: false,
                map_theme: false,
                crafting_theme: false,
                base_theme: false,

                landing: '',

                exploring: false,
                level_exploring: 0,

                zombie_amount: 0,
                zombie_startWith: 0,
                zombie_endWith: 0,
                zombie_chanceSpawn: 0,

                spanw_resource: 0,
                interact: false,
                skip_interact: false,

                crafted_spear: false,
                crafted_flower_soup: false,
                crafted_bandage: false,
            };

            const currentTime = new Date();
            if(userData.sa.event.revive_date < currentTime && userData.sa.event.revive_date){
                userData.sa.event.revive_date = '';
                userData.sa.GUI.Heart = 5;
                option.dead = false;
            }

            ////////////////////////////////////////////////////////////BUTTON/////////////////////////////////////////////////////////////////////////////////////////
            //Camfire button
            const explore_button = labelButton('explore_button', 'Explore', ButtonStyle.Primary); if(userData.sa.GUI.Heart <= 0 && userData.sa.event.revive_date){ explore_button.setDisabled(true); } 
            const storage_button = labelButton('storage_button', 'Storage', ButtonStyle.Secondary);
            const eat_button = labelButton('eat_button', 'Heal', ButtonStyle.Success); if(userData.sa.GUI.Heart >= 5 || (userData.sa.item.food.chocolate_bar <= 0 && userData.sa.item.food.flower_soup <= 0 && userData.sa.item.medical.bandage <= 0)){ eat_button.setDisabled(true); } 
            const base_button = labelButton('base_button', 'Base', ButtonStyle.Primary); 

            const Camfire_button = fourButton(explore_button, storage_button, eat_button, base_button);

            //Storage button
            const back_to_camfire_button = labelButton('back_to_camfire_button', 'Back', ButtonStyle.Danger);
            const craft_button = labelButton('craft_button', 'Craft', ButtonStyle.Primary);

            const Storage_button = twoButton(craft_button, back_to_camfire_button);

            //Base button
            const upgrade_button = labelButton('upgrade_button', 'Upgrade', ButtonStyle.Primary); upgrade_button.setDisabled(true);

            const Base_button = twoButton(upgrade_button, back_to_camfire_button);

            //Map button
            const map_a_button = labelButton('map_a_button', 'A', ButtonStyle.Primary);
            const map_b_button = labelButton('map_b_button', 'B', ButtonStyle.Primary); if(userData.sa.land.land_b == false){ map_b_button.setDisabled(true); }
            const map_c_button = labelButton('map_c_button', 'C', ButtonStyle.Primary); if(userData.sa.land.land_c == false){ map_c_button.setDisabled(true); }

            const one_map_button = fourButton(map_a_button, map_b_button, map_c_button, back_to_camfire_button);

            const map_d_button = labelButton('map_d_button', 'D', ButtonStyle.Primary); if(userData.sa.land.land_d == false){ map_d_button.setDisabled(true); }
            const map_e_button = labelButton('map_e_button', 'E', ButtonStyle.Primary); if(userData.sa.land.land_e == false){ map_e_button.setDisabled(true); }
            const map_f_button = labelButton('map_f_button', 'F', ButtonStyle.Primary); if(userData.sa.land.land_f == false){ map_f_button.setDisabled(true); }

            const two_map_button = threeButton(map_d_button, map_e_button, map_f_button);

            //Exploring button
            const forward_button = labelButton('forward_button', 'Forward', ButtonStyle.Primary);
            const left_button = labelButton('left_button', 'Left', ButtonStyle.Primary);
            const right_button = labelButton('right_button', 'Right', ButtonStyle.Primary);
            const interaction_button = labelButton('interaction_button', 'Interact', ButtonStyle.Success); interaction_button.setDisabled(true);

            const exploring_button = fiveButton(back_to_camfire_button, left_button, forward_button, right_button, interaction_button);

            //Crafting button
            const craft_spear_button = labelButton('craft_spear_button', 'Spear', ButtonStyle.Primary); craft_spear_button.setDisabled(true);
            const craft_flower_soup_button = labelButton('craft_flower_soup_button', 'Flower Soup', ButtonStyle.Primary); craft_flower_soup_button.setDisabled(true)
            const craft_bandage_button = labelButton('craft_bandage_button', 'Bandage', ButtonStyle.Primary); craft_bandage_button.setDisabled(true)

            const crafting_button = fourButton(craft_spear_button, craft_flower_soup_button, craft_bandage_button, back_to_camfire_button);

            ////////////////////////////////////////////////////////////BUTTON/////////////////////////////////////////////////////////////////////////////////////////

            const attachment = new AttachmentBuilder(await survival(userData, option), { name: 'sat1.png' });
                const embed = customEmbed()
                    .setAuthor({ name: `${user.displayName} in survival apocalypse!`,iconURL: user.displayAvatarURL() })
                    .setColor('#8EC3FF')
                    .setImage(`attachment://sat1.png`)
            const mgs = await message.channel.send({ embeds: [embed], files: [attachment], components: [Camfire_button] });

            const collector = getCollectionButton(mgs, 600_000);

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

                    if(interaction.customId == 'craft_bandage_button'){
                        option.crafted_bandage = true;

                        userData.sa.item.medical.bandage += 1;

                        userData.sa.item.resource.rag -= 2; if(userData.sa.item.resource.rag < 2){ craft_bandage_button.setDisabled(true); }
                            
                        const attachment = new AttachmentBuilder(await survival(userData, option), { name: 'sat1.png' });
                        const embed = customEmbed()
                            .setAuthor({ name: `${user.displayName} in survival apocalypse!`,iconURL: user.displayAvatarURL() })
                            .setColor('#8EC3FF')
                            .setImage(`attachment://sat1.png`)

                        await interaction.update({ embeds: [embed], files: [attachment], components: [crafting_button] });
                        try{ await userData.save(); }catch(error){}
                        return;
                    }

                    if(interaction.customId == 'craft_flower_soup_button'){
                        option.crafted_flower_soup = true;

                        userData.sa.item.food.flower_soup += 1;

                        userData.sa.item.resource.flower -= 5; if(userData.sa.item.resource.flower < 5){ craft_flower_soup_button.setDisabled(true); }
                            
                        const attachment = new AttachmentBuilder(await survival(userData, option), { name: 'sat1.png' });
                        const embed = customEmbed()
                            .setAuthor({ name: `${user.displayName} in survival apocalypse!`,iconURL: user.displayAvatarURL() })
                            .setColor('#8EC3FF')
                            .setImage(`attachment://sat1.png`)

                        await interaction.update({ embeds: [embed], files: [attachment], components: [crafting_button] });
                        try{ await userData.save(); }catch(error){}
                        return;
                    }

                    if(interaction.customId == 'craft_spear_button'){
                        craft_spear_button.setDisabled(true);
                        option.crafted_spear = true;

                        userData.sa.item.melee.spear.spear_bool = true;
                        userData.sa.item.melee.spear.spear_percen = 100;

                        userData.sa.item.resource.stack -= 20;
                        userData.sa.item.resource.log -= 5;
                            
                        const attachment = new AttachmentBuilder(await survival(userData, option), { name: 'sat1.png' });
                        const embed = customEmbed()
                            .setAuthor({ name: `${user.displayName} in survival apocalypse!`,iconURL: user.displayAvatarURL() })
                            .setColor('#8EC3FF')
                            .setImage(`attachment://sat1.png`)

                        await interaction.update({ embeds: [embed], files: [attachment], components: [crafting_button] });
                        try{ await userData.save(); }catch(error){}
                        return;
                    }

                    if(interaction.customId == 'craft_button'){
                        option.crafting_theme = true;
                        option.Storage_theme = false; 

                        if(userData.sa.item.resource.stack >= 20 && userData.sa.item.resource.log >= 5 && !userData.sa.item.melee.spear.spear_bool){ craft_spear_button.setDisabled(false); }
                        if(userData.sa.item.resource.flower >= 5){ craft_flower_soup_button.setDisabled(false); }  
                        if(userData.sa.item.resource.rag >= 2){ craft_bandage_button.setDisabled(false); }      

                        const attachment = new AttachmentBuilder(await survival(userData, option), { name: 'sat1.png' });
                        const embed = customEmbed()
                            .setAuthor({ name: `${user.displayName} in survival apocalypse!`,iconURL: user.displayAvatarURL() })
                            .setColor('#8EC3FF')
                            .setImage(`attachment://sat1.png`)

                        await interaction.update({ embeds: [embed], files: [attachment], components: [crafting_button] });
                        return;
                    }

                    if(interaction.customId == 'interaction_button'){
                        interaction_button.setDisabled(true);
                        option.interact = true; 
                        option.skip_interact = false;
                            
                        const attachment = new AttachmentBuilder(await survival(userData, option), { name: 'sat1.png' });
                        const embed = customEmbed()
                            .setAuthor({ name: `${user.displayName} in survival apocalypse!`,iconURL: user.displayAvatarURL() })
                            .setColor('#8EC3FF')
                            .setImage(`attachment://sat1.png`)

                        await interaction.update({ embeds: [embed], files: [attachment], components: [exploring_button] });
                        return;
                    }

                    if(interaction.customId == 'left_button'){

                        option.exploring = true;
                        option.map_theme = false;

                        option.level_exploring += 1;

                        const way_ran = getRandomInt(1, 4);
        
                        if(way_ran == 1){
                            forward_button.setDisabled(false);
                            left_button.setDisabled(true);
                            right_button.setDisabled(true);
                        }else if(way_ran == 2){
                            forward_button.setDisabled(true);
                            left_button.setDisabled(false);
                            right_button.setDisabled(false);
                        }else if(way_ran == 3){
                            forward_button.setDisabled(false);
                            left_button.setDisabled(true);
                            right_button.setDisabled(false);
                        }

                        if(option.spanw_resource > 0){
                            interaction_button.setDisabled(false);
                            if(option.skip_interact == true){
                                option.skip_interact = false;
                                option.spanw_resource = 0;
                                interaction_button.setDisabled(true);
                            }else{
                                option.skip_interact = true;
                            }

                        }else{
                            interaction_button.setDisabled(true);
                        }

                        const attachment = new AttachmentBuilder(await survival(userData, option), { name: 'sat1.png' });
                        const embed = customEmbed()
                            .setAuthor({ name: `${user.displayName} in survival apocalypse!`,iconURL: user.displayAvatarURL() })
                            .setColor('#8EC3FF')
                            .setImage(`attachment://sat1.png`)

                        if(option.dead == true){
                            option.camfire_theme = true;
                            option.Storage_theme = false;
                            option.map_theme = false;
                            option.exploring = false;
                            option.level_exploring = 0;
                            
                            explore_button.setDisabled(true);

                            const attachment = new AttachmentBuilder(await survival(userData, option), { name: 'sat1.png' });
                            const embed = customEmbed()
                                .setAuthor({ name: `${user.displayName} in survival apocalypse!`,iconURL: user.displayAvatarURL() })
                                .setColor('#8EC3FF')
                                .setImage(`attachment://sat1.png`)

                            await interaction.update({ embeds: [embed], files: [attachment], components: [Camfire_button] });
                            return;
                        }

                        await interaction.update({ embeds: [embed], files: [attachment], components: [exploring_button] });
                        return;
                    }

                    if(interaction.customId == 'forward_button'){
                        option.exploring = true;
                        option.map_theme = false;

                        option.level_exploring += 1;

                        const way_ran = getRandomInt(1, 4);

                        if(way_ran == 1){
                            forward_button.setDisabled(true);
                            left_button.setDisabled(false);
                            right_button.setDisabled(true);
                        }else if(way_ran == 2){
                            forward_button.setDisabled(false);
                            left_button.setDisabled(false);
                            right_button.setDisabled(true);
                        }else if(way_ran == 3){
                            forward_button.setDisabled(false);
                            left_button.setDisabled(false);
                            right_button.setDisabled(true);
                        }

                        if(option.spanw_resource > 0){
                            interaction_button.setDisabled(false);
                            if(option.skip_interact == true){
                                option.skip_interact = false;
                                option.spanw_resource = 0;
                                interaction_button.setDisabled(true);
                            }else{
                                option.skip_interact = true;
                            }

                        }else{
                            interaction_button.setDisabled(true);
                        }

                        const attachment = new AttachmentBuilder(await survival(userData, option), { name: 'sat1.png' });
                        const embed = customEmbed()
                            .setAuthor({ name: `${user.displayName} in survival apocalypse!`,iconURL: user.displayAvatarURL() })
                            .setColor('#8EC3FF')
                            .setImage(`attachment://sat1.png`)

                        if(option.dead == true){
                            option.camfire_theme = true;
                            option.Storage_theme = false;
                            option.map_theme = false;
                            option.exploring = false;
                            option.level_exploring = 0;
                            
                            explore_button.setDisabled(true);

                            const attachment = new AttachmentBuilder(await survival(userData, option), { name: 'sat1.png' });
                            const embed = customEmbed()
                                .setAuthor({ name: `${user.displayName} in survival apocalypse!`,iconURL: user.displayAvatarURL() })
                                .setColor('#8EC3FF')
                                .setImage(`attachment://sat1.png`)

                            await interaction.update({ embeds: [embed], files: [attachment], components: [Camfire_button] });
                            return;
                        }

                        await interaction.update({ embeds: [embed], files: [attachment], components: [exploring_button] });
                        return;
                    }

                    if(interaction.customId == 'right_button'){
                        option.exploring = true;
                        option.map_theme = false;

                        option.level_exploring += 1;

                        const way_ran = getRandomInt(1, 4);

                        if(way_ran == 1){
                            forward_button.setDisabled(false);
                            left_button.setDisabled(true);
                            right_button.setDisabled(true);
                        }else if(way_ran == 2){
                            forward_button.setDisabled(true);
                            left_button.setDisabled(true);
                            right_button.setDisabled(false);
                        }else if(way_ran == 3){
                            forward_button.setDisabled(true);
                            left_button.setDisabled(true);
                            right_button.setDisabled(false);
                        }

                        if(option.spanw_resource > 0){
                            interaction_button.setDisabled(false);
                            if(option.skip_interact == true){
                                option.skip_interact = false;
                                option.spanw_resource = 0;
                                interaction_button.setDisabled(true);
                            }else{
                                option.skip_interact = true;
                            }

                        }else{
                            interaction_button.setDisabled(true);
                        }

                        const attachment = new AttachmentBuilder(await survival(userData, option), { name: 'sat1.png' });
                        const embed = customEmbed()
                            .setAuthor({ name: `${user.displayName} in survival apocalypse!`,iconURL: user.displayAvatarURL() })
                            .setColor('#8EC3FF')
                            .setImage(`attachment://sat1.png`)

                        if(option.dead == true){
                            option.camfire_theme = true;
                            option.Storage_theme = false;
                            option.map_theme = false;
                            option.exploring = false;
                            option.level_exploring = 0;
                            
                            explore_button.setDisabled(true);

                            const attachment = new AttachmentBuilder(await survival(userData, option), { name: 'sat1.png' });
                            const embed = customEmbed()
                                .setAuthor({ name: `${user.displayName} in survival apocalypse!`,iconURL: user.displayAvatarURL() })
                                .setColor('#8EC3FF')
                                .setImage(`attachment://sat1.png`)

                            await interaction.update({ embeds: [embed], files: [attachment], components: [Camfire_button] });
                            return;
                        }

                        await interaction.update({ embeds: [embed], files: [attachment], components: [exploring_button] });
                        return;
                    }

                    if(interaction.customId == 'map_a_button'){
                        option.exploring = true;
                        option.map_theme = false;

                        option.level_exploring = 1;
                        option.zombie_amount = 0;
                        option.spanw_resource = 0;
                        option.interact = false;
                        option.dead = false;
                        option.landing = 'a';
                        option.zombie_startWith = 1;
                        option.zombie_endWith = 3;
                        option.zombie_chanceSpawn = 6;

                        const attachment = new AttachmentBuilder(await survival(userData, option), { name: 'sat1.png' });
                        const embed = customEmbed()
                            .setAuthor({ name: `${user.displayName} in survival apocalypse!`,iconURL: user.displayAvatarURL() })
                            .setColor('#8EC3FF')
                            .setImage(`attachment://sat1.png`)

                        await interaction.update({ embeds: [embed], files: [attachment], components: [exploring_button] });
                        return;
                    }

                    if(interaction.customId == 'map_b_button'){
                        option.exploring = true;
                        option.map_theme = false;

                        option.level_exploring = 1;
                        option.zombie_amount = 0;
                        option.spanw_resource = 0;
                        option.interact = false;
                        option.dead = false;
                        option.landing = 'b';
                        option.zombie_startWith = 2;
                        option.zombie_endWith = 4;
                        option.zombie_chanceSpawn = 5;


                        const attachment = new AttachmentBuilder(await survival(userData, option), { name: 'sat1.png' });
                        const embed = customEmbed()
                            .setAuthor({ name: `${user.displayName} in survival apocalypse!`,iconURL: user.displayAvatarURL() })
                            .setColor('#8EC3FF')
                            .setImage(`attachment://sat1.png`)

                        await interaction.update({ embeds: [embed], files: [attachment], components: [exploring_button] });
                        return;
                    }

                    if(interaction.customId == 'map_c_button'){
                        option.exploring = true;
                        option.map_theme = false;

                        option.level_exploring = 1;
                        option.zombie_amount = 0;
                        option.spanw_resource = 0;
                        option.interact = false;
                        option.dead = false;
                        option.landing = 'c';
                        option.zombie_startWith = 3;
                        option.zombie_endWith = 5;
                        option.zombie_chanceSpawn = 4;

                        const attachment = new AttachmentBuilder(await survival(userData, option), { name: 'sat1.png' });
                        const embed = customEmbed()
                            .setAuthor({ name: `${user.displayName} in survival apocalypse!`,iconURL: user.displayAvatarURL() })
                            .setColor('#8EC3FF')
                            .setImage(`attachment://sat1.png`)

                        await interaction.update({ embeds: [embed], files: [attachment], components: [exploring_button] });
                        return;
                    }

                    if(interaction.customId == 'map_d_button'){
                        option.exploring = true;
                        option.map_theme = false;

                        option.level_exploring = 1;
                        option.zombie_amount = 0;
                        option.spanw_resource = 0;
                        option.interact = false;
                        option.dead = false;
                        option.landing = 'd';
                        option.zombie_startWith = 4;
                        option.zombie_endWith = 6;
                        option.zombie_chanceSpawn = 3;

                        const attachment = new AttachmentBuilder(await survival(userData, option), { name: 'sat1.png' });
                        const embed = customEmbed()
                            .setAuthor({ name: `${user.displayName} in survival apocalypse!`,iconURL: user.displayAvatarURL() })
                            .setColor('#8EC3FF')
                            .setImage(`attachment://sat1.png`)

                        await interaction.update({ embeds: [embed], files: [attachment], components: [exploring_button] });
                        return;
                    }

                    if(interaction.customId == 'map_e_button'){
                        option.exploring = true;
                        option.map_theme = false;

                        option.level_exploring = 1;
                        option.zombie_amount = 0;
                        option.spanw_resource = 0;
                        option.interact = false;
                        option.dead = false;
                        option.landing = 'e';
                        option.zombie_startWith = 5;
                        option.zombie_endWith = 7;
                        option.zombie_chanceSpawn = 2;

                        const attachment = new AttachmentBuilder(await survival(userData, option), { name: 'sat1.png' });
                        const embed = customEmbed()
                            .setAuthor({ name: `${user.displayName} in survival apocalypse!`,iconURL: user.displayAvatarURL() })
                            .setColor('#8EC3FF')
                            .setImage(`attachment://sat1.png`)

                        await interaction.update({ embeds: [embed], files: [attachment], components: [exploring_button] });
                        return;
                    }

                    if(interaction.customId == 'map_f_button'){
                        option.exploring = true;
                        option.map_theme = false;

                        option.level_exploring = 1;
                        option.zombie_amount = 0;
                        option.spanw_resource = 0;
                        option.interact = false;
                        option.dead = false;
                        option.landing = 'f';
                        option.zombie_startWith = 6;
                        option.zombie_endWith = 8;
                        option.zombie_chanceSpawn = 2;

                        const attachment = new AttachmentBuilder(await survival(userData, option), { name: 'sat1.png' });
                        const embed = customEmbed()
                            .setAuthor({ name: `${user.displayName} in survival apocalypse!`,iconURL: user.displayAvatarURL() })
                            .setColor('#8EC3FF')
                            .setImage(`attachment://sat1.png`)

                        await interaction.update({ embeds: [embed], files: [attachment], components: [exploring_button] });
                        return;
                    }

                    if(interaction.customId == 'explore_button'){
                        option.map_theme = true;
                        option.camfire_theme = false;

                        const attachment = new AttachmentBuilder(await survival(userData, option), { name: 'sat1.png' });
                        const embed = customEmbed()
                            .setAuthor({ name: `${user.displayName} in survival apocalypse!`,iconURL: user.displayAvatarURL() })
                            .setColor('#8EC3FF')
                            .setImage(`attachment://sat1.png`)

                        await interaction.update({ embeds: [embed], files: [attachment], components: [one_map_button, two_map_button] });
                        return;
                    }

                    if(interaction.customId == 'back_to_camfire_button'){
                        option.camfire_theme = true;
                        option.Storage_theme = false;
                        option.map_theme = false;
                        option.exploring = false;
                        option.base_theme = false;

                        if(!userData.sa.event.revive_date){
                            explore_button.setDisabled(false);
                        }

                        if(userData.sa.land.land_b == true){
                            map_b_button.setDisabled(false);

                        }else if(userData.sa.land.land_c == true){
                            map_c_button.setDisabled(false);

                        }else if(userData.sa.land.land_d == true){
                            map_d_button.setDisabled(false);

                        }else if(userData.sa.land.land_e == true){
                            map_e_button.setDisabled(false);

                        }else if(userData.sa.land.land_f == true){
                            map_f_button.setDisabled(false);
                        }

                        if(userData.sa.item.food.chocolate_bar > 0 || userData.sa.item.food.flower_soup > 0 || userData.sa.item.medical.bandage > 0){
                            eat_button.setDisabled(false);
                        }
                        if(userData.sa.GUI.Heart <= 5){
                            eat_button.setDisabled(true);
                        }

                        const attachment = new AttachmentBuilder(await survival(userData, option), { name: 'sat1.png' });
                        const embed = customEmbed()
                            .setAuthor({ name: `${user.displayName} in survival apocalypse!`,iconURL: user.displayAvatarURL() })
                            .setColor('#8EC3FF')
                            .setImage(`attachment://sat1.png`)

                        await interaction.update({ embeds: [embed], files: [attachment], components: [Camfire_button] });
                        try{ await userData.save(); }catch(error){}
                        return;
                    }

                    if(interaction.customId == 'base_button'){
                        option.base_theme = true;
                        option.camfire_theme = false;

                        const attachment = new AttachmentBuilder(await survival(userData, option), { name: 'sat1.png' });
                        const embed = customEmbed()
                            .setAuthor({ name: `${user.displayName} in survival apocalypse!`,iconURL: user.displayAvatarURL() })
                            .setColor('#8EC3FF')
                            .setImage(`attachment://sat1.png`)

                        await interaction.update({ embeds: [embed], files: [attachment], components: [Base_button] });
                        return;
                    }

                    if(interaction.customId == 'storage_button'){
                        option.Storage_theme = true;
                        option.camfire_theme = false;

                        const attachment = new AttachmentBuilder(await survival(userData, option), { name: 'sat1.png' });
                        const embed = customEmbed()
                            .setAuthor({ name: `${user.displayName} in survival apocalypse!`,iconURL: user.displayAvatarURL() })
                            .setColor('#8EC3FF')
                            .setImage(`attachment://sat1.png`)

                        await interaction.update({ embeds: [embed], files: [attachment], components: [Storage_button] });
                        return;
                    } 

                    if(interaction.customId == 'eat_button'){
                        explore_button.setDisabled(false);

                        if(userData.sa.item.food.chocolate_bar > 0){
                            if(userData.sa.GUI.Heart < 5){
                                userData.sa.item.food.chocolate_bar -= 1;
                                userData.sa.GUI.Heart = 5;
                            }
                            option.dead = false;
                            if(userData.sa.item.food.chocolate_bar <= 0){ eat_button.setDisabled(true); }

                        }else if(userData.sa.item.food.flower_soup > 0){
                            if(userData.sa.GUI.Heart < 5){
                                userData.sa.item.food.flower_soup -= 1;
                                userData.sa.GUI.Heart = 5;
                            }
                            option.dead = false;
                            if(userData.sa.item.food.flower_soup <= 0){ eat_button.setDisabled(true); }

                        }else if(userData.sa.item.medical.bandage > 0){
                            if(userData.sa.GUI.Heart < 5){
                                userData.sa.item.medical.bandage -= 1;
                                userData.sa.GUI.Heart += 1;
                            }
                            option.dead = false;
                            if(userData.sa.item.medical.bandage <= 0){ eat_button.setDisabled(true); }

                        }else{
                            eat_button.setDisabled(true);
                        }

                        if(userData.sa.GUI.Heart >= 5){
                            eat_button.setDisabled(true);
                        }

                        const attachment = new AttachmentBuilder(await survival(userData, option), { name: 'sat1.png' });
                        const embed = customEmbed()
                            .setAuthor({ name: `${user.displayName} in survival apocalypse!`,iconURL: user.displayAvatarURL() })
                            .setColor('#8EC3FF')
                            .setImage(`attachment://sat1.png`)

                        await interaction.update({ embeds: [embed], files: [attachment], components: [Camfire_button] });
                        try{ await userData.save(); }catch(error){}
                        return;
                    } 
                }catch(error){}
            });

        }catch(error){
            console.log(`survival error ${error}`);
        }
    },
};