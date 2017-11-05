import * as dynamoDbLib from '../helpers/dynamodb-helper';
import { success, failure } from '../helpers/response-helper';
import { pick } from 'lodash';

export async function main(event, context, callback) {
  let { userId } = event.pathParameters;
  const salesParams = {
    TableName: "purchases",
    IndexName: "user_index",
    KeyConditionExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ":userId": userId,
    }
  };

  const purchasesParams = {
  TableName: "purchases",
    IndexName: "customer_index",
    KeyConditionExpression: "customerId = :customerId",
    ExpressionAttributeValues: {
      ":customerId": userId
    }
  };

  try {
    const sales = await dynamoDbLib.call('query', salesParams);
    const purchases = await dynamoDbLib.call('query', purchasesParams);

    console.log(sales, purchases);
    const attributes = ['createdAt', 'price', 'purchaseId', 'rating'];

    callback(null, success({
      sales: sales.Items.map(s => pick(s, ...attributes)),
      purchases: purchases.Items.map(p => pick(p, ...attributes))
    }));
  } catch (e) {
    callback(null, failure({status: e}));
  }

}