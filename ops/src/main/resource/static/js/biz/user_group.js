layui.config({
	base: '/js/lib/'
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
layui.use(['layer','msg','form', 'common','validate','datatable','laydate'], function() {
	var validate = layui.validate; 
	var layer = layui.layer;  
	var $ = layui.jquery; 
	var form = layui.form;  
	var base_url = '/admin/biz/user_group/';
	
	var addServerParams = function(data){   
		var name = $('#search-name').val();
		var id = $('#search-id').val();
		var filters = new Array();
		var filter = null; 
		if(name!=''){
			filter = new Object();
			filter.property = 'name';
			filter.value = name;
			filters.push(filter);
		}
		if(id!=''){
			filter = new Object();
			filter.property = 'id';
			filter.value = id;
			filters.push(filter);
		} 
		if(filters.length>0){
			data.push({name:'filterJson',value:JSON.stringify({filters:filters})});
		}
	};
	
	var datatable = layui.datatable.init({
		id:'user-group-table',
		url: base_url+'list', 
		key:'id',
		columns:[ 
			{ sTitle: '用户组ID',   mData: 'id'}, 
			{ sTitle: '用户组名称',   mData: 'name'}, 
			{ sTitle: '用户组简介',   mData: 'content'}, 
			{ sTitle: '成员数',   mData: 'userNumber'}, 
			{ sTitle: '创建人',   mData: 'operName'}, 
			{
				sTitle: '创建时间',
	          	mData: 'createTime' ,
	          	bSortable: true,
	          	mRender:function(mData,type,full){
	          		 return new Date(mData).format('yyyy-MM-dd hh:mm');
	          	}
			},
			{
				sTitle: '启用/关闭',
	          	mData: 'status',
	          	mRender:function(mData,type,full){
	          		var html = '';
	          		if(1== mData){
	          			html += '<label style="color:#00CED1;">启用</label>';
	          		}else{
	          			html += '<label style="color:#FA8072">关闭</label>';
	          		}
	          		return html;
	          	}
			},
			{
				sTitle: '操作',
	          	mData: 'id',
	          	mRender:function(mData,type,full){
	          		var html = ''
	          			html += '<a style="color:#FF77FF;" data-id="'+mData+'" onclick="onDetail(this);" >查看</a>';
	          		return html;
	          	}
			}
		],
		orderIndex:1,
		orderType:'asc',
		filter:addServerParams
	});  
	
	var query =  function(){
		datatable.reload();
	};  
	
	$('.search_btn').bind('click',function(){
		query();
	});
	
    var editInit = function(validate,lindex){  
		var list = datatable.selected();  
		layui.common.set({
			id:'user-group-edit-form',
			data:list[0]
		});
		form.render('checkbox'); 
		$('#edit-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		$('#edit-update-button').bind('click',function(){
        	if(validate.valid()){  
        		layui.common.ajax({
        			url:base_url+ 'update',
        			data:$('#user-group-edit-form').serialize(),
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
    	valid.id = "user-group-edit-form";
    	param.validate = valid;
    	param.width = 600;
    	param.init = editInit;
    	layui.common.modal(param);  
    });
    
	$('#delete-button').bind('click',function(){
		var list = datatable.selected(); 
		if(list.length!=1){
			layui.msg.error('请选择一条记录');
			return false;
		} 
		if(list[0].status==1){
			layui.msg.error('用户组正在启用，无法删除');
			return false;
		} 
		layui.msg.confirm('您确定要删除',function(){
			layui.common.ajax({
				url:base_url+'delete',
				data:{id:list[0].id,time:new Date().getTime()}, 
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
	
	onDetail = function (data){
		var id = $(data).attr('data-id');
//		layui.msg.success("暂不开发，预留");
	}
	
});