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
	var categoryHtml = '';
	var categoryList = null;
	var categoryMap = layui.common.map();
	layui.common.ajax({
		url:'/admin/base/dict/group_list',
		data:{code:'security-page-category',time:new Date().getTime()}, 
		async:false,
		success:function(list){
			categoryList = list;
			categoryHtml = '<option value="0">选择分类</option>';
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
		var searchStatus = $('#search-status').val();
		if(searchStatus!='-1'){
			filter = new Object();
			filter.property = 'status';
			filter.value = searchStatus;
			filters.push(filter);
		}
		var searchCategory = $('#search-category').val();
		if(searchCategory!=0){
			filter = new Object();
			filter.property = 'categoryId';
			filter.value = searchCategory;
			filters.push(filter);
		}
		if(filters.length>0){
			data.push({name:'filterJson',value:JSON.stringify({filters:filters})});
		}
	};
	var datatable = layui.datatable.init({
		id:'page-table',
		url:'/admin/security/page/list', 
		key:'id',
		columns:[ 
			{ sTitle: '名称',   mData: 'name'}, 
			{ sTitle: '路径',   mData: 'path'}, 
			{
				sTitle: '分类',
	          	mData: 'categoryId' ,
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
		orderIndex:5,
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
		$.each(list,function(index,page){
			ids.push(page.id);
		});
		layui.msg.confirm('您确定要删除',function(){
			layui.common.ajax({
				url:'/admin/security/page/delete',
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
		$('#page-add-form select[name=categoryId]').html(categoryHtml);
		form.render('select'); 
		form.render('checkbox'); 
		$('#page-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		$('#page-add-button').bind('click',function(){
        	if(validate.valid()){  
        		layui.common.ajax({
        			url:'/admin/security/page/save',
        			data:$('#page-add-form').serialize(),
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
    	valid.id = "page-add-form";
    	valid.rules = {
    		name:{
    			rangelength:[1,100] ,
    			required: true,
    			remote:{
    				url:"/admin/security/page/check",  
    				data:{
    					property:"name",
    					value:function(){return $('#page-add-form input[name=name]').val();},
    					id:function(){return new Date().getTime();}
    				}
    			}
    		},path:{
    			rangelength:[1,100],  
    			required: true,
    			remote:{
    				url:"/admin/security/page/check",  
    				data:{
    					property:"path",
    					value:function(){return $('#page-add-form input[name=path]').val();},
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
    			required: '请填写样式名',
    			remote:'路径资源已经存在'
    		} 
    	}; 
    	param.validate = valid;
    	param.width = 600;
    	param.init = addInit;
    	layui.common.modal(param);  
    });
    
    
    var editInit = function(validate,lindex){  
    	$('#page-edit-form select[name=categoryId]').html(categoryHtml);
		var list = datatable.selected();  
		layui.common.set({
			id:'page-edit-form',
			data:list[0]
		});
		form.render('select'); 
		form.render('checkbox'); 
		$('#page-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		$('#page-update-button').bind('click',function(){
        	if(validate.valid()){  
        		layui.common.ajax({
        			url:'/admin/security/page/update',
        			data:$('#page-edit-form').serialize(),
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
    	valid.id = "page-edit-form";
    	valid.rules = {
    		name:{
    			rangelength:[1,32] ,
    			required: true,
    			remote:{
    				url:"/admin/security/page/check",  
    				data:{
    					property:"name",
    					value:function(){return $('#page-edit-form input[name=name]').val();},
    					id:function(){return $('#page-edit-form input[name=id]').val();}
    				}
    			}
    		},path:{
    			rangelength:[1,100],  
    			required: true ,
    			remote:{
    				url:"/admin/security/page/check",  
    				data:{
    					property:"path",
    					value:function(){return $('#page-edit-form input[name=path]').val();},
    					id:function(){return $('#page-edit-form input[name=id]').val();}
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
    			required: '请填写样访问路径',
    			remote:'路径资源已经存在'
    		} 
    	}; 
    	param.validate = valid;
    	param.width = 600;
    	param.init = editInit;
    	layui.common.modal(param);  
    });
});