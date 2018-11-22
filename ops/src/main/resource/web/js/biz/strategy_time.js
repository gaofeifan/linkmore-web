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

layui.use(['layer','msg','form', 'common','validate','datatable','laydate'], function() {
	var validate = layui.validate; 
	var layer = layui.layer;
	var $ = layui.jquery; 
	var form = layui.form;
	var laydate = layui.laydate;
	
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
	var datatable = layui.datatable.init({
		id:'strategy-time-table',
		url:'/admin/biz/strategy/time/list', 
		key:'id',
		columns:[
			{ sTitle: '编号',   mData: 'id'},
			{ sTitle: '策略名称',   mData: 'name'},
			{ sTitle: '策略简介',   mData: 'detail'},
			{ sTitle: '操作人',   mData: 'updateUserName'} ,
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
		$.each(list,function(index,dg){
			ids.push(dg.id);
		});
		layui.msg.confirm('您确定要删除',function(){
			layui.common.ajax({
				url:'/admin/biz/strategy/time/delete',
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
				url:'/admin/biz/strategy/time/status/open',
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
				url:'/admin/biz/strategy/time/status/close',
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
	 * 计算时间间隔 参数格式: hh:mm:ss
	 */
	var myTimeDiff = function (beginTime,endTime){
		var myDate = new Date().toLocaleDateString();
		var myBeginTime1=new Date((myDate +" " + beginTime).replace(/-/g, "/"));
		var myEndTime1=new Date((myDate +" " + endTime).replace(/-/g, "/"));
		return  (myEndTime1.getTime() - myBeginTime1.getTime());
	}
	
	var checkTimeGroup =function(){
	   	var len=$('.beginTime').length;
		for(var i=0;i<len;i++){
			if( $(".beginTime").eq(i).val().trim().length<=0 || $(".endTime").eq(i).val().trim().length<=0 ){
				layui.msg.error("开使时刻或结束时刻不能为空");
				return false;
			}
			if ( myTimeDiff($(".beginTime").eq(i).val(),$(".endTime").eq(i).val())<0 ){
				layui.msg.error("开使时刻不能大于结束时刻");
				return false;
			}
			for(var j=0;j<len;j++){
				if(i!=j){
					if(  (myTimeDiff($(".beginTime").eq(i).val(),$(".beginTime").eq(j).val())<=0 
							&& myTimeDiff($(".beginTime").eq(i).val(),$(".endTime").eq(j).val() )>=0 )
						|| 	(myTimeDiff($(".endTime").eq(i).val(),$(".beginTime").eq(j).val())<=0 
						   && myTimeDiff($(".endTime").eq(i).val(),$(".endTime").eq(j).val())>=0 )
					){
						layui.msg.error("时刻出现交叉！请重新设置");
						return false;
					}
				}
			}
		}
		return true;
	}
	
    var uuid=function () {
  	  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
  	    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
  	    return v.toString(16);
  	  });
    }
    
	var renderTime=function(){
		$('.beginTime').each(function(){
			$(this).attr("lay-key",uuid());
			laydate.render({ 
				elem: this ,type: 'time'
			});
		});
		
		$('.endTime').each(function(){
			$(this).attr("lay-key",uuid());
			laydate.render({ 
				elem: this ,type: 'time'
			});
		});
	}
	
	
	
	var addInit = function(validate,lindex){
		/*
		form.render('select'); 
		form.render('checkbox'); 
		*/
		renderTime();
		$('#strategy-time-cancel-button').bind('click',function(){
			layui.msg.confirm('您确定要放弃这个车位分时策略吗？放弃后您填写的信息将不会被保存。确定放弃请点击【确认】，不放弃请点击【取消】',function(){
				layui.msg.close(lindex);
				layui.layer.close(lindex);
			}, function(index){

	        }, function(){
	        	
	        });
		});
		$("#add-time").unbind("click").bind("click",function(){
			var html = '<div class="time_line_div" style="display: inline;">'+$("#time_div").find("#time_line_div").eq(0).html();
			html += '<a class="layui-form-label delete_item"><i class="layui-icon" style="font-size: 20px; color: #1E9FFF;">&#xe640;</i> </a></div>';
			$("#time_div").append(html);
			form.render();
			renderTime();
			
			$(".delete_item").click(function(){
				$(this).parent().remove();
			});
		});
		$('#strategy-time-add-button').bind('click',function(){
        	if(validate.valid()){
        		if (!checkTimeGroup()){
        			return false;
        		}
        		var len=$('.beginTime').length;
        		var timegroup = new Array();
        		for(var i=0;i<len;i++){
        			var obj = new Object();
        			obj.beginTime=$(".beginTime").eq(i).val();
        			obj.endTime=$(".endTime").eq(i).val();
        			timegroup.push(obj);
        		}
        		$('input[name="timeGroup"]').val(JSON.stringify(timegroup))
        		
        		layui.common.ajax({
        			url:'/admin/biz/strategy/time/save',
        			data:$('#add-form').serialize(),
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
    	valid.id = "add-form";
    	valid.rules = {
    		name:{
    			rangelength:[1,10] ,
    			required: true
    		},beginTime:{
    			custom: function (value, elemen){
					var a = /^(20|21|22|23|[0-1]\d):[0-5]\d:[0-5]\d$/;
					return a.test(value.value);
				},
    			required: true
    		},endTime:{ 
    			custom: function (value, elemen){
					var a = /^(20|21|22|23|[0-1]\d):[0-5]\d:[0-5]\d$/;
					return a.test(value.value);
				},
    			required: true
    		
    		},detail:{
    			rangelength:[1,30] ,
    			required: false
    		}
    	};
    	valid.messages = {
    		name:{
    			rangelength:'名称长度应在[1,10]内', 
    			required: '请填写名称',
    			remote:'名称已经存在'
    		},beginTime:{ 
    			custom:'正确的开始时间如[00:00:00]',
    			required: '请填写开始时间如[00:00:00]'
    		},endTime:{ 
    			custom:'正确的结束时间如[19:00:00]',
    			required: '请填写结束时间如[19:00:00]'
    		} ,detail:{
    			rangelength:'简介长度应在[1,30]内', 
    			required: '请填写名称',
    		} 
    	}; 
    	param.validate = valid;
    	param.width = 800;
    	param.init = addInit;
    	layui.common.modal(param);
    });

    var viewInit = function(validate,lindex){
    	var list = datatable.selected();
    	layui.common.ajax({
			url:'/admin/biz/strategy/time/get',
			contentType:'application/json; charset=utf-8',
			data:JSON.stringify(list[0].id),
			success:function(res){
				if(res!=null){
					callback(res);
				}else{
					layui.msg.error("没有数据");
				}
			},error:function(){
				layui.msg.error("网络异常");
			}
		});
		var callback=function(res){
			layui.common.set({
				id:'edit-form',
				data:res
			});
			
			$('.updateTime').val(new Date(res.updateTime).format("yyyy-MM-dd hh:mm:ss"));
			$('.createTime').val(new Date(res.createTime).format("yyyy-MM-dd hh:mm:ss"));
			$('.status').val(res.status==1?"关闭":"开启");
			
			
			var len=res.strategyTimeDetail.length;
			for(var i=1;i<len;i++){
				var html = '<div class="time_line_div" style="display: inline;">'+$("#time_div").find("#time_line_div").eq(0).html();
				//html += '<a class="layui-form-label delete_item_edit"><i class="layui-icon" style="font-size: 20px; color: #1E9FFF;">&#xe640;</i> </a></div>';
				$("#time_div").append(html);
			}
			for(var i=0;i<len;i++){
				$(".beginTime").eq(i).val(res.strategyTimeDetail[i].beginTime)
				$(".endTime").eq(i).val(res.strategyTimeDetail[i].endTime)
			}
			//renderTime();
			
			//form.render();
		}
		
		$('#strategy-time-close-button').bind('click',function(){
			layui.msg.close(lindex);
			layui.layer.close(lindex);
		});
		
    }
    
    $('#view-button').bind('click',function(){
    	var list = datatable.selected(); 
		if(list.length!=1){
			layui.msg.error('请选择一条记录');
			return false;
		}
    	var param = new Object();
    	param.url = 'view.html';
    	param.title = '查看信息'; 
    	var valid = new Object();
    	valid.id = "edit-form";
    	
    	param.width = 800;
    	param.init = viewInit;
    	layui.common.modal(param);  
    });

    
    var editInit = function(validate,lindex){
		var list = datatable.selected(); 
		
		layui.common.ajax({
			url:'/admin/biz/strategy/time/get',
			contentType:'application/json; charset=utf-8',
			//data:JSON.stringify(list[0].id),
			data:JSON.stringify(list[0].id),
			success:function(res){
				if(res!=null){
					callback(res);
				}else{
					layui.msg.error("没有数据");
				}
			},error:function(){
				layui.msg.error("网络异常");
			}
		});
		var callback=function(res){
			layui.common.set({
				id:'edit-form',
				data:res
			});
			var len=res.strategyTimeDetail.length;
			for(var i=1;i<len;i++){
				var html = '<div class="time_line_div" style="display: inline;">'+$("#time_div").find("#time_line_div").eq(0).html();
				html += '<a class="layui-form-label delete_item_edit"><i class="layui-icon" style="font-size: 20px; color: #1E9FFF;">&#xe640;</i> </a></div>';
				$("#time_div").append(html);
			}
			for(var i=0;i<len;i++){
				$(".beginTime").eq(i).val(res.strategyTimeDetail[i].beginTime)
				$(".endTime").eq(i).val(res.strategyTimeDetail[i].endTime)
			}
			renderTime();
			$(".delete_item_edit").click(function(){
				$(this).parent().remove();
			});
			form.render();
		}
		
		//form.render('select'); 
		//form.render('checkbox'); 
		
		$("#add-time-edit").unbind("click").bind("click",function(){
			var html = '<div class="time_line_div" style="display: inline;">'+$("#time_div").find("#time_line_div").eq(0).html();
			html += '<a class="layui-form-label delete_item_edit"><i class="layui-icon" style="font-size: 20px; color: #1E9FFF;">&#xe640;</i> </a></div>';
			$("#time_div").append(html);
			//form.render();
			renderTime();
			$(".delete_item_edit").click(function(){
				$(this).parent().remove();
			});
		});
		
		$('#strategy-time-cancel-button').bind('click',function(){
			layui.msg.confirm('您确定要放弃这个车位分时策略吗？放弃后您填写的信息将不会被保存。确定放弃请点击【确认】，不放弃请点击【取消】',function(){
				layui.msg.close(lindex);
				layui.layer.close(lindex);
			}, function(index){
	            layer.close(index);
	        }, function(){
	        	
	        });
		});
		
		$('#strategy-time-update-button').bind('click',function(){
        	if(validate.valid()){
        		if (!checkTimeGroup()){
        			return false;
        		}
        		var len=$('.beginTime').length;
        		var timegroup = new Array();
        		for(var i=0;i<len;i++){
        			var obj = new Object();
        			obj.beginTime=$(".beginTime").eq(i).val();
        			obj.endTime=$(".endTime").eq(i).val();
        			timegroup.push(obj);
        		}
        		$('input[name="timeGroup"]').val(JSON.stringify(timegroup))
        		
        		layui.common.ajax({
        			url:'/admin/biz/strategy/time/update',
        			data:$('#edit-form').serialize(),
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
    	valid.id = "edit-form";
    	valid.rules = {
        		name:{
        			rangelength:[1,10] ,
        			required: true
        		},beginTime:{
        			custom: function (value, elemen){
    					var a = /^(20|21|22|23|[0-1]\d):[0-5]\d:[0-5]\d$/;
    					return a.test(value.value);
    				},
        			required: true
        		},endTime:{ 
        			custom: function (value, elemen){
    					var a = /^(20|21|22|23|[0-1]\d):[0-5]\d:[0-5]\d$/;
    					return a.test(value.value);
    				},
        			required: true
        		
        		},detail:{
        			rangelength:[1,30] ,
        			required: false
        		}
        	};
        	valid.messages = {
        		name:{
        			rangelength:'名称长度应在[1,10]内', 
        			required: '请填写名称',
        			remote:'名称已经存在'
        		},beginTime:{ 
        			custom:'正确的开始时间如[00:00:00]',
        			required: '请填写开始时间如[00:00:00]'
        		},endTime:{ 
        			custom:'正确的结束时间如[19:00:00]',
        			required: '请填写结束时间如[19:00:00]'
        		} ,detail:{
        			rangelength:'简介长度应在[1,30]内', 
        			required: '请填写名称',
        		} 
        	}; 
    	param.validate = valid;
    	param.width = 800;
    	param.init = editInit;
    	layui.common.modal(param);  
    });
});