layui.config({
	base: 'js/lib/'
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
	var templateHtml = '';
	var templateList = null;
	var templateMap = layui.common.map();
	
	var enterpriseHtml = '';
	var enterpriseList = null;
	var enterpriseMap = layui.common.map();
	
	layui.common.ajax({
		url:'/admin/base/dict/group_list',
		data:{code:'coupon-template',time:new Date().getTime()}, 
		async:false,
		success:function(list){
			templateList = list;
			templateHtml = '<option value="0">选择模板</option>';
			$.each(list,function(index,template){
				templateMap.put(template.id,template);
				templateHtml += '<option value="'+template.id+'">';
				templateHtml += template.name;
				templateHtml += '</option>';
			});
			$('#search-template').html(templateHtml);
			form.render('select');
		},error:function(){
			
		}
	}); 
	layui.common.ajax({
		url:'/admin/coupon/theme/enterprise_list',
		data:{time:new Date().getTime()}, 
		async:false,
		success:function(list){
			enterpriseList = list;
			enterpriseHtml = '<option value="0">选择企业</option>';
			$.each(list,function(index,enterprise){
				enterpriseMap.put(enterprise.id,enterprise);
				enterpriseHtml += '<option value="'+enterprise.id+'">';
				enterpriseHtml += enterprise.name;
				enterpriseHtml += '</option>';
			}); 
		},error:function(){
			
		}
	});
	
	var addServerParams = function(data){   
		var searchName = $('#search-name').val();
		var searchRemark = $('#search-remark').val();
		var searchTemplate = $('#search-template').val();
		var filters = new Array();
		var filter = null; 
		if(searchTemplate!='0'){
			filter = new Object();
			filter.property = 'templateId';
			filter.value = searchTemplate;
			filters.push(filter);
		}
		if(searchName!=''){
			filter = new Object();
			filter.property = 'enterpriseName';
			filter.value = '%'+searchName +'%';
			filters.push(filter);
		}  
		if(searchRemark!=''){
			filter = new Object();
			filter.property = 'remark';
			filter.value = '%'+searchRemark +'%';
			filters.push(filter);
		}  
		if(filters.length>0){
			data.push({name:'filterJson',value:JSON.stringify({filters:filters})});
		}
	};
	var datatable = layui.datatable.init({
		id:'theme-table',
		url:'/admin/coupon/theme/list', 
		key:'id',
		columns:[ 
			{ sTitle: '企业名称',   mData: 'enterpriseName'},
			{ sTitle: '备注',  mData: 'remark'} , 
			{ sTitle: '模板',  mData: 'templateName'}, 
			{ 
				sTitle: 'LOGO',
				mData: 'logoUrl',
				mRender:function(mData,type,full){  
	          		var html = '<img style="height:20px;" src="'+mData+'"/>';
	          		return html;
	          	}
			} , 
			{ sTitle: '联系电话', mData: 'tellphone'} ,
			{ sTitle: '联系地址',  mData: 'address'},
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
		orderIndex:8,
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
		if(list.length!=1){
			layui.msg.error('请选择一条记录');
			return false;
		}
		var ids = new Array();
		$.each(list,function(index,dg){
			ids.push(dg.id);
		});
		layui.msg.confirm('您确定要删除',function(){
			layui.common.ajax({
				url:'/admin/coupon/theme/delete',
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
	
	function addImage(){
    	var data = new FormData($('#add-image-form')[0]); 
		layui.common.upload({
			url:'/admin/base/attachment/image_upload',
			data:data,
			success:function(res){
				if(res.success){   
					$('#add-logo-image').attr('src', 'http://oss.pabeitech.com/'+res.map.attach.originalUrl);
	        		$('#theme-add-form input[name=logoUrl]').val('http://oss.pabeitech.com/'+res.map.attach.originalUrl); 
				}else{
					layui.msg.error(res.content);
				} 
			} 
		});  
    }
	var addInit = function(validate,lindex){   
		$('#theme-add-form select[name=templateId]').html(templateHtml); 
		$('#theme-add-form select[name=enterpriseId]').html(enterpriseHtml); 
		form.render('select'); 
		form.render('checkbox'); 
		$('#theme-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		$('#add_image_file').unbind('change').bind('change',addImage);
		$('#theme-add-button').bind('click',function(){
        	if(validate.valid()){  
        		var tplid = $('#theme-add-form select[name=templateId]').val();
        		var entid = $('#theme-add-form select[name=enterpriseId]').val();
        		
        		if(tplid=='0'){
        			layui.msg.tips('请选择模板');
        			return false;
        		}
        		if(entid=='0'){
        			layui.msg.tips('请选择企业');
        			return false;
        		}
        		var logoUrl = $('#theme-add-form input[name=logoUrl]').val();
        		if(logoUrl==''){
        			layui.msg.tips('请上传图片');
        			return false;
        		}
        		var template = templateMap.get(tplid);
        		var enterprise = enterpriseMap.get(entid);
        		$('#theme-add-form input[name=enterpriseName]').val(enterprise.name);
        		$('#theme-add-form input[name=templateName]').val(template.name);
        		$('#theme-add-form input[name=templateCode]').val(template.code);  
        		layui.common.ajax({
        			url:'/admin/coupon/theme/save',
        			data:$('#theme-add-form').serialize(),
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
    	valid.id = "theme-add-form";
    	valid.rules = {
    		remark:{
    			rangelength:[1,32] ,
    			required: true
    		},aboutUrl:{ 
    			required: true, 
    			url: true
    		},tellphone:{
    			tellphone:true,
    			required: true
    		},address:{ 
    			rangelength:[1,32] ,
    			required: true
    		} 
    	};
    	valid.messages = {
			remark:{
    			rangelength:'备注长度应在[1,32]内', 
    			required:'请填写备注内容'
    		},aboutUrl:{ 
    			required:'请填写链接', 
    			url:'请输入有效的链接地址'
    		},tellphone:{
    			tellphone:'请填写有效的联系电话',
    			required: '请填写 联系电话'
    		} ,address:{ 
    			rangelength:'地址长度应在[1,32]内', 
    			required:'请填写地址'
    		}
    	}; 
    	param.validate = valid;
    	param.width = 600;
    	param.init = addInit;
    	layui.common.modal(param);  
    });
    
    function editImage(){
    	var data = new FormData($('#edit-image-form')[0]); 
		layui.common.upload({
			url:'/admin/base/attachment/image_upload',
			data:data,
			success:function(res){
				if(res.success){   
					$('#edit-logo-image').attr('src', 'http://oss.pabeitech.com/'+res.map.attach.originalUrl);
	        		$('#theme-edit-form input[name=logoUrl]').val('http://oss.pabeitech.com/'+res.map.attach.originalUrl); 
				}else{
					layui.msg.error(res.content);
				} 
			} 
		});  
    }
    var editInit = function(validate,lindex){  
    	$('#theme-edit-form select[name=templateId]').html(templateHtml); 
		var list = datatable.selected();  
		layui.common.set({
			id:'theme-edit-form',
			data:list[0]
		});
		$('#edit-logo-image').attr('src', list[0].logoUrl);
		form.render('select'); 
		form.render('checkbox'); 
		$('#theme-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		$('#edit_image_file').unbind('change').bind('change',editImage);
		$('#theme-update-button').bind('click',function(){
        	if(validate.valid()){  
        		var tplid = $('#theme-edit-form select[name=templateId]').val();
        		var entid = $('#theme-edit-form select[name=enterpriseId]').val();
        		if(tplid=='0'){
        			layui.msg.tips('请选择模板');
        			return false;
        		} 
        		var template = templateMap.get(tplid); 
        		$('#theme-edit-form input[name=templateName]').val(template.name);
        		$('#theme-edit-form input[name=templateCode]').val(template.code);  
        		var logoUrl = $('#theme-add-form input[name=logoUrl]').val();
        		if(logoUrl==''){
        			layui.msg.tips('请上传图片');
        			return false;
        		}
        		layui.common.ajax({
        			url:'/admin/coupon/theme/update',
        			data:$('#theme-edit-form').serialize(),
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
    	valid.id = "theme-edit-form";
    	valid.rules = {
    		remark:{
    			rangelength:[1,32] ,
    			required: true
    		},logUrl:{ 
    			required: true
    		},aboutUrl:{ 
    			required: true, 
    			url: true
    		},tellphone:{
    			tellphone:true,
    			required: true
    		},address:{ 
    			rangelength:[1,32] ,
    			required: true
    		} 
    	};
    	valid.messages = {
			remark:{
    			rangelength:'备注长度应在[1,32]内', 
    			required:'请填写备注内容'
    		},logoUrl:{ 
    			required:'请上传LOGO图片'
    		},aboutUrl:{ 
    			required:'请填写链接', 
    			url:'请输入有效的链接地址'
    		},tellphone:{
    			tellphone:'请填写有效的联系电话',
    			required: '请填写 联系电话'
    		} ,address:{ 
    			rangelength:'地址长度应在[1,32]内', 
    			required:'请填写地址'
    		}
    	}; 
    	param.validate = valid;
    	param.width = 600;
    	param.init = editInit;
    	layui.common.modal(param);  
    });
});