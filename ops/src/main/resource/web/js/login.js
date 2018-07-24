layui.config({
	base: '/web/js/lib/'
}).extend({ 
	msg:'msg',
	common:'common'
}); 
layui.use(['layer','msg','form' , 'common'], function() { 
	var layer = layui.layer;  
	var $ = layui.jquery; 
	if (window != top){
		top.location.href = window.location.href;
	} 
	var storage = window.localStorage;
	var session = window.sessionStorage; 
	
	$('[name="password"]').on(
		'focus',
		function() {
			$('#left-hander').removeClass('initial_left_hand')
					.addClass('left_hand');
			$('#right-hander').removeClass('initial_right_hand')
					.addClass('right_hand')
		}).on(
		'blur',
		function() {
			$('#left-hander').addClass('initial_left_hand')
					.removeClass('left_hand');
			$('#right-hander').addClass('initial_right_hand')
					.removeClass('right_hand')
		}
	);
	
	var login = function(){
		var username = $("#username").val();
		var password = $("#password").val(); 
		if(username==''){
			layui.msg.error('请输入账号');
			return false;
		}
		if(password==''){
			layui.msg.error('请输入密码');
			return false;
		}
		layui.common.ajax({
			url: '/admin/auth/login',
			data:{username:username,password:password,time:new Date().getTime()},
			method:'POST',
			success:function(msg){
				if(msg.login){ 
					session.setItem('linkmore-login-status',true);
		            storage.setItem("username",msg.map.username);
					layui.msg.success('登录成功');
					window.setTimeout(function(){
						window.location.href = '/web/main.html';
					},1000);
					
				}else{
					layui.msg.error(msg.message);
				}
			},error:function(){
				
			}
		});
		
	};
	
	$("#loginForm").bind('keydown',function(){ 
		if(event.keyCode==13){ 
			login();
		}
	});
	$('#login-button').bind('click',login);   
});