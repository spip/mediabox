;(function ($) {
	/* 
	 * Implémentation de mediabox basée sur colorbox http://www.jacklmoore.com/colorbox/
	 */
	jQuery.fn.extend({

		mediabox: function(options) {

			var cfg = $.extend(options,{});
			var b = typeof(box_settings) == 'object' ? box_settings : {};

			// completer le type
			var type = (this === jQuery.fn) ? cfg.type : this.data(b.ns+'-type');

			// routage de la syntaxe : {type:"ajax"} devient {ajax:true}
			if (type === 'image') cfg['photo'] = true;
			else if (type === 'html') cfg['inline'] = true;
			else if (type) cfg[type] = true;			

			// en mode iframe ou image, on spécifie largeur/hauteur
			if (cfg['iframe'] || cfg['photo']) {
				cfg['width'] =  cfg['width'] || '95%';
				cfg['height'] =  cfg['height'] ||  '95%';
			}
			// routage des callbacks
			if (!!cfg.onOpen) {
				cfg.onLoad = cfg.onOpen;
			}
			if (!!cfg.onShow) {
				cfg.onComplete = cfg.onShow;
			}
			if (!!cfg.onClose) {
				cfg.onClosed = cfg.onClose;
			}			

			if (this === jQuery.fn) {
				return $.colorbox(cfg);
			}
			else {	
				return this.colorbox(cfg);
			}
		},

		mediaboxClose : function() {	
			$.fn.colorbox.close();
		}

	});	

	var initConfig = function() {

			var b = typeof(box_settings) == 'object' ? box_settings : {};

			var cbox_options = {
				overlayClose: true,
				iframe: false,
				transition:b.trans || 'elastic',
				speed:b.speed || 350,
				maxWidth:b.maxW || false,
				maxHeight:b.maxH || false,
				minWidth:b.minW || false,
				minHeight:b.minH || false,
				opacity:b.opa || '0.85',
				slideshowStart:b.str_ssStart,
				slideshowStop:b.str_ssStop,
				current:b.str_current,
				previous:b.str_prev,
				next:b.str_next,
				close:b.str_close,
				//initialWidth:b.minWidth || 300,
				//initialHeight:b.minHeight || 100,
				onOpen:b.onOpen || $.noop(),
				//onLoad:$.noop(), // hors API
				onComplete:b.onShow || $.noop(),
				//onCleanup:|| $.noop(), // hors API
				onClosed:b.onClose || $.noop(),				
			};

			if (typeof($.colorbox) == 'function') {
				$.colorbox.settings = $.extend($.colorbox.settings,cbox_options);
			}
	}
	// on écrase la config juste une fois
	initConfig();

	// relancer ajaxload au chargement de la box
	$(document).on('cbox_complete', function(){
	  if (typeof(jQuery.spip.triggerAjaxLoad) != 'undefined') jQuery.spip.triggerAjaxLoad('#colorbox');
	});

})(jQuery);
