import { SQS } from 'aws-sdk';
import * as uuid from 'uuid';

export const batchCreateMessage = async <T>(queueName: string, messages: T[]): Promise<void> => {
  const region = process.env.AWS_REGION;
  const sqs = new SQS({ region });

  const { QueueUrl } = await sqs.getQueueUrl({ QueueName: queueName }).promise();
  if (!QueueUrl) throw new Error(`Could not find queue url for ${queueName}`);

  const buffer = [...messages];

  while (buffer.length) {
    const batch = buffer.splice(0, 10); // aws max batch size for sqs
    const Entries = batch.map((m) => {
      return { Id: uuid.v4(), MessageBody: JSON.stringify(m) };
    });

    const results = await sqs.sendMessageBatch({ QueueUrl, Entries }).promise();

    if (results.Failed && results.Failed.length > 0) {
      throw new Error('failed to send SQS messages');
    }

    console.log(`sent ${batch.length} messages`);
  }
};
