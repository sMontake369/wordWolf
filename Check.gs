//メッセージの送信元がグループラインかどうか
function IsGroupLine(json)
{
  //jsonの中身にgroupIdという名のキーはあるか
  if (json.source.groupId == undefined) {
    ReplyMessage(json.replyToken, 'このコマンドはグループラインで行ってください！');
    return 1;
  }
  return 0;
}


//部屋に参加しているプレイヤーかどうか
function IsValidPlayer(json)
{
  //開始するを入力したプレイヤーを取得
  var userID = json.source.userId;

  //そのプレイヤーがすでにどこかの部屋に参加している
  if (SelectrecordFirst('Player', ['A', userID])[0] == userID) {
    var data = GetPlayerInfo(userID);
    var playername = data.split(/"/g)[8].split("\\")[0];
    ReplyMessage(json.replyToken, playername + 'さんはすでに部屋に参加しています!');
    return 1;
  }
  return 0;
}


//部屋がすでに作成されていないか
function IsValidRoom(json)
{
  //確認に必要な情報を取得
  var groupID = json.source.groupId;

  //ルームがすでに作られているか
  if (SelectrecordFirst('WordWolf', ['B', groupID])[1] == groupID) {
    ReplyMessage(json.replyToken, 'すでに部屋が作成されています!\n作り直す場合は一度「end」と入力し、部屋を削除してください!');
    return 1;
  }
  return 0;
}


//ゲーム中かどうか
function IsRoomStarted(json)
{
  //確認に必要な情報を取得
  var groupID = json.source.groupId;
  var sessionID = SelectrecordFirst('WordWolf', ['B', groupID])[0];

  if (SelectrecordFirst('WordWolf', ['A', sessionID])[2] != 'プレイヤー募集中') {
    ReplyMessage(json.replyToken, 'ゲームが既に始まっています!');
    return 1;
  }
  return 0;
}

//ゲームがまだ始まっていないか
function IsRoomNotStart(json)
{
  //確認に必要な情報を取得
  var player = SelectrecordFirst('Player', ['A', json.source.userId]);

  if (player == "Not_Found" || SelectrecordFirst('WordWolf', ['A', player[3]])[2] != 'ゲーム進行中') {
    ReplyMessage(json.replyToken, 'ゲームはまだ始まってません!');
    return 1;
  }
  return 0;
}


//部屋が存在するかどうか
function IsNotValidRoom(json)
{
  //確認に必要な情報を取得
  var groupID = json.source.groupId;
  var status = SelectrecordFirst('WordWolf', ['B', groupID]);
  if (status == 'Not_Found') {
    ReplyMessage(json.replyToken, '部屋が作成されていません!');
    return 1;
  }
  return 0;
}

//過去1日以内にゲームで遊んだかどうか
function IsPastData(json)
{
  //確認に必要な情報を取得
  var groupID = json.source.groupId;
  var status = SelectrecordFirst('WordWolf', ['B', groupID]);
  if (status == 'Not_Found' || status[2] != 'ゲーム終了') {
    ReplyMessage(json.replyToken, '過去のゲームデータが存在しません!\nまだ一度も遊んでいないか、1日経過して削除された可能性があります');
    return 1;
  }
  return 0;
}

//プレイヤーが3人以上いるか
function IsEnoughPlayer(json)
{
  //必要な情報を取得
  var groupID = json.source.groupId;
  var sessionID = SelectrecordFirst('WordWolf', ['B', groupID])[0];
  var playernum = SelectrecordFirst('WordWolf', ['A', sessionID])[3];

  if (playernum < 3) {
    ReplyMessage(json.replyToken, 'このゲームは最低3人以上いないと遊べません!');
    return 1;
  }
  return 0;
}


//まだ投票していないか
function Isvoted(json)
{
  var voted = SelectrecordFirst('Player', ['A', json.source.userId])[6]

  if (voted == '投票済み') {
    var playername = SelectrecordFirst('Player', ['A', json.source.userId])[1];
    ReplyMessage(json.replyToken, playername + 'さんはすでに投票されています!');
    return 1;
  }
  return 0;
}


