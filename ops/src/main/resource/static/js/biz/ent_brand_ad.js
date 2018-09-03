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
	var preMap = layui.common.map();
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
			enterpriseHtml = '<option value="0"></option>';
			$.each(list,function(index,ent){
				enterpriseHtml += '<option value="'+ent.id+'">';
				enterpriseHtml += ent.name;
				enterpriseHtml += '</option>';
				entMap.put(ent.id,ent.name);
			});
		},error:function(){
		}
	});
	
	form.on('select(entId)', function(data) {
		var entId = data.value;
		tempList(entId);
	});
	
	
	function tempList(entId){
		var tempHtml = '';
		layui.common.ajax({
			url:'/admin/biz/ent-brand-ad/temp-list?entId='+ entId,
			//data:JSON.stringify(cityId),
			contentType:'application/json; charset=utf-8',
			async:false,
			success:function(list){
				tempHtml = '<option value="0">请选择</option>';
				$.each(list,function(index,pre){
					tempHtml += '<option value="'+pre.id+'">';
					tempHtml += pre.name;
					tempHtml += '</option>';
				});
				$('#templateId').html(tempHtml);
				form.render('select');
			},error:function(){
			}
		});
	}
	
	// 城市
	var cityHtml = '';
	function initCityList(){
		cityHtml = '';
		cityHtml += '<div class="layui-input-block">';
		cityHtml += '<div id="city-list-div">';
		layui.common.ajax({
			url:'/admin/biz/prefecture/city_list',
			async:false,
			success:function(list){
				$.each(list,function(index,city){
					cityHtml += '<input type="checkbox" lay-skin="primary" name="cityId" value="'+city.id+'" title="'+city.cityName+'">';
				});
				cityHtml +='</div>';
			},error:function(){
				
			}
		});
		cityHtml += '</div></div>';
		$('#city').html(cityHtml);
	}
	
	// 城市
	var cityPreHtml = '';
	function initPreList(){
		cityPreHtml = '';
		cityPreHtml += '<div class="layui-input-block">';
		cityPreHtml += '<div id="pre-list-div">';
		layui.common.ajax({
			url:'/admin/biz/ent-brand-pre/pre-list',
			async:false,
			success:function(list){
				$.each(list,function(index,pre){
					cityPreHtml += '<input type="checkbox" lay-skin="primary" name="preId" value="'+pre.id+'" title="'+pre.name+'">';
				});
				cityPreHtml +='</div>';
			},error:function(){
			}
		});
		cityPreHtml += '</div></div>';
		$('#pre').html(cityPreHtml);
	}

	var addServerParams = function(data){  
		var filters = new Array();
		var filter = null; 
		var searchStatus = $('#search-status').val();
		
		var searchName = $('#search-name').val();
		if(searchName!=''){
			filter = new Object();
			filter.property = 'entName';
			filter.value = '%'+searchName +'%';
			filters.push(filter);
		} 
		
		if(filters.length>0){
			data.push({name:'filterJson',value:JSON.stringify({filters:filters})});
		}
	};
	var datatable = layui.datatable.init({
		id:'ad-table',
		url:'/admin/biz/ent-brand-ad/list', 
		key:'id',
		columns:[ 
			{ sTitle: '企业名称',   mData: 'entId',
				mRender:function(mData,type,full){ 
	          		return entMap.get(mData);
	          	}
			},
			{ sTitle: '适用城市',   mData: 'cityName' },
			{ sTitle: '日限量',   mData: 'applyCount' },
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
				sTitle: '开屏展示',
	          	mData: 'screen' , 
	          	mRender:function(mData,type,full){
	          		var html = '';
	          		switch(mData){
	          			case 0:html += '<label style="color:gray;">否</label>';break;
	          			case 1:html += '<label style="color:green;">是</label>';break;
	          		}
	          		return html;
	          	}
			},
			{
				sTitle: '是否显示广告',
	          	mData: 'adStatus' , 
	          	mRender:function(mData,type,full){
	          		var html = '';
	          		switch(mData){
	          			case 0:html += '<label style="color:gray;">否</label>';break;
	          			case 1:html += '<label style="color:green;">是</label>';break;
	          		}
	          		return html;
	          	}
			},
			{
				sTitle: '创建时间',
	          	mData: 'createTime' ,
	          	bSortable: true,
	          	mRender:function(mData,type,full){
	          		 return new Date(mData).format('yyyy-MM-dd');
	          	}
			}
		],
		orderIndex:4,
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
				url:'/admin/biz/ent-brand-ad/delete',
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
    function addViewImage(){
    	var formData = new FormData($("#add-view-image-form")[0]); 
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
					$('#add_view_image').attr('src', 'http://oss.pabeitech.com/'+msg.map.attach.compressUrl);
	        		$('#viewImage').val('http://oss.pabeitech.com/'+msg.map.attach.compressUrl);
	        		window.setTimeout(query,1000);
	        	}else{
	        		layui.msg.error(msg.content);
	        	}
		    } 
		});
    }

	var addInit = function(validate,lindex){
		
		// 企业下拉
		//selectEnterpriseList();
		// 车区下拉
		//selectPreList();
		initCityList();
		//initPreList();
		$('#ent-brand-ad-add-form select[name=entId]').html(enterpriseHtml);
		form.render('select');
		form.render('checkbox');
		// 添加图片的按钮绑定
		$("#add_view_image_file").unbind("change").bind("change",addViewImage);
		
		$('#ent-brand-ad-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		$('#ent-brand-ad-add-button').bind('click',function(){
        	if(validate.valid()){
				
				var entId = $('#ent-brand-ad-add-form select[name=entId]').val();
				
				if(entId == 0){
					layui.msg.tips('请选择企业!');
					return;
				}
				
				$('#entName').val(entMap.get(entId));
				
				var checked = $('#city-list-div input[name="cityId"]:checked');
				if(checked.length == 0){
					layui.msg.tips('请选择适用城市!');
					return;
				}
				
				var cityIds = '';
				$.each(checked,function(index,ch){
					cityIds += ',';
					cityIds += ch.value;
				});
				$("#cityIds").val(cityIds.substring(1));
				
				/*
				var preChecked = $('#pre-list-div input[name="preId"]:checked');
				if(preChecked.length == 0){
					layui.msg.tips('请选择适用车区!');
					return;
				}
				var preIds = '';
				$.each(preChecked,function(index,ch){
					preIds += ',';
					preIds += ch.value;
				});
				$("#preIds").val(preIds.substring(1));
				*/
        		layui.common.ajax({
        			url:'/admin/biz/ent-brand-ad/save',
        			data:$('#ent-brand-ad-add-form').serialize(),
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
    	valid.id = "ent-brand-ad-add-form";
    	valid.rules = {
			applyCount: {
		 		required: true,
				digits: true
		 	}
		 	
    	};
    	valid.messages = {
			applyCount: {
				required: "请输入日上限",
				digits:'数量请输入整数'
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
    // 修改图片
    function editViewImage(){
    	var formData = new FormData($("#edit-view-image-form")[0]); 
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
					$('#edit_view_image').attr('src', 'http://oss.pabeitech.com/'+msg.map.attach.compressUrl);
	        		$('#viewImage').val('http://oss.pabeitech.com/'+msg.map.attach.compressUrl);
	        		window.setTimeout(query,1000);
	        	}else{
	        		layui.msg.error(msg.content);
	        	}
		    } 
		});
    }
	
	/**
	 * 启用
	 */
	$('#up-button').bind('click',function(){
		var list = datatable.selected(); 
		if(list.length>1){
			layui.msg.error('请选择一条记录');
			return false;
		}
		if(list[0].status == 1){
			layui.msg.error('该品牌广告已启用');
			return false;
		}
		layui.msg.confirm('确定启用？',function(){
			layui.common.ajax({
				url:'/admin/biz/ent-brand-ad/start',
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
		if(list.length>1){
			layui.msg.error('请选择一条记录');
			return false;
		}
		if(list[0].status == 2){
			layui.msg.error('该品牌广告已禁用');
			return false;
		}
		layui.msg.confirm('确定要禁用？',function(){
			layui.common.ajax({
				url:'/admin/biz/ent-brand-ad/stop',
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
			url:'/admin/biz/ent-brand-ad/detail',
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
		$('#ent-brand-ad-edit-form select[name=entId]').html(enterpriseHtml);
    	// 详情
		
		var list = datatable.selected();  	
		tempList(list[0].entId);		
		layui.common.set({
			id:'ent-brand-ad-edit-form',
			data:list[0]
		});
		
		form.render('checkbox'); 
    	form.render('select');
		$("#edit_view_image").attr('src',list[0].viewImage);
		// 添加图片的按钮绑定
		$("#edit_view_image_file").unbind("change").bind("change",editViewImage);
		
		$('#ent-brand-ad-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		$('#ent-brand-ad-edit-button').bind('click',function(){
        	if(validate.valid()){  
			
				var entId = $('#ent-brand-ad-edit-form select[name=entId]').val();
				
				if(entId == 0){
					layui.msg.tips('请选择企业!');
					return;
				}
				
				$('#entName').val(entMap.get(entId));
			
        		layui.common.ajax({
        			url:'/admin/biz/ent-brand-ad/update',
        			data:$('#ent-brand-ad-edit-form').serialize(),
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
    	valid.id = "ent-brand-ad-edit-form";
    	valid.rules = {
			applyCount: {
		 		required: true,
				digits: true
		 	}
    	};
    	valid.messages = {
    		
			applyCount: {
				required: "请输入日上限",
				digits:'数量请输入整数'
			}
    	}; 
    	param.validate = valid;
    	param.width = 700;
    	param.init = editInit;
    	layui.common.modal(param);
	});
	
});