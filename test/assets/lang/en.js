var res = {};

res.bindNewModal = {
	'plzSelectColumn': 'Please select a column!',
}
res.com = {
	'addSuccess': 'Add a success',
	'allSelect': 'Future generations',
	'cancelStore': 'Cancel the collection',
	'catalog': 'The catalog',
	'close': 'Shut down',
	'del': 'Delete',
	'deleteFailed': 'Delete failed',
	'deleteFailure': 'Delete failed',
	'deleteSuccess': 'Delete the success',
	'deleteSuccessful': 'Delete the success',
	'download': 'Download',
	'edit': 'The editor',
	'finish': 'Complete',
	'refresh': 'The refresh',
	'share': 'Share',
	'store': 'Collection',
}
res.entity = {
	'baseInfo': 'The basic information',
	'catalogInfo': 'Catalog information',
	'history': 'Operation records',
	'tags': 'The label',
	'techCensor': 'Technology review information',
}
res.search = {
	'001': 'Retrieve fragments',
	'002': 'Popular searches:',
	'003': 'Filter',
	'004': 'Has chosen',
	'005': 'Empty',
	'006': 'A level',
	'007': 'Pack up level',
	'008': 'In total,',
	'009': 'Article',
	'010': 'The sorting way',
	'011': 'Storage time',
	'012': 'The starting',
	'013': 'Starting time',
	'014': 'The end of the',
	'015': 'The end of time',
	'016': 'Time to retrieve',
	'017': 'In the search results',
	'018': 'Legend mode',
	'019': 'Detailed model',
	'020': 'List mode',
	'021': 'Choose',
	'022': 'Initiate archiving',
	'023': 'Initiate a property',
	'024': 'Excel export',
	'025': 'The article page number selection',
	'026': 'A total of',
	'027': 'The current first',
	'028': 'Page',
	'029': 'In the processing',
	'030': 'Have the catalog',
	'031': 'Catalog',
	'032': 'Has been stored',
	'033': 'Not stored',
	'034': 'OSS is stored',
	'035': 'OSS delete',
	'036': 'In the processing',
	'037': 'Have the catalog',
	'038': 'Catalog',
	'039': 'Has been stored',
	'040': 'Not stored',
	'041': 'Type:',
	'042': 'Program:',
	'043': 'Sources:',
	'044': 'Attribution columns:',
	'045': 'The point:',
	'046': 'The point:',
	'047': 'Key words:',
	'048': 'Description:',
	'049': 'I\'m sorry, didn\'t find relevant content',
	'050': 'Do you want to search:',
	'051': 'The data load failure',
	'052': 'Please check your network connection or try again later',
	'053': 'Pick list',
	'055': 'All',
	'056': 'In recent year',
	'057': 'Recent half a year',
	'058': 'The last month',
	'059': 'In the latest week',
	'060': 'Last 24 hours',
	'061': 'The custom',
	'062': 'Start time can\'t be empty!',
	'063': 'End time can\'t be empty!',
	'064': 'Start time is not greater than end time!',
	'065': 'Not in the medium',
	'066': 'Retrieval failure, please try again later.',
	'067': 'Content distribution',
	'068': 'The archive',
	'069': 'A property',
	'070': 'To the users\' personal copy material',
	'072': 'Collection of material without a unique identifier.',
	'075': 'The following material to catalog:',
	'076': 'Catalog prompt',
	'078': 'Can only choose at most 10 data!',
	'079': 'Insufficient permissions to browse!',
	'080': 'Catalog, please edit later!',
	'082': 'The data set contains material cannot be deleted',
	'083': 'Selected data sets will be delete, are you sure you want to delete the selected item?',
	'084': 'Deleting files will be stored in the recycle bin, are you sure you want to delete the selected item?',
	'085': 'Archive to OSS material files, cannot recover after deletion, are you sure you want to delete?',
	'086': 'Delete the prompt',
	'087': 'The following material cannot be deleted:',
	'089': 'Will delete the other material to the recycle bin and delete the selected data set',
	'090': 'Will delete the selected data set',
	'091': 'Will delete the other material to the recycle bin',
	'092': 'Deleted files will be stored in the recycle bin (except data sets)',
	'093': 'Select the material you can\'t delete!',
	'094': 'Contains material',
	'095': '(insufficient permissions)',
	'096': 'The following material you can\'t delete, and click continue to remove the other material.',
	'097': 'Catalog material cannot be deleted!',
	'098': 'Material is removed after will not be able to be used, are you sure you want to delete?',
	'099': 'Please select the stored material',
	'100': 'The following material has launched a file, make sure to file again?',
	'101': 'Initiate archiving successful',
	'102': 'Initiate archiving failure',
	'103': 'Have file archive material by failure',
	'104': 'Please select archived and offline material',
	'105': 'The following material for data collection, cannot be added to the selected basket.',
	'106': '(data sets)',
	'107': 'You selected materials are all data set, choose cannot be added to the basket!',
	'108': 'Material is',
	'109': 'An error has occurred for picking list.',
	'71': 'Already collected files!',
	'removeKeywords': 'Remove the keywords',
	'searchFile': 'Retrieve files',
	'searchPlaceholder': 'Please enter your search content',
	'title': 'Medium resource library retrieval',
}

if ( typeof module === "object" && module && typeof module.exports === "object" ) {
	module.exports = res;
} else if ( typeof define === "function" && define.amd ) {
	define([], function () {
		return res;
	});
}