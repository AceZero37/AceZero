const mongoose = require('mongoose');

const goldPackageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    goldAmount: { type: Number, required: true },
    usdPrice: { type: Number, required: true },
    bonus: { type: Number, default: 0 }, // Bonus gold percentage
    popular: { type: Boolean, default: false },
    enabled: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('GoldPackage', goldPackageSchema);
