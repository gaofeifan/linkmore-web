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

layui.use(['layer','msg','form', 'common','validate'], function() {
	var validate = layui.validate; 
	var layer = layui.layer;
	var $ = layui.jquery; 
	var form = layui.form;
	var laydate = layui.laydate;
	var element = layui.element;
	
	var initPrefectureId=function(){
		layui.common.ajax({
			url:'/admin/biz/prefecture/selectListByUser',
			//contentType:'application/json; charset=utf-8',
			success:function(data){
				if(data!=null){
					arrayStrategyDate=data;
					$("#prefectureId").empty();
					for(var i=0;i<data.length;i++){
						$("#prefectureId").append("<option value='"+data[i].id+"'>"+data[i].name+"</option>");
					}
					form.render('select');
					//form.render();
					initStrategyFee();
				}
			},error:function(){
				
			}
		});
	}();
	
	$('#strategy-group-back-button').bind('click',function(){
		location.href='list.html';
	});
	
	$('#strategy-group-next-button').bind('click',function(){
		var prefectureId=$('#prefectureId').val();
		var name=$('#name').val();
		var parkingInterval=$('#parkingInterval').val();
		if (prefectureId == null){
			layui.msg.error('请选择车区');
			return false;
		}
		if (name.trim().length<=0 || name.trim().length>10){
			layui.msg.error('分组策略名称长度应该为【1-10】');
			return false;
		}
		if(parkingInterval.trim().length<=0){
			layui.msg.error('请输入车位间隔');
			return false;
		}
		var a = /^[0-9]*$/;
		if(! a.test(parkingInterval)){
			layui.msg.error('车位间隔应该是数字');
			return false;
		}
		if(parkingInterval<0){
			layui.msg.error('车位间隔应该大于或等于0');
			return false;
		}
		location.href='add2.html?name='+name+'&parkingInterval='+ parkingInterval+'&prefectureId='+ prefectureId;
	});




});