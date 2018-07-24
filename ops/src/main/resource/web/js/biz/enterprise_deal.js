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
	var lastNode = null; 
	var level = session.getItem('menu-tree-level'); 
	var selectedMenuId = session.getItem('menu-selected-id'); 
 	var treeClick = function(event, treeId, treeNode, clickFlag){
 		selectedMenuId = treeNode.id; 
 		level = treeNode.level;
 		if(level==2){
 			session.setItem('menu-selected-id',selectedMenuId);
 	 		session.setItem('menu-tree-level',level); 
 			query();
 		} else{
 			tree.selectNode(lastNode);  
 			layui.msg.error('请选择第三组页面树');
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
	var tree = null;
	layui.common.ajax({
		url: "/admin/biz/enterprise_deal/tree",
		data:{time:new Date().getTime()},
		contentType:'application/json; charset=utf-8', 
		success: function(data) {
			tree = $.fn.zTree.init($("#menu-tree"), setting, data);
			var nodes = tree.getNodes();
			
			if(selectedMenuId!=null){
				nodes = tree.getNodesByParam("id",selectedMenuId,null); 
			}
			tree.selectNode(nodes[0]); 
			selectedMenuId = nodes[0].id; 
			level = nodes[0].level;
			query();
		},
		error:function(){}
	});
	
	var enterpriseHtml = '';
	var enterpriseList = null;
	var enterpriseMap = layui.common.map();
	layui.common.ajax({
		url:'/admin/biz/enterprise/selectAll',
		data:{time:new Date().getTime()}, 
		async:false,
		success:function(list){
			enterpriseList = list;
			enterpriseHtml = '<option value="">选择企业</option>';
			$.each(list,function(index,enterprise){
				enterpriseMap.put(enterprise.id,enterprise.name);
				enterpriseHtml += '<option value="'+enterprise.id+'">';
				enterpriseHtml += enterprise.name;
				enterpriseHtml += '</option>';
			});
			$('#search-enterprise-name').html(enterpriseHtml);
			form.render('select');
		},error:function(){
			
		}
	});
	
	var categoryList = null;
	var pageList = null;
	var categoryMap = layui.common.map();
	var pageMap = layui.common.map();
	var init = function(){
		$.each(categoryList,function(index,category){
			category.pageList = new Array();
			categoryMap.put(category.id,category);
		});
		var category = null;
		$.each(pageList,function(index,page){
			category = categoryMap.get(page.categoryId);
			if(category!=null){
				category.pageList.push(page);
				categoryMap.put(category.id,category);
			}
			pageMap.put(page.id,page);
		});
		
	};
	var buildSelect = function(list){
		var html = '';
		$.each(list,function(index,data){
			html += '<option value="'+data.id+'">';
			html += data.name;
			html += '</option>';
		});
		return html;
	};
	layui.common.ajax({
		url: "/admin/biz/enterprise_deal/map",
		data:{time:new Date().getTime()}, 
		success: function(data) {
			categoryList = data.category;
			pageList = data.page 
			init();
		},
		error:function(){}
	});
	
	var addServerParams = function(data){  
		var filters = new Array();
		var filter = new Object();
		filter.property = 'parentId';
		filter.value = selectedMenuId;
		filters.push(filter);
		var searchStatus = $('#search-serial').val();
		if(searchStatus!=''){
			filter = new Object();
			filter.property = 'searchSerial';
			filter.value = '%'+searchStatus +'%';
			filters.push(filter);
		}
		if(filters.length>0){
			data.push({name:'filterJson',value:JSON.stringify({filters:filters})});
		}
	};
	var datatable = layui.datatable.init({
		id:'contract-table',
		url:'/admin/biz/enterprise_deal/list', 
		key:'id',
		columns:[
			{
				sTitle: '行业名称',
	          	mData: 'enterpriseName' 
			} ,{ sTitle: '合同编号',   mData: 'serialNumber'}, 
			{ sTitle: '订单金额',   mData: 'dealPayAmount'}, 
			{ sTitle: '赠送金额',   mData: 'dealGiftAmount'}, 
			{ sTitle: '备注',   mData: 'remark'}, 
			{ sTitle: '创建人',   mData: 'creatorName'}, 
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
		$.each(list,function(index,menu){
			ids.push(menu.id);
		});
		layui.msg.confirm('您确定要删除',function(){
			layui.common.ajax({
				url:'/admin/biz/enterprise_deal/delete',
				data:JSON.stringify(ids),
				contentType:'application/json; charset=utf-8',
				success:function(res){
					if(res.success){  
						layui.msg.success(res.content);
						window.setTimeout(function(){
    						location.reload(false);
    					},1000);
					}else{
						layui.msg.error(res.content);
					}
					
				},error:function(){
					
				}
			});
		}); 
	});
	
	var addInit = function(validate,lindex){   
		$('#enterprise-name').html(enterpriseHtml);
		$('#enterprise-name').val(selectedMenuId);
		form.render('select'); 
		$('#menu-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		$('#menu-add-button').bind('click',function(){
			$("#enterpriseId").val($("#enterprise-name").find("option:selected").text());
			
			if(validate.valid()){  
        		layui.common.ajax({
        			url:'/admin/biz/enterprise_deal/save',
        			data:$('#menu-add-form').serialize(),
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
    	valid.id = "menu-add-form";
    	valid.rules = {
    		serialNumber:{
				rangelength:[1,32] ,
				required: true,
				remote:{
					url:"/admin/biz/enterprise_deal/check",  
					data:{
						property:"serial_number",
						value:function(){return $('#menu-add-form input[name=serialNumber]').val();},
						id:function(){return new Date().getTime();}
					}
				}
			},dealPayAmount:{
				rangelength:[1,32] ,
				digits:true,
				required: true
			},dealGiftAmount:{
				rangelength:[1,32] ,
				digits:true,
				required: true
			},orderIndex:{ 
    			digits:true,
    			required: true
    		} 
    	};
    	valid.messages = {
    			serialNumber:{
    			rangelength:'合同编号长度应在[1,32]内', 
    			required: '请填写名称',
    			remote:'合同编号已存在'
    		},dealPayAmount:{
    			rangelength:'订单金额应该在[1,32]内',  
    			digits:'金额请输入整数',
    			required: '请填写订单金额'
    		},dealGiftAmount:{
    			rangelength:'赠送金额长度应该在[1,32]内',  
    			digits:'金额请输入整数',
    			required: '请填写赠送金额'
    		},orderIndex:{ 
    			digits:'排序请输入整数',
    			required: '请填写排序号'
    		} 
    	}; 
    	param.validate = valid;
    	param.width = 600;
    	param.init = addInit;
    	layui.common.modal(param);  
    });
    
    
    var editInit = function(validate,lindex){ 
    	$('#enterprise-id').html(enterpriseHtml);
		form.render('select');
    	var html = '<option value="0">请选择页面分类</option>';
		html += buildSelect(categoryList);
		$('#menu-edit-form select[name=categoryId]').html(html);   
		form.on('select(categoryId)', function(data) {
			var categoryId = data.value; 
			var category = categoryMap.get(categoryId); 
			var html = '<option value="0">请选择接口类</option>';
			if(category!=null){
				html += buildSelect(category.pageList);
			}  
			$('#menu-edit-form select[name=pageId]').html(html);
			form.render('select');  
        }); 
    	
    	
		var list = datatable.selected();  
		if(list[0].pageId!=null){
			var page = pageMap.get(list[0].pageId);
			if(page!=null){
				list[0].categoryId = page.categoryId;
				var category = categoryMap.get(page.categoryId);
				if(category!=null&&category.pageList!=null){
					var html = '<option value="0">请选择接口类</option>';
					html += buildSelect(category.pageList);
					$('#menu-edit-form select[name=pageId]').html(html); 
				}
			}
		}
		layui.common.set({
			id:'menu-edit-form',
			data:list[0]
		});
		$('#menu-edit-form input[name=id]').val(list[0].id);
		form.render('checkbox');
		form.render('select');
		$('#menu-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		$('#menu-update-button').bind('click',function(){
			$("#enterprise-name").val($("#enterprise-id").find("option:selected").text());
        	if(validate.valid()){  
        		layui.common.ajax({
        			url:'/admin/biz/enterprise_deal/update',
        			data:$('#menu-edit-form').serialize(),
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
    	valid.id = "menu-edit-form";
    	valid.rules = {
    		serialNumber:{
    			rangelength:[1,32] ,
    			required: true,
    			remote:{
    				url:"/admin/biz/enterprise_deal/check",  
    				data:{
    					property:"serial_number",
    					value:function(){return $('#menu-edit-form input[name=serialNumber]').val();},
    					id:function(){return $('#menu-edit-form input[name=id]').val();}
    				}
    			}
    		},dealPayAmount:{
    			rangelength:[1,32],  
    			digits:true,
    			required: true
    			
    		},dealGiftAmount:{
    			rangelength:[1,32],
    			digits:true,
    			required: true
    			
    		},orderIndex:{ 
    			digits:true,
    			required: true
    		} 
    	};
    	valid.messages = {
    		serialNumber:{
    			rangelength:'合同编号长度应在[1,32]内', 
    			required: '请合同编号',
    			remote:'合同已存在'
    		},dealPayAmount:{
    			rangelength:'订单金额长度应该在[1,32]内', 
    			digits:'金额请输入整数',
    			required: '请填订单金额'
    		},dealGiftAmount:{
    			rangelength:'赠送金额长度应该在[1,32]内', 
    			digits:'金额请输入整数',
    			required: '请填写赠送金额'
    		},orderIndex:{ 
    			digits:'排序请输入整数',
    			required: '请填写排序号'
    		} 
    	}; 
    	param.validate = valid;
    	param.width = 600;
    	param.init = editInit;
    	layui.common.modal(param);  
    });
});