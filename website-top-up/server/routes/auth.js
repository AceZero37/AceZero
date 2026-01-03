const express = require('express');
const router = express.Router();
const axios = require('axios');

// Get user model from main bot
let userSchema;
try {
    const userModule = require('../../../users/user');
    userSchema = userModule.userSchema;
} catch (e) {
    console.log('Could not load user schema from bot');
}

const mongoose = require('mongoose');

// Discord OAuth2 Configuration
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || 'http://localhost:3001/api/auth/callback';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Generate Discord OAuth URL
router.get('/login', (req, res) => {
    const scope = 'identify';
    const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}&response_type=code&scope=${scope}`;
    res.redirect(authUrl);
});

// Discord OAuth Callback
router.get('/callback', async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.redirect(`${FRONTEND_URL}?error=no_code`);
    }

    try {
        // Exchange code for access token
        const tokenResponse = await axios.post('https://discord.com/api/oauth2/token',
            new URLSearchParams({
                client_id: DISCORD_CLIENT_ID,
                client_secret: DISCORD_CLIENT_SECRET,
                grant_type: 'authorization_code',
                code,
                redirect_uri: DISCORD_REDIRECT_URI,
            }), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }
        );

        const { access_token } = tokenResponse.data;

        // Get user info from Discord
        const userResponse = await axios.get('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${access_token}` }
        });

        const discordUser = userResponse.data;

        // Check if user exists in bot database
        let botUser = null;
        let isRegistered = false;

        try {
            const User = mongoose.models.User || mongoose.model('User', userSchema);
            botUser = await User.findOne({ userId: discordUser.id });
            isRegistered = !!botUser;
        } catch (e) {
            console.log('Could not check user in bot database:', e.message);
        }

        // Create session data
        const sessionData = {
            id: discordUser.id,
            discordId: discordUser.id, // Also include as discordId for payment API
            username: discordUser.username,
            globalName: discordUser.global_name || discordUser.username,
            avatar: discordUser.avatar
                ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
                : `https://cdn.discordapp.com/embed/avatars/${parseInt(discordUser.discriminator || '0') % 5}.png`,
            isRegistered,
            goldCoin: botUser?.gold_coin || 0,
        };

        // Encode session and redirect to frontend
        const sessionToken = Buffer.from(JSON.stringify(sessionData)).toString('base64');
        res.redirect(`${FRONTEND_URL}?session=${sessionToken}`);

    } catch (error) {
        console.error('OAuth error:', error.response?.data || error.message);
        res.redirect(`${FRONTEND_URL}?error=oauth_failed`);
    }
});

// Verify user exists in bot database
router.post('/verify', async (req, res) => {
    const { discordId } = req.body;

    if (!discordId) {
        return res.status(400).json({ error: 'Discord ID required' });
    }

    try {
        const User = mongoose.models.User || mongoose.model('User', userSchema);
        const user = await User.findOne({ userId: discordId });

        if (!user) {
            return res.json({
                exists: false,
                message: 'Please use Hemiko Bot first to register! Use any command in Discord server.'
            });
        }

        return res.json({
            exists: true,
            username: user.username || 'Unknown',
            goldCoin: user.gold_coin || 0,
            level: user.levelSystem?.level || 0,
        });
    } catch (error) {
        console.error('Verify error:', error);
        return res.status(500).json({ error: 'Database error' });
    }
});

// Get user's current balance from MongoDB
router.get('/balance/:discordId', async (req, res) => {
    const { discordId } = req.params;

    try {
        const User = mongoose.models.User || mongoose.model('User', userSchema);
        const user = await User.findOne({ userId: discordId });

        if (!user) {
            return res.json({ goldCoin: 0 });
        }

        return res.json({
            goldCoin: user.gold_coin || 0,
        });
    } catch (error) {
        console.error('Balance fetch error:', error);
        return res.status(500).json({ error: 'Database error' });
    }
});

// Logout (client-side handles this)
router.get('/logout', (req, res) => {
    res.redirect(FRONTEND_URL);
});

module.exports = router;
