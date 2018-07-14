 layui.config({
	base: 'js/lib/'
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
	var selectedClazzId = session.getItem('interface-selected-id'); 
	var level = 0;
	var lastNode = null;
 	var treeClick = function(event, treeId, treeNode, clickFlag){ 
		level = treeNode.level;
 		if(level==2){
 			selectedClazzId = treeNode.id;   
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
		url: "/admin/security/interface/tree",
		data:{time:new Date().getTime()},
		contentType:'application/json; charset=utf-8', 
		success: function(data) {
			tree = $.fn.zTree.init($("#interface-tree"), setting, data);
			var nodes = tree.getNodes(); 
			if(nodes[0].children!=null&&nodes[0].children[0].children!=null){
				tree.selectNode(nodes[0].children[0].children[0]); 
				selectedClazzId = nodes[0].children[0].children[0].id; 
				lastNode = nodes[0].children[0].children[0];
				query();
			}  
		},
		error:function(){}
	});
	
	
	var addServerParams = function(data){  
		var searchName = $('#search-name').val();
		var filters = new Array();
		var filter = new Object();
		filter.property = 'clazzId';
		filter.value = selectedClazzId;
		filters.push(filter);
		if(searchName!=''){
			filter = new Object();
			filter.property = 'name';
			filter.value = '%'+searchName +'%';
			filters.push(filter);
		} 
		var searchAuthorize = $('#search-authorize').val();
		if(searchAuthorize!='-1'){
			filter = new Object();
			filter.property = 'authorize';
			filter.value = searchAuthorize;
			filters.push(filter);
		}
		if(filters.length>0){
			data.push({name:'filterJson',value:JSON.stringify({filters:filters})});
		}
	};
	var datatable = layui.datatable.init({
		id:'interface-table',
		url:'/admin/security/interface/list', 
		key:'id',
		columns:[
			{ sTitle: '名称',   mData: 'name'}, 
			{ sTitle: '路径',   mData: 'path'}, 
			{
				sTitle: '权限',
	          	mData: 'authorize' , 
	          	mRender:function(mData,type,full){
	          		var html = '';
	          		if(mData==1){
	          			html += '<label style="color:green;">授权</label>';
	          		}else if(mData==0){
	          			html += '<label style="color:red;">公开</label>';
	          		}
	          		return html;
	          	}
			},{
				sTitle: '日志',
	          	mData: 'logStatus' , 
	          	mRender:function(mData,type,full){
	          		var html = '';
	          		if(mData==1){
	          			html += '<label style="color:green;">记日志</label>';
	          		}else if(mData==0){
	          			html += '<label style="color:red;">无日志</label>';
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
		$.each(list,function(index,interface){
			ids.push(interface.id);
		});
		layui.msg.confirm('您确定要删除',function(){
			layui.common.ajax({
				url:'/admin/security/interface/delete',
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
			id:'interface-add-form',
			data:{clazzId:selectedClazzId}
		});
		form.render('checkbox');
		$('#interface-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		$('#interface-add-button').bind('click',function(){
        	if(validate.valid()){  
        		layui.common.ajax({
        			url:'/admin/security/interface/save',
        			data:$('#interface-add-form').serialize(),
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
    	valid.id = "interface-add-form";
    	valid.rules = {
    		name:{
    			rangelength:[1,32] ,
    			required: true,
    			remote:{
    				url:"/admin/security/interface/check",  
    				data:{
    					property:"name",
    					value:function(){return $('#interface-add-form input[name=name]').val();},
    					clazzId:function(){return $('#interface-add-form input[name=clazzId]').val();},
    					id:function(){return new Date().getTime();}
    				}
    			}
    		},path:{
    			rangelength:[1,120] ,
    			required: true,
    			remote:{
    				url:"/admin/security/interface/check",  
    				data:{
    					property:"path",
    					value:function(){return $('#interface-add-form input[name=path]').val();},
    					clazzId:function(){return $('#interface-add-form input[name=clazzId]').val();},
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
    		},path:{
    			rangelength:'访问路径长度应该在[1,120]内',  
    			required: '请填写访问路径',
    			remote:'访问路径已经存在'
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
			id:'interface-edit-form',
			data:list[0]
		});
		form.render('checkbox');
		$('#interface-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		$('#interface-update-button').bind('click',function(){
        	if(validate.valid()){  
        		layui.common.ajax({
        			url:'/admin/security/interface/update',
        			data:$('#interface-edit-form').serialize(),
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
    	valid.id = "interface-edit-form"; 
    	valid.rules = {
			name:{
				rangelength:[1,32] ,
				required: true,
				remote:{
					url:"/admin/security/interface/check",  
					data:{
						property:"name",
						value:function(){return $('#interface-edit-form input[name=name]').val();},
						clazzId:function(){return $('#interface-edit-form input[name=clazzId]').val();},
						id:function(){return $('#interface-edit-form input[name=id]').val();}
					}
				}
			},path:{
				rangelength:[1,120] ,
				required: true,
				remote:{
					url:"/admin/security/interface/check",  
					data:{
						property:"path",
						value:function(){return $('#interface-edit-form input[name=path]').val();},
						clazzId:function(){return $('#interface-edit-form input[name=clazzId]').val();},
						id:function(){return $('#interface-edit-form input[name=id]').val();}
					}
				}
			}
		};
		valid.messages = {
			name:{
				rangelength:'名称长度应在[1,32]内', 
				required: '请填写名称',
				remote:'名称已经存在'
			},path:{
				rangelength:'访问路径长度应该在[1,120]内',  
				required: '请填写访问路径',
				remote:'访问路径已经存在'
			} 
		};  
    	param.validate = valid;
    	param.width = 600;
    	param.init = editInit;
    	layui.common.modal(param);  
    });
 
});