layui.config({
	base: 'js/lib/'
}).extend({ 
	msg:'msg',
	common:'common', 
	datatable:'datatable' 
});
Date.prototype.format =function(format){
    var o = {
	    "M+" : this.getMonth()+1, //month
		"d+" : this.getDate(),    //day
		"h+" : this.getHours(),   //hour
		"m+" : this.getMinutes(), //minute
		"s+" : this.getSeconds(), //second
		"q+" : Math.floor((this.getMonth()+3)/3),  //quarter
		"S" : this.getMilliseconds() //millisecond
    };
    if(/(y+)/.test(format)) format=format.replace(RegExp.$1,(this.getFullYear()+"").substr(4- RegExp.$1.length));
    for(var k in o){
    	if(new RegExp("("+ k +")").test(format)){
	    	 format = format.replace(RegExp.$1, RegExp.$1.length==1? o[k] :("00"+ o[k]).substr((""+ o[k]).length));
	    }
    }
    return format;
};
layui.use(['layer','msg','form', 'common','validate','datatable','laydate'], function() {
	var validate = layui.validate; 
	var layer = layui.layer;  
	var $ = layui.jquery; 
	var form = layui.form;
	
	var addServerParams = function(data){   
		var searchName = $('#search-name').val();
		var filters = new Array();
		var filter = null; 
		if(searchName!=''){
			filter = new Object();
			filter.property = 'name';
			filter.value = '%'+searchName +'%';
			filters.push(filter);
		}  
		if(filters.length>0){
			data.push({name:'filterJson',value:JSON.stringify({filters:filters})});
		}
	};
	
	
    var dataf = function dateformat(date) {
        return date ? (new Date(date)).format("yyyy-MM-dd hh:mm:ss") : "";
    }
    
	var datatable = layui.datatable.init({
		id:'temp-table',
		url:'/admin/coupon_enterprise/list', 
		key:'id',
		columns:[
		    { sTitle: 'ID',   mData: 'id'},
			{ sTitle: '用户名称',   mData: 'name'},
			{ sTitle: '停车券名称',   mData: 'name'},
			{ sTitle: '停车券ID',   mData: 'name'},
			{ sTitle: '停车券使用情况',   mData: 'residualReleasePeriod'},
			{ sTitle: '已发放用户',   mData: 'name'},
			{ sTitle: '发放时间',   mData: 'name'},
			{ sTitle: '发放人',   mData: 'name'}
		],
		orderIndex:6,
		orderType:'desc',
		filter:addServerParams
	});  
	
	var query =  function(){
		datatable.reload();
	} ; 
	
	$('.search_btn').bind('click',function(){
		query();
	});
	
	
    
});