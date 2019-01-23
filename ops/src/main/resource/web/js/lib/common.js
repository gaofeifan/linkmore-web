/**
 * 封装日常操作类组件
 * Autor: liwl
 * Date: 2017-08-01
 */
layui.config({
	base: '/web/js/lib/'
}).extend({  
	validate:'validate'  
});
layui.define(['layer','validate','jquery'], function(exports) {
	'use strict';
	var server = '';
	var ngix = ''; 
	var $ = layui.jquery, 
		layer = layui.layer;
	var Map=function(){this.keys=new Array,this.data=new Object;var e=Object.prototype.toString;this.size=function(){return this.keys.length},this.put=function(e,t){this.data[e]==null&&(this.data[e]=t),this.keys.push(e)},this.get=function(e){return this.data[e]},this.set=function(e,t){this.data[e]=t},this.remove=function(e){var t=this.indexOf(e);t!=-1&&this.keys.splice(t,1),this.data[e]=null},this.clear=function(){for(var e=0,t=this.size();e<t;e++){var n=this.keys[e];this.data[n]=null}this.keys.length=0},this.containsKey=function(e){return this.data[e]!=null},this.isEmpty=function(){return this.keys.length===0},this.entrySet=function(){var e=this.size(),t=new Array(e);for(var n=0,r=e;n<r;n++){var i=this.keys[n],s=this.data[i];t[n]={key:i,value:s}}return t},this.each=function(t){if(e.call(t)==="[object Function]")for(var n=0,r=this.size();n<r;n++){var i=this.keys[n];t(n,i,this.data[i])}return null},this.indexOf=function(e){var t=this.size();if(t>0)for(var n=0,r=t;n<r;n++)if(this.keys[n]==e)return n;return-1},this.toString=function(){var e="{";for(var t=0,n=this.size();t<n;t++,e+=","){var r=this.keys[t],i=this.data[r];e+=r+"="+i}return e=e.substring(0,e.length-1),e+="}",e},this.values=function(){var e=this.size(),t=new Array(e);for(var n=0;n<e;n++){var r=this.keys[n];t.push(this.data[r]);}return t;}};
	 
	var Session = function() {
        this.version = '1.0';
        this.session = window.sessionStorage; 
    }   
	Session.prototype.put = function (key,value) {
		var type = typeof value;
		if(type=='object'){
			this.session.setItem('lm_'+key,JSON.stringify(value));
			var objectKey = this.session.getItem('object_key'); 
			if(objectKey !=null&&objectKey.indexOf(key)<0){
				objectKey += '|'+key;
				this.session.setItem('object_key',objectKey);
			}else if(objectKey==null){
				objectKey += '|'+key;
				this.session.setItem('object_key',objectKey);
			}
			
		}else{
			this.session.setItem('lm_'+key,value);
		}
    };
 
    Session.prototype.get = function (key) {
    	var objectKey = this.session.getItem('object_key'); 
		var value = this.session.getItem('lm_'+key);
		if(objectKey !=null&&objectKey.indexOf(key)>=0){
			value = JSON.parse(value);
		}
		return value
    };
    Session.prototype.remove = function(key){
    	var objectKey = this.session.getItem('object_key');
    	if(objectKey !=null&&objectKey.indexOf(key)>=0){
    		objectKey = objectKey.replace('|'+key,'');
    		this.session.setItem('object_key',objectKey);
    	}
    	this.session.removeItem('lm_'+key);
    };
    
    $().ready(function(){
		var path = window.location.pathname;
		var session = new Session(); 
		var ape = session.get('auth-page-element'); 
		if(ape!=null){
			var pe = ape.data[path];
			if(pe!=null){
				$.each(pe.children,function(index,e){
					if(e.status){
						$(e.labelName+'#'+e.labelId).show();
					}else{
						$(e.labelName+'#'+e.labelId).remove();
					} 
				});
			} 
		}
		
	});
    
	var Common = { 
		map:function(){
			return new Map();
		},
		server:function(){
			return server;
		},
		session:function(){
			return new Session();
		},
		ngix:function(){
			return ngix;
		},
		download:function(options){
			var config = $.extend(true, { method: 'post' }, options);
	        var $form = $('<form method="post" />');
	        $form.attr('action', server+config.url);
	        config.data.token = window.sessionStorage.getItem('X-Access-Auth-Token');
	        for (var key in config.data) {
	          $form.append('<input type="hidden" name="' + key + '" value="' + config.data[key] + '" />');
	        }
	        $(document.body).append($form);
	        $form[0].submit();
	        $form.remove();
		},
		upload:function(param){
			var zindex = layui.msg.loading('文件上传中...');
			$.ajax({
				url: server + param.url,
				type: "POST",
				data: param.data,  
				enctype: 'multipart/form-data',
			    processData: false,
			    contentType: false,
			    headers: {  
	                'X-Access-Auth-Token': window.sessionStorage.getItem('X-Access-Auth-Token')
	            },
			    statusCode: {
	                404: function () {
	                	layui.msg.tips('请求服务不存在404');
	                },
	                500: function () {
	                	layui.msg.tips('请求服务异常500');
	                },
	                401: function(){
	                	window.sessionStorage.removeItem('linkmore-login-status');
	                	layui.msg.alert('您还未登录,请先登录',function(){
	                		window.location.href = '/web/login.html';
	                	});
	                },
	                403: function(){
	                	layui.msg.tips('未授权访问,请联系管理员'); 
	                }
	            },
	            error: function (XMLHttpRequest, textStatus, errorThrown) { 
	            	layui.layer.close(zindex);
	            	if(param.error!=null){
	            		param.error(XMLHttpRequest, textStatus, errorThrown);
	            	} 
	            },
	            success: function (res) {
	            	layui.layer.close(zindex);
	            	param.success(res);
	            } 
			});
		},
		ajax:function(param){
			var zindex = layui.msg.loading('数据同步中...');
			$.ajax({
	            type:'POST',
	            url: server + param.url,
	            data: param.data,
	            async:param.async==null?true:param.async,
	            dataType:'json', 
	            contentType:param.contentType==null?'application/x-www-form-urlencoded':param.contentType,
	            headers: {  
	                'X-Access-Auth-Token': window.sessionStorage.getItem('X-Access-Auth-Token')
	            },
	            statusCode: {
	                404: function () {
	                	layui.msg.tips('请求服务不存在404');
	                },
	                500: function () {
	                	layui.msg.tips('请求服务异常500');
	                },
	                401: function(){
	                	window.sessionStorage.removeItem('linkmore-login-status');
	                	layui.msg.alert('您还未登录,请先登录',function(){
	                		window.location.href = '/web/login.html';
	                	});
	                },
	                403: function(){
	                	layui.msg.tips('未授权访问,请联系管理员'); 
	                }
	            },
	            error: function (XMLHttpRequest, textStatus, errorThrown) { 
	            	layui.layer.close(zindex);
	            	if(param.error!=null){
	            		param.error(XMLHttpRequest, textStatus, errorThrown);
	            	} 
	            },
	            success: function (res) {
	            	layui.layer.close(zindex);
	            	param.success(res);
	            }
	        }); 
		},
		modal:function(param){
	    	var zindex = layui.msg.loading('资源加载中...');
	    	$.ajax({
	            type: 'GET',
	            url: ngix+param.url,
	            data:  {time:new Date().getTime()}, 
	            error: function (XMLHttpRequest, textStatus, errorThrown) {
	            	layui.msg.tips('E' + textStatus );
	            },
	            success: function (res) {
	            	var uindex = layui.layer.open({
	                    type: 1,
	                    btn: false,
	                    area: param.width + 'px',
	                    content: res,
	                    title: param.title,
	                    end: param.end,
	                    success: function (dom, index) {
	                    	layui.layer.close(zindex);
	                    	var validate = null;
	                    	if(param.validate!=null){
	                    		validate = layui.validate.init(param.validate);
	                    	} 
	                        param.init(validate,index);
	                    }
	                });
	            }
	        });  
		},
		set:function(param){
			var win_name = window.name;
			var form = $("#"+param.id)[0];
			for(var index in param.data){
				var val = param.data[index];
				var node= $(form[index]);
				if(node!=null&&node.length>0){
					if(node[0].nodeName=="INPUT"){
						var type = $(form[index]).attr("type");
						if(type == "number" || type == "text" || type == "select-one" || type == "hidden" || type == "button"){
				            $(form[index]).val(val);
				        }else if(type == "radio"){ 
				            $.each(node,function(i,ra){
				        		if($(ra).val()==val){
				        			$(ra).attr('checked',true);
				        			return true;
				        		}
				        	});
				        }else if(type == "checkbox"){  
				        	$.each(node,function(index,ch){
				        		if ($(ch).val() == val) {
			                        $(ch).attr("checked",true);
			                        return false;
			                    }
				        	}); 
				        }
					}else if(node[0].nodeName=="TEXTAREA"){
						$(form[index]).val(val);
					}else if(node[0].nodeName=="SELECT"){
						 $(form[index]).val(val);
					}
				}
			}
			window.name = win_name;
		} 
	};
	exports('common', Common)
})