const { SimpleEmbed, gif, cooldown, getUser, toSuperscript } = require('../../functioon/function');
const { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const moment = require('moment-timezone');
const asiaTimezone = 'Asia/Phnom_Penh';

const cooldowns = new Map();
let CDT = 9_000;
var getId = [];
var cdId = [];
var prem = [];

module.exports = {
    name: 'shop',
    async execute(client, message, args) {
        try {
            const user = message.author;
            const userData = await getUser(user.id);

            if (userData.premium.premium_bool && !prem.includes(user.id)) {
                prem.push(user.id);
            }

            if (cooldown(user.id, getId, cdId, CDT, message, cooldowns, prem)) {
                return;
            }

            // ─────────────────────────────────────────────
            // PRICE CONSTANTS
            // ─────────────────────────────────────────────
            const wcl_price = 200;
            const wcf_price = 250;
            const lb_price = 50;
            const wc_price = 50;
            const premium_price = 300;
            const ticket_price = 1000;

            // ─────────────────────────────────────────────
            // SHOP ITEM DATA
            // ─────────────────────────────────────────────
            const shopData = {
                '01': {
                    name: 'Weapon Crate Legendary',
                    emoji: gif['777'],
                    bigEmoji: '<:weapon_crate_legendry:1436808868197040300>',
                    openingGif: gif.weapon_crate_legendary_opening_gif,
                    openedGif: gif.weapon_crate_legendary_opened_gif,
                    price: wcl_price,
                    quantity: toSuperscript(1, 1),
                    description: '⚔️ **Weapon Crate Legendary**\n\nA legendary weapon crate containing the rarest weapons!\n\n**Possible Drops:**\n• Legendary Swords\n• Legendary Bows\n• Legendary Staffs\n• And more!',
                    rarity: '⭐ Legendary',
                    gemKey: '777',
                    gemAmount: 1
                },
                '02': {
                    name: 'Weapon Crate Fabled',
                    emoji: gif['999'],
                    bigEmoji: '<a:weapon_crate_fableds:1436807719029047446>',
                    openingGif: gif.weapon_crate_fabled_opening_gif,
                    openedGif: gif.weapon_crate_fabled_opened_gif,
                    price: wcf_price,
                    quantity: toSuperscript(1, 1),
                    description: '🗡️ **Weapon Crate Fabled**\n\nA fabled weapon crate with mythical weapons!\n\n**Possible Drops:**\n• Fabled Swords\n• Fabled Axes\n• Fabled Spears\n• And more!',
                    rarity: '🌟 Fabled',
                    gemKey: '999',
                    gemAmount: 1
                },
                '03': {
                    name: 'Premium Hemiko',
                    emoji: gif.premium_Hemiko,
                    bigEmoji: '<a:premium_hemiko_big:1234567890123456791>',
                    price: premium_price,
                    description: '👑 **Premium Hemiko**\n\nUnlock premium status and enjoy exclusive benefits!\n\n**Benefits:**\n• Reduced cooldowns\n• Exclusive commands\n• Premium badge\n• 31 days duration',
                    rarity: '👑 Premium',
                    maxQty: 1,
                    isPremium: true
                },
                '04': {
                    name: 'Box',
                    emoji: gif['050'],
                    bigEmoji: '<:Box:1435716913673277694>',
                    openingGif: gif.box_gem_opening_gif,
                    openedGif: gif.box_gem_opened_gif,
                    price: lb_price,
                    quantity: toSuperscript(50, 50),
                    description: '📦 **Box**\n\nA mystery box containing random rewards!\n\n**Possible Rewards:**\n• Coins\n• Cards\n• Special items',
                    rarity: '📦 Common',
                    gemKey: '050',
                    gemAmount: 50
                },
                '05': {
                    name: 'Crate',
                    emoji: gif['100'],
                    bigEmoji: '<:Crate:1436796597123022990>',
                    openingGif: gif.crate_opening_gif,
                    openedGif: gif.crate_opened_gif,
                    price: wc_price,
                    quantity: toSuperscript(50, 50),
                    description: '📦 **Crate**\n\nA crate with various surprises inside!\n\n**Possible Rewards:**\n• Random items\n• Bonus coins\n• Rare drops',
                    rarity: '🔵 Common',
                    gemKey: '100',
                    gemAmount: 50
                },
                '06': {
                    name: 'Jujutsu Kaisen Ticket',
                    emoji: gif['jjk'],
                    bigEmoji: '<:ticket_jujutsu_kaisen:1436806614706421840>',
                    price: ticket_price,
                    description: '🎟️ **Jujutsu Kaisen Ticket**\n\nUnlock pets from the Jujutsu Kaisen universe!\n\n**Possible Pets:**\n• Gojo Satoru\n• Itadori Yuji\n• Sukuna\n• And more!',
                    rarity: '🎫 Ticket',
                    gemKey: 'jjk',
                    gemAmount: 1,
                    bgKey: 'jjk_bg'
                },
                '07': {
                    name: 'One Piece Ticket',
                    emoji: gif['op'],
                    bigEmoji: '<:ticket_one_piece:1437630923356110974>',
                    price: ticket_price,
                    description: '🎟️ **One Piece Ticket**\n\nUnlock pets from the One Piece universe!\n\n**Possible Pets:**\n• Luffy\n• Zoro\n• Shanks\n• And more!',
                    rarity: '🎫 Ticket',
                    gemKey: 'op',
                    gemAmount: 1,
                    bgKey: 'op_bg'
                },
                '08': {
                    name: 'One Punch Man Ticket',
                    emoji: gif['opm'],
                    bigEmoji: '<:ticket_one_punch_man:1440930759128125554>',
                    price: ticket_price,
                    description: '🎟️ **One Punch Man Ticket**\n\nUnlock pets from the One Punch Man universe!\n\n**Possible Pets:**\n• Saitama\n• Genos\n• Tatsumaki\n• And more!',
                    rarity: '🎫 Ticket',
                    gemKey: 'opm',
                    gemAmount: 1,
                    bgKey: 'opm_bg'
                },
                '09': {
                    name: 'Naruto Ticket',
                    emoji: gif['nt'],
                    bigEmoji: '<:naruto_ticket:1436806612911259708>',
                    price: ticket_price,
                    description: '🎟️ **Naruto Ticket**\n\nUnlock pets from the Naruto universe!\n\n**Possible Pets:**\n• Naruto\n• Sasuke\n• Kakashi\n• And more!',
                    rarity: '🎫 Ticket',
                    gemKey: 'nt',
                    gemAmount: 1,
                    bgKey: 'nt_bg'
                },
                '10': {
                    name: 'Mashle Ticket',
                    emoji: gif['ms'],
                    bigEmoji: '<:ticket_mashle:1440679025415684247>',
                    price: ticket_price,
                    description: '🎟️ **Mashle Ticket**\n\nUnlock pets from the Mashle universe!\n\n**Possible Pets:**\n• Mash Burnedead\n• Lance Crown\n• And more!',
                    rarity: '🎫 Ticket',
                    gemKey: 'ms',
                    gemAmount: 1,
                    bgKey: 'ms_bg'
                },
                '11': {
                    name: 'Solo Leveling Ticket',
                    emoji: gif['sl'],
                    bigEmoji: '<:ticket_solo_leveling:1440709389144297472>',
                    price: 1500,
                    description: '🎟️ **Solo Leveling Ticket**\n\nUnlock pets from the Solo Leveling universe!\n\n**Possible Pets:**\n• Sung Jin-Woo\n• Igris\n• Beru\n• And more!',
                    rarity: '🎫 Premium Ticket',
                    gemKey: 'sl',
                    gemAmount: 1
                }
            };

            // Track selected item and quantity
            let selectedItemId = null;
            let selectedQty = 1;

            // ─────────────────────────────────────────────
            // HELPER: Get emoji string safely
            // ─────────────────────────────────────────────
            const getEmojiDisplay = (emojiString) => {
                if (!emojiString || typeof emojiString !== 'string') return '';
                return emojiString;
            };

            // ─────────────────────────────────────────────
            // HELPER: Extract emoji for select menu
            // ─────────────────────────────────────────────
            const getEmojiForSelect = (emojiString) => {
                if (!emojiString || typeof emojiString !== 'string') return undefined;
                const match = emojiString.match(/<a?:(\w+):(\d+)>/);
                if (match) {
                    return { name: match[1], id: match[2] };
                }
                return undefined;
            };

            // ─────────────────────────────────────────────
            // BUILD SHOP LIST
            // ─────────────────────────────────────────────
            const shopItems = [
                `\`ID: 01\` (${getEmojiDisplay(shopData['01'].emoji)}${shopData['01'].quantity || ''}) — Price: ${getEmojiDisplay(gif.gold_coin)} **${shopData['01'].price}**`,
                `\`ID: 02\` (${getEmojiDisplay(shopData['02'].emoji)}${shopData['02'].quantity || ''}) — Price: ${getEmojiDisplay(gif.gold_coin)} **${shopData['02'].price}**`,
                `\`ID: 03\` (${getEmojiDisplay(shopData['03'].emoji)}) — Price: ${getEmojiDisplay(gif.gold_coin)} **${shopData['03'].price}**`,
                `\`ID: 04\` (${getEmojiDisplay(shopData['04'].emoji)}${shopData['04'].quantity || ''}) — Price: ${getEmojiDisplay(gif.gold_coin)} **${shopData['04'].price}**`,
                `\`ID: 05\` (${getEmojiDisplay(shopData['05'].emoji)}${shopData['05'].quantity || ''}) — Price: ${getEmojiDisplay(gif.gold_coin)} **${shopData['05'].price}**`,
                "━━━━━━━━━━━TICKET FOR PET━━━━━━━━━━━",
                `\`ID: 06\` (${getEmojiDisplay(shopData['06'].emoji)}) — Price: ${getEmojiDisplay(gif.gold_coin)} **${shopData['06'].price}**`,
                `\`ID: 07\` (${getEmojiDisplay(shopData['07'].emoji)}) — Price: ${getEmojiDisplay(gif.gold_coin)} **${shopData['07'].price}**`,
                `\`ID: 08\` (${getEmojiDisplay(shopData['08'].emoji)}) — Price: ${getEmojiDisplay(gif.gold_coin)} **${shopData['08'].price}**`,
                `\`ID: 09\` (${getEmojiDisplay(shopData['09'].emoji)}) — Price: ${getEmojiDisplay(gif.gold_coin)} **${shopData['09'].price}**`,
                `\`ID: 10\` (${getEmojiDisplay(shopData['10'].emoji)}) — Price: ${getEmojiDisplay(gif.gold_coin)} **${shopData['10'].price}**`,
                `\`ID: 11\` (${getEmojiDisplay(shopData['11'].emoji)}) — Price: ${getEmojiDisplay(gif.gold_coin)} **${shopData['11'].price}**`
            ].join("\n");

            // ─────────────────────────────────────────────
            // SELECT MENU - ITEMS
            // ─────────────────────────────────────────────
            const buildItemSelect = () => {
                const options = Object.entries(shopData).map(([id, item]) => {
                    const option = {
                        label: item.name,
                        description: `Price: ${item.price} coins | ${item.rarity}`,
                        value: id,
                        default: selectedItemId === id
                    };

                    const emoji = getEmojiForSelect(item.emoji);
                    if (emoji) {
                        option.emoji = emoji;
                    }

                    return option;
                });

                return new StringSelectMenuBuilder()
                    .setCustomId('shop_item_select')
                    .setPlaceholder('🛒 Select an item to view details...')
                    .addOptions(options);
            };

            // ─────────────────────────────────────────────
            // SELECT MENU - QUANTITY
            // ─────────────────────────────────────────────
            const buildQtySelect = (maxQty = 5) => {
                const options = [];
                for (let i = 1; i <= maxQty; i++) {
                    options.push({
                        label: `Quantity: ${i}`,
                        description: selectedItemId ? `Total: ${shopData[selectedItemId].price * i} coins` : `Buy ${i} item(s)`,
                        value: i.toString(),
                        emoji: '📦',
                        default: selectedQty === i
                    });
                }
                return new StringSelectMenuBuilder()
                    .setCustomId('shop_qty_select')
                    .setPlaceholder('📦 Select quantity...')
                    .setDisabled(!selectedItemId)
                    .addOptions(options);
            };

            // ─────────────────────────────────────────────
            // BUY BUTTON
            // ─────────────────────────────────────────────
            const buildBuyButton = () => {
                const item = selectedItemId ? shopData[selectedItemId] : null;
                const totalPrice = item ? item.price * selectedQty : 0;

                return new ButtonBuilder()
                    .setCustomId('shop_buy')
                    .setLabel(item ? `Buy ${selectedQty}x ${item.name} — ${totalPrice} coins` : 'Select an item first')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('💰')
                    .setDisabled(!selectedItemId);
            };

            // ─────────────────────────────────────────────
            // BUILD ROWS
            // ─────────────────────────────────────────────
            const buildRows = () => {
                const maxQty = selectedItemId && shopData[selectedItemId].maxQty ? shopData[selectedItemId].maxQty : 5;
                return [
                    new ActionRowBuilder().addComponents(buildItemSelect()),
                    new ActionRowBuilder().addComponents(buildQtySelect(maxQty)),
                    new ActionRowBuilder().addComponents(buildBuyButton())
                ];
            };

            // ─────────────────────────────────────────────
            // BUILD DETAIL EMBED
            // ─────────────────────────────────────────────
            const buildDetailEmbed = () => {
                const item = shopData[selectedItemId];
                const totalPrice = item.price * selectedQty;

                return SimpleEmbed(item.description)
                    .setAuthor({
                        name: item.name,
                        iconURL: client.user.displayAvatarURL()
                    })
                    .setTitle(`${getEmojiDisplay(item.bigEmoji)} Item Details`)
                    .addFields(
                        { name: '💰 Unit Price', value: `${getEmojiDisplay(gif.gold_coin)} **${item.price}**`, inline: true },
                        { name: '📦 Quantity', value: `**${selectedQty}**`, inline: true },
                        { name: '💵 Total Price', value: `${getEmojiDisplay(gif.gold_coin)} **${totalPrice}**`, inline: true },
                        { name: '✨ Rarity', value: item.rarity, inline: true },
                        { name: '🆔 Item ID', value: `\`${selectedItemId}\``, inline: true },
                        { name: '💳 Your Balance', value: `${getEmojiDisplay(gif.gold_coin)} **${userData.gold_coin || 0}**`, inline: true }
                    )
                    .setFooter({ text: 'Click the Buy button below to purchase!' })
                    .setTimestamp();
            };

            // ─────────────────────────────────────────────
            // BUILD SHOP EMBED
            // ─────────────────────────────────────────────
            const buildShopEmbed = () => {
                return SimpleEmbed(shopItems)
                    .setAuthor({
                        name: client.user.displayName,
                        iconURL: client.user.displayAvatarURL()
                    })
                    .setTitle("=========== FULL SHOP ===========")
                    .setFooter({ text: '🛒 Select an item below to view details!' })
                    .setTimestamp();
            };

            // ─────────────────────────────────────────────
            // SEND SHOP MESSAGE
            // ─────────────────────────────────────────────
            const shopMessage = await message.channel.send({
                embeds: [buildShopEmbed()],
                components: buildRows()
            });

            // ─────────────────────────────────────────────
            // COLLECTOR
            // ─────────────────────────────────────────────
            const collector = shopMessage.createMessageComponentCollector({
                filter: (i) => i.user.id === user.id,
                time: 120_000
            });

            collector.on('collect', async (interaction) => {
                try {
                    // Handle Item Selection
                    if (interaction.customId === 'shop_item_select') {
                        selectedItemId = interaction.values[0];
                        selectedQty = 1;

                        const maxQty = shopData[selectedItemId].maxQty || 5;
                        if (selectedQty > maxQty) selectedQty = maxQty;

                        await interaction.update({
                            embeds: [buildDetailEmbed()],
                            components: buildRows()
                        });
                    }

                    // Handle Quantity Selection
                    else if (interaction.customId === 'shop_qty_select') {
                        selectedQty = parseInt(interaction.values[0]);

                        await interaction.update({
                            embeds: [buildDetailEmbed()],
                            components: buildRows()
                        });
                    }

                    // Handle Buy Button
                    else if (interaction.customId === 'shop_buy') {
                        const item = shopData[selectedItemId];
                        const totalPrice = item.price * selectedQty;

                        // Refresh user data for accurate balance
                        const freshUserData = await getUser(user.id);
                        const currentBalance = freshUserData?.gold_coin || 0;

                        // Check if user has enough balance
                        if (currentBalance < totalPrice) {
                            return interaction.reply({
                                content: `❌ You don't have enough coins!\n💰 Required: **${totalPrice}** coins\n💳 Your Balance: **${currentBalance}** coins`,
                                ephemeral: true
                            });
                        }

                        // ─────────────────────────────────────
                        // HANDLE PREMIUM PURCHASE
                        // ─────────────────────────────────────
                        if (item.isPremium) {
                            if (freshUserData.premium.premium_bool) {
                                return interaction.reply({
                                    content: `❌ You already have Premium Hemiko ${getEmojiDisplay(gif.premium_Hemiko)}!`,
                                    ephemeral: true
                                });
                            }

                            freshUserData.gold_coin -= totalPrice;
                            const now = moment.tz(asiaTimezone);
                            freshUserData.premium.premium_bool = true;
                            freshUserData.premium.premium_endDate = now.add(31, 'days');

                            await freshUserData.save();

                            await interaction.reply({
                                content: `✅ **Premium Activated!**\n\n${getEmojiDisplay(item.bigEmoji)} You activated **Premium Hemiko** for 31 days!\n💰 Cost: **${totalPrice}** coins\n⏰ Expires: <t:${Math.floor(freshUserData.premium.premium_endDate.valueOf() / 1000)}:R>`,
                                ephemeral: true
                            });

                            // Reset selection
                            selectedItemId = null;
                            selectedQty = 1;

                            await shopMessage.edit({
                                embeds: [buildShopEmbed()],
                                components: buildRows()
                            }).catch(() => {});

                            return;
                        }

                        // ─────────────────────────────────────
                        // HANDLE NORMAL ITEM PURCHASE
                        // ─────────────────────────────────────
                        freshUserData.gold_coin -= totalPrice;

                        // Add items to inventory
                        if (item.gemKey) {
                            const totalAmount = (item.gemAmount || 1) * selectedQty;
                            freshUserData.gem[item.gemKey] = (freshUserData.gem[item.gemKey] || 0) + totalAmount;
                        }

                        // Add background if applicable
                        if (item.bgKey && !freshUserData.bg.includes(item.bgKey)) {
                            freshUserData.bg.push(item.bgKey);
                        }

                        await freshUserData.save();

                        // Build purchase message
                        let purchaseMsg = `✅ **Purchase Successful!**\n\n${getEmojiDisplay(item.bigEmoji)} You bought **${selectedQty}x ${item.name}**\n💰 Total Cost: **${totalPrice}** coins`;
                        
                        if (item.gemKey) {
                            const totalAmount = (item.gemAmount || 1) * selectedQty;
                            purchaseMsg += `\n📦 Received: ${getEmojiDisplay(gif[item.gemKey])}${toSuperscript(totalAmount, totalAmount)}`;
                        }

                        if (item.bgKey && !freshUserData.bg.includes(item.bgKey)) {
                            purchaseMsg += `\n🖼️ Bonus: Unlocked ${item.name} background!`;
                        }

                        await interaction.reply({
                            content: purchaseMsg,
                            ephemeral: true
                        });

                        // Reset selection after purchase
                        selectedItemId = null;
                        selectedQty = 1;

                        await shopMessage.edit({
                            embeds: [buildShopEmbed()],
                            components: buildRows()
                        }).catch(() => {});
                    }
                } catch (err) {
                    console.error('Shop interaction error:', err);
                    await interaction.reply({
                        content: '❌ An error occurred. Please try again.',
                        ephemeral: true
                    }).catch(() => {});
                }
            });

            collector.on('end', async () => {
                try {
                    const disabledRows = [
                        new ActionRowBuilder().addComponents(
                            new StringSelectMenuBuilder()
                                .setCustomId('shop_item_select_disabled')
                                .setPlaceholder('⏱️ Menu expired')
                                .setDisabled(true)
                                .addOptions([{ label: 'Expired', value: 'expired' }])
                        ),
                        new ActionRowBuilder().addComponents(
                            new StringSelectMenuBuilder()
                                .setCustomId('shop_qty_select_disabled')
                                .setPlaceholder('⏱️ Menu expired')
                                .setDisabled(true)
                                .addOptions([{ label: 'Expired', value: 'expired' }])
                        ),
                        new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId('shop_buy_disabled')
                                .setLabel('⏱️ Menu expired')
                                .setStyle(ButtonStyle.Secondary)
                                .setDisabled(true)
                        )
                    ];

                    await shopMessage.edit({ components: disabledRows }).catch(() => {});
                } catch (err) {
                    // Silent fail on collector end
                }
            });

        } catch (error) {
            console.log(`shop error: ${error}`);
        }
    }
};