layui.config({
	base: '/web/js/lib/'
}).extend({ 
	msg:'msg',
	common:'common',
	ztree:'ztree',
	datatable:'datatable' 
});
Date.prototype.format =function(format){
    var o = {
	    "M+" : this.getMonth()+1, // month
		"d+" : this.getDate(),    // day
		"h+" : this.getHours(),   // hour
		"m+" : this.getMinutes(), // minute
		"s+" : this.getSeconds(), // second
		"q+" : Math.floor((this.getMonth()+3)/3),  // quarter
		"S" : this.getMilliseconds() // millisecond
    };
    if(/(y+)/.test(format)) format=format.replace(RegExp.$1,(this.getFullYear()+"").substr(4- RegExp.$1.length));
    for(var k in o){
    	if(new RegExp("("+ k +")").test(format)){
	    	 format = format.replace(RegExp.$1, RegExp.$1.length==1? o[k] :("00"+ o[k]).substr((""+ o[k]).length));
	    }
    }
    return format;
};
layui.use(['layer','msg','form', 'common','validate','datatable','laydate','ztree'], function() {
	var validate = layui.validate;
	var session = window.sessionStorage;
	var layer = layui.layer;  
	var $ = layui.jquery; 
	var form = layui.form; 
	var base_url = "/admin/pre_target_day/";
	function getUrlParam(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
        var r = window.location.search.substr(1).match(reg);  //匹配目标参数
        if (r != null) return unescape(r[2]);
        return null; //返回参数值
    }

    var mounth_id = getUrlParam("mounth_id");
    
    
    $('#return-button').bind('click',function(){
		window.location.href="../pre_target_month/list.html";
	});
    
    
	// 查询条件
	var addQueryParams = function(data){
	var filters = new Array();
		var day = $("#search-name").val();
		var filter = new Object();
		filter.property = 'mounthId';
		filter.value = mounth_id;
		filters.push(filter);
		if("" != day){
			var filter = new Object();
			filter.property = 'day';
			filter.value = '%'+day+'%';
			filters.push(filter);
		}
		if(filters.length>0){
			data.push({name:'filterJson',value:JSON.stringify({filters:filters})});
		}
	}
	// 分页
	var datatable = layui.datatable.init({
		
		id:'target-day-table',
		url:base_url+'list', 
		key:'id',
		columns:[ 
			{ sTitle: '日期',   mData: 'day'}, 
			{ sTitle: '新增用户数',   mData: 'currentUserCount'}, 
			{ sTitle: '新增订单数',   mData: 'currentOrderCount'}, 
			{ sTitle: '目标用户数',   mData: 'targetUserCount'}, 
			{ sTitle: '目标订单数',   mData: 'targetOrderCount'}, 
			{
				sTitle: '创建时间',
	          	mData: 'createTime' ,
	          	bSortable: true,
	          	mRender:function(mData,type,full){
	          		 return new Date(mData).format('yyyy-MM-dd hh:mm');
	          	}
			}
			
		],
		orderIndex:6,
		orderType:'desc',
		filter:addQueryParams
	});
	var query =  function(){
		datatable.reload();
	} ;  
	$('.search_btn').bind('click',function(){
		query();
	}); 
	
});