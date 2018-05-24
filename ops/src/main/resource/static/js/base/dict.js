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
	var layer = layui.layer;  
	var $ = layui.jquery; 
	var form = layui.form;  
	var selectedGroupId = null;
 	var treeClick = function(event, treeId, treeNode, clickFlag){
 		selectedGroupId = treeNode.id;   
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
		url: "/admin/base/dict/tree",
		data:{time:new Date().getTime()},
		contentType:'application/json; charset=utf-8', 
		success: function(data) {
			tree = $.fn.zTree.init($("#dict-tree"), setting, data);
			var nodes = tree.getNodes(); 
			if(nodes[0].children!=null){
				tree.selectNode(nodes[0].children[0]); 
				selectedGroupId = nodes[0].children[0].id; 
				query();
			}
			
		},
		error:function(){}
	});
	
	
	var addServerParams = function(data){  
		var searchName = $('#search-name').val();
		var filters = new Array();
		var filter = new Object();
		filter.property = 'groupId';
		filter.value = selectedGroupId;
		filters.push(filter);
		if(searchName!=''){
			filter = new Object();
			filter.property = 'name';
			filter.value = '%'+searchName +'%';
			filters.push(filter);
		} 
		var searchCode = $('#search-code').val();
		if(searchCode!=''){
			filter = new Object();
			filter.property = 'code';
			filter.value = searchCode;
			filters.push(filter);
		}
		if(filters.length>0){
			data.push({name:'filterJson',value:JSON.stringify({filters:filters})});
		}
	};
	var datatable = layui.datatable.init({
		id:'dict-table',
		url:'/admin/base/dict/list', 
		key:'id',
		columns:[
			{ sTitle: '名称',   mData: 'name'}, 
			{ sTitle: '编码',   mData: 'code'}, 
			{ sTitle: '扩展',   mData: 'extra'},  
			{ sTitle: '排序', bSortable: true,  mData: 'orderIndex'},  
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
		$.each(list,function(index,interface){
			ids.push(interface.id);
		});
		layui.msg.confirm('您确定要删除',function(){
			layui.common.ajax({
				url:'/admin/base/dict/delete',
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
		layui.common.set({
			id:'dict-add-form',
			data:{groupId:selectedGroupId}
		});
		form.render('checkbox');
		$('#dict-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		$('#dict-add-button').bind('click',function(){
        	if(validate.valid()){  
        		layui.common.ajax({
        			url:'/admin/base/dict/save',
        			data:$('#dict-add-form').serialize(),
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
    	valid.id = "dict-add-form";
    	valid.rules = {
    		name:{
    			rangelength:[1,32] ,
    			required: true,
    			remote:{
    				url:"/admin/base/dict/check",  
    				data:{
    					property:"name",
    					value:function(){return $('#dict-add-form input[name=name]').val();},
    					groupId:function(){return $('#dict-add-form input[name=groupId]').val();},
    					id:function(){return new Date().getTime();}
    				}
    			}
    		},code:{
    			rangelength:[1,120] ,
    			required: true,
    			remote:{
    				url:"/admin/base/dict/check",  
    				data:{
    					property:"code",
    					value:function(){return $('#dict-add-form input[name=path]').val();},
    					groupId:function(){return $('#dict-add-form input[name=groupId]').val();},
    					id:function(){return new Date().getTime();}
    				}
    			}
    		},extra:{
    			digits:true,
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
    		},code:{
    			rangelength:'编码长度应该在[1,120]内',  
    			required: '请填写编码',
    			remote:'编码已经存在'
    		} ,extra:{ 
    			digits:'扩展请输入整数',
    			required: '请填写扩展'
    		} ,orderIndex:{ 
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
			id:'dict-edit-form',
			data:list[0]
		});
		form.render('checkbox');
		$('#dict-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		$('#dict-update-button').bind('click',function(){
        	if(validate.valid()){  
        		layui.common.ajax({
        			url:'/admin/base/dict/update',
        			data:$('#dict-edit-form').serialize(),
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
    	valid.id = "dict-edit-form"; 
    	valid.rules = {
    		name:{
    			rangelength:[1,32] ,
    			required: true,
    			remote:{
    				url:"/admin/base/dict/check",  
    				data:{
    					property:"name",
    					value:function(){return $('#dict-edit-form input[name=name]').val();},
    					groupId:function(){return $('#dict-edit-form input[name=groupId]').val();},
    					id:function(){return $('#dict-edit-form input[name=id]').val();}
    				}
    			}
    		},code:{
    			rangelength:[1,120] ,
    			required: true,
    			remote:{
    				url:"/admin/base/dict/check",  
    				data:{
    					property:"code",
    					value:function(){return $('#dict-edit-form input[name=path]').val();},
    					groupId:function(){return $('#dict-edit-form input[name=groupId]').val();},
    					id:function(){return $('#dict-edit-form input[name=id]').val();}
    				}
    			}
    		},extra:{
    			digits:true,
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
    		},code:{
    			rangelength:'编码长度应该在[1,120]内',  
    			required: '请填写编码',
    			remote:'编码已经存在'
    		} ,extra:{ 
    			digits:'扩展请输入整数',
    			required: '请填写扩展'
    		} ,orderIndex:{ 
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