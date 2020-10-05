;
(function ($){
	/*
	 *  Implémentation de mediabox basée sur Lity
	 *  https://sorgalla.com/lity/
	 */

	_lityConfig = {};
	_lityCallbacks = {
		onOpen: false,
		onShow: false,
		onClose: false
	};

	jQuery.fn.extend({

		mediabox: function (options){

			var cfg = $.extend(_lityConfig, options);

			var href = cfg.href || ""; // content
			var galerie = !!cfg.slideshow || !!cfg.rel || false;

			if (!!cfg.className){
			//	cfg.variant = cfg.className;
			}
			// routage des callbacks
			_lityCallbacks.onOpen = cfg.onOpen || false;
			_lityCallbacks.onShow = cfg.onShow || false;
			_lityCallbacks.onClose = cfg.onClose || false;

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

		_lityConfig['template'] = '<dialog class="box_mediabox box_modalbox lity" role="dialog" aria-label="Dialog Window (Press escape to close)" tabindex="-1"><div class="lity-wrap" data-lity-close role="document"><div class="lity-loader" aria-hidden="true">Loading...</div><div class="lity-container"><div class="lity-content"></div><button class="lity-close" type="button" aria-label="Close (Press escape to close)" data-lity-close>&times;</button></div></div></dialog>';

		$(document).on('lity:open', function(event, instance) {
		    console.log('Lity opened');
		    if (_lityCallbacks.onOpen) {
			    _lityCallbacks.onOpen(event, instance);
		    }
		});
		$(document).on('lity:ready', function(event, instance) {
		    console.log('Lity ready');
				$content = instance.content();
				$containerHeight = jQuery('.lity-container').height();
				if ($containerHeight) {
					$content.css('max-height', Math.round($containerHeight) + 'px')
				}
		    if (_lityCallbacks.onShow) {
			    _lityCallbacks.onShow(event, instance);
		    }
		});
		$(document).on('lity:close', function(event, instance) {
		    console.log('Lity close');
		    if (_lityCallbacks.onClose) {
			    _lityCallbacks.onClose(event, instance);
		    }
		});
		$(document).on('lity:resize', function(event, instance) {
		    console.log('Lity resize');
				$content = instance.content();
				$containerHeight = jQuery('.lity-container').height();
				if ($containerHeight) {
					$content.css('max-height', Math.round($containerHeight) + 'px')
				}
		});

	}
	// on écrase la config juste une fois
	initConfig();

})(jQuery);