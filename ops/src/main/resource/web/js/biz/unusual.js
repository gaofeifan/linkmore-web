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
	var addServerParams = function(data){   
		var searchType = $('#search-type').val();
		var filters = new Array();
		var filter = null; 
		if(searchType!=0){
			filter = new Object();
			filter.property = 'system';
			filter.value = searchType;
			filters.push(filter);
		}
		if(filters.length>0){
			data.push({name:'filterJson',value:JSON.stringify({filters:filters})});
		}
	};
	var draw = function(settings, json){
		$(".operation-detail").unbind('click').bind('click',showTempInfo);
	};
	function showTempInfo(){
		var id = $(this).attr('data-detail-id');
		$.each($("input[type='checkbox']"),function(index,item){
			$(this).prop("checked",false);
			$(this).parent().parent().parent().removeClass("odd active");
			$(this).parent().parent().parent().addClass("odd");
			if(item.value == id){
				$(this).prop("checked",true);
				console.log($(this).parent().parent().parent().addClass("odd active"));
			}
		})
		var list = datatable.selected(); 
		console.log(list);
		layer.open({
			  type: 1,
			  skin: 'layui-layer-demo', //样式类名
//			  closeBtn: 0, //不显示关闭按钮
			  anim: 2,
			  area: ['800px', '460px'], //宽高
			  shadeClose: true, //开启遮罩关闭
			  content: list[0].content
			});
		/*layer.open({
			  type: 1,
			  skin: '异常内容', //样式类名
			  closeBtn: 0, //不显示关闭按钮
			  anim: 2,
			  shadeClose: true, //开启遮罩关闭
			  content: 'xxx';
			});*/
	}

	var datatable = layui.datatable.init({
		id:'unusual-table',
		url:'/admin/common/unusual/list', 
		key:'id',
		columns:[ 
			{ sTitle: 'app版本',   mData: 'appVersion'},  
			{ sTitle: 'os版本',   mData: 'osVersion'},  
			{ sTitle: '型号',  mData: 'model'}, 
			{
				sTitle: '类型',
	          	mData: 'clientType' ,
	          	bSortable: true,
	          	mRender:function(mData,type,full){
	          		var html = '<label style="color:green;">小程序</label>';
	          		if(full.clientType==2){
	          			html = '<label style="color:green;">IOS</label>';
	          		}else if(full.clientType==1){
	          			html = '<label style="color:green;">Android</label>';
	          		}else{
	          			html = '<label style="color:green;">APP</label>';
	          		}
	          		return html;
	          	}
			},
			{
				sTitle: '系统',
	          	mData: 'system' ,
	          	bSortable: true,
	          	mRender:function(mData,type,full){ 
	          		var html = ''; 
	          			html = '<label style="color:green;">个人版</label>';
	          		if(full.system==3){
	          			html = '<label style="color:green;">管理版</label>';
	          		} else if(full.system==2){
	          			html = '<label style="color:green;">物业版</label>'; 
	          		}
	          		return html;
	          	}
			},
			{ sTitle: '级别',  mData: 'level'}, 
			{ sTitle: '品牌',  mData: 'brand'}, 
			{
				sTitle: '创建时间',
	          	mData: 'createTime' ,
	          	bSortable: true,
	          	mRender:function(mData,type,full){
	          		 return new Date(mData).format('yyyy-MM-dd hh:mm:ss');
	          	}
			},{
				sTitle: '操作',
	          	mRender:function(mData,type,full){
	          		return '<a class="operation-detail" data-detail-id="'+full.id+'" href="javascript:void(0);">查询内容</a>&nbsp;&nbsp;&nbsp;&nbsp;';
	          	}
			},{ sTitle: '内容',  mData: 'content',bVisible:false}
			,{ sTitle: 'id',  mData: 'id',bVisible:false}
		],
		orderIndex:8,
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
});