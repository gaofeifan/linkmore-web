layui.config({
	base: '/web/js/lib/'
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
	var entMap = layui.common.map();
	var preMap = layui.common.map();

	// 企业列表
	var enterpriseHtml = '';
	layui.common.ajax({
		url:'/admin/biz/ent-brand-pre/ent-list',
		async:false,
		success:function(list){
			enterpriseHtml = '<option value="0">请选择</option>';
			$.each(list,function(index,ent){
				enterpriseHtml += '<option value="'+ent.id+'">';
				enterpriseHtml += ent.name;
				enterpriseHtml += '</option>';
				entMap.put(ent.id,ent.name);
			});
			$('#search-ent-id').html(enterpriseHtml);
			form.render('select');
		},error:function(){
		}
	});
	
	// 车区列表
	var preHtml = '';
	layui.common.ajax({
		url:'/admin/biz/ent-brand-pre/pre-list',
		async:false,
		success:function(list){
			preHtml = '<option value="0">选择车区</option>';
			$.each(list,function(index,pre){
				preHtml += '<option value="'+pre.id+'">';
				preHtml += pre.name;
				preHtml += '</option>';
				preMap.put(pre.id,pre.name);
			});
			$('#search-pre-id').html(preHtml);
			form.render('select');
		},error:function(){
		}
	});

	var addServerParams = function(data){  
		var filters = new Array();
		var filter = null; 
		var searchEntId = $('#search-ent-id').val();
		var searchPreId = $('#search-pre-id').val();
		var searchMobile = $('#search-mobile').val();
		if(searchEntId!='0'){
			filter = new Object();
			filter.property = 'entId';
			filter.value = searchEntId;
			filters.push(filter);
		} 
		if(searchPreId!='0'){
			filter = new Object();
			filter.property = 'preId';
			filter.value = searchPreId;
			filters.push(filter);
		} 
		if(searchMobile!=''){
			filter = new Object();
			filter.property = 'mobile';
			filter.value = '%'+searchMobile +'%';
			filters.push(filter);
		} 
		
		if(filters.length>0){
			data.push({name:'filterJson',value:JSON.stringify({filters:filters})});
		}
	};
	var datatable = layui.datatable.init({
		id:'applicant-table',
		url:'/admin/biz/ent-brand-applicant/list', 
		key:'id',
		columns:[ 
			{ sTitle: '企业名称',   mData: 'entId',
				mRender:function(mData,type,full){ 
	          		return entMap.get(mData);
	          	}
			},
			{ sTitle: '车区名称',   mData: 'preName'},
			{ sTitle: '用户名',   mData: 'username'},
			{ sTitle: '手机号',   mData: 'mobile' },
			{ sTitle: '车牌号',   mData: 'plateNo'},
			{
				sTitle: '创建时间',
	          	mData: 'createTime' ,
	          	bSortable: true,
	          	mRender:function(mData,type,full){
					if(mData != null){
						return new Date(mData).format('yyyy-MM-dd');
					}else {
						return "";
					}
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
    
});