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
	
	function getUrlParam(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
        var r = window.location.search.substr(1).match(reg);  //匹配目标参数
        if (r != null) return unescape(r[2]);
        return null; //返回参数值
    }

    var shareId = getUrlParam("shareId");
    
    if(shareId == null){
    	$("#return").css("display","none");
    }else{
    	$("#return").css("display","block");
    }
    
    $('#return-button').bind('click',function(){
		window.location.href="list.html";
	});
	 
	var addServerParams = function(data){  
		var lq_type = $('#lq_type').val();
		var title = $('#title').val();
		var username = $('#username').val();
		var usage = $('#usage').val();
		
		var filters = new Array();
		var filter = null; 
		
		if(shareId !='' && shareId !=null){
			filter = new Object();
			filter.property = 'shareId';
			filter.value = shareId;
			filters.push(filter);
		}
		
		if(title !=''){
			filter = new Object();
			filter.property = 'title';
			filter.value = '%'+ title +'%';
			filters.push(filter);
		}
		
		if(username !=''){
			filter = new Object();
			filter.property = 'username';
			filter.value = '%'+ username +'%';
			filters.push(filter);
		} 
		
		if(lq_type!='-1'){
			filter = new Object();
			filter.property = 'type';
			filter.value = lq_type;
			filters.push(filter);
		}
		
		if(usage!='-1'){
			filter = new Object();
			filter.property = 'usage';
			filter.value = usage;
			filters.push(filter);
		}
		
		if(filters.length>0){
			data.push({name:'filterJson',value:JSON.stringify({filters:filters})});
		}
	};
	
	var draw = function(settings, json){
		$(".operation-detail").unbind('click').bind('click',showTempInfo);
	};
	
	function showTempInfo(){
		var id = $(this).attr('data-detail-id');
		if(shareId !=null){
			window.location.href="receive_detail_list.html?shareId="+shareId+"&&receiveId="+id;
		}else{
			window.location.href="receive_detail_list.html?receiveId="+id;
		}
	}
	
	var datatable = layui.datatable.init({
		id:'receive-table',
		url:'/admin/biz_receive/list', 
		key:'id',
		columns:[ 
			{ sTitle: '活动标题',   mData: 'title'}, 
			{
				sTitle: '领取时间',
	          	mData: 'createTime',
	          	mRender:function(mData,type,full){
	          		 return new Date(mData).format('yyyy-MM-dd hh:mm:ss');
	          	}
			} ,
			{ sTitle: '用户名',   mData: 'username'}, 
			{
				sTitle: '使用情况',
	          	mData: 'usedCount' ,
	          	mRender:function(mData,type,full){
	          		var html ='';
	          		html += full.usedCount +"/"+ full.totalNum;
	          		return html;
	          	}
			},
			
			{ sTitle: '使用金额',   mData: 'usedAmount'}, 
			{
				sTitle: '操作',
	          	mRender:function(mData,type,full){
	          		html = '<a class="operation-detail" data-detail-id="'+full.id+'" href="javascript:void(0);">详情</a>'; 
	          		return html;
	          	}
			}
			
		],
		orderIndex:2,
		orderType:'desc',
		draw:draw,
		filter:addServerParams
	});  
	
	var query =  function(){
		datatable.reload();
		
	} ;  
	$('#search-button').bind('click',function(){
		query();
	});
});