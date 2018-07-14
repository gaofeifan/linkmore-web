/**
 * @author linkmore 2017-08-01  navbar.js 
 * @link   http://www.pabeitech.com/
 * @version   [0.01] 
 */
layui.define(['jquery', 'layer', 'element', 'msg'], function(exports) {
	var $ = layui.jquery,
		layer = layui.layer,
		element = layui.element, 
		cacheName = 'navbarCache';
	var Navbar = function() {
			this.config = {
				elem: undefined,
				data: undefined,
				url: undefined,
				type: 'GET',
				cached: false,
				spreadOne: false
			}
		};
	Navbar.prototype.render = function() {
		var _that = this;
		var _config = _that.config;
		if (typeof(_config.elem) !== 'string' && typeof(_config.elem) !== 'object') { 
			layui.msg.error('Nav error: elem参数未定义或设置出错',1); 
		}
		var $container;
		if (typeof(_config.elem) === 'string') {
			$container = $('' + _config.elem + '')
		}
		if (typeof(_config.elem) === 'object') {
			$container = _config.elem
		}
		if ($container.length === 0) { 
			layui.msg.error('Nav error:找不到elem参数配置的容器，请检查.',1); 
		}
		if (_config.data === undefined && _config.url === undefined) { 
			layui.msg.error('Nav error:请为Nav配置数据源.',1);  
		}
		if (_config.data !== undefined && typeof(_config.data) === 'object') {
			var html = getHtml(_config.data);
			$container.html(html);
			element.init();
			_that.config.elem = $container
		} else {
			if (_config.cached) {
				var cacheNav = layui.data(cacheName);
				if (cacheNav.view === undefined) {
					$.ajax({
						type: _config.type,
						url: _config.url,
						async: false,
						dataType: 'json',
						success: function(result, status, xhr) {
							layui.data(cacheName, {
								key: 'view',
								vlue: result
							});
							var html = getHtml(result);
							$container.html(html);
							element.init()
						},
						error: function(xhr, status, error) { 
							layui.msg.error('"cms error"' + error,1);  
						},
						complete: function() {
							_that.config.elem = $container
						}
					})
				} else {
					var html = getHtml(cacheNav.view);
					$container.html(html);
					element.init();
					_that.config.elem = $container
				}
			} else {
				layui.data(cacheName, null);
				$.ajax({
					type: _config.type,
					url: _config.url,
					async: false,
					dataType: 'json',
					success: function(result, status, xhr) {
						var html = getHtml(result);
						$container.html(html);
						element.init()
					},
					error: function(xhr, status, error) { 
						layui.msg.error('"cms error"' + error,1); 
					},
					complete: function(xhr, status) {
						_that.config.elem = $container
					}
				})
			}
		}
		if (_config.spreadOne) {
			$container.find('li.layui-nav-item').each(function() {
				$(this).on('click', function() {
					if ($(this).children().length > 1) {
						$(this).addClass('layui-nav-itemed').siblings().removeClass('layui-nav-itemed')
					}
				})
			})
		}
		return _that
	};
	Navbar.prototype.set = function(options) {
		var that = this;
		$.extend(that.config, options);
		return that
	};
	Navbar.prototype.on = function(events, callback) {
		var that = this;
		var _con = that.config.elem;
		if (typeof(events) !== 'string') { 
			layui.msg.error('Nav error:事件名配置出错，请参考API文档.',1); 
		}
		var lIndex = events.indexOf('(');
		var eventName = events.substr(0, lIndex);
		var filter = events.substring(lIndex + 1, events.indexOf(')'));
		if (eventName === 'click') {
			if (_con.attr('lay-filter') !== undefined) {
				_con.find('li').each(function() {
					var $this = $(this);
					if ($this.find('dl').length > 0) {
						var $dd = $this.find('dd').each(function() {
							$(this).on('click', function() {
								var $a = $(this).children('a');
								var href = $a.data('url');
								var icon = $a.children('i:first').data('icon');
								var title = $a.children('cite').text();
								var data = {
									elem: $a,
									field: {
										href: href,
										icon: icon,
										title: title
									}
								};
								callback(data)
							})
						})
					} else {
						$this.on('click', function() {
							var $a = $this.children('a');
							var href = $a.data('url');
							var icon = $a.children('i:first').data('icon');
							var title = $a.children('cite').text();
							var data = {
								elem: $a,
								field: {
									href: href,
									icon: icon,
									title: title
								}
							};
							callback(data)
						})
					}
				})
			}
		}
	};
	Navbar.prototype.cleanCached = function() {
		layui.data(cacheName, null);
		localStorage.clear()
	};

	function getHtml(data) {
		var ulHtml = '';
		for (var i = 0; i < data.length; i++) {
			if (data[i].pid !== false && data[i].pid !== 'undefined') {
				ulHtml += '<li class="layui-nav-item" data-pid="' + data[i].pid + '"">'
			} else if (data[i].spread) {
				ulHtml += '<li class="layui-nav-item">'
			} else {
				ulHtml += '<li class="layui-nav-item">'
			}
			if (data[i].children !== undefined && data[i].children !== null && data[i].children.length > 0) {
				ulHtml += '<a>';
				if (data[i].icon !== undefined && data[i].icon !== '') {
					if (data[i].icon.indexOf('fa-') !== -1) {
						ulHtml += '<i class="fa ' + data[i].icon + '" data-icon="' + data[i].icon + '" aria-hidden="true" ></i>'
					} else if (data[i].icon.indexOf('icon-') !== -1) {
						ulHtml += '<i class="iconfont' + data[i].icon + '" data-icon="' + data[i].icon + '" aria-hidden="true"></i>'
					} else {
						ulHtml += '<i class="layui-icon" data-icon="' + data[i].icon + '">' + data[i].icon + '</i>'
					}
				}
				ulHtml += '<cite>' + data[i].title + '</cite>';
				ulHtml += '</a>';
				ulHtml += '<dl class="layui-nav-child">';
				for (var j = 0; j < data[i].children.length; j++) {
					ulHtml += '<dd>';
					ulHtml += '<a data-url="' + data[i].children[j].href + '">';
					if (data[i].children[j].icon !== undefined && data[i].children[j].icon !== '') {
						if (data[i].children[j].icon.indexOf('fa-') !== -1) {
							ulHtml += '<i class="fa ' + data[i].children[j].icon + '" data-icon="' + data[i].children[j].icon + '" aria-hidden="true" ></i>'
						} else if (data[i].icon.indexOf('icon-') !== -1) {
							ulHtml += '<i class="iconfont' + data[i].children[j].icon + '" data-icon="' + data[i].children[j].icon + '" aria-hidden="true"></i>'
						} else {
							ulHtml += '<i class="layui-icon" data-icon="' + data[i].children[j].icon + '">' + data[i].children[j].icon + '</i>'
						}
					}
					ulHtml += '<cite>' + data[i].children[j].title + '</cite>';
					ulHtml += '</a>';
					ulHtml += '</dd>'
				}
				ulHtml += '</dl>'
			} else {
				var dataUrl = (data[i].href !== undefined && data[i].href !== '') ? 'data-url="' + data[i].href + '"' : '';
				ulHtml += '<a ' + dataUrl + '>';
				if (data[i].icon !== undefined && data[i].icon !== '') {
					if (data[i].icon.indexOf('fa-') !== -1) {
						ulHtml += '<i class="fa ' + data[i].icon + '" data-icon="' + data[i].icon + '" aria-hidden="true"></i>'
					} else if (data[i].icon.indexOf('icon-') !== -1) {
						ulHtml += '<i class="iconfont ' + data[i].icon + '" data-icon="' + data[i].icon + '" aria-hidden="true"></i>'
					} else {
						ulHtml += '<i class="layui-icon" data-icon="' + data[i].icon + '">' + data[i].icon + '</i>'
					}
				}
				ulHtml += '<cite>' + data[i].title + '</cite>';
				ulHtml += '</a>'
			}
			ulHtml += '</li>'
		}
		return ulHtml
	}
	var navbar = new Navbar();
	exports('navbar', function(options) {
		return navbar.set(options)
	})
})