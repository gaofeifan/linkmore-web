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

var URL_BASE = "/admin/account/group/input";
var URL_LIST =   URL_BASE + "/list";
var URL_SAVE =   URL_BASE + "/save";
var URL_UPDATE = URL_BASE + "/update";
var URL_DELETE = URL_BASE + "/delete";
var URL_DELETEANDUSER = URL_BASE + "/deleteAndUserByIds";
var URL_IMPORT = URL_BASE + "/import/excel";
var URL_SYNC =   URL_BASE + "/sync/byUserGroupId";
var URL_SAVE_BYUSERIDS =   URL_BASE + "/saveByUserIds";

var URL_LIST_USER = URL_BASE + "/pageUserByNotInUserGroup";


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

	var request = {
			QueryString : function(val) { 
				var uri = window.location.search; 
				var re = new RegExp("" +val+ "\=([^\&\?]*)", "ig"); 
				return ((uri.match(re))?(uri.match(re)[0].substr(val.length+1)):null); 
			}, 
			QueryStrings : function() { 
				var uri = window.location.search; 
				var re = /\w*\=([^\&\?]*)/ig; 
				var retval=[]; 
				while ((arr = re.exec(uri)) != null) 
					retval.push(arr[0]); 
				return retval; 
			}, 
			setQuery : function(val1, val2) { 
				var a = this.QueryStrings(); 
				var retval = ""; 
				var seted = false; 
				var re = new RegExp("^" +val1+ "\=([^\&\?]*)$", "ig"); 
				for(var i=0; i<a.length; i++) { 
					if (re.test(a[i])) { 
						seted = true; 
						a[i] = val1 +"="+ val2; 
					}
				}
				retval = a.join("&"); 
				return "?" +retval+ (seted ? "" : (retval ? "&" : "") +val1+ "=" +val2); 
			}
		}
	
    var userGroupId = decodeURI(request.QueryString("userGroupId"));
	var userGroupName=decodeURI(request.QueryString("userGroupName"));
	var groupType=decodeURI(request.QueryString("groupType"));
    $("#userGroupName").html("分组名称："+userGroupName);
    
	var addServerParams = function(data){
		
		var filters = new Array();
		var filter = null; 
		filter = new Object();
		if(userGroupId != ''){
			filter = new Object();
			filter.property = 'userGroupId';
			filter.value = userGroupId ;
			filters.push(filter);
		}

		var searchUserName = $('#search-user-name').val();
		if(searchUserName!=null  && searchUserName!=''){
			filter = new Object();
			filter.property = 'userName';
			filter.value = '%'+searchUserName +'%';
			filters.push(filter);
		}

		var searchUserMobile = $('#search-user-mobile').val();
		if(searchUserMobile!=null && searchUserMobile!=''){
			filter = new Object();
			filter.property = 'mobile';
			filter.value = '%'+searchUserMobile +'%';
			filters.push(filter);
		}
		
		var searchUserPlate = $('#search-user-plate').val();
		if(searchUserPlate!=null && searchUserPlate!=''){
			filter = new Object();
			filter.property = 'plate';
			filter.value = '%'+searchUserPlate +'%';
			filters.push(filter);
		}
		if(filters.length>0){
			data.push({name:'filterJson',value:JSON.stringify({filters:filters})});
		}
	};
	var lastCheckedId = null;
	
	var datatable = layui.datatable.init({
		id:'input-table',
		url:URL_LIST, 
		key:'id',
		columns:[
			{ sTitle: 'id',   mData: 'id', bVisible:false}, 
			{ sTitle: '用户名称',   mData: 'userName'}, 
			{ sTitle: '手机号',   mData: 'mobile'}, 
			{ sTitle: '车牌号',   mData: 'plate'}, 
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
		orderIndex:2,
		orderType:'desc',
		filter:addServerParams
	});  

	var query =  function(){
		datatable.reload();
		
	};
	$('.search_btn').bind('click',function(){
		query();
		
	});  
	
	/*
	 * 添加
	 */
	var addInit = function(validate,lindex){
		$('#userGroupId').val(userGroupId);
		
		var addServerParams1 = function(data){   
	        var filters = new Array();
	        var filter = null; 
	        var nickname = $('#search-nickname').val();
	        var mobile = $('#search-mobile').val();
	        var plateNo = $('#search-plateNo').val();
	        var ordersCount = $('#search-order-count').val();
	        var nature = $('#search-nature').val();
	        
	        if(userGroupId != ''){
				filter = new Object();
				filter.property = 'notInGroupId';
				filter.value = userGroupId ;
				filters.push(filter);
			}
	        if(ordersCount!=''){
	            filter = new Object();
	            filter.property = 'ordersCount';
	            filter.value = ordersCount;
	            filters.push(filter);
	        }
	        if(plateNo!=''){
	            filter = new Object();
	            filter.property = 'plateNo';
	            filter.value = plateNo;
	            filters.push(filter);
	        }
	        if(mobile!=''){
	            filter = new Object();
	            filter.property = 'mobile';
	            filter.value = mobile;
	            filters.push(filter);
	        }
	        if(nature!='-1'){
	                filter = new Object();
	                filter.property = 'nature';
	                filter.value = nature;
	                filters.push(filter);
	        }
	        if(nickname!=''){
	            filter = new Object();
	            filter.property = 'nickname';
	            filter.value = '%'+nickname+'%';
	            filters.push(filter);
	        }
	        if(filters.length>0){
	                data.push({name:'filterJson',value:JSON.stringify({filters:filters})});
	        }
		};
		
		
    	var datatable1 = layui.datatable.init({
    		id:'user-table',
    		// url:'/admin/biz/user/list', 
    		url:URL_LIST_USER, 
    		key:'id',
    		columns:[
    			//{ sTitle: 'id',   mData: 'id', bVisible:false}, 
                { sTitle: '用户名',   mData: 'nickName'},  
                { sTitle: '手机号码',   mData: 'mobile'},  
                { sTitle: '常规使用地',   mData: 'cityName'}, 
                { sTitle: '交易次数',   mData: 'orderCount'},
                { 
                    sTitle: '最近登录时间',
                    mData: 'loginTime' ,
                    bSortable: true,
                    mRender:function(mData,type,full){
                             return new Date(mData).format('yyyy-MM-dd hh:mm');
                    }
                },
                { 
                    sTitle: '最近下单时间',
                    mData: 'ordersTime' ,
                    bSortable: true,
                    mRender:function(mData,type,full){
                             return new Date(mData).format('yyyy-MM-dd hh:mm');
                    }
                },
                { 
                    sTitle: '用户状态',   
                    mData: 'userStatus',
                    mRender:function(mData,type,full){
                            var html = '';
                            switch(mData){
                            case 0: html = '<label style="color:#1E9FFF">后台发劵</label>';break;
                            case 1: html = '<label style="color:#FF5722">APP注册</label>';break;
                            case 2: html = '<label style="color:#5FB878">公众号</label>';break;
                            case 3: html = '<label style="color:#009688;">三方微信</label>';break; 
                            case 4: html = '<label style="color:#F7B824;">扫码领券</label>';break;
                            case 5: html = '<label style="color:#61768d;">分享领券</label>';break;
                            }
                            return html;
                    }
            }, 
                { sTitle: '车牌号',   mData: 'plateNo'}
    		],
    		orderIndex:4,
    		orderType:'desc',
    		pageSize:5,
    		filter:addServerParams1
    	}); 

    	var query1 =  function(){
       	 datatable1.reload();
       }; 
        $('#search-button').bind('click',function(){
          	 query1();
        });

		$('#add-cancel-button').bind('click',function(){
			if(groupType==3){
				var msg='您确定放弃添加用户吗？放弃后您选择的用户将不会被保存。确定放弃请点击【确认】，不放弃请点击【取消】'
			}else{
				var msg='您确定要放弃这个用户吗？放弃后您填写的信息将不会被保存。确定放弃请点击【确认】，不放弃请点击【取消】';
			}
			layui.msg.confirm(msg,function(){
				layui.msg.close(lindex);
				layui.layer.close(lindex);
			}, function(index){

	        }, function(){
	        	
	        });
			
		});

		$('#add-save-button').bind('click',function(){
		if(groupType==3) {
			var list = datatable1.selected();
			if(list.length<1){
				layui.msg.error('请至少选择一条记录');
				return false;
			}
			var ids = new Array();
			$.each(list,function(index,dg){
				ids.push(dg.id);
			});
			layui.msg.confirm('您确定要将所选择的用户加入到当前分组吗?</br>确定请点击【确认】</br>否则请点击【取消】',function(){
				layui.common.ajax({
					url:URL_SAVE_BYUSERIDS,
					//data:JSON.stringify(ids),
					data:{userGroupId:userGroupId,"ids":JSON.stringify(ids)},
					//contentType:'application/json; charset=utf-8',
					success:function(res){
						if(res.success){
							
							layer.alert(res.content+"</br>要继续录入吗?", {
							      closeBtn: 0,   // 是否显示关闭按钮
							      anim: 0, //动画类型
							      btn: ['继续','不录了'], //按钮
							      icon: 1,    // icon
							      yes:function(){
							    	  query1();
							      },
							      btn2:function(){
							    	 // window.setTimeout(query,1000);
							    	  layui.layer.close(lindex);
							    	  window.setTimeout(window.location.reload(),1000);
							    	 //window.location.reload();
							      }
							});
							//layui.msg.success(res.content);
							//window.setTimeout(query,1000);
						}else{
							layui.msg.error(res.content);
						}
					},error:function(){
						
					}
				});
			});

		}else{
			if(validate.valid()){
	        	layui.common.ajax({
	        		url:URL_SAVE,
	        		data:$('#add-form').serialize(),
	        		success:function(res){
	        			if(res.success){
		    				layui.layer.close(lindex);
		    				layui.msg.success(res.content);
		    				window.setTimeout(query,1000);
		    				window.setTimeout(window.location.reload(),1000);
		    				//window.location.reload();
		    			}else{
		    				layui.msg.error(res.content);
		    			}
	        		}
	        	});
			}
		}
        });
		
	};
    $('#add-button').bind('click',function(){
    	var param = new Object();
    	if(groupType==3){
    		param.url = 'input_user_add.html';
    		param.title = '请选择用户';
    	}else{
    		param.url = 'input_add.html';
    		param.title = '添加信息';
    	}
    	
    	var valid = new Object();
    	valid.id = "add-form";
    	valid.rules = {
    		userName:{
    			rangelength:[0,32],
    			required: false
    		},plate:{
    			required: true,
    			isPlateNo:true
    		},mobile:{
    			rangelength:[11,11]
    		}  
    	};
    	valid.messages = {
    		userName:{
				rangelength:'用户名称不能超过32个字符', 
				required: '请填写用户名称'
    		},plate:{
    			required: '请填写车牌号',
    			isPlateNo:'请输入正确的车牌号'
    		},mobile:{
    			rangelength:'请输入正确的手机号'  
    		} 
    	}; 
    	param.validate = valid;
    	param.width = 900;
    	param.init = addInit;
    	layui.common.modal(param); 
    });
    /*
     * 编辑
     */
    var editInit = function(validate,lindex){
		var list = datatable.selected(); 
		layui.common.set({
			id:'edit-form',
			data:list[0]
		});

		$('#edit-cancel-button').bind('click',function(){
			layui.msg.confirm('您确定要放弃这个用户吗？放弃后您填写的信息将不会被保存。确定放弃请点击【确认】，不放弃请点击【取消】',function(){
				layui.msg.close(lindex);
				layui.layer.close(lindex);
			}, function(index){

	        }, function(){
	        	
	        });
		});
		$('#edit-save-button').bind('click',function(){
        	if(validate.valid()){
        		layui.common.ajax({
        			url:URL_UPDATE,
        			data:$('#edit-form').serialize(),
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
		if(groupType==3){
			layui.msg.success('该用户分组类型不提供编辑功能');
			return false;
		}
		var list = datatable.selected(); 
		if(list.length!=1){
			layui.msg.error('请选择一条记录进行编辑');
			return false;
		}
		var param = new Object();
    	param.url = 'input_edit.html';
    	param.title = '编辑信息'; 
    	var valid = new Object();
    	valid.id = "edit-form";
    	valid.rules = {
    			userName:{
        			rangelength:[0,32],
        			required: false
        		},plate:{
        			required: true,
        			isPlateNo:true
        		},mobile:{
        			rangelength:[11,11]
        		}
    	};
    	valid.messages = {
        		userName:{
    				rangelength:'用户名称不能超过32个字符',
    				required: '请填写用户名称'
        		},plate:{
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
		layui.msg.confirm('您确定要删除这个用户吗？</br>确定删除请点击【确认】</br>不删除请点击【取消】',function(){
			if(groupType==3){
				layui.common.ajax({
					url:URL_DELETEANDUSER,
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
			}else{
				layui.common.ajax({
					url:URL_DELETE,
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
			}
			
			
		}); 
	});
	
	$('#return-button').bind('click',function(){
		window.location.href="list.html";
	});
	
    var addFileInit = function(validate,lindex){
    	
    	$('#userGroupId').val(userGroupId);
		$('#excel-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		$('#excel-add-button').bind('click',function(){
			var data = new FormData($( "#excel-add-form" )[0]); 
			layui.common.upload({
				url:URL_IMPORT,
				data:data,
				success:function(res){
					if(res.success){
						layui.layer.close(lindex);
						layer.alert(res.content, {
							      //skin: 'layui-layer-molv', //样式类名  自定义样式
							      closeBtn: 0,   // 是否显示关闭按钮
							      anim: 4, //动画类型
							      btn: ['知道了'], //按钮
							      icon: 1,    // icon
							      yes:function(){
							    	  query();
							    	 // window.location.reload();
							      }
						});
						
						 /*
						layer.msg(res.content, {
							  shift: 4,
							  icon: 1,
							  btn: ['知道了'] //按钮
							}, function(){query();});
						*/
						//window.setTimeout(query,5000);
					}else{
						layui.msg.error(res.content);
					} 
				} 
			}); 
        });
	};
    $('#import-button').bind('click',function(){
    	if(groupType==3){
			layui.msg.success('该用户分组类型不提供导入功能');
			return false;
		}
    	var param = new Object();
    	param.url = 'input_add_excel.html';
    	param.title = '导入车牌';  
    	param.width = 600;
    	param.init = addFileInit;
    	layui.common.modal(param);  
    });
	
    $('#sync-button').bind('click',function(){
    	if(groupType==2 || groupType==3){
    		layui.msg.success('该用户分组类型不用同步');
    		return ;
    	}
    	layui.msg.confirm('您确定要生成分组用户吗？</br>该操作会覆盖原分组用户,并且自动创建新用户和新车牌。</br>确定请点击【确认】否则请点击【取消】',function(){
	    	layui.common.ajax({
				url:URL_SYNC,
				data:JSON.stringify(userGroupId),
				contentType:'application/json; charset=utf-8',
				success:function(res){
					if(res.success){  
						layui.msg.success(res.content);
						window.setTimeout(query,1000);
						/*
						layer.alert("操作成功!,您现在要查看该分组下的用户吗?", {
						      closeBtn: 0,   // 是否显示关闭按钮
						      anim: 0, //动画类型
						      btn: ['看','以后再说'], //按钮
						      icon: 1,    // icon
						      yes:function(){
						    	  window.location.href="user_list.html?userGroupId="+userGroupId+"&userGroupName="+userGroupName;
						      },
						      btn2:function(){
						    	  
						      }
						});
						*/
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