import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { API_URL } from '../config';

function Cart({ user, cart, removeFromCart, clearCart, showToast, onPaymentComplete }) {

    // Calculations
    const totalGold = cart.reduce((sum, item) => sum + (item.totalGold * item.quantity), 0);
    const totalUsd = cart.reduce((sum, item) => sum + (parseFloat(item.usdPrice) * item.quantity), 0);
    const totalKhr = cart.reduce((sum, item) => sum + (item.khrPrice * item.quantity), 0);

    // Timer countdown effect
    useEffect(() => {
        let interval;
        if (showPaymentModal && timer > 0 && paymentStatus === 'pending') {
            interval = setInterval(() => {
                setTimer((prev) => {
                    if (prev <= 1) {
                        setPaymentStatus('expired');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [showPaymentModal, timer, paymentStatus]);

    // Auto-check payment status
    useEffect(() => {
        let interval;
        if (showPaymentModal && paymentData && paymentStatus === 'pending') {
            const checkPaymentStatus = async () => {
                try {
                    const response = await fetch(`${API_URL}/api/payment/status/${paymentData.transactionId}`);
                    const data = await response.json();

                    if (data.status === 'completed') {
                        setPaymentStatus('completed');
                        showToast('🎉 Payment confirmed! Gold added to your account!', 'success');

                        // Fetch real balance from MongoDB
                        try {
                            const balanceRes = await fetch(`${API_URL}/api/auth/balance/${user.discordId || user.id}`);
                            const balanceData = await balanceRes.json();
                            if (balanceData.goldCoin !== undefined) {
                                onPaymentComplete(balanceData.goldCoin);
                            }
                        } catch (e) {
                            console.error('Failed to fetch balance:', e);
                        }

                        // Clear cart on success
                        clearCart();
                    } else if (data.status === 'expired') {
                        setPaymentStatus('expired');
                    }
                } catch (error) {
                    console.error('Payment check error:', error);
                }
            };

            // Check immediately
            checkPaymentStatus();
            // Then every 3 seconds
            interval = setInterval(checkPaymentStatus, 3000);
        }
        return () => clearInterval(interval);
    }, [showPaymentModal, paymentData, paymentStatus, user, API_URL, showToast, onPaymentComplete, clearCart]);

    const handleCheckout = async () => {
        if (!user) {
            showToast('Please login to checkout', 'error');
            return;
        }
        if (cart.length === 0) return;

        setPaymentStatus('loading');
        setShowPaymentModal(true);

        try {
            const response = await fetch(`${API_URL}/api/payment/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    discordId: user.discordId || user.id,
                    discordUsername: user.username,
                    discordAvatar: user.avatar,
                    items: cart.map(item => ({
                        packageId: item.id,
                        quantity: item.quantity
                    }))
                })
            });

            const data = await response.json();

            if (data.success) {
                setPaymentData(data);
                setPaymentStatus('pending');
                setTimer(900); // 15 minutes
            } else {
                setPaymentStatus('error');
                showToast(data.error || 'Failed to create payment', 'error');
            }
        } catch (error) {
            console.error('Payment creation error:', error);
            setPaymentStatus('error');
            showToast('Failed to connect to server', 'error');
        }
    };

    const handleCheckPayment = async () => {
        if (!paymentData) return;

        setCheckingPayment(true);
        try {
            const response = await fetch(`${API_URL}/api/payment/status/${paymentData.transactionId}`);
            const data = await response.json();

            if (data.status === 'completed') {
                setPaymentStatus('completed');
                showToast('🎉 Payment confirmed! Gold added to your account!', 'success');
                clearCart();

                // Update balance
                try {
                    const balanceRes = await fetch(`${API_URL}/api/auth/balance/${user.discordId || user.id}`);
                    const balanceData = await balanceRes.json();
                    if (balanceData.goldCoin !== undefined) {
                        onPaymentComplete(balanceData.goldCoin);
                    }
                } catch (e) { }

            } else if (data.status === 'pending') {
                showToast('Payment not detected yet. Please wait...', 'info');
            } else {
                showToast(`Payment status: ${data.status}`, 'info');
            }
        } catch (error) {
            console.error('Payment check error:', error);
            showToast('Failed to check payment status', 'error');
        } finally {
            setCheckingPayment(false);
        }
    };

    const closeModal = () => {
        setShowPaymentModal(false);
        setPaymentData(null);
        setPaymentStatus(null);
        setTimer(0);
        if (paymentStatus === 'completed') {
            navigate('/dashboard');
        }
    };

    const formatTimer = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (cart.length === 0) {
        return (
            <div className="cart-empty-state">
                <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <div style={{ fontSize: '64px', marginBottom: '20px' }}>🛒</div>
                    <h2>Your cart is empty</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>
                        Looks like you haven't added any gold packages yet.
                    </p>
                    <Link to="/" className="btn btn-primary">Start Shopping</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <h1 className="page-title">Shopping Cart</h1>

            <div className="cart-layout">
                <div className="cart-items">
                    {cart.map((item) => (
                        <div key={item.id} className="cart-item glass-card">
                            <div className="item-icon">{item.icon}</div>
                            <div className="item-details">
                                <h3>{item.name}</h3>
                                <div className="item-gold">
                                    🪙 {item.totalGold.toLocaleString()} Gold
                                </div>
                            </div>
                            <div className="item-quantity">
                                <span className="qty-label">Qty:</span>
                                <span className="qty-value">{item.quantity}</span>
                            </div>
                            <div className="item-price">
                                <div className="price-usd">${(parseFloat(item.usdPrice) * item.quantity).toFixed(2)}</div>
                                <div className="price-khr">{(item.khrPrice * item.quantity).toLocaleString()}៛</div>
                            </div>
                            <button
                                className="remove-btn"
                                onClick={() => removeFromCart(item.id)}
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>

                <div className="cart-summary glass-card">
                    <h2>Order Summary</h2>

                    <div className="summary-row">
                        <span>Total Items</span>
                        <span>{cart.reduce((a, c) => a + c.quantity, 0)}</span>
                    </div>

                    <div className="summary-row">
                        <span>Total Gold</span>
                        <span className="gold-text">🪙 {totalGold.toLocaleString()}</span>
                    </div>

                    <div className="summary-divider"></div>

                    <div className="summary-row total">
                        <span>Total Price</span>
                        <div className="total-values">
                            <span className="total-usd">${totalUsd.toFixed(2)}</span>
                            <span className="total-khr">{totalKhr.toLocaleString()}៛</span>
                        </div>
                    </div>

                    <button
                        className="btn btn-primary btn-block checkout-btn"
                        onClick={handleCheckout}
                        disabled={!user}
                    >
                        {user ? '💳 Checkout Now' : '🔒 Login to Checkout'}
                    </button>
                </div>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>💳 Complete Payment</h3>
                            <button className="close-btn" onClick={closeModal}>✕</button>
                        </div>
                        <div className="modal-body">
                            {paymentStatus === 'loading' && (
                                <div className="status-section">
                                    <div className="spinner"></div>
                                    <p>Generating payment...</p>
                                </div>
                            )}

                            {paymentStatus === 'pending' && paymentData && (
                                <>
                                    <div className="qr-section">
                                        <p className="qr-instructions">Scan with Bakong app to pay</p>
                                        <div className="qr-code">
                                            <img
                                                src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(paymentData.payment?.qrData?.qrString)}`}
                                                alt="KHQR Code"
                                            />
                                        </div>
                                    </div>

                                    <div className="payment-info">
                                        <div className="payment-row">
                                            <span className="payment-label">Order</span>
                                            <span className="payment-value">{paymentData.package.name}</span>
                                        </div>
                                        <div className="payment-row">
                                            <span className="payment-label">Total Gold</span>
                                            <span className="payment-value gold">🪙 {paymentData.package.totalGold.toLocaleString()}</span>
                                        </div>
                                        <div className="payment-row">
                                            <span className="payment-label">Amount</span>
                                            <span className="payment-value">${paymentData.package.usdPrice} ({paymentData.package.khrPrice.toLocaleString()}៛)</span>
                                        </div>
                                    </div>

                                    <div className="timer-section">
                                        <div className="timer">{formatTimer(timer)}</div>
                                        <p className="timer-label">Time remaining</p>
                                    </div>

                                    <button
                                        className="btn btn-primary btn-lg"
                                        style={{ width: '100%', marginBottom: '12px' }}
                                        onClick={handleCheckPayment}
                                        disabled={checkingPayment}
                                    >
                                        {checkingPayment ? '⏳ Checking...' : '✅ I Have Paid'}
                                    </button>

                                    {/* Dev Helper - Remove in production */}
                                    <button
                                        className="btn btn-secondary btn-sm"
                                        style={{ width: '100%', marginTop: '8px', opacity: 0.7 }}
                                        onClick={() => {
                                            setPaymentStatus('completed');
                                            showToast('🧪 Simulation: Payment Completed', 'success');
                                            clearCart();
                                        }}
                                    >
                                        🧪 Simulate Success
                                    </button>
                                </>
                            )}

                            {paymentStatus === 'completed' && (
                                <div className="status-section">
                                    <div className="status-icon success">✓</div>
                                    <h3>Payment Successful!</h3>
                                    <p className="status-message">
                                        Your order has been processed and gold added!
                                    </p>
                                    <button className="btn btn-primary" onClick={closeModal}>
                                        Go to Dashboard
                                    </button>
                                </div>
                            )}

                            {paymentStatus === 'error' && (
                                <div className="status-section">
                                    <div className="status-icon failed">!</div>
                                    <h3>Error</h3>
                                    <p className="status-message">Failed to create payment.</p>
                                    <button className="btn btn-primary" onClick={closeModal}>Close</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Cart;
