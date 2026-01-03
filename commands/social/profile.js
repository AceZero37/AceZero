const {cooldown, gif, AttachmentBuilder, SimpleEmbed, User, customEmbed, getUser, ButtonStyle, createCanvas, loadImage, labelButton, twoButton, getCollectionButton} = require('../../functioon/function');
const moment = require('moment-timezone');

const cooldowns = new Map();
let CDT = 60_000;
var getId = [];
var cdId = [];
var prem = [];

module.exports = {
    name: 'profile',
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

            if(args[0]){
                if(args[0] === 'set' && args[1] === 'aboutme'){
                    const command = message.content;
                    const text = `${command.slice(command.indexOf(args[2]))}`; if(text.length > 30){ return message.channel.send({ embeds: [SimpleEmbed(`<@${user.id}> your about me is more than 30 letter`)] }); }
                    userData.about_me = text;
                    try{ await userData.save(); }catch(error){}
                    return message.channel.send({ embeds: [SimpleEmbed(`now <@${user.id}> has changed about me to **${text}**`)] });

                }else if(args[0] === 'set' && args[1] === 'relationship'){
                    const mention = message.mentions.users.first();
                    if(mention){
                        if(mention == userData.relationship_partner_id){ return message.channel.send({ embeds: [SimpleEmbed(`<@${user.id}> and <@${mention.id}> is already married❤️`)] }); }

                        const embed = customEmbed()
                            .setAuthor({ name: `${user.username}, you and ${mention.username} about to married`, iconURL: user.displayAvatarURL() })
                            .setColor("Random")
                            .setDescription(`\n\n💝💖💘God will bless two of you❤️💞💓\n\n<@${mention.id}> are you agree with <@${user.id}>?`)
                            .setTimestamp();

                        const confirmButton = labelButton('confirm_button', '✅ Confirm', ButtonStyle.Success);
                        const cancelButton = labelButton('cancel_button', '❎ Cancel', ButtonStyle.Danger);
                        const allButtons = twoButton(confirmButton, cancelButton);

                        const messageEmbed = await message.channel.send({ embeds: [embed], components: [allButtons] });

                        const collector = getCollectionButton(messageEmbed, 30000);

                        collector.on('end', (collected, reason) => {
                            if (reason === 'time') {
                                confirmButton.setDisabled(true);
                                cancelButton.setDisabled(true);
                                messageEmbed.edit({ embeds: [embed.setColor('#3D3D3D')], components: [allButtons] });
                                return;
                            }
                        });

                        collector.on('collect', async (interaction) => {
                            if(interaction.member.user.id !== mention.id){
                                await interaction.reply({ content: 'This button is not for you!', ephemeral: true });
                                return;
                            }

                            if(interaction.customId === 'confirm_button'){
                                try{
                                    const partnerData = await getUser(mention.id);
                                    const now = moment.tz('Asia/Phnom_Penh');
                                    const date_of_start_relationships = now.format('DD-MM-YYYY');
                                    userData.relationship_partner_id = mention.id;
                                    userData.date_of_start_relationship = date_of_start_relationships;
                                    partnerData.relationship_partner_id = user.id;
                                    partnerData.date_of_start_relationship = date_of_start_relationships;
                                    messageEmbed.edit({ embeds: [SimpleEmbed(`💓💞❤️💘**Congrantulation two of you now yours Couple**💖💝❣️💗!\n**Husband**:<@${user.id}> ==> **Wife**:<@${mention.id}>`)], components: [] });
                                    collector.stop();
                                    try{ await userData.save(); await partnerData.save(); }catch(error){}
                                    return
                                }catch(error){}
                            }

                            if (interaction.customId === 'cancel_button') {
                                messageEmbed.edit({ embeds: [SimpleEmbed(`<@${mention.id}> has rejected sad!`)], components: [] });
                                collector.stop();
                                return;
                            }
                        });





                    }else{
                        return message.channel.send({ embeds: [SimpleEmbed(`<@${user.id}> please mention your lover`)] });
                    }
                }
            }else{
                const username = user.username;
                const aboutMe = userData.about_me;
                let relationshipStatus = "Single";
                if(userData.relationship_partner_id){ 
                    const partner = await client.users.fetch(userData.relationship_partner_id);
                    relationshipStatus = partner.username;
                }
                const userLevel = userData.levelSystem.level
                const avatarURL = user.displayAvatarURL({ extension: 'png', size: 256 });

                // Create canvas
                const width = 480;
                const height = 250;
                const canvas = createCanvas(width, height);
                const ctx = canvas.getContext('2d');

                // Background
                var backgroundImage = gif.profile_background;
                if(userData.relationship_partner_id){ 
                    backgroundImage = gif.profile_background_with_relationship
                }
                const background = await loadImage(backgroundImage);
                ctx.drawImage(background,0, 0, width, height);

                // Draw user avatar
                const avatar = await loadImage(avatarURL);
                const avatarSize = 100;
                ctx.drawImage(avatar, 20, 20, avatarSize, avatarSize);

                if(userData.relationship_partner_id){ 
                    ctx.font = '20px sans-serif';
                    ctx.fillStyle = '#ffffff';
                    const partner = await client.users.fetch(userData.relationship_partner_id);
                    const partner_URL = partner.displayAvatarURL({ extension: 'png', size: 256 });
                    const partner_avatar = await loadImage(partner_URL);
                    ctx.drawImage(partner_avatar, 360, 20, avatarSize, avatarSize);
                    ctx.fillText(userData.date_of_start_relationship, 188, 245);
                }

                // Draw username
                ctx.font = '28px sans-serif';
                ctx.fillStyle = '#ffffff';
                ctx.fillText(username, 140, 50);

                // Draw "About Me"
                ctx.font = '20px sans-serif';
                ctx.fillStyle = '#ffffff';
                ctx.fillText('About Me:', 140, 90);
                ctx.fillText(aboutMe, 140, 120);

                // Draw "Relationship Status"
                ctx.font = '20px sans-serif';
                ctx.fillStyle = '#ffffff';
                ctx.fillText('Relationship Status:', 140, 160);
                ctx.fillText(relationshipStatus, 140, 190);

                // Convert canvas to buffer and send as attachment
                const buffer = canvas.toBuffer();
                const attachment = { files: [{ attachment: buffer, name: 'profile.png' }] };
                message.channel.send(attachment);
            }

        }catch(error){ console.log(`superagent error ${error}`); }
    },
};



