layui.config({
	base: '/js/lib/'
}).extend({ 
	msg:'msg',
	common:'common',
	ztree:'ztree',
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
layui.use(['layer','msg','form', 'common','validate','datatable','laydate','ztree'], function() {
	var validate = layui.validate;
	var session = window.sessionStorage;
	var layer = layui.layer;  
	var $ = layui.jquery; 
	var form = layui.form;  
	var selectedPageId = null; 
	var level = 0;
	var lastNode = null;
 	var treeClick = function(event, treeId, treeNode, clickFlag){ 
 		level = treeNode.level;
 		if(level==2){
 			selectedPageId = treeNode.id; 
 			lastNode  = treeNode;
 			query();
 		} else{
 			tree.selectNode(lastNode);  
 			layui.msg.error('请选择第三组页面树');
 			return true;
 		}
	};
	var setting = {
		data: {
			simpleData: {
				enable: true
			}
		},
		callback: {
			onClick: treeClick
		}
	};
	var tree = null;
	layui.common.ajax({
		url: "/admin/security/element/tree",
		data:{time:new Date().getTime()},
		contentType:'application/json; charset=utf-8', 
		success: function(data) {
			tree = $.fn.zTree.init($("#element-tree"), setting, data);
			var nodes = tree.getNodes(); 
			if(nodes[0].children!=null&&nodes[0].children[0].children!=null){
				tree.selectNode(nodes[0].children[0].children[0]); 
				selectedPageId = nodes[0].children[0].children[0].id; 
				lastNode = nodes[0].children[0].children[0];
				query();
			} 
		},
		error:function(){}
	});
	
	//处理接口
	var categoryList = null;
	var categoryMap = layui.common.map();
	var clazzList = null;
	var clazzMap = layui.common.map();
	var interfaceList = null;
	var interfaceMap = layui.common.map();
	var init = function(){
		$.each(categoryList,function(index,data){
			data.clazzList = new Array();
			categoryMap.put(data.id,data);
		});
		var category = null;
		$.each(clazzList,function(index,data){
			category = categoryMap.get(data.packageId);
			if(category!=null){
				category.clazzList.push(data);
				categoryMap.put(data.packageId,category);
			}
			data.interfaceList = new Array();
			clazzMap.put(data.id,data);
		});
		var clazz = null;
		$.each(interfaceList,function(index,data){
			clazz = clazzMap.get(data.clazzId,data);
			if(clazz!=null){
				clazz.interfaceList.push(data);
				clazzMap.put(data.clazzId,data);
			}
			interfaceMap.put(data.id,data);
		});
	};
	layui.common.ajax({
		url: "/admin/security/element/map",
		data:{time:new Date().getTime()}, 
		success: function(data) {
			categoryList = data.category;
			clazzList = data.clazz;
			interfaceList = data.interface;
			init();
		},
		error:function(){}
	});
	
	
	var buildSelect =  function(list){
		var html = '';
		$.each(list,function(index,data){
			html += '<option value="'+data.id+'">';
			html += data.name;
			html += '</option>';
		});
		return html;
	}; 
	var addServerParams = function(data){  
		var searchName = $('#search-name').val();
		var filters = new Array();
		var filter = new Object();
		filter.property = 'pageId';
		filter.value = selectedPageId;
		filters.push(filter);
		if(searchName!=''){
			filter = new Object();
			filter.property = 'name';
			filter.value = '%'+searchName +'%';
			filters.push(filter);
		} 
		var searchStatus = $('#search-status').val();
		if(searchStatus!='-1'){
			filter = new Object();
			filter.property = 'status';
			filter.value = searchStatus;
			filters.push(filter);
		}
		if(filters.length>0){
			data.push({name:'filterJson',value:JSON.stringify({filters:filters})});
		}
	};
	var datatable = layui.datatable.init({
		id:'element-table',
		url:'/admin/security/element/list', 
		key:'id',
		columns:[
			{ sTitle: '名称',   mData: 'name'}, 
			{ sTitle: '标签名',   mData: 'labelName'}, 
			{ sTitle: '标签ID',   mData: 'labelId'}, 
			{
				sTitle: '接口',
	          	mData: 'interfaceId' , 
	          	mRender:function(mData,type,full){
	          		var html = '未设置';
	          		var inter = interfaceMap.get(mData);
	          		var clazz = null;
	          		if(inter!=null){
	          			html =  inter.name;
	          			clazz = clazzMap.get(inter.clazzId);
	          		}
	          		var category = null;
	          		if(clazz!=null){
	          			html = clazz.name+'-'+html;
	          			category = categoryMap.get(clazz.packageId);
	          		} 
	          		if(category!=null){
	          			html = category.name + '-'+html
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
	          		if(mData==1){
	          			html += '<label style="color:green;">启用</label>';
	          		}else if(mData==0){
	          			html += '<label style="color:red;">禁用</label>';
	          		}
	          		return html;
	          	}
			},
			{
				sTitle: '创建时间',
	          	mData: 'createTime' ,
	          	bSortable: true,
	          	mRender:function(mData,type,full){
	          		 return new Date(mData).format('yyyy-MM-dd hh:mm');
	          	}
			} 
		],
		orderIndex:6,
		orderType:'desc',
		filter:addServerParams
	});  
	
	var query =  function(){
		datatable.reload();
		
	} ;  
	$('.search_btn').bind('click',function(){
		query();
	});  
	 
	$('#delete-button').bind('click',function(){
		var list = datatable.selected(); 
		if(list.length<1){
			layui.msg.error('请至少选择一条记录');
			return false;
		}
		var ids = new Array();
		$.each(list,function(index,element){
			ids.push(element.id);
		});
		layui.msg.confirm('您确定要删除',function(){
			layui.common.ajax({
				url:'/admin/security/element/delete',
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
	});
	
	var addInit = function(validate,lindex){  
		var html = '<option value="0">请选择类分组</option>';
		html += buildSelect(categoryList);
		$('#element-add-form select[name=categoryId]').html(html); 
		layui.common.set({
			id:'element-add-form',
			data:{pageId:selectedPageId}
		});
		form.render('checkbox');
		form.render('select');
		form.on('select(categoryId)', function(data) {
			var categoryId = data.value; 
			var category = categoryMap.get(categoryId); 
			var html = '<option value="0">请选择接口类</option>';
			if(category!=null){
				html += buildSelect(category.clazzList);
			}  
			$('#element-add-form select[name=clazzId]').html(html);
			form.render('select'); 
			html = '<option value="0">请选择接口</option>';
			$('#element-add-form select[name=interfaceId]').html(html);
			form.render('select'); 
        });
		form.on('select(clazzId)', function(data) {
			var clazzId = data.value; 
			var clazz = clazzMap.get(clazzId); 
			var html = '<option value="0">请选择接口</option>';
			if(clazz!=null){
				html += buildSelect(clazz.interfaceList);
			}  
			$('#element-add-form select[name=interfaceId]').html(html);
			form.render('select'); 
        });
		$('#element-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		$('#element-add-button').bind('click',function(){
        	if(validate.valid()){  
        		layui.common.ajax({
        			url:'/admin/security/element/save',
        			data:$('#element-add-form').serialize(),
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
    	valid.id = "element-add-form";
    	valid.rules = {
    		name:{
    			rangelength:[1,32] ,
    			required: true,
    			remote:{
    				url:"/admin/security/element/check",  
    				data:{
    					property:"name",
    					value:function(){return $('#element-add-form input[name=name]').val();},
    					pageId:function(){return $('#element-add-form input[name=pageId]').val();},
    					id:function(){return new Date().getTime();}
    				}
    			}
    		},labelName:{
    			rangelength:[1,10] ,
    			required: true 
    		},labelId:{
    			rangelength:[1,32] ,
    			required: true,
    			remote:{
    				url:"/admin/security/element/check",  
    				data:{
    					property:"label_id",
    					value:function(){return $('#element-add-form input[name=labelId]').val();},
    					clazzId:function(){return $('#element-add-form input[name=pageId]').val();},
    					id:function(){return new Date().getTime();}
    				}
    			}
    		}
    	};
    	valid.messages = {
    		name:{
    			rangelength:'名称长度应在[1,32]内', 
    			required: '请填写名称',
    			remote:'名称已经存在'
    		},labelName:{
    			rangelength:'标签名长度在[1,10]范围内' ,
    			required: '请填写 标签名' 
    		},labelId:{
    			rangelength:'标签ID应该在[1,32]内',  
    			required: '请填写标签ID',
    			remote:'标签ID已经存在'
    		} 
    	}; 
    	param.validate = valid;
    	param.width = 750;
    	param.init = addInit;
    	layui.common.modal(param);  
    });
    
    
    var editInit = function(validate,lindex){  
		var list = datatable.selected();  
		var html = '<option value="0">请选择类分组</option>';
		html += buildSelect(categoryList);
		$('#element-edit-form select[name=categoryId]').html(html); 
		if(list[0].interfaceId!=null){
			var inter = interfaceMap.get( list[0].interfaceId);
			if(inter!=null){
				var clazz = clazzMap.get(inter.clazzId);
				html = '<option value="0">请选择接口</option>';
				html += buildSelect(clazz.interfaceList);
				$('#element-edit-form select[name=interfaceId]').html(html); 
				var category = categoryMap.get(clazz.packageId);
				html = '<option value="0">请选择接口类</option>';
				html += buildSelect(category.clazzList);
				$('#element-edit-form select[name=clazzId]').html(html); 
				list[0].categoryId = clazz.packageId;
				list[0].clazzId = clazz.id;
			} 
		}
		 
		layui.common.set({
			id:'element-edit-form',
			data:list[0]
		});
		form.render('checkbox');
		form.render('select');
		form.on('select(categoryId)', function(data) {
			var categoryId = data.value; 
			var category = categoryMap.get(categoryId); 
			var html = '<option value="0">请选择接口类</option>';
			if(category!=null){
				html += buildSelect(category.clazzList);
			}  
			$('#element-edit-form select[name=clazzId]').html(html);
			form.render('select'); 
			html = '<option value="0">请选择接口</option>';
			$('#element-edit-form select[name=interfaceId]').html(html);
			form.render('select'); 
        });
		form.on('select(clazzId)', function(data) {
			var clazzId = data.value; 
			var clazz = clazzMap.get(clazzId); 
			var html = '<option value="0">请选择接口</option>';
			if(clazz!=null){
				html += buildSelect(clazz.interfaceList);
			}  
			$('#element-edit-form select[name=interfaceId]').html(html);
			form.render('select'); 
        });
		$('#element-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		$('#element-update-button').bind('click',function(){
        	if(validate.valid()){  
        		layui.common.ajax({
        			url:'/admin/security/element/update',
        			data:$('#element-edit-form').serialize(),
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
    $('#edit-button').bind('click',function(){
    	var list = datatable.selected(); 
		if(list.length!=1){
			layui.msg.error('请选择一条记录进行编辑');
			return false;
		}
    	var param = new Object();
    	param.url = 'edit.html';
    	param.title = '编辑信息'; 
    	var valid = new Object();
    	valid.id = "element-edit-form"; 
    	valid.rules = {
    		name:{
    			rangelength:[1,32] ,
    			required: true,
    			remote:{
    				url:"/admin/security/element/check",  
    				data:{
    					property:"name",
    					value:function(){return $('#element-edit-form input[name=name]').val();},
    					pageId:function(){return $('#element-edit-form input[name=pageId]').val();},
    					id:function(){return $('#element-edit-form input[name=id]').val();}
    				}
    			}
    		},labelName:{
    			rangelength:[1,10] ,
    			required: true 
    		},labelId:{
    			rangelength:[1,32] ,
    			required: true,
    			remote:{
    				url:"/admin/security/element/check",  
    				data:{
    					property:"label_id",
    					value:function(){return $('#element-edit-form input[name=labelId]').val();},
    					clazzId:function(){return $('#element-edit-form input[name=pageId]').val();},
    					id:function(){return $('#element-edit-form input[name=id]').val();}
    				}
    			}
    		}
    	};
    	valid.messages = {
    		name:{
    			rangelength:'名称长度应在[1,32]内', 
    			required: '请填写名称',
    			remote:'名称已经存在'
    		},labelName:{
    			rangelength:'标签名长度在[1,10]范围内' ,
    			required: '请填写 标签名' 
    		},labelId:{
    			rangelength:'标签ID应该在[1,32]内',  
    			required: '请填写标签ID',
    			remote:'标签ID已经存在'
    		} 
    	}; 
    	param.validate = valid;
    	param.width = 750;
    	param.init = editInit;
    	layui.common.modal(param);  
    });
});