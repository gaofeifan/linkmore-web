layui.config({
	base: '/web/js/lib/'
}).extend({
	msg: 'msg',
	common: 'common',
	datatable: 'datatable'
});
Date.prototype.format = function (format) {
	var o = {
		"M+": this.getMonth() + 1, //month
		"d+": this.getDate(),    //day
		"h+": this.getHours(),   //hour
		"m+": this.getMinutes(), //minute
		"s+": this.getSeconds(), //second
		"q+": Math.floor((this.getMonth() + 3) / 3),  //quarter
		"S": this.getMilliseconds() //millisecond
	};
	if (/(y+)/.test(format)) format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	for (var k in o) {
		if (new RegExp("(" + k + ")").test(format)) {
			format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
		}
	}
	return format;
};
layui.use(['layer', 'msg', 'form', 'common', 'laydate', 'datatable'], function () {
	var validate = layui.validate;
	var session = window.sessionStorage;
	var layer = layui.layer;
	var $ = layui.jquery;
	var form = layui.form;
	var laydate = layui.laydate;

	laydate.render({
		elem: '#search-start',
		min: '2015-06-16 23:59:59',
		max: new Date().format('yyyy-MM-dd'),
		istoday: false
	});
	laydate.render({
		elem: '#search-end',
		min: '2015-06-16 23:59:59',
		max: new Date().format('yyyy-MM-dd'),
		istoday: false
	});

	var prefList = null;

	var prefHtml = '';
	var prefMap = layui.common.map();
	layui.common.ajax({
		url:'/admin/account/code-pre/selectAll',
		contentType: 'application/json; charset=utf-8',
		async:false,
		success:function(list){
			prefList = list;
			prefHtml = '<option value="N">选择专区</option>';
			$.each(list,function(index,pref){
				console.log(pref.parkCode);
				prefMap.put(pref.parkCode,pref);
				prefHtml += '<option value='+pref.parkCode+'>';
				prefHtml += pref.parkName;
				prefHtml += '</option>';
			});
			$('#select-pre-search').html(prefHtml);
			form.render('select');
		},error:function(){
			
		}
	});


	var draw = function (settings, json) {
		console.log("绑定点击")
		$(".operation-delete").unbind('click').bind('click', deleteTemplate);
		$(".operation-down").unbind('click').bind('click', download);
	};

	function deleteTemplate() {
		var id = $(this).attr('data-delete-id');

		layui.msg.confirm('您确定要删除', function () {
			layui.common.ajax({
				url: '/admin/account/code-pre/delete',
				data: id,
				contentType: 'application/json; charset=utf-8',
				success: function (res) {
					if (res.success) {
						layui.msg.success(res.content);
						window.setTimeout(query, 1000);
					} else {
						layui.msg.error(res.content);
					}

				}, error: function () {

				}
			});
		});
	}

	function download() {
		var id = $(this).attr('data-down-id');
		var msg = null;
		layui.common.ajax({
			url: '/admin/account/code-pre/down',
			data: id,
			contentType: 'application/json; charset=utf-8',
			async: false,
			success: function (res) {
				console.log(res);
				msg = res.url;
			}, error: function () {

			}
		});
		qrcode1 = new QRCode(document.getElementById("qrcode"), {
			text: msg,
			width: 300, //生成的二维码的宽度
			height: 300, //生成的二维码的高度
			colorDark: "#000000", // 生成的二维码的深色部分
			colorLight: "#ffffff", //生成二维码的浅色部分
			correctLevel: QRCode.CorrectLevel.H
		});

		var canvas = $('#qrcode').find("canvas").get(0);
		var url = canvas.toDataURL('image/jpeg');

		var link = document.createElement("a");

		link.setAttribute("href", url);
		link.setAttribute("download", '123.png');
		link.click();

		$('#qrcode').html(null);
		return false;
	}


	var addServerParams = function (data) {
		var filters = new Array();
		var filter = null;


		var payType = $('#select-pre-search').val();
		if (payType != 'N') {
			filter = new Object();
			filter.property = 'preId';
			filter.value = payType;
			filters.push(filter);
		}
		var startTime = $('#search-start').val();
		if (startTime != '') {
			filter = new Object();
			filter.property = 'startTime';
			filter.value = startTime;
			filters.push(filter);
		}
		var endTime = $('#search-end').val();
		if (endTime != '') {
			filter = new Object();
			filter.property = 'endTime';
			filter.value = endTime;
			filters.push(filter);
		}
		if (filters.length > 0) {
			data.push({ name: 'filterJson', value: JSON.stringify({ filters: filters }) });
		}
	};
	var datatable = layui.datatable.init({
		id: 'amount-table',
		url: '/admin/account/code-pre/list',
		key: 'id',
		columns: [
			{ sTitle: 'id', mData: 'id' },
			{ sTitle: '车区', mData: 'name' },
			{
				sTitle: '微信帐号',
				mData: 'w_appId',
				mRender: function (mData, type, full) {
					//return '<label style="color:#4898d5;">'+mData+ '元';
					if (mData == null) {
						return '未配置';
					} else {
						return mData;
					}
				}
			},
			{
				sTitle: '支付宝帐号',
				mData: 'z_appId',
				mRender: function (mData, type, full) {
					//return '<label style="color:#FF5722;">'+mData+ '元';
					if (mData == null) {
						return '未配置';
					} else {
						return mData;
					}
				}
			}, {
				sTitle: '微信总额/元',
				mData: 'w_m',
				mRender: function (mData, type, full) {
					if (mData == null) {
						return '0';
					} else {
						return mData;
					}
				}
			}, {
				sTitle: '支付宝总额/元',
				mData: 'z_m',
				mRender: function (mData, type, full) {
					if (mData == null) {
						return '0';
					} else {
						return mData;
					}
				}
			},

			{
				sTitle: '创建时间',
				mData: 'create_time',
				bSortable: true,
				mRender: function (mData, type, full) {
					return new Date(mData).format('yyyy-MM-dd hh:mm');
				}
			},
			{
				sTitle: '操作',
				mRender: function (mData, type, full) {
					console.log(full.preId);
					var html = '<a class="operation-delete" data-delete-id="' + full.preId + '" href="javascript:void(0);">删除</a>&nbsp;&nbsp;&nbsp;&nbsp;';
					html += '<a class="operation-down" data-down-id="' + full.preId + '" href="javascript:void(0);">下载二维码</a>&nbsp;&nbsp;&nbsp;&nbsp;';
					return html;
				}
			}
		],
		orderIndex: 1,
		orderType: 'desc',
		draw: draw,
		filter: addServerParams
	});

	var query = function () {
		datatable.reload();

	};
	$('#search-button').bind('click', function () {
		query();
	});


	var addInit = function (validate, lindex) {
		$('#app-version-add-form select[name=preId]').html(prefHtml);
		form.render('select');
	
		$('#app-version-cancel-button').bind('click', function () {
			layui.layer.close(lindex);
		});

		form.on('select(type)', function(data) {
			var type = data.value;  
			$('#priKey').show();
			$('#pubKey').show();
			$('#appSecret').show();
			console.info(type);
			if(type=="wx"){
				$('#priKey').hide();
				$('#pubKey').hide();
			}else{
				$('#appSecret').hide();
			}
        });

		$('#app-version-add-button').bind('click', function () {
			if (validate.valid()) {
				layui.common.ajax({
					url: '/admin/account/code-pre/save',
					data: $('#app-version-add-form').serialize(),
					success: function (res) {
						if (res.success) {
							layui.layer.close(lindex);
							layui.msg.success(res.content);
							window.setTimeout(query, 1000);
						}
					}
				});
			}
		});
	};

	$('#add-button').bind('click', function () {
		var param = new Object();
		param.url = 'add.html';
		param.title = '添加信息';
		var valid = new Object();
		valid.id = "app-version-add-form";

		valid.messages = {
			name: {
				rangelength: '名称长度应在[1,32]内',
				required: '请填写名称',
				remote: '名称已经存在'
			}, version: {
				rangelength: '版本长度应在[1,32]内',
				required: '请填写版本'
			}, code: {
				digits: '排序请输入编号',
				required: '请填写编号'
			}, url: {
				rangelength: '下载地址的长度应在[0,120]内',
			}, description: {
				rangelength: '描述长度应在[0,500]内',
			}
		};
		param.validate = valid;
		param.width = 600;
		param.init = addInit;
		layui.common.modal(param);
	});




});