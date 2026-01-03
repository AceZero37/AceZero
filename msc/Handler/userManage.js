const mongoose = require('mongoose');
const { userSchema } = require('../../users/user');
const User = mongoose.model('User', userSchema);

let allUserIds = [];
let allUserIdsRank = [];
let loggedUserIds = []; // Track users who have used commands
let commandLogs = []; // Store command usage logs

async function initializeUserIds() {
    try {
        // Clear arrays first
        allUserIds = [];
        allUserIdsRank = [];

        // Get all users with their team data in one query
        const allUsers = await User.find({}, 'userId sat.team.team_equipe1 sat.team.team_equipe2 sat.team.team_equipe3').lean();

        for (const user of allUsers) {
            allUserIds.push(user.userId);

            // Check if user has a valid team (non-empty string values)
            const team = user.sat?.team;
            if (team) {
                const hasTeam =
                    (team.team_equipe1 && typeof team.team_equipe1 === 'string' && team.team_equipe1.trim() !== '') ||
                    (team.team_equipe2 && typeof team.team_equipe2 === 'string' && team.team_equipe2.trim() !== '') ||
                    (team.team_equipe3 && typeof team.team_equipe3 === 'string' && team.team_equipe3.trim() !== '');

                if (hasTeam) {
                    allUserIdsRank.push(user.userId);
                }
            }
        }

        console.log(`Initialized ${allUserIds.length} users, ${allUserIdsRank.length} ranked users`);
    } catch (error) {
        console.error('Error initializing user IDs:', error);
    }
}


function getAllUserIds() {
    return allUserIds;
}

function getAllUserIdsRank() {
    return allUserIdsRank;
}

function addLoggedUser(userId) {
    if (!loggedUserIds.includes(userId)) {
        loggedUserIds.push(userId);
        console.log(`New user logged: ${userId} | Total: ${loggedUserIds.length}`);
    }
}

function getLoggedUserIds() {
    return loggedUserIds;
}

function isUserLogged(userId) {
    return loggedUserIds.includes(userId);
}

// Add command log entry
function logCommand(data) {
    const logEntry = {
        userId: data.userId,
        username: data.username,
        userTag: data.userTag,
        command: data.command,
        prefix: data.prefix,
        fullMessage: data.fullMessage,
        channelId: data.channelId,
        channelName: data.channelName,
        guildId: data.guildId,
        guildName: data.guildName,
        timestamp: new Date(),
        messageUrl: data.messageUrl
    };

    commandLogs.push(logEntry);

    // Keep only last 1000 logs in memory
    if (commandLogs.length > 1000) {
        commandLogs.shift();
    }

    console.log(`Command logged: ${data.prefix}${data.command} by ${data.userTag} in ${data.guildName || 'DM'}`);
}

// Get all command logs
function getCommandLogs(limit = 100) {
    return commandLogs.slice(-limit).reverse(); // Return most recent first
}

// Get command logs for specific user
function getUserCommandLogs(userId, limit = 50) {
    return commandLogs
        .filter(log => log.userId === userId)
        .slice(-limit)
        .reverse();
}

// Get command statistics
function getCommandStats() {
    const stats = {
        totalCommands: commandLogs.length,
        totalUsers: loggedUserIds.length,
        commandCounts: {},
        topUsers: {},
        topCommands: []
    };

    // Count commands
    commandLogs.forEach(log => {
        const cmd = log.command;
        stats.commandCounts[cmd] = (stats.commandCounts[cmd] || 0) + 1;

        const userId = log.userId;
        stats.topUsers[userId] = (stats.topUsers[userId] || 0) + 1;
    });

    // Sort top commands
    stats.topCommands = Object.entries(stats.commandCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([cmd, count]) => ({ command: cmd, count }));

    return stats;
}

module.exports = {
    initializeUserIds,
    getAllUserIds,
    getAllUserIdsRank,
    addLoggedUser,
    getLoggedUserIds,
    isUserLogged,
    logCommand,
    getCommandLogs,
    getUserCommandLogs,
    getCommandStats
};