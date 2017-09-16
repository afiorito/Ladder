import * as dynamoDbLib from '../helpers/dynamodb-helper';
import { success, failure } from '../helpers/response-helper';

export async function main(event, context, callback) {
  const params = {
    TableName: 'users',
    Key: {
      userId: event.pathParameters.id
    }
  }

  try {
    const result = await dynamoDbLib.call('get', params);
    if (result.Item) {
      callback(null, success({
        userId: result.Item.userId,
        name: result.Item.name,
        totalRating: result.Item.totalRating,
        ratingCount: result.Item.ratingCount,
        createdAt: result.Item.createdAt,
        stripeId: result.Item.stripeId,
        profileImage: result.Item.profileImage
      }));
    } else {
      callback(null, failure({ status: false, error: 'User not found.' }));
    }
  } catch (e) {
    callback(null, failure({status: e}));
  }

}