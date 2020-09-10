var chineseConverter = require("./utils/chineseConverter");
const { google,youdao,baidu } = require('translation.js')

var path = require("path");
const rootPath = process.cwd();

const configPath = rootPath + '/produceLanDictCfg.json';

const fs = require('fs');
let config = require(configPath);
var translator = youdao;
if (config.translator === 'google'){
    translator = google;
}
else if (config.translator === 'youdao'){
    translator = youdao;
}
else if (config.translator === 'baidu'){
    translator = baidu;
}

let currentDict;
try{
    currentDict = require(rootPath + '/' + config.langFile);
}
catch(e){
}

let enDict;
try{
    enDict = require(rootPath + '/' + config.enLangFile);
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

let getKeyValue = (obj, objKey, key, type) => {
    return new Promise((resolve, reject)=>{
        if (type === 'zh'){
            resolve('\t\'' + key + '\'' + ': ' + '\'' + obj[key] + '\'' + ',\n');
        }
        else if (type === 'cht') {
            resolve('\t\'' + key + '\'' + ': ' + '\'' + chineseConverter.s2t(obj[key]) + '\'' + ',\n');
        }
        else if (type === 'en') {
            if (enDict && enDict[objKey] && enDict[objKey][key]){
                console.log('using translate result from en file directly: '+obj[key]+' -> ' + upperFirstLetter(enDict[objKey][key]));
                resolve('\t\'' + key + '\'' + ': ' + '\'' + upperFirstLetter(enDict[objKey][key].replace(/\'/g, '\\\'')) + '\'' + ',\n');
            }
            else {
                translator.translate(obj[key]).then(res => {
                    if (res.result && res.result.length > 0){
                        console.log('translate to en from internet: '+obj[key]+' -> ' + upperFirstLetter(res.result[0]));
                        resolve('\t\'' + key + '\'' + ': ' + '\'' + upperFirstLetter(res.result[0].replace(/\'/g, '\\\'')) + '\'' + ',\n');
                    } else {
                        console.error('translate failure: '+obj[key]);
                        resolve('\t\'' + key + '\'' + ': ' + '\'' + obj[key] + '\'' + ',\n');
                    }
                }).catch(err=>{
                    console.error('translate failure: '+obj[key]);
                    resolve('\t\'' + key + '\'' + ': ' + '\'' + obj[key] + '\'' + ',\n');
                });
            }
        }
    })
}

let genKeyValue = function*(obj, objKey, type){
    let sortedObjKeys = Object.keys(obj).sort();
    for (let i = 0; i < sortedObjKeys.length; i++){
        let key = sortedObjKeys[i];
        yield getKeyValue(obj, objKey, key, type);
    }
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
    if (config.outTs){
        output += 'let res = {};\n\n'
    }
    else {
        output += 'var res = {};\n\n'
    }
    var sortedObjKeys = Object.keys(dict).sort();
    let key;
    for (var i = 0; i < sortedObjKeys.length; i++){
        key = sortedObjKeys[i];
        let kvGen = genKeyValue(dict[key], key, type);
        output += 'res.' + key + ' = ' + '{\n';
        let yn = kvGen.next();
        while (!yn.done){
            let value = await yn.value;
            output += value;
            yn = kvGen.next();
        }
        output += '}\n';
    }
    output += '\n';
    //输出底部指令
    if (config.outTs){
        output += 'export default res';
    }
    else {
        output += 'if ( typeof module === "object" && module && typeof module.exports === "object" ) {\n';
        output += '\tmodule.exports = res;\n';
        output += '} else if ( typeof define === "function" && define.amd ) {\n';
        output += '\tdefine([], function () {\n';
        output += '\t\treturn res;\n';
        output += '\t});\n';
        output += '}';
    }
    if (type === 'zh'){
        writeLangFile(rootPath + '/' + config.langFile, output);
    }
    else if (type === 'cht'){
        writeLangFile(rootPath + '/' + config.traditionalLangFile, output);
    }
    else if (type === 'en'){
        writeLangFile(rootPath + '/' + config.enLangFile, output);
    }
}
output('zh')
if (config.traditionalLangFile){
    output('cht')
}
if (config.enLangFile){
    output('en')
}