/**
 * @author linkmore 2017-08-01 / navtab.js 
 * @link      http://www.pabeitech.com/ 
 * @version   [0.01] 
 */
layui.define(['jquery', 'elements', 'layer', 'msg'], function(exports) {
	"use strict";
	var $ = layui.jquery,
		layer = parent.layer === undefined ? layui.layer : parent.layer,
		module_name = 'navtab',
		elements = layui.elements(), 
		globalTabIdIndex = 0,
		Navtab = function() {
			this.config = {
				elem: undefined,
				closed: true,
				autoRefresh: false
			}
		};
	var ELEM = {};
	Navtab.prototype.set = function(options) {
		var that = this;
		$.extend(true, that.config, options);
		return that
	};
	Navtab.prototype.init = function() {
		var that = this;
		var _config = that.config;
		if (typeof(_config.elem) !== 'string' && typeof(_config.elem) !== 'object') {
			layui.msg.error('Navtab error: elem参数未定义或设置出错，具体设置格式请参考文档API.',1); 
		}
		var $container;
		if (typeof(_config.elem) === 'string') {
			$container = $('' + _config.elem + '')
		}
		if (typeof(_config.elem) === 'object') {
			$container = _config.elem
		}
		if ($container.length === 0) {
			layui.msg.error('Navtab error: 找不到elem参数配置的容器',1);  
		}
		var filter = $container.attr('lay-filter');
		if (filter === undefined || filter === '') { 
			layui.msg.error('Navtab error: 请为elem容器设置一个lay-filter过滤器',1);   
		}
		_config.elem = $container;
		ELEM.titleBox = $container.find('.linkmore-title-box').children('ul.layui-tab-title');
		ELEM.contentBox = $container.children('div.layui-tab-content');
		ELEM.tabFilter = filter;
		ELEM.tabCtrlBox = $container.find('#buttonRCtrl');
		return that
	};
	Navtab.prototype.exists = function(title) {
		var that = ELEM.titleBox === undefined ? this.init() : this,
			tabIndex = -1;
		ELEM.titleBox.find('li').each(function(i, e) {
			var $em = $(this).children('em');
			if ($em.text() === title) {
				tabIndex = i
			}
		});
		return tabIndex
	};
	Navtab.prototype.getTabId = function(title) {
		var that = ELEM.titleBox === undefined ? this.init() : this,
			tabId = -1;
		ELEM.titleBox.find('li').each(function(i, e) {
			var $em = $(this).children('em');
			if ($em.text() === title) {
				tabId = $(this).attr('lay-id')
			}
		});
		return tabId
	};
	Navtab.prototype.getCurrentTabId = function() {
		var that = this;
		var _config = that.config;
		return $(_config.elem).find('ul.layui-tab-title').children('li.layui-this').attr('lay-id')
	};
	Navtab.prototype.deleteTab = function(id) {
		var that = this;
		elements.tabDelete(ELEM.tabFilter, id);
		return that
	};
	Navtab.prototype.tabAdd = function(data) {
		var that = this;
		var _config = that.config;
		var tabIndex = that.exists(data.title);
		if (tabIndex === -1) {
			globalTabIdIndex++;
			var content = '<iframe src="' + data.href + '" data-id="' + globalTabIdIndex + '"   name="ifr_' + globalTabIdIndex + '"   id="ifr' + globalTabIdIndex + '" class="linkmore-iframe"></iframe>';
			var title = '';
			if (data.icon !== undefined) {
				if (data.icon.indexOf('fa-') !== -1) {
					title += '<i class="fa ' + data.icon + '" aria-hidden="true"></i>'
				} else if (data.icon.indexOf('icon-') !== -1) {
					title += '<i class="iconfont ' + data.icon + '" aria-hidden="true"></i>'
				} else {
					title += '<i class="layui-icon">' + data.icon + '</i>'
				}
			}
			title += '<em>' + data.title + '</em>';
			if (_config.closed) {
				title += '<i class="layui-icon layui-unselect layui-tab-close" data-id="' + globalTabIdIndex + '">ဆ</i>'
			}
			elements.tabAdd(ELEM.tabFilter, {
				title: title,
				content: content,
				id: globalTabIdIndex
			});
			that.tabMove(tabIndex, 0);
			ELEM.contentBox.find('iframe[data-id=' + globalTabIdIndex + ']').each(function() {
				$(this).height(ELEM.contentBox.height());
				/*layer.msg('正在加载请稍后...', {
					icon: 6
				})*/
			});
			$('#ifr' + globalTabIdIndex).load(function() {
				layer.closeAll()
			});
			if (_config.closed) {
				ELEM.titleBox.find('li').children('i.layui-tab-close[data-id=' + globalTabIdIndex + ']').on('click', function() {
					elements.tabDelete(ELEM.tabFilter, $(this).parent('li').attr('lay-id')).init();
					that.tabMove(tabIndex, 1)
				})
			}
			elements.tabChange(ELEM.tabFilter, that.getTabId(data.title));
			that.tabMove(tabIndex, 0)
		} else {
			elements.tabChange(ELEM.tabFilter, that.getTabId(data.title));
			that.tabMove(tabIndex, 0);
			if (_config.autoRefresh) {
				_config.elem.find('div.layui-tab-content > div').eq(tabIndex).children('iframe')[0].contentWindow.location.reload()
			}
		}
		//tab标签添加长度判断,如果长度满了,显示左右滑动按钮
		var tabWidth = parseInt($('#linkmore-tab .linkmore-title-box').width() - $('#titleLeft').width() - $('#titleRbox').width());
		var $tabNav = ELEM.titleBox.find('li'),
			tab_all_width = 0;
		$tabNav.each(function(i, n) {
			tab_all_width += $(n).outerWidth(true)
		});
		if (!$tabNav[0]) {
			return
		}
		if (tab_all_width > tabWidth + 1) {
			//css文件样式的修改
			$('#titleLeft').css('display','inline');
			$('ul.layui-tab-title').css('left','41px');
			
			$('#titleRight').css('display','inline');
			$('.layui-tab .linkmore-title-box .title-right').css('width','230px');
			$('.layui-tab .linkmore-title-box .title-right .refresh').css('left','41px');
			$('.layui-tab .linkmore-title-box .title-right .often').css('left','109px');
		}
	};
	Navtab.prototype.tabMove = function(index, scene) {
		$(window).on('resize', function() {
			var tabWidth = parseInt($('#linkmore-tab .linkmore-title-box').width() - $('#titleLeft').width() - $('#titleRbox').width());
			var $tabNav = ELEM.titleBox.find('li'),
				tab_all_width = 0;
			$tabNav.each(function(i, n) {
				tab_all_width += $(n).outerWidth(true)
			});
			if (!$tabNav[0]) {
				return
			}
			if (tab_all_width > tabWidth + 1) {
				var ml = tabWidth - tab_all_width - 1;
				if (ml < 0) {
					if (index >= 0) {
						var current_tab_left = parseInt(ELEM.titleBox.find('.layui-this').position().left),
							curent_tab_ml = parseInt(ELEM.titleBox.css("marginLeft")),
							curent_ml = current_tab_left + parseInt(curent_tab_ml);
						if (curent_ml <= 0) {
							ml = 0 - current_tab_left
						} else {
							var is_show = -(curent_tab_ml - tabWidth + parseInt(ELEM.titleBox.find('.layui-this').outerWidth(true)) + current_tab_left + 1);
							if (is_show <= 0) {
								ml = tabWidth - current_tab_left - parseInt(ELEM.titleBox.find('.layui-this').outerWidth(true)) - 1
							} else {
								if (scene == 1 && parseInt(curent_tab_ml) < 0) {
									ml = tabWidth - current_tab_left - parseInt(ELEM.titleBox.find('.layui-this').outerWidth(true)) - 1;
									if (ml > 0) {
										ml = 0
									}
								} else {
									return
								}
							}
						}
					}
					ELEM.titleBox.css({
						"marginLeft": ml
					})
				}
			} else {
				ELEM.titleBox.css({
					"marginLeft": 0
				})
			}
			$('.pressKey').bind("click", function() {
				if ($(this).attr('id') == 'titleLeft') {
					if (ml !== undefined && ml < 0) {
						ELEM.titleBox.css({
							"marginLeft": ml
						})
					}
				}
				if ($(this).attr('id') == 'titleRight') {
					ELEM.titleBox.css({
						"marginLeft": 0
					})
				}
			})
		}).resize()
	};
	Navtab.prototype.tabCtrl = function(eventsName) {
		var that = this;
		var _config = that.config;
		this.init();
		var currentTabID = that.getCurrentTabId();
		switch (eventsName) {
		case 'closeCurrent':
			if (currentTabID > 0) {
				elements.tabDelete(ELEM.tabFilter, currentTabID);
				that.tabMove(currentTabID, 1)
			} else { 
				layui.msg.error('提示您：默认首页不能关闭的哦！',1);  
			}
			break;
		case 'closeOther':
			if (ELEM.titleBox.children('li').length > 2) {
				ELEM.titleBox.children('li').each(function() {
					var $t = $(this);
					var id1 = $t.find('i.layui-tab-close').data('id');
					if (id1 != currentTabID && id1 !== undefined) {
						elements.tabDelete(ELEM.tabFilter, $t.attr('lay-id'));
						that.tabMove(currentTabID, 1)
					}
				})
			} else if (ELEM.titleBox.children('li').length == 2) { 
				layui.msg.error('提示您：其他选项卡【默认首页】不能关闭！',1);   
			} else { 
				layui.msg.error('提示您：当前无其他可关闭选项卡！',1);    
			}
			break;
		case 'closeAll':
			if (ELEM.titleBox.children('li').length > 1) {
				ELEM.titleBox.children('li').each(function() {
					var $t = $(this);
					var id1 = $t.find('i.layui-tab-close').data('id');
					if (id1 > 0) {
						elements.tabDelete(ELEM.tabFilter, id1);
						that.tabMove(0, 1)
					}
				})
			} else { 
				layui.msg.error('提示您：当前无其他可关闭选项卡！',1);  
			}
			break;
		case 'refreshAdmin':
			layer.confirm('您确定真的要重新加载后台系统界面！', {
				title: '友情提示',
				time: 0,
				resize: false,
				btn: ['我很确定', '不,我点错了'],
				btnAlign: 'c',
				zIndex: layer.zIndex,
				anim: Math.ceil(Math.random() * 6)
			}, function() {
				location.reload()
			}, function() {
				return
			});
			break
		}
	};
	Navtab.prototype.on = function(events, callback) {
		var that = this;
		var _config = that.config;
		this.init();
		if (typeof(events) !== 'string') { 
			layui.msg.error('Nav error:事件名配置出错，请参考API文档.',1);  
		}
		var lIndex = events.indexOf('(');
		var eventName = events.substr(0, lIndex);
		var filter = events.substring(lIndex + 1, events.indexOf(')'));
		if (eventName === 'click') {
			if (ELEM.tabCtrlBox.attr('lay-filter') == 'viewOperate') {} else {
				layui.msg.error('Nav error:当前传入的lay-filter是' + filter + ';而非viewOperate',1);  
			}
		} else { 
			layui.msg.error('Nav error:当前传入的事件名是' + eventName + ';非点击事件，其他功能稍后续！',1);   
		}
	};
	var navtab = new Navtab();
	exports(module_name, function(options) {
		return navtab.set(options)
	})
})