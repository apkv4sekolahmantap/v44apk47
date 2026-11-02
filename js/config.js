// ============================================================
// KONFIGURASI - ISI SEBELUM PUSH KE GITHUB
// Tempel URL Web App Apps Script (berakhiran /exec) di antara tanda kutip.
// ============================================================
const GAS_URL = 'https://script.google.com/macros/s/AKfycbxcXw0iS15dw8fKRppHXwy3TE5hu83XWCvVsCN4c6ZeiVIWHWMOBPq15R-2KZZtbx29gg/exec';

// Pustaka pihak ketiga dimuat di latar belakang (tidak menahan halaman).
(function () {
  window.L = function (u, cb) {
    var s = document.createElement('script'); s.src = u[0]; s.async = true;
    s.onload = function () { cb && cb(true); };
    s.onerror = function () { u.length > 1 ? window.L(u.slice(1), cb) : (cb && cb(false)); };
    document.head.appendChild(s);
  };
  L(['https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.3/js/bootstrap.bundle.min.js', 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js']);
  L(['https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js', 'https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.js']);
  L(['https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js', 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js']);
  L(['https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js', 'https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js']);
  L(['https://cdn.jsdelivr.net/npm/html5-qrcode@2.3.8/html5-qrcode.min.js', 'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js']);
})();
