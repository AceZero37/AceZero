const { getUser, customEmbed, cooldown } = require('../../functioon/function');
const moment = require('moment-timezone');

const cooldowns = new Map();
let CDT = 9000;
let prem = [];

// Developer IDs (Unlimited)
const devList = [
    "741600112366583828"
];

// Staff IDs (Unlimited)
const staffList = [
    "999289601426473024",
    "755444094020354220",
    "1035177417922318407",
    "1418966914650210357",
];

// VIP List (Unlimited) - Add your VIP user IDs here
const vipList = [
    "840122291068338188",
    "1420798326382788650",
    "1343917859923038268",
];

module.exports = {
    name: 'cash',
    async execute(client, message, args) {
        try {
            const user = message.author;
            // Get Author Data (for cooldowns and permission check)
            const authorData = await getUser(user.id);
            if (!authorData) return;

            // Premium cooldown reduction support
            if (authorData.premium.premium_bool) {
                if (!prem.includes(user.id)) prem.push(user.id);
            }

            // Cooldown check (Always checks the person running the command)
            if (cooldown(user.id, [], [], CDT, message, cooldowns, prem)) return;

            // Handle Mentions (Staff/Dev Check)
            const mention = message.mentions.users.first();

            let targetUser = user;
            let targetData = authorData;

            if (mention) {
                const isAuthorDev = devList.includes(user.id);
                const isAuthorStaff = staffList.includes(user.id);

                // Only Dev and Staff can check others
                if (isAuthorDev || isAuthorStaff) {
                    targetUser = mention;
                    targetData = await getUser(targetUser.id);

                    if (!targetData) {
                        const noDataEmbed = customEmbed()
                            .setColor('#FF0000')
                            .setDescription(`❌ **${targetUser.username}** has no data in the database.`)
                            .setTimestamp();
                        return message.channel.send({ embeds: [noDataEmbed] });
                    }
                } else {
                    // === FUNNY KHMER REPLIES FOR NORMAL/VIP USERS ===
                    const funnyReplies = [
                        // Basic Roasts
                        '❌ ទំនេរមែនដើរមើលលុយគេនឺង! រកលុយខ្លួនឯងទៅ!',
                        '❌ មើលលុយខ្លួនឯងទៅ! លុយគេទុកអោយគេមើល!',
                        '❌ ចង់ដឹងលុយគេធ្វើអី? ចង់សុំគេចាយមែន?',
                        '❌ កុំចេះ! លុយគេទេ!',
                        '❌ អត់លុយចាយមែន បានដើរមើលលុយគេ? ខំរកទៅកុំច្រណែនគេ!',
                        '❌ ស្មានតែមើលលុយគេហើយបានលុយមែន? អត់ទេ!',
                        '❌ ឃើញគេមានលុយច្រើន ចង់មកកេមែន? យី!',
                        '❌ ទៅរកការងារធ្វើទៅ កុំនៅទំនេរដើរឆែកលុយគេ!',
                        '❌ បើគេមានលុយច្រើន ក៏គេមិនចែកយើងដែរ កុំចង់ដឹងអី!',
                        '❌ មើលលុយគេធ្វើអី? មានបានកម្រៃជើងសារអត់?',

                        // Sarcastic / Aggressive
                        '❌ គិតរឿងខ្លួនឯងទៅ កុំចេះដឹងរឿងអ្នកដទៃពេក!',
                        '❌ ច្រណែនគេមែន? ខំរកដែរទៅនឹងមានដូចគេហើយ!',
                        '❌ ខ្ញុំមិនប្រាប់ទេ! ព្រោះអ្នកមិនមែនជាម្ចាស់លុយ!',
                        '❌ ចង់ដឹងទៅសួរម្ចាស់គេខ្លួនឯងទៅ កុំមកសួរខ្ញុំ!',
                        '❌ Error 404: គ្មានសិទ្ធិមើលលុយអ្នកដទៃ!',
                        '❌ កុំចង់ដឹងពេក! នាំតែឈឺក្បាលទេ!',
                        '❌ មើលហើយមានអារម្មណ៍ថាខ្លួនឯងក្រមែន? ហាហា!',
                        '❌ គេអ្នកមាន គេអ្នកក្រ រឿងរបស់គេ! យើងអ្នកមើលនៅស្ងៀម!',
                        '❌ ទីនេះមិនមែនកន្លែងស៊ើបអង្កេតទេ!',
                        '❌ ប្រយ័ត្នម្ចាស់គេប្តឹងប៉ូលិស ពីបទលួចមើលលុយ!',

                        // Short & Funny
                        '❌ No! មិនអោយមើល!',
                        '❌ ហាមមើល! របស់គេមានម្ចាស់!',
                        '❌ ទៅដេកទៅ! កុំចេះ!',
                        '❌ អត់ប្រាប់! ធ្វើអីខ្ញុំ?',
                        '❌ សុំលុយម៉ែចាយសិនទៅ កុំមកមើលលុយគេ!',
                        '❌ លុយគេ សាច់គេ កុំឈឺឆ្អាល!',
                        '❌ ហេ! ដៃរពឹសម្ល៉េះ?',
                        '❌ ចង់ឃើញណាស់មែន? ដាក់ ១០$ មកប្រាប់!',
                        '❌ ម៉ែប្រើទៅទិញទឹកត្រី មិនទៅទេ មកដើរមើលលុយគេ!',
                        '❌ ដេកយល់សប្តិយកទៅ បើចង់ឃើញ!',

                        // "Mind Your Business" Variations
                        '❌ រឿងអ្នកមាន យើងកុំចេះ!',
                        '❌ លុយគេរកបានដោយញើសឈាម មិនមែនសំរាប់អោយអ្នកមើលទេ!',
                        '❌ ទំនេរណាស់ហ្អេ៎? ទៅបោសផ្ទះទៅ!',
                        '❌ មើលទៅបានត្រឹមតែការឈឺចាប់ទេ ព្រោះគេមានជាង!',
                        '❌ កុំមកអើត! មិនមែនផ្ទះខ្លួនឯងទេ!',
                        '❌ ប្រព័ន្ធការពារសុវត្ថិភាពបានដំណើរការ! ហាមចូល!',
                        '❌ ខ្ញុំជា Bot ក៏ចេះធុញដែរណា ដើរឆែកគេរហូត!',
                        '❌ ឈប់! ដាក់ទូរស័ព្ទចុះ ហើយទៅរកលុយ!',
                        '❌ ជីវិតគេ គេមានលុយ! ជីវិតយើង មានតែបំណុល!',
                        '❌ កុំយកភ្នែកដ៏ស្រស់ស្អាតរបស់អ្នក មកមើលលុយរបស់អ្នកដទៃ!',

                        // Extra Roasts
                        '❌ ចង់ដឹងមែន? ទៅសួរគ្រូទាយទៅ!',
                        '❌ មើលលុយគេមិនធ្វើអោយអ្នកមានទេ!',
                        '❌ គេខំរកណាស់ ទើបគេមាន! ចុះអ្នកឯង?',
                        '❌ សុំទោស ខ្ញុំរវល់ មិនទំនេរអោយអ្នកមើលទេ!',
                        '❌ មិនបាច់ដឹងទេ នាំតែតូចចិត្ត!',
                        '❌ មើលមុខខ្លួនឯងក្នុងកញ្ចក់សិន មុននឹងមើលលុយគេ!',
                        '❌ ស្អីគេនឹង? ចេះដឹងរឿងគេម៉េះ?',
                        '❌ ទុកពេលមកមើលលុយគេ ទៅរៀនយកចំណេះដឹងល្អជាង!',
                        '❌ គេមានលុយ គេទិញឡាន! យើងអត់លុយ បានត្រឹមមើល!',
                        '❌ លេខសម្ងាត់គឺ... ប្រាប់អោយឆោត!',
                        '❌ ទីនេះមានកាមេរ៉ាសុវត្ថិភាព ហាមលួចមើល!',
                        '❌ កុំប៉ះពាល់! របស់មានតម្លៃ!',
                        '❌ ទៅលេងកន្លែងផ្សេងទៅ កុំមកលេងកន្លែងលុយ!',
                        '❌ អ្នកមិនមែនជាបុគ្គលិកធនាគារទេ កុំមកឆែក!',
                        '❌ ចាំជាតិក្រោយ ចាំមកមើលទៀត ឥឡូវទៅដេកសិន!',
                        '❌ អត់ប្រាប់! ចង់ធ្វើអី?',
                        '❌ ហេតុអ្វីអ្នកចង់ដឹង? ដើម្បីអ្វី? ដើម្បីអ្នកណា?',
                        '❌ ទៅរកលុយដាក់កាបូបខ្លួនឯងទៅ ប្រយ័ត្នដាច់លុយចាយ!'
                    ];

                    // Pick a random funny reply
                    const randomMsg = funnyReplies[Math.floor(Math.random() * funnyReplies.length)];

                    const errorEmbed = customEmbed()
                        .setColor('#FF0000')
                        .setDescription(randomMsg)
                        .setTimestamp();
                    return message.channel.send({ embeds: [errorEmbed] });
                }
            }

            // ==========================================================
            // LOGIC BELOW USES targetUser and targetData
            // ==========================================================

            // User category (Based on the TARGET)
            const isDev = devList.includes(targetUser.id);
            const isStaff = staffList.includes(targetUser.id);
            const isVIP = vipList.includes(targetUser.id);
            const isPremium = targetData.premium.premium_bool;

            // Time reset (00:00 Cambodia)
            const now = moment.tz('Asia/Phnom_Penh');
            const resetTime = moment.tz('Asia/Phnom_Penh').startOf('day').add(24, 'hours'); // 00:00 next day

            // Reset daily values if needed
            if (!targetData.next_day || now > targetData.next_day) {
                targetData.next_day = resetTime;
                targetData.daily_pay = 0;
                targetData.daily_receive = 0;
                targetData.balance_limit = 0;
                targetData.balance_main_limit = 0;
                await targetData.save();
            }

            // Daily limit based on level
            const level = targetData.levelSystem.level;
            let baseLimit = level * 1_000_000;

            // Unlimited users: Dev, Staff, VIP, OR Premium
            const unlimited = isDev || isStaff || isVIP || isPremium;

            // Premium (now Unlimited) or Legacy multiplier logic
            const multiplier = 1; // Multiplier is irrelevant if unlimited is true
            const finalLimit = unlimited ? Infinity : (baseLimit * multiplier);

            // Used amounts
            const usedPay = unlimited ? 0 : (targetData.daily_pay || 0);
            const usedReceive = unlimited ? 0 : (targetData.daily_receive || 0);

            // Time remaining until reset
            const msLeft = resetTime - now;
            const hours = Math.floor(msLeft / (1000 * 60 * 60));
            const minutes = Math.floor((msLeft % (1000 * 60 * 60)) / (1000 * 60));

            // HEADER with custom emojis
            let limitHeader = "";
            if (isDev) {
                limitHeader = "**📊 Daily Transfer Limit — <a:orange_verify:1441643784776585226> Developer (Unlimited)**";
            } else if (isStaff) {
                limitHeader = "**📊 Daily Transfer Limit — <a:orange_verify:1441643784776585226> Staff (Unlimited)**";
            } else if (isVIP) {
                limitHeader = "**📊 Daily Transfer Limit — <a:verify:1441629070726267041> VIP (Unlimited)**";
            } else if (isPremium) {
                limitHeader = `**📊 Daily Transfer Limit — <a:verify:1441629070726267041> Premium (Unlimited)**`;
            } else {
                limitHeader = `**📊 Daily Transfer Limit — Level ${level}**`;
            }

            // BODY
            const limitBody = unlimited
                ? `**📤 OUT:** \`NO LIMIT\`\n**📥 IN:** \`NO LIMIT\`\n`
                : `**📤 OUT:** \`${usedPay.toLocaleString()}\` / \`${finalLimit.toLocaleString()}\`\n`
                + `**📥 IN:** \`${usedReceive.toLocaleString()}\` / \`${finalLimit.toLocaleString()}\`\n`;

            // FOOTER
            const footerText = unlimited
                ? `Unlimited user • Reset still happens at 00:00 Cambodia`
                : `Reset in ${hours}h ${minutes}m`;

            // Embed color
            let embedColor = '#FFD700'; // Default
            if (isDev) embedColor = '#00FF9E';
            else if (isStaff) embedColor = '#00C8FF';
            else if (isVIP) embedColor = '#FFD700';
            else if (isPremium) embedColor = '#FFD000';

            // Embed
            const embed = customEmbed()
                .setColor(embedColor)
                .setAuthor({
                    name: `${targetUser.username}'s Wallet`,
                    iconURL: targetUser.displayAvatarURL({ dynamic: true })
                })
                .setDescription(
                    `<:dollar:1438135127673798657> **Money:** \`${targetData.balance.toLocaleString()}\` $\n` +
                    `<:gold:1438135130177671280> **Gold:** \`${targetData.gold_coin.toLocaleString()}\` Gold\n` +
                    `━━━━━━━━━━━━━━━━━━━━━━\n` +
                    `${limitHeader}\n` +
                    `${limitBody}` +
                    `━━━━━━━━━━━━━━━━━━━━━━\n` +
                    `${footerText}`
                )
                .setFooter({
                    text: `Daily reset at 12:00 AM | Phnom Penh`,
                    iconURL: user.displayAvatarURL({ dynamic: true })
                })
                .setTimestamp();

            message.channel.send({ embeds: [embed] });

        } catch (error) {
            console.log(`cash command error ${error}`);
        }
    },
};