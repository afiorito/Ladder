const ddbGeo = require('dynamodb-geo');
import PostManager from '../geo-manager';
const uuid = require('uuid');
import AWS from 'aws-sdk';
import * as dynamoDbLib from '../dynamodb-helper';

const postManager = PostManager(new AWS.DynamoDB());
const config = postManager.getGeoDataManagerConfiguration();

// Use GeoTableUtil to help construct a CreateTableInput.
const createTableInput = ddbGeo.GeoTableUtil.getCreateTableRequest(config);
// try to modify here
createTableInput.AttributeDefinitions.push({
  AttributeName: "userId",
  AttributeType: 'S'
})
createTableInput.GlobalSecondaryIndexes = [
  {
    IndexName: config.postIndexName,
    KeySchema: [
      {
        AttributeName: "userId",
        KeyType: "HASH"
      },
      {
        AttributeName: "postId",
        KeyType: "RANGE"
      }
    ],
    Projection: {
      ProjectionType: "ALL"
    },
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  }
];

// Tweak the schema as desired
createTableInput.ProvisionedThroughput.ReadCapacityUnits = 5;
createTableInput.ProvisionedThroughput.WriteCapacityUnits = 5;

console.log('Creating table with schema:');
console.dir(createTableInput, { depth: null });
// Create the table
postManager.createTable(createTableInput)
.then((err, data) => {
  if (err) {
    console.error(`Unable to create table. Error JSON: ${JSON.stringify(err, null, 2)}`);
  } else {
    console.log(`Created table. Table description: ${JSON.stringify(data, null, 2)}`);
  }
})
// .then(() => {
//   return postManager.putPoint({
//     RangeKeyValue: { S: '1234' },
//     GeoPoint: {
//       latitude: 45.655673199999995,
//       longitude: -73.5523254
//     },
//     PutItemInput: {
//       Item: {
//         title: { S: "My Post" },
//         userId: { S: "USERID" }
//       }
//     }
//   }).promise();
// })
// .then(() => {
//   const params = {
//     TableName: "posts",
//     IndexName: config.postIndexName,
//     KeyConditionExpression: "userId = :userId AND postId = :postId",
//     ExpressionAttributeValues: {
//       ":userId": "USERID", // use just userId for users
//       ":postId": "1234"
//     }
//   }
//   return dynamoDbLib.call('query', params);
// })
// .then(query => {
//   console.log(query.Items);
// })
// .then(function () {
//     console.log('Querying by radius, looking 100km from MTL');
//     return postManager.queryRadius({
//         RadiusInMeter: 100000,
//         CenterPoint: {
//             latitude: 45.4802383,
//             longitude: -73.8581226
//         }
//     })
// })
// .then(console.log)
.then(() => {process.exit(0)})
.catch(console.warn);