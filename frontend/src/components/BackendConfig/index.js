import { useState } from 'react';

import { Input } from '../Input';
import { GenericButton } from '../GenericButton';
import { useBackend } from '../../hooks/useBackend';

import './styles.css';

export function BackendConfig() {
  const { updateEnvs } = useBackend();
  const [loading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiKeySecret, setApiKeySecret] = useState('');
  const [frontendUrlCallback, setFrontendUrlCallback] = useState(
    window.location.origin
  );

  async function handleSave() {
    setIsLoading(true);
    try {
      await updateEnvs({
        apiKey,
        apiKeySecret,
        frontendUrlCallback,
      });
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
  }

  return (
    <div className='backendContainer'>
      <h3>Backend ENV settings</h3>

      <Input
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        placeholder='App Key = API Key = Consumer API Key = Consumer Key = Customer Key'
        text='API Key'
      />

      <Input
        value={apiKeySecret}
        onChange={(e) => setApiKeySecret(e.target.value)}
        placeholder='API Secret Key = Consumer Secret = Consumer Key = Customer Key'
        text='API Secret Key'
      />

      <Input
        value={frontendUrlCallback}
        onChange={(e) => setFrontendUrlCallback(e.target.value)}
        placeholder='Frontend URL Callback'
        text='Frontend URL Callback'
      />

      <GenericButton onClick={handleSave} disabled={loading}>
        {loading ? 'Saving...' : 'Save'}
      </GenericButton>
    </div>
  );
}
