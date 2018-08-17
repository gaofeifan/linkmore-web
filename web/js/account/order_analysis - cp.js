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
	var statusOptionMap = layui.common.map();
	var statusSelectMap = layui.common.map();
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
		url:'/admin/account/report_day_order/city_list',
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
	statusOptionMap.put(1,"未支付");
	statusOptionMap.put(3,"已完成");
	statusOptionMap.put(4,"已取消");
	statusOptionMap.put(6,"已挂起");
	statusOptionMap.put(7,"已关闭");
	
	form.on('select(order)', function(data) {
		var statuId = data.value;
		if(statuId !=0){
			var statusName = statusOptionMap.get(statuId);
			statusSelectMap = layui.common.map();
			$.each($(".layui-tab-title.order li[lay-id]"), function () {
				var statuId2 = $(this).attr("lay-id");
				var statuName2 = statusOptionMap.get(statuId2);
				statusSelectMap.put(statuId2,statuName2);
			});
		
			if(statusSelectMap.get(statuId)=='' || 
				statusSelectMap.get(statuId)==undefined ){
				element.tabAdd('select-order', {
				   title: statusName
				  ,content: statusName //支持传入html
				  ,id: statuId
				});
			}
		}		
	});
	
	
	preList(0);
	// 车区
	
	var preHtml = '';
	function preList(cityId){
		layui.common.ajax({
			url:'/admin/account/report_day_order/pre_list?cityId='+ cityId,
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
	
	var statuIds ="";
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
		$.each($(".layui-tab-title.pre li[lay-id]"), function () {
			preIds = preIds + $(this).attr("lay-id") +",";
		});	
		
		statuIds ="";
		$.each($(".layui-tab-title.order li[lay-id]"), function () {
			statuIds = statuIds + $(this).attr("lay-id") +",";
		});	
		
		getHeaderData();
		//getYlHeaderData();
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
			url:'/admin/account/report_day_order/title',
			data:{startTime: startTime,endTime:endTime,preIds:preIds,cityId:searchCity},
			success:function(data){ 
				//order("#orderTable",data,"/admin/account/report_day_order/order");
				newUserOrder("#newUserOrderTable",data,"/admin/account/report_day_order/newuser_order");
				oldUserOrder("#oldUserOrderTable",data,"/admin/account/report_day_order/olduser_order");
				
				//runtime("#runtimeTable",data,"/admin/account/report_day_order/runtime");
				//runtimeRate("#runtimeRateTable",data,"/admin/account/report_day_order/runtime_rate");
				//rdl("#rdlTable",data,"/admin/account/report_day_order/rdl");
				//jtsc("#jtscTable",data,"/admin/account/report_day_order/jtsc");
				//averagePrice("#averagePriceTable",data,"/admin/account/report_day_order/average_price");
			}   
	  });    
    }
	
	function getYlHeaderData(){  
	  $.ajax({    
			type:'post',    
			url:'/admin/account/report_day_order/yl_title',
			data:{startTime: startTime,endTime:endTime,preIds:preIds,cityId:searchCity},
			success:function(data){ 
				ylOrder("#ylOrderTable",data,"/admin/account/report_day_order/yl_order");
			}   
	  });    
    }

	function order(element,data,url){
		table.render({
			elem: element,
			url: url,
			method:'POST',
			where: {startTime: startTime,endTime:endTime,preIds:preIds,cityId:searchCity,statuIds:statuIds},
			cellMinWidth: 240, //全局定义常规单元格的最小宽度，layui 2.2.1 新增
			cols: [data]
		});  
    }
	
	function ylOrder(element,data,url){
		table.render({
			elem: element,
			url:url,
			method:'POST',
			where: {startTime: startTime,endTime:endTime,preIds:preIds,cityId:searchCity},
			cellMinWidth: 240, //全局定义常规单元格的最小宽度，layui 2.2.1 新增
			cols: [data]
		});       
    }
	function oldUserOrder(element,data,url){
		table.render({
			elem: element,
			url:url,
			method:'POST',
			where: {startTime: startTime,endTime:endTime,preIds:preIds,cityId:searchCity},
			cellMinWidth: 240, //全局定义常规单元格的最小宽度，layui 2.2.1 新增
			cols: [data]
		});       
    }
	
	function newUserOrder(element,data,url){
		table.render({
			elem: element,
			url:url,
			method:'POST',
			where: {startTime: startTime,endTime:endTime,preIds:preIds,cityId:searchCity},
			cellMinWidth: 240, //全局定义常规单元格的最小宽度，layui 2.2.1 新增
			cols: [data]
		});       
    }
	
	function runtime(element,data,url){
		table.render({
			elem: element,
			url:url,
			method:'POST',
			where: {startTime: startTime,endTime:endTime,preIds:preIds,cityId:searchCity},
			cellMinWidth: 240, //全局定义常规单元格的最小宽度，layui 2.2.1 新增
			cols: [data]
		});       
    }
	
	function runtimeRate(element,data,url){
		table.render({
			elem: element,
			url:url,
			method:'POST',
			where: {startTime: startTime,endTime:endTime,preIds:preIds,cityId:searchCity},
			cellMinWidth: 240, //全局定义常规单元格的最小宽度，layui 2.2.1 新增
			cols: [data]
		});       
    }
	
	function rdl(element,data,url){
		table.render({
			elem: element,
			url:url,
			method:'POST',
			where: {startTime: startTime,endTime:endTime,preIds:preIds,cityId:searchCity},
			cellMinWidth: 240, //全局定义常规单元格的最小宽度，layui 2.2.1 新增
			cols: [data]
		});       
    }
	
	function jtsc(element,data,url){
		table.render({
			elem: element,
			url:url,
			method:'POST',
			where: {startTime: startTime,endTime:endTime,preIds:preIds,cityId:searchCity},
			cellMinWidth: 240, //全局定义常规单元格的最小宽度，layui 2.2.1 新增
			cols: [data]
		});       
    }
	
	function averagePrice(element,data,url){
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