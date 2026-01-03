const fs = require('fs');
const { getFiles } = require('../../functioon/function');

// 1. Load Slash Commands
// We use try/catch in case the folder doesn't exist to prevent crashing
let getSlashCommands = [];
try {
    if (fs.existsSync('./slashCommands')) {
        const slashCommands = fs.readdirSync('./slashCommands').filter(file => file.endsWith('.js'));
        getSlashCommands = getFiles(slashCommands, '../slashCommands');
    }
} catch (e) {
    console.log("⚠️ Could not load Slash Commands (folder missing or empty)");
}

// 2. Load Normal Commands
// Note: Ensure your folder names match exactly (Case Sensitive)

const economyFile = fs.readdirSync('./commands/economy').filter(file => file.endsWith('.js'));
const gamblingFile = fs.readdirSync('./commands/gambling').filter(file => file.endsWith('.js'));
const utilityFile = fs.readdirSync('./commands/utility').filter(file => file.endsWith('.js'));
const socialFile = fs.readdirSync('./commands/social').filter(file => file.endsWith('.js'));
const giveawayFile = fs.readdirSync('./commands/giveAway').filter(file => file.endsWith('.js'));
const adminFile = fs.readdirSync('./commands/admins').filter(file => file.endsWith('.js'));
const mineFile = fs.readdirSync('./commands/mine').filter(file => file.endsWith('.js'));
const gameFile = fs.readdirSync('./commands/game').filter(file => file.endsWith('.js'));
const rankFile = fs.readdirSync('./commands/ranking').filter(file => file.endsWith('.js'));
const animalFile = fs.readdirSync('./commands/animal').filter(file => file.endsWith('.js'));

// 3. Process Files using getFiles
const getEconomy = getFiles(economyFile, '../commands/economy');
const getGambling = getFiles(gamblingFile, '../commands/gambling');
const getUtility = getFiles(utilityFile, '../commands/utility');
const getSocial = getFiles(socialFile, '../commands/social');
const getGiveaway = getFiles(giveawayFile, '../commands/giveAway');
const getAdmin = getFiles(adminFile, '../commands/admins');
const getMine = getFiles(mineFile, '../commands/mine');
const getGame = getFiles(gameFile, '../commands/game');
const getRank = getFiles(rankFile, '../commands/ranking');
const getAnimal = getFiles(animalFile, '../commands/animal');

module.exports = { 
    getEconomy, 
    getGambling, 
    getUtility, 
    getSocial, 
    getGiveaway, 
    getAdmin, 
    getMine, 
    getGame, 
    getRank, 
    getAnimal,  
};