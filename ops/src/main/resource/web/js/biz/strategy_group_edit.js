layui.config({
	base: '/web/js/lib/'
}).extend({ 
	msg:'msg',
	common:'common'
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

layui.use(['layer','msg','form', 'common','element'], function() {

	var layer = layui.layer;
	var $ = layui.jquery; 
	var form = layui.form;

	var element = layui.element;
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

		if(filters.length>0){
			data.push({name:'filterJson',value:JSON.stringify({filters:filters})});
		}
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
	var strategyGroupId=decodeURI(request.QueryString("strategyGroupId"))
	var stragegyGroupName=decodeURI(request.QueryString("stragegyGroupName"))
	var prefectureId=decodeURI(request.QueryString("prefectureId"))
	//alert(stragegyGroupName+'--'+parkingInterval);

	$("#stragegyGroupName").html("策略名称："+stragegyGroupName);

	layui.common.ajax({
		url:'/admin/biz/strategy/group/area/list',
		contentType:'application/json; charset=utf-8',
		data:JSON.stringify(strategyGroupId),
		success:function(res){
			if(res!=null){
				callback(res);
			}else{
				layui.msg.error("没有数据");
			}
		},error:function(){
			layui.msg.error("网络异常");
		}
	});
	
	var callback=function(res){
		var len=res.length;
		for (var i=0;i<len;i++){

			var html='<div style="width:30%;margin:5px 5px 5px 5px ;padding:5 auto;height: 300px;float:left;display:inline; border:1px solid #009688;">';
			html+='<div class="layui-row" style="width:100%;margin:0px auto;padding:0 auto;height: 30px;text-align:center; background:#009688;color:#fff;">';
			html+=res[i].areaName+'区';
			html+='</div>';
			html+='<div style="width:100%;margin:0px auto;padding:0 auto;height: 90%;text-align:left;overflow-y: scroll;">';
			
			var subhtml="";
			for(var j=0;j<res[i].strategyGroupDetail.length;j++){
				subhtml+='<input type="checkbox" name="stall" title="'+res[i].strategyGroupDetail[j].stallName+'" value="' +res[i].strategyGroupDetail[j].id + '" >';
			}
			/*
			for(var j=0;j<50;j++){
				subhtml+='<input type="checkbox" name="stall" title="A'+i+'_000'+j+'" >';
			}
			 */
			html+=subhtml+'</div></div>';

			$("#stall_div").append(html);
		}
		form.render();
	}

	$('#strategy-group-back-button').bind('click',function(){
		history.back(-1);
		//location.href='add1.html';
	});
	
	$('#strategy-group-add-button').bind('click',function(){
		var stallName=$('#stall-name').val();
		
		
		layui.common.ajax({
			url:'/admin/biz/strategy/group/stall/exists',
			data: {prefectureId:prefectureId, strategyGroupId:strategyGroupId,stallName:stallName},
			success:function(res){
				if(res!=null){
					if(res>0){
						
						layui.msg.confirm('您确定要添加【'+stallName+'】这个车位吗?</br>确定添加请点击【确认】</br>不添加请点击【取消】',function(){

							layui.common.ajax({
								url:'/admin/biz/strategy/group/stall/add',
								data:{stallId:res,strategyGroupId:strategyGroupId},//JSON.stringify(res),
								//contentType:'application/json; charset=utf-8',
								success:function(res){
									if(res.success){
										layui.msg.success(res.content);
										//window.setTimeout(query,1000);
										window.setTimeout(function(){ window.location.reload(); },2000);
									}else{
										layui.msg.error(res.content);
									}
								},error:function(){
									
								}
							});
						});

					}else{
						layui.msg.error("该车位不存在，或已经在某个分组中.");
					}
				}else{
					layui.msg.error("没有数据");
				}
			},error:function(){
				layui.msg.error("网络异常");
			}
		});
		
	});

	$('#strategy-group-delete-button').bind('click',function(){ 
		var count=$('input[name="stall"]:checked').size();
		if(count<=0){
			//layui.msg.error("您还没有选择车位");
			layer.msg('您没有选择任何车位', {
				  shift: 6,icon: 5
				}, function(){});
			
			return false;
		}
		
		var ids = new Array();
		$.each($('input[name="stall"]:checked'),function(){
			ids.push($(this).val());
        });
		
		layui.msg.confirm('您确定要删除这'+count+'个车位吗?</br>确定删除请点击【确认】</br>不删除请点击【取消】',function(){
			layer.msg('删除车位', {
				  shift: 1,icon: 1
				}, function(){});
        
			layui.common.ajax({
				url:'/admin/biz/strategy/group/stall/delete',
				data:JSON.stringify(ids),
				contentType:'application/json; charset=utf-8',
				success:function(res){
					if(res.success){
						layui.msg.success(res.content);
						//window.setTimeout(query,1000);
						window.setTimeout(function(){ window.location.reload(); },2000);
					}else{
						layui.msg.error(res.content);
					}
				},error:function(){
					
				}
			});
			
			
		});
	});

	
	

	var query =  function(){
		var searchName=$("#search-name").val();
		// $("#select2").find("option:contains('"+searchName+"')").attr("selected",true);
		$("#select2 option").each(function() {
			val = $(this).val();
			text = $(this).text();
			if(searchName==text){
				$(this).attr("selected",true);
				$(this).selected = true;
			}else{
				$(this).attr("selected",false);
				$(this).removeAttr("selected");
			}
		});

	};
	
	$('.search_btn').bind('click',function(){
		query();
	});

});