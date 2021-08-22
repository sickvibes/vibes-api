import 'cross-fetch/polyfill';

import { handleResponse } from './handler';
import { loadTokens } from './loader';
import { getAllTokens } from './table';

export const getTokens = handleResponse(async () => {
  await loadTokens();
  const tokens = await getAllTokens();

  const projected = tokens.map((t) => {
    return {
      index: t.index,
      nft: t.hk,
      tokenId: t.sk,
      tokenUri: t.tokenUri,
      creator: t.creator,
      metadata: t.metadata,
    };
  });

  return { tokens: projected };
});
