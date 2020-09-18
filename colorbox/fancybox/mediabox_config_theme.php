<?php

if (!defined('_ECRIRE_INC_VERSION')) {
	return;
}

function mediabox_config_colorbox_fancybox($config) {

	$config['colorbox']['minHeight'] = false;
	$config['colorbox']['minWidth'] = false;

	return $config;
}
