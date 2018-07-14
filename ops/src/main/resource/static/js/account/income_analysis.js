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
layui.use(['layer','table','element','msg','form', 'common','validate','datatable','laydate'], function() {
	var validate = layui.validate;
	var session = window.sessionStorage;
	var layer = layui.layer;  
	var $ = layui.jquery; 
	var form = layui.form;  
	var laydate = layui.laydate; 
	var element = layui.element;
	var prefectureMap = layui.common.map();
	var preSelectMap = layui.common.map();
	var table = layui.table;
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
	
	// 城市
	var cityHtml = '';
	layui.common.ajax({
		url:'/admin/account/report_day_income/city_list',
		async:false,
		success:function(list){
			cityHtml = '<option value="0">All</option>';
			$.each(list,function(index,city){
				cityHtml += '<option value="'+city.id+'">';
				cityHtml += city.cityName;
				cityHtml += '</option>';
			});
			$('#search-city').html(cityHtml);
			form.render('select');
		},error:function(){
		}
	});
	form.on('select(city)', function(data) {
		var cityId = data.value;
		preList(cityId);
	});
	
	var preIdHtml= '';
	form.on('select(pre)', function(data) {
		var preId = data.value;	
		if(preId != 0){
			var preName = prefectureMap.get(preId);
			preSelectMap = layui.common.map();
			$.each($(".layui-tab-title li[lay-id]"), function () {
				var preId2 = $(this).attr("lay-id");
				var preName2 = prefectureMap.get(preId2);
				preSelectMap.put(preId2,preName2);
			});
		
			if(preSelectMap.get(preId)=='' || 
				preSelectMap.get(preId)==undefined ){
				element.tabAdd('demo', {
				  title: preName
				  ,content: preName //支持传入html
				  ,id: preId
				});
			}
		}		
	});
	
	
	preList(0);
	// 车区
	
	var preHtml = '';
	function preList(cityId){
		layui.common.ajax({
			url:'/admin/account/report_day_income/pre_list?cityId='+ cityId,
			contentType:'application/json; charset=utf-8',
			async:false,
			success:function(list){
				preHtml = '<option value="0">All</option>';
				$.each(list,function(index,pre){
					prefectureMap.put(pre.id,pre.name);
					preHtml += '<option value="'+pre.id+'">';
					preHtml += pre.name;
					preHtml += '</option>';
				});
				$('#search-prefecture').html(preHtml);
				form.render('select');
			},error:function(){
			}
		});
	}
	
	var preIds = "";
	var startTime = "";
	var endTime = "";
	var searchCity = "";
	var query =  function(){
		
		startTime = $('#search-start').val();
	    endTime = $('#search-end').val();
	    searchCity = $('#search-city').val();
		
		if(startTime == ''){
			layui.msg.error("请输入开始日期");
			return false;
		}
		if(endTime == ''){
			layui.msg.error("请输入截止日期");
			return false;
		}
		if(startTime > endTime){
			layui.msg.error("开始日期不能大于结束日期");
			return false;
		}
		
		var start = new Date(startTime.replace(/-/g, "/"));
		var end = new Date(endTime.replace(/-/g, "/"));
		var days = end.getTime() - start.getTime();
		var time = parseInt(days / (1000 * 60 * 60 * 24));
		if(time>31){
			layui.msg.error("日期时间差不能超过31天");
			return false;
		}
		preIds = "";
		$.each($(".layui-tab-title li[lay-id]"), function () {
			preIds = preIds + $(this).attr("lay-id") +",";
		});		
		
		getHeaderData();
		getIncomeHeaderData();
		
	} ;  
	
	element.on('tab(detail)', function(data){
		location.hash = 'detail='+ $(this).attr("lay-id-tab");
	});


	$('.search_btn').bind('click',function(){
		query();
	});  
	 
    function getHeaderData(){  
	  $.ajax({    
			type:'post',    
			url:'/admin/account/report_day_income/title',
			data:{startTime: startTime,endTime:endTime,preIds:preIds,cityId:searchCity},
			success:function(data){ 
				cost("#costTable",data,"/admin/account/report_day_income/cost");
			}   
	  });    
    }
	
	function getIncomeHeaderData(){  
	  $.ajax({    
			type:'post',    
			url:'/admin/account/report_day_income/income_title',
			data:{startTime: startTime,endTime:endTime,preIds:preIds,cityId:searchCity},
			success:function(data){ 
				deal("#dealTable",data,"/admin/account/report_day_income/deal");
				dealCost("#dealCostTable",data,"/admin/account/report_day_income/deal_cost");
				cash("#cashTable",data,"/admin/account/report_day_income/cash");
				cashDeal("#cashDealTable",data,"/admin/account/report_day_income/cash_deal");
				cashCost("#cashCostTable",data,"/admin/account/report_day_income/cash_cost");
				fee("#feeTable",data,"/admin/account/report_day_income/fee");
				pullCost("#pullCostTable",data,"/admin/account/report_day_income/pull_cost");
			}   
	  });    
    }
	//成本
	function cost(element,data,url){
		table.render({
			elem: element,
			url:url,
			method:'POST',
			where: {startTime: startTime,endTime:endTime,preIds:preIds,cityId:searchCity},
			cellMinWidth: 240, //全局定义常规单元格的最小宽度，layui 2.2.1 新增
			cols: [data]
		});       
    }
	//交易额
	function deal(element,data,url){
		table.render({
			elem: element,
			url:url,
			method:'POST',
			where: {startTime: startTime,endTime:endTime,preIds:preIds,cityId:searchCity},
			cellMinWidth: 240, //全局定义常规单元格的最小宽度，layui 2.2.1 新增
			cols: [data]
		});       
    }
	//交易额占成本
	function dealCost(element,data,url){
		table.render({
			elem: element,
			url:url,
			method:'POST',
			where: {startTime: startTime,endTime:endTime,preIds:preIds,cityId:searchCity},
			cellMinWidth: 240, //全局定义常规单元格的最小宽度，layui 2.2.1 新增
			cols: [data]
		});       
    }
	//现金收入
	function cash(element,data,url){
		table.render({
			elem: element,
			url:url,
			method:'POST',
			where: {startTime: startTime,endTime:endTime,preIds:preIds,cityId:searchCity},
			cellMinWidth: 240, //全局定义常规单元格的最小宽度，layui 2.2.1 新增
			cols: [data]
		});       
    }
	//现金成本占交易额
	function cashDeal(element,data,url){
		table.render({
			elem: element,
			url:url,
			method:'POST',
			where: {startTime: startTime,endTime:endTime,preIds:preIds,cityId:searchCity},
			cellMinWidth: 240, //全局定义常规单元格的最小宽度，layui 2.2.1 新增
			cols: [data]
		});       
    }
	//现金收入占成本
	function cashCost(element,data,url){
		table.render({
			elem: element,
			url:url,
			method:'POST',
			where: {startTime: startTime,endTime:endTime,preIds:preIds,cityId:searchCity},
			cellMinWidth: 240, //全局定义常规单元格的最小宽度，layui 2.2.1 新增
			cols: [data]
		});       
    }
	//费用
	function fee(element,data,url){
		table.render({
			elem: element,
			url:url,
			method:'POST',
			where: {startTime: startTime,endTime:endTime,preIds:preIds,cityId:searchCity},
			cellMinWidth: 240, //全局定义常规单元格的最小宽度，layui 2.2.1 新增
			cols: [data]
		});       
    }
	//拉新成本
	function pullCost(element,data,url){
		table.render({
			elem: element,
			url:url,
			method:'POST',
			where: {startTime: startTime,endTime:endTime,preIds:preIds,cityId:searchCity},
			cellMinWidth: 240, //全局定义常规单元格的最小宽度，layui 2.2.1 新增
			cols: [data]
		});       
    }
	
});