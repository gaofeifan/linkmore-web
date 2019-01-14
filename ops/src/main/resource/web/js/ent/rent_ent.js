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
var form, $;
layui.use(['element','layer','msg','form','ztree', 'common','datatable','laydate'], function() {
	var session = window.sessionStorage;
	var layer = layui.layer;  
	var $ = layui.jquery; 
	form = layui.form;   
	var laydate = layui.laydate; 
	var element = layui.element;
	
	var layer = parent.layer === undefined ? layui.layer : parent.layer;
    $ = layui.jquery;
	
	var draw = function(settings, json){
//		$(".operation-start").unbind('click').bind('click',startTemplate);
	};
	
	var addServerParams = function(data){  
		var filters = new Array();
		var filter = null; 
		var searchCompanyName = $('#search-company-name').val();
		if(searchCompanyName!=''){
			filter = new Object();
			filter.property = 'companyName';
			filter.value = '%'+searchCompanyName +'%';
			filters.push(filter);
		}
		
		if(filters.length>0){
			data.push({name:'filterJson',value:JSON.stringify({filters:filters})});
		}
	};
	
	var datatable = layui.datatable.init({
		id:'company-table',
		url:'/admin/ent/rent-ent/list', 
		key:'id',
		columns:[
			{ sTitle: 'ID',   mData: 'id', bVisible:false}, 
			{ sTitle: '长租企业名称',   mData: 'companyName'}, 
			{ sTitle: '车区名称',   mData: 'preName'},  
			{
				sTitle: '用户数量',
	          	mRender:function(mData,type,full){
	          		var html = '<a class="operation-user" href="../rent_ent_user/list.html?companyId='+full.id+'">'+full.userCount+'</a>';
	          		return html;
	          	}
			},
			{
				sTitle: '车位数量',
	          	mRender:function(mData,type,full){
	          		var html = '<a class="operation-user" href="stall_list.html?companyId='+full.id+'">'+full.stallCount+'</a>';
	          		return html;
	          	}
			},
			{
				sTitle: '开始时间',
				mData: 'startTime' ,
				bSortable: true,
				mRender:function(mData,type,full){
					return mData!=null?new Date(mData).format('yyyy-MM-dd'):'';
				}
			},
			{
				sTitle: '结束时间',
				mData: 'endTime' ,
				mRender:function(mData,type,full){
					return mData!=null?new Date(mData).format('yyyy-MM-dd'):'';
				}
			},
			{ sTitle: '操作人',   mData: 'updateUserName'},
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
			  bSortable: true,
	          mRender:function(mData,type,full){
	        	  if(mData != null){
	        		  return new Date(mData).format('yyyy-MM-dd hh:mm:ss');
	        	  }
	          }	
			}
		],
		orderIndex:6,
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
	
	var getDateDiff= function (startDate,endDate){  
	    var startTime = new Date(Date.parse(startDate.replace(/-/g,   "/"))).getTime();     
	    var endTime = new Date(Date.parse(endDate.replace(/-/g,   "/"))).getTime();     
	    var dates = (endTime-startTime)/(1000*60*60*24);     
	    return  dates;
	}
	
	/**
	 * 启用策略
	 */
	$('#open-button').bind('click',function(){
		var list = datatable.selected(); 
		if(list.length<1){
			layui.msg.error('请至少选择一条记录');
			return false;
		}
		for(i= 0,len=list.length; i < len; i++) {
		    if(list[i].status == 2){
		    	layui.msg.error('公司已启用');
				return false;
		    }
		    if(list[i].status == 3){
				layui.msg.error('过期的无法启用');
				return false;
			}
		    if(getDateDiff(new Date(list[i].startTime).format('yyyy-MM-dd'),new Date().format('yyyy-MM-dd'))>0 && getDateDiff(new Date().format('yyyy-MM-dd'),new Date(list[i].endTime).format('yyyy-MM-dd'))<=0 ){
		    	layui.msg.error('日期过期的无法启用');
				return false;
		    }
		}
		
		var ids = new Array();
		$.each(list,function(index,dg){
			ids.push(dg.id);
		});
		layui.msg.confirm('确定开启吗？',function(){
			layui.common.ajax({
				url:'/admin/ent/rent-ent/status/open',
				contentType:'application/json; charset=utf-8',
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
			layui.msg.error('公司已关闭');
			return false;
		}
		var ids = new Array();
		$.each(list,function(index,dg){
			ids.push(dg.id);
		});
		layui.msg.confirm('确定关闭吗？',function(){
			layui.common.ajax({
				url:'/admin/ent/rent-ent/status/close',
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
		var flag = false;
		$.each(list,function(index,page){
			ids.push(page.id);
			if(page.status == 2){
				flag = true;
				return false;
			}
		});
		if(flag){
			layui.msg.error('启用状态下禁止删除');
			return false;
		}
		layui.msg.confirm('您确定要删除公司吗？</br>删除公司会取消其下的车位和用户相关权限。</br>确定删除请点击【确认】</br>放弃删除请点击【取消】。',function(){
			layui.common.ajax({
				url:'/admin/ent/rent-ent/delete',
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
		$('#company-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		laydate.render({
		    elem: '#start-time',
		    min: new Date().format('yyyy-MM-dd'),
		    max: new Date(new Date().getTime()+1000*60*60*24*3650).format('yyyy-MM-dd'),
			istoday: false,
			type: 'date'
		});
		laydate.render({
		    elem: '#end-time',
		    min: new Date().format('yyyy-MM-dd'),
		    max: new Date(new Date().getTime()+1000*60*60*24*3650).format('yyyy-MM-dd'),
			istoday: false,
			type: 'date'
		}); 
		var stallHtml = '<option value = "">请选择车位</option>';
		var stallList;
		layui.common.ajax({
			url:'/admin/ent/rent-ent/stall-list',
			async:false,
			success:function(res){
				stallList = res;
				$.each(res,function(index,stall){
					$("#preId").val(stall.preId);
					stallHtml += '<option value = "'+stall.id+'">'+stall.stallName+'</option>';
				})
		}});
		$("#stallIds").html(stallHtml);
		form.render();
		$('#company-add-button').bind('click',function(){
	    	if(validate.valid()){
	    		var companyName = $('#companyName').val();
	    		var stallIds = $('#stallIds').val();
	    		var startTime = $('#start-time').val();
	    	    var endTime = $('#end-time').val();
	    	   
        		if(companyName == ''){
        			layui.msg.tips('请填写公司名称!');
    				return;
        		}	
    			if(stallIds == null){
        			layui.msg.tips('请选择车位!');
    				return;
        		}

            	if(startTime.trim().length<=0 || endTime.trim().length<=0 ){
        			layui.msg.error("开使日期或结束日期不能为空");
        			return false;
        		}
        		if(startTime > endTime){
        			layui.msg.error("开始日期不能大于结束日期");
        			return false;
        		}
	    		var names = new Array();
	    		var stallIds = new Array();
	    		$.each($("#stallIds").find("option:selected"),function(index){
	    			names.push($(this).text());
	    			stallIds.push($(this).val());
	    		})
	    		$("#stallNames").val(names);
	    		layui.common.ajax({
	    			url:'/admin/ent/rent-ent/save',
	    			data:$('#company-add-form').serialize(),
	    			success:function(res){
	    				if(res.success){
	    					layui.layer.close(lindex);
	    					layui.msg.success(res.content);
	    					window.setTimeout(query,1000);
	    				}
	    			} 
	    		});
	    	}
	    //	}
		});
	};
    $('#add-button').bind('click',function(){
    	var param = new Object();
    	param.url = 'add.html';
    	param.title = '添加信息'; 
    	var valid = new Object();
    	valid.id = "company-add-form";
    	valid.rules = {
    		companyName:{
    			rangelength:[2,30],
    			required: true
    		},stallIds:{
    			rangelength:[1,255],  
    			required: true
    		},startTime:{
    			required: true
    		},endTime:{
    			required: true
    		}
    	};
    	valid.messages = {
    		companyName:{
    			required: '请填写公司名称',
    			rangelength:'名称长度应在[2,30]内'
    		},stallIds:{
    			rangelength:'请选择车位',  
    			required: '请选择车位'
    		},startTime:{
    			required: '请填写开始日期'
    		},endTime:{
    			required: '请填写结束日期'
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
    	laydate.render({
		    elem: '#start-time',
		    min: new Date().format('yyyy-MM-dd'),
		    max: new Date(new Date().getTime()+1000*60*60*24*3650).format('yyyy-MM-dd'),
			istoday: false,
			type: 'date'
		});
		laydate.render({
		    elem: '#end-time',
		    min: new Date().format('yyyy-MM-dd'),
		    max: new Date(new Date().getTime()+1000*60*60*24*3650).format('yyyy-MM-dd'),
			istoday: false,
			type: 'date'
		}); 
    	
    	$('#company-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		var list = datatable.selected();
		form.render('select');
		layui.common.set({
			id:'company-edit-form',
			data:list[0]
		});
		
		$("#start-time").val(new Date(list[0].startTime).format('yyyy-MM-dd'));
		$("#end-time").val(new Date(list[0].endTime).format('yyyy-MM-dd'));
		form.render('checkbox');
		
		/*$("#entId").val(list[0].entId);
		$("#entPreId").val(list[0].entPreId);
		var stallHtml = '<option value="">选择车区车位</option>';
		$.each(stallList,function(index,stall){
			if(stall.preId == list[0].preId){
				stallHtml += '<option value="'+stall.id+'">';
				stallHtml += stall.stallName;
				stallHtml += '</option>';
			}
		})
		$("#stallId").html(stallHtml);
		form.render('select');
		$("#stallId").val(list[0].stallId);
		form.render('select');*/
		
		/*$.each(enterpriseList,function(index,ent){
			if(ent.id == list[0].entId){
				$.each(preList,function(index,pre){
					if(pre.entId == list[0].entId){
						preHtml += '<option value="'+pre.id+'">';
						preHtml += pre.preName;
						preHtml += '</option>';
					}
				})
				$("#ent-pre-id").html(preHtml);
				$("#ent-pre-id").val(list[0].preId);
				form.render('select');
			}
		})
		
		form.on('select(enterpriseId)', function(data){
		preHtml = '<option value="">选择企业车区</option>';
		$.each(enterpriseList,function(index,ent){
			if(ent.id == data.value){
				$("#entName").val(ent.name);
				$.each(preList,function(index,pre){
					if(pre.entId == data.value){
						preHtml += '<option value="'+pre.id+'">';
						preHtml += pre.preName;
						preHtml += '</option>';
					}
				})
				$("#ent-pre-id").html(preHtml);
				form.render('select');
			}
		})
		})
		form.on('select(ent-pre-id)', function(data){
			var stallHtml = '<option value="">选择车区车位</option>';
			$.each(preList,function(index,pre){
				if(pre.id == data.value){
					$("#preName").val(pre.name);
					$("#preId").val(pre.preId);
					$.each(stallList,function(index,stall){
						if(stall.preId == pre.preId){
							stallHtml += '<option value="'+stall.id+'">';
							stallHtml += stall.stallName;
							stallHtml += '</option>';
						}
					})
				}
			})
			$("#stallId").html(stallHtml);
			form.render('select');
		});
		
		form.on('select(stallId)', function(data){
			$.each(stallList,function(index,stall){
				if(stall.id == data.value){
					$("#stallName").val(stall.stallName)
				}
			})
		})*/
		$('#company-edit-button').bind('click',function(){
        	if(validate.valid()){  
        		layui.common.ajax({
        			url:'/admin/ent/rent-ent/update',
        			data:$('#company-edit-form').serialize(),
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
			layui.msg.error('请选择一条记录！');
			return false;
		}
		if(list[0].status == 2){
			layui.msg.error('启用状态下禁止修改！');
			return false;
		}
		var param = new Object();
    	param.url = 'edit.html';
    	param.title = '编辑信息'; 
    	var valid = new Object();
    	valid.id = "company-edit-form";
    	valid.rules = {
			companyName:{
    			rangelength:[2,11],
    			required: true
    		},startTimeStr:{
    			required: true
    		},endTimeStr:{
    			required: true
    		}
    	};
    	valid.messages = {
			companyName:{
    			required: '请填写公司名称'
    		},startTimeStr:{
    			required: '请填写开始日期'
    		},endTimeStr:{
    			required: '请填写结束日期'
    		}
			/*mobile:{
    			rangelength:'手机号长度有误', 
    			required: '请填写手机号',
    			mobile:'手机号格式有误',
    		},realname:{
    			rangelength:'姓名应该在[1,12]内',  
    			required: '请填写姓名'
    		},plate:{
    			required: '请填写车牌号',
    			isPlateNo:'请输入正确的车牌号'
    		},startDate:{
    			required: '请填写开始日期'
    		},endDate:{
    			required: '请填写结束日期'
    		}*/
    	}; 
    	param.validate = valid;
    	param.width = 600;
    	param.init = editInit;
    	layui.common.modal(param);
	});
	
});