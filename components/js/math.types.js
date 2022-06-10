$.math = $.math || {};

// General type
$.math.type = $.math.type || function () {
	this.value = undefined;
}
$.math.type.prototype.get = function () { return this.value; }

// Scalar
$.math.scalar = function (v) { this.value = v; }
$.math.scalar.prototype = new $.math.type();
$.math.scalar.prototype.eq = function (B) {
	return B instanceof $.math.scalar ? this.value == B.value :  B.eq(this);
}
$.math.scalar.prototype.gt = function (B) {
	return B instanceof $.math.scalar ? this.value > B.value :  B.lt(this);
}
$.math.scalar.prototype.ge = function (B) {
	return B instanceof $.math.scalar ? this.value >= B.value :  B.le(this);
}
$.math.scalar.prototype.lt = function (B) {
	return B instanceof $.math.scalar ? this.value < B.value :  B.gt(this);
}
$.math.scalar.prototype.le = function (B) {
	return B instanceof $.math.scalar ? this.value <= B.value :  B.ge(this);
}
$.math.scalar.prototype.sum = function (B) {
	return B instanceof $.math.scalar? this.value + B.value : B.sum(this);
}
$.math.scalar.prototype.dot = function (B) {
	return B instanceof $.math.scalar? this.value * B.value : B.dot(this);
}
$.math.scalar.prototype.x = function (B) {
	return B instanceof $.math.scalar? this.value * B.value : B.x(this);
}

// Matrix
$.math.matrix = function (v, d) {
	var size = 1;
	// get size as the product of elements in each dimension
	for (var i = 0; i < d.length; i++) {
		size *= d[i];
	}
	// new matrix equals v
	if (v instanceof Array) {
		if (v.length == size)	this.value = v;
	// new matrix has only entries equal to v
	} else if (!isNaN(v)) {
		this.value = new Array(size);
		for (var i = 0; i < this.value.length; i++) {
			this.value[i] = v;
		}
	}
	this.dim = d;
}
$.math.matrix.prototype = new $.math.type();
$.math.matrix.prototype.at = function(i, v) {
	if (!isNaN(i)) { //number
		if (i > this.value.length || i < 1) {
		} else {
			if (v === undefined)
				return this.value[i-1];
			else {
				this.value[i-1] = v;
				return this;
			}
		}
	}
	else if (i instanceof Array) {
		var idx = 0, idxm = 1;
		for (var j = 0; j < i.length; j++) {
			idx = idx + idxm*(i[j] - 1);
			idxm = idxm * this.dim[j];
		}
		if (v === undefined)
			return this.value[idx];
		else {
			this.value[idx] = v;
			return this;
		}
	}
}
$.math.matrix.prototype.size = function () { return this.dim; }
$.math.matrix.prototype.sum = function (B) {
	var res = new Array(this.value.length);
	if (B instanceof $.math.scalar) {
		var res = new Array(this.value.length);		
		for (var i = 0; i < this.value.length; i++) {			
			res[i] = this.value[i] + B.value;
		}		
	} else if (B instanceof $.math.matrix) {
		if ($.math.equal(B.size(), this.size())) {	// dimensions are equal		
			for (var i = 0; i < this.value.length; i++) {
				res.value[i] = this.value[i] + B.value[i];
			}
		}
	}
	return new $.math.matrix(res, this.dim);
}
$.math.matrix.prototype.eq = function (B) {
	var res = new Array(this.value.length);
	if (B instanceof $.math.scalar) {
		for (var i = 0; i < this.value.length; i++) {
			res[i] = (this.value[i] == B.value);
		}
	} else if (B instanceof $.math.matrix) {
		if ($.math.equal(B.size(), this.size())) {	// dimensions are equal			
			for (var i = 0; i < this.value.length; i++) {
				res[i] = this.value[i] == B.value[i];
			}
		}
	}
	return new $.math.matrix(res, this.dim);
}
$.math.matrix.prototype.gt = function (B) {
	var res = new Array(this.value.length);
	if (B instanceof $.math.scalar || (n = !isNaN(B))) {
		if (n) B = {value: B};
		for (var i = 0; i < this.value.length; i++) {
			res[i] = (this.value[i] > B.value);
		}
	} else if (B instanceof $.math.matrix) {
		if ($.math.equal(B.size(), this.size())) {	// dimensions are equal			
			for (var i = 0; i < this.value.length; i++) {
				res[i] = this.value[i] > B.value[i];
			}
		}
	}
	return new $.math.matrix(res, this.dim);
}
$.math.matrix.prototype.ge = function (B) {
	var res = new Array(this.value.length);
	if (B instanceof $.math.scalar) {
		for (var i = 0; i < this.value.length; i++) {
			res[i] = (this.value[i] >= B.value);
		}
	} else if (B instanceof $.math.matrix) {
		if ($.math.equal(B.size(), this.size())) {	// dimensions are equal			
			for (var i = 0; i < this.value.length; i++) {
				res[i] = this.value[i] >= B.value[i];
			}
		}
	}
	return new $.math.matrix(res, this.dim);
}
$.math.matrix.prototype.lt = function (B) {
	var res = new Array(this.value.length);
	if (B instanceof $.math.scalar) {
		for (var i = 0; i < this.value.length; i++) {
			res[i] = (this.value[i] < B.value);
		}
	} else if (B instanceof $.math.matrix) {
		if ($.math.equal(B.size(), this.size())) {	// dimensions are equal			
			for (var i = 0; i < this.value.length; i++) {
				res[i] = this.value[i] < B.value[i];
			}
		}
	}
	return new $.math.matrix(res, this.dim);
}
$.math.matrix.prototype.le = function (B) {
	var res = new Array(this.value.length);
	if (B instanceof $.math.scalar) {
		for (var i = 0; i < this.value.length; i++) {
			res[i] = (this.value[i] <= B.value);
		}
	} else if (B instanceof $.math.matrix) {
		if ($.math.equal(B.size(), this.size())) {	// dimensions are equal			
			for (var i = 0; i < this.value.length; i++) {
				res[i] = this.value[i] <= B.value[i];
			}
		}
	}
	return new $.math.matrix(res, this.dim);
}
$.math.matrix.prototype.dot = function (B) {
	var res = new Array(this.value.length);
	if (B instanceof $.math.scalar) {
		for (var i = 0; i < this.value.length; i++) {
			res[i] = (this.value[i] * B.value);
		}
	} else if (B instanceof $.math.matrix) {
		if ($.math.equal(B.size(), this.size())) {	// dimensions are equal			
			for (var i = 0; i < this.value.length; i++) {
				res[i] = this.value[i] * B.value[i];
			}
		}
	}
	return new $.math.matrix(res, this.dim);
}
$.math.matrix.prototype.x = function (B) {
	if (B instanceof $.math.scalar) {
		return this.dot(B);
	} else if (B instanceof $.math.matrix) {
		if (B.dim.length > 2 || this.dim.length > 2) return "A matrix cannot have more than 2 dimensions for matrix multiplication";
		if (this.dim[this.dim.length - 1] !== B.dim[0]) return "Dimensions of arrays must match for multiplication";
		var M = this.dim[0];
		var K = B.dim[0];
		var N = B.dim[B.dim.length-1];
		var res = new Array(M*N);
		for (var m = 0; m < M; m++) {	// for each element in the resulting matrix
			for (var n = 0; n < N; n++) {
				k = n*M + m; res[k] = 0;
				for (var i = 0; i < K; i++) {
					res[k] = res[k] + this.value[n + M*i] * B.value[n*M+i];
				}
			}
		}
	}
	return new $.math.matrix(res, [M,N]);
}
$.math.matrix.prototype.min = function () {
	var min = Number.POSITIVE_INFINITY;
	for (i = 0; i < this.value.length; i++) {
		min = Math.min(this.value[i], min);
	}
	return min;
}
$.math.matrix.prototype.max = function () {
	var max = Number.NEGATIVE_INFINITY;
	for (i = 0; i < this.value.length; i++) {
		max = Math.max(this.value[i], max);
	}
	return max;
}
$.math.equal = function(A, B) {
    if(A.length !== B.length)
        return false;
    for(var i = A.length; i--;) {
        if(A[i] !== B[i])
            return false;
    }
}
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