document.querySelectorAll('.chip').forEach(function(chip) {
  chip.addEventListener('click', function() {
    chip.classList.toggle('active');
  });
});

var TELEGRAM_WEBHOOK = 'https://script.google.com/macros/s/AKfycbyMxBMqnIbG1QDkFmJAS_nKsXHTj1PAWL6cJqK75J-k8IP2klSGBQwPliNUWE47eTRcRg/exec';

document.getElementById('submitBtn').addEventListener('click', function() {
  var sports = Array.prototype.slice.call(
    document.querySelectorAll('#sportGroup .chip.active')
  ).map(function(c) { return c.dataset.value; });
  var topics = Array.prototype.slice.call(
    document.querySelectorAll('#topicGroup .chip.active')
  ).map(function(c) { return c.dataset.value; });
  var name = document.getElementById('name').value.trim();
  var phone = document.getElementById('phone').value.trim();

  if (!sports.length) { alert('문의 종목을 1개 이상 선택해주세요.'); return; }
  if (!topics.length) { alert('문의 내용을 1개 이상 선택해주세요.'); return; }
  if (!name) { alert('성함을 입력해주세요.'); return; }
  if (!phone) { alert('연락처를 입력해주세요.'); return; }

  var phoneDigits = phone.replace(/[^0-9]/g, '');
  if (!/^01\d{8,9}$/.test(phoneDigits)) {
    alert('연락처를 010-1234-5678 형식으로 입력해주세요.');
    document.getElementById('phone').focus();
    return;
  }

  var btn = document.getElementById('submitBtn');
  btn.disabled = true;
  btn.textContent = '전송 중...';

  fetch(TELEGRAM_WEBHOOK, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({
      source: 'quick',
      sports: sports,
      topics: topics,
      name: name,
      phone: phone
    })
  });

  setTimeout(function() {
    location.href = 'inquiry_sent.html';
  }, 600);
});
