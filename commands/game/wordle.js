const {cooldown, gif, AttachmentBuilder, SimpleEmbed, loadImage, User, customEmbed, getUser, getRandomInt} = require('../../functioon/function');
const { Wordle } = require('discord-gamecord');

const cooldowns = new Map();
let CDT = 15_000;
var getId = [];
var cdId = [];
var prem = [];

module.exports = {
    name: 'wordle',
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
            
            new Wordle({
                message,
                isSlashGame: false,
                embed: {
                  title: 'Wordle',
                  color: '#5865F2',
                },
                customWord: null,
                words: ['apple', 'banana', 'cherry', 'date', 'elder'],
            }).startGame();

        }catch(error){ console.log(`tictactoe_game error ${error}`); }
    },
};



