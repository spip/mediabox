;
(function ($){
	/*
	 *  Implémentation de mediabox basée sur Lity
	 *  https://sorgalla.com/lity/
	 */

	var litySpip = {
		config: {
		},
		strings: {
		},
		callbacks: {
			onOpen: false,
			onShow: false,
			onClose: false
		},
		adjustHeight: function(instance) {
			var $content = instance.content();
			var $containerHeight = jQuery('.lity-container').height();
			if ($containerHeight) {
				$content.css('max-height', Math.round($containerHeight) + 'px')
			}
		},
		template: function() {
			var close_button_aria_label = litySpip.strings.close + ' (' + litySpip.strings.press_escape + ')' ;
			var dialog_title = litySpip.strings.dialog_title_def + ' (' + litySpip.strings.press_escape + ')' ;
			var t =
				  '<dialog class="box_mediabox box_modalbox lity" role="dialog" aria-label="' + dialog_title + '" tabindex="-1">'
				+   '<div class="lity-wrap" data-lity-close role="document">'
				+     '<div class="lity-loader" aria-hidden="true">' + litySpip.strings.loading + '</div>'
				+     '<div class="lity-container">'
				+       '<div class="lity-content"></div>'
				+       '<button class="lity-close" type="button" aria-label="' + close_button_aria_label + '" title="' + litySpip.strings.close +'" data-lity-close>&times;</button>'
				+     '</div>'
				+   '</div>'
				+ '</dialog>';
			return t;
		}
	}

	jQuery.fn.extend({

		mediabox: function (options){

			var cfg = $.extend(litySpip.config, {template: litySpip.template()}, options);

			var href = cfg.href || ""; // content
			var galerie = !!cfg.slideshow || !!cfg.rel || false;

			if (!!cfg.className){
			//	cfg.variant = cfg.className;
			}
			// routage des callbacks
			litySpip.callbacks.onOpen = cfg.onOpen || false;
			litySpip.callbacks.onShow = cfg.onShow || false;
			litySpip.callbacks.onClose = cfg.onClose || false;

			if (this===jQuery.fn){
				lity(href, cfg);
				return this;
				//return (galerie) ? $.featherlightGallery(href, cfg) : $.featherlight(href, cfg);
			} else {
				var b = typeof (mediabox_settings)=='object' ? mediabox_settings : {};
				if (b.ns){
					this.find('[data-'+b.ns+'-type]').each(function (i, e){
						var $e = $(e);
						var d = $e.attr('data-'+b.ns+'-type');
						$e.removeAttr('data-'+b.ns+'-type').attr('data-lity-type', d);
					});
				}
				return this
					.data('lity-options', cfg)
					.on('click', lity);
				//return (galerie) ? this.featherlightGallery(cfg) : this.featherlight(cfg);
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
			if (litySpip.callbacks.onOpen) {
				litySpip.callbacks.onOpen(event, instance);
			}
		});
		$(document).on('lity:ready', function(event, instance) {
			console.log('Lity ready');
			litySpip.adjustHeight(instance);
			if (litySpip.callbacks.onShow) {
				litySpip.callbacks.onShow(event, instance);
			}
		});
		$(document).on('lity:close', function(event, instance) {
			console.log('Lity close');
			if (litySpip.callbacks.onClose) {
				litySpip.callbacks.onClose(event, instance);
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