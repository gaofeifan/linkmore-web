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
var baseUrl="/admin/biz/prefecture_strategy/";
layui.use(['layer','msg','form', 'common','validate','datatable','laydate','element'], function() {
	var validate = layui.validate; 
	var layer = layui.layer;
	var $ = layui.jquery; 
	var form = layui.form;
	var laydate = layui.laydate;
	var element = layui.element;
	var addServerParams = function(data){
		var searchName = $('#search-name').val();
		var searchType = $('#search-type').val();
		var filters = new Array();
		var filter = null;
		if(searchName!=''){
			filter = new Object();
			filter.property = 'name';
			filter.value = '%'+searchName +'%';
			filters.push(filter);
		}

		if(filters.length>0){
			data.push({name:'filterJson',value:JSON.stringify({filters:filters})});
		}
	};
	var dynamic_line_div='';
	var pageData1=layui.sessionData('prefecture_strategy_add').pageData1;
	//初使化分组策略下拉框
	var initStrategyGroup=function(){
		layui.common.ajax({
			url:'/admin/biz/strategy/group/find_list',
			//contentType:'application/json; charset=utf-8',
			data:{prefectureId:pageData1.prefectureId},
			success:function(data){
				if(data!=null){
					$("#strategyGroup").empty();
					for(var i=0;i<data.length;i++){
						$("#strategyGroup").append("<option value='"+data[i].id+"'>"+data[i].name+"</option>");
					}
					form.render('select');
					initStrategyDate();
				}
			},error:function(){
				
			}
		});
	}();
	
	var arrayStrategyDate=null;
	//初使化分期策略下拉框
	var initStrategyDate=function(){
		
		layui.common.ajax({
			url:'/admin/biz/strategy/date/find_list',
			//contentType:'application/json; charset=utf-8',
			success:function(data){
				if(data!=null){
					arrayStrategyDate=data;
					$("#strategyDate").empty();
					for(var i=0;i<data.length;i++){
						$("#strategyDate").append("<option value='"+data[i].id+"'>"+data[i].name+"</option>");
					}
					form.render('select');
					//form.render();
					initStrategyFee();
				}
			},error:function(){
				
			}
		});
	};
	
	//初使化计费策略下拉框
	var initStrategyFee=function(){
		layui.common.ajax({
			url:baseUrl+'strategy_fee/find_list',
			contentType:'application/json; charset=utf-8',
			success:function(data){
				if(data!=null){
					$("#strategyFee").empty();
					for(var i=0;i<data.length;i++){
						$("#strategyFee").append("<option value='"+data[i].parkCode+"'>"+data[i].parkName+"</option>");
					}
					form.render('select');
					//form.render();
					dynamic_line_div=$("#dynamic_div").html();
					$("#close_div").remove();
					//init();
				}
			},error:function(){
				
			}
		});
	};

	
	//添加一行按钮
	$("#add-line-button").unbind("click").bind("click",function(){
		$(this).parent().parent().find("#dynamic_div").append(dynamic_line_div);
		form.render();
		$(".delete_item").click(function(){
			$(this).parent().remove();
		});
		$(".delete_p").click(function(){
			$(this).parent().parent().remove();
		});
	});
	//返回按钮
	$('#back-button').bind('click',function(){
		history.back(-1);
	});
	
	//获取分期类型，1按日期 2按周
	var getDateType=function(strategyDateId){
		for (var i=0;i<arrayStrategyDate.length;i++){
			if(arrayStrategyDate[i].id==strategyDateId){
				return arrayStrategyDate[i].datetype;
			}
		}
		return null;
	}
	//获取指定id的分期记录
	var getStrategyDate=function(strategyDateId){
		for (var i=0;i<arrayStrategyDate.length;i++){
			if(arrayStrategyDate[i].id==strategyDateId){
				return arrayStrategyDate[i];
			}
		}
		return null;
	}
	
	var getDateDiff= function (startDate,endDate){  
		/*
	    var startTime = new Date(Date.parse(startDate.replace(/-/g,   "/"))).getTime();     
	    var endTime = new Date(Date.parse(endDate.replace(/-/g,   "/"))).getTime();
	    
	    var dates = (endTime-startTime)/(1000*60*60*24);
	    */
	    var dates = (endDate-startDate)/(1000*60*60*24);
	    return  dates;
	}
	
	//提交
	$('#submit-button').bind('click',function(){
		
		var len=$('.strategyDate').length;
		var datetype=getDateType($(".strategyDate").eq(0).val());
		
		if($('.strategyGroup').val()==null){
			layui.msg.error('【车区分组】不能为空');
			return false;
		}
		
		for(var i=0;i<len;i++){
			if($(".strategyDate").eq(i).val() == null){
				layui.msg.error('【分期策略】不能为空');
				return false;
			}
			if($(".strategyFee").eq(i).val() == null){
				layui.msg.error('【计费策略】不能为空');
				return false;
			}
			for(var j=0;j<len;j++){
				if(i!=j){
					if($(".strategyDate").eq(i).val() == $(".strategyDate").eq(j).val()){
						layui.msg.error('您选择的【分期策略】不能重复');
						return false;
					}
					if(getDateType($(".strategyDate").eq(i).val())!= getDateType($(".strategyDate").eq(j).val()) ){
						layui.msg.error('您选择的【分期策略】中的类型【日期】和【周期】不能同时存在');
						return false;
					}
					if(datetype==2){
						if(  (getDateDiff(getStrategyDate($(".strategyDate").eq(i).val()).startDate,getStrategyDate($(".strategyDate").eq(j).val()).startDate)<=0 
								&& getDateDiff(getStrategyDate($(".strategyDate").eq(i).val()).startDate,getStrategyDate($(".strategyDate").eq(j).val()).stopDate )>=0 )
							|| 	(getDateDiff(getStrategyDate($(".strategyDate").eq(i).val()).stopDate,getStrategyDate($(".strategyDate").eq(j).val()).startDate)<=0 
							   && getDateDiff(getStrategyDate($(".strategyDate").eq(i).val()).stopDate,getStrategyDate($(".strategyDate").eq(j).val()).stopDate)>=0 )
						){
							layui.msg.error('您所选择【分期策略】中日期段有交叉，请重新选择!');
							return false;
						}
					}
				}
			}
		}

		var strategyGroupArray = new Array();
		for(var i=0;i<len;i++){
			var obj = new Object();
			obj.strategyGroupId=$('.strategyGroup').val();
			obj.strategyDateId=$(".strategyDate").eq(i).val();
			obj.parkCode=$(".strategyFee").eq(i).val();
			strategyGroupArray.push(obj);
		}

		var isError=false;
		if ($(".strategyDate").length>1){
			//console.log(JSON.stringify(data,null,4));
			layui.common.ajax({
				url: baseUrl+"validate/date",
				//contentType:'application/json; charset=utf-8',
				//contentType:'application/x-www-form-urlencoded; charset=utf-8',
				async : false,
				data:{p:JSON.stringify(strategyGroupArray),datetype:getDateType($(".strategyDate").eq(0).val()) },
				success: function(data) {
					if(data!=0){
						layui.msg.error('您所选择【分期策略】中日期段有交叉，请重新选择。');
						isError=true;
					}
				},
			error:function(){}
			});
		}
		if(isError){
			return false;
		}
		//return false;
		pageData1.JsonStrategyGroup=JSON.stringify(strategyGroupArray);
		layui.common.ajax({
			url:baseUrl+'save',
			data:pageData1,
			success:function(res){
				if(res.success){
					layui.msg.success(res.content);
					window.setTimeout(function(){ location.href='list.html'; },2000);
				}else{
					layui.msg.error(res.content);
				}
			} 
		});
	});

});