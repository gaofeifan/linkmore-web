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
layui.use(['layer','msg','form','ztree', 'common','datatable','laydate'], function() {
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
		url: "/admin/ent/operate-auth/tree",
		data:{time:new Date().getTime()},  
		success: function(data) {
			tree = $.fn.zTree.init($("#resource-tree"), setting, data); 
		},
		error:function(){}
	});
	
	var enterpriseHtml = '';
	var enterpriseList = null;
	var enterpriseMap = layui.common.map();
	layui.common.ajax({
		url:'/admin/biz/enterprise/selectAll',
		data:{time:new Date().getTime()}, 
		async:false,
		success:function(list){
			enterpriseList = list;
			enterpriseHtml = '<option value="">选择企业</option>';
			$.each(list,function(index,enterprise){
				enterpriseMap.put(enterprise.id,enterprise.name);
				enterpriseHtml += '<option value="'+enterprise.id+'">';
				enterpriseHtml += enterprise.name;
				enterpriseHtml += '</option>';
			});
			$('#search-enterprise-name').html(enterpriseHtml);
			form.render('select');
		},error:function(){
			
		}
	});
	
	var addServerParams = function(data){  
		
		var filters = new Array();
		var filter = null; 
		var searchName = $('#search-realname').val();
		if(searchName!=''){
			filter = new Object();
			filter.property = 'name';
			filter.value = name;
			filters.push(filter);
		}
		var searchStatus = $('#search-status').val();
		if(searchStatus!=-1){
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
		$("#operate-table input.checkboxes").bind('change',function(){
			tree.checkAllNodes(false);
			var checked = false;
			if($(this).is(':checked')){
				checked = true; 
    		}
			if(checked){
				if(lastCheckedId==null){
					lastCheckedId = this.value;
				}else{
					$('#operate-table input.checkboxes[value='+lastCheckedId+']').prop("checked", false);
					$('#operate-table input.checkboxes[value='+lastCheckedId+']').parents('tr').removeClass("active");
					lastCheckedId = this.value;
				}
				layui.common.ajax({
					url: "/admin/ent/operate-auth/resource",
					data:{time:new Date().getTime(),id:this.value},  
					success: function(data) {
						var userAuths = data.stas;
						$.each(userAuths,function(index,ua){ 
							console.log(ua)
	        				nodes = tree.getNodesByParam("id",ua.stallId,null);
	        				if(nodes.length>0){
		        				tree.checkNode(nodes[0], true, true);
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
		id:'operate-table',
		url:'/admin/ent/operate-auth/list', 
		key:'id',
		columns:[
			{ sTitle: 'ID',   mData: 'id', bVisible:false}, 
			{ sTitle: '企业ID',   mData: 'entId', bVisible:false}, 
			/*{ sTitle: '企业名称',   mData: 'entName',
				  bSortable: true,
		          mRender:function(mData,type,full){
		          		$.each(enterpriseList,function(index){
		          			if($(this).id == full.entId){
		          				return '<label style="color:red;">'+$(this).name+'</label>';
		          			}
		          			
		          		})
		          }
					
			}, */
			{ sTitle: '名称',   mData: 'name'	}, 
			{ sTitle: '状态',   
				  mData: 'status',
				  bSortable: true,
		          mRender:function(mData,type,full){
		          		var html = '';
		          		if(mData==1){
		          			html += '<label style="color:green;">启动</label>';
		          		}else if(mData==0){
		          			html += '<label style="color:red;">禁用</label>';
		          		}
		          		return html;
		          }
			}
		],
		orderIndex:1,
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
	
	/*
	 * 添加
	 */
	var addInit = function(validate,lindex){
		form.render('checkbox'); 
		$('#admin-operate-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		$("#enterprise-id").html(enterpriseHtml);
		form.render('select');
		$('#admin-operate-add-button').bind('click',function(){
        	if(validate.valid()){  
        		layui.common.ajax({
        			url:'/admin/ent/operate-auth/save',
        			data:$('#admin-operate-add-form').serialize(),
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
    	valid.id = "admin-operate-add-form";
    	valid.rules = {
    		cellphone:{
    			rangelength:[11,11],
    			required: true,
    			digits:true,
    			remote:{
    				url:"/admin/ent/operate-auth/check",  
    				data:{
    					property:"cellphone",
    					value:function(){return $('#admin-operate-add-form input[name=cellphone]').val();},
    					id:function(){return new Date().getTime();}
    				}
    			}
    		},realname:{
    			rangelength:[1,12],  
    			required: true
    		}  
    	};
    	valid.messages = {
    		cellphone:{
    			rangelength:'手机号长度有误', 
    			required: '请填写手机号',
    			remote:'手机号已经存在',
    			digits:'手机号格式有误',
    		},realname:{
    			rangelength:'姓名应该在[1,12]内',  
    			required: '请填写姓名'
    		} 
    	}; 
    	param.validate = valid;
    	param.width = 600;
    	param.init = addInit;
    	layui.common.modal(param);  
    });
    /*
     * 编辑
     */
    var editInit = function(validate,lindex){
		var list = datatable.selected();
		layui.common.set({
			id:'admin-operate-edit-form',
			data:list[0]
		});
		form.render('checkbox');
		$("#enterprise-id").html(enterpriseHtml);
		$("#enterprise-id").val(list[0].entId);
		form.render('select');
		$('#admin-operate-cancel-edit-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		$('#admin-operate-edit-button').bind('click',function(){
        	if(validate.valid()){  
        		layui.common.ajax({
        			url:'/admin/ent/operate-auth/update',
        			data:$('#admin-operate-edit-form').serialize(),
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
	}
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
    	valid.id = "admin-operate-edit-form";
    	valid.rules = {
    		cellphone:{
    			rangelength:[11,11],
    			required: true,
    			digits:true,
    			remote:{
    				url:"/admin/ent/operate-auth/check",  
    				data:{
    					property:"cellphone",
    					value:function(){return $('#admin-operate-edit-form input[name=cellphone]').val();},
    					id:function(){return $('#admin-operate-edit-form input[name=id]').val();}
    				}
    			}
    		},realname:{
    			rangelength:[1,12],  
    			required: true
    		}  
    	};
    	valid.messages = {
    		cellphone:{
    			rangelength:'手机号长度有误', 
    			required: '请填写手机号',
    			remote:'手机号已经存在',
    			digits:'手机号格式有误',
    		},realname:{
    			rangelength:'姓名应该在[1,12]内',  
    			required: '请填写姓名'
    		} 
    	}; 
    	param.validate = valid;
    	param.width = 600;
    	param.init = editInit;
    	layui.common.modal(param);
	});
    /*
     * 绑定
     */
	$('#bind-button').bind('click',function(){
    	var list = datatable.selected(); 
		if(list.length!=1){
			layui.msg.error('请选择一条记录进行绑定');
			return false;
		}
		var nodes = tree.getCheckedNodes(true);
		console.log(nodes);
		var authids = '';
		var bindObj = new Object();
		bindObj.id = list[0].id;
		var objs=new Array()
		for(var i=0;i<nodes.length;i++){
			var children = nodes.children
			/*for(var y=0;y<children.length;y++){
				if(checked == true){
					
				}
			}*/
			if(nodes[i].level==2){
				var obj = new Object();
				obj.stallId = nodes[i].mId;
				obj.preId = nodes[i].pId;
				objs.push(obj);
			}
		}  
		bindObj.stallList = objs;
		
		layui.msg.confirm('您确定要绑定吗',function(){
			layui.common.ajax({
				url:'/admin/ent/operate-auth/bind',
				data:{auth:JSON.stringify(bindObj)}, 
				success:function(res){
					if(res.success){
						layui.msg.success(res.content);
					}else{
						layui.msg.error(res.content);
					}
				},error:function(){
					layui.msg.error("网络异常");
				}
			});
		}); 
    });
	/*
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
		layui.msg.confirm('管理员的权限也将被删除,确认删除？',function(){
			layui.common.ajax({
				url:'/admin/ent/operate-auth/delete',
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
	/*
	 * 启动
	 */
	$('#start-button').bind('click',function(){
		var list = datatable.selected(); 
		if(list.length != 1){
			layui.msg.error('请至少选择一条记录');
			return false;
		}
		var ids = new Array();
		$.each(list,function(index,page){
			ids.push(page.id);
		});
		layui.msg.confirm('管理员的权限也将被删除,确认删除？',function(){
			layui.common.ajax({
				url:'/admin/ent/operate-auth/start',
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
	/*
	 * 禁用
	 */
	$('#stop-button').bind('click',function(){
		var list = datatable.selected(); 
		if(list.length != 1){
			layui.msg.error('请至少选择一条记录');
			return false;
		}
		var ids = new Array();
		$.each(list,function(index,page){
			ids.push(page.id);
		});
		layui.msg.confirm('管理员的权限也将被删除,确认删除？',function(){
			layui.common.ajax({
				url:'/admin/ent/operate-auth/stop',
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
});