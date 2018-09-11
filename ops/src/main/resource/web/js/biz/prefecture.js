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
layui.use(['layer','msg','form', 'common','datatable','laydate'], function() {
	var session = window.sessionStorage;
	var layer = layui.layer;  
	var $ = layui.jquery; 
	var form = layui.form;
	
	var laydate = layui.laydate; 

	laydate.render({
	    elem: '#search-startTime',
	    min: '2015-06-16 23:59:59',
	    max: new Date().format('yyyy-MM-dd'),
		istoday: false
	});
	laydate.render({
	    elem: '#search-endTime',
	    min: '2015-06-16 23:59:59',
	    max: new Date().format('yyyy-MM-dd'),
		istoday: false
	}); 
	// 计费策略
	var strategyHtml = '';
	layui.common.ajax({
		url:'/admin/biz/prefecture/strategy_list',
		async:false,
		success:function(list){
			strategyHtml = '<option value="0">选择策略</option>';
			$.each(list,function(index,strategy){
				strategyHtml += '<option value="'+strategy.id+'">';
				strategyHtml += strategy.name;
				strategyHtml += '</option>';
			});
			form.render('select');
		},error:function(){
		}
	});
	
	// 企业列表
	var selectEnterpriseHtml = '';
	function selectEnterprise(){
		layui.common.ajax({
			url:'/admin/biz/prefecture/select_ent',
			async:false,
			success:function(list){
				selectEnterpriseHtml = '<option value="0">选择定制企业</option>';
				$.each(list,function(index,ent){
					selectEnterpriseHtml += '<option value="'+ent.id+'">';
					selectEnterpriseHtml += ent.name;
					selectEnterpriseHtml += '</option>';
				});
			},error:function(){
			}
		});
	}
	
	// 计费系统
	var billSystemHtml = '';
	function billSystem(){
		layui.common.ajax({
			url:'/admin/biz/prefecture/bill_system',
			async:false,
			success:function(list){
				billSystemHtml = '<option value="0">选择系统</option>';
				$.each(list,function(index,dict){
					billSystemHtml += '<option value="'+dict.id+'">';
					billSystemHtml += dict.name;
					billSystemHtml += '</option>';
				});
				form.render('select');
			},error:function(){
			}
		});
	}
	
	// 城市列表
	var cityHtml = '';
	var cityList = null;
	var cityMap = layui.common.map();
	layui.common.ajax({
		url:'/admin/biz/prefecture/city_list',
		async:false,
		success:function(list){
			cityList = list;
			cityHtml = '<option value="0">选择城市</option>';
			$.each(list,function(index,city){
				cityMap.put(city.id,city);
				cityHtml += '<option value="'+city.id+'">';
				cityHtml += city.cityName;
				cityHtml += '</option>';
			});
			form.render('select');
		},error:function(){
			
		}
	});
	// 区域列表
	var districtHtml = '';
	function getDistrict(cityId){
		layui.common.ajax({
			url:'/admin/biz/prefecture/district_list',
			data:JSON.stringify(cityId),
			contentType:'application/json; charset=utf-8',
			dataType:"json",
			async:false,
			success:function(list){
				districtHtml = '<option value="0">选择区域</option>';
				$.each(list,function(index,district){
					districtHtml += '<option value="'+district.id+'">';
					districtHtml += district.districtName;
					districtHtml += '</option>';
				});
			},error:function(){
			}
		});
	}
	
	
	var addServerParams = function(data){  
		var filters = new Array();
		var filter = null; 
		var searchStatus = $('#search-status').val();
		if(searchStatus!='-1'){
			filter = new Object();
			filter.property = 'status';
			filter.value = searchStatus;
			filters.push(filter);
		}
		var searchType = $('#search-type').val();
		if(searchType!='-1'){
			filter = new Object();
			filter.property = 'type';
			filter.value = searchType;
			filters.push(filter);
		} 
		var searchName = $('#search-name').val();
		if(searchName!=''){
			filter = new Object();
			filter.property = 'name';
			filter.value = '%'+searchName +'%';
			filters.push(filter);
		} 
		var searchStartTime = $('#search-startTime').val();
		if(searchStartTime!=''){
			filter = new Object();
			filter.property = 'startTime';
			filter.value = searchStartTime;
			filters.push(filter);
		}
		var searchEndTime = $('#search-endTime').val();
		if(searchEndTime!=''){
			filter = new Object();
			filter.property = 'endTime';
			filter.value = searchEndTime;
			filters.push(filter);
		}
		if(filters.length>0){
			data.push({name:'filterJson',value:JSON.stringify({filters:filters})});
		}
	};
	var datatable = layui.datatable.init({
		id:'prefecture-table',
		url:'/admin/biz/prefecture/list', 
		key:'id',
		columns:[ 
			{
				sTitle: '类型',
	          	mData: 'category' , 
	          	mRender:function(mData,type,full){ 
	          		var html = '';
					switch(mData){
	          			case 0: html = '<label style="color:#1E9FFF">普通车区</label>';break;
	          			case 1: html = '<label style="color:#FF5722">测试车区</label>';break;
	          			case 2: html = '<label style="color:#5FB878">共享车区</label>';break; 
	          		}
	          		return html; 
	          	}
			},
			{ sTitle: '名称',   mData: 'name'},
			{
				sTitle: '企业定制',
	          	mData: 'type' , 
	          	mRender:function(mData,type,full){
	          		var html = '';
	          		if(mData == 1){
	          			html +='<label style="color:red;">定制</label>';
	          		}else{
	          			html +='<label style="color:green;">自营</label>';
	          		}
	          		return html;
	          	}
			},
			{ sTitle: '车位总数',   mData: 'stallTotal' },
			{ sTitle: '排序等级',   mData: 'orderIndex' },
			{
				sTitle: '状态',
	          	mData: 'status' , 
	          	mRender:function(mData,type,full){
	          		var html = '';
	          		switch(mData){
	          			case 0:html += '<label style="color:green;">启用</label>';break;
		          		case 1:html += '<label style="color:red;">禁用</label>';break;
	          		}
	          		return html;
	          	}
			},
			{ sTitle: '计费策略',   mData: 'strategyName'},
			{ sTitle: '首小时价格',   mData: 'firstHourDisplay'},
			{ sTitle: '首小时外价格',   mData: 'basePriceDisplay'},
			{ sTitle: '晚间价格',   mData: 'nightPriceDisplay'},
			{
				sTitle: '签约时间',
	          	mData: 'dateContract' ,
	          	bSortable: true,
	          	mRender:function(mData,type,full){
	          		 return new Date(mData).format('yyyy-MM-dd');
	          	}
			},
			{
				sTitle: '有效期',
				mData: 'validTime' ,
				bSortable: true,
				mRender:function(mData,type,full){
					return new Date(mData).format('yyyy-MM-dd');
				}
			}
		],
		orderIndex:12,
		orderType:'desc',
		filter:addServerParams
	});
	
	var query =  function(){
		datatable.reload();
	};
	$('.search_btn').bind('click',function(){
		query();
	});
	var dataf = function dateformat(date) {
        return date ? (new Date(date)).format("yyyy-MM-dd") : "";
    }
	
	/**
	 * 删除
	 */
	$('#delete-button').bind('click',function(){
		var list = datatable.selected(); 
		if(list.length<1){
			layui.msg.error('请至少选择一条记录');
			return false;
		}
		var ids = new Array();
		$.each(list,function(index,page){
			ids.push(page.id);
		});
		layui.msg.confirm('您确定要删除',function(){
			layui.common.ajax({
				url:'/admin/biz/prefecture/delete',
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
					layui.msg.error("网络异常");
				}
			});
		}); 
	});
	
	/**
	 * 添加
	 */
	// 添加路线指引图片
    function addRoute(){
    	var formData = new FormData($("#route-guidance-form")[0]); 
		 $.ajax({
			url: '/api/common/attach/image_upload',
			type: "POST",
			data: formData,  
			enctype: 'multipart/form-data',
		    processData: false,
		    contentType: false,
		    success: function (msg) {
		    	if(msg.success){
		    		layui.msg.success(msg.content);
					$('#add_route_guidance_img').attr('src', 'http://oss.pabeitech.com/'+msg.map.attach.compressUrl);
	        		$('#add_route_guidance').val('http://oss.pabeitech.com/'+msg.map.attach.compressUrl);
	        		window.setTimeout(query,1000);
	        	}else{
	        		layui.msg.error(msg.content);
	        	}
		    } 
		});
    }
    // 添加场区图片
    function addImage(){
    	var formData = new FormData($("#pre-image-form")[0]); 
		 $.ajax({
			url: '/api/common/attach/image_upload',
			type: "POST",
			data: formData,  
			enctype: 'multipart/form-data',
		    processData: false,
		    contentType: false,
		    success: function (msg) {
		    	if(msg.success){
		    		layui.msg.success(msg.content);
					$('#add_pre_image_img').attr('src', 'http://oss.pabeitech.com/'+msg.map.attach.compressUrl);
	        		$('#add_pre_image_url').val('http://oss.pabeitech.com/'+msg.map.attach.compressUrl);
	        		window.setTimeout(query,1000);
	        	}else{
	        		layui.msg.error(msg.content);
	        	}
		    } 
		});
    }
    
	var changedEnt = function(){
		form.on('switch(switch_add_ent)', function(data){
    		var check = data.elem.checked;
		if(!check){
			selectEnterprise();
			$('#prefecture-add-form #select_ent').attr("style","display:block;");
			$('#prefecture-add-form select[name=enterpriseId]').html(selectEnterpriseHtml);
			form.render('select');
		}else{
			$('#prefecture-add-form  #select_ent').attr("style","display:none;");
			$('#prefecture-add-form select[name=enterpriseId]').html('');
		}
		}); 
	}

	var addInit = function(validate,lindex){
		laydate.render({
		    elem: '#add-contract-time',
		    min: '2015-06-16 23:59:59',
		    max: new Date(new Date().getTime()+1000*60*60*24*3650).format('yyyy-MM-dd'),
			istoday: false
		});
		laydate.render({
		    elem: '#add-valid-time',
		    min: '2015-06-16 23:59:59',
		    max: new Date(new Date().getTime()+1000*60*60*24*3650).format('yyyy-MM-dd'),
			istoday: false
		}); 
		// 城市切换
		form.on('select(pre_add_city)', function(data) {
			var cityId = data.value;
			getDistrict(cityId);
			$('#prefecture-add-form select[name=districtId]').html(districtHtml);
			form.render('select');
        });
		// 计费系统
		billSystem();
		changedEnt();
		$('#prefecture-add-form select[name=baseDictId]').html(billSystemHtml);
		$('#prefecture-add-form select[name=strategyId]').html(strategyHtml);
		$('#prefecture-add-form select[name=cityId]').html(cityHtml);
		form.render('select');
		form.render('checkbox');
		// 添加图片的按钮绑定
		$("#add_route_guidance_file").unbind("change").bind("change",addRoute);
		$("#add_pre_image_file").unbind("change").bind("change",addImage);
		
		$('#prefecture-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		$('#prefecture-add-button').bind('click',function(){
        	if(validate.valid()){
        		layui.common.ajax({
        			url:'/admin/biz/prefecture/save',
        			data:$('#prefecture-add-form').serialize(),
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
    	param.url = 'add.html';
    	param.title = '添加信息'; 
    	var valid = new Object();
    	valid.id = "prefecture-add-form";
    	valid.rules = {
    		name:{
    			rangelength:[1,100] ,
    			required: true,
    			remote:{
    				url:"/admin/biz/prefecture/check",  
    				data:{
    					property:"name",
    					value:function(){return $('#prefecture-add-form input[name=name]').val();},
    					id:function(){return new Date().getTime();}
    				}
    			}
    		},
    		strategyId:{
				required:true 
			},
    		cityId:{required: true},
    		districtId:{required: true},
			runtime:{
		 		required: true,
		 		digits:true,
				rangelength: [0,4]
		 	},
			address: {
		 		required: true,
		 		rangelength: [1,255]
		 	},
		 	longitude: {
				required: true,
				number:true,
		 		rangelength: [1,10]
			},
			latitude: {
		 		required: true,
		 		number:true,
		 		rangelength: [1,10]
		 	},
		 	dateContract:{required: true},
		 	validTime:{required: true},
		 	orderIndex:{
		 		required: true,
		 		digits:true,
				rangelength: [0,5]
		 	},
		 	leaveTime:{
		 		required: true,
		 		digits:true,
		 		rangelength: [0,3]
		 	},
			monthRent:{
		 		required: true,
		 		digits:true,
		 		rangelength: [0,6]
		 	},
			increase:{
		 		required: true,
		 		number:true,
		 		rangelength: [0,3]
		 	},
			strategyDescription:{
		 		required: true,
		 		rangelength: [1,72]
		 	},
		 	routeDescription:{
		 		required: true,
		 		rangelength: [1,72]
		 	},
		 	chargePrice: {
		 		required: true
		 	},
		 	chargeTime: {
				required: true,
				number:true
			}
    	};
    	valid.messages = {
    		name:{
    			rangelength:'名称长度应在[1,100]内',
    			required: '请填写名称',
    			remote:'名称已经存在'
    		},
			runtime:{
		 		required: "请输入运营时长（分钟）",
		 		digits:"请输入正整数",
				rangelength: "长度必须是1-4之间"
		 	},
    		strategyId:{
    			required:"请选择计费策略"
    		},
    		cityId:{
    			required:"请选择城市"
    		},
    		districtId:{
				required:"请选择区域" 
			},
	    	address: {
		 		required: "请输入地址",
		 		rangelength: "长度不符合规则"
		 	},
		 	longitude: {
				required: "请输入经度",
				number: "请输入正确的格式",
				rangelength: "长度必须是1~10之间"
			},
			latitude: {
		 		required: "请输入维度",
		 		custom: "请输入正确的格式",
		 		rangelength: "长度必须是1~10之间"
		 	},
		 	dateContract:{
		 		required: "请选择签约期"
		 	},
		 	validTime:{
		 		required: "请选择有效期"
		 	},
		 	orderIndex:{
		 		required: "请输入排序等级",
		 		digits:"请输入正整数",
				rangelength: "长度必须是1-5之间"
		 	},
		 	leaveTime:{
		 		required: "请输入离场警示时间",
		 		digits:"请输入正整数",
		 		rangelength: "长度必须是1-3之间"
		 	},
			monthRent:{
		 		required: "请输入月租金",
		 		digits:"请输入正整数",
		 		rangelength: "长度必须是1-6之间"
		 	},
			increase:{
				required: "请输入租金涨幅",
				number: "请输入正确的格式",
				rangelength: "长度必须是1~3之间"
			},
			strategyDescription:{
		 		required: "请输入计费策略描述",
		 		rangelength: "文字长度必须是1~72之间"
		 	},
		 	routeDescription:{
		 		required: "请输入路线指引描述",
		 		rangelength: "文字长度必须是1~72之间"
		 	},
		 	chargePrice: {
		 		required: "请输入计费价格"
		 	},
		 	chargeTime: {
				required: "请输入计费时间",
				number:"请输入正确格式"
			}
    	}; 
    	param.validate = valid;
    	param.width = 700;
    	param.init = addInit;
    	layui.common.modal(param);  
    });
    
	/*
	 * 编辑
	 */
    // 修改路线指引图片
    function editRoute(){
		
    	var formData = new FormData($("#edit-route-guidance-form")[0]); 
		 $.ajax({
			url: '/api/common/attach/image_upload',
			type: "POST",
			data: formData,  
			enctype: 'multipart/form-data',
		    processData: false,
		    contentType: false,
		    success: function (msg) {
		    	if(msg.success){
		    		layui.msg.success(msg.content);
					$('#edit_route_guidance_img').attr('src', 'http://oss.pabeitech.com/'+msg.map.attach.compressUrl);
	        		$('#edit_route_guidance').val('http://oss.pabeitech.com/'+msg.map.attach.compressUrl);
	        		window.setTimeout(query,1000);
	        	}else{
	        		layui.msg.error(msg.content);
	        	}
		    } 
		});
    }
    // 修改场区图片
    function editImage(){
    	var formData = new FormData($("#edit-pre-image-form")[0]); 
		 $.ajax({
			url: '/api/common/attach/image_upload',
			type: "POST",
			data: formData,  
			enctype: 'multipart/form-data',
		    processData: false,
		    contentType: false,
		    success: function (msg) {
		    	if(msg.success){
		    		layui.msg.success(msg.content);
					$('#edit_pre_image_img').attr('src', 'http://oss.pabeitech.com/'+msg.map.attach.compressUrl);
	        		$('#edit_pre_image_url').val('http://oss.pabeitech.com/'+msg.map.attach.compressUrl);
	        		window.setTimeout(query,1000);
	        	}else{
	        		layui.msg.error(msg.content);
	        	}
		    } 
		});
    }
    // 数据回显
    var pre_detail = function showData(id,callback){
    	layui.common.ajax({
			url:'/admin/biz/prefecture/detail',
			data:JSON.stringify(id),
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
    var editInit = function(validate,lindex){		
    	laydate.render({
		    elem: '#edit-contract-time',
		    min: '2015-06-16 23:59:59',
		    max: new Date(new Date().getTime()+1000*60*60*24*3650).format('yyyy-MM-dd'),
			istoday: false
		});
		laydate.render({
		    elem: '#edit-valid-time',
		    min: '2015-06-16 23:59:59',
		    max: new Date(new Date().getTime()+1000*60*60*24*3650).format('yyyy-MM-dd'),
			istoday: false
		}); 
    	// 计费系统
    	billSystem();
    	$('#prefecture-edit-form select[name=cityId]').html(cityHtml);
		$('#prefecture-edit-form select[name=baseDictId]').html(billSystemHtml);
		$('#prefecture-edit-form select[name=strategyId]').html(strategyHtml);
    	form.render('select');
    	// 详情
		pre_detail(datatable.selected()[0].id,function(data){
			var preDetail = data;  
			getDistrict(preDetail.cityId);
			$('#prefecture-edit-form select[name=districtId]').html(districtHtml);
			
    		layui.common.set({
    			id:'prefecture-edit-form',
    			data:preDetail
    		});
    		form.render('checkbox');
    		form.render('select');
    		// 格式化日期
    		$('#prefecture-edit-form input[name=dateContract]').val(dataf(preDetail.dateContract));
    		$('#prefecture-edit-form input[name=validTime]').val(dataf(preDetail.validTime));
    		// 图片显示
    		$("#edit_route_guidance_img").attr('src',preDetail.routeGuidance);
    		$("#edit_pre_image_img").attr('src',preDetail.imageUrl);
    	});
		// 城市切换绑定
		form.on('select(pre_edit_city)', function(data) {
			getDistrict(data.value);
			$('#prefecture-edit-form select[name=districtId]').html(districtHtml);
			form.render('select');
		});
		// 添加图片的按钮绑定
		$("#edit_route_guidance_file").unbind("change").bind("change",editRoute);
		$("#edit_pre_image_file").unbind("change").bind("change",editImage);
		
		$('#prefecture-cancel-edit-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		$('#prefecture-edit-button').bind('click',function(){
        	if(validate.valid()){  
        		layui.common.ajax({
        			url:'/admin/biz/prefecture/update',
        			data:$('#prefecture-edit-form').serialize(),
        			success:function(res){
        				if(res.success){
        					layui.layer.close(lindex);
        					layui.msg.success(res.content);
        					window.setTimeout(function(){
        						location.reload(false);
        					},1000);
        				}
        			} 
        		});
        	}
        });
	};
	
	$('#download-button').bind('click',function(){
		var list = datatable.selected(); 
		if(list.length!=1){
			layui.msg.error('请选择一条记录');
			return false;
		}
        var url = '/admin/biz/prefecture/download';
        var data = new Object(); 
        data.id = datatable.selected()[0].id;
        layui.common.download({
          url:url,
          data: data
        });
	});
	
	
	$('#edit-button').bind('click',function(){
		var list = datatable.selected(); 
		if(list.length!=1){
			layui.msg.error('请选择一条记录');
			return false;
		}
    	var param = new Object();
    	param.url = 'edit.html';
    	param.title = '编辑信息'; 
    	var valid = new Object();
    	valid.id = "prefecture-edit-form";
    	valid.rules = {
    		name:{
    			rangelength:[1,100] ,
    			required: true,
    			remote:{
    				url:"/admin/biz/prefecture/check",  
    				data:{
    					property:"name",
    					value:function(){return $('#prefecture-edit-form input[name=name]').val();},
    					id:function(){return $('#prefecture-edit-form input[name=id]').val();}
    				}
    			}
    		},
    		strategyId:{
				required:true 
			},
    		cityId:{required: true},
    		districtId:{required: true},
			
			address: {
		 		required: true,
		 		rangelength: [1,255]
		 	},
			runtime:{
		 		required: true,
		 		digits:true,
				rangelength: [0,4]
		 	},
		 	longitude: {
				required: true,
				number:true,
		 		rangelength: [1,10]
			},
			latitude: {
		 		required: true,
		 		number:true,
		 		rangelength: [1,10]
		 	},
		 	dateContract:{required: true},
		 	validTime:{required: true},
		 	orderIndex:{
		 		required: true,
		 		digits:true,
				rangelength: [0,5]
		 	},
		 	leaveTime:{
		 		required: true,
		 		digits:true,
		 		rangelength: [0,3]
		 	},
			monthRent:{
		 		required: true,
		 		digits:true,
		 		rangelength: [0,6]
		 	},
			increase:{
		 		required: true,
		 		number:true,
		 		rangelength: [0,3]
		 	},
			strategyDescription:{
		 		required: true,
		 		rangelength: [1,72]
		 	},
		 	routeDescription:{
		 		required: true,
		 		rangelength: [1,72]
		 	},
		 	chargePrice: {
		 		required: true
		 	},
		 	chargeTime: {
				required: true,
				number:true
			}
    	};
    	valid.messages = {
    		name:{
    			rangelength:'名称长度应在[1,100]内',
    			required: '请填写名称',
    			remote:'名称已经存在'
    		},
			runtime:{
		 		required: "请输入运营时长（分钟）",
		 		digits:"请输入正整数",
				rangelength: "长度必须是1-4之间"
		 	},
    		strategyId:{
    			required:"请选择计费策略"
    		},
    		cityId:{
    			required:"请选择城市"
    		},
    		districtId:{
				required:"请选择区域" 
			},
	    	address: {
		 		required: "请输入地址",
		 		rangelength: "长度不符合规则"
		 	},
		 	longitude: {
				required: "请输入经度",
				number: "请输入正确的格式",
				rangelength: "长度必须是1~10之间"
			},
			latitude: {
		 		required: "请输入维度",
		 		custom: "请输入正确的格式",
		 		rangelength: "长度必须是1~10之间"
		 	},
		 	dateContract:{
		 		required: "请选择签约期"
		 	},
		 	validTime:{
		 		required: "请选择有效期"
		 	},
		 	orderIndex:{
		 		required: "请输入排序等级",
		 		digits:"请输入正整数",
				rangelength: "长度必须是1-5之间"
		 	},
		 	leaveTime:{
		 		required: "请输入离场警示时间",
		 		digits:"请输入正整数",
		 		rangelength: "长度必须是1-3之间"
		 	},
			monthRent:{
		 		required: "请输入月租金",
		 		digits:"请输入正整数",
		 		rangelength: "长度必须是1-6之间"
		 	},
			increase:{
				required: "请输入租金涨幅",
				number: "请输入正确的格式",
				rangelength: "长度必须是1~3之间"
			},
			strategyDescription:{
		 		required: "请输入计费策略描述",
		 		rangelength: "文字长度必须是1~72之间"
		 	},
		 	routeDescription:{
		 		required: "请输入路线指引描述",
		 		rangelength: "文字长度必须是1~72之间"
		 	},
		 	chargePrice: {
		 		required: "请输入计费价格"
		 	},
		 	chargeTime: {
				required: "请输入计费时间",
				number:"请输入正确格式"
			}
    	}; 
    	param.validate = valid;
    	param.width = 700;
    	param.init = editInit;
    	layui.common.modal(param);
	});
	/*
	 * 导出
	 */
	$('#export-button').bind('click',function(){
		var data = new Object(); 
		var searchStatus = $('#search-status').val();
		if(searchStatus!='-1'){ 
			data.status = searchStatus; 
		} 
		var searchName = $('#search-name').val();
		if(searchName!=''){ 
			data.name = '%'+searchName +'%';
		}  
		var searchStartTime = $('#search-startTime').val();
		if(searchStartTime!=''){ 
			data.startTime = searchStartTime; 
		} 
		var searchEndTime = $('#search-endTime').val();
		if(searchEndTime!=''){ 
			data.endTime = searchEndTime; 
		} 
        var url = '/admin/biz/prefecture/export';
        data.time = new Date().getTime();
        layui.common.download({
          url:url,
          data: data
        }); 
	}); 
	
	
	/*
	 * 添加分组
	 */
	var groupInit = function(validate,lindex){
		var list = datatable.selected(); 
		var preIds= "";
		$.each(list,function(index,page){
			preIds += page.id+",";
		});
		preIds = preIds.substring(0,preIds.length-1);
		$('#prefecture-group-form input[name=preIds]').val(preIds);
		
		$('#prefecture-cancel-button').bind('click',function(){
			layui.msg.confirm('取消后，你填写的信息将不会保存，请谨慎选择。',function(){
				layui.layer.close(lindex);
			});
		});
		$('#prefecture-group-button').bind('click',function(){
        	if(validate.valid()){
        		layui.common.ajax({
        			url:'/admin/biz/pre_group/save',
        			data:$('#prefecture-group-form').serialize(),
        			success:function(res){
        				if(res.success){
        					layui.layer.close(lindex);
        					layui.msg.success(res.content);
        					window.setTimeout(query,1000);
        				}else{
        					layui.msg.error(res.content);
        				}
        			} 
        		});
        	}
        });
	};
    $('#group-button').bind('click',function(){
    	var list = datatable.selected(); 
		if(list.length==0){
			layui.msg.error('请选择一条记录');
			return false;
		}
    	var param = new Object();
    	param.url = 'add_group.html';
    	param.title = '添加分组信息'; 
    	var valid = new Object();
    	valid.id = "prefecture-group-form";
    	valid.rules = {
    		name:{
    			rangelength:[1,32] ,
    			required: true,
    			remote:{
    				url:"/admin/biz/pre_group/check",  
    				data:{
    					property:"name",
    					value:function(){return $('#prefecture-group-form input[name=name]').val();},
    					id:function(){return new Date().getTime();}
    				}
    			}
    		},content:{
		 		required: true,
		 		rangelength: [1,30]
		 	},
    	};
    	valid.messages = {
    		name:{
    			rangelength:'名称长度应在[1,32]内', 
    			required: '请填写名称',
    			remote:'名称已经存在'
    		},content:{
    			rangelength:'简介长度应该在[1,30]内',  
    			required: '请填写简介',
    		} 
    	}; 
    	param.validate = valid;
    	param.width = 600;
    	param.init = groupInit;
    	layui.common.modal(param);  
    });
    
});