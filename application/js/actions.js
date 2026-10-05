/* actions.js — 인라인 onclick/onsubmit 대신 data-* 속성으로 동작을 연결합니다.
   (CSP에서 script-src 'unsafe-inline' 없이 동작하기 위함)
   - data-href="URL"        : 클릭 시 해당 주소로 이동
   - data-open="URL"        : 클릭 시 새 탭으로 열기
   - data-action="..."      : open-contact | close-image | toggle-career | open-image
   - form#contactForm[data-form-url][data-telegram] : 코치 문의 전송 */
(function () {
  "use strict";
  var MASTER_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdFI0cYXaQKpgs6qh70bg9hGMmasDliTUOSX3Zs-xBKle8MsA/formResponse";

  document.addEventListener("click", function (e) {
    var el = e.target.closest ? e.target.closest("[data-href],[data-open],[data-action]") : null;
    if (!el) return;
    if (el.hasAttribute("data-href")) { location.href = el.getAttribute("data-href"); return; }
    if (el.hasAttribute("data-open")) { window.open(el.getAttribute("data-open"), "_blank", "noopener,noreferrer"); return; }
    switch (el.getAttribute("data-action")) {
      case "open-contact": if (window.openContact) window.openContact(); break;
      case "close-image": if (window.closeImage) window.closeImage(); break;
      case "toggle-career": if (window.toggleCareer) window.toggleCareer(el); break;
      case "open-image": if (window.openImage) window.openImage(el.currentSrc || el.src); break;
    }
  });

  function bindContactForm() {
    var form = document.getElementById("contactForm");
    if (!form || !form.hasAttribute("data-form-url")) return;
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var formData = new FormData(form);
      var val = function (n) { var f = form.elements[n]; return f ? f.value : ""; };

      // 연락처 형식 검증
      var phoneInput = form.elements["entry.86880590"];
      var phoneDigits = (phoneInput ? phoneInput.value : "").replace(/[^0-9]/g, "");
      if (!/^01\d{8,9}$/.test(phoneDigits)) {
        alert("연락처를 010-1234-5678 형식으로 입력해주세요.");
        if (phoneInput) phoneInput.focus();
        return;
      }

      // 강사별 폼 + 통합 폼
      fetch(form.getAttribute("data-form-url"), { method: "POST", body: formData, mode: "no-cors" });
      fetch(MASTER_FORM_URL, { method: "POST", body: formData, mode: "no-cors" });

      // 텔레그램 알림 (data-telegram 이 있는 페이지만)
      var hook = form.getAttribute("data-telegram");
      if (hook) {
        fetch(hook, {
          method: "POST", mode: "no-cors",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({
            sport: val("entry.1115432762"), coach: val("entry.1676847878"),
            name: val("entry.1564976340"), phone: val("entry.86880590"), message: val("entry.630766365")
          })
        });
      }
      if (window.showSuccess) window.showSuccess();
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bindContactForm);
  else bindContactForm();
})();
