import { batchWriteItems, getDocumentClient, scanAllitems } from './db';
import { StreamedToken } from './loader';

export interface TokenItem {
  /** nft */
  hk: string;
  /** tokenId */
  sk: string;
  index: number;
  /** raw */
  tokenUri: string;
  /** raw */
  metadata: unknown;
  /** resolved */
  creator: string;
}

export interface LoadStateItem {
  hk: 'load-state';
  sk: 'load-state';
  offset: number;
  /** iso8601 date */
  lastLoadAt: string;
}

export const getTableName = (): string => `vibes-tokens-${process.env.STAGE}-table`;

export const getAllTokens = async (): Promise<TokenItem[]> => {
  const items = await scanAllitems<TokenItem>(getTableName(), {
    FilterExpression: 'hk <> :hk',
    ExpressionAttributeValues: { ':hk': 'load-state' },
  });

  console.log(`fetched ${items.length} tokens`);

  const sorted = items.sort((a, b) => a.index - b.index);

  return sorted;
};

export const batchWriteTokens = async (tokens: StreamedToken[]): Promise<void> => {
  const items = tokens.map<TokenItem>((t) => {
    return {
      hk: t.token.nft,
      sk: t.token.tokenId,
      index: t.token.index,
      tokenUri: t.token.tokenUri,
      metadata: t.metadata,
      creator: t.metadata.creator ?? '',
    };
  });

  await batchWriteItems(getTableName(), items);

  console.log(`wrote ${items.length} tokens`);
};

export const getLoadState = async (): Promise<LoadStateItem | undefined> => {
  const client = getDocumentClient();

  const resp = await client
    .get({
      TableName: getTableName(),
      Key: { hk: 'load-state', sk: 'load-state' },
    })
    .promise();

  return resp.Item as LoadStateItem | undefined;
};

export const setLoadOffset = async (offset: number): Promise<void> => {
  const client = getDocumentClient();

  await client
    .put({
      TableName: getTableName(),
      Item: {
        hk: 'load-state',
        sk: 'load-state',
        offset,
        lastLoadAt: new Date().toISOString(),
      },
    })
    .promise();

  console.log(`offset set to ${offset}`);
};
