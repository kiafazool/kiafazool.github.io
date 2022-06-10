$.math = $.math || {};

// Plot options structure
//	xaxis
//		min
//		max
//		label
//		color
//	yaxis
//		min
//		max
//		label
//		color
//	series[]
//		label
//		color
//		width
//		style : "solid" (default), "dash", pattern "width, spacing, wdith, spacing,..."
//		show : false or true (default)
//	legend
//		show : default=false
//	title
//		label: string
//		show: boolean (default: true)
//	click: callback function(x,y)
//	error: callback function(error)
//	plotted: callback function(plot object)
//	onseries: callback function(i, [xp,yp], [xs,ys]) when mouse moves over series 'i' in position '(xp,yp)' of the plot and '(xs,ys)' of the svg
//	offseries: callback function(i) when mouse moves out of series 'i'
//	grid
//		show: true, false (default)

// Plot structure
//	settings: setting used for plot (equal to options structure)
//	plot: reference to svg elements
//	svg: reference to svg element

drag = function () {
	return d3.behavior.drag()
	.origin(function() { 
		var t = d3.select(this);
		return {x: t.attr("x") + d3.transform(t.attr("transform")).translate[0],
		        y: t.attr("y") + d3.transform(t.attr("transform")).translate[1]};
	})
	.on("drag", function(d,i) {
		d3.select(this).attr("transform", function(d,i){
		    return "translate(" + [ d3.event.x,d3.event.y ] + ")"
		})
	});
}

$.math.plot = $.math.plot || function () {
	this.callbacks = {};
	this.settings = {
			colormap: 'heat',
			plot: {},
			xaxis: {
				padding:30
			},
			yaxis: {
				padding:20
			},
			title: {},
			legend: {}
	};	
}
$.math.plot.prototype = (function () {
// Private methods and variables here

// Public methods here
return {
	click:	function(callback) {
		this.callbacks.click = callback;
		return this;
	},
	plotted: function(callback) {
		this.callbacks.plotted = callback;
		return this;
	},
	onseries: function(callback) {
		this.callbacks.onseries = callback;
		return this;
	},
	offseries: function(callback) {
		this.callbacks.offseries = callback;
		return this;
	},
	error:	function(callback) {
		this.callbacks.error = callback;
		return this;
	},
	data:	function (d) {
		this._data = d;
		return this;
	},
	style: function (opt) {
		jQuery.extend(true, this.settings, opt); // change settings with options
		// copy series (extend may keep old series in settings)
		this.settings.series = opt.series;
		return this;
	},	
}
})();

$.math.plot.prototype.drawaxis = function(settings) {
	function setaxisticksproperties(axis) {
		axis.attr("fill", "none")
		.attr("shape-rendering", "crispEdges")
		.attr("stroke", "gray")
		.selectAll("text")
			.attr('fill', 'gray')
			.attr('stroke', 'none')
			.attr('font-size', '11px');
	}

	if (settings.xaxis.show || settings.xaxis.show == undefined) {
		var xaxis = d3.svg.axis().scale(this.plot.xscale).orient('bottom');
		this.plot.xaxis.ticks = (this.plot.xaxis.ticks || this.svg.append("g")			
			.attr("transform", "translate(0, " + (this.plot.height - settings.yaxis.padding) + ")"))
			.call(xaxis);
		setaxisticksproperties(this.plot.xaxis.ticks);
	}

	if (settings.yaxis.show || settings.yaxis.show == undefined) {
		var yaxis = d3.svg.axis().scale(this.plot.yscale).orient('left');
		this.plot.yaxis.ticks = (this.plot.yaxis.ticks || this.svg.append("g")
			.attr("transform", "translate(" + (settings.xaxis.padding) + ",0)"))
			.call(yaxis);
		setaxisticksproperties(this.plot.yaxis.ticks);	
	}
}
$.math.plot.prototype.xlabel = function(label) {

	this.plot.xaxis.label = ( this.plot.xaxis.label || this.svg.append("text")
		.attr("text-anchor", "end")
		.attr("x", this.plot.width - this.settings.xaxis.padding)
		.attr("y", this.plot.height - this.settings.yaxis.padding - 6))
		.attr('fill', 'gray')
		.attr('font-size', 'small')
		.text(label);
	return this;
}
$.math.plot.prototype.ylabel = function(label) {
	this.plot.yaxis.label = ( this.plot.yaxis.label || this.svg.append("text")
		.attr("text-anchor", "end")
		.attr("x", -this.settings.yaxis.padding)
		.attr("y", this.settings.xaxis.padding + 6)
		.attr("dy", ".75em")
		.attr('fill', 'gray')
		.attr('font-size', 'small')
		.attr("transform", "rotate(-90)"))
		.text(label);
	return this;
}
$.math.plot.prototype.title = function(title) {
	this.plot.title.label = ( this.plot.title.label || this.svg.append("text")
		.attr("text-anchor", "middle")
		.attr("x", this.plot.width/2)
		.attr("y", 15))
		.text(title);
	return this;
}

$.math.plot.prototype.legend = function(settings) {
	var x = this.plot.width - 120, y = 20;
	if (this.plot.legend) {
		var node = this.plot.legend.node();
		var bbox = node.getBBox();
		var matrix = node.getTransformToElement(node.nearestViewportElement);
		var p = node.nearestViewportElement.createSVGPoint();
		var sp = p.matrixTransform(matrix);
		x = sp.x;
		y = sp.y;
		this.plot.legend.remove();
		delete this.plot.legend;
	}

	if (settings.legend.show) {		
		this.plot.legend = this.svg.append("g")
			.attr('transform', 'translate(' + [x , y] +  ')')
			.call(drag);
		var s = settings.series;
		//alert(s.length);
		var textwidth = 0;
		var boundingRect = this.plot.legend.append('rect')
			.attr('x', 0)
			.attr('y', 0)
			.attr('fill', 'white')
			.attr('stroke', 'none')
			.attr('opacity', 0.6);

		for (var i=0; i < s.length; i++) {
			this.plot.legend.append('line')
				.attr('x1', 10)
				.attr('y1', i*20 + 10)
				.attr('x2', 40)
				.attr('y2', i*20 + 10)
				.attr('stroke', s[i].color)
				.attr('stroke-width', s[i].width)
				.attr("stroke-dasharray",
					s[i].style == "solid" ? "" :
					s[i].style == "dash" ? "10,10":
					s[i].style
				);
			this.plot.legend.append('text')
				.attr('x', 50)
				.attr('y', i*20 + 15)
				.attr('font-size', 'small')
				.text(s[i].label)
				.each( function () { textwidth = Math.max(textwidth, this.getBBox().width) });
		}

		boundingRect.attr('height', s.length*20)
			.attr('width', 60 + textwidth);
	}
	return this;
}


$.math.plot.prototype.line = function(p) {
	var plot = this.plot;

	if (plot.xscale && plot.yscale) {
		var lineFunction = d3.svg.line()
                   .x(function(d) { return plot.xscale(d[0]); })
                   .y(function(d) { return plot.yscale(d[1]); });

		return this.svg.append("path")
			.attr("d", lineFunction(p))
			.attr("stroke", 'black')
			.attr("stroke-width", 1)
			.attr("fill", "none");
	}
}

$.math.plot.prototype.circles = function(p) {
	var plot = this.plot;
	if (plot.xscale && plot.yscale) {
		return this.svg.selectAll("circle")
			.data(p)
 			.enter()
			.append("circle")
   			//.attr("class", (d, i) -> if d == max then 'point max' else 'point')
   			.attr("cx", function (d) { return plot.xscale(d[0]); })
   			.attr("cy", function (d) { return plot.yscale(d[1]); })
   			.attr("r", 2)
			.attr("stroke", 'black')
			.attr("fill", "white");
	}
}
$.math.plot.prototype.initplot = function(sel) {
	var $sel = $(sel);
	w = $sel.width();
	h = $sel.height();
	this.container = sel;
	this.plot = {width: w, height: h, xaxis: {}, yaxis: {}, title: {}};
	$sel.html('');
	this.svg = d3.select(sel).append("svg")
				.attr("width", w)
				.attr("height", h);
	var settings = this.settings;
	var clip = this.svg.append("defs").append("svg:clipPath")
        .attr("id", "clip")
        .append("svg:rect")
        .attr("id", "clip-rect")
        .attr("x", settings.xaxis.padding)
        .attr("y", 0)
        .attr("width", w - settings.xaxis.padding)
        .attr("height", h - settings.yaxis.padding);

	this.click(settings.click);
	this.plotted(settings.plotted);
	this.onseries(settings.onseries);
	this.offseries(settings.offseries);
	this.error(settings.error);
	return this;
}

// Line plot
/////////////////////////////////////////////
$.math.lineplot = $.math.lineplot || function () {
	// need to replicate initialization here to create new references for local variables
	this.callbacks = {};
	this.settings = {
			colormap: 'heat',
			plot: {},
			xaxis: {
				padding:30
			},
			yaxis: {
				padding:20
			},
			title: {},
			legend: {}
	};
}
$.math.lineplot.prototype = new $.math.plot();

$.math.lineplot.prototype.plot = function(sel, options) {
	// Extend default setting
	jQuery.extend(true, this.settings, options); // change settings with options
	var settings = this.settings;
	this.initplot(sel);

	// Update SVG
	var svg = this.svg;
	svg.data([this]);

	// Build axis
	this.plot.yscale = d3.scale.linear()
				.domain([settings.yaxis.min, settings.yaxis.max])
				.range([h - settings.yaxis.padding, settings.yaxis.padding]);
	var yscale = this.plot.yscale;
	this.plot.xscale = d3.scale.linear()
				.domain([settings.xaxis.min, settings.xaxis.max])
				.range([settings.xaxis.padding, w - settings.xaxis.padding]);
	var xscale = this.plot.xscale;	
	this.drawaxis(settings);

	// Build line function
	var line = d3.svg.line()
                   .x(function(d) { return xscale(d[0]);} )
                   .y(function(d) { return yscale(d[1]);} )
                   .interpolate("basis");

	// Draw series lines
	this.plot.series = new Array(this._data.length);

	
	var that = this;
	for (j = 0; j < this._data.length; j++) {
		this.plot.series[j] = svg.append("path")
			.attr('clip-path', 'url(#clip)')
                	.attr("d", line(this._data[j]))                            
                	.attr("stroke-width", 2)
                	.attr("fill", 'none')
			.attr("stroke", '#ff0000');
		svg.append("path")
			.attr('clip-path', 'url(#clip)')
                	.attr("d", line(this._data[j]))                            
                	.attr("stroke-width", 10)
			.attr('opacity', 0.0)
			.attr('fill', 'none')
			.attr("stroke", '#ff0000')
			.on("mousemove", function () {
				if (that.callbacks.onseries) {
					var m = d3.mouse(this);
					xp = [xscale.invert(m[0]), yscale.invert(m[1])];
					that.callbacks.onseries.call(that, j, xp, m);		
				}
			})
			.on("mouseout", function() { if (that.callbacks.offseries) that.callbacks.offseries.call(that, j); } );
        }
	// Add labels
	this.xlabel(settings.xaxis.label);
	this.ylabel(settings.yaxis.label);
	// Add title
	this.title(settings.title.label);
	// Add legend
	this.legend(settings);
	return this;
}

$.math.lineplot.prototype.replot = function() {
	var opt = this.settings;
	var xscale = this.plot.xscale.domain([opt.xaxis.min, opt.xaxis.max]);
	var yscale = this.plot.yscale.domain([opt.yaxis.min, opt.yaxis.max]);

	this.drawaxis(opt);

	// Build line function
	var line = d3.svg.line()
                   .x(function(d) { return xscale(d[0]);} )
                   .y(function(d) { return yscale(d[1]);} )
                   .interpolate("basis");

	var ps = this.plot.series;	
	// Update or add series
	for (var i = 0; i < this._data.length; i++) {
		var os = opt.series[i];

		var temp = (ps.length > i ?
				ps[i].transition() :	// return transition
				this.svg.append("path").attr('clip-path', 'url(#clip)')	//return path
				.attr("fill", 'none')
			)	// following methods apply to both classes
			.attr('d', line(this._data[i]))
			.attr("stroke", os.color || '#ff0000')
			.attr("stroke-width", parseFloat(os.width) || 2)
			.attr("stroke-dasharray", 
					os.style == "solid" ? "" :
					os.style == "dash" ? "10,10":
					os.style || ""
			);
		if (ps.length <=i ) ps[i] = temp;
	}
	// Remove extra series
	for (var i = ps.length - 1; i >= this._data.length ; i--) {
		ps[i].remove(); //remove svg object
		ps.splice(i,1);
	}
	
	// Refresh labels
	this.xlabel(opt.xaxis.label);
	this.ylabel(opt.yaxis.label);
	// Refresh title
	this.title(opt.title.label);
	// Refresh legend
	this.legend(opt);
	return this;
}

// Countour plot
/////////////////////////////////////////////
$.math.contour = $.math.contour || function () {/*$.math.plot.call(this);*/}
$.math.contour.prototype = new $.math.plot();

$.math.contour.prototype.color = function(c, settings) {
	switch (settings.colormap) {
		case 'heat':
			color = [0,0,0];
			d = settings.max - settings.min;
			if (c < d/2)			
				colormap = [[0,0, 255],[0,255,0]];	// from blue to green
			else
				colormap = [[0,255,0],[255,0,0]];
			for (var k = 3; k--;) { color[k] = Math.round((colormap[0][k]*(settings.max-c) + colormap[1][k]*(c - settings.min))/d); }
			return color;
			break;

		case 'basic':
			return [255,255,255];
	}
}

$.math.contour.prototype.plot = function(sel, options) {
	//	     [0 ,   1,    2,        3,      4,   5,    6,     7,       8,      9,  10    11      12      13     14     15] x,y
	var start = [[], [0,0.5],[1,0.5],[0,0.5],[0.5,0],[],[0.5,0],[0.5,0],[0.5,0],[0.5,0],[],[0.5,0],[0,0.5],[1,0.5],[0,0.5], []];
	var end   = [[], [0.5,1],[0.5,1],[1,0.5],[1,0.5],[],[0.5,1],[0,0.5],[0,0.5],[0.5,1],[],[1,0.5],[1,0.5],[0.5,1],[0.5,1], []];
	//          x x    x x     x x     x_x     x\x  x/x   x|x     x/x     x/x     x|x   x\x  x\x     x_x     x x     x x    x x
	//          x x    x\x     x/x     x x     x x  x/x   x|x     x x     x x     x|x   x\x  x x     x x     x/x     x\x    x x
	// start always connects to left and up
	// end always connects to right and down
	function getpaths(data, lvl) {
		var c = data.gt(lvl).get();
		var d = data.get();
		var p = [];
		var dim = data.size();
		var pfirst = [0,0];
		var plast = [0,0];
		for (var y=1; y < dim[0]; y++) {
			for (var x=1; x < dim[1]; x++) {
				var b = 8*c[(y-1) + (x-1)*dim[0]] + 4*c[(y-1) + x*dim[0]] + 2*c[y + x*dim[0]] + c[y + (x-1)*dim[0]];
				if (b == 0 || b == 15) continue;
				else if (b == 5 || b == 10) { // saddle points					
					var a = lvl < (d[(y-1) + (x-1)*dim[0]] + d[(y-1) + x*dim[0]]+ d[y + x*dim[0]] + d[y + (x-1)*dim[0]])/4;
					if ( (!a && b == 5) || (a && b == 10)) idxs = [1,4];
					else idxs = [2,7];
				} else if (b == 2 || b == 13) {	//can never connect to others
					p.push([ [start[b][0] + x, start[b][1] + y], [end[b][0] + x, end[b][1] + y] ]);
					continue;
				} else {
					idxs = [b];
				}			
				for (var idxn = 0; idxn < idxs.length; idxn++) {
					idx = idxs[idxn];
					p1 = [start[idx][0] + x, start[idx][1] + y];
					p2 = [end[idx][0] + x, end[idx][1] + y];				
					if (!p.length) { // first path
						p.push([p1, p2]);
					} else {	// check if this is the continuation of a path
						var found = false;						
						for (var i = 0; i < p.length; i++) {
							pfirst = p[i][0];
							plast = p[i][p[i].length-1];
							// first point in beginning of path
							if (pfirst[0] == p1[0] && pfirst[1] == p1[1]) { p[i].reverse().push(p2);}
							// first point in end of path
							else if (plast[0] == p1[0] && plast[1] == p1[1]) { p[i].push(p2);}
							else if (idx == 7 || idx == 8) {
								// second point in beginning of path - only happens for 7 and 8
								if (pfirst[0] == p2[0] && pfirst[1] == p2[1]) {p[i][0] = p1;}
								// second point in end of path - only happens for 7 and 8
								else if (plast[0] == p2[0] && plast[1] == p2[1]) { p[i].pop(); p[i].push(p1);}
								else continue;
							}
							else continue;

							if (idx == 7 || idx == 8) {// these can be connectors of paths
								pfirst = p[i][0];
								plast = p[i][p[i].length-1];
								for (j = i+1; j < p.length; j++) {//check the rest of the paths for connection
									// first point of one path coincides with first point of the other path - should never happen
									//if (pfirst[0] == p[j][0][0] && pfirst[1] == p[j][0][1])
									//	p[i] = p[i].reverse().concat (p[j].slice(1, p[j].length));
									// first point of one path coincides with last point of the other path - should never happen
									//else if (pfirst[0] == p[j][p[j].length-1][0] && pfirst[1] == p[j][p[j].length-1][1])
									//	p[i] = p[j].reverse().concat(p[i].slice(1, p[i].length).reverse());
									//last of current with first of other path		
									if (plast[0] == p[j][0][0] && plast[1] == p[j][0][1]) {
										p[i].pop();
										p[i] = p[i].concat(p[j]);
									//last of current with first of other path
									} else if (plast[0] == p[j][p[j].length-1][0] && plast[1] == p[j][p[j].length-1][1]) {
										p[i].pop();
										p[i] = p[i].concat (p[j].reverse());
									} else continue;
									p.splice(j,1);	//remove p[j]
									break;
								}
							}
							found = true;
							break;
						}
						// if all iterations were done, it means it did not find continuation
						// add new path
						if (!found) p.push([p1,p2]);	
					}
				}
			}
		}	
		//console.log(p.length);
		return p;
	}
	// Extend default setting
	var settings = this.settings;
	jQuery.extend(true, settings, options); // change settings with options
	
	// Initialize internal variables
	if (!(settings.levels instanceof Array)) {
		var max = this._data.max();
		var min = this._data.min();
	}

	var $sel = $(sel);
	this.initplot(sel);	
	var w = this.plot.width;
	var h = this.plot.height;
	var svg = this.svg;
	
	// set levels for contour
	var levels = settings.levels ? (settings.levels instanceof Array ? settings.levels : $.math._seq(min, max, settings.levels)) : $.math._seq(min, max, 10);	
	settings.max = levels[levels.length - 1];
	settings.min = levels[0];
	var dim = this._data.size();

	this.settings = settings;

	// Update SVG
	svg	.data([this])
		// Click callback
		.on('click', function (chart) {					
			if (chart.callbacks.click) {
				var p = d3.mouse(this);
				var opt = chart.settings;
				var pl = chart.plot;
				x = ((opt.xaxis.max - opt.xaxis.min)*p[0] + (pl.width - opt.xaxis.padding)*opt.xaxis.min - opt.xaxis.max*opt.xaxis.padding)/(pl.width - 2*opt.xaxis.padding);
				if (x < opt.xaxis.min || x > opt.xaxis.max) return;
				y = (-(opt.yaxis.max - opt.yaxis.min)*p[1] + (pl.height - opt.yaxis.padding)*opt.yaxis.max - opt.yaxis.min*opt.yaxis.padding)/(pl.height - 2*opt.yaxis.padding);
				if (y < opt.yaxis.min || y > opt.yaxis.max) return;
				chart.callbacks.click.call(chart, [x,y]);
			}
		});

	var yscale = d3.scale.linear()
				.domain([settings.yaxis.min, settings.yaxis.max])
				.range([h - settings.yaxis.padding, settings.yaxis.padding]);
	this.plot.yscale = yscale;
	var xscale = d3.scale.linear()
				.domain([settings.xaxis.min, settings.xaxis.max])
				.range([settings.xaxis.padding, w - settings.xaxis.padding]);
	this.plot.xscale = xscale;
	this.drawaxis(settings);

	var lineFunction = d3.svg.line()
                   .x(function(d) { return xscale(d[0]*(settings.xaxis.max - settings.xaxis.min)/dim[1] + settings.xaxis.min); })
                   .y(function(d) { return yscale(d[1]*(settings.yaxis.max - settings.yaxis.min)/dim[0] + settings.yaxis.min); })
                   .interpolate("basis");

	for (var level = 0 ; level < levels.length; level++) {
		var i = levels[level];
		
		// get color for this contour
		color = this.color(i, settings);

		var paths = getpaths(this._data,i);

		for (j = 0; j < paths.length; j++) {
			var lineGraph = svg.append("path")
                            .attr("d", lineFunction(paths[j]))
                            .attr("stroke", 'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')')
                            .attr("stroke-width", 1)
                            .attr("fill", "none");
        	}
	}
	//console.log((new Date().getTime() - dtstart) + 'ms elapsed');
	this.xlabel(settings.xaxis.label);
	this.ylabel(settings.yaxis.label);
	return this;
}