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
    
    function getUrlParam(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
        var r = window.location.search.substr(1).match(reg);  //匹配目标参数
        if (r != null) return unescape(r[2]);
        return null; //返回参数值
    }

    var companyId = getUrlParam("companyId");
	
	var addServerParams = function(data){  
		var filters = new Array();
		var filter = null; 
		var searchStallName = $('#search-stall-name').val();
		if(searchStallName!=''){
			filter = new Object();
			filter.property = 'stallName';
			filter.value = '%'+searchStallName +'%';
			filters.push(filter);
		}
		
		if(companyId != ''){
			filter = new Object();
			filter.property = 'companyId';
			filter.value = companyId ;
			filters.push(filter);
		}
		
		if(filters.length>0){
			data.push({name:'filterJson',value:JSON.stringify({filters:filters})});
		}
	};
	
	$('#return-button').bind('click',function(){
		window.location.href="list.html";
	});
	
	var datatable = layui.datatable.init({
		id:'stall-table',
		url:'/admin/ent/rent-ent/stall-list-company', 
		key:'id',
		columns:[
			{ sTitle: 'ID',   mData: 'id', bVisible:false}, 
			/*{ sTitle: '公司名称',   mData: 'companyName'}, */
			{ sTitle: '车位名称',   mData: 'stallName'},  
			{ sTitle: '车区名称',   mData: 'preName'},  
			{ sTitle: '操作人',   mData: 'updateUserName'},
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
		orderIndex:5,
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
		layui.msg.confirm('您确定要删除车位吗？确定删除请点击确认，放弃删除请点击取消。',function(){
			layui.common.ajax({
				url:'/admin/ent/rent-ent/delete-stall',
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
		$('#stall-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
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
		$('#stall-add-button').bind('click',function(){
	    	if(validate.valid()){
	    		var names = new Array();
	    		var stallIds = new Array();
	    		$.each($("#stallIds").find("option:selected"),function(index){
	    			names.push($(this).text());
	    			stallIds.push($(this).val());
	    		})
	    		$("#stallNames").val(names);
	    		$("#id").val(companyId);
	    		layui.common.ajax({
	    			url:'/admin/ent/rent-ent/save-stall',
	    			data:$('#stall-add-form').serialize(),
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
    	param.url = 'stall_add.html';
    	param.title = '添加信息'; 
    	var valid = new Object();
    	valid.id = "stall-add-form";
    	valid.rules = {
    		stallIds:{
    			rangelength:[1,255],  
    			required: true
    		}
    	};
    	valid.messages = {
    		stallIds:{
    			rangelength:'请选择车位',  
    			required: '请选择车位'
    		}
    	}; 
    	param.validate = valid;
    	param.width = 600;
    	param.heigth = 400;
    	param.init = addInit;
    	layui.common.modal(param);  
    });
    
});