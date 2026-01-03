const {cooldown, gif, AttachmentBuilder, SimpleEmbed, loadImage, User, customEmbed, getUser, getRandomInt} = require('../../functioon/function');
const { Trivia } = require('discord-gamecord');

const cooldowns = new Map();
let CDT = 15_000;
var getId = [];
var cdId = [];
var prem = [];

module.exports = {
    name: 'trivia',
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
            
            new Trivia({
                message,
                isSlashGame: false,
                embed: {
                  title: 'Trivia Quiz',
                  color: '#5865F2',
                  description: 'Answer the trivia questions!',
                },
                difficulty: 'medium', 
                maxQuestions: 10,
                questions: null,
              }).startGame();

        }catch(error){ console.log(`tictactoe_game error ${error}`); }
    },
};



