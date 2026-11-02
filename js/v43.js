// ============================================================
// v4.3 — pemetaan halaman baru, akun orang tua, Kehadiran Anak
// ============================================================
Object.assign(PAGE,{inputnilai:'renderInputNilai',gensoal:'renderGenSoal',lkpd:'renderLkpd',kehadiranku:'renderKehadiranAnak'});
Object.assign(IC,{inputnilai:'bi-grid-3x3-gap',gensoal:'bi-patch-question',lkpd:'bi-brush',kehadiranku:'bi-calendar-check',g_baca:'bi-book-half',g_hitung:'bi-123',g_rumus:'bi-calculator',g_coding:'bi-code-slash'});
const _tbxSinkron=()=>S.user.Role==='Admin'?'<button class="btn btn-outline-primary" onclick="sinkronOrtuUI()" title="Buat akun orang tua dari nomor HP pada Data Siswa"><i class="bi bi-people"></i> Sinkronkan Akun Orang Tua</button>':'';
TBX.siswa=_tbxSinkron;TBX.users=_tbxSinkron;
async function sinkronOrtuUI(){
  if(!confirm('Buat/perbarui akun orang tua dari kolom "No. HP Orang Tua" semua siswa aktif?\nUsername & password awal = nomor HP (08xxxxxxxxxx).'))return;
  try{const r=await net('sinkronOrtu');Object.keys(CACHE).forEach(k=>{if(/listRows\|\["(users|siswa)"/.test(k))delete CACHE[k]});toast('Selesai',r.baru+' akun baru, '+r.diperbarui+' diperbarui, '+r.tanpaHP+' siswa tanpa nomor HP (dari '+r.totalSiswa+' siswa).','success')}catch(e){fail(e)}
}
async function renderKehadiranAnak(){
  const d=await api('kehadiranAnak');
  const cards=d.anak.map(a=>`<div class="card-x p-3 mb-3"><div class="d-flex flex-wrap align-items-center gap-2 mb-2"><div class="avatar">${esc(a.Nama.split(' ').map(w=>w[0]).slice(0,2).join(''))}</div><div><div class="fw-bold">${esc(a.Nama)}</div><div class="small text-secondary">Kelas ${esc(a.Kelas)} · NISN ${esc(a.NISN)} · TA ${esc(d.ta)}</div></div></div><div class="row g-2">${pstCards(a.pst,'hari',true)}</div></div>`).join('')||'<div class="card-x p-4 text-center text-secondary">Belum ada data anak pada akun ini.</div>';
  const nm=[...new Set(d.rows.map(r=>r.Nama))];
  $('app-container').innerHTML=`${cards}<div class="card-x p-3"><div class="d-flex flex-wrap gap-2 align-items-center mb-2"><h2 class="h6 m-0 me-auto">Riwayat Kehadiran</h2>${nm.length>1?`<select id="kaN" class="form-select w-auto" onchange="kaDraw()"><option value="">Semua anak</option>${nm.map(n=>`<option>${esc(n)}</option>`).join('')}</select>`:''}<select id="kaS" class="form-select w-auto" onchange="kaDraw()"><option value="Kelas">Absensi kelas (harian)</option><option value="">Semua sesi</option></select></div><div class="table-responsive"><table class="table table-sm"><thead><tr><th>Tanggal</th><th>Anak</th><th>Status</th><th>Sesi</th><th>Jam</th></tr></thead><tbody id="kaB"></tbody></table></div></div>`;
  S.kaRows=d.rows;kaDraw();
}
function kaDraw(){
  const n=$('kaN')?$('kaN').value:'',s=$('kaS').value,rs=S.kaRows.filter(r=>(!n||r.Nama===n)&&(!s||r.Sesi===s));
  $('kaB').innerHTML=rs.map(r=>`<tr><td>${fTgl(r.Tanggal)}</td><td>${esc(r.Nama)}</td><td><span class="pill" style="background:${(ST[r.Status]||ST.Hadir)[0]};color:${(ST[r.Status]||ST.Hadir)[1]}">${esc(r.Status)}</span></td><td>${esc(r.Sesi==='Kelas'?'Kelas':r.Sesi)}</td><td>${esc(r.Jam)}</td></tr>`).join('')||'<tr><td colspan="5" class="text-center text-secondary">Belum ada data.</td></tr>';
}

// ============================================================
// TURBO (gas-scale-turbo): pemanasan server, batch baca, antrean notifikasi, catatan kinerja
// ============================================================
const PERF={log:[]};
function perfNote(fn,r){PERF.log.push([fn,r.ms||0,!!r.cached,r.v||'']);if(PERF.log.length>80)PERF.log.shift();window.__perf=PERF} // lihat di konsol: __perf.log
let _drainT=0;
function drainSoon(){clearTimeout(_drainT);_drainT=setTimeout(()=>{if(!S.token)return;net('drainNotif').then(r=>{if(r&&r.left>0)drainSoon()}).catch(()=>{})},700)}
function warmUp(){ // bangunkan server saat halaman login terbuka (maks 1× / 4 menit)
  try{if(typeof GAS_URL==='undefined'||!GAS_URL||GAS_URL.indexOf('PASTE')>=0)return;const k='warm_t';if(Date.now()-(+sessionStorage.getItem(k)||0)<240000)return;sessionStorage.setItem(k,String(Date.now()));fetch(GAS_URL+'?w=1',{mode:'no-cors'}).catch(()=>{})}catch(e){}
}
warmUp();
async function batchLoad(jobs){ // jobs: [[fn,...args tanpa token]] → 1 permintaan; hasil diisikan ke CACHE (kunci sama dengan api())
  const calls=jobs.map(j=>({a:j[0],g:[S.token].concat(j.slice(1),TAFN[j[0]]?[S.ta||'']:[])}));
  const out=await net('apiBatch',calls);
  out.forEach((r,i)=>{if(r&&r.success){const key=jobs[i][0]+'|'+JSON.stringify(jobs[i].slice(1));CACHE[key]=JSON.stringify(r.data);if(window.perfNote)perfNote(jobs[i][0],r)}});
  pc();
}
async function prefetchAll(){ // semua halaman daftar dimuat dalam beberapa permintaan batch (10 aksi per eksekusi server)
  const skip={daftarwajah:1,kuis:1,rpp:1,gensoal:1,lkpd:1,inputnilai:1,arsip:1,backup:1,kenaikan:1,visimisi:1};
  const jobs=[];
  for(const x of S.menu||[]){
    if(skip[x.id]||/^[gt]_/.test(x.id))continue;
    let j=null;
    if(x.id==='dashboard')j=['getDashboard'];else if(x.id==='absensi')j=['getAbsensi','','',''];else if(x.id==='pengaturan')j=['getSettings'];else if(x.id==='kehadiranku')j=['kehadiranAnak'];
    else if(x.id==='kartu'||x.id==='kartupelajar')j=['listRows','siswa'];
    else if(MODS_FE_LIST(x.id))j=['listRows',x.id];
    if(!j)continue;const key=j[0]+'|'+JSON.stringify(j.slice(1));
    if(CACHE[key]===undefined&&!INF[key]&&!jobs.some(q=>q[0]+'|'+JSON.stringify(q.slice(1))===key))jobs.push(j);
  }
  const chunks=[];for(let i=0;i<jobs.length;i+=8)chunks.push(jobs.slice(i,i+8));
  const w=async()=>{while(chunks.length&&S.token){const c=chunks.shift();try{await batchLoad(c)}catch(e){}}};
  await new Promise(r=>setTimeout(r,900));           // beri kesempatan halaman pertama tampil lebih dulu
  await Promise.all([w(),w()]);
}
const MODS_FE_LIST=id=>!['visimisi','neraca','perpusdash','kop_laporan','kopLap','laporan','scan','wajah','kenaikan','infaqlap','boslap','rekapbos','rapor'].includes(id)&&!/^[gt]_/.test(id);
// data presensi/nilai yang baru disimpan harus tampil segera: kosongkan cache baca terkait
['saveAbsensi','nilaiSimpan'].forEach(f=>{WR[f]=1});

// ============================================================
// KARTU PELAJAR (identitas siswa + QR presensi): depan & belakang, siap cetak bolak-balik
// ============================================================
async function renderKartu(){
  try{
    const r=await api('listRows','siswa');S.kt=r.rows;await waitLib('QRCode');const kl=[...new Set(r.rows.map(s=>s.Kelas))].sort((a,b)=>String(a).localeCompare(String(b),undefined,{numeric:true}));
    $('app-container').innerHTML=`<div class="card-x p-3 mb-3"><div class="row g-2 align-items-end">
      <div class="col-6 col-md-2"><label class="form-label small fw-semibold" for="kK">Kelas</label><select class="form-select" id="kK" onchange="drawKartu()">${kl.map(k=>`<option>${esc(k)}</option>`).join('')}</select></div>
      <div class="col-6 col-md-2"><label class="form-label small fw-semibold" for="kT">Tahun ajaran</label><input class="form-control" id="kT" value="${esc(S.ta||'')}" oninput="drawKartu()"></div>
      <div class="col-12 col-md-4 pb-1"><div class="d-flex flex-wrap gap-3"><div class="form-check"><input class="form-check-input" type="checkbox" id="kF" checked onchange="drawKartu()"><label class="form-check-label" for="kF">Foto siswa</label></div><div class="form-check"><input class="form-check-input" type="checkbox" id="kB" checked onchange="drawKartu()"><label class="form-check-label" for="kB">Sisi belakang</label></div></div></div>
      <div class="col-12 col-md-4 d-flex gap-2 align-items-center justify-content-md-end"><span class="small text-secondary" id="kInfo"></span><button class="btn btn-pri" onclick="printKartu()"><i class="bi bi-printer"></i> Cetak A4</button></div></div>
      <div class="form-text mt-2">Kartu pelajar sekaligus <b>kartu presensi QR</b> (ukuran KTP 85,6 × 54 mm). Cetak skala <b>100% / Actual Size</b>, kertas 210–260 gsm. Untuk bolak-balik pilih <b>cetak dua sisi, balik pada sisi panjang</b>; halaman belakang sudah disusun cermin agar sejajar dengan sisi depan.</div></div>
      <div id="kPrev" style="zoom:.6;overflow:auto"></div>`;
    kl.length?drawKartu():$('kPrev').innerHTML='<div class="card-x p-4 text-center text-secondary">Belum ada data siswa.</div>';
  }catch(e){fail(e)}
}
function drawKartu(){
  const c=S.cfg||{},k=$('kK').value,fo=$('kF').checked,bk=$('kB').checked,th=($('kT').value||S.ta||'').trim(),lg=thumb(c.logoUrl);
  const sw=S.kt.filter(s=>s.Kelas===k).sort((a,b)=>String(a.Nama).localeCompare(String(b.Nama))),pages=[];
  for(let i=0;i<sw.length;i+=8)pages.push(sw.slice(i,i+8));
  const nm=(c.schoolName||'SEKOLAH').toUpperCase();
  const depan=s=>{const t=thumb(s.FotoUrl);return `<div class="idc"><div class="idc-h">${lg?'<img alt="" src="'+lg+'">':''}<div><b>${esc(nm)}</b><small>${esc(c.alamat||'')}</small></div><em>KARTU PELAJAR</em></div>
    <div class="idc-b">${fo?'<div class="idc-f">'+(t?'<img alt="" src="'+t+'">':'<span class="idc-nf">FOTO<br>3×4</span>')+'</div>':''}<div class="idc-t"><b>${esc(s.Nama)}</b><span>NISN : ${esc(s.NISN)}</span><span>Kelas : ${esc(s.Kelas)}</span>${s.JK?'<span>L/P : '+esc(s.JK)+'</span>':''}${s.TglLahir?'<span>Lahir : '+esc(fTgl(s.TglLahir))+'</span>':''}</div><div class="idc-q" data-q="${esc(s.QRKode)}"></div></div>
    <div class="idc-ft"><span>Berlaku TA ${esc(th)}</span><span>${c.npsn?'NPSN '+esc(c.npsn):''}</span></div></div>`};
  const belakang=()=>`<div class="idc idc-back"><div class="idc-h"><div><b>KARTU PELAJAR</b><small>${esc(nm)}</small></div><em>${esc(th)}</em></div><div class="idc-bb"><ol><li>Kartu ini adalah identitas resmi peserta didik dan <b>wajib dibawa</b> ke sekolah.</li><li>Kode QR digunakan untuk <b>presensi</b> kehadiran. Jaga agar tidak rusak/terlipat.</li><li>Jika hilang, segera lapor ke wali kelas.</li><li>Kartu ini tidak dapat dipindahtangankan.</li></ol>
    <div class="idc-sg"><div class="idc-ad">${esc(c.alamat||'')}${c.telepon?'<br>Telp. '+esc(c.telepon):''}</div><div class="idc-kp">Kepala Sekolah<br><br><u>${esc(c.kepsekNama||'.............')}</u>${c.kepsekNip?'<br>NIP. '+esc(c.kepsekNip):''}</div></div></div></div>`;
  const out=[];
  pages.forEach(p=>{out.push(`<div class="sheet">${p.map(depan).join('')}</div>`);
    if(bk){const rows=[];for(let i=0;i<p.length;i+=2)rows.push([p[i],p[i+1]]);out.push(`<div class="sheet">${rows.map(r=>(r[1]?belakang():'<div></div>')+(r[0]?belakang():'<div></div>')).join('')}</div>`)}});
  $('kPrev').innerHTML=out.join('');
  document.querySelectorAll('#kPrev [data-q]').forEach(e=>new QRCode(e,{text:e.dataset.q,width:90,height:90}));
  $('kInfo').textContent=sw.length+' siswa · '+out.length+' lembar';
}
function printKartu(){
  if(!$('kPrev').querySelector('.sheet')){toast('Kosong','Tidak ada kartu untuk dicetak.','warning');return}
  $('printArea').innerHTML='<style>@page{size:A4 portrait;margin:0}</style>'+$('kPrev').innerHTML;setTimeout(()=>window.print(),400);
}
