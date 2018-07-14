layui.config({
	base: '/web/js/lib/'
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
		var searchStatus = $('#search-status').val();
		if(searchStatus!='-1'){
			filter = new Object();
			filter.property = 'status';
			filter.value = searchStatus;
			filters.push(filter);
		}
		var searchName = $('#search-name').val();
		if(searchName!=''){
			filter = new Object();
			filter.property = 'name';
			filter.value = '%'+searchName +'%';
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
	var datatable = layui.datatable.init({
		id:'preGroup-table',
		url:'/admin/biz/pre_group/list', 
		key:'id',
		columns:[ 
			{ sTitle: '名称',   mData: 'name'},
			{ sTitle: '简介',   mData: 'content'},
			{ sTitle: '专区数',   mData: 'preCount'},
			{ sTitle: '创建人',   mData: 'operator'},
			{
				sTitle: '创建时间',
	          	mData: 'createTime' ,
	          	bSortable: true,
	          	mRender:function(mData,type,full){
	          		 return new Date(mData).format('yyyy-MM-dd hh:mm:ss');
	          	}
			},
			{
				sTitle: '启用/关闭',
	          	mData: 'status' ,
	          	bSortable: true,
	          	mRender:function(mData,type,full){
	          		var html = '';
	          		switch(mData){
	          			case 0:html += '<label style="color:red;">关闭</label>';break;
		          		case 1:html += '<label style="color:green;">启用</label>';break;
	          		}
	          		return html;
	          	}
			}
		],
		orderIndex:5,
		orderType:'desc',
		filter:addServerParams
	});
	
	var query =  function(){
		datatable.reload();
	};
	$('.search_btn').bind('click',function(){
		query();
	});
	var dataf = function dateformat(date) {
        return date ? (new Date(date)).format("yyyy-MM-dd") : "";
    }
	
	/**
	 * 启用
	 */
	$('#start-button').bind('click',function(){
		var list = datatable.selected(); 
		if(list.length<1){
			layui.msg.error('请至少选择一条记录');
			return false;
		}
		var ids = new Array();
		$.each(list,function(index,page){
			ids.push(page.id);
		});
		layui.msg.confirm('您确定要启用',function(){
			layui.common.ajax({
				url:'/admin/biz/pre_group/start',
				data:JSON.stringify(ids),
				contentType:'application/json; charset=utf-8',
				success:function(res){
					if(res.success){  
						layui.msg.success(res.content);
						window.setTimeout(query,1000);
					}else{
						layui.msg.error(res.content);
					}
					
				},error:function(){
					layui.msg.error("网络异常");
				}
			});
		}); 
	});
	/**
	 * 禁用
	 */
	$('#down-button').bind('click',function(){
		var list = datatable.selected(); 
		if(list.length<1){
			layui.msg.error('请至少选择一条记录');
			return false;
		}
		var ids = new Array();
		$.each(list,function(index,page){
			ids.push(page.id);
		});
		layui.msg.confirm('您确定要禁用',function(){
			layui.common.ajax({
				url:'/admin/biz/pre_group/down',
				data:JSON.stringify(ids),
				contentType:'application/json; charset=utf-8',
				success:function(res){
					if(res.success){  
						layui.msg.success(res.content);
						window.setTimeout(query,1000);
					}else{
						layui.msg.error(res.content);
					}
					
				},error:function(){
					layui.msg.error("网络异常");
				}
			});
		}); 
	});
	
});