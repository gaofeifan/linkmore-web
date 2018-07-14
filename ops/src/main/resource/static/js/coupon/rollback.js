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
layui.use(['layer','msg','form', 'common','validate','datatable','laydate'], function() {
	var validate = layui.validate; 
	var layer = layui.layer;  
	var $ = layui.jquery; 
	var form = layui.form;
	var laydate = layui.laydate; 
	
	function getUrlParam(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
        var r = window.location.search.substr(1).match(reg);  //匹配目标参数
        if (r != null) return unescape(r[2]);
        return null; //返回参数值
    }

    var tempId = getUrlParam("tempId");
    
	var addServerParams = function(data){   
		var templateName = $('#search-templateName').val();
		var serialNumber = $('#search-serialNumber').val();
		var enterpriseName = $('#search-enterpriseName').val();
		var filters = new Array();
		var filter = null; 
		
		if(tempId!=''){
			filter = new Object();
			filter.property = 'templateId';
			filter.value = tempId ;
			filters.push(filter);
		}
		
		if(templateName!=''){
			filter = new Object();
			filter.property = 'templateName';
			filter.value = '%'+templateName +'%';
			filters.push(filter);
		}
		if(serialNumber!=''){
			filter = new Object();
			filter.property = 'serialNumber';
			filter.value = '%'+serialNumber +'%';
			filters.push(filter);
		}
		if(enterpriseName!=''){
			filter = new Object();
			filter.property = 'enterpriseName';
			filter.value = '%'+enterpriseName +'%';
			filters.push(filter);
		}
		
		if(filters.length>0){
			data.push({name:'filterJson',value:JSON.stringify({filters:filters})});
		}
	};
	
	$('#return-button').bind('click',function(){
		window.location.href="../enterprise/list.html";
	});
	
	var datatable = layui.datatable.init({
		id:'rollback-table',
		url:'/admin/coupon_rollback/list',
		/*key:'id',*/
		columns:[
		    { sTitle: '停车券名称',   mData: 'templateName'},
			{ sTitle: '企业名称',   mData: 'enterpriseName'},
			{ sTitle: '合同编号',  mData: 'serialNumber'} , 
			{ sTitle: '已发放合同金额',  mData: 'usedDealPayAmount'} , 
			{ sTitle: '已发放赠送金额',  mData: 'userDealGiftAmount'},
			{ sTitle: '回滚订单金额',  mData: 'contractAmount'} , 
			{ sTitle: '回滚赠送金额',  mData: 'givenAmount'},
			{ sTitle: '回滚后已发放合同金额',  mData: 'afterDealPayAmount'} , 
			{ sTitle: '回滚后已发放赠送金额',  mData: 'afterDealGiftAmount'},
			{
				sTitle: '回滚时间',
	          	mData: 'rollbackDate' ,
	          	bSortable: true,
	          	mRender:function(mData,type,full){
	          		 return new Date(mData).format('yyyy-MM-dd hh:mm');
	          	}
			},
		],
		orderIndex:1,
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