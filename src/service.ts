import { SQSHandler } from 'aws-lambda';
import { pinByTokenUri, PinNftMessagePayload } from './pinata';
import { queuePinJobs } from './pinning';
import { getAllTokens } from './table';

export const queuePinAll = async (): Promise<void> => {
  const tokens = await getAllTokens();
  await queuePinJobs(tokens);
};

export const onPinNftMessage: SQSHandler = async (event) => {
  for (const record of event.Records) {
    const message: PinNftMessagePayload = JSON.parse(record.body);
    await pinByTokenUri(message.metadataUri, message.metadata);
  }
};
