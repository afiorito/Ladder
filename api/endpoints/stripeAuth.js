import request from 'request';
import { success, failure } from '../helpers/response-helper';
import config from '../config';
import * as dynamoDbLib from '../helpers/dynamodb-helper';
import { generateUpdateExpression } from './updateUser';

export async function main(event, context, callback) {
  const data = JSON.parse(event.body);

  request.post({
    url: 'https://connect.stripe.com/oauth/token', 
    form: {
      grant_type: "authorization_code",
      client_id: config.stripe.client_id,
      code: data.code,
      client_secret: config.stripe.secret_test_key
    }
  }, async (err, res, body) => {
    
    if(err) {
      callback(null, failure({ status: false}));
    }
    const stripeAuth = JSON.parse(body).stripe_user_id;
    let { UpdateExpression, ExpressionAttributeValues } = generateUpdateExpression(["stripeId"], { stripeId: stripeAuth });
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
      callback(null, success({ stripeId: stripeAuth }));
    }
    catch(e) {
      callback(null, failure({status: false}));
    }
    
  });
};