
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
    form.render();
	var datatable = layui.datatable;
	var addServerParams = function(data){   
		var filters = new Array();
		var filter = null; 
		//	默认类型  企业优惠劵
		type = new Object();
		type.property = 'type';
		type.value = '1';
		filters.push(type);
		//	查询商家自定义套餐
		releaseMethod = new Object();
		releaseMethod.property = 'releaseMethod';
		releaseMethod.value = '1';
		filters.push(releaseMethod);
		if(filters.length>0){
			data.push({name:'filterJson',value:JSON.stringify({filters:filters})});
		}
	};
	
	var draw = function(settings, json){
		$(".operation-delete").unbind('click').bind('click',deleteTemplate);
		$(".operation-detail").unbind('click').bind('click',showTempInfo);
		$(".operation-edit").unbind('click').bind('click',editTemplate);
		$(".operation-first-detail").unbind('click').bind('click',hourTemplate)
	};
	
	
	
    var dataf = function dateformat(date) {
        return date ? (new Date(date)).format("yyyy-MM-dd hh:mm:ss") : "";
    }
    
	var tempId = null;
		var parkName = null;
		function hourTemplate(){
			tempId = $(this).attr('data-first-id');
			parkName = $(this).attr('data-first-name');
			location.href = 'hour_list.html?id='+tempId+'&parkName='+parkName;
		}
		
		function showTempInfo(){
			tempId = $(this).attr('data-detail-id');
			location.href = 'period_list.html?id='+tempId;
//			alert(tempId);
//	    	var param = new Object();
//	    	param.url = 'period_list.html';
//	    	param.title = '详情信息'; 
//	    	var valid = new Object();
//	    	valid.id = "temp-detail-form";
//	    	param.width = 800;
//	    	param.height = 800;
//	    	param.init = detailInit;
//	    	layui.common.modal(param);
		}
	
	
	var editInitId = null;
	function editTemplate(){
		editInitId = $(this).attr('data-update-id');
		$.each($("input[type='checkbox']"),function(index,item){
			$(this).prop("checked",false);
			$(this).parent().parent().parent().removeClass("odd active");
			$(this).parent().parent().parent().addClass("odd");
			if(item.value == editInitId){
				$(this).prop("checked",true);
				console.log($(this).parent().parent().parent().addClass("odd active"));
			}
		});
    	var param = new Object();
    	param.url = 'edit.html';
    	param.title = '编辑信息'; 
    	var valid = new Object();
    	valid.id = "temp-edit-form";
    	param.width = 800;
    	param.validate = valid;
    	param.init = editInit;
    	layui.common.modal(param);
	}
	function startTemplate() {
		var id = $(this).attr('data-start-id');
		layui.msg.confirm('您确定要启用',function(){
			layui.common.ajax({
				url:'/admin/coupon_enterprise/start',
				data:JSON.stringify(id),
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
    }
	
	function stopTemplate() {
		var id = $(this).attr('data-stop-id');
		layui.msg.confirm('您确定要暂停',function(){
			layui.common.ajax({
				url:'/admin/coupon_enterprise/stop',
				data:JSON.stringify(id),
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
    }
	
	function deleteTemplate() {
		var id = $(this).attr('data-delete-id');
		var ids = new Array();
		ids.push(id);
		layui.msg.confirm('您确定要删除',function(){
			layui.common.ajax({
				url:'/admin/biz/period/delete-charge-id',
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
    }
	
	var datatable = layui.datatable.init({
		id:'temp-table',
		url:'/admin/biz/period/list',
		key:'id',
		columns:[
			{ sTitle: 'ID',   mData: 'id',bVisible:false},
			{ sTitle: '计费编号',   mData: 'parkCode'},
			{ sTitle: '计费名称',   mData: 'parkName'},
			{
				sTitle: '是否开启首小时计费',
	          	mData: 'firstHourPeriod' ,
	          	mRender:function(mData,type,full){
	          		var html = ''; 
	          		if(full.firstHourPeriod==0){
	          			html = '<label style="color:gray;">否</label>';
	          		} else if(full.firstHourPeriod==1){
	          			html = '<label style="color:gray;">是</label>'; 
	          		} 
	          		return html;
	          	}
	        },
			{
				sTitle: '免费时长（单位：分钟）',
	          	mData: 'freeTime'
			},
			{ sTitle: '是否包含免费时长',  mData: 'containsFreeTime',
	          	mRender:function(mData,type,full){
	          		var html = ''; 
	          		if(full.containsFreeTime==0){
	          			html = '<label style="color:gray;">否</label>';
	          		} else if(full.containsFreeTime==1){
	          			html = '<label style="color:gray;">是</label>'; 
	          		} 
	          		return html;
	          	}
			},
			{
				sTitle: '封顶类型',
	          	mData: 'limitType' ,
	          	mRender:function(mData,type,full){
	          		var html = ''; 
	          		if(full.limitType==1){
	          			html = '<label style="color:gray;">时长封顶</label>';
	          		} else if(full.limitType==2){
	          			html = '<label style="color:gray;">每车次当日封顶</label>'; 
	          		} 
	          		return html;
	          	}
			},{
				sTitle: '封顶金额（单位：元）',
	          	mData: 'limitPrice',
	          	mRender:function(mData,type,full){
	          		var html = ''+full.limitPrice; 
	          		if(full.limitPrice==0 || full.limitPrice == null){
	          			html = '<label style="color:gray;">无封顶</label>';
	          		}
	          		return html;
	          	} 
			},
			{
				sTitle: '操作',
	          	mRender:function(mData,type,full){
	          		var html = '<a class="operation-edit" data-update-id="'+full.id+'" href="javascript:void(0);">修改</a>&nbsp;&nbsp;&nbsp;&nbsp;'+
	          		'<a class="operation-delete" data-delete-id="'+full.id+'" href="javascript:void(0);">删除</a>&nbsp;&nbsp;&nbsp;&nbsp;';
	          		html +='<a class="operation-detail" data-detail-id="'+full.id+'" href="javascript:void(0);">计费时段</a>&nbsp;&nbsp;&nbsp;&nbsp;';
	          		html +='<a class="operation-first-detail" data-first-name= "'+full.parkName+'" data-first-id="'+full.id+'" href="javascript:void(0);">首小时计费</a>&nbsp;&nbsp;&nbsp;&nbsp;';
	          		return html;
		          	}
			}
		],
		orderIndex:1,
		orderType:'desc',
		draw:draw,
		filter:addServerParams
	});  
	
	var query =  function(){
		datatable.reload();
		
	} ; 
	
	$('.search_btn').bind('click',function(){
		query();
	});
	
	var addInit = function(validate,lindex){
		 layui.use('form', function(){
		        var form = layui.form; 
		        form.render();
		 }); 
		var enterpriseNumberHtml = '';
		$('#temp-cancel-button').bind('click',function(){
			layui.msg.confirm('取消后，你填写的信息将不会保存，请谨慎选择。',function(){
				layui.layer.close(lindex);
			});
		});
		$('#temp-add-button').bind('click',function(){
        	if(validate.valid()){
        		layui.common.ajax({
        			url:'/admin/biz/period/save-charge',
        			data:$('#temp-add-form').serialize(),
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
	}
		var editInit = function(validate,lindex){
			 layui.use('form', function(){
			        var form = layui.form; 
			        form.render();
			 }); 
			 var list = datatable.selected();  
			 var charge = list[0];
			 console.info(charge);
			 $('#id').val(charge.id);
			 $("#parkName").val(charge.parkName);
			 $("#freeTime").val(charge.freeTime);
			 $("#containsFreeTime").val(charge.containsFreeTime);
			 $("#limitType").val(charge.limitType);
			 form.render('select');
			 $("#limitPrice").val(charge.limitPrice);
			 
			 $('#temp-edit-button').bind('click',function(){
				 if(validate.valid()){
					 console.info($('#temp-edit-form').serialize());
					 layui.common.ajax({
						 url:'/admin/biz/period/update-charge-id',
	        			data:$('#temp-edit-form').serialize(),
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
			 
			
			$('#temp-cancel-button').bind('click',function(){
				layui.msg.confirm('取消后，你填写的信息将不会保存，请谨慎选择。',function(){
					layui.layer.close(lindex);
				});
			});
		};
	/*$('#edit-button').bind('click',function(){
		var param = new Object();
		param.url = 'edit.html';
		param.title = '添加信息'; 
		var valid = new Object();
		valid.id = "temp-edit-form";
		param.validate = valid;
		param.width = 800;
		param.init = editInit;
		layui.common.modal(param);  
	});*/
	$('#add-button').bind('click',function(){
		 layui.use('form', function(){
		        var form = layui.form; 
		        form.render();
		 }); 
    	var param = new Object();
    	param.url = 'add.html';
    	param.title = '添加信息'; 
    	var valid = new Object();
    	valid.id = "temp-add-form";
    	param.validate = valid;
    	param.width = 800;
    	param.init = addInit;
    	layui.common.modal(param);  
	})
});
