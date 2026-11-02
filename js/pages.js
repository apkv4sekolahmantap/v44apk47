// ============================================================
// HALAMAN KHUSUS: Visi Misi, Generator Modul Ajar, Kuis Interaktif, Kartu Guru,
// Dashboard Perpustakaan, Neraca, Laporan Koperasi, Backup & Hapus Data
// ============================================================

// ── Visi & Misi ──
async function renderVisi(){
  const r=await api('getSettings'),c=r.cfg||{};S.cfg=Object.assign(S.cfg||{},c);
  const lines=t=>String(t||'').split('\n').map(x=>x.trim().replace(/^\d+[.)]\s*/,'')).filter(Boolean);
  const ol=t=>{const l=lines(t);return l.length?'<ol class="mb-0 ps-3">'+l.map(x=>'<li class="mb-1">'+esc(x)+'</li>').join('')+'</ol>':'<span class="text-secondary">Belum diisi.</span>'};
  const lg=thumb(c.logoUrl),box=(ic,t,b)=>`<div class="card-x p-4 mb-3"><h2 class="h5 mb-3"><i class="bi ${ic} text-primary"></i> ${t}</h2>${b}</div>`;
  $('app-container').innerHTML=`<div class="card-x p-4 mb-3 text-center"><div class="logo-img brand-ic mx-auto mb-2" style="width:72px;height:72px">${lg?'<img alt="Logo" src="'+lg+'">':''}</div><h2 class="h4 fw-extra mb-1">${esc(c.schoolName||'Nama Sekolah')}</h2><div class="text-secondary small">${[c.nss?'NSS '+esc(c.nss):'',c.npsn?'NPSN '+esc(c.npsn):''].filter(Boolean).join(' · ')}${c.nss||c.npsn?' · ':''}${esc(c.alamat||'')}</div><div class="text-secondary small">${[c.telepon,c.email,c.website].filter(Boolean).map(esc).join(' · ')}</div>${r.isAdmin?'<button class="btn btn-pri mt-3" onclick="visiEdit()"><i class="bi bi-pencil"></i> Ubah Visi, Misi & Profil</button>':''}</div>
   ${box('bi-eye','Visi',c.visi?'<p class="fs-5 mb-0" style="white-space:pre-line">“'+esc(c.visi)+'”</p>':'<span class="text-secondary">Belum diisi.</span>')}
   ${box('bi-bullseye','Misi',ol(c.misi))}${box('bi-flag','Tujuan Sekolah',ol(c.tujuan))}${c.sejarah?box('bi-clock-history','Sejarah Singkat','<p class="mb-0" style="white-space:pre-line">'+esc(c.sejarah)+'</p>'):''}`;
}
function visiEdit(){
  const c=S.cfg||{},ta=(k,l,r)=>`<div class="col-12"><label class="form-label small fw-semibold" for="v_${k}">${l}</label><textarea class="form-control" id="v_${k}" rows="${r}">${esc(c[k]||'')}</textarea></div>`,ip=(k,l)=>`<div class="col-md-6"><label class="form-label small fw-semibold" for="v_${k}">${l}</label><input class="form-control" id="v_${k}" value="${esc(c[k]||'')}"></div>`;
  openModal('Ubah Visi, Misi & Profil',`<div class="row g-3">${ta('visi','Visi',3)}${ta('misi','Misi (satu butir per baris)',6)}${ta('tujuan','Tujuan Sekolah (satu butir per baris)',5)}${ta('sejarah','Sejarah singkat',4)}${ip('nss','NSS (Nomor Statistik Sekolah)')}${ip('npsn','NPSN (Nomor Pokok Sekolah Nasional)')}${ip('telepon','Telepon')}${ip('email','Email')}${ip('website','Website')}</div>`,'<button class="btn btn-light" data-bs-dismiss="modal">Batal</button><button class="btn btn-pri" id="vSv">Simpan</button>','modal-lg');
  $('vSv').onclick=async()=>{const o={};['visi','misi','tujuan','sejarah','nss','npsn','telepon','email','website'].forEach(k=>o[k]=$('v_'+k).value.trim());
    try{$('vSv').disabled=true;await api('saveSettings',o);Object.assign(S.cfg,o);closeModal();toast('Berhasil','Visi & misi tersimpan.','success');renderVisi()}catch(e){fail(e);$('vSv').disabled=false}};
}

// ── Generator RPP / Modul Ajar (berbasis templat — draf yang perlu disesuaikan guru) ──
const DIMF=['Keimanan dan Ketakwaan terhadap Tuhan YME','Kewargaan','Penalaran Kritis','Kreativitas','Kolaborasi','Kemandirian','Kesehatan','Komunikasi'];
const RPP_MODEL={
 'Problem Based Learning (PBL)':[['Orientasi pada masalah','Guru menyajikan masalah kontekstual terkait {t} dan memotivasi siswa untuk terlibat.'],['Mengorganisasikan peserta didik','Siswa dibagi dalam kelompok dan merencanakan langkah pemecahan masalah tentang {t}.'],['Membimbing penyelidikan','Siswa mengumpulkan informasi/melakukan pengamatan terkait {t}; guru membimbing.'],['Mengembangkan dan menyajikan hasil','Kelompok menyusun dan mempresentasikan hasil penyelidikan mengenai {t}.'],['Menganalisis dan mengevaluasi proses','Guru dan siswa merefleksikan proses pemecahan masalah dan menarik kesimpulan tentang {t}.']],
 'Project Based Learning (PjBL)':[['Pertanyaan esensial','Guru mengajukan pertanyaan esensial tentang {t} sebagai pemantik proyek.'],['Merancang proyek','Kelompok merancang proyek terkait {t}: tujuan, alat bahan, dan pembagian tugas.'],['Menyusun jadwal','Guru dan siswa menyepakati tahapan dan jadwal penyelesaian proyek.'],['Melaksanakan dan memantau proyek','Siswa mengerjakan proyek; guru memantau kemajuan dan memberi umpan balik.'],['Mempresentasikan hasil','Kelompok menampilkan produk/proyek tentang {t} dan menerima tanggapan.'],['Evaluasi dan refleksi','Siswa dan guru merefleksikan pengalaman dan hasil proyek.']],
 'Discovery Learning':[['Stimulasi','Guru memberikan rangsangan (gambar/cerita/benda) yang berkaitan dengan {t}.'],['Identifikasi masalah','Siswa merumuskan pertanyaan atau dugaan awal tentang {t}.'],['Pengumpulan data','Siswa mengamati, membaca, atau bereksperimen untuk mengumpulkan informasi.'],['Pengolahan data','Siswa mengolah dan menganalisis informasi yang diperoleh.'],['Pembuktian','Siswa memeriksa kebenaran dugaan dengan data yang telah dikumpulkan.'],['Menarik kesimpulan','Siswa menyimpulkan konsep {t} dengan bimbingan guru.']],
 'Inkuiri Terbimbing':[['Orientasi','Guru mengenalkan topik {t} dan tujuan pembelajaran.'],['Merumuskan masalah','Siswa merumuskan pertanyaan inkuiri.'],['Mengajukan hipotesis','Siswa membuat jawaban sementara.'],['Mengumpulkan data','Siswa melakukan pengamatan/percobaan sederhana.'],['Menguji hipotesis','Siswa menguji jawaban sementara dengan data.'],['Merumuskan kesimpulan','Siswa menyampaikan kesimpulan tentang {t}.']],
 'Kooperatif (Jigsaw/TGT)':[['Penyampaian tujuan dan motivasi','Guru menyampaikan tujuan pembelajaran {t} dan membangkitkan motivasi.'],['Pembentukan kelompok','Siswa dibagi dalam kelompok asal dan kelompok ahli.'],['Kerja kelompok ahli','Setiap ahli mempelajari bagian materi {t} lalu membelajarkannya kepada kelompok asal.'],['Presentasi dan diskusi','Kelompok menyajikan hasil dan berdiskusi.'],['Kuis dan penghargaan','Guru memberi kuis singkat dan penghargaan kelompok.']],
 'Pembelajaran Langsung (Direct Instruction)':[['Orientasi','Guru menyampaikan tujuan dan mengaitkan {t} dengan pengalaman siswa.'],['Presentasi/demonstrasi','Guru menjelaskan dan mendemonstrasikan konsep/keterampilan {t}.'],['Latihan terbimbing','Siswa berlatih dengan bimbingan guru.'],['Umpan balik','Guru memeriksa pemahaman dan memberi umpan balik.'],['Latihan mandiri','Siswa berlatih mandiri untuk memperkuat pemahaman.']]
};
async function renderRpp(){
  const mp=(()=>{try{return S.mapelRpp}catch(e){return null}})();
  $('app-container').innerHTML=`<div class="row g-3"><div class="col-lg-4"><div class="card-x p-3"><h2 class="h6 mb-1"><i class="bi bi-magic"></i> Generator Modul Ajar</h2><p class="small text-secondary">Isi data berikut; sistem menyusun draf Modul Ajar format Kurikulum Merdeka. Hasilnya <b>draf berbasis templat</b> — mohon dibaca dan disesuaikan sebelum digunakan.</p>
   <div class="row g-2">
   <div class="col-12"><label class="form-label small fw-semibold" for="rN">Nama penyusun</label><input id="rN" class="form-control" value="${esc(S.user.Nama)}"></div>
   <div class="col-12"><label class="form-label small fw-semibold" for="rM">Mata pelajaran</label><input id="rM" class="form-control" placeholder="mis. Matematika"></div>
   <div class="col-12"><label class="form-label small fw-semibold" for="rF">Fase / Kelas</label><select id="rF" class="form-select">${['Fase A (Kelas 1)','Fase A (Kelas 2)','Fase B (Kelas 3)','Fase B (Kelas 4)','Fase C (Kelas 5)','Fase C (Kelas 6)'].map(x=>`<option>${x}</option>`).join('')}</select></div>
   <div class="col-6"><label class="form-label small fw-semibold" for="rS">Semester</label><select id="rS" class="form-select"><option>Ganjil</option><option>Genap</option></select></div>
   <div class="col-6"><label class="form-label small fw-semibold" for="rP">Jumlah pertemuan</label><input id="rP" type="number" min="1" max="6" value="2" class="form-control"></div>
   <div class="col-12"><label class="form-label small fw-semibold" for="rA">Alokasi waktu per pertemuan</label><input id="rA" class="form-control" value="2 × 35 menit"></div>
   <div class="col-12"><label class="form-label small fw-semibold" for="rT">Topik / materi</label><input id="rT" class="form-control" placeholder="mis. Pecahan senilai"></div>
   <div class="col-12"><label class="form-label small fw-semibold" for="rG">Tujuan pembelajaran (satu per baris)</label><textarea id="rG" class="form-control" rows="4" placeholder="Peserta didik mampu …"></textarea></div>
   <div class="col-12"><label class="form-label small fw-semibold" for="rD">Model pembelajaran</label><select id="rD" class="form-select">${Object.keys(RPP_MODEL).map(x=>`<option>${x}</option>`).join('')}</select></div>
   <div class="col-12"><label class="form-label small fw-semibold" for="rR">Sarana & prasarana</label><input id="rR" class="form-control" value="Buku siswa, LKPD, media gambar/video, alat peraga"></div>
   <div class="col-12"><div class="small fw-semibold mb-1">Dimensi Profil Lulusan</div>${DIMF.map((d,i)=>`<div class="form-check"><input class="form-check-input rDm" type="checkbox" value="${esc(d)}" id="rd${i}" ${i<3?'checked':''}><label class="form-check-label small" for="rd${i}">${esc(d)}</label></div>`).join('')}</div>
   <div class="col-12"><button class="btn btn-pri w-100" onclick="rppGen()"><i class="bi bi-magic"></i> Susun Modul Ajar</button></div></div></div></div>
   <div class="col-lg-8"><div id="rppWrap" class="card-x p-3"><div class="text-center text-secondary py-5">Draf akan tampil di sini. Anda dapat mengeditnya langsung.</div></div></div></div>`;
}
function rppBuild(v){
  const t=v.topik,e=esc,tp=v.tp.split('\n').map(x=>x.trim()).filter(Boolean),steps=RPP_MODEL[v.model],pert=Math.max(1,Math.min(6,+v.pert||1)),per=Math.ceil(steps.length/pert);
  const S1=s=>s.replace(/\{t\}/g,t),th=S.ta||'',P='font-size:13px;line-height:1.5';
  const tabel=rows=>'<table border="1" cellpadding="5" style="border-collapse:collapse;width:100%;'+P+'">'+rows.map(r=>'<tr><td style="width:32%;background:#f3f4f6"><b>'+r[0]+'</b></td><td>'+r[1]+'</td></tr>').join('')+'</table>';
  const ol=a=>'<ol style="margin:4px 0">'+a.map(x=>'<li>'+x+'</li>').join('')+'</ol>';
  let keg='';
  for(let p=0;p<pert;p++){
    let st=steps.slice(p*per,(p+1)*per);if(!st.length)st=[['Penguatan dan latihan','Siswa berlatih menerapkan pemahaman tentang {t} pada situasi baru.']];
    keg+=`<h4>Pertemuan ${p+1}</h4><p><b>Pendahuluan (±15% waktu)</b></p>${ol(['Guru membuka dengan salam, doa, dan mengecek kehadiran serta kesiapan belajar (<i>berkesadaran</i>).','Guru mengaitkan materi dengan pengalaman siswa dan menyampaikan tujuan pembelajaran.','Guru mengajukan pertanyaan pemantik: “'+e(S1('Apa yang kamu ketahui tentang {t}?'))+'”.'])}
    <p><b>Kegiatan Inti (±70% waktu)</b></p>${ol(st.map(s=>'<b>'+e(s[0])+'.</b> '+e(S1(s[1]))))}
    <p><b>Penutup (±15% waktu)</b></p>${ol(['Siswa dan guru menyimpulkan pembelajaran '+e(t)+' (<i>bermakna</i>).','Guru memberikan asesmen formatif singkat/umpan balik dan refleksi: “Apa yang sudah kupahami? Bagian mana yang masih sulit?”','Guru menyampaikan rencana pembelajaran berikutnya, menutup dengan doa dan salam (<i>menggembirakan</i>).'])}`;
  }
  const rub='<table border="1" cellpadding="5" style="border-collapse:collapse;width:100%;'+P+'"><tr style="background:#f3f4f6"><th>Tujuan Pembelajaran</th><th>Perlu Bimbingan</th><th>Cukup</th><th>Baik</th><th>Sangat Baik</th></tr>'+(tp.length?tp:['(isi tujuan pembelajaran)']).map(x=>'<tr><td>'+e(x)+'</td><td>Belum dapat mencapai tujuan meski dibimbing</td><td>Mencapai sebagian tujuan dengan bantuan</td><td>Mencapai tujuan dengan baik</td><td>Mencapai tujuan dan dapat menerapkannya pada situasi baru</td></tr>').join('')+'</table>';
  return `<div style="font-family:Arial,sans-serif;${P}"><h2 style="text-align:center;margin:0">MODUL AJAR</h2><h3 style="text-align:center;margin:2px 0 14px">${e(v.mapel)} — ${e(t)}</h3>
  <h3>A. INFORMASI UMUM</h3><h4>1. Identitas Modul</h4>${tabel([['Penyusun',e(v.nama)],['Satuan Pendidikan',e(v.sekolah)],['Mata Pelajaran',e(v.mapel)],['Fase / Kelas',e(v.fase)],['Semester / Tahun Ajaran',e(v.sem)+' / '+e(th)],['Topik',e(t)],['Alokasi Waktu',e(v.alokasi)+' × '+pert+' pertemuan'],['Model Pembelajaran',e(v.model)]])}
  <h4>2. Kompetensi Awal</h4><p>Peserta didik telah memiliki pengetahuan dan keterampilan dasar yang menunjang pembelajaran ${e(t)}. <i>(Sesuaikan dengan hasil asesmen diagnostik.)</i></p>
  <h4>3. Dimensi Profil Lulusan</h4>${ol(v.dim.map(e))}
  <h4>4. Sarana dan Prasarana</h4><p>${e(v.sarana)}</p>
  <h4>5. Target Peserta Didik</h4><p>Peserta didik reguler/tipikal. Pembelajaran dapat dideferensiasi sesuai kesiapan, minat, dan gaya belajar siswa.</p>
  <h3>B. KOMPONEN INTI</h3><h4>1. Tujuan Pembelajaran</h4>${tp.length?ol(tp.map(e)):'<p><i>(isi tujuan pembelajaran)</i></p>'}
  <h4>2. Pemahaman Bermakna</h4><p>Peserta didik memahami bahwa ${e(t)} berkaitan dengan kehidupan sehari-hari dan dapat diterapkan untuk menyelesaikan persoalan di sekitarnya.</p>
  <h4>3. Pertanyaan Pemantik</h4>${ol([e(S1('Apa yang kamu ketahui tentang {t}?')),e(S1('Mengapa {t} penting dalam kehidupan sehari-hari?')),e(S1('Bagaimana kita dapat menerapkan {t} di sekitar kita?'))])}
  <h4>4. Persiapan Pembelajaran</h4>${ol(['Guru menyiapkan media, alat peraga, dan LKPD terkait '+e(t)+'.','Guru menyiapkan asesmen diagnostik, formatif, dan sumatif.','Guru menata ruang kelas agar mendukung kerja kelompok.'])}
  <h4>5. Kegiatan Pembelajaran</h4><p><i>Prinsip pembelajaran mendalam: berkesadaran, bermakna, menggembirakan.</i></p>${keg}
  <h4>6. Asesmen</h4>${ol(['<b>Diagnostik:</b> tanya jawab/kuis singkat di awal untuk mengetahui kesiapan belajar.','<b>Formatif:</b> observasi, tanya jawab, dan hasil LKPD selama pembelajaran.','<b>Sumatif:</b> tes tertulis/produk/unjuk kerja di akhir lingkup materi.'])}<p><b>Rubrik Penilaian</b></p>${rub}
  <h4>7. Pengayaan dan Remedial</h4><p><b>Pengayaan:</b> tugas lanjutan/penerapan ${e(t)} dalam konteks baru bagi siswa yang telah mencapai tujuan. <b>Remedial:</b> bimbingan ulang dengan media konkret dan latihan bertahap bagi siswa yang belum mencapai tujuan.</p>
  <h4>8. Refleksi</h4><p><b>Peserta didik:</b> Apa yang sudah kupahami? Bagian mana yang masih sulit? Apa yang akan kulakukan agar lebih paham?<br><b>Guru:</b> Apakah tujuan pembelajaran tercapai? Bagian mana yang perlu diperbaiki pada pertemuan berikutnya?</p>
  <h3>C. LAMPIRAN</h3>${ol(['<b>LKPD:</b> Nama/Kelompok: ........ | Petunjuk: ........ | Langkah kegiatan: ........ | Pertanyaan/latihan: ........','<b>Bahan bacaan:</b> ringkasan materi '+e(t)+' (lengkapi).','<b>Glosarium:</b> istilah penting dalam materi (lengkapi).','<b>Daftar pustaka:</b> Buku Siswa dan Buku Guru '+e(v.mapel)+', Kemendikdasmen.'])}
  <table style="width:100%;margin-top:28px;${P}"><tr><td style="text-align:center">Mengetahui,<br>Kepala Sekolah<br><br><br><u>${e((S.cfg&&S.cfg.kepsekNama)||'..................')}</u></td><td style="text-align:center">Guru Mata Pelajaran<br><br><br><br><u>${e(v.nama)}</u></td></tr></table></div>`;
}
function rppGen(){
  const g=id=>($(id).value||'').trim(),v={nama:g('rN'),sekolah:sch(),mapel:g('rM'),fase:g('rF'),sem:g('rS'),pert:g('rP'),alokasi:g('rA'),topik:g('rT'),tp:$('rG').value,model:g('rD'),sarana:g('rR'),dim:[...document.querySelectorAll('.rDm:checked')].map(x=>x.value)};
  if(!v.mapel||!v.topik)return toast('Lengkapi','Mata pelajaran dan topik wajib diisi.','warning');
  S.rppV=v;
  $('rppWrap').innerHTML=`<div class="d-flex flex-wrap gap-2 mb-3"><button class="btn btn-sm btn-pri" onclick="rppSimpan()"><i class="bi bi-save"></i> Simpan ke Modul Ajar</button><button class="btn btn-sm btn-outline-secondary" onclick="rppWord()"><i class="bi bi-file-earmark-word"></i> Unduh Word</button><button class="btn btn-sm btn-outline-secondary" onclick="cetak($('rppOut').innerHTML)"><i class="bi bi-printer"></i> Cetak / PDF</button><button class="btn btn-sm btn-outline-secondary" onclick="rppSalin()"><i class="bi bi-clipboard"></i> Salin teks</button></div><div class="small text-secondary mb-2">Klik pada dokumen untuk mengedit langsung sebelum disimpan atau diunduh.</div><div id="rppOut" contenteditable="true" style="border:1px dashed var(--bs-border-color);border-radius:8px;padding:14px;max-height:75vh;overflow:auto">${rppBuild(v)}</div>`;
  $('rppWrap').scrollIntoView({behavior:'smooth',block:'start'});
}
const rppWord=()=>dlDoc('Modul_Ajar_'+(S.rppV.mapel||'').replace(/\W+/g,'_')+'.doc',$('rppOut').innerHTML);
const rppSalin=()=>navigator.clipboard.writeText($('rppOut').innerText).then(()=>toast('Tersalin','Teks modul ajar disalin.','success'),()=>toast('Gagal','Salin tidak diizinkan peramban.','warning'));
async function rppSimpan(){
  const v=S.rppV,teks=$('rppOut').innerText.slice(0,45000);
  try{await api('saveRow','modulajar',{Judul:'Modul Ajar '+v.mapel+' - '+v.topik,Mapel:v.mapel,Kelas:v.fase,Semester:v.sem,Isi:teks});toast('Tersimpan','Modul ajar masuk ke menu Modul Ajar Tersimpan.','success')}catch(e){fail(e)}
}

// ── Kuis interaktif dari Bank Soal ──
async function renderKuis(){
  const r=await api('listRows','banksoal'),pg=r.rows.filter(x=>x.Tipe==='Pilihan Ganda'&&x.Soal&&x.Kunci&&[x.A,x.B,x.C,x.D].filter(Boolean).length>=2);
  if(!pg.length){$('app-container').innerHTML='<div class="card-x p-4 text-center"><div class="fs-1">🎯</div><h2 class="h5">Belum ada soal pilihan ganda</h2><p class="text-secondary">Tambahkan soal bertipe <b>Pilihan Ganda</b> lengkap dengan opsi dan kunci di menu <b>Bank Soal</b>, lalu kembali ke sini untuk memainkan kuis di kelas.</p><button class="btn btn-pri" onclick="navigateTo(\'banksoal\')">Buka Bank Soal</button></div>';return}
  const mp=[...new Set(pg.map(x=>x.Mapel))].sort();
  $('app-container').innerHTML=`<div class="card-x p-3 mb-3"><div class="row g-2 align-items-end"><div class="col-6 col-md-4"><label class="form-label small fw-semibold" for="kqM">Mata pelajaran</label><select id="kqM" class="form-select"><option value="">Semua</option>${mp.map(m=>`<option>${esc(m)}</option>`).join('')}</select></div><div class="col-6 col-md-3"><label class="form-label small fw-semibold" for="kqL">Level</label><select id="kqL" class="form-select"><option value="">Semua</option><option>Mudah</option><option>Sedang</option><option>Sulit</option><option>HOTS</option></select></div><div class="col-12 col-md-3"><button class="btn btn-pri w-100" onclick="kuisMulai()">Siapkan Kuis</button></div></div></div><div class="card-x p-3 p-md-4"><div id="gbody"><div class="text-center text-secondary py-4">Pilih mata pelajaran lalu tekan <b>Siapkan Kuis</b>. Tampilkan layar ini ke kelas untuk kuis bersama.</div></div></div>`;
  S.kuisBank=pg;
}
function kuisMulai(){
  const m=$('kqM').value,l=$('kqL').value,items=S.kuisBank.filter(x=>(!m||x.Mapel===m)&&(!l||x.Level===l)).map(x=>{
    const ops=['A','B','C','D'].filter(k=>x[k]).map(k=>[k,x[k]]),kk=String(x.Kunci).trim();let a=ops.findIndex(o=>o[0]===kk.toUpperCase());if(a<0)a=ops.findIndex(o=>o[1].toLowerCase()===kk.toLowerCase());
    return a<0?null:{q:x.Soal,o:ops.map(o=>o[1]),a:a,e:x.Pembahasan||''}}).filter(Boolean);
  if(items.length<2)return toast('Kurang','Soal yang cocok kurang dari 2 (pastikan kunci berupa huruf A-D atau teks opsi).','warning');
  quizRun($('gbody'),'Kuis '+(m||'Campuran'),'🎯',items,{desc:'Kuis dari Bank Soal sekolah.'});
}

// ── Kartu Guru (QR) ──
async function renderKartuGuru(){
  const r=await api('listRows','guru');S.kg=r.rows;await waitLib('QRCode');
  $('app-container').innerHTML=`<div class="card-x p-3 mb-3"><div class="d-flex flex-wrap gap-3 align-items-center"><div class="form-check"><input class="form-check-input" type="checkbox" id="kgF" checked onchange="drawKG()"><label class="form-check-label" for="kgF">Sertakan foto</label></div><span class="small text-secondary" id="kgI"></span><button class="btn btn-pri ms-auto" onclick="cetakKG()"><i class="bi bi-printer"></i> Cetak A4</button></div><div class="form-text mt-2">Cetak pada skala 100% (Actual Size). QR berisi kode <code>GURU-NIP</code>.</div></div><div id="kgP" style="zoom:.6;overflow:auto"></div>`;
  drawKG();
}
function drawKG(){
  const c=S.cfg||{},fo=$('kgF').checked,lg=thumb(c.logoUrl),L=S.kg,pages=[];for(let i=0;i<L.length;i+=8)pages.push(L.slice(i,i+8));
  const card=s=>{const t=thumb(s.FotoUrl);return `<div class="idc"><div class="idc-h">${lg?'<img alt="" src="'+lg+'">':''}<div><b>${esc((c.schoolName||'SEKOLAH').toUpperCase())}</b><small>${esc(c.alamat||'')}</small></div><em>KARTU GURU</em></div><div class="idc-b">${fo?'<div class="idc-f">'+(t?'<img alt="" src="'+t+'">':'')+'</div>':''}<div class="idc-t"><b>${esc(s.Nama)}</b><span>NIP: ${esc(s.NIP||'-')}</span><span>${esc(s.Jabatan||'')}</span></div><div class="idc-q" data-q="GURU-${esc(s.NIP||s.ID)}"></div></div><div class="idc-ft">Kepala Sekolah${c.kepsekNama?': '+esc(c.kepsekNama):''}</div></div>`};
  $('kgP').innerHTML=pages.map(p=>`<div class="sheet">${p.map(card).join('')}</div>`).join('')||'<div class="card-x p-4 text-center text-secondary">Belum ada data guru.</div>';
  document.querySelectorAll('#kgP [data-q]').forEach(e=>new QRCode(e,{text:e.dataset.q,width:90,height:90}));$('kgI').textContent=L.length+' kartu · '+pages.length+' lembar';
}
function cetakKG(){if(!$('kgP').querySelector('.sheet'))return toast('Kosong','Tidak ada kartu.','warning');$('printArea').innerHTML=$('kgP').innerHTML;setTimeout(()=>window.print(),400)}

// ── Dashboard Perpustakaan ──
async function renderPerpus(){
  const d=await api('getPerpus');await waitLib('Chart');Object.values(S.charts).forEach(c=>c.destroy());S.charts={};
  const k=(l,v,s,c,i)=>`<div class="col-6 col-lg"><div class="kpi" style="--c:${c}"><div class="kpi-i"><i class="bi ${i}"></i></div><div class="kpi-l">${l}</div><div class="kpi-v">${v}</div><div class="kpi-s">${s}</div></div></div>`;
  $('app-container').innerHTML=`<div class="row g-3 mb-3">${k('Judul Buku',d.judul,'terdaftar','#7C3AED','bi-book')}${k('Stok Tersedia',d.tersedia,'eksemplar','#10B981','bi-check2-square')}${k('Sedang Dipinjam',d.dipinjam,'transaksi','#F59E0B','bi-arrow-left-right')}${k('Terlambat',d.terlambat,'melewati jatuh tempo','#EF4444','bi-alarm')}${k('Anggota',d.anggota,'terdaftar','#06B6D4','bi-people')}</div>
   <div class="row g-3"><div class="col-lg-8"><div class="card-x p-3"><h2 class="h6">Peminjaman per bulan (${esc(d.tahun)})</h2><canvas id="pb" height="120"></canvas></div></div>
   <div class="col-lg-4"><div class="card-x p-3 mb-3"><h2 class="h6">Buku Terpopuler</h2>${d.populer.map((p,i)=>`<div class="d-flex justify-content-between small py-1 border-top"><span>${i+1}. ${esc(p.j)}</span><b>${p.n}×</b></div>`).join('')||'<div class="text-secondary small">Belum ada data.</div>'}</div>
   <div class="card-x p-3"><h2 class="h6">Peminjaman Terlambat</h2>${d.telatList.map(p=>`<div class="small py-1 border-top"><b>${esc(p.NISN)}</b> — ${esc(p.Judul)} <span class="text-danger">(jatuh tempo ${fTgl(p.JatuhTempo)})</span></div>`).join('')||'<div class="text-secondary small">Tidak ada keterlambatan.</div>'}</div></div>
   <div class="col-12"><div class="card-x p-3"><h2 class="h6">Stok per Kategori</h2><div class="d-flex flex-wrap gap-2">${d.kategori.map(x=>`<span class="pill bg-body-secondary">${esc(x.k)}: ${x.n}</span>`).join('')||'<span class="text-secondary small">Belum ada data.</span>'}</div></div></div></div>`;
  Chart.defaults.color=document.documentElement.getAttribute('data-theme')==='dark'?'#9FB0CC':'#475569';
  S.charts.p=new Chart($('pb'),{type:'bar',data:{labels:BLN.map(b=>b.slice(0,3)),datasets:[{label:'Peminjaman',data:d.bulanan,backgroundColor:'#7C3AED',borderRadius:6}]},options:{plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{precision:0}}}}});
}

// ── Neraca keuangan ──
async function renderNeraca(){
  const d=await api('neracaKeuangan');await waitLib('Chart');Object.values(S.charts).forEach(c=>c.destroy());S.charts={};S.ner=d;
  const k=(l,v,s,c)=>`<div class="col-6 col-lg-3"><div class="kpi" style="--c:${c}"><div class="kpi-l">${l}</div><div class="kpi-v" style="font-size:1.35rem">${v}</div><div class="kpi-s">${s}</div></div></div>`;
  const tb=(j,l,hasil)=>`<div class="col-lg-4"><div class="card-x p-3 h-100"><h2 class="h6">${j}</h2>${l.map(x=>`<div class="d-flex justify-content-between small py-1 border-top"><span>${esc(x[0])}</span><b>${rp(x[1])}</b></div>`).join('')||'<div class="small text-secondary">Belum ada data.</div>'}${hasil||''}</div></div>`;
  const n=d.neraca,ln=(a,b,bold)=>`<tr class="${bold?'fw-bold':''}"><td>${a}</td><td class="text-end">${rp(b)}</td></tr>`;
  $('app-container').innerHTML=`<div class="d-flex flex-wrap gap-2 mb-3 align-items-center"><span class="pill bg-body-secondary">Tahun ajaran ${esc(d.ta)}</span><span class="small text-secondary">Basis kas, dihitung dari data Pendapatan, Pembayaran Siswa, Pengeluaran, dan Honorarium (dibayar).</span><div class="ms-auto d-flex gap-2"><button class="btn btn-sm btn-outline-secondary" onclick="nerXls()"><i class="bi bi-file-earmark-excel"></i> Excel</button><button class="btn btn-sm btn-outline-secondary" onclick="nerCetak()"><i class="bi bi-printer"></i> Cetak</button></div></div>
   <div class="row g-3 mb-3">${k('Total Pemasukan',rp(d.totMasuk),'tahun ajaran ini','#10B981')}${k('Total Pengeluaran',rp(d.totKeluar),'tahun ajaran ini','#EF4444')}${k('Surplus / Defisit',rp(d.surplus),d.surplus>=0?'surplus':'defisit','#7C3AED')}${k('Saldo Kas Operasional',rp(n.kas),'seluruh periode','#06B6D4')}</div>
   <div class="card-x p-3 mb-3"><h2 class="h6">Arus kas per bulan</h2><canvas id="nc" height="110"></canvas></div>
   <div class="row g-3 mb-3">${tb('Pendapatan sekolah',d.pend)}${tb('Pembayaran siswa',d.pemb)}${tb('Pengeluaran',d.peng,d.honor?`<div class="d-flex justify-content-between small py-1 border-top"><span>Honorarium GTK (dibayar)</span><b>${rp(d.honor)}</b></div>`:'')}</div>
   <div class="card-x p-3" id="nerBox"><h2 class="h6">Neraca Sederhana (per hari ini)</h2><div class="row g-3"><div class="col-md-6"><table class="table table-sm"><thead><tr><th colspan="2">ASET</th></tr></thead><tbody>${ln('Kas operasional sekolah',n.kas)}${ln('Dana titipan (tabungan + E-Money)',n.tabungan+n.emoney)}${ln('Persediaan koperasi (harga beli)',n.persediaan)}${ln('Total Aset',n.aset,1)}</tbody></table></div>
   <div class="col-md-6"><table class="table table-sm"><thead><tr><th colspan="2">KEWAJIBAN & EKUITAS</th></tr></thead><tbody>${ln('Tabungan siswa',n.tabungan)}${ln('Saldo E-Money siswa',n.emoney)}${ln('Ekuitas (kas operasional + persediaan)',n.ekuitas)}${ln('Total Kewajiban & Ekuitas',n.kewajiban+n.ekuitas,1)}</tbody></table></div></div><div class="small text-secondary">Neraca ini disederhanakan dari data yang diinput di aplikasi dan bukan pengganti laporan keuangan resmi (mis. pertanggungjawaban BOS).</div></div>`;
  Chart.defaults.color=document.documentElement.getAttribute('data-theme')==='dark'?'#9FB0CC':'#475569';
  S.charts.n=new Chart($('nc'),{type:'bar',data:{labels:d.bulan.map(b=>BLN[+b.slice(5)-1].slice(0,3)+' '+b.slice(2,4)),datasets:[{label:'Pemasukan',data:d.masuk,backgroundColor:'#10B981',borderRadius:4},{label:'Pengeluaran',data:d.keluar,backgroundColor:'#EF4444',borderRadius:4}]},options:{scales:{y:{beginAtZero:true}}}});
}
function nerCetak(){cetak(kop()+'<h3 style="text-align:center">NERACA KEUANGAN — TA '+esc(S.ner.ta)+'</h3>'+$('nerBox').outerHTML)}
function nerXls(){const d=S.ner,n=d.neraca;xlsSave('Neraca_'+d.ta.replace('/','-')+'.xlsx',[['Ringkasan',[['Tahun ajaran',d.ta],['Total pemasukan',d.totMasuk],['Total pengeluaran',d.totKeluar],['Surplus/defisit',d.surplus],[],['Kas operasional',n.kas],['Tabungan siswa',n.tabungan],['E-Money siswa',n.emoney],['Persediaan koperasi',n.persediaan],['Total aset',n.aset],['Ekuitas',n.ekuitas]]],['Per Bulan',[['Bulan','Pemasukan','Pengeluaran']].concat(d.bulan.map((b,i)=>[b,d.masuk[i],d.keluar[i]]))],['Rincian',[['Jenis','Uraian','Jumlah']].concat(d.pend.map(x=>['Pendapatan',x[0],x[1]]),d.pemb.map(x=>['Pembayaran siswa',x[0],x[1]]),d.peng.map(x=>['Pengeluaran',x[0],x[1]]),[['Pengeluaran','Honorarium GTK',d.honor]])]])}

// ── Laporan keuangan koperasi ──
async function renderKopLap(){
  const f=S.kopF||{dari:tglIni().slice(0,8)+'01',sampai:tglIni()};
  const d=await api('laporanKoperasi',f.dari,f.sampai);S.kop=d;S.kopF=f;await waitLib('Chart');Object.values(S.charts).forEach(c=>c.destroy());S.charts={};
  const k=(l,v,s,c)=>`<div class="col-6 col-lg-3"><div class="kpi" style="--c:${c}"><div class="kpi-l">${l}</div><div class="kpi-v" style="font-size:1.35rem">${v}</div><div class="kpi-s">${s}</div></div></div>`;
  $('app-container').innerHTML=`<div class="card-x p-3 mb-3"><div class="row g-2 align-items-end"><div class="col-6 col-md-3"><label class="form-label small fw-semibold" for="kD">Dari</label><input type="date" id="kD" class="form-control" value="${esc(f.dari)}"></div><div class="col-6 col-md-3"><label class="form-label small fw-semibold" for="kS">Sampai</label><input type="date" id="kS" class="form-control" value="${esc(f.sampai)}"></div><div class="col-12 col-md-6 d-flex gap-2"><button class="btn btn-pri" onclick="S.kopF={dari:$('kD').value,sampai:$('kS').value};renderKopLap()">Terapkan</button><button class="btn btn-outline-secondary" onclick="kopXls()"><i class="bi bi-file-earmark-excel"></i> Excel</button><button class="btn btn-outline-secondary" onclick="kopCetak()"><i class="bi bi-printer"></i> Cetak</button></div></div></div>
   <div id="kopBox"><div class="row g-3 mb-3">${k('Omzet Penjualan',rp(d.omzet),d.transaksi+' transaksi','#7C3AED')}${k('Laba Kotor',rp(d.laba),'penjualan − harga beli','#10B981')}${k('Tunai / E-Money',rp(d.tunai)+' / '+rp(d.emoney),'metode pembayaran','#F59E0B')}${k('Nilai Persediaan',rp(d.persediaan),'harga beli × stok','#06B6D4')}</div>
   <div class="row g-3"><div class="col-lg-7"><div class="card-x p-3 mb-3"><h2 class="h6">Penjualan harian</h2><canvas id="kc" height="120"></canvas></div><div class="card-x p-3"><h2 class="h6">Penjualan per barang</h2><div class="table-responsive"><table class="table table-sm"><thead><tr><th>Barang</th><th class="text-end">Qty</th><th class="text-end">Omzet</th><th class="text-end">Laba</th></tr></thead><tbody>${d.barang.map(b=>`<tr><td>${esc(b.Barang)}</td><td class="text-end">${b.Qty}</td><td class="text-end">${rp(b.Total)}</td><td class="text-end">${rp(b.Laba)}</td></tr>`).join('')||'<tr><td colspan="4" class="text-center text-secondary">Belum ada penjualan pada periode ini.</td></tr>'}</tbody></table></div></div></div>
   <div class="col-lg-5"><div class="card-x p-3"><h2 class="h6"><i class="bi bi-exclamation-triangle text-warning"></i> Stok Menipis</h2>${d.menipis.map(m=>`<div class="d-flex justify-content-between small py-1 border-top"><span>${esc(m.Nama)}</span><b class="text-danger">${m.Stok} (min ${m.Min})</b></div>`).join('')||'<div class="small text-secondary">Semua stok aman.</div>'}</div></div></div></div>`;
  Chart.defaults.color=document.documentElement.getAttribute('data-theme')==='dark'?'#9FB0CC':'#475569';
  S.charts.k=new Chart($('kc'),{type:'bar',data:{labels:d.harian.map(h=>fTgl(h.Tanggal).slice(0,5)),datasets:[{label:'Omzet',data:d.harian.map(h=>h.Total),backgroundColor:'#7C3AED',borderRadius:4},{label:'Laba',data:d.harian.map(h=>h.Laba),backgroundColor:'#10B981',borderRadius:4}]},options:{scales:{y:{beginAtZero:true}}}});
}
const kopCetak=()=>cetak(kop()+'<h3 style="text-align:center">LAPORAN KEUANGAN KOPERASI SEKOLAH</h3><p style="text-align:center">Periode '+fTgl(S.kop.dari)+' s/d '+fTgl(S.kop.sampai)+'</p>'+$('kopBox').innerHTML.replace(/<canvas[^>]*><\/canvas>/g,''));
function kopXls(){const d=S.kop;xlsSave('Laporan_Koperasi.xlsx',[['Ringkasan',[['Periode',d.dari+' s/d '+d.sampai],['Omzet',d.omzet],['Laba kotor',d.laba],['Tunai',d.tunai],['E-Money',d.emoney],['Jumlah transaksi',d.transaksi],['Nilai persediaan',d.persediaan]]],['Per Barang',[['Barang','Qty','Omzet','Laba']].concat(d.barang.map(b=>[b.Barang,b.Qty,b.Total,b.Laba]))],['Harian',[['Tanggal','Omzet','Laba']].concat(d.harian.map(h=>[h.Tanggal,h.Total,h.Laba]))]])}

// ── Backup & hapus data ──
async function renderBackup(){
  const d=await net('listBackup');
  $('app-container').innerHTML=`<div class="row g-3"><div class="col-lg-6"><div class="card-x p-3 mb-3"><h2 class="h6"><i class="bi bi-cloud-arrow-up"></i> Backup Database</h2><p class="small text-secondary">Membuat salinan seluruh database (Google Sheets) ke folder <b>Backup</b> di Google Drive sekolah. Sebaiknya dilakukan rutin, misalnya setiap awal bulan.</p><button class="btn btn-pri" id="bkB" onclick="doBackup()"><i class="bi bi-cloud-arrow-up"></i> Buat Backup Sekarang</button></div>
   <div class="card-x p-3"><h2 class="h6">Riwayat Backup</h2>${d.files.map(f=>`<div class="d-flex justify-content-between small py-1 border-top"><span>${esc(f.nama)}</span><span class="text-nowrap"><span class="text-secondary">${esc(f.tgl)}</span> <a href="${esc(f.url)}" target="_blank" rel="noopener">Buka</a></span></div>`).join('')||'<div class="small text-secondary">Belum ada backup.</div>'}<div class="form-text mt-2">Untuk memulihkan data: buka berkas backup, lalu salin sheet yang diperlukan ke database aktif.</div></div></div>
   <div class="col-lg-6"><div class="card-x p-3 border-danger"><h2 class="h6 text-danger"><i class="bi bi-trash"></i> Hapus Data</h2><div class="alert alert-warning small">Penghapusan <b>tidak dapat dibatalkan</b> dari aplikasi. Sebuah salinan backup dibuat otomatis sebelum data dihapus. Data pengguna, pengaturan, dan tahun ajaran tidak ikut terhapus.</div>
   <label class="form-label small fw-semibold" for="hdM">Data yang dihapus</label><select id="hdM" class="form-select mb-2">${d.modul.map(m=>`<option value="${esc(m.id)}">${esc(m.judul)}</option>`).join('')}<option value="__semua__">⚠ SEMUA DATA (kecuali pengguna, pengaturan, tahun ajaran)</option></select>
   <label class="form-label small fw-semibold" for="hdK">Ketik <b id="hdW">HAPUS</b> untuk konfirmasi</label><input id="hdK" class="form-control mb-3" autocomplete="off"><button class="btn btn-danger" id="hdB" onclick="doHapus()"><i class="bi bi-trash"></i> Hapus Data</button></div></div></div>`;
  $('hdM').onchange=()=>$('hdW').textContent=$('hdM').value==='__semua__'?'HAPUS SEMUA':'HAPUS';
}
async function doBackup(){const b=$('bkB');b.disabled=true;b.innerHTML='<span class="spinner-border spinner-border-sm"></span> Membuat backup…';try{const r=await net('backupData');toast('Backup selesai',r.nama,'success');renderBackup()}catch(e){fail(e);b.disabled=false;b.textContent='Buat Backup Sekarang'}}
async function doHapus(){
  const m=$('hdM').value,w=m==='__semua__'?'HAPUS SEMUA':'HAPUS',nm=$('hdM').selectedOptions[0].textContent;
  if($('hdK').value!==w)return toast('Konfirmasi','Ketik "'+w+'" persis (huruf kapital) untuk melanjutkan.','warning');
  if(!confirm('Yakin menghapus: '+nm+'?\nBackup otomatis akan dibuat lebih dulu.'))return;
  const b=$('hdB');b.disabled=true;b.innerHTML='<span class="spinner-border spinner-border-sm"></span> Memproses…';
  try{const r=await api('hapusData',m,$('hdK').value);Object.keys(CACHE).forEach(k=>delete CACHE[k]);S.sisAll=null;toast('Selesai',r.dihapus+' baris dihapus. Backup: '+r.backup,'success');renderBackup()}catch(e){fail(e);b.disabled=false;b.textContent='Hapus Data'}
}
