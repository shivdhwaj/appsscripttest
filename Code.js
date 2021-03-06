var projectId = '';
var dateFromExecute = '';
var dateToExecute = '';
var rows = '';
var spreadsheetId = '';
var coreMarkets = '';
var activeSheetName = '';
var activeColumn = '';
var tableToQuery = '';
var schemaTable = '';
var api_url = ''; 
var dateRowBackgroundColor = "#134F5C";
var dateRowFontColor = "#FFFFFF";
var emailAddress = '';

function main(){
  Logger.log("[Code] [Main] [17] Main Function Started");
  //deleteCoreSheets();
  config();
  //This is the main function we are planing to run
  addSheetsTabForCoreMarkets();
  freezeFirstColumnAndRow();
  //setDateHeaderToSheet();
  
  recipeMain();
  sleepScriptJS();
  medicineMain();
  sleepScriptJS();
  mediaMain();
  sleepScriptJS();
  trackerMain();
  sleepScriptJS();
  activityMain();
  sleepScriptJS();
  foodMain();
  sleepScriptJS();
  babyMain();
  sleepScriptJS();
  articleMain();
  sleepScriptJS();
  adminAPIMain();
  
  Logger.log("[Code] [Main] [43] Main Function Ended");
}

function deleteCoreSheets(){
  config();
  for (var i = 0; i < coreMarkets.length; i++) {
    var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(coreMarkets[i]);
    if(sheet)
      SpreadsheetApp.openById(spreadsheetId).deleteSheet(sheet);
  }
}

function sendEmail(emailAddress){
  MailApp.sendEmail(emailAddress, 'GAScript Run [Done]', 'GAScript Run Emailer');
}

function oneTimer(){
  addSheetsTabForCoreMarkets();
}



/**
 * Add a new sheet with some properties.
 * @param {string} spreadsheetId The spreadsheet ID.
 */
function addSheet() {
  var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName("Singapore");
  if (sheet != null) {
    Logger.log(sheet.getIndex());
  }
  var lr = sheet.getLastRow();
  Logger.log('SG: Last Row:'+ lr);
  var lc = sheet.getLastColumn();
  Logger.log('SG: Last Column:'+ lc);
  
  var activateSheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName("Indonesia");
  var lr = activateSheet.getLastRow();
  Logger.log('ID: Last Row:'+ lr);
  var lc = activateSheet.getLastColumn();
  Logger.log('ID: Last Column:'+ lc);
  
  /*var requests = [{
    'addSheet': {
      'properties': {
        'title': 'Recipe',
        'gridProperties': {
          'rowCount': 20,
          'columnCount': 12
        },
        'tabColor': {
          'red': 1.0,
          'green': 0.3,
          'blue': 0.4
        }
      }
    }
  }];

  var response =
      Sheets.Spreadsheets.batchUpdate({'requests': requests}, spreadsheetId);
  Logger.log('Created sheet with ID: ' +
      response.replies[0].addSheet.properties.sheetId);
  */
}

/**
 * Write to multiple, disjoint data ranges.
 * @param {string} spreadsheetId The spreadsheet ID to write to.
 */
function writeToMultipleRanges(spreadsheetId) {
  // Specify some values to write to the sheet.
  var columnAValues = [
    ['Item', 'Wheel', 'Door', 'Engine']
  ];
  var rowValues = [
    ['Cost', 'Stocked', 'Ship Date'],
    ['$20.50', '4', '3/1/2016']
  ];

  var request = {
    'valueInputOption': 'USER_ENTERED',
    'data': [
      {
        'range': 'Sheet1!G1:G4',
        'majorDimension': 'COLUMNS',
        'values': columnAValues
      },
      {
        'range': 'Sheet1!H1:J2',
        'majorDimension': 'ROWS',
        'values': rowValues
      }
    ]
  };

  var response = Sheets.Spreadsheets.Values.batchUpdate(request, spreadsheetId);
  Logger.log(response);
}