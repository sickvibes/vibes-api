import { Metadata, resolveMetadata } from './nft';
import { queuePinJobs } from './pinning';
import { batchWriteTokens, getLoadState, setLoadOffset } from './table';
import { getTokensFromContract, RecentToken } from './wellspring-v2';

export const loadTokens = async (from?: number): Promise<void> => {
  let offset = from;
  if (offset === undefined) {
    const state = await getLoadState();
    offset = state?.offset ?? 0;
  }
  await streamAndWriteTokens(offset);
};

export interface StreamedToken {
  token: RecentToken;
  metadata: Metadata;
}

/** stream tokens and metadata from the chain / ipfs */
export async function* streamTokens(offset = 0): AsyncGenerator<StreamedToken, void, undefined> {
  const batchSize = 5; // how much we fetch before yielding items
  let index = offset;

  while (true) {
    console.log(`fetching on-chain data from ${index}, batch=${batchSize}`);
    const batch = await getTokensFromContract({ limit: batchSize, offset: index });
    const metadata = await Promise.all(batch.map((t) => resolveMetadata(t)));

    yield* batch.map((token, idx) => {
      return { token, metadata: metadata[idx] };
    });

    if (batch.length < batchSize) {
      break;
    }

    index += batch.length;
  }
}

/** stream tokens from the chain/ipfs to ddb */
export const streamAndWriteTokens = async (offset = 0): Promise<void> => {
  const tokenStream = streamTokens(offset);
  const batchSize = 25; // dynamo batch write in chunks of 25

  let totalWritten = 0;

  const chunkedStream = chunkStream(tokenStream, batchSize);

  for await (const chunk of chunkedStream) {
    console.log(`processing streamed token chunk size=${chunk.length}`);
    await batchWriteTokens(chunk);
    totalWritten += chunk.length;

    // race condition if streamAndWriteTokens is called concurrently and a token
    // is infused during the operation ... prolly fine
    await setLoadOffset(offset + totalWritten);
    await queuePinJobs(
      chunk.map((c) => {
        return { tokenUri: c.token.tokenUri, metadata: c.metadata };
      })
    );
  }
};

// .. prolly a lib out there for this
async function* chunkStream<T>(
  stream: AsyncGenerator<T, void, undefined>,
  bufferSize: number
): AsyncGenerator<T[], void, undefined> {
  const buffer: T[] = [];
  for await (const item of stream) {
    buffer.push(item);
    if (buffer.length === bufferSize) {
      yield buffer;
      buffer.length = 0; // clear buffer
    }
  }

  yield buffer; // remainder
}
