layui.config({
	base: '/js/lib/'
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
	
	
	var categoryHtml = '';
	var categoryList = null;
	var categoryMap = layui.common.map();
	layui.common.ajax({
		url:'/admin/base/dict/group_list',
		data:{code:'security-clazz-category',time:new Date().getTime()}, 
		async:false,
		success:function(list){
			categoryList = list;
			categoryHtml = '<option value="0">选择模块</option>';
			$.each(list,function(index,category){
				categoryMap.put(category.id,category);
				categoryHtml += '<option value="'+category.id+'">';
				categoryHtml += category.name;
				categoryHtml += '</option>';
			});
			$('#search-category').html(categoryHtml);
			form.render('select');
		},error:function(){
			
		}
	});
	
	var addServerParams = function(data){  
		var searchName = $('#search-name').val();
		var filters = new Array();
		var filter = null; 
		if(searchName!=''){
			filter = new Object();
			filter.property = 'name';
			filter.value = '%'+searchName +'%';
			filters.push(filter);
		} 
		var searchPath = $('#search-path').val();
		if(searchPath!=''){
			filter = new Object();
			filter.property = 'path';
			filter.value = searchPath;
			filters.push(filter);
		}
		var searchPackage = $('#search-category').val();
		if(searchPackage!=0){
			filter = new Object();
			filter.property = 'packageId';
			filter.value = searchPackage;
			filters.push(filter);
		}
		if(filters.length>0){
			data.push({name:'filterJson',value:JSON.stringify({filters:filters})});
		}
	};
	var datatable = layui.datatable.init({
		id:'clazz-table',
		url:'/admin/security/clazz/list', 
		key:'id',
		columns:[ 
			{ sTitle: '名称',   mData: 'name'}, 
			{ sTitle: '路径',   mData: 'path'}, 
			{
				sTitle: '模块',
	          	mData: 'packageId' ,
	          	bSortable: true,
	          	mRender:function(mData,type,full){
	          		var category = categoryMap.get(mData);
	          		var html = '';
	          		if(category!=null){
	          			html = category.name;
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
	 
	$('#delete-button').bind('click',function(){
		var list = datatable.selected(); 
		if(list.length<1){
			layui.msg.error('请至少选择一条记录');
			return false;
		}
		var ids = new Array();
		$.each(list,function(index,clazz){
			ids.push(clazz.id);
		});
		layui.msg.confirm('您确定要删除',function(){
			layui.common.ajax({
				url:'/admin/security/clazz/delete',
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
		$('#clazz-add-form select[name=packageId]').html(categoryHtml);
		form.render('select'); 
		form.render('checkbox'); 
		$('#clazz-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		$('#clazz-add-button').bind('click',function(){
        	if(validate.valid()){  
        		layui.common.ajax({
        			url:'/admin/security/clazz/save',
        			data:$('#clazz-add-form').serialize(),
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
    	valid.id = "clazz-add-form";
    	valid.rules = {
    		name:{
    			rangelength:[1,100] ,
    			required: true,
    			remote:{
    				url:"/admin/security/clazz/check",  
    				data:{
    					property:"name",
    					value:function(){return $('#clazz-add-form input[name=name]').val();},
    					id:function(){return new Date().getTime();}
    				}
    			}
    		},path:{
    			rangelength:[1,100],  
    			required: true,
    			remote:{
    				url:"/admin/security/clazz/check",  
    				data:{
    					property:"path",
    					value:function(){return $('#clazz-add-form input[name=path]').val();},
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
    			rangelength:'路径长度应该在[1,100]内',  
    			required: '请填写访问路径',
    			remote:'路径资源已经存在'
    		} 
    	}; 
    	param.validate = valid;
    	param.width = 600;
    	param.init = addInit;
    	layui.common.modal(param);  
    });
    
    
    var editInit = function(validate,lindex){  
    	$('#clazz-edit-form select[name=packageId]').html(categoryHtml);
		var list = datatable.selected();  
		layui.common.set({
			id:'clazz-edit-form',
			data:list[0]
		});
		form.render('select'); 
		form.render('checkbox'); 
		$('#clazz-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		$('#clazz-update-button').bind('click',function(){
        	if(validate.valid()){  
        		layui.common.ajax({
        			url:'/admin/security/clazz/update',
        			data:$('#clazz-edit-form').serialize(),
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
    	valid.id = "clazz-edit-form";
    	valid.rules = {
    		name:{
    			rangelength:[1,32] ,
    			required: true,
    			remote:{
    				url:"/admin/security/clazz/check",  
    				data:{
    					property:"name",
    					value:function(){return $('#clazz-edit-form input[name=name]').val();},
    					id:function(){return $('#clazz-edit-form input[name=id]').val();}
    				}
    			}
    		},path:{
    			rangelength:[1,100],  
    			required: true ,
    			remote:{
    				url:"/admin/security/clazz/check",  
    				data:{
    					property:"path",
    					value:function(){return $('#clazz-edit-form input[name=path]').val();},
    					id:function(){return $('#clazz-edit-form input[name=id]').val();}
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
    			rangelength:'路径长度应该在[1,100]内',  
    			required: '请填写访问路径',
    			remote:'路径资源已经存在'
    		} 
    	}; 
    	param.validate = valid;
    	param.width = 600;
    	param.init = editInit;
    	layui.common.modal(param);  
    });
});