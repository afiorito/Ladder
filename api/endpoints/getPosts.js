import * as dynamoDbLib from '../helpers/dynamodb-helper';
import { success, failure } from '../helpers/response-helper';
import { pick, orderBy } from 'lodash';

export async function main(event, context, callback) {
  let { userId, customerId, postId } = event.pathParameters;
  const params = {
    TableName: "posts",
    IndexName: "post-index",
    KeyConditionExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ":userId": userId,
    }
  };

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
        // if were searching for a single post
        if (postId) {
          keys = keys.concat(["user", "description", "geoJson"]);
          
          let user = await dynamoDbLib.getUserWithRatings(userId);
          result.user = pick(user.Item, ...["userId", "stripeId", "name", "rating", "rating", "profileImage"]);

          return pick(result, keys);
        // if were searching for multiple posts
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