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
layui.use(['layer','msg','form', 'common','validate','datatable','laydate'], function() {
	var validate = layui.validate; 
	var layer = layui.layer;  
	var $ = layui.jquery; 
	var form = layui.form;  
	var laydate = layui.laydate; 
	var base_url = '/admin/admin/notice/';
	laydate.render({
	    elem: '#search-start-time',
	    min: '2015-06-16 23:59:59',
	    max: new Date().format('yyyy-MM-dd'),
		istoday: false
	});
	laydate.render({
	    elem: '#search-end-time',
	    min: '2015-06-16 23:59:59',
	    max: new Date().format('yyyy-MM-dd'),
		istoday: false
	}); 
	var addServerParams = function(data){
		var name = $('#search-category').val();
		var status = $('#search-status').val();
		var title = $('#search-title').val();
		var filters = new Array();
		var filter = null; 
		if(name!=''){
			filter = new Object();
			filter.property = 'category';
			filter.value = name;
			filters.push(filter);
		}
		if(status!=''){
			filter = new Object();
			filter.property = 'status';
			filter.value = status;
			filters.push(filter);
		} 
		if(title!=''){
			filter = new Object();
			filter.property = 'title';
			filter.value = '%'+title+'%';
			filters.push(filter);
		} 
		if(filters.length>0){
			data.push({name:'filterJson',value:JSON.stringify({filters:filters})});
		}
	};
	
	var datatable = layui.datatable.init({
		id:'admin-notice-table',
		url: base_url+'select_list', 
		key:'id',
		columns:[ 
			{ sTitle: '分类',   mData: 'type',
	          	mRender:function(mData,type,full){
	          		if(full.type == 0){
	          			return '<label style="color:gray;">文本</label>'
	          		}else if(full.type == 1){
	          			return '<label style="color:gray;">H5页面</label>'
	          		}else if(full.type == 3){
	          			return '<label style="color:gray;">优惠卷</label>'
	          		}
	          	}
			}, 
			{ sTitle: '标题',   mData: 'title'}, 
			{ sTitle: '描述',   mData: 'description'}, 
			{ sTitle: 'URL',   mData: 'url',bVisible:false}, 
			{ sTitle: '内容',   mData: 'content',bVisible:false}, 
			{ sTitle: '状态',   mData: 'status',
	          	mRender:function(mData,type,full){
	          		if(full.status == 0){
	          			return '<label style="color:gray;">已发送</label>'
	          		}else if(full.status == 1){
	          			return '<label style="color:gray;">未发送</label>'
	          		}
	          	}
			}, 
			{
				sTitle: '创建时间',
	          	mData: 'createTime' ,
	          	bSortable: true,
	          	mRender:function(mData,type,full){
	          		 return new Date(mData).format('yyyy-MM-dd hh:mm');
	          	}
			},
			{ sTitle: '操作',
				mRender:function(mData,type,full){
	          		 return '<a class="operation-detail" data-detail-id="'+full.id+'" href="javascript:void(0);">详情</a>&nbsp;&nbsp;&nbsp;&nbsp;';
	          	},bVisible:false
			}
		],
		orderIndex:6,
		orderType:'desc',
		filter:addServerParams
	});  
	
	var query =  function(){
		datatable.reload();
	};  
	
	$('.search_btn').bind('click',function(){
		query();
	});
	onDetail = function (data){
		var id = $(data).attr('data-id');
//		layui.msg.success("暂不开发，预留");
	}
	
	/**
	 * 推送
	 */
	$('#push-button').bind('click',function(){
		var list = datatable.selected(); 
		if(list.length < 1){
			layui.msg.error('请至少选择一条记录');
			return false;
		}
		var ids = new Array();
		$.each(list,function(index,page){
			ids.push(page.id);
		});
		layui.msg.confirm('您确定要推送选中的消息',function(){
			layui.common.ajax({
				url:base_url+'push',
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
	
	/*
	 * 添加
	 */
	var addInit = function(validate,lindex){
		form.render('select'); 
		$('#admin-notice-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		$("#url-id").hide();
		form.on('select(type)', function(data) {
			if(data.value == 1){
				$("#url-id").show();
			}else{
				$("#url-id").hide();
			}
		})
		$('#admin-notice-add-button').bind('click',function(){
        	if(validate.valid()){
        		layui.common.ajax({
        			url:base_url+'save',
        			data:$('#admin-notice-add-form').serialize(),
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
    	valid.id = "admin-notice-add-form";
    	valid.rules = {
    		title:{
    			rangelength:[1,32],
    			required: true
    		},
    		description:{
    			rangelength:[1,100],
    			required: true
    		},
    		content:{
    			rangelength:[1,100],
    			required: true
    		},url:{
    			required: true
    		}
    	};
    	valid.messages = {
    		title:{
    			rangelength:'标题应该在[1,32]内',  
    			required: '请填写标题'
    		},
    		description:{
    			rangelength:'描述应该在[1,100]内',  
    			required: '请填写描述'
    		},
    		content:{
    			rangelength:'内容应该在[1,100]内',  
    			required: '请填写内容'
    		},url:{
    			required: '请填写URl'
    		}
    	}; 
    	param.validate = valid;
    	param.width = 600;
    	param.init = addInit;
    	layui.common.modal(param);  
    });
    
    var editInit = function(validate,lindex){
    	var list = datatable.selected();
		layui.common.set({
			id:'notice-edit-form',
			data:list[0]
		});
    	if(list[0].type == 1){
    		$("#url-id").show();
    	}else if(list[0].type == 0){
    		$("#url-id").hide();
    	}
		form.render('select');
		layui.common.set({
			id:'notice-edit-form',
			data:list[0]
		});
		form.on('select(type)', function(data) {
			if(data.value == 1){
				$("#url-id").show();
			}else{
				$("#url-id").hide();
			}
		})
		$('#notice-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		$('#notice-update-button').bind('click',function(){
        	if(validate.valid()){  
        		layui.common.ajax({
        			url:'/admin/admin/notice/update',
        			data:$('#notice-edit-form').serialize(),
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
    	valid.id = "notice-edit-form";
    	valid.rules = {
        		title:{
        			rangelength:[1,32],
        			required: true
        		},
        		description:{
        			rangelength:[1,100],
        			required: true
        		},
        		content:{
        			rangelength:[1,100],
        			required: true
        		},url:{
        			required: true
        		}
        	};
        	valid.messages = {
        		title:{
        			rangelength:'标题应该在[1,32]内',  
        			required: '请填写标题'
        		},
        		description:{
        			rangelength:'描述应该在[1,100]内',  
        			required: '请填写描述'
        		},
        		content:{
        			rangelength:'内容应该在[1,100]内',  
        			required: '请填写内容'
        		},url:{
        			required: '请填写URL'
        		}
        	}; 
    	param.validate = valid;
    	param.width = 600;
    	param.init = editInit;
    	layui.common.modal(param);  
    });

	
});