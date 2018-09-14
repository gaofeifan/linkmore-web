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
	var layer = layui.layer;  
	var $ = layui.jquery; 
	var form = layui.form;  
	var addServerParams = function(data){   
		var searchName = $('#search-name').val();
		var filters = new Array();
		var filter = null; 
		if(searchName!=''){
			filter = new Object();
			filter.property = 'realname';
			filter.value = '%'+searchName +'%';
			filters.push(filter);
		} 
		var searchCode = $('#search-mobile').val();
		if(searchCode!=''){
			filter = new Object();
			filter.property = 'username';
			filter.value = searchCode;
			filters.push(filter);
		}
		 
		if(filters.length>0){
			data.push({name:'filterJson',value:JSON.stringify({filters:filters})});
		}
	};
	var datatable = layui.datatable.init({
		id:'staff-table',
		url:'/admin/account/staff/list', 
		key:'id',
		columns:[ 
			{ sTitle: '姓名',   mData: 'realname'}, 
			{ sTitle: '手机号',   mData: 'username'},  
			{
				sTitle: '状态',
	          	mData: 'status' ,
	          	bSortable: true,
	          	mRender:function(mData,type,full){ 
	          		var html = ''; 
	          		if(full.status==0){
	          			html = '<label style="color:gray;">禁用</label>';
	          		} else if(full.status==1){
	          			html = '<label style="color:green;">启用</label>'; 
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
		filter:addServerParams
	});  
	
	var query =  function(){
		datatable.reload();
		
	} ;  
	$('.search_btn').bind('click',function(){
		query();
	});  
	 
	 
	var addInit = function(validate,lindex){   
		form.render('select'); 
		form.render('checkbox'); 
		$('#staff-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		$('#staff-add-button').bind('click',function(){
        	if(validate.valid()){  
        		layui.common.ajax({
        			url:'/admin/account/staff/save',
        			data:$('#staff-add-form').serialize(),
        			success:function(res){
        				if(res.success){
        					layui.layer.close(lindex);
        					layui.msg.success(res.content);
        					window.setTimeout(query,1000);
        				}else{
        					layui.msg.error(res.content);
        					window.setTimeout(query,1000);
        				}
        			} ,error:function(){
    					layui.msg.error("网络异常");
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
    	valid.id = "staff-add-form";
    	valid.rules = {
    		realname:{
    			rangelength:[1,6] ,
    			required: true,
    			remote:{
    				url:"/admin/account/staff/check",  
    				data:{
    					property:"realname",
    					value:function(){return $('#staff-add-form input[name=realname]').val();},
    					id:function(){return new Date().getTime();}
    				}
    			}
    		},username:{
    			mobile:true,  
    			required: true,
    			remote:{
    				url:"/admin/account/staff/check",  
    				data:{
    					property:"username",
    					value:function(){return $('#staff-add-form input[name=username]').val();},
    					id:function(){return new Date().getTime();}
    				}
    			}
    			
    		}  
    	};
    	valid.messages = {
    		realname:{
    			rangelength:'姓名长度应在[1,6]内', 
    			required: '请填写姓名',
    			remote:'姓名已经存在'
    		},username:{
    			mobile:'请输入有效手机号',  
    			required: '请填写手机号',
    			remote:'手机号已经存在'
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
			id:'staff-edit-form',
			data:list[0]
		});
		form.render('select'); 
		form.render('checkbox'); 
		$('#staff-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		$('#staff-update-button').bind('click',function(){
        	if(validate.valid()){  
        		layui.common.ajax({
        			url:'/admin/account/staff/update',
        			data:$('#staff-edit-form').serialize(),
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
    	valid.id = "staff-edit-form";
    	valid.rules = {
    		realname:{
    			rangelength:[1,6] ,
    			required: true,
    			remote:{
    				url:"/admin/account/staff/check",  
    				data:{
    					property:"realname",
    					value:function(){return $('#staff-edit-form input[name=realname]').val();},
    					id:function(){return $('#staff-edit-form input[name=id]').val();}
    				}
    			}
    		},username:{
    			mobile:true,  
    			required: true,
    			remote:{
    				url:"/admin/account/staff/check",  
    				data:{
    					property:"username",
    					value:function(){return $('#staff-edit-form input[name=username]').val();},
    					id:function(){return $('#staff-edit-form input[name=id]').val();}
    				}
    			}
    			
    		}  
    	};
    	valid.messages = {
    		realname:{
    			rangelength:'姓名长度应在[1,6]内', 
    			required: '请填写姓名',
    			remote:'姓名已经存在'
    		},username:{
    			mobile:'请输入有效手机号',  
    			required: '请填写手机号',
    			remote:'手机号已经存在'
    		} 
    	}; 
    	param.validate = valid;
    	param.width = 600;
    	param.init = editInit;
    	layui.common.modal(param);  
    });
});