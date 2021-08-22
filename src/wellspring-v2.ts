import { Provider, Contract as MulticallContract } from 'ethers-multicall';
import { getProvider } from './rpc';
import WELLSPRING_V2 from './abi/wellspring-v2.json';

const WELLSPRING_V2_ADDRESS = '0x2b1f852e38324aad4788b140df84525ba5e3babe';

export interface Token {
  nft: string;
  tokenId: string;
}

interface RecentTokensInput {
  limit?: number;
  offset?: number;
}

export interface RecentToken {
  index: number;
  nft: string;
  tokenId: string;
  tokenUri: string;
}

export const getTokensFromContract = async ({ limit = 10, offset = 0 }: RecentTokensInput = {}): Promise<
  RecentToken[]
> => {
  const provider = new Provider(getProvider(), 137);

  const wellspringV2 = new MulticallContract(WELLSPRING_V2_ADDRESS, WELLSPRING_V2);

  // total tokens we have
  const [count] = await provider.all([wellspringV2.allTokensCount()]);
  console.log(`wellspring count: ${count}`);

  // create an array of offsets to fetch
  const start = offset;
  const take = Math.min(limit, count - offset);
  const indexes = [...new Array(take)].map((_, idx) => start + idx);
  console.log(`fetching ${take} from idx ${start}`);

  // use the offsets to query for the tokenIDs, then read the views
  const tokens = await provider.all(indexes.map((offset) => wellspringV2.allTokens(offset)));
  console.log('fetched tokens');
  const views = await provider.all(tokens.map((t) => wellspringV2.getToken(t.nft, t.tokenId)));
  console.log('fetched token views');

  const projected = tokens.map((t, idx) => {
    return {
      index: indexes[idx],
      nft: t.nft,
      tokenId: t.tokenId.toString(),
      tokenUri: views[idx].tokenURI,
    };
  });

  return projected;
};
