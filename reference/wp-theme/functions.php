<?php

function openbars_enqueue_custom_scripts()
{
    wp_enqueue_script('custom-player', get_stylesheet_directory_uri() . '/libs/player.js', array('jquery'), null, true);
}
add_action('wp_enqueue_scripts', 'openbars_enqueue_custom_scripts');


function my_theme_enqueue_scripts()
{
    // Register the script
    wp_register_script('download-song', get_stylesheet_directory_uri() . '/libs/scripts.js', array(), '1.0.0', true);

    // Enqueue the script
    wp_enqueue_script('download-song');
}

add_action('wp_enqueue_scripts', 'my_theme_enqueue_scripts');


// Custom fonts
function theme_enqueue_styles()
{
    wp_enqueue_style('custom-fonts', get_stylesheet_directory_uri() . '/libs/custom-fonts.css');
}

add_action('wp_enqueue_scripts', 'theme_enqueue_styles');


// Add Google Fonts

function mytheme_add_preconnect_fonts()
{
    echo '<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>';
    echo '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>';
}

add_action('wp_head', 'mytheme_add_preconnect_fonts');

function mytheme_enqueue_google_fonts()
{
    // Enqueue Noto Sans Mono and Material Symbols Outlined fonts

    wp_enqueue_style('noto-sans-mono', 'https://fonts.googleapis.com/css2?family=Noto+Sans+Mono:wght@100..900&display=swap', [], null);
    wp_enqueue_style('material-symbols-outlined', 'https://fonts.googleapis.com/css2?family=Material+Symbols+Sharp:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap', [], null);
}

add_action('wp_enqueue_scripts', 'mytheme_enqueue_google_fonts');


// Get rid of pages not needed

function custom_redirect_wp_pages()
{
    if (is_single() || is_attachment() || is_category() || is_comments_popup() || is_archive()) {
        wp_redirect(home_url(), 301); // Use a 301 redirect for better SEO.
        exit;
    }
}
add_action('template_redirect', 'custom_redirect_wp_pages');


// Add favicon
function yourtheme_add_favicon()
{
    echo '<link rel="icon" href="' . get_stylesheet_directory_uri() . '/assets/images/favicon.png" />';
}
add_action('wp_head', 'yourtheme_add_favicon');
