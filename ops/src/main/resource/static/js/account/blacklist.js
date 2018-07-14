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
	var preMap = layui.common.map();
	var openStatus = true;
	
	

	laydate.render({
	    elem: '#search-time-start',
	    min: '2015-06-16 23:59:59',
	    max: new Date().format('yyyy-MM-dd'),
		istoday: false
	});
	laydate.render({
	    elem: '#search-time-end',
	    min: '2015-06-16 23:59:59',
	    max: new Date().format('yyyy-MM-dd'),
		istoday: false
	}); 
	
	layui.common.ajax({
		url: "/admin/account/blacklist/status",
		data:{time:new Date().getTime()}, 
		success: function(data) {
			openStatus = data;
			if(openStatus){
				$('#open-button').hide();
				$('#close-button').show(); 
			}else{
				$('#open-button').show();
				$('#close-button').hide();
			}
		},
		error:function(){}
	});
  	
	layui.common.ajax({
		url: "/admin/account/blacklist/pre_list",
		data:{time:new Date().getTime()}, 
		success: function(data) {
			$.each(data,function(index,pre){
				preMap.put(pre.id,pre.name);
			});
		},
		error:function(){}
	});
	
	var addServerParams = function(data){   
		var filters = new Array();
		var filter = null;  
		var mobile = $('#search-mobile').val();
		if(mobile!=''){
			filter = new Object();
			filter.property = 'username';
			filter.value = mobile;
			filters.push(filter);
		} 
		var numberStart = $('#search-number-start').val();
		if(numberStart!=''){
			filter = new Object();
			filter.property = 'numberStart';
			filter.value = numberStart;
			filters.push(filter);
		}
		var numberEnd = $('#search-number-end').val();
		if(numberEnd!=''){
			filter = new Object();
			filter.property = 'numberEnd';
			filter.value = numberEnd;
			filters.push(filter);
		}
		var searchStartTime = $('#search-time-start').val();
		if(searchStartTime!=''){
			filter = new Object();
			filter.property = 'startTime';
			filter.value = searchStartTime;
			filters.push(filter);
		}
		var searchEndTime = $('#search-time-end').val();
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
		id:'blacklist-table',
		url:'/admin/account/blacklist/list', 
		key:'id',
		columns:[ 
			{ sTitle: '用户',   mData: 'username'},
			{
				sTitle: '常规使用地',
	          	mData: 'maxPreId' ,
	          	bSortable: true,
	          	mRender:function(mData,type,full){
	          		var html = '';
	          		if(full.maxPreId==full.minPreId){
	          			if(preMap.get(full.maxPreId)!=null){
	          				html += preMap.get(full.maxPreId);
	          			}
	          		}else{
	          			if(preMap.get(full.maxPreId)!=null){
	          				html += preMap.get(full.maxPreId);
	          			} 
	          			if(preMap.get(full.minPreId)!=null){
	          				if(html != ''){
	          					html += '<br/>';
	          				}
	          				html += preMap.get(full.minPreId);
	          			}
	          		}
	          		return html;
	          	}
			}, 
			
			{ 
				sTitle: '交易次数',   
				bSortable: true,
				mData: 'totalOrderCount'
			},{ 
				sTitle: '停车券数量',   
				bSortable: true,
				mData: 'couponCount'
			},
			{
				sTitle: '停车券截止日期',
	          	mData: 'couponValidate' ,
	          	bSortable: true,
	          	mRender:function(mData,type,full){
	          		 return new Date(mData).format('yyyy-MM-dd hh:mm');
	          	}
			} ,{ 
				sTitle: '现金交易次数',   
				bSortable: true,
				mData: 'cashOrderCount'
			},
			{ 
				sTitle: '状态',   
				bSortable: true,
				mData: 'limitStatus',
				mRender:function(mData,type,full){
					var html = '<label style="color:#FF5722;">禁用</label>';
					if(mData==0){
						html = '<label style="color:#4898d5;">解禁</label>'
					}
	          		return html;
	          	}
			},
			{
				sTitle: '创建时间',
	          	mData: 'createTime' ,
	          	bSortable: true,
	          	mRender:function(mData,type,full){
	          		 return new Date(mData).format('yyyy-MM-dd hh:mm');
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
	$('#search-button').bind('click',function(){
		var numberStart = $('#search-number-start').val();
		var numberEnd = $('#search-number-end').val();
		if(numberEnd!='' && numberStart !=''){
			var s = Number(numberStart);
			var e = Number(numberEnd);
			if(e < s){
				layui.msg.error('请重新输入数量范围');
				return false;
			}
		}
		query();
	});  
	
	$('#enable-button').bind('click',function(){
		var list = datatable.selected(); 
		if(list.length<1){
			layui.msg.error('请至少选择一条记录');
			return false;
		}
		var ids = new Array();
		$.each(list,function(index,clazz){
			ids.push(clazz.id);
		});
		layui.msg.confirm('您确定要解锁选中用户吗',function(){
			layui.common.ajax({
				url:'/admin/account/blacklist/enable',
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
					
				}
			});
		}); 
	});
	
	$('#open-button').bind('click',function(){ 
		layui.msg.confirm('您确定要开启黑名单功能吗?',function(){
			layui.common.ajax({
				url: "/admin/account/blacklist/open",
				data:{time:new Date().getTime()}, 
				success: function(res) {
					if(res.success){  
						$('#open-button').hide();
						$('#close-button').show();
						layui.msg.success(res.content); 
					}else{
						layui.msg.error(res.content);
					}
				},
				error:function(){}
			});
		}); 
	});
	
	$('#close-button').bind('click',function(){
		layui.msg.confirm('您确定要关闭黑名单功能吗?',function(){
			layui.common.ajax({
				url: "/admin/account/blacklist/close",
				data:{time:new Date().getTime()}, 
				success: function(res) {
					if(res.success){  
						layui.msg.success(res.content); 
						$('#open-button').show();
						$('#close-button').hide();
					}else{
						layui.msg.error(res.content);
					}
				},
				error:function(){}
			});
		}); 
	});
	
	$('#export-button').bind('click',function(){  
        var url = '/admin/account/blacklist/export'; 
        layui.common.download({
          url:url,
          data: {time:new Date()}
        }); 
	}); 
});