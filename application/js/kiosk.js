if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('sw.js').catch(function(err) {
      console.error('SW registration failed:', err);
    });
  });
}

// 카운터 키오스크: 07:00-23:00 화면 항상 켜짐
(function() {
  if (!('wakeLock' in navigator)) return;
  var wakeLock = null;
  var START_HOUR = 7;
  var END_HOUR = 23;

  async function acquire() {
    if (wakeLock) return;
    try {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', function() { wakeLock = null; });
    } catch (e) {}
  }
  async function release() {
    if (!wakeLock) return;
    try { await wakeLock.release(); } catch (e) {}
    wakeLock = null;
  }
  async function update() {
    var h = new Date().getHours();
    if (h >= START_HOUR && h < END_HOUR) await acquire();
    else await release();
  }
  document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible') update();
  });
  update();
  setInterval(update, 60000);
})();
