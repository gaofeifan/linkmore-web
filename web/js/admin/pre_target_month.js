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
	var base_url = "/admin/pre_target_month/";
	
	var selectedMenuId = session.getItem('menu-selected-id'); 
	
	/*var treeNodeId=localStorage.getItem("treeNodeId");
	if(treeNodeId==null){
		var nodes = tree.getNodes();
		if(nodes!=null&&nodes.length>0){
			tree.selectNode(nodes[0]);
			treeClick (null, 'project-main-tree', nodes[0], '1');
		}
	}else{
		var node = tree.getNodeByParam("id", treeNodeId, null);
		if(node!=null){
			tree.selectNode(node);
			treeClick (null, 'project-main-tree', node, '1');
		}else{
			var nodes = tree.getNodes();
			if(nodes!=null&&nodes.length>0){
				tree.selectNode(nodes[0]);
				treeClick (null, 'project-main-tree', nodes[0], '1');
			}
		}
	}*/
	
	
	
	
	
	
	
 	var treeClick = function(event, treeId, treeNode, clickFlag){ 
 		level = treeNode.level;
 		if(level==1){
 			selectedEntId = treeNode.id; 
 			session.setItem('menu-selected-id',selectedEntId);
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
		// 车区树
	var tree = null;
	layui.common.ajax({
		url: base_url+"tree",
		data:{time:new Date().getTime()},  
		success: function(data) {
			tree = $.fn.zTree.init($("#pre-tree"), setting, data); 
			var nodes = tree.getNodes(); 
			
			if(selectedMenuId!=null){
				nodes = tree.getNodesByParam("id",selectedMenuId,null); 
				tree.selectNode(nodes[0]);
				treeClick (null, 'pre-tree', nodes[0], '1');
			}
			
			if(nodes[0].children!=null && nodes[0].children[0]!=undefined){
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
		filter.property = 'prefectureId';
		filter.value = selectedEntId;
		filters.push(filter);
		if("" != name){
			var filter = new Object();
			filter.property = 'mounth';
			filter.value = '%'+name+'%';
			filters.push(filter);
		}
		if(filters.length>0){
			data.push({name:'filterJson',value:JSON.stringify({filters:filters})});
		}
	}
	// 分页
	var datatable = layui.datatable.init({
		
		id:'target-month-table',
		url:base_url+'list', 
		key:'id',
		columns:[ 
			{ sTitle: '月份',   mData: 'mounth'}, 
			{ sTitle: '当前用户数',   mData: 'currentUserCount'}, 
			{ sTitle: '当前订单数',   mData: 'currentOrderCount'}, 
			{ sTitle: '目标用户数',   mData: 'targetUserCount'}, 
			{ sTitle: '目标订单数',   mData: 'targetOrderCount'}, 
			{
				sTitle: '创建时间',
	          	mData: 'createTime' ,
	          	bSortable: true,
	          	mRender:function(mData,type,full){
	          		 return new Date(mData).format('yyyy-MM-dd hh:mm');
	          	}
			},
			{
				sTitle: '操作',
	          	mRender:function(mData,type,full){
	          		var html = '<a class="operation-detail" href="day_list.html?mounth_id='+full.id+'">详情</a>';
	          		return html;
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
	
});