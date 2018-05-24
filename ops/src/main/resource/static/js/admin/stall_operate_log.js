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
layui.use(['layer','msg','form', 'common','datatable','laydate'], function() {
	var session = window.sessionStorage;
	var layer = layui.layer;  
	var $ = layui.jquery; 
	var form = layui.form;
	
	var laydate = layui.laydate; 

	laydate.render({
	    elem: '#search-startTime',
	    min: '2015-06-16 23:59:59',
	    max: new Date().format('yyyy-MM-dd'),
		istoday: false
	});
	laydate.render({
	    elem: '#search-endTime',
	    min: '2015-06-16 23:59:59',
	    max: new Date().format('yyyy-MM-dd'),
		istoday: false
	}); 
	
	
	var addServerParams = function(data){  
		var filters = new Array();
		var filter = null; 
		var searchSource = $('#search-source').val();
		if(searchSource!='-1'){
			filter = new Object();
			filter.property = 'source';
			filter.value = searchSource;
			filters.push(filter);
		} 
		var searchOperation = $('#search-operation').val();
		if(searchOperation!='-1'){
			filter = new Object();
			filter.property = 'operation';
			filter.value = searchOperation;
			filters.push(filter);
		}
		var searchStatus = $('#search-status').val();
		if(searchStatus!='-1'){
			filter = new Object();
			filter.property = 'status';
			filter.value = searchStatus;
			filters.push(filter);
		}
		var searchStartTime = $('#search-startTime').val();
		if(searchStartTime!=''){
			filter = new Object();
			filter.property = 'startTime';
			filter.value = searchStartTime;
			filters.push(filter);
		}
		var searchEndTime = $('#search-endTime').val();
		if(searchEndTime!=''){
			filter = new Object();
			filter.property = 'endTime';
			filter.value = searchEndTime;
			filters.push(filter);
		}
		if(filters.length>0){
			data.push({name:'filterJson',value:JSON.stringify({filters:filters})});
		}
	};
	//绑定事件
	var draw = function(){
		$(".operation-detail").unbind('click').bind('click',operationLog); 
	};
	var datatable = layui.datatable.init({
		id:'stall-operate-table',
		url:'/admin/admin/stall_operate/list', 
		key:'id',
		columns:[ 
			{ sTitle: '车位名称',   mData: 'stallName'},
			{
				sTitle: '来源',
	          	mData: 'source' ,
	          	bSortable: true,
	          	mRender:function(mData,type,full){
	          		var html = '';
	          		switch(mData){
	          			case 1:html += '后台';break;
		          		case 2:html += 'APP';break;
		          		case 3:html += 'APP';break;
	          		}
	          		return html;
	          	}
			},
			{
				sTitle: '操作',
	          	mData: 'operation' ,
	          	bSortable: true,
	          	mRender:function(mData,type,full){
	          		var html = '';
	          		switch(mData){
	          			case 1:html += '<label style="color:blue;">上线</label>';break;
		          		case 2:html += '<label style="color:gray;">下线</label>';break;
		          		case 3:html += '<label style="color:green;">释放</label>';break;
		          		case 4:html += '<label style="color:red;">强制释放</label>';break;
	          		}
	          		return html;
	          	}
			},
			{ sTitle: '操作人',   mData: 'operator'},
			{
				sTitle: '状态',
	          	mData: 'status' ,
	          	bSortable: true,
	          	mRender:function(mData,type,full){
	          		var html = '';
	          		switch(mData){
	          			case 1:html += '<label style="color:green;">成功</label>';break;
		          		case 0:html += '<label style="color:red;">失败</label>';break;
	          		}
	          		return html;
	          	}
			},
			{
				sTitle: '创建时间',
	          	mData: 'createTime' ,
	          	bSortable: true,
	          	mRender:function(mData,type,full){
	          		 return new Date(mData).format('yyyy-MM-dd hh:mm:ss');
	          	}
			},
			{
				sTitle: '详情',
	          	mRender:function(mData,type,full){
	          		 return '<a class="operation-detail" data-id="'+full.id+'" href="javascript:void(0);">详情</a>';
	          	}
			}
		],
		orderIndex:6,
		orderType:'desc',
		draw:draw,
		filter:addServerParams
	});
	
	var query =  function(){
		datatable.reload();
	};
	$('.search_btn').bind('click',function(){
		query();
	});
	var dataf = function dateformat(date) {
        return date ? (new Date(date)).format("yyyy-MM-dd hh:mm:ss") : "";
    }
	
    
	/*
	 * 详情
	 */
	//数据回显
    var operation_log = function showData(logId,callback){
    	layui.common.ajax({
			url:'/admin/admin/stall_operate/detail',
			data:JSON.stringify(logId),
			contentType:'application/json; charset=utf-8',
			success:function(res){
				if(res!=null){
					callback(res);
				}else{
					layui.msg.error("数据不存在");
				}
			},error:function(){layui.msg.error("网络异常");}
		});
    }
    var logId = null;
    var detailInit = function(validate,lindex){
    	operation_log(logId,function(data){
    		var list = data;
    		layui.common.set({
    			id:'stall-operate-detail-form',
    			data:list[0]
    		});
    		$('#stall-operate-detail-form input[name=createTime]').val(dataf(list[0].createTime));
    		$('#stall-operate-detail-form select').attr('disabled',true);
    		$('#stall-operate-detail-form input').attr('disabled',true);
    		$('#stall-operate-detail-form textarea').attr('disabled',true);
    		form.render('select');
    	});
    	$('#stall-operate-cancel-detail-button').bind('click',function(){
    		layui.layer.close(lindex);
    	});
    }
	function operationLog(){
		logId = $(this).attr("data-id");
    	var param = new Object();
    	param.url = 'detail.html';
    	param.title = '详情信息'; 
    	var valid = new Object();
    	valid.id = "stall-operate-detail-form";
    	param.width = 650;
    	param.init = detailInit;
    	layui.common.modal(param);
	}
	
	/*
	 * 导出
	 */
	$('#export-button').bind('click',function(){
		var data = new Object();
		var searchSource = $('#search-source').val();
		if(searchSource!='-1'){
			data.source = searchSource;
		} 
		var searchOperation = $('#search-operation').val();
		if(searchOperation!='-1'){
			data.operation = searchOperation;
		}
		var searchStatus = $('#search-status').val();
		if(searchStatus!='-1'){ 
			data.status = searchStatus; 
		} 
		var searchStartTime = $('#search-startTime').val();
		if(searchStartTime!=''){ 
			data.startTime = searchStartTime; 
		} 
		var searchEndTime = $('#search-endTime').val();
		if(searchEndTime!=''){ 
			data.endTime = searchEndTime; 
		} 
        var url = '/admin/admin/stall_operate/export';
        data.time = new Date().getTime();
        layui.common.download({
          url:url,
          data: data
        }); 
	});
});