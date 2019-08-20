var res = {};

res.bindNewModal = {
	'plzSelectColumn': 'Please select a section!',
}
res.com = {
	'addSuccess': 'Added successfully',
	'allSelect': 'select all',
	'cancelStore': 'Cancel collection',
	'catalog': 'catalog',
	'close': 'shut down',
	'del': 'delete',
	'deleteFailed': 'failed to delete',
	'deleteFailure': 'failed to delete',
	'deleteSuccess': 'successfully deleted',
	'deleteSuccessful': 'successfully deleted',
	'download': 'download',
	'edit': 'edit',
	'finish': 'carry out',
	'refresh': 'Refresh',
	'share': 'share it',
	'store': 'Collection',
}
res.entity = {
	'baseInfo': 'Basic Information',
	'catalogInfo': 'Catalog information',
	'history': 'Operation record',
	'tags': 'label',
	'techCensor': 'Technical review information',
}
res.search = {
	'001': 'Retrieve fragment',
	'002': 'popular searches:',
	'003': 'Conditional filtering',
	'004': 'chosen',
	'005': 'Empty',
	'006': 'Expand level',
	'007': 'Collapse level',
	'008': 'Total',
	'009': 'article',
	'010': 'Sort by',
	'011': 'Storage time',
	'012': 'Start',
	'013': 'Start time',
	'014': 'End',
	'015': 'End Time',
	'016': 'Time period search',
	'017': 'Search in results',
	'018': 'Legend mode',
	'019': 'Detailed mode',
	'020': 'List mode',
	'021': 'Pick',
	'022': 'Initiate archiving',
	'023': 'Initiate a moveback',
	'024': 'Excel export',
	'025': 'Number of pages',
	'026': 'Total',
	'027': 'Current number',
	'028': 'page',
	'029': 'Processing',
	'030': 'Cataloged',
	'031': 'Cataloging',
	'032': 'Stored',
	'033': 'Not stored',
	'034': 'OSS storage',
	'035': 'OSS delete',
	'036': 'Processing',
	'037': 'Cataloged',
	'038': 'Cataloging',
	'039': 'Stored',
	'040': 'Not stored',
	'041': 'Types of:',
	'042': 'Affiliated program:',
	'043': 'Data provider:',
	'044': 'Affiliation column:',
	'045': 'Entry point:',
	'046': 'Out point:',
	'047': 'Keywords:',
	'048': 'description:',
	'049': 'Sorry, no related content found.',
	'050': 'Are you searching for:',
	'051': 'The data load failure',
	'052': 'Please check your network connection or try again later',
	'053': 'Pick list',
	'055': 'all',
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