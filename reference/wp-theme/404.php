<?php get_header(); ?>
<section class="error">
    <div>
        <h1>Uh-oh</h1>
        <p>It seems like something went wrong, and its totally, 100% unequivocally your fault.</p>
    </div>
    <a href="<?php echo get_home_url(); ?>">
        <button>
            <p class="caption">acknowledge I fucked up and</p>
            <p>Go to the homepage</p>
        </button>
    </a>
</section>

<?php get_footer(); ?>