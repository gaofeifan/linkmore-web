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
layui.use(['layer','msg','form','ztree', 'common','datatable','laydate'], function() {
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
	
	var setting = {
		check: {
			enable: true
		},
		data: {
			simpleData: {
				enable: true
			}
		}
	};
	var enterpriseHtml = '';
	var enterpriseList = null;
	var enterpriseMap = layui.common.map();
	layui.common.ajax({
		url:'/admin/biz/enterprise/selectAll',
		data:{time:new Date().getTime()}, 
		async:false,
		success:function(list){
			enterpriseList = list;
			enterpriseHtml = '<option value="">选择企业</option>';
			$.each(list,function(index,enterprise){
				enterpriseMap.put(enterprise.id,enterprise.name);
				enterpriseHtml += '<option value="'+enterprise.id+'">';
				enterpriseHtml += enterprise.name;
				enterpriseHtml += '</option>';
			});
		},error:function(){
			
		}
	});
	
	var addServerParams = function(data){  
		var filters = new Array();
		var filter = null; 
		
		var searchPreName = $('#search-pre-name').val();
		if(searchPreName!=''){
			filter = new Object();
			filter.property = 'preName';
			filter.value = '%'+searchPreName +'%';
			filters.push(filter);
		}
		
		var searchStartTime = $('#search-startTime').val();
		if(searchStartTime!=''){
			filter = new Object();
			filter.property = 'downTime';
			filter.value = searchStartTime;
			filters.push(filter);
		}
		var searchEndTime = $('#search-endTime').val();
		if(searchEndTime!=''){
			filter = new Object();
			filter.property = 'leaveTime';
			filter.value = searchEndTime;
			filters.push(filter);
		}
		
		
		
		if(filters.length>0){
			data.push({name:'filterJson',value:JSON.stringify({filters:filters})});
		}
	};
	
	var datatable = layui.datatable.init({
		id:'record-table',
		url:'/admin/ent/rented-record/list', 
		key:'id',
		columns:[
			{ sTitle: 'ID',   mData: 'id', bVisible:false}, 
			{ sTitle: '车牌',   mData: 'plateNo'}, 
			{ sTitle: '企业名称',   mData: 'entName',bVisible:false}, 
			{ sTitle: '车区ID',  mData: 'preId', bVisible:false}, 
			{ sTitle: '车区名称',   mData: 'preName'}, 
			{ sTitle: '车位ID',  mData: 'stallId', bVisible:false}, 
			{ sTitle: '车位名称',   mData: 'stallName'}, 
			{
				sTitle: '降锁时间',
				mData: 'downTime' ,
				bSortable: true,
				mRender:function(mData,type,full){
					return mData!=null?new Date(mData).format('yyyy-MM-dd hh:mm'):'';
				}
			},
			{
				sTitle: '升锁时间',
				mData: 'leaveTime' ,
				bSortable: true,
				mRender:function(mData,type,full){
					return mData!=null?new Date(mData).format('yyyy-MM-dd hh:mm'):'';
				}
			}
		],
		orderIndex:8,
		orderType:'desc',
		filter:addServerParams
	});  
	
	var query =  function(){
		datatable.reload();
		
	} ;  
	$('.search_btn').bind('click',function(){
		query();
	});  
	
	/*
	 * 导出
	 */
	$('#export-button').bind('click',function(){
		var data = new Object(); 
		
		var searchPreName = $('#search-pre-name').val();
		if(searchPreName!=''){
			data.preName = '%'+searchPreName +'%';
		}
		
		var searchStartTime = $('#search-startTime').val();
		if(searchStartTime!=''){
			data.downTime = searchStartTime; 
		}else{
			layui.msg.error("请输入开始日期");
			return false;
		}
		var searchEndTime = $('#search-endTime').val();
		if(searchEndTime!=''){
			data.leaveTime = searchEndTime; 
		}
		
        var url = '/admin/ent/rented-record/export';
        data.time = new Date().getTime();
        layui.common.download({
          url:url,
          data: data
        }); 
	}); 
	
	
});