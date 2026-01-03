const { 
    SimpleEmbed, 
    getUser, 
    gif, 
    cooldown, 
    toSuperscript 
} = require('../../functioon/function');
const moment = require('moment-timezone');
const asiaTimezone = 'Asia/Phnom_Penh';

const cooldowns = new Map();
let CDT = 9000;
let getId = [];
let cdId = [];
let prem = [];

module.exports = {
    name: 'buy',
    async execute(client, message, args) {
        try {
            const user = message.author;
            const userData = await getUser(user.id);

            if (userData.premium.premium_bool && !prem.includes(user.id)) {
                prem.push(user.id);
            }

            if (cooldown(user.id, getId, cdId, CDT, message, cooldowns, prem)) return;

            const buyid = parseInt(args[0]);
            if (isNaN(buyid)) {
                return message.reply({ embeds: [SimpleEmbed(`<@${user.id}> pls enter item ID!`)] });
            }

            const saveUserBalance = userData.balance;
            if (userData.balance == 0) userData.balance = saveUserBalance;

            // ─────────────────────────────────────
            // MAIN SHOP PURCHASES
            // ─────────────────────────────────────
            const mainItems = {
                1: { key: '777', price: 200, amount: 1 },
                2: { key: '999', price: 250, amount: 1 },
                3: { premium: true, price: 300 },
                4: { key: '050', price: 50, amount: 50 },
                5: { key: '100', price: 50, amount: 50 }
            };

            if (mainItems[buyid]) {
                const item = mainItems[buyid];

                if (item.premium) {
                    if (userData.premium.premium_bool) {
                        return message.reply({ embeds: [SimpleEmbed(`<@${user.id}> already has Premium Hemiko ${gif.premium_Hemiko}`)] });
                    }

                    if (userData.gold_coin < item.price) {
                        return message.reply({ embeds: [SimpleEmbed(`<@${user.id}> not enough gold coin!`)] });
                    }

                    userData.gold_coin -= item.price;
                    const now = moment.tz(asiaTimezone);
                    userData.premium.premium_bool = true;
                    userData.premium.premium_endDate = now.add(31, 'days');

                    await userData.save();
                    return message.channel.send({
                        embeds: [SimpleEmbed(`<@${user.id}> activated ${gif.premium_Hemiko} for ${gif.gold_coin} **${item.price}**`)]
                    });
                }

                // Normal item purchase
                if (userData.gold_coin < item.price) {
                    return message.reply({ embeds: [SimpleEmbed(`<@${user.id}> not enough gold coin!`)] });
                }

                userData.gold_coin -= item.price;
                userData.gem[item.key] += item.amount;

                await userData.save();
                return message.channel.send({
                    embeds: [SimpleEmbed(
                        `<@${user.id}> bought (${gif[item.key]}${toSuperscript(item.amount, item.amount)}) for ${gif.gold_coin} **${item.price}**`
                    )]
                });
            }

            // ─────────────────────────────────────
            // TICKET ITEMS
            // ─────────────────────────────────────
            const ticketItems = {
                6: { key: '014', price: 100 },
                7: { key: 'jjk', price: 1000, bg: 'jjk_bg' },
                8: { key: 'op', price: 1000, bg: 'op_bg' },
                9: { key: 'opm', price: 1000, bg: 'opm_bg' },
                12: { key: 'nt', price: 1000, bg: 'nt_bg' },
                14: { key: 'ms', price: 1000, bg: 'ms_bg' },
                17: { key: 'sl', price: 1500 }
            };

            if (ticketItems[buyid]) {
                const t = ticketItems[buyid];

                if (userData.gold_coin < t.price) {
                    return message.reply({ embeds: [SimpleEmbed(`<@${user.id}> not enough gold coin!`)] });
                }

                userData.gold_coin -= t.price;
                userData.gem[t.key] += 1;

                if (t.bg && !userData.bg.includes(t.bg)) {
                    userData.bg.push(t.bg);
                }

                await userData.save();
                return message.channel.send({
                    embeds: [SimpleEmbed(
                        `<@${user.id}> bought (${gif[t.key]}) for ${gif.gold_coin} **${t.price}**`
                    )]
                });
            }

        } catch (error) {
            console.log(`buy error: ${error}`);
        }
    }
};
