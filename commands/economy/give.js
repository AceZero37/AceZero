// commands/economy/give.js
const {
  getUser,
  SimpleEmbed,
  labelButton,
  twoButton,
  ButtonStyle,
  customEmbed,
  getCollectionButton,
  cooldown
} = require('../../functioon/function');
const moment = require('moment-timezone');

const cooldowns = new Map();
let CDT = 20_000;
const getId = [];
const cdId = [];
const prem = [];

// IDs
const devList = [
  "741600112366583828" // developer (verify + unlimited)
];

const staffList = [
  "999289601426473024",
  "755444094020354220",
  "1035177417922318407",
  "1418966914650210357",
];

// VIP List - Add your VIP user IDs here (unlimited like dev/staff)
const vipList = [
  "840122291068338188",
  "1420798326382788650",
  "1343917859923038268"
];

// Emojis
const ORANGE_VERIFY = '<a:orange_verify:1441643784776585226>'; // Dev & Staff
const VERIFY = '<a:200w:1443630359727050762>'; // Premium (now 2x)
const VIP_BADGE = '<a:verify:1441629070726267041>'; // VIP badge

// Log channel
const LOG_CHANNEL_ID = '1298271820536877076';

// Reset hour in Phnom Penh timezone (midnight)
const RESET_HOUR = 0;

module.exports = {
  name: 'give',
  async execute(client, message, args) {
    try {
      const author = message.author;
      const authorId = author.id;

      // Load author data
      let userData = await getUser(authorId);
      if (!userData) {
        return message.reply({ embeds: [SimpleEmbed("You don't have an account yet.")] });
      }

      // Add to premium list for cooldown helper if premium
      if (userData.premium && userData.premium.premium_bool) {
        if (!prem.includes(authorId)) prem.push(authorId);
      }

      // Cooldown check
      if (cooldown(authorId, getId, cdId, CDT, message, cooldowns, prem)) return;

      // Time calculations: next reset at midnight Phnom Penh
      const now = moment.tz('Asia/Phnom_Penh');
      const nextReset = moment.tz('Asia/Phnom_Penh').startOf('day').add(1, 'day').hour(RESET_HOUR).minute(0).second(0).millisecond(0);

      // Ensure daily counters for sender are reset if needed
      if (!userData.next_day || moment(userData.next_day).isBefore(nextReset)) {
        userData.next_day = nextReset.toDate();
        userData.daily_pay = 0;
        userData.daily_receive = 0;
        try { await userData.save(); } catch (e) { console.warn("save error:", e); }
      }

      // Mention and amount extraction
      const mention = message.mentions.users.first();
      if (!mention) {
        return message.reply({ embeds: [SimpleEmbed('❌ Please mention a user to give money to.')] });
      }
      if (mention.id === authorId) {
        return message.reply({ embeds: [SimpleEmbed('❌ You cannot give to yourself.')] });
      }

      // amountArg: attempt to pick the first non-mention argument
      let amountRaw = args.find(a => a && !a.includes('<@'));
      if (!amountRaw) amountRaw = args[1] || args[0];
      if (!amountRaw) {
        return message.reply({ embeds: [SimpleEmbed('❌ Please specify an amount. Example: `give @user 1000` or `give @user 50k`')] });
      }

      // parse amount with k/m support
      function parseAmount(str) {
        if (!str) return NaN;
        const cleaned = String(str).replace(/,/g, '').trim();
        const suffixMatch = cleaned.match(/^([0-9]*\.?[0-9]+)\s*([kKmM])?$/);
        if (!suffixMatch) return NaN;
        let num = parseFloat(suffixMatch[1]);
        if (isNaN(num)) return NaN;
        const suf = (suffixMatch[2] || '').toLowerCase();
        if (suf === 'k') num *= 1000;
        if (suf === 'm') num *= 1000000;
        return Math.floor(num);
      }

      let amount = parseAmount(amountRaw);
      if (isNaN(amount) || amount <= 0) {
        return message.reply({ embeds: [SimpleEmbed('❌ Invalid amount. Use numbers like `1000`, `50k`, or `2m`.')] });
      }

      // Load target data
      let targetData = await getUser(mention.id);
      if (!targetData) {
        return message.reply({ embeds: [SimpleEmbed(`<@${mention.id}> doesn't have a Hemiko account.`)] });
      }

      // Ensure target daily counters reset if needed
      if (!targetData.next_day || moment(targetData.next_day).isBefore(nextReset)) {
        targetData.next_day = nextReset.toDate();
        targetData.daily_pay = 0;
        targetData.daily_receive = 0;
        try { await targetData.save(); } catch (e) { console.warn("save target reset error:", e); }
      }

      // Roles/exemptions
      const senderIsDev = devList.includes(authorId);
      const senderIsStaff = staffList.includes(authorId);
      const senderIsVIP = vipList.includes(authorId);
      const senderIsPremium = !!(userData.premium && userData.premium.premium_bool);
      // Only dev, staff, VIP, AND Premium get unlimited
      const senderIsUnlimited = senderIsDev || senderIsStaff || senderIsVIP || senderIsPremium;

      const receiverIsDev = devList.includes(mention.id);
      const receiverIsStaff = staffList.includes(mention.id);
      const receiverIsVIP = vipList.includes(mention.id);
      const receiverIsPremium = !!(targetData.premium && targetData.premium.premium_bool);
      // Only dev, staff, VIP, AND Premium get unlimited
      const receiverIsUnlimited = receiverIsDev || receiverIsStaff || receiverIsVIP || receiverIsPremium;

      // If ANY party has unlimited, skip all daily limit checks and counters
      const skipDailyLimits = senderIsUnlimited || receiverIsUnlimited;

      // Compute limits (1_000_000 per level, Unlimited for premium now)
      const senderLevel = Math.max(1, (userData.levelSystem?.level || 1));
      const receiverLevel = Math.max(1, (targetData.levelSystem?.level || 1));

      const baseSenderLimit = 1_000_000 * senderLevel;
      const baseReceiverLimit = 1_000_000 * receiverLevel;

      // Premium is now unlimited, so multiplier is 1 (irrelevant)
      const senderMultiplier = 1;
      const receiverMultiplier = 1;

      const senderLimit = senderIsUnlimited ? Infinity : (baseSenderLimit * senderMultiplier);
      const receiverLimit = receiverIsUnlimited ? Infinity : (baseReceiverLimit * receiverMultiplier);

      // Remaining quotas
      const senderSentToday = userData.daily_pay || 0;
      const receiverReceivedToday = targetData.daily_receive || 0;

      const senderRemaining = senderLimit === Infinity ? Infinity : Math.max(0, senderLimit - senderSentToday);
      const receiverRemaining = receiverLimit === Infinity ? Infinity : Math.max(0, receiverLimit - receiverReceivedToday);

      // Balance check
      if (amount > userData.balance) {
        return message.reply({ embeds: [SimpleEmbed(`**<@${authorId}> you don't have enough cash.** You have \`${userData.balance.toLocaleString()}\` <:dollar:1438135127673798657>.`)] });
      }

      // Calculate allowed amount
      let allowedAmount = amount;

      // Only apply limits if NO unlimited user is involved
      if (!skipDailyLimits) {
        if (senderRemaining !== Infinity) {
          allowedAmount = Math.min(allowedAmount, senderRemaining);
        }
        if (receiverRemaining !== Infinity) {
          allowedAmount = Math.min(allowedAmount, receiverRemaining);
        }
      }

      if (allowedAmount <= 0) {
        const timeUntilResetMs = moment(nextReset).diff(now);
        const hrs = Math.floor(timeUntilResetMs / (1000 * 60 * 60));
        const mins = Math.floor((timeUntilResetMs % (1000 * 60 * 60)) / (1000 * 60));
        return message.reply({
          embeds: [customEmbed()
            .setColor('#FF0000')
            .setTitle('🚫 Transfer Not Allowed')
            .setDescription(
              `You or the recipient have hit your daily limit.\n` +
              `⏰ Resets in: ${hrs}h ${mins}m\n` +
              `📤 Your remaining (OUT): ${senderRemaining === Infinity ? '∞' : senderRemaining.toLocaleString()}\n` +
              `📥 Receiver remaining (IN): ${receiverRemaining === Infinity ? '∞' : receiverRemaining.toLocaleString()}`
            )]
        });
      }

      const finalAmount = allowedAmount;

      // Get sender badge
      const getSenderBadge = () => {
        if (senderIsDev) return `${ORANGE_VERIFY} Developer`;
        if (senderIsStaff) return `${ORANGE_VERIFY} Staff`;
        if (senderIsVIP) return `${VIP_BADGE} VIP`;
        if (senderIsPremium) return `${VIP_BADGE} Premium (Unlimited)`;
        return `Level ${senderLevel}`;
      };

      // Get receiver badge
      const getReceiverBadge = () => {
        if (receiverIsDev) return `${ORANGE_VERIFY} Developer`;
        if (receiverIsStaff) return `${ORANGE_VERIFY} Staff`;
        if (receiverIsVIP) return `${VIP_BADGE} VIP`;
        if (receiverIsPremium) return `${VERIFY} Premium (2x)`;
        return `Level ${receiverLevel}`;
      };

      // Display info
      const senderLimitDisplay = senderIsUnlimited ? 'NO LIMIT' : senderLimit.toLocaleString();
      const receiverLimitDisplay = receiverIsUnlimited ? 'NO LIMIT' : receiverLimit.toLocaleString();
      const senderRemainingDisplay = senderIsUnlimited ? 'NO LIMIT' : senderRemaining.toLocaleString();
      const receiverRemainingDisplay = receiverIsUnlimited ? 'NO LIMIT' : receiverRemaining.toLocaleString();

      // Note about special transaction
      let specialNote = '';
      if (skipDailyLimits) {
        specialNote = `\n⭐ **Unlimited transaction** — No daily limits or counters applied`;
      }

      const confirmEmbed = customEmbed()
        .setAuthor({ name: `${author.username} → ${mention.username}`, iconURL: author.displayAvatarURL({ dynamic: true }) })
        .setColor('#00BFFF')
        .setThumbnail(mention.displayAvatarURL({ dynamic: true }))
        .setDescription(
          `Confirm to send **\`${finalAmount.toLocaleString()}\` <:dollar:1438135127673798657>** to <@${mention.id}>.\n\n` +
          `💸 Amount: \`${finalAmount.toLocaleString()}\` <:dollar:1438135127673798657>\n` +
          `💰 Your Balance: \`${userData.balance.toLocaleString()}\`\n\n` +
          `📤 **Sender (OUT):** ${getSenderBadge()}\n` +
          `├ Limit: \`${senderLimitDisplay}\`\n` +
          `└ Remaining: \`${senderRemainingDisplay}\`\n\n` +
          `📥 **Receiver (IN):** ${getReceiverBadge()}\n` +
          `├ Limit: \`${receiverLimitDisplay}\`\n` +
          `└ Remaining: \`${receiverRemainingDisplay}\`` +
          specialNote + `\n\n` +
          `Click ✅ to confirm or ❎ to cancel.`
        )
        .setFooter({ text: `Resets at 00:00 (midnight) Phnom Penh` })
        .setTimestamp();

      const confirmButton = labelButton('give_confirm', '✅ Confirm', ButtonStyle.Success);
      const cancelButton = labelButton('give_cancel', '❎ Cancel', ButtonStyle.Danger);
      const allButtons = twoButton(confirmButton, cancelButton);

      const confirmMessage = await message.channel.send({ embeds: [confirmEmbed], components: [allButtons] });
      const collector = getCollectionButton(confirmMessage, CDT);

      collector.on('end', (collected, reason) => {
        if (reason === 'time') {
          try {
            confirmButton.setDisabled(true);
            cancelButton.setDisabled(true);
            confirmMessage.edit({ components: [allButtons] }).catch(() => null);
            confirmMessage.edit({ embeds: [confirmEmbed.setColor('#555555').setDescription('⏱️ Transaction timed out.')] }).catch(() => null);
          } catch (e) { /* ignore */ }
        }
      });

      collector.on('collect', async (interaction) => {
        if (interaction.user.id !== authorId) {
          return interaction.reply({ content: 'This button is not for you.', ephemeral: true });
        }

        if (interaction.customId === 'give_cancel') {
          confirmButton.setDisabled(true);
          cancelButton.setDisabled(true);
          await interaction.update({ embeds: [customEmbed().setColor('#FF5555').setTitle('❌ Transfer Cancelled').setDescription('Transaction was cancelled.')], components: [] });
          collector.stop();
          return;
        }

        if (interaction.customId === 'give_confirm') {
          // Re-fetch users to avoid race conditions
          userData = await getUser(authorId);
          targetData = await getUser(mention.id);

          // Reset daily counters again if needed
          if (!userData.next_day || moment(userData.next_day).isBefore(nextReset)) {
            userData.next_day = nextReset.toDate();
            userData.daily_pay = 0;
            userData.daily_receive = 0;
          }
          if (!targetData.next_day || moment(targetData.next_day).isBefore(nextReset)) {
            targetData.next_day = nextReset.toDate();
            targetData.daily_pay = 0;
            targetData.daily_receive = 0;
          }

          // Recompute status
          const reSenderIsDev = devList.includes(authorId);
          const reSenderIsStaff = staffList.includes(authorId);
          const reSenderIsVIP = vipList.includes(authorId);
          const reSenderIsPremium = !!(userData.premium?.premium_bool);
          const reSenderIsUnlimited = reSenderIsDev || reSenderIsStaff || reSenderIsVIP;

          const reReceiverIsDev = devList.includes(mention.id);
          const reReceiverIsStaff = staffList.includes(mention.id);
          const reReceiverIsVIP = vipList.includes(mention.id);
          const reReceiverIsPremium = !!(targetData.premium?.premium_bool);
          const reReceiverIsUnlimited = reReceiverIsDev || reReceiverIsStaff || reReceiverIsVIP;

          // If ANY party is unlimited, skip daily limits
          const reSkipDailyLimits = reSenderIsUnlimited || reReceiverIsUnlimited;

          // Recompute limits
          const recomputedSenderLevel = Math.max(1, (userData.levelSystem?.level || 1));
          const recomputedBaseSenderLimit = 1_000_000 * recomputedSenderLevel;
          const recomputedSenderMultiplier = reSenderIsPremium ? 2 : 1;
          const recomputedSenderLimit = reSenderIsUnlimited ? Infinity : (recomputedBaseSenderLimit * recomputedSenderMultiplier);
          const recomputedSenderRemaining = recomputedSenderLimit === Infinity ? Infinity : Math.max(0, recomputedSenderLimit - (userData.daily_pay || 0));

          const recomputedReceiverLevel = Math.max(1, (targetData.levelSystem?.level || 1));
          const recomputedBaseReceiverLimit = 1_000_000 * recomputedReceiverLevel;
          const recomputedReceiverMultiplier = reReceiverIsPremium ? 2 : 1;
          const recomputedReceiverLimit = reReceiverIsUnlimited ? Infinity : (recomputedBaseReceiverLimit * recomputedReceiverMultiplier);
          const recomputedReceiverRemaining = recomputedReceiverLimit === Infinity ? Infinity : Math.max(0, recomputedReceiverLimit - (targetData.daily_receive || 0));

          let amountToTransfer = finalAmount;

          // Only apply limits if NO unlimited user involved
          if (!reSkipDailyLimits) {
            if (recomputedSenderRemaining !== Infinity) {
              amountToTransfer = Math.min(amountToTransfer, recomputedSenderRemaining);
            }
            if (recomputedReceiverRemaining !== Infinity) {
              amountToTransfer = Math.min(amountToTransfer, recomputedReceiverRemaining);
            }
          }

          // Balance safeguard
          if (amountToTransfer > userData.balance) amountToTransfer = userData.balance;

          if (amountToTransfer <= 0) {
            await interaction.update({ embeds: [customEmbed().setColor('#FF0000').setTitle('❌ Transfer Failed').setDescription('No amount available to transfer (limits or balance).')], components: [] });
            collector.stop();
            return;
          }

          // Apply transfer
          userData.balance -= amountToTransfer;
          targetData.balance += amountToTransfer;

          // === ONLY update daily counters if NO unlimited user involved ===
          if (!reSkipDailyLimits) {
            userData.daily_pay = (userData.daily_pay || 0) + amountToTransfer;
            targetData.daily_receive = (targetData.daily_receive || 0) + amountToTransfer;
          }

          // Persist both
          await Promise.all([userData.save(), targetData.save()]);

          confirmButton.setDisabled(true);
          cancelButton.setDisabled(true);

          // Get badges for success message
          const getSuccessSenderBadge = () => {
            if (reSenderIsDev) return `${ORANGE_VERIFY} Developer`;
            if (reSenderIsStaff) return `${ORANGE_VERIFY} Staff`;
            if (reSenderIsVIP) return `${VIP_BADGE} VIP`;
            if (reSenderIsPremium) return `${VERIFY} Premium`;
            return null;
          };

          const getSuccessReceiverBadge = () => {
            if (reReceiverIsDev) return `${ORANGE_VERIFY} Developer`;
            if (reReceiverIsStaff) return `${ORANGE_VERIFY} Staff`;
            if (reReceiverIsVIP) return `${VIP_BADGE} VIP`;
            if (reReceiverIsPremium) return `${VERIFY} Premium`;
            return null;
          };

          // Success message
          let dailyInfo = '';
          if (reSkipDailyLimits) {
            dailyInfo = `⭐ **Unlimited transaction** — Daily counters not updated`;
          } else {
            dailyInfo = `📤 You sent today (OUT): \`${userData.daily_pay.toLocaleString()}\`\n` +
              `📥 Recipient received today (IN): \`${targetData.daily_receive.toLocaleString()}\``;
          }

          const senderBadge = getSuccessSenderBadge();
          const receiverBadge = getSuccessReceiverBadge();

          const successEmbed = customEmbed()
            .setColor('#22C55E')
            .setTitle('✅ Transfer Successful')
            .setThumbnail(mention.displayAvatarURL({ dynamic: true }))
            .setDescription(
              `**From:** <@${authorId}>${senderBadge ? ` ${senderBadge}` : ''}\n` +
              `**To:** <@${mention.id}>${receiverBadge ? ` ${receiverBadge}` : ''}\n` +
              `**Amount:** \`${amountToTransfer.toLocaleString()}\` <:dollar:1438135127673798657>\n\n` +
              `📌 Your new balance: \`${userData.balance.toLocaleString()}\` <:dollar:1438135127673798657>\n\n` +
              dailyInfo
            ).setTimestamp();

          await interaction.update({ embeds: [successEmbed], components: [] }).catch(() => null);

          // === SEND LOG TO LOG CHANNEL ===
          try {
            const logChannel = client.channels.cache.get(LOG_CHANNEL_ID);
            if (logChannel) {
              const logEmbed = customEmbed()
                .setColor(reSkipDailyLimits ? '#FFD700' : '#00BFFF')
                .setTitle('💸 Transfer Log')
                .setThumbnail(author.displayAvatarURL({ dynamic: true }))
                .setDescription(
                  `**From:** <@${authorId}>${senderBadge ? ` ${senderBadge}` : ''}\n` +
                  `**To:** <@${mention.id}>${receiverBadge ? ` ${receiverBadge}` : ''}\n` +
                  `**Amount:** \`${amountToTransfer.toLocaleString()}\` <:dollar:1438135127673798657>\n\n` +
                  `📤 Sender Balance: \`${userData.balance.toLocaleString()}\` <:dollar:1438135127673798657>\n` +
                  `📥 Receiver Balance: \`${targetData.balance.toLocaleString()}\` <:dollar:1438135127673798657>\n\n` +
                  (reSkipDailyLimits
                    ? `⭐ **Unlimited transaction** — Daily counters not updated`
                    : `📤 Sender sent today (OUT): \`${userData.daily_pay.toLocaleString()}\`\n📥 Receiver received today (IN): \`${targetData.daily_receive.toLocaleString()}\``)
                )
                .setFooter({ text: `Transaction ID: ${Date.now()}` })
                .setTimestamp();

              await logChannel.send({ embeds: [logEmbed] });
            }
          } catch (logErr) {
            console.error('Failed to send log:', logErr);
          }

          collector.stop();
        }
      });

    } catch (err) {
      console.error('give command error:', err);
      try { message.reply({ embeds: [SimpleEmbed('An error occurred while processing the transfer.')] }); } catch (e) { }
    }
  }
};