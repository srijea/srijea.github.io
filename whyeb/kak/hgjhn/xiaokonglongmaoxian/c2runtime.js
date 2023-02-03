﻿var cr = {};
cr.plugins_ = {};
cr.behaviors = {};
if (typeof Object.getPrototypeOf !== "function")
{
	if (typeof "test".__proto__ === "object")
	{
		Object.getPrototypeOf = function(object) {
			return object.__proto__;
		};
	}
	else
	{
		Object.getPrototypeOf = function(object) {
			return object.constructor.prototype;
		};
	}
}
(function(){
	cr.logexport = function (msg)
	{
		if (window.console && window.console.log)
			window.console.log(msg);
	};
	cr.seal = function(x)
	{
		return x;
	};
	cr.freeze = function(x)
	{
		return x;
	};
	cr.is_undefined = function (x)
	{
		return typeof x === "undefined";
	};
	cr.is_number = function (x)
	{
		return typeof x === "number";
	};
	cr.is_string = function (x)
	{
		return typeof x === "string";
	};
	cr.isPOT = function (x)
	{
		return x > 0 && ((x - 1) & x) === 0;
	};
	cr.nextHighestPowerOfTwo = function(x) {
		--x;
		for (var i = 1; i < 32; i <<= 1) {
			x = x | x >> i;
		}
		return x + 1;
	}
	cr.abs = function (x)
	{
		return (x < 0 ? -x : x);
	};
	cr.max = function (a, b)
	{
		return (a > b ? a : b);
	};
	cr.min = function (a, b)
	{
		return (a < b ? a : b);
	};
	cr.PI = Math.PI;
	cr.round = function (x)
	{
		return (x + 0.5) | 0;
	};
	cr.floor = function (x)
	{
		if (x >= 0)
			return x | 0;
		else
			return (x | 0) - 1;		// correctly round down when negative
	};
	cr.ceil = function (x)
	{
		var f = x | 0;
		return (f === x ? f : f + 1);
	};
	function Vector2(x, y)
	{
		this.x = x;
		this.y = y;
		cr.seal(this);
	};
	Vector2.prototype.offset = function (px, py)
	{
		this.x += px;
		this.y += py;
		return this;
	};
	Vector2.prototype.mul = function (px, py)
	{
		this.x *= px;
		this.y *= py;
		return this;
	};
	cr.vector2 = Vector2;
	cr.segments_intersect = function(a1x, a1y, a2x, a2y, b1x, b1y, b2x, b2y)
	{
		var max_ax, min_ax, max_ay, min_ay, max_bx, min_bx, max_by, min_by;
		if (a1x < a2x)
		{
			min_ax = a1x;
			max_ax = a2x;
		}
		else
		{
			min_ax = a2x;
			max_ax = a1x;
		}
		if (b1x < b2x)
		{
			min_bx = b1x;
			max_bx = b2x;
		}
		else
		{
			min_bx = b2x;
			max_bx = b1x;
		}
		if (max_ax < min_bx || min_ax > max_bx)
			return false;
		if (a1y < a2y)
		{
			min_ay = a1y;
			max_ay = a2y;
		}
		else
		{
			min_ay = a2y;
			max_ay = a1y;
		}
		if (b1y < b2y)
		{
			min_by = b1y;
			max_by = b2y;
		}
		else
		{
			min_by = b2y;
			max_by = b1y;
		}
		if (max_ay < min_by || min_ay > max_by)
			return false;
		var dpx = b1x - a1x + b2x - a2x;
		var dpy = b1y - a1y + b2y - a2y;
		var qax = a2x - a1x;
		var qay = a2y - a1y;
		var qbx = b2x - b1x;
		var qby = b2y - b1y;
		var d = cr.abs(qay * qbx - qby * qax);
		var la = qbx * dpy - qby * dpx;
		if (cr.abs(la) > d)
			return false;
		var lb = qax * dpy - qay * dpx;
		return cr.abs(lb) <= d;
	};
	function Rect(left, top, right, bottom)
	{
		this.set(left, top, right, bottom);
		cr.seal(this);
	};
	Rect.prototype.set = function (left, top, right, bottom)
	{
		this.left = left;
		this.top = top;
		this.right = right;
		this.bottom = bottom;
	};
	Rect.prototype.copy = function (r)
	{
		this.left = r.left;
		this.top = r.top;
		this.right = r.right;
		this.bottom = r.bottom;
	};
	Rect.prototype.width = function ()
	{
		return this.right - this.left;
	};
	Rect.prototype.height = function ()
	{
		return this.bottom - this.top;
	};
	Rect.prototype.offset = function (px, py)
	{
		this.left += px;
		this.top += py;
		this.right += px;
		this.bottom += py;
		return this;
	};
	Rect.prototype.normalize = function ()
	{
		var temp = 0;
		if (this.left > this.right)
		{
			temp = this.left;
			this.left = this.right;
			this.right = temp;
		}
		if (this.top > this.bottom)
		{
			temp = this.top;
			this.top = this.bottom;
			this.bottom = temp;
		}
	};
	Rect.prototype.intersects_rect = function (rc)
	{
		return !(rc.right < this.left || rc.bottom < this.top || rc.left > this.right || rc.top > this.bottom);
	};
	Rect.prototype.intersects_rect_off = function (rc, ox, oy)
	{
		return !(rc.right + ox < this.left || rc.bottom + oy < this.top || rc.left + ox > this.right || rc.top + oy > this.bottom);
	};
	Rect.prototype.contains_pt = function (x, y)
	{
		return (x >= this.left && x <= this.right) && (y >= this.top && y <= this.bottom);
	};
	Rect.prototype.equals = function (r)
	{
		return this.left === r.left && this.top === r.top && this.right === r.right && this.bottom === r.bottom;
	};
	cr.rect = Rect;
	function Quad()
	{
		this.tlx = 0;
		this.tly = 0;
		this.trx = 0;
		this.try_ = 0;	// is a keyword otherwise!
		this.brx = 0;
		this.bry = 0;
		this.blx = 0;
		this.bly = 0;
		cr.seal(this);
	};
	Quad.prototype.set_from_rect = function (rc)
	{
		this.tlx = rc.left;
		this.tly = rc.top;
		this.trx = rc.right;
		this.try_ = rc.top;
		this.brx = rc.right;
		this.bry = rc.bottom;
		this.blx = rc.left;
		this.bly = rc.bottom;
	};
	Quad.prototype.set_from_rotated_rect = function (rc, a)
	{
		if (a === 0)
		{
			this.set_from_rect(rc);
		}
		else
		{
			var sin_a = Math.sin(a);
			var cos_a = Math.cos(a);
			var left_sin_a = rc.left * sin_a;
			var top_sin_a = rc.top * sin_a;
			var right_sin_a = rc.right * sin_a;
			var bottom_sin_a = rc.bottom * sin_a;
			var left_cos_a = rc.left * cos_a;
			var top_cos_a = rc.top * cos_a;
			var right_cos_a = rc.right * cos_a;
			var bottom_cos_a = rc.bottom * cos_a;
			this.tlx = left_cos_a - top_sin_a;
			this.tly = top_cos_a + left_sin_a;
			this.trx = right_cos_a - top_sin_a;
			this.try_ = top_cos_a + right_sin_a;
			this.brx = right_cos_a - bottom_sin_a;
			this.bry = bottom_cos_a + right_sin_a;
			this.blx = left_cos_a - bottom_sin_a;
			this.bly = bottom_cos_a + left_sin_a;
		}
	};
	Quad.prototype.offset = function (px, py)
	{
		this.tlx += px;
		this.tly += py;
		this.trx += px;
		this.try_ += py;
		this.brx += px;
		this.bry += py;
		this.blx += px;
		this.bly += py;
		return this;
	};
	var minresult = 0;
	var maxresult = 0;
	function minmax4(a, b, c, d)
	{
		if (a < b)
		{
			if (c < d)
			{
				if (a < c)
					minresult = a;
				else
					minresult = c;
				if (b > d)
					maxresult = b;
				else
					maxresult = d;
			}
			else
			{
				if (a < d)
					minresult = a;
				else
					minresult = d;
				if (b > c)
					maxresult = b;
				else
					maxresult = c;
			}
		}
		else
		{
			if (c < d)
			{
				if (b < c)
					minresult = b;
				else
					minresult = c;
				if (a > d)
					maxresult = a;
				else
					maxresult = d;
			}
			else
			{
				if (b < d)
					minresult = b;
				else
					minresult = d;
				if (a > c)
					maxresult = a;
				else
					maxresult = c;
			}
		}
	};
	Quad.prototype.bounding_box = function (rc)
	{
		minmax4(this.tlx, this.trx, this.brx, this.blx);
		rc.left = minresult;
		rc.right = maxresult;
		minmax4(this.tly, this.try_, this.bry, this.bly);
		rc.top = minresult;
		rc.bottom = maxresult;
	};
	Quad.prototype.contains_pt = function (x, y)
	{
		var v0x = this.trx - this.tlx;
		var v0y = this.try_ - this.tly;
		var v1x = this.brx - this.tlx;
		var v1y = this.bry - this.tly;
		var v2x = x - this.tlx;
		var v2y = y - this.tly;
		var dot00 = v0x * v0x + v0y * v0y
		var dot01 = v0x * v1x + v0y * v1y
		var dot02 = v0x * v2x + v0y * v2y
		var dot11 = v1x * v1x + v1y * v1y
		var dot12 = v1x * v2x + v1y * v2y
		var invDenom = 1.0 / (dot00 * dot11 - dot01 * dot01);
		var u = (dot11 * dot02 - dot01 * dot12) * invDenom;
		var v = (dot00 * dot12 - dot01 * dot02) * invDenom;
		if ((u >= 0.0) && (v > 0.0) && (u + v < 1))
			return true;
		v0x = this.blx - this.tlx;
		v0y = this.bly - this.tly;
		var dot00 = v0x * v0x + v0y * v0y
		var dot01 = v0x * v1x + v0y * v1y
		var dot02 = v0x * v2x + v0y * v2y
		invDenom = 1.0 / (dot00 * dot11 - dot01 * dot01);
		u = (dot11 * dot02 - dot01 * dot12) * invDenom;
		v = (dot00 * dot12 - dot01 * dot02) * invDenom;
		return (u >= 0.0) && (v > 0.0) && (u + v < 1);
	};
	Quad.prototype.at = function (i, xory)
	{
		if (xory)
		{
			switch (i)
			{
				case 0: return this.tlx;
				case 1: return this.trx;
				case 2: return this.brx;
				case 3: return this.blx;
				case 4: return this.tlx;
				default: return this.tlx;
			}
		}
		else
		{
			switch (i)
			{
				case 0: return this.tly;
				case 1: return this.try_;
				case 2: return this.bry;
				case 3: return this.bly;
				case 4: return this.tly;
				default: return this.tly;
			}
		}
	};
	Quad.prototype.midX = function ()
	{
		return (this.tlx + this.trx  + this.brx + this.blx) / 4;
	};
	Quad.prototype.midY = function ()
	{
		return (this.tly + this.try_ + this.bry + this.bly) / 4;
	};
	Quad.prototype.intersects_segment = function (x1, y1, x2, y2)
	{
		if (this.contains_pt(x1, y1) || this.contains_pt(x2, y2))
			return true;
		var a1x, a1y, a2x, a2y;
		var i;
		for (i = 0; i < 4; i++)
		{
			a1x = this.at(i, true);
			a1y = this.at(i, false);
			a2x = this.at(i + 1, true);
			a2y = this.at(i + 1, false);
			if (cr.segments_intersect(x1, y1, x2, y2, a1x, a1y, a2x, a2y))
				return true;
		}
		return false;
	};
	Quad.prototype.intersects_quad = function (rhs)
	{
		var midx = rhs.midX();
		var midy = rhs.midY();
		if (this.contains_pt(midx, midy))
			return true;
		midx = this.midX();
		midy = this.midY();
		if (rhs.contains_pt(midx, midy))
			return true;
		var a1x, a1y, a2x, a2y, b1x, b1y, b2x, b2y;
		var i, j;
		for (i = 0; i < 4; i++)
		{
			for (j = 0; j < 4; j++)
			{
				a1x = this.at(i, true);
				a1y = this.at(i, false);
				a2x = this.at(i + 1, true);
				a2y = this.at(i + 1, false);
				b1x = rhs.at(j, true);
				b1y = rhs.at(j, false);
				b2x = rhs.at(j + 1, true);
				b2y = rhs.at(j + 1, false);
				if (cr.segments_intersect(a1x, a1y, a2x, a2y, b1x, b1y, b2x, b2y))
					return true;
			}
		}
		return false;
	};
	cr.quad = Quad;
	cr.RGB = function (red, green, blue)
	{
		return Math.max(Math.min(red, 255), 0)
			 | (Math.max(Math.min(green, 255), 0) << 8)
			 | (Math.max(Math.min(blue, 255), 0) << 16);
	};
	cr.GetRValue = function (rgb)
	{
		return rgb & 0xFF;
	};
	cr.GetGValue = function (rgb)
	{
		return (rgb & 0xFF00) >> 8;
	};
	cr.GetBValue = function (rgb)
	{
		return (rgb & 0xFF0000) >> 16;
	};
	cr.shallowCopy = function (a, b, allowOverwrite)
	{
		var attr;
		for (attr in b)
		{
			if (b.hasOwnProperty(attr))
			{
;
				a[attr] = b[attr];
			}
		}
		return a;
	};
	cr.arrayRemove = function (arr, index)
	{
		var i, len;
		index = cr.floor(index);
		if (index < 0 || index >= arr.length)
			return;							// index out of bounds
		if (index === 0)					// removing first item
			arr.shift();
		else if (index === arr.length - 1)	// removing last item
			arr.pop();
		else
		{
			for (i = index, len = arr.length - 1; i < len; i++)
				arr[i] = arr[i + 1];
			arr.length = len;
		}
	};
	cr.shallowAssignArray = function (dest, src)
	{
		dest.length = src.length;
		var i, len;
		for (i = 0, len = src.length; i < len; i++)
			dest[i] = src[i];
	};
	cr.appendArray = function (a, b)
	{
		a.push.apply(a, b);
	};
	cr.arrayFindRemove = function (arr, item)
	{
		var index = arr.indexOf(item);
		if (index !== -1)
			cr.arrayRemove(arr, index);
	};
	cr.clamp = function(x, a, b)
	{
		if (x < a)
			return a;
		else if (x > b)
			return b;
		else
			return x;
	};
	cr.to_radians = function(x)
	{
		return x / (180.0 / cr.PI);
	};
	cr.to_degrees = function(x)
	{
		return x * (180.0 / cr.PI);
	};
	cr.clamp_angle_degrees = function (a)
	{
		a %= 360;       // now in (-360, 360) range
		if (a < 0)
			a += 360;   // now in [0, 360) range
		return a;
	};
	cr.clamp_angle = function (a)
	{
		a %= 2 * cr.PI;       // now in (-2pi, 2pi) range
		if (a < 0)
			a += 2 * cr.PI;   // now in [0, 2pi) range
		return a;
	};
	cr.to_clamped_degrees = function (x)
	{
		return cr.clamp_angle_degrees(cr.to_degrees(x));
	};
	cr.to_clamped_radians = function (x)
	{
		return cr.clamp_angle(cr.to_radians(x));
	};
	cr.angleTo = function(x1, y1, x2, y2)
	{
		var dx = x2 - x1;
        var dy = y2 - y1;
		return Math.atan2(dy, dx);
	};
	cr.angleDiff = function (a1, a2)
	{
		if (a1 === a2)
			return 0;
		var s1 = Math.sin(a1);
		var c1 = Math.cos(a1);
		var s2 = Math.sin(a2);
		var c2 = Math.cos(a2);
		var n = s1 * s2 + c1 * c2;
		if (n >= 1)
			return 0;
		if (n <= -1)
			return cr.PI;
		return Math.acos(n);
	};
	cr.angleRotate = function (start, end, step)
	{
		var ss = Math.sin(start);
		var cs = Math.cos(start);
		var se = Math.sin(end);
		var ce = Math.cos(end);
		if (Math.acos(ss * se + cs * ce) > step)
		{
			if (cs * se - ss * ce > 0)
				return cr.clamp_angle(start + step);
			else
				return cr.clamp_angle(start - step);
		}
		else
			return cr.clamp_angle(end);
	};
	cr.angleClockwise = function (a1, a2)
	{
		var s1 = Math.sin(a1);
		var c1 = Math.cos(a1);
		var s2 = Math.sin(a2);
		var c2 = Math.cos(a2);
		return c1 * s2 - s1 * c2 <= 0;
	};
	cr.rotatePtAround = function (px, py, a, ox, oy, getx)
	{
		if (a === 0)
			return getx ? px : py;
		var sin_a = Math.sin(a);
		var cos_a = Math.cos(a);
		px -= ox;
		py -= oy;
		var left_sin_a = px * sin_a;
		var top_sin_a = py * sin_a;
		var left_cos_a = px * cos_a;
		var top_cos_a = py * cos_a;
		px = left_cos_a - top_sin_a;
		py = top_cos_a + left_sin_a;
		px += ox;
		py += oy;
		return getx ? px : py;
	}
	cr.distanceTo = function(x1, y1, x2, y2)
	{
		var dx = x2 - x1;
        var dy = y2 - y1;
		return Math.sqrt(dx*dx + dy*dy);
	};
	cr.xor = function (x, y)
	{
		return !x !== !y;
	};
	cr.lerp = function (a, b, x)
	{
		return a + (b - a) * x;
	};
	cr.unlerp = function (a, b, c)
	{
		if (a === b)
			return 0;		// avoid divide by 0
		return (c - a) / (b - a);
	};
	cr.anglelerp = function (a, b, x)
	{
		var diff = cr.angleDiff(a, b);
		if (cr.angleClockwise(b, a))
		{
			return a + diff * x;
		}
		else
		{
			return a - diff * x;
		}
	};
	cr.hasAnyOwnProperty = function (o)
	{
		var p;
		for (p in o)
		{
			if (o.hasOwnProperty(p))
				return true;
		}
		return false;
	};
	cr.wipe = function (obj)
	{
		var p;
		for (p in obj)
		{
			if (obj.hasOwnProperty(p))
				delete obj[p];
		}
	};
	var startup_time = +(new Date());
	cr.performance_now = function()
	{
		if (typeof window["performance"] !== "undefined")
		{
			var winperf = window["performance"];
			if (typeof winperf.now !== "undefined")
				return winperf.now();
			else if (typeof winperf["webkitNow"] !== "undefined")
				return winperf["webkitNow"]();
			else if (typeof winperf["mozNow"] !== "undefined")
				return winperf["mozNow"]();
			else if (typeof winperf["msNow"] !== "undefined")
				return winperf["msNow"]();
		}
		return Date.now() - startup_time;
	};
	var supports_set = (typeof Set !== "undefined" && typeof Set.prototype["forEach"] !== "undefined");
	function ObjectSet_()
	{
		this.s = null;
		this.items = null;
		this.item_count = 0;
		if (supports_set)
		{
			this.s = new Set();
		}
		else
		{
			this.items = {};
		}
		this.values_cache = [];
		this.cache_valid = true;
		cr.seal(this);
	};
	ObjectSet_.prototype.contains = function (x)
	{
		if (supports_set)
			return this.s["has"](x);
		else
			return this.items.hasOwnProperty(x.toString());
	};
	ObjectSet_.prototype.add = function (x)
	{
		if (supports_set)
		{
			if (!this.s["has"](x))
			{
				this.s["add"](x);
				this.cache_valid = false;
			}
		}
		else
		{
			var str = x.toString();
			if (!this.items.hasOwnProperty(str))
			{
				this.items[str] = x;
				this.item_count++;
				this.cache_valid = false;
			}
		}
		return this;
	};
	ObjectSet_.prototype.remove = function (x)
	{
		if (supports_set)
		{
			if (this.s["has"](x))
			{
				this.s["delete"](x);
				this.cache_valid = false;
			}
		}
		else
		{
			var str = x.toString();
			if (this.items.hasOwnProperty(str))
			{
				delete this.items[str];
				this.item_count--;
				this.cache_valid = false;
			}
		}
		return this;
	};
	ObjectSet_.prototype.clear = function ()
	{
		if (supports_set)
		{
			this.s["clear"]();
		}
		else
		{
			this.items = {};
			this.item_count = 0;
		}
		this.values_cache.length = 0;
		this.cache_valid = true;
		return this;
	};
	ObjectSet_.prototype.isEmpty = function ()
	{
		if (supports_set)
			return this.s["size"] === 0;
		else
			return this.item_count === 0;
	};
	ObjectSet_.prototype.count = function ()
	{
		if (supports_set)
			return this.s["size"];
		else
			return this.item_count;
	};
	var current_arr = null;
	var current_index = 0;
	function set_append_to_arr(x)
	{
		current_arr[current_index++] = x;
	};
	ObjectSet_.prototype.update_cache = function ()
	{
		if (this.cache_valid)
			return;
		if (supports_set)
		{
			this.values_cache.length = this.s["size"];
			current_arr = this.values_cache;
			current_index = 0;
			this.s["forEach"](set_append_to_arr);
;
			current_arr = null;
			current_index = 0;
		}
		else
		{
			this.values_cache.length = this.item_count;
			var p, n = 0;
			for (p in this.items)
			{
				if (this.items.hasOwnProperty(p))
					this.values_cache[n++] = this.items[p];
			}
;
		}
		this.cache_valid = true;
	};
	ObjectSet_.prototype.values = function ()
	{
		this.update_cache();
		return this.values_cache.slice(0);
	};
	ObjectSet_.prototype.valuesRef = function ()
	{
		this.update_cache();
		return this.values_cache;
	};
	cr.ObjectSet = ObjectSet_;
	function KahanAdder_()
	{
		this.c = 0;
        this.y = 0;
        this.t = 0;
        this.sum = 0;
		cr.seal(this);
	};
	KahanAdder_.prototype.add = function (v)
	{
		this.y = v - this.c;
	    this.t = this.sum + this.y;
	    this.c = (this.t - this.sum) - this.y;
	    this.sum = this.t;
	};
    KahanAdder_.prototype.reset = function ()
    {
        this.c = 0;
        this.y = 0;
        this.t = 0;
        this.sum = 0;
    };
	cr.KahanAdder = KahanAdder_;
	cr.regexp_escape = function(text)
	{
		return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
	};
	function CollisionPoly_(pts_array_)
	{
		this.pts_cache = [];
		this.bboxLeft = 0;
		this.bboxTop = 0;
		this.bboxRight = 0;
		this.bboxBottom = 0;
		this.convexpolys = null;		// for physics behavior to cache separated polys
		this.set_pts(pts_array_);
		cr.seal(this);
	};
	CollisionPoly_.prototype.set_pts = function(pts_array_)
	{
		this.pts_array = pts_array_;
		this.pts_count = pts_array_.length / 2;			// x, y, x, y... in array
		this.pts_cache.length = pts_array_.length;
		this.cache_width = -1;
		this.cache_height = -1;
		this.cache_angle = 0;
	};
	CollisionPoly_.prototype.is_empty = function()
	{
		return !this.pts_array.length;
	};
	CollisionPoly_.prototype.update_bbox = function ()
	{
		var myptscache = this.pts_cache;
		var bboxLeft_ = myptscache[0];
		var bboxRight_ = bboxLeft_;
		var bboxTop_ = myptscache[1];
		var bboxBottom_ = bboxTop_;
		var x, y, i = 1, i2, len = this.pts_count;
		for ( ; i < len; ++i)
		{
			i2 = i*2;
			x = myptscache[i2];
			y = myptscache[i2+1];
			if (x < bboxLeft_)
				bboxLeft_ = x;
			if (x > bboxRight_)
				bboxRight_ = x;
			if (y < bboxTop_)
				bboxTop_ = y;
			if (y > bboxBottom_)
				bboxBottom_ = y;
		}
		this.bboxLeft = bboxLeft_;
		this.bboxRight = bboxRight_;
		this.bboxTop = bboxTop_;
		this.bboxBottom = bboxBottom_;
	};
	CollisionPoly_.prototype.set_from_rect = function(rc, offx, offy)
	{
		this.pts_cache.length = 8;
		this.pts_count = 4;
		var myptscache = this.pts_cache;
		myptscache[0] = rc.left - offx;
		myptscache[1] = rc.top - offy;
		myptscache[2] = rc.right - offx;
		myptscache[3] = rc.top - offy;
		myptscache[4] = rc.right - offx;
		myptscache[5] = rc.bottom - offy;
		myptscache[6] = rc.left - offx;
		myptscache[7] = rc.bottom - offy;
		this.cache_width = rc.right - rc.left;
		this.cache_height = rc.bottom - rc.top;
		this.update_bbox();
	};
	CollisionPoly_.prototype.set_from_quad = function(q, offx, offy, w, h)
	{
		this.pts_cache.length = 8;
		this.pts_count = 4;
		var myptscache = this.pts_cache;
		myptscache[0] = q.tlx - offx;
		myptscache[1] = q.tly - offy;
		myptscache[2] = q.trx - offx;
		myptscache[3] = q.try_ - offy;
		myptscache[4] = q.brx - offx;
		myptscache[5] = q.bry - offy;
		myptscache[6] = q.blx - offx;
		myptscache[7] = q.bly - offy;
		this.cache_width = w;
		this.cache_height = h;
		this.update_bbox();
	};
	CollisionPoly_.prototype.set_from_poly = function (r)
	{
		this.pts_count = r.pts_count;
		cr.shallowAssignArray(this.pts_cache, r.pts_cache);
		this.bboxLeft = r.bboxLeft;
		this.bboxTop - r.bboxTop;
		this.bboxRight = r.bboxRight;
		this.bboxBottom = r.bboxBottom;
	};
	CollisionPoly_.prototype.cache_poly = function(w, h, a)
	{
		if (this.cache_width === w && this.cache_height === h && this.cache_angle === a)
			return;		// cache up-to-date
		this.cache_width = w;
		this.cache_height = h;
		this.cache_angle = a;
		var i, i2, i21, len, x, y;
		var sina = 0;
		var cosa = 1;
		var myptsarray = this.pts_array;
		var myptscache = this.pts_cache;
		if (a !== 0)
		{
			sina = Math.sin(a);
			cosa = Math.cos(a);
		}
		for (i = 0, len = this.pts_count; i < len; i++)
		{
			i2 = i*2;
			i21 = i2+1;
			x = myptsarray[i2] * w;
			y = myptsarray[i21] * h;
			myptscache[i2] = (x * cosa) - (y * sina);
			myptscache[i21] = (y * cosa) + (x * sina);
		}
		this.update_bbox();
	};
	CollisionPoly_.prototype.contains_pt = function (a2x, a2y)
	{
		var myptscache = this.pts_cache;
		if (a2x === myptscache[0] && a2y === myptscache[1])
			return true;
		var i, i2, imod, len = this.pts_count;
		var a1x = this.bboxLeft - 110;
		var a1y = this.bboxTop - 101;
		var a3x = this.bboxRight + 131
		var a3y = this.bboxBottom + 120;
		var b1x, b1y, b2x, b2y;
		var count1 = 0, count2 = 0;
		for (i = 0; i < len; i++)
		{
			i2 = i*2;
			imod = ((i+1)%len)*2;
			b1x = myptscache[i2];
			b1y = myptscache[i2+1];
			b2x = myptscache[imod];
			b2y = myptscache[imod+1];
			if (cr.segments_intersect(a1x, a1y, a2x, a2y, b1x, b1y, b2x, b2y))
				count1++;
			if (cr.segments_intersect(a3x, a3y, a2x, a2y, b1x, b1y, b2x, b2y))
				count2++;
		}
		return (count1 % 2 === 1) || (count2 % 2 === 1);
	};
	CollisionPoly_.prototype.intersects_poly = function (rhs, offx, offy)
	{
		var rhspts = rhs.pts_cache;
		var mypts = this.pts_cache;
		if (this.contains_pt(rhspts[0] + offx, rhspts[1] + offy))
			return true;
		if (rhs.contains_pt(mypts[0] - offx, mypts[1] - offy))
			return true;
		var i, i2, imod, leni, j, j2, jmod, lenj;
		var a1x, a1y, a2x, a2y, b1x, b1y, b2x, b2y;
		for (i = 0, leni = this.pts_count; i < leni; i++)
		{
			i2 = i*2;
			imod = ((i+1)%leni)*2;
			a1x = mypts[i2];
			a1y = mypts[i2+1];
			a2x = mypts[imod];
			a2y = mypts[imod+1];
			for (j = 0, lenj = rhs.pts_count; j < lenj; j++)
			{
				j2 = j*2;
				jmod = ((j+1)%lenj)*2;
				b1x = rhspts[j2] + offx;
				b1y = rhspts[j2+1] + offy;
				b2x = rhspts[jmod] + offx;
				b2y = rhspts[jmod+1] + offy;
				if (cr.segments_intersect(a1x, a1y, a2x, a2y, b1x, b1y, b2x, b2y))
					return true;
			}
		}
		return false;
	};
	CollisionPoly_.prototype.intersects_segment = function (offx, offy, x1, y1, x2, y2)
	{
		var mypts = this.pts_cache;
		if (this.contains_pt(x1 - offx, y1 - offy))
			return true;
		var i, leni, i2, imod;
		var a1x, a1y, a2x, a2y;
		for (i = 0, leni = this.pts_count; i < leni; i++)
		{
			i2 = i*2;
			imod = ((i+1)%leni)*2;
			a1x = mypts[i2] + offx;
			a1y = mypts[i2+1] + offy;
			a2x = mypts[imod] + offx;
			a2y = mypts[imod+1] + offy;
			if (cr.segments_intersect(x1, y1, x2, y2, a1x, a1y, a2x, a2y))
				return true;
		}
		return false;
	};
	CollisionPoly_.prototype.mirror = function (px)
	{
		var i, leni, i2;
		for (i = 0, leni = this.pts_count; i < leni; ++i)
		{
			i2 = i*2;
			this.pts_cache[i2] = px * 2 - this.pts_cache[i2];
		}
	};
	CollisionPoly_.prototype.flip = function (py)
	{
		var i, leni, i21;
		for (i = 0, leni = this.pts_count; i < leni; ++i)
		{
			i21 = i*2+1;
			this.pts_cache[i21] = py * 2 - this.pts_cache[i21];
		}
	};
	CollisionPoly_.prototype.diag = function ()
	{
		var i, leni, i2, i21, temp;
		for (i = 0, leni = this.pts_count; i < leni; ++i)
		{
			i2 = i*2;
			i21 = i2+1;
			temp = this.pts_cache[i2];
			this.pts_cache[i2] = this.pts_cache[i21];
			this.pts_cache[i21] = temp;
		}
	};
	cr.CollisionPoly = CollisionPoly_;
	function SparseGrid_(cellwidth_, cellheight_)
	{
		this.cellwidth = cellwidth_;
		this.cellheight = cellheight_;
		this.cells = {};
	};
	SparseGrid_.prototype.totalCellCount = 0;
	SparseGrid_.prototype.getCell = function (x_, y_, create_if_missing)
	{
		var ret;
		var col = this.cells[x_];
		if (!col)
		{
			if (create_if_missing)
			{
				ret = allocGridCell(this, x_, y_);
				this.cells[x_] = {};
				this.cells[x_][y_] = ret;
				return ret;
			}
			else
				return null;
		}
		ret = col[y_];
		if (ret)
			return ret;
		else if (create_if_missing)
		{
			ret = allocGridCell(this, x_, y_);
			this.cells[x_][y_] = ret;
			return ret;
		}
		else
			return null;
	};
	SparseGrid_.prototype.XToCell = function (x_)
	{
		return cr.floor(x_ / this.cellwidth);
	};
	SparseGrid_.prototype.YToCell = function (y_)
	{
		return cr.floor(y_ / this.cellheight);
	};
	SparseGrid_.prototype.update = function (inst, oldrange, newrange)
	{
		var x, lenx, y, leny, cell;
		if (oldrange)
		{
			for (x = oldrange.left, lenx = oldrange.right; x <= lenx; ++x)
			{
				for (y = oldrange.top, leny = oldrange.bottom; y <= leny; ++y)
				{
					if (newrange && newrange.contains_pt(x, y))
						continue;	// is still in this cell
					cell = this.getCell(x, y, false);	// don't create if missing
					if (!cell)
						continue;	// cell does not exist yet
					cell.remove(inst);
					if (cell.isEmpty())
					{
						freeGridCell(cell);
						this.cells[x][y] = null;
					}
				}
			}
		}
		if (newrange)
		{
			for (x = newrange.left, lenx = newrange.right; x <= lenx; ++x)
			{
				for (y = newrange.top, leny = newrange.bottom; y <= leny; ++y)
				{
					if (oldrange && oldrange.contains_pt(x, y))
						continue;	// is still in this cell
					this.getCell(x, y, true).insert(inst);
				}
			}
		}
	};
	SparseGrid_.prototype.queryRange = function (rc, result)
	{
		var x, lenx, ystart, y, leny, cell;
		x = this.XToCell(rc.left);
		ystart = this.YToCell(rc.top);
		lenx = this.XToCell(rc.right);
		leny = this.YToCell(rc.bottom);
		for ( ; x <= lenx; ++x)
		{
			for (y = ystart; y <= leny; ++y)
			{
				cell = this.getCell(x, y, false);
				if (!cell)
					continue;
				cell.dump(result);
			}
		}
	};
	cr.SparseGrid = SparseGrid_;
	var gridcellcache = [];
	function allocGridCell(grid_, x_, y_)
	{
		var ret;
		SparseGrid_.prototype.totalCellCount++;
		if (gridcellcache.length)
		{
			ret = gridcellcache.pop();
			ret.grid = grid_;
			ret.x = x_;
			ret.y = y_;
			return ret;
		}
		else
			return new cr.GridCell(grid_, x_, y_);
	};
	function freeGridCell(c)
	{
		SparseGrid_.prototype.totalCellCount--;
		c.objects.clear();
		if (gridcellcache.length < 1000)
			gridcellcache.push(c);
	};
	function GridCell_(grid_, x_, y_)
	{
		this.grid = grid_;
		this.x = x_;
		this.y = y_;
		this.objects = new cr.ObjectSet();
	};
	GridCell_.prototype.isEmpty = function ()
	{
		return this.objects.isEmpty();
	};
	GridCell_.prototype.insert = function (inst)
	{
		this.objects.add(inst);
	};
	GridCell_.prototype.remove = function (inst)
	{
		this.objects.remove(inst);
	};
	GridCell_.prototype.dump = function (result)
	{
		cr.appendArray(result, this.objects.valuesRef());
	};
	cr.GridCell = GridCell_;
	var fxNames = [ "lighter",
					"xor",
					"copy",
					"destination-over",
					"source-in",
					"destination-in",
					"source-out",
					"destination-out",
					"source-atop",
					"destination-atop"];
	cr.effectToCompositeOp = function(effect)
	{
		if (effect <= 0 || effect >= 11)
			return "source-over";
		return fxNames[effect - 1];	// not including "none" so offset by 1
	};
	cr.setGLBlend = function(this_, effect, gl)
	{
		if (!gl)
			return;
		this_.srcBlend = gl.ONE;
		this_.destBlend = gl.ONE_MINUS_SRC_ALPHA;
		switch (effect) {
		case 1:		// lighter (additive)
			this_.srcBlend = gl.ONE;
			this_.destBlend = gl.ONE;
			break;
		case 2:		// xor
			break;	// todo
		case 3:		// copy
			this_.srcBlend = gl.ONE;
			this_.destBlend = gl.ZERO;
			break;
		case 4:		// destination-over
			this_.srcBlend = gl.ONE_MINUS_DST_ALPHA;
			this_.destBlend = gl.ONE;
			break;
		case 5:		// source-in
			this_.srcBlend = gl.DST_ALPHA;
			this_.destBlend = gl.ZERO;
			break;
		case 6:		// destination-in
			this_.srcBlend = gl.ZERO;
			this_.destBlend = gl.SRC_ALPHA;
			break;
		case 7:		// source-out
			this_.srcBlend = gl.ONE_MINUS_DST_ALPHA;
			this_.destBlend = gl.ZERO;
			break;
		case 8:		// destination-out
			this_.srcBlend = gl.ZERO;
			this_.destBlend = gl.ONE_MINUS_SRC_ALPHA;
			break;
		case 9:		// source-atop
			this_.srcBlend = gl.DST_ALPHA;
			this_.destBlend = gl.ONE_MINUS_SRC_ALPHA;
			break;
		case 10:	// destination-atop
			this_.srcBlend = gl.ONE_MINUS_DST_ALPHA;
			this_.destBlend = gl.SRC_ALPHA;
			break;
		}
	};
	cr.round6dp = function (x)
	{
		return cr.round(x * 1000000) / 1000000;
	};
	/*
	var localeCompare_options = {
		"usage": "search",
		"sensitivity": "accent"
	};
	var has_localeCompare = !!"a".localeCompare;
	var localeCompare_works1 = (has_localeCompare && "a".localeCompare("A", undefined, localeCompare_options) === 0);
	var localeCompare_works2 = (has_localeCompare && "a".localeCompare("á", undefined, localeCompare_options) !== 0);
	var supports_localeCompare = (has_localeCompare && localeCompare_works1 && localeCompare_works2);
	*/
	cr.equals_nocase = function (a, b)
	{
		if (typeof a !== "string" || typeof b !== "string")
			return false;
		if (a.length !== b.length)
			return false;
		if (a === b)
			return true;
		/*
		if (supports_localeCompare)
		{
			return (a.localeCompare(b, undefined, localeCompare_options) === 0);
		}
		else
		{
		*/
			return a.toLowerCase() === b.toLowerCase();
	};
}());
;
(function()
{
	function Runtime(canvas)
	{
		if (!canvas || (!canvas.getContext && !canvas["dc"]))
			return;
		if (canvas["c2runtime"])
			return;
		else
			canvas["c2runtime"] = this;
		var self = this;
		this.isCrosswalk = /crosswalk/i.test(navigator.userAgent) || /xwalk/i.test(navigator.userAgent) || !!(typeof window["c2isCrosswalk"] !== "undefined" && window["c2isCrosswalk"]);
		this.isPhoneGap = (!this.isCrosswalk && (typeof window["device"] !== "undefined" && (typeof window["device"]["cordova"] !== "undefined" || typeof window["device"]["phonegap"] !== "undefined")));
		this.isDirectCanvas = !!canvas["dc"];
		this.isAppMobi = (typeof window["AppMobi"] !== "undefined" || this.isDirectCanvas);
		this.isCocoonJs = !!window["c2cocoonjs"];
		if (this.isCocoonJs)
		{
			CocoonJS["App"]["onSuspended"].addEventListener(function() {
				self["setSuspended"](true);
			});
			CocoonJS["App"]["onActivated"].addEventListener(function () {
				self["setSuspended"](false);
			});
		}
		this.isDomFree = this.isDirectCanvas || this.isCocoonJs;
		this.isTizen = /tizen/i.test(navigator.userAgent);
		this.isAndroid = /android/i.test(navigator.userAgent) && !this.isTizen;		// tizen says "like Android"
		this.isIE = /msie/i.test(navigator.userAgent) || /trident/i.test(navigator.userAgent);
		this.isiPhone = /iphone/i.test(navigator.userAgent) || /ipod/i.test(navigator.userAgent);	// treat ipod as an iphone
		this.isiPad = /ipad/i.test(navigator.userAgent);
		this.isiOS = this.isiPhone || this.isiPad;
		this.isiPhoneiOS6 = (this.isiPhone && /os\s6/i.test(navigator.userAgent));
		this.isChrome = /chrome/i.test(navigator.userAgent) || /chromium/i.test(navigator.userAgent);
		this.isAmazonWebApp = /amazonwebappplatform/i.test(navigator.userAgent);
		this.isFirefox = /firefox/i.test(navigator.userAgent);
		this.isSafari = !this.isChrome && /safari/i.test(navigator.userAgent);		// Chrome includes Safari in UA
		this.isWindows = /windows/i.test(navigator.userAgent);
		this.isNodeWebkit = (typeof window["c2nodewebkit"] !== "undefined" || /nodewebkit/i.test(navigator.userAgent));
		this.isArcade = (typeof window["is_scirra_arcade"] !== "undefined");
		this.isWindows8App = !!(typeof window["c2isWindows8"] !== "undefined" && window["c2isWindows8"]);
		this.isWindowsPhone8 = !!(typeof window["c2isWindowsPhone8"] !== "undefined" && window["c2isWindowsPhone8"]);
		this.isBlackberry10 = !!(typeof window["c2isBlackberry10"] !== "undefined" && window["c2isBlackberry10"]);
		this.isAndroidStockBrowser = (this.isAndroid && !this.isChrome && !this.isFirefox && !this.isAmazonWebApp && !this.isDomFree);
		this.devicePixelRatio = 1;
		this.isMobile = (this.isPhoneGap || this.isCrosswalk || this.isAppMobi || this.isCocoonJs || this.isAndroid || this.isiOS || this.isWindowsPhone8 || this.isBlackberry10 || this.isTizen);
		if (!this.isMobile)
			this.isMobile = /(blackberry|bb10|playbook|palm|symbian|nokia|windows\s+ce|phone|mobile|tablet)/i.test(navigator.userAgent);
		if (typeof cr_is_preview !== "undefined" && !this.isNodeWebkit && (window.location.search === "?nw" || /nodewebkit/i.test(navigator.userAgent)))
		{
			this.isNodeWebkit = true;
		}
		this.isDebug = (typeof cr_is_preview !== "undefined" && window.location.search.indexOf("debug") > -1)
		this.canvas = canvas;
		this.canvasdiv = document.getElementById("c2canvasdiv");
		this.gl = null;
		this.glwrap = null;
		this.ctx = null;
		this.fullscreenOldMarginCss = "";
		this.firstInFullscreen = false;
		this.oldWidth = 0;		// for restoring non-fullscreen canvas after fullscreen
		this.oldHeight = 0;
		this.canvas.oncontextmenu = function (e) { if (e.preventDefault) e.preventDefault(); return false; };
		this.canvas.onselectstart = function (e) { if (e.preventDefault) e.preventDefault(); return false; };
		if (this.isDirectCanvas)
			window["c2runtime"] = this;
		if (this.isNodeWebkit)
		{
			window.ondragover = function(e) { e.preventDefault(); return false; };
			window.ondrop = function(e) { e.preventDefault(); return false; };
			require("nw.gui")["App"]["clearCache"]();
		}
		this.width = canvas.width;
		this.height = canvas.height;
		this.draw_width = this.width;
		this.draw_height = this.height;
		this.cssWidth = this.width;
		this.cssHeight = this.height;
		this.lastWindowWidth = window.innerWidth;
		this.lastWindowHeight = window.innerHeight;
		this.redraw = true;
		this.isSuspended = false;
		this.blockSuspend = false;
		if (!Date.now) {
		  Date.now = function now() {
			return +new Date();
		  };
		}
		this.plugins = [];
		this.types = {};
		this.types_by_index = [];
		this.behaviors = [];
		this.layouts = {};
		this.layouts_by_index = [];
		this.eventsheets = {};
		this.eventsheets_by_index = [];
		this.wait_for_textures = [];        // for blocking until textures loaded
		this.triggers_to_postinit = [];
		this.all_global_vars = [];
		this.all_local_vars = [];
		this.solidBehavior = null;
		this.jumpthruBehavior = null;
		this.deathRow = new cr.ObjectSet();
		this.isInClearDeathRow = false;
		this.isInOnDestroy = 0;					// needs to support recursion so increments and decrements and is true if > 0
		this.isRunningEvents = false;
		this.createRow = [];
		this.isLoadingState = false;
		this.saveToSlot = "";
		this.loadFromSlot = "";
		this.loadFromJson = "";
		this.lastSaveJson = "";
		this.signalledContinuousPreview = false;
		this.suspendDrawing = false;		// for hiding display until continuous preview loads
		this.dt = 0;
        this.dt1 = 0;
		this.logictime = 0;			// used to calculate CPUUtilisation
		this.cpuutilisation = 0;
		this.zeroDtCount = 0;
        this.timescale = 1.0;
        this.kahanTime = new cr.KahanAdder();
		this.last_tick_time = 0;
		this.measuring_dt = true;
		this.fps = 0;
		this.last_fps_time = 0;
		this.tickcount = 0;
		this.execcount = 0;
		this.framecount = 0;        // for fps
		this.objectcount = 0;
		this.changelayout = null;
		this.destroycallbacks = [];
		this.event_stack = [];
		this.event_stack_index = -1;
		this.localvar_stack = [[]];
		this.localvar_stack_index = 0;
		this.trigger_depth = 0;		// recursion depth for triggers
		this.pushEventStack(null);
		this.loop_stack = [];
		this.loop_stack_index = -1;
		this.next_uid = 0;
		this.next_puid = 0;		// permanent unique ids
		this.layout_first_tick = true;
		this.family_count = 0;
		this.suspend_events = [];
		this.raf_id = 0;
		this.timeout_id = 0;
		this.isloading = true;
		this.loadingprogress = 0;
		this.isNodeFullscreen = false;
		this.stackLocalCount = 0;	// number of stack-based local vars for recursion
		this.halfFramerateMode = false;
		this.lastRafTime = 0;		// time of last requestAnimationFrame call
		this.ranLastRaf = false;	// false if last requestAnimationFrame was skipped for half framerate mode
		this.had_a_click = false;
		this.isInUserInputEvent = false;
        this.objects_to_tick = new cr.ObjectSet();
		this.objects_to_tick2 = new cr.ObjectSet();
		this.registered_collisions = [];
		this.temp_poly = new cr.CollisionPoly([]);
		this.temp_poly2 = new cr.CollisionPoly([]);
		this.allGroups = [];				// array of all event groups
        this.activeGroups = {};				// event group activation states
		this.cndsBySid = {};
		this.actsBySid = {};
		this.varsBySid = {};
		this.blocksBySid = {};
		this.running_layout = null;			// currently running layout
		this.layer_canvas = null;			// for layers "render-to-texture"
		this.layer_ctx = null;
		this.layer_tex = null;
		this.layout_tex = null;
		this.layout_canvas = null;
		this.layout_ctx = null;
		this.is_WebGL_context_lost = false;
		this.uses_background_blending = false;	// if any shader uses background blending, so entire layout renders to texture
		this.fx_tex = [null, null];
		this.fullscreen_scaling = 0;
		this.files_subfolder = "";			// path with project files
		this.objectsByUid = {};				// maps every in-use UID (as a string) to its instance
		this.loaderlogo = null;
		this.snapshotCanvas = null;
		this.snapshotData = "";
		this.load();
		this.isRetina = (!this.isDomFree && this.useHighDpi && !this.isAndroidStockBrowser);
		this.devicePixelRatio = (this.isRetina ? (window["devicePixelRatio"] || window["webkitDevicePixelRatio"] || window["mozDevicePixelRatio"] || window["msDevicePixelRatio"] || 1) : 1);
		this.ClearDeathRow();
		var attribs;
		var alpha_canvas = this.alphaBackground && !(this.isNodeWebkit || this.isWindows8App || this.isWindowsPhone8);
		if (this.fullscreen_mode > 0)
			this["setSize"](window.innerWidth, window.innerHeight, true);
		try {
			if (this.enableWebGL && (this.isCocoonJs || !this.isDomFree))
			{
				attribs = {
					"alpha": alpha_canvas,
					"depth": false,
					"antialias": false,
					"failIfMajorPerformanceCaveat": true
				};
				this.gl = (canvas.getContext("webgl", attribs) || canvas.getContext("experimental-webgl", attribs));
			}
		}
		catch (e) {
		}
		if (this.gl)
		{
;
			if (!this.isDomFree)
			{
				this.overlay_canvas = document.createElement("canvas");
				jQuery(this.overlay_canvas).appendTo(this.canvas.parentNode);
				this.overlay_canvas.oncontextmenu = function (e) { return false; };
				this.overlay_canvas.onselectstart = function (e) { return false; };
				this.overlay_canvas.width = this.cssWidth;
				this.overlay_canvas.height = this.cssHeight;
				jQuery(this.overlay_canvas).css({"width": this.cssWidth + "px",
												"height": this.cssHeight + "px"});
				this.positionOverlayCanvas();
				this.overlay_ctx = this.overlay_canvas.getContext("2d");
			}
			this.glwrap = new cr.GLWrap(this.gl, this.isMobile);
			this.glwrap.setSize(canvas.width, canvas.height);
			this.ctx = null;
			this.canvas.addEventListener("webglcontextlost", function (ev) {
				ev.preventDefault();
				self.onContextLost();
				console.log("[] WebGL context lost");
				window["cr_setSuspended"](true);		// stop rendering
			}, false);
			this.canvas.addEventListener("webglcontextrestored", function (ev) {
				self.glwrap.initState();
				self.glwrap.setSize(self.glwrap.width, self.glwrap.height, true);
				self.layer_tex = null;
				self.layout_tex = null;
				self.fx_tex[0] = null;
				self.fx_tex[1] = null;
				self.onContextRestored();
				self.redraw = true;
				console.log("[] WebGL context restored");
				window["cr_setSuspended"](false);		// resume rendering
			}, false);
			var i, len, j, lenj, k, lenk, t, s, l, y;
			for (i = 0, len = this.types_by_index.length; i < len; i++)
			{
				t = this.types_by_index[i];
				for (j = 0, lenj = t.effect_types.length; j < lenj; j++)
				{
					s = t.effect_types[j];
					s.shaderindex = this.glwrap.getShaderIndex(s.id);
					this.uses_background_blending = this.uses_background_blending || this.glwrap.programUsesDest(s.shaderindex);
				}
			}
			for (i = 0, len = this.layouts_by_index.length; i < len; i++)
			{
				l = this.layouts_by_index[i];
				for (j = 0, lenj = l.effect_types.length; j < lenj; j++)
				{
					s = l.effect_types[j];
					s.shaderindex = this.glwrap.getShaderIndex(s.id);
				}
				for (j = 0, lenj = l.layers.length; j < lenj; j++)
				{
					y = l.layers[j];
					for (k = 0, lenk = y.effect_types.length; k < lenk; k++)
					{
						s = y.effect_types[k];
						s.shaderindex = this.glwrap.getShaderIndex(s.id);
						this.uses_background_blending = this.uses_background_blending || this.glwrap.programUsesDest(s.shaderindex);
					}
				}
			}
		}
		else
		{
			if (this.fullscreen_mode > 0 && this.isDirectCanvas)
			{
;
				this.canvas = null;
				document.oncontextmenu = function (e) { return false; };
				document.onselectstart = function (e) { return false; };
				this.ctx = AppMobi["canvas"]["getContext"]("2d");
				try {
					this.ctx["samplingMode"] = this.linearSampling ? "smooth" : "sharp";
					this.ctx["globalScale"] = 1;
					this.ctx["HTML5CompatibilityMode"] = true;
					this.ctx["imageSmoothingEnabled"] = this.linearSampling;
				} catch(e){}
				if (this.width !== 0 && this.height !== 0)
				{
					this.ctx.width = this.width;
					this.ctx.height = this.height;
				}
			}
			if (!this.ctx)
			{
;
				if (this.isCocoonJs)
				{
					attribs = {
						"antialias": !!this.linearSampling,
						"alpha": alpha_canvas
					};
					this.ctx = canvas.getContext("2d", attribs);
				}
				else
				{
					attribs = {
						"alpha": alpha_canvas
					};
					this.ctx = canvas.getContext("2d", attribs);
				}
				this.ctx["webkitImageSmoothingEnabled"] = this.linearSampling;
				this.ctx["mozImageSmoothingEnabled"] = this.linearSampling;
				this.ctx["msImageSmoothingEnabled"] = this.linearSampling;
				this.ctx["imageSmoothingEnabled"] = this.linearSampling;
			}
			this.overlay_canvas = null;
			this.overlay_ctx = null;
		}
		this.tickFunc = function () { self.tick(); };
		if (window != window.top && !this.isDomFree && !this.isWindows8App)
		{
			document.addEventListener("mousedown", function () {
				window.focus();
			}, true);
			document.addEventListener("touchstart", function () {
				window.focus();
			}, true);
		}
		if (typeof cr_is_preview !== "undefined")
		{
			if (this.isCocoonJs)
				console.log("[] In preview-over-wifi via CocoonJS mode");
			if (window.location.search.indexOf("continuous") > -1)
			{
				cr.logexport("Reloading for continuous preview");
				this.loadFromSlot = "__c2_continuouspreview";
				this.suspendDrawing = true;
			}
			if (this.pauseOnBlur && !this.isMobile)
			{
				jQuery(window).focus(function ()
				{
					self["setSuspended"](false);
				});
				jQuery(window).blur(function ()
				{
					self["setSuspended"](true);
				});
			}
		}
		if (this.fullscreen_mode === 0 && this.isRetina && this.devicePixelRatio > 1)
		{
			this["setSize"](this.original_width, this.original_height, true);
		}
		this.tryLockOrientation();
		this.go();			// run loading screen
		this.extra = {};
		cr.seal(this);
	};
	var webkitRepaintFlag = false;
	Runtime.prototype["setSize"] = function (w, h, force)
	{
		var offx = 0, offy = 0;
		var neww = 0, newh = 0, intscale = 0;
		var tryHideAddressBar = (this.isiPhoneiOS6 && this.isSafari && !navigator["standalone"] && !this.isDomFree && !this.isPhoneGap);
		if (tryHideAddressBar)
			h += 60;		// height of Safari iPhone iOS 6 address bar
		if (this.lastWindowWidth === w && this.lastWindowHeight === h && !force)
			return;
		this.lastWindowWidth = w;
		this.lastWindowHeight = h;
		var mode = this.fullscreen_mode;
		var orig_aspect, cur_aspect;
		var isfullscreen = (document["mozFullScreen"] || document["webkitIsFullScreen"] || !!document["msFullscreenElement"] || document["fullScreen"] || this.isNodeFullscreen);
		if (!isfullscreen && this.fullscreen_mode === 0 && !force)
			return;			// ignore size events when not fullscreen and not using a fullscreen-in-browser mode
		if (isfullscreen && this.fullscreen_scaling > 0)
			mode = this.fullscreen_scaling;
		if (mode >= 4)
		{
			orig_aspect = this.original_width / this.original_height;
			cur_aspect = w / h;
			if (cur_aspect > orig_aspect)
			{
				neww = h * orig_aspect;
				if (mode === 5)	// integer scaling
				{
					intscale = neww / this.original_width;
					if (intscale > 1)
						intscale = Math.floor(intscale);
					else if (intscale < 1)
						intscale = 1 / Math.ceil(1 / intscale);
					neww = this.original_width * intscale;
					newh = this.original_height * intscale;
					offx = (w - neww) / 2;
					offy = (h - newh) / 2;
					w = neww;
					h = newh;
				}
				else
				{
					offx = (w - neww) / 2;
					w = neww;
				}
			}
			else
			{
				newh = w / orig_aspect;
				if (mode === 5)	// integer scaling
				{
					intscale = newh / this.original_height;
					if (intscale > 1)
						intscale = Math.floor(intscale);
					else if (intscale < 1)
						intscale = 1 / Math.ceil(1 / intscale);
					neww = this.original_width * intscale;
					newh = this.original_height * intscale;
					offx = (w - neww) / 2;
					offy = (h - newh) / 2;
					w = neww;
					h = newh;
				}
				else
				{
					offy = (h - newh) / 2;
					h = newh;
				}
			}
			if (isfullscreen && !this.isNodeWebkit)
			{
				offx = 0;
				offy = 0;
			}
			offx = Math.floor(offx);
			offy = Math.floor(offy);
			w = Math.floor(w);
			h = Math.floor(h);
		}
		else if (this.isNodeWebkit && this.isNodeFullscreen && this.fullscreen_mode_set === 0)
		{
			offx = Math.floor((w - this.original_width) / 2);
			offy = Math.floor((h - this.original_height) / 2);
			w = this.original_width;
			h = this.original_height;
		}
		if (mode < 2)
			this.aspect_scale = this.devicePixelRatio;
		if (this.isRetina && this.isiPad && this.devicePixelRatio > 1)	// don't apply to iPad 1-2
		{
			if (w >= 1024)
				w = 1023;		// 2046 retina pixels
			if (h >= 1024)
				h = 1023;
		}
		var multiplier = this.devicePixelRatio;
		this.cssWidth = w;
		this.cssHeight = h;
		this.width = Math.round(w * multiplier);
		this.height = Math.round(h * multiplier);
		this.redraw = true;
		if (this.wantFullscreenScalingQuality)
		{
			this.draw_width = this.width;
			this.draw_height = this.height;
			this.fullscreenScalingQuality = true;
		}
		else
		{
			if ((this.width < this.original_width && this.height < this.original_height) || mode === 1)
			{
				this.draw_width = this.width;
				this.draw_height = this.height;
				this.fullscreenScalingQuality = true;
			}
			else
			{
				this.draw_width = this.original_width;
				this.draw_height = this.original_height;
				this.fullscreenScalingQuality = false;
				/*var orig_aspect = this.original_width / this.original_height;
				var cur_aspect = this.width / this.height;
				if ((this.fullscreen_mode !== 2 && cur_aspect > orig_aspect) || (this.fullscreen_mode === 2 && cur_aspect < orig_aspect))
					this.aspect_scale = this.height / this.original_height;
				else
					this.aspect_scale = this.width / this.original_width;*/
				if (mode === 2)		// scale inner
				{
					orig_aspect = this.original_width / this.original_height;
					cur_aspect = this.lastWindowWidth / this.lastWindowHeight;
					if (cur_aspect < orig_aspect)
						this.draw_width = this.draw_height * cur_aspect;
					else if (cur_aspect > orig_aspect)
						this.draw_height = this.draw_width / cur_aspect;
				}
				else if (mode === 3)
				{
					orig_aspect = this.original_width / this.original_height;
					cur_aspect = this.lastWindowWidth / this.lastWindowHeight;
					if (cur_aspect > orig_aspect)
						this.draw_width = this.draw_height * cur_aspect;
					else if (cur_aspect < orig_aspect)
						this.draw_height = this.draw_width / cur_aspect;
				}
			}
		}
		if (this.canvasdiv && !this.isDomFree)
		{
			jQuery(this.canvasdiv).css({"width": w + "px",
										"height": h + "px",
										"margin-left": offx,
										"margin-top": offy});
			if (typeof cr_is_preview !== "undefined")
			{
				jQuery("#borderwrap").css({"width": w + "px",
											"height": h + "px"});
			}
		}
		if (this.canvas)
		{
			this.canvas.width = Math.round(w * multiplier);
			this.canvas.height = Math.round(h * multiplier);
			if (this.isRetina)
			{
				jQuery(this.canvas).css({"width": w + "px",
										"height": h + "px"});
			}
		}
		if (this.overlay_canvas)
		{
			this.overlay_canvas.width = w;
			this.overlay_canvas.height = h;
			jQuery(this.overlay_canvas).css({"width": w + "px",
											"height": h + "px"});
		}
		if (this.glwrap)
		{
			this.glwrap.setSize(Math.round(w * multiplier), Math.round(h * multiplier));
		}
		if (this.isDirectCanvas && this.ctx)
		{
			this.ctx.width = w;
			this.ctx.height = h;
		}
		if (this.ctx)
		{
			this.ctx["webkitImageSmoothingEnabled"] = this.linearSampling;
			this.ctx["mozImageSmoothingEnabled"] = this.linearSampling;
			this.ctx["msImageSmoothingEnabled"] = this.linearSampling;
			this.ctx["imageSmoothingEnabled"] = this.linearSampling;
		}
		this.tryLockOrientation();
		if (tryHideAddressBar)
		{
			window.setTimeout(function () {
				window.scrollTo(0, 1);
			}, 100);
		}
	};
	Runtime.prototype.tryLockOrientation = function ()
	{
		if (!this.autoLockOrientation || this.orientations === 0)
			return;
		var orientation = "portrait";
		if (this.orientations === 2)
			orientation = "landscape";
		if (screen["lockOrientation"])
			screen["lockOrientation"](orientation);
		else if (screen["webkitLockOrientation"])
			screen["webkitLockOrientation"](orientation);
		else if (screen["mozLockOrientation"])
			screen["mozLockOrientation"](orientation);
		else if (screen["msLockOrientation"])
			screen["msLockOrientation"](orientation);
	};
	Runtime.prototype.onContextLost = function ()
	{
		this.is_WebGL_context_lost = true;
		var i, len, t;
		for (i = 0, len = this.types_by_index.length; i < len; i++)
		{
			t = this.types_by_index[i];
			if (t.onLostWebGLContext)
				t.onLostWebGLContext();
		}
	};
	Runtime.prototype.onContextRestored = function ()
	{
		this.is_WebGL_context_lost = false;
		var i, len, t;
		for (i = 0, len = this.types_by_index.length; i < len; i++)
		{
			t = this.types_by_index[i];
			if (t.onRestoreWebGLContext)
				t.onRestoreWebGLContext();
		}
	};
	Runtime.prototype.positionOverlayCanvas = function()
	{
		if (this.isDomFree)
			return;
		var isfullscreen = (document["mozFullScreen"] || document["webkitIsFullScreen"] || document["fullScreen"] || !!document["msFullscreenElement"] || this.isNodeFullscreen);
		var overlay_position = isfullscreen ? jQuery(this.canvas).offset() : jQuery(this.canvas).position();
		overlay_position.position = "absolute";
		jQuery(this.overlay_canvas).css(overlay_position);
	};
	var caf = window["cancelAnimationFrame"] ||
	  window["mozCancelAnimationFrame"]    ||
	  window["webkitCancelAnimationFrame"] ||
	  window["msCancelAnimationFrame"]     ||
	  window["oCancelAnimationFrame"];
	Runtime.prototype["setSuspended"] = function (s)
	{
		var i, len;
		if (s && !this.isSuspended && !this.blockSuspend)
		{
			cr.logexport("[] Suspending");
			this.isSuspended = true;			// next tick will be last
			if (this.raf_id !== 0 && caf)		// note: CocoonJS does not implement cancelAnimationFrame
				caf(this.raf_id);
			if (this.timeout_id !== 0)
				clearTimeout(this.timeout_id);
			for (i = 0, len = this.suspend_events.length; i < len; i++)
				this.suspend_events[i](true);
		}
		else if (!s && this.isSuspended)
		{
			cr.logexport("[] Resuming");
			this.isSuspended = false;
			this.last_tick_time = cr.performance_now();	// ensure first tick is a zero-dt one
			this.last_fps_time = cr.performance_now();	// reset FPS counter
			this.framecount = 0;
			this.logictime = 0;
			for (i = 0, len = this.suspend_events.length; i < len; i++)
				this.suspend_events[i](false);
			this.tick();						// kick off runtime again
		}
	};
	Runtime.prototype.addSuspendCallback = function (f)
	{
		this.suspend_events.push(f);
	};
	Runtime.prototype.load = function ()
	{
;
		var pm = cr.getProjectModel();
		this.name = pm[0];
		this.first_layout = pm[1];
		this.fullscreen_mode = pm[11];	// 0 = off, 1 = crop, 2 = scale inner, 3 = scale outer, 4 = letterbox scale, 5 = integer letterbox scale
		this.fullscreen_mode_set = pm[11];
		this.original_width = pm[9];
		this.original_height = pm[10];
		this.parallax_x_origin = this.original_width / 2;
		this.parallax_y_origin = this.original_height / 2;
		if (this.isDomFree && (pm[11] >= 4 || pm[11] === 0))
		{
			cr.logexport("[] Letterbox scale fullscreen modes are not supported on this platform - falling back to 'Scale outer'");
			this.fullscreen_mode = 3;
			this.fullscreen_mode_set = 3;
		}
		this.uses_loader_layout = pm[17];
		this.loaderstyle = pm[18];
		if (this.loaderstyle === 0)
		{
			this.loaderlogo = new Image();
			this.loaderlogo.src = "loading-logo.png";
		}
		this.next_uid = pm[20];
		this.system = new cr.system_object(this);
		var i, len, j, lenj, k, lenk, idstr, m, b, t, f;
		var plugin, plugin_ctor;
		for (i = 0, len = pm[2].length; i < len; i++)
		{
			m = pm[2][i];
;
			cr.add_common_aces(m);
			plugin = new m[0](this);
			plugin.singleglobal = m[1];
			plugin.is_world = m[2];
			plugin.must_predraw = m[9];
			if (plugin.onCreate)
				plugin.onCreate();  // opportunity to override default ACEs
			cr.seal(plugin);
			this.plugins.push(plugin);
		}
		pm = cr.getProjectModel();
		for (i = 0, len = pm[3].length; i < len; i++)
		{
			m = pm[3][i];
			plugin_ctor = m[1];
;
			plugin = null;
			for (j = 0, lenj = this.plugins.length; j < lenj; j++)
			{
				if (this.plugins[j] instanceof plugin_ctor)
				{
					plugin = this.plugins[j];
					break;
				}
			}
;
;
			var type_inst = new plugin.Type(plugin);
;
			type_inst.name = m[0];
			type_inst.is_family = m[2];
			type_inst.instvar_sids = m[3].slice(0);
			type_inst.vars_count = m[3].length;
			type_inst.behs_count = m[4];
			type_inst.fx_count = m[5];
			type_inst.sid = m[11];
			if (type_inst.is_family)
			{
				type_inst.members = [];				// types in this family
				type_inst.family_index = this.family_count++;
				type_inst.families = null;
			}
			else
			{
				type_inst.members = null;
				type_inst.family_index = -1;
				type_inst.families = [];			// families this type belongs to
			}
			type_inst.family_var_map = null;
			type_inst.family_beh_map = null;
			type_inst.family_fx_map = null;
			type_inst.is_contained = false;
			type_inst.container = null;
			if (m[6])
			{
				type_inst.texture_file = m[6][0];
				type_inst.texture_filesize = m[6][1];
				type_inst.texture_pixelformat = m[6][2];
			}
			else
			{
				type_inst.texture_file = null;
				type_inst.texture_filesize = 0;
				type_inst.texture_pixelformat = 0;		// rgba8
			}
			if (m[7])
			{
				type_inst.animations = m[7];
			}
			else
			{
				type_inst.animations = null;
			}
			type_inst.index = i;                                // save index in to types array in type
			type_inst.instances = [];                           // all instances of this type
			type_inst.deadCache = [];							// destroyed instances to recycle next create
			type_inst.solstack = [new cr.selection(type_inst)]; // initialise SOL stack with one empty SOL
			type_inst.cur_sol = 0;
			type_inst.default_instance = null;
			type_inst.default_layerindex = 0;
			type_inst.stale_iids = true;
			type_inst.updateIIDs = cr.type_updateIIDs;
			type_inst.getFirstPicked = cr.type_getFirstPicked;
			type_inst.getPairedInstance = cr.type_getPairedInstance;
			type_inst.getCurrentSol = cr.type_getCurrentSol;
			type_inst.pushCleanSol = cr.type_pushCleanSol;
			type_inst.pushCopySol = cr.type_pushCopySol;
			type_inst.popSol = cr.type_popSol;
			type_inst.getBehaviorByName = cr.type_getBehaviorByName;
			type_inst.getBehaviorIndexByName = cr.type_getBehaviorIndexByName;
			type_inst.getEffectIndexByName = cr.type_getEffectIndexByName;
			type_inst.applySolToContainer = cr.type_applySolToContainer;
			type_inst.getInstanceByIID = cr.type_getInstanceByIID;
			type_inst.collision_grid = new cr.SparseGrid(this.original_width, this.original_height);
			type_inst.any_cell_changed = true;
			type_inst.any_instance_parallaxed = false;
			type_inst.extra = {};
			type_inst.toString = cr.type_toString;
			type_inst.behaviors = [];
			for (j = 0, lenj = m[8].length; j < lenj; j++)
			{
				b = m[8][j];
				var behavior_ctor = b[1];
				var behavior_plugin = null;
				for (k = 0, lenk = this.behaviors.length; k < lenk; k++)
				{
					if (this.behaviors[k] instanceof behavior_ctor)
					{
						behavior_plugin = this.behaviors[k];
						break;
					}
				}
				if (!behavior_plugin)
				{
					behavior_plugin = new behavior_ctor(this);
					behavior_plugin.my_types = [];						// types using this behavior
					behavior_plugin.my_instances = new cr.ObjectSet(); 	// instances of this behavior
					if (behavior_plugin.onCreate)
						behavior_plugin.onCreate();
					cr.seal(behavior_plugin);
					this.behaviors.push(behavior_plugin);
					if (cr.behaviors.solid && behavior_plugin instanceof cr.behaviors.solid)
						this.solidBehavior = behavior_plugin;
					if (cr.behaviors.jumpthru && behavior_plugin instanceof cr.behaviors.jumpthru)
						this.jumpthruBehavior = behavior_plugin;
				}
				if (behavior_plugin.my_types.indexOf(type_inst) === -1)
					behavior_plugin.my_types.push(type_inst);
				var behavior_type = new behavior_plugin.Type(behavior_plugin, type_inst);
				behavior_type.name = b[0];
				behavior_type.sid = b[2];
				behavior_type.onCreate();
				cr.seal(behavior_type);
				type_inst.behaviors.push(behavior_type);
			}
			type_inst.global = m[9];
			type_inst.isOnLoaderLayout = m[10];
			type_inst.effect_types = [];
			for (j = 0, lenj = m[12].length; j < lenj; j++)
			{
				type_inst.effect_types.push({
					id: m[12][j][0],
					name: m[12][j][1],
					shaderindex: -1,
					active: true,
					index: j
				});
			}
			type_inst.tile_poly_data = m[13];
			if (!this.uses_loader_layout || type_inst.is_family || type_inst.isOnLoaderLayout || !plugin.is_world)
			{
				type_inst.onCreate();
				cr.seal(type_inst);
			}
			if (type_inst.name)
				this.types[type_inst.name] = type_inst;
			this.types_by_index.push(type_inst);
			if (plugin.singleglobal)
			{
				var instance = new plugin.Instance(type_inst);
				instance.uid = this.next_uid++;
				instance.puid = this.next_puid++;
				instance.iid = 0;
				instance.get_iid = cr.inst_get_iid;
				instance.toString = cr.inst_toString;
				instance.properties = m[14];
				instance.onCreate();
				cr.seal(instance);
				type_inst.instances.push(instance);
				this.objectsByUid[instance.uid.toString()] = instance;
			}
		}
		for (i = 0, len = pm[4].length; i < len; i++)
		{
			var familydata = pm[4][i];
			var familytype = this.types_by_index[familydata[0]];
			var familymember;
			for (j = 1, lenj = familydata.length; j < lenj; j++)
			{
				familymember = this.types_by_index[familydata[j]];
				familymember.families.push(familytype);
				familytype.members.push(familymember);
			}
		}
		for (i = 0, len = pm[23].length; i < len; i++)
		{
			var containerdata = pm[23][i];
			var containertypes = [];
			for (j = 0, lenj = containerdata.length; j < lenj; j++)
				containertypes.push(this.types_by_index[containerdata[j]]);
			for (j = 0, lenj = containertypes.length; j < lenj; j++)
			{
				containertypes[j].is_contained = true;
				containertypes[j].container = containertypes;
			}
		}
		if (this.family_count > 0)
		{
			for (i = 0, len = this.types_by_index.length; i < len; i++)
			{
				t = this.types_by_index[i];
				if (t.is_family || !t.families.length)
					continue;
				t.family_var_map = new Array(this.family_count);
				t.family_beh_map = new Array(this.family_count);
				t.family_fx_map = new Array(this.family_count);
				var all_fx = [];
				var varsum = 0;
				var behsum = 0;
				var fxsum = 0;
				for (j = 0, lenj = t.families.length; j < lenj; j++)
				{
					f = t.families[j];
					t.family_var_map[f.family_index] = varsum;
					varsum += f.vars_count;
					t.family_beh_map[f.family_index] = behsum;
					behsum += f.behs_count;
					t.family_fx_map[f.family_index] = fxsum;
					fxsum += f.fx_count;
					for (k = 0, lenk = f.effect_types.length; k < lenk; k++)
						all_fx.push(cr.shallowCopy({}, f.effect_types[k]));
				}
				t.effect_types = all_fx.concat(t.effect_types);
				for (j = 0, lenj = t.effect_types.length; j < lenj; j++)
					t.effect_types[j].index = j;
			}
		}
		for (i = 0, len = pm[5].length; i < len; i++)
		{
			m = pm[5][i];
			var layout = new cr.layout(this, m);
			cr.seal(layout);
			this.layouts[layout.name] = layout;
			this.layouts_by_index.push(layout);
		}
		for (i = 0, len = pm[6].length; i < len; i++)
		{
			m = pm[6][i];
			var sheet = new cr.eventsheet(this, m);
			cr.seal(sheet);
			this.eventsheets[sheet.name] = sheet;
			this.eventsheets_by_index.push(sheet);
		}
		for (i = 0, len = this.eventsheets_by_index.length; i < len; i++)
			this.eventsheets_by_index[i].postInit();
		for (i = 0, len = this.triggers_to_postinit.length; i < len; i++)
			this.triggers_to_postinit[i].postInit();
		this.triggers_to_postinit.length = 0;
		this.files_subfolder = pm[7];
		this.pixel_rounding = pm[8];
		this.aspect_scale = 1.0;
		this.enableWebGL = pm[12];
		this.linearSampling = pm[13];
		this.alphaBackground = pm[14];
		this.versionstr = pm[15];
		this.useHighDpi = pm[16];
		this.orientations = pm[19];		// 0 = any, 1 = portrait, 2 = landscape
		this.autoLockOrientation = (this.orientations > 0);
		this.pauseOnBlur = pm[21];
		this.wantFullscreenScalingQuality = pm[22];		// false = low quality, true = high quality
		this.fullscreenScalingQuality = this.wantFullscreenScalingQuality;
		this.start_time = Date.now();
	};
	var anyImageHadError = false;
	Runtime.prototype.waitForImageLoad = function (img_)
	{
		img_.onerror = function ()
		{
			img_.c2error = true;
			anyImageHadError = true;
		};
		this.wait_for_textures.push(img_);
	};
	Runtime.prototype.findWaitingTexture = function (src_)
	{
		var i, len;
		for (i = 0, len = this.wait_for_textures.length; i < len; i++)
		{
			if (this.wait_for_textures[i].cr_src === src_)
				return this.wait_for_textures[i];
		}
		return null;
	};
	Runtime.prototype.areAllTexturesLoaded = function ()
	{
		var totalsize = 0;
		var completedsize = 0;
		var ret = true;
		var i, len, img;
		for (i = 0, len = this.wait_for_textures.length; i < len; i++)
		{
			img = this.wait_for_textures[i];
			var filesize = img.cr_filesize;
			if (!filesize || filesize <= 0)
				filesize = 50000;
			totalsize += filesize;
			if ((img.complete || img["loaded"]) && !img.c2error)
				completedsize += filesize;
			else
				ret = false;    // not all textures loaded
		}
		if (totalsize == 0)
			this.progress = 0;
		else
			this.progress = (completedsize / totalsize);
		return ret;
	};
	Runtime.prototype.go = function ()
	{
		if (!this.ctx && !this.glwrap)
			return;
		var ctx = this.ctx || this.overlay_ctx;
		if (this.overlay_canvas)
			this.positionOverlayCanvas();
		this.progress = 0;
		this.last_progress = -1;
		if (this.areAllTexturesLoaded())
			this.go_textures_done();
		else
		{
			var ms_elapsed = Date.now() - this.start_time;
			if (ctx)
			{
				var overlay_width = this.width;
				var overlay_height = this.height;
				var multiplier = this.devicePixelRatio;
				if (this.overlay_canvas)
				{
					overlay_width = this.cssWidth;
					overlay_height = this.cssHeight;
					multiplier = 1;
				}
				if (this.loaderstyle !== 3 && ms_elapsed >= 500 && this.last_progress != this.progress)
				{
					ctx.clearRect(0, 0, overlay_width, overlay_height);
					var mx = overlay_width / 2;
					var my = overlay_height / 2;
					var haslogo = (this.loaderstyle === 0 && this.loaderlogo.complete);
					var hlw = 40 * multiplier;
					var hlh = 0;
					var logowidth = 80 * multiplier;
					var logoheight;
					if (haslogo)
					{
						logowidth = this.loaderlogo.width * multiplier;
						logoheight = this.loaderlogo.height * multiplier;
						hlw = logowidth / 2;
						hlh = logoheight / 2;
						ctx.drawImage(this.loaderlogo, cr.floor(mx - hlw), cr.floor(my - hlh), logowidth, logoheight);
					}
					if (this.loaderstyle <= 1)
					{
						my += hlh + (haslogo ? 12 * multiplier : 0);
						mx -= hlw;
						mx = cr.floor(mx) + 0.5;
						my = cr.floor(my) + 0.5;
						ctx.fillStyle = anyImageHadError ? "red" : "DodgerBlue";
						ctx.fillRect(mx, my, Math.floor(logowidth * this.progress), 6 * multiplier);
						ctx.strokeStyle = "black";
						ctx.strokeRect(mx, my, logowidth, 6 * multiplier);
						ctx.strokeStyle = "white";
						ctx.strokeRect(mx - 1 * multiplier, my - 1 * multiplier, logowidth + 2 * multiplier, 8 * multiplier);
					}
					else if (this.loaderstyle === 2)
					{
						ctx.font = "12pt Arial";
						ctx.fillStyle = anyImageHadError ? "#f00" : "#999";
						ctx.textBaseLine = "middle";
						var percent_text = Math.round(this.progress * 100) + "%";
						var text_dim = ctx.measureText ? ctx.measureText(percent_text) : null;
						var text_width = text_dim ? text_dim.width : 0;
						ctx.fillText(percent_text, mx - (text_width / 2), my);
					}
				}
				this.last_progress = this.progress;
			}
			setTimeout((function (self) { return function () { self.go(); }; })(this), 100);
		}
	};
	Runtime.prototype.go_textures_done = function ()
	{
		if (this.overlay_canvas)
		{
			this.canvas.parentNode.removeChild(this.overlay_canvas);
			this.overlay_ctx = null;
			this.overlay_canvas = null;
		}
		this.start_time = Date.now();
		this.last_fps_time = cr.performance_now();       // for counting framerate
		var i, len, t;
		if (this.uses_loader_layout)
		{
			for (i = 0, len = this.types_by_index.length; i < len; i++)
			{
				t = this.types_by_index[i];
				if (!t.is_family && !t.isOnLoaderLayout && t.plugin.is_world)
				{
					t.onCreate();
					cr.seal(t);
				}
			}
		}
		else
			this.isloading = false;
		for (i = 0, len = this.layouts_by_index.length; i < len; i++)
		{
			this.layouts_by_index[i].createGlobalNonWorlds();
		}
		if (this.fullscreen_mode >= 2)
		{
			var orig_aspect = this.original_width / this.original_height;
			var cur_aspect = this.width / this.height;
			if ((this.fullscreen_mode !== 2 && cur_aspect > orig_aspect) || (this.fullscreen_mode === 2 && cur_aspect < orig_aspect))
				this.aspect_scale = this.height / this.original_height;
			else
				this.aspect_scale = this.width / this.original_width;
		}
		if (this.first_layout)
			this.layouts[this.first_layout].startRunning();
		else
			this.layouts_by_index[0].startRunning();
;
		if (!this.uses_loader_layout)
		{
			this.loadingprogress = 1;
			this.trigger(cr.system_object.prototype.cnds.OnLoadFinished, null);
		}
		if (navigator["splashscreen"] && navigator["splashscreen"]["hide"])
			navigator["splashscreen"]["hide"]();
		for (i = 0, len = this.types_by_index.length; i < len; i++)
		{
			t = this.types_by_index[i];
			if (t.onAppBegin)
				t.onAppBegin();
		}
		this.tick();
		if (this.isDirectCanvas)
			AppMobi["webview"]["execute"]("onGameReady();");
	};
	var raf = window["requestAnimationFrame"] ||
	  window["mozRequestAnimationFrame"]    ||
	  window["webkitRequestAnimationFrame"] ||
	  window["msRequestAnimationFrame"]     ||
	  window["oRequestAnimationFrame"];
	Runtime.prototype.tick = function ()
	{
		if (!this.running_layout)
			return;
		var logic_start = cr.performance_now();
		if (this.halfFramerateMode && this.ranLastRaf)
		{
			if (logic_start - this.lastRafTime < 29)
			{
				this.ranLastRaf = false;
				this.lastRafTime = logic_start;
				if (raf)
					this.raf_id = raf(this.tickFunc, this.canvas);
				else	// no idea if this works without raf/hi res timers but let's hope for the best
					this.timeout_id = setTimeout(this.tickFunc, this.isMobile ? 1 : 16);
				return;		// skipped this frame
			}
		}
		this.ranLastRaf = true;
		this.lastRafTime = logic_start;
		var fsmode = this.fullscreen_mode;
		var isfullscreen = (document["mozFullScreen"] || document["webkitIsFullScreen"] || document["fullScreen"] || !!document["msFullscreenElement"]);
		if ((isfullscreen || this.isNodeFullscreen) && this.fullscreen_scaling > 0)
			fsmode = this.fullscreen_scaling;
		if (fsmode > 0 && (!this.isiPhone || window.self !== window.top))
		{
			var curwidth = window.innerWidth;
			var curheight = window.innerHeight;
			if (this.lastWindowWidth !== curwidth || this.lastWindowHeight !== curheight)
			{
					this["setSize"](curwidth, curheight);
			}
		}
		if (!this.isDomFree)
		{
			if (isfullscreen)
			{
				if (!this.firstInFullscreen)
				{
					this.fullscreenOldMarginCss = jQuery(this.canvas).css("margin") || "0";
					this.firstInFullscreen = true;
				}
				if (!this.isChrome && !this.isNodeWebkit)
				{
					jQuery(this.canvas).css({
						"margin-left": "" + Math.floor((screen.width - (this.width / this.devicePixelRatio)) / 2) + "px",
						"margin-top": "" + Math.floor((screen.height - (this.height / this.devicePixelRatio)) / 2) + "px"
					});
				}
			}
			else
			{
				if (this.firstInFullscreen)
				{
					if (!this.isChrome && !this.isNodeWebkit)
					{
						jQuery(this.canvas).css("margin", this.fullscreenOldMarginCss);
					}
					this.fullscreenOldMarginCss = "";
					this.firstInFullscreen = false;
					if (this.fullscreen_mode === 0)
					{
						this["setSize"](Math.round(this.oldWidth / this.devicePixelRatio), Math.round(this.oldHeight / this.devicePixelRatio), true);
					}
				}
				else
				{
					this.oldWidth = this.width;
					this.oldHeight = this.height;
				}
			}
		}
		if (this.isloading)
		{
			var done = this.areAllTexturesLoaded();		// updates this.progress
			this.loadingprogress = this.progress;
			if (done)
			{
				this.isloading = false;
				this.progress = 1;
				this.trigger(cr.system_object.prototype.cnds.OnLoadFinished, null);
			}
		}
		this.logic();
		if ((this.redraw || this.isCocoonJs) && !this.is_WebGL_context_lost && !this.suspendDrawing)
		{
			this.redraw = false;
			if (this.glwrap)
				this.drawGL();
			else
				this.draw();
			if (this.snapshotCanvas)
			{
				if (this.canvas && this.canvas.toDataURL)
				{
					this.snapshotData = this.canvas.toDataURL(this.snapshotCanvas[0], this.snapshotCanvas[1]);
					this.trigger(cr.system_object.prototype.cnds.OnCanvasSnapshot, null);
				}
				this.snapshotCanvas = null;
			}
		}
		if (!this.hit_breakpoint)
		{
			this.tickcount++;
			this.execcount++;
			this.framecount++;
		}
		this.logictime += cr.performance_now() - logic_start;
		if (this.isSuspended)
			return;
		if (raf)
			this.raf_id = raf(this.tickFunc, this.canvas);
		else
		{
			this.timeout_id = setTimeout(this.tickFunc, this.isMobile ? 1 : 16);
		}
	};
	Runtime.prototype.logic = function ()
	{
		var i, leni, j, lenj, k, lenk, type, inst, binst;
		var cur_time = cr.performance_now();
		if (cur_time - this.last_fps_time >= 1000)  // every 1 second
		{
			this.last_fps_time += 1000;
			this.fps = this.framecount;
			this.framecount = 0;
			this.cpuutilisation = this.logictime;
			this.logictime = 0;
		}
		if (this.measuring_dt)
		{
			if (this.last_tick_time !== 0)
			{
				var ms_diff = cur_time - this.last_tick_time;
				if (ms_diff === 0 && !this.isDebug)
				{
					this.zeroDtCount++;
					if (this.zeroDtCout >= 10)
						this.measuring_dt = false;
					this.dt1 = 1.0 / 60.0;            // 60fps assumed (0.01666...)
				}
				else
				{
					this.dt1 = ms_diff / 1000.0; // dt measured in seconds
					if (this.dt1 > 0.5)
						this.dt1 = 0;
					else if (this.dt1 > 0.1)
						this.dt1 = 0.1;
				}
			}
			this.last_tick_time = cur_time;
		}
        this.dt = this.dt1 * this.timescale;
        this.kahanTime.add(this.dt);
		var isfullscreen = (document["mozFullScreen"] || document["webkitIsFullScreen"] || document["fullScreen"] || !!document["msFullscreenElement"] || this.isNodeFullscreen);
		if (this.fullscreen_mode >= 2 /* scale */ || (isfullscreen && this.fullscreen_scaling > 0))
		{
			var orig_aspect = this.original_width / this.original_height;
			var cur_aspect = this.width / this.height;
			var mode = this.fullscreen_mode;
			if (isfullscreen && this.fullscreen_scaling > 0)
				mode = this.fullscreen_scaling;
			if ((mode !== 2 && cur_aspect > orig_aspect) || (mode === 2 && cur_aspect < orig_aspect))
			{
				this.aspect_scale = this.height / this.original_height;
			}
			else
			{
				this.aspect_scale = this.width / this.original_width;
			}
			if (this.running_layout)
			{
				this.running_layout.scrollToX(this.running_layout.scrollX);
				this.running_layout.scrollToY(this.running_layout.scrollY);
			}
		}
		else
			this.aspect_scale = (this.isRetina ? this.devicePixelRatio : 1);
		this.ClearDeathRow();
		this.isInOnDestroy++;
		this.system.runWaits();		// prevent instance list changing
		this.isInOnDestroy--;
		this.ClearDeathRow();		// allow instance list changing
		this.isInOnDestroy++;
		for (i = 0, leni = this.types_by_index.length; i < leni; i++)
		{
			type = this.types_by_index[i];
			if (type.is_family || (!type.behaviors.length && !type.families.length))
				continue;
			for (j = 0, lenj = type.instances.length; j < lenj; j++)
			{
				inst = type.instances[j];
				for (k = 0, lenk = inst.behavior_insts.length; k < lenk; k++)
				{
					inst.behavior_insts[k].tick();
				}
			}
		}
		for (i = 0, leni = this.types_by_index.length; i < leni; i++)
		{
			type = this.types_by_index[i];
			if (type.is_family || (!type.behaviors.length && !type.families.length))
				continue;	// type doesn't have any behaviors
			for (j = 0, lenj = type.instances.length; j < lenj; j++)
			{
				inst = type.instances[j];
				for (k = 0, lenk = inst.behavior_insts.length; k < lenk; k++)
				{
					binst = inst.behavior_insts[k];
					if (binst.posttick)
						binst.posttick();
				}
			}
		}
        var tickarr = this.objects_to_tick.valuesRef();
        for (i = 0, leni = tickarr.length; i < leni; i++)
            tickarr[i].tick();
		this.isInOnDestroy--;		// end preventing instance lists from being changed
		this.handleSaveLoad();		// save/load now if queued
		i = 0;
		while (this.changelayout && i++ < 10)
		{
			this.doChangeLayout(this.changelayout);
		}
        for (i = 0, leni = this.eventsheets_by_index.length; i < leni; i++)
            this.eventsheets_by_index[i].hasRun = false;
		if (this.running_layout.event_sheet)
			this.running_layout.event_sheet.run();
		this.registered_collisions.length = 0;
		this.layout_first_tick = false;
		this.isInOnDestroy++;		// prevent instance lists from being changed
		for (i = 0, leni = this.types_by_index.length; i < leni; i++)
		{
			type = this.types_by_index[i];
			if (type.is_family || (!type.behaviors.length && !type.families.length))
				continue;	// type doesn't have any behaviors
			for (j = 0, lenj = type.instances.length; j < lenj; j++)
			{
				var inst = type.instances[j];
				for (k = 0, lenk = inst.behavior_insts.length; k < lenk; k++)
				{
					binst = inst.behavior_insts[k];
					if (binst.tick2)
						binst.tick2();
				}
			}
		}
        tickarr = this.objects_to_tick2.valuesRef();
        for (i = 0, leni = tickarr.length; i < leni; i++)
            tickarr[i].tick2();
		this.isInOnDestroy--;		// end preventing instance lists from being changed
	};
	Runtime.prototype.doChangeLayout = function (changeToLayout)
	{
;
		var prev_layout = this.running_layout;
		this.running_layout.stopRunning();
		var i, len, j, lenj, k, lenk, type, inst, binst;
		if (this.glwrap)
		{
			for (i = 0, len = this.types_by_index.length; i < len; i++)
			{
				type = this.types_by_index[i];
				if (type.is_family)
					continue;
				if (type.unloadTextures && (!type.global || type.instances.length === 0) && changeToLayout.initial_types.indexOf(type) === -1)
				{
					type.unloadTextures();
				}
			}
		}
		if (prev_layout == changeToLayout)
			this.system.waits.length = 0;
		changeToLayout.startRunning();
		for (i = 0, len = this.types_by_index.length; i < len; i++)
		{
			type = this.types_by_index[i];
			if (!type.global && !type.plugin.singleglobal)
				continue;
			for (j = 0, lenj = type.instances.length; j < lenj; j++)
			{
				inst = type.instances[j];
				if (inst.onLayoutChange)
					inst.onLayoutChange();
				if (inst.behavior_insts)
				{
					for (k = 0, lenk = inst.behavior_insts.length; k < lenk; k++)
					{
						binst = inst.behavior_insts[k];
						if (binst.onLayoutChange)
							binst.onLayoutChange();
					}
				}
			}
		}
		this.redraw = true;
		this.layout_first_tick = true;
		this.ClearDeathRow();
	};
    Runtime.prototype.tickMe = function (inst)
    {
        this.objects_to_tick.add(inst);
    };
	Runtime.prototype.untickMe = function (inst)
	{
		this.objects_to_tick.remove(inst);
	};
	Runtime.prototype.tick2Me = function (inst)
    {
        this.objects_to_tick2.add(inst);
    };
	Runtime.prototype.untick2Me = function (inst)
	{
		this.objects_to_tick2.remove(inst);
	};
    Runtime.prototype.getDt = function (inst)
    {
        if (!inst || inst.my_timescale === -1.0)
            return this.dt;
        return this.dt1 * inst.my_timescale;
    };
	Runtime.prototype.draw = function ()
	{
		this.running_layout.draw(this.ctx);
		if (this.isDirectCanvas)
			this.ctx["present"]();
	};
	Runtime.prototype.drawGL = function ()
	{
		this.running_layout.drawGL(this.glwrap);
		this.glwrap.present();
	};
	Runtime.prototype.addDestroyCallback = function (f)
	{
		if (f)
			this.destroycallbacks.push(f);
	};
	Runtime.prototype.removeDestroyCallback = function (f)
	{
		cr.arrayFindRemove(this.destroycallbacks, f);
	};
	Runtime.prototype.getObjectByUID = function (uid_)
	{
;
		var uidstr = uid_.toString();
		if (this.objectsByUid.hasOwnProperty(uidstr))
			return this.objectsByUid[uidstr];
		else
			return null;
	};
	Runtime.prototype.DestroyInstance = function (inst)
	{
		var i, len;
		if (!this.deathRow.contains(inst))
		{
			this.deathRow.add(inst);
			if (inst.is_contained)
			{
				for (i = 0, len = inst.siblings.length; i < len; i++)
				{
					this.DestroyInstance(inst.siblings[i]);
				}
			}
			if (this.isInClearDeathRow)
				this.deathRow.values_cache.push(inst);
			this.isInOnDestroy++;		// support recursion
			this.trigger(Object.getPrototypeOf(inst.type.plugin).cnds.OnDestroyed, inst);
			this.isInOnDestroy--;
		}
	};
	Runtime.prototype.ClearDeathRow = function ()
	{
		var inst, index, type, instances, binst;
		var i, j, k, leni, lenj, lenk;
		var w, f;
		this.isInClearDeathRow = true;
		for (i = 0, leni = this.createRow.length; i < leni; i++)
		{
			inst = this.createRow[i];
			type = inst.type;
			type.instances.push(inst);
			for (j = 0, lenj = type.families.length; j < lenj; j++)
			{
				type.families[j].instances.push(inst);
				type.families[j].stale_iids = true;
			}
		}
		this.createRow.length = 0;
		var arr = this.deathRow.valuesRef();	// get array of items from set
		for (i = 0; i < arr.length; i++)		// check array length every time in case it changes
		{
			inst = arr[i];
			type = inst.type;
			instances = type.instances;
			for (j = 0, lenj = this.destroycallbacks.length; j < lenj; j++)
				this.destroycallbacks[j](inst);
			cr.arrayFindRemove(instances, inst);
			if (instances.length === 0)
				type.any_instance_parallaxed = false;
			if (inst.collcells)
			{
				type.collision_grid.update(inst, inst.collcells, null);
			}
			if (inst.layer)
			{
				cr.arrayRemove(inst.layer.instances, inst.get_zindex());
				inst.layer.zindices_stale = true;
			}
			for (j = 0, lenj = type.families.length; j < lenj; j++)
			{
				cr.arrayFindRemove(type.families[j].instances, inst);
				type.families[j].stale_iids = true;
			}
			if (inst.behavior_insts)
			{
				for (j = 0, lenj = inst.behavior_insts.length; j < lenj; j++)
				{
					binst = inst.behavior_insts[j];
					if (binst.onDestroy)
						binst.onDestroy();
					binst.behavior.my_instances.remove(inst);
				}
			}
            this.objects_to_tick.remove(inst);
			this.objects_to_tick2.remove(inst);
			for (j = 0, lenj = this.system.waits.length; j < lenj; j++)
			{
				w = this.system.waits[j];
				if (w.sols.hasOwnProperty(type.index))
					cr.arrayFindRemove(w.sols[type.index].insts, inst);
				if (!type.is_family)
				{
					for (k = 0, lenk = type.families.length; k < lenk; k++)
					{
						f = type.families[k];
						if (w.sols.hasOwnProperty(f.index))
							cr.arrayFindRemove(w.sols[f.index].insts, inst);
					}
				}
			}
			if (inst.onDestroy)
				inst.onDestroy();
			if (this.objectsByUid.hasOwnProperty(inst.uid.toString()))
				delete this.objectsByUid[inst.uid.toString()];
			this.objectcount--;
			if (type.deadCache.length < 64)
				type.deadCache.push(inst);
			type.stale_iids = true;
		}
		if (!this.deathRow.isEmpty())
			this.redraw = true;
		this.deathRow.clear();
		this.isInClearDeathRow = false;
	};
	Runtime.prototype.createInstance = function (type, layer, sx, sy)
	{
		if (type.is_family)
		{
			var i = cr.floor(Math.random() * type.members.length);
			return this.createInstance(type.members[i], layer, sx, sy);
		}
		if (!type.default_instance)
		{
			return null;
		}
		return this.createInstanceFromInit(type.default_instance, layer, false, sx, sy, false);
	};
	var all_behaviors = [];
	Runtime.prototype.createInstanceFromInit = function (initial_inst, layer, is_startup_instance, sx, sy, skip_siblings)
	{
		var i, len, j, lenj, p, effect_fallback, x, y;
		if (!initial_inst)
			return null;
		var type = this.types_by_index[initial_inst[1]];
;
;
		var is_world = type.plugin.is_world;
;
		if (this.isloading && is_world && !type.isOnLoaderLayout)
			return null;
		if (is_world && !this.glwrap && initial_inst[0][11] === 11)
			return null;
		var original_layer = layer;
		if (!is_world)
			layer = null;
		var inst;
		if (type.deadCache.length)
		{
			inst = type.deadCache.pop();
			inst.recycled = true;
			type.plugin.Instance.call(inst, type);
		}
		else
		{
			inst = new type.plugin.Instance(type);
			inst.recycled = false;
		}
		if (is_startup_instance && !skip_siblings)
			inst.uid = initial_inst[2];
		else
			inst.uid = this.next_uid++;
		this.objectsByUid[inst.uid.toString()] = inst;
		inst.puid = this.next_puid++;
		inst.iid = type.instances.length;
		for (i = 0, len = this.createRow.length; i < len; ++i)
		{
			if (this.createRow[i].type === type)
				inst.iid++;
		}
		inst.get_iid = cr.inst_get_iid;
		var initial_vars = initial_inst[3];
		if (inst.recycled)
		{
			cr.wipe(inst.extra);
		}
		else
		{
			inst.extra = {};
			if (typeof cr_is_preview !== "undefined")
			{
				inst.instance_var_names = [];
				inst.instance_var_names.length = initial_vars.length;
				for (i = 0, len = initial_vars.length; i < len; i++)
					inst.instance_var_names[i] = initial_vars[i][1];
			}
			inst.instance_vars = [];
			inst.instance_vars.length = initial_vars.length;
		}
		for (i = 0, len = initial_vars.length; i < len; i++)
			inst.instance_vars[i] = initial_vars[i][0];
		if (is_world)
		{
			var wm = initial_inst[0];
;
			inst.x = cr.is_undefined(sx) ? wm[0] : sx;
			inst.y = cr.is_undefined(sy) ? wm[1] : sy;
			inst.z = wm[2];
			inst.width = wm[3];
			inst.height = wm[4];
			inst.depth = wm[5];
			inst.angle = wm[6];
			inst.opacity = wm[7];
			inst.hotspotX = wm[8];
			inst.hotspotY = wm[9];
			inst.blend_mode = wm[10];
			effect_fallback = wm[11];
			if (!this.glwrap && type.effect_types.length)	// no WebGL renderer and shaders used
				inst.blend_mode = effect_fallback;			// use fallback blend mode - destroy mode was handled above
			inst.compositeOp = cr.effectToCompositeOp(inst.blend_mode);
			if (this.gl)
				cr.setGLBlend(inst, inst.blend_mode, this.gl);
			if (inst.recycled)
			{
				for (i = 0, len = wm[12].length; i < len; i++)
				{
					for (j = 0, lenj = wm[12][i].length; j < lenj; j++)
						inst.effect_params[i][j] = wm[12][i][j];
				}
				inst.bbox.set(0, 0, 0, 0);
				inst.collcells.set(0, 0, -1, -1);
				inst.bquad.set_from_rect(inst.bbox);
				inst.bbox_changed_callbacks.length = 0;
			}
			else
			{
				inst.effect_params = wm[12].slice(0);
				for (i = 0, len = inst.effect_params.length; i < len; i++)
					inst.effect_params[i] = wm[12][i].slice(0);
				inst.active_effect_types = [];
				inst.active_effect_flags = [];
				inst.active_effect_flags.length = type.effect_types.length;
				inst.bbox = new cr.rect(0, 0, 0, 0);
				inst.collcells = new cr.rect(0, 0, -1, -1);
				inst.bquad = new cr.quad();
				inst.bbox_changed_callbacks = [];
				inst.set_bbox_changed = cr.set_bbox_changed;
				inst.add_bbox_changed_callback = cr.add_bbox_changed_callback;
				inst.contains_pt = cr.inst_contains_pt;
				inst.update_bbox = cr.update_bbox;
				inst.update_collision_cell = cr.update_collision_cell;
				inst.get_zindex = cr.inst_get_zindex;
			}
			inst.tilemap_exists = false;
			inst.tilemap_width = 0;
			inst.tilemap_height = 0;
			inst.tilemap_data = null;
			if (wm.length === 14)
			{
				inst.tilemap_exists = true;
				inst.tilemap_width = wm[13][0];
				inst.tilemap_height = wm[13][1];
				inst.tilemap_data = wm[13][2];
			}
			for (i = 0, len = type.effect_types.length; i < len; i++)
				inst.active_effect_flags[i] = true;
			inst.updateActiveEffects = cr.inst_updateActiveEffects;
			inst.updateActiveEffects();
			inst.uses_shaders = !!inst.active_effect_types.length;
			inst.bbox_changed = true;
			inst.cell_changed = true;
			type.any_cell_changed = true;
			inst.visible = true;
            inst.my_timescale = -1.0;
			inst.layer = layer;
			inst.zindex = layer.instances.length;	// will be placed at top of current layer
			if (typeof inst.collision_poly === "undefined")
				inst.collision_poly = null;
			inst.collisionsEnabled = true;
			this.redraw = true;
		}
		inst.toString = cr.inst_toString;
		var initial_props, binst;
		all_behaviors.length = 0;
		for (i = 0, len = type.families.length; i < len; i++)
		{
			all_behaviors.push.apply(all_behaviors, type.families[i].behaviors);
		}
		all_behaviors.push.apply(all_behaviors, type.behaviors);
		if (inst.recycled)
		{
			for (i = 0, len = all_behaviors.length; i < len; i++)
			{
				var btype = all_behaviors[i];
				binst = inst.behavior_insts[i];
				binst.recycled = true;
				btype.behavior.Instance.call(binst, btype, inst);
				initial_props = initial_inst[4][i];
				for (j = 0, lenj = initial_props.length; j < lenj; j++)
					binst.properties[j] = initial_props[j];
				binst.onCreate();
				btype.behavior.my_instances.add(inst);
			}
		}
		else
		{
			inst.behavior_insts = [];
			for (i = 0, len = all_behaviors.length; i < len; i++)
			{
				var btype = all_behaviors[i];
				var binst = new btype.behavior.Instance(btype, inst);
				binst.recycled = false;
				binst.properties = initial_inst[4][i].slice(0);
				binst.onCreate();
				cr.seal(binst);
				inst.behavior_insts.push(binst);
				btype.behavior.my_instances.add(inst);
			}
		}
		initial_props = initial_inst[5];
		if (inst.recycled)
		{
			for (i = 0, len = initial_props.length; i < len; i++)
				inst.properties[i] = initial_props[i];
		}
		else
			inst.properties = initial_props.slice(0);
		this.createRow.push(inst);
		if (layer)
		{
;
			layer.instances.push(inst);
			if (layer.parallaxX !== 1 || layer.parallaxY !== 1)
				type.any_instance_parallaxed = true;
		}
		this.objectcount++;
		if (type.is_contained)
		{
			inst.is_contained = true;
			if (inst.recycled)
				inst.siblings.length = 0;
			else
				inst.siblings = [];			// note: should not include self in siblings
			if (!is_startup_instance && !skip_siblings)	// layout links initial instances
			{
				for (i = 0, len = type.container.length; i < len; i++)
				{
					if (type.container[i] === type)
						continue;
					if (!type.container[i].default_instance)
					{
						return null;
					}
					inst.siblings.push(this.createInstanceFromInit(type.container[i].default_instance, original_layer, false, is_world ? inst.x : sx, is_world ? inst.y : sy, true));
				}
				for (i = 0, len = inst.siblings.length; i < len; i++)
				{
					inst.siblings[i].siblings.push(inst);
					for (j = 0; j < len; j++)
					{
						if (i !== j)
							inst.siblings[i].siblings.push(inst.siblings[j]);
					}
				}
			}
		}
		else
		{
			inst.is_contained = false;
			inst.siblings = null;
		}
		inst.onCreate();
		if (!inst.recycled)
			cr.seal(inst);
		for (i = 0, len = inst.behavior_insts.length; i < len; i++)
		{
			if (inst.behavior_insts[i].postCreate)
				inst.behavior_insts[i].postCreate();
		}
		return inst;
	};
	Runtime.prototype.getLayerByName = function (layer_name)
	{
		var i, len;
		for (i = 0, len = this.running_layout.layers.length; i < len; i++)
		{
			var layer = this.running_layout.layers[i];
			if (cr.equals_nocase(layer.name, layer_name))
				return layer;
		}
		return null;
	};
	Runtime.prototype.getLayerByNumber = function (index)
	{
		index = cr.floor(index);
		if (index < 0)
			index = 0;
		if (index >= this.running_layout.layers.length)
			index = this.running_layout.layers.length - 1;
		return this.running_layout.layers[index];
	};
	Runtime.prototype.getLayer = function (l)
	{
		if (cr.is_number(l))
			return this.getLayerByNumber(l);
		else
			return this.getLayerByName(l.toString());
	};
	Runtime.prototype.clearSol = function (solModifiers)
	{
		var i, len;
		for (i = 0, len = solModifiers.length; i < len; i++)
		{
			solModifiers[i].getCurrentSol().select_all = true;
		}
	};
	Runtime.prototype.pushCleanSol = function (solModifiers)
	{
		var i, len;
		for (i = 0, len = solModifiers.length; i < len; i++)
		{
			solModifiers[i].pushCleanSol();
		}
	};
	Runtime.prototype.pushCopySol = function (solModifiers)
	{
		var i, len;
		for (i = 0, len = solModifiers.length; i < len; i++)
		{
			solModifiers[i].pushCopySol();
		}
	};
	Runtime.prototype.popSol = function (solModifiers)
	{
		var i, len;
		for (i = 0, len = solModifiers.length; i < len; i++)
		{
			solModifiers[i].popSol();
		}
	};
	Runtime.prototype.updateAllCells = function (type)
	{
		if (!type.any_cell_changed)
			return;		// all instances must already be up-to-date
		var i, len, instances = type.instances;
		for (i = 0, len = instances.length; i < len; ++i)
		{
			instances[i].update_collision_cell();
		}
		var createRow = this.createRow;
		for (i = 0, len = createRow.length; i < len; ++i)
		{
			if (createRow[i].type === type)
				createRow[i].update_collision_cell();
		}
		type.any_cell_changed = false;
	};
	Runtime.prototype.getCollisionCandidates = function (layer, rtype, bbox, candidates)
	{
		var i, len, t;
		var is_parallaxed = (layer ? (layer.parallaxX !== 1 || layer.parallaxY !== 1) : false);
		if (rtype.is_family)
		{
			for (i = 0, len = rtype.members.length; i < len; ++i)
			{
				t = rtype.members[i];
				if (is_parallaxed || t.any_instance_parallaxed)
				{
					cr.appendArray(candidates, t.instances);
				}
				else
				{
					this.updateAllCells(t);
					t.collision_grid.queryRange(bbox, candidates);
				}
			}
		}
		else
		{
			if (is_parallaxed || rtype.any_instance_parallaxed)
			{
				cr.appendArray(candidates, rtype.instances);
			}
			else
			{
				this.updateAllCells(rtype);
				rtype.collision_grid.queryRange(bbox, candidates);
			}
		}
	};
	Runtime.prototype.getTypesCollisionCandidates = function (layer, types, bbox, candidates)
	{
		var i, len;
		for (i = 0, len = types.length; i < len; ++i)
		{
			this.getCollisionCandidates(layer, types[i], bbox, candidates);
		}
	};
	Runtime.prototype.getSolidCollisionCandidates = function (layer, bbox, candidates)
	{
		var solid = this.getSolidBehavior();
		if (!solid)
			return null;
		this.getTypesCollisionCandidates(layer, solid.my_types, bbox, candidates);
	};
	Runtime.prototype.getJumpthruCollisionCandidates = function (layer, bbox, candidates)
	{
		var jumpthru = this.getJumpthruBehavior();
		if (!jumpthru)
			return null;
		this.getTypesCollisionCandidates(layer, jumpthru.my_types, bbox, candidates);
	};
	Runtime.prototype.testAndSelectCanvasPointOverlap = function (type, ptx, pty, inverted)
	{
		var sol = type.getCurrentSol();
		var i, j, inst, len;
		var lx, ly;
		if (sol.select_all)
		{
			if (!inverted)
			{
				sol.select_all = false;
				sol.instances.length = 0;   // clear contents
			}
			for (i = 0, len = type.instances.length; i < len; i++)
			{
				inst = type.instances[i];
				inst.update_bbox();
				lx = inst.layer.canvasToLayer(ptx, pty, true);
				ly = inst.layer.canvasToLayer(ptx, pty, false);
				if (inst.contains_pt(lx, ly))
				{
					if (inverted)
						return false;
					else
						sol.instances.push(inst);
				}
			}
		}
		else
		{
			j = 0;
			for (i = 0, len = sol.instances.length; i < len; i++)
			{
				inst = sol.instances[i];
				inst.update_bbox();
				lx = inst.layer.canvasToLayer(ptx, pty, true);
				ly = inst.layer.canvasToLayer(ptx, pty, false);
				if (inst.contains_pt(lx, ly))
				{
					if (inverted)
						return false;
					else
					{
						sol.instances[j] = sol.instances[i];
						j++;
					}
				}
			}
			if (!inverted)
				sol.instances.length = j;
		}
		type.applySolToContainer();
		if (inverted)
			return true;		// did not find anything overlapping
		else
			return sol.hasObjects();
	};
	Runtime.prototype.testOverlap = function (a, b)
	{
		if (!a || !b || a === b || !a.collisionsEnabled || !b.collisionsEnabled)
			return false;
		a.update_bbox();
		b.update_bbox();
		var layera = a.layer;
		var layerb = b.layer;
		var different_layers = (layera !== layerb && (layera.parallaxX !== layerb.parallaxX || layerb.parallaxY !== layerb.parallaxY || layera.scale !== layerb.scale || layera.angle !== layerb.angle || layera.zoomRate !== layerb.zoomRate));
		var i, len, i2, i21, x, y, haspolya, haspolyb, polya, polyb;
		if (!different_layers)	// same layers: easy check
		{
			if (!a.bbox.intersects_rect(b.bbox))
				return false;
			if (!a.bquad.intersects_quad(b.bquad))
				return false;
			if (a.tilemap_exists && b.tilemap_exists)
				return false;
			if (a.tilemap_exists)
				return this.testTilemapOverlap(a, b);
			if (b.tilemap_exists)
				return this.testTilemapOverlap(b, a);
			haspolya = (a.collision_poly && !a.collision_poly.is_empty());
			haspolyb = (b.collision_poly && !b.collision_poly.is_empty());
			if (!haspolya && !haspolyb)
				return true;
			if (haspolya)
			{
				a.collision_poly.cache_poly(a.width, a.height, a.angle);
				polya = a.collision_poly;
			}
			else
			{
				this.temp_poly.set_from_quad(a.bquad, a.x, a.y, a.width, a.height);
				polya = this.temp_poly;
			}
			if (haspolyb)
			{
				b.collision_poly.cache_poly(b.width, b.height, b.angle);
				polyb = b.collision_poly;
			}
			else
			{
				this.temp_poly.set_from_quad(b.bquad, b.x, b.y, b.width, b.height);
				polyb = this.temp_poly;
			}
			return polya.intersects_poly(polyb, b.x - a.x, b.y - a.y);
		}
		else	// different layers: need to do full translated check
		{
			haspolya = (a.collision_poly && !a.collision_poly.is_empty());
			haspolyb = (b.collision_poly && !b.collision_poly.is_empty());
			if (haspolya)
			{
				a.collision_poly.cache_poly(a.width, a.height, a.angle);
				this.temp_poly.set_from_poly(a.collision_poly);
			}
			else
			{
				this.temp_poly.set_from_quad(a.bquad, a.x, a.y, a.width, a.height);
			}
			polya = this.temp_poly;
			if (haspolyb)
			{
				b.collision_poly.cache_poly(b.width, b.height, b.angle);
				this.temp_poly2.set_from_poly(b.collision_poly);
			}
			else
			{
				this.temp_poly2.set_from_quad(b.bquad, b.x, b.y, b.width, b.height);
			}
			polyb = this.temp_poly2;
			for (i = 0, len = polya.pts_count; i < len; i++)
			{
				i2 = i * 2;
				i21 = i2 + 1;
				x = polya.pts_cache[i2];
				y = polya.pts_cache[i21];
				polya.pts_cache[i2] = layera.layerToCanvas(x + a.x, y + a.y, true);
				polya.pts_cache[i21] = layera.layerToCanvas(x + a.x, y + a.y, false);
			}
			polya.update_bbox();
			for (i = 0, len = polyb.pts_count; i < len; i++)
			{
				i2 = i * 2;
				i21 = i2 + 1;
				x = polyb.pts_cache[i2];
				y = polyb.pts_cache[i21];
				polyb.pts_cache[i2] = layerb.layerToCanvas(x + b.x, y + b.y, true);
				polyb.pts_cache[i21] = layerb.layerToCanvas(x + b.x, y + b.y, false);
			}
			polyb.update_bbox();
			return polya.intersects_poly(polyb, 0, 0);
		}
	};
	var tmpQuad = new cr.quad();
	var tmpRect = new cr.rect(0, 0, 0, 0);
	var collrect_candidates = [];
	Runtime.prototype.testTilemapOverlap = function (tm, a)
	{
		var i, len, c, rc;
		var bbox = a.bbox;
		var tmx = tm.x;
		var tmy = tm.y;
		tm.getCollisionRectCandidates(bbox, collrect_candidates);
		var collrects = collrect_candidates;
		var haspolya = (a.collision_poly && !a.collision_poly.is_empty());
		for (i = 0, len = collrects.length; i < len; ++i)
		{
			c = collrects[i];
			rc = c.rc;
			if (bbox.intersects_rect_off(rc, tmx, tmy))
			{
				tmpQuad.set_from_rect(rc);
				tmpQuad.offset(tmx, tmy);
				if (tmpQuad.intersects_quad(a.bquad))
				{
					if (haspolya)
					{
						a.collision_poly.cache_poly(a.width, a.height, a.angle);
						if (c.poly)
						{
							if (c.poly.intersects_poly(a.collision_poly, a.x - (tmx + rc.left), a.y - (tmy + rc.top)))
							{
								collrect_candidates.length = 0;
								return true;
							}
						}
						else
						{
							this.temp_poly.set_from_quad(tmpQuad, 0, 0, rc.right - rc.left, rc.bottom - rc.top);
							if (this.temp_poly.intersects_poly(a.collision_poly, a.x, a.y))
							{
								collrect_candidates.length = 0;
								return true;
							}
						}
					}
					else
					{
						if (c.poly)
						{
							this.temp_poly.set_from_quad(a.bquad, 0, 0, a.width, a.height);
							if (c.poly.intersects_poly(this.temp_poly, -(tmx + rc.left), -(tmy + rc.top)))
							{
								collrect_candidates.length = 0;
								return true;
							}
						}
						else
						{
							collrect_candidates.length = 0;
							return true;
						}
					}
				}
			}
		}
		collrect_candidates.length = 0;
		return false;
	};
	Runtime.prototype.testRectOverlap = function (r, b)
	{
		if (!b || !b.collisionsEnabled)
			return false;
		b.update_bbox();
		var layerb = b.layer;
		var haspolyb, polyb;
		if (!b.bbox.intersects_rect(r))
			return false;
		if (b.tilemap_exists)
		{
			b.getCollisionRectCandidates(r, collrect_candidates);
			var collrects = collrect_candidates;
			var i, len, c, tilerc;
			var tmx = b.x;
			var tmy = b.y;
			for (i = 0, len = collrects.length; i < len; ++i)
			{
				c = collrects[i];
				tilerc = c.rc;
				if (r.intersects_rect_off(tilerc, tmx, tmy))
				{
					if (c.poly)
					{
						this.temp_poly.set_from_rect(r, 0, 0);
						if (c.poly.intersects_poly(this.temp_poly, -(tmx + tilerc.left), -(tmy + tilerc.top)))
						{
							collrect_candidates.length = 0;
							return true;
						}
					}
					else
					{
						collrect_candidates.length = 0;
						return true;
					}
				}
			}
			collrect_candidates.length = 0;
			return false;
		}
		else
		{
			tmpQuad.set_from_rect(r);
			if (!b.bquad.intersects_quad(tmpQuad))
				return false;
			haspolyb = (b.collision_poly && !b.collision_poly.is_empty());
			if (!haspolyb)
				return true;
			b.collision_poly.cache_poly(b.width, b.height, b.angle);
			tmpQuad.offset(-r.left, -r.top);
			this.temp_poly.set_from_quad(tmpQuad, 0, 0, 1, 1);
			return b.collision_poly.intersects_poly(this.temp_poly, r.left - b.x, r.top - b.y);
		}
	};
	Runtime.prototype.testSegmentOverlap = function (x1, y1, x2, y2, b)
	{
		if (!b || !b.collisionsEnabled)
			return false;
		b.update_bbox();
		var layerb = b.layer;
		var haspolyb, polyb;
		tmpRect.set(cr.min(x1, x2), cr.min(y1, y2), cr.max(x1, x2), cr.max(y1, y2));
		if (!b.bbox.intersects_rect(tmpRect))
			return false;
		if (b.tilemap_exists)
		{
			b.getCollisionRectCandidates(tmpRect, collrect_candidates);
			var collrects = collrect_candidates;
			var i, len, c, tilerc;
			var tmx = b.x;
			var tmy = b.y;
			for (i = 0, len = collrects.length; i < len; ++i)
			{
				c = collrects[i];
				tilerc = c.rc;
				if (tmpRect.intersects_rect_off(tilerc, tmx, tmy))
				{
					tmpQuad.set_from_rect(tilerc);
					tmpQuad.offset(tmx, tmy);
					if (tmpQuad.intersects_segment(x1, y1, x2, y2))
					{
						if (c.poly)
						{
							if (c.poly.intersects_segment(tmx + tilerc.left, tmy + tilerc.top, x1, y1, x2, y2))
							{
								collrect_candidates.length = 0;
								return true;
							}
						}
						else
						{
							collrect_candidates.length = 0;
							return true;
						}
					}
				}
			}
			collrect_candidates.length = 0;
			return false;
		}
		else
		{
			if (!b.bquad.intersects_segment(x1, y1, x2, y2))
				return false;
			haspolyb = (b.collision_poly && !b.collision_poly.is_empty());
			if (!haspolyb)
				return true;
			b.collision_poly.cache_poly(b.width, b.height, b.angle);
			return b.collision_poly.intersects_segment(b.x, b.y, x1, y1, x2, y2);
		}
	};
	Runtime.prototype.typeHasBehavior = function (t, b)
	{
		if (!b)
			return false;
		var i, len, j, lenj, f;
		for (i = 0, len = t.behaviors.length; i < len; i++)
		{
			if (t.behaviors[i].behavior instanceof b)
				return true;
		}
		if (!t.is_family)
		{
			for (i = 0, len = t.families.length; i < len; i++)
			{
				f = t.families[i];
				for (j = 0, lenj = f.behaviors.length; j < lenj; j++)
				{
					if (f.behaviors[j].behavior instanceof b)
						return true;
				}
			}
		}
		return false;
	};
	Runtime.prototype.typeHasNoSaveBehavior = function (t)
	{
		return this.typeHasBehavior(t, cr.behaviors.NoSave);
	};
	Runtime.prototype.typeHasPersistBehavior = function (t)
	{
		return this.typeHasBehavior(t, cr.behaviors.Persist);
	};
	Runtime.prototype.getSolidBehavior = function ()
	{
		return this.solidBehavior;
	};
	Runtime.prototype.getJumpthruBehavior = function ()
	{
		return this.jumpthruBehavior;
	};
	var candidates = [];
	Runtime.prototype.testOverlapSolid = function (inst)
	{
		var i, len, s;
		inst.update_bbox();
		this.getSolidCollisionCandidates(inst.layer, inst.bbox, candidates);
		for (i = 0, len = candidates.length; i < len; ++i)
		{
			s = candidates[i];
			if (!s.extra.solidEnabled)
				continue;
			if (this.testOverlap(inst, s))
			{
				candidates.length = 0;
				return s;
			}
		}
		candidates.length = 0;
		return null;
	};
	Runtime.prototype.testRectOverlapSolid = function (r)
	{
		var i, len, s;
		this.getSolidCollisionCandidates(null, r, candidates);
		for (i = 0, len = candidates.length; i < len; ++i)
		{
			s = candidates[i];
			if (!s.extra.solidEnabled)
				continue;
			if (this.testRectOverlap(r, s))
			{
				candidates.length = 0;
				return s;
			}
		}
		candidates.length = 0;
		return null;
	};
	var jumpthru_array_ret = [];
	Runtime.prototype.testOverlapJumpThru = function (inst, all)
	{
		var ret = null;
		if (all)
		{
			ret = jumpthru_array_ret;
			ret.length = 0;
		}
		inst.update_bbox();
		this.getJumpthruCollisionCandidates(inst.layer, inst.bbox, candidates);
		var i, len, j;
		for (i = 0, len = candidates.length; i < len; ++i)
		{
			j = candidates[i];
			if (!j.extra.jumpthruEnabled)
				continue;
			if (this.testOverlap(inst, j))
			{
				if (all)
					ret.push(j);
				else
				{
					candidates.length = 0;
					return j;
				}
			}
		}
		candidates.length = 0;
		return ret;
	};
	Runtime.prototype.pushOutSolid = function (inst, xdir, ydir, dist, include_jumpthrus, specific_jumpthru)
	{
		var push_dist = dist || 50;
		var oldx = inst.x
		var oldy = inst.y;
		var i;
		var last_overlapped = null, secondlast_overlapped = null;
		for (i = 0; i < push_dist; i++)
		{
			inst.x = (oldx + (xdir * i));
			inst.y = (oldy + (ydir * i));
			inst.set_bbox_changed();
			if (!this.testOverlap(inst, last_overlapped))
			{
				last_overlapped = this.testOverlapSolid(inst);
				if (last_overlapped)
					secondlast_overlapped = last_overlapped;
				if (!last_overlapped)
				{
					if (include_jumpthrus)
					{
						if (specific_jumpthru)
							last_overlapped = (this.testOverlap(inst, specific_jumpthru) ? specific_jumpthru : null);
						else
							last_overlapped = this.testOverlapJumpThru(inst);
						if (last_overlapped)
							secondlast_overlapped = last_overlapped;
					}
					if (!last_overlapped)
					{
						if (secondlast_overlapped)
							this.pushInFractional(inst, xdir, ydir, secondlast_overlapped, 16);
						return true;
					}
				}
			}
		}
		inst.x = oldx;
		inst.y = oldy;
		inst.set_bbox_changed();
		return false;
	};
	Runtime.prototype.pushOut = function (inst, xdir, ydir, dist, otherinst)
	{
		var push_dist = dist || 50;
		var oldx = inst.x
		var oldy = inst.y;
		var i;
		for (i = 0; i < push_dist; i++)
		{
			inst.x = (oldx + (xdir * i));
			inst.y = (oldy + (ydir * i));
			inst.set_bbox_changed();
			if (!this.testOverlap(inst, otherinst))
				return true;
		}
		inst.x = oldx;
		inst.y = oldy;
		inst.set_bbox_changed();
		return false;
	};
	Runtime.prototype.pushInFractional = function (inst, xdir, ydir, obj, limit)
	{
		var divisor = 2;
		var frac;
		var forward = false;
		var overlapping = false;
		var bestx = inst.x;
		var besty = inst.y;
		while (divisor <= limit)
		{
			frac = 1 / divisor;
			divisor *= 2;
			inst.x += xdir * frac * (forward ? 1 : -1);
			inst.y += ydir * frac * (forward ? 1 : -1);
			inst.set_bbox_changed();
			if (this.testOverlap(inst, obj))
			{
				forward = true;
				overlapping = true;
			}
			else
			{
				forward = false;
				overlapping = false;
				bestx = inst.x;
				besty = inst.y;
			}
		}
		if (overlapping)
		{
			inst.x = bestx;
			inst.y = besty;
			inst.set_bbox_changed();
		}
	};
	Runtime.prototype.pushOutSolidNearest = function (inst, max_dist_)
	{
		var max_dist = (cr.is_undefined(max_dist_) ? 100 : max_dist_);
		var dist = 0;
		var oldx = inst.x
		var oldy = inst.y;
		var dir = 0;
		var dx = 0, dy = 0;
		var last_overlapped = this.testOverlapSolid(inst);
		if (!last_overlapped)
			return true;		// already clear of solids
		while (dist <= max_dist)
		{
			switch (dir) {
			case 0:		dx = 0; dy = -1; dist++; break;
			case 1:		dx = 1; dy = -1; break;
			case 2:		dx = 1; dy = 0; break;
			case 3:		dx = 1; dy = 1; break;
			case 4:		dx = 0; dy = 1; break;
			case 5:		dx = -1; dy = 1; break;
			case 6:		dx = -1; dy = 0; break;
			case 7:		dx = -1; dy = -1; break;
			}
			dir = (dir + 1) % 8;
			inst.x = cr.floor(oldx + (dx * dist));
			inst.y = cr.floor(oldy + (dy * dist));
			inst.set_bbox_changed();
			if (!this.testOverlap(inst, last_overlapped))
			{
				last_overlapped = this.testOverlapSolid(inst);
				if (!last_overlapped)
					return true;
			}
		}
		inst.x = oldx;
		inst.y = oldy;
		inst.set_bbox_changed();
		return false;
	};
	Runtime.prototype.registerCollision = function (a, b)
	{
		if (!a.collisionsEnabled || !b.collisionsEnabled)
			return;
		this.registered_collisions.push([a, b]);
	};
	Runtime.prototype.checkRegisteredCollision = function (a, b)
	{
		var i, len, x;
		for (i = 0, len = this.registered_collisions.length; i < len; i++)
		{
			x = this.registered_collisions[i];
			if ((x[0] == a && x[1] == b) || (x[0] == b && x[1] == a))
				return true;
		}
		return false;
	};
	Runtime.prototype.calculateSolidBounceAngle = function(inst, startx, starty, obj)
	{
		var objx = inst.x;
		var objy = inst.y;
		var radius = cr.max(10, cr.distanceTo(startx, starty, objx, objy));
		var startangle = cr.angleTo(startx, starty, objx, objy);
		var firstsolid = obj || this.testOverlapSolid(inst);
		if (!firstsolid)
			return cr.clamp_angle(startangle + cr.PI);
		var cursolid = firstsolid;
		var i, curangle, anticlockwise_free_angle, clockwise_free_angle;
		var increment = cr.to_radians(5);	// 5 degree increments
		for (i = 1; i < 36; i++)
		{
			curangle = startangle - i * increment;
			inst.x = startx + Math.cos(curangle) * radius;
			inst.y = starty + Math.sin(curangle) * radius;
			inst.set_bbox_changed();
			if (!this.testOverlap(inst, cursolid))
			{
				cursolid = obj ? null : this.testOverlapSolid(inst);
				if (!cursolid)
				{
					anticlockwise_free_angle = curangle;
					break;
				}
			}
		}
		if (i === 36)
			anticlockwise_free_angle = cr.clamp_angle(startangle + cr.PI);
		var cursolid = firstsolid;
		for (i = 1; i < 36; i++)
		{
			curangle = startangle + i * increment;
			inst.x = startx + Math.cos(curangle) * radius;
			inst.y = starty + Math.sin(curangle) * radius;
			inst.set_bbox_changed();
			if (!this.testOverlap(inst, cursolid))
			{
				cursolid = obj ? null : this.testOverlapSolid(inst);
				if (!cursolid)
				{
					clockwise_free_angle = curangle;
					break;
				}
			}
		}
		if (i === 36)
			clockwise_free_angle = cr.clamp_angle(startangle + cr.PI);
		inst.x = objx;
		inst.y = objy;
		inst.set_bbox_changed();
		if (clockwise_free_angle === anticlockwise_free_angle)
			return clockwise_free_angle;
		var half_diff = cr.angleDiff(clockwise_free_angle, anticlockwise_free_angle) / 2;
		var normal;
		if (cr.angleClockwise(clockwise_free_angle, anticlockwise_free_angle))
		{
			normal = cr.clamp_angle(anticlockwise_free_angle + half_diff + cr.PI);
		}
		else
		{
			normal = cr.clamp_angle(clockwise_free_angle + half_diff);
		}
;
		var vx = Math.cos(startangle);
		var vy = Math.sin(startangle);
		var nx = Math.cos(normal);
		var ny = Math.sin(normal);
		var v_dot_n = vx * nx + vy * ny;
		var rx = vx - 2 * v_dot_n * nx;
		var ry = vy - 2 * v_dot_n * ny;
		return cr.angleTo(0, 0, rx, ry);
	};
	var triggerSheetStack = [];
	var triggerSheetIndex = -1;
	Runtime.prototype.trigger = function (method, inst, value /* for fast triggers */)
	{
;
		if (!this.running_layout)
			return false;
		var sheet = this.running_layout.event_sheet;
		if (!sheet)
			return false;     // no event sheet active; nothing to trigger
		triggerSheetIndex++;
		if (triggerSheetIndex === triggerSheetStack.length)
			triggerSheetStack.push(new cr.ObjectSet());
		else
			triggerSheetStack[triggerSheetIndex].clear();
        var ret = this.triggerOnSheet(method, inst, sheet, value);
		triggerSheetIndex--;
		return ret;
    };
    Runtime.prototype.triggerOnSheet = function (method, inst, sheet, value)
    {
		var alreadyTriggeredSheets = triggerSheetStack[triggerSheetIndex];
        if (alreadyTriggeredSheets.contains(sheet))
            return false;
        alreadyTriggeredSheets.add(sheet);
        var includes = sheet.includes.valuesRef();
        var ret = false;
		var i, leni, r;
        for (i = 0, leni = includes.length; i < leni; i++)
        {
			if (includes[i].isActive())
			{
				r = this.triggerOnSheet(method, inst, includes[i].include_sheet, value);
				ret = ret || r;
			}
        }
		if (!inst)
		{
			r = this.triggerOnSheetForTypeName(method, inst, "system", sheet, value);
			ret = ret || r;
		}
		else
		{
			r = this.triggerOnSheetForTypeName(method, inst, inst.type.name, sheet, value);
			ret = ret || r;
			for (i = 0, leni = inst.type.families.length; i < leni; i++)
			{
				r = this.triggerOnSheetForTypeName(method, inst, inst.type.families[i].name, sheet, value);
				ret = ret || r;
			}
		}
		return ret;             // true if anything got triggered
	};
	Runtime.prototype.triggerOnSheetForTypeName = function (method, inst, type_name, sheet, value)
	{
		var i, leni;
		var ret = false, ret2 = false;
		var trig, index;
		var fasttrigger = (typeof value !== "undefined");
		var triggers = (fasttrigger ? sheet.fasttriggers : sheet.triggers);
		var obj_entry = triggers[type_name];
		if (!obj_entry)
			return ret;
		var triggers_list = null;
		for (i = 0, leni = obj_entry.length; i < leni; i++)
		{
			if (obj_entry[i].method == method)
			{
				triggers_list = obj_entry[i].evs;
				break;
			}
		}
		if (!triggers_list)
			return ret;
		var triggers_to_fire;
		if (fasttrigger)
		{
			triggers_to_fire = triggers_list[value];
		}
		else
		{
			triggers_to_fire = triggers_list;
		}
		if (!triggers_to_fire)
			return null;
		for (i = 0, leni = triggers_to_fire.length; i < leni; i++)
		{
			trig = triggers_to_fire[i][0];
			index = triggers_to_fire[i][1];
			ret2 = this.executeSingleTrigger(inst, type_name, trig, index);
			ret = ret || ret2;
		}
		return ret;
	};
	Runtime.prototype.executeSingleTrigger = function (inst, type_name, trig, index)
	{
		var i, leni;
		var ret = false;
		this.trigger_depth++;
		var current_event = this.getCurrentEventStack().current_event;
		if (current_event)
			this.pushCleanSol(current_event.solModifiersIncludingParents);
		var isrecursive = (this.trigger_depth > 1);		// calling trigger from inside another trigger
		this.pushCleanSol(trig.solModifiersIncludingParents);
		if (isrecursive)
			this.pushLocalVarStack();
		var event_stack = this.pushEventStack(trig);
		event_stack.current_event = trig;
		if (inst)
		{
			var sol = this.types[type_name].getCurrentSol();
			sol.select_all = false;
			sol.instances.length = 1;
			sol.instances[0] = inst;
			this.types[type_name].applySolToContainer();
		}
		var ok_to_run = true;
		if (trig.parent)
		{
			var temp_parents_arr = event_stack.temp_parents_arr;
			var cur_parent = trig.parent;
			while (cur_parent)
			{
				temp_parents_arr.push(cur_parent);
				cur_parent = cur_parent.parent;
			}
			temp_parents_arr.reverse();
			for (i = 0, leni = temp_parents_arr.length; i < leni; i++)
			{
				if (!temp_parents_arr[i].run_pretrigger())   // parent event failed
				{
					ok_to_run = false;
					break;
				}
			}
		}
		if (ok_to_run)
		{
			this.execcount++;
			if (trig.orblock)
				trig.run_orblocktrigger(index);
			else
				trig.run();
			ret = ret || event_stack.last_event_true;
		}
		this.popEventStack();
		if (isrecursive)
			this.popLocalVarStack();
		this.popSol(trig.solModifiersIncludingParents);
		if (current_event)
			this.popSol(current_event.solModifiersIncludingParents);
		if (this.isInOnDestroy === 0 && triggerSheetIndex === 0 && !this.isRunningEvents && (!this.deathRow.isEmpty() || this.createRow.length))
		{
			this.ClearDeathRow();
		}
		this.trigger_depth--;
		return ret;
	};
	Runtime.prototype.getCurrentCondition = function ()
	{
		var evinfo = this.getCurrentEventStack();
		return evinfo.current_event.conditions[evinfo.cndindex];
	};
	Runtime.prototype.getCurrentAction = function ()
	{
		var evinfo = this.getCurrentEventStack();
		return evinfo.current_event.actions[evinfo.actindex];
	};
	Runtime.prototype.pushLocalVarStack = function ()
	{
		this.localvar_stack_index++;
		if (this.localvar_stack_index >= this.localvar_stack.length)
			this.localvar_stack.push([]);
	};
	Runtime.prototype.popLocalVarStack = function ()
	{
;
		this.localvar_stack_index--;
	};
	Runtime.prototype.getCurrentLocalVarStack = function ()
	{
		return this.localvar_stack[this.localvar_stack_index];
	};
	Runtime.prototype.pushEventStack = function (cur_event)
	{
		this.event_stack_index++;
		if (this.event_stack_index >= this.event_stack.length)
			this.event_stack.push(new cr.eventStackFrame());
		var ret = this.getCurrentEventStack();
		ret.reset(cur_event);
		return ret;
	};
	Runtime.prototype.popEventStack = function ()
	{
;
		this.event_stack_index--;
	};
	Runtime.prototype.getCurrentEventStack = function ()
	{
		return this.event_stack[this.event_stack_index];
	};
	Runtime.prototype.pushLoopStack = function (name_)
	{
		this.loop_stack_index++;
		if (this.loop_stack_index >= this.loop_stack.length)
		{
			this.loop_stack.push(cr.seal({ name: name_, index: 0, stopped: false }));
		}
		var ret = this.getCurrentLoop();
		ret.name = name_;
		ret.index = 0;
		ret.stopped = false;
		return ret;
	};
	Runtime.prototype.popLoopStack = function ()
	{
;
		this.loop_stack_index--;
	};
	Runtime.prototype.getCurrentLoop = function ()
	{
		return this.loop_stack[this.loop_stack_index];
	};
	Runtime.prototype.getEventVariableByName = function (name, scope)
	{
		var i, leni, j, lenj, sheet, e;
		while (scope)
		{
			for (i = 0, leni = scope.subevents.length; i < leni; i++)
			{
				e = scope.subevents[i];
				if (e instanceof cr.eventvariable && cr.equals_nocase(name, e.name))
					return e;
			}
			scope = scope.parent;
		}
		for (i = 0, leni = this.eventsheets_by_index.length; i < leni; i++)
		{
			sheet = this.eventsheets_by_index[i];
			for (j = 0, lenj = sheet.events.length; j < lenj; j++)
			{
				e = sheet.events[j];
				if (e instanceof cr.eventvariable && cr.equals_nocase(name, e.name))
					return e;
			}
		}
		return null;
	};
	Runtime.prototype.getLayoutBySid = function (sid_)
	{
		var i, len;
		for (i = 0, len = this.layouts_by_index.length; i < len; i++)
		{
			if (this.layouts_by_index[i].sid === sid_)
				return this.layouts_by_index[i];
		}
		return null;
	};
	Runtime.prototype.getObjectTypeBySid = function (sid_)
	{
		var i, len;
		for (i = 0, len = this.types_by_index.length; i < len; i++)
		{
			if (this.types_by_index[i].sid === sid_)
				return this.types_by_index[i];
		}
		return null;
	};
	Runtime.prototype.getGroupBySid = function (sid_)
	{
		var i, len;
		for (i = 0, len = this.allGroups.length; i < len; i++)
		{
			if (this.allGroups[i].sid === sid_)
				return this.allGroups[i];
		}
		return null;
	};
	function makeSaveDb(e)
	{
		var db = e.target.result;
		db.createObjectStore("saves", { keyPath: "slot" });
	};
	function IndexedDB_WriteSlot(slot_, data_, oncomplete_, onerror_)
	{
		var request = indexedDB.open("_C2SaveStates");
		request.onupgradeneeded = makeSaveDb;
		request.onerror = onerror_;
		request.onsuccess = function (e)
		{
			var db = e.target.result;
			db.onerror = onerror_;
			var transaction = db.transaction(["saves"], "readwrite");
			var objectStore = transaction.objectStore("saves");
			var putReq = objectStore.put({"slot": slot_, "data": data_ });
			putReq.onsuccess = oncomplete_;
		};
	};
	function IndexedDB_ReadSlot(slot_, oncomplete_, onerror_)
	{
		var request = indexedDB.open("_C2SaveStates");
		request.onupgradeneeded = makeSaveDb;
		request.onerror = onerror_;
		request.onsuccess = function (e)
		{
			var db = e.target.result;
			db.onerror = onerror_;
			var transaction = db.transaction(["saves"]);
			var objectStore = transaction.objectStore("saves");
			var readReq = objectStore.get(slot_);
			readReq.onsuccess = function (e)
			{
				if (readReq.result)
					oncomplete_(readReq.result["data"]);
				else
					oncomplete_(null);
			};
		};
	};
	Runtime.prototype.signalContinuousPreview = function ()
	{
		this.signalledContinuousPreview = true;
	};
	function doContinuousPreviewReload()
	{
		cr.logexport("Reloading for continuous preview");
		if (!!window["c2cocoonjs"])
		{
			CocoonJS["App"]["reload"]();
		}
		else
		{
			if (window.location.search.indexOf("continuous") > -1)
				window.location.reload(true);
			else
				window.location = window.location + "?continuous";
		}
	};
	Runtime.prototype.handleSaveLoad = function ()
	{
		var self = this;
		var savingToSlot = this.saveToSlot;
		var savingJson = this.lastSaveJson;
		var loadingFromSlot = this.loadFromSlot;
		var continuous = false;
		if (this.signalledContinuousPreview)
		{
			continuous = true;
			savingToSlot = "__c2_continuouspreview";
			this.signalledContinuousPreview = false;
		}
		if (savingToSlot.length)
		{
			this.ClearDeathRow();
			savingJson = this.saveToJSONString();
			if (window.indexedDB && !this.isCocoonJs)
			{
				IndexedDB_WriteSlot(savingToSlot, savingJson, function ()
				{
					cr.logexport("Saved state to IndexedDB storage (" + savingJson.length + " bytes)");
					self.lastSaveJson = savingJson;
					self.trigger(cr.system_object.prototype.cnds.OnSaveComplete, null);
					self.lastSaveJson = "";
					if (continuous)
						doContinuousPreviewReload();
				}, function (e)
				{
					try {
						localStorage.setItem("__c2save_" + savingToSlot, savingJson);
						cr.logexport("Saved state to WebStorage (" + savingJson.length + " bytes)");
						self.lastSaveJson = savingJson;
						self.trigger(cr.system_object.prototype.cnds.OnSaveComplete, null);
						self.lastSaveJson = "";
						if (continuous)
							doContinuousPreviewReload();
					}
					catch (f)
					{
						cr.logexport("Failed to save game state: " + e + "; " + f);
					}
				});
			}
			else
			{
				try {
					localStorage.setItem("__c2save_" + savingToSlot, savingJson);
					cr.logexport("Saved state to WebStorage (" + savingJson.length + " bytes)");
					self.lastSaveJson = savingJson;
					this.trigger(cr.system_object.prototype.cnds.OnSaveComplete, null);
					self.lastSaveJson = "";
					if (continuous)
						doContinuousPreviewReload();
				}
				catch (e)
				{
					cr.logexport("Error saving to WebStorage: " + e);
				}
			}
			this.saveToSlot = "";
			this.loadFromSlot = "";
			this.loadFromJson = "";
		}
		if (loadingFromSlot.length)
		{
			if (window.indexedDB && !this.isCocoonJs)
			{
				IndexedDB_ReadSlot(loadingFromSlot, function (result_)
				{
					if (result_)
					{
						self.loadFromJson = result_;
						cr.logexport("Loaded state from IndexedDB storage (" + self.loadFromJson.length + " bytes)");
					}
					else
					{
						self.loadFromJson = localStorage.getItem("__c2save_" + loadingFromSlot) || "";
						cr.logexport("Loaded state from WebStorage (" + self.loadFromJson.length + " bytes)");
					}
					self.suspendDrawing = false;
					if (!self.loadFromJson.length)
						self.trigger(cr.system_object.prototype.cnds.OnLoadFailed, null);
				}, function (e)
				{
					self.loadFromJson = localStorage.getItem("__c2save_" + loadingFromSlot) || "";
					cr.logexport("Loaded state from WebStorage (" + self.loadFromJson.length + " bytes)");
					self.suspendDrawing = false;
					if (!self.loadFromJson.length)
						self.trigger(cr.system_object.prototype.cnds.OnLoadFailed, null);
				});
			}
			else
			{
				this.loadFromJson = localStorage.getItem("__c2save_" + loadingFromSlot) || "";
				cr.logexport("Loaded state from WebStorage (" + this.loadFromJson.length + " bytes)");
				this.suspendDrawing = false;
				if (!self.loadFromJson.length)
					self.trigger(cr.system_object.prototype.cnds.OnLoadFailed, null);
			}
			this.loadFromSlot = "";
			this.saveToSlot = "";
		}
		if (this.loadFromJson.length)
		{
			this.ClearDeathRow();
			this.loadFromJSONString(this.loadFromJson);
			this.lastSaveJson = this.loadFromJson;
			this.trigger(cr.system_object.prototype.cnds.OnLoadComplete, null);
			this.lastSaveJson = "";
			this.loadFromJson = "";
		}
	};
	function CopyExtraObject(extra)
	{
		var p, ret = {};
		for (p in extra)
		{
			if (extra.hasOwnProperty(p))
			{
				if (extra[p] instanceof cr.ObjectSet)
					continue;
				if (extra[p] && typeof extra[p].c2userdata !== "undefined")
					continue;
				ret[p] = extra[p];
			}
		}
		return ret;
	};
	Runtime.prototype.saveToJSONString = function()
	{
		var i, len, j, lenj, type, layout, typeobj, g, c, a, v, p;
		var o = {
			"c2save":				true,
			"version":				1,
			"rt": {
				"time":				this.kahanTime.sum,
				"timescale":		this.timescale,
				"tickcount":		this.tickcount,
				"execcount":		this.execcount,
				"next_uid":			this.next_uid,
				"running_layout":	this.running_layout.sid,
				"start_time_offset": (Date.now() - this.start_time)
			},
			"types": {},
			"layouts": {},
			"events": {
				"groups": {},
				"cnds": {},
				"acts": {},
				"vars": {}
			}
		};
		for (i = 0, len = this.types_by_index.length; i < len; i++)
		{
			type = this.types_by_index[i];
			if (type.is_family || this.typeHasNoSaveBehavior(type))
				continue;
			typeobj = {
				"instances": []
			};
			if (cr.hasAnyOwnProperty(type.extra))
				typeobj["ex"] = CopyExtraObject(type.extra);
			for (j = 0, lenj = type.instances.length; j < lenj; j++)
			{
				typeobj["instances"].push(this.saveInstanceToJSON(type.instances[j]));
			}
			o["types"][type.sid.toString()] = typeobj;
		}
		for (i = 0, len = this.layouts_by_index.length; i < len; i++)
		{
			layout = this.layouts_by_index[i];
			o["layouts"][layout.sid.toString()] = layout.saveToJSON();
		}
		var ogroups = o["events"]["groups"];
		for (i = 0, len = this.allGroups.length; i < len; i++)
		{
			g = this.allGroups[i];
			ogroups[g.sid.toString()] = !!this.activeGroups[g.group_name];
		}
		var ocnds = o["events"]["cnds"];
		for (p in this.cndsBySid)
		{
			if (this.cndsBySid.hasOwnProperty(p))
			{
				c = this.cndsBySid[p];
				if (cr.hasAnyOwnProperty(c.extra))
					ocnds[p] = { "ex": CopyExtraObject(c.extra) };
			}
		}
		var oacts = o["events"]["acts"];
		for (p in this.actsBySid)
		{
			if (this.actsBySid.hasOwnProperty(p))
			{
				a = this.actsBySid[p];
				if (cr.hasAnyOwnProperty(a.extra))
					oacts[p] = { "ex": a.extra };
			}
		}
		var ovars = o["events"]["vars"];
		for (p in this.varsBySid)
		{
			if (this.varsBySid.hasOwnProperty(p))
			{
				v = this.varsBySid[p];
				if (!v.is_constant && (!v.parent || v.is_static))
					ovars[p] = v.data;
			}
		}
		o["system"] = this.system.saveToJSON();
		return JSON.stringify(o);
	};
	Runtime.prototype.refreshUidMap = function ()
	{
		var i, len, type, j, lenj, inst;
		this.objectsByUid = {};
		for (i = 0, len = this.types_by_index.length; i < len; i++)
		{
			type = this.types_by_index[i];
			if (type.is_family)
				continue;
			for (j = 0, lenj = type.instances.length; j < lenj; j++)
			{
				inst = type.instances[j];
				this.objectsByUid[inst.uid.toString()] = inst;
			}
		}
	};
	Runtime.prototype.loadFromJSONString = function (str)
	{
		var o = JSON.parse(str);
		if (!o["c2save"])
			return;		// probably not a c2 save state
		if (o["version"] > 1)
			return;		// from future version of c2; assume not compatible
		var rt = o["rt"];
		this.kahanTime.reset();
		this.kahanTime.sum = rt["time"];
		this.timescale = rt["timescale"];
		this.tickcount = rt["tickcount"];
		this.start_time = Date.now() - rt["start_time_offset"];
		var layout_sid = rt["running_layout"];
		if (layout_sid !== this.running_layout.sid)
		{
			var changeToLayout = this.getLayoutBySid(layout_sid);
			if (changeToLayout)
				this.doChangeLayout(changeToLayout);
			else
				return;		// layout that was saved on has gone missing (deleted?)
		}
		this.isLoadingState = true;
		var i, len, j, lenj, k, lenk, p, type, existing_insts, load_insts, inst, binst, layout, layer, g, iid, t;
		var otypes = o["types"];
		for (p in otypes)
		{
			if (otypes.hasOwnProperty(p))
			{
				type = this.getObjectTypeBySid(parseInt(p, 10));
				if (!type || type.is_family || this.typeHasNoSaveBehavior(type))
					continue;
				if (otypes[p]["ex"])
					type.extra = otypes[p]["ex"];
				else
					cr.wipe(type.extra);
				existing_insts = type.instances;
				load_insts = otypes[p]["instances"];
				for (i = 0, len = cr.min(existing_insts.length, load_insts.length); i < len; i++)
				{
					this.loadInstanceFromJSON(existing_insts[i], load_insts[i]);
				}
				for (i = load_insts.length, len = existing_insts.length; i < len; i++)
					this.DestroyInstance(existing_insts[i]);
				for (i = existing_insts.length, len = load_insts.length; i < len; i++)
				{
					layer = null;
					if (type.plugin.is_world)
					{
						layer = this.running_layout.getLayerBySid(load_insts[i]["w"]["l"]);
						if (!layer)
							continue;
					}
					inst = this.createInstanceFromInit(type.default_instance, layer, false, 0, 0, true);
					this.loadInstanceFromJSON(inst, load_insts[i]);
				}
				type.stale_iids = true;
			}
		}
		this.ClearDeathRow();
		this.refreshUidMap();
		var olayouts = o["layouts"];
		for (p in olayouts)
		{
			if (olayouts.hasOwnProperty(p))
			{
				layout = this.getLayoutBySid(parseInt(p, 10));
				if (!layout)
					continue;		// must've gone missing
				layout.loadFromJSON(olayouts[p]);
			}
		}
		var ogroups = o["events"]["groups"];
		for (p in ogroups)
		{
			if (ogroups.hasOwnProperty(p))
			{
				g = this.getGroupBySid(parseInt(p, 10));
				if (g)
					this.activeGroups[g.group_name] = ogroups[p];
			}
		}
		var ocnds = o["events"]["cnds"];
		for (p in ocnds)
		{
			if (ocnds.hasOwnProperty(p) && this.cndsBySid.hasOwnProperty(p))
			{
				this.cndsBySid[p].extra = ocnds[p]["ex"];
			}
		}
		var oacts = o["events"]["acts"];
		for (p in oacts)
		{
			if (oacts.hasOwnProperty(p) && this.actsBySid.hasOwnProperty(p))
			{
				this.actsBySid[p].extra = oacts[p]["ex"];
			}
		}
		var ovars = o["events"]["vars"];
		for (p in ovars)
		{
			if (ovars.hasOwnProperty(p) && this.varsBySid.hasOwnProperty(p))
			{
				this.varsBySid[p].data = ovars[p];
			}
		}
		this.next_uid = rt["next_uid"];
		this.isLoadingState = false;
		this.system.loadFromJSON(o["system"]);
		for (i = 0, len = this.types_by_index.length; i < len; i++)
		{
			type = this.types_by_index[i];
			if (type.is_family)
				continue;
			for (j = 0, lenj = type.instances.length; j < lenj; j++)
			{
				inst = type.instances[j];
				if (type.is_contained)
				{
					iid = inst.get_iid();
					inst.siblings.length = 0;
					for (k = 0, lenk = type.container.length; k < lenk; k++)
					{
						t = type.container[k];
						if (type === t)
							continue;
;
						inst.siblings.push(t.instances[iid]);
					}
				}
				if (inst.afterLoad)
					inst.afterLoad();
				if (inst.behavior_insts)
				{
					for (k = 0, lenk = inst.behavior_insts.length; k < lenk; k++)
					{
						binst = inst.behavior_insts[k];
						if (binst.afterLoad)
							binst.afterLoad();
					}
				}
			}
		}
		this.redraw = true;
	};
	Runtime.prototype.saveInstanceToJSON = function(inst, state_only)
	{
		var i, len, world, behinst, et;
		var type = inst.type;
		var plugin = type.plugin;
		var o = {};
		if (state_only)
			o["c2"] = true;		// mark as known json data from 
		else
			o["uid"] = inst.uid;
		if (cr.hasAnyOwnProperty(inst.extra))
			o["ex"] = CopyExtraObject(inst.extra);
		if (inst.instance_vars && inst.instance_vars.length)
		{
			o["ivs"] = {};
			for (i = 0, len = inst.instance_vars.length; i < len; i++)
			{
				o["ivs"][inst.type.instvar_sids[i].toString()] = inst.instance_vars[i];
			}
		}
		if (plugin.is_world)
		{
			world = {
				"x": inst.x,
				"y": inst.y,
				"w": inst.width,
				"h": inst.height,
				"l": inst.layer.sid,
				"zi": inst.get_zindex()
			};
			if (inst.angle !== 0)
				world["a"] = inst.angle;
			if (inst.opacity !== 1)
				world["o"] = inst.opacity;
			if (inst.hotspotX !== 0.5)
				world["hX"] = inst.hotspotX;
			if (inst.hotspotY !== 0.5)
				world["hY"] = inst.hotspotY;
			if (inst.blend_mode !== 0)
				world["bm"] = inst.blend_mode;
			if (!inst.visible)
				world["v"] = inst.visible;
			if (!inst.collisionsEnabled)
				world["ce"] = inst.collisionsEnabled;
			if (inst.my_timescale !== -1)
				world["mts"] = inst.my_timescale;
			if (type.effect_types.length)
			{
				world["fx"] = [];
				for (i = 0, len = type.effect_types.length; i < len; i++)
				{
					et = type.effect_types[i];
					world["fx"].push({"name": et.name,
									  "active": inst.active_effect_flags[et.index],
									  "params": inst.effect_params[et.index] });
				}
			}
			o["w"] = world;
		}
		if (inst.behavior_insts && inst.behavior_insts.length)
		{
			o["behs"] = {};
			for (i = 0, len = inst.behavior_insts.length; i < len; i++)
			{
				behinst = inst.behavior_insts[i];
				if (behinst.saveToJSON)
					o["behs"][behinst.type.sid.toString()] = behinst.saveToJSON();
			}
		}
		if (inst.saveToJSON)
			o["data"] = inst.saveToJSON();
		return o;
	};
	Runtime.prototype.getInstanceVarIndexBySid = function (type, sid_)
	{
		var i, len;
		for (i = 0, len = type.instvar_sids.length; i < len; i++)
		{
			if (type.instvar_sids[i] === sid_)
				return i;
		}
		return -1;
	};
	Runtime.prototype.getBehaviorIndexBySid = function (inst, sid_)
	{
		var i, len;
		for (i = 0, len = inst.behavior_insts.length; i < len; i++)
		{
			if (inst.behavior_insts[i].type.sid === sid_)
				return i;
		}
		return -1;
	};
	Runtime.prototype.loadInstanceFromJSON = function(inst, o, state_only)
	{
		var p, i, len, iv, oivs, world, fxindex, obehs, behindex;
		var oldlayer;
		var type = inst.type;
		var plugin = type.plugin;
		if (state_only)
		{
			if (!o["c2"])
				return;
		}
		else
			inst.uid = o["uid"];
		if (o["ex"])
			inst.extra = o["ex"];
		else
			cr.wipe(inst.extra);
		oivs = o["ivs"];
		if (oivs)
		{
			for (p in oivs)
			{
				if (oivs.hasOwnProperty(p))
				{
					iv = this.getInstanceVarIndexBySid(type, parseInt(p, 10));
					if (iv < 0 || iv >= inst.instance_vars.length)
						continue;		// must've gone missing
					inst.instance_vars[iv] = oivs[p];
				}
			}
		}
		if (plugin.is_world)
		{
			world = o["w"];
			if (inst.layer.sid !== world["l"])
			{
				oldlayer = inst.layer;
				inst.layer = this.running_layout.getLayerBySid(world["l"]);
				if (inst.layer)
				{
					inst.layer.instances.push(inst);
					inst.layer.zindices_stale = true;
					cr.arrayFindRemove(oldlayer.instances, inst);
					oldlayer.zindices_stale = true;
				}
				else
				{
					inst.layer = oldlayer;
					this.DestroyInstance(inst);
				}
			}
			inst.x = world["x"];
			inst.y = world["y"];
			inst.width = world["w"];
			inst.height = world["h"];
			inst.zindex = world["zi"];
			inst.angle = world.hasOwnProperty("a") ? world["a"] : 0;
			inst.opacity = world.hasOwnProperty("o") ? world["o"] : 1;
			inst.hotspotX = world.hasOwnProperty("hX") ? world["hX"] : 0.5;
			inst.hotspotY = world.hasOwnProperty("hY") ? world["hY"] : 0.5;
			inst.visible = world.hasOwnProperty("v") ? world["v"] : true;
			inst.collisionsEnabled = world.hasOwnProperty("ce") ? world["ce"] : true;
			inst.my_timescale = world.hasOwnProperty("mts") ? world["mts"] : -1;
			inst.blend_mode = world.hasOwnProperty("bm") ? world["bm"] : 0;;
			inst.compositeOp = cr.effectToCompositeOp(inst.blend_mode);
			if (this.gl)
				cr.setGLBlend(inst, inst.blend_mode, this.gl);
			inst.set_bbox_changed();
			if (world.hasOwnProperty("fx"))
			{
				for (i = 0, len = world["fx"].length; i < len; i++)
				{
					fxindex = type.getEffectIndexByName(world["fx"][i]["name"]);
					if (fxindex < 0)
						continue;		// must've gone missing
					inst.active_effect_flags[fxindex] = world["fx"][i]["active"];
					inst.effect_params[fxindex] = world["fx"][i]["params"];
				}
			}
			inst.updateActiveEffects();
		}
		obehs = o["behs"];
		if (obehs)
		{
			for (p in obehs)
			{
				if (obehs.hasOwnProperty(p))
				{
					behindex = this.getBehaviorIndexBySid(inst, parseInt(p, 10));
					if (behindex < 0)
						continue;		// must've gone missing
					inst.behavior_insts[behindex].loadFromJSON(obehs[p]);
				}
			}
		}
		if (o["data"])
			inst.loadFromJSON(o["data"]);
	};
	cr.runtime = Runtime;
	cr.createRuntime = function (canvasid)
	{
		return new Runtime(document.getElementById(canvasid));
	};
	cr.createDCRuntime = function (w, h)
	{
		return new Runtime({ "dc": true, "width": w, "height": h });
	};
	window["cr_createRuntime"] = cr.createRuntime;
	window["cr_createDCRuntime"] = cr.createDCRuntime;
	window["createCocoonJSRuntime"] = function ()
	{
		window["c2cocoonjs"] = true;
		var canvas = document.createElement("screencanvas") || document.createElement("canvas");
		canvas.screencanvas = true;
		document.body.appendChild(canvas);
		var rt = new Runtime(canvas);
		window["c2runtime"] = rt;
		window.addEventListener("orientationchange", function () {
			window["c2runtime"]["setSize"](window.innerWidth, window.innerHeight);
		});
		window["c2runtime"]["setSize"](window.innerWidth, window.innerHeight);
		return rt;
	};
}());
window["cr_getC2Runtime"] = function()
{
	var canvas = document.getElementById("c2canvas");
	if (canvas)
		return canvas["c2runtime"];
	else if (window["c2runtime"])
		return window["c2runtime"];
	else
		return null;
}
window["cr_sizeCanvas"] = function(w, h)
{
	if (w === 0 || h === 0)
		return;
	var runtime = window["cr_getC2Runtime"]();
	if (runtime)
		runtime["setSize"](w, h);
}
window["cr_setSuspended"] = function(s)
{
	var runtime = window["cr_getC2Runtime"]();
	if (runtime)
		runtime["setSuspended"](s);
}
;
(function()
{
	function Layout(runtime, m)
	{
		this.runtime = runtime;
		this.event_sheet = null;
		this.scrollX = (this.runtime.original_width / 2);
		this.scrollY = (this.runtime.original_height / 2);
		this.scale = 1.0;
		this.angle = 0;
		this.first_visit = true;
		this.name = m[0];
		this.width = m[1];
		this.height = m[2];
		this.unbounded_scrolling = m[3];
		this.sheetname = m[4];
		this.sid = m[5];
		var lm = m[6];
		var i, len;
		this.layers = [];
		this.initial_types = [];
		for (i = 0, len = lm.length; i < len; i++)
		{
			var layer = new cr.layer(this, lm[i]);
			layer.number = i;
			cr.seal(layer);
			this.layers.push(layer);
		}
		var im = m[7];
		this.initial_nonworld = [];
		for (i = 0, len = im.length; i < len; i++)
		{
			var inst = im[i];
			var type = this.runtime.types_by_index[inst[1]];
;
			if (!type.default_instance)
				type.default_instance = inst;
			this.initial_nonworld.push(inst);
			if (this.initial_types.indexOf(type) === -1)
				this.initial_types.push(type);
		}
		this.effect_types = [];
		this.active_effect_types = [];
		this.effect_params = [];
		for (i = 0, len = m[8].length; i < len; i++)
		{
			this.effect_types.push({
				id: m[8][i][0],
				name: m[8][i][1],
				shaderindex: -1,
				active: true,
				index: i
			});
			this.effect_params.push(m[8][i][2].slice(0));
		}
		this.updateActiveEffects();
		this.rcTex = new cr.rect(0, 0, 1, 1);
		this.rcTex2 = new cr.rect(0, 0, 1, 1);
		this.persist_data = {};
	};
	Layout.prototype.saveObjectToPersist = function (inst)
	{
		var sidStr = inst.type.sid.toString();
		if (!this.persist_data.hasOwnProperty(sidStr))
			this.persist_data[sidStr] = [];
		var type_persist = this.persist_data[sidStr];
		type_persist.push(this.runtime.saveInstanceToJSON(inst));
	};
	Layout.prototype.hasOpaqueBottomLayer = function ()
	{
		var layer = this.layers[0];
		return !layer.transparent && layer.opacity === 1.0 && !layer.forceOwnTexture && layer.visible;
	};
	Layout.prototype.updateActiveEffects = function ()
	{
		this.active_effect_types.length = 0;
		var i, len, et;
		for (i = 0, len = this.effect_types.length; i < len; i++)
		{
			et = this.effect_types[i];
			if (et.active)
				this.active_effect_types.push(et);
		}
	};
	Layout.prototype.getEffectByName = function (name_)
	{
		var i, len, et;
		for (i = 0, len = this.effect_types.length; i < len; i++)
		{
			et = this.effect_types[i];
			if (et.name === name_)
				return et;
		}
		return null;
	};
	var created_instances = [];
	Layout.prototype.startRunning = function ()
	{
		if (this.sheetname)
		{
			this.event_sheet = this.runtime.eventsheets[this.sheetname];
;
		}
		this.runtime.running_layout = this;
		this.scrollX = (this.runtime.original_width / 2);
		this.scrollY = (this.runtime.original_height / 2);
		var i, k, len, lenk, type, type_instances, inst, iid, t, s, p, q, type_data, layer;
		for (i = 0, len = this.runtime.types_by_index.length; i < len; i++)
		{
			type = this.runtime.types_by_index[i];
			if (type.is_family)
				continue;		// instances are only transferred for their real type
			type_instances = type.instances;
			for (k = 0, lenk = type_instances.length; k < lenk; k++)
			{
				inst = type_instances[k];
				if (inst.layer)
				{
					var num = inst.layer.number;
					if (num >= this.layers.length)
						num = this.layers.length - 1;
					inst.layer = this.layers[num];
					inst.layer.instances.push(inst);
					inst.layer.zindices_stale = true;
				}
			}
		}
		var layer;
		created_instances.length = 0;
		this.boundScrolling();
		for (i = 0, len = this.layers.length; i < len; i++)
		{
			layer = this.layers[i];
			layer.createInitialInstances();		// fills created_instances
			layer.disableAngle = true;
			var px = layer.canvasToLayer(0, 0, true, true);
			var py = layer.canvasToLayer(0, 0, false, true);
			layer.disableAngle = false;
			if (this.runtime.pixel_rounding)
			{
				px = (px + 0.5) | 0;
				py = (py + 0.5) | 0;
			}
			layer.rotateViewport(px, py, null);
		}
		var uids_changed = false;
		if (!this.first_visit)
		{
			for (p in this.persist_data)
			{
				if (this.persist_data.hasOwnProperty(p))
				{
					type = this.runtime.getObjectTypeBySid(parseInt(p, 10));
					if (!type || type.is_family || !this.runtime.typeHasPersistBehavior(type))
						continue;
					type_data = this.persist_data[p];
					for (i = 0, len = type_data.length; i < len; i++)
					{
						layer = null;
						if (type.plugin.is_world)
						{
							layer = this.getLayerBySid(type_data[i]["w"]["l"]);
							if (!layer)
								continue;
						}
						inst = this.runtime.createInstanceFromInit(type.default_instance, layer, false, 0, 0, true);
						this.runtime.loadInstanceFromJSON(inst, type_data[i]);
						uids_changed = true;
						created_instances.push(inst);
					}
					type_data.length = 0;
				}
			}
			for (i = 0, len = this.layers.length; i < len; i++)
			{
				this.layers[i].instances.sort(sortInstanceByZIndex);
				this.layers[i].zindices_stale = true;		// in case of duplicates/holes
			}
		}
		if (uids_changed)
		{
			this.runtime.ClearDeathRow();
			this.runtime.refreshUidMap();
		}
		for (i = 0; i < created_instances.length; i++)
		{
			inst = created_instances[i];
			if (!inst.type.is_contained)
				continue;
			iid = inst.get_iid();
			for (k = 0, lenk = inst.type.container.length; k < lenk; k++)
			{
				t = inst.type.container[k];
				if (inst.type === t)
					continue;
				if (t.instances.length > iid)
					inst.siblings.push(t.instances[iid]);
				else
				{
					if (!t.default_instance)
					{
					}
					else
					{
						s = this.runtime.createInstanceFromInit(t.default_instance, inst.layer, true, inst.x, inst.y, true);
						this.runtime.ClearDeathRow();
						t.updateIIDs();
						inst.siblings.push(s);
						created_instances.push(s);		// come back around and link up its own instances too
					}
				}
			}
		}
		for (i = 0, len = this.initial_nonworld.length; i < len; i++)
		{
			inst = this.runtime.createInstanceFromInit(this.initial_nonworld[i], null, true);
;
		}
		this.runtime.changelayout = null;
		this.runtime.ClearDeathRow();
		if (this.runtime.ctx && !this.runtime.isDomFree)
		{
			for (i = 0, len = this.runtime.types_by_index.length; i < len; i++)
			{
				t = this.runtime.types_by_index[i];
				if (t.is_family || !t.instances.length || !t.preloadCanvas2D)
					continue;
				t.preloadCanvas2D(this.runtime.ctx);
			}
		}
		/*
		if (this.runtime.glwrap)
		{
			console.log("Estimated VRAM at layout start: " + this.runtime.glwrap.textureCount() + " textures, approx. " + Math.round(this.runtime.glwrap.estimateVRAM() / 1024) + " kb");
		}
		*/
		for (i = 0, len = created_instances.length; i < len; i++)
		{
			inst = created_instances[i];
			this.runtime.trigger(Object.getPrototypeOf(inst.type.plugin).cnds.OnCreated, inst);
		}
		created_instances.length = 0;
		this.runtime.trigger(cr.system_object.prototype.cnds.OnLayoutStart, null);
		this.first_visit = false;
	};
	Layout.prototype.createGlobalNonWorlds = function ()
	{
		var i, k, len, initial_inst, inst, type;
		for (i = 0, k = 0, len = this.initial_nonworld.length; i < len; i++)
		{
			initial_inst = this.initial_nonworld[i];
			type = this.runtime.types_by_index[initial_inst[1]];
			if (type.global)
				inst = this.runtime.createInstanceFromInit(initial_inst, null, true);
			else
			{
				this.initial_nonworld[k] = initial_inst;
				k++;
			}
		}
		this.initial_nonworld.length = k;
	};
	Layout.prototype.stopRunning = function ()
	{
;
		/*
		if (this.runtime.glwrap)
		{
			console.log("Estimated VRAM at layout end: " + this.runtime.glwrap.textureCount() + " textures, approx. " + Math.round(this.runtime.glwrap.estimateVRAM() / 1024) + " kb");
		}
		*/
		this.runtime.trigger(cr.system_object.prototype.cnds.OnLayoutEnd, null);
		this.runtime.system.waits.length = 0;
		var i, leni, j, lenj;
		var layer_instances, inst, type;
		for (i = 0, leni = this.layers.length; i < leni; i++)
		{
			layer_instances = this.layers[i].instances;
			for (j = 0, lenj = layer_instances.length; j < lenj; j++)
			{
				inst = layer_instances[j];
				if (!inst.type.global)
				{
					if (this.runtime.typeHasPersistBehavior(inst.type))
						this.saveObjectToPersist(inst);
					this.runtime.DestroyInstance(inst);
				}
			}
			this.runtime.ClearDeathRow();
			layer_instances.length = 0;
			this.layers[i].zindices_stale = true;
		}
		for (i = 0, leni = this.runtime.types_by_index.length; i < leni; i++)
		{
			type = this.runtime.types_by_index[i];
			if (type.global || type.plugin.is_world || type.plugin.singleglobal || type.is_family)
				continue;
			for (j = 0, lenj = type.instances.length; j < lenj; j++)
				this.runtime.DestroyInstance(type.instances[j]);
			this.runtime.ClearDeathRow();
		}
	};
	Layout.prototype.draw = function (ctx)
	{
		var layout_canvas;
		var layout_ctx = ctx;
		var ctx_changed = false;
		var render_offscreen = !this.runtime.fullscreenScalingQuality;
		if (render_offscreen)
		{
			if (!this.runtime.layout_canvas)
			{
				this.runtime.layout_canvas = document.createElement("canvas");
				layout_canvas = this.runtime.layout_canvas;
				layout_canvas.width = this.runtime.draw_width;
				layout_canvas.height = this.runtime.draw_height;
				this.runtime.layout_ctx = layout_canvas.getContext("2d");
				ctx_changed = true;
			}
			layout_canvas = this.runtime.layout_canvas;
			layout_ctx = this.runtime.layout_ctx;
			if (layout_canvas.width !== this.runtime.draw_width)
			{
				layout_canvas.width = this.runtime.draw_width;
				ctx_changed = true;
			}
			if (layout_canvas.height !== this.runtime.draw_height)
			{
				layout_canvas.height = this.runtime.draw_height;
				ctx_changed = true;
			}
			if (ctx_changed)
			{
				layout_ctx["webkitImageSmoothingEnabled"] = this.runtime.linearSampling;
				layout_ctx["mozImageSmoothingEnabled"] = this.runtime.linearSampling;
				layout_ctx["msImageSmoothingEnabled"] = this.runtime.linearSampling;
				layout_ctx["imageSmoothingEnabled"] = this.runtime.linearSampling;
			}
		}
		layout_ctx.globalAlpha = 1;
		layout_ctx.globalCompositeOperation = "source-over";
		if (this.runtime.alphaBackground && !this.hasOpaqueBottomLayer())
			layout_ctx.clearRect(0, 0, this.runtime.draw_width, this.runtime.draw_height);
		var i, len, l;
		for (i = 0, len = this.layers.length; i < len; i++)
		{
			l = this.layers[i];
			if (l.visible && l.opacity > 0 && l.blend_mode !== 11)
				l.draw(layout_ctx);
		}
		if (render_offscreen)
		{
			ctx.drawImage(layout_canvas, 0, 0, this.runtime.width, this.runtime.height);
		}
	};
	Layout.prototype.drawGL = function (glw)
	{
		var render_to_texture = (this.active_effect_types.length > 0 ||
								 this.runtime.uses_background_blending ||
								 !this.runtime.fullscreenScalingQuality);
		if (render_to_texture)
		{
			if (!this.runtime.layout_tex)
			{
				this.runtime.layout_tex = glw.createEmptyTexture(this.runtime.draw_width, this.runtime.draw_height, this.runtime.linearSampling);
			}
			if (this.runtime.layout_tex.c2width !== this.runtime.draw_width || this.runtime.layout_tex.c2height !== this.runtime.draw_height)
			{
				glw.deleteTexture(this.runtime.layout_tex);
				this.runtime.layout_tex = glw.createEmptyTexture(this.runtime.draw_width, this.runtime.draw_height, this.runtime.linearSampling);
			}
			glw.setRenderingToTexture(this.runtime.layout_tex);
			if (!this.runtime.fullscreenScalingQuality)
			{
				glw.setSize(this.runtime.draw_width, this.runtime.draw_height);
			}
		}
		else
		{
			if (this.runtime.layout_tex)
			{
				glw.setRenderingToTexture(null);
				glw.deleteTexture(this.runtime.layout_tex);
				this.runtime.layout_tex = null;
			}
		}
		if (this.runtime.alphaBackground && !this.hasOpaqueBottomLayer())
			glw.clear(0, 0, 0, 0);
		var i, len;
		for (i = 0, len = this.layers.length; i < len; i++)
		{
			if (this.layers[i].visible && this.layers[i].opacity > 0)
				this.layers[i].drawGL(glw);
		}
		if (render_to_texture)
		{
			if (this.active_effect_types.length === 0 ||
				(this.active_effect_types.length === 1 && this.runtime.fullscreenScalingQuality))
			{
				if (this.active_effect_types.length === 1)
				{
					var etindex = this.active_effect_types[0].index;
					glw.switchProgram(this.active_effect_types[0].shaderindex);
					glw.setProgramParameters(null,								// backTex
											 1.0 / this.runtime.draw_width,		// pixelWidth
											 1.0 / this.runtime.draw_height,	// pixelHeight
											 0.0, 0.0,							// destStart
											 1.0, 1.0,							// destEnd
											 this.scale,						// layerScale
											 this.angle,						// layerAngle
											 0.0, 0.0,							// viewOrigin
											 this.effect_params[etindex]);		// fx parameters
					if (glw.programIsAnimated(this.active_effect_types[0].shaderindex))
						this.runtime.redraw = true;
				}
				else
					glw.switchProgram(0);
				if (!this.runtime.fullscreenScalingQuality)
				{
					glw.setSize(this.runtime.width, this.runtime.height);
				}
				glw.setRenderingToTexture(null);				// to backbuffer
				glw.setOpacity(1);
				glw.setTexture(this.runtime.layout_tex);
				glw.setAlphaBlend();
				glw.resetModelView();
				glw.updateModelView();
				var halfw = this.runtime.width / 2;
				var halfh = this.runtime.height / 2;
				glw.quad(-halfw, halfh, halfw, halfh, halfw, -halfh, -halfw, -halfh);
				glw.setTexture(null);
			}
			else
			{
				this.renderEffectChain(glw, null, null, null);
			}
		}
	};
	Layout.prototype.getRenderTarget = function()
	{
		return (this.active_effect_types.length > 0 ||
				this.runtime.uses_background_blending ||
				!this.runtime.fullscreenScalingQuality) ? this.runtime.layout_tex : null;
	};
	Layout.prototype.getMinLayerScale = function ()
	{
		var m = this.layers[0].getScale();
		var i, len, l;
		for (i = 1, len = this.layers.length; i < len; i++)
		{
			l = this.layers[i];
			if (l.parallaxX === 0 && l.parallaxY === 0)
				continue;
			if (l.getScale() < m)
				m = l.getScale();
		}
		return m;
	};
	Layout.prototype.scrollToX = function (x)
	{
		if (!this.unbounded_scrolling)
		{
			var widthBoundary = (this.runtime.draw_width * (1 / this.getMinLayerScale()) / 2);
			if (x > this.width - widthBoundary)
				x = this.width - widthBoundary;
			if (x < widthBoundary)
				x = widthBoundary;
		}
		if (this.scrollX !== x)
		{
			this.scrollX = x;
			this.runtime.redraw = true;
		}
	};
	Layout.prototype.scrollToY = function (y)
	{
		if (!this.unbounded_scrolling)
		{
			var heightBoundary = (this.runtime.draw_height * (1 / this.getMinLayerScale()) / 2);
			if (y > this.height - heightBoundary)
				y = this.height - heightBoundary;
			if (y < heightBoundary)
				y = heightBoundary;
		}
		if (this.scrollY !== y)
		{
			this.scrollY = y;
			this.runtime.redraw = true;
		}
	};
	Layout.prototype.boundScrolling = function ()
	{
		this.scrollToX(this.scrollX);
		this.scrollToY(this.scrollY);
	};
	Layout.prototype.renderEffectChain = function (glw, layer, inst, rendertarget)
	{
		var active_effect_types = inst ?
							inst.active_effect_types :
							layer ?
								layer.active_effect_types :
								this.active_effect_types;
		var layerScale = 1, layerAngle = 0, viewOriginLeft = 0, viewOriginTop = 0;
		if (inst)
		{
			layerScale = inst.layer.getScale();
			layerAngle = inst.layer.getAngle();
			viewOriginLeft = inst.layer.viewLeft;
			viewOriginTop = inst.layer.viewTop;
		}
		else if (layer)
		{
			layerScale = layer.getScale();
			layerAngle = layer.getAngle();
			viewOriginLeft = layer.viewLeft;
			viewOriginTop = layer.viewTop;
		}
		var fx_tex = this.runtime.fx_tex;
		var i, len, last, temp, fx_index = 0, other_fx_index = 1;
		var y, h;
		var windowWidth = this.runtime.draw_width;
		var windowHeight = this.runtime.draw_height;
		var halfw = windowWidth / 2;
		var halfh = windowHeight / 2;
		var rcTex = layer ? layer.rcTex : this.rcTex;
		var rcTex2 = layer ? layer.rcTex2 : this.rcTex2;
		var screenleft = 0, clearleft = 0;
		var screentop = 0, cleartop = 0;
		var screenright = windowWidth, clearright = windowWidth;
		var screenbottom = windowHeight, clearbottom = windowHeight;
		var boxExtendHorizontal = 0;
		var boxExtendVertical = 0;
		var inst_layer_angle = inst ? inst.layer.getAngle() : 0;
		if (inst)
		{
			for (i = 0, len = active_effect_types.length; i < len; i++)
			{
				boxExtendHorizontal += glw.getProgramBoxExtendHorizontal(active_effect_types[i].shaderindex);
				boxExtendVertical += glw.getProgramBoxExtendVertical(active_effect_types[i].shaderindex);
			}
			var bbox = inst.bbox;
			screenleft = layer.layerToCanvas(bbox.left, bbox.top, true, true);
			screentop = layer.layerToCanvas(bbox.left, bbox.top, false, true);
			screenright = layer.layerToCanvas(bbox.right, bbox.bottom, true, true);
			screenbottom = layer.layerToCanvas(bbox.right, bbox.bottom, false, true);
			if (inst_layer_angle !== 0)
			{
				var screentrx = layer.layerToCanvas(bbox.right, bbox.top, true, true);
				var screentry = layer.layerToCanvas(bbox.right, bbox.top, false, true);
				var screenblx = layer.layerToCanvas(bbox.left, bbox.bottom, true, true);
				var screenbly = layer.layerToCanvas(bbox.left, bbox.bottom, false, true);
				temp = Math.min(screenleft, screenright, screentrx, screenblx);
				screenright = Math.max(screenleft, screenright, screentrx, screenblx);
				screenleft = temp;
				temp = Math.min(screentop, screenbottom, screentry, screenbly);
				screenbottom = Math.max(screentop, screenbottom, screentry, screenbly);
				screentop = temp;
			}
			screenleft -= boxExtendHorizontal;
			screentop -= boxExtendVertical;
			screenright += boxExtendHorizontal;
			screenbottom += boxExtendVertical;
			rcTex2.left = screenleft / windowWidth;
			rcTex2.top = 1 - screentop / windowHeight;
			rcTex2.right = screenright / windowWidth;
			rcTex2.bottom = 1 - screenbottom / windowHeight;
			clearleft = screenleft = cr.floor(screenleft);
			cleartop = screentop = cr.floor(screentop);
			clearright = screenright = cr.ceil(screenright);
			clearbottom = screenbottom = cr.ceil(screenbottom);
			clearleft -= boxExtendHorizontal;
			cleartop -= boxExtendVertical;
			clearright += boxExtendHorizontal;
			clearbottom += boxExtendVertical;
			if (screenleft < 0)					screenleft = 0;
			if (screentop < 0)					screentop = 0;
			if (screenright > windowWidth)		screenright = windowWidth;
			if (screenbottom > windowHeight)	screenbottom = windowHeight;
			if (clearleft < 0)					clearleft = 0;
			if (cleartop < 0)					cleartop = 0;
			if (clearright > windowWidth)		clearright = windowWidth;
			if (clearbottom > windowHeight)		clearbottom = windowHeight;
			rcTex.left = screenleft / windowWidth;
			rcTex.top = 1 - screentop / windowHeight;
			rcTex.right = screenright / windowWidth;
			rcTex.bottom = 1 - screenbottom / windowHeight;
		}
		else
		{
			rcTex.left = rcTex2.left = 0;
			rcTex.top = rcTex2.top = 0;
			rcTex.right = rcTex2.right = 1;
			rcTex.bottom = rcTex2.bottom = 1;
		}
		var pre_draw = (inst && (((inst.angle || inst_layer_angle) && glw.programUsesDest(active_effect_types[0].shaderindex)) || boxExtendHorizontal !== 0 || boxExtendVertical !== 0 || inst.opacity !== 1 || inst.type.plugin.must_predraw)) || (layer && !inst && layer.opacity !== 1);
		glw.setAlphaBlend();
		if (pre_draw)
		{
			if (!fx_tex[fx_index])
			{
				fx_tex[fx_index] = glw.createEmptyTexture(windowWidth, windowHeight, this.runtime.linearSampling);
			}
			if (fx_tex[fx_index].c2width !== windowWidth || fx_tex[fx_index].c2height !== windowHeight)
			{
				glw.deleteTexture(fx_tex[fx_index]);
				fx_tex[fx_index] = glw.createEmptyTexture(windowWidth, windowHeight, this.runtime.linearSampling);
			}
			glw.switchProgram(0);
			glw.setRenderingToTexture(fx_tex[fx_index]);
			h = clearbottom - cleartop;
			y = (windowHeight - cleartop) - h;
			glw.clearRect(clearleft, y, clearright - clearleft, h);
			if (inst)
			{
				inst.drawGL(glw);
			}
			else
			{
				glw.setTexture(this.runtime.layer_tex);
				glw.setOpacity(layer.opacity);
				glw.resetModelView();
				glw.translate(-halfw, -halfh);
				glw.updateModelView();
				glw.quadTex(screenleft, screenbottom, screenright, screenbottom, screenright, screentop, screenleft, screentop, rcTex);
			}
			rcTex2.left = rcTex2.top = 0;
			rcTex2.right = rcTex2.bottom = 1;
			if (inst)
			{
				temp = rcTex.top;
				rcTex.top = rcTex.bottom;
				rcTex.bottom = temp;
			}
			fx_index = 1;
			other_fx_index = 0;
		}
		glw.setOpacity(1);
		var last = active_effect_types.length - 1;
		var post_draw = glw.programUsesCrossSampling(active_effect_types[last].shaderindex) ||
						(!layer && !inst && !this.runtime.fullscreenScalingQuality);
		var etindex = 0;
		for (i = 0, len = active_effect_types.length; i < len; i++)
		{
			if (!fx_tex[fx_index])
			{
				fx_tex[fx_index] = glw.createEmptyTexture(windowWidth, windowHeight, this.runtime.linearSampling);
			}
			if (fx_tex[fx_index].c2width !== windowWidth || fx_tex[fx_index].c2height !== windowHeight)
			{
				glw.deleteTexture(fx_tex[fx_index]);
				fx_tex[fx_index] = glw.createEmptyTexture(windowWidth, windowHeight, this.runtime.linearSampling);
			}
			glw.switchProgram(active_effect_types[i].shaderindex);
			etindex = active_effect_types[i].index;
			if (glw.programIsAnimated(active_effect_types[i].shaderindex))
				this.runtime.redraw = true;
			if (i == 0 && !pre_draw)
			{
				glw.setRenderingToTexture(fx_tex[fx_index]);
				h = clearbottom - cleartop;
				y = (windowHeight - cleartop) - h;
				glw.clearRect(clearleft, y, clearright - clearleft, h);
				if (inst)
				{
					glw.setProgramParameters(rendertarget,					// backTex
											 1.0 / inst.width,				// pixelWidth
											 1.0 / inst.height,				// pixelHeight
											 rcTex2.left, rcTex2.top,		// destStart
											 rcTex2.right, rcTex2.bottom,	// destEnd
											 layerScale,
											 layerAngle,
											 viewOriginLeft, viewOriginTop,
											 inst.effect_params[etindex]);	// fx params
					inst.drawGL(glw);
				}
				else
				{
					glw.setProgramParameters(rendertarget,					// backTex
											 1.0 / windowWidth,				// pixelWidth
											 1.0 / windowHeight,			// pixelHeight
											 0.0, 0.0,						// destStart
											 1.0, 1.0,						// destEnd
											 layerScale,
											 layerAngle,
											 viewOriginLeft, viewOriginTop,
											 layer ?						// fx params
												layer.effect_params[etindex] :
												this.effect_params[etindex]);
					glw.setTexture(layer ? this.runtime.layer_tex : this.runtime.layout_tex);
					glw.resetModelView();
					glw.translate(-halfw, -halfh);
					glw.updateModelView();
					glw.quadTex(screenleft, screenbottom, screenright, screenbottom, screenright, screentop, screenleft, screentop, rcTex);
				}
				rcTex2.left = rcTex2.top = 0;
				rcTex2.right = rcTex2.bottom = 1;
				if (inst && !post_draw)
				{
					temp = screenbottom;
					screenbottom = screentop;
					screentop = temp;
				}
			}
			else
			{
				glw.setProgramParameters(rendertarget,						// backTex
										 1.0 / windowWidth,					// pixelWidth
										 1.0 / windowHeight,				// pixelHeight
										 rcTex2.left, rcTex2.top,			// destStart
										 rcTex2.right, rcTex2.bottom,		// destEnd
										 layerScale,
										 layerAngle,
										 viewOriginLeft, viewOriginTop,
										 inst ?								// fx params
											inst.effect_params[etindex] :
											layer ?
												layer.effect_params[etindex] :
												this.effect_params[etindex]);
				glw.setTexture(null);
				if (i === last && !post_draw)
				{
					if (inst)
						glw.setBlend(inst.srcBlend, inst.destBlend);
					else if (layer)
						glw.setBlend(layer.srcBlend, layer.destBlend);
					glw.setRenderingToTexture(rendertarget);
				}
				else
				{
					glw.setRenderingToTexture(fx_tex[fx_index]);
					h = clearbottom - cleartop;
					y = (windowHeight - cleartop) - h;
					glw.clearRect(clearleft, y, clearright - clearleft, h);
				}
				glw.setTexture(fx_tex[other_fx_index]);
				glw.resetModelView();
				glw.translate(-halfw, -halfh);
				glw.updateModelView();
				glw.quadTex(screenleft, screenbottom, screenright, screenbottom, screenright, screentop, screenleft, screentop, rcTex);
				if (i === last && !post_draw)
					glw.setTexture(null);
			}
			fx_index = (fx_index === 0 ? 1 : 0);
			other_fx_index = (fx_index === 0 ? 1 : 0);		// will be opposite to fx_index since it was just assigned
		}
		if (post_draw)
		{
			glw.switchProgram(0);
			if (inst)
				glw.setBlend(inst.srcBlend, inst.destBlend);
			else if (layer)
				glw.setBlend(layer.srcBlend, layer.destBlend);
			else
			{
				if (!this.runtime.fullscreenScalingQuality)
				{
					glw.setSize(this.runtime.width, this.runtime.height);
					halfw = this.runtime.width / 2;
					halfh = this.runtime.height / 2;
					screenleft = 0;
					screentop = 0;
					screenright = this.runtime.width;
					screenbottom = this.runtime.height;
				}
			}
			glw.setRenderingToTexture(rendertarget);
			glw.setTexture(fx_tex[other_fx_index]);
			glw.resetModelView();
			glw.translate(-halfw, -halfh);
			glw.updateModelView();
			if (inst && active_effect_types.length === 1 && !pre_draw)
				glw.quadTex(screenleft, screentop, screenright, screentop, screenright, screenbottom, screenleft, screenbottom, rcTex);
			else
				glw.quadTex(screenleft, screenbottom, screenright, screenbottom, screenright, screentop, screenleft, screentop, rcTex);
			glw.setTexture(null);
		}
	};
	Layout.prototype.getLayerBySid = function (sid_)
	{
		var i, len;
		for (i = 0, len = this.layers.length; i < len; i++)
		{
			if (this.layers[i].sid === sid_)
				return this.layers[i];
		}
		return null;
	};
	Layout.prototype.saveToJSON = function ()
	{
		var i, len, layer, et;
		var o = {
			"sx": this.scrollX,
			"sy": this.scrollY,
			"s": this.scale,
			"a": this.angle,
			"w": this.width,
			"h": this.height,
			"fv": this.first_visit,			// added r127
			"persist": this.persist_data,
			"fx": [],
			"layers": {}
		};
		for (i = 0, len = this.effect_types.length; i < len; i++)
		{
			et = this.effect_types[i];
			o["fx"].push({"name": et.name, "active": et.active, "params": this.effect_params[et.index] });
		}
		for (i = 0, len = this.layers.length; i < len; i++)
		{
			layer = this.layers[i];
			o["layers"][layer.sid.toString()] = layer.saveToJSON();
		}
		return o;
	};
	Layout.prototype.loadFromJSON = function (o)
	{
		var i, len, fx, p, layer;
		this.scrollX = o["sx"];
		this.scrollY = o["sy"];
		this.scale = o["s"];
		this.angle = o["a"];
		this.width = o["w"];
		this.height = o["h"];
		this.persist_data = o["persist"];
		if (typeof o["fv"] !== "undefined")
			this.first_visit = o["fv"];
		var ofx = o["fx"];
		for (i = 0, len = ofx.length; i < len; i++)
		{
			fx = this.getEffectByName(ofx[i]["name"]);
			if (!fx)
				continue;		// must've gone missing
			fx.active = ofx[i]["active"];
			this.effect_params[fx.index] = ofx[i]["params"];
		}
		this.updateActiveEffects();
		var olayers = o["layers"];
		for (p in olayers)
		{
			if (olayers.hasOwnProperty(p))
			{
				layer = this.getLayerBySid(parseInt(p, 10));
				if (!layer)
					continue;		// must've gone missing
				layer.loadFromJSON(olayers[p]);
			}
		}
	};
	cr.layout = Layout;
	function Layer(layout, m)
	{
		this.layout = layout;
		this.runtime = layout.runtime;
		this.instances = [];        // running instances
		this.scale = 1.0;
		this.angle = 0;
		this.disableAngle = false;
		this.tmprect = new cr.rect(0, 0, 0, 0);
		this.tmpquad = new cr.quad();
		this.viewLeft = 0;
		this.viewRight = 0;
		this.viewTop = 0;
		this.viewBottom = 0;
		this.zindices_stale = false;
		this.name = m[0];
		this.index = m[1];
		this.sid = m[2];
		this.visible = m[3];		// initially visible
		this.background_color = m[4];
		this.transparent = m[5];
		this.parallaxX = m[6];
		this.parallaxY = m[7];
		this.opacity = m[8];
		this.forceOwnTexture = m[9];
		this.zoomRate = m[10];
		this.blend_mode = m[11];
		this.effect_fallback = m[12];
		this.compositeOp = "source-over";
		this.srcBlend = 0;
		this.destBlend = 0;
		this.render_offscreen = false;
		var im = m[13];
		var i, len;
		this.initial_instances = [];
		for (i = 0, len = im.length; i < len; i++)
		{
			var inst = im[i];
			var type = this.runtime.types_by_index[inst[1]];
;
			if (!type.default_instance)
			{
				type.default_instance = inst;
				type.default_layerindex = this.index;
			}
			this.initial_instances.push(inst);
			if (this.layout.initial_types.indexOf(type) === -1)
				this.layout.initial_types.push(type);
		}
		this.effect_types = [];
		this.active_effect_types = [];
		this.effect_params = [];
		for (i = 0, len = m[14].length; i < len; i++)
		{
			this.effect_types.push({
				id: m[14][i][0],
				name: m[14][i][1],
				shaderindex: -1,
				active: true,
				index: i
			});
			this.effect_params.push(m[14][i][2].slice(0));
		}
		this.updateActiveEffects();
		this.rcTex = new cr.rect(0, 0, 1, 1);
		this.rcTex2 = new cr.rect(0, 0, 1, 1);
	};
	Layer.prototype.updateActiveEffects = function ()
	{
		this.active_effect_types.length = 0;
		var i, len, et;
		for (i = 0, len = this.effect_types.length; i < len; i++)
		{
			et = this.effect_types[i];
			if (et.active)
				this.active_effect_types.push(et);
		}
	};
	Layer.prototype.getEffectByName = function (name_)
	{
		var i, len, et;
		for (i = 0, len = this.effect_types.length; i < len; i++)
		{
			et = this.effect_types[i];
			if (et.name === name_)
				return et;
		}
		return null;
	};
	Layer.prototype.createInitialInstances = function ()
	{
		var i, k, len, inst, initial_inst, type, keep, hasPersistBehavior;
		for (i = 0, k = 0, len = this.initial_instances.length; i < len; i++)
		{
			initial_inst = this.initial_instances[i];
			type = this.runtime.types_by_index[initial_inst[1]];
;
			hasPersistBehavior = this.runtime.typeHasPersistBehavior(type);
			keep = true;
			if (!hasPersistBehavior || this.layout.first_visit)
			{
				inst = this.runtime.createInstanceFromInit(initial_inst, this, true);
;
				created_instances.push(inst);
				if (inst.type.global)
					keep = false;
			}
			if (keep)
			{
				this.initial_instances[k] = this.initial_instances[i];
				k++;
			}
		}
		this.initial_instances.length = k;
		this.runtime.ClearDeathRow();		// flushes creation row so IIDs will be correct
		if (!this.runtime.glwrap && this.effect_types.length)	// no WebGL renderer and shaders used
			this.blend_mode = this.effect_fallback;				// use fallback blend mode
		this.compositeOp = cr.effectToCompositeOp(this.blend_mode);
		if (this.runtime.gl)
			cr.setGLBlend(this, this.blend_mode, this.runtime.gl);
	};
	Layer.prototype.updateZIndices = function ()
	{
		if (!this.zindices_stale)
			return;
		var i, len;
		for (i = 0, len = this.instances.length; i < len; i++)
		{
;
;
			this.instances[i].zindex = i;
		}
		this.zindices_stale = false;
	};
	Layer.prototype.getScale = function (include_aspect)
	{
		return this.getNormalScale() * (this.runtime.fullscreenScalingQuality || include_aspect ? this.runtime.aspect_scale : 1);
	};
	Layer.prototype.getNormalScale = function ()
	{
		return ((this.scale * this.layout.scale) - 1) * this.zoomRate + 1;
	};
	Layer.prototype.getAngle = function ()
	{
		if (this.disableAngle)
			return 0;
		return cr.clamp_angle(this.layout.angle + this.angle);
	};
	Layer.prototype.draw = function (ctx)
	{
		this.render_offscreen = (this.forceOwnTexture || this.opacity !== 1.0 || this.blend_mode !== 0);
		var layer_canvas = this.runtime.canvas;
		var layer_ctx = ctx;
		var ctx_changed = false;
		ctx.globalAlpha = 1;
		ctx.globalCompositeOperation = "source-over";
		if (this.render_offscreen)
		{
			if (!this.runtime.layer_canvas)
			{
				this.runtime.layer_canvas = document.createElement("canvas");
;
				layer_canvas = this.runtime.layer_canvas;
				layer_canvas.width = this.runtime.draw_width;
				layer_canvas.height = this.runtime.draw_height;
				this.runtime.layer_ctx = layer_canvas.getContext("2d");
;
				ctx_changed = true;
			}
			layer_canvas = this.runtime.layer_canvas;
			layer_ctx = this.runtime.layer_ctx;
			if (layer_canvas.width !== this.runtime.draw_width)
			{
				layer_canvas.width = this.runtime.draw_width;
				ctx_changed = true;
			}
			if (layer_canvas.height !== this.runtime.draw_height)
			{
				layer_canvas.height = this.runtime.draw_height;
				ctx_changed = true;
			}
			if (ctx_changed)
			{
				layer_ctx["webkitImageSmoothingEnabled"] = this.runtime.linearSampling;
				layer_ctx["mozImageSmoothingEnabled"] = this.runtime.linearSampling;
				layer_ctx["msImageSmoothingEnabled"] = this.runtime.linearSampling;
				layer_ctx["imageSmoothingEnabled"] = this.runtime.linearSampling;
			}
			if (this.transparent)
				layer_ctx.clearRect(0, 0, this.runtime.draw_width, this.runtime.draw_height);
		}
		if (!this.transparent)
		{
			layer_ctx.fillStyle = "rgb(" + this.background_color[0] + "," + this.background_color[1] + "," + this.background_color[2] + ")";
			layer_ctx.fillRect(0, 0, this.runtime.draw_width, this.runtime.draw_height);
		}
		layer_ctx.save();
		this.disableAngle = true;
		var px = this.canvasToLayer(0, 0, true, true);
		var py = this.canvasToLayer(0, 0, false, true);
		this.disableAngle = false;
		if (this.runtime.pixel_rounding)
		{
			px = (px + 0.5) | 0;
			py = (py + 0.5) | 0;
		}
		this.rotateViewport(px, py, layer_ctx);
		var myscale = this.getScale();
		layer_ctx.scale(myscale, myscale);
		layer_ctx.translate(-px, -py);
		var i, len, inst, bbox;
		for (i = 0, len = this.instances.length; i < len; i++)
		{
			inst = this.instances[i];
			if (!inst.visible || inst.width === 0 || inst.height === 0)
				continue;
			inst.update_bbox();
			bbox = inst.bbox;
			if (bbox.right < this.viewLeft || bbox.bottom < this.viewTop || bbox.left > this.viewRight || bbox.top > this.viewBottom)
				continue;
			layer_ctx.globalCompositeOperation = inst.compositeOp;
			inst.draw(layer_ctx);
		}
		layer_ctx.restore();
		if (this.render_offscreen)
		{
			ctx.globalCompositeOperation = this.compositeOp;
			ctx.globalAlpha = this.opacity;
			ctx.drawImage(layer_canvas, 0, 0);
		}
	};
	Layer.prototype.rotateViewport = function (px, py, ctx)
	{
		var myscale = this.getScale();
		this.viewLeft = px;
		this.viewTop = py;
		this.viewRight = px + (this.runtime.draw_width * (1 / myscale));
		this.viewBottom = py + (this.runtime.draw_height * (1 / myscale));
		var myAngle = this.getAngle();
		if (myAngle !== 0)
		{
			if (ctx)
			{
				ctx.translate(this.runtime.draw_width / 2, this.runtime.draw_height / 2);
				ctx.rotate(-myAngle);
				ctx.translate(this.runtime.draw_width / -2, this.runtime.draw_height / -2);
			}
			this.tmprect.set(this.viewLeft, this.viewTop, this.viewRight, this.viewBottom);
			this.tmprect.offset((this.viewLeft + this.viewRight) / -2, (this.viewTop + this.viewBottom) / -2);
			this.tmpquad.set_from_rotated_rect(this.tmprect, myAngle);
			this.tmpquad.bounding_box(this.tmprect);
			this.tmprect.offset((this.viewLeft + this.viewRight) / 2, (this.viewTop + this.viewBottom) / 2);
			this.viewLeft = this.tmprect.left;
			this.viewTop = this.tmprect.top;
			this.viewRight = this.tmprect.right;
			this.viewBottom = this.tmprect.bottom;
		}
	}
	Layer.prototype.drawGL = function (glw)
	{
		var windowWidth = this.runtime.draw_width;
		var windowHeight = this.runtime.draw_height;
		var shaderindex = 0;
		var etindex = 0;
		this.render_offscreen = (this.forceOwnTexture || this.opacity !== 1.0 || this.active_effect_types.length > 0 || this.blend_mode !== 0);
		if (this.render_offscreen)
		{
			if (!this.runtime.layer_tex)
			{
				this.runtime.layer_tex = glw.createEmptyTexture(this.runtime.draw_width, this.runtime.draw_height, this.runtime.linearSampling);
			}
			if (this.runtime.layer_tex.c2width !== this.runtime.draw_width || this.runtime.layer_tex.c2height !== this.runtime.draw_height)
			{
				glw.deleteTexture(this.runtime.layer_tex);
				this.runtime.layer_tex = glw.createEmptyTexture(this.runtime.draw_width, this.runtime.draw_height, this.runtime.linearSampling);
			}
			glw.setRenderingToTexture(this.runtime.layer_tex);
			if (this.transparent)
				glw.clear(0, 0, 0, 0);
		}
		if (!this.transparent)
		{
			glw.clear(this.background_color[0] / 255, this.background_color[1] / 255, this.background_color[2] / 255, 1);
		}
		this.disableAngle = true;
		var px = this.canvasToLayer(0, 0, true, true);
		var py = this.canvasToLayer(0, 0, false, true);
		this.disableAngle = false;
		if (this.runtime.pixel_rounding)
		{
			px = (px + 0.5) | 0;
			py = (py + 0.5) | 0;
		}
		this.rotateViewport(px, py, null);
		var myscale = this.getScale();
		glw.resetModelView();
		glw.scale(myscale, myscale);
		glw.rotateZ(-this.getAngle());
		glw.translate((this.viewLeft + this.viewRight) / -2, (this.viewTop + this.viewBottom) / -2);
		glw.updateModelView();
		var i, len, inst, bbox;
		for (i = 0, len = this.instances.length; i < len; i++)
		{
			inst = this.instances[i];
			if (!inst.visible || inst.width === 0 || inst.height === 0)
				continue;
			inst.update_bbox();
			bbox = inst.bbox;
			if (bbox.right < this.viewLeft || bbox.bottom < this.viewTop || bbox.left > this.viewRight || bbox.top > this.viewBottom)
				continue;
			if (inst.uses_shaders)
			{
				shaderindex = inst.active_effect_types[0].shaderindex;
				etindex = inst.active_effect_types[0].index;
				if (inst.active_effect_types.length === 1 && !glw.programUsesCrossSampling(shaderindex) &&
					!glw.programExtendsBox(shaderindex) && ((!inst.angle && !inst.layer.getAngle()) || !glw.programUsesDest(shaderindex)) &&
					inst.opacity === 1 && !inst.type.plugin.must_predraw)
				{
					glw.switchProgram(shaderindex);
					glw.setBlend(inst.srcBlend, inst.destBlend);
					if (glw.programIsAnimated(shaderindex))
						this.runtime.redraw = true;
					var destStartX = 0, destStartY = 0, destEndX = 0, destEndY = 0;
					if (glw.programUsesDest(shaderindex))
					{
						var bbox = inst.bbox;
						var screenleft = this.layerToCanvas(bbox.left, bbox.top, true, true);
						var screentop = this.layerToCanvas(bbox.left, bbox.top, false, true);
						var screenright = this.layerToCanvas(bbox.right, bbox.bottom, true, true);
						var screenbottom = this.layerToCanvas(bbox.right, bbox.bottom, false, true);
						destStartX = screenleft / windowWidth;
						destStartY = 1 - screentop / windowHeight;
						destEndX = screenright / windowWidth;
						destEndY = 1 - screenbottom / windowHeight;
					}
					glw.setProgramParameters(this.render_offscreen ? this.runtime.layer_tex : this.layout.getRenderTarget(), // backTex
											 1.0 / inst.width,			// pixelWidth
											 1.0 / inst.height,			// pixelHeight
											 destStartX, destStartY,
											 destEndX, destEndY,
											 this.getScale(),
											 this.getAngle(),
											 this.viewLeft, this.viewTop,
											 inst.effect_params[etindex]);
					inst.drawGL(glw);
				}
				else
				{
					this.layout.renderEffectChain(glw, this, inst, this.render_offscreen ? this.runtime.layer_tex : this.layout.getRenderTarget());
					glw.resetModelView();
					glw.scale(myscale, myscale);
					glw.rotateZ(-this.getAngle());
					glw.translate((this.viewLeft + this.viewRight) / -2, (this.viewTop + this.viewBottom) / -2);
					glw.updateModelView();
				}
			}
			else
			{
				glw.switchProgram(0);		// un-set any previously set shader
				glw.setBlend(inst.srcBlend, inst.destBlend);
				inst.drawGL(glw);
			}
		}
		if (this.render_offscreen)
		{
			shaderindex = this.active_effect_types.length ? this.active_effect_types[0].shaderindex : 0;
			etindex = this.active_effect_types.length ? this.active_effect_types[0].index : 0;
			if (this.active_effect_types.length === 0 || (this.active_effect_types.length === 1 &&
				!glw.programUsesCrossSampling(shaderindex) && this.opacity === 1))
			{
				if (this.active_effect_types.length === 1)
				{
					glw.switchProgram(shaderindex);
					glw.setProgramParameters(this.layout.getRenderTarget(),		// backTex
											 1.0 / this.runtime.draw_width,		// pixelWidth
											 1.0 / this.runtime.draw_height,	// pixelHeight
											 0.0, 0.0,							// destStart
											 1.0, 1.0,							// destEnd
											 this.getScale(),					// layerScale
											 this.getAngle(),
											 this.viewLeft, this.viewTop,
											 this.effect_params[etindex]);		// fx parameters
					if (glw.programIsAnimated(shaderindex))
						this.runtime.redraw = true;
				}
				else
					glw.switchProgram(0);
				glw.setRenderingToTexture(this.layout.getRenderTarget());
				glw.setOpacity(this.opacity);
				glw.setTexture(this.runtime.layer_tex);
				glw.setBlend(this.srcBlend, this.destBlend);
				glw.resetModelView();
				glw.updateModelView();
				var halfw = this.runtime.draw_width / 2;
				var halfh = this.runtime.draw_height / 2;
				glw.quad(-halfw, halfh, halfw, halfh, halfw, -halfh, -halfw, -halfh);
				glw.setTexture(null);
			}
			else
			{
				this.layout.renderEffectChain(glw, this, null, this.layout.getRenderTarget());
			}
		}
	};
	Layer.prototype.canvasToLayer = function (ptx, pty, getx, using_draw_area)
	{
		var multiplier = this.runtime.devicePixelRatio;
		if (this.runtime.isRetina)
		{
			ptx *= multiplier;
			pty *= multiplier;
		}
		var ox = this.runtime.parallax_x_origin;
		var oy = this.runtime.parallax_y_origin;
		var x = ((this.layout.scrollX - ox) * this.parallaxX) + ox;
		var y = ((this.layout.scrollY - oy) * this.parallaxY) + oy;
		var invScale = 1 / this.getScale(!using_draw_area);
		if (using_draw_area)
		{
			x -= (this.runtime.draw_width * invScale) / 2;
			y -= (this.runtime.draw_height * invScale) / 2;
		}
		else
		{
			x -= (this.runtime.width * invScale) / 2;
			y -= (this.runtime.height * invScale) / 2;
		}
		x += ptx * invScale;
		y += pty * invScale;
		var a = this.getAngle();
		if (a !== 0)
		{
			x -= this.layout.scrollX;
			y -= this.layout.scrollY;
			var cosa = Math.cos(a);
			var sina = Math.sin(a);
			var x_temp = (x * cosa) - (y * sina);
			y = (y * cosa) + (x * sina);
			x = x_temp;
			x += this.layout.scrollX;
			y += this.layout.scrollY;
		}
		return getx ? x : y;
	};
	Layer.prototype.layerToCanvas = function (ptx, pty, getx, using_draw_area)
	{
		var a = this.getAngle();
		if (a !== 0)
		{
			ptx -= this.layout.scrollX;
			pty -= this.layout.scrollY;
			var cosa = Math.cos(-a);
			var sina = Math.sin(-a);
			var x_temp = (ptx * cosa) - (pty * sina);
			pty = (pty * cosa) + (ptx * sina);
			ptx = x_temp;
			ptx += this.layout.scrollX;
			pty += this.layout.scrollY;
		}
		var ox = this.runtime.parallax_x_origin;
		var oy = this.runtime.parallax_y_origin;
		var x = ((this.layout.scrollX - ox) * this.parallaxX) + ox;
		var y = ((this.layout.scrollY - oy) * this.parallaxY) + oy;
		var invScale = 1 / this.getScale(!using_draw_area);
		if (using_draw_area)
		{
			x -= (this.runtime.draw_width * invScale) / 2;
			y -= (this.runtime.draw_height * invScale) / 2;
		}
		else
		{
			x -= (this.runtime.width * invScale) / 2;
			y -= (this.runtime.height * invScale) / 2;
		}
		x = (ptx - x) / invScale;
		y = (pty - y) / invScale;
		var multiplier = this.runtime.devicePixelRatio;
		if (this.runtime.isRetina)
		{
			x /= multiplier;
			y /= multiplier;
		}
		return getx ? x : y;
	};
	Layer.prototype.rotatePt = function (x_, y_, getx)
	{
		if (this.getAngle() === 0)
			return getx ? x_ : y_;
		var nx = this.layerToCanvas(x_, y_, true);
		var ny = this.layerToCanvas(x_, y_, false);
		this.disableAngle = true;
		var px = this.canvasToLayer(nx, ny, true);
		var py = this.canvasToLayer(nx, ny, true);
		this.disableAngle = false;
		return getx ? px : py;
	};
	Layer.prototype.saveToJSON = function ()
	{
		var i, len, et;
		var o = {
			"s": this.scale,
			"a": this.angle,
			"vl": this.viewLeft,
			"vt": this.viewTop,
			"vr": this.viewRight,
			"vb": this.viewBottom,
			"v": this.visible,
			"bc": this.background_color,
			"t": this.transparent,
			"px": this.parallaxX,
			"py": this.parallaxY,
			"o": this.opacity,
			"zr": this.zoomRate,
			"fx": [],
			"instances": []
		};
		for (i = 0, len = this.effect_types.length; i < len; i++)
		{
			et = this.effect_types[i];
			o["fx"].push({"name": et.name, "active": et.active, "params": this.effect_params[et.index] });
		}
		return o;
	};
	function sortInstanceByZIndex(a, b)
	{
		return a.zindex - b.zindex;
	};
	Layer.prototype.loadFromJSON = function (o)
	{
		var i, len, p, inst, fx;
		this.scale = o["s"];
		this.angle = o["a"];
		this.viewLeft = o["vl"];
		this.viewTop = o["vt"];
		this.viewRight = o["vr"];
		this.viewBottom = o["vb"];
		this.visible = o["v"];
		this.background_color = o["bc"];
		this.transparent = o["t"];
		this.parallaxX = o["px"];
		this.parallaxY = o["py"];
		this.opacity = o["o"];
		this.zoomRate = o["zr"];
		var ofx = o["fx"];
		for (i = 0, len = ofx.length; i < len; i++)
		{
			fx = this.getEffectByName(ofx[i]["name"]);
			if (!fx)
				continue;		// must've gone missing
			fx.active = ofx[i]["active"];
			this.effect_params[fx.index] = ofx[i]["params"];
		}
		this.updateActiveEffects();
		this.instances.sort(sortInstanceByZIndex);
		this.zindices_stale = true;
	};
	cr.layer = Layer;
}());
;
(function()
{
	var allUniqueSolModifiers = [];
	function testSolsMatch(arr1, arr2)
	{
		var i, len = arr1.length;
		switch (len) {
		case 0:
			return true;
		case 1:
			return arr1[0] === arr2[0];
		case 2:
			return arr1[0] === arr2[0] && arr1[1] === arr2[1];
		default:
			for (i = 0; i < len; i++)
			{
				if (arr1[i] !== arr2[i])
					return false;
			}
			return true;
		}
	};
	function solArraySorter(t1, t2)
	{
		return t1.index - t2.index;
	};
	function findMatchingSolModifier(arr)
	{
		var i, len, u, temp, subarr;
		if (arr.length === 2)
		{
			if (arr[0].index > arr[1].index)
			{
				temp = arr[0];
				arr[0] = arr[1];
				arr[1] = temp;
			}
		}
		else if (arr.length > 2)
			arr.sort(solArraySorter);		// so testSolsMatch compares in same order
		if (arr.length >= allUniqueSolModifiers.length)
			allUniqueSolModifiers.length = arr.length + 1;
		if (!allUniqueSolModifiers[arr.length])
			allUniqueSolModifiers[arr.length] = [];
		subarr = allUniqueSolModifiers[arr.length];
		for (i = 0, len = subarr.length; i < len; i++)
		{
			u = subarr[i];
			if (testSolsMatch(arr, u))
				return u;
		}
		subarr.push(arr);
		return arr;
	};
	function EventSheet(runtime, m)
	{
		this.runtime = runtime;
		this.triggers = {};
		this.fasttriggers = {};
        this.hasRun = false;
        this.includes = new cr.ObjectSet(); // all event sheets included by this sheet, at first-level indirection only
		this.name = m[0];
		var em = m[1];		// events model
		this.events = [];       // triggers won't make it to this array
		var i, len;
		for (i = 0, len = em.length; i < len; i++)
			this.init_event(em[i], null, this.events);
	};
    EventSheet.prototype.toString = function ()
    {
        return this.name;
    };
	EventSheet.prototype.init_event = function (m, parent, nontriggers)
	{
		switch (m[0]) {
		case 0:	// event block
		{
			var block = new cr.eventblock(this, parent, m);
			cr.seal(block);
			if (block.orblock)
			{
				nontriggers.push(block);
				var i, len;
				for (i = 0, len = block.conditions.length; i < len; i++)
				{
					if (block.conditions[i].trigger)
						this.init_trigger(block, i);
				}
			}
			else
			{
				if (block.is_trigger())
					this.init_trigger(block, 0);
				else
					nontriggers.push(block);
			}
			break;
		}
		case 1: // variable
		{
			var v = new cr.eventvariable(this, parent, m);
			cr.seal(v);
			nontriggers.push(v);
			break;
		}
        case 2:	// include
        {
            var inc = new cr.eventinclude(this, parent, m);
			cr.seal(inc);
            nontriggers.push(inc);
			break;
        }
		default:
;
		}
	};
	EventSheet.prototype.postInit = function ()
	{
		var i, len;
		for (i = 0, len = this.events.length; i < len; i++)
		{
			this.events[i].postInit(i < len - 1 && this.events[i + 1].is_else_block);
		}
	};
	EventSheet.prototype.run = function (from_include)
	{
		if (!this.runtime.resuming_breakpoint)
		{
			this.hasRun = true;
			if (!from_include)
				this.runtime.isRunningEvents = true;
		}
		var i, len;
		for (i = 0, len = this.events.length; i < len; i++)
		{
			var ev = this.events[i];
			ev.run();
				this.runtime.clearSol(ev.solModifiers);
				if (!this.runtime.deathRow.isEmpty() || this.runtime.createRow.length)
					this.runtime.ClearDeathRow();
		}
			if (!from_include)
				this.runtime.isRunningEvents = false;
	};
	EventSheet.prototype.init_trigger = function (trig, index)
	{
		if (!trig.orblock)
			this.runtime.triggers_to_postinit.push(trig);	// needs to be postInit'd later
		var i, len;
		var cnd = trig.conditions[index];
		var type_name;
		if (cnd.type)
			type_name = cnd.type.name;
		else
			type_name = "system";
		var fasttrigger = cnd.fasttrigger;
		var triggers = (fasttrigger ? this.fasttriggers : this.triggers);
		if (!triggers[type_name])
			triggers[type_name] = [];
		var obj_entry = triggers[type_name];
		var method = cnd.func;
		if (fasttrigger)
		{
			if (!cnd.parameters.length)				// no parameters
				return;
			var firstparam = cnd.parameters[0];
			if (firstparam.type !== 1 ||			// not a string param
				firstparam.expression.type !== 2)	// not a string literal node
			{
				return;
			}
			var fastevs;
			var firstvalue = firstparam.expression.value.toLowerCase();
			var i, len;
			for (i = 0, len = obj_entry.length; i < len; i++)
			{
				if (obj_entry[i].method == method)
				{
					fastevs = obj_entry[i].evs;
					if (!fastevs[firstvalue])
						fastevs[firstvalue] = [[trig, index]];
					else
						fastevs[firstvalue].push([trig, index]);
					return;
				}
			}
			fastevs = {};
			fastevs[firstvalue] = [[trig, index]];
			obj_entry.push({ method: method, evs: fastevs });
		}
		else
		{
			for (i = 0, len = obj_entry.length; i < len; i++)
			{
				if (obj_entry[i].method == method)
				{
					obj_entry[i].evs.push([trig, index]);
					return;
				}
			}
			obj_entry.push({ method: method, evs: [[trig, index]]});
		}
	};
	cr.eventsheet = EventSheet;
	function Selection(type)
	{
		this.type = type;
		this.instances = [];        // subset of picked instances
		this.else_instances = [];	// subset of unpicked instances
		this.select_all = true;
	};
	Selection.prototype.hasObjects = function ()
	{
		if (this.select_all)
			return this.type.instances.length;
		else
			return this.instances.length;
	};
	Selection.prototype.getObjects = function ()
	{
		if (this.select_all)
			return this.type.instances;
		else
			return this.instances;
	};
	/*
	Selection.prototype.ensure_picked = function (inst, skip_siblings)
	{
		var i, len;
		var orblock = inst.runtime.getCurrentEventStack().current_event.orblock;
		if (this.select_all)
		{
			this.select_all = false;
			if (orblock)
			{
				cr.shallowAssignArray(this.else_instances, inst.type.instances);
				cr.arrayFindRemove(this.else_instances, inst);
			}
			this.instances.length = 1;
			this.instances[0] = inst;
		}
		else
		{
			if (orblock)
			{
				i = this.else_instances.indexOf(inst);
				if (i !== -1)
				{
					this.instances.push(this.else_instances[i]);
					this.else_instances.splice(i, 1);
				}
			}
			else
			{
				if (this.instances.indexOf(inst) === -1)
					this.instances.push(inst);
			}
		}
		if (!skip_siblings)
		{
		}
	};
	*/
	Selection.prototype.pick_one = function (inst)
	{
		if (!inst)
			return;
		if (inst.runtime.getCurrentEventStack().current_event.orblock)
		{
			if (this.select_all)
			{
				this.instances.length = 0;
				cr.shallowAssignArray(this.else_instances, inst.type.instances);
				this.select_all = false;
			}
			var i = this.else_instances.indexOf(inst);
			if (i !== -1)
			{
				this.instances.push(this.else_instances[i]);
				this.else_instances.splice(i, 1);
			}
		}
		else
		{
			this.select_all = false;
			this.instances.length = 1;
			this.instances[0] = inst;
		}
	};
	cr.selection = Selection;
	function EventBlock(sheet, parent, m)
	{
		this.sheet = sheet;
		this.parent = parent;
		this.runtime = sheet.runtime;
		this.solModifiers = [];
		this.solModifiersIncludingParents = [];
		this.solWriterAfterCnds = false;	// block does not change SOL after running its conditions
		this.group = false;					// is group of events
		this.initially_activated = false;	// if a group, is active on startup
		this.toplevelevent = false;			// is an event block parented only by a top-level group
		this.toplevelgroup = false;			// is parented only by other groups or is top-level (i.e. not in a subevent)
		this.has_else_block = false;		// is followed by else
;
		this.conditions = [];
		this.actions = [];
		this.subevents = [];
        if (m[1])
        {
			this.group_name = m[1][1].toLowerCase();
			this.group = true;
			this.initially_activated = !!m[1][0];
			this.runtime.allGroups.push(this);
            this.runtime.activeGroups[(/*this.sheet.name + "|" + */this.group_name).toLowerCase()] = this.initially_activated;
        }
		else
		{
			this.group_name = "";
			this.group = false;
			this.initially_activated = false;
		}
		this.orblock = m[2];
		this.sid = m[4];
		if (!this.group)
			this.runtime.blocksBySid[this.sid.toString()] = this;
		var i, len;
		var cm = m[5];
		for (i = 0, len = cm.length; i < len; i++)
		{
			var cnd = new cr.condition(this, cm[i]);
			cnd.index = i;
			cr.seal(cnd);
			this.conditions.push(cnd);
			/*
			if (cnd.is_logical())
				this.is_logical = true;
			if (cnd.type && !cnd.type.plugin.singleglobal && this.cndReferences.indexOf(cnd.type) === -1)
				this.cndReferences.push(cnd.type);
			*/
			this.addSolModifier(cnd.type);
		}
		var am = m[6];
		for (i = 0, len = am.length; i < len; i++)
		{
			var act = new cr.action(this, am[i]);
			act.index = i;
			cr.seal(act);
			this.actions.push(act);
		}
		if (m.length === 8)
		{
			var em = m[7];
			for (i = 0, len = em.length; i < len; i++)
				this.sheet.init_event(em[i], this, this.subevents);
		}
		this.is_else_block = false;
		if (this.conditions.length)
		{
			this.is_else_block = (this.conditions[0].type == null && this.conditions[0].func == cr.system_object.prototype.cnds.Else);
		}
	};
	window["_c2hh_"] = "9755A220C24184A2742865EE366C8F52A1F994F7";
	EventBlock.prototype.postInit = function (hasElse/*, prevBlock_*/)
	{
		var i, len;
		var p = this.parent;
		if (this.group)
		{
			this.toplevelgroup = true;
			while (p)
			{
				if (!p.group)
				{
					this.toplevelgroup = false;
					break;
				}
				p = p.parent;
			}
		}
		this.toplevelevent = !this.is_trigger() && (!this.parent || (this.parent.group && this.parent.toplevelgroup));
		this.has_else_block = !!hasElse;
		this.solModifiersIncludingParents = this.solModifiers.slice(0);
		p = this.parent;
		while (p)
		{
			for (i = 0, len = p.solModifiers.length; i < len; i++)
				this.addParentSolModifier(p.solModifiers[i]);
			p = p.parent;
		}
		this.solModifiers = findMatchingSolModifier(this.solModifiers);
		this.solModifiersIncludingParents = findMatchingSolModifier(this.solModifiersIncludingParents);
		var i, len/*, s*/;
		for (i = 0, len = this.conditions.length; i < len; i++)
			this.conditions[i].postInit();
		for (i = 0, len = this.actions.length; i < len; i++)
			this.actions[i].postInit();
		for (i = 0, len = this.subevents.length; i < len; i++)
		{
			this.subevents[i].postInit(i < len - 1 && this.subevents[i + 1].is_else_block);
		}
		/*
		if (this.is_else_block && this.prev_block)
		{
			for (i = 0, len = this.prev_block.solModifiers.length; i < len; i++)
			{
				s = this.prev_block.solModifiers[i];
				if (this.solModifiers.indexOf(s) === -1)
					this.solModifiers.push(s);
			}
		}
		*/
	}
	function addSolModifierToList(type, arr)
	{
		var i, len, t;
		if (!type)
			return;
		if (arr.indexOf(type) === -1)
			arr.push(type);
		if (type.is_contained)
		{
			for (i = 0, len = type.container.length; i < len; i++)
			{
				t = type.container[i];
				if (type === t)
					continue;		// already handled
				if (arr.indexOf(t) === -1)
					arr.push(t);
			}
		}
	};
	EventBlock.prototype.addSolModifier = function (type)
	{
		addSolModifierToList(type, this.solModifiers);
	};
	EventBlock.prototype.addParentSolModifier = function (type)
	{
		addSolModifierToList(type, this.solModifiersIncludingParents);
	};
	EventBlock.prototype.setSolWriterAfterCnds = function ()
	{
		this.solWriterAfterCnds = true;
		if (this.parent)
			this.parent.setSolWriterAfterCnds();
	};
	EventBlock.prototype.is_trigger = function ()
	{
		if (!this.conditions.length)    // no conditions
			return false;
		else
			return this.conditions[0].trigger;
	};
	EventBlock.prototype.run = function ()
	{
		var i, len, any_true = false, cnd_result;
		var evinfo = this.runtime.getCurrentEventStack();
		evinfo.current_event = this;
			if (!this.is_else_block)
				evinfo.else_branch_ran = false;
		if (this.orblock)
		{
			if (this.conditions.length === 0)
				any_true = true;		// be sure to run if empty block
				evinfo.cndindex = 0
			for (len = this.conditions.length; evinfo.cndindex < len; evinfo.cndindex++)
			{
				if (this.conditions[evinfo.cndindex].trigger)		// skip triggers when running OR block
					continue;
				cnd_result = this.conditions[evinfo.cndindex].run();
				if (cnd_result)			// make sure all conditions run and run if any were true
					any_true = true;
			}
			evinfo.last_event_true = any_true;
			if (any_true)
				this.run_actions_and_subevents();
		}
		else
		{
				evinfo.cndindex = 0
			for (len = this.conditions.length; evinfo.cndindex < len; evinfo.cndindex++)
			{
				cnd_result = this.conditions[evinfo.cndindex].run();
				if (!cnd_result)    // condition failed
				{
					evinfo.last_event_true = false;
					if (this.toplevelevent && (!this.runtime.deathRow.isEmpty() || this.runtime.createRow.length))
						this.runtime.ClearDeathRow();
					return;		// bail out now
				}
			}
			evinfo.last_event_true = true;
			this.run_actions_and_subevents();
		}
		this.end_run(evinfo);
	};
	EventBlock.prototype.end_run = function (evinfo)
	{
		if (evinfo.last_event_true && this.has_else_block)
			evinfo.else_branch_ran = true;
		if (this.toplevelevent && (!this.runtime.deathRow.isEmpty() || this.runtime.createRow.length))
			this.runtime.ClearDeathRow();
	};
	EventBlock.prototype.run_orblocktrigger = function (index)
	{
		var evinfo = this.runtime.getCurrentEventStack();
		evinfo.current_event = this;
		if (this.conditions[index].run())
		{
			this.run_actions_and_subevents();
			this.runtime.getCurrentEventStack().last_event_true = true;
		}
	};
	EventBlock.prototype.run_actions_and_subevents = function ()
	{
		var evinfo = this.runtime.getCurrentEventStack();
		var len;
		for (evinfo.actindex = 0, len = this.actions.length; evinfo.actindex < len; evinfo.actindex++)
		{
			if (this.actions[evinfo.actindex].run())
				return;
		}
		this.run_subevents();
	};
	EventBlock.prototype.resume_actions_and_subevents = function ()
	{
		var evinfo = this.runtime.getCurrentEventStack();
		var len;
		for (len = this.actions.length; evinfo.actindex < len; evinfo.actindex++)
		{
			if (this.actions[evinfo.actindex].run())
				return;
		}
		this.run_subevents();
	};
	EventBlock.prototype.run_subevents = function ()
	{
		if (!this.subevents.length)
			return;
		var i, len, subev, pushpop/*, skipped_pop = false, pop_modifiers = null*/;
		var last = this.subevents.length - 1;
			this.runtime.pushEventStack(this);
		if (this.solWriterAfterCnds)
		{
			for (i = 0, len = this.subevents.length; i < len; i++)
			{
				subev = this.subevents[i];
					pushpop = (!this.toplevelgroup || (!this.group && i < last));
					if (pushpop)
						this.runtime.pushCopySol(subev.solModifiers);
				subev.run();
					if (pushpop)
						this.runtime.popSol(subev.solModifiers);
					else
						this.runtime.clearSol(subev.solModifiers);
			}
		}
		else
		{
			for (i = 0, len = this.subevents.length; i < len; i++)
			{
				this.subevents[i].run();
			}
		}
			this.runtime.popEventStack();
	};
	EventBlock.prototype.run_pretrigger = function ()
	{
		var evinfo = this.runtime.getCurrentEventStack();
		evinfo.current_event = this;
		var any_true = false;
		var i, len;
		for (evinfo.cndindex = 0, len = this.conditions.length; evinfo.cndindex < len; evinfo.cndindex++)
		{
;
			if (this.conditions[evinfo.cndindex].run())
				any_true = true;
			else if (!this.orblock)			// condition failed (let OR blocks run all conditions anyway)
				return false;               // bail out
		}
		return this.orblock ? any_true : true;
	};
	EventBlock.prototype.retrigger = function ()
	{
		this.runtime.execcount++;
		var prevcndindex = this.runtime.getCurrentEventStack().cndindex;
		var len;
		var evinfo = this.runtime.pushEventStack(this);
		if (!this.orblock)
		{
			for (evinfo.cndindex = prevcndindex + 1, len = this.conditions.length; evinfo.cndindex < len; evinfo.cndindex++)
			{
				if (!this.conditions[evinfo.cndindex].run())    // condition failed
				{
					this.runtime.popEventStack();               // moving up level of recursion
					return false;                               // bail out
				}
			}
		}
		this.run_actions_and_subevents();
		this.runtime.popEventStack();
		return true;		// ran an iteration
	};
	EventBlock.prototype.isFirstConditionOfType = function (cnd)
	{
		var cndindex = cnd.index;
		if (cndindex === 0)
			return true;
		--cndindex;
		for ( ; cndindex >= 0; --cndindex)
		{
			if (this.conditions[cndindex].type === cnd.type)
				return false;
		}
		return true;
	};
	cr.eventblock = EventBlock;
	function Condition(block, m)
	{
		this.block = block;
		this.sheet = block.sheet;
		this.runtime = block.runtime;
		this.parameters = [];
		this.results = [];
		this.extra = {};		// for plugins to stow away some custom info
		this.index = -1;
		this.func = m[1];
;
		this.trigger = (m[3] > 0);
		this.fasttrigger = (m[3] === 2);
		this.looping = m[4];
		this.inverted = m[5];
		this.isstatic = m[6];
		this.sid = m[7];
		this.runtime.cndsBySid[this.sid.toString()] = this;
		if (m[0] === -1)		// system object
		{
			this.type = null;
			this.run = this.run_system;
			this.behaviortype = null;
			this.beh_index = -1;
		}
		else
		{
			this.type = this.runtime.types_by_index[m[0]];
;
			if (this.isstatic)
				this.run = this.run_static;
			else
				this.run = this.run_object;
			if (m[2])
			{
				this.behaviortype = this.type.getBehaviorByName(m[2]);
;
				this.beh_index = this.type.getBehaviorIndexByName(m[2]);
;
			}
			else
			{
				this.behaviortype = null;
				this.beh_index = -1;
			}
			if (this.block.parent)
				this.block.parent.setSolWriterAfterCnds();
		}
		if (this.fasttrigger)
			this.run = this.run_true;
		if (m.length === 10)
		{
			var i, len;
			var em = m[9];
			for (i = 0, len = em.length; i < len; i++)
			{
				var param = new cr.parameter(this, em[i]);
				cr.seal(param);
				this.parameters.push(param);
			}
			this.results.length = em.length;
		}
	};
	Condition.prototype.postInit = function ()
	{
		var i, len;
		for (i = 0, len = this.parameters.length; i < len; i++)
			this.parameters[i].postInit();
	};
	/*
	Condition.prototype.is_logical = function ()
	{
		return !this.type || this.type.plugin.singleglobal;
	};
	*/
	Condition.prototype.run_true = function ()
	{
		return true;
	};
	Condition.prototype.run_system = function ()
	{
		var i, len;
		for (i = 0, len = this.parameters.length; i < len; i++)
			this.results[i] = this.parameters[i].get();
		return cr.xor(this.func.apply(this.runtime.system, this.results), this.inverted);
	};
	Condition.prototype.run_static = function ()
	{
		var i, len;
		for (i = 0, len = this.parameters.length; i < len; i++)
			this.results[i] = this.parameters[i].get(i);
		var ret = this.func.apply(this.behaviortype ? this.behaviortype : this.type, this.results);
		this.type.applySolToContainer();
		return ret;
	};
	Condition.prototype.run_object = function ()
	{
		var i, j, leni, lenj, ret, met, inst, s, sol2;
		var sol = this.type.getCurrentSol();
		var is_orblock = this.block.orblock && !this.trigger;		// triggers in OR blocks need to work normally
		var offset = 0;
		var is_contained = this.type.is_contained;
		if (sol.select_all) {
			sol.instances.length = 0;       // clear contents
			sol.else_instances.length = 0;
			for (i = 0, leni = this.type.instances.length; i < leni; i++)
			{
				inst = this.type.instances[i];
;
				for (j = 0, lenj = this.parameters.length; j < lenj; j++)
					this.results[j] = this.parameters[j].get(i);        // default SOL index is current object
				if (this.beh_index > -1)
				{
					if (this.type.is_family)
					{
						offset = inst.type.family_beh_map[this.type.family_index];
					}
					ret = this.func.apply(inst.behavior_insts[this.beh_index + offset], this.results);
				}
				else
					ret = this.func.apply(inst, this.results);
				met = cr.xor(ret, this.inverted);
				if (met)
					sol.instances.push(inst);
				else if (is_orblock)					// in OR blocks, keep the instances not meeting the condition for subsequent testing
					sol.else_instances.push(inst);
			}
			if (this.type.finish)
				this.type.finish(true);
			sol.select_all = false;
			this.type.applySolToContainer();
			return sol.hasObjects();
		}
		else {
			var k = 0;
			var using_else_instances = (is_orblock && !this.block.isFirstConditionOfType(this));
			var arr = (using_else_instances ? sol.else_instances : sol.instances);
			var any_true = false;
			for (i = 0, leni = arr.length; i < leni; i++)
			{
				inst = arr[i];
;
				for (j = 0, lenj = this.parameters.length; j < lenj; j++)
					this.results[j] = this.parameters[j].get(i);        // default SOL index is current object
				if (this.beh_index > -1)
				{
					if (this.type.is_family)
					{
						offset = inst.type.family_beh_map[this.type.family_index];
					}
					ret = this.func.apply(inst.behavior_insts[this.beh_index + offset], this.results);
				}
				else
					ret = this.func.apply(inst, this.results);
				if (cr.xor(ret, this.inverted))
				{
					any_true = true;
					if (using_else_instances)
					{
						sol.instances.push(inst);
						if (is_contained)
						{
							for (j = 0, lenj = inst.siblings.length; j < lenj; j++)
							{
								s = inst.siblings[j];
								s.type.getCurrentSol().instances.push(s);
							}
						}
					}
					else
					{
						arr[k] = inst;
						if (is_contained)
						{
							for (j = 0, lenj = inst.siblings.length; j < lenj; j++)
							{
								s = inst.siblings[j];
								s.type.getCurrentSol().instances[k] = s;
							}
						}
						k++;
					}
				}
				else
				{
					if (using_else_instances)
					{
						arr[k] = inst;
						if (is_contained)
						{
							for (j = 0, lenj = inst.siblings.length; j < lenj; j++)
							{
								s = inst.siblings[j];
								s.type.getCurrentSol().else_instances[k] = s;
							}
						}
						k++;
					}
					else if (is_orblock)
					{
						sol.else_instances.push(inst);
						if (is_contained)
						{
							for (j = 0, lenj = inst.siblings.length; j < lenj; j++)
							{
								s = inst.siblings[j];
								s.type.getCurrentSol().else_instances.push(s);
							}
						}
					}
				}
			}
			arr.length = k;
			if (is_contained)
			{
				for (i = 0, leni = this.type.container.length; i < leni; i++)
				{
					sol2 = this.type.container[i].getCurrentSol();
					if (using_else_instances)
						sol2.else_instances.length = k;
					else
						sol2.instances.length = k;
				}
			}
			var pick_in_finish = any_true;		// don't pick in finish() if we're only doing the logic test below
			if (using_else_instances && !any_true)
			{
				for (i = 0, leni = sol.instances.length; i < leni; i++)
				{
					inst = sol.instances[i];
					for (j = 0, lenj = this.parameters.length; j < lenj; j++)
						this.results[j] = this.parameters[j].get(i);
					if (this.beh_index > -1)
						ret = this.func.apply(inst.behavior_insts[this.beh_index], this.results);
					else
						ret = this.func.apply(inst, this.results);
					if (cr.xor(ret, this.inverted))
					{
						any_true = true;
						break;		// got our flag, don't need to test any more
					}
				}
			}
			if (this.type.finish)
				this.type.finish(pick_in_finish || is_orblock);
			return is_orblock ? any_true : sol.hasObjects();
		}
	};
	cr.condition = Condition;
	function Action(block, m)
	{
		this.block = block;
		this.sheet = block.sheet;
		this.runtime = block.runtime;
		this.parameters = [];
		this.results = [];
		this.extra = {};		// for plugins to stow away some custom info
		this.index = -1;
		this.func = m[1];
;
		if (m[0] === -1)	// system
		{
			this.type = null;
			this.run = this.run_system;
			this.behaviortype = null;
			this.beh_index = -1;
		}
		else
		{
			this.type = this.runtime.types_by_index[m[0]];
;
			this.run = this.run_object;
			if (m[2])
			{
				this.behaviortype = this.type.getBehaviorByName(m[2]);
;
				this.beh_index = this.type.getBehaviorIndexByName(m[2]);
;
			}
			else
			{
				this.behaviortype = null;
				this.beh_index = -1;
			}
		}
		this.sid = m[3];
		this.runtime.actsBySid[this.sid.toString()] = this;
		if (m.length === 6)
		{
			var i, len;
			var em = m[5];
			for (i = 0, len = em.length; i < len; i++)
			{
				var param = new cr.parameter(this, em[i]);
				cr.seal(param);
				this.parameters.push(param);
			}
			this.results.length = em.length;
		}
	};
	Action.prototype.postInit = function ()
	{
		var i, len;
		for (i = 0, len = this.parameters.length; i < len; i++)
			this.parameters[i].postInit();
	};
	Action.prototype.run_system = function ()
	{
		var i, len;
		for (i = 0, len = this.parameters.length; i < len; i++)
			this.results[i] = this.parameters[i].get();
		return this.func.apply(this.runtime.system, this.results);
	};
	Action.prototype.run_object = function ()
	{
		var instances = this.type.getCurrentSol().getObjects();
		var i, j, leni, lenj, inst;
		for (i = 0, leni = instances.length; i < leni; i++)
		{
			inst = instances[i];
			for (j = 0, lenj = this.parameters.length; j < lenj; j++)
				this.results[j] = this.parameters[j].get(i);    // pass i to use as default SOL index
			if (this.beh_index > -1)
			{
				var offset = 0;
				if (this.type.is_family)
				{
					offset = inst.type.family_beh_map[this.type.family_index];
				}
				this.func.apply(inst.behavior_insts[this.beh_index + offset], this.results);
			}
			else
				this.func.apply(inst, this.results);
		}
		return false;
	};
	cr.action = Action;
	var tempValues = [];
	var tempValuesPtr = -1;
	function Parameter(owner, m)
	{
		this.owner = owner;
		this.block = owner.block;
		this.sheet = owner.sheet;
		this.runtime = owner.runtime;
		this.type = m[0];
		this.expression = null;
		this.solindex = 0;
		this.combosel = 0;
		this.layout = null;
		this.key = 0;
		this.object = null;
		this.index = 0;
		this.varname = null;
		this.eventvar = null;
		this.fileinfo = null;
		this.subparams = null;
		this.variadicret = null;
		var i, len, param;
		switch (m[0])
		{
			case 0:		// number
			case 7:		// any
				this.expression = new cr.expNode(this, m[1]);
				this.solindex = 0;
				this.get = this.get_exp;
				break;
			case 1:		// string
				this.expression = new cr.expNode(this, m[1]);
				this.solindex = 0;
				this.get = this.get_exp_str;
				break;
			case 5:		// layer
				this.expression = new cr.expNode(this, m[1]);
				this.solindex = 0;
				this.get = this.get_layer;
				break;
			case 3:		// combo
			case 8:		// cmp
				this.combosel = m[1];
				this.get = this.get_combosel;
				break;
			case 6:		// layout
				this.layout = this.runtime.layouts[m[1]];
;
				this.get = this.get_layout;
				break;
			case 9:		// keyb
				this.key = m[1];
				this.get = this.get_key;
				break;
			case 4:		// object
				this.object = this.runtime.types_by_index[m[1]];
;
				this.get = this.get_object;
				this.block.addSolModifier(this.object);
				if (this.owner instanceof cr.action)
					this.block.setSolWriterAfterCnds();
				else if (this.block.parent)
					this.block.parent.setSolWriterAfterCnds();
				break;
			case 10:	// instvar
				this.index = m[1];
				if (owner.type.is_family)
					this.get = this.get_familyvar;
				else
					this.get = this.get_instvar;
				break;
			case 11:	// eventvar
				this.varname = m[1];
				this.eventvar = null;
				this.get = this.get_eventvar;
				break;
			case 2:		// audiofile	["name", ismusic]
			case 12:	// fileinfo		"name"
				this.fileinfo = m[1];
				this.get = this.get_audiofile;
				break;
			case 13:	// variadic
				this.get = this.get_variadic;
				this.subparams = [];
				this.variadicret = [];
				for (i = 1, len = m.length; i < len; i++)
				{
					param = new cr.parameter(this.owner, m[i]);
					cr.seal(param);
					this.subparams.push(param);
					this.variadicret.push(0);
				}
				break;
			default:
;
		}
	};
	Parameter.prototype.postInit = function ()
	{
		var i, len;
		if (this.type === 11)		// eventvar
		{
			this.eventvar = this.runtime.getEventVariableByName(this.varname, this.block.parent);
;
		}
		else if (this.type === 13)	// variadic, postInit all sub-params
		{
			for (i = 0, len = this.subparams.length; i < len; i++)
				this.subparams[i].postInit();
		}
		if (this.expression)
			this.expression.postInit();
	};
	Parameter.prototype.pushTempValue = function ()
	{
		tempValuesPtr++;
		if (tempValues.length === tempValuesPtr)
			tempValues.push(new cr.expvalue());
		return tempValues[tempValuesPtr];
	};
	Parameter.prototype.popTempValue = function ()
	{
		tempValuesPtr--;
	};
	Parameter.prototype.get_exp = function (solindex)
	{
		this.solindex = solindex || 0;   // default SOL index to use
		var temp = this.pushTempValue();
		this.expression.get(temp);
		this.popTempValue();
		return temp.data;      			// return actual JS value, not expvalue
	};
	Parameter.prototype.get_exp_str = function (solindex)
	{
		this.solindex = solindex || 0;   // default SOL index to use
		var temp = this.pushTempValue();
		this.expression.get(temp);
		this.popTempValue();
		if (cr.is_string(temp.data))
			return temp.data;
		else
			return "";
	};
	Parameter.prototype.get_object = function ()
	{
		return this.object;
	};
	Parameter.prototype.get_combosel = function ()
	{
		return this.combosel;
	};
	Parameter.prototype.get_layer = function (solindex)
	{
		this.solindex = solindex || 0;   // default SOL index to use
		var temp = this.pushTempValue();
		this.expression.get(temp);
		this.popTempValue();
		if (temp.is_number())
			return this.runtime.getLayerByNumber(temp.data);
		else
			return this.runtime.getLayerByName(temp.data);
	}
	Parameter.prototype.get_layout = function ()
	{
		return this.layout;
	};
	Parameter.prototype.get_key = function ()
	{
		return this.key;
	};
	Parameter.prototype.get_instvar = function ()
	{
		return this.index;
	};
	Parameter.prototype.get_familyvar = function (solindex)
	{
		var familytype = this.owner.type;
		var realtype = null;
		var sol = familytype.getCurrentSol();
		var objs = sol.getObjects();
		if (objs.length)
			realtype = objs[solindex % objs.length].type;
		else
		{
;
			realtype = sol.else_instances[solindex % sol.else_instances.length].type;
		}
		return this.index + realtype.family_var_map[familytype.family_index];
	};
	Parameter.prototype.get_eventvar = function ()
	{
		return this.eventvar;
	};
	Parameter.prototype.get_audiofile = function ()
	{
		return this.fileinfo;
	};
	Parameter.prototype.get_variadic = function ()
	{
		var i, len;
		for (i = 0, len = this.subparams.length; i < len; i++)
		{
			this.variadicret[i] = this.subparams[i].get();
		}
		return this.variadicret;
	};
	cr.parameter = Parameter;
	function EventVariable(sheet, parent, m)
	{
		this.sheet = sheet;
		this.parent = parent;
		this.runtime = sheet.runtime;
		this.solModifiers = [];
		this.name = m[1];
		this.vartype = m[2];
		this.initial = m[3];
		this.is_static = !!m[4];
		this.is_constant = !!m[5];
		this.sid = m[6];
		this.runtime.varsBySid[this.sid.toString()] = this;
		this.data = this.initial;	// note: also stored in event stack frame for local nonstatic nonconst vars
		if (this.parent)			// local var
		{
			if (this.is_static || this.is_constant)
				this.localIndex = -1;
			else
				this.localIndex = this.runtime.stackLocalCount++;
			this.runtime.all_local_vars.push(this);
		}
		else						// global var
		{
			this.localIndex = -1;
			this.runtime.all_global_vars.push(this);
		}
	};
	EventVariable.prototype.postInit = function ()
	{
		this.solModifiers = findMatchingSolModifier(this.solModifiers);
	};
	EventVariable.prototype.setValue = function (x)
	{
;
		var lvs = this.runtime.getCurrentLocalVarStack();
		if (!this.parent || this.is_static || !lvs)
			this.data = x;
		else	// local nonstatic variable: use event stack to keep value at this level of recursion
		{
			if (this.localIndex >= lvs.length)
				lvs.length = this.localIndex + 1;
			lvs[this.localIndex] = x;
		}
	};
	EventVariable.prototype.getValue = function ()
	{
		var lvs = this.runtime.getCurrentLocalVarStack();
		if (!this.parent || this.is_static || !lvs || this.is_constant)
			return this.data;
		else	// local nonstatic variable
		{
			if (this.localIndex >= lvs.length)
			{
;
				return this.initial;
			}
			if (typeof lvs[this.localIndex] === "undefined")
			{
;
				return this.initial;
			}
			return lvs[this.localIndex];
		}
	};
	EventVariable.prototype.run = function ()
	{
			if (this.parent && !this.is_static && !this.is_constant)
				this.setValue(this.initial);
	};
	cr.eventvariable = EventVariable;
	function EventInclude(sheet, parent, m)
	{
		this.sheet = sheet;
		this.parent = parent;
		this.runtime = sheet.runtime;
		this.solModifiers = [];
		this.include_sheet = null;		// determined in postInit
		this.include_sheet_name = m[1];
	};
	EventInclude.prototype.toString = function ()
	{
		return "include:" + this.include_sheet.toString();
	};
	EventInclude.prototype.postInit = function ()
	{
        this.include_sheet = this.runtime.eventsheets[this.include_sheet_name];
;
;
        this.sheet.includes.add(this);
		this.solModifiers = findMatchingSolModifier(this.solModifiers);
	};
	EventInclude.prototype.run = function ()
	{
			if (this.parent)
				this.runtime.pushCleanSol(this.runtime.types_by_index);
        if (!this.include_sheet.hasRun)
            this.include_sheet.run(true);			// from include
			if (this.parent)
				this.runtime.popSol(this.runtime.types_by_index);
	};
	EventInclude.prototype.isActive = function ()
	{
		var p = this.parent;
		while (p)
		{
			if (p.group)
			{
				if (!this.runtime.activeGroups[p.group_name.toLowerCase()])
					return false;
			}
			p = p.parent;
		}
		return true;
	};
	cr.eventinclude = EventInclude;
	function EventStackFrame()
	{
		this.temp_parents_arr = [];
		this.reset(null);
		cr.seal(this);
	};
	EventStackFrame.prototype.reset = function (cur_event)
	{
		this.current_event = cur_event;
		this.cndindex = 0;
		this.actindex = 0;
		this.temp_parents_arr.length = 0;
		this.last_event_true = false;
		this.else_branch_ran = false;
		this.any_true_state = false;
	};
	EventStackFrame.prototype.isModifierAfterCnds = function ()
	{
		if (this.current_event.solWriterAfterCnds)
			return true;
		if (this.cndindex < this.current_event.conditions.length - 1)
			return !!this.current_event.solModifiers.length;
		return false;
	};
	cr.eventStackFrame = EventStackFrame;
}());
(function()
{
	function ExpNode(owner_, m)
	{
		this.owner = owner_;
		this.runtime = owner_.runtime;
		this.type = m[0];
;
		this.get = [this.eval_int,
					this.eval_float,
					this.eval_string,
					this.eval_unaryminus,
					this.eval_add,
					this.eval_subtract,
					this.eval_multiply,
					this.eval_divide,
					this.eval_mod,
					this.eval_power,
					this.eval_and,
					this.eval_or,
					this.eval_equal,
					this.eval_notequal,
					this.eval_less,
					this.eval_lessequal,
					this.eval_greater,
					this.eval_greaterequal,
					this.eval_conditional,
					this.eval_system_exp,
					this.eval_object_behavior_exp,
					this.eval_instvar_exp,
					this.eval_object_behavior_exp,
					this.eval_eventvar_exp][this.type];
		var paramsModel = null;
		this.value = null;
		this.first = null;
		this.second = null;
		this.third = null;
		this.func = null;
		this.results = null;
		this.parameters = null;
		this.object_type = null;
		this.beh_index = -1;
		this.instance_expr = null;
		this.varindex = -1;
		this.behavior_type = null;
		this.varname = null;
		this.eventvar = null;
		this.return_string = false;
		switch (this.type) {
		case 0:		// int
		case 1:		// float
		case 2:		// string
			this.value = m[1];
			break;
		case 3:		// unaryminus
			this.first = new cr.expNode(owner_, m[1]);
			break;
		case 18:	// conditional
			this.first = new cr.expNode(owner_, m[1]);
			this.second = new cr.expNode(owner_, m[2]);
			this.third = new cr.expNode(owner_, m[3]);
			break;
		case 19:	// system_exp
			this.func = m[1];
;
			this.results = [];
			this.parameters = [];
			if (m.length === 3)
			{
				paramsModel = m[2];
				this.results.length = paramsModel.length + 1;	// must also fit 'ret'
			}
			else
				this.results.length = 1;      // to fit 'ret'
			break;
		case 20:	// object_exp
			this.object_type = this.runtime.types_by_index[m[1]];
;
			this.beh_index = -1;
			this.func = m[2];
			this.return_string = m[3];
			if (m[4])
				this.instance_expr = new cr.expNode(owner_, m[4]);
			else
				this.instance_expr = null;
			this.results = [];
			this.parameters = [];
			if (m.length === 6)
			{
				paramsModel = m[5];
				this.results.length = paramsModel.length + 1;
			}
			else
				this.results.length = 1;	// to fit 'ret'
			break;
		case 21:		// instvar_exp
			this.object_type = this.runtime.types_by_index[m[1]];
;
			this.return_string = m[2];
			if (m[3])
				this.instance_expr = new cr.expNode(owner_, m[3]);
			else
				this.instance_expr = null;
			this.varindex = m[4];
			break;
		case 22:		// behavior_exp
			this.object_type = this.runtime.types_by_index[m[1]];
;
			this.behavior_type = this.object_type.getBehaviorByName(m[2]);
;
			this.beh_index = this.object_type.getBehaviorIndexByName(m[2]);
			this.func = m[3];
			this.return_string = m[4];
			if (m[5])
				this.instance_expr = new cr.expNode(owner_, m[5]);
			else
				this.instance_expr = null;
			this.results = [];
			this.parameters = [];
			if (m.length === 7)
			{
				paramsModel = m[6];
				this.results.length = paramsModel.length + 1;
			}
			else
				this.results.length = 1;	// to fit 'ret'
			break;
		case 23:		// eventvar_exp
			this.varname = m[1];
			this.eventvar = null;	// assigned in postInit
			break;
		}
		if (this.type >= 4 && this.type <= 17)
		{
			this.first = new cr.expNode(owner_, m[1]);
			this.second = new cr.expNode(owner_, m[2]);
		}
		if (paramsModel)
		{
			var i, len;
			for (i = 0, len = paramsModel.length; i < len; i++)
				this.parameters.push(new cr.expNode(owner_, paramsModel[i]));
		}
		cr.seal(this);
	};
	ExpNode.prototype.postInit = function ()
	{
		if (this.type === 23)	// eventvar_exp
		{
			this.eventvar = this.owner.runtime.getEventVariableByName(this.varname, this.owner.block.parent);
;
		}
		if (this.first)
			this.first.postInit();
		if (this.second)
			this.second.postInit();
		if (this.third)
			this.third.postInit();
		if (this.instance_expr)
			this.instance_expr.postInit();
		if (this.parameters)
		{
			var i, len;
			for (i = 0, len = this.parameters.length; i < len; i++)
				this.parameters[i].postInit();
		}
	};
	ExpNode.prototype.eval_system_exp = function (ret)
	{
		this.results[0] = ret;
		var temp = this.owner.pushTempValue();
		var i, len;
		for (i = 0, len = this.parameters.length; i < len; i++)
		{
			this.parameters[i].get(temp);
			this.results[i + 1] = temp.data;   // passing actual javascript value as argument instead of expvalue
		}
		this.owner.popTempValue();
		this.func.apply(this.runtime.system, this.results);
	};
	ExpNode.prototype.eval_object_behavior_exp = function (ret)
	{
		var sol = this.object_type.getCurrentSol();
		var instances = sol.getObjects();
		if (!instances.length)
		{
			if (sol.else_instances.length)
				instances = sol.else_instances;
			else
			{
				if (this.return_string)
					ret.set_string("");
				else
					ret.set_int(0);
				return;
			}
		}
		this.results[0] = ret;
		ret.object_class = this.object_type;		// so expression can access family type if need be
		var temp = this.owner.pushTempValue();
		var i, len;
		for (i = 0, len = this.parameters.length; i < len; i++) {
			this.parameters[i].get(temp);
			this.results[i + 1] = temp.data;   // passing actual javascript value as argument instead of expvalue
		}
		var index = this.owner.solindex;
		if (this.instance_expr) {
			this.instance_expr.get(temp);
			if (temp.is_number()) {
				index = temp.data;
				instances = this.object_type.instances;    // pick from all instances, not SOL
			}
		}
		this.owner.popTempValue();
		index %= instances.length;      // wraparound
		if (index < 0)
			index += instances.length;
		var returned_val;
		var inst = instances[index];
		if (this.beh_index > -1)
		{
			var offset = 0;
			if (this.object_type.is_family)
			{
				offset = inst.type.family_beh_map[this.object_type.family_index];
			}
			returned_val = this.func.apply(inst.behavior_insts[this.beh_index + offset], this.results);
		}
		else
			returned_val = this.func.apply(inst, this.results);
;
	};
	ExpNode.prototype.eval_instvar_exp = function (ret)
	{
		var sol = this.object_type.getCurrentSol();
		var instances = sol.getObjects();
		if (!instances.length)
		{
			if (sol.else_instances.length)
				instances = sol.else_instances;
			else
			{
				if (this.return_string)
					ret.set_string("");
				else
					ret.set_int(0);
				return;
			}
		}
		var index = this.owner.solindex;
		if (this.instance_expr)
		{
			var temp = this.owner.pushTempValue();
			this.instance_expr.get(temp);
			if (temp.is_number())
			{
				index = temp.data;
				var type_instances = this.object_type.instances;
				index %= type_instances.length;     // wraparound
				if (index < 0)                      // offset
					index += type_instances.length;
				var to_ret = type_instances[index].instance_vars[this.varindex];
				if (cr.is_string(to_ret))
					ret.set_string(to_ret);
				else
					ret.set_float(to_ret);
				this.owner.popTempValue();
				return;         // done
			}
			this.owner.popTempValue();
		}
		index %= instances.length;      // wraparound
		if (index < 0)
			index += instances.length;
		var inst = instances[index];
		var offset = 0;
		if (this.object_type.is_family)
		{
			offset = inst.type.family_var_map[this.object_type.family_index];
		}
		var to_ret = inst.instance_vars[this.varindex + offset];
		if (cr.is_string(to_ret))
			ret.set_string(to_ret);
		else
			ret.set_float(to_ret);
	};
	ExpNode.prototype.eval_int = function (ret)
	{
		ret.type = cr.exptype.Integer;
		ret.data = this.value;
	};
	ExpNode.prototype.eval_float = function (ret)
	{
		ret.type = cr.exptype.Float;
		ret.data = this.value;
	};
	ExpNode.prototype.eval_string = function (ret)
	{
		ret.type = cr.exptype.String;
		ret.data = this.value;
	};
	ExpNode.prototype.eval_unaryminus = function (ret)
	{
		this.first.get(ret);                // retrieve operand
		if (ret.is_number())
			ret.data = -ret.data;
	};
	ExpNode.prototype.eval_add = function (ret)
	{
		this.first.get(ret);                // left operand
		var temp = this.owner.pushTempValue();
		this.second.get(temp);			// right operand
		if (ret.is_number() && temp.is_number())
		{
			ret.data += temp.data;          // both operands numbers: add
			if (temp.is_float())
				ret.make_float();
		}
		this.owner.popTempValue();
	};
	ExpNode.prototype.eval_subtract = function (ret)
	{
		this.first.get(ret);                // left operand
		var temp = this.owner.pushTempValue();
		this.second.get(temp);			// right operand
		if (ret.is_number() && temp.is_number())
		{
			ret.data -= temp.data;          // both operands numbers: subtract
			if (temp.is_float())
				ret.make_float();
		}
		this.owner.popTempValue();
	};
	ExpNode.prototype.eval_multiply = function (ret)
	{
		this.first.get(ret);                // left operand
		var temp = this.owner.pushTempValue();
		this.second.get(temp);			// right operand
		if (ret.is_number() && temp.is_number())
		{
			ret.data *= temp.data;          // both operands numbers: multiply
			if (temp.is_float())
				ret.make_float();
		}
		this.owner.popTempValue();
	};
	ExpNode.prototype.eval_divide = function (ret)
	{
		this.first.get(ret);                // left operand
		var temp = this.owner.pushTempValue();
		this.second.get(temp);			// right operand
		if (ret.is_number() && temp.is_number())
		{
			ret.data /= temp.data;          // both operands numbers: divide
			ret.make_float();
		}
		this.owner.popTempValue();
	};
	ExpNode.prototype.eval_mod = function (ret)
	{
		this.first.get(ret);                // left operand
		var temp = this.owner.pushTempValue();
		this.second.get(temp);			// right operand
		if (ret.is_number() && temp.is_number())
		{
			ret.data %= temp.data;          // both operands numbers: modulo
			if (temp.is_float())
				ret.make_float();
		}
		this.owner.popTempValue();
	};
	ExpNode.prototype.eval_power = function (ret)
	{
		this.first.get(ret);                // left operand
		var temp = this.owner.pushTempValue();
		this.second.get(temp);			// right operand
		if (ret.is_number() && temp.is_number())
		{
			ret.data = Math.pow(ret.data, temp.data);   // both operands numbers: raise to power
			if (temp.is_float())
				ret.make_float();
		}
		this.owner.popTempValue();
	};
	ExpNode.prototype.eval_and = function (ret)
	{
		this.first.get(ret);                // left operand
		var temp = this.owner.pushTempValue();
		this.second.get(temp);			// right operand
		if (ret.is_number())
		{
			if (temp.is_string())
			{
				ret.set_string(ret.data.toString() + temp.data);
			}
			else
			{
				if (ret.data && temp.data)
					ret.set_int(1);
				else
					ret.set_int(0);
			}
		}
		else if (ret.is_string())
		{
			if (temp.is_string())
				ret.data += temp.data;
			else
			{
				ret.data += (Math.round(temp.data * 1e10) / 1e10).toString();
			}
		}
		this.owner.popTempValue();
	};
	ExpNode.prototype.eval_or = function (ret)
	{
		this.first.get(ret);                // left operand
		var temp = this.owner.pushTempValue();
		this.second.get(temp);			// right operand
		if (ret.is_number() && temp.is_number())
		{
			if (ret.data || temp.data)
				ret.set_int(1);
			else
				ret.set_int(0);
		}
		this.owner.popTempValue();
	};
	ExpNode.prototype.eval_conditional = function (ret)
	{
		this.first.get(ret);                // condition operand
		if (ret.data)                       // is true
			this.second.get(ret);           // evaluate second operand to ret
		else
			this.third.get(ret);            // evaluate third operand to ret
	};
	ExpNode.prototype.eval_equal = function (ret)
	{
		this.first.get(ret);                // left operand
		var temp = this.owner.pushTempValue();
		this.second.get(temp);			// right operand
		ret.set_int(ret.data === temp.data ? 1 : 0);
		this.owner.popTempValue();
	};
	ExpNode.prototype.eval_notequal = function (ret)
	{
		this.first.get(ret);                // left operand
		var temp = this.owner.pushTempValue();
		this.second.get(temp);			// right operand
		ret.set_int(ret.data !== temp.data ? 1 : 0);
		this.owner.popTempValue();
	};
	ExpNode.prototype.eval_less = function (ret)
	{
		this.first.get(ret);                // left operand
		var temp = this.owner.pushTempValue();
		this.second.get(temp);			// right operand
		ret.set_int(ret.data < temp.data ? 1 : 0);
		this.owner.popTempValue();
	};
	ExpNode.prototype.eval_lessequal = function (ret)
	{
		this.first.get(ret);                // left operand
		var temp = this.owner.pushTempValue();
		this.second.get(temp);			// right operand
		ret.set_int(ret.data <= temp.data ? 1 : 0);
		this.owner.popTempValue();
	};
	ExpNode.prototype.eval_greater = function (ret)
	{
		this.first.get(ret);                // left operand
		var temp = this.owner.pushTempValue();
		this.second.get(temp);			// right operand
		ret.set_int(ret.data > temp.data ? 1 : 0);
		this.owner.popTempValue();
	};
	ExpNode.prototype.eval_greaterequal = function (ret)
	{
		this.first.get(ret);                // left operand
		var temp = this.owner.pushTempValue();
		this.second.get(temp);			// right operand
		ret.set_int(ret.data >= temp.data ? 1 : 0);
		this.owner.popTempValue();
	};
	ExpNode.prototype.eval_eventvar_exp = function (ret)
	{
		var val = this.eventvar.getValue();
		if (cr.is_number(val))
			ret.set_float(val);
		else
			ret.set_string(val);
	};
	cr.expNode = ExpNode;
	function ExpValue(type, data)
	{
		this.type = type || cr.exptype.Integer;
		this.data = data || 0;
		this.object_class = null;
;
;
;
		if (this.type == cr.exptype.Integer)
			this.data = Math.floor(this.data);
		cr.seal(this);
	};
	ExpValue.prototype.is_int = function ()
	{
		return this.type === cr.exptype.Integer;
	};
	ExpValue.prototype.is_float = function ()
	{
		return this.type === cr.exptype.Float;
	};
	ExpValue.prototype.is_number = function ()
	{
		return this.type === cr.exptype.Integer || this.type === cr.exptype.Float;
	};
	ExpValue.prototype.is_string = function ()
	{
		return this.type === cr.exptype.String;
	};
	ExpValue.prototype.make_int = function ()
	{
		if (!this.is_int())
		{
			if (this.is_float())
				this.data = Math.floor(this.data);      // truncate float
			else if (this.is_string())
				this.data = parseInt(this.data, 10);
			this.type = cr.exptype.Integer;
		}
	};
	ExpValue.prototype.make_float = function ()
	{
		if (!this.is_float())
		{
			if (this.is_string())
				this.data = parseFloat(this.data);
			this.type = cr.exptype.Float;
		}
	};
	ExpValue.prototype.make_string = function ()
	{
		if (!this.is_string())
		{
			this.data = this.data.toString();
			this.type = cr.exptype.String;
		}
	};
	ExpValue.prototype.set_int = function (val)
	{
;
		this.type = cr.exptype.Integer;
		this.data = Math.floor(val);
	};
	ExpValue.prototype.set_float = function (val)
	{
;
		this.type = cr.exptype.Float;
		this.data = val;
	};
	ExpValue.prototype.set_string = function (val)
	{
;
		this.type = cr.exptype.String;
		this.data = val;
	};
	ExpValue.prototype.set_any = function (val)
	{
		if (cr.is_number(val))
		{
			this.type = cr.exptype.Float;
			this.data = val;
		}
		else if (cr.is_string(val))
		{
			this.type = cr.exptype.String;
			this.data = val.toString();
		}
		else
		{
			this.type = cr.exptype.Integer;
			this.data = 0;
		}
	};
	cr.expvalue = ExpValue;
	cr.exptype = {
		Integer: 0,     // emulated; no native integer support in javascript
		Float: 1,
		String: 2
	};
}());
;
cr.system_object = function (runtime)
{
    this.runtime = runtime;
	this.waits = [];
};
cr.system_object.prototype.saveToJSON = function ()
{
	var o = {};
	var i, len, j, lenj, p, w, t, sobj;
	o["waits"] = [];
	var owaits = o["waits"];
	var waitobj;
	for (i = 0, len = this.waits.length; i < len; i++)
	{
		w = this.waits[i];
		waitobj = {
			"t": w.time,
			"ev": w.ev.sid,
			"sm": [],
			"sols": {}
		};
		if (w.ev.actions[w.actindex])
			waitobj["act"] = w.ev.actions[w.actindex].sid;
		for (j = 0, lenj = w.solModifiers.length; j < lenj; j++)
			waitobj["sm"].push(w.solModifiers[j].sid);
		for (p in w.sols)
		{
			if (w.sols.hasOwnProperty(p))
			{
				t = this.runtime.types_by_index[parseInt(p, 10)];
;
				sobj = {
					"sa": w.sols[p].sa,
					"insts": []
				};
				for (j = 0, lenj = w.sols[p].insts.length; j < lenj; j++)
					sobj["insts"].push(w.sols[p].insts[j].uid);
				waitobj["sols"][t.sid.toString()] = sobj;
			}
		}
		owaits.push(waitobj);
	}
	return o;
};
cr.system_object.prototype.loadFromJSON = function (o)
{
	var owaits = o["waits"];
	var i, len, j, lenj, p, w, addWait, e, aindex, t, savedsol, nusol, inst;
	this.waits.length = 0;
	for (i = 0, len = owaits.length; i < len; i++)
	{
		w = owaits[i];
		e = this.runtime.blocksBySid[w["ev"].toString()];
		if (!e)
			continue;	// event must've gone missing
		aindex = -1;
		for (j = 0, lenj = e.actions.length; j < lenj; j++)
		{
			if (e.actions[j].sid === w["act"])
			{
				aindex = j;
				break;
			}
		}
		if (aindex === -1)
			continue;	// action must've gone missing
		addWait = {};
		addWait.sols = {};
		addWait.solModifiers = [];
		addWait.deleteme = false;
		addWait.time = w["t"];
		addWait.ev = e;
		addWait.actindex = aindex;
		for (j = 0, lenj = w["sm"].length; j < lenj; j++)
		{
			t = this.runtime.getObjectTypeBySid(w["sm"][j]);
			if (t)
				addWait.solModifiers.push(t);
		}
		for (p in w["sols"])
		{
			if (w["sols"].hasOwnProperty(p))
			{
				t = this.runtime.getObjectTypeBySid(parseInt(p, 10));
				if (!t)
					continue;		// type must've been deleted
				savedsol = w["sols"][p];
				nusol = {
					sa: savedsol["sa"],
					insts: []
				};
				for (j = 0, lenj = savedsol["insts"].length; j < lenj; j++)
				{
					inst = this.runtime.getObjectByUID(savedsol["insts"][j]);
					if (inst)
						nusol.insts.push(inst);
				}
				addWait.sols[t.index.toString()] = nusol;
			}
		}
		this.waits.push(addWait);
	}
};
(function ()
{
	var sysProto = cr.system_object.prototype;
	function SysCnds() {};
    SysCnds.prototype.EveryTick = function()
    {
        return true;
    };
    SysCnds.prototype.OnLayoutStart = function()
    {
        return true;
    };
    SysCnds.prototype.OnLayoutEnd = function()
    {
        return true;
    };
    SysCnds.prototype.Compare = function(x, cmp, y)
    {
        return cr.do_cmp(x, cmp, y);
    };
    SysCnds.prototype.CompareTime = function (cmp, t)
    {
        var elapsed = this.runtime.kahanTime.sum;
        if (cmp === 0)
        {
            var cnd = this.runtime.getCurrentCondition();
            if (!cnd.extra.CompareTime_executed)
            {
                if (elapsed >= t)
                {
                    cnd.extra.CompareTime_executed = true;
                    return true;
                }
            }
            return false;
        }
        return cr.do_cmp(elapsed, cmp, t);
    };
    SysCnds.prototype.LayerVisible = function (layer)
    {
        if (!layer)
            return false;
        else
            return layer.visible;
    };
	SysCnds.prototype.LayerCmpOpacity = function (layer, cmp, opacity_)
	{
		if (!layer)
			return false;
		return cr.do_cmp(layer.opacity * 100, cmp, opacity_);
	};
    SysCnds.prototype.Repeat = function (count)
    {
		var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
        var current_loop = this.runtime.pushLoopStack();
        var i;
		if (solModifierAfterCnds)
		{
			for (i = 0; i < count && !current_loop.stopped; i++)
			{
				this.runtime.pushCopySol(current_event.solModifiers);
				current_loop.index = i;
				current_event.retrigger();
				this.runtime.popSol(current_event.solModifiers);
			}
		}
		else
		{
			for (i = 0; i < count && !current_loop.stopped; i++)
			{
				current_loop.index = i;
				current_event.retrigger();
			}
		}
        this.runtime.popLoopStack();
		return false;
    };
	SysCnds.prototype.While = function (count)
    {
		var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
        var current_loop = this.runtime.pushLoopStack();
        var i;
		if (solModifierAfterCnds)
		{
			for (i = 0; !current_loop.stopped; i++)
			{
				this.runtime.pushCopySol(current_event.solModifiers);
				current_loop.index = i;
				if (!current_event.retrigger())		// one of the other conditions returned false
					current_loop.stopped = true;	// break
				this.runtime.popSol(current_event.solModifiers);
			}
		}
		else
		{
			for (i = 0; !current_loop.stopped; i++)
			{
				current_loop.index = i;
				if (!current_event.retrigger())
					current_loop.stopped = true;
			}
		}
        this.runtime.popLoopStack();
		return false;
    };
    SysCnds.prototype.For = function (name, start, end)
    {
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
        var current_loop = this.runtime.pushLoopStack(name);
        var i;
		if (end < start)
		{
			if (solModifierAfterCnds)
			{
				for (i = start; i >= end && !current_loop.stopped; --i)  // inclusive to end
				{
					this.runtime.pushCopySol(current_event.solModifiers);
					current_loop.index = i;
					current_event.retrigger();
					this.runtime.popSol(current_event.solModifiers);
				}
			}
			else
			{
				for (i = start; i >= end && !current_loop.stopped; --i)  // inclusive to end
				{
					current_loop.index = i;
					current_event.retrigger();
				}
			}
		}
		else
		{
			if (solModifierAfterCnds)
			{
				for (i = start; i <= end && !current_loop.stopped; ++i)  // inclusive to end
				{
					this.runtime.pushCopySol(current_event.solModifiers);
					current_loop.index = i;
					current_event.retrigger();
					this.runtime.popSol(current_event.solModifiers);
				}
			}
			else
			{
				for (i = start; i <= end && !current_loop.stopped; ++i)  // inclusive to end
				{
					current_loop.index = i;
					current_event.retrigger();
				}
			}
		}
        this.runtime.popLoopStack();
		return false;
    };
	var foreach_instancestack = [];
	var foreach_instanceptr = -1;
    SysCnds.prototype.ForEach = function (obj)
    {
        var sol = obj.getCurrentSol();
		foreach_instanceptr++;
		if (foreach_instancestack.length === foreach_instanceptr)
			foreach_instancestack.push([]);
		var instances = foreach_instancestack[foreach_instanceptr];
		cr.shallowAssignArray(instances, sol.getObjects());
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
        var current_loop = this.runtime.pushLoopStack();
        var i, len, j, lenj, inst, s, sol2;
		var is_contained = obj.is_contained;
		if (solModifierAfterCnds)
		{
			for (i = 0, len = instances.length; i < len && !current_loop.stopped; i++)
			{
				this.runtime.pushCopySol(current_event.solModifiers);
				inst = instances[i];
				sol = obj.getCurrentSol();
				sol.select_all = false;
				sol.instances.length = 1;
				sol.instances[0] = inst;
				if (is_contained)
				{
					for (j = 0, lenj = inst.siblings.length; j < lenj; j++)
					{
						s = inst.siblings[j];
						sol2 = s.type.getCurrentSol();
						sol2.select_all = false;
						sol2.instances.length = 1;
						sol2.instances[0] = s;
					}
				}
				current_loop.index = i;
				current_event.retrigger();
				this.runtime.popSol(current_event.solModifiers);
			}
		}
		else
		{
			sol.select_all = false;
			sol.instances.length = 1;
			for (i = 0, len = instances.length; i < len && !current_loop.stopped; i++)
			{
				inst = instances[i];
				sol.instances[0] = inst;
				if (is_contained)
				{
					for (j = 0, lenj = inst.siblings.length; j < lenj; j++)
					{
						s = inst.siblings[j];
						sol2 = s.type.getCurrentSol();
						sol2.select_all = false;
						sol2.instances.length = 1;
						sol2.instances[0] = s;
					}
				}
				current_loop.index = i;
				current_event.retrigger();
			}
		}
		instances.length = 0;
        this.runtime.popLoopStack();
		foreach_instanceptr--;
		return false;
    };
	function foreach_sortinstances(a, b)
	{
		var va = a.extra.c2_foreachordered_val;
		var vb = b.extra.c2_foreachordered_val;
		if (cr.is_number(va) && cr.is_number(vb))
			return va - vb;
		else
		{
			va = "" + va;
			vb = "" + vb;
			if (va < vb)
				return -1;
			else if (va > vb)
				return 1;
			else
				return 0;
		}
	};
	SysCnds.prototype.ForEachOrdered = function (obj, exp, order)
    {
        var sol = obj.getCurrentSol();
		foreach_instanceptr++;
		if (foreach_instancestack.length === foreach_instanceptr)
			foreach_instancestack.push([]);
		var instances = foreach_instancestack[foreach_instanceptr];
		cr.shallowAssignArray(instances, sol.getObjects());
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var current_condition = this.runtime.getCurrentCondition();
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
        var current_loop = this.runtime.pushLoopStack();
		var i, len, j, lenj, inst, s, sol2;
		for (i = 0, len = instances.length; i < len; i++)
		{
			instances[i].extra.c2_foreachordered_val = current_condition.parameters[1].get(i);
		}
		instances.sort(foreach_sortinstances);
		if (order === 1)
			instances.reverse();
		var is_contained = obj.is_contained;
		if (solModifierAfterCnds)
		{
			for (i = 0, len = instances.length; i < len && !current_loop.stopped; i++)
			{
				this.runtime.pushCopySol(current_event.solModifiers);
				inst = instances[i];
				sol = obj.getCurrentSol();
				sol.select_all = false;
				sol.instances.length = 1;
				sol.instances[0] = inst;
				if (is_contained)
				{
					for (j = 0, lenj = inst.siblings.length; j < lenj; j++)
					{
						s = inst.siblings[j];
						sol2 = s.type.getCurrentSol();
						sol2.select_all = false;
						sol2.instances.length = 1;
						sol2.instances[0] = s;
					}
				}
				current_loop.index = i;
				current_event.retrigger();
				this.runtime.popSol(current_event.solModifiers);
			}
		}
		else
		{
			sol.select_all = false;
			sol.instances.length = 1;
			for (i = 0, len = instances.length; i < len && !current_loop.stopped; i++)
			{
				inst = instances[i];
				sol.instances[0] = inst;
				if (is_contained)
				{
					for (j = 0, lenj = inst.siblings.length; j < lenj; j++)
					{
						s = inst.siblings[j];
						sol2 = s.type.getCurrentSol();
						sol2.select_all = false;
						sol2.instances.length = 1;
						sol2.instances[0] = s;
					}
				}
				current_loop.index = i;
				current_event.retrigger();
			}
		}
		instances.length = 0;
        this.runtime.popLoopStack();
		foreach_instanceptr--;
		return false;
    };
	SysCnds.prototype.PickByComparison = function (obj_, exp_, cmp_, val_)
	{
		var i, len, k, inst;
		if (!obj_)
			return;
		foreach_instanceptr++;
		if (foreach_instancestack.length === foreach_instanceptr)
			foreach_instancestack.push([]);
		var tmp_instances = foreach_instancestack[foreach_instanceptr];
		var sol = obj_.getCurrentSol();
		cr.shallowAssignArray(tmp_instances, sol.getObjects());
		if (sol.select_all)
			sol.else_instances.length = 0;
		var current_condition = this.runtime.getCurrentCondition();
		for (i = 0, k = 0, len = tmp_instances.length; i < len; i++)
		{
			inst = tmp_instances[i];
			tmp_instances[k] = inst;
			exp_ = current_condition.parameters[1].get(i);
			val_ = current_condition.parameters[3].get(i);
			if (cr.do_cmp(exp_, cmp_, val_))
			{
				k++;
			}
			else
			{
				sol.else_instances.push(inst);
			}
		}
		tmp_instances.length = k;
		sol.select_all = false;
		cr.shallowAssignArray(sol.instances, tmp_instances);
		tmp_instances.length = 0;
		foreach_instanceptr--;
		obj_.applySolToContainer();
		return !!sol.instances.length;
	};
	SysCnds.prototype.PickByEvaluate = function (obj_, exp_)
	{
		var i, len, k, inst;
		if (!obj_)
			return;
		foreach_instanceptr++;
		if (foreach_instancestack.length === foreach_instanceptr)
			foreach_instancestack.push([]);
		var tmp_instances = foreach_instancestack[foreach_instanceptr];
		var sol = obj_.getCurrentSol();
		cr.shallowAssignArray(tmp_instances, sol.getObjects());
		if (sol.select_all)
			sol.else_instances.length = 0;
		var current_condition = this.runtime.getCurrentCondition();
		for (i = 0, k = 0, len = tmp_instances.length; i < len; i++)
		{
			inst = tmp_instances[i];
			tmp_instances[k] = inst;
			exp_ = current_condition.parameters[1].get(i);
			if (exp_)
			{
				k++;
			}
			else
			{
				sol.else_instances.push(inst);
			}
		}
		tmp_instances.length = k;
		sol.select_all = false;
		cr.shallowAssignArray(sol.instances, tmp_instances);
		tmp_instances.length = 0;
		foreach_instanceptr--;
		obj_.applySolToContainer();
		return !!sol.instances.length;
	};
    SysCnds.prototype.TriggerOnce = function ()
    {
        var cndextra = this.runtime.getCurrentCondition().extra;
		if (typeof cndextra.TriggerOnce_lastTick === "undefined")
			cndextra.TriggerOnce_lastTick = -1;
        var last_tick = cndextra.TriggerOnce_lastTick;
        var cur_tick = this.runtime.tickcount;
        cndextra.TriggerOnce_lastTick = cur_tick;
        return this.runtime.layout_first_tick || last_tick !== cur_tick - 1;
    };
    SysCnds.prototype.Every = function (seconds)
    {
        var cnd = this.runtime.getCurrentCondition();
        var last_time = cnd.extra.Every_lastTime || 0;
        var cur_time = this.runtime.kahanTime.sum;
		if (typeof cnd.extra.Every_seconds === "undefined")
			cnd.extra.Every_seconds = seconds;
		var this_seconds = cnd.extra.Every_seconds;
        if (cur_time >= last_time + this_seconds)
        {
            cnd.extra.Every_lastTime = last_time + this_seconds;
			if (cur_time >= cnd.extra.Every_lastTime + 0.04)
			{
				cnd.extra.Every_lastTime = cur_time;
			}
			cnd.extra.Every_seconds = seconds;
            return true;
        }
        else
            return false;
    };
    SysCnds.prototype.PickNth = function (obj, index)
    {
        if (!obj)
            return false;
        var sol = obj.getCurrentSol();
        var instances = sol.getObjects();
		index = cr.floor(index);
        if (index < 0 || index >= instances.length)
            return false;
		var inst = instances[index];
        sol.pick_one(inst);
		obj.applySolToContainer();
        return true;
    };
	SysCnds.prototype.PickRandom = function (obj)
    {
        if (!obj)
            return false;
        var sol = obj.getCurrentSol();
        var instances = sol.getObjects();
		var index = cr.floor(Math.random() * instances.length);
        if (index >= instances.length)
            return false;
		var inst = instances[index];
        sol.pick_one(inst);
		obj.applySolToContainer();
        return true;
    };
	SysCnds.prototype.CompareVar = function (v, cmp, val)
    {
        return cr.do_cmp(v.getValue(), cmp, val);
    };
    SysCnds.prototype.IsGroupActive = function (group)
    {
        return this.runtime.activeGroups[(/*this.runtime.getCurrentCondition().sheet.name + "|" + */group).toLowerCase()];
    };
	SysCnds.prototype.IsPreview = function ()
	{
		return typeof cr_is_preview !== "undefined";
	};
	SysCnds.prototype.PickAll = function (obj)
    {
        if (!obj)
            return false;
		if (!obj.instances.length)
			return false;
        var sol = obj.getCurrentSol();
        sol.select_all = true;
		obj.applySolToContainer();
        return true;
    };
	SysCnds.prototype.IsMobile = function ()
	{
		return this.runtime.isMobile;
	};
	SysCnds.prototype.CompareBetween = function (x, a, b)
	{
		return x >= a && x <= b;
	};
	SysCnds.prototype.Else = function ()
	{
		var current_frame = this.runtime.getCurrentEventStack();
		if (current_frame.else_branch_ran)
			return false;		// another event in this else-if chain has run
		else
			return !current_frame.last_event_true;
		/*
		var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var prev_event = current_event.prev_block;
		if (!prev_event)
			return false;
		if (prev_event.is_logical)
			return !this.runtime.last_event_true;
		var i, len, j, lenj, s, sol, temp, inst, any_picked = false;
		for (i = 0, len = prev_event.cndReferences.length; i < len; i++)
		{
			s = prev_event.cndReferences[i];
			sol = s.getCurrentSol();
			if (sol.select_all || sol.instances.length === s.instances.length)
			{
				sol.select_all = false;
				sol.instances.length = 0;
			}
			else
			{
				if (sol.instances.length === 1 && sol.else_instances.length === 0 && s.instances.length >= 2)
				{
					inst = sol.instances[0];
					sol.instances.length = 0;
					for (j = 0, lenj = s.instances.length; j < lenj; j++)
					{
						if (s.instances[j] != inst)
							sol.instances.push(s.instances[j]);
					}
					any_picked = true;
				}
				else
				{
					temp = sol.instances;
					sol.instances = sol.else_instances;
					sol.else_instances = temp;
					any_picked = true;
				}
			}
		}
		return any_picked;
		*/
	};
	SysCnds.prototype.OnLoadFinished = function ()
	{
		return true;
	};
	SysCnds.prototype.OnCanvasSnapshot = function ()
	{
		return true;
	};
	SysCnds.prototype.EffectsSupported = function ()
	{
		return !!this.runtime.glwrap;
	};
	SysCnds.prototype.OnSaveComplete = function ()
	{
		return true;
	};
	SysCnds.prototype.OnLoadComplete = function ()
	{
		return true;
	};
	SysCnds.prototype.OnLoadFailed = function ()
	{
		return true;
	};
	SysCnds.prototype.ObjectUIDExists = function (u)
	{
		return !!this.runtime.getObjectByUID(u);
	};
	SysCnds.prototype.IsOnPlatform = function (p)
	{
		var rt = this.runtime;
		switch (p) {
		case 0:		// HTML5 website
			return !rt.isDomFree && !rt.isNodeWebkit && !rt.isPhoneGap && !rt.isCrosswalk && !rt.isWindows8App && !rt.isWindowsPhone8 && !rt.isBlackberry10 && !rt.isAmazonWebApp;
		case 1:		// iOS
			return rt.isiOS;
		case 2:		// Android
			return rt.isAndroid;
		case 3:		// Windows 8
			return rt.isWindows8App;
		case 4:		// Windows Phone 8
			return rt.isWindowsPhone8;
		case 5:		// Blackberry 10
			return rt.isBlackberry10;
		case 6:		// Tizen
			return rt.isTizen;
		case 7:		// CocoonJS
			return rt.isCocoonJs;
		case 8:		// PhoneGap
			return rt.isPhoneGap;
		case 9:	// Scirra Arcade
			return rt.isArcade;
		case 10:	// node-webkit
			return rt.isNodeWebkit;
		case 11:	// crosswalk
			return rt.isCrosswalk;
		case 12:	// amazon webapp
			return rt.isAmazonWebApp;
		default:	// should not be possible
			return false;
		}
	};
	var cacheRegex = null;
	var lastRegex = "";
	var lastFlags = "";
	function getRegex(regex_, flags_)
	{
		if (!cacheRegex || regex_ !== lastRegex || flags_ !== lastFlags)
		{
			cacheRegex = new RegExp(regex_, flags_);
			lastRegex = regex_;
			lastFlags = flags_;
		}
		cacheRegex.lastIndex = 0;		// reset
		return cacheRegex;
	};
	SysCnds.prototype.RegexTest = function (str_, regex_, flags_)
	{
		var regex = getRegex(regex_, flags_);
		return regex.test(str_);
	};
	var tmp_arr = [];
	SysCnds.prototype.PickOverlappingPoint = function (obj_, x_, y_)
	{
		if (!obj_)
            return false;
        var sol = obj_.getCurrentSol();
        var instances = sol.getObjects();
		var current_event = this.runtime.getCurrentEventStack().current_event;
		var orblock = current_event.orblock;
		var cnd = this.runtime.getCurrentCondition();
		var i, len, inst, pick;
		if (sol.select_all)
		{
			cr.shallowAssignArray(tmp_arr, instances);
			sol.else_instances.length = 0;
			sol.select_all = false;
			sol.instances.length = 0;
		}
		else
		{
			if (orblock)
			{
				cr.shallowAssignArray(tmp_arr, sol.else_instances);
				sol.else_instances.length = 0;
			}
			else
			{
				cr.shallowAssignArray(tmp_arr, instances);
				sol.instances.length = 0;
			}
		}
		for (i = 0, len = tmp_arr.length; i < len; ++i)
		{
			inst = tmp_arr[i];
			pick = cr.xor(inst.contains_pt(x_, y_), cnd.inverted);
			if (pick)
				sol.instances.push(inst);
			else
				sol.else_instances.push(inst);
		}
		obj_.applySolToContainer();
		return cr.xor(!!sol.instances.length, cnd.inverted);
	};
	sysProto.cnds = new SysCnds();
    function SysActs() {};
    SysActs.prototype.GoToLayout = function(to)
    {
		if (this.runtime.isloading)
			return;		// cannot change layout while loading on loader layout
		if (this.runtime.changelayout)
			return;		// already changing to a different layout
;
        this.runtime.changelayout = to;
    };
    SysActs.prototype.CreateObject = function (obj, layer, x, y)
    {
        if (!layer || !obj)
            return;
        var inst = this.runtime.createInstance(obj, layer, x, y);
		if (!inst)
			return;
		this.runtime.isInOnDestroy++;
		var i, len, s;
		this.runtime.trigger(Object.getPrototypeOf(obj.plugin).cnds.OnCreated, inst);
		if (inst.is_contained)
		{
			for (i = 0, len = inst.siblings.length; i < len; i++)
			{
				s = inst.siblings[i];
				this.runtime.trigger(Object.getPrototypeOf(s.type.plugin).cnds.OnCreated, s);
			}
		}
		this.runtime.isInOnDestroy--;
        var sol = obj.getCurrentSol();
        sol.select_all = false;
		sol.instances.length = 1;
		sol.instances[0] = inst;
		if (inst.is_contained)
		{
			for (i = 0, len = inst.siblings.length; i < len; i++)
			{
				s = inst.siblings[i];
				sol = s.type.getCurrentSol();
				sol.select_all = false;
				sol.instances.length = 1;
				sol.instances[0] = s;
			}
		}
    };
    SysActs.prototype.SetLayerVisible = function (layer, visible_)
    {
        if (!layer)
            return;
		if (layer.visible !== visible_)
		{
			layer.visible = visible_;
			this.runtime.redraw = true;
		}
    };
	SysActs.prototype.SetLayerOpacity = function (layer, opacity_)
	{
		if (!layer)
			return;
		opacity_ = cr.clamp(opacity_ / 100, 0, 1);
		if (layer.opacity !== opacity_)
		{
			layer.opacity = opacity_;
			this.runtime.redraw = true;
		}
	};
	SysActs.prototype.SetLayerScaleRate = function (layer, sr)
	{
		if (!layer)
			return;
		if (layer.zoomRate !== sr)
		{
			layer.zoomRate = sr;
			this.runtime.redraw = true;
		}
	};
	SysActs.prototype.SetLayoutScale = function (s)
	{
		if (!this.runtime.running_layout)
			return;
		if (this.runtime.running_layout.scale !== s)
		{
			this.runtime.running_layout.scale = s;
			this.runtime.running_layout.boundScrolling();
			this.runtime.redraw = true;
		}
	};
    SysActs.prototype.ScrollX = function(x)
    {
        this.runtime.running_layout.scrollToX(x);
    };
    SysActs.prototype.ScrollY = function(y)
    {
        this.runtime.running_layout.scrollToY(y);
    };
    SysActs.prototype.Scroll = function(x, y)
    {
        this.runtime.running_layout.scrollToX(x);
        this.runtime.running_layout.scrollToY(y);
    };
    SysActs.prototype.ScrollToObject = function(obj)
    {
        var inst = obj.getFirstPicked();
        if (inst)
        {
            this.runtime.running_layout.scrollToX(inst.x);
            this.runtime.running_layout.scrollToY(inst.y);
        }
    };
	SysActs.prototype.SetVar = function(v, x)
	{
;
		if (v.vartype === 0)
		{
			if (cr.is_number(x))
				v.setValue(x);
			else
				v.setValue(parseFloat(x));
		}
		else if (v.vartype === 1)
			v.setValue(x.toString());
	};
	SysActs.prototype.AddVar = function(v, x)
	{
;
		if (v.vartype === 0)
		{
			if (cr.is_number(x))
				v.setValue(v.getValue() + x);
			else
				v.setValue(v.getValue() + parseFloat(x));
		}
		else if (v.vartype === 1)
			v.setValue(v.getValue() + x.toString());
	};
	SysActs.prototype.SubVar = function(v, x)
	{
;
		if (v.vartype === 0)
		{
			if (cr.is_number(x))
				v.setValue(v.getValue() - x);
			else
				v.setValue(v.getValue() - parseFloat(x));
		}
	};
    SysActs.prototype.SetGroupActive = function (group, active)
    {
		var activeGroups = this.runtime.activeGroups;
		var groupkey = (/*this.runtime.getCurrentAction().sheet.name + "|" + */group).toLowerCase();
		switch (active) {
		case 0:
			activeGroups[groupkey] = false;
			break;
		case 1:
			activeGroups[groupkey] = true;
			break;
		case 2:
			activeGroups[groupkey] = !activeGroups[groupkey];
			break;
		}
    };
    SysActs.prototype.SetTimescale = function (ts_)
    {
        var ts = ts_;
        if (ts < 0)
            ts = 0;
        this.runtime.timescale = ts;
    };
    SysActs.prototype.SetObjectTimescale = function (obj, ts_)
    {
        var ts = ts_;
        if (ts < 0)
            ts = 0;
        if (!obj)
            return;
        var sol = obj.getCurrentSol();
        var instances = sol.getObjects();
        var i, len;
        for (i = 0, len = instances.length; i < len; i++)
        {
            instances[i].my_timescale = ts;
        }
    };
    SysActs.prototype.RestoreObjectTimescale = function (obj)
    {
        if (!obj)
            return false;
        var sol = obj.getCurrentSol();
        var instances = sol.getObjects();
        var i, len;
        for (i = 0, len = instances.length; i < len; i++)
        {
            instances[i].my_timescale = -1.0;
        }
    };
	var waitobjrecycle = [];
	function allocWaitObject()
	{
		var w;
		if (waitobjrecycle.length)
			w = waitobjrecycle.pop();
		else
		{
			w = {};
			w.sols = {};
			w.solModifiers = [];
		}
		w.deleteme = false;
		return w;
	};
	function freeWaitObject(w)
	{
		cr.wipe(w.sols);
		w.solModifiers.length = 0;
		waitobjrecycle.push(w);
	};
	var solstateobjects = [];
	function allocSolStateObject()
	{
		var s;
		if (solstateobjects.length)
			s = solstateobjects.pop();
		else
		{
			s = {};
			s.insts = [];
		}
		s.sa = false;
		return s;
	};
	function freeSolStateObject(s)
	{
		s.insts.length = 0;
		solstateobjects.push(s);
	};
	SysActs.prototype.Wait = function (seconds)
	{
		if (seconds < 0)
			return;
		var i, len, s, t, ss;
		var evinfo = this.runtime.getCurrentEventStack();
		var waitobj = allocWaitObject();
		waitobj.time = this.runtime.kahanTime.sum + seconds;
		waitobj.ev = evinfo.current_event;
		waitobj.actindex = evinfo.actindex + 1;	// pointing at next action
		for (i = 0, len = this.runtime.types_by_index.length; i < len; i++)
		{
			t = this.runtime.types_by_index[i];
			s = t.getCurrentSol();
			if (s.select_all && evinfo.current_event.solModifiers.indexOf(t) === -1)
				continue;
			waitobj.solModifiers.push(t);
			ss = allocSolStateObject();
			ss.sa = s.select_all;
			cr.shallowAssignArray(ss.insts, s.instances);
			waitobj.sols[i.toString()] = ss;
		}
		this.waits.push(waitobj);
		return true;
	};
	SysActs.prototype.SetLayerScale = function (layer, scale)
    {
        if (!layer)
            return;
		if (layer.scale === scale)
			return;
        layer.scale = scale;
        this.runtime.redraw = true;
    };
	SysActs.prototype.ResetGlobals = function ()
	{
		var i, len, g;
		for (i = 0, len = this.runtime.all_global_vars.length; i < len; i++)
		{
			g = this.runtime.all_global_vars[i];
			g.data = g.initial;
		}
	};
	SysActs.prototype.SetLayoutAngle = function (a)
	{
		a = cr.to_radians(a);
		a = cr.clamp_angle(a);
		if (this.runtime.running_layout)
		{
			if (this.runtime.running_layout.angle !== a)
			{
				this.runtime.running_layout.angle = a;
				this.runtime.redraw = true;
			}
		}
	};
	SysActs.prototype.SetLayerAngle = function (layer, a)
    {
        if (!layer)
            return;
		a = cr.to_radians(a);
		a = cr.clamp_angle(a);
		if (layer.angle === a)
			return;
        layer.angle = a;
        this.runtime.redraw = true;
    };
	SysActs.prototype.SetLayerParallax = function (layer, px, py)
    {
        if (!layer)
            return;
		if (layer.parallaxX === px / 100 && layer.parallaxY === py / 100)
			return;
        layer.parallaxX = px / 100;
		layer.parallaxY = py / 100;
		if (layer.parallaxX !== 1 || layer.parallaxY !== 1)
		{
			var i, len, instances = layer.instances;
			for (i = 0, len = instances.length; i < len; ++i)
			{
				instances[i].type.any_instance_parallaxed = true;
			}
		}
        this.runtime.redraw = true;
    };
	SysActs.prototype.SetLayerBackground = function (layer, c)
    {
        if (!layer)
            return;
		var r = cr.GetRValue(c);
		var g = cr.GetGValue(c);
		var b = cr.GetBValue(c);
		if (layer.background_color[0] === r && layer.background_color[1] === g && layer.background_color[2] === b)
			return;
        layer.background_color[0] = r;
		layer.background_color[1] = g;
		layer.background_color[2] = b;
        this.runtime.redraw = true;
    };
	SysActs.prototype.SetLayerTransparent = function (layer, t)
    {
        if (!layer)
            return;
		if (!!t === !!layer.transparent)
			return;
		layer.transparent = !!t;
        this.runtime.redraw = true;
    };
	SysActs.prototype.StopLoop = function ()
	{
		if (this.runtime.loop_stack_index < 0)
			return;		// no loop currently running
		this.runtime.getCurrentLoop().stopped = true;
	};
	SysActs.prototype.GoToLayoutByName = function (layoutname)
	{
		if (this.runtime.isloading)
			return;		// cannot change layout while loading on loader layout
		if (this.runtime.changelayout)
			return;		// already changing to different layout
;
		var l;
		for (l in this.runtime.layouts)
		{
			if (this.runtime.layouts.hasOwnProperty(l) && cr.equals_nocase(l, layoutname))
			{
				this.runtime.changelayout = this.runtime.layouts[l];
				return;
			}
		}
	};
	SysActs.prototype.RestartLayout = function (layoutname)
	{
		if (this.runtime.isloading)
			return;		// cannot restart loader layouts
		if (this.runtime.changelayout)
			return;		// already changing to a different layout
;
		if (!this.runtime.running_layout)
			return;
		this.runtime.changelayout = this.runtime.running_layout;
		var i, len, g;
		for (i = 0, len = this.runtime.allGroups.length; i < len; i++)
		{
			g = this.runtime.allGroups[i];
			this.runtime.activeGroups[g.group_name.toLowerCase()] = g.initially_activated;
		}
	};
	SysActs.prototype.SnapshotCanvas = function (format_, quality_)
	{
		this.runtime.snapshotCanvas = [format_ === 0 ? "image/png" : "image/jpeg", quality_ / 100];
		this.runtime.redraw = true;		// force redraw so snapshot is always taken
	};
	SysActs.prototype.SetCanvasSize = function (w, h)
	{
		if (w <= 0 || h <= 0)
			return;
		var mode = this.runtime.fullscreen_mode;
		var isfullscreen = (document["mozFullScreen"] || document["webkitIsFullScreen"] || !!document["msFullscreenElement"] || document["fullScreen"] || this.runtime.isNodeFullscreen);
		if (isfullscreen && this.runtime.fullscreen_scaling > 0)
			mode = this.runtime.fullscreen_scaling;
		if (mode === 0)
		{
			this.runtime["setSize"](w, h, true);
		}
		else
		{
			this.runtime.original_width = w;
			this.runtime.original_height = h;
			this.runtime["setSize"](this.runtime.lastWindowWidth, this.runtime.lastWindowHeight, true);
		}
	};
	SysActs.prototype.SetLayoutEffectEnabled = function (enable_, effectname_)
	{
		if (!this.runtime.running_layout || !this.runtime.glwrap)
			return;
		var et = this.runtime.running_layout.getEffectByName(effectname_);
		if (!et)
			return;		// effect name not found
		var enable = (enable_ === 1);
		if (et.active == enable)
			return;		// no change
		et.active = enable;
		this.runtime.running_layout.updateActiveEffects();
		this.runtime.redraw = true;
	};
	SysActs.prototype.SetLayerEffectEnabled = function (layer, enable_, effectname_)
	{
		if (!layer || !this.runtime.glwrap)
			return;
		var et = layer.getEffectByName(effectname_);
		if (!et)
			return;		// effect name not found
		var enable = (enable_ === 1);
		if (et.active == enable)
			return;		// no change
		et.active = enable;
		layer.updateActiveEffects();
		this.runtime.redraw = true;
	};
	SysActs.prototype.SetLayoutEffectParam = function (effectname_, index_, value_)
	{
		if (!this.runtime.running_layout || !this.runtime.glwrap)
			return;
		var et = this.runtime.running_layout.getEffectByName(effectname_);
		if (!et)
			return;		// effect name not found
		var params = this.runtime.running_layout.effect_params[et.index];
		index_ = Math.floor(index_);
		if (index_ < 0 || index_ >= params.length)
			return;		// effect index out of bounds
		if (this.runtime.glwrap.getProgramParameterType(et.shaderindex, index_) === 1)
			value_ /= 100.0;
		if (params[index_] === value_)
			return;		// no change
		params[index_] = value_;
		if (et.active)
			this.runtime.redraw = true;
	};
	SysActs.prototype.SetLayerEffectParam = function (layer, effectname_, index_, value_)
	{
		if (!layer || !this.runtime.glwrap)
			return;
		var et = layer.getEffectByName(effectname_);
		if (!et)
			return;		// effect name not found
		var params = layer.effect_params[et.index];
		index_ = Math.floor(index_);
		if (index_ < 0 || index_ >= params.length)
			return;		// effect index out of bounds
		if (this.runtime.glwrap.getProgramParameterType(et.shaderindex, index_) === 1)
			value_ /= 100.0;
		if (params[index_] === value_)
			return;		// no change
		params[index_] = value_;
		if (et.active)
			this.runtime.redraw = true;
	};
	SysActs.prototype.SaveState = function (slot_)
	{
		this.runtime.saveToSlot = slot_;
	};
	SysActs.prototype.LoadState = function (slot_)
	{
		this.runtime.loadFromSlot = slot_;
	};
	SysActs.prototype.LoadStateJSON = function (jsonstr_)
	{
		this.runtime.loadFromJson = jsonstr_;
	};
	SysActs.prototype.SetHalfFramerateMode = function (set_)
	{
		this.runtime.halfFramerateMode = (set_ !== 0);
	};
	SysActs.prototype.SetFullscreenQuality = function (q)
	{
		var isfullscreen = (document["mozFullScreen"] || document["webkitIsFullScreen"] || !!document["msFullscreenElement"] || document["fullScreen"] || this.isNodeFullscreen);
		if (!isfullscreen && this.runtime.fullscreen_mode === 0)
			return;
		this.runtime.wantFullscreenScalingQuality = (q !== 0);
		this.runtime["setSize"](this.runtime.lastWindowWidth, this.runtime.lastWindowHeight, true);
	};
	sysProto.acts = new SysActs();
    function SysExps() {};
    SysExps.prototype["int"] = function(ret, x)
    {
        if (cr.is_string(x))
        {
            ret.set_int(parseInt(x, 10));
            if (isNaN(ret.data))
                ret.data = 0;
        }
        else
            ret.set_int(x);
    };
    SysExps.prototype["float"] = function(ret, x)
    {
        if (cr.is_string(x))
        {
            ret.set_float(parseFloat(x));
            if (isNaN(ret.data))
                ret.data = 0;
        }
        else
            ret.set_float(x);
    };
    SysExps.prototype.str = function(ret, x)
    {
        if (cr.is_string(x))
            ret.set_string(x);
        else
            ret.set_string(x.toString());
    };
    SysExps.prototype.len = function(ret, x)
    {
        ret.set_int(x.length || 0);
    };
    SysExps.prototype.random = function (ret, a, b)
    {
        if (b === undefined)
        {
            ret.set_float(Math.random() * a);
        }
        else
        {
            ret.set_float(Math.random() * (b - a) + a);
        }
    };
    SysExps.prototype.sqrt = function(ret, x)
    {
        ret.set_float(Math.sqrt(x));
    };
    SysExps.prototype.abs = function(ret, x)
    {
        ret.set_float(Math.abs(x));
    };
    SysExps.prototype.round = function(ret, x)
    {
        ret.set_int(Math.round(x));
    };
    SysExps.prototype.floor = function(ret, x)
    {
        ret.set_int(Math.floor(x));
    };
    SysExps.prototype.ceil = function(ret, x)
    {
        ret.set_int(Math.ceil(x));
    };
    SysExps.prototype.sin = function(ret, x)
    {
        ret.set_float(Math.sin(cr.to_radians(x)));
    };
    SysExps.prototype.cos = function(ret, x)
    {
        ret.set_float(Math.cos(cr.to_radians(x)));
    };
    SysExps.prototype.tan = function(ret, x)
    {
        ret.set_float(Math.tan(cr.to_radians(x)));
    };
    SysExps.prototype.asin = function(ret, x)
    {
        ret.set_float(cr.to_degrees(Math.asin(x)));
    };
    SysExps.prototype.acos = function(ret, x)
    {
        ret.set_float(cr.to_degrees(Math.acos(x)));
    };
    SysExps.prototype.atan = function(ret, x)
    {
        ret.set_float(cr.to_degrees(Math.atan(x)));
    };
    SysExps.prototype.exp = function(ret, x)
    {
        ret.set_float(Math.exp(x));
    };
    SysExps.prototype.ln = function(ret, x)
    {
        ret.set_float(Math.log(x));
    };
    SysExps.prototype.log10 = function(ret, x)
    {
        ret.set_float(Math.log(x) / Math.LN10);
    };
    SysExps.prototype.max = function(ret)
    {
		var max_ = arguments[1];
		var i, len;
		for (i = 2, len = arguments.length; i < len; i++)
		{
			if (max_ < arguments[i])
				max_ = arguments[i];
		}
		ret.set_float(max_);
    };
    SysExps.prototype.min = function(ret)
    {
        var min_ = arguments[1];
		var i, len;
		for (i = 2, len = arguments.length; i < len; i++)
		{
			if (min_ > arguments[i])
				min_ = arguments[i];
		}
		ret.set_float(min_);
    };
    SysExps.prototype.dt = function(ret)
    {
        ret.set_float(this.runtime.dt);
    };
    SysExps.prototype.timescale = function(ret)
    {
        ret.set_float(this.runtime.timescale);
    };
    SysExps.prototype.wallclocktime = function(ret)
    {
        ret.set_float((Date.now() - this.runtime.start_time) / 1000.0);
    };
    SysExps.prototype.time = function(ret)
    {
        ret.set_float(this.runtime.kahanTime.sum);
    };
    SysExps.prototype.tickcount = function(ret)
    {
        ret.set_int(this.runtime.tickcount);
    };
    SysExps.prototype.objectcount = function(ret)
    {
        ret.set_int(this.runtime.objectcount);
    };
    SysExps.prototype.fps = function(ret)
    {
        ret.set_int(this.runtime.fps);
    };
    SysExps.prototype.loopindex = function(ret, name_)
    {
		var loop, i, len;
        if (!this.runtime.loop_stack.length)
        {
            ret.set_int(0);
            return;
        }
        if (name_)
        {
            for (i = 0, len = this.runtime.loop_stack.length; i < len; i++)
            {
                loop = this.runtime.loop_stack[i];
                if (loop.name === name_)
                {
                    ret.set_int(loop.index);
                    return;
                }
            }
            ret.set_int(0);
        }
        else
        {
			loop = this.runtime.getCurrentLoop();
			ret.set_int(loop ? loop.index : -1);
        }
    };
    SysExps.prototype.distance = function(ret, x1, y1, x2, y2)
    {
        ret.set_float(cr.distanceTo(x1, y1, x2, y2));
    };
    SysExps.prototype.angle = function(ret, x1, y1, x2, y2)
    {
        ret.set_float(cr.to_degrees(cr.angleTo(x1, y1, x2, y2)));
    };
    SysExps.prototype.scrollx = function(ret)
    {
        ret.set_float(this.runtime.running_layout.scrollX);
    };
    SysExps.prototype.scrolly = function(ret)
    {
        ret.set_float(this.runtime.running_layout.scrollY);
    };
    SysExps.prototype.newline = function(ret)
    {
        ret.set_string("\n");
    };
    SysExps.prototype.lerp = function(ret, a, b, x)
    {
        ret.set_float(cr.lerp(a, b, x));
    };
    SysExps.prototype.windowwidth = function(ret)
    {
        ret.set_int(this.runtime.width);
    };
    SysExps.prototype.windowheight = function(ret)
    {
        ret.set_int(this.runtime.height);
    };
	SysExps.prototype.uppercase = function(ret, str)
	{
		ret.set_string(cr.is_string(str) ? str.toUpperCase() : "");
	};
	SysExps.prototype.lowercase = function(ret, str)
	{
		ret.set_string(cr.is_string(str) ? str.toLowerCase() : "");
	};
	SysExps.prototype.clamp = function(ret, x, l, u)
	{
		if (x < l)
			ret.set_float(l);
		else if (x > u)
			ret.set_float(u);
		else
			ret.set_float(x);
	};
	SysExps.prototype.layerscale = function (ret, layerparam)
	{
		var layer = this.runtime.getLayer(layerparam);
		if (!layer)
			ret.set_float(0);
		else
			ret.set_float(layer.scale);
	};
	SysExps.prototype.layeropacity = function (ret, layerparam)
	{
		var layer = this.runtime.getLayer(layerparam);
		if (!layer)
			ret.set_float(0);
		else
			ret.set_float(layer.opacity * 100);
	};
	SysExps.prototype.layerscalerate = function (ret, layerparam)
	{
		var layer = this.runtime.getLayer(layerparam);
		if (!layer)
			ret.set_float(0);
		else
			ret.set_float(layer.zoomRate);
	};
	SysExps.prototype.layerparallaxx = function (ret, layerparam)
	{
		var layer = this.runtime.getLayer(layerparam);
		if (!layer)
			ret.set_float(0);
		else
			ret.set_float(layer.parallaxX * 100);
	};
	SysExps.prototype.layerparallaxy = function (ret, layerparam)
	{
		var layer = this.runtime.getLayer(layerparam);
		if (!layer)
			ret.set_float(0);
		else
			ret.set_float(layer.parallaxY * 100);
	};
	SysExps.prototype.layoutscale = function (ret)
	{
		if (this.runtime.running_layout)
			ret.set_float(this.runtime.running_layout.scale);
		else
			ret.set_float(0);
	};
	SysExps.prototype.layoutangle = function (ret)
	{
		ret.set_float(cr.to_degrees(this.runtime.running_layout.angle));
	};
	SysExps.prototype.layerangle = function (ret, layerparam)
	{
		var layer = this.runtime.getLayer(layerparam);
		if (!layer)
			ret.set_float(0);
		else
			ret.set_float(cr.to_degrees(layer.angle));
	};
	SysExps.prototype.layoutwidth = function (ret)
	{
		ret.set_int(this.runtime.running_layout.width);
	};
	SysExps.prototype.layoutheight = function (ret)
	{
		ret.set_int(this.runtime.running_layout.height);
	};
	SysExps.prototype.find = function (ret, text, searchstr)
	{
		if (cr.is_string(text) && cr.is_string(searchstr))
			ret.set_int(text.search(new RegExp(cr.regexp_escape(searchstr), "i")));
		else
			ret.set_int(-1);
	};
	SysExps.prototype.left = function (ret, text, n)
	{
		ret.set_string(cr.is_string(text) ? text.substr(0, n) : "");
	};
	SysExps.prototype.right = function (ret, text, n)
	{
		ret.set_string(cr.is_string(text) ? text.substr(text.length - n) : "");
	};
	SysExps.prototype.mid = function (ret, text, index_, length_)
	{
		ret.set_string(cr.is_string(text) ? text.substr(index_, length_) : "");
	};
	SysExps.prototype.tokenat = function (ret, text, index_, sep)
	{
		if (cr.is_string(text) && cr.is_string(sep))
		{
			var arr = text.split(sep);
			var i = cr.floor(index_);
			if (i < 0 || i >= arr.length)
				ret.set_string("");
			else
				ret.set_string(arr[i]);
		}
		else
			ret.set_string("");
	};
	SysExps.prototype.tokencount = function (ret, text, sep)
	{
		if (cr.is_string(text) && text.length)
			ret.set_int(text.split(sep).length);
		else
			ret.set_int(0);
	};
	SysExps.prototype.replace = function (ret, text, find_, replace_)
	{
		if (cr.is_string(text) && cr.is_string(find_) && cr.is_string(replace_))
			ret.set_string(text.replace(new RegExp(cr.regexp_escape(find_), "gi"), replace_));
		else
			ret.set_string(cr.is_string(text) ? text : "");
	};
	SysExps.prototype.trim = function (ret, text)
	{
		ret.set_string(cr.is_string(text) ? text.trim() : "");
	};
	SysExps.prototype.pi = function (ret)
	{
		ret.set_float(cr.PI);
	};
	SysExps.prototype.layoutname = function (ret)
	{
		if (this.runtime.running_layout)
			ret.set_string(this.runtime.running_layout.name);
		else
			ret.set_string("");
	};
	SysExps.prototype.renderer = function (ret)
	{
		ret.set_string(this.runtime.gl ? "webgl" : "canvas2d");
	};
	SysExps.prototype.anglediff = function (ret, a, b)
	{
		ret.set_float(cr.to_degrees(cr.angleDiff(cr.to_radians(a), cr.to_radians(b))));
	};
	SysExps.prototype.choose = function (ret)
	{
		var index = cr.floor(Math.random() * (arguments.length - 1));
		ret.set_any(arguments[index + 1]);
	};
	SysExps.prototype.rgb = function (ret, r, g, b)
	{
		ret.set_int(cr.RGB(r, g, b));
	};
	SysExps.prototype.projectversion = function (ret)
	{
		ret.set_string(this.runtime.versionstr);
	};
	SysExps.prototype.anglelerp = function (ret, a, b, x)
	{
		a = cr.to_radians(a);
		b = cr.to_radians(b);
		var diff = cr.angleDiff(a, b);
		if (cr.angleClockwise(b, a))
		{
			ret.set_float(cr.to_clamped_degrees(a + diff * x));
		}
		else
		{
			ret.set_float(cr.to_clamped_degrees(a - diff * x));
		}
	};
	SysExps.prototype.anglerotate = function (ret, a, b, c)
	{
		a = cr.to_radians(a);
		b = cr.to_radians(b);
		c = cr.to_radians(c);
		ret.set_float(cr.to_clamped_degrees(cr.angleRotate(a, b, c)));
	};
	SysExps.prototype.zeropad = function (ret, n, d)
	{
		var s = (n < 0 ? "-" : "");
		if (n < 0) n = -n;
		var zeroes = d - n.toString().length;
		for (var i = 0; i < zeroes; i++)
			s += "0";
		ret.set_string(s + n.toString());
	};
	SysExps.prototype.cpuutilisation = function (ret)
	{
		ret.set_float(this.runtime.cpuutilisation / 1000);
	};
	SysExps.prototype.viewportleft = function (ret, layerparam)
	{
		var layer = this.runtime.getLayer(layerparam);
		ret.set_float(layer ? layer.viewLeft : 0);
	};
	SysExps.prototype.viewporttop = function (ret, layerparam)
	{
		var layer = this.runtime.getLayer(layerparam);
		ret.set_float(layer ? layer.viewTop : 0);
	};
	SysExps.prototype.viewportright = function (ret, layerparam)
	{
		var layer = this.runtime.getLayer(layerparam);
		ret.set_float(layer ? layer.viewRight : 0);
	};
	SysExps.prototype.viewportbottom = function (ret, layerparam)
	{
		var layer = this.runtime.getLayer(layerparam);
		ret.set_float(layer ? layer.viewBottom : 0);
	};
	SysExps.prototype.loadingprogress = function (ret)
	{
		ret.set_float(this.runtime.loadingprogress);
	};
	SysExps.prototype.unlerp = function(ret, a, b, y)
    {
        ret.set_float(cr.unlerp(a, b, y));
    };
	SysExps.prototype.canvassnapshot = function (ret)
	{
		ret.set_string(this.runtime.snapshotData);
	};
	SysExps.prototype.urlencode = function (ret, s)
	{
		ret.set_string(encodeURIComponent(s));
	};
	SysExps.prototype.urldecode = function (ret, s)
	{
		ret.set_string(decodeURIComponent(s));
	};
	SysExps.prototype.canvastolayerx = function (ret, layerparam, x, y)
	{
		var layer = this.runtime.getLayer(layerparam);
		ret.set_float(layer ? layer.canvasToLayer(x, y, true) : 0);
	};
	SysExps.prototype.canvastolayery = function (ret, layerparam, x, y)
	{
		var layer = this.runtime.getLayer(layerparam);
		ret.set_float(layer ? layer.canvasToLayer(x, y, false) : 0);
	};
	SysExps.prototype.layertocanvasx = function (ret, layerparam, x, y)
	{
		var layer = this.runtime.getLayer(layerparam);
		ret.set_float(layer ? layer.layerToCanvas(x, y, true) : 0);
	};
	SysExps.prototype.layertocanvasy = function (ret, layerparam, x, y)
	{
		var layer = this.runtime.getLayer(layerparam);
		ret.set_float(layer ? layer.layerToCanvas(x, y, false) : 0);
	};
	SysExps.prototype.savestatejson = function (ret)
	{
		ret.set_string(this.runtime.lastSaveJson);
	};
	SysExps.prototype.imagememoryusage = function (ret)
	{
		if (this.runtime.glwrap)
			ret.set_float(Math.round(100 * this.runtime.glwrap.estimateVRAM() / (1024 * 1024)) / 100);
		else
			ret.set_float(0);
	};
	SysExps.prototype.regexsearch = function (ret, str_, regex_, flags_)
	{
		var regex = getRegex(regex_, flags_);
		ret.set_int(str_ ? str_.search(regex) : -1);
	};
	SysExps.prototype.regexreplace = function (ret, str_, regex_, flags_, replace_)
	{
		var regex = getRegex(regex_, flags_);
		ret.set_string(str_ ? str_.replace(regex, replace_) : "");
	};
	var regexMatches = [];
	var lastMatchesStr = "";
	var lastMatchesRegex = "";
	var lastMatchesFlags = "";
	function updateRegexMatches(str_, regex_, flags_)
	{
		if (str_ === lastMatchesStr && regex_ === lastMatchesRegex && flags_ === lastMatchesFlags)
			return;
		var regex = getRegex(regex_, flags_);
		regexMatches = str_.match(regex);
		lastMatchesStr = str_;
		lastMatchesRegex = regex_;
		lastMatchesFlags = flags_;
	};
	SysExps.prototype.regexmatchcount = function (ret, str_, regex_, flags_)
	{
		var regex = getRegex(regex_, flags_);
		updateRegexMatches(str_, regex_, flags_);
		ret.set_int(regexMatches ? regexMatches.length : 0);
	};
	SysExps.prototype.regexmatchat = function (ret, str_, regex_, flags_, index_)
	{
		index_ = Math.floor(index_);
		var regex = getRegex(regex_, flags_);
		updateRegexMatches(str_, regex_, flags_);
		if (!regexMatches || index_ < 0 || index_ >= regexMatches.length)
			ret.set_string("");
		else
			ret.set_string(regexMatches[index_]);
	};
	SysExps.prototype.infinity = function (ret)
	{
		ret.set_float(Infinity);
	};
	SysExps.prototype.setbit = function (ret, n, b, v)
	{
		n = n | 0;
		b = b | 0;
		v = (v !== 0 ? 1 : 0);
		ret.set_int((n & ~(1 << b)) | (v << b));
	};
	SysExps.prototype.togglebit = function (ret, n, b)
	{
		n = n | 0;
		b = b | 0;
		ret.set_int(n ^ (1 << b));
	};
	SysExps.prototype.getbit = function (ret, n, b)
	{
		n = n | 0;
		b = b | 0;
		ret.set_int((n & (1 << b)) ? 1 : 0);
	};
	sysProto.exps = new SysExps();
	sysProto.runWaits = function ()
	{
		var i, j, len, w, k, s, ss;
		var evinfo = this.runtime.getCurrentEventStack();
		for (i = 0, len = this.waits.length; i < len; i++)
		{
			w = this.waits[i];
			if (w.time > this.runtime.kahanTime.sum)
				continue;
			evinfo.current_event = w.ev;
			evinfo.actindex = w.actindex;
			evinfo.cndindex = 0;
			for (k in w.sols)
			{
				if (w.sols.hasOwnProperty(k))
				{
					s = this.runtime.types_by_index[parseInt(k, 10)].getCurrentSol();
					ss = w.sols[k];
					s.select_all = ss.sa;
					cr.shallowAssignArray(s.instances, ss.insts);
					freeSolStateObject(ss);
				}
			}
			w.ev.resume_actions_and_subevents();
			this.runtime.clearSol(w.solModifiers);
			w.deleteme = true;
		}
		for (i = 0, j = 0, len = this.waits.length; i < len; i++)
		{
			w = this.waits[i];
			this.waits[j] = w;
			if (w.deleteme)
				freeWaitObject(w);
			else
				j++;
		}
		this.waits.length = j;
	};
}());
;
(function () {
	cr.add_common_aces = function (m)
	{
		var pluginProto = m[0].prototype;
		var singleglobal_ = m[1];
		var position_aces = m[3];
		var size_aces = m[4];
		var angle_aces = m[5];
		var appearance_aces = m[6];
		var zorder_aces = m[7];
		var effects_aces = m[8];
		if (!pluginProto.cnds)
			pluginProto.cnds = {};
		if (!pluginProto.acts)
			pluginProto.acts = {};
		if (!pluginProto.exps)
			pluginProto.exps = {};
		var cnds = pluginProto.cnds;
		var acts = pluginProto.acts;
		var exps = pluginProto.exps;
		if (position_aces)
		{
			cnds.CompareX = function (cmp, x)
			{
				return cr.do_cmp(this.x, cmp, x);
			};
			cnds.CompareY = function (cmp, y)
			{
				return cr.do_cmp(this.y, cmp, y);
			};
			cnds.IsOnScreen = function ()
			{
				var layer = this.layer;
				this.update_bbox();
				var bbox = this.bbox;
				return !(bbox.right < layer.viewLeft || bbox.bottom < layer.viewTop || bbox.left > layer.viewRight || bbox.top > layer.viewBottom);
			};
			cnds.IsOutsideLayout = function ()
			{
				this.update_bbox();
				var bbox = this.bbox;
				var layout = this.runtime.running_layout;
				return (bbox.right < 0 || bbox.bottom < 0 || bbox.left > layout.width || bbox.top > layout.height);
			};
			cnds.PickDistance = function (which, x, y)
			{
				var sol = this.getCurrentSol();
				var instances = sol.getObjects();
				if (!instances.length)
					return false;
				var inst = instances[0];
				var pickme = inst;
				var dist = cr.distanceTo(inst.x, inst.y, x, y);
				var i, len, d;
				for (i = 1, len = instances.length; i < len; i++)
				{
					inst = instances[i];
					d = cr.distanceTo(inst.x, inst.y, x, y);
					if ((which === 0 && d < dist) || (which === 1 && d > dist))
					{
						dist = d;
						pickme = inst;
					}
				}
				sol.pick_one(pickme);
				return true;
			};
			acts.SetX = function (x)
			{
				if (this.x !== x)
				{
					this.x = x;
					this.set_bbox_changed();
				}
			};
			acts.SetY = function (y)
			{
				if (this.y !== y)
				{
					this.y = y;
					this.set_bbox_changed();
				}
			};
			acts.SetPos = function (x, y)
			{
				if (this.x !== x || this.y !== y)
				{
					this.x = x;
					this.y = y;
					this.set_bbox_changed();
				}
			};
			acts.SetPosToObject = function (obj, imgpt)
			{
				var inst = obj.getPairedInstance(this);
				if (!inst)
					return;
				var newx, newy;
				if (inst.getImagePoint)
				{
					newx = inst.getImagePoint(imgpt, true);
					newy = inst.getImagePoint(imgpt, false);
				}
				else
				{
					newx = inst.x;
					newy = inst.y;
				}
				if (this.x !== newx || this.y !== newy)
				{
					this.x = newx;
					this.y = newy;
					this.set_bbox_changed();
				}
			};
			acts.MoveForward = function (dist)
			{
				if (dist !== 0)
				{
					this.x += Math.cos(this.angle) * dist;
					this.y += Math.sin(this.angle) * dist;
					this.set_bbox_changed();
				}
			};
			acts.MoveAtAngle = function (a, dist)
			{
				if (dist !== 0)
				{
					this.x += Math.cos(cr.to_radians(a)) * dist;
					this.y += Math.sin(cr.to_radians(a)) * dist;
					this.set_bbox_changed();
				}
			};
			exps.X = function (ret)
			{
				ret.set_float(this.x);
			};
			exps.Y = function (ret)
			{
				ret.set_float(this.y);
			};
			exps.dt = function (ret)
			{
				ret.set_float(this.runtime.getDt(this));
			};
		}
		if (size_aces)
		{
			cnds.CompareWidth = function (cmp, w)
			{
				return cr.do_cmp(this.width, cmp, w);
			};
			cnds.CompareHeight = function (cmp, h)
			{
				return cr.do_cmp(this.height, cmp, h);
			};
			acts.SetWidth = function (w)
			{
				if (this.width !== w)
				{
					this.width = w;
					this.set_bbox_changed();
				}
			};
			acts.SetHeight = function (h)
			{
				if (this.height !== h)
				{
					this.height = h;
					this.set_bbox_changed();
				}
			};
			acts.SetSize = function (w, h)
			{
				if (this.width !== w || this.height !== h)
				{
					this.width = w;
					this.height = h;
					this.set_bbox_changed();
				}
			};
			exps.Width = function (ret)
			{
				ret.set_float(this.width);
			};
			exps.Height = function (ret)
			{
				ret.set_float(this.height);
			};
			exps.BBoxLeft = function (ret)
			{
				this.update_bbox();
				ret.set_float(this.bbox.left);
			};
			exps.BBoxTop = function (ret)
			{
				this.update_bbox();
				ret.set_float(this.bbox.top);
			};
			exps.BBoxRight = function (ret)
			{
				this.update_bbox();
				ret.set_float(this.bbox.right);
			};
			exps.BBoxBottom = function (ret)
			{
				this.update_bbox();
				ret.set_float(this.bbox.bottom);
			};
		}
		if (angle_aces)
		{
			cnds.AngleWithin = function (within, a)
			{
				return cr.angleDiff(this.angle, cr.to_radians(a)) <= cr.to_radians(within);
			};
			cnds.IsClockwiseFrom = function (a)
			{
				return cr.angleClockwise(this.angle, cr.to_radians(a));
			};
			cnds.IsBetweenAngles = function (a, b)
			{
				var lower = cr.to_clamped_radians(a);
				var upper = cr.to_clamped_radians(b);
				var angle = cr.clamp_angle(this.angle);
				var obtuse = (!cr.angleClockwise(upper, lower));
				if (obtuse)
					return !(!cr.angleClockwise(angle, lower) && cr.angleClockwise(angle, upper));
				else
					return cr.angleClockwise(angle, lower) && !cr.angleClockwise(angle, upper);
			};
			acts.SetAngle = function (a)
			{
				var newangle = cr.to_radians(cr.clamp_angle_degrees(a));
				if (isNaN(newangle))
					return;
				if (this.angle !== newangle)
				{
					this.angle = newangle;
					this.set_bbox_changed();
				}
			};
			acts.RotateClockwise = function (a)
			{
				if (a !== 0 && !isNaN(a))
				{
					this.angle += cr.to_radians(a);
					this.angle = cr.clamp_angle(this.angle);
					this.set_bbox_changed();
				}
			};
			acts.RotateCounterclockwise = function (a)
			{
				if (a !== 0 && !isNaN(a))
				{
					this.angle -= cr.to_radians(a);
					this.angle = cr.clamp_angle(this.angle);
					this.set_bbox_changed();
				}
			};
			acts.RotateTowardAngle = function (amt, target)
			{
				var newangle = cr.angleRotate(this.angle, cr.to_radians(target), cr.to_radians(amt));
				if (isNaN(newangle))
					return;
				if (this.angle !== newangle)
				{
					this.angle = newangle;
					this.set_bbox_changed();
				}
			};
			acts.RotateTowardPosition = function (amt, x, y)
			{
				var dx = x - this.x;
				var dy = y - this.y;
				var target = Math.atan2(dy, dx);
				var newangle = cr.angleRotate(this.angle, target, cr.to_radians(amt));
				if (isNaN(newangle))
					return;
				if (this.angle !== newangle)
				{
					this.angle = newangle;
					this.set_bbox_changed();
				}
			};
			acts.SetTowardPosition = function (x, y)
			{
				var dx = x - this.x;
				var dy = y - this.y;
				var newangle = Math.atan2(dy, dx);
				if (isNaN(newangle))
					return;
				if (this.angle !== newangle)
				{
					this.angle = newangle;
					this.set_bbox_changed();
				}
			};
			exps.Angle = function (ret)
			{
				ret.set_float(cr.to_clamped_degrees(this.angle));
			};
		}
		if (!singleglobal_)
		{
			cnds.CompareInstanceVar = function (iv, cmp, val)
			{
				return cr.do_cmp(this.instance_vars[iv], cmp, val);
			};
			cnds.IsBoolInstanceVarSet = function (iv)
			{
				return this.instance_vars[iv];
			};
			cnds.PickInstVarHiLow = function (which, iv)
			{
				var sol = this.getCurrentSol();
				var instances = sol.getObjects();
				if (!instances.length)
					return false;
				var inst = instances[0];
				var pickme = inst;
				var val = inst.instance_vars[iv];
				var i, len, v;
				for (i = 1, len = instances.length; i < len; i++)
				{
					inst = instances[i];
					v = inst.instance_vars[iv];
					if ((which === 0 && v < val) || (which === 1 && v > val))
					{
						val = v;
						pickme = inst;
					}
				}
				sol.pick_one(pickme);
				return true;
			};
			cnds.PickByUID = function (u)
			{
				var i, len, j, inst, families, instances, sol;
				var cnd = this.runtime.getCurrentCondition();
				if (cnd.inverted)
				{
					sol = this.getCurrentSol();
					if (sol.select_all)
					{
						sol.select_all = false;
						sol.instances.length = 0;
						sol.else_instances.length = 0;
						instances = this.instances;
						for (i = 0, len = instances.length; i < len; i++)
						{
							inst = instances[i];
							if (inst.uid === u)
								sol.else_instances.push(inst);
							else
								sol.instances.push(inst);
						}
						this.applySolToContainer();
						return !!sol.instances.length;
					}
					else
					{
						for (i = 0, j = 0, len = sol.instances.length; i < len; i++)
						{
							inst = sol.instances[i];
							sol.instances[j] = inst;
							if (inst.uid === u)
							{
								sol.else_instances.push(inst);
							}
							else
								j++;
						}
						sol.instances.length = j;
						this.applySolToContainer();
						return !!sol.instances.length;
					}
				}
				else
				{
					inst = this.runtime.getObjectByUID(u);
					if (!inst)
						return false;
					sol = this.getCurrentSol();
					if (!sol.select_all && sol.instances.indexOf(inst) === -1)
						return false;		// not picked
					if (this.is_family)
					{
						families = inst.type.families;
						for (i = 0, len = families.length; i < len; i++)
						{
							if (families[i] === this)
							{
								sol.pick_one(inst);
								this.applySolToContainer();
								return true;
							}
						}
					}
					else if (inst.type === this)
					{
						sol.pick_one(inst);
						this.applySolToContainer();
						return true;
					}
					return false;
				}
			};
			cnds.OnCreated = function ()
			{
				return true;
			};
			cnds.OnDestroyed = function ()
			{
				return true;
			};
			acts.SetInstanceVar = function (iv, val)
			{
				var myinstvars = this.instance_vars;
				if (cr.is_number(myinstvars[iv]))
				{
					if (cr.is_number(val))
						myinstvars[iv] = val;
					else
						myinstvars[iv] = parseFloat(val);
				}
				else if (cr.is_string(myinstvars[iv]))
				{
					if (cr.is_string(val))
						myinstvars[iv] = val;
					else
						myinstvars[iv] = val.toString();
				}
				else
;
			};
			acts.AddInstanceVar = function (iv, val)
			{
				var myinstvars = this.instance_vars;
				if (cr.is_number(myinstvars[iv]))
				{
					if (cr.is_number(val))
						myinstvars[iv] += val;
					else
						myinstvars[iv] += parseFloat(val);
				}
				else if (cr.is_string(myinstvars[iv]))
				{
					if (cr.is_string(val))
						myinstvars[iv] += val;
					else
						myinstvars[iv] += val.toString();
				}
				else
;
			};
			acts.SubInstanceVar = function (iv, val)
			{
				var myinstvars = this.instance_vars;
				if (cr.is_number(myinstvars[iv]))
				{
					if (cr.is_number(val))
						myinstvars[iv] -= val;
					else
						myinstvars[iv] -= parseFloat(val);
				}
				else
;
			};
			acts.SetBoolInstanceVar = function (iv, val)
			{
				this.instance_vars[iv] = val ? 1 : 0;
			};
			acts.ToggleBoolInstanceVar = function (iv)
			{
				this.instance_vars[iv] = 1 - this.instance_vars[iv];
			};
			acts.Destroy = function ()
			{
				this.runtime.DestroyInstance(this);
			};
			if (!acts.LoadFromJsonString)
			{
				acts.LoadFromJsonString = function (str_)
				{
					var o, i, len, binst;
					try {
						o = JSON.parse(str_);
					}
					catch (e) {
						return;
					}
					this.runtime.loadInstanceFromJSON(this, o, true);
					if (this.afterLoad)
						this.afterLoad();
					if (this.behavior_insts)
					{
						for (i = 0, len = this.behavior_insts.length; i < len; ++i)
						{
							binst = this.behavior_insts[i];
							if (binst.afterLoad)
								binst.afterLoad();
						}
					}
				};
			}
			exps.Count = function (ret)
			{
				var count = ret.object_class.instances.length;
				var i, len, inst;
				for (i = 0, len = this.runtime.createRow.length; i < len; i++)
				{
					inst = this.runtime.createRow[i];
					if (ret.object_class.is_family)
					{
						if (inst.type.families.indexOf(ret.object_class) >= 0)
							count++;
					}
					else
					{
						if (inst.type === ret.object_class)
							count++;
					}
				}
				ret.set_int(count);
			};
			exps.PickedCount = function (ret)
			{
				ret.set_int(ret.object_class.getCurrentSol().getObjects().length);
			};
			exps.UID = function (ret)
			{
				ret.set_int(this.uid);
			};
			exps.IID = function (ret)
			{
				ret.set_int(this.get_iid());
			};
			if (!exps.AsJSON)
			{
				exps.AsJSON = function (ret)
				{
					ret.set_string(JSON.stringify(this.runtime.saveInstanceToJSON(this, true)));
				};
			}
		}
		if (appearance_aces)
		{
			cnds.IsVisible = function ()
			{
				return this.visible;
			};
			acts.SetVisible = function (v)
			{
				if (!v !== !this.visible)
				{
					this.visible = v;
					this.runtime.redraw = true;
				}
			};
			cnds.CompareOpacity = function (cmp, x)
			{
				return cr.do_cmp(cr.round6dp(this.opacity * 100), cmp, x);
			};
			acts.SetOpacity = function (x)
			{
				var new_opacity = x / 100.0;
				if (new_opacity < 0)
					new_opacity = 0;
				else if (new_opacity > 1)
					new_opacity = 1;
				if (new_opacity !== this.opacity)
				{
					this.opacity = new_opacity;
					this.runtime.redraw = true;
				}
			};
			exps.Opacity = function (ret)
			{
				ret.set_float(cr.round6dp(this.opacity * 100.0));
			};
		}
		if (zorder_aces)
		{
			cnds.IsOnLayer = function (layer_)
			{
				if (!layer_)
					return false;
				return this.layer === layer_;
			};
			cnds.PickTopBottom = function (which_)
			{
				var sol = this.getCurrentSol();
				var instances = sol.getObjects();
				if (!instances.length)
					return false;
				var inst = instances[0];
				var pickme = inst;
				var i, len;
				for (i = 1, len = instances.length; i < len; i++)
				{
					inst = instances[i];
					if (which_ === 0)
					{
						if (inst.layer.index > pickme.layer.index || (inst.layer.index === pickme.layer.index && inst.get_zindex() > pickme.get_zindex()))
						{
							pickme = inst;
						}
					}
					else
					{
						if (inst.layer.index < pickme.layer.index || (inst.layer.index === pickme.layer.index && inst.get_zindex() < pickme.get_zindex()))
						{
							pickme = inst;
						}
					}
				}
				sol.pick_one(pickme);
				return true;
			};
			acts.MoveToTop = function ()
			{
				var zindex = this.get_zindex();
				if (zindex === this.layer.instances.length - 1)
					return;
				cr.arrayRemove(this.layer.instances, zindex);
				this.layer.instances.push(this);
				this.runtime.redraw = true;
				this.layer.zindices_stale = true;
			};
			acts.MoveToBottom = function ()
			{
				var zindex = this.get_zindex();
				if (zindex === 0)
					return;
				cr.arrayRemove(this.layer.instances, zindex);
				this.layer.instances.unshift(this);
				this.runtime.redraw = true;
				this.layer.zindices_stale = true;
			};
			acts.MoveToLayer = function (layerMove)
			{
				if (!layerMove || layerMove == this.layer)
					return;
				cr.arrayRemove(this.layer.instances, this.get_zindex());
				this.layer.zindices_stale = true;
				this.layer = layerMove;
				this.zindex = layerMove.instances.length;
				layerMove.instances.push(this);
				this.runtime.redraw = true;
			};
			acts.ZMoveToObject = function (where_, obj_)
			{
				var isafter = (where_ === 0);
				if (!obj_)
					return;
				var other = obj_.getFirstPicked(this);
				if (!other || other.uid === this.uid)
					return;
				if (this.layer.index !== other.layer.index)
				{
					cr.arrayRemove(this.layer.instances, this.get_zindex());
					this.layer.zindices_stale = true;
					this.layer = other.layer;
					this.zindex = other.layer.instances.length;
					other.layer.instances.push(this);
				}
				var myZ = this.get_zindex();
				var insertZ = other.get_zindex();
				cr.arrayRemove(this.layer.instances, myZ);
				if (myZ < insertZ)
					insertZ--;
				if (isafter)
					insertZ++;
				if (insertZ === this.layer.instances.length)
					this.layer.instances.push(this);
				else
					this.layer.instances.splice(insertZ, 0, this);
				this.layer.zindices_stale = true;
				this.runtime.redraw = true;
			};
			exps.LayerNumber = function (ret)
			{
				ret.set_int(this.layer.number);
			};
			exps.LayerName = function (ret)
			{
				ret.set_string(this.layer.name);
			};
			exps.ZIndex = function (ret)
			{
				ret.set_int(this.get_zindex());
			};
		}
		if (effects_aces)
		{
			acts.SetEffectEnabled = function (enable_, effectname_)
			{
				if (!this.runtime.glwrap)
					return;
				var i = this.type.getEffectIndexByName(effectname_);
				if (i < 0)
					return;		// effect name not found
				var enable = (enable_ === 1);
				if (this.active_effect_flags[i] === enable)
					return;		// no change
				this.active_effect_flags[i] = enable;
				this.updateActiveEffects();
				this.runtime.redraw = true;
			};
			acts.SetEffectParam = function (effectname_, index_, value_)
			{
				if (!this.runtime.glwrap)
					return;
				var i = this.type.getEffectIndexByName(effectname_);
				if (i < 0)
					return;		// effect name not found
				var et = this.type.effect_types[i];
				var params = this.effect_params[i];
				index_ = Math.floor(index_);
				if (index_ < 0 || index_ >= params.length)
					return;		// effect index out of bounds
				if (this.runtime.glwrap.getProgramParameterType(et.shaderindex, index_) === 1)
					value_ /= 100.0;
				if (params[index_] === value_)
					return;		// no change
				params[index_] = value_;
				if (et.active)
					this.runtime.redraw = true;
			};
		}
	};
	cr.set_bbox_changed = function ()
	{
		this.bbox_changed = true;      		// will recreate next time box requested
		this.cell_changed = true;
		this.type.any_cell_changed = true;	// avoid unnecessary updateAllBBox() calls
		this.runtime.redraw = true;     	// assume runtime needs to redraw
		var i, len, callbacks = this.bbox_changed_callbacks;
		for (i = 0, len = callbacks.length; i < len; ++i)
		{
			callbacks[i](this);
		}
	};
	cr.add_bbox_changed_callback = function (f)
	{
		if (f)
		{
			this.bbox_changed_callbacks.push(f);
		}
	};
	cr.update_bbox = function ()
	{
		if (!this.bbox_changed)
			return;                 // bounding box not changed
		var bbox = this.bbox;
		var bquad = this.bquad;
		bbox.set(this.x, this.y, this.x + this.width, this.y + this.height);
		bbox.offset(-this.hotspotX * this.width, -this.hotspotY * this.height);
		if (!this.angle)
		{
			bquad.set_from_rect(bbox);    // make bounding quad from box
		}
		else
		{
			bbox.offset(-this.x, -this.y);       			// translate to origin
			bquad.set_from_rotated_rect(bbox, this.angle);	// rotate around origin
			bquad.offset(this.x, this.y);      				// translate back to original position
			bquad.bounding_box(bbox);
		}
		bbox.normalize();
		this.bbox_changed = false;  // bounding box up to date
	};
	var tmprc = new cr.rect(0, 0, 0, 0);
	cr.update_collision_cell = function ()
	{
		if (!this.cell_changed || !this.collisionsEnabled)
			return;
		this.update_bbox();
		var mygrid = this.type.collision_grid;
		var collcells = this.collcells;
		var bbox = this.bbox;
		tmprc.set(mygrid.XToCell(bbox.left), mygrid.YToCell(bbox.top), mygrid.XToCell(bbox.right), mygrid.YToCell(bbox.bottom));
		if (collcells.equals(tmprc))
			return;
		if (collcells.right < collcells.left)
			mygrid.update(this, null, tmprc);		// first insertion with invalid rect: don't provide old range
		else
			mygrid.update(this, collcells, tmprc);
		collcells.copy(tmprc);
		this.cell_changed = false;
	};
	cr.inst_contains_pt = function (x, y)
	{
		if (!this.bbox.contains_pt(x, y))
			return false;
		if (!this.bquad.contains_pt(x, y))
			return false;
		if (this.collision_poly && !this.collision_poly.is_empty())
		{
			this.collision_poly.cache_poly(this.width, this.height, this.angle);
			return this.collision_poly.contains_pt(x - this.x, y - this.y);
		}
		else
			return true;
	};
	cr.inst_get_iid = function ()
	{
		this.type.updateIIDs();
		return this.iid;
	};
	cr.inst_get_zindex = function ()
	{
		this.layer.updateZIndices();
		return this.zindex;
	};
	cr.inst_updateActiveEffects = function ()
	{
		this.active_effect_types.length = 0;
		var i, len, et, inst;
		for (i = 0, len = this.active_effect_flags.length; i < len; i++)
		{
			if (this.active_effect_flags[i])
				this.active_effect_types.push(this.type.effect_types[i]);
		}
		this.uses_shaders = !!this.active_effect_types.length;
	};
	cr.inst_toString = function ()
	{
		return "Inst" + this.puid;
	};
	cr.type_getFirstPicked = function (frominst)
	{
		if (frominst && frominst.is_contained && frominst.type != this)
		{
			var i, len, s;
			for (i = 0, len = frominst.siblings.length; i < len; i++)
			{
				s = frominst.siblings[i];
				if (s.type == this)
					return s;
			}
		}
		var instances = this.getCurrentSol().getObjects();
		if (instances.length)
			return instances[0];
		else
			return null;
	};
	cr.type_getPairedInstance = function (inst)
	{
		var instances = this.getCurrentSol().getObjects();
		if (instances.length)
			return instances[inst.get_iid() % instances.length];
		else
			return null;
	};
	cr.type_updateIIDs = function ()
	{
		if (!this.stale_iids || this.is_family)
			return;		// up to date or is family - don't want family to overwrite IIDs
		var i, len;
		for (i = 0, len = this.instances.length; i < len; i++)
			this.instances[i].iid = i;
		var next_iid = i;
		var createRow = this.runtime.createRow;
		for (i = 0, len = createRow.length; i < len; ++i)
		{
			if (createRow[i].type === this)
				createRow[i].iid = next_iid++;
		}
		this.stale_iids = false;
	};
	cr.type_getInstanceByIID = function (i)
	{
		if (i < this.instances.length)
			return this.instances[i];
		i -= this.instances.length;
		var createRow = this.runtime.createRow;
		var j, lenj;
		for (j = 0, lenj = createRow.length; j < lenj; ++j)
		{
			if (createRow[j].type === this)
			{
				if (i === 0)
					return createRow[j];
				--i;
			}
		}
;
		return null;
	};
	cr.type_getCurrentSol = function ()
	{
		return this.solstack[this.cur_sol];
	};
	cr.type_pushCleanSol = function ()
	{
		this.cur_sol++;
		if (this.cur_sol === this.solstack.length)
			this.solstack.push(new cr.selection(this));
		else
			this.solstack[this.cur_sol].select_all = true;  // else clear next SOL
	};
	cr.type_pushCopySol = function ()
	{
		this.cur_sol++;
		if (this.cur_sol === this.solstack.length)
			this.solstack.push(new cr.selection(this));
		var clonesol = this.solstack[this.cur_sol];
		var prevsol = this.solstack[this.cur_sol - 1];
		if (prevsol.select_all)
			clonesol.select_all = true;
		else
		{
			clonesol.select_all = false;
			cr.shallowAssignArray(clonesol.instances, prevsol.instances);
			cr.shallowAssignArray(clonesol.else_instances, prevsol.else_instances);
		}
	};
	cr.type_popSol = function ()
	{
;
		this.cur_sol--;
	};
	cr.type_getBehaviorByName = function (behname)
	{
		var i, len, j, lenj, f, index = 0;
		if (!this.is_family)
		{
			for (i = 0, len = this.families.length; i < len; i++)
			{
				f = this.families[i];
				for (j = 0, lenj = f.behaviors.length; j < lenj; j++)
				{
					if (behname === f.behaviors[j].name)
					{
						this.extra.lastBehIndex = index;
						return f.behaviors[j];
					}
					index++;
				}
			}
		}
		for (i = 0, len = this.behaviors.length; i < len; i++) {
			if (behname === this.behaviors[i].name)
			{
				this.extra.lastBehIndex = index;
				return this.behaviors[i];
			}
			index++;
		}
		return null;
	};
	cr.type_getBehaviorIndexByName = function (behname)
	{
		var b = this.getBehaviorByName(behname);
		if (b)
			return this.extra.lastBehIndex;
		else
			return -1;
	};
	cr.type_getEffectIndexByName = function (name_)
	{
		var i, len;
		for (i = 0, len = this.effect_types.length; i < len; i++)
		{
			if (this.effect_types[i].name === name_)
				return i;
		}
		return -1;
	};
	cr.type_applySolToContainer = function ()
	{
		if (!this.is_contained || this.is_family)
			return;
		var i, len, j, lenj, t, sol, sol2;
		this.updateIIDs();
		sol = this.getCurrentSol();
		var select_all = sol.select_all;
		var es = this.runtime.getCurrentEventStack();
		var orblock = es && es.current_event && es.current_event.orblock;
		for (i = 0, len = this.container.length; i < len; i++)
		{
			t = this.container[i];
			if (t === this)
				continue;
			t.updateIIDs();
			sol2 = t.getCurrentSol();
			sol2.select_all = select_all;
			if (!select_all)
			{
				sol2.instances.length = sol.instances.length;
				for (j = 0, lenj = sol.instances.length; j < lenj; j++)
					sol2.instances[j] = t.getInstanceByIID(sol.instances[j].iid);
				if (orblock)
				{
					sol2.else_instances.length = sol.else_instances.length;
					for (j = 0, lenj = sol.else_instances.length; j < lenj; j++)
						sol2.else_instances[j] = t.getInstanceByIID(sol.else_instances[j].iid);
				}
			}
		}
	};
	cr.type_toString = function ()
	{
		return "Type" + this.sid;
	};
	cr.do_cmp = function (x, cmp, y)
	{
		if (typeof x === "undefined" || typeof y === "undefined")
			return false;
		switch (cmp)
		{
			case 0:     // equal
				return x === y;
			case 1:     // not equal
				return x !== y;
			case 2:     // less
				return x < y;
			case 3:     // less/equal
				return x <= y;
			case 4:     // greater
				return x > y;
			case 5:     // greater/equal
				return x >= y;
			default:
;
				return false;
		}
	};
})();
cr.shaders = {};
;
;
cr.plugins_.Audio = function(runtime)
{
	this.runtime = runtime;
};
(function ()
{
	var pluginProto = cr.plugins_.Audio.prototype;
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};
	var typeProto = pluginProto.Type.prototype;
	typeProto.onCreate = function()
	{
	};
	var audRuntime = null;
	var audInst = null;
	var audTag = "";
	var appPath = "";			// for PhoneGap only
	var API_HTML5 = 0;
	var API_WEBAUDIO = 1;
	var API_PHONEGAP = 2;
	var API_APPMOBI = 3;
	var api = API_HTML5;
	var context = null;
	var audioBuffers = [];		// cache of buffers
	var audioInstances = [];	// cache of instances
	var lastAudio = null;
	var useOgg = false;			// determined at create time
	var timescale_mode = 0;
	var silent = false;
	var masterVolume = 1;
	var listenerX = 0;
	var listenerY = 0;
	var panningModel = 1;		// HRTF
	var distanceModel = 1;		// Inverse
	var refDistance = 10;
	var maxDistance = 10000;
	var rolloffFactor = 1;
	var micSource = null;
	var micTag = "";
	var isMusicWorkaround = false;
	var musicPlayNextTouch = [];
	function dbToLinear(x)
	{
		var v = dbToLinear_nocap(x);
		if (v < 0)
			v = 0;
		if (v > 1)
			v = 1;
		return v;
	};
	function linearToDb(x)
	{
		if (x < 0)
			x = 0;
		if (x > 1)
			x = 1;
		return linearToDb_nocap(x);
	};
	function dbToLinear_nocap(x)
	{
		return Math.pow(10, x / 20);
	};
	function linearToDb_nocap(x)
	{
		return (Math.log(x) / Math.log(10)) * 20;
	};
	var effects = {};
	function getDestinationForTag(tag)
	{
		tag = tag.toLowerCase();
		if (effects.hasOwnProperty(tag))
		{
			if (effects[tag].length)
				return effects[tag][0].getInputNode();
		}
		return context["destination"];
	};
	function createGain()
	{
		if (context["createGain"])
			return context["createGain"]();
		else
			return context["createGainNode"]();
	};
	function createDelay(d)
	{
		if (context["createDelay"])
			return context["createDelay"](d);
		else
			return context["createDelayNode"](d);
	};
	function startSource(s)
	{
		if (s["start"])
			s["start"](0);
		else
			s["noteOn"](0);
	};
	function startSourceAt(s, x, d)
	{
		if (s["start"])
			s["start"](0, x);
		else
			s["noteGrainOn"](0, x, d - x);
	};
	function stopSource(s)
	{
		try {
			if (s["stop"])
				s["stop"](0);
			else
				s["noteOff"](0);
		}
		catch (e) {}
	};
	function setAudioParam(ap, value, ramp, time)
	{
		if (!ap)
			return;		// iOS is missing some parameters
		ap["cancelScheduledValues"](0);
		if (time === 0)
		{
			ap["value"] = value;
			return;
		}
		var curTime = context["currentTime"];
		time += curTime;
		switch (ramp) {
		case 0:		// step
			ap["setValueAtTime"](value, time);
			break;
		case 1:		// linear
			ap["setValueAtTime"](ap["value"], curTime);		// to set what to ramp from
			ap["linearRampToValueAtTime"](value, time);
			break;
		case 2:		// exponential
			ap["setValueAtTime"](ap["value"], curTime);		// to set what to ramp from
			ap["exponentialRampToValueAtTime"](value, time);
			break;
		}
	};
	var filterTypes = ["lowpass", "highpass", "bandpass", "lowshelf", "highshelf", "peaking", "notch", "allpass"];
	function FilterEffect(type, freq, detune, q, gain, mix)
	{
		this.type = "filter";
		this.params = [type, freq, detune, q, gain, mix];
		this.inputNode = createGain();
		this.wetNode = createGain();
		this.wetNode["gain"]["value"] = mix;
		this.dryNode = createGain();
		this.dryNode["gain"]["value"] = 1 - mix;
		this.filterNode = context["createBiquadFilter"]();
		if (typeof this.filterNode["type"] === "number")
			this.filterNode["type"] = type;
		else
			this.filterNode["type"] = filterTypes[type];
		this.filterNode["frequency"]["value"] = freq;
		if (this.filterNode["detune"])		// iOS 6 doesn't have detune yet
			this.filterNode["detune"]["value"] = detune;
		this.filterNode["Q"]["value"] = q;
		this.filterNode["gain"]["value"] = gain;
		this.inputNode["connect"](this.filterNode);
		this.inputNode["connect"](this.dryNode);
		this.filterNode["connect"](this.wetNode);
	};
	FilterEffect.prototype.connectTo = function (node)
	{
		this.wetNode["disconnect"]();
		this.wetNode["connect"](node);
		this.dryNode["disconnect"]();
		this.dryNode["connect"](node);
	};
	FilterEffect.prototype.remove = function ()
	{
		this.inputNode["disconnect"]();
		this.filterNode["disconnect"]();
		this.wetNode["disconnect"]();
		this.dryNode["disconnect"]();
	};
	FilterEffect.prototype.getInputNode = function ()
	{
		return this.inputNode;
	};
	FilterEffect.prototype.setParam = function(param, value, ramp, time)
	{
		switch (param) {
		case 0:		// mix
			value = value / 100;
			if (value < 0) value = 0;
			if (value > 1) value = 1;
			this.params[5] = value;
			setAudioParam(this.wetNode["gain"], value, ramp, time);
			setAudioParam(this.dryNode["gain"], 1 - value, ramp, time);
			break;
		case 1:		// filter frequency
			this.params[1] = value;
			setAudioParam(this.filterNode["frequency"], value, ramp, time);
			break;
		case 2:		// filter detune
			this.params[2] = value;
			setAudioParam(this.filterNode["detune"], value, ramp, time);
			break;
		case 3:		// filter Q
			this.params[3] = value;
			setAudioParam(this.filterNode["Q"], value, ramp, time);
			break;
		case 4:		// filter/delay gain (note value is in dB here)
			this.params[4] = value;
			setAudioParam(this.filterNode["gain"], value, ramp, time);
			break;
		}
	};
	function DelayEffect(delayTime, delayGain, mix)
	{
		this.type = "delay";
		this.params = [delayTime, delayGain, mix];
		this.inputNode = createGain();
		this.wetNode = createGain();
		this.wetNode["gain"]["value"] = mix;
		this.dryNode = createGain();
		this.dryNode["gain"]["value"] = 1 - mix;
		this.mainNode = createGain();
		this.delayNode = createDelay(delayTime);
		this.delayNode["delayTime"]["value"] = delayTime;
		this.delayGainNode = createGain();
		this.delayGainNode["gain"]["value"] = delayGain;
		this.inputNode["connect"](this.mainNode);
		this.inputNode["connect"](this.dryNode);
		this.mainNode["connect"](this.wetNode);
		this.mainNode["connect"](this.delayNode);
		this.delayNode["connect"](this.delayGainNode);
		this.delayGainNode["connect"](this.mainNode);
	};
	DelayEffect.prototype.connectTo = function (node)
	{
		this.wetNode["disconnect"]();
		this.wetNode["connect"](node);
		this.dryNode["disconnect"]();
		this.dryNode["connect"](node);
	};
	DelayEffect.prototype.remove = function ()
	{
		this.inputNode["disconnect"]();
		this.mainNode["disconnect"]();
		this.delayNode["disconnect"]();
		this.delayGainNode["disconnect"]();
		this.wetNode["disconnect"]();
		this.dryNode["disconnect"]();
	};
	DelayEffect.prototype.getInputNode = function ()
	{
		return this.inputNode;
	};
	DelayEffect.prototype.setParam = function(param, value, ramp, time)
	{
		switch (param) {
		case 0:		// mix
			value = value / 100;
			if (value < 0) value = 0;
			if (value > 1) value = 1;
			this.params[2] = value;
			setAudioParam(this.wetNode["gain"], value, ramp, time);
			setAudioParam(this.dryNode["gain"], 1 - value, ramp, time);
			break;
		case 4:		// filter/delay gain (note value is passed in dB but needs to be linear here)
			this.params[1] = dbToLinear(value);
			setAudioParam(this.delayGainNode["gain"], dbToLinear(value), ramp, time);
			break;
		case 5:		// delay time
			this.params[0] = value;
			setAudioParam(this.delayNode["delayTime"], value, ramp, time);
			break;
		}
	};
	function ConvolveEffect(buffer, normalize, mix, src)
	{
		this.type = "convolve";
		this.params = [normalize, mix, src];
		this.inputNode = createGain();
		this.wetNode = createGain();
		this.wetNode["gain"]["value"] = mix;
		this.dryNode = createGain();
		this.dryNode["gain"]["value"] = 1 - mix;
		this.convolveNode = context["createConvolver"]();
		if (buffer)
		{
			this.convolveNode["normalize"] = normalize;
			this.convolveNode["buffer"] = buffer;
		}
		this.inputNode["connect"](this.convolveNode);
		this.inputNode["connect"](this.dryNode);
		this.convolveNode["connect"](this.wetNode);
	};
	ConvolveEffect.prototype.connectTo = function (node)
	{
		this.wetNode["disconnect"]();
		this.wetNode["connect"](node);
		this.dryNode["disconnect"]();
		this.dryNode["connect"](node);
	};
	ConvolveEffect.prototype.remove = function ()
	{
		this.inputNode["disconnect"]();
		this.convolveNode["disconnect"]();
		this.wetNode["disconnect"]();
		this.dryNode["disconnect"]();
	};
	ConvolveEffect.prototype.getInputNode = function ()
	{
		return this.inputNode;
	};
	ConvolveEffect.prototype.setParam = function(param, value, ramp, time)
	{
		switch (param) {
		case 0:		// mix
			value = value / 100;
			if (value < 0) value = 0;
			if (value > 1) value = 1;
			this.params[1] = value;
			setAudioParam(this.wetNode["gain"], value, ramp, time);
			setAudioParam(this.dryNode["gain"], 1 - value, ramp, time);
			break;
		}
	};
	function FlangerEffect(delay, modulation, freq, feedback, mix)
	{
		this.type = "flanger";
		this.params = [delay, modulation, freq, feedback, mix];
		this.inputNode = createGain();
		this.dryNode = createGain();
		this.dryNode["gain"]["value"] = 1 - (mix / 2);
		this.wetNode = createGain();
		this.wetNode["gain"]["value"] = mix / 2;
		this.feedbackNode = createGain();
		this.feedbackNode["gain"]["value"] = feedback;
		this.delayNode = createDelay(delay + modulation);
		this.delayNode["delayTime"]["value"] = delay;
		this.oscNode = context["createOscillator"]();
		this.oscNode["frequency"]["value"] = freq;
		this.oscGainNode = createGain();
		this.oscGainNode["gain"]["value"] = modulation;
		this.inputNode["connect"](this.delayNode);
		this.inputNode["connect"](this.dryNode);
		this.delayNode["connect"](this.wetNode);
		this.delayNode["connect"](this.feedbackNode);
		this.feedbackNode["connect"](this.delayNode);
		this.oscNode["connect"](this.oscGainNode);
		this.oscGainNode["connect"](this.delayNode["delayTime"]);
		startSource(this.oscNode);
	};
	FlangerEffect.prototype.connectTo = function (node)
	{
		this.dryNode["disconnect"]();
		this.dryNode["connect"](node);
		this.wetNode["disconnect"]();
		this.wetNode["connect"](node);
	};
	FlangerEffect.prototype.remove = function ()
	{
		this.inputNode["disconnect"]();
		this.delayNode["disconnect"]();
		this.oscNode["disconnect"]();
		this.oscGainNode["disconnect"]();
		this.dryNode["disconnect"]();
		this.wetNode["disconnect"]();
		this.feedbackNode["disconnect"]();
	};
	FlangerEffect.prototype.getInputNode = function ()
	{
		return this.inputNode;
	};
	FlangerEffect.prototype.setParam = function(param, value, ramp, time)
	{
		switch (param) {
		case 0:		// mix
			value = value / 100;
			if (value < 0) value = 0;
			if (value > 1) value = 1;
			this.params[4] = value;
			setAudioParam(this.wetNode["gain"], value / 2, ramp, time);
			setAudioParam(this.dryNode["gain"], 1 - (value / 2), ramp, time);
			break;
		case 6:		// modulation
			this.params[1] = value / 1000;
			setAudioParam(this.oscGainNode["gain"], value / 1000, ramp, time);
			break;
		case 7:		// modulation frequency
			this.params[2] = value;
			setAudioParam(this.oscNode["frequency"], value, ramp, time);
			break;
		case 8:		// feedback
			this.params[3] = value / 100;
			setAudioParam(this.feedbackNode["gain"], value / 100, ramp, time);
			break;
		}
	};
	function PhaserEffect(freq, detune, q, modulation, modfreq, mix)
	{
		this.type = "phaser";
		this.params = [freq, detune, q, modulation, modfreq, mix];
		this.inputNode = createGain();
		this.dryNode = createGain();
		this.dryNode["gain"]["value"] = 1 - (mix / 2);
		this.wetNode = createGain();
		this.wetNode["gain"]["value"] = mix / 2;
		this.filterNode = context["createBiquadFilter"]();
		if (typeof this.filterNode["type"] === "number")
			this.filterNode["type"] = 7;	// all-pass
		else
			this.filterNode["type"] = "allpass";
		this.filterNode["frequency"]["value"] = freq;
		if (this.filterNode["detune"])		// iOS 6 doesn't have detune yet
			this.filterNode["detune"]["value"] = detune;
		this.filterNode["Q"]["value"] = q;
		this.oscNode = context["createOscillator"]();
		this.oscNode["frequency"]["value"] = modfreq;
		this.oscGainNode = createGain();
		this.oscGainNode["gain"]["value"] = modulation;
		this.inputNode["connect"](this.filterNode);
		this.inputNode["connect"](this.dryNode);
		this.filterNode["connect"](this.wetNode);
		this.oscNode["connect"](this.oscGainNode);
		this.oscGainNode["connect"](this.filterNode["frequency"]);
		startSource(this.oscNode);
	};
	PhaserEffect.prototype.connectTo = function (node)
	{
		this.dryNode["disconnect"]();
		this.dryNode["connect"](node);
		this.wetNode["disconnect"]();
		this.wetNode["connect"](node);
	};
	PhaserEffect.prototype.remove = function ()
	{
		this.inputNode["disconnect"]();
		this.filterNode["disconnect"]();
		this.oscNode["disconnect"]();
		this.oscGainNode["disconnect"]();
		this.dryNode["disconnect"]();
		this.wetNode["disconnect"]();
	};
	PhaserEffect.prototype.getInputNode = function ()
	{
		return this.inputNode;
	};
	PhaserEffect.prototype.setParam = function(param, value, ramp, time)
	{
		switch (param) {
		case 0:		// mix
			value = value / 100;
			if (value < 0) value = 0;
			if (value > 1) value = 1;
			this.params[5] = value;
			setAudioParam(this.wetNode["gain"], value / 2, ramp, time);
			setAudioParam(this.dryNode["gain"], 1 - (value / 2), ramp, time);
			break;
		case 1:		// filter frequency
			this.params[0] = value;
			setAudioParam(this.filterNode["frequency"], value, ramp, time);
			break;
		case 2:		// filter detune
			this.params[1] = value;
			setAudioParam(this.filterNode["detune"], value, ramp, time);
			break;
		case 3:		// filter Q
			this.params[2] = value;
			setAudioParam(this.filterNode["Q"], value, ramp, time);
			break;
		case 6:		// modulation
			this.params[3] = value;
			setAudioParam(this.oscGainNode["gain"], value, ramp, time);
			break;
		case 7:		// modulation frequency
			this.params[4] = value;
			setAudioParam(this.oscNode["frequency"], value, ramp, time);
			break;
		}
	};
	function GainEffect(g)
	{
		this.type = "gain";
		this.params = [g];
		this.node = createGain();
		this.node["gain"]["value"] = g;
	};
	GainEffect.prototype.connectTo = function (node_)
	{
		this.node["disconnect"]();
		this.node["connect"](node_);
	};
	GainEffect.prototype.remove = function ()
	{
		this.node["disconnect"]();
	};
	GainEffect.prototype.getInputNode = function ()
	{
		return this.node;
	};
	GainEffect.prototype.setParam = function(param, value, ramp, time)
	{
		switch (param) {
		case 4:		// gain
			this.params[0] = dbToLinear(value);
			setAudioParam(this.node["gain"], dbToLinear(value), ramp, time);
			break;
		}
	};
	function TremoloEffect(freq, mix)
	{
		this.type = "tremolo";
		this.params = [freq, mix];
		this.node = createGain();
		this.node["gain"]["value"] = 1 - (mix / 2);
		this.oscNode = context["createOscillator"]();
		this.oscNode["frequency"]["value"] = freq;
		this.oscGainNode = createGain();
		this.oscGainNode["gain"]["value"] = mix / 2;
		this.oscNode["connect"](this.oscGainNode);
		this.oscGainNode["connect"](this.node["gain"]);
		startSource(this.oscNode);
	};
	TremoloEffect.prototype.connectTo = function (node_)
	{
		this.node["disconnect"]();
		this.node["connect"](node_);
	};
	TremoloEffect.prototype.remove = function ()
	{
		this.oscNode["disconnect"]();
		this.oscGainNode["disconnect"]();
		this.node["disconnect"]();
	};
	TremoloEffect.prototype.getInputNode = function ()
	{
		return this.node;
	};
	TremoloEffect.prototype.setParam = function(param, value, ramp, time)
	{
		switch (param) {
		case 0:		// mix
			value = value / 100;
			if (value < 0) value = 0;
			if (value > 1) value = 1;
			this.params[1] = value;
			setAudioParam(this.node["gain"]["value"], 1 - (value / 2), ramp, time);
			setAudioParam(this.oscGainNode["gain"]["value"], value / 2, ramp, time);
			break;
		case 7:		// modulation frequency
			this.params[0] = value;
			setAudioParam(this.oscNode["frequency"], value, ramp, time);
			break;
		}
	};
	function RingModulatorEffect(freq, mix)
	{
		this.type = "ringmod";
		this.params = [freq, mix];
		this.inputNode = createGain();
		this.wetNode = createGain();
		this.wetNode["gain"]["value"] = mix;
		this.dryNode = createGain();
		this.dryNode["gain"]["value"] = 1 - mix;
		this.ringNode = createGain();
		this.ringNode["gain"]["value"] = 0;
		this.oscNode = context["createOscillator"]();
		this.oscNode["frequency"]["value"] = freq;
		this.oscNode["connect"](this.ringNode["gain"]);
		startSource(this.oscNode);
		this.inputNode["connect"](this.ringNode);
		this.inputNode["connect"](this.dryNode);
		this.ringNode["connect"](this.wetNode);
	};
	RingModulatorEffect.prototype.connectTo = function (node_)
	{
		this.wetNode["disconnect"]();
		this.wetNode["connect"](node_);
		this.dryNode["disconnect"]();
		this.dryNode["connect"](node_);
	};
	RingModulatorEffect.prototype.remove = function ()
	{
		this.oscNode["disconnect"]();
		this.ringNode["disconnect"]();
		this.inputNode["disconnect"]();
		this.wetNode["disconnect"]();
		this.dryNode["disconnect"]();
	};
	RingModulatorEffect.prototype.getInputNode = function ()
	{
		return this.inputNode;
	};
	RingModulatorEffect.prototype.setParam = function(param, value, ramp, time)
	{
		switch (param) {
		case 0:		// mix
			value = value / 100;
			if (value < 0) value = 0;
			if (value > 1) value = 1;
			this.params[1] = value;
			setAudioParam(this.wetNode["gain"], value, ramp, time);
			setAudioParam(this.dryNode["gain"], 1 - value, ramp, time);
			break;
		case 7:		// modulation frequency
			this.params[0] = value;
			setAudioParam(this.oscNode["frequency"], value, ramp, time);
			break;
		}
	};
	function DistortionEffect(threshold, headroom, drive, makeupgain, mix)
	{
		this.type = "distortion";
		this.params = [threshold, headroom, drive, makeupgain, mix];
		this.inputNode = createGain();
		this.preGain = createGain();
		this.postGain = createGain();
		this.setDrive(drive, dbToLinear_nocap(makeupgain));
		this.wetNode = createGain();
		this.wetNode["gain"]["value"] = mix;
		this.dryNode = createGain();
		this.dryNode["gain"]["value"] = 1 - mix;
		this.waveShaper = context["createWaveShaper"]();
		this.curve = new Float32Array(65536);
		this.generateColortouchCurve(threshold, headroom);
		this.waveShaper.curve = this.curve;
		this.inputNode["connect"](this.preGain);
		this.inputNode["connect"](this.dryNode);
		this.preGain["connect"](this.waveShaper);
		this.waveShaper["connect"](this.postGain);
		this.postGain["connect"](this.wetNode);
	};
	DistortionEffect.prototype.setDrive = function (drive, makeupgain)
	{
		if (drive < 0.01)
			drive = 0.01;
		this.preGain["gain"]["value"] = drive;
		this.postGain["gain"]["value"] = Math.pow(1 / drive, 0.6) * makeupgain;
	};
	function e4(x, k)
	{
		return 1.0 - Math.exp(-k * x);
	}
	DistortionEffect.prototype.shape = function (x, linearThreshold, linearHeadroom)
	{
		var maximum = 1.05 * linearHeadroom * linearThreshold;
		var kk = (maximum - linearThreshold);
		var sign = x < 0 ? -1 : +1;
		var absx = x < 0 ? -x : x;
		var shapedInput = absx < linearThreshold ? absx : linearThreshold + kk * e4(absx - linearThreshold, 1.0 / kk);
		shapedInput *= sign;
		return shapedInput;
	};
	DistortionEffect.prototype.generateColortouchCurve = function (threshold, headroom)
	{
		var linearThreshold = dbToLinear_nocap(threshold);
		var linearHeadroom = dbToLinear_nocap(headroom);
		var n = 65536;
		var n2 = n / 2;
		var x = 0;
		for (var i = 0; i < n2; ++i) {
			x = i / n2;
			x = this.shape(x, linearThreshold, linearHeadroom);
			this.curve[n2 + i] = x;
			this.curve[n2 - i - 1] = -x;
		}
	};
	DistortionEffect.prototype.connectTo = function (node)
	{
		this.wetNode["disconnect"]();
		this.wetNode["connect"](node);
		this.dryNode["disconnect"]();
		this.dryNode["connect"](node);
	};
	DistortionEffect.prototype.remove = function ()
	{
		this.inputNode["disconnect"]();
		this.preGain["disconnect"]();
		this.waveShaper["disconnect"]();
		this.postGain["disconnect"]();
		this.wetNode["disconnect"]();
		this.dryNode["disconnect"]();
	};
	DistortionEffect.prototype.getInputNode = function ()
	{
		return this.inputNode;
	};
	DistortionEffect.prototype.setParam = function(param, value, ramp, time)
	{
		switch (param) {
		case 0:		// mix
			value = value / 100;
			if (value < 0) value = 0;
			if (value > 1) value = 1;
			this.params[4] = value;
			setAudioParam(this.wetNode["gain"], value, ramp, time);
			setAudioParam(this.dryNode["gain"], 1 - value, ramp, time);
			break;
		}
	};
	function CompressorEffect(threshold, knee, ratio, attack, release)
	{
		this.type = "compressor";
		this.params = [threshold, knee, ratio, attack, release];
		this.node = context["createDynamicsCompressor"]();
		try {
			this.node["threshold"]["value"] = threshold;
			this.node["knee"]["value"] = knee;
			this.node["ratio"]["value"] = ratio;
			this.node["attack"]["value"] = attack;
			this.node["release"]["value"] = release;
		}
		catch (e) {}
	};
	CompressorEffect.prototype.connectTo = function (node_)
	{
		this.node["disconnect"]();
		this.node["connect"](node_);
	};
	CompressorEffect.prototype.remove = function ()
	{
		this.node["disconnect"]();
	};
	CompressorEffect.prototype.getInputNode = function ()
	{
		return this.node;
	};
	CompressorEffect.prototype.setParam = function(param, value, ramp, time)
	{
	};
	function AnalyserEffect(fftSize, smoothing)
	{
		this.type = "analyser";
		this.params = [fftSize, smoothing];
		this.node = context["createAnalyser"]();
		this.node["fftSize"] = fftSize;
		this.node["smoothingTimeConstant"] = smoothing;
		this.freqBins = new Float32Array(this.node["frequencyBinCount"]);
		this.signal = new Uint8Array(fftSize);
		this.peak = 0;
		this.rms = 0;
	};
	AnalyserEffect.prototype.tick = function ()
	{
		this.node["getFloatFrequencyData"](this.freqBins);
		this.node["getByteTimeDomainData"](this.signal);
		var fftSize = this.node["fftSize"];
		var i = 0;
		this.peak = 0;
		var rmsSquaredSum = 0;
		var s = 0;
		for ( ; i < fftSize; i++)
		{
			s = (this.signal[i] - 128) / 128;
			if (s < 0)
				s = -s;
			if (this.peak < s)
				this.peak = s;
			rmsSquaredSum += s * s;
		}
		this.peak = linearToDb(this.peak);
		this.rms = linearToDb(Math.sqrt(rmsSquaredSum / fftSize));
	};
	AnalyserEffect.prototype.connectTo = function (node_)
	{
		this.node["disconnect"]();
		this.node["connect"](node_);
	};
	AnalyserEffect.prototype.remove = function ()
	{
		this.node["disconnect"]();
	};
	AnalyserEffect.prototype.getInputNode = function ()
	{
		return this.node;
	};
	AnalyserEffect.prototype.setParam = function(param, value, ramp, time)
	{
	};
	var OT_POS_SAMPLES = 4;
	function ObjectTracker()
	{
		this.obj = null;
		this.loadUid = 0;
		this.speeds = [];
		this.lastX = 0;
		this.lastY = 0;
		this.moveAngle = 0;
	};
	ObjectTracker.prototype.setObject = function (obj_)
	{
		this.obj = obj_;
		if (this.obj)
		{
			this.lastX = this.obj.x;
			this.lastY = this.obj.y;
		}
		this.speeds.length = 0;
	};
	ObjectTracker.prototype.hasObject = function ()
	{
		return !!this.obj;
	};
	ObjectTracker.prototype.tick = function (dt)
	{
		if (!this.obj || dt === 0)
			return;
		this.moveAngle = cr.angleTo(this.lastX, this.lastY, this.obj.x, this.obj.y);
		var s = cr.distanceTo(this.lastX, this.lastY, this.obj.x, this.obj.y) / dt;
		if (this.speeds.length < OT_POS_SAMPLES)
			this.speeds.push(s);
		else
		{
			this.speeds.shift();
			this.speeds.push(s);
		}
		this.lastX = this.obj.x;
		this.lastY = this.obj.y;
	};
	ObjectTracker.prototype.getSpeed = function ()
	{
		if (!this.speeds.length)
			return 0;
		var i, len, sum = 0;
		for (i = 0, len = this.speeds.length; i < len; i++)
		{
			sum += this.speeds[i];
		}
		return sum / this.speeds.length;
	};
	ObjectTracker.prototype.getVelocityX = function ()
	{
		return Math.cos(this.moveAngle) * this.getSpeed();
	};
	ObjectTracker.prototype.getVelocityY = function ()
	{
		return Math.sin(this.moveAngle) * this.getSpeed();
	};
	var iOShadtouch = false;	// has had touch input on iOS to work around web audio API muting
	function C2AudioBuffer(src_, is_music)
	{
		this.src = src_;
		this.myapi = api;
		this.is_music = is_music;
		this.added_end_listener = false;
		var self = this;
		this.outNode = null;
		this.mediaSourceNode = null;
		this.panWhenReady = [];		// for web audio API positioned sounds
		this.seekWhenReady = 0;
		this.pauseWhenReady = false;
		this.supportWebAudioAPI = false;
		if (api === API_WEBAUDIO && is_music)
		{
			this.myapi = API_HTML5;
			this.outNode = createGain();
		}
		this.bufferObject = null;			// actual audio object
		this.audioData = null;				// web audio api: ajax request result (compressed audio that needs decoding)
		var request;
		switch (this.myapi) {
		case API_HTML5:
			this.bufferObject = new Audio();
			if (api === API_WEBAUDIO && context["createMediaElementSource"] && !audRuntime.isFirefox)
			{
				this.supportWebAudioAPI = true;		// can be routed through web audio api
				this.bufferObject.addEventListener("canplay", function ()
				{
					if (!self.mediaSourceNode)		// protect against this event firing twice
					{
						self.mediaSourceNode = context["createMediaElementSource"](self.bufferObject);
						self.mediaSourceNode["connect"](self.outNode);
					}
				});
			}
			this.bufferObject.autoplay = false;	// this is only a source buffer, not an instance
			this.bufferObject.preload = "auto";
			this.bufferObject.src = src_;
			break;
		case API_WEBAUDIO:
			request = new XMLHttpRequest();
			request.open("GET", src_, true);
			request.responseType = "arraybuffer";
			request.onload = function () {
				self.audioData = request.response;
				self.decodeAudioBuffer();
			};
			request.send();
			break;
		case API_PHONEGAP:
			this.bufferObject = true;
			break;
		case API_APPMOBI:
			this.bufferObject = true;
			break;
		}
	};
	C2AudioBuffer.prototype.decodeAudioBuffer = function ()
	{
		if (this.bufferObject || !this.audioData)
			return;		// audio already decoded or AJAX request not yet complete
		var self = this;
		if (context["decodeAudioData"])
		{
			context["decodeAudioData"](this.audioData, function (buffer) {
					self.bufferObject = buffer;
					var p, i, len, a;
					if (!cr.is_undefined(self.playTagWhenReady) && !silent)
					{
						if (self.panWhenReady.length)
						{
							for (i = 0, len = self.panWhenReady.length; i < len; i++)
							{
								p = self.panWhenReady[i];
								a = new C2AudioInstance(self, p.thistag);
								a.setPannerEnabled(true);
								if (typeof p.objUid !== "undefined")
								{
									p.obj = audRuntime.getObjectByUID(p.objUid);
									if (!p.obj)
										continue;
								}
								if (p.obj)
								{
									var px = cr.rotatePtAround(p.obj.x, p.obj.y, -p.obj.layer.getAngle(), listenerX, listenerY, true);
									var py = cr.rotatePtAround(p.obj.x, p.obj.y, -p.obj.layer.getAngle(), listenerX, listenerY, false);
									a.setPan(px, py, cr.to_degrees(p.obj.angle - p.obj.layer.getAngle()), p.ia, p.oa, p.og);
									a.setObject(p.obj);
								}
								else
								{
									a.setPan(p.x, p.y, p.a, p.ia, p.oa, p.og);
								}
								a.play(self.loopWhenReady, self.volumeWhenReady, self.seekWhenReady);
								if (self.pauseWhenReady)
									a.pause();
								audioInstances.push(a);
							}
							self.panWhenReady.length = 0;
						}
						else
						{
							a = new C2AudioInstance(self, self.playTagWhenReady);
							a.play(self.loopWhenReady, self.volumeWhenReady, self.seekWhenReady);
							if (self.pauseWhenReady)
								a.pause();
							audioInstances.push(a);
						}
					}
					else if (!cr.is_undefined(self.convolveWhenReady))
					{
						var convolveNode = self.convolveWhenReady.convolveNode;
						convolveNode["normalize"] = self.normalizeWhenReady;
						convolveNode["buffer"] = buffer;
					}
			});
		}
		else
		{
			this.bufferObject = context["createBuffer"](this.audioData, false);
			if (!cr.is_undefined(this.playTagWhenReady) && !silent)
			{
				var a = new C2AudioInstance(this, this.playTagWhenReady);
				a.play(this.loopWhenReady, this.volumeWhenReady, this.seekWhenReady);
				if (this.pauseWhenReady)
					a.pause();
				audioInstances.push(a);
			}
			else if (!cr.is_undefined(this.convolveWhenReady))
			{
				var convolveNode = this.convolveWhenReady.convolveNode;
				convolveNode["normalize"] = this.normalizeWhenReady;
				convolveNode["buffer"] = this.bufferObject;
			}
		}
	};
	C2AudioBuffer.prototype.isLoaded = function ()
	{
		switch (this.myapi) {
		case API_HTML5:
			return this.bufferObject["readyState"] === 4;	// HAVE_ENOUGH_DATA
		case API_WEBAUDIO:
			return !!this.audioData;			// null until AJAX request completes
		case API_PHONEGAP:
			return true;
		case API_APPMOBI:
			return true;
		}
		return false;
	};
	function C2AudioInstance(buffer_, tag_)
	{
		var self = this;
		this.tag = tag_;
		this.fresh = true;
		this.stopped = true;
		this.src = buffer_.src;
		this.buffer = buffer_;
		this.myapi = api;
		this.is_music = buffer_.is_music;
		this.playbackRate = 1;
		this.pgended = true;			// for PhoneGap only: ended flag
		this.resume_me = false;			// make sure resumes when leaving suspend
		this.is_paused = false;
		this.resume_position = 0;		// for web audio api to resume from correct playback position
		this.looping = false;
		this.is_muted = false;
		this.is_silent = false;
		this.volume = 1;
		this.mutevol = 1;
		this.startTime = audRuntime.kahanTime.sum;
		this.gainNode = null;
		this.pannerNode = null;
		this.pannerEnabled = false;
		this.objectTracker = null;
		this.panX = 0;
		this.panY = 0;
		this.panAngle = 0;
		this.panConeInner = 0;
		this.panConeOuter = 0;
		this.panConeOuterGain = 0;
		this.instanceObject = null;
		var add_end_listener = false;
		if (this.myapi === API_WEBAUDIO && this.buffer.myapi === API_HTML5 && !this.buffer.supportWebAudioAPI)
			this.myapi = API_HTML5;
		switch (this.myapi) {
		case API_HTML5:
			if (this.is_music)
			{
				this.instanceObject = buffer_.bufferObject;
				add_end_listener = !buffer_.added_end_listener;
				buffer_.added_end_listener = true;
			}
			else
			{
				this.instanceObject = new Audio();
				this.instanceObject.autoplay = false;
				this.instanceObject.src = buffer_.bufferObject.src;
				add_end_listener = true;
			}
			if (add_end_listener)
			{
				this.instanceObject.addEventListener('ended', function () {
						audTag = self.tag;
						self.stopped = true;
						audRuntime.trigger(cr.plugins_.Audio.prototype.cnds.OnEnded, audInst);
				});
			}
			break;
		case API_WEBAUDIO:
			this.gainNode = createGain();
			this.gainNode["connect"](getDestinationForTag(tag_));
			if (this.buffer.myapi === API_WEBAUDIO)
			{
				if (buffer_.bufferObject)
				{
					this.instanceObject = context["createBufferSource"]();
					this.instanceObject["buffer"] = buffer_.bufferObject;
					this.instanceObject["connect"](this.gainNode);
				}
			}
			else
			{
				this.instanceObject = this.buffer.bufferObject;		// reference the audio element
				this.buffer.outNode["connect"](this.gainNode);
			}
			break;
		case API_PHONEGAP:
			this.instanceObject = new window["Media"](appPath + this.src, null, null, function (status) {
					if (status === window["Media"]["MEDIA_STOPPED"])
					{
						self.pgended = true;
						self.stopped = true;
						audTag = self.tag;
						audRuntime.trigger(cr.plugins_.Audio.prototype.cnds.OnEnded, audInst);
					}
			});
			break;
		case API_APPMOBI:
			this.instanceObject = true;
			break;
		}
	};
	C2AudioInstance.prototype.hasEnded = function ()
	{
		switch (this.myapi) {
		case API_HTML5:
			return this.instanceObject.ended;
		case API_WEBAUDIO:
			if (this.buffer.myapi === API_WEBAUDIO)
			{
				if (!this.fresh && !this.stopped && this.instanceObject["loop"])
					return false;
				if (this.is_paused)
					return false;
				return (audRuntime.kahanTime.sum - this.startTime) > this.buffer.bufferObject["duration"];
			}
			else
				return this.instanceObject.ended;
		case API_PHONEGAP:
			return this.pgended;
		case API_APPMOBI:
			true;	// recycling an AppMobi sound does not matter because it will just do another throwaway playSound
		}
		return true;
	};
	C2AudioInstance.prototype.canBeRecycled = function ()
	{
		if (this.fresh || this.stopped)
			return true;		// not yet used or is not playing
		return this.hasEnded();
	};
	C2AudioInstance.prototype.setPannerEnabled = function (enable_)
	{
		if (api !== API_WEBAUDIO)
			return;
		if (!this.pannerEnabled && enable_)
		{
			if (!this.gainNode)
				return;
			if (!this.pannerNode)
			{
				this.pannerNode = context["createPanner"]();
				if (typeof this.pannerNode["panningModel"] === "number")
					this.pannerNode["panningModel"] = panningModel;
				else
					this.pannerNode["panningModel"] = ["equalpower", "HRTF", "soundfield"][panningModel];
				if (typeof this.pannerNode["distanceModel"] === "number")
					this.pannerNode["distanceModel"] = distanceModel;
				else
					this.pannerNode["distanceModel"] = ["linear", "inverse", "exponential"][distanceModel];
				this.pannerNode["refDistance"] = refDistance;
				this.pannerNode["maxDistance"] = maxDistance;
				this.pannerNode["rolloffFactor"] = rolloffFactor;
			}
			this.gainNode["disconnect"]();
			this.gainNode["connect"](this.pannerNode);
			this.pannerNode["connect"](getDestinationForTag(this.tag));
			this.pannerEnabled = true;
		}
		else if (this.pannerEnabled && !enable_)
		{
			if (!this.gainNode)
				return;
			this.pannerNode["disconnect"]();
			this.gainNode["disconnect"]();
			this.gainNode["connect"](getDestinationForTag(this.tag));
			this.pannerEnabled = false;
		}
	};
	C2AudioInstance.prototype.setPan = function (x, y, angle, innerangle, outerangle, outergain)
	{
		if (!this.pannerEnabled || api !== API_WEBAUDIO)
			return;
		this.pannerNode["setPosition"](x, y, 0);
		this.pannerNode["setOrientation"](Math.cos(cr.to_radians(angle)), Math.sin(cr.to_radians(angle)), 0);
		this.pannerNode["coneInnerAngle"] = innerangle;
		this.pannerNode["coneOuterAngle"] = outerangle;
		this.pannerNode["coneOuterGain"] = outergain;
		this.panX = x;
		this.panY = y;
		this.panAngle = angle;
		this.panConeInner = innerangle;
		this.panConeOuter = outerangle;
		this.panConeOuterGain = outergain;
	};
	C2AudioInstance.prototype.setObject = function (o)
	{
		if (!this.pannerEnabled || api !== API_WEBAUDIO)
			return;
		if (!this.objectTracker)
			this.objectTracker = new ObjectTracker();
		this.objectTracker.setObject(o);
	};
	C2AudioInstance.prototype.tick = function (dt)
	{
		if (!this.pannerEnabled || api !== API_WEBAUDIO || !this.objectTracker || !this.objectTracker.hasObject() || !this.isPlaying())
		{
			return;
		}
		this.objectTracker.tick(dt);
		var inst = this.objectTracker.obj;
		var px = cr.rotatePtAround(inst.x, inst.y, -inst.layer.getAngle(), listenerX, listenerY, true);
		var py = cr.rotatePtAround(inst.x, inst.y, -inst.layer.getAngle(), listenerX, listenerY, false);
		this.pannerNode["setPosition"](px, py, 0);
		var a = 0;
		if (typeof this.objectTracker.obj.angle !== "undefined")
		{
			a = inst.angle - inst.layer.getAngle();
			this.pannerNode["setOrientation"](Math.cos(a), Math.sin(a), 0);
		}
		px = cr.rotatePtAround(this.objectTracker.getVelocityX(), this.objectTracker.getVelocityY(), -inst.layer.getAngle(), 0, 0, true);
		py = cr.rotatePtAround(this.objectTracker.getVelocityX(), this.objectTracker.getVelocityY(), -inst.layer.getAngle(), 0, 0, false);
		this.pannerNode["setVelocity"](px, py, 0);
	};
	C2AudioInstance.prototype.play = function (looping, vol, fromPosition)
	{
		var instobj = this.instanceObject;
		this.looping = looping;
		this.volume = vol;
		var seekPos = fromPosition || 0;
		switch (this.myapi) {
		case API_HTML5:
			if (instobj.playbackRate !== 1.0)
				instobj.playbackRate = 1.0;
			if (instobj.volume !== vol * masterVolume)
				instobj.volume = vol * masterVolume;
			if (instobj.loop !== looping)
				instobj.loop = looping;
			if (instobj.muted)
				instobj.muted = false;
			if (instobj.currentTime !== seekPos)
			{
				try {
					instobj.currentTime = seekPos;
				}
				catch (err)
				{
;
				}
			}
			if (this.is_music && isMusicWorkaround && !audRuntime.isInUserInputEvent)
				musicPlayNextTouch.push(this);
			else
				this.instanceObject.play();
			break;
		case API_WEBAUDIO:
			this.muted = false;
			this.mutevol = 1;
			if (this.buffer.myapi === API_WEBAUDIO)
			{
				if (!this.fresh)
				{
					this.instanceObject = context["createBufferSource"]();
					this.instanceObject["buffer"] = this.buffer.bufferObject;
					this.instanceObject["connect"](this.gainNode);
				}
				this.instanceObject.loop = looping;
				this.gainNode["gain"]["value"] = vol * masterVolume;
				if (seekPos === 0)
					startSource(this.instanceObject);
				else
					startSourceAt(this.instanceObject, seekPos, this.getDuration());
			}
			else
			{
				if (instobj.playbackRate !== 1.0)
					instobj.playbackRate = 1.0;
				if (instobj.loop !== looping)
					instobj.loop = looping;
				this.gainNode["gain"]["value"] = vol * masterVolume;
				if (instobj.currentTime !== seekPos)
				{
					try {
						instobj.currentTime = seekPos;
					}
					catch (err)
					{
;
					}
				}
				if (this.is_music && isMusicWorkaround && !audRuntime.isInUserInputEvent)
					musicPlayNextTouch.push(this);
				else
					instobj.play();
			}
			break;
		case API_PHONEGAP:
			if ((!this.fresh && this.stopped) || seekPos !== 0)
				instobj["seekTo"](seekPos);
			instobj["play"]();
			this.pgended = false;
			break;
		case API_APPMOBI:
			if (audRuntime.isDirectCanvas)
				AppMobi["context"]["playSound"](this.src, looping);
			else
				AppMobi["player"]["playSound"](this.src, looping);
			break;
		}
		this.playbackRate = 1;
		this.startTime = audRuntime.kahanTime.sum - seekPos;
		this.fresh = false;
		this.stopped = false;
		this.is_paused = false;
	};
	C2AudioInstance.prototype.stop = function ()
	{
		switch (this.myapi) {
		case API_HTML5:
			if (!this.instanceObject.paused)
				this.instanceObject.pause();
			break;
		case API_WEBAUDIO:
			if (this.buffer.myapi === API_WEBAUDIO)
				stopSource(this.instanceObject);
			else
			{
				if (!this.instanceObject.paused)
					this.instanceObject.pause();
			}
			break;
		case API_PHONEGAP:
			this.instanceObject["stop"]();
			break;
		case API_APPMOBI:
			if (audRuntime.isDirectCanvas)
				AppMobi["context"]["stopSound"](this.src);
			break;
		}
		this.stopped = true;
		this.is_paused = false;
	};
	C2AudioInstance.prototype.pause = function ()
	{
		if (this.fresh || this.stopped || this.hasEnded() || this.is_paused)
			return;
		switch (this.myapi) {
		case API_HTML5:
			if (!this.instanceObject.paused)
				this.instanceObject.pause();
			break;
		case API_WEBAUDIO:
			if (this.buffer.myapi === API_WEBAUDIO)
			{
				this.resume_position = this.getPlaybackTime();
				if (this.looping)
					this.resume_position = this.resume_position % this.getDuration();
				stopSource(this.instanceObject);
			}
			else
			{
				if (!this.instanceObject.paused)
					this.instanceObject.pause();
			}
			break;
		case API_PHONEGAP:
			this.instanceObject["pause"]();
			break;
		case API_APPMOBI:
			if (audRuntime.isDirectCanvas)
				AppMobi["context"]["stopSound"](this.src);
			break;
		}
		this.is_paused = true;
	};
	C2AudioInstance.prototype.resume = function ()
	{
		if (this.fresh || this.stopped || this.hasEnded() || !this.is_paused)
			return;
		switch (this.myapi) {
		case API_HTML5:
			this.instanceObject.play();
			break;
		case API_WEBAUDIO:
			if (this.buffer.myapi === API_WEBAUDIO)
			{
				this.instanceObject = context["createBufferSource"]();
				this.instanceObject["buffer"] = this.buffer.bufferObject;
				this.instanceObject["connect"](this.gainNode);
				this.instanceObject.loop = this.looping;
				this.gainNode["gain"]["value"] = masterVolume * this.volume * this.mutevol;
				this.startTime = audRuntime.kahanTime.sum - this.resume_position;
				startSourceAt(this.instanceObject, this.resume_position, this.getDuration());
			}
			else
			{
				this.instanceObject.play();
			}
			break;
		case API_PHONEGAP:
			this.instanceObject["play"]();
			break;
		case API_APPMOBI:
			if (audRuntime.isDirectCanvas)
				AppMobi["context"]["resumeSound"](this.src);
			break;
		}
		this.is_paused = false;
	};
	C2AudioInstance.prototype.seek = function (pos)
	{
		if (this.fresh || this.stopped || this.hasEnded())
			return;
		switch (this.myapi) {
		case API_HTML5:
			try {
				this.instanceObject.currentTime = pos;
			}
			catch (e) {}
			break;
		case API_WEBAUDIO:
			if (this.buffer.myapi === API_WEBAUDIO)
			{
				if (this.is_paused)
					this.resume_position = pos;
				else
				{
					this.pause();
					this.resume_position = pos;
					this.resume();
				}
			}
			else
			{
				try {
					this.instanceObject.currentTime = pos;
				}
				catch (e) {}
			}
			break;
		case API_PHONEGAP:
			break;
		case API_APPMOBI:
			if (audRuntime.isDirectCanvas)
				AppMobi["context"]["seekSound"](this.src, pos);
			break;
		}
	};
	C2AudioInstance.prototype.reconnect = function (toNode)
	{
		if (this.myapi !== API_WEBAUDIO)
			return;
		if (this.pannerEnabled)
		{
			this.pannerNode["disconnect"]();
			this.pannerNode["connect"](toNode);
		}
		else
		{
			this.gainNode["disconnect"]();
			this.gainNode["connect"](toNode);
		}
	};
	C2AudioInstance.prototype.getDuration = function ()
	{
		switch (this.myapi) {
		case API_HTML5:
			if (typeof this.instanceObject.duration !== "undefined")
				return this.instanceObject.duration;
			else
				return 0;
		case API_WEBAUDIO:
			return this.buffer.bufferObject["duration"];
		case API_PHONEGAP:
			return this.instanceObject["getDuration"]();
		case API_APPMOBI:
			if (audRuntime.isDirectCanvas)
				return AppMobi["context"]["getDurationSound"](this.src);
			else
				return 0;
		}
		return 0;
	};
	C2AudioInstance.prototype.getPlaybackTime = function ()
	{
		var duration = this.getDuration();
		var ret = 0;
		switch (this.myapi) {
		case API_HTML5:
			if (typeof this.instanceObject.currentTime !== "undefined")
				ret = this.instanceObject.currentTime;
			break;
		case API_WEBAUDIO:
			if (this.buffer.myapi === API_WEBAUDIO)
			{
				if (this.is_paused)
					return this.resume_position;
				else
					ret = audRuntime.kahanTime.sum - this.startTime;
			}
			else if (typeof this.instanceObject.currentTime !== "undefined")
				ret = this.instanceObject.currentTime;
			break;
		case API_PHONEGAP:
			break;
		case API_APPMOBI:
			if (audRuntime.isDirectCanvas)
				ret = AppMobi["context"]["getPlaybackTimeSound"](this.src);
			break;
		}
		if (!this.looping && ret > duration)
			ret = duration;
		return ret;
	};
	C2AudioInstance.prototype.isPlaying = function ()
	{
		return !this.is_paused && !this.fresh && !this.stopped && !this.hasEnded();
	};
	C2AudioInstance.prototype.setVolume = function (v)
	{
		this.volume = v;
		this.updateVolume();
	};
	C2AudioInstance.prototype.updateVolume = function ()
	{
		var volToSet = this.volume * masterVolume;
		switch (this.myapi) {
		case API_HTML5:
			if (this.instanceObject.volume && this.instanceObject.volume !== volToSet)
				this.instanceObject.volume = volToSet;
			break;
		case API_WEBAUDIO:
			this.gainNode["gain"]["value"] = volToSet * this.mutevol;
			break;
		case API_PHONEGAP:
			break;
		case API_APPMOBI:
			break;
		}
	};
	C2AudioInstance.prototype.getVolume = function ()
	{
		return this.volume;
	};
	C2AudioInstance.prototype.doSetMuted = function (m)
	{
		switch (this.myapi) {
		case API_HTML5:
			if (this.instanceObject.muted !== !!m)
				this.instanceObject.muted = !!m;
			break;
		case API_WEBAUDIO:
			this.mutevol = (m ? 0 : 1);
			this.gainNode["gain"]["value"] = masterVolume * this.volume * this.mutevol;
			break;
		case API_PHONEGAP:
			break;
		case API_APPMOBI:
			break;
		}
	};
	C2AudioInstance.prototype.setMuted = function (m)
	{
		this.is_muted = !!m;
		this.doSetMuted(this.is_muted || this.is_silent);
	};
	C2AudioInstance.prototype.setSilent = function (m)
	{
		this.is_silent = !!m;
		this.doSetMuted(this.is_muted || this.is_silent);
	};
	C2AudioInstance.prototype.setLooping = function (l)
	{
		this.looping = l;
		switch (this.myapi) {
		case API_HTML5:
			if (this.instanceObject.loop !== !!l)
				this.instanceObject.loop = !!l;
			break;
		case API_WEBAUDIO:
			if (this.instanceObject.loop !== !!l)
				this.instanceObject.loop = !!l;
			break;
		case API_PHONEGAP:
			break;
		case API_APPMOBI:
			if (audRuntime.isDirectCanvas)
				AppMobi["context"]["setLoopingSound"](this.src, l);
			break;
		}
	};
	C2AudioInstance.prototype.setPlaybackRate = function (r)
	{
		this.playbackRate = r;
		this.updatePlaybackRate();
	};
	C2AudioInstance.prototype.updatePlaybackRate = function ()
	{
		var r = this.playbackRate;
		if ((timescale_mode === 1 && !this.is_music) || timescale_mode === 2)
			r *= audRuntime.timescale;
		switch (this.myapi) {
		case API_HTML5:
			if (this.instanceObject.playbackRate !== r)
				this.instanceObject.playbackRate = r;
			break;
		case API_WEBAUDIO:
			if (this.buffer.myapi === API_WEBAUDIO)
			{
				if (this.instanceObject["playbackRate"]["value"] !== r)
					this.instanceObject["playbackRate"]["value"] = r;
			}
			else
			{
				if (this.instanceObject.playbackRate !== r)
					this.instanceObject.playbackRate = r;
			}
			break;
		case API_PHONEGAP:
			break;
		case API_APPMOBI:
			break;
		}
	};
	C2AudioInstance.prototype.setSuspended = function (s)
	{
		switch (this.myapi) {
		case API_HTML5:
			if (s)
			{
				if (this.isPlaying())
				{
					this.instanceObject["pause"]();
					this.resume_me = true;
				}
				else
					this.resume_me = false;
			}
			else
			{
				if (this.resume_me)
					this.instanceObject["play"]();
			}
			break;
		case API_WEBAUDIO:
			if (s)
			{
				if (this.isPlaying())
				{
					if (this.buffer.myapi === API_WEBAUDIO)
					{
						this.resume_position = this.getPlaybackTime();
						if (this.looping)
							this.resume_position = this.resume_position % this.getDuration();
						stopSource(this.instanceObject);
					}
					else
						this.instanceObject["pause"]();
					this.resume_me = true;
				}
				else
					this.resume_me = false;
			}
			else
			{
				if (this.resume_me)
				{
					if (this.buffer.myapi === API_WEBAUDIO)
					{
						this.instanceObject = context["createBufferSource"]();
						this.instanceObject["buffer"] = this.buffer.bufferObject;
						this.instanceObject["connect"](this.gainNode);
						this.instanceObject.loop = this.looping;
						this.gainNode["gain"]["value"] = masterVolume * this.volume * this.mutevol;
						this.startTime = audRuntime.kahanTime.sum - this.resume_position;
						startSourceAt(this.instanceObject, this.resume_position, this.getDuration());
					}
					else
					{
						this.instanceObject["play"]();
					}
				}
			}
			break;
		case API_PHONEGAP:
			if (s)
			{
				if (this.isPlaying())
				{
					this.instanceObject["pause"]();
					this.resume_me = true;
				}
				else
					this.resume_me = false;
			}
			else
			{
				if (this.resume_me)
					this.instanceObject["play"]();
			}
			break;
		case API_APPMOBI:
			break;
		}
	};
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
		audRuntime = this.runtime;
		audInst = this;
		this.listenerTracker = null;
		this.listenerZ = -600;
		if ((this.runtime.isiOS || (this.runtime.isAndroid && (this.runtime.isChrome || this.runtime.isAndroidStockBrowser))) && !this.runtime.isCrosswalk && !this.runtime.isDomFree)
		{
			isMusicWorkaround = true;
		}
		context = null;
		if (typeof AudioContext !== "undefined")
		{
			api = API_WEBAUDIO;
			context = new AudioContext();
		}
		else if (typeof webkitAudioContext !== "undefined")
		{
			api = API_WEBAUDIO;
			context = new webkitAudioContext();
		}
		if ((this.runtime.isiOS && api === API_WEBAUDIO) || isMusicWorkaround)
		{
			document.addEventListener("touchstart", function ()
			{
				var i, len, m;
				if (!iOShadtouch && context)
				{
					var buffer = context["createBuffer"](1, 1, 22050);
					var source = context["createBufferSource"]();
					source["buffer"] = buffer;
					source["connect"](context["destination"]);
					startSource(source);
					iOShadtouch = true;
				}
				if (isMusicWorkaround)
				{
					if (!silent)
					{
						for (i = 0, len = musicPlayNextTouch.length; i < len; ++i)
						{
							m = musicPlayNextTouch[i];
							if (!m.stopped && !m.is_paused)
								m.instanceObject.play();
						}
					}
					musicPlayNextTouch.length = 0;
				}
			}, true);
		}
		if (api !== API_WEBAUDIO)
		{
			if (this.runtime.isPhoneGap)
				api = API_PHONEGAP;
			else if (this.runtime.isAppMobi)
				api = API_APPMOBI;
		}
		if (api === API_PHONEGAP)
		{
			appPath = location.href;
			var i = appPath.lastIndexOf("/");
			if (i > -1)
				appPath = appPath.substr(0, i + 1);
			appPath = appPath.replace("file://", "");
		}
		if (this.runtime.isSafari && this.runtime.isWindows && typeof Audio === "undefined")
		{
			alert("It looks like you're using Safari for Windows without Quicktime.  Audio cannot be played until Quicktime is installed.");
			this.runtime.DestroyInstance(this);
		}
		else
		{
			if (this.runtime.isDirectCanvas)
				useOgg = this.runtime.isAndroid;		// AAC on iOS, OGG on Android
			else
			{
				try {
					useOgg = !!(new Audio().canPlayType('audio/ogg; codecs="vorbis"'));
				}
				catch (e)
				{
					useOgg = false;
				}
			}
			switch (api) {
			case API_HTML5:
;
				break;
			case API_WEBAUDIO:
;
				break;
			case API_PHONEGAP:
;
				break;
			case API_APPMOBI:
;
				break;
			default:
;
			}
			this.runtime.tickMe(this);
		}
	};
	var instanceProto = pluginProto.Instance.prototype;
	instanceProto.onCreate = function ()
	{
		timescale_mode = this.properties[0];	// 0 = off, 1 = sounds only, 2 = all
		this.saveload = this.properties[1];		// 0 = all, 1 = sounds only, 2 = music only, 3 = none
		panningModel = this.properties[2];		// 0 = equalpower, 1 = hrtf, 3 = soundfield
		distanceModel = this.properties[3];		// 0 = linear, 1 = inverse, 2 = exponential
		this.listenerZ = -this.properties[4];
		refDistance = this.properties[5];
		maxDistance = this.properties[6];
		rolloffFactor = this.properties[7];
		this.listenerTracker = new ObjectTracker();
		if (api === API_WEBAUDIO)
		{
			context["listener"]["speedOfSound"] = this.properties[8];
			context["listener"]["dopplerFactor"] = this.properties[9];
			context["listener"]["setPosition"](this.runtime.draw_width / 2, this.runtime.draw_height / 2, this.listenerZ);
			context["listener"]["setOrientation"](0, 0, 1, 0, -1, 0);
			window["c2OnAudioMicStream"] = function (localMediaStream, tag)
			{
				if (micSource)
					micSource["disconnect"]();
				micTag = tag.toLowerCase();
				micSource = context["createMediaStreamSource"](localMediaStream);
				micSource["connect"](getDestinationForTag(micTag));
			};
		}
		this.runtime.addSuspendCallback(function(s)
		{
			audInst.onSuspend(s);
		});
		var self = this;
		this.runtime.addDestroyCallback(function (inst)
		{
			self.onInstanceDestroyed(inst);
		});
	};
	instanceProto.onInstanceDestroyed = function (inst)
	{
		var i, len, a;
		for (i = 0, len = audioInstances.length; i < len; i++)
		{
			a = audioInstances[i];
			if (a.objectTracker)
			{
				if (a.objectTracker.obj === inst)
				{
					a.objectTracker.obj = null;
					if (a.pannerEnabled && a.isPlaying() && a.looping)
						a.stop();
				}
			}
		}
		if (this.listenerTracker.obj === inst)
			this.listenerTracker.obj = null;
	};
	instanceProto.saveToJSON = function ()
	{
		var o = {
			"silent": silent,
			"masterVolume": masterVolume,
			"listenerZ": this.listenerZ,
			"listenerUid": this.listenerTracker.hasObject() ? this.listenerTracker.obj.uid : -1,
			"playing": [],
			"effects": {}
		};
		var playingarr = o["playing"];
		var i, len, a, d, p, panobj, playbackTime;
		for (i = 0, len = audioInstances.length; i < len; i++)
		{
			a = audioInstances[i];
			if (!a.isPlaying())
				continue;				// no need to save stopped sounds
			if (this.saveload === 3)	// not saving/loading any sounds/music
				continue;
			if (a.is_music && this.saveload === 1)	// not saving/loading music
				continue;
			if (!a.is_music && this.saveload === 2)	// not saving/loading sound
				continue;
			playbackTime = a.getPlaybackTime();
			if (a.looping)
				playbackTime = playbackTime % a.getDuration();
			d = {
				"tag": a.tag,
				"buffersrc": a.buffer.src,
				"is_music": a.is_music,
				"playbackTime": playbackTime,
				"volume": a.volume,
				"looping": a.looping,
				"muted": a.is_muted,
				"playbackRate": a.playbackRate,
				"paused": a.is_paused,
				"resume_position": a.resume_position
			};
			if (a.pannerEnabled)
			{
				d["pan"] = {};
				panobj = d["pan"];
				if (a.objectTracker && a.objectTracker.hasObject())
				{
					panobj["objUid"] = a.objectTracker.obj.uid;
				}
				else
				{
					panobj["x"] = a.panX;
					panobj["y"] = a.panY;
					panobj["a"] = a.panAngle;
				}
				panobj["ia"] = a.panConeInner;
				panobj["oa"] = a.panConeOuter;
				panobj["og"] = a.panConeOuterGain;
			}
			playingarr.push(d);
		}
		var fxobj = o["effects"];
		var fxarr;
		for (p in effects)
		{
			if (effects.hasOwnProperty(p))
			{
				fxarr = [];
				for (i = 0, len = effects[p].length; i < len; i++)
				{
					fxarr.push({ "type": effects[p][i].type, "params": effects[p][i].params });
				}
				fxobj[p] = fxarr;
			}
		}
		return o;
	};
	var objectTrackerUidsToLoad = [];
	instanceProto.loadFromJSON = function (o)
	{
		var setSilent = o["silent"];
		masterVolume = o["masterVolume"];
		this.listenerZ = o["listenerZ"];
		this.listenerTracker.setObject(null);
		var listenerUid = o["listenerUid"];
		if (listenerUid !== -1)
		{
			this.listenerTracker.loadUid = listenerUid;
			objectTrackerUidsToLoad.push(this.listenerTracker);
		}
		var playingarr = o["playing"];
		var i, len, d, src, is_music, tag, playbackTime, looping, vol, b, a, p, pan, panObjUid;
		if (this.saveload !== 3)
		{
			for (i = 0, len = audioInstances.length; i < len; i++)
			{
				a = audioInstances[i];
				if (a.is_music && this.saveload === 1)
					continue;		// only saving/loading sound: leave music playing
				if (!a.is_music && this.saveload === 2)
					continue;		// only saving/loading music: leave sound playing
				a.stop();
			}
		}
		var fxarr, fxtype, fxparams, fx;
		for (p in effects)
		{
			if (effects.hasOwnProperty(p))
			{
				for (i = 0, len = effects[p].length; i < len; i++)
					effects[p][i].remove();
			}
		}
		cr.wipe(effects);
		for (p in o["effects"])
		{
			if (o["effects"].hasOwnProperty(p))
			{
				fxarr = o["effects"][p];
				for (i = 0, len = fxarr.length; i < len; i++)
				{
					fxtype = fxarr[i]["type"];
					fxparams = fxarr[i]["params"];
					switch (fxtype) {
					case "filter":
						addEffectForTag(p, new FilterEffect(fxparams[0], fxparams[1], fxparams[2], fxparams[3], fxparams[4], fxparams[5]));
						break;
					case "delay":
						addEffectForTag(p, new DelayEffect(fxparams[0], fxparams[1], fxparams[2]));
						break;
					case "convolve":
						src = fxparams[2];
						b = this.getAudioBuffer(src, false);
						if (b.bufferObject)
						{
							fx = new ConvolveEffect(b.bufferObject, fxparams[0], fxparams[1], src);
						}
						else
						{
							fx = new ConvolveEffect(null, fxparams[0], fxparams[1], src);
							b.normalizeWhenReady = fxparams[0];
							b.convolveWhenReady = fx;
						}
						addEffectForTag(p, fx);
						break;
					case "flanger":
						addEffectForTag(p, new FlangerEffect(fxparams[0], fxparams[1], fxparams[2], fxparams[3], fxparams[4]));
						break;
					case "phaser":
						addEffectForTag(p, new PhaserEffect(fxparams[0], fxparams[1], fxparams[2], fxparams[3], fxparams[4], fxparams[5]));
						break;
					case "gain":
						addEffectForTag(p, new GainEffect(fxparams[0]));
						break;
					case "tremolo":
						addEffectForTag(p, new TremoloEffect(fxparams[0], fxparams[1]));
						break;
					case "ringmod":
						addEffectForTag(p, new RingModulatorEffect(fxparams[0], fxparams[1]));
						break;
					case "distortion":
						addEffectForTag(p, new DistortionEffect(fxparams[0], fxparams[1], fxparams[2], fxparams[3], fxparams[4]));
						break;
					case "compressor":
						addEffectForTag(p, new CompressorEffect(fxparams[0], fxparams[1], fxparams[2], fxparams[3], fxparams[4]));
						break;
					case "analyser":
						addEffectForTag(p, new AnalyserEffect(fxparams[0], fxparams[1]));
						break;
					}
				}
			}
		}
		for (i = 0, len = playingarr.length; i < len; i++)
		{
			if (this.saveload === 3)	// not saving/loading any sounds/music
				continue;
			d = playingarr[i];
			src = d["buffersrc"];
			is_music = d["is_music"];
			tag = d["tag"];
			playbackTime = d["playbackTime"];
			looping = d["looping"];
			vol = d["volume"];
			pan = d["pan"];
			panObjUid = (pan && pan.hasOwnProperty("objUid")) ? pan["objUid"] : -1;
			if (is_music && this.saveload === 1)	// not saving/loading music
				continue;
			if (!is_music && this.saveload === 2)	// not saving/loading sound
				continue;
			a = this.getAudioInstance(src, tag, is_music, looping, vol);
			if (!a)
			{
				b = this.getAudioBuffer(src, is_music);
				b.seekWhenReady = playbackTime;
				b.pauseWhenReady = d["paused"];
				if (pan)
				{
					if (panObjUid !== -1)
					{
						b.panWhenReady.push({ objUid: panObjUid, ia: pan["ia"], oa: pan["oa"], og: pan["og"], thistag: tag });
					}
					else
					{
						b.panWhenReady.push({ x: pan["x"], y: pan["y"], a: pan["a"], ia: pan["ia"], oa: pan["oa"], og: pan["og"], thistag: tag });
					}
				}
				continue;
			}
			a.resume_position = d["resume_position"];
			a.setPannerEnabled(!!pan);
			a.play(looping, vol, playbackTime);
			a.updatePlaybackRate();
			a.updateVolume();
			a.doSetMuted(a.is_muted || a.is_silent);
			if (d["paused"])
				a.pause();
			if (d["muted"])
				a.setMuted(true);
			a.doSetMuted(a.is_muted || a.is_silent);
			if (pan)
			{
				if (panObjUid !== -1)
				{
					a.objectTracker = a.objectTracker || new ObjectTracker();
					a.objectTracker.loadUid = panObjUid;
					objectTrackerUidsToLoad.push(a.objectTracker);
				}
				else
				{
					a.setPan(pan["x"], pan["y"], pan["a"], pan["ia"], pan["oa"], pan["og"]);
				}
			}
		}
		if (setSilent && !silent)			// setting silent
		{
			for (i = 0, len = audioInstances.length; i < len; i++)
				audioInstances[i].setSilent(true);
			silent = true;
		}
		else if (!setSilent && silent)		// setting not silent
		{
			for (i = 0, len = audioInstances.length; i < len; i++)
				audioInstances[i].setSilent(false);
			silent = false;
		}
	};
	instanceProto.afterLoad = function ()
	{
		var i, len, ot, inst;
		for (i = 0, len = objectTrackerUidsToLoad.length; i < len; i++)
		{
			ot = objectTrackerUidsToLoad[i];
			inst = this.runtime.getObjectByUID(ot.loadUid);
			ot.setObject(inst);
			ot.loadUid = -1;
			if (inst)
			{
				listenerX = inst.x;
				listenerY = inst.y;
			}
		}
		objectTrackerUidsToLoad.length = 0;
	};
	instanceProto.onSuspend = function (s)
	{
		var i, len;
		for (i = 0, len = audioInstances.length; i < len; i++)
			audioInstances[i].setSuspended(s);
	};
	instanceProto.tick = function ()
	{
		var dt = this.runtime.dt;
		var i, len, a;
		for (i = 0, len = audioInstances.length; i < len; i++)
		{
			a = audioInstances[i];
			a.tick(dt);
			if (a.myapi !== API_HTML5 && a.myapi !== API_APPMOBI)
			{
				if (!a.fresh && !a.stopped && a.hasEnded())
				{
					a.stopped = true;
					audTag = a.tag;
					audRuntime.trigger(cr.plugins_.Audio.prototype.cnds.OnEnded, audInst);
				}
			}
			if (timescale_mode !== 0)
				a.updatePlaybackRate();
		}
		var p, arr, f;
		for (p in effects)
		{
			if (effects.hasOwnProperty(p))
			{
				arr = effects[p];
				for (i = 0, len = arr.length; i < len; i++)
				{
					f = arr[i];
					if (f.tick)
						f.tick();
				}
			}
		}
		if (api === API_WEBAUDIO && this.listenerTracker.hasObject())
		{
			this.listenerTracker.tick(dt);
			listenerX = this.listenerTracker.obj.x;
			listenerY = this.listenerTracker.obj.y;
			context["listener"]["setPosition"](this.listenerTracker.obj.x, this.listenerTracker.obj.y, this.listenerZ);
			context["listener"]["setVelocity"](this.listenerTracker.getVelocityX(), this.listenerTracker.getVelocityY(), 0);
		}
	};
	instanceProto.getAudioBuffer = function (src_, is_music)
	{
		var i, len, a, ret = null, j, k, lenj, ai;
		for (i = 0, len = audioBuffers.length; i < len; i++)
		{
			a = audioBuffers[i];
			if (a.src === src_)
			{
				ret = a;
				break;
			}
		}
		if (!ret)
		{
			ret = new C2AudioBuffer(src_, is_music);
			audioBuffers.push(ret);
		}
		return ret;
	};
	instanceProto.getAudioInstance = function (src_, tag, is_music, looping, vol)
	{
		var i, len, a;
		for (i = 0, len = audioInstances.length; i < len; i++)
		{
			a = audioInstances[i];
			if (a.src === src_ && (a.canBeRecycled() || is_music))
			{
				a.tag = tag;
				return a;
			}
		}
		var b = this.getAudioBuffer(src_, is_music);
		if (!b.bufferObject)
		{
			if (tag !== "<preload>")
			{
				b.playTagWhenReady = tag;
				b.loopWhenReady = looping;
				b.volumeWhenReady = vol;
			}
			return null;
		}
		a = new C2AudioInstance(b, tag);
		audioInstances.push(a);
		return a;
	};
	var taggedAudio = [];
	function getAudioByTag(tag)
	{
		taggedAudio.length = 0;
		if (!tag.length)
		{
			if (!lastAudio || lastAudio.hasEnded())
				return;
			else
			{
				taggedAudio.length = 1;
				taggedAudio[0] = lastAudio;
				return;
			}
		}
		var i, len, a;
		for (i = 0, len = audioInstances.length; i < len; i++)
		{
			a = audioInstances[i];
			if (cr.equals_nocase(tag, a.tag))
				taggedAudio.push(a);
		}
	};
	function reconnectEffects(tag)
	{
		var i, len, arr, n, toNode = context["destination"];
		if (effects.hasOwnProperty(tag))
		{
			arr = effects[tag];
			if (arr.length)
			{
				toNode = arr[0].getInputNode();
				for (i = 0, len = arr.length; i < len; i++)
				{
					n = arr[i];
					if (i + 1 === len)
						n.connectTo(context["destination"]);
					else
						n.connectTo(arr[i + 1].getInputNode());
				}
			}
		}
		getAudioByTag(tag);
		for (i = 0, len = taggedAudio.length; i < len; i++)
			taggedAudio[i].reconnect(toNode);
		if (micSource && micTag === tag)
		{
			micSource["disconnect"]();
			micSource["connect"](toNode);
		}
	};
	function addEffectForTag(tag, fx)
	{
		if (!effects.hasOwnProperty(tag))
			effects[tag] = [fx];
		else
			effects[tag].push(fx);
		reconnectEffects(tag);
	};
	function Cnds() {};
	Cnds.prototype.OnEnded = function (t)
	{
		return cr.equals_nocase(audTag, t);
	};
	Cnds.prototype.PreloadsComplete = function ()
	{
		var i, len;
		for (i = 0, len = audioBuffers.length; i < len; i++)
		{
			if (!audioBuffers[i].isLoaded())
				return false;
		}
		return true;
	};
	Cnds.prototype.AdvancedAudioSupported = function ()
	{
		return api === API_WEBAUDIO;
	};
	Cnds.prototype.IsSilent = function ()
	{
		return silent;
	};
	Cnds.prototype.IsAnyPlaying = function ()
	{
		var i, len;
		for (i = 0, len = audioInstances.length; i < len; i++)
		{
			if (audioInstances[i].isPlaying())
				return true;
		}
		return false;
	};
	Cnds.prototype.IsTagPlaying = function (tag)
	{
		getAudioByTag(tag);
		var i, len;
		for (i = 0, len = taggedAudio.length; i < len; i++)
		{
			if (taggedAudio[i].isPlaying())
				return true;
		}
		return false;
	};
	pluginProto.cnds = new Cnds();
	function Acts() {};
	Acts.prototype.Play = function (file, looping, vol, tag)
	{
		if (silent)
			return;
		var v = dbToLinear(vol);
		var is_music = file[1];
		var src = this.runtime.files_subfolder + file[0] + (useOgg ? ".ogg" : ".m4a");
		lastAudio = this.getAudioInstance(src, tag, is_music, looping!==0, v);
		if (!lastAudio)
			return;
		lastAudio.setPannerEnabled(false);
		lastAudio.play(looping!==0, v);
	};
	Acts.prototype.PlayAtPosition = function (file, looping, vol, x_, y_, angle_, innerangle_, outerangle_, outergain_, tag)
	{
		if (silent)
			return;
		var v = dbToLinear(vol);
		var is_music = file[1];
		var src = this.runtime.files_subfolder + file[0] + (useOgg ? ".ogg" : ".m4a");
		lastAudio = this.getAudioInstance(src, tag, is_music, looping!==0, v);
		if (!lastAudio)
		{
			var b = this.getAudioBuffer(src, is_music);
			b.panWhenReady.push({ x: x_, y: y_, a: angle_, ia: innerangle_, oa: outerangle_, og: dbToLinear(outergain_), thistag: tag });
			return;
		}
		lastAudio.setPannerEnabled(true);
		lastAudio.setPan(x_, y_, angle_, innerangle_, outerangle_, dbToLinear(outergain_));
		lastAudio.play(looping!==0, v);
	};
	Acts.prototype.PlayAtObject = function (file, looping, vol, obj, innerangle, outerangle, outergain, tag)
	{
		if (silent || !obj)
			return;
		var inst = obj.getFirstPicked();
		if (!inst)
			return;
		var v = dbToLinear(vol);
		var is_music = file[1];
		var src = this.runtime.files_subfolder + file[0] + (useOgg ? ".ogg" : ".m4a");
		lastAudio = this.getAudioInstance(src, tag, is_music, looping!==0, v);
		if (!lastAudio)
		{
			var b = this.getAudioBuffer(src, is_music);
			b.panWhenReady.push({ obj: inst, ia: innerangle, oa: outerangle, og: dbToLinear(outergain), thistag: tag });
			return;
		}
		lastAudio.setPannerEnabled(true);
		var px = cr.rotatePtAround(inst.x, inst.y, -inst.layer.getAngle(), listenerX, listenerY, true);
		var py = cr.rotatePtAround(inst.x, inst.y, -inst.layer.getAngle(), listenerX, listenerY, false);
		lastAudio.setPan(px, py, cr.to_degrees(inst.angle - inst.layer.getAngle()), innerangle, outerangle, dbToLinear(outergain));
		lastAudio.setObject(inst);
		lastAudio.play(looping!==0, v);
	};
	Acts.prototype.PlayByName = function (folder, filename, looping, vol, tag)
	{
		if (silent)
			return;
		var v = dbToLinear(vol);
		var is_music = (folder === 1);
		var src = this.runtime.files_subfolder + filename.toLowerCase() + (useOgg ? ".ogg" : ".m4a");
		lastAudio = this.getAudioInstance(src, tag, is_music, looping!==0, v);
		if (!lastAudio)
			return;
		lastAudio.setPannerEnabled(false);
		lastAudio.play(looping!==0, v);
	};
	Acts.prototype.PlayAtPositionByName = function (folder, filename, looping, vol, x_, y_, angle_, innerangle_, outerangle_, outergain_, tag)
	{
		if (silent)
			return;
		var v = dbToLinear(vol);
		var is_music = (folder === 1);
		var src = this.runtime.files_subfolder + filename.toLowerCase() + (useOgg ? ".ogg" : ".m4a");
		lastAudio = this.getAudioInstance(src, tag, is_music, looping!==0, v);
		if (!lastAudio)
		{
			var b = this.getAudioBuffer(src, is_music);
			b.panWhenReady.push({ x: x_, y: y_, a: angle_, ia: innerangle_, oa: outerangle_, og: dbToLinear(outergain_), thistag: tag });
			return;
		}
		lastAudio.setPannerEnabled(true);
		lastAudio.setPan(x_, y_, angle_, innerangle_, outerangle_, dbToLinear(outergain_));
		lastAudio.play(looping!==0, v);
	};
	Acts.prototype.PlayAtObjectByName = function (folder, filename, looping, vol, obj, innerangle, outerangle, outergain, tag)
	{
		if (silent || !obj)
			return;
		var inst = obj.getFirstPicked();
		if (!inst)
			return;
		var v = dbToLinear(vol);
		var is_music = (folder === 1);
		var src = this.runtime.files_subfolder + filename.toLowerCase() + (useOgg ? ".ogg" : ".m4a");
		lastAudio = this.getAudioInstance(src, tag, is_music, looping!==0, v);
		if (!lastAudio)
		{
			var b = this.getAudioBuffer(src, is_music);
			b.panWhenReady.push({ obj: inst, ia: innerangle, oa: outerangle, og: dbToLinear(outergain), thistag: tag });
			return;
		}
		lastAudio.setPannerEnabled(true);
		var px = cr.rotatePtAround(inst.x, inst.y, -inst.layer.getAngle(), listenerX, listenerY, true);
		var py = cr.rotatePtAround(inst.x, inst.y, -inst.layer.getAngle(), listenerX, listenerY, false);
		lastAudio.setPan(px, py, cr.to_degrees(inst.angle - inst.layer.getAngle()), innerangle, outerangle, dbToLinear(outergain));
		lastAudio.setObject(inst);
		lastAudio.play(looping!==0, v);
	};
	Acts.prototype.SetLooping = function (tag, looping)
	{
		getAudioByTag(tag);
		var i, len;
		for (i = 0, len = taggedAudio.length; i < len; i++)
			taggedAudio[i].setLooping(looping === 0);
	};
	Acts.prototype.SetMuted = function (tag, muted)
	{
		getAudioByTag(tag);
		var i, len;
		for (i = 0, len = taggedAudio.length; i < len; i++)
			taggedAudio[i].setMuted(muted === 0);
	};
	Acts.prototype.SetVolume = function (tag, vol)
	{
		getAudioByTag(tag);
		var v = dbToLinear(vol);
		var i, len;
		for (i = 0, len = taggedAudio.length; i < len; i++)
			taggedAudio[i].setVolume(v);
	};
	Acts.prototype.Preload = function (file)
	{
		if (silent)
			return;
		var is_music = file[1];
		var src = this.runtime.files_subfolder + file[0] + (useOgg ? ".ogg" : ".m4a");
		if (api === API_APPMOBI)
		{
			if (this.runtime.isDirectCanvas)
				AppMobi["context"]["loadSound"](src);
			else
				AppMobi["player"]["loadSound"](src);
			return;
		}
		else if (api === API_PHONEGAP)
		{
			return;
		}
		this.getAudioInstance(src, "<preload>", is_music, false);
	};
	Acts.prototype.PreloadByName = function (folder, filename)
	{
		if (silent)
			return;
		var is_music = (folder === 1);
		var src = this.runtime.files_subfolder + filename.toLowerCase() + (useOgg ? ".ogg" : ".m4a");
		if (api === API_APPMOBI)
		{
			if (this.runtime.isDirectCanvas)
				AppMobi["context"]["loadSound"](src);
			else
				AppMobi["player"]["loadSound"](src);
			return;
		}
		else if (api === API_PHONEGAP)
		{
			return;
		}
		this.getAudioInstance(src, "<preload>", is_music, false);
	};
	Acts.prototype.SetPlaybackRate = function (tag, rate)
	{
		getAudioByTag(tag);
		if (rate < 0.0)
			rate = 0;
		var i, len;
		for (i = 0, len = taggedAudio.length; i < len; i++)
			taggedAudio[i].setPlaybackRate(rate);
	};
	Acts.prototype.Stop = function (tag)
	{
		getAudioByTag(tag);
		var i, len;
		for (i = 0, len = taggedAudio.length; i < len; i++)
			taggedAudio[i].stop();
	};
	Acts.prototype.StopAll = function ()
	{
		var i, len;
		for (i = 0, len = audioInstances.length; i < len; i++)
			audioInstances[i].stop();
	};
	Acts.prototype.SetPaused = function (tag, state)
	{
		getAudioByTag(tag);
		var i, len;
		for (i = 0, len = taggedAudio.length; i < len; i++)
		{
			if (state === 0)
				taggedAudio[i].pause();
			else
				taggedAudio[i].resume();
		}
	};
	Acts.prototype.Seek = function (tag, pos)
	{
		getAudioByTag(tag);
		var i, len;
		for (i = 0, len = taggedAudio.length; i < len; i++)
		{
			taggedAudio[i].seek(pos);
		}
	};
	Acts.prototype.SetSilent = function (s)
	{
		var i, len;
		if (s === 2)					// toggling
			s = (silent ? 1 : 0);		// choose opposite state
		if (s === 0 && !silent)			// setting silent
		{
			for (i = 0, len = audioInstances.length; i < len; i++)
				audioInstances[i].setSilent(true);
			silent = true;
		}
		else if (s === 1 && silent)		// setting not silent
		{
			for (i = 0, len = audioInstances.length; i < len; i++)
				audioInstances[i].setSilent(false);
			silent = false;
		}
	};
	Acts.prototype.SetMasterVolume = function (vol)
	{
		masterVolume = dbToLinear(vol);
		var i, len;
		for (i = 0, len = audioInstances.length; i < len; i++)
			audioInstances[i].updateVolume();
	};
	Acts.prototype.AddFilterEffect = function (tag, type, freq, detune, q, gain, mix)
	{
		if (api !== API_WEBAUDIO || type < 0 || type >= filterTypes.length || !context["createBiquadFilter"])
			return;
		tag = tag.toLowerCase();
		mix = mix / 100;
		if (mix < 0) mix = 0;
		if (mix > 1) mix = 1;
		addEffectForTag(tag, new FilterEffect(type, freq, detune, q, gain, mix));
	};
	Acts.prototype.AddDelayEffect = function (tag, delay, gain, mix)
	{
		if (api !== API_WEBAUDIO)
			return;
		tag = tag.toLowerCase();
		mix = mix / 100;
		if (mix < 0) mix = 0;
		if (mix > 1) mix = 1;
		addEffectForTag(tag, new DelayEffect(delay, dbToLinear(gain), mix));
	};
	Acts.prototype.AddFlangerEffect = function (tag, delay, modulation, freq, feedback, mix)
	{
		if (api !== API_WEBAUDIO || !context["createOscillator"])
			return;
		tag = tag.toLowerCase();
		mix = mix / 100;
		if (mix < 0) mix = 0;
		if (mix > 1) mix = 1;
		addEffectForTag(tag, new FlangerEffect(delay / 1000, modulation / 1000, freq, feedback / 100, mix));
	};
	Acts.prototype.AddPhaserEffect = function (tag, freq, detune, q, mod, modfreq, mix)
	{
		if (api !== API_WEBAUDIO || !context["createOscillator"])
			return;
		tag = tag.toLowerCase();
		mix = mix / 100;
		if (mix < 0) mix = 0;
		if (mix > 1) mix = 1;
		addEffectForTag(tag, new PhaserEffect(freq, detune, q, mod, modfreq, mix));
	};
	Acts.prototype.AddConvolutionEffect = function (tag, file, norm, mix)
	{
		if (api !== API_WEBAUDIO || !context["createConvolver"])
			return;
		var doNormalize = (norm === 0);
		var src = this.runtime.files_subfolder + file[0] + (useOgg ? ".ogg" : ".m4a");
		var b = this.getAudioBuffer(src, false);
		tag = tag.toLowerCase();
		mix = mix / 100;
		if (mix < 0) mix = 0;
		if (mix > 1) mix = 1;
		var fx;
		if (b.bufferObject)
		{
			fx = new ConvolveEffect(b.bufferObject, doNormalize, mix, src);
		}
		else
		{
			fx = new ConvolveEffect(null, doNormalize, mix, src);
			b.normalizeWhenReady = doNormalize;
			b.convolveWhenReady = fx;
		}
		addEffectForTag(tag, fx);
	};
	Acts.prototype.AddGainEffect = function (tag, g)
	{
		if (api !== API_WEBAUDIO)
			return;
		tag = tag.toLowerCase();
		addEffectForTag(tag, new GainEffect(dbToLinear(g)));
	};
	Acts.prototype.AddMuteEffect = function (tag)
	{
		if (api !== API_WEBAUDIO)
			return;
		tag = tag.toLowerCase();
		addEffectForTag(tag, new GainEffect(0));	// re-use gain effect with 0 gain
	};
	Acts.prototype.AddTremoloEffect = function (tag, freq, mix)
	{
		if (api !== API_WEBAUDIO || !context["createOscillator"])
			return;
		tag = tag.toLowerCase();
		mix = mix / 100;
		if (mix < 0) mix = 0;
		if (mix > 1) mix = 1;
		addEffectForTag(tag, new TremoloEffect(freq, mix));
	};
	Acts.prototype.AddRingModEffect = function (tag, freq, mix)
	{
		if (api !== API_WEBAUDIO || !context["createOscillator"])
			return;
		tag = tag.toLowerCase();
		mix = mix / 100;
		if (mix < 0) mix = 0;
		if (mix > 1) mix = 1;
		addEffectForTag(tag, new RingModulatorEffect(freq, mix));
	};
	Acts.prototype.AddDistortionEffect = function (tag, threshold, headroom, drive, makeupgain, mix)
	{
		if (api !== API_WEBAUDIO || !context["createWaveShaper"])
			return;
		tag = tag.toLowerCase();
		mix = mix / 100;
		if (mix < 0) mix = 0;
		if (mix > 1) mix = 1;
		addEffectForTag(tag, new DistortionEffect(threshold, headroom, drive, makeupgain, mix));
	};
	Acts.prototype.AddCompressorEffect = function (tag, threshold, knee, ratio, attack, release)
	{
		if (api !== API_WEBAUDIO || !context["createDynamicsCompressor"])
			return;
		tag = tag.toLowerCase();
		addEffectForTag(tag, new CompressorEffect(threshold, knee, ratio, attack / 1000, release / 1000));
	};
	Acts.prototype.AddAnalyserEffect = function (tag, fftSize, smoothing)
	{
		if (api !== API_WEBAUDIO)
			return;
		tag = tag.toLowerCase();
		addEffectForTag(tag, new AnalyserEffect(fftSize, smoothing));
	};
	Acts.prototype.RemoveEffects = function (tag)
	{
		if (api !== API_WEBAUDIO)
			return;
		tag = tag.toLowerCase();
		var i, len, arr;
		if (effects.hasOwnProperty(tag))
		{
			arr = effects[tag];
			if (arr.length)
			{
				for (i = 0, len = arr.length; i < len; i++)
					arr[i].remove();
				arr.length = 0;
				reconnectEffects(tag);
			}
		}
	};
	Acts.prototype.SetEffectParameter = function (tag, index, param, value, ramp, time)
	{
		if (api !== API_WEBAUDIO)
			return;
		tag = tag.toLowerCase();
		index = Math.floor(index);
		var arr;
		if (!effects.hasOwnProperty(tag))
			return;
		arr = effects[tag];
		if (index < 0 || index >= arr.length)
			return;
		arr[index].setParam(param, value, ramp, time);
	};
	Acts.prototype.SetListenerObject = function (obj_)
	{
		if (!obj_ || api !== API_WEBAUDIO)
			return;
		var inst = obj_.getFirstPicked();
		if (!inst)
			return;
		this.listenerTracker.setObject(inst);
		listenerX = inst.x;
		listenerY = inst.y;
	};
	Acts.prototype.SetListenerZ = function (z)
	{
		this.listenerZ = z;
	};
	pluginProto.acts = new Acts();
	function Exps() {};
	Exps.prototype.Duration = function (ret, tag)
	{
		getAudioByTag(tag);
		if (taggedAudio.length)
			ret.set_float(taggedAudio[0].getDuration());
		else
			ret.set_float(0);
	};
	Exps.prototype.PlaybackTime = function (ret, tag)
	{
		getAudioByTag(tag);
		if (taggedAudio.length)
			ret.set_float(taggedAudio[0].getPlaybackTime());
		else
			ret.set_float(0);
	};
	Exps.prototype.Volume = function (ret, tag)
	{
		getAudioByTag(tag);
		if (taggedAudio.length)
		{
			var v = taggedAudio[0].getVolume();
			ret.set_float(linearToDb(v));
		}
		else
			ret.set_float(0);
	};
	Exps.prototype.MasterVolume = function (ret)
	{
		ret.set_float(masterVolume);
	};
	Exps.prototype.EffectCount = function (ret, tag)
	{
		tag = tag.toLowerCase();
		var arr = null;
		if (effects.hasOwnProperty(tag))
			arr = effects[tag];
		ret.set_int(arr ? arr.length : 0);
	};
	function getAnalyser(tag, index)
	{
		var arr = null;
		if (effects.hasOwnProperty(tag))
			arr = effects[tag];
		if (arr && index >= 0 && index < arr.length && arr[index].freqBins)
			return arr[index];
		else
			return null;
	};
	Exps.prototype.AnalyserFreqBinCount = function (ret, tag, index)
	{
		tag = tag.toLowerCase();
		index = Math.floor(index);
		var analyser = getAnalyser(tag, index);
		ret.set_int(analyser ? analyser.node["frequencyBinCount"] : 0);
	};
	Exps.prototype.AnalyserFreqBinAt = function (ret, tag, index, bin)
	{
		tag = tag.toLowerCase();
		index = Math.floor(index);
		bin = Math.floor(bin);
		var analyser = getAnalyser(tag, index);
		if (!analyser)
			ret.set_float(0);
		else if (bin < 0 || bin >= analyser.node["frequencyBinCount"])
			ret.set_float(0);
		else
			ret.set_float(analyser.freqBins[bin]);
	};
	Exps.prototype.AnalyserPeakLevel = function (ret, tag, index)
	{
		tag = tag.toLowerCase();
		index = Math.floor(index);
		var analyser = getAnalyser(tag, index);
		if (analyser)
			ret.set_float(analyser.peak);
		else
			ret.set_float(0);
	};
	Exps.prototype.AnalyserRMSLevel = function (ret, tag, index)
	{
		tag = tag.toLowerCase();
		index = Math.floor(index);
		var analyser = getAnalyser(tag, index);
		if (analyser)
			ret.set_float(analyser.rms);
		else
			ret.set_float(0);
	};
	pluginProto.exps = new Exps();
}());
;
;
cr.plugins_.Browser = function(runtime)
{
	this.runtime = runtime;
};
(function ()
{
	var pluginProto = cr.plugins_.Browser.prototype;
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};
	var typeProto = pluginProto.Type.prototype;
	typeProto.onCreate = function()
	{
	};
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
	};
	var instanceProto = pluginProto.Instance.prototype;
	instanceProto.onCreate = function()
	{
		var self = this;
		window.addEventListener("resize", function () {
			self.runtime.trigger(cr.plugins_.Browser.prototype.cnds.OnResize, self);
		});
		if (typeof navigator.onLine !== "undefined")
		{
			window.addEventListener("online", function() {
				self.runtime.trigger(cr.plugins_.Browser.prototype.cnds.OnOnline, self);
			});
			window.addEventListener("offline", function() {
				self.runtime.trigger(cr.plugins_.Browser.prototype.cnds.OnOffline, self);
			});
		}
		if (typeof window.applicationCache !== "undefined")
		{
			window.applicationCache.addEventListener('updateready', function() {
				self.runtime.loadingprogress = 1;
				self.runtime.trigger(cr.plugins_.Browser.prototype.cnds.OnUpdateReady, self);
			});
			window.applicationCache.addEventListener('progress', function(e) {
				self.runtime.loadingprogress = e["loaded"] / e["total"];
			});
		}
		if (!this.runtime.isDirectCanvas)
		{
			document.addEventListener("appMobi.device.update.available", function() {
				self.runtime.trigger(cr.plugins_.Browser.prototype.cnds.OnUpdateReady, self);
			});
			document.addEventListener("backbutton", function() {
				self.runtime.trigger(cr.plugins_.Browser.prototype.cnds.OnBackButton, self);
			});
			document.addEventListener("menubutton", function() {
				self.runtime.trigger(cr.plugins_.Browser.prototype.cnds.OnMenuButton, self);
			});
			document.addEventListener("searchbutton", function() {
				self.runtime.trigger(cr.plugins_.Browser.prototype.cnds.OnSearchButton, self);
			});
			document.addEventListener("tizenhwkey", function (e) {
				var ret;
				switch (e["keyName"]) {
				case "back":
					ret = self.runtime.trigger(cr.plugins_.Browser.prototype.cnds.OnBackButton, self);
					if (!ret)
					{
						if (window["tizen"])
							window["tizen"]["application"]["getCurrentApplication"]()["exit"]();
					}
					break;
				case "menu":
					ret = self.runtime.trigger(cr.plugins_.Browser.prototype.cnds.OnMenuButton, self);
					if (!ret)
						e.preventDefault();
					break;
				}
			});
		}
		this.runtime.addSuspendCallback(function(s) {
			if (s)
			{
				self.runtime.trigger(cr.plugins_.Browser.prototype.cnds.OnPageHidden, self);
			}
			else
			{
				self.runtime.trigger(cr.plugins_.Browser.prototype.cnds.OnPageVisible, self);
			}
		});
		this.is_arcade = (typeof window["is_scirra_arcade"] !== "undefined");
	};
	function Cnds() {};
	Cnds.prototype.CookiesEnabled = function()
	{
		return navigator ? navigator.cookieEnabled : false;
	};
	Cnds.prototype.IsOnline = function()
	{
		return navigator ? navigator.onLine : false;
	};
	Cnds.prototype.HasJava = function()
	{
		return navigator ? navigator.javaEnabled() : false;
	};
	Cnds.prototype.OnOnline = function()
	{
		return true;
	};
	Cnds.prototype.OnOffline = function()
	{
		return true;
	};
	Cnds.prototype.IsDownloadingUpdate = function ()
	{
		if (typeof window["applicationCache"] === "undefined")
			return false;
		else
			return window["applicationCache"]["status"] === window["applicationCache"]["DOWNLOADING"];
	};
	Cnds.prototype.OnUpdateReady = function ()
	{
		return true;
	};
	Cnds.prototype.PageVisible = function ()
	{
		return !this.runtime.isSuspended;
	};
	Cnds.prototype.OnPageVisible = function ()
	{
		return true;
	};
	Cnds.prototype.OnPageHidden = function ()
	{
		return true;
	};
	Cnds.prototype.OnResize = function ()
	{
		return true;
	};
	Cnds.prototype.IsFullscreen = function ()
	{
		return !!(document["mozFullScreen"] || document["webkitIsFullScreen"] || document["fullScreen"] || this.runtime.isNodeFullscreen);
	};
	Cnds.prototype.OnBackButton = function ()
	{
		return true;
	};
	Cnds.prototype.OnMenuButton = function ()
	{
		return true;
	};
	Cnds.prototype.OnSearchButton = function ()
	{
		return true;
	};
	Cnds.prototype.IsMetered = function ()
	{
		var connection = navigator["connection"] || navigator["mozConnection"] || navigator["webkitConnection"];
		if (!connection)
			return false;
		return connection["metered"];
	};
	Cnds.prototype.IsCharging = function ()
	{
		var battery = navigator["battery"] || navigator["mozBattery"] || navigator["webkitBattery"];
		if (!battery)
			return true;
		return battery["charging"];
	};
	Cnds.prototype.IsPortraitLandscape = function (p)
	{
		var current = (window.innerWidth <= window.innerHeight ? 0 : 1);
		return current === p;
	};
	pluginProto.cnds = new Cnds();
	function Acts() {};
	Acts.prototype.Alert = function (msg)
	{
		if (!this.runtime.isDomFree)
			alert(msg.toString());
	};
	Acts.prototype.Close = function ()
	{
		if (this.runtime.isCocoonJs)
			CocoonJS["App"]["forceToFinish"]();
		else if (window["tizen"])
			window["tizen"]["application"]["getCurrentApplication"]()["exit"]();
		else if (navigator["app"] && navigator["app"]["exitApp"])
			navigator["app"]["exitApp"]();
		else if (navigator["device"] && navigator["device"]["exitApp"])
			navigator["device"]["exitApp"]();
		else if (!this.is_arcade && !this.runtime.isDomFree)
			window.close();
	};
	Acts.prototype.Focus = function ()
	{
		if (this.runtime.isNodeWebkit)
		{
			var win = window["nwgui"]["Window"]["get"]();
			win["focus"]();
		}
		else if (!this.is_arcade && !this.runtime.isDomFree)
			window.focus();
	};
	Acts.prototype.Blur = function ()
	{
		if (this.runtime.isNodeWebkit)
		{
			var win = window["nwgui"]["Window"]["get"]();
			win["blur"]();
		}
		else if (!this.is_arcade && !this.runtime.isDomFree)
			window.blur();
	};
	Acts.prototype.GoBack = function ()
	{
		if (navigator["app"] && navigator["app"]["backHistory"])
			navigator["app"]["backHistory"]();
		else if (!this.is_arcade && !this.runtime.isDomFree && window.back)
			window.back();
	};
	Acts.prototype.GoForward = function ()
	{
		if (!this.is_arcade && !this.runtime.isDomFree && window.forward)
			window.forward();
	};
	Acts.prototype.GoHome = function ()
	{
		if (!this.is_arcade && !this.runtime.isDomFree && window.home)
			window.home();
	};
	Acts.prototype.GoToURL = function (url)
	{
		if (this.runtime.isCocoonJs)
			CocoonJS["App"]["openURL"](url);
		else if (!this.is_arcade && !this.runtime.isDomFree)
			window.location = url;
	};
	Acts.prototype.GoToURLWindow = function (url, tag)
	{
		if (this.runtime.isCocoonJs)
			CocoonJS["App"]["openURL"](url);
		else if (!this.is_arcade && !this.runtime.isDomFree)
			window.open(url, tag);
	};
	Acts.prototype.Reload = function ()
	{
		if (!this.is_arcade && !this.runtime.isDomFree)
			window.location.reload();
	};
	var firstRequestFullscreen = true;
	var crruntime = null;
	function onFullscreenError()
	{
		if (typeof jQuery !== "undefined")
		{
			crruntime["setSize"](jQuery(window).width(), jQuery(window).height());
		}
	};
	Acts.prototype.RequestFullScreen = function (stretchmode)
	{
		if (this.runtime.isDomFree)
		{
			cr.logexport("[] Requesting fullscreen is not supported on this platform - the request has been ignored");
			return;
		}
		if (stretchmode >= 2)
			stretchmode += 1;
		if (stretchmode === 6)
			stretchmode = 2;
		if (this.runtime.isNodeWebkit)
		{
			if (!this.runtime.isNodeFullscreen)
			{
				window["nwgui"]["Window"]["get"]()["enterFullscreen"]();
				this.runtime.isNodeFullscreen = true;
			}
		}
		else
		{
			if (document["mozFullScreen"] || document["webkitIsFullScreen"] || !!document["msFullscreenElement"] || document["fullScreen"])
			{
				return;
			}
			this.runtime.fullscreen_scaling = (stretchmode >= 2 ? stretchmode : 0);
			var elem = this.runtime.canvasdiv || this.runtime.canvas;
			if (firstRequestFullscreen)
			{
				firstRequestFullscreen = false;
				crruntime = this.runtime;
				elem.addEventListener("mozfullscreenerror", onFullscreenError);
				elem.addEventListener("webkitfullscreenerror", onFullscreenError);
				elem.addEventListener("msfullscreenerror", onFullscreenError);
				elem.addEventListener("fullscreenerror", onFullscreenError);
			}
			if (!cr.is_undefined(elem["requestFullscreen"]))
				elem["requestFullscreen"]();
			else if (!cr.is_undefined(elem["webkitRequestFullScreen"]))
			{
				if (typeof Element !== "undefined" && typeof Element["ALLOW_KEYBOARD_INPUT"] !== "undefined")
					elem["webkitRequestFullScreen"](Element["ALLOW_KEYBOARD_INPUT"]);
				else
					elem["webkitRequestFullScreen"]();
			}
			else if (!cr.is_undefined(elem["mozRequestFullScreen"]))
				elem["mozRequestFullScreen"]();
			else if (!cr.is_undefined(elem["msRequestFullscreen"]))
				elem["msRequestFullscreen"]();
		}
	};
	Acts.prototype.CancelFullScreen = function ()
	{
		if (this.runtime.isDomFree)
		{
			cr.logexport("[] Exiting fullscreen is not supported on this platform - the request has been ignored");
			return;
		}
		if (this.runtime.isNodeWebkit)
		{
			if (this.runtime.isNodeFullscreen)
			{
				window["nwgui"]["Window"]["get"]()["leaveFullscreen"]();
				this.runtime.isNodeFullscreen = false;
			}
		}
		else
		{
			if (!cr.is_undefined(document["exitFullscreen"]))
				document["exitFullscreen"]();
			else if (!cr.is_undefined(document["webkitCancelFullScreen"]))
				document["webkitCancelFullScreen"]();
			else if (!cr.is_undefined(document["mozCancelFullScreen"]))
				document["mozCancelFullScreen"]();
			else if (!cr.is_undefined(document["msExitFullscreen"]))
				document["msExitFullscreen"]();
		}
	};
	Acts.prototype.Vibrate = function (pattern_)
	{
		try {
			var arr = pattern_.split(",");
			var i, len;
			for (i = 0, len = arr.length; i < len; i++)
			{
				arr[i] = parseInt(arr[i], 10);
			}
			if (navigator["vibrate"])
				navigator["vibrate"](arr);
			else if (navigator["mozVibrate"])
				navigator["mozVibrate"](arr);
			else if (navigator["webkitVibrate"])
				navigator["webkitVibrate"](arr);
			else if (navigator["msVibrate"])
				navigator["msVibrate"](arr);
		}
		catch (e) {}
	};
	Acts.prototype.InvokeDownload = function (url_, filename_)
	{
		var a = document.createElement("a");
		if (typeof a.download === "undefined")
		{
			window.open(url_);
		}
		else
		{
			var body = document.getElementsByTagName("body")[0];
			a.textContent = filename_;
			a.href = url_;
			a.download = filename_;
			body.appendChild(a);
			var clickEvent = document.createEvent("MouseEvent");
			clickEvent.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
			a.dispatchEvent(clickEvent);
			body.removeChild(a);
		}
	};
	Acts.prototype.InvokeDownloadString = function (str_, mimetype_, filename_)
	{
		var datauri = "data:" + mimetype_ + "," + encodeURIComponent(str_);
		var a = document.createElement("a");
		if (typeof a.download === "undefined")
		{
			window.open(datauri);
		}
		else
		{
			var body = document.getElementsByTagName("body")[0];
			a.textContent = filename_;
			a.href = datauri;
			a.download = filename_;
			body.appendChild(a);
			var clickEvent = document.createEvent("MouseEvent");
			clickEvent.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
			a.dispatchEvent(clickEvent);
			body.removeChild(a);
		}
	};
	Acts.prototype.ConsoleLog = function (type_, msg_)
	{
		if (typeof console === "undefined")
			return;
		if (type_ === 0 && console.log)
			console.log(msg_.toString());
		if (type_ === 1 && console.warn)
			console.warn(msg_.toString());
		if (type_ === 2 && console.error)
			console.error(msg_.toString());
	};
	Acts.prototype.ConsoleGroup = function (name_)
	{
		if (console && console.group)
			console.group(name_);
	};
	Acts.prototype.ConsoleGroupEnd = function ()
	{
		if (console && console.groupEnd)
			console.groupEnd();
	};
	Acts.prototype.ExecJs = function (js_)
	{
		if (eval)
			eval(js_);
	};
	var orientations = [
		"portrait",
		"landscape",
		"portrait-primary",
		"portrait-secondary",
		"landscape-primary",
		"landscape-secondary"
	];
	Acts.prototype.LockOrientation = function (o)
	{
		o = Math.floor(o);
		if (o < 0 || o >= orientations.length)
			return;
		this.runtime.autoLockOrientation = false;
		var orientation = orientations[o];
		if (screen["lockOrientation"])
			screen["lockOrientation"](orientation);
		else if (screen["webkitLockOrientation"])
			screen["webkitLockOrientation"](orientation);
		else if (screen["mozLockOrientation"])
			screen["mozLockOrientation"](orientation);
		else if (screen["msLockOrientation"])
			screen["msLockOrientation"](orientation);
	};
	Acts.prototype.UnlockOrientation = function ()
	{
		this.runtime.autoLockOrientation = false;
		if (screen["unlockOrientation"])
			screen["unlockOrientation"]();
		else if (screen["webkitUnlockOrientation"])
			screen["webkitUnlockOrientation"]();
		else if (screen["mozUnlockOrientation"])
			screen["mozUnlockOrientation"]();
		else if (screen["msUnlockOrientation"])
			screen["msUnlockOrientation"]();
	};
	pluginProto.acts = new Acts();
	function Exps() {};
	Exps.prototype.URL = function (ret)
	{
		ret.set_string(this.runtime.isDomFree ? "" : window.location.toString());
	};
	Exps.prototype.Protocol = function (ret)
	{
		ret.set_string(this.runtime.isDomFree ? "" : window.location.protocol);
	};
	Exps.prototype.Domain = function (ret)
	{
		ret.set_string(this.runtime.isDomFree ? "" : window.location.hostname);
	};
	Exps.prototype.PathName = function (ret)
	{
		ret.set_string(this.runtime.isDomFree ? "" : window.location.pathname);
	};
	Exps.prototype.Hash = function (ret)
	{
		ret.set_string(this.runtime.isDomFree ? "" : window.location.hash);
	};
	Exps.prototype.Referrer = function (ret)
	{
		ret.set_string(this.runtime.isDomFree ? "" : document.referrer);
	};
	Exps.prototype.Title = function (ret)
	{
		ret.set_string(this.runtime.isDomFree ? "" : document.title);
	};
	Exps.prototype.Name = function (ret)
	{
		ret.set_string(this.runtime.isDomFree ? "" : navigator.appName);
	};
	Exps.prototype.Version = function (ret)
	{
		ret.set_string(this.runtime.isDomFree ? "" : navigator.appVersion);
	};
	Exps.prototype.Language = function (ret)
	{
		if (navigator && navigator.language)
			ret.set_string(navigator.language);
		else
			ret.set_string("");
	};
	Exps.prototype.Platform = function (ret)
	{
		ret.set_string(this.runtime.isDomFree ? "" : navigator.platform);
	};
	Exps.prototype.Product = function (ret)
	{
		if (navigator && navigator.product)
			ret.set_string(navigator.product);
		else
			ret.set_string("");
	};
	Exps.prototype.Vendor = function (ret)
	{
		if (navigator && navigator.vendor)
			ret.set_string(navigator.vendor);
		else
			ret.set_string("");
	};
	Exps.prototype.UserAgent = function (ret)
	{
		ret.set_string(this.runtime.isDomFree ? "" : navigator.userAgent);
	};
	Exps.prototype.QueryString = function (ret)
	{
		ret.set_string(this.runtime.isDomFree ? "" : window.location.search);
	};
	Exps.prototype.QueryParam = function (ret, paramname)
	{
		if (this.runtime.isDomFree)
		{
			ret.set_string("");
			return;
		}
		var match = RegExp('[?&]' + paramname + '=([^&]*)').exec(window.location.search);
		if (match)
			ret.set_string(decodeURIComponent(match[1].replace(/\+/g, ' ')));
		else
			ret.set_string("");
	};
	Exps.prototype.Bandwidth = function (ret)
	{
		var connection = navigator["connection"] || navigator["mozConnection"] || navigator["webkitConnection"];
		if (!connection)
			ret.set_float(Number.POSITIVE_INFINITY);
		else
			ret.set_float(connection["bandwidth"]);
	};
	Exps.prototype.BatteryLevel = function (ret)
	{
		var battery = navigator["battery"] || navigator["mozBattery"] || navigator["webkitBattery"];
		if (!battery)
			ret.set_float(1);
		else
			ret.set_float(battery["level"]);
	};
	Exps.prototype.BatteryTimeLeft = function (ret)
	{
		var battery = navigator["battery"] || navigator["mozBattery"] || navigator["webkitBattery"];
		if (!battery)
			ret.set_float(Number.POSITIVE_INFINITY);
		else
			ret.set_float(battery["dischargingTime"]);
	};
	Exps.prototype.ExecJS = function (ret, js_)
	{
		if (!eval)
		{
			ret.set_any(0);
			return;
		}
		var result = eval(js_);
		if (typeof result === "number")
			ret.set_any(result);
		else if (typeof result === "string")
			ret.set_any(result);
		else if (typeof result === "boolean")
			ret.set_any(result ? 1 : 0);
		else
			ret.set_any(0);
	};
	Exps.prototype.ScreenWidth = function (ret)
	{
		ret.set_int(screen.width);
	};
	Exps.prototype.ScreenHeight = function (ret)
	{
		ret.set_int(screen.height);
	};
	Exps.prototype.DevicePixelRatio = function (ret)
	{
		ret.set_float(this.runtime.devicePixelRatio);
	};
	pluginProto.exps = new Exps();
}());
;
;
cr.plugins_.Button = function(runtime)
{
	this.runtime = runtime;
};
(function ()
{
	var pluginProto = cr.plugins_.Button.prototype;
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};
	var typeProto = pluginProto.Type.prototype;
	typeProto.onCreate = function()
	{
	};
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
	};
	var instanceProto = pluginProto.Instance.prototype;
	instanceProto.onCreate = function()
	{
		if (this.runtime.isDomFree)
		{
			cr.logexport("[] Button plugin not supported on this platform - the object will not be created");
			return;
		}
		this.isCheckbox = (this.properties[0] === 1);
		this.inputElem = document.createElement("input");
		if (this.isCheckbox)
			this.elem = document.createElement("label");
		else
			this.elem = this.inputElem;
		this.labelText = null;
		this.inputElem.type = (this.isCheckbox ? "checkbox" : "button");
		this.inputElem.id = this.properties[6];
		jQuery(this.elem).appendTo(this.runtime.canvasdiv ? this.runtime.canvasdiv : "body");
		if (this.isCheckbox)
		{
			jQuery(this.inputElem).appendTo(this.elem);
			this.labelText = document.createTextNode(this.properties[1]);
			jQuery(this.elem).append(this.labelText);
			this.inputElem.checked = (this.properties[7] !== 0);
			jQuery(this.elem).css("font-family", "sans-serif");
			jQuery(this.elem).css("display", "inline-block");
			jQuery(this.elem).css("color", "black");
		}
		else
			this.inputElem.value = this.properties[1];
		this.elem.title = this.properties[2];
		this.inputElem.disabled = (this.properties[4] === 0);
		this.autoFontSize = (this.properties[5] !== 0);
		this.element_hidden = false;
		if (this.properties[3] === 0)
		{
			jQuery(this.elem).hide();
			this.visible = false;
			this.element_hidden = true;
		}
		this.inputElem.onclick = (function (self) {
			return function(e) {
				e.stopPropagation();
				self.runtime.isInUserInputEvent = true;
				self.runtime.trigger(cr.plugins_.Button.prototype.cnds.OnClicked, self);
				self.runtime.isInUserInputEvent = false;
			};
		})(this);
		this.elem.addEventListener("touchstart", function (e) {
			e.stopPropagation();
		}, false);
		this.elem.addEventListener("touchmove", function (e) {
			e.stopPropagation();
		}, false);
		this.elem.addEventListener("touchend", function (e) {
			e.stopPropagation();
		}, false);
		jQuery(this.elem).mousedown(function (e) {
			e.stopPropagation();
		});
		jQuery(this.elem).mouseup(function (e) {
			e.stopPropagation();
		});
		jQuery(this.elem).keydown(function (e) {
			e.stopPropagation();
		});
		jQuery(this.elem).keyup(function (e) {
			e.stopPropagation();
		});
		this.lastLeft = 0;
		this.lastTop = 0;
		this.lastRight = 0;
		this.lastBottom = 0;
		this.lastWinWidth = 0;
		this.lastWinHeight = 0;
		this.updatePosition(true);
		this.runtime.tickMe(this);
	};
	instanceProto.saveToJSON = function ()
	{
		var o = {
			"tooltip": this.elem.title,
			"disabled": !!this.inputElem.disabled
		};
		if (this.isCheckbox)
		{
			o["checked"] = !!this.inputElem.checked;
			o["text"] = this.labelText.nodeValue;
		}
		else
		{
			o["text"] = this.elem.value;
		}
		return o;
	};
	instanceProto.loadFromJSON = function (o)
	{
		this.elem.title = o["tooltip"];
		this.inputElem.disabled = o["disabled"];
		if (this.isCheckbox)
		{
			this.inputElem.checked = o["checked"];
			this.labelText.nodeValue = o["text"];
		}
		else
		{
			this.elem.value = o["text"];
		}
	};
	instanceProto.onDestroy = function ()
	{
		if (this.runtime.isDomFree)
			return;
		jQuery(this.elem).remove();
		this.elem = null;
	};
	instanceProto.tick = function ()
	{
		this.updatePosition();
	};
	var last_canvas_offset = null;
	var last_checked_tick = -1;
	instanceProto.updatePosition = function (first)
	{
		if (this.runtime.isDomFree)
			return;
		var left = this.layer.layerToCanvas(this.x, this.y, true);
		var top = this.layer.layerToCanvas(this.x, this.y, false);
		var right = this.layer.layerToCanvas(this.x + this.width, this.y + this.height, true);
		var bottom = this.layer.layerToCanvas(this.x + this.width, this.y + this.height, false);
		if (!this.visible || !this.layer.visible || right <= 0 || bottom <= 0 || left >= this.runtime.width || top >= this.runtime.height)
		{
			if (!this.element_hidden)
				jQuery(this.elem).hide();
			this.element_hidden = true;
			return;
		}
		if (left < 1)
			left = 1;
		if (top < 1)
			top = 1;
		if (right >= this.runtime.width)
			right = this.runtime.width - 1;
		if (bottom >= this.runtime.height)
			bottom = this.runtime.height - 1;
		var curWinWidth = window.innerWidth;
		var curWinHeight = window.innerHeight;
		if (!first && this.lastLeft === left && this.lastTop === top && this.lastRight === right && this.lastBottom === bottom && this.lastWinWidth === curWinWidth && this.lastWinHeight === curWinHeight)
		{
			if (this.element_hidden)
			{
				jQuery(this.elem).show();
				this.element_hidden = false;
			}
			return;
		}
		this.lastLeft = left;
		this.lastTop = top;
		this.lastRight = right;
		this.lastBottom = bottom;
		this.lastWinWidth = curWinWidth;
		this.lastWinHeight = curWinHeight;
		if (this.element_hidden)
		{
			jQuery(this.elem).show();
			this.element_hidden = false;
		}
		var offx = Math.round(left) + jQuery(this.runtime.canvas).offset().left;
		var offy = Math.round(top) + jQuery(this.runtime.canvas).offset().top;
		jQuery(this.elem).css("position", "absolute");
		jQuery(this.elem).offset({left: offx, top: offy});
		jQuery(this.elem).width(Math.round(right - left));
		jQuery(this.elem).height(Math.round(bottom - top));
		if (this.autoFontSize)
			jQuery(this.elem).css("font-size", ((this.layer.getScale(true) / this.runtime.devicePixelRatio) - 0.2) + "em");
	};
	instanceProto.draw = function(ctx)
	{
	};
	instanceProto.drawGL = function(glw)
	{
	};
	function Cnds() {};
	Cnds.prototype.OnClicked = function ()
	{
		return true;
	};
	Cnds.prototype.IsChecked = function ()
	{
		return this.isCheckbox && this.inputElem.checked;
	};
	pluginProto.cnds = new Cnds();
	function Acts() {};
	Acts.prototype.SetText = function (text)
	{
		if (this.runtime.isDomFree)
			return;
		if (this.isCheckbox)
			this.labelText.nodeValue = text;
		else
			this.elem.value = text;
	};
	Acts.prototype.SetTooltip = function (text)
	{
		if (this.runtime.isDomFree)
			return;
		this.elem.title = text;
	};
	Acts.prototype.SetVisible = function (vis)
	{
		if (this.runtime.isDomFree)
			return;
		this.visible = (vis !== 0);
	};
	Acts.prototype.SetEnabled = function (en)
	{
		if (this.runtime.isDomFree)
			return;
		this.inputElem.disabled = (en === 0);
	};
	Acts.prototype.SetFocus = function ()
	{
		if (this.runtime.isDomFree)
			return;
		this.inputElem.focus();
	};
	Acts.prototype.SetBlur = function ()
	{
		if (this.runtime.isDomFree)
			return;
		this.inputElem.blur();
	};
	Acts.prototype.SetCSSStyle = function (p, v)
	{
		if (this.runtime.isDomFree)
			return;
		jQuery(this.elem).css(p, v);
	};
	Acts.prototype.SetChecked = function (c)
	{
		if (this.runtime.isDomFree || !this.isCheckbox)
			return;
		this.inputElem.checked = (c === 1);
	};
	Acts.prototype.ToggleChecked = function ()
	{
		if (this.runtime.isDomFree || !this.isCheckbox)
			return;
		this.inputElem.checked = !this.inputElem.checked;
	};
	pluginProto.acts = new Acts();
	function Exps() {};
	pluginProto.exps = new Exps();
}());
;
;
cr.plugins_.Function = function(runtime)
{
	this.runtime = runtime;
};
(function ()
{
	var pluginProto = cr.plugins_.Function.prototype;
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};
	var typeProto = pluginProto.Type.prototype;
	typeProto.onCreate = function()
	{
	};
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
	};
	var instanceProto = pluginProto.Instance.prototype;
	var funcStack = [];
	var funcStackPtr = -1;
	var isInPreview = false;	// set in onCreate
	function FuncStackEntry()
	{
		this.name = "";
		this.retVal = 0;
		this.params = [];
	};
	function pushFuncStack()
	{
		funcStackPtr++;
		if (funcStackPtr === funcStack.length)
			funcStack.push(new FuncStackEntry());
		return funcStack[funcStackPtr];
	};
	function getCurrentFuncStack()
	{
		if (funcStackPtr < 0)
			return null;
		return funcStack[funcStackPtr];
	};
	function getOneAboveFuncStack()
	{
		if (!funcStack.length)
			return null;
		var i = funcStackPtr + 1;
		if (i >= funcStack.length)
			i = funcStack.length - 1;
		return funcStack[i];
	};
	function popFuncStack()
	{
;
		funcStackPtr--;
	};
	instanceProto.onCreate = function()
	{
		isInPreview = (typeof cr_is_preview !== "undefined");
	};
	function Cnds() {};
	Cnds.prototype.OnFunction = function (name_)
	{
		var fs = getCurrentFuncStack();
		if (!fs)
			return false;
		return cr.equals_nocase(name_, fs.name);
	};
	Cnds.prototype.CompareParam = function (index_, cmp_, value_)
	{
		var fs = getCurrentFuncStack();
		if (!fs)
			return false;
		index_ = cr.floor(index_);
		if (index_ < 0 || index_ >= fs.params.length)
			return false;
		return cr.do_cmp(fs.params[index_], cmp_, value_);
	};
	pluginProto.cnds = new Cnds();
	function Acts() {};
	Acts.prototype.CallFunction = function (name_, params_)
	{
		var fs = pushFuncStack();
		fs.name = name_.toLowerCase();
		fs.retVal = 0;
		cr.shallowAssignArray(fs.params, params_);
		var ran = this.runtime.trigger(cr.plugins_.Function.prototype.cnds.OnFunction, this, fs.name);
		if (isInPreview && !ran)
		{
;
		}
		popFuncStack();
	};
	Acts.prototype.SetReturnValue = function (value_)
	{
		var fs = getCurrentFuncStack();
		if (fs)
			fs.retVal = value_;
		else
;
	};
	pluginProto.acts = new Acts();
	function Exps() {};
	Exps.prototype.ReturnValue = function (ret)
	{
		var fs = getOneAboveFuncStack();
		if (fs)
			ret.set_any(fs.retVal);
		else
			ret.set_int(0);
	};
	Exps.prototype.ParamCount = function (ret)
	{
		var fs = getCurrentFuncStack();
		if (fs)
			ret.set_int(fs.params.length);
		else
		{
;
			ret.set_int(0);
		}
	};
	Exps.prototype.Param = function (ret, index_)
	{
		index_ = cr.floor(index_);
		var fs = getCurrentFuncStack();
		if (fs)
		{
			if (index_ >= 0 && index_ < fs.params.length)
			{
				ret.set_any(fs.params[index_]);
			}
			else
			{
;
				ret.set_int(0);
			}
		}
		else
		{
;
			ret.set_int(0);
		}
	};
	Exps.prototype.Call = function (ret, name_)
	{
		var fs = pushFuncStack();
		fs.name = name_.toLowerCase();
		fs.retVal = 0;
		fs.params.length = 0;
		var i, len;
		for (i = 2, len = arguments.length; i < len; i++)
			fs.params.push(arguments[i]);
		var ran = this.runtime.trigger(cr.plugins_.Function.prototype.cnds.OnFunction, this, fs.name);
		if (isInPreview && !ran)
		{
;
		}
		popFuncStack();
		ret.set_any(fs.retVal);
	};
	pluginProto.exps = new Exps();
}());
;
;
cr.plugins_.Keyboard = function(runtime)
{
	this.runtime = runtime;
};
(function ()
{
	var pluginProto = cr.plugins_.Keyboard.prototype;
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};
	var typeProto = pluginProto.Type.prototype;
	typeProto.onCreate = function()
	{
	};
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
		this.keyMap = new Array(256);	// stores key up/down state
		this.usedKeys = new Array(256);
		this.triggerKey = 0;
	};
	var instanceProto = pluginProto.Instance.prototype;
	instanceProto.onCreate = function()
	{
		var self = this;
		if (!this.runtime.isDomFree)
		{
			jQuery(document).keydown(
				function(info) {
					self.onKeyDown(info);
				}
			);
			jQuery(document).keyup(
				function(info) {
					self.onKeyUp(info);
				}
			);
		}
	};
	var keysToBlockWhenFramed = [32, 33, 34, 35, 36, 37, 38, 39, 40, 44];
	instanceProto.onKeyDown = function (info)
	{
		var alreadyPreventedDefault = false;
		if (window != window.top && keysToBlockWhenFramed.indexOf(info.which) > -1)
		{
			info.preventDefault();
			alreadyPreventedDefault = true;
			info.stopPropagation();
		}
		if (this.keyMap[info.which])
		{
			if (this.usedKeys[info.which] && !alreadyPreventedDefault)
				info.preventDefault();
			return;
		}
		this.keyMap[info.which] = true;
		this.triggerKey = info.which;
		this.runtime.isInUserInputEvent = true;
		this.runtime.trigger(cr.plugins_.Keyboard.prototype.cnds.OnAnyKey, this);
		var eventRan = this.runtime.trigger(cr.plugins_.Keyboard.prototype.cnds.OnKey, this);
		var eventRan2 = this.runtime.trigger(cr.plugins_.Keyboard.prototype.cnds.OnKeyCode, this);
		this.runtime.isInUserInputEvent = false;
		if (eventRan || eventRan2)
		{
			this.usedKeys[info.which] = true;
			if (!alreadyPreventedDefault)
				info.preventDefault();
		}
	};
	instanceProto.onKeyUp = function (info)
	{
		this.keyMap[info.which] = false;
		this.triggerKey = info.which;
		this.runtime.isInUserInputEvent = true;
		this.runtime.trigger(cr.plugins_.Keyboard.prototype.cnds.OnAnyKeyReleased, this);
		var eventRan = this.runtime.trigger(cr.plugins_.Keyboard.prototype.cnds.OnKeyReleased, this);
		var eventRan2 = this.runtime.trigger(cr.plugins_.Keyboard.prototype.cnds.OnKeyCodeReleased, this);
		this.runtime.isInUserInputEvent = false;
		if (eventRan || eventRan2 || this.usedKeys[info.which])
		{
			this.usedKeys[info.which] = true;
			info.preventDefault();
		}
	};
	instanceProto.saveToJSON = function ()
	{
		return { "triggerKey": this.triggerKey };
	};
	instanceProto.loadFromJSON = function (o)
	{
		this.triggerKey = o["triggerKey"];
	};
	function Cnds() {};
	Cnds.prototype.IsKeyDown = function(key)
	{
		return this.keyMap[key];
	};
	Cnds.prototype.OnKey = function(key)
	{
		return (key === this.triggerKey);
	};
	Cnds.prototype.OnAnyKey = function(key)
	{
		return true;
	};
	Cnds.prototype.OnAnyKeyReleased = function(key)
	{
		return true;
	};
	Cnds.prototype.OnKeyReleased = function(key)
	{
		return (key === this.triggerKey);
	};
	Cnds.prototype.IsKeyCodeDown = function(key)
	{
		key = Math.floor(key);
		if (key < 0 || key >= this.keyMap.length)
			return false;
		return this.keyMap[key];
	};
	Cnds.prototype.OnKeyCode = function(key)
	{
		return (key === this.triggerKey);
	};
	Cnds.prototype.OnKeyCodeReleased = function(key)
	{
		return (key === this.triggerKey);
	};
	pluginProto.cnds = new Cnds();
	function Acts() {};
	pluginProto.acts = new Acts();
	function Exps() {};
	Exps.prototype.LastKeyCode = function (ret)
	{
		ret.set_int(this.triggerKey);
	};
	function fixedStringFromCharCode(kc)
	{
		kc = Math.floor(kc);
		switch (kc) {
		case 8:		return "backspace";
		case 9:		return "tab";
		case 13:	return "enter";
		case 16:	return "shift";
		case 17:	return "control";
		case 18:	return "alt";
		case 19:	return "pause";
		case 20:	return "capslock";
		case 27:	return "esc";
		case 33:	return "pageup";
		case 34:	return "pagedown";
		case 35:	return "end";
		case 36:	return "home";
		case 37:	return "←";
		case 38:	return "↑";
		case 39:	return "→";
		case 40:	return "↓";
		case 45:	return "insert";
		case 46:	return "del";
		case 91:	return "left window key";
		case 92:	return "right window key";
		case 93:	return "select";
		case 96:	return "numpad 0";
		case 97:	return "numpad 1";
		case 98:	return "numpad 2";
		case 99:	return "numpad 3";
		case 100:	return "numpad 4";
		case 101:	return "numpad 5";
		case 102:	return "numpad 6";
		case 103:	return "numpad 7";
		case 104:	return "numpad 8";
		case 105:	return "numpad 9";
		case 106:	return "numpad *";
		case 107:	return "numpad +";
		case 109:	return "numpad -";
		case 110:	return "numpad .";
		case 111:	return "numpad /";
		case 112:	return "F1";
		case 113:	return "F2";
		case 114:	return "F3";
		case 115:	return "F4";
		case 116:	return "F5";
		case 117:	return "F6";
		case 118:	return "F7";
		case 119:	return "F8";
		case 120:	return "F9";
		case 121:	return "F10";
		case 122:	return "F11";
		case 123:	return "F12";
		case 144:	return "numlock";
		case 145:	return "scroll lock";
		case 186:	return ";";
		case 187:	return "=";
		case 188:	return ",";
		case 189:	return "-";
		case 190:	return ".";
		case 191:	return "/";
		case 192:	return "'";
		case 219:	return "[";
		case 220:	return "\\";
		case 221:	return "]";
		case 222:	return "#";
		case 223:	return "`";
		default:	return String.fromCharCode(kc);
		}
	};
	Exps.prototype.StringFromKeyCode = function (ret, kc)
	{
		ret.set_string(fixedStringFromCharCode(kc));
	};
	pluginProto.exps = new Exps();
}());
;
;
cr.plugins_.Mouse = function(runtime)
{
	this.runtime = runtime;
};
(function ()
{
	var pluginProto = cr.plugins_.Mouse.prototype;
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};
	var typeProto = pluginProto.Type.prototype;
	typeProto.onCreate = function()
	{
	};
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
		this.buttonMap = new Array(4);		// mouse down states
		this.mouseXcanvas = 0;				// mouse position relative to canvas
		this.mouseYcanvas = 0;
		this.triggerButton = 0;
		this.triggerType = 0;
		this.triggerDir = 0;
		this.handled = false;
	};
	var instanceProto = pluginProto.Instance.prototype;
	instanceProto.onCreate = function()
	{
		var self = this;
		if (!this.runtime.isDomFree)
		{
			jQuery(document).mousemove(
				function(info) {
					self.onMouseMove(info);
				}
			);
			jQuery(document).mousedown(
				function(info) {
					self.onMouseDown(info);
				}
			);
			jQuery(document).mouseup(
				function(info) {
					self.onMouseUp(info);
				}
			);
			jQuery(document).dblclick(
				function(info) {
					self.onDoubleClick(info);
				}
			);
			var wheelevent = function(info) {
								self.onWheel(info);
							};
			document.addEventListener("mousewheel", wheelevent, false);
			document.addEventListener("DOMMouseScroll", wheelevent, false);
		}
	};
	var dummyoffset = {left: 0, top: 0};
	instanceProto.onMouseMove = function(info)
	{
		var offset = this.runtime.isDomFree ? dummyoffset : jQuery(this.runtime.canvas).offset();
		this.mouseXcanvas = info.pageX - offset.left;
		this.mouseYcanvas = info.pageY - offset.top;
	};
	instanceProto.mouseInGame = function ()
	{
		if (this.runtime.fullscreen_mode > 0)
			return true;
		return this.mouseXcanvas >= 0 && this.mouseYcanvas >= 0
		    && this.mouseXcanvas < this.runtime.width && this.mouseYcanvas < this.runtime.height;
	};
	instanceProto.onMouseDown = function(info)
	{
		if (!this.mouseInGame())
			return;
		if (this.runtime.had_a_click)
			info.preventDefault();
		this.buttonMap[info.which] = true;
		this.runtime.isInUserInputEvent = true;
		this.runtime.trigger(cr.plugins_.Mouse.prototype.cnds.OnAnyClick, this);
		this.triggerButton = info.which - 1;	// 1-based
		this.triggerType = 0;					// single click
		this.runtime.trigger(cr.plugins_.Mouse.prototype.cnds.OnClick, this);
		this.runtime.trigger(cr.plugins_.Mouse.prototype.cnds.OnObjectClicked, this);
		this.runtime.isInUserInputEvent = false;
	};
	instanceProto.onMouseUp = function(info)
	{
		if (!this.buttonMap[info.which])
			return;
		if (this.runtime.had_a_click)
			info.preventDefault();
		this.runtime.had_a_click = true;
		this.buttonMap[info.which] = false;
		this.runtime.isInUserInputEvent = true;
		this.triggerButton = info.which - 1;	// 1-based
		this.runtime.trigger(cr.plugins_.Mouse.prototype.cnds.OnRelease, this);
		this.runtime.isInUserInputEvent = false;
	};
	instanceProto.onDoubleClick = function(info)
	{
		if (!this.mouseInGame())
			return;
		info.preventDefault();
		this.runtime.isInUserInputEvent = true;
		this.triggerButton = info.which - 1;	// 1-based
		this.triggerType = 1;					// double click
		this.runtime.trigger(cr.plugins_.Mouse.prototype.cnds.OnClick, this);
		this.runtime.trigger(cr.plugins_.Mouse.prototype.cnds.OnObjectClicked, this);
		this.runtime.isInUserInputEvent = false;
	};
	instanceProto.onWheel = function (info)
	{
		var delta = info.wheelDelta ? info.wheelDelta : info.detail ? -info.detail : 0;
		this.triggerDir = (delta < 0 ? 0 : 1);
		this.handled = false;
		this.runtime.isInUserInputEvent = true;
		this.runtime.trigger(cr.plugins_.Mouse.prototype.cnds.OnWheel, this);
		this.runtime.isInUserInputEvent = false;
		if (this.handled)
			info.preventDefault();
	};
	function Cnds() {};
	Cnds.prototype.OnClick = function (button, type)
	{
		return button === this.triggerButton && type === this.triggerType;
	};
	Cnds.prototype.OnAnyClick = function ()
	{
		return true;
	};
	Cnds.prototype.IsButtonDown = function (button)
	{
		return this.buttonMap[button + 1];	// jQuery uses 1-based buttons for some reason
	};
	Cnds.prototype.OnRelease = function (button)
	{
		return button === this.triggerButton;
	};
	Cnds.prototype.IsOverObject = function (obj)
	{
		var cnd = this.runtime.getCurrentCondition();
		var mx = this.mouseXcanvas;
		var my = this.mouseYcanvas;
		return cr.xor(this.runtime.testAndSelectCanvasPointOverlap(obj, mx, my, cnd.inverted), cnd.inverted);
	};
	Cnds.prototype.OnObjectClicked = function (button, type, obj)
	{
		if (button !== this.triggerButton || type !== this.triggerType)
			return false;	// wrong click type
		return this.runtime.testAndSelectCanvasPointOverlap(obj, this.mouseXcanvas, this.mouseYcanvas, false);
	};
	Cnds.prototype.OnWheel = function (dir)
	{
		this.handled = true;
		return dir === this.triggerDir;
	};
	pluginProto.cnds = new Cnds();
	function Acts() {};
	Acts.prototype.SetCursor = function (c)
	{
		var cursor_style = ["auto", "pointer", "text", "crosshair", "move", "help", "wait", "none"][c];
		if (this.runtime.canvas && this.runtime.canvas.style)
			this.runtime.canvas.style.cursor = cursor_style;
	};
	Acts.prototype.SetCursorSprite = function (obj)
	{
		if (this.runtime.isDomFree || this.runtime.isMobile || !obj)
			return;
		var inst = obj.getFirstPicked();
		if (!inst || !inst.curFrame)
			return;
		var frame = inst.curFrame;
		var datauri = frame.getDataUri();
		var cursor_style = "url(" + datauri + ") " + Math.round(frame.hotspotX * frame.width) + " " + Math.round(frame.hotspotY * frame.height) + ", auto";
		jQuery(this.runtime.canvas).css("cursor", cursor_style);
	};
	pluginProto.acts = new Acts();
	function Exps() {};
	Exps.prototype.X = function (ret, layerparam)
	{
		var layer, oldScale, oldZoomRate, oldParallaxX, oldAngle;
		if (cr.is_undefined(layerparam))
		{
			layer = this.runtime.getLayerByNumber(0);
			oldScale = layer.scale;
			oldZoomRate = layer.zoomRate;
			oldParallaxX = layer.parallaxX;
			oldAngle = layer.angle;
			layer.scale = this.runtime.running_layout.scale;
			layer.zoomRate = 1.0;
			layer.parallaxX = 1.0;
			layer.angle = this.runtime.running_layout.angle;
			ret.set_float(layer.canvasToLayer(this.mouseXcanvas, this.mouseYcanvas, true));
			layer.scale = oldScale;
			layer.zoomRate = oldZoomRate;
			layer.parallaxX = oldParallaxX;
			layer.angle = oldAngle;
		}
		else
		{
			if (cr.is_number(layerparam))
				layer = this.runtime.getLayerByNumber(layerparam);
			else
				layer = this.runtime.getLayerByName(layerparam);
			if (layer)
				ret.set_float(layer.canvasToLayer(this.mouseXcanvas, this.mouseYcanvas, true));
			else
				ret.set_float(0);
		}
	};
	Exps.prototype.Y = function (ret, layerparam)
	{
		var layer, oldScale, oldZoomRate, oldParallaxY, oldAngle;
		if (cr.is_undefined(layerparam))
		{
			layer = this.runtime.getLayerByNumber(0);
			oldScale = layer.scale;
			oldZoomRate = layer.zoomRate;
			oldParallaxY = layer.parallaxY;
			oldAngle = layer.angle;
			layer.scale = this.runtime.running_layout.scale;
			layer.zoomRate = 1.0;
			layer.parallaxY = 1.0;
			layer.angle = this.runtime.running_layout.angle;
			ret.set_float(layer.canvasToLayer(this.mouseXcanvas, this.mouseYcanvas, false));
			layer.scale = oldScale;
			layer.zoomRate = oldZoomRate;
			layer.parallaxY = oldParallaxY;
			layer.angle = oldAngle;
		}
		else
		{
			if (cr.is_number(layerparam))
				layer = this.runtime.getLayerByNumber(layerparam);
			else
				layer = this.runtime.getLayerByName(layerparam);
			if (layer)
				ret.set_float(layer.canvasToLayer(this.mouseXcanvas, this.mouseYcanvas, false));
			else
				ret.set_float(0);
		}
	};
	Exps.prototype.AbsoluteX = function (ret)
	{
		ret.set_float(this.mouseXcanvas);
	};
	Exps.prototype.AbsoluteY = function (ret)
	{
		ret.set_float(this.mouseYcanvas);
	};
	pluginProto.exps = new Exps();
}());
;
;
cr.plugins_.Sprite = function(runtime)
{
	this.runtime = runtime;
};
(function ()
{
	var pluginProto = cr.plugins_.Sprite.prototype;
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};
	var typeProto = pluginProto.Type.prototype;
	function frame_getDataUri()
	{
		if (this.datauri.length === 0)
		{
			var tmpcanvas = document.createElement("canvas");
			tmpcanvas.width = this.width;
			tmpcanvas.height = this.height;
			var tmpctx = tmpcanvas.getContext("2d");
			if (this.spritesheeted)
			{
				tmpctx.drawImage(this.texture_img, this.offx, this.offy, this.width, this.height,
										 0, 0, this.width, this.height);
			}
			else
			{
				tmpctx.drawImage(this.texture_img, 0, 0, this.width, this.height);
			}
			this.datauri = tmpcanvas.toDataURL("image/png");
		}
		return this.datauri;
	};
	typeProto.onCreate = function()
	{
		if (this.is_family)
			return;
		var i, leni, j, lenj;
		var anim, frame, animobj, frameobj, wt, uv;
		this.all_frames = [];
		this.has_loaded_textures = false;
		for (i = 0, leni = this.animations.length; i < leni; i++)
		{
			anim = this.animations[i];
			animobj = {};
			animobj.name = anim[0];
			animobj.speed = anim[1];
			animobj.loop = anim[2];
			animobj.repeatcount = anim[3];
			animobj.repeatto = anim[4];
			animobj.pingpong = anim[5];
			animobj.sid = anim[6];
			animobj.frames = [];
			for (j = 0, lenj = anim[7].length; j < lenj; j++)
			{
				frame = anim[7][j];
				frameobj = {};
				frameobj.texture_file = frame[0];
				frameobj.texture_filesize = frame[1];
				frameobj.offx = frame[2];
				frameobj.offy = frame[3];
				frameobj.width = frame[4];
				frameobj.height = frame[5];
				frameobj.duration = frame[6];
				frameobj.hotspotX = frame[7];
				frameobj.hotspotY = frame[8];
				frameobj.image_points = frame[9];
				frameobj.poly_pts = frame[10];
				frameobj.pixelformat = frame[11];
				frameobj.spritesheeted = (frameobj.width !== 0);
				frameobj.datauri = "";		// generated on demand and cached
				frameobj.getDataUri = frame_getDataUri;
				uv = {};
				uv.left = 0;
				uv.top = 0;
				uv.right = 1;
				uv.bottom = 1;
				frameobj.sheetTex = uv;
				frameobj.webGL_texture = null;
				wt = this.runtime.findWaitingTexture(frame[0]);
				if (wt)
				{
					frameobj.texture_img = wt;
				}
				else
				{
					frameobj.texture_img = new Image();
					frameobj.texture_img["idtkLoadDisposed"] = true;
					frameobj.texture_img.src = frame[0];
					frameobj.texture_img.cr_src = frame[0];
					frameobj.texture_img.cr_filesize = frame[1];
					frameobj.texture_img.c2webGL_texture = null;
					this.runtime.waitForImageLoad(frameobj.texture_img);
				}
				cr.seal(frameobj);
				animobj.frames.push(frameobj);
				this.all_frames.push(frameobj);
			}
			cr.seal(animobj);
			this.animations[i] = animobj;		// swap array data for object
		}
	};
	typeProto.updateAllCurrentTexture = function ()
	{
		var i, len, inst;
		for (i = 0, len = this.instances.length; i < len; i++)
		{
			inst = this.instances[i];
			inst.curWebGLTexture = inst.curFrame.webGL_texture;
		}
	};
	typeProto.onLostWebGLContext = function ()
	{
		if (this.is_family)
			return;
		var i, len, frame;
		for (i = 0, len = this.all_frames.length; i < len; ++i)
		{
			frame = this.all_frames[i];
			frame.texture_img.c2webGL_texture = null;
			frame.webGL_texture = null;
		}
	};
	typeProto.onRestoreWebGLContext = function ()
	{
		if (this.is_family || !this.instances.length)
			return;
		var i, len, frame;
		for (i = 0, len = this.all_frames.length; i < len; ++i)
		{
			frame = this.all_frames[i];
			frame.webGL_texture = this.runtime.glwrap.loadTexture(frame.texture_img, false, this.runtime.linearSampling, frame.pixelformat);
		}
		this.updateAllCurrentTexture();
	};
	typeProto.loadTextures = function ()
	{
		if (this.is_family || this.has_loaded_textures || !this.runtime.glwrap)
			return;
		var i, len, frame;
		for (i = 0, len = this.all_frames.length; i < len; ++i)
		{
			frame = this.all_frames[i];
			frame.webGL_texture = this.runtime.glwrap.loadTexture(frame.texture_img, false, this.runtime.linearSampling, frame.pixelformat);
		}
		this.has_loaded_textures = true;
	};
	typeProto.unloadTextures = function ()
	{
		if (this.is_family || this.instances.length || !this.has_loaded_textures)
			return;
		var i, len, frame;
		for (i = 0, len = this.all_frames.length; i < len; ++i)
		{
			frame = this.all_frames[i];
			this.runtime.glwrap.deleteTexture(frame.webGL_texture);
		}
		this.has_loaded_textures = false;
	};
	var already_drawn_images = [];
	typeProto.preloadCanvas2D = function (ctx)
	{
		var i, len, frameimg;
		already_drawn_images.length = 0;
		for (i = 0, len = this.all_frames.length; i < len; ++i)
		{
			frameimg = this.all_frames[i].texture_img;
			if (already_drawn_images.indexOf(frameimg) !== -1)
					continue;
			ctx.drawImage(frameimg, 0, 0);
			already_drawn_images.push(frameimg);
		}
	};
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
		var poly_pts = this.type.animations[0].frames[0].poly_pts;
		if (this.recycled)
			this.collision_poly.set_pts(poly_pts);
		else
			this.collision_poly = new cr.CollisionPoly(poly_pts);
	};
	var instanceProto = pluginProto.Instance.prototype;
	instanceProto.onCreate = function()
	{
		this.visible = (this.properties[0] === 0);	// 0=visible, 1=invisible
		this.isTicking = false;
		this.inAnimTrigger = false;
		this.collisionsEnabled = (this.properties[3] !== 0);
		if (!(this.type.animations.length === 1 && this.type.animations[0].frames.length === 1) && this.type.animations[0].speed !== 0)
		{
			this.runtime.tickMe(this);
			this.isTicking = true;
		}
		this.cur_animation = this.getAnimationByName(this.properties[1]) || this.type.animations[0];
		this.cur_frame = this.properties[2];
		if (this.cur_frame < 0)
			this.cur_frame = 0;
		if (this.cur_frame >= this.cur_animation.frames.length)
			this.cur_frame = this.cur_animation.frames.length - 1;
		var curanimframe = this.cur_animation.frames[this.cur_frame];
		this.collision_poly.set_pts(curanimframe.poly_pts);
		this.hotspotX = curanimframe.hotspotX;
		this.hotspotY = curanimframe.hotspotY;
		this.cur_anim_speed = this.cur_animation.speed;
		if (this.recycled)
			this.animTimer.reset();
		else
			this.animTimer = new cr.KahanAdder();
		this.frameStart = this.getNowTime();
		this.animPlaying = true;
		this.animRepeats = 0;
		this.animForwards = true;
		this.animTriggerName = "";
		this.changeAnimName = "";
		this.changeAnimFrom = 0;
		this.changeAnimFrame = -1;
		this.type.loadTextures();
		var i, leni, j, lenj;
		var anim, frame, uv, maintex;
		for (i = 0, leni = this.type.animations.length; i < leni; i++)
		{
			anim = this.type.animations[i];
			for (j = 0, lenj = anim.frames.length; j < lenj; j++)
			{
				frame = anim.frames[j];
				if (frame.width === 0)
				{
					frame.width = frame.texture_img.width;
					frame.height = frame.texture_img.height;
				}
				if (frame.spritesheeted)
				{
					maintex = frame.texture_img;
					uv = frame.sheetTex;
					uv.left = frame.offx / maintex.width;
					uv.top = frame.offy / maintex.height;
					uv.right = (frame.offx + frame.width) / maintex.width;
					uv.bottom = (frame.offy + frame.height) / maintex.height;
					if (frame.offx === 0 && frame.offy === 0 && frame.width === maintex.width && frame.height === maintex.height)
					{
						frame.spritesheeted = false;
					}
				}
			}
		}
		this.curFrame = this.cur_animation.frames[this.cur_frame];
		this.curWebGLTexture = this.curFrame.webGL_texture;
	};
	instanceProto.saveToJSON = function ()
	{
		var o = {
			"a": this.cur_animation.sid,
			"f": this.cur_frame,
			"cas": this.cur_anim_speed,
			"fs": this.frameStart,
			"ar": this.animRepeats,
			"at": this.animTimer.sum
		};
		if (!this.animPlaying)
			o["ap"] = this.animPlaying;
		if (!this.animForwards)
			o["af"] = this.animForwards;
		return o;
	};
	instanceProto.loadFromJSON = function (o)
	{
		var anim = this.getAnimationBySid(o["a"]);
		if (anim)
			this.cur_animation = anim;
		this.cur_frame = o["f"];
		if (this.cur_frame < 0)
			this.cur_frame = 0;
		if (this.cur_frame >= this.cur_animation.frames.length)
			this.cur_frame = this.cur_animation.frames.length - 1;
		this.cur_anim_speed = o["cas"];
		this.frameStart = o["fs"];
		this.animRepeats = o["ar"];
		this.animTimer.reset();
		this.animTimer.sum = o["at"];
		this.animPlaying = o.hasOwnProperty("ap") ? o["ap"] : true;
		this.animForwards = o.hasOwnProperty("af") ? o["af"] : true;
		this.curFrame = this.cur_animation.frames[this.cur_frame];
		this.curWebGLTexture = this.curFrame.webGL_texture;
		this.collision_poly.set_pts(this.curFrame.poly_pts);
		this.hotspotX = this.curFrame.hotspotX;
		this.hotspotY = this.curFrame.hotspotY;
	};
	instanceProto.animationFinish = function (reverse)
	{
		this.cur_frame = reverse ? 0 : this.cur_animation.frames.length - 1;
		this.animPlaying = false;
		this.animTriggerName = this.cur_animation.name;
		this.inAnimTrigger = true;
		this.runtime.trigger(cr.plugins_.Sprite.prototype.cnds.OnAnyAnimFinished, this);
		this.runtime.trigger(cr.plugins_.Sprite.prototype.cnds.OnAnimFinished, this);
		this.inAnimTrigger = false;
		this.animRepeats = 0;
	};
	instanceProto.getNowTime = function()
	{
		return this.animTimer.sum;
	};
	instanceProto.tick = function()
	{
		this.animTimer.add(this.runtime.getDt(this));
		if (this.changeAnimName.length)
			this.doChangeAnim();
		if (this.changeAnimFrame >= 0)
			this.doChangeAnimFrame();
		var now = this.getNowTime();
		var cur_animation = this.cur_animation;
		var prev_frame = cur_animation.frames[this.cur_frame];
		var next_frame;
		var cur_frame_time = prev_frame.duration / this.cur_anim_speed;
		if (this.animPlaying && now >= this.frameStart + cur_frame_time)
		{
			if (this.animForwards)
			{
				this.cur_frame++;
			}
			else
			{
				this.cur_frame--;
			}
			this.frameStart += cur_frame_time;
			if (this.cur_frame >= cur_animation.frames.length)
			{
				if (cur_animation.pingpong)
				{
					this.animForwards = false;
					this.cur_frame = cur_animation.frames.length - 2;
				}
				else if (cur_animation.loop)
				{
					this.cur_frame = cur_animation.repeatto;
				}
				else
				{
					this.animRepeats++;
					if (this.animRepeats >= cur_animation.repeatcount)
					{
						this.animationFinish(false);
					}
					else
					{
						this.cur_frame = cur_animation.repeatto;
					}
				}
			}
			if (this.cur_frame < 0)
			{
				if (cur_animation.pingpong)
				{
					this.cur_frame = 1;
					this.animForwards = true;
					if (!cur_animation.loop)
					{
						this.animRepeats++;
						if (this.animRepeats >= cur_animation.repeatcount)
						{
							this.animationFinish(true);
						}
					}
				}
				else
				{
					if (cur_animation.loop)
					{
						this.cur_frame = cur_animation.repeatto;
					}
					else
					{
						this.animRepeats++;
						if (this.animRepeats >= cur_animation.repeatcount)
						{
							this.animationFinish(true);
						}
						else
						{
							this.cur_frame = cur_animation.repeatto;
						}
					}
				}
			}
			if (this.cur_frame < 0)
				this.cur_frame = 0;
			else if (this.cur_frame >= cur_animation.frames.length)
				this.cur_frame = cur_animation.frames.length - 1;
			if (now > this.frameStart + (cur_animation.frames[this.cur_frame].duration / this.cur_anim_speed))
			{
				this.frameStart = now;
			}
			next_frame = cur_animation.frames[this.cur_frame];
			this.OnFrameChanged(prev_frame, next_frame);
			this.runtime.redraw = true;
		}
	};
	instanceProto.getAnimationByName = function (name_)
	{
		var i, len, a;
		for (i = 0, len = this.type.animations.length; i < len; i++)
		{
			a = this.type.animations[i];
			if (cr.equals_nocase(a.name, name_))
				return a;
		}
		return null;
	};
	instanceProto.getAnimationBySid = function (sid_)
	{
		var i, len, a;
		for (i = 0, len = this.type.animations.length; i < len; i++)
		{
			a = this.type.animations[i];
			if (a.sid === sid_)
				return a;
		}
		return null;
	};
	instanceProto.doChangeAnim = function ()
	{
		var prev_frame = this.cur_animation.frames[this.cur_frame];
		var anim = this.getAnimationByName(this.changeAnimName);
		this.changeAnimName = "";
		if (!anim)
			return;
		if (cr.equals_nocase(anim.name, this.cur_animation.name) && this.animPlaying)
			return;
		this.cur_animation = anim;
		this.cur_anim_speed = anim.speed;
		if (this.cur_frame < 0)
			this.cur_frame = 0;
		if (this.cur_frame >= this.cur_animation.frames.length)
			this.cur_frame = this.cur_animation.frames.length - 1;
		if (this.changeAnimFrom === 1)
			this.cur_frame = 0;
		this.animPlaying = true;
		this.frameStart = this.getNowTime();
		this.animForwards = true;
		this.OnFrameChanged(prev_frame, this.cur_animation.frames[this.cur_frame]);
		this.runtime.redraw = true;
	};
	instanceProto.doChangeAnimFrame = function ()
	{
		var prev_frame = this.cur_animation.frames[this.cur_frame];
		var prev_frame_number = this.cur_frame;
		this.cur_frame = cr.floor(this.changeAnimFrame);
		if (this.cur_frame < 0)
			this.cur_frame = 0;
		if (this.cur_frame >= this.cur_animation.frames.length)
			this.cur_frame = this.cur_animation.frames.length - 1;
		if (prev_frame_number !== this.cur_frame)
		{
			this.OnFrameChanged(prev_frame, this.cur_animation.frames[this.cur_frame]);
			this.frameStart = this.getNowTime();
			this.runtime.redraw = true;
		}
		this.changeAnimFrame = -1;
	};
	instanceProto.OnFrameChanged = function (prev_frame, next_frame)
	{
		var oldw = prev_frame.width;
		var oldh = prev_frame.height;
		var neww = next_frame.width;
		var newh = next_frame.height;
		if (oldw != neww)
			this.width *= (neww / oldw);
		if (oldh != newh)
			this.height *= (newh / oldh);
		this.hotspotX = next_frame.hotspotX;
		this.hotspotY = next_frame.hotspotY;
		this.collision_poly.set_pts(next_frame.poly_pts);
		this.set_bbox_changed();
		this.curFrame = next_frame;
		this.curWebGLTexture = next_frame.webGL_texture;
		var i, len, b;
		for (i = 0, len = this.behavior_insts.length; i < len; i++)
		{
			b = this.behavior_insts[i];
			if (b.onSpriteFrameChanged)
				b.onSpriteFrameChanged(prev_frame, next_frame);
		}
		this.runtime.trigger(cr.plugins_.Sprite.prototype.cnds.OnFrameChanged, this);
	};
	instanceProto.draw = function(ctx)
	{
		ctx.globalAlpha = this.opacity;
		var cur_frame = this.curFrame;
		var spritesheeted = cur_frame.spritesheeted;
		var cur_image = cur_frame.texture_img;
		var myx = this.x;
		var myy = this.y;
		var w = this.width;
		var h = this.height;
		if (this.angle === 0 && w >= 0 && h >= 0)
		{
			myx -= this.hotspotX * w;
			myy -= this.hotspotY * h;
			if (this.runtime.pixel_rounding)
			{
				myx = (myx + 0.5) | 0;
				myy = (myy + 0.5) | 0;
			}
			if (spritesheeted)
			{
				ctx.drawImage(cur_image, cur_frame.offx, cur_frame.offy, cur_frame.width, cur_frame.height,
										 myx, myy, w, h);
			}
			else
			{
				ctx.drawImage(cur_image, myx, myy, w, h);
			}
		}
		else
		{
			if (this.runtime.pixel_rounding)
			{
				myx = (myx + 0.5) | 0;
				myy = (myy + 0.5) | 0;
			}
			ctx.save();
			var widthfactor = w > 0 ? 1 : -1;
			var heightfactor = h > 0 ? 1 : -1;
			ctx.translate(myx, myy);
			if (widthfactor !== 1 || heightfactor !== 1)
				ctx.scale(widthfactor, heightfactor);
			ctx.rotate(this.angle * widthfactor * heightfactor);
			var drawx = 0 - (this.hotspotX * cr.abs(w))
			var drawy = 0 - (this.hotspotY * cr.abs(h));
			if (spritesheeted)
			{
				ctx.drawImage(cur_image, cur_frame.offx, cur_frame.offy, cur_frame.width, cur_frame.height,
										 drawx, drawy, cr.abs(w), cr.abs(h));
			}
			else
			{
				ctx.drawImage(cur_image, drawx, drawy, cr.abs(w), cr.abs(h));
			}
			ctx.restore();
		}
		/*
		ctx.strokeStyle = "#f00";
		ctx.lineWidth = 3;
		ctx.beginPath();
		this.collision_poly.cache_poly(this.width, this.height, this.angle);
		var i, len, ax, ay, bx, by;
		for (i = 0, len = this.collision_poly.pts_count; i < len; i++)
		{
			ax = this.collision_poly.pts_cache[i*2] + this.x;
			ay = this.collision_poly.pts_cache[i*2+1] + this.y;
			bx = this.collision_poly.pts_cache[((i+1)%len)*2] + this.x;
			by = this.collision_poly.pts_cache[((i+1)%len)*2+1] + this.y;
			ctx.moveTo(ax, ay);
			ctx.lineTo(bx, by);
		}
		ctx.stroke();
		ctx.closePath();
		*/
		/*
		if (this.behavior_insts.length >= 1 && this.behavior_insts[0].draw)
		{
			this.behavior_insts[0].draw(ctx);
		}
		*/
	};
	instanceProto.drawGL = function(glw)
	{
		glw.setTexture(this.curWebGLTexture);
		glw.setOpacity(this.opacity);
		var cur_frame = this.curFrame;
		var q = this.bquad;
		if (this.runtime.pixel_rounding)
		{
			var ox = ((this.x + 0.5) | 0) - this.x;
			var oy = ((this.y + 0.5) | 0) - this.y;
			if (cur_frame.spritesheeted)
				glw.quadTex(q.tlx + ox, q.tly + oy, q.trx + ox, q.try_ + oy, q.brx + ox, q.bry + oy, q.blx + ox, q.bly + oy, cur_frame.sheetTex);
			else
				glw.quad(q.tlx + ox, q.tly + oy, q.trx + ox, q.try_ + oy, q.brx + ox, q.bry + oy, q.blx + ox, q.bly + oy);
		}
		else
		{
			if (cur_frame.spritesheeted)
				glw.quadTex(q.tlx, q.tly, q.trx, q.try_, q.brx, q.bry, q.blx, q.bly, cur_frame.sheetTex);
			else
				glw.quad(q.tlx, q.tly, q.trx, q.try_, q.brx, q.bry, q.blx, q.bly);
		}
	};
	instanceProto.getImagePointIndexByName = function(name_)
	{
		var cur_frame = this.curFrame;
		var i, len;
		for (i = 0, len = cur_frame.image_points.length; i < len; i++)
		{
			if (cr.equals_nocase(name_, cur_frame.image_points[i][0]))
				return i;
		}
		return -1;
	};
	instanceProto.getImagePoint = function(imgpt, getX)
	{
		var cur_frame = this.curFrame;
		var image_points = cur_frame.image_points;
		var index;
		if (cr.is_string(imgpt))
			index = this.getImagePointIndexByName(imgpt);
		else
			index = imgpt - 1;	// 0 is origin
		index = cr.floor(index);
		if (index < 0 || index >= image_points.length)
			return getX ? this.x : this.y;	// return origin
		var x = (image_points[index][1] - cur_frame.hotspotX) * this.width;
		var y = image_points[index][2];
		y = (y - cur_frame.hotspotY) * this.height;
		var cosa = Math.cos(this.angle);
		var sina = Math.sin(this.angle);
		var x_temp = (x * cosa) - (y * sina);
		y = (y * cosa) + (x * sina);
		x = x_temp;
		x += this.x;
		y += this.y;
		return getX ? x : y;
	};
	function Cnds() {};
	var arrCache = [];
	function allocArr()
	{
		if (arrCache.length)
			return arrCache.pop();
		else
			return [0, 0, 0];
	};
	function freeArr(a)
	{
		a[0] = 0;
		a[1] = 0;
		a[2] = 0;
		arrCache.push(a);
	};
	function makeCollKey(a, b)
	{
		if (a < b)
			return "" + a + "," + b;
		else
			return "" + b + "," + a;
	};
	function collmemory_add(collmemory, a, b, tickcount)
	{
		var a_uid = a.uid;
		var b_uid = b.uid;
		var key = makeCollKey(a_uid, b_uid);
		if (collmemory.hasOwnProperty(key))
		{
			collmemory[key][2] = tickcount;
			return;
		}
		var arr = allocArr();
		arr[0] = a_uid;
		arr[1] = b_uid;
		arr[2] = tickcount;
		collmemory[key] = arr;
	};
	function collmemory_remove(collmemory, a, b)
	{
		var key = makeCollKey(a.uid, b.uid);
		if (collmemory.hasOwnProperty(key))
		{
			freeArr(collmemory[key]);
			delete collmemory[key];
		}
	};
	function collmemory_removeInstance(collmemory, inst)
	{
		var uid = inst.uid;
		var p, entry;
		for (p in collmemory)
		{
			if (collmemory.hasOwnProperty(p))
			{
				entry = collmemory[p];
				if (entry[0] === uid || entry[1] === uid)
				{
					freeArr(collmemory[p]);
					delete collmemory[p];
				}
			}
		}
	};
	var last_coll_tickcount = -2;
	function collmemory_has(collmemory, a, b)
	{
		var key = makeCollKey(a.uid, b.uid);
		if (collmemory.hasOwnProperty(key))
		{
			last_coll_tickcount = collmemory[key][2];
			return true;
		}
		else
		{
			last_coll_tickcount = -2;
			return false;
		}
	};
	var candidates = [];
	Cnds.prototype.OnCollision = function (rtype)
	{
		if (!rtype)
			return false;
		var runtime = this.runtime;
		var cnd = runtime.getCurrentCondition();
		var ltype = cnd.type;
		if (!cnd.extra.collmemory)
		{
			cnd.extra.collmemory = {};
			runtime.addDestroyCallback((function (collmemory) {
				return function(inst) {
					collmemory_removeInstance(collmemory, inst);
				};
			})(cnd.extra.collmemory));
		}
		var collmemory = cnd.extra.collmemory;
		var lsol = ltype.getCurrentSol();
		var rsol = rtype.getCurrentSol();
		var linstances = lsol.getObjects();
		var rinstances;
		var l, linst, r, rinst;
		var curlsol, currsol;
		var tickcount = this.runtime.tickcount;
		var lasttickcount = tickcount - 1;
		var exists, run;
		var current_event = runtime.getCurrentEventStack().current_event;
		var orblock = current_event.orblock;
		for (l = 0; l < linstances.length; l++)
		{
			linst = linstances[l];
			if (rsol.select_all)
			{
				linst.update_bbox();
				this.runtime.getCollisionCandidates(linst.layer, rtype, linst.bbox, candidates);
				rinstances = candidates;
			}
			else
				rinstances = rsol.getObjects();
			for (r = 0; r < rinstances.length; r++)
			{
				rinst = rinstances[r];
				if (runtime.testOverlap(linst, rinst) || runtime.checkRegisteredCollision(linst, rinst))
				{
					exists = collmemory_has(collmemory, linst, rinst);
					run = (!exists || (last_coll_tickcount < lasttickcount));
					collmemory_add(collmemory, linst, rinst, tickcount);
					if (run)
					{
						runtime.pushCopySol(current_event.solModifiers);
						curlsol = ltype.getCurrentSol();
						currsol = rtype.getCurrentSol();
						curlsol.select_all = false;
						currsol.select_all = false;
						if (ltype === rtype)
						{
							curlsol.instances.length = 2;	// just use lsol, is same reference as rsol
							curlsol.instances[0] = linst;
							curlsol.instances[1] = rinst;
							ltype.applySolToContainer();
						}
						else
						{
							curlsol.instances.length = 1;
							currsol.instances.length = 1;
							curlsol.instances[0] = linst;
							currsol.instances[0] = rinst;
							ltype.applySolToContainer();
							rtype.applySolToContainer();
						}
						current_event.retrigger();
						runtime.popSol(current_event.solModifiers);
					}
				}
				else
				{
					collmemory_remove(collmemory, linst, rinst);
				}
			}
			candidates.length = 0;
		}
		return false;
	};
	var rpicktype = null;
	var rtopick = new cr.ObjectSet();
	var needscollisionfinish = false;
	function DoOverlapCondition(rtype, offx, offy)
	{
		if (!rtype)
			return false;
		var do_offset = (offx !== 0 || offy !== 0);
		var oldx, oldy, ret = false, r, lenr, rinst;
		var cnd = this.runtime.getCurrentCondition();
		var ltype = cnd.type;
		var inverted = cnd.inverted;
		var rsol = rtype.getCurrentSol();
		var orblock = this.runtime.getCurrentEventStack().current_event.orblock;
		var rinstances;
		if (rsol.select_all)
		{
			this.update_bbox();
			this.runtime.getCollisionCandidates(this.layer, rtype, this.bbox, candidates);
			rinstances = candidates;
		}
		else if (orblock)
			rinstances = rsol.else_instances;
		else
			rinstances = rsol.instances;
		rpicktype = rtype;
		needscollisionfinish = (ltype !== rtype && !inverted);
		if (do_offset)
		{
			oldx = this.x;
			oldy = this.y;
			this.x += offx;
			this.y += offy;
			this.set_bbox_changed();
		}
		for (r = 0, lenr = rinstances.length; r < lenr; r++)
		{
			rinst = rinstances[r];
			if (this.runtime.testOverlap(this, rinst))
			{
				ret = true;
				if (inverted)
					break;
				if (ltype !== rtype)
					rtopick.add(rinst);
			}
		}
		if (do_offset)
		{
			this.x = oldx;
			this.y = oldy;
			this.set_bbox_changed();
		}
		candidates.length = 0;
		return ret;
	};
	typeProto.finish = function (do_pick)
	{
		if (!needscollisionfinish)
			return;
		if (do_pick)
		{
			var orblock = this.runtime.getCurrentEventStack().current_event.orblock;
			var sol = rpicktype.getCurrentSol();
			var topick = rtopick.valuesRef();
			var i, len, inst;
			if (sol.select_all)
			{
				sol.select_all = false;
				sol.instances.length = topick.length;
				for (i = 0, len = topick.length; i < len; i++)
				{
					sol.instances[i] = topick[i];
				}
				if (orblock)
				{
					sol.else_instances.length = 0;
					for (i = 0, len = rpicktype.instances.length; i < len; i++)
					{
						inst = rpicktype.instances[i];
						if (!rtopick.contains(inst))
							sol.else_instances.push(inst);
					}
				}
			}
			else
			{
				if (orblock)
				{
					var initsize = sol.instances.length;
					sol.instances.length = initsize + topick.length;
					for (i = 0, len = topick.length; i < len; i++)
					{
						sol.instances[initsize + i] = topick[i];
						cr.arrayFindRemove(sol.else_instances, topick[i]);
					}
				}
				else
				{
					cr.shallowAssignArray(sol.instances, topick);
				}
			}
			rpicktype.applySolToContainer();
		}
		rtopick.clear();
		needscollisionfinish = false;
	};
	Cnds.prototype.IsOverlapping = function (rtype)
	{
		return DoOverlapCondition.call(this, rtype, 0, 0);
	};
	Cnds.prototype.IsOverlappingOffset = function (rtype, offx, offy)
	{
		return DoOverlapCondition.call(this, rtype, offx, offy);
	};
	Cnds.prototype.IsAnimPlaying = function (animname)
	{
		if (this.changeAnimName.length)
			return cr.equals_nocase(this.changeAnimName, animname);
		else
			return cr.equals_nocase(this.cur_animation.name, animname);
	};
	Cnds.prototype.CompareFrame = function (cmp, framenum)
	{
		return cr.do_cmp(this.cur_frame, cmp, framenum);
	};
	Cnds.prototype.CompareAnimSpeed = function (cmp, x)
	{
		var s = (this.animForwards ? this.cur_anim_speed : -this.cur_anim_speed);
		return cr.do_cmp(s, cmp, x);
	};
	Cnds.prototype.OnAnimFinished = function (animname)
	{
		return cr.equals_nocase(this.animTriggerName, animname);
	};
	Cnds.prototype.OnAnyAnimFinished = function ()
	{
		return true;
	};
	Cnds.prototype.OnFrameChanged = function ()
	{
		return true;
	};
	Cnds.prototype.IsMirrored = function ()
	{
		return this.width < 0;
	};
	Cnds.prototype.IsFlipped = function ()
	{
		return this.height < 0;
	};
	Cnds.prototype.OnURLLoaded = function ()
	{
		return true;
	};
	Cnds.prototype.IsCollisionEnabled = function ()
	{
		return this.collisionsEnabled;
	};
	pluginProto.cnds = new Cnds();
	function Acts() {};
	Acts.prototype.Spawn = function (obj, layer, imgpt)
	{
		if (!obj || !layer)
			return;
		var inst = this.runtime.createInstance(obj, layer, this.getImagePoint(imgpt, true), this.getImagePoint(imgpt, false));
		if (!inst)
			return;
		if (typeof inst.angle !== "undefined")
		{
			inst.angle = this.angle;
			inst.set_bbox_changed();
		}
		this.runtime.isInOnDestroy++;
		var i, len, s;
		this.runtime.trigger(Object.getPrototypeOf(obj.plugin).cnds.OnCreated, inst);
		if (inst.is_contained)
		{
			for (i = 0, len = inst.siblings.length; i < len; i++)
			{
				s = inst.siblings[i];
				this.runtime.trigger(Object.getPrototypeOf(s.type.plugin).cnds.OnCreated, s);
			}
		}
		this.runtime.isInOnDestroy--;
		var cur_act = this.runtime.getCurrentAction();
		var reset_sol = false;
		if (cr.is_undefined(cur_act.extra.Spawn_LastExec) || cur_act.extra.Spawn_LastExec < this.runtime.execcount)
		{
			reset_sol = true;
			cur_act.extra.Spawn_LastExec = this.runtime.execcount;
		}
		var sol;
		if (obj != this.type)
		{
			sol = obj.getCurrentSol();
			sol.select_all = false;
			if (reset_sol)
			{
				sol.instances.length = 1;
				sol.instances[0] = inst;
			}
			else
				sol.instances.push(inst);
			if (inst.is_contained)
			{
				for (i = 0, len = inst.siblings.length; i < len; i++)
				{
					s = inst.siblings[i];
					sol = s.type.getCurrentSol();
					sol.select_all = false;
					if (reset_sol)
					{
						sol.instances.length = 1;
						sol.instances[0] = s;
					}
					else
						sol.instances.push(s);
				}
			}
		}
	};
	Acts.prototype.SetEffect = function (effect)
	{
		this.compositeOp = cr.effectToCompositeOp(effect);
		cr.setGLBlend(this, effect, this.runtime.gl);
		this.runtime.redraw = true;
	};
	Acts.prototype.StopAnim = function ()
	{
		this.animPlaying = false;
	};
	Acts.prototype.StartAnim = function (from)
	{
		this.animPlaying = true;
		this.frameStart = this.getNowTime();
		if (from === 1 && this.cur_frame !== 0)
		{
			this.changeAnimFrame = 0;
			if (!this.inAnimTrigger)
				this.doChangeAnimFrame();
		}
		if (!this.isTicking)
		{
			this.runtime.tickMe(this);
			this.isTicking = true;
		}
	};
	Acts.prototype.SetAnim = function (animname, from)
	{
		this.changeAnimName = animname;
		this.changeAnimFrom = from;
		if (!this.isTicking)
		{
			this.runtime.tickMe(this);
			this.isTicking = true;
		}
		if (!this.inAnimTrigger)
			this.doChangeAnim();
	};
	Acts.prototype.SetAnimFrame = function (framenumber)
	{
		this.changeAnimFrame = framenumber;
		if (!this.isTicking)
		{
			this.runtime.tickMe(this);
			this.isTicking = true;
		}
		if (!this.inAnimTrigger)
			this.doChangeAnimFrame();
	};
	Acts.prototype.SetAnimSpeed = function (s)
	{
		this.cur_anim_speed = cr.abs(s);
		this.animForwards = (s >= 0);
		if (!this.isTicking)
		{
			this.runtime.tickMe(this);
			this.isTicking = true;
		}
	};
	Acts.prototype.SetMirrored = function (m)
	{
		var neww = cr.abs(this.width) * (m === 0 ? -1 : 1);
		if (this.width === neww)
			return;
		this.width = neww;
		this.set_bbox_changed();
	};
	Acts.prototype.SetFlipped = function (f)
	{
		var newh = cr.abs(this.height) * (f === 0 ? -1 : 1);
		if (this.height === newh)
			return;
		this.height = newh;
		this.set_bbox_changed();
	};
	Acts.prototype.SetScale = function (s)
	{
		var cur_frame = this.curFrame;
		var mirror_factor = (this.width < 0 ? -1 : 1);
		var flip_factor = (this.height < 0 ? -1 : 1);
		var new_width = cur_frame.width * s * mirror_factor;
		var new_height = cur_frame.height * s * flip_factor;
		if (this.width !== new_width || this.height !== new_height)
		{
			this.width = new_width;
			this.height = new_height;
			this.set_bbox_changed();
		}
	};
	Acts.prototype.LoadURL = function (url_, resize_)
	{
		var img = new Image();
		var self = this;
		var curFrame_ = this.curFrame;
		img.onload = function ()
		{
			if (curFrame_.texture_img.src === img.src)
			{
				if (self.runtime.glwrap && self.curFrame === curFrame_)
					self.curWebGLTexture = curFrame_.webGL_texture;
				self.runtime.redraw = true;
				self.runtime.trigger(cr.plugins_.Sprite.prototype.cnds.OnURLLoaded, self);
				return;
			}
			curFrame_.texture_img = img;
			curFrame_.offx = 0;
			curFrame_.offy = 0;
			curFrame_.width = img.width;
			curFrame_.height = img.height;
			curFrame_.spritesheeted = false;
			curFrame_.datauri = "";
			if (self.runtime.glwrap)
			{
				if (curFrame_.webGL_texture)
					self.runtime.glwrap.deleteTexture(curFrame_.webGL_texture);
				curFrame_.webGL_texture = self.runtime.glwrap.loadTexture(img, false, self.runtime.linearSampling);
				if (self.curFrame === curFrame_)
					self.curWebGLTexture = curFrame_.webGL_texture;
				self.type.updateAllCurrentTexture();
			}
			if (resize_ === 0)		// resize to image size
			{
				self.width = img.width;
				self.height = img.height;
				self.set_bbox_changed();
			}
			self.runtime.redraw = true;
			self.runtime.trigger(cr.plugins_.Sprite.prototype.cnds.OnURLLoaded, self);
		};
		if (url_.substr(0, 5) !== "data:")
			img.crossOrigin = 'anonymous';
		img.src = url_;
	};
	Acts.prototype.SetCollisions = function (set_)
	{
		if (this.collisionsEnabled === (set_ !== 0))
			return;		// no change
		this.collisionsEnabled = (set_ !== 0);
		if (this.collisionsEnabled)
			this.set_bbox_changed();		// needs to be added back to cells
		else
		{
			if (this.collcells.right >= this.collcells.left)
				this.type.collision_grid.update(this, this.collcells, null);
			this.collcells.set(0, 0, -1, -1);
		}
	};
	pluginProto.acts = new Acts();
	function Exps() {};
	Exps.prototype.AnimationFrame = function (ret)
	{
		ret.set_int(this.cur_frame);
	};
	Exps.prototype.AnimationFrameCount = function (ret)
	{
		ret.set_int(this.cur_animation.frames.length);
	};
	Exps.prototype.AnimationName = function (ret)
	{
		ret.set_string(this.cur_animation.name);
	};
	Exps.prototype.AnimationSpeed = function (ret)
	{
		ret.set_float(this.animForwards ? this.cur_anim_speed : -this.cur_anim_speed);
	};
	Exps.prototype.ImagePointX = function (ret, imgpt)
	{
		ret.set_float(this.getImagePoint(imgpt, true));
	};
	Exps.prototype.ImagePointY = function (ret, imgpt)
	{
		ret.set_float(this.getImagePoint(imgpt, false));
	};
	Exps.prototype.ImagePointCount = function (ret)
	{
		ret.set_int(this.curFrame.image_points.length);
	};
	Exps.prototype.ImageWidth = function (ret)
	{
		ret.set_float(this.curFrame.width);
	};
	Exps.prototype.ImageHeight = function (ret)
	{
		ret.set_float(this.curFrame.height);
	};
	pluginProto.exps = new Exps();
}());
;
;
cr.plugins_.Text = function(runtime)
{
	this.runtime = runtime;
};
(function ()
{
	var pluginProto = cr.plugins_.Text.prototype;
	pluginProto.onCreate = function ()
	{
		pluginProto.acts.SetWidth = function (w)
		{
			if (this.width !== w)
			{
				this.width = w;
				this.text_changed = true;	// also recalculate text wrapping
				this.set_bbox_changed();
			}
		};
	};
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};
	var typeProto = pluginProto.Type.prototype;
	typeProto.onCreate = function()
	{
	};
	typeProto.onLostWebGLContext = function ()
	{
		if (this.is_family)
			return;
		var i, len, inst;
		for (i = 0, len = this.instances.length; i < len; i++)
		{
			inst = this.instances[i];
			inst.mycanvas = null;
			inst.myctx = null;
			inst.mytex = null;
		}
	};
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
		if (this.recycled)
			this.lines.length = 0;
		else
			this.lines = [];		// for word wrapping
		this.text_changed = true;
	};
	var instanceProto = pluginProto.Instance.prototype;
	var requestedWebFonts = {};		// already requested web fonts have an entry here
	instanceProto.onCreate = function()
	{
		this.text = this.properties[0];
		this.visible = (this.properties[1] === 0);		// 0=visible, 1=invisible
		this.font = this.properties[2];
		this.color = this.properties[3];
		this.halign = this.properties[4];				// 0=left, 1=center, 2=right
		this.valign = this.properties[5];				// 0=top, 1=center, 2=bottom
		this.wrapbyword = (this.properties[7] === 0);	// 0=word, 1=character
		this.lastwidth = this.width;
		this.lastwrapwidth = this.width;
		this.lastheight = this.height;
		this.line_height_offset = this.properties[8];
		this.facename = "";
		this.fontstyle = "";
		this.ptSize = 0;
		this.textWidth = 0;
		this.textHeight = 0;
		this.parseFont();
		this.mycanvas = null;
		this.myctx = null;
		this.mytex = null;
		this.need_text_redraw = false;
		this.last_render_tick = this.runtime.tickcount;
		if (this.recycled)
			this.rcTex.set(0, 0, 1, 1);
		else
			this.rcTex = new cr.rect(0, 0, 1, 1);
		if (this.runtime.glwrap)
			this.runtime.tickMe(this);
;
	};
	instanceProto.parseFont = function ()
	{
		var arr = this.font.split(" ");
		var i;
		for (i = 0; i < arr.length; i++)
		{
			if (arr[i].substr(arr[i].length - 2, 2) === "pt")
			{
				this.ptSize = parseInt(arr[i].substr(0, arr[i].length - 2));
				this.pxHeight = Math.ceil((this.ptSize / 72.0) * 96.0) + 4;	// assume 96dpi...
				if (i > 0)
					this.fontstyle = arr[i - 1];
				this.facename = arr[i + 1];
				for (i = i + 2; i < arr.length; i++)
					this.facename += " " + arr[i];
				break;
			}
		}
	};
	instanceProto.saveToJSON = function ()
	{
		return {
			"t": this.text,
			"f": this.font,
			"c": this.color,
			"ha": this.halign,
			"va": this.valign,
			"wr": this.wrapbyword,
			"lho": this.line_height_offset,
			"fn": this.facename,
			"fs": this.fontstyle,
			"ps": this.ptSize,
			"pxh": this.pxHeight,
			"tw": this.textWidth,
			"th": this.textHeight,
			"lrt": this.last_render_tick
		};
	};
	instanceProto.loadFromJSON = function (o)
	{
		this.text = o["t"];
		this.font = o["f"];
		this.color = o["c"];
		this.halign = o["ha"];
		this.valign = o["va"];
		this.wrapbyword = o["wr"];
		this.line_height_offset = o["lho"];
		this.facename = o["fn"];
		this.fontstyle = o["fs"];
		this.ptSize = o["ps"];
		this.pxHeight = o["pxh"];
		this.textWidth = o["tw"];
		this.textHeight = o["th"];
		this.last_render_tick = o["lrt"];
		this.text_changed = true;
		this.lastwidth = this.width;
		this.lastwrapwidth = this.width;
		this.lastheight = this.height;
	};
	instanceProto.tick = function ()
	{
		if (this.runtime.glwrap && this.mytex && (this.runtime.tickcount - this.last_render_tick >= 300))
		{
			var layer = this.layer;
            this.update_bbox();
            var bbox = this.bbox;
            if (bbox.right < layer.viewLeft || bbox.bottom < layer.viewTop || bbox.left > layer.viewRight || bbox.top > layer.viewBottom)
			{
				this.runtime.glwrap.deleteTexture(this.mytex);
				this.mytex = null;
				this.myctx = null;
				this.mycanvas = null;
			}
		}
	};
	instanceProto.onDestroy = function ()
	{
		this.myctx = null;
		this.mycanvas = null;
		if (this.runtime.glwrap && this.mytex)
			this.runtime.glwrap.deleteTexture(this.mytex);
		this.mytex = null;
	};
	instanceProto.updateFont = function ()
	{
		this.font = this.fontstyle + " " + this.ptSize.toString() + "pt " + this.facename;
		this.text_changed = true;
		this.runtime.redraw = true;
	};
	instanceProto.draw = function(ctx, glmode)
	{
		ctx.font = this.font;
		ctx.textBaseline = "top";
		ctx.fillStyle = this.color;
		ctx.globalAlpha = glmode ? 1 : this.opacity;
		var myscale = 1;
		if (glmode)
		{
			myscale = this.layer.getScale();
			ctx.save();
			ctx.scale(myscale, myscale);
		}
		if (this.text_changed || this.width !== this.lastwrapwidth)
		{
			this.type.plugin.WordWrap(this.text, this.lines, ctx, this.width, this.wrapbyword);
			this.text_changed = false;
			this.lastwrapwidth = this.width;
		}
		this.update_bbox();
		var penX = glmode ? 0 : this.bquad.tlx;
		var penY = glmode ? 0 : this.bquad.tly;
		if (this.runtime.pixel_rounding)
		{
			penX = (penX + 0.5) | 0;
			penY = (penY + 0.5) | 0;
		}
		if (this.angle !== 0 && !glmode)
		{
			ctx.save();
			ctx.translate(penX, penY);
			ctx.rotate(this.angle);
			penX = 0;
			penY = 0;
		}
		var endY = penY + this.height;
		var line_height = this.pxHeight;
		line_height += this.line_height_offset;
		var drawX;
		var i;
		if (this.valign === 1)		// center
			penY += Math.max(this.height / 2 - (this.lines.length * line_height) / 2, 0);
		else if (this.valign === 2)	// bottom
			penY += Math.max(this.height - (this.lines.length * line_height) - 2, 0);
		for (i = 0; i < this.lines.length; i++)
		{
			drawX = penX;
			if (this.halign === 1)		// center
				drawX = penX + (this.width - this.lines[i].width) / 2;
			else if (this.halign === 2)	// right
				drawX = penX + (this.width - this.lines[i].width);
			ctx.fillText(this.lines[i].text, drawX, penY);
			penY += line_height;
			if (penY >= endY - line_height)
				break;
		}
		if (this.angle !== 0 || glmode)
			ctx.restore();
		this.last_render_tick = this.runtime.tickcount;
	};
	instanceProto.drawGL = function(glw)
	{
		if (this.width < 1 || this.height < 1)
			return;
		var need_redraw = this.text_changed || this.need_text_redraw;
		this.need_text_redraw = false;
		var layer_scale = this.layer.getScale();
		var layer_angle = this.layer.getAngle();
		var rcTex = this.rcTex;
		var floatscaledwidth = layer_scale * this.width;
		var floatscaledheight = layer_scale * this.height;
		var scaledwidth = Math.ceil(floatscaledwidth);
		var scaledheight = Math.ceil(floatscaledheight);
		var halfw = this.runtime.draw_width / 2;
		var halfh = this.runtime.draw_height / 2;
		if (!this.myctx)
		{
			this.mycanvas = document.createElement("canvas");
			this.mycanvas.width = scaledwidth;
			this.mycanvas.height = scaledheight;
			this.lastwidth = scaledwidth;
			this.lastheight = scaledheight;
			need_redraw = true;
			this.myctx = this.mycanvas.getContext("2d");
		}
		if (scaledwidth !== this.lastwidth || scaledheight !== this.lastheight)
		{
			this.mycanvas.width = scaledwidth;
			this.mycanvas.height = scaledheight;
			if (this.mytex)
			{
				glw.deleteTexture(this.mytex);
				this.mytex = null;
			}
			need_redraw = true;
		}
		if (need_redraw)
		{
			this.myctx.clearRect(0, 0, scaledwidth, scaledheight);
			this.draw(this.myctx, true);
			if (!this.mytex)
				this.mytex = glw.createEmptyTexture(scaledwidth, scaledheight, this.runtime.linearSampling, this.runtime.isMobile);
			glw.videoToTexture(this.mycanvas, this.mytex, this.runtime.isMobile);
		}
		this.lastwidth = scaledwidth;
		this.lastheight = scaledheight;
		glw.setTexture(this.mytex);
		glw.setOpacity(this.opacity);
		glw.resetModelView();
		glw.translate(-halfw, -halfh);
		glw.updateModelView();
		var q = this.bquad;
		var old_dpr = this.runtime.devicePixelRatio;
		this.runtime.devicePixelRatio = 1;
		var tlx = this.layer.layerToCanvas(q.tlx, q.tly, true, true);
		var tly = this.layer.layerToCanvas(q.tlx, q.tly, false, true);
		var trx = this.layer.layerToCanvas(q.trx, q.try_, true, true);
		var try_ = this.layer.layerToCanvas(q.trx, q.try_, false, true);
		var brx = this.layer.layerToCanvas(q.brx, q.bry, true, true);
		var bry = this.layer.layerToCanvas(q.brx, q.bry, false, true);
		var blx = this.layer.layerToCanvas(q.blx, q.bly, true, true);
		var bly = this.layer.layerToCanvas(q.blx, q.bly, false, true);
		this.runtime.devicePixelRatio = old_dpr;
		if (this.runtime.pixel_rounding || (this.angle === 0 && layer_angle === 0))
		{
			var ox = ((tlx + 0.5) | 0) - tlx;
			var oy = ((tly + 0.5) | 0) - tly
			tlx += ox;
			tly += oy;
			trx += ox;
			try_ += oy;
			brx += ox;
			bry += oy;
			blx += ox;
			bly += oy;
		}
		if (this.angle === 0 && layer_angle === 0)
		{
			trx = tlx + scaledwidth;
			try_ = tly;
			brx = trx;
			bry = tly + scaledheight;
			blx = tlx;
			bly = bry;
			rcTex.right = 1;
			rcTex.bottom = 1;
		}
		else
		{
			rcTex.right = floatscaledwidth / scaledwidth;
			rcTex.bottom = floatscaledheight / scaledheight;
		}
		glw.quadTex(tlx, tly, trx, try_, brx, bry, blx, bly, rcTex);
		glw.resetModelView();
		glw.scale(layer_scale, layer_scale);
		glw.rotateZ(-this.layer.getAngle());
		glw.translate((this.layer.viewLeft + this.layer.viewRight) / -2, (this.layer.viewTop + this.layer.viewBottom) / -2);
		glw.updateModelView();
		this.last_render_tick = this.runtime.tickcount;
	};
	var wordsCache = [];
	pluginProto.TokeniseWords = function (text)
	{
		wordsCache.length = 0;
		var cur_word = "";
		var ch;
		var i = 0;
		while (i < text.length)
		{
			ch = text.charAt(i);
			if (ch === "\n")
			{
				if (cur_word.length)
				{
					wordsCache.push(cur_word);
					cur_word = "";
				}
				wordsCache.push("\n");
				++i;
			}
			else if (ch === " " || ch === "\t" || ch === "-")
			{
				do {
					cur_word += text.charAt(i);
					i++;
				}
				while (i < text.length && (text.charAt(i) === " " || text.charAt(i) === "\t"));
				wordsCache.push(cur_word);
				cur_word = "";
			}
			else if (i < text.length)
			{
				cur_word += ch;
				i++;
			}
		}
		if (cur_word.length)
			wordsCache.push(cur_word);
	};
	var linesCache = [];
	function allocLine()
	{
		if (linesCache.length)
			return linesCache.pop();
		else
			return {};
	};
	function freeLine(l)
	{
		linesCache.push(l);
	};
	function freeAllLines(arr)
	{
		var i, len;
		for (i = 0, len = arr.length; i < len; i++)
		{
			freeLine(arr[i]);
		}
		arr.length = 0;
	};
	pluginProto.WordWrap = function (text, lines, ctx, width, wrapbyword)
	{
		if (!text || !text.length)
		{
			freeAllLines(lines);
			return;
		}
		if (width <= 2.0)
		{
			freeAllLines(lines);
			return;
		}
		if (text.length <= 100 && text.indexOf("\n") === -1)
		{
			var all_width = ctx.measureText(text).width;
			if (all_width <= width)
			{
				freeAllLines(lines);
				lines.push(allocLine());
				lines[0].text = text;
				lines[0].width = all_width;
				return;
			}
		}
		this.WrapText(text, lines, ctx, width, wrapbyword);
	};
	pluginProto.WrapText = function (text, lines, ctx, width, wrapbyword)
	{
		var wordArray;
		if (wrapbyword)
		{
			this.TokeniseWords(text);	// writes to wordsCache
			wordArray = wordsCache;
		}
		else
			wordArray = text;
		var cur_line = "";
		var prev_line;
		var line_width;
		var i;
		var lineIndex = 0;
		var line;
		for (i = 0; i < wordArray.length; i++)
		{
			if (wordArray[i] === "\n")
			{
				if (lineIndex >= lines.length)
					lines.push(allocLine());
				line = lines[lineIndex];
				line.text = cur_line;
				line.width = ctx.measureText(cur_line).width;
				lineIndex++;
				cur_line = "";
				continue;
			}
			prev_line = cur_line;
			cur_line += wordArray[i];
			line_width = ctx.measureText(cur_line).width;
			if (line_width >= width)
			{
				if (lineIndex >= lines.length)
					lines.push(allocLine());
				line = lines[lineIndex];
				line.text = prev_line;
				line.width = ctx.measureText(prev_line).width;
				lineIndex++;
				cur_line = wordArray[i];
				if (!wrapbyword && cur_line === " ")
					cur_line = "";
			}
		}
		if (cur_line.length)
		{
			if (lineIndex >= lines.length)
				lines.push(allocLine());
			line = lines[lineIndex];
			line.text = cur_line;
			line.width = ctx.measureText(cur_line).width;
			lineIndex++;
		}
		for (i = lineIndex; i < lines.length; i++)
			freeLine(lines[i]);
		lines.length = lineIndex;
	};
	function Cnds() {};
	Cnds.prototype.CompareText = function(text_to_compare, case_sensitive)
	{
		if (case_sensitive)
			return this.text == text_to_compare;
		else
			return cr.equals_nocase(this.text, text_to_compare);
	};
	pluginProto.cnds = new Cnds();
	function Acts() {};
	Acts.prototype.SetText = function(param)
	{
		if (cr.is_number(param) && param < 1e9)
			param = Math.round(param * 1e10) / 1e10;	// round to nearest ten billionth - hides floating point errors
		var text_to_set = param.toString();
		if (this.text !== text_to_set)
		{
			this.text = text_to_set;
			this.text_changed = true;
			this.runtime.redraw = true;
		}
	};
	Acts.prototype.AppendText = function(param)
	{
		if (cr.is_number(param))
			param = Math.round(param * 1e10) / 1e10;	// round to nearest ten billionth - hides floating point errors
		var text_to_append = param.toString();
		if (text_to_append)	// not empty
		{
			this.text += text_to_append;
			this.text_changed = true;
			this.runtime.redraw = true;
		}
	};
	Acts.prototype.SetFontFace = function (face_, style_)
	{
		var newstyle = "";
		switch (style_) {
		case 1: newstyle = "bold"; break;
		case 2: newstyle = "italic"; break;
		case 3: newstyle = "bold italic"; break;
		}
		if (face_ === this.facename && newstyle === this.fontstyle)
			return;		// no change
		this.facename = face_;
		this.fontstyle = newstyle;
		this.updateFont();
	};
	Acts.prototype.SetFontSize = function (size_)
	{
		if (this.ptSize === size_)
			return;
		this.ptSize = size_;
		this.pxHeight = Math.ceil((this.ptSize / 72.0) * 96.0) + 4;	// assume 96dpi...
		this.updateFont();
	};
	Acts.prototype.SetFontColor = function (rgb)
	{
		var newcolor = "rgb(" + cr.GetRValue(rgb).toString() + "," + cr.GetGValue(rgb).toString() + "," + cr.GetBValue(rgb).toString() + ")";
		if (newcolor === this.color)
			return;
		this.color = newcolor;
		this.need_text_redraw = true;
		this.runtime.redraw = true;
	};
	Acts.prototype.SetWebFont = function (familyname_, cssurl_)
	{
		if (this.runtime.isDomFree)
		{
			cr.logexport("[] Text plugin: 'Set web font' not supported on this platform - the action has been ignored");
			return;		// DC todo
		}
		var self = this;
		var refreshFunc = (function () {
							self.runtime.redraw = true;
							self.text_changed = true;
						});
		if (requestedWebFonts.hasOwnProperty(cssurl_))
		{
			var newfacename = "'" + familyname_ + "'";
			if (this.facename === newfacename)
				return;	// no change
			this.facename = newfacename;
			this.updateFont();
			for (var i = 1; i < 10; i++)
			{
				setTimeout(refreshFunc, i * 100);
				setTimeout(refreshFunc, i * 1000);
			}
			return;
		}
		var wf = document.createElement("link");
		wf.href = cssurl_;
		wf.rel = "stylesheet";
		wf.type = "text/css";
		wf.onload = refreshFunc;
		document.getElementsByTagName('head')[0].appendChild(wf);
		requestedWebFonts[cssurl_] = true;
		this.facename = "'" + familyname_ + "'";
		this.updateFont();
		for (var i = 1; i < 10; i++)
		{
			setTimeout(refreshFunc, i * 100);
			setTimeout(refreshFunc, i * 1000);
		}
;
	};
	Acts.prototype.SetEffect = function (effect)
	{
		this.compositeOp = cr.effectToCompositeOp(effect);
		cr.setGLBlend(this, effect, this.runtime.gl);
		this.runtime.redraw = true;
	};
	pluginProto.acts = new Acts();
	function Exps() {};
	Exps.prototype.Text = function(ret)
	{
		ret.set_string(this.text);
	};
	Exps.prototype.FaceName = function (ret)
	{
		ret.set_string(this.facename);
	};
	Exps.prototype.FaceSize = function (ret)
	{
		ret.set_int(this.ptSize);
	};
	Exps.prototype.TextWidth = function (ret)
	{
		var w = 0;
		var i, len, x;
		for (i = 0, len = this.lines.length; i < len; i++)
		{
			x = this.lines[i].width;
			if (w < x)
				w = x;
		}
		ret.set_int(w);
	};
	Exps.prototype.TextHeight = function (ret)
	{
		ret.set_int(this.lines.length * (this.pxHeight + this.line_height_offset) - this.line_height_offset);
	};
	pluginProto.exps = new Exps();
}());
;
;
cr.plugins_.TextBox = function(runtime)
{
	this.runtime = runtime;
};
(function ()
{
	var pluginProto = cr.plugins_.TextBox.prototype;
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};
	var typeProto = pluginProto.Type.prototype;
	typeProto.onCreate = function()
	{
	};
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
	};
	var instanceProto = pluginProto.Instance.prototype;
	var elemTypes = ["text", "password", "email", "number", "tel", "url"];
	if (navigator.userAgent.indexOf("MSIE 9") > -1)
	{
		elemTypes[2] = "text";
		elemTypes[3] = "text";
		elemTypes[4] = "text";
		elemTypes[5] = "text";
	}
	instanceProto.onCreate = function()
	{
		if (this.runtime.isDomFree)
		{
			cr.logexport("[] Textbox plugin not supported on this platform - the object will not be created");
			return;
		}
		if (this.properties[7] === 6)	// textarea
		{
			this.elem = document.createElement("textarea");
			jQuery(this.elem).css("resize", "none");
		}
		else
		{
			this.elem = document.createElement("input");
			this.elem.type = elemTypes[this.properties[7]];
		}
		this.elem.id = this.properties[9];
		jQuery(this.elem).appendTo(this.runtime.canvasdiv ? this.runtime.canvasdiv : "body");
		this.elem["autocomplete"] = "off";
		this.elem.value = this.properties[0];
		this.elem["placeholder"] = this.properties[1];
		this.elem.title = this.properties[2];
		this.elem.disabled = (this.properties[4] === 0);
		this.elem["readOnly"] = (this.properties[5] === 1);
		this.elem["spellcheck"] = (this.properties[6] === 1);
		this.autoFontSize = (this.properties[8] !== 0);
		this.element_hidden = false;
		if (this.properties[3] === 0)
		{
			jQuery(this.elem).hide();
			this.visible = false;
			this.element_hidden = true;
		}
		var onchangetrigger = (function (self) {
			return function() {
				self.runtime.trigger(cr.plugins_.TextBox.prototype.cnds.OnTextChanged, self);
			};
		})(this);
		this.elem["oninput"] = onchangetrigger;
		if (navigator.userAgent.indexOf("MSIE") !== -1)
			this.elem["oncut"] = onchangetrigger;
		this.elem.onclick = (function (self) {
			return function(e) {
				e.stopPropagation();
				self.runtime.isInUserInputEvent = true;
				self.runtime.trigger(cr.plugins_.TextBox.prototype.cnds.OnClicked, self);
				self.runtime.isInUserInputEvent = false;
			};
		})(this);
		this.elem.ondblclick = (function (self) {
			return function(e) {
				e.stopPropagation();
				self.runtime.isInUserInputEvent = true;
				self.runtime.trigger(cr.plugins_.TextBox.prototype.cnds.OnDoubleClicked, self);
				self.runtime.isInUserInputEvent = false;
			};
		})(this);
		this.elem.addEventListener("touchstart", function (e) {
			e.stopPropagation();
		}, false);
		this.elem.addEventListener("touchmove", function (e) {
			e.stopPropagation();
		}, false);
		this.elem.addEventListener("touchend", function (e) {
			e.stopPropagation();
		}, false);
		jQuery(this.elem).mousedown(function (e) {
			e.stopPropagation();
		});
		jQuery(this.elem).mouseup(function (e) {
			e.stopPropagation();
		});
		jQuery(this.elem).keydown(function (e) {
			if (e.which !== 13 && e.which != 27)	// allow enter and escape
				e.stopPropagation();
		});
		jQuery(this.elem).keyup(function (e) {
			if (e.which !== 13 && e.which != 27)	// allow enter and escape
				e.stopPropagation();
		});
		this.lastLeft = 0;
		this.lastTop = 0;
		this.lastRight = 0;
		this.lastBottom = 0;
		this.lastWinWidth = 0;
		this.lastWinHeight = 0;
		this.updatePosition(true);
		this.runtime.tickMe(this);
	};
	instanceProto.saveToJSON = function ()
	{
		return {
			"text": this.elem.value,
			"placeholder": this.elem.placeholder,
			"tooltip": this.elem.title,
			"disabled": !!this.elem.disabled,
			"readonly": !!this.elem.readOnly,
			"spellcheck": !!this.elem["spellcheck"]
		};
	};
	instanceProto.loadFromJSON = function (o)
	{
		this.elem.value = o["text"];
		this.elem.placeholder = o["placeholder"];
		this.elem.title = o["tooltip"];
		this.elem.disabled = o["disabled"];
		this.elem.readOnly = o["readonly"];
		this.elem["spellcheck"] = o["spellcheck"];
	};
	instanceProto.onDestroy = function ()
	{
		if (this.runtime.isDomFree)
				return;
		jQuery(this.elem).remove();
		this.elem = null;
	};
	instanceProto.tick = function ()
	{
		this.updatePosition();
	};
	instanceProto.updatePosition = function (first)
	{
		if (this.runtime.isDomFree)
			return;
		var left = this.layer.layerToCanvas(this.x, this.y, true);
		var top = this.layer.layerToCanvas(this.x, this.y, false);
		var right = this.layer.layerToCanvas(this.x + this.width, this.y + this.height, true);
		var bottom = this.layer.layerToCanvas(this.x + this.width, this.y + this.height, false);
		if (!this.visible || !this.layer.visible || right <= 0 || bottom <= 0 || left >= this.runtime.width || top >= this.runtime.height)
		{
			if (!this.element_hidden)
				jQuery(this.elem).hide();
			this.element_hidden = true;
			return;
		}
		if (left < 1)
			left = 1;
		if (top < 1)
			top = 1;
		if (right >= this.runtime.width)
			right = this.runtime.width - 1;
		if (bottom >= this.runtime.height)
			bottom = this.runtime.height - 1;
		var curWinWidth = window.innerWidth;
		var curWinHeight = window.innerHeight;
		if (!first && this.lastLeft === left && this.lastTop === top && this.lastRight === right && this.lastBottom === bottom && this.lastWinWidth === curWinWidth && this.lastWinHeight === curWinHeight)
		{
			if (this.element_hidden)
			{
				jQuery(this.elem).show();
				this.element_hidden = false;
			}
			return;
		}
		this.lastLeft = left;
		this.lastTop = top;
		this.lastRight = right;
		this.lastBottom = bottom;
		this.lastWinWidth = curWinWidth;
		this.lastWinHeight = curWinHeight;
		if (this.element_hidden)
		{
			jQuery(this.elem).show();
			this.element_hidden = false;
		}
		var offx = Math.round(left) + jQuery(this.runtime.canvas).offset().left;
		var offy = Math.round(top) + jQuery(this.runtime.canvas).offset().top;
		jQuery(this.elem).css("position", "absolute");
		jQuery(this.elem).offset({left: offx, top: offy});
		jQuery(this.elem).width(Math.round(right - left));
		jQuery(this.elem).height(Math.round(bottom - top));
		if (this.autoFontSize)
			jQuery(this.elem).css("font-size", ((this.layer.getScale(true) / this.runtime.devicePixelRatio) - 0.2) + "em");
	};
	instanceProto.draw = function(ctx)
	{
	};
	instanceProto.drawGL = function(glw)
	{
	};
	function Cnds() {};
	Cnds.prototype.CompareText = function (text, case_)
	{
		if (this.runtime.isDomFree)
			return false;
		if (case_ === 0)	// insensitive
			return cr.equals_nocase(this.elem.value, text);
		else
			return this.elem.value === text;
	};
	Cnds.prototype.OnTextChanged = function ()
	{
		return true;
	};
	Cnds.prototype.OnClicked = function ()
	{
		return true;
	};
	Cnds.prototype.OnDoubleClicked = function ()
	{
		return true;
	};
	pluginProto.cnds = new Cnds();
	function Acts() {};
	Acts.prototype.SetText = function (text)
	{
		if (this.runtime.isDomFree)
			return;
		this.elem.value = text;
	};
	Acts.prototype.SetPlaceholder = function (text)
	{
		if (this.runtime.isDomFree)
			return;
		this.elem.placeholder = text;
	};
	Acts.prototype.SetTooltip = function (text)
	{
		if (this.runtime.isDomFree)
			return;
		this.elem.title = text;
	};
	Acts.prototype.SetVisible = function (vis)
	{
		if (this.runtime.isDomFree)
			return;
		this.visible = (vis !== 0);
	};
	Acts.prototype.SetEnabled = function (en)
	{
		if (this.runtime.isDomFree)
			return;
		this.elem.disabled = (en === 0);
	};
	Acts.prototype.SetReadOnly = function (ro)
	{
		if (this.runtime.isDomFree)
			return;
		this.elem.readOnly = (ro === 0);
	};
	Acts.prototype.SetFocus = function ()
	{
		if (this.runtime.isDomFree)
			return;
		this.elem.focus();
	};
	Acts.prototype.SetBlur = function ()
	{
		if (this.runtime.isDomFree)
			return;
		this.elem.blur();
	};
	Acts.prototype.SetCSSStyle = function (p, v)
	{
		if (this.runtime.isDomFree)
			return;
		jQuery(this.elem).css(p, v);
	};
	pluginProto.acts = new Acts();
	function Exps() {};
	Exps.prototype.Text = function (ret)
	{
		if (this.runtime.isDomFree)
		{
			ret.set_string("");
			return;
		}
		ret.set_string(this.elem.value);
	};
	pluginProto.exps = new Exps();
}());
;
;
cr.plugins_.TiledBg = function(runtime)
{
	this.runtime = runtime;
};
(function ()
{
	var pluginProto = cr.plugins_.TiledBg.prototype;
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};
	var typeProto = pluginProto.Type.prototype;
	typeProto.onCreate = function()
	{
		if (this.is_family)
			return;
		this.texture_img = new Image();
		this.texture_img["idtkLoadDisposed"] = true;
		this.texture_img.src = this.texture_file;
		this.texture_img.cr_filesize = this.texture_filesize;
		this.runtime.waitForImageLoad(this.texture_img);
		this.pattern = null;
		this.webGL_texture = null;
	};
	typeProto.onLostWebGLContext = function ()
	{
		if (this.is_family)
			return;
		this.webGL_texture = null;
	};
	typeProto.onRestoreWebGLContext = function ()
	{
		if (this.is_family || !this.instances.length)
			return;
		if (!this.webGL_texture)
		{
			this.webGL_texture = this.runtime.glwrap.loadTexture(this.texture_img, true, this.runtime.linearSampling, this.texture_pixelformat);
		}
		var i, len;
		for (i = 0, len = this.instances.length; i < len; i++)
			this.instances[i].webGL_texture = this.webGL_texture;
	};
	typeProto.loadTextures = function ()
	{
		if (this.is_family || this.webGL_texture || !this.runtime.glwrap)
			return;
		this.webGL_texture = this.runtime.glwrap.loadTexture(this.texture_img, true, this.runtime.linearSampling, this.texture_pixelformat);
	};
	typeProto.unloadTextures = function ()
	{
		if (this.is_family || this.instances.length || !this.webGL_texture)
			return;
		this.runtime.glwrap.deleteTexture(this.webGL_texture);
		this.webGL_texture = null;
	};
	typeProto.preloadCanvas2D = function (ctx)
	{
		ctx.drawImage(this.texture_img, 0, 0);
	};
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
	};
	var instanceProto = pluginProto.Instance.prototype;
	instanceProto.onCreate = function()
	{
		this.visible = (this.properties[0] === 0);							// 0=visible, 1=invisible
		this.rcTex = new cr.rect(0, 0, 0, 0);
		this.has_own_texture = false;										// true if a texture loaded in from URL
		this.texture_img = this.type.texture_img;
		if (this.runtime.glwrap)
		{
			this.type.loadTextures();
			this.webGL_texture = this.type.webGL_texture;
		}
		else
		{
			if (!this.type.pattern)
				this.type.pattern = this.runtime.ctx.createPattern(this.type.texture_img, "repeat");
			this.pattern = this.type.pattern;
		}
	};
	instanceProto.afterLoad = function ()
	{
		this.has_own_texture = false;
		this.texture_img = this.type.texture_img;
	};
	instanceProto.onDestroy = function ()
	{
		if (this.runtime.glwrap && this.has_own_texture && this.webGL_texture)
		{
			this.runtime.glwrap.deleteTexture(this.webGL_texture);
			this.webGL_texture = null;
		}
	};
	instanceProto.draw = function(ctx)
	{
		ctx.globalAlpha = this.opacity;
		ctx.save();
		ctx.fillStyle = this.pattern;
		var myx = this.x;
		var myy = this.y;
		if (this.runtime.pixel_rounding)
		{
			myx = (myx + 0.5) | 0;
			myy = (myy + 0.5) | 0;
		}
		var drawX = -(this.hotspotX * this.width);
		var drawY = -(this.hotspotY * this.height);
		var offX = drawX % this.texture_img.width;
		var offY = drawY % this.texture_img.height;
		if (offX < 0)
			offX += this.texture_img.width;
		if (offY < 0)
			offY += this.texture_img.height;
		ctx.translate(myx, myy);
		ctx.rotate(this.angle);
		ctx.translate(offX, offY);
		ctx.fillRect(drawX - offX,
					 drawY - offY,
					 this.width,
					 this.height);
		ctx.restore();
	};
	instanceProto.drawGL = function(glw)
	{
		glw.setTexture(this.webGL_texture);
		glw.setOpacity(this.opacity);
		var rcTex = this.rcTex;
		rcTex.right = this.width / this.texture_img.width;
		rcTex.bottom = this.height / this.texture_img.height;
		var q = this.bquad;
		if (this.runtime.pixel_rounding)
		{
			var ox = ((this.x + 0.5) | 0) - this.x;
			var oy = ((this.y + 0.5) | 0) - this.y;
			glw.quadTex(q.tlx + ox, q.tly + oy, q.trx + ox, q.try_ + oy, q.brx + ox, q.bry + oy, q.blx + ox, q.bly + oy, rcTex);
		}
		else
			glw.quadTex(q.tlx, q.tly, q.trx, q.try_, q.brx, q.bry, q.blx, q.bly, rcTex);
	};
	function Cnds() {};
	Cnds.prototype.OnURLLoaded = function ()
	{
		return true;
	};
	pluginProto.cnds = new Cnds();
	function Acts() {};
	Acts.prototype.SetEffect = function (effect)
	{
		this.compositeOp = cr.effectToCompositeOp(effect);
		cr.setGLBlend(this, effect, this.runtime.gl);
		this.runtime.redraw = true;
	};
	Acts.prototype.LoadURL = function (url_)
	{
		var img = new Image();
		var self = this;
		img.onload = function ()
		{
			self.texture_img = img;
			if (self.runtime.glwrap)
			{
				if (self.has_own_texture && self.webGL_texture)
					self.runtime.glwrap.deleteTexture(self.webGL_texture);
				self.webGL_texture = self.runtime.glwrap.loadTexture(img, true, self.runtime.linearSampling);
			}
			else
			{
				self.pattern = self.runtime.ctx.createPattern(img, "repeat");
			}
			self.has_own_texture = true;
			self.runtime.redraw = true;
			self.runtime.trigger(cr.plugins_.TiledBg.prototype.cnds.OnURLLoaded, self);
		};
		if (url_.substr(0, 5) !== "data:")
			img.crossOrigin = 'anonymous';
		img.src = url_;
	};
	pluginProto.acts = new Acts();
	function Exps() {};
	Exps.prototype.ImageWidth = function (ret)
	{
		ret.set_float(this.texture_img.width);
	};
	Exps.prototype.ImageHeight = function (ret)
	{
		ret.set_float(this.texture_img.height);
	};
	pluginProto.exps = new Exps();
}());
;
;
cr.plugins_.Touch = function(runtime)
{
	this.runtime = runtime;
};
(function ()
{
	var pluginProto = cr.plugins_.Touch.prototype;
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};
	var typeProto = pluginProto.Type.prototype;
	typeProto.onCreate = function()
	{
	};
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
		this.touches = [];
		this.mouseDown = false;
	};
	var instanceProto = pluginProto.Instance.prototype;
	var dummyoffset = {left: 0, top: 0};
	instanceProto.findTouch = function (id)
	{
		var i, len;
		for (i = 0, len = this.touches.length; i < len; i++)
		{
			if (this.touches[i]["id"] === id)
				return i;
		}
		return -1;
	};
	var appmobi_accx = 0;
	var appmobi_accy = 0;
	var appmobi_accz = 0;
	function AppMobiGetAcceleration(evt)
	{
		appmobi_accx = evt.x;
		appmobi_accy = evt.y;
		appmobi_accz = evt.z;
	};
	var pg_accx = 0;
	var pg_accy = 0;
	var pg_accz = 0;
	function PhoneGapGetAcceleration(evt)
	{
		pg_accx = evt.x;
		pg_accy = evt.y;
		pg_accz = evt.z;
	};
	var theInstance = null;
	instanceProto.onCreate = function()
	{
		theInstance = this;
		this.isWindows8 = !!(typeof window["c2isWindows8"] !== "undefined" && window["c2isWindows8"]);
		this.orient_alpha = 0;
		this.orient_beta = 0;
		this.orient_gamma = 0;
		this.acc_g_x = 0;
		this.acc_g_y = 0;
		this.acc_g_z = 0;
		this.acc_x = 0;
		this.acc_y = 0;
		this.acc_z = 0;
		this.curTouchX = 0;
		this.curTouchY = 0;
		this.trigger_index = 0;
		this.trigger_id = 0;
		this.useMouseInput = (this.properties[0] !== 0);
		var elem = (this.runtime.fullscreen_mode > 0) ? document : this.runtime.canvas;
		var elem2 = document;
		if (this.runtime.isDirectCanvas)
			elem2 = elem = window["Canvas"];
		else if (this.runtime.isCocoonJs)
			elem2 = elem = window;
		var self = this;
		if (window.navigator["pointerEnabled"])
		{
			elem.addEventListener("pointerdown",
				function(info) {
					self.onPointerStart(info);
				},
				false
			);
			elem.addEventListener("pointermove",
				function(info) {
					self.onPointerMove(info);
				},
				false
			);
			elem2.addEventListener("pointerup",
				function(info) {
					self.onPointerEnd(info);
				},
				false
			);
			elem2.addEventListener("pointercancel",
				function(info) {
					self.onPointerEnd(info);
				},
				false
			);
			if (this.runtime.canvas)
			{
				this.runtime.canvas.addEventListener("MSGestureHold", function(e) {
					e.preventDefault();
				}, false);
				document.addEventListener("MSGestureHold", function(e) {
					e.preventDefault();
				}, false);
				this.runtime.canvas.addEventListener("gesturehold", function(e) {
					e.preventDefault();
				}, false);
				document.addEventListener("gesturehold", function(e) {
					e.preventDefault();
				}, false);
			}
		}
		else if (window.navigator["msPointerEnabled"])
		{
			elem.addEventListener("MSPointerDown",
				function(info) {
					self.onPointerStart(info);
				},
				false
			);
			elem.addEventListener("MSPointerMove",
				function(info) {
					self.onPointerMove(info);
				},
				false
			);
			elem2.addEventListener("MSPointerUp",
				function(info) {
					self.onPointerEnd(info);
				},
				false
			);
			elem2.addEventListener("MSPointerCancel",
				function(info) {
					self.onPointerEnd(info);
				},
				false
			);
			if (this.runtime.canvas)
			{
				this.runtime.canvas.addEventListener("MSGestureHold", function(e) {
					e.preventDefault();
				}, false);
				document.addEventListener("MSGestureHold", function(e) {
					e.preventDefault();
				}, false);
			}
		}
		else
		{
			elem.addEventListener("touchstart",
				function(info) {
					self.onTouchStart(info);
				},
				false
			);
			elem.addEventListener("touchmove",
				function(info) {
					self.onTouchMove(info);
				},
				false
			);
			elem2.addEventListener("touchend",
				function(info) {
					self.onTouchEnd(info);
				},
				false
			);
			elem2.addEventListener("touchcancel",
				function(info) {
					self.onTouchEnd(info);
				},
				false
			);
		}
		if (this.isWindows8)
		{
			var win8accelerometerFn = function(e) {
					var reading = e["reading"];
					self.acc_x = reading["accelerationX"];
					self.acc_y = reading["accelerationY"];
					self.acc_z = reading["accelerationZ"];
				};
			var win8inclinometerFn = function(e) {
					var reading = e["reading"];
					self.orient_alpha = reading["yawDegrees"];
					self.orient_beta = reading["pitchDegrees"];
					self.orient_gamma = reading["rollDegrees"];
				};
			var accelerometer = Windows["Devices"]["Sensors"]["Accelerometer"]["getDefault"]();
            if (accelerometer)
			{
                accelerometer["reportInterval"] = Math.max(accelerometer["minimumReportInterval"], 16);
				accelerometer.addEventListener("readingchanged", win8accelerometerFn);
            }
			var inclinometer = Windows["Devices"]["Sensors"]["Inclinometer"]["getDefault"]();
			if (inclinometer)
			{
				inclinometer["reportInterval"] = Math.max(inclinometer["minimumReportInterval"], 16);
				inclinometer.addEventListener("readingchanged", win8inclinometerFn);
			}
			document.addEventListener("visibilitychange", function(e) {
				if (document["hidden"] || document["msHidden"])
				{
					if (accelerometer)
						accelerometer.removeEventListener("readingchanged", win8accelerometerFn);
					if (inclinometer)
						inclinometer.removeEventListener("readingchanged", win8inclinometerFn);
				}
				else
				{
					if (accelerometer)
						accelerometer.addEventListener("readingchanged", win8accelerometerFn);
					if (inclinometer)
						inclinometer.addEventListener("readingchanged", win8inclinometerFn);
				}
			}, false);
		}
		else
		{
			window.addEventListener("deviceorientation", function (eventData) {
				self.orient_alpha = eventData["alpha"] || 0;
				self.orient_beta = eventData["beta"] || 0;
				self.orient_gamma = eventData["gamma"] || 0;
			}, false);
			window.addEventListener("devicemotion", function (eventData) {
				if (eventData["accelerationIncludingGravity"])
				{
					self.acc_g_x = eventData["accelerationIncludingGravity"]["x"] || 0;
					self.acc_g_y = eventData["accelerationIncludingGravity"]["y"] || 0;
					self.acc_g_z = eventData["accelerationIncludingGravity"]["z"] || 0;
				}
				if (eventData["acceleration"])
				{
					self.acc_x = eventData["acceleration"]["x"] || 0;
					self.acc_y = eventData["acceleration"]["y"] || 0;
					self.acc_z = eventData["acceleration"]["z"] || 0;
				}
			}, false);
		}
		if (this.useMouseInput && !this.runtime.isDomFree)
		{
			jQuery(document).mousemove(
				function(info) {
					self.onMouseMove(info);
				}
			);
			jQuery(document).mousedown(
				function(info) {
					self.onMouseDown(info);
				}
			);
			jQuery(document).mouseup(
				function(info) {
					self.onMouseUp(info);
				}
			);
		}
		if (this.runtime.isAppMobi && !this.runtime.isDirectCanvas)
		{
			AppMobi["accelerometer"]["watchAcceleration"](AppMobiGetAcceleration, { "frequency": 40, "adjustForRotation": true });
		}
		if (this.runtime.isPhoneGap)
		{
			navigator["accelerometer"]["watchAcceleration"](PhoneGapGetAcceleration, null, { "frequency": 40 });
		}
		this.runtime.tick2Me(this);
	};
	instanceProto.onPointerMove = function (info)
	{
		if (info["pointerType"] === info["MSPOINTER_TYPE_MOUSE"] || info["pointerType"] === "mouse")
			return;
		if (info.preventDefault)
			info.preventDefault();
		var i = this.findTouch(info["pointerId"]);
		var nowtime = cr.performance_now();
		if (i >= 0)
		{
			var offset = this.runtime.isDomFree ? dummyoffset : jQuery(this.runtime.canvas).offset();
			var t = this.touches[i];
			if (nowtime - t.time < 2)
				return;
			t.lasttime = t.time;
			t.lastx = t.x;
			t.lasty = t.y;
			t.time = nowtime;
			t.x = info.pageX - offset.left;
			t.y = info.pageY - offset.top;
		}
	};
	instanceProto.onPointerStart = function (info)
	{
		if (info["pointerType"] === info["MSPOINTER_TYPE_MOUSE"] || info["pointerType"] === "mouse")
			return;
		if (info.preventDefault)
			info.preventDefault();
		var offset = this.runtime.isDomFree ? dummyoffset : jQuery(this.runtime.canvas).offset();
		var touchx = info.pageX - offset.left;
		var touchy = info.pageY - offset.top;
		var nowtime = cr.performance_now();
		this.trigger_index = this.touches.length;
		this.trigger_id = info["pointerId"];
		this.touches.push({ time: nowtime,
							x: touchx,
							y: touchy,
							lasttime: nowtime,
							lastx: touchx,
							lasty: touchy,
							"id": info["pointerId"],
							startindex: this.trigger_index
						});
		this.runtime.isInUserInputEvent = true;
		this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnNthTouchStart, this);
		this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnTouchStart, this);
		this.curTouchX = touchx;
		this.curTouchY = touchy;
		this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnTouchObject, this);
		this.runtime.isInUserInputEvent = false;
	};
	instanceProto.onPointerEnd = function (info)
	{
		if (info["pointerType"] === info["MSPOINTER_TYPE_MOUSE"] || info["pointerType"] === "mouse")
			return;
		if (info.preventDefault)
			info.preventDefault();
		var i = this.findTouch(info["pointerId"]);
		this.trigger_index = (i >= 0 ? this.touches[i].startindex : -1);
		this.trigger_id = (i >= 0 ? this.touches[i]["id"] : -1);
		this.runtime.isInUserInputEvent = true;
		this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnNthTouchEnd, this);
		this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnTouchEnd, this);
		this.runtime.isInUserInputEvent = false;
		if (i >= 0)
		{
			this.touches.splice(i, 1);
		}
	};
	instanceProto.onTouchMove = function (info)
	{
		if (info.preventDefault)
			info.preventDefault();
		var nowtime = cr.performance_now();
		var i, len, t, u;
		for (i = 0, len = info.changedTouches.length; i < len; i++)
		{
			t = info.changedTouches[i];
			var j = this.findTouch(t["identifier"]);
			if (j >= 0)
			{
				var offset = this.runtime.isDomFree ? dummyoffset : jQuery(this.runtime.canvas).offset();
				u = this.touches[j];
				if (nowtime - u.time < 2)
					continue;
				u.lasttime = u.time;
				u.lastx = u.x;
				u.lasty = u.y;
				u.time = nowtime;
				u.x = t.pageX - offset.left;
				u.y = t.pageY - offset.top;
			}
		}
	};
	instanceProto.onTouchStart = function (info)
	{
		if (info.preventDefault)
			info.preventDefault();
		var offset = this.runtime.isDomFree ? dummyoffset : jQuery(this.runtime.canvas).offset();
		var nowtime = cr.performance_now();
		this.runtime.isInUserInputEvent = true;
		var i, len, t, j;
		for (i = 0, len = info.changedTouches.length; i < len; i++)
		{
			t = info.changedTouches[i];
			j = this.findTouch(t["identifier"]);
			if (j !== -1)
				continue;
			var touchx = t.pageX - offset.left;
			var touchy = t.pageY - offset.top;
			this.trigger_index = this.touches.length;
			this.trigger_id = t["identifier"];
			this.touches.push({ time: nowtime,
								x: touchx,
								y: touchy,
								lasttime: nowtime,
								lastx: touchx,
								lasty: touchy,
								"id": t["identifier"],
								startindex: this.trigger_index
							});
			this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnNthTouchStart, this);
			this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnTouchStart, this);
			this.curTouchX = touchx;
			this.curTouchY = touchy;
			this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnTouchObject, this);
		}
		this.runtime.isInUserInputEvent = false;
	};
	instanceProto.onTouchEnd = function (info)
	{
		if (info.preventDefault)
			info.preventDefault();
		this.runtime.isInUserInputEvent = true;
		var i, len, t, j;
		for (i = 0, len = info.changedTouches.length; i < len; i++)
		{
			t = info.changedTouches[i];
			j = this.findTouch(t["identifier"]);
			if (j >= 0)
			{
				this.trigger_index = this.touches[j].startindex;
				this.trigger_id = this.touches[j]["id"];
				this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnNthTouchEnd, this);
				this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnTouchEnd, this);
				this.touches.splice(j, 1);
			}
		}
		this.runtime.isInUserInputEvent = false;
	};
	instanceProto.getAlpha = function ()
	{
		if (this.runtime.isAppMobi && this.orient_alpha === 0 && appmobi_accz !== 0)
			return appmobi_accz * 90;
		else if (this.runtime.isPhoneGap  && this.orient_alpha === 0 && pg_accz !== 0)
			return pg_accz * 90;
		else
			return this.orient_alpha;
	};
	instanceProto.getBeta = function ()
	{
		if (this.runtime.isAppMobi && this.orient_beta === 0 && appmobi_accy !== 0)
			return appmobi_accy * -90;
		else if (this.runtime.isPhoneGap  && this.orient_beta === 0 && pg_accy !== 0)
			return pg_accy * -90;
		else
			return this.orient_beta;
	};
	instanceProto.getGamma = function ()
	{
		if (this.runtime.isAppMobi && this.orient_gamma === 0 && appmobi_accx !== 0)
			return appmobi_accx * 90;
		else if (this.runtime.isPhoneGap  && this.orient_gamma === 0 && pg_accx !== 0)
			return pg_accx * 90;
		else
			return this.orient_gamma;
	};
	var noop_func = function(){};
	instanceProto.onMouseDown = function(info)
	{
		if (info.preventDefault && this.runtime.had_a_click)
			info.preventDefault();
		var t = { pageX: info.pageX, pageY: info.pageY, "identifier": 0 };
		var fakeinfo = { changedTouches: [t] };
		this.onTouchStart(fakeinfo);
		this.mouseDown = true;
	};
	instanceProto.onMouseMove = function(info)
	{
		if (info.preventDefault && this.runtime.had_a_click)
			info.preventDefault();
		if (!this.mouseDown)
			return;
		var t = { pageX: info.pageX, pageY: info.pageY, "identifier": 0 };
		var fakeinfo = { changedTouches: [t] };
		this.onTouchMove(fakeinfo);
	};
	instanceProto.onMouseUp = function(info)
	{
		if (info.preventDefault && this.runtime.had_a_click)
			info.preventDefault();
		this.runtime.had_a_click = true;
		var t = { pageX: info.pageX, pageY: info.pageY, "identifier": 0 };
		var fakeinfo = { changedTouches: [t] };
		this.onTouchEnd(fakeinfo);
		this.mouseDown = false;
	};
	instanceProto.tick2 = function()
	{
		var i, len, t;
		var nowtime = cr.performance_now();
		for (i = 0, len = this.touches.length; i < len; i++)
		{
			t = this.touches[i];
			if (t.time <= nowtime - 50)
				t.lasttime = nowtime;
		}
	};
	function Cnds() {};
	Cnds.prototype.OnTouchStart = function ()
	{
		return true;
	};
	Cnds.prototype.OnTouchEnd = function ()
	{
		return true;
	};
	Cnds.prototype.IsInTouch = function ()
	{
		return this.touches.length;
	};
	Cnds.prototype.OnTouchObject = function (type)
	{
		if (!type)
			return false;
		return this.runtime.testAndSelectCanvasPointOverlap(type, this.curTouchX, this.curTouchY, false);
	};
	Cnds.prototype.IsTouchingObject = function (type)
	{
		if (!type)
			return false;
		var sol = type.getCurrentSol();
		var instances = sol.getObjects();
		var px, py;
		var touching = [];
		var i, leni, j, lenj;
		for (i = 0, leni = instances.length; i < leni; i++)
		{
			var inst = instances[i];
			inst.update_bbox();
			for (j = 0, lenj = this.touches.length; j < lenj; j++)
			{
				var touch = this.touches[j];
				px = inst.layer.canvasToLayer(touch.x, touch.y, true);
				py = inst.layer.canvasToLayer(touch.x, touch.y, false);
				if (inst.contains_pt(px, py))
				{
					touching.push(inst);
					break;
				}
			}
		}
		if (touching.length)
		{
			sol.select_all = false;
			sol.instances = touching;
			type.applySolToContainer();
			return true;
		}
		else
			return false;
	};
	Cnds.prototype.CompareTouchSpeed = function (index, cmp, s)
	{
		index = Math.floor(index);
		if (index < 0 || index >= this.touches.length)
			return false;
		var t = this.touches[index];
		var dist = cr.distanceTo(t.x, t.y, t.lastx, t.lasty);
		var timediff = (t.time - t.lasttime) / 1000;
		var speed = 0;
		if (timediff > 0)
			speed = dist / timediff;
		return cr.do_cmp(speed, cmp, s);
	};
	Cnds.prototype.OrientationSupported = function ()
	{
		return typeof window["DeviceOrientationEvent"] !== "undefined";
	};
	Cnds.prototype.MotionSupported = function ()
	{
		return typeof window["DeviceMotionEvent"] !== "undefined";
	};
	Cnds.prototype.CompareOrientation = function (orientation_, cmp_, angle_)
	{
		var v = 0;
		if (orientation_ === 0)
			v = this.getAlpha();
		else if (orientation_ === 1)
			v = this.getBeta();
		else
			v = this.getGamma();
		return cr.do_cmp(v, cmp_, angle_);
	};
	Cnds.prototype.CompareAcceleration = function (acceleration_, cmp_, angle_)
	{
		var v = 0;
		if (acceleration_ === 0)
			v = this.acc_g_x;
		else if (acceleration_ === 1)
			v = this.acc_g_y;
		else if (acceleration_ === 2)
			v = this.acc_g_z;
		else if (acceleration_ === 3)
			v = this.acc_x;
		else if (acceleration_ === 4)
			v = this.acc_y;
		else if (acceleration_ === 5)
			v = this.acc_z;
		return cr.do_cmp(v, cmp_, angle_);
	};
	Cnds.prototype.OnNthTouchStart = function (touch_)
	{
		touch_ = Math.floor(touch_);
		return touch_ === this.trigger_index;
	};
	Cnds.prototype.OnNthTouchEnd = function (touch_)
	{
		touch_ = Math.floor(touch_);
		return touch_ === this.trigger_index;
	};
	Cnds.prototype.HasNthTouch = function (touch_)
	{
		touch_ = Math.floor(touch_);
		return this.touches.length >= touch_ + 1;
	};
	pluginProto.cnds = new Cnds();
	function Exps() {};
	Exps.prototype.TouchCount = function (ret)
	{
		ret.set_int(this.touches.length);
	};
	Exps.prototype.X = function (ret, layerparam)
	{
		if (this.touches.length)
		{
			var layer, oldScale, oldZoomRate, oldParallaxX, oldAngle;
			if (cr.is_undefined(layerparam))
			{
				layer = this.runtime.getLayerByNumber(0);
				oldScale = layer.scale;
				oldZoomRate = layer.zoomRate;
				oldParallaxX = layer.parallaxX;
				oldAngle = layer.angle;
				layer.scale = this.runtime.running_layout.scale;
				layer.zoomRate = 1.0;
				layer.parallaxX = 1.0;
				layer.angle = this.runtime.running_layout.angle;
				ret.set_float(layer.canvasToLayer(this.touches[0].x, this.touches[0].y, true));
				layer.scale = oldScale;
				layer.zoomRate = oldZoomRate;
				layer.parallaxX = oldParallaxX;
				layer.angle = oldAngle;
			}
			else
			{
				if (cr.is_number(layerparam))
					layer = this.runtime.getLayerByNumber(layerparam);
				else
					layer = this.runtime.getLayerByName(layerparam);
				if (layer)
					ret.set_float(layer.canvasToLayer(this.touches[0].x, this.touches[0].y, true));
				else
					ret.set_float(0);
			}
		}
		else
			ret.set_float(0);
	};
	Exps.prototype.XAt = function (ret, index, layerparam)
	{
		index = Math.floor(index);
		if (index < 0 || index >= this.touches.length)
		{
			ret.set_float(0);
			return;
		}
		var layer, oldScale, oldZoomRate, oldParallaxX, oldAngle;
		if (cr.is_undefined(layerparam))
		{
			layer = this.runtime.getLayerByNumber(0);
			oldScale = layer.scale;
			oldZoomRate = layer.zoomRate;
			oldParallaxX = layer.parallaxX;
			oldAngle = layer.angle;
			layer.scale = this.runtime.running_layout.scale;
			layer.zoomRate = 1.0;
			layer.parallaxX = 1.0;
			layer.angle = this.runtime.running_layout.angle;
			ret.set_float(layer.canvasToLayer(this.touches[index].x, this.touches[index].y, true));
			layer.scale = oldScale;
			layer.zoomRate = oldZoomRate;
			layer.parallaxX = oldParallaxX;
			layer.angle = oldAngle;
		}
		else
		{
			if (cr.is_number(layerparam))
				layer = this.runtime.getLayerByNumber(layerparam);
			else
				layer = this.runtime.getLayerByName(layerparam);
			if (layer)
				ret.set_float(layer.canvasToLayer(this.touches[index].x, this.touches[index].y, true));
			else
				ret.set_float(0);
		}
	};
	Exps.prototype.XForID = function (ret, id, layerparam)
	{
		var index = this.findTouch(id);
		if (index < 0)
		{
			ret.set_float(0);
			return;
		}
		var touch = this.touches[index];
		var layer, oldScale, oldZoomRate, oldParallaxX, oldAngle;
		if (cr.is_undefined(layerparam))
		{
			layer = this.runtime.getLayerByNumber(0);
			oldScale = layer.scale;
			oldZoomRate = layer.zoomRate;
			oldParallaxX = layer.parallaxX;
			oldAngle = layer.angle;
			layer.scale = this.runtime.running_layout.scale;
			layer.zoomRate = 1.0;
			layer.parallaxX = 1.0;
			layer.angle = this.runtime.running_layout.angle;
			ret.set_float(layer.canvasToLayer(touch.x, touch.y, true));
			layer.scale = oldScale;
			layer.zoomRate = oldZoomRate;
			layer.parallaxX = oldParallaxX;
			layer.angle = oldAngle;
		}
		else
		{
			if (cr.is_number(layerparam))
				layer = this.runtime.getLayerByNumber(layerparam);
			else
				layer = this.runtime.getLayerByName(layerparam);
			if (layer)
				ret.set_float(layer.canvasToLayer(touch.x, touch.y, true));
			else
				ret.set_float(0);
		}
	};
	Exps.prototype.Y = function (ret, layerparam)
	{
		if (this.touches.length)
		{
			var layer, oldScale, oldZoomRate, oldParallaxY, oldAngle;
			if (cr.is_undefined(layerparam))
			{
				layer = this.runtime.getLayerByNumber(0);
				oldScale = layer.scale;
				oldZoomRate = layer.zoomRate;
				oldParallaxY = layer.parallaxY;
				oldAngle = layer.angle;
				layer.scale = this.runtime.running_layout.scale;
				layer.zoomRate = 1.0;
				layer.parallaxY = 1.0;
				layer.angle = this.runtime.running_layout.angle;
				ret.set_float(layer.canvasToLayer(this.touches[0].x, this.touches[0].y, false));
				layer.scale = oldScale;
				layer.zoomRate = oldZoomRate;
				layer.parallaxY = oldParallaxY;
				layer.angle = oldAngle;
			}
			else
			{
				if (cr.is_number(layerparam))
					layer = this.runtime.getLayerByNumber(layerparam);
				else
					layer = this.runtime.getLayerByName(layerparam);
				if (layer)
					ret.set_float(layer.canvasToLayer(this.touches[0].x, this.touches[0].y, false));
				else
					ret.set_float(0);
			}
		}
		else
			ret.set_float(0);
	};
	Exps.prototype.YAt = function (ret, index, layerparam)
	{
		index = Math.floor(index);
		if (index < 0 || index >= this.touches.length)
		{
			ret.set_float(0);
			return;
		}
		var layer, oldScale, oldZoomRate, oldParallaxY, oldAngle;
		if (cr.is_undefined(layerparam))
		{
			layer = this.runtime.getLayerByNumber(0);
			oldScale = layer.scale;
			oldZoomRate = layer.zoomRate;
			oldParallaxY = layer.parallaxY;
			oldAngle = layer.angle;
			layer.scale = this.runtime.running_layout.scale;
			layer.zoomRate = 1.0;
			layer.parallaxY = 1.0;
			layer.angle = this.runtime.running_layout.angle;
			ret.set_float(layer.canvasToLayer(this.touches[index].x, this.touches[index].y, false));
			layer.scale = oldScale;
			layer.zoomRate = oldZoomRate;
			layer.parallaxY = oldParallaxY;
			layer.angle = oldAngle;
		}
		else
		{
			if (cr.is_number(layerparam))
				layer = this.runtime.getLayerByNumber(layerparam);
			else
				layer = this.runtime.getLayerByName(layerparam);
			if (layer)
				ret.set_float(layer.canvasToLayer(this.touches[index].x, this.touches[index].y, false));
			else
				ret.set_float(0);
		}
	};
	Exps.prototype.YForID = function (ret, id, layerparam)
	{
		var index = this.findTouch(id);
		if (index < 0)
		{
			ret.set_float(0);
			return;
		}
		var touch = this.touches[index];
		var layer, oldScale, oldZoomRate, oldParallaxY, oldAngle;
		if (cr.is_undefined(layerparam))
		{
			layer = this.runtime.getLayerByNumber(0);
			oldScale = layer.scale;
			oldZoomRate = layer.zoomRate;
			oldParallaxY = layer.parallaxY;
			oldAngle = layer.angle;
			layer.scale = this.runtime.running_layout.scale;
			layer.zoomRate = 1.0;
			layer.parallaxY = 1.0;
			layer.angle = this.runtime.running_layout.angle;
			ret.set_float(layer.canvasToLayer(touch.x, touch.y, false));
			layer.scale = oldScale;
			layer.zoomRate = oldZoomRate;
			layer.parallaxY = oldParallaxY;
			layer.angle = oldAngle;
		}
		else
		{
			if (cr.is_number(layerparam))
				layer = this.runtime.getLayerByNumber(layerparam);
			else
				layer = this.runtime.getLayerByName(layerparam);
			if (layer)
				ret.set_float(layer.canvasToLayer(touch.x, touch.y, false));
			else
				ret.set_float(0);
		}
	};
	Exps.prototype.AbsoluteX = function (ret)
	{
		if (this.touches.length)
			ret.set_float(this.touches[0].x);
		else
			ret.set_float(0);
	};
	Exps.prototype.AbsoluteXAt = function (ret, index)
	{
		index = Math.floor(index);
		if (index < 0 || index >= this.touches.length)
		{
			ret.set_float(0);
			return;
		}
		ret.set_float(this.touches[index].x);
	};
	Exps.prototype.AbsoluteXForID = function (ret, id)
	{
		var index = this.findTouch(id);
		if (index < 0)
		{
			ret.set_float(0);
			return;
		}
		var touch = this.touches[index];
		ret.set_float(touch.x);
	};
	Exps.prototype.AbsoluteY = function (ret)
	{
		if (this.touches.length)
			ret.set_float(this.touches[0].y);
		else
			ret.set_float(0);
	};
	Exps.prototype.AbsoluteYAt = function (ret, index)
	{
		index = Math.floor(index);
		if (index < 0 || index >= this.touches.length)
		{
			ret.set_float(0);
			return;
		}
		ret.set_float(this.touches[index].y);
	};
	Exps.prototype.AbsoluteYForID = function (ret, id)
	{
		var index = this.findTouch(id);
		if (index < 0)
		{
			ret.set_float(0);
			return;
		}
		var touch = this.touches[index];
		ret.set_float(touch.y);
	};
	Exps.prototype.SpeedAt = function (ret, index)
	{
		index = Math.floor(index);
		if (index < 0 || index >= this.touches.length)
		{
			ret.set_float(0);
			return;
		}
		var t = this.touches[index];
		var dist = cr.distanceTo(t.x, t.y, t.lastx, t.lasty);
		var timediff = (t.time - t.lasttime) / 1000;
		if (timediff === 0)
			ret.set_float(0);
		else
			ret.set_float(dist / timediff);
	};
	Exps.prototype.SpeedForID = function (ret, id)
	{
		var index = this.findTouch(id);
		if (index < 0)
		{
			ret.set_float(0);
			return;
		}
		var touch = this.touches[index];
		var dist = cr.distanceTo(touch.x, touch.y, touch.lastx, touch.lasty);
		var timediff = (touch.time - touch.lasttime) / 1000;
		if (timediff === 0)
			ret.set_float(0);
		else
			ret.set_float(dist / timediff);
	};
	Exps.prototype.AngleAt = function (ret, index)
	{
		index = Math.floor(index);
		if (index < 0 || index >= this.touches.length)
		{
			ret.set_float(0);
			return;
		}
		var t = this.touches[index];
		ret.set_float(cr.to_degrees(cr.angleTo(t.lastx, t.lasty, t.x, t.y)));
	};
	Exps.prototype.AngleForID = function (ret, id)
	{
		var index = this.findTouch(id);
		if (index < 0)
		{
			ret.set_float(0);
			return;
		}
		var touch = this.touches[index];
		ret.set_float(cr.to_degrees(cr.angleTo(touch.lastx, touch.lasty, touch.x, touch.y)));
	};
	Exps.prototype.Alpha = function (ret)
	{
		ret.set_float(this.getAlpha());
	};
	Exps.prototype.Beta = function (ret)
	{
		ret.set_float(this.getBeta());
	};
	Exps.prototype.Gamma = function (ret)
	{
		ret.set_float(this.getGamma());
	};
	Exps.prototype.AccelerationXWithG = function (ret)
	{
		ret.set_float(this.acc_g_x);
	};
	Exps.prototype.AccelerationYWithG = function (ret)
	{
		ret.set_float(this.acc_g_y);
	};
	Exps.prototype.AccelerationZWithG = function (ret)
	{
		ret.set_float(this.acc_g_z);
	};
	Exps.prototype.AccelerationX = function (ret)
	{
		ret.set_float(this.acc_x);
	};
	Exps.prototype.AccelerationY = function (ret)
	{
		ret.set_float(this.acc_y);
	};
	Exps.prototype.AccelerationZ = function (ret)
	{
		ret.set_float(this.acc_z);
	};
	Exps.prototype.TouchIndex = function (ret)
	{
		ret.set_int(this.trigger_index);
	};
	Exps.prototype.TouchID = function (ret)
	{
		ret.set_float(this.trigger_id);
	};
	pluginProto.exps = new Exps();
}());
;
;
cr.plugins_.WebStorage = function(runtime)
{
	this.runtime = runtime;
};
(function()
{
	var pluginProto = cr.plugins_.WebStorage.prototype;
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};
	var typeProto = pluginProto.Type.prototype;
	typeProto.onCreate = function()
	{
	};
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
	};
	var instanceProto = pluginProto.Instance.prototype;
	var prefix = "";
	var is_arcade = (typeof window["is_scirra_arcade"] !== "undefined");
	if (is_arcade)
		prefix = "arcade" + window["scirra_arcade_id"];
	var logged_sessionnotsupported = false;
	function LogSessionNotSupported()
	{
		if (logged_sessionnotsupported)
			return;
		cr.logexport("[] Webstorage plugin: session storage is not supported on this platform. Try using local storage or global variables instead.");
		logged_sessionnotsupported = true;
	};
	instanceProto.onCreate = function()
	{
	};
	function Cnds() {};
	Cnds.prototype.LocalStorageEnabled = function()
	{
		return true;
	};
	Cnds.prototype.SessionStorageEnabled = function()
	{
		return true;
	};
	Cnds.prototype.LocalStorageExists = function(key)
	{
		return localStorage.getItem(prefix + key) != null;
	};
	Cnds.prototype.SessionStorageExists = function(key)
	{
		if (this.runtime.isCocoonJs || !sessionStorage)
		{
			LogSessionNotSupported();
			return false;
		}
		return sessionStorage.getItem(prefix + key) != null;
	};
	Cnds.prototype.OnQuotaExceeded = function ()
	{
		return true;
	};
	Cnds.prototype.CompareKeyText = function (key, text_to_compare, case_sensitive)
	{
		var value = localStorage.getItem(prefix + key) || "";
		if (case_sensitive)
			return value == text_to_compare;
		else
			return cr.equals_nocase(value, text_to_compare);
	};
	Cnds.prototype.CompareKeyNumber = function (key, cmp, x)
	{
		var value = localStorage.getItem(prefix + key) || "";
		return cr.do_cmp(parseFloat(value), cmp, x);
	};
	pluginProto.cnds = new Cnds();
	function Acts() {};
	Acts.prototype.StoreLocal = function(key, data)
	{
		try {
			localStorage.setItem(prefix + key, data);
		}
		catch (e)
		{
			this.runtime.trigger(cr.plugins_.WebStorage.prototype.cnds.OnQuotaExceeded, this);
		}
	};
	Acts.prototype.StoreSession = function(key,data)
	{
		if (this.runtime.isCocoonJs || !sessionStorage)
		{
			LogSessionNotSupported();
			return;
		}
		try {
			sessionStorage.setItem(prefix + key, data);
		}
		catch (e)
		{
			this.runtime.trigger(cr.plugins_.WebStorage.prototype.cnds.OnQuotaExceeded, this);
		}
	};
	Acts.prototype.RemoveLocal = function(key)
	{
		localStorage.removeItem(prefix + key);
	};
	Acts.prototype.RemoveSession = function(key)
	{
		if (this.runtime.isCocoonJs || !sessionStorage)
		{
			LogSessionNotSupported();
			return;
		}
		sessionStorage.removeItem(prefix + key);
	};
	Acts.prototype.ClearLocal = function()
	{
		if (!is_arcade)
			localStorage.clear();
	};
	Acts.prototype.ClearSession = function()
	{
		if (this.runtime.isCocoonJs || !sessionStorage)
		{
			LogSessionNotSupported();
			return;
		}
		if (!is_arcade)
			sessionStorage.clear();
	};
	Acts.prototype.JSONLoad = function (json_, mode_)
	{
		var d;
		try {
			d = JSON.parse(json_);
		}
		catch(e) { return; }
		if (!d["c2dictionary"])			// presumably not a c2dictionary object
			return;
		var o = d["data"];
		if (mode_ === 0 && !is_arcade)	// 'set' mode: must clear webstorage first
			localStorage.clear();
		var p;
		for (p in o)
		{
			if (o.hasOwnProperty(p))
			{
				try {
					localStorage.setItem(prefix + p, o[p]);
				}
				catch (e)
				{
					this.runtime.trigger(cr.plugins_.WebStorage.prototype.cnds.OnQuotaExceeded, this);
					return;
				}
			}
		}
	};
	pluginProto.acts = new Acts();
	function Exps() {};
	Exps.prototype.LocalValue = function(ret,key)
	{
		ret.set_string(localStorage.getItem(prefix + key) || "");
	};
	Exps.prototype.SessionValue = function(ret,key)
	{
		if (this.runtime.isCocoonJs || !sessionStorage)
		{
			LogSessionNotSupported();
			ret.set_string("");
			return;
		}
		ret.set_string(sessionStorage.getItem(prefix + key) || "");
	};
	Exps.prototype.LocalCount = function(ret)
	{
		ret.set_int(is_arcade ? 0 : localStorage.length);
	};
	Exps.prototype.SessionCount = function(ret)
	{
		if (this.runtime.isCocoonJs || !sessionStorage)
		{
			LogSessionNotSupported();
			ret.set_int(0);
			return;
		}
		ret.set_int(is_arcade ? 0 : sessionStorage.length);
	};
	Exps.prototype.LocalAt = function(ret,n)
	{
		if (is_arcade)
			ret.set_string("");
		else
			ret.set_string(localStorage.getItem(localStorage.key(n)) || "");
	};
	Exps.prototype.SessionAt = function(ret,n)
	{
		if (this.runtime.isCocoonJs || !sessionStorage)
		{
			LogSessionNotSupported();
			ret.set_string("");
			return;
		}
		if (is_arcade)
			ret.set_string("");
		else
			ret.set_string(sessionStorage.getItem(sessionStorage.key(n)) || "");
	};
	Exps.prototype.LocalKeyAt = function(ret,n)
	{
		if (is_arcade)
			ret.set_string("");
		else
			ret.set_string(localStorage.key(n) || "");
	};
	Exps.prototype.SessionKeyAt = function(ret,n)
	{
		if (this.runtime.isCocoonJs || !sessionStorage)
		{
			LogSessionNotSupported();
			ret.set_string("");
			return;
		}
		if (is_arcade)
			ret.set_string("");
		else
			ret.set_string(sessionStorage.key(n) || "");
	};
	Exps.prototype.AsJSON = function (ret)
	{
		var o = {}, i, len, k;
		for (i = 0, len = localStorage.length; i < len; i++)
		{
			k = localStorage.key(i);
			if (is_arcade)
			{
				if (k.substr(0, prefix.length) === prefix)
				{
					o[k.substr(prefix.length)] = localStorage.getItem(k);
				}
			}
			else
				o[k] = localStorage.getItem(k);
		}
		ret.set_string(JSON.stringify({
			"c2dictionary": true,
			"data": o
		}));
	};
	pluginProto.exps = new Exps();
}());
;
;
cr.behaviors.Bullet = function(runtime)
{
	this.runtime = runtime;
};
(function ()
{
	var behaviorProto = cr.behaviors.Bullet.prototype;
	behaviorProto.Type = function(behavior, objtype)
	{
		this.behavior = behavior;
		this.objtype = objtype;
		this.runtime = behavior.runtime;
	};
	var behtypeProto = behaviorProto.Type.prototype;
	behtypeProto.onCreate = function()
	{
	};
	behaviorProto.Instance = function(type, inst)
	{
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;				// associated object instance to modify
		this.runtime = type.runtime;
	};
	var behinstProto = behaviorProto.Instance.prototype;
	behinstProto.onCreate = function()
	{
		var speed = this.properties[0];
		this.acc = this.properties[1];
		this.g = this.properties[2];
		this.bounceOffSolid = (this.properties[3] !== 0);
		this.setAngle = (this.properties[4] !== 0);
		this.dx = Math.cos(this.inst.angle) * speed;
		this.dy = Math.sin(this.inst.angle) * speed;
		this.lastx = this.inst.x;
		this.lasty = this.inst.y;
		this.lastKnownAngle = this.inst.angle;
		this.travelled = 0;
		this.enabled = (this.properties[5] !== 0);
	};
	behinstProto.saveToJSON = function ()
	{
		return {
			"acc": this.acc,
			"g": this.g,
			"dx": this.dx,
			"dy": this.dy,
			"lx": this.lastx,
			"ly": this.lasty,
			"lka": this.lastKnownAngle,
			"t": this.travelled,
			"e": this.enabled
		};
	};
	behinstProto.loadFromJSON = function (o)
	{
		this.acc = o["acc"];
		this.g = o["g"];
		this.dx = o["dx"];
		this.dy = o["dy"];
		this.lastx = o["lx"];
		this.lasty = o["ly"];
		this.lastKnownAngle = o["lka"];
		this.travelled = o["t"];
		this.enabled = o["e"];
	};
	behinstProto.tick = function ()
	{
		if (!this.enabled)
			return;
		var dt = this.runtime.getDt(this.inst);
		var s, a;
		var bounceSolid, bounceAngle;
		if (this.inst.angle !== this.lastKnownAngle)
		{
			if (this.setAngle)
			{
				s = cr.distanceTo(0, 0, this.dx, this.dy);
				this.dx = Math.cos(this.inst.angle) * s;
				this.dy = Math.sin(this.inst.angle) * s;
			}
			this.lastKnownAngle = this.inst.angle;
		}
		if (this.acc !== 0)
		{
			s = cr.distanceTo(0, 0, this.dx, this.dy);
			if (this.dx === 0 && this.dy === 0)
				a = this.inst.angle;
			else
				a = cr.angleTo(0, 0, this.dx, this.dy);
			s += this.acc * dt;
			if (s < 0)
				s = 0;
			this.dx = Math.cos(a) * s;
			this.dy = Math.sin(a) * s;
		}
		if (this.g !== 0)
			this.dy += this.g * dt;
		this.lastx = this.inst.x;
		this.lasty = this.inst.y;
		if (this.dx !== 0 || this.dy !== 0)
		{
			this.inst.x += this.dx * dt;
			this.inst.y += this.dy * dt;
			this.travelled += cr.distanceTo(0, 0, this.dx * dt, this.dy * dt)
			if (this.setAngle)
			{
				this.inst.angle = cr.angleTo(0, 0, this.dx, this.dy);
				this.inst.set_bbox_changed();
				this.lastKnownAngle = this.inst.angle;
			}
			this.inst.set_bbox_changed();
			if (this.bounceOffSolid)
			{
				bounceSolid = this.runtime.testOverlapSolid(this.inst);
				if (bounceSolid)
				{
					this.runtime.registerCollision(this.inst, bounceSolid);
					s = cr.distanceTo(0, 0, this.dx, this.dy);
					bounceAngle = this.runtime.calculateSolidBounceAngle(this.inst, this.lastx, this.lasty);
					this.dx = Math.cos(bounceAngle) * s;
					this.dy = Math.sin(bounceAngle) * s;
					this.inst.x += this.dx * dt;			// move out for one tick since the object can't have spent a tick in the solid
					this.inst.y += this.dy * dt;
					this.inst.set_bbox_changed();
					if (this.setAngle)
					{
						this.inst.angle = bounceAngle;
						this.lastKnownAngle = bounceAngle;
						this.inst.set_bbox_changed();
					}
					if (!this.runtime.pushOutSolid(this.inst, this.dx / s, this.dy / s, Math.max(s * 2.5 * dt, 30)))
						this.runtime.pushOutSolidNearest(this.inst, 100);
				}
			}
		}
	};
	function Cnds() {};
	Cnds.prototype.CompareSpeed = function (cmp, s)
	{
		return cr.do_cmp(cr.distanceTo(0, 0, this.dx, this.dy), cmp, s);
	};
	Cnds.prototype.CompareTravelled = function (cmp, d)
	{
		return cr.do_cmp(this.travelled, cmp, d);
	};
	behaviorProto.cnds = new Cnds();
	function Acts() {};
	Acts.prototype.SetSpeed = function (s)
	{
		var a = cr.angleTo(0, 0, this.dx, this.dy);
		this.dx = Math.cos(a) * s;
		this.dy = Math.sin(a) * s;
	};
	Acts.prototype.SetAcceleration = function (a)
	{
		this.acc = a;
	};
	Acts.prototype.SetGravity = function (g)
	{
		this.g = g;
	};
	Acts.prototype.SetAngleOfMotion = function (a)
	{
		a = cr.to_radians(a);
		var s = cr.distanceTo(0, 0, this.dx, this.dy)
		this.dx = Math.cos(a) * s;
		this.dy = Math.sin(a) * s;
	};
	Acts.prototype.Bounce = function (objtype)
	{
		if (!objtype)
			return;
		var otherinst = objtype.getFirstPicked(this.inst);
		if (!otherinst)
			return;
		var dt = this.runtime.getDt(this.inst);
		var s = cr.distanceTo(0, 0, this.dx, this.dy);
		var bounceAngle = this.runtime.calculateSolidBounceAngle(this.inst, this.lastx, this.lasty, otherinst);
		this.dx = Math.cos(bounceAngle) * s;
		this.dy = Math.sin(bounceAngle) * s;
		this.inst.x += this.dx * dt;			// move out for one tick since the object can't have spent a tick in the solid
		this.inst.y += this.dy * dt;
		this.inst.set_bbox_changed();
		if (this.setAngle)
		{
			this.inst.angle = bounceAngle;
			this.lastKnownAngle = bounceAngle;
			this.inst.set_bbox_changed();
		}
		if (this.bounceOffSolid)
		{
			if (!this.runtime.pushOutSolid(this.inst, this.dx / s, this.dy / s, Math.max(s * 2.5 * dt, 30)))
				this.runtime.pushOutSolidNearest(this.inst, 100);
		}
		else
		{
			this.runtime.pushOut(this.inst, this.dx / s, this.dy / s, Math.max(s * 2.5 * dt, 30), otherinst)
		}
	};
	Acts.prototype.SetEnabled = function (en)
	{
		this.enabled = (en === 1);
	};
	behaviorProto.acts = new Acts();
	function Exps() {};
	Exps.prototype.Speed = function (ret)
	{
		var s = cr.distanceTo(0, 0, this.dx, this.dy);
		s = cr.round6dp(s);
		ret.set_float(s);
	};
	Exps.prototype.Acceleration = function (ret)
	{
		ret.set_float(this.acc);
	};
	Exps.prototype.AngleOfMotion = function (ret)
	{
		ret.set_float(cr.to_degrees(cr.angleTo(0, 0, this.dx, this.dy)));
	};
	Exps.prototype.DistanceTravelled = function (ret)
	{
		ret.set_float(this.travelled);
	};
	behaviorProto.exps = new Exps();
}());
;
;
cr.behaviors.Fade = function(runtime)
{
	this.runtime = runtime;
};
(function ()
{
	var behaviorProto = cr.behaviors.Fade.prototype;
	behaviorProto.Type = function(behavior, objtype)
	{
		this.behavior = behavior;
		this.objtype = objtype;
		this.runtime = behavior.runtime;
	};
	var behtypeProto = behaviorProto.Type.prototype;
	behtypeProto.onCreate = function()
	{
	};
	behaviorProto.Instance = function(type, inst)
	{
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;				// associated object instance to modify
		this.runtime = type.runtime;
	};
	var behinstProto = behaviorProto.Instance.prototype;
	behinstProto.onCreate = function()
	{
		var active_at_start = this.properties[0] === 1;
		this.fadeInTime = this.properties[1];
		this.waitTime = this.properties[2];
		this.fadeOutTime = this.properties[3];
		this.destroy = this.properties[4];			// 0 = no, 1 = after fade out
		this.stage = active_at_start ? 0 : 3;		// 0 = fade in, 1 = wait, 2 = fade out, 3 = done
		if (this.recycled)
			this.stageTime.reset();
		else
			this.stageTime = new cr.KahanAdder();
		this.maxOpacity = (this.inst.opacity ? this.inst.opacity : 1.0);
		if (active_at_start)
		{
			if (this.fadeInTime === 0)
			{
				this.stage = 1;
				if (this.waitTime === 0)
					this.stage = 2;
			}
			else
			{
				this.inst.opacity = 0;
				this.runtime.redraw = true;
			}
		}
	};
	behinstProto.saveToJSON = function ()
	{
		return {
			"fit": this.fadeInTime,
			"wt": this.waitTime,
			"fot": this.fadeOutTime,
			"s": this.stage,
			"st": this.stageTime.sum,
			"mo": this.maxOpacity,
		};
	};
	behinstProto.loadFromJSON = function (o)
	{
		this.fadeInTime = o["fit"];
		this.waitTime = o["wt"];
		this.fadeOutTime = o["fot"];
		this.stage = o["s"];
		this.stageTime.reset();
		this.stageTime.sum = o["st"];
		this.maxOpacity = o["mo"];
	};
	behinstProto.tick = function ()
	{
		this.stageTime.add(this.runtime.getDt(this.inst));
		if (this.stage === 0)
		{
			this.inst.opacity = (this.stageTime.sum / this.fadeInTime) * this.maxOpacity;
			this.runtime.redraw = true;
			if (this.inst.opacity >= this.maxOpacity)
			{
				this.inst.opacity = this.maxOpacity;
				this.stage = 1;	// wait stage
				this.stageTime.reset();
			}
		}
		if (this.stage === 1)
		{
			if (this.stageTime.sum >= this.waitTime)
			{
				this.stage = 2;	// fade out stage
				this.stageTime.reset();
			}
		}
		if (this.stage === 2)
		{
			if (this.fadeOutTime !== 0)
			{
				this.inst.opacity = this.maxOpacity - ((this.stageTime.sum / this.fadeOutTime) * this.maxOpacity);
				this.runtime.redraw = true;
				if (this.inst.opacity < 0)
				{
					this.inst.opacity = 0;
					this.stage = 3;	// done
					this.stageTime.reset();
					this.runtime.trigger(cr.behaviors.Fade.prototype.cnds.OnFadeOutEnd, this.inst);
					if (this.destroy === 1)
						this.runtime.DestroyInstance(this.inst);
				}
			}
		}
	};
	behinstProto.doStart = function ()
	{
		this.stage = 0;
		this.stageTime.reset();
		if (this.fadeInTime === 0)
		{
			this.stage = 1;
			if (this.waitTime === 0)
				this.stage = 2;
		}
		else
		{
			this.inst.opacity = 0;
			this.runtime.redraw = true;
		}
	};
	function Cnds() {};
	Cnds.prototype.OnFadeOutEnd = function ()
	{
		return true;
	};
	behaviorProto.cnds = new Cnds();
	function Acts() {};
	Acts.prototype.StartFade = function ()
	{
		if (this.stage === 3)
			this.doStart();
	};
	Acts.prototype.RestartFade = function ()
	{
		this.doStart();
	};
	behaviorProto.acts = new Acts();
}());
;
;
cr.behaviors.Flash = function(runtime)
{
	this.runtime = runtime;
};
(function ()
{
	var behaviorProto = cr.behaviors.Flash.prototype;
	behaviorProto.Type = function(behavior, objtype)
	{
		this.behavior = behavior;
		this.objtype = objtype;
		this.runtime = behavior.runtime;
	};
	var behtypeProto = behaviorProto.Type.prototype;
	behtypeProto.onCreate = function()
	{
	};
	behaviorProto.Instance = function(type, inst)
	{
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;				// associated object instance to modify
		this.runtime = type.runtime;
	};
	var behinstProto = behaviorProto.Instance.prototype;
	behinstProto.onCreate = function()
	{
		this.ontime = 0;
		this.offtime = 0;
		this.stage = 0;			// 0 = on, 1 = off
		this.stagetimeleft = 0;
		this.timeleft = 0;
	};
	behinstProto.saveToJSON = function ()
	{
		return {
			"ontime": this.ontime,
			"offtime": this.offtime,
			"stage": this.stage,
			"stagetimeleft": this.stagetimeleft,
			"timeleft": this.timeleft
		};
	};
	behinstProto.loadFromJSON = function (o)
	{
		this.ontime = o["ontime"];
		this.offtime = o["offtime"];
		this.stage = o["stage"];
		this.stagetimeleft = o["stagetimeleft"];
		this.timeleft = o["timeleft"];
	};
	behinstProto.tick = function ()
	{
		if (this.timeleft <= 0)
			return;		// not flashing
		var dt = this.runtime.getDt(this.inst);
		this.timeleft -= dt;
		if (this.timeleft <= 0)
		{
			this.timeleft = 0;
			this.inst.visible = true;
			this.runtime.redraw = true;
			this.runtime.trigger(cr.behaviors.Flash.prototype.cnds.OnFlashEnded, this.inst);
			return;
		}
		this.stagetimeleft -= dt;
		if (this.stagetimeleft <= 0)
		{
			if (this.stage === 0)
			{
				this.inst.visible = false;
				this.stage = 1;
				this.stagetimeleft += this.offtime;
			}
			else
			{
				this.inst.visible = true;
				this.stage = 0;
				this.stagetimeleft += this.ontime;
			}
			this.runtime.redraw = true;
		}
	};
	function Cnds() {};
	Cnds.prototype.IsFlashing = function ()
	{
		return this.timeleft > 0;
	};
	Cnds.prototype.OnFlashEnded = function ()
	{
		return true;
	};
	behaviorProto.cnds = new Cnds();
	function Acts() {};
	Acts.prototype.Flash = function (on_, off_, dur_)
	{
		this.ontime = on_;
		this.offtime = off_;
		this.stage = 1;		// always start off
		this.stagetimeleft = off_;
		this.timeleft = dur_;
		this.inst.visible = false;
		this.runtime.redraw = true;
	};
	Acts.prototype.StopFlashing = function ()
	{
		this.timeleft = 0;
		this.inst.visible = true;
		this.runtime.redraw = true;
		return;
	};
	behaviorProto.acts = new Acts();
	function Exps() {};
	behaviorProto.exps = new Exps();
}());
;
;
cr.behaviors.LOS = function(runtime)
{
	this.runtime = runtime;
};
(function ()
{
	var behaviorProto = cr.behaviors.LOS.prototype;
	behaviorProto.Type = function(behavior, objtype)
	{
		this.behavior = behavior;
		this.objtype = objtype;
		this.runtime = behavior.runtime;
	};
	var behtypeProto = behaviorProto.Type.prototype;
	behtypeProto.onCreate = function()
	{
		this.obstacleTypes = [];						// object types to check for as obstructions
	};
	behtypeProto.findLosBehavior = function (inst)
	{
		var i, len, b;
		for (i = 0, len = inst.behavior_insts.length; i < len; ++i)
		{
			b = inst.behavior_insts[i];
			if (b instanceof cr.behaviors.LOS.prototype.Instance && b.type === this)
				return b;
		}
		return null;
	};
	behaviorProto.Instance = function(type, inst)
	{
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;				// associated object instance to modify
		this.runtime = type.runtime;
	};
	var behinstProto = behaviorProto.Instance.prototype;
	behinstProto.onCreate = function()
	{
		this.obstacleMode = this.properties[0];		// 0 = solids, 1 = custom
		this.range = this.properties[1];
		this.cone = cr.to_radians(this.properties[2]);
		this.useCollisionCells = (this.properties[3] !== 0);
	};
	behinstProto.onDestroy = function ()
	{
	};
	behinstProto.saveToJSON = function ()
	{
		var o = {
			"r": this.range,
			"c": this.cone,
			"t": []
		};
		var i, len;
		for (i = 0, len = this.type.obstacleTypes.length; i < len; i++)
		{
			o["t"].push(this.type.obstacleTypes[i].sid);
		}
		return o;
	};
	behinstProto.loadFromJSON = function (o)
	{
		this.range = o["r"];
		this.cone = o["c"];
		this.type.obstacleTypes.length = 0;
		var i, len, t;
		for (i = 0, len = o["t"].length; i < len; i++)
		{
			t = this.runtime.getObjectTypeBySid(o["t"][i]);
			if (t)
				this.type.obstacleTypes.push(t);
		}
	};
	behinstProto.tick = function ()
	{
	};
	var candidates = [];
	var tmpRect = new cr.rect(0, 0, 0, 0);
	behinstProto.hasLOSto = function (x_, y_)
	{
		var startx = this.inst.x;
		var starty = this.inst.y;
		var myangle = this.inst.angle;
		if (this.inst.width < 0)
			myangle += Math.PI;
		if (cr.distanceTo(startx, starty, x_, y_) > this.range)
			return false;		// too far away
		var a = cr.angleTo(startx, starty, x_, y_);
		if (cr.angleDiff(myangle, a) > this.cone / 2)
			return false;		// outside cone of view
		var i, leni, rinst, solid;
		tmpRect.set(startx, starty, x_, y_);
		tmpRect.normalize();
		if (this.obstacleMode === 0)
		{
			if (this.useCollisionCells)
			{
				this.runtime.getSolidCollisionCandidates(this.inst.layer, tmpRect, candidates);
			}
			else
			{
				solid = this.runtime.getSolidBehavior();
				if (solid)
					cr.appendArray(candidates, solid.my_instances.valuesRef());
			}
			for (i = 0, leni = candidates.length; i < leni; ++i)
			{
				rinst = candidates[i];
				if (!rinst.extra.solidEnabled || rinst === this.inst)
					continue;
				if (this.runtime.testSegmentOverlap(startx, starty, x_, y_, rinst))
				{
					candidates.length = 0;
					return false;
				}
			}
		}
		else
		{
			if (this.useCollisionCells)
			{
				this.runtime.getTypesCollisionCandidates(this.inst.layer, this.type.obstacleTypes, tmpRect, candidates);
			}
			else
			{
				for (i = 0, leni = this.type.obstacleTypes.length; i < leni; ++i)
				{
					cr.appendArray(candidates, this.type.obstacleTypes[i].instances);
				}
			}
			for (i = 0, leni = candidates.length; i < leni; ++i)
			{
				rinst = candidates[i];
				if (rinst === this.inst)
					continue;
				if (this.runtime.testSegmentOverlap(startx, starty, x_, y_, rinst))
				{
					candidates.length = 0;
					return false;
				}
			}
		}
		candidates.length = 0;
		return true;
	};
	function Cnds() {};
	var ltopick = new cr.ObjectSet();
	var rtopick = new cr.ObjectSet();
	Cnds.prototype.HasLOSToObject = function (obj_)
	{
		if (!obj_)
			return false;
		var i, j, leni, lenj, linst, losbeh, rinst, pick;
		var lsol = this.objtype.getCurrentSol();
		var rsol = obj_.getCurrentSol();
		var linstances = lsol.getObjects();
		var rinstances = rsol.getObjects();
		if (lsol.select_all)
			lsol.else_instances.length = 0;
		if (rsol.select_all)
			rsol.else_instances.length = 0;
		var inverted = this.runtime.getCurrentCondition().inverted;
		for (i = 0, leni = linstances.length; i < leni; ++i)
		{
			linst = linstances[i];
			pick = false;
			losbeh = this.findLosBehavior(linst);
;
			for (j = 0, lenj = rinstances.length; j < lenj; ++j)
			{
				rinst = rinstances[j];
				if (cr.xor(losbeh.hasLOSto(rinst.x, rinst.y), inverted))
				{
					pick = true;
					rtopick.add(rinst);
				}
			}
			if (pick)
				ltopick.add(linst);
		}
		var lpicks = ltopick.valuesRef();
		var rpicks = rtopick.valuesRef();
		lsol.select_all = false;
		rsol.select_all = false;
		cr.shallowAssignArray(lsol.instances, lpicks);
		cr.shallowAssignArray(rsol.instances, rpicks);
		ltopick.clear();
		rtopick.clear();
		return lsol.hasObjects();
	};
	Cnds.prototype.HasLOSToPosition = function (x_, y_)
	{
		return this.hasLOSto(x_, y_);
	};
	behaviorProto.cnds = new Cnds();
	function Acts() {};
	Acts.prototype.SetRange = function (r)
	{
		this.range = r;
	};
	Acts.prototype.SetCone = function (c)
	{
		this.cone = cr.to_radians(c);
	};
	Acts.prototype.AddObstacle = function (obj_)
	{
		var obstacleTypes = this.type.obstacleTypes;
		if (obstacleTypes.indexOf(obj_) !== -1)
			return;
		var i, len, t;
		for (i = 0, len = obstacleTypes.length; i < len; i++)
		{
			t = obstacleTypes[i];
			if (t.is_family && t.members.indexOf(obj_) !== -1)
				return;
		}
		obstacleTypes.push(obj_);
	};
	Acts.prototype.ClearObstacles = function ()
	{
		this.type.obstacleTypes.length = 0;
	};
	behaviorProto.acts = new Acts();
	function Exps() {};
	Exps.prototype.Range = function (ret)
	{
		ret.set_float(this.range);
	};
	Exps.prototype.ConeOfView = function (ret)
	{
		ret.set_float(cr.to_degrees(this.cone));
	};
	behaviorProto.exps = new Exps();
}());
;
;
cr.behaviors.Pin = function(runtime)
{
	this.runtime = runtime;
};
(function ()
{
	var behaviorProto = cr.behaviors.Pin.prototype;
	behaviorProto.Type = function(behavior, objtype)
	{
		this.behavior = behavior;
		this.objtype = objtype;
		this.runtime = behavior.runtime;
	};
	var behtypeProto = behaviorProto.Type.prototype;
	behtypeProto.onCreate = function()
	{
	};
	behaviorProto.Instance = function(type, inst)
	{
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;				// associated object instance to modify
		this.runtime = type.runtime;
	};
	var behinstProto = behaviorProto.Instance.prototype;
	behinstProto.onCreate = function()
	{
		this.pinObject = null;
		this.pinObjectUid = -1;		// for loading
		this.pinAngle = 0;
		this.pinDist = 0;
		this.myStartAngle = 0;
		this.theirStartAngle = 0;
		this.lastKnownAngle = 0;
		this.mode = 0;				// 0 = position & angle; 1 = position; 2 = angle; 3 = rope; 4 = bar
		var self = this;
		if (!this.recycled)
		{
			this.myDestroyCallback = (function(inst) {
													self.onInstanceDestroyed(inst);
												});
		}
		this.runtime.addDestroyCallback(this.myDestroyCallback);
	};
	behinstProto.saveToJSON = function ()
	{
		return {
			"uid": this.pinObject ? this.pinObject.uid : -1,
			"pa": this.pinAngle,
			"pd": this.pinDist,
			"msa": this.myStartAngle,
			"tsa": this.theirStartAngle,
			"lka": this.lastKnownAngle,
			"m": this.mode
		};
	};
	behinstProto.loadFromJSON = function (o)
	{
		this.pinObjectUid = o["uid"];		// wait until afterLoad to look up
		this.pinAngle = o["pa"];
		this.pinDist = o["pd"];
		this.myStartAngle = o["msa"];
		this.theirStartAngle = o["tsa"];
		this.lastKnownAngle = o["lka"];
		this.mode = o["m"];
	};
	behinstProto.afterLoad = function ()
	{
		if (this.pinObjectUid === -1)
			this.pinObject = null;
		else
		{
			this.pinObject = this.runtime.getObjectByUID(this.pinObjectUid);
;
		}
		this.pinObjectUid = -1;
	};
	behinstProto.onInstanceDestroyed = function (inst)
	{
		if (this.pinObject == inst)
			this.pinObject = null;
	};
	behinstProto.onDestroy = function()
	{
		this.pinObject = null;
		this.runtime.removeDestroyCallback(this.myDestroyCallback);
	};
	behinstProto.tick = function ()
	{
	};
	behinstProto.tick2 = function ()
	{
		if (!this.pinObject)
			return;
		if (this.lastKnownAngle !== this.inst.angle)
			this.myStartAngle = cr.clamp_angle(this.myStartAngle + (this.inst.angle - this.lastKnownAngle));
		var newx = this.inst.x;
		var newy = this.inst.y;
		if (this.mode === 3 || this.mode === 4)		// rope mode or bar mode
		{
			var dist = cr.distanceTo(this.inst.x, this.inst.y, this.pinObject.x, this.pinObject.y);
			if ((dist > this.pinDist) || (this.mode === 4 && dist < this.pinDist))
			{
				var a = cr.angleTo(this.pinObject.x, this.pinObject.y, this.inst.x, this.inst.y);
				newx = this.pinObject.x + Math.cos(a) * this.pinDist;
				newy = this.pinObject.y + Math.sin(a) * this.pinDist;
			}
		}
		else
		{
			newx = this.pinObject.x + Math.cos(this.pinObject.angle + this.pinAngle) * this.pinDist;
			newy = this.pinObject.y + Math.sin(this.pinObject.angle + this.pinAngle) * this.pinDist;
		}
		var newangle = cr.clamp_angle(this.myStartAngle + (this.pinObject.angle - this.theirStartAngle));
		this.lastKnownAngle = newangle;
		if ((this.mode === 0 || this.mode === 1 || this.mode === 3 || this.mode === 4)
			&& (this.inst.x !== newx || this.inst.y !== newy))
		{
			this.inst.x = newx;
			this.inst.y = newy;
			this.inst.set_bbox_changed();
		}
		if ((this.mode === 0 || this.mode === 2) && (this.inst.angle !== newangle))
		{
			this.inst.angle = newangle;
			this.inst.set_bbox_changed();
		}
	};
	function Cnds() {};
	Cnds.prototype.IsPinned = function ()
	{
		return !!this.pinObject;
	};
	behaviorProto.cnds = new Cnds();
	function Acts() {};
	Acts.prototype.Pin = function (obj, mode_)
	{
		if (!obj)
			return;
		var otherinst = obj.getFirstPicked(this.inst);
		if (!otherinst)
			return;
		this.pinObject = otherinst;
		this.pinAngle = cr.angleTo(otherinst.x, otherinst.y, this.inst.x, this.inst.y) - otherinst.angle;
		this.pinDist = cr.distanceTo(otherinst.x, otherinst.y, this.inst.x, this.inst.y);
		this.myStartAngle = this.inst.angle;
		this.lastKnownAngle = this.inst.angle;
		this.theirStartAngle = otherinst.angle;
		this.mode = mode_;
	};
	Acts.prototype.Unpin = function ()
	{
		this.pinObject = null;
	};
	behaviorProto.acts = new Acts();
	function Exps() {};
	Exps.prototype.PinnedUID = function (ret)
	{
		ret.set_int(this.pinObject ? this.pinObject.uid : -1);
	};
	behaviorProto.exps = new Exps();
}());
;
;
cr.behaviors.Platform = function(runtime)
{
	this.runtime = runtime;
};
(function ()
{
	var behaviorProto = cr.behaviors.Platform.prototype;
	behaviorProto.Type = function(behavior, objtype)
	{
		this.behavior = behavior;
		this.objtype = objtype;
		this.runtime = behavior.runtime;
	};
	var behtypeProto = behaviorProto.Type.prototype;
	behtypeProto.onCreate = function()
	{
	};
	var ANIMMODE_STOPPED = 0;
	var ANIMMODE_MOVING = 1;
	var ANIMMODE_JUMPING = 2;
	var ANIMMODE_FALLING = 3;
	behaviorProto.Instance = function(type, inst)
	{
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;				// associated object instance to modify
		this.runtime = type.runtime;
		this.leftkey = false;
		this.rightkey = false;
		this.jumpkey = false;
		this.jumped = false;			// prevent bunnyhopping
		this.ignoreInput = false;
		this.simleft = false;
		this.simright = false;
		this.simjump = false;
		this.lastFloorObject = null;
		this.loadFloorObject = -1;
		this.lastFloorX = 0;
		this.lastFloorY = 0;
		this.floorIsJumpthru = false;
		this.animMode = ANIMMODE_STOPPED;
		this.fallthrough = 0;			// fall through jump-thru.  >0 to disable, lasts a few ticks
		this.firstTick = true;
		this.dx = 0;
		this.dy = 0;
	};
	var behinstProto = behaviorProto.Instance.prototype;
	behinstProto.updateGravity = function()
	{
		this.downx = Math.cos(this.ga);
		this.downy = Math.sin(this.ga);
		this.rightx = Math.cos(this.ga - Math.PI / 2);
		this.righty = Math.sin(this.ga - Math.PI / 2);
		this.downx = cr.round6dp(this.downx);
		this.downy = cr.round6dp(this.downy);
		this.rightx = cr.round6dp(this.rightx);
		this.righty = cr.round6dp(this.righty);
		this.g1 = this.g;
		if (this.g < 0)
		{
			this.downx *= -1;
			this.downy *= -1;
			this.g = Math.abs(this.g);
		}
	};
	behinstProto.onCreate = function()
	{
		this.maxspeed = this.properties[0];
		this.acc = this.properties[1];
		this.dec = this.properties[2];
		this.jumpStrength = this.properties[3];
		this.g = this.properties[4];
		this.g1 = this.g;
		this.maxFall = this.properties[5];
		this.defaultControls = (this.properties[6] === 1);	// 0=no, 1=yes
		this.enabled = (this.properties[7] !== 0);
		this.wasOnFloor = false;
		this.wasOverJumpthru = this.runtime.testOverlapJumpThru(this.inst);
		this.ga = cr.to_radians(90);
		this.updateGravity();
		var self = this;
		if (this.defaultControls && !this.runtime.isDomFree)
		{
			jQuery(document).keydown(function(info) {
						self.onKeyDown(info);
					});
			jQuery(document).keyup(function(info) {
						self.onKeyUp(info);
					});
		}
		if (!this.recycled)
		{
			this.myDestroyCallback = function(inst) {
										self.onInstanceDestroyed(inst);
									};
		}
		this.runtime.addDestroyCallback(this.myDestroyCallback);
	};
	behinstProto.saveToJSON = function ()
	{
		return {
			"ii": this.ignoreInput,
			"lfx": this.lastFloorX,
			"lfy": this.lastFloorY,
			"lfo": (this.lastFloorObject ? this.lastFloorObject.uid : -1),
			"am": this.animMode,
			"en": this.enabled,
			"fall": this.fallthrough,
			"ft": this.firstTick,
			"dx": this.dx,
			"dy": this.dy,
			"ms": this.maxspeed,
			"acc": this.acc,
			"dec": this.dec,
			"js": this.jumpStrength,
			"g": this.g,
			"g1": this.g1,
			"mf": this.maxFall,
			"wof": this.wasOnFloor,
			"woj": this.wasOverJumpthru,
			"ga": this.ga
		};
	};
	behinstProto.loadFromJSON = function (o)
	{
		this.ignoreInput = o["ii"];
		this.lastFloorX = o["lfx"];
		this.lastFloorY = o["lfy"];
		this.loadFloorObject = o["lfo"];
		this.animMode = o["am"];
		this.enabled = o["en"];
		this.fallthrough = o["fall"];
		this.firstTick = o["ft"];
		this.dx = o["dx"];
		this.dy = o["dy"];
		this.maxspeed = o["ms"];
		this.acc = o["acc"];
		this.dec = o["dec"];
		this.jumpStrength = o["js"];
		this.g = o["g"];
		this.g1 = o["g1"];
		this.maxFall = o["mf"];
		this.wasOnFloor = o["wof"];
		this.wasOverJumpthru = o["woj"];
		this.ga = o["ga"];
		this.leftkey = false;
		this.rightkey = false;
		this.jumpkey = false;
		this.jumped = false;
		this.simleft = false;
		this.simright = false;
		this.simjump = false;
		this.updateGravity();
	};
	behinstProto.afterLoad = function ()
	{
		if (this.loadFloorObject === -1)
			this.lastFloorObject = null;
		else
			this.lastFloorObject = this.runtime.getObjectByUID(this.loadFloorObject);
	};
	behinstProto.onInstanceDestroyed = function (inst)
	{
		if (this.lastFloorObject == inst)
			this.lastFloorObject = null;
	};
	behinstProto.onDestroy = function ()
	{
		this.lastFloorObject = null;
		this.runtime.removeDestroyCallback(this.myDestroyCallback);
	};
	behinstProto.onKeyDown = function (info)
	{
		switch (info.which) {
		case 38:	// up
			info.preventDefault();
			this.jumpkey = true;
			break;
		case 37:	// left
			info.preventDefault();
			this.leftkey = true;
			break;
		case 39:	// right
			info.preventDefault();
			this.rightkey = true;
			break;
		}
	};
	behinstProto.onKeyUp = function (info)
	{
		switch (info.which) {
		case 38:	// up
			info.preventDefault();
			this.jumpkey = false;
			this.jumped = false;
			break;
		case 37:	// left
			info.preventDefault();
			this.leftkey = false;
			break;
		case 39:	// right
			info.preventDefault();
			this.rightkey = false;
			break;
		}
	};
	behinstProto.getGDir = function ()
	{
		if (this.g < 0)
			return -1;
		else
			return 1;
	};
	behinstProto.isOnFloor = function ()
	{
		var ret = null;
		var ret2 = null;
		var i, len, j;
		var oldx = this.inst.x;
		var oldy = this.inst.y;
		this.inst.x += this.downx;
		this.inst.y += this.downy;
		this.inst.set_bbox_changed();
		if (this.lastFloorObject && this.runtime.testOverlap(this.inst, this.lastFloorObject))
		{
			this.inst.x = oldx;
			this.inst.y = oldy;
			this.inst.set_bbox_changed();
			return this.lastFloorObject;
		}
		else
		{
			ret = this.runtime.testOverlapSolid(this.inst);
			if (!ret && this.fallthrough === 0)
				ret2 = this.runtime.testOverlapJumpThru(this.inst, true);
			this.inst.x = oldx;
			this.inst.y = oldy;
			this.inst.set_bbox_changed();
			if (ret)		// was overlapping solid
			{
				if (this.runtime.testOverlap(this.inst, ret))
					return null;
				else
				{
					this.floorIsJumpthru = false;
					return ret;
				}
			}
			if (ret2 && ret2.length)
			{
				for (i = 0, j = 0, len = ret2.length; i < len; i++)
				{
					ret2[j] = ret2[i];
					if (!this.runtime.testOverlap(this.inst, ret2[i]))
						j++;
				}
				if (j >= 1)
				{
					this.floorIsJumpthru = true;
					return ret2[0];
				}
			}
			return null;
		}
	};
	behinstProto.tick = function ()
	{
	};
	behinstProto.posttick = function ()
	{
		var dt = this.runtime.getDt(this.inst);
		var mx, my, obstacle, mag, allover, i, len, j, oldx, oldy;
		if (!this.jumpkey && !this.simjump)
			this.jumped = false;
		var left = this.leftkey || this.simleft;
		var right = this.rightkey || this.simright;
		var jump = (this.jumpkey || this.simjump) && !this.jumped;
		this.simleft = false;
		this.simright = false;
		this.simjump = false;
		if (!this.enabled)
			return;
		if (this.ignoreInput)
		{
			left = false;
			right = false;
			jump = false;
		}
		var lastFloor = this.lastFloorObject;
		var floor_moved = false;
		if (this.firstTick)
		{
			if (this.runtime.testOverlapSolid(this.inst) || this.runtime.testOverlapJumpThru(this.inst))
			{
				this.runtime.pushOutSolid(this.inst, -this.downx, -this.downy, 4, true);
			}
			this.firstTick = false;
		}
		if (lastFloor && this.dy === 0 && (lastFloor.y !== this.lastFloorY || lastFloor.x !== this.lastFloorX))
		{
			mx = (lastFloor.x - this.lastFloorX);
			my = (lastFloor.y - this.lastFloorY);
			this.inst.x += mx;
			this.inst.y += my;
			this.inst.set_bbox_changed();
			this.lastFloorX = lastFloor.x;
			this.lastFloorY = lastFloor.y;
			floor_moved = true;
			if (this.runtime.testOverlapSolid(this.inst))
			{
				this.runtime.pushOutSolid(this.inst, -mx, -my, Math.sqrt(mx * mx + my * my) * 2.5);
			}
		}
		var floor_ = this.isOnFloor();
		var collobj = this.runtime.testOverlapSolid(this.inst);
		if (collobj)
		{
			if (this.runtime.pushOutSolidNearest(this.inst, Math.max(this.inst.width, this.inst.height) / 2))
				this.runtime.registerCollision(this.inst, collobj);
			else
				return;
		}
		if (floor_)
		{
			if (this.dy > 0)
			{
				if (!this.wasOnFloor)
				{
					this.runtime.pushInFractional(this.inst, -this.downx, -this.downy, floor_, 16);
					this.wasOnFloor = true;
				}
				this.dy = 0;
			}
			if (lastFloor != floor_)
			{
				this.lastFloorObject = floor_;
				this.lastFloorX = floor_.x;
				this.lastFloorY = floor_.y;
				this.runtime.registerCollision(this.inst, floor_);
			}
			else if (floor_moved)
			{
				collobj = this.runtime.testOverlapSolid(this.inst);
				if (collobj)
				{
					this.runtime.registerCollision(this.inst, collobj);
					if (mx !== 0)
					{
						if (mx > 0)
							this.runtime.pushOutSolid(this.inst, -this.rightx, -this.righty);
						else
							this.runtime.pushOutSolid(this.inst, this.rightx, this.righty);
					}
					this.runtime.pushOutSolid(this.inst, -this.downx, -this.downy);
				}
			}
			if (jump)
			{
				oldx = this.inst.x;
				oldy = this.inst.y;
				this.inst.x -= this.downx;
				this.inst.y -= this.downy;
				this.inst.set_bbox_changed();
				if (!this.runtime.testOverlapSolid(this.inst))
				{
					this.runtime.trigger(cr.behaviors.Platform.prototype.cnds.OnJump, this.inst);
					this.animMode = ANIMMODE_JUMPING;
					this.dy = -this.jumpStrength;
					this.jumped = true;
				}
				else
					jump = false;
				this.inst.x = oldx;
				this.inst.y = oldy;
				this.inst.set_bbox_changed();
			}
		}
		else
		{
			this.lastFloorObject = null;
			this.dy += this.g * dt;
			if (this.dy > this.maxFall)
				this.dy = this.maxFall;
			if (jump)
				this.jumped = true;
		}
		this.wasOnFloor = !!floor_;
		if (left == right)	// both up or both down
		{
			if (this.dx < 0)
			{
				this.dx += this.dec * dt;
				if (this.dx > 0)
					this.dx = 0;
			}
			else if (this.dx > 0)
			{
				this.dx -= this.dec * dt;
				if (this.dx < 0)
					this.dx = 0;
			}
		}
		if (left && !right)
		{
			if (this.dx > 0)
				this.dx -= (this.acc + this.dec) * dt;
			else
				this.dx -= this.acc * dt;
		}
		if (right && !left)
		{
			if (this.dx < 0)
				this.dx += (this.acc + this.dec) * dt;
			else
				this.dx += this.acc * dt;
		}
		if (this.dx > this.maxspeed)
			this.dx = this.maxspeed;
		else if (this.dx < -this.maxspeed)
			this.dx = -this.maxspeed;
		var landed = false;
		if (this.dx !== 0)
		{
			oldx = this.inst.x;
			oldy = this.inst.y;
			mx = this.dx * dt * this.rightx;
			my = this.dx * dt * this.righty;
			this.inst.x += this.rightx * (this.dx > 1 ? 1 : -1) - this.downx;
			this.inst.y += this.righty * (this.dx > 1 ? 1 : -1) - this.downy;
			this.inst.set_bbox_changed();
			var is_jumpthru = false;
			var slope_too_steep = this.runtime.testOverlapSolid(this.inst);
			/*
			if (!slope_too_steep && floor_)
			{
				slope_too_steep = this.runtime.testOverlapJumpThru(this.inst);
				is_jumpthru = true;
				if (slope_too_steep)
				{
					this.inst.x = oldx;
					this.inst.y = oldy;
					this.inst.set_bbox_changed();
					if (this.runtime.testOverlap(this.inst, slope_too_steep))
					{
						slope_too_steep = null;
						is_jumpthru = false;
					}
				}
			}
			*/
			this.inst.x = oldx + mx;
			this.inst.y = oldy + my;
			this.inst.set_bbox_changed();
			obstacle = this.runtime.testOverlapSolid(this.inst);
			if (!obstacle && floor_)
			{
				obstacle = this.runtime.testOverlapJumpThru(this.inst);
				if (obstacle)
				{
					this.inst.x = oldx;
					this.inst.y = oldy;
					this.inst.set_bbox_changed();
					if (this.runtime.testOverlap(this.inst, obstacle))
					{
						obstacle = null;
						is_jumpthru = false;
					}
					else
						is_jumpthru = true;
					this.inst.x = oldx + mx;
					this.inst.y = oldy + my;
					this.inst.set_bbox_changed();
				}
			}
			if (obstacle)
			{
				var push_dist = Math.abs(this.dx * dt) + 2;
				if (slope_too_steep || !this.runtime.pushOutSolid(this.inst, -this.downx, -this.downy, push_dist, is_jumpthru, obstacle))
				{
					this.runtime.registerCollision(this.inst, obstacle);
					push_dist = Math.max(Math.abs(this.dx * dt * 2.5), 30);
					if (!this.runtime.pushOutSolid(this.inst, this.rightx * (this.dx < 0 ? 1 : -1), this.righty * (this.dx < 0 ? 1 : -1), push_dist, false))
					{
						this.inst.x = oldx;
						this.inst.y = oldy;
						this.inst.set_bbox_changed();
					}
					else if (floor_ && !is_jumpthru && !this.floorIsJumpthru)
					{
						oldx = this.inst.x;
						oldy = this.inst.y;
						this.inst.x += this.downx;
						this.inst.y += this.downy;
						if (this.runtime.testOverlapSolid(this.inst))
						{
							if (!this.runtime.pushOutSolid(this.inst, -this.downx, -this.downy, 3, false))
							{
								this.inst.x = oldx;
								this.inst.y = oldy;
								this.inst.set_bbox_changed();
							}
						}
						else
						{
							this.inst.x = oldx;
							this.inst.y = oldy;
							this.inst.set_bbox_changed();
						}
					}
					if (!is_jumpthru)
						this.dx = 0;	// stop
				}
				else if (!slope_too_steep && Math.abs(this.dy) < 15)
				{
					this.dy = 0;
					if (!floor_)
						landed = true;
				}
			}
			else
			{
				var newfloor = this.isOnFloor();
				if (floor_ && !newfloor)
				{
					mag = Math.ceil(Math.abs(this.dx * dt)) + 2;
					oldx = this.inst.x;
					oldy = this.inst.y;
					this.inst.x += this.downx * mag;
					this.inst.y += this.downy * mag;
					this.inst.set_bbox_changed();
					if (this.runtime.testOverlapSolid(this.inst) || this.runtime.testOverlapJumpThru(this.inst))
						this.runtime.pushOutSolid(this.inst, -this.downx, -this.downy, mag + 2, true);
					else
					{
						this.inst.x = oldx;
						this.inst.y = oldy;
						this.inst.set_bbox_changed();
					}
				}
				else if (newfloor && this.dy === 0)
				{
					this.runtime.pushInFractional(this.inst, -this.downx, -this.downy, newfloor, 16);
				}
			}
		}
		if (this.dy !== 0)
		{
			oldx = this.inst.x;
			oldy = this.inst.y;
			this.inst.x += this.dy * dt * this.downx;
			this.inst.y += this.dy * dt * this.downy;
			var newx = this.inst.x;
			var newy = this.inst.y;
			this.inst.set_bbox_changed();
			collobj = this.runtime.testOverlapSolid(this.inst);
			var fell_on_jumpthru = false;
			if (!collobj && (this.dy > 0) && !floor_)
			{
				allover = this.fallthrough > 0 ? null : this.runtime.testOverlapJumpThru(this.inst, true);
				if (allover && allover.length)
				{
					if (this.wasOverJumpthru)
					{
						this.inst.x = oldx;
						this.inst.y = oldy;
						this.inst.set_bbox_changed();
						for (i = 0, j = 0, len = allover.length; i < len; i++)
						{
							allover[j] = allover[i];
							if (!this.runtime.testOverlap(this.inst, allover[i]))
								j++;
						}
						allover.length = j;
						this.inst.x = newx;
						this.inst.y = newy;
						this.inst.set_bbox_changed();
					}
					if (allover.length >= 1)
						collobj = allover[0];
				}
				fell_on_jumpthru = !!collobj;
			}
			if (collobj)
			{
				this.runtime.registerCollision(this.inst, collobj);
				var push_dist = (fell_on_jumpthru ? Math.abs(this.dy * dt * 2.5 + 10) : Math.max(Math.abs(this.dy * dt * 2.5 + 10), 30));
				if (!this.runtime.pushOutSolid(this.inst, this.downx * (this.dy < 0 ? 1 : -1), this.downy * (this.dy < 0 ? 1 : -1), push_dist, fell_on_jumpthru, collobj))
				{
					this.inst.x = oldx;
					this.inst.y = oldy;
					this.inst.set_bbox_changed();
					this.wasOnFloor = true;		// prevent adjustment for unexpected floor landings
					if (!fell_on_jumpthru)
						this.dy = 0;	// stop
				}
				else
				{
					this.lastFloorObject = collobj;
					this.lastFloorX = collobj.x;
					this.lastFloorY = collobj.y;
					this.floorIsJumpthru = fell_on_jumpthru;
					if (fell_on_jumpthru)
						landed = true;
					this.dy = 0;	// stop
				}
			}
		}
		if (this.animMode !== ANIMMODE_FALLING && this.dy > 0 && !floor_)
		{
			this.runtime.trigger(cr.behaviors.Platform.prototype.cnds.OnFall, this.inst);
			this.animMode = ANIMMODE_FALLING;
		}
		if (floor_ || landed)
		{
			if (this.animMode === ANIMMODE_FALLING || landed || (jump && this.dy === 0))
			{
				this.runtime.trigger(cr.behaviors.Platform.prototype.cnds.OnLand, this.inst);
				if (this.dx === 0 && this.dy === 0)
					this.animMode = ANIMMODE_STOPPED;
				else
					this.animMode = ANIMMODE_MOVING;
			}
			else
			{
				if (this.animMode !== ANIMMODE_STOPPED && this.dx === 0 && this.dy === 0)
				{
					this.runtime.trigger(cr.behaviors.Platform.prototype.cnds.OnStop, this.inst);
					this.animMode = ANIMMODE_STOPPED;
				}
				if (this.animMode !== ANIMMODE_MOVING && (this.dx !== 0 || this.dy !== 0) && !jump)
				{
					this.runtime.trigger(cr.behaviors.Platform.prototype.cnds.OnMove, this.inst);
					this.animMode = ANIMMODE_MOVING;
				}
			}
		}
		if (this.fallthrough > 0)
			this.fallthrough--;
		this.wasOverJumpthru = this.runtime.testOverlapJumpThru(this.inst);
	};
	function Cnds() {};
	Cnds.prototype.IsMoving = function ()
	{
		return this.dx !== 0 || this.dy !== 0;
	};
	Cnds.prototype.CompareSpeed = function (cmp, s)
	{
		var speed = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
		return cr.do_cmp(speed, cmp, s);
	};
	Cnds.prototype.IsOnFloor = function ()
	{
		if (this.dy !== 0)
			return false;
		var ret = null;
		var ret2 = null;
		var i, len, j;
		var oldx = this.inst.x;
		var oldy = this.inst.y;
		this.inst.x += this.downx;
		this.inst.y += this.downy;
		this.inst.set_bbox_changed();
		ret = this.runtime.testOverlapSolid(this.inst);
		if (!ret && this.fallthrough === 0)
			ret2 = this.runtime.testOverlapJumpThru(this.inst, true);
		this.inst.x = oldx;
		this.inst.y = oldy;
		this.inst.set_bbox_changed();
		if (ret)		// was overlapping solid
		{
			return !this.runtime.testOverlap(this.inst, ret);
		}
		if (ret2 && ret2.length)
		{
			for (i = 0, j = 0, len = ret2.length; i < len; i++)
			{
				ret2[j] = ret2[i];
				if (!this.runtime.testOverlap(this.inst, ret2[i]))
					j++;
			}
			if (j >= 1)
				return true;
		}
		return false;
	};
	Cnds.prototype.IsByWall = function (side)
	{
		var ret = false;
		var oldx = this.inst.x;
		var oldy = this.inst.y;
		this.inst.x -= this.downx * 3;
		this.inst.y -= this.downy * 3;
		this.inst.set_bbox_changed();
		if (this.runtime.testOverlapSolid(this.inst))
		{
			this.inst.x = oldx;
			this.inst.y = oldy;
			this.inst.set_bbox_changed();
			return false;
		}
		if (side === 0)		// left
		{
			this.inst.x -= this.rightx * 2;
			this.inst.y -= this.righty * 2;
		}
		else
		{
			this.inst.x += this.rightx * 2;
			this.inst.y += this.righty * 2;
		}
		this.inst.set_bbox_changed();
		ret = this.runtime.testOverlapSolid(this.inst);
		this.inst.x = oldx;
		this.inst.y = oldy;
		this.inst.set_bbox_changed();
		return ret;
	};
	Cnds.prototype.IsJumping = function ()
	{
		return this.dy < 0;
	};
	Cnds.prototype.IsFalling = function ()
	{
		return this.dy > 0;
	};
	Cnds.prototype.OnJump = function ()
	{
		return true;
	};
	Cnds.prototype.OnFall = function ()
	{
		return true;
	};
	Cnds.prototype.OnStop = function ()
	{
		return true;
	};
	Cnds.prototype.OnMove = function ()
	{
		return true;
	};
	Cnds.prototype.OnLand = function ()
	{
		return true;
	};
	behaviorProto.cnds = new Cnds();
	function Acts() {};
	Acts.prototype.SetIgnoreInput = function (ignoring)
	{
		this.ignoreInput = ignoring;
	};
	Acts.prototype.SetMaxSpeed = function (maxspeed)
	{
		this.maxspeed = maxspeed;
		if (this.maxspeed < 0)
			this.maxspeed = 0;
	};
	Acts.prototype.SetAcceleration = function (acc)
	{
		this.acc = acc;
		if (this.acc < 0)
			this.acc = 0;
	};
	Acts.prototype.SetDeceleration = function (dec)
	{
		this.dec = dec;
		if (this.dec < 0)
			this.dec = 0;
	};
	Acts.prototype.SetJumpStrength = function (js)
	{
		this.jumpStrength = js;
		if (this.jumpStrength < 0)
			this.jumpStrength = 0;
	};
	Acts.prototype.SetGravity = function (grav)
	{
		if (this.g1 === grav)
			return;		// no change
		this.g = grav;
		this.updateGravity();
		if (this.runtime.testOverlapSolid(this.inst))
		{
			this.runtime.pushOutSolid(this.inst, this.downx, this.downy, 10);
			this.inst.x += this.downx * 2;
			this.inst.y += this.downy * 2;
			this.inst.set_bbox_changed();
		}
		this.lastFloorObject = null;
	};
	Acts.prototype.SetMaxFallSpeed = function (mfs)
	{
		this.maxFall = mfs;
		if (this.maxFall < 0)
			this.maxFall = 0;
	};
	Acts.prototype.SimulateControl = function (ctrl)
	{
		switch (ctrl) {
		case 0:		this.simleft = true;	break;
		case 1:		this.simright = true;	break;
		case 2:		this.simjump = true;	break;
		}
	};
	Acts.prototype.SetVectorX = function (vx)
	{
		this.dx = vx;
	};
	Acts.prototype.SetVectorY = function (vy)
	{
		this.dy = vy;
	};
	Acts.prototype.SetGravityAngle = function (a)
	{
		a = cr.to_radians(a);
		a = cr.clamp_angle(a);
		if (this.ga === a)
			return;		// no change
		this.ga = a;
		this.updateGravity();
		this.lastFloorObject = null;
	};
	Acts.prototype.SetEnabled = function (en)
	{
		if (this.enabled !== (en === 1))
		{
			this.enabled = (en === 1);
			if (!this.enabled)
				this.lastFloorObject = null;
		}
	};
	Acts.prototype.FallThrough = function ()
	{
		var oldx = this.inst.x;
		var oldy = this.inst.y;
		this.inst.x += this.downx;
		this.inst.y += this.downy;
		this.inst.set_bbox_changed();
		var overlaps = this.runtime.testOverlapJumpThru(this.inst, false);
		this.inst.x = oldx;
		this.inst.y = oldy;
		this.inst.set_bbox_changed();
		if (!overlaps)
			return;
		this.fallthrough = 3;			// disable jumpthrus for 3 ticks (1 doesn't do it, 2 does, 3 to be on safe side)
		this.lastFloorObject = null;
	};
	behaviorProto.acts = new Acts();
	function Exps() {};
	Exps.prototype.Speed = function (ret)
	{
		ret.set_float(Math.sqrt(this.dx * this.dx + this.dy * this.dy));
	};
	Exps.prototype.MaxSpeed = function (ret)
	{
		ret.set_float(this.maxspeed);
	};
	Exps.prototype.Acceleration = function (ret)
	{
		ret.set_float(this.acc);
	};
	Exps.prototype.Deceleration = function (ret)
	{
		ret.set_float(this.dec);
	};
	Exps.prototype.JumpStrength = function (ret)
	{
		ret.set_float(this.jumpStrength);
	};
	Exps.prototype.Gravity = function (ret)
	{
		ret.set_float(this.g);
	};
	Exps.prototype.GravityAngle = function (ret)
	{
		ret.set_float(cr.to_degrees(this.ga));
	};
	Exps.prototype.MaxFallSpeed = function (ret)
	{
		ret.set_float(this.maxFall);
	};
	Exps.prototype.MovingAngle = function (ret)
	{
		ret.set_float(cr.to_degrees(Math.atan2(this.dy, this.dx)));
	};
	Exps.prototype.VectorX = function (ret)
	{
		ret.set_float(this.dx);
	};
	Exps.prototype.VectorY = function (ret)
	{
		ret.set_float(this.dy);
	};
	behaviorProto.exps = new Exps();
}());
;
;
cr.behaviors.Timer = function(runtime)
{
	this.runtime = runtime;
};
(function ()
{
	var behaviorProto = cr.behaviors.Timer.prototype;
	behaviorProto.Type = function(behavior, objtype)
	{
		this.behavior = behavior;
		this.objtype = objtype;
		this.runtime = behavior.runtime;
	};
	var behtypeProto = behaviorProto.Type.prototype;
	behtypeProto.onCreate = function()
	{
	};
	behaviorProto.Instance = function(type, inst)
	{
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;				// associated object instance to modify
		this.runtime = type.runtime;
	};
	var behinstProto = behaviorProto.Instance.prototype;
	behinstProto.onCreate = function()
	{
		this.timers = {};
	};
	behinstProto.onDestroy = function ()
	{
		cr.wipe(this.timers);
	};
	behinstProto.saveToJSON = function ()
	{
		var o = {};
		var p, t;
		for (p in this.timers)
		{
			if (this.timers.hasOwnProperty(p))
			{
				t = this.timers[p];
				o[p] = {
					"c": t.current.sum,
					"t": t.total.sum,
					"d": t.duration,
					"r": t.regular
				};
			}
		}
		return o;
	};
	behinstProto.loadFromJSON = function (o)
	{
		this.timers = {};
		var p;
		for (p in o)
		{
			if (o.hasOwnProperty(p))
			{
				this.timers[p] = {
					current: new cr.KahanAdder(),
					total: new cr.KahanAdder(),
					duration: o[p]["d"],
					regular: o[p]["r"]
				};
				this.timers[p].current.sum = o[p]["c"];
				this.timers[p].total.sum = o[p]["t"];
			}
		}
	};
	behinstProto.tick = function ()
	{
		var dt = this.runtime.getDt(this.inst);
		var p, t;
		for (p in this.timers)
		{
			if (this.timers.hasOwnProperty(p))
			{
				t = this.timers[p];
				t.current.add(dt);
				t.total.add(dt);
			}
		}
	};
	behinstProto.tick2 = function ()
	{
		var p, t;
		for (p in this.timers)
		{
			if (this.timers.hasOwnProperty(p))
			{
				t = this.timers[p];
				if (t.current.sum >= t.duration)
				{
					if (t.regular)
						t.current.sum -= t.duration;
					else
						delete this.timers[p];
				}
			}
		}
	};
	function Cnds() {};
	Cnds.prototype.OnTimer = function (tag_)
	{
		tag_ = tag_.toLowerCase();
		var t = this.timers[tag_];
		if (!t)
			return false;
		return t.current.sum >= t.duration;
	};
	behaviorProto.cnds = new Cnds();
	function Acts() {};
	Acts.prototype.StartTimer = function (duration_, type_, tag_)
	{
		this.timers[tag_.toLowerCase()] = {
			current: new cr.KahanAdder(),
			total: new cr.KahanAdder(),
			duration: duration_,
			regular: (type_ === 1)
		};
	};
	Acts.prototype.StopTimer = function (tag_)
	{
		tag_ = tag_.toLowerCase();
		if (this.timers.hasOwnProperty(tag_))
			delete this.timers[tag_];
	};
	behaviorProto.acts = new Acts();
	function Exps() {};
	Exps.prototype.CurrentTime = function (ret, tag_)
	{
		var t = this.timers[tag_.toLowerCase()];
		ret.set_float(t ? t.current.sum : 0);
	};
	Exps.prototype.TotalTime = function (ret, tag_)
	{
		var t = this.timers[tag_.toLowerCase()];
		ret.set_float(t ? t.total.sum : 0);
	};
	Exps.prototype.Duration = function (ret, tag_)
	{
		var t = this.timers[tag_.toLowerCase()];
		ret.set_float(t ? t.duration : 0);
	};
	behaviorProto.exps = new Exps();
}());
;
;
cr.behaviors.jumpthru = function(runtime)
{
	this.runtime = runtime;
};
(function ()
{
	var behaviorProto = cr.behaviors.jumpthru.prototype;
	behaviorProto.Type = function(behavior, objtype)
	{
		this.behavior = behavior;
		this.objtype = objtype;
		this.runtime = behavior.runtime;
	};
	var behtypeProto = behaviorProto.Type.prototype;
	behtypeProto.onCreate = function()
	{
	};
	behaviorProto.Instance = function(type, inst)
	{
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;				// associated object instance to modify
		this.runtime = type.runtime;
	};
	var behinstProto = behaviorProto.Instance.prototype;
	behinstProto.onCreate = function()
	{
		this.inst.extra.jumpthruEnabled = (this.properties[0] !== 0);
	};
	behinstProto.tick = function ()
	{
	};
	function Cnds() {};
	Cnds.prototype.IsEnabled = function ()
	{
		return this.inst.extra.jumpthruEnabled;
	};
	behaviorProto.cnds = new Cnds();
	function Acts() {};
	Acts.prototype.SetEnabled = function (e)
	{
		this.inst.extra.jumpthruEnabled = !!e;
	};
	behaviorProto.acts = new Acts();
}());
;
;
cr.behaviors.scrollto = function(runtime)
{
	this.runtime = runtime;
	this.shakeMag = 0;
	this.shakeStart = 0;
	this.shakeEnd = 0;
	this.shakeMode = 0;
};
(function ()
{
	var behaviorProto = cr.behaviors.scrollto.prototype;
	behaviorProto.Type = function(behavior, objtype)
	{
		this.behavior = behavior;
		this.objtype = objtype;
		this.runtime = behavior.runtime;
	};
	var behtypeProto = behaviorProto.Type.prototype;
	behtypeProto.onCreate = function()
	{
	};
	behaviorProto.Instance = function(type, inst)
	{
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;				// associated object instance to modify
		this.runtime = type.runtime;
	};
	var behinstProto = behaviorProto.Instance.prototype;
	behinstProto.onCreate = function()
	{
		this.enabled = (this.properties[0] !== 0);
	};
	behinstProto.saveToJSON = function ()
	{
		return {
			"smg": this.behavior.shakeMag,
			"ss": this.behavior.shakeStart,
			"se": this.behavior.shakeEnd,
			"smd": this.behavior.shakeMode
		};
	};
	behinstProto.loadFromJSON = function (o)
	{
		this.behavior.shakeMag = o["smg"];
		this.behavior.shakeStart = o["ss"];
		this.behavior.shakeEnd = o["se"];
		this.behavior.shakeMode = o["smd"];
	};
	behinstProto.tick = function ()
	{
	};
	behinstProto.tick2 = function ()
	{
		if (!this.enabled)
			return;
		var all = this.behavior.my_instances.values();
		var sumx = 0, sumy = 0;
		var i, len;
		for (i = 0, len = all.length; i < len; i++)
		{
			sumx += all[i].x;
			sumy += all[i].y;
		}
		var layout = this.inst.layer.layout;
		var now = this.runtime.kahanTime.sum;
		var offx = 0, offy = 0;
		if (now >= this.behavior.shakeStart && now < this.behavior.shakeEnd)
		{
			var mag = this.behavior.shakeMag * Math.min(this.runtime.timescale, 1);
			if (this.behavior.shakeMode === 0)
				mag *= 1 - (now - this.behavior.shakeStart) / (this.behavior.shakeEnd - this.behavior.shakeStart);
			var a = Math.random() * Math.PI * 2;
			var d = Math.random() * mag;
			offx = Math.cos(a) * d;
			offy = Math.sin(a) * d;
		}
		layout.scrollToX(sumx / all.length + offx);
		layout.scrollToY(sumy / all.length + offy);
	};
	function Acts() {};
	Acts.prototype.Shake = function (mag, dur, mode)
	{
		this.behavior.shakeMag = mag;
		this.behavior.shakeStart = this.runtime.kahanTime.sum;
		this.behavior.shakeEnd = this.behavior.shakeStart + dur;
		this.behavior.shakeMode = mode;
	};
	Acts.prototype.SetEnabled = function (e)
	{
		this.enabled = (e !== 0);
	};
	behaviorProto.acts = new Acts();
}());
cr.getProjectModel = function() { return [
	null,
	"Lobby",
	[
	[
		cr.plugins_.Audio,
		true,
		false,
		false,
		false,
		false,
		false,
		false,
		false,
		false
	]
,	[
		cr.plugins_.Browser,
		true,
		false,
		false,
		false,
		false,
		false,
		false,
		false,
		false
	]
,	[
		cr.plugins_.Button,
		false,
		true,
		true,
		true,
		false,
		false,
		false,
		false,
		false
	]
,	[
		cr.plugins_.Function,
		true,
		false,
		false,
		false,
		false,
		false,
		false,
		false,
		false
	]
,	[
		cr.plugins_.Keyboard,
		true,
		false,
		false,
		false,
		false,
		false,
		false,
		false,
		false
	]
,	[
		cr.plugins_.Mouse,
		true,
		false,
		false,
		false,
		false,
		false,
		false,
		false,
		false
	]
,	[
		cr.plugins_.Sprite,
		false,
		true,
		true,
		true,
		true,
		true,
		true,
		true,
		false
	]
,	[
		cr.plugins_.Text,
		false,
		true,
		true,
		true,
		true,
		true,
		true,
		true,
		false
	]
,	[
		cr.plugins_.TextBox,
		false,
		true,
		true,
		true,
		false,
		false,
		false,
		false,
		false
	]
,	[
		cr.plugins_.TiledBg,
		false,
		true,
		true,
		true,
		true,
		true,
		true,
		true,
		true
	]
,	[
		cr.plugins_.Touch,
		true,
		false,
		false,
		false,
		false,
		false,
		false,
		false,
		false
	]
,	[
		cr.plugins_.WebStorage,
		true,
		false,
		false,
		false,
		false,
		false,
		false,
		false,
		false
	]
	],
	[
	[
		"t0",
		cr.plugins_.Sprite,
		false,
		[],
		0,
		0,
		null,
		[
			[
			"Default",
			0,
			false,
			1,
			0,
			false,
			9553899937513102,
			[
				["images/bridgedroplava-sheet0.png", 108231, 333, 117, 111, 73, 1, 0.5045045018196106, 0.5068492889404297,[],[-0.5045045018196106,0.109589695930481,0.4954954981803894,0.09589070081710815,0.4954954981803894,0.4931507110595703,-0.5045045018196106,0.4931507110595703],0],
				["images/bridgedroplava-sheet0.png", 108231, 260, 228, 184, 86, 1, 0.5, 0.5,[],[-0.5,0.1627910137176514,0.5,0.1627910137176514,0.5,0.5,-0.5,0.5],0],
				["images/bridgedroplava-sheet0.png", 108231, 1, 228, 258, 108, 1, 0.5, 0.5,[],[-0.5,0.2407410144805908,0.5,0.2407410144805908,0.5,0.5,-0.5,0.5],0],
				["images/bridgedroplava-sheet0.png", 108231, 1, 117, 331, 110, 1, 0.5015105605125427, 0.5,[],[-0.5015105605125427,0.2681819796562195,0.4984894394874573,0.2681819796562195,0.4984894394874573,0.5,-0.5015105605125427,0.5],0],
				["images/bridgedroplava-sheet0.png", 108231, 1, 1, 404, 115, 1, 0.5, 0.5043478012084961,[],[-0.5,0.3043481707572937,0.5,0.3043481707572937,0.5,0.4956521987915039,-0.5,0.4956521987915039],0]
			]
			]
		],
		[
		],
		false,
		false,
		3800342833201342,
		[],
		null
	]
,	[
		"t1",
		cr.plugins_.Sprite,
		false,
		[],
		1,
		0,
		null,
		[
			[
			"Default",
			0,
			false,
			0,
			0,
			false,
			8754919774112301,
			[
				["images/groundlava-sheet0.png", 705455, 483, 424, 509, 323, 1, 0.5009823441505432, 0.5015479922294617,[],[-0.5,0.1486070156097412,0.442043662071228,0.1486070156097412,0.442043662071228,0.4984520077705383,-0.5,0.4984520077705383],0],
				["images/groundlava-sheet1.png", 366861, 1, 1, 385, 358, 1, 0.501298725605011, 0.5,[],[-0.501298725605011,0.180866003036499,0.498701274394989,0.1815639734268189,0.498701274394989,0.5,-0.501298725605011,0.5],0],
				["images/groundlava-sheet0.png", 705455, 483, 1, 439, 422, 1, 0.5011389255523682, 0.5,[],[-0.4999999701976776,0.2156400084495544,0.3758540749549866,0.2156389951705933,0.3758540749549866,0.4265400171279907,-0.4999999701976776,0.4265409708023071],0],
				["images/groundlava-sheet1.png", 366861, 387, 1, 314, 302, 1, 0.5, 0.5,[],[-0.5,0.1125829815864563,0.5,0.1125829815864563,0.5,0.413906991481781,-0.5,0.4139059782028198],0],
				["images/groundlava-sheet0.png", 705455, 1, 1, 481, 428, 1, 0.5010395050048828, 0.5,[],[-0.5010395050048828,0.2313079833984375,0.4968814849853516,0.2313079833984375,0.4968814849853516,0.4509350061416626,-0.5010395050048828,0.4509339928627014],0],
				["images/groundlava-sheet1.png", 366861, 702, 1, 319, 286, 1, 0.5015674233436585, 0.5,[],[-0.5015674233436585,0.06643402576446533,0.4858935475349426,0.06643402576446533,0.4858935475349426,0.3951039910316467,-0.5015674233436585,0.3951050043106079],0],
				["images/groundlava-sheet0.png", 705455, 356, 748, 200, 225, 1, 0.5, 0.5022222399711609,[],[-0.5,-0.05333325266838074,0.4950000047683716,-0.05333325266838074,0.4950000047683716,0.4755557775497437,-0.5,0.4755557775497437],0],
				["images/groundlava-sheet0.png", 705455, 1, 430, 354, 435, 1, 0.5, 0.5011494159698486,[],[-0.4463276863098145,0.2229875922203064,0.1497179865837097,0.2229886054992676,0.1497179865837097,0.4988505840301514,-0.4463276863098145,0.4988505840301514],0],
				["images/groundlava-sheet0.png", 705455, 356, 430, 111, 157, 1, 0.5045045018196106, 0.5031847357749939,[],[-0.5045045018196106,-0.1273887455463409,0.4954954981803894,-0.1273887455463409,0.4954954981803894,0.458598256111145,-0.5045045018196106,0.4585992693901062],0],
				["images/groundlava-sheet1.png", 366861, 702, 288, 210, 303, 1, 0.5, 0.5016501545906067,[],[-0.4333333075046539,0.1815178394317627,0.08571398258209229,0.1815178394317627,0.08571398258209229,0.4521448612213135,-0.4333333075046539,0.4521458745002747],0]
			]
			]
		],
		[
		[
			"Jumpthru",
			cr.behaviors.jumpthru,
			5197340359262155
		]
		],
		false,
		false,
		4121750381165871,
		[],
		null
	]
,	[
		"t2",
		cr.plugins_.TiledBg,
		false,
		[],
		0,
		0,
		["images/lavaforgound2.png", 342226, 0],
		null,
		[
		],
		false,
		false,
		3160898642189431,
		[],
		null
	]
,	[
		"t3",
		cr.plugins_.TiledBg,
		false,
		[],
		0,
		0,
		["images/lavaforground1.png", 22448, 0],
		null,
		[
		],
		false,
		false,
		3300384843515186,
		[],
		null
	]
,	[
		"t4",
		cr.plugins_.TiledBg,
		false,
		[],
		0,
		0,
		["images/lavafrontbg.png", 50780, 0],
		null,
		[
		],
		false,
		false,
		9434427048507699,
		[],
		null
	]
,	[
		"t5",
		cr.plugins_.TiledBg,
		false,
		[],
		1,
		0,
		["images/tiledbackgroundlava.png", 584712, 1],
		null,
		[
		[
			"ScrollTo",
			cr.behaviors.scrollto,
			8903431190331657
		]
		],
		false,
		false,
		4645923150623833,
		[],
		null
	]
,	[
		"t6",
		cr.plugins_.Sprite,
		false,
		[],
		0,
		0,
		null,
		[
			[
			"Default",
			0,
			false,
			1,
			0,
			false,
			1122814949038142,
			[
				["images/bridgedrop-sheet0.png", 116707, 329, 175, 110, 72, 1, 0.5363636612892151, 0.3888888955116272,[],[],0],
				["images/bridgedrop-sheet0.png", 116707, 329, 102, 182, 72, 1, 0.5, 0.4305555522441864,[],[],0],
				["images/bridgedrop-sheet0.png", 116707, 1, 192, 261, 79, 1, 0.5210728049278259, 0.3544303774833679,[],[-0.5210728049278259,-0.2911392748355866,0.4789271950721741,-0.2911392748355866,0.4789271950721741,0.6455696225166321,-0.5210728049278259,0.6455696225166321],0],
				["images/bridgedrop-sheet0.png", 116707, 1, 102, 327, 89, 1, 0.5259938836097717, 0.4157303273677826,[],[-0.5259938836097717,-0.3370786309242249,0.4740061163902283,-0.3370786309242249,0.4740061163902283,0.584269642829895,-0.5259938836097717,0.584269642829895],0],
				["images/bridgedrop-sheet0.png", 116707, 1, 1, 400, 100, 1, 0.5149999856948853, 0.4799999892711639,[],[-0.5149999856948853,-0.3100000023841858,0.4850000143051148,-0.3100000023841858,0.4850000143051148,0.5199999809265137,-0.5149999856948853,0.5199999809265137],0]
			]
			]
		],
		[
		],
		false,
		false,
		8524068158546906,
		[],
		null
	]
,	[
		"t7",
		cr.plugins_.Sprite,
		false,
		[],
		1,
		0,
		null,
		[
			[
			"Default",
			0,
			false,
			0,
			0,
			false,
			7380235075378514,
			[
				["images/groundnormal-sheet0.png", 633110, 1, 1, 523, 391, 1, 0.5124282836914063, 0.790281355381012,[],[-0.493307888507843,-0.1483383774757385,0.4531547427177429,-0.1483373641967773,0.4531547427177429,0.06393861770629883,-0.4933077692985535,0.06393963098526001],0],
				["images/groundnormal-sheet0.png", 633110, 1, 395, 541, 295, 1, 0.4676524996757507, 0.7389830350875855,[],[-0.4676524996757507,-0.311864048242569,0.5268024802207947,-0.311864048242569,0.5268024802207947,0.01694893836975098,-0.4676524996757507,0.01694893836975098],0],
				["images/groundnormal-sheet0.png", 633110, 543, 395, 441, 337, 1, 0.4648526012897492, 0.7270029783248901,[],[-0.4331066012382507,-0.1750739812850952,0.4875284135341644,-0.1750739812850952,0.4875284135341644,0.100890040397644,-0.4331066012382507,0.100890040397644],0],
				["images/groundnormal-sheet0.png", 633110, 525, 1, 463, 393, 1, 0.4362851083278656, 0.7302799224853516,[],[-0.4017279148101807,-0.1959289312362671,0.5442758798599243,-0.1959289312362671,0.5442768335342407,0.0610690712928772,-0.4017279148101807,0.0610690712928772],0],
				["images/groundnormal-sheet0.png", 633110, 263, 691, 223, 207, 1, 0.5291479825973511, 0.6763284802436829,[],[-0.5156950950622559,-0.3574884831905365,0.4529150128364563,-0.3574874699115753,0.4529150128364563,0.02415454387664795,-0.5156950950622559,0.02415454387664795],0],
				["images/groundnormal-sheet0.png", 633110, 1, 691, 261, 199, 1, 0.5019156932830811, 0.6934673190116882,[],[-0.4559386968612671,-0.4422113299369812,0.4291192889213562,-0.4422113299369812,0.4291192889213562,0.1055276989936829,-0.4559386968612671,0.1055276989936829],0],
				["images/groundnormal-sheet0.png", 633110, 643, 733, 143, 131, 1, 0.4755244851112366, 0.6564885377883911,[],[-0.4615384936332703,-0.3511455357074738,0.4895105361938477,-0.351144552230835,0.4895105361938477,0.1832064390182495,-0.4615384936332703,0.1832064390182495],0],
				["images/groundnormal-sheet0.png", 633110, 487, 733, 155, 155, 1, 0.4516128897666931, 0.7225806713104248,[],[-0.4516128897666931,-0.3741936683654785,0.4838711023330689,-0.3741936683654785,0.4838711023330689,0.2000003457069397,-0.4516128897666931,0.2000003457069397],0]
			]
			]
		],
		[
		[
			"Jumpthru",
			cr.behaviors.jumpthru,
			9116380016981949
		]
		],
		false,
		false,
		1091312512271563,
		[],
		null
	]
,	[
		"t8",
		cr.plugins_.TiledBg,
		false,
		[],
		1,
		0,
		["images/tiledbackground.png", 158985, 1],
		null,
		[
		[
			"ScrollTo",
			cr.behaviors.scrollto,
			5738554804960185
		]
		],
		false,
		false,
		8063809174348956,
		[],
		null
	]
,	[
		"t9",
		cr.plugins_.TiledBg,
		false,
		[],
		0,
		0,
		["images/level1frontbg.png", 272513, 0],
		null,
		[
		],
		false,
		false,
		6345691626366309,
		[],
		null
	]
,	[
		"t10",
		cr.plugins_.TiledBg,
		false,
		[],
		0,
		0,
		["images/palms.png", 988784, 0],
		null,
		[
		],
		false,
		false,
		4119911954372221,
		[],
		null
	]
,	[
		"t11",
		cr.plugins_.Sprite,
		false,
		[6934607661895929,6389642997591994,7628070348984842],
		0,
		0,
		null,
		[
			[
			"Default",
			10,
			true,
			1,
			0,
			false,
			7746847438419052,
			[
				["images/bronzecoin-sheet0.png", 22660, 1, 1, 30, 30, 1, 0.5, 0.5,[],[],0],
				["images/bronzecoin-sheet0.png", 22660, 32, 1, 30, 30, 1, 0.5, 0.5,[],[],0],
				["images/bronzecoin-sheet0.png", 22660, 63, 1, 30, 30, 1, 0.5, 0.5,[],[],0],
				["images/bronzecoin-sheet0.png", 22660, 94, 1, 30, 30, 1, 0.5, 0.5,[],[],0],
				["images/bronzecoin-sheet0.png", 22660, 1, 32, 30, 30, 1, 0.5, 0.5,[],[],0],
				["images/bronzecoin-sheet0.png", 22660, 32, 32, 30, 30, 1, 0.5, 0.5,[],[],0],
				["images/bronzecoin-sheet0.png", 22660, 63, 32, 30, 30, 1, 0.5, 0.5,[],[],0],
				["images/bronzecoin-sheet0.png", 22660, 94, 32, 30, 30, 1, 0.5, 0.5,[],[],0],
				["images/bronzecoin-sheet0.png", 22660, 1, 63, 30, 30, 1, 0.5, 0.5,[],[],0],
				["images/bronzecoin-sheet0.png", 22660, 32, 63, 30, 30, 1, 0.5, 0.5,[],[],0],
				["images/bronzecoin-sheet0.png", 22660, 63, 63, 30, 30, 1, 0.5, 0.5,[],[],0],
				["images/bronzecoin-sheet0.png", 22660, 94, 63, 30, 30, 1, 0.5, 0.5,[],[],0],
				["images/bronzecoin-sheet0.png", 22660, 1, 94, 30, 30, 1, 0.5, 0.5,[],[],0],
				["images/bronzecoin-sheet0.png", 22660, 32, 94, 30, 30, 1, 0.5, 0.5,[],[],0],
				["images/bronzecoin-sheet0.png", 22660, 63, 94, 30, 30, 1, 0.5, 0.5,[],[],0],
				["images/bronzecoin-sheet0.png", 22660, 94, 94, 30, 30, 1, 0.5, 0.5,[],[],0],
				["images/bronzecoin-sheet1.png", 10311, 1, 1, 30, 30, 1, 0.5, 0.5,[],[],0],
				["images/bronzecoin-sheet1.png", 10311, 32, 1, 30, 30, 1, 0.5, 0.5,[],[],0],
				["images/bronzecoin-sheet1.png", 10311, 63, 1, 30, 30, 1, 0.5, 0.5,[],[],0],
				["images/bronzecoin-sheet1.png", 10311, 94, 1, 30, 30, 1, 0.5, 0.5,[],[],0],
				["images/bronzecoin-sheet1.png", 10311, 1, 32, 30, 30, 1, 0.5, 0.5,[],[],0],
				["images/bronzecoin-sheet1.png", 10311, 32, 32, 30, 30, 1, 0.5, 0.5,[],[],0],
				["images/bronzecoin-sheet1.png", 10311, 63, 32, 30, 30, 1, 0.5, 0.5,[],[],0],
				["images/bronzecoin-sheet1.png", 10311, 94, 32, 30, 30, 1, 0.5, 0.5,[],[],0]
			]
			]
		],
		[
		],
		false,
		false,
		7086695457564902,
		[],
		null
	]
,	[
		"t12",
		cr.plugins_.Sprite,
		false,
		[6934607661895929,6389642997591994,7628070348984842],
		0,
		0,
		null,
		[
			[
			"Diamond",
			10,
			true,
			1,
			0,
			false,
			9155292497054914,
			[
				["images/bluediamond-sheet0.png", 24887, 1, 1, 80, 80, 1, 0.5, 0.5,[],[],0],
				["images/bluediamond-sheet0.png", 24887, 82, 1, 80, 80, 1, 0.5, 0.5,[],[],0],
				["images/bluediamond-sheet0.png", 24887, 163, 1, 80, 80, 1, 0.5, 0.5,[],[],0],
				["images/bluediamond-sheet0.png", 24887, 1, 82, 80, 80, 1, 0.5, 0.5,[],[],0],
				["images/bluediamond-sheet0.png", 24887, 82, 82, 80, 80, 1, 0.5, 0.5,[],[],0],
				["images/bluediamond-sheet0.png", 24887, 163, 82, 80, 80, 1, 0.5, 0.5,[],[],0],
				["images/bluediamond-sheet0.png", 24887, 1, 163, 80, 80, 1, 0.5, 0.5,[],[],0],
				["images/bluediamond-sheet0.png", 24887, 82, 163, 80, 80, 1, 0.5, 0.5,[],[],0],
				["images/bluediamond-sheet0.png", 24887, 163, 163, 80, 80, 1, 0.5, 0.5,[],[],0]
			]
			]
		],
		[
		],
		false,
		false,
		5852797485715438,
		[],
		null
	]
,	[
		"t13",
		cr.plugins_.Sprite,
		false,
		[6934607661895929,6389642997591994,7628070348984842],
		0,
		0,
		null,
		[
			[
			"Gold",
			10,
			true,
			1,
			0,
			false,
			355031847413057,
			[
				["images/goldcoin-sheet0.png", 24997, 1, 1, 30, 30, 1, 0.5, 0.5,[],[],0],
				["images/goldcoin-sheet0.png", 24997, 32, 1, 30, 30, 1, 0.5, 0.5,[],[],0],
				["images/goldcoin-sheet0.png", 24997, 63, 1, 30, 30, 1, 0.5, 0.5,[],[],0],
				["images/goldcoin-sheet0.png", 24997, 94, 1, 30, 30, 1, 0.5, 0.5,[],[],0],
				["images/goldcoin-sheet0.png", 24997, 1, 32, 30, 30, 1, 0.5, 0.5,[],[],0],
				["images/goldcoin-sheet0.png", 24997, 32, 32, 30, 30, 1, 0.5, 0.5,[],[],0],
				["images/goldcoin-sheet0.png", 24997, 63, 32, 30, 30, 1, 0.5, 0.5,[],[],0],
				["images/goldcoin-sheet0.png", 24997, 94, 32, 30, 30, 1, 0.5, 0.5,[],[],0],
				["images/goldcoin-sheet0.png", 24997, 1, 63, 30, 30, 1, 0.5, 0.5,[],[],0],
				["images/goldcoin-sheet0.png", 24997, 32, 63, 30, 30, 1, 0.5, 0.5,[],[],0],
				["images/goldcoin-sheet0.png", 24997, 63, 63, 30, 30, 1, 0.5, 0.5,[],[],0],
				["images/goldcoin-sheet0.png", 24997, 94, 63, 30, 30, 1, 0.5, 0.5,[],[],0],
				["images/goldcoin-sheet0.png", 24997, 1, 94, 30, 30, 1, 0.5, 0.5,[],[],0],
				["images/goldcoin-sheet0.png", 24997, 32, 94, 30, 30, 1, 0.5, 0.5,[],[],0],
				["images/goldcoin-sheet0.png", 24997, 63, 94, 30, 30, 1, 0.5, 0.5,[],[],0],
				["images/goldcoin-sheet0.png", 24997, 94, 94, 30, 30, 1, 0.5, 0.5,[],[],0],
				["images/goldcoin-sheet1.png", 10885, 1, 1, 30, 30, 1, 0.5, 0.5,[],[],0],
				["images/goldcoin-sheet1.png", 10885, 32, 1, 30, 30, 1, 0.5, 0.5,[],[],0],
				["images/goldcoin-sheet1.png", 10885, 63, 1, 30, 30, 1, 0.5, 0.5,[],[],0],
				["images/goldcoin-sheet1.png", 10885, 94, 1, 30, 30, 1, 0.5, 0.5,[],[],0],
				["images/goldcoin-sheet1.png", 10885, 1, 32, 30, 30, 1, 0.5, 0.5,[],[],0],
				["images/goldcoin-sheet1.png", 10885, 32, 32, 30, 30, 1, 0.5, 0.5,[],[],0],
				["images/goldcoin-sheet1.png", 10885, 63, 32, 30, 30, 1, 0.5, 0.5,[],[],0],
				["images/goldcoin-sheet1.png", 10885, 94, 32, 30, 30, 1, 0.5, 0.5,[],[],0]
			]
			]
		],
		[
		],
		false,
		false,
		6720562985215241,
		[],
		null
	]
,	[
		"t14",
		cr.plugins_.Sprite,
		false,
		[6934607661895929,6389642997591994,7628070348984842],
		0,
		0,
		null,
		[
			[
			"DiamondRed",
			10,
			true,
			1,
			0,
			false,
			5608762873678855,
			[
				["images/reddiamod-sheet0.png", 24360, 1, 1, 80, 80, 1, 0.5, 0.5,[],[],0],
				["images/reddiamod-sheet0.png", 24360, 82, 1, 80, 80, 1, 0.5, 0.5,[],[],0],
				["images/reddiamod-sheet0.png", 24360, 163, 1, 80, 80, 1, 0.5, 0.5,[],[],0],
				["images/reddiamod-sheet0.png", 24360, 1, 82, 80, 80, 1, 0.5, 0.5,[],[],0],
				["images/reddiamod-sheet0.png", 24360, 82, 82, 80, 80, 1, 0.5, 0.5,[],[],0],
				["images/reddiamod-sheet0.png", 24360, 163, 82, 80, 80, 1, 0.5, 0.5,[],[],0],
				["images/reddiamod-sheet0.png", 24360, 1, 163, 80, 80, 1, 0.5, 0.5,[],[],0],
				["images/reddiamod-sheet0.png", 24360, 82, 163, 80, 80, 1, 0.5, 0.5,[],[],0],
				["images/reddiamod-sheet0.png", 24360, 163, 163, 80, 80, 1, 0.5, 0.5,[],[],0]
			]
			]
		],
		[
		],
		false,
		false,
		371588080838469,
		[],
		null
	]
,	[
		"t15",
		cr.plugins_.Sprite,
		false,
		[6934607661895929,6389642997591994,7628070348984842],
		0,
		0,
		null,
		[
			[
			"Silver",
			10,
			true,
			1,
			0,
			false,
			5489957464455941,
			[
				["images/silvercoin-sheet0.png", 24136, 1, 1, 30, 30, 1, 0.5, 0.5,[],[],0],
				["images/silvercoin-sheet0.png", 24136, 32, 1, 30, 30, 1, 0.5, 0.5,[],[],0],
				["images/silvercoin-sheet0.png", 24136, 63, 1, 30, 30, 1, 0.5, 0.5,[],[],0],
				["images/silvercoin-sheet0.png", 24136, 94, 1, 30, 30, 1, 0.5, 0.5,[],[],0],
				["images/silvercoin-sheet0.png", 24136, 1, 32, 30, 30, 1, 0.5, 0.5,[],[],0],
				["images/silvercoin-sheet0.png", 24136, 32, 32, 30, 30, 1, 0.5, 0.5,[],[],0],
				["images/silvercoin-sheet0.png", 24136, 63, 32, 30, 30, 1, 0.5, 0.5,[],[],0],
				["images/silvercoin-sheet0.png", 24136, 94, 32, 30, 30, 1, 0.5, 0.5,[],[],0],
				["images/silvercoin-sheet0.png", 24136, 1, 63, 30, 30, 1, 0.5, 0.5,[],[],0],
				["images/silvercoin-sheet0.png", 24136, 32, 63, 30, 30, 1, 0.5, 0.5,[],[],0],
				["images/silvercoin-sheet0.png", 24136, 63, 63, 30, 30, 1, 0.5, 0.5,[],[],0],
				["images/silvercoin-sheet0.png", 24136, 94, 63, 30, 30, 1, 0.5, 0.5,[],[],0],
				["images/silvercoin-sheet0.png", 24136, 1, 94, 30, 30, 1, 0.5, 0.5,[],[],0],
				["images/silvercoin-sheet0.png", 24136, 32, 94, 30, 30, 1, 0.5, 0.5,[],[],0],
				["images/silvercoin-sheet0.png", 24136, 63, 94, 30, 30, 1, 0.5, 0.5,[],[],0],
				["images/silvercoin-sheet0.png", 24136, 94, 94, 30, 30, 1, 0.5, 0.5,[],[],0],
				["images/silvercoin-sheet1.png", 10595, 1, 1, 30, 30, 1, 0.5, 0.5,[],[],0],
				["images/silvercoin-sheet1.png", 10595, 32, 1, 30, 30, 1, 0.5, 0.5,[],[],0],
				["images/silvercoin-sheet1.png", 10595, 63, 1, 30, 30, 1, 0.5, 0.5,[],[],0],
				["images/silvercoin-sheet1.png", 10595, 94, 1, 30, 30, 1, 0.5, 0.5,[],[],0],
				["images/silvercoin-sheet1.png", 10595, 1, 32, 30, 30, 1, 0.5, 0.5,[],[],0],
				["images/silvercoin-sheet1.png", 10595, 32, 32, 30, 30, 1, 0.5, 0.5,[],[],0],
				["images/silvercoin-sheet1.png", 10595, 63, 32, 30, 30, 1, 0.5, 0.5,[],[],0],
				["images/silvercoin-sheet1.png", 10595, 94, 32, 30, 30, 1, 0.5, 0.5,[],[],0]
			]
			]
		],
		[
		],
		false,
		false,
		3458645142035734,
		[],
		null
	]
,	[
		"t16",
		cr.plugins_.Sprite,
		false,
		[270994840248709,9001198665811065,1995873529871684,6342858953989168],
		0,
		0,
		null,
		[
			[
			"Default",
			5,
			false,
			1,
			0,
			false,
			5734246921444666,
			[
				["images/coinsspawner-sheet0.png", 555, 0, 0, 20, 20, 1, 0.449999988079071, 0.550000011920929,[],[],0]
			]
			]
		],
		[
		],
		false,
		false,
		1619887602357269,
		[],
		null
	]
,	[
		"t17",
		cr.plugins_.Sprite,
		false,
		[8402327824303473,6095479695682794,6328720658310719,9578525172193539,6246363997393237],
		1,
		0,
		null,
		[
			[
			"FireBall4",
			10,
			true,
			1,
			0,
			false,
			4225858080682683,
			[
				["images/fireball-sheet0.png", 48945, 1, 1, 200, 40, 1, 0.1099999994039536, 0.6000000238418579,[],[],0],
				["images/fireball-sheet0.png", 48945, 1, 42, 200, 40, 1, 0.1099999994039536, 0.6000000238418579,[],[],0],
				["images/fireball-sheet0.png", 48945, 1, 83, 200, 40, 1, 0.1099999994039536, 0.6000000238418579,[],[],0],
				["images/fireball-sheet0.png", 48945, 1, 124, 200, 40, 1, 0.1099999994039536, 0.6000000238418579,[],[],0],
				["images/fireball-sheet0.png", 48945, 1, 165, 200, 40, 1, 0.1099999994039536, 0.6000000238418579,[],[],0],
				["images/fireball-sheet0.png", 48945, 1, 206, 200, 40, 1, 0.1099999994039536, 0.6000000238418579,[],[],0],
				["images/fireball-sheet1.png", 25632, 1, 1, 200, 40, 1, 0.1099999994039536, 0.6000000238418579,[],[],0],
				["images/fireball-sheet1.png", 25632, 1, 42, 200, 40, 1, 0.1099999994039536, 0.6000000238418579,[],[],0],
				["images/fireball-sheet1.png", 25632, 1, 83, 200, 40, 1, 0.1099999994039536, 0.6000000238418579,[],[],0]
			]
			]
		],
		[
		[
			"Pin",
			cr.behaviors.Pin,
			6780054379367611
		]
		],
		false,
		false,
		7466079581958515,
		[],
		null
	]
,	[
		"t18",
		cr.plugins_.Sprite,
		false,
		[8402327824303473,6095479695682794,6328720658310719,9578525172193539,6246363997393237],
		0,
		0,
		null,
		[
			[
			"Ice4",
			10,
			true,
			1,
			0,
			false,
			1397544521698859,
			[
				["images/ice-sheet2.png", 45352, 1, 46, 135, 44, 1, 0.385185182094574, 0.5681818127632141,[],[],0],
				["images/ice-sheet0.png", 48046, 1, 135, 141, 44, 1, 0.4042553305625916, 0.5681818127632141,[],[],0],
				["images/ice-sheet1.png", 47271, 1, 45, 143, 43, 1, 0.4265734255313873, 0.5813953280448914,[],[],0],
				["images/ice-sheet2.png", 45352, 1, 181, 130, 44, 1, 0.3692307770252228, 0.5909090638160706,[],[],0],
				["images/ice-sheet2.png", 45352, 1, 1, 136, 44, 1, 0.3823529481887817, 0.5909090638160706,[],[],0],
				["images/ice-sheet0.png", 48046, 1, 90, 142, 44, 1, 0.401408463716507, 0.5909090638160706,[],[],0],
				["images/ice-sheet0.png", 48046, 1, 46, 146, 43, 1, 0.4178082048892975, 0.604651153087616,[],[],0],
				["images/ice-sheet2.png", 45352, 1, 91, 134, 44, 1, 0.358208954334259, 0.5909090638160706,[],[],0],
				["images/ice-sheet1.png", 47271, 1, 133, 138, 44, 1, 0.3768115937709808, 0.5909090638160706,[],[],0],
				["images/ice-sheet1.png", 47271, 1, 89, 143, 43, 1, 0.3986014127731323, 0.5581395626068115,[],[],0],
				["images/ice-sheet0.png", 48046, 1, 1, 147, 44, 1, 0.4149659872055054, 0.5454545617103577,[],[],0],
				["images/ice-sheet1.png", 47271, 1, 178, 137, 44, 1, 0.3795620501041412, 0.5681818127632141,[],[],0],
				["images/ice-sheet0.png", 48046, 1, 180, 141, 44, 1, 0.4042553305625916, 0.5454545617103577,[],[],0],
				["images/ice-sheet1.png", 47271, 1, 1, 144, 43, 1, 0.4236111044883728, 0.5348837375640869,[],[],0],
				["images/ice-sheet2.png", 45352, 1, 136, 131, 44, 1, 0.3664122223854065, 0.5681818127632141,[],[],0]
			]
			]
		],
		[
		],
		false,
		false,
		8588869573276337,
		[],
		null
	]
,	[
		"t19",
		cr.plugins_.Sprite,
		false,
		[],
		1,
		0,
		null,
		[
			[
			"Psychic4",
			30,
			false,
			1,
			0,
			false,
			3984124230631905,
			[
				["images/psychic-sheet0.png", 1559753, 1975, 1, 16, 16, 1, 0.5, 0.5,[],[],0],
				["images/psychic-sheet0.png", 1559753, 1514, 462, 260, 260, 1, 0.5, 0.5,[],[],0],
				["images/psychic-sheet0.png", 1559753, 1514, 1, 460, 460, 1, 0.5, 0.5,[],[],0],
				["images/psychic-sheet0.png", 1559753, 789, 726, 617, 616, 1, 0.5008103847503662, 0.5,[],[],0],
				["images/psychic-sheet0.png", 1559753, 789, 1, 724, 724, 1, 0.5, 0.5,[],[],0],
				["images/psychic-sheet0.png", 1559753, 1, 1, 787, 788, 1, 0.5006353259086609, 0.5,[],[],0]
			]
			]
		],
		[
		[
			"Pin",
			cr.behaviors.Pin,
			2256608777309217
		]
		],
		false,
		false,
		4341117955288101,
		[],
		null
	]
,	[
		"t20",
		cr.plugins_.Sprite,
		false,
		[8402327824303473,6095479695682794,6328720658310719,9578525172193539,6246363997393237],
		0,
		0,
		null,
		[
			[
			"Tornado4",
			10,
			true,
			1,
			0,
			false,
			2785743370122953,
			[
				["images/tornado-sheet2.png", 57529, 84, 134, 82, 63, 1, 0.1829268336296082, 0.4285714328289032,[],[],0],
				["images/tornado-sheet2.png", 57529, 87, 68, 82, 65, 1, 0.1829268336296082, 0.4153846204280853,[],[],0],
				["images/tornado-sheet2.png", 57529, 170, 68, 82, 65, 1, 0.1829268336296082, 0.4153846204280853,[],[],0],
				["images/tornado-sheet2.png", 57529, 173, 1, 82, 66, 1, 0.1829268336296082, 0.4090909063816071,[],[],0],
				["images/tornado-sheet2.png", 57529, 1, 1, 85, 66, 1, 0.2117647081613541, 0.4090909063816071,[],[],0],
				["images/tornado-sheet1.png", 48955, 94, 68, 88, 66, 1, 0.2386363595724106, 0.4090909063816071,[],[],0],
				["images/tornado-sheet0.png", 50701, 97, 137, 92, 68, 1, 0.27173912525177, 0.3970588147640228,[],[],0],
				["images/tornado-sheet0.png", 50701, 101, 68, 95, 68, 1, 0.2947368323802948, 0.3970588147640228,[],[],0],
				["images/tornado-sheet0.png", 50701, 1, 1, 99, 68, 1, 0.3232323229312897, 0.3970588147640228,[],[],0],
				["images/tornado-sheet1.png", 48955, 90, 135, 88, 65, 1, 0.2386363595724106, 0.4153846204280853,[],[],0],
				["images/tornado-sheet1.png", 48955, 1, 67, 92, 65, 1, 0.27173912525177, 0.4153846204280853,[],[],0],
				["images/tornado-sheet1.png", 48955, 1, 1, 95, 65, 1, 0.2947368323802948, 0.4153846204280853,[],[],0],
				["images/tornado-sheet0.png", 50701, 1, 70, 99, 65, 1, 0.3232323229312897, 0.4153846204280853,[],[],0],
				["images/tornado-sheet2.png", 57529, 1, 68, 85, 65, 1, 0.2117647081613541, 0.4153846204280853,[],[],0],
				["images/tornado-sheet2.png", 57529, 87, 1, 85, 66, 1, 0.2117647081613541, 0.4090909063816071,[],[],0],
				["images/tornado-sheet1.png", 48955, 1, 133, 88, 66, 1, 0.2386363595724106, 0.4090909063816071,[],[],0],
				["images/tornado-sheet1.png", 48955, 97, 1, 92, 66, 1, 0.27173912525177, 0.4090909063816071,[],[],0],
				["images/tornado-sheet0.png", 50701, 1, 136, 95, 66, 1, 0.2947368323802948, 0.4090909063816071,[],[],0],
				["images/tornado-sheet0.png", 50701, 101, 1, 99, 66, 1, 0.3232323229312897, 0.4090909063816071,[],[],0],
				["images/tornado-sheet2.png", 57529, 1, 134, 82, 65, 1, 0.1829268336296082, 0.4153846204280853,[],[],0]
			]
			]
		],
		[
		],
		false,
		false,
		5538434163983718,
		[],
		null
	]
,	[
		"t21",
		cr.plugins_.Sprite,
		false,
		[],
		1,
		0,
		null,
		[
			[
			"Normal",
			5,
			false,
			1,
			0,
			false,
			3810038816216485,
			[
				["images/weaponicon-sheet0.png", 23266, 1, 1, 92, 90, 1, 0.5, 0.5222222208976746,[],[],0]
			]
			]
,			[
			"Tornado",
			5,
			false,
			1,
			0,
			false,
			9390231069975232,
			[
				["images/weaponicon-sheet0.png", 23266, 94, 1, 92, 90, 1, 0.5, 0.5444444417953491,[],[],0]
			]
			]
,			[
			"Fire",
			5,
			false,
			1,
			0,
			false,
			769554163463538,
			[
				["images/weaponicon-sheet0.png", 23266, 1, 92, 92, 90, 1, 0.5, 0.5777778029441834,[],[],0]
			]
			]
,			[
			"Ice",
			0,
			false,
			1,
			0,
			false,
			8708883358804435,
			[
				["images/weaponicon-sheet0.png", 23266, 94, 92, 92, 90, 1, 0.47826087474823, 0.5222222208976746,[],[],0]
			]
			]
,			[
			"Psychic",
			5,
			false,
			1,
			0,
			false,
			6673052695208826,
			[
				["images/weaponicon-sheet1.png", 7864, 0, 0, 92, 90, 1, 0.5, 0.5222222208976746,[],[],0]
			]
			]
		],
		[
		[
			"Flash",
			cr.behaviors.Flash,
			4604418125563354
		]
		],
		false,
		false,
		3231150744555402,
		[],
		null
	]
,	[
		"t22",
		cr.plugins_.Sprite,
		false,
		[8402327824303473,6095479695682794,6328720658310719,9578525172193539,6246363997393237],
		0,
		0,
		null,
		[
			[
			"Default",
			5,
			true,
			1,
			0,
			false,
			9825007742221958,
			[
				["images/shot-sheet0.png", 2506, 1, 1, 51, 50, 1, 0.4901960790157318, 0.6000000238418579,[],[],0],
				["images/shot-sheet0.png", 2506, 1, 52, 51, 48, 1, 0.4901960790157318, 0.6041666865348816,[],[],0],
				["images/shot-sheet1.png", 2577, 1, 48, 50, 44, 1, 0.4799999892711639, 0.6136363744735718,[],[],0],
				["images/shot-sheet1.png", 2577, 1, 1, 51, 46, 1, 0.4901960790157318, 0.6086956262588501,[],[],0],
				["images/shot-sheet1.png", 2577, 53, 1, 51, 46, 1, 0.4901960790157318, 0.6086956262588501,[],[],0],
				["images/shot-sheet0.png", 2506, 53, 52, 51, 48, 1, 0.4901960790157318, 0.6041666865348816,[],[],0],
				["images/shot-sheet0.png", 2506, 53, 1, 51, 50, 1, 0.4901960790157318, 0.6000000238418579,[],[],0]
			]
			]
		],
		[
		],
		false,
		false,
		8327148517956884,
		[],
		null
	]
,	[
		"t23",
		cr.plugins_.Sprite,
		false,
		[8356542050296315],
		0,
		0,
		null,
		[
			[
			"Normal",
			5,
			false,
			1,
			0,
			false,
			6690567107331654,
			[
				["images/weaponcollectable-sheet0.png", 50462, 1, 1, 75, 75, 1, 0.5199999809265137, 0.5199999809265137,[],[],0]
			]
			]
,			[
			"Tornado",
			5,
			false,
			1,
			0,
			false,
			2603221022345444,
			[
				["images/weaponcollectable-sheet0.png", 50462, 77, 1, 75, 75, 1, 0.4933333396911621, 0.7066666483879089,[],[],0]
			]
			]
,			[
			"Fire",
			5,
			false,
			1,
			0,
			false,
			3348883286452217,
			[
				["images/weaponcollectable-sheet0.png", 50462, 153, 1, 75, 75, 1, 0.4399999976158142, 0.7066666483879089,[],[],0]
			]
			]
,			[
			"Ice",
			5,
			false,
			1,
			0,
			false,
			6884909306221512,
			[
				["images/weaponcollectable-sheet0.png", 50462, 1, 77, 75, 75, 1, 0.4933333396911621, 0.7333333492279053,[],[],0]
			]
			]
,			[
			"Psychic",
			5,
			false,
			1,
			0,
			false,
			8848077145296789,
			[
				["images/weaponcollectable-sheet0.png", 50462, 77, 77, 75, 75, 1, 0.4933333396911621, 0.6399999856948853,[],[],0]
			]
			]
		],
		[
		],
		false,
		false,
		769983627457558,
		[],
		null
	]
,	[
		"t24",
		cr.plugins_.Sprite,
		false,
		[],
		1,
		0,
		null,
		[
			[
			"Default",
			5,
			false,
			1,
			0,
			false,
			5977842065740953,
			[
				["images/playershield-sheet0.png", 18561, 0, 0, 150, 150, 1, 0.4933333396911621, 0.5133333206176758,[],[],0]
			]
			]
		],
		[
		[
			"Pin",
			cr.behaviors.Pin,
			7173629860689335
		]
		],
		false,
		false,
		2547495942635284,
		[],
		null
	]
,	[
		"t25",
		cr.plugins_.Sprite,
		false,
		[6726422244531513],
		0,
		0,
		null,
		[
			[
			"Normal",
			5,
			false,
			1,
			0,
			false,
			1862962144762335,
			[
				["images/powerupcollectable-sheet0.png", 59607, 120, 115, 115, 112, 1, 0.4608695507049561, 0.7053571343421936,[],[],0]
			]
			]
,			[
			"Big",
			5,
			false,
			1,
			0,
			false,
			1498312517799068,
			[
				["images/powerupcollectable-sheet0.png", 59607, 121, 1, 117, 113, 1, 0.4786324799060822, 0.6814159154891968,[],[],0]
			]
			]
,			[
			"Shield",
			5,
			false,
			1,
			0,
			false,
			8959267092145432,
			[
				["images/powerupcollectable-sheet1.png", 30258, 116, 1, 112, 111, 1, 0.5178571343421936, 0.7297297120094299,[],[],0]
			]
			]
,			[
			"Magnet",
			5,
			false,
			1,
			0,
			false,
			6741069379893409,
			[
				["images/powerupcollectable-sheet0.png", 59607, 1, 1, 119, 112, 1, 0.4873949587345123, 0.6339285969734192,[],[],0]
			]
			]
,			[
			"Ghost",
			5,
			false,
			1,
			0,
			false,
			5038380422829111,
			[
				["images/powerupcollectable-sheet1.png", 30258, 1, 1, 114, 110, 1, 0.4561403393745422, 0.6818181872367859,[],[],0]
			]
			]
,			[
			"Flight",
			5,
			false,
			1,
			0,
			false,
			8823205840500411,
			[
				["images/powerupcollectable-sheet0.png", 59607, 1, 114, 118, 111, 1, 0.4576271176338196, 0.6936936974525452,[],[],0]
			]
			]
		],
		[
		],
		false,
		false,
		7685044143238339,
		[],
		null
	]
,	[
		"t26",
		cr.plugins_.Sprite,
		false,
		[],
		1,
		0,
		null,
		[
			[
			"Normal",
			5,
			false,
			1,
			0,
			false,
			2289551646333421,
			[
				["images/powerupicon-sheet0.png", 33511, 188, 1, 50, 50, 1, 0.5, 0.5199999809265137,[],[],0]
			]
			]
,			[
			"Big",
			5,
			false,
			1,
			0,
			false,
			7860800138011204,
			[
				["images/powerupicon-sheet0.png", 33511, 1, 1, 93, 90, 1, 0.5161290168762207, 0.5777778029441834,[],[],0]
			]
			]
,			[
			"Shield",
			5,
			false,
			1,
			0,
			false,
			1008323553582032,
			[
				["images/powerupicon-sheet1.png", 8360, 0, 0, 89, 90, 1, 0.483146071434021, 0.5555555820465088,[],[],0]
			]
			]
,			[
			"Magnet",
			5,
			false,
			1,
			0,
			false,
			5259800246641357,
			[
				["images/powerupicon-sheet0.png", 33511, 1, 92, 91, 90, 1, 0.5164835453033447, 0.5555555820465088,[],[],0]
			]
			]
,			[
			"Ghost",
			5,
			false,
			1,
			0,
			false,
			7044786149912571,
			[
				["images/powerupicon-sheet0.png", 33511, 93, 92, 90, 90, 1, 0.4444444477558136, 0.5222222208976746,[],[],0]
			]
			]
,			[
			"Flight",
			5,
			false,
			1,
			0,
			false,
			7431800840569837,
			[
				["images/powerupicon-sheet0.png", 33511, 95, 1, 92, 90, 1, 0.47826087474823, 0.5555555820465088,[],[],0]
			]
			]
		],
		[
		[
			"Flash",
			cr.behaviors.Flash,
			1000315156902411
		]
		],
		false,
		false,
		820824015758004,
		[],
		null
	]
,	[
		"t27",
		cr.plugins_.Sprite,
		false,
		[],
		0,
		0,
		null,
		[
			[
			"Default",
			5,
			false,
			1,
			0,
			false,
			6815350308679051,
			[
				["images/collectablehealth-sheet0.png", 8785, 0, 0, 75, 75, 1, 0.4799999892711639, 0.6133333444595337,[],[],0]
			]
			]
		],
		[
		],
		false,
		false,
		2716980000273946,
		[],
		null
	]
,	[
		"t28",
		cr.plugins_.Sprite,
		false,
		[],
		0,
		0,
		null,
		[
			[
			"Coins",
			5,
			false,
			1,
			0,
			false,
			7912760474639026,
			[
				["images/iconset-sheet1.png", 5343, 0, 0, 62, 64, 1, 0.4838709533214569, 0.53125,[],[-0.1774189472198486,-0.25,0.03225806355476379,-0.328125,0.2258060276508331,-0.234375,0.3064520657062531,-0.046875,0.241936057806015,0.1562499403953552,0.03225806355476379,0.25,-0.1935479640960693,0.171875,-0.2741939425468445,-0.046875],0]
			]
			]
,			[
			"Distance",
			5,
			false,
			1,
			0,
			false,
			5151440598062422,
			[
				["images/iconset-sheet0.png", 6728, 0, 0, 76, 76, 1, 0.5, 0.5789473652839661,[],[-0.1842109858989716,-0.2631583511829376,0,-0.3157893717288971,0.184211015701294,-0.2631583511829376,0.25,-0.07894736528396606,0.184211015701294,0.1052636504173279,0,0.144736647605896,-0.1842109858989716,0.1052636504173279,-0.263157993555069,-0.07894736528396606],0]
			]
			]
		],
		[
		],
		false,
		false,
		1073863609353111,
		[],
		null
	]
,	[
		"t29",
		cr.plugins_.Sprite,
		false,
		[],
		1,
		0,
		null,
		[
			[
			"Default",
			10,
			false,
			1,
			0,
			false,
			5481828415527055,
			[
				["images/aftercollectcoin-sheet0.png", 39108, 1, 1, 150, 150, 1, 0.5, 0.5,[],[],0],
				["images/aftercollectcoin-sheet0.png", 39108, 152, 1, 150, 150, 1, 0.5, 0.5,[],[],0],
				["images/aftercollectcoin-sheet0.png", 39108, 303, 1, 150, 150, 1, 0.5, 0.5,[],[],0],
				["images/aftercollectcoin-sheet0.png", 39108, 1, 152, 150, 150, 1, 0.5, 0.5,[],[],0],
				["images/aftercollectcoin-sheet0.png", 39108, 152, 152, 150, 150, 1, 0.5, 0.5,[],[],0],
				["images/aftercollectcoin-sheet0.png", 39108, 303, 152, 150, 150, 1, 0.5, 0.5,[],[],0],
				["images/aftercollectcoin-sheet0.png", 39108, 1, 303, 150, 150, 1, 0.5, 0.5,[],[],0],
				["images/aftercollectcoin-sheet0.png", 39108, 152, 303, 150, 150, 1, 0.5, 0.5,[],[],0]
			]
			]
		],
		[
		[
			"Fade",
			cr.behaviors.Fade,
			3000036882889938
		]
		],
		false,
		false,
		5674003030315377,
		[],
		null
	]
,	[
		"t30",
		cr.plugins_.Sprite,
		false,
		[],
		1,
		0,
		null,
		[
			[
			"Default",
			10,
			false,
			1,
			0,
			false,
			6308162224937129,
			[
				["images/aftercollectpowerup-sheet0.png", 40067, 1, 1, 150, 150, 1, 0.5, 0.5,[],[],0],
				["images/aftercollectpowerup-sheet0.png", 40067, 152, 1, 150, 150, 1, 0.5, 0.5,[],[],0],
				["images/aftercollectpowerup-sheet0.png", 40067, 303, 1, 150, 150, 1, 0.5, 0.5,[],[],0],
				["images/aftercollectpowerup-sheet0.png", 40067, 1, 152, 150, 150, 1, 0.5, 0.5,[],[],0],
				["images/aftercollectpowerup-sheet0.png", 40067, 152, 152, 150, 150, 1, 0.5, 0.5,[],[],0],
				["images/aftercollectpowerup-sheet0.png", 40067, 303, 152, 150, 150, 1, 0.5, 0.5,[],[],0],
				["images/aftercollectpowerup-sheet0.png", 40067, 1, 303, 150, 150, 1, 0.5, 0.5,[],[],0],
				["images/aftercollectpowerup-sheet0.png", 40067, 152, 303, 150, 150, 1, 0.5, 0.5,[],[],0]
			]
			]
		],
		[
		[
			"Fade",
			cr.behaviors.Fade,
			8269368052444495
		]
		],
		false,
		false,
		2628890716020637,
		[],
		null
	]
,	[
		"t31",
		cr.plugins_.Sprite,
		false,
		[],
		1,
		0,
		null,
		[
			[
			"Default",
			10,
			false,
			1,
			0,
			false,
			9128312653391744,
			[
				["images/aftercollectweapon-sheet0.png", 42076, 1, 1, 150, 150, 1, 0.5, 0.5,[],[],0],
				["images/aftercollectweapon-sheet0.png", 42076, 152, 1, 150, 150, 1, 0.5, 0.5,[],[],0],
				["images/aftercollectweapon-sheet0.png", 42076, 303, 1, 150, 150, 1, 0.5, 0.5,[],[],0],
				["images/aftercollectweapon-sheet0.png", 42076, 1, 152, 150, 150, 1, 0.5, 0.5,[],[],0],
				["images/aftercollectweapon-sheet0.png", 42076, 152, 152, 150, 150, 1, 0.5, 0.5,[],[],0],
				["images/aftercollectweapon-sheet0.png", 42076, 303, 152, 150, 150, 1, 0.5, 0.5,[],[],0],
				["images/aftercollectweapon-sheet0.png", 42076, 1, 303, 150, 150, 1, 0.5, 0.5,[],[],0],
				["images/aftercollectweapon-sheet0.png", 42076, 152, 303, 150, 150, 1, 0.5, 0.5,[],[],0]
			]
			]
		],
		[
		[
			"Fade",
			cr.behaviors.Fade,
			8882501424088339
		]
		],
		false,
		false,
		3423081069687325,
		[],
		null
	]
,	[
		"t32",
		cr.plugins_.Sprite,
		false,
		[2057662351472521],
		0,
		0,
		null,
		[
			[
			"Default",
			5,
			false,
			1,
			0,
			false,
			5376766483899071,
			[
				["images/health1-sheet0.png", 2311, 0, 0, 46, 46, 1, 0.5, 0.5,[],[-0.3043479919433594,-0.3043479919433594,0,-0.3260869979858398,0.3043479919433594,-0.3043479919433594,0.3695650100708008,0,0.2173910140991211,0.2173910140991211,0,0.3260869979858398,-0.2391299903392792,0.2391300201416016,-0.4130434989929199,0],0]
			]
			]
,			[
			"Empty",
			5,
			false,
			1,
			0,
			false,
			2171506391942483,
			[
				["images/health1-sheet1.png", 1839, 0, 0, 46, 46, 1, 0.5, 0.5,[],[],0]
			]
			]
		],
		[
		],
		false,
		false,
		6257273572962249,
		[],
		null
	]
,	[
		"t33",
		cr.plugins_.Text,
		false,
		[],
		0,
		0,
		null,
		null,
		[
		],
		false,
		false,
		7655643081245247,
		[],
		null
	]
,	[
		"t34",
		cr.plugins_.Sprite,
		false,
		[],
		1,
		0,
		null,
		[
			[
			"Default",
			5,
			false,
			1,
			0,
			false,
			5153339254467783,
			[
				["images/controls-sheet0.png", 13831, 0, 0, 255, 123, 1, 0.47843137383461, 0.4552845656871796,[],[-0.1764703691005707,0.1707314550876617,0.01960763335227966,-0.4471544921398163,0.2235296070575714,0.1626014411449432,0.1411766111850739,0.04065042734146118,0.4745096266269684,0.4471544325351715,0.01960763335227966,0.186991423368454,-0.4313725829124451,0.4471544325351715,-0.03529438376426697,0.04065042734146118],0]
			]
			]
		],
		[
		[
			"Timer",
			cr.behaviors.Timer,
			5124207755101345
		]
		],
		false,
		false,
		9677126887226144,
		[],
		null
	]
,	[
		"t35",
		cr.plugins_.Text,
		false,
		[],
		0,
		0,
		null,
		null,
		[
		],
		false,
		false,
		4058506682065283,
		[],
		null
	]
,	[
		"t36",
		cr.plugins_.Sprite,
		false,
		[],
		0,
		0,
		null,
		[
			[
			"Default",
			5,
			false,
			1,
			0,
			false,
			5956038561860026,
			[
				["images/jump-sheet0.png", 2390, 0, 0, 130, 127, 1, 0.5, 0.5039370059967041,[],[-0.300000011920929,-0.2992129921913147,0,-0.4330708980560303,0.29230797290802,-0.2913390100002289,0.3923079967498779,-0.007874011993408203,0.2692310214042664,0.2598429918289185,0,0.3779529929161072,-0.2769230008125305,0.2677170038223267,-0.4000000059604645,-0.007874011993408203],0]
			]
			]
		],
		[
		],
		false,
		false,
		7183437476761179,
		[],
		null
	]
,	[
		"t37",
		cr.plugins_.Sprite,
		false,
		[],
		0,
		0,
		null,
		[
			[
			"Default",
			5,
			false,
			1,
			0,
			false,
			8171125284479091,
			[
				["images/pause-sheet0.png", 8128, 0, 0, 960, 600, 1, 0.5, 0.5,[],[],0]
			]
			]
		],
		[
		],
		false,
		false,
		2025475992039722,
		[],
		null
	]
,	[
		"t38",
		cr.plugins_.Text,
		false,
		[],
		0,
		0,
		null,
		null,
		[
		],
		false,
		false,
		9950317642884165,
		[],
		null
	]
,	[
		"t39",
		cr.plugins_.Sprite,
		false,
		[],
		0,
		0,
		null,
		[
			[
			"Default",
			5,
			false,
			1,
			0,
			false,
			2080657365685198,
			[
				["images/shotbtn-sheet0.png", 2668, 0, 0, 131, 127, 1, 0.5038167834281921, 0.5039370059967041,[],[-0.2977097630500794,-0.2913390100002289,-0.007633775472640991,-0.4330708980560303,0.2977102398872376,-0.2992129921913147,0.3969461917877197,-0.007874011993408203,0.2748092412948608,0.2677170038223267,-0.007633775472640991,0.3779529929161072,-0.2748087644577026,0.2598429918289185,-0.3893127739429474,-0.007874011993408203],0]
			]
			]
		],
		[
		],
		false,
		false,
		4731787306576668,
		[],
		null
	]
,	[
		"t40",
		cr.plugins_.Text,
		false,
		[],
		0,
		0,
		null,
		null,
		[
		],
		false,
		false,
		1302369323339839,
		[],
		null
	]
,	[
		"t41",
		cr.plugins_.Text,
		false,
		[],
		0,
		0,
		null,
		null,
		[
		],
		false,
		false,
		1624854000790181,
		[],
		null
	]
,	[
		"t42",
		cr.plugins_.Text,
		false,
		[],
		0,
		0,
		null,
		null,
		[
		],
		false,
		false,
		4870862018495856,
		[],
		null
	]
,	[
		"t43",
		cr.plugins_.Sprite,
		false,
		[],
		0,
		0,
		null,
		[
			[
			"Default",
			5,
			false,
			1,
			0,
			false,
			3593672872597103,
			[
				["images/jumpbutton-sheet0.png", 2390, 0, 0, 130, 127, 1, 0.5, 0.5039370059967041,[],[-0.300000011920929,-0.2992129921913147,0,-0.4330708980560303,0.29230797290802,-0.2913390100002289,0.3923079967498779,-0.007874011993408203,0.2692310214042664,0.2598429918289185,0,0.3779529929161072,-0.2769230008125305,0.2677170038223267,-0.4000000059604645,-0.007874011993408203],0]
			]
			]
		],
		[
		],
		false,
		false,
		3454851082601772,
		[],
		null
	]
,	[
		"t44",
		cr.plugins_.Sprite,
		false,
		[],
		0,
		0,
		null,
		[
			[
			"Default",
			5,
			false,
			1,
			0,
			false,
			9540710696155519,
			[
				["images/jumpcontainer-sheet0.png", 168, 0, 0, 250, 250, 1, 0.5, 0.5,[],[],3]
			]
			]
		],
		[
		],
		false,
		false,
		4822747668641228,
		[],
		null
	]
,	[
		"t45",
		cr.plugins_.Sprite,
		false,
		[],
		0,
		0,
		null,
		[
			[
			"Default",
			5,
			false,
			1,
			0,
			false,
			8722455230659634,
			[
				["images/jumpcontainer-sheet0.png", 168, 0, 0, 250, 250, 1, 0.5, 0.5,[],[],3]
			]
			]
		],
		[
		],
		false,
		false,
		9809372886483741,
		[],
		null
	]
,	[
		"t46",
		cr.plugins_.Sprite,
		false,
		[],
		0,
		0,
		null,
		[
			[
			"Default",
			5,
			false,
			1,
			0,
			false,
			1243866061720176,
			[
				["images/pausebtn-sheet0.png", 7376, 0, 0, 76, 70, 1, 0.5, 0.5,[],[],0]
			]
			]
		],
		[
		],
		false,
		false,
		2485093785753066,
		[],
		null
	]
,	[
		"t47",
		cr.plugins_.Sprite,
		false,
		[3210903026506017,1705873150102724,1046327400291959,3390278825925955,686710973389827,6957622857604928,6833901729419329],
		0,
		0,
		null,
		[
			[
			"Normal",
			10,
			true,
			1,
			0,
			false,
			2836932278746963,
			[
				["images/flymove-sheet0.png", 45689, 89, 73, 87, 70, 1, 0.4482758641242981, 0.5714285969734192,[],[],0],
				["images/flymove-sheet1.png", 43653, 1, 135, 88, 63, 1, 0.4431818127632141, 0.523809552192688,[],[],0],
				["images/flymove-sheet1.png", 43653, 89, 69, 88, 65, 1, 0.4431818127632141, 0.5076923370361328,[],[],0],
				["images/flymove-sheet1.png", 43653, 1, 1, 87, 68, 1, 0.4482758641242981, 0.5,[],[],0],
				["images/flymove-sheet0.png", 45689, 1, 79, 87, 70, 1, 0.4482758641242981, 0.4857142865657806,[],[],0],
				["images/flymove-sheet0.png", 45689, 89, 1, 87, 71, 1, 0.4482758641242981, 0.4788732528686523,[],[],0],
				["images/flymove-sheet0.png", 45689, 1, 1, 87, 77, 1, 0.4482758641242981, 0.5194805264472961,[],[],0],
				["images/flymove-sheet0.png", 45689, 89, 144, 87, 70, 1, 0.4482758641242981, 0.4857142865657806,[],[],0],
				["images/flymove-sheet0.png", 45689, 1, 150, 86, 69, 1, 0.4534883797168732, 0.4927536249160767,[],[],0],
				["images/flymove-sheet1.png", 43653, 89, 1, 86, 67, 1, 0.4534883797168732, 0.5074626803398132,[],[],0],
				["images/flymove-sheet1.png", 43653, 1, 70, 86, 64, 1, 0.4534883797168732, 0.515625,[],[],0],
				["images/flymove-sheet1.png", 43653, 90, 135, 86, 63, 1, 0.4534883797168732, 0.523809552192688,[],[],0]
			]
			]
		],
		[
		],
		false,
		false,
		3604632923314977,
		[],
		null
	]
,	[
		"t48",
		cr.plugins_.Sprite,
		false,
		[3210903026506017,1705873150102724,1046327400291959,3390278825925955,686710973389827,6957622857604928,6470261943559642],
		0,
		0,
		null,
		[
			[
			"Normal",
			10,
			true,
			1,
			0,
			false,
			8804968912302323,
			[
				["images/flystand-sheet0.png", 44856, 131, 1, 64, 86, 1, 0.484375, 0.406976729631424,[],[],0],
				["images/flystand-sheet0.png", 44856, 131, 88, 64, 86, 1, 0.484375, 0.395348846912384,[],[],0],
				["images/flystand-sheet0.png", 44856, 65, 89, 64, 85, 1, 0.484375, 0.3882353007793427,[],[],0],
				["images/flystand-sheet1.png", 58217, 1, 88, 63, 85, 1, 0.4920634925365448, 0.3764705955982208,[],[],0],
				["images/flystand-sheet2.png", 44357, 125, 1, 62, 85, 1, 0.5, 0.3764705955982208,[],[],0],
				["images/flystand-sheet2.png", 44357, 188, 1, 62, 85, 1, 0.5, 0.364705890417099,[],[],0],
				["images/flystand-sheet1.png", 58217, 65, 90, 62, 86, 1, 0.5, 0.3720930218696594,[],[],0],
				["images/flystand-sheet2.png", 44357, 188, 87, 61, 86, 1, 0.5081967115402222, 0.3720930218696594,[],[],0],
				["images/flystand-sheet1.png", 58217, 65, 1, 61, 88, 1, 0.5081967115402222, 0.3863636255264282,[],[],0],
				["images/flystand-sheet1.png", 58217, 127, 1, 61, 88, 1, 0.5081967115402222, 0.3977272808551788,[],[],0],
				["images/flystand-sheet1.png", 58217, 189, 1, 61, 88, 1, 0.5081967115402222, 0.4090909063816071,[],[],0],
				["images/flystand-sheet2.png", 44357, 1, 1, 61, 87, 1, 0.5081967115402222, 0.4252873659133911,[],[],0],
				["images/flystand-sheet2.png", 44357, 63, 1, 61, 87, 1, 0.5081967115402222, 0.4367816150188446,[],[],0],
				["images/flystand-sheet2.png", 44357, 125, 87, 62, 85, 1, 0.5, 0.4470588266849518,[],[],0],
				["images/flystand-sheet1.png", 58217, 128, 90, 62, 86, 1, 0.5, 0.4534883797168732,[],[],0],
				["images/flystand-sheet1.png", 58217, 191, 90, 62, 86, 1, 0.5, 0.4534883797168732,[],[],0],
				["images/flystand-sheet1.png", 58217, 1, 1, 63, 86, 1, 0.4920634925365448, 0.4418604671955109,[],[],0],
				["images/flystand-sheet0.png", 44856, 1, 89, 63, 87, 1, 0.4920634925365448, 0.4367816150188446,[],[],0],
				["images/flystand-sheet0.png", 44856, 1, 1, 64, 87, 1, 0.484375, 0.4252873659133911,[],[],0],
				["images/flystand-sheet0.png", 44856, 66, 1, 64, 87, 1, 0.484375, 0.4137931168079376,[],[],0]
			]
			]
		],
		[
		],
		false,
		false,
		8883990477249283,
		[],
		null
	]
,	[
		"t49",
		cr.plugins_.Sprite,
		false,
		[8256590412250954],
		0,
		0,
		null,
		[
			[
			"Default",
			5,
			false,
			1,
			0,
			false,
			3950378051530166,
			[
				["images/enemyspawner-sheet0.png", 93, 0, 0, 32, 32, 1, 0.5, 0,[],[],1]
			]
			]
		],
		[
		],
		false,
		false,
		200223222295947,
		[],
		null
	]
,	[
		"t50",
		cr.plugins_.Sprite,
		false,
		[3210903026506017,1705873150102724,1046327400291959,3390278825925955,686710973389827,6957622857604928],
		0,
		0,
		null,
		[
			[
			"Default",
			10,
			true,
			1,
			0,
			false,
			1786502416890138,
			[
				["images/groundmove-sheet0.png", 162322, 182, 1, 83, 141, 1, 0.4939759075641632, 0.588652491569519,[],[],0],
				["images/groundmove-sheet0.png", 162322, 352, 138, 81, 138, 1, 0.4938271641731262, 0.5869565010070801,[],[],0],
				["images/groundmove-sheet0.png", 162322, 93, 1, 88, 136, 1, 0.4886363744735718, 0.5882353186607361,[],[],0],
				["images/groundmove-sheet0.png", 162322, 1, 1, 91, 136, 1, 0.4945054948329926, 0.5882353186607361,[],[],0],
				["images/groundmove-sheet0.png", 162322, 352, 1, 85, 136, 1, 0.4941176474094391, 0.5882353186607361,[],[],0],
				["images/groundmove-sheet0.png", 162322, 1, 138, 84, 137, 1, 0.488095223903656, 0.5912408828735352,[],[],0],
				["images/groundmove-sheet0.png", 162322, 266, 1, 85, 137, 1, 0.4941176474094391, 0.5912408828735352,[],[],0],
				["images/groundmove-sheet0.png", 162322, 86, 138, 86, 132, 1, 0.4883720874786377, 0.5909090638160706,[],[],0],
				["images/groundmove-sheet0.png", 162322, 173, 143, 78, 132, 1, 0.5, 0.5909090638160706,[],[],0],
				["images/groundmove-sheet0.png", 162322, 438, 1, 73, 130, 1, 0.4931506812572479, 0.5923076868057251,[],[],0],
				["images/groundmove-sheet0.png", 162322, 86, 271, 79, 128, 1, 0.4936708807945252, 0.5859375,[],[],0],
				["images/groundmove-sheet0.png", 162322, 266, 139, 81, 131, 1, 0.4938271641731262, 0.5877862572669983,[],[],0]
			]
			]
		],
		[
		],
		false,
		false,
		7205402477405362,
		[],
		null
	]
,	[
		"t51",
		cr.plugins_.Sprite,
		false,
		[3210903026506017,1705873150102724,1046327400291959,3390278825925955,686710973389827,6957622857604928,6854657191787046],
		0,
		0,
		null,
		[
			[
			"Normal",
			10,
			true,
			1,
			0,
			false,
			9021496510460698,
			[
				["images/groundstand-sheet0.png", 66525, 83, 180, 73, 74, 1, 0.4794520437717438, 0.2837837934494019,[],[],0],
				["images/groundstand-sheet1.png", 44482, 143, 1, 69, 73, 1, 0.5362318754196167, 0.2191780805587769,[],[],0],
				["images/groundstand-sheet1.png", 44482, 143, 75, 73, 68, 1, 0.5479452013969421, 0.1911764740943909,[],[],0],
				["images/groundstand-sheet1.png", 44482, 1, 76, 73, 63, 1, 0.5616438388824463, 0.2539682686328888,[],[],0],
				["images/groundstand-sheet0.png", 66525, 1, 180, 81, 68, 1, 0.604938268661499, 0.3235294222831726,[],[],0],
				["images/groundstand-sheet0.png", 66525, 1, 1, 80, 87, 1, 0.6000000238418579, 0.4712643623352051,[],[],0],
				["images/groundstand-sheet0.png", 66525, 159, 92, 76, 90, 1, 0.5789473652839661, 0.4888888895511627,[],[],0],
				["images/groundstand-sheet0.png", 66525, 161, 1, 77, 90, 1, 0.5844155550003052, 0.4888888895511627,[],[],0],
				["images/groundstand-sheet0.png", 66525, 82, 1, 78, 89, 1, 0.5897436141967773, 0.483146071434021,[],[],0],
				["images/groundstand-sheet0.png", 66525, 1, 89, 78, 88, 1, 0.5897436141967773, 0.4772727191448212,[],[],0],
				["images/groundstand-sheet0.png", 66525, 80, 91, 78, 88, 1, 0.5897436141967773, 0.4772727191448212,[],[],0],
				["images/groundstand-sheet0.png", 66525, 157, 183, 76, 67, 1, 0.5789473652839661, 0.3134328424930573,[],[],0],
				["images/groundstand-sheet1.png", 44482, 1, 140, 68, 66, 1, 0.529411792755127, 0.3030303120613098,[],[],0],
				["images/groundstand-sheet1.png", 44482, 75, 79, 67, 66, 1, 0.5223880410194397, 0.2878787815570831,[],[],0],
				["images/groundstand-sheet1.png", 44482, 75, 1, 67, 77, 1, 0.5223880410194397, 0.2597402632236481,[],[],0],
				["images/groundstand-sheet1.png", 44482, 1, 1, 73, 74, 1, 0.4794520437717438, 0.2837837934494019,[],[],0]
			]
			]
		],
		[
		],
		false,
		false,
		8850246566888132,
		[],
		null
	]
,	[
		"t52",
		cr.plugins_.Sprite,
		false,
		[],
		1,
		0,
		null,
		[
			[
			"Default",
			10,
			false,
			1,
			0,
			false,
			5554786473622722,
			[
				["images/monsterdeath-sheet0.png", 166519, 1, 1, 192, 192, 1, 0.5, 0.5,[],[],0],
				["images/monsterdeath-sheet0.png", 166519, 194, 1, 192, 192, 1, 0.5, 0.5,[],[],0],
				["images/monsterdeath-sheet0.png", 166519, 387, 1, 192, 192, 1, 0.5, 0.5,[],[],0],
				["images/monsterdeath-sheet0.png", 166519, 580, 1, 192, 192, 1, 0.5, 0.5,[],[],0],
				["images/monsterdeath-sheet0.png", 166519, 773, 1, 192, 192, 1, 0.5, 0.5,[],[],0],
				["images/monsterdeath-sheet0.png", 166519, 1, 194, 192, 192, 1, 0.5, 0.5,[],[],0],
				["images/monsterdeath-sheet0.png", 166519, 194, 194, 192, 192, 1, 0.5, 0.5,[],[],0],
				["images/monsterdeath-sheet0.png", 166519, 387, 194, 192, 192, 1, 0.5, 0.5,[],[],0],
				["images/monsterdeath-sheet0.png", 166519, 580, 194, 192, 192, 1, 0.5, 0.5,[],[],0],
				["images/monsterdeath-sheet0.png", 166519, 773, 194, 192, 192, 1, 0.5, 0.5,[],[],0],
				["images/monsterdeath-sheet0.png", 166519, 1, 387, 192, 192, 1, 0.5, 0.5,[],[],0],
				["images/monsterdeath-sheet0.png", 166519, 194, 387, 192, 192, 1, 0.5, 0.5,[],[],0],
				["images/monsterdeath-sheet0.png", 166519, 387, 387, 192, 192, 1, 0.5, 0.5,[],[],0],
				["images/monsterdeath-sheet0.png", 166519, 580, 387, 192, 192, 1, 0.5, 0.5,[],[],0],
				["images/monsterdeath-sheet0.png", 166519, 773, 387, 192, 192, 1, 0.5, 0.5,[],[],0],
				["images/monsterdeath-sheet0.png", 166519, 1, 580, 192, 192, 1, 0.5, 0.5,[],[],0],
				["images/monsterdeath-sheet0.png", 166519, 194, 580, 192, 192, 1, 0.5, 0.5,[],[],0],
				["images/monsterdeath-sheet0.png", 166519, 387, 580, 192, 192, 1, 0.5, 0.5,[],[],0],
				["images/monsterdeath-sheet0.png", 166519, 580, 580, 192, 192, 1, 0.5, 0.5,[],[],0],
				["images/monsterdeath-sheet0.png", 166519, 773, 580, 192, 192, 1, 0.5, 0.5,[],[],0],
				["images/monsterdeath-sheet0.png", 166519, 1, 773, 192, 192, 1, 0.5, 0.5,[],[],0],
				["images/monsterdeath-sheet0.png", 166519, 194, 773, 192, 192, 1, 0.5, 0.5,[],[],0],
				["images/monsterdeath-sheet0.png", 166519, 387, 773, 192, 192, 1, 0.5, 0.5,[],[],0]
			]
			]
		],
		[
		[
			"Fade",
			cr.behaviors.Fade,
			5304594908913006
		]
		],
		false,
		false,
		8904026292601439,
		[],
		null
	]
,	[
		"t53",
		cr.plugins_.Sprite,
		false,
		[3210903026506017,1705873150102724,1046327400291959,3390278825925955,686710973389827,6957622857604928],
		1,
		0,
		null,
		[
			[
			"Default",
			10,
			true,
			1,
			0,
			false,
			4320576908909381,
			[
				["images/shield-sheet0.png", 344633, 381, 128, 68, 125, 1, 0.4117647111415863, 0.5279999971389771,[],[],0],
				["images/shield-sheet0.png", 344633, 308, 247, 68, 125, 1, 0.4117647111415863, 0.5279999971389771,[],[],0],
				["images/shield-sheet0.png", 344633, 211, 251, 68, 124, 1, 0.4117647111415863, 0.5241935253143311,[],[],0],
				["images/shield-sheet0.png", 344633, 1, 252, 67, 122, 1, 0.4029850661754608, 0.5163934230804443,[],[],0],
				["images/shield-sheet0.png", 344633, 137, 255, 67, 121, 1, 0.4029850661754608, 0.5123966932296753,[],[],0],
				["images/shield-sheet0.png", 344633, 377, 254, 68, 120, 1, 0.4117647111415863, 0.5,[],[],0],
				["images/shield-sheet0.png", 344633, 280, 373, 68, 118, 1, 0.4117647111415863, 0.508474588394165,[],[],0],
				["images/shield-sheet0.png", 344633, 1, 375, 66, 118, 1, 0.4242424368858337, 0.5254237055778503,[],[],0],
				["images/shield-sheet0.png", 344633, 446, 254, 64, 120, 1, 0.421875, 0.5333333611488342,[],[],0],
				["images/shield-sheet0.png", 344633, 69, 254, 67, 122, 1, 0.3880597054958344, 0.5409836173057556,[],[],0],
				["images/shield-sheet0.png", 344633, 1, 126, 70, 125, 1, 0.3714285790920258, 0.5279999971389771,[],[],0],
				["images/shield-sheet0.png", 344633, 161, 1, 75, 126, 1, 0.3600000143051148, 0.523809552192688,[],[],0],
				["images/shield-sheet0.png", 344633, 82, 1, 78, 126, 1, 0.3461538553237915, 0.5158730149269104,[],[],0],
				["images/shield-sheet0.png", 344633, 1, 1, 80, 124, 1, 0.362500011920929, 0.5080645084381104,[],[],0],
				["images/shield-sheet0.png", 344633, 237, 1, 78, 121, 1, 0.3846153914928436, 0.5041322112083435,[],[],0],
				["images/shield-sheet0.png", 344633, 316, 1, 74, 121, 1, 0.4189189076423645, 0.5041322112083435,[],[],0],
				["images/shield-sheet0.png", 344633, 308, 123, 72, 123, 1, 0.4166666567325592, 0.5121951103210449,[],[],0],
				["images/shield-sheet0.png", 344633, 72, 128, 69, 125, 1, 0.4057970941066742, 0.5199999809265137,[],[],0]
			]
			]
,			[
			"Alert",
			10,
			false,
			1,
			0,
			false,
			9547448938157014,
			[
				["images/shield-sheet0.png", 344633, 391, 1, 71, 126, 1, 0.4225352108478546, 0.523809552192688,[],[],0],
				["images/shield-sheet0.png", 344633, 237, 123, 70, 127, 1, 0.4142857193946838, 0.5275590419769287,[],[],0],
				["images/shield-sheet0.png", 344633, 142, 128, 68, 126, 1, 0.4264705777168274, 0.523809552192688,[],[],0],
				["images/shield-sheet0.png", 344633, 349, 375, 70, 112, 1, 0.4571428596973419, 0.4642857015132904,[],[],0],
				["images/shield-sheet1.png", 39151, 1, 1, 69, 111, 1, 0.4492753744125366, 0.4594594538211823,[],[],0],
				["images/shield-sheet0.png", 344633, 205, 376, 68, 114, 1, 0.455882340669632, 0.4736842215061188,[],[],0],
				["images/shield-sheet0.png", 344633, 420, 375, 68, 115, 1, 0.455882340669632, 0.47826087474823,[],[],0],
				["images/shield-sheet0.png", 344633, 68, 377, 67, 115, 1, 0.447761207818985, 0.47826087474823,[],[],0],
				["images/shield-sheet0.png", 344633, 136, 377, 67, 114, 1, 0.447761207818985, 0.4736842215061188,[],[],0],
				["images/shield-sheet1.png", 39151, 71, 1, 67, 114, 1, 0.447761207818985, 0.4736842215061188,[],[],0],
				["images/shield-sheet1.png", 39151, 139, 1, 67, 114, 1, 0.447761207818985, 0.4736842215061188,[],[],0]
			]
			]
		],
		[
		[
			"LineOfSight",
			cr.behaviors.LOS,
			242395124808621
		]
		],
		false,
		false,
		4281514413368168,
		[],
		null
	]
,	[
		"t54",
		cr.plugins_.Sprite,
		false,
		[3210903026506017,1705873150102724,1046327400291959,3390278825925955,686710973389827,6957622857604928,9772694909979776,4747024989095269],
		1,
		0,
		null,
		[
			[
			"Alert",
			10,
			true,
			1,
			0,
			false,
			5012446036481287,
			[
				["images/spike-sheet0.png", 204751, 341, 1, 108, 136, 1, 0.4722222089767456, 0.4852941036224365,[],[],0],
				["images/spike-sheet0.png", 204751, 1, 145, 96, 141, 1, 0.46875, 0.4893617033958435,[],[],0],
				["images/spike-sheet1.png", 78929, 93, 1, 88, 129, 1, 0.3977272808551788, 0.4418604671955109,[],[],0],
				["images/spike-sheet0.png", 204751, 323, 401, 82, 108, 1, 0.3658536672592163, 0.3611111044883728,[],[],0],
				["images/spike-sheet1.png", 78929, 258, 1, 78, 126, 1, 0.3846153914928436, 0.4444444477558136,[],[],0],
				["images/spike-sheet1.png", 78929, 182, 1, 75, 139, 1, 0.4933333396911621, 0.4964028894901276,[],[],0],
				["images/spike-sheet0.png", 204751, 1, 287, 93, 133, 1, 0.5053763389587402, 0.481203019618988,[],[],0],
				["images/spike-sheet0.png", 204751, 114, 141, 102, 140, 1, 0.5098039507865906, 0.4857142865657806,[],[],0],
				["images/spike-sheet0.png", 204751, 114, 1, 109, 139, 1, 0.4311926662921906, 0.4748201370239258,[],[],0],
				["images/spike-sheet0.png", 204751, 224, 1, 116, 128, 1, 0.4310344755649567, 0.4375,[],[],0],
				["images/spike-sheet0.png", 204751, 1, 1, 112, 143, 1, 0.4732142984867096, 0.4965035021305084,[],[],0],
				["images/spike-sheet0.png", 204751, 224, 130, 100, 146, 1, 0.4699999988079071, 0.5068492889404297,[],[],0],
				["images/spike-sheet1.png", 78929, 1, 1, 91, 132, 1, 0.3956044018268585, 0.4545454680919647,[],[],0],
				["images/spike-sheet1.png", 78929, 416, 1, 83, 111, 1, 0.3614457845687866, 0.3603603541851044,[],[],0],
				["images/spike-sheet1.png", 78929, 337, 1, 78, 125, 1, 0.3846153914928436, 0.4239999949932098,[],[],0],
				["images/spike-sheet0.png", 204751, 427, 267, 80, 142, 1, 0.4625000059604645, 0.48591548204422,[],[],0],
				["images/spike-sheet0.png", 204751, 98, 282, 91, 139, 1, 0.5054945349693298, 0.4748201370239258,[],[],0],
				["images/spike-sheet0.png", 204751, 325, 267, 101, 133, 1, 0.5049505233764648, 0.4586466252803803,[],[],0],
				["images/spike-sheet0.png", 204751, 217, 277, 105, 127, 1, 0.4285714328289032, 0.4409448802471161,[],[],0],
				["images/spike-sheet0.png", 204751, 325, 138, 112, 128, 1, 0.4285714328289032, 0.453125,[],[],0]
			]
			]
		],
		[
		[
			"LineOfSight",
			cr.behaviors.LOS,
			5520215139922895
		]
		],
		false,
		false,
		6742310004491112,
		[],
		null
	]
,	[
		"t55",
		cr.plugins_.Browser,
		false,
		[],
		0,
		0,
		null,
		null,
		[
		],
		false,
		false,
		4828045837369472,
		[],
		null
		,[]
	]
,	[
		"t56",
		cr.plugins_.Function,
		false,
		[],
		0,
		0,
		null,
		null,
		[
		],
		false,
		false,
		5386548884213674,
		[],
		null
		,[]
	]
,	[
		"t57",
		cr.plugins_.Keyboard,
		false,
		[],
		0,
		0,
		null,
		null,
		[
		],
		false,
		false,
		3858596664283658,
		[],
		null
		,[]
	]
,	[
		"t58",
		cr.plugins_.Mouse,
		false,
		[],
		0,
		0,
		null,
		null,
		[
		],
		false,
		false,
		9140675426288104,
		[],
		null
		,[]
	]
,	[
		"t59",
		cr.plugins_.Touch,
		false,
		[],
		0,
		0,
		null,
		null,
		[
		],
		false,
		false,
		9817162994087009,
		[],
		null
		,[1]
	]
,	[
		"t60",
		cr.plugins_.Audio,
		false,
		[],
		0,
		0,
		null,
		null,
		[
		],
		false,
		false,
		3180578474593016,
		[],
		null
		,[0,0,1,1,600,600,10000,1,5000,1]
	]
,	[
		"t61",
		cr.plugins_.WebStorage,
		false,
		[],
		0,
		0,
		null,
		null,
		[
		],
		false,
		false,
		8423784206682266,
		[],
		null
		,[]
	]
,	[
		"t62",
		cr.plugins_.Sprite,
		false,
		[],
		0,
		0,
		null,
		[
			[
			"Default",
			5,
			false,
			1,
			0,
			false,
			4736198630724645,
			[
				["images/a10_100x-sheet0.png", 5833, 0, 0, 100, 31, 1, 0.5, 0.5161290168762207,[],[-0.4200000166893005,-0.2580640316009522,0,-0.5161290168762207,0.300000011920929,0.1290319561958313,0.1399999856948853,-0.03225800395011902,0.5,0.4838709831237793,0,0.4838709831237793,-0.4900000095367432,0.4516130089759827],0]
			]
			]
		],
		[
		],
		false,
		false,
		8661846219449854,
		[],
		null
	]
,	[
		"t63",
		cr.plugins_.Sprite,
		false,
		[],
		0,
		0,
		null,
		[
			[
			"Default",
			5,
			false,
			1,
			0,
			false,
			6631753368540841,
			[
				["images/a10_logo_-sheet0.png", 31495, 0, 0, 286, 90, 1, 0.5, 0.5,[],[-0.4370628893375397,-0.300000011920929,0,-0.3555560111999512,0.2937059998512268,0.1555560231208801,0.2167829871177673,0,0.4545450210571289,0.3555560111999512,0,0.3444439768791199,-0.3776220083236694,0.1111109852790833,-0.4790210127830505,0],0]
			]
			]
		],
		[
		],
		false,
		false,
		468485396800155,
		[],
		null
	]
,	[
		"t64",
		cr.plugins_.Button,
		false,
		[],
		0,
		0,
		null,
		null,
		[
		],
		true,
		false,
		8791889042086504,
		[],
		null
	]
,	[
		"t65",
		cr.plugins_.TextBox,
		false,
		[],
		0,
		0,
		null,
		null,
		[
		],
		true,
		false,
		7822734363636039,
		[],
		null
	]
,	[
		"t66",
		cr.plugins_.TextBox,
		false,
		[],
		0,
		0,
		null,
		null,
		[
		],
		true,
		false,
		4179005170562123,
		[],
		null
	]
,	[
		"t67",
		cr.plugins_.Sprite,
		false,
		[],
		0,
		0,
		null,
		[
			[
			"Default",
			5,
			false,
			1,
			0,
			false,
			1969540099041371,
			[
				["images/splash_image-sheet0.png", 31760, 0, 0, 615, 200, 1, 0.4341463446617127, 0.5600000023841858,[],[-0.4341463446617127,-0.550000011920929,-0.001626342535018921,-0.4099999964237213,0.3430896401405335,0.1850000023841858,0.2195126414299011,0,0.5430896282196045,0.4300000071525574,-0.001626342535018921,0.3999999761581421,-0.4341463446617127,0.4350000023841858,-0.4341463446617127,0.009999990463256836],0]
			]
			]
		],
		[
		],
		false,
		false,
		2100811478412681,
		[],
		null
	]
,	[
		"t68",
		cr.plugins_.Sprite,
		false,
		[],
		0,
		0,
		null,
		[
			[
			"Default",
			5,
			false,
			1,
			0,
			false,
			108304191453183,
			[
				["images/a10_logo_-sheet0.png", 31495, 0, 0, 286, 90, 1, 0.5, 0.5,[],[-0.4370628893375397,-0.300000011920929,0,-0.3555560111999512,0.2937059998512268,0.1555560231208801,0.2167829871177673,0,0.4545450210571289,0.3555560111999512,0,0.3444439768791199,-0.3776220083236694,0.1111109852790833,-0.4790210127830505,0],0]
			]
			]
,			[
			"Small",
			5,
			false,
			1,
			0,
			false,
			6571211359219253,
			[
				["images/spilgameslogo-sheet0.png", 5782, 0, 0, 100, 31, 1, 0.5, 0.5161290168762207,[],[-0.5,-0.4516129195690155,0,-0.5161290168762207,0.5,-0.5161290168762207,0.5,-0.1290320158004761,0.5,0.4838709831237793,0,0.4838709831237793,-0.4900000095367432,0.4516130089759827],0]
			]
			]
		],
		[
		],
		false,
		false,
		6711182271322294,
		[],
		null
	]
,	[
		"t69",
		cr.plugins_.Sprite,
		false,
		[],
		0,
		0,
		null,
		[
			[
			"Default",
			5,
			false,
			1,
			0,
			false,
			2812535003289951,
			[
				["images/ancientworld-sheet0.png", 79712, 0, 0, 230, 176, 1, 0.5, 0.5,[],[-0.4521738886833191,-0.4375,0,-0.5,0.4521740078926086,-0.4375,0.5,0,0.4739130139350891,0.4659090042114258,0,0.5,-0.4739130139350891,0.4659090042114258,-0.4956521689891815,0],0]
			]
			]
		],
		[
		],
		false,
		false,
		8792553267403273,
		[],
		null
	]
,	[
		"t70",
		cr.plugins_.Sprite,
		false,
		[],
		0,
		0,
		null,
		[
			[
			"Default",
			5,
			false,
			1,
			0,
			false,
			6204330254030921,
			[
				["images/awlevelselector-sheet0.png", 542601, 0, 0, 960, 600, 1, 0.5, 0.5,[],[],1]
			]
			]
		],
		[
		],
		false,
		false,
		3659565538166677,
		[],
		null
	]
,	[
		"t71",
		cr.plugins_.Sprite,
		false,
		[],
		0,
		0,
		null,
		[
			[
			"Default",
			5,
			false,
			1,
			0,
			false,
			913912837988325,
			[
				["images/backbtn-sheet0.png", 14605, 0, 0, 246, 87, 1, 0.5, 0.5057471394538879,[],[-0.4186992049217224,-0.2758621573448181,0,-0.41379314661026,0.4349589943885803,-0.3218391537666321,0.4552850127220154,-0.01149412989616394,0.4268289804458618,0.2873558402061462,0,0.3908048868179321,-0.4227641820907593,0.2758618593215942,-0.4308943152427673,-0.01149412989616394],0]
			]
			]
		],
		[
		],
		false,
		false,
		4030428202281063,
		[],
		null
	]
,	[
		"t72",
		cr.plugins_.Sprite,
		false,
		[],
		0,
		0,
		null,
		[
			[
			"Default",
			5,
			false,
			1,
			0,
			false,
			1623912601457907,
			[
				["images/bg-sheet0.png", 619653, 0, 0, 960, 600, 1, 0.5, 0.5,[],[],1]
			]
			]
		],
		[
		],
		false,
		false,
		4124961934681966,
		[],
		null
	]
,	[
		"t73",
		cr.plugins_.Sprite,
		false,
		[],
		0,
		0,
		null,
		[
			[
			"Default",
			5,
			false,
			1,
			0,
			false,
			5058919402249447,
			[
				["images/characterbg-sheet0.png", 446314, 0, 0, 960, 600, 1, 0.5, 0.5,[],[],1]
			]
			]
		],
		[
		],
		false,
		false,
		7036488019167249,
		[],
		null
	]
,	[
		"t74",
		cr.plugins_.Sprite,
		false,
		[3513385775071575,7496418283746556,443738965902886],
		0,
		0,
		null,
		[
			[
			"Default",
			5,
			false,
			1,
			0,
			false,
			9046912455069394,
			[
				["images/characterbtn-sheet0.png", 10123, 1, 1, 146, 33, 1, 0.5, 0.5151515007019043,[],[-0.4794521033763886,-0.4242424070835114,0,-0.4848484992980957,0.4794520139694214,-0.4242424070835114,0.4931510090827942,-0.03030350804328919,0.4794520139694214,0.3939394950866699,0,0.4545454978942871,-0.4794521033763886,0.3939394950866699,-0.4931506812572479,-0.03030350804328919],0]
			]
			]
,			[
			"Selected",
			5,
			false,
			1,
			0,
			false,
			8315155637753231,
			[
				["images/characterbtn-sheet0.png", 10123, 1, 35, 146, 33, 1, 0.5, 0.5151515007019043,[],[-0.4794521033763886,-0.4242424070835114,0,-0.4848484992980957,0.4794520139694214,-0.4242424070835114,0.4931510090827942,-0.03030350804328919,0.4794520139694214,0.3939394950866699,0,0.4545454978942871,-0.4794521033763886,0.3939394950866699,-0.4931506812572479,-0.03030350804328919],0]
			]
			]
,			[
			"Locked",
			5,
			false,
			1,
			0,
			false,
			8427265470732292,
			[
				["images/characterbtn-sheet0.png", 10123, 1, 69, 146, 33, 1, 0.5, 0.5151515007019043,[],[-0.4794521033763886,-0.4242424070835114,0,-0.4848484992980957,0.4794520139694214,-0.4242424070835114,0.4931510090827942,-0.03030350804328919,0.4794520139694214,0.3939394950866699,0,0.4545454978942871,-0.4794521033763886,0.3939394950866699,-0.4931506812572479,-0.03030350804328919],0]
			]
			]
		],
		[
		],
		false,
		false,
		3148624146911814,
		[],
		null
	]
,	[
		"t75",
		cr.plugins_.Sprite,
		false,
		[],
		0,
		0,
		null,
		[
			[
			"Default",
			5,
			false,
			1,
			0,
			false,
			8623111496173021,
			[
				["images/charactersbtn-sheet0.png", 8210, 0, 0, 209, 76, 1, 0.5023923516273499, 0.5,[],[-0.4688995480537415,-0.4078947007656097,-0.004784345626831055,-0.5,0.4593296647071838,-0.3947370052337647,0.4976076483726502,0,0.4593296647071838,0.3947370052337647,-0.004784345626831055,0.5,-0.4688995480537415,0.407895028591156,-0.5023923516273499,0],0]
			]
			]
		],
		[
		],
		false,
		false,
		8040030380657266,
		[],
		null
	]
,	[
		"t76",
		cr.plugins_.Sprite,
		false,
		[],
		0,
		0,
		null,
		[
			[
			"Default",
			5,
			false,
			1,
			0,
			false,
			7686824172187893,
			[
				["images/continuebtn-sheet0.png", 7990, 0, 0, 209, 76, 1, 0.5023923516273499, 0.5,[],[-0.4688995480537415,-0.4078947007656097,-0.004784345626831055,-0.5,0.4593296647071838,-0.3947370052337647,0.4976076483726502,0,0.4593296647071838,0.3947370052337647,-0.004784345626831055,0.5,-0.4688995480537415,0.407895028591156,-0.5023923516273499,0],0]
			]
			]
		],
		[
		],
		false,
		false,
		5744980532104986,
		[],
		null
	]
,	[
		"t77",
		cr.plugins_.Sprite,
		false,
		[],
		0,
		0,
		null,
		[
			[
			"Default",
			5,
			false,
			1,
			0,
			false,
			8709554720343514,
			[
				["images/lavabg-sheet0.png", 182448, 0, 0, 960, 600, 1, 0.5, 0.5,[],[],1]
			]
			]
		],
		[
		],
		false,
		false,
		8828391362913563,
		[],
		null
	]
,	[
		"t78",
		cr.plugins_.Sprite,
		false,
		[5861431743758428,5179801870557351],
		0,
		0,
		null,
		[
			[
			"Current",
			0,
			false,
			1,
			0,
			false,
			5569789103520067,
			[
				["images/levelbox-sheet0.png", 83636, 1, 1, 159, 172, 1, 0.5031446814537048, 0.5,[],[-0.3899366855621338,-0.395348995923996,0.3836473226547241,-0.395348995923996,0.4716983437538147,0,0.4591193199157715,0.465116024017334,-0.006289690732955933,0.4767439961433411,-0.4591194689273834,0.4593020081520081,-0.4716981649398804,0],0]
			]
			]
,			[
			"lock",
			0,
			false,
			1,
			0,
			false,
			8152496321807014,
			[
				["images/levelbox-sheet0.png", 83636, 159, 343, 156, 156, 1, 0.5, 0.5,[],[],0],
				["images/levelbox-sheet0.png", 83636, 316, 343, 156, 156, 1, 0.5, 0.5,[],[],0],
				["images/levelbox-sheet0.png", 83636, 1, 345, 156, 156, 1, 0.5, 0.5,[],[],0],
				["images/levelbox-sheet1.png", 82540, 1, 343, 156, 156, 1, 0.5, 0.5,[],[],0],
				["images/levelbox-sheet1.png", 82540, 158, 343, 156, 156, 1, 0.5, 0.5,[],[],0],
				["images/levelbox-sheet1.png", 82540, 315, 343, 156, 156, 1, 0.5, 0.5,[],[],0],
				["images/levelbox-sheet2.png", 16061, 1, 1, 156, 156, 1, 0.5, 0.5,[],[],0],
				["images/levelbox-sheet2.png", 16061, 158, 1, 156, 156, 1, 0.5, 0.5,[],[],0],
				["images/levelbox-sheet2.png", 16061, 315, 1, 156, 156, 1, 0.5, 0.5,[],[],0],
				["images/levelbox-sheet2.png", 16061, 1, 158, 156, 156, 1, 0.5, 0.5,[],[],0]
			]
			]
,			[
			"Complete",
			0,
			false,
			1,
			0,
			false,
			1015441252215082,
			[
				["images/levelbox-sheet0.png", 83636, 161, 1, 157, 170, 1, 0.5031847357749939, 0.5,[],[],0],
				["images/levelbox-sheet0.png", 83636, 319, 1, 157, 170, 1, 0.5031847357749939, 0.5,[],[],0],
				["images/levelbox-sheet0.png", 83636, 161, 172, 157, 170, 1, 0.5031847357749939, 0.5,[],[],0],
				["images/levelbox-sheet0.png", 83636, 319, 172, 157, 170, 1, 0.5031847357749939, 0.5,[],[],0],
				["images/levelbox-sheet0.png", 83636, 1, 174, 157, 170, 1, 0.5031847357749939, 0.5,[],[],0],
				["images/levelbox-sheet1.png", 82540, 1, 1, 157, 170, 1, 0.5031847357749939, 0.5,[],[],0],
				["images/levelbox-sheet1.png", 82540, 159, 1, 157, 170, 1, 0.5031847357749939, 0.5,[],[],0],
				["images/levelbox-sheet1.png", 82540, 317, 1, 157, 170, 1, 0.5031847357749939, 0.5,[],[],0],
				["images/levelbox-sheet1.png", 82540, 1, 172, 157, 170, 1, 0.5031847357749939, 0.5,[],[],0],
				["images/levelbox-sheet1.png", 82540, 159, 172, 157, 170, 1, 0.5031847357749939, 0.5,[],[],0]
			]
			]
,			[
			"FCurrent",
			0,
			false,
			1,
			0,
			false,
			2633269441354989,
			[
				["images/levelbox-sheet1.png", 82540, 317, 172, 157, 170, 1, 0.5031847357749939, 0.5,[],[-0.3949047327041626,-0.4000000059604645,0.3885352611541748,-0.4000000059604645,0.4777072668075562,0,0.4649682641029358,0.4705880284309387,-0.006369739770889282,0.4823529720306397,-0.4649681448936462,0.4647060036659241,-0.4777070283889771,0],0]
			]
			]
		],
		[
		],
		false,
		false,
		5150659783237346,
		[],
		null
	]
,	[
		"t79",
		cr.plugins_.Text,
		false,
		[],
		0,
		0,
		null,
		null,
		[
		],
		false,
		false,
		5145184803758407,
		[],
		null
	]
,	[
		"t80",
		cr.plugins_.Sprite,
		false,
		[],
		0,
		0,
		null,
		[
			[
			"Default",
			0,
			false,
			1,
			0,
			false,
			1604405289753242,
			[
				["images/mutebutton-sheet0.png", 2381, 0, 0, 75, 75, 1, 0.5066666603088379, 0.5066666603088379,[],[],0],
				["images/mutebutton-sheet1.png", 2314, 0, 0, 75, 75, 1, 0.5066666603088379, 0.5066666603088379,[],[],0]
			]
			]
		],
		[
		],
		false,
		false,
		9876187913470307,
		[],
		null
	]
,	[
		"t81",
		cr.plugins_.Sprite,
		false,
		[],
		0,
		0,
		null,
		[
			[
			"Default",
			5,
			false,
			1,
			0,
			false,
			3109587991075195,
			[
				["images/sprite2-sheet0.png", 9894, 0, 0, 64, 64, 1, 0.484375, 0.5,[],[-0.3558039963245392,-0.3181819915771484,-0.01294600963592529,-0.4740259945392609,0.3584820032119751,-0.3311690092086792,0.4727680087089539,-0.006493985652923584,0.4299110174179077,0.3961039781570435,-0.01294600963592529,0.4870129823684692,-0.4558036029338837,0.4090909957885742,-0.4558036029338837,-0.006493985652923584],0]
			]
			]
		],
		[
		],
		false,
		false,
		2125617468349946,
		[],
		null
	]
,	[
		"t82",
		cr.plugins_.Sprite,
		false,
		[],
		0,
		0,
		null,
		[
			[
			"Default",
			5,
			false,
			1,
			0,
			false,
			209699108358264,
			[
				["images/sprite-sheet0.png", 573839, 0, 0, 960, 600, 1, 0.5, 0.5,[],[],1]
			]
			]
		],
		[
		],
		false,
		false,
		9709918410609631,
		[],
		null
	]
,	[
		"t83",
		cr.plugins_.Sprite,
		false,
		[],
		0,
		0,
		null,
		[
			[
			"Default",
			5,
			false,
			1,
			0,
			false,
			3262269563828223,
			[
				["images/wakodragontitle-sheet0.png", 6085, 0, 0, 211, 38, 1, 0.5023696422576904, 0.5,[],[-0.4786729514598846,-0.3684210181236267,0.4834123849868774,-0.4210526049137116,0.4691943526268005,0.342104971408844,-0.004739642143249512,0.4210529923439026,-0.4976302981376648,0.4736840128898621],0]
			]
			]
		],
		[
		],
		false,
		false,
		4050491722560396,
		[],
		null
	]
,	[
		"t84",
		cr.plugins_.Sprite,
		false,
		[3755750724530231],
		0,
		0,
		null,
		[
			[
			"Default",
			5,
			false,
			1,
			0,
			false,
			8877577239251157,
			[
				["images/worldselector-sheet0.png", 184655, 1, 1, 327, 251, 1, 0.5015290379524231, 0.5019920468330383,[],[-0.4525993466377258,-0.4382470548152924,-0.003058046102523804,-0.4780876338481903,0.4464829564094544,-0.4342629313468933,0.4831809401512146,-0.003984034061431885,0.4587159752845764,0.4462149739265442,-0.003058046102523804,0.4741039276123047,-0.4678899347782135,0.4541829228401184,-0.4862385392189026,-0.003984034061431885],0]
			]
			]
,			[
			"lock",
			5,
			false,
			1,
			0,
			false,
			7752204307379258,
			[
				["images/worldselector-sheet0.png", 184655, 1, 253, 327, 251, 1, 0.5015290379524231, 0.5019920468330383,[],[-0.4525993466377258,-0.4382470548152924,-0.003058046102523804,-0.4780876338481903,0.4464829564094544,-0.4342629313468933,0.4831809401512146,-0.003984034061431885,0.4587159752845764,0.4462149739265442,-0.003058046102523804,0.4741039276123047,-0.4678899347782135,0.4541829228401184,-0.4862385392189026,-0.003984034061431885],0]
			]
			]
,			[
			"LavaLevel",
			5,
			false,
			1,
			0,
			false,
			2099809845279079,
			[
				["images/worldselector-sheet1.png", 85251, 0, 0, 327, 251, 1, 0.5015290379524231, 0.5019920468330383,[],[-0.4525993466377258,-0.4382470548152924,-0.003058046102523804,-0.4780876338481903,0.4464829564094544,-0.4342629313468933,0.4831809401512146,-0.003984034061431885,0.4587159752845764,0.4462149739265442,-0.003058046102523804,0.4741039276123047,-0.4678899347782135,0.4541829228401184,-0.4862385392189026,-0.003984034061431885],0]
			]
			]
		],
		[
		],
		false,
		false,
		3492412279071349,
		[],
		null
	]
,	[
		"t85",
		cr.plugins_.Sprite,
		false,
		[],
		0,
		0,
		null,
		[
			[
			"Default",
			5,
			false,
			1,
			0,
			false,
			319626881929651,
			[
				["images/backtolobby-sheet0.png", 14494, 0, 0, 205, 73, 1, 0.502439022064209, 0.5068492889404297,[],[],0]
			]
			]
		],
		[
		],
		false,
		false,
		3587150473680044,
		[],
		null
	]
,	[
		"t86",
		cr.plugins_.Sprite,
		false,
		[],
		0,
		0,
		null,
		[
			[
			"Default",
			5,
			false,
			1,
			0,
			false,
			9185042106655589,
			[
				["images/moregames-sheet0.png", 10579, 0, 0, 178, 53, 1, 0.5, 0.5094339847564697,[],[],0]
			]
			]
		],
		[
		],
		false,
		false,
		9025194576009975,
		[],
		null
	]
,	[
		"t87",
		cr.plugins_.Sprite,
		false,
		[],
		2,
		0,
		null,
		[
			[
			"FRunning",
			10,
			true,
			1,
			0,
			false,
			5749755851781307,
			[
				["images/malecharacter-sheet0.png", 2721611, 1951, 941, 91, 83, 1, 0.5384615659713745, 0.3975903689861298,[],[-0.4285725653171539,-0.3734946846961975,0.3406594395637512,-0.3734946846961975,0.3406594395637512,0.5542166233062744,-0.4285725653171539,0.5542166233062744],0],
				["images/malecharacter-sheet0.png", 2721611, 1094, 1189, 89, 82, 1, 0.5393258333206177, 0.4024390280246735,[],[-0.4269658327102661,-0.3048785328865051,0.3033721446990967,-0.3048785328865051,0.3033721446990967,0.5731699466705322,-0.4269658327102661,0.5731699466705322],0],
				["images/malecharacter-sheet0.png", 2721611, 91, 1316, 87, 76, 1, 0.540229856967926, 0.3815789520740509,[],[-0.3218398690223694,-0.2763149440288544,0.356322169303894,-0.2763149440288544,0.356322169303894,0.6184200048446655,-0.3218398690223694,0.6184200048446655],0],
				["images/malecharacter-sheet0.png", 2721611, 94, 1237, 89, 78, 1, 0.516853928565979, 0.3846153914928436,[],[-0.3595509231090546,-0.2564103901386261,0.3820220828056335,-0.2564103901386261,0.3820220828056335,0.5769236087799072,-0.3820229172706604,0.5769215822219849],0],
				["images/malecharacter-sheet0.png", 2721611, 196, 1158, 92, 81, 1, 0.510869562625885, 0.395061731338501,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 789, 1150, 92, 82, 1, 0.532608687877655, 0.3902438879013062,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1237, 1128, 91, 83, 1, 0.5384615659713745, 0.3975903689861298,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1274, 1216, 88, 82, 1, 0.5454545617103577, 0.4024390280246735,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 524, 1274, 87, 77, 1, 0.540229856967926, 0.3896103799343109,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 184, 1240, 89, 78, 1, 0.516853928565979, 0.3846153914928436,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 289, 1175, 92, 81, 1, 0.510869562625885, 0.395061731338501,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 654, 1152, 92, 82, 1, 0.532608687877655, 0.3902438879013062,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1329, 1132, 91, 83, 1, 0.5384615659713745, 0.3975903689861298,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1363, 1220, 88, 82, 1, 0.5454545617103577, 0.4024390280246735,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1178, 1295, 87, 77, 1, 0.540229856967926, 0.3896103799343109,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1, 1241, 89, 78, 1, 0.516853928565979, 0.3846153914928436,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 382, 1175, 92, 81, 1, 0.510869562625885, 0.395061731338501,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 475, 1178, 92, 81, 1, 0.532608687877655, 0.3827160596847534,[],[],0]
			]
			]
,			[
			"FJump",
			10,
			true,
			1,
			0,
			false,
			1765528416707336,
			[
				["images/malecharacter-sheet0.png", 2721611, 1978, 310, 69, 99, 1, 0.5797101259231567, 0.3737373650074005,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1764, 1269, 69, 98, 1, 0.5797101259231567, 0.3775510191917419,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1541, 1310, 69, 96, 1, 0.5797101259231567, 0.375,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1834, 1269, 69, 98, 1, 0.5797101259231567, 0.3673469424247742,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 454, 1260, 69, 99, 1, 0.5797101259231567, 0.3636363744735718,[],[],0]
			]
			]
,			[
			"FAttack",
			8,
			false,
			1,
			0,
			false,
			5862108980921192,
			[
				["images/malecharacter-sheet0.png", 2721611, 827, 994, 85, 75, 1, 0.5176470875740051, 0.3733333349227905,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 927, 916, 75, 67, 1, 0.4933333396911621, 0.3731343150138855,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 873, 1453, 82, 65, 1, 0.4878048896789551, 0.3692307770252228,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1065, 1272, 112, 60, 1, 0.3928571343421936, 0.3499999940395355,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 920, 1331, 104, 61, 1, 0.4134615361690521, 0.4262295067310333,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 747, 1233, 102, 70, 1, 0.4607843160629273, 0.4000000059604645,[],[],0]
			]
			]
,			[
			"FFly",
			10,
			true,
			1,
			0,
			false,
			8777084895025742,
			[
				["images/malecharacter-sheet0.png", 2721611, 459, 671, 173, 130, 1, 0.5028901696205139, 0.5,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 633, 671, 173, 130, 1, 0.5028901696205139, 0.5,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1735, 765, 173, 130, 1, 0.5028901696205139, 0.5,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1457, 766, 173, 130, 1, 0.5028901696205139, 0.5,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 459, 802, 173, 130, 1, 0.5028901696205139, 0.5,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 633, 802, 173, 130, 1, 0.5028901696205139, 0.5,[],[],0]
			]
			]
,			[
			"FFalling",
			10,
			true,
			1,
			0,
			false,
			9011581703436073,
			[
				["images/malecharacter-sheet0.png", 2721611, 238, 1425, 63, 90, 1, 0.6666666865348816, 0.4444444477558136,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 302, 1425, 63, 90, 1, 0.6666666865348816, 0.4444444477558136,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1, 1397, 63, 91, 1, 0.6666666865348816, 0.450549453496933,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1405, 1406, 63, 91, 1, 0.6666666865348816, 0.450549453496933,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1469, 1406, 63, 91, 1, 0.6666666865348816, 0.450549453496933,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 366, 1426, 63, 90, 1, 0.6666666865348816, 0.4444444477558136,[],[],0]
			]
			]
,			[
			"FDeath",
			5,
			false,
			1,
			0,
			false,
			2104102094330099,
			[
				["images/malecharacter-sheet0.png", 2721611, 1338, 1381, 66, 92, 1, 0.6515151262283325, 0.5652173757553101,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 177, 1396, 60, 97, 1, 0.75, 0.6185566782951355,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1752, 1457, 53, 99, 1, 0.849056601524353, 0.6666666865348816,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1661, 1458, 53, 96, 1, 0.9245283007621765, 0.65625,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1240, 1441, 70, 80, 1, 0.8428571224212647, 0.449999988079071,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 680, 1396, 89, 65, 1, 0.8202247023582459, 0.2153846174478531,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 770, 1453, 102, 54, 1, 0.8235294222831726, 0.0555555559694767,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 659, 1462, 105, 48, 1, 0.800000011920929, -0.0625,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1, 1506, 106, 44, 1, 0.801886796951294, -0.1363636404275894,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 320, 1517, 104, 40, 1, 0.817307710647583, -0.300000011920929,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 659, 1511, 103, 41, 1, 0.8252426981925964, -0.2682926952838898,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 217, 1516, 102, 41, 1, 0.8235294222831726, -0.2926829159259796,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1806, 1507, 105, 41, 1, 0.800000011920929, -0.2926829159259796,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 108, 1506, 108, 41, 1, 0.7777777910232544, -0.2926829159259796,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1912, 1507, 107, 40, 1, 0.7757009267807007, -0.324999988079071,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 765, 1508, 107, 40, 1, 0.7757009267807007, -0.324999988079071,[],[],0]
			]
			]
,			[
			"FJumpGhost",
			10,
			true,
			1,
			0,
			false,
			8056694876130413,
			[
				["images/malecharacter-sheet0.png", 2721611, 850, 1261, 69, 99, 1, 0.5797101259231567, 0.3737373650074005,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1904, 1269, 69, 98, 1, 0.5797101259231567, 0.3775510191917419,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1611, 1310, 69, 96, 1, 0.5797101259231567, 0.375,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1974, 1269, 69, 98, 1, 0.5797101259231567, 0.3673469424247742,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1694, 1269, 69, 99, 1, 0.5797101259231567, 0.3636363744735718,[],[],0]
			]
			]
,			[
			"FFallingGhost",
			10,
			true,
			1,
			0,
			false,
			1233608318191404,
			[
				["images/malecharacter-sheet0.png", 2721611, 430, 1426, 63, 90, 1, 0.6666666865348816, 0.4444444477558136,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 595, 1427, 63, 90, 1, 0.6666666865348816, 0.4444444477558136,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1533, 1407, 63, 91, 1, 0.6666666865348816, 0.450549453496933,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1597, 1407, 63, 91, 1, 0.6666666865348816, 0.450549453496933,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 968, 1422, 63, 91, 1, 0.6666666865348816, 0.450549453496933,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 494, 1441, 63, 90, 1, 0.6666666865348816, 0.4444444477558136,[],[],0]
			]
			]
,			[
			"FRunningGhost",
			10,
			true,
			1,
			0,
			false,
			5927375718531427,
			[
				["images/malecharacter-sheet0.png", 2721611, 1421, 1136, 91, 83, 1, 0.5384615659713745, 0.3975903689861298,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1184, 1212, 89, 82, 1, 0.5393258333206177, 0.4024390280246735,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 179, 1319, 87, 76, 1, 0.540229856967926, 0.3815789520740509,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 975, 1252, 89, 78, 1, 0.516853928565979, 0.3846153914928436,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 882, 1179, 92, 81, 1, 0.510869562625885, 0.395061731338501,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 103, 1154, 92, 82, 1, 0.532608687877655, 0.3902438879013062,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1664, 1143, 91, 83, 1, 0.5384615659713745, 0.3975903689861298,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1605, 1227, 88, 82, 1, 0.5454545617103577, 0.4024390280246735,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1266, 1299, 87, 77, 1, 0.540229856967926, 0.3896103799343109,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 274, 1257, 89, 78, 1, 0.516853928565979, 0.3846153914928436,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1756, 1187, 92, 81, 1, 0.510869562625885, 0.395061731338501,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1, 1158, 92, 82, 1, 0.532608687877655, 0.3902438879013062,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1513, 1146, 91, 83, 1, 0.5384615659713745, 0.3975903689861298,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1452, 1230, 88, 82, 1, 0.5454545617103577, 0.4024390280246735,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1354, 1303, 87, 77, 1, 0.540229856967926, 0.3896103799343109,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 364, 1257, 89, 78, 1, 0.516853928565979, 0.3846153914928436,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1849, 1187, 92, 81, 1, 0.510869562625885, 0.395061731338501,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1942, 1187, 92, 81, 1, 0.532608687877655, 0.3827160596847534,[],[],0]
			]
			]
,			[
			"FJumpBig",
			5,
			true,
			1,
			0,
			false,
			3849804601557274,
			[
				["images/malecharacter-sheet0.png", 2721611, 1436, 475, 130, 190, 1, 0.4000000059604645, 0.5473684072494507,[],[-0.2846139967441559,-0.5473684072494507,0.6000000238418579,-0.5473684072494507,0.1307719647884369,0.4157885909080505,-0.2923090159893036,0.4157885909080505],0],
				["images/malecharacter-sheet0.png", 2721611, 598, 481, 130, 188, 1, 0.4000000059604645, 0.5478723645210266,[],[-0.3076924979686737,-0.5106387734413147,0.6000000238418579,-0.5106387734413147,0.05384600162506104,0.3670206069946289,-0.3307707011699677,0.3670206069946289],0],
				["images/malecharacter-sheet0.png", 2721611, 1054, 623, 130, 186, 1, 0.4000000059604645, 0.5483871102333069,[],[-0.2153850048780441,-0.4838713109493256,0.584617018699646,-0.4838713109493256,0.05384799838066101,0.3494619131088257,-0.3307707011699677,0.3494619131088257],0],
				["images/malecharacter-sheet0.png", 2721611, 467, 481, 130, 189, 1, 0.4000000059604645, 0.5449735522270203,[],[-0.2846139967441559,-0.4973541498184204,0.5923089981079102,-0.4973541498184204,0.03077000379562378,0.3439154624938965,-0.2923090159893036,0.3439154624938965],0],
				["images/malecharacter-sheet0.png", 2721611, 739, 480, 130, 190, 1, 0.4000000059604645, 0.5473684072494507,[],[-0.2923090159893036,-0.4631577134132385,0.6000000238418579,-0.4631577134132385,0.01538598537445068,0.3315786123275757,-0.2846139967441559,0.3315786123275757],0]
			]
			]
,			[
			"FFallingBig",
			5,
			true,
			1,
			0,
			false,
			9827528431063949,
			[
				["images/malecharacter-sheet0.png", 2721611, 280, 820, 118, 174, 1, 0.4661017060279846, 0.5804597735404968,[],[-0.2796617150306702,-0.5804597735404968,0.4237303137779236,-0.5804597735404968,0.4237303137779236,0.396551251411438,-0.2796617150306702,0.396551251411438],0],
				["images/malecharacter-sheet0.png", 2721611, 137, 821, 118, 174, 1, 0.4661017060279846, 0.5804597735404968,[],[-0.2711877226829529,-0.5804597735404968,0.3559322953224182,-0.5804597735404968,0.3644062876701355,0.3850572109222412,-0.2627137005329132,0.3850572109222412],0],
				["images/malecharacter-sheet0.png", 2721611, 1909, 765, 119, 175, 1, 0.462184876203537, 0.5828571319580078,[],[-0.2857138812541962,-0.5771430730819702,0.4117641150951386,-0.5771430730819702,0.4201700985431671,0.3885708451271057,-0.2773108780384064,0.3885708451271057],0],
				["images/malecharacter-sheet0.png", 2721611, 807, 819, 119, 174, 1, 0.462184876203537, 0.5804597735404968,[],[-0.2436968833208084,-0.5287361741065979,0.336136132478714,-0.5287361741065979,0.3277331292629242,0.3850572109222412,-0.2605048716068268,0.3908042311668396],0],
				["images/malecharacter-sheet0.png", 2721611, 1006, 810, 119, 175, 1, 0.462184876203537, 0.5828571319580078,[],[-0.2352938801050186,-0.5542853474617004,0.4201700985431671,-0.5542853474617004,0.4285731017589569,0.3942848443984985,-0.218487873673439,0.3942848443984985],0],
				["images/malecharacter-sheet0.png", 2721611, 1, 822, 118, 174, 1, 0.4661017060279846, 0.5804597735404968,[],[-0.2711877226829529,-0.5459770560264587,0.3898313045501709,-0.5459770560264587,0.3898313045501709,0.396551251411438,-0.2627137005329132,0.396551251411438],0]
			]
			]
,			[
			"FRunningBig",
			5,
			true,
			1,
			0,
			false,
			8983884968434211,
			[
				["images/malecharacter-sheet0.png", 2721611, 586, 162, 175, 160, 1, 0.4914285838603973, 0.574999988079071,[],[-0.3314296007156372,-0.3812499940395355,0.5085713863372803,-0.3999989926815033,0.09714344143867493,0.3749989867210388,-0.33714359998703,0.3874980211257935],0],
				["images/malecharacter-sheet0.png", 2721611, 1436, 318, 171, 156, 1, 0.4912280738353729, 0.5769230723381043,[],[-0.2807020545005798,-0.4294870793819428,0.5087718963623047,-0.4294870793819428,0.0233929455280304,0.4038459062576294,-0.3567250669002533,0.3974359035491943],0],
				["images/malecharacter-sheet0.png", 2721611, 1567, 619, 167, 146, 1, 0.4910179674625397, 0.5753424763679504,[],[-0.2934139668941498,-0.4315064549446106,0.5089820623397827,-0.4383554756641388,0.02994105219841003,0.4109575152397156,-0.3353299498558044,0.4109595417976379],0],
				["images/malecharacter-sheet0.png", 2721611, 1800, 468, 171, 148, 1, 0.4912280738353729, 0.5743243098258972,[],[-0.2982450723648071,-0.4256753027439117,0.4912279546260834,-0.4324313104152679,0.08772090077400208,0.4121606945991516,-0.3216370940208435,0.4054046869277954],0],
				["images/malecharacter-sheet0.png", 2721611, 179, 311, 176, 155, 1, 0.4886363744735718, 0.57419353723526,[],[-0.301137387752533,-0.438709557056427,0.4659096002578735,-0.438709557056427,0.03977364301681519,0.4000004529953003,-0.363637387752533,0.3935474753379822],0],
				["images/malecharacter-sheet0.png", 2721611, 391, 310, 177, 157, 1, 0.491525411605835, 0.5732483863830566,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 762, 162, 175, 160, 1, 0.4914285838603973, 0.574999988079071,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 569, 323, 169, 157, 1, 0.4911242723464966, 0.5732483863830566,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1226, 506, 167, 147, 1, 0.4910179674625397, 0.5782312750816345,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1608, 470, 171, 148, 1, 0.4912280738353729, 0.5743243098258972,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 938, 311, 176, 155, 1, 0.4886363744735718, 0.57419353723526,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1800, 310, 177, 157, 1, 0.491525411605835, 0.5732483863830566,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1624, 309, 175, 160, 1, 0.4914285838603973, 0.574999988079071,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 739, 323, 169, 156, 1, 0.4911242723464966, 0.5769230723381043,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1780, 617, 167, 147, 1, 0.4910179674625397, 0.5782312750816345,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1054, 474, 171, 148, 1, 0.4912280738353729, 0.5743243098258972,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1115, 318, 176, 155, 1, 0.4886363744735718, 0.57419353723526,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1, 311, 177, 156, 1, 0.491525411605835, 0.5769230723381043,[],[],0]
			]
			]
,			[
			"Running",
			10,
			true,
			1,
			0,
			false,
			1759930761226929,
			[
				["images/malecharacter-sheet0.png", 2721611, 1457, 666, 105, 85, 1, 0.4857142865657806, 0.4000000059604645,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 927, 986, 103, 83, 1, 0.485436886548996, 0.3975903689861298,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1, 1080, 101, 77, 1, 0.4851485192775726, 0.3766233623027802,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1349, 1052, 104, 79, 1, 0.4615384638309479, 0.379746824502945,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 256, 995, 104, 82, 1, 0.4615384638309479, 0.4024390280246735,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 399, 933, 107, 83, 1, 0.4766355156898499, 0.3855421543121338,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1631, 896, 105, 85, 1, 0.4857142865657806, 0.4000000059604645,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1031, 1017, 102, 83, 1, 0.4901960790157318, 0.3975903689861298,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 552, 1100, 101, 77, 1, 0.4851485192775726, 0.3766233623027802,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1454, 1056, 104, 79, 1, 0.4615384638309479, 0.379746824502945,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 120, 996, 104, 82, 1, 0.4615384638309479, 0.4024390280246735,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 507, 933, 107, 83, 1, 0.4766355156898499, 0.3855421543121338,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1737, 896, 105, 85, 1, 0.4857142865657806, 0.4000000059604645,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1833, 1025, 102, 83, 1, 0.4901960790157318, 0.3975903689861298,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 932, 1101, 101, 77, 1, 0.4851485192775726, 0.3766233623027802,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1722, 1063, 104, 79, 1, 0.4615384638309479, 0.379746824502945,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1, 997, 104, 82, 1, 0.4615384638309479, 0.4024390280246735,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 615, 933, 107, 83, 1, 0.4766355156898499, 0.3855421543121338,[],[],0]
			]
			]
,			[
			"Jump",
			10,
			true,
			1,
			0,
			false,
			4747534712407667,
			[
				["images/malecharacter-sheet0.png", 2721611, 938, 162, 76, 96, 1, 0.4868420958518982, 0.34375,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 568, 1178, 75, 95, 1, 0.4799999892711639, 0.3473684191703796,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 644, 1235, 75, 95, 1, 0.4799999892711639, 0.3473684191703796,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 927, 819, 75, 96, 1, 0.4799999892711639, 0.34375,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1972, 468, 75, 97, 1, 0.4799999892711639, 0.3402061760425568,[],[],0]
			]
			]
,			[
			"Attack",
			8,
			false,
			1,
			0,
			false,
			9946879683439928,
			[
				["images/malecharacter-sheet0.png", 2721611, 1136, 1111, 100, 77, 1, 0.4600000083446503, 0.3766233623027802,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 86, 1393, 90, 65, 1, 0.4333333373069763, 0.3538461625576019,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 411, 1360, 96, 65, 1, 0.4270833432674408, 0.3538461625576019,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1340, 983, 126, 68, 1, 0.3650793731212616, 0.4264705777168274,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 975, 1189, 118, 62, 1, 0.3813559412956238, 0.4193548262119293,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1467, 983, 119, 72, 1, 0.4117647111415863, 0.4027777910232544,[],[],0]
			]
			]
,			[
			"Fly",
			10,
			true,
			1,
			0,
			false,
			6871346044028741,
			[
				["images/malecharacter-sheet0.png", 2721611, 1722, 982, 110, 80, 1, 0.4636363685131073, 0.387499988079071,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 106, 1079, 110, 74, 1, 0.4636363685131073, 0.3378378450870514,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1237, 1052, 111, 75, 1, 0.4594594538211823, 0.3333333432674408,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 330, 1100, 110, 74, 1, 0.4545454680919647, 0.3243243098258972,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 441, 1100, 110, 74, 1, 0.4545454680919647, 0.3243243098258972,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 676, 1078, 112, 73, 1, 0.4642857015132904, 0.3287671208381653,[],[],0]
			]
			]
,			[
			"Falling",
			10,
			true,
			1,
			0,
			false,
			8936622256727067,
			[
				["images/malecharacter-sheet0.png", 2721611, 524, 1352, 70, 88, 1, 0.5571428537368774, 0.4204545319080353,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1025, 1333, 71, 88, 1, 0.5492957830429077, 0.4204545319080353,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 794, 1361, 70, 88, 1, 0.5571428537368774, 0.4204545319080353,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1764, 1368, 70, 88, 1, 0.5571428537368774, 0.4204545319080353,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1835, 1368, 70, 88, 1, 0.5571428537368774, 0.4204545319080353,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1097, 1333, 71, 88, 1, 0.5492957830429077, 0.4204545319080353,[],[],0]
			]
			]
,			[
			"Death",
			5,
			false,
			1,
			0,
			false,
			5173915387520616,
			[
				["images/malecharacter-sheet0.png", 2721611, 720, 1304, 73, 91, 1, 0.534246563911438, 0.5384615659713745,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 612, 1331, 67, 95, 1, 0.611940324306488, 0.6105263233184815,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 807, 671, 62, 99, 1, 0.6935483813285828, 0.6565656661987305,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 399, 820, 58, 98, 1, 0.8448275923728943, 0.6530612111091614,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1442, 1313, 72, 92, 1, 0.8194444179534912, 0.52173912525177,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1, 1320, 84, 76, 1, 0.7857142686843872, 0.3421052694320679,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1240, 1377, 97, 63, 1, 0.8041236996650696, 0.2380952388048172,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 865, 1393, 102, 59, 1, 0.7745097875595093, 0.1355932205915451,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1032, 1422, 106, 54, 1, 0.7830188870429993, 0.0555555559694767,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1913, 1457, 104, 49, 1, 0.807692289352417, -0.06122449040412903,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1806, 1457, 106, 49, 1, 0.8207547068595886, -0.06122449040412903,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1539, 1499, 107, 46, 1, 0.822429895401001, -0.1521739065647125,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 65, 1459, 110, 46, 1, 0.800000011920929, -0.1521739065647125,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1032, 1477, 113, 45, 1, 0.778761088848114, -0.1777777820825577,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1311, 1498, 113, 44, 1, 0.778761088848114, -0.2045454531908035,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1425, 1499, 113, 44, 1, 0.778761088848114, -0.2045454531908035,[],[],0]
			]
			]
,			[
			"JumpGhost",
			10,
			true,
			1,
			0,
			false,
			3084523083321722,
			[
				["images/malecharacter-sheet0.png", 2721611, 1948, 617, 92, 107, 1, 0.489130437374115, 0.3831775784492493,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1631, 766, 92, 107, 1, 0.489130437374115, 0.3831775784492493,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1126, 823, 91, 107, 1, 0.4835164844989777, 0.3831775784492493,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1218, 823, 91, 107, 1, 0.4835164844989777, 0.3831775784492493,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1310, 835, 91, 107, 1, 0.4835164844989777, 0.3831775784492493,[],[],0]
			]
			]
,			[
			"FallingGhost",
			10,
			true,
			1,
			0,
			false,
			9350298354470341,
			[
				["images/malecharacter-sheet0.png", 2721611, 1906, 1368, 70, 88, 1, 0.5571428537368774, 0.4204545319080353,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 267, 1336, 71, 88, 1, 0.5492957830429077, 0.4204545319080353,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1977, 1368, 70, 88, 1, 0.5571428537368774, 0.4204545319080353,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1681, 1369, 70, 88, 1, 0.5571428537368774, 0.4204545319080353,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1169, 1373, 70, 88, 1, 0.5571428537368774, 0.4204545319080353,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 339, 1336, 71, 88, 1, 0.5492957830429077, 0.4204545319080353,[],[],0]
			]
			]
,			[
			"RunningGhost",
			10,
			true,
			1,
			0,
			false,
			9156656008250356,
			[
				["images/malecharacter-sheet0.png", 2721611, 1402, 897, 105, 85, 1, 0.4857142865657806, 0.4000000059604645,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 723, 994, 103, 83, 1, 0.485436886548996, 0.3975903689861298,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1827, 1109, 101, 77, 1, 0.4851485192775726, 0.3766233623027802,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1559, 1066, 104, 79, 1, 0.4615384638309479, 0.379746824502945,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 361, 1017, 104, 82, 1, 0.4615384638309479, 0.4024390280246735,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1843, 941, 107, 83, 1, 0.4766355156898499, 0.3855421543121338,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1508, 897, 105, 85, 1, 0.4857142865657806, 0.4000000059604645,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1936, 1025, 102, 83, 1, 0.4901960790157318, 0.3975903689861298,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1929, 1109, 101, 77, 1, 0.4851485192775726, 0.3766233623027802,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 827, 1070, 104, 79, 1, 0.4615384638309479, 0.379746824502945,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 466, 1017, 104, 82, 1, 0.4615384638309479, 0.4024390280246735,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1232, 943, 107, 83, 1, 0.4766355156898499, 0.3855421543121338,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1126, 931, 105, 85, 1, 0.4857142865657806, 0.4000000059604645,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1134, 1027, 102, 83, 1, 0.4901960790157318, 0.3975903689861298,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1034, 1111, 101, 77, 1, 0.4851485192775726, 0.3766233623027802,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 225, 1078, 104, 79, 1, 0.4615384638309479, 0.379746824502945,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 571, 1017, 104, 82, 1, 0.4615384638309479, 0.4024390280246735,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1614, 982, 107, 83, 1, 0.4766355156898499, 0.3855421543121338,[],[],0]
			]
			]
,			[
			"JumpBig",
			5,
			true,
			1,
			0,
			false,
			9617677007930141,
			[
				["images/malecharacter-sheet0.png", 2721611, 179, 467, 143, 184, 1, 0.4545454680919647, 0.4402174055576325,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 909, 467, 144, 182, 1, 0.4513888955116272, 0.4395604431629181,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 323, 468, 143, 181, 1, 0.4545454680919647, 0.4419889450073242,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1, 468, 142, 184, 1, 0.4577464759349823, 0.4402174055576325,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1292, 318, 143, 187, 1, 0.4545454680919647, 0.4385026693344116,[],[],0]
			]
			]
,			[
			"FallingBig",
			5,
			true,
			1,
			0,
			false,
			7668444502021763,
			[
				["images/malecharacter-sheet0.png", 2721611, 870, 650, 135, 168, 1, 0.5407407283782959, 0.5595238208770752,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 144, 652, 135, 168, 1, 0.5407407283782959, 0.5595238208770752,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1, 653, 135, 168, 1, 0.5407407283782959, 0.5595238208770752,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 323, 650, 135, 169, 1, 0.5407407283782959, 0.5621301531791687,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1185, 654, 135, 168, 1, 0.5407407283782959, 0.5595238208770752,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1321, 666, 135, 168, 1, 0.5407407283782959, 0.5595238208770752,[],[],0]
			]
			]
,			[
			"RunningBig",
			5,
			true,
			1,
			0,
			false,
			5963667651231977,
			[
				["images/malecharacter-sheet0.png", 2721611, 413, 1, 203, 160, 1, 0.467980295419693, 0.53125,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1842, 1, 197, 158, 1, 0.4670050740242004, 0.5316455960273743,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 391, 162, 194, 147, 1, 0.469072163105011, 0.5306122303009033,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1624, 159, 200, 149, 1, 0.4699999988079071, 0.5302013158798218,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1230, 1, 203, 157, 1, 0.467980295419693, 0.5286624431610107,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1, 1, 205, 160, 1, 0.4682926833629608, 0.53125,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 617, 1, 203, 160, 1, 0.467980295419693, 0.53125,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1230, 159, 196, 158, 1, 0.4693877696990967, 0.5316455960273743,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1, 162, 194, 148, 1, 0.469072163105011, 0.5337837934494019,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1825, 160, 200, 149, 1, 0.4699999988079071, 0.5302013158798218,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1434, 1, 203, 157, 1, 0.467980295419693, 0.5286624431610107,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 207, 1, 205, 160, 1, 0.4682926833629608, 0.53125,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 821, 1, 203, 160, 1, 0.467980295419693, 0.53125,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1427, 159, 196, 158, 1, 0.4693877696990967, 0.5316455960273743,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 196, 162, 194, 148, 1, 0.469072163105011, 0.5337837934494019,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1025, 161, 200, 149, 1, 0.4699999988079071, 0.5302013158798218,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1638, 1, 203, 157, 1, 0.467980295419693, 0.5286624431610107,[],[],0],
				["images/malecharacter-sheet0.png", 2721611, 1025, 1, 204, 159, 1, 0.4656862616539002, 0.5283018946647644,[],[],0]
			]
			]
		],
		[
		[
			"Pin",
			cr.behaviors.Pin,
			7986113057455688
		]
,		[
			"Flash",
			cr.behaviors.Flash,
			7854652727160149
		]
		],
		false,
		false,
		9960358219038814,
		[],
		null
	]
,	[
		"t88",
		cr.plugins_.Sprite,
		false,
		[7777726066682563,9170666888505884,2853523233455571,7263761841954357,5058026353017428,1283782907044434,5129635185846162,6478573028578121,9469337988168837,1320501910262767,768845603899166,7100344585492272,3718655756629012,4295215298686768,5907570138208699,7852345196392764],
		2,
		0,
		null,
		[
			[
			"Default",
			5,
			false,
			1,
			0,
			false,
			3484545808676013,
			[
				["images/player-sheet0.png", 590, 0, 0, 60, 75, 1, 0.5, 0.4533333480358124,[["Shoot", 1.416666626930237, 0.4799999892711639],["Psychic", 0.4666666686534882, 0.09333333373069763]],[],0]
			]
			]
		],
		[
		[
			"Platform",
			cr.behaviors.Platform,
			1495299316126307
		]
,		[
			"Timer",
			cr.behaviors.Timer,
			8979444749646926
		]
		],
		false,
		false,
		3081926936619379,
		[],
		null
	]
,	[
		"t89",
		cr.plugins_.Sprite,
		false,
		[],
		2,
		0,
		null,
		[
			[
			"Default",
			5,
			false,
			1,
			0,
			false,
			5496530519981275,
			[
				["images/scroller-sheet0.png", 93, 0, 0, 36, 37, 1, 0.5, 0.5135135054588318,[],[],1]
			]
			]
		],
		[
		[
			"Bullet",
			cr.behaviors.Bullet,
			8947377126000661
		]
,		[
			"ScrollTo",
			cr.behaviors.scrollto,
			9233805176429378
		]
		],
		false,
		false,
		6132713933349234,
		[],
		null
	]
,	[
		"t90",
		cr.plugins_.Sprite,
		false,
		[],
		0,
		0,
		null,
		[
			[
			"Default",
			0,
			false,
			1,
			0,
			false,
			3374559385318503,
			[
				["images/trampoline-sheet0.png", 14915, 1, 113, 142, 75, 1, 0.5, 0.5066666603088379,[],[-0.5,-0.5066666603088379,0.007041990756988525,-0.4933333694934845,0.5,-0.5066666603088379,0.5,0.1200003623962402,-0.5,0.1200003623962402],0],
				["images/trampoline-sheet0.png", 14915, 1, 1, 169, 111, 1, 0.5029585957527161, 0.5045045018196106,[],[-0.5029585957527161,-0.4864864051342011,4.172325134277344e-007,-0.495495468378067,0.4792904257774353,-0.5045045018196106,0.4792894124984741,0.06306350231170654,0.2485203742980957,0.1171175241470337,-0.005917608737945557,0.1891894936561585,-0.2958576083183289,0.1801804900169373,-0.5029585957527161,-0.01801851391792297],0]
			]
			]
		],
		[
		],
		false,
		false,
		6386199093038189,
		[],
		null
	]
,	[
		"t91",
		cr.plugins_.Sprite,
		true,
		[],
		0,
		0,
		null,
		null,
		[
		],
		false,
		false,
		7112504246264429,
		[],
		null
	]
,	[
		"t92",
		cr.plugins_.Sprite,
		true,
		[3210903026506017,1705873150102724,1046327400291959,3390278825925955,686710973389827,6957622857604928],
		1,
		0,
		null,
		null,
		[
		[
			"Platform2",
			cr.behaviors.Platform,
			8411593858291846
		]
		],
		false,
		false,
		7687073725987701,
		[],
		null
	]
,	[
		"t93",
		cr.plugins_.Sprite,
		true,
		[8402327824303473,6095479695682794,6328720658310719,9578525172193539,6246363997393237],
		1,
		0,
		null,
		null,
		[
		[
			"Bullet2",
			cr.behaviors.Bullet,
			112141600362237
		]
		],
		false,
		false,
		7978940075109623,
		[],
		null
	]
,	[
		"t94",
		cr.plugins_.Sprite,
		true,
		[6934607661895929,6389642997591994,7628070348984842],
		0,
		0,
		null,
		null,
		[
		],
		false,
		false,
		8091042711796831,
		[],
		null
	]
,	[
		"t95",
		cr.plugins_.Sprite,
		true,
		[],
		2,
		0,
		null,
		null,
		[
		[
			"Platform2",
			cr.behaviors.Platform,
			4535279721536393
		]
,		[
			"Jumpthru2",
			cr.behaviors.jumpthru,
			6337075826516832
		]
		],
		false,
		false,
		2095925165677553,
		[],
		null
	]
,	[
		"t96",
		cr.plugins_.Sprite,
		true,
		[],
		0,
		0,
		null,
		null,
		[
		],
		false,
		false,
		9235246707073822,
		[],
		null
	]
	],
	[
		[91,6,0,1,7,90]
,		[92,47,48,50,51,53,54]
,		[93,17,18,22,20]
,		[94,12,11,13,14,15]
,		[95,6,0]
,		[96,29,30,31]
	],
	[
	[
		"Level1",
		7500,
		900,
		false,
		"GameEventSheet",
		7652786728888301,
		[
		[
			"Background",
			0,
			4164923967362499,
			true,
			[255, 255, 255],
			false,
			0.02999999932944775,
			0,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[0, 0, 0, 7500, 900, 0, 0, 1, 0, 0, 0, 0, []],
				8,
				0,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					0
				]
			]
			],
			[			]
		]
,		[
			"Parallax",
			1,
			161431331037807,
			true,
			[255, 255, 255],
			true,
			0.800000011920929,
			0.800000011920929,
			1,
			false,
			1,
			0,
			2,
			[
			[
				[2, 199, 0, 7500, 706, 0, 0, 1, 0, 0, 0, 0, []],
				10,
				20,
				[
				],
				[
				],
				[
					0,
					0
				]
			]
			],
			[			]
		]
,		[
			"Platform",
			2,
			9576381942999719,
			true,
			[255, 255, 255],
			true,
			1,
			1,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[280, 832, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				48,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[694, 832, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				3,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[1013, 832, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				150,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[1379, 683, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				149,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[1744, 682, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				147,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[2098, 682, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				54,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[2300, 434, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				49,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[2759, 799, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				18,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[3714, 807, 0, 541, 295, 0, 0, 1, 0.4676524996757507, 0.7389830350875855, 0, 0, []],
				7,
				23,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					1,
					1
				]
			]
,			[
				[4827, 650, 0, 541, 295, 0, 0, 1, 0.4676524996757507, 0.7389830350875855, 0, 0, []],
				7,
				24,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					1,
					1
				]
			]
,			[
				[5231, 650, 0, 541, 295, 0, 0, 1, 0.4676524996757507, 0.7389830350875855, 0, 0, []],
				7,
				25,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					1,
					1
				]
			]
,			[
				[4201, 650, 0, 463, 393, 0, 0, 1, 0.4362851083278656, 0.7302799224853516, 0, 0, []],
				7,
				27,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					3,
					1
				]
			]
,			[
				[5548, 646, 0, 261, 199, 0, 0, 1, 0.5019156932830811, 0.6934673190116882, 0, 0, []],
				7,
				36,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					5,
					1
				]
			]
,			[
				[1952, 434, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				4835,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[3090, 799, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				4836,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[6048, 786, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				809,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[6536, 568, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				810,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[6920, 568, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				812,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[7382, 346, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				813,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
			],
			[			]
		]
,		[
			"Game",
			3,
			9131324589673273,
			true,
			[255, 255, 255],
			true,
			1,
			1,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[143, 709, 0, 60, 75, 0, 0, 1, 0.5, 0.4533333480358124, 0, 0, []],
				88,
				1,
				[
					[0],
					[0],
					[1],
					[1],
					[0],
					[0],
					[1],
					[0],
					[0],
					[0],
					[0],
					[0],
					[0],
					[1],
					[0],
					[0]
				],
				[
				[
					250,
					10000,
					10000,
					400,
					1300,
					1000,
					0,
					1
				],
				[
				]
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[153, 704, 0, 105, 85, 0, 0, 1, 0.4857142865657806, 0.4000000059604645, 0, 0, []],
				87,
				6,
				[
				],
				[
				[
				],
				[
				]
				],
				[
					0,
					"Running",
					0,
					1
				]
			]
,			[
				[598, 1080, 0, 36, 37, 0, -1.570799946784973, 1, 0.5, 0.5135135054588318, 0, 0, []],
				89,
				108,
				[
				],
				[
				[
					400,
					0,
					0,
					0,
					1,
					1
				],
				[
					1
				]
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[164, 718, 0, 150, 150, 0, 0, 1, 0.4933333396911621, 0.5133333206176758, 0, 0, []],
				24,
				22,
				[
				],
				[
				[
				]
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[3003, 1087, 0, 75, 75, 0, 0, 1, 0.5199999809265137, 0.5199999809265137, 0, 0, []],
				23,
				71,
				[
					["Tornado"]
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[1950, 315, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				141,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[2926, 677, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				2,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[3571, 679, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				8,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[499, 714, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				14,
				[
					["Bronze"],
					[5],
					[5],
					[5]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[2041, 300, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				28,
				[
					["Bronze"],
					[5],
					[5],
					[5]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[3663, 565, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				30,
				[
					["Bronze"],
					[5],
					[5],
					[5]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[4750, 501, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				31,
				[
					["Bronze"],
					[5],
					[10],
					[10]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[1585, 550, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				802,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[4402, 416, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				803,
				[
					["Bronze"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[4438, 371, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				804,
				[
					["Bronze"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[4490, 343, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				805,
				[
					["Bronze"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[4582, 389, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				806,
				[
					["Bronze"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[4537, 349, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				807,
				[
					["Bronze"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[4610, 423, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				808,
				[
					["Bronze"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[5578, 501, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				811,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[6269, 445, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				814,
				[
					["Bronze"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[6253, 496, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				815,
				[
					["Bronze"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[6241, 600, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				816,
				[
					["Bronze"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[6249, 547, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				817,
				[
					["Bronze"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[6329, 409, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				818,
				[
					["Bronze"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[6785, 425, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				819,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
			],
			[			]
		]
,		[
			"ParallaxFront",
			4,
			2906178361286426,
			true,
			[255, 255, 255],
			true,
			1.200000047683716,
			1,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[3, 828, 0, 7500, 153, 0, 0, 1, 0, 0, 0, 0, []],
				9,
				21,
				[
				],
				[
				],
				[
					0,
					0
				]
			]
			],
			[			]
		]
,		[
			"UI",
			5,
			4185886419463075,
			true,
			[255, 255, 255],
			true,
			0,
			0,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[440, 46, 0, 92, 90, 0, 0, 1, 0.5, 0.5222222208976746, 0, 0, []],
				21,
				140,
				[
				],
				[
				[
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[522, 43, 0, 50, 50, 0, 0, 1, 0.5, 0.5199999809265137, 0, 0, []],
				26,
				302,
				[
				],
				[
				[
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[897, 534, 0, 131, 127, 0, 0, 0.5, 0.5038167834281921, 0.5039370059967041, 0, 0, []],
				39,
				324,
				[
				],
				[
				],
				[
					1,
					"Default",
					0,
					0
				]
			]
,			[
				[66, 535, 0, 130, 127, 0, 0, 0.5, 0.5, 0.5039370059967041, 0, 0, []],
				36,
				325,
				[
				],
				[
				],
				[
					1,
					"Default",
					0,
					0
				]
			]
,			[
				[208, 248, 0, 357, 42, 0, 0, 1, 0, 0, 0, 0, []],
				38,
				56,
				[
				],
				[
				],
				[
					"Paused. click 'P' to resume the game",
					1,
					"16pt Arial",
					"rgb(0,0,0)",
					0,
					0,
					0,
					0,
					0
				]
			]
,			[
				[205.4748992919922, 30.24537658691406, 0, 46, 46, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				32,
				73,
				[
					[1]
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[253.4053192138672, 31.80824279785156, 0, 46, 46, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				32,
				9,
				[
					[2]
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[298.7312316894531, 31.28722381591797, 0, 46, 46, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				32,
				74,
				[
					[3]
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[272, 158, 0, 307, 50, 0, 0, 1, 0, 0, 0, 0, []],
				42,
				308,
				[
				],
				[
				],
				[
					"",
					1,
					"bold 24pt Arial",
					"rgb(255,255,255)",
					0,
					0,
					0,
					0,
					0
				]
			]
,			[
				[870, 93, 0, 62, 64, 0, 0, 1, 0.4838709533214569, 0.53125, 0, 0, []],
				28,
				170,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[870, 41, 0, 76, 76, 0, 0, 1, 0.5, 0.5789473652839661, 0, 0, []],
				28,
				311,
				[
				],
				[
				],
				[
					0,
					"Distance",
					0,
					1
				]
			]
,			[
				[730, 12, 0, 109, 45, 0, 0, 1, 0, 0, 0, 0, []],
				35,
				312,
				[
				],
				[
				],
				[
					"Text",
					0,
					"italic 18pt Arial Rounded MT Bold",
					"rgb(204,255,0)",
					1,
					1,
					0,
					0,
					0
				]
			]
,			[
				[730, 68, 0, 104.8147277832031, 47.73084259033203, 0, 0, 1, 0, 0, 0, 0, []],
				33,
				313,
				[
				],
				[
				],
				[
					"Text",
					0,
					"italic 18pt Arial Rounded MT Bold",
					"rgb(204,255,0)",
					1,
					1,
					0,
					0,
					0
				]
			]
,			[
				[127, 476, 0, 250, 250, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				44,
				487,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[835, 474, 0, 250, 250, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				45,
				488,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[64, 29, 0, 100, 31, 0, 0, 1, 0.5, 0.5161290168762207, 0, 0, []],
				68,
				255,
				[
				],
				[
				],
				[
					0,
					"Small",
					0,
					1
				]
			]
,			[
				[483, 301, 0, 1000, 610, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				37,
				326,
				[
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[927, 35, 0, 76, 70, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				46,
				1859,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[600, 371, 0, 178, 53, 0, 0, 1, 0.5, 0.5094339847564697, 0, 0, []],
				86,
				4036,
				[
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[363, 371, 0, 178, 53, 0, 0, 1, 0.502439022064209, 0.5068492889404297, 0, 0, []],
				85,
				4059,
				[
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[132, 520, 0, 255, 123, 0, 0, 1, 0.47843137383461, 0.4552845656871796, 0, 0, []],
				34,
				229,
				[
				],
				[
				[
				]
				],
				[
					0,
					"Default",
					0,
					0
				]
			]
			],
			[			]
		]
		],
		[
		],
		[]
	]
,	[
		"Level2",
		7400,
		900,
		false,
		"GameEventSheet",
		8962581449135788,
		[
		[
			"Background",
			0,
			6365064465731231,
			true,
			[255, 255, 255],
			false,
			0.02999999932944775,
			0,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[0, 0, 0, 7400, 900, 0, 0, 1, 0, 0, 0, 0, []],
				8,
				32,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					0
				]
			]
			],
			[			]
		]
,		[
			"Parallax",
			1,
			1408075462311611,
			true,
			[255, 255, 255],
			true,
			0.800000011920929,
			0.800000011920929,
			1,
			false,
			1,
			0,
			2,
			[
			[
				[2, 199, 0, 7400, 706, 0, 0, 1, 0, 0, 0, 0, []],
				10,
				33,
				[
				],
				[
				],
				[
					0,
					0
				]
			]
			],
			[			]
		]
,		[
			"Platform",
			2,
			6255386223523364,
			true,
			[255, 255, 255],
			true,
			1,
			1,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[280, 832, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				37,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[694, 832, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				38,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[1038, 682, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				39,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[1162, 500, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				40,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[1409, 682, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				41,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[1826, 793, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				42,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[2135, 499, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				43,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[2191, 793, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				44,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[3313, 490, 0, 541, 295, 0, 0, 1, 0.4676524996757507, 0.7389830350875855, 0, 0, []],
				7,
				46,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					1,
					1
				]
			]
,			[
				[5507, 855, 0, 223, 207, 0, 0, 1, 0.5291479825973511, 0.6763284802436829, 0, 0, []],
				7,
				47,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					4,
					1
				]
			]
,			[
				[5016, 853, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				50,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[3146, 840, 0, 463, 393, 0, 0, 1, 0.4362851083278656, 0.7302799224853516, 0, 0, []],
				7,
				51,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					3,
					1
				]
			]
,			[
				[5830, 853, 0, 223, 207, 0, 0, 1, 0.5291479825973511, 0.6763284802436829, 0, 0, []],
				7,
				53,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					4,
					1
				]
			]
,			[
				[1524, 499, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				62,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[2707, 661, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				63,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[3728, 739, 0, 463, 393, 0, 0, 1, 0.4362851083278656, 0.7302799224853516, 0, 0, []],
				7,
				372,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					3,
					1
				]
			]
,			[
				[4376, 758, 0, 541, 295, 0, 0, 1, 0.4676524996757507, 0.7389830350875855, 0, 0, []],
				7,
				373,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					1,
					1
				]
			]
,			[
				[6157, 851, 0, 223, 207, 0, 0, 1, 0.5291479825973511, 0.6763284802436829, 0, 0, []],
				7,
				374,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					4,
					1
				]
			]
,			[
				[6643, 330, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				375,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[6956, 330, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				376,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[7210, 330, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				377,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
			],
			[			]
		]
,		[
			"Game",
			3,
			8140684821179873,
			true,
			[255, 255, 255],
			true,
			1,
			1,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[143, 709, 0, 60, 75, 0, 0, 1, 0.5, 0.4533333480358124, 0, 0, []],
				88,
				64,
				[
					[0],
					[0],
					[1],
					[1],
					[0],
					[0],
					[1],
					[0],
					[0],
					[0],
					[0],
					[0],
					[0],
					[1],
					[0],
					[0]
				],
				[
				[
					250,
					10000,
					10000,
					400,
					1300,
					1000,
					0,
					1
				],
				[
				]
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[153, 704, 0, 105, 85, 0, 0, 1, 0.4857142865657806, 0.4000000059604645, 0, 0, []],
				87,
				65,
				[
				],
				[
				[
				],
				[
				]
				],
				[
					0,
					"Running",
					0,
					1
				]
			]
,			[
				[598, 1080, 0, 36, 37, 0, -1.570799946784973, 1, 0.5, 0.5135135054588318, 0, 0, []],
				89,
				69,
				[
				],
				[
				[
					400,
					0,
					0,
					0,
					1,
					1
				],
				[
					1
				]
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[164, 718, 0, 150, 150, 0, 0, 1, 0.4933333396911621, 0.5133333206176758, 0, 0, []],
				24,
				86,
				[
				],
				[
				[
				]
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[1396, 378, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				93,
				[
					["groundMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[2062, 384, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				94,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[1270, 568, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				96,
				[
					["Bronze"],
					[5],
					[5],
					[5]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[2053, 374, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				97,
				[
					["Silver"],
					[5],
					[5],
					[5]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[3124, 376, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				98,
				[
					["Bronze"],
					[5],
					[10],
					[10]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[4789, 508, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				99,
				[
					["Bronze"],
					[5],
					[10],
					[5]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[6196, 783, 0, 142, 75, 0, 0, 1, 0.5, 0.5066666603088379, 0, 0, []],
				90,
				378,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[1043, 391, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				379,
				[
					["Bronze"],
					[5],
					[17],
					[17]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[3057, 726, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				381,
				[
					["Silver"],
					[5],
					[5],
					[5]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[3989, 503, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				382,
				[
					["Bronze"],
					[5],
					[5],
					[5]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[2383, 669, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				95,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[3536, 351, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				380,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[4559, 627, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				383,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[5826, 718, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				385,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[6516, 212, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				384,
				[
					["Bronze"],
					[5],
					[15],
					[15]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
			],
			[			]
		]
,		[
			"ParallaxFront",
			4,
			2488031250530929,
			true,
			[255, 255, 255],
			true,
			1.200000047683716,
			1,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[3, 828, 0, 7400, 153, 0, 0, 1, 0, 0, 0, 0, []],
				9,
				123,
				[
				],
				[
				],
				[
					0,
					0
				]
			]
			],
			[			]
		]
,		[
			"UI",
			5,
			4165238967015221,
			true,
			[255, 255, 255],
			true,
			0,
			0,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[440, 46, 0, 92, 90, 0, 0, 1, 0.5, 0.5222222208976746, 0, 0, []],
				21,
				133,
				[
				],
				[
				[
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[522, 43, 0, 50, 50, 0, 0, 1, 0.5, 0.5199999809265137, 0, 0, []],
				26,
				134,
				[
				],
				[
				[
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[897, 534, 0, 131, 127, 0, 0, 0.5, 0.5038167834281921, 0.5039370059967041, 0, 0, []],
				39,
				139,
				[
				],
				[
				],
				[
					1,
					"Default",
					0,
					0
				]
			]
,			[
				[66, 535, 0, 130, 127, 0, 0, 0.5, 0.5, 0.5039370059967041, 0, 0, []],
				36,
				159,
				[
				],
				[
				],
				[
					1,
					"Default",
					0,
					0
				]
			]
,			[
				[208, 248, 0, 357, 42, 0, 0, 1, 0, 0, 0, 0, []],
				38,
				205,
				[
				],
				[
				],
				[
					"Paused. click 'P' to resume the game",
					1,
					"16pt Arial",
					"rgb(0,0,0)",
					0,
					0,
					0,
					0,
					0
				]
			]
,			[
				[205.4748992919922, 30.24537658691406, 0, 46, 46, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				32,
				208,
				[
					[1]
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[253.4053192138672, 31.80824279785156, 0, 46, 46, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				32,
				216,
				[
					[2]
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[298.7312316894531, 31.28722381591797, 0, 46, 46, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				32,
				217,
				[
					[3]
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[132, 520, 0, 255, 123, 0, 0, 1, 0.47843137383461, 0.4552845656871796, 0, 0, []],
				34,
				219,
				[
				],
				[
				[
				]
				],
				[
					0,
					"Default",
					0,
					0
				]
			]
,			[
				[272, 158, 0, 307, 50, 0, 0, 1, 0, 0, 0, 0, []],
				42,
				225,
				[
				],
				[
				],
				[
					"",
					1,
					"bold 24pt Arial",
					"rgb(255,255,255)",
					0,
					0,
					0,
					0,
					0
				]
			]
,			[
				[870, 93, 0, 62, 64, 0, 0, 1, 0.4838709533214569, 0.53125, 0, 0, []],
				28,
				250,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[870, 41, 0, 76, 76, 0, 0, 1, 0.5, 0.5789473652839661, 0, 0, []],
				28,
				262,
				[
				],
				[
				],
				[
					0,
					"Distance",
					0,
					1
				]
			]
,			[
				[730, 12, 0, 109, 45, 0, 0, 1, 0, 0, 0, 0, []],
				35,
				267,
				[
				],
				[
				],
				[
					"Text",
					0,
					"italic 18pt Arial Rounded MT Bold",
					"rgb(204,255,0)",
					1,
					1,
					0,
					0,
					0
				]
			]
,			[
				[730, 68, 0, 104.8147277832031, 47.73084259033203, 0, 0, 1, 0, 0, 0, 0, []],
				33,
				274,
				[
				],
				[
				],
				[
					"Text",
					0,
					"italic 18pt Arial Rounded MT Bold",
					"rgb(204,255,0)",
					1,
					1,
					0,
					0,
					0
				]
			]
,			[
				[127, 476, 0, 250, 250, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				44,
				321,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[835, 474, 0, 250, 250, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				45,
				354,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[64, 29, 0, 100, 31, 0, 0, 1, 0.5, 0.5161290168762207, 0, 0, []],
				68,
				371,
				[
				],
				[
				],
				[
					0,
					"Small",
					0,
					1
				]
			]
,			[
				[483, 301, 0, 1000, 610, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				37,
				199,
				[
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[927, 35, 0, 76, 70, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				46,
				2001,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[600, 371, 0, 178, 53, 0, 0, 1, 0.5, 0.5094339847564697, 0, 0, []],
				86,
				4037,
				[
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[363, 371, 0, 178, 53, 0, 0, 1, 0.502439022064209, 0.5068492889404297, 0, 0, []],
				85,
				4060,
				[
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
			],
			[			]
		]
		],
		[
		],
		[]
	]
,	[
		"Level3",
		9500,
		900,
		false,
		"GameEventSheet",
		8137963141519706,
		[
		[
			"Background",
			0,
			832483056046374,
			true,
			[255, 255, 255],
			false,
			0.02999999932944775,
			0,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[0, 0, 0, 9500, 900, 0, 0, 1, 0, 0, 0, 0, []],
				8,
				537,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					0
				]
			]
			],
			[			]
		]
,		[
			"Parallax",
			1,
			6658915823878556,
			true,
			[255, 255, 255],
			true,
			0.800000011920929,
			0.800000011920929,
			1,
			false,
			1,
			0,
			2,
			[
			[
				[2, 199, 0, 9500, 706, 0, 0, 1, 0, 0, 0, 0, []],
				10,
				538,
				[
				],
				[
				],
				[
					0,
					0
				]
			]
			],
			[			]
		]
,		[
			"Platform",
			2,
			3247273506815478,
			true,
			[255, 255, 255],
			true,
			1,
			1,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[261, 355, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				539,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[1474, 585, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				540,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[880, 815, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				541,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[2030, 577, 0, 143, 131, 0, 0, 1, 0.4755244851112366, 0.6564885377883911, 0, 0, []],
				7,
				542,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					6,
					1
				]
			]
,			[
				[3860, 582, 0, 223, 207, 0, 0, 1, 0.5291479825973511, 0.6763284802436829, 0, 0, []],
				7,
				548,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					4,
					1
				]
			]
,			[
				[6499, 335, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				549,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[6950, 335, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				550,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[6791, 335, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				551,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[2311, 776, 0, 143, 131, 0, 0, 1, 0.4755244851112366, 0.6564885377883911, 0, 0, []],
				7,
				552,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					6,
					1
				]
			]
,			[
				[2586, 554, 0, 143, 131, 0, 0, 1, 0.4755244851112366, 0.6564885377883911, 0, 0, []],
				7,
				553,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					6,
					1
				]
			]
,			[
				[2808, 266, 0, 143, 131, 0, 0, 1, 0.4755244851112366, 0.6564885377883911, 0, 0, []],
				7,
				554,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					6,
					1
				]
			]
,			[
				[2314, 328, 0, 143, 131, 0, 0, 1, 0.4755244851112366, 0.6564885377883911, 0, 0, []],
				7,
				555,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					6,
					1
				]
			]
,			[
				[3028, 546, 0, 143, 131, 0, 0, 1, 0.4755244851112366, 0.6564885377883911, 0, 0, []],
				7,
				556,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					6,
					1
				]
			]
,			[
				[3424, 550, 0, 143, 131, 0, 0, 1, 0.4755244851112366, 0.6564885377883911, 0, 0, []],
				7,
				557,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					6,
					1
				]
			]
,			[
				[4295, 817, 0, 223, 207, 0, 0, 1, 0.5291479825973511, 0.6763284802436829, 0, 0, []],
				7,
				558,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					4,
					1
				]
			]
,			[
				[4949, 572, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				559,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[5446, 335, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				560,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[6122, 335, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				561,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[5779, 335, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				562,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[7525, 771, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				563,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[7589, 336, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				564,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[8163, 609, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				565,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[8814, 374, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				566,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[9438, 374, 0, 223, 207, 0, 0, 1, 0.5291479825973511, 0.6763284802436829, 0, 0, []],
				7,
				567,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					4,
					1
				]
			]
,			[
				[4533, 680, 0, 223, 207, 0, 0, 1, 0.5291479825973511, 0.6763284802436829, 0, 0, []],
				7,
				568,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					4,
					1
				]
			]
			],
			[			]
		]
,		[
			"Game",
			3,
			2356003771962606,
			true,
			[255, 255, 255],
			true,
			1,
			1,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[91, 228, 0, 60, 75, 0, 0, 1, 0.5, 0.4533333480358124, 0, 0, []],
				88,
				569,
				[
					[0],
					[0],
					[1],
					[1],
					[0],
					[0],
					[1],
					[0],
					[0],
					[0],
					[0],
					[0],
					[0],
					[1],
					[0],
					[0]
				],
				[
				[
					250,
					10000,
					10000,
					400,
					1300,
					1000,
					0,
					1
				],
				[
				]
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[101, 223, 0, 105, 85, 0, 0, 1, 0.4857142865657806, 0.4000000059604645, 0, 0, []],
				87,
				570,
				[
				],
				[
				[
				],
				[
				]
				],
				[
					0,
					"Running",
					0,
					1
				]
			]
,			[
				[598, 1080, 0, 36, 37, 0, -1.570799946784973, 1, 0.5, 0.5135135054588318, 0, 0, []],
				89,
				574,
				[
				],
				[
				[
					400,
					0,
					0,
					0,
					1,
					1
				],
				[
					1
				]
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[112, 237, 0, 150, 150, 0, 0, 1, 0.4933333396911621, 0.5133333206176758, 0, 0, []],
				24,
				582,
				[
				],
				[
				[
				]
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[1594, 371, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				588,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[775, 697, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				589,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[2031, 465, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				590,
				[
					["Silver"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[1288, 458, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				591,
				[
					["Silver"],
					[5],
					[8],
					[8]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[3791, 460, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				593,
				[
					["Bronze"],
					[5],
					[3],
					[3]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[2590, 452, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				594,
				[
					["Gold"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[2316, 671, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				595,
				[
					["Gold"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[2321, 217, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				596,
				[
					["Bronze"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[2810, 165, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				597,
				[
					["Silver"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[3032, 440, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				598,
				[
					["Gold"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[1337, 371, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				599,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[2318, 673, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				600,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[4315, 651, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				601,
				[
					["groundMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[3426, 460, 0, 75, 75, 0, 0, 1, 0.4608695507049561, 0.7053571343421936, 0, 0, []],
				25,
				603,
				[
					["Shield"]
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[4789, 332, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				604,
				[
					["Bronze"],
					[5],
					[8],
					[8]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[5560, 143, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				605,
				[
					["groundMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[6161, 142, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				606,
				[
					["groundMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[6927, 146, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				607,
				[
					["groundMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[5697, 99, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				608,
				[
					["Bronze"],
					[5],
					[30],
					[30]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[5824, 29, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				609,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[6586, 29, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				610,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[7548, 558, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				611,
				[
					["groundMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[7924, 384, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				612,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[8683, 192, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				613,
				[
					["groundMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[8612, 250, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				614,
				[
					["Bronze"],
					[5],
					[7],
					[7]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[4811, 441, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				615,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[5053, 445, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				616,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
			],
			[			]
		]
,		[
			"ParallaxFront",
			4,
			2761280577550839,
			true,
			[255, 255, 255],
			true,
			1.200000047683716,
			1,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[3, 828, 0, 9500, 153, 0, 0, 1, 0, 0, 0, 0, []],
				9,
				617,
				[
				],
				[
				],
				[
					0,
					0
				]
			]
			],
			[			]
		]
,		[
			"UI",
			5,
			7595755604563278,
			true,
			[255, 255, 255],
			true,
			0,
			0,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[440, 46, 0, 92, 90, 0, 0, 1, 0.5, 0.5222222208976746, 0, 0, []],
				21,
				618,
				[
				],
				[
				[
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[522, 43, 0, 50, 50, 0, 0, 1, 0.5, 0.5199999809265137, 0, 0, []],
				26,
				619,
				[
				],
				[
				[
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[897, 534, 0, 131, 127, 0, 0, 0.5, 0.5038167834281921, 0.5039370059967041, 0, 0, []],
				39,
				620,
				[
				],
				[
				],
				[
					1,
					"Default",
					0,
					0
				]
			]
,			[
				[66, 535, 0, 130, 127, 0, 0, 0.5, 0.5, 0.5039370059967041, 0, 0, []],
				36,
				621,
				[
				],
				[
				],
				[
					1,
					"Default",
					0,
					0
				]
			]
,			[
				[208, 248, 0, 357, 42, 0, 0, 1, 0, 0, 0, 0, []],
				38,
				623,
				[
				],
				[
				],
				[
					"Paused. click 'P' to resume the game",
					1,
					"16pt Arial",
					"rgb(0,0,0)",
					0,
					0,
					0,
					0,
					0
				]
			]
,			[
				[205.4748992919922, 30.24537658691406, 0, 46, 46, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				32,
				624,
				[
					[1]
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[253.4053192138672, 31.80824279785156, 0, 46, 46, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				32,
				625,
				[
					[2]
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[298.7312316894531, 31.28722381591797, 0, 46, 46, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				32,
				626,
				[
					[3]
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[132, 520, 0, 255, 123, 0, 0, 1, 0.47843137383461, 0.4552845656871796, 0, 0, []],
				34,
				627,
				[
				],
				[
				[
				]
				],
				[
					0,
					"Default",
					0,
					0
				]
			]
,			[
				[272, 158, 0, 307, 50, 0, 0, 1, 0, 0, 0, 0, []],
				42,
				628,
				[
				],
				[
				],
				[
					"",
					1,
					"bold 24pt Arial",
					"rgb(255,255,255)",
					0,
					0,
					0,
					0,
					0
				]
			]
,			[
				[870, 93, 0, 62, 64, 0, 0, 1, 0.4838709533214569, 0.53125, 0, 0, []],
				28,
				629,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[870, 41, 0, 76, 76, 0, 0, 1, 0.5, 0.5789473652839661, 0, 0, []],
				28,
				630,
				[
				],
				[
				],
				[
					0,
					"Distance",
					0,
					1
				]
			]
,			[
				[730, 12, 0, 109, 45, 0, 0, 1, 0, 0, 0, 0, []],
				35,
				631,
				[
				],
				[
				],
				[
					"Text",
					0,
					"italic 18pt Arial Rounded MT Bold",
					"rgb(204,255,0)",
					1,
					1,
					0,
					0,
					0
				]
			]
,			[
				[730, 68, 0, 104.8147277832031, 47.73084259033203, 0, 0, 1, 0, 0, 0, 0, []],
				33,
				632,
				[
				],
				[
				],
				[
					"Text",
					0,
					"italic 18pt Arial Rounded MT Bold",
					"rgb(204,255,0)",
					1,
					1,
					0,
					0,
					0
				]
			]
,			[
				[127, 476, 0, 250, 250, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				44,
				633,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[835, 474, 0, 250, 250, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				45,
				634,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[64, 29, 0, 100, 31, 0, 0, 1, 0.5, 0.5161290168762207, 0, 0, []],
				68,
				635,
				[
				],
				[
				],
				[
					0,
					"Small",
					0,
					1
				]
			]
,			[
				[483, 301, 0, 1000, 610, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				37,
				622,
				[
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[927, 35, 0, 76, 70, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				46,
				2461,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[600, 371, 0, 178, 53, 0, 0, 1, 0.5, 0.5094339847564697, 0, 0, []],
				86,
				4038,
				[
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[363, 371, 0, 178, 53, 0, 0, 1, 0.502439022064209, 0.5068492889404297, 0, 0, []],
				85,
				4061,
				[
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
			],
			[			]
		]
		],
		[
		],
		[]
	]
,	[
		"Level4",
		10000,
		900,
		false,
		"GameEventSheet",
		7140893909480984,
		[
		[
			"Background",
			0,
			7838487363258478,
			true,
			[255, 255, 255],
			false,
			0.02999999932944775,
			0,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[0, 0, 0, 10000, 900, 0, 0, 1, 0, 0, 0, 0, []],
				8,
				386,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					0
				]
			]
			],
			[			]
		]
,		[
			"Parallax",
			1,
			6366602840736995,
			true,
			[255, 255, 255],
			true,
			0.800000011920929,
			0.800000011920929,
			1,
			false,
			1,
			0,
			2,
			[
			[
				[2, 199, 0, 10000, 706, 0, 0, 1, 0, 0, 0, 0, []],
				10,
				387,
				[
				],
				[
				],
				[
					0,
					0
				]
			]
			],
			[			]
		]
,		[
			"Platform",
			2,
			7769995244836691,
			true,
			[255, 255, 255],
			true,
			1,
			1,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[234, 505, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				388,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[931, 307, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				389,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[856, 716, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				391,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[1664, 509, 0, 143, 131, 0, 0, 1, 0.4755244851112366, 0.6564885377883911, 0, 0, []],
				7,
				396,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					6,
					1
				]
			]
,			[
				[7004, 758, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				411,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[6955, 332, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				413,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[1953, 728, 0, 261, 199, 0, 0, 1, 0.5019156932830811, 0.6934673190116882, 0, 0, []],
				7,
				390,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					5,
					1
				]
			]
,			[
				[2130, 728, 0, 261, 199, 0, 0, 1, 0.5019156932830811, 0.6934673190116882, 0, 0, []],
				7,
				392,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					5,
					1
				]
			]
,			[
				[3209, 477, 0, 155, 155, 0, 0, 1, 0.4516128897666931, 0.7225806713104248, 0, 0, []],
				7,
				393,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					8,
					1
				]
			]
,			[
				[2084, 324, 0, 541, 295, 0, 0, 1, 0.4676524996757507, 0.7389830350875855, 0, 0, []],
				7,
				394,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					1,
					1
				]
			]
,			[
				[2736, 773, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				395,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[4550, 619, 0, 541, 295, 0, 0, 1, 0.4676524996757507, 0.7389830350875855, 0, 0, []],
				7,
				397,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					1,
					1
				]
			]
,			[
				[5901, 816, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				398,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[6354, 529, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				407,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[7636, 498, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				437,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[8310, 808, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				438,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[9076, 300, 0, 223, 207, 0, 0, 1, 0.5291479825973511, 0.6763284802436829, 0, 0, []],
				7,
				441,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					4,
					1
				]
			]
,			[
				[1216, 715, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				433,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[1287, 307, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				434,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[2465, 309, 0, 463, 393, 0, 0, 1, 0.4362851083278656, 0.7302799224853516, 0, 0, []],
				7,
				435,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					3,
					1
				]
			]
,			[
				[3148, 773, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				436,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[3641, 560, 0, 155, 155, 0, 0, 1, 0.4516128897666931, 0.7225806713104248, 0, 0, []],
				7,
				399,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					8,
					1
				]
			]
,			[
				[4013, 436, 0, 155, 155, 0, 0, 1, 0.4516128897666931, 0.7225806713104248, 0, 0, []],
				7,
				406,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					8,
					1
				]
			]
,			[
				[5324, 619, 0, 541, 295, 0, 0, 1, 0.4676524996757507, 0.7389830350875855, 0, 0, []],
				7,
				440,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					1,
					1
				]
			]
,			[
				[4922, 619, 0, 541, 295, 0, 0, 1, 0.4676524996757507, 0.7389830350875855, 0, 0, []],
				7,
				408,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					1,
					1
				]
			]
,			[
				[8459, 370, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				409,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[9137, 779, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				410,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[9557, 416, 0, 223, 207, 0, 0, 1, 0.5291479825973511, 0.6763284802436829, 0, 0, []],
				7,
				412,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					4,
					1
				]
			]
,			[
				[3640, 239, 0, 155, 155, 0, 0, 1, 0.4516128897666931, 0.7225806713104248, 0, 0, []],
				7,
				443,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					8,
					1
				]
			]
,			[
				[4073, 778, 0, 155, 155, 0, 0, 1, 0.4516128897666931, 0.7225806713104248, 0, 0, []],
				7,
				444,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					8,
					1
				]
			]
,			[
				[5801, 342, 0, 155, 155, 0, 0, 1, 0.4516128897666931, 0.7225806713104248, 0, 0, []],
				7,
				445,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					8,
					1
				]
			]
,			[
				[9903, 790, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				400,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
			],
			[			]
		]
,		[
			"Game",
			3,
			6804136056852095,
			true,
			[255, 255, 255],
			true,
			1,
			1,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[68, 369, 0, 60, 75, 0, 0, 1, 0.5, 0.4533333480358124, 0, 0, []],
				88,
				414,
				[
					[0],
					[0],
					[1],
					[1],
					[0],
					[0],
					[1],
					[0],
					[0],
					[0],
					[0],
					[0],
					[0],
					[1],
					[0],
					[0]
				],
				[
				[
					250,
					10000,
					10000,
					400,
					1300,
					1000,
					0,
					1
				],
				[
				]
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[78, 364, 0, 105, 85, 0, 0, 1, 0.4857142865657806, 0.4000000059604645, 0, 0, []],
				87,
				415,
				[
				],
				[
				[
				],
				[
				]
				],
				[
					0,
					"Running",
					0,
					1
				]
			]
,			[
				[259, 1087, 0, 36, 37, 0, -1.570799946784973, 1, 0.5, 0.5135135054588318, 0, 0, []],
				89,
				419,
				[
				],
				[
				[
					400,
					0,
					0,
					0,
					1,
					1
				],
				[
					1
				]
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[89, 378, 0, 150, 150, 0, 0, 1, 0.4933333396911621, 0.5133333206176758, 0, 0, []],
				24,
				427,
				[
				],
				[
				[
				]
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[6043, 755, 0, 142, 75, 0, 0, 1, 0.5, 0.5066666603088379, 0, 0, []],
				90,
				439,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[1065, 490, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				469,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[925, 109, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				475,
				[
					["groundMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[1243, 106, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				476,
				[
					["groundMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[744, 161, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				477,
				[
					["Bronze"],
					[5],
					[15],
					[15]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[1658, 335, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				478,
				[
					["Diamond"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[2055, 586, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				479,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[1947, 611, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				480,
				[
					["Bronze"],
					[5],
					[3],
					[3]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[2072, 120, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				481,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[2548, 129, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				482,
				[
					["groundMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[2283, 78, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				532,
				[
					["Gold"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[2186, 661, 0, 142, 75, 0, 0, 1, 0.5, 0.5066666603088379, 0, 0, []],
				90,
				533,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[4079, 626, 0, 75, 75, 0, 0, 1, 0.4799999892711639, 0.6133333444595337, 0, 0, []],
				27,
				534,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[3246, 599, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				535,
				[
					["groundMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[2737, 630, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				536,
				[
					["Gold"],
					[5],
					[4],
					[4]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[3213, 331, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				636,
				[
					["Gold"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[3628, 78, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				637,
				[
					["Gold"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[3638, 395, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				638,
				[
					["Gold"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[4021, 286, 0, 75, 75, 0, 0, 1, 0.5199999809265137, 0.5199999809265137, 0, 0, []],
				23,
				442,
				[
					["Fire"]
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[4633, 416, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				639,
				[
					["groundMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[5058, 423, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				640,
				[
					["groundMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[5467, 429, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				641,
				[
					["groundMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[4874, 296, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				642,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[5248, 311, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				643,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[4872, 448, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				644,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[4450, 437, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				645,
				[
					["Bronze"],
					[5],
					[15],
					[15]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[6150, 116, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				646,
				[
					["Diamond"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[6476, 387, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				647,
				[
					["groundMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[8483, 747, 0, 142, 75, 0, 0, 1, 0.5, 0.5066666603088379, 0, 0, []],
				90,
				648,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[7051, 206, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				649,
				[
					["groundMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[6803, 633, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				650,
				[
					["Bronze"],
					[5],
					[5],
					[5]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[7793, 272, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				651,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[7589, 273, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				652,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[8078, 536, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				653,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[8574, 231, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				654,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[9060, 649, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				655,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[8110, 687, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				656,
				[
					["Bronze"],
					[5],
					[7],
					[7]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[9066, 150, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				657,
				[
					["Bronze"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[9559, 255, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				658,
				[
					["Bronze"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[8655, 543, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				659,
				[
					["Bronze"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[8693, 499, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				660,
				[
					["Bronze"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[8736, 460, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				661,
				[
					["Bronze"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[8789, 457, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				662,
				[
					["Bronze"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[8824, 495, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				663,
				[
					["Bronze"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[8858, 530, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				664,
				[
					["Bronze"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[8883, 574, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				665,
				[
					["Bronze"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[9344, 177, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				666,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[3213, 333, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				667,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[8298, 244, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				668,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[943, 598, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				669,
				[
					["Bronze"],
					[5],
					[5],
					[5]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
			],
			[			]
		]
,		[
			"ParallaxFront",
			4,
			3467976573758377,
			true,
			[255, 255, 255],
			true,
			1.200000047683716,
			1,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[3, 828, 0, 10000, 153, 0, 0, 1, 0, 0, 0, 0, []],
				9,
				448,
				[
				],
				[
				],
				[
					0,
					0
				]
			]
			],
			[			]
		]
,		[
			"UI",
			5,
			9077805807360334,
			true,
			[255, 255, 255],
			true,
			0,
			0,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[440, 46, 0, 92, 90, 0, 0, 1, 0.5, 0.5222222208976746, 0, 0, []],
				21,
				449,
				[
				],
				[
				[
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[522, 43, 0, 50, 50, 0, 0, 1, 0.5, 0.5199999809265137, 0, 0, []],
				26,
				450,
				[
				],
				[
				[
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[897, 534, 0, 131, 127, 0, 0, 0.5, 0.5038167834281921, 0.5039370059967041, 0, 0, []],
				39,
				452,
				[
				],
				[
				],
				[
					1,
					"Default",
					0,
					0
				]
			]
,			[
				[66, 535, 0, 130, 127, 0, 0, 0.5, 0.5, 0.5039370059967041, 0, 0, []],
				36,
				453,
				[
				],
				[
				],
				[
					1,
					"Default",
					0,
					0
				]
			]
,			[
				[208, 248, 0, 357, 42, 0, 0, 1, 0, 0, 0, 0, []],
				38,
				456,
				[
				],
				[
				],
				[
					"Paused. click 'P' to resume the game",
					1,
					"16pt Arial",
					"rgb(0,0,0)",
					0,
					0,
					0,
					0,
					0
				]
			]
,			[
				[205.4748992919922, 30.24537658691406, 0, 46, 46, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				32,
				457,
				[
					[1]
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[253.4053192138672, 31.80824279785156, 0, 46, 46, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				32,
				458,
				[
					[2]
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[298.7312316894531, 31.28722381591797, 0, 46, 46, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				32,
				459,
				[
					[3]
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[95, 519, 0, 150, 125, 0, 0, 1, 0.47843137383461, 0.4552845656871796, 0, 0, []],
				34,
				460,
				[
				],
				[
				[
				]
				],
				[
					0,
					"Default",
					0,
					0
				]
			]
,			[
				[272, 158, 0, 307, 50, 0, 0, 1, 0, 0, 0, 0, []],
				42,
				461,
				[
				],
				[
				],
				[
					"",
					1,
					"bold 24pt Arial",
					"rgb(255,255,255)",
					0,
					0,
					0,
					0,
					0
				]
			]
,			[
				[870, 93, 0, 62, 64, 0, 0, 1, 0.4838709533214569, 0.53125, 0, 0, []],
				28,
				462,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[870, 41, 0, 76, 76, 0, 0, 1, 0.5, 0.5789473652839661, 0, 0, []],
				28,
				463,
				[
				],
				[
				],
				[
					0,
					"Distance",
					0,
					1
				]
			]
,			[
				[730, 12, 0, 109, 45, 0, 0, 1, 0, 0, 0, 0, []],
				35,
				464,
				[
				],
				[
				],
				[
					"Text",
					0,
					"italic 18pt Arial Rounded MT Bold",
					"rgb(204,255,0)",
					1,
					1,
					0,
					0,
					0
				]
			]
,			[
				[730, 68, 0, 104.8147277832031, 47.73084259033203, 0, 0, 1, 0, 0, 0, 0, []],
				33,
				465,
				[
				],
				[
				],
				[
					"Text",
					0,
					"italic 18pt Arial Rounded MT Bold",
					"rgb(204,255,0)",
					1,
					1,
					0,
					0,
					0
				]
			]
,			[
				[127, 476, 0, 250, 250, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				44,
				466,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[835, 474, 0, 250, 250, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				45,
				467,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[64, 29, 0, 100, 31, 0, 0, 1, 0.5, 0.5161290168762207, 0, 0, []],
				68,
				468,
				[
				],
				[
				],
				[
					0,
					"Small",
					0,
					1
				]
			]
,			[
				[483, 301, 0, 1000, 610, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				37,
				455,
				[
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[927, 35, 0, 76, 70, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				46,
				2755,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[600, 371, 0, 178, 53, 0, 0, 1, 0.5, 0.5094339847564697, 0, 0, []],
				86,
				4039,
				[
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[363, 371, 0, 178, 53, 0, 0, 1, 0.502439022064209, 0.5068492889404297, 0, 0, []],
				85,
				4062,
				[
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
			],
			[			]
		]
		],
		[
		],
		[]
	]
,	[
		"Level5",
		11000,
		900,
		false,
		"GameEventSheet",
		2576529071942963,
		[
		[
			"Background",
			0,
			8815469409220306,
			true,
			[255, 255, 255],
			false,
			0.02999999932944775,
			0,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[0, 0, 0, 11000, 900, 0, 0, 1, 0, 0, 0, 0, []],
				8,
				670,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					0
				]
			]
			],
			[			]
		]
,		[
			"Parallax",
			1,
			2695215468310895,
			true,
			[255, 255, 255],
			true,
			0.800000011920929,
			0.800000011920929,
			1,
			false,
			1,
			0,
			2,
			[
			[
				[2, 199, 0, 11000, 706, 0, 0, 1, 0, 0, 0, 0, []],
				10,
				671,
				[
				],
				[
				],
				[
					0,
					0
				]
			]
			],
			[			]
		]
,		[
			"Platform",
			2,
			1901354407219064,
			true,
			[255, 255, 255],
			true,
			1,
			1,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[234, 505, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				672,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[6144, 583, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				680,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[6694, 343, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				681,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[4398, 558, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				688,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[5484, 761, 0, 463, 393, 0, 0, 1, 0.4362851083278656, 0.7302799224853516, 0, 0, []],
				7,
				689,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					3,
					1
				]
			]
,			[
				[7316, 746, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				690,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[2031, 770, 0, 463, 393, 0, 0, 1, 0.4362851083278656, 0.7302799224853516, 0, 0, []],
				7,
				695,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					3,
					1
				]
			]
,			[
				[2643, 261, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				696,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[7713, 746, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				701,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[8287, 501, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				702,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[8880, 517, 0, 223, 207, 0, 0, 1, 0.5291479825973511, 0.6763284802436829, 0, 0, []],
				7,
				703,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					4,
					1
				]
			]
,			[
				[9469, 581, 0, 541, 295, 0, 0, 1, 0.4676524996757507, 0.7389830350875855, 0, 0, []],
				7,
				707,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					1,
					1
				]
			]
,			[
				[884, 770, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				673,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[1458, 305, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				674,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[3743, 261, 0, 463, 393, 0, 0, 1, 0.4362851083278656, 0.7302799224853516, 0, 0, []],
				7,
				682,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					3,
					1
				]
			]
,			[
				[3268, 770, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				683,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[4776, 757, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				685,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[4943, 408, 0, 223, 207, 0, 0, 1, 0.5291479825973511, 0.6763284802436829, 0, 0, []],
				7,
				686,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					4,
					1
				]
			]
,			[
				[5374, 405, 0, 143, 131, 0, 0, 1, 0.4755244851112366, 0.6564885377883911, 0, 0, []],
				7,
				687,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					6,
					1
				]
			]
,			[
				[5809, 392, 0, 223, 207, 0, 0, 1, 0.5291479825973511, 0.6763284802436829, 0, 0, []],
				7,
				693,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					4,
					1
				]
			]
,			[
				[10281, 785, 0, 463, 393, 0, 0, 1, 0.4362851083278656, 0.7302799224853516, 0, 0, []],
				7,
				691,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					3,
					1
				]
			]
,			[
				[9992, 292, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				692,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[10772, 543, 0, 463, 393, 0, 0, 1, 0.4362851083278656, 0.7302799224853516, 0, 0, []],
				7,
				697,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					3,
					1
				]
			]
			],
			[			]
		]
,		[
			"Game",
			3,
			5772569908516082,
			true,
			[255, 255, 255],
			true,
			1,
			1,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[68, 369, 0, 60, 75, 0, 0, 1, 0.5, 0.4533333480358124, 0, 0, []],
				88,
				708,
				[
					[0],
					[0],
					[1],
					[1],
					[0],
					[0],
					[1],
					[0],
					[0],
					[0],
					[0],
					[0],
					[0],
					[1],
					[0],
					[0]
				],
				[
				[
					250,
					10000,
					10000,
					400,
					1300,
					1000,
					0,
					1
				],
				[
				]
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[78, 364, 0, 105, 85, 0, 0, 1, 0.4857142865657806, 0.4000000059604645, 0, 0, []],
				87,
				709,
				[
				],
				[
				[
				],
				[
				]
				],
				[
					0,
					"Running",
					0,
					1
				]
			]
,			[
				[259, 1087, 0, 36, 37, 0, -1.570799946784973, 1, 0.5, 0.5135135054588318, 0, 0, []],
				89,
				713,
				[
				],
				[
				[
					400,
					0,
					0,
					0,
					1,
					1
				],
				[
					1
				]
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[89, 378, 0, 150, 150, 0, 0, 1, 0.4933333396911621, 0.5133333206176758, 0, 0, []],
				24,
				721,
				[
				],
				[
				[
				]
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[773, 626, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				736,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[1034, 521, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				737,
				[
					["Bronze"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[1022, 708, 0, 142, 75, 0, 0, 1, 0.5, 0.5066666603088379, 0, 0, []],
				90,
				744,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[2205, 715, 0, 142, 75, 0, 0, 1, 0.5, 0.5066666603088379, 0, 0, []],
				90,
				675,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[3272, 704, 0, 142, 75, 0, 0, 1, 0.5, 0.5066666603088379, 0, 0, []],
				90,
				684,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[1995, 631, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				694,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[1047, 462, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				698,
				[
					["Bronze"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[1060, 403, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				699,
				[
					["Bronze"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[1078, 338, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				700,
				[
					["Bronze"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[1103, 284, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				704,
				[
					["Bronze"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[1132, 223, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				705,
				[
					["Bronze"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[1179, 162, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				706,
				[
					["Bronze"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[3268, 513, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				727,
				[
					["Bronze"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[3281, 454, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				732,
				[
					["Bronze"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[3294, 395, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				738,
				[
					["Bronze"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[3312, 330, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				739,
				[
					["Bronze"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[3337, 276, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				740,
				[
					["Bronze"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[3366, 215, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				741,
				[
					["Bronze"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[3413, 154, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				742,
				[
					["Bronze"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[2236, 548, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				743,
				[
					["Bronze"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[2249, 489, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				745,
				[
					["Bronze"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[2262, 430, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				746,
				[
					["Bronze"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[2280, 365, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				747,
				[
					["Bronze"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[2305, 311, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				748,
				[
					["Bronze"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[2334, 250, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				749,
				[
					["Bronze"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[2381, 189, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				750,
				[
					["Bronze"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[3402, 591, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				751,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[3784, 122, 0, 75, 75, 0, 0, 1, 0.5199999809265137, 0.5199999809265137, 0, 0, []],
				23,
				752,
				[
					["Psychic"]
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[4535, 386, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				753,
				[
					["groundMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[4360, 389, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				754,
				[
					["groundMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[5217, 111, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				755,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[4923, 116, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				756,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[5555, 111, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				757,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[5185, 493, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				758,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[4929, 562, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				759,
				[
					["groundMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[5618, 582, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				760,
				[
					["groundMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[6306, 382, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				761,
				[
					["groundMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[6068, 393, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				762,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[5494, 580, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				763,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[4738, 578, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				764,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[5386, 270, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				765,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[4264, 422, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				735,
				[
					["Bronze"],
					[5],
					[5],
					[5]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[4876, 274, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				766,
				[
					["Bronze"],
					[5],
					[2],
					[2]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[4593, 623, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				767,
				[
					["Bronze"],
					[5],
					[5],
					[5]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[5347, 627, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				768,
				[
					["Silver"],
					[5],
					[5],
					[5]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[5941, 452, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				769,
				[
					["Bronze"],
					[5],
					[5],
					[5]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[5738, 272, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				770,
				[
					["Bronze"],
					[5],
					[2],
					[2]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[5385, 304, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				771,
				[
					["Silver"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[6439, 100, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				772,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[4449, 384, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				773,
				[
					["groundMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[7320, 515, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				774,
				[
					["Bronze"],
					[5],
					[5],
					[5]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[7764, 494, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				775,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[7235, 499, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				776,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[8656, 178, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				777,
				[
					["Diamond"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[5553, 178, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				778,
				[
					["Diamond"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[7615, 607, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				779,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[8265, 323, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				780,
				[
					["groundMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[9304, 428, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				781,
				[
					["Silver"],
					[5],
					[5],
					[5]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[9507, 409, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				820,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[9864, 174, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				821,
				[
					["Bronze"],
					[5],
					[5],
					[5]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[10828, 322, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				822,
				[
					["Gold"],
					[5],
					[5],
					[5]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[10862, 398, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				823,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
			],
			[			]
		]
,		[
			"ParallaxFront",
			4,
			144523411869712,
			true,
			[255, 255, 255],
			true,
			1.200000047683716,
			1,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[3, 828, 0, 11000, 153, 0, 0, 1, 0, 0, 0, 0, []],
				9,
				783,
				[
				],
				[
				],
				[
					0,
					0
				]
			]
			],
			[			]
		]
,		[
			"UI",
			5,
			9297746981815112,
			true,
			[255, 255, 255],
			true,
			0,
			0,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[440, 46, 0, 92, 90, 0, 0, 1, 0.5, 0.5222222208976746, 0, 0, []],
				21,
				784,
				[
				],
				[
				[
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[522, 43, 0, 50, 50, 0, 0, 1, 0.5, 0.5199999809265137, 0, 0, []],
				26,
				785,
				[
				],
				[
				[
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[897, 534, 0, 131, 127, 0, 0, 0.5, 0.5038167834281921, 0.5039370059967041, 0, 0, []],
				39,
				786,
				[
				],
				[
				],
				[
					1,
					"Default",
					0,
					0
				]
			]
,			[
				[66, 535, 0, 130, 127, 0, 0, 0.5, 0.5, 0.5039370059967041, 0, 0, []],
				36,
				787,
				[
				],
				[
				],
				[
					1,
					"Default",
					0,
					0
				]
			]
,			[
				[208, 248, 0, 357, 42, 0, 0, 1, 0, 0, 0, 0, []],
				38,
				789,
				[
				],
				[
				],
				[
					"Paused. click 'P' to resume the game",
					1,
					"16pt Arial",
					"rgb(0,0,0)",
					0,
					0,
					0,
					0,
					0
				]
			]
,			[
				[205.4748992919922, 30.24537658691406, 0, 46, 46, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				32,
				790,
				[
					[1]
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[253.4053192138672, 31.80824279785156, 0, 46, 46, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				32,
				791,
				[
					[2]
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[298.7312316894531, 31.28722381591797, 0, 46, 46, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				32,
				792,
				[
					[3]
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[132, 520, 0, 255, 123, 0, 0, 1, 0.47843137383461, 0.4552845656871796, 0, 0, []],
				34,
				793,
				[
				],
				[
				[
				]
				],
				[
					0,
					"Default",
					0,
					0
				]
			]
,			[
				[272, 158, 0, 307, 50, 0, 0, 1, 0, 0, 0, 0, []],
				42,
				794,
				[
				],
				[
				],
				[
					"",
					1,
					"bold 24pt Arial",
					"rgb(255,255,255)",
					0,
					0,
					0,
					0,
					0
				]
			]
,			[
				[870, 93, 0, 62, 64, 0, 0, 1, 0.4838709533214569, 0.53125, 0, 0, []],
				28,
				795,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[870, 41, 0, 76, 76, 0, 0, 1, 0.5, 0.5789473652839661, 0, 0, []],
				28,
				796,
				[
				],
				[
				],
				[
					0,
					"Distance",
					0,
					1
				]
			]
,			[
				[730, 12, 0, 109, 45, 0, 0, 1, 0, 0, 0, 0, []],
				35,
				797,
				[
				],
				[
				],
				[
					"Text",
					0,
					"italic 18pt Arial Rounded MT Bold",
					"rgb(204,255,0)",
					1,
					1,
					0,
					0,
					0
				]
			]
,			[
				[730, 68, 0, 104.8147277832031, 47.73084259033203, 0, 0, 1, 0, 0, 0, 0, []],
				33,
				798,
				[
				],
				[
				],
				[
					"Text",
					0,
					"italic 18pt Arial Rounded MT Bold",
					"rgb(204,255,0)",
					1,
					1,
					0,
					0,
					0
				]
			]
,			[
				[127, 476, 0, 250, 250, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				44,
				799,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[831, 475, 0, 250, 250, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				45,
				800,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[64, 29, 0, 100, 31, 0, 0, 1, 0.5, 0.5161290168762207, 0, 0, []],
				68,
				801,
				[
				],
				[
				],
				[
					0,
					"Small",
					0,
					1
				]
			]
,			[
				[483, 301, 0, 1000, 610, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				37,
				788,
				[
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[927, 35, 0, 76, 70, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				46,
				3631,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[600, 371, 0, 178, 53, 0, 0, 1, 0.5, 0.5094339847564697, 0, 0, []],
				86,
				4040,
				[
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[363, 371, 0, 178, 53, 0, 0, 1, 0.502439022064209, 0.5068492889404297, 0, 0, []],
				85,
				4063,
				[
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
			],
			[			]
		]
		],
		[
		],
		[]
	]
,	[
		"Level6",
		12000,
		900,
		false,
		"GameEventSheet",
		1898587752262184,
		[
		[
			"Background",
			0,
			4917150637347533,
			true,
			[255, 255, 255],
			false,
			0.02999999932944775,
			0,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[0, 0, 0, 12000, 900, 0, 0, 1, 0, 0, 0, 0, []],
				8,
				782,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					0
				]
			]
			],
			[			]
		]
,		[
			"Parallax",
			1,
			5699141185372414,
			true,
			[255, 255, 255],
			true,
			0.800000011920929,
			0.800000011920929,
			1,
			false,
			1,
			0,
			2,
			[
			[
				[2, 199, 0, 12000, 706, 0, 0, 1, 0, 0, 0, 0, []],
				10,
				824,
				[
				],
				[
				],
				[
					0,
					0
				]
			]
			],
			[			]
		]
,		[
			"Platform",
			2,
			7570790605329274,
			true,
			[255, 255, 255],
			true,
			1,
			1,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[234, 700, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				825,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[519, 700, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				841,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[2409, 833, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				844,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[820, 700, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				835,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[1170, 700, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				836,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[1503, 700, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				842,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[1855, 700, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				880,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[3183, 349, 0, 143, 131, 0, 0, 1, 0.4755244851112366, 0.6564885377883911, 0, 0, []],
				7,
				830,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					6,
					1
				]
			]
,			[
				[3728, 723, 0, 143, 131, 0, 0, 1, 0.4755244851112366, 0.6564885377883911, 0, 0, []],
				7,
				831,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					6,
					1
				]
			]
,			[
				[4974, 585, 0, 143, 131, 0, 0, 1, 0.4755244851112366, 0.6564885377883911, 0, 0, []],
				7,
				832,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					6,
					1
				]
			]
,			[
				[5361, 777, 0, 327, 89, 0, 0, 1, 0.5259938836097717, 0.4157303273677826, 0, 0, []],
				6,
				834,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					3,
					1
				]
			]
,			[
				[5742, 594, 0, 327, 89, 0, 0, 1, 0.5259938836097717, 0.4157303273677826, 0, 0, []],
				6,
				843,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					3,
					1
				]
			]
,			[
				[6165, 428, 0, 327, 89, 0, 0, 1, 0.5259938836097717, 0.4157303273677826, 0, 0, []],
				6,
				889,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					3,
					1
				]
			]
,			[
				[9311, 699, 0, 327, 89, 0, 0, 1, 0.5259938836097717, 0.4157303273677826, 0, 0, []],
				6,
				899,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					3,
					1
				]
			]
,			[
				[9650, 556, 0, 110, 72, 0, 0, 1, 0.5363636612892151, 0.3888888955116272, 0, 0, []],
				6,
				896,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[9909, 420, 0, 110, 72, 0, 0, 1, 0.5363636612892151, 0.3888888955116272, 0, 0, []],
				6,
				902,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[10151, 296, 0, 110, 72, 0, 0, 1, 0.5363636612892151, 0.3888888955116272, 0, 0, []],
				6,
				904,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[10450, 452, 0, 110, 72, 0, 0, 1, 0.5363636612892151, 0.3888888955116272, 0, 0, []],
				6,
				909,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[10763, 604, 0, 110, 72, 0, 0, 1, 0.5363636612892151, 0.3888888955116272, 0, 0, []],
				6,
				911,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[11124, 759, 0, 261, 79, 0, 0, 1, 0.5210728049278259, 0.3544303774833679, 0, 0, []],
				6,
				913,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[11484, 756, 0, 261, 79, 0, 0, 1, 0.5210728049278259, 0.3544303774833679, 0, 0, []],
				6,
				914,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[11975, 611, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				918,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
			],
			[			]
		]
,		[
			"Game",
			3,
			3293005984916535,
			true,
			[255, 255, 255],
			true,
			1,
			1,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[43, 562, 0, 60, 75, 0, 0, 1, 0.5, 0.4533333480358124, 0, 0, []],
				88,
				852,
				[
					[0],
					[0],
					[1],
					[1],
					[0],
					[0],
					[1],
					[0],
					[0],
					[0],
					[0],
					[0],
					[0],
					[1],
					[0],
					[0]
				],
				[
				[
					250,
					10000,
					10000,
					400,
					1300,
					1000,
					0,
					1
				],
				[
				]
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[53, 557, 0, 105, 85, 0, 0, 1, 0.4857142865657806, 0.4000000059604645, 0, 0, []],
				87,
				853,
				[
				],
				[
				[
				],
				[
				]
				],
				[
					0,
					"Running",
					0,
					1
				]
			]
,			[
				[259, 1087, 0, 36, 37, 0, -1.570799946784973, 1, 0.5, 0.5135135054588318, 0, 0, []],
				89,
				857,
				[
				],
				[
				[
					400,
					0,
					0,
					0,
					1,
					1
				],
				[
					1
				]
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[64, 571, 0, 150, 150, 0, 0, 1, 0.4933333396911621, 0.5133333206176758, 0, 0, []],
				24,
				865,
				[
				],
				[
				[
				]
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[981, 450, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				878,
				[
					["Silver"],
					[5],
					[7],
					[7]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[2502, 703, 0, 75, 75, 0, 0, 1, 0.4608695507049561, 0.7053571343421936, 0, 0, []],
				25,
				881,
				[
					["Flight"]
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[3189, 238, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				837,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[3736, 604, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				838,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[2562, 335, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				845,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[1672, 374, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				846,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[3148, 620, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				847,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[3633, 117, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				848,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[4276, 324, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				849,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[4757, 122, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				850,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[3458, 516, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				851,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[3371, 107, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				882,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[2844, 408, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				883,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[4138, 143, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				884,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[4002, 416, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				885,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[4239, 752, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				886,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[4719, 403, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				887,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[4949, 706, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				888,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[6603, 648, 0, 75, 75, 0, 0, 1, 0.4608695507049561, 0.7053571343421936, 0, 0, []],
				25,
				840,
				[
					["Flight"]
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[3866, 266, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				839,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[3839, 163, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				893,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[4211, 563, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				894,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[7065, 517, 0, 75, 75, 0, 0, 1, 0.5199999809265137, 0.5199999809265137, 0, 0, []],
				23,
				833,
				[
					["Fire"]
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[8843, 272, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				877,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[8595, 231, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				890,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[8581, 412, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				891,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[8762, 552, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				892,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[8301, 794, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				895,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[8588, 654, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				897,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[8422, 536, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				898,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[8183, 129, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				900,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[8020, 232, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				901,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[8055, 471, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				903,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[8704, 763, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				905,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[8081, 760, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				906,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[8383, 130, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				907,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[8260, 663, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				908,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[8410, 721, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				910,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[8362, 300, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				912,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[7609, 590, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				915,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[7820, 532, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				916,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[7735, 760, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				917,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[7680, 256, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				920,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[7358, 152, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				921,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[7393, 391, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				923,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[7453, 771, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				924,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[7350, 593, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				925,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[7477, 193, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				927,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[7601, 402, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				929,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[7796, 101, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				931,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[5894, 678, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				919,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[6221, 501, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				922,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[6916, 291, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				926,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[7024, 160, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				928,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[9806, 699, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				930,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[10006, 586, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				932,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[10194, 471, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				933,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[10272, 360, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				934,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[9789, 457, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				935,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[10424, 263, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				936,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[11507, 376, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				937,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[11270, 474, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				959,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[11025, 241, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				960,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[2960, 198, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				879,
				[
					["Bronze"],
					[5],
					[10],
					[10]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[1463, 519, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				938,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[2307, 675, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				961,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[948, 554, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				962,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[502, 570, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				963,
				[
					["Bronze"],
					[5],
					[5],
					[5]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[3271, 594, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				964,
				[
					["Bronze"],
					[5],
					[15],
					[15]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[4478, 817, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				965,
				[
					["Silver"],
					[5],
					[10],
					[10]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[6867, 783, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				966,
				[
					["Gold"],
					[5],
					[10],
					[10]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[7179, 126, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				967,
				[
					["Diamond"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[8420, 825, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				968,
				[
					["Diamond"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[10788, 210, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				969,
				[
					["Diamond"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[7483, 338, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				970,
				[
					["Bronze"],
					[5],
					[20],
					[20]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[7901, 674, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				971,
				[
					["Silver"],
					[5],
					[5],
					[5]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[10983, 645, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				972,
				[
					["Bronze"],
					[5],
					[10],
					[10]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[4421, 196, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				973,
				[
					["Bronze"],
					[5],
					[10],
					[10]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
			],
			[			]
		]
,		[
			"ParallaxFront",
			4,
			4312739394485401,
			true,
			[255, 255, 255],
			true,
			1.200000047683716,
			1,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[3, 828, 0, 12000, 153, 0, 0, 1, 0, 0, 0, 0, []],
				9,
				939,
				[
				],
				[
				],
				[
					0,
					0
				]
			]
			],
			[			]
		]
,		[
			"UI",
			5,
			1472181291295574,
			true,
			[255, 255, 255],
			true,
			0,
			0,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[440, 46, 0, 92, 90, 0, 0, 1, 0.5, 0.5222222208976746, 0, 0, []],
				21,
				940,
				[
				],
				[
				[
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[522, 43, 0, 50, 50, 0, 0, 1, 0.5, 0.5199999809265137, 0, 0, []],
				26,
				941,
				[
				],
				[
				[
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[897, 534, 0, 131, 127, 0, 0, 0.5, 0.5038167834281921, 0.5039370059967041, 0, 0, []],
				39,
				942,
				[
				],
				[
				],
				[
					1,
					"Default",
					0,
					0
				]
			]
,			[
				[66, 535, 0, 130, 127, 0, 0, 0.5, 0.5, 0.5039370059967041, 0, 0, []],
				36,
				943,
				[
				],
				[
				],
				[
					1,
					"Default",
					0,
					0
				]
			]
,			[
				[208, 248, 0, 357, 42, 0, 0, 1, 0, 0, 0, 0, []],
				38,
				945,
				[
				],
				[
				],
				[
					"Paused. click 'P' to resume the game",
					1,
					"16pt Arial",
					"rgb(0,0,0)",
					0,
					0,
					0,
					0,
					0
				]
			]
,			[
				[205.4748992919922, 30.24537658691406, 0, 46, 46, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				32,
				946,
				[
					[1]
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[253.4053192138672, 31.80824279785156, 0, 46, 46, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				32,
				947,
				[
					[2]
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[298.7312316894531, 31.28722381591797, 0, 46, 46, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				32,
				948,
				[
					[3]
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[132, 520, 0, 255, 123, 0, 0, 1, 0.47843137383461, 0.4552845656871796, 0, 0, []],
				34,
				949,
				[
				],
				[
				[
				]
				],
				[
					0,
					"Default",
					0,
					0
				]
			]
,			[
				[272, 158, 0, 307, 50, 0, 0, 1, 0, 0, 0, 0, []],
				42,
				950,
				[
				],
				[
				],
				[
					"",
					1,
					"bold 24pt Arial",
					"rgb(255,255,255)",
					0,
					0,
					0,
					0,
					0
				]
			]
,			[
				[870, 93, 0, 62, 64, 0, 0, 1, 0.4838709533214569, 0.53125, 0, 0, []],
				28,
				951,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[870, 41, 0, 76, 76, 0, 0, 1, 0.5, 0.5789473652839661, 0, 0, []],
				28,
				952,
				[
				],
				[
				],
				[
					0,
					"Distance",
					0,
					1
				]
			]
,			[
				[730, 12, 0, 109, 45, 0, 0, 1, 0, 0, 0, 0, []],
				35,
				953,
				[
				],
				[
				],
				[
					"Text",
					0,
					"italic 18pt Arial Rounded MT Bold",
					"rgb(204,255,0)",
					1,
					1,
					0,
					0,
					0
				]
			]
,			[
				[730, 68, 0, 104.8147277832031, 47.73084259033203, 0, 0, 1, 0, 0, 0, 0, []],
				33,
				954,
				[
				],
				[
				],
				[
					"Text",
					0,
					"italic 18pt Arial Rounded MT Bold",
					"rgb(204,255,0)",
					1,
					1,
					0,
					0,
					0
				]
			]
,			[
				[127, 476, 0, 250, 250, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				44,
				955,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[856, 475, 0, 250, 250, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				45,
				956,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[64, 29, 0, 100, 31, 0, 0, 1, 0.5, 0.5161290168762207, 0, 0, []],
				68,
				957,
				[
				],
				[
				],
				[
					0,
					"Small",
					0,
					1
				]
			]
,			[
				[483, 301, 0, 1000, 610, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				37,
				944,
				[
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[927, 35, 0, 76, 70, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				46,
				3872,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[600, 371, 0, 178, 53, 0, 0, 1, 0.5, 0.5094339847564697, 0, 0, []],
				86,
				4041,
				[
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[363, 371, 0, 178, 53, 0, 0, 1, 0.502439022064209, 0.5068492889404297, 0, 0, []],
				85,
				4064,
				[
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
			],
			[			]
		]
		],
		[
		],
		[]
	]
,	[
		"Level7",
		13000,
		900,
		false,
		"GameEventSheet",
		7575414681693884,
		[
		[
			"Background",
			0,
			9626234956353048,
			true,
			[255, 255, 255],
			false,
			0.02999999932944775,
			0,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[0, 0, 0, 13000, 900, 0, 0, 1, 0, 0, 0, 0, []],
				8,
				974,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					0
				]
			]
			],
			[			]
		]
,		[
			"Parallax",
			1,
			5612031423913553,
			true,
			[255, 255, 255],
			true,
			0.800000011920929,
			0.800000011920929,
			1,
			false,
			1,
			0,
			2,
			[
			[
				[2, 199, 0, 13000, 706, 0, 0, 1, 0, 0, 0, 0, []],
				10,
				975,
				[
				],
				[
				],
				[
					0,
					0
				]
			]
			],
			[			]
		]
,		[
			"Platform",
			2,
			9854894119102664,
			true,
			[255, 255, 255],
			true,
			1,
			1,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[234, 700, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				976,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[751, 546, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				981,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[1359, 809, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				982,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[1351, 359, 0, 327, 89, 0, 0, 1, 0.5259938836097717, 0.4157303273677826, 0, 0, []],
				6,
				984,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					3,
					1
				]
			]
,			[
				[1948, 359, 0, 327, 89, 0, 0, 1, 0.5259938836097717, 0.4157303273677826, 0, 0, []],
				6,
				985,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					3,
					1
				]
			]
,			[
				[2547, 359, 0, 327, 89, 0, 0, 1, 0.5259938836097717, 0.4157303273677826, 0, 0, []],
				6,
				986,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					3,
					1
				]
			]
,			[
				[3079, 359, 0, 182, 72, 0, 0, 1, 0.5, 0.4305555522441864, 0, 0, []],
				6,
				987,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					1,
					1
				]
			]
,			[
				[3548, 359, 0, 110, 72, 0, 0, 1, 0.5363636612892151, 0.3888888955116272, 0, 0, []],
				6,
				988,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[2100, 815, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				991,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[2806, 805, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				992,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[3607, 799, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				993,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[3908, 800, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				994,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[4256, 799, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				995,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[4587, 800, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				996,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[5026, 534, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				997,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[5327, 535, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				998,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[5675, 534, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				999,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[6006, 535, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				1000,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[6711, 845, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				1001,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[7012, 846, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				1002,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[7360, 845, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				1028,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[7691, 845, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				1029,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[7072, 619, 0, 143, 131, 0, 0, 1, 0.4755244851112366, 0.6564885377883911, 0, 0, []],
				7,
				1031,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					6,
					1
				]
			]
,			[
				[7372, 454, 0, 143, 131, 0, 0, 1, 0.4755244851112366, 0.6564885377883911, 0, 0, []],
				7,
				1032,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					6,
					1
				]
			]
,			[
				[7756, 413, 0, 143, 131, 0, 0, 1, 0.4755244851112366, 0.6564885377883911, 0, 0, []],
				7,
				1033,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					6,
					1
				]
			]
,			[
				[4424, 563, 0, 182, 72, 0, 0, 1, 0.5, 0.4305555522441864, 0, 0, []],
				6,
				1034,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					1,
					1
				]
			]
,			[
				[4978, 846, 0, 400, 100, 0, 0, 1, 0.5149999856948853, 0.4799999892711639, 0, 0, []],
				6,
				1035,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					4,
					1
				]
			]
,			[
				[5504, 850, 0, 400, 100, 0, 0, 1, 0.5149999856948853, 0.4799999892711639, 0, 0, []],
				6,
				1036,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					4,
					1
				]
			]
,			[
				[6058, 850, 0, 400, 100, 0, 0, 1, 0.5149999856948853, 0.4799999892711639, 0, 0, []],
				6,
				1037,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					4,
					1
				]
			]
,			[
				[8048, 619, 0, 143, 131, 0, 0, 1, 0.4755244851112366, 0.6564885377883911, 0, 0, []],
				7,
				1038,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					6,
					1
				]
			]
,			[
				[8483, 827, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				1039,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[9048, 315, 0, 261, 79, 0, 0, 1, 0.5210728049278259, 0.3544303774833679, 0, 0, []],
				6,
				1040,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[9519, 490, 0, 182, 72, 0, 0, 1, 0.5, 0.4305555522441864, 0, 0, []],
				6,
				1042,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					1,
					1
				]
			]
,			[
				[9921, 714, 0, 110, 72, 0, 0, 1, 0.5363636612892151, 0.3888888955116272, 0, 0, []],
				6,
				1043,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[10834, 805, 0, 261, 199, 0, 0, 1, 0.5019156932830811, 0.6934673190116882, 0, 0, []],
				7,
				1044,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					5,
					1
				]
			]
,			[
				[10332, 502, 0, 261, 79, 0, 0, 1, 0.5210728049278259, 0.3544303774833679, 0, 0, []],
				6,
				1045,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[11784, 337, 0, 261, 199, 0, 0, 1, 0.5019156932830811, 0.6934673190116882, 0, 0, []],
				7,
				1047,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					5,
					1
				]
			]
,			[
				[12578, 789, 0, 261, 199, 0, 0, 1, 0.5019156932830811, 0.6934673190116882, 0, 0, []],
				7,
				1048,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					5,
					1
				]
			]
			],
			[			]
		]
,		[
			"Game",
			3,
			3215718410235252,
			true,
			[255, 255, 255],
			true,
			1,
			1,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[43, 562, 0, 60, 75, 0, 0, 1, 0.5, 0.4533333480358124, 0, 0, []],
				88,
				1003,
				[
					[0],
					[0],
					[1],
					[1],
					[0],
					[0],
					[1],
					[0],
					[0],
					[0],
					[0],
					[0],
					[0],
					[1],
					[0],
					[0]
				],
				[
				[
					250,
					10000,
					10000,
					400,
					1300,
					1000,
					0,
					1
				],
				[
				]
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[53, 557, 0, 105, 85, 0, 0, 1, 0.4857142865657806, 0.4000000059604645, 0, 0, []],
				87,
				1004,
				[
				],
				[
				[
				],
				[
				]
				],
				[
					0,
					"Running",
					0,
					1
				]
			]
,			[
				[259, 1087, 0, 36, 37, 0, -1.570799946784973, 1, 0.5, 0.5135135054588318, 0, 0, []],
				89,
				1008,
				[
				],
				[
				[
					400,
					0,
					0,
					0,
					1,
					1
				],
				[
					1
				]
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[64, 571, 0, 150, 150, 0, 0, 1, 0.4933333396911621, 0.5133333206176758, 0, 0, []],
				24,
				1016,
				[
				],
				[
				[
				]
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[509, 384, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1024,
				[
					["Bronze"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[5493, 770, 0, 75, 75, 0, 0, 1, 0.4608695507049561, 0.7053571343421936, 0, 0, []],
				25,
				990,
				[
					["Big"]
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[3804, 253, 0, 75, 75, 0, 0, 1, 0.5199999809265137, 0.5199999809265137, 0, 0, []],
				23,
				1030,
				[
					["Fire"]
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[8658, 765, 0, 142, 75, 0, 0, 1, 0.5, 0.5066666603088379, 0, 0, []],
				90,
				1041,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[11069, 560, 0, 75, 75, 0, 0, 1, 0.4608695507049561, 0.7053571343421936, 0, 0, []],
				25,
				1046,
				[
					["Flight"]
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[470, 415, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1050,
				[
					["Bronze"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[450, 468, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1051,
				[
					["Bronze"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[372, 523, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1052,
				[
					["Bronze"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[419, 513, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1053,
				[
					["Bronze"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[2122, 682, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1055,
				[
					["groundMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[1818, 201, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1054,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[1754, 575, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1056,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[1377, 663, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1057,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[2664, 129, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1058,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[3317, 626, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1059,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[4234, 374, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1060,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[5351, 723, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1061,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[6264, 226, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1062,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[7606, 552, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1063,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[8199, 433, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1064,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[9163, 470, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1065,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[10145, 327, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1066,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[10440, 633, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1067,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[11091, 292, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1068,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[12090, 772, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1069,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[12394, 144, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1070,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[11723, 528, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1071,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[11345, 797, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1072,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[11532, 150, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1073,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[11466, 501, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1074,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[11729, 747, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1075,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[12222, 349, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1076,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[12216, 567, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1077,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[12039, 101, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1078,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[12542, 452, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1079,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[12764, 136, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1080,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[12875, 475, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1081,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[12861, 775, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1082,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[12387, 834, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1083,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[12750, 598, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1084,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[11181, 181, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1085,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[3892, 659, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1087,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[4882, 400, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1088,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[6119, 400, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1089,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[6811, 696, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1090,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[7373, 337, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1091,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[8375, 680, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1092,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[8970, 247, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1093,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[10799, 674, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1094,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[10873, 676, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1095,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[11834, 196, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1096,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[12608, 644, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1097,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[12544, 646, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1098,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[11748, 197, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1099,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[1340, 292, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1100,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[4065, 610, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1101,
				[
					["groundMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[5650, 355, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1102,
				[
					["groundMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[5318, 351, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1103,
				[
					["groundMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[7317, 667, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1104,
				[
					["groundMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[10532, 202, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1105,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[5032, 180, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1125,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[3948, 240, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1126,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[5930, 719, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1127,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[3669, 396, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1128,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[9127, 686, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1129,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[6375, 382, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1130,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[6796, 429, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1131,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[2834, 674, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1086,
				[
					["groundMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[12376, 501, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1132,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[12292, 692, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1133,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[12655, 228, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1134,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[12943, 319, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1135,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[1223, 271, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1136,
				[
					["Bronze"],
					[5],
					[5],
					[5]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[1993, 690, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1137,
				[
					["Bronze"],
					[5],
					[5],
					[5]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[3444, 665, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1138,
				[
					["Bronze"],
					[5],
					[5],
					[5]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[3315, 115, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1139,
				[
					["Gold"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[4595, 386, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1140,
				[
					["Bronze"],
					[5],
					[5],
					[5]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[5368, 187, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1141,
				[
					["Gold"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[5252, 616, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1142,
				[
					["Bronze"],
					[5],
					[10],
					[10]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[8026, 142, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1143,
				[
					["Diamond"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[9360, 294, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1144,
				[
					["Bronze"],
					[5],
					[5],
					[5]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[7578, 99, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1145,
				[
					["Diamond"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[10644, 311, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1146,
				[
					["Bronze"],
					[5],
					[5],
					[5]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[11599, 697, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1147,
				[
					["Bronze"],
					[5],
					[5],
					[5]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[12229, 143, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1148,
				[
					["Bronze"],
					[5],
					[5],
					[5]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[12527, 649, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1149,
				[
					["Bronze"],
					[5],
					[5],
					[5]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
			],
			[			]
		]
,		[
			"ParallaxFront",
			4,
			9555016506388752,
			true,
			[255, 255, 255],
			true,
			1.200000047683716,
			1,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[3, 828, 0, 13000, 153, 0, 0, 1, 0, 0, 0, 0, []],
				9,
				1106,
				[
				],
				[
				],
				[
					0,
					0
				]
			]
			],
			[			]
		]
,		[
			"UI",
			5,
			4852181919651547,
			true,
			[255, 255, 255],
			true,
			0,
			0,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[440, 46, 0, 92, 90, 0, 0, 1, 0.5, 0.5222222208976746, 0, 0, []],
				21,
				1107,
				[
				],
				[
				[
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[522, 43, 0, 50, 50, 0, 0, 1, 0.5, 0.5199999809265137, 0, 0, []],
				26,
				1108,
				[
				],
				[
				[
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[897, 534, 0, 131, 127, 0, 0, 0.5, 0.5038167834281921, 0.5039370059967041, 0, 0, []],
				39,
				1109,
				[
				],
				[
				],
				[
					1,
					"Default",
					0,
					0
				]
			]
,			[
				[66, 535, 0, 130, 127, 0, 0, 0.5, 0.5, 0.5039370059967041, 0, 0, []],
				36,
				1110,
				[
				],
				[
				],
				[
					1,
					"Default",
					0,
					0
				]
			]
,			[
				[208, 248, 0, 357, 42, 0, 0, 1, 0, 0, 0, 0, []],
				38,
				1112,
				[
				],
				[
				],
				[
					"Paused. click 'P' to resume the game",
					1,
					"16pt Arial",
					"rgb(0,0,0)",
					0,
					0,
					0,
					0,
					0
				]
			]
,			[
				[205.4748992919922, 30.24537658691406, 0, 46, 46, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				32,
				1113,
				[
					[1]
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[253.4053192138672, 31.80824279785156, 0, 46, 46, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				32,
				1114,
				[
					[2]
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[298.7312316894531, 31.28722381591797, 0, 46, 46, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				32,
				1115,
				[
					[3]
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[95, 519, 0, 150, 125, 0, 0, 1, 0.47843137383461, 0.4552845656871796, 0, 0, []],
				34,
				1116,
				[
				],
				[
				[
				]
				],
				[
					0,
					"Default",
					0,
					0
				]
			]
,			[
				[272, 158, 0, 307, 50, 0, 0, 1, 0, 0, 0, 0, []],
				42,
				1117,
				[
				],
				[
				],
				[
					"",
					1,
					"bold 24pt Arial",
					"rgb(255,255,255)",
					0,
					0,
					0,
					0,
					0
				]
			]
,			[
				[870, 93, 0, 62, 64, 0, 0, 1, 0.4838709533214569, 0.53125, 0, 0, []],
				28,
				1118,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[870, 41, 0, 76, 76, 0, 0, 1, 0.5, 0.5789473652839661, 0, 0, []],
				28,
				1119,
				[
				],
				[
				],
				[
					0,
					"Distance",
					0,
					1
				]
			]
,			[
				[730, 12, 0, 109, 45, 0, 0, 1, 0, 0, 0, 0, []],
				35,
				1120,
				[
				],
				[
				],
				[
					"Text",
					0,
					"italic 18pt Arial Rounded MT Bold",
					"rgb(204,255,0)",
					1,
					1,
					0,
					0,
					0
				]
			]
,			[
				[730, 68, 0, 104.8147277832031, 47.73084259033203, 0, 0, 1, 0, 0, 0, 0, []],
				33,
				1121,
				[
				],
				[
				],
				[
					"Text",
					0,
					"italic 18pt Arial Rounded MT Bold",
					"rgb(204,255,0)",
					1,
					1,
					0,
					0,
					0
				]
			]
,			[
				[127, 476, 0, 250, 250, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				44,
				1122,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[835, 476, 0, 250, 250, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				45,
				1123,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[64, 29, 0, 100, 31, 0, 0, 1, 0.5, 0.5161290168762207, 0, 0, []],
				68,
				1124,
				[
				],
				[
				],
				[
					0,
					"Small",
					0,
					1
				]
			]
,			[
				[483, 301, 0, 1000, 610, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				37,
				1111,
				[
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[927, 35, 0, 76, 70, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				46,
				4018,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[600, 371, 0, 178, 53, 0, 0, 1, 0.5, 0.5094339847564697, 0, 0, []],
				86,
				4042,
				[
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[363, 371, 0, 178, 53, 0, 0, 1, 0.502439022064209, 0.5068492889404297, 0, 0, []],
				85,
				4065,
				[
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
			],
			[			]
		]
		],
		[
		],
		[]
	]
,	[
		"Level8",
		18000,
		900,
		false,
		"GameEventSheet",
		5874351967480197,
		[
		[
			"Background",
			0,
			6582463815337779,
			true,
			[255, 255, 255],
			false,
			0.02999999932944775,
			0,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[0, 0, 0, 18000, 900, 0, 0, 1, 0, 0, 0, 0, []],
				8,
				1150,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					0
				]
			]
			],
			[			]
		]
,		[
			"Parallax",
			1,
			4689954313967236,
			true,
			[255, 255, 255],
			true,
			0.800000011920929,
			0.800000011920929,
			1,
			false,
			1,
			0,
			2,
			[
			[
				[2, 199, 0, 18000, 706, 0, 0, 1, 0, 0, 0, 0, []],
				10,
				1151,
				[
				],
				[
				],
				[
					0,
					0
				]
			]
			],
			[			]
		]
,		[
			"Platform",
			2,
			9483275408688367,
			true,
			[255, 255, 255],
			true,
			1,
			1,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[234, 700, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				1152,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[934, 884, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				1158,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[1574, 884, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				1160,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[1891, 885, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				1161,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[2490, 884, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				1163,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[3130, 884, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				1165,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[3768, 884, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				1167,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[4091, 883, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				1168,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[4408, 884, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				1169,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[5007, 884, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				1171,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[5647, 884, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				1173,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[1002, 651, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				1174,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[1613, 651, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				1176,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[1882, 652, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				1177,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[2481, 651, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				1179,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[2804, 650, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				1180,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[3759, 651, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				1183,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[4399, 651, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				1185,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[4998, 651, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				1187,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[1708, 430, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				1190,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[3264, 429, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				1216,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[1331, 429, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				1221,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[5324, 429, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				1227,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[6274, 727, 0, 327, 89, 0, 0, 1, 0.5259938836097717, 0.4157303273677826, 0, 0, []],
				6,
				1178,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					3,
					1
				]
			]
,			[
				[6669, 626, 0, 182, 72, 0, 0, 1, 0.5, 0.4305555522441864, 0, 0, []],
				6,
				1181,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					1,
					1
				]
			]
,			[
				[7048, 546, 0, 182, 72, 0, -0.0041680121794343, 1, 0.5, 0.4305555522441864, 0, 0, []],
				6,
				1182,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					1,
					1
				]
			]
,			[
				[7580, 799, 0, 182, 72, 0, -0.0041680121794343, 1, 0.5, 0.4305555522441864, 0, 0, []],
				6,
				1186,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					1,
					1
				]
			]
,			[
				[10375, 824, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				1189,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[10015, 822, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				1191,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[10646, 582, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				1192,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[11456, 578, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				1193,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[12249, 877, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				1194,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[12804, 377, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				1223,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[13431, 617, 0, 327, 89, 0, -0.0041680121794343, 1, 0.5259938836097717, 0.4157303273677826, 0, 0, []],
				6,
				1224,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					3,
					1
				]
			]
,			[
				[13861, 456, 0, 182, 72, 0, -0.0041680121794343, 1, 0.5, 0.4305555522441864, 0, 0, []],
				6,
				1228,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					1,
					1
				]
			]
,			[
				[13932, 766, 0, 261, 79, 0, -0.0041680121794343, 1, 0.5210728049278259, 0.3544303774833679, 0, 0, []],
				6,
				1229,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[14330, 546, 0, 182, 72, 0, -0.0041680121794343, 1, 0.5, 0.4305555522441864, 0, 0, []],
				6,
				1230,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					1,
					1
				]
			]
,			[
				[14454, 762, 0, 261, 79, 0, -0.0041680121794343, 1, 0.5210728049278259, 0.3544303774833679, 0, 0, []],
				6,
				1231,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[14897, 554, 0, 261, 79, 0, -0.0041680121794343, 1, 0.5210728049278259, 0.3544303774833679, 0, 0, []],
				6,
				1232,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[14400, 283, 0, 327, 89, 0, -0.0041680121794343, 1, 0.5259938836097717, 0.4157303273677826, 0, 0, []],
				6,
				1233,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					3,
					1
				]
			]
,			[
				[15637, 325, 0, 327, 89, 0, -0.0041680121794343, 1, 0.5259938836097717, 0.4157303273677826, 0, 0, []],
				6,
				1234,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					3,
					1
				]
			]
,			[
				[15445, 595, 0, 182, 72, 0, -0.0041680121794343, 1, 0.5, 0.4305555522441864, 0, 0, []],
				6,
				1235,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					1,
					1
				]
			]
,			[
				[16044, 693, 0, 261, 79, 0, -0.0041680121794343, 1, 0.5210728049278259, 0.3544303774833679, 0, 0, []],
				6,
				1236,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[16529, 500, 0, 261, 79, 0, -0.0041680121794343, 1, 0.5210728049278259, 0.3544303774833679, 0, 0, []],
				6,
				1237,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[16899, 756, 0, 182, 72, 0, -0.0041680121794343, 1, 0.5, 0.4305555522441864, 0, 0, []],
				6,
				1238,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					1,
					1
				]
			]
,			[
				[17323, 578, 0, 261, 79, 0, -0.0041680121794343, 1, 0.5210728049278259, 0.3544303774833679, 0, 0, []],
				6,
				1239,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[17940, 725, 0, 327, 89, 0, -0.0041680121794343, 1, 0.5259938836097717, 0.4157303273677826, 0, 0, []],
				6,
				1240,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					3,
					1
				]
			]
,			[
				[10664, 824, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				1268,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
			],
			[			]
		]
,		[
			"Game",
			3,
			1033357902640527,
			true,
			[255, 255, 255],
			true,
			1,
			1,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[43, 562, 0, 60, 75, 0, 0, 1, 0.5, 0.4533333480358124, 0, 0, []],
				88,
				1195,
				[
					[0],
					[0],
					[1],
					[1],
					[0],
					[0],
					[1],
					[0],
					[0],
					[0],
					[0],
					[0],
					[0],
					[1],
					[0],
					[0]
				],
				[
				[
					250,
					10000,
					10000,
					400,
					1300,
					1000,
					0,
					1
				],
				[
				]
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[53, 557, 0, 105, 85, 0, 0, 1, 0.4857142865657806, 0.4000000059604645, 0, 0, []],
				87,
				1196,
				[
				],
				[
				[
				],
				[
				]
				],
				[
					0,
					"Running",
					0,
					1
				]
			]
,			[
				[64, 571, 0, 150, 150, 0, 0, 1, 0.4933333396911621, 0.5133333206176758, 0, 0, []],
				24,
				1208,
				[
				],
				[
				[
				]
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[1778, 824, 0, 142, 75, 0, 0, 1, 0.5, 0.5066666603088379, 0, 0, []],
				90,
				1175,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[7582, 730, 0, 75, 75, 0, 0, 1, 0.4608695507049561, 0.7053571343421936, 0, 0, []],
				25,
				1188,
				[
					["Flight"]
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[12420, 815, 0, 142, 75, 0, 0, 1, 0.5, 0.5066666603088379, 0, 0, []],
				90,
				1222,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[4315, 823, 0, 142, 75, 0, 0, 1, 0.5, 0.5066666603088379, 0, 0, []],
				90,
				1226,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[17753, 243, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1159,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[17290, 721, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1162,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[17033, 237, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1164,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[16248, 167, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1166,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[16133, 468, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1170,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[15260, 229, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1172,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[14627, 620, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1184,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[14594, 128, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1241,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[14010, 577, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1242,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[13842, 198, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1243,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[17842, 560, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1245,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[17573, 350, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1246,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[16973, 605, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1247,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[16710, 254, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1248,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[16629, 575, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1249,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[16332, 744, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1250,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[15647, 750, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1251,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[15697, 483, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1252,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[15774, 117, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1253,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[15277, 471, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1254,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[14216, 403, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1256,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[14171, 135, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1257,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[13467, 204, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1259,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[12324, 499, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1244,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[12972, 548, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1255,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[12731, 251, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1258,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[12930, 251, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1260,
				[
					["groundMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[12063, 739, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1261,
				[
					["spike"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[11346, 441, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1262,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[11579, 450, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1263,
				[
					["spike"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[10490, 446, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1264,
				[
					["spike"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[10488, 664, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1265,
				[
					["groundMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[10064, 681, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1266,
				[
					["groundMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[10250, 683, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1267,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[9238, 69, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1269,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[8823, 56, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1270,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[8519, 58, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1271,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[8172, 22, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1272,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[7875, 69, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1273,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[7590, 67, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1274,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[9559, 223, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1275,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[9144, 210, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1276,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[8840, 212, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1277,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[8493, 176, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1278,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[8196, 223, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1279,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[9234, 420, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1280,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[8819, 407, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1281,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[8515, 409, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1282,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[8168, 373, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1283,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[7871, 420, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1284,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[9512, 793, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1285,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[9097, 780, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1286,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[8793, 782, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1287,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[8149, 793, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1288,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[9750, 682, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1289,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[9335, 669, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1290,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[9031, 671, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1291,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[8387, 682, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1292,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[9178, 587, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1293,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[8800, 651, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1294,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[8590, 612, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1295,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[8166, 598, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1296,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[8002, 754, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1297,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[9673, 574, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1298,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[8476, 508, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1299,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[8945, 507, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1300,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[9516, 471, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1301,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[9803, 216, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1302,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[9377, 291, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1303,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[10513, 107, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1304,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[10098, 94, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1305,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[10188, 304, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1306,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[10132, 471, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1326,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[10710, 287, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1327,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[10470, 355, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1328,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[10757, 100, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1329,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[10331, 175, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1330,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[8714, 507, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1331,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[9014, 389, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1332,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[9356, 547, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1333,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[9690, 119, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1334,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[7548, 441, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1335,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[7293, 358, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1336,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[6991, 649, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1337,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[6873, 279, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1338,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[6751, 431, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1339,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[7057, 444, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1340,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[6631, 664, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1341,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[6090, 296, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1342,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[5921, 608, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1343,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[4979, 319, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1344,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[4754, 730, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1345,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[4501, 488, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1346,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[4137, 349, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1347,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[3963, 266, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1348,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[2870, 741, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1349,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[2975, 454, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1350,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[1522, 510, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1351,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[1961, 103, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1352,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[2393, 296, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1353,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[1088, 745, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1354,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[1985, 758, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1355,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[1807, 294, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1356,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[3408, 294, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1357,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[3825, 737, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1358,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[5107, 510, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1359,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[876, 739, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1361,
				[
					["groundMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[1726, 735, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1362,
				[
					["groundMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[1015, 504, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1363,
				[
					["groundMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[1663, 281, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1364,
				[
					["groundMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[1886, 276, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1365,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[1598, 739, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1366,
				[
					["groundMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[2584, 746, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1367,
				[
					["spike"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[2804, 489, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1368,
				[
					["spike"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[3692, 744, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1369,
				[
					["spike"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[3853, 496, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1370,
				[
					["spike"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[4431, 757, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1371,
				[
					["spike"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[5137, 746, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1372,
				[
					["spike"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[5728, 744, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1373,
				[
					["spike"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[5433, 286, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1374,
				[
					["spike"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[1381, 288, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1375,
				[
					["groundMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[3228, 744, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1376,
				[
					["groundMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[2489, 497, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1377,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[3523, 750, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1378,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[1156, 514, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1360,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[1948, 512, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1379,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[1790, 514, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1380,
				[
					["groundMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[2654, 495, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1382,
				[
					["groundMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[2181, 422, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1383,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[2838, 336, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1384,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[2102, 214, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1385,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[2203, 738, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1386,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[3412, 545, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1387,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[3620, 130, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1388,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[3982, 400, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1389,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[4740, 509, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1390,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[4738, 295, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1391,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[5446, 575, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1392,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[5832, 293, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1393,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[741, 778, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1394,
				[
					["Silver"],
					[5],
					[5],
					[5]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[1483, 534, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1395,
				[
					["Bronze"],
					[5],
					[5],
					[5]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[2467, 534, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1396,
				[
					["Bronze"],
					[5],
					[8],
					[8]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[3787, 774, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1397,
				[
					["Bronze"],
					[5],
					[10],
					[10]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[4598, 509, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1398,
				[
					["Bronze"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[4667, 414, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1399,
				[
					["Bronze"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[4740, 355, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1400,
				[
					["Bronze"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[4820, 410, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1401,
				[
					["Bronze"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[4864, 487, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1402,
				[
					["Bronze"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[5534, 763, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1403,
				[
					["Bronze"],
					[5],
					[3],
					[3]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[6159, 652, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1404,
				[
					["Bronze"],
					[5],
					[3],
					[3]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[6602, 547, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1405,
				[
					["Bronze"],
					[5],
					[2],
					[2]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[7017, 470, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1406,
				[
					["Bronze"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[7738, 718, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1407,
				[
					["Bronze"],
					[5],
					[5],
					[5]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[8363, 174, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1408,
				[
					["Silver"],
					[5],
					[5],
					[5]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[8943, 745, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1409,
				[
					["Silver"],
					[5],
					[5],
					[5]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[10098, 687, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1410,
				[
					["Silver"],
					[5],
					[7],
					[7]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[11373, 460, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1411,
				[
					["Silver"],
					[5],
					[7],
					[7]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[12437, 535, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1413,
				[
					["Silver"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[12426, 639, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1414,
				[
					["Silver"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[12449, 434, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1415,
				[
					["Silver"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[12467, 342, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1416,
				[
					["Silver"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[12518, 237, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1417,
				[
					["Silver"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[12604, 186, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1418,
				[
					["Silver"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[14202, 197, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1412,
				[
					["Silver"],
					[5],
					[5],
					[5]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[14296, 696, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1419,
				[
					["Silver"],
					[5],
					[5],
					[5]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[15477, 242, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1420,
				[
					["Silver"],
					[5],
					[5],
					[5]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[16761, 293, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1421,
				[
					["Silver"],
					[5],
					[5],
					[5]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[17718, 625, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1422,
				[
					["Silver"],
					[5],
					[5],
					[5]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[259, 1087, 0, 36, 37, 0, -1.570799946784973, 1, 0.5, 0.5135135054588318, 0, 0, []],
				89,
				17,
				[
				],
				[
				[
					400,
					0,
					0,
					0,
					1,
					1
				],
				[
					1
				]
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
			],
			[			]
		]
,		[
			"ParallaxFront",
			4,
			864100069453997,
			true,
			[255, 255, 255],
			true,
			1.200000047683716,
			1,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[3, 828, 0, 18000, 153, 0, 0, 1, 0, 0, 0, 0, []],
				9,
				1307,
				[
				],
				[
				],
				[
					0,
					0
				]
			]
			],
			[			]
		]
,		[
			"UI",
			5,
			7012724301985063,
			true,
			[255, 255, 255],
			true,
			0,
			0,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[440, 46, 0, 92, 90, 0, 0, 1, 0.5, 0.5222222208976746, 0, 0, []],
				21,
				1308,
				[
				],
				[
				[
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[522, 43, 0, 50, 50, 0, 0, 1, 0.5, 0.5199999809265137, 0, 0, []],
				26,
				1309,
				[
				],
				[
				[
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[897, 534, 0, 131, 127, 0, 0, 0.5, 0.5038167834281921, 0.5039370059967041, 0, 0, []],
				39,
				1310,
				[
				],
				[
				],
				[
					1,
					"Default",
					0,
					0
				]
			]
,			[
				[66, 535, 0, 130, 127, 0, 0, 0.5, 0.5, 0.5039370059967041, 0, 0, []],
				36,
				1311,
				[
				],
				[
				],
				[
					1,
					"Default",
					0,
					0
				]
			]
,			[
				[208, 248, 0, 357, 42, 0, 0, 1, 0, 0, 0, 0, []],
				38,
				1313,
				[
				],
				[
				],
				[
					"Paused. click 'P' to resume the game",
					1,
					"16pt Arial",
					"rgb(0,0,0)",
					0,
					0,
					0,
					0,
					0
				]
			]
,			[
				[205.4748992919922, 30.24537658691406, 0, 46, 46, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				32,
				1314,
				[
					[1]
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[253.4053192138672, 31.80824279785156, 0, 46, 46, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				32,
				1315,
				[
					[2]
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[298.7312316894531, 31.28722381591797, 0, 46, 46, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				32,
				1316,
				[
					[3]
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[95, 519, 0, 150, 125, 0, 0, 1, 0.47843137383461, 0.4552845656871796, 0, 0, []],
				34,
				1317,
				[
				],
				[
				[
				]
				],
				[
					0,
					"Default",
					0,
					0
				]
			]
,			[
				[272, 158, 0, 307, 50, 0, 0, 1, 0, 0, 0, 0, []],
				42,
				1318,
				[
				],
				[
				],
				[
					"",
					1,
					"bold 24pt Arial",
					"rgb(255,255,255)",
					0,
					0,
					0,
					0,
					0
				]
			]
,			[
				[870, 93, 0, 62, 64, 0, 0, 1, 0.4838709533214569, 0.53125, 0, 0, []],
				28,
				1319,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[870, 41, 0, 76, 76, 0, 0, 1, 0.5, 0.5789473652839661, 0, 0, []],
				28,
				1320,
				[
				],
				[
				],
				[
					0,
					"Distance",
					0,
					1
				]
			]
,			[
				[730, 12, 0, 109, 45, 0, 0, 1, 0, 0, 0, 0, []],
				35,
				1321,
				[
				],
				[
				],
				[
					"Text",
					0,
					"italic 18pt Arial Rounded MT Bold",
					"rgb(204,255,0)",
					1,
					1,
					0,
					0,
					0
				]
			]
,			[
				[730, 68, 0, 104.8147277832031, 47.73084259033203, 0, 0, 1, 0, 0, 0, 0, []],
				33,
				1322,
				[
				],
				[
				],
				[
					"Text",
					0,
					"italic 18pt Arial Rounded MT Bold",
					"rgb(204,255,0)",
					1,
					1,
					0,
					0,
					0
				]
			]
,			[
				[127, 476, 0, 250, 250, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				44,
				1323,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[837, 472, 0, 250, 250, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				45,
				1324,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[64, 29, 0, 100, 31, 0, 0, 1, 0.5, 0.5161290168762207, 0, 0, []],
				68,
				1325,
				[
				],
				[
				],
				[
					0,
					"Small",
					0,
					1
				]
			]
,			[
				[483, 301, 0, 1000, 610, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				37,
				1312,
				[
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[927, 35, 0, 76, 70, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				46,
				4019,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[600, 371, 0, 178, 53, 0, 0, 1, 0.5, 0.5094339847564697, 0, 0, []],
				86,
				4043,
				[
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[363, 371, 0, 178, 53, 0, 0, 1, 0.502439022064209, 0.5068492889404297, 0, 0, []],
				85,
				4066,
				[
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
			],
			[			]
		]
		],
		[
		],
		[]
	]
,	[
		"Level9",
		20000,
		900,
		false,
		"GameEventSheet",
		5960994007154107,
		[
		[
			"Background",
			0,
			1644900376344891,
			true,
			[255, 255, 255],
			false,
			0.02999999932944775,
			0,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[0, 0, 0, 20000, 900, 0, 0, 1, 0, 0, 0, 0, []],
				8,
				1423,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					0
				]
			]
			],
			[			]
		]
,		[
			"Parallax",
			1,
			1778532595514251,
			true,
			[255, 255, 255],
			true,
			0.800000011920929,
			0.800000011920929,
			1,
			false,
			1,
			0,
			2,
			[
			[
				[2, 199, 0, 20000, 706, 0, 0, 1, 0, 0, 0, 0, []],
				10,
				1424,
				[
				],
				[
				],
				[
					0,
					0
				]
			]
			],
			[			]
		]
,		[
			"Platform",
			2,
			6260751664012893,
			true,
			[255, 255, 255],
			true,
			1,
			1,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[234, 700, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				1425,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[1609, 616, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				1432,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[862, 441, 0, 327, 89, 0, 0, 1, 0.5259938836097717, 0.4157303273677826, 0, 0, []],
				6,
				1433,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					3,
					1
				]
			]
,			[
				[2162, 409, 0, 110, 72, 0, 0, 1, 0.5363636612892151, 0.3888888955116272, 0, 0, []],
				6,
				1431,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[2651, 622, 0, 182, 72, 0, 0, 1, 0.5, 0.4305555522441864, 0, 0, []],
				6,
				1434,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					1,
					1
				]
			]
,			[
				[3143, 794, 0, 182, 72, 0, 0, 1, 0.5, 0.4305555522441864, 0, 0, []],
				6,
				1435,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					1,
					1
				]
			]
,			[
				[3618, 798, 0, 110, 72, 0, 0, 1, 0.5363636612892151, 0.3888888955116272, 0, 0, []],
				6,
				1436,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[3894, 610, 0, 261, 79, 0, 0, 1, 0.5210728049278259, 0.3544303774833679, 0, 0, []],
				6,
				1437,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[4237, 414, 0, 261, 79, 0, 0, 1, 0.5210728049278259, 0.3544303774833679, 0, 0, []],
				6,
				1438,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[4823, 626, 0, 327, 89, 0, 0, 1, 0.5259938836097717, 0.4157303273677826, 0, 0, []],
				6,
				1439,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					3,
					1
				]
			]
,			[
				[5414, 630, 0, 327, 89, 0, 0, 1, 0.5259938836097717, 0.4157303273677826, 0, 0, []],
				6,
				1440,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					3,
					1
				]
			]
,			[
				[5844, 509, 0, 261, 79, 0, 0, 1, 0.5210728049278259, 0.3544303774833679, 0, 0, []],
				6,
				1441,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[6539, 784, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				1442,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[7297, 802, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				1443,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[6945, 569, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				1444,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[7680, 263, 0, 110, 72, 0, 0, 1, 0.5363636612892151, 0.3888888955116272, 0, 0, []],
				6,
				1445,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[8040, 480, 0, 261, 79, 0, 0, 1, 0.5210728049278259, 0.3544303774833679, 0, 0, []],
				6,
				1447,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[8374, 708, 0, 182, 72, 0, 0, 1, 0.5, 0.4305555522441864, 0, 0, []],
				6,
				1448,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					1,
					1
				]
			]
,			[
				[8402, 285, 0, 182, 72, 0, 0, 1, 0.5, 0.4305555522441864, 0, 0, []],
				6,
				1449,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					1,
					1
				]
			]
,			[
				[8861, 512, 0, 327, 89, 0, 0, 1, 0.5259938836097717, 0.4157303273677826, 0, 0, []],
				6,
				1450,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					3,
					1
				]
			]
,			[
				[8829, 787, 0, 110, 72, 0, 0, 1, 0.5363636612892151, 0.3888888955116272, 0, 0, []],
				6,
				1451,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[9508, 811, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				1452,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[10436, 809, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				1454,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[9991, 835, 0, 110, 72, 0, 0, 1, 0.5363636612892151, 0.3888888955116272, 0, 0, []],
				6,
				1455,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[10951, 602, 0, 327, 89, 0, 0, 1, 0.5259938836097717, 0.4157303273677826, 0, 0, []],
				6,
				1456,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					3,
					1
				]
			]
,			[
				[11450, 718, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				1457,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[12426, 825, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				1458,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[11990, 274, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				1459,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[12786, 634, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				1461,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[13970, 480, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				1463,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[13500, 594, 0, 400, 100, 0, 0, 1, 0.5149999856948853, 0.4799999892711639, 0, 0, []],
				6,
				1462,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					4,
					1
				]
			]
,			[
				[14838, 769, 0, 400, 100, 0, 0, 1, 0.5149999856948853, 0.4799999892711639, 0, 0, []],
				6,
				1464,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					4,
					1
				]
			]
,			[
				[15310, 654, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				1465,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[16126, 855, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				1466,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[17193, 402, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				1467,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[16839, 612, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				1468,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[17643, 760, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				1469,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[17958, 536, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				1470,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[18905, 544, 0, 541, 295, 0, 0, 1, 0.4676524996757507, 0.7389830350875855, 0, 0, []],
				7,
				1471,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					1,
					1
				]
			]
,			[
				[19388, 538, 0, 463, 393, 0, 0, 1, 0.4362851083278656, 0.7302799224853516, 0, 0, []],
				7,
				1472,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					3,
					1
				]
			]
,			[
				[19885, 553, 0, 541, 295, 0, 0, 1, 0.4676524996757507, 0.7389830350875855, 0, 0, []],
				7,
				1473,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					1,
					1
				]
			]
			],
			[			]
		]
,		[
			"Game",
			3,
			366069774710576,
			true,
			[255, 255, 255],
			true,
			1,
			1,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[43, 562, 0, 60, 75, 0, 0, 1, 0.5, 0.4533333480358124, 0, 0, []],
				88,
				1478,
				[
					[0],
					[0],
					[1],
					[1],
					[0],
					[0],
					[1],
					[0],
					[0],
					[0],
					[0],
					[0],
					[0],
					[1],
					[0],
					[0]
				],
				[
				[
					250,
					10000,
					10000,
					400,
					1300,
					1000,
					0,
					1
				],
				[
				]
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[53, 557, 0, 105, 85, 0, 0, 1, 0.4857142865657806, 0.4000000059604645, 0, 0, []],
				87,
				1479,
				[
				],
				[
				[
				],
				[
				]
				],
				[
					0,
					"Running",
					0,
					1
				]
			]
,			[
				[259, 1087, 0, 36, 37, 0, -1.570799946784973, 1, 0.5, 0.5135135054588318, 0, 0, []],
				89,
				1483,
				[
				],
				[
				[
					400,
					0,
					0,
					0,
					1,
					1
				],
				[
					1
				]
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[64, 571, 0, 150, 150, 0, 0, 1, 0.4933333396911621, 0.5133333206176758, 0, 0, []],
				24,
				1491,
				[
				],
				[
				[
				]
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[7471, 741, 0, 142, 75, 0, 0, 1, 0.5, 0.5066666603088379, 0, 0, []],
				90,
				1446,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[9688, 753, 0, 142, 75, 0, 0, 1, 0.5, 0.5066666603088379, 0, 0, []],
				90,
				1453,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[11479, 661, 0, 142, 75, 0, 0, 1, 0.5, 0.5066666603088379, 0, 0, []],
				90,
				1460,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[1680, 336, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1474,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[3076, 401, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1475,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[3824, 665, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1476,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[4275, 523, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1477,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[6053, 401, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1504,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[6913, 662, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1505,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[7414, 393, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1506,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[8750, 161, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1507,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[9196, 336, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1508,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[8665, 579, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1509,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[10133, 330, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1510,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[11093, 459, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1511,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[12162, 98, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1512,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[14975, 509, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1513,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[17449, 243, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1514,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[18592, 354, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1515,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[944, 358, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1516,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[1807, 480, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1517,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[3982, 538, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1518,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[5515, 548, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1519,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[7355, 656, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1520,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[8476, 194, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1521,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[10974, 516, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1522,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[12928, 482, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1523,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[15362, 512, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1524,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[16909, 468, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1525,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[1670, 461, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1526,
				[
					["groundMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[3445, 668, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1527,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[5534, 408, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1528,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[4909, 518, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1529,
				[
					["groundMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[8968, 370, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1530,
				[
					["groundMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[10596, 613, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1531,
				[
					["groundMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[11610, 550, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1532,
				[
					["groundMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[12523, 632, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1533,
				[
					["groundMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[14123, 297, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1534,
				[
					["groundMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[18092, 350, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1535,
				[
					["groundMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[19530, 373, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1536,
				[
					["groundMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[19083, 375, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1537,
				[
					["groundMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[4293, 314, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1538,
				[
					["spike"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[7033, 403, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1539,
				[
					["spike"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[9534, 640, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1540,
				[
					["spike"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[12863, 489, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1541,
				[
					["spike"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[13610, 483, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1542,
				[
					["spike"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[16265, 678, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1543,
				[
					["spike"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[19330, 368, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1544,
				[
					["spike"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[17715, 598, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1545,
				[
					["spike"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[18965, 373, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1546,
				[
					["spike"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[10363, 664, 0, 75, 75, 0, 0, 1, 0.4608695507049561, 0.7053571343421936, 0, 0, []],
				25,
				1548,
				[
					["Shield"]
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[17769, 645, 0, 75, 75, 0, 0, 1, 0.4608695507049561, 0.7053571343421936, 0, 0, []],
				25,
				1549,
				[
					["Big"]
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[1436, 484, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1547,
				[
					["Silver"],
					[5],
					[5],
					[5]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[2516, 362, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1550,
				[
					["Gold"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[2973, 566, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1551,
				[
					["Gold"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[3628, 616, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1552,
				[
					["Gold"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[3926, 431, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1553,
				[
					["Gold"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[4254, 172, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1554,
				[
					["Gold"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[4594, 439, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1555,
				[
					["Gold"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[5133, 439, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1556,
				[
					["Gold"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[5556, 354, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1557,
				[
					["Gold"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[6308, 373, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1558,
				[
					["Gold"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[6429, 615, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1559,
				[
					["Silver"],
					[5],
					[3],
					[3]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[7092, 671, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1560,
				[
					["Silver"],
					[5],
					[3],
					[3]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[8084, 185, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1561,
				[
					["Diamond"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[8535, 435, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1562,
				[
					["Diamond"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[9330, 303, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1563,
				[
					["Diamond"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[11301, 568, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1564,
				[
					["Bronze"],
					[5],
					[4],
					[4]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[9980, 689, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1565,
				[
					["Diamond"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[11685, 105, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1566,
				[
					["Bronze"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[11576, 203, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1567,
				[
					["Bronze"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[11544, 267, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1568,
				[
					["Bronze"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[11500, 362, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1569,
				[
					["Bronze"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[11521, 322, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1570,
				[
					["Bronze"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[11484, 410, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1571,
				[
					["Bronze"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[11621, 136, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1572,
				[
					["Bronze"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[12641, 503, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1573,
				[
					["Bronze"],
					[5],
					[4],
					[4]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[13784, 355, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1574,
				[
					["Bronze"],
					[5],
					[4],
					[4]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[16003, 720, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1575,
				[
					["Bronze"],
					[5],
					[3],
					[3]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[17534, 627, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1576,
				[
					["Bronze"],
					[5],
					[3],
					[3]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[17101, 278, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1577,
				[
					["Bronze"],
					[5],
					[5],
					[5]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[18867, 281, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1578,
				[
					["Bronze"],
					[5],
					[5],
					[5]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[19517, 273, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1579,
				[
					["Bronze"],
					[5],
					[5],
					[5]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
			],
			[			]
		]
,		[
			"ParallaxFront",
			4,
			484877566947972,
			true,
			[255, 255, 255],
			true,
			1.200000047683716,
			1,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[3, 828, 0, 20000, 153, 0, 0, 1, 0, 0, 0, 0, []],
				9,
				1677,
				[
				],
				[
				],
				[
					0,
					0
				]
			]
			],
			[			]
		]
,		[
			"UI",
			5,
			5986355068795349,
			true,
			[255, 255, 255],
			true,
			0,
			0,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[440, 46, 0, 92, 90, 0, 0, 1, 0.5, 0.5222222208976746, 0, 0, []],
				21,
				1678,
				[
				],
				[
				[
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[522, 43, 0, 50, 50, 0, 0, 1, 0.5, 0.5199999809265137, 0, 0, []],
				26,
				1679,
				[
				],
				[
				[
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[897, 534, 0, 131, 127, 0, 0, 0.5, 0.5038167834281921, 0.5039370059967041, 0, 0, []],
				39,
				1680,
				[
				],
				[
				],
				[
					1,
					"Default",
					0,
					0
				]
			]
,			[
				[66, 535, 0, 130, 127, 0, 0, 0.5, 0.5, 0.5039370059967041, 0, 0, []],
				36,
				1681,
				[
				],
				[
				],
				[
					1,
					"Default",
					0,
					0
				]
			]
,			[
				[208, 248, 0, 357, 42, 0, 0, 1, 0, 0, 0, 0, []],
				38,
				1683,
				[
				],
				[
				],
				[
					"Paused. click 'P' to resume the game",
					1,
					"16pt Arial",
					"rgb(0,0,0)",
					0,
					0,
					0,
					0,
					0
				]
			]
,			[
				[205.4748992919922, 30.24537658691406, 0, 46, 46, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				32,
				1684,
				[
					[1]
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[253.4053192138672, 31.80824279785156, 0, 46, 46, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				32,
				1685,
				[
					[2]
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[298.7312316894531, 31.28722381591797, 0, 46, 46, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				32,
				1686,
				[
					[3]
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[95, 519, 0, 150, 125, 0, 0, 1, 0.47843137383461, 0.4552845656871796, 0, 0, []],
				34,
				1687,
				[
				],
				[
				[
				]
				],
				[
					0,
					"Default",
					0,
					0
				]
			]
,			[
				[272, 158, 0, 307, 50, 0, 0, 1, 0, 0, 0, 0, []],
				42,
				1688,
				[
				],
				[
				],
				[
					"",
					1,
					"bold 24pt Arial",
					"rgb(255,255,255)",
					0,
					0,
					0,
					0,
					0
				]
			]
,			[
				[870, 93, 0, 62, 64, 0, 0, 1, 0.4838709533214569, 0.53125, 0, 0, []],
				28,
				1689,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[870, 41, 0, 76, 76, 0, 0, 1, 0.5, 0.5789473652839661, 0, 0, []],
				28,
				1690,
				[
				],
				[
				],
				[
					0,
					"Distance",
					0,
					1
				]
			]
,			[
				[730, 12, 0, 109, 45, 0, 0, 1, 0, 0, 0, 0, []],
				35,
				1691,
				[
				],
				[
				],
				[
					"Text",
					0,
					"italic 18pt Arial Rounded MT Bold",
					"rgb(204,255,0)",
					1,
					1,
					0,
					0,
					0
				]
			]
,			[
				[730, 68, 0, 104.8147277832031, 47.73084259033203, 0, 0, 1, 0, 0, 0, 0, []],
				33,
				1692,
				[
				],
				[
				],
				[
					"Text",
					0,
					"italic 18pt Arial Rounded MT Bold",
					"rgb(204,255,0)",
					1,
					1,
					0,
					0,
					0
				]
			]
,			[
				[127, 476, 0, 250, 250, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				44,
				1693,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[835, 475, 0, 250, 250, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				45,
				1694,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[64, 29, 0, 100, 31, 0, 0, 1, 0.5, 0.5161290168762207, 0, 0, []],
				68,
				1695,
				[
				],
				[
				],
				[
					0,
					"Small",
					0,
					1
				]
			]
,			[
				[483, 301, 0, 1000, 610, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				37,
				1682,
				[
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[927, 35, 0, 76, 70, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				46,
				4020,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[600, 371, 0, 178, 53, 0, 0, 1, 0.5, 0.5094339847564697, 0, 0, []],
				86,
				4044,
				[
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[363, 371, 0, 178, 53, 0, 0, 1, 0.502439022064209, 0.5068492889404297, 0, 0, []],
				85,
				4067,
				[
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
			],
			[			]
		]
		],
		[
		],
		[]
	]
,	[
		"Level10",
		22000,
		900,
		false,
		"GameEventSheet",
		1246451427617519,
		[
		[
			"Background",
			0,
			7179331057041591,
			true,
			[255, 255, 255],
			false,
			0.02999999932944775,
			0,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[0, 0, 0, 22000, 900, 0, 0, 1, 0, 0, 0, 0, []],
				8,
				1580,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					0
				]
			]
			],
			[			]
		]
,		[
			"Parallax",
			1,
			2474677556472316,
			true,
			[255, 255, 255],
			true,
			0.800000011920929,
			0.800000011920929,
			1,
			false,
			1,
			0,
			2,
			[
			[
				[2, 199, 0, 22000, 706, 0, 0, 1, 0, 0, 0, 0, []],
				10,
				1581,
				[
				],
				[
				],
				[
					0,
					0
				]
			]
			],
			[			]
		]
,		[
			"Platform",
			2,
			4675551727852031,
			true,
			[255, 255, 255],
			true,
			1,
			1,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[223, 819, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				1582,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[749, 844, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				1588,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[1315, 782, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				1589,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[1805, 608, 0, 463, 393, 0, 0, 1, 0.4362851083278656, 0.7302799224853516, 0, 0, []],
				7,
				1590,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					3,
					1
				]
			]
,			[
				[1874, 410, 0, 261, 199, 0, 0, 1, 0.5019156932830811, 0.6934673190116882, 0, 0, []],
				7,
				1591,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					5,
					1
				]
			]
,			[
				[4094, 529, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				1592,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[2227, 263, 0, 261, 199, 0, 0, 1, 0.5019156932830811, 0.6934673190116882, 0, 0, []],
				7,
				1593,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					5,
					1
				]
			]
,			[
				[3106, 852, 0, 261, 199, 0, 0, 1, 0.5019156932830811, 0.6934673190116882, 0, 0, []],
				7,
				1595,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					5,
					1
				]
			]
,			[
				[3606, 633, 0, 327, 89, 0, 0, 1, 0.5259938836097717, 0.4157303273677826, 0, 0, []],
				6,
				1596,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					3,
					1
				]
			]
,			[
				[4878, 794, 0, 327, 89, 0, 0, 1, 0.5259938836097717, 0.4157303273677826, 0, 0, []],
				6,
				1597,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					3,
					1
				]
			]
,			[
				[5082, 674, 0, 182, 72, 0, 0, 1, 0.5, 0.4305555522441864, 0, 0, []],
				6,
				1598,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					1,
					1
				]
			]
,			[
				[5336, 531, 0, 182, 72, 0, 0.01367837376892567, 1, 0.5, 0.4305555522441864, 0, 0, []],
				6,
				1599,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					1,
					1
				]
			]
,			[
				[5720, 747, 0, 400, 100, 0, 0, 1, 0.5149999856948853, 0.4799999892711639, 0, 0, []],
				6,
				1600,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					4,
					1
				]
			]
,			[
				[5791, 336, 0, 400, 100, 0, 0, 1, 0.5149999856948853, 0.4799999892711639, 0, 0, []],
				6,
				1601,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					4,
					1
				]
			]
,			[
				[6351, 840, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				1602,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[6262, 541, 0, 182, 72, 0, 0.01367837376892567, 1, 0.5, 0.4305555522441864, 0, 0, []],
				6,
				1603,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					1,
					1
				]
			]
,			[
				[7024, 799, 0, 400, 100, 0, 0, 1, 0.5149999856948853, 0.4799999892711639, 0, 0, []],
				6,
				1604,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					4,
					1
				]
			]
,			[
				[7464, 754, 0, 400, 100, 0, 0, 1, 0.5149999856948853, 0.4799999892711639, 0, 0, []],
				6,
				1606,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					4,
					1
				]
			]
,			[
				[7866, 688, 0, 400, 100, 0, 0, 1, 0.5149999856948853, 0.4799999892711639, 0, 0, []],
				6,
				1608,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					4,
					1
				]
			]
,			[
				[8404, 818, 0, 400, 100, 0, 0, 1, 0.5149999856948853, 0.4799999892711639, 0, 0, []],
				6,
				1609,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					4,
					1
				]
			]
,			[
				[8701, 720, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				1610,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[9239, 506, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				1611,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[10680, 823, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				1612,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[10010, 683, 0, 400, 100, 0, 0, 1, 0.5149999856948853, 0.4799999892711639, 0, 0, []],
				6,
				1613,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					4,
					1
				]
			]
,			[
				[11675, 712, 0, 261, 79, 0, 0, 1, 0.5210728049278259, 0.3544303774833679, 0, 0, []],
				6,
				1615,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[12148, 319, 0, 261, 79, 0, 0, 1, 0.5210728049278259, 0.3544303774833679, 0, 0, []],
				6,
				1616,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[12781, 589, 0, 261, 79, 0, 0, 1, 0.5210728049278259, 0.3544303774833679, 0, 0, []],
				6,
				1617,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[13636, 351, 0, 261, 79, 0, 0, 1, 0.5210728049278259, 0.3544303774833679, 0, 0, []],
				6,
				1618,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[13797, 797, 0, 261, 79, 0, 0, 1, 0.5210728049278259, 0.3544303774833679, 0, 0, []],
				6,
				1619,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[14346, 778, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				1620,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[17250, 758, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				1605,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[17853, 608, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				1607,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[19171, 543, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				1621,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[20047, 821, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				1622,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[20620, 602, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				1623,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[21283, 572, 0, 110, 72, 0, 0, 1, 0.5363636612892151, 0.3888888955116272, 0, 0, []],
				6,
				1624,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[21834, 655, 0, 523, 391, 0, 0, 1, 0.5124282836914063, 0.790281355381012, 0, 0, []],
				7,
				1625,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[15679, 802, 0, 441, 337, 0, 0, 1, 0.4648526012897492, 0.7270029783248901, 0, 0, []],
				7,
				1660,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[15040, 771, 0, 110, 72, 0, 0, 1, 0.5363636612892151, 0.3888888955116272, 0, 0, []],
				6,
				1656,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[16359, 808, 0, 110, 72, 0, 0, 1, 0.5363636612892151, 0.3888888955116272, 0, 0, []],
				6,
				1657,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[16832, 790, 0, 110, 72, 0, 0, 1, 0.5363636612892151, 0.3888888955116272, 0, 0, []],
				6,
				1662,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[6624, 405, 0, 182, 72, 0, 0.01367837376892567, 1, 0.5, 0.4305555522441864, 0, 0, []],
				6,
				1808,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					1,
					1
				]
			]
,			[
				[7036, 353, 0, 182, 72, 0, 0.01367837376892567, 1, 0.5, 0.4305555522441864, 0, 0, []],
				6,
				1809,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					1,
					1
				]
			]
			],
			[			]
		]
,		[
			"Game",
			3,
			8166043392032642,
			true,
			[255, 255, 255],
			true,
			1,
			1,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[46, 686, 0, 60, 75, 0, 0, 1, 0.5, 0.4533333480358124, 0, 0, []],
				88,
				1628,
				[
					[0],
					[0],
					[1],
					[1],
					[0],
					[0],
					[1],
					[0],
					[0],
					[0],
					[0],
					[0],
					[0],
					[1],
					[0],
					[0]
				],
				[
				[
					250,
					10000,
					10000,
					400,
					1300,
					1000,
					0,
					1
				],
				[
				]
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[56, 681, 0, 105, 85, 0, 0, 1, 0.4857142865657806, 0.4000000059604645, 0, 0, []],
				87,
				1629,
				[
				],
				[
				[
				],
				[
				]
				],
				[
					0,
					"Running",
					0,
					1
				]
			]
,			[
				[259, 1087, 0, 36, 37, 0, -1.570799946784973, 1, 0.5, 0.5135135054588318, 0, 0, []],
				89,
				1633,
				[
				],
				[
				[
					400,
					0,
					0,
					0,
					1,
					1
				],
				[
					1
				]
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[67, 695, 0, 150, 150, 0, 0, 1, 0.4933333396911621, 0.5133333206176758, 0, 0, []],
				24,
				1641,
				[
				],
				[
				[
				]
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[11062, 536, 0, 75, 75, 0, 0, 1, 0.4608695507049561, 0.7053571343421936, 0, 0, []],
				25,
				1614,
				[
					["Flight"]
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[14703, 708, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1626,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[14820, 702, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1627,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[15293, 706, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1658,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[15396, 705, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1659,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[16082, 738, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1661,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[16506, 727, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1663,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[18183, 531, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1665,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[18320, 522, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1666,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[18438, 521, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1667,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[15986, 742, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1674,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[16184, 733, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1675,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[16616, 725, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1697,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[18569, 519, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1668,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[18713, 511, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1669,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[18831, 520, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1670,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[2521, 485, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1594,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[2683, 633, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1664,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[2860, 702, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1671,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[852, 667, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1672,
				[
					["spike"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[1963, 456, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1673,
				[
					["spike"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[4238, 367, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1676,
				[
					["spike"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[6450, 658, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1696,
				[
					["spike"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[8432, 700, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1698,
				[
					["spike"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[12829, 487, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1699,
				[
					["spike"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[17397, 592, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1700,
				[
					["spike"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[20171, 674, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1701,
				[
					["spike"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[667, 690, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1702,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[1276, 639, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1703,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[1933, 275, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1704,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[3702, 526, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1705,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[5136, 584, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1706,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[5851, 642, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1707,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[7554, 640, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1708,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[10120, 566, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1709,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[11733, 613, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1710,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[14467, 624, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1711,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[19289, 376, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1712,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[21800, 499, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1713,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[1779, 461, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1714,
				[
					["groundMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[4946, 685, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1715,
				[
					["groundMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[7970, 582, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1716,
				[
					["groundMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[7445, 637, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1717,
				[
					["groundMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[10824, 666, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1718,
				[
					["groundMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[12249, 209, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1719,
				[
					["groundMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[13900, 686, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1720,
				[
					["groundMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[20003, 651, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1722,
				[
					["groundMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[20755, 427, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1723,
				[
					["groundMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[1107, 527, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1724,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[2275, 427, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1725,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[2764, 107, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1726,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[1524, 189, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1727,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[3414, 667, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1728,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[4377, 163, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1729,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[4506, 371, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1730,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[5645, 421, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1731,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[5426, 632, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1732,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[6068, 155, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1733,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[6155, 606, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1734,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[5778, 419, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1735,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[6868, 374, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1736,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[7867, 326, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1737,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[8438, 529, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1738,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[9836, 359, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1739,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[10039, 426, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1740,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[10768, 579, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1741,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[12079, 484, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1742,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[12432, 144, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1743,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[13226, 474, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1744,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[12917, 150, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1745,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[13131, 720, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1746,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[12691, 313, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1747,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[12425, 653, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1748,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[11870, 202, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1749,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[12080, 756, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1750,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[12383, 457, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1751,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[13616, 138, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1752,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[13922, 209, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1753,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[14036, 518, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1754,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[14833, 212, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1755,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[14424, 169, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1756,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[15667, 618, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1757,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[15139, 322, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1777,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[14495, 386, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1778,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[15716, 492, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1779,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[15818, 65, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1780,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[15261, 128, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1781,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[15543, 387, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1782,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[16124, 458, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1783,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[16066, 302, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1784,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[16800, 548, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1785,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[16306, 182, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1786,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[15852, 203, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1787,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[16366, 398, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1788,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[16571, 140, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1789,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[16631, 401, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1790,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[17079, 602, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1791,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[16963, 488, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1792,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[16908, 288, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1793,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[17230, 162, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1794,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[17378, 384, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1795,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[17792, 262, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1796,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[17504, 193, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1797,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[17150, 475, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1798,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[18183, 172, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1799,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[18773, 180, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1800,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[18404, 328, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1801,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[19642, 240, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1802,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[19866, 607, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1803,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[20566, 357, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1804,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[21475, 407, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1805,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[1453, 618, 0, 75, 75, 0, 0, 1, 0.5199999809265137, 0.5199999809265137, 0, 0, []],
				23,
				1806,
				[
					["Fire"]
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[7053, 239, 0, 75, 75, 0, 0, 1, 0.5199999809265137, 0.5199999809265137, 0, 0, []],
				23,
				1807,
				[
					["Ice"]
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[13684, 640, 0, 75, 75, 0, 0, 1, 0.4608695507049561, 0.7053571343421936, 0, 0, []],
				25,
				1810,
				[
					["Shield"]
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[623, 679, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1811,
				[
					["Bronze"],
					[5],
					[5],
					[5]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[1673, 485, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1812,
				[
					["Bronze"],
					[5],
					[5],
					[5]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[2542, 292, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1813,
				[
					["Bronze"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[2600, 361, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1814,
				[
					["Bronze"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[2655, 413, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1815,
				[
					["Bronze"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[2711, 455, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1816,
				[
					["Bronze"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[2763, 494, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1817,
				[
					["Bronze"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[2811, 533, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1818,
				[
					["Bronze"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[2871, 581, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1819,
				[
					["Bronze"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[2929, 621, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1820,
				[
					["Bronze"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[3029, 645, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1821,
				[
					["Bronze"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[4058, 131, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1822,
				[
					["Diamond"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[5589, 191, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1823,
				[
					["Bronze"],
					[5],
					[5],
					[5]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[5520, 639, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1824,
				[
					["Bronze"],
					[5],
					[5],
					[5]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[6813, 684, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1825,
				[
					["Bronze"],
					[5],
					[5],
					[5]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[8202, 721, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1826,
				[
					["Bronze"],
					[5],
					[5],
					[5]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[9812, 607, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1827,
				[
					["Gold"],
					[5],
					[5],
					[5]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[11537, 636, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1833,
				[
					["Gold"],
					[5],
					[5],
					[5]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[12028, 177, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1828,
				[
					["Gold"],
					[5],
					[5],
					[5]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[12431, 734, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1829,
				[
					["Gold"],
					[5],
					[5],
					[5]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[13209, 209, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1830,
				[
					["Diamond"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[13437, 567, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1831,
				[
					["Gold"],
					[5],
					[5],
					[5]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[14184, 639, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1832,
				[
					["Gold"],
					[5],
					[5],
					[5]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[15522, 521, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1834,
				[
					["Gold"],
					[5],
					[5],
					[5]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[16000, 292, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1835,
				[
					["Gold"],
					[5],
					[5],
					[5]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[16348, 703, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1836,
				[
					["Diamond"],
					[5],
					[1],
					[1]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[17702, 475, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1837,
				[
					["Gold"],
					[5],
					[5],
					[5]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[18980, 409, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1838,
				[
					["Gold"],
					[5],
					[5],
					[5]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[21616, 507, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1839,
				[
					["Gold"],
					[5],
					[5],
					[5]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[19906, 700, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				1840,
				[
					["Gold"],
					[5],
					[5],
					[5]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[5946, 213, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1841,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[6030, 657, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1842,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[6413, 427, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1843,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[8192, 592, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1844,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[9653, 343, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1845,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[9289, 340, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				1846,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
			],
			[			]
		]
,		[
			"ParallaxFront",
			4,
			7695620258931743,
			true,
			[255, 255, 255],
			true,
			1.200000047683716,
			1,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[3, 828, 0, 22000, 153, 0, 0, 1, 0, 0, 0, 0, []],
				9,
				1758,
				[
				],
				[
				],
				[
					0,
					0
				]
			]
			],
			[			]
		]
,		[
			"UI",
			5,
			5294435156095336,
			true,
			[255, 255, 255],
			true,
			0,
			0,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[440, 46, 0, 92, 90, 0, 0, 1, 0.5, 0.5222222208976746, 0, 0, []],
				21,
				1759,
				[
				],
				[
				[
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[522, 43, 0, 50, 50, 0, 0, 1, 0.5, 0.5199999809265137, 0, 0, []],
				26,
				1760,
				[
				],
				[
				[
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[897, 534, 0, 131, 127, 0, 0, 0.5, 0.5038167834281921, 0.5039370059967041, 0, 0, []],
				39,
				1761,
				[
				],
				[
				],
				[
					1,
					"Default",
					0,
					0
				]
			]
,			[
				[66, 535, 0, 130, 127, 0, 0, 0.5, 0.5, 0.5039370059967041, 0, 0, []],
				36,
				1762,
				[
				],
				[
				],
				[
					1,
					"Default",
					0,
					0
				]
			]
,			[
				[208, 248, 0, 357, 42, 0, 0, 1, 0, 0, 0, 0, []],
				38,
				1764,
				[
				],
				[
				],
				[
					"Paused. click 'P' to resume the game",
					1,
					"16pt Arial",
					"rgb(0,0,0)",
					0,
					0,
					0,
					0,
					0
				]
			]
,			[
				[205.4748992919922, 30.24537658691406, 0, 46, 46, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				32,
				1765,
				[
					[1]
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[253.4053192138672, 31.80824279785156, 0, 46, 46, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				32,
				1766,
				[
					[2]
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[298.7312316894531, 31.28722381591797, 0, 46, 46, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				32,
				1767,
				[
					[3]
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[95, 519, 0, 150, 125, 0, 0, 1, 0.47843137383461, 0.4552845656871796, 0, 0, []],
				34,
				1768,
				[
				],
				[
				[
				]
				],
				[
					0,
					"Default",
					0,
					0
				]
			]
,			[
				[272, 158, 0, 307, 50, 0, 0, 1, 0, 0, 0, 0, []],
				42,
				1769,
				[
				],
				[
				],
				[
					"",
					1,
					"bold 24pt Arial",
					"rgb(255,255,255)",
					0,
					0,
					0,
					0,
					0
				]
			]
,			[
				[870, 93, 0, 62, 64, 0, 0, 1, 0.4838709533214569, 0.53125, 0, 0, []],
				28,
				1770,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[870, 41, 0, 76, 76, 0, 0, 1, 0.5, 0.5789473652839661, 0, 0, []],
				28,
				1771,
				[
				],
				[
				],
				[
					0,
					"Distance",
					0,
					1
				]
			]
,			[
				[730, 12, 0, 109, 45, 0, 0, 1, 0, 0, 0, 0, []],
				35,
				1772,
				[
				],
				[
				],
				[
					"Text",
					0,
					"italic 18pt Arial Rounded MT Bold",
					"rgb(204,255,0)",
					1,
					1,
					0,
					0,
					0
				]
			]
,			[
				[730, 68, 0, 104.8147277832031, 47.73084259033203, 0, 0, 1, 0, 0, 0, 0, []],
				33,
				1773,
				[
				],
				[
				],
				[
					"Text",
					0,
					"italic 18pt Arial Rounded MT Bold",
					"rgb(204,255,0)",
					1,
					1,
					0,
					0,
					0
				]
			]
,			[
				[127, 476, 0, 250, 250, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				44,
				1774,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[841, 477, 0, 250, 250, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				45,
				1775,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[64, 29, 0, 100, 31, 0, 0, 1, 0.5, 0.5161290168762207, 0, 0, []],
				68,
				1776,
				[
				],
				[
				],
				[
					0,
					"Small",
					0,
					1
				]
			]
,			[
				[483, 301, 0, 1000, 610, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				37,
				1763,
				[
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[927, 35, 0, 76, 70, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				46,
				4021,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[600, 371, 0, 178, 53, 0, 0, 1, 0.5, 0.5094339847564697, 0, 0, []],
				86,
				4045,
				[
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[363, 371, 0, 178, 53, 0, 0, 1, 0.502439022064209, 0.5068492889404297, 0, 0, []],
				85,
				4068,
				[
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
			],
			[			]
		]
		],
		[
		],
		[]
	]
,	[
		"Level11",
		29000,
		900,
		false,
		"GameEventSheet",
		973820852960498,
		[
		[
			"Background",
			0,
			9026909024209613,
			true,
			[255, 255, 255],
			false,
			0,
			0,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[-9, -2, 0, 29100, 900, 0, 0, 1, 0, 0, 0, 0, []],
				5,
				226,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					0
				]
			]
			],
			[			]
		]
,		[
			"ParallaxMeduim",
			1,
			4110609051093773,
			true,
			[255, 255, 255],
			true,
			0.699999988079071,
			0.699999988079071,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[-4, 151, 0, 29100, 710, 0, 0, 1, 0, 0, 0, 0, []],
				2,
				101,
				[
				],
				[
				],
				[
					0,
					0
				]
			]
			],
			[			]
		]
,		[
			"Platform",
			2,
			3705388756361417,
			true,
			[255, 255, 255],
			true,
			1,
			1,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[-163, 830, 0, 30, 30, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				15,
				130,
				[
					[3],
					[0],
					[0]
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[-252, 882, 0, 30, 30, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				13,
				131,
				[
					[2],
					[0],
					[0]
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[-172, 889, 0, 80, 80, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				12,
				132,
				[
					[5],
					[0],
					[0]
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[-113, 790, 0, 80, 80, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				14,
				137,
				[
					[10],
					[0],
					[0]
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[272, 719, 0, 509, 323, 0, 0, 1, 0.5009823441505432, 0.5015479922294617, 0, 0, []],
				1,
				230,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[725, 668, 0, 481, 428, 0, 0, 1, 0.5010395050048828, 0.5, 0, 0, []],
				1,
				102,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					4,
					1
				]
			]
,			[
				[2351, 461, 0, 481, 428, 0, 0, 1, 0.5010395050048828, 0.5, 0, 0, []],
				1,
				105,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					4,
					1
				]
			]
,			[
				[3074, 690, 0, 314, 302, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				1,
				106,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					3,
					1
				]
			]
,			[
				[5700, 703, 0, 481, 428, 0, 0, 1, 0.5010395050048828, 0.5, 0, 0, []],
				1,
				112,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					4,
					1
				]
			]
,			[
				[5945, 343, 0, 314, 302, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				1,
				115,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					3,
					1
				]
			]
,			[
				[6028, 783, 0, 319, 286, 0, 0, 1, 0.5015674233436585, 0.5, 0, 0, []],
				1,
				116,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					5,
					1
				]
			]
,			[
				[7691, 257, 0, 314, 302, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				1,
				117,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					3,
					1
				]
			]
,			[
				[6934, 297, 0, 111, 157, 0, 0, 1, 0.5045045018196106, 0.5031847357749939, 0, 0, []],
				1,
				118,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					8,
					1
				]
			]
,			[
				[7375, 423, 0, 481, 428, 0, 0, 1, 0.5010395050048828, 0.5, 0, 0, []],
				1,
				120,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					4,
					1
				]
			]
,			[
				[8384, 519, 0, 481, 428, 0, 0, 1, 0.5010395050048828, 0.5, 0, 0, []],
				1,
				124,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					4,
					1
				]
			]
,			[
				[3422, 280, 0, 331, 110, 0, 0, 1, 0.5015105605125427, 0.5, 0, 0, []],
				0,
				128,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					3,
					1
				]
			]
,			[
				[1189, 668, 0, 481, 428, 0, 0, 1, 0.5010395050048828, 0.5, 0, 0, []],
				1,
				26,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					4,
					1
				]
			]
,			[
				[1603, 676, 0, 439, 422, 0, 0, 1, 0.5011389255523682, 0.5, 0, 0, []],
				1,
				29,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[1936, 710, 0, 111, 157, 0, 0, 1, 0.5045045018196106, 0.5031847357749939, 0, 0, []],
				1,
				45,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					8,
					1
				]
			]
,			[
				[3916, 609, 0, 404, 115, 0, 0, 1, 0.5, 0.5043478012084961, 0, 0, []],
				0,
				81,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					5,
					1
				]
			]
,			[
				[6557, 737, 0, 385, 358, 0, 0, 1, 0.501298725605011, 0.5, 0, 0, []],
				1,
				104,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					1,
					1
				]
			]
,			[
				[11006, 568, 0, 439, 422, 0, 0, 1, 0.5011389255523682, 0.5, 0, 0, []],
				1,
				109,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[12022, 304, 0, 509, 323, 0, 0, 1, 0.5009823441505432, 0.5015479922294617, 0, 0, []],
				1,
				126,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[12669, 548, 0, 385, 358, 0, 0, 1, 0.501298725605011, 0.5, 0, 0, []],
				1,
				231,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					1,
					1
				]
			]
,			[
				[12952, 521, 0, 439, 422, 0, 0, 1, 0.5011389255523682, 0.5, 0, 0, []],
				1,
				233,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[13854, 541, 0, 385, 358, 0, 0, 1, 0.501298725605011, 0.5, 0, 0, []],
				1,
				234,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					1,
					1
				]
			]
,			[
				[14564, 452, 0, 439, 422, 0, 0, 1, 0.5011389255523682, 0.5, 0, 0, []],
				1,
				236,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[14828, 478, 0, 385, 358, 0, 0, 1, 0.501298725605011, 0.5, 0, 0, []],
				1,
				238,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					1,
					1
				]
			]
,			[
				[15538, 601, 0, 385, 358, 0, 0, 1, 0.501298725605011, 0.5, 0, 0, []],
				1,
				239,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					1,
					1
				]
			]
,			[
				[15849, 332, 0, 439, 422, 0, 0, 1, 0.5011389255523682, 0.5, 0, 0, []],
				1,
				240,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[16329, 563, 0, 439, 422, 0, 0, 1, 0.5011389255523682, 0.5, 0, 0, []],
				1,
				241,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[17024, 576, 0, 385, 358, 0, 0, 1, 0.501298725605011, 0.5, 0, 0, []],
				1,
				242,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					1,
					1
				]
			]
,			[
				[17569, 550, 0, 439, 422, 0, 0, 1, 0.5011389255523682, 0.5, 0, 0, []],
				1,
				243,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[11440, 495, 0, 200, 225, 0, 0, 1, 0.5, 0.5022222399711609, 0, 0, []],
				1,
				305,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					6,
					1
				]
			]
,			[
				[19439, 672, 0, 314, 302, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				1,
				164,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					3,
					1
				]
			]
,			[
				[20266, 646, 0, 385, 358, 0, 0, 1, 0.501298725605011, 0.5, 0, 0, []],
				1,
				206,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					1,
					1
				]
			]
,			[
				[20777, 449, 0, 354, 435, 0, 0, 1, 0.5, 0.5011494159698486, 0, 0, []],
				1,
				214,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					7,
					1
				]
			]
,			[
				[21102, 648, 0, 111, 157, 0, 0, 1, 0.5045045018196106, 0.5031847357749939, 0, 0, []],
				1,
				218,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					8,
					1
				]
			]
,			[
				[21281, 462, 0, 111, 157, 0, 0, 1, 0.5045045018196106, 0.5031847357749939, 0, 0, []],
				1,
				220,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					8,
					1
				]
			]
,			[
				[21492, 338, 0, 111, 157, 0, 0, 1, 0.5045045018196106, 0.5031847357749939, 0, 0, []],
				1,
				244,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					8,
					1
				]
			]
,			[
				[21561, 592, 0, 385, 358, 0, 0, 1, 0.501298725605011, 0.5, 0, 0, []],
				1,
				254,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					1,
					1
				]
			]
,			[
				[21842, 591, 0, 385, 358, 0, 0, 1, 0.501298725605011, 0.5, 0, 0, []],
				1,
				263,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					1,
					1
				]
			]
,			[
				[22586, 604, 0, 481, 428, 0, 0, 1, 0.5010395050048828, 0.5, 0, 0, []],
				1,
				279,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					4,
					1
				]
			]
,			[
				[23159, 526, 0, 314, 302, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				1,
				299,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					3,
					1
				]
			]
,			[
				[23721, 698, 0, 314, 302, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				1,
				314,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					3,
					1
				]
			]
,			[
				[23647, 331, 0, 314, 302, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				1,
				315,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					3,
					1
				]
			]
,			[
				[24662, 317, 0, 314, 302, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				1,
				316,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					3,
					1
				]
			]
,			[
				[24469, 698, 0, 314, 302, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				1,
				317,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					3,
					1
				]
			]
,			[
				[25158, 671, 0, 385, 358, 0, 0, 1, 0.501298725605011, 0.5, 0, 0, []],
				1,
				337,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					1,
					1
				]
			]
,			[
				[25817, 663, 0, 385, 358, 0, 0, 1, 0.501298725605011, 0.5, 0, 0, []],
				1,
				338,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					1,
					1
				]
			]
,			[
				[26288, 193, 0, 439, 422, 0, 0, 1, 0.5011389255523682, 0.5, 0, 0, []],
				1,
				339,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[26850, 601, 0, 439, 422, 0, 0, 1, 0.5011389255523682, 0.5, 0, 0, []],
				1,
				340,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[27365, 457, 0, 385, 358, 0, 0, 1, 0.501298725605011, 0.5, 0, 0, []],
				1,
				341,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					1,
					1
				]
			]
,			[
				[27647, 488, 0, 314, 302, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				1,
				342,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					3,
					1
				]
			]
,			[
				[28244, 732, 0, 509, 323, 0, 0, 1, 0.5009823441505432, 0.5015479922294617, 0, 0, []],
				1,
				344,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[4370, 762, 0, 200, 225, 0, 0, 1, 0.5, 0.5022222399711609, 0, 0, []],
				1,
				87,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					6,
					1
				]
			]
,			[
				[18185, 708, 0, 200, 225, 0, 0, 1, 0.5, 0.5022222399711609, 0, 0, []],
				1,
				198,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					6,
					1
				]
			]
,			[
				[17293, 622, 0, 319, 286, 0, 0, 1, 0.5015674233436585, 0.5, 0, 0, []],
				1,
				12,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					5,
					1
				]
			]
,			[
				[18804, 483, 0, 481, 428, 0, 0, 1, 0.5010395050048828, 0.5, 0, 0, []],
				1,
				16,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					4,
					1
				]
			]
,			[
				[19668, 178, 0, 354, 435, 0, 0, 1, 0.5, 0.5011494159698486, 0, 0, []],
				1,
				35,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					7,
					1
				]
			]
,			[
				[4724, 649, 0, 200, 225, 0, 0, 1, 0.5, 0.5022222399711609, 0, 0, []],
				1,
				110,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					6,
					1
				]
			]
,			[
				[4821, 280, 0, 404, 115, 0, 0, 1, 0.5, 0.5043478012084961, 0, 0, []],
				0,
				188,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					5,
					1
				]
			]
,			[
				[4298, 406, 0, 331, 110, 0, 0, 1, 0.5015105605125427, 0.5, 0, 0, []],
				0,
				103,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					3,
					1
				]
			]
,			[
				[5400, 277, 0, 404, 115, 0, 0, 1, 0.5, 0.5043478012084961, 0, 0, []],
				0,
				146,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					5,
					1
				]
			]
,			[
				[6307, 711, 0, 439, 422, 0, 0, 1, 0.5011389255523682, 0.5, 0, 0, []],
				1,
				1847,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					2,
					1
				]
			]
,			[
				[7956, 760, 0, 111, 73, 0, 0, 1, 0.5045045018196106, 0.5068492889404297, 0, 0, []],
				0,
				1848,
				[
				],
				[
				[
					330,
					1500,
					1500,
					650,
					0,
					1000,
					0,
					1
				],
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[22199, 286, 0, 111, 157, 0, 0, 1, 0.5045045018196106, 0.5031847357749939, 0, 0, []],
				1,
				119,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					8,
					1
				]
			]
,			[
				[28659, 216, 0, 314, 302, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				1,
				278,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					3,
					1
				]
			]
,			[
				[28918, 202, 0, 509, 323, 0, 0, 1, 0.5009823441505432, 0.5015479922294617, 0, 0, []],
				1,
				292,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[-112, 719, 0, 509, 323, 0, 0, 1, 0.5009823441505432, 0.5015479922294617, 0, 0, []],
				1,
				300,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[13166, 548, 0, 385, 358, 0, 0, 1, 0.501298725605011, 0.5, 0, 0, []],
				1,
				301,
				[
				],
				[
				[
					1
				]
				],
				[
					0,
					"Default",
					1,
					1
				]
			]
			],
			[			]
		]
,		[
			"Game",
			3,
			7720532615824107,
			true,
			[255, 255, 255],
			true,
			1,
			1,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[143, 709, 0, 60, 75, 0, 0, 1, 0.5, 0.4533333480358124, 0, 0, []],
				88,
				142,
				[
					[0],
					[0],
					[1],
					[1],
					[0],
					[0],
					[1],
					[0],
					[0],
					[0],
					[0],
					[0],
					[0],
					[1],
					[0],
					[0]
				],
				[
				[
					250,
					10000,
					10000,
					400,
					1300,
					1000,
					0,
					1
				],
				[
				]
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[153, 704, 0, 105, 85, 0, 0, 1, 0.4857142865657806, 0.4000000059604645, 0, 0, []],
				87,
				143,
				[
				],
				[
				[
				],
				[
				]
				],
				[
					0,
					"Running",
					0,
					1
				]
			]
,			[
				[598, 1080, 0, 36, 37, 0, -1.570799946784973, 1, 0.5, 0.5135135054588318, 0, 0, []],
				89,
				151,
				[
				],
				[
				[
					400,
					0,
					0,
					0,
					1,
					1
				],
				[
					1
				]
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[2988, 726, 0, 142, 75, 0, 0, 1, 0.5, 0.5066666603088379, 0, 0, []],
				90,
				157,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[1199, 732, 0, 75, 75, 0, 0, 1, 0.4608695507049561, 0.7053571343421936, 0, 0, []],
				25,
				158,
				[
					["Shield"]
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[159, 706, 0, 150, 150, 0, 0, 1, 0.4933333396911621, 0.5133333206176758, 0, 0, []],
				24,
				162,
				[
				],
				[
				[
				]
				],
				[
					1,
					"Big",
					0,
					1
				]
			]
,			[
				[6214, 245, 0, 75, 75, 0, 0, 1, 0.5199999809265137, 0.5199999809265137, 0, 0, []],
				23,
				167,
				[
					["Fire"]
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[1433, 716, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				213,
				[
					["randomGround"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[572, 717, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				212,
				[
					["Bronze"],
					[5],
					[8],
					[8]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[8553, 555, 0, 75, 75, 0, 0, 1, 0.5199999809265137, 0.5199999809265137, 0, 0, []],
				23,
				186,
				[
					["Tornado"]
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[14844, 483, 0, 75, 75, 0, 0, 1, 0.4608695507049561, 0.7053571343421936, 0, 0, []],
				25,
				246,
				[
					["Ghost"]
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[3308, 253, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				175,
				[
					["Silver"],
					[5],
					[3],
					[6]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[4626, 580, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				185,
				[
					["Gold"],
					[5],
					[3],
					[3]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[5813, 324, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				202,
				[
					["Bornze"],
					[5],
					[3],
					[6]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[2247, 517, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				181,
				[
					["Bronze"],
					[5],
					[3],
					[6]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[6209, 712, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				189,
				[
					["Gold"],
					[3],
					[5],
					[5]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[8791, 461, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				192,
				[
					["Bronze"],
					[10],
					[10],
					[10]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[9643, 505, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				194,
				[
					["Gold"],
					[5],
					[3],
					[6]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[11371, 433, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				195,
				[
					["Gold"],
					[5],
					[3],
					[3]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[11814, 310, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				196,
				[
					["Bronze"],
					[10],
					[3],
					[6]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[12534, 546, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				197,
				[
					["Bronze"],
					[7],
					[3],
					[6]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[16140, 498, 0, 20, 20, 0, 0, 1, 0.449999988079071, 0.550000011920929, 0, 0, []],
				16,
				200,
				[
					["Gold"],
					[6],
					[6],
					[6]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[5853, 691, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				203,
				[
					["shield"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[5670, 717, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				204,
				[
					["randomGround"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[12140, 258, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				215,
				[
					["groundStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[12796, 512, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				223,
				[
					["randomGround"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[15788, 321, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				224,
				[
					["groundMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[2864, 492, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				248,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[11095, 588, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				247,
				[
					["shield"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[13105, 484, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				249,
				[
					["shield"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[15638, 551, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				251,
				[
					["shield"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[17625, 534, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				252,
				[
					["shield"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[4049, 552, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				253,
				[
					["spike"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[17416, 537, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				257,
				[
					["spike"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[2206, 500, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				258,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[3641, 227, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				259,
				[
					["flyMove"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[5063, 623, 0, 32, 32, 0, 0, 1, 0.5, 0, 0, 0, []],
				49,
				260,
				[
					["flyStand"]
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				49,
	]