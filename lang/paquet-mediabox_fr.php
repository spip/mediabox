<?php

// Ceci est un fichier langue de SPIP -- This is a SPIP language file
// Fichier produit par PlugOnet
// Module: paquet-mediabox
// Langue: fr
// Date: 30-07-2011 15:01:37
// Items: 2

if (!defined('_ECRIRE_INC_VERSION')) return;

$GLOBALS[$GLOBALS['idx_lang']] = array(

// M
	'mediabox_description' => 'Par défaut, tous les liens vers des images (avec un attribut type décrivant le mime/type de l\'image) ainsi que
les liens avec la classe <code>.mediabox</code> sont enrichis par la boîte multimedia.

Il est possible de configurer chaque lien au cas par cas avec des classes supplémentaires :
-* <code>boxIframe</code> permet de demander à ouvrir le lien dans une boîte en iframe ;
-* <code>boxWidth-350px</code> permet de spécifier une largeur de 350px pour la boite ;
-* <code>boxHeight-90pc</code> permet de spécifier une hauteur de 90% pour la boite ;

Un panneau de configuration vous permet de modifier les réglages généraux à votre convenance,
ainsi que l\'aspect de la boîte parmi les habillages disponibles.

Ce plugin fonctionne sur les squelettes disposant de la balise <code>#INSERT_HEAD</code>',
	'mediabox_slogan' => 'Boîte multimédia',
);
?>