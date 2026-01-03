const {getUser, SimpleEmbed, User} = require('../../functioon/function');

module.exports = {
    name: 'del',
    async execute(client, message, args) {
        try{
            const user = message.author;

            const userId = args[0];
            if(!userId){
                return;
            }

            let target = await User.findOne({
                userId: userId
            });
            
            await target.deleteOne();
            message.channel.send('account delete successfully');
        }catch(error){
            console.log(`error delete user : ${error}`);
        }
    },
};