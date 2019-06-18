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
		var filters = new Array();
		var filter = null; 
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
		id:'data-count-table',
		url:'/admin/admin/data-count/list', 
		key:'id',
		columns:[ 
			{ sTitle: '车区id',   mData: 'preId'}, 
			{ sTitle: '车位类型',   mData: 'type',
	          	mRender:function(mData,type,full){
	          		if(full.type == 0){
	          			return '<label style="color:gray;">临停</label>'
	          		}else if(full.type == 2){
	          			return '<label style="color:gray;">固定</label>'
	          		}else if(full.type == 4){
	          			return '<label style="color:gray;">全部</label>'
	          		}else{
	          			return '<label>再无数据</label>'
	          		}
	          	}
			}, 
			{ sTitle: '车区名称',   mData: 'preName'}, 
			{ sTitle: '订单数',   mData: 'orderConunt'}, 
			{ sTitle: '订单收入',   mData: 'orderIncome'}, 
			{ sTitle: '固定',   mData: 'fixed'}, 
			{ sTitle: '固定使用数',   mData: 'fixedNumberUse'}, 
//			{ sTitle: '车位详情数据',   mData: 'details'}, 
//			{ sTitle: '车位报表数据',   mData: 'reportForms'}, 
			/*{
				sTitle: '创建时间',
	          	mData: 'createTime' ,
	          	bSortable: true,
	          	mRender:function(mData,type,full){
	          		 return new Date(mData).format('yyyy-MM-dd hh:mm');
	          	}
			} */
		],
		orderIndex:1,
		orderType:'desc',
		filter:addServerParams
	});  
	
	var query =  function(){
		datatable.reload();
		
	} ;  
	$('#search-button').bind('click',function(){
		query();
	});  
	 
	$('#start-button').bind('click',function(){
		layui.msg.confirm('您确定要启动',function(){
			layui.common.ajax({
				url:'/admin/admin/data-count/start',
//				data:{}, 
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
	$('#stop-button').bind('click',function(){
		layui.msg.confirm('您确定要关闭',function(){
			layui.common.ajax({
				url:'/admin/admin/data-count/stop',
//				data:{}, 
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
	$('#delete-button').bind('click',function(){
		var list = datatable.selected(); 
		if(list.length!=1){
			layui.msg.error('请选择一条记录');
			return false;
		}
		console.log(list);
		console.log(list[0].preId);
		layui.msg.confirm('您确定要删除',function(){
			layui.common.ajax({
				url:'/admin/admin/data-count/delete',
				data:JSON.stringify(list[0].preId), 
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
		 $('#preId').html(preHtml);
		 form.render('select');
		 var floors = null;
		 form.on('select(preId)', function(data) {
			 $('#preName').val(preMap.get(data.value).name);
				layui.common.ajax({
					url:'/admin/biz/prefecture/data-count-floor',
					data:JSON.stringify(data.value), 
					contentType:'application/json; charset=utf-8',
					success:function(list){
					floors = list;
					console.log(floors);
					 var detail = "";
					 var data = "#{总车位数},#{使用车位数},#{固定总数},#{固定使用车位数},#{临停总数},#{临停使用数},#{固定使用次数},#{固定自用},#{固定授权},#{临停订单收入},#{临停订单},#{临停已完成},#{临停进行中};";
					 $.each(floors,function(index,f){
						 detail += "#{"+f+"}"+data+";";
					 });
					 if(detail != null){
						 detail = detail.substring(0,detail.length-1);
					 }
					 console.log(detail)
					 $('#details').val(detail);
					 
					 var reportForms = "";
					 var dataf = "#{固定车位数},#{固定车位数环比},#{固定使用次数},#{固定使用次数环比},#{固定自用},#{固定自用环比},#{固定授权},#{固定授权环比}";
					 dataf += ",#{临停订单数},#{临停订单环比},#{临停收入},#{临停收入环比},#{临停预约收入},#{临停预约收入环比},#{临停扫码收入},#{临停扫码环比},#{临停分享收入},#{临停分享收入环比}";
					 dataf +=",#{整体使用时长},#{整体使用时长环比},#{固定使用时长},#{固定使用时长环比},#{临停使用时长},#{临停使用时长环比},#{固定自用车位数环比},#{固定授权车位数环比},#{临停预约订单环比},#{临停扫码订单环比},#{临停分享车位环比}"
					 $.each(floors,function(index,f){
						 var d = "#{"+f+"}";
						 for(i = 0;i<3;i++){
							 console.log(i);
							 var df = 0;
							 if(i == 0){
								 df = ",#{日},";
								 reportForms += d+df+dataf
							}else if(i==1){
								df = ",#{周},"
								reportForms += d+df+dataf
							}else if(i==2){
								df = ",#{月},"
								reportForms += d+df+dataf;
							}
						 }
						 reportForms+";";
					});
					 reportForms = reportForms.substring(0,reportForms.length-1);
					 console.log(reportForms)
					  $('#reportForms').val(reportForms);
					},error:function(){
					}
				});
		 });
		 
		$('#data-count-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		$('#data-count-add-button').bind('click',function(){
        	if(validate.valid()){  
        		layui.common.ajax({
        			url:'/admin/admin/data-count/save',
        			data:$('#data-count-add-form').serialize(),
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
    	valid.id = "data-count-add-form";
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