var navtab;
layui.config({
	base: '/web/js/lib/'
}).extend({
	navbar: 'navbar',
	navtab: 'navtab',
	common: 'common',
	elemnts: 'elements',
	msg:'msg'
});
layui.use(['elements','common','msg', 'jquery', 'layer', 'navbar', 'navtab', 'form'], function() { 
	var $ = layui.jquery,
		layer = layui.layer,
		device = layui.device(),
		elements = layui.elements(),
		navbar = layui.navbar(),
		form = layui.form, 
	navtab = layui.navtab({
		elem: '#linkmore-tab'
	});
	var storage = window.localStorage;
	$(".name").html(storage.getItem('username'));
	$('body').bind("selectstart", function() {
		return false
	});
	$(document).ready(function() {
		if (device.ie && device.ie < 9) {
			layui.msg.alert('最低支持ie9，您当前使用的是古老的 IE' + device.ie + '！'); 
		}
		AdminInit();
		layui.common.ajax({
			url:'/admin/frame/auth_element',
			data:{time:new Date().getTime()},
			method:'POST', 
			async:false,
			success:function(list){
				 var session = layui.common.session();
				 var map = layui.common.map(); 
				 $.each(list,function(index,p){
					 map.put(p.path,p); 
				 });
				 session.put('auth-page-element',map);
			},error:function(){
				
			}
		});  
		layui.common.ajax({
			url:'/admin/frame/top_menu',
			data:{time:new Date().getTime()},
			method:'POST', 
			async:false,
			success:function(result){
				navbar.set({
					elem: '#menu',
					data: result,
					cached: false
				});
				navbar.render()
			},error:function(){
				
			}
		});  
		var m = $('#menu');
		m.find('li.layui-nav-item').each(function() {
			var t = $(this);
			t.on('click', function() {
				var id = t.data('pid');
				layui.common.ajax({
					url:'/admin/frame/left_menu',
					async:false,
					data:{pid:id ,time:new Date().getTime()},
					method:'POST', 
					success:function(result){
						navbar.set({
							elem: '#viewSideNav',
							data: result,
							spreadOne: true
						});
						navbar.render();
						navbar.on('click(side)', function(data) {
							navtab.tabAdd(data.field)
						})
					},error:function(){
						
					}
				}); 
			})
		});
		m.find('li')[0].click();
		$("#viewSideNav").find("li").eq(0).addClass('layui-this');
		$.ajaxSettings.async = true
	});
	$('#linkmore-tab').bind("contextmenu", function() {
		return false
	});
	$('#buttonRCtrl').find('dd').each(function() {
		$(this).on('click', function() {
			var eName = $(this).children('a').attr('data-eName');
			navtab.tabCtrl(eName)
		})
	});
	$(window).on('resize', function() {
		AdminInit();
		var c = $('#linkmore-tab .layui-tab-content'); 
		c.find('iframe').each(function() {
			$(this).height(c.height()-40)
		})
	}).resize();
	$("#refresh_iframe").click(function() {
		$(".layui-tab-content .layui-tab-item").each(function() {
			if ($(this).hasClass('layui-show')) {
				$(this).children('iframe')[0].contentWindow.location.reload(true)
			}
		})
	});

	function AdminInit() {
		$('.layui-layout-admin').height($(window).height());
		$('body').height($(window).height());
		$('#linkmore-body').width($('.layui-layout-admin').width() - $('#linkmore-side').width());
		$('#linkmore-footer').width($('.layui-layout-admin').width() - $('#linkmore-side').width())
	}
	$('#clearCached').on('click', function() {
		navbar.cleanCached();
		layui.msg.alert('缓存清除完成!本地存储数据也清理成功！',function(){
			location.reload();
		}); 
	});
	var fScreen = localStorage.getItem("fullscreen_info");
	var themeName = localStorage.getItem('themeName');
	if (themeName) {
		$("body").attr("class", "");
		$("body").addClass("viewTheme-" + themeName)
	}
	if (fScreen && fScreen != 'false') {
		var fScreenIndex = layui.msg.alert('按ESC退出全屏',function(){
			entryFullScreen();
			$('#FullScreen').html('<i class="fa fa-compress"></i>退出全屏');
			layer.close(fScreenIndex)
		}); 
	}
	$('#viewTheme').on('click', function() {
		var fScreen = localStorage.getItem('fullscreen_info');
		var themeName = localStorage.getItem('themeName');
		layer.open({
			type: 1,
			title: false,
			closeBtn: true,
			shadeClose: false,
			shade: 0.35,
			area: ['450px', '300px'],
			isOutAnim: true,
			resize: false,
			anim: Math.ceil(Math.random() * 6),
			content: $('#viewThemeSet').html(),
			success: function(layero, index) {
				if (fScreen && fScreen != 'false') {
					$("input[lay-filter='fullscreen']").attr("checked", "checked")
				}
				if (themeName) {
					$("#themeName option[value='" + themeName + "']").attr("selected", "selected")
				}
				form.render()
			}
		});
		form.on('switch(fullscreen)', function(data) {
			var fValue = data.elem.checked;
			localStorage.setItem('fullscreen_info', fValue)
		});
		form.on('select(viewTheme)', function(data) {
			var themeValue = data.value;
			localStorage.setItem('themeName', themeValue);
			if (themeName) {
				$("body").attr("class", "");
				$("body").addClass("viewTheme-" + themeName)
			}
			form.render('select')
		})
	});
	$('#FullScreen').bind('click', function() {
		var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;
		if (fullscreenElement == null) {
			entryFullScreen();
			$(this).html('<i class="fa fa-compress"></i>退出全屏')
		} else {
			exitFullScreen();
			$(this).html('<i class="fa fa-arrows-alt"></i>全屏')
		}
	});

	function entryFullScreen() {
		var docE = document.documentElement;
		if (docE.requestFullScreen) {
			docE.requestFullScreen()
		} else if (docE.mozRequestFullScreen) {
			docE.mozRequestFullScreen()
		} else if (docE.webkitRequestFullScreen) {
			docE.webkitRequestFullScreen()
		}
	}
	function exitFullScreen() {
		var docE = document;
		if (docE.exitFullscreen) {
			docE.exitFullscreen()
		} else if (docE.mozCancelFullScreen) {
			docE.mozCancelFullScreen()
		} else if (docE.webkitCancelFullScreen) {
			docE.webkitCancelFullScreen()
		}
	}
	var toggle = function(){
		$('#toggle').unbind('click');
		var sideWidth = $('#linkmore-side').width();
		var bodyW = $('#linkmore-body').width();
		if (sideWidth === 200) {
			bodyW += 203;
			$('#linkmore-body').animate({
				left: '0',
				width: bodyW
			});
			$('#linkmore-footer').animate({
				left: '0',
				width: bodyW
			});
			$('#linkmore-side').animate({
				width: '0'
			})
		} else {
			bodyW -= 203;
			$('#linkmore-body').animate({
				left: '203px',
				width: bodyW
			});
			$('#linkmore-footer').animate({
				left: '203px',
				width: bodyW
			});
			$('#linkmore-side').animate({
				width: '200px'
			})
		}
		window.setTimeout(function(){
			$('#toggle').unbind('click').bind('click',toggle);
		},500);
	};
	var flag = true;
	$('#toggle').bind('click',toggle);
	$('#lock').mouseover(function() {
		layer.tips('请按Alt+L快速锁屏！', '#lock', {
			tips: [1, '#FF5722'],
			time: 2000
		})
	});
	$(document).keydown(function(e) {
		if (e.altKey && e.which == 76) {
			lockSystem()
		}
	});
	checkLockStatus('0');

	function lockSystem() {
		var url = 'data/lock.json';
		$.get(url, function(data) {
			if (data == '1') {
				checkLockStatus(1)
			} else {
				layui.msg.error('锁屏失败，请稍后再试！',1); 
			}
		});
		startTimer()
	}
	function unlockSystem() {
		checkLockStatus(0)
	}
	$('#lock').click(function() {
		lockSystem()
	});
	$('#unlock').click(function() {
		unlockSystem()
	});
	$('#lock_password').keypress(function(e) {
		var key = e.which;
		if (key == 13) {
			unlockSystem()
		}
	});
	$('.linkmore-user-operate dd').bind('click',function(){
		$(this).removeClass('layui-this');
	});

	function startTimer() {
		var today = new Date();
		var h = today.getHours();
		var m = today.getMinutes();
		var s = today.getSeconds();
		m = m < 10 ? '0' + m : m;
		s = s < 10 ? '0' + s : s;
		$('#time').html(h + ":" + m + ":" + s);
		t = setTimeout(function() {
			startTimer()
		}, 500)
	}
	function checkLockStatus(locked) {
		if (locked == 1) {
			$('.lock-screen').show();
			$('#locker').show();
			$('#layui_layout').hide();
			$('#lock_password').val('')
		} else {
			$('.lock-screen').hide();
			$('#locker').hide();
			$('#layui_layout').show()
		}
	}
	$('#dianzhan').click(function(event) {
		layer.open({
			type: 1,
			title: false,
			closeBtn: true,
			shadeClose: false,
			shade: 0.15,
			area: ['505px', '288px'],
			content: '<img src="images/dianzhan.jpg"/>'
		})
	});
	$('#logout').on('click', function() {
		var url = 'login.html';
		layui.msg.confirm('您确定要退出登录吗',function(){
			layui.common.ajax({
				url:'/admin/auth/logout',
				data:{time:new Date().getTime()},
				method:'POST', 
				success:function(result){
					window.sessionStorage.removeItem('linkmore-login-status');
					layui.msg.alert('注销成功,确认后返回登录界面',function(){
                		window.location.href = 'login.html';
                	}); 
				},error:function(){
					
				}
			}); 
			
		},null); 
	});
	
	var updateInit = function(validate,lindex){
		$('#cancel-button').bind('click',function(){
			layui.layer.close(lindex);
		});
		$("#update-password-button").bind('click',function(){
			var oldPassword = $("#oldPassword").val(); 
			var newPassword = $("#newPassword").val(); 
			if(oldPassword==""){
				layui.msg.error('请输入原始密码');
				return false;
			}
			if(newPassword==""){
				layui.msg.error('请输入新密码');
				return false;
			}
			layui.msg.confirm('您确定要提交吗',function(){
				layui.common.ajax({
					url:'/admin/auth/update_password',
					data:{oldPassword:oldPassword,password:newPassword},
					method:'POST', 
					success:function(msg){
						if(msg.update){
							layui.msg.alert('修改成功,请重新登录',function(){
								window.location.href = 'login.html';
							},1000); 
						}else{
							layui.msg.error(msg.message);
						}
					},error:function(){
						
					}
				}); 
			},null);
		})
	}
	$('#changePassword').unbind('click').bind('click',function(){
		var param = new Object();
    	param.url = '../html/updatePassword.html';
    	param.title = '修改密码'; 
    	param.width = 500;
    	param.init = updateInit;
    	layui.common.modal(param);
	});
})