import config from '../../config';

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
  TableName: 'users',
  KeySchema: [
    { AttributeName: 'userId', KeyType: 'HASH'}
  ],
  AttributeDefinitions: [
    { AttributeName: 'userId', AttributeType: 'S'}
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5
  }
};

dynamodb.createTable(params, function(err, data) {
  if (err) {
    console.error(`Unable to create table. Error JSON: ${JSON.stringify(err, null, 2)}`);
  } else {
    console.log(`Created table. Table description: ${JSON.stringify(data, null, 2)}`);
  }
}); 