require('dotenv').config();
const express = require('express');
const axios = require('axios');
const session = require('express-session');
const url = require('url');
const path = require('path');
const app = express();

app.use(session({
    secret: 'some-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use(express.static(__dirname));

app.get('/tqtq', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/tqtq/dashboard', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/');
    }
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

app.get('/tqtq/rules', (req, res) => {
    res.sendFile(path.join(__dirname, 'website', 'rules.html'));
});
app.get('/tqtq/crew', (req, res) => {
    res.sendFile(path.join(__dirname, 'website', 'crew.html'))
});
app.get('/tqtq/test', (req, res) => {
    res.sendFile(path.join(__dirname, 'website', 'test.html'))
});
app.get('/tqtq/api/auth/discord/redirect', async (req, res) => {
    const { code } = req.query;

    if (code) {
        const fromData = new url.URLSearchParams({
            client_id: process.env.ClientID,
            client_secret: process.env.ClientSecret,
            grant_type: 'authorization_code',
            code: code.toString(),
            redirect_uri: 'https://idrone99.github.io/tqtq/api/auth/discord/redirect',
        });

        const output = await axios.post('https://discord.com/api/v10/oauth2/token',
            fromData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

        if (output.data) {
            const access = output.data.access_token;

            const userinfo = await axios.get('https://discord.com/api/v10/users/@me', {
                headers: {
                    'Authorization': `Bearer ${access}`,
                },
            });

            const avatarUrl = `https://cdn.discordapp.com/avatars/${userinfo.data.id}/${userinfo.data.avatar}.png`;

            req.session.user = {
                displayname: userinfo.data.global_name,
                username: userinfo.data.username,
                id: userinfo.data.id,
                email: userinfo.data.email,
                avatar: avatarUrl,
            };

            res.redirect('/');
        }
    }
});

app.get('/tqtq/api/userinfo', (req, res) => {
    if (req.session.user) {
        return res.json(req.session.user);
    } else {
        return res.status(401).json({ message: 'User not authenticated' });
    }
});

app.get('/tqtq/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Failed to log out');
        }
        res.redirect('/');
    });
});

app.get('/tqtq/api/auth/login', (req, res) => {
    res.redirect('https://discord.com/oauth2/authorize?client_id=1086587635373461574&response_type=code&redirect_uri=https%3A%2F%2Fidrone99.github.io%2Ftqtq%2Fapi%2Fauth%2Fdiscord%2Fredirect&scope=guilds+identify+email')
})
app.listen(1500, () => {console.log(`Running on localhost:1500`)});
