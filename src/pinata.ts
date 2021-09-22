import 'cross-fetch/polyfill';

import pinataSDK, { PinataClient } from '@pinata/sdk';
import { extractHashFromUri } from './ipfs';
import { Metadata } from './nft';

const UPLOAD_TAG = 'VIBES';
export interface PinNftMessagePayload {
  metadataUri: string;
  metadata: Metadata;
}

export const getSDK = (): PinataClient => {
  const config = process.env.PINATA_CONFIG ?? '';
  const parts = config.split(',').map((s) => s.trim());
  const [key, secret] = parts;
  if (!key || !secret) {
    throw new Error('PINATA_CONFIG does not contain comma-separated key, secret');
  }
  return pinataSDK(key, secret);
};

// TODO: using any since types need to be fixed for the options payload in the
//  pinata SDK
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createOptions = (name: string): any => {
  return {
    pinataMetadata: {
      name: name,
      keyvalues: {
        uploadTag: UPLOAD_TAG,
      },
    },
    pinataOptions: {
      customPinPolicy: {
        regions: [
          { id: 'NYC1', desiredReplicationCount: 2 },
          { id: 'FRA1', desiredReplicationCount: 2 },
        ],
      },
    },
  };
};

export const pinByTokenUri = async (metdataUri: string, metadata: Metadata): Promise<void> => {
  const sdk = getSDK();
  const hash = extractHashFromUri(metdataUri);

  const { name, image, animation_url } = metadata;
  console.log(`fetched metadata at ${hash}`);

  await sdk.pinByHash(hash, createOptions(`VIBES - ${name}`));
  console.log(`pinned metadata`);

  if (image) {
    const imageHash = extractHashFromUri(image);
    if (imageHash !== 'undefined') {
      await sdk.pinByHash(imageHash, createOptions(`VIBES image - ${imageHash}`));
      console.log(`pinned image ${imageHash}`);
    }
  }

  if (animation_url) {
    const animationHash = extractHashFromUri(animation_url);
    if (animationHash !== 'undefined') {
      await sdk.pinByHash(animationHash, createOptions(`VIBES animation_url - ${animationHash}`));
      console.log(`pinned animation_url ${animationHash}`);
    }
  }
};
