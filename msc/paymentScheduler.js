// Payment Verification Scheduler
// This runs every 30 seconds to check pending payments via Bakong API

const axios = require('axios');
const mongoose = require('mongoose');

// Get Transaction model
let Transaction;
try {
    Transaction = require('../website-top-up/server/models/Transaction');
} catch (e) {
    console.log('[PaymentScheduler] Could not load Transaction model');
}

// Get User model
let userSchema;
try {
    const userModule = require('../users/user');
    userSchema = userModule.userSchema;
} catch (e) {
    console.log('[PaymentScheduler] Could not load user schema');
}

// Bakong Configuration
const BAKONG_TOKEN = process.env.BAKONG_TOKEN || process.env.BAKONG_API_TOKEN;

// Check and confirm payments
async function checkPendingPayments() {
    if (!Transaction || !BAKONG_TOKEN) {
        return;
    }

    try {
        // Find all pending transactions
        const pendingTransactions = await Transaction.find({
            status: 'pending',
            createdAt: { $gte: new Date(Date.now() - 30 * 60 * 1000) } // Only last 30 minutes
        });

        if (pendingTransactions.length === 0) return;

        console.log(`[PaymentScheduler] Checking ${pendingTransactions.length} pending transaction(s)...`);

        for (const transaction of pendingTransactions) {
            let paymentConfirmed = false;

            // Try MD5 check
            if (transaction.bakongMD5) {
                try {
                    const response = await axios.post(
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

                    if (response.data.responseCode === 0 || response.data.responseCode === 1) {
                        if (response.data.data) {
                            paymentConfirmed = true;
                            console.log(`[PaymentScheduler] ✅ Payment found for ${transaction.transactionId}!`);
                        }
                    }
                } catch (error) {
                    // API error - might be blocked
                    console.log(`[PaymentScheduler] MD5 check failed: ${error.message}`);
                }
            }

            // Try external ref check if MD5 failed
            if (!paymentConfirmed) {
                try {
                    const billRef = transaction.transactionId.substring(0, 25);
                    const response = await axios.post(
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

                    if (response.data.responseCode === 0 || response.data.responseCode === 1) {
                        if (response.data.data) {
                            paymentConfirmed = true;
                            console.log(`[PaymentScheduler] ✅ Payment found via ref for ${transaction.transactionId}!`);
                        }
                    }
                } catch (error) {
                    console.log(`[PaymentScheduler] Ref check failed: ${error.message}`);
                }
            }

            // If payment confirmed, deliver gold
            if (paymentConfirmed) {
                transaction.status = 'completed';
                transaction.completedAt = new Date();
                await transaction.save();

                // Deliver gold
                if (!transaction.goldDelivered) {
                    try {
                        const User = mongoose.models.User || mongoose.model('User', userSchema);
                        const user = await User.findOne({ userId: transaction.discordId });

                        if (user) {
                            user.gold_coin = (user.gold_coin || 0) + transaction.goldAmount;
                            await user.save();
                            transaction.goldDelivered = true;
                            await transaction.save();
                            console.log(`[PaymentScheduler] ✅ Delivered ${transaction.goldAmount} gold to ${transaction.discordId}`);
                        }
                    } catch (deliverError) {
                        console.error('[PaymentScheduler] Delivery error:', deliverError.message);
                    }
                }
            }
        }
    } catch (error) {
        console.error('[PaymentScheduler] Error:', error.message);
    }
}

// Start the scheduler
function startPaymentScheduler() {
    console.log('[PaymentScheduler] Starting payment verification scheduler...');

    // Run immediately
    setTimeout(checkPendingPayments, 5000);

    // Then every 30 seconds
    setInterval(checkPendingPayments, 30000);
}

module.exports = { startPaymentScheduler, checkPendingPayments };
