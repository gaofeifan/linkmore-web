layui.config({
	base: 'js/lib/'
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
layui.use(['layer','msg','form', 'common','datatable','laydate'], function() {
	var session = window.sessionStorage;
	var layer = layui.layer;  
	var $ = layui.jquery; 
	var form = layui.form;
	
	var laydate = layui.laydate; 

	laydate.render({
	    elem: '#search-startTime',
	    min: '2015-06-16 23:59:59',
	    max: new Date().format('yyyy-MM-dd'),
		istoday: false
	});
	laydate.render({
	    elem: '#search-endTime',
	    min: '2015-06-16 23:59:59',
	    max: new Date().format('yyyy-MM-dd'),
		istoday: false
	}); 
	  	
	var addServerParams = function(data){  
		var filters = new Array();
		var filter = null; 
		var searchStatus = $('#search-status').val();
		if(searchStatus!='-1'){
			filter = new Object();
			filter.property = 'status';
			filter.value = searchStatus;
			filters.push(filter);
		}
		var searchName = $('#search-name').val();
		if(searchName!=''){
			filter = new Object();
			filter.property = 'name';
			filter.value = '%'+searchName +'%';
			filters.push(filter);
		} 
		var searchStartTime = $('#search-startTime').val();
		if(searchStartTime!=''){
			filter = new Object();
			filter.property = 'startTime';
			filter.value = searchStartTime;
			filters.push(filter);
		}
		var searchEndTime = $('#search-endTime').val();
		if(searchEndTime!=''){
			filter = new Object();
			filter.property = 'endTime';
			filter.value = searchEndTime;
			filters.push(filter);
		}
		if(filters.length>0){
			data.push({name:'filterJson',value:JSON.stringify({filters:filters})});
		}
	};
	var datatable = layui.datatable.init({
		id:'application-group-table',
		url:'/admin/biz/application_group/list', 
		key:'id',
		columns:[ 
			{ sTitle: '应用名称',   mData: 'name'},
			{ sTitle: '限制条件简介',   
				mData: 'controlAttribute',
				mRender:function(mData,type,full){
	          		var html = '';
	          		switch(mData){
	          			case 1:html += '<label>禁止用户约车,显示车位紧张</label>';break;
	          		}
	          		return html;
	          	}
			},
			{ sTitle: '用户组',   mData: 'userGroup'},
			{ sTitle: '应用状态',   mData: 'applicationStatus'},
			{ sTitle: '创建人',   mData: 'operator'},
			{
				sTitle: '创建时间',
	          	mData: 'createTime' ,
	          	bSortable: true,
	          	mRender:function(mData,type,full){
	          		 return new Date(mData).format('yyyy-MM-dd hh:mm:ss');
	          	}
			},
			{
				sTitle: '启用/关闭',
	          	mData: 'status' ,
	          	bSortable: true,
	          	mRender:function(mData,type,full){
	          		var html = '';
	          		switch(mData){
	          			case 0:html += '<label style="color:red;">关闭</label>';break;
		          		case 1:html += '<label style="color:green;">启用</label>';break;
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
	};
	$('.search_btn').bind('click',function(){
		query();
	});
	var dataf = function dateformat(date) {
        return date ? (new Date(date)).format("yyyy-MM-dd") : "";
    }
	
	/**
	 * 启用
	 */
	$('#start-button').bind('click',function(){
		var list = datatable.selected(); 
		if(list.length<1){
			layui.msg.error('请至少选择一条记录');
			return false;
		}
		var ids = new Array();
		$.each(list,function(index,page){
			ids.push(page.id);
		});
		layui.msg.confirm('您确定要启用',function(){
			layui.common.ajax({
				url:'/admin/biz/application_group/start',
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
	/**
	 * 禁用
	 */
	$('#down-button').bind('click',function(){
		var list = datatable.selected(); 
		if(list.length<1){
			layui.msg.error('请至少选择一条记录');
			return false;
		}
		var ids = new Array();
		$.each(list,function(index,page){
			ids.push(page.id);
		});
		layui.msg.confirm('您确定要禁用',function(){
			layui.common.ajax({
				url:'/admin/biz/application_group/down',
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
	 * 添加分组
	 */
	// 用户组
	var userGroupHtml = '';
	function userGroup(){
		layui.common.ajax({
			url:'/admin/biz/application_group/user_group_select',
			async:false,
			success:function(list){
				userGroupHtml = '<option value="">请选择</option>';
				$.each(list,function(index,group){
					userGroupHtml += '<option value="'+group.id+'">';
					userGroupHtml += group.name;
					userGroupHtml += '</option>';
				});
				form.render('select');
			},error:function(){
			}
		});
	}
	// 停车组
	var preGroupHtml = '';
	function preGroup(){
		layui.common.ajax({
			url:'/admin/biz/application_group/pre_group_select',
			async:false,
			success:function(list){
				preGroupHtml = '<option value="">请选择</option>';
				$.each(list,function(index,group){
					preGroupHtml += '<option value="'+group.id+'">';
					preGroupHtml += group.name;
					preGroupHtml += '</option>';
				});
				form.render('select');
			},error:function(){
			}
		});
	}
	// 城市
	var cityHtml = '';
	function cityList(){
		layui.common.ajax({
			url:'/admin/biz/application_group/city_list',
			async:false,
			success:function(list){
				cityHtml = '<option value="-1">请选择</option>';
				$.each(list,function(index,city){
					cityHtml += '<option value="'+city.id+'">';
					cityHtml += city.cityName;
					cityHtml += '</option>';
				});
				form.render('select');
			},error:function(){
			}
		});
	}
	// 车区
	var preHtml = '';
	function preList(cityId){
		layui.common.ajax({
			url:'/admin/biz/application_group/pre_list',
			data:JSON.stringify(cityId),
			contentType:'application/json; charset=utf-8',
			async:false,
			success:function(list){
				preHtml = '<option value="">请选择</option>';
				$.each(list,function(index,pre){
					preHtml += '<option value="'+pre.id+'">';
					preHtml += pre.name;
					preHtml += '</option>';
				});
				form.render('select');
			},error:function(){
			}
		});
	}
	
	var groupInit = function(validate,lindex){
		form.render('select');
		userGroup();
		$('#application-add-form select[name=userGroupId]').html(userGroupHtml);
		form.render('select');
		$("#add_cycle_time").unbind("click").bind("click",function(){
			var html = '<div class="cycle-time" style="display: inline;">'+$("#time").find(".cycle-time").eq(0).html();
			html += '<div class="layui-form-label"><a style="javascript:;" class="delete_cycle">删除时间段<a></div></div>';
			$("#time").append(html);
			form.render('select');
			$(".delete_cycle").click(function(){
				$(this).parent().parent().remove();
			});
		});
		form.on('select(area)', function(data) {
			$("#pre_group").css("display","none");
			$("#pre").css("display","none");
			var area = data.value;
			if(area==1){
				$("#pre_group").css("display","none");
				$("#pre").css("display","none");
			}else if(area==2){
				preGroup();
				$('#application-add-form select[name=preGroupId]').html(preGroupHtml);
				$("#pre_group").css("display","inline");
			}else if(area==3){
				cityList();
				$('#application-add-form select[name=cityId]').html(cityHtml);
				$("#pre").css("display","inline");
			}
			form.render('select');
		});
		form.on('select(city)', function(data) {
			var cityId = data.value;
			preList(cityId);
			$('#application-add-form select[name=preId]').html(preHtml);
			form.render('select');
		});
		form.on('select(cycle_time)', function(data) {
			$(".cycle-time").css("display","none");
			var cycle = data.value;
			if(cycle==1){
				$(".cycle-time").css("display","none");
			}else if(cycle==2){
				$(".cycle-time").css("display","inline");
				
			}
			form.render('select');
		});
		$('#application-cancel-button').bind('click',function(){
			layui.msg.confirm('取消后，你填写的信息将不会保存，请谨慎选择。',function(){
				layui.layer.close(lindex);
			});
		});
		$('#application-add-button').bind('click',function(){
        	if(validate.valid()){
        		var len = $(".start").length;
        		for(var i=0;i<len;i++){
        			var start = $(".start").eq(i).val();
        			var end = $(".end").eq(i).val();
        			if(start > end){
        				layui.msg.error("开始周期不能大于结束周期");
        				return false;
        			}
        		}
        		
        		var timelen = $(".startTime").length;
        		for(var i=0;i<timelen;i++){
        			var startTime = $(".startTime").eq(i).val();
        			startTime = new Date("2018-01-01 "+startTime).getTime();
        			var endTime = $(".endTime").eq(i).val();
        			endTime = new Date("2018-01-01 "+endTime).getTime();
        			if(startTime > endTime){
        				layui.msg.error("开始时间不能大于结束时间");
        				return false;
        			}
        		}
        		
        		if($("#userGroupId").val()==""){
        			layui.msg.error("请选择用户组");
        			return false;
        		}
        		
        		var param = new Object();
        		param.name = $("#name").val();
        		param.userGroupId = $("#userGroupId").val();
        		param.controlAttribute = $("#controlAttribute").val();
        		param.controlArea = $("#controlArea").val();
        		param.preGroupId = $("#preGroupId").val();
        		param.preId = $("#preId").val();
        		param.cycleTime = $("#cycleTime").val();
        		if(param.cycleTime == 2){
        			var timeSlot = new Array();
        			var length = $("#time").find(".cycle-time");
        			for(var i = 0;i < length.length;i++){
        				var slot = new Object();
        				slot.start = $(length).eq(i).find(".start").val();
        				slot.end = $(length).eq(i).find(".end").val();
        				slot.startTime = $(length).eq(i).find(".startTime").val();
        				slot.endTime = $(length).eq(i).find(".endTime").val();
        				timeSlot.push(slot);
        			}
        			param.timeSlot = JSON.stringify(timeSlot);
        		}
        		param.probability = $("#probability").val();
        		
        		layui.common.ajax({
        			url:'/admin/biz/application_group/add',
        			data:param,
        			async:false,
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
    	param.title = '添加分组信息'; 
    	var valid = new Object();
    	valid.id = "application-add-form";
    	valid.rules = {
    		name:{
    			rangelength:[1,32] ,
    			required: true,
    			remote:{
    				url:"/admin/biz/application_group/check",  
    				data:{
    					property:"name",
    					value:function(){return $('#application-add-form input[name=name]').val();},
    					id:function(){return new Date().getTime();}
    				}
    			}
    		},userGroupId:{
		 		required: true
		 	},controlAttribute:{
		 		required: true
		 	},controlArea:{
		 		required: true
		 	},cycleTime:{
		 		required: true
		 	},start:{
		 		required: true
		 	},end:{
		 		required: true
		 	},startTime:{
		 		required: true
		 	},endTime:{
		 		required: true
		 	}
    	};
    	valid.messages = {
    		name:{
    			rangelength:'名称长度应在[1,32]内', 
    			required: '请填写名称',
    			remote:'名称已经存在'
    		},userGroupId:{
    			required: '请选择用户组'
    		},controlAttribute:{
    			required: '请选择控制属性'
    		},controlArea:{
    			required: '请选择受控区域'
    		},cycleTime:{
    			required: '请选择时间周期'
    		},start:{
    			required: '请选择开始日期'
		 	},end:{
		 		required: '请选择结束日期'
		 	},startTime:{
		 		required: '请选择开始时间段'
		 	},endTime:{
		 		required: '请选择结束时间段'
		 	}
    	}; 
    	param.validate = valid;
    	param.width = 700;
    	param.init = groupInit;
    	layui.common.modal(param);  
    });
});