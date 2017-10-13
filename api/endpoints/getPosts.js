import * as dynamoDbLib from '../helpers/dynamodb-helper';
import { success, failure } from '../helpers/response-helper';
import { pick, orderBy } from 'lodash';

export async function main(event, context, callback) {
  let { userId, postId } = event.pathParameters;
  const params = {
    TableName: "posts",
    IndexName: "post-index",
    KeyConditionExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ":userId": userId,
    }
  }

  if (postId) {
    params.KeyConditionExpression += " AND postId = :postId"; 
    params.ExpressionAttributeValues[":postId"] = postId;
  }

  try {
    const result = await dynamoDbLib.call('query', params);
    let response = [];
    let keys = ['price', 'domain', 'postId', 'title', 'createdAt'];

    if(result.Items.length > 0) {
      response = await Promise.all(result.Items.map(async result => {
        if (postId) {
          keys = keys.concat(["user", "description", "geoJson"]);
          
          let user = await dynamoDbLib.call('get', {
            TableName: 'users',
            Key: {
              userId: userId
            }
          });
          result.user = pick(user.Item, ...["userId", "stripeId", "name", "totalRating", "ratingCount", "profileImage"]);

          return pick(result, keys);
        } else {
          return pick(result, keys);
        }
      }));

      if (postId) {
        response = response[0];
      } else {
        response = orderBy(response, 'createdAt', 'desc');
      }
    }
    
    callback(null, success(response));
  } catch (e) {
    callback(null, failure({status: e}));
  }

}