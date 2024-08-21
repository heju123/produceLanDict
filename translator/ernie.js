const request = require('sync-request')
const AK = "WaEhNGHuWTjfA2FIR0UQ5h7J"
const SK = "bLwLWP2f4CDwd1zyagwwdoIw8VGLSv9e"

/**
 * 使用 AK，SK 生成鉴权签名（Access Token）
 * @return string 鉴权签名信息（Access Token）
 */
async function getAccessToken() {
    let res = request("POST", 'https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=' + AK + '&client_secret=' + SK)
    return JSON.parse(res.getBody()).access_token;
}

let accessToken = ''
async function translate(textArr, type) {
    if (!accessToken){
        accessToken = await getAccessToken();
    }
    let req = {
        "messages": [
            {
                "role": "user",
                "content": `将下列文字翻译成${type === 'en' ? '英文' : type === 'cht' ? '繁体' : '英文'},用json格式返回：\n` + JSON.stringify(textArr)
            }
        ],
        "temperature": 0.95,
        "top_p": 0.8,
        "penalty_score": 1,
        "disable_search": false,
        "enable_citation": false,
        "response_format": "text"
    };
    console.log(`requestText：\n${req.messages[0].content}`)
    let res = request("POST", 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions?access_token=' + accessToken, {
        json: req
    });
    let parseResult = JSON.parse(res.getBody()).result;
    console.log(`result：${parseResult}\n`)
    let resultJSONStr = parseResult.replace(/^```json|```$/g, '');
    let result = JSON.parse(resultJSONStr);
    return result;
}
    
const ernie = {
    translate: async (textArr, type)=>{
        return await translate(textArr, type)
    }
}

module.exports = ernie;