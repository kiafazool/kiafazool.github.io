r(_jQ, function ($) {
	$.ajaxSetup({ cache: true });

	$.phd = function (f) {
		f(this.phd);
	}

	$.phd.extend = function (props) {
		for (var p in props) {
			this[p] = props[p];
		}
	}

	$.phd.extend({
		citations : {
			bertsekas1999: "http://www.amazon.com/gp/product/1886529000/ref=as_li_qf_sp_asin_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=1886529000&linkCode=as2&tag=httpwwwonmyph-20"
		},
		hascanvas : document.createElement('canvas').getContext,
		// Global selectors. Can be set outside phd.js
		state	: '#logo',
		message : '#message',
		page	: '#pages',
		home	: 'about.me',
		// Set if page should not be loaded
		notload : false,
		// Number of asynchronous operations pending for conclusion
		asyncpending: 0,
		adblock : false,
	});

	$.phd.cite = function (sel) {
		$(sel).find('cite').each ( function () {
			var id = $(this).attr('id');
			$(this).html("<a href='" + $.phd.citations[id] + " ' target='_blank' rel='external'>" + $(this).text() +
				"</a><img src='http://www.assoc-amazon.com/e/ir?t=httpwwwonmyph-20&l=as2&o=1&a=1886529000' width='1' height='1' border='0' style='border:none !important; margin:0px !important;' />");
		});
		return this;
	};

	$.phd.configure = function ()
	{
	    var History = window.History; // Note: We are using a capital H instead of a lower h
	    if ( !History.enabled ) {
		 // History.js is disabled for this browser.
		 // This is because we can optionally choose to support HTML4 browsers or not.
		return false;
	    }
	    // Bind to StateChange Event
	    $(window).on('statechange',function(){ // Note: We are using statechange instead of popstate;
			var State = History.getState(); // Note: We are using History.getState() instead of event.state

			if (State.title == '') State.title = $.phd.home;

			if (! $.phd.notload) $.phd.loadpage('#pages', State.title);
	    });

	};

	// create a new history entry and jump to it
	$.phd.jump = function(sel, page)
	{
		History.pushState(null, page, "?p=" + page); // logs {state:1}, "State 1", "?state=1"
	};

	// replace this history entry by another
	$.phd.replace = function(sel, page)
	{
		// refreshing the window does not trigger statechange in History
		// but it runs this code
		// Load - run replace works
		// Refresh - force statechange

		// Refresh case
		if (History.getState().title == page)
			$(window).trigger("statechange");
		// Load case
		else
			History.replaceState(null, page, "?p=" + page); // logs {state:1}, "State 1", "?state=1"
	};

	// function to ajaxify all links
	$.phd.ajaxify = function (sel) {
		$(sel).find('a.page')
			.attr({rel: 'external', target: '_blank'})
			.click( function (event) {
				var id = $(this).attr('href').split("=")[1];
				$.phd.jump('#pages', id);
				return false;
			})
		return this;
	}

	$.phd.tocadditem = function (sel, item)
	{
		if ( $(item).is('section') )
		{
		// if it is section
			$li = $('<li ><a class="section" href="#">' + $(item).attr('name') + '</a></li>').appendTo(sel);
			svg = $(item).attr('svg');
			pdf = $(item).attr('pdf');
			page = $(item).attr('page');

			if (svg)	$(sel).append("<a href='pages/" + svg + ".svg' target='_blank'><img src='images/svg-icon.png' /></a>");
			if (pdf)	$(sel).append("<a href='pages/" + pdf + ".pdf' target='_blank'><img src='images/pdf-icon.png' /></a>");
			if (page)	$('a', $li).attr('href', "?p=" + page).addClass('page');

			// look for children
			var $ul = $('<ul></ul>');
			$(sel).append($ul);

			$(item).children().each(function(){
				$.phd.tocadditem($ul, this);
			});
		}
		else if ( $(item).is('topic') )
		//adds item
			if ($(item).attr('state') == 'off')
				$(sel).append('<li>' + $(item).attr('name') + '</li>');
			else
				$(sel).append('<li ><a class="page" id="' + $(item).attr('page') + '" href="?p=' + $(item).attr('page') + '">' + $(item).attr('name') + '</a></li>');

	};

	$.phd.toc = function (sel)
	{
		$.ajax({
			type: "GET",
			url: "ajax/toc.xml",
			dataType: "xml",
			async: false,		// wait for request to end
			success: function(xml) {
					// if toc not loaded successfully show message
					if (!$(xml).children().is('toc'))
					{
						$(sel).html('Sorry about that. The Table of Contents is not being read properly. :(');
						return;
					}
					var $ul = $('<ul></ul>');
					$(sel).append($ul);
		 			$(xml).children().children().each(function(){
						$.phd.tocadditem($ul, this);
					});
					// make sections hidabble
					$(sel).find('a.section').click( function (event) {
						//a	li	ul
						$(this).parent().next().slideToggle();
						return false;
					});
				}
		});
	};

	$.phd.loading = function () {
		if ($.phd.asyncpending > 0)
		{
			$(this.message).append('.');
			timerId = setTimeout( "$.phd.loading()", 100);
		}
	};

	// Loads page 'page' into the html element 'sel'
	$.phd.loadpage = function (sel, page) {
		$.phd.notload = false;
		$(this.message).text('Loading...');
		$.phd.loading();
		// Take hash from href
		href = page.split('#');
		page = href[0];
		var hash = href.length == 2 ? href[1] : undefined;

		//Load only page
		$(sel).load('pages/' + page + '.page',
			function (response, status, xhr) {
				// When the load is not successful
				if (status == 'error')
				{
					$.phd.notload = true;
					$.phd.endload('Oops...this topic is still not available.');
					history.back();
					return;
				}
				$.phd.start();

				// load javascript from pages
				if ($.phd.onload) $.phd.onload(sel);
				// convert page links into dynamic links
				$.phd.ajaxify('body')
				// add social links in the end
				.likesocial($.phd.page, page)
				// convert citations to links
				.cite($.phd.page);
				// Go to hash
				if (hash) window.scrollTo(0, $('#' + hash).position().top);

				$.phd.finish();
			}
		);
	};

	$.phd.start = function () {
		$.phd.asyncpending++;
	}

	$.phd.finish = function () {
		if (--$.phd.asyncpending <= 0)
		{
			$.phd.asyncpending = 0;
			$.phd.footnote($.phd.message);
		}
	}

	$.phd.loadtextmath = function (container) {
		function typeset (container, callback) {
			container = container || $.phd.page;
			MathJax.Hub.Queue(
			//		["resetEquationNumbers", MathJax.InputJax.TeX],
			// Typeset content in 'container'
					["Typeset", MathJax.Hub, $(container).get(0)],
			// decrement asynchronous operation counter
					callback
			);
		};

		function cbMathjaxLoad (script, textStatus) {
			typeset(container, $.phd.finish);
		}

		$.phd.start();		// increment asynchronous operation counter

		if (typeof MathJax == "undefined")
		// MathJax not defined yet
		{
			window.MathJax = {
				extensions: ['tex2jax.js'],
				jax: ['input/TeX', 'output/HTML-CSS'],
				tex2jax: { inlineMath: [['$','$']], processEscapes: true },
				TeX: { equationNumbers: { autoNumber: 'AMS' }, Macros: { b:["{\\bf #1}",1] } }
			};

			// load MathJax
			$.getScript('https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.2/MathJax.js')
			//$.getScript('http://cdn.mathjax.org/mathjax/latest/MathJax.js')
			//$.getScript('http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML-full')
			.done(cbMathjaxLoad)
			.fail(function(jqxhr, settings, exception) {
				$.getScript('components/js/MathJax.js')
				.done(cbMathjaxLoad)
				.fail(function(jqxhr, settings, exception) {
					alert('Oops, a library failed to load. Please refresh the page to try again.');
				});
			});
		} else {	//MathJax object created
			typeset(container, function () {});
		}
	};

	$.phd.loadplot = function (callback) {

		if (! $.plot) {
			var requests = 6;
			function cb () {
				if (!(--requests)) { callback(); }
			}

			function flotcb() {
				//these scripts need to be loaded after the plot object exists
				$.getScript('components/js/jquery.flot.axislabels.js', cb);
				$.getScript('components/js/flot/jquery.flot.axislabels.js', cb);
				$.getScript('components/js/flot/jquery.flot.text.min.js', cb);
				$.getScript('components/js/flot/jquery.flot.dashes.js', cb);
				cb();
			}

			if ($.phd.hascanvas) {
				cb();
			} else {
				$.getScript('http://cdnjs.cloudflare.com/ajax/libs/flot/0.8.1/excanvas.min.js')
				.done(cb)
				.fail( function () {
					$.getScript('components/js/flot/excanvas.min.js', cb);
				});
				$.phd.hascanvas = true;
			}
			$.getScript('http://cdnjs.cloudflare.com/ajax/libs/flot/0.8.1/jquery.flot.min.js')
			.done(flotcb)
			.fail( function () {
				$.getScript('components/js/flot/jquery.flot.min.js', flotcb);
			});

		} else {
			callback();
		}
	};

	$.phd.popupadblocker = function () {
		$('<div>')
		.css( {
			position: 'fixed',
			top: '50%', left: '320px',
			height: '400px', width:'300px',
			'margin-top':'-160px',
			'background-image': 'url("images/tom.jpg")',
			'background-position': 'center',
			'background-repeat': 'no-repeat',
			'background-color': 'white',
			border: '1px solid gray',
			padding:'10px',
			'text-align': 'center'
		})
		.append('<h2 style="color:white; text-shadow: 1px 1px black">Pleeease, disable your Ad blocker</h2>')
		.append('<br><br><br><br><br><br><br><br><br><p><b>My owner needs to feed me... and I only eat Royal Canin.</b></p>')
		.append('<input type="button" value="Close this popup" onclick="javascript:$(this).parent().remove()"/>')
		.appendTo(document.body);
	};

	$.phd.loadsvg = function (callback) {

		if (typeof d3 == "undefined") {
			$.getScript('http://d3js.org/d3.v3.min.js')
			.done( callback )
			.fail(function(jqxhr, settings, exception) {
				$.getScript('components/js/d3.v3.min.js', callback)
			});
		} else {
			callback();
		}
	};

	$.phd.loadui = function (callback) {
		if (!jQuery.ui) {
			//$(document.head).append('<link rel="stylesheet" href="ui/1.9.2/themes/base/jquery-ui.css" />');
			$(document.head).append('<link rel="stylesheet" href="ajax/libs/jqueryui/1.10.1/themes/base/minified/jquery-ui.min.css" />');
			$.getScript('http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.3/jquery-ui.min.js')
			.done(function(script, textStatus) {
				//$.getScript('components/js/jquery/ui/jquery.ui.touch-punch.min.js');
				$.getScript('http://cdnjs.cloudflare.com/ajax/libs/jqueryui-touch-punch/0.2.2/jquery.ui.touch-punch.min.js');
				if (typeof callback == 'function') callback();
			})
			.fail(function(jqxhr, settings, exception) {});
		} else {
			if (typeof callback == 'function') { callback(); }
		}
	};

	$.phd.loadslider = function (callback) {
		if (!jQuery.noUiSlider) {
			$(document.head).append('<link rel="stylesheet" href="ajax/libs/noUiSlider/8.0.2/nouislider.min.css" />');
			//$(document.head).append('<link rel="stylesheet" href="components/js/jquery.nouislider.min.css">');

			$.getScript('https://cdnjs.cloudflare.com/ajax/libs/noUiSlider/8.0.2/nouislider.min.js')
			//$.getScript('components/js/jquery.nouislider.all.min.js')
			.done(function(script, textStatus) {
				if (typeof callback == 'function') callback();
			})
			.fail(function(jqxhr, settings, exception) {});
		} else {
			if (typeof callback == 'function') { callback(); }
		}
	};

	$.phd.ads = function (container) {

		var $ads = $(container + ' .ads');
		$ads.each( function () {
			if ($(this).hasClass('top'))
				$(this).html("<iframe  frameborder='0' src='/ads_top.html'  width='736' height='98' scrolling='no'></iframe>");
		});
	};

	$.phd.likesocial = function (container, page) {
		$(container).append('<div id="social">If I helped you in some way, please help me back by liking this website on the bottom of the page or clicking on the link below. It would mean the world to me!<br><div id="fb-like-page" class="fb-like" data-href="http://www.onmyphd.com/?' + page + '" data-send="false" data-width="200" data-show-faces="false" data-layout="button-count"></div><!-- Place this tag where you want the +1 button to render. --><div class="g-plusone"></div><script type="text/javascript"> (function() { var po = document.createElement(\'script\'); po.type = \'text/javascript\'; po.async = true; po.src = \'https://apis.google.com/js/plusone.js\'; var s = document.getElementsByTagName(\'script\')[0]; s.parentNode.insertBefore(po, s); })(); </script></div>');
		return this;
	};

	$.phd.footnote = function (sel) {
		var notes = [
			"Something is wrong with the webpage? <a href='mailto:onmyphd@gmail.com'>Shoot me an email</a>, otherwise I will never know.",
			"Like what you're reading? Like, +1 or tweet this page in the end.",
			"Check out the <a href='?p=contents'>Contents section</a> for more information on other topics.",
			"Not clear enough? <a href='mailto:onmyphd@gmail.com'>Let me know</a>, I will be glad to improve on my writing.",
			"Have any suggestions for a new topic? Maybe I can write about it.<a href='mailto:onmyphd@gmail.com'>Let me know</a>."
			];

		pick = Math.floor(Math.random()*notes.length);
		$(sel).html(notes[pick]);
	};

});