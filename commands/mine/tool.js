const { SimpleEmbed, getUser, gif, sym, cooldown } = require('../../functioon/function');

const cooldowns = new Map();
let CDT = 25_000;
var getId = [];
var cdId = [];
var prem = [];

module.exports = {
    name: 'tool',
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

            let tools = args[0];
            let amount_item = parseInt(args[1]);
        
            if(isNaN(amount_item)){
                amount_item = 1;
            }
        
            if(!['addpercen', 'addrate', 'adddouble'].includes(tools)){
        
                message.reply({ embeds: [SimpleEmbed(`<@${user.id}> enter tools name ${gif.addPercen_gif}: **addpercen**, ${gif.addRate_gif}: **addrate**, ${gif.addDouble_gif}: **adddouble**!`)] });
        
                await userData.save();
                return;
            }
        
            if(tools == 'addpercen'){
                if(userData.tools.addPercen_amount <= 0){
                    message.reply({ embeds: [SimpleEmbed(`<@${user.id}> you don't have any ${gif.addPercen_gif}!`)] });
                    await userData.save();
                    return;
                }else{
                    if(amount_item > userData.tools.addPercen_amount){
                        message.reply({ embeds: [SimpleEmbed(`<@${user.id}> you don't have ${gif.addPercen_gif} enough!`)] });
                        await userData.save();
                        return;
                    }
        
                    userData.tools.addPercen_amount -= amount_item;
                    userData.inventory.pickage_percen += ( 50 * amount_item );
        
                    message.reply({ embeds: [SimpleEmbed(`<@${user.id}> you used: ${gif.addPercen_gif}x**${amount_item}** and now your ${gif.pickage_gif} got **${userData.inventory.pickage_percen.toLocaleString()}**%!`)] });
                    await userData.save();
                    return;
                }
            }
        
            if(tools == 'addrate'){
                if(userData.tools.addRate_amount <= 0){
                    message.reply({ embeds: [SimpleEmbed(`<@${user.id}> you don't have any ${gif.addRate_gif}!`)] });
                    await userData.save();
                    return;
                }else{
                    if(amount_item > userData.tools.addRate_amount){
                        message.reply({ embeds: [SimpleEmbed(`<@${user.id}> you don't have ${gif.addRate_gif} enough!`)] });
                        await userData.save();
                        return;
                    }
        
                    userData.tools.addRate_amount -= amount_item;
                    userData.tools.addRate_percen += ( 100 * amount_item );
                    userData.tools.addRate_Bool = true;
                    userData.tools.addrate_luck = 5;
        
                    message.reply({ embeds: [SimpleEmbed(`<@${user.id}> you used: ${gif.addRate_gif}x**${amount_item}** and now your ${gif.pickage_gif} got **${userData.tools.addrate_luck}** mine luck!`)] });
                    await userData.save();
                    return;
                }
            }
        
            if(tools == 'adddouble'){
                if(userData.tools.addDouble_amount <= 0){
                    message.reply({ embeds: [SimpleEmbed(`<@${user.id}> you don't have any ${gif.addDouble_gif}!`)] });
                    await userData.save();
                    return;
                }else{
                    if(amount_item > userData.tools.addDouble_amount){
                        message.reply({ embeds: [SimpleEmbed(`<@${user.id}> you don't have ${gif.addDouble_gif} enough!`)] });
                        await userData.save();
                        return;
                    }
        
                    userData.tools.addDouble_amount -= amount_item;
                    userData.tools.addDouble_percen += ( 100 * amount_item );
                    userData.tools.addDouble_Bool = true;
        
                    message.reply({ embeds: [SimpleEmbed(`<@${user.id}> you used: ${gif.addDouble_gif}x**${amount_item}** and now your ${gif.pickage_gif} got **3** mine times!`)] });
                    await userData.save();
                    return;
                }
            }
        
            await userData.save();
            return;
        }catch(error){
            console.log(`tool error ${error}`);
        }
    },
};