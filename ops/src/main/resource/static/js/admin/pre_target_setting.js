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
	var session = window.sessionStorage;
	var layer = layui.layer;  
	var $ = layui.jquery; 
	var form = layui.form;  
	
	
	var prefectureHtml = '';
	var prefectureList = null;
	var prefectureMap = layui.common.map();
	layui.common.ajax({
		url:'/admin/admin/pre_target_setting/prefecture_list',
		data:{code:'security-pre-target-setting-prefecture',time:new Date().getTime()}, 
		async:false,
		success:function(list){
			prefectureList = list;
			prefectureHtml = '<option value="0">选择车区</option>';
			$.each(list,function(index,prefecture){
				prefectureMap.put(prefecture.id,prefecture);
				prefectureHtml += '<option value="'+prefecture.id+'">';
				prefectureHtml += prefecture.name;
				prefectureHtml += '</option>';
			});
			$('#search-prefecture').html(prefectureHtml);
			form.render('select');
		},error:function(){
			
		}
	});
	
	 
	var addServerParams = function(data){   
		var filters = new Array();
		var filter = null;  
		var searchPrefecture = $('#search-prefecture').val();
		if(searchPrefecture!=0){
			filter = new Object();
			filter.property = 'prefectureId';
			filter.value = searchPrefecture;
			filters.push(filter);
		}
		if(filters.length>0){
			data.push({name:'filterJson',value:JSON.stringify({filters:filters})});
		}
	};
	var datatable = layui.datatable.init({
		id:'pre-target-setting-table',
		url:'/admin/admin/pre_target_setting/list', 
		key:'id',
		columns:[  
			{
				sTitle: '车区',
	          	mData: 'prefectureId' ,
	          	bSortable: true,
	          	mRender:function(mData,type,full){
	          		var prefecture = prefectureMap.get(mData);
	          		var html = '';
	          		if(prefecture!=null){
	          			html = prefecture.name;
	          		}
	          		return html;
	          	}
			}, 
			{ sTitle: '日用户目标',   mData: 'dayUserCount'}, 
			{ sTitle: '日订单目标',   mData: 'dayOrderCount'},
			{ sTitle: '月用户目标',   mData: 'mounthUserCount'}, 
			{ sTitle: '月订单目标',   mData: 'mounthOrderCount'},
			{ sTitle: '创建人',   mData: 'operatorName'}, 
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
		$.each(list,function(index,clazz){
			ids.push(clazz.id);
		});
		layui.msg.confirm('您确定要删除',function(){
			layui.common.ajax({
				url:'/admin/admin/pre_target_setting/delete',
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
		$('#pre-target-setting-add-form select[name=prefectureId]').html(prefectureHtml);
		form.render('select'); 
		form.render('checkbox'); 
		$('#pre-target-setting-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		$('#pre-target-setting-add-button').bind('click',function(){
        	if(validate.valid()){  
        		layui.common.ajax({
        			url:'/admin/admin/pre_target_setting/save',
        			data:$('#pre-target-setting-add-form').serialize(),
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
    	valid.id = "pre-target-setting-add-form";
    	valid.rules = {
			dayUserCount:{ 
    			required: true,
    			digits:true,
    			range:[1,1000]
    		},mounthUserCount:{ 
    			required: true , 
    			digits:true,
    			range:[1,30000]
    		},dayOrderCount:{ 
    			required: true  ,
    			digits:true,
    			range:[1,1000]
    		},mounthOrderCount:{ 
    			required: true  ,
    			digits:true,
    			range:[1,30000]
    		} 
    	};
    	valid.messages = {
			dayUserCount:{ 
    			required: '填写日增用户数',
    			digits:'需为整数',
    			range:'取值范围为:[1,1000]'
    		},mounthUserCount:{ 
    			required: '填写月增用户数',
    			digits:'需为整数',
    			range:'取值范围为:[1,30000]'
    		},dayOrderCount:{ 
    			required: '填写日增订单户数',
    			digits:'需为整数',
    			range:'取值范围为:[1,1000]'
    		},mounthOrderCount:{ 
    			required: '填写月增订单数',
    			digits:'需为整数',
    			range:'取值范围为:[1,30000]'
    		}
    	}; 
    	param.validate = valid;
    	param.width = 600;
    	param.init = addInit;
    	layui.common.modal(param);  
    });
    
    
    var editInit = function(validate,lindex){  
    	$('#pre-target-setting-edit-form select[name=prefectureId]').html(prefectureHtml);
    	var list = datatable.selected();  
		layui.common.set({
			id:'pre-target-setting-edit-form',
			data:list[0]
		});
		form.render('select'); 
		form.render('checkbox'); 
		$('#pre-target-setting-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		$('#pre-target-setting-update-button').bind('click',function(){
        	if(validate.valid()){  
        		layui.common.ajax({
        			url:'/admin/admin/pre_target_setting/update',
        			data:$('#pre-target-setting-edit-form').serialize(),
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
    	valid.id = "pre-target-setting-edit-form";
    	valid.rules = {
    		dayUserCount:{ 
    			required: true,
    			digits:true,
    			range:[1,1000]
    		},mounthUserCount:{ 
    			required: true , 
    			digits:true,
    			range:[1,30000]
    		},dayOrderCount:{ 
    			required: true  ,
    			digits:true,
    			range:[1,1000]
    		},mounthOrderCount:{ 
    			required: true  ,
    			digits:true,
    			range:[1,30000]
    		} 
    	};
    	valid.messages = {
			dayUserCount:{ 
    			required: '填写日增用户数',
    			digits:'需为整数',
    			range:'取值范围为:[1,1000]'
    		},mounthUserCount:{ 
    			required: '填写月增用户数',
    			digits:'需为整数',
    			range:'取值范围为:[1,30000]'
    		},dayOrderCount:{ 
    			required: '填写日增订单户数',
    			digits:'需为整数',
    			range:'取值范围为:[1,1000]'
    		},mounthOrderCount:{ 
    			required: '填写月增订单数',
    			digits:'需为整数',
    			range:'取值范围为:[1,30000]'
    		}
    	}; 
    	param.validate = valid;
    	param.width = 600;
    	param.init = editInit;
    	layui.common.modal(param);  
    });
});