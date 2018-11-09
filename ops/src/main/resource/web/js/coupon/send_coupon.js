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
layui.use(['element','layer','msg','form', 'common','validate','datatable','laydate'], function() {
	var validate = layui.validate; 
	var layer = layui.layer;  
	var $ = layui.jquery; 
	var form = layui.form;
	var laydate = layui.laydate;
	var element = layui.element;
	
	function getUrlParam(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
        var r = window.location.search.substr(1).match(reg);  //匹配目标参数
        if (r != null) return unescape(r[2]);
        return null; //返回参数值
    }

    var tempId = getUrlParam("tempId");
    var type = getUrlParam("type");
	
    var index =0;
	//一些事件监听
	element.on('tab(send_coupon_tab)', function(data){
		index = data.index;
		//console.log(data.index);
    });
    var dataf = function dateformat(date) {
        return date ? (new Date(date)).format("yyyy-MM-dd hh:mm:ss") : "";
    }
    
    $(document).on('click','#add-user',function(){
   	 var html = '<div class="layui-form-item" ><label class="layui-form-label">目标用户</label>'+
		'<div class="layui-input-inline"><input type="text" name=""phone"" placeholder="请输入用户手机号" class="layui-input phone">'+
		'</div>';
		html += '<div><a style="javascript:void(0);" class="delete_cycle">删除<a></div></div>';
   	$("#add-target-user").append(html);
   	$(".delete_cycle").click(function(){
			$(this).parent().parent().remove();
		});
    });
    var conditionHtml='';
    layui.common.ajax({
		url:'/admin/coupon_template_condition/condition_list',
		data:JSON.stringify(tempId),
		contentType:'application/json; charset=utf-8',
		async:false,
		success:function(list){
			$.each(list,function(index,condition){
				conditionHtml += '<option value="'+condition.id+'">';
				conditionHtml += condition.name;
				conditionHtml += '</option>';
			});
			$('#temp-send-form select[name=conditionId]').html(conditionHtml);
			form.render('select');
		},error:function(){
		}
	});
    
    laydate.render({
	    elem: '#taskTimeStr',
	    type: 'datetime',
	    min: new Date().format('yyyy-MM-dd hh:mm:ss'),
		istoday: false
	});
    
    
    
    form.on('select(type)', function(data) {
		var sendType = data.value;
		if(sendType==0){
			$("#task-time-id").css("display","none");
			$("#status").val(1);
		}else{
			$("#task-time-id").css("display","block");
			$("#status").val(0);
		}
    });
    
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
					}else{
						layui.msg.error(res.content);
					} 
				} 
			}); 
        });
	};
	
    $('#import-button').bind('click',function(){
    	var param = new Object();
    	param.url = 'add_excel.html';
    	param.title = '导入用户';  
    	param.width = 600;
    	param.init = addFileInit;
    	layui.common.modal(param);  
    });
    
    
    $('#send-button').bind('click',function(){
    	var phoneJson ='';
    	if(index == 0){
    		var len = $(".phone").length;
    		for(var i=0;i<len;i++){
    			var phone = $(".phone").eq(i).val();
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
    	}else if(index == 1){
    		phoneJson = $("#phoneSet").val();
    		if(phoneJson.length == 0){
				layui.msg.error("请导入用户手机号");
				return false;
			}
    	}
		
		var sendType = $('#temp-send-form select[name=type]').val();
		if(sendType==1){
			if($("#taskTimeStr").val()==''){
				layui.msg.error("请填写定时时间")
                return false;
			}
		}
		
		var conditionId = $('#temp-send-form select[name=conditionId]').val();
		if(conditionId == null){
			layui.msg.error('请维护发放条件!');
			return false;
		}
		
		var phoneArray = new Array();
		for(var i=0;i<len;i++){
			var phone = $(".phone").eq(i).val();
			var phoneObject = new Object();
			phoneObject.phone = phone;
			phoneArray.push(phoneObject);
			phoneJson += phone + ",";
		}
		//$("#phoneJson").val(JSON.stringify(phoneArray));
		$("#phoneJson").val(phoneJson);
		$("#templateId").val(tempId);

		layui.msg.confirm('发放后，停车券将发放到用户账户，请谨慎选择。',function(){
			layui.common.ajax({
				url:'/admin/coupon_send_record/save',
				data:$('#temp-send-form').serialize(),
				success:function(res){
					if(res.success){
						layui.msg.success(res.content);
						if(type == 0){
							window.location.href="list.html";
						}else{
							window.location.href="pull_list.html";
						}
						layui.layer.close(lindex);
						window.setTimeout(query,1000);
					}else{
						layui.msg.error(res.content);
					}
				} 
			});
		});
	});
    
    function isPhoneNo(phone){
    	var pattern = /^1[3456789]\d{9}$/;
        return pattern.test(phone);
    }
});