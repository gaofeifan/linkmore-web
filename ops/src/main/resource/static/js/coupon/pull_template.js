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
layui.use(['layer','msg','form', 'common','validate','datatable','laydate'], function() {
	var validate = layui.validate; 
	var layer = layui.layer;  
	var $ = layui.jquery; 
	var form = layui.form;
	var laydate = layui.laydate; 
    
	// 城市
	var cityHtml = '';
	function cityList(){
		layui.common.ajax({
			url:'/admin/biz/application_group/city_list',
			async:false,
			success:function(list){
				cityHtml = '<option value="-1">请选择</option>';
				$.each(list,function(index,city){
					cityHtml += '<option value="'+city.id+'">';
					cityHtml += city.cityName;
					cityHtml += '</option>';
				});
				$('#temp-add-form select[name=cityId]').html(cityHtml);
				form.render('select');
			},error:function(){
			}
		});
	}
	// 车区
	var preHtml = '';
	function preList(cityId){
		layui.common.ajax({
			url:'/admin/biz/application_group/pre_list',
			data:JSON.stringify(cityId),
			contentType:'application/json; charset=utf-8',
			async:false,
			success:function(list){
				preHtml = '<option value="-1">请选择</option>';
				$.each(list,function(index,pre){
					preHtml += '<option value="'+pre.id+'">';
					preHtml += pre.name;
					preHtml += '</option>';
				});
				$('#temp-add-form select[name=preId]').html(preHtml);
				form.render('select');
			},error:function(){
			}
		});
	}
    
	var addServerParams = function(data){   
		var searchName = $('#search-name').val();
		var searchStatus = $('#search-status').val();
		var filters = new Array();
		var filter = null; 
		
		filter = new Object();
		filter.property = 'type';
		filter.value = 2;
		filters.push(filter);
		
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
	
	//数据回显
    var operation_log = function showData(logId,callback){
    	layui.common.ajax({
			url:'/admin/coupon_template_pull/detail',
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
    		cityList();
    		$('#temp-detail-form select[name=cityId]').html(cityHtml);
    		preList(object.cityId);
    		$('#temp-detail-form select[name=preId]').html(preHtml);
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
    		$('#temp-detail-form input[name=createTime]').val(dataf(object.createTime));
    		$('#temp-detail-form select').attr('disabled',true);
    		$('#temp-detail-form input').attr('disabled',true);
    		form.render('select');
    	});
    	$('#temp-cancel-detail-button').bind('click',function(){
    		layui.layer.close(lindex);
    	});
    }
    
    function download() {  
    	var id = $(this).attr('data-id');
        var url = '/admin/coupon_template_pull/download';
        var data = new Object(); 
        data.id = id;
        layui.common.download({
          url:url,
          data: data
        });
    } 
    
	function showTempInfo(){
		tempId = $(this).attr('data-detail-id');
    	var param = new Object();
    	param.url = 'pull_detail.html';
    	param.title = '详情信息'; 
    	var valid = new Object();
    	valid.id = "temp-detail-form";
    	param.width = 800;
    	param.init = detailInit;
    	layui.common.modal(param);
	}
	
	function editTemplate(){
		tempId = $(this).attr('data-edit-id');
    	var param = new Object();
    	param.url = 'pull_edit.html';
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
	
	var editInit = function(validate,lindex){
    	var template = null;
    	operation_log(tempId,function(data){
    		template = data;
    		cityList();
    		$('#temp-edit-form select[name=cityId]').html(cityHtml);
    		preList(template.cityId);
    		$('#temp-edit-form select[name=preId]').html(preHtml);
    		layui.common.set({
    			id:'temp-edit-form',
    			data:template
    		});
    		
    		if(template.validType==1){
    			$('#valid-day-id').show();
    		}else{
    			$('#valid-day-id').hide();
    		}
    		form.render('select');
    		
    		var items = template.items;
    		var item = null;
    		for(var i=0;i<items.length;i++){
    			item = items[i];
    			var couponType = item.type;
    			var html2 = '<div class="cycle-time" style="display: inline;">';
    			    html2 += '<input type="hidden" id ="itemId" value="'+item.id+'" class="layui-input itemId"/>';
				    html2 += '<input type="hidden" id="couponItemType" value="'+item.type+'" class="layui-input couponItemType">';
    			if(couponType==0){
    				html2 += '<div class="layui-form-item" id="lj-id" style="display:block">';
    				html2 += '        <label class="layui-form-label">停车券金额</label>';
    				html2 += '        <div class="layui-input-inline">';
    				html2 += '            <input type="text" name="faceAmount" value ="'+item.faceAmount+'" placeholder="请输入金额" class="layui-input faceAmount">';
    				html2 += '		  	  <input type="hidden" name="conditionAmount" placeholder="请输入金额" class="layui-input conditionAmount">';
    				html2 += '            <input type="hidden" name="mj_faceAmount"  placeholder="请输入折扣率" class="layui-input mj_faceAmount">';
    				html2 += '		  	  <input type="hidden" name="zk_faceAmount"  placeholder="请输入金额" class="layui-input zk_faceAmount">';
    				html2 += '            <input type="hidden" name="item_discount"  placeholder="请输入折扣率" class="layui-input item_discount">';
    				html2 += '		  </div>';
    				html2 += '</div>';
    			}else if(couponType==1){
    				html2 += '<div class="layui-form-item" id="mz-id" style="display:block">';
    				html2 += '        <label class="layui-form-label">满足金额</label>';
    				html2 += '        <div class="layui-input-inline">';
    				html2 += '		  	  <input type="hidden" name="zk_faceAmount" placeholder="请输入金额" class="layui-input zk_faceAmount">';
    				html2 += '            <input type="hidden" name="item_discount" placeholder="请输入折扣率" class="layui-input item_discount">';
    				html2 += '            <input type="hidden" name="faceAmount" placeholder="请输入金额" class="layui-input faceAmount">';
    				html2 += '            <input type="text" name="conditionAmount" value ="'+item.conditionAmount+'" placeholder="请输入满足金额" class="layui-input conditionAmount">';
    				html2 += '		  </div>';
    				html2 += '		  <label class="layui-form-label">减免金额</label>';
    				html2 += '		  <div class="layui-input-inline">';
    				html2 += '		  	  <input type="text" name="mj_faceAmount" value ="'+item.faceAmount+'" placeholder="请输入金额" class="layui-input mj_faceAmount">';
    				html2 += '		  </div>';
    				html2 += '</div>';
    			}else{
    				
    				html2 += '<div class="layui-form-item" id="zk-id" style="display:block">';
    				html2 += '        <label class="layui-form-label">折扣率</label>';
    				html2 += '        <div class="layui-input-inline">';
    				html2 += '            <input type="hidden" name="faceAmount" placeholder="请输入金额" class="layui-input faceAmount">';
    				html2 += '		  	  <input type="hidden" name="conditionAmount" placeholder="请输入金额" class="layui-input conditionAmount">';
    				html2 += '            <input type="hidden" name="mj_faceAmount" placeholder="请输入折扣率" class="layui-input mj_faceAmount">';
    				html2 += '            <input type="text" name="item_discount" value ="'+item.discount+'" placeholder="请输入折扣率" class="layui-input item_discount">';
    				html2 += '		  </div>';
    				html2 += '		  <label class="layui-form-label">折扣上限</label>';
    				html2 += '		  <div class="layui-input-inline">';
    				html2 += '		  	  <input type="text" name="zk_faceAmount" value ="'+item.faceAmount+'" placeholder="请输入金额" class="layui-input zk_faceAmount">';
    				html2 += '		  </div>';
    				html2 += '</div>';
    			}
    			html2 += '<div class="layui-form-item" id="zk-id" style="display:block">';
				html2 += '        <label class="layui-form-label">数量</label>';
				html2 += '        <div class="layui-input-inline">';
				html2 += '            <input type="text" name="quantity" value ="'+item.quantity+'" placeholder="请输入数量" class="layui-input quantity">';
				html2 += '		  </div>';
				html2 += '		  <label class="layui-form-label">有效期</label>';
				html2 += '		  <div class="layui-input-inline">';
				html2 += '		  	  <input type="text" name="couponValidDay" value ="'+item.validDay+'" placeholder="请输入有效期" class="layui-input couponValidDay">';
				html2 += '		  </div>';
				html2 += '</div>';
    			
    			html2 += '<div class="layui-form-label"><a style="javascript:void(0);" class="delete_cycle">删除<a></div></div>';
    			$("#coupon_items").append(html2);
    			$(".delete_cycle").click(function(){
    				$(this).parent().parent().remove();
    			});
    		}
    		
    	});
    	
    	$('#temp-edit-cancel-button').bind('click',function(){
			layui.msg.confirm('取消后，你填写的信息将不会保存，请谨慎选择。',function(){
				layui.layer.close(lindex);
			});
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
		
		$("#add-coupon").unbind("click").bind("click",function(){
			var html = '<div class="cycle-time" style="display: inline;">'+$("#coupon_items").find(".cycle-time").eq(0).html();
			html += '<div class="layui-form-label"><a style="javascript:void(0);" class="delete_cycle">删除<a></div></div>';
			$("#coupon_items").append(html);
			
			$(".delete_cycle").click(function(){
				$(this).parent().parent().remove();
			});
		});
    	
    	form.on('select(validType)', function(data) {
			var type = data.value;
			if(type==0){
				$('#valid-day-id').hide();
				$("input[name='validDay']").val('');
			}else{
				$('#valid-day-id').show();
			}
        });
    	
    	$('#temp-edit-button').bind('click',function(){
        	if(validate.valid()){
        		var validType = $('#temp-edit-form select[name=validType]').val();
        		var validDay = $('input[name="validDay"]').val();
        		var cityId = $('#temp-add-form select[name=cityId]').val();
        		var preId = $('#temp-add-form select[name=preId]').val();
        		
        		if(validType ==1){
        			if(validDay == ''){
        				layui.msg.tips('请填写有效期天数!');
        				return;
        			}
        		}
        		
        		if(cityId == -1){
        			layui.msg.tips('请选择城市!');
    				return;
        		}
        		
        		if(preId == -1){
        			layui.msg.tips('请选择车区!');
    				return;
        		}
        		
        		var len = $(".quantity").length;
        		if(len == 1){
        			layui.msg.tips('当前套餐内还没有停车券，请增加停车券!');
    				return;
        		}
        		
        		if(len > 6){
        			layui.msg.tips('套餐内最多添加5张停车券!');
    				return;
        		}
        		for(var i=1;i<len;i++){
        			var itemId = $(".itemId").eq(i).val();
        			var couponItemType = $(".couponItemType").eq(i).val();
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
        				
        				if(parseFloat(conditionAmount) < parseFloat(mj_faceAmount)){
        					layui.msg.tips('满足金额小于减免金额!');
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
    					if(validType ==1){
    						if(parseInt(couponValidDay) > parseInt(validDay)){
    							layui.msg.tips('套餐内停车券有效期大于自定义有效天数!');
    	        				return;
    						}
    	        		}
    				}
        		}
        		
        		var discount = new Array();
        		for(var i=1;i<len;i++){
        			var obj = new Object();
        			obj.itemId = $(".itemId").eq(i).val();
        			obj.couponItemType = $(".couponItemType").eq(i).val();
        			obj.faceAmount = $(".faceAmount").eq(i).val();
        			obj.conditionAmount = $(".conditionAmount").eq(i).val();
        			obj.mj_faceAmount = $(".mj_faceAmount").eq(i).val();
        			obj.item_discount = $(".item_discount").eq(i).val();
        			obj.zk_faceAmount = $(".zk_faceAmount").eq(i).val();
        			obj.quantity = $(".quantity").eq(i).val();
        			obj.couponValidDay = $(".couponValidDay").eq(i).val();
        			discount.push(obj);
        		}
        		
    			$('input[name="discount"]').val(JSON.stringify(discount))
        		
        		layui.common.ajax({
        			url:'/admin/coupon_template_pull/update',
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
    }
	
	function openTemplate() {
		var id = $(this).attr('data-open-id');
		layui.msg.confirm('您确定要启用',function(){
			layui.common.ajax({
				url:'/admin/coupon_template_pull/start',
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
				url:'/admin/coupon_template_pull/start',
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
	
	function stopTemplate() {
		var id = $(this).attr('data-stop-id');
		layui.msg.confirm('您确定要暂停',function(){
			layui.common.ajax({
				url:'/admin/coupon_template_pull/stop',
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
		var id = $(this).attr('data-delete-id');
		var ids = new Array();
		ids.push(id);
		layui.msg.confirm('您确定要删除',function(){
			layui.common.ajax({
				url:'/admin/coupon_template_pull/delete',
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
		url:'/admin/coupon_template_pull/list', 
		key:'id',
		columns:[
		    { sTitle: 'ID',   mData: 'id' , bVisible:false },
			{ sTitle: '停车券名称',   mData: 'name'},
			{ sTitle: '停车券详情',  mData: 'discount'} , 
			{
				sTitle: '状态',
	          	mData: 'status' ,
	          	bSortable: true,
	          	mRender:function(mData,type,full){ 
	          		var html = ''; 
	          		if(full.status==0){
	          			html = '<label style="color:gray;">未开始</label>';
	          		} else if(full.status==1){
	          			html = '<label style="color:green;">运行中</label>'; 
	          		} else if(full.status==2){
	          			html = '<label style="color:red;">暂停中</label>'; 
	          		} else if(full.status==3){
	          			html = '<label style="color:blue;">已结束</label>'; 
	          		} 
	          		return html;
	          	}
			},
			{ sTitle: '剩余数量',  mData: 'remainNumber'} , 
			{
				sTitle: '已发放用户',
	          	mRender:function(mData,type,full){
	          		var html = '<a class="operation-user" href="user_list.html?tempId='+full.id+'&&type='+full.type+'">'+full.sendQuantity+'位</a>';
	          		return html;
	          	}
			},
			
			{
				sTitle: '更新时间',
	          	mData: 'updateTime' ,
	          	bSortable: true,
	          	mRender:function(mData,type,full){
	          		 return new Date(mData).format('yyyy-MM-dd hh:mm');
	          	}
			},
			{
				sTitle: '操作',
	          	mRender:function(mData,type,full){
	          		var html = '<a class="operation-condition" data-cond-id="'+full.id+'" href="condition_list.html?tempId='+full.id+'&&type='+full.type+'">生成条件</a>&nbsp;&nbsp;&nbsp;&nbsp;';
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
          		    html += '<a class="operation-detail" data-detail-id="'+full.id+'" href="javascript:void(0);">详情</a>'; 
	          		return html;
	          	}
			}
		],
		orderIndex:7,
		orderType:'desc',
		draw:draw,
		filter:addServerParams
	});  
	
	var query =  function(){
		datatable.reload();
	}; 
	
	$('.search_btn').bind('click',function(){
		query();
	});
	
	
	var addInit = function(validate,lindex){
		form.render('select');
		$('#temp-cancel-button').bind('click',function(){
			layui.msg.confirm('取消后，你填写的信息将不会保存，请谨慎选择。',function(){
				layui.layer.close(lindex);
			});
		});
		
		cityList();
		
		form.on('select(city)', function(data) {
			var cityId = data.value;
			preList(cityId);
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
		
		$("#add-coupon").unbind("click").bind("click",function(){
			var html = '<div class="cycle-time" style="display: inline;">'+$("#coupon_items").find(".cycle-time").eq(0).html();
			html += '<div class="layui-form-label"><a style="javascript:void(0);" class="delete_cycle">删除<a></div></div>';
			$("#coupon_items").append(html);
			
			$(".delete_cycle").click(function(){
				$(this).parent().parent().remove();
			});
		});
		
		form.on('select(validType)', function(data) {
			var type = data.value;
			if(type==0){
				$('#valid-day-id').hide();
				$("input[name='validDay']").val('');
			}else{
				$('#valid-day-id').show();
			}
        });
		
		$('#temp-add-button').bind('click',function(){
        	if(validate.valid()){
        		var validType = $('#temp-add-form select[name=validType]').val();
        		var validDay = $('input[name="validDay"]').val();
        		
        		var cityId = $('#temp-add-form select[name=cityId]').val();
        		var preId = $('#temp-add-form select[name=preId]').val();
        		
        		if(validType ==1){
        			if(validDay == ''){
        				layui.msg.tips('请填写有效期天数!');
        				return;
        			}
        		}
        		
        		if(cityId == -1){
        			layui.msg.tips('请选择城市!');
    				return;
        		}
        		
        		if(preId == -1){
        			layui.msg.tips('请选择车区!');
    				return;
        		}
        		
        		var len = $(".faceAmount").length;
        		if(len == 1){
        			layui.msg.tips('当前套餐内还没有停车券，请增加停车券!');
    				return;
        		}
        		
        		if(len > 6){
        			layui.msg.tips('套餐内最多添加5张停车券!');
    				return;
        		}
        		for(var i=1;i<len;i++){
        			var couponItemType = $(".couponItemType").eq(i).val();
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
        				
        				if(parseFloat(conditionAmount) < parseFloat(mj_faceAmount)){
        					layui.msg.tips('满足金额小于减免金额!');
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
    					if(validType ==1){
    						if(parseInt(couponValidDay) > parseInt(validDay)){
    							layui.msg.tips('套餐内停车券有效期大于自定义有效天数!');
    	        				return;
    						}
    	        		}
    				}
        		}
        		
        		
        		var discount = new Array();
        		for(var i=1;i<len;i++){
        			var obj = new Object();
        			obj.couponItemType = $(".couponItemType").eq(i).val();
        			obj.faceAmount = $(".faceAmount").eq(i).val();
        			obj.conditionAmount = $(".conditionAmount").eq(i).val();
        			obj.mj_faceAmount = $(".mj_faceAmount").eq(i).val();
        			obj.item_discount = $(".item_discount").eq(i).val();
        			obj.zk_faceAmount = $(".zk_faceAmount").eq(i).val();
        			obj.quantity = $(".quantity").eq(i).val();
        			obj.couponValidDay = $(".couponValidDay").eq(i).val();
        			discount.push(obj);
        		}
        		
    			$('input[name="discount"]').val(JSON.stringify(discount))
        		
        		layui.common.ajax({
        			url:'/admin/coupon_template_pull/save',
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
	
	$('#add-button').bind('click',function(){
    	var param = new Object();
    	param.url = 'pull_add.html';
    	param.title = '添加信息';
    	var valid = new Object();
    	valid.id = "temp-add-form";
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
    	param.width = 800;
    	param.init = addInit;
    	layui.common.modal(param);  
	});
});