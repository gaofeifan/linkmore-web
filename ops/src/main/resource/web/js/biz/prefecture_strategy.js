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
var baseUrl="/admin/biz/prefecture_strategy/";
layui.use(['layer','msg','form', 'common','validate','datatable','laydate','element'], function() {
	var validate = layui.validate; 
	var layer = layui.layer;
	var $ = layui.jquery; 
	var form = layui.form;
	var laydate = layui.laydate;
	var element = layui.element;
	var addServerParams = function(data){
		var searchName = $('#search-name').val();
		var searchType = $('#search-type').val();
		var filters = new Array();
		var filter = null;
		if(searchName!=''){
			filter = new Object();
			filter.property = 'name';
			filter.value = '%'+searchName +'%';
			filters.push(filter);
		}

		if(filters.length>0){
			data.push({name:'filterJson',value:JSON.stringify({filters:filters})});
		}
	};
	
	var query =  function(){
		datatable.reload();
	}; 
	
	var datatable = layui.datatable.init({
		id:'prefecture-strategy-table',
		url:baseUrl+'list', 
		key:'id',
		columns:[
			{ sTitle: '编号',   mData: 'id'},
			{ sTitle: '车区',   mData: 'prefectureName'} ,
			{ sTitle: '车区策略名称',   mData: 'name'},
			{ sTitle: '策略简介',   mData: 'detail'},
			{ sTitle: '操作人',   mData: 'updateUserName'} ,
			{ sTitle: '车区id',   mData: 'prefectureId', visible : false} ,
			{ sTitle: '状态',   mData: 'status',
	          	mRender:function(mData,type,full){
	          		var html = '<label style="color:gray">未知</label>';
	          		if(mData==0){
	          			html = '<label style="color:gray">默认</label>';
	          		}else if(mData==1){
	          			html = '<label style="color:gray">关闭</label>'; 
	          		}else if(mData==2){
	          			html = '<label style="color:blue">开启</label>'; 
	          		}else if(mData==3){
	          			html = '<label style="color:gray">过期</label>'; 
	          		}
	          		return html;
	          	}
			} ,
			{ sTitle: '创建(修改)时间',
			  mData: 'updateTime',
	          mRender:function(mData,type,full){
	        	  return new Date(mData).format('yyyy-MM-dd hh:mm:ss');
	          }	
			},
			/*
			{ sTitle: '操作',   mData: 'status',
				mRender:function(mData,type,full){
	          		var html = '<button class="layui-btn layui-btn-sm"><i class="layui-icon">&#xe642;</i></button>';
	          			html+= '<button class="layui-btn layui-btn-sm"><i class="layui-icon">&#xe705;</i></button>';
	          			html+= '<button class="layui-btn layui-btn-sm"><i class="layui-icon">&#xe640;</i></button>';
	          		return html;
	          	}
			} ,
			*/
		],
		orderIndex:6,
		orderType:'desc',
		filter:addServerParams
	});

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
		var flag = false;
		$.each(list,function(index,page){
			ids.push(page.id);
			if(page.status == 2){
				flag = true;
				return false;
			}
		});
		if(flag){
			layui.msg.error('启用状态下禁止删除');
			return false;
		}
		layui.msg.confirm('您确定要删除这个分时分组运营策略吗?<br>确定删除请点击【确认】<br>不删除请点击【取消】!',function(){
			layui.common.ajax({
				url:baseUrl+'delete',
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
					
				}
			});
		}); 
	});

	/**
	 * 启用策略
	 */
	$('#open-button').bind('click',function(){
		var list = datatable.selected(); 
		if(list.length<1){
			layui.msg.error('请至少选择一条记录');
			return false;
		}
		if(list[0].status == 2){
			layui.msg.error('该策略已启用');
			return false;
		}
		var ids = new Array();
		$.each(list,function(index,dg){
			ids.push(dg.id);
		});
		layui.msg.confirm('确定启用策略？',function(){
			layui.common.ajax({
				url:baseUrl+'status/open',
				contentType:'application/json; charset=utf-8',
				//data:JSON.stringify(list[0].id),
				data:JSON.stringify(ids),
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
	 * 关闭策略
	 */
	$('#close-button').bind('click',function(){
		var list = datatable.selected(); 
		if(list.length<1){
			layui.msg.error('请至少选择一条记录');
			return false;
		}
		if(list[0].status == 1){
			layui.msg.error('该策略已关闭');
			return false;
		}
		var ids = new Array();
		$.each(list,function(index,dg){
			ids.push(dg.id);
		});
		layui.msg.confirm('确定关闭策略？',function(){
			layui.common.ajax({
				url:baseUrl+'status/close',
				contentType:'application/json; charset=utf-8',
				//data:JSON.stringify(list[0].id),
				data:JSON.stringify(ids),
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
	 * 添加
	 */
    $('#add-button').bind('click',function(){
    	location.href='add1.html';
    });
    
	/**
	 * 查看
	 */
    $('#view-button').bind('click',function(){

    	var list = datatable.selected(); 
		if(list.length!=1){
			layui.msg.error('请选择一条记录');
			return false;
		}
		layui.sessionData('prefecture_strategy_edit', { key: 'pageData' ,value: list[0] });
    	location.href="view.html" ;
    	return false;

    });
    
	/**
	 * 编辑
	 */
    $('#edit-button').bind('click',function(){

    	var list = datatable.selected(); 
		if(list.length!=1){
			layui.msg.error('请选择一条记录进行编辑');
			return false;
		}
		layui.sessionData('prefecture_strategy_edit', { key: 'pageData' ,value: list[0] });
    	location.href="edit1.html" ;
    	return false;

    });
});