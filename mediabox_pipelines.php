<?php

if (!defined('_ECRIRE_INC_VERSION')) {
	return;
}

function mediabox_colorbox_config($config) {

	$config['_libs']['colorbox'] = [
		'nom' => 'Colorbox',
		'css' => [],
		'js' => [
			'colorbox/js/jquery.colorbox.js',
			'colorbox/js/colorbox.mediabox.js',
		]
	];

	if (empty($config['colorbox'])) {
		$config['colorbox'] = [];
	}

	$config['colorbox'] = array_merge(
		[
			'skin' => 'black-striped',
			'transition' => 'elastic',
			'speed' => '200',
			'maxWidth' => '90%',
			'maxHeight' => '90%',
			'minWidth' => '400px',
			'minHeight' => '',
			'slideshow_speed' => '2500',
			'opacite' => '0.9',
		]
		, $config['colorbox']
	);

	if (!empty($config['colorbox']['skin'])
		and $box_skin = $config['colorbox']['skin']) {
		$config['_libs']['colorbox']['css'][] = ($config['_public'] ? '' : 'prive/') . "colorbox/{$box_skin}/colorbox.css";
	}


	return $config;
}

function mediabox_config($public = null) {
	include_spip('inc/filtres');
	include_spip('inc/config');
	$config = lire_config('mediabox', array());

	// conversion a la volee de l'ancienne config toute melangee
	if (empty($config['box_type']) and empty($config['colorbox']) and !empty($config['transition'])) {
		$config['box_type'] = 'colorbox';
		$config['colorbox'] = [];
		foreach (['skin', 'transition', 'speed', 'maxWidth', 'maxHeight', 'minWidth', 'minHeight', 'slideshow_speed', 'opacite'] as $k) {
			if (!empty($config[$k])) {
				$config['colorbox'][$k] = $config[$k];
				unset($config[$k]);
			}
		}
		ecrire_config('mediabox', $config);
	}

	$config = array_merge(array(
		'active' => 'oui',
		'namespace' => 'box',
		'traiter_toutes_images' => 'oui',
		'selecteur_galerie' => '#documents_portfolio a[type=\'image/jpeg\'],#documents_portfolio a[type=\'image/png\'],#documents_portfolio a[type=\'image/gif\']',
		'selecteur_commun' => '.mediabox',
		'splash_url' => '',
		'splash_width' => '600px',
		'splash_height' => '90%',
		'box_type' => 'colorbox',
	), $config);

	$config['_public'] = (is_null($public) ? !test_espace_prive() : !!$public);
	$config['_libs'] = [];

	if ($config['_public'] === false) {
		$config = array_merge($config, array(
			'active' => 'oui',
			'selecteur_galerie' => '#portfolios a[type^=\'image/\']',
			'selecteur_commun' => '.mediabox, .iconifier a[href$=jpg],.iconifier a[href$=png],.iconifier a[href$=gif]',
			'splash_url' => '',
			'box_type' => 'colorbox',
		));
		$config['colorbox'] = array_merge(
			$config['colorbox'] ?  $config['colorbox'] : [],
			[
				'skin' => 'white-shadow',
				'maxWidth' => '90%',
				'maxHeight' => '95%',
				'minWidth' => '600px',
				'minHeight' => '300px',
				'opacite' => '0.9',
			]
		);
	}

	// Gerer aussi les liens internes de SPIP
	if (!test_espace_prive() and $config['splash_url']) {
		include_spip('inc/filtres_ecrire');
		$config['splash_url'] = url_absolue(extraire_attribut(lien_article_virtuel($config['splash_url']), 'href'));
	}

	// declarer colorbox
	$config = mediabox_colorbox_config($config);

	// et d'autres boxs si besoin via un pipeline
	$config = pipeline('mediabox_config', $config);


	// charger la config du theme uniquement dans le public
	if (!test_espace_prive()
		and $box_type = $config['box_type']
		and !empty($config[$box_type]['skin'])
		and $box_skin = $config[$box_type]['skin']
		and include_spip("$box_type/$box_skin/mediabox_config_theme")
	  and function_exists($f = "mediabox_config_{$box_type}_$box_skin")
	  and $config_theme = $f($config)) {
		$config = $config_theme;
	}

	return $config;
}

function mediabox_insert_head_css($flux) {
	$config = mediabox_config();
	if ($config['active'] == 'oui') {

		$css_files = [];

		if ($box_type = $config['box_type']
		  and !empty($config['_libs'][$box_type]['css'])) {
			$css_files = array_merge($css_files, $config['_libs'][$box_type]['css']);
		}

		foreach($css_files as $file) {
			if ($f = find_in_path($file)) {
				if (substr($file, -5) === '.html') {
					$f = produire_fond_statique(substr($file, 0, -5), $config);
				}
				else {
					$f = timestamp(direction_css($f));
				}
				$flux .= "\n" . '<link rel="stylesheet" href="' . $f . '" type="text/css" media="all" />';
			}
		}

		/**
		 * Initialiser la config de la mediabox
		 */
		$js_config = [
			'auto_detect' => true,
			'ns' => $config['namespace'],
			'tt_img' => ($config['traiter_toutes_images'] == 'oui' ? 'true' : 'false'),
			'sel_g' => $config['selecteur_galerie'],
			'sel_c' => $config['selecteur_commun'],
			'str_ssStart' => unicode2charset(html2unicode(_T('mediabox:boxstr_slideshowStart'))),
			'str_ssStop' => unicode2charset(html2unicode(_T('mediabox:boxstr_slideshowStop'))),
			'str_cur' => unicode2charset(html2unicode(_T('mediabox:boxstr_current', array('current' => '{current}', 'total' => '{total}')))),
			'str_prev' => unicode2charset(html2unicode(_T('mediabox:boxstr_previous'))),
			'str_next' => unicode2charset(html2unicode(_T('mediabox:boxstr_next'))),
			'str_close' => unicode2charset(html2unicode(_T('mediabox:boxstr_close'))),
			'str_loading' => unicode2charset(html2unicode(_T('mediabox:boxstr_loading'))),
			'str_petc' => unicode2charset(html2unicode(_T('mediabox:boxstr_press_escape_to_close'))),
			'str_dialTitDef' => unicode2charset(html2unicode(_T('mediabox:boxstr_dialog_title_default'))),
			'str_dialTitMed' => unicode2charset(html2unicode(_T('mediabox:boxstr_dialog_title_medias'))),
			'splash_url' => $config['splash_url'],
		];
		// plus la config specifique de la box selectionnee
		if (!empty($config['box_type']) and !empty($config[$config['box_type']])) {
			$js_config[$config['box_type']] = $config[$config['box_type']];
		}
		// Si c'est une image, on la chargera avec une redimentionnement automatique
		// Sinon, chargement dans une iframe
		if ($config['splash_url']) {
			$extension = pathinfo($config['splash_url'], PATHINFO_EXTENSION);
			if (in_array($extension, ['gif', 'png', 'jpg', 'jpeg'])) {
				$js_config['splash_iframe'] = false;
			} else {
				$js_config['splash_iframe'] = true;
				$js_config['splash_width'] = $config['splash_width'];
				$js_config['splash_height'] = $config['splash_height'];
			}
		}
		$configmediabox = '<script type="text/javascript">/* <![CDATA[ */
var mediabox_settings=' . json_encode($js_config) . ';' . "\n";
		$flux = $configmediabox . '/* ]]> */</script>' . "\n" . $flux;
	}

	return $flux;
}

function mediabox_insert_head($flux) {
	$config = mediabox_config();
	if ($config['active'] == 'oui') {

		$js_files = [];
		if ($box_type = $config['box_type']
		and !empty($config['_libs'][$box_type]['js'])) {
			$js_files = array_merge($js_files, $config['_libs'][$box_type]['js']);
		}

		$js_files[] = 'javascript/spip.mediabox.js';
		if ($config['splash_url']) {
			$js_files[] = 'javascript/splash.mediabox.js';
		}
		foreach ($js_files as $file) {
			if ($f = find_in_path($file)) {
				$flux .= "\n". '<script src="' . timestamp($f) . '" type="text/javascript"></script>';
			}
		}
	}

	return $flux;
}

function mediabox_jquery_plugins($plugins) {
	$config = mediabox_config();
	if ($config['splash_url']) {
		$plugins[] = 'javascript/js.cookie.js';
	}

	return $plugins;
}
