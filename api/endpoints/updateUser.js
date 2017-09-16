import * as dynamoDbLib from '../helpers/dynamodb-helper';
import { success, failure } from '../helpers/response-helper';

function generateUpdateExpression(attributes, update) {
  let columns = [];
  let ExpressionAttributeValues = attributes
    .reduce((attributes, key) => {
      if(update[key]) {
        attributes[`:${key}`] = update[key];
        columns.push(`${key} = :${key}`);
      }
    
    return attributes;
    }, {})

  return { UpdateExpression: "SET " + columns.join(", "), ExpressionAttributeValues} 
}

export async function main(event, context, callback) {
  const data = JSON.parse(event.body);

  let { UpdateExpression, ExpressionAttributeValues } = generateUpdateExpression([
    "name", "totalRating", "ratingCount", "stripeId", "profileImage"
  ], data);

  const params = {
    TableName: 'users',
    Key: {
      userId: event.pathParameters.id
    },
    UpdateExpression: UpdateExpression,
    ExpressionAttributeValues: ExpressionAttributeValues,
    ReturnValues: 'ALL_NEW'
  };

  try {
    await dynamoDbLib.call('update', params);
    callback(null, success({status: true}));
  }
  catch(e) {
    callback(null, failure({status: false}));
  }
};