// Default gold packages configuration
// 100 gold = $1 base rate

const defaultPackages = [
    {
        id: 1,
        name: 'Starter Pack',
        goldAmount: 100,
        usdPrice: 1,
        bonus: 0,
        popular: false,
        icon: '🪙'
    },
    {
        id: 2,
        name: 'Bronze Pack',
        goldAmount: 500,
        usdPrice: 5,
        bonus: 5, // 5% bonus = 25 extra gold
        popular: false,
        icon: '🥉'
    },
    {
        id: 3,
        name: 'Silver Pack',
        goldAmount: 1000,
        usdPrice: 10,
        bonus: 10, // 10% bonus = 100 extra gold
        popular: true,
        icon: '🥈'
    },
    {
        id: 4,
        name: 'Gold Pack',
        goldAmount: 2500,
        usdPrice: 25,
        bonus: 15, // 15% bonus = 375 extra gold
        popular: false,
        icon: '🥇'
    },
    {
        id: 5,
        name: 'Diamond Pack',
        goldAmount: 5000,
        usdPrice: 50,
        bonus: 20, // 20% bonus = 1000 extra gold
        popular: false,
        icon: '💎'
    },
    {
        id: 6,
        name: 'Ultimate Pack',
        goldAmount: 10000,
        usdPrice: 100,
        bonus: 25, // 25% bonus = 2500 extra gold
        popular: false,
        icon: '👑'
    }
];

// Calculate total gold with bonus
const calculateTotalGold = (baseAmount, bonusPercent) => {
    return Math.floor(baseAmount + (baseAmount * bonusPercent / 100));
};

// Exchange rate (approximate)
const USD_TO_KHR = 4100;

module.exports = { defaultPackages, calculateTotalGold, USD_TO_KHR };
