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
		adjustHeight: function(instance) {
			var $content = instance.content();
			var $containerHeight = jQuery('.lity-container').height();
			if ($containerHeight) {
				$content.css('max-height', Math.round($containerHeight) + 'px')
			}
		},
		template: function(cfg, groupName, groupPosition, groupLength) {
			var className = '';
			if (!!cfg.className){
				className = ' ' + cfg.className;
			}

			var button_next_prev = '',
			    group_info_text = '',
			    group_info = '';
			if (groupName && groupLength) {
				var newPosition = (groupPosition <= 0 ? groupLength - 1 : groupPosition - 1);
				button_next_prev += '<button class="lity-previous" type="button" data-group-name="'+groupName+'" data-group-position="'+newPosition+'" aria-label="' + litySpip.strings.previous + '" data-lity-prev'
					+'><b title="' + litySpip.strings.previous +'">❮</b></button>';
				newPosition = (groupPosition >= groupLength - 1 ? 0 : groupPosition + 1);
				button_next_prev += '<button class="lity-next" type="button" data-group-name="'+groupName+'" data-group-position="'+newPosition+'"  aria-label="' + litySpip.strings.next + '" data-lity-next'
					+'><b title="' + litySpip.strings.next +'">❯</b></button>';
				group_info_text = " " + (groupPosition+1) + "/" + groupLength;
				group_info = '<div class="lity-group-caption">'
					+ '<span class="lity-group-current">'+group_info_text+'</span>'
					+ button_next_prev
					+ '</div>';
			}
			var close_button_aria_label = litySpip.strings.close + ' (' + litySpip.strings.press_escape + ')' ;
			var dialog_title = litySpip.strings.dialog_title_def + group_info_text + ' (' + litySpip.strings.press_escape + ')' ;

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
				deferred.reject($('<span class="lity-error"></span>').append('Failed loading ajax'));
			};
			$.get(target)
				.done(function (content){
					deferred.resolve($('<div class="lity-content-inner"></div>').append(content));
				})
				.fail(failed);
			return deferred.promise();
		},
		groupElements: function(groupName) {
			return $('.lity-enabled[data-'+litySpip.nameSpace+'-group'+'='+groupName+']');
		},
		eventSet:false,
		onPrevNext: function(event) {
			var $button = $(this);
			var groupName = $button.data('group-name');
			var groupPosition = $button.data('group-position');
			var newEl = litySpip.groupElements(groupName).eq(groupPosition);
			if (newEl) {
				lity.current().close();
				newEl.trigger('click');
			}
		},
		onClickOpener: function(event) {
			event.preventDefault();

			var opener = $(this);
			var cfg = opener.data('mediabox-options');
			var target = opener.data('href') || opener.attr('href') || opener.attr('src');

			litySpip.lityOpener(target, cfg, this);
		},
		lityOpener: function(target, cfg, opener) {
			// routage des callbacks
			litySpip.callbacks.onOpen.push(cfg.onOpen || false);
			litySpip.callbacks.onShow.push(cfg.onShow || false);
			litySpip.callbacks.onClose.push(cfg.onClose || false);

			// memoriser le focus
			litySpip.focusedItem.push($(document.activeElement));

			var type = cfg.type || '';
			if (!type && opener) {
				type = $(opener).data(litySpip.nameSpace+'-type') || '';
			}

			var handlers = lity.handlers();
			// ajouter le handler ajax si besoin
			if (type==='ajax'){
				handlers.ajax = litySpip.ajaxHandler;
			}
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

			cfg = $.extend({template: litySpip.template(cfg, groupName, groupPosition, groupLength)}, cfg);

			lity(target, cfg, opener);
		}
	}

	jQuery.fn.extend({

		mediabox: function (options){
			var cfg = $.extend({}, litySpip.config, options);

			var href = cfg.href || ""; // content

			if (this===jQuery.fn){
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

				if (!litySpip.eventSet) {
					litySpip.eventSet = true;
					$(document).on('click', '.lity-enabled', litySpip.onClickOpener);
					$(document).on('click', '.lity-previous,.lity-next', litySpip.onPrevNext);
				}

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
		litySpip.strings.current = b.str_current;
		litySpip.strings.previous = b.str_prev;
		litySpip.strings.next = b.str_next;
		litySpip.strings.close = b.str_close;
		litySpip.strings.loading = b.str_loading;
		litySpip.strings.press_escape = b.str_petc;
		litySpip.strings.dialog_title_def = b.str_dialTitDef;
		litySpip.strings.dialog_title_med = b.str_dialTitMed;

		$(document).on('lity:open', function(event, instance) {
			console.log('Lity opened');
			// placer le focus sur le bouton close
			jQuery('.lity-close',instance.element()).focus();
			var callback = litySpip.callbacks.onOpen.pop();
			if (callback) {
				callback(event, instance);
			}
		});
		$(document).on('lity:ready', function(event, instance) {
			console.log('Lity ready');
			litySpip.adjustHeight(instance);
			var callback = litySpip.callbacks.onShow.pop();
			if (callback) {
				callback(event, instance);
			}
		});
		$(document).on('lity:close', function(event, instance) {
			console.log('Lity close');
			var callback = litySpip.callbacks.onClose.pop();
			if (callback) {
				callback(event, instance);
			}
		});
		$(document).on('lity:remove', function(event, instance) {
			console.log('Lity remove');
			var focused = litySpip.focusedItem.pop();
			if (focused) {
				focused.focus();
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