<?php get_header(); ?>

<hgroup id="intro">
    <div class="end-bar"></div>
    <span id="anchor-license"></span>
    <h1><?php bloginfo('name'); ?></h1>
    <p id="license">
        Here's a stash of music ideas I've been hoarding in a drawer (until now), published under <a class="waveText"
            href="https://creativecommons.org/publicdomain/zero/1.0/?ref=chooser-v1" target="_blank">CC0
            1.0 license</a>, and that means you can use these tunes for anything really – 🔥 spice up your media
        projects, ✂️ remix them, 💶
        sell them or 💦 masturbate to them. No judgment here.
    </p>
    <p>You don't have to worry about
        giving credit, but if you do, that's cool. And you want to be cool, right?</p>

    <div class="divider">
        <div class="inner"><?php include get_stylesheet_directory() . '/assets/images/divider.svg'; ?></div>
    </div>
    <small>
        Some of these projects may (wink wink) use unlicensed samples. Do with this information whatever you
        want.
    </small>
</hgroup>

<?php
// Fetch all posts, sorted by post date in descending order
$args = array(
    'post_type'      => 'post',
    'posts_per_page' => -1, // Get all posts
    'orderby'        => 'date',
    'order'          => 'DESC'
);
$all_posts = new WP_Query($args);

// Variable to track the year
$current_year = null;

if ($all_posts->have_posts()) :
    while ($all_posts->have_posts()) : $all_posts->the_post();
        $post_year = get_the_date('Y'); // Get the year of the current post

        // Check if this post's year is different from the current year being processed
        if ($post_year !== $current_year) {
            // Close previous year section and grid div if not the first section
            if ($current_year !== null) {
                echo '</div></section>';
            }

            $current_year = $post_year; // Update the current year to this post's year

            // Start a new section for the new year
            echo '<section>';
            echo '<div class="end-bar"></div>';
            echo '<h2>' . $current_year . '</h2>';
            echo '<div class="carousel">';
            echo '<div class="grid grab">';
        }

        // Include the card.php for the current post
        get_template_part('components/card');

    endwhile;

    // Close the last opened div and section tags
    echo '</div></div></section>';
else :
    echo '<p>No posts found.</p>';
endif;

// Reset post data to avoid conflicts
wp_reset_postdata();
?>
<span id="anchor-end"></span>
<?php get_footer(); ?>