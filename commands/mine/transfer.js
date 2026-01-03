const {getUser, SimpleEmbed, gif, labelButton, twoButton, ButtonStyle, customEmbed, getCollectionButton, sym3, sym, cooldown} = require('../../functioon/function');

const cooldowns = new Map();
let CDT = 25_000;
var getId = [];
var cdId = [];
var prem = [];

module.exports = {
    name: 'tf',
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

            const mentionUser = message.mentions.users.first();
        
            if(!mentionUser){
                message.reply({ embeds: [SimpleEmbed('Please mention na ke muy mor!')] });
                return;
            }
            const item = args[0];
        
            const item_name = ['adddouble', 'addrate', 'addpercen', 'box', 'fire', 'zaz', 'esen', 'egg', 'lootbox', 'crate', 'seed', 'metal', 'kof_box', 'wcf', 'wcl', 'gold'];

            if(!item_name.includes(item)){
                message.reply({ embeds: [SimpleEmbed(`<@${user.id}> enter item name`)] });
                return;
            }
        
            let amount_item = parseInt(args[1]);
            const amount = args[1];
            if(isNaN(amount_item)){
                message.reply({ embeds: [SimpleEmbed(`<@${user.id}> enter amount item`)] });
                return;
            }

            if(amount == `${amount_item}k` || amount == `${amount_item}K`){
                amount_item *= 1000;
            }
        
            if(item && isNaN(amount_item)){
                return;
            }
        
            let senderData = await getUser(user.id);
            let receiverDate = await getUser(mentionUser.id);
        
            if(!receiverDate){
                return message.reply({ embeds: [SimpleEmbed(`This <@${mentionUser.id}> didn't play any cmd!!`)] });
            }
        
            if(senderData.userId == mentionUser.id){
                message.reply({ embeds: [SimpleEmbed(`<@${user.id}> mix give klun eng jg?`)] });
                return;
            }
        
            if(item == 'gold'){
                try{
                    if(senderData.gold_coin < amount_item || senderData.gold_coin <= 0){
                        message.reply({ embeds: [SimpleEmbed(`${gif.gold_coin} not enough!`)] });
                        return;
                    }
            
                    const embed = customEmbed()
                        .setAuthor({ name: `${user.username}, you are about to give gold to ${mentionUser.username}`, iconURL: user.displayAvatarURL() })
                        .setColor('Aqua')
                        .setDescription(`To confirm this transaction, click ✅ Confirm.\nTo cancel this transaction, click ❎ Cancel.\n\n⚠️ It is against our rules to trade Hemiko for anything of monetary value. This includes real money, crypto, nitro, or anything similar. You will be banned for doing so.\n\n<@${user.id}> **Will give** <@${mentionUser.id}>:\n${sym3}${amount_item.toLocaleString()} Gold${sym3}`)
                        .setTimestamp();

                    const confirmButton = labelButton('confirm_button', '✅ Confirm', ButtonStyle.Success);
                    const cancelButton = labelButton('cancel_button', '❎ Cancel', ButtonStyle.Danger);
                    const allButtons = twoButton(confirmButton, cancelButton);

                    const messageEmbed = await message.channel.send({ embeds: [embed], components: [allButtons] });

                    const collector = getCollectionButton(messageEmbed, CDT);

                    collector.on('end', (collected, reason) => {
                        if (reason === 'time') {
                            confirmButton.setDisabled(true);
                            cancelButton.setDisabled(true);
                            messageEmbed.edit({ embeds: [embed.setColor('#3D3D3D')], components: [allButtons] });
                            return;
                        }
                    });

                    collector.on('collect', async (interaction) => {
                        if(interaction.member.user.id !== user.id){
                            await interaction.reply({ content: 'This button is not for you!', ephemeral: true });
                            return;
                        }

                        if(interaction.customId === 'confirm_button'){
                            try{
                                const userData = await getUser(user.id);
                                const targetData = await getUser(mentionUser.id);
                                userData.gold_coin -= amount_item;
                                targetData.gold_coin += amount_item;
                                
                                await Promise.all([
                                    targetData.save(),
                                    userData.save()
                                ]);
                            }catch(error){}

                            confirmButton.setDisabled(true);
                            cancelButton.setDisabled(true);

                            interaction.update({ embeds: [embed.setDescription(`This is **Transition** from ${user.username} to ${mentionUser.username} .\n\n✅ **Done**, It is against our rules to trade Hemiko for anything of monetary value. This includes real money, crypto, nitro, or anything similar. You will be banned for doing so.\n\n<@${user.id}> **Gave** <@${mentionUser.id}>:\n` + '```' + `fix\n${amount_item.toLocaleString()} Gold\n` + '```').setColor("Green")], components: [] });
                            collector.stop();
                        }

                        if (interaction.customId === 'cancel_button') {

                            confirmButton.setDisabled(true);
                            cancelButton.setDisabled(true);

                            interaction.update({ embeds: [embed.setDescription(`This is **Transition** from ${user.username} to ${mentionUser.username} .\n\n:x: **Cancel**, It is against our rules to trade Hemiko for anything of monetary value. This includes real money, crypto, nitro, or anything similar. You will be banned for doing so.\n\n<@${user.id}> **Stop** <@${mentionUser.id}>:\n${sym3}${amount_item.toLocaleString()} Gold${sym3}`).setColor("Red")], components: [] });
                            collector.stop();
                        }
                    });
                    
                    return;
                }catch(error){ console.log(`${error}`) }
            }

            if(item == 'wcl'){
                try{
                    if(senderData.gem['777'] < amount_item || senderData.gem['777'] <= 0){
                        message.reply({ embeds: [SimpleEmbed(`${gif['777']} not enough!`)] });
                        return;
                    }

                    const embed = customEmbed()
                        .setAuthor({ name: `${user.username}, you are about to give lootbox legendary to ${mentionUser.username}`, iconURL: user.displayAvatarURL() })
                        .setColor('Aqua')
                        .setDescription(`To confirm this transaction, click ✅ Confirm.\nTo cancel this transaction, click ❎ Cancel.\n\n⚠️ It is against our rules to trade Hemiko for anything of monetary value. This includes real money, crypto, nitro, or anything similar. You will be banned for doing so.\n\n<@${user.id}> **Will give** <@${mentionUser.id}>:\n${sym3}${amount_item.toLocaleString()} Crate legendary${sym3}`)
                        .setTimestamp();

                    const confirmButton = labelButton('confirm_button', '✅ Confirm', ButtonStyle.Success);
                    const cancelButton = labelButton('cancel_button', '❎ Cancel', ButtonStyle.Danger);
                    const allButtons = twoButton(confirmButton, cancelButton);

                    const messageEmbed = await message.channel.send({ embeds: [embed], components: [allButtons] });

                    const collector = getCollectionButton(messageEmbed, CDT);

                    collector.on('end', (collected, reason) => {
                        if (reason === 'time') {
                            confirmButton.setDisabled(true);
                            cancelButton.setDisabled(true);
                            messageEmbed.edit({ embeds: [embed.setColor('#3D3D3D')], components: [allButtons] });
                            return;
                        }
                    });

                    collector.on('collect', async (interaction) => {
                        if(interaction.member.user.id !== user.id){
                            await interaction.reply({ content: 'This button is not for you!', ephemeral: true });
                            return;
                        }

                        if(interaction.customId === 'confirm_button'){
                            try{
                                const userData = await getUser(user.id);
                                const targetData = await getUser(mentionUser.id);
                                userData.gem['777'] -= amount_item;
                                targetData.gem['777'] += amount_item;
                                
                                await Promise.all([
                                    targetData.save(),
                                    userData.save()
                                ]);
                            }catch(error){}

                            confirmButton.setDisabled(true);
                            cancelButton.setDisabled(true);

                            interaction.update({ embeds: [embed.setDescription(`This is **Transition** from ${user.username} to ${mentionUser.username} .\n\n✅ **Done**, It is against our rules to trade Hemiko for anything of monetary value. This includes real money, crypto, nitro, or anything similar. You will be banned for doing so.\n\n<@${user.id}> **Gave** <@${mentionUser.id}>:\n` + '```' + `fix\n${amount_item.toLocaleString()} Crate legendary\n` + '```').setColor("Green")], components: [] });
                            collector.stop();
                        }

                        if (interaction.customId === 'cancel_button') {

                            confirmButton.setDisabled(true);
                            cancelButton.setDisabled(true);

                            interaction.update({ embeds: [embed.setDescription(`This is **Transition** from ${user.username} to ${mentionUser.username} .\n\n:x: **Cancel**, It is against our rules to trade Hemiko for anything of monetary value. This includes real money, crypto, nitro, or anything similar. You will be banned for doing so.\n\n<@${user.id}> **Stop** <@${mentionUser.id}>:\n${sym3}${amount_item.toLocaleString()} Crate legendary${sym3}`).setColor("Red")], components: [] });
                            collector.stop();
                        }
                    });
    
                    return;
                }catch(error){}
            }

            if(item == 'wcf'){
                try{
                    if(senderData.gem['999'] < amount_item || senderData.gem['999'] <= 0){
                        message.reply({ embeds: [SimpleEmbed(`${gif['999']} not enough!`)] });
                        return;
                    }

                    const embed = customEmbed()
                        .setAuthor({ name: `${user.username}, you are about to give lootbox fabled to ${mentionUser.username}`, iconURL: user.displayAvatarURL() })
                        .setColor('Aqua')
                        .setDescription(`To confirm this transaction, click ✅ Confirm.\nTo cancel this transaction, click ❎ Cancel.\n\n⚠️ It is against our rules to trade Hemiko for anything of monetary value. This includes real money, crypto, nitro, or anything similar. You will be banned for doing so.\n\n<@${user.id}> **Will give** <@${mentionUser.id}>:\n${sym3}${amount_item.toLocaleString()} Crate fabled${sym3}`)
                        .setTimestamp();

                    const confirmButton = labelButton('confirm_button', '✅ Confirm', ButtonStyle.Success);
                    const cancelButton = labelButton('cancel_button', '❎ Cancel', ButtonStyle.Danger);
                    const allButtons = twoButton(confirmButton, cancelButton);

                    const messageEmbed = await message.channel.send({ embeds: [embed], components: [allButtons] });

                    const collector = getCollectionButton(messageEmbed, CDT);

                    collector.on('end', (collected, reason) => {
                        if (reason === 'time') {
                            confirmButton.setDisabled(true);
                            cancelButton.setDisabled(true);
                            messageEmbed.edit({ embeds: [embed.setColor('#3D3D3D')], components: [allButtons] });
                            return;
                        }
                    });

                    collector.on('collect', async (interaction) => {
                        if(interaction.member.user.id !== user.id){
                            await interaction.reply({ content: 'This button is not for you!', ephemeral: true });
                            return;
                        }

                        if(interaction.customId === 'confirm_button'){
                            try{
                                const userData = await getUser(user.id);
                                const targetData = await getUser(mentionUser.id);
                                userData.gem['999'] -= amount_item;
                                targetData.gem['999'] += amount_item;
                                
                                await Promise.all([
                                    targetData.save(),
                                    userData.save()
                                ]);
                            }catch(error){}

                            confirmButton.setDisabled(true);
                            cancelButton.setDisabled(true);

                            interaction.update({ embeds: [embed.setDescription(`This is **Transition** from ${user.username} to ${mentionUser.username} .\n\n✅ **Done**, It is against our rules to trade Hemiko for anything of monetary value. This includes real money, crypto, nitro, or anything similar. You will be banned for doing so.\n\n<@${user.id}> **Gave** <@${mentionUser.id}>:\n` + '```' + `fix\n${amount_item.toLocaleString()} Crate fabled\n` + '```').setColor("Green")], components: [] });
                            collector.stop();
                        }

                        if (interaction.customId === 'cancel_button') {

                            confirmButton.setDisabled(true);
                            cancelButton.setDisabled(true);

                            interaction.update({ embeds: [embed.setDescription(`This is **Transition** from ${user.username} to ${mentionUser.username} .\n\n:x: **Cancel**, It is against our rules to trade Hemiko for anything of monetary value. This includes real money, crypto, nitro, or anything similar. You will be banned for doing so.\n\n<@${user.id}> **Stop** <@${mentionUser.id}>:\n${sym3}${amount_item.toLocaleString()} Crate fabled${sym3}`).setColor("Red")], components: [] });
                            collector.stop();
                        }
                    });
            
                    return;
                }catch(error){}
            }

            if(item == 'kof_box'){
                try{
                    if(senderData.gem['kof'] < amount_item || senderData.gem['kof'] <= 0){
                        message.reply({ embeds: [SimpleEmbed(`${gif.kof_box} not enough!`)] });
                        return;
                    }

                    const embed = customEmbed()
                        .setAuthor({ name: `${user.username}, you are about to give kof box to ${mentionUser.username}`, iconURL: user.displayAvatarURL() })
                        .setColor('Aqua')
                        .setDescription(`To confirm this transaction, click ✅ Confirm.\nTo cancel this transaction, click ❎ Cancel.\n\n⚠️ It is against our rules to trade Hemiko for anything of monetary value. This includes real money, crypto, nitro, or anything similar. You will be banned for doing so.\n\n<@${user.id}> **Will give** <@${mentionUser.id}>:\n${sym3}${amount_item.toLocaleString()} Kof box${sym3}`)
                        .setTimestamp();

                    const confirmButton = labelButton('confirm_button', '✅ Confirm', ButtonStyle.Success);
                    const cancelButton = labelButton('cancel_button', '❎ Cancel', ButtonStyle.Danger);
                    const allButtons = twoButton(confirmButton, cancelButton);

                    const messageEmbed = await message.channel.send({ embeds: [embed], components: [allButtons] });

                    const collector = getCollectionButton(messageEmbed, CDT);

                    collector.on('end', (collected, reason) => {
                        if (reason === 'time') {
                            confirmButton.setDisabled(true);
                            cancelButton.setDisabled(true);
                            messageEmbed.edit({ embeds: [embed.setColor('#3D3D3D')], components: [allButtons] });
                            return;
                        }
                    });

                    collector.on('collect', async (interaction) => {
                        if(interaction.member.user.id !== user.id){
                            await interaction.reply({ content: 'This button is not for you!', ephemeral: true });
                            return;
                        }

                        if(interaction.customId === 'confirm_button'){
                            try{
                                const userData = await getUser(user.id);
                                const targetData = await getUser(mentionUser.id);
                                userData.gem['kof'] -= amount_item;
                                targetData.gem['kof'] += amount_item;
                                
                                await Promise.all([
                                    targetData.save(),
                                    userData.save()
                                ]);
                            }catch(error){}

                            confirmButton.setDisabled(true);
                            cancelButton.setDisabled(true);

                            interaction.update({ embeds: [embed.setDescription(`This is **Transition** from ${user.username} to ${mentionUser.username} .\n\n✅ **Done**, It is against our rules to trade Hemiko for anything of monetary value. This includes real money, crypto, nitro, or anything similar. You will be banned for doing so.\n\n<@${user.id}> **Gave** <@${mentionUser.id}>:\n` + '```' + `fix\n${amount_item.toLocaleString()} Kof box\n` + '```').setColor("Green")], components: [] });
                            collector.stop();
                        }

                        if (interaction.customId === 'cancel_button') {

                            confirmButton.setDisabled(true);
                            cancelButton.setDisabled(true);

                            interaction.update({ embeds: [embed.setDescription(`This is **Transition** from ${user.username} to ${mentionUser.username} .\n\n:x: **Cancel**, It is against our rules to trade Hemiko for anything of monetary value. This includes real money, crypto, nitro, or anything similar. You will be banned for doing so.\n\n<@${user.id}> **Stop** <@${mentionUser.id}>:\n${sym3}${amount_item.toLocaleString()} Kof box${sym3}`).setColor("Red")], components: [] });
                            collector.stop();
                        }
                    });
            
                    return;
                }catch(error){}
            }

            if(item == 'seed'){
                try{
                    if(senderData.farm.seed < amount_item || senderData.farm.seed <= 0){
                        message.reply({ embeds: [SimpleEmbed(`🪹 not enough!`)] });
                        return;
                    }

                    const embed = customEmbed()
                        .setAuthor({ name: `${user.username}, you are about to give seed to ${mentionUser.username}`, iconURL: user.displayAvatarURL() })
                        .setColor('Aqua')
                        .setDescription(`To confirm this transaction, click ✅ Confirm.\nTo cancel this transaction, click ❎ Cancel.\n\n⚠️ It is against our rules to trade Hemiko for anything of monetary value. This includes real money, crypto, nitro, or anything similar. You will be banned for doing so.\n\n<@${user.id}> **Will give** <@${mentionUser.id}>:\n${sym3}${amount_item.toLocaleString()} seed${sym3}`)
                        .setTimestamp();

                    const confirmButton = labelButton('confirm_button', '✅ Confirm', ButtonStyle.Success);
                    const cancelButton = labelButton('cancel_button', '❎ Cancel', ButtonStyle.Danger);
                    const allButtons = twoButton(confirmButton, cancelButton);

                    const messageEmbed = await message.channel.send({ embeds: [embed], components: [allButtons] });

                    const collector = getCollectionButton(messageEmbed, CDT);

                    collector.on('end', (collected, reason) => {
                        if (reason === 'time') {
                            confirmButton.setDisabled(true);
                            cancelButton.setDisabled(true);
                            messageEmbed.edit({ embeds: [embed.setColor('#3D3D3D')], components: [allButtons] });
                            return;
                        }
                    });

                    collector.on('collect', async (interaction) => {
                        if(interaction.member.user.id !== user.id){
                            await interaction.reply({ content: 'This button is not for you!', ephemeral: true });
                            return;
                        }

                        if(interaction.customId === 'confirm_button'){
                            try{
                                const userData = await getUser(user.id);
                                const targetData = await getUser(mentionUser.id);
                                userData.farm.seed -= amount_item;
                                targetData.farm.seed += amount_item;
                                
                                await Promise.all([
                                    targetData.save(),
                                    userData.save()
                                ]);
                            }catch(error){}

                            confirmButton.setDisabled(true);
                            cancelButton.setDisabled(true);

                            interaction.update({ embeds: [embed.setDescription(`This is **Transition** from ${user.username} to ${mentionUser.username} .\n\n✅ **Done**, It is against our rules to trade Hemiko for anything of monetary value. This includes real money, crypto, nitro, or anything similar. You will be banned for doing so.\n\n<@${user.id}> **Gave** <@${mentionUser.id}>:\n` + '```' + `fix\n${amount_item.toLocaleString()} seed\n` + '```').setColor("Green")], components: [] });
                            collector.stop();
                        }

                        if (interaction.customId === 'cancel_button') {

                            confirmButton.setDisabled(true);
                            cancelButton.setDisabled(true);

                            interaction.update({ embeds: [embed.setDescription(`This is **Transition** from ${user.username} to ${mentionUser.username} .\n\n:x: **Cancel**, It is against our rules to trade Hemiko for anything of monetary value. This includes real money, crypto, nitro, or anything similar. You will be banned for doing so.\n\n<@${user.id}> **Stop** <@${mentionUser.id}>:\n${sym3}${amount_item.toLocaleString()} seed${sym3}`).setColor("Red")], components: [] });
                            collector.stop();
                        }
                    });

                    return;
                }catch(error){}
            }

            if(item == 'metal'){
                try{
                    if(senderData.shard < amount_item || senderData.shard <= 0){
                        message.reply({ embeds: [SimpleEmbed(`${gif.shard_gif} not enough!`)] });
                        return;
                    }

                    const embed = customEmbed()
                        .setAuthor({ name: `${user.username}, you are about to give metal to ${mentionUser.username}`, iconURL: user.displayAvatarURL() })
                        .setColor('Aqua')
                        .setDescription(`To confirm this transaction, click ✅ Confirm.\nTo cancel this transaction, click ❎ Cancel.\n\n⚠️ It is against our rules to trade Hemiko for anything of monetary value. This includes real money, crypto, nitro, or anything similar. You will be banned for doing so.\n\n<@${user.id}> **Will give** <@${mentionUser.id}>:\n${sym3}${amount_item.toLocaleString()} metal${sym3}`)
                        .setTimestamp();

                    const confirmButton = labelButton('confirm_button', '✅ Confirm', ButtonStyle.Success);
                    const cancelButton = labelButton('cancel_button', '❎ Cancel', ButtonStyle.Danger);
                    const allButtons = twoButton(confirmButton, cancelButton);

                    const messageEmbed = await message.channel.send({ embeds: [embed], components: [allButtons] });

                    const collector = getCollectionButton(messageEmbed, CDT);

                    collector.on('end', (collected, reason) => {
                        if (reason === 'time') {
                            confirmButton.setDisabled(true);
                            cancelButton.setDisabled(true);
                            messageEmbed.edit({ embeds: [embed.setColor('#3D3D3D')], components: [allButtons] });
                            return;
                        }
                    });

                    collector.on('collect', async (interaction) => {
                        if(interaction.member.user.id !== user.id){
                            await interaction.reply({ content: 'This button is not for you!', ephemeral: true });
                            return;
                        }

                        if(interaction.customId === 'confirm_button'){
                            try{
                                const userData = await getUser(user.id);
                                const targetData = await getUser(mentionUser.id);
                                userData.farm.shard -= amount_item;
                                targetData.farm.shard += amount_item;
                                
                                await Promise.all([
                                    targetData.save(),
                                    userData.save()
                                ]);
                            }catch(error){}

                            confirmButton.setDisabled(true);
                            cancelButton.setDisabled(true);

                            interaction.update({ embeds: [embed.setDescription(`This is **Transition** from ${user.username} to ${mentionUser.username} .\n\n✅ **Done**, It is against our rules to trade Hemiko for anything of monetary value. This includes real money, crypto, nitro, or anything similar. You will be banned for doing so.\n\n<@${user.id}> **Gave** <@${mentionUser.id}>:\n` + '```' + `fix\n${amount_item.toLocaleString()} metal\n` + '```').setColor("Green")], components: [] });
                            collector.stop();
                        }

                        if (interaction.customId === 'cancel_button') {

                            confirmButton.setDisabled(true);
                            cancelButton.setDisabled(true);

                            interaction.update({ embeds: [embed.setDescription(`This is **Transition** from ${user.username} to ${mentionUser.username} .\n\n:x: **Cancel**, It is against our rules to trade Hemiko for anything of monetary value. This includes real money, crypto, nitro, or anything similar. You will be banned for doing so.\n\n<@${user.id}> **Stop** <@${mentionUser.id}>:\n${sym3}${amount_item.toLocaleString()} metal${sym3}`).setColor("Red")], components: [] });
                            collector.stop();
                        }
                    });
            
                    return;
                }catch(error){}
            }

            if(item == 'esen'){
                try{
                    if(senderData.egg.esen < amount_item || senderData.egg.esen <= 0){
                        message.reply({ embeds: [SimpleEmbed(`${gif.esen_gif} not enough!`)] });
                        return;
                    }

                    const embed = customEmbed()
                        .setAuthor({ name: `${user.username}, you are about to give esen to ${mentionUser.username}`, iconURL: user.displayAvatarURL() })
                        .setColor('Aqua')
                        .setDescription(`To confirm this transaction, click ✅ Confirm.\nTo cancel this transaction, click ❎ Cancel.\n\n⚠️ It is against our rules to trade Hemiko for anything of monetary value. This includes real money, crypto, nitro, or anything similar. You will be banned for doing so.\n\n<@${user.id}> **Will give** <@${mentionUser.id}>:\n${sym3}${amount_item.toLocaleString()} Esen${sym3}`)
                        .setTimestamp();

                    const confirmButton = labelButton('confirm_button', '✅ Confirm', ButtonStyle.Success);
                    const cancelButton = labelButton('cancel_button', '❎ Cancel', ButtonStyle.Danger);
                    const allButtons = twoButton(confirmButton, cancelButton);

                    const messageEmbed = await message.channel.send({ embeds: [embed], components: [allButtons] });

                    const collector = getCollectionButton(messageEmbed, CDT);

                    collector.on('end', (collected, reason) => {
                        if (reason === 'time') {
                            confirmButton.setDisabled(true);
                            cancelButton.setDisabled(true);
                            messageEmbed.edit({ embeds: [embed.setColor('#3D3D3D')], components: [allButtons] });
                            return;
                        }
                    });

                    collector.on('collect', async (interaction) => {
                        if(interaction.member.user.id !== user.id){
                            await interaction.reply({ content: 'This button is not for you!', ephemeral: true });
                            return;
                        }

                        if(interaction.customId === 'confirm_button'){
                            try{
                                const userData = await getUser(user.id);
                                const targetData = await getUser(mentionUser.id);
                                userData.farm.egg.esen -= amount_item;
                                targetData.farm.egg.esen += amount_item;
                                
                                await Promise.all([
                                    targetData.save(),
                                    userData.save()
                                ]);
                            }catch(error){}

                            confirmButton.setDisabled(true);
                            cancelButton.setDisabled(true);

                            interaction.update({ embeds: [embed.setDescription(`This is **Transition** from ${user.username} to ${mentionUser.username} .\n\n✅ **Done**, It is against our rules to trade Hemiko for anything of monetary value. This includes real money, crypto, nitro, or anything similar. You will be banned for doing so.\n\n<@${user.id}> **Gave** <@${mentionUser.id}>:\n` + '```' + `fix\n${amount_item.toLocaleString()} Esen\n` + '```').setColor("Green")], components: [] });
                            collector.stop();
                        }

                        if (interaction.customId === 'cancel_button') {

                            confirmButton.setDisabled(true);
                            cancelButton.setDisabled(true);

                            interaction.update({ embeds: [embed.setDescription(`This is **Transition** from ${user.username} to ${mentionUser.username} .\n\n:x: **Cancel**, It is against our rules to trade Hemiko for anything of monetary value. This includes real money, crypto, nitro, or anything similar. You will be banned for doing so.\n\n<@${user.id}> **Stop** <@${mentionUser.id}>:\n${sym3}${amount_item.toLocaleString()} Esen${sym3}`).setColor("Red")], components: [] });
                            collector.stop();
                        }
                    });
            
                    return;
                }catch(error){}
            }

            if(item == 'crate'){
                try{
                    if(senderData.gem['100'] < amount_item || senderData.gem['100'] <= 0){
                        message.reply({ embeds: [SimpleEmbed(`${gif['050']} not enough!`)] });
                        return;
                    }

                    const embed = customEmbed()
                        .setAuthor({ name: `${user.username}, you are about to give crate to ${mentionUser.username}`, iconURL: user.displayAvatarURL() })
                        .setColor('Aqua')
                        .setDescription(`To confirm this transaction, click ✅ Confirm.\nTo cancel this transaction, click ❎ Cancel.\n\n⚠️ It is against our rules to trade Hemiko for anything of monetary value. This includes real money, crypto, nitro, or anything similar. You will be banned for doing so.\n\n<@${user.id}> **Will give** <@${mentionUser.id}>:\n${sym3}${amount_item.toLocaleString()} Crate${sym3}`)
                        .setTimestamp();

                    const confirmButton = labelButton('confirm_button', '✅ Confirm', ButtonStyle.Success);
                    const cancelButton = labelButton('cancel_button', '❎ Cancel', ButtonStyle.Danger);
                    const allButtons = twoButton(confirmButton, cancelButton);

                    const messageEmbed = await message.channel.send({ embeds: [embed], components: [allButtons] });

                    const collector = getCollectionButton(messageEmbed, CDT);

                    collector.on('end', (collected, reason) => {
                        if (reason === 'time') {
                            confirmButton.setDisabled(true);
                            cancelButton.setDisabled(true);
                            messageEmbed.edit({ embeds: [embed.setColor('#3D3D3D')], components: [allButtons] });
                            return;
                        }
                    });

                    collector.on('collect', async (interaction) => {
                        if(interaction.member.user.id !== user.id){
                            await interaction.reply({ content: 'This button is not for you!', ephemeral: true });
                            return;
                        }

                        if(interaction.customId === 'confirm_button'){
                            try{
                                const userData = await getUser(user.id);
                                const targetData = await getUser(mentionUser.id);
                                userData.gem['100'] -= amount_item;
                                targetData.gem['100'] += amount_item;
                                
                                await Promise.all([
                                    targetData.save(),
                                    userData.save()
                                ]);
                            }catch(error){}

                            confirmButton.setDisabled(true);
                            cancelButton.setDisabled(true);

                            interaction.update({ embeds: [embed.setDescription(`This is **Transition** from ${user.username} to ${mentionUser.username} .\n\n✅ **Done**, It is against our rules to trade Hemiko for anything of monetary value. This includes real money, crypto, nitro, or anything similar. You will be banned for doing so.\n\n<@${user.id}> **Gave** <@${mentionUser.id}>:\n` + '```' + `fix\n${amount_item.toLocaleString()} Crate\n` + '```').setColor("Green")], components: [] });
                            collector.stop();
                        }

                        if (interaction.customId === 'cancel_button') {

                            confirmButton.setDisabled(true);
                            cancelButton.setDisabled(true);

                            interaction.update({ embeds: [embed.setDescription(`This is **Transition** from ${user.username} to ${mentionUser.username} .\n\n:x: **Cancel**, It is against our rules to trade Hemiko for anything of monetary value. This includes real money, crypto, nitro, or anything similar. You will be banned for doing so.\n\n<@${user.id}> **Stop** <@${mentionUser.id}>:\n${sym3}${amount_item.toLocaleString()} Crate${sym3}`).setColor("Red")], components: [] });
                            collector.stop();
                        }
                    });
            
                    return;
                }catch(error){}
            }

            if(item == 'lootbox'){
                try{
                    if(senderData.gem['050'] < amount_item || senderData.gem['050'] <= 0){
                        message.reply({ embeds: [SimpleEmbed(`${gif['050']} not enough!`)] });
                        return;
                    }

                    const embed = customEmbed()
                        .setAuthor({ name: `${user.username}, you are about to give lootbox to ${mentionUser.username}`, iconURL: user.displayAvatarURL() })
                        .setColor('Aqua')
                        .setDescription(`To confirm this transaction, click ✅ Confirm.\nTo cancel this transaction, click ❎ Cancel.\n\n⚠️ It is against our rules to trade Hemiko for anything of monetary value. This includes real money, crypto, nitro, or anything similar. You will be banned for doing so.\n\n<@${user.id}> **Will give** <@${mentionUser.id}>:\n${sym3}${amount_item.toLocaleString()} Lootbox${sym3}`)
                        .setTimestamp();

                    const confirmButton = labelButton('confirm_button', '✅ Confirm', ButtonStyle.Success);
                    const cancelButton = labelButton('cancel_button', '❎ Cancel', ButtonStyle.Danger);
                    const allButtons = twoButton(confirmButton, cancelButton);

                    const messageEmbed = await message.channel.send({ embeds: [embed], components: [allButtons] });

                    const collector = getCollectionButton(messageEmbed, CDT);

                    collector.on('end', (collected, reason) => {
                        if (reason === 'time') {
                            confirmButton.setDisabled(true);
                            cancelButton.setDisabled(true);
                            messageEmbed.edit({ embeds: [embed.setColor('#3D3D3D')], components: [allButtons] });
                            return;
                        }
                    });

                    collector.on('collect', async (interaction) => {
                        if(interaction.member.user.id !== user.id){
                            await interaction.reply({ content: 'This button is not for you!', ephemeral: true });
                            return;
                        }

                        if(interaction.customId === 'confirm_button'){
                            try{
                                const userData = await getUser(user.id);
                                const targetData = await getUser(mentionUser.id);
                                userData.gem['050'] -= amount_item;
                                targetData.gem['050'] += amount_item;
                                
                                await Promise.all([
                                    targetData.save(),
                                    userData.save()
                                ]);
                            }catch(error){}

                            confirmButton.setDisabled(true);
                            cancelButton.setDisabled(true);

                            interaction.update({ embeds: [embed.setDescription(`This is **Transition** from ${user.username} to ${mentionUser.username} .\n\n✅ **Done**, It is against our rules to trade Hemiko for anything of monetary value. This includes real money, crypto, nitro, or anything similar. You will be banned for doing so.\n\n<@${user.id}> **Gave** <@${mentionUser.id}>:\n` + '```' + `fix\n${amount_item.toLocaleString()} Lootbox\n` + '```').setColor("Green")], components: [] });
                            collector.stop();
                        }

                        if (interaction.customId === 'cancel_button') {

                            confirmButton.setDisabled(true);
                            cancelButton.setDisabled(true);

                            interaction.update({ embeds: [embed.setDescription(`This is **Transition** from ${user.username} to ${mentionUser.username} .\n\n:x: **Cancel**, It is against our rules to trade Hemiko for anything of monetary value. This includes real money, crypto, nitro, or anything similar. You will be banned for doing so.\n\n<@${user.id}> **Stop** <@${mentionUser.id}>:\n${sym3}${amount_item.toLocaleString()} Lootbox${sym3}`).setColor("Red")], components: [] });
                            collector.stop();
                        }
                    });
            
                    return;
                }catch(error){}
            }

            if(item == 'egg'){
                try{
                    if(senderData.egg.egg_amount < amount_item || senderData.egg.egg_amount <= 0){
                        message.reply({ embeds: [SimpleEmbed(`${gif.egg_gif} not enough!`)] });
                        return;
                    }

                    const embed = customEmbed()
                        .setAuthor({ name: `${user.username}, you are about to give egg to ${mentionUser.username}`, iconURL: user.displayAvatarURL() })
                        .setColor('Aqua')
                        .setDescription(`To confirm this transaction, click ✅ Confirm.\nTo cancel this transaction, click ❎ Cancel.\n\n⚠️ It is against our rules to trade Hemiko for anything of monetary value. This includes real money, crypto, nitro, or anything similar. You will be banned for doing so.\n\n<@${user.id}> **Will give** <@${mentionUser.id}>:\n${sym3}${amount_item.toLocaleString()} Egg${sym3}`)
                        .setTimestamp();

                    const confirmButton = labelButton('confirm_button', '✅ Confirm', ButtonStyle.Success);
                    const cancelButton = labelButton('cancel_button', '❎ Cancel', ButtonStyle.Danger);
                    const allButtons = twoButton(confirmButton, cancelButton);

                    const messageEmbed = await message.channel.send({ embeds: [embed], components: [allButtons] });

                    const collector = getCollectionButton(messageEmbed, CDT);

                    collector.on('end', (collected, reason) => {
                        if (reason === 'time') {
                            confirmButton.setDisabled(true);
                            cancelButton.setDisabled(true);
                            messageEmbed.edit({ embeds: [embed.setColor('#3D3D3D')], components: [allButtons] });
                            return;
                        }
                    });

                    collector.on('collect', async (interaction) => {
                        if(interaction.member.user.id !== user.id){
                            await interaction.reply({ content: 'This button is not for you!', ephemeral: true });
                            return;
                        }

                        if(interaction.customId === 'confirm_button'){
                            try{
                                const userData = await getUser(user.id);
                                const targetData = await getUser(mentionUser.id);
                                userData.farm.egg.egg_amount -= amount_item;
                                targetData.farm.egg.egg_amount += amount_item;
                                
                                await Promise.all([
                                    targetData.save(),
                                    userData.save()
                                ]);
                            }catch(error){}

                            confirmButton.setDisabled(true);
                            cancelButton.setDisabled(true);

                            interaction.update({ embeds: [embed.setDescription(`This is **Transition** from ${user.username} to ${mentionUser.username} .\n\n✅ **Done**, It is against our rules to trade Hemiko for anything of monetary value. This includes real money, crypto, nitro, or anything similar. You will be banned for doing so.\n\n<@${user.id}> **Gave** <@${mentionUser.id}>:\n` + '```' + `fix\n${amount_item.toLocaleString()} Egg\n` + '```').setColor("Green")], components: [] });
                            collector.stop();
                        }

                        if (interaction.customId === 'cancel_button') {

                            confirmButton.setDisabled(true);
                            cancelButton.setDisabled(true);

                            interaction.update({ embeds: [embed.setDescription(`This is **Transition** from ${user.username} to ${mentionUser.username} .\n\n:x: **Cancel**, It is against our rules to trade Hemiko for anything of monetary value. This includes real money, crypto, nitro, or anything similar. You will be banned for doing so.\n\n<@${user.id}> **Stop** <@${mentionUser.id}>:\n${sym3}${amount_item.toLocaleString()} Egg${sym3}`).setColor("Red")], components: [] });
                            collector.stop();
                        }
                    });
            
                    return; 
                }catch(error){}
            }

            if(item == 'addpercen'){
                try{
                    if(senderData.tools.addPercen_amount < amount_item || senderData.tools.addPercen_amount <= 0){
                        message.reply({ embeds: [SimpleEmbed(`${gif.addPercen_gif} not enough!`)] });
                        return;
                    }

                    const embed = customEmbed()
                        .setAuthor({ name: `${user.username}, you are about to give addpercen to ${mentionUser.username}`, iconURL: user.displayAvatarURL() })
                        .setColor('Aqua')
                        .setDescription(`To confirm this transaction, click ✅ Confirm.\nTo cancel this transaction, click ❎ Cancel.\n\n⚠️ It is against our rules to trade Hemiko for anything of monetary value. This includes real money, crypto, nitro, or anything similar. You will be banned for doing so.\n\n<@${user.id}> **Will give** <@${mentionUser.id}>:\n${sym3}${amount_item.toLocaleString()} Addpercen${sym3}`)
                        .setTimestamp();

                    const confirmButton = labelButton('confirm_button', '✅ Confirm', ButtonStyle.Success);
                    const cancelButton = labelButton('cancel_button', '❎ Cancel', ButtonStyle.Danger);
                    const allButtons = twoButton(confirmButton, cancelButton);

                    const messageEmbed = await message.channel.send({ embeds: [embed], components: [allButtons] });

                    const collector = getCollectionButton(messageEmbed, CDT);

                    collector.on('end', (collected, reason) => {
                        if (reason === 'time') {
                            confirmButton.setDisabled(true);
                            cancelButton.setDisabled(true);
                            messageEmbed.edit({ embeds: [embed.setColor('#3D3D3D')], components: [allButtons] });
                            return;
                        }
                    });

                    collector.on('collect', async (interaction) => {
                        if(interaction.member.user.id !== user.id){
                            await interaction.reply({ content: 'This button is not for you!', ephemeral: true });
                            return;
                        }

                        if(interaction.customId === 'confirm_button'){
                            try{
                                const userData = await getUser(user.id);
                                const targetData = await getUser(mentionUser.id);
                                userData.tools.addPercen_amount -= amount_item;
                                targetData.tools.addPercen_amount += amount_item;
                                
                                await Promise.all([
                                    targetData.save(),
                                    userData.save()
                                ]);
                            }catch(error){}

                            confirmButton.setDisabled(true);
                            cancelButton.setDisabled(true);

                            interaction.update({ embeds: [embed.setDescription(`This is **Transition** from ${user.username} to ${mentionUser.username} .\n\n✅ **Done**, It is against our rules to trade Hemiko for anything of monetary value. This includes real money, crypto, nitro, or anything similar. You will be banned for doing so.\n\n<@${user.id}> **Gave** <@${mentionUser.id}>:\n` + '```' + `fix\n${amount_item.toLocaleString()} Addpercen\n` + '```').setColor("Green")], components: [] });
                            collector.stop();
                        }

                        if (interaction.customId === 'cancel_button') {

                            confirmButton.setDisabled(true);
                            cancelButton.setDisabled(true);

                            interaction.update({ embeds: [embed.setDescription(`This is **Transition** from ${user.username} to ${mentionUser.username} .\n\n:x: **Cancel**, It is against our rules to trade Hemiko for anything of monetary value. This includes real money, crypto, nitro, or anything similar. You will be banned for doing so.\n\n<@${user.id}> **Stop** <@${mentionUser.id}>:\n${sym3}${amount_item.toLocaleString()} Addpercen${sym3}`).setColor("Red")], components: [] });
                            collector.stop();
                        }
                    });
            
                    return; 
                }catch(error){}
            }
        
            if(item == 'addrate'){
                try{
                    if(senderData.tools.addRate_amount < amount_item || senderData.tools.addRate_amount == 0){
                        message.reply({ embeds: [SimpleEmbed(`${gif.addRate_gif} not enough!`)] });
                        return;
                    }

                    const embed = customEmbed()
                        .setAuthor({ name: `${user.username}, you are about to give addrate to ${mentionUser.username}`, iconURL: user.displayAvatarURL() })
                        .setColor('Aqua')
                        .setDescription(`To confirm this transaction, click ✅ Confirm.\nTo cancel this transaction, click ❎ Cancel.\n\n⚠️ It is against our rules to trade Hemiko for anything of monetary value. This includes real money, crypto, nitro, or anything similar. You will be banned for doing so.\n\n<@${user.id}> **Will give** <@${mentionUser.id}>:\n${sym3}${amount_item.toLocaleString()} Addrate${sym3}`)
                        .setTimestamp();

                    const confirmButton = labelButton('confirm_button', '✅ Confirm', ButtonStyle.Success);
                    const cancelButton = labelButton('cancel_button', '❎ Cancel', ButtonStyle.Danger);
                    const allButtons = twoButton(confirmButton, cancelButton);

                    const messageEmbed = await message.channel.send({ embeds: [embed], components: [allButtons] });

                    const collector = getCollectionButton(messageEmbed, CDT);

                    collector.on('end', (collected, reason) => {
                        if (reason === 'time') {
                            confirmButton.setDisabled(true);
                            cancelButton.setDisabled(true);
                            messageEmbed.edit({ embeds: [embed.setColor('#3D3D3D')], components: [allButtons] });
                            return;
                        }
                    });

                    collector.on('collect', async (interaction) => {
                        if(interaction.member.user.id !== user.id){
                            await interaction.reply({ content: 'This button is not for you!', ephemeral: true });
                            return;
                        }

                        if(interaction.customId === 'confirm_button'){
                            try{
                                const userData = await getUser(user.id);
                                const targetData = await getUser(mentionUser.id);
                                userData.tools.addRate_amount -= amount_item;
                                targetData.tools.addRate_amount += amount_item;
                                
                                await Promise.all([
                                    targetData.save(),
                                    userData.save()
                                ]);
                            }catch(error){}

                            confirmButton.setDisabled(true);
                            cancelButton.setDisabled(true);

                            interaction.update({ embeds: [embed.setDescription(`This is **Transition** from ${user.username} to ${mentionUser.username} .\n\n✅ **Done**, It is against our rules to trade Hemiko for anything of monetary value. This includes real money, crypto, nitro, or anything similar. You will be banned for doing so.\n\n<@${user.id}> **Gave** <@${mentionUser.id}>:\n` + '```' + `fix\n${amount_item.toLocaleString()} Addrate\n` + '```').setColor("Green")], components: [] });
                            collector.stop();
                        }

                        if (interaction.customId === 'cancel_button') {

                            confirmButton.setDisabled(true);
                            cancelButton.setDisabled(true);

                            interaction.update({ embeds: [embed.setDescription(`This is **Transition** from ${user.username} to ${mentionUser.username} .\n\n:x: **Cancel**, It is against our rules to trade Hemiko for anything of monetary value. This includes real money, crypto, nitro, or anything similar. You will be banned for doing so.\n\n<@${user.id}> **Stop** <@${mentionUser.id}>:\n${sym3}${amount_item.toLocaleString()} Addrate${sym3}`).setColor("Red")], components: [] });
                            collector.stop();
                        }
                    });
            
                    return;
                }catch(error){}
            }
        
            if(item == 'adddouble'){
                try{
                    if(senderData.tools.addDouble_amount < amount_item || senderData.tools.addDouble_amount <= 0){
                        message.reply({ embeds: [SimpleEmbed(`${gif.addDouble_gif} not enough!`)] });
                        return;
                    }

                    const embed = customEmbed()
                        .setAuthor({ name: `${user.username}, you are about to give adddouble to ${mentionUser.username}`, iconURL: user.displayAvatarURL() })
                        .setColor('Aqua')
                        .setDescription(`To confirm this transaction, click ✅ Confirm.\nTo cancel this transaction, click ❎ Cancel.\n\n⚠️ It is against our rules to trade Hemiko for anything of monetary value. This includes real money, crypto, nitro, or anything similar. You will be banned for doing so.\n\n<@${user.id}> **Will give** <@${mentionUser.id}>:\n${sym3}${amount_item.toLocaleString()} Adddouble${sym3}`)
                        .setTimestamp();

                    const confirmButton = labelButton('confirm_button', '✅ Confirm', ButtonStyle.Success);
                    const cancelButton = labelButton('cancel_button', '❎ Cancel', ButtonStyle.Danger);
                    const allButtons = twoButton(confirmButton, cancelButton);

                    const messageEmbed = await message.channel.send({ embeds: [embed], components: [allButtons] });

                    const collector = getCollectionButton(messageEmbed, CDT);

                    collector.on('end', (collected, reason) => {
                        if (reason === 'time') {
                            confirmButton.setDisabled(true);
                            cancelButton.setDisabled(true);
                            messageEmbed.edit({ embeds: [embed.setColor('#3D3D3D')], components: [allButtons] });
                            return;
                        }
                    });

                    collector.on('collect', async (interaction) => {
                        if(interaction.member.user.id !== user.id){
                            await interaction.reply({ content: 'This button is not for you!', ephemeral: true });
                            return;
                        }

                        if(interaction.customId === 'confirm_button'){
                            try{
                                const userData = await getUser(user.id);
                                const targetData = await getUser(mentionUser.id);
                                userData.tools.addDouble_amount -= amount_item;
                                targetData.tools.addDouble_amount += amount_item;
                                
                                await Promise.all([
                                    targetData.save(),
                                    userData.save()
                                ]);
                            }catch(error){}

                            confirmButton.setDisabled(true);
                            cancelButton.setDisabled(true);

                            interaction.update({ embeds: [embed.setDescription(`This is **Transition** from ${user.username} to ${mentionUser.username} .\n\n✅ **Done**, It is against our rules to trade Hemiko for anything of monetary value. This includes real money, crypto, nitro, or anything similar. You will be banned for doing so.\n\n<@${user.id}> **Gave** <@${mentionUser.id}>:\n` + '```' + `fix\n${amount_item.toLocaleString()} Adddouble\n` + '```').setColor("Green")], components: [] });
                            collector.stop();
                        }

                        if (interaction.customId === 'cancel_button') {

                            confirmButton.setDisabled(true);
                            cancelButton.setDisabled(true);

                            interaction.update({ embeds: [embed.setDescription(`This is **Transition** from ${user.username} to ${mentionUser.username} .\n\n:x: **Cancel**, It is against our rules to trade Hemiko for anything of monetary value. This includes real money, crypto, nitro, or anything similar. You will be banned for doing so.\n\n<@${user.id}> **Stop** <@${mentionUser.id}>:\n${sym3}${amount_item.toLocaleString()} Adddouble${sym3}`).setColor("Red")], components: [] });
                            collector.stop();
                        }
                    });
            
                    return;
                }catch(error){}
            }
        
            if(item == 'box'){
                try{
                    if(senderData.inventory.box < amount_item || senderData.inventory.box == 0){
                        message.reply({ embeds: [SimpleEmbed(`${gif.box_gif} not enough!`)] });
                        return;
                    }

                    const embed = customEmbed()
                        .setAuthor({ name: `${user.username}, you are about to give box to ${mentionUser.username}`, iconURL: user.displayAvatarURL() })
                        .setColor('Aqua')
                        .setDescription(`To confirm this transaction, click ✅ Confirm.\nTo cancel this transaction, click ❎ Cancel.\n\n⚠️ It is against our rules to trade Hemiko for anything of monetary value. This includes real money, crypto, nitro, or anything similar. You will be banned for doing so.\n\n<@${user.id}> **Will give** <@${mentionUser.id}>:\n${sym3}${amount_item.toLocaleString()} Box${sym3}`)
                        .setTimestamp();

                    const confirmButton = labelButton('confirm_button', '✅ Confirm', ButtonStyle.Success);
                    const cancelButton = labelButton('cancel_button', '❎ Cancel', ButtonStyle.Danger);
                    const allButtons = twoButton(confirmButton, cancelButton);

                    const messageEmbed = await message.channel.send({ embeds: [embed], components: [allButtons] });

                    const collector = getCollectionButton(messageEmbed, CDT);

                    collector.on('end', (collected, reason) => {
                        if (reason === 'time') {
                            confirmButton.setDisabled(true);
                            cancelButton.setDisabled(true);
                            messageEmbed.edit({ embeds: [embed.setColor('#3D3D3D')], components: [allButtons] });
                            return;
                        }
                    });

                    collector.on('collect', async (interaction) => {
                        if(interaction.member.user.id !== user.id){
                            await interaction.reply({ content: 'This button is not for you!', ephemeral: true });
                            return;
                        }

                        if(interaction.customId === 'confirm_button'){
                            try{
                                const userData = await getUser(user.id);
                                const targetData = await getUser(mentionUser.id);
                                userData.inventory.box -= amount_item;
                                targetData.inventory.box += amount_item;
                                
                                await Promise.all([
                                    targetData.save(),
                                    userData.save()
                                ]);
                            }catch(error){}

                            confirmButton.setDisabled(true);
                            cancelButton.setDisabled(true);

                            interaction.update({ embeds: [embed.setDescription(`This is **Transition** from ${user.username} to ${mentionUser.username} .\n\n✅ **Done**, It is against our rules to trade Hemiko for anything of monetary value. This includes real money, crypto, nitro, or anything similar. You will be banned for doing so.\n\n<@${user.id}> **Gave** <@${mentionUser.id}>:\n` + '```' + `fix\n${amount_item.toLocaleString()} Box\n` + '```').setColor("Green")], components: [] });
                            collector.stop();
                        }

                        if (interaction.customId === 'cancel_button') {

                            confirmButton.setDisabled(true);
                            cancelButton.setDisabled(true);

                            interaction.update({ embeds: [embed.setDescription(`This is **Transition** from ${user.username} to ${mentionUser.username} .\n\n:x: **Cancel**, It is against our rules to trade Hemiko for anything of monetary value. This includes real money, crypto, nitro, or anything similar. You will be banned for doing so.\n\n<@${user.id}> **Stop** <@${mentionUser.id}>:\n${sym3}${amount_item.toLocaleString()} Box${sym3}`).setColor("Red")], components: [] });
                            collector.stop();
                        }
                    });
            
                    return;
                }catch(error){}
            }
        
            if(item == 'fire'){
                try{
                    if(senderData.tools.fire_amount < amount_item || senderData.tools.fire_amount <= 0){
                        message.reply({ embeds: [SimpleEmbed(`${gif.fire_gif} not enough!`)] });
                        return;
                    }

                    const embed = customEmbed()
                        .setAuthor({ name: `${user.username}, you are about to give fire to ${mentionUser.username}`, iconURL: user.displayAvatarURL() })
                        .setColor('Aqua')
                        .setDescription(`To confirm this transaction, click ✅ Confirm.\nTo cancel this transaction, click ❎ Cancel.\n\n⚠️ It is against our rules to trade Hemiko for anything of monetary value. This includes real money, crypto, nitro, or anything similar. You will be banned for doing so.\n\n<@${user.id}> **Will give** <@${mentionUser.id}>:\n${sym3}${amount_item.toLocaleString()} Fire${sym3}`)
                        .setTimestamp();

                    const confirmButton = labelButton('confirm_button', '✅ Confirm', ButtonStyle.Success);
                    const cancelButton = labelButton('cancel_button', '❎ Cancel', ButtonStyle.Danger);
                    const allButtons = twoButton(confirmButton, cancelButton);

                    const messageEmbed = await message.channel.send({ embeds: [embed], components: [allButtons] });

                    const collector = getCollectionButton(messageEmbed, CDT);

                    collector.on('end', (collected, reason) => {
                        if (reason === 'time') {
                            confirmButton.setDisabled(true);
                            cancelButton.setDisabled(true);
                            messageEmbed.edit({ embeds: [embed.setColor('#3D3D3D')], components: [allButtons] });
                            return;
                        }
                    });

                    collector.on('collect', async (interaction) => {
                        if(interaction.member.user.id !== user.id){
                            await interaction.reply({ content: 'This button is not for you!', ephemeral: true });
                            return;
                        }

                        if(interaction.customId === 'confirm_button'){
                            try{
                                const userData = await getUser(user.id);
                                const targetData = await getUser(mentionUser.id);
                                userData.tools.fire_amount -= amount_item;
                                targetData.tools.fire_amount += amount_item;
                                
                                await Promise.all([
                                    targetData.save(),
                                    userData.save()
                                ]);
                            }catch(error){}

                            confirmButton.setDisabled(true);
                            cancelButton.setDisabled(true);

                            interaction.update({ embeds: [embed.setDescription(`This is **Transition** from ${user.username} to ${mentionUser.username} .\n\n✅ **Done**, It is against our rules to trade Hemiko for anything of monetary value. This includes real money, crypto, nitro, or anything similar. You will be banned for doing so.\n\n<@${user.id}> **Gave** <@${mentionUser.id}>:\n` + '```' + `fix\n${amount_item.toLocaleString()} Fire\n` + '```').setColor("Green")], components: [] });
                            collector.stop();
                        }

                        if (interaction.customId === 'cancel_button') {

                            confirmButton.setDisabled(true);
                            cancelButton.setDisabled(true);

                            interaction.update({ embeds: [embed.setDescription(`This is **Transition** from ${user.username} to ${mentionUser.username} .\n\n:x: **Cancel**, It is against our rules to trade Hemiko for anything of monetary value. This includes real money, crypto, nitro, or anything similar. You will be banned for doing so.\n\n<@${user.id}> **Stop** <@${mentionUser.id}>:\n${sym3}${amount_item.toLocaleString()} Fire${sym3}`).setColor("Red")], components: [] });
                            collector.stop();
                        }
                    });
            
                    return;
                }catch(error){}
            }
        
            if(item == 'zaz'){
                try{
                    if(senderData.tools.zaz_amount < amount_item || senderData.tools.zaz_amount <= 0){
                        message.reply({ embeds: [SimpleEmbed(`${gif.zaz_gif} not enough!`)] });
                        return;
                    }

                    const embed = customEmbed()
                        .setAuthor({ name: `${user.username}, you are about to give zaz to ${mentionUser.username}`, iconURL: user.displayAvatarURL() })
                        .setColor('Aqua')
                        .setDescription(`To confirm this transaction, click ✅ Confirm.\nTo cancel this transaction, click ❎ Cancel.\n\n⚠️ It is against our rules to trade Hemiko for anything of monetary value. This includes real money, crypto, nitro, or anything similar. You will be banned for doing so.\n\n<@${user.id}> **Will give** <@${mentionUser.id}>:\n${sym3}${amount_item.toLocaleString()} Zaz${sym3}`)
                        .setTimestamp();

                    const confirmButton = labelButton('confirm_button', '✅ Confirm', ButtonStyle.Success);
                    const cancelButton = labelButton('cancel_button', '❎ Cancel', ButtonStyle.Danger);
                    const allButtons = twoButton(confirmButton, cancelButton);

                    const messageEmbed = await message.channel.send({ embeds: [embed], components: [allButtons] });

                    const collector = getCollectionButton(messageEmbed, CDT);

                    collector.on('end', (collected, reason) => {
                        if (reason === 'time') {
                            confirmButton.setDisabled(true);
                            cancelButton.setDisabled(true);
                            messageEmbed.edit({ embeds: [embed.setColor('#3D3D3D')], components: [allButtons] });
                            return;
                        }
                    });

                    collector.on('collect', async (interaction) => {
                        if(interaction.member.user.id !== user.id){
                            await interaction.reply({ content: 'This button is not for you!', ephemeral: true });
                            return;
                        }

                        if(interaction.customId === 'confirm_button'){
                            try{
                                const userData = await getUser(user.id);
                                const targetData = await getUser(mentionUser.id);
                                userData.tools.zaz_amount -= amount_item;
                                targetData.tools.zaz_amount += amount_item;
                                
                                await Promise.all([
                                    targetData.save(),
                                    userData.save()
                                ]);
                            }catch(error){}

                            confirmButton.setDisabled(true);
                            cancelButton.setDisabled(true);

                            interaction.update({ embeds: [embed.setDescription(`This is **Transition** from ${user.username} to ${mentionUser.username} .\n\n✅ **Done**, It is against our rules to trade Hemiko for anything of monetary value. This includes real money, crypto, nitro, or anything similar. You will be banned for doing so.\n\n<@${user.id}> **Gave** <@${mentionUser.id}>:\n` + '```' + `fix\n${amount_item.toLocaleString()} Zaz\n` + '```').setColor("Green")], components: [] });
                            collector.stop();
                        }

                        if (interaction.customId === 'cancel_button') {

                            confirmButton.setDisabled(true);
                            cancelButton.setDisabled(true);

                            interaction.update({ embeds: [embed.setDescription(`This is **Transition** from ${user.username} to ${mentionUser.username} .\n\n:x: **Cancel**, It is against our rules to trade Hemiko for anything of monetary value. This includes real money, crypto, nitro, or anything similar. You will be banned for doing so.\n\n<@${user.id}> **Stop** <@${mentionUser.id}>:\n${sym3}${amount_item.toLocaleString()} Zaz${sym3}`).setColor("Red")], components: [] });
                            collector.stop();
                        }
                    });
        
                    return;
                }catch(error){}
            }
        }catch(error){
            console.log(`transfer error ${error}`);
        }
    },
};