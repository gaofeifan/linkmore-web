layui.config({
	base: '/js/lib/'
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
	
	function getUrlParam(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
        var r = window.location.search.substr(1).match(reg);  //匹配目标参数
        if (r != null) return unescape(r[2]);
        return null; //返回参数值
    }

    var receiveId = getUrlParam("receiveId");
    var shareId = getUrlParam("shareId");
    
    $('#return-button').bind('click',function(){
    	if(shareId == null){
    		window.location.href="receive_list.html";
    	}else{
    		window.location.href="receive_list.html?shareId="+shareId;
    	}
		
	});
	 
	var addServerParams = function(data){  
		var filters = new Array();
		var filter = null; 
		
		if(receiveId !=null){
			filter = new Object();
			filter.property = 'receiveId';
			filter.value = receiveId;
			filters.push(filter);
		}
		if(filters.length>0){
			data.push({name:'filterJson',value:JSON.stringify({filters:filters})});
		}
	};
	var datatable = layui.datatable.init({
		id:'receive-detail-table',
		url:'/admin/biz_receive/detailList', 
		key:'id',
		columns:[ 
			{ sTitle: '活动标题',   mData: 'title'}, 
			{ sTitle: '套餐名称',   mData: 'comboName'},
			{ sTitle: '面额(元)',   mData: 'faceAmount'},
			{
				sTitle: '过期时间',
	          	mData: 'validTime' ,
	          	bSortable: true,
	          	mRender:function(mData,type,full){
	          		 return new Date(mData).format('yyyy-MM-dd hh:mm:ss');
	          	}
			},
			{
				sTitle: '使用状态',
	          	mData: 'status' ,
	          	mRender:function(mData,type,full){
	                var html = '';
	                switch(mData){
		                case 0: html = '<label style="color:red">未使用</label>';break;
		                case 1: html = '<label style="color:green">已使用</label>';break;
		                case 2: html = '<label style="color:red">已过期</label>';break;
	                }
	                return html;
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
});