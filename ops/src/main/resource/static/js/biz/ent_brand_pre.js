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
	var periodMap = layui.common.map();
	var preMap = layui.common.map();
	var strategyMap = layui.common.map();
	var entMap = layui.common.map();

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
	
	// 企业列表
	var enterpriseHtml = '';
	layui.common.ajax({
		url:'/admin/biz/ent-brand-pre/ent-list',
		async:false,
		success:function(list){
			enterpriseHtml = '<option value="0">选择定制企业</option>';
			$.each(list,function(index,ent){
				enterpriseHtml += '<option value="'+ent.id+'">';
				enterpriseHtml += ent.name;
				enterpriseHtml += '</option>';
				entMap.put(ent.id,ent.name);
			});
			$('#search-ent-id').html(enterpriseHtml);
			form.render('select');
		},error:function(){
		}
	});
	
	// 车区列表
	var preHtml = '';
	layui.common.ajax({
		url:'/admin/biz/ent-brand-pre/pre-list',
		async:false,
		success:function(list){
			preHtml = '<option value="0">选择车区</option>';
			$.each(list,function(index,pre){
				preHtml += '<option value="'+pre.id+'">';
				preHtml += pre.name;
				preHtml += '</option>';
				preMap.put(pre.id,pre.name);
			});
			$('#search-pre-id').html(preHtml);
			form.render('select');
		},error:function(){
		}
	});
	
	// 计费策略
	var strategyHtml = '';
	layui.common.ajax({
		url:'/admin/biz/ent-brand-pre/strategy-list',
		async:false,
		success:function(list){
			strategyHtml = '<option value="0">选择策略</option>';
			$.each(list,function(index,strategy){
				strategyHtml += '<option value="'+strategy.id+'">';
				strategyHtml += strategy.name;
				strategyHtml += '</option>';
				strategyMap.put(strategy.id,strategy.name);
			});
			form.render('select');
		},error:function(){
		}
	});
	
	// 运营周期
	var periodHtml = '';
	layui.common.ajax({
		url:'/admin/biz/ent-brand-pre/period-list',
		async:false,
		success:function(list){
			periodHtml = '<option value="0">请选择</option>';
			$.each(list,function(index,dict){
				periodHtml += '<option value="'+dict.code+'">';
				periodHtml += dict.name;
				periodHtml += '</option>';
				periodMap.put(dict.code,dict.name);
			});
			form.render('select');
		},error:function(){
		}
	});

	
	var addServerParams = function(data){  
		var filters = new Array();
		var filter = null; 
		var searchEntId = $('#search-ent-id').val();
		var searchPreId = $('#search-pre-id').val();
		if(searchEntId!='0'){
			filter = new Object();
			filter.property = 'entId';
			filter.value = searchEntId;
			filters.push(filter);
		} 
		if(searchPreId!='0'){
			filter = new Object();
			filter.property = 'preId';
			filter.value = searchPreId;
			filters.push(filter);
		} 
		
		if(filters.length>0){
			data.push({name:'filterJson',value:JSON.stringify({filters:filters})});
		}
	};
	var datatable = layui.datatable.init({
		id:'pre-table',
		url:'/admin/biz/ent-brand-pre/list', 
		key:'id',
		columns:[ 
			{ sTitle: '车区名称',   mData: 'preId',
				mRender:function(mData,type,full){ 
	          		return preMap.get(mData);
	          	}
			},
			{ sTitle: '企业名称',   mData: 'entId',
				mRender:function(mData,type,full){ 
	          		return entMap.get(mData);
	          	}
			},
			{ sTitle: '品牌车区名称',   mData: 'name' },
			{ sTitle: '车位总数',   mData: 'stallTotal' },
			{ sTitle: '运营周期',   mData: 'period',
				mRender:function(mData,type,full){ 
	          		return periodMap.get(mData);
	          	}
			},
			{
				sTitle: '状态',
	          	mData: 'status' , 
	          	mRender:function(mData,type,full){
	          		var html = '';
	          		switch(mData){
	          			case 0:html += '<label style="color:gray;">未开启</label>';break;
	          			case 1:html += '<label style="color:green;">启用</label>';break;
		          		case 2:html += '<label style="color:red;">禁用</label>';break;
	          		}
	          		return html;
	          	}
			},
			{
				sTitle: '是否受限',
	          	mData: 'limitStatus' , 
	          	mRender:function(mData,type,full){
	          		var html = '';
	          		switch(mData){
	          			case 0:html += '<label style="color:gray;">否</label>';break;
	          			case 1:html += '<label style="color:green;">是</label>';break;
	          		}
	          		return html;
	          	}
			},
			{ sTitle: '计费策略',   mData: 'strategyId',
				mRender:function(mData,type,full){ 
	          		return strategyMap.get(mData);
	          	}
			},
			{ sTitle: '计费价格',   mData: 'chargePrice'},
			{ sTitle: '计费时间',   mData: 'chargeTime'},
			{
				sTitle: '启用时间',
	          	mData: 'startTime' ,
	          	bSortable: true,
	          	mRender:function(mData,type,full){
					if(mData != null){
						return new Date(mData).format('yyyy-MM-dd');
					}else {
						return "";
					}
	          	}
			},
			{
				sTitle: '结束时间',
				mData: 'endTime' ,
				bSortable: true,
				mRender:function(mData,type,full){
					if(mData != null){
						return new Date(mData).format('yyyy-MM-dd');
					}else {
						return "";
					}
				}
			}
		],
		orderIndex:8,
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
				url:'/admin/biz/ent-brand-pre/delete',
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
	

	// 添加LOGO图片
    function addLogo(){
    	var formData = new FormData($("#add-logo-form")[0]); 
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
					$('#add_logo_img').attr('src', 'http://oss.pabeitech.com/'+msg.map.attach.compressUrl);
	        		$('#add_logo_url').val('http://oss.pabeitech.com/'+msg.map.attach.compressUrl);
	        		window.setTimeout(query,1000);
	        	}else{
	        		layui.msg.error(msg.content);
	        	}
		    } 
		});
    }
	
	/*
	 * 编辑
	 */
    // 修改图片
    function editLogo(){
    	var formData = new FormData($("#edit-logo-form")[0]); 
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
					$('#edit_logo_url_img').attr('src', 'http://oss.pabeitech.com/'+msg.map.attach.compressUrl);
	        		$('#edit_logo_url').val('http://oss.pabeitech.com/'+msg.map.attach.compressUrl);
	        		window.setTimeout(query,1000);
	        	}else{
	        		layui.msg.error(msg.content);
	        	}
		    } 
		});
    }
	var addInit = function(validate,lindex){
		
		// 运营周期下拉
		//periodList();
		// 企业下拉
		//selectEnterpriseList();
		// 车区下拉
		//selectPreList();
		
		$('#ent-brand-pre-add-form select[name=entId]').html(enterpriseHtml);
		$('#ent-brand-pre-add-form select[name=period]').html(periodHtml);
		$('#ent-brand-pre-add-form select[name=strategyId]').html(strategyHtml);
		$('#ent-brand-pre-add-form select[name=preId]').html(preHtml);
		form.render('select');
		form.render('checkbox');
		// 添加图片的按钮绑定
		$("#add_logo_file").unbind("change").bind("change",addLogo);
		
		$('#ent-brand-pre-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		$('#ent-brand-pre-add-button').bind('click',function(){
        	if(validate.valid()){
				
				var entId = $('#ent-brand-pre-add-form select[name=entId]').val();
				var preId = $('#ent-brand-pre-add-form select[name=preId]').val();
				var period = $('#ent-brand-pre-add-form select[name=period]').val();
				var strategyId = $('#ent-brand-pre-add-form select[name=strategyId]').val();
				
				if(entId == 0){
					layui.msg.tips('请选择企业!');
					return;
				}
				if(preId == 0){
					layui.msg.tips('请选择车区!');
					return;
				}
				if(period == 0){
					layui.msg.tips('请选择运营周期!');
					return;
				}
				if(strategyId == 0){
					layui.msg.tips('请选择计费策略!');
					return;
				}
				$('#entName').val(entMap.get(entId));
				$('#preName').val(preMap.get(preId));
				$('#strategyName').val(strategyMap.get(strategyId));

        		layui.common.ajax({
        			url:'/admin/biz/ent-brand-pre/save',
        			data:$('#ent-brand-pre-add-form').serialize(),
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
    $('#add-button').bind('click',function(){
    	var param = new Object();
    	param.url = 'add.html';
    	param.title = '添加信息'; 
    	var valid = new Object();
    	valid.id = "ent-brand-pre-add-form";
    	valid.rules = {
			name: {
		 		required: true
		 	},
			applyCount: {
		 		required: true,
				digits: true
		 	},
		 	chargePrice: {
		 		required: true
		 	},
		 	chargeTime: {
				required: true,
				number:true
			},
			strategyDescription:{
		 		required: true,
		 		rangelength: [1,72]
		 	},
    	};
    	valid.messages = {
    		name: {
		 		required: "请填写品牌车区名称"
		 	},
			applyCount: {
				required: "请输入日上限",
				digits:'数量请输入整数'
			},
		 	chargePrice: {
		 		required: "请输入计费价格"
		 	},
		 	chargeTime: {
				required: "请输入计费时间",
				number:"请输入正确格式"
			},
			strategyDescription:{
		 		required: "请输入计费策略描述",
		 		rangelength: "文字长度必须是1~72之间"
		 	}
			
    	}; 
    	param.validate = valid;
    	param.width = 700;
    	param.init = addInit;
    	layui.common.modal(param);  
    });
	
	/**
	 * 启用
	 */
	$('#up-button').bind('click',function(){
		var list = datatable.selected(); 
		if(list.length<1){
			layui.msg.error('请至少选择一条记录');
			return false;
		}
		if(list[0].status == 1){
			layui.msg.error('该品牌车区已启用');
			return false;
		}
		layui.msg.confirm('确定启用？',function(){
			layui.common.ajax({
				url:'/admin/biz/ent-brand-pre/start',
				contentType:'application/json; charset=utf-8',
				data:JSON.stringify(list[0].id),
				success:function(res){
					if(res.success){  
						layui.msg.success(res.content);
						window.setTimeout(query,3000);
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
	 * 下线
	 */
	$('#down-button').bind('click',function(){
		var list = datatable.selected(); 
		if(list.length<1){
			layui.msg.error('请至少选择一条记录');
			return false;
		}
		if(list[0].status == 2){
			layui.msg.error('该品牌车区已禁用');
			return false;
		}
		layui.msg.confirm('确定要禁用？',function(){
			layui.common.ajax({
				url:'/admin/biz/ent-brand-pre/stop',
				contentType:'application/json; charset=utf-8',
				data:JSON.stringify(list[0].id),
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
	
    
    // 数据回显
    var pre_detail = function showData(id,callback){
    	layui.common.ajax({
			url:'/admin/biz/ent-brand-pre/detail',
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
    	// 计费系统
    	//billSystem();
    	$('#ent-brand-pre-edit-form select[name=preId]').html(preHtml);
		$('#ent-brand-pre-edit-form select[name=period]').html(periodHtml);
		$('#ent-brand-pre-edit-form select[name=strategyId]').html(strategyHtml);
		$('#ent-brand-pre-edit-form select[name=entId]').html(enterpriseHtml);
    	form.render('select');
    	// 详情
		/*pre_detail(datatable.selected()[0].id,function(data){
			var preDetail = data;  
    		layui.common.set({
    			id:'ent-brand-pre-edit-form',
    			data:preDetail
    		});
    		form.render('checkbox');
    		form.render('select');
    		// 图片显示
    		$("#edit_logo_url_img").attr('src',preDetail.logoUrl);
    	});
		*/
		var list = datatable.selected();  
		var preDetail = list[0];  
		layui.common.set({
			id:'ent-brand-pre-edit-form',
			data:preDetail
		});
		form.render('checkbox');
    	form.render('select');
		$("#edit_logo_url_img").attr('src',preDetail.logoUrl);
		
		// 添加图片的按钮绑定
		$("#edit_logo_url_file").unbind("change").bind("change",editLogo);
		
		$('#ent-brand-pre-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		$('#ent-brand-pre-edit-button').bind('click',function(){
        	if(validate.valid()){  
			
				var entId = $('#ent-brand-pre-edit-form select[name=entId]').val();
				var preId = $('#ent-brand-pre-edit-form select[name=preId]').val();
				var period = $('#ent-brand-pre-edit-form select[name=period]').val();
				var strategyId = $('#ent-brand-pre-edit-form select[name=strategyId]').val();
				
				if(entId == 0){
					layui.msg.tips('请选择企业!');
					return;
				}
				if(preId == 0){
					layui.msg.tips('请选择车区!');
					return;
				}
				if(period == 0){
					layui.msg.tips('请选择运营周期!');
					return;
				}
				if(strategyId == 0){
					layui.msg.tips('请选择计费策略!');
					return;
				}
				$('#entName').val(entMap.get(entId));
				$('#preName').val(preMap.get(preId));
				$('#strategyName').val(strategyMap.get(strategyId));
			
			
        		layui.common.ajax({
        			url:'/admin/biz/ent-brand-pre/update',
        			data:$('#ent-brand-pre-edit-form').serialize(),
        			success:function(res){
        				if(res.success){
        					layui.layer.close(lindex);
        					layui.msg.success(res.content);
        					window.setTimeout(function(){
        						location.reload(false);
        					},1000);
        				}else{
							layui.msg.error(res.content);
						}
        			} 
        		});
        	}
        });
	};
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
    	valid.id = "ent-brand-pre-edit-form";
    	valid.rules = {
			name: {
		 		required: true
		 	},
			applyCount: {
		 		required: true,
				digits: true
		 	},
		 	chargePrice: {
		 		required: true
		 	},
		 	chargeTime: {
				required: true,
				number:true
			},
			strategyDescription:{
		 		required: true,
		 		rangelength: [1,72]
		 	},
    	};
    	valid.messages = {
    		name: {
		 		required: "请填写品牌车区名称"
		 	},
			applyCount: {
				required: "请输入日上限",
				digits:'数量请输入整数'
			},
		 	chargePrice: {
		 		required: "请输入计费价格"
		 	},
		 	chargeTime: {
				required: "请输入计费时间",
				number:"请输入正确格式"
			},
			strategyDescription:{
		 		required: "请输入计费策略描述",
		 		rangelength: "文字长度必须是1~72之间"
		 	}
			
    	}; 
    	param.validate = valid;
    	param.width = 700;
    	param.init = editInit;
    	layui.common.modal(param);
	});
	
});