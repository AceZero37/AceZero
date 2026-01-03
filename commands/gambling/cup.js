const { getCollectionButton, getUser, getRandomInt, gif, SimpleEmbed, sym, cooldown, sleep, customEmbed, createCanvas, loadImage, AttachmentBuilder, labelButton, ButtonStyle, threeButton } = require('../../functioon/function');

const cooldowns = new Map();
let CDT = 15_000;
var getId = [];
var cdId = [];
var prem = [];

module.exports = {
    name: 'cup',
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

            let bet = parseInt(args[0]);
            let bet_cash = args[0];
            if (args[0] === 'all') {
                bet = userData.balance;
            } else if (!bet) {
                return;
            }

            if(bet_cash == `${bet}k` || bet_cash == `${bet}K`){
                bet *= 1000;
            }

            if (bet >= 250000) {
                bet = 250000;
            }

            if(userData.balance < bet || userData.balance <= 0){
                message.reply({ embeds: [SimpleEmbed(`<@${user.id}>** You don't have enough cash!**`)] });
                return;
            }

            userData.balance -= bet;
            await userData.save();

            const left_button = labelButton('left_button', 'Left', ButtonStyle.Primary); left_button.setDisabled(true)
            const mid_button = labelButton('mid_button', 'Mid', ButtonStyle.Primary); mid_button.setDisabled(true)
            const right_button = labelButton('right_button', 'Right', ButtonStyle.Primary); right_button.setDisabled(true)

            const all_button = threeButton(left_button, mid_button, right_button);

            const attachment = new AttachmentBuilder(gif.cup_tolling_gif, { name: 'test.gif' });
            const embed = customEmbed()
                .setAuthor({ name: `${user.displayName} play Ball in cup`, iconURL: user.displayAvatarURL() })
                .setColor("Blue")
                .setDescription(`**Bet** ${gif.cash} **${bet.toLocaleString()}**$`)
                .setImage('attachment://test.gif')
                .setTimestamp();
            const mgs = await message.channel.send({ embeds: [embed], files: [attachment], components: [all_button] });

            await sleep(2000);

            left_button.setDisabled(false)
            mid_button.setDisabled(false)
            right_button.setDisabled(false)

            const currentTime = new Date();
            const cooldownEnd = new Date(currentTime.getTime() + CDT);

            const attachment_asd = new AttachmentBuilder(gif.cup_show_png, { name: 'test_asd.png' });
            mgs.edit({ embeds: [embed.setImage('attachment://test_asd.png').setDescription(`**Bet** ${gif.cash} **${bet.toLocaleString()}**$\nchoose before <t:${Math.floor(cooldownEnd.getTime() / 1000)}:R>`)], files: [attachment_asd], components: [all_button] });

            const collector = getCollectionButton(mgs, CDT);
            let color = "#3D3D3D";
            let des = `**Time out** and lost ${gif.cash} ${bet.toLocaleString()}$`;

            collector.on('end', (collected, reason) =>{
                if(reason === 'time'){
                    mgs.edit({ embeds: [embed.setColor(color).setDescription(des)], components: [] });
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

                    const ball = getRandomInt(1, 4);
                    let image_pick;
                    let ball_in_where;

                    if(ball == 1){
                        ball_in_where = "Left";
                    }else if(ball == 2){
                        ball_in_where = "Mid";
                    }else if(ball == 3){
                        ball_in_where = "Right";
                    }
    
                    if(interaction.customId === 'left_button'){
                        if(ball == 1){
                            image_pick = gif.cup_one_png;
                            color = "Green";
                            des = `**Won** ${gif.cash} **${bet.toLocaleString()}**$ Ball in Left`;
                        }else{
                            image_pick = gif.cup_one_empty_png;
                            color = "Red";
                            des = `Lost ${gif.cash} ${bet.toLocaleString()}$ Ball in ${ball_in_where}`;
                        }
                    }else if(interaction.customId === 'mid_button'){
                        if(ball == 2){
                            image_pick = gif.cup_two_png;
                            color = "Green";
                            des = `**Won** ${gif.cash} **${bet.toLocaleString()}**$ Ball in Mid`;
                        }else{
                            image_pick = gif.cup_two_empty_png;
                            color = "Red";
                            des = `Lost ${gif.cash} ${bet.toLocaleString()}$ Ball in ${ball_in_where}`;
                        }
                    }else if(interaction.customId === 'right_button'){
                        if(ball == 3){
                            image_pick = gif.cup_three_png;
                            color = "Green";
                            des = `**Won** ${gif.cash} **${bet.toLocaleString()}**$ Ball in Right`;
                        }else{
                            image_pick = gif.cup_three_empty_png;
                            color = "Red";
                            des = `Lost ${gif.cash} ${bet.toLocaleString()}$ Ball in ${ball_in_where}`;
                        }
                    }

                    const attachment_final = new AttachmentBuilder(image_pick, { name: 'test_final.png' });
                    await interaction.update({ embeds: [embed.setColor(color).setDescription(des).setImage('attachment://test_final.png')], files: [attachment_final], components: [] });

                    if(color == "Green"){
                        userData.balance += parseInt(bet * 2);
                    }

                    try{ await userData.save(); }catch(error){}

                    collector.stop();

                }catch(error){}
            });

        }catch(error){
            console.log(`cup error ${error}`);
        }
    },
};