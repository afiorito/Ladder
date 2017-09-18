import * as dynamoDbLib from '../helpers/dynamodb-helper';
import PostManager from '../helpers/geo-manager';
import { success, failure } from '../helpers/response-helper';
import marshaler from 'dynamodb-marshaler';
import { pick } from 'lodash';
import AWS from 'aws-sdk';

export async function main(event, context, callback) {
  try {
    const results = await PostManager().queryRadius({
        RadiusInMeter: 100000,
        CenterPoint: {
            latitude: parseFloat(event.queryStringParameters.latitude),
            longitude: parseFloat(event.queryStringParameters.longitude)
        }
    });

    const keys = ['user', 'price', 'domain', 'postId', 'title', 'createdAt'];

    let response = await Promise.all(results.map(async item => {
      let formatedItem = marshaler.unmarshalItem(item);

      let user = await dynamoDbLib.call('get', {
        TableName: 'users',
        Key: {
          userId: formatedItem.userId
        }
      });

      formatedItem.user = {
        userId: user.Item.userId, 
        totalRating: user.Item.totalRating, 
        ratingCount: user.Item.ratingCount
      };

      return pick(formatedItem, ...keys);
    }));

    callback(null, success(response));

  } catch (e) {
    callback(null, failure({status: e}));
  }

}