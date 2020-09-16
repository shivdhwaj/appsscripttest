function recipeMain(){
  setYesterdayDate(); //Functions.gs
  getRecipeCountMetrics(); //Recipe.gs
  recipeUpdateDataToSheet(); //Recipe.gs
}



function getRecipeCountMetrics(){
  Logger.log("Date to execute "+dateToExecute);
  var request = getBigQuerySqlRequest('recipe_count_metrics_core_markets_master');
  var queryResults = BigQuery.Jobs.query(request, projectId);
  var jobId = queryResults.jobReference.jobId;

  // Check on status of the Query Job.
  var sleepTimeMs = 500;
  while (!queryResults.jobComplete) {
    Utilities.sleep(sleepTimeMs);
    sleepTimeMs *= 2;
    queryResults = BigQuery.Jobs.getQueryResults(projectId, jobId);
  }

  // Get all the rows of results.
  rows = queryResults.rows;
  while (queryResults.pageToken) {
    queryResults = BigQuery.Jobs.getQueryResults(projectId, jobId, {
      pageToken: queryResults.pageToken
    });
    rows = rows.concat(queryResults.rows);
  }
  recipeUpdateDataToSheet();
}

function recipeUpdateDataToSheet() {
  cellWillStartFrom = 2;
  var dataForbatchUpdate = [];
  if (rows) {
    var countryData = [];
    var cellNo = '';
    var data = new Array(rows.length);
    for (var i = 0; i < rows.length; i++) {
      var cols = rows[i].f;
      data[i] = new Array(cols.length);
      //for (var j = 0; j < cols.length; j++) {
      if(!(cols[1].v in countryData))
        countryData[cols[1].v] = [];
      if(!(cols[0].v in countryData[cols[1].v]))
        countryData[cols[1].v][cols[0].v] = [];
       countryData[cols[1].v][cols[0].v][cols[2].v]= cols[3].v; //Country - Date - Type = Count
      cellNo = getCellNoForRecipe(cols[2].v);
     
      var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(cols[1].v);
      var lastColumnNo = sheet.getLastColumn();
     
      var columnValues = [
        [cols[3].v]
      ];
      //Logger.log(cellNo);
      //Logger.log(countryData[cols[1].v][cols[0].v][cols[2].v]);
      var term = cols[0].v;
      var lastColumnNo = sheet.getLastColumn()+1;
      activeColumn = columnToLetter(lastColumnNo);
      var dataSearch = sheet.getRange(cols[1].v+'!B1:'+activeColumn+'1').getValues();//A1 - Holds Date Headers
      //Logger.log(coreMarkets[i]+'!A2:'+activeColumn+'1');
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
        var request = {
          'valueInputOption': 'USER_ENTERED',
          'data': [
            {
              'range': cols[1].v+'!'+activeColumn+'1:'+activeColumn+'1',
              'majorDimension': 'COLUMNS',
              'values': [[cols[0].v]]
            }
          ]
        };
        var response = Sheets.Spreadsheets.Values.batchUpdate(request, spreadsheetId);
        var sheet = sheet.getRange(cols[1].v+'!'+activeColumn+'1:'+activeColumn+'1').setBackground("#00FFFF");
        //Logger.log(response);
      }
      if(cellNo){
        var dataAdd = {};
        dataAdd.range = cols[1].v+'!'+sheetDateCellName+cellNo+':'+sheetDateCellName+cellNo;
        dataAdd.majorDimension = 'COLUMNS';
        dataAdd.values = columnValues;
        dataForbatchUpdate.push(dataAdd);
      }
      /*var request = {
        'valueInputOption': 'USER_ENTERED',
        'data': [
          {
            'range': cols[1].v+'!'+activeColumn+cellNo+':'+activeColumn+cellNo,
            'majorDimension': 'COLUMNS',
            'values': columnValues
          },
        ]
      };*/
      
      
      //}
    }
    var request = {
      'valueInputOption': 'USER_ENTERED',
      'data': dataForbatchUpdate
    };
    //Logger.log(dataForbatchUpdate);
    var response = Sheets.Spreadsheets.Values.batchUpdate(request, spreadsheetId);
    //Logger.log(response);
    Logger.log(countryData);
    Logger.log('Recipe Results updated');
  } else {
    Logger.log('Recipe No rows returned.');
  }
}

function getCellNoForRecipe(forDataType){
  var cellNo = '';
  if(forDataType == 'recipe details'){
    cellNo = '2';
  }
  if(forDataType == 'recipe home'){
    cellNo = '3';
  }
  if(forDataType == 'recipe listing'){
    cellNo = '4';
  }
  if(forDataType == 'recipe search'){
    cellNo = '5';
  }
  if(forDataType == 'recipe bookmarks'){
    cellNo = '6';
  }
  if(forDataType == 'collection listing'){
    cellNo = '7';
  }
  return cellNo;
}
