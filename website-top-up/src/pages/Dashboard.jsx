import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { API_URL } from '../config';

function Dashboard({ user }) {
    const [activeTab, setActiveTab] = useState('overview');
    const [history, setHistory] = useState([]);
    const [stats, setStats] = useState({
        totalPurchases: 0,
        totalGoldBought: 0,
        totalSpent: 0
    });
    const location = useLocation();

    // Redirect to login if not authenticated
    if (!user) {
        return (
            <div className="dashboard-login-prompt">
                <div className="glass-card" style={{ maxWidth: '400px', margin: '60px auto', textAlign: 'center' }}>
                    <h2>🔒 Login Required</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                        Please login with Discord to access your dashboard
                    </p>
                    <Link to="/" className="btn btn-discord">
                        ← Back to Shop
                    </Link>
                </div>
            </div>
        );
    }

    // Fetch history and calculate stats
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await fetch(`${API_URL}/api/payment/history/${user.discordId || user.id}`);
                const data = await response.json();

                // API returns array directly, handle both cases
                const transactions = Array.isArray(data) ? data : (data.transactions || []);

                if (transactions) {
                    // Filter only completed transactions
                    const completed = transactions.filter(tx => tx.status === 'completed');
                    setHistory(completed);

                    // Calculate stats
                    setStats({
                        totalPurchases: completed.length,
                        totalGoldBought: completed.reduce((sum, tx) => sum + tx.goldAmount, 0),
                        totalSpent: completed.reduce((sum, tx) => sum + tx.usdAmount, 0)
                    });
                }
            } catch (error) {
                console.error('Failed to fetch history:', error);
            }
        };

        if (user) {
            fetchHistory();
        }
    }, [user, API_URL]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="dashboard-layout">
            {/* Sidebar */}
            <aside className="dashboard-sidebar glass-card">
                <div className="sidebar-user">
                    <img src={user.avatar} alt={user.username} className="sidebar-avatar" />
                    <h3 className="sidebar-username">{user.globalName || user.username}</h3>
                    <p className="sidebar-id">@{user.username}</p>
                </div>

                <nav className="sidebar-nav">
                    <button
                        className={`sidebar-link ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        <span>📊</span> Overview
                    </button>
                    <button
                        className={`sidebar-link ${activeTab === 'purchases' ? 'active' : ''}`}
                        onClick={() => setActiveTab('purchases')}
                    >
                        <span>📜</span> Purchases
                    </button>
                    <Link to="/" className="sidebar-link">
                        <span>🛒</span> Shop
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="dashboard-main">
                {/* Welcome Banner */}
                <div className="welcome-banner">
                    <div className="welcome-content">
                        <h1>Welcome back, <span className="gradient-text">{user.globalName || user.username}</span>!</h1>
                        <p>Your Hemiko Gold dashboard</p>
                    </div>
                    <div className="welcome-mascot">💎</div>
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="dashboard-content">
                        {/* Stats Grid */}
                        <div className="stats-grid">
                            <div className="stat-card glass-card">
                                <div className="stat-icon">🪙</div>
                                <div className="stat-info">
                                    <div className="stat-value gold-text">{user.goldCoin?.toLocaleString() || 0}</div>
                                    <div className="stat-label">Current Balance</div>
                                </div>
                            </div>

                            <div className="stat-card glass-card">
                                <div className="stat-icon">🛍️</div>
                                <div className="stat-info">
                                    <div className="stat-value">{stats.totalPurchases}</div>
                                    <div className="stat-label">Total Purchases</div>
                                </div>
                            </div>

                            <div className="stat-card glass-card">
                                <div className="stat-icon">💰</div>
                                <div className="stat-info">
                                    <div className="stat-value">{stats.totalGoldBought.toLocaleString()}</div>
                                    <div className="stat-label">Total Gold Bought</div>
                                </div>
                            </div>

                            <div className="stat-card glass-card">
                                <div className="stat-icon">💵</div>
                                <div className="stat-info">
                                    <div className="stat-value">${stats.totalSpent.toFixed(2)}</div>
                                    <div className="stat-label">Total Spent</div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="quick-actions">
                            <h3>⚡ Quick Actions</h3>
                            <div className="actions-grid">
                                <Link to="/" className="action-card glass-card">
                                    <span className="action-icon">🛒</span>
                                    <span className="action-label">Buy Gold</span>
                                </Link>
                                <button className="action-card glass-card" onClick={() => setActiveTab('purchases')}>
                                    <span className="action-icon">📜</span>
                                    <span className="action-label">View History</span>
                                </button>
                                <a href="https://discord.gg/fQFajk8cxS" target="_blank" rel="noopener noreferrer" className="action-card glass-card">
                                    <span className="action-icon">💬</span>
                                    <span className="action-label">Join Discord</span>
                                </a>
                            </div>
                        </div>

                        {/* Recent Transactions */}
                        <div className="recent-transactions">
                            <h3>📜 Recent Transactions</h3>
                            {history.length === 0 ? (
                                <div className="empty-state glass-card">
                                    <div className="empty-state-icon">📭</div>
                                    <p>No transactions yet</p>
                                    <Link to="/" className="btn btn-primary">Start Shopping</Link>
                                </div>
                            ) : (
                                <div className="history-list">
                                    {history.slice(0, 5).map((tx) => (
                                        <div key={tx._id} className="history-item">
                                            <div className="history-info">
                                                <span className="history-icon">🪙</span>
                                                <div className="history-details">
                                                    <h4>{tx.goldAmount.toLocaleString()} Gold</h4>
                                                    <span>{formatDate(tx.createdAt)}</span>
                                                </div>
                                            </div>
                                            <div className="history-amount">
                                                <div className="history-gold">${tx.usdAmount}</div>
                                                <span className={`history-status ${tx.status}`}>
                                                    {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Purchases Tab */}
                {activeTab === 'purchases' && (
                    <div className="dashboard-content">
                        <h2 style={{ marginBottom: '24px' }}>📜 Purchase History</h2>

                        {history.length === 0 ? (
                            <div className="empty-state glass-card">
                                <div className="empty-state-icon">📭</div>
                                <p>No transactions yet</p>
                                <Link to="/" className="btn btn-primary">Start Shopping</Link>
                            </div>
                        ) : (
                            <div className="history-list">
                                {history.map((tx) => (
                                    <div key={tx._id} className="history-item glass-card">
                                        <div className="history-info">
                                            <span className="history-icon">🪙</span>
                                            <div className="history-details">
                                                <h4>{tx.goldAmount.toLocaleString()} Gold</h4>
                                                <span>{formatDate(tx.createdAt)}</span>
                                                <br />
                                                <small style={{ color: 'var(--text-muted)' }}>ID: {tx._id}</small>
                                            </div>
                                        </div>
                                        <div className="history-amount">
                                            <div className="history-gold">${tx.usdAmount}</div>
                                            <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                                                {tx.khrAmount?.toLocaleString()}៛
                                            </div>
                                            <span className={`history-status ${tx.status}`}>
                                                {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}

export default Dashboard;
