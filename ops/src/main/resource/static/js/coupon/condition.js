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
	
	function getUrlParam(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
        var r = window.location.search.substr(1).match(reg);  //匹配目标参数
        if (r != null) return unescape(r[2]);
        return null; //返回参数值
    }

    var tempId = getUrlParam("tempId");
    var type = getUrlParam("type");
	var addServerParams = function(data){   
		var searchName = $('#search-name').val();
		var filters = new Array();
		var filter = null; 
		if(searchName!=''){
			filter = new Object();
			filter.property = 'name';
			filter.value = '%'+searchName +'%';
			filters.push(filter);
		}
		if(tempId!=''){
			filter = new Object();
			filter.property = 'templateId';
			filter.value = tempId ;
			filters.push(filter);
		}
		
		if(filters.length>0){
			data.push({name:'filterJson',value:JSON.stringify({filters:filters})});
		}
	};
	
	//绑定事件
	var draw = function(){
		$(".operation-detail").unbind('click').bind('click',detail); 
	};
	
	//数据回显
    var showDetail = function showData(logId,callback){
    	layui.common.ajax({
			url:'/admin/coupon_template_condition/detail',
			data:JSON.stringify(logId),
			contentType:'application/json; charset=utf-8',
			success:function(res){
				if(res!=null){
					callback(res);
				}else{
					layui.msg.error("数据不存在");
				}
			},error:function(){layui.msg.error("网络异常");}
		});
    }
    var logId = null;
    var detailInit = function(validate,lindex){
    	showDetail(logId,function(data){
    		layui.common.set({
    			id:'condition-detail-form',
    			data:data
    		});
    		$('#condition-detail-form select').attr('disabled',true);
    		$('#condition-detail-form input').attr('disabled',true);
    		
    		if(data.availableTime != 0){
    			$("#sysd").css("display","block");
    			$('#showUseTime').html(data.useTime);
    		}
        	
        	if(data.availablePrefecture==1){
        		$("#kytccz").css("display","block");
    			$('#showPreName').html(data.preName);
    		}
        	
    		form.render('select');
    		form.render('checkbox');
    	});
    	
    	$('#condition-cancel-detail-button').bind('click',function(){
    		layui.layer.close(lindex);
    	});
    }
	
	
	function detail(){
		logId = $(this).attr("data-id");
    	var param = new Object();
    	param.url = 'condition_detail.html';
    	param.title = '详情信息'; 
    	var valid = new Object();
    	valid.id = "condition-detail-form";
    	param.width = 700;
    	param.init = detailInit;
    	layui.common.modal(param);
	}
	
	var datatable = layui.datatable.init({
		id:'condition-table',
		url:'/admin/coupon_template_condition/list', 
		key:'id',
		columns:[
		    { sTitle: 'ID',   mData: 'id'},
			{ sTitle: '条件名称',   mData: 'name'},
			{
				sTitle: '状态',
	          	mData: 'status' ,
	          	bSortable: true,
	          	mRender:function(mData,type,full){ 
	          		var html = ''; 
	          		if(full.status==0){
	          			html = '<label style="color:gray;">禁用</label>';
	          		} else if(full.status==1){
	          			html = '<label style="color:green;">启用</label>'; 
	          		}
	          		return html;
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
			{
				sTitle: '是否默认',
	          	mData: 'isDefault' ,
	          	bSortable: true,
	          	mRender:function(mData,type,full){ 
	          		var html = ''; 
	          		if(full.isDefault==1){
						html = '<label style="color:red;">是</label>'; 
	          		} else {
	          			html = '<label style="color:green;">否</label>'; 
	          		}
	          		return html;
	          	}
			},
			{
				sTitle: '详情',
	          	mRender:function(mData,type,full){
	          		 return '<a class="operation-detail" data-id="'+full.id+'" href="javascript:void(0);">详情</a>';
	          	}
			}
		],
		orderIndex:4,
		orderType:'desc',
		draw:draw,
		filter:addServerParams
	});  
	
	var query =  function(){
		datatable.reload();
	}; 
	
	$('.search_btn').bind('click',function(){
		query();
	});
	
	$('#return-button').bind('click',function(){
		if(type == 0){
			window.location.href="list.html";
		}else if(type == 2){
			window.location.href="pull_list.html";
		}else if(type == 3){
			window.location.href="subject_list.html";
		}
		
	});
	
	$('#add-button').bind('click',function(){
		var param = new Object();
    	param.url = 'condition_add.html';
    	param.title = '新增条件'; 
    	var valid = new Object();
    	valid.id = "condition-add-form";
    	valid.rules = {
        		name:{
        			rangelength:[1,32] ,
        			required: true,
        			remote:{
        				url:"/admin/coupon_template_condition/check",  
        				data:{
        					property:"name",
        					value:function(){return $('#condition-add-form input[name=name]').val();},
        					id:function(){return tempId}
        				}
        			}
        		}
        	};
    	valid.messages = {
    		name:{
    			rangelength:'名称长度应在[1,32]内', 
    			required: '请填写名称',
    			remote:'名称已经存在'
    		}
    	}; 
    	param.validate = valid;
    	param.width = 800;
    	param.init = initAddCondition;
    	layui.common.modal(param);
	});
	
	
	// 城市
	var cityHtml = '';
	function cityList(){
		layui.common.ajax({
			url:'/admin/biz/application_group/city_list',
			async:false,
			success:function(list){
				// 车区
				$.each(list,function(index,city){
					cityHtml += '<div class="layui-form-item"><label class="layui-form-label">'+city.cityName +'</label>';
					cityHtml += '<div class="layui-input-block"><hr>';
					cityHtml += '<div id="pre-list-div">';
					preList(city.id);
					cityHtml += '</div></div>';
				});
				$('#kytccz').html(cityHtml);
				form.render('checkbox');
			},error:function(){
			}
		});
	}
	
	function preList(cityId){
		layui.common.ajax({
			url:'/admin/biz/application_group/pre_list',
			data:JSON.stringify(cityId),
			contentType:'application/json; charset=utf-8',
			async:false,
			success:function(list){
				$.each(list,function(index,pre){
					cityHtml += '<input type="checkbox" lay-skin="primary" name="preId" value="'+pre.id+'" title="'+pre.name+'">';
				});
				cityHtml +='</div>';
			},error:function(){
			}
		});
	}
	
	var initAddCondition = function(validate,lindex){
		form.render('select');
		form.render('checkbox'); 
		$('#condition-cancel-button').bind('click',function(){
			layui.msg.confirm('取消后，你填写的信息将不会保存，请谨慎选择。',function(){
				layui.layer.close(lindex);
			});
		});
		laydate.render({
		    elem: '#zd_start_date',
		    min: new Date().format('yyyy-MM-dd'),
		    max: new Date(new Date().getTime()+1000*60*60*24*1000).format('yyyy-MM-dd'),
			istoday: false
		});
		laydate.render({
		    elem: '#zd_end_date',
		    min: new Date().format('yyyy-MM-dd'),
		    max: new Date(new Date().getTime()+1000*60*60*24*1000).format('yyyy-MM-dd'),
			istoday: false
		});
		
		form.on('select(availableTime)', function(data) {
			var availableTime = data.value;
			if(availableTime==0){
				$(".cycle-time").css("display","none");
				$("#zd_time").css("display","none");
				$("#cycle_date").css("display","none");
			}else if(availableTime==1){
				$(".cycle-time").css("display","block");
				$("#cycle_date").css("display","block");
				$("#zd_time").css("display","none");
			}else{
				$("#cycle_date").css("display","none");
				$(".cycle-time").css("display","none");
				$("#zd_time").css("display","block");
			}
        });
		
		$("#add_cycle_time").unbind("click").bind("click",function(){
			var html = '<div class="layui-form-item"><div class="cycle-time" style="display: inline;">'+$("#time").find(".cycle-time-s").eq(0).html();
			html += '<label class="layui-form-label"><a style="javascript:;" class="delete_cycle">删除时间段<a></label></div></div>';
			$("#time").append(html);
			form.render('select');
			$(".delete_cycle").click(function(){
				$(this).parent().parent().remove();
			});
		});
		
		
		form.on('select(availablePrefecture)', function(data) {
			var availablePrefecture = data.value;
			if(availablePrefecture==0){
				$("#kytccz").css("display","none");
				$('#kytccz').html('');
			}else if(availablePrefecture==1){
				$("#kytccz").css("display","block");
				cityHtml ='';
				cityList();
				
			}
        });
		
		form.on('select(city)', function(data) {
			var cityId = data.value;
			preList(cityId);
		});
		
		$('#condition-add-button').bind('click',function(){
        	if(validate.valid()){
        		var availablePrefecture = $('#condition-add-form select[name=availablePrefecture]').val();
        		var cityId = $('#condition-add-form select[name=cityId]').val();
        		
        		var availableTime = $('#condition-add-form select[name=availableTime]').val();
        		if(availableTime == 1){
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
        		}else if(availableTime == 2){
        			var zdStartDate =$("#zd_start_date").val();
        			var zdEndDate =$("#zd_end_date").val();
        			if(zdStartDate == ''){
        				layui.msg.error("请填写开始日期");
        				return false;
        			}
        			if(zdEndDate == ''){
        				layui.msg.error("请填写结束日期");
        				return false;
        			}
        			if(zdStartDate > zdEndDate){
        				layui.msg.error("开始日期不能大于结束日期");
        				return false;
        			}
        		}
        		
        		if(availablePrefecture ==1){
        			if(cityId == -1){
        				layui.msg.error('请选择城市!');
        				return false;
        			}
        			var checked = $('#pre-list-div input[name="preId"]:checked');
            		if(checked.length<=0){
            			layui.msg.error('请选择停车场');
            			return false;
            		}
        		}
        		
        		var param = new Object();
        		if(availableTime == 1){
        			var start = $('#condition-add-form select[name=start]').val();
        			var end = $('#condition-add-form select[name=end]').val();
        			param.start = start;
        			param.end = end;
        			var timeSlot = new Array();
        			var length = $("#time").find(".cycle-time");
        			for(var i = 0;i < length.length;i++){
        				var slot = new Object();
        				slot.startTime = $(length).eq(i).find(".startTime").val();
        				slot.endTime = $(length).eq(i).find(".endTime").val();
        				timeSlot.push(slot);
        			}
        			param.time = JSON.stringify(timeSlot);
        			$("#useTimeJson").val(JSON.stringify(param));
        		}else if(availableTime == 2){
        			param.zdStartDate = $("#zd_start_date").val();
        			param.zdEndDate = $("#zd_end_date").val();
        			param.zdStartTime = $("#zd_start_time").val();
        			param.zdEndTime = $("#zd_end_time").val();
        			$("#useTimeJson").val(JSON.stringify(param));
        		}
        		
        		if(availablePrefecture ==1){
        			var checked = $('#pre-list-div input[name="preId"]:checked');
            		var ids = '';
            		$.each(checked,function(index,ch){
            			ids += ',';
            			ids += ch.value;
            		});
            		$("#preIdJson").val(ids.substring(1));
        		}
        		$("#templateId").val(tempId);
        		layui.common.ajax({
        			url:'/admin/coupon_template_condition/save',
        			data:$('#condition-add-form').serialize(),
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
	
	
	
	$('#set-default-button').bind('click',function(){
		var list = datatable.selected(); 
		if(list.length != 1){
			layui.msg.error('请选择一条记录');
			return false;
		}
		layui.msg.confirm('您确定要设置为默认吗',function(){
			layui.common.ajax({
				url:'/admin/coupon_template_condition/setDefault',
				data:JSON.stringify(list[0].id),
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
	
});