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
	var base_url = "/admin/biz/prefecture_ele/";
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
		var name = $("#search-name").val();
		var filter = new Object();
		filter.property = 'preId';
		filter.value = selectedEntId;
		filters.push(filter);
	
		if("" != name){
			var filter = new Object();
			filter.property = 'eleName';
			filter.value = '%'+name+'%';
			filters.push(filter);
		}

		if(filters.length>0){
			data.push({name:'filterJson',value:JSON.stringify({filters:filters})});
		}
	}
	// 分页
	var datatable = layui.datatable.init({
		
		id:'ele-table',
		url:base_url+'list', 
		key:'id',
		columns:[ 
			{ sTitle: '车位名称',   mData: 'eleName'}, 
			{ sTitle: '元素类型',   mData: 'eleType'}, 
			{ sTitle: '横坐标x',   mData: 'eleX'},
			{ sTitle: '纵坐标y',   mData: 'eleY'},
			{ sTitle: '宽度',   mData: 'eleWidth'},
			{ sTitle: '高度',   mData: 'eleHeight'}
		],
		orderIndex:1,
		orderType:'desc',
		filter:addQueryParams
	});
	var query =  function(){
		datatable.reload();
	} ;  
	$('.search_btn').bind('click',function(){
		query();
	}); 
	
	/**
	 * 添加
	 */
	// 添加路线指引图片
    function addViewImage(){
    	var formData = new FormData($("#add-view-image-form")[0]); 
		 $.ajax({
			url: '/api/common/attach/image_upload',
			type: "POST",
			data: formData,  
			enctype: 'multipart/form-data',
		    processData: false,
		    contentType: false,
		    success: function (msg) {
		    	if(msg.success){
		    		layui.msg.success(msg.content);
					$('#add_view_image').attr('src', 'http://oss.pabeitech.com/'+msg.map.attach.compressUrl);
	        		$('#eleSrc').val('http://oss.pabeitech.com/'+msg.map.attach.compressUrl);
	        		window.setTimeout(query,1000);
	        	}else{
	        		layui.msg.error(msg.content);
	        	}
		    } 
		});
    }

	var addInit = function(validate,lindex){
		$('#ele-add-form input[name=elePreId]').val(selectedEntId);
		$('#ele-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		form.render('radio');
		form.on('radio', function(data){
			console.log(data.value); //被点击的radio的value值
			if(data.value == 'button'){
				$('#pic').hide();
				$('#ele_name').show();
			}else{
				$('#pic').show();
				$('#ele_name').hide();
			}
		}); 
		
		$("#add_view_image_file").unbind("change").bind("change",addViewImage);

		$('#ele-add-button').bind('click',function(){
        	if(validate.valid()){
        		var eleType=$('input:radio[name="eleType"]:checked').val();
        		if(eleType =='button'){
        			if($("#eleName").val() == ''){
        				layui.msg.tips('请填写车位名称!');
        				return;
        			}
        		}else{
        			if($("#eleSrc").val() == ''){
        				layui.msg.tips('请上传图片!');
        				return;
        			}
        		}
        		layui.common.ajax({
        			url:base_url+'save',
        			data:$('#ele-add-form').serialize(),
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
    	valid.id = "ele-add-form";
    	valid.rules = {
    		eleName:{
				rangelength: [1,10]
    		},
    		eleX:{
				required:true,
				digits:true,
				rangelength: [1,3]
    		},
    		eleY:{
				required:true,
				digits:true,
				rangelength: [1,3]
    		},
    		eleWidth:{
				required:true,
				digits:true,
				rangelength: [1,3]
    		},
    		eleHeight:{
				required:true,
				digits:true,
				rangelength: [1,3]
    		}
    	};
    	valid.messages = {
    		eleName:{
    			rangelength:'车位名称长度应在[1,10]内'
    		},
    		eleX:{
    			required:"请填写横坐标x",
    			digits:"请输入正整数",
    			rangelength:'横坐标x长度应在[1,3]内'
    		},
    		eleY:{
    			required:"请填写纵坐标y",
    			digits:"请输入正整数",
    			rangelength:'纵坐标y长度应在[1,3]内'
    		},
    		eleWidth:{
    			required:"请填写宽度",
    			digits:"请输入正整数",
    			rangelength:'宽度应在[1,3]内'
    		},
    		eleHeight:{
    			required:"请填写高度",
    			digits:"请输入正整数",
    			rangelength:'高度应在[1,3]内'
    		}
    		
    	}; 
    	param.validate = valid;
    	param.width = 700;
    	param.init = addInit;
    	layui.common.modal(param);  
    });
    
    /*
	 * 编辑
	 */
    // 修改图片
    function editViewImage(){
    	var formData = new FormData($("#edit-view-image-form")[0]); 
		 $.ajax({
			url: '/api/common/attach/image_upload',
			type: "POST",
			data: formData,  
			enctype: 'multipart/form-data',
		    processData: false,
		    contentType: false,
		    success: function (msg) {
		    	if(msg.success){
		    		layui.msg.success(msg.content);
					$('#edit_view_image').attr('src', 'http://oss.pabeitech.com/'+msg.map.attach.compressUrl);
	        		$('#eleSrc').val('http://oss.pabeitech.com/'+msg.map.attach.compressUrl);
	        		window.setTimeout(query,1000);
	        	}else{
	        		layui.msg.error(msg.content);
	        	}
		    } 
		});
    }
    
    var editInit = function(validate,lindex){
    	var list = datatable.selected();  	 
		layui.common.set({
			id:'ele-edit-form',
			data:list[0]
		});
		$('#ele-edit-form select[name=id]').html(list[0].id);
		form.render('checkbox');
		form.render('radio');
		
		var eleType=$('input:radio[name="eleType"]:checked').val();
		if(eleType =='button'){
			$('#pic').hide();
			$('#ele_name').show();
		}else{
			$('#pic').show();
			$('#ele_name').hide();
		}
		form.on('radio', function(data){
			console.log(data.value); //被点击的radio的value值
			if(data.value == 'button'){
				$('#pic').hide();
				$('#ele_name').show();
			}else{
				$('#pic').show();
				$('#ele_name').hide();
			}
		}); 
		
		$("#edit_view_image").attr('src',list[0].eleSrc);
		// 添加图片的按钮绑定
		$("#edit_view_image_file").unbind("change").bind("change",editViewImage);
		
		$('#ele-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		$('#ele-update-button').bind('click',function(){
        	if(validate.valid()){  
        		
        		var eleType=$('input:radio[name="eleType"]:checked').val();
        		if(eleType =='button'){
        			if($("#eleName").val() == ''){
        				layui.msg.tips('请填写车位名称!');
        				return;
        			}
        		}else{
        			if($("#eleSrc").val() == ''){
        				layui.msg.tips('请上传图片!');
        				return;
        			}
        		}
        		
        		layui.common.ajax({
        			url:base_url+'update',
        			data:$('#ele-edit-form').serialize(),
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
		layui.msg.error('请选择一条记录');
		return false;
	}
    	var param = new Object();
    	param.url = 'edit.html';
    	param.title = '编辑信息'; 
    	var valid = new Object();
    	valid.id = "ele-edit-form";
    	valid.rules = {
        		eleName:{
    				rangelength: [1,10]
        		},
        		eleX:{
    				required:true,
    				digits:true,
    				rangelength: [1,3]
        		},
        		eleY:{
    				required:true,
    				digits:true,
    				rangelength: [1,3]
        		},
        		eleWidth:{
    				required:true,
    				digits:true,
    				rangelength: [1,3]
        		},
        		eleHeight:{
    				required:true,
    				digits:true,
    				rangelength: [1,3]
        		}
        	};
        	valid.messages = {
        		eleName:{
        			rangelength:'车位名称长度应在[1,10]内'
        		},
        		eleX:{
        			required:"请填写横坐标x",
        			digits:"请输入正整数",
        			rangelength:'横坐标x长度应在[1,3]内'
        		},
        		eleY:{
        			required:"请填写纵坐标y",
        			digits:"请输入正整数",
        			rangelength:'纵坐标y长度应在[1,3]内'
        		},
        		eleWidth:{
        			required:"请填写宽度",
        			digits:"请输入正整数",
        			rangelength:'宽度应在[1,3]内'
        		},
        		eleHeight:{
        			required:"请填写高度",
        			digits:"请输入正整数",
        			rangelength:'高度应在[1,3]内'
        		}
        		
        	}; 
    	param.validate = valid;
    	param.width = 700;
    	param.init = editInit;
    	layui.common.modal(param);
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
				url:'/admin/biz/prefecture_ele/delete',
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
	
});