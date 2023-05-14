import { useState, useEffect } from 'react';
import { useParams, useLocation, useHistory } from 'react-router-dom';
import TwitterLogin from 'react-twitter-auth-light';
import axios from 'axios';

import { GenericButton } from '../../components/GenericButton';
import { BackendConfig } from '../../components/BackendConfig';
import { Input } from '../../components/Input';

import { generateRandomString } from '../../utils';
import { useBackend } from '../../hooks/useBackend';

import './App.css';

const TWITTER_OAUTH2_URL = 'https://twitter.com/i/oauth2/authorize';
const isGHCodespace = !!process.env.CODESPACES;

export function Home() {
  const location = useLocation();
  const { backendURL } = useBackend();

  const [twitterClientID, setTwitterClientID] = useState(
    process.env.REACT_APP_CLIENT_ID
  );
  const [user, setUser] = useState();
  const isAuthenticated = !!user;

  const frontendURL = window.location.origin;
  const locationSearchParams = new URLSearchParams(window.location.search);
  const reactRouterSearchParams = new URLSearchParams(location.search);

  // - OAuth 2
  const code = locationSearchParams.get('code');
  const state = locationSearchParams.get('state');
  const error = locationSearchParams.get('error');

  function handleTwitterLoginOAuth2() {
    const options = {
      redirect_uri: `${frontendURL}/`,
      client_id: twitterClientID,
      state: 'lucas-state',
      response_type: 'code',
      code_challenge: generateRandomString(),
      code_challenge_method: 'plain',
      scope: ['tweet.read', 'users.read'].join(' '),
    };

    const qs = new URLSearchParams(options).toString();
    const url = `${TWITTER_OAUTH2_URL}?${qs}`;
    window.location.replace(url);
  }

  // - OAuth 1
  const oauth_verifier = locationSearchParams.get('oauth_verifier');
  const oauth_token = locationSearchParams.get('oauth_token');

  async function getAuthorizationURL() {
    try {
      const {
        data: { url },
      } = await axios.get(`${backendURL}/auth/twitter/reverse`, {
        withCredentials: true,
      });
      return url;
    } catch (error) {
      console.error(error);
    }
  }

  async function handleTwitterLoginOAuth1() {
    try {
      const url = await getAuthorizationURL();
      if (!url) return;
      window.location.replace(url);
      //document.location.href = url;
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    if (!oauth_verifier) return;

    async function callback() {
      try {
        const { data, status } = await axios.post(
          `${backendURL}/callback`,
          null,
          {
            withCredentials: true,
            params: {
              oauth_token,
              oauth_verifier,
            },
          }
        );
        setUser(data);
      } catch (error) {
        console.error(error);
      }
    }

    callback();
  }, [oauth_verifier]);

  return (
    <div className='App'>
      <h2>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</h2>
      {user && (
        <>
          <h3>Welcome {user.screen_name}</h3>
          <img src={user.profile_image_url} className='userAvatar'/>
        </>
      )}

      <div className='authTypes'>
        <div className='authItem'>
          <GenericButton onClick={handleTwitterLoginOAuth2}>
            Login OAuth 2
          </GenericButton>

          <Input
            text='Twitter Client ID'
            value={twitterClientID}
            onChange={(e) => setTwitterClientID(e.target.value)}
            placeholder='Twitter Client ID'
          />

          <h3>- Query Strings -</h3>
          <span>
            State: <b>{state || '-'}</b>
          </span>
          <span>
            Code: <b>{code || '-'}</b>
          </span>
          <span>
            Error: <b>{error || '-'}</b>
          </span>
        </div>

        <div className='authItem'>
          <GenericButton onClick={handleTwitterLoginOAuth1}>
            Login OAuth 1
          </GenericButton>

          <h3>- Query Strings -</h3>
          <span>
            oauth_token: <b>{oauth_token || '-'}</b>
          </span>
          <span>
            oauth_verifier: <b>{oauth_verifier || '-'}</b>
          </span>
        </div>
      </div>

      <div className='urls'>
        <span>
          Frontend URL: <a href={frontendURL}>{frontendURL}</a>
        </span>
        <span>
          Enter this frontend URL on your app settings at:{' '}
          <a href='https://developer.twitter.com/en/portal/dashboard'>
            Twitter Developer Portal
          </a>
        </span>
        <span>
          Backend URL: <a href={backendURL}>{backendURL}</a>
        </span>
        {isGHCodespace && (
          <span>Always remember to change backend port visibility to public in forward ports panel</span>
        )}
      </div>

      <BackendConfig />
    </div>
  );
}
