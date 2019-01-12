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
layui.use(['layer','msg','form', 'common','laydate', 'datatable' ], function() {
	var validate = layui.validate;
	var session = window.sessionStorage;
	var layer = layui.layer;  
	var $ = layui.jquery; 
	var form = layui.form;  
	var laydate = layui.laydate; 

	laydate.render({
	    elem: '#search-start',
	    min: '2015-06-16 23:59:59',
	    max: new Date().format('yyyy-MM-dd'),
		istoday: false
	});
	laydate.render({
	    elem: '#search-end',
	    min: '2015-06-16 23:59:59',
	    max: new Date().format('yyyy-MM-dd'),
		istoday: false
	}); 


	var prefHtml = '';
	var prefMap = layui.common.map();
	layui.common.ajax({
		url:'/admin/account/code-pre/selectAll',
		contentType: 'application/json; charset=utf-8',
		async:false,
		success:function(list){
			prefList = list;
			prefHtml = '<option value="N">选择专区</option>';
			$.each(list,function(index,pref){
				console.log(pref.parkCode);
				prefMap.put(pref.parkCode,pref);
				prefHtml += '<option value='+pref.parkCode+'>';
				prefHtml += pref.parkName;
				prefHtml += '</option>';
			});
			$('#search-pay-type').html(prefHtml);
			form.render('select');
		},error:function(){
			
		}
	});


	var draw = function(settings, json){
		console.log("绑定点击")
		$(".operation-detail").unbind('click').bind('click',showTempInfo);
		layui.common.ajax({
			url:'/admin/account/code-pre/selectAll',
			contentType:'application/json; charset=utf-8',
			async:false,
			success:function(res){
				console.log(res);
			},error:function(){
				
			}
		});
	};

	//数据回显
    var operation_log = function showData(logId,callback){
		console.log(logId);
    	layui.common.ajax({
			url:'/admin/account/code-pre/payList',
			data:logId,
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
	
	var tempId = null;
    var detailInit = function(validate,lindex){
    	operation_log(tempId,function(data){
    		var object = data;
    		layui.common.set({
    			id:'temp-detail-form',
    			data:object
			});
			
			var html = "";

			object.forEach(element => {
				html+='<tr role="row" class="odd">';
				html+='<td>'+element.payId +'</td>';
				if(element.payType==1){
					html+='<td>微信</td>';
				}else {
					html+='<td>支付宝</td>';
				}
				html+='<td>'+element.amount +'</td>';
				html+='<td>'+element.openId +'</td>';
				html+='<td>'+element.entranceTime +'</td>';
				html+='<td>'+element.finishTime +'</td>';
				html+='</tr>';
			});	

			$("#pay_list").html(html);
			console.log(html);
		});
		
    	$('#temp-cancel-detail-button').bind('click',function(){
    		layui.layer.close(lindex);
    	});
    }
	function showTempInfo(){
		tempId = $(this).attr('data-detail-id');
    	var param = new Object();
    	param.url = 'detail.html';
    	param.title = '支付详情'; 
    	var valid = new Object();
    	valid.id = "temp-detail-form";
    	param.width = 800;
    	param.init = detailInit;
    	layui.common.modal(param);
	}

  	  
	var addServerParams = function(data){   
		var filters = new Array();
		var filter = null;  
		
		var nickname = $('#search-plate').val();
		if(nickname!=''){
			filter = new Object();
			filter.property = 'plateNo';
			filter.value = '%'+nickname+'%';
			filters.push(filter);
		}
		var payType = $('#search-pay-type').val();
		if(payType!='N'){
			filter = new Object();
			filter.property = 'preId';
			filter.value = payType;
			filters.push(filter);
		}  
		var startTime = $('#search-start').val();
		if(startTime!=''){
			filter = new Object();
			filter.property = 'startTime';
			filter.value = startTime;
			filters.push(filter);
		} 
		var endTime = $('#search-end').val();
		if(endTime!=''){
			filter = new Object();
			filter.property = 'endTime';
			filter.value = endTime;
			filters.push(filter);
		}
		if(filters.length>0){
			data.push({name:'filterJson',value:JSON.stringify({filters:filters})});
		}
	};
	var datatable = layui.datatable.init({
		id:'amount-table',
		url:'/admin/account/code-pre/record',
		key:'id',
		columns:[ 
			{ sTitle: '订单编号',   mData: 'orderNo'},
			{ sTitle: '车区',   mData: 'parkName'}, 
			{ sTitle: '车牌号',   mData: 'plateNo'},
			{ 
				sTitle: '入场时间',   
				mData: 'entranceTime',
				mRender:function(mData,type,full){
					return new Date(mData).format('yyyy-MM-dd hh:mm');
	          	}
			},
			{ 
				sTitle: '最后结算时间',   
				mData: 'endTime',
				mRender:function(mData,type,full){
					return new Date(mData).format('yyyy-MM-dd hh:mm');
	          	}
			} ,{ 
				sTitle: '停车时长/分',   
				mData: 'time',
				mRender:function(mData,type,full){ 
					
						return mData;
					
	          	}
			}, { 
				sTitle: '实付金额/元',   
				mData: 'money',
				mRender:function(mData,type,full){ 
					
						return mData;
				
	          	}
			},
			{
				sTitle: '操作',
	          	mRender:function(mData,type,full){
					console.log(full.orderNo);
					var html = '<a class="operation-detail" data-detail-id="'+full.orderNo+'" href="javascript:void(0);">详情</a>&nbsp;&nbsp;&nbsp;&nbsp;';
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
	$('#search-button').bind('click',function(){
		query();
	}); 


	




});