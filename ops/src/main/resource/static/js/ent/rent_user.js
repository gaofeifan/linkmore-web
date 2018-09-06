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
	var laydate = layui.laydate; 

	laydate.render({
	    elem: '#start-time',
	    min: '2015-06-16 23:59:59',
	    max: new Date().format('yyyy-MM-dd'),
		istoday: false
	});
	laydate.render({
	    elem: '#end-time',
	    min: '2015-06-16 23:59:59',
	    max: new Date().format('yyyy-MM-dd'),
		istoday: false
	}); 
	
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
	var enterpriseHtml = '';
	var enterpriseList = null;
	var enterpriseMap = layui.common.map();
	layui.common.ajax({
		url:'/admin/biz/enterprise/selectAll',
		data:{time:new Date().getTime()}, 
		async:false,
		success:function(list){
			enterpriseList = list;
			enterpriseHtml = '<option value="">选择企业</option>';
			$.each(list,function(index,enterprise){
				enterpriseMap.put(enterprise.id,enterprise.name);
				enterpriseHtml += '<option value="'+enterprise.id+'">';
				enterpriseHtml += enterprise.name;
				enterpriseHtml += '</option>';
			});
		},error:function(){
			
		}
	});
	var preHtml = '';
	var preList = null;
	var preMap = layui.common.map();
	layui.common.ajax({
		url:'/admin/ent/prefectrue/all',
		data:{time:new Date().getTime()}, 
		async:false,
		success:function(list){
			preList = list;
			preHtml = '<option value="">选择车区</option>';
			$.each(list,function(index,pre){
				preMap.put(pre.id,pre.preName);
				preHtml += '<option value="'+pre.id+'">';
				preHtml += pre.preName;
				preHtml += '</option>';
			});
			
		},error:function(){
			
		}
	});
	var stallList = null;
	layui.common.ajax({
		url:'/admin/biz/stall/all',
		data:{time:new Date().getTime()}, 
		async:false,
		success:function(list){
			stallList = list;
		},error:function(){
			
		}
	});
	
	var addServerParams = function(data){  
		var filters = new Array();
		var filter = null; 
		var searchEntName = $('#search-ent-name').val();
		if(searchEntName!=''){
			filter = new Object();
			filter.property = 'entName';
			filter.value = searchEntName;
			filters.push(filter);
		}
		var searchPreName = $('#search-pre-name').val();
		if(searchPreName!=''){
			filter = new Object();
			filter.property = 'preName';
			filter.value = searchPreName;
			filters.push(filter);
		}
		if(filters.length>0){
			data.push({name:'filterJson',value:JSON.stringify({filters:filters})});
		}
	};
	var lastCheckedId = null;
	
	var datatable = layui.datatable.init({
		id:'rent-table',
		url:'/admin/ent/rent/list', 
		key:'id',
		columns:[
			{ sTitle: 'ID',   mData: 'id', bVisible:false}, 
			{ sTitle: '企业ID',   mData: 'entId', bVisible:false}, 
			{ sTitle: '企业名称',   mData: 'entName'}, 
			{ sTitle: '车区ID',   mData: 'preId', bVisible:false}, 
			{ sTitle: '车区名称',   mData: 'preName'}, 
			{ sTitle: '车位ID',   mData: 'stallId', bVisible:false}, 
			{ sTitle: '车位名称',   mData: 'stallName'}, 
			{ sTitle: '手机号',   mData: 'mobile'}, 
			{ sTitle: '姓名',   mData: 'realname'}, 
			{ sTitle: '车辆',   mData: 'plate'}, 
			{
				sTitle: '开始时间',
				mData: 'startTime' ,
				bSortable: true,
				mRender:function(mData,type,full){
					return mData!=null?new Date(mData).format('yyyy-MM-dd hh:mm'):'未设置时间';
				}
			},
			{
				sTitle: '更新时间',
				mData: 'endTime' ,
				bSortable: true,
				mRender:function(mData,type,full){
					return mData!=null?new Date(mData).format('yyyy-MM-dd hh:mm'):'未设置时间';
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
		laydate.render({
		    elem: '#start-time',
		    min: '2015-06-16 23:59:59',
		    max: new Date(new Date().getTime()+1000*60*60*24*3650).format('yyyy-MM-dd'),
			istoday: false
		});
		laydate.render({
		    elem: '#end-time',
		    min: '2015-06-16 23:59:59',
		    max: new Date(new Date().getTime()+1000*60*60*24*3650).format('yyyy-MM-dd'),
			istoday: false
		}); 
		form.render('checkbox'); 
		$('#admin-pre-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		$("#enterprise-id").html(enterpriseHtml);
		form.render('select');
		form.on('select(enterpriseId)', function(data){
		$("#ent-pre-id").html(preHtml);
		form.render('select');
//		preHtml = '<option value="">选择企业车区</option>';
		$.each(enterpriseList,function(index,ent){
			if(ent.id == data.value){
				$("#entName").val(ent.name);
			/*	$.each(preList,function(index,pre){
					if(pre.entId == data.value){
						preHtml += '<option value="'+pre.id+'">';
						preHtml += pre.preName;
						preHtml += '</option>';
					}
				})
				$("#ent-pre-id").html(preHtml);
				form.render('select');*/
			}
		})
		})
		form.on('select(ent-pre-id)', function(data){
			$.each(preList,function(index,pre){
				if(pre.id == data.value){
					$("#preName").val(pre.preName);
					$("#preId").val(pre.preId);
					var stallHtml = '<option value="">选择车区车位</option>';
					$.each(stallList,function(index,stall){
						if(stall.preId == pre.preId){
							stallHtml += '<option value="'+stall.id+'">';
							stallHtml += stall.stallName;
							stallHtml += '</option>';
						}
					})
					$("#stallId").html(stallHtml);
					form.render('select');
				}
			})
		})
		form.on('select(stallId)', function(data){
			$.each(stallList,function(index,stall){
				if(stall.id == data.value){
					$("#stallName").val(stall.stallName)
				}
			})
		})
	$('#admin-rent-add-button').bind('click',function(){
    	if(validate.valid()){
    		layui.common.ajax({
    			url:'/admin/ent/rent/save',
    			data:$('#admin-rent-add-form').serialize(),
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
    	valid.id = "admin-rent-add-form";
    	valid.rules = {
    		mobile:{
    			rangelength:[11,11],
    			required: true,
    			digits:true,
    			remote:{
    				url:"/admin/ent/rent/check",  
    				data:{
    					property:"mobile",
    					value:function(){return $('#admin-rent-add-form input[name=mobile]').val();},
    					id:function(){return new Date().getTime();}
    				}
    			}
    		},realname:{
    			rangelength:[1,12],  
    			required: true
    		}  
    	};
    	valid.messages = {
    		mobile:{
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
    	param.init = addInit;
    	layui.common.modal(param);  
    });
    /*
     * 编辑
     */
    var editInit = function(validate,lindex){
    	laydate.render({
		    elem: '#start-time',
		    min: '2015-06-16 23:59:59',
		    max: new Date(new Date().getTime()+1000*60*60*24*3650).format('yyyy-MM-dd'),
			istoday: false
		});
		laydate.render({
		    elem: '#end-time',
		    min: '2015-06-16 23:59:59',
		    max: new Date(new Date().getTime()+1000*60*60*24*3650).format('yyyy-MM-dd'),
			istoday: false
		}); 
		var list = datatable.selected();
		layui.common.set({
			id:'admin-rent-edit-form',
			data:list[0]
		});
		form.render('checkbox');
		$("#enterprise-id").html(enterpriseHtml);
		form.render('select');
		$("#enterprise-id").val(list[0].entId);
		form.render('select');
//		preHtml = '<option value="">选择企业车区</option>';
		/*$.each(preList,function(index,pre){
			if(pre.entId == list[0].entId){
				preHtml += '<option value="'+pre.id+'">';
				preHtml += pre.preName;
				preHtml += '</option>';
			}
		})*/
		$("#ent-pre-id").html(preHtml);
		form.render('select');
		$("#ent-pre-id").val(list[0].entPreId);
		form.render('select');
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
		form.render('select');
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
		})*/
		
		
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
		})
		form.on('select(stallId)', function(data){
			$.each(stallList,function(index,stall){
				if(stall.id == data.value){
					$("#stallName").val(stall.stallName)
				}
			})
		})
		$('#admin-rent-edit-button').bind('click',function(){
        	if(validate.valid()){  
        		layui.common.ajax({
        			url:'/admin/ent/rent/update',
        			data:$('#admin-rent-edit-form').serialize(),
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
    	valid.id = "admin-rent-edit-form";
    	valid.rules = {
    		mobile:{
    			rangelength:[11,11],
    			required: true,
    			digits:true,
    			remote:{
    				url:"/admin/ent/rent/check",  
    				data:{
    					property:"mobile",
    					value:function(){return $('#admin-rent-edit-form input[name=mobile]').val();},
    					id:function(){return $('#admin-rent-edit-form input[name=id]').val();}
    				}
    			}
    		},realname:{
    			rangelength:[1,12],  
    			required: true
    		}  
    	};
    	valid.messages = {
    		mobile:{
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
				url:'/admin/ent/rent/delete',
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
});