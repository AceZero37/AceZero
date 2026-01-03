// index.js
require('dotenv').config();
const mongoose = require('mongoose');
const {
  Client,
  GatewayIntentBits,
  ActivityType,
  Events,
} = require('discord.js');

const { detectMessage } = require('./msc/Handler/detectMessage');
const { initializeUserIds } = require('./msc/Handler/userManage');

// --- Create client with intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

// --- Wire message handlers (before login is fine)
detectMessage(client);

// --- Connect to MongoDB
(async () => {
  try {
    if (!process.env.DB) {
      throw new Error('Missing DB connection string in .env (DB)');
    }
    await mongoose.connect(process.env.DB);
    console.log('Connect to DB');

    // Drop old problematic indexes from clan collection
    try {
      const db = mongoose.connection.db;
      const clanCollection = db.collection('clans');

      // Drop ALL indexes to clean up old schema issues
      await clanCollection.dropIndexes();
      console.log('Dropped all clan indexes');

      // Delete any corrupted documents with null/empty clanName
      const deleted = await clanCollection.deleteMany({
        $or: [{ clanName: null }, { clanName: '' }, { clanName: { $exists: false } }]
      });
      if (deleted.deletedCount > 0) console.log(`Deleted ${deleted.deletedCount} corrupted clans`);

    } catch (e) {
      console.log('Clan cleanup:', e.message);
    }

    await initializeUserIds();
  } catch (error) {
    console.error(`Error nv index.js Error: ${error}`);
  }
})();

// --- Proper ready event (future-proof for v15)
client.once(Events.ClientReady, async (c) => {
  console.log(`${c.user.tag} is online!`);

  // If you don't have a real stream URL, use Playing/Competing/Watching instead of Streaming.
  c.user.setPresence({
    status: 'idle',
    activities: [
      {
        type: ActivityType.Playing, // <— change to Streaming only if you add a valid `url`
        name: '$bankrob',
        // url: 'https://twitch.tv/yourchannel' // required when using ActivityType.Streaming
      },
    ],
  });
});

// --- Basic error logging
client.on('error', (error) => {
  console.error('A Discord client error occurred:', error);
});

// --- Login
(async () => {
  try {
    if (!process.env.TOKEN) {
      throw new Error('Missing bot token in .env (TOKEN)');
    }
    await client.login(process.env.TOKEN);
  } catch (error) {
    console.error('Failed to login:', error);
  }
})();

// Optional: catch unhandled promise rejections to help debugging
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Promise Rejection:', reason);
});