const {getUser, SimpleEmbed, gif, sym, cooldown} = require('../../functioon/function');
const moment = require('moment-timezone');

const cooldowns = new Map();
let CDT = 9_000;
var getId = [];
var cdId = [];
var prem = [];

module.exports = {
    name: 'daily',
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

          const now = moment.tz('Asia/Phnom_Penh');
          const tomorrow = moment.tz('Asia/Phnom_Penh').add(1, 'day').startOf('day').hours(0);

          const bonus = 500;
          const rewrad = userData.dailySystem.dailyStack + bonus;
    
        if(userData.dailySystem.Daily < tomorrow || !userData.dailySystem.Daily){
          
          let prem_message = '';

          if(userData.premium.premium_bool){
            prem_message += `**PREMIUM Hemiko**${gif.premium_Hemiko}: ${gif.cash}**500,000**$, ${gif.fire_gif}**1**, ${gif.zaz_gif}**1**, ${gif['050']}**5**, ${gif['100']}**5**`;
            userData.balance += 500_000;
            userData.tools.fire_amount += 1;
            userData.tools.zaz_amount += 1;
            userData.gem['050'] += 5;
            userData.gem['100'] += 5;
          }

          message.channel.send({ embeds: [SimpleEmbed(`<@${user.id}> has claim your daily rewrad: ${gif.cash} **${rewrad.toLocaleString()}**$\n\n${prem_message}`)] });
          
          userData.farm.seed += 2;
          userData.dailySystem.dailyStack += 159;
          userData.balance += rewrad;
          userData.dailySystem.Daily = tomorrow;
    
          try{ await userData.save(); }catch(error){}
        }else{
          
          const timeRemaining = tomorrow - now;
          const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
          const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
    
          message.channel.send({ embeds: [SimpleEmbed(`<@${user.id}> You already claimed Try again in **${hours}H ${minutes}M ${seconds}S**`)] });
        }
      }catch(error){
        console.log(`daily error ${error}`); 
      }
    },
};
