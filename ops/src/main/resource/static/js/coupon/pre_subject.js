layui.config({
	base: 'js/lib/'
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
	var session = window.sessionStorage;
	var layer = layui.layer;  
	var $ = layui.jquery; 
	var form = layui.form;
	
	var prefHtml = '';
	var prefList = null;
	var prefMap = layui.common.map();
	layui.common.ajax({
		url:'/admin/biz/prefecture/selectList',
		data:{time:new Date().getTime()}, 
		async:false,
		success:function(list){
			prefList = list;
			prefHtml = '<option value="0"></option>';
			$.each(list,function(index,pref){
				prefMap.put(pref.id,pref);
				prefHtml += '<option value="'+pref.id+'">';
				prefHtml += pref.name;
				prefHtml += '</option>';
			});
			$('#search-prefecture').html(prefHtml);
			form.render('select');
		},error:function(){
			
		}
	});
	
	var subjectHtml = '';
	var subjectList = null;
	var subjectMap = layui.common.map();
	layui.common.ajax({
		url:'/admin/coupon_pre_subject/subject_list',
		data:{comboType:3,time:new Date().getTime()}, 
		async:false,
		success:function(list){
			subjectList = list;
			subjectHtml = '<option value="0">选择类型</option>';
			$.each(list,function(index,subject){
				subjectMap.put(subject.id,subject);
				subjectHtml += '<option value="'+subject.id+'">';
				subjectHtml += subject.title;
				subjectHtml += '</option>';
			});
		},error:function(){
			
		}
	});
	
	
	var addServerParams = function(data){  
		/*var preName = $('#search-pre-name').val();
		var filters = new Array();
		var filter = null; 
		if(preName!=''){
			filter = new Object();
			filter.property = 'preName';
			filter.value = '%'+preName +'%';
			filters.push(filter);
		}*/
		
		var preId = $('#search-prefecture').val();
		var filters = new Array();
		var filter = null; 
		if(preId!=0){
			filter = new Object();
			filter.property = 'preId';
			filter.value = preId;
			filters.push(filter);
		}
		if(filters.length>0){
			data.push({name:'filterJson',value:JSON.stringify({filters:filters})});
		}
	};
	
	var datatable = layui.datatable.init({
		id:'pre-subject-table',
		url:'/admin/coupon_pre_subject/list', 
		key:'id',
		columns:[ 
			{ sTitle: '车区',   mData: 'preId' ,
	          	mRender:function(mData,type,full){ 
	          		var pre = prefMap.get(mData);
	          		var html = '';
	          		if(pre!=null){
	          			html = pre.name;
	          		}
	          		return html;
	          	}
			} ,
			{ sTitle: '支付领券标题',   mData: 'payTitle'}, 
			{ sTitle: '支付领券额度',   mData: 'payOneReceive' ,
	          	mRender:function(mData,type,full){
	          		var html ='';
	          		html += full.payOneReceive +'<br>'+ full.payTwoReceive +'<br>'+ full.payThreeReceive
	          		return html;
	          	}
			} ,
			{ sTitle: '本人领取额度',   mData: 'oneselfReceive'}, 
			{ sTitle: '他人领取额度',   mData: 'otherReceive'}, 
			{ sTitle: '专题名称',   mData: 'subjectId' ,
	          	mRender:function(mData,type,full){ 
	          		var subject = subjectMap.get(mData);
	          		var html = '';
	          		if(subject!=null){
	          			html = subject.title;
	          		}
	          		return html;
	          	}
			} ,
			{ sTitle: '创建人',   mData: 'operatorName'}, 
			{
				sTitle: '创建时间',
	          	mData: 'createTime' ,
	          	bSortable: true,
	          	mRender:function(mData,type,full){
	          		 return new Date(mData).format('yyyy-MM-dd hh:mm');
	          	}
			}
		],
		orderIndex:8,
		orderType:'desc',
		filter:addServerParams
	});  
	
	var query =  function(){
		datatable.reload();
		
	} ;  
	$('#search-button').bind('click',function(){
		query();
	});  
	 
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
		layui.msg.confirm('您确定要删除',function(){
			layui.common.ajax({
				url:'/admin/coupon_pre_subject/delete',
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
		$('#pre-subject-add-form select[name=preId]').html(prefHtml);
    	$('#pre-subject-add-form select[name=subjectId]').html(subjectHtml);
		form.render('select');
		form.render('radio');
		$('#pre-subject-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		
		form.on('radio(oneselfType)', function(data){
			var oneselfType = data.value;
		    if(oneselfType==1){
			   $("#add_oneselfMin").removeAttr("readonly");
			   $("#add_oneselfMax").removeAttr("readonly");
			   $("#add_oneselfFixe").attr("readonly","readonly");
			   $("#add_oneselfFixe").val("");
		    }else{
			   $("#add_oneselfFixe").removeAttr("readonly");
			   $("#add_oneselfMin").attr("readonly","readonly");
			   $("#add_oneselfMax").attr("readonly","readonly");
			   $("#add_oneselfMin").val("");
			   $("#add_oneselfMax").val("");
		    }
		});
		
		form.on('radio(otherType)', function(data){
			var otherType = data.value;
			if(otherType==1){
				  $("#add_otherMin").removeAttr("readonly");
				  $("#add_otherMax").removeAttr("readonly");
				  $("#add_otherFixe").attr("readonly","readonly");
				  $("#add_otherFixe").val("");
			}else{
				  $("#add_otherFixe").removeAttr("readonly");
				  $("#add_otherMin").attr("readonly","readonly");
				  $("#add_otherMax").attr("readonly","readonly");
				  $("#add_otherMin").val("");
				  $("#add_otherMax").val("");
			}
		});
		
		$('#pre-subject-add-button').bind('click',function(){
			var preId = $('#pre-subject-add-form select[name=preId]').val();
    		var subjectId = $('#pre-subject-add-form select[name=subjectId]').val();
    		
    		var oneselfType = $('#pre-subject-add-form input[name="oneselfType"]:checked').val();
    		var otherType = $('#pre-subject-add-form input[name="otherType"]:checked').val();
    		
    		var oneselfMin = $('input[name="oneselfMin"]').val();
    		var oneselfMax = $('input[name="oneselfMax"]').val();
    		var oneselfFixe = $('input[name="oneselfFixe"]').val();
    		
    		var otherMin = $('input[name="otherMin"]').val();
    		var otherMax = $('input[name="otherMax"]').val();
    		var otherFixe = $('input[name="otherFixe"]').val();
    		
    		var denomainOneMin = $('input[name="denomainOneMin"]').val();
        	var denomainOneMax = $('input[name="denomainOneMax"]').val();
        	var denomainOneProp = $('input[name="denomainOneProp"]').val();
        	var denomainTwoMin = $('input[name="denomainTwoMin"]').val();
        	var denomainTwoMax = $('input[name="denomainTwoMax"]').val();
        	var denomainTwoProp = $('input[name="denomainTwoProp"]').val();
        	var denomainThreeMin = $('input[name="denomainThreeMin"]').val();
        	var denomainThreeMax = $('input[name="denomainThreeMax"]').val();
        	var denomainThreeProp = $('input[name="denomainThreeProp"]').val();
    		
    		if(preId == 0){
    			layui.msg.error('请选择车区!');
    			return false;
    		}
    		if(subjectId == 0){
    			layui.msg.error('请选择专题!');
    			return false;
    		}
    		
        	if(validate.valid()){
        		
        		if(oneselfType==1){
    				if(oneselfMin == "" || oneselfMax == ""){
    					layui.msg.error('请填写本人上下限额度!');
    	    			return false;
    				}
    				if(parseInt(oneselfMax) <= parseInt(oneselfMin)){
    					layui.msg.error('请输入本人正确范围的上下限额度');
    	    			return false;
    				}
    			}else{
    				if(oneselfFixe == ""){
    					layui.msg.error('请输入本人固定额度!');
    	    			return false;
    				}
    			}
    			
    			if(otherType==1){
    				if(otherMin == "" || otherMax == ""){
    					layui.msg.error('请输入他人上下限额度!');
    	    			return false;
    				}
    				if(parseInt(otherMax) <= parseInt(otherMin)){
    					layui.msg.error('请输入他人正确范围的上下限额度');
    	    			return false;
    				}
    			}else{
    				if(otherFixe == ""){
    					layui.msg.error('请输入他人固定额度!');
    	    			return false;
    				}
    			}
    			
    			if(parseFloat(denomainOneMax) <= parseFloat(denomainOneMin)){
    				layui.msg.error('支付领券面额1的最小值不能大于最大值');
	    			return false;
    			}
    			
    			if(parseFloat(denomainTwoMax) <= parseFloat(denomainTwoMin)){
    				layui.msg.error('支付领券面额2的最小值不能大于最大值');
	    			return false;
    			}
    			
    			if(parseFloat(denomainThreeMax) <= parseFloat(denomainThreeMin)){
    				layui.msg.error('支付领券面额3的最小值不能大于最大值');
	    			return false;
    			}
    			
    			if(parseFloat(denomainTwoMin) <= parseFloat(denomainOneMax)){
    				layui.msg.error('支付领券面额1的最大值不能大于面额2的最小值');
	    			return false;
    			}
        		
    			if(parseFloat(denomainThreeMin) <= parseFloat(denomainTwoMax)){
    				layui.msg.error('支付领券面额2的最大值不能大于面额3的最小值');
	    			return false;
    			}
    			
    			if(parseInt(denomainOneProp)+parseInt(denomainTwoProp)+parseInt(denomainThreeProp)!=100){
    				layui.msg.error('支付领券3种面额占比之和不等于100');
	    			return false;
    			}
        		
        		layui.common.ajax({
        			url:'/admin/coupon_pre_subject/save',
        			data:$('#pre-subject-add-form').serialize(),
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
        	}
        });
	};
	
    $('#add-button').bind('click',function(){
    	var param = new Object();
    	param.url = 'add.html';
    	param.title = '添加信息'; 
    	var valid = new Object();
    	valid.id = "pre-subject-add-form";
    	valid.rules = {
    		payTitle:{
    			rangelength:[1,20] ,
    			required: true,
    			remote:{
    				url:"/admin/coupon_pre_subject/check",  
    				data:{
    					property:"pay_title",
    					value:function(){return $('#pre-subject-add-form input[name=payTitle]').val();},
    					id:function(){return new Date().getTime();}
    				}
    			}
    		},
	    	oneselfMin: {
				digits:true,
		 		rangelength: [1,3]
		 	},
		 	oneselfMax:{
		 		digits:true,
		 		rangelength: [1,3]
		 	},
		 	oneselfFixe:{
		 		digits:true,
		 		rangelength: [1,3]
		 	},
		 	oneselfValidity:{
		 		required:true,
		 		digits:true,
		 		rangelength:[1,3]
		 	},
		 	otherMin:{
		 		digits:true,
		 		rangelength: [1,3]
		 	},
		 	otherMax:{
		 		digits:true,
		 		rangelength: [1,3]
		 	},
		 	otherFixe:{
		 		digits:true,
		 		rangelength: [1,3]
		 	},
		 	otherValidity:{
		 		required:true,
		 		digits:true,
		 		rangelength:[1,3]
		 	},
		 	content:{
		 		required: true,
		 		rangelength: [1,100]
		 	},
		 	payValidity:{
		 		required:true,
		 		digits:true,
		 		rangelength:[1,3]
		 	},
		 	
		 	denomainOneMin:{
		 		required:true,
		 		rangelength:[1,3]
		 	},
		 	denomainOneMax:{
		 		required:true,
		 		rangelength:[1,3]
		 	},
		 	denomainOneProp:{
		 		required:true,
		 		digits:true,
		 		rangelength:[1,3]
		 	},
		 	denomainTwoMin:{
		 		required:true,
		 		rangelength:[1,3]
		 	},
		 	denomainTwoMax:{
		 		required:true,
		 		rangelength:[1,3]
		 	},
		 	denomainTwoProp:{
		 		required:true,
		 		digits:true,
		 		rangelength:[1,3]
		 	},
		 	denomainThreeMin:{
		 		required:true,
		 		rangelength:[1,3]
		 	},
		 	denomainThreeMax:{
		 		required:true,
		 		rangelength:[1,3]
		 	},
		 	denomainThreeProp:{
		 		required:true,
		 		digits:true,
		 		rangelength:[1,3]
		 	}
    		
    	};
    	valid.messages = {
    		payTitle:{
    			rangelength:'标题长度应在[1,20]内', 
    			required: '请输入标题',
    			remote:'名称已经存在'
    		},
    		oneselfMin: {
				digits:'请输入正确格式的下限额度',
		 		rangelength: '下限额度长度为1~3'
		 	},
		 	oneselfMax:{
		 		digits:'请输入正确格式的上限额度',
		 		rangelength: '上限额度长度为1~3'
		 	},
		 	oneselfFixe:{
		 		digits:'请输入正确格式的固定额度',
		 		rangelength: '固定额度长度为1~3'
		 	},
		 	otherMin:{
		 		digits:'请输入正确格式的下限额度',
		 		rangelength: '下限额度长度为1~3'
		 	},
		 	otherMax:{
		 		digits:'请输入正确格式的上限额度',
		 		rangelength: '上限额度长度为1~3'
		 	},
		 	otherFixe:{
		 		digits:'请输入正确格式的固定额度',
		 		rangelength: '固定额度长度为1~3'
		 	},
		 	content:{
		 		required: '请输入文案',
		 		rangelength: '文案长度为1~100'
		 	},
		 	oneselfValidity: {
				digits:'请输入正确格式的有效期',
		 		rangelength: '有效期长度为1~3',
		 		required: '请输入有效期',
		 	},
		 	otherValidity: {
				digits:'请输入正确格式的有效期',
		 		rangelength: '有效期长度为1~3',
		 		required: '请输入有效期',
		 	},
		 	denomainOneMin:{
		 		rangelength: '面额1最小值长度为1~3',
		 		required: '请输入面额1最小值'
		 	},
		 	denomainOneMax:{
		 		rangelength: '面额1最大值长度为1~3',
		 		required: '请输入面额1最大值'
		 	},
		 	denomainOneProp:{
		 		rangelength: '面额1占比长度为1~3',
		 		required: '请输入面额1占比'
		 	},
		 	denomainTwoMin:{
		 		rangelength: '面额1最小值长度为1~3',
		 		required: '请输入面额2最小值'
		 	},
		 	denomainTwoMax:{
		 		rangelength: '面额1最大值长度为1~3',
		 		required: '请输入面额2最大值'
		 	},
		 	denomainTwoProp:{
		 		rangelength: '面额1占比长度为1~3',
		 		required: '请输入面额2占比'
		 	},
		 	denomainThreeMin:{
		 		rangelength: '面额3最小值长度为1~3',
		 		required: '请输入面额3最小值'
		 	},
		 	denomainThreeMax:{
		 		rangelength: '面额3最大值长度为1~3',
		 		required: '请输入面额3最大值'
		 	},
		 	denomainThreeProp:{
		 		rangelength: '面额3占比长度为1~3',
		 		required: '请输入面额3占比'
		 	},
		 	payValidity:{
		 		rangelength: '有效期长度为1~3',
		 		required: '请输入有效期'
		 	}
    		
    	}; 
    	param.validate = valid;
    	param.width = 980;
    	param.init = addInit;
    	layui.common.modal(param); 
    });
    
    
    var editInit = function(validate,lindex){
    	$('#pre-subject-edit-form select[name=preId]').html(prefHtml);
    	$('#pre-subject-edit-form select[name=subjectId]').html(subjectHtml);
    	var list = datatable.selected();  
		layui.common.set({
			id:'pre-subject-edit-form',
			data:list[0]
		});
		
		var oneselfType = list[0].oneselfType;
		var otherType = list[0].otherType;
		if(oneselfType==1){
		   $("#add_oneselfMin").removeAttr("readonly");
		   $("#add_oneselfMax").removeAttr("readonly");
		   $("#add_oneselfFixe").attr("readonly","readonly");
		   $("#add_oneselfFixe").val("");
	    }else{
		   $("#add_oneselfFixe").removeAttr("readonly");
		   $("#add_oneselfMin").attr("readonly","readonly");
		   $("#add_oneselfMax").attr("readonly","readonly");
		   $("#add_oneselfMin").val("");
		   $("#add_oneselfMax").val("");
	    }
		
		if(otherType==1){
			  $("#add_otherMin").removeAttr("readonly");
			  $("#add_otherMax").removeAttr("readonly");
			  $("#add_otherFixe").attr("readonly","readonly");
			  $("#add_otherFixe").val("");
		}else{
			  $("#add_otherFixe").removeAttr("readonly");
			  $("#add_otherMin").attr("readonly","readonly");
			  $("#add_otherMax").attr("readonly","readonly");
			  $("#add_otherMin").val("");
			  $("#add_otherMax").val("");
		}
		
		form.render('select');
		form.render('radio');
		
		$('#pre-subject-cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		
		form.on('radio(oneselfType)', function(data){
			var oneselfType = data.value;
		    if(oneselfType==1){
			   $("#add_oneselfMin").removeAttr("readonly");
			   $("#add_oneselfMax").removeAttr("readonly");
			   $("#add_oneselfFixe").attr("readonly","readonly");
			   $("#add_oneselfFixe").val("");
		    }else{
			   $("#add_oneselfFixe").removeAttr("readonly");
			   $("#add_oneselfMin").attr("readonly","readonly");
			   $("#add_oneselfMax").attr("readonly","readonly");
			   $("#add_oneselfMin").val("");
			   $("#add_oneselfMax").val("");
		    }
		});
		
		form.on('radio(otherType)', function(data){
			var otherType = data.value;
			if(otherType==1){
				  $("#add_otherMin").removeAttr("readonly");
				  $("#add_otherMax").removeAttr("readonly");
				  $("#add_otherFixe").attr("readonly","readonly");
				  $("#add_otherFixe").val("");
			}else{
				  $("#add_otherFixe").removeAttr("readonly");
				  $("#add_otherMin").attr("readonly","readonly");
				  $("#add_otherMax").attr("readonly","readonly");
				  $("#add_otherMin").val("");
				  $("#add_otherMax").val("");
			}
		});
    	
		$('#pre-subject-edit-button').bind('click',function(){
			
			var preId = $('#pre-subject-edit-form select[name=preId]').val();
    		var subjectId = $('#pre-subject-edit-form select[name=subjectId]').val();
    		
    		var oneselfType = $('#pre-subject-edit-form input[name="oneselfType"]:checked').val();
    		var otherType = $('#pre-subject-edit-form input[name="otherType"]:checked').val();
    		
    		var oneselfMin = $('input[name="oneselfMin"]').val();
    		var oneselfMax = $('input[name="oneselfMax"]').val();
    		var oneselfFixe = $('input[name="oneselfFixe"]').val();
    		
    		var otherMin = $('input[name="otherMin"]').val();
    		var otherMax = $('input[name="otherMax"]').val();
    		var otherFixe = $('input[name="otherFixe"]').val();
    		
    		var denomainOneMin = $('input[name="denomainOneMin"]').val();
        	var denomainOneMax = $('input[name="denomainOneMax"]').val();
        	var denomainOneProp = $('input[name="denomainOneProp"]').val();
        	var denomainTwoMin = $('input[name="denomainTwoMin"]').val();
        	var denomainTwoMax = $('input[name="denomainTwoMax"]').val();
        	var denomainTwoProp = $('input[name="denomainTwoProp"]').val();
        	var denomainThreeMin = $('input[name="denomainThreeMin"]').val();
        	var denomainThreeMax = $('input[name="denomainThreeMax"]').val();
        	var denomainThreeProp = $('input[name="denomainThreeProp"]').val();
    		
    		if(preId == 0){
    			layui.msg.error('请选择车区!');
    			return false;
    		}
    		if(subjectId == 0){
    			layui.msg.error('请选择专题!');
    			return false;
    		}
			
        	if(validate.valid()){
        		
        		if(oneselfType==1){
    				if(oneselfMin == "" || oneselfMax == ""){
    					layui.msg.error('请填写本人上下限额度!');
    	    			return false;
    				}
    				if(parseInt(oneselfMax) <= parseInt(oneselfMin)){
    					layui.msg.error('请输入本人正确范围的上下限额度');
    	    			return false;
    				}
    			}else{
    				if(oneselfFixe == ""){
    					layui.msg.error('请输入本人固定额度!');
    	    			return false;
    				}
    			}
    			
    			if(otherType==1){
    				if(otherMin == "" || otherMax == ""){
    					layui.msg.error('请输入他人上下限额度!');
    	    			return false;
    				}
    				if(parseInt(otherMax) <= parseInt(otherMin)){
    					layui.msg.error('请输入他人正确范围的上下限额度');
    	    			return false;
    				}
    			}else{
    				if(otherFixe == ""){
    					layui.msg.error('请输入他人固定额度!');
    	    			return false;
    				}
    			}
    			
    			if(parseFloat(denomainOneMax) <= parseFloat(denomainOneMin)){
    				layui.msg.error('支付领券面额1的最小值不能大于最大值');
	    			return false;
    			}
    			
    			if(parseFloat(denomainTwoMax) <= parseFloat(denomainTwoMin)){
    				layui.msg.error('支付领券面额2的最小值不能大于最大值');
	    			return false;
    			}
    			
    			if(parseFloat(denomainThreeMax) <= parseFloat(denomainThreeMin)){
    				layui.msg.error('支付领券面额3的最小值不能大于最大值');
	    			return false;
    			}
    			
    			if(parseFloat(denomainTwoMin) <= parseFloat(denomainOneMax)){
    				layui.msg.error('支付领券面额1的最大值不能大于面额2的最小值');
	    			return false;
    			}
        		
    			if(parseFloat(denomainThreeMin) <= parseFloat(denomainTwoMax)){
    				layui.msg.error('支付领券面额2的最大值不能大于面额3的最小值');
	    			return false;
    			}
    			
    			if(parseInt(denomainOneProp)+parseInt(denomainTwoProp)+parseInt(denomainThreeProp)!=100){
    				layui.msg.error('支付领券3种面额占比之和不等于100');
	    			return false;
    			}
    			
        		layui.common.ajax({
        			url:'/admin/coupon_pre_subject/update',
        			data:$('#pre-subject-edit-form').serialize(),
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
    	valid.id = "pre-subject-edit-form";
    	valid.rules = {
    		payTitle:{
				rangelength:[1,20] ,
				required: true,
				remote:{
					url:"/admin/coupon_pre_subject/check",  
					data:{
						property:"pay_title",
						value:function(){return $('#pre-subject-edit-form input[name=payTitle]').val();},
						id:function(){return $('#pre-subject-edit-form input[name=id]').val();}
					}
				}
			},
			oneselfMin: {
				digits:true,
		 		rangelength: [1,3]
		 	},
		 	oneselfMax:{
		 		digits:true,
		 		rangelength: [1,3]
		 	},
		 	oneselfFixe:{
		 		digits:true,
		 		rangelength: [1,3]
		 	},
		 	oneselfValidity:{
		 		required:true,
		 		digits:true,
		 		rangelength:[1,3]
		 	},
		 	otherMin:{
		 		digits:true,
		 		rangelength: [1,3]
		 	},
		 	otherMax:{
		 		digits:true,
		 		rangelength: [1,3]
		 	},
		 	otherFixe:{
		 		digits:true,
		 		rangelength: [1,3]
		 	},
		 	otherValidity:{
		 		required:true,
		 		digits:true,
		 		rangelength:[1,3]
		 	},
		 	content:{
		 		required: true,
		 		rangelength: [1,100]
		 	},
		 	payValidity:{
		 		required:true,
		 		digits:true,
		 		rangelength:[1,3]
		 	},
		 	
		 	denomainOneMin:{
		 		required:true,
		 		rangelength:[1,3]
		 	},
		 	denomainOneMax:{
		 		required:true,
		 		rangelength:[1,3]
		 	},
		 	denomainOneProp:{
		 		required:true,
		 		digits:true,
		 		rangelength:[1,3]
		 	},
		 	denomainTwoMin:{
		 		required:true,
		 		rangelength:[1,3]
		 	},
		 	denomainTwoMax:{
		 		required:true,
		 		rangelength:[1,3]
		 	},
		 	denomainTwoProp:{
		 		required:true,
		 		digits:true,
		 		rangelength:[1,3]
		 	},
		 	denomainThreeMin:{
		 		required:true,
		 		rangelength:[1,3]
		 	},
		 	denomainThreeMax:{
		 		required:true,
		 		rangelength:[1,3]
		 	},
		 	denomainThreeProp:{
		 		required:true,
		 		digits:true,
		 		rangelength:[1,3]
		 	}
		};
		valid.messages = {
				payTitle:{
	    			rangelength:'标题长度应在[1,20]内', 
	    			required: '请输入标题',
	    			remote:'名称已经存在'
	    		},
	    		oneselfMin: {
					digits:'请输入正确格式的下限额度',
			 		rangelength: '下限额度长度为1~3'
			 	},
			 	oneselfMax:{
			 		digits:'请输入正确格式的上限额度',
			 		rangelength: '上限额度长度为1~3'
			 	},
			 	oneselfFixe:{
			 		digits:'请输入正确格式的固定额度',
			 		rangelength: '固定额度长度为1~3'
			 	},
			 	otherMin:{
			 		digits:'请输入正确格式的下限额度',
			 		rangelength: '下限额度长度为1~3'
			 	},
			 	otherMax:{
			 		digits:'请输入正确格式的上限额度',
			 		rangelength: '上限额度长度为1~3'
			 	},
			 	otherFixe:{
			 		digits:'请输入正确格式的固定额度',
			 		rangelength: '固定额度长度为1~3'
			 	},
			 	content:{
			 		required: '请输入文案',
			 		rangelength: '文案长度为1~100'
			 	},
			 	oneselfValidity: {
					digits:'请输入正确格式的有效期',
			 		rangelength: '有效期长度为1~3',
			 		required: '请输入有效期',
			 	},
			 	otherValidity: {
					digits:'请输入正确格式的有效期',
			 		rangelength: '有效期长度为1~3',
			 		required: '请输入有效期',
			 	},
			 	denomainOneMin:{
			 		rangelength: '面额1最小值长度为1~3',
			 		required: '请输入面额1最小值'
			 	},
			 	denomainOneMax:{
			 		rangelength: '面额1最大值长度为1~3',
			 		required: '请输入面额1最大值'
			 	},
			 	denomainOneProp:{
			 		rangelength: '面额1占比长度为1~3',
			 		required: '请输入面额1占比'
			 	},
			 	denomainTwoMin:{
			 		rangelength: '面额1最小值长度为1~3',
			 		required: '请输入面额2最小值'
			 	},
			 	denomainTwoMax:{
			 		rangelength: '面额1最大值长度为1~3',
			 		required: '请输入面额2最大值'
			 	},
			 	denomainTwoProp:{
			 		rangelength: '面额1占比长度为1~3',
			 		required: '请输入面额2占比'
			 	},
			 	denomainThreeMin:{
			 		rangelength: '面额3最小值长度为1~3',
			 		required: '请输入面额3最小值'
			 	},
			 	denomainThreeMax:{
			 		rangelength: '面额3最大值长度为1~3',
			 		required: '请输入面额3最大值'
			 	},
			 	denomainThreeProp:{
			 		rangelength: '面额3占比长度为1~3',
			 		required: '请输入面额3占比'
			 	},
			 	payValidity:{
			 		rangelength: '有效期长度为1~3',
			 		required: '请输入有效期'
			 	}
    	}; 
    	param.validate = valid;
    	param.width = 980;
    	param.init = editInit;
    	layui.common.modal(param);  
    });
    
});