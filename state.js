// STATE.JS
// LICENSE: Apache 2.0
// AUTHOR: ck Lux

Raphael.fn._polygon = function(cx,cy,e,r) {

	if (e<3 || r<0 || cx<0 || cy<0) {
		return null;
	};

	var rt = this.path('M '+cx.toFixed(3)+' '+cy.toFixed(3));
	
	rt.update({cx:cx,cy:cy,r:r,edges:e});
	return rt;
};

var updatePolygon = function(cx,cy,e,r) {
	var sp = [];
	sp.push(["M", cx, cy-r]);
	var mx, my;
	for (var i=1; i<e; i++) {
		mx = cx+Math.sin(i/e*2*Math.PI)*r;
		my = cy-Math.cos(i/e*2*Math.PI)*r;
		sp.push(["L", mx.toFixed(3), my.toFixed(3)]);
	}
	sp.push(["Z"]);
	return sp;
};

Raphael.fn._star = function(cx,cy,e,r,inp) {
	if (e<3 || r<0 || inp<0 || cx<0 || cy<0)
		return null;

	var rt = this.path('M '+cx+' '+cy);
	
	rt.update({cx:cx,cy:cy,r:r,edges:e,inp:inp});
	return rt;
};

var updateStar = function(cx,cy,e,r,inp) {
	var sp = [];
	sp.push(["M", cx, cy-r]);
	e *= 2;
	for (var i=1; i<e; i++) {
		var cr = i % 2 ? r*inp : r;
		sp.push(["L", cx+Math.sin(i/e*2*Math.PI)*cr, cy-Math.cos(i/e*2*Math.PI)*cr]);
	}
	sp.push(["Z"]);
	return sp;
};

Raphael.el.update = function(e) {
	for (key in e)
		this.attrs[key] = e[key];

	var cx = this.attrs.cx,
		cy = this.attrs.cy,
		ed = this.attrs.edges,
		r  = this.attrs.r,
		inp= this.attrs.inp;

	var data;
	if (inp == undefined || inp < 0) {
		data = updatePolygon(cx,cy,ed,r);
	} else
		data = updateStar(cx,cy,ed,r,inp);

	this.attr({path: data});
	
};

var paper = Raphael("drawarea", $("#drawarea").width(), $("#drawarea").height());
$(window).resize(function(e) {
	paper.setSize($('#drawarea').width(), $('#drawarea').height());
});

// Global variables...
var current = null;
var gattrs = {
	// Global attrs for Raphael elements...
	fill: "#444",
	stroke: "#444",
	"stroke-width": 5,
	"stroke-linejoin": "round",
	"stroke-linecap": "round"
};
var selected = [];
var imgLst = [];

var finishDrawing = function(e) {
	if (current == null) {
		return;
	};
	
	var a = current.attrs;
	if (a.r || a.rx || a.ry || a.width || a.height || a.path && a.path.length > 1 || a.text) {
		//current.updateCBox();
		var bb = current.getBBox(),
			_rcx,_rcy,_scx,_scy;

		if (!a.cx || !a.cy) {
			_rcx = 0.5*(bb.x2 + bb.x);
			_rcy = 0.5*(bb.y2 + bb.y);
		} else {
			_rcx = a.cx;
			_rcy = a.cy;
		}
		
		if (!a.r) {
			_scx = bb.x;
			_scy = bb.y;
		} else {
			_scx = _rcx - a.r;
			_scy = _rcy - a.r;
		}

		ck.record(EPP(current,0));
		console.log(ck.ulst, ck.rlst);
		a.scx = _scx;
		a.scy = _scy;
		a.rcx = _rcx;
		a.rcy = _rcy;
		current = null;
		return;
	};

	current.remove();
	current = null;
};

var inStateCurve = function(e) {
	if (e.which == 3) {
		finishDrawCurve(e);
		return;
	};

	$("#drawarea").unbind();
	var ofs = $("#drawarea").offset(),
		ox = e.pageX-ofs.left,
		oy = e.pageY-ofs.top;

	if (e.which == 1) {
		current = paper.path('M '+ox+' '+oy);
		current.attr(gattrs);
		//current.attr({fill:"none"});

		var p = current.attrs.path;
		p.push(['C',ox,oy,ox,oy,ox,oy]);

		$("#drawarea").mousedown(updateStateCurve);
		$("#drawarea").mousemove(updateStateCurve1);
		$("#drawarea").mouseup(updateStateCurve2);
	};
};

var updateStateCurve = function(e) {
	c2 = true;

	if (e.which == 2) {
		finishDrawCurve(e);
		return;
	};

	var ofs = $("#drawarea").offset(),
		mx = e.pageX-ofs.left,
		my = e.pageY-ofs.top,
		p  = current.attrs.path,
		le = p.length,
		lp = p[le-1];

	lp[5] = mx;
	lp[6] = my;

	p.push(['C',lp[5],lp[6],lp[5],lp[6],lp[5],lp[6]]);
};

var c2 = false;
var updateStateCurve1 = function(e) {
	var ofs = $("#drawarea").offset(),
		mx = e.pageX-ofs.left,
		my = e.pageY-ofs.top,
		p = current.attrs.path,
		le = p.length,
		lp = p[le-1];
		sl = p[le-2];

	lp[3] = lp[5] = mx;
	lp[4] = lp[6] = my;
	
	if (c2) {
		console.log('182');		
		sl[3] = 2 * sl[5] - mx;
		sl[4] = 2 * sl[6] - my;
		lp[1] = mx;
		lp[2] = my;
	};

	current.attr({path:p});
};

var updateStateCurve2 = function(e) {
	var ofs = $("#drawarea").offset(),
		mx = e.pageX-ofs.left,
		my = e.pageY-ofs.top,
		p = current.attrs.path,
		le = p.length,
		lp = p[le-1];

	c2 = false;

	lp[1] = mx;
	lp[2] = my;

	current.attr({path:p});
};

var finishDrawCurve = function(e) {
	$("#drawarea").unbind();
	var p = current.attrs.path;
	if (p.length <= 1) {
		current.remove();
		current = null;
	}
	finishDrawing(e);
	$("#drawarea").bind('mousedown',inStateCurve);
};

var __circle = '';
var __switch_elli_mode = function(e) {
	if (e.which == 17)
		__circle = 'circle';
};

var __update_elli_mode = function(e) {
	__circle = '';
};

var inStateEllipse = function(e) {
	$("#drawarea").unbind();
	$("#drawpad").unbind();
	var ofs = $("#drawarea").offset(),
		ox = e.pageX-ofs.left,
		oy = e.pageY-ofs.top;
	current = paper.ellipse(ox,oy,0,0);
	current.attrs.x0 = ox;
	current.attrs.y0 = oy;
	current.attr({fill:gattrs['fill'], stroke:gattrs['stroke'], 'stroke-width':gattrs['stroke-width']});
	$("#drawpad").keydown(__switch_elli_mode);
	$("#drawpad").keyup(__update_elli_mode);
	$("#drawarea").mousemove(updateStateEllipse);
	$("#drawarea").mouseup(finishDrawEllipse);
};

var updateStateEllipse = function(e) {
	var ofs = $("#drawarea").offset();
	var ox = current.attrs.x0,
		oy = current.attrs.y0,
		mx = e.pageX-ofs.left,
		my = e.pageY-ofs.top;
	if (__circle == 'circle')
		current.attr({cx:(mx+ox)/2,cy:(my+oy)/2,rx:Math.max(Math.abs((mx-ox)/2),Math.abs((my-oy)/2)),ry:Math.max(Math.abs((mx-ox)/2),Math.abs((my-oy)/2))});
	else
		current.attr({cx:(mx+ox)/2, cy:(my+oy)/2, rx:Math.abs((mx-ox)/2), ry:Math.abs((my-oy)/2)});
};

var finishDrawEllipse = function(e) {
	$("#drawarea").unbind();
	if (current.attrs.rx == 0 || current.attrs.ry == 0) {
		current.remove();
		current = null;
	}

	finishDrawing(e);
	$("#drawarea").bind('mousedown',inStateEllipse);
};

var inStatePencil = function(e) {
	$("#drawarea").unbind();
	var ofs = $("#drawarea").offset(),
		ox = e.pageX-ofs.left,
		oy = e.pageY-ofs.top;
	if (e.which == 1) {
		current = paper.path('M '+ox+' '+oy);
		current.attr(gattrs);
		
	} else {
		finishDrawPencil(e);
		return;
	};
	
	$("#drawarea").mousemove(updateStatePencil);
	$("#drawarea").mouseup(finishDrawPencil);
};

var updateStatePencil = function(e) {
	var p = current.attrs.path;
	var ofs = $("#drawarea").offset(),
		mx = e.pageX-ofs.left,
		my = e.pageY-ofs.top;
	p.push(['L',mx,my]);
	current.attr({path: p});
};

var finishDrawPencil = function(e) {
	$("#drawarea").unbind();
	if (current.attrs.path.length <= 1) {
		current.remove();
		current = null;
	}

	finishDrawing(e);
	$("#drawarea").bind('mousedown',inStatePencil);
};

// USER DEFINED: POLYGON STAR
var po_edges = 3;
var change_poedges = function(e) {
	if (e.which == 189) {
		po_edges--;
		if (po_edges < 3) {
			po_edges = 3;
		}
	}
	
	if (e.which == 187) {
		po_edges++;
	};

	current.update({edges:po_edges});
};

var inStatePolygon = function(e) {
	console.log('polygon');
	$("#drawarea").unbind();
	var ofs = $("#drawarea").offset(),
		ox = e.pageX-ofs.left,
		oy = e.pageY-ofs.top;

	current = paper._polygon(ox,oy,po_edges,0);
	current.attr(gattrs);
	
	$("#drawarea").bind('mousemove',updateStatePolygon);
	$("#drawpad").bind('keydown',change_poedges);
	$("#drawarea").bind('mouseup',finishDrawPolygon);
};

var updateStatePolygon = function(e) {
	var ofs = $("#drawarea").offset(),
		ox = current.attrs.cx,
		oy = current.attrs.cy,
		mx = e.pageX-ofs.left,
		my = e.pageY-ofs.top,
		nr = Math.sqrt(Math.pow(mx-ox,2) + Math.pow(my-oy,2));

	current.update({r:nr, edges:po_edges});
};

var finishDrawPolygon = function(e) {
	$("#drawarea").unbind();
	$("#drawpad").unbind();
	$("#drawpad").unbind('keydown',change_poedges);
	delete current.attrs.edges;
	if (current.attrs.r <= 0) {
		current.remove();
		current = null;
	}

	finishDrawing(e);
	$("#drawarea").bind('mousedown',inStatePolygon);
};

var inStateRect = function(e) {
	console.log('rect');
	$("#drawarea").unbind();
	var ofs = $("#drawarea").offset();
			ox = e.pageX-ofs.left,
			oy = e.pageY-ofs.top;
	current = paper.rect(ox,oy,0,0);
	current.attr({fill:gattrs['fill'], stroke:gattrs['stroke'], 'stroke-width':gattrs['stroke-width']});
	current.attrs.x0 = ox;
	current.attrs.y0 = oy;

	$("#drawarea").bind('mousemove',updateStateRect);
	$("#drawarea").bind('mouseup',finishDrawRect);
};

var updateStateRect = function(e) {
	var ofs = $("#drawarea").offset();
	var ox = current.attrs.x0,
		oy = current.attrs.y0,
		mx = e.pageX-ofs.left,
		my = e.pageY-ofs.top;

	current.attr({x:Math.min(ox,mx), y:Math.min(oy,my), width:Math.abs(mx-ox), height:Math.abs(my-oy)});
};

var finishDrawRect = function(e) {
	$("#drawarea").unbind();
	if (current.attrs.width <= 0 && current.attrs.height <= 0) {
		current.remove();
		current = null;
	}

	current.attr({'stroke-linejoin':gattrs['stroke-linejoin'], 'stroke-linecap':gattrs['stroke-linecap']});
	finishDrawing(e);
	$("#drawarea").bind('mousedown',inStateRect);
};

/*
 * STATE SELECT
 */
var __srect = null;
var __trans = '';
var __updateSRect = function(el) {
	if (!el || el.removed) {
		if (__srect && !__srect.removed)
			__srect.remove();
		__srect = null;
		return;
	}
	
	var cb = el.getBBox();
	var sw = el.attrs["stroke-width"] / 2;
	if (!__srect)
		__srect = paper.rect(0,0,0,0).attr({stroke:"#f00"});
	
	__srect.attr({x:cb.x - sw, y:cb.y - sw, width:cb.width+2*sw, height:cb.height+2*sw});
	__srect.toFront();
};

var __hex_to_rgb = function(h) {
	var rt = [ parseInt(h[1],16)*16, parseInt(h[2],16)*16, parseInt(h[3],16)*16 ];
	return rt;
};

var __updateUI = function(attrs) {
	update_current = false;
	if (attrs.fill && attrs.fill != "none") {
		var rf = __hex_to_rgb(attrs.fill);
		__toggle_fill(true);

		$("#fill-color-r").slider("value", rf[0]);
		$("#fill-color-g").slider("value", rf[1]);
		$("#fill-color-b").slider("value", rf[2]);
	} else
		__toggle_fill(false);

	var rl = __hex_to_rgb(attrs.stroke);
	var w = attrs["stroke-width"];
	$("#stroke-width").slider("value", w);
	$("#stroke-color-r").slider("value", rl[0]);
	$("#stroke-color-g").slider("value", rl[1]);
	$("#stroke-color-b").slider("value", rl[2]);

	var lj = attrs["stroke-linejoin"],
		lc = attrs["stroke-linecap"];

	$('#line-join-'+lj).prop('checked', true).button('refresh');
	$('#line-cap-'+lc).prop('checked',true).button('refresh');

	if (current)
		update_current = true;
};

// This is for Setting Panel
var update_current = false;
var __setCurrent = function(e) {
	var ofs = $("#drawarea").offset(),
		ox = e.pageX-ofs.left,
		oy = e.pageY-ofs.top;
	current = paper.getElementByPoint(e.pageX,e.pageY);
	console.log(current,e.pageX,e.pageY);

	if (current) {
		__updateSRect(current);
		__updateUI(current.attrs);
	} else {
		if(__srect) {
			__srect.remove();
			__srect = null;
		}
		//update_current = false;
		__updateUI(gattrs);
	}
};

var __setTransform = function(e) {
	if (!current || current.removed)
		return;

	$("#drawpad").unbind();
	$("#drawarea").unbind();

	switch (e.which) {
	case 8:		//[backspace] -> delete
	case 46:	//[del] -> delete
	case 68:	//delete 'd'
		if (__trans == '') __trans = 'd';
		current.hide();
		__updateSRect(current);
		__endTransform();
		break;
	case 71:
		if (__trans == '') __trans = 'g';
	case 83:	//scale 's'
		if (__trans == '') __trans = 's';
	case 82:	//rotate 'r'
		if (__trans == '') __trans = 'r';
		$("#drawarea").bind('mousemove',__doTransform);
		$("#drawarea").bind('mousedown',__endTransform);
		break;
	default:
		inStateSelect(e);
		break;
	}
};

var _tr = undefined;
var _px = _py = undefined;
var _tx = _ty = 0,_sx = _sy = 1,_rd = 0;
var _spdx,_spdy,_scx,_scy,_rcx,_rcy,_rsd;
var __doTransform = function(e) {
	this.__current_rd = function(x,y) {
		var _x = mx - _rcx, _y = my - _rcy,
			_r = Math.sqrt(Math.pow(_x,2) + Math.pow(_y,2));
		
		var rd = Math.acos(_x / _r);
		
		if (_y < 0) rd = -rd;
		
		return rd;
	};

	if (current == null)
		return;

	var ofs = $("#drawarea").offset(),
		mx = e.pageX-ofs.left,
		my = e.pageY-ofs.top,
		c = current,
		a = c.attrs;

	if (_tr == undefined) {
		_tr = c.matrix.toTransformString();
		_scx = a.scx;
		_scy = a.scy;
		_rcx = a.rcx;
		_rcy = a.rcy;
		if (__trans == 's') {
			_spdx = Math.abs(_rcx - _scx) * 2;
			_spdy = Math.abs(_rcy - _scy) * 2;
		} else if (__trans == 'r')
			_rsd = this.__current_rd((mx - _rcx), (my - _rcy));
	}

	if (Math.abs(mx - _px) < 1 && Math.abs(my - _py) < 1)
		return;

	switch (__trans) {
	case 'g':
		if (!_px || !_py)
			break;

		_tx += mx - _px;
		_ty += my - _py;

		current.transform('');
		current.transform(_tr);
		current.transform('t'+_tx+','+_ty+'...');
		a.scx = _scx + _tx;
		a.scy = _scy + _ty;
		a.rcx = _rcx + _tx;
		a.rcy = _rcy + _ty;
		break;
	case 's':
		_sx = (mx - _scx) / _spdx;
		_sy = (my - _scy) / _spdy;

		if (_sx == 0) _sx = 0.1;
		if (_sy == 0) _sy = 0.1;

		a.rcx = _scx + (_rcx - _scx) * _sx;
		a.rcy = _scy + (_rcy - _scy) * _sy;

		current.transform('');
		current.transform(_tr);
		current.transform('s'+_sx+','+_sy+','+_scx+','+_scy+'...');
		break;
	case 'r':
		_rd = this.__current_rd((mx - _rcx), (my - _rcy));
		_rd -= _rsd;
		_rd *= 180 / Math.PI;
		_rd.toFixed(0);

		current.transform('');
		current.transform(_tr);
		current.transform('r'+_rd+','+_rcx+','+_rcy+'...');
		var bb = current.getBBox();
		a.scx = bb.x;
		a.scy = bb.y;
		break;
	}

	__updateSRect(current);

	_px = mx;
	_py = my;
};

var __endTransform = function(e) {
	var c = current,
		a = c.attrs;
	
	var oe = {_tr:_tr,scx:_scx,scy:_scy,rcx:_rcx,rcy:_rcy},
		ce = {_tr:c.matrix.toTransformString(),scx:a.scx,scy:a.scy,rcx:a.rcx,rcy:a.rcy};
	console.log(ce,oe);
	if (__trans == 'g' || __trans == 'r' || __trans == 's')
		ck.record(ETP(current,0,[ce, oe]));
	else if (__trans == 'd') {
		var cmd = EPP(current,1);
		ck.record(cmd);
	}

	if (a.rcx < a.scx) a.scx = 2 * a.rcx - a.scx;
	if (a.rcy < a.scy) a.scy = 2 * a.rcx - a.scy;

	console.log(ck.ulst, ck.rlst);

	__trans = '';
	_tr = undefined;
	_px = _py = undefined;
	_tx = _ty = 0,_sx = _sy = 1,_rd = 0;
	inStateSelect(e);
};

var inStateSelect = function(e) {
	console.log('state-select');
	$("#drawarea").unbind();
	$("#drawarea").bind('mousedown',__setCurrent);
	$("#drawpad").bind('keydown',__setTransform);
};

////
var s_edges = 3;
var s_inp = 0.4;
var change_star_settings = function(e) {

	if (e.which == 189) {	//-
		if (s_edges > 3) {
			s_edges--;
		};
	};
	
	if (e.which == 187) {	//+
		s_edges++;
	};
	
	if (e.which == 37) {	//left arrow
		s_inp -= 0.01;
		
		if (s_inp < 0)
			s_inp = 0;
	};

	if (e.which == 39) {	//right arrow
		s_inp += 0.01;

		if (s_inp < 0)
			s_inp = 0;
	};
	
	current.update({inp:s_inp, edges:s_edges});
};

var inStateStar = function(e) {
	console.log('state-star');
	$("#drawarea").unbind();
	$("#drawpad").unbind();
	var ofs = $("#drawarea").offset(),
		ox = e.pageX-ofs.left,
		oy = e.pageY-ofs.top;

	current = paper._star(ox,oy,s_edges,0,s_inp);
	current.attr(gattrs);

	$("#drawarea").bind('mousemove',updateStateStar);
	$("#drawpad").bind('keydown',change_star_settings);
	$("#drawarea").bind('mouseup',finishDrawStar);
};

var updateStateStar = function(e) {
	var ofs = $("#drawarea").offset(),
		ox = current.attrs.cx,
		oy = current.attrs.cy,
		mx = e.pageX-ofs.left,
		my = e.pageY-ofs.top,
		nr = Math.sqrt(Math.pow(mx-ox,2) + Math.pow(my-oy,2));
	
	current.update({r:nr, inp:s_inp, edges:s_edges});
};

var finishDrawStar = function(e) {
	$("#drawarea").unbind();
	$("#drawpad").unbind('keydown',change_star_settings);
	delete current.attrs.edges;
	delete current.attrs.inp;
	if (current.attrs.r <= 0) {
		current.remove();
		current = null;
	}
	finishDrawing(e);
	$("#drawarea").bind('mousedown',inStateStar);
};

var inStateText = function(e) {
	if (e.which != 1)
		return;

	var ofs = $("#drawarea").offset(),
		ox = e.pageX-ofs.left,
		oy = e.pageY-ofs.top;

	current = paper.text(ox,oy,"");
	current.attr(gattrs);
	$("#tdata").value = "";
	$("#dialog-get-text").dialog("open");
};

// UI...
$("#dialog-get-text").dialog({
	autoOpen: false,
	height: 220,
	width: 280,
	modal: true,
	buttons: {
		"Ok": function() {
			current.attr({text:tdata.value});
			tdata.value = "";
			finishDrawing();
			$(this).dialog("close");
			$("#drawarea").mousedown(inStateText);
		},
		"Cancel": function() {
			$(this).dialog("close");
		}
	}
});

$("#topbar").buttonset();

var __rgb_to_hex = function(r,g,b) {
	var hx = [r.toString(16), g.toString(16), b.toString(16)];
	var rt = "#" + hx[0][0] + hx[1][0] +hx[2][0];
	return rt;
};

var _cpf;
var updateFillColor = function() {
	var attrs = undefined;

	var r = $("#fill-color-r").slider("value");
	var g = $("#fill-color-g").slider("value");
	var b = $("#fill-color-b").slider("value");

	if (!current) {
		attrs = gattrs;
		attrs.fill = __rgb_to_hex(r,g,b);
	} else {
		if (!_cpf)
			_cpf = current.attrs.fill;

		if(update_current) {
			var nfc = __rgb_to_hex(r,g,b);	
			current.attr({fill: nfc});
		}
	}
};

var __turn_off_fill = function() {
	var attrs = undefined;

	if (!current)
		gattrs.fill = "none";
	else {
		if (!_cpf)
			_cpf = current.attrs.fill;
		current.attr({fill: "none"});
	}
};

var __toggle_fill = function(fill) {
	if (fill) {
		if (!$("#toggle-fill").prop('checked'))
			$("#toggle-fill").prop('checked',true).button('refresh');

		$("#toggle-fill").button("option", "label", "Fill: On");
		$("#fill-color-r").slider("enable");
		$("#fill-color-g").slider("enable");
		$("#fill-color-b").slider("enable");
		updateFillColor();
	} else {
		if ($("#toggle-fill").prop('checked'))
			$("#toggle-fill").prop('checked',false).button('refresh');

		$("#toggle-fill").button("option", "label", "Fill: Off");
		$("#fill-color-r").slider("disable");
		$("#fill-color-g").slider("disable");
		$("#fill-color-b").slider("disable");
		__turn_off_fill();
	}
}

$("#toggle-fill").button({label: "Fill: On"});
$("#toggle-fill").click(function(e) {
		if (this.checked) {
			__toggle_fill(true);
		} else {
			__toggle_fill(false);
		}

		if (!current)
			return;

		var fc = current.attrs.fill;
		ck.record(EAP(current,0,[{fill: fc}, {fill: _cpf}]));
		_cpf = undefined;
});

var _cps,_cpsw;
var updateStrokeSettings = function() {
	var attrs = undefined;

	var r = $("#stroke-color-r").slider("value");
	var g = $("#stroke-color-g").slider("value");
	var b = $("#stroke-color-b").slider("value");
	var w = $("#stroke-width").slider("value");

	if (!current) {
		attrs = gattrs;
		attrs.stroke = __rgb_to_hex(r,g,b);
		attrs["stroke-width"] = w;
	} else if (update_current) {
		if (!_cps) {
			_cps = current.attrs.stroke;
			_cpsw= current.attrs['stroke-width'];
		}
		current.attr({stroke: __rgb_to_hex(r,g,b), "stroke-width":w});
	}
};

$("#stroke-width").slider({
	orientation: "horizontal",
	range: "min",
	min: 3,
	max: 20,
	value: 5
});

$("#stroke-color-r, #stroke-color-g, #stroke-color-b, #fill-color-r, #fill-color-g, #fill-color-b").slider({
	orientation: "horizontal",
	range: "min",
	min: 20,
	max: 250,
	value: 64,
});
$("#stroke-color-r, #stroke-color-g, #stroke-color-b, #stroke-width").on("slidechange",function(e) {
	if (current != null && update_current) {
		updateStrokeSettings();
		var a = current.attrs;
		ck.record(EAP(current,0,[{stroke:a.stroke, 'stroke-width':a['stroke-width']}, {stroke:_cps, 'stroke-width':_cpsw}]));
		_cps = _cpsw = undefined;
	} else
		updateStrokeSettings();
});
$("#stroke-color-r, #stroke-color-g, #stroke-color-b, #stroke-width").on("slide",updateStrokeSettings);

$("#fill-color-r, #fill-color-g, #fill-color-b").on("slidechange",function(e) {
	if (current != null && update_current) {
		updateFillColor();
		var fc = current.attrs.fill;
		ck.record(EAP(current,0,[{fill: fc}, {fill: _cpf}]));
	} else
		updateFillColor();
	
	_cpf = undefined;
});
$("#fill-color-r, #fill-color-g, #fill-color-b").on("slide",updateFillColor);

$("#toolbox").buttonset();
$("#select").click(function(e) {
	current = null;
	__toggle_fill(true);
	__updateSRect();
	$("#drawarea").unbind();inStateSelect(e);
});
$("#pencil").click(function(e) {
	current = null;
	__toggle_fill(false);
	__updateSRect();
	$("#drawarea").unbind();$("#drawarea").mousedown(inStatePencil);
});
$("#curve").click(function(e) {
	current = null;
	__toggle_fill(false);
	__updateSRect();
	$("#drawarea").unbind();$("#drawarea").mousedown(inStateCurve);
});
$("#rect").click(function(e) {
	current = null;
	__toggle_fill(true);
	__updateSRect();
	$("#drawarea").unbind();$("#drawarea").mousedown(inStateRect);
});
$("#ellipse").click(function(e) {
	current = null;
	__toggle_fill(true);
	__updateSRect();
	$("#drawarea").unbind();$("#drawarea").mousedown(inStateEllipse);
});
$("#polygon").click(function(e) {
	current = null;
	__toggle_fill(true);
	__updateSRect();
	$("#drawarea").unbind();$("#drawarea").mousedown(inStatePolygon);
});
$("#star").click(function(e) {
	current = null;
	__toggle_fill(true);
	__updateSRect();
	$("#drawarea").unbind();$("#drawarea").mousedown(inStateStar);
});
$("#text").click(function(e) {
	current = null;
	__toggle_fill(true);
	__updateSRect();
	$("#drawarea").unbind();$("#drawarea").mousedown(inStateText);
});
//$("#fill").click(__drawareaInState(inStateFill));

var updateLineSettings = function(attrs) {
	if (!current) {
		for (key in attrs)
			gattrs[key] = attrs[key];
	} else if (update_current) {
		var lj = current.attrs['stroke-linejoin'],
			lc = current.attrs['stroke-linecap'];
		current.attr(attrs);
		var a = current.attrs;
		ck.record(EAP(current,0,[{'stroke-linejoin':a['stroke-linejoin'],'stroke-linecap':a['stroke-linecap']},{'stroke-linejoin':lj,'stroke-linecap':lc}]));
	}
};

$("#line-join-st").buttonset();
$('#line-join-bevel').click(function(e) {
	updateLineSettings({"stroke-linejoin": "bevel"});
});
$('#line-join-round').click(function(e) {
	updateLineSettings({"stroke-linejoin": "round"});
});
$('#line-join-miter').click(function(e) {
	updateLineSettings({"stroke-linejoin": "miter"});
});

$("#line-cap-st").buttonset();
$('#line-cap-butt').click(function(e) {
	console.log('line cap: butt');
	updateLineSettings({"stroke-linecap": "butt"});
});
$('#line-cap-square').click(function(e) {
	console.log('line cap: square');
	updateLineSettings({"stroke-linecap": "square"});
});
$('#line-cap-round').click(function(e) {
	console.log('line cap: round');
	updateLineSettings({"stroke-linecap": "round"});
});

// File System Access...
var file_entry = null;

$("#bt_new").click(function(e) {

	var blob = new Blob([paper.toSVG()],{type: 'image/svg+xml'});

	if (!file_entry)
		__svgFileSaveAs(blob);
	else
		__svgFileSave(blob, file_entry);
	file_entry = null;
	paper.clear();
});

$("#bt_open").click(function(e) {
	accept_files = [{
		description: "*.svg",
		mimeTypes: ["image/svg+xml"],
		extensions: ["svg"]
	}];

	chrome.fileSystem.chooseEntry({type:"openWritableFile", accepts:accept_files}, function(entry) {
		if (!entry)
			return;
		
		entry.file(function(file) {
			var reader = new FileReader();
			reader.onerror = function(e) {
				console.error(e);
			};
			reader.onloadend = function(e) {
				var svg = $(e.target.result)[0];
				console.log(svg);
				paper.clear();
				paper.importSVG(svg);
				file_entry = entry;
			}
		
			reader.readAsText(file);
		});
	});
});

var __entry_write = function(entry, blob) {
	entry.createWriter(function(writer) {
		writer.onerror = function(e) {
			console.error(e);
		};
		writer.onwriteend = function(e) {
			console.log('write complete.');
		};
		writer.write(blob);
	});
};

var __svgFileSaveAs = function(blob) {
	if (!blob)
		return;

	chrome.fileSystem.chooseEntry({type:"saveFile", suggestedName: "out.svg"}, function(entry) {
		if (!entry)
			return;

		__svgFileSave(blob, entry);
		file_entry = entry;
	});
};

var __svgFileSave = function(blob, entry) {
	if (!entry || !blob)
		return;

		entry.remove(function(){},function(){});
		chrome.fileSystem.getWritableEntry(entry, function(en) {
			__entry_write(entry, blob);
		});
};

$("#bt_save").click(function(e) {
	if (__srect) {
		__srect.remove();
		__srect = null;
	}
	
	var blob = new Blob([paper.toSVG()],{type: 'image/svg+xml'});

	if (!file_entry)
		__svgFileSaveAs(blob);
	else
		__svgFileSave(blob, file_entry);
});

$("#bt_save_as").click(function(e) {
	if (__srect) {
		__srect.remove();
		__srect = null;
	}

	var blob = new Blob([paper.toSVG()],{type: 'image/svg+xml'});
	__svgFileSaveAs(blob);
});

chrome.app.window.onMaximized.addListener(function() {
	console.log('aaa');
});

// Undo/Redo...
var CCP = function(pair,obj,f,arg) {
	this.flag = f;
	this.pair = pair;	//	[function1, function2]
	this.object = obj;
	this.arg = arg;
	this.do_next_action = function() {
		if (this.flag == 0) {
			this.flag = 1;
			this.pair[1](this.object,this.arg);
		} else {
			this.flag = 0;
			this.pair[0](this.object,this.arg);
		}
		
		current = this.object;
		if (current.rm)
			current = null;
		else
			__updateUI(current.attrs);
		__updateSRect(current);
	};
	return this;
}

// element attr: fill stroke line-width linejoin linecap
var EAP = function(obj, f, attrs) {
	return new CCP([element_attr1, element_attr2], obj, f, attrs);
};

// element produce: create / delete
var EPP = function(obj, f) {
	return new CCP([element_show, element_hide], obj, f);
};

// element transform
var ETP = function(obj, f, arg) {
	return new CCP([element_trans1, element_trans2], obj, f, arg);
};

// attrs command
var element_attr1 = function(el, attrs) {
	__update_current = false;
	el.attr(attrs[0]);
};

var element_attr2 = function(el, attrs) {
	update_current = false;
	el.attr(attrs[1]);
};

// create/delete element command pair
var element_show = function(el) {
	el.rm = false;
	el.show();
}
var element_hide = function(el) {
	el.rm = true;
	el.hide();
}

/* transform element commands */
var element_trans1 = function(el, arg) {
	var a = el.attrs, o = arg[0];
	a.scx = o.scx;
	a.scy = o.scy;
	a.rcx = o.rcx;
	a.rcy = o.rcy;
	el.transform('');
	el.transform(o._tr);
}
var element_trans2 = function(el, arg) {
	var a = el.attrs, o = arg[1];
	a.scx = o.scx;
	a.scy = o.scy;
	a.rcx = o.rcx;
	a.rcy = o.rcy;
	el.transform('');
	el.transform(o._tr);
}

var CM = function() {
	this.ulst = new Array();
	this.rlst = new Array();
	return this;
};

CM.prototype.undo = function() {
	if (this.ulst.length == 0)
		return;

	current = null;
	var cp = this.ulst.pop();
	//console.log(cp.object);
	cp.do_next_action();
	if (__srect && !__srect.removed)
		__updateSRect(cp.object);
	this.rlst.push(cp);
};

CM.prototype.redo = function() {
	if (this.rlst.length == 0)
		return;
	
	current = null;
	var cp = this.rlst.pop();
	//console.log(cp.object);
	cp.do_next_action();
	if (__srect && !__srect.removed)
		__updateSRect(cp.object);
	this.ulst.push(cp);
};

CM.prototype.record = function(cmd) {
	this.ulst.push(cmd);
	console.log(this.ulst);
	delete this.rlst;
	this.rlst = new Array();
};

var ck = new CM();

$("#bt_undo").click(function(e) {
	ck.undo();
	console.log(ck.ulst, ck.rlst);
});

$("#bt_redo").click(function(e) {
	ck.redo();
	console.log(ck.ulst, ck.rlst);
});
