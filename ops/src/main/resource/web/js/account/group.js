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

var URL_BASE = "/admin/account/group";
var URL_LIST = URL_BASE + "/list";
var URL_SAVE = URL_BASE + "/save";
var URL_UPDATE = URL_BASE + "/update";
var URL_DELETE = URL_BASE + "/delete";
var URL_STATUS_OPEN = URL_BASE + "/status/open";
var URL_STATUS_CLOSE = URL_BASE + "/status/close";

var form, $;
layui.use(['element','layer','msg','form','ztree', 'common','datatable','laydate'], function() {
	var session = window.sessionStorage;
	var layer = layui.layer;  
	var $ = layui.jquery; 
	form = layui.form;   
	var laydate = layui.laydate; 
	var element = layui.element;
	
	var layer = parent.layer === undefined ? layui.layer : parent.layer;
    $ = layui.jquery;
	
	var draw = function(settings, json){
//		$(".operation-start").unbind('click').bind('click',startTemplate);
	};
	
	var addServerParams = function(data){  
		var filters = new Array();
		var filter = null; 
		var searchGroupName = $('#search-group-name').val();
		if(searchGroupName!=''){
			filter = new Object();
			filter.property = 'name';
			filter.value = '%'+searchGroupName +'%';
			filters.push(filter);
		}
		
		var searchGroupType = $('#search-group-type').val();
		if(searchGroupType!=''){
			filter = new Object();
			filter.property = 'groupType';
			filter.value = searchGroupType;
			filters.push(filter);
		}
		
		
		if(filters.length>0){
			data.push({name:'filterJson',value:JSON.stringify({filters:filters})});
		}
	};
	
	var datatable = layui.datatable.init({
		id:'group-table',
		url:URL_LIST, 
		key:'id',
		columns:[
			{ sTitle: 'ID',   mData: 'id', bVisible:false}, 
			{ sTitle: '分组名称',   mData: 'name'}, 
			{ sTitle: '分组简介',   mData: 'content'},
			{
				sTitle: '已登录用户',
	          	mRender:function(mData,type,full){
	          		var html = '<a class="operation-user" href="user_list.html?userGroupId='+full.id+'&userGroupName=' + full.name + '&groupType=' + full.groupType + '">'+full.userCount+'</a>';
	          		return html;
	          	}
			},
			{
				sTitle: '已录入用户',
	          	mRender:function(mData,type,full){
	          		var html;
	          		if(full.groupType == 2){
	          			html=full.inputCount;
	          		}else{
	          			html = '<a class="operation-user" href="input_list.html?userGroupId=' + full.id + '&userGroupName=' + full.name + '&groupType=' + full.groupType + '">'+full.inputCount+'</a>';
	          		}
	          		return html;
	          	}
			},
			{ sTitle: '类型',   mData: 'groupType',
	          	mRender:function(mData,type,full){
	          		var html = '<label style="color:gray">未知</label>';
	          		if(mData==0){
	          			html = '<label style="color:gray">默认</label>';
	          		}else if(mData==1){
	          			html = '<label style="color:blue">录入用户</label>'; 
	          		}else if(mData==2){
	          			html = '<label style="color:red">动态用户</label>'; 
	          		}else if(mData==3){
	          			html = '<label style="color:green">平台用户</label>'; 
	          		}	
	          		return html;
	          	}
			} ,
			{ sTitle: '操作人',   mData: 'updateUserName'} ,
			{ sTitle: '状态',   mData: 'status',
	          	mRender:function(mData,type,full){
	          		var html = '<label style="color:gray">未知</label>';
	          		if(mData==0){
	          			html = '<label style="color:gray">默认</label>';
	          		}else if(mData==1){
	          			html = '<label style="color:gray">关闭</label>'; 
	          		}else if(mData==2){
	          			html = '<label style="color:blue">开启</label>'; 
	          		}
	          		return html;
	          	}
			} ,
			{ sTitle: '创建(修改)时间',  
			  mData: 'updateTime',
			  bSortable: true,
	          mRender:function(mData,type,full){
	        	  if(mData != null){
	        		  return new Date(mData).format('yyyy-MM-dd hh:mm:ss');
	        	  }
	          }	
			}
		],
		orderIndex:6,
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

	/**
	 * 启用策略
	 */
	$('#open-button').bind('click',function(){
		var list = datatable.selected(); 
		if(list.length<1){
			layui.msg.error('请至少选择一条记录');
			return false;
		}
		if(list[0].status == 2){
			layui.msg.error('该分组已启用');
			return false;
		}
		var ids = new Array();
		$.each(list,function(index,dg){
			ids.push(dg.id);
		});
		layui.msg.confirm('确定开启吗？',function(){
			layui.common.ajax({
				url:URL_STATUS_OPEN,
				contentType:'application/json; charset=utf-8',
				data:JSON.stringify(ids),
				success:function(res){
					if(res.success){  
						layui.msg.success(res.content);
						window.setTimeout(query,3000);
					}else{
						layui.msg.error(res.content);
					}
				},error:function(){
					layui.msg.error("网络异常");
				}
			});
		}); 
	});
	
	/**
	 * 关闭策略
	 */
	$('#close-button').bind('click',function(){
		var list = datatable.selected(); 
		if(list.length<1){
			layui.msg.error('请至少选择一条记录');
			return false;
		}
		if(list[0].status == 1){
			layui.msg.error('该分组已关闭');
			return false;
		}
		var ids = new Array();
		$.each(list,function(index,dg){
			ids.push(dg.id);
		});
		layui.msg.confirm('确定关闭吗？',function(){
			layui.common.ajax({
				url:URL_STATUS_CLOSE,
				contentType:'application/json; charset=utf-8',
				data:JSON.stringify(ids),
				success:function(res){
					if(res.success){  
						layui.msg.success(res.content);
						window.setTimeout(query,3000);
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
		var flag = false;
		$.each(list,function(index,page){
			ids.push(page.id);
			if(page.status == 2){
				flag = true;
				return false;
			}
		});
		if(flag){
			layui.msg.error('启用状态下禁止删除');
			return false;
		}
		layui.msg.confirm('您确定要删除该分组吗？</br>删除分组会删除其下所有录入的车牌号。</br>确定删除请点击【确认】</br>放弃删除请点击【取消】。',function(){
			layui.common.ajax({
				url:URL_DELETE,
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
	 * 添加
	 */
	var addInit = function(validate,lindex){
		
		$('#group-cancel-button').bind('click',function(){
			layui.msg.confirm('您确定要放弃添加该分组吗？</br>确定放弃请点击【确认】</br>不放弃添加请点击【取消】。',function(){
				layui.msg.close(lindex);
				layui.layer.close(lindex);
			});
		});

		$('#group-add-button').bind('click',function(){
	    	if(validate.valid()){
	    		var groupName = $('#name').val();
        		if(groupName == ''){
        			layui.msg.tips('请填写分组名称!');
    				return;
        		}
        		layui.msg.confirm('您确定要添加该分组吗？</br>确定添加请点击【确认】</br>放弃添加请点击【取消】。',function(){
		    		layui.common.ajax({
		    			url:URL_SAVE,
		    			data:$('#group-add-form').serialize(),
		    			success:function(res){
		    				if(res.success){
		    					layui.layer.close(lindex);
		    					layui.msg.success(res.content);
		    					window.setTimeout(query,1000);
		    				}
		    			} 
		    		});
        		});
	    	}
		});
	};
    $('#add-button').bind('click',function(){
    	var param = new Object();
    	param.url = 'add.html';
    	param.title = '添加信息'; 
    	var valid = new Object();
    	valid.id = "group-add-form";
    	valid.rules = {
    		name:{
    			rangelength:[2,30],
    			required: true
    		},content:{
    			rangelength:[1,30],  
    			required: false
    		}
    	};
    	valid.messages = {
    		name:{
    			required: '请填写分组名称',
    			rangelength:'名称长度应在[2,30]内'
    		},content:{
    			rangelength:'简介长度应在[1,30]内',
    			required: '请选择车位'
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
    	
    	$('#group-cancel-button').bind('click',function(){
			layui.msg.confirm('您确定要放弃修改该分组吗？</br>确定放弃请点击【确认】</br>不放弃添加请点击【取消】。',function(){
				layui.msg.close(lindex);
				layui.layer.close(lindex);
			});
		});
		var list = datatable.selected();
		layui.common.set({
			id:'group-edit-form',
			data:list[0]
		});
		

		$('#group-edit-button').bind('click',function(){
        	if(validate.valid()){
        		var groupName = $('#name').val();
        		if(groupName == ''){
        			layui.msg.tips('请填写分组名称!');
    				return;
        		}
        		layui.msg.confirm('您确定要修改该分组吗？</br>确定修改请点击【确认】</br>放弃修改请点击【取消】。',function(){
	        		layui.common.ajax({
	        			url:URL_UPDATE,
	        			data:$('#group-edit-form').serialize(),
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
        		});
        	}
        });
	}
	$('#edit-button').bind('click',function(){
		var list = datatable.selected(); 
		if(list.length!=1){
			layui.msg.error('请选择一条记录！');
			return false;
		}
		if(list[0].status == 2){
			layui.msg.error('启用状态下禁止修改！');
			return false;
		}
		var param = new Object();
    	param.url = 'edit.html';
    	param.title = '编辑信息'; 
    	var valid = new Object();
    	valid.id = "group-edit-form";
    	valid.rules = {
        		name:{
        			rangelength:[2,30],
        			required: true
        		},content:{
        			rangelength:[1,30],  
        			required: false
        		}
        	};
        	valid.messages = {
        		name:{
        			required: '请填写分组名称',
        			rangelength:'名称长度应在[2,30]内'
        		},content:{
        			rangelength:'简介长度应在[1,30]内',
        			required: '请选择车位'
        		}
        	};
    	param.validate = valid;
    	param.width = 600;
    	param.init = editInit;
    	layui.common.modal(param);
	});
	
});