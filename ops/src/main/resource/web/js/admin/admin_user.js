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
		url: "/admin/admin/admin_user/tree",
		data:{time:new Date().getTime()},  
		success: function(data) {
			tree = $.fn.zTree.init($("#resource-tree"), setting, data); 
		},
		error:function(){}
	});
	
	var addServerParams = function(data){  
		
		var filters = new Array();
		var filter = null; 
		var searchPhone = $('#search-cellphone').val();
		if(searchPhone!=''){
			filter = new Object();
			filter.property = 'cellphone';
			filter.value = '%'+searchPhone +'%';
			filters.push(filter);
		}
		var searchName = $('#search-realname').val();
		if(searchName!=''){
			filter = new Object();
			filter.property = 'realname';
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
	var lastCheckedId = null;
	
	var draw = function(settings, json){
		$("#admin-user-table input.checkboxes").bind('change',function(){
			tree.checkAllNodes(false);
			var checked = false;
			if($(this).is(':checked')){
				checked = true; 
    		}
			if(checked){
				if(lastCheckedId==null){
					lastCheckedId = this.value;
				}else{
					$('#admin-user-table input.checkboxes[value='+lastCheckedId+']').prop("checked", false);
					$('#admin-user-table input.checkboxes[value='+lastCheckedId+']').parents('tr').removeClass("active");
					lastCheckedId = this.value;
				}
				layui.common.ajax({
					url: "/admin/admin/admin_user/resource",
					data:{time:new Date().getTime(),id:this.value},  
					success: function(data) {
						var userAuths = data.userAuths;
						$.each(userAuths,function(index,ua){ 
	        				nodes = tree.getNodesByParam("id",ua.authId,null);
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
		id:'admin-user-table',
		url:'/admin/admin/admin_user/list', 
		key:'id',
		columns:[ 
			{ sTitle: '手机号',   mData: 'cellphone'}, 
			{ sTitle: '姓名',   mData: 'realname'}, 
			{ sTitle: '账号',   mData: 'accountName'}, 
			{ sTitle: '密码',   mData: 'password'}, 
			{ sTitle: '删除标识',   
				mData: 'gatewayDelete',
					bSortable: true,
		          	mRender:function(mData,type,full){
		          		var html = '';
		          		if(mData==1){
		          			html += '<label style="color:green;">是</label>';
		          		}else if(mData==0){
		          			html += '<label style="color:red;">否</label>';
		          		}
		          		return html;
		          	}
				/*mRender:function(mData,type,full){
					var heml = "";
					if(mData == 0){
						html += '<label style="color:green;">否</label>';
					}else{
						html += '<label style="color:green;">是</label>';
						
					}
					return html;
				}*/
			}, 
			{
				sTitle: '创建时间',
				mData: 'createTime' ,
				bSortable: true,
				mRender:function(mData,type,full){
					return new Date(mData).format('yyyy-MM-dd hh:mm');
				}
			},
			{
				sTitle: '最后一次登录',
				mData: 'loginTime' ,
				bSortable: true,
				mRender:function(mData,type,full){
					return mData!=null?new Date(mData).format('yyyy-MM-dd hh:mm'):'暂未登录';
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
			}
		],
		orderIndex:3,
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
		form.render('select'); 
		$('#admin-user-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		$('#admin-user-add-button').bind('click',function(){
        	if(validate.valid()){  
        		layui.common.ajax({
        			url:'/admin/admin/admin_user/save',
        			data:$('#admin-user-add-form').serialize(),
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
    	valid.id = "admin-user-add-form";
    	valid.rules = {
    		cellphone:{
    			rangelength:[11,11],
    			required: false,
    			digits:true,
    			remote:{
    				url:"/admin/admin/admin_user/check",  
    				data:{
    					property:"cellphone",
    					value:function(){return $('#admin-user-add-form input[name=cellphone]').val();},
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
			id:'admin-user-edit-form',
			data:list[0]
		});
		form.render('checkbox');
		form.render('select');
		$('#admin-user-cancel-edit-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		$('#admin-user-edit-button').bind('click',function(){
        	if(validate.valid()){  
        		layui.common.ajax({
        			url:'/admin/admin/admin_user/update',
        			data:$('#admin-user-edit-form').serialize(),
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
    	valid.id = "admin-user-edit-form";
    	valid.rules = {
    		cellphone:{
    			rangelength:[11,11],
    			required: false,
    			digits:true,
    			remote:{
    				url:"/admin/admin/admin_user/check",  
    				data:{
    					property:"cellphone",
    					value:function(){return $('#admin-user-edit-form input[name=cellphone]').val();},
    					id:function(){return $('#admin-user-edit-form input[name=id]').val();}
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
		var authids = '';
		for(var i=0;i<nodes.length;i++){
			if(nodes[i].level==1){
				authids += ','+nodes[i].mId;
			}
		}  
		layui.msg.confirm('您确定要绑定吗',function(){
			layui.common.ajax({
				url:'/admin/admin/admin_user/bind',
				data:{id:list[0].id,authids:authids.substring(1)}, 
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
				url:'/admin/admin/admin_user/delete',
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