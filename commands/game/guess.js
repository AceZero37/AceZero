const { ButtonStyle } = require('discord.js');
const { SimpleEmbed, cooldown, getUser, sleep, getRandomInt, labelButton, twoButton, getCollectionButton, customEmbed, gif, sym } = require('../../functioon/function');

const cooldowns = new Map();
let CDT = 60_000;
var getId = [];
var cdId = [];
var prem = [];

module.exports = {
    name: 'guess',
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

            const ChID = message.channelId;
            const mensions = message.mentions.users.first();
            let targetUser;

            if(mensions){
                targetUser = await getUser(mensions.id);
                if(!targetUser){
                    return;
                }
            }else{
                message.reply({ embeds: [SimpleEmbed(`<@${user.id}> mensions someone`)] });
                return;
            }

            userData.levelSystem.xp += 5;

            const Min = getRandomInt(1, 11);
            const Max = getRandomInt(20, 101);

            const number = getRandomInt(Min, Max);

            const channel = client.channels.cache.get(ChID);

            const embed = customEmbed()
                .setAuthor({ name: `${user.displayName}`, iconURL: user.displayAvatarURL() })
                .setDescription(`<@${mensions.id}> can you guess Number? with\nhost: <@${user.id}>`)

            const accept = labelButton('accept', 'Accept', ButtonStyle.Primary);    
            const cancel = labelButton('cancel', 'Cancel', ButtonStyle.Danger)
            
            const ButtonRow = twoButton(accept, cancel);

            const rq = await message.channel.send({ embeds: [embed], components: [ButtonRow] });

            const start = getCollectionButton(rq, 120_000);

            let win = false;
            let afk = true;
            let end = false;

            start.on('end', () =>{
                end = true;
                if(afk){
                    rq.edit({ embeds: [embed], components: [] });
                    start.stop();
                    return;
                }
                if(!win){
                    rq.edit({ embeds: [SimpleEmbed(`**${mensions.displayName}**: **START** Guess Hin: 🔢 Min: **${Min}**, Max: **${Max}**\nYou run out of time!`)] });
                    start.stop();
                    return;
                }else{
                    start.stop();
                    return;
                }
            });

            start.on('collect', async (interaction) =>{
                afk = false;
                const targetID = mensions.id;
                if(interaction.member.user.id == targetID || interaction.member.user.id == user.id){
                    if(interaction.customId == 'cancel'){
                        rq.edit({ embeds: [SimpleEmbed(`this cancel by <@${interaction.member.user.id}>`)], components: [] });
                        win = true;
                        start.stop();
                        return;
                    }
                    if(interaction.customId == 'accept' && interaction.member.user.id == targetID){
                        rq.edit({ embeds: [SimpleEmbed(`**Guess START**`)], components: [] });
                        await sleep(2000);
                        try{
                            const hostUser = client.users.cache.get(user.id);
                            if(hostUser){
                                await hostUser.send(`**You're Host Guess Number**\n**${user.displayName}**: Here is the Number: **__${number}__**!!`);
                            }
                        }catch(error){}

                        let chan = 5;
                        rq.edit({ embeds: [SimpleEmbed(`<@${mensions.id}> **START** Guess Hin: 🔢 Min: **${Min}**, Max: **${Max}**\nYour chan: **${chan}**`)] });
                        await rq.react('💝');
                        await rq.react('💖');
                        await rq.react('💗');
                        await rq.react('💓');
                        await rq.react('💞');
                        await rq.react('💟');

                        const collector = channel.createMessageCollector({});

                        collector.on('collect', async (mgss) =>{
                            if(end){
                                collector.stop();
                                return;
                            }

                            if(mgss.author.id == mensions.id){
                                chan -= 1;
                    
                                let a = parseInt(mgss.content);
                                if(a == number){
                                    win = true;
                                    rq.edit({ embeds: [SimpleEmbed(`<@${mensions.id}> **START** Guess Hin: 🔢 Min: **${Min}**, Max: **${Max}**\nYou **WIN** Correct Number is: **${number}**`)] });
                                    start.stop();
                                    collector.stop(); 
                                    return;
                                }
                                if(isNaN(a)){
                                    rq.edit({ embeds: [SimpleEmbed(`<@${mensions.id}> **START** Guess Hin: 🔢 Min: **${Min}**, Max: **${Max}**\nYour chan: **${chan}**`)] });
                                }else if(a > number){
                                    rq.edit({ embeds: [SimpleEmbed(`<@${mensions.id}> **START** Guess Hin: 🔢 Min: **${Min}**, Max: **${Max}**\nYour chan: **${chan}** Low then that!!!`)] });
                                }else{
                                    rq.edit({ embeds: [SimpleEmbed(`<@${mensions.id}> **START** Guess Hin: 🔢 Min: **${Min}**, Max: **${Max}**\nYour chan: **${chan}** High then that!!!`)] });
                                }
                                if(chan == 0){
                                    win = true;
                                    rq.edit({ embeds: [SimpleEmbed(`<@${mensions.id}> **START** Guess Hin: 🔢 Min: **${Min}**, Max: **${Max}**\nYou **lose** Correct Number is: **${number}**`)] });
                                    start.stop();
                                    collector.stop(); 
                                    return;
                                }
                            }
                        });
                    }else{
                        interaction.reply({  content: 'this button not for you', ephemeral: true});
                        return;
                    }

                }else{
                    interaction.reply({ content: 'this button not for you', ephemeral: true});
                    return;
                }
            });
            return;
        }catch(error){
            console.log(`guess error ${error}`);
        }
    },
};