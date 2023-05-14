import { v4 as uuidv4 } from 'uuid';

export const generateRandomString = (size = 16) =>
  [...Array(size)].map(() => Math.random().toString(36)[2]).join('');

export const fakeTwitterAPi = (callbackURL) => {
  const oauth_token = uuidv4();
  const oauth_verifier = uuidv4();
  const oauth_token_secret = uuidv4();

  const url = new URL(callbackURL);
  url.searchParams.set('oauth_token', oauth_token);
  url.searchParams.set('oauth_verifier', oauth_verifier);

  return {
    oauth_token,
    oauth_token_secret,
    url: url.href,
  };
};
