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
	var addServerParams = function(data){   
		var filters = new Array();
		var filter = null; 
		var nickname = $('#search-nickname').val();
		if(nickname!=''){
			filter = new Object();
			filter.property = 'nickname';
			filter.value = '%'+nickname+'%';
			filters.push(filter);
		}
		var mobile = $('#search-mobile').val();
		if(mobile!=''){
			filter = new Object();
			filter.property = 'mobile';
			filter.value = mobile;
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
		id:'account-table',
		url:'/admin/account/account/list', 
		key:'id',
		columns:[ 
			{ sTitle: '手机号',   mData: 'mobile'},
			{ sTitle: '昵称',   mData: 'nickname'},
			{ 
				sTitle: '账户余额',   
				mData: 'usableAmount',
				mRender:function(mData,type,full){
	          		 return '<label style="color:#5FB878;">'+mData+ '元';
	          	}
			}, 
			{ 
				sTitle: '订单总额',   
				mData: 'orderPaymentAmount',
				mRender:function(mData,type,full){
	          		  return '<label style="color:#4898d5;">'+mData+ '元';
	          	}
			},
			{ 
				sTitle: '储值总额',   
				mData: 'rechagePaymentAmount',
				mRender:function(mData,type,full){
	          		 return '<label style="color:#FF5722;">'+mData+ '元';
	          	}
			},
			{ 
				sTitle: '赠送金额',   
				mData: 'giftAmount',
				mRender:function(mData,type,full){
					var html = 0;
					if(mData > 0){
						html = mData;
					}
					return '<label style="color:#FF5722;">'+html+ '元';
				}
			},
			{ 
				sTitle: '赠送总额',   
				mData: 'giftTotalAmount',
				mRender:function(mData,type,full){
					var html = 0;
					if(mData > 0){
						html = mData;
					}
					return '<label style="color:#FF5722;">'+html+ '元';
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
		query();
	});   
});