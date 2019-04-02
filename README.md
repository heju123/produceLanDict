# produceLanDict
## 介绍
	自动生成国际化字典文件内容
## 安装及使用方式
> 运行 npm install -g produceLanDict 安装  
> 在项目根目录创建produceLanDictCfg.json文件，配置需要处理的js或Html文件位置，在这些js或html文件内先写好国际化所需要的标识代码，比如 l('com.test', '国际化测试')。写好后无需再定义字典文件内容，produceLanDict 
会帮您处理好一切。需要先创建字典文件，再配置好字典文件位置。最后，运行node produceLanDict即可生成好字典文件内容并自动写入。住：字典文件中如果原先定义了一些值也不会被覆盖掉。  
## 配置方式   
```javascript
var config = {
  "langFile": "./assets/lang/zh.js",// 字典文件路径
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
      ]
}
```