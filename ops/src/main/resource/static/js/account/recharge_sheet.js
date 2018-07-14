layui.config({
	base: 'js/lib/'
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
		var searchPhone = $('#search-phone').val();
		if(searchPhone!=''){
			filter = new Object();
			filter.property = 'username';
			filter.value = searchPhone;
			filters.push(filter);
		}
		var searchType = $('#search-category').val();
		if(searchType!=''){
			filter = new Object();
			filter.property = 'type';
			filter.value = searchType;
			filters.push(filter);
		} 
		var searchSource = $('#search-source').val();
		if(searchSource!=''){
			filter = new Object();
			filter.property = 'source';
			filter.value = searchSource;
			filters.push(filter);
		} 
		var searchStartTime = $('#search-start').val();
		if(searchStartTime!=''){
			filter = new Object();
			filter.property = 'startTime';
			filter.value = searchStartTime;
			filters.push(filter);
		}
		var searchEndTime = $('#search-end').val();
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
		id:'detail-table',
		url:'/admin/account/wallet_detail/list', 
		key:'id',
		columns:[ 
			{ sTitle: '手机号',   mData: 'username'},
			{ sTitle: '金额',   
				mData: 'amount'
			},
			{ sTitle: '分类',   mData: 'type',
	          	mRender:function(mData,type,full){
	          		var html = ''; 
	          		if(full.type==1){
	          			html = '<label style="color:gray;">消费</label>';
	          		} else if(full.type==2){
	          			html = '<label style="color:gray;">充值</label>'; 
	          		}
	          		return html;
	          	}	
			},
			{ sTitle: '来源',   mData: 'source'
				,
	          	mRender:function(mData,type,full){
	          		var html = ''; 
	          		if(full.source==1){
	          			html = '<label style="color:gray;">支付宝</label>';
	          		} else if(full.source==2){
	          			html = '<label style="color:gray;">微信支付</label>'; 
	          		} else if(full.source==3){
	          			html = '<label style="color:gray;">充值赠送</label>'; 
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
			},
			{
				sTitle: '当前账户余额(元)',
	          	mData: 'accountAmount' 
	          
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
	
    
    $('#search-button').bind('click',function(){
		query();
	});   
    
    $('#export-button').bind('click',function(){
    	var data = new Object();
    	if($("#search-phone").val() != ''){
    		data.mobile = $("#search-phone").val();
    	}
    	if($("#search-category").val() != ''){
    		data.type = $("#search-category").val();
    	}
    	if($("#search-source").val() != ''){
    		data.source = $("#search-source").val();
    	}
    	if($("#search-start").val() != ''){
    		data.startTime = $("#search-start").val();
    	}
    	if($("#search-end").val() != ''){
    		data.endTime = $("#search-end").val();
    	}
    	
    	data.time = new Date().getTime();
    	layui.common.download({
			url:"/admin/account/wallet_detail/export",
			data: data
		}); 
    });
    
});