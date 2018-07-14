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
		var searchNickname = $('#search-nickname').val();
		var filters = new Array();
		var filter = null; 
		if(searchNickname!=''){
			filter = new Object();
			filter.property = 'nickname';
			filter.value = searchNickname;
			filters.push(filter);
		}   
		var searchUid = $('#search-uid').val();
		if(searchUid=='1'){
			filter = new Object();
			filter.property = 'binduid';
			filter.value = searchUid;
			filters.push(filter);
		}else if(searchUid=='2'){
			filter = new Object();
			filter.property = 'bindnull';
			filter.value = searchUid;
			filters.push(filter);
		}
		var searchStart = $('#search-start').val();
		if(searchStart!=''){
			filter = new Object();
			filter.property = 'startTime';
			filter.value = searchStart;
			filters.push(filter);
		}   
		var searchEnd = $('#search-end').val();
		if(searchEnd!=''){
			filter = new Object();
			filter.property = 'endTime';
			filter.value = searchEnd;
			filters.push(filter);
		}   
		if(filters.length>0){
			data.push({name:'filterJson',value:JSON.stringify({filters:filters})});
		}
	};
	var datatable = layui.datatable.init({
		id:'wechat-fans-table',
		url:'/admin/biz/wechat_fans/list', 
		key:'id',
		columns:[ 
			{ 
				sTitle: '头像',   
				mData: 'headimagurl',
				mRender:function(mData,type,full){
					if(mData!=null&&mData!=''){
						return '<img style="width:40px;" src="'+mData+'"/>';
					}
	          		return '';
	          	}
			}, 
			{ sTitle: '昵称',   mData: 'nickname'}, 
			{ 
				sTitle: '地区',   
				mData: 'city',
				mRender:function(mData,type,full){
					var html = '<label style="color:#999">未知</label>';
	          		if(full.city!=null&&full.city!=''){
	          			html = '<label style="color:#333">';
	          			html = full.city + ' '+ full.district;
	          			html +='</label>';
	          		}
	          		return html;
	          	}
			},     
			{ 
				sTitle: '关注状态',   
				mData: 'subscribeStatus',
				mRender:function(mData,type,full){
					var html = '<label style="color:green">已关</label>';
	          		if(full.subscribeStatus==0){
	          			html = '<label style="color:red">取关</label>';
	          		}if(full.subscribeStatus==10001){
	          			html = '<label style="color:blue">捷峻</label>';
	          		}
	          		return html;
	          	}
			},     
			{ 
				sTitle: '注册状态',   
				mData: 'uid',
				mRender:function(mData,type,full){
					var html = '<label style="color:gray">未注册</label>';
	          		if(mData!=null){
	          			html = '<label style="color:#333">已注册</label>';
	          		} 
	          		return html;
	          	}
			}, { 
				sTitle: '性别',   
				mData: 'sex',
				mRender:function(mData,type,full){
					var html = '<label style="color:#999">保密</label>';
	          		if(full.sex==1){
	          			html = '<label style="color:#666">先生</label>';
	          		}if(full.sex==2){
	          			html = '<label style="color:#333">女士</label>';
	          		}
	          		return html;
	          	}
			},  
			{
				sTitle: '关注时间',
	          	mData: 'createTime' ,
	          	bSortable: true,
	          	mRender:function(mData,type,full){
	          		 return new Date(mData).format('yyyy-MM-dd hh:mm');
	          	}
			} 
		],
		orderIndex:7,
		orderType:'desc',
		filter:addServerParams
	});  
	
	var query =  function(){
		datatable.reload();
		
	} ;  
	$('#search-button').bind('click',function(){
		query();
	});
	$('#export-button').bind('click',function(){ 
		var data = new Object();  
		var searchNickname = $('#search-nickname').val(); 
		if(searchNickname!=''){
			data.nickname = searchNickname;
		}   
		var searchUid = $('#search-uid').val();
		if(searchUid=='1'){ 
			data.binduid = '1'; 
		}else if(searchUid=='2'){ 
			data.bindnull = '2'; 
		}
		var startTime = $('#search-start').val();
		if(startTime!=''){ 
			data.startTime = startTime; 
		} 
		var endTime = $('#search-end').val();
		if(endTime!=''){ 
			data.endTime = endTime; 
		}
        var url = '/admin/biz/wechat_fans/export'; 
        data.time = new Date().getTime();
        layui.common.download({
          url:url,
          data: data
        }); 
	}); 
});