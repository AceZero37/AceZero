const { createCanvas, loadImage, getUser, AttachmentBuilder, gif } = require('../functioon/function');

async function leveling(message){
    const user = message.author;
	const userData = await getUser(user.id);

	if(userData){
        userData.levelSystem.xp += 10;
        userData.command_point += 1;

        if(userData.levelSystem.xp >= userData.levelSystem.rateXp){

            userData.levelSystem.level += 1;
            userData.levelSystem.rateXp = parseInt(userData.levelSystem.rateXp * 1.5);
            
            if(userData.premium.premium_bool){
                try{
                    const user = message.author;
                    const userData = await getUser(user.id);
        
                    const canvas = createCanvas(250, 128);
                    const ctx = canvas.getContext('2d');
        
                    const border = await loadImage(gif.level_up_premium);
                    ctx.drawImage(border, 0, 0, canvas.width, canvas.height);
        
                    const userAvatarURL = message.author.displayAvatarURL({ extension: 'png', size: 128 });
                    const avatar = await loadImage(userAvatarURL);
        
                    ctx.drawImage(avatar, 0, 0);
        
                    const level = userData.levelSystem.level;
        
                    ctx.fillStyle = '#ffffff';
                    ctx.font = '15px Arial';
                    ctx.fillText(`LEVEL UP`, 150, 50);
        
                    ctx.fillStyle = '#ffffff';
                    ctx.font = '50px Arial';
                    const text = `${level}`;
                    const textWidth = ctx.measureText(text).width;
                    const x = 180 - (textWidth / 2);
                    ctx.fillText(text, x, 100);
        
                    const attachment = new AttachmentBuilder(canvas.toBuffer(), 'level.png');
                    message.channel.send({ files: [attachment] });
        
                }catch(error){ console.log(`test error ${error}`); }
            }else{
                const canvas = createCanvas(250, 128);
                const ctx = canvas.getContext('2d');

                ctx.fillStyle = 'Gray';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                const userAvatarURL = message.author.displayAvatarURL({ extension: 'png', size: 128 });
                const avatar = await loadImage(userAvatarURL);

                ctx.drawImage(avatar, 0, 0);

                const level = userData.levelSystem.level;

                ctx.fillStyle = '#ffffff';
                ctx.font = '15px Arial';
                ctx.fillText(`LEVEL UP`, 150, 50);

                ctx.fillStyle = '#ffffff';
                ctx.font = '50px Arial';
                const text = `${level}`;
                const textWidth = ctx.measureText(text).width;
                const x = 180 - (textWidth / 2);
                ctx.fillText(text, x, 100);

                const attachment = new AttachmentBuilder(canvas.toBuffer(), 'level.png');
                message.channel.send({ files: [attachment] });
            }
        }

        try {
            userData.username = user.username;
            await userData.save();
        }catch(error){}
    }
}

module.exports = { leveling };