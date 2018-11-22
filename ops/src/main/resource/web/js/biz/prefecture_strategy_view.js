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
	
	var pageData=layui.sessionData('prefecture_strategy_edit').pageData;
	var time_line_div='';
	var lock_line_div='';

	var initStrategyTime=function(){
		layui.common.ajax({
			url:'/admin/biz/strategy/time/find_list',
			//contentType:'application/json; charset=utf-8',
			success:function(data){
				if(data!=null){
					$("#strategyLockTime").empty();
					for(var i=0;i<data.length;i++){
						$("#strategyLockTime").append("<option value='"+data[i].id+"'>"+data[i].name+"</option>");
					}
					//form.render('select');
					//form.render();
					time_line_div=$("#time_div").html();
					$("#close_time").remove();
					lock_line_div=$("#lock_div").html();
					$("#close_div").remove();
				}
			},error:function(){
				
			}
		});
	}();
	
	var arrayPrefecture=null;
	var initPrefectureId=function(){
		layui.common.ajax({
			url:'/admin/biz/prefecture/selectListByUser',
			//contentType:'application/json; charset=utf-8',
			async:false,
			success:function(data){
				if(data!=null){
					arrayPrefecture=data;
					$("#prefectureId").empty();
					for(var i=0;i<data.length;i++){
						$("#prefectureId").append("<option value='"+data[i].id+"'>"+data[i].name+"</option>");
					}
					//form.render('select');
					//form.render();
					//initStrategyFee();
				}
			},error:function(){
				
			}
		});
	};

	var dynamic_line_div='';
	//初使化分组策略下拉框
	var initStrategyGroup=function(){
		layui.common.ajax({
			url:'/admin/biz/strategy/group/find_list',
			//contentType:'application/json; charset=utf-8',
			success:function(data){
				if(data!=null){
					$("#strategyGroup").empty();
					for(var i=0;i<data.length;i++){
						$("#strategyGroup").append("<option value='"+data[i].id+"'>"+data[i].name+"</option>");
					}
					//form.render('select');
					//form.render();
					//layui.render("#strategyTime");
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
					//form.render('select');
					//form.render();
					initStrategyFee();
/*					dynamic_line_div=$("#dynamic_div").html();
					$("#close_div").remove();
					init();*/
				}
			},error:function(){
				
			}
		});
	};
	
	//初使化计费策略下拉框
	var initStrategyFee=function(){
		layui.common.ajax({
			url:baseUrl+'strategy_fee/find_list',
			//contentType:'application/json; charset=utf-8',
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
					init();
				}
			},error:function(){
				
			}
		});
	};
	
	
	//返回
	$('#back-button').bind('click',function(){
		location.href='list.html';
	});
	
	
	var init=function(){
		
		layui.common.ajax({
			url:baseUrl+'get',
			data:JSON.stringify(pageData.id),
			contentType:'application/json; charset=utf-8',
			success:function(res){
				if(res!=null){
					pageData=res;
					$('#name').val(pageData.name);
					$('#detail').val(pageData.detail);
					
					$('.updateTime').val(new Date(res.updateTime).format("yyyy-MM-dd hh:mm:ss"));
					$('.updateUserName').val(res.updateUserName);
					$('.createTime').val(new Date(res.createTime).format("yyyy-MM-dd hh:mm:ss"));
					$('.createUserName').val(res.createUserName);
					$('.status').val(res.status==1?"关闭":"开启");
					
					initPrefectureId();
					
					for(var i=0;i<arrayPrefecture.length;i++){
						//alert(arrayPrefecture[i].id +" / " + pageData.prefectureId)
						if ( arrayPrefecture[i].id == pageData.prefectureId){
							$('#prefectureName').val(arrayPrefecture[i].name);
							break;
						}
					}
					
					if (pageData.strategyGroup[0]!=null){
						$('#strategyGroup').val(pageData.strategyGroup[0].strategyGroupId);
					}
					
					$.each(pageData.strategyGroup,function(i,val){
						if (i>0){
							$("#dynamic_div").append(dynamic_line_div);
						}
						$(".strategyDate").eq(i).val(val.strategyDateId);
						$(".strategyFee").eq(i).val(val.parkCode);
						
					});
					//form.render('select');

					var lockGroup = new Array();
					var lockGroupObj=new Object();
					
					var len=pageData.lockTime.length;
					for(var i=0;i<len;i++){
						if(i==0|| pageData.lockTime[i].lockStatus!=pageData.lockTime[i-1].lockStatus){
							lockGroupObj=new Object();
							lockGroupObj.lockStatus=pageData.lockTime[i].lockStatus;
							lockGroupObj.strategyLockTime=new Array();
						}
						lockGroupObj.strategyLockTime.push(pageData.lockTime[i].strategyTimeId);
						if(i>=(len-1) || pageData.lockTime[i].lockStatus!=pageData.lockTime[i+1].lockStatus){
							lockGroup.push(lockGroupObj);
						}
					}
					//alert(JSON.stringify(lockGroup));
					//return false;
					$.each(lockGroup,function(i,val){
						if(i>0){
							$('#lock_div').append(lock_line_div);
						}
						$(".lockStatus").eq(i).val(val.lockStatus);
						$.each(val.strategyLockTime,function(j,v){
							if(j>0){
								$(".lock_line_div").eq(i).find("#time_div").append(time_line_div);
							}
							$(".lock_line_div").eq(i).find("#time_div").find(".time_line_div").eq(j).find("#strategyLockTime").val(v);
						});
					});
					//form.render("select");
					//bindClick();
				}
			},error:function(){
				
			}
		});
		form.render("select");
		//alert(pageData1);
		//alert(JSON.stringify(pageData1));
	};


});