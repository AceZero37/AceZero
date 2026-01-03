const {cooldown, gif, AttachmentBuilder, SimpleEmbed, loadImage, User, customEmbed, getUser, getRandomInt} = require('../../functioon/function');
const { Minesweeper } = require('discord-gamecord');

const cooldowns = new Map();
let CDT = 15_000;
var getId = [];
var cdId = [];
var prem = [];

module.exports = {
    name: 'minesweeper',
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
            
            new Minesweeper({
                message,
                isSlashGame: false,
                embed: {
                  title: 'Minesweeper Game',
                  color: '#5865F2',
                  description: 'Click on the buttons to reveal the tiles.',
                },
                minesweeper: {
                  rows: 10,
                  columns: 10,
                  mines: 20,
                },
              }).startGame();

        }catch(error){ console.log(`superagent error ${error}`); }
    },
};



