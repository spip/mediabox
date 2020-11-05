jQuery(function($){
	// poser le cookie au callback de la box chargee
	var set_cookie = function() {
		Cookies.set("modalsplash", mediabox_settings.splash_url, { expires: 7 });
	}

	$.modalboxsplash = function(href, options) {
		if (mediabox_settings.splash_iframe) {
			options = $.extend({
				type: 'iframe',
				width: mediabox_settings.splash_width || '',
				height: mediabox_settings.splash_height || ''
			});
		}
		$.modalbox(href,$.extend({onShow:set_cookie},options));
	};
	// ouvrir la splash page si pas deja vue
	if (Cookies.get("modalsplash") != mediabox_settings.splash_url) {
		$.modalboxsplash(mediabox_settings.splash_url);
	}
});