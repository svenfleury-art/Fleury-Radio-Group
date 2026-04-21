function initRadioPlayer(){

  if(window.radioInitDone) return;
  window.radioInitDone = true;

  const audio = document.getElementById("audioPlayer");
  const playBtn = document.getElementById("playBtn");
  const nowPlaying = document.getElementById("nowPlaying");
  const stations = document.querySelectorAll(".station");

  if(!audio || !playBtn) return;

  const streams = {
    rhywaelle:"https://stream.laut.fm/rhywaelle",
    winterlord:"https://stream.laut.fm/winterlord-fm",
    rhyrock:"https://stream.laut.fm/rhyrock-radio"
  };

  let current = localStorage.getItem("frgStation") || "rhywaelle";
  let playing = false;

  function updateUI(){
    stations.forEach(s=>{
      s.classList.toggle("active", s.dataset.station === current);
    });
    playBtn.textContent = playing ? "⏸" : "▶";
  }

  function play(){
    audio.src = streams[current];
    audio.play().catch(()=>{});

    playing = true;
    localStorage.setItem("frgPlaying","true");
    localStorage.setItem("frgStation",current);

    updateUI();
  }

  function pause(){
    audio.pause();
    playing = false;
    localStorage.setItem("frgPlaying","false");

    updateUI();
  }

  stations.forEach(btn=>{
    btn.addEventListener("click",()=>{
      current = btn.dataset.station;
      play();
    });
  });

  playBtn.addEventListener("click",()=>{
    playing ? pause() : play();
  });

  updateUI();

  if(playing){
    setTimeout(()=>play(),200);
  }

  setInterval(()=>{
    if(!playing) return;

    fetch(`https://api.laut.fm/station/${current}/current_song`)
      .then(r=>r.json())
      .then(d=>{
        if(nowPlaying){
          nowPlaying.textContent = `🎵 ${d.title} – ${d.artist?.name}`;
        }
      });

  },10000);
}

/* START */
window.addEventListener("DOMContentLoaded",initRadioPlayer);
