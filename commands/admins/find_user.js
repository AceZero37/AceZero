const {getUser, SimpleEmbed, getAnimalIdByName, gif, User} = require('../../functioon/function');

module.exports = {
    name: 'find',
    async execute(client, message, args) {
        try{
            const user = message.author;

            const team_name = message.content.slice(`sfind ` .length);

            const topUsers = await User.find({}, 'userId');

            topUsers.forEach( async (user, index) => {
                const userData = await User.findOne({ userId: user.userId });
                if(userData.sat.team.team_name.includes(team_name)){
                    return message.reply(user.userId);
                }
            });

            return message.reply('user not found');

        }catch(error){
            console.log(`error find user : ${error}`);
        }
    },
};