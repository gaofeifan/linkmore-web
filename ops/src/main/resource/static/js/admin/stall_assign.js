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
	
	var prefHtml = '';
	var prefList = null;
	var prefMap = layui.common.map();
	layui.common.ajax({
		url:'/admin/admin/stall_assign/prefecture_list',
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
			url:'/admin/admin/stall_assign/stall_list',
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
		var searchStaff = $('#search-staff').val();
		if(searchStaff!=''){
			filter = new Object();
			filter.property = 'staffName';
			filter.value = '%'+searchStaff +'%';
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
		id:'stall-assign-table',
		url:'/admin/admin/stall_assign/list', 
		key:'id',
		columns:[ 
		    { sTitle: '车位锁',   mData: 'lockSn'},
			{ sTitle: '车位名称',   mData: 'stallName'},
			{ sTitle: '车牌号',   mData: 'carno'},
			{ sTitle: '指定人',   mData: 'staffName'}, 
			{
				sTitle: '状态',
	          	mData: 'status' ,
	          	bSortable: true,
	          	mRender:function(mData,type,full){
	          		var html = '';
	          		if(mData==0){
	          			html = '<label style="color:blue;">指定中</label>';
	          		}else if(mData==1){
	          			html = '<label style="color:gray;">';
	          			html += '已取消 ';
	          			html += '<span style="color:red;">';
	          			html += new Date(full.cancelTime).format('hh:mm:ss');
	          			html += '</span>';
	          			html += '</label>';
	          		}else{
	          			html = '<label style="color:green;">';
	          			html += '已下单  '; 
	          			html += ' <span style="color:red;">';
	          			html += new Date(full.orderTime).format('hh:mm:ss');
	          			html += '</span>   ';
	          			html += full.orderNo;
	          			html += '</label>';
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
	 
});