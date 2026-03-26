function downloadSong(element) {
  const urlPrefix = "https://github.com/alexmacflai/openbars/raw/master/";
  const groupName = element.getAttribute("data-group-name");
  const songName = element.getAttribute("data-song-name");
  const downloadUrl = `${urlPrefix}${groupName}/${songName}.zip`;
  window.location.href = downloadUrl;
}

// Split text into span letters
document.addEventListener("DOMContentLoaded", function () {
  // Select all elements with the class 'waveText'
  const elements = document.querySelectorAll(".waveText");

  elements.forEach((element) => {
    let newHTML = "";
    let globalCharIndex = 0; // Initialize a global character index
    // Split the text content into words
    let words = element.textContent.split(" ");

    words.forEach((word, wordIndex) => {
      let wordHTML = `<span class="word">`; // Start of word container
      let characters = word.split("");

      characters.forEach((character) => {
        // Calculate class index, looping from 1 to 6
        let classIndex = (globalCharIndex % 12) + 1;
        wordHTML += `<span class="letter n-${classIndex}">${character}</span>`;
        globalCharIndex++; // Increment the global character index
      });

      wordHTML += `</span>`; // End of word container
      // Add a space after each word except the last
      newHTML += wordIndex < words.length - 1 ? wordHTML + " " : wordHTML;
    });

    element.innerHTML = newHTML;
  });
});

// Show header on scroll
const header = document.getElementById("header");
const showClass = "show";
const scrollAmountForShow = 200;

window.addEventListener("scroll", () => {
  if (window.scrollY > scrollAmountForShow) {
    header.classList.add(showClass);
  } else {
    header.classList.remove(showClass);
  }
});

// Move divider with scroll
const svgContainer = document.querySelector(".svg-container");
const startScroll = 0; // The scroll position at which the translation starts
const endScroll = 600; // The scroll position at which the translation ends
const startTranslate = -100; // The starting translate value in pixels
const endTranslate = 100; // The ending translate value in pixels

window.addEventListener("scroll", () => {
  // Get the current scroll position
  const scrollPosition = window.scrollY;

  // Calculate the SVG's translation based on the scroll position
  if (scrollPosition >= startScroll && scrollPosition <= endScroll) {
    // Calculate the progress between 0 (at startScroll) and 1 (at endScroll)
    const progress = (scrollPosition - startScroll) / (endScroll - startScroll);

    // Map the progress to the translate range
    const translateValue = startTranslate + progress * (endTranslate - startTranslate);
    // Convert the translation to rems
    const translateRem = translateValue / parseFloat(getComputedStyle(document.documentElement).fontSize);

    // Select the SVG within .divider > .inner
    const svg = document.querySelector(".divider .inner svg");

    // Apply the translation to the SVG
    if (svg) {
      svg.style.left = `${translateRem}rem`;
    }
  }
});

// Allow grabbing on carousel
document.addEventListener("DOMContentLoaded", (event) => {
  // Select all elements with the 'grab' class
  const sliders = document.querySelectorAll(".grab");

  // Loop through all sliders
  sliders.forEach((slider) => {
    let isDown = false;
    let startX;
    let scrollLeft;

    slider.addEventListener("mousedown", (e) => {
      isDown = true;
      slider.classList.add("active");
      startX = e.pageX - slider.offsetLeft;
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

    slider.addEventListener("mousemove", (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 4; // the * 2 is the speed of the drag
      slider.scrollLeft = scrollLeft - walk;
    });
  });
});
