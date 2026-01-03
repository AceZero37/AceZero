const { RateLimitError } = require('discord.js');
const { sleep, SimpleEmbed, sym, cooldown, getRandomInt, gif, getUser, customEmbed, labelButton, fiveButton, twoButton, fourButton, oneButton, getCollectionButton, ButtonStyle} = require('../../functioon/function');

const cooldowns = new Map();
let CDT = 60_000;
var getId = [];
var cdId = [];
var prem = [];

module.exports = {
    name: 'bankrob',
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

            let gunner = `**FREE**`;
            let idGunner;
            let hacker = `**FREE**`;
            let idHacker;
            let driver = `**FREE**`;
            let idDriver;

            let gunner_collect = `**FREE**`;
            let idGunner_collect;
            let hacker_collect = `**FREE**`;
            let idHacker_collect;
            let driver_collect = `**FREE**`;
            let idDriver_collect;

            const embed = customEmbed()
                .setAuthor({ name: `${user.displayName}`, iconURL: user.displayAvatarURL() })
                .setTitle('ROB A BANK')
                .setDescription('We need three member to make our rob successfully')
                .addFields(
                    {name: `GUNNER`, value: `${gif.thief_gif}\n${gunner}`, inline: true},
                    {name: `HACKER`, value: `${gif.thief_gif}\n${hacker}`, inline: true},
                    {name: `DRIVER`, value: `${gif.thief_gif}\n${driver}`, inline: true},
                )
                .setImage(gif.theme_bankrob)
                .setTimestamp()

            const GUN = labelButton('gun', 'GUN', ButtonStyle.Success)
                
            const HACK = labelButton('hack', 'HACK', ButtonStyle.Success)
                
            const DRIVE = labelButton('drive', 'DRIVE', ButtonStyle.Success)
                
            const START = labelButton('start', 'START', ButtonStyle.Primary)
        
            const CANCEL = labelButton('cancel', 'CANCEL', ButtonStyle.Danger)
                
            const ButtonRow = fiveButton(GUN, HACK, DRIVE, START, CANCEL);

            const Kill = labelButton('kill', 'KILL', ButtonStyle.Success)
                
            const GET_INTO = labelButton('getinto', 'GET INTO', ButtonStyle.Success)
                
            const Button_Kill_GET = twoButton(Kill, GET_INTO)

            const DRILL = labelButton('drill', 'DRILL', ButtonStyle.Success)
                
            const GET_AWAY = labelButton('getaway', 'DRILL FAST', ButtonStyle.Success)

            const Button_DILL_GETAWAY = twoButton(DRILL, GET_AWAY)

            const COLLECT1 = labelButton('collect1', 'GUN', ButtonStyle.Success)
                
            const COLLECT2 = labelButton('collect2', 'HACK', ButtonStyle.Success)
                
            const COLLECT3 = labelButton('collect3', 'DRIVE', ButtonStyle.Success)
                
            const START_COLLECT = labelButton('start_collect', 'START', ButtonStyle.Primary)
                
            const Button_COLLECT = fourButton(COLLECT1, COLLECT2, COLLECT3, START_COLLECT)

            const START_DRIVE = labelButton('start_drive', 'DRIVE', ButtonStyle.Success)
                    
            const Button_Drive = oneButton(START_DRIVE);

            const go_free = labelButton('go_free', 'GET INTO', ButtonStyle.Success)
                    
            const Button_go_free = oneButton(go_free);

            const mgs = await message.channel.send({ embeds: [embed], components: [ButtonRow] });

            const collector = getCollectionButton(mgs, 120_000);

            let win = false;
            let afk = true;

            collector.on('end', async (interaction) =>{
                if(afk){
                    mgs.edit({ embeds: [embed], components: [] });
                    collector.stop();
                    return;
                }
                if(!win){
                    const time = customEmbed()
                        .setAuthor({ name: `${user.displayName}`, iconURL: user.displayAvatarURL() })
                        .setTitle('Time out!!!')
                        .setImage(`${gif.bankrob_timeout_gif}`)
                        .setTimestamp()
                    mgs.edit({ embeds: [time], components: [] });
                    await sleep(5000);

                    const cop_arrvie = customEmbed()
                        .setAuthor({ name: `${user.displayName}`, iconURL: user.displayAvatarURL() })
                        .setTitle('Cop arrive')
                        .setImage(gif.bankrob_cop_arrive)
                        .setTimestamp()
                    mgs.edit({ embeds: [cop_arrvie], components: [] });
                    await sleep(5000);

                    const lose = customEmbed()
                        .setAuthor({ name: `${user.displayName}`, iconURL: user.displayAvatarURL() })
                        .setColor('Red')
                        .setTitle('Police Jab all')
                        .setDescription(`Jol kok 150y ${gunner} ${hacker} ${driver}`)
                        .setImage(`${gif.bankrob_wasted_gif}`)
                        .setTimestamp()
                    mgs.edit({ embeds: [lose], components: [] });
                    collector.stop();
                    return;
                }else{
                    collector.stop();
                }
            });

            collector.on('collect', async (interaction)=>{
                if(interaction.customId == 'collect3'){
                    if(interaction.member.user.id != idDriver){
                        await interaction.reply({ content: 'You are not driver!', ephemeral: true });
                        return;
                    }
                    if(interaction.member.user.id == idGunner_collect || interaction.member.user.id == idHacker_collect || interaction.member.user.id == idDriver_collect){
                        await interaction.reply({ content: 'You already Select your Role', ephemeral: true });
                        return;
                    }

                    if(driver_collect == '**FREE**'){
                        idDriver_collect = await interaction.user.id;
                        driver_collect = `<@${idDriver_collect}>`;
                        const gun_collect = customEmbed()
                            .setAuthor({ name: `${user.displayName}`, iconURL: user.displayAvatarURL() })
                            .setTitle('COLLECT ALL ITEM')
                            .setDescription('We need three member to collect item successfully')
                            .addFields(
                                {name: `GUNNER`, value: `${gif.thief_gif}\n${gunner_collect}`, inline: true},
                                {name: `HACKER`, value: `${gif.thief_gif}\n${hacker_collect}`, inline: true},
                                {name: `DRIVER`, value: `${gif.thief_gif}\n${driver_collect}`, inline: true},
                            )
                            .setImage(gif.bankrob_collecte_theme)
                            .setTimestamp()

                        COLLECT3.setDisabled(true);
                        await interaction.update({ embeds: [gun_collect], components: [Button_COLLECT] });
                        return;
                    }
                }

                if(interaction.customId == 'collect2'){
                    if(interaction.member.user.id != idHacker){
                        await interaction.reply({ content: 'You are not hacker!', ephemeral: true });
                        return;
                    }
                    if(interaction.member.user.id == idGunner_collect || interaction.member.user.id == idHacker_collect || interaction.member.user.id == idDriver_collect){
                        await interaction.reply({ content: 'You already Select your Role', ephemeral: true });
                        return;
                    }

                    if(hacker_collect == '**FREE**'){
                        idHacker_collect = await interaction.user.id;
                        hacker_collect = `<@${idHacker_collect}>`;
                        const gun_collect = customEmbed()
                            .setAuthor({ name: `${user.displayName}`, iconURL: user.displayAvatarURL() })
                            .setTitle('COLLECT ALL ITEM')
                            .setDescription('We need three member to collect item successfully')
                            .addFields(
                                {name: `GUNNER`, value: `${gif.thief_gif}\n${gunner_collect}`, inline: true},
                                {name: `HACKER`, value: `${gif.thief_gif}\n${hacker_collect}`, inline: true},
                                {name: `DRIVER`, value: `${gif.thief_gif}\n${driver_collect}`, inline: true},
                            )
                            .setImage(gif.bankrob_collecte_theme)
                            .setTimestamp()

                        COLLECT2.setDisabled(true);
                        await interaction.update({ embeds: [gun_collect], components: [Button_COLLECT] });
                        return;
                    }
                }

                if(interaction.customId == 'collect1'){
                    if(interaction.member.user.id != idGunner){
                        await interaction.reply({ content: 'You are not gunner!', ephemeral: true });
                        return;
                    }
                    if(interaction.member.user.id == idGunner_collect || interaction.member.user.id == idHacker_collect || interaction.member.user.id == idDriver_collect){
                        await interaction.reply({ content: 'You already Select your Role', ephemeral: true });
                        return;
                    }

                    if(gunner_collect == '**FREE**'){
                        idGunner_collect = await interaction.user.id;
                        gunner_collect = `<@${idGunner_collect}>`;
                        const gun_collect = customEmbed()
                            .setAuthor({ name: `${user.displayName}`, iconURL: user.displayAvatarURL() })
                            .setTitle('COLLECT ALL ITEM')
                            .setDescription('We need three member to collect item successfully')
                            .addFields(
                                {name: `GUNNER`, value: `${gif.thief_gif}\n${gunner_collect}`, inline: true},
                                {name: `HACKER`, value: `${gif.thief_gif}\n${hacker_collect}`, inline: true},
                                {name: `DRIVER`, value: `${gif.thief_gif}\n${driver_collect}`, inline: true},
                            )
                            .setImage(gif.bankrob_collecte_theme)
                            .setTimestamp()

                        COLLECT1.setDisabled(true);
                        await interaction.update({ embeds: [gun_collect], components: [Button_COLLECT] });
                        return;
                    }
                }

                if(interaction.customId == 'gun'){
                    if(interaction.member.user.id == idGunner || interaction.member.user.id == idHacker || interaction.member.user.id == idDriver){
                        await interaction.reply({ content: 'You already Select a Role', ephemeral: true });
                        return;
                    }

                    if(gunner == '**FREE**'){
                        idGunner = interaction.user.id;
                        let userGunner = await getUser(idGunner);
                        if(!userGunner){
                            interaction.reply({ content: 'account not create yet!', ephemeral: true });
                            return;
                        }
                        if(userGunner.balance < 100000 || userGunner.balance <= 0){
                            await interaction.reply({ content: `Trov ka ${gif.cash} **100,000**`, ephemeral: true });
                            return;
                        }
                        gunner = `<@${idGunner}>\n${gif.cash} **100,000**`;
                        const gun = customEmbed()
                            .setAuthor({ name: `${user.displayName}`, iconURL: user.displayAvatarURL() })
                            .setTitle('ROB A BANK')
                            .setDescription('We need three member to make our rob successfully')
                            .addFields(
                                {name: `GUNNER`, value: `${gif.thief_gif}\n${gunner}`, inline: true},
                                {name: `HACKER`, value: `${gif.thief_gif}\n${hacker}`, inline: true},
                                {name: `DRIVER`, value: `${gif.thief_gif}\n${driver}`, inline: true},
                            )
                            .setImage(gif.theme_bankrob)
                            .setTimestamp()

                        GUN.setDisabled(true);
                        await interaction.update({ embeds: [gun], components: [ButtonRow] });
                        return;
                    }
                }
                if(interaction.customId == 'hack'){
                    if(interaction.member.user.id == idGunner || interaction.member.user.id == idHacker || interaction.member.user.id == idDriver){
                        await interaction.reply({ content: 'You already Select a Role', ephemeral: true });
                        return;
                    }

                    if(hacker == '**FREE**'){
                        idHacker = interaction.user.id;
                        let userHacker = await getUser(idHacker);
                        if(!userHacker){
                            interaction.reply({ content: 'account not create yet!', ephemeral: true });
                            return;
                        }
                        if(userHacker.balance < 100000 || userHacker.balance <= 0){
                            await interaction.reply({ content: `Trov ka ${gif.cash} **100,000**`, ephemeral: true });
                            return;
                        }
                        hacker = `<@${idHacker}>\n${gif.cash} **100,000**`;
                        const hack = customEmbed()
                            .setAuthor({ name: `${user.displayName}`, iconURL: user.displayAvatarURL() })
                            .setTitle('ROB A BANK')
                            .setDescription('We need three member to make our rob successfully')
                            .addFields(
                                {name: `GUNNER`, value: `${gif.thief_gif}\n${gunner}`, inline: true},
                                {name: `HACKER`, value: `${gif.thief_gif}\n${hacker}`, inline: true},
                                {name: `DRIVER`, value: `${gif.thief_gif}\n${driver}`, inline: true},
                            )
                            .setImage(gif.theme_bankrob)
                            .setTimestamp()

                        HACK.setDisabled(true);
                        await interaction.update({ embeds: [hack], components: [ButtonRow] });
                        return;
                    }
                }
                if(interaction.customId == 'drive'){
                    if(interaction.member.user.id == idGunner || interaction.member.user.id == idHacker || interaction.member.user.id == idDriver){
                        await interaction.reply({ content: 'You already Select a Role', ephemeral: true });
                        return;
                    }

                    if(driver == '**FREE**'){
                        idDriver = interaction.user.id;
                        let userDiver = await getUser(idDriver);
                        if(!userDiver){
                            interaction.reply({ content: 'account not create yet!', ephemeral: true });
                            return;
                        }
                        if(userDiver.balance < 100000 || userDiver.balance <= 0){
                            await interaction.reply({ content: `Trov ka ${gif.cash} **100,000**`, ephemeral: true });
                            return;
                        }
                        driver = `<@${idDriver}>\n${gif.cash} **100,000**`;
                        const drive = customEmbed()
                            .setAuthor({ name: `${user.displayName}`, iconURL: user.displayAvatarURL() })
                            .setTitle('ROB A BANK')
                            .setDescription('We need three member to make our rob successfully')
                            .addFields(
                                {name: `GUNNER`, value: `${gif.thief_gif}\n${gunner}`, inline: true},
                                {name: `HACKER`, value: `${gif.thief_gif}\n${hacker}`, inline: true},
                                {name: `DRIVER`, value: `${gif.thief_gif}\n${driver}`, inline: true},
                            )
                            .setImage(gif.theme_bankrob)
                            .setTimestamp()

                        DRIVE.setDisabled(true);
                        await interaction.update({ embeds: [drive], components: [ButtonRow] });
                        return;
                    }
                }

                if(interaction.customId == 'start_collect'){
                    if(interaction.member.user.id != user.id){
                        await interaction.reply({ content: 'You are not hoster!', ephemeral: true });
                        return;
                    }
                    if(gunner_collect == '**FREE**' || !idGunner_collect || hacker_collect == '**FREE**' || !idHacker_collect || driver_collect == '**FREE**' || !idDriver_collect){
                        await interaction.reply({ content: 'Need all member to collect item!', ephemeral: true });
                        return;
                    }

                    await interaction.update({ components: [] });
                    const collecting = customEmbed()
                        .setAuthor({ name: `${user.displayName}`, iconURL: user.displayAvatarURL() })
                        .setTitle('Collecting Item')
                        .setImage(gif.bankrob_collect_money)
                        .setTimestamp()

                    mgs.edit({ embeds: [collecting], components: [] });
                    await sleep(5000);

                    const result = getRandomInt(1, 6);
                    if(result == 1){
                        win = true;
                        const cop_arrvie = customEmbed()
                            .setAuthor({ name: `${user.displayName}`, iconURL: user.displayAvatarURL() })
                            .setTitle('Cop arrive')
                            .setImage(gif.bankrob_cop_arrive)
                            .setTimestamp()

                        mgs.edit({ embeds: [cop_arrvie], components: [] });
                        await sleep(5000);

                        const lose = customEmbed()
                        .setAuthor({ name: `${user.displayName}`, iconURL: user.displayAvatarURL() })
                        .setColor('Red')
                        .setTitle('Police Jab all')
                        .setDescription(`Jol kok 150y ${gunner} ${hacker} ${driver}`)
                        .setImage(`${gif.bankrob_wasted_gif}`)
                        .setTimestamp()
                        mgs.edit({ embeds: [lose], components: [] });

                        return;
                    }else{
                        win = true;
                        const amout = parseInt(getRandomInt(500000, 2000000));
                        let userGunner = await getUser(idGunner);
                        let userHacker = await getUser(idHacker);
                        let userDriver = await getUser(idDriver);
                        userGunner.balance += amout;
                        userHacker.balance += amout;
                        userDriver.balance += amout;
                        await userGunner.save();
                        await userHacker.save();
                        await userDriver.save();
                        const successfully = customEmbed()
                            .setAuthor({ name: `${user.displayName}`, iconURL: user.displayAvatarURL() })
                            .setTitle('Rob The Bank successfully')
                            .setColor('Green')
                            .setDescription(`Team: ${gunner} ${hacker} ${driver} \nGot ${gif.cash} **${amout.toLocaleString()}**`)
                            .setImage(gif.bankrob_success)
                            .setTimestamp()
                        mgs.edit({ embeds: [successfully], components: [] });

                        return;
                    }
                }

                if(interaction.customId == 'getaway'){
                    if(interaction.member.user.id != idHacker){
                        await interaction.reply({ content: 'You are not hacker!', ephemeral: true });
                        return;
                    }
                    await interaction.update({ components: [] });

                    const drinll = customEmbed()
                        .setAuthor({ name: `${user.displayName}`, iconURL: user.displayAvatarURL() })
                        .setTitle('Drilling Fast')
                        .setDescription(`Hacker: ${hacker}`)
                        .setImage(gif.bankrob_drilling)
                        .setTimestamp()
                    mgs.edit({ embeds: [drinll], components: [] });
                    await sleep(10000);

                    const ran = getRandomInt(1, 4);
                    if(ran == 1){
                        win = true;
                        const drinll = customEmbed()
                        .setAuthor({ name: `${user.displayName}`, iconURL: user.displayAvatarURL() })
                        .setTitle('Drill is broken!')
                        .setDescription(`Hacker: ${hacker}`)
                        .setImage(gif.bankrob_drill_broke)
                        .setTimestamp()
                        mgs.edit({ embeds: [drinll], components: [] });
                        await sleep(5000);

                        const cop_arrvie = customEmbed()
                        .setAuthor({ name: `${user.displayName}`, iconURL: user.displayAvatarURL() })
                        .setTitle('Cop arrive')
                        .setImage(gif.bankrob_cop_arrive)
                        .setTimestamp()
                        mgs.edit({ embeds: [cop_arrvie], components: [] });
                        await sleep(5000);

                        const lose = customEmbed()
                        .setAuthor({ name: `${user.displayName}`, iconURL: user.displayAvatarURL() })
                        .setColor('Red')
                        .setTitle('Police Jab all')
                        .setDescription(`Jol kok 150y ${gunner} ${hacker} ${driver}`)
                        .setImage(`${gif.bankrob_wasted_gif}`)
                        .setTimestamp()
                        mgs.edit({ embeds: [lose], components: [] });

                        return;
                    }else{
                        const menu_collect = customEmbed()
                        .setAuthor({ name: `${user.displayName}`, iconURL: user.displayAvatarURL() })
                        .setTitle('COLLECT ALL ITEM')
                        .setDescription('We need three member to collect item successfully')
                        .addFields(
                            {name: `GUNNER`, value: `${gif.thief_gif}\n**FREE**`, inline: true},
                            {name: `HACKER`, value: `${gif.thief_gif}\n**FREE**`, inline: true},
                            {name: `DRIVER`, value: `${gif.thief_gif}\n**FREE**`, inline: true},
                        )
                        .setImage(gif.bankrob_collecte_theme)
                        .setTimestamp()
                        mgs.edit({ embeds: [menu_collect], components: [Button_COLLECT] });
                    }
                }

                if(interaction.customId == 'drill'){
                    if(interaction.member.user.id != idHacker){
                        await interaction.reply({ content: 'You are not hacker!', ephemeral: true });
                        return;
                    }

                    await interaction.update({ components: [] });
                    const drinll = customEmbed()
                        .setAuthor({ name: `${user.displayName}`, iconURL: user.displayAvatarURL() })
                        .setTitle('Drilling')
                        .setDescription(`Hacker: ${hacker}`)
                        .setImage(gif.bankrob_drilling)
                        .setTimestamp()
                    mgs.edit({ embeds: [drinll], components: [] });
                    await sleep(10000);

                    const ran = getRandomInt(1, 4);
                    if(ran == 1){
                        win = true;
                        const open_vault = customEmbed()
                        .setAuthor({ name: `${user.displayName}`, iconURL: user.displayAvatarURL() })
                        .setTitle('Someone calling cop')
                        .setImage(gif.bankrob_someone_call_cop)
                        .setTimestamp()
                        mgs.edit({ embeds: [open_vault], components: [] });
                        await sleep(5000);

                        const cop_arrvie = customEmbed()
                        .setAuthor({ name: `${user.displayName}`, iconURL: user.displayAvatarURL() })
                        .setTitle('Cop arrive')
                        .setImage(gif.bankrob_cop_arrive)
                        .setTimestamp()
                        mgs.edit({ embeds: [cop_arrvie], components: [] });
                        await sleep(5000);

                        const lose = customEmbed()
                        .setAuthor({ name: `${user.displayName}`, iconURL: user.displayAvatarURL() })
                        .setColor('Red')
                        .setTitle('Police Jab all')
                        .setDescription(`Jol kok 150y ${gunner} ${hacker} ${driver}`)
                        .setImage(`${gif.bankrob_wasted_gif}`)
                        .setTimestamp()
                        mgs.edit({ embeds: [lose], components: [] });

                        return;
                    }else{
                        const menu_collect = customEmbed()
                        .setAuthor({ name: `${user.displayName}`, iconURL: user.displayAvatarURL() })
                        .setTitle('COLLECT ALL ITEM')
                        .setDescription('We need three member to collect item successfully')
                        .addFields(
                            {name: `GUNNER`, value: `${gif.thief_gif}\n**FREE**`, inline: true},
                            {name: `HACKER`, value: `${gif.thief_gif}\n**FREE**`, inline: true},
                            {name: `DRIVER`, value: `${gif.thief_gif}\n**FREE**`, inline: true},
                        )
                        .setImage(gif.bankrob_collecte_theme)
                        .setTimestamp()
                        mgs.edit({ embeds: [menu_collect], components: [Button_COLLECT] });
                    }
                }

                if(interaction.customId == 'getinto'){
                    if(interaction.member.user.id != idGunner){
                        await interaction.reply({ content: 'You are not gunner!', ephemeral: true });
                        return;
                    }

                    await interaction.update({ components: [] });
                    const GET_INTO_VAULT = customEmbed()
                        .setAuthor({ name: `${user.displayName}`, iconURL: user.displayAvatarURL() })
                        .setTitle('going to the Vault')
                        .setDescription(`Team: ${gunner} ${hacker} ${driver}`)
                        .setImage(gif.bankrob_go_without_kill)
                        .setTimestamp()
                    mgs.edit({ embeds: [GET_INTO_VAULT], components: [] });
                    await sleep(5000);

                    const ran = getRandomInt(1, 4);
                    if(ran == 1){
                        win = true;
                        const drinll = customEmbed()
                            .setAuthor({ name: `${user.displayName}`, iconURL: user.displayAvatarURL() })
                            .setTitle('Staff calling cop')
                            .setImage(gif.bankrob_stuff_call_cop)
                            .setTimestamp()
                        mgs.edit({ embeds: [drinll], components: [] });
                        await sleep(5000);

                        const cop_arrvie = customEmbed()
                        .setAuthor({ name: `${user.displayName}`, iconURL: user.displayAvatarURL() })
                        .setTitle('Cop arrive')
                        .setImage(gif.bankrob_cop_arrive)
                        .setTimestamp()
                        mgs.edit({ embeds: [cop_arrvie], components: [] });
                        await sleep(5000);

                        const lose = customEmbed()
                        .setAuthor({ name: `${user.displayName}`, iconURL: user.displayAvatarURL() })
                        .setColor('Red')
                        .setTitle('Police Jab all')
                        .setDescription(`Jol kok 150y ${gunner} ${hacker} ${driver}`)
                        .setImage(`${gif.bankrob_wasted_gif}`)
                        .setTimestamp()
                        mgs.edit({ embeds: [lose], components: [] });

                        return;
                    }else{
                        const drinll = customEmbed()
                            .setAuthor({ name: `${user.displayName}`, iconURL: user.displayAvatarURL() })
                            .setTitle('Arrive Vault')
                            .setDescription(`Hacker ${hacker}`)
                            .setImage(gif.bankrob_infront_valult)
                            .setTimestamp()
                        mgs.edit({ embeds: [drinll], components: [Button_DILL_GETAWAY] });
                    }
                }

                if(interaction.customId == 'go_free'){
                    if(interaction.member.user.id != idGunner){
                        await interaction.reply({ content: 'You are not gunner!', ephemeral: true });
                        return;
                    }
                    await interaction.update({ components: [] });
                    const GET_INTO_VAULT = customEmbed()
                        .setAuthor({ name: `${user.displayName}`, iconURL: user.displayAvatarURL() })
                        .setTitle('going to the Vault')
                        .setDescription(`Team: ${gunner} ${hacker} ${driver}`)
                        .setImage(gif.bankrob_go_after_kill)
                        .setTimestamp()
                    mgs.edit({ embeds: [GET_INTO_VAULT], components: [] });
                    await sleep(5000);

                    const drinll = customEmbed()
                            .setAuthor({ name: `${user.displayName}`, iconURL: user.displayAvatarURL() })
                            .setTitle('Arrive Vault')
                            .setDescription(`Hacker ${hacker}`)
                            .setImage(gif.bankrob_infront_valult)
                            .setTimestamp()
                    mgs.edit({ embeds: [drinll], components: [Button_DILL_GETAWAY] });
                }

                if(interaction.customId == 'kill'){
                    if(interaction.member.user.id != idGunner){
                        await interaction.reply({ content: 'You are not gunner!', ephemeral: true });
                        return;
                    }
                    Kill.setDisabled(true);
                    await interaction.update({ components: [] });

                    const killing = customEmbed()
                        .setAuthor({ name: `${user.displayName}`, iconURL: user.displayAvatarURL() })
                        .setTitle('You kill that staff')
                        .setDescription(`Gunner: ${gunner}`)
                        .setImage(gif.bankrob_kill_stuff)
                        .setTimestamp()
                    mgs.edit({ embeds: [killing], components: [] });
                    await sleep(5000);

                    const ran_kill = getRandomInt(1, 4);

                    if(ran_kill == 1){
                        win = true;
                        const cop_arrvie = customEmbed()
                        .setAuthor({ name: `${user.displayName}`, iconURL: user.displayAvatarURL() })
                        .setTitle('Cop arrive')
                        .setImage(gif.bankrob_cop_arrive)
                        .setTimestamp()
                        mgs.edit({ embeds: [cop_arrvie], components: [] });
                        await sleep(5000);

                        const lose = customEmbed()
                        .setAuthor({ name: `${user.displayName}`, iconURL: user.displayAvatarURL() })
                        .setColor('Red')
                        .setTitle('Police Jab all')
                        .setDescription(`Jol kok 150y ${gunner} ${hacker} ${driver}`)
                        .setImage(`${gif.bankrob_wasted_gif}`)
                        mgs.edit({ embeds: [lose], components: [] });

                        return;

                    }else{
                        const killing = customEmbed()
                            .setAuthor({ name: `${user.displayName}`, iconURL: user.displayAvatarURL() })
                            .setTitle('You kill that staff')
                            .setDescription(`Gunner: ${gunner}`)
                            .setImage(gif.bankrob_choich_after_kill)
                            .setTimestamp()
                        mgs.edit({ embeds: [killing], components: [Button_go_free] });
                        await sleep(5000);
                    }
                }

                if(interaction.customId == 'start' && interaction.member.user.id == user.id){
                    if(interaction.member.user.id != user.id){
                        await interaction.reply({ content: 'You are not hoster!', ephemeral: true });
                        return;
                    }
                    if(gunner == '**FREE**' || !idGunner || hacker == '**FREE**' || !idHacker || driver == '**FREE**' || !idDriver){
                        await interaction.reply({ content: 'Need Three Role to Rob!', ephemeral: true });
                        return;
                    }
                    afk = false;
                    gunner = `<@${idGunner}>`;
                    hacker = `<@${idHacker}>`;
                    driver = `<@${idDriver}>`;

                    let userGunner = await getUser(idGunner);
                    userGunner.balance -= 100000;
                    await userGunner.save();
                    let userHacker = await getUser(idHacker);
                    userHacker.balance -= 100000;
                    await userHacker.save();
                    let userDiver = await getUser(idDriver);
                    userDiver.balance -= 100000;
                    await userDiver.save();

                    await interaction.update({ components: [] });
                    const car_drive = customEmbed()
                        .setAuthor({ name: `${user.displayName}`, iconURL: user.displayAvatarURL() })
                        .setTitle(`Check Map`)
                        .setDescription(`Driver: ${driver}`)
                        .setImage(`${gif.bankrob_check_map}`)
                        .setTimestamp()
                    mgs.edit({ embeds: [car_drive], components: [Button_Drive] });
                }

                if(interaction.customId == 'start_drive'){
                    if(interaction.member.user.id != idDriver){
                        await interaction.reply({ content: 'You are not driver!', ephemeral: true });
                        return;
                    }
                    await interaction.update({ components: [] });

                    const ran = getRandomInt(1, 5);
                    if(ran == 1){
                        win = true;
                        const car_drive = customEmbed()
                        .setAuthor({ name: `${user.displayName}`, iconURL: user.displayAvatarURL() })
                        .setTitle(`Go to the Bank`)
                        .setDescription(`Driver: ${driver}`)
                        .setImage(`${gif.bankrob_buk_cop}`)
                        .setTimestamp()
                        mgs.edit({ embeds: [car_drive], components: [] });
                        await sleep(5000);

                        const bank_place = customEmbed()
                        .setAuthor({ name: `${user.displayName}`, iconURL: user.displayAvatarURL() })
                        .setTitle(`Berk lan buk police`)
                        .setColor('Red')
                        .setDescription(`Jol kok 150y ${gunner} ${hacker} ${driver}`)
                        .setDescription(`Team: ${gunner} ${hacker} ${driver}`)
                        .setImage(`${gif.bankrob_wasted_gif}`)
                        .setTimestamp()
                        mgs.edit({ embeds: [bank_place], components: [] });

                        return;
                    }else{
                        const car_drive = customEmbed()
                        .setAuthor({ name: `${user.displayName}`, iconURL: user.displayAvatarURL() })
                        .setTitle(`Go to the Bank`)
                        .setDescription(`Driver: ${driver}`)
                        .setImage(`${gif.bankrob_driving_gif}`)
                        .setTimestamp()
                        mgs.edit({ embeds: [car_drive], components: [] });
                        await sleep(5000);

                        const into = customEmbed()
                        .setAuthor({ name: `${user.displayName}`, iconURL: user.displayAvatarURL() })
                        .setTitle(`Get into The Bank`)
                        .setDescription(`Team: ${gunner} ${hacker} ${driver}`)
                        .setImage(`${gif.bankrob_get_into_bank}`)
                        .setTimestamp()
                        mgs.edit({ embeds: [into], components: [] });
                        await sleep(5000);

                        const walking = customEmbed()
                        .setAuthor({ name: `${user.displayName}`, iconURL: user.displayAvatarURL() })
                        .setTitle(`Walking...`)
                        .setDescription(`Team: ${gunner} ${hacker} ${driver}`)
                        .setImage(`${gif.bankrob_walking}`)
                        .setTimestamp()
                        mgs.edit({ embeds: [walking], components: [] });
                        await sleep(5000);

                        const infront = customEmbed()
                        .setAuthor({ name: `${user.displayName}`, iconURL: user.displayAvatarURL() })
                        .setTitle(`Talking with Staff`)
                        .setDescription(`Gunner: ${gunner}`)
                        .setImage(gif.bankrob_infront_stuff)
                        .setTimestamp()
                        mgs.edit({ embeds: [infront], components: [Button_Kill_GET] });
                    }
                }

                if(interaction.customId == 'cancel'){
                    if(interaction.member.user.id != user.id){
                        win = true;
                        await interaction.reply({ content: 'You are not hoster!', ephemeral: true });
                    }
                    mgs.edit({ content: `Bank Robbing Cancel by <@${user.id}>`, embeds: [], components: [] });
                    afk = false;
                    win = true;
                    collector.stop();
                    return;
                }
            });

            return;
        }catch(error){
            console.log(`bankrob error ${error}`);
        }
    },
};