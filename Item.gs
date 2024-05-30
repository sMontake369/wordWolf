function GenerateItem(max = 10) { //今は一つだけ
  return "ワード占い"
}

function UseItem(json)
{
  if(!IsRoomNotStart(json)) {}
  else return
  
  var spell = SelectrecordFirst("Player",["A",json.source.userId])[8]
  if(spell == "ワード占い") GetRandomPlayerWord(json)
  else if(spell == "使用済み") ReplyMessage(json.replyToken,"アイテムは使用済みです!")
}

function GetRandomPlayerWord(json)
{
  miss = 0
  var sessionID = SelectrecordFirst('Player', ['A', json.source.userId])[3];
  var menber = SelectrecordAll("Player", ["D", sessionID])
  var random = parseInt(Math.random() * menber.length)
  if(json.source.userId == menber[random][0])
  {
    ReplyMessage(json.replyToken,"占いが失敗した、、、")
    Update("Player",["A",json.source.userId],["I","使用済み"])
    return
  }
  else if(Math.random() * 5 <= 2)
  {
    if(random != 0) miss = -1
    else miss = 1
  }
  ReplyMessage(json.replyToken, menber[random][1] + "さんのワードはズバリ「" + menber[random + miss][4] + "」でしょう!")
  Update("Player",["A",json.source.userId],["I","使用済み"])
}