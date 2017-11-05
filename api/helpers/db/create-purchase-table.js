const AWS = require('aws-sdk');
var awsConfig = {
  region: 'us-east-1',
};
if (process.env.ENDPOINT) {
  awsConfig.endpoint = "http://localhost:8000";
}
AWS.config.update(awsConfig);

const dynamodb = new AWS.DynamoDB();

const params = {
  TableName: 'purchases',
  KeySchema: [
    { AttributeName: 'purchaseId', KeyType: 'HASH' },
    { AttributeName: 'userId', KeyType: 'RANGE' },
  ],
  AttributeDefinitions: [
    { AttributeName: 'purchaseId', AttributeType: 'S' },
    { AttributeName: 'customerId', AttributeType: 'S' },
    { AttributeName: 'userId', AttributeType: 'S' },
    { AttributeName: 'postId', AttributeType: 'S' },
  ],
  GlobalSecondaryIndexes: [
    {
      IndexName: 'customer_post_index',
      KeySchema: [
        { AttributeName: 'postId', KeyType: 'HASH' },
        { AttributeName: 'customerId', KeyType: 'RANGE' }
      ],
      Projection: {
        ProjectionType: 'ALL',
      },
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      }
    },
    {
      IndexName: 'user_index',
      KeySchema: [{
        AttributeName: "userId",
        KeyType: 'HASH'
      }],
      Projection: {
          ProjectionType: 'ALL',
      },
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      }
    },
    {
      IndexName: 'customer_index',
      KeySchema: [{
        AttributeName: "customerId",
        KeyType: 'HASH'
      }],
      Projection: {
          ProjectionType: 'ALL',
      },
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      }
    }
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5
  }
};

dynamodb.createTable(params).promise()
.then((err, data) => {
  if (err) {
    console.error(`Unable to create table. Error JSON: ${JSON.stringify(err, null, 2)}`);
  } else {
    console.log(`Created table. Table description: ${JSON.stringify(data, null, 2)}`);
  }
})
.then(() => {process.exit(0)})
.catch(console.warn);