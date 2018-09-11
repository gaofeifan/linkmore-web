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
	var typeHtml = '';
	var typeList = null;
	var typeMap = layui.common.map();
	layui.common.ajax({
		url:'/admin/base/dict/group_list',
		data:{code:'coupon-subject-type',time:new Date().getTime()}, 
		async:false,
		success:function(list){
			typeList = list;
			typeHtml = '<option value="0">选择类型</option>';
			$.each(list,function(index,region){
				typeMap.put(region.orderIndex,region);
				typeHtml += '<option value="'+region.orderIndex+'">';
				typeHtml += region.name;
				typeHtml += '</option>';
			});
			$('#search-type').html(typeHtml);
			form.render('select');
		},error:function(){
			
		}
	});
	
	var comboHtml = '';
	var comboList = null;
	var comboMap = layui.common.map();
	layui.common.ajax({
		url:'/admin/coupon_subject/combo_list',
		data:{comboType:3,time:new Date().getTime()}, 
		async:false,
		success:function(list){
			comboList = list;
			comboHtml = '<option value="0">选择类型</option>';
			$.each(list,function(index,region){
				comboMap.put(region.id,region);
				comboHtml += '<option value="'+region.id+'">';
				comboHtml += region.name;
				comboHtml += '</option>';
			});
		},error:function(){
			
		}
	});
	
	var packHtml = '';
	var packList = null;
	var packMap = layui.common.map();
	layui.common.ajax({
		url:'/admin/coupon_subject/pack_list',
		data:{comboType:3,time:new Date().getTime()}, 
		async:false,
		success:function(list){
			packList = list;
			packHtml = '<option value="0">选择类型</option>';
			$.each(packList,function(index,region){
				packMap.put(region.id,region);
				packHtml += '<option value="'+region.id+'">';
				packHtml += region.packName;
				packHtml += '</option>';
			});
		},error:function(){
			
		}
	});
	
	var addServerParams = function(data){  
		var searchTitle = $('#search-title').val();
		var searchOperatorName = $('#search-operatorname').val();
		var filters = new Array();
		var filter = null; 
		if(searchTitle!=''){
			filter = new Object();
			filter.property = 'title';
			filter.value = '%'+searchTitle +'%';
			filters.push(filter);
		}
		if(searchOperatorName!=''){
			filter = new Object();
			filter.property = 'operatorName';
			filter.value = '%'+searchOperatorName +'%';
			filters.push(filter);
		}
		var searchStatus = $('#search-status').val();
		if(searchStatus != -1){
			filter = new Object();
			filter.property = 'status';
			filter.value = searchStatus;
			filters.push(filter);
		}
		var searchType = $('#search-type').val();
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
	
	var draw = function(settings, json){
		$(".operation-start").unbind('click').bind('click',startSubject);
		$(".operation-stop").unbind('click').bind('click',stopSubject);
	};
	
	function startSubject() {
		var id = $(this).attr('data-start-id');
		layui.msg.confirm('您确定要上线',function(){
			layui.common.ajax({
				url:'/admin/coupon_subject/start',
				data:JSON.stringify(id),
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
    }
	
	function stopSubject() {
		var id = $(this).attr('data-stop-id');
		layui.msg.confirm('您确定要下线',function(){
			layui.common.ajax({
				url:'/admin/coupon_subject/stop',
				data:JSON.stringify(id),
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
    }
	
	var datatable = layui.datatable.init({
		id:'subject-table',
		url:'/admin/coupon_subject/list', 
		key:'id',
		columns:[ 
			{ sTitle: '标题',   mData: 'title'}, 
			{ sTitle: '摘要',   mData: 'intro'}, 
			{ sTitle: '类型',   mData: 'type' ,
	          	mRender:function(mData,type,full){ 
	          		var industry = typeMap.get(mData);
	          		var html = '';
	          		if(industry!=null){
	          			html = industry.name;
	          		}
	          		return html;
	          	}
			} ,
			{
				sTitle: '套餐名',
	          	mData: 'comboId' ,
	          	mRender:function(mData,type,full){ 
	          		var industry = comboMap.get(mData);
	          		var html = '';
	          		if(industry!=null){
	          			html = industry.name;
	          		}
	          		return html;
	          	}
			} ,{
				sTitle: '包名',
	          	mData: 'packId',
	          	mRender:function(mData,type,full){ 
	          		var pack = packMap.get(mData);
	          		var html = '';
	          		if(pack != null){
	          			html = pack.packName;
	          		}
	          		return html;
	          	}
			} ,
			{ sTitle: '创建人',   mData: 'operatorName'}, 
			{
				sTitle: '创建时间',
	          	mData: 'createTime',
	          	bSortable: true,
	          	mRender:function(mData,type,full){
	          		 return new Date(mData).format('yyyy-MM-dd hh:mm');
	          	}
			},
			{
				sTitle: '操作',
	          	mRender:function(mData,type,full){
	          		var html ='';
	          		if(full.status==0){
	          			html += '<a class="operation-start" data-start-id="'+full.id+'" href="javascript:void(0);">上线</a>';
	          		} else{
	          			html += '<a class="operation-stop" data-stop-id="'+full.id+'" href="javascript:void(0);">下线</a>';
	          		}
	          		return html;
	          	}
			}
		],
		orderIndex:7,
		orderType:'desc',
		draw:draw,
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
				url:'/admin/coupon_subject/delete',
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
		$('#subject-add-form select[name=type]').html(typeHtml);
    	$('#subject-add-form select[name=comboId]').html(comboHtml);
    	$('#subject-add-form select[name=packId]').html(packHtml);
		form.render('select'); 
		$('#subject-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		$('#subject-add-button').bind('click',function(){
        	if(validate.valid()){
        		
        		var type = $('#subject-add-form select[name=type]').val();
        		var comboId = $('#subject-add-form select[name=comboId]').val();
        		var packId = $('#subject-add-form select[name=packId]').val();
        		
        		if(type == 0){
        			layui.msg.error('请选择类别!');
        			return false;
        		}
        		if(comboId == 0){
        			layui.msg.error('请选择优惠套餐!');
        			return false;
        		}
        		if(packId == 0){
        			layui.msg.error('请选择优惠包!');
        			return false;
        		}
        		layui.common.ajax({
        			url:'/admin/coupon_subject/save',
        			data:$('#subject-add-form').serialize(),
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
    	valid.id = "subject-add-form";
    	valid.rules = {
    		title:{
    			rangelength:[1,32] ,
    			required: true,
    			remote:{
    				url:"/admin/coupon_subject/check",  
    				data:{
    					property:"title",
    					value:function(){return $('#subject-add-form input[name=title]').val();},
    					id:function(){return new Date().getTime();}
    				}
    			}
    		},intro:{
    			required: true,
    			maxlength: 50
    		},url:{   
    			required: true,
    			maxlength: 255
    		},imgUrl:{
    			required: true,
    			maxlength: 255
    		}
    	};
    	valid.messages = {
    		title:{
    			rangelength:'名称长度应在[1,32]内', 
    			required: '请填写名称',
    			remote:'名称已经存在'
    		},intro:{
    			required: '请输入摘要内容',
				maxlength: '长度不能超过50'
    		},url:{   
    			required: '请输入URL',
				maxlength: '长度不能超过255'
    		},imgUrl:{
    			required: '请输入图片URL',
				maxlength: '长度不能超过255'
    		}
    	}; 
    	param.validate = valid;
    	param.width = 700;
    	param.init = addInit;
    	layui.common.modal(param);  
    });
    
    
    var editInit = function(validate,lindex){
    	$('#subject-edit-form select[name=type]').html(typeHtml);
    	$('#subject-edit-form select[name=comboId]').html(comboHtml);
    	$('#subject-edit-form select[name=packId]').html(packHtml);
		var list = datatable.selected();  
		layui.common.set({
			id:'subject-edit-form',
			data:list[0]
		});
		form.render('select'); 
		$('#subject-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		$('#subject-edit-button').bind('click',function(){
        	if(validate.valid()){
        		
        		var type = $('#subject-edit-form select[name=type]').val();
        		var comboId = $('#subject-edit-form select[name=comboId]').val();
        		var packId = $('#subject-edit-form select[name=packId]').val();
        		
        		if(type == 0){
        			layui.msg.error('请选择类别!');
        			return false;
        		}
        		if(comboId == 0){
        			layui.msg.error('请选择优惠套餐!');
        			return false;
        		}
        		if(packId == 0){
        			layui.msg.error('请选择优惠包!');
        			return false;
        		}
        		
        		layui.common.ajax({
        			url:'/admin/coupon_subject/update',
        			data:$('#subject-edit-form').serialize(),
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
    	valid.id = "subject-edit-form";
    	valid.rules = {
			title:{
				rangelength:[1,32] ,
				required: true,
				remote:{
					url:"/admin/coupon_subject/check",  
					data:{
						property:"title",
						value:function(){return $('#subject-edit-form input[name=title]').val();},
						id:function(){return $('#subject-edit-form input[name=id]').val();}
					}
				}
			},intro:{
				required: true,
				maxlength: 50
			},url:{   
				required: true,
				maxlength: 255
			},imgUrl:{
				required: true,
				maxlength: 255
			}
		};
		valid.messages = {
			title:{
				rangelength:'名称长度应在[1,32]内', 
				required: '请填写名称',
				remote:'名称已经存在'
			},intro:{
				required: '请输入摘要内容',
				maxlength: '长度不能超过50'
			},url:{   
				required: '请输入URL',
				maxlength: '长度不能超过255'
			},imgUrl:{
				required: '请输入图片URL',
				maxlength: '长度不能超过255'
			}
    	}; 
    	param.validate = valid;
    	param.width = 700;
    	param.init = editInit;
    	layui.common.modal(param);  
    });
    
});


