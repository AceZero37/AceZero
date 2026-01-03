const { getUser, customEmbed } = require('../../functioon/function');

module.exports = {
    name: 'remove',
    async execute(client, message, args) {
        try {
            const executor = message.author;

            // Check if user is authorized (using same system as admin commands)
            const allowedIds = [
                process.env.devId, 
                process.env.devId2, 
                process.env.devId3, 
                '1069079113261908008', 
                '940949823505432616'
            ].filter(Boolean);
            
            if (!allowedIds.includes(executor.id)) {
                const embed = customEmbed()
                    .setColor('#FF0000')
                    .setDescription('❌ **You do not have permission to use this command.**')
                    .setTimestamp();
                return message.channel.send({ embeds: [embed] });
            }

            // Check for proper usage
            if (args.length < 3) {
                const embed = customEmbed()
                    .setColor('#FFA500')
                    .setDescription(
                        '**Usage:** `!remove <@user> <cash|gold> <amount>`\n\n' +
                        '**Examples:**\n' +
                        '`!remove @user cash 1000000`\n' +
                        '`!remove @user gold 500`'
                    )
                    .setTimestamp();
                return message.channel.send({ embeds: [embed] });
            }

            // Get target user
            const mention = message.mentions.users.first();
            if (!mention) {
                const embed = customEmbed()
                    .setColor('#FF0000')
                    .setDescription('❌ **Please mention a valid user.**')
                    .setTimestamp();
                return message.channel.send({ embeds: [embed] });
            }

            const targetData = await getUser(mention.id);
            if (!targetData) {
                const embed = customEmbed()
                    .setColor('#FF0000')
                    .setDescription('❌ **User not found in database.**')
                    .setTimestamp();
                return message.channel.send({ embeds: [embed] });
            }

            // Get currency type
            const currencyType = args[1].toLowerCase();
            if (currencyType !== 'cash' && currencyType !== 'gold') {
                const embed = customEmbed()
                    .setColor('#FF0000')
                    .setDescription('❌ **Invalid currency type. Use `cash` or `gold`.**')
                    .setTimestamp();
                return message.channel.send({ embeds: [embed] });
            }

            // Get amount
            const amount = parseInt(args[2]);
            if (isNaN(amount) || amount <= 0) {
                const embed = customEmbed()
                    .setColor('#FF0000')
                    .setDescription('❌ **Please provide a valid positive amount.**')
                    .setTimestamp();
                return message.channel.send({ embeds: [embed] });
            }

            // Remove currency
            if (currencyType === 'cash') {
                const currentBalance = targetData.balance || 0;
                if (currentBalance < amount) {
                    const embed = customEmbed()
                        .setColor('#FFA500')
                        .setDescription(
                            `⚠️ **User only has \`${currentBalance.toLocaleString()}\` $**\n` +
                            `Removing all available cash instead.`
                        )
                        .setTimestamp();
                    targetData.balance = 0;
                    await targetData.save();
                    
                    const confirmEmbed = customEmbed()
                        .setColor('#00FF00')
                        .setDescription(
                            `✅ **Successfully removed \`${currentBalance.toLocaleString()}\` $ from ${mention.username}**\n` +
                            `New Balance: \`0\` $`
                        )
                        .setFooter({ text: `Executed by ${executor.username}` })
                        .setTimestamp();
                    return message.channel.send({ embeds: [embed, confirmEmbed] });
                }
                
                targetData.balance -= amount;
                await targetData.save();
                
                const embed = customEmbed()
                    .setColor('#00FF00')
                    .setDescription(
                        `✅ **Successfully removed \`${amount.toLocaleString()}\` $ from ${mention.username}**\n` +
                        `<:dollar:1438135127673798657> New Balance: \`${targetData.balance.toLocaleString()}\` $`
                    )
                    .setFooter({ text: `Executed by ${executor.username}` })
                    .setTimestamp();
                message.channel.send({ embeds: [embed] });

            } else if (currencyType === 'gold') {
                const currentGold = targetData.gold_coin || 0;
                if (currentGold < amount) {
                    const embed = customEmbed()
                        .setColor('#FFA500')
                        .setDescription(
                            `⚠️ **User only has \`${currentGold.toLocaleString()}\` Gold**\n` +
                            `Removing all available gold instead.`
                        )
                        .setTimestamp();
                    targetData.gold_coin = 0;
                    await targetData.save();
                    
                    const confirmEmbed = customEmbed()
                        .setColor('#00FF00')
                        .setDescription(
                            `✅ **Successfully removed \`${currentGold.toLocaleString()}\` Gold from ${mention.username}**\n` +
                            `New Gold: \`0\` Gold`
                        )
                        .setFooter({ text: `Executed by ${executor.username}` })
                        .setTimestamp();
                    return message.channel.send({ embeds: [embed, confirmEmbed] });
                }
                
                targetData.gold_coin -= amount;
                await targetData.save();
                
                const embed = customEmbed()
                    .setColor('#00FF00')
                    .setDescription(
                        `✅ **Successfully removed \`${amount.toLocaleString()}\` Gold from ${mention.username}**\n` +
                        `<:gold:1438135130177671280> New Gold: \`${targetData.gold_coin.toLocaleString()}\` Gold`
                    )
                    .setFooter({ text: `Executed by ${executor.username}` })
                    .setTimestamp();
                message.channel.send({ embeds: [embed] });
            }

        } catch (error) {
            console.log(`remove command error: ${error}`);
            const embed = customEmbed()
                .setColor('#FF0000')
                .setDescription('❌ **An error occurred while executing the command.**')
                .setTimestamp();
            message.channel.send({ embeds: [embed] });
        }
    },
};