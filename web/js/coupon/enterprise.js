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
layui.use(['layer','msg','form', 'common','validate','datatable','laydate'], function() {
	var validate = layui.validate; 
	var layer = layui.layer;  
	var $ = layui.jquery; 
	var form = layui.form;
	var addServerParams = function(data){
		var searchName = $('#search-name').val();
		var searchStatus = $('#search-status').val();
		var filters = new Array();
		var filter = null; 
		if(searchStatus!='-1'){
			filter = new Object();
			filter.property = 'status';
			filter.value = searchStatus;
			filters.push(filter);
		}
		if(searchName!=''){
			filter = new Object();
			filter.property = 'name';
			filter.value = '%'+searchName +'%';
			filters.push(filter);
		}  
		filter = new Object();
		filter.property = 'type';
		filter.value = '1';
		filters.push(filter);
		if(filters.length>0){
			data.push({name:'filterJson',value:JSON.stringify({filters:filters})});
		}
	};
	
	var draw = function(settings, json){
		$(".operation-wxma").unbind('click').bind('click',download);
		$(".operation-delete").unbind('click').bind('click',deleteTemplate);
		$(".operation-detail").unbind('click').bind('click',showTempInfo);
		$(".operation-start").unbind('click').bind('click',startTemplate);
		$(".operation-stop").unbind('click').bind('click',stopTemplate);
		$(".operation-open").unbind('click').bind('click',openTemplate); 
		$(".operation-edit").unbind('click').bind('click',editTemplate);
	};
	
	var deleteItemId = new Array();
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
	
	//数据回显
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
	function showTempInfo(){
		tempId = $(this).attr('data-detail-id');
    	var param = new Object();
    	param.url = 'detail.html';
    	param.title = '详情信息'; 
    	var valid = new Object();
    	valid.id = "temp-detail-form";
    	param.width = 800;
    	param.init = detailInit;
    	layui.common.modal(param);
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
	
	
	function startTemplate() {
		var id = $(this).attr('data-start-id');
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
	

	function editTemplate(){
		var id = $(this).attr('data-edit-id');
	
		$.each($("input[type='checkbox']"),function(index,item){
			$(this).prop("checked",false);
			$(this).parent().parent().parent().removeClass("odd active");
			$(this).parent().parent().parent().addClass("odd");
			if(item.value == id){
				$(this).prop("checked",true);
				$(this).parent().parent().parent().addClass("odd active");
			}
		})
		console.log(datatable.selected())
	    	var param = new Object();
	    	param.url = 'edit.html';
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
	function download() {
    	var id = $(this).attr('data-id');
        var url = '/admin/coupon_template/download';
        var data = new Object(); 
        data.id = id;
        layui.common.download({
          url:url,
          data: data
        });
    } 
	function deleteTemplate() {
		var id = $(this).attr('data-delete-id');
		var ids = new Array();
		ids.push(id);
		layui.msg.confirm('您确定要删除',function(){
			layui.common.ajax({
				url:'/admin/coupon_enterprise/delete',
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
		url:'/admin/coupon_enterprise/list', 
		key:'id',
		columns:[
			{ sTitle: 'ID',   mData: 'id',bVisible:false},
			{ sTitle: '合同编号',   mData: 'enterpriseDealNumber'},
			{ sTitle: '停车券名称',   mData: 'name'},
			{
				sTitle: '停车券类型',
	          	mData: 'type' ,
	          	bSortable: true,
	          	mRender:function(mData,type,full){
	          		var html = ''; 
	          		if(full.type==0){
	          			html = '<label style="color:gray;">立减券</label>';
	          		} else if(full.type==1){
	          			html = '<label style="color:gray;">满减券</label>'; 
	          		} else if(full.type==2){
	          			html = '<label style="color:gray;">折扣券</label>'; 
	          		} else if(full.type==3){
	          			html = '<label style="color:gray;">混合券</label>'; 
	          		}
	          		return html;
	          	}
	        },
			{
				sTitle: '投放方式',
	          	mData: 'releaseMethod' ,
	          	bSortable: true,
	          	mRender:function(mData,type,full){
	          		var html = ''; 
	          		if(full.releaseMethod==0){
	          			html = '<label style="color:gray;">固定套餐投放</label>';
	          		} else if(full.releaseMethod==1){
	          			html = '<label style="color:gray;">商家自配套餐投放</label>'; 
	          		}
	          		return html;
	          	}
	        },
	        {
				sTitle: '剩余投放期',
	          	mData: 'residualReleasePeriod' ,
	          	bSortable: true,
	          	mRender:function(mData,type,full){
	          		var	html= null;
	          		if(full.residualReleasePeriod >= 0){
	          			html = '<label style="color:gray;">'+full.residualReleasePeriod+'天</label>';
	          			
	          		}else{
	          			html = '<label style="color:gray;">已过期</label>';
	          		}
	          		return html;
	          	}
	        },
			{
				sTitle: '状态',
	          	mData: 'status' ,
	          	bSortable: true,
	          	mRender:function(mData,type,full){ 
	          		var html = ''; 
	          		if(full.residualReleasePeriod < 0){
	          			return html = '<label style="color:green;">已结束</label>'; 
	          		}
	          		if(full.status==0){
	          			html = '<label style="color:gray;">未开始</label>';
	          		} else if(full.status==1){
	          			html = '<label style="color:green;">运行中</label>'; 
	          		} else if(full.status==2){
	          			html = '<label style="color:green;">暂停中</label>'; 
	          		} else if(full.status==3){
	          			html = '<label style="color:green;">已结束</label>'; 
	          		} 
	          		return html;
	          	}
			},
			{ sTitle: '已发放用户',  mRender:function(mData,type,full){
				if(full.sendQuantity == null || full.sendQuantity == ''){
					return '<a class="operation-wxma" id="find-sent-user" data-id="'+full.id+' "href="user_list.html?tempId='+full.id+'">0位</a>';
				}else{ 
					return '<a class="operation-wxma" id="find-sent-user" data-id="'+full.id+' "href="user_list.html?tempId='+full.id+'">'+full.sendQuantity+'位</a>';
				}
			}
			},
			{
				sTitle: '更新时间',
	          	mData: 'updateTime' ,
	          	bSortable: true,
	          	mRender:function(mData,type,full){
	          		if(full.updateTime != null){
	          			return new Date(mData).format('yyyy-MM-dd hh:mm');
	          		}else{
	          			return new Date(full.createTime).format('yyyy-MM-dd hh:mm');
	          		}
	          	}
			},
			{
				sTitle: '操作',
	          	mRender:function(mData,type,full){
	          		var html = '<a class="operation-detail" data-detail-id="'+full.id+'" href="javascript:void(0);">详情</a>&nbsp;&nbsp;&nbsp;&nbsp;'; 
	          		if(full.status==0){
	          			html += '<a class="operation-start" data-start-id="'+full.id+'" href="javascript:void(0);">开启</a>&nbsp;&nbsp;&nbsp;&nbsp;';
	          			html += '<a class="operation-edit" data-edit-id="'+full.id+'" href="javascript:void(0);">编辑</a>&nbsp;&nbsp;&nbsp;&nbsp;';
	          		} else if(full.status==1){
	          			html += '<a class="operation-wxma" data-id="'+full.id+'" href="javascript:void(0);">下载二维码</a>&nbsp;&nbsp;&nbsp;&nbsp;';
	          			html += '<a class="operation-stop" data-stop-id="'+full.id+'" href="javascript:void(0);">暂停</a>&nbsp;&nbsp;&nbsp;&nbsp;'; 
	          		} else if(full.status==2){
	          			html += '<a class="operation-open" data-open-id="'+full.id+'" href="javascript:void(0);">开启</a>&nbsp;&nbsp;&nbsp;&nbsp;'; 
	          		} else if(full.status==3){
	          			html += '<a class="operation-delete" data-delete-id="'+full.id+'" href="javascript:void(0);">删除</a>&nbsp;&nbsp;&nbsp;&nbsp;'; 
	          		} 
	          		if(full.rollbackFlag == 1){
	          			html += '<a class="operation-rollback" data-rollback-id="'+full.id+'" href="../shop/rollback_list.html?tempId='+full.id+'">回滚记录</a>'; 
	          		}
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
	
	var addCouponTypeInit = function(validate,lindex){
		$('#chose-coupon-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		
		form.on('select(type)', function(data) {
			var type = data.value;
			if(type==0){
				$('#yhqje-id').show();
				$('#mzje-id').hide();
				$('#jmje-id').hide();
				$('#zkv-id').hide();
				$('#zksx-id').hide();
			}else if(type==1){
				$('#yhqje-id').hide();
				$('#mzje-id').show();
				$('#jmje-id').show();
				$('#zkv-id').hide();
				$('#zksx-id').hide();
			}else{
				$('#yhqje-id').hide();
				$('#mzje-id').hide();
				$('#jmje-id').hide();
				$('#zkv-id').show();
				$('#zksx-id').show();
			}
        });
	};
	
	var addInit = function(validate,lindex){
		$('#enterprise-id').html(enterpriseHtml);
		form.render('select');
		
		$('#temp-cancel-button').bind('click',function(){
			layui.msg.confirm('取消后，你填写的信息将不会保存，请谨慎选择。',function(){
				layui.layer.close(lindex);
			});
		});
		$("#add-coupon").unbind("click").bind("click",function(){
			var len = $(".cycle-time").length;
			if(len < 6){
				var html = '<div class="cycle-time" style="display: inline;">'+$("#coupon_items").find(".cycle-time").eq(0).html();
				html += '<div class="layui-form-label"><a style="javascript:void(0);" class="delete_cycle">删除<a></div></div>';
				html = html.replace('<input type="hidden" id="couponItemType" name="couponItemType">','<input type="hidden" id="couponItemType" name="couponItemType" value="'+$("#couponType").val()+'">')
				$("#coupon_items").append(html);
				form.render('select');
				$(".delete_cycle").click(function(){
					$("#add-coupon").show();
					$(this).parent().parent().remove();
				});
			}else{
				$("#add-coupon").hide();
			}
		});
		
		form.on('select(couponType)', function(data) {
			var couponType = data.value;
			$("#couponItemType").val(couponType);
			if(couponType==0){
				$('#lj-id').show();
				$('#mz-id').hide();
				$('#zk-id').hide();
			}else if(couponType==1){
				$('#lj-id').hide();
				$('#mz-id').show();
				$('#zk-id').hide();
			}else{
				$('#lj-id').hide();
				$('#mz-id').hide();
				$('#zk-id').show();
			}
        });
		form.on('select(releaseMethod)', function(data) {
			var releaseMethod = data.value;
			if(releaseMethod == 1){
				$("#source-id").html('<option value="1">凌猫平台优惠</option>');
				form.render('select');
			}
		});
		
		form.on('select(enterpriseId)', function(data){
			var enterpriseNumberHtml = '';
			layui.common.ajax({
				url:'/admin/biz/enterprise_deal/listByEnterpriseId',
				data:{time:new Date().getTime()}, 
				async:false,
				success:function(list){
					$.each(list,function(index,enterpriseDeal){
						if(enterpriseDeal.isCreate == 0 &&
							enterpriseDeal.enterpriseId == $("#enterprise-id").val()){
							enterpriseNumberHtml += '<option value="'+enterpriseDeal.serialNumber+'">';
							enterpriseNumberHtml += enterpriseDeal.serialNumber;
							enterpriseNumberHtml += '</option>';
						}
					});
				},error:function(){
					
				}
			});
			
			$('#enterprise-deal-id').html(enterpriseNumberHtml);
			form.render('select');
		});
		
		
		$('#temp-add-button').bind('click',function(){
        	if(validate.valid()){
        		if($("#enterprise-deal-id").val() == null || $("#enterprise-deal-id").val() == ''){
        			layui.msg.tips('请选择合同');
    				return;
        		}
        		var validDay = $('input[name="validDay"]').val();
        		var discount = new Array();
        		var len = $(".faceAmount").length;
        		if(len == 1){
        			layui.msg.tips('当前套餐内还没有停车券，请增加停车券!');
    				return;
        		}
        		for(var i=1;i<len;i++){
					var couponItemType = $(".cycle-time").eq(i).children("input[name='couponItemType']").val();
        			var faceAmount = $(".faceAmount").eq(i).val();
        			var conditionAmount = $(".conditionAmount").eq(i).val();
        			var mj_faceAmount = $(".mj_faceAmount").eq(i).val();
        			var item_discount = $(".item_discount").eq(i).val();
        			var zk_faceAmount = $(".zk_faceAmount").eq(i).val();
        			var quantity = $(".quantity").eq(i).val();
        			var couponValidDay = $(".couponValidDay").eq(i).val();
        			if(couponItemType == 0){
        				if(faceAmount == ''){
        					layui.msg.tips('请填写停车券金额!');
            				return;
        				}
        			}else if(couponItemType ==1){
        				if(conditionAmount == ''){
        					layui.msg.tips('请填写满足金额!');
            				return;
        				}
        				if(mj_faceAmount == ''){
        					layui.msg.tips('请填写满减金额!');
            				return;
        				}
        			}else{
        				if(item_discount == ''){
        					layui.msg.tips('请填写折扣率!');
            				return;
        				}
        				if(zk_faceAmount == ''){
        					layui.msg.tips('请填写折扣上限!');
            				return;
        				}
        			}
        			if(quantity == ''){
    					layui.msg.tips('请填写数量!');
        				return;
    				}
    				if(couponValidDay == ''){
    					layui.msg.tips('请填写有效期!');
        				return;
    				}else{
						if(parseInt(couponValidDay) > parseInt(validDay)){
							layui.msg.tips('套餐内停车券有效期大于自定义有效天数!');
	        				return;
						}
    				}
        		}
        		
        		for(var i=1;i<len;i++){
        			var obj = new Object();
        			obj.couponItemType = $(".cycle-time").eq(i).children("input[name='couponItemType']").val();
        			$("select[name='source'] option:selected").each(function(index){
        				if(i == index){
        					obj.source = $(this).val();
        				}
        			});
        			obj.faceAmount = $(".faceAmount").eq(i).val();
        			obj.conditionAmount = $(".conditionAmount").eq(i).val();
        			obj.mj_faceAmount = $(".mj_faceAmount").eq(i).val();
        			obj.item_discount = $(".item_discount").eq(i).val();
        			obj.zk_faceAmount = $(".zk_faceAmount").eq(i).val();
        			obj.quantity = $(".quantity").eq(i).val();
        			obj.couponValidDay = $(".couponValidDay").eq(i).val();
        			if(parseFloat(obj.conditionAmount) < parseFloat(obj.mj_faceAmount)){
        				layui.msg.tips('减免金额不得大于满足金额!');
        				return;
        			}
        			discount.push(obj);
        		}
    			$('input[name="discount"]').val(JSON.stringify(discount))
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
        });
	};
	var editInit = function(validate,lindex){
		if(deleteItemId.length >0){
			deleteItemId.splice(0,deleteItemId.length);
		}
		var list = datatable.selected();
		layui.common.set({
			id:'temp-edit-form',
			data:list[0]
		});
		form.render('select');
		$('#enterprise-id').html(enterpriseHtml);
		$('#enterprise-id').val(list[0].enterpriseId); 
		form.render('select');
		var enterpriseNumberHtml = '<option selected="selected" value="'+list[0].enterpriseDealNumber+'">'+list[0].enterpriseDealNumber+'</option>';
		 $.each(editEnterpriseNumberHtml,function(index,enterpriseDeal){
			if(enterpriseDeal.enterpriseId == list[0].enterpriseId && enterpriseDeal.isCreate==0){
				enterpriseNumberHtml += '<option value="'+enterpriseDeal.serialNumber+'">';
				enterpriseNumberHtml += enterpriseDeal.serialNumber;
				enterpriseNumberHtml += '</option>';
			}
		});
		$('#enterprise-deal-id').html(enterpriseNumberHtml);
		form.render('select');
		layui.common.ajax({
			url:'/admin/coupon_enterprise_Item/selectBuDealNumber',
			data:{dealNumber:list[0].enterpriseDealNumber},
			async:true,
			success:function(list){
				$.each(list,function(index,item){
					var html = '<div class="cycle-time" style="display: inline;">'+$("#coupon_items").find(".cycle-time").eq(0).html();
					html += '<div class="layui-form-label"><a style="javascript:void(0);" class="delete_cycle">删除<a></div></div>';
					$("#coupon_items").append(html);
					form.render('select');
					$(".delete_cycle").click(function(){
						$("#add-coupon").show();
						var itemId = $(this).parent().parent().children("input[name='couponItemId']").val();
						if(itemId != ''){
						　if($.inArray(deleteItemId,itemId)==-1) {
							deleteItemId.push(itemId);
						　　}
						}
						$(this).parent().parent().remove();
						
					});
					var cycleListDiv =$(".cycle-time").eq($(".cycle-time").length-1);
					cycleListDiv.children("input[name='couponItemType']").val(item.type);
					cycleListDiv.children("input[name='couponItemId']").val(item.id);
					cycleListDiv.find("select[name='source']").val(item.source);
					form.render('select');
					cycleListDiv.find("input[name='quantity']").val(item.quantity);
					cycleListDiv.find("input[name='couponValidDay']").val(item.validDay);
					if(item.type == 0){
						cycleListDiv.children("div[id='lj-id']").show();
						cycleListDiv.children("div[id='mz-id']").hide();
						cycleListDiv.children("div[id='zk-id']").hide();
						cycleListDiv.find("input[name='faceAmount']").val(item.faceAmount);
					}else if(item.type == 1){
						cycleListDiv.children("div[id='lj-id']").hide();
						cycleListDiv.children("div[id='mz-id']").show();
						cycleListDiv.children("div[id='zk-id']").hide();
						cycleListDiv.find("input[name='conditionAmount']").val(item.conditionAmount);
						cycleListDiv.find("input[name='mj_faceAmount']").val(item.faceAmount);
					}else if(item.type ==2){
						cycleListDiv.children("div[id='lj-id']").hide();
						cycleListDiv.children("div[id='mz-id']").hide();
						cycleListDiv.children("div[id='zk-id']").show();
						cycleListDiv.find("input[name='item_discount']").val(item.discount);
						cycleListDiv.find("input[name='zk_faceAmount']").val(item.faceAmount);
					}
				})
			} 
		});
		$("#add-coupon").unbind("click").bind("click",function(){
			var len = $(".cycle-time").length;
			if(len < 6){
				var html = '<div class="cycle-time" style="display: inline;">'+$("#coupon_items").find(".cycle-time").eq(0).html();
				html += '<div class="layui-form-label"><a style="javascript:void(0);" class="delete_cycle">删除<a></div></div>';
				html = html.replace('<input type="hidden" name="couponItemType">','<input type="hidden" name="couponItemType" value="'+$("select[name='couponType']").val()+'">')
				$("#coupon_items").append(html);
				form.render('select');
				$(".delete_cycle").click(function(){
					$("#add-coupon").show();
					$(this).parent().parent().remove();
				});
			}else{
				$("#add-coupon").hide();
			}
		});
		
		form.on('select(couponType)', function(data) {
			var couponType = data.value;
			$("#couponItemType").val(couponType);
			if(couponType==0){
				$('#lj-id').show();
				$('#mz-id').hide();
				$('#zk-id').hide();
			}else if(couponType==1){
				$('#lj-id').hide();
				$('#mz-id').show();
				$('#zk-id').hide();
			}else{
				$('#lj-id').hide();
				$('#mz-id').hide();
				$('#zk-id').show();
			}
		});
		form.on('select(releaseMethod)', function(data) {
			var releaseMethod = data.value;
			if(releaseMethod == 1){
				$("#source-id").html('<option value="1">凌猫平台优惠</option>');
				form.render('select');
			}
		});
		
		form.on('select(enterpriseId)', function(data){
			var enterpriseNumberHtml = '';
			layui.common.ajax({
				url:'/admin/biz/enterprise_deal/listByEnterpriseId',
				data:{time:new Date().getTime()}, 
				async:false,
				success:function(list){
					$.each(list,function(index,enterpriseDeal){
						if(enterpriseDeal.isCreate == 0 &&
								enterpriseDeal.enterpriseId == $("#enterprise-id").val()){
							enterpriseNumberHtml += '<option value="'+enterpriseDeal.serialNumber+'">';
							enterpriseNumberHtml += enterpriseDeal.serialNumber;
							enterpriseNumberHtml += '</option>';
						}
					});
				},error:function(){
					
				}
			});
			
			$('#enterprise-deal-id').html(enterpriseNumberHtml);
			form.render('select');
		});
		
		$('#temp-cancel-button').bind('click',function(){
			layui.msg.confirm('取消后，你填写的信息将不会保存，请谨慎选择。',function(){
				layui.layer.close(lindex);
			});
		});
		$('#temp-edit-button').bind('click',function(){
			$("#temp-edit-form input[name='deleteItemId']").val(deleteItemId.join(","));
			if(validate.valid()){
				if($("#enterprise-deal-id").val() == null || $("#enterprise-deal-id").val() == ''){
					layui.msg.tips('请选择合同');
					return;
				}
				var validDay = $('input[name="validDay"]').val();
				var discount = new Array();
				var len = $(".faceAmount").length;
				if(len == 1){
					layui.msg.tips('当前套餐内还没有停车券，请增加停车券!');
					return;
				}
				for(var i=1;i<len;i++){
					var couponItemId = $(".cycle-time").eq(i).children("input[name='couponItemId']").val();
					var couponItemType = $(".cycle-time").eq(i).children("input[name='couponItemType']").val();
					var faceAmount = $(".faceAmount").eq(i).val();
					var conditionAmount = $(".conditionAmount").eq(i).val();
					var mj_faceAmount = $(".mj_faceAmount").eq(i).val();
					var item_discount = $(".item_discount").eq(i).val();
					var zk_faceAmount = $(".zk_faceAmount").eq(i).val();
					var quantity = $(".quantity").eq(i).val();
					var couponValidDay = $(".couponValidDay").eq(i).val();
					if(couponItemType == 0){
						if(faceAmount == ''){
							layui.msg.tips('请填写停车券金额!');
							return;
						}
					}else if(couponItemType ==1){
						if(conditionAmount == ''){
							layui.msg.tips('请填写满足金额!');
							return;
						}
						if(mj_faceAmount == ''){
							layui.msg.tips('请填写满减金额!');
							return;
						}
					}else{
						if(item_discount == ''){
							layui.msg.tips('请填写折扣率!');
							return;
						}
						if(zk_faceAmount == ''){
							layui.msg.tips('请填写折扣上限!');
							return;
						}
					}
					if(quantity == ''){
						layui.msg.tips('请填写数量!');
						return;
					}
					if(couponValidDay == ''){
						layui.msg.tips('请填写有效期!');
						return;
					}else{
						if(parseInt(couponValidDay) > parseInt(validDay)){
							layui.msg.tips('套餐内停车券有效期大于自定义有效天数!');
							return;
						}
					}
				}
				
				for(var i=1;i<len;i++){
					var obj = new Object();
					obj.couponItemType = $(".couponItemType").eq(i).val();
					$("select[name='source'] option:selected").each(function(index){
						if(i == index){
							obj.source = $(this).val();
						}
					});
					obj.couponItemId = $(".couponItemId").eq(i).val();
					obj.faceAmount = $(".faceAmount").eq(i).val();
					obj.conditionAmount = $(".conditionAmount").eq(i).val();
					obj.mj_faceAmount = $(".mj_faceAmount").eq(i).val();
					obj.item_discount = $(".item_discount").eq(i).val();
					obj.zk_faceAmount = $(".zk_faceAmount").eq(i).val();
					obj.quantity = $(".quantity").eq(i).val();
					obj.couponValidDay = $(".couponValidDay").eq(i).val();
					obj.couponItemId = $(".cycle-time").eq(i).children("input[name='couponItemId']").val();
					obj.couponItemType = $(".cycle-time").eq(i).children("input[name='couponItemType']").val();
					if(parseFloat(obj.conditionAmount) < parseFloat(obj.mj_faceAmount)){
						layui.msg.tips('减免金额不得大于满足金额!');
						return;
					}
					discount.push(obj);
				}
				$('input[name="discount"]').val(JSON.stringify(discount))
				layui.common.ajax({
					url:'/admin/coupon_enterprise/update',
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
	};
	/*
	$('#enterprise-deal-id').bind('click',function(){
		alert();
		$.each(enterpriseNumberList,function(index,enterpriseDeal){
			var enterpriseId = $("#enterprise-id").val();
			enterpriseNumberHtml = '<option value="'+enterpriseDeal.serialNumber+'">';
			enterpriseNumberHtml += enterpriseDeal.serialNumber;
			enterpriseNumberHtml += '</option>';
			$('#enterprise-deal-id').html(enterpriseNumberHtml);
			form.render('select');
		});
	});
	*/
	$('#add-button').bind('click',function(){
    	var param = new Object();
    	param.url = 'add.html';
    	param.title = '添加信息'; 
    	var valid = new Object();
    	valid.id = "temp-add-form";
    	valid.rules = {
    		name:{
    			rangelength:[1,32] ,
    			required: true
    		},faceAmount:{
    			max: 100,
    			decimal:true,
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
    			max: 1000
    		}
    	};
    	valid.messages = {
			name:{
    			rangelength:'停车券套餐名称长度应在[1,32]内', 
    			required: '请填写停车券套餐名称'
    		},faceAmount:{
    			required: '请填写优停车券金额',
    			decimal:"请输入1位小数",
    			max:'停车券金额请输入小于等于100的自然数'
    		},quantity:{
    			digits:'数量请输入整数',
    			max:'数量请输入小于等于10的自然数',
    			required: '请填写数量'
    		},couponValidDay:{
    			digits:'有效期请输入整数',
    			max:'有效期请输入小于等于1000的自然数', 
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
				required:'请填写有效周期数值',
				max:'有效期请输入小于等于1000的自然数'
    		}
    	}; 
    	param.validate = valid;
    	param.width = 800;
    	param.init = addInit;
    	layui.common.modal(param);  
	});
	$('#edit-button').bind('click',function(){
		var param = new Object();
		param.url = 'edit.html';
		param.title = '修改信息'; 
		var valid = new Object();
		valid.id = "temp-edit-form";
		valid.rules = {
				name:{
					rangelength:[1,32] ,
					required: true
				},faceAmount:{
					max: 100,
					decimal:true,
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
					max: 1000
				}
		};
		valid.messages = {
				name:{
					rangelength:'停车券套餐名称长度应在[1,32]内', 
					required: '请填写停车券套餐名称'
				},faceAmount:{
					required: '请填写优停车券金额',
					decimal:"请输入1位小数",
					max:'停车券金额请输入小于等于100的自然数'
				},quantity:{
					digits:'数量请输入整数',
					max:'数量请输入小于等于10的自然数',
					required: '请填写数量'
				},couponValidDay:{
					digits:'有效期请输入整数',
					max:'有效期请输入小于等于1000的自然数', 
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
					required:'请填写有效周期数值',
					max:'有效期请输入小于等于1000的自然数'
				}
		}; 
		param.validate = valid;
		param.width = 800;
		param.init = editInit;
		layui.common.modal(param);  
	});
});