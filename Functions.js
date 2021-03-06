function setYesterdayDate() {
  
  //var today = new Date();
  /*
  Logger.log(Utilities.formatDate(today, 'Asia/Singapore', 'MMMM dd, yyyy HH:mm:ss Z'));
  */
  var yesterday = new Date(new Date().setDate(new Date().getDate()-1));//Reason BigQuery DBs Get data one day after actual collection dumped 
  //dateToExecute = Utilities.formatDate(yesterday, 'Asia/Singapore', 'YYYYMMdd');
  dateFromExecute = dateToExecute = Utilities.formatDate(yesterday, 'Asia/Singapore', 'YYYY-MM-dd');
  //dateFromExecute = '2020-09-01';
  //dateToExecute = '2020-10-06';
  //Logger.log(dateToExecute);
} 

function getDates(startDate, endDate) {
  var dates = [],
      currentDate = startDate,
      addDays = function(days) {
        var date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;
      };
  while (currentDate <= endDate) {
    dates.push(currentDate);
    currentDate = addDays.call(currentDate, 1);
    currentDate = Utilities.formatDate(currentDate, 'Asia/Singapore', 'YYYY-MM-dd');
  }
  return dates;
};
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

function getDataFromAdminAPI(countryId=192, startDate='2020-10-06', endDate='2020-10-06'){
  config();
   // If errors persist up to 10 times then terminate the program.
    for (var i = 0; i < 10; i++) {
        try {
          var url = api_url+"?country_id="+countryId+"&start_date="+startDate+"&end_date="+endDate;
          Logger.log(url);
          var response = UrlFetchApp.fetch(url);
          var json = response.getContentText();
          //Logger.log(json);
          var data = JSON.parse(json);
          //Logger.log(data);
          //Logger.log(data.status_code);
          if(data.status_code == 200){
            return data.response;
          }
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
          } else if (err.message.indexOf('Request failed for') > -1) {
            Logger.log('Request failed 504 Error: Tried- '+i);
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
  var lastColumnNoPlusOne = sheet.getLastColumn()+1;
  sheet.insertColumnAfter(lastColumnNoPlusOne);
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
  var formulaSumCommunity = "=SUM("+sheetName+"!"+activeColumn+"44:"+activeColumn+"63)";
  var lastColumnNo = sheet.getLastColumn()+1;
  sheet.getRange(sheetName+'!'+activeColumn+'2').setFormula(formulaSum);
  sheet.getRange(sheetName+'!'+activeColumn+'42').setFormula(formulaSumCommunity);
  //sheet.autoResizeColumns(sheetName+'!'+activeColumn+'1', sheetName+'!'+activeColumn+lastColumnNo);
  //sheet.autoResizeColumns(1, lastColumnNo); //Correct Code - uncomment if needed this on sheet
  //Logger.log(response);
  //Logger.log("Functions Script: Line no 281 - _createDateHeaderOnSheet()");
  //Logger.log('getRange: '+sheetName+'!'+activeColumn+'1:'+activeColumn+'1');
  //Logger.log('Formula Sum getRange: '+sheetName+'!'+activeColumn+'2');
  //Logger.log('Formula Sum: '+formulaSum);
}


function getGAViewId(country){
  var viewId = '';
  switch(country){
      case "Malaysia": viewId = ga_view_id_my;break;
      case "Vietnam": viewId = ga_view_id_vn;break;
      case "Philippines": viewId = ga_view_id_ph;break;
      case "Thailand": viewId = ga_view_id_th;break;
      case "Indonesia": viewId = ga_view_id_id;break;
      case "Singapore": viewId = ga_view_id_sg;break;
  }
  return viewId;
}

function getCountryIdFromName(countryName){
  var countryId = '';
  switch(countryName){
      case "Malaysia": countryId = country_id_my;break;
      case "Vietnam": countryId = country_id_vn;break;
      case "Philippines": countryId = country_id_ph;break;
      case "Thailand": countryId = country_id_th;break;
      case "Indonesia": countryId = country_id_id;break;
      case "Singapore": countryId = country_id_sg;break;
  }
  return countryId;
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