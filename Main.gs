//ゲームの制限時間
let GAME_TIME = 2;


//LINEのデータはここで受け取る
function doPost(e)
{
  //受け取ったjsonデータを整形
  var json = JSON.parse(e.postData.contents).events[0];//これないとだめ
  console.log(json)

  //受け取ったデータのタイプがpostbackかどうか
  if (json.type == 'postback') 
  {
    var postbackdata = JSON.stringify(json.postback.data);

    //postbackがプレイヤー追加のデータかどうか
    if (postbackdata.indexOf('invite') !== -1) {
      var sessionID = json.postback.data.replace('invite=', '');
      AddPlayer(json, sessionID);
      return
    //postbackがカテゴリー選択のデータかどうか
    } else if (postbackdata.indexOf('category') !== -1){
      var data = json.postback.data.replace('category=', '');
      StartGame(json, data)
      return 
    //postbackが投票のデータかどうか
    } else if (postbackdata.indexOf('vote') !== -1){
      var data = json.postback.data.replace('vote=', '');
      VotePlayer(json, data);
      return
    }
    //postbackがアイテム使用のデータかどうか
    else if (postbackdata.indexOf('useItem') !== -1){
      UseItem(json);
      return
    }
    //postbackが結果閲覧のデータかどうか
    else if (postbackdata.indexOf('result') !== -1){
      var data = json.postback.data.replace('result=', '');
      Result(json, data);
      return
    } 

  //受け取ったデータのタイプがmessageかどうか
  } else if (json.type == 'message') {
    // ログを記録する関数を呼び出す
    var sessionId = SelectrecordFirst('WordWolf', ['B', json.source.groupId])[0]//sessionId呼び出
    //メッセージがwordwolfかどうか
    if (json.message.text === "wordwolf") {
      CreateRoom(json);
      return
    //メッセージがstartかどうか
    } else if (json.message.text === "start") {
      SelectCategory(json);
      return
    //メッセージがendかどうか
    } else if (json.message.text === "end") {
      DeleteGame(sessionId);
      ReplyMessage(json.replyToken,"部屋を削除しました!")
      return
    //メッセージがresultかどうか
    } else if (json.message.text === "result") {
      Result(json, "結果1");
      return
    } else if (json.message.text === "vote") {
      GameEnd(json.source.groupId)
      return
    } else {
      var status = SelectrecordFirst("WordWolf",["A",sessionId])[2]
      if(status === 'ゲーム進行中') 
      {
        if(json.message.text.includes('CPU') || json.message.text.includes('cpu')) SpeakToCPU(json, sessionId)
        else if(Math.random() * 10 <= 4) CPUTalk(json, sessionId);
        AppendLog(json.source.userId, json.message.text, sessionId);
      }
    }
  }
}

// スプレッドシートにログを記録
function AppendLog(userID, text, sessionId)
{
  var data = GetPlayerInfo(userID);
  var userName = data.split(/"/g)[8].split("\\")[0];
  var sheet = ss.getSheetByName('log');
  sheet.appendRow([userName, text, sessionId]);
}

//部屋の作成
function CreateRoom(json)
{
  //部屋がまだなく、グループLINEで実行しているか
  if (IsGroupLine(json) || IsValidRoom(json)) return

  //必要な情報を取得
  var groupID = json.source.groupId;
  //sessionIDを生成
  var sessionID = Math.floor(Math.random() * 1000000);

  //WordWolfのスプレッドシートに部屋の情報を追加
  Insert('WordWolf', [sessionID, groupID,  'プレイヤー募集中', '1']);
  ReplyButton(json.replyToken, '部屋が作成されました!', '参加するを押してルームに入ってください!\n準備ができたら「start」と入力!', 'invite=' + sessionID);
  //CPU追加
  AddPlayerToSheet(sessionID);
}


//参加ボタンを押したPlyaerを追加する
function AddPlayer(json, sessionID)
{
  //参加するプレイヤーがすでにどこかの部屋に所属していないか
  if (IsGroupLine(json) || IsNotValidRoom(json) || IsValidPlayer(json)) return

  //プレイヤーの情報を入手する
  var userID = json.source.userId;
  var data = GetPlayerInfo(userID);
  var playername = data.split(/"/g)[8].split("\\")[0];
  var image = data.split(/"/g)[12].split("\\")[0];

  //Playerのスプレッドシートにそのプレイヤーを追加
  Insert("Player", [userID, playername, image, sessionID,'-','-','未投票',0]);

  //WordWolfのスプレッドシートの参加人数を1足す
  var playerNum = SelectrecordFirst("WordWolf", ['A', sessionID])[3];
  Update("WordWolf", ['A', sessionID], ['D', playerNum + 1]);
  
  //部屋に参加したことを返信する。
  ReplyMessage(json.replyToken, playername + "さんがルームに参加しました！");
}


//カテゴリー選択を送信する
function SelectCategory(json)
{
  //部屋が作られていて、部屋がまだ始まってなくて、グループLINEで行われていて、プレイヤーが3人以上いるか
  if(!IsGroupLine(json) && !IsNotValidRoom(json) && !IsRoomStarted(json) && !IsEnoughPlayer(json)) {}
  else return

  //カテゴリの情報をCategoryのスプレッドシートから取得する
  var categoryWord = Selectcolumn('Category', ['A', ''], ['A']);
  var categoryURL = Selectcolumn('Category', ['A', ''], ['B']);
  var option = [];

  for(var i = 0;i < categoryWord.length;i++) {
    var selection = {
            "imageUrl": categoryURL[i],
            "action": {
              "type": "postback",
              "label": "ジャンル:" + categoryWord[i],
              "data": "category=" + categoryWord[i]
            }
          }
    option.push(selection);
  }

  //カテゴリーの選択肢を送信する
  ReplyImageCarousel(json.replyToken, 'ゲームを開始します! ジャンルを選択してください!', option);
}


//ゲームを開始する
function StartGame(json, category)
{
  //部屋が作られていて、部屋がまだ始まってなくて、グループLINEで行われていて、プレイヤーが3人以上いるか
  if (!IsGroupLine(json) && !IsNotValidRoom(json) && !IsRoomStarted(json) && !IsEnoughPlayer(json)) {}
  else return

  //必要な情報を取得
  var sessionID = SelectrecordFirst('Player', ['A', json.source.userId])[3];
  var playerIDList = Selectcolumn('Player', ['D', sessionID], 'A');

  //sessionIdの進行状況をゲーム進行中に変更
  Update('WordWolf', ['A', sessionID], ['C', 'ゲーム進行中']);

  //呪文を実行して2つのワードを生成する
  var word = MakeWord(category)
  
  //WordWolfのスプレッドシートにカテゴリーとお題を入れる。
  Update('WordWolf', ['A', sessionID], ['E', category]);
  Update('WordWolf', ['A', sessionID], ['F', word[0]]);
  Update('WordWolf', ['A', sessionID], ['G', word[1]]);
  Update('WordWolf', ['A', sessionID], ['J', GenerateSentence("", "あるキャラクターの説明を1行150文字以内で一人作ってほしい。性格は会話に違いが表れるような面白いものがいい。性別、性格、年齢を考えてほしい")])

  //人狼を決める
  var wolfNumber = Math.floor(Math.random() * 100) % playerIDList.length;
  //Playerのスプレッドシートにワードと役職を入れる
  for (var i = 0; i < playerIDList.length;i++) {

    //アイテムを生成
    var itemData = SelectrecordFirst("Item", ["A", GenerateItem()])

    if (i == wolfNumber) {
      //プレイヤーの個人チャットにワードを送信
      if(playerIDList[i] != null) SendMessageAndButton(playerIDList[i], 'あなたのワードは' + word[1] + 'です！', "アイテム:" + itemData[0], itemData[1], "発動する!", itemData[2], "useItem")

      //Playerスプレッドシートのワードを更新
      Update("Player", ['A', playerIDList[i]], ['E',word[1]]);
      Update("Player", ['A', playerIDList[i]], ['F','人狼']);
      Update('Player', ['A', playerIDList[i]], ['I', itemData[0]]);
    } else {
      //プレイヤーの個人チャットにワードを送信
      if(playerIDList[i] != null) SendMessageAndButton(playerIDList[i], 'あなたのワードは' + word[0] + 'です！', "アイテム:" + itemData[0], itemData[1], "発動する!", itemData[2], "useItem")

      //Playerスプレッドシートのワードを更新
      Update("Player", ['A', playerIDList[i]], ['E',word[0]]);
      Update("Player", ['A', playerIDList[i]], ['F','市民']);
      Update('Player', ['A', playerIDList[i]], ['I', itemData[0]]);
    }
  }

  //現在時間を取得し、WordWolfのスプレッドシートを更新
  var now = new Date();
  var time = now.getTime()
  Update('WordWolf', ['A', sessionID], ['H', time]);

  //Game_time分後にend_gameを実行するトリガーを作成
  ScriptApp.newTrigger('CheckEndGame').timeBased().after(GAME_TIME * 60 * 1000 + 10000).create();

  // 以下のコメントアウトを外して、ChatGPTの発言をログに記録(talk.gs)
  //appendLog(json.source.groupId, "NPC", npcIntroduction);

  ReplyMessage(json.replyToken, 'テーマは' + category + '!\nゲーム時間は' + GAME_TIME + '分です!\nvoteと入力することで投票時間までスキップできます!\nそれではゲームを開始します!')
}

function CheckEndGame()
{
  //現在時間を取得
  var now = new Date();
  //Game_time分前のタイムスタンプ
  var time = now.getTime() - (1000 * 60 * GAME_TIME);

  //ゲームが進行中のデータの開始時間タイムスタンプをすべて持って来る
  var roomList = SelectrecordAll('WordWolf', ['C', 'ゲーム進行中']);
  if(roomList == "Not_Found") return
  for (var i = 0;i < roomList.length;i++) {
    //now_timeと取得したstart_timeを比較し、制限時間を超えているか
    if(time >= parseInt(roomList[i][7])) {
      GameEnd(roomList[i][1])
    }
  }
}

//ゲームを終了し、投票を開始する
function GameEnd(groupID)
{
  if(SelectrecordFirst("WordWolf",["B",groupID])[2] != "ゲーム進行中") return

  //投票に使用する情報を取得する
  var sessionID = SelectrecordFirst('WordWolf', ['B', groupID])[0];
  var images = Selectcolumn('Player', ['D', sessionID], 'C');
  var playernames = Selectcolumn('Player', ['D', sessionID], 'B');

  //プレイヤーと部屋の投票数を1にする
  Update('WordWolf', ['B', groupID], ['I', 1]);

  //投票用optionを作成する
  var option = [];
  for(var i = 0;i < playernames.length;i++) {
    var selection = {
            "imageUrl": images[i],
            "action": {
              "type": "postback",
              "label": "投票する",
              "data": "vote=" + playernames[i]
            }
          }
    option.push(selection);
  }

  //投票の選択肢を送信する
  SendImageCarousel(groupID, 'ゲームが終了しました!\nこれから投票を開始します!\n人狼だと思うプレイヤーに投票してください!', option)

  //部屋の状態を投票中へ更新
  Update('WordWolf', ['A', sessionID], ['C', '投票中']);
  CPUChoice(sessionID);
}

//プレイヤーの投票処理
function VotePlayer(json, votedPlayerName)
{
  if (!IsNotValidRoom(json) && !Isvoted(json)) {}
  else return

  //投票されたプレイヤーの投票数を1足す
  var voteNum = SelectrecordFirst('Player', ['B', votedPlayerName])[7];
  Update('Player', ['A', json.source.userId], ['G', '投票済み']);
  Update('Player', ['B', votedPlayerName], ['H', voteNum + 1]);

  //全体の投票数も1足す
  var groupID = json.source.groupId;
  var groupVoteNum = SelectrecordFirst('WordWolf', ['B', groupID])[8]
  Update('WordWolf', ['B', groupID], ['I', groupVoteNum + 1]);

  //全員の投票が終わったかどうか
  var groupData = SelectrecordFirst('WordWolf', ['B', groupID])
  if (groupVoteNum + 1 >= groupData[3]) 
  {
    //ゲームを終了し、結果を表示方法を伝える
    Update('WordWolf', ['B', json.source.groupId], ['C', 'ゲーム終了']);
    var quickReplyData = new QuickReplyData("https://cdns.iconmonstr.com/wp-content/releases/preview/2012/240/iconmonstr-clipboard-2.png","結果を見る!","result=結果1")
    ReplyMessageWithQuickReply(json.replyToken,'全員の投票が完了しました!\n「result」と入力すると結果を確認できます!',[quickReplyData])
  }
  else
  {
    //投票が完了したことを返信する
    var playerName = SelectrecordFirst('Player', ['A', json.source.userId])[1]
    ReplyMessage(json.replyToken, playerName + 'さんが投票しました!');
  }
}

function Result(json, data)
{
  if(!IsGroupLine(json) && !IsPastData(json)) {}
  else return

  var sessionID = SelectrecordFirst('WordWolf', ['B', json.source.groupId])[0];
  if(data == "結果1")
  {
    var wolfPlayerList = SelectrecordAll("Player", ["F","人狼"])
    for(var i = 0;i < wolfPlayerList.length;i++)
    {
      if(wolfPlayerList[i][3] == sessionID)
      {
        var quickReplyData = new QuickReplyData("https://cdns.iconmonstr.com/wp-content/releases/preview/7.2.0/96/iconmonstr-arrow-right-alt-filled.png","次へ","result=結果2")
        ReplyMessageWithQuickReply(json.replyToken,"人狼は" + wolfPlayerList[i][1] + "さんでした!",[quickReplyData])
      }
    }
  }
  else if(data == "結果2")
  {
    var voteList = "結果\n";
    var menber = SelectrecordAll("Player", ["D", sessionID])
    for(var i = 0;i < menber.length;i++)
    {
      voteList += menber[i][1] + " ワード:" + menber[i][4] + " 投票数:" + menber[i][7] + "票"
      if(i < menber.length - 1) voteList += "\n"
    }
    ReplyMessage(json.replyToken,voteList)
  }
}

function DeleteGame(sessionID)
{
  Delete("WordWolf",["A",sessionID])
  Delete("Player",["D",sessionID])
  Delete("Log",["C",sessionID])
}

function DeleteTrigger() 
{
  const triggers = ScriptApp.getProjectTriggers();
  for(const trigger of triggers)
  if(trigger.getHandlerFunction() == "CheckEndGame") ScriptApp.deleteTrigger(trigger);
}

