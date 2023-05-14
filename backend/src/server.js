import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import { TwitterApi } from 'twitter-api-v2';
import session from 'express-session';

import { fakeTwitterAPi } from './utils.js';

var { API_KEY, API_KEY_SECRET } = process.env;
const { NODE_ENV, CODESPACES } = process.env;
const isProduction = NODE_ENV === 'production';
const isGHCodespace = !!CODESPACES;

const useFakeTwitterApi = false; //!isProduction || !isGHCodespace;

const PORT = 3333;
const LOCAL_FRONTEND_URL = 'http://localhost:3000';
var FRONTEND_URL_CALLBACK =
  'https://lucas8x-studious-halibut-rxw7996x96c5p4g-3000.preview.app.github.dev/';

const origins = [FRONTEND_URL_CALLBACK.replace(/\/$/, ''), LOCAL_FRONTEND_URL];

const app = express();

app.use(
  cors({
    origin: origins,
    credentials: true,
  })
);

app.use(
  session({
    secret: 'your secret c429c666-5c28-4762-9969-2fe7e469a7e7',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProduction,
      maxAge: 5 * 60 * 1000,
    },
  })
);
app.use(express.json());

const client = new TwitterApi({
  appKey: API_KEY,
  appSecret: API_KEY_SECRET,
});

app.get('/auth/twitter/reverse', async (req, res) => {
  try {
    const { oauth_token, oauth_token_secret, url } = useFakeTwitterApi
      ? fakeTwitterAPi(FRONTEND_URL_CALLBACK)
      : await client.generateAuthLink(FRONTEND_URL_CALLBACK, {
          linkMode: 'authorize',
        });

    console.log('/reverse', {
      sessionID: req.session.id,
      oauth_token,
      oauth_token_secret,
      url,
    });

    req.session.oauth_token_secret = oauth_token_secret;

    return res.json({ url });
  } catch (error) {
    console.log(error.message);
    return res.status(500).send({ message: error.message });
  }
});

app.post('/callback', async (req, res) => {
  const { oauth_token, oauth_verifier } = req.query;
  const { oauth_token_secret } = req.session;

  console.log('/callback', {
    sessionID: req.session.id,
    oauth_verifier,
    oauth_token,
    oauth_token_secret,
  });

  if (!oauth_token || !oauth_verifier || !oauth_token_secret) {
    return res.status(400).send('You denied the app or your session expired!');
  }

  if (useFakeTwitterApi) {
    return res.json({
      id: '123456',
      name: 'lucas123',
      screen_name: 'Lucas',
      description: 'sei la',
      email: 'teste@teste.com',
      profile_image_url: 'https://picsum.photos/48',
    });
  }

  const client = new TwitterApi({
    appKey: API_KEY,
    appSecret: API_KEY_SECRET,
    accessToken: oauth_token,
    accessSecret: oauth_token_secret,
  });

  client
    .login(oauth_verifier)
    .then(({ client: loggedClient, accessToken, accessSecret }) => {
      loggedClient.v1
        .verifyCredentials({
          include_email: true,
          include_entities: false,
          skip_status: true,
        })
        .then((userData) => res.json(userData))
        .catch(() => res.status(500).send('No user data'));
    })
    .catch(() => res.status(403).send('Invalid verifier or access tokens!'));
});

// -----------------------------------------------------------------------------
app.get('/', (_, res) => res.sendStatus(200));

app.put('/envs', (req, res) => {
  const { apiKey, apiKeySecret, frontendUrlCallback } = req.body;

  API_KEY = apiKey;
  API_KEY_SECRET = apiKeySecret;
  FRONTEND_URL_CALLBACK = frontendUrlCallback;

  console.log('Changed envs to:', {
    API_KEY: apiKey,
    API_KEY_SECRET: apiKeySecret,
    FRONTEND_URL_CALLBACK: frontendUrlCallback,
  });

  return res.sendStatus(200);
});
// -----------------------------------------------------------------------------

app.listen(PORT, () => {
  console.log(
    `Server running on port: ${PORT}`,
    `\nAccess at: http://localhost:${PORT}`,
    `\nCurrent NODE_ENV: ${NODE_ENV}`,
    `\nUsing Github Codespaces: ${isGHCodespace}`,
    `\nUsing FakeTwitterApi: ${useFakeTwitterApi}`
  );
});
