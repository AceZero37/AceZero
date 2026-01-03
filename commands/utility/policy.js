const { SimpleEmbed, gif, sym, prefix, cooldown, getUser } = require('../../functioon/function');

const cooldowns = new Map();
let CDT = 25_000;
var getId = [];
var cdId = [];
var prem = [];

module.exports = {
    name: 'policy',
    async execute(client, message, args) {
        try{
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

            const commands = args[0];
            if(commands){
                if(commands == 'animal' || commands == 'Animal'){
                    message.channel.send({ embeds: [SimpleEmbed(`all command need prefix main ${sym}${prefix}${sym}\n\nType: ${sym}egg equipe { animal_name }${sym} to equipe your animal\nType: ${sym}upgrade { animal_name } { esen_amount }${sym} to upgrade your animal\nType: ${sym}egg open${sym} to open your egg\n\nType: ${sym}fight${sym} to take a sword ( Battle )\n\nType: ${sym}item${sym} to show all item\nType: ${sym}item equipe {item_name}${sym} to equipe your item\nType: ${sym}item unequipe${sym} to unequipe your item\n\nType: ${sym}hold${sym} to show item holding\nType: ${sym}hold { item_name }${sym} to holding an item\nType: ${sym}hold unhold${sym} to unhold an item`).setTitle('Command Animal')] });
                    return;
                }
            }

            message.channel.send({ embeds: [SimpleEmbed(`Type any Commands with main prefix ${sym}${prefix}${sym} as Headling\nType: ${sym}help { catagory_name }${sym} to all commnads in that Catagory`)
            .setTitle('Hemiko Privacy Policy')
            .setDescription(`Hemiko Privacy Policy explains what information about you is collected, used and disclosed upon every interaction you make with the bot.By using Hemiko Bot you comply with the policies provided here`)
            .addFields(
                { name: `Information About Data`, value: `So to provide you a better experience while using our bot, we collect data regarding \n1. Usernames, User Avatar and Banner, User discriminator \n2.Information about Guild(includes Roles and their respective ids, Members and their respective ids, Channelsband their respective ids\n3. Information about messages sent and their content, message reactions`, inline: true },
                { name: `How We Use It`, value: `We collect all the information listed above and use it in various fields for the working of the bot.For example - Moderation logs use Member ids, message content to log user actions.Unless specified, all data requested is mandatory and failure of one can lead commands stoppage!!`, inline: true },
                { name: `Deletion of Data`, value: `Request of data deletion can be done by joining our [Support Server](https://discord.gg/JcBRcekqtQ) and contacting a developer.`, inline: true },
                { name: `Updates to Policy`, value: `If we notice any issues regarding our policy, changes will be implemented prior to that.For further enquiry, please join our [Support Server](https://discord.gg/JcBRcekqtQ)`, inline: true },
            )
            .setTimestamp()
            ] });
        }catch(error){
            console.log(`help error ${error}`);
        }
    },
};