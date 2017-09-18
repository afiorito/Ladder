const ddbGeo = require('dynamodb-geo');
const AWS = require('aws-sdk');

// Set up AWS
var awsConfig = {
  region: 'us-east-1',
};
if (process.env.ENDPOINT) {
  awsConfig.endpoint = "http://localhost:8000";
}
AWS.config.update(awsConfig);

function TableManager(dynamodb = new AWS.DynamoDB()) {
  const ddb = dynamodb;

  const config = new ddbGeo.GeoDataManagerConfiguration(ddb, 'posts');
  config.rangeKeyAttributeName = "postId";
  config.hashKeyLength = 3;
  config.userIndexName = "user-index";
  config.postIndexName = "post-index";

  const tableManager = new ddbGeo.GeoDataManager(config);

  ddbGeo.GeoDataManager.prototype.createTable = createTableInput => {
    return ddb.createTable(createTableInput).promise();
  }

  return tableManager;
}

export default TableManager;

// const ddb = new AWS.DynamoDB();

// // Configuration for a new instance of a GeoDataManager. Each GeoDataManager instance represents a table
// const config = new ddbGeo.GeoDataManagerConfiguration(ddb, 'posts');
// config.rangeKeyAttributeName = "postId";
// config.hashKeyLength = 3;
// config.userIndexName = "user-index";
// config.postIndexName = "post-index";

// // Instantiate the table manager
// const tableManager = new ddbGeo.GeoDataManager(config);

// ddbGeo.GeoDataManager.prototype.createTable = createTableInput => {
//   return ddb.createTable(createTableInput).promise();
// }

// ddbGeo.GeoDataManager.prototype.ddb = ddb;

// export default tableManager;
