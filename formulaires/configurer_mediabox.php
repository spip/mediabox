<?php
/*
 * Plugin xxx
 * (c) 2009 xxx
 * Distribue sous licence GPL
 *
 */

if (!defined('_ECRIRE_INC_VERSION')) {
	return;
}

include_spip('mediabox_pipelines');


function mediabox_presenter_selection_skins($skins, $selected, $name = 'skin') {
	$out = '';
	if (!is_array($skins) or !count($skins)) {
		return $out;
	}

	foreach ($skins as $k => $skin) {
		$id = preg_replace(',[^a-z0-9_],i', '_', "${name}_{$k}");
		$sel = ($selected == "$k" ? " checked='checked'" : '');
		$balise_img = chercher_filtre('balise_img');
		$label = isset($skin['img']) ?
			'<a href="' . $skin['img'] . '" class="mediabox" rel="habillage">' . $balise_img($skin['img'],
				$skin['nom']) . '</a>'
			: $skin['nom'];

		$out .= "<div class='choix choix-skin'>";
		$out .= "<input type='radio' name='$name' id='$id' value='$k'$sel />";
		$out .= "<label for='$id'>$label</label>";
		$out .= "</div>\n";
	}

	$out = "<div class='choix clearfix'>$out</div>";

	return $out;
}


function formulaires_configurer_mediabox_charger_dist() {
	$valeurs = mediabox_config(true);

	return $valeurs;
}

function formulaires_configurer_mediabox_traiter_dist() {
	$config = mediabox_config(true);

	include_spip('inc/meta');
	if (_request('reinit')) {
		foreach ($config as $k => $v) {
			set_request($k);
		}
		effacer_meta('mediabox');
	} else {
		// cas particulier de la checkbox :
		if (!_request('active')) {
			set_request('active', 'non');
		}
		foreach ($config as $k => $v) {
			if (strpos($k, '_') === 0) {
				unset($config[$k]);
			}
			else {
				if (!is_null(_request($k))) {
					$config[$k] = _request($k);
				}
			}
		}
		ecrire_meta('mediabox', serialize($config));
	}

	return array('message_ok' => _T('config_info_enregistree'), 'editable' => true);
}
