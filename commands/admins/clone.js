const { User } = require('../../functioon/function');

module.exports = {
    name: 'clone',
    async execute(client, message, args) {
        try {
            const oldId = args[0];
            const newId = args[1];

            if (!oldId || !newId) {
                return message.channel.send("❌ Usage: `clone <oldUserId> <newUserId>`");
            }

            if (oldId === newId) {
                return message.channel.send("❌ oldID and newID cannot be the same.");
            }

            // Find original user
            const oldUser = await User.findOne({ userId: oldId });
            if (!oldUser) {
                return message.channel.send("❌ Original user not found.");
            }

            // Check if target user already exists
            const checkNew = await User.findOne({ userId: newId });
            if (checkNew) {
                return message.channel.send("❌ New user ID already exists.");
            }

            // Clone old user data
            const cloneData = oldUser.toObject();
            cloneData.userId = newId;
            cloneData._id = undefined; // let MongoDB generate a new _id

            // Create new user with cloned data
            await User.create(cloneData);

            // Delete old user
            await oldUser.deleteOne();

            message.channel.send(`✔️ Successfully cloned **${oldId} → ${newId}** and deleted old user.`);

        } catch (error) {
            console.log(`clone error: ${error}`);
            message.channel.send("❌ Failed to clone and delete old user.");
        }
    },
};
