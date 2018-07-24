layui.config({
	base: '/web/js/lib/'
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
	var level = session.getItem('menu-tree-level'); 
	var selectedMenuId = session.getItem('menu-selected-id'); 
 	var treeClick = function(event, treeId, treeNode, clickFlag){
 		selectedMenuId = treeNode.id; 
 		level = treeNode.level;
 		session.setItem('menu-selected-id',selectedMenuId);
 		session.setItem('menu-tree-level',level); 
		query();
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
		url: "/admin/security/menu/tree",
		data:{time:new Date().getTime()},
		contentType:'application/json; charset=utf-8', 
		success: function(data) {
			tree = $.fn.zTree.init($("#menu-tree"), setting, data);
			var nodes = tree.getNodes();
			if(selectedMenuId!=null){
				nodes = tree.getNodesByParam("id",selectedMenuId,null); 
			}
			tree.selectNode(nodes[0]); 
			selectedMenuId = nodes[0].id; 
			level = nodes[0].level;
			query();
		},
		error:function(){}
	});
	
	var categoryList = null;
	var pageList = null;
	var categoryMap = layui.common.map();
	var pageMap = layui.common.map();
	var init = function(){
		$.each(categoryList,function(index,category){
			category.pageList = new Array();
			categoryMap.put(category.id,category);
		});
		var category = null;
		$.each(pageList,function(index,page){
			category = categoryMap.get(page.categoryId);
			if(category!=null){
				category.pageList.push(page);
				categoryMap.put(category.id,category);
			}
			pageMap.put(page.id,page);
		});
		
	};
	var buildSelect = function(list){
		var html = '';
		$.each(list,function(index,data){
			html += '<option value="'+data.id+'">';
			html += data.name;
			html += '</option>';
		});
		return html;
	};
	layui.common.ajax({
		url: "/admin/security/menu/map",
		data:{time:new Date().getTime()}, 
		success: function(data) {
			categoryList = data.category;
			pageList = data.page 
			init();
		},
		error:function(){}
	});
	
	var addServerParams = function(data){  
		var searchName = $('#search-name').val();
		var filters = new Array();
		var filter = new Object();
		filter.property = 'parentId';
		filter.value = selectedMenuId;
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
		id:'menu-table',
		url:'/admin/security/menu/list', 
		key:'id',
		columns:[
			{ sTitle: '名称',   mData: 'name'}, 
			{ sTitle: '样式',   mData: 'icon'}, 
			{ sTitle: '排序', bSortable: true,  mData: 'orderIndex'}, 
			{
				sTitle: '页面',
	          	mData: 'pageId' , 
	          	mRender:function(mData,type,full){
	          		var html = '';
	          		if(mData==0||mData==null){
	          			html += '<label style="color:green;">未设置</label>';
	          		}else{
	          			var page = pageMap.get(mData);
	          			
	          			html += '<label style="color:blue;">';
	          			if(page!=null){
	          				var category = categoryMap.get(page.categoryId);
	          				if(category!=null){
	          					html += category.name;
	          					html += '-';
	          				}
	          				html += page.name;
	          			}
	          			html += '</label>';
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
		orderIndex:5,
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
		$.each(list,function(index,menu){
			ids.push(menu.id);
		});
		layui.msg.confirm('您确定要删除',function(){
			layui.common.ajax({
				url:'/admin/security/menu/delete',
				data:JSON.stringify(ids),
				contentType:'application/json; charset=utf-8',
				success:function(res){
					if(res.success){  
						layui.msg.success(res.content);
						window.setTimeout(function(){
    						location.reload(false);
    					},1000);
					}else{
						layui.msg.error(res.content);
					}
					
				},error:function(){
					
				}
			});
		}); 
	});
	
	var addInit = function(validate,lindex){    
		var html = '<option value="0">请选择页面分类</option>';
		html += buildSelect(categoryList);
		$('#menu-add-form select[name=categoryId]').html(html);  
		form.render('checkbox');
		form.render('select');
		form.on('select(categoryId)', function(data) {
			var categoryId = data.value; 
			var category = categoryMap.get(categoryId); 
			var html = '<option value="0">请选择接口类</option>';
			if(category!=null){
				html += buildSelect(category.pageList);
			}  
			$('#menu-add-form select[name=pageId]').html(html);
			form.render('select');  
        }); 
		
		layui.common.set({
			id:'menu-add-form',
			data:{level:level,parentId:selectedMenuId}
		});
		form.render('checkbox');
		$('#menu-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		$('#menu-add-button').bind('click',function(){
        	if(validate.valid()){  
        		layui.common.ajax({
        			url:'/admin/security/menu/save',
        			data:$('#menu-add-form').serialize(),
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
	
    $('#add-button').bind('click',function(){
    	var param = new Object();
    	param.url = 'add.html';
    	param.title = '添加信息'; 
    	var valid = new Object();
    	valid.id = "menu-add-form";
    	valid.rules = {
    		name:{
    			rangelength:[1,32] ,
    			required: true,
    			remote:{
    				url:"/admin/security/menu/check",  
    				data:{
    					property:"name",
    					value:function(){return $('#menu-add-form input[name=name]').val();},
    					id:function(){return new Date().getTime();}
    				}
    			}
    		},icon:{
    			rangelength:[1,32],  
    			required: true
    			
    		},orderIndex:{ 
    			digits:true,
    			required: true
    		} 
    	};
    	valid.messages = {
    		name:{
    			rangelength:'名称长度应在[1,32]内', 
    			required: '请填写名称',
    			remote:'名称已经存在'
    		},icon:{
    			rangelength:'样式名长度应该在[1,32]内',  
    			required: '请填写样式名'
    		},orderIndex:{ 
    			digits:'排序请输入整数',
    			required: '请填写排序号'
    		} 
    	}; 
    	param.validate = valid;
    	param.width = 600;
    	param.init = addInit;
    	layui.common.modal(param);  
    });
    
    
    var editInit = function(validate,lindex){ 
    	var html = '<option value="0">请选择页面分类</option>';
		html += buildSelect(categoryList);
		$('#menu-edit-form select[name=categoryId]').html(html);   
		form.on('select(categoryId)', function(data) {
			var categoryId = data.value; 
			var category = categoryMap.get(categoryId); 
			var html = '<option value="0">请选择接口类</option>';
			if(category!=null){
				html += buildSelect(category.pageList);
			}  
			$('#menu-edit-form select[name=pageId]').html(html);
			form.render('select');  
        }); 
    	
    	
		var list = datatable.selected();  
		if(list[0].pageId!=null){
			var page = pageMap.get(list[0].pageId);
			if(page!=null){
				list[0].categoryId = page.categoryId;
				var category = categoryMap.get(page.categoryId);
				if(category!=null&&category.pageList!=null){
					var html = '<option value="0">请选择接口类</option>';
					html += buildSelect(category.pageList);
					$('#menu-edit-form select[name=pageId]').html(html); 
				}
			}
		}
		layui.common.set({
			id:'menu-edit-form',
			data:list[0]
		});
		$('#menu-edit-form input[name=id]').val(list[0].id);
		form.render('checkbox');
		form.render('select');
		$('#menu-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		$('#menu-update-button').bind('click',function(){
        	if(validate.valid()){  
        		layui.common.ajax({
        			url:'/admin/security/menu/update',
        			data:$('#menu-edit-form').serialize(),
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
    	valid.id = "menu-edit-form";
    	valid.rules = {
    		name:{
    			rangelength:[1,32] ,
    			required: true,
    			remote:{
    				url:"/admin/security/menu/check",  
    				data:{
    					property:"name",
    					value:function(){return $('#menu-edit-form input[name=name]').val();},
    					id:function(){return $('#menu-edit-form input[name=id]').val();}
    				}
    			}
    		},icon:{
    			rangelength:[1,32],  
    			required: true
    			
    		},orderIndex:{ 
    			digits:true,
    			required: true
    		} 
    	};
    	valid.messages = {
    		name:{
    			rangelength:'名称长度应在[1,32]内', 
    			required: '请填写名称',
    			remote:'名称已经存在'
    		},icon:{
    			rangelength:'样式名长度应该在[1,32]内',  
    			required: '请填写样式名'
    		},orderIndex:{ 
    			digits:'排序请输入整数',
    			required: '请填写排序号'
    		} 
    	}; 
    	param.validate = valid;
    	param.width = 600;
    	param.init = editInit;
    	layui.common.modal(param);  
    });
});