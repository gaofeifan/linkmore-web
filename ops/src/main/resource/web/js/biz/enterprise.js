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
	var regionHtml = '';
	var regionList = null;
	var regionMap = layui.common.map();
	layui.common.ajax({
		url:'/admin/base/dict/group_list',
		data:{code:'biz-enterprise-region',time:new Date().getTime()}, 
		async:false,
		success:function(list){
			regionList = list;
			regionHtml = '<option value="0">选择区域</option>';
			$.each(list,function(index,region){
				regionMap.put(region.id,region);
				regionHtml += '<option value="'+region.id+'">';
				regionHtml += region.name;
				regionHtml += '</option>';
			});
			$('#search-region').html(regionHtml);
			form.render('select');
		},error:function(){
			
		}
	});
	var industryHtml = '';
	var industryList = null;
	var industryMap = layui.common.map();
	layui.common.ajax({
		url:'/admin/base/dict/group_list',
		data:{code:'biz-enterprise-industry',time:new Date().getTime()}, 
		async:false,
		success:function(list){
			industryList = list;
			industryHtml = '<option value="0">选择行业</option>';
			$.each(list,function(index,industry){
				industryMap.put(industry.id,industry);
				industryHtml += '<option value="'+industry.id+'">';
				industryHtml += industry.name;
				industryHtml += '</option>';
			});
			$('#search-industry').html(industryHtml);
			form.render('select');
		},error:function(){
			
		}
	});
	
	// 车区列表
	var preHtml = '';
	var preMap = layui.common.map();
	layui.common.ajax({
		url:'/admin/biz/prefecture/selectList',
		async:false,
		success:function(list){
			preHtml = '<option value="0">选择车区</option>';
			$.each(list,function(index,pre){
				preHtml += '<option value="'+pre.id+'">';
				preHtml += pre.name;
				preHtml += '</option>';
				preMap.put(pre.id,pre);
			});
			$('#preId').html(preHtml);
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
		var searchIndustry = $('#search-industry').val();
		if(searchIndustry!=0){
			filter = new Object();
			filter.property = 'industry';
			filter.value = searchIndustry;
			filters.push(filter);
		}
		var searchRegion = $('#search-region').val();
		if(searchRegion!=0){
			filter = new Object();
			filter.property = 'region';
			filter.value = searchRegion;
			filters.push(filter);
		}
		if(filters.length>0){
			data.push({name:'filterJson',value:JSON.stringify({filters:filters})});
		}
	};
	var datatable = layui.datatable.init({
		id:'enterprise-table',
		url:'/admin/biz/enterprise/list', 
		key:'id',
		columns:[ 
			{ sTitle: '名称',   mData: 'name'}, 
			{ sTitle: '账号',   mData: 'account'}, 
			{ sTitle: '电话',   mData: 'tellphone'}, 
			{
				sTitle: '行业',
	          	mData: 'industry' ,
	          	bSortable: true,
	          	mRender:function(mData,type,full){ 
	          		var industry = industryMap.get(mData);
	          		var html = '';
	          		if(industry!=null){
	          			html = industry.name;
	          		}
	          		return html;
	          	}
			} ,{
				sTitle: '地区',
	          	mData: 'region' ,
	          	bSortable: true,
	          	mRender:function(mData,type,full){ 
	          		var region = regionMap.get(mData);
	          		var html = '';
	          		if(region!=null){
	          			html = region.name;
	          		}
	          		return html;
	          	}
			} ,
			{
				sTitle: '车区',
	          	mData: 'preId' ,
	          	bSortable: true,
	          	mRender:function(mData,type,full){ 
	          		var pre = preMap.get(mData);
	          		var html = '';
	          		if(pre!=null){
	          			html = pre.name;
	          		}
	          		return html;
	          	}
			} ,
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
	$('#search-button').bind('click',function(){
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
				url:'/admin/biz/enterprise/delete',
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
		$('#enterprise-add-form select[name=industry]').html(industryHtml);
		$('#enterprise-add-form select[name=region]').html(regionHtml);
		$('#enterprise-add-form select[name=preId]').html(preHtml);
		form.render('select'); 
		form.render('checkbox'); 
		$('#enterprise-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		$('#enterprise-add-button').bind('click',function(){
        	if(validate.valid()){  
        		layui.common.ajax({
        			url:'/admin/biz/enterprise/save',
        			data:$('#enterprise-add-form').serialize(),
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
    	valid.id = "enterprise-add-form";
    	valid.rules = {
    		name:{
    			rangelength:[1,100] ,
    			required: true,
    			remote:{
    				url:"/admin/biz/enterprise/check",  
    				data:{
    					property:"name",
    					value:function(){return $('#enterprise-add-form input[name=name]').val();},
    					id:function(){return new Date().getTime();}
    				}
    			}
    		},account:{
    			rangelength:[5,32],  
    			required: true,
    			remote:{
    				url:"/admin/security/person/check",  
    				data:{
    					property:"username",
    					value:function(){return $('#enterprise-add-form input[name=account]').val();},
    					id:function(){return new Date().getTime();}
    				}
    			} 
    		},tellphone:{
    			tellphone:true,  
    			required: true
    		},password:{   
    			required: true,
    			rangelength:[5,32] 
    		},address:{
    			rangelength:[1,100] 
    		},code:{
    			required: true,
    			rangelength:[1,10] 
    		} 
    	};
    	valid.messages = {
    		name:{
    			rangelength:'名称长度应在[1,32]内', 
    			required: '请填写名称',
    			remote:'名称已经存在'
    		},account:{
    			rangelength:'账号长度应该在[5,32]内',  
    			required: '请填写账号',
    			remote:'账号已经存在'
    		},tellphone:{
    			tellphone:'请输入有效的电话号码',  
    			required: '电话号码不能为空'
    		},password:{   
    			required: '密码不能为空',
    			rangelength:'密码长度需在[5,32]范围内'
    		} ,address:{
    			rangelength:'地址长度需在[1,100]范围内'
    		}, code:{
    			required: '必须输入订单前戳',
    			rangelength:'订单长度应在[1-10]范围内'
    		} 
    	}; 
    	param.validate = valid;
    	param.width = 600;
    	param.init = addInit;
    	layui.common.modal(param);  
    });
    
    
    var editInit = function(validate,lindex){  
    	$('#enterprise-edit-form select[name=industry]').html(industryHtml);
    	$('#enterprise-edit-form select[name=region]').html(regionHtml);
    	$('#enterprise-edit-form select[name=preId]').html(preHtml);
		var list = datatable.selected();  
		layui.common.set({
			id:'enterprise-edit-form',
			data:list[0]
		});
		form.render('select'); 
		form.render('checkbox'); 
		$('#enterprise-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		$('#enterprise-update-button').bind('click',function(){
        	if(validate.valid()){  
        		layui.common.ajax({
        			url:'/admin/biz/enterprise/update',
        			data:$('#enterprise-edit-form').serialize(),
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
    	var param = new Object();
    	param.url = 'edit.html';
    	param.title = '编辑信息'; 
    	var valid = new Object();
    	valid.id = "enterprise-edit-form";
    	valid.rules = {
    		name:{
    			rangelength:[1,100] ,
    			required: true,
    			remote:{
    				url:"/admin/biz/enterprise/check",  
    				data:{
    					property:"name",
    					value:function(){return $('#enterprise-edit-form input[name=name]').val();},
    					id:function(){return $('#enterprise-edit-form input[name=id]').val();}
    				}
    			}
    		},tellphone:{
    			tellphone:true,  
    			required: true
    		},address:{
    			rangelength:[1,100] 
    		} 
    	};
    	valid.messages = {
    		name:{
    			rangelength:'名称长度应在[1,32]内', 
    			required: '请填写名称',
    			remote:'名称已经存在'
    		},tellphone:{
    			tellphone:'请输入有效的电话号码',  
    			required: '电话号码不能为空'
    		},address:{
    			rangelength:'地址长度需在[1,100]范围内'
    		} 
    	}; 
    	param.validate = valid;
    	param.width = 600;
    	param.init = editInit;
    	layui.common.modal(param);  
    });
    
    
    var passwordInit = function(validate,lindex){   
		var list = datatable.selected();  
		layui.common.set({
			id:'enterprise-password-form',
			data:list[0]
		}); 
		$('#enterprise-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		$('#enterprise-add-button').bind('click',function(){
        	if(validate.valid()){  
        		layui.common.ajax({
        			url:'/admin/biz/enterprise/set_password',
        			data:$('#enterprise-password-form').serialize(),
        			success:function(res){
        				if(res.success){
        					layui.layer.close(lindex);
        					layui.msg.success(res.content); 
        				}else{
        					layui.msg.error(res.content);
        				}
        			} 
        		});
        	}
        });
	};
    $('#passwd-button').bind('click',function(){
    	var list = datatable.selected(); 
		if(list.length!=1){
			layui.msg.error('请选择一条记录进行编辑');
			return false;
		}
    	var param = new Object();
    	param.url = 'password.html';
    	param.title = '修改密码'; 
    	var valid = new Object();
    	valid.id = "enterprise-password-form";
    	valid.rules = {
    		password:{ 
    			required: true,
    			rangelength:[5,32] 
    		} 
    	};
    	valid.messages = {
    		password:{ 
    			required: '密码不能为空',
    			rangelength:'密码长度应该在[5,32]范围内'
    		} 
    	}; 
    	param.validate = valid;
    	param.width = 600;
    	param.init = passwordInit;
    	layui.common.modal(param);  
    });
});