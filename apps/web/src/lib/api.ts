import { EpnClient } from '@epn/sdk';

const apiBaseUrl =
  typeof window !== 'undefined'
    ? process.env.NEXT_PUBLIC_API_URL || '/api/v1'
    : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export const epnClient = new EpnClient({
  baseUrl: apiBaseUrl
});
