function getUser(){
  //We are making server call here, if runs successfully then we can grab the data from apis as well
  var url = api_url;
  Logger.log(url);
  var response = UrlFetchApp.fetch(url);
  var json = response.getContentText();
  Logger.log(json);
  var data = JSON.parse(json);
  Logger.log(data.push_title);
}
function isDate(date) {
        return (new Date(date) !== "Invalid Date") && !isNaN(new Date(date));
      }
function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}
function setDateHeaderToSheet(){
  setYesterdayDate();
  //Logger.log(coreMarkets);
  //activeColumn = '';
  for (var i = 0; i < coreMarkets.length; i++) {
    var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(coreMarkets[i]);
    var lastColumnNo = sheet.getLastColumn()+1;
    activeColumn = columnToLetter(lastColumnNo);
    sheet.insertColumnAfter(lastColumnNo);
    //Logger.log('Market: '+coreMarkets[i])
    //Logger.log('Active Column: '+activeColumn)
    var request = {
        'valueInputOption': 'USER_ENTERED',
        'data': [
          {
            'range': coreMarkets[i]+'!'+activeColumn+'1:'+activeColumn+'1',
            'majorDimension': 'COLUMNS',
            'values': [[dateToExecute]]
          }
        ]
      };
    let term = dateToExecute;
    let data = sheet.getRange(coreMarkets[i]+'!B1:'+activeColumn+'1').getValues();//A1 - Holds Date Headers
    //Logger.log(coreMarkets[i]+'!A2:'+activeColumn+'1');
    var isDateAlreadyExists = false;
    for(var j = 0; j<data[0].length;j++){
      if(isDate(data[0][j])){
        if(formatDate(data[0][j]) == term){ 
          isDateAlreadyExists = true;
          Logger.log('[ERROR] ['+coreMarkets[i]+']- Date Already Found - '+formatDate(data[0][j])+ ', At Cell - '+(j+1).toString());
          break;
          //return (j+1).toString();
        }
      }
    }
    if(isDateAlreadyExists == false){
       var response = Sheets.Spreadsheets.Values.batchUpdate(request, spreadsheetId);
       var sheet = sheet.getRange(coreMarkets[i]+'!'+activeColumn+'1:'+activeColumn+'1').setBackground("#00FFFF");
       //Logger.log(response);
    }
  } 
}

function setYesterdayDate() {
  
  var today = new Date();
  /*
  Logger.log(Utilities.formatDate(today, 'Asia/Singapore', 'MMMM dd, yyyy HH:mm:ss Z'));
  */
  var yesterday = new Date(new Date().setDate(new Date().getDate()-2));//Reason BigQuery DBs Get data one day after actual collection dumped 
  //dateToExecute = Utilities.formatDate(yesterday, 'Asia/Singapore', 'YYYYMMdd');
  dateToExecute = Utilities.formatDate(yesterday, 'Asia/Singapore', 'YYYY-MM-dd');
  //dateToExecute = '2020-09-10';
  //Logger.log(dateToExecute);
} 


//This function will create sheet tab if not there for core markets and set the column a values 
function addSheetsTabForCoreMarkets(){
  //We need to make sure the alignment with the cell values for daily data
  var columnAValues = [
      [
        'Feature/Date',
        'Recipes Detail', 'Recipe Home', 'Recipe Listing','Recipe search','Recipe bookmark', 'Collection listing', '',
        'Medicine','Medicine Category','Medicine Category Click', '',
        'Play Video','Play Audio','Collection',''
      ]
    ];
  //If we add new cells then it should auto be added without errors
  var totalCellsColumnA = columnAValues[0].length;
  var data = [];
  for (var i = 0; i < coreMarkets.length; i++) {
    var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(coreMarkets[i]);
    if (!sheet) {
      SpreadsheetApp.openById(spreadsheetId).insertSheet(coreMarkets[i]);
    }
    var dataAdd = {};
    dataAdd.range = coreMarkets[i]+'!A1:A'+totalCellsColumnA;
    dataAdd.majorDimension = 'COLUMNS';
    dataAdd.values = columnAValues;
    data.push(dataAdd);
  } 
  var request = {
      'valueInputOption': 'USER_ENTERED',
      'data': data
    };
  var response = Sheets.Spreadsheets.Values.batchUpdate(request, spreadsheetId);
  //Logger.log(response);
}


function columnToLetter(column)
{
  var temp, letter = '';
  while (column > 0)
  {
    temp = (column - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    column = (column - temp - 1) / 26;
  }
  return letter;
}

function letterToColumn(letter)
{
  var column = 0, length = letter.length;
  for (var i = 0; i < length; i++)
  {
    column += (letter.charCodeAt(i) - 64) * Math.pow(26, length - i - 1);
  }
  return column;
}

function getBigQuerySqlRequest(table){
  var request = {
    query:
      "#standardSQL " +
      "\n" +
      "SELECT DATE as date,Country as country,target, SUM (COUNT) as count " +
      "FROM " +
      schemaTable +
      "." +
      table +
      " " +
      "Where DATE BETWEEN '2020-09-10' AND '2020-09-20' Group by DATE, Country,target Order by DATE ASC;",
    //"Where DATE BETWEEN '"+dateToExecute+"' AND '"+dateToExecute+"' Group by DATE, Country,target Order by DATE ASC;"
  };
  return request;
}