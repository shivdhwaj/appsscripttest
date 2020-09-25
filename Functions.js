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
       var sheet = sheet.getRange(coreMarkets[i]+'!'+activeColumn+'1:'+activeColumn+'1').setBackground(dateRowBackgroundColor).setFontColor(dateRowFontColor)
;
       //Logger.log(response);
    }
  } 
}

function setYesterdayDate() {
  
  var today = new Date();
  /*
  Logger.log(Utilities.formatDate(today, 'Asia/Singapore', 'MMMM dd, yyyy HH:mm:ss Z'));
  */
  var yesterday = new Date(new Date().setDate(new Date().getDate()-1));//Reason BigQuery DBs Get data one day after actual collection dumped 
  //dateToExecute = Utilities.formatDate(yesterday, 'Asia/Singapore', 'YYYYMMdd');
  dateFromExecute = dateToExecute = Utilities.formatDate(yesterday, 'Asia/Singapore', 'YYYY-MM-dd');
  dateToExecute = '2020-09-02';
  dateFromExecute = '2020-09-01';
  //Logger.log(dateToExecute);
} 


//This function will create sheet tab if not there for core markets and set the column a values 
function addSheetsTabForCoreMarkets(){
  //config();
  //We need to make sure the alignment with the cell values for daily data
  var columnAValues = [
    [
      'Feature/Date',
      'Total Activities',
      'Pregnancy Tracker',
      'Pregnancy Tracker',
      'Baby Tracker',
      'Baby Tracker',
      'Kick Counter',
      'Kick Counter',
      'Articles',
      'Article Clicks',
      'Checklist',
      'Checklist Home',
      'Medicine',
      'Medicine Category',
      'Medicine Category Click',
      'Medicine',
      'Food & Nutrition',
      'Food & Nutrition Home',
      'Recipes',
      'Recipe Home',
      'Recipe Search',
      'Recipe Listing',
      'Recipes Detail',
      'Collection Listing',
      'Recipe Bookmark',
      'Activities',
      'Activities Home',
      'Baby Name',
      'Baby Name Generator',
      'Media Module',
      'Play Video',
      'Play Audio',
      'Collection',
      'Healing Mode',
      'Healing Mode',
      'Rewards',
      'Rewards Redeem',
      'Contest',
      'Contest Participants',
      '',
      '',
      'Total Interactions',
      'Community',
      'Questions (user)',
      'Questions (internal)',
      'Question Follow (user)',
      'Question Likes (user)',
      'Answers (user)',
      'Answers (internal)',
      'Answers Likes (user)',
      'Answers Likes (internal)',
      'Comments',
      'User Follow (exclude staff)',
      'Polls',
      'Poll Votes',
      'Poll Likes',
      'Poll Comments',
      'Photobooth',
      'Pictures',
      'Picture Likes',
      'Picture Comments',
      'Frames',
      'Sticker',
      ''
    ],
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
  //Logger.log(data);
  var response = Sheets.Spreadsheets.Values.batchUpdate(request, spreadsheetId);
  //Logger.log(response);
  for (var i = 0; i < coreMarkets.length; i++) {
    var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(coreMarkets[i]);
    if (!sheet) {
      var sheet = SpreadsheetApp.openById(spreadsheetId).insertSheet(coreMarkets[i]);
    }
    sheet.getRange("A1").setFontWeight("bold");
    sheet.getRange("A2").setFontWeight("bold").setBackground("#FCE5CD");
    sheet.getRange("A3").setFontWeight("bold").setFontStyle("italic");
    sheet.getRange("A5").setFontWeight("bold").setFontStyle("italic");
    sheet.getRange("A7").setFontWeight("bold").setFontStyle("italic");
    sheet.getRange("A9").setFontWeight("bold").setFontStyle("italic");
    sheet.getRange("A11").setFontWeight("bold").setFontStyle("italic");
    sheet.getRange("A13").setFontWeight("bold").setFontStyle("italic");
    sheet.getRange("A17").setFontWeight("bold").setFontStyle("italic");
    sheet.getRange("A19").setFontWeight("bold").setFontStyle("italic");
    sheet.getRange("A26").setFontWeight("bold").setFontStyle("italic");
    sheet.getRange("A28").setFontWeight("bold").setFontStyle("italic");
    sheet.getRange("A30").setFontWeight("bold").setFontStyle("italic");
    sheet.getRange("A34").setFontWeight("bold").setFontStyle("italic");
    sheet.getRange("A36").setFontWeight("bold").setFontStyle("italic");
    sheet.getRange("A38").setFontWeight("bold").setFontStyle("italic");
    sheet.getRange("A42").setFontWeight("bold").setFontStyle("italic").setBackground("#FFF2CC");
    sheet.getRange("A43").setFontWeight("bold").setFontStyle("italic");
    sheet.getRange("A54").setFontWeight("bold").setFontStyle("italic");
    sheet.getRange("A58").setFontWeight("bold").setFontStyle("italic");
  } 
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
      //"Where DATE BETWEEN '2020-09-10' AND '2020-09-20' Group by DATE, Country,target Order by DATE ASC;",
      "Where DATE BETWEEN '"+dateFromExecute+"' AND '"+dateToExecute+"' Group by DATE, Country,target Order by DATE ASC;"
  };
  return request;
}

function freezeFirstColumnAndRow() {
  //config(); //Need to run this function call if needed independently run needed for this function 
  for (var i = 0; i < coreMarkets.length; i++) {
    var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(
      coreMarkets[i]
    );
    if (!sheet) {
      var sheet = SpreadsheetApp.openById(spreadsheetId).insertSheet(
        coreMarkets[i]
      );
    }
    sheet.setFrozenColumns(1);
    sheet.setFrozenRows(1);
  }
}

function _createDateHeaderOnSheet(sheet, activeColumn, sheetName, cellRowValue){
  //sheet.getRange("B2").setFormula("=SUM(B3:B39)");
  sheetDateCellName = activeColumn;
  var request = {
    'valueInputOption': 'USER_ENTERED',
    'data': [
      {
        'range': sheetName+'!'+activeColumn+'1:'+activeColumn+'1',
        'majorDimension': 'COLUMNS',
        'values': [[cellRowValue]]
      }
    ]
  };
  var response = Sheets.Spreadsheets.Values.batchUpdate(request, spreadsheetId);
  //Logger.log(sheetName+'!'+activeColumn+'1:'+activeColumn+'1');
  sheet.getRange(sheetName+'!'+activeColumn+'1:'+activeColumn+'1').setBackground(dateRowBackgroundColor).setFontColor(dateRowFontColor);
  var formulaSum = "=SUM("+sheetName+"!"+activeColumn+"3:"+activeColumn+"39)";
  var lastColumnNo = sheet.getLastColumn()+1;
  sheet.getRange(sheetName+'!'+activeColumn+'2').setFormula(formulaSum);
  //sheet.autoResizeColumns(sheetName+'!'+activeColumn+'1', sheetName+'!'+activeColumn+lastColumnNo);
  sheet.autoResizeColumns(1, lastColumnNo);
  //Logger.log(response);
  //Logger.log("Functions Script: Line no 281 - _createDateHeaderOnSheet()");
  //Logger.log('getRange: '+sheetName+'!'+activeColumn+'1:'+activeColumn+'1');
  //Logger.log('Formula Sum getRange: '+sheetName+'!'+activeColumn+'2');
  //Logger.log('Formula Sum: '+formulaSum);
}