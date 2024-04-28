# produceLanDict
## 介绍
	自动生成国际化字典文件
## 安装及使用方式
> 运行 npm install -g produce_lan_dict 安装  
> 在项目根目录创建produceLanDictCfg.json文件，配置需要处理的js或Html文件位置，在这些js或html文件内先写好国际化所需要的标识代码，比如 l('com.test', '国际化测试')。写好后无需再定义字典文件内容，produceLanDict 
会帮您处理好一切，配置好字典文件位置后，运行produce_lan_dict即可生成好字典文件。注：如果字典文件已存在，则会在原来的基础上新增或覆盖。  
## 配置方式   
```javascript
var config = {
  "langFile": "./assets/lang/zh.js",// 字典文件路径
  "traditionalLangFile": "assets/lang/cht.js",//繁体字典文件输出路径，不配置就不生成繁体版
  "enLangFile": "assets/lang/en.js",//英文字典文件输出路径，不配置就不生成英文版
  "resolveFiles": [// 批量处理的js或html
    "./search/**"
  ],
  "match": [// 匹配标识符的正则表达式
          {
              "regExp": /(\'|\")(((?!\'|\").)*?)(\'|\")\.\l\((\'|\")(((?!\'|\").)*?)(\'|\")\)/,
              "key": 6,// key所在正则表达式数组的位置
              "value": 2// value所在正则表达式数组的位置
          },
          {
              "regExp": /\l\((\'|\")(((?!\'|\").)*?)(\'|\")\s*\,\s*(\'|\")(((?!\'|\").)*?)(\'|\")\)/,
              "key": 2,
              "value": 6
          }
      ],
  "exportMode": "amd&cmd", // 生成字典文件导出类型，不传默认按es6模块导出，设置为amd&cmd会按amd和cmd格式导出
  "batchQueryNumber": 40 // 一个批次查询的条数，不传默认40，传太大可能有单条句子太长，会导致请求字数超上限，设置太小会影响翻译效率，设置大小可以综合评估
}
```
## 生成规则  
	会自动生成繁体和英文，繁体严格根据简体来转换，就算修改生成好的繁体文件，下次生成后繁体文件也会被重置成修改前的样子，所以繁体文件是不能手动修改的，应该和简体文件保持一致。
	而如果修改生成好的英文文件，下次生成不会还原修改的内容，这样做是为了兼容翻译不准确或不成功，需要手动矫正的情况。
