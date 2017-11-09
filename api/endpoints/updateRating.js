import * as dynamoDbLib from '../helpers/dynamodb-helper';
import { success, failure } from '../helpers/response-helper';
import { generateUpdateExpression } from '../helpers/dynamodb-helper';

export async function main(event, context, callback) {
  const data = JSON.parse(event.body);

  let { UpdateExpression, ExpressionAttributeValues } = generateUpdateExpression(
    ["rating"],
    data
  );

  const params = {
    TableName: 'purchases',
    Key: {
      purchaseId: event.pathParameters.purchaseId,
      userId: data.userId
    },
    UpdateExpression: UpdateExpression,
    ExpressionAttributeValues: ExpressionAttributeValues,
    ConditionExpression: "attribute_exists(purchaseId) AND attribute_exists(userId)",
    ReturnValues: 'ALL_NEW'
  };

  try {
    await dynamoDbLib.call('update', params);
    callback(null, success({status: true}));
  }
  catch(e) {
    callback(null, failure({status: e}));
  }
};