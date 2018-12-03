
layui.config({
	base: '/web/js/lib/'
}).extend({ 
	msg:'msg',
	common:'common', 
	datatable:'datatable' 
});
Date.prototype.format =function(format){
    var o = {
	    "M+" : this.getMonth()+1, // month
		"d+" : this.getDate(),    // day
		"h+" : this.getHours(),   // hour
		"m+" : this.getMinutes(), // minute
		"s+" : this.getSeconds(), // second
		"q+" : Math.floor((this.getMonth()+3)/3),  // quarter
		"S" : this.getMilliseconds() // millisecond
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
    form.render();
	var datatable = layui.datatable;
	
	function getUrlParam(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象
        var r = window.location.search.substr(1).match(reg);  // 匹配目标参数
        if (r != null) return unescape(r[2]);
        return null; // 返回参数值
    }
	var addServerParams = function(data){
		var charge_id = getUrlParam("id");
		var filters = new Array();
		var filter = null; 
		
		if(charge_id != null){
			filter = new Object();
			filter.property = 'chargeId';
			filter.value = charge_id;
			filters.push(filter);
		}
		
		
		// 默认类型 企业优惠劵
		type = new Object();
		type.property = 'type';
		type.value = '1';
		filters.push(type);
		// 查询商家自定义套餐
		releaseMethod = new Object();
		releaseMethod.property = 'releaseMethod';
		releaseMethod.value = '1';
		filters.push(releaseMethod);
		if(filters.length>0){
			data.push({name:'filterJson',value:JSON.stringify({filters:filters})});
		}
	};
	
	var draw = function(settings, json){
		$(".operation-delete").unbind('click').bind('click',deleteTemplate);
		$(".operation-edit").unbind('click').bind('click',editTemplate);
	};
	
	// 查询企业
	var enterpriseHtml = '';
	var enterpriseList = null;
	var enterpriseMap = layui.common.map();
	layui.common.ajax({
		url:'/admin/biz/enterprise/selectAll',
		data:{time:new Date().getTime()}, 
		async:false,
		success:function(list){
			enterpriseList = list;
			enterpriseHtml = '<option value="">选择企业</option>';
			$.each(list,function(index,enterprise){
				enterpriseMap.put(enterprise.id,enterprise.name);
				enterpriseHtml += '<option value="'+enterprise.id+'">';
				enterpriseHtml += enterprise.name;
				enterpriseHtml += '</option>';
			});
		},error:function(){
			
		}
	});
	
	var enterpriseNumberHtml = '';
	var enterpriseNumberList = null;
	layui.common.ajax({
		url:'/admin/coupon_enterprise/selectByEnterpriseId',
		data:{time:new Date().getTime()}, 
		async:false,
		success:function(list){
			enterpriseNumberList = list;
			enterpriseNumberHtml = '<option value="">请选择合同</option>';
			$.each(enterpriseNumberList,function(index,enterpriseDeal){
				enterpriseNumberHtml += '<option value="'+enterpriseDeal.enterpriseDealNumber+'">';
				enterpriseNumberHtml += enterpriseDeal.enterpriseDealNumber;
				enterpriseNumberHtml += '</option>';
			});
		},error:function(){
			
		}
	});
	
    var dataf = function dateformat(date) {
        return date ? (new Date(date)).format("yyyy-MM-dd hh:mm:ss") : "";
    }
    
	var editId = null;
	function editTemplate(){
		editId = $(this).attr('data-edit-id');
		
		$.each($("input[type='checkbox']"),function(index,item){
			$(this).prop("checked",false);
			$(this).parent().parent().parent().removeClass("odd active");
			$(this).parent().parent().parent().addClass("odd");
			if(item.value == editId){
				$(this).prop("checked",true);
				console.log($(this).parent().parent().parent().addClass("odd active"));
			}
		});
		
    	var param = new Object();
    	param.url = 'edit_hour_period.html';
    	param.title = '编辑信息'; 
    	var valid = new Object();
    	valid.id = "temp-edit-form";
    	valid.rules = {
    		firstHourPrice:{
        			required: true,
        		}
        	};
        	valid.messages = {
        		firstHourPrice:{
        			required: '请填写首小时金额'
        		}
        	};
    	param.width = 800;
    	param.validate = valid;
    	param.init = editInit;
    	layui.common.modal(param);
	}
	
	function stopTemplate() {
		var id = $(this).attr('data-stop-id');
		layui.msg.confirm('您确定要暂停',function(){
			layui.common.ajax({
				url:'/admin/coupon_enterprise/stop',
				data:JSON.stringify(id),
				contentType:'application/json; charset=utf-8',
				success:function(res){
					if(res.success){  
						layui.msg.success(res.content);
						window.setTimeout(query,1000);
					}else{
						layui.msg.error(res.content);
					}
					
				},error:function(){
					layui.msg.error("网络异常");
				}
			});
		}); 
    }
	
	function deleteTemplate() {
		var id = $(this).attr('delete-detail-id');
		var ids = new Array();
		ids.push(id);
		layui.msg.confirm('您确定要删除',function(){
			layui.common.ajax({
				url:'/admin/biz/period/delete-hour-period',
				data:JSON.stringify(ids),
				contentType:'application/json; charset=utf-8',
				success:function(res){
					if(res.success){  
						layui.msg.success(res.content);
						window.setTimeout(query,1000);
					}else{
						layui.msg.error(res.content);
					}
					
				},error:function(){
					
				}
			});
		}); 
    }
	
	var datatable = layui.datatable.init({
		id:'temp-table',
		url:'/admin/biz/period/period-hour-list',
		key:'id',
		columns:[
			{ sTitle: 'ID',   mData: 'id',bVisible:false},
			{ sTitle: '首小时金额',   mData: 'firstHourPrice'},
			{
				sTitle: '计时单位',
	          	mRender:function(mData,type,full){ 
	          		var html = '无设置';
	          		if(full.firstPeriodPrice !=null && full.firstPeriodPrice > 0){
	          			html = full.firstPeriodPrice+'元/';
		          		if(full.firstPeriodUnit == 1){
		          			html += full.firstPeriodTime+'分钟';
		          		}
		          		if(full.firstPeriodUnit == 2){
		          			html += full.firstPeriodTime+'小时';
		          		}
	          		}
	          		return html;
	          	}
			},
			{
				sTitle: '操作',
	          	mRender:function(mData,type,full){
	          		var html = '<a class="operation-edit" data-edit-id="'+full.id+'" href="javascript:void(0);">修改</a>&nbsp;&nbsp;&nbsp;&nbsp;' + 
	          		'<a class="operation-delete" delete-detail-id="'+full.id+'" href="javascript:void(0);">删除</a>&nbsp;&nbsp;&nbsp;&nbsp;';
	          		return html;
		          	}
			}
		],
		orderIndex:1,
		orderType:'desc',
		draw:draw,
		filter:addServerParams
	});  
	
	var query =  function(){
		datatable.reload();
		
	} ; 
	
	$('.search_btn').bind('click',function(){
		query();
	});
	
	var editInit = function(validate,lindex){
		layui.use('form', function(){
	        var form = layui.form; 
	        form.render();
	 }); 
		
	var list = datatable.selected();  
	 var period = list[0];
	 console.info(period);
	 
	 $("#id").val(period.id);
	 $("#firstHourPrice").val(period.firstHourPrice);
	 $("#firstPeriodPrice").val(period.firstPeriodPrice);
	 $("#firstPeriodTime").val(period.firstPeriodTime);
	 $('#temp-add-button').bind('click',function(){
		 if(validate.valid()){
			 console.info($('#temp-edit-form').serialize());
			 layui.common.ajax({
				 url:'/admin/biz/period/update-hour-period',
    			data:$('#temp-edit-form').serialize(),
				 success:function(res){
					 if(res.success){
						 layui.layer.close(lindex);
						 layui.msg.success(res.content);
						 window.setTimeout(query,1000);
					 }
				 } 
			 });
			 
		 }
        });
	
	$('#temp-cancel-button').bind('click',function(){
		layui.msg.confirm('取消后，你填写的信息将不会保存，请谨慎选择。',function(){
			layui.layer.close(lindex);
		});
	});
	}
	
	var addInit = function(validate,lindex){
		
		layui.use('form', function(){
	        var form = layui.form; 
	        form.render();
	 }); 
		
		var enterpriseNumberHtml = '';
		var charge_id = getUrlParam("id");
		$("#chargeId").val(charge_id);
		var parkName = getUrlParam("parkName");
		$("#parkName").val(parkName);
		
		$('#temp-cancel-button').bind('click',function(){
			layui.msg.confirm('取消后，你填写的信息将不会保存，请谨慎选择。',function(){
				layui.layer.close(lindex);
			});
		});
		$('#temp-add-button').bind('click',function(){
        	if(validate.valid()){
        		layui.common.ajax({
        			url:'/admin/biz/period/save-hour-period',
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
        });
	}
	
	$('#back_button').bind('click',function(){
		location.href = 'list.html'
	});
	
	$('#add-button').bind('click',function(){
    	var param = new Object();
    	param.url = 'add_hour_period.html';
    	param.title = '添加信息'; 
    	var valid = new Object();
    	valid.id = "temp-add-form";
    	valid.rules = {
		firstHourPrice:{
    			required: true,
    		}
    	};
    	valid.messages = {
    		firstHourPrice:{
    			required: '请填写首小时金额'
    		}
    	}; 
    	param.validate = valid;
    	param.width = 800;
    	param.init = addInit;
    	layui.common.modal(param);  
	})
	
});
