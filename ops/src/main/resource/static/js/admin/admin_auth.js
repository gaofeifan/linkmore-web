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
		url: "/admin/admin/admin_auth/tree",
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
		$("#admin-auth-table input.checkboxes").bind('change',function(){
			tree.checkAllNodes(false);
			var checked = false;
			if($(this).is(':checked')){
				checked = true; 
    		}
			if(checked){
				if(lastCheckedId==null){
					lastCheckedId = this.value;
				}else{
					$('#admin-auth-table input.checkboxes[value='+lastCheckedId+']').prop("checked", false);
					$('#admin-auth-table input.checkboxes[value='+lastCheckedId+']').parents('tr').removeClass("active");
					lastCheckedId = this.value;
				}
				layui.common.ajax({
					url: "/admin/admin/admin_auth/resource",
					data:{time:new Date().getTime(),id:this.value},  
					success: function(data) {
						var stalls = data.stalls;
						var aaStalls = data.adminAuthStalls;
						var map = layui.common.map();
						$.each(stalls,function(index,stall){ 
	        				nodes = tree.getNodesByParam("id",'stall'+stall.id,null);  
	        				if(nodes.length>0){
	        					map.put(nodes[0].pId,'');
		    					tree.checkNode(nodes[0], true, true);
	        				} 
	        			});
						$.each(aaStalls,function(index,aaStall){ 
	        				nodes = tree.getNodesByParam("id",'pre'+aaStall.stallId,null);
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
		id:'admin-auth-table',
		url:'/admin/admin/admin_auth/list', 
		key:'id',
		columns:[ 
			{ sTitle: '名称',   mData: 'name'}, 
			{
				sTitle: '创建时间',
				mData: 'createTime' ,
				bSortable: true,
				mRender:function(mData,type,full){
					return new Date(mData).format('yyyy-MM-dd hh:mm');
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
		orderIndex:2,
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
		$('#admin-auth-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		$('#admin-auth-add-button').bind('click',function(){
        	if(validate.valid()){  
        		layui.common.ajax({
        			url:'/admin/admin/admin_auth/save',
        			data:$('#admin-auth-add-form').serialize(),
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
    	valid.id = "admin-auth-add-form";
    	valid.rules = {
    		name:{
    			rangelength:[1,32],
    			required: true,
    			custom: function (value, elemen){
					var a = /^[\u4E00-\u9FA5A-Za-z0-9_-]+$/;
					return a.test(value.value);
				},
    			remote:{
    				url:"/admin/admin/admin_auth/check",  
    				data:{
    					property:"name",
    					value:function(){return $('#admin-auth-add-form input[name=name]').val();},
    					id:function(){return new Date().getTime();}
    				}
    			}
    		} 
    	};
    	valid.messages = {
    		name:{
    			rangelength:'名称应该在[1,32]内',  
    			required: '请填写名称',
    			remote:'名称已经存在',
    			custom:'不能有特殊符号'
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
			id:'admin-auth-edit-form',
			data:list[0]
		});
		form.render('checkbox');
		form.render('select');
		$('#admin-auth-cancel-edit-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		$('#admin-auth-edit-button').bind('click',function(){
        	if(validate.valid()){  
        		layui.common.ajax({
        			url:'/admin/admin/admin_auth/update',
        			data:$('#admin-auth-edit-form').serialize(),
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
    	valid.id = "admin-auth-edit-form";
    	valid.rules = {
    		name:{
    			rangelength:[1,32],
    			required: true,
    			custom: function (value, elemen){
					var a = /^[\u4E00-\u9FA5A-Za-z0-9_-]+$/;
					return a.test(value.value);
				},
    			remote:{
    				url:"/admin/admin/admin_auth/check",  
    				data:{
    					property:"name",
    					value:function(){return $('#admin-auth-edit-form input[name=name]').val();},
    					id:function(){return $('#admin-auth-edit-form input[name=id]').val();}
    				}
    			}
    		}  
    	};
    	valid.messages = {
    		name:{
    			rangelength:'名称应该在[1,32]内',  
    			required: '请填写名称',
    			remote:'名称已经存在',
    			custom:'不能有特殊符号'
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
    	var lists = datatable.selected(); 
		if(lists.length!=1){
			layui.msg.error('请选择一条记录进行绑定');
			return false;
		}
		//左侧授权体
		var nodes = tree.getCheckedNodes(true);
		var stallIds = '';
		var bean = null;
		//选中的城市
		var citys = new Array();
		//选中的专区
		var pres = new Array();
		//选中的车位
		var list = new Array();
		for(var i=0;i<nodes.length;i++){
			if(nodes[i].level==1){
				citys.push(nodes[i].mId);
			}
			if(nodes[i].level==2){
				pres.push(nodes[i].mId);
			}
			if(!nodes[i].isParent){
				list.push(nodes[i].mId);
			}
		}
		/*for(var i=0;i<nodes.length;i++){
			if(nodes[i].level==2){
				stallIds += ','+nodes[i].mId;
			}
		}  */
		layui.msg.confirm('您确定要绑定吗',function(){
			layui.common.ajax({
				url:'/admin/admin/admin_auth/bind',
			//	data:{id:list[0].id,stallIds:stallIds.substring(1)}, 
				data:{id:lists[0].id,
					citys:JSON.stringify(citys),
	        		pres:JSON.stringify(pres),
	        		json:JSON.stringify(list),
	        		time:new Date().getTime()
				},
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
		layui.msg.confirm('管理员对应的权限也将被删除,确认删除？',function(){
			layui.common.ajax({
				url:'/admin/admin/admin_auth/delete',
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