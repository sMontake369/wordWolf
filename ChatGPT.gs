let API_KEY = 'APIキーを入力';

//ChatGPTのAPIのエンドポイントを設定
let apiURL = 'https://api.openai.com/v1/chat/completions';

function GenerateSentence(reqirement, question) {
  //ChatGPTに投げるメッセージを定義(ユーザーロールの投稿文のみ)
  var messages = [
    {'role': 'system', 'content': reqirement},
    {'role': 'user', 'content': question}];

  //OpenAIのAPIリクエストに必要なヘッダー情報を設定
  const headers = {
    'Authorization':'Bearer '+ API_KEY,
    'Content-type': 'application/json',
    'X-Slack-No-Retry': 1
  };
  //ChatGPTモデルやトークン上限、プロンプトをオプションに設定
  const options = {
    'muteHttpExceptions' : true,
    'headers': headers, 
    'method': 'POST',
    'payload': JSON.stringify({
      'model': 'gpt-4',
      'max_tokens' : 256,
      'temperature' : 0.9,
      'messages': messages})
  };
  return JSON.parse(UrlFetchApp.fetch(apiURL, options).getContentText('UTF-8')).choices[0].message.content;
}

//ワードを二つ生成
function MakeWord(category) {
  questionspell = SelectrecordFirst("Category",["A", category])[2]
  var words = GenerateSentence("今からワードウルフを行います。", questionspell)
  Logger.log(words)
  return words.split(',');
}






