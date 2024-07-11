import {join} from 'node:path';
import {getOptions} from './utils';

export async function getOidcToken(): Promise<{token: string}> {
  const {apiKey, apiUrl} = getOptions();
  if (!apiKey)
    throw new Error('No API key found. Please set the API key in the environment variables.');
  const url = new URL(apiUrl ?? 'https://api.allegoria.io');
  url.pathname = join(url.pathname, 'oidc/token');

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: apiKey,
    },
  });

  if (!response.ok) {
    if (response.status === 401)
      throw new Error('Failed to authenticate with the Allegoria API.\n### Is your API key valid?');
    throw new Error(
      `Failed to connect to the Allegoria API\n${await response.status} - ${await response.statusText}\n${await response.text()}`,
    );
  }
  return (await response.json()) as {token: string};
}
