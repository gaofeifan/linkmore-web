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
layui.use(['element','layer','msg','form','ztree', 'common','datatable','laydate'], function() {
	var session = window.sessionStorage;
	var layer = layui.layer;  
	var $ = layui.jquery; 
	var form = layui.form;   
	var laydate = layui.laydate; 
	var element = layui.element;
	//企业列表
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
	//根据企业id获取企业车区列表
	var entPreHtml = '';
	var entPreList = null;
	var entPreMap = null;
	var entPreIdMap = null;
	form.on('select(entId)', function(data) {
		initEntPre(data.value);
	}); 
	
	function initEntPre(entId){
		entPreHtml = '';
		entPreMap = layui.common.map();
		entPreIdMap = layui.common.map();
		//var entId = data.value; 
		layui.common.ajax({
			url:'/admin/ent/prefectrue/all',
			data:{time:new Date().getTime(),entId:entId}, 
			async:false,
			success:function(list){
				entPreList = list;
				entPreHtml = '<option value="">选择企业车区</option>';
				$.each(list,function(index,entPre){
					entPreMap.put(entPre.id,entPre.preName);
					entPreIdMap.put(entPre.id,entPre.preId);
					entPreHtml += '<option value="'+entPre.id+'">';
					entPreHtml += entPre.preName;
					entPreHtml += '</option>';
				});
				$("#entPreId").html(entPreHtml);
				form.render('select');
			},error:function(){
				
			}
		});
	}
	
	//普通车区列表
	var preHtml = '';
	var preList = null;
	var preMap = layui.common.map();
	layui.common.ajax({
		url:'/admin/account/order/prefecture_list',
		data:{time:new Date().getTime()}, 
		async:false,
		success:function(list){
			preList = list;
			preHtml = '<option value="">选择车区</option>';
			$.each(list,function(index,pre){
				preMap.put(pre.id,pre.name);
				preHtml += '<option value="'+pre.id+'">';
				preHtml += pre.name;
				preHtml += '</option>';
			});
		},error:function(){
			
		}
	});
	
	//根据车区id获取车位列表
	var stallHtml = '';
	var stallList = null;
	var stallMap = null;
	form.on('select(preId)', function(data) {
		initStall(data.value);
	}); 
	
	function initStall(preId){
		stallHtml = '';
		stallMap = layui.common.map();
		//var preId = data.value; 
		layui.common.ajax({
			url:'/admin/biz/stall/rent-stall',
			data:{time:new Date().getTime(),pid:preId}, 
			async:false,
			success:function(list){
				stallList = list;
			    stallHtml = '<option value="">选择车位</option>';
				$.each(list,function(index,stall){ 
					stallMap.put(stall.id,stall.stallName);
					stallHtml += '<option value="'+stall.id+'">';
					stallHtml += stall.stallName;
					stallHtml += '</option>';
				});
				$('#stallId').html(stallHtml);
				form.render('select');
			},error:function(){
				
			}
		});
	}
	
	//根据企业车区id获取固定车位列表
	form.on('select(entPreId)', function(data){
		stallHtml = '';
		stallMap = layui.common.map();
		$.each(entPreList,function(index,entPre){
			if(entPre.id == data.value){
				layui.common.ajax({
					url:'/admin/biz/stall/rent-stall',
					data:{time:new Date().getTime(),pid:entPre.preId}, 
					async:false,
					success:function(list){
						stallList = list;
					    stallHtml = '<option value="">选择车位</option>';
						$.each(list,function(index,stall){ 
							stallMap.put(stall.id,stall.stallName);
							stallHtml += '<option value="'+stall.id+'">';
							stallHtml += stall.stallName;
							stallHtml += '</option>';
						});
						$('#stallId').html(stallHtml);
						form.render('select');
					},error:function(){
						
					}
				});
			}
		});
	});
	
	
	
	//一些事件监听
	 var index =0;
	//一些事件监听
	element.on('tab(rent-user-tab)', function(data){
		index = data.index;
		if(index == 0){
			$("#type").val(0);
		}else if(index == 1){
			$("#type").val(1);
		}
	});

	var addServerParams = function(data){  
		var filters = new Array();
		var filter = null; 
		var searchEntName = $('#search-ent-name').val();
		var searchPreName = $('#search-pre-name').val();
		var searchMobile = $('#search-mobile').val();
		var searchRealname = $('#search-realname').val();
		var searchPlateNo = $('#search-plateno').val();
		var searchRentType = $('#search-rent-type').val();
		
		if(searchRentType!=''){
			filter = new Object();
			filter.property = 'type';
			filter.value = searchRentType;
			filters.push(filter);
		}
		
		if(searchEntName!=''){
			filter = new Object();
			filter.property = 'entName';
			filter.value = '%'+searchEntName +'%';
			filters.push(filter);
		}
		
		if(searchPreName!=''){
			filter = new Object();
			filter.property = 'preName';
			filter.value = '%'+searchPreName +'%';
			filters.push(filter);
		}
		
		if(searchMobile!=''){
			filter = new Object();
			filter.property = 'mobile';
			filter.value = '%'+searchMobile +'%';
			filters.push(filter);
		}
		
		if(searchRealname!=''){
			filter = new Object();
			filter.property = 'realname';
			filter.value = '%'+searchRealname +'%';
			filters.push(filter);
		}
		
		if(searchPlateNo!=''){
			filter = new Object();
			filter.property = 'plateNo';
			filter.value = '%'+$.trim(searchPlateNo) +'%';
			filters.push(filter);
		}

		if(filters.length>0){
			data.push({name:'filterJson',value:JSON.stringify({filters:filters})});
		}
	};
	
	var datatable = layui.datatable.init({
		id:'rent-table',
		url:'/admin/ent/rent/list', 
		key:'id',
		columns:[
			{ sTitle: 'ID',   mData: 'id', bVisible:false}, 
			{ sTitle: '企业ID',   mData: 'entId', bVisible:false}, 
			
			{
				sTitle: '类型',
	          	mData: 'type' , 
	          	mRender:function(mData,type,full){
	          		var html = '';
	          		if(mData == 1){
	          			html +='<label style="color:red;">企业</label>';
	          		}else{
	          			html +='<label style="color:green;">个人</label>';
	          		}
	          		return html;
	          	}
			},
			{ sTitle: '企业名称',   mData: 'entName'},
			{ sTitle: '车区ID',   mData: 'preId', bVisible:false}, 
			{ sTitle: '车区名称',   mData: 'preName'}, 
			{ sTitle: '车位ID',   mData: 'stallId', bVisible:false}, 
			{ sTitle: '车位名称',   mData: 'stallName'}, 
			{ sTitle: '手机号',   mData: 'mobile'}, 
			{ sTitle: '姓名',   mData: 'realname'}, 
			{ sTitle: '车辆',   mData: 'plate'}, 
			{
				sTitle: '车位状态',
	          	mData: 'status',
	          	bSortable: true,
	          	mRender:function(mData,type,full){
	          		var html = '';
	          		if(1== mData){
	          			html += '<label style="color:#FF00FF;">空闲</label>';
	          		}else if(2== mData){
	          			html += '<label style="color:#FF4500;">使用中</label>';
	          		}else{
	          			html += '<label style="color:#666666;">下线</label>';
	          		}
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
				bSortable: true,
				mRender:function(mData,type,full){
					return mData!=null?new Date(mData).format('yyyy-MM-dd'):'';
				}
			},{
				sTitle: '创建时间',
				mData: 'createTime' ,
				bSortable: true,
				mRender:function(mData,type,full){
					return mData!=null?new Date(mData).format('yyyy-MM-dd'):'';
				}
			},
			{ sTitle: '创建用户账户',   mData: 'createUserName'},
			{ sTitle: '创建车场账户',   mData: 'createEntName'}
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
		$('#admin-rent-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		laydate.render({
		    elem: '#start-time',
		    min: new Date().format('yyyy-MM-dd'),
		    max: new Date(new Date().getTime()+1000*60*60*24*3650).format('yyyy-MM-dd'),
			istoday: false,
			type: 'datetime'
		});
		laydate.render({
		    elem: '#end-time',
		    min: new Date().format('yyyy-MM-dd'),
		    max: new Date(new Date().getTime()+1000*60*60*24*3650).format('yyyy-MM-dd'),
			istoday: false,
			type: 'datetime'
		}); 
		form.render('checkbox');
		//普通车区
		$('#preId').html(preHtml);
		//企业
		$("#entId").html(enterpriseHtml);
		//企业车区
		$("#entPreId").html(entPreHtml);
		
		form.render('select');
		$('#admin-rent-add-button').bind('click',function(){
	    	if(validate.valid()){
	    		var type = $("#type").val();
	    		var preId = $('#preId').val();
	    		var stallId = $('#stallId').val();
	    		var entId = $('#entId').val();
	    		var entPreId = $('#entPreId').val();
	    		var startTime = $('#start-time').val();
	    	    var endTime = $('#end-time').val();
        		if(type == 0){
        			if(preId ==""){
            			layui.msg.tips('请选择车区!');
        				return;
            		}
            		$("#preName").val(preMap.get(preId));
        		}else{
        			if(entId ==""){
            			layui.msg.tips('请选择企业!');
        				return;
            		}
            		if(entPreId ==""){
            			layui.msg.tips('请选择企业车区!');
        				return;
            		}
            		$("#preId").val(entPreIdMap.get(entPreId));
            		$("#entName").val(enterpriseMap.get(entId));
        			$("#preName").val(entPreMap.get(entPreId));
        		}
        		
        		if(stallId ==""){
        			layui.msg.tips('请选择车位!');
    				return;
        		}
        		$("#stallName").val(stallMap.get(stallId));
        		if(startTime > endTime){
        			layui.msg.error("开始日期不能大于结束日期");
        			return false;
        		}
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
    			//required: false,
    			mobile:true
    		},realname:{
    			rangelength:[1,12],  
    			//required: false
    		},plate:{
    			required: true,
    			isPlateNo:true
    		},startDate:{
    			required: true
    		},endDate:{
    			required: true
    		}
    	};
    	valid.messages = {
    		mobile:{
    			rangelength:'手机号长度有误', 
    		//	required: '请填写手机号',
    			mobile:'请输入有效手机号'
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
			type: 'datetime'
		});
		laydate.render({
		    elem: '#end-time',
		    min: new Date().format('yyyy-MM-dd'),
		    max: new Date(new Date().getTime()+1000*60*60*24*3650).format('yyyy-MM-dd'),
			istoday: false,
			type: 'datetime'
		}); 
    	
    	$('#admin-rent-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		var list = datatable.selected();
		
		$("#preId").html(preHtml);
		$("#entId").html(enterpriseHtml);
		$("#entPreId").html(entPreHtml);
		//initStall(list[0].preId);
		initEntPre(list[0].entId);
		form.render('select');
		
		layui.common.set({
			id:'admin-rent-edit-form',
			data:list[0]
		});
		
		var type = list[0].type;
		if(type == 0){
			$("#user-pre").css('display','block');
		}else{
			$("#com-ent").css('display','block');
			$("#com-ent-pre").css('display','block');
			$("#preId").val(list[0].preId);
		}
		$("#start-time").val(new Date(list[0].startTime).format('yyyy-MM-dd hh:mm:ss'));
		$("#end-time").val(new Date(list[0].endTime).format('yyyy-MM-dd hh:mm:ss'));
		form.render('checkbox');
		
		$("#entId").val(list[0].entId);
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
    			//required: true,
    			mobile:true
    		},realname:{
    			rangelength:[1,12],  
    			//required: true
    		},plate:{
    			required: true,
    			isPlateNo:true
    		},startDate:{
    			required: true
    		},endDate:{
    			required: true
    		}
    	};
    	valid.messages = {
			mobile:{
    			rangelength:'手机号长度有误', 
    			//required: '请填写手机号',
    			mobile:'手机号格式有误',
    		},realname:{
    			rangelength:'姓名应该在[1,12]内',  
    			//required: '请填写姓名'
    		},plate:{
    			required: '请填写车牌号',
    			isPlateNo:'请输入正确的车牌号'
    		},startDate:{
    			required: '请填写开始日期'
    		},endDate:{
    			required: '请填写结束日期'
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
		layui.msg.confirm('您确定要删除该长租用户吗？确定删除请点击是，放弃删除请点击否。',function(){
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