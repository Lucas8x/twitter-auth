import axios from 'axios';

export function useBackend() {
  const backendURL = window.location.origin.replace('3000', '3333');

  async function updateEnvs(body) {
    try {
      await axios.put(`${backendURL}/envs`, body);
    } catch (error) {
      console.error(error);
    }
  }

  return { backendURL, updateEnvs };
}
