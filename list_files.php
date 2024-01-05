<?php
function listFolderFiles($dir){
    $ffs = scandir($dir);
    $emojis = ["🥶", "😵‍💫", "👽", "🤖", "💄", "🦷", "🫀", "🪢", "🎩", "👑", "💍", "👓", "🦅", "🐞", "🕷️", "🕸️", "🐺", "🍁", "🍄", "🌚", "🪐", "🔥", "🌈", "❄️", "🥏", "🏵️", "🎹", "🎧", "🎼", "🎯", "🎲", "🚨", "🛸", "🚀", "⚓️", "⛱️", "⛺️", "⛩️", "🕹️", "💾", "🎚️", "📡", "💎", "⚔️", "🪬", "💊", "🎈", "🪞", "🪩", "🪭", "🥁"]; // Add more emojis if you like

    foreach ($ffs as $ff) {
      if ($ff[0] === '.') continue; // Skip files/folders starting with a dot
  
      if (is_dir($dir.'/'.$ff)) {
          echo "<div class='year'>";
          echo "<h2>" . htmlspecialchars($ff) . "</h2>"; // First-level folder name unchanged
          echo "<ul>";
          foreach (scandir($dir.'/'.$ff) as $subff) {
            if ($subff[0] === '.') continue; // Skip sub-files/folders starting with a dot

            // Generate a consistent random index based on folder name
            $emojiIndex = consistentRandom($subff, count($emojis));
            $emoji = $emojis[$emojiIndex];

            // Reformat second-level folder name to date format
            $formattedName = substr($subff, 0, 4) . "/" . substr($subff, 4, 2) . "/" . substr($subff, 6);

            // Reading SVG files
            $playIcon = file_get_contents("assets/icon-play.svg");
            $downloadIcon = file_get_contents("assets/icon-download.svg");

            echo "<li class='folder-content'>";
            echo "<div class='emoji'>" . $emoji . "</div>";
            echo "<h3>"  . htmlspecialchars($formattedName) . "</h3>";
            echo "<div class='media-controls'>";
            echo "<span class='playbar'>[Playbar Placeholder]</span>";
            echo "<div class='icon-container'>";
            echo "<button class='icon-button play-button' title='Play'>" . $playIcon . "<span class='popover'>Play</span></button>";
            echo "<button class='icon-button download-button' onclick='window.location.href=\"download.php?folder=" . urlencode($dir.'/'.$subff) . "\"'>" . $downloadIcon . "<span class='popover'>Download project</span></button>";
            echo "</div>"; // End of icon-container
            echo "</div>"; // End of media-controls
            echo "</li>";
          }
          echo "</ul>";
          echo "</div>";
        }
    }
}

function consistentRandom($string, $max) {
    $hash = 0;
    for ($i = 0; $i < strlen($string); $i++) {
        $hash = (ord($string[$i]) + ($hash << 5) - $hash) % $max;
    }
    return $hash;
}
?>
