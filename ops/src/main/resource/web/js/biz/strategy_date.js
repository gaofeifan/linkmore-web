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
layui.use(['layer','msg','form', 'common','validate','datatable','laydate','element'], function() {
	var validate = layui.validate; 
	var layer = layui.layer;  
	var $ = layui.jquery;
	var element = layui.element;
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
		id:'strategy-date-table',
		url:'/admin/biz/strategy/date/list', 
		key:'id',
		columns:[
			{ sTitle: '编号',   mData: 'id'},
			{ sTitle: '策略名称',   mData: 'name'},
			{ sTitle: '策略简介',   mData: 'detail'},
			{ sTitle: '分期类型',   mData: 'datetype',
	          	mRender:function(mData,type,full){
	          		var html = '<label style="color:gray">未知</label>';
	          		if(mData==1){
	          			html = '<label style="color:blue">按日期</label>'; 
	          		}else if(mData==2){
	          			html = '<label style="color:blue">按周</label>'; 
	          		}
	          		return html;
	          	}
			} ,

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
				url:'/admin/biz/strategy/date/delete',
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
				url:'/admin/biz/strategy/date/status/open',
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
				url:'/admin/biz/strategy/date/status/close',
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
	var getTimeDiff = function (beginTime,endTime){
		var myDate = new Date().toLocaleDateString();
		var myBeginTime1=new Date((myDate +" " + beginTime).replace(/-/g, "/"));
		var myEndTime1=new Date((myDate +" " + endTime).replace(/-/g, "/"));
		return  (myEndTime1.getTime() - myBeginTime1.getTime());
	}
	
	var getDateDiff= function (startDate,endDate){  
	    var startTime = new Date(Date.parse(startDate.replace(/-/g,   "/"))).getTime();     
	    var endTime = new Date(Date.parse(endDate.replace(/-/g,   "/"))).getTime();     
	    var dates = (endTime-startTime)/(1000*60*60*24);     
	    return  dates;
	}

    var checkDateGroup = function(){
    	var len=$('.beginDate').length;
		for(var i=0;i<len;i++){
			if( $(".beginDate").eq(i).val().trim().length<=0 || $(".endDate").eq(i).val().trim().length<=0 ){
				layui.msg.error("开使日或结束日不能为空");
				return false;
			}
			if ( getDateDiff($(".beginDate").eq(i).val(),$(".endDate").eq(i).val())<0 ){
				layui.msg.error("开使日不能大于结束日");
				return false;
			}
			for(var j=0;j<len;j++){
				if(i!=j){
					if(  (getDateDiff($(".beginDate").eq(i).val(),$(".beginDate").eq(j).val())<=0 
							&& getDateDiff($(".beginDate").eq(i).val(),$(".endDate").eq(j).val() )>=0 )
						|| 	(getDateDiff($(".endDate").eq(i).val(),$(".beginDate").eq(j).val())<=0 
						   && getDateDiff($(".endDate").eq(i).val(),$(".endDate").eq(j).val())>=0 )
					){
						layui.msg.error("日期段出现交叉！请重新设置");
						return false;
					}
				}
			}
		}
		return true;
    }

    var checkWeekGroup = function(){
    	if( $(".name").val().trim().length<=0){
			layui.msg.error("策略名称不能为空");
			return false;
		}
    	if( $(".name").val().trim().length>10){
			layui.msg.error("策略名称长度[1-10]");
			return false;
		}
    	if( $(".startDate").val().trim().length<=0 || $(".stopDate").val().trim().length<=0 ){
			layui.msg.error("开使日期或结束日期不能为空");
			return false;
		}
    	
    	var len=$('.beginWeek').length;
    	for(var i=0;i<len;i++){
    		if( $(".beginWeek").eq(i).val().trim().length<=0 || $(".endWeek").eq(i).val().trim().length<=0 ){
				layui.msg.error("开使周或结束周不能为空");
				return false;
			}
    		if( $(".beginWeek").eq(i).val().trim() > $(".endWeek").eq(i).val().trim() ){
				layui.msg.error("开使周不能大于结束周");
				return false;
			}
    		for(var j=0;j<len;j++){
				if(i!=j){
					if( ($(".beginWeek").eq(i).val() >= $(".beginWeek").eq(j).val() 
							&& $(".beginWeek").eq(i).val() <= $(".endWeek").eq(j).val() )
						|| 	($(".endWeek").eq(i).val() >= $(".beginWeek").eq(j).val() 
						   && $(".endWeek").eq(i).val()<=$(".endWeek").eq(j).val() )
					){
						layui.msg.error("周出现交叉！请重新设置");
						return false;
					}
				}
    		}
    	}
    	return true;
    }
    
    
	var addInit = function(validate,lindex){   
		/*
		form.render('select'); 
		form.render('checkbox'); 
		*/
		element.tabChange('demo', 'date');
		form.render();
		renderDate();

		$('#strategy-date-cancel-button,#strategy-week-cancel-button').bind('click',function(){
			layui.msg.confirm('您确定要放弃这个车位分期策略吗？放弃后您填写的信息将不会被保存。确定放弃请点击【确认】，不放弃请点击【取消】',function(){
				layui.msg.close(lindex);
				layui.layer.close(lindex);
			}, function(index){

	        }, function(){
	        	
	        });
		}); 
		
		$("#add-date").unbind("click").bind("click",function(){
			var html = '<div class="date_line_div" style="display: inline;">'+$("#date_div").find("#date_line_div").eq(0).html();
			html += '<a class="layui-form-label delete_item"><i class="layui-icon" style="font-size: 20px; color: #1E9FFF;">&#xe640;</i> </a></div>';
			$("#date_div").append(html);
			form.render();
			renderDate();
			
			$(".delete_item").click(function(){
				$(this).parent().remove();
			});
		});
		
		$("#add-week").unbind("click").bind("click",function(){
			var len=$('.week_line_div').length;
			if (len>=6){
				layui.msg.error("您最多只能添加7个周期");
				return false;
			}
			var html = '<div class="week_line_div" style="display: inline;">'+$("#week_div").find("#week_line_div").eq(0).html();
			html += '<a class="layui-form-label delete_week"><i class="layui-icon" style="font-size: 20px; color: #1E9FFF;">&#xe640;</i> </a></div>';
			$("#week_div").append(html);
			form.render();
			
			$(".delete_week").click(function(){
				$(this).parent().remove();
			});
		});
		
		$('#strategy-date-add-button').bind('click',function(){
        	if(validate.valid()){
        		if (!checkDateGroup()){
        			return false;
        		}
        		var len=$('.beginDate').length;
        		var dategroup = new Array();
        		for(var i=0;i<len;i++){
        			var obj = new Object();
        			obj.beginDate=$(".beginDate").eq(i).val();
        			obj.endDate=$(".endDate").eq(i).val();
        			dategroup.push(obj);
        		}
        		$('input[name="dateGroup"]').val(JSON.stringify(dategroup))
        		layui.common.ajax({
        			url:'/admin/biz/strategy/date/save',
        			data:$('#add-form-date').serialize(),
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

		$('#strategy-week-add-button').bind('click',function(){
        	if(validate.valid()){
        		if(!checkWeekGroup()){
        			return false;
        		}
        		var len=$('.beginWeek').length;
        		var dategroup = new Array();
        		for(var i=0;i<len;i++){
        			var obj = new Object();
        			obj.beginDate=$(".beginWeek").eq(i).val();
        			obj.endDate=$(".endWeek").eq(i).val();
        			dategroup.push(obj);
        		}

        		$('input[name="dateGroup"]').val(JSON.stringify(dategroup))
        		layui.common.ajax({
        			url:'/admin/biz/strategy/date/save',
        			data:$('#add-form-week').serialize(),
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
    	valid.id = "add-form-date";
    	valid.rules = {
    		name:{
    			rangelength:[1,10] ,
    			required: true
    		}, detail:{
    			rangelength:[1,30] ,
    			required: false
    		}
    	};
    	valid.messages = {
    		name:{
    			rangelength:'名称长度应在[1,10]内', 
    			required: '请填写名称',
    			remote:'名称已经存在'
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
    
    var uuid=function () {
    	  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    	    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    	    return v.toString(16);
    	  });
    }

    var renderDate=function(){
		$('.beginDate').each(function(){
			$(this).attr("lay-key",uuid());
			laydate.render({ 
				elem: this ,type: 'date'
			});
		});
		
		$('.endDate').each(function(){
			$(this).attr("lay-key",uuid());
			laydate.render({ 
				elem: this ,type: 'date'
			});
		});

		laydate.render({
			elem: '.startDate',type: 'date'
		});	  
		laydate.render({
			elem: '.stopDate',type: 'date'
		});
    }
 
    var editInit = function(validate,lindex){ 
    	
		form.render();
		renderDate();
		var list = datatable.selected();
		layui.common.ajax({
			url:'/admin/biz/strategy/date/get',
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
			if(list[0].datetype==1){
				//按日期
				layui.common.set({
					id:'edit-form-date',
					data:res
				});
				var len=res.strategyDateDetail.length;
				for(var i=1;i<len;i++){
					var html = '<div class="date_line_div" style="display: inline;">'+$("#date_div").find("#date_line_div").eq(0).html();
					html += '<a class="layui-form-label delete_item_edit"><i class="layui-icon" style="font-size: 20px; color: #1E9FFF;">&#xe640;</i> </a></div>';
					$("#date_div").append(html);
				}
				for(var i=0;i<len;i++){
					$(".beginDate").eq(i).val(res.strategyDateDetail[i].beginDate)
					$(".endDate").eq(i).val(res.strategyDateDetail[i].endDate)
				}
				renderDate();
				$(".delete_item_edit").click(function(){
					$(this).parent().remove();
				});
				form.render();
				element.tabChange('demo', 'date');
				element.tabDelete('demo', 'week');
			}else{
				//按周
				layui.common.set({
					id:'edit-form-week',
					data:res
				});
				$('.startDate').val(new Date(res.startDate).format("yyyy-MM-dd"));
				$('.stopDate').val(new Date(res.stopDate).format("yyyy-MM-dd"));
				var len=res.strategyDateDetail.length;
				for(var i=1;i<len;i++){
					var html = '<div class="week_line_div" style="display: inline;">'+$("#week_div").find("#week_line_div").eq(0).html();
					html += '<a class="layui-form-label delete_week_edit"><i class="layui-icon" style="font-size: 20px; color: #1E9FFF;">&#xe640;</i> </a></div>';
					$("#week_div").append(html);
				}
				for(var i=0;i<len;i++){
					$(".beginWeek").eq(i).val(res.strategyDateDetail[i].beginDate)
					$(".endWeek").eq(i).val(res.strategyDateDetail[i].endDate)
				}
				$(".delete_week_edit").click(function(){
					$(this).parent().remove();
				});
				form.render();
				element.tabChange('demo', 'week');
				element.tabDelete('demo', 'date');
			}
		}		
		
		$("#add-date-edit").unbind("click").bind("click",function(){
			var html = '<div class="date_line_div" style="display: inline;">'+$("#date_div").find("#date_line_div").eq(0).html();
			html += '<a class="layui-form-label delete_item_edit"><i class="layui-icon" style="font-size: 20px; color: #1E9FFF;">&#xe640;</i> </a></div>';
			$("#date_div").append(html);
			//form.render();
			renderDate();
			$(".delete_item_edit").click(function(){
				$(this).parent().remove();
			});
		});
		
		$("#add-week-edit").unbind("click").bind("click",function(){
			var len=$('.week_line_div').length;
			if (len>=6){
				layui.msg.error("您最多只能添加7个周期");
				return false;
			}
			var html = '<div class="week_line_div" style="display: inline;">'+$("#week_div").find("#week_line_div").eq(0).html();
			html += '<a class="layui-form-label delete_week_edit"><i class="layui-icon" style="font-size: 20px; color: #1E9FFF;">&#xe640;</i> </a></div>';
			$("#week_div").append(html);
			form.render();
			$(".delete_week_edit").click(function(){
				$(this).parent().remove();
			});
		});
		
		
		$('#strategy-date-edit-cancel-button,#strategy-week-edit-cancel-button').bind('click',function(){
			layui.msg.confirm('您确定要放弃这个车位分期策略吗？放弃后您填写的信息将不会被保存。确定放弃请点击【确认】，不放弃请点击【取消】',function(){
				layui.msg.close(lindex);
				layui.layer.close(lindex);
			}, function(index){
	            layer.close(index);
	        }, function(){
	        	
	        });
		});
		
		$('#strategy-date-edit-save-button').bind('click',function(){
        	if(validate.valid()){
        		if (!checkDateGroup()){
        			return false;
        		}
        		var len=$('.beginDate').length;
        		var dategroup = new Array();
        		for(var i=0;i<len;i++){
        			var obj = new Object();
        			obj.beginDate=$(".beginDate").eq(i).val();
        			obj.endDate=$(".endDate").eq(i).val();
        			dategroup.push(obj);
        		}
        		$('input[name="dateGroup"]').val(JSON.stringify(dategroup))
        		
        		layui.common.ajax({
        			url:'/admin/biz/strategy/date/update',
        			data:$('#edit-form-date').serialize(),
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
		
		$('#strategy-week-edit-save-button').bind('click',function(){
        	if(validate.valid()){
        		if(!checkWeekGroup()){
        			return false;
        		}
        		var len=$('.beginWeek').length;
        		var dategroup = new Array();
        		for(var i=0;i<len;i++){
        			var obj = new Object();
        			obj.beginDate=$(".beginWeek").eq(i).val();
        			obj.endDate=$(".endWeek").eq(i).val();
        			dategroup.push(obj);
        		}
        		$('input[name="dateGroup"]').val(JSON.stringify(dategroup))
        		layui.common.ajax({
        			url:'/admin/biz/strategy/date/update',
        			data:$('#edit-form-week').serialize(),
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
    	if(list[0].datetype==1){
	    	valid.id = "edit-form-date";
	    	valid.rules = {
	        		name:{
	        			rangelength:[1,10] ,
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
	        		} ,detail:{
	        			rangelength:'简介长度应在[1,30]内', 
	        			required: '请填写名称',
	        		} 
	        };
    	}else{
    		valid.id = "edit-form-week";
	    	valid.rules = {
	        		name:{
	        			rangelength:[1,10] ,
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
	        		} ,detail:{
	        			rangelength:'简介长度应在[1,30]内', 
	        			required: '请填写名称',
	        		} 
	        };
    	}
        	
    	param.validate = valid;
    	param.width = 800;
    	param.init = editInit;
    	layui.common.modal(param);  
    });
    
    
    
});
