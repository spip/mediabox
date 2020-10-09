;
(function ($){
	/*
	 *  Implémentation de mediabox basée sur Lity
	 *  https://sorgalla.com/lity/
	 */

	var litySpip = {
		nameSpace: 'mediabox',
		config: {
		},
		strings: {
		},
		callbacks: {
			onOpen: [],
			onShow: [],
			onClose: []
		},
		focusedItem: [],
		isTransition: false,
		adjustHeight: function(instance) {
			var $content = instance.content();
			var $containerHeight = instance.element().find('.lity-container').height();
			if ($containerHeight) {
				var h = Math.round($containerHeight) + 'px';
				$content
					.css('max-height', h)
					.find('[data-'+litySpip.nameSpace+'-force-max-height]')
					.css('max-height', h);
			}
		},
		template: function(cfg, type, groupName, groupPosition, groupLength) {
			var className = '';
			if (!!cfg.className){
				className = ' ' + cfg.className;
			}
			if (!!cfg.noTransitionOnOpen) {
				className += ' lity-no-transition-on-open';
			}
			if (!!cfg.noTransition) {
				className += ' lity-no-transition';
			}
			if (!!cfg.slideShow) {
				className += ' lity-slideshow';
			}

			var button_next_prev = '',
				  button_start_stop = '',
			    group_info_text = '',
			    group_info = '';
			if (groupName && groupLength) {
				var newPosition = (groupPosition <= 0 ? groupLength - 1 : groupPosition - 1);
				button_next_prev += '<button class="lity-previous" type="button" data-group-name="'+groupName+'" data-group-position="'+newPosition+'" aria-label="' + litySpip.strings.previous + '" data-lity-previous'
					+'><b title="' + litySpip.strings.previous +'">❮</b></button>';
				newPosition = (groupPosition >= groupLength - 1 ? 0 : groupPosition + 1);
				button_next_prev += '<button class="lity-next" type="button" data-group-name="'+groupName+'" data-group-position="'+newPosition+'"  aria-label="' + litySpip.strings.next + '" data-lity-next'
					+'><b title="' + litySpip.strings.next +'">❯</b></button>';
				group_info_text = " " + litySpip.strings.current;
				group_info_text = group_info_text.replace('{current}',(groupPosition+1)+'');
				group_info_text = group_info_text.replace('{total}',groupLength+'');

				button_start_stop += '<button class="lity-start-stop" type="button" data-lity-stop-start>'
					+'<b class="lity-start" aria-label="' + litySpip.strings.slideshowStart + '" title="' + litySpip.strings.slideshowStart +'">▶</b>'
					+'<b class="lity-stop" aria-label="' + litySpip.strings.slideshowStop + '" title="' + litySpip.strings.slideshowStop +'">□</b>'
				  +'</button>';

				group_info = '<div class="lity-group-caption">'
					+ '<span class="lity-group-start-stop">' + button_start_stop + '</span>'
					+ '<span class="lity-group-current">' + group_info_text + '</span>'
					+ '<span class="lity-group-next-prev">' + button_next_prev + '</span>'
					+ '<span class="lity-group-progress-bar"><span class="lity-group-progress-bar-status" style="width:0"></span></span>'
					+ '</div>';
			}
			var close_button_aria_label = litySpip.strings.close + ' (' + litySpip.strings.press_escape + ')' ;
			var dialog_title = (type === 'image' ? litySpip.strings.dialog_title_med : litySpip.strings.dialog_title_def);
			dialog_title += group_info_text + ' (' + litySpip.strings.press_escape + ')' ;

			var t =
				  '<dialog class="box_mediabox box_modalbox lity' + className + '" role="dialog" aria-label="' + dialog_title + '" tabindex="-1">'
				+   '<div class="lity-wrap" data-lity-close role="document">'
				+     '<div class="lity-loader" aria-hidden="true" aria-label="' + litySpip.strings.loading + '"><span class="box-loading"></span></div>'
				+     '<div class="lity-container">'
				+       '<button class="lity-close" type="button" aria-label="' + close_button_aria_label + '" data-lity-close><b data-lity-close title="' + litySpip.strings.close +'">&times;</b></button>'
				+       '<div class="lity-content"></div>'
				+       group_info
				+     '</div>'
				+   '</div>'
				+ '</dialog>';
			return t;
		},
		failHandler: function (target, instance) {
			return '<div class="error lity-error">Failed loading content</div>';
		},
		ajaxHandler: function (target, instance){
			var _deferred = $.Deferred;
			var deferred = _deferred();
			var failed = function (){
				deferred.reject($('<span class="error lity-error"></span>').append('Failed loading ajax'));
			};
			$.get(target)
				.done(function (content){
					deferred.resolve($('<div class="lity-content-inner"></div>').append(content));
				})
				.fail(failed);
			return deferred.promise();
		},
		imageHandler: function (target, instance){
			var _deferred = $.Deferred;
			var desc = '';
			var longdesc = '';
			var opener = instance.opener();
			if (opener){
				desc = opener.attr('title') || $('img[alt]', opener).eq(0).attr('alt');
				if (opener.attr('aria-describedby')){
					longdesc = $('#'+opener.attr('aria-describedby')).html();
					if (by && !desc){
						desc = by; // hum ? achtung au html
					}
				}
				if (!desc){
					desc = desc || instance.opener().attr('aria-label');
				}
			}
			var img = $('<img src="'+target+'" class="lity-image-img" alt="'+desc+'" data-'+litySpip.nameSpace+'-force-max-height />');
			var deferred = _deferred();
			var failed = function (){
				deferred.reject($('<span class="error lity-error"></span>').append('Failed loading image'));
			};
			img
				.on('load', function (){
					if (this.naturalWidth===0){
						return failed();
					}

					desc = (longdesc ? longdesc : desc);
					if (desc){
						var id = 'lity-image-caption-' + Date.now().toString(36) + Math.random().toString(36).substr(2);
						img.attr('aria-describedby', id);
						img = $('<figure class="lity-image-figure"></figure>').append(img).append('<figcaption id="'+id+'" class="lity-image-caption">'+desc+'</figcaption>');
					}
					deferred.resolve(img);
				})
				.on('error', failed)
			;

			return deferred.promise();
		},
		groupElements: function(groupName) {
			return $('.lity-enabled[data-'+litySpip.nameSpace+'-group'+'='+groupName+']');
		},
		eventSet:false,
		setEvents: function() {
			if (!litySpip.eventSet) {
				$(document).on('click', '.lity-enabled', litySpip.onClickOpener);
				$(document).on('click', '.lity-previous,.lity-next', litySpip.onPrevNext);
				$(document).on('click', '.lity-start-stop', litySpip.onSlideShowToggle);
				$(window).on('keyup', litySpip.onKeyUp);
				litySpip.eventSet = true;
			}
		},
		onKeyUp: function(event) {
			var c = {37: "previous", 39: "next"}[event.keyCode];
			console.log(['keyup', event.keyCode, c]);
			if (c) {
				var current = lity.current();
				if (current) {
					jQuery('.lity-' + c, current.element()).trigger('click');
				}
			}
		},
		onPrevNext: function(event) {
			var $button = $(this);
			var groupName = $button.data('group-name');
			var groupPosition = $button.data('group-position');
			var newEl = litySpip.groupElements(groupName).eq(groupPosition);
			if (newEl) {
				var element = lity.current().element();
				litySpip.isTransition = {oldClosed:false, newOpened:true};
				element.addClass('lity-no-transition').css('visibility','hidden');
				litySpip.slideshowStop(element);
				var options = {noTransitionOnOpen: true};
				if (element.is('.lity-slideshow')) {
					options.slideShow = true;
				}
				lity.current().close();
				litySpip.elementOpener(newEl, options);
			}
		},
		slideshowStart: function(element) {
			var $progress = element.find('.lity-group-progress-bar-status');
			$progress.attr('style','');
			$progress.css('width','100%');
			var delay = litySpip.config.slideshowSpeed;
			setTimeout(function(){
				$progress.css('transition','width ' + ((delay-200)/1000) + 's linear');
				$progress.css('width','0');
			},200);
			timer = setTimeout(function(){element.find('.lity-next').trigger('click')}, delay);
			element.data('lity-timer', timer);
			$('.lity-start', element).attr('aria-hidden', 'true');
			$('.lity-stop', element).attr('aria-hidden', 'false');
			jQuery('.lity-start-stop',element).focus();
		},
		slideshowStop: function(element) {
			timer = element.data('lity-timer');
			if (timer) {
				clearTimeout(timer);
			}
		},
		onSlideShowToggle: function(event) {
			var $button = $(this);
			var element = $button.closest('.lity');
			var slideShowState = (element.is('.lity-slideshow') ? true : false);
			var timer;

			if (!slideShowState) {
				litySpip.slideshowStart(element);
			}
			else {
				litySpip.slideshowStop(element);
				$('.lity-start', element).attr('aria-hidden', 'false');
				$('.lity-stop', element).attr('aria-hidden', 'true');
			}
			element.toggleClass('lity-slideshow');

		},
		onClickOpener: function(event) {
			event.preventDefault();

			var opener = $(this);
			litySpip.elementOpener(opener);
		},
		elementOpener: function(opener, options) {
			var cfg = opener.data('mediabox-options');
			if (options) {
				cfg = $.extend({}, cfg, options);
			}
			var target = opener.data('href') || opener.attr('href') || opener.attr('src');

			litySpip.lityOpener(target, cfg, opener.get(0));
		},
		lityOpener: function(target, cfg, opener) {
			if (!litySpip.isTransition) {
				// routage des callbacks
				litySpip.callbacks.onOpen.push(cfg.onOpen || false);
				litySpip.callbacks.onShow.push(cfg.onShow || false);
				litySpip.callbacks.onClose.push(cfg.onClose || false);

				// memoriser le focus
				litySpip.focusedItem.push($(document.activeElement));
			}

			var type = cfg.type || '';
			if (!type && opener) {
				type = $(opener).data(litySpip.nameSpace+'-type') || '';
			}

			var handlers = lity.handlers();
			// ajouter le handler ajax si besoin
			if (type==='ajax'){
				handlers.ajax = litySpip.ajaxHandler;
			}
			handlers.image = litySpip.imageHandler;
			// si on est inline, router sur le handler fail si la cible n'existe pas
			if (type==='inline'){
				var el = [];
				try {
					el = $(target);
				} catch (e) {
					el = [];
				}
				if (!el.length){
					handlers.inline = litySpip.failHandler;
				}
			}
			cfg = $.extend({handlers: handlers}, cfg);
			if (type && ['image', 'inline', 'ajax', 'iframe'].indexOf(type)!== -1){
				cfg.handler = type;
			}

			// est-ce une galerie ?
			if (opener) {
				var groupName = cfg.rel || (opener ? $(opener).data(litySpip.nameSpace+'-group') : '');
				var groupPosition = 0;
				var groupLength = 0;
				if (groupName) {
					var elements = litySpip.groupElements(groupName);
					groupPosition = elements.index($(opener));
					groupLength = elements.length;
				}
			}

			cfg = $.extend({template: litySpip.template(cfg, type, groupName, groupPosition, groupLength)}, cfg);

			lity(target, cfg, opener);
		}
	}

	jQuery.fn.extend({

		mediabox: function (options){
			var cfg = $.extend({}, litySpip.config, options);


			if (this===jQuery.fn){
				var href = cfg.href || ""; // content
				litySpip.lityOpener(href, cfg, null);
				return this;
			} else {

				if (cfg.rel) {
					this.attr('data-'+litySpip.nameSpace+'-group', cfg.rel);
				}
				else {
					this.each(function() {
						var rel = $(this).attr('rel');
						if (rel) {
							$(this).attr('data-'+litySpip.nameSpace+'-group', rel);
						}
					});
				}

				litySpip.setEvents();

				return this
					.data('mediabox-options', cfg)
					.addClass('lity-enabled');
			}
		},

		mediaboxClose: function (){
			var $current = lity.current();
			if ($current){
				$current.close();
				return true;
			}
			return false;
		}

	});

	var initConfig = function (){

		// recuperer les préférences de l'utilisateur
		var b = typeof (mediabox_settings)=='object' ? mediabox_settings : {};
		litySpip.nameSpace = b.ns ? b.ns : 'mediabox';

		litySpip.strings.slideshowStart = b.str_ssStart;
		litySpip.strings.slideshowStop = b.str_ssStop;
		litySpip.strings.current = b.str_cur;
		litySpip.strings.previous = b.str_prev;
		litySpip.strings.next = b.str_next;
		litySpip.strings.close = b.str_close;
		litySpip.strings.loading = b.str_loading;
		litySpip.strings.press_escape = b.str_petc;
		litySpip.strings.dialog_title_def = b.str_dialTitDef;
		litySpip.strings.dialog_title_med = b.str_dialTitMed;
		litySpip.config.slideshowSpeed = 5000;

		$(document).on('lity:open', function(event, instance) {
			if (!instance.element().is('.lity-slideshow')){
				jQuery('.lity-close', instance.element()).focus();
			}
			if (!litySpip.isTransition){
				console.log('Lity opened');
				//instance.element.is('.lity-no-transition-on-open').removeClass('lity-no-transition-on-open');
				// placer le focus sur le bouton close
				var callback = litySpip.callbacks.onOpen.pop();
				if (callback){
					callback(event, instance);
				}
			}
		});
		$(document).on('lity:ready', function(event, instance) {
			litySpip.adjustHeight(instance);
			if (instance.element().is('.lity-slideshow')) {
				litySpip.slideshowStart(instance.element());
			}
			if (!litySpip.isTransition){
				console.log('Lity ready');
				var callback = litySpip.callbacks.onShow.pop();
				if (callback){
					callback(event, instance);
				}
			}
			else {
				litySpip.isTransition.newOpened = true;
				if (litySpip.isTransition.oldClosed) {
					litySpip.isTransition = false; // transition terminee
				}
			}
		});
		$(document).on('lity:close', function(event, instance) {
			if (!litySpip.isTransition){
				console.log('Lity close');
				// depiler si la box a ete fermee avant d'etre ready
				if (litySpip.callbacks.onShow.length > litySpip.callbacks.onOpen.length) {
					litySpip.callbacks.onShow.pop();
				}
				var callback = litySpip.callbacks.onClose.pop();
				if (callback) {
					callback(event, instance);
				}
			}
		});
		$(document).on('lity:remove', function(event, instance) {
			if (!litySpip.isTransition){
				console.log('Lity remove');
				var focused = litySpip.focusedItem.pop();
				if (focused){
					try {
						focused.focus();
					} catch (e) {
						// Ignore exceptions, eg. for SVG elements which can't be
						// focused in IE11
					}
				}
			}
			else {
				litySpip.isTransition.oldClosed = true;
				if (litySpip.isTransition.newOpened) {
					litySpip.isTransition = false; // transition terminee
				}
			}
		});
		$(document).on('lity:resize', function(event, instance) {
			console.log('Lity resize');
			litySpip.adjustHeight(instance);
		});

	}
	// on écrase la config juste une fois
	initConfig();

})(jQuery);