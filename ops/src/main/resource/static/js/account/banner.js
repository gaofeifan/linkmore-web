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
	var laydate = layui.laydate; 
	var addServerParams = function(data){
		var filters = new Array();
		var filter = null; 
		if(filters.length>0){
			data.push({name:'filterJson',value:JSON.stringify({filters:filters})});
		}
	};
	
	var datatable = layui.datatable.init({
		id:'banner-table',
		url: '/admin/account/banner/list', 
		key:'id',
		columns:[ 
			{ sTitle: '图片',   mData: 'image'}, 
			{ sTitle: 'H5路径',   mData: 'path'}, 
			{ sTitle: '排序',   mData: 'orderIndex',bSortable: true,}, 
			{
				sTitle: '创建时间',
	          	mData: 'createTime' ,
	          	bSortable: true,
	          	mRender:function(mData,type,full){
	          		 return new Date(mData).format('yyyy-MM-dd hh:mm');
	          	}
			},
			{ sTitle: '状态',   mData: 'status',
				mRender:function(mData,type,full){
					if(mData == 0){
						return '<label style="color:green;">隐藏</label>';
					}
					return '<label style="color:green;">显示</label>';
				}	
			}
		],
		orderIndex:3,
		orderType:'asc',
		filter:addServerParams
	});  
	
	var query =  function(){
		datatable.reload();
	};  
	
	$('.search_btn').bind('click',function(){
		query();
	});
	
	
	var groupInit = function(validate,lindex){
		form.render('select');
		$('#banner-cancel-button').bind('click',function(){
			layui.msg.confirm('取消后，你填写的信息将不会保存，请谨慎选择。',function(){
				layui.layer.close(lindex);
			});
		});
		
		$("#image-id").change(function(){
			  var formData = new FormData($( "#banner-add-form" )[0]);
			layui.common.upload({
    			url:'/admin/base/attachment/image_upload',
    			type:'POST',
    			data:formData,
    			success:function(res){
    				if(res.success){
    					$("#banner-add-form input[name='image']").val(res.map.attach.compressUrl)
    				}
    			} 
    		});
		});
		
		$('#banner-add-button').bind('click',function(){
        		layui.common.ajax({
        			url:'/admin/account/banner/save',
        			data:$("#banner-add-form").serialize(),
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
	
	$('#show-button').bind('click',function(){
		var list = datatable.selected(); 
		if(list.length<1){
			layui.msg.error('请至少选择一条记录');
			return false;
		}
		var ids = new Array();
		$.each(list,function(index,page){
			ids.push(page.id);
		});
		layui.msg.confirm('您确定要显示',function(){
			layui.common.ajax({
				url:'/admin/account/banner/set_show',
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
	
	$('#hide-button').bind('click',function(){
		var list = datatable.selected(); 
		if(list.length<1){
			layui.msg.error('请至少选择一条记录');
			return false;
		}
		var ids = new Array();
		$.each(list,function(index,page){
			ids.push(page.id);
		});
		layui.msg.confirm('您确定要隐藏',function(){
			layui.common.ajax({
				url:'/admin/account/banner/set_hide',
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
	
	
	   $('#add-button').bind('click',function(){
	    	var param = new Object();
	    	param.url = 'add.html';
	    	param.title = '添加banner信息'; 
	    	var valid = new Object();
	    	valid.id = "banner-add-form";
	    	valid.rules = {
	    		path:{
			 		required: true
			 	}
	    	};
	    	valid.messages = {
	    		path:{
	    			required: '请填写路径'
			 	}
	    	}; 
	    	param.validate = valid;
	    	param.width = 500;
	    	param.init = groupInit;
	    	layui.common.modal(param);  
	    });
	    
	    var editInit = function(validate,lindex){
	    	var list = datatable.selected();
			layui.common.set({
				id:'banner-edit-form',
				data:list[0]
			});
			form.render('select');
			layui.common.set({
				id:'banner-edit-form',
				data:list[0]
			});
			$("#image-id").change(function(){
				  var formData = new FormData($( "#banner-edit-form" )[0]);
				layui.common.upload({
	    			url:'/admin/base/attachment/image_upload',
	    			type:'POST',
	    			data:formData,
	    			success:function(res){
	    				if(res.success){
	    					$("#banner-edit-form input[name='image']").val(res.map.attach.compressUrl)
	    				}
	    			} 
	    		});
			});
			$('#banner-cancel-button').bind('click',function(){
				layui.layer.close(lindex);
			});
			$('#banner-update-button').bind('click',function(){
	        	if(validate.valid()){  
	        		layui.common.ajax({
	        			url:'/admin/account/banner/update',
	        			data:$('#banner-edit-form').serialize(),
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
	    	valid.id = "banner-edit-form";
	    	valid.rules = {
		    		path:{
				 		required: true
				 	}
		    	};
		    	valid.messages = {
		    		path:{
		    			required: '请填写H5路径'
				 	}
		    	}; 
	    	param.validate = valid;
	    	param.width = 600;
	    	param.init = editInit;
	    	layui.common.modal(param);  
	    });
    
	
	    
	
});