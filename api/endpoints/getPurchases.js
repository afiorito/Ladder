import * as dynamoDbLib from '../helpers/dynamodb-helper';
import { success, failure } from '../helpers/response-helper';
import { pick } from 'lodash';

export async function main(event, context, callback) {
  let { customerId, postId } = event.pathParameters;
  try {
    const purchases = await getPurchasesForCustomerOnPost(customerId, postId);

    callback(null, success(purchases.Items.map(item => pick(item, 'createdAt', 'rating', 'purchaseId'))));
  } catch (e) {
    callback(null, failure({status: e}));
  }
}

function getPurchasesForCustomerOnPost(customerId, postId) {
  const params = {
    TableName: "purchases",
    IndexName: "customer_post_index",
    KeyConditionExpression: "customerId = :customerId AND postId = :postId",
    ExpressionAttributeValues: {
      ":customerId": customerId,
      ":postId": postId
    }
  };

  return dynamoDbLib.call('query', params);
}