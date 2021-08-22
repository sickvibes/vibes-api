import { DocumentClient } from 'aws-sdk/clients/dynamodb';

export const getDocumentClient = (): DocumentClient => new DocumentClient();

export const batchWriteItems = async <T>(
  tableName: string,
  items: T[],
  client = getDocumentClient()
): Promise<void> => {
  if (items.length > 25) throw new Error(); // ddb limit
  if (items.length === 0) return;

  const req: DocumentClient.BatchWriteItemInput = {
    RequestItems: {
      [tableName]: items.map((Item) => {
        return { PutRequest: { Item } };
      }),
    },
    ReturnConsumedCapacity: 'TOTAL',
  };

  const resp = await client.batchWrite(req).promise();
  console.log(resp.ConsumedCapacity);
};

export const scanAllitems = async <T>(
  tableName: string,
  input: Partial<DocumentClient.ScanInput> = {},
  client = getDocumentClient()
): Promise<T[]> => {
  const items: T[] = [];

  let lek: DocumentClient.Key | undefined;

  while (true) {
    const resp = await client
      .scan({
        ...input,
        ExclusiveStartKey: lek,
        TableName: tableName,
        ReturnConsumedCapacity: 'TOTAL',
      })
      .promise();

    (resp.Items ?? []).forEach((i) => items.push(i as T));

    console.log(resp.ConsumedCapacity);

    lek = resp.LastEvaluatedKey;
    if (!lek) break;
  }

  return items;
};
