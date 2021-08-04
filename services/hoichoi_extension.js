let check = null;

if (detect(/http(s|)\:\/\/(www\.|)hoichoi\.tv\/films\/(.*)/gm)) {
  lookup();
} else {
  const el = document.querySelectorAll('.video-tray-item');
  for (let i = 0; i < el.length; i++) {
    el[i].addEventListener('click', function () {
      lookup();
    });
  }
}

function detect(regex) {
  let m,
    detected = false;
  while ((m = regex.exec(window.location.href)) !== null) {
    if (m.index === regex.lastIndex) {
      regex.lastIndex++;
    }
    m.forEach((match, groupIndex) => {
      detected = true;
    });
  }

  return detected;
}

function lookup() {
  if (check) {
    clearInterval(check);
  }
  check = setInterval(() => {
    const video = document.querySelector('.vjs-tech');
    console.log(video);
    let filename = 'File Name Here';
    if (video) {
      const cc = document.querySelector('.vjs-subs-caps-button');
      const newItem = document.createElement('div');
      const newButton = document.createElement('button');
      newItem.appendChild(newButton);
      newItem.style.display = 'flex';
      newButton.innerText = 'DL';

      cc.parentNode.insertBefore(newItem, cc);

      const showName = document.querySelectorAll('.episode-name .name')[1];
      const movieName = document.querySelector('h1.header-title');
      if (showName) {
        filename = showName.innerText;
      } else if (movieName) {
        filename = movieName.innerText;
      }
      document.querySelector('.vjs-resolution-menu').firstChild.click();
      newButton.addEventListener('click', function () {
        console.log('clicked');
        let url = video.src;
        chrome.runtime.sendMessage({
          url,
          filename,
          conflictAction: 'prompt',
        });
      });
      clearInterval(check);
    }
  }, 2000);
}
