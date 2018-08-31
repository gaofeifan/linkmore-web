layui.config({
	base: '/web/js/lib/'
}).extend({ 
	msg:'msg',
	common:'common', 
	datatable:'datatable' 
});
Date.prototype.format =function(format){
    var o = {
	    "M+" : this.getMonth()+1, // month
		"d+" : this.getDate(),    // day
		"h+" : this.getHours(),   // hour
		"m+" : this.getMinutes(), // minute
		"s+" : this.getSeconds(), // second
		"q+" : Math.floor((this.getMonth()+3)/3),  // quarter
		"S" : this.getMilliseconds() // millisecond
    };
    if(/(y+)/.test(format)) format=format.replace(RegExp.$1,(this.getFullYear()+"").substr(4- RegExp.$1.length));
    for(var k in o){
    	if(new RegExp("("+ k +")").test(format)){
	    	 format = format.replace(RegExp.$1, RegExp.$1.length==1? o[k] :("00"+ o[k]).substr((""+ o[k]).length));
	    }
    }
    return format;
};
layui.use(['layer','msg','form', 'common','datatable','laydate'], function() {
	var session = window.sessionStorage;
	var layer = layui.layer;  
	var $ = layui.jquery; 
	var form = layui.form;
	
	var laydate = layui.laydate; 
	var entMap = layui.common.map();

	// 企业列表
	var enterpriseHtml = '';
	layui.common.ajax({
		url:'/admin/biz/ent-brand-pre/ent-list',
		async:false,
		success:function(list){
			enterpriseHtml = '<option value="0">请选择</option>';
			$.each(list,function(index,ent){
				enterpriseHtml += '<option value="'+ent.id+'">';
				enterpriseHtml += ent.name;
				enterpriseHtml += '</option>';
				entMap.put(ent.id,ent.name);
			});
			$('#search-ent-id').html(enterpriseHtml);
			form.render('select');
		},error:function(){
		}
	});

	var addServerParams = function(data){  
		var filters = new Array();
		var filter = null; 
		var searchEntId = $('#search-ent-id').val();
		var searchRealname = $('#search-realname').val();
		var searchMobile = $('#search-mobile').val();
		if(searchEntId!='0'){
			filter = new Object();
			filter.property = 'entId';
			filter.value = searchEntId;
			filters.push(filter);
		} 
		if(searchRealname!=''){
			filter = new Object();
			filter.property = 'realname';
			filter.value = '%'+searchRealname +'%';
			filters.push(filter);
		} 
		if(searchMobile!=''){
			filter = new Object();
			filter.property = 'mobile';
			filter.value = '%'+searchMobile +'%';
			filters.push(filter);
		} 
		
		if(filters.length>0){
			data.push({name:'filterJson',value:JSON.stringify({filters:filters})});
		}
	};
	var datatable = layui.datatable.init({
		id:'user-table',
		url:'/admin/biz/ent-brand-user/list', 
		key:'id',
		columns:[ 
			{ sTitle: '企业名称',   mData: 'entId',
				mRender:function(mData,type,full){ 
	          		return entMap.get(mData);
	          	}
			},
			{ sTitle: '姓名',   mData: 'realname' },
			{ sTitle: '手机号',   mData: 'mobile' },
			{ sTitle: '车牌号',   mData: 'plateNo'}
		],
		orderIndex:1,
		orderType:'desc',
		filter:addServerParams
	});
	
	var query =  function(){
		datatable.reload();
	};
	$('.search_btn').bind('click',function(){
		query();
	});
	
	/**
	 * 删除
	 */
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
				url:'/admin/biz/ent-brand-user/delete',
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

	var addInit = function(validate,lindex){
		
		$('#ent-brand-user-add-form select[name=entId]').html(enterpriseHtml);
		form.render('select');
		
		$('#ent-brand-user-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		$('#ent-brand-user-add-button').bind('click',function(){
        	if(validate.valid()){
				
				var entId = $('#ent-brand-user-add-form select[name=entId]').val();
				
				if(entId == 0){
					layui.msg.tips('请选择企业!');
					return;
				}

        		layui.common.ajax({
        			url:'/admin/biz/ent-brand-user/save',
        			data:$('#ent-brand-user-add-form').serialize(),
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
    	valid.id = "ent-brand-user-add-form";
    	valid.rules = {
			mobile: {
		 		mobile:true,  
    			required: true
		 	},
			plateNo:{
    			required: true,
    			isPlateNo:true
    		},
			realname: {
		 		rangelength:[1,6] ,
    			required: true
		 	}
		 	
    	};
    	valid.messages = {
			mobile: {
				mobile:'请输入有效手机号',  
    			required: '请填写手机号',
			},
			realname: {
    			rangelength:'姓名长度应在[1,6]内', 
    			required: '请填写姓名',
			},
			plateNo:{
    			required: '请输入车牌号',
    			isPlateNo:'请输入正确的车牌号'
    		}
    	}; 
    	param.validate = valid;
    	param.width = 700;
    	param.init = addInit;
    	layui.common.modal(param);  
    });
	
	 var addFileInit = function(validate,lindex){    
		$('#excel-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		$('#excel-add-button').bind('click',function(){
			var data = new FormData($( "#excel-add-form" )[0]); 
			layui.common.upload({
				url:'/admin/biz/ent-brand-user/import_excel',
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
    	param.title = '导入授权用户';  
    	param.width = 600;
    	param.init = addFileInit;
    	layui.common.modal(param);  
    });
	
	
	
	
    
});