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
	var table = layui.table;
	laydate.render({
		elem: '#search-start',
		type: 'month',
		min: '2017-04-01 23:59:59',
		max: new Date().format('yyyy-MM'),
		istoday: false
	});
	laydate.render({
		elem: '#search-end',
		type: 'month',
		min: '2017-04-01 23:59:59',
		max: new Date().format('yyyy-MM'),
		istoday: false
	}); 
	
	// 城市
	var cityHtml = '';
	layui.common.ajax({
		url:'/admin/account/report_month_export/city_list',
		async:false,
		success:function(list){
			cityHtml = '<option value="-1">请选择</option>';
			cityHtml += '<option value="0">All</option>';
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
		if(preId != -1){
			
			preSelectMap = layui.common.map();
			$.each($(".layui-tab-title li[lay-id]"), function () {
				var preId2 = $(this).attr("lay-id");
				var preName2 = prefectureMap.get(preId2);
				preSelectMap.put(preId2,preName2);
			});
						
			if(preId == 0){
		
				var preIds = prefectureMap['keys'];
				for(var i=0;i<preIds.length;i++){
					var preId3= preIds[i];
					var preName3 = prefectureMap.get(preIds[i]);
					if(preSelectMap.get(preId3)=='' ||  preSelectMap.get(preId3)==undefined ){
						element.tabAdd('demo', {
						   title: preName3
						  ,content: preName3 //支持传入html
						  ,id: preId3
						});
					}
				}
			}else{
				var preName = prefectureMap.get(preId);
				if(preSelectMap.get(preId)=='' || 
					preSelectMap.get(preId)==undefined ){
					element.tabAdd('demo', {
					   title: preName
					  ,content: preName //支持传入html
					  ,id: preId
					});
				}
			}
		}
	});
	
	
	preList(0);
	// 车区
	
	var preHtml = '';
	function preList(cityId){
		prefectureMap = layui.common.map();
		layui.common.ajax({
			url:'/admin/account/report_month_export/pre_list?cityId='+ cityId,
			//data:JSON.stringify(cityId),
			contentType:'application/json; charset=utf-8',
			async:false,
			success:function(list){
				preHtml = '<option value="-1">请选择</option>';
				preHtml += '<option value="0">All</option>';
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
	
	$('#export-button').bind('click',function(){
		var data = new Object();
		
		startTime = $('#search-start').val();
	    endTime = $('#search-end').val();
	    searchCity = $('#search-city').val();
		
		preIds = "";
		$.each($(".layui-tab-title li[lay-id]"), function () {
			preIds = preIds + $(this).attr("lay-id") +",";
		});		
		
		if(preIds == ""){
			layui.msg.error("请选择车区");
			return false;
		}
		
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
		if(time>180){
			layui.msg.error("月份不能超过6个月");
			return false;
		}

		data.startTime = startTime;
		data.endTime = endTime;
		data.preIds = preIds;
		data.cityId = searchCity;
		var url = '/admin/account/report_month_export/export';
        layui.common.download({
          url:url,
          data: data
        }); 
	});
	
});