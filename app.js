const express = require('express');
const axios = require('axios');
const querystring = require('querystring');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectUri = process.env.REDIRECT_URI;

app.get('/login', (req, res) => {
    const scopes = process.env.SCOPES;
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: clientId,
            scope: scopes,
            redirect_uri: redirectUri
        }));
});

app.get('/callback', async (req, res) => {
    const code = req.query.code || null;
    const authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
            code: code,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code'
        },
        headers: {
            'Authorization': 'Basic ' + (new Buffer.from(clientId + ':' + clientSecret).toString('base64'))
        },
        json: true
    };

    try {
        const response = await axios.post(authOptions.url, querystring.stringify(authOptions.form), {
            headers: authOptions.headers
        });

        const { access_token, refresh_token } = response.data;

        res.send({
            'access_token': access_token,
            'refresh_token': refresh_token
        });
    } catch (error) {
        res.send(error.response.data);
    }
});

app.listen(8888, () => {
    console.log('Server running on http://localhost:8888');
});
