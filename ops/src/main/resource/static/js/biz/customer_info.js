layui.config({
	base: '/js/lib/'
}).extend({ 
	msg:'msg',
	common:'common', 
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
layui.use(['layer','msg','form', 'common','validate','datatable','laydate'], function() {
	var validate = layui.validate; 
	var layer = layui.layer;  
	var $ = layui.jquery; 
	var form = layui.form;  
	var laydate = layui.laydate; 
	var base_url = '/admin/biz/customer_info/';
	laydate.render({
	    elem: '#search-start-time',
	    min: '2015-06-16 23:59:59',
	    max: new Date().format('yyyy-MM-dd'),
		istoday: false
	});
	laydate.render({
	    elem: '#search-end-time',
	    min: '2015-06-16 23:59:59',
	    max: new Date().format('yyyy-MM-dd'),
		istoday: false
	}); 
	var addServerParams = function(data){
		var name = $('#search-name').val();
		var start = $('#search-start-time').val();
		var end = $('#search-end-time').val();
		var filters = new Array();
		var filter = null; 
		if(name!=''){
			filter = new Object();
			filter.property = 'operator';
			filter.value = name;
			filters.push(filter);
		}
		if(start!=''){
			filter = new Object();
			filter.property = 'createTime';
			filter.value = start;
			filters.push(filter);
		} 
		if(end!=''){
			filter = new Object();
			filter.property = 'endTime';
			filter.value = end;
			filters.push(filter);
		} 
		if(filters.length>0){
			data.push({name:'filterJson',value:JSON.stringify({filters:filters})});
		}
	};
	
	var datatable = layui.datatable.init({
		id:'customer-info-table',
		url: base_url+'list', 
		key:'id',
		columns:[ 
			{ sTitle: '地推人员',   mData: 'operator'}, 
			{ sTitle: '用户名',   mData: 'realname'}, 
			{ sTitle: '性别',   mData: 'sex'}, 
			{ sTitle: '年龄',   mData: 'age'}, 
			{ sTitle: '孩子数量',   mData: 'childNum'}, 
			{ sTitle: '车辆品牌',   mData: 'brandModel'}, 
			{ sTitle: '车辆颜色',   mData: 'carColor'}, 
			{ sTitle: '车辆排量',   mData: 'carDis'}, 
			{ sTitle: '停车原因',   mData: 'stopCause'}, 
			{
				sTitle: '创建时间',
	          	mData: 'createTime' ,
	          	bSortable: true,
	          	mRender:function(mData,type,full){
	          		 return new Date(mData).format('yyyy-MM-dd hh:mm');
	          	}
			}
		],
		orderIndex:10,
		orderType:'desc',
		filter:addServerParams
	});  
	
	var query =  function(){
		datatable.reload();
	};  
	
	$('.search_btn').bind('click',function(){
		query();
	});
	
    
	
	onDetail = function (data){
		var id = $(data).attr('data-id');
//		layui.msg.success("暂不开发，预留");
	}
	
	 var addFileInit = function(validate,lindex){
			$('#excel-cancel-button').bind('click',function(){
				layui.layer.close(lindex);
			});
			$('#excel-add-button').bind('click',function(){
				var data = new FormData($( "#excel-add-form" )[0]); 
				layui.common.upload({
					url:"/fileImport/customerInfoImport",
					data:data,
					success:function(res){
						if(res.success){  
							layui.msg.success(res.content);
							layui.layer.close(lindex);
						}else{
							layui.msg.error(res.content);
						} 
					} 
				}); 
	        });
		};
		
	    $('#import-button').bind('click',function(){
	    	var param = new Object();
	    	param.url = 'add_excel.html';
	    	param.title = '导入用户';
	    	param.width = 600;
	    	param.init = addFileInit;
	    	layui.common.modal(param);  
	    });
	    
	    $('#export-button').bind('click',function(){
	    	var data = new Object();
	    	if($("#search-name").val() != ''){
	    		data.operator = $("#search-name").val();
	    	}
	    	if($("#search-end-time").val() != ''){
	    		data.endTime = $("#search-end-time").val();
	    	}
	    	if($("#search-start-time").val() != ''){
	    		data.startTime = $("#search-start-time").val();
	    	}
	    	 data.time = new Date().getTime();
	    	layui.common.download({
				url:'/admin/biz/customer_info/export',
				data:data
			}); 
	    });
	    
	    
	
});