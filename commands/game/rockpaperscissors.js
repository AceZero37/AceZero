const {cooldown, gif, AttachmentBuilder, SimpleEmbed, loadImage, User, customEmbed, getUser, getRandomInt} = require('../../functioon/function');
const { RockPaperScissors } = require('discord-gamecord');

const cooldowns = new Map();
let CDT = 15_000;
var getId = [];
var cdId = [];
var prem = [];

module.exports = {
    name: 'rockpaperscissors',
    async execute(client, message, args) {
        try{
            const user = message.author;

            const userData = await getUser(user.id);

            if(!userData.premium.premium_bool){ return; }

            if(userData.premium.premium_bool){
                if(!prem.includes(user.id)){
                    prem.push(user.id);
                }
            }

            if(cooldown(user.id, getId, cdId, CDT, message, cooldowns, prem)){
                return;
            };

            const opponent = message.mentions.users.first();
            if (!opponent) {
              return message.reply('Please mention a user to play against.');
            }

            new RockPaperScissors({
                message,
                isSlashGame: false,
                embed: {
                  title: 'Rock Paper Scissors',
                  color: '#5865F2',
                },
                opponent,
                emojis: {
                  rock: '🪨',
                  paper: '📜',
                  scissors: '✂️',
                },
              }).startGame();

        }catch(error){ console.log(`superagent error ${error}`); }
    },
};



