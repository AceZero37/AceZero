const {getUser, SimpleEmbed, gif} = require('../../functioon/function');
const { PermissionsBitField } = require('discord.js');
module.exports = {
    name: 'get',
    async execute(client, message, args){
        let user = message.author;

        const mentions = message.mentions.users.first();
        if(mentions){
            user = mentions;
        }
        
        let userData = await getUser(user.id);

        if(!userData){
            message.reply(`This <@${user.id}> user didn't play Hemiko`);
            return;
        }

        const item = args[0];

        if(!['fire', 'zaz', 'esen', 'lootbox', 'crate', 'metal', 'seed', 'coin', 'box_farm', 'kof_box', 'rice', 'milk', 'watermelon', 'grapes', 'broccoli', 'wcf', 'wcl', 'gold'].includes(item)){
            message.reply({ embeds: [SimpleEmbed(`<@${user.id}> Enter name item`)] });
            return;
        }

        const amount_item = parseInt(args[1]);

        if(isNaN(amount_item)){
            message.reply({ embeds: [SimpleEmbed(`<@${user.id}> Enter amount item`)] });
            return;
        }

        if(item == 'gold'){
            userData.gold_coin += amount_item;
            await userData.save();
            message.reply({ embeds: [SimpleEmbed(`**⚙️:Creator wish for ${gif.gold_coin}x${amount_item.toLocaleString()} successfully**`)] });
            return;
        }

        if(item == 'wcl'){
            userData.gem[`777`] += amount_item;
            await userData.save();
            message.reply({ embeds: [SimpleEmbed(`**⚙️:Creator wish for ${gif['777']}x${amount_item.toLocaleString()} successfully**`)] });
            return;
        }

        if(item == 'wcf'){
            userData.gem[`999`] += amount_item;
            await userData.save();
            message.reply({ embeds: [SimpleEmbed(`**⚙️:Creator wish for ${gif['999']}x${amount_item.toLocaleString()} successfully**`)] });
            return;
        }

        if(item == 'coin'){
            userData.farm.coin += amount_item;
            await userData.save();
            message.reply({ embeds: [SimpleEmbed(`**⚙️:Creator wish for 🪙x${amount_item.toLocaleString()} successfully**`)] });
            return;
        }

        if(item == 'kof_box'){
            userData.gem[`kof`] += amount_item;
            await userData.save();
            message.reply({ embeds: [SimpleEmbed(`**⚙️:Creator wish for ${gif.kof_box}x${amount_item.toLocaleString()} successfully**`)] });
            return;
        }

        if(item == 'box_farm'){
            userData.farm.box_one += amount_item;
            userData.farm.box_two += amount_item;
            userData.farm.box_three += amount_item;
            userData.farm.box_four += amount_item;
            await userData.save();
            message.reply({ embeds: [SimpleEmbed(`**⚙️:Creator wish for 📦📦📦📦x${amount_item.toLocaleString()} successfully**`)] });
            return;
        }

        if(item == 'seed'){
            userData.farm.seed += amount_item;
            await userData.save();
            message.reply({ embeds: [SimpleEmbed(`**⚙️:Creator wish for 🪹x${amount_item.toLocaleString()} successfully**`)] });
            return;
        }

        if(item == 'rice'){
            userData.farm.rice += amount_item;
            await userData.save();
            message.reply({ embeds: [SimpleEmbed(`**⚙️:Creator wish for 🌾x${amount_item.toLocaleString()} successfully**`)] });
            return;
        }

        if(item == 'milk'){
            userData.farm.milk += amount_item;
            await userData.save();
            message.reply({ embeds: [SimpleEmbed(`**⚙️:Creator wish for 🥛x${amount_item.toLocaleString()} successfully**`)] });
            return;
        }

        if(item == 'watermelon'){
            userData.farm.ah_lerk += amount_item;
            await userData.save();
            message.reply({ embeds: [SimpleEmbed(`**⚙️:Creator wish for 🍉x${amount_item.toLocaleString()} successfully**`)] });
            return;
        }

        if(item == 'grapes'){
            userData.farm.ju += amount_item;
            await userData.save();
            message.reply({ embeds: [SimpleEmbed(`**⚙️:Creator wish for 🍇x${amount_item.toLocaleString()} successfully**`)] });
            return;
        }

        if(item == 'broccoli'){
            userData.farm.khatna += amount_item;
            await userData.save();
            message.reply({ embeds: [SimpleEmbed(`**⚙️:Creator wish for 🥦x${amount_item.toLocaleString()} successfully**`)] });
            return;
        }

        if(item == 'metal'){
            userData.shard += amount_item;
            await userData.save();
            message.reply({ embeds: [SimpleEmbed(`**⚙️:Creator wish for ${gif.shard_gif}x${amount_item.toLocaleString()} successfully**`)] });
            return;
        }

        if(item == 'crate'){
            userData.gem[`100`] += amount_item;
            await userData.save();
            message.reply({ embeds: [SimpleEmbed(`**⚙️:Creator wish for ${gif[`100`]}x${amount_item.toLocaleString()} successfully**`)] });
            return;
        }

        if(item == 'lootbox'){
            userData.gem[`050`] += amount_item;
            await userData.save();
            message.reply({ embeds: [SimpleEmbed(`**⚙️:Creator wish for ${gif[`050`]}x${amount_item.toLocaleString()} successfully**`)] });
            return;
        }

        if(item == 'esen'){
            userData.egg.esen += amount_item;
            await userData.save();
            message.reply({ embeds: [SimpleEmbed(`**⚙️:Creator wish for ${gif.esen_gif}x${amount_item.toLocaleString()} successfully**`)] });
            return;
        }

        if(item == 'fire'){
            userData.tools.fire_amount += amount_item;
            await userData.save();
            message.reply({ embeds: [SimpleEmbed(`**⚙️:Creator wish for ${gif.fire_gif}x${amount_item.toLocaleString()} successfully**`)] });
            return;
        }

        if(item == 'zaz'){
            userData.tools.zaz_amount += amount_item;
            await userData.save();
            message.reply({ embeds: [SimpleEmbed(`**⚙️:Creator wish for ${gif.zaz_gif}x${amount_item.toLocaleString()} successfully**`)] });
            return;
        }
    },
};