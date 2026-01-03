const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'ping',
    async execute(client, message, args) {
        try {
            // Calculate latency immediately without any database calls
            const latency = Date.now() - message.createdTimestamp;
            const apiPing = Math.round(client.ws.ping);

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setDescription(`🏓 **Pong!** to ${message.author.displayName}\n\n⏱️ Latency: **${latency}ms**\n💓 API: **${apiPing}ms**`);

            message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.log(`ping error ${error}`);
        }
    },
};
