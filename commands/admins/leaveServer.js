const fs = require('fs');

module.exports = {
    name: 'leaveserver',
    async execute(client, message, args) {
        try {
            
            const args = message.content.split(' ');
            const guildId = args[1];

            if (!guildId) {
                return message.reply('Please provide a valid server ID.');
            }

            const guild = client.guilds.cache.get(guildId);

            if (!guild) {
                return message.reply('I am not in a server with that ID.');
            }

            const banlist = loadBanlist();
            if (banlist.includes(guildId)) {
                return message.reply('This server is already banned.');
            }

            banlist.push(guildId);
            saveBanlist(banlist);

            try {
                await guild.leave();
                message.reply(`Successfully left the server: ${guild.name}`);
            } catch (error) {
                console.error('Error leaving the server:', error);
                message.reply('An error occurred while trying to leave the server.');
            }

        } catch (error) {
            console.error('Error banning user:', error);
            message.reply('Failed to ban user.');
        }
    },
};

function loadBanlist() {
    try {
        const data = fs.readFileSync('./banServerlist.json', 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading banlist:', error);
        return [];
    }
}

function saveBanlist(banlist) {
    try {
        fs.writeFile('./banServerlist.json', JSON.stringify(banlist), (err) => {
            if (err) {
                console.error('Error saving banlist:', err);
            }
        });
    } catch (error) {
        console.error('Error saving banlist:', error);
    }
}
