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

	laydate.render({
	    elem: '#search-start',
	    min: '2015-06-16 23:59:59',
	    max: new Date().format('yyyy-MM-dd'),
		istoday: false
	});
	laydate.render({
	    elem: '#search-end',
	    min: '2015-06-16 23:59:59',
	    max: new Date().format('yyyy-MM-dd'),
		istoday: false
	}); 
  	
  	
  	var prefHtml = '';
	var prefList = null;
	var prefMap = layui.common.map();
	layui.common.ajax({
		url:'/admin/account/order/prefecture_list',
		data:{time:new Date().getTime()}, 
		async:false,
		success:function(list){
			prefList = list;
			prefHtml = '<option value="0">选择专区</option>';
			$.each(list,function(index,pref){
				prefMap.put(pref.id,pref);
				prefHtml += '<option value="'+pref.id+'">';
				prefHtml += pref.name;
				prefHtml += '</option>';
			});
			$('#search-prefecture').html(prefHtml);
			form.render('select');
		},error:function(){
			
		}
	});
	var initStall = function(id){
		layui.common.ajax({
			url:'/admin/account/order/stall_list',
			data:{time:new Date().getTime(),pid:id}, 
			async:false,
			success:function(list){ 
				var html = '<option value="0">选择车位</option>';
				$.each(list,function(index,stall){ 
					html += '<option value="'+stall.id+'">';
					html += stall.stallName;
					html += '</option>';
				});
				$('#search-stall').html(html);
				form.render('select');
			},error:function(){
				
			}
		});
	};
	form.on('select(prefecture)', function(data) {
		var pid = data.value;  
		initStall(pid);
	}); 
	var addServerParams = function(data){   
		var filters = new Array();
		var filter = null;  
		var username = $('#search-username').val();
		if(username!=''){
			filter = new Object();
			filter.property = 'username';
			filter.value = username;
			filters.push(filter);
		} 
		var stallId = $('#search-stall').val();
		var preId = $('#search-prefecture').val();
		if(stallId!=0){
			filter = new Object();
			filter.property = 'stallId';
			filter.value = stallId;
			filters.push(filter);
		}else if(preId!=0){
			filter = new Object();
			filter.property = 'preId';
			filter.value = preId;
			filters.push(filter);
		}
		var plateNo = $('#search-plateno').val();
		if(plateNo!=''){
			filter = new Object();
			filter.property = 'plateNo';
			filter.value = plateNo;
			filters.push(filter);
		} 
		var code = $('#search-code').val();
		if(code!=''){
			filter = new Object();
			filter.property = 'code';
			filter.value = code;
			filters.push(filter);
		} 
		var startTime = $('#search-start').val();
		if(startTime!=''){
			filter = new Object();
			filter.property = 'startTime';
			filter.value = startTime;
			filters.push(filter);
		} 
		var endTime = $('#search-end').val();
		if(endTime!=''){
			filter = new Object();
			filter.property = 'endTime';
			filter.value = endTime;
			filters.push(filter);
		}
		if(filters.length>0){
			data.push({name:'filterJson',value:JSON.stringify({filters:filters})});
		}
	};
	var datatable = layui.datatable.init({
		id:'order-table',
		url:'/admin/account/order/list', 
		key:'id',
		columns:[ 
			{ sTitle: '编号',   mData: 'orderNo'},
			{ sTitle: '用户名',   mData: 'username'},
			{ 
				sTitle: '专区车位',   
				mData: 'prefectureName',
				mRender:function(mData,type,full){
	          		  return mData+'['+full.stallName+']'
	          	}
			}, 
			{ 
				sTitle: '降锁',   
				mData: 'lockDownStatus',
				mRender:function(mData,type,full){
					var html = '';
					switch(mData){
						case null:html += '<span style="color:gray;">未操作'+'</span>';break;
						case 0:html+='<span style="color:red;">失败 '+new Date(full.endTime).format('hh:mm')+'</span>';break;
						case 1:html+='<span style="color:green;">成功 '+new Date(full.endTime).format('hh:mm')+'</span>';break;
					}
					return html;
	          	}
			}, 
			{ sTitle: '车牌号',   mData: 'plateNo'},
			{ 
				sTitle: '状态',   
				mData: 'status',
				mRender:function(mData,type,full){ 
					var html = '';
					switch(mData){
						case 1:html+='<label style="color:#1E9FFF;">待支付</label>';break;
						case 2:html+='<label style="color:#0099CC;">已支付</label>';break;
						case 3:html+='<label style="color:#5FB878;">已完成</label> '+new Date(full.endTime).format('MM-dd hh:mm');break;
						case 4:html+='<label style="color:#979DAF;">已取消</label>';break;
						case 5:html+='<label style="color:#0099CC;">已退款</label>';break;
						case 6:html+='<label style="color:#FF5722;">已挂起</label>'+new Date(full.statusTime).format('MM-dd hh:mm');break;
						case 7:html+='<label style="color:#61768d;">已关闭</label>'+new Date(full.statusTime).format('MM-dd hh:mm');break;
					}
					return html;
	          	}
			}, 
			{ 
				sTitle: '订单金额',   
				mData: 'totalAmount',
				mRender:function(mData,type,full){
	          		  return '<label style="color:#4898d5;">'+mData+ '元';
	          	}
			},
			{ 
				sTitle: '实际支付',   
				mData: 'actualAmount',
				mRender:function(mData,type,full){
	          		 return '<label style="color:#FF5722;">'+mData+ '元';
	          	}
			},
			{
				sTitle: '预约时间',
	          	mData: 'createTime' ,
	          	bSortable: true,
	          	mRender:function(mData,type,full){
	          		 return new Date(mData).format('yyyy-MM-dd hh:mm');
	          	}
			} 
		],
		orderIndex:9,
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
		var username = $('#search-username').val();
		if(username!=''){
			data.username = username; 
		} 
		var stallId = $('#search-stall').val();
		var preId = $('#search-prefecture').val();
		if(stallId!=0){
			data.stallId = stallId;
		}else if(preId!=0){
			data.preId = preId;
		}
		var plateNo = $('#search-plateno').val();
		if(plateNo!=''){
			filter = new Object();
			filter.property = 'plateNo';
			filter.value = plateNo;
			filters.push(filter);
		} 
		var code = $('#search-code').val();
		if(code!=''){ 
			data.code = code; 
		} 
		var startTime = $('#search-start').val();
		if(startTime!=''){ 
			data.startTime = startTime; 
		} 
		var endTime = $('#search-end').val();
		if(endTime!=''){ 
			data.endTime = endTime; 
		}
        var url = '/admin/account/order/export';
        
        data.time = new Date().getTime();
        layui.common.download({
          url:url,
          data: data
        }); 
	}); 
});