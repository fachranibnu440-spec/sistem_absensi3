// Ganti dengan URL Google Apps Script yang disalin dari Langkah 1
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxKXIAFDz3_IlbDd7la-yXkd9AwO1ef72sGtHeL28VNbEPYPAGlcAeDKLsfeVHDTBuuWw/exec';

let rateMenitCalculated = 0;

// 1. Fungsi Live Jam & Tanggal Indonesia + Auto Deteksi Masuk/Pulang
function updateClock() {
  const now = new Date();
  
  // Format Jam
  const timeString = now.toLocaleTimeString('id-ID', { hour12: false });
  document.getElementById('liveClock').innerText = timeString;

  // Format Tanggal
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById('liveDate').innerText = now.toLocaleDateString('id-ID', options);

  // Auto Select Masuk vs Pulang berdasarkan jam (Contoh: > 15:00 Otomatis Pulang)
  const currentHour = now.getHours();
  if (currentHour >= 15) {
    document.getElementById('typePulang').checked = true;
  } else {
    document.getElementById('typeMasuk').checked = true;
  }
}

setInterval(updateClock, 1000);
updateClock();

// 2. Fungsi Hitung Gaji Per Menit
// Rumus Standar: Gaji Bulanan / (22 Hari Kerja * 8 Jam * 60 Menit)
function hitungGajiPerMenit() {
  const gajiBulan = parseFloat(document.getElementById('gajiBulan').value) || 0;
  const totalMenitKerja = 22 * 8 * 60; // 10,560 menit per bulan
  
  rateMenitCalculated = gajiBulan / totalMenitKerja;
  
  // Format Rupiah
  const rupiahFormatted = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 2
  }).format(rateMenitCalculated);

  document.getElementById('ratePerMenit').innerText = rupiahFormatted + " / mnt";
}

// 3. Handle Submit Form ke Google Sheets
document.getElementById('absensiForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const statusMsg = document.getElementById('statusMsg');
  statusMsg.innerText = "⏳ Memproses Presensi...";
  statusMsg.style.color = "#1e40af";

  const tipeAbsenSelect = document.querySelector('input[name="tipeAbsen"]:checked').value;

  const payload = {
    nip: document.getElementById('nip').value,
    nama: document.getElementById('nama').value,
    jabatan: document.getElementById('jabatan').value,
    tipeAbsen: tipeAbsenSelect,
    gajiPerMenit: rateMenitCalculated.toFixed(2)
  };

  fetch(SCRIPT_URL, {
    method: 'POST',
    body: JSON.stringify(payload)
  })
  .then(response => response.json())
  .then(data => {
    statusMsg.innerText = "✅ Presensi Berhasil Terkirim!";
    statusMsg.style.color = "#10b981";
    document.getElementById('absensiForm').reset();
    document.getElementById('ratePerMenit').innerText = "Rp 0";
  })
  .catch(error => {
    statusMsg.innerText = "❌ Gagal Mengirim Presensi.";
    statusMsg.style.color = "#ef4444";
    console.error('Error:', error);
  });
});
