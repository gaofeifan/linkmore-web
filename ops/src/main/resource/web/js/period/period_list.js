
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
    	param.url = 'edit_period.html';
    	param.title = '编辑信息'; 
    	var valid = new Object();
    	valid.id = "temp-edit-form";
    	param.width = 800;
    	valid.rules = {
    			periodName:{
        			rangelength:[1,32] ,
        			required: true,
        		},beginTime:{
    		 		required: true,
    		 		custom: function (value, elemen){
    					var a = /^(20|21|22|23|[0-1]\d):[0-5]\d$/;
    					return a.test(value.value);
    				}
    		 	},endTime:{
    		 		required: true,
    		 		custom: function (value, elemen){
    					var a = /^(20|21|22|23|[0-1]\d):[0-5]\d$/;
    					return a.test(value.value);
    				}
    		 	},chargeFee:{
    		 		required: true
    		 	}
        	};
        	valid.messages = {
        		periodName:{
        			rangelength:'名称长度应在[1,32]内', 
        			required: '请填写时段名称'
        		},beginTime:{
        			custom:'正确的开始时间如[00:00]',
        			required: '请填写开始时间'
        		},endTime:{
        			custom:'正确的结束时间如[23:59]',
        			required: '请填写结束时间'
        		},chargeFee:{
    		 		required: '请填写计时金额'
    		 	}
        	};
    	param.validate = valid;
    	param.init = editInit;
    	layui.common.modal(param);
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
    			periodName:{
        			rangelength:[1,32] ,
        			required: true,
        		},beginTime:{
    		 		required: true,
    		 		custom: function (value, elemen){
    					var a = /^(20|21|22|23|[0-1]\d):[0-5]\d$/;
    					return a.test(value.value);
    				}
    		 	},endTime:{
    		 		required: true,
    		 		custom: function (value, elemen){
    					var a = /^(20|21|22|23|[0-1]\d):[0-5]\d$/;
    					return a.test(value.value);
    				}
    		 	},chargeFee:{
    		 		required: true
    		 	}
        	};
        	valid.messages = {
        		periodName:{
        			rangelength:'名称长度应在[1,32]内', 
        			required: '请填写时段名称'
        		},beginTime:{
        			custom:'正确的开始时间如[00:00]',
        			required: '请填写开始时间如[00:00]'
        		},endTime:{
        			custom:'正确的结束时间如[23:59]',
        			required: '请填写结束时间如[23:59]'
        		},chargeFee:{
    		 		required: '请填写计时金额'
    		 	}
        	};
    	param.validate = valid;
    	param.width = 800;
    	param.init = addInit;
    	layui.common.modal(param);  
	})
	
});
