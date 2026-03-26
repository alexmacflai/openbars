function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds}`;
}

function setDefaultRemainingTime() {
  document.querySelectorAll(".remaining-time").forEach((element) => {
    element.textContent = "0:00";
  });
}

function updateRemainingTime(audio) {
  const audioIdWithoutPrefix = audio.id.replace("audio-", "");
  const remainingTimeDisplay = document.getElementById(`remaining-time-${audioIdWithoutPrefix}`);
  const progressBarActive = document.querySelector(
    `[data-audio-id="${audio.id}"] .song.track.active`,
  );

  if (!remainingTimeDisplay || Number.isNaN(audio.duration) || !progressBarActive) {
    return;
  }

  const remaining = audio.duration - audio.currentTime;
  remainingTimeDisplay.textContent = formatTime(remaining);
  progressBarActive.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
}

function setFullDurationOnLoad(audio) {
  const audioIdWithoutPrefix = audio.id.replace("audio-", "");
  const remainingTimeDisplay = document.getElementById(`remaining-time-${audioIdWithoutPrefix}`);

  if (remainingTimeDisplay && !Number.isNaN(audio.duration)) {
    remainingTimeDisplay.textContent = formatTime(audio.duration);
  }
}

function resetAudioUI(audio) {
  const audioIdWithoutPrefix = audio.id.replace("audio-", "");
  const remainingTimeDisplay = document.getElementById(`remaining-time-${audioIdWithoutPrefix}`);
  const progressBarActive = document.querySelector(
    `[data-audio-id="${audio.id}"] .song.track.active`,
  );
  const card = audio.closest("article");
  if (remainingTimeDisplay && !Number.isNaN(audio.duration)) {
    remainingTimeDisplay.textContent = formatTime(audio.duration);
  }

  if (progressBarActive) {
    progressBarActive.style.width = "0%";
    progressBarActive.parentElement?.classList.remove("previewing");
  }

  if (card) {
    card.classList.remove("playing");
    card.classList.remove("paused");
  }
}

function setPausedAudioUI(audio) {
  const audioIdWithoutPrefix = audio.id.replace("audio-", "");
  const remainingTimeDisplay = document.getElementById(`remaining-time-${audioIdWithoutPrefix}`);
  const progressBarActive = document.querySelector(
    `[data-audio-id="${audio.id}"] .song.track.active`,
  );
  const track = document.querySelector(`[data-audio-id="${audio.id}"]`);
  const card = audio.closest("article");
  if (remainingTimeDisplay && !Number.isNaN(audio.duration)) {
    const remaining = audio.duration - audio.currentTime;
    remainingTimeDisplay.textContent = formatTime(remaining);
  }

  if (progressBarActive && !Number.isNaN(audio.duration)) {
    progressBarActive.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
  }

  track?.classList.remove("previewing");

  if (card) {
    card.classList.remove("playing");
    card.classList.add("paused");
  }
}

function togglePlayPause(audioId, button) {
  const audio = document.getElementById(audioId);

  if (!audio) {
    return;
  }

  document.querySelectorAll("audio").forEach((otherAudio) => {
    if (otherAudio !== audio && !otherAudio.paused) {
      otherAudio.pause();
      setPausedAudioUI(otherAudio);
    }
  });

  if (audio.paused || audio.ended) {
    audio.play();
    const card = audio.closest("article");
    card?.classList.add("playing");
    card?.classList.remove("paused");
  } else {
    audio.pause();
    setPausedAudioUI(audio);
  }
}

function seekAudio(event, audioId) {
  const audio = document.getElementById(audioId);
  const playButton = document.querySelector(`button[data-audio-id="${audioId}"]`);
  const track = event.currentTarget;

  if (!audio || Number.isNaN(audio.duration) || !(track instanceof HTMLElement)) {
    return;
  }

  const clickX = event.offsetX;
  const totalWidth = track.offsetWidth;
  audio.currentTime = (clickX / totalWidth) * audio.duration;
  track.classList.remove("previewing");
  updateRemainingTime(audio);

  if ((audio.paused || audio.ended) && playButton instanceof HTMLElement) {
    togglePlayPause(audioId, playButton);
  }
}

function previewSeekPosition(event, track) {
  const audioId = track.dataset.audioId;
  const audio = audioId ? document.getElementById(audioId) : null;
  const progressBarActive = track.querySelector(".song.track.active");

  if (!audioId || !(audio instanceof HTMLAudioElement) || !audio.paused || !progressBarActive) {
    return;
  }

  const totalWidth = track.offsetWidth;
  if (totalWidth <= 0) {
    return;
  }

  const pointerX = event.offsetX;
  const previewProgress = Math.min(Math.max(pointerX / totalWidth, 0), 1);

  track.classList.add("previewing");
  progressBarActive.style.width = `${previewProgress * 100}%`;
}

function clearSeekPreview(track) {
  const audioId = track.dataset.audioId;
  const audio = audioId ? document.getElementById(audioId) : null;
  const progressBarActive = track.querySelector(".song.track.active");

  if (!audioId || !(audio instanceof HTMLAudioElement) || !audio.paused || !progressBarActive) {
    return;
  }

  const progress =
    !Number.isNaN(audio.duration) && audio.duration > 0 ? (audio.currentTime / audio.duration) * 100 : 0;
  progressBarActive.style.width = `${progress}%`;

  window.setTimeout(() => {
    if (audio.paused) {
      track.classList.remove("previewing");
    }
  }, 100);
}

function splitWaveText() {
  document.querySelectorAll(".waveText").forEach((element) => {
    const text = element.textContent ?? "";
    let newHtml = "";
    let globalCharIndex = 0;

    text.split(" ").forEach((word, wordIndex, words) => {
      let wordHtml = '<span class="word">';

      word.split("").forEach((character) => {
        const classIndex = (globalCharIndex % 12) + 1;
        wordHtml += `<span class="letter n-${classIndex}">${character}</span>`;
        globalCharIndex += 1;
      });

      wordHtml += "</span>";
      newHtml += wordIndex < words.length - 1 ? `${wordHtml} ` : wordHtml;
    });

    element.innerHTML = newHtml;
  });
}

function setupHeaderScroll() {
  const header = document.getElementById("header");
  if (!header) {
    return;
  }

  window.addEventListener("scroll", () => {
    if (window.scrollY > 200) {
      header.classList.add("show");
    } else {
      header.classList.remove("show");
    }
  });
}

function setupDividerScroll() {
  window.addEventListener("scroll", () => {
    const dividerInner = document.querySelector(".divider .inner");
    if (!dividerInner) {
      return;
    }

    const scrollPosition = window.scrollY;
    if (scrollPosition >= 0 && scrollPosition <= 600) {
      const progress = scrollPosition / 600;
      const translateValue = -100 + progress * 200;
      const translateRem =
        translateValue / parseFloat(getComputedStyle(document.documentElement).fontSize);
      dividerInner.style.setProperty("--divider-offset", `${translateRem}rem`);
    }
  });
}

function setupGrabScroll() {
  document.querySelectorAll(".grab").forEach((slider) => {
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    slider.addEventListener("mousedown", (event) => {
      isDown = true;
      slider.classList.add("active");
      startX = event.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
    });

    slider.addEventListener("mouseleave", () => {
      isDown = false;
      slider.classList.remove("active");
    });

    slider.addEventListener("mouseup", () => {
      isDown = false;
      slider.classList.remove("active");
    });

    slider.addEventListener("mousemove", (event) => {
      if (!isDown) {
        return;
      }

      event.preventDefault();
      const x = event.pageX - slider.offsetLeft;
      slider.scrollLeft = scrollLeft - (x - startX) * 4;
    });
  });
}

function setupPlayerUi() {
  document.querySelectorAll("audio").forEach((audio) => {
    audio.addEventListener("loadedmetadata", () => setFullDurationOnLoad(audio));
    audio.addEventListener("ended", () => resetAudioUI(audio));
    audio.addEventListener("timeupdate", () => updateRemainingTime(audio));
  });

  document.querySelectorAll("button[data-audio-id]").forEach((button) => {
    button.addEventListener("click", () => togglePlayPause(button.dataset.audioId, button));
  });

  document.querySelectorAll(".song.track.inactive").forEach((track) => {
    track.addEventListener("mousemove", (event) => previewSeekPosition(event, track));
    track.addEventListener("mouseleave", () => clearSeekPreview(track));
    track.addEventListener("click", (event) => seekAudio(event, track.dataset.audioId));
  });
}

function setupCardLinkCopy() {
  document.querySelectorAll(".card .song.name").forEach((songName) => {
    songName.addEventListener("click", async (event) => {
      event.stopPropagation();

      const card = songName.closest(".card");
      if (!card) {
        return;
      }

      const urlToCopy = `${window.location.origin}${window.location.pathname}#${card.id}`;

      try {
        await navigator.clipboard.writeText(urlToCopy);
        const snackbar = document.querySelector(".snackbar");
        snackbar?.classList.add("active");
        window.setTimeout(() => snackbar?.classList.remove("active"), 2500);
      } catch (error) {
        console.error("Failed to copy the URL:", error);
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setDefaultRemainingTime();
  splitWaveText();
  setupHeaderScroll();
  setupDividerScroll();
  setupGrabScroll();
  setupPlayerUi();
  setupCardLinkCopy();
});
