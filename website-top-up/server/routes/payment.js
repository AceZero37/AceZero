const express = require('express');
const router = express.Router();
const axios = require('axios');
const crypto = require('crypto');
const { BakongKHQR, khqrData } = require('bakong-khqr');
const Transaction = require('../models/Transaction');
const { defaultPackages, calculateTotalGold, USD_TO_KHR } = require('../config/packages');

// Get user model from main bot
let userSchema;
try {
    const userModule = require('../../../users/user');
    userSchema = userModule.userSchema;
} catch (e) {
    console.log('Could not load user schema from bot');
}

const mongoose = require('mongoose');

// Bakong Configuration
const BAKONG_TOKEN = process.env.BAKONG_TOKEN;
const BAKONG_ACCOUNT = process.env.BAKONG_ACCOUNT || 'sovan_narith@wing';
const BAKONG_NAME = process.env.BAKONG_NAME || 'Hemiko Gold Shop';
const BAKONG_CITY = process.env.BAKONG_CITY || 'Phnom Penh';

// Generate unique transaction ID
const generateTransactionId = () => {
    return `HMK-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
};

// Generate KHQR using bakong-khqr package (same as your bot)
function generateKHQRData(amountUSD, transactionId) {
    try {
        // Calculate expiration timestamp (10 minutes from now)
        const expirationTimestamp = (Date.now() + 10 * 60 * 1000).toString();

        // Ensure merchant name is max 25 characters
        const merchantName = (BAKONG_NAME || 'Hemiko').substring(0, 25);
        const merchantCity = (BAKONG_CITY || 'Phnom Penh').substring(0, 15);

        // Create Individual Info for KHQR
        const individualInfo = {
            bakongAccountID: BAKONG_ACCOUNT,
            merchantName: merchantName,
            merchantCity: merchantCity,
            currency: khqrData.currency.usd,
            amount: amountUSD,
            expirationTimestamp: expirationTimestamp,
            billNumber: transactionId.substring(0, 25), // Max 25 chars
            storeLabel: merchantName.substring(0, 25),
            terminalLabel: 'WEB'
        };

        // Generate KHQR
        const khqr = new BakongKHQR();
        const qrResult = khqr.generateIndividual(individualInfo);

        console.log('KHQR Generation Result:', JSON.stringify(qrResult, null, 2));

        // Check if generation was successful
        if (qrResult.status.code !== 0 || !qrResult.data) {
            console.error('KHQR Generation Failed:', qrResult.status);
            return {
                success: false,
                error: qrResult.status.message || 'QR generation failed'
            };
        }

        return {
            success: true,
            qrString: qrResult.data.qr,
            md5: qrResult.data.md5,
            transactionId: transactionId,
            amountUSD: amountUSD,
            expirationTimestamp: expirationTimestamp
        };
    } catch (error) {
        console.error('KHQR Generation Error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Get all available packages
router.get('/packages', (req, res) => {
    const packagesWithTotal = defaultPackages.map(pkg => ({
        ...pkg,
        totalGold: calculateTotalGold(pkg.goldAmount, pkg.bonus),
        khrPrice: Math.round(pkg.usdPrice * USD_TO_KHR)
    }));
    res.json(packagesWithTotal);
});

// Create payment request
router.post('/create', async (req, res) => {
    const { packageId, items, discordId, discordUsername, discordAvatar } = req.body;

    if ((!packageId && (!items || items.length === 0)) || !discordId || !discordUsername) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user exists in bot database
    try {
        const User = mongoose.models.User || mongoose.model('User', userSchema);
        const user = await User.findOne({ userId: discordId });

        if (!user) {
            return res.status(400).json({
                error: 'User not registered',
                message: 'Please use Hemiko Bot in Discord first!'
            });
        }
    } catch (e) {
        console.log('Could not verify user:', e.message);
    }

    const transactionId = generateTransactionId();
    let totalGold = 0;
    let totalUsd = 0;
    let description = '';

    // Calculate totals & Prepare Transaction Items
    let transactionItems = [];

    if (items && items.length > 0) {
        // Cart Mode
        for (const item of items) {
            const pkg = defaultPackages.find(p => p.id === item.packageId);
            if (!pkg) return res.status(400).json({ error: `Invalid package ID: ${item.packageId}` });

            const qty = item.quantity || 1;
            totalGold += calculateTotalGold(pkg.goldAmount, pkg.bonus) * qty;
            totalUsd += pkg.usdPrice * qty;

            transactionItems.push({
                packageId: pkg.id,
                quantity: qty,
                name: pkg.name,
                type: pkg.type || 'gold'
            });
        }
        description = `${items.length} Package(s)`;
    } else {
        // Single Package Mode
        const selectedPackage = defaultPackages.find(p => p.id === packageId);
        if (!selectedPackage) {
            return res.status(400).json({ error: 'Invalid package' });
        }
        totalGold = calculateTotalGold(selectedPackage.goldAmount, selectedPackage.bonus);
        totalUsd = selectedPackage.usdPrice;
        description = selectedPackage.name;

        transactionItems.push({
            packageId: selectedPackage.id,
            quantity: 1,
            name: selectedPackage.name,
            type: selectedPackage.type || 'gold'
        });
    }

    // Fix floating point issues
    totalUsd = Math.round(totalUsd * 100) / 100;
    const khrAmount = Math.round(totalUsd * USD_TO_KHR);

    try {
        // Generate KHQR locally
        const qrResult = generateKHQRData(totalUsd, transactionId);

        let qrData = null;
        let bakongMD5 = '';

        if (qrResult.success) {
            qrData = {
                qrString: qrResult.qrString,
                md5: qrResult.md5,
            };
            bakongMD5 = qrResult.md5;
            console.log('✅ KHQR generated successfully:', { transactionId, md5: bakongMD5 });
        } else {
            console.error('❌ KHQR generation failed:', qrResult.error);
        }

        // Save transaction to database
        const transaction = new Transaction({
            discordId,
            discordUsername,
            discordAvatar,
            goldAmount: totalGold,
            usdAmount: totalUsd,
            khrAmount,
            transactionId,
            transactionId,
            bakongMD5,
            items: transactionItems,
            status: 'pending',
        });

        await transaction.save();

        res.json({
            success: true,
            transactionId,
            package: {
                name: description,
                totalGold,
                usdPrice: totalUsd.toFixed(2),
                khrPrice: khrAmount,
            },
            payment: {
                qrData,
                bakongAccount: BAKONG_ACCOUNT,
                amount: khrAmount,
                expiresIn: 15 * 60,
            }
        });

    } catch (error) {
        console.error('Create payment error:', error);
        res.status(500).json({ error: 'Failed to create payment' });
    }
});

// Check payment status
router.get('/status/:transactionId', async (req, res) => {
    const { transactionId } = req.params;

    try {
        const transaction = await Transaction.findOne({ transactionId });

        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        // Check if payment is completed in Bakong (if we have MD5)
        if (transaction.status === 'pending' && BAKONG_TOKEN) {
            console.log(`[Payment] Checking payment - MD5: ${transaction.bakongMD5}, TxnID: ${transactionId}`);

            let paymentConfirmed = false;

            // Method 1: Try check_transaction_by_md5
            if (transaction.bakongMD5) {
                try {
                    const checkResponse = await axios.post(
                        'https://api-bakong.nbc.gov.kh/v1/check_transaction_by_md5',
                        { md5: transaction.bakongMD5 },
                        {
                            headers: {
                                Authorization: `Bearer ${BAKONG_TOKEN}`,
                                'Content-Type': 'application/json',
                            },
                            timeout: 15000,
                        }
                    );

                    console.log(`[Payment] MD5 Check Response:`, JSON.stringify(checkResponse.data, null, 2));

                    // Check if transaction found (responseCode 0 = success, 1 = found)
                    if (checkResponse.data.responseCode === 0 || checkResponse.data.responseCode === 1) {
                        if (checkResponse.data.data) {
                            paymentConfirmed = true;
                            console.log(`[Payment] ✅ Payment found via MD5!`);
                        }
                    }
                } catch (md5Error) {
                    console.error('[Payment] MD5 Check Error:', md5Error.response?.data || md5Error.message);
                }
            }

            // Method 2: Try check_transaction_by_external_ref (billNumber)
            if (!paymentConfirmed) {
                try {
                    // Use the short version of transaction ID that fits in billNumber
                    const billRef = transactionId.substring(0, 25);

                    const refResponse = await axios.post(
                        'https://api-bakong.nbc.gov.kh/v1/check_transaction_by_external_ref',
                        { externalRef: billRef },
                        {
                            headers: {
                                Authorization: `Bearer ${BAKONG_TOKEN}`,
                                'Content-Type': 'application/json',
                            },
                            timeout: 15000,
                        }
                    );

                    console.log(`[Payment] External Ref Check Response:`, JSON.stringify(refResponse.data, null, 2));

                    if (refResponse.data.responseCode === 0 || refResponse.data.responseCode === 1) {
                        if (refResponse.data.data) {
                            paymentConfirmed = true;
                            console.log(`[Payment] ✅ Payment found via External Ref!`);
                        }
                    }
                } catch (refError) {
                    console.error('[Payment] External Ref Check Error:', refError.response?.data || refError.message);
                }
            }

            // If payment confirmed, update transaction and deliver gold
            if (paymentConfirmed) {
                console.log(`[Payment] ✅ Payment CONFIRMED for ${transactionId}!`);
                transaction.status = 'completed';
                transaction.completedAt = new Date();
                await transaction.save();

                // Deliver gold/items to user
                if (!transaction.goldDelivered) {
                    const delivered = await deliverGold(transaction.discordId, transaction.goldAmount, transaction.transactionId, transaction.items);
                    if (delivered) {
                        transaction.goldDelivered = true;
                        await transaction.save();
                        console.log(`[Payment] ✅ Items/Gold delivered to ${transaction.discordId}`);
                    }
                }
            }
        }

        // Check if transaction expired
        if (transaction.status === 'pending' && new Date() > transaction.expiresAt) {
            transaction.status = 'expired';
            await transaction.save();
        }

        res.json({
            transactionId: transaction.transactionId,
            status: transaction.status,
            goldAmount: transaction.goldAmount,
            goldDelivered: transaction.goldDelivered,
            createdAt: transaction.createdAt,
            completedAt: transaction.completedAt,
        });

    } catch (error) {
        console.error('Status check error:', error);
        res.status(500).json({ error: 'Failed to check status' });
    }
});

// Manually confirm payment (for admin)
router.post('/confirm/:transactionId', async (req, res) => {
    const { transactionId } = req.params;
    const { adminKey } = req.body;

    // Simple admin verification (you should use a more secure method)
    if (adminKey !== process.env.ADMIN_KEY) {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    try {
        const transaction = await Transaction.findOne({ transactionId });

        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        if (transaction.status === 'completed') {
            return res.json({ message: 'Already completed' });
        }

        transaction.status = 'completed';
        transaction.completedAt = new Date();
        await transaction.save();

        // Deliver gold/items
        if (!transaction.goldDelivered) {
            await deliverGold(transaction.discordId, transaction.goldAmount, transactionId, transaction.items);
            transaction.goldDelivered = true;
            await transaction.save();
        }

        res.json({ success: true, message: 'Payment confirmed and gold delivered' });

    } catch (error) {
        console.error('Confirm payment error:', error);
        res.status(500).json({ error: 'Failed to confirm payment' });
    }
});

// Get user's transaction history
router.get('/history/:discordId', async (req, res) => {
    const { discordId } = req.params;

    try {
        const transactions = await Transaction.find({ discordId })
            .sort({ createdAt: -1 })
            .limit(20);

        res.json(transactions);
    } catch (error) {
        console.error('History error:', error);
        res.status(500).json({ error: 'Failed to get history' });
    }
});

// Helper function to deliver gold/items and check for VIP status
async function deliverGold(discordId, amount, transactionId, items = []) {
    try {
        const User = mongoose.models.User || mongoose.model('User', userSchema);
        const user = await User.findOne({ userId: discordId });

        if (user) {
            // Handle Items (Cart Mode / Mixed Content)
            if (items && items.length > 0) {
                // Future item handling logic can go here.
                // Ticket delivery has been removed as per request.
            }

            // Deliver Gold (Accumulated amount)
            if (amount > 0) {
                user.gold_coin = (user.gold_coin || 0) + amount;
                console.log(`✅ Delivered ${amount} gold to user ${discordId} (Transaction: ${transactionId})`);
            }

            // Mark modified for deep objects if needed, though mongoose usually handles 'gem.key' well if assignment is direct
            user.markModified('gem');
            await user.save();

            // Check for VIP Status Upgrade (Total Spent >= $25)
            // We need to calculate total spent from transaction history
            try {
                const totalSpentResult = await Transaction.aggregate([
                    {
                        $match: {
                            discordId: discordId,
                            status: 'completed'
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: "$usdAmount" }
                        }
                    }
                ]);

                const totalSpent = totalSpentResult.length > 0 ? totalSpentResult[0].total : 0;
                console.log(`User ${discordId} total spent: $${totalSpent}`);

                if (totalSpent >= 25) {
                    if (!user.premium || !user.premium.premium_bool) {
                        if (!user.premium) user.premium = {};
                        user.premium.premium_bool = true;

                        const futureDate = new Date();
                        futureDate.setFullYear(futureDate.getFullYear() + 99);
                        user.premium.premium_endDate = futureDate;

                        await user.save();
                        console.log(`🎉 User ${discordId} upgraded to VIP!`);
                    }
                }
            } catch (vipError) {
                console.error('Error checking VIP status:', vipError);
            }

            return true;
        } else {
            console.error(`❌ User ${discordId} not found for gold delivery`);
            return false;
        }
    } catch (error) {
        console.error('Delivery error:', error);
        return false;
    }
}

module.exports = router;
