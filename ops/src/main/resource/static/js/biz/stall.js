layui.config({
	base: '/web/js/lib/'
}).extend({ 
	msg:'msg',
	common:'common',
	ztree:'ztree',
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
layui.use(['layer','msg','form', 'common','validate','datatable','laydate','ztree'], function() {
	var validate = layui.validate;
	var session = window.sessionStorage;
	var layer = layui.layer;  
	var $ = layui.jquery; 
	var form = layui.form; 
	var selectedEntId = null; 
	var level = 0;
	var lastNode = null;
	var stemp=null;
	var base_url = "/admin/biz/stall/";
 	var treeClick = function(event, treeId, treeNode, clickFlag){ 
 		level = treeNode.level;
 		if(level==1){
 			selectedEntId = treeNode.id; 
 			lastNode  = treeNode;
 			query();
 		} else{
 			tree.selectNode(lastNode);  
 			layui.msg.error('请选择第一组页面树');
 			return true;
 		}
	};
	
	var setting = {
		data: {
			simpleData: {
				enable: true
			}
		},
		callback: {
			onClick: treeClick
	   }
	};
		// 企业树
	var tree = null;
	layui.common.ajax({
		url: base_url+"tree",
		data:{time:new Date().getTime()},  
		success: function(data) {
			tree = $.fn.zTree.init($("#pre-tree"), setting, data); 
			var nodes = tree.getNodes(); 
			if(nodes[0].children!=null&&nodes[0].children!=null){
				tree.selectNode(nodes[0].children[0]); 
				selectedEntId = nodes[0].children[0].id; 
				lastNode = nodes[0].children[0];
				query();
			} 
		},
	error:function(){}
	});
	
	// 查询条件
	var addQueryParams = function(data){
	var filters = new Array();
		var status = $("#search-status").val();
		var name = $("#search-name").val();
		var sn = $("#search-sn").val();
		var filter = new Object();
		filter.property = 'preId';
		filter.value = selectedEntId;
		filters.push(filter);
		if("" != status){
			var filter = new Object();
			filter.property = 'status';
			filter.value = status;
			filters.push(filter);
		}
		if("" != name){
			var filter = new Object();
			filter.property = 'stallName';
			filter.value = '%'+name+'%';
			filters.push(filter);
		}
		if("" != sn){
			var filter = new Object();
			filter.property = 'lockSn';
			filter.value = '%'+sn+'%';
			filters.push(filter);
		}
		if(filters.length>0){
			data.push({name:'filterJson',value:JSON.stringify({filters:filters})});
		}
	}
	// 分页
	var datatable = layui.datatable.init({
		
		id:'stall-table',
		url:base_url+'list', 
		key:'id',
		columns:[ 
			{ sTitle: '名称',   mData: 'stallName'}, 
			{
				sTitle: '序列号',
	          	mData: 'lockSn',
	          	mRender:function(mData,type,full){
	          		var html = '';
	          		if(null== mData){
	          			html += '<label style="color:#FF77FF;">未绑定</label>';
	          		}else{
	          			html += '<label style="color:#444444;">'+mData+'</label>';
	          		}
	          		return html;
	          	}
			},
			{
				sTitle: '智能车位锁状态',
	          	mData: 'lockStatus',
	          	mRender:function(mData,type,full){
	          		var html = '';
	          		if(1== mData){
	          			html += '<label style="color:#00CED1;">升起</label>';
	          		}else if(2== mData){
	          			html += '<label style="color:#FA8072">降下</label>';
	          		}else{
	          			html += '<label  style="color:#666666;">无</label>';
	          		}
	          		return html;
	          	}
			},
			{
				sTitle: '车位状态',
	          	mData: 'status',
	          	bSortable: true,
	          	mRender:function(mData,type,full){
	          		var html = '';
	          		if(1== mData){
	          			html += '<label style="color:#FF00FF;">空闲</label>';
	          		}else if(2== mData){
	          			html += '<label style="color:#FF4500;">使用中</label>';
	          		}else if(3== mData){
	          			html += '<label style="color:#00DDAA;">预下线</label>';
	          		}else{
	          			html += '<label style="color:#666666;">下线</label>';
	          		}
	          		return html;
	          	}
			},
			{
				sTitle: '车位标识',
	          	mData: 'brand',
	          	mRender:function(mData,type,full){
	          		var html = '';
	          		if(0== mData){
	          			html += '<label style="color:#FF00FF;">普通车位</label>';
	          		}else if(1== mData){
	          			html += '<label style="color:#FF4500;">品牌车位</label>';
	          		}
	          		return html;
	          	}
			},
			{
				sTitle: '订单状态',
	          	mData: 'bindOrderStatus',
	          	bSortable: true,
	          	mRender:function(mData,type,full){
	          		var html = '';
	          		if(0== mData){
	          			html += '<label style="color:#00CED1;">正常</label>';
	          		}else if(1== mData){
	          			html += '<label  style="color:#666666;">挂起</label>';
	          		}else{
	          			html += '<label style="color:#FA8072">关闭</label>';
	          			
	          		}
	          		return html;
	          	}
			},
//			{
//				sTitle: '释放操作',
//	          	mData: 'bindOrderStatus',
//	          	type:'status',
//	          	mRender:function(mData,type,full){
//	          		var html = '';
//	          		if(mData !=0 && stemp ==2){
//	          			html += '<label style="color:#32CD32;" >可以</label>';
//	          		}else{
//	          			html += '<label style="color:#666666;" >不可以</label>';
//	          		}
//	          		return html;
//	          	}
//			},
			{
				sTitle: '创建时间',
	          	mData: 'createTime' ,
	          	bSortable: true,
	          	mRender:function(mData,type,full){
	          		 return new Date(mData).format('yyyy-MM-dd hh:mm');
	          	}
			}
			
		],
		orderIndex:6,
		orderType:'desc',
		filter:addQueryParams
	});
	var query =  function(){
		datatable.reload();
	} ;  
	$('.search_btn').bind('click',function(){
		query();
	}); 
	
	$('.check_msg').bind('click',function(){
	 layer.msg('功能正在拼命开发中。。。', {
	        time: 20000, // 20s后自动关闭
	        btn: ['知道了']
		 });
	});

	var addInit = function(validate,lindex){
		$('#stall-add-form input[name=preId]').val(selectedEntId);
		$('#stall-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		$('#stall-add-button').bind('click',function(){
        	if(validate.valid()){
        		layui.common.ajax({
        			url:base_url+'save',
        			data:$('#stall-add-form').serialize(),
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
    	valid.id = "stall-add-form";
    	valid.rules = {
    		stallName:{
    			required: true,
    			remote:{
    				url:base_url+"check",  
    				data:{
    					preId:function(){return selectedEntId }
    				}
    			}
    		},
    		stallLocal:{
				required:true 
		}
    	};
    	valid.messages = {
    		stallName:{
    			required: '请填写名称',
    			remote:'名称已经存在'
    		},
    		stallLocal:{
    			required:"请填写位置描述"
    		}
    	}; 
    	param.validate = valid;
    	param.width = 500;
    	param.init = addInit;
    	layui.common.modal(param);  
    });
    
    var editInit = function(validate,lindex){
    	var list = datatable.selected();  	 
		layui.common.set({
			id:'stall-edit-form',
			data:list[0]
		});
		$('#stall-edit-form select[name=id]').html(list[0].id);
		form.render('checkbox');
		$('#stall-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		$('#stall-update-button').bind('click',function(){
        	if(validate.valid()){  
        		layui.common.ajax({
        			url:base_url+'update',
        			data:$('#stall-edit-form').serialize(),
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
		layui.msg.error('请选择一条记录');
		return false;
	}
    	var param = new Object();
    	param.url = 'edit.html';
    	param.title = '编辑信息'; 
    	var valid = new Object();
    valid.id = "stall-edit-form";
    	valid.rules = {
    		stallName:{
    			required: true,
    			remote:{
    				url:base_url+"check",  
    				data:{
    					preId:function(){return selectedEntId },
    					id:function(){
    						var list=datatable.selected();
    						return list[0].id;
    					 }
    				}
    			}
    		},
    		stallLocal:{
				required:true 
		}
    	};
    	valid.messages = {
    		stallName:{
    			required: '请填写名称',
    			remote:'名称已经存在'
    		},
    		stallLocal:{
    			required:"请填写位置描述"
    		}
    	}; 
    	param.validate = valid;
    	param.width = 700;
    	param.init = editInit;
    	layui.common.modal(param);
	});
	
	var snInit = function(validate,lindex){
		var list = datatable.selected();
		var id = list[0].id;
		var lid = list[0].lockId;
		var param = new Object();
		if(null == lid){
			param.lockId = -1;
		}else{
			param.lockId = lid;
		}
		layui.common.ajax({
			url:base_url+'sn',
			data:param,
			success:function(res){
				if(res.length > 0){
				var html = '';
			    	$.each(res,function(index,sn){
			    		html += '<input type="checkbox" lay-skin="primary" name="sid" value="'+sn.id+'" title="'+sn.sn+'">';
			    	});
			    	$('#sn-list-div').html(html);
			    	form.render('checkbox');
		    }
		} 
	});
		layui.common.ajax({
			url:base_url+'detail',
			data:{"id":id},
			success:function(res){ 
			if(null != res.lockId){
				$('#sn-list-div input[value='+res.lockId+']').prop('checked',true);
			}
			form.render('checkbox');
			} 
		});	
	
	$('#sn-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
	});
	$('#sn-sub-button').bind('click',function(){
		var checked = $('#sn-list-div input[name="sid"]:checked');
		if(checked.length != 1){
			layui.msg.error('请选择一个绑定码');
			return false;
		}
		var sid = checked[0].value;
    		layui.common.ajax({
    			url:base_url+'bind',
    			data:{"sid":sid,"id":id},
    			success:function(res){
    				if(res.success){
    					layui.layer.close(lindex);
    					layui.msg.success(res.content);
    					window.setTimeout(query,1000);
    				}
    			} 
    		});
	  });
	};
	
	$('#sn-button').bind('click',function(){
		var list = datatable.selected();
		if(list.length!=1){
			layui.msg.error('请选择一条记录');
			return false;
		}
	    	var param = new Object();
	    	param.url = 'sn.html';
	    	param.title = '绑定序列号'; 
	    	param.width = 450;
	    	param.init = snInit;
	    	layui.common.modal(param);  
    });
	
	/**
	 * 上线
	 */
	$('#up-button').bind('click',function(){
		var list = datatable.selected(); 
		if(list.length<1){
			layui.msg.error('请至少选择一条记录');
			return false;
		}
		var msg ;
		var flag = true;
		var param  =new Array();
		$.each(list,function(index,dows){
			if(null ==dows.lockId ){
//				layui.msg.error('请先绑定序列号');
				msg = '请先绑定序列号';
				flag = false
				return ;
			}
			if(dows.status == 1 ){
				msg = '请选择状态：下线，车位进行操作';
				flag = false
//				layui.msg.error('请选择状态：下线，车位进行操作');
				return;
			}
			param.push(dows.id);
		});
		if(!flag){
			layui.msg.error(msg);
			return false;
		}
		layui.msg.confirm('确定上线？',function(){
			layui.common.ajax({
				url:base_url+'changed_up',
				contentType:'application/json; charset=utf-8',
				data:JSON.stringify(param),
				success:function(res){
					if(res.success){  
						layui.msg.success(res.content);
						window.setTimeout(query,3000);
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
	 * 下线
	 */
	$('#down-button').bind('click',function(){
		var list = datatable.selected(); 
		if(list.length<1){
			layui.msg.error('请至少选择一条记录');
			return false;
		}
		if(list[0].status == 4 && list[0].bindOrderStatus == 0 ){
			layui.msg.error('请选择车位状态：空闲，订单状态正常车位');
			return false;
		}
		layui.msg.confirm('确定要下线？',function(){
			layui.common.ajax({
				url:base_url+'changed_down',
				data:{"id":list[0].id},
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
	
//	$('#stall-table input.checkboxes').bind('change',function(){
//		var list = datatable.selected(); 
//		$('.check-s').removeAttribute("disabled");
//		if(list.length == 1 ){
//			var os = list[0].bindOrderStatus
//			var ls = list[0].status
//			if(os == 0 && ls == 4){
//			$('#down-button').setAttribute("disabled", true)
//			}if(ls == 1){
//			$('#up-button').setAttribute("disabled", true)
//			}
//		}
//	});
	
});