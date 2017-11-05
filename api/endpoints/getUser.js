import * as dynamoDbLib from '../helpers/dynamodb-helper';
import { success, failure } from '../helpers/response-helper';
import { pick } from 'lodash';

export async function main(event, context, callback) {
  const params = {
    TableName: 'users',
    Key: {
      userId: event.pathParameters.id
    }
  }

  try {
    const result = await dynamoDbLib.getUserWithRatings(event.pathParameters.id);
    if (result.Item) {
      callback(null, success(pick(result.Item, ...['userId', 'name', 'createdAt', 'stripeId', 'profileImage', 'rating'])));
    } else {
      callback(null, failure({ status: false, error: 'User not found.' }));
    }
  } catch (e) {
    callback(null, failure({status: e}));
  }

}