//Google Analytics Data Fetch Here
function articleMain(){
  config();
  setYesterdayDate(); //Functions.gs
  articleMetrcis();
}

function articleMetrcis(){
  for (var i = 0; i < coreMarkets.length; i++) {
    var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(coreMarkets[i]);
    if (!sheet) {
      SpreadsheetApp.openById(spreadsheetId).insertSheet(coreMarkets[i]);
    }
    getArticleGATotalViews(coreMarkets[i]);
  } 
}

function getArticleGATotalViews(sheetName){
  var dataForbatchUpdate = [];
  var gaViewId = getGAViewId(sheetName);
    // Set up the parameters  and variables
    //var sheetName = 'Intro'; // The name of the sheet (not the Spreadsheet) we want to write the data e.g Sheet1
    var tableId = gaViewId;
    //+'ga:67674693'; // The id of the view to query the data from e.g ga:123456
    var startDate = dateFromExecute;//'2020-10-01'; // The start date of the query with the appropriate format e.g 2018-04-01 (1 April 2018)
    var endDate = dateToExecute; //'2020-10-04'; // The end date of the query with the appropriate format e.g 2018-04-30 (30 April 2018)
   
    //var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    //var sheet = spreadsheet.getSheetByName(sheetName);
  var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);
   

    // Set Up the query arguments
    //var metrics = ['ga:pageviews,ga:avgTimeOnPage,ga:bounceRate'];
  var metrics = ['ga:pageviews'];
    var options = {
        //'dimensions': 'ga:pagePath',
      'dimensions': 'ga:Date',
      'filters': 'ga:pagePath=~/web-view',
        'sort': '-ga:pageviews',
        //'segment': '',
        'samplingLevel': 'HIGHER_PRECISION',
        //'max-results': '5' // To limit the results to 5. Maximum number of results: 10000
    }

    try{
      // Fetch the report
      var report = articleGAGet(tableId, startDate, endDate, metrics, options);
      var data = report.rows;
      if(data.length){
        for (var i = 0; i < data.length; i++) {
          var cellNo = 10; 
          var gaDate = data[i][0];
          var year = gaDate.substring(0, 4);
          var month = gaDate.substring(4, 6);
          var day = gaDate.substring(6, 8);
          var term = year + '-' + month + '-' + day;
          var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);
          var lastColumnNo = sheet.getLastColumn();
          var columnValues = [
            [data[i][1]]
          ];
          var lastColumnNo = sheet.getLastColumn()+1;
          var activeColumn = columnToLetter(lastColumnNo);
          var dataSearch = sheet.getRange(sheetName+'!B1:'+activeColumn+'1').getValues();//A1 - Holds Date Headers
          var isDateAlreadyExists = false;
          var sheetDateCellName = '';
          for(var j = 0; j<dataSearch[0].length;j++){
            if(isDate(dataSearch[0][j])){
              if(formatDate(dataSearch[0][j]) == term){ 
                isDateAlreadyExists = true;
                sheetDateCellName = columnToLetter((j+2).toString());
                break;
                //return (j+1).toString();
              }
            }
          }
          if(isDateAlreadyExists == false){
            sheetDateCellName = activeColumn;
            _createDateHeaderOnSheet(sheet, activeColumn, sheetName, term);
          }
          if(cellNo){
            var dataAdd = {};
            dataAdd.range = sheetName+'!'+sheetDateCellName+cellNo+':'+sheetDateCellName+cellNo;
            dataAdd.majorDimension = 'COLUMNS';
            dataAdd.values = columnValues;
            dataForbatchUpdate.push(dataAdd);
          }
        }
        var request = {
          'valueInputOption': 'USER_ENTERED',
          'data': dataForbatchUpdate
        };
        var response = Sheets.Spreadsheets.Values.batchUpdate(request, spreadsheetId);
        Logger.log(sheetName + ' Article Generator Results updated');
      }else{
        Logger.log(sheetName + ' Article Generator: No data found');
      }
      
      
      // Get the range to write and write the results
      //var writeRange = sheet.getRange(1, 1, data.length, data[0].length) // Read reference for getRange arguments
      //writeRange.setValues(data);
    }catch(err){
      Logger.log(err);
      Logger.log(tableId + " Table View Id");
    }
}

function articleGAGet(tableId, startDate, endDate, metrics, options) {
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