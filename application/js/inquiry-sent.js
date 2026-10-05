var s = 10;
var el = document.getElementById('seconds');
var t = setInterval(function() {
  s--;
  if (el) el.textContent = s;
  if (s <= 0) {
    clearInterval(t);
    location.href = 'index.html';
  }
}, 1000);
