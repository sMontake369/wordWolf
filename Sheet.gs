//スプレッドシートのID
let ss = SpreadsheetApp.openById('SpreadSheetの共有コード');
let alphabet = ['A','B','C','D','E','F','G','H','I','J'];


function Insert(sheetname, data) //data = Aからのデータの配列
{
  var sheet = ss.getSheetByName(sheetname);
  var i = 2;
  while(sheet.getRange('A' + i).isBlank() == false) {
    i++;
  }
  var j = 0;
  while(j < data.length) {
    sheet.getRange(alphabet[j] + i).setValue(data[j]);
    j++;
  }
}

function Delete(sheetname, where) //where = [削除したいデータがある行の英数字,データ]
{
  var sheet = ss.getSheetByName(sheetname)
  for(var i = 2;i < sheet.getLastRow() + 1;i++) {
    if(sheet.getRange(where[0] + String(i)).getValue() == where[1])
    {
      sheet.deleteRow(i)
      i = 0
    }
  }
}


function SelectrecordFirst(sheetname, where) //where = [探したいデータがある行の英数字,データ]
{
  var sheet = ss.getSheetByName(sheetname);
  var i = 2;
  while(sheet.getRange(where[0] + String(i)).getValue() != where[1]) {
    i++;
    if (i > sheet.getLastRow()) {return 'Not_Found'}
  }
  return sheet.getRange('A' + i + ':' + 'J' + i).getValues()[0];
}

function SelectrecordAll(sheetname, where) //where = [探したいデータがある行の英数字,データ]
{
  var sheet = ss.getSheetByName(sheetname)
  var data = []
  for(var i = 1;i < sheet.getLastRow() + 1;i++) {
    if(sheet.getRange(where[0] + String(i)).getValue() == where[1])
    {
      data.push(sheet.getRange('A' + i + ':' + 'J' + i).getValues()[0]);
    }
  }
  if(data == "") return "Not_Found"
  return data
}


function Selectcolumn(sheetname, where, column) //where = [探したいデータがある列の英数字,データ] column = ほしい列の英数字
{
  var sheet = ss.getSheetByName(sheetname);
  var data = [];
  var j = 0;
  for (var i = 2;sheet.getRange(where[0] + i).isBlank() == false; i++) {
    if (sheet.getRange(where[0] + String(i)).getValue() == where[1] || where[1] == "") {
      data[j] = sheet.getRange(column + String(i)).getValue();
      j++;
    }
  }
  return data;
}


function Update(sheetname, where, data) //where = [変更したいデータがある行の英数字,データ]　//data = [変更したい行の英数字,変更したいデータ]
{
  var sheet = ss.getSheetByName(sheetname);
  var i = 2;
  while(sheet.getRange(where[0] + String(i)).getValue() != where[1]) {
    i++;
    if (i > sheet.getLastRow()) return 'Not_Found'
  }
  sheet.getRange(data[0] + String(i)).setValue(data[1]);
}

/*
function DeleteAllRowsExceptFirst(sheetname) //最初の列以外をすべて削除
{
  var sheet = ss.getSheetByName(sheetname);
  var dataRange = sheet.getDataRange();   // シートのデータ範囲を取得
  var numRows = dataRange.getNumRows();  // データ範囲の行数を取得
  if(numRows > 1) sheet.deleteRows(2, numRows - 1);
}
*/


