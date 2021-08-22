import PQueue from 'p-queue';

// help a lil bit with ipfs throttling
const queue = new PQueue({
  concurrency: 1,
  interval: 1000,
  intervalCap: 1,
  carryoverConcurrencyCount: true,
});

export const fetchIpfsJson = async <T>(hash: string): Promise<T> => {
  console.log(`fetching ${hash}`);
  const resp = await queue.add(() => fetch(`https://ipfs.io/ipfs/${hash}`));
  const json = await resp.json();
  console.log(`downloaded ${hash}`);
  return json;
};

export const ipfsGatewayUrl = (ipfsUrl: string): string => {
  const match = ipfsUrl.match(/\/ipfs\/(.*)$/);
  if (!match) throw new Error();
  const [, hash] = match;
  return `https://ipfs.io/ipfs/${hash}`;
};
