layui.config({
	base: '/web/js/lib/'
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
  
  	var start = {
	    min: '2015-06-16 23:59:59'
	    ,max: '2099-06-16 23:59:59'
	    ,istoday: false
	    ,choose: function(datas){
	      end.min = datas; //开始日选好后，重置结束日的最小日期
	      end.start = datas //将结束日的初始值设定为开始日
	    }
  	};
  
  	var end = {
	    min: '2015-06-16 23:59:59'
	    ,max: '2099-06-16 23:59:59'
	    ,istoday: false
	    ,choose: function(datas){
	      start.max = datas; //结束日选好后，重置开始日的最大日期
	    }
  	};
  	$('#search-start').bind('click',function(){
	  	start.elem = this;
	    laydate(start);
  	});
  	$('#search-end').bind('click',function(){
	  	end.elem = this
    	laydate(end);
  	}); 
	 
	var addServerParams = function(data){   
		var filters = new Array();
		var filter = null; 
		 
		var searchClient = $('#search-client').val();
		if(searchClient!='0'){
			filter = new Object();
			filter.property = 'client';
			filter.value = searchClient;
			filters.push(filter);
		} 
		var searchUsername = $('#search-username').val();
		if(searchUsername!=''){
			filter = new Object();
			filter.property = 'username';
			filter.value = searchUsername;
			filters.push(filter);
		}
		if(filters.length>0){
			data.push({name:'filterJson',value:JSON.stringify({filters:filters})});
		}
	};
	var datatable = layui.datatable.init({
		id:'user-version-table',
		url:'/admin/biz/user_version/list', 
		key:'id',
		columns:[ 
			{ sTitle: '用户',   mData: 'username'}, 
			{ sTitle: '机型',   mData: 'model'}, 
			{ 
				sTitle: '操作系统',   
				mData: 'client',
				mRender:function(mData,type,full){
					var html = '';
					switch(mData){
	          			case 0: html = '<label style="color:#666">未知['+full.osVersion+']</label>';break;
	          			case 1: html = '<label style="color:#1E9FFF">Android['+full.osVersion+']</label>';break;
	          			case 2: html = '<label style="color:#009688">iOS['+full.osVersion+']</label>';break; 
	          		}
	          		return html;
	          	}
			},  
			{ sTitle: 'APP版本',   mData: 'version'},  
			{
				sTitle: '提交时间',
	          	mData: 'commitTime' ,
	          	bSortable: true,
	          	mRender:function(mData,type,full){
	          		 return new Date(mData).format('yyyy-MM-dd hh:mm');
	          	}
			} 
		],
		orderIndex:5,
		orderType:'desc',
		filter:addServerParams
	});  
	
	var query =  function(){
		datatable.reload();
		
	} ;  
	$('#search-button').bind('click',function(){
		query();
	});   
});