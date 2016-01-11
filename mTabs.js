/**
 * LBS mTabs
 * Date: 2014-5-10
 * ===================================================
 * opts.mtab  tabs外围容器/滑动事件对象(一个CSS选择器 或者 元素对象)
 * opts.mhead  tabs标题容器/点击对象(一个CSS选择器 或者 元素对象)
 * opts.mcontent  tabs内容容器/滑动切换对象(一个CSS选择器 或者 元素对象) 
 * opts.index  索引(默认0) 指定显示哪个索引的标题、内容
 * opts.current  当前项的类名(默认current)
 * opts.tagname  标题容器内(子节点/自定义事件)标签名(默认li)
 * ===================================================
 **/
;(function(exports, doc) {
	'use strict';
	exports.mTabs = function(opts) {
		opts = opts || {};
		if (opts.mtab === undefined) return;
		this.mtab = typeof opts.mtab === 'string' ? doc.querySelector(opts.mtab) : opts.mtab;
		if (opts.mhead === undefined) return;
		this.mhead = typeof opts.mhead === 'string' ? doc.querySelector(opts.mhead) : opts.mhead;
		if (opts.mcontent === undefined) return;
		this.mcontent = typeof opts.mcontent === 'string' ? doc.querySelector(opts.mcontent) : opts.mcontent;
		// this.mtab = document.querySelector(opts.mtab);
		// this.mhead = document.querySelector(opts.mhead);
		// this.mcontent = document.querySelector(opts.mcontent);
		this.tagname = opts.tagname || 'li';
		// this.mheads = this.mhead.querySelectorAll(this.tagname);
		this.mheads = this.mhead.children;
		this.mcontents = this.mcontent.children;

		this.length = this.mheads.length;
		if (this.length < 1) return;
		if (opts.index > this.length - 1) opts.index = this.length - 1;
		this.index = this.oIndex = opts.index || 0;
		this.current = opts.current || 'current';
		this.touch = {};
		this.cache = {};

		this.init();
	};
	mTabs.prototype = {
		init: function(opts) {
			this.initSet();
			this.bind();
		},
		initSet: function() {
			this.refix();
			for (var i = 0; i < this.length; i++) {
				this.mheads[i].index = i;
				this.mheads[i].className = this.mheads[i].className.replace(this.current, '');
				this.mcontents[i].className = this.mcontents[i].className.replace(this.current, '');
			}
			this.mheads[this.index].className += ' ' + this.current;
			this.mcontents[this.index].className += ' ' + this.current;
		},
		refix: function() {
			this.width = doc.documentElement.clientWidth || doc.body.clientWidth;
			this.mcontent.style.width = this.length * this.width + 'px';
			for (var i = 0; i < this.length; i++) this.mcontents[i].style.width = this.width + 'px';
			this.setTransform(-this.index * this.width);
		},
		bind: function() {
			var _this = this;
			this.on(this.mtab, ['touchstart', 'pointerdown', 'MSPointerDown'], function(e) {
				_this.touchStart(e);
			});
			this.on(this.mtab, ['touchmove', 'pointermove', 'MSPointerMove'], function(e) {
				_this.touchMove(e);
			});
			this.on(this.mtab, ['touchend', 'touchcancel', 'pointerup', 'pointercancel', 'MSPointerUp', 'MSPointerCancel'], function(e) {
				_this.touchEnd(e);
			});
			this.on(this.mcontent, ['transitionEnd', 'webkitTransitionEnd', 'oTransitionEnd', 'MSTransitionEnd'], function(e) {
				_this.transitionEnd(e);
			});
			this.on(this.mhead, 'click', function(e) {
				_this.touchClick(e);
			});
			this.on(window, ['resize', 'orientationchange'], function(e) {
				_this.timer && clearTimeout(_this.timer);
				_this.timer = setTimeout(function() {
					_this.refix();
				}, 100);
			});
		},
		touchStart: function(e) {
			var point = e.touches ? e.touches[0] : e;
			this.touch.x = point.pageX;
			this.touch.y = point.pageY;
			// this.touch.x = e.touches[0].pageX;
			// this.touch.y = e.touches[0].pageY;
			this.touch.time = Date.now();
			this.touch.disX = 0;
			this.touch.disY = 0;
			this.touch.fixed = '';
		},
		touchMove: function(e) {
			if (this.touch.fixed === 'up') return;
			var point = e.touches ? e.touches[0] : e;
			this.touch.disX = point.pageX - this.touch.x;
			this.touch.disY = point.pageY - this.touch.y;
			// this.touch.disX = e.touches[0].pageX - this.touch.x;
			// this.touch.disY = e.touches[0].pageY - this.touch.y;
			if (this.touch.fixed === '') {
				if (Math.abs(this.touch.disY) > Math.abs(this.touch.disX)) {
					this.touch.fixed = 'up';
				} else {
					this.touch.fixed = 'left';
				}
			}
			if (this.touch.fixed === 'left') {
				e.stopPropagation();
				e.preventDefault();
				if ((this.index === 0 && this.touch.disX > 0) || (this.index === this.length - 1 && this.touch.disX < 0)) this.touch.disX /= 4;
				this.setTransform(this.touch.disX - this.index * this.width);
			}
		},
		touchEnd: function(e) {
			if (this.touch.fixed === 'left') {
				var _this = this,
					X = Math.abs(this.touch.disX);
				this.setTransition(300);
				if ((Date.now() - this.touch.time > 100 && X > 10) || X > this.width / 2) {
					this.touch.disX > 0 ? this.index-- : this.index++;
					this.index < 0 && (this.index = 0);
					this.index > this.length - 1 && (this.index = this.length - 1);
					if (this.index !== this.oIndex) {
						this.setTransition(100);
						this.update();
					}
				}
				this.setTransform(-this.index * this.width);
			}
		},
		transitionEnd: function() {
			this.setTransition();
		},
		touchClick: function(e) {
			var target = e.target;
			if (target.nodeType === 1 && target.tagName.toUpperCase() === this.tagname.toUpperCase()) {
				if (target.index === this.index) return;
				e.preventDefault();
				e.stopPropagation();
				this.index = target.index;
				this.update();
				this.setTransition(100);
				this.setTransform(-this.index * this.width);
			}
		},
		update: function() {
			this.mheads[this.index].className += ' ' + this.current;
			this.mheads[this.oIndex].className = this.mheads[this.oIndex].className.replace(this.current, '').trim();
			this.mcontents[this.index].className += ' ' + this.current;
			this.mcontents[this.oIndex].className = this.mcontents[this.oIndex].className.replace(this.current, '').trim();
			this.oIndex = this.index;
		},
		on: function(el, types, handler) {
			if (typeof types === 'string') return el.addEventListener(types, handler, false);
			for (var i = 0, l = types.length; i < l; i++) el.addEventListener(types[i], handler, false);
		},
		setTransition: function(time) {
			time = time || 0;
			this.setStyle(this.mcontent, 'transition', 'all ' + time + 'ms');
		},
		setTransform: function(v) {
			v = v || 0;
			this.setStyle(this.mcontent, 'transform', 'translate3d(' + v + 'px,0px,0px)');
			// this.setStyle(this.mcontent, 'transform', 'translateX(' + v + 'px)');
		},
		setStyle: function(el, p, v) {
			!this.cache[el] && (this.cache[el] = {});
			!this.cache[el][p] && (this.cache[el][p] = this.prefix(p));
			el.style[this.cache[el][p] || this.prefix(p)] = v;
		},
		prefix: function(p) {
			var style = document.createElement('div').style;
			if (p in style) return p;
			var prefix = ['webkit', 'Moz', 'ms', 'O'],
				i = 0,
				l = prefix.length,
				s = '';
			for (; i < l; i++) {
				s = prefix[i] + '-' + p;
				s = s.replace(/-\D/g, function(match) {
					return match.charAt(1).toUpperCase();
				});
				if (s in style) return s;
			}
		}
	}
}(window, document));