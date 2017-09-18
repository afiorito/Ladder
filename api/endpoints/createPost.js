import PostManager from '../helpers/geo-manager';
import uuid from 'uuid';
import { success, failure } from '../helpers/response-helper';

export async function main(event, context, callback) {
  const data = JSON.parse(event.body);
  const postManager = PostManager();
  
  try {
    const params = {
      RangeKeyValue: { S: uuid.v4() },
      GeoPoint: {
        latitude: data.coords.latitude,
        longitude: data.coords.longitude
      },
      PutItemInput: {
        Item: {
          userId: {S : data.userId },
          title: { S: data.title },
          description: { S: data.description },
          domain: { S: data.domain },
          price: { N: data.price.toString() },
          createdAt: { N: new Date().getTime().toString() }
        }
      }
    }
    await postManager.putPoint(params).promise();

    callback(null, success({status: true}));
  }
  catch(e) {
    callback(null, failure({status: false}));
  }
};