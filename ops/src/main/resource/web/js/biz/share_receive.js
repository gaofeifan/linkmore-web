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
	
	if(window.sessionStorage){
		var search = session.getItem('search');
		if(search!=null){
			var obj = JSON.parse(search);
			layui.common.set({
    			id:'page-search-form',
    			data:obj
    		});
		}
	}
	
	var addServerParams = function(data){  
		var title = $('#title').val();
		var source = $('#source').val();
		var receiveNum = $('#receiveNum').val();
		
		var filters = new Array();
		var filter = null; 
		
		if(title !=''){
			filter = new Object();
			filter.property = 'title';
			filter.value = '%'+ title +'%';
			filters.push(filter);
		} 
		
		if(source!='-1'){
			filter = new Object();
			filter.property = 'source';
			filter.value = source;
			filters.push(filter);
		}
		
		if(receiveNum!='-1'){
			filter = new Object();
			filter.property = 'receiveNum';
			filter.value = receiveNum;
			filters.push(filter);
		}
		
		if(filters.length>0){
			data.push({name:'filterJson',value:JSON.stringify({filters:filters})});
		}
	};
	
	$.saveSearchHistory = function(){
		if(window.sessionStorage){
			var session = window.sessionStorage;
			var title = $('#title').val();
			var source = $('#source').val();
			var receiveNum = $('#receiveNum').val();
			var obj = new Object();

			obj.title=title;
			obj.source=source;
			obj.receiveNum=receiveNum;
			session.setItem('search',JSON.stringify(obj));
		}
	};
	
	var draw = function(settings, json){
		$(".operation-detail").unbind('click').bind('click',showTempInfo);
	};
	var shareId ="";
	function showTempInfo(){
		shareId = $(this).attr('data-detail-id');
		window.location.href="receive_list.html?shareId="+shareId;
	}
	
	var datatable = layui.datatable.init({
		id:'share-table',
		url:'/admin/biz_share/list', 
		key:'id',
		columns:[ 
			{ sTitle: '活动标题',   mData: 'title'}, 
			{
				sTitle: '分享来源',
	          	mData: 'source' ,
	          	mRender:function(mData,type,full){
					var html = '<label style="color:#999">IOS</label>';
	          		if(full.source==2){
	          			html = '<label style="color:#666">APP</label>';
	          		}if(full.source==1){
	          			html = '<label style="color:#333">微信</label>';
	          		}
	          		return html;
	          	}
			},
			{ sTitle: '分享者',   mData: 'username'}, 
			{ sTitle: '领取人数',   mData: 'receiveNum'}, 
			{
				sTitle: '分享时间',
	          	mData: 'createTime' ,
	          	bSortable: true,
	          	mRender:function(mData,type,full){
	          		 return new Date(mData).format('yyyy-MM-dd hh:mm:ss');
	          	}
			}, 
			{
				sTitle: '操作',
	          	mRender:function(mData,type,full){
	          		html = '<a class="operation-detail" data-detail-id="'+full.id+'" href="javascript:void(0);">详情</a>'; 
	          		return html;
	          	}
			}
		],
		orderIndex:5,
		orderType:'desc',
		draw:draw,
		filter:addServerParams
	});  
	
	var query =  function(){
		datatable.reload();
		
	} ;  
	$('#search-button').bind('click',function(){
		try{
			$.saveSearchHistory ();
		}catch(err){
			
		}
		query();
	});
	
	$('#clear-button').bind('click',function(){
		if(window.sessionStorage){
			$('#page-search-form')[0].reset();  
			window.sessionStorage.removeItem('search');
		}
		query();
	});
	
});