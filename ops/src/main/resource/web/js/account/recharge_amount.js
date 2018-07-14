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
	var addServerParams = function(data){  
		var filters = new Array();
		var filter = null; 
		var searchStatus = $('#search-status').val();
		if(searchStatus!=''){
			filter = new Object();
			filter.property = 'status';
			filter.value = searchStatus;
			filters.push(filter);
		}
		if(filters.length>0){
			data.push({name:'filterJson',value:JSON.stringify({filters:filters})});
		}
	};
	
	var draw = function(settings, json){
		$(".operation-start").unbind('click').bind('click',start);
		$(".operation-stop").unbind('click').bind('click',stop);
		$(".operation-check").unbind('click').bind('click',check);
		$(".operation-no-check").unbind('click').bind('click',noCheck);
	};
	function stop() {
    	var id = $(this).attr('data-id');
        var url = '/admin/account/recharge_amount/stop';
        var data = new Object(); 
        data.id = id;
        layui.common.ajax({
          url:url,
          data: data,
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
    }
	function check() {
		var id = $(this).attr('data-id');
		var url = '/admin/account/recharge_amount/checked';
		var data = new Object(); 
		data.id = id;
		layui.common.ajax({
			url:url,
			data: data,
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
	} 
	function noCheck() {
		var id = $(this).attr('data-id');
		var url = '/admin/account/recharge_amount/no_checked';
		var data = new Object(); 
		data.id = id;
		layui.common.ajax({
			url:url,
			data: data,
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
	} 
	function start() {
		var id = $(this).attr('data-id');
		var url = '/admin/account/recharge_amount/rstart';
		var data = new Object(); 
		data.id = id;
		layui.common.ajax({
			url:url,
			data: data,
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
	} 
	var datatable = layui.datatable.init({
		id:'amount-table',
		url:'/admin/account/recharge_amount/list', 
		key:'id',
		columns:[ 
			{ sTitle: '充值金额',   mData: 'payment'},
			{ sTitle: '排序',   mData: 'orderIndex',bVisible:false,	bSortable: true,},
			{ sTitle: '赠送金额',   
				mData: 'gift'
			},
			{ sTitle: '选中状态',   mData: 'checked',
	          	mRender:function(mData,type,full){
	          		var html = '';
	          		switch(full.checked){
	          			case true:html += '<label style="color:green;">选中</label>';break;
		          		case false:html += '<label style="color:green;">未选中</label>';break;
	          		}
	          		return html;
	          	}
			},
			{ sTitle: '状态',   mData: 'status',
	          	mRender:function(mData,type,full){
	          		var html = '';
	          		switch(mData){
	          			case 0:html += '<label style="color:red;">禁用</label>';break;
		          		case 1:html += '<label style="color:green;">启用</label>';break;
	          		}
	          		return html;
	          	}	
			},
			{
				sTitle: '操作',
	          	mRender:function(mData,type,full){
	          		var html = '';
	          		if(full.checked == false){
	          			html += '<a class="operation-check" data-id="'+full.id+'" href="javascript:void(0);">选中</a>&nbsp;&nbsp;&nbsp;&nbsp;';
	          		}else{
	          			html += '<a class="operation-no-check" data-id="'+full.id+'" href="javascript:void(0);">未选中</a>&nbsp;&nbsp;&nbsp;&nbsp;';
	          		}
	          		if(full.status == 0){
	          			html += '<a class="operation-start" data-id="'+full.id+'" href="javascript:void(0);">启动</a>&nbsp;&nbsp;&nbsp;&nbsp;';
	          		}else{
	          			html += '<a class="operation-stop" data-id="'+full.id+'" href="javascript:void(0);">禁用</a>&nbsp;&nbsp;&nbsp;&nbsp;';
	          		}
	          		return html;
	          	}	
			}
		],
		orderIndex:2,
		draw:draw,
		orderType:'asc',
		filter:addServerParams
	});
	
	var query =  function(){
		datatable.reload();
	};
	var dataf = function dateformat(date) {
        return date ? (new Date(date)).format("yyyy-MM-dd") : "";
    }
	
	/**
	 * 启用
	 */
	$('#start-button').bind('click',function(){
		var list = datatable.selected(); 
		if(list.length<1){
			layui.msg.error('请至少选择一条记录');
			return false;
		}
		var ids = new Array();
		$.each(list,function(index,page){
			ids.push(page.id);
		});
		layui.msg.confirm('您确定要启用',function(){
			layui.common.ajax({
				url:'/admin/biz/application_group/start',
				data:JSON.stringify(ids),
				contentType:'application/json; charset=utf-8',
				success:function(res){
					if(res.success){  
						layui.layer.close(lindex);
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
	/**
	 * 禁用
	 */
	$('#down-button').bind('click',function(){
		var list = datatable.selected(); 
		if(list.length<1){
			layui.msg.error('请至少选择一条记录');
			return false;
		}
		var ids = new Array();
		$.each(list,function(index,page){
			ids.push(page.id);
		});
		layui.msg.confirm('您确定要禁用',function(){
			layui.common.ajax({
				url:'/admin/biz/application_group/down',
				data:JSON.stringify(ids),
				contentType:'application/json; charset=utf-8',
				success:function(res){
					if(res.success){  
						layui.layer.close(lindex);
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
	
	
	
	var groupInit = function(validate,lindex){
		form.render('select');
		$('#cancel-button').bind('click',function(){
			layui.msg.confirm('取消后，你填写的信息将不会保存，请谨慎选择。',function(){
				layui.layer.close(lindex);
			});
		});
		$('#amount-add-button').bind('click',function(){
        		layui.common.ajax({
        			url:'/admin/account/recharge_amount/save',
        			data:$('#amount-add-form').serialize(),
        			async:false,
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
    $('#add-button').bind('click',function(){
    	var param = new Object();
    	param.url = 'add.html';
    	param.title = '添加分组信息'; 
    	var valid = new Object();
    	valid.id = "amount-add-form";
    	valid.rules = {
    		payment:{
		 		required: true,
		 		digits:true
		 	},gift:{
		 		required: true,
		 		digits:true
		 	}
    	};
    	valid.messages = {
    			payment:{
    			required: '请选择充值金额',
    			digits:'请填写整数'
		 	},gift:{
		 		required: '请选择赠送金额',
    			digits:'请填写整数'
		 	}
    	}; 
    	param.validate = valid;
    	param.width = 500;
    	param.init = groupInit;
    	layui.common.modal(param);  
    });
    
    var editInit = function(validate,lindex){
    	var list = datatable.selected();
    	list[0].checked = list[0].checked == false ? 0 : 1;
		layui.common.set({
			id:'amount-edit-form',
			data:list[0]
		});
		form.render('select');
		layui.common.set({
			id:'amount-edit-form',
			data:list[0]
		});
		$('#amount-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		$('#amount-update-button').bind('click',function(){
        	if(validate.valid()){  
        		layui.common.ajax({
        			url:'/admin/account/recharge_amount/update',
        			data:$('#amount-edit-form').serialize(),
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
    	valid.id = "amount-edit-form";
    	valid.rules = {
        		payment:{
    		 		required: true,
    		 		digits:true
    		 	},gift:{
    		 		required: true,
    		 		digits:true
    		 	}
        	};
        	valid.messages = {
        			payment:{
        			required: '请填写充值金额',
        			digits:'请填写整数'
    		 	},gift:{
    		 		required: '请填写赠送金额',
		 			digits:'请填写整数'
    		 	}
        	}; 
    	param.validate = valid;
    	param.width = 600;
    	param.init = editInit;
    	layui.common.modal(param);  
    });
    
    $('#search-button').bind('click',function(){
		query();
	});   
    
});