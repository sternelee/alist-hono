export default async function push(
  uid: string,
  content: string,
  summary = '订阅消息'
) {
  return await fetch('https://wxpusher.zjiecode.com/api/send/message', {
    method: 'POST',
    body: JSON.stringify({
      appToken: process.env.WX_PUSH_Token, //必传
      content, //必传
      //消息摘要，显示在微信聊天页面或者模版消息卡片上，限制长度20(微信只能显示20)，可以不传，不传默认截取content前面的内容。
      summary,
      //内容类型 1表示文字  2表示html(只发送body标签内部的数据即可，不包括body标签，推荐使用这种) 3表示markdown
      contentType: 2,
      //发送目标的topicId，是一个数组！！！，也就是群发，使用uids单发的时候， 可以不传。
      topicIds: [123],
      //发送目标的UID，是一个数组。注意uids和topicIds可以同时填写，也可以只填写一个。
      uids: [uid],
      //原文链接，可选参数
      url: 'https://wxpusher.zjiecode.com',
      //是否验证订阅时间，true表示只推送给付费订阅用户，false表示推送的时候，不验证付费，不验证用户订阅到期时间，用户订阅过期了，也能收到。
      //verifyPay字段即将被废弃，请使用verifyPayType字段，传verifyPayType会忽略verifyPay
      verifyPay: false,
      //是否验证订阅时间，0：不验证，1:只发送给付费的用户，2:只发送给未订阅或者订阅过期的用户
      verifyPayType: 0,
    }),
  });
}
