const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    discordId: { type: String, required: true },
    discordUsername: { type: String, required: true },
    discordAvatar: { type: String, default: '' },
    goldAmount: { type: Number, required: true },
    usdAmount: { type: Number, required: true },
    khrAmount: { type: Number, required: true },
    transactionId: { type: String, required: true, unique: true },
    bakongMD5: { type: String, default: '' },
    // Store bought items to handle non-gold rewards (like tickets)
    items: [{
        packageId: { type: Number },
        quantity: { type: Number },
        name: { type: String },
        type: { type: String } // 'gold', 'ticket', etc.
    }],
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'expired'],
        default: 'pending'
    },
    goldDelivered: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
    expiresAt: { type: Date, default: () => new Date(Date.now() + 15 * 60 * 1000) }, // 15 minutes
});

// Add index for faster queries
transactionSchema.index({ discordId: 1 });
transactionSchema.index({ transactionId: 1 });
transactionSchema.index({ status: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
