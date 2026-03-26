<?php
// Get the post title and ID to calculate the seed
$postTitle = get_the_title();
$postID = get_the_ID();
$seed = $postID;  // Start with a unique seed based on post ID

for ($i = 0; $i < strlen($postTitle); $i++) {
    $seed += ord($postTitle[$i]);
}

// Define emojis and select one based on the seed
$emojis = ["🥶", "😵‍💫", "🤐", "👽", "🤖", "💄", "🦷", "🫀", "🪢", "🎩", "👑", "💍", "👓", "🦅", "🐞", "🕷️", "🕸️", "🐺", "🍁", "🍄", "🌚", "🪐", "🔥", "🌈", "❄️", "🥏", "🏵️", "🎹", "🎧", "🎼", "🎯", "🎲", "🚨", "🛸", "🚀", "⚓️", "⛱️", "⛺️", "⛩️", "🕹️", "💾", "🎚️", "📡", "💎", "⚔️", "🪬", "💊", "🎈", "🪞", "🪩", "🪭", "🥁", "🔌", "💀", "👠", "💍", "🍸", "🎲", "🚦", "📼", "🎛️", "🕳️", "🦠", "🧪", "🎀", "📎", "🖤", "❤️‍🔥", "♾️", "🟪", "📢", "♠️", "♣️", "♦️"];
$emojiIndex = $seed % count($emojis);
$selectedEmoji = $emojis[$emojiIndex];
?>

<?php
// Retrieve the publish date
$created_on = get_the_date('Y-m-d');

// Extract the year for the group name
$groupName = date('Y', strtotime($created_on));

// Format the date to remove slashes and use it for the article ID
$date_id = date('Ymd', strtotime($created_on));

// Get the audio file URL from ACF field
$audio_file_id = get_field('audio_file');
$audio_file_url = wp_get_attachment_url($audio_file_id);
?>

<article id="<?php echo esc_attr($date_id); ?>" class="card">
    <header>
        <h3 class="song name">
            <span class="random-emoji"><?php echo $selectedEmoji; ?></span>
            <?php echo $date_id; ?>
        </h3>

        <?php
        // Calculate date difference
        $publishDateObj = new DateTime($created_on);
        $today = new DateTime(date('Y/m/d'));
        $interval = $today->diff($publishDateObj)->days;

        // Show "New" label if the post is not older than 15 days
        if ($interval <= 30) {
            echo '<span class="new-label caption">New</span>';
        }
        ?>
    </header>

    <footer>
        <div class="song controls">
            <?php if ($audio_file_url) : ?>
            <audio id="audio-<?php echo esc_attr($date_id); ?>" src="<?php echo esc_url($audio_file_url); ?>"></audio>

            <button type="button" class="play"
                onclick="togglePlayPause('audio-<?php echo esc_attr($date_id); ?>', this)"><span
                    class="material-symbols-sharp icon play">play_arrow</span><span
                    class="material-symbols-sharp icon pause">pause</span></button>
            <?php endif; ?>
            <div class="song progress">
                <h5 class="song remaining-time" id="remaining-time-<?php echo esc_attr($date_id); ?>">
                    <div class="spinner"></div>
                </h5>
                <div class="song track inactive" onclick="seekAudio(event, 'audio-<?php echo esc_attr($date_id); ?>')"
                    data-audio-id="audio-<?php echo esc_attr($date_id); ?>">
                    <div class="song track active" style="width: 0%;"></div>
                </div>

            </div>
        </div>

        <button type="button" class="download" onclick="downloadSong(this)"
            data-group-name="<?php echo esc_attr($groupName); ?>" data-song-name="<?php echo esc_attr($date_id); ?>">
            <div class="tooltip caption waveText">Download project files</div>
            <span class="material-symbols-sharp icon">download_2</span>
        </button>
    </footer>
</article>