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
		var searchCode = $('#search-code').val();
		var searchType = $('#search-type').val();
		var filters = new Array();
		var filter = null; 
		if(searchName!=''){
			filter = new Object();
			filter.property = 'name';
			filter.value = '%'+searchName +'%';
			filters.push(filter);
		}  
		if(searchCode!=''){
			filter = new Object();
			filter.property = 'code';
			filter.value = searchCode;
			filters.push(filter);
		}  
		if(searchType!=0){
			filter = new Object();
			filter.property = 'type';
			filter.value = searchType;
			filters.push(filter);
		}
		if(filters.length>0){
			data.push({name:'filterJson',value:JSON.stringify({filters:filters})});
		}
	};
	var datatable = layui.datatable.init({
		id:'staff-table',
		url:'/admin/staff/version/list', 
		key:'id',
		columns:[ 
			{ sTitle: '名称',   mData: 'name'},  
			{ sTitle: '版本',   mData: 'version'},  
			{ sTitle: '编号',  mData: 'code'}, 
			{
				sTitle: '分类',
	          	mData: 'type' ,
	          	bSortable: true,
	          	mRender:function(mData,type,full){
	          		var html = '<label style="color:green;">Android</label>';
	          		if(full.type==2){
	          			html = '<label style="color:gray;">iOS</label>';
	          		} 
	          		return html;
	          	}
			},{
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
	          		
	          		if(full.updateStatus==0){
	          			html += '<label style="color:blue;margin-left:10px;">选更</label>';
	          		}else if(full.updateStatus==1){
	          			html += '<label style="color:red;margin-left:10px;">强更</label>';
	          		}
	          		return html;
	          	}
			},
			{ sTitle: '下载地址',  mData: 'url'}, 
			{
				sTitle: '创建时间',
	          	mData: 'createTime' ,
	          	bSortable: true,
	          	mRender:function(mData,type,full){
	          		 return new Date(mData).format('yyyy-MM-dd hh:mm');
	          	}
			} 
		],
		orderIndex:7,
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
		$.each(list,function(index,dg){
			ids.push(dg.id);
		});
		layui.msg.confirm('您确定要删除',function(){
			layui.common.ajax({
				url:'/admin/staff/version/delete',
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
		form.render('select'); 
		form.render('checkbox'); 
		$('#staff-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		$('#staff-add-button').bind('click',function(){
        	if(validate.valid()){  
        		layui.common.ajax({
        			url:'/admin/staff/version/save',
        			data:$('#staff-add-form').serialize(),
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
    	valid.id = "staff-add-form";
    	valid.rules = {
    		name:{
    			rangelength:[1,32] ,
    			required: true,
    			remote:{
    				url:"/admin/staff/version/check",  
    				data:{
    					property:"name",
    					value:function(){return $('#staff-add-form input[name=name]').val();},
    					id:function(){return new Date().getTime();}
    				}
    			}
    		},version:{
    			rangelength:[1,32] ,
    			required: true
    		},code:{
    			digits:true,
    			required: true
    		},url:{ 
    			rangelength:[0,120] ,
    		},description:{ 
    			rangelength:[0,500] ,
    		} 
    	};
    	valid.messages = {
    		name:{
    			rangelength:'名称长度应在[1,32]内', 
    			required: '请填写名称',
    			remote:'名称已经存在'
    		},version:{
    			rangelength:'版本长度应在[1,32]内', 
    			required: '请填写版本'
    		},code:{
    			digits:'排序请输入编号',
    			required: '请填写编号'
    		},url:{ 
    			rangelength:'下载地址的长度应在[0,120]内' ,
    		},description:{ 
    			rangelength:'描述长度应在[0,500]内' ,
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
        			url:'/admin/staff/version/update',
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
    		name:{
    			rangelength:[1,32] ,
    			required: true,
    			remote:{
    				url:"/admin/staff/version/check",  
    				data:{
    					property:"name",
    					value:function(){return $('#app-version-edit-form input[name=name]').val();},
    					id:function(){return $('#app-version-edit-form input[name=id]').val();}
    				}
    			}
    		},version:{
    			rangelength:[1,32] ,
    			required: true
    		},code:{
    			digits:true,
    			required: true
    		},url:{ 
    			rangelength:[0,120] ,
    		},description:{ 
    			rangelength:[0,500] ,
    		} 
    	};
    	valid.messages = {
    		name:{
    			rangelength:'名称长度应在[1,32]内', 
    			required: '请填写名称',
    			remote:'名称已经存在'
    		},version:{
    			rangelength:'版本长度应在[1,32]内', 
    			required: '请填写版本'
    		},code:{
    			digits:'排序请输入编号',
    			required: '请填写编号'
    		},url:{ 
    			rangelength:'下载地址的长度应在[0,120]内' ,
    		},description:{ 
    			rangelength:'描述长度应在[0,500]内' ,
    		}
    	}; 
    	param.validate = valid;
    	param.width = 600;
    	param.init = editInit;
    	layui.common.modal(param);  
    });
});