import { success, failure } from '../helpers/response-helper';
import uuid from 'uuid';
import * as dynamoDbLib from '../helpers/dynamodb-helper';
import config from '../config';
import stripePackage from 'stripe';
import { pick } from 'lodash';

const stripe = stripePackage(config.stripe.secret_test_key);

export async function main(event, context, callback) {
  const data = JSON.parse(event.body);

  console.log(data);

  try {
    const charge = await stripe.charges.create({
      amount: data.price * 100,
      currency: "cad",
      source: data.token,
      destination: {
        account: data.user.stripeId
      }
    });

    const params = {
      TableName: 'purchases',
      Item: {
        purchaseId: uuid.v4(),
        postId: data.postId,
        userId: data.user.userId,
        customerId: data.customer.userId,
        rating: 0,
        price: data.price,
        createdAt: new Date().getTime()
      },
    };

    console.log(params);

    await dynamoDbLib.call('put', params);
    callback(null, success(pick(params.Item,'createdAt', 'rating', 'purchaseId')));
  }
  catch(e) {
    callback(null, failure({status: e}));
  }
};