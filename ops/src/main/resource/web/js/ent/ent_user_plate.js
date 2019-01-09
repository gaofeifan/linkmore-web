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

	function getUrlParam(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
        var r = window.location.search.substr(1).match(reg);  //匹配目标参数
        if (r != null) return unescape(r[2]);
        return null; //返回参数值
    }
	
	var addServerParams = function(data){
		
		var filters = new Array();
		var filter = null; 
		filter = new Object();
		
		var searchPhone = $('#mobile').val();
		if(searchPhone!=null && searchPhone!=''){
			filter = new Object();
			filter.property = 'mobile';
			filter.value = '%'+searchPhone +'%';
			filters.push(filter);
		}
		var searchName = $('#userName').val();
		if(searchName!=null  && searchName!=''){
			filter = new Object();
			filter.property = 'userName';
			filter.value = '%'+searchName +'%';
			filters.push(filter);
		}
		var searchPlate = $('#plateNo').val();
		if(searchPlate!=null && searchPlate!=''){
			filter = new Object();
			filter.property = 'plateNo';
			filter.value = '%'+searchPlate +'%';
			filters.push(filter);
		}
		if(filters.length>0){
			data.push({name:'filterJson',value:JSON.stringify({filters:filters})});
		}
	};
	var lastCheckedId = null;
	
	var datatable = layui.datatable.init({
		id:'ent-user-plate-table',
		url:'/admin/ent/ent-user-plate/list', 
		key:'id',
		columns:[ 
			{ sTitle: 'id',   mData: 'id', bVisible:false}, 
			/*{ sTitle: '用户名称',   mData: 'userName'}, */
			{ sTitle: '手机号',   mData: 'mobile'}, 
			{ sTitle: '车牌号',   mData: 'plateNo'}, 
			{ sTitle: '操作人',   mData: 'createUserName'}, 
			{
				sTitle: '创建时间',
				mData: 'createTime' ,
				bSortable: true,
				mRender:function(mData,type,full){
					return new Date(mData).format('yyyy-MM-dd hh:mm:ss');
				}
			}
		],
		orderIndex:5,
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
		form.render('checkbox'); 
		$('#rent-user-cancel-button').bind('click',function(){
			layui.msg.confirm('您确定要放弃此次操作吗？放弃后您填写的信息将不会被保存。确定放弃请点击【确认】，不放弃请点击【取消】',function(){
				layui.msg.close(lindex);
				layui.layer.close(lindex);
			}, function(index){

	        }, function(){
	        	
	        });
			
		});

		$('#rent-user-add-button').bind('click',function(){
			if(validate.valid()){
	        	layui.common.ajax({
	        		url:'/admin/ent/ent-user-plate/save',
	        		data:$('#rent-user-add-form').serialize(),
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
    $('#add-button').bind('click',function(){
    	var param = new Object();
    	param.url = 'add.html';
    	param.title = '添加信息'; 
    	var valid = new Object();
    	valid.id = "rent-user-add-form";
    	valid.rules = {
    		/*userName:{
    			rangelength:[0,32],
    			required: true
    		},*/plateNo:{
    			required: true,
    			isPlateNo:true
    		},mobile:{
    			rangelength:[11,11]
    		}  
    	};
    	valid.messages = {
    		/*userName:{
				rangelength:'用户名称不能超过32个字符', 
				required: '请填写用户名称'
    		},*/plateNo:{
    			required: '请填写车牌号',
    			isPlateNo:'请输入正确的车牌号'
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
			layui.msg.confirm('您确定要放弃此次操作吗？放弃后您填写的信息将不会被保存。确定放弃请点击【确认】，不放弃请点击【取消】',function(){
				layui.msg.close(lindex);
				layui.layer.close(lindex);
			}, function(index){

	        }, function(){
	        	
	        });
		});
		$('#rent-user-edit-button').bind('click',function(){
        	if(validate.valid()){  
        		layui.common.ajax({
        			url:'/admin/ent/ent-user-plate/update',
        			data:$('#rent-user-edit-form').serialize(),
        			success:function(res){
        				if(res.success){
        					layui.layer.close(lindex);
        					layui.msg.success(res.content);
        					window.setTimeout(function(){
        						location.reload(false);
        					},1000);
        				}else{
    						layui.msg.error(res.content);
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
    			/*userName:{
        			rangelength:[0,32],
        			required: true
        		},*/plateNo:{
        			required: true,
        			isPlateNo:true
        		},mobile:{
        			rangelength:[11,11]
        		}
    	};
    	valid.messages = {
        		/*userName:{
    				rangelength:'用户名称不能超过32个字符',
    				required: '请填写用户名称'
        		},*/plateNo:{
        			required: '请填写车牌号',
        			isPlateNo:'请输入正确的车牌号'
        		},mobile:{
        			rangelength:'请输入正确的手机号'
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
		layui.msg.confirm('您确定要删除这个车牌吗？</br>确定删除请点击【确认】</br>不删除请点击【取消】',function(){
			layui.common.ajax({
				url:'/admin/ent/ent-user-plate/delete',
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
		$('#excel-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		$('#excel-add-button').bind('click',function(){
			var data = new FormData($( "#excel-add-form" )[0]); 
			layui.common.upload({
				url:'/admin/ent/ent-user-plate/importExcel',
				data:data,
				success:function(res){
					if(res.success){
						layui.layer.close(lindex);
			    		layui.msg.success(res.content);
						window.setTimeout(query,5000);
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