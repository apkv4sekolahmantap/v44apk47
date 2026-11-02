// ============================================================
// KENAIKAN KELAS & TAHUN AJARAN BARU  (menu Kesiswaan > Kenaikan Kelas, rute #/kenaikan-kelas)
// Hanya Admin / Kepala Sekolah yang dapat memproses; akun demo hanya melihat.
//
// Fungsi utama (sesuai permintaan):
//   renderHalamanKenaikanKelas()      → menggambar halaman
//   backupDataTahunan(meta)           → backup otomatis (server) + salinan ringan di localStorage
//   prosesKenaikanKelas(dataMapping)  → backup → terapkan bertahap (progress bar) → wali kelas, TA baru, laporan
//   undoKenaikan(runId)               → pulihkan ke kondisi sebelum proses (maks. 7 hari)
//
// Data siswa TIDAK dihapus. Server memperbarui kolom Kelas, TahunAjaran, Status, RiwayatKelas, TinggalKelas.
// Dibangun dengan JavaScript biasa + Bootstrap yang sudah dipakai aplikasi (tanpa framework baru).
// ============================================================

const KK_CHUNK=80;   // jumlah siswa per kiriman ke server (batas server 150)
const KK_ID=s=>String(s).replace(/[^\w-]/g,'');
const kkNk=s=>String(s||'').toUpperCase().replace(/[\s\-_.\/]/g,'');   // sama dengan nk() di server

// ── Pemetaan kelas otomatis: 1A→2A, 1-A→2-A, 5→6, kelas 6→LULUS ──
function kkNext(kelas,maxT){
  const m=/^(\d+)(\s*[-–.]?\s*)([A-Za-z0-9]*)$/.exec(String(kelas||'').trim());
  if(!m)return undefined;                       // format tak dikenal → diisi manual
  const t=+m[1];if(t>=maxT)return null;         // null = lulus
  return (t+1)+m[2]+m[3];
}
const kkTing=k=>{const m=/^(\d+)/.exec(String(k||'').trim());return m?+m[1]:0};

// ── Muat data & gambar halaman ──
async function renderHalamanKenaikanKelas(lap){
  const d=await net('kenaikanData');          // selalu data segar (tidak memakai cache)
  S.kk={d:d,map:{},src:{},groups:[],wali:{},waliUser:{},lap:lap||null,run:null};
  const k=S.kk;
  d.siswa.forEach(s=>k.src[s.ID]=s.Kelas);
  d.kelas.forEach(kl=>{
    const ids=d.siswa.filter(s=>s.Kelas===kl).map(s=>s.ID),nx=kkNext(kl,d.maxTingkat);
    const g={kelas:kl,ids:ids,tujuan:nx===null?'':(nx||''),lulus:nx===null};
    k.groups.push(g);
    ids.forEach(id=>k.map[id]={aksi:g.lulus?'lulus':'naik',tujuan:g.tujuan,custom:false});
  });
  kkHitungWali();
  const hdr=`<div class="kk-h mb-3 d-flex flex-wrap align-items-center gap-3"><div class="fs-1" aria-hidden="true">📈</div><div class="me-auto"><h2 class="h4 fw-extra m-0 text-white">Kenaikan Kelas &amp; Tahun Ajaran Baru</h2><div class="opacity-75 small">Tahun ajaran aktif <b>${esc(d.taAktif||'-')}</b> · ${d.siswa.length} siswa aktif · data siswa tidak dihapus, hanya diperbarui</div></div></div>`;
  $('app-container').innerHTML=`<div class="kk">${hdr}${d.bisaProses?'':'<div class="alert alert-secondary">Akun demo hanya dapat <b>melihat</b> halaman ini. Proses kenaikan kelas dinonaktifkan.</div>'}<div id="kkProg"></div><div id="kkBody"></div><div id="kkRiw"></div></div>`;
  if(lap)kkTampilLaporan(lap);else kkGambarForm();
  kkGambarRiwayat();
}

function kkGambarForm(){
  const k=S.kk,d=k.d,y=+(d.taSaran||'').slice(0,4)||new Date().getFullYear();
  if(!d.siswa.length){$('kkBody').innerHTML='<div class="card-x p-4 text-center text-secondary">Belum ada siswa aktif. Tambahkan data siswa dulu di menu Data Master &gt; Siswa.</div>';return}
  const kls=[...new Set(d.kelasSheet.map(x=>x.Kelas).concat(k.groups.map(g=>g.tujuan)).filter(Boolean))].sort();
  $('kkBody').innerHTML=`<datalist id="kkDl">${kls.map(x=>`<option value="${esc(x)}">`).join('')}</datalist>
   <div class="card-x p-3 mb-3"><h3 class="h6"><span class="kk-step">1</span> Tahun ajaran baru</h3><div class="row g-2">
     <div class="col-md-4"><label class="form-label small fw-semibold" for="kkTa">Tahun ajaran tujuan</label><input id="kkTa" class="form-control" value="${esc(d.taSaran)}" placeholder="2026/2027" ${d.bisaProses?'':'disabled'}></div>
     <div class="col-6 col-md-4"><label class="form-label small fw-semibold" for="kkMu">Mulai</label><input id="kkMu" type="date" class="form-control" value="${y}-07-01" ${d.bisaProses?'':'disabled'}></div>
     <div class="col-6 col-md-4"><label class="form-label small fw-semibold" for="kkSe">Selesai</label><input id="kkSe" type="date" class="form-control" value="${y+1}-06-30" ${d.bisaProses?'':'disabled'}></div></div>
     <div class="form-text">Backup otomatis dibuat sebelum proses dan dapat dibatalkan (Undo) dalam ${d.undoHari} hari.</div></div>
   <div class="card-x p-3 mb-3"><h3 class="h6"><span class="kk-step">2</span> Pemetaan kelas &amp; keputusan tiap siswa</h3>
     <p class="small text-secondary mb-2">Kelas tujuan terisi otomatis (1A→2A, 5→6, kelas ${d.maxTingkat} → <b>LULUS</b>). Ubah kolom tujuan bila kelas dipecah (mis. 1A → 2A dan 2B). Pilih <b>NAIK</b>, <b>TINGGAL KELAS</b>, atau <b>LULUS</b> per siswa, atau satu kelas sekaligus lewat tombol “Semua”.</p>
     <div id="kkGroups">${k.groups.map((g,i)=>`<div id="kkg${i}" class="kk-grp">${kkGroupHtml(i)}</div>`).join('')}</div></div>
   <div class="card-x p-3 mb-3"><h3 class="h6"><span class="kk-step">3</span> Wali kelas tahun ajaran baru</h3><div id="kkWali"></div></div>
   <div class="card-x p-3 mb-3"><h3 class="h6"><span class="kk-step">4</span> Ringkasan &amp; proses</h3><div id="kkSum" class="mb-3"></div>
     <button class="btn btn-kk btn-kk-big w-100" id="kkGo" onclick="kkKonfirmasi()" ${d.bisaProses?'':'disabled'}><i class="bi bi-rocket-takeoff"></i> PROSES KENAIKAN KELAS</button></div>`;
  kkGambarWali();kkGambarRingkas();
}

// ── Kelompok kelas asal ──
function kkHitung(ids){const c={naik:0,tinggal:0,lulus:0};ids.forEach(id=>c[S.kk.map[id].aksi]++);return c}
function kkSeg(id,a,dis){
  const b=(v,t,cl)=>`<button type="button" class="${cl} ${a===v?'on':''}" aria-pressed="${a===v}" ${dis?'disabled':''} onclick="kkSet('${KK_ID(id)}','${v}')">${t}</button>`;
  return `<div class="kk-seg" role="group" aria-label="Keputusan">${b('naik','NAIK','')}${b('tinggal','TINGGAL KELAS','tg')}${b('lulus','LULUS','ll')}</div>`;
}
function kkGroupHtml(i){
  const k=S.kk,g=k.groups[i],d=k.d,dis=!d.bisaProses,c=kkHitung(g.ids),wl=(d.waliLama.find(x=>x.k===kkNk(g.kelas))||{}).nama;
  const bulk=(a,t,cl)=>`<button type="button" class="${cl}" ${dis?'disabled':''} onclick="kkBulk(${i},'${a}')">${t}</button>`;
  return `<div class="kk-gh"><b>Kelas ${esc(g.kelas)}</b><span class="small">${g.ids.length} siswa${wl?' · wali: '+esc(wl):''}</span>
    <span class="ms-auto d-flex flex-wrap align-items-center gap-2"><label class="small mb-0" for="kkT${i}">Tujuan</label><input id="kkT${i}" class="form-control form-control-sm" style="width:110px" list="kkDl" value="${esc(g.tujuan)}" placeholder="${g.lulus?'(lulus)':'kelas'}" ${dis?'disabled':''} onchange="kkGroupTujuan(${i},this.value)">
    <span class="small">Semua:</span><span class="kk-seg">${bulk('naik','NAIK','')}${bulk('tinggal','TINGGAL','tg')}${bulk('lulus','LULUS','ll')}</span></span></div>
    <div class="px-3 py-1 small text-secondary">Naik ${c.naik} · Tinggal kelas ${c.tinggal} · Lulus ${c.lulus}</div>
    ${g.ids.map(id=>kkRowHtml(id)).join('')}`;
}
function kkRowHtml(id){
  const k=S.kk,s=k.d.siswa.find(x=>x.ID===id),m=k.map[id],dis=!k.d.bisaProses;
  const kosong=m.aksi==='naik'&&!String(m.tujuan||'').trim();
  return `<div class="kk-row ${m.aksi==='tinggal'?'tg':m.aksi==='lulus'?'ll':''}" id="kkr_${KK_ID(id)}"><div class="me-auto"><span class="fw-semibold">${esc(s.Nama)}</span> <span class="small text-secondary">${esc(s.NISN)}</span>${s.TinggalKelas==='Ya'?' <span class="badge text-bg-warning">pernah tinggal kelas</span>':''}</div>
    ${kkSeg(id,m.aksi,dis)}${m.aksi==='naik'?`<input class="form-control form-control-sm ${kosong?'is-invalid':''}" style="width:110px" list="kkDl" aria-label="Kelas tujuan ${esc(s.Nama)}" placeholder="kelas tujuan" value="${esc(m.tujuan||'')}" ${dis?'disabled':''} onchange="kkTujuan('${KK_ID(id)}',this.value)">`:'<span style="width:110px" class="small text-secondary text-center">'+(m.aksi==='lulus'?'Lulus':'Tetap')+'</span>'}</div>`;
}
function kkRefreshGrup(kelas){const i=S.kk.groups.findIndex(g=>g.kelas===kelas);if(i>=0)$('kkg'+i).innerHTML=kkGroupHtml(i)}
function kkSet(id,aksi){
  const k=S.kk,i=Object.keys(k.map).find(x=>KK_ID(x)===id);if(!i||!k.d.bisaProses)return;
  const g=k.groups.find(x=>x.ids.includes(i)),m=k.map[i];m.aksi=aksi;if(aksi==='naik'&&!m.tujuan)m.tujuan=g.tujuan;
  kkRefreshGrup(g.kelas);kkSesudahUbah();
}
function kkTujuan(id,v){
  const k=S.kk,i=Object.keys(k.map).find(x=>KK_ID(x)===id);if(!i)return;k.map[i].tujuan=v.trim();k.map[i].custom=true;
  const g=k.groups.find(x=>x.ids.includes(i));kkRefreshGrup(g.kelas);kkSesudahUbah();
}
function kkGroupTujuan(gi,v){
  const g=S.kk.groups[gi];g.tujuan=v.trim();g.lulus=false;
  g.ids.forEach(id=>{const m=S.kk.map[id];if(m.aksi==='naik'&&!m.custom)m.tujuan=g.tujuan});
  kkRefreshGrup(g.kelas);kkSesudahUbah();
}
function kkBulk(gi,aksi){
  const g=S.kk.groups[gi];
  g.ids.forEach(id=>{const m=S.kk.map[id];m.aksi=aksi;m.custom=false;m.tujuan=aksi==='naik'?g.tujuan:''});
  if(aksi==='lulus')g.lulus=true;else if(aksi==='naik'&&g.lulus){g.lulus=false}
  kkRefreshGrup(g.kelas);kkSesudahUbah();
}
function kkSesudahUbah(){kkHitungWali();kkGambarWali();kkGambarRingkas()}

// ── Wali kelas tahun ajaran baru ──
function kkHitungWali(){
  const k=S.kk,d=k.d,dest={},lama={};d.waliLama.forEach(x=>lama[x.k]=x.nama);
  const nkey=kkNk;
  Object.keys(k.map).forEach(id=>{
    const m=k.map[id],src=k.src[id],tj=m.aksi==='naik'?String(m.tujuan||'').trim():m.aksi==='tinggal'?src:'';
    if(!tj)return;const o=dest[tj]=dest[tj]||{src:{},tinggal:0};o.src[src]=(o.src[src]||0)+1;if(m.aksi==='tinggal')o.tinggal++;
  });
  const klaim={},hasil={};
  Object.keys(dest).sort((a,b)=>kkTing(a)-kkTing(b)||a.localeCompare(b,'id',{numeric:true})).forEach(K=>{
    const o=dest[K],srcs=Object.keys(o.src).sort((a,b)=>o.src[b]-o.src[a]),dom=srcs[0];
    if(k.waliUser[K]&&k.wali[K]){hasil[K]=Object.assign({},k.wali[K],{srcs:o.src,tinggal:o.tinggal});return}
    let mode='tetap',dari=dom;
    if(dom&&nkey(dom)!==nkey(K)&&lama[nkey(dom)]&&!klaim[nkey(dom)]){mode='pertahankan';klaim[nkey(dom)]=1}
    hasil[K]={mode:mode,dari:dari,nama:'',srcs:o.src,tinggal:o.tinggal};
  });
  k.wali=hasil;
}
function kkGambarWali(){
  const k=S.kk,d=k.d,box=$('kkWali');if(!box)return;const dis=!d.bisaProses,nkey=kkNk;
  const lama={};d.waliLama.forEach(x=>lama[x.k]=x.nama);const sheet={};d.kelasSheet.forEach(x=>{if(x.WaliKelas)sheet[nkey(x.Kelas)]=x.WaliKelas});
  const Ks=Object.keys(k.wali).sort((a,b)=>kkTing(a)-kkTing(b)||a.localeCompare(b,'id',{numeric:true}));
  if(!Ks.length){box.innerHTML='<div class="small text-secondary">Belum ada kelas tujuan (semua siswa lulus).</div>';return}
  box.innerHTML=Ks.map((K,i)=>{
    const w=k.wali[K],dari=Object.keys(w.srcs).map(x=>x+' ('+w.srcs[x]+')').join(', '),wl=lama[nkey(w.dari)],kini=sheet[nkey(K)];
    return `<div class="row g-2 align-items-center border-top py-2"><div class="col-md-3"><b>Kelas ${esc(K)}</b><div class="small text-secondary">dari ${esc(dari)}</div></div>
     <div class="col-md-4"><select class="form-select form-select-sm" aria-label="Wali kelas ${esc(K)}" ${dis?'disabled':''} onchange="kkWaliMode('${esc(K)}',this.value)">
       ${wl&&nkey(w.dari)!==nkey(K)?`<option value="pertahankan" ${w.mode==='pertahankan'?'selected':''}>Pertahankan wali lama (ikut naik): ${esc(wl)}</option>`:''}
       <option value="tetap" ${w.mode==='tetap'?'selected':''}>Tidak diubah${kini?' (saat ini: '+esc(kini)+')':''}</option><option value="baru" ${w.mode==='baru'?'selected':''}>Pilih wali baru…</option></select></div>
     <div class="col-md-5">${w.mode==='baru'?`<select class="form-select form-select-sm ${w.nama?'':'is-invalid'}" aria-label="Guru wali ${esc(K)}" ${dis?'disabled':''} onchange="kkWaliNama('${esc(K)}',this.value)"><option value="">— pilih dari Data Guru —</option>${d.guru.map(g=>`<option ${g.Nama===w.nama?'selected':''}>${esc(g.Nama)}</option>`).join('')}</select>`:`<span class="small text-secondary">${w.mode==='pertahankan'?'Wali: <b>'+esc(wl||'')+'</b>':kini?'Wali saat ini: '+esc(kini):'Belum ada wali tercatat'}</span>`}</div></div>`;
  }).join('')+'<div class="form-text mt-2">Kelas 1 baru (siswa dari PPDB) tidak muncul di sini; atur wali kelasnya di Data Master &gt; Kelas. Akun Guru Kelas bernama sama otomatis dipindah ke kelas barunya.</div>';
}
function kkWaliMode(K,mode){const w=S.kk.wali[K];w.mode=mode;if(mode!=='baru')w.nama='';S.kk.waliUser[K]=true;kkGambarWali();kkGambarRingkas()}
function kkWaliNama(K,n){S.kk.wali[K].nama=n;S.kk.waliUser[K]=true;kkGambarWali();kkGambarRingkas()}

// ── Ringkasan, validasi ──
function kkTotal(){const c={naik:0,tinggal:0,lulus:0};Object.values(S.kk.map).forEach(m=>c[m.aksi]++);return c}
function kkMasalah(){
  const k=S.kk,p=[],ta=($('kkTa')||{}).value&&$('kkTa').value.trim();
  if(!/^\d{4}\/\d{4}$/.test(ta||''))p.push('Tahun ajaran tujuan harus berformat 2026/2027.');
  else{if(+ta.slice(5)!==+ta.slice(0,4)+1)p.push('Tahun ajaran sebaiknya berurutan (mis. 2026/2027).');if(ta===k.d.taAktif)p.push('Tahun ajaran tujuan sama dengan tahun ajaran aktif.')}
  const kosong=Object.keys(k.map).filter(id=>k.map[id].aksi==='naik'&&!String(k.map[id].tujuan||'').trim()).length;
  if(kosong)p.push(kosong+' siswa berstatus NAIK tetapi kelas tujuannya belum diisi.');
  Object.keys(k.wali).forEach(K=>{if(k.wali[K].mode==='baru'&&!k.wali[K].nama)p.push('Pilih guru wali kelas untuk kelas '+K+' (atau ubah ke “Tidak diubah”).')});
  return p;
}
function kkGambarRingkas(){
  const box=$('kkSum');if(!box)return;const c=kkTotal(),p=kkMasalah();
  box.innerHTML=`<div class="row g-2 text-center"><div class="col-4"><div class="p-2 rounded" style="background:#dbeafe;color:#1e3a8a"><div class="fs-4 fw-bold">${c.naik}</div><div class="small">Naik kelas</div></div></div><div class="col-4"><div class="p-2 rounded" style="background:#fef3c7;color:#92400e"><div class="fs-4 fw-bold">${c.tinggal}</div><div class="small">Tinggal kelas</div></div></div><div class="col-4"><div class="p-2 rounded" style="background:#d1fae5;color:#065f46"><div class="fs-4 fw-bold">${c.lulus}</div><div class="small">Lulus</div></div></div></div>
   ${p.length?'<div class="alert alert-warning small mt-2 mb-0"><b>Perlu diperbaiki:</b><ul class="mb-0">'+p.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul></div>':''}`;
}
function kkKonfirmasi(){
  const fatal=kkMasalah().filter(x=>!/berurutan/.test(x));if(fatal.length)return toast('Belum lengkap',fatal[0],'warning');
  const c=kkTotal(),ta=$('kkTa').value.trim();
  openModal('Konfirmasi Kenaikan Kelas',`<p class="fs-6">Anda akan menaikkan <b>${c.naik} siswa</b>, meluluskan <b>${c.lulus} siswa</b>, <b>${c.tinggal} siswa</b> tinggal kelas. <b>Lanjutkan?</b></p>
   <ul class="small text-secondary mb-0"><li>Tahun ajaran aktif berpindah dari <b>${esc(S.kk.d.taAktif)}</b> ke <b>${esc(ta)}</b>.</li><li>Backup otomatis dibuat lebih dulu; proses dapat dibatalkan (Undo) dalam ${S.kk.d.undoHari} hari.</li><li>Siswa yang lulus berstatus Alumni dengan kelas “LULUS ${esc(String(S.kk.d.taAktif).slice(5))}”. Tidak ada data siswa yang dihapus.</li><li>Jangan menutup halaman sampai proses selesai.</li></ul>`,
   '<button class="btn btn-light" data-bs-dismiss="modal">Batal</button><button class="btn btn-kk btn-kk-big" id="kkYa"><i class="bi bi-rocket-takeoff"></i> PROSES KENAIKAN KELAS</button>');
  $('kkYa').onclick=()=>{closeModal();kkJalankan()};
}
function kkJalankan(){
  const k=S.kk,ta=$('kkTa').value.trim(),dm={tahunAsal:k.d.taAktif,tahunTujuan:ta,mulai:$('kkMu').value,selesai:$('kkSe').value,
    items:Object.keys(k.map).map(id=>({id:id,aksi:k.map[id].aksi,tujuan:k.map[id].aksi==='naik'?String(k.map[id].tujuan).trim():''})),
    wali:Object.keys(k.wali).map(K=>({kelas:K,mode:k.wali[K].mode,nama:k.wali[K].nama||'',dari:k.wali[K].dari}))};
  prosesKenaikanKelas(dm);
}

// ── Backup ──
async function backupDataTahunan(meta){
  const r=await api('kenaikanBackup',{tahunAsal:meta.tahunAsal,tahunTujuan:meta.tahunTujuan});   // salinan lengkap di server (sheet KenaikanBackup)
  try{ // salinan ringan di peramban (hanya ID siswa dan kelas lama) — cadangan tambahan
    const d=S.kk&&S.kk.d;
    localStorage.setItem('backup_tahun_'+String(meta.tahunAsal).replace('/','_'),JSON.stringify({runId:r.runId,waktu:new Date().toISOString(),tahunTujuan:meta.tahunTujuan,siswa:d?d.siswa.map(s=>({id:s.ID,kelas:s.Kelas})):[]}));
  }catch(e){}
  return r;
}

// ── Proses utama (bertahap, dengan progress bar) ──
function kkProgres(persen,teks,kelas){
  const el=$('kkProg');if(!el)return;
  el.innerHTML=`<div class="card-x p-3 mb-3"><div class="d-flex justify-content-between small mb-1"><b>${esc(teks)}</b><span>${Math.round(persen)}%</span></div><div class="progress" role="progressbar" aria-valuenow="${Math.round(persen)}" aria-valuemin="0" aria-valuemax="100"><div class="progress-bar ${kelas||'progress-bar-striped progress-bar-animated'}" style="width:${persen}%"></div></div></div>`;
}
async function prosesKenaikanKelas(dm){
  const body=$('kkBody');if(body)body.style.pointerEvents='none',body.style.opacity='.5';
  S.kk.run={dm:dm,runId:null,idx:0};
  try{
    kkProgres(3,'Membuat backup data…');
    const b=await backupDataTahunan(dm);S.kk.run.runId=b.runId;
    await kkTerapkanSisa();
  }catch(e){kkGagal(e)}
}
async function kkTerapkanSisa(){
  const run=S.kk.run,dm=run.dm,n=dm.items.length;
  while(run.idx<n){
    const chunk=dm.items.slice(run.idx,run.idx+KK_CHUNK);
    kkProgres(8+run.idx/n*80,'Memproses siswa '+Math.min(run.idx+chunk.length,n)+' dari '+n+'…');
    await api('kenaikanTerapkan',run.runId,chunk,null);run.idx+=chunk.length;
  }
  kkProgres(92,'Menetapkan wali kelas & tahun ajaran baru…');
  const r=await api('kenaikanTerapkan',run.runId,[],{wali:dm.wali,mulai:dm.mulai,selesai:dm.selesai});
  kkProgres(100,'Selesai','bg-success');
  S.sisAll=null;S.ta=dm.tahunTujuan;try{await loadTA()}catch(e){}
  toast('Berhasil','Kenaikan kelas berhasil! Tahun ajaran sekarang '+dm.tahunTujuan,'success');
  S.kk.run=null;renderHalamanKenaikanKelas(r.laporan);
}
function kkGagal(e){
  const run=S.kk&&S.kk.run,el=$('kkProg');logErr('kenaikan: '+e.message);
  if(!el)return fail(e);
  el.innerHTML=`<div class="alert alert-danger"><b>Proses berhenti:</b> ${esc(e.message)}<div class="small mt-1">Data tetap aman: sudah ada backup${run&&run.runId?'':' (jika tahap backup sudah selesai)'}. ${run&&run.runId?'Anda dapat melanjutkan dari titik terakhir (aman diulang) atau membatalkan dan memulihkan data.':''}</div>
   <div class="d-flex gap-2 mt-2">${run&&run.runId?'<button class="btn btn-kk btn-sm" onclick="kkLanjut()"><i class="bi bi-play-fill"></i> Lanjutkan</button><button class="btn btn-outline-danger btn-sm" onclick="undoKenaikan(\''+esc(run.runId)+'\')"><i class="bi bi-arrow-counterclockwise"></i> Batalkan &amp; pulihkan</button>':'<button class="btn btn-outline-secondary btn-sm" onclick="navigateTo(\'kenaikan\')">Muat ulang halaman</button>'}</div></div>`;
}
async function kkLanjut(){try{kkProgres(8,'Melanjutkan…');await kkTerapkanSisa()}catch(e){kkGagal(e)}}

// ── Undo ──
async function undoKenaikan(runId){
  const ok=await new Promise(res=>{
    openModal('Batalkan Kenaikan Kelas?','<p>Seluruh perubahan proses ini akan dikembalikan: kelas siswa, status alumni, wali kelas, kelas akun guru, dan tahun ajaran aktif akan kembali seperti sebelum proses.</p><div class="alert alert-warning small mb-0">Data yang Anda ubah <b>setelah</b> kenaikan kelas pada siswa terkait (mis. pindah kelas manual) ikut tertimpa. Gunakan hanya bila proses tadi keliru.</div>','<button class="btn btn-light" id="ukNo">Tidak</button><button class="btn btn-danger" id="ukYa"><i class="bi bi-arrow-counterclockwise"></i> Ya, pulihkan</button>');
    $('ukNo').onclick=()=>{closeModal();res(false)};$('ukYa').onclick=()=>{closeModal();res(true)};
    $('mdl').addEventListener('hidden.bs.modal',()=>res(false),{once:true});
  });
  if(!ok)return;
  try{
    const r=await api('kenaikanUndo',runId);S.sisAll=null;S.ta=r.tahunAktif;try{await loadTA()}catch(e){}
    try{Object.keys(localStorage).filter(x=>x.indexOf('backup_tahun_')===0).forEach(x=>{try{if(JSON.parse(localStorage.getItem(x)).runId===runId)localStorage.removeItem(x)}catch(e){}})}catch(e){}
    toast('Dipulihkan',r.dipulihkan+' siswa dikembalikan. Tahun ajaran aktif: '+r.tahunAktif,'success');S.kk&&(S.kk.run=null);renderHalamanKenaikanKelas();
  }catch(e){fail(e)}
}

// ── Riwayat ──
function kkGambarRiwayat(){
  const k=S.kk,d=k.d,box=$('kkRiw');if(!box)return;
  const st={Selesai:'bg-success',Proses:'bg-warning text-dark',Dibatalkan:'bg-secondary'};
  box.innerHTML=`<div class="card-x p-3"><h3 class="h6">Riwayat Kenaikan Kelas</h3><div class="table-responsive"><table class="table table-sm align-middle"><thead><tr><th>Tanggal</th><th>Tahun ajaran</th><th class="text-end">Siswa</th><th class="text-end">Naik</th><th class="text-end">Tinggal</th><th class="text-end">Lulus</th><th>Dilakukan oleh</th><th>Status</th><th></th></tr></thead><tbody>
   ${d.riwayat.map(r=>`<tr><td class="text-nowrap">${esc(r.Tanggal)}</td><td class="text-nowrap">${esc(r.TahunAsal)} → ${esc(r.TahunTujuan)}</td><td class="text-end">${r.Jumlah}</td><td class="text-end">${r.Naik}</td><td class="text-end">${r.Tinggal}</td><td class="text-end">${r.Lulus}</td><td>${esc(r.Oleh)}</td><td><span class="badge ${st[r.Status]||'bg-light text-dark'}">${esc(r.Status)}</span>${r.Status==='Dibatalkan'?'<div class="small text-secondary">'+esc(r.DibatalkanPada||'')+'</div>':''}</td>
     <td class="text-nowrap text-end">${r.Status==='Selesai'?`<button class="btn btn-sm btn-light" onclick="kkBukaLaporan('${esc(r.ID)}')"><i class="bi bi-file-earmark-text"></i> Laporan</button> `:''}${d.bisaProses&&r.bisaUndo?`<button class="btn btn-sm btn-outline-danger" onclick="undoKenaikan('${esc(r.ID)}')"><i class="bi bi-arrow-counterclockwise"></i> Undo${r.Status==='Selesai'?' ('+r.sisaHari+' hari lagi)':' (pulihkan)'}</button>`:''}</td></tr>`).join('')||'<tr><td colspan="9" class="text-center text-secondary py-3">Belum ada riwayat.</td></tr>'}</tbody></table></div></div>`;
}
async function kkBukaLaporan(runId){try{const l=await net('kenaikanLaporan',runId);S.kk.lap=l;kkTampilLaporan(l,true)}catch(e){fail(e)}}

// ── Laporan hasil ──
function kkTampilLaporan(l,dariRiwayat){
  S.kk.lap=l;const body=$('kkBody');
  const chip=s=>s==='Naik'?'bg-primary':s==='Lulus'?'bg-success':'bg-warning text-dark';
  body.innerHTML=`<div class="card-x p-3 mb-3"><div class="d-flex flex-wrap gap-2 align-items-center mb-2"><h3 class="h5 m-0 me-auto">✅ Laporan Kenaikan Kelas ${esc(l.tahunAsal)} → ${esc(l.tahunTujuan)}</h3>
    <button class="btn btn-sm btn-outline-secondary" onclick="kkXls()"><i class="bi bi-file-earmark-excel"></i> Excel</button><button class="btn btn-sm btn-outline-secondary" onclick="kkCetak()"><i class="bi bi-file-earmark-pdf"></i> PDF / Cetak A4</button>${dariRiwayat?'<button class="btn btn-sm btn-kk" onclick="navigateTo(\'kenaikan\')">Tutup laporan</button>':'<button class="btn btn-sm btn-kk" onclick="navigateTo(\'kenaikan\')">Selesai</button>'}</div>
    <div class="small text-secondary mb-3">${esc(l.waktu)} WITA · oleh ${esc(l.oleh)}</div>
    <div class="row g-2 text-center mb-2"><div class="col-3"><div class="fs-4 fw-bold">${l.total}</div><div class="small">Total</div></div><div class="col-3"><div class="fs-4 fw-bold text-primary">${l.naik}</div><div class="small">Naik</div></div><div class="col-3"><div class="fs-4 fw-bold text-warning">${l.tinggal}</div><div class="small">Tinggal kelas</div></div><div class="col-3"><div class="fs-4 fw-bold text-success">${l.lulus}</div><div class="small">Lulus</div></div></div>
    ${(l.peringatan||[]).map(x=>'<div class="alert alert-warning small py-2 mb-2">'+esc(x)+'</div>').join('')}</div>
   ${l.kelas.map(c=>`<div class="kk-grp"><div class="kk-gh"><b>Kelas ${esc(c.kelas)}</b><span class="small">${c.siswa.length} siswa${c.wali?' · wali kelas: '+esc(c.wali):''}</span></div>${c.siswa.map((s,i)=>`<div class="kk-row"><span style="width:2rem">${i+1}.</span><span class="me-auto">${esc(s.Nama)} <span class="small text-secondary">${esc(s.NISN)} · dari ${esc(s.Dari||'-')}</span></span><span class="badge ${chip(s.Status)}">${esc(s.Status)}</span></div>`).join('')}</div>`).join('')}
   ${l.alumni.siswa.length?`<div class="kk-grp"><div class="kk-gh"><b>Lulus tahun ${esc(l.alumni.tahun)} (Alumni)</b><span class="small">${l.alumni.siswa.length} siswa</span></div>${l.alumni.siswa.map((s,i)=>`<div class="kk-row"><span style="width:2rem">${i+1}.</span><span class="me-auto">${esc(s.Nama)} <span class="small text-secondary">${esc(s.NISN)} · dari ${esc(s.Dari||'-')}</span></span><span class="badge bg-success">Lulus</span></div>`).join('')}</div>`:''}`;
}
function kkXls(){
  const l=S.kk.lap,rows=[['Kelas Baru','Wali Kelas','NISN','Nama','JK','Kelas Asal','Status']];
  l.kelas.forEach(c=>c.siswa.forEach(s=>rows.push([c.kelas,c.wali,s.NISN,s.Nama,s.JK,s.Dari,s.Status])));
  l.alumni.siswa.forEach(s=>rows.push(['LULUS '+l.alumni.tahun,'',s.NISN,s.Nama,s.JK,s.Dari,'Lulus']));
  xlsSave('Kenaikan_Kelas_'+l.tahunTujuan.replace('/','-')+'.xlsx',[['Ringkasan',[['Tahun ajaran asal',l.tahunAsal],['Tahun ajaran baru',l.tahunTujuan],['Waktu',l.waktu],['Dilakukan oleh',l.oleh],['Total siswa',l.total],['Naik kelas',l.naik],['Tinggal kelas',l.tinggal],['Lulus',l.lulus]]],['Hasil per Siswa',rows]]);
}
function kkCetak(){
  const l=S.kk.lap,k=kopCfg(),blk=(j,sub,list)=>`<div style="page-break-inside:avoid;margin-top:10px"><div style="font-weight:bold">${esc(j)}</div><div style="font-size:10pt">${esc(sub)}</div>${tabelA4(['No','NISN','Nama Siswa','JK','Kelas Asal','Status'],list.map((s,i)=>[i+1,s.NISN,s.Nama,s.JK,s.Dari||'-',s.Status]),{widths:[6,16,40,6,16,16],center:[0,3,4,5],fontSize:9.5})}</div>`;
  cetakA4(`<div style="${A4F}">${kopA4(k)}<div style="text-align:center;font-weight:bold;font-size:13pt;text-decoration:underline">LAPORAN KENAIKAN KELAS</div><div style="text-align:center;margin-bottom:8px">Tahun Ajaran ${esc(l.tahunAsal)} ke ${esc(l.tahunTujuan)}</div>
   ${infoA4([['Total siswa',l.total+' siswa'],['Naik kelas',l.naik+' siswa'],['Tinggal kelas',l.tinggal+' siswa'],['Lulus',l.lulus+' siswa'],['Diproses',l.waktu+' WITA oleh '+l.oleh]])}
   ${l.kelas.map(c=>blk('Kelas '+c.kelas,'Wali kelas: '+(c.wali||'-')+' · '+c.siswa.length+' siswa',c.siswa)).join('')}
   ${l.alumni.siswa.length?blk('Lulusan Tahun '+l.alumni.tahun,l.alumni.siswa.length+' siswa (status Alumni)',l.alumni.siswa):''}
   ${ttdA4({tempat:'Tarakan',tanggal:tglPanjang(tglIni()),kiri:{jabatan:'Operator',nama:'',nip:null},kanan:{jabatan:'Kepala Sekolah',nama:k.kepsek,nip:k.kepsekNip}})}</div>`);
}
