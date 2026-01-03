import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Gold Packages Configuration
const GOLD_PACKAGES = [
    { id: 1, name: 'Starter', gold: 100, bonus: 0, icon: '🥉', popular: false },
    { id: 2, name: 'Bronze', gold: 500, bonus: 5, icon: '🥈', popular: false },
    { id: 3, name: 'Silver', gold: 1000, bonus: 10, icon: '🥇', popular: false },
    { id: 4, name: 'Gold', gold: 2500, bonus: 15, icon: '💎', popular: true },
    { id: 5, name: 'Diamond', gold: 5000, bonus: 20, icon: '👑', popular: false },
    { id: 6, name: 'Ultimate', gold: 10000, bonus: 25, icon: '🏆', popular: false },
];

const USD_RATE = 4100; // 1 USD = 4100 KHR

function Shop({ user, showToast, addToCart }) {
    const [packages, setPackages] = useState([]);
    const navigate = useNavigate();

    // Initialize packages
    useEffect(() => {
        const processedPackages = GOLD_PACKAGES.map(pkg => ({
            ...pkg,
            totalGold: Math.floor(pkg.gold * (1 + pkg.bonus / 100)),
            usdPrice: (pkg.gold / 100).toFixed(2),
            khrPrice: Math.round((pkg.gold / 100) * USD_RATE)
        }));
        setPackages(processedPackages);
    }, []);

    // Select package and add to cart
    const handleSelectPackage = (pkg) => {
        if (!user) {
            showToast('Please login to purchase gold', 'error');
            return;
        }
        if (!user.isRegistered) {
            showToast('Please register with the bot first', 'error');
            return;
        }

        addToCart(pkg);
        navigate('/cart');
    };

    return (
        <>
            {/* Hero Section */}
            <section className="hero">
                <h1><span className="gradient-text">Premium Shop</span></h1>
                <p>Get Hemiko Gold instantly with Bakong KHQR payment. Fast, secure, and automatic delivery!</p>
            </section>

            {/* Not Registered Warning */}
            {user && !user.isRegistered && (
                <div className="warning-card">
                    <h4>⚠️ Account Not Found</h4>
                    <p>Your Discord account is not registered with Hemiko Bot. Please use any command in a Discord server with Hemiko Bot first!</p>
                </div>
            )}

            {/* Packages Grid */}
            <section className="packages-section">
                <div className="section-title">
                    <h2>🪙 Gold Packages</h2>
                    <p>Choose a package that suits your needs</p>
                </div>
                <div className="packages-grid">
                    {packages.map((pkg, index) => (
                        <div
                            key={pkg.id}
                            className={`package-card ${pkg.popular ? 'popular' : ''}`}
                            style={{ animationDelay: `${index * 0.08}s` }}
                        >
                            {pkg.popular && <div className="package-badge">🔥 Best Value</div>}
                            {pkg.bonus > 0 && !pkg.popular && <div className="package-badge">+{pkg.bonus}%</div>}
                            <span className="package-icon">{pkg.icon}</span>
                            <h3 className="package-name">{pkg.name}</h3>
                            <div className="package-gold">
                                <span className="package-gold-icon">🪙</span>
                                {pkg.totalGold.toLocaleString()}
                            </div>
                            {pkg.bonus > 0 && (
                                <div className="package-bonus">+{pkg.bonus}% Bonus Included!</div>
                            )}
                            <div className="package-price">
                                <span className="price-usd">${pkg.usdPrice}</span>
                                <div className="price-khr">≈ {pkg.khrPrice.toLocaleString()}៛</div>
                            </div>
                            <button
                                className="btn btn-primary"
                                onClick={() => handleSelectPackage(pkg)}
                            >
                                {!user ? '🔒 Login Required' : !user.isRegistered ? '⚠️ Register First' : '🛒 Add to Cart'}
                            </button>
                        </div>
                    ))}
                </div>
            </section>
        </>
    );
}

export default Shop;
