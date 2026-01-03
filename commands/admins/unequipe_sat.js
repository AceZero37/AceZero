const {getUser, SimpleEmbed, User, gif} = require('../../functioon/function');

module.exports = {
    name: 'unequipe',
    async execute(client, message, args) {
        try{
            const topUsers = await User.find({}).sort({ command_point: -1 }).limit(User);      
            
            let top = []

            topUsers.forEach((user, index) => {
                top[index] = user.userId;
            });

            for(const i of top){

                let userData = await getUser(i);

                userData.sat.team.team_equipe1 = '';
                userData.sat.team.team_equipe2 = '';
                userData.sat.team.team_equipe3 = '';

                userData.sat.team.postion1 = '';
                userData.sat.team.postion2 = '';
                userData.sat.team.postion3 = '';

                userData.sat.team.postion4 = '';
                userData.sat.team.postion5 = '';
                userData.sat.team.postion6 = '';

                try{ await userData.save(); }catch(error){}
            }

            console.log('success');

        }catch(error){
            console.log(`error unequipe user : ${error}`);
        }
    },
};