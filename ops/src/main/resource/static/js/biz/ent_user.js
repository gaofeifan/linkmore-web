layui.config({
	base: '/js/lib/'
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
layui.use(['layer','msg','form', 'common','validate','datatable','laydate'], function() {
	var validate = layui.validate; 
	var layer = layui.layer;  
	var $ = layui.jquery; 
	var form = layui.form;  
	var base_url = '/admin/biz/enterprise_user/';
	
	var addServerParams = function(data){   
		var userName = $('#search-mobile').val();
		var filters = new Array();
		var filter = null; 
		if(userName!=''){
			filter = new Object();
			filter.property = 'userName';
			filter.value = userName;
			filters.push(filter);
		} 
		if(filters.length>0){
			data.push({name:'filterJson',value:JSON.stringify({filters:filters})});
		}
	};
	
	var datatable = layui.datatable.init({
		id:'enterprise-user-table',
		url: base_url+'list', 
		key:'id',
		columns:[ 
			{ sTitle: '用户名',   mData: 'mobile'}, 
			{ sTitle: '车牌号',   mData: 'plateNo'}, 
			{
				sTitle: '导入时间',
	          	mData: 'createTime' ,
	          	bSortable: true,
	          	mRender:function(mData,type,full){
	          		 return new Date(mData).format('yyyy-MM-dd hh:mm');
	          	}
			} 
		],
		orderIndex:3,
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
		if(list.length != 1){
			layui.msg.error('请选择一条记录');
			return false;
		}
		var uid = list[0].id;
		layui.msg.confirm('您确定要删除',function(){
			layui.common.ajax({
				url: base_url+'delete',
				data:{'id':uid},
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
	
    var editInit = function(validate,lindex){  
		var list = datatable.selected();  
		layui.common.set({
			id:'ent-user-edit-form',
			data:list[0]
		});
		form.render('select'); 
		form.render('checkbox'); 
		$('#edit-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		$('#edit-update-button').bind('click',function(){
        	if(validate.valid()){  
        		layui.common.ajax({
        			url:base_url+ 'update',
        			data:$('#ent-user-edit-form').serialize(),
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
			layui.msg.error('请选择一条记录');
			return false;
		}
    	var param = new Object();
    	param.url = 'edit.html';
    	param.title = '编辑信息'; 
    	var valid = new Object();
    	valid.id = "ent-user-edit-form";
    	valid.rules = {
			plateNo:{
    			required: true,
    			isPlateNo:true
    		}
    	};
    	valid.messages = {
    			plateNo:{
    			required: '请填写名称',
    			isPlateNo:'请输入正确的车牌号'
    		}
    	}; 
    	param.validate = valid;
    	param.width = 600;
    	param.init = editInit;
    	layui.common.modal(param);  
    });
    
	// 导入临时用户
    var addFileInit = function(validate,lindex){    
		$('#excel-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		$('#excel-add-button').bind('click',function(){
			var data = new FormData($( "#excel-add-form" )[0]); 
			layui.common.upload({
				url:base_url+'excel', 
				data:data,
				success:function(res){
					if(res.success){   
						layui.layer.close(lindex);
			    		layui.msg.success(res.content);
    					window.setTimeout(query,1000);
					}else{
						layui.layer.close(lindex);
						layui.msg.error(res.content);
						window.setTimeout(query,1000);
					}
					
				} 
			}); 
        });
	};
	
	$('#import-button').bind('click',function(){
	    	var param = new Object();
	    	param.url = 'excel.html';
	    	param.title = '导入用户';  
	    	param.width = 600;
	    	param.init = addFileInit;
	    	layui.common.modal(param);  
    },null); 
	
	$('#export-button').bind('click',function(){ 
		var userName = $('#search-mobile').val();
		var data = new Object();
		if(userName ==''){
			data.userName = '-1';
		} else{
			data.userName = userName;
		}
        var url = base_url+'export';
        layui.common.download({
          url:url,
          data:data
        }); 
	}); 
	
});