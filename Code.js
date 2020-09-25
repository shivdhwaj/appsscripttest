var projectId = '';
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

function main(){
  config();
  //This is the main function we are planing to run
  addSheetsTabForCoreMarkets();
  //setDateHeaderToSheet();
  recipeMain();
  sleepScriptJS();
  medicineMain();
  sleepScriptJS();
  mediaMain();
}

function deleteCoreSheets(){
  //config();
  for (var i = 0; i < coreMarkets.length; i++) {
    var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(coreMarkets[i]);
    if(sheet)
      SpreadsheetApp.openById(spreadsheetId).deleteSheet(sheet);
  }
}

function oneTimer(){
  addSheetsTabForCoreMarkets();
}


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function sleepScriptJS() {
  //console.log('Taking a break...');
  await sleep(2000);
  //console.log('Two seconds later, showing sleep in a loop...');

  // Sleep in loop
  for (let i = 0; i < 5; i++) {
    if (i === 3)
      await sleep(2000);
    //console.log(i);
  }
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