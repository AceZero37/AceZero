const { SimpleEmbed, getRandomInt, getUser, gif } = require('../../functioon/function');
const giveaways = new Map();

module.exports = {
    name: 'gstart',
    async execute(client, message, args) {
        try {
            // args example: 10m 2 5000cash 100gold 5lootbox 2crate
            let duration = args[0]; // 10m, 1h, 2d
            const winnersCount = parseInt(args[1]);
            const prizeArgs = args.slice(2);

            if (!duration || isNaN(winnersCount) || winnersCount <= 0 || prizeArgs.length === 0) {
                return message.reply('Provide duration, winners, and prizes.\nExample: `!gstart 10m 2 5000cash 100gold 5lootbox 2crate`');
            }

            // Parse prizes
            let prizeCash = 0, prizeGold = 0, prizeLootbox = 0, prizeCrate = 0;
            
            for (const p of prizeArgs) {
                const lowerP = p.toLowerCase();
                if (lowerP.endsWith('cash')) {
                    prizeCash += parseInt(lowerP.replace('cash', ''));
                } else if (lowerP.endsWith('gold')) {
                    prizeGold += parseInt(lowerP.replace('gold', ''));
                } else if (lowerP.endsWith('lootbox')) {
                    prizeLootbox += parseInt(lowerP.replace('lootbox', ''));
                } else if (lowerP.endsWith('crate')) {
                    prizeCrate += parseInt(lowerP.replace('crate', ''));
                }
            }

            // Generate Prize String Display
            let prizeParts = [];
            if (prizeCash > 0) prizeParts.push(`<:dollar:1438135127673798657> ${prizeCash.toLocaleString()} $`);
            if (prizeGold > 0) prizeParts.push(`<:gold:1438135130177671280> ${prizeGold.toLocaleString()} Gold`);
            if (prizeLootbox > 0) prizeParts.push(`${gif['050']} ${prizeLootbox.toLocaleString()} Lootbox`);
            if (prizeCrate > 0) prizeParts.push(`${gif['100']} ${prizeCrate.toLocaleString()} Crate`);
            
            const prizeString = prizeParts.join(' & ');

            // Convert duration to ms
            let timeMs;
            if (duration.endsWith('m')) timeMs = parseInt(duration) * 60_000;
            else if (duration.endsWith('h')) timeMs = parseInt(duration) * 3_600_000;
            else if (duration.endsWith('d')) timeMs = parseInt(duration) * 86_400_000;
            else timeMs = parseInt(duration) * 1000;

            const giveaway = { participants: [] };
            giveaways.set(message.channel.id, giveaway);

            // Send giveaway message with image
            const endTime = Date.now() + timeMs;
            const embed = SimpleEmbed(
                `🎉 **Giveaway Started!** 🎉\nReact with 🎉 to join!\n\n**Prize:** ${prizeString}\n**Winners:** ${winnersCount}\n**Ends:** <t:${Math.floor(endTime/1000)}:R>`
            )
                .setAuthor({ name: 'New Giveaway!' })
                .setImage('https://media.discordapp.net/attachments/1302528818698784768/1443563043760902264/giveaway-web-banner-template-flat-260nw-1941897994.jpg')
                .setColor('#FFD700'); // Gold color for giveaway start

            const giveawayMessage = await message.channel.send({ embeds: [embed] });
            await giveawayMessage.react('🎉');

            // Reaction collector
            const filter = (reaction, user) => reaction.emoji.name === '🎉' && !user.bot;
            const collector = giveawayMessage.createReactionCollector({ filter, time: timeMs });

            collector.on('collect', (reaction, user) => {
                if (!giveaway.participants.includes(user.id)) giveaway.participants.push(user.id);
            });

            collector.on('end', async () => {
                if (giveaway.participants.length === 0) {
                    return giveawayMessage.edit({ 
                        embeds: [SimpleEmbed('No one joined the giveaway. 😢')
                            .setColor('Red')
                            .setAuthor({ name: 'Giveaway Ended' })] 
                    });
                }

                // Select winners
                const winners = [];
                while (winners.length < winnersCount && winners.length < giveaway.participants.length) {
                    const selected = giveaway.participants[getRandomInt(0, giveaway.participants.length)];
                    if (!winners.includes(selected)) winners.push(selected);
                }

                // Give prizes
                const winnersMentions = [];
                for (const winnerId of winners) {
                    try {
                        const user = await client.users.fetch(winnerId);
                        const userData = await getUser(winnerId);
                        if (userData) {
                            if (prizeCash > 0) userData.balance += prizeCash;
                            if (prizeGold > 0) userData.gold_coin += prizeGold;
                            if (prizeLootbox > 0) userData.gem['050'] += prizeLootbox; // 050 is ID for lootbox
                            if (prizeCrate > 0) userData.gem['100'] += prizeCrate;    // 100 is ID for crate
                            
                            await userData.save();
                        }
                        winnersMentions.push(`<@${winnerId}>`);
                        
                        // Send DM to winner with congratulations image
                        user.send({
                            embeds: [SimpleEmbed(
                                `🎉 **Congratulations!** 🎉\n\nYou won in the giveaway!\n\n**Prize:** ${prizeString}`
                            )
                                .setImage('https://media.discordapp.net/attachments/1428439778948415648/1443564599164014593/IMG_8622.png')
                                .setColor('#00FF00')] // Green for winning
                        }).catch(() => {});
                    } catch {}
                }

                // Edit giveaway message with winners and congratulations image
                giveawayMessage.edit({
                    embeds: [SimpleEmbed(
                        `🎉 **Giveaway Ended!** 🎉\n\n**Prize:** ${prizeString}\n\n**🏆 Winners:**\n${winnersMentions.join(', ')}\n\nCongratulations to all winners!`
                    )
                        .setAuthor({ name: 'Giveaway Ended' })
                        .setImage('https://media.discordapp.net/attachments/1302528818698784768/1443563043760902264/giveaway-web-banner-template-flat-260nw-1941897994.jpg?ex=69298659&is=692834d9&hm=6863516ddddc63704866366f74249b638c3c535890846b77c7c93bf4e6b4d6c5&=&format=webp&width=488&height=229')
                        .setColor('#00FF00')] // Green for winners
                });

                giveaways.delete(message.channel.id);
            });

        } catch (error) {
            console.error(`Giveaway error: ${error}`);
        }
    }
};