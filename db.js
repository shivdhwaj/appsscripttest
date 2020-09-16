/**
 * Replace the variables in this block with real values.
 * You can find the "Instance connection name" in the Google Cloud
 * Platform Console, on the instance Overview page.
 */
var connectionName = '';
var user = '';
var userPwd = '';
var db = '';

var dbUrl = 'jdbc:google:mysql://' + connectionName + '/' + db;

/**
 * Read up to 1000 rows of data from the table and log them.
 */
//Trying to connect to the server and grab the details if possible for this 
function readFromTable() {
  var conn = Jdbc.getCloudSqlConnection(dbUrl, user, userPwd);

  var conn = Jdbc.getConnection(
    'jdbc:mysql://',
    '',
    ''
  );
  
  var start = new Date();
  var stmt = conn.createStatement();
  stmt.setMaxRows(1000);
  var results = stmt.executeQuery('SELECT * FROM users where id = ');
  var numCols = results.getMetaData().getColumnCount();

  while (results.next()) {
    var rowString = '';
    for (var col = 0; col < numCols; col++) {
      rowString += results.getString(col + 1) + '\t';
    }
    Logger.log(rowString);
  }

  results.close();
  stmt.close();

  var end = new Date();
  Logger.log('Time elapsed: %sms', end - start);
}