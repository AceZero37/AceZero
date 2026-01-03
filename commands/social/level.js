const {getUser, gif, AttachmentBuilder, SimpleEmbed, createCanvas, loadImage, cooldown, sym} = require('../../functioon/function');

const cooldowns = new Map();
let CDT = 25_000;
var getId = [];
var cdId = [];
var prem = [];

module.exports = {
    name: 'xp',
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

            if(userData.premium.premium_bool){
                try{
                    const user = message.author;
                    const userData = await getUser(user.id);
                    const userXp = userData.levelSystem.xp; // Example XP
                    const userLevel = userData.levelSystem.level;; // Example level
                    const xpForNextLevel = userData.levelSystem.rateXp; // XP required for next level
                    const xpCurrentLevel = 1000; // XP required for current level
                    
                    // Calculate progress
                    const progress = (userXp - xpCurrentLevel) / (xpForNextLevel - xpCurrentLevel);
        
                    // Create canvas
                    const canvas = createCanvas(1243, 374);
                    const ctx = canvas.getContext('2d');
        
                    // Load background image
                    let backgroundImage = gif.backgroundImage;
        
                    if(userData.lvl_bg == 'jjk'){
                        backgroundImage = gif.jjk_bg;
                    }else if(userData.lvl_bg == 'op'){
                        backgroundImage = gif.op_bg;
                    }else if(userData.lvl_bg == 'opm'){
                        backgroundImage = gif.opm_bg;
                    }else if(userData.lvl_bg == 'ds'){
                        backgroundImage = gif.ds_bg
                    }else if(userData.lvl_bg == 'cg'){
                        backgroundImage = gif.cg_bg;
                    }else if(userData.lvl_bg == 'nt'){
                        backgroundImage = gif.nt_bg;
                    }else if(userData.lvl_bg == 'nm'){
                        backgroundImage = gif.nm_bg;
                    }else if(userData.lvl_bg == 'ms'){
                        backgroundImage = gif.ms_bg;
                    }else if(userData.lvl_bg == 'cm'){
                        backgroundImage = gif.cm_bg;
                    }else if(userData.lvl_bg == 'kof'){
                        backgroundImage = gif.kof_bg;
                    }else if(userData.lvl_bg == 'kn8'){
                        backgroundImage = gif.kn8_bg;
                    }
        
                    const background = await loadImage(backgroundImage);
                    ctx.drawImage(background,0, 0, canvas.width, canvas.height);
        
                    const border = await loadImage(gif.border_level_premium);
                    ctx.drawImage(border,0, 0, canvas.width, canvas.height);
        
                    // Draw profile picture border
                    const borderRadius = 130; // Slightly larger than the avatar radius
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(187, 187, borderRadius, 0, Math.PI * 2, true);
                    ctx.closePath();
                    ctx.fillStyle = '#cdcdcd'; // Border color
                    ctx.fill();
                    ctx.restore();
        
                    // Draw profile picture circle
                    const userAvatarURL = message.author.displayAvatarURL({ extension: 'png', size: 256 });
                    const avatar = await loadImage(userAvatarURL);
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(187, 187, 125, 0, Math.PI * 2, true);
                    ctx.closePath();
                    ctx.clip();
                    ctx.drawImage(avatar, 62, 62, 250, 250);
                    ctx.restore();
        
                    // Function to draw a rounded rectangle
                    function drawRoundedRect(ctx, x, y, width, height, radius) {
                        ctx.beginPath();
                        ctx.moveTo(x + radius, y);
                        ctx.lineTo(x + width - radius, y);
                        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
                        ctx.lineTo(x + width, y + height - radius);
                        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
                        ctx.lineTo(x + radius, y + height);
                        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
                        ctx.lineTo(x, y + radius);
                        ctx.quadraticCurveTo(x, y, x + radius, y);
                        ctx.closePath();
                    }
        
                    // Draw progress bar background
                    ctx.fillStyle = '#cdcdcd';
                    drawRoundedRect(ctx, 450, 250, 700, 50, 25);
                    ctx.fill();
        
                    // Draw progress bar (slightly smaller than background)
                    ctx.fillStyle = '#37393d';
                    drawRoundedRect(ctx, 455, 255, 690 * progress, 40, 20); // Slightly smaller dimensions
                    ctx.fill();
        
                    // Draw XP text inside the progress bar
                    ctx.fillStyle = '#FFFFFF';
                    ctx.font = '30px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(`XP: ${userXp}/${xpForNextLevel}`, 455 + (690 / 2), 255 + (40 / 2)); // Center text in the progress bar
        
                    // Draw text
                    ctx.fillStyle = '#FFFFFF';
                    ctx.font = '60px sans-serif';
        
                    // USERNAME
                    ctx.textBaseline = 'middle';
                    const text_username = `${user.username}`;
                    const textWidth_username = ctx.measureText(text_username).width;
                    const x_username = 930 - (textWidth_username / 2);
                    ctx.fillText(text_username, x_username, 60);
        
                    // Level
                    ctx.font = '70px sans-serif';
                    const text = `${userLevel}`;
                    const textWidth = ctx.measureText(text).width;
                    const x = 830 - (textWidth / 2);
                    ctx.fillText(text, x, 185);
        
                    // Send the image
                    const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'levelcheck.png' });
                    message.channel.send({ files: [attachment] });
        
                }catch(error){ console.log(`level premium ${error}`); }
                return;
            }

            const canvas = createCanvas(1243, 374);
            const ctx = canvas.getContext('2d');

            let backgroundImage = gif.backgroundImage;

            if(userData.lvl_bg == 'jjk'){
                backgroundImage = gif.jjk_bg;
            }else if(userData.lvl_bg == 'op'){
                backgroundImage = gif.op_bg;
            }else if(userData.lvl_bg == 'opm'){
                backgroundImage = gif.opm_bg;
            }else if(userData.lvl_bg == 'ds'){
                backgroundImage = gif.ds_bg
            }else if(userData.lvl_bg == 'cg'){
                backgroundImage = gif.cg_bg;
            }else if(userData.lvl_bg == 'nt'){
                backgroundImage = gif.nt_bg;
            }else if(userData.lvl_bg == 'nm'){
                backgroundImage = gif.nm_bg;
            }else if(userData.lvl_bg == 'ms'){
                backgroundImage = gif.ms_bg;
            }else if(userData.lvl_bg == 'cm'){
                backgroundImage = gif.cm_bg;
            }else if(userData.lvl_bg == 'kof'){
                backgroundImage = gif.kof_bg;
            }

            const background = await loadImage(backgroundImage);
            ctx.drawImage(background,0, 0, canvas.width, canvas.height);

            const level = userData.levelSystem.level;
            const xp = userData.levelSystem.xp;
            const rateXp = userData.levelSystem.rateXp;

            const progressBarWidth = 600;
            const progressBarHeight = 50;

            ctx.fillStyle = '#00A8D5';
            ctx.fillRect(30, 32, 8, 310); // stick1
            ctx.fillRect(1200, 32, 8, 310); // stick2

            ctx.fillRect(30, 32, 1170, 8); // stick3
            ctx.fillRect(30, 334, 1170, 8); // stick4

            const squareSize = 264;
            ctx.fillStyle = '#00C9FF';
            ctx.fillRect(920, 56, squareSize, squareSize);

            ctx.fillStyle = '#ffffff';
            ctx.font = '80px Arial';
            ctx.fillText(`User: ${user.username}`, 50, 110);
            ctx.fillText(`Level: ${level}`, 50, 215);

            ctx.fillStyle = '#00A8D5';
            ctx.fillRect(50 , 261, progressBarWidth, progressBarHeight + 8);

            const progress = xp / rateXp;
            const filledBarWidth = progress * progressBarWidth;

            ctx.fillStyle = '#00C9FF';
            ctx.fillRect(54 , 265, filledBarWidth, progressBarHeight);

            ctx.fillStyle = '#ffffff';
            ctx.font = '45px Arial';
            ctx.fillText(`XP: ${xp.toLocaleString()} / ${rateXp.toLocaleString()}`, 60, 306);

            const userAvatarURL = message.author.displayAvatarURL({ extension: 'png', size: 256 });
            const avatar = await loadImage(userAvatarURL);
            ctx.drawImage(avatar, 924, 60);

            const attachment = new AttachmentBuilder(canvas.toBuffer());
            message.channel.send({ files: [attachment] });
        }catch(error){
            console.log(`level error ${error}`);
        }
    },
};