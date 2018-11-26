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
layui.use(['layer','msg','form', 'common','laydate', 'datatable' ], function() {
        var validate = layui.validate;
        var session = window.sessionStorage;
        var layer = layui.layer;  
        var $ = layui.jquery; 
        var form = layui.form; 
        
        var laydate = layui.laydate; 

    	laydate.render({
    	    elem: '#search-startTime',
    	    min: '2015-06-16 23:59:59',
    	    max: new Date().format('yyyy-MM-dd'),
    		istoday: false
    	});
    	laydate.render({
    	    elem: '#search-endTime',
    	    min: '2015-06-16 23:59:59',
    	    max: new Date().format('yyyy-MM-dd'),
    		istoday: false
    	}); 
    	
        var addServerParams = function(data){   
        var filters = new Array();
        var filter = null; 
        var nickname = $('#search-nickname').val();
        var mobile = $('#search-mobile').val();
        var plateNo = $('#search-plateNo').val();
        var ordersCount = $('#search-order-count').val();
        var nature = $('#search-nature').val();
        if(ordersCount!=''){
            filter = new Object();
            filter.property = 'ordersCount';
            filter.value = ordersCount;
            filters.push(filter);
        }
        if(plateNo!=''){
            filter = new Object();
            filter.property = 'plateNo';
            filter.value = plateNo;
            filters.push(filter);
        }
        if(mobile!=''){
            filter = new Object();
            filter.property = 'mobile';
            filter.value = mobile;
            filters.push(filter);
        }
        if(nature!='-1'){
                filter = new Object();
                filter.property = 'nature';
                filter.value = nature;
                filters.push(filter);
        }
        if(nickname!=''){
            filter = new Object();
            filter.property = 'nickname';
            filter.value = '%'+nickname+'%';
            filters.push(filter);
        }
        if(filters.length>0){
                data.push({name:'filterJson',value:JSON.stringify({filters:filters})});
        }
	};
	
	var datatable = layui.datatable.init({
        id:'user-table',
        url:'/admin/biz/user/list', 
        key:'id',
        columns:[ 
                { sTitle: '用户名',   mData: 'nickName'},  
                { sTitle: '手机号码',   mData: 'mobile'},  
                { sTitle: '常规使用地',   mData: 'cityName'}, 
                { sTitle: '交易次数',   mData: 'orderCount'},
                { 
                    sTitle: '最近登录时间',
                    mData: 'loginTime' ,
                    bSortable: true,
                    mRender:function(mData,type,full){
                             return new Date(mData).format('yyyy-MM-dd hh:mm');
                    }
                },
                { 
                    sTitle: '最近下单时间',
                    mData: 'ordersTime' ,
                    bSortable: true,
                    mRender:function(mData,type,full){
                             return new Date(mData).format('yyyy-MM-dd hh:mm');
                    }
                },
	            { 
	                    sTitle: '用户状态',   
	                    mData: 'userStatus',
	                    mRender:function(mData,type,full){
	                            var html = '';
	                            switch(mData){
	                            case 0: html = '<label style="color:#1E9FFF">后台发劵</label>';break;
	                            case 1: html = '<label style="color:#FF5722">APP注册</label>';break;
	                            case 2: html = '<label style="color:#5FB878">公众号</label>';break;
	                            case 3: html = '<label style="color:#009688;">三方微信</label>';break; 
	                            case 4: html = '<label style="color:#F7B824;">扫码领券</label>';break;
	                            case 5: html = '<label style="color:#61768d;">分享领券</label>';break;
	                    }
	                    return html;
	            }
	            }, 
	            { sTitle: '车牌号',   mData: 'plateNo'}
            
        ],
        orderIndex:4,
        orderType:'desc',
        filter:addServerParams
	});  
        
	var query =  function(){
     	 datatable.reload();
     };  
     
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
		$.each(list,function(index,dg){
			ids.push(dg.id);
		});
		layui.msg.confirm('您确定要删除',function(){
			layui.common.ajax({
				url:'/admin/biz/user/delete',
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

	$('#export-button').bind('click',function(){ 
		  var filters = new Array();
	        var filter = null; 
	        var nickname = $('#search-nickname').val();
	        var mobile = $('#search-mobile').val();
	        var plateNo = $('#search-plateNo').val();
	        var ordersCount = $('#search-order-count').val();
	        var nature = $('#search-nature').val();
	        if(ordersCount!=''){
	            filter = new Object();
	            filter.property = 'ordersCount';
	            filter.value = ordersCount;
	            filters.push(filter);
	        }
	        if(plateNo!=''){
	            filter = new Object();
	            filter.property = 'plateNo';
	            filter.value = plateNo;
	            filters.push(filter);
	        }
	        if(mobile!=''){
	            filter = new Object();
	            filter.property = 'mobile';
	            filter.value = mobile;
	            filters.push(filter);
	        }
	        if(nature!='-1'){
	                filter = new Object();
	                filter.property = 'nature';
	                filter.value = nature;
	                filters.push(filter);
	        }
	        if(nickname!=''){
	            filter = new Object();
	            filter.property = 'nickname';
	            filter.value = '%'+nickname+'%';
	            filters.push(filter);
	        }
	        var data = new Array();
	        if(filters.length>0){
	                data.push({name:'filterJson',value:JSON.stringify({filters:filters})});
	        }
        var url = '/admin/biz/user/export';
        data.time = new Date().getTime();
        layui.common.download({
          url:url,
          data: data
        }); 
	}); 
        
	$('#adv_query_but').bind('click',function(){
        initForm();
        checkCity();
        checkRegion();
        $('#adv_query').show();
        $('#adv_query').attr('data-status',0);
        var temp =$('#adv_query').attr('data-status');
	});
        
	$('#adv_close').bind('click',function(){
		advClose();
	});
	
	var advClose = function(){
	  myClean('adv-form');
      $('#adv_query').hide();
      $('#adv_query').attr('data-status',1);
      var temp =$('#adv_query').attr('data-status');
	}
        
	$('#adv_input_close').bind('click',function(){
         myClean('adv-form');	
 	});
        
	var myClean = function(formId){
        $(":input","#"+formId)
        .not(":button",":reset","hidden","submit")
        .val("")
        .removeAttr("checked")
        .removeAttr("selected");
 	}
	
	var commitForm = function(data){
		var res = null;
		var param = new Object
		var userType = $('#search-userType').val();
		var userInd = $('#search-userInd').val();
		var startTime = $('#search-startTime').val();
		var endTime = $('#search-endTime').val();
		var couponMoney = $('#search-couponMoney').val();
		var couponNumber = $('#search-couponNumber').val();
		var city = $('#search-city').val();
		var pre = $('#search-pre').val();
		var loginStartNum = $('#search-loginStartNum').val();
		var loginEndNum = $('#search-loginEndNum').val();
		var orederStartNum = $('#search-orederStartNum').val();
		var orederEndNum = $('#search-orederEndNum').val();
		var fourDet = $('#search-fourDet').val();
		var fourName = $('#search-fourName').val();
		if(null!=fourName&&fourName!=""&&fourName!=-1){
			param.enterpriseId =fourName;
		}
		if(null!=fourDet&&fourDet!=""&&fourDet!=-1){
			param.regionId =fourDet;
		}
		if(null!=orederEndNum&&orederEndNum!=""&&orederEndNum!=-1){
			param.orederEndNum =orederEndNum;
		}
		if(null!=orederStartNum&&orederStartNum!=""&&orederStartNum!=-1){
			param.orederStartNum =orederStartNum;
		}
		if(null!=loginEndNum&&loginEndNum!=""&&loginEndNum!=-1){
			param.loginEndNum =loginEndNum;
		}
		if(null!=userType&&userType!=""&&userType!=-1){
			param.userType =userType;
		}
		if(null!=userInd&&userInd!=""&&userInd!=-1){
			param.userInd =userInd;
		}
		if(null!=startTime&&startTime!=""&&startTime!=-1){
			param.startTime =startTime;
		}
		if(null!=endTime&&endTime!=""&&endTime!=-1){
			param.endTime =endTime;
		}
		if(null!=couponMoney&&couponMoney!=""&&couponMoney!=-1){
			param.couponMoney =couponMoney;
		}
		if(null!=couponNumber&&couponNumber!=""&&couponNumber!=-1){
			param.couponNumber =couponNumber;
		}
		if(null!=city&&city!=""&&city!=-1){
			param.city =city;
		}
		if(null!=pre&&pre!=""&&pre!=-1){
			param.pre =pre;
		}
		if(null!=loginStartNum&&loginStartNum!=""&&loginStartNum!=-1){
			param.loginStartNum =loginStartNum;
		}
		res = JSON.stringify(param);
		if("{}"== res){
			return null;
		}
		return res;
	}
        
	var userGroupInit = function(validate,lindex){
            var userIds= "";
            var searchIds= "";
            var flag = false;
            var as = $('#adv_query').attr('data-status');
            if(as == 0){
            	searchIds = commitForm();
            	 if(null == searchIds){
            		 flag = true;
     	        }
            }else{
	            var list = datatable.selected(); 
	            $.each(list,function(index,page){
	                    userIds += page.id+",";
	            });
	            userIds = userIds.substring(0,userIds.length-1);
            }
            if(flag){
             layui.layer.close(lindex);
            	 layui.msg.error('筛选条件为空');
            	 return false;
            }
            if(!checklNum()){
            	layui.layer.close(lindex);
 	    	    layui.msg.error('登录次数，数量格式错误');
 	    	   	return false;
 	       }
 	       if(!checkoNum()){
 	       layui.layer.close(lindex);
 	    	   layui.msg.error('下单次数，数量格式错误');
 	   	   	return false;
 	       }
            if(userIds !=""){
                $('#userIds').val(userIds);
            }
            if(null!=searchIds&&searchIds !=""&&searchIds.length >0){
                $('#searchJson').val(searchIds);		
            }
            $('#add-cancel-button').bind('click',function(){
                layui.layer.close(lindex);
            });
            $('#add-group-button').bind('click',function(){
            if(validate.valid()){
                layui.common.ajax({
                    url:'/admin/biz/user_group/save',
                    data:$('#user-group-form').serialize(),
                    success:function(res){
                        if(res.success){
                                layui.layer.close(lindex);
                                advClose();
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
	
	var checklNum = function(){
		var flag = true;
		var loginStartNum = $('#search-loginStartNum').val();
		var loginEndNum = $('#search-loginEndNum').val();
		if(null!=loginStartNum&&loginStartNum!=""&&loginStartNum!=-1&&null!=loginEndNum&&loginEndNum!=""&&loginEndNum!=-1){
			loginStartNum = Number(loginStartNum);
			loginEndNum = Number(loginEndNum);
			if(loginEndNum<loginStartNum){
				$('#search-loginStartNum').val('');
				$('#search-loginEndNum').val('');
				flag =false;
			}
		}
		return flag
		
	}
	var checkoNum = function(){
		var flag = true;
		var orederStartNum = $('#search-orederStartNum').val();
		var orederEndNum = $('#search-orederEndNum').val();
		if(null!=orederEndNum&&orederEndNum!=""&&orederEndNum!=-1&&null!=orederStartNum&&orederStartNum!=""&&orederStartNum!=-1){
			orederEndNum = Number(orederEndNum);
			orederStartNum = Number(orederStartNum);
			if(orederEndNum<orederStartNum){
				$('#search-orederEndNum').val('');
				$('#search-orederStartNum').val('');
				flag =false;
			}
		}
		return flag
	}
        
    $('#group-button').bind('click',function(){
        var as = $('#adv_query').attr('data-status');
        if(as == 1){
	        var list = datatable.selected(); 
	        if(list.length==0){
	            layui.msg.error('请选择一条记录');
	            return false;
	        }
        	}
        var param = new Object();
        param.url = 'group.html';
        param.title = '添加分组信息'; 
        var valid = new Object();
        valid.id = "user-group-form";
        valid.rules = {
	        name:{
	            rangelength:[1,20] ,
	            required: true,
	            remote:{
	                    url:"/admin/biz/user_group/check",  
	                    data:{
	                            name:function(){return $('#user-group-form input[name=name]').val();},
	                            id:-1
	                    }
	                }
	        },content:{
	                    required: true,
	                    rangelength: [1,30]
	        },
        };
        valid.messages = {
            name:{
                    rangelength:'名称长度应在[1,20]内', 
                    required: '请填写名称',
                    remote:'名称已经存在'
            },content:{
                    rangelength:'简介长度应该在[1,30]内',  
                    required: '请填写简介',
            } 
        }; 
        param.validate = valid;
        param.width = 600;
        param.init = userGroupInit;
        layui.common.modal(param);  
    });
    
    var initForm = function(){
        var userTypeHtml = '';
        var userIndHtml = '';
        var couponMoneyHtml = '';
        var couponNumberHtml = '';
        var cityHtml = '';
        var preHtml = '';
        var fHtml = '';
        var fNameHtml = '';
        var userTypeList = new Array();
        var userIndList = new Array();
        var couponMoneyList = new Array();
        var couponNumberList = new Array();
        var cityList = new Array();
        var preList = new Array();
        var fList = new Array();
        var fNameList = new Array();
        layui.common.ajax({
		    url:'/admin/biz/user_group/initForm',
		    data:{}, 
		    async:false,
		    success:function(list){
		    userTypeList = list.userType;
		    userIndList = list.userInd;
		    couponMoneyList = list.couponMoney;
		    couponNumberList = list.couponNumber;
		    cityList = list.city;
		    preList = list.pre;
		    fList = list.f;
		    fNameList = list.fName;
		    userTypeHtml = optFactory(userTypeList);
		    $('#search-userType').html(userTypeHtml);
		    userIndHtml = optFactory(userIndList);
		    $('#search-userInd').html(userIndHtml);
		    couponMoneyHtml = optFactory(couponMoneyList);
		    $('#search-couponMoney').html(couponMoneyHtml);
		    couponNumberHtml = optFactory(couponNumberList);
		    $('#search-couponNumber').html(couponNumberHtml);
		    cityHtml = optFactory(cityList);
		    $('#search-city').html(cityHtml);
		    preHtml = optFactory(preList);
		    $('#search-pre').html(preHtml);
//		    fHtml = optFactory(fList);
//		    $('#search-fourDet').html(fHtml);
		    fNameHtml = optFactory(fNameList);
		    $('#search-fourName').html(fNameHtml);
		    form.render('select');
        },error:function(){}
 	   });
	}
    
    var optFactory = function(rows){
        var resHtml = ''
        $.each(rows,function(index,row){
                resHtml += '<option value="'+row.id+'">';
                resHtml += row.name;
                resHtml += '</option>';
        });
        return resHtml;
    }
    
    var presHtml= '';
    function getPreList(cityId){
        layui.common.ajax({
            url:'/admin/biz/prefecture/find_city',
            data:JSON.stringify(cityId),
            contentType:'application/json; charset=utf-8',
            async:false,
            success:function(list){
            presHtml = optFactory(list);
            $('#search-pre').html(presHtml);
            form.render('select');
            },error:function(){}
        });
    }
    
    var regionHtml= '';
    function getRegion(regionId){
        layui.common.ajax({
            url:'/admin/biz/user_group/find_region',
            data:JSON.stringify(regionId),
            contentType:'application/json; charset=utf-8',
            async:false,
            success:function(list){ 
            	if(list!=null&&list.length>0){
            		regionHtml = optFactory(list); 
    	            $('#search-fourName').html('<option value="-1">4s店名称</option>'+regionHtml);
    	            form.render('select');
            	}else{
            		$('#search-fourName').html('<option value="-1">4s店名称</option>');
     	            form.render('select');
            	}
            	
	        },error:function(){}
        });
    }
    
	var checkCity = function(){
        form.on('select(search-city-select)', function(data) {
            var cityId = data.value;
            getPreList(cityId);
        });
    }
	
	var checkRegion = function(){
        form.on('select(search-region-select)', function(data) {
            var regionId = data.value;
            getRegion(regionId);
        });
    }
	
	checkMaxInput = function(data){
		var maxL = 30;
		var length = data.value.length;
		if(length > maxL){
			data.value = data.value.substring(0,maxL);
//			remLen.innerText = '您输入的内容超出了字数限制';
		}else{
			remLen.innerText = '' + (data.value.length) + '/30';
		}
	}
});