;(function ($) {
	/* 
	 * Implémentation de mediabox basée sur colorbox http://www.jacklmoore.com/colorbox/
	 */
	jQuery.fn.extend({

		mediabox: function(options) {

			var cfg = $.extend(options,{});
			var b = typeof(mediabox_settings) == 'object' ? mediabox_settings : {};

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

			var b = typeof(mediabox_settings) == 'object' ? mediabox_settings : {};
console.log(b.colorbox);
			var cbox_options = {
				overlayClose: true,
				iframe: false,
				transition:b.colorbox.transition || 'elastic',
				speed:b.colorbox.speed || 350,
				maxWidth:b.colorbox.maxWidth || false,
				maxHeight:b.colorbox.maxHeight || false,
				minWidth:b.colorbox.minWidth || false,
				minHeight:b.colorbox.minHeight || false,
				opacity:b.colorbox.opacity || '0.85',
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
		console.log(cbox_options);
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
