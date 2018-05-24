/**
 * 消息组件简单封装
 * Autor: liwl
 * Date: 2017-08-02
 */
layui.define(['layer'], function(exports) {
	"use strict";
	var $ = layui.jquery;
	function msg() {
        this.version = '2.0';
        this.shade = [0.02, '#000'];
        this.closeIndexs = {};
    }  
	
    msg.prototype.close = function () {
        if (!this.closeIndexs['_' + this.index]) {
            this.closeIndexs['_' + this.index] = true;
            return layer.close(this.index);
        }
    };
 
    msg.prototype.alert = function (msg, callback) {
        this.close();
        return this.index = layer.alert(msg, {end: callback, scrollbar: false});
    };

 
    msg.prototype.confirm = function (msg, ok, no) {
        var self = this;
        this.index = layer.confirm(msg, {btn: ['确认', '取消']}, function () {
            typeof ok === 'function' && ok.call(this);
//            self.close();
        }, function () {
            typeof no === 'function' && no.call(this);
//            self.close();
        });
        return this.index;
    };

    
    msg.prototype.success = function (msg, time, callback) {
        this.close();
        return this.index = layer.msg(msg, {
            icon: 1,
            shade: this.shade,
            scrollbar: false,
            end: callback,
            time: (time || 2) * 1000,
            shadeClose: true
        });
    };
 
    msg.prototype.error = function (msg, time, callback) {
        this.close();
        return this.index = layer.msg(msg, {
            icon: 2,
            shade: this.shade,
            scrollbar: false,
            time: (time || 3) * 1000,
            end: callback,
            shadeClose: true
        });
    };
 
    msg.prototype.tips = function (msg, time, callback) {
        this.close();
        return this.index = layer.msg(msg, {
            time: (time || 3) * 1000,
            shade: this.shade,
            end: callback,
            shadeClose: true
        });
    };
    
    msg.prototype.loading = function (msg, callback) {
        this.close();
        return this.index = msg
                ? layer.msg(msg, {icon: 16, scrollbar: false, shade: this.shade, time: 0, end: callback})
                : layer.load(2, {time: 0, scrollbar: false, shade: this.shade, end: callback});
    }; 
    exports('msg', new msg());
})