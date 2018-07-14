layui.config({
	base: '/js/lib/'
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
		if(searchType!='-1'){
			filter = new Object();
			filter.property = 'type';
			filter.value = searchType;
			filters.push(filter);
		}
		if(filters.length>0){
			data.push({name:'filterJson',value:JSON.stringify({filters:filters})});
		}
	};
	var datatable = layui.datatable.init({
		id:'fee-strategy-table',
		url:'/admin/biz/fee_strategy/list', 
		key:'id',
		columns:[ 
		    { sTitle: '创建时间', bVisible:false,  mData: 'createTime'},   
			{ sTitle: '名称',   mData: 'name'},   
			{
				sTitle: '首小时内',
	          	mData: 'firstHour' , 
	          	mRender:function(mData,type,full){
	          		return mData +'元  / '+full.timelyLong+full.timelyUnit;
	          	}
			},{
				sTitle: '基础价格',
	          	mData: 'basePrice' , 
	          	mRender:function(mData,type,full){
	          		return mData +'元 / ' +full.timelyLong +full.timelyUnit;
	          	}
			},{
				sTitle: '夜间价格',
	          	mData: 'nightPrice' , 
	          	mRender:function(mData,type,full){ 
	          		return mData +'元 / ' + full.nightTimelyLong+ full.timelyUnit;
	          	}
			},{
				sTitle: '免费时长',
	          	mData: 'freeMins' , 
	          	mRender:function(mData,type,full){
	          		return mData + ' 分钟';
	          	}
			},{
				sTitle: '开始时间',
	          	mData: 'beginTime'  
			},{
				sTitle: '结束时间',
	          	mData: 'endTime'  
			},{
				sTitle: '状态',
	          	mData: 'status' ,
	          	bSortable: true,
	          	mRender:function(mData,type,full){
	          		var html = '<label style="color:gray">禁用</label>';
	          		if(mData==1){
	          			html = '<label style="color:blue">启用</label>'; 
	          		}
	          		return html;
	          	}
			},
			{
				sTitle: '分类',
	          	mData: 'type' ,
	          	bSortable: true,
	          	mRender:function(mData,type,full){
	          		var html = '';
	          		switch(mData){
	          			case 0: html = '<label style="color:gree">北京无封顶计费</label>';break;
	          			case 1: html = '<label style="color:#666">无封顶计费</label>';break;
	          			case 2: html = '<label style="color:#1E9FFF">按天封顶计费</label>';break;
	          			case 3: html = '<label style="color:#009688">按照时段封顶计费</label>';break;
	          			case 4: html = '<label style="color:rgb(95, 184, 120);">24小时封顶计费</label>';break; 
	          			case 7: html = '<label style="color:rgb(90, 104, 100);">湖滨银泰计费</label>';break;
	          			case 8: html = '<label style="color:rgb(50, 154, 60);">西城广场计费</label>';break;
						case 9: html = '<label style="color:rgb(50, 154, 60);">杭州无封顶计费</label>';break; 
						case 10: html = '<label style="color:rgb(50, 154, 60);">天洋D32时尚购物计费</label>';break; 						
	          		}
	          		return html;
	          	}
			} 
		],
		orderIndex:1,
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
				url:'/admin/biz/fee_strategy/delete',
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
	
	var addInit = function(validate,lindex){   
		form.render('select'); 
		form.render('checkbox'); 
		$('#fee-strategy-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		}); 
		form.on('select(type)', function(data) {
			var type = data.value;  
			$('#top-night-div').hide();
			$('#top-daily-div').hide();
			$('#top-day-input').val('');
			console.info(type);
			if(type==2||type==4||type==8||type==10){
				$('#top-daily-div').show();
			}else if(type==3||type==7){
				$('#top-day-input').val('0');
				$('#top-night-div').show();
			}
        });
		$('#fee-strategy-add-button').bind('click',function(){
        	if(validate.valid()){  
        		layui.common.ajax({
        			url:'/admin/biz/fee_strategy/save',
        			data:$('#fee-strategy-add-form').serialize(),
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
    	valid.id = "fee-strategy-add-form";
    	valid.rules = {
    		name:{
    			rangelength:[1,100] ,
    			required: true,
    			remote:{
    				url:"/admin/biz/fee_strategy/check",  
    				data:{
    					property:"name",
    					value:function(){return $('#fee-strategy-add-form input[name=name]').val();},
    					id:function(){return new Date().getTime();}
    				}
    			}
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
    		},freeMins:{
    			digits:true,
    			required: true
    		},firstHour:{
    			number:true,
    			min:0,
    			required: true
    		},basePrice:{
    			number:true,
    			min:0,
    			required: true
    		},nightPrice:{
    			number:true,
    			min:0,
    			required: true
    		},timelyLong:{
    			digits:true,
    			required: true
    		},nightTimelyLong:{
    			digits:true,
    			required: true
    		} ,topDaily:{
    			digits:true
    		} ,topNight:{
    			digits:true
    		} 
    	};
    	valid.messages = {
    		name:{
    			rangelength:'名称长度应在[1,32]内', 
    			required: '请填写名称',
    			remote:'名称已经存在'
    		},beginTime:{ 
    			custom:'正确的开始时间如[19:00:00]',
    			required: '请填写开始时间如[19:00:00]'
    		},endTime:{ 
    			custom:'正确的结束时间如[19:00:00]',
    			required: '请填写结束时间如[19:00:00]'
    		},freeMins:{
    			digits:'免费时间需要为正整数',
    			min:'免费时间需要为正整数',
    			required: '请填写免费时长'
    		},firstHour:{
    			number:'首小时计费价格需要为正数',
    			min:'首小时计费价格需要为正数',
    			required: '请填写首小时计费价格'
    		},basePrice:{
    			number:'白天计费价格需要为正数',
    			min:'白天计费价格需要为正数',
    			required: '请填写白天计费价格'
    		},nightPrice:{
    			number:'夜间计费价格需要为正数',
    			min:'夜间计费价格需要为正数',
    			required: '请填写夜间计费价格'
    		},timelyLong:{
    			digits:'白天计费时间基数需要为正整数',
    			min:'免费时间需要为正整数',
    			required: '白天计费时间基数不为空'
    		},nightTimelyLong:{
    			digits:'夜间计费时间基数需要为正整数',
    			min:'夜间计费时间基数需要为正整数',
    			required: '夜间计费时间基数不为空'
    		} ,topDaily:{
    			digits:'全天封顶时长需为整数',
    			min:'全天封顶时长需为整数'
    		} ,topNight:{
    			min:'夜间封顶时长需为整数',
    			digits:'夜间封顶时长需为整数'
    		} 
    	}; 
    	param.validate = valid;
    	param.width = 800;
    	param.init = addInit;
    	layui.common.modal(param);  
    });
    
    
    var editInit = function(validate,lindex){  
		var list = datatable.selected();  
		layui.common.set({
			id:'fee-strategy-edit-form',
			data:list[0]
		});
		form.render('select'); 
		form.render('checkbox'); 
		form.on('select(type)', function(data) {
			var type = data.value;  
			$('#top-night-div').hide();
			$('#top-daily-div').hide();
			$('#top-day-input').val(''); 
			if(type==2||type==4||type==8||type==10){
				$('#top-daily-div').show();
			}else if(type==3||type==7){
				$('#top-day-input').val('0');
				$('#top-night-div').show();
			}
        });
		if(list[0].type==2||list[0].type==4||list[0].type==8 || list[0].type==10){
			$('#top-daily-div').show();
		}else if(list[0].type==3||list[0].type==7){
			$('#top-day-input').val('0');
			$('#top-night-div').show();
		}
		$('#fee-strategy-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		$('#fee-strategy-update-button').bind('click',function(){
        	if(validate.valid()){  
        		layui.common.ajax({
        			url:'/admin/biz/fee_strategy/update',
        			data:$('#fee-strategy-edit-form').serialize(),
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
    	valid.id = "fee-strategy-edit-form";
    	valid.rules = {
    		name:{
    			rangelength:[1,100] ,
    			required: true,
    			remote:{
    				url:"/admin/biz/fee_strategy/check",  
    				data:{
    					property:"name",
    					value:function(){return $('#fee-strategy-edit-form input[name=name]').val();},
    					id:function(){return $('#fee-strategy-edit-form input[name=id]').val();}
    				}
    			}
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
    		},freeMins:{
    			digits:true,
    			required: true
    		},firstHour:{
    			number:true,
    			min:0,
    			required: true
    		},basePrice:{
    			number:true,
    			min:0,
    			required: true
    		},nightPrice:{
    			number:true,
    			min:0,
    			required: true
    		},timelyLong:{
    			digits:true,
    			required: true
    		},nightTimelyLong:{
    			digits:true,
    			required: true
    		} ,topDaily:{
    			digits:true
    		} ,topNight:{
    			digits:true
    		} 
    	};
    	valid.messages = {
    		name:{
    			rangelength:'名称长度应在[1,32]内', 
    			required: '请填写名称',
    			remote:'名称已经存在'
    		},beginTime:{ 
    			custom:'正确的开始时间如[19:00:00]',
    			required: '请填写开始时间如[19:00:00]'
    		},endTime:{ 
    			custom:'正确的结束时间如[19:00:00]',
    			required: '请填写结束时间如[19:00:00]'
    		},freeMins:{
    			digits:'免费时间需要为正整数',
    			min:'免费时间需要为正整数',
    			required: '请填写免费时长'
    		},firstHour:{
    			number:'首小时计费价格需要为正数',
    			min:'首小时计费价格需要为正数',
    			required: '请填写首小时计费价格'
    		},basePrice:{
    			number:'白天计费价格需要为正数',
    			min:'白天计费价格需要为正数',
    			required: '请填写白天计费价格'
    		},nightPrice:{
    			number:'夜间计费价格需要为正数',
    			min:'夜间计费价格需要为正数',
    			required: '请填写夜间计费价格'
    		},timelyLong:{
    			digits:'白天计费时间基数需要为正整数',
    			min:'免费时间需要为正整数',
    			required: '白天计费时间基数不为空'
    		},nightTimelyLong:{
    			digits:'夜间计费时间基数需要为正整数',
    			min:'夜间计费时间基数需要为正整数',
    			required: '夜间计费时间基数不为空'
    		} ,topDaily:{
    			digits:'全天封顶时长需为整数',
    			min:'全天封顶时长需为整数'
    		} ,topNight:{
    			min:'夜间封顶时长需为整数',
    			digits:'夜间封顶时长需为整数'
    		} 
    	}; 
    	param.validate = valid;
    	param.width = 800;
    	param.init = editInit;
    	layui.common.modal(param);  
    });
});