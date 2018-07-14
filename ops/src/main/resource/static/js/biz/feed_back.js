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
layui.use(['layer','msg','form', 'common','laydate', 'datatable' ], function() {
	var validate = layui.validate;
	var session = window.sessionStorage;
	var layer = layui.layer;  
	var $ = layui.jquery; 
	var form = layui.form; 
	
	var laydate = layui.laydate; 

	laydate.render({
	    elem: '#search-start',
	    min: '2015-06-16 23:59:59',
	    max: new Date().format('yyyy-MM-dd'),
		istoday: false
	});
	laydate.render({
	    elem: '#search-end',
	    min: '2015-06-16 23:59:59',
	    max: new Date().format('yyyy-MM-dd'),
		istoday: false
	}); 
	 
	var addServerParams = function(data){  
		var search_key = $('#search_key').val();
		var search_value = $('#search_value').val();
		var searchStart = $('#search-start').val();
		var searchEnd = $('#search-end').val();
		
		var filters = new Array();
		var filter = null; 
		if(search_value!=''){
			filter = new Object();
			filter.property = search_key;
			if(search_key == 'mobile'){
				filter.value = '%'+search_value+'%';
			}else{
				filter.value = '%'+search_value+'%';
			}
			filters.push(filter);
		}  
		
		if(searchStart!=''){
			filter = new Object();
			filter.property = 'startTime';
			filter.value = searchStart;
			filters.push(filter);
		} 
		
		if(searchEnd!=''){
			filter = new Object();
			filter.property = 'endTime';
			filter.value = searchEnd;
			filters.push(filter);
		}   
		if(filters.length>0){
			data.push({name:'filterJson',value:JSON.stringify({filters:filters})});
		}
	};
	var datatable = layui.datatable.init({
		id:'feed-back-table',
		url:'/admin/biz_feedback/list', 
		key:'id',
		columns:[ 
			{ sTitle: '用户手机号',   mData: 'mobile'}, 
			{ sTitle: '用户昵称',   mData: 'nickname'}, 
			{ sTitle: '内容',   mData: 'content'}, 
			{
				sTitle: '日期',
	          	mData: 'createTime' ,
	          	bSortable: true,
	          	mRender:function(mData,type,full){
	          		 return new Date(mData).format('yyyy-MM-dd hh:mm:ss');
	          	}
			} 
		],
		orderIndex:4,
		orderType:'desc',
		filter:addServerParams
	});  
	
	var query =  function(){
		datatable.reload();
		
	} ;  
	$('#search-button').bind('click',function(){
		query();
	});
	
	$('#export-button').bind('click',function(){ 
		var data = new Object();
		var search_key = $('#search_key').val();
		var search_value = $('#search_value').val();
		var searchStart = $('#search-start').val();
		var searchEnd = $('#search-end').val();
		if(search_value!=''){
			if(search_key == 'mobile'){
				data.mobile = '%'+search_value+'%';
			}else{
				data.nickname = '%'+search_value+'%';
				
			}
		}
		
		var startTime = $('#search-start').val();
		if(startTime!=''){ 
			data.startTime = startTime; 
		} 
		var endTime = $('#search-end').val();
		if(endTime!=''){ 
			data.endTime = endTime; 
		}
        var url = '/admin/biz_feedback/export';
        data.time = new Date().getTime();
        layui.common.download({
          url:url,
          data: data
        }); 
	}); 
});