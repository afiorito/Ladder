import { success, failure } from '../helpers/response-helper';
import * as dynamoDbLib from '../helpers/dynamodb-helper';
import mailer from '../helpers/email-helper';

export async function main(event, context, callback) {
  const data = JSON.parse(event.body);

  try {
    const sender = await dynamoDbLib.call('get', {
      TableName: 'users',
      Key: {
        userId: data.senderId
      }
    });
  
    const receiver = await dynamoDbLib.call('get', {
      TableName: 'users',
      Key: {
        userId: data.receiverId
      }
    });
  
    await mailer({
      sender: sender.Item.email,
      receiver: receiver.Item.email,
      subject: data.subject,
      body: data.body
    });

    callback(null, success({status: true}));
  }
  catch(e) {
    callback(null, failure({status: false}));
  }
};