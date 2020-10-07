function adminAPIMain(){
  config();
  setYesterdayDate(); //Functions.gs
  updateAPIDataToSheet();
}

function updateAPIDataToSheet(){
  for (var i = 0; i < coreMarkets.length; i++) {
    var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(coreMarkets[i]);
    if (!sheet) {
      SpreadsheetApp.openById(spreadsheetId).insertSheet(coreMarkets[i]);
    }
    var sheetName = coreMarkets[i];
    //Logger.log("Sheet Name: "+sheetName);
    var countryId = getCountryIdFromName(sheetName);
    var datesArray = getDates(dateFromExecute, dateToExecute);
    datesArray.forEach(function(date) {
      Logger.log("[AdminAPIDigest] [Line:19] ["+sheetName+"] Current Processing Date: "+date);
      processDateCountryWiseAPI(sheetName, countryId, date, date);
      sleepScriptJS();
    });
    
  } 
}

function processDateCountryWiseAPI(sheetName, countryId, dateFromExecute, dateToExecute){
  var dataForbatchUpdate = [];
  try{
      var apiData = getDataFromAdminAPI(countryId, dateFromExecute, dateToExecute);
      //Logger.log(Object.keys(apiData).length);
      //Logger.log(apiData);
      if(apiData){
        for (var k = 0; k < Object.keys(apiData).length; k++) {
          var cellNo = ''; 
          var term = Object.keys(apiData)[k];
          var dateObject = apiData[Object.keys(apiData)[k]];
          Object.keys(dateObject).forEach( function(key) {
            var keyDObj = key;
            var valDObj = dateObject[key];
            var cTerm  = term;
            cellNo = getCellNoForAdminAPIByKey(keyDObj);
            //Logger.log(dateObject[key]) ;// baz
            var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);
            var lastColumnNo = sheet.getLastColumn()+1;
            var columnValues = [[valDObj]];
            var activeColumn = columnToLetter(lastColumnNo);
            var dataSearch = sheet.getRange(sheetName+'!B1:'+activeColumn+'1').getValues();//A1 - Holds Date Headers
            var isDateAlreadyExists = false;
            var sheetDateCellName = '';
            for(var j = 0; j<dataSearch[0].length;j++){
              if(isDate(dataSearch[0][j])){
                if(formatDate(dataSearch[0][j]) == cTerm){ 
                  isDateAlreadyExists = true;
                  sheetDateCellName = columnToLetter((j+2).toString());
                  break;
                  //return (j+1).toString();
                }
              }
            }
            if(isDateAlreadyExists == false){
              sheetDateCellName = activeColumn;
              _createDateHeaderOnSheet(sheet, activeColumn, sheetName, cTerm);
            }
            if(cellNo){
              var dataAdd = {};
              dataAdd.range = sheetName+'!'+sheetDateCellName+cellNo+':'+sheetDateCellName+cellNo;
              dataAdd.majorDimension = 'COLUMNS';
              dataAdd.values = columnValues;
              dataForbatchUpdate.push(dataAdd);
            }
          });
        }
        var request = {
          'valueInputOption': 'USER_ENTERED',
          'data': dataForbatchUpdate
        };
        var response = Sheets.Spreadsheets.Values.batchUpdate(request, spreadsheetId);
        //Logger.log(response);
        Logger.log(sheetName + ' Admin API Results updated');
        sleepScriptJS();
      }else{
        Logger.log(sheetName + ' Admin API : No data found');
      }
    }catch(err){
      Logger.log(err);
      Logger.log(countryId+ "" +sheetName + " Admin API Failed for date range: "+ dateFromExecute + " - "+dateToExecute)
    }
}

function getCellNoForAdminAPIByKey(key){
  var cellNo = '';
  switch(key){
      case "questions_external": cellNo = 44; break;
      case "questions_internal": cellNo = 45; break;
      case "question_follow_external": cellNo = 46; break;
      case "questions_like_external": cellNo = 47; break;
      case "answers_external": cellNo = 48; break;
      case "answers_internal": cellNo = 49; break;
      case "answers_like_external": cellNo = 50; break;
      case "answers_like_internal": cellNo = 51; break;
      case "comments": cellNo = 52; break;
      case "user_follow_external": cellNo = 53; break;
      case "poll_votes": cellNo = 55; break;
      case "poll_likes": cellNo = 56; break;
      case "poll_comments": cellNo = 57; break;
      case "pictures": cellNo = 59; break;
      case "picture_likes": cellNo = 60; break;
      case "picture_comments": cellNo = 61; break;
      case "kick_counter": cellNo = 8; break;
      case "checklist_home": cellNo = 12; break;
      case "reward_redeem": cellNo = 37; break;
      case "contest_participants": cellNo = 39; break;
      case "frames": cellNo = 62; break;
      case "sticker": cellNo = 63; break;
  }
  return cellNo;
}