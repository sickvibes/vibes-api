import { providers } from 'ethers';
import { StaticJsonRpcProvider } from '@ethersproject/providers';

export const getProvider = (): StaticJsonRpcProvider => {
  return new providers.StaticJsonRpcProvider(process.env.RPC_ENDPOINT, 137);
};
