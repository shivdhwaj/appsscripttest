/**
 * Lists Analytics accounts.
 */
function listAccounts() {
  var accounts = Analytics.Management.Accounts.list();
  if (accounts.items && accounts.items.length) {
    for (var i = 0; i < accounts.items.length; i++) {
      var account = accounts.items[i];
      Logger.log('Account: name "%s", id "%s".', account.name, account.id);

      // List web properties in the account.
      listWebProperties(account.id);
    }
  } else {
    Logger.log('No accounts found.');
  }
}

/**
 * Lists web properites for an Analytics account.
 * @param  {string} accountId The account ID.
 */
function listWebProperties(accountId) {
  var webProperties = Analytics.Management.Webproperties.list(accountId);
  if (webProperties.items && webProperties.items.length) {
    for (var i = 0; i < webProperties.items.length; i++) {
      var webProperty = webProperties.items[i];
      Logger.log('\tWeb Property: name "%s", id "%s".', webProperty.name,
          webProperty.id);

      // List profiles in the web property.
      listProfiles(accountId, webProperty.id);
      }
  } else {
    Logger.log('\tNo web properties found.');
  }
}

/**
 * Logs a list of Analytics accounts profiles.
 * @param  {string} accountId     The Analytics account ID
 * @param  {string} webPropertyId The web property ID
 */
function listProfiles(accountId, webPropertyId) {
  // Note: If you experience "Quota Error: User Rate Limit Exceeded" errors
  // due to the number of accounts or profiles you have, you may be able to
  // avoid it by adding a Utilities.sleep(1000) statement here.

  var profiles = Analytics.Management.Profiles.list(accountId,
      webPropertyId);
  if (profiles.items && profiles.items.length) {
    for (var i = 0; i < profiles.items.length; i++) {
      var profile = profiles.items[i];
      Logger.log('\t\tProfile: name "%s", id "%s".', profile.name,
          profile.id);
    }
  } else {
    Logger.log('\t\tNo web properties found.');
  }
}


function mainGA(){
    config();
    // Set up the parameters  and variables
    var sheetName = 'Intro'; // The name of the sheet (not the Spreadsheet) we want to write the data e.g Sheet1
  var tableId = 'ga:67674693'; // The id of the view to query the data from e.g ga:123456
    var startDate = '2020-10-01'; // The start date of the query with the appropriate format e.g 2018-04-01 (1 April 2018)
    var endDate = '2020-10-04'; // The end date of the query with the appropriate format e.g 2018-04-30 (30 April 2018)
   
    //var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    //var sheet = spreadsheet.getSheetByName(sheetName);
  var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);
   

    // Set Up the query arguments
    //var metrics = ['ga:pageviews,ga:avgTimeOnPage,ga:bounceRate'];
  var metrics = ['ga:pageviews'];
    var options = {
        //'dimensions': 'ga:pagePath',
      'filters': 'ga:pagePath=~baby-name-generator',
        'sort': '-ga:pageviews',
        //'segment': '',
        'samplingLevel': 'HIGHER_PRECISION',
        'max-results': '5' // To limit the results to 5. Maximum number of results: 10000
    }

    // Fetch the report
    var report = gaGet(tableId, startDate, endDate, metrics, options);
    var data = report.rows;

    // Get the range to write and write the results
    var writeRange = sheet.getRange(1, 1, data.length, data[0].length) // Read reference for getRange arguments
    writeRange.setValues(data);

}

function gaGet(tableId, startDate, endDate, metrics, options) {
    // Apply standard options
    options = options || {};
    options['max-results'] = options['max-results'] || '10000';
    // If errors persist up to 5 times then terminate the program.
    for (var i = 0; i < 5; i++) {
        try {
          return Analytics.Data.Ga.get(tableId, startDate, endDate, metrics, options); // 503
        } catch (err) {
          // https://developers.google.com/analytics/devguides/reporting/core/v3/coreErrors
          if (err.message.indexOf('a server error occurred') > -1) {
            Logger.log('Backend Error');
            // Note: Don't listen to Google's reply and retry request after 2 minutes
            Utilities.sleep(2 * 60 * 1000);
          } else if (err.message.indexOf('User Rate') > -1) {
            Logger.log('Rate Limit Error');
            // Exponential Backoff
            Utilities.sleep(1000 * Math.pow((i + 1), 2));
          } else if (err.message.indexOf('too many concurrent connections') > -1) {
            Logger.log('Concurrent Connections Error');
            // Exponential Backoff
            Utilities.sleep(1000 * Math.pow((i + 1), 2));
          } else {
            Logger.log(err);
            throw err;
          }
        }
    }
    throw 'Error. Max retries reached';
  }