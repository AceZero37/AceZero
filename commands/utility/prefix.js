const fs = require('fs');
const config = require('../../config.json');
const { SimpleEmbed, cooldown, sym, getUser } = require('../../functioon/function');
const { PermissionsBitField } = require('discord.js');

const cooldowns = new Map();
let CDT = 25_000;
var getId = [];
var cdId = [];
var prem = [];

module.exports = {
    name: 'prefix',
    async execute(client, message, args) {
        try {
            const user = message.author;

            const userData = await getUser(user.id);

            if(userData.premium.premium_bool){
                if(!prem.includes(user.id)){
                    prem.push(user.id);
                }
            }

            if(cooldown(user.id, getId, cdId, CDT, message, cooldowns, prem)){
                return;
            };

            function changePrefix(message, newPrefix) {

                if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)){
                    return message.reply({ embeds: [SimpleEmbed(`<@${user.id}> jg change prefix tver admin sen tov🙂`)] });
                }

                config.prefixes[message.guild.id] = newPrefix;

                fs.writeFile('./config.json', JSON.stringify(config, null, 4), (err) => {
                    if (err) {
                        console.error(err);
                    }
                    message.reply({ embeds: [SimpleEmbed(`<@${user.id}> has changed ${client.user.displayName} prefix to \`${newPrefix}\` in **${message.guild.name}**`)] });
                });
            }

            const newPrefix = args[0];
            if (!newPrefix) return message.reply("Please provide a new prefix.");
            changePrefix(message, newPrefix);
        } catch (error) {
            console.error(`prefix error ${error}`);
        }
    },
};
