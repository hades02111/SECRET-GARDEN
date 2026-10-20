(() => {
  'use strict';

  const screens = {
    intro: document.getElementById('screenIntro'),
    garden: document.getElementById('screenGarden'),
    letter: document.getElementById('screenLetter'),
    rewards: document.getElementById('screenRewards'),
    final: document.getElementById('screenFinal')
  };
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const foundNodes = new Set();
  const openedGifts = new Set();
  const giftMessages = {
    luck: '🍀 Buff may mắn đã kích hoạt! Chúc Như Ý hôm nay gặp toàn chuyện vui, làm gì cũng thuận lợi, mở game thì gặp đồng đội có tâm. RNG nhớ chiều một chút nha!',
    shield: '🎮 Buff chống tilt đã kích hoạt! Mong những trận thua không làm cậu mất vui, còn những trận thắng thì đủ khiến cậu cười cả buổi. KDA đẹp cũng tốt, tâm trạng đẹp còn tốt hơn.',
    mood: '🌷 Buff dịu dàng đã kích hoạt! Mong Như Ý luôn được mọi người đối xử tử tế, có nhiều lý do để cười và luôn nhớ rằng cậu xứng đáng với những điều tốt đẹp.'
  };
  const nodeMessages = [
    'Một chút may mắn đã được nạp. 🍀',
    'Mood hôm nay: +10. Đang có tín hiệu tích cực… ✨',
    'Đang triệu hồi món quà bí mật… khu vườn đã sáng lên rồi! 🌷'
  ];
  const gardenCount = document.getElementById('gardenCount');
  const gardenFill = document.getElementById('gardenFill');
  const gardenProgress = document.getElementById('gardenProgress');
  const gardenMessage = document.getElementById('gardenMessage');
  const toLetter = document.getElementById('toLetter');
  const giftCount = document.getElementById('giftCount');
  const giftFill = document.getElementById('giftFill');
  const giftProgress = document.getElementById('giftProgress');
  const giftStatus = document.getElementById('giftStatus');
  const toFinal = document.getElementById('toFinal');
  const eggModal = document.getElementById('eggModal');
  const toast = document.getElementById('toast');
  let toastTimer = null;
  let previousFocus = null;

  // A tiny procedural ambient soundtrack: no external audio file or library needed.
  // Audio only starts after a user gesture, respecting browser autoplay restrictions.
  const musicToggle = document.getElementById('musicToggle');
  const musicVolume = document.getElementById('musicVolume');
  const music = {
    context: null,
    master: null,
    enabled: false,
    timer: null,
    step: 0
  };
  const melody = [
    587.33, 739.99, 880.00, 739.99, 659.25, 493.88,
    587.33, 739.99, 880.00, 987.77, 880.00, 739.99,
    659.25, 739.99, 587.33, 493.88, 440.00, 493.88
  ];
  const chords = [
    [146.83, 220.00, 277.18, 369.99], // Dmaj7
    [123.47, 185.00, 220.00, 293.66], // Bm7
    [98.00, 146.83, 185.00, 246.94],  // Gmaj7
    [110.00, 164.81, 220.00, 246.94]  // Asus2
  ];

  function volumeValue() {
    // Hard cap keeps the soundtrack intentionally soft even at maximum slider value.
    return (Number(musicVolume.value) / 100) * 0.24;
  }

  function syncMusicControl() {
    musicToggle.setAttribute('aria-pressed', String(music.enabled));
    musicToggle.textContent = music.enabled ? '♫ Nhạc: Bật' : '♫ Nhạc: Tắt';
    musicToggle.title = music.enabled ? 'Tắt nhạc nền' : 'Bật nhạc nền';
  }

  function getAudioContext() {
    if (music.context) return music.context;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      showToast('Trình duyệt này chưa hỗ trợ phát nhạc nền.');
      return null;
    }
    music.context = new AudioContextClass();
    music.master = music.context.createGain();
    music.master.gain.value = 0;
    music.master.connect(music.context.destination);
    return music.context;
  }

  function playSoftNote(frequency, duration, voiceLevel = 0.1, wave = 'sine') {
    if (!music.context || !music.master || music.context.state !== 'running') return;
    const now = music.context.currentTime;
    const oscillator = music.context.createOscillator();
    const envelope = music.context.createGain();
    oscillator.type = wave;
    oscillator.frequency.setValueAtTime(frequency, now);
    envelope.gain.setValueAtTime(0.0001, now);
    envelope.gain.exponentialRampToValueAtTime(voiceLevel, now + 0.12);
    envelope.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(envelope);
    envelope.connect(music.master);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.04);
    oscillator.addEventListener('ended', () => {
      oscillator.disconnect();
      envelope.disconnect();
    }, { once: true });
  }

  function playSoftChord(chord) {
    // Slow, sine-wave harmony provides a dreamy pad behind the plucked melody.
    chord.forEach((frequency, index) => {
      window.setTimeout(() => {
        if (!music.enabled) return;
        playSoftNote(frequency, 4.8, index === 0 ? 0.075 : 0.052, 'sine');
      }, index * 95);
    });
  }

  function musicTick() {
    music.timer = null;
    if (!music.enabled || !music.context || music.context.state !== 'running') return;
    const step = music.step;
    if (step % 6 === 0) playSoftChord(chords[(step / 6) % chords.length]);
    playSoftNote(melody[step % melody.length], 1.45, 0.13, 'triangle');
    // A quiet, higher shimmer on every third note adds a bell-like sparkle.
    if (step % 3 === 1) playSoftNote(melody[step % melody.length] * 2, 1.1, 0.024, 'sine');
    music.step += 1;
    music.timer = window.setTimeout(musicTick, 820);
  }

  async function setMusicEnabled(enabled) {
    const context = getAudioContext();
    if (!context) return;
    music.enabled = Boolean(enabled);
    syncMusicControl();
    try {
      if (music.enabled) {
        await context.resume();
        music.master.gain.cancelScheduledValues(context.currentTime);
        music.master.gain.setTargetAtTime(volumeValue(), context.currentTime, 0.35);
        if (music.timer === null) musicTick();
      } else {
        window.clearTimeout(music.timer);
        music.timer = null;
        music.master.gain.cancelScheduledValues(context.currentTime);
        music.master.gain.setTargetAtTime(0, context.currentTime, 0.18);
      }
    } catch (error) {
      music.enabled = false;
      syncMusicControl();
      showToast('Chưa thể bật nhạc trên trình duyệt này.');
    }
  }

  musicToggle.addEventListener('click', () => setMusicEnabled(!music.enabled));
  musicVolume.addEventListener('input', () => {
    if (!music.context || !music.master) return;
    music.master.gain.cancelScheduledValues(music.context.currentTime);
    music.master.gain.setTargetAtTime(music.enabled ? volumeValue() : 0, music.context.currentTime, 0.12);
  });
  syncMusicControl();

  function showScreen(name) {
    if (!Object.prototype.hasOwnProperty.call(screens, name)) return;
    Object.values(screens).forEach(screen => { screen.hidden = true; });
    screens[name].hidden = false;
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    const heading = screens[name].querySelector('h1, h2');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
    }
  }

  function scatterSymbols(count, symbols = ['✿', '❀', '♥', '✧']) {
    if (reduceMotion) return;
    for (let i = 0; i < count; i++) {
      const item = document.createElement('span');
      item.className = 'petal-fall';
      item.setAttribute('aria-hidden', 'true');
      item.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      item.style.left = (Math.random() * 100) + 'vw';
      item.style.fontSize = (12 + Math.random() * 13) + 'px';
      item.style.color = ['#ffc2d8', '#e7caff', '#fff0b8', '#d7f4df'][Math.floor(Math.random() * 4)];
      item.style.setProperty('--drift', (Math.random() * 150 - 75) + 'px');
      item.style.animationDuration = (3.5 + Math.random() * 3.5) + 's';
      document.body.appendChild(item);
      window.setTimeout(() => item.remove(), 7500);
    }
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('show'), 2400);
  }

  document.getElementById('startQuest').addEventListener('click', () => {
    showScreen('garden');
    // The click is a user gesture, so browsers may allow audio to start here.
    if (!music.enabled) setMusicEnabled(true);
    showToast('Quest bắt đầu! Tìm đủ 3 đốm sáng nhé.');
  });

  document.getElementById('gardenBack').addEventListener('click', () => showScreen('intro'));
  document.getElementById('letterBack').addEventListener('click', () => showScreen('garden'));
  document.getElementById('rewardsBack').addEventListener('click', () => showScreen('letter'));
  document.getElementById('toLetter').addEventListener('click', () => {
    if (foundNodes.size < 3) return;
    showScreen('letter');
    scatterSymbols(15);
  });
  document.getElementById('toRewards').addEventListener('click', () => {
    showScreen('rewards');
    scatterSymbols(8, ['✦', '✧', '♥']);
  });

  document.querySelectorAll('.star-node').forEach(button => {
    button.addEventListener('click', () => {
      const nodeId = Number(button.dataset.node);
      if (foundNodes.has(nodeId)) {
        showToast('Đốm sáng này đã được kích hoạt rồi nè! ✨');
        return;
      }
      foundNodes.add(nodeId);
      button.disabled = true;
      button.innerHTML = '✓<span class="node-label">Đã kích hoạt</span>';
      const count = foundNodes.size;
      gardenCount.textContent = `${count} / 3`;
      gardenFill.style.width = `${(count / 3) * 100}%`;
      gardenProgress.setAttribute('aria-valuenow', String(count));
      gardenMessage.textContent = nodeMessages[nodeId];
      scatterSymbols(5, ['✦', '✧', '♥']);
      if (count === 3) {
        gardenMessage.textContent = 'Khu vườn đã sáng lên! Phong thư bí mật đã sẵn sàng. 🌷';
        toLetter.disabled = false;
        toLetter.classList.add('gold');
        showToast('QUEST COMPLETE: Garden awakened!');
        scatterSymbols(15);
      }
    });
  });

  document.querySelectorAll('.gift-card').forEach(card => {
    card.addEventListener('click', () => {
      const key = card.dataset.gift;
      if (!Object.prototype.hasOwnProperty.call(giftMessages, key)) return;
      if (openedGifts.has(key)) {
        giftStatus.textContent = giftMessages[key];
        return;
      }
      openedGifts.add(key);
      card.classList.add('opened');
      card.setAttribute('aria-expanded', 'true');
      const stat = card.querySelector('.gift-stat');
      stat.textContent = '✓ PHẦN THƯỞNG ĐÃ MỞ';
      const message = document.createElement('span');
      message.className = 'gift-reveal';
      message.textContent = giftMessages[key];
      card.appendChild(message);
      const count = openedGifts.size;
      giftCount.textContent = `${count} / 3 PHẦN THƯỞNG ĐÃ MỞ`;
      giftFill.style.width = `${(count / 3) * 100}%`;
      giftProgress.setAttribute('aria-valuenow', String(count));
      giftStatus.textContent = count === 3
        ? 'Đã thu thập đủ cả ba buff! Mở thành tích cuối cùng thôi. 🏆'
        : `Đã mở ${count}/3 hộp quà. Còn ${3 - count} hộp đang chờ cậu khám phá. 👀`;
      scatterSymbols(7, ['✦', '✧', '♥']);
      if (count === 3) {
        toFinal.disabled = false;
        toFinal.classList.add('gold');
        showToast('All rewards claimed!');
        scatterSymbols(18);
      }
    });
  });

  toFinal.addEventListener('click', () => {
    if (openedGifts.size < 3) return;
    showScreen('final');
    scatterSymbols(26, ['✿', '❀', '♥', '✧', '✦']);
  });

  document.getElementById('restartQuest').addEventListener('click', () => {
    foundNodes.clear();
    openedGifts.clear();
    document.querySelectorAll('.star-node').forEach(button => {
      button.disabled = false;
      const id = Number(button.dataset.node);
      button.innerHTML = (id === 1 ? '✧' : '✦') + `<span class="node-label">Ánh sáng ${['I', 'II', 'III'][id]}</span>`;
    });
    gardenCount.textContent = '0 / 3';
    gardenFill.style.width = '0%';
    gardenProgress.setAttribute('aria-valuenow', '0');
    gardenMessage.textContent = 'Một đốm sáng đang chờ cậu chạm vào…';
    toLetter.disabled = true;
    toLetter.classList.remove('gold');
    document.querySelectorAll('.gift-card').forEach(card => {
      card.classList.remove('opened');
      card.setAttribute('aria-expanded', 'false');
      const icon = card.querySelector('.gift-icon');
      const label = card.querySelector('.gift-name');
      const key = card.dataset.gift;
      const labels = { luck: 'LUCK +99', shield: 'ANTI-TILT SHIELD', mood: 'MOOD +100' };
      card.replaceChildren(icon, Object.assign(document.createElement('span'), { className: 'gift-name', textContent: labels[key] }), Object.assign(document.createElement('span'), { className: 'gift-stat', textContent: '▣ Hộp quà chưa mở' }));
    });
    giftCount.textContent = '0 / 3 PHẦN THƯỞNG ĐÃ MỞ';
    giftFill.style.width = '0%';
    giftProgress.setAttribute('aria-valuenow', '0');
    giftStatus.textContent = 'Chọn một hộp bất kỳ để mở lời chúc bí mật nha 👀';
    toFinal.disabled = true;
    toFinal.classList.remove('gold');
    showScreen('intro');
  });

  function openEgg() {
    previousFocus = document.activeElement;
    eggModal.hidden = false;
    document.getElementById('gotEgg').focus();
  }
  function closeEgg() {
    eggModal.hidden = true;
    if (previousFocus && typeof previousFocus.focus === 'function') previousFocus.focus();
  }
  document.getElementById('easterEgg').addEventListener('click', openEgg);
  document.getElementById('closeEgg').addEventListener('click', closeEgg);
  document.getElementById('gotEgg').addEventListener('click', closeEgg);
  eggModal.addEventListener('click', event => { if (event.target === eggModal) closeEgg(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !eggModal.hidden) closeEgg();
  });
})();
