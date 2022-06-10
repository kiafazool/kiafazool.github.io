if(!Array.prototype.last) {
    Array.prototype.last = function() {
        return this[this.length - 1];
    }
};

if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (searchElement /*, fromIndex */ ) {
        "use strict";

        if (this === void 0 || this === null) throw new TypeError();

        var t = Object(this);
        var len = t.length >>> 0;
        if (len === 0) return -1;

        var n = 0;
        if (arguments.length > 0) {
            n = Number(arguments[1]);
            if (n !== n) // shortcut for verifying if it's NaN
            n = 0;
            else if (n !== 0 && n !== (1 / 0) && n !== -(1 / 0)) n = (n > 0 || -1) * Math.floor(Math.abs(n));
        }

        if (n >= len) return -1;

        var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);

        for (; k < len; k++) {
            if (k in t && t[k] === searchElement) return k;
        }
        return -1;
    };
}

if(!String.prototype.format)
	String.prototype.format = function() {	 
	  s = this;
	  if (arguments.length == 1 && arguments[0].constructor == Object) {
	    for (var key in arguments[0])
	      s = s.replace(new RegExp("\\\{" + key + "\\\}", "g"), arguments[0][key]);
	  }
	  else if (arguments.length == 1 && arguments[0].constructor == Array) {
	    for (var i = 0; i < arguments[0].length; i++)		
	      s = s.replace(new RegExp("\\\{" + i + "\\\}", "g"), arguments[0][i]);		 		
	  }
	  else {
	    for (var i = 0; i < arguments.length; i++)
	      s = s.replace(new RegExp("\\\{" + i + "\\\}", "g"), arguments[i]);
	  }
	  return s;
	};

if(!String.prototype.isdigit)
	String.prototype.isdigit = function () {
		return this[0] >= '0' && this[0] <= '9';
	};


$(function () {

$.math = $.math || {};

$.math.rpn = $.math.rpn || {
	results: [],

	states : {
		jumpspace: 1,
		lookforfunctions: 2,
		lookfornumber: 3,
		lookforvar: 4,
		lookforoperators: 5,
		lookforbrackets: 6,
		anotherchar: 7
	},

	types: {
		var: 1,
		function: 2,
		bracket: 3,
		number: 4,
		operator: 5
	},

	// priorities
	// vars = 1 
	// ^ = 2
	// /* = 3
	// +- = 4
	operators : {
	"^":	{
			operands: 2,
			typeset: '{ {0} }^{ {1} }',
			priority: 2,
			typesetnoparentesis: [false, true],
			js: "Math.pow({0},{1})",
			associativity: "right"
		},
	"*":	{
			operands: 2,
			typeset: '{0} \\cdot {1}',
			js: "({0})*({1})",
			priority: 3
		},
	"/":	{
			operands: 2,
			typeset: '\\frac{ {0} }{ {1} }',
			typesetnoparentesis: [true, true],	
			js: "({0})/({1})",
			priority: 3,
			associativity: "left"
		},
	"-":	{
			operands: 2,
			typeset: '{0} - {1}',
			js: "{0}-{1}",
			priority: 4
		},
	"+":	{
			operands: 2,
			typeset: '{0} + {1}',
			js: "{0}+{1}",
			priority: 4
		}
	},

	uoperators : {
	"-":	{
			operands: 1,
			typeset: '-{0}',
			js: '-({0})',
			priority: 3,
			associativity: "right"
		},
	"+":	{
			operands: 1,
			typeset: '+{0}',
			js: '+({0})',
			priority: 3,
			associativity: "right"
		}
	},

	functions : {
	"exp":	{
			operands: 1,
			typeset: 'e^{ {0} }',
			typesetnoparentesis: [true],			
			priority: 3,
			js: "Math.exp({0})",
		},
	"log":	{
			operands: 1,
			typeset: '\\log\\left({0}\\right)',
			typesetnoparentesis: [true],
			priority: 3,
			js: "Math.log({0})/Math.LN10"
		},
	"ln":	{
			operands: 1,
			typeset: '\\ln\\left({0}\\right)',
			typesetnoparentesis: [true],
			priority: 3,
			js: "Math.log({0})"
		},
	"sin":	{
			operands: 1,
			typeset: '\\sin\\left({0}\\right)',
			priority: 3,
			typesetnoparentesis: [true],
			js: "Math.sin({0})"
		},
	"cos":	{
			operands: 1,
			typeset: '\\cos\\left({0}\\right)',
			typesetnoparentesis: [true],
			priority: 3,
			js: "Math.cos({0})"
		},
	"sqrt":	{
			operands: 1,
			typeset: '\\sqrt{ {0} }',
			typesetnoparentesis: [true],
			priority: 3,
			js: "Math.sqrt({0})"
		},
	"tan":	{
			operands: 1,
			typeset: '\\tan\\left({0}\\right)',
			typesetnoparentesis: [true],
			priority: 3,
			js: "Math.tan({0})"
		},
	"asin":	{
			operands: 1,
			typeset: '\\arctan\\left({0}\\right)',
			typesetnoparentesis: [true],
			priority: 3,
			js: "Math.asin({0})"
		},
	"acos":	{
			operands: 1,
			typeset: '\\arctan\\left({0}\\right)',
			typesetnoparentesis: [true],
			priority: 3,
			js: "Math.acos({0})"
		},
	"atan":	{
			operands: 1,
			typeset: '\\arctan\\left({0}\\right)',
			typesetnoparentesis: [true],
			priority: 3,
			js: "Math.atan({0})"
		}
	//arcsin, arccos, arctan
	},
	
	vars: {
	"e":	{
			typeset: 'e',
			js: "Math.exp(1)"
		},
	"pi":	{
			operands: 0,
			typeset: '\\pi',
			js: "Math.PI"
		}
	},

	brackets : {
	"(":	{
			closer: ")"
		},
	"[":	{
			closer: "]"
		},
	"{":	{
			closer: "}"
		},
	")":	{
			opener: "("
		},
	"]":	{
			opener: "["
		},
	"}":	{
			opener: "{"
		}
	},

	typeset: function (container) {			
		if ( this.iserror() ) return this;
		var idx = 0;
		var s = [];
		var prec = [];

		for (var idx = 0; idx < output.length; idx++) {
			var el = output[idx];
			if (typeof el.operands == "undefined" || el.operands == 0)
			{
			// not a function
				if ( el.type = this.types.var && el.typeset in this.vars )
					s.push( this.vars[el.js].typeset );
				else		
					s.push( el.typeset );
				prec.push(0);
			}
			else {
				var nop = el.operands;

				if (s.length < nop) return {};	// not enough operands before operator

				var op = s.slice(s.length - nop, s.length);			
				var opprec = prec.slice(s.length - nop, s.length);
				for (var i = 0; i < op.length; i++) {
					if ((typeof el.typesetnoparentesis == "undefined" || !el.typesetnoparentesis[i]) &&  ( opprec[i] > el.priority))
						op[i] = "\\left(" + op[i] + "\\right)";
				}

				s[s.length - nop] = el.typeset.format( op );
				prec[s.length - nop] = el.priority;
				s.length = s.length - nop + 1;
				prec.length = s.length;
			}
		}
		
		if (s.length > 1)
			this.error = 'There are too much terms';
		else {
			$(container).text('$' + s[0] + '$');
			$.phd.loadtextmath(container);
		}
		return this;
	},

	process: function (rpn) {
		if ( this.iserror() ) return this;
		var idx = 0;
		var s = [];
		var prec = [];
		var vars = [];
		for (var idx = 0; idx < rpn.length; idx++) {
			var el = rpn[idx];
			if (typeof el.operands == "undefined" || el.operands == 0) {	//numbers, variables or functions with no operands 	
				if ( el.type == this.types.var) {
					if (el.js in this.vars)
						s.push( this.vars[el.js].js );
					else
					{
						if (vars.indexOf(el.js) == -1) vars.push( el.js );
						s.push( el.js );
					}
				}
				else
					s.push( el.js );
				
				prec.push(0);
			}
			else {	// operator or function
				var nop = el.operands;

				if (s.length < nop) {
					return {error: " Not enough operands."};	// not enough operands before operator
				}

				var op = s.slice(s.length - nop, s.length);
				var opprec = prec.slice(s.length - nop, s.length);

				s[s.length - nop] = el.js.format( op );
				prec[s.length - nop] = el.priority;
				s.length = s.length - nop + 1;
				prec.length = s.length;
			}
		}
		return s.length > 1 ? {error: "Too much operands."} : {expression: s[0], vars: vars};
	},

	plot: function (container, options) {
		if ( this.iserror() ) return this;

		    function showTooltip(x, y, contents) {
			$('<div id="tooltip">' + contents + '</div>').css( {
			    position: 'absolute',
			    display: 'none',
			    top: y + 5,
			    left: x + 5,
			    border: '1px solid #fdd',
			    padding: '2px',
			    'background-color': '#fee',
			    opacity: 0.80
			}).appendTo("body").fadeIn(200);
		    };

		var y = [];

		var from = parseFloat(options.from);
		var to = parseFloat(options.to);
		if (isNaN(from) || isNaN(to))
		{
			if (isNaN(from) && typeof options.error == "function")
				options.error("Range of independent variable is invalid.");
			else if (isNaN(to) && typeof options.error == "function")
				options.error("Range of independent variable is invalid.");
			return this;				
		} 
		var n = 500;
		data = [];

		var counter = isNaN(options.var) ? counter = this.results.length - 1 : parseInt(options.var);
		//alert(counter);
		for (var x = from; x <= to; x += (to - from)/n)
		{		
			y.push(this.results[counter].eval(x));
			data.push([x, y.last()]);
		}
		var plot = $.plot(container, [{data: data, lines: {show:true}}], 
			{
				xaxis: {axisLabel: ''},
				yaxis: {axisLabel: ''},
				grid: { hoverable: true, canvasText: {show: true, font: "sans 9px"}}
			});

		if (typeof options.plotted == "function")
			options.plotted(plot);
		else
			this.results[counter].plot = plot;

		$(container).bind("plothover", function (event, pos, item) {
			var f = arguments.callee;
			f.previousPoint = f.previousPoint || null;
			
			if (item) {
		        	if (f.previousPoint != item.dataIndex) {
					f.previousPoint = item.dataIndex;
		            
					$("#tooltip").remove();
					var x = item.datapoint[0].toFixed(2),
					y = item.datapoint[1].toFixed(2);
		            
					showTooltip(item.pageX, item.pageY, (item.series.label ? item.series.label + ": " : "") + "[" + x + ", " + y + "]");
				}
			}
		    	else {
		        	$("#tooltip").remove();
		        	previousPoint = null;            
			}
        	});

		return this;
	},

	output: [],
	error: '',
	iserror: function () { return this.error != '' },
	seterror: function (error) { this.error = error; return this; },
	clrerror: function () {this.error = ''; return this; },
	done: function (callback) { if (!iserror()) callback(); return this; },
	fail: function (callback) { if (iserror()) callback(this.error); return this; },

	// verify if output is correct
	verify: function (output) {
		if ( this.iserror() ) return this;
		var operands = 0;
		for (var i = 0; i < output.length; i++) {
			elem = output[i];

			if (elem.type == this.types.bracket) {
				this.error = 'Missing closing ' + elem.closer;
				return this;
			} else if (elem.type == this.types.number || elem.type == this.types.var) {
				operands++;
			} else if (elem.type == this.types.operator) {
				operands--;
			} else if (elem.type == this.function) {
				operands -= (elem.operands - 1);
			}
		}

		if (operands < 0) {
			this.error = 'Not enough operands';
			return this;
		}
		return this;
	},

	parse: function (text, symbols) {
		var patt_number = /^([+-]?[0-9]*\.?[0-9]+)([eE][+-]?[0-9]+)?/i;
		var idx = 0;
		var idxnext = idx;
		output = [];
		var operators = [];
		var fun;
		var elem = "";
		var state = this.states.jumpspace;
		var nextstate = this.states.lookfornumber;
		this.clrerror();

		text = text.concat(" ");	// add space to end evaluation of last term
		while (idxnext < text.length)
		{
			//alert(state);
			switch (state)
			{
			case this.states.jumpspace:
				if (text[idxnext] == ' ' || text[idxnext] == '\t')
				{
					idxnext++;
					idx = idxnext;
				}
				else
					state = nextstate;
				break;
			case this.states.lookfornumber:				
				var ret = patt_number.exec(text.substring(idx));
				//alert("text: " + text.substring(idx));
				//alert(patt_number.exec(text.substring(idx)));
				if (ret != null)
				{
					elem = ret[0];									
					//alert(elem);
					ret[2] = ret[2] != undefined && ret[2].length > 0 ? ret[2].substring(1) : '';
					var typeset = ret[1] + ( ret[2] != '' ? 'e^{' + ret[2] + '}' : '');
					output.push({ typeset: typeset, js: elem, type: this.types.number });
					idx = idx + elem.length;
					idxnext = idx;
					state = this.states.jumpspace;
					nextstate = this.states.lookforoperators;
				}
				else
						state = this.states.lookforvar;
						
				//if ( (text[idxnext] == '.') || (text[idxnext].isdigit()) )
				//	idxnext++;
				break;
			case this.states.lookforvar:
				if ( (text[idxnext].toUpperCase() != text[idxnext].toLowerCase()) || (text[idxnext].isdigit()) )
				// if it is character or number
				// cannot start with number, or else it was caught in states.lookfornumber
				{						
					idxnext++;
				}
				else
				{
					if (idxnext > idx)	//found var or function
					{
						operators.push({
							typeset: text.substring(idx, idxnext),
							js: text.substring(idx, idxnext),
							priority: 1,
							type: this.types.var
						});

						idx = idxnext;
						
						state = this.states.jumpspace;
						nextstate = this.states.lookforoperators;
					}
					else
					{
						state = this.states.lookforbrackets;
					}						
				}
				break;
			case this.states.lookforbrackets:
				key = text[idxnext];
				if (key in this.brackets)
				{
					bracket = this.brackets [ key ];						
					closing = typeof bracket.opener != "undefined";
					if (closing)	// it is a closing bracket
					{
						if (operators.length == 0) {	// End of operator stack without finding opening bracket
							this.error = "Missing opening " + bracket.opener;
							return this;
						}

						// remove operators from stack until the open brackets is found
						while (operators.length > 0)
						{
							var op = operators.pop();

							if (typeof op.closer != "undefined")
							// if the element in stack is an opener, break the cycle
							{
								//if this is the wrong closer, return error
								if (op.closer != key) {
									this.error = "Expecting bracket type:" + key;
									return this;
								}
								break;
							}
							else
								output.push(op);
							if (operators.length == 0) {	// End of operator stack without finding opening bracket
								this.error = "Missing opening " + bracket.opener;
								return this;
							}							
						}							
						// if last operator is function, move function from stack to output
						if (operators.length > 0 && operators.last().type == this.types.function)
							output.push ( operators.pop() );
					}
					else		// it is an opening bracket
					{
						
						// the last element is var -> then it becomes a function
						if (operators.length > 0)
						{
							var last = operators.last();
							if (last.type == this.types.var)
							{								
								if (last.js in this.functions) {
									operators[operators.length - 1] = this.functions [last.js];
									operators[operators.length - 1].type = this.types.function;
								} else {
									this.error = "Unknown function: " + last.js;
									return this;
								}
							}
							else if (last.type == this.types.number)
							{
								this.error = "You cannot open brackets after a number";
								return this;
							}
						}
						//push it into the stack
						bracket.type = this.types.bracket;
						operators.push(bracket);
					}

					idx++;
					idxnext = idx;
				// ")" found -> state = lookforoperators e.g. )*
				// "(" found -> state = lookfornumber	 e.g. (3	
					nextstate = closing ? this.states.lookforoperators : this.states.lookfornumber;
				}			
				else
				{
					nextstate = this.states.lookforunaryoperators;
				}
				state = this.states.jumpspace;
				break;
			case this.states.lookforunaryoperators:
				var op = undefined;
				for (key in this.uoperators)
				{
					if (text.substring(idx, idx + key.length) == key)
					{
						op = this.uoperators[key];
						op.type = this.types.operator;
						
						// unary operators are always put on the operator stack
						operators.push(op);
						
						// continue to next characters
						idx += key.length;
						idxnext = idx;
						break;
					}
				}
				state = (op) ? this.states.jumpspace : 0;
				if (!state) {
					this.error = "Syntax error at : " + text[idx];
					return this;
				}
				nextstate = this.states.lookfornumber;
				break;
			case this.states.lookforoperators:
				var op = undefined;				
				for (key in this.operators)
				{
					if (text.substring(idx, idx + key.length) == key)
					{
						op = this.operators[key];
						op.type = this.types.operator;
						// transfer operators with more or equal priority from stack to output
						while ((operators.length > 0) && (operators.last().priority <= op.priority) && (operators.last().type == this.types.operator || operators.last().type == this.types.var))
						//last has more or equal priority
						{
							if (operators.last().priority != op.priority || op.associativity != "right")
								output.push(operators.pop());
						}
						operators.push( op );

						// continue to next characters
						idx += key.length;
						idxnext = idx;
						break;
					}
				}
				state = (op) ? this.states.jumpspace : this.states.lookforbrackets;
				nextstate = this.states.lookfornumber;
				break;
			case this.states.anotherchar:
				this.error = 'Unknown char ' + text[idxnext];
				return this;
			}

		}

		// wrap up by passing remaining operators to output queue
		while (operators.length > 0)
			output.push(operators.pop());

		if ( this.verify(output).iserror() ) return this;

		var expression = this.process(output);	
		//alert(expression.expression);
		//alert(expression.vars);
		if (expression.vars.length > 1)
		{
			this.error = "More than one independent variable is not allowed...yet.";
			return this;
		}

		if (typeof expression.error == "undefined")
		{
			length = this.results.push({});
			eval(" this.results[length-1].eval = function (" + expression.vars + ") { return " + expression.expression + "; }");
			this.results[length-1].vars = expression.vars;
		}
		else
			this.error = expression.error;
						
		return this;
	}
};

});

<!-- Hosting24 Analytics Code -->
<script type="text/javascript" src="http://stats.hosting24.com/count.php"></script>
<!-- End Of Analytics Code -->