var path = require("path");
const rootPath = process.cwd();

const configPath = rootPath + '/produceLanDictCfg.json';

const fs = require('fs');
const ernie = require("./translator/ernie");
let config = require(configPath);
var translator = ernie;

// 注意：如果翻译不准，则手动修改.cmd.js文件，直接修改.js文件会被覆盖无效
let currentDict;
try{
    let filename = config.langFile.substring(0, config.langFile.lastIndexOf('.'))
    currentDict = require(rootPath + '/' + filename + '.cmd.js');
}
catch(e){
}

let enDict;
try{
    let filename = config.enLangFile.substring(0, config.enLangFile.lastIndexOf('.'))
    enDict = require(rootPath + '/' + filename + '.cmd.js');
}
catch(e){
}

let traditionalDict;
try{
    let filename = config.traditionalLangFile.substring(0, config.traditionalLangFile.lastIndexOf('.'))
    traditionalDict = require(rootPath + '/' + filename + '.cmd.js');
}
catch(e){
}

//例：(?!aaa) 匹配不包含aaa字符串
let def = {
    "langFile": "zh.js",
    "resolveFiles": ["**"],
    "match": [
        {
            "regExp": /(\'|\")(((?!\'|\").)*?)(\'|\")\.\l\((\'|\")(((?!\'|\").)*?)(\'|\")\)/,
            "key": 6,
            "value": 2
        },
        {
            "regExp": /\W\l\((\'|\")(((?!\'|\").)*?)(\'|\")\s*\,\s*(\'|\")(((?!\'|\").)*?)(\'|\")\)/,
            "key": 2,
            "value": 6
        }
    ]
}
config = Object.assign({}, def, config);

let forEachByReg = (reg, input, callback) => {
    let all = [];
    let result;
    while ((result = reg.exec(input)) != null){
        all.push(result);
    }
    all.forEach((match)=>{
        callback(match);
    });
}

/** 遍历a.b.c这种格式的值 */
let literateDotKey = (path, callback) => {
    let itemsMatch = path.match(/(\w|\$)+/g);
    itemsMatch.forEach((item, index)=>{
        callback(item, index, itemsMatch.length);
    });
}

let setDict = (baseObj, path, value) => {
    let current = baseObj;
    literateDotKey(path, (key, index, maxLen) => {
        if (!current.hasOwnProperty(key))
        {
            if (index < maxLen - 1)//不是最后一个，则定义为对象
            {
                current[key] = {};
            }
            else
            {
                current[key] = value;
            }
        }
        current = current[key];
    });
}

let upperFirstLetter = (str)=>{
    return str.charAt(0).toUpperCase() + str.slice(1);
}
let formatValue = (value)=>{
    return value.replace(/\"/g, '\\\"')
}
let batchTranslate = async (batchTranslateGroup, type)=>{
    let transResult = await ernie.translate(batchTranslateGroup.map(item=>item.value), type)
    let transResultArr = transResult;
    let result = ''
    batchTranslateGroup.forEach((item, itemindex)=>{
        let transText = formatValue(transResultArr[itemindex]);
        if (type === 'en'){
            transText = upperFirstLetter(transText)
        }
        result += '\t\"' + item.key + '\"' + ': ' + '\"' + transText + '\"' + ',\n'
    })
    return result;
}
let getKeyValue = async (obj, objKey, keys, type) => {
    let result = '';
    let batchTranslateGroup = [];
    for (let i = 0; i < keys.length; i++){
        if (type === 'zh'){
            result += '\t\"' + keys[i] + '\"' + ': ' + '\"' + obj[keys[i]] + '\"' + ',\n'
        }
        else {
            if (type === 'en' && enDict && enDict[objKey] && enDict[objKey][keys[i]]){
                console.log('using translate result from en file directly: '+obj[keys[i]]+' -> ' + formatValue(enDict[objKey][keys[i]]));
                result += '\t\"' + keys[i] + '\"' + ': ' + '\"' + formatValue(enDict[objKey][keys[i]]) + '\"' + ',\n';
            }
            else if (type === 'cht' && traditionalDict && traditionalDict[objKey] && traditionalDict[objKey][keys[i]]){
                console.log('using translate result from cht file directly: '+obj[keys[i]]+' -> ' + formatValue(traditionalDict[objKey][keys[i]]));
                result += '\t\"' + keys[i] + '\"' + ': ' + '\"' + formatValue(traditionalDict[objKey][keys[i]]) + '\"' + ',\n';
            }
            else {
                // 只包含一个中文字符，会误判，所以单独请求
                if (/^[\u4E00-\u9FA5]$/.test(obj[keys[i]])){
                    result += await batchTranslate([{
                        key: keys[i],
                        value: obj[keys[i]]
                    }], type)
                }
                else {
                    batchTranslateGroup.push({key: keys[i], value: obj[keys[i]]});
                    // 组内超过10条，或者当前条是最后一条执行
                    if (batchTranslateGroup.length >= 20){ 
                        result += await batchTranslate(batchTranslateGroup, type)
                        batchTranslateGroup = []
                    }
                }
            }
        }
    }
    // 最后少于10条的待翻译内容
    if (batchTranslateGroup.length > 0){
        result += await batchTranslate(batchTranslateGroup, type)
        batchTranslateGroup = []
    }
    return result;
}

let genKeyValue = async function(obj, objKey, type){
    let sortedObjKeys = Object.keys(obj).sort();
    return await getKeyValue(obj, objKey, sortedObjKeys, type);
}

let dict = currentDict || {};

const paths = config.resolveFiles;

let resolveFile = (path)=>{
    console.log('resolve file ' + path);
    let resolveData = fs.readFileSync(path, 'utf8');

    config.match.forEach((match)=>{
        forEachByReg(new RegExp(match.regExp, 'g'), resolveData, (submatch)=>{
            setDict(dict, submatch[match.key], submatch[match.value]);
        });
    });
}

let readDirSync = (path)=>{
    var pa = fs.readdirSync(path);
    pa.forEach(function(ele,index){
        var info = fs.statSync(path+"/"+ele)
        if(info.isDirectory()){
            readDirSync(path + "/" + ele);
        }else{
            let ext = ele.substring(ele.lastIndexOf('.'));
            if (ext === '.html' || ext === '.js' || ext === '.tsx' || ext === '.ts')
            {
                resolveFile(path + "/" + ele);
            }
        }
    })
}

paths.forEach((path)=>{
    if (path.lastIndexOf('**') === path.length - 2)//**结尾
    {
        readDirSync(rootPath + "/" + path.substring(0, path.length - 2));
    }
    else
    {
        resolveFile(rootPath + "/" + path);
    }
});

// 递归创建目录 异步方法
function mkdirs(dirname, callback) {
    fs.exists(dirname, function (exists) {
        if (exists) {
            callback();
        } else {
            mkdirs(path.dirname(dirname), function () {
                fs.mkdir(dirname, callback);
            });
        }
    });
}

let writeFile = function(basePath, fileName, data){
    return new Promise((resolve, reject)=>{
        // 打开文件
        fs.open(basePath+'/'+fileName, `w`, function(err, fd) {
            if (err) {
                reject(err);
            }

            fs.writeFile(basePath+'/'+fileName, data, function (err) {
                if (err) {
                    reject(err);
                }
                fs.close(fd, function(){});
                resolve();
            });
        });
    });
};

let writeLangFile = function(path, data){
    let dir = path.substring(0, path.lastIndexOf('/'));
    let fileName = path.substring(path.lastIndexOf('/') + 1, path.length);
    mkdirs(dir, ()=>{
        writeFile(dir, fileName, data).then(()=>{
        }, (err)=>{
        });
    });
}

//输出结果
let output = async function(type){
    let output = '';
    output += 'var res = {};\n\n'
    var sortedObjKeys = Object.keys(dict).sort();
    let key;
    for (var i = 0; i < sortedObjKeys.length; i++){
        key = sortedObjKeys[i];
        let values = await genKeyValue(dict[key], key, type);
        output += 'res.' + key + ' = ' + '{\n';
        output += values;
        output += '}\n';
    }
    output += '\n';

    let outputCmd = output;
    //输出底部指令
    output += 'export default res';
    outputCmd += 'module.exports = res';
    let filename = ''
    if (type === 'zh'){
        filename = config.langFile.substring(0, config.langFile.lastIndexOf('.'))
    }
    else if (type === 'cht'){
        filename = config.traditionalLangFile.substring(0, config.traditionalLangFile.lastIndexOf('.'))
    }
    else if (type === 'en'){
        filename = config.enLangFile.substring(0, config.enLangFile.lastIndexOf('.'))
    }
    writeLangFile(rootPath + '/' + filename + '.js', output);
    writeLangFile(rootPath + '/' + filename + '.cmd.js', outputCmd);
}
output('zh')
if (config.traditionalLangFile){
    output('cht')
}
if (config.enLangFile){
    output('en')
}