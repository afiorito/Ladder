import uuid from 'uuid';
import * as dynamoDbLib from './helpers/dynamodb-helper';
import { success, failure } from './helpers/response-helper';

export async function main(event, context, callback) {
  const data = JSON.parse(event.body);

  const params = {
    TableName: 'users',
    Item: {
      userId: data.userId,
      name: data.name,
      email: data.email,
      totalRating: 0,
      ratingCount: 0,
      averageRating: 0,
      createdAt: new Date().getTime()
    },
  };

  try {
    await dynamoDbLib.call('put', params);
    callback(null, success(params.Item));
  }
  catch(e) {
    callback(null, failure({status: false}));
  }
};