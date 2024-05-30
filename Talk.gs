var ChatImage = "https://4.bp.blogspot.com/-MvThG03n6v8/WqihS_6rMQI/AAAAAAABKyk/R4AZIF3JgW44bz2JrqgvqIz3eOmBionKwCLcBGAs/s800/animal_ookami_tooboe.png"


function AddPlayerToSheet(sessionID)
{
  // スプレッドシートを取得
  // データを追加する行を作成
  Insert("Player", ['null', 'CPU', ChatImage, sessionID,'-','-','-',0]);
}

//CPUプレイヤーのお題を取得する関数
function GetCPUWord(sessionid)
{
  //同じセッションIDのプレイヤーリストを入手
  var cpuWord = SelectrecordAll("Player",["D",sessionid])[4]
  // リダイレクトでCPUのお題を返す
  return cpuWord; 
}

//修正版：会話用ログを取得する関数
function GetCPUlogList(sessionId, num)
{
  var logList = SelectrecordAll("Log",["C",sessionId])
  var log = ""; // log変数を初期化
  if(logList.length <= num) num = logList.length
  for (var i = logList.length - num; i < logList.length; i++) log += logList[i][0] + ":" + logList[i][1] + "\n";
  return log; // 最終的なログの内容を返す
}

//NPCが発言する関数
function CPUTalk(json, sessionId)
{
  //CPUプレイヤーのお題を取得する関数
  var cpuWord = GetCPUWord(sessionId);
  var personality = SelectrecordFirst("WordWolf",["A",sessionId])[9]

  //発言のプロンプト代入(\nで改行)
  var cpuTalkPrompt = 'あなたと私たちは次のルールに従うワード人狼というゲームをしています。私たちとあなたにはある単語が一つ与えられています。その単語は一人を除いて全員同じです。相手に質問や会話を繰り返していくことで、みんなとは違う一人がもつ単語を推測し、的中させることがこのゲームの勝利条件です。このゲームでは、質問に対して単語を直接言わないでください。このゲームと関係のない会話は絶対にしないでください。出力は必ずゲームに関連する会話を生成してください。\nあなたの特徴は' + personality +'です。なりきってください。\nあなたのワードは' + cpuWord + 'です。直近5回分の会話ログを送信するのであなたが話すべきゲームの会話をNPCとして1文生成してください。出力は 「CPU:+文章」だけです。それ以上は必要ありません';

  //スプレッドシートからログ取得
  var cpuLog = GetCPUlogList(sessionId, 5);
  //ChatGPTでCPUのトークを生成
  var generatedText = GenerateSentence(cpuTalkPrompt, cpuLog);//(会話用プロンプト,会話用ログ)
  //'generatedText'をLINEに送信
  ReplyMessage(json.replyToken, generatedText)
}

function SpeakToCPU(json = 0, sessionId = "879484")
{
  var cpuWord = GetCPUWord(sessionId);
  var personality = SelectrecordFirst("WordWolf",["A",sessionId])[9]

  //発言のプロンプト代入(\nで改行)
  var cpuTalkPrompt = 'あなたと私たちは次のルールに従うワード人狼というゲームをしています。私たちとあなたにはある単語が一つ与えられています。その単語は一人を除いて全員同じです。相手に質問や会話を繰り返していくことで、みんなとは違う一人がもつ単語を推測し、的中させることがこのゲームの勝利条件です。このゲームでは、質問に対して単語を直接言わないでください。このゲームと関係のない会話は絶対にしないでください。出力は必ずゲームに関連する会話を生成してください。\nあなたの特徴は' + personality +'です。なりきってください。\nあなたのワードは' + cpuWord + 'です。あなたへあなたのワードに関して質問を送信するのであなたはその質問の回答を1文生成してください。出力は 「CPU:+文章」だけです。それ以上は必要ありません';
  //ChatGPTでCPUのトークを生成
  var generatedText = GenerateSentence(cpuTalkPrompt, json.message.text)
  ReplyMessage(json.replyToken, generatedText)
}

//NPCが人狼が投票する人を決める関数
function CPUChoice(sessionId)
{
  //スプレッドシートからログ取得
  var cpuLog = GetCPUlogList(sessionId,10);
  //人狼判定のプロンプト代入)(\nで改行)
  var cpuChoicePrompt = 'あなたは次のルールに従うゲームをしています。\n・私たちとあなたにはある単語が与えられています。その単語は一人を除いて全員おなじです。相手に対して質問や会話を繰り返していくことで、みんなとは違う一人がもつ単語を推測し、的中させることがこのゲームの勝利条件です。次で送る会話のログから、少数派の単語が割り当てられているユーザーをあなたが考えてください。\n条件として、ユーザー名のみの返答をお願いします。また他の文字は必要ありません。またさんや様などは付けないでくださいまたCPU以外のプレイヤーを選んでください。';
  //ChatGPTで人狼の名前を生成
  var generatedText = GenerateSentence(cpuChoicePrompt, cpuLog);//(人狼判定プロンプト,人狼判定ログ)

  //投票されたプレイヤーの投票数を1足す
  var voteNum = SelectrecordFirst('Player', ['B', generatedText])[7];
  Update('Player', ['B', generatedText], ['H', voteNum + 1]);
}
