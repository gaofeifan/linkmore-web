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

	var time_line_div='';
	var lock_line_div='';
	
	//初使化时段下拉列表
	var initStrategyTime=function(){
		layui.common.ajax({
			url:'/admin/biz/strategy/time/find_list',
			contentType:'application/json; charset=utf-8',
			success:function(data){
				if(data!=null){
					//console.log(JSON.stringify(data,null,4));
					$("#strategyLockTime").empty();
					for(var i=0;i<data.length;i++){
						$("#strategyLockTime").append("<option value='"+data[i].id+"'>"+data[i].name+"</option>");
					}
					form.render('select');
					time_line_div=$("#time_div").html();
					$("#close_time").remove();
					lock_line_div=$("#lock_div").html();
					$("#close_div").remove();
				}
			},error:function(){
				
			}
		});
	}();
	//添加一行时段
	$(".add-line-button").unbind("click").bind("click",function(){
		$(this).parent().parent().find("#time_div").append(time_line_div);
		form.render();
		$(".delete_item").click(function(){
			$(this).parent().remove();
		});
	});
	//添加一行运营状态
	$(".add-lock-button").unbind("click").bind("click",function(){
		$(this).parent().parent().find("#lock_div").append(lock_line_div);

		form.render();
		$(".delete_item").click(function(){
			$(this).parent().remove();
		});
		$(".delete_lock").click(function(){
			$(this).parent().parent().remove();
		});
		
		$(".add-line-button").unbind("click").bind("click",function(){
			$(this).parent().parent().find("#time_div").append(time_line_div);
			form.render();
			$(".delete_item").click(function(){
				$(this).parent().remove();
			});
		});
		
	});	
	//返回
	$('#back-button').bind('click',function(){
		location.href='list.html';
	});
	
	//下一步
	$('#next-button').bind('click',function(){
		var name=$('#name').val();
		var detail=$('#detail').val();
		
		if (name.trim().length<=0 || name.trim().length>10){
			layui.msg.error('策略名称长度应该为【1-10】');
			return false;
		}
		if (detail.trim().length>30){
			layui.msg.error('简介长度应该为【0-30】');
			return false;
		}
		
		var len=$(".lockStatus").length;
		for(var i=0;i<len;i++){
			for(var j=0;j<len;j++){
				if(i!=j){
					if($(".lockStatus").eq(i).val() == $(".lockStatus").eq(j).val()){
						layui.msg.error('【车位锁运营状态】不能重复');
						return false;
					}
				}
			}
		}
		
		len=$(".strategyLockTime").length;
		for(var i=0;i<len;i++){
			for(var j=0;j<len;j++){
				if(i!=j){
					if($(".strategyLockTime").eq(i).val() == $(".strategyLockTime").eq(j).val()){
						layui.msg.error('【运营时段】不能重复');
						return false;
					}
				}
			}
		}
		
		var strategyLockTimeArray = new Array();
		$(".lock_line_div").each(function(){
			var lockStatus=$(this).find(".lockStatus").val();
			$(this).find(".strategyLockTime").each(function(){
				var obj = new Object();
				obj.lockStatus=lockStatus;
				obj.strategyTimeId=$(this).val();
				strategyLockTimeArray.push(obj);
			});
		});

		var isError=false;
		if ($(".lock_line_div").length>1 || $(".strategyLockTime").length>1){
			//console.log(JSON.stringify(data,null,4));
			layui.common.ajax({
				url: baseUrl+"validate/time",
				//contentType:'application/json; charset=utf-8',
				//contentType:'application/x-www-form-urlencoded; charset=utf-8',
				async : false,
				data:{p:JSON.stringify(strategyLockTimeArray)},
				success: function(data) {
					if(data!=0){
						layui.msg.error('您所选择【运营时段】中的时间段有交叉，请重新选择。');
						isError=true;
					}
				},
			error:function(){}
			});
		}
		if(isError){
			return false;
		}

		var pageData1= new Object();
		pageData1.name=name;
		pageData1.detail=detail;
		pageData1.strategyLockTime=strategyLockTimeArray;
		pageData1.JsonLockTime=JSON.stringify(strategyLockTimeArray);
		
		//alert(JSON.stringify(pageData1));
		//return false;
		layui.sessionData('prefecture_strategy_add', { key: 'pageData1' ,value: pageData1 });
		location.href='add2.html';
	});


});