
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
	
	var editEnterpriseNumberHtml = new Array();
	layui.common.ajax({
		url:'/admin/biz/enterprise_deal/listByEnterpriseId',
		data:{time:new Date().getTime()}, 
		async:false,
		success:function(list){
			$.each(list,function(index,enterpriseDeal){
				var obj = new Object();
				obj.serialNumber = enterpriseDeal.serialNumber;
				obj.isCreate = enterpriseDeal.isCreate
				obj.enterpriseId = enterpriseDeal.enterpriseId;
				editEnterpriseNumberHtml.push(obj);
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
	// 数据回显
    var operation_log = function showData(logId,callback){
    	layui.common.ajax({
			url:'/admin/coupon_enterprise/detail',
			data:JSON.stringify(logId),
			contentType:'application/json; charset=utf-8',
			success:function(res){
				if(res!=null){
					callback(res);
				}else{
					layui.msg.error("数据不存在");
				}
			},error:function(){layui.msg.error("网络异常");}
		});
    }
	
    var dataf = function dateformat(date) {
        return date ? (new Date(date)).format("yyyy-MM-dd hh:mm:ss") : "";
    }
    
	var tempId = null;
	 var detailInit = function(validate,lindex){
	    	operation_log(tempId,function(data){
	    		var object = data;
	    		layui.common.set({
	    			id:'temp-detail-form',
	    			data:object
	    		});
	    		$("#discount").html(object.discount);
	    		if(object.validType==1){
	    			$('#valid-day-label').show();
	    			$('#valid-day-div').show();
	    		}else{
	    			$('#valid-day-label').hide();
	    			$('#valid-day-div').hide();
	    		}
	    		
	    		if(object.type == 0){
	    			$('#temp-detail-form input[name=type]').val("立减劵");
	    		}else if(object.type == 1){
	    			$('#temp-detail-form input[name=type]').val("满减券");
	    		}else if(object.type == 2){
	    			$('#temp-detail-form input[name=type]').val("折扣券");
	    		}else if(object.type == 3){
	    			$('#temp-detail-form input[name=type]').val("混合券");
	    		}
	    		$('#temp-detail-form input[name=timeMarket]').val(dataf(object.createTime));
	    		$('#temp-detail-form input[name=validity]').val(dataf(object.expiryTime));
	    		form.render('select');
	    	});
	    	$('#temp-cancel-detail-button').bind('click',function(){
	    		layui.layer.close(lindex);
	    	});
	    }
	
	
	function openTemplate() {
		var id = $(this).attr('data-open-id');
		layui.msg.confirm('您确定要启用',function(){
			layui.common.ajax({
				url:'/admin/coupon_enterprise/start',
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
    	param.url = 'edit_period.html';
    	param.title = '编辑信息'; 
    	var valid = new Object();
    	valid.id = "temp-edit-form";
    	param.width = 800;
    	valid.rules = {
    			name:{
        			rangelength:[1,32] ,
        			required: true
        		},
        		remark:{
        			rangelength:[1,32] ,
        			required: true
        		},
        		totalQuantity:{ 
        			digits: true,
        			required: true,
        			max: 100000
        		},
        		validDay:{ 
        			digits:true,
        			min:1
        		},
        		faceAmount:{ 
        			decimal:true,
        			max: 100
        		},
        		conditionAmount:{ 
        			decimal:true,
        			max: 100
        		},
        		mj_faceAmount:{ 
        			decimal:true,
        			max: 100
        		},
        		item_discount:{ 
        			digits:true,
        			max: 99
        		},
        		zk_faceAmount:{
        			decimal:true,
        			max: 20
        		},
        		quantity:{ 
        			digits:true,
        			max: 10,
        			
        		},
        		couponValidDay:{ 
        			digits:true,
        			max: 30
        		}
        	};
        	valid.messages = {
    			name:{
        			rangelength:'停车券套餐名称长度应在[1,32]内', 
        			required:'请填写停车券套餐名称'
        		},
    			remark:{
    				rangelength:'备注长度应在[1,32]内', 
    				required:'请填写备注内容'
        		},
        		totalQuantity:{ 
        			digits:'投放总量请输入整数',
        			required: '请填写投放总量',
        			max:'请输入小于等于100000的自然数'
        		},
        		validDay:{ 
        			digits:'有效期天数请输入整数',
        			min:'有效期天数最小为1天'
        		},
        		faceAmount:{ 
        			decimal:"请输入1位小数",
        			max:'停车券金额请输入小于等于100的自然数'
        		},
        		conditionAmount:{
        			decimal:"请输入1位小数",
        			max:'满足金额请输入小于等于100的自然数'
        		},
        		mj_faceAmount:{
        			decimal:"请输入1位小数",
        			max:'减免金额请输入小于等于100的自然数'
        		},
        		item_discount:{ 
        			digits:'折扣率请输入整数',
        			max:'折扣率请输入小于等于99的自然数'
        		},
        		zk_faceAmount:{
        			decimal:"请输入1位小数",
        			max:'请输入20之内的自然数'
        		},
        		quantity:{
        			digits:'数量请输入整数',
        			max:'数量请输入小于等于10的自然数'
        		},
        		couponValidDay:{
        			digits:'有效期请输入整数',
        			max:'有效期请输入小于等于30的自然数'
        		}
    	}; 
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
				url:'/admin/biz/period/delete-period',
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
		url:'/admin/biz/period/period-list', 
		key:'id',
		columns:[
			{ sTitle: 'ID',   mData: 'id',bVisible:false},
			{ sTitle: '时段名称',   mData: 'periodName'},
			{ sTitle: '开始时间',   mData: 'beginTime'},
			{ sTitle: '结束时间',   mData: 'endTime'},
			{
				sTitle: '封顶费用(单位：元)',
	          	mData: 'limitFee' ,
	          	mRender:function(mData,type,full){ 
	          		var html = '无封顶';
	          		if(full.limitFee != null && full.limitFee > 0){
	          			html = full.limitFee;
	          		}
	          		return html;
	          	}
	        },
			{
				sTitle: '计时单位',
	          	mRender:function(mData,type,full){ 
	          		var html = full.chargeFee+'元/';
	          		if(full.chargeUnit == 1){
	          			html += '分钟';
	          		}
	          		if(full.chargeUnit == 2){
	          			html += '小时';
	          		}
	          		if(full.chargeUnit == 3){
	          			html += '次';
	          		}
	          		return html;
	          	}
			},
			{ sTitle: '计费单位',  mRender:function(mData,type,full){
				var html = '无设置';
				if(full.chargeHourFree!=null){
					if(full.criticalUnit == 1){// 分钟
						var sum = 60/full.chargeHourFree;
						html = (full.chargeFee/sum)+'元/'+full.chargeHourFree+'分钟';
					}
					if(full.criticalUnit == 2){// 小时
						html = full.chargeFee/sum+'元/'+full.chargeHourFree+'小时';
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
	 $("#chargeId").val(period.chargeId);
	 $("#periodName").val(period.periodName);
	 $("#limitFee").val(period.limitFee);
	 $("#beginTime").val(period.beginTime);
	 $("#endTime").val(period.endTime);
	 $("#chargeFee").val(period.chargeFee);
	 $("#chargeUnit").val(period.chargeUnit);
	 $("#chargeHourFree").val(period.chargeHourFree);
	 form.render('select');
	 $('#temp-add-button').bind('click',function(){
		 if(validate.valid()){
			 console.info($('#temp-edit-form').serialize());
			 layui.common.ajax({
				 url:'/admin/biz/period/update-period',
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
		
		$('#temp-cancel-button').bind('click',function(){
			layui.msg.confirm('取消后，你填写的信息将不会保存，请谨慎选择。',function(){
				layui.layer.close(lindex);
			});
		});
		$('#temp-add-button').bind('click',function(){
        	if(validate.valid()){
        		layui.common.ajax({
        			url:'/admin/biz/period/save-period',
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
    	param.url = 'add_period.html';
    	param.title = '添加信息'; 
    	var valid = new Object();
    	valid.id = "temp-add-form";
    	valid.rules = {
			name:{
    			rangelength:[1,32] ,
    			required: true
    		},faceAmount:{
    			decimal:true,
    			max: 100,
    			required: true
    		},quantity:{
    			digits:true,
    			max: 10,
    			required: true
    		},couponValidDay:{
    			digits:true,
    			max: 1000,
    			required: true
    		},conditionAmount:{
    			decimal:true,
    			max: 100,
    			required: true
    		},mj_faceAmount:{
    			decimal:true,
    			max: 100,
    			required: true
    		},item_discount:{
    			digits:true,
    			max: 99 ,
    			required: true
    		},zk_faceAmount:{
    			decimal:true,
    			max: 20,
    			required: true
    		},validDay:{
    			digits:true,
    			required: true,
    			max: 99
    		}
    	};
    	valid.messages = {
			name:{
    			rangelength:'停车券套餐名称长度应在[1,32]内', 
    			required: '请填写停车券套餐名称',
    			remote:'停车券套餐名称已经存在'
    		},faceAmount:{
    			decimal:"请输入1位小数",
    			max:'停车券金额请输入小于等于100的自然数',
    			required: '请填写优停车券金额'
    		},quantity:{
    			digits:'数量请输入整数',
    			max:'数量请输入小于等于10的自然数',
    			required: '请填写数量'
    		},couponValidDay:{
    			digits:'有效期请输入整数',
    			max:'有效期请输入小于等于1000自然数', 
    			required: '请填写有效期'
    		},conditionAmount:{
    			decimal:"请输入1位小数",
    			max:'满足金额请输入小于等于100的自然数', 
    			required: '请填写满足金额'
    		},mj_faceAmount:{
    			decimal:"请输入1位小数",
    			max:'减免金额请输入小于等于100的自然数', 
    			required: '请填写减免金额'
    		},item_discount:{
    			digits:'折扣率请输入整数',
    			max:'折扣率请输入小于等于99的自然数', 
    			required: '请填写折扣率'
    		},zk_faceAmount:{
    			decimal:"请输入1位小数",
    			max:'请输入20之内的自然数', 
    			required: '请填写折扣上限'
    		},validDay:{
				rangelength:'有效周期数值应在[1,32]内', 
				required:'请填写有效周期数值'
    		}
    	}; 
    	param.validate = valid;
    	param.width = 800;
    	param.init = addInit;
    	layui.common.modal(param);  
	})
	
});
