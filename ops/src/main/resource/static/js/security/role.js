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
layui.use(['layer','msg','form','ztree', 'common','validate','datatable','laydate'], function() {
	var validate = layui.validate;
	var session = window.sessionStorage;
	var layer = layui.layer;  
	var $ = layui.jquery; 
	var form = layui.form;   
	
	var setting = {
		check: {
			enable: true
		},
		data: {
			simpleData: {
				enable: true
			}
		}
	};
	var tree = null;
	layui.common.ajax({
		url: "/admin/security/role/tree",
		data:{time:new Date().getTime()},  
		success: function(data) {
			tree = $.fn.zTree.init($("#resource-tree"), setting, data); 
		},
		error:function(){}
	});
	
	var addServerParams = function(data){  
		
		var filters = new Array();
		var filter = null; 
		var searchName = $('#search-name').val();
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
			filter.value = searchName ;
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
	var lastCheckedId = null;
	
	var draw = function(settings, json){
		$("#role-table input.checkboxes").bind('change',function(){
			tree.checkAllNodes(false);
			var checked = false;
			if($(this).is(':checked')){
				checked = true; 
    		}
			if(checked){
				if(lastCheckedId==null){
					lastCheckedId = this.value;
				}else{
					$('#role-table input.checkboxes[value='+lastCheckedId+']').prop("checked", false);
					$('#role-table input.checkboxes[value='+lastCheckedId+']').parents('tr').removeClass("active");
					lastCheckedId = this.value;
				}
				layui.common.ajax({
					url: "/admin/security/role/resource",
					data:{time:new Date().getTime(),id:this.value},  
					success: function(data) {
						var res = data.res;
						var rps = data.rps;
						var map = layui.common.map();
						$.each(res,function(index,re){ 
	        				nodes = tree.getNodesByParam("id",'e'+re.elementId,null);  
	        				if(nodes.length>0){
	        					map.put(nodes[0].pId,'');
		    					tree.checkNode(nodes[0], true, true);
	        				} 
	        			});
						$.each(rps,function(index,rp){ 
	        				nodes = tree.getNodesByParam("id",'p'+rp.pageId,null);
	        				if(nodes.length>0){
	        					var key =  map.get(nodes[0].id); 
		        				if(key==null){
		        					tree.checkNode(nodes[0], true, true);
		        				} 
	        				} 
	        			});
					},
					error:function(){}
				});
			}else{
				lastCheckedId = null;
			} 
		});
		
	};
	var datatable = layui.datatable.init({
		id:'role-table',
		url:'/admin/security/role/list', 
		key:'id',
		columns:[ 
			{ sTitle: '名称',   mData: 'name'}, 
			{ sTitle: '编码',   mData: 'code'}, 
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
		orderIndex:4,
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
	 
	$('#delete-button').bind('click',function(){
		var list = datatable.selected(); 
		if(list.length<1){
			layui.msg.error('请至少选择一条记录');
			return false;
		}
		var ids = new Array();
		$.each(list,function(index,role){
			ids.push(role.id);
		});
		layui.msg.confirm('您确定要删除',function(){
			layui.common.ajax({
				url:'/admin/security/role/delete',
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
		 
		form.render('checkbox'); 
		$('#role-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		$('#role-add-button').bind('click',function(){
        	if(validate.valid()){  
        		layui.common.ajax({
        			url:'/admin/security/role/save',
        			data:$('#role-add-form').serialize(),
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
    	valid.id = "role-add-form";
    	valid.rules = {
    		name:{
    			rangelength:[1,100] ,
    			required: true,
    			remote:{
    				url:"/admin/security/role/check",  
    				data:{
    					property:"name",
    					value:function(){return $('#role-add-form input[name=name]').val();},
    					id:function(){return new Date().getTime();}
    				}
    			}
    		},code:{
    			rangelength:[1,32],  
    			required: true,
    			remote:{
    				url:"/admin/security/role/check",  
    				data:{
    					property:"code",
    					value:function(){return $('#role-add-form input[name=code]').val();},
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
    		},code:{
    			rangelength:'编码长度应该在[1,32]内',  
    			required: '请填写编码',
    			remote:'编码已经存在'
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
			id:'role-edit-form',
			data:list[0]
		}); 
		form.render('checkbox'); 
		$('#role-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		$('#role-update-button').bind('click',function(){
        	if(validate.valid()){  
        		layui.common.ajax({
        			url:'/admin/security/role/update',
        			data:$('#role-edit-form').serialize(),
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
    	valid.id = "role-edit-form";
    	valid.rules = {
    		name:{
    			rangelength:[1,32] ,
    			required: true,
    			remote:{
    				url:"/admin/security/role/check",  
    				data:{
    					property:"name",
    					value:function(){return $('#role-edit-form input[name=name]').val();},
    					id:function(){return $('#role-edit-form input[name=id]').val();}
    				}
    			}
    		},code:{
    			rangelength:[1,32],  
    			required: true ,
    			remote:{
    				url:"/admin/security/role/check",  
    				data:{
    					property:"code",
    					value:function(){return $('#role-edit-form input[name=code]').val();},
    					id:function(){return $('#role-edit-form input[name=id]').val();}
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
    			rangelength:'路径长度应该在[1,32]内',  
    			required: '请填写样访问路径',
    			remote:'路径资源已经存在'
    		} 
    	}; 
    	param.validate = valid;
    	param.width = 600;
    	param.init = editInit;
    	layui.common.modal(param);  
    });
    $('#bind-button').bind('click',function(){
    	var list = datatable.selected(); 
		if(list.length!=1){
			layui.msg.error('请选择一条记录进行绑定');
			return false;
		}
		var nodes = tree.getCheckedNodes(true);
		var pids = '';
		var eids = '';
		for(var i=0;i<nodes.length;i++){
			if(nodes[i].level==3){
				eids += ','+nodes[i].mId;
			}else if(nodes[i].level==2){
				pids += ','+nodes[i].mId;
			}
		}  
		layui.msg.confirm('您确定要绑定吗',function(){
			layui.common.ajax({
				url:'/admin/security/role/bind',
				data:{id:list[0].id,pids:pids.substring(1),eids:eids.substring(1)}, 
				success:function(res){
					if(res.success){
						layui.msg.success(res.content);
					}else{
						layui.msg.error(res.content);
					}
					
				},error:function(){
					
				}
			});
		}); 
    });
});