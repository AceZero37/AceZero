const { customEmbed, sym3, cooldown, getUser, User } = require('../../functioon/function');
const os = require('os');
const startTime = new Date();

function getHostServerInfo() {
    const platform = os.platform();
    const arch = os.arch();

    return `Platform: ${platform}\nArchitecture: ${arch}`;
}
function getHostUsage() {
    const totalMemory = (os.totalmem() / (1024 * 1024 * 1024)).toFixed(2);
    const freeMemory = (os.freemem() / (1024 * 1024 * 1024)).toFixed(2);

    return `Total Memory: ${totalMemory} GB\nFree Memory: ${freeMemory} GB`;
}

function calculateUptime() {
    const currentTime = new Date();
    const uptime = currentTime - startTime;

    const seconds = Math.floor(uptime / 1000) % 60;
    const minutes = Math.floor(uptime / (1000 * 60)) % 60;
    const hours = Math.floor(uptime / (1000 * 60 * 60)) % 24;
    const days = Math.floor(uptime / (1000 * 60 * 60 * 24));

    let showDay = '';
    let showHour = '';
    let showMin = '';

    if(days > 0){
        showDay = `${days}d `;
    }
    if(hours > 0){
        showHour = `${hours}h `;
    }
    if(minutes > 0){
        showMin = `${minutes}m `;
    }

    return `${showDay}${showHour}${showMin}${seconds}s`;
}

const cooldowns = new Map();
let CDT = 25_000;
var getId = [];
var cdId = [];
var prem = [];

module.exports = {
    name: 'state',
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
            
            const uptime = calculateUptime();

            let totalGuilds = 0;
            client.guilds.cache.forEach(guild => {
                totalGuilds += 1;
            });

            const userCount = await User.countDocuments({});

            const embed = customEmbed()
                .setColor('#0099ff')
                .setTitle('Bot Information')
                .addFields(
                    { name: 'Total Users', value: `${sym3}${userCount}${sym3}` },
                    { name: 'Total Guilds', value: `${sym3}${totalGuilds}${sym3}` },
                    { name: 'Bot bulds', value: `${sym3}node js v20${sym3}` },
                    { name: 'Uptime', value: `${sym3}Bot has been online for: ${uptime}${sym3}` },
                    { name: 'Host Server Info', value: `${sym3}${getHostServerInfo()}${sym3}` },
                    { name: 'Host Usage', value: `${sym3}${getHostUsage()}${sym3}` },
                );
            message.channel.send({ embeds: [embed] });
        }catch(error){
            console.error(`state error ${error}`);
        }
    },
};