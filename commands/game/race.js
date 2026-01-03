const { ButtonStyle } = require('discord.js');
const { customEmbed, cooldown, getRandomInt, sleep, gif, labelButton, emojiButton, getCollectionButton, fiveButton, SimpleEmbed, sym, getUser } = require('../../functioon/function');

const cooldowns = new Map();
let CDT = 60_000;
var getId = [];
var cdId = [];
var prem = [];

module.exports = {
    name: 'race',
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

            const hoster = await user.id;

            let horse_one;
            let horse_two;
            let horse_three;

            const HR1 = getRandomInt(1, 4);
            const HR2 = getRandomInt(1, 4);
            const HR3 = getRandomInt(1, 4);

            if(HR1 == 1){
                horse_one = gif.horse1;
            }else if(HR1 == 2){
                horse_one = gif.horse2;
            }else if(HR1 == 3){
                horse_one = gif.horse3;
            }

            if(HR2 == 1){
                horse_two = gif.horse4;
            }else if(HR2 == 2){
                horse_two = gif.horse5;
            }else if(HR2 == 3){
                horse_two = gif.horse6;
            }

            if(HR3 == 1){
                horse_three = gif.horse7;
            }else if(HR3 == 2){
                horse_three = gif.horse8;
            }else if(HR3 == 3){
                horse_three = gif.horse9;
            }

            let player1 = '**FREE**';
            let id1;
            let sat1 = '';

            let player2 = '**FREE**';
            let id2;
            let sat2 = '';

            let player3 = '**FREE**';
            let id3;
            let sat3 = '';

            const embed = customEmbed()
                .setAuthor({ name: `${user.displayName}`, iconURL: user.displayAvatarURL() })
                .setColor('Blue')
                .addFields(
                    { name: `Horse 1`, value: `[${horse_one}]\n${player1}`, inline: true },
                    { name: `Horse 2`, value: `[${horse_two}]\n${player2}`, inline: true },
                    { name: `Horse 3`, value: `[${horse_three}]\n${player3}`, inline: true },
                )
                .setImage(gif.race_banner)
                .setTimestamp()

            const animal_one = emojiButton('rutr', horse_one, ButtonStyle.Success)
            const animal_two = emojiButton('fegar', horse_two, ButtonStyle.Success)
            const animal_three = emojiButton('nicy', horse_three, ButtonStyle.Success)
            const start = labelButton('start', 'START', ButtonStyle.Primary)
            const cancel = labelButton('cancel', 'Cancel', ButtonStyle.Danger)
            
            const row = fiveButton(animal_one, animal_two, animal_three, start, cancel)
            
            let a = await message.channel.send({ embeds: [embed], components: [row] });

            const collector = getCollectionButton(a, 120_000)

            let afk = true;
            let win = false;

            collector.on('end', () =>{
                if(afk){
                    a.edit({ embeds: [embed], components: [] });
                    collector.stop();
                    return;
                }
                if(!win && !afk){
                    a.edit({ embeds: [SimpleEmbed(`**${user.displayName}**: Race animal Run out of time`)], components: [] });
                    collector.stop();
                    return;
                }
            });

            /////////////////////////////////////////////////////////////////////////////////////////////////////////// || START
            collector.on('collect', async(interaction)=>{
                if(user.bot) return;

                if(interaction.customId == 'rutr'){
                    if(interaction.member.user.id == id1 || interaction.member.user.id == id2 || interaction.member.user.id == id3){
                        await interaction.reply({ content: 'You are already selected animal', ephemeral: true });
                        return;
                    }
                    afk = false;
                    if(player1 == '**FREE**'){
                        id1 = await interaction.member.user.id;
                        player1 = `<@${id1}>`;
                        sat1 = 'rutr';
                        
                        animal_one.setDisabled(true);
                        const picked = customEmbed()
                        .setAuthor({ name: `${user.displayName}`, iconURL: user.displayAvatarURL() })
                        .setColor('Blue')
                        .addFields(
                            { name: `Horse 1`, value: `[${horse_one}]\n${player1}`, inline: true },
                            { name: `Horse 2`, value: `[${horse_two}]\n${player2}`, inline: true },
                            { name: `Horse 3`, value: `[${horse_three}]\n${player3}`, inline: true },
                        )
                        .setImage(gif.race_banner)
                        .setTimestamp()
                        await interaction.update({ embeds: [picked], components: [row] });
                        return;

                    }else if(player2 == '**FREE**'){
                        id1 = await interaction.member.user.id;
                        player1 = `<@${id1}>`;
                        sat1 = 'rutr';

                        animal_one.setDisabled(true);
                        const picked = customEmbed()
                        .setAuthor({ name: `${user.displayName}`, iconURL: user.displayAvatarURL() })
                        .setColor('Blue')
                        .addFields(
                            { name: `Horse 1`, value: `[${horse_one}]\n${player1}`, inline: true },
                            { name: `Horse 2`, value: `[${horse_two}]\n${player2}`, inline: true },
                            { name: `Horse 3`, value: `[${horse_three}]\n${player3}`, inline: true },
                        )
                        .setImage(gif.race_banner)
                        .setTimestamp()
                        await interaction.update({ embeds: [picked], components: [row] });
                        return;
            
                    }else if(player3 == '**FREE**'){
                        id1 = await interaction.member.user.id;
                        player1 = `<@${id1}>`;
                        sat1 = 'rutr';

                        animal_one.setDisabled(true);
                        const picked = customEmbed()
                        .setAuthor({ name: `${user.displayName}`, iconURL: user.displayAvatarURL() })
                        .setColor('Blue')
                        .addFields(
                            { name: `Horse 1`, value: `[${horse_one}]\n${player1}`, inline: true },
                            { name: `Horse 2`, value: `[${horse_two}]\n${player2}`, inline: true },
                            { name: `Horse 3`, value: `[${horse_three}]\n${player3}`, inline: true },
                        )
                        .setImage(gif.race_banner)
                        .setTimestamp()
                        await interaction.update({ embeds: [picked], components: [row] });
                        return;
                        
                    }else{
                        await interaction.reply({ content: 'Full player', ephemeral: true });
                        return;
                    }
                }

                if(interaction.customId == 'fegar'){
                    if(interaction.member.user.id == id1 || interaction.member.user.id == id2 || interaction.member.user.id == id3){
                        await interaction.reply({ content: 'You are already selected animal', ephemeral: true });
                        return;
                    }
                    afk = false;
                    if(player1 == '**FREE**'){
                        id2 = await interaction.member.user.id;
                        player2 = `<@${id2}>`;
                        sat2 = 'fegar';

                        animal_two.setDisabled(true);
                        const picked = customEmbed()
                        .setAuthor({ name: `${user.displayName}`, iconURL: user.displayAvatarURL() })
                        .setColor('Blue')
                        .addFields(
                            { name: `Horse 1`, value: `[${horse_one}]\n${player1}`, inline: true },
                            { name: `Horse 2`, value: `[${horse_two}]\n${player2}`, inline: true },
                            { name: `Horse 3`, value: `[${horse_three}]\n${player3}`, inline: true },
                        )
                        .setImage(gif.race_banner)
                        .setTimestamp()
                        await interaction.update({ embeds: [picked], components: [row] });
                        return;

                    }else if(player2 == '**FREE**'){
                        id2 = await interaction.member.user.id;
                        player2 = `<@${id2}>`;
                        sat2 = 'fegar';

                        animal_two.setDisabled(true);
                        const picked = customEmbed()
                        .setAuthor({ name: `${user.displayName}`, iconURL: user.displayAvatarURL() })
                        .setColor('Blue')
                        .addFields(
                            { name: `Horse 1`, value: `[${horse_one}]\n${player1}`, inline: true },
                            { name: `Horse 2`, value: `[${horse_two}]\n${player2}`, inline: true },
                            { name: `Horse 3`, value: `[${horse_three}]\n${player3}`, inline: true },
                        )
                        .setImage(gif.race_banner)
                        .setTimestamp()
                        await interaction.update({ embeds: [picked], components: [row] });
                        return;
            
                    }else if(player3 == '**FREE**'){
                        id2 = await interaction.member.user.id;
                        player2 = `<@${id2}>`;
                        sat2 = 'fegar';

                        animal_two.setDisabled(true);
                        const picked = customEmbed()
                        .setAuthor({ name: `${user.displayName}`, iconURL: user.displayAvatarURL() })
                        .setColor('Blue')
                        .addFields(
                            { name: `Horse 1`, value: `[${horse_one}]\n${player1}`, inline: true },
                            { name: `Horse 2`, value: `[${horse_two}]\n${player2}`, inline: true },
                            { name: `Horse 3`, value: `[${horse_three}]\n${player3}`, inline: true },
                        )
                        .setImage(gif.race_banner)
                        .setTimestamp()
                        await interaction.update({ embeds: [picked], components: [row] });
                        return;
                        
                    }else{
                        await interaction.reply({ content: 'Full player', ephemeral: true });
                        return;
                    }
                }

                if(interaction.customId == 'nicy'){
                    if(interaction.member.user.id == id1 || interaction.member.user.id == id2 || interaction.member.user.id == id3){
                        await interaction.reply({ content: 'You are already selected animal', ephemeral: true });
                        return;
                    }
                    afk = false;
                    if(player1 == '**FREE**'){
                        id3 = await interaction.member.user.id;
                        player3 = `<@${id3}>`;
                        sat3 = 'nicy';

                        animal_three.setDisabled(true);
                        const picked = customEmbed()
                        .setAuthor({ name: `${user.displayName}`, iconURL: user.displayAvatarURL() })
                        .setColor('Blue')
                        .addFields(
                            { name: `Horse 1`, value: `[${horse_one}]\n${player1}`, inline: true },
                            { name: `Horse 2`, value: `[${horse_two}]\n${player2}`, inline: true },
                            { name: `Horse 3`, value: `[${horse_three}]\n${player3}`, inline: true },
                        )
                        .setImage(gif.race_banner)
                        .setTimestamp()
                        await interaction.update({ embeds: [picked], components: [row] });
                        return;

                    }else if(player2 == '**FREE**'){
                        id3 = await interaction.member.user.id;
                        player3 = `<@${id3}>`;
                        sat3 = 'nicy';

                        animal_three.setDisabled(true);
                        const picked = customEmbed()
                        .setAuthor({ name: `${user.displayName}`, iconURL: user.displayAvatarURL() })
                        .setColor('Blue')
                        .addFields(
                            { name: `Horse 1`, value: `[${horse_one}]\n${player1}`, inline: true },
                            { name: `Horse 2`, value: `[${horse_two}]\n${player2}`, inline: true },
                            { name: `Horse 3`, value: `[${horse_three}]\n${player3}`, inline: true },
                        )
                        .setImage(gif.race_banner)
                        .setTimestamp()
                        await interaction.update({ embeds: [picked], components: [row] });
                        return;
            
                    }else if(player3 == '**FREE**'){
                        id3 = await interaction.member.user.id;
                        player3 = `<@${id3}>`;
                        sat3 = 'nicy';

                        animal_three.setDisabled(true);
                        const picked = customEmbed()
                        .setAuthor({ name: `${user.displayName}`, iconURL: user.displayAvatarURL() })
                        .setColor('Blue')
                        .addFields(
                            { name: `Horse 1`, value: `[${horse_one}]\n${player1}`, inline: true },
                            { name: `Horse 2`, value: `[${horse_two}]\n${player2}`, inline: true },
                            { name: `Horse 3`, value: `[${horse_three}]\n${player3}`, inline: true },
                        )
                        .setImage(gif.race_banner)
                        .setTimestamp()
                        await interaction.update({ embeds: [picked], components: [row] });
                        return;
                        
                    }else{
                        await interaction.reply({ content: 'Full player', ephemeral: true });
                        return;
                    }
                }

                if(interaction.customId == 'start'){
                    if(interaction.member.user.id != hoster){
                        await interaction.reply({ content: 'You are not Hoster!!', ephemeral: true });
                        return;
                    }

                    if(player1 == '' && player2 == '' && player3 == ''){
                        await interaction.reply({ content: 'Need at last one player to start', ephemeral: true });
                        return;
                    }

                    win = true;

                    a.edit({ embeds: [SimpleEmbed(`All animal Road on!!!`)], components: [] });
                    await sleep(2000);

                    for(let i=5; i>=1; i--){
                        a.edit({ embeds: [SimpleEmbed(`All animal Road start in **${i}**`)] });
                        await sleep(1000);
                    }
                    a.edit({ embeds: [SimpleEmbed(`GO!!!`)] });
                    await sleep(1000);

                    let repeatedMessage = '';
                    let R1 = 0;
                    let repeatedMessage2 = '';
                    let R2 = 0;
                    let repeatedMessage3 = '';
                    let R3 = 0;

                    for (let i = 1; i <= 15; i++) {
                        const lo = getRandomInt(1, 4);
                        if(lo == 1){
                            for (let a = i; a <= i; a++) {
                                repeatedMessage += '  ';
                                R1 += 1;
                            }
                        }
                        if(lo == 2){
                            for (let b = i; b <= i; b++) {
                                repeatedMessage2 += '  ';
                                R2 += 1;
                            }
                        }
                        if(lo == 3){
                            for (let c = i; c <= i; c++) {
                                repeatedMessage3 += '  ';
                                R3 += 1;
                            }
                        }

                        repeatedMessage += '  ';
                        R1 += 1;
                        repeatedMessage2 += '  ';
                        R2 += 1;
                        repeatedMessage3 += '  ';
                        R3 += 1;

                        a.edit({ content: `${gif.brawo1}${gif.brawo2}${gif.brawo3}${gif.brawo1}${gif.brawo2}${gif.brawo3}${gif.brawo1}${gif.brawo2}${gif.brawo3}\nRoad====================| 🚩\n🏁:${repeatedMessage}${horse_one}\n🏁:${repeatedMessage2}${horse_two}\n🏁:${repeatedMessage3}${horse_three}\nRoad====================| 🚩\n${gif.brawo3}${gif.brawo2}${gif.brawo1}${gif.brawo3}${gif.brawo2}${gif.brawo1}${gif.brawo3}${gif.brawo2}${gif.brawo1}`, embeds: [] });
                        await sleep(1000);
                    }

                    let idWinner;
                    let second;
                    let thirst;

                    let secAnimal;
                    let thAnimal;

                    if(R1==R2||R2==R3||R3==R1){
                        a.edit({ embeds: [SimpleEmbed(`**=====RESULTS=====**\n**SAT SMER ALL NOP**\n**=====RESULTS=====**`)], content: '' });
                        collector.stop();
                        return;
                    }else if(R1 > R2 && R1 > R3){
                        if(sat1 == 'rutr'){
                            idWinner = id1;
                        }else if(sat2 == 'rutr'){
                            idWinner = id2; 
                        }else if(sat3 == 'rutr'){
                            idWinner = id3; 
                        }
                        if(R2 > R3){
                            if(sat1 == 'fegar'){
                                second = id1;
                            }else if(sat2 == 'fegar'){
                                second = id2;
                            }else if(sat3 == 'fegar'){
                                second = id3;
                            }
                            if(sat1 == 'nicy'){
                                thirst = id1;
                            }else if(sat2 == 'nicy'){
                                thirst = id2;
                            }else if(sat3 == 'nicy'){
                                thirst = id3;
                            }
                            secAnimal = horse_two;
                            thAnimal = horse_three;
                        }else{
                            if(sat1 == 'nicy'){
                                second = id1;
                            }else if(sat2 == 'nicy'){
                                second = id2;
                            }else if(sat3 == 'nicy'){
                                second = id3;
                            }
                            if(sat1 == 'fegar'){
                                thirst = id1;
                            }else if(sat2 == 'fegar'){
                                thirst = id2;
                            }else if(sat3 == 'fegar'){
                                thirst = id3;
                            }
                            thAnimal = horse_two;
                            secAnimal = horse_three;
                        }

                        if(!idWinner){
                            idWinner = client.user.id;
                        }
                        if(!second){
                            second = client.user.id;
                        }
                        if(!thirst){
                            thirst = client.user.id;
                        }

                        a.edit({ embeds: [SimpleEmbed(`**=====RESULTS=====**\n**1st**. [${gif.champion}] <@${idWinner}>: ${horse_one}\n**2st**. [${gif.second_top}] <@${second}>: ${secAnimal}\n**3st**. [${gif.third_top}] <@${thirst}>: ${thAnimal}\n**=====RESULTS=====**`)], content: '' });
                        collector.stop();
                        return;
                    }else if(R2 > R1 && R2 > R3){
                        if(sat1 == 'fegar'){
                            idWinner = id1;
                        }else if(sat2 == 'fegar'){
                            idWinner = id2;
                        }else if(sat3 == 'fegar'){
                            idWinner = id3;
                        }
                        if(R1 > R3){
                            if(sat1 == 'rutr'){
                                second = id1;
                            }else if(sat2 == 'rutr'){
                                second = id2;
                            }else if(sat3 == 'rutr'){
                                second = id3;
                            }
                            if(sat1 == 'nicy'){
                                thirst = id1;
                            }else if(sat2 == 'nicy'){
                                thirst = id2;
                            }else if(sat3 == 'nicy'){
                                thirst = id3;
                            }
                            secAnimal = horse_one;
                            thAnimal = horse_three;
                        }else{
                            if(sat1 == 'nicy'){
                                second = id1;
                            }else if(sat2 == 'nicy'){
                                second = id2;
                            }else if(sat3 == 'nicy'){
                                second = id3;
                            }
                            if(sat1 == 'rutr'){
                                thirst = id1;
                            }else if(sat2 == 'rutr'){
                                thirst = id2;
                            }else if(sat3 == 'rutr'){
                                thirst = id3;
                            }
                            secAnimal = horse_three;
                            thAnimal = horse_one;
                        }

                        if(!idWinner){
                            idWinner = client.user.id;
                        }
                        if(!second){
                            second = client.user.id;
                        }
                        if(!thirst){
                            thirst = client.user.id;
                        }

                        a.edit({ embeds: [SimpleEmbed(`**=====RESULTS=====**\n**1st**. [${gif.champion}] <@${idWinner}>: ${horse_two}\n**2st**. [${gif.second_top}] <@${second}>: ${secAnimal}\n**3st**. [${gif.third_top}] <@${thirst}>: ${thAnimal}\n**=====RESULTS=====**`)], content: '' });
                        collector.stop();
                        return;
                    }else if(R3 > R1 && R3 > R2){
                        if(sat1 == 'nicy'){
                            idWinner = id1;
                        }else if(sat2 == 'nicy'){
                            idWinner = id2;
                        }else if(sat3 == 'nicy'){
                            idWinner = id3;
                        }
                        if(R1 > R2){
                            if(sat1 == 'rutr'){
                                second = id1;
                            }else if(sat2 == 'rutr'){
                                second = id2;
                            }else if(sat3 == 'rutr'){
                                second = id3;
                            }
                            if(sat1 == 'fegar'){
                                thirst = id1;
                            }else if(sat2 == 'fegar'){
                                thirst = id2;
                            }else if(sat3 == 'fegar'){
                                thirst = id3;
                            }
                            secAnimal = horse_one;
                            thAnimal = horse_two;
                        }else{
                            if(sat1 == 'fegar'){
                                second = id1;
                            }else if(sat2 == 'fegar'){
                                second = id2;
                            }else if(sat3 == 'fegar'){
                                second = id3;
                            }
                            if(sat1 == 'rutr'){
                                thirst = id1;
                            }else if(sat2 == 'rutr'){
                                thirst = id2;
                            }else if(sat3 == 'rutr'){
                                thirst = id3;
                            }
                            secAnimal = horse_two;
                            thAnimal = horse_one;
                        }

                        if(!idWinner){
                            idWinner = client.user.id;
                        }
                        if(!second){
                            second = client.user.id;
                        }
                        if(!thirst){
                            thirst = client.user.id;
                        }

                        a.edit({ embeds: [SimpleEmbed(`**=====RESULTS=====**\n**1st**. [${gif.champion}] <@${idWinner}>: ${horse_three}\n**2st**. [${gif.second_top}] <@${second}>: ${secAnimal}\n**3st**. [${gif.third_top}] <@${thirst}>: ${thAnimal}\n**=====RESULTS=====**`)], content: '' });
                        collector.stop();
                        return;
                    }
                }

                if(interaction.customId == 'cancel'){
                    if(interaction.member.user.id != hoster){
                        await interaction.reply({ content: 'You are not Hoster!!', ephemeral: true });
                        return;
                    }

                    a.edit({ embeds: [SimpleEmbed(`Cancel by hoster: <@${user.id}>`)], components: [] });
                    collector.stop();
                    return;
                }
            });
            return;
        }catch(error){
            console.log(`race error ${error}`);
        }
    },
};