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
layui.use(['element','layer','msg','form', 'common','validate','datatable','laydate'], function() {
	var validate = layui.validate; 
	var layer = layui.layer;  
	var $ = layui.jquery; 
	var form = layui.form;
	 var element = layui.element;
	 var index =0;
		//一些事件监听
		element.on('tab(send_coupon_tab)', function(data){
			index = data.index;
			console.log(data.index);
	    });
	  function getUrlParam(name) {
	        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
	        var r = window.location.search.substr(1).match(reg);  //匹配目标参数
	        if (r != null) return unescape(r[2]);
	        return null; //返回参数值
	    }

    var tempId = getUrlParam("tempId");
	// 查询停车劵套餐
	var couponHtml = '';
	var enterpriseMap = layui.common.map();
	layui.common.ajax({
		url:'/admin/biz/enterprise/selectAll',
		data:{time:new Date().getTime()}, 
		async:false,
		success:function(list){
			couponHtml = '<option value="">请选择停车劵套餐</option>';
			$.each(list,function(index,enterprise){
				couponHtml += '<option value="'+enterprise.id+'">';
				couponHtml += enterprise.name;
				couponHtml += '</option>';
			});
			$("#coupon").html(couponHtml);
		},error:function(){
			
		}
	});
	
    var dataf = function dateformat(date) {
        return date ? (new Date(date)).format("yyyy-MM-dd hh:mm:ss") : "";
    }
    
   
    
    $(document).on('click','#add-user',function(){
    	 var html = '<div class="layui-form-item" ><label class="layui-form-label">目标用户</label>'+
		'<div class="layui-input-inline"><input type="text" name="phone" placeholder="请输入用户手机号" class="layui-input">'+
		'</div>';
		html += '<div><a style="javascript:void(0);" class="delete_cycle">删除<a></div></div>';
    	$("#add-target-user").append(html);
    	$(".delete_cycle").click(function(){
			$(this).parent().parent().remove();
		});
    });
	
    $(document).on('click','#tab-add-button',function(){
   	 var html = '<div class="layui-form-item" ><label class="layui-form-label">目标用户</label>'+
		'<div class="layui-input-inline"><input type="text" name="phone" placeholder="请输入用户手机号" class="layui-input">'+
		'</div>';
		html += '<div><a style="javascript:void(0);" class="delete_cycle">删除<a></div></div>';
   	$("#add-target-user").append(html);
   	$(".delete_cycle").click(function(){
			$(this).parent().parent().remove();
		});
   });
  /*  
    $('#tab-cancel-button').bind('click',function(){
		layui.msg.confirm('取消后，你填写的信息将不会保存，请谨慎选择。',function(){
			layui.layer.close(lindex);
		});
	});*/
  /*  
    $('#tab-add-button').bind('click',function(){
    	if(validate.valid()){
    		var validType = $('#temp-add-form select[name=validType]').val();
    		var validDay = $('input[name="validDay"]').val();
    		if(validType ==1){
    			if(validDay == ''){
    				layui.msg.tips('请填写有效期天数!');
    				return;
    			}
    		}
    		layui.common.ajax({
    			url:'/admin/coupon_enterprise/save',
    			data:$('#temp-add-form').serialize(),
    			success:function(res){
    				if(res.success){
    					layui.layer.close(lindex);
    					layui.msg.success(res.content);
    					window.setTimeout(query,1000);
    				}
    			} 
    		});
    	}
    });*/
	var query =  function(){
		datatable.reload();
	} ; 
	 $('#send-cancel-button').bind('click',function(){
	    	layui.msg.confirm('取消后，你填写的信息将不会保存，请谨慎选择。',function(){
	    		window.history.go(-1); 
			});
		});
	 
	 
	    var addFileInit = function(validate,lindex){    
			$('#excel-cancel-button').bind('click',function(){
				layui.layer.close(lindex);
			});
			$('#excel-add-button').bind('click',function(){
				var data = new FormData($( "#excel-add-form" )[0]); 
				layui.common.upload({
					url:'/admin/coupon_send_record/import_excel',
					data:data,
					success:function(res){
						if(res.success){   
							layui.layer.close(lindex);
				    		layui.msg.success(res.content);
				    		$("#userCount").val(res.content);
				    		$("#phoneSet").val(res.map.mobileList);
				    		var phoneHtml ='';
				    		$.each(res.map.mobileList, function(i,val){   
				    			phoneHtml+='<strong>'+val+'</strong><br/>'
				    		  }); 
				    		$("#phoneList").html(phoneHtml);
				    		
						}else{
							layui.msg.error(res.content);
						} 
					} 
				}); 
	        });
		};
	  $('#import-button').bind('click',function(){
	    	var param = new Object();
	    	param.url = '../temp/add_excel.html';
	    	param.title = '导入用户';  
	    	param.width = 600;
	    	param.init = addFileInit;
	    	layui.common.modal(param);  
	    });
	  
	    $('#send-button').bind('click',function(){
	    	var phoneArray = new Array();
	    	if($("#phoneSet").val() == null || $("#phoneSet").val() == ''){
		    	var len = $("input[name='phone']").length;
		    	for(var i=0;i<len;i++){
					var phone = $("input[name='phone']").eq(i).val();
					if(phone.length == 0){
						layui.msg.error("请填写用户手机号");
						return false;
					}else {
			            if (isPhoneNo($.trim(phone)) == false) {
			            	layui.msg.error("手机号码不正确")
			                return false;
			            }
			        }
				}
		    	for(var i=0;i<len;i++){
					var phone = $("input[name='phone']").eq(i).val();
					var phoneObject = new Object();
					phoneObject.phone = phone;
					phoneArray.push(phoneObject);
				}
	    	}else{
	    		phoneJson = $("#phoneSet").val();
	    		if(phoneJson.length == 0){
					layui.msg.error("请导入用户手机号");
					return false;
				}
	    		var arr = phoneJson.split(',');
	    		$.each(arr, function(i,val){   
	    			var phoneObject = new Object();
					phoneObject.phone = val;
	    			phoneArray.push(phoneObject);
	    		  });   
	    		
	    	}
			
				
				$("#phoneJson").val(JSON.stringify(phoneArray));
				$("#templateId").val(tempId);
				layui.msg.confirm('确认发送后，停车劵将发放给用户账户，请谨慎选择',function(){
				layui.common.ajax({
					url:'/admin/coupon_send_record/saveBusiness',
					data:$('#temp-send-form').serialize(),
					success:function(res){
						if(res.success){
							layui.msg.success(res.content);
							window.location.href="list.html";
							layui.layer.close(lindex);
							window.setTimeout(query,1000);
						}else{
							if(res.content == 0){
								layui.msg.error("订单金额不足");
							}else if(res.content == 1){
								layui.msg.error("赠送金额不足");
							}else{
								layui.msg.error("操作异常请联系管理员");
							}
						}
					} 
				});
	    	});
		});
	    
   function isPhoneNo(phone){
    	var pattern = /^1[34578]\d{9}$/;
        return pattern.test(phone);
    }
});