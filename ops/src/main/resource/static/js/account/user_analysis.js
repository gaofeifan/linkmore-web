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
		min: '2017-04-01 23:59:59',
		max: new Date().format('yyyy-MM-dd'),
		istoday: false
	});
	laydate.render({
		elem: '#search-end',
		min: '2017-04-01 23:59:59',
		max: new Date().format('yyyy-MM-dd'),
		istoday: false
	}); 
	
	// 城市
	var cityHtml = '';
	layui.common.ajax({
		url:'/admin/account/report_day/city_list',
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
			url:'/admin/account/report_day/pre_list?cityId='+ cityId,
			//data:JSON.stringify(cityId),
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
		
		createUserTable();

		table.reload("userReload", { //此处是上文提到的 初始化标识id
			where: {
				//key: { //该写法上文已经提到
					startTime: startTime,endTime:endTime,preIds:preIds,cityId:searchCity
				//}
			}
		});
		
		createNewUserTable();

		table.reload("newUserReload", { //此处是上文提到的 初始化标识id
			where: {
				//key: { //该写法上文已经提到
					startTime: startTime,endTime:endTime,preIds:preIds,cityId:searchCity
				//}
			}
		});
		
		getHeaderData();
		
	} ;  
	
	 //加载列表的后端 url
    var user_url = '/admin/account/report_day/user_num';
	var new_user_url = '/admin/account/report_day/new_user';

    //对于任意一个 table，按照官方的说法，有三种不同的初始化渲染方式，不多介绍，而这里使用的方式姑且看做第三种：转换静态表格 方式
    //转换静态表格方式，自然首先需要有一个已经存在的表格，然后再通过 js 方式转化为 Layui 表格
    //无论哪种方式的 Layui table 初始化自然需要配置项
    //通过转化的方式初始化 Layui table，配置项部分可以在 源table中，部分在js中，源 table 的源代码上文已经给出，下面给出一个示例的 js 中的配置项
    var tableOptions = {
        url: user_url, //请求地址
        method: 'POST', //方式
        id: 'userReload', //生成 Layui table 的标识 id，必须提供，用于后文刷新操作，笔者该处出过问题
        page: false //是否分页
        //请求后端接口的条件，该处就是条件错误点，按照官方给出的代码示例，原先写成了 where: { key : { type: "all" } }，结果并不是我想的那样，如此写，key 将是后端的一个类作为参数，里面有 type 属性，如果误以为 key 是 Layui 提供的格式，那就大错特错了
        /*response: { //定义后端 json 格式，详细参见官方文档
            statusName: 'Code', //状态字段名称
            statusCode: '200', //状态字段成功值
            msgName: 'Message', //消息字段
            countName: 'Total', //总数字段
            dataName: 'Result' //数据字段
        }*/
    };
	
	var newUserTableOptions = {
        url: new_user_url, //请求地址
        method: 'POST', //方式
        id: 'newUserReload', //生成 Layui table 的标识 id，必须提供，用于后文刷新操作，笔者该处出过问题
        page: false //是否分页
    };

	//表初始化
	var createUserTable = function () {
		table.init('userTable', tableOptions);
	};
	
	var createNewUserTable = function () {
		table.init('newUserTable', newUserTableOptions);
	};
	
	element.on('tab(detail)', function(data){
		location.hash = 'detail='+ $(this).attr("lay-id-tab");
	});


	$('.search_btn').bind('click',function(){
		query();
	});  
	 
    function getHeaderData(){  
	  $.ajax({    
			type:'post',    
			url:'/admin/account/report_day/title',
			data:{startTime: startTime,endTime:endTime,preIds:preIds,cityId:searchCity},
			success:function(data){ 
				pull("#pullTable",data,"/admin/account/report_day/pull");
				average("#averageTable",data,"/admin/account/report_day/stall_average");
			}   
	  });    
    }

	function pull(element,data,url){
		table.render({
			elem: '#pullTable',
			url:'/admin/account/report_day/pull',
			method:'POST',
			where: {startTime: startTime,endTime:endTime,preIds:preIds,cityId:searchCity},
			cellMinWidth: 240, //全局定义常规单元格的最小宽度，layui 2.2.1 新增
			cols: [data]
		});       
    }
	
	function average(element,data,url){
		table.render({
			elem: '#averageTable',
			url:'/admin/account/report_day/stall_average',
			method:'POST',
			where: {startTime: startTime,endTime:endTime,preIds:preIds,cityId:searchCity},
			cellMinWidth: 240, //全局定义常规单元格的最小宽度，layui 2.2.1 新增
			cols: [data]
		});       
    }
	
	
	
	$('#export-button').bind('click',function(){
		var data = new Object();
		
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
		
		data.startTime = startTime;
		data.endTime = endTime;
		data.preIds = preIds;
		data.cityId = searchCity;
		data.time = new Date().getTime();
		var url = '/admin/account/report_day/export';
        layui.common.download({
          url:url,
          data: data
        }); 
	});
	
	
	
	
});