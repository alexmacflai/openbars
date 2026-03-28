const CARD_PULSE_INTERVAL_MS = 400;
const EMOJIS = [
  "🥶",
  "😵‍💫",
  "🤐",
  "👽",
  "🤖",
  "💄",
  "🦷",
  "🫀",
  "🪢",
  "🎩",
  "👑",
  "💍",
  "👓",
  "🦅",
  "🐞",
  "🕷️",
  "🕸️",
  "🐺",
  "🍁",
  "🍄",
  "🌚",
  "🪐",
  "🔥",
  "🌈",
  "❄️",
  "🥏",
  "🎹",
  "🎧",
  "🎼",
  "🎯",
  "🎲",
  "🚨",
  "🛸",
  "🚀",
  "⚓️",
  "⛱️",
  "⛺️",
  "⛩️",
  "🕹️",
  "💾",
  "🎚️",
  "📡",
  "💎",
  "⚔️",
  "🪬",
  "💊",
  "🎈",
  "🪞",
  "🪩",
  "🪭",
  "🥁",
  "🔌",
  "💀",
  "👠",
  "💍",
  "🍸",
  "🎲",
  "🚦",
  "📼",
  "🎛️",
  "🕳️",
  "🦠",
  "🧪",
  "🎀",
  "📎",
  "🖤",
  "❤️‍🔥",
  "♾️",
  "🟪",
  "📢",
  "♠️",
  "♣️",
  "♦️",
];

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds}`;
}

function setDefaultRemainingTime(root = document) {
  root.querySelectorAll(".remaining-time").forEach((element) => {
    const durationSeconds = Number(element.dataset.durationSeconds);
    element.textContent =
      Number.isFinite(durationSeconds) && durationSeconds > 0 ? formatTime(durationSeconds) : "0:00";
  });
}

function getTrackPointerProgress(event, track) {
  const rect = track.getBoundingClientRect();
  const computedStyle = window.getComputedStyle(track);
  const hitSlop = parseFloat(computedStyle.borderTopWidth || "0") + 2;
  const expandedLeft = rect.left - hitSlop;
  const expandedWidth = rect.width + hitSlop * 2;
  const pointerX = event.clientX - expandedLeft;

  if (expandedWidth <= 0) {
    return 0;
  }

  return Math.min(Math.max(pointerX / expandedWidth, 0), 1);
}

function stopCardPulse(card) {
  if (!card) {
    return;
  }

  if (card.pulseIntervalId) {
    window.clearInterval(card.pulseIntervalId);
    delete card.pulseIntervalId;
  }

  card.classList.remove("pulse-on");
  card.classList.remove("pulse-off");
}

function startCardPulse(card) {
  if (!card) {
    return;
  }

  stopCardPulse(card);
  card.classList.add("pulse-on");

  card.pulseIntervalId = window.setInterval(() => {
    card.classList.toggle("pulse-on");
    card.classList.toggle("pulse-off");
  }, CARD_PULSE_INTERVAL_MS);
}

function updateRemainingTime(audio) {
  const audioIdWithoutPrefix = audio.id.replace("audio-", "");
  const remainingTimeDisplay = document.getElementById(`remaining-time-${audioIdWithoutPrefix}`);
  const track = document.querySelector(`.song.track.inactive[data-audio-id="${audio.id}"]`);
  const progressBarActive = track?.querySelector(".song.track.active");

  if (!remainingTimeDisplay || Number.isNaN(audio.duration) || !progressBarActive) {
    return;
  }

  const remaining = audio.duration - audio.currentTime;
  remainingTimeDisplay.textContent = formatTime(remaining);

  if (!track?.classList.contains("previewing")) {
    progressBarActive.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
  }
}

function setFullDurationOnLoad(audio) {
  const audioIdWithoutPrefix = audio.id.replace("audio-", "");
  const remainingTimeDisplay = document.getElementById(`remaining-time-${audioIdWithoutPrefix}`);

  if (remainingTimeDisplay && !Number.isNaN(audio.duration)) {
    remainingTimeDisplay.dataset.durationSeconds = String(Math.round(audio.duration));
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
    stopCardPulse(card);
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
  const track = document.querySelector(`.song.track.inactive[data-audio-id="${audio.id}"]`);
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
    stopCardPulse(card);
    card.classList.remove("playing");
    card.classList.add("paused");
  }
}

function togglePlayPause(audioId) {
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
    startCardPulse(card);
  } else {
    audio.pause();
    setPausedAudioUI(audio);
  }
}

function seekAudio(event, audioId) {
  const audio = document.getElementById(audioId);
  const track = event.currentTarget;

  if (!audio || Number.isNaN(audio.duration) || !(track instanceof HTMLElement)) {
    return;
  }

  const progress = getTrackPointerProgress(event, track);
  audio.currentTime = progress * audio.duration;
  track.classList.remove("previewing");
  updateRemainingTime(audio);

  if (audio.paused || audio.ended) {
    togglePlayPause(audioId);
  }
}

function previewSeekPosition(event, track) {
  const audioId = track.dataset.audioId;
  const audio = audioId ? document.getElementById(audioId) : null;
  const progressBarActive = track.querySelector(".song.track.active");
  const remainingTimeDisplay = audioId
    ? document.getElementById(`remaining-time-${audioId.replace("audio-", "")}`)
    : null;

  if (!audioId || !(audio instanceof HTMLAudioElement) || !progressBarActive) {
    return;
  }

  const previewProgress = getTrackPointerProgress(event, track);

  track.classList.add("previewing");
  progressBarActive.style.width = `${previewProgress * 100}%`;

  if (remainingTimeDisplay && !Number.isNaN(audio.duration)) {
    remainingTimeDisplay.textContent = formatTime(audio.duration - previewProgress * audio.duration);
  }
}

function clearSeekPreview(track) {
  const audioId = track.dataset.audioId;
  const audio = audioId ? document.getElementById(audioId) : null;
  const progressBarActive = track.querySelector(".song.track.active");
  const remainingTimeDisplay = audioId
    ? document.getElementById(`remaining-time-${audioId.replace("audio-", "")}`)
    : null;

  if (!audioId || !(audio instanceof HTMLAudioElement) || !progressBarActive) {
    return;
  }

  const progress =
    !Number.isNaN(audio.duration) && audio.duration > 0 ? (audio.currentTime / audio.duration) * 100 : 0;
  progressBarActive.style.width = `${progress}%`;

  window.setTimeout(() => {
    track.classList.remove("previewing");
  }, 100);

  if (remainingTimeDisplay && !Number.isNaN(audio.duration)) {
    remainingTimeDisplay.textContent = formatTime(audio.duration - audio.currentTime);
  }
}

function splitWaveText(root = document) {
  root.querySelectorAll(".waveText").forEach((element) => {
    if (element.dataset.waveReady === "true") {
      return;
    }

    const text = element.textContent ?? "";
    let newHtml = "";
    let globalCharIndex = 0;

    text.split(" ").forEach((word, wordIndex, words) => {
      let wordHtml = '<span class="word">';

      word.split("").forEach((character) => {
        const classIndex = (globalCharIndex % 12) + 1;
        wordHtml += `<span class="letter n-${classIndex}">${escapeHtml(character)}</span>`;
        globalCharIndex += 1;
      });

      wordHtml += "</span>";
      newHtml += wordIndex < words.length - 1 ? `${wordHtml} ` : wordHtml;
    });

    element.innerHTML = newHtml;
    element.dataset.waveReady = "true";
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

function setupGrabScroll(root = document) {
  root.querySelectorAll(".grab").forEach((slider) => {
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

function setupPlayerUi(root = document) {
  root.querySelectorAll("audio").forEach((audio) => {
    audio.addEventListener("loadedmetadata", () => setFullDurationOnLoad(audio));
    audio.addEventListener("ended", () => resetAudioUI(audio));
    audio.addEventListener("timeupdate", () => updateRemainingTime(audio));
  });

  root.querySelectorAll("button[data-audio-id]").forEach((button) => {
    button.addEventListener("click", () => togglePlayPause(button.dataset.audioId));
  });

  root.querySelectorAll(".song.track.inactive").forEach((track) => {
    track.addEventListener("mousemove", (event) => previewSeekPosition(event, track));
    track.addEventListener("mouseleave", () => clearSeekPreview(track));
    track.addEventListener("click", (event) => seekAudio(event, track.dataset.audioId));
  });
}

function setupCardLinkCopy(root = document) {
  root.querySelectorAll(".card .song.name").forEach((songName) => {
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

function readInitialReleases() {
  const manifestElement = document.getElementById("release-manifest");
  if (!manifestElement?.textContent) {
    return [];
  }

  try {
    const manifest = JSON.parse(manifestElement.textContent);
    return Array.isArray(manifest.releases) ? manifest.releases.map(normalizeRelease) : [];
  } catch (error) {
    console.error("Failed to parse embedded release manifest:", error);
    return [];
  }
}

function mergeReleases(initialReleases, liveReleases) {
  const mergedById = new Map();

  initialReleases.forEach((release) => {
    mergedById.set(release.id, normalizeRelease(release));
  });

  liveReleases.forEach((release) => {
    const previous = mergedById.get(release.id) ?? {};
    mergedById.set(release.id, normalizeRelease({ ...previous, ...release }));
  });

  return [...mergedById.values()].sort((a, b) => b.date.localeCompare(a.date));
}

function releasesAreEqual(left, right) {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((release, index) => {
    const candidate = right[index];
    return (
      release.id === candidate.id &&
      release.audioUrl === candidate.audioUrl &&
      release.downloadUrl === candidate.downloadUrl &&
      release.durationSeconds === candidate.durationSeconds
    );
  });
}

function groupReleasesByYear(releases) {
  const grouped = new Map();

  releases.forEach((release) => {
    const yearReleases = grouped.get(release.year) ?? [];
    yearReleases.push(release);
    grouped.set(release.year, yearReleases);
  });

  return [...grouped.entries()].sort(([yearA], [yearB]) => Number(yearB) - Number(yearA));
}

function renderArchive(releases) {
  const archive = document.getElementById("archive");
  if (!archive) {
    return;
  }

  const sectionsMarkup = groupReleasesByYear(releases)
    .map(
      ([year, yearReleases]) => `
        <section>
          <div class="end-bar"></div>
          <h2>${escapeHtml(year)}</h2>
          <div class="carousel">
            <div class="grid grab">
              ${yearReleases.map((release) => renderReleaseCard(release)).join("")}
            </div>
          </div>
        </section>
      `,
    )
    .join("");

  archive.innerHTML = sectionsMarkup;
  const archiveRoot = archive;
  setDefaultRemainingTime(archiveRoot);
  splitWaveText(archiveRoot);
  setupGrabScroll(archiveRoot);
  setupPlayerUi(archiveRoot);
  setupCardLinkCopy(archiveRoot);
}

function renderReleaseCard(release) {
  const durationMarkup =
    typeof release.durationSeconds === "number" && release.durationSeconds > 0
      ? escapeHtml(formatTime(release.durationSeconds))
      : '<span class="spinner" aria-hidden="true"></span>';
  const newLabelMarkup = release.isNew ? '<span class="new-label caption">New</span>' : "";

  return `
    <article id="${escapeAttribute(release.slug)}" class="card">
      <header>
        <h3 class="song name">
          <span class="random-emoji">${escapeHtml(release.emoji)}</span>
          ${escapeHtml(release.id)}
        </h3>
        ${newLabelMarkup}
      </header>

      <footer>
        <div class="song controls">
          <audio id="audio-${escapeAttribute(release.slug)}" preload="metadata" src="${escapeAttribute(release.audioUrl)}"></audio>

          <button
            type="button"
            class="player-toggle"
            data-audio-id="audio-${escapeAttribute(release.slug)}"
            aria-label="Play ${escapeAttribute(release.id)}"
          >
            <span class="material-symbols-sharp icon icon-play">play_arrow</span>
            <span class="material-symbols-sharp icon icon-pause">pause</span>
          </button>

          <div class="song progress">
            <h5
              class="song remaining-time"
              id="remaining-time-${escapeAttribute(release.slug)}"
              data-duration-seconds="${typeof release.durationSeconds === "number" ? escapeAttribute(String(release.durationSeconds)) : ""}"
            >
              ${durationMarkup}
            </h5>
            <div class="song track inactive" data-audio-id="audio-${escapeAttribute(release.slug)}">
              <div class="song track active" style="width: 0%;"></div>
            </div>
          </div>
        </div>

        <a class="download" href="${escapeAttribute(release.downloadUrl)}" target="_blank" rel="noreferrer" download>
          <div class="tooltip caption waveText">Download project files</div>
          <span class="material-symbols-sharp icon">download_2</span>
        </a>
      </footer>
    </article>
  `;
}

async function hydrateArchiveFromLiveManifest() {
  const archive = document.getElementById("archive");
  const liveManifestUrl = archive?.dataset.liveManifestUrl;
  if (!archive || !liveManifestUrl) {
    return;
  }

  const initialReleases = readInitialReleases();
  if (initialReleases.length === 0) {
    return;
  }

  try {
    const response = await fetch(liveManifestUrl, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const manifest = await response.json();
    const liveReleases = Array.isArray(manifest.releases) ? manifest.releases : [];
    const mergedReleases = mergeReleases(initialReleases, liveReleases);

    if (releasesAreEqual(initialReleases, mergedReleases)) {
      return;
    }

    renderArchive(mergedReleases);
  } catch (error) {
    console.error("Failed to hydrate archive from live manifest:", error);
  }
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll('"', "&quot;");
}

function normalizeRelease(release) {
  const id = String(release.id ?? release.slug ?? "");
  const slug = String(release.slug ?? id);
  const date = String(release.date ?? "");
  const year = String(release.year ?? date.slice(0, 4));
  const durationSeconds =
    typeof release.durationSeconds === "number" && Number.isFinite(release.durationSeconds)
      ? Math.round(release.durationSeconds)
      : null;

  return {
    ...release,
    id,
    slug,
    date,
    year,
    audioUrl: String(release.audioUrl ?? ""),
    downloadUrl: String(release.downloadUrl ?? ""),
    durationSeconds,
    emoji: release.emoji ?? emojiForSeed(slug),
    isNew: typeof release.isNew === "boolean" ? release.isNew : isNewRelease(date),
  };
}

function emojiForSeed(seedSource) {
  let seed = 0;
  for (const character of seedSource) {
    seed += character.codePointAt(0) ?? 0;
  }

  return EMOJIS[seed % EMOJIS.length];
}

function isNewRelease(date) {
  const now = new Date();
  const releaseDate = new Date(`${date}T00:00:00`);
  const diffInMs = now.getTime() - releaseDate.getTime();
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
  return diffInDays <= 30;
}

document.addEventListener("DOMContentLoaded", () => {
  setDefaultRemainingTime();
  splitWaveText();
  setupHeaderScroll();
  setupDividerScroll();
  setupGrabScroll();
  setupPlayerUi();
  setupCardLinkCopy();
  hydrateArchiveFromLiveManifest();
});
