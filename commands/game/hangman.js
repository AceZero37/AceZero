const {cooldown, gif, AttachmentBuilder, SimpleEmbed, loadImage, User, customEmbed, getUser, getRandomInt} = require('../../functioon/function');
const { Hangman } = require('discord-gamecord');

const cooldowns = new Map();
let CDT = 15_000;
var getId = [];
var cdId = [];
var prem = [];

module.exports = {
    name: 'hangman',
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
            
            new Hangman({
                message,
                isSlashGame: false,
                embed: {
                  title: 'Hangman Game',
                  color: '#5865F2',
                },
                hangman: {
                  hat: '🎩',
                  head: '😟',
                  shirt: '👕',
                  pants: '👖',
                  boots: '👞👞',
                },
                words: ['discord', 'javascript', 'hangman', 'game', 'bot'],
                customWord: null,
              }).startGame();

        }catch(error){ console.log(`superagent error ${error}`); }
    },
};



