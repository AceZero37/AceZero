const fs = require('fs');
const { getUser, EmbedBuilder } = require('../../functioon/function');

// Ban log channel ID
const BAN_LOG_CHANNEL_ID = '1451597788965109953';

module.exports = {
    name: 'blacklist',
    async execute(client, message, args) {
        try {

            const userId = args[0];
            const reason = message.content.slice(`ban ${userId}`.length).trim() || 'No reason provided';

            let bannedUser = null;
            let displayName = 'Unknown User';

            try {
                bannedUser = await client.users.fetch(userId);
                displayName = bannedUser.displayName || bannedUser.username || 'Unknown User';
                await bannedUser.send(`You has been BAN!, SAFID: ${reason}`);
            } catch (error) { }

            if (userId == '1155362022146457671') {
                return message.reply('can not ban this user!.');
            }

            const banlist = loadBanlist();
            if (banlist.includes(userId)) {
                return message.reply('This user is already banned.');
            }

            banlist.push(userId);
            saveBanlist(banlist);

            // Log the ban to the specified channel
            try {
                const logChannel = await client.channels.fetch(BAN_LOG_CHANNEL_ID);
                if (logChannel) {
                    const banLogEmbed = new EmbedBuilder()
                        .setTitle('🔨 User Banned')
                        .setColor('#FF0000')
                        .addFields(
                            { name: '👤 User ID', value: `\`${userId}\``, inline: true },
                            { name: '📛 Display Name', value: `${displayName}`, inline: true },
                            { name: '📝 Reason', value: `${reason}`, inline: false },
                            { name: '📍 Room', value: `${message.channel.name || 'Unknown Channel'}`, inline: true },
                            { name: '🏠 Server Name', value: `${message.guild?.name || 'Unknown Server'}`, inline: true }
                        )
                        .setTimestamp()
                        .setFooter({ text: `Banned by: ${message.author.tag}` });

                    await logChannel.send({ embeds: [banLogEmbed] });
                }
            } catch (logError) {
                console.error('Error sending ban log:', logError);
            }

            message.channel.send(`User has been blacklist form bot.`);
        } catch (error) {
            console.error('Error banning user:', error);
            message.reply('Failed to ban user.');
        }
    },
};

function loadBanlist() {
    try {
        const data = fs.readFileSync('./banlist.json', 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading banlist:', error);
        return [];
    }
}

function saveBanlist(banlist) {
    try {
        fs.writeFile('./banlist.json', JSON.stringify(banlist), (err) => {
            if (err) {
                console.error('Error saving banlist:', err);
            }
        });
    } catch (error) {
        console.error('Error saving banlist:', error);
    }
}
