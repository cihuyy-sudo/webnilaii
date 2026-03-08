function createSiswa(id, nama, nilai) {
  return {
    id,
    nama,
    nilai,
    huruf: nilaiKeHuruf(nilai),
    waktu: new Date()
  };
}

let daftarSiswa = [];
let idCounter = 1;

function nilaiKeHuruf(n) {
  if (n >= 90) return 'A';
  if (n >= 80) return 'B';
  if (n >= 70) return 'C';
  if (n >= 60) return 'D';
  return 'E';
}

function gradeClass(huruf) {
  const map = { A: 'grade-a', B: 'grade-b', C: 'grade-c', D: 'grade-c', E: 'grade-d' };
  return map[huruf] || 'grade-d';
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2400);
}

function showError(msg) {
  document.getElementById('errorMsg').textContent = msg;
}

function tambahSiswa() {
  const namaEl = document.getElementById('inputNama');
  const nilaiEl = document.getElementById('inputNilai');
  const nama = namaEl.value.trim();
  const nilaiRaw = nilaiEl.value;

  if (!nama) { showError('⚠ Nama siswa tidak boleh kosong.'); namaEl.focus(); return; }
  if (nilaiRaw === '') { showError('⚠ Nilai tidak boleh kosong.'); nilaiEl.focus(); return; }
  const nilai = Number(nilaiRaw);
  if (isNaN(nilai) || nilai < 0 || nilai > 100) { showError('⚠ Nilai harus antara 0 dan 100.'); nilaiEl.focus(); return; }

  showError('');

  const siswa = createSiswa(idCounter++, nama, nilai);
  daftarSiswa.push(siswa);

  namaEl.value = '';
  nilaiEl.value = '';
  namaEl.focus();

  render();
  showToast(`✓ ${siswa.nama} ditambahkan`);
}

function hapusSiswa(id) {
  const idx = daftarSiswa.findIndex(s => s.id === id);
  if (idx === -1) return;
  const nama = daftarSiswa[idx].nama;
  daftarSiswa.splice(idx, 1);
  render();
  showToast(`✗ ${nama} dihapus`);
}

function hapusSemua() {
  if (daftarSiswa.length === 0) return;
  if (!confirm(`Hapus semua ${daftarSiswa.length} siswa?`)) return;
  daftarSiswa = [];
  render();
  showToast('Semua data dihapus');
}

function hitungStats() {
  if (daftarSiswa.length === 0) return null;
  const values = daftarSiswa.map(s => s.nilai);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const maxVal = Math.max(...values);
  const minVal = Math.min(...values);
  const maxSiswa = daftarSiswa.filter(s => s.nilai === maxVal).map(s => s.nama).join(', ');
  const minSiswa = daftarSiswa.filter(s => s.nilai === minVal).map(s => s.nama).join(', ');
  return { avg, maxVal, minVal, maxSiswa, minSiswa };
}

function render() {
  const stats = hitungStats();

  if (stats) {
    document.getElementById('statAvg').textContent = stats.avg.toFixed(1);
    document.getElementById('statAvgSub').textContent = `dari ${daftarSiswa.length} siswa`;
    document.getElementById('statHigh').textContent = stats.maxVal;
    document.getElementById('statHighName').textContent = stats.maxSiswa;
    document.getElementById('statLow').textContent = stats.minVal;
    document.getElementById('statLowName').textContent = stats.minSiswa;
  } else {
    document.getElementById('statAvg').innerHTML = '<span class="stat-empty">—</span>';
    document.getElementById('statAvgSub').textContent = 'belum ada data';
    document.getElementById('statHigh').innerHTML = '<span class="stat-empty">—</span>';
    document.getElementById('statHighName').textContent = '—';
    document.getElementById('statLow').innerHTML = '<span class="stat-empty">—</span>';
    document.getElementById('statLowName').textContent = '—';
  }

  document.getElementById('countBadge').textContent =
    daftarSiswa.length + (daftarSiswa.length === 1 ? ' siswa' : ' siswa');

  const wrap = document.getElementById('tableWrap');
  if (daftarSiswa.length === 0) {
    wrap.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📋</div>
        <p class="empty-text">Belum ada data siswa</p>
      </div>`;
    return;
  }

  const sorted = [...daftarSiswa].sort((a, b) => b.nilai - a.nilai);
  const rankMap = {};
  sorted.forEach((s, i) => { rankMap[s.id] = i + 1; });

  const rows = daftarSiswa.map(s => `
    <tr class="row-new">
      <td><span class="rank">#${rankMap[s.id]}</span></td>
      <td><span class="student-name">${escHtml(s.nama)}</span></td>
      <td class="grade-cell">
        <span class="grade-pill ${gradeClass(s.huruf)}">${s.nilai}</span>
      </td>
      <td class="grade-cell"><span class="letter-grade">${s.huruf}</span></td>
      <td><button class="btn-del" onclick="hapusSiswa(${s.id})" title="Hapus">×</button></td>
    </tr>
  `).join('');

  wrap.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Rank</th>
          <th>Nama Siswa</th>
          <th style="text-align:center">Nilai</th>
          <th style="text-align:center">Huruf</th>
          <th style="text-align:center">Hapus</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

document.getElementById('inputNama').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('inputNilai').focus();
});
document.getElementById('inputNilai').addEventListener('keydown', e => {
  if (e.key === 'Enter') tambahSiswa();
});

render();