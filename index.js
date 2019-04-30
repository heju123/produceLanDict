var path = require("path");
const rootPath = process.cwd();

const configPath = rootPath + '/produceLanDictCfg.json';

const fs = require('fs');
let config = require(configPath);
let currentDict;
try{
    currentDict = require(rootPath + '/' + config.langFile);
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
            "regExp": /\l\((\'|\")(((?!\'|\").)*?)(\'|\")\s*\,\s*(\'|\")(((?!\'|\").)*?)(\'|\")\)/,
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

let getKeyValueStr = (obj) => {
    let result = '';
    var sortedObjKeys = Object.keys(obj).sort();
    sortedObjKeys.forEach((key)=>{
        result += '\t\'' + key + '\'' + ': ' + '\'' + obj[key] + '\'' + ',\n';
    });
    result = result.substring(0, result.lastIndexOf(',')) + '\n';
    return result;
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
            if (ext === '.html' || ext === '.js' || ext === '.tsx')
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
let output = '//简体\n';
output += 'var res = {};\n\n';
var sortedObjKeys = Object.keys(dict).sort();
sortedObjKeys.forEach((key)=>{
    output += 'res.' + key + ' = ' + '{\n' + getKeyValueStr(dict[key]) + '}\n';
});
output += '\n';
output += 'if ( typeof module === "object" && module && typeof module.exports === "object" ) {\n';
output += '\tmodule.exports = res;\n';
output += '} else if ( typeof define === "function" && define.amd ) {\n';
output += '\tdefine([], function () {\n';
output += '\t\treturn res;\n';
output += '\t});\n';
output += '}';
writeLangFile(rootPath + '/' + config.langFile, output);