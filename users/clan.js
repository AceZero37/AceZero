const mongoose = require('mongoose');

const clanSchema = new mongoose.Schema({
    clanId: { type: String, required: true, unique: true },
    clanName: { type: String, required: true },
    ownerId: { type: String, required: true },
    ownerName: { type: String, default: '' },

    // Clan stats (sum of all members)
    totalPoints: { type: Number, default: 0 },
    totalElo: { type: Number, default: 0 },

    // Members (array of user IDs)
    members: { type: Array, default: [] },
    maxMembers: { type: Number, default: 20 },

    // Clan creation date
    createdAt: { type: Date, default: Date.now },

    // Clan settings
    description: { type: String, default: 'No description set.' },
    logo: { type: String, default: '' },
    clanEmoji: { type: String, default: '' }, // Discord emoji string like <:name:id> or <a:name:id>
    isPublic: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },

    // Pending invites (array of user IDs)
    pendingInvites: { type: Array, default: [] },
});

const Clan = mongoose.model('Clan', clanSchema);

module.exports = { Clan, clanSchema };
