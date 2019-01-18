layui.config({
	base: '/web/js/lib/'
}).extend({ 
	msg:'msg',
	common:'common', 
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
layui.use(['layer','msg','form', 'common','validate','datatable','laydate'], function() {
	var validate = layui.validate;
	var session = window.sessionStorage;
	var layer = layui.layer;  
	var $ = layui.jquery; 
	var form = layui.form; 
	var roleList = null;
	
	
	layui.common.ajax({
		url: "/admin/security/person/role_list",
		data:{time:new Date().getTime()}, 
		success: function(data) {
			roleList = data;
		},
		error:function(){}
	});
	
	var addServerParams = function(data){  
		var searchUsername = $('#search-username').val();
		var filters = new Array();
		var filter = null; 
		if(searchUsername!=''){
			filter = new Object();
			filter.property = 'username';
			filter.value =  searchUsername  ;
			filters.push(filter);
		} 
		var searchStatus = $('#search-status').val();
		if(searchStatus!='-1'){
			filter = new Object();
			filter.property = 'status';
			filter.value = searchStatus;
			filters.push(filter);
		}
		var searchRealname = $('#search-realname').val();
		if(searchRealname!=''){
			filter = new Object();
			filter.property = 'realname';
			filter.value = searchRealname;
			filters.push(filter);
		}
		if(filters.length>0){
			data.push({name:'filterJson',value:JSON.stringify({filters:filters})});
		}
	};
	var datatable = layui.datatable.init({
		id:'person-table',
		url:'/admin/security/person/list', 
		key:'id',
		columns:[ 
			{ sTitle: '账号',   mData: 'username'}, 
			{ sTitle: '姓名',   mData: 'realname'}, 
			{
				sTitle: '状态',
	          	mData: 'status' ,
	          	bSortable: true,
	          	mRender:function(mData,type,full){ 
	          		var html = '';
	          		switch(mData){
		          		case 0:html += '禁用';break;
		          		case 1:html += '启用';break;
	          		}
	          		return html;
	          	}
			},{
				sTitle: '分类',
	          	mData: 'type' ,
	          	bSortable: true,
	          	mRender:function(mData,type,full){ 
	          		var html = '';
	          		switch(mData){
		          		case 0: html = '<label style="color:#666">内置</label>';break;
	          			case 1: html = '<label style="color:#1E9FFF">系统</label>';break;
	          			case 2: html = '<label style="color:#009688">企业</label>';break;
	          		}
	          		return html;
	          	}
			},  
			{
				sTitle: '锁定状态',
	          	mData: 'lockStatus' ,
	          	bSortable: true,
	          	mRender:function(mData,type,full){ 
	          		var html = '';
	          		switch(mData){
		          		case 0:html += '正常';break;
		          		case 1:html += '锁定 '+new Date(full.lockTime).format('yyyy-MM-dd hh:mm');break;
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
		var flag = false;
		$.each(list,function(index,person){
			ids.push(person.id);
			if(person.type!=1){
				flag = true;
			}
		});
		if(flag){
			layui.msg.error('请选择系统用户进行操作');
			return false;
		} 
		layui.msg.confirm('您确定要删除',function(){
			layui.common.ajax({
				url:'/admin/security/person/delete',
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
		$('#person-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		$('#person-add-button').bind('click',function(){
        	if(validate.valid()){  
        		layui.common.ajax({
        			url:'/admin/security/person/save',
        			data:$('#person-add-form').serialize(),
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
    	valid.id = "person-add-form";
    	valid.rules = {
    		username:{
    			rangelength:[1,32] ,
    			required: true,
    			remote:{
    				url:"/admin/security/person/check",  
    				data:{
    					property:"username",
    					value:function(){return $('#person-add-form input[name=username]').val();},
    					id:function(){return new Date().getTime();}
    				}
    			}
    		},realname:{
    			rangelength:[1,32],  
    			required: true  
    		},password:{
    			rangelength:[6,32],  
    			required: true  
    		}
    	};
    	valid.messages = {
    		username:{
    			rangelength:'账号长度应在[1,32]内', 
    			required: '请填写账号',
    			remote:'账号已经存在'
    		},realname:{
    			rangelength:'姓名长度应该在[1,32]内',  
    			required: '请填写账号' 
    		},password:{
    			rangelength:'密码长度应该在[6,32]内',  
    			required: '请填写密码' 
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
			id:'person-edit-form',
			data:list[0]
		});
		form.render('select'); 
		form.render('checkbox'); 
		$('#person-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		$('#person-update-button').bind('click',function(){
        	if(validate.valid()){  
        		layui.common.ajax({
        			url:'/admin/security/person/update',
        			data:$('#person-edit-form').serialize(),
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
		/*
		if(list[0].type!=1){
			layui.msg.error('请选择系统账户进行操作');
			return false;
		}
		*/
    	var param = new Object();
    	param.url = 'edit.html';
    	param.title = '编辑信息'; 
    	var valid = new Object();
    	valid.id = "person-edit-form";
    	valid.rules = {
    		realname:{
    			rangelength:[1,32],  
    			required: true  
    		},password:{
    			rangelength:[6,32] 
    		}
    	};
    	valid.messages = {
    		realname:{
    			rangelength:'姓名长度应该在[1,32]内',  
    			required: '请填写账号' 
    		},password:{
    			rangelength:'密码长度应该在[6,32]内' 
    		} 
    	}; 
    	param.validate = valid;
    	param.width = 600;
    	param.init = editInit;
    	layui.common.modal(param);  
    });
    
    $('#unlock-button').bind('click',function(){
    	var list = datatable.selected(); 
    	if(list.length!=1){
			layui.msg.error('请选择一条记录进行编辑');
			return false;
		}
    	if(list[0].lockStatus!=1){
			layui.msg.error('选择账号未锁定');
			return false;
		}
    	layui.msg.confirm('您确定要解除锁定吗',function(){
    		layui.common.ajax({
    			url:'/admin/security/person/unlock',
    			data:{time:new Date().getTime(),id:list[0].id},
    			success:function(res){
    				if(res.success){ 
    					layui.msg.success(res.content);
    					window.setTimeout(query,1000);
    				}else{
    					layui.msg.error(res.content);
    				}
    			} 
    		});
		});  
    });
    
    var bindInit = function(validate,lindex){
    	var list = datatable.selected(); 
    	var html = '';
    	$.each(roleList,function(index,role){
    		html += '<input type="checkbox" lay-skin="primary" name="roleId" value="'+role.id+'" title="'+role.name+'">';
    	});
    	$('#role-list-div').html(html);
    	form.render('checkbox');
    	layui.common.ajax({
			url:'/admin/security/person/person_role_list',
			data:{id:list[0].id},
			success:function(res){ 
				$.each(res,function(index,pr){
					$('#role-list-div input[value='+pr.roleId+']').prop('checked',true);
				});
				form.render('checkbox');
			} 
		});
    	
    	$('#bind-add-button').bind('click',function(){
    		var checked = $('#role-list-div input[name="roleId"]:checked');
    		if(checked.length<=0){
    			layui.msg.error('请选择角色进行授权');
    			return false;
    		}
    		var ids = '';
    		$.each(checked,function(index,ch){
    			ids += ',';
    			ids += ch.value;
    		}); 
    		layui.common.ajax({
    			url:'/admin/security/person/bind',
    			data:{id:list[0].id,ids:ids.substring(1)},
    			success:function(res){
    				if(res.success){
    					layui.layer.close(lindex);
    					layui.msg.success(res.content); 
    				}
    			} 
    		});
    	});
    	
    	$('#bind-cancel-button').bind('click',function(){
    		layui.layer.close(lindex);
    	});
    	
    	
    };
    $('#bind-button').bind('click',function(){
    	var list = datatable.selected(); 
		if(list.length!=1){
			layui.msg.error('请选择一条记录进行授权');
			return false;
		}
    	var param = new Object();
    	param.url = 'role.html';
    	param.title = '用户授权';  
    	param.width = 600;
    	param.init = bindInit;
    	layui.common.modal(param);  
    });
});