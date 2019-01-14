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

var URL_BASE = "/admin/biz/user_version_group";
var URL_LIST = URL_BASE + "/list";
var URL_SAVE = URL_BASE + "/save";
var URL_DELETE = URL_BASE + "/delete";
var URL_GROUP_LIST = URL_BASE + "/group_list";


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
	
	
	var request = {
			QueryString : function(val) { 
				var uri = window.location.search; 
				var re = new RegExp("" +val+ "\=([^\&\?]*)", "ig"); 
				return ((uri.match(re))?(uri.match(re)[0].substr(val.length+1)):null); 
			}, 
			QueryStrings : function() { 
				var uri = window.location.search; 
				var re = /\w*\=([^\&\?]*)/ig; 
				var retval=[]; 
				while ((arr = re.exec(uri)) != null) 
					retval.push(arr[0]); 
				return retval; 
			}, 
			setQuery : function(val1, val2) { 
				var a = this.QueryStrings(); 
				var retval = ""; 
				var seted = false; 
				var re = new RegExp("^" +val1+ "\=([^\&\?]*)$", "ig"); 
				for(var i=0; i<a.length; i++) { 
					if (re.test(a[i])) { 
						seted = true; 
						a[i] = val1 +"="+ val2; 
					}
				}
				retval = a.join("&"); 
				return "?" +retval+ (seted ? "" : (retval ? "&" : "") +val1+ "=" +val2); 
			}
		}
	var versionId = decodeURI(request.QueryString("versionId"));
	
	var addServerParams = function(data){  
		var filters = new Array();
		var filter = null; 
		
		if(versionId != null){
			filter = new Object();
			filter.property = 'versionId';
			filter.value =versionId;
			filters.push(filter);
		}
		
		var searchGroupName = $('#search-group-name').val();
		if(searchGroupName!=''){
			filter = new Object();
			filter.property = 'name';
			filter.value = '%'+searchGroupName +'%';
			filters.push(filter);
		}
		
		var searchGroupType = $('#search-group-type').val();
		if(searchGroupType!=''){
			filter = new Object();
			filter.property = 'groupType';
			filter.value = searchGroupType;
			filters.push(filter);
		}
		
		
		if(filters.length>0){
			data.push({name:'filterJson',value:JSON.stringify({filters:filters})});
		}
	};


	
    

	var datatable = layui.datatable.init({
		id:'group-table',
		url:URL_LIST, 
		key:'id',
		columns:[
			{ sTitle: 'ID',   mData: 'id', bVisible:false}, 
			{ sTitle: '分组名称',   mData: 'name'}, 
			{ sTitle: '分组简介',   mData: 'content'},			
			{ sTitle: '类型',   mData: 'groupType',
	          	mRender:function(mData,type,full){
	          		var html = '<label style="color:gray">未知</label>';
	          		if(mData==0){
	          			html = '<label style="color:gray">默认</label>';
	          		}else if(mData==1){
	          			html = '<label style="color:blue">录入用户</label>'; 
	          		}else if(mData==2){
	          			html = '<label style="color:red">动态用户</label>'; 
	          		}else if(mData==3){
	          			html = '<label style="color:green">平台用户</label>'; 
	          		}	
	          		return html;
	          	}
			} ,
			{ sTitle: '操作人',   mData: 'createUserName'} ,
			{ sTitle: '创建(修改)时间',  
			  mData: 'createTime',
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

	$('#return-button').bind('click',function(){
		window.location.href="list.html";
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

		layui.msg.confirm('您确定要删除该分组吗？</br>确定删除请点击【确认】</br>放弃删除请点击【取消】。',function(){
			layui.common.ajax({
				url:URL_DELETE,
				data:JSON.stringify(ids),
				//type: 'DELETE',
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
		$("#versionId").val(versionId);
		layui.common.ajax({
			url: URL_GROUP_LIST,
			//contentType:'application/json; charset=utf-8',
			data:{versionId:versionId},
			//data: {versionId:versionId} ,
			success:function(data){
				if(data != null){
					$("#userGroupId").empty();
					for(var i=0;i<data.length;i++){
						$("#userGroupId").append("<option value='"+data[i].id+"'>"+data[i].name+"</option>");
					}
					form.render();
					//form.render('select');
				}
			},error:function(){
				
			}
		});


		$('#group-cancel-button').bind('click',function(){
			layui.msg.confirm('您确定要放弃添加该分组吗？</br>确定放弃请点击【确认】</br>不放弃添加请点击【取消】。',function(){
				layui.msg.close(lindex);
				layui.layer.close(lindex);
			});
		});

		$('#group-add-button').bind('click',function(){
	    	if(validate.valid()){

	    		var userGroupId = $('#userGroupId').val();
        		if(userGroupId == ''){
        			layui.msg.tips('请选择用户分组');
    				return;
        		}
        	//	layui.msg.confirm('您确定要添加该分组吗？</br>确定添加请点击【确认】</br>放弃添加请点击【取消】。',function(){
		    		layui.common.ajax({
		    			url:URL_SAVE,
		    			data:$('#group-add-form').serialize(),
		    			success:function(res){
		    				if(res.success){
		    					layui.layer.close(lindex);
		    					layui.msg.success(res.content);
		    					window.setTimeout(query,1000);
		    				}
		    			} 
		    		});
        	//	});
	    	}
		});
	};

    $('#add-button').bind('click',function(){
    	
    	var param = new Object();
    	param.url = 'user_group_add.html';
    	param.title = '添加信息'; 
    	var valid = new Object();
    	valid.id = "group-add-form";
    	valid.rules = {
    		versionId:{
    			rangelength:[2,30],
    			required: true
    		},content:{
    			rangelength:[1,30],  
    			required: false
    		}
    	};
    	valid.messages = {
    		versionId:{
    			required: '请选择分组',
    			rangelength:'名称长度应在[2,30]内'
    		},content:{
    			rangelength:'简介长度应在[1,30]内',
    			required: '请选择车位'
    		}
    	}; 
    	param.validate = valid;
    	param.width = 600;
    	param.init = addInit;
    	layui.common.modal(param);
    });
    
	
});