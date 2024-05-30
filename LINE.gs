let ACCESS_TOKEN = 'APIキーを入力';
// 応答メッセージ用のAPI URL
let replyURL = 'https://api.line.me/v2/bot/message/reply';
let sendURL = 'https://api.line.me/v2/bot/message/push';

class QuickReplyData{
  constructor(imageURL, label, text){
    this.imageURL = imageURL;
    this.label = label;
    this.text = text;
  }
}

//playerの情報を取得
function GetPlayerInfo(userID)
{
  const profileURL = `https://api.line.me/v2/bot/profile/${userID}`;

  const options = {
    "method": "get",
    "headers": {
      "contentType": "application/json",
      "Authorization": "Bearer " + ACCESS_TOKEN
    }
  };
  var result = JSON.stringify(UrlFetchApp.fetch(profileURL, options).getContentText());
  if(result == null) return "アカウント情報が取得できませんでした。"
  return result
}


//メッセージを返信
function ReplyMessage(replyToken, message)
{
  UrlFetchApp.fetch(replyURL, {
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + ACCESS_TOKEN,
    },
    'method': 'post',
    'payload': JSON.stringify({
      'replyToken': replyToken,
      'messages': [{
        'type': 'text',
        'text': message,
      }]
    })
  });
}


//メッセージを送信
function SendMessage(lineID, message)
{
  UrlFetchApp.fetch(sendURL, {
    "muteHttpExceptions":true,
    "method": "get",
    "contentType": "application/json",
    "headers": { "Authorization": "Bearer " + ACCESS_TOKEN },
    "payload": JSON.stringify({
      "to": lineID,
      messages: [{
        type: "text",
        text: message
      }]
    })
  });
}

//クイックリプライを返信
function ReplyMessageWithQuickReply(replyToken, text, quickReplyData) //quickReplyData = QuickReplyDataクラスのリスト
{
  var items = [];
  for(var i = 0;i < quickReplyData.length;i++)
  {
    item =
    {
      "type": "action",
      "imageUrl": quickReplyData[i].imageURL,
      "action": {
        "type": "postback",
        "label": quickReplyData[i].label,
        "data": quickReplyData[i].text
      }
    },
    items.push(item)
  }

  UrlFetchApp.fetch(replyURL, {
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + ACCESS_TOKEN,
    },
    'method': 'post',
    'muteHttpExceptions' : true,
    'payload': JSON.stringify({
      'replyToken': replyToken,
      messages: [
        {
          "type": "text",
          "text": text,
          "quickReply": {
            "items": items
          }
        }
      ],
    })
  });
}


//ボタン付きメッセージを返信
function ReplyButton(replyToken, title, text, postbackData)
{
  UrlFetchApp.fetch(replyURL, {
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + ACCESS_TOKEN,
    },
    'method': 'post',
    'payload': JSON.stringify({
      'replyToken': replyToken,
			"messages": [
				{
					"type": "template",
					"altText": title,
					"template": {
						"type": "buttons",
						"thumbnailImageUrl": "https://placehold.jp/640x480.jpg?text=参加する!!", // 画像のURL
						"imageAspectRatio": "rectangle",
						"imageSize": "cover",
						"imageBackgroundColor": "#FFFFFF",
						"title": title,
						"text": text,
						"defaultAction": {
              "type": "postback",
              "label": "参加する!",
              "data": postbackData
						},
						"actions": [
							{
              "type": "postback",
              "label": "参加する!",
              "data": postbackData
							}
						]
					}
				}
      ]
    })
  })
  return ContentService.createTextOutput(JSON.stringify({'content': 'post ok'})).setMimeType(ContentService.MimeType.JSON);
}

//ボタン付きメッセージを送信
function SendMessageAndButton(lineID, text, title, description, buttonText, imageURL, postbackdata) //個人チャットにワードとアイテム渡し用
{
  UrlFetchApp.fetch(sendURL, {
    "muteHttpExceptions":true,
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + ACCESS_TOKEN,
    },
    'method': 'get',
    'payload': JSON.stringify({
      "to":lineID,
			"messages": [
        {
          "type":"text",
          "text": text
        },
				{
					"type": "template",
					"altText": title,
					"template": {
						"type": "buttons",
						"thumbnailImageUrl": imageURL, // 画像のURL
						"imageAspectRatio": "rectangle",
						"imageSize": "cover",
						"imageBackgroundColor": "#FFFFFF",
						"title": title,
						"text": description,
						"actions": [
							{
              "type": "postback",
              "label": buttonText,
              "data": postbackdata
							}
						]
					}
				}
      ]
    })
  })
}

//複数のボタン付き画像を返信する
function ReplyImageCarousel(replyToken, text, option)
{
	/* イメージマップメッセージを送る */
  UrlFetchApp.fetch(replyURL, {
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + ACCESS_TOKEN,
    },
    'method': 'post',
    'payload': JSON.stringify({
      'replyToken': replyToken,
			"messages": [
        {
          "type":"text",
          "text": text
        },
        {
        "type": "template",
        "altText": "選択肢から一つ選ぶ",
        "template": {
          "type": "image_carousel",
          "columns": option
        }
      }],
			"notificationDisabled": false // trueだとユーザーに通知されない
		}),
	});
}

//複数のボタン付き画像を送信する
function SendImageCarousel(lineID, text, option) //EndGameでどうしても使う
{
	/* イメージマップメッセージを送る */
  UrlFetchApp.fetch(sendURL, {
    "muteHttpExceptions":true,
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + ACCESS_TOKEN,
    },
    'method': 'get',
    'payload': JSON.stringify({
      "to":lineID,
			"messages": [
        {
          "type":"text",
          "text": text
        },
        {
        "type": "template",
        "altText": "選択肢から一つ選ぶ",
        "template": {
          "type": "image_carousel",
          "columns": option
        }
      }],
			"notificationDisabled": false // trueだとユーザーに通知されない
		}),
	});
}

