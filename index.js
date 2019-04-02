const fs = require('fs');
let config = require('./config.json');
const currentDict = require(config.langFile);

//例：(?!aaa) 匹配不包含aaa字符串
let def = {
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
    for (let key in obj)
    {
        result += '\t\'' + key + '\'' + ': ' + '\'' + obj[key] + '\'' + ',\n';
    }
    result = result.substring(0, result.lastIndexOf(',')) + '\n';
    return result;
}

let dict = currentDict;

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
            if (ext === '.html' || ext === '.js')
            {
                resolveFile(path + "/" + ele);
            }
        }
    })
}

paths.forEach((path)=>{
    if (path.lastIndexOf('/**') === path.length - 3)//**结尾
    {
        readDirSync(path.substring(0, path.length - 3));
    }
    else
    {
        resolveFile(path);
    }
});

//输出结果
let output = '//简体\n';
output += 'var res = {};\n\n';
for (let key in dict)
{
    output += 'res.' + key + ' = ' + '{\n' + getKeyValueStr(dict[key]) + '}\n';
}
output += '\n';
output += 'if ( typeof module === "object" && module && typeof module.exports === "object" ) {\n';
output += '\tmodule.exports = res;\n';
output += '} else if ( typeof define === "function" && define.amd ) {\n';
output += '\tdefine([], function () {\n';
output += '\t\treturn res;\n';
output += '\t});\n';
output += '}';
fs.writeFileSync(__dirname + '/' + config.langFile, output);