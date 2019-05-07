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
	var base_url = "/admin/biz/prefecture_ent/";
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
		var filter = new Object();
		filter.property = 'preId';
		filter.value = selectedEntId;
		filters.push(filter);
	
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
			{ sTitle: '名称',   mData: 'name'}, 
			{ sTitle: '通道类型',   mData: 'entranceType'}
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
	

	var addInit = function(validate,lindex){
		$('#ele-add-form input[name=preId]').val(selectedEntId);
		$('#ele-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});

		$('#ele-add-button').bind('click',function(){
        	if(validate.valid()){
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
    		name:{
				rangelength: [1,10]
    		},
    		entranceType:{
				rangelength: [1,10]
    		}
    	};
    	valid.messages = {
    		name:{
    			rangelength:'名称长度应在[1,10]内'
    		},
    		entranceType:{
    			rangelength:'通道类型长度应在[1,10]内'
    		}
    	}; 
    	param.validate = valid;
    	param.width = 700;
    	param.init = addInit;
    	layui.common.modal(param);  
    });
    
    var editInit = function(validate,lindex){
    	var list = datatable.selected();  	 
		layui.common.set({
			id:'ele-edit-form',
			data:list[0]
		});
		$('#ele-edit-form input[name=id]').html(list[0].id);
		
		$('#ele-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		$('#ele-update-button').bind('click',function(){
        	if(validate.valid()){  
        		
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
    		name:{
				rangelength: [1,10]
    		},
    		entranceType:{
				rangelength: [1,10]
    		}
    	};
    	valid.messages = {
    		name:{
    			rangelength:'名称长度应在[1,10]内'
    		},
    		entranceType:{
    			rangelength:'通道类型长度应在[1,10]内'
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
				url:base_url + 'delete',
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