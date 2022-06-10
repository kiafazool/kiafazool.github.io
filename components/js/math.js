(function ($) {

$.math = $.math || (function () {

	var events = {};

	return {
	nrand : function ()
	{
		var x1, x2, rad;
	 
		do {
			x1 = 2 * Math.random() - 1;
			x2 = 2 * Math.random() - 1;
			rad = x1 * x1 + x2 * x2;
		} while(rad >= 1 || rad == 0);
	 
		var c = Math.sqrt(-2 * Math.log(rad) / rad);
	 
		return x1 * c;
	},
	_seq : function (min, max, n) {
		var seq = new Array(n);
		for (var i = 0; i <= n; i++) seq[i] = min + (max - min)*i/n;
		return seq;
	},
	// event (event, callback) - subscribe callback function to event
	listen : function (event, listener, scope) {
		if (arguments.length > 2) {
			if (events[event])
				events.push(listener);
			else {
				events[event] = [listener];
				this['on' + event] = function () {
					for (var i = 0; i < events[event].length; i++)
						events[event][i].apply(scope?scope:this, arguments);
				};
			}
		}
		return this;
	}
	}
})();

// Error-related functions:
$.math.error = function (error) {
	if (!arguments.length)
		return $.math.error.error == '' ? false : $.math.error.error;
	else if (typeof error == "string")
		$.math.error.error = error;
		return this;
};
$.math.error.error = '';
$.math.error.clear = function () { $.math.error.error = ''; return this; };
$.math.error.is = function () { return $.math.error.error != ''; };

	/*
	// sums all elements of vector
	$.fn.sum = function() {  
		res = 0;
		data = this.toArray();
		for (i = 0; i < data.length; i ++)
				res = res + data[i];
		return res;

        	//return this.each(function() {  
      
        	//});
	};

	$.fn.func = function( fn ) {
		res = [];
		data = this.toArray();
		for (i = 0; i < data.length; i ++)
			res.push( fn(data[i]) );
		return $(res);

        	//return this.each(function() {  
      
        	//});
        }; 

	$.fn.note = function ( text, params, css) {
		var div = $('<div />').css(css).html(text);
		div.css({left: params.x, top: params.y, position: 'absolute'});
		this.append(div);

		// only after append we get the width
		// after append, the new div must be retrieved from the jquery object

		//if (params.center == true)
		//{
		//	alert(div.position.left());
		//	div.css('left', div.css('left') - div.width()/2 );
		//	//div.top(div.top() - div.height()/2);
		//}

	
		return this;
	};

	$.fn.seq = function (start, end, by) {
		if (!by) by = 1;
		var data = [];
		for (i = start; i <= end; i = i + by)
			data.push(i);

		return $(data);
	};

	$.fn.concat = function (data) {
		return $(this.toArray().concat(data));
	}

	// doesn't work for vectors
	$.fn.transpose = function () {
		
		// first index is row, second is column
		// by default, a vector is a row

		// Calculate the width and height of the Array
		  var a = this.toArray(),
		    w = a.length ? a.length : 0,
		    h = a[0].constructor == Array ? a[0].length : (a[0].constructor == Number ? 1 : 0);
		 
		  // In case it is a zero matrix, no transpose routine needed.
		  if(h === 0 || w === 0) { return this; }
		 
		  
		   // @var {Number} i Counter
		   // @var {Number} j Counter
		   // @var {Array} t Transposed data is stored in this array.
		   //
		  var i, j, t = [];
		 
		  // Loop through every item in the outer array (height)
		  for(i=0; i<h; i++) {
		 
		    // Insert a new row (array)
		    t[i] = [];
		 
		    // Loop through every item per item in outer array (width)
		    for(j=0; j<w; j++) {
		      // Save transposed data.
		      t[i][j] = a[j][i];

		    }
		  }			
		 
		  return $(t);
	}*/
})(jQuery);