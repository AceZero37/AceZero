const { createCanvas, loadImage, getUser, AttachmentBuilder, gif } = require('../functioon/function');

const moment = require('moment-timezone');
const asiaTimezone = 'Asia/Phnom_Penh';

async function prem(message){
    const user = message.author;
	const userData = await getUser(user.id);

	if(userData){
        
        const currentTime = moment.tz(asiaTimezone);

        if(currentTime >= userData.premium.premium_endDate && userData.premium.premium_bool){

            userData.premium.premium_bool = false;

            try{ await userData.save(); }catch(error){}
        }else if(userData.premium.premium_bool){
            message.react(gif.premium_Hemiko);
        }
    }
}

module.exports = { prem };