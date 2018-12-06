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
layui.use(['layer','msg','form','ztree', 'common','datatable','laydate'], function() {
	var session = window.sessionStorage;
	var layer = layui.layer;  
	var $ = layui.jquery; 
	var form = layui.form;   
	var setting = {
		check: {
			enable: true
		},
		data: {
			simpleData: {
				enable: true
			}
		}
	};
	
	var addServerParams = function(data){  
		
		var filters = new Array();
		var filter = null; 
		filter = new Object();
		//filter.property = 'rentEntId';
		//filter.value = selectedMenuId;
		filters.push(filter);
		var searchPhone = $('#mobile').val();
		if(searchPhone!=null && searchPhone!=''){
			filter = new Object();
			filter.property = 'mobile';
			filter.value = '%'+searchPhone +'%';
			filters.push(filter);
		}
		var searchName = $('#username').val();
		if(searchName!=null  && searchName!=''){
			filter = new Object();
			filter.property = 'username';
			filter.value = '%'+searchName +'%';
			filters.push(filter);
		}
		var searchPlate = $('#plate').val();
		if(searchPlate!=null && searchPlate!=''){
			filter = new Object();
			filter.property = 'plate';
			filter.value = '%'+searchPlate +'%';
			filters.push(filter);
		}
		if(filters.length>0){
			data.push({name:'filterJson',value:JSON.stringify({filters:filters})});
		}
	};
	var lastCheckedId = null;
	
	var datatable = layui.datatable.init({
		id:'rent-user-table',
		url:'/admin/ent/rent-ent-user/list', 
		key:'id',
		columns:[ 
			{ sTitle: 'id',   mData: 'id', bVisible:false}, 
			{ sTitle: '公司名称',   mData: 'companyName'}, 
			{ sTitle: '用户名称',   mData: 'userName'}, 
			{ sTitle: '手机号',   mData: 'mobile'}, 
			{ sTitle: '车牌号',   mData: 'plate'}, 
			{
				sTitle: '创建时间',
				mData: 'createTime' ,
				bSortable: true,
				mRender:function(mData,type,full){
					return new Date(mData).format('yyyy-MM-dd hh:mm:ss');
				}
			},
			{ sTitle: '状态',   mData: 'status',
	          	mRender:function(mData,type,full){
	          		var html = '<label style="color:gray">未知</label>';
	          		if(mData==0){
	          			html = '<label style="color:gray">默认</label>';
	          		}else if(mData==1){
	          			html = '<label style="color:gray">关闭</label>'; 
	          		}else if(mData==2){
	          			html = '<label style="color:blue">开启</label>'; 
	          		}
	          		return html;
	          	}
			} 
		],
		orderIndex:6,
		orderType:'desc',
		filter:addServerParams
	});  
	
	var query =  function(){
		datatable.reload();
		
	} ;  
	$('.search_btn').bind('click',function(){
		query();
	});  
	
	/*
	 * 添加
	 */
	var addInit = function(validate,lindex){
		$("#rentEntId").val(selectedMenuId);
		form.render('checkbox'); 
		$('#rent-user-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		$('#rent-user-add-button').bind('click',function(){
        		layui.common.ajax({
        			url:'/admin/ent/rent-ent-user/add',
        			data:$('#rent-user-add-form').serialize(),
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
    $('#add-button').bind('click',function(){
    	var param = new Object();
    	param.url = 'add.html';
    	param.title = '添加信息'; 
    	var valid = new Object();
    	valid.id = "rent-user-add-form";
    	valid.rules = {
    		usernmae:{
    			rangelength:[1,32],
    			required: true
    		},mobile:{
    			rangelength:[11,11]
    		}  
    	};
    	valid.messages = {
			usernmae:{
				rangelength:'用户名称不能为空', 
				required: '请填写用户名称'
    		},mobile:{
    			rangelength:'请输入正确的手机号'  
    		} 
    	}; 
    	param.validate = valid;
    	param.width = 600;
    	param.init = addInit;
    	layui.common.modal(param);  
    });
    /*
     * 编辑
     */
    var editInit = function(validate,lindex){
		var list = datatable.selected();
		layui.common.set({
			id:'rent-user-edit-form',
			data:list[0]
		});
		form.render('checkbox');
		form.render('select');
		$('#rent-user-cancel-edit-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		$('#rent-user-edit-button').bind('click',function(){
        	if(validate.valid()){  
        		layui.common.ajax({
        			url:'/admin/ent/rent-ent-user/edit',
        			data:$('#rent-user-edit-form').serialize(),
        			success:function(res){
        				if(res.success){
        					layui.layer.close(lindex);
        					layui.msg.success(res.content);
        					window.setTimeout(function(){
        						location.reload(false);
        					},1000);
        				}
        			} 
        		});
        	}
        });
	}
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
    	valid.id = "rent-user-edit-form";
    	valid.rules = {
    		cellphone:{
    			rangelength:[11,11],
    			required: true,
    			digits:true,
    			remote:{
    				url:"/admin/ent/rent-ent-user/check",  
    				data:{
    					property:"cellphone",
    					value:function(){return $('#admin-user-edit-form input[name=cellphone]').val();},
    					id:function(){return $('#admin-user-edit-form input[name=id]').val();}
    				}
    			}
    		},realname:{
    			rangelength:[1,12],  
    			required: true
    		}  
    	};
    	valid.messages = {
    		cellphone:{
    			rangelength:'手机号长度有误', 
    			required: '请填写手机号',
    			remote:'手机号已经存在',
    			digits:'手机号格式有误',
    		},realname:{
    			rangelength:'姓名应该在[1,12]内',  
    			required: '请填写姓名'
    		} 
    	}; 
    	param.validate = valid;
    	param.width = 600;
    	param.init = editInit;
    	layui.common.modal(param);
	});
	/*
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
		layui.msg.confirm('管理员的权限也将被删除,确认删除？',function(){
			layui.common.ajax({
				url:'/admin/ent/rent-ent-user/delete',
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
	
	  
    var addFileInit = function(validate,lindex){
    	
    	var initPrefectureId=function(){
    		layui.common.ajax({
    			url:'/admin/biz/prefecture/selectListByUser',
    			//contentType:'application/json; charset=utf-8',
    			success:function(data){
    				if(data!=null){
    					arrayStrategyDate=data;
    					$("#prefectureId").empty();
    					for(var i=0;i<data.length;i++){
    						$("#prefectureId").append("<option value='"+data[i].id+"'>"+data[i].name+"</option>");
    					}
    					form.render('select');
    					//form.render();
    					initStrategyFee();
    				}
    			},error:function(){
    				
    			}
    		});
    	};
    	//initPrefectureId();
    	
		$('#excel-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		$('#excel-add-button').bind('click',function(){
			var data = new FormData($( "#excel-add-form" )[0]); 
			layui.common.upload({
				url:'/admin/ent/rent-ent-user/importExcel',
				data:data,
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
        });
	};
    $('#import-button').bind('click',function(){
    	var param = new Object();
    	param.url = 'add_excel.html';
    	param.title = '导入车牌';  
    	param.width = 600;
    	param.init = addFileInit;
    	layui.common.modal(param);  
    });
	
	
});