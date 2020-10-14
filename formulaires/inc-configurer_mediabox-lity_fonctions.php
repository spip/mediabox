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

function mediabox_lity_lister_skins() {
	$skins = array('none' => array('nom' => _T('mediabox:label_aucun_style')));

	$maxfiles = 1000;
	$liste_fichiers = array();
	$recurs = array();
	foreach (creer_chemin() as $d) {
		$f = $d . 'lity/skins/';
		if (@is_dir($f)) {
			$liste = preg_files($f, 'lity[.]css$', $maxfiles - count($liste_fichiers), $recurs);
			foreach ($liste as $chemin) {
				$nom = substr(dirname($chemin), strlen($f));
				// ne prendre que les fichiers pas deja trouves
				// car find_in_path prend le premier qu'il trouve,
				// les autres sont donc masques
				if (!isset($liste_fichiers[$nom])) {
					$liste_fichiers[$nom] = $chemin;
				}
			}
		}
	}
	foreach ($liste_fichiers as $short => $fullpath) {
		$skins[$short] = array('nom' => basename($short));
		if (file_exists($f = dirname($fullpath) . '/vignette.jpg')) {
			$skins[$short]['img'] = $f;
		}
	}

	return $skins;
}
