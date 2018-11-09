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
	 
	var addServerParams = function(data){  
		var searchSn = $('#search-sn').val();
		var filters = new Array();
		var filter = null; 
		if(searchSn!=''){
			filter = new Object();
			filter.property = 'sn';
			filter.value = searchSn;
			filters.push(filter);
		}   
		if(filters.length>0){
			data.push({name:'filterJson',value:JSON.stringify({filters:filters})});
		}
	};
	var datatable = layui.datatable.init({
		id:'stall-lock-table',
		url:'/admin/biz/stall_lock/list', 
		key:'id',
		columns:[ 
			{ sTitle: '序列号',   mData: 'sn'},  
			{ 
				sTitle: '状态',   
				mData: 'stallId',
				mRender:function(mData,type,full){
					var html = '<label style="color:green">空闲</label>';
	          		if(full.stallId!=null){
	          			html = '<label style="color:blue">占用</label>';
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
			},{ sTitle: '创建用户',   mData: 'createUserName'} 
		],
		orderIndex:3,
		orderType:'desc',
		filter:addServerParams
	});  
	
	var query =  function(){
		datatable.reload();
		
	} ;  
	$('#search-button').bind('click',function(){
		query();
	});  
	 
	$('#delete-button').bind('click',function(){
		var list = datatable.selected(); 
		if(list.length!=1){
			layui.msg.error('请选择一条记录');
			return false;
		}
		if(list[0].stallId != null){
			layui.msg.error('车位锁使用中');
			return false;
		}
		var ids = new Array();
		$.each(list,function(index,page){
			ids.push(page.id);
		});
		layui.msg.confirm('您确定要删除',function(){
			layui.common.ajax({
				url:'/admin/biz/stall_lock/delete',
				data:{id:list[0].id,time:new Date().getTime()}, 
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
		 
		$('#stall-lock-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		$('#stall-lock-add-button').bind('click',function(){
        	if(validate.valid()){  
        		layui.common.ajax({
        			url:'/admin/biz/stall_lock/save',
        			data:$('#stall-lock-add-form').serialize(),
        			success:function(res){
        				if(res.success){
        					layui.layer.close(lindex);
        					layui.msg.success(res.content);
        					window.setTimeout(query,1000);
        				}else{
        					layui.msg.error(res.content);
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
    	valid.id = "stall-lock-add-form";
    	valid.rules = {
    		sn:{
    			rangelength:[1,32] ,
    			required: true,
    			remote:{
    				url:"/admin/biz/stall_lock/check",  
    				data:{
    					property:"sn",
    					value:function(){return $('#stall-lock-add-form input[name=sn]').val();},
    					id:function(){return new Date().getTime();}
    				}
    			}
    		} 
    	};
    	valid.messages = {
    		sn:{
    			rangelength:'序号长度应在[1,32]内', 
    			required: '请填写序号',
    			remote:'序号已经存在'
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
			id:'stall-lock-edit-form',
			data:list[0]
		}); 
		$('#stall-lock-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		$('#stall-lock-update-button').bind('click',function(){
        	if(validate.valid()){  
        		layui.common.ajax({
        			url:'/admin/biz/stall_lock/update',
        			data:$('#stall-lock-edit-form').serialize(),
        			success:function(res){
        				if(res.success){
        					layui.layer.close(lindex);
        					layui.msg.success(res.content);
        					window.setTimeout(query,1000);
        				}else{
        					layui.msg.error(res.content);
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
		if(list[0].stallId != null){
			layui.msg.error('车位锁使用中');
			return false;
		}
    	var param = new Object();
    	param.url = 'edit.html';
    	param.title = '编辑信息'; 
    	var valid = new Object();
    	valid.id = "stall-lock-edit-form";
    	valid.rules = {
    		sn:{
    			rangelength:[1,32] ,
    			required: true,
    			remote:{
    				url:"/admin/biz/stall_lock/check",  
    				data:{
    					property:"sn",
    					value:function(){return $('#stall-lock-edit-form input[name=sn]').val();},
    					id:function(){return $('#stall-lock-edit-form input[name=id]').val();}
    				}
    			}
    		} 
    	};
    	valid.messages = {
    		sn:{
    			rangelength:'序号长度应在[1,32]内', 
    			required: '请填写序号',
    			remote:'序号已经存在'
    		}   
    	}; 
    	param.validate = valid;
    	param.width = 600;
    	param.init = editInit;
    	layui.common.modal(param);  
    }); 
    var addFileInit = function(validate,lindex){    
		$('#excel-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		$('#excel-add-button').bind('click',function(){
			var data = new FormData($( "#excel-add-form" )[0]); 
			layui.common.upload({
				url:'/admin/biz/stall_lock/import_excel',
				data:data,
				success:function(res){
					if(res.success){   
						layui.layer.close(lindex);
			    		layui.msg.success(res.content);
    					window.setTimeout(query,1000);
					}else{
						layui.msg.error(res.content);
					} 
				} 
			}); 
        });
	};
	
    $('#import-button').bind('click',function(){
    	var param = new Object();
    	param.url = 'add_excel.html';
    	param.title = '导入地锁';  
    	param.width = 600;
    	param.init = addFileInit;
    	layui.common.modal(param);  
    });
});