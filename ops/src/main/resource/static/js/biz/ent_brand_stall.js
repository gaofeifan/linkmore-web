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
	var preId = null;
	var prename = null;
	var level = 0;
	var lastNode = null;
	var stemp=null;
	var base_url = "/admin/biz/ent-brand-stall/";
 	var treeClick = function(event, treeId, treeNode, clickFlag){ 
 		level = treeNode.level;
 		if(level==1){
 			selectedEntId = treeNode.id; 
			preId = treeNode.code; 
			prename = treeNode.name;
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
				preId = nodes[0].children[0].code; 
				prename = nodes[0].children[0].name;
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
		filter.property = 'brandPreId';
		filter.value = selectedEntId;
		filters.push(filter);
		if("" != status){
			var filter = new Object();
			filter.property = 'stallStatus';
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
				url:'/admin/biz/ent-brand-stall/delete',
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
	          	mData: 'stallStatus',
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
	
	var cityHtml = '';
	// 城市
	function preName(){
		cityHtml = '';
		cityHtml += '<div class="layui-form-item"><label class="layui-form-label">'+prename +'</label>';
		cityHtml += '<div class="layui-input-block"><hr>';
		cityHtml += '<div id="pre-list-div">';
		stallList(preId);
		cityHtml += '</div></div>';
		$('#stall').html(cityHtml);
	}
	
	function stallList(preId){
		layui.common.ajax({
			url:'/admin/biz/ent-brand-stall/stall-list',
			data:JSON.stringify(preId),
			contentType:'application/json; charset=utf-8',
			async:false,
			success:function(list){
				$.each(list,function(index,stall){
					cityHtml += '<input type="checkbox" lay-skin="primary" name="stallId" value="'+stall.id+'" title="'+stall.stallName+'">';
				});
				cityHtml +='</div>';
			},error:function(){
			}
		});
	}
	
	

	var addInit = function(validate,lindex){
		$('#brand-stall-add-form input[name=brandPreId]').val(selectedEntId);
		$('#brand-stall-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		preName();
		form.render('checkbox');
		$('#brand-stall-add-button').bind('click',function(){
			
			var checked = $('#pre-list-div input[name="stallId"]:checked');
			
			if(checked.length == 0){
				layui.msg.tips('请选择品牌车位!');
				return;
			}
			var ids = '';
			$.each(checked,function(index,ch){
				ids += ',';
				ids += ch.value;
			});
			$("#stallIdJson").val(ids.substring(1));
			
        	if(validate.valid()){
        		layui.common.ajax({
        			url:base_url+'save',
        			data:$('#brand-stall-add-form').serialize(),
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
    	valid.id = "brand-stall-add-form";
    	param.validate = valid;
    	param.width = 500;
    	param.init = addInit;
    	layui.common.modal(param);  
    });

});