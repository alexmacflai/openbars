// Function to format seconds into MM:SS format
function formatTime(seconds) {
  var minutes = Math.floor(seconds / 60);
  seconds = Math.floor(seconds % 60);
  // Add a leading zero to seconds if less than 10
  seconds = seconds < 10 ? "0" + seconds : seconds;
  // Only add a leading zero to minutes if 10 minutes or more
  minutes = minutes < 10 ? minutes : "0" + minutes;
  return minutes + ":" + seconds;
}

// Immediately set the default remaining time text on all spans
function setDefaultRemainingTime() {
  var allRemainingTimeSpans = document.querySelectorAll(".remaining-time");
  allRemainingTimeSpans.forEach(function (span) {
    span.textContent = "0:00";
  });
}

// Function to update the remaining time display
function updateRemainingTime(audio) {
  var audioIdWithoutPrefix = audio.id.replace("audio-", "");
  var remainingTimeDisplay = document.getElementById("remaining-time-" + audioIdWithoutPrefix);
  var progressBarActive = document.querySelector(`[data-audio-id="${audio.id}"] .song.track.active`);

  if (remainingTimeDisplay && !isNaN(audio.duration)) {
    var remaining = audio.duration - audio.currentTime;
    remainingTimeDisplay.textContent = formatTime(remaining);

    // Update the width of the active track based on the elapsed time
    var elapsedTimeRatio = audio.currentTime / audio.duration;
    progressBarActive.style.width = elapsedTimeRatio * 100 + "%";
  }
}

// Set the full duration on page load
function setFullDurationOnLoad(audio) {
  var audioIdWithoutPrefix = audio.id.replace("audio-", "");
  var remainingTimeDisplay = document.getElementById("remaining-time-" + audioIdWithoutPrefix);

  // Function to update the display
  var updateRemainingTimeDisplay = function () {
    if (remainingTimeDisplay && !isNaN(audio.duration)) {
      remainingTimeDisplay.textContent = formatTime(audio.duration);
    }
  };

  // Initial check
  updateRemainingTimeDisplay();

  // Recheck after 1 second
  setTimeout(function () {
    updateRemainingTimeDisplay();
  }, 2000);
}

// Event listener for when the audio's metadata has loaded
document.addEventListener("DOMContentLoaded", function () {
  var allAudioElements = document.getElementsByTagName("audio");
  Array.prototype.forEach.call(allAudioElements, function (audio) {
    // Initialize UI based on audio metadata
    audio.addEventListener("loadedmetadata", function () {
      setFullDurationOnLoad(audio);
    });
    // Reset UI when audio ends
    audio.addEventListener("ended", function () {
      resetAudioUI(audio);
    });
  });
});

// Resets when audio stops naturally
function resetAudioUI(audio) {
  // Clear the interval for updating the UI, if it's set
  if (audio.timeUpdateInterval) {
    clearInterval(audio.timeUpdateInterval);
  }

  // Reset the remaining time to show the full duration
  var audioIdWithoutPrefix = audio.id.replace("audio-", "");
  var remainingTimeDisplay = document.getElementById("remaining-time-" + audioIdWithoutPrefix);
  if (remainingTimeDisplay && !isNaN(audio.duration)) {
    remainingTimeDisplay.textContent = formatTime(audio.duration);
  }

  // Reset the progress bar to 0%
  var progressBarActive = document.querySelector(`[data-audio-id="${audio.id}"] .song.track.active`);
  if (progressBarActive) {
    progressBarActive.style.width = "0%";
  }

  // Locate the play/pause button associated with the audio that just ended.
  var playButton = audio.closest(".song.controls").querySelector("button");
  if (playButton) {
    // Ensure the button's class is correctly set to "play", indicating the audio is not playing.
    playButton.classList.remove("pause");
    playButton.classList.add("play");

    // // Also update the icon span text if necessary.
    // var iconSpan = playButton.querySelector(".icon");
    // if (iconSpan) {
    //   iconSpan.textContent = "play_arrow";
    // }
  }

  // Remove 'playing' class from the card
  var card = audio.closest("article");
  if (card) {
    card.classList.remove("playing");
  }

  // Remove 'playing' class from the card
  var card = audio.closest("article");
  if (card) card.classList.remove("playing");
}

// The main toggle function, modified to ensure only one audio plays at a time
function togglePlayPause(audioId, btn) {
  var audio = document.getElementById(audioId);
  var allAudioElements = document.getElementsByTagName("audio");

  // Loop through all audio elements and pause any that are playing
  Array.prototype.forEach.call(allAudioElements, function (el) {
    if (el !== audio && !el.paused) {
      el.pause();
      clearInterval(el.timeUpdateInterval);
      var otherPlayButton = el.closest(".song.controls").querySelector(".pause");
      if (otherPlayButton) {
        otherPlayButton.classList.remove("pause");
        otherPlayButton.classList.add("play");
        var otherIconSpan = otherPlayButton.querySelector(".icon");
        // otherIconSpan.textContent = "play_arrow";
      }
      var otherCard = el.closest("article");
      if (otherCard) otherCard.classList.remove("playing");
    }
  });

  // Play or pause the current audio element
  if (audio.paused || audio.ended) {
    audio.play();
    btn.classList.remove("play");
    btn.classList.add("pause");
    var iconSpan = btn.querySelector(".icon");
    // iconSpan.textContent = "pause"; // Update the icon's text
    var card = audio.closest("article");
    if (card) card.classList.add("playing");
    audio.timeUpdateInterval = setInterval(function () {
      updateRemainingTime(audio);
    }, 1000);
  } else {
    audio.pause();
    btn.classList.remove("pause");
    btn.classList.add("play");
    var iconSpan = btn.querySelector(".icon");
    // iconSpan.textContent = "play_arrow"; // Update the icon's text
    var card = audio.closest("article");
    if (card) card.classList.remove("playing");
    clearInterval(audio.timeUpdateInterval);
  }
}

// Calculate where the user clicked on the progress bar and seek the audio to that point
function seekAudio(event, audioId) {
  var audio = document.getElementById(audioId);
  // Calculate the clicked position as a ratio of the total width
  var clickX = event.offsetX;
  var totalWidth = event.currentTarget.offsetWidth;
  var clickRatio = clickX / totalWidth;
  var audioDuration = audio.duration;

  // Set the audio current time
  audio.currentTime = clickRatio * audioDuration;

  // Explicitly call updateRemainingTime to refresh the span text
  updateRemainingTime(audio);
}

// Update the progress bar, which can be called from both seekAudio and updateRemainingTime
function updateProgressBar(audio) {
  var audioIdWithoutPrefix = audio.id.replace("audio-", "");
  var progressBarActive = document.querySelector(`[data-audio-id="${audio.id}"] .song.track.active`);

  if (!isNaN(audio.duration)) {
    // Update the width of the active track based on the elapsed time
    var elapsedTimeRatio = audio.currentTime / audio.duration;
    progressBarActive.style.width = elapsedTimeRatio * 100 + "%";
  }
}

// Copy link to song on card click
document.addEventListener("DOMContentLoaded", () => {
  // Attach click event listeners only to the <h3 class="song name"> elements within cards
  document.querySelectorAll(".card .song.name").forEach((songName) => {
    songName.addEventListener("click", function (event) {
      event.stopPropagation(); // Prevent the event from bubbling up

      const card = this.closest(".card");
      const cardId = card.getAttribute("id");
      const urlToCopy = `${window.location.origin}${window.location.pathname}#${cardId}`;

      // Use the Clipboard API to copy the URL
      navigator.clipboard
        .writeText(urlToCopy)
        .then(() => {
          console.log("URL copied to clipboard:", urlToCopy);

          // Show the snackbar
          const snackbar = document.querySelector(".snackbar");
          snackbar.classList.add("active");

          // Remove the "active" class after 3 seconds
          setTimeout(() => {
            snackbar.classList.remove("active");
          }, 2500);
        })
        .catch((err) => {
          console.error("Failed to copy the URL:", err);
        });
    });
  });
});
