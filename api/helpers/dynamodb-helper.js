import AWS from 'aws-sdk';

var awsConfig = {
  region: 'us-east-1',
};
if (process.env.ENDPOINT) {
  awsConfig.endpoint = "http://localhost:8000";
}
AWS.config.update(awsConfig);

export function call(action, params) {
  const dynamoDb = new AWS.DynamoDB.DocumentClient();

  return dynamoDb[action](params).promise();
}

export function generateUpdateExpression(attributes, update) {
  let columns = [];
  let ExpressionAttributeValues = attributes
    .reduce((attributes, key) => {
      if(update[key]) {
        attributes[`:${key}`] = update[key];
        columns.push(`${key} = :${key}`);
      }
    
    return attributes;
    }, {})

  return { UpdateExpression: "SET " + columns.join(", "), ExpressionAttributeValues} 
}

export async function getUserWithRatings(userId) {
  const user = await call('get', {
    TableName: 'users',
    Key: {
      userId: userId
    }
  });
  const purchases = await call('query', {
    TableName: "purchases",
    IndexName: "user_index",
    KeyConditionExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ":userId": userId,
    }
  });

  let ratingCount = purchases.Items.length;

  const totalRatings = purchases.Items.reduce((acc, purchase) => {
    if(purchase.rating == 0) {
      ratingCount--;
    }
    return acc + purchase.rating;
  }, 0);

  user.Item.rating = totalRatings ? totalRatings / ratingCount : totalRatings;

  return user;
}