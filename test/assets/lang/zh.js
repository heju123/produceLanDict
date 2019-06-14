//简体
var res = {};

res.bindNewModal = {
	'plzSelectColumn': '请选择栏目！'
}
res.com = {
	'addSuccess': ' 添加成功',
	'allSelect': '全选',
	'cancelStore': '取消收藏',
	'catalog': '编目',
	'close': '关闭',
	'del': '删除',
	'deleteFailed': '删除失败',
	'deleteFailure': '删除失败',
	'deleteSuccess': '删除成功',
	'deleteSuccessful': '删除成功',
	'download': '下载',
	'edit': '编辑',
	'finish': '完成',
	'refresh': '刷新',
	'share': '分享',
	'store': '收藏'
}
res.entity = {
	'baseInfo': '基本信息',
	'catalogInfo': '编目信息',
	'history': '操作记录',
	'tags': '标签',
	'techCensor': '技审信息'
}
res.search = {
	'001': '检索片段',
	'002': '热门搜索：',
	'003': '条件过滤',
	'004': '已选择',
	'005': '清空',
	'006': '展开层面',
	'007': '收起层面',
	'008': '总共',
	'009': '条',
	'010': '排序方式',
	'011': '入库时间',
	'012': '起始',
	'013': '起始时间',
	'014': '结束',
	'015': '结束时间',
	'016': '时间段检索',
	'017': '在结果中搜索',
	'018': '图例模式',
	'019': '详细模式',
	'020': '列表模式',
	'021': '挑选',
	'022': '发起归档',
	'023': '发起回迁',
	'024': 'Excel导出',
	'025': '分页条数选择',
	'026': '共',
	'027': '当前第',
	'028': '页',
	'029': '处理中',
	'030': '已编目',
	'031': '编目中',
	'032': '已存储',
	'033': '未存储',
	'034': 'OSS存储',
	'035': 'OSS删除',
	'036': '处理中',
	'037': '已编目',
	'038': '编目中',
	'039': '已存储',
	'040': '未存储',
	'041': '类型：',
	'042': '所属节目：',
	'043': '资料提供者：',
	'044': '归属栏目：',
	'045': '入点：',
	'046': '出点：',
	'047': '关键字：',
	'048': '描述：',
	'049': '很抱歉，没有找到相关内容',
	'050': '你是不是要搜索：',
	'051': '数据加载失败',
	'052': '请检查您的网络连接或稍后重试',
	'053': '挑选列表',
	'055': '全部',
	'056': '最近一年',
	'057': '最近半年',
	'058': '最近一个月',
	'059': '最近一周',
	'060': '最近24小时',
	'061': '自定义',
	'062': '起始时间不能为空！',
	'063': '结束时间不能为空！',
	'064': '起始时间不能大于结束时间！',
	'065': '未在介质',
	'066': '检索失败，请稍后再试！',
	'067': '内容发布',
	'068': '归档',
	'069': '回迁',
	'070': '复制素材到用户个人',
	'072': '收藏的素材无唯一标识！',
	'075': '以下素材无法进行编目：',
	'076': '编目提示',
	'078': '最多只能选择10条数据！',
	'079': '权限不足，无法浏览！',
	'080': '编目中，请稍后编辑！',
	'082': '该资料集因包含素材不能删除',
	'083': '选中资料集将会彻底删除，您确定要删除选中项吗？',
	'084': '删除文件将会保存在回收站，您确定要删除选中项吗？',
	'085': '归档至OSS的素材文件，删除后无法恢复，您确定要删除？',
	'086': '删除提示',
	'087': '以下素材无法删除：',
	'089': '将删除其他素材到回收站并彻底删除选中资料集',
	'090': '将彻底删除选中资料集',
	'091': '将删除其他素材到回收站',
	'092': '删除文件会保存在回收站(资料集除外)',
	'093': '选中素材您都无法删除！',
	'094': '包含素材的',
	'095': '(权限不足)',
	'096': '下列素材您无法删除，点击继续将删除其他素材。',
	'097': '编目中的素材不能删除！',
	'098': '素材被删除后将无法被使用，您确定要删除？',
	'099': '请选择已存储素材',
	'100': '以下素材已发起过归档，确定要再次归档吗？',
	'101': '发起归档成功',
	'102': '发起归档失败',
	'103': '已归档素材发起归档失败',
	'104': '请选择已归档且离线的素材',
	'105': '以下素材为资料集，无法添加到挑选篮。',
	'106': '(资料集)',
	'107': '您选中素材均为资料集，无法添加到挑选篮！',
	'108': ' 素材已存在',
	'109': '获取挑选列表出现错误。',
	'71': '已收藏文件！',
	'removeKeywords': '移除关键字',
	'searchFile': '检索文件',
	'searchPlaceholder': '请输入你要搜索的内容',
	'title': '媒资库检索'
}

if ( typeof module === "object" && module && typeof module.exports === "object" ) {
	module.exports = res;
} else if ( typeof define === "function" && define.amd ) {
	define([], function () {
		return res;
	});
}