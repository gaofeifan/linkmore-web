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
		if(searchType!=''){
			filter = new Object();
			filter.property = 'type';
			filter.value = searchType;
			filters.push(filter);
		}
		if(filters.length>0){
			data.push({name:'filterJson',value:JSON.stringify({filters:filters})});
		}
	};
	
	 
    function download() {  
    	var id = $(this).attr('data-id');
        var url = '/admin/base/attachment/download';
        var data = new Object(); 
        data.id = id;
        layui.common.download({
          url:url,
          data: data
        });
    } 
    var draw = function(settings, json){
		$(".download-label").unbind('click').bind('click',download); 
	};
	var datatable = layui.datatable.init({
		id:'attachment-table',
		url:'/admin/base/attachment/list', 
		key:'id',
		columns:[ 
			{
				sTitle: '来源',
	          	mData: 'source' ,
	          	bSortable: true,
	          	mRender:function(mData,type,full){
	          		var html = '';
	          		if(full.source==0){
	          			html = '<label style="color:gray;">系统后台</label>';
	          		} else{
	          			html = '<label style="color:green;">其它平台</label>';
	          		}
	          		return html;
	          	}
			},
			{ sTitle: '文件名',   mData: 'name'},  
			{
				sTitle: '大小',
	          	mData: 'size' ,
	          	bSortable: true,
	          	mRender:function(mData,type,full){
	          		var html = '';
	          		html +=parseFloat( full.size/1000).toFixed(2);
	          		html += ' KB';
	          		return html;
	          	}
			},
			{
				sTitle: '类型',
	          	mData: 'type' ,
	          	bSortable: true,
	          	mRender:function(mData,type,full){
	          		var html = '';
	          		if(full.type==0){
	          			html = '<label style="color:gray;">图片</label>';
	          		} else{
	          			html = '<label style="color:green;">文件</label>';
	          		}
	          		return html;
	          	}
			},
			{
				sTitle: '创建时间',
	          	mData: 'createTime' ,
	          	bSortable: true,
	          	mRender:function(mData,type,full){
	          		 return new Date(mData).format('yyyy-MM-dd hh:mm');
	          	}
			} ,
			{
				sTitle: '下载',
	          	mData: 'suffix' , 
	          	width:50,
	          	mRender:function(mData,type,full){
	          		return '<a class="download-label"  data-id="'+full.id+'" href="javascript:void(0);">下载</a>';
	          	}
			} 
		],
		orderIndex:5,
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
	 
	$('#delete-button').bind('click',function(){
		var list = datatable.selected(); 
		if(list.length!=1){
			layui.msg.error('请选择一条记录');
			return false;
		} 
		layui.msg.confirm('您确定要删除',function(){
			layui.common.ajax({
				url:'/admin/base/attachment/delete',
				data:{id:list[0].id,time:new Date().getTime()}, 
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
	
	var addImageInit = function(validate,lindex){    
		$('#attachment-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		$('#attachment-add-button').bind('click',function(){
			var data = new FormData($( "#attachment-add-form" )[0]); 
			layui.common.upload({
				url:'/admin/base/attachment/image_upload',
				data:data,
				success:function(res){
					if(res.success){   
						layui.layer.close(lindex);
			    		layui.msg.success(res.content);
    					window.setTimeout(query,1000);
					}else{
						layui.msg.error(res.content);
					}
					
				} 
			}); 
        });
	};
	
    $('#add-image-button').bind('click',function(){
    	var param = new Object();
    	param.url = 'add_image.html';
    	param.title = '添加图片信息';  
    	param.width = 600;
    	param.init = addImageInit;
    	layui.common.modal(param);  
    });
    var addFileInit = function(validate,lindex){    
		$('#attachment-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		$('#attachment-add-button').bind('click',function(){
			var data = new FormData($( "#attachment-add-form" )[0]); 
			layui.common.upload({
				url:'/admin/base/attachment/file_upload',
				data:data,
				success:function(res){
					if(res.success){   
						layui.layer.close(lindex);
			    		layui.msg.success(res.content);
    					window.setTimeout(query,1000);
					}else{
						layui.msg.error(res.content);
					}
					
				} 
			}); 
        });
	};
	
    $('#add-file-button').bind('click',function(){
    	var param = new Object();
    	param.url = 'add_file.html';
    	param.title = '添加文件信息';  
    	param.width = 600;
    	param.init = addFileInit;
    	layui.common.modal(param);  
    });
     
});