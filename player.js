
function initRadioPlayer(){

  const audio = document.getElementById("audioPlayer");
  const playBtn = document.getElementById("playBtn");
  const nowPlaying = document.getElementById("nowPlaying");
  const stations = document.querySelectorAll(".station");

  if(!audio || !playBtn) return;

  const streams = {
    rhywaelle:{
      url:"https://stream.laut.fm/rhywaelle",
      api:"rhywaelle"
    },
    winterlord:{
      url:"https://stream.laut.fm/winterlord-fm",
      api:"winterlord-fm"
    },
    rhyrock:{
      url:"https://stream.laut.fm/rhyrock-radio",
      api:"rhyrock-radio"
    }
  };

  let current = localStorage.getItem("frgStation") || "rhywaelle";
  let isPlaying = localStorage.getItem("frgPlaying") === "true";

  /* =========================
  PLAY
  ========================= */
  function play(){
    audio.src = streams[current].url;
    audio.play().catch(()=>{});

    isPlaying = true;
    localStorage.setItem("frgPlaying","true");
    localStorage.setItem("frgStation",current);

    updateUI();
    fetchSong();
  }

  /* =========================
  PAUSE
  ========================= */
  function pause(){
    audio.pause();
    isPlaying = false;
    localStorage.setItem("frgPlaying","false");
    updateUI();
  }

  /* =========================
  UI
  ========================= */
  function updateUI(){
    stations.forEach(s =>
      s.classList.toggle("active", s.dataset.station === current)
    );

    playBtn.textContent = isPlaying ? "⏸" : "▶";
  }

  /* =========================
  LAUT.FM SONG
  ========================= */
  async function fetchSong(){
    try{
      const res = await fetch(`https://api.laut.fm/station/${streams[current].api}/current_song`);
      const data = await res.json();

      if(nowPlaying){
        nowPlaying.textContent = `🎵 ${data.title} – ${data.artist?.name}`;
      }
    } catch(e){}
  }

  /* =========================
  EVENTS
  ========================= */
  stations.forEach(btn=>{
    btn.addEventListener("click",()=>{
      current = btn.dataset.station;
      play();
    });
  });

  playBtn.addEventListener("click",()=>{
    isPlaying ? pause() : play();
  });

  window.setStation = function(station){
    current = station;
    play();
  };

  /* =========================
  AUTO RESUME
  ========================= */
  setTimeout(()=>{
    updateUI();
    if(isPlaying) play();
  },300);

  setInterval(()=>{
    if(isPlaying) fetchSong();
  },10000);

}
