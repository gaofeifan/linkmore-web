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
    var type = getUrlParam("type");
	
	var addServerParams = function(data){   
		var searchName = $('#search-name').val();
		var filters = new Array();
		var filter = null; 
		if(searchName!=''){
			filter = new Object();
			filter.property = 'username';
			filter.value = '%'+searchName +'%';
			filters.push(filter);
		}
		if(tempId!=''){
			filter = new Object();
			filter.property = 'templateId';
			filter.value = tempId ;
			filters.push(filter);
		}
		
		if(filters.length>0){
			data.push({name:'filterJson',value:JSON.stringify({filters:filters})});
		}
	};
	
	var datatable = layui.datatable.init({
		id:'user-table',
		url:'/admin/coupon_send_user/list',
		key:'id',
		columns:[
		    { sTitle: '序号',   mData: 'id'},
			{ sTitle: '用户名称',   mData: 'username'},
			{ sTitle: '停车券名称',  mData: 'tempName'} , 
			{ sTitle: '停车券金额',  mData: 'unitAmount'} , 
			{ sTitle: '停车券使用情况',  mData: 'usage'} , 
			{
				sTitle: '是否回滚',
	          	mData: 'rollbackFlag',
	          	mRender:function(mData,type,full){
	          		var html = '';
	          		if(1== mData){
	          			html += '<label style="color:#00CED1;">已回滚</label>';
	          		}else{
	          			html += '<label style="color:#FA8072">未回滚</label>';
	          		}
	          		return html;
	          	}
			},
			{
				sTitle: '发送时间',
	          	mData: 'createTime' ,
	          	bSortable: true,
	          	mRender:function(mData,type,full){
	          		 return new Date(mData).format('yyyy-MM-dd hh:mm');
	          	}
			},
			{ sTitle: '发送人',  mData: 'creatorName'}
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
	
	$('#return-button').bind('click',function(){
		if(type == 0){
			window.location.href="list.html";
		}else if(type == 2){
			window.location.href="pull_list.html";
		}else{
			window.location.href="subject_list.html";
		}
	});
	$('#return-button2').bind('click',function(){
		window.location.href="list.html";
	});
	$('#return-button3').bind('click',function(){
		window.location.href="list.html";
	});
	
});