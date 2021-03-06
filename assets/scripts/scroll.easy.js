define(['scroll'], function(Scroller) {
	function EasyScroller(content, options) {
		
		this.content = content;
		this.container = content.parentNode;
		this.options = options || {};

		// create Scroller instance
		var that = this;
		this.scroller = new Scroller(function(left, top, zoom) {
			that.render(left, top, zoom);
		}, options);

		// bind events
		this.bindEvents();

		// the content element needs a correct transform origin for zooming
		this.content.style[EasyScroller.vendorPrefix + 'TransformOrigin'] = "left top";

		// reflow for the first time
		this.reflow();

	};

	EasyScroller.prototype.render = (function() {
		
		var docStyle = document.documentElement.style;
		
		var engine;
		if (window.opera && Object.prototype.toString.call(opera) === '[object Opera]') {
			engine = 'presto';
		} else if ('MozAppearance' in docStyle) {
			engine = 'gecko';
		} else if ('WebkitAppearance' in docStyle) {
			engine = 'webkit';
		} else if (typeof navigator.cpuClass === 'string') {
			engine = 'trident';
		}
		
		var vendorPrefix = EasyScroller.vendorPrefix = {
			trident: 'ms',
			gecko: 'Moz',
			webkit: 'Webkit',
			presto: 'O'
		}[engine];
		
		var helperElem = document.createElement("div");
		var undef;
		
		var perspectiveProperty = vendorPrefix + "Perspective";
		var transformProperty = vendorPrefix + "Transform";
		
		if (helperElem.style[perspectiveProperty] !== undef) {
			
			return function(left, top, zoom) {
				this.content.style[transformProperty] = 'translate3d(' + (-left) + 'px,' + (-top) + 'px,0) scale(' + zoom + ')';
			};	
			
		} else if (helperElem.style[transformProperty] !== undef) {
			
			return function(left, top, zoom) {
				this.content.style[transformProperty] = 'translate(' + (-left) + 'px,' + (-top) + 'px) scale(' + zoom + ')';
			};
			
		} else {
			
			return function(left, top, zoom) {
				this.content.style.marginLeft = left ? (-left/zoom) + 'px' : '';
				this.content.style.marginTop = top ? (-top/zoom) + 'px' : '';
				this.content.style.zoom = zoom || '';
			};
			
		}
	})();

	EasyScroller.prototype.reflow = function(innerWidth, innerHeight) {

		// set the right scroller dimensions
		this.scroller.setDimensions(this.container.clientWidth, this.container.clientHeight, innerWidth || this.content.offsetWidth, innerHeight || this.content.offsetHeight);

		// refresh the position for zooming purposes
		var rect = this.container.getBoundingClientRect();
		this.scroller.setPosition(rect.left + this.container.clientLeft, rect.top + this.container.clientTop);
		
	};

	EasyScroller.prototype.scrollTo = function(x,y,animate) {
		return this.scroller.scrollTo(x,y,animate);
	}

	EasyScroller.prototype.bindEvents = function() {

		var that = this;

		// reflow handling
		window.addEventListener("resize", function() {
			that.reflow();
		}, false);

		// touch devices bind touch events
		if ('ontouchstart' in window) {

			this.container.addEventListener("touchstart", function(e) {

				// Don't react if initial down happens on a form element
				if (e.touches[0] && e.touches[0].target && e.touches[0].target.tagName.match(/input|textarea|select/i)) {
					return;
				}

				that.scroller.doTouchStart(e.touches, e.timeStamp);
				e.preventDefault();

			}, false);

			document.addEventListener("touchmove", function(e) {
				that.scroller.doTouchMove(e.touches, e.timeStamp, e.scale);
			}, false);

			document.addEventListener("touchend", function(e) {
				that.scroller.doTouchEnd(e.timeStamp);
			}, false);

			document.addEventListener("touchcancel", function(e) {
				that.scroller.doTouchEnd(e.timeStamp);
			}, false);

		// non-touch bind mouse events
		} else {
			
			var mousedown = false;

			this.container.addEventListener("mousedown", function(e) {

				if (e.target.tagName.match(/input|textarea|select/i)) {
					return;
				}
			
				that.scroller.doTouchStart([{
					pageX: e.pageX,
					pageY: e.pageY
				}], e.timeStamp);

				mousedown = true;
				e.preventDefault();

			}, false);

			document.addEventListener("mousemove", function(e) {

				if (!mousedown) {
					return;
				}
				
				that.scroller.doTouchMove([{
					pageX: e.pageX,
					pageY: e.pageY
				}], e.timeStamp);

				mousedown = true;

			}, false);

			document.addEventListener("mouseup", function(e) {

				if (!mousedown) {
					return;
				}
				
				that.scroller.doTouchEnd(e.timeStamp);

				mousedown = false;

			}, false);

			this.container.addEventListener("mousewheel", function(e) {
				

				if (that.scroller.options.scrollingX)
					that.scroller.scrollBy(-e.wheelDelta, 0, true);	
				else if (that.scroller.options.scrollingY)
					that.scroller.scrollBy(0, -e.wheelDelta, true);
				



				e.stopImmediatePropagation();
				e.preventDefault();
					
				
				
			}, false);

		}

	};

	return EasyScroller;
});

