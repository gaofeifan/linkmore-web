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
		var searchName = $('#search-name').val();
		if(searchName!=''){
			filter = new Object();
			filter.property = 'stallName';
			filter.value = '%'+searchName +'%';
			filters.push(filter);
		} 
		var searchLockSn = $('#search-lockSn').val();
		if(searchLockSn!=''){
			filter = new Object();
			filter.property = 'lockSn';
			filter.value = '%'+searchLockSn +'%';
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
		id:'stall-recharge-table',
		url:'/admin/admin/stall_recharge/list', 
		key:'id',
		columns:[ 
		    { sTitle: '车位锁',   mData: 'lockSn'},
			{ sTitle: '车位名称',   mData: 'stallName'},
			{ sTitle: '操作人',   mData: 'operator'},
			{
				sTitle: '电压',
	          	mData: 'voltage' ,
	          	bSortable: true,
	          	mRender:function(mData,type,full){
	          		 return full.voltage + ' v';
	          	}
			},
			{
				sTitle: '升降次数',
	          	mData: 'totalNum' ,
	          	bSortable: true,
	          	mRender:function(mData,type,full){
	          		 return full.totalNum + ' 次';
	          	}
			},
			{
				sTitle: '创建时间',
	          	mData: 'createTime' ,
	          	bSortable: true,
	          	mRender:function(mData,type,full){
	          		 return new Date(mData).format('yyyy-MM-dd hh:mm:ss');
	          	}
			}
		],
		orderIndex:6,
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
        return date ? (new Date(date)).format("yyyy-MM-dd hh:mm:ss") : "";
    }
	
	/*
	 * 导出
	 */
	$('#export-button').bind('click',function(){
		var data = new Object();
		
		var searchName = $('#search-name').val();
		if(searchName!=''){
			data.stallName = '%'+searchName+'%';
		} 
		var searchLockSn = $('#search-lockSn').val();
		if(searchLockSn!=''){
			data.lockSn = '%'+searchLockSn+'%';
		}
		var searchStartTime = $('#search-startTime').val();
		if(searchStartTime!=''){ 
			data.startTime = searchStartTime; 
		} 
		var searchEndTime = $('#search-endTime').val();
		if(searchEndTime!=''){ 
			data.endTime = searchEndTime; 
		} 
        var url = '/admin/admin/stall_recharge/export';
        data.time = new Date().getTime();
        layui.common.download({
          url:url,
          data: data
        }); 
	});
});