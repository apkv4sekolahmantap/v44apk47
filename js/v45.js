// ============================================================
// v4.5 — (1) Tanda tangan otomatis semua unduhan: Kepala Sekolah + Wali Kelas + tempat, tanggal, bulan, tahun
//        (2) Laporan Kehadiran: pilihan periode Dari tanggal-bulan-tahun s/d Sampai tanggal-bulan-tahun
//        (3) Akun guru penginput nilai (wali kelas, Guru PAI, Guru PJOK) — total 35 guru
// ============================================================
const TTD={ttl:0,busy:false,skip:false};
const ttdNk=x=>String(x||'').toUpperCase().replace(/[\s\-_.\/]/g,'');

// ── Data tanda tangan dari server (kota, kepala sekolah, wali tiap kelas); dimuat di latar belakang ──
async function ttdMuat(force){
  if(!S.token)return null;
  if(!force&&S.ttdI&&Date.now()-TTD.ttl<300000)return S.ttdI;
  try{S.ttdI=await net('ttdInfo');TTD.ttl=Date.now()}catch(e){}
  return S.ttdI||null;
}
setInterval(()=>{
  if(!S.token){S.ttdI=null;return}
  if(!TTD.busy&&(!S.ttdI||Date.now()-TTD.ttl>300000)){TTD.busy=true;ttdMuat(true).finally(()=>{TTD.busy=false})}
},4000);

function ttdWali(kelas){
  const I=S.ttdI;if(!kelas||!I)return{nama:'',nip:''};
  const f=I.wali.find(z=>ttdNk(z.kelas)===ttdNk(kelas));return f?{nama:f.nama||'',nip:f.nip||''}:{nama:'',nip:''};
}
function ttdTempatTgl(){const I=S.ttdI;return((I&&I.kota)||'Tarakan')+', '+tglPanjang(tglIni())}
// Kelas untuk tanda tangan: ditetapkan fitur (S.ttdKelas) → halaman aktif → kelas Guru Kelas → terbaca dari isi dokumen
function ttdKelas(html){
  if(S.ttdKelas)return S.ttdKelas;
  const u=S.user||{};
  if(S.cur==='inputnilai'&&typeof NG!=='undefined'&&NG.kelas)return NG.kelas;
  if(S.cur==='laporan'&&S.lapF&&S.lapF.kelas)return S.lapF.kelas;
  if(u.Role==='Guru Kelas'&&u.Kelas)return u.Kelas;
  if(S.crud&&S.crud.mod===S.cur&&S.crud.rows&&(S.crud.f||[]).some(x=>x.n==='Kelas')){ // tabel data: bila hanya satu kelas pada data
    const m={};S.crud.rows.forEach(r=>{if(r.Kelas)m[ttdNk(r.Kelas)]=r.Kelas});const k=Object.keys(m);if(k.length===1)return m[k[0]]}
  if(html){const t=String(html).replace(/<[^>]+>/g,' '),m=/Kelas\s*[:\-]?\s*([1-6]\s?-?\s?[A-Za-z])(?![A-Za-z])/.exec(t);if(m)return m[1].replace(/\s+/g,'')}
  return '';
}
function ttdData(kelas){
  const I=S.ttdI,c=S.cfg||{},w=ttdWali(kelas);
  return{kelas:kelas||'',tempat:(I&&I.kota)||'Tarakan',tgl:tglPanjang(tglIni()),
    kepsek:{nama:(I&&I.kepsek.nama)||c.kepsekNama||'',nip:(I&&I.kepsek.nip)||c.kepsekNip||''},wali:w};
}
function ttdHtml(kelas){
  const d=ttdData(kelas);
  return ttdA4({tempat:d.tempat,tanggal:d.tgl,
    kiri:{atas:'Mengetahui,',jabatan:'Kepala Sekolah',nama:d.kepsek.nama,nip:d.kepsek.nip},
    kanan:{atas:d.tempat+', '+d.tgl,jabatan:'Wali Kelas'+(d.kelas?' '+d.kelas:''),nama:d.wali.nama,nip:d.wali.nip}});
}
function ttdTambah(html,kelas){
  html=String(html==null?'':html);
  if(TTD.skip||/data-ttd="1"|<!--ttd-->|Mengetahui/.test(html))return html;
  return html+ttdHtml(kelas||ttdKelas(html));
}

// ── Pintu keluar HTML: cetak / Word / PDF dari semua fitur otomatis memuat tanda tangan ──
const _cetak44=cetak;cetak=function(html){return _cetak44(ttdTambah(html))};
const _cetakA444=cetakA4;cetakA4=function(html){return _cetakA444(ttdTambah(html))};
const _dlDoc44=dlDoc;dlDoc=function(name,html){return _dlDoc44(name,ttdTambah(html))};
if(typeof aiWord==='function'){const _aiWord44=aiWord;aiWord=function(html,fname){return _aiWord44(ttdTambah(html),fname)}}

// ── Pintu keluar Excel: setiap lembar kerja mendapat blok tanda tangan di bawah tabel ──
function ttdXlsx(wb){
  if(TTD.skip||!wb||!wb.SheetNames)return;
  const d=ttdData(ttdKelas(''));
  wb.SheetNames.forEach(n=>{
    const ws=wb.Sheets[n];if(!ws||!ws['!ref'])return;
    for(const k in ws){if(k[0]!=='!'&&ws[k]&&typeof ws[k].v==='string'&&/Mengetahui/.test(ws[k].v))return}
    const rg=XLSX.utils.decode_range(ws['!ref']),nc=rg.e.c+1,kc=nc>=6?nc-3:Math.max(1,nc-1);
    const row=(a,b)=>{const r=Array(kc+1).fill('');r[0]=a;r[kc]=b;return r};
    const blank=['NIP. ','NIP. '];
    XLSX.utils.sheet_add_aoa(ws,[
      row('',''),
      row('Mengetahui,',d.tempat+', '+d.tgl),
      row('Kepala Sekolah,','Wali Kelas'+(d.kelas?' '+d.kelas:'')+','),
      row('',''),row('',''),row('',''),
      row(d.kepsek.nama||'(............................................)',d.wali.nama||'(............................................)'),
      row('NIP. '+(d.kepsek.nip||'.........................'),'NIP. '+(d.wali.nip||'.........................'))
    ],{origin:{r:rg.e.r+2,c:0}});
  });
}
function ttdPatchXlsx(){
  if(!window.XLSX||XLSX.__ttd)return;
  XLSX.__ttd=true;const o=XLSX.writeFile;
  XLSX.writeFile=function(wb,name,opt){try{ttdXlsx(wb)}catch(e){}return o.call(XLSX,wb,name,opt)};
}
(function(){const t=setInterval(()=>{ttdPatchXlsx();if(window.XLSX&&XLSX.__ttd)clearInterval(t)},400)})();

// Nama wali kelas / tempat-tanggal untuk fitur yang menyusun tanda tangan sendiri (mis. rapor)
const ttdWaliNama=kelas=>ttdWali(kelas).nama;

// ============================================================
// (2) LAPORAN KEHADIRAN — PERIODE DARI TANGGAL-BULAN-TAHUN SAMPAI TANGGAL-BULAN-TAHUN
// ============================================================
function lapPreset(k){
  const t=new Date(),y=t.getFullYear(),m=t.getMonth(),f=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  let a,b;
  if(k==='pekan'){const h=(t.getDay()+6)%7;a=new Date(y,m,t.getDate()-h);b=new Date(y,m,t.getDate()-h+6)}
  else if(k==='lalu'){a=new Date(y,m-1,1);b=new Date(y,m,0)}
  else if(k==='semester'){if(m>=6){a=new Date(y,6,1);b=new Date(y,11,31)}else{a=new Date(y,0,1);b=new Date(y,5,30)}}
  else if(k==='ta'){const s=m>=6?y:y-1;a=new Date(s,6,1);b=new Date(s+1,5,30)}
  else{a=new Date(y,m,1);b=new Date(y,m+1,0)}
  return[f(a),f(b)];
}
const LAP_PRE=[['pekan','Pekan ini'],['bulan','Bulan ini'],['lalu','Bulan lalu'],['semester','Semester ini'],['ta','Tahun ajaran']];
function lapPresetBtn(fnName){return LAP_PRE.map(p=>`<button type="button" class="btn btn-sm btn-outline-secondary" onclick="${fnName}('${p[0]}')">${p[1]}</button>`).join('')}
function lapLabelPeriode(a,b){
  if(!a||!b)return '';
  if(a>b){const t=a;a=b;b=t}
  const n=Math.round((new Date(b+'T00:00:00')-new Date(a+'T00:00:00'))/86400000)+1;
  return 'Periode: '+tglPanjang(a)+' s/d '+tglPanjang(b)+' ('+n+' hari)';
}

// Halaman Laporan Kehadiran: tombol periode cepat di bawah filter Dari/Sampai
const _renderLap44=renderLap;
renderLap=async function(){
  await _renderLap44();
  const c=$('app-container');if(!c||S.cur!=='laporan'||!$('lD'))return;
  const f=S.lapF||{},card=$('lD').closest('.card-x');if(!card||card.querySelector('#lapPre'))return;
  card.insertAdjacentHTML('beforeend',`<div id="lapPre" class="d-flex flex-wrap gap-1 align-items-center mt-2"><span class="small text-secondary me-1"><i class="bi bi-calendar-range"></i> Periode cepat:</span>${lapPresetBtn('lapSetPeriode')}</div><div class="small text-secondary mt-1" id="lapPer">${esc(lapLabelPeriode(f.dari,f.sampai)||'Kosongkan tanggal untuk menampilkan seluruh tahun ajaran. File Excel/Word/PDF yang diunduh memuat periode ini, nama Wali Kelas, Kepala Sekolah, tempat &amp; tanggal.')}</div>`);
  ['lD','lE'].forEach(id=>{$(id).addEventListener('change',()=>{$('lapPer').textContent=lapLabelPeriode($('lD').value,$('lE').value)||'Kosongkan tanggal untuk menampilkan seluruh tahun ajaran.'})});
};
function lapSetPeriode(k){const p=lapPreset(k);$('lD').value=p[0];$('lE').value=p[1];lapCari()}

// Unduhan Excel / Word / PDF pada halaman laporan: memuat periode lengkap + tanda tangan
lapExport=async function(fmt){
  const d=S.lap,f=S.lapF||{};
  const H=['NISN','Nama','Kelas','Hadir','Izin','Sakit','Alpa','% Hadir','% Sakit','% Izin','% Alpa'];
  const R=d.rekap.map(r=>[r.NISN,r.Nama,r.Kelas,r.Hadir,r.Izin,r.Sakit,r.Alpa,r.Persen,pp(r,'Sakit'),pp(r,'Izin'),pp(r,'Alpa')]);
  const per=(f.dari||f.sampai)?(f.dari?tglPanjang(f.dari):'awal')+' s/d '+(f.sampai?tglPanjang(f.sampai):'sekarang'):'Seluruh tahun ajaran';
  const ks=[...new Set(d.rekap.map(r=>ttdNk(r.Kelas)))],kelas=f.kelas||(ks.length===1?d.rekap[0].Kelas:'');
  const judul='Laporan Kehadiran '+d.sesi+(kelas?' Kelas '+kelas:'')+' - Periode '+per;
  const nm='Laporan_Kehadiran_'+d.sesi+(kelas?'_'+String(kelas).replace(/\W+/g,''):'')+(f.dari||f.sampai?'_'+(f.dari||'awal')+'_sd_'+(f.sampai||'kini'):'');
  if(fmt==='xls'){
    if(!window.XLSX){toast('Belum siap','Pustaka Excel belum termuat, coba lagi sebentar.','warning');return}
    const sk=(S.cfg&&S.cfg.schoolName)||'SDN 047 Tarakan';
    const ws=XLSX.utils.aoa_to_sheet([['LAPORAN KEHADIRAN SISWA - '+String(sk).toUpperCase()],['Jenis presensi',d.sesi],['Kelas',kelas||'Semua kelas'],['Periode',per],['Dicetak',tglPanjang(tglIni())],[],H].concat(R));
    ws['!cols']=[{wch:14},{wch:30},{wch:9}];
    const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'Rekap');
    S.ttdKelas=kelas;try{XLSX.writeFile(wb,nm+'.xlsx')}finally{S.ttdKelas=''}
    return;
  }
  toast('Menyiapkan '+fmt.toUpperCase(),'Google sedang membuat dokumen...','primary');
  try{const r=await api('exportData',judul,H,R,fmt,kelas),b=atob(r.b64),u=new Uint8Array(b.length);for(let j=0;j<b.length;j++)u[j]=b.charCodeAt(j);const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([u]));a.download=r.nama;document.body.appendChild(a);a.click();a.remove();toast('Berhasil',r.nama+' diunduh.','success')}catch(e){fail(e)}
};

// Laporan Kehadiran A4 (kop + TTD): ganti pilihan "Bulan" dengan periode tanggal-bulan-tahun
const _lapA4UI44=lapA4UI;
lapA4UI=async function(kind){
  await _lapA4UI44(kind);
  if(kind!=='hadir')return;
  const b=$('a4B');if(!b)return;
  const col=b.closest('[class*="col-"]'),p=lapPreset('bulan');
  col.className='col-12';
  col.innerHTML=`<label class="form-label small fw-semibold">Periode laporan (tanggal – bulan – tahun)</label>
   <div class="row g-2"><div class="col-6"><label class="form-label small text-secondary mb-0" for="a4D">Dari tanggal</label><input id="a4D" type="date" class="form-control" value="${p[0]}"></div>
   <div class="col-6"><label class="form-label small text-secondary mb-0" for="a4E">Sampai tanggal</label><input id="a4E" type="date" class="form-control" value="${p[1]}"></div></div>
   <div class="d-flex flex-wrap gap-1 mt-2">${lapPresetBtn('a4SetPeriode')}</div><div class="small text-secondary mt-1" id="a4P">${esc(lapLabelPeriode(p[0],p[1]))}</div>`;
  ['a4D','a4E'].forEach(id=>$(id).addEventListener('change',()=>{$('a4P').textContent=lapLabelPeriode($('a4D').value,$('a4E').value)}));
};
function a4SetPeriode(k){const p=lapPreset(k);$('a4D').value=p[0];$('a4E').value=p[1];$('a4P').textContent=lapLabelPeriode(p[0],p[1])}
lapA4Arg=function(){const v=id=>($(id)||{}).value||'';return{bulan:v('a4B'),dari:v('a4D'),sampai:v('a4E'),kelas:v('a4K'),sesi:v('a4S'),guru:v('a4G')}};
function lapA4Cek(){
  if(!S.a4||S.a4.kind!=='hadir'||!$('a4D'))return true;
  const a=$('a4D').value,b=$('a4E').value;
  if(!a||!b){toast('Periode belum lengkap','Isi tanggal "Dari" dan "Sampai".','warning');return false}
  if(a>b){toast('Periode terbalik','Tanggal "Dari" harus sebelum atau sama dengan "Sampai".','warning');return false}
  return true;
}
const _lapA4Cetak44=lapA4Cetak;lapA4Cetak=function(){return lapA4Cek()?_lapA4Cetak44():undefined};
const _lapA4Dok44=lapA4Dok;lapA4Dok=function(fmt){return lapA4Cek()?_lapA4Dok44(fmt):undefined};

// ============================================================
// (3) AKUN GURU PENGINPUT NILAI — WALI KELAS, GURU PAI, GURU PJOK (TOTAL 35 GURU)
// ============================================================
const GR_PERAN=['Guru Kelas','Guru PAI','Guru PJOK'];
const GR_LABEL={'Guru Kelas':'Wali Kelas','Guru PAI':'Guru PAI','Guru PJOK':'Guru PJOK'};
async function guruUI(){
  let d;try{d=await net('guruRoster')}catch(e){return fail(e)}
  S.gr={d:d};
  const ada=d.daftar.length,sisa=Math.max(0,d.maks-ada);
  const n=(r)=>d.daftar.filter(x=>x.Role===r).length;
  const exist=d.daftar.length?`<div class="table-responsive mb-3" style="max-height:200px"><table class="table table-sm align-middle mb-0"><thead><tr><th>Nama</th><th>Peran</th><th>Kelas</th><th>Username</th><th>NIP</th></tr></thead><tbody>${d.daftar.map(x=>`<tr${x.Aktif==='Tidak'?' class="text-secondary"':''}><td>${esc(x.Nama)}</td><td>${esc(GR_LABEL[x.Role]||x.Role)}</td><td>${esc(x.Kelas||'(semua kelas)')}</td><td><code>${esc(x.Username)}</code></td><td>${esc(x.NIP||'-')}</td></tr>`).join('')}</tbody></table></div>`:'<div class="small text-secondary mb-3">Belum ada akun wali kelas / Guru PAI / Guru PJOK.</div>';
  const opts=GR_PERAN.map(r=>`<option value="${r}">${GR_LABEL[r]}</option>`).join('');
  const rows=Array.from({length:sisa},(_,i)=>`<tr><td class="text-secondary small">${ada+i+1}</td><td><input class="form-control form-control-sm gr-n" data-i="${i}" placeholder="Nama lengkap guru" autocomplete="off"></td><td><select class="form-select form-select-sm gr-r" data-i="${i}">${opts}</select></td><td><input class="form-control form-control-sm gr-k" data-i="${i}" list="grKL" placeholder="mis. 4-A" autocomplete="off"></td><td><input class="form-control form-control-sm gr-p" data-i="${i}" placeholder="NIP (opsional)" autocomplete="off"></td></tr>`).join('');
  openModal('Akun Guru Penginput Nilai',`
   <div class="alert alert-primary small py-2 mb-3"><b>${ada} dari ${d.maks} guru</b> sudah punya akun (wali kelas ${n('Guru Kelas')} · Guru PAI ${n('Guru PAI')} · Guru PJOK ${n('Guru PJOK')}). Sisa slot: <b>${sisa}</b>.<br>
   <b>Wali Kelas</b> menginput nilai siswa kelasnya sendiri untuk semua mapel <u>kecuali</u> PAI &amp; PJOK. <b>Guru PAI</b> hanya mapel PAI dan <b>Guru PJOK</b> hanya mapel PJOK. Kosongkan <i>Kelas</i> pada Guru PAI/PJOK bila mengajar semua kelas, atau isi beberapa kelas dipisah koma (mis. <code>4-A, 4-B, 5-A</code>).</div>
   <div class="fw-semibold small mb-1">Akun yang sudah ada</div>${exist}
   ${sisa?`<div class="fw-semibold small mb-1">Tambah guru baru <span class="text-secondary fw-normal">— bisa tempel (Ctrl+V) dari Excel: kolom Nama, Peran, Kelas, NIP</span></div>
   <div class="table-responsive" style="max-height:340px"><table class="table table-sm align-middle"><thead><tr><th>#</th><th style="min-width:200px">Nama Guru</th><th style="min-width:130px">Peran</th><th style="min-width:110px">Kelas</th><th style="min-width:140px">NIP</th></tr></thead><tbody id="grB">${rows}</tbody></table></div><datalist id="grKL">${d.kelasList.map(k=>`<option value="${esc(k)}">`).join('')}</datalist>
   <div class="form-text">Username dibuat otomatis dari nama; sandi awal acak 8 karakter. Daftar akun (username &amp; sandi) dapat diunduh <b>sekali</b> setelah akun dibuat.</div>`:'<div class="alert alert-warning small">Batas '+d.maks+' guru sudah terpenuhi.</div>'}`,
   `<button class="btn btn-light" data-bs-dismiss="modal">Tutup</button>${sisa?'<button class="btn btn-pri" id="grGo" onclick="guruBuat()"><i class="bi bi-person-plus"></i> Buat Akun Guru</button>':''}`,'modal-xl');
  setTimeout(()=>{const b=$('grB');if(!b)return;b.addEventListener('paste',guruTempel)},50);
}
function guruTempel(e){
  const t=(e.clipboardData||window.clipboardData).getData('text');
  if(!t||(t.indexOf('\n')<0&&t.indexOf('\t')<0))return;
  e.preventDefault();
  const el=e.target.closest('tr');if(!el)return;
  const ns=[...document.querySelectorAll('#grB .gr-n')];let i=ns.findIndex(x=>x.closest('tr')===el);if(i<0)i=0;
  t.replace(/\r/g,'').split('\n').filter(l=>l.trim()).forEach((ln,k)=>{
    const c=ln.split('\t'),tr=ns[i+k]&&ns[i+k].closest('tr');if(!tr)return;
    tr.querySelector('.gr-n').value=(c[0]||'').trim();
    const pr=(c[1]||'').trim().toLowerCase(),rs=tr.querySelector('.gr-r');
    rs.value=/pai|agama/.test(pr)?'Guru PAI':/pjok|jasmani|olahraga/.test(pr)?'Guru PJOK':'Guru Kelas';
    tr.querySelector('.gr-k').value=(c[2]||'').trim();tr.querySelector('.gr-p').value=(c[3]||'').trim();
  });
}
async function guruBuat(){
  const rows=[...document.querySelectorAll('#grB tr')].map(tr=>({Nama:tr.querySelector('.gr-n').value.trim(),Role:tr.querySelector('.gr-r').value,Kelas:tr.querySelector('.gr-k').value.trim(),NIP:tr.querySelector('.gr-p').value.trim()})).filter(r=>r.Nama);
  if(!rows.length){toast('Belum ada data','Isi nama minimal satu guru.','warning');return}
  const b=$('grGo');b.disabled=true;
  try{
    const r=await net('guruBuatMassal',rows);
    Object.keys(CACHE).forEach(k=>{if(/listRows\|\["(users|guru|kelas)"/.test(k))delete CACHE[k]});
    S.ttdI=null;TTD.ttl=0;S.grHasil=r;guruHasil(r);
  }catch(e){fail(e);b.disabled=false}
}
function guruHasil(r){
  const lw=r.dilewati&&r.dilewati.length?`<div class="alert alert-warning small py-2">Dilewati: ${r.dilewati.map(x=>esc(x.Nama)+' ('+esc(x.alasan)+')').join('; ')}</div>`:'';
  openModal('Akun Guru Berhasil Dibuat',`<div class="alert alert-success small py-2">${r.dibuat.length} akun dibuat. Total guru sekarang <b>${r.total} / ${r.maks}</b>.<br><b>Catat atau unduh daftar ini sekarang</b> — sandi tidak dapat dilihat lagi (guru dapat menggantinya di menu Pengaturan; Admin dapat mengatur ulang di menu Pengguna).</div>${lw}
   <div class="table-responsive"><table class="table table-sm"><thead><tr><th>Nama</th><th>Peran</th><th>Kelas</th><th>Username</th><th>Sandi awal</th></tr></thead><tbody>${r.dibuat.map(x=>`<tr><td>${esc(x.Nama)}</td><td>${esc(GR_LABEL[x.Role]||x.Role)}</td><td>${esc(x.Kelas||'(semua)')}</td><td><code>${esc(x.Username)}</code></td><td><code>${esc(x.Password)}</code></td></tr>`).join('')}</tbody></table></div>`,
   `<button class="btn btn-light" data-bs-dismiss="modal">Tutup</button><button class="btn btn-outline-secondary" onclick="guruUnduh()"><i class="bi bi-file-earmark-excel"></i> Unduh Daftar Akun (Excel)</button>`,'modal-lg');
}
function guruUnduh(){
  const r=S.grHasil;if(!r||!window.XLSX){toast('Belum siap','Pustaka Excel belum termuat, coba lagi sebentar.','warning');return}
  const ws=XLSX.utils.aoa_to_sheet([['DAFTAR AKUN GURU PENGINPUT NILAI — RAHASIA'],['Dibuat',tglPanjang(tglIni())],[],['No','Nama','Peran','Kelas','NIP','Username','Sandi awal']].concat(r.dibuat.map((x,i)=>[i+1,x.Nama,GR_LABEL[x.Role]||x.Role,x.Kelas||'(semua kelas)',x.NIP||'',x.Username,x.Password])));
  ws['!cols']=[{wch:5},{wch:30},{wch:12},{wch:14},{wch:20},{wch:18},{wch:14}];
  const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'Akun Guru');
  TTD.skip=true;try{XLSX.writeFile(wb,'Akun_Guru_'+tglIni()+'.xlsx')}finally{TTD.skip=false}
}
// Tombol pada halaman Pengguna & Hak Akses (khusus Admin)
const _tbxUsers44=TBX.users;
TBX.users=function(){
  const a=_tbxUsers44?_tbxUsers44.apply(this,arguments):'';
  return a+(S.user&&S.user.Role==='Admin'?'<button class="btn btn-outline-success" onclick="guruUI()" title="Buat akun wali kelas, Guru PAI, dan Guru PJOK (maks. 35 guru) untuk input nilai"><i class="bi bi-person-lines-fill"></i> Akun Guru Input Nilai (35)</button>':'');
};
