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
	var level = session.getItem('user-guide-tree-level'); 
	var selectedMenuId = session.getItem('user-guide-selected-id'); 
 	var treeClick = function(event, treeId, treeNode, clickFlag){
 		selectedMenuId = treeNode.id; 
 		level = treeNode.level;
 		session.setItem('user-guide-selected-id',selectedMenuId);
 		session.setItem('user-guide-tree-level',level); 
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
		url: "/admin/base/user_guide/tree",
		data:{time:new Date().getTime()},
		contentType:'application/json; charset=utf-8', 
		success: function(data) {
			tree = $.fn.zTree.init($("#user-guide-tree"), setting, data);
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
	  
	var addServerParams = function(data){  
		
		var filters = new Array();
		var filter = new Object();
		filter.property = 'parentId';
		filter.value = selectedMenuId;
		filters.push(filter);
		var searchTitle = $('#search-title').val();
		if(searchTitle!=''){
			filter = new Object();
			filter.property = 'title';
			filter.value = '%'+searchTitle +'%';
			filters.push(filter);
		} 
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
		if(filters.length>0){
			data.push({name:'filterJson',value:JSON.stringify({filters:filters})});
		}
	};
	var datatable = layui.datatable.init({
		id:'user-guide-table',
		url:'/admin/base/user_guide/list', 
		key:'id',
		columns:[
			{ sTitle: '标题',   mData: 'title'}, 
			{ sTitle: '英文标题',   mData: 'enTitle'}, 
			{ sTitle: '排序', bSortable: true,  mData: 'orderIndex'}, 
			{
				sTitle: '分类',
	          	mData: 'type' , 
	          	mRender:function(mData,type,full){
	          		var html = '<label style="color:green;">指南</label>';
	          		if(mData==0){
	          			html = '<label style="color:green;">栏目</label>';
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
		$.each(list,function(index,menu){
			ids.push(menu.id);
		});
		layui.msg.confirm('您确定要删除',function(){
			layui.common.ajax({
				url:'/admin/base/user_guide/delete',
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
		form.render('checkbox');
		form.render('select');  
		layui.common.set({
			id:'user-guide-add-form',
			data:{level:level,parentId:selectedMenuId}
		}); 
		$('#user-guide-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		$('#user-guide-add-button').bind('click',function(){
        	if(validate.valid()){  
        		layui.common.ajax({
        			url:'/admin/base/user_guide/save',
        			data:$('#user-guide-add-form').serialize(),
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
    	valid.id = "user-guide-add-form";
    	valid.rules = {
    		title:{
    			rangelength:[1,120] ,
    			required: true,
    			remote:{
    				url:"/admin/base/user_guide/check",  
    				data:{
    					property:"title",
    					value:function(){return $('#user-guide-add-form input[name=title]').val();},
    					parentId:function(){return $('#user-guide-add-form input[name=parentId]').val();},
    					id:function(){return new Date().getTime();}
    				}
    			}
    		},enTitle:{
    			rangelength:[1,120],
    			required: true
    		},orderIndex:{ 
    			digits:true,
    			required: true
    		} 
    	};
    	valid.messages = {
    		title:{
    			rangelength:'标题长度应在[1,120]内', 
    			required: '请填写标题',
    			remote:'当前栏目下标题已经存在'
    		},enTitle:{
    			rangelength:'英文标题长度应在[1,120]内', 
    			required: '请填写英文标题' 
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
		var list = datatable.selected();   
		layui.common.set({
			id:'user-guide-edit-form',
			data:list[0]
		}); 
		form.render('checkbox');
		form.render('select');
		$('#user-guide-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		$('#user-guide-update-button').bind('click',function(){
        	if(validate.valid()){  
        		layui.common.ajax({
        			url:'/admin/base/user_guide/update',
        			data:$('#user-guide-edit-form').serialize(),
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
    	valid.id = "user-guide-edit-form";
    	valid.rules = {
    		title:{
    			rangelength:[1,120] ,
    			required: true,
    			remote:{
    				url:"/admin/base/user_guide/check",  
    				data:{
    					property:"title",
    					value:function(){return $('#user-guide-edit-form input[name=title]').val();},
    					parentId:function(){return $('#user-guide-edit-form input[name=parentId]').val();},
    					id:function(){return $('#user-guide-edit-form input[name=id]').val();}
    				}
    			}
    		},enTitle:{
    			rangelength:[1,120],
    			required: true
    		} ,orderIndex:{ 
    			digits:true,
    			required: true
    		} 
    	};
    	valid.messages = {
    		title:{
    			rangelength:'标题长度应在[1,120]内', 
    			required: '请填写标题',
    			remote:'当前栏目下标题已经存在'
    		} ,enTitle:{
    			rangelength:'英文标题长度应在[1,120]内', 
    			required: '请填写英文标题' 
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