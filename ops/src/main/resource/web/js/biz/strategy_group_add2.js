layui.config({
	base: '/web/js/lib/'
}).extend({ 
	msg:'msg',
	common:'common', 
	ztree:'ztree'
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

layui.use(['layer','msg','form', 'common','element','ztree'], function() {

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
	var stragegyGroupName=decodeURI(request.QueryString("name"))
	var parkingInterval=decodeURI(request.QueryString("parkingInterval"))
	var prefectureId=decodeURI(request.QueryString("prefectureId"));
	//alert(stragegyGroupName+'--'+parkingInterval);
	
 	var treeClick = function(event, treeId, treeNode, clickFlag){
 		level = treeNode.level;
 		if(!treeNode.click){
 			selectedEntId = treeNode.id;
 			lastNode  = treeNode;
 			
 			//query();
 		} else{
 			//tree.selectNode(lastNode);
 			//alert(treeNode.name)
 			//layui.msg.error('请选择第一组页面树');
 			var areaName=treeNode.t.split("#")[0];
 			var startName=treeNode.t.split("#")[1];
 			var endName=treeNode.t.split("#")[2];
 			findAreaStall(prefectureId,areaName,startName,endName)
 			return true;
 		}
	};
	
	var findAreaStall=function(prefectureId,areaName,startName,endName){
		layui.common.ajax({
			url: "/admin/biz/strategy/group/findAreaStall",
			//contentType:'application/json; charset=utf-8',
			data:{prefectureId:prefectureId,areaName:areaName,startName:startName,endName:endName},
			success: function(data) {
				$("#select1").empty();
				for (var i=0;i<data.length;i++){
	 				$("#select1").append("<option value='"+data[i].id+"'>"+data[i].stallName+"</option>");
	 			}
			},
		error:function(){}
		});
		
	}
	
	var setting = {
			data: {
				simpleData: {
					enable: true
				}
			},
			callback: {
				onClick: treeClick
		   }
		};

		// 企业树
		var tree = null;
		layui.common.ajax({
			url: "/admin/biz/strategy/group/tree",
			//contentType:'application/json; charset=utf-8',
			data:{prefectureId:prefectureId,parkingInterval:parkingInterval},
			success: function(data) {
				tree = $.fn.zTree.init($("#pre-tree"), setting, data);
				var nodes = tree.getNodes();
				if(nodes[0].children!=null&&nodes[0].children!=null){
					tree.selectNode(nodes[0].children[0]);
					selectedEntId = nodes[0].children[0].id;
					lastNode = nodes[0].children[0];
					//query();
				}
			},
		error:function(){}
		});

		/**
		 * select去重
		 */
		var distinctSelect=function(){
			$("#select2 option").each(function() {
	            text = $(this).text();
	            if($("#select2 option:contains("+text+")").length > 1)
	                $("#select2 option:contains("+text+"):gt(0)").remove();
	        });

			$("#chooseStallCount").html($("#select2 option").size());
			
		}
		
		
// begin----多选框js 
        var leftInputLength = 0;
        var rightInputLength = 0;

        var optionsOverAll = $("#select11").children();
        var r_optionsOverAll=$("#select2").children();
        leftInputLength = $("#unBindKey").val().length;
        rightInputLength = $("#bindKey").val().length;
        $("#select1").append(optionsOverAll);

        //移到右边
        $('#add').bind('click', function() {
            //获取选中的选项，删除并追加给对方
            $('#select1 option:selected').appendTo('#select2');
            r_optionsOverAll=$("#select2").children();
            distinctSelect();
        });
        //移到左边
        $('#remove').bind('click', function() {
            $('#select2 option:selected').appendTo('#select1');
            optionsOverAll=$("#select1").children();
            distinctSelect();
        });
        //全部移到右边
        $('#add_all').bind('click', function() {
            $('#select1 option').appendTo('#select2');
            r_optionsOverAll=$("#select2").children();
            distinctSelect();
        });
        //全部移到左边
        $('#remove_all').bind('click', function() {
            $('#select2 option').appendTo('#select1');
            optionsOverAll=$("#select1").children();
            distinctSelect();
        });
        //双击选项
        $('#select1').bind('dblclick', function() { //绑定双击事件
            //获取全部的选项,删除并追加给对方
            $("option:selected", this).appendTo('#select2'); //追加给对方
            distinctSelect();
        });
        //双击选项
        $('#select2').bind('dblclick', function() {
        });

        $("#unBindKey").keyup(function(){
            var options=optionsOverAll;
            var key=$(this).val();
            var add = false;
            if(leftInputLength > key.length){
                add = true;
            }
            $.each(options, function(i, option){
                if(option.text.indexOf(key)==-1){
                    $("#select1").find("option[value='"+option.value+"']").remove();
                } else {
                    if(add){
                        var optemp = $("#select2").children();
                        var addTemp = true;
                        if(optemp != null && optemp.length > 0){
                            for(var i = 0; i < optemp.length; i++){
                                if(option.value == optemp[i].value){
                                    addTemp = false;
                                    break;
                                }
                            }
                        } 
                        if(addTemp) {
                            $("#select1").find("option[value='"+option.value+"']").remove();
                            var op = "<option value='"+option.value+"'>"+option.text+"</option>";
                            $("#select1").append(op);
                        }
                    }
                }
            });
            leftInputLength = key.length;
        });

        $("#bindKey").keyup(function(){
           var options=r_optionsOverAll;
            var key=$(this).val();
            var add = false;
            if(rightInputLength > key.length){
                add = true;
            }
            $.each(options, function(i, option){
                if(option.text.indexOf(key)==-1){
                    $("#select2").find("option[value='"+option.value+"']").remove();
                } else {
                    if(add){
                        var optemp = $("#select1").children();
                        var addTemp = true;
                        if(optemp != null && optemp.length > 0){
                            for(var i = 0; i < optemp.length; i++){
                                if(option.value == optemp[i].value){
                                    addTemp = false;
                                    break;
                                }
                            }
                        } 
                        if(addTemp) {
                            $("#select2").find("option[value='"+option.value+"']").remove();
                            var op = "<option value='"+option.value+"'>"+option.text+"</option>";
                            $("#select2").append(op);
                        }
                    }
                }
            });
            rightInputLength = key.length;
        }); 	
// end----多选框js


	$('#strategy-group-back-button').bind('click',function(){
		history.back(-1);
		//location.href='add1.html';
	});
	
	$('#strategy-group-add-button').bind('click',function(){
		if($("#select2 option").size()<=0){
			//layui.msg.error("您还没有选择车位");
			layer.msg('您还没有选择车位', {
				  shift: 6,icon: 5
				}, function(){});
			
			return false;
		}
		
		layui.msg.confirm('您确定要添加这些车位吗?</br>确定添加请请击【确认】</br>不添加请点击【取消】',function(){
			var stallGroup = new Array();
			$("#select2 option").each(function() {
	            val = $(this).val();
	            text = $(this).text();
	            var obj = new Object();
	            obj.stallId=val;
	           // obj.stallName=text;
	           // obj.prefectureId=prefectureId;
	            stallGroup.push(obj);
	        });
	        layui.common.ajax({
				url:'/admin/biz/strategy/group/save',
				data:{name:stragegyGroupName,prefectureId:prefectureId,stallGroup:JSON.stringify(stallGroup)},
				success:function(res){
					if(res.success){
						layui.msg.success(res.content);
						window.setTimeout(function(){ location.href='list.html'; },2000);
					}else{
						layui.msg.error(res.content);
						window.setTimeout(query,1000);
					}
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