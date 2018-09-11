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
		
		var payStatus = $('#search-pay-status').val();
		if(payStatus!='N'){
			filter = new Object();
			filter.property = 'payStatus';
			filter.value = payStatus;
			filters.push(filter);
		} 
		var payType = $('#search-pay-type').val();
		if(payType!='N'){
			filter = new Object();
			filter.property = 'payType';
			filter.value = payType;
			filters.push(filter);
		}  
		var mobile = $('#search-mobile').val();
		if(mobile!=''){
			filter = new Object();
			filter.property = 'mobile';
			filter.value = mobile;
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
		url:'/admin/account/recharge_record/list', 
		key:'id',
		columns:[ 
			{ sTitle: '编号',   mData: 'code'},
			{ sTitle: '用户',   mData: 'mobile'}, 
			{ 
				sTitle: '储值金额',   
				mData: 'packageAmount',
				mRender:function(mData,type,full){
	          		  return '<label style="color:#4898d5;">'+mData+ '元';
	          	}
			},
			{ 
				sTitle: '支付金额',   
				mData: 'paymentAmount',
				mRender:function(mData,type,full){
	          		 return '<label style="color:#FF5722;">'+mData+ '元';
	          	}
			} ,{ 
				sTitle: '支付方式',   
				mData: 'payType',
				mRender:function(mData,type,full){ 
					var html = '';
					switch(mData){
						case 0:html+='<label>账户余额</label>';break;
						case 1:html+='<label style="color:#009688;">支付宝</label>';break;
						case 2:html+='<label style="color:#0099CC;">微信</label>';break; 
						case 3:html+='<label style="color:#0099CC;">Apple Pay</label>';break; 
						case 4:html+='<label style="color:#0099CC;">微信支付</label>';break; 
						case 5:html+='<label style="color:#0099CC;">银联云闪付</label>';break; 
						case 6:html+='<label style="color:#0099CC;">Huawei Pay</label>';break; 
						case 7:html+='<label style="color:#0099CC;">Mi Pay</label>';break; 
					}
					return html;
	          	}
			}, { 
				sTitle: '支付信息',   
				mData: 'payStatus',
				mRender:function(mData,type,full){ 
					var html = '';
					if(mData){
						html+='<label style="color:#5EB95E">已支付 '+new Date(full.payTime).format('yyyy-MM-dd hh:mm')+'</label>';
					}else{
						html+='<label style="color:#F7B824">未支付</label>';
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
		orderIndex:1,
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
		var payStatus = $('#search-pay-status').val();
		if(payStatus!='N'){ 
			data.payStatus = payStatus; 
		} 
		var payType = $('#search-pay-type').val();
		if(payType!='N'){ 
			data.payType = payType; 
		}  
		var mobile = $('#search-mobile').val();
		if(mobile!=''){ 
			data.mobile = mobile; 
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
        var url = '/admin/account/recharge_record/export';
        
        data.time = new Date().getTime();
        layui.common.download({
          url:url,
          data: data
        }); 
	}); 
});