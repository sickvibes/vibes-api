import { Metadata } from './nft';
import { PinNftMessagePayload } from './pinata';
import { batchCreateMessage } from './sqs';
import { TokenItem } from './table';

type QueuePinJobInput = Pick<TokenItem, 'tokenUri' | 'metadata'>;

export const queuePinJobs = async (tokens: QueuePinJobInput[]): Promise<void> => {
  const messages = tokens.map<PinNftMessagePayload>((t) => {
    return { metadataUri: t.tokenUri, metadata: t.metadata as Metadata };
  });

  await batchCreateMessage(`vibes-pinning-${process.env.STAGE}`, messages);
};
