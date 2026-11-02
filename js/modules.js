// ============================================================
// APK SEKOLAH MANTAP v4.0 — navigasi bergrup, CRUD generik, ekstensi per modul
// (dimuat setelah app.js; fungsi di sini menggantikan versi lama)
// ============================================================
const rp=n=>'Rp '+Math.round(+n||0).toLocaleString('id-ID');
const tglIni=()=>new Date().toLocaleDateString('sv-SE');
const fTgl=s=>{const m=/^(\d{4})-(\d{2})-(\d{2})/.exec(s||'');return m?m[3]+'/'+m[2]+'/'+m[1]:(s||'')};
const BLN=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const sch=()=>(S.cfg&&S.cfg.schoolName)||'Sekolah';
const kop=()=>`<div style="text-align:center;border-bottom:2px solid #000;padding-bottom:6px;margin-bottom:12px"><b style="font-size:16px">${esc(sch().toUpperCase())}</b><br><small>${esc((S.cfg&&S.cfg.alamat)||'')}</small></div>`;
function dlBlob(name,blob){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove()}
function dlDoc(name,html){dlBlob(name,new Blob(['\ufeff<html><meta charset="utf-8"><body style="font-family:Arial,sans-serif">'+html+'</body></html>'],{type:'application/msword'}))}
function cetak(html){$('printArea').innerHTML=html;setTimeout(()=>window.print(),300)}
function pp(r,k){const n=(+r.Hadir||0)+(+r.Izin||0)+(+r.Sakit||0)+(+r.Alpa||0);return n?Math.round(r[k]*1000/n)/10:0}
function xlsSave(name,sheets){if(!window.XLSX){toast('Belum siap','Pustaka Excel belum termuat, coba lagi sebentar.','warning');return}const wb=XLSX.utils.book_new();sheets.forEach(s=>XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(s[1]),s[0].slice(0,30)));XLSX.writeFile(wb,name)}
const isOT=()=>S.user&&(S.user.Role==='Orang Tua'||S.user.Role==='Murid');

// ── Ikon ──
Object.assign(IC,{visimisi:'bi-bullseye',struktur:'bi-diagram-3',kelas:'bi-door-open',mapel:'bi-book-half',tahunajaran:'bi-calendar-range',jadwal:'bi-table',laporan:'bi-bar-chart-line',wajah:'bi-person-bounding-box',daftarwajah:'bi-person-plus',kartu:'bi-qr-code',kartupelajar:'bi-person-vcard',nilai:'bi-award',kaldik:'bi-calendar3',
 eskul:'bi-trophy',hadireskul:'bi-clipboard-check',kokurikuler:'bi-puzzle',hadirkoku:'bi-clipboard2-check',rpp:'bi-magic',modulajar:'bi-file-earmark-text',banksoal:'bi-collection',kuis:'bi-patch-question',icebreaking:'bi-emoji-smile',kartuguru:'bi-person-badge',arsipdok:'bi-archive',
 ppdb:'bi-person-plus-fill',perizinan:'bi-envelope-paper',bk:'bi-chat-heart',tatib:'bi-list-check',pelanggaran:'bi-exclamation-triangle',mutasi:'bi-box-arrow-right',lulus:'bi-mortarboard',prestasi:'bi-stars',inventaris:'bi-box-seam',pinjamsarpras:'bi-arrow-repeat',denah:'bi-map',
 perpusdash:'bi-speedometer2',anggota:'bi-person-lines-fill',pembayaran:'bi-receipt',tabungan:'bi-piggy-bank',pendapatan:'bi-graph-up-arrow',pengeluaran:'bi-graph-down-arrow',neraca:'bi-bank',honorarium:'bi-wallet2',pip:'bi-card-heading',
 rekammedis:'bi-heart-pulse',kunjunganuks:'bi-hospital',stokobat:'bi-capsule',kopstok:'bi-boxes',kopjual:'bi-cart-check',emoney:'bi-credit-card-2-front',kop_laporan:'bi-file-earmark-bar-graph',piketguru:'bi-person-workspace',piketsiswa:'bi-brush',
 rapat:'bi-easel',notulen:'bi-journal-richtext',presensirapat:'bi-people',followup:'bi-arrow-return-right',osis:'bi-flag',orgkelas:'bi-diagram-2',pengumuman:'bi-megaphone',backup:'bi-cloud-arrow-up',users:'bi-shield-lock',pengaturan:'bi-gear',
 g_matcep:'bi-calculator',g_sains:'bi-radioactive',g_sejarah:'bi-bank2',g_rantai:'bi-link-45deg',g_tebak:'bi-fonts',g_ular:'bi-dice-5',g_balok:'bi-grid-3x3-gap',g_cari:'bi-search',g_quran:'bi-book',
 t_spin:'bi-arrow-repeat',t_acak:'bi-shuffle',t_pasang:'bi-people-fill',t_3d:'bi-box',t_konversi:'bi-arrow-left-right',t_papan:'bi-easel2',t_mind:'bi-share',t_peta:'bi-geo-alt',t_lab:'bi-eyedropper'});
const GI={'Beranda':'bi-house','Profil Sekolah':'bi-building','Data Master':'bi-database','Akademik':'bi-mortarboard','Eskul & Kokurikuler':'bi-trophy','Guru Pintar':'bi-lightbulb','Kesiswaan':'bi-people','Sarana & Prasarana':'bi-box-seam','Perpustakaan':'bi-book','Keuangan':'bi-cash-coin','Unit Kesehatan Sekolah':'bi-heart-pulse','Koperasi Sekolah':'bi-shop','Jadwal Piket':'bi-calendar2-week','Manajemen Rapat':'bi-easel','Organisasi Kelas':'bi-diagram-3','Game Edukatif':'bi-controller','Alat Pembelajaran':'bi-tools','Administrasi & Sistem':'bi-gear'};

// ── Navigasi bergrup ──
function buildNav(){
  const gs=[];S.menu.forEach(m=>{let g=gs.find(x=>x.n===m.g);if(!g){g={n:m.g,items:[]};gs.push(g)}g.items.push(m)});
  const link=m=>`<li class="nitem"><a href="javascript:void(0)" class="nl" data-id="${m.id}" onclick="navigateTo('${m.id}')"><i class="bi ${IC[m.id]||'bi-circle'}"></i><span>${esc(m.label)}</span></a></li>`;
  let op={};try{op=JSON.parse(sessionStorage.getItem('navopen')||'{}')}catch(e){}
  $('nav').innerHTML='<li class="px-1 pb-2"><input id="navQ" class="form-control form-control-sm" placeholder="Cari menu…" aria-label="Cari menu" oninput="filterNav(this.value)"></li>'+
   gs.map(g=>g.n==='Beranda'?g.items.map(link).join(''):`<li class="ngrp ${op[g.n]?'open':''}" data-g="${esc(g.n)}"><button class="ngh" type="button" onclick="toggleGrp(this.parentNode)"><i class="bi ${GI[g.n]||'bi-folder'}"></i><span>${esc(g.n)}</span><i class="bi bi-chevron-down chev"></i></button><ul class="ngl">${g.items.map(link).join('')}</ul></li>`).join('');
}
function saveOpen(){const o={};document.querySelectorAll('.ngrp.open').forEach(l=>o[l.dataset.g]=1);try{sessionStorage.setItem('navopen',JSON.stringify(o))}catch(e){}}
function toggleGrp(li){li.classList.toggle('open');saveOpen()}
function openGroupOf(id){const a=document.querySelector('.nl[data-id="'+id+'"]'),g=a&&a.closest('.ngrp');if(g&&!g.classList.contains('open')){g.classList.add('open');saveOpen()}}
function filterNav(q){
  q=q.trim().toLowerCase();let op={};try{op=JSON.parse(sessionStorage.getItem('navopen')||'{}')}catch(e){}
  document.querySelectorAll('#nav .nitem').forEach(li=>{li.style.display=!q||li.textContent.toLowerCase().includes(q)?'':'none'});
  document.querySelectorAll('.ngrp').forEach(g=>{if(q){const any=[...g.querySelectorAll('.nitem')].some(li=>li.style.display!=='none');g.style.display=any?'':'none';g.classList.toggle('open',any)}else{g.style.display='';g.classList.toggle('open',!!op[g.dataset.g])}});
}
const PAGE={dashboard:'renderDash',absensi:'renderAbs',scan:'renderScan',kartu:'renderKartu',kartupelajar:'renderKartu',pengaturan:'renderSet',arsip:'renderArsip',laporan:'renderLap',wajah:'renderWajah',daftarwajah:'renderDaftarWajah',
 visimisi:'renderVisi',rpp:'renderRpp',kuis:'renderKuis',kartuguru:'renderKartuGuru',perpusdash:'renderPerpus',neraca:'renderNeraca',kop_laporan:'renderKopLap',backup:'renderBackup'};
function navigateTo(id){
  stopScan();if(S.cleanup){try{S.cleanup()}catch(e){}S.cleanup=null}
  S.cur=id;S.keys={};
  document.querySelectorAll('.nl').forEach(a=>a.classList.toggle('active',a.dataset.id===id));
  openGroupOf(id);
  const m=S.menu.find(x=>x.id===id);$('pageTitle').textContent=m?m.label:'';closeSb();loading();
  try{
    let fn=PAGE[id],arg;
    if(!fn){if(/^g_/.test(id)){fn='renderGame';arg=id}else if(/^t_/.test(id)){fn='renderTool';arg=id}else{fn='renderCrud';arg=id}}
    if(typeof window[fn]!=='function')throw new Error('Halaman "'+id+'" belum tersedia.');
    const r=window[fn](arg);if(r&&r.catch)r.catch(fail);
  }catch(e){fail(e)}
  window.scrollTo(0,0);
}

// ── Komponen persentase kehadiran ──
function pstCards(o,unit,sm){
  const L={Hadir:['Persentase Hadir','#10B981','bi-check-circle'],Sakit:['Persentase Sakit','#6366F1','bi-thermometer-half'],Izin:['Persentase Izin','#F59E0B','bi-envelope-paper'],Alpa:['Persentase Alpa','#EF4444','bi-x-circle']};
  o=o||{p:{},c:{},n:0};
  return ['Hadir','Sakit','Izin','Alpa'].map(k=>`<div class="col-6 col-lg-3"><div class="kpi ${sm?'kpi-sm':''}" style="--c:${L[k][1]}"><div class="kpi-i"><i class="bi ${L[k][2]}"></i></div><div class="kpi-l">${L[k][0]}</div><div class="kpi-v">${(o.p||{})[k]||0}%</div><div class="kpi-s">${(o.c||{})[k]||0} dari ${o.n||0} ${unit||''}</div></div></div>`).join('');
}
const livePst=(abs,list)=>{const c={Hadir:0,Sakit:0,Izin:0,Alpa:0},n=list.length||0;list.forEach(s=>{const v=abs[s.NISN];if(c[v]!==undefined)c[v]++});const p={};Object.keys(c).forEach(k=>p[k]=n?Math.round(c[k]*1000/n)/10:0);return{p:p,c:c,n:n}};

// ── Dashboard ──
async function renderDash(){
  const d=await api('getDashboard');await waitLib('Chart');Object.values(S.charts).forEach(c=>c.destroy());S.charts={};
  const k=(l,v,s,c,i)=>`<div class="col-6 col-lg-3"><div class="kpi" style="--c:${c}"><div class="kpi-i"><i class="bi ${i}"></i></div><div class="kpi-l">${l}</div><div class="kpi-v">${v}</div><div class="kpi-s">${s}</div></div></div>`;
  const peng=(d.peng||[]).length?`<div class="card-x p-3 mb-3"><h2 class="h6"><i class="bi bi-megaphone"></i> Pengumuman</h2>${d.peng.map(p=>`<div class="py-2 border-top"><div class="fw-bold">${esc(p.Judul)} <span class="pill bg-body-secondary">${esc(p.Untuk)}</span></div><div class="small text-secondary">${fTgl(p.Tanggal)}</div><div class="small" style="white-space:pre-line">${esc(p.Isi)}</div></div>`).join('')}</div>`:'';
  const agenda=(d.agenda||[]).length?`<div class="card-x p-3 mb-3"><h2 class="h6"><i class="bi bi-calendar-event"></i> Agenda Terdekat</h2>${d.agenda.map(a=>`<div class="d-flex flex-wrap gap-2 py-1 border-top small"><b>${fTgl(a.Tanggal)}${a.Sampai&&a.Sampai!==a.Tanggal?' – '+fTgl(a.Sampai):''}</b><span>${esc(a.Kegiatan)}</span><span class="pill bg-body-secondary ms-auto">${esc(a.Jenis)}</span></div>`).join('')}</div>`:'';
  if(d.own){
    const t=d.total||1,pst={p:{},c:d.c,n:d.total};Object.keys(ST).forEach(s=>pst.p[s]=Math.round((d.c[s]||0)*1000/t)/10);
    $('app-container').innerHTML=`<div class="row g-3 mb-3">${pstCards(pst,'hari')}</div>${peng}${agenda}
    <div class="card-x p-3"><h2 class="h6 mb-3">Riwayat kehadiran terakhir</h2><div class="table-responsive"><table class="table"><thead><tr><th>Anak</th><th>Tanggal</th><th>Status</th><th>Jam</th><th>Metode</th></tr></thead><tbody>${d.recent.map(r=>`<tr><td>${esc(r.Nama||"")}</td><td>${esc(r.Tanggal)}</td><td><span class="pill" style="background:${(ST[r.Status]||ST.Hadir)[0]};color:${(ST[r.Status]||ST.Hadir)[1]}">${esc(r.Status)}</span></td><td>${esc(r.Jam)}</td><td>${esc(r.Metode)}</td></tr>`).join('')||'<tr><td colspan="5" class="text-center text-secondary">Belum ada data.</td></tr>'}</tbody></table></div></div>`;
    return;
  }
  const p=d.siswa?Math.round(d.hadir*1000/d.siswa)/10:0;
  $('app-container').innerHTML=`<div class="row g-3 mb-3">${k('Total Siswa',d.siswa,'siswa aktif','#7C3AED','bi-people')}${k('Hadir Hari Ini',p+'%',d.hadir+' dari '+d.siswa+' siswa','#10B981','bi-check-circle')}${k('Jurnal Hari Ini',d.jurnal,'terisi','#F59E0B','bi-journal-text')}${k('Total GTK',d.guru,'guru & tenaga','#06B6D4','bi-person-badge')}</div>
    <h2 class="h6 text-secondary">Kehadiran hari ini</h2><div class="row g-3 mb-3">${pstCards({p:d.pstHari,c:d.c,n:d.siswa},'siswa',true)}</div>
    <h2 class="h6 text-secondary">Akumulasi tahun ajaran ${esc(S.ta||'')}</h2><div class="row g-3 mb-3">${pstCards(d.pstTA,'catatan',true)}</div>
    <div class="row g-3 mb-3"><div class="col-lg-8"><div class="card-x p-3"><h2 class="h6">Persentase kehadiran per kelas</h2><canvas id="ch" height="130" aria-label="Grafik kehadiran per kelas" role="img"></canvas></div></div>
    <div class="col-lg-4"><div class="insight"><h2 class="h6"><i class="bi bi-stars"></i> Analisis Otomatis</h2><ul class="ps-3 mb-0">${d.ins.map(i=>`<li>${esc(i)}</li>`).join('')}</ul></div></div></div>${peng}${agenda}`;
  Chart.defaults.color=document.documentElement.getAttribute('data-theme')==='dark'?'#9FB0CC':'#475569';
  S.charts.k=new Chart($('ch'),{type:'bar',data:{labels:d.kelas,datasets:[{label:'% Hadir',data:d.pct,backgroundColor:'#7C3AED',borderRadius:8}]},options:{scales:{y:{min:0,max:100}},plugins:{legend:{display:false}}}});
}

// ── Kehadiran siswa: ringkasan + persentase ──
function drawAbs(){
  if(!$('sesiTabs')){const d0=S.absD;$('app-container').insertAdjacentHTML('afterbegin','<div id="sesiTabs" class="mb-3 d-flex gap-2 flex-wrap">'+d0.sesiList.map(x=>`<button class="btn btn-sm ${x===d0.sesi?'btn-pri':'btn-outline-secondary'}" onclick="renderAbs($('aK').value,$('aT').value,'${x}')">${x==='Kelas'?'Absensi Kelas (harian)':'Absensi '+x+' (mandiri)'}</button>`).join('')+'</div>')}
  const d=S.absD,c={Hadir:0,Izin:0,Sakit:0,Alpa:0,Belum:0};d.siswa.forEach(s=>{const v=S.abs[s.NISN];v?c[v]++:c.Belum++});
  const live=livePst(S.abs,d.siswa);
  $('rekap').innerHTML='<div class="d-flex flex-wrap gap-2 align-items-center">'+Object.keys(ST).map(k=>`<span class="pill" style="background:${ST[k][0]};color:${ST[k][1]}">${k} ${c[k]}</span>`).join('')+`<span class="pill bg-body-secondary">Belum ${c.Belum}</span></div>
   <div class="small text-secondary mt-3 mb-1">Persentase pada tanggal ini (dari ${d.siswa.length} siswa)</div><div class="row g-2">${pstCards(live,'siswa',true)}</div>
   <div class="small text-secondary mt-3 mb-1">Akumulasi tahun ajaran ${esc(d.ta||'')} — kelas ${esc(d.kelas)}</div><div class="row g-2">${pstCards(d.pstTA,'catatan',true)}</div>`;
  $('absList').innerHTML=d.siswa.length?d.siswa.map((s,i)=>`<div class="card-x p-3 mb-2 d-flex flex-wrap align-items-center gap-2"><div class="avatar">${esc(s.Nama.split(' ').map(w=>w[0]).slice(0,2).join(''))}</div><div class="me-auto"><div class="fw-bold">${i+1}. ${esc(s.Nama)}</div><div class="small text-secondary">NISN ${esc(s.NISN)}${s.Metode?' · '+esc(s.Metode)+' '+esc(s.Jam):''}</div></div>
    ${d.canEdit?'<div class="chips">'+Object.keys(ST).map(k=>`<button class="chip ${S.abs[s.NISN]===k?'on':''}" style="--bg:${ST[k][0]};--fg:${ST[k][1]};--on:${ST[k][2]}" onclick="setSt(${i},'${k}')">${k}</button>`).join('')+'</div>':`<span class="pill bg-body-secondary">${esc(S.abs[s.NISN]||'-')}</span>`}</div>`).join(''):'<div class="card-x p-4 text-center text-secondary">Belum ada siswa di kelas ini.</div>';
}

// ── CRUD generik ──
const IMPORTABLE_FE=['siswa','guru','jurnal','kelas','mapel','jadwal','nilai','kaldik','eskul','hadireskul','hadirkoku','presensirapat','banksoal','tatib','struktur','inventaris','buku','anggota','piketguru','piketsiswa','kopstok','stokobat','pendapatan','pengeluaran','prestasi','pip','pembayaran','honorarium'];
const CRX={},ROWX={},TBX={};
const MONEYF={HargaSatuan:1,Total:1,Laba:1,Diterima:1};
const PILL={g:['#ECFDF5','#065F46'],y:['#FEF3C7','#92400E'],r:['#FEE2E2','#991B1B'],b:['#E0E7FF','#3730A3']};
const PILLMAP={Hadir:'g',Selesai:'g',Disetujui:'g',Dibayar:'g',Dicairkan:'g',Diterima:'g',Baik:'g',Aktif:'g',Lancar:'g',Layak:'g',Dikembalikan:'g','Daftar Ulang':'g',Izin:'y',Proses:'y',Diajukan:'y',Baru:'y',Cadangan:'y',Dipinjam:'y','Rusak Ringan':'y','Belum Dibayar':'y',Belum:'y',Usulan:'y','Perlu Perbaikan':'y',Dibina:'y','Orang tua dipanggil':'y',Sakit:'b',Rujukan:'b',Mutasi:'b',Lulus:'b',Alpa:'r',Ditolak:'r','Rusak Berat':'r','Tidak Layak':'r','Belum Hafal':'r','Tanpa Keterangan':'r',Keluar:'r',Nonaktif:'r'};
const edF=f=>f.t!=='password'&&f.t!=='file'&&f.t!=='auto';
function cellHtml(c,f,r,ri){
  const v=r[f.n];
  if(f.t==='file')return v?`<button class="btn btn-sm btn-light" onclick="prev(${ri},'${f.n}')"><i class="bi bi-eye"></i> Lihat</button>`:'';
  if(v==null||v==='')return '';
  if(f.n==='Status'||f.n==='Kondisi'){const k=PILLMAP[v];if(k)return `<span class="pill" style="background:${PILL[k][0]};color:${PILL[k][1]}">${esc(v)}</span>`}
  if(f.t==='money'||(f.t==='auto'&&MONEYF[f.n]))return rp(v);
  if(f.t==='date')return fTgl(v);
  const s=String(v);if(f.t==='textarea'||s.length>90)return `<span title="${esc(s)}">${esc(s.slice(0,80))}${s.length>80?'…':''}</span>`;
  return esc(s);
}
function canRow(c,r){
  if(!c.canWrite)return false;const R=S.user.Role;
  if(c.mod==='perizinan'&&R==='Orang Tua')return r.Status==='Diajukan';
  if((c.mod==='piketsiswa'||c.mod==='orgkelas')&&R==='Guru Kelas')return r.Kelas===S.user.Kelas;
  return true;
}
async function renderCrud(mod){
  const r=await api('listRows',mod);S.crud=Object.assign({mod:mod},r);const c=S.crud;
  const imp=IMPORTABLE_FE.indexOf(mod)>=0&&r.canWrite;
  $('app-container').innerHTML=`${CRX[mod]?'<div id="crx" class="mb-3"></div>':''}<div class="card-x p-3"><div class="d-flex flex-wrap gap-2 mb-3"><input class="form-control w-auto flex-grow-1" id="q" placeholder="Cari…" aria-label="Cari" oninput="drawTbl()">
    ${r.canWrite?'<button class="btn btn-pri" onclick="openForm(-1)"><i class="bi bi-plus-lg"></i> '+(mod==='perizinan'&&S.user.Role==='Orang Tua'?'Ajukan Izin':'Tambah')+'</button>':''}
    ${imp?'<button class="btn btn-outline-primary" onclick="importUI()"><i class="bi bi-file-earmark-arrow-up"></i> Impor CSV</button>':''}
    ${TBX[mod]&&r.canWrite?TBX[mod](c):''}${TBX[mod]&&!r.canWrite&&TBX[mod].always?TBX[mod](c):''}
    ${mod==='tahunajaran'&&r.canWrite?'<button class="btn btn-success" onclick="tahunBaruUI()"><i class="bi bi-calendar-plus"></i> Mulai Tahun Ajaran Baru</button>':''}<div class="dropdown"><button class="btn btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown"><i class="bi bi-download"></i> Unduh</button><ul class="dropdown-menu">
    <li><a class="dropdown-item" href="javascript:void(0)" onclick="exportTbl('xls')">Excel (.xlsx)</a></li><li><a class="dropdown-item" href="javascript:void(0)" onclick="exportTbl('doc')">Word (.docx)</a></li><li><a class="dropdown-item" href="javascript:void(0)" onclick="exportTbl('pdf')">PDF</a></li></ul></div></div>
    <div class="table-responsive" id="tbl"></div></div>`;
  drawTbl();
  if(CRX[mod]){try{await CRX[mod](c,$('crx'))}catch(e){$('crx').innerHTML=''}}
}
function drawTbl(){
  const c=S.crud,q=($('q').value||'').toLowerCase(),fs=c.f.filter(x=>x.t!=='password'&&(c.h||[]).indexOf(x.n)<0);
  const v=c.rows.map((r,i)=>[r,i]).filter(x=>!q||c.f.some(f=>String(x[0][f.n]==null?'':x[0][f.n]).toLowerCase().includes(q)));
  $('tbl').innerHTML=`<table class="table"><thead><tr>${fs.map(f=>`<th>${esc(f.l)}</th>`).join('')}<th></th></tr></thead><tbody>${v.map(x=>`<tr>${fs.map(f=>`<td>${cellHtml(c,f,x[0],x[1])}</td>`).join('')}
    <td class="text-nowrap text-end">${ROWX[c.mod]?ROWX[c.mod](x[0],x[1],c):''}${c.mod==='siswa'?`<button class="btn btn-sm btn-light" title="Kartu QR" aria-label="Kartu QR" onclick="showQR(${x[1]})"><i class="bi bi-qr-code"></i></button> `:''}${canRow(c,x[0])?`<button class="btn btn-sm btn-light" aria-label="Ubah" onclick="openForm(${x[1]})"><i class="bi bi-pencil"></i></button> <button class="btn btn-sm btn-light text-danger" aria-label="Hapus" onclick="del(${x[1]})"><i class="bi bi-trash"></i></button>`:''}</td></tr>`).join('')||`<tr><td colspan="${fs.length+1}" class="text-center text-secondary py-4">Belum ada data.</td></tr>`}</tbody></table>`;
}
async function loadSisList(){
  const dl=$('dlNisn');if(!dl)return;
  try{if(!S.sisAll)S.sisAll=await api('listSiswaRingkas','');dl.innerHTML=S.sisAll.map(s=>`<option value="${esc(s.NISN)}" label="${esc(s.Nama+' ('+s.Kelas+')')}"></option>`).join('')}catch(e){}
}
function openForm(i){
  const c=S.crud,r=i>=0?c.rows[i]:{},R=S.user.Role,ot=isOT();S.editI=i;
  const ed=c.f.filter(f=>f.t!=='auto'),rq=c.rq||2,DEF={Tanggal:1,TglPinjam:1,TglPeriksa:1};
  const fields=ed.filter(f=>!(c.mod==='perizinan'&&R==='Orang Tua'&&f.n==='Status'));
  const hasN=fields.some(f=>f.n==='NISN');
  const inp=f=>{
    let val=r[f.n];if((val==null||val==='')&&i<0&&f.t==='date'&&DEF[f.n])val=tglIni();
    const v=esc(val==null?'':val),id='f_'+f.n,req=ed.indexOf(f)<rq?'required':'',lb=`<label class="form-label small fw-semibold" for="${id}">${esc(f.l)}</label>`;
    if(f.t==='select')return lb+`<select class="form-select" id="${id}" name="${f.n}">${f.o.map(o=>`<option ${r[f.n]===o?'selected':''}>${esc(o)}</option>`).join('')}</select>`;
    if(f.t==='textarea')return lb+`<textarea class="form-control" id="${id}" name="${f.n}" rows="${f.n==='Isi'?10:3}" ${req}>${v}</textarea>`;
    if(f.t==='file')return lb+`<input type="hidden" name="${f.n}" id="${id}" value="${v}"><input type="file" class="form-control" accept="image/*,.pdf" onchange="up(this,'${id}')"><div class="form-text" id="${id}_s">${v?'Berkas sudah terlampir.':'Maks 5 MB (JPG/PNG/PDF).'}</div>`;
    const pw=f.t==='password',ty=f.t==='money'?'number':f.t;
    let ex='';if(f.t==='money'||f.t==='number')ex=' min="0" step="any" inputmode="decimal"';
    if(f.n==='NISN'&&ot)return lb+`<input class="form-control" id="${id}" name="${f.n}" value="${esc(S.user.NISN||'')}" readonly>`;
    if(f.n==='NISN')ex+=' list="dlNisn"';
    return lb+`<input class="form-control" id="${id}" name="${f.n}" type="${ty}" value="${pw?'':v}" ${pw&&i<0?'required':req} autocomplete="off"${ex}>`;
  };
  openModal((i>=0?'Ubah ':'Tambah ')+c.title,`<form id="frm" onsubmit="saveForm(event)" class="row g-3">${fields.map(f=>`<div class="col-md-${f.t==='textarea'||f.t==='file'?12:6}">${inp(f)}</div>`).join('')}${hasN&&!ot?'<datalist id="dlNisn"></datalist>':''}</form>${ed.length<c.f.length?'<div class="form-text mt-2">Kolom otomatis (nama, kelas, nilai akhir, dll.) diisi sistem saat disimpan.</div>':''}`,
    '<button class="btn btn-light" data-bs-dismiss="modal">Batal</button><button class="btn btn-pri" id="bSave" form="frm" type="submit">Simpan</button>','modal-lg');
  if(hasN&&!ot)loadSisList();
}
async function saveForm(ev){
  ev.preventDefault();const o=Object.fromEntries(new FormData($('frm'))),c=S.crud,b=$('bSave');
  if(S.editI>=0)o.ID=c.rows[S.editI].ID;b.disabled=true;
  try{await api('saveRow',c.mod,o);closeModal();toast('Berhasil','Data tersimpan.','success');renderCrud(c.mod)}catch(e){fail(e);b.disabled=false}
}
function importUI(){
  const f=S.crud.f.filter(edF);
  openModal('Impor '+S.crud.title+' (CSV)','<p>Kolom (baris pertama = judul): <code>'+esc(f.map(x=>x.n).join(','))+'</code>.</p><p class="small text-secondary">Kolom otomatis (nama/kelas siswa, nilai akhir, dll.) dihitung sistem. Tanggal ditulis YYYY-MM-DD.</p><button class="btn btn-sm btn-outline-secondary mb-2" onclick="tplCsv()"><i class="bi bi-download"></i> Unduh template CSV</button><input type="file" class="form-control" accept=".csv,text/csv" onchange="doImport(this)"><div id="impRes" class="mt-3"></div>','<button class="btn btn-light" data-bs-dismiss="modal">Tutup</button>');
}
function tplCsv(){const f=S.crud.f.filter(edF);dlBlob('template_'+S.crud.mod+'.csv',new Blob(['\ufeff'+f.map(x=>x.n).join(',')+'\r\n'],{type:'text/csv'}))}
function doImport(inp){
  const f=inp.files[0];if(!f)return;const rd=new FileReader();
  rd.onload=async()=>{
    const R=parseCsv(rd.result);if(R.length<2){toast('Kosong','File tidak berisi data.','warning');return}
    const map={};S.crud.f.forEach(x=>{map[x.n.toLowerCase()]=x.n;map[x.l.toLowerCase()]=x.n});
    const h=R[0].map(x=>map[String(x).trim().toLowerCase()]||String(x).trim());
    const rows=R.slice(1).filter(r=>r.some(x=>String(x).trim()!=='')).map(r=>{const o={};h.forEach((k,j)=>o[k]=r[j]==null?'':r[j]);return o});
    if(!rows.length){toast('Kosong','Tidak ada baris data.','warning');return}
    let n=0,gagal=[];const el=$('impRes');
    try{
      for(let i=0;i<rows.length;i+=400){el.innerHTML='<span class="spinner-border spinner-border-sm"></span> Mengimpor '+Math.min(i+400,rows.length)+' / '+rows.length+'...';const x=await api('importData',S.crud.mod,rows.slice(i,i+400));n+=x.berhasil;gagal=gagal.concat(x.gagal||[])}
      el.innerHTML='<div class="alert alert-success mb-2">'+n+' data berhasil diimpor.</div>'+(gagal.length?'<div class="alert alert-warning small mb-0"><b>Dilewati:</b><br>'+gagal.slice(0,10).map(esc).join('<br>')+'</div>':'');renderCrud(S.crud.mod);
    }catch(e){el.innerHTML=n?'<div class="alert alert-warning mb-0">'+n+' data sudah masuk sebelum terjadi kesalahan.</div>':'';fail(e)}
  };
  rd.readAsText(f);
}

// ── Pengambilan cepat: prefetch hanya halaman inti ──
async function prefetchAll(){
  const core=['dashboard','absensi','kartu','pengaturan','daftarwajah','siswa','guru','jadwal'],m={dashboard:['getDashboard'],absensi:['getAbsensi','','',''],kartu:['listRows','siswa'],pengaturan:['getSettings'],daftarwajah:['listWajah']},jobs=[];
  for(const x of S.menu||[]){if(core.indexOf(x.id)<0)continue;const c=m[x.id]||['listRows',x.id],a=c.slice(1),key=c[0]+'|'+JSON.stringify(a);if(CACHE[key]===undefined&&!INF[key])jobs.push([c[0],a,key])}
  const w=async()=>{while(jobs.length&&S.token){const j=jobs.shift();INF[j[2]]=1;try{CACHE[j[2]]=JSON.stringify(await net(j[0],...j[1]));pc()}catch(e){}INF[j[2]]=0}};
  await Promise.all([w(),w(),w()]);
}

// ============================================================
// EKSTENSI PER MODUL
// ============================================================
// ── Struktur organisasi: bagan pohon ──
CRX.struktur=(c,el)=>{
  const rows=c.rows.slice().sort((a,b)=>(+a.Urutan||0)-(+b.Urutan||0)),key=s=>String(s||'').trim().toLowerCase(),by={};rows.forEach(r=>by[key(r.Jabatan)]=r);
  const kids=r=>rows.filter(x=>key(x.Atasan)===key(r.Jabatan)&&x!==r),roots=rows.filter(r=>!r.Atasan||!by[key(r.Atasan)]);
  const node=(r,d)=>{const t=thumb(r.FotoUrl),k=d<8?kids(r):[];return `<li><div class="org-n">${t?'<img alt="" src="'+t+'">':'<i class="bi bi-person-circle fs-3"></i>'}<b>${esc(r.Nama)}</b><small>${esc(r.Jabatan)}</small></div>${k.length?'<ul>'+k.map(x=>node(x,d+1)).join('')+'</ul>':''}</li>`};
  el.innerHTML=rows.length?`<div class="card-x p-3"><h2 class="h6 mb-3">Bagan Struktur Organisasi</h2><div class="org"><ul>${roots.map(r=>node(r,0)).join('')}</ul></div></div>`:'<div class="alert alert-info mb-0">Tambahkan jabatan di bawah; isi kolom <b>Atasan</b> dengan nama jabatan atasan agar bagan tersusun otomatis.</div>';
};
// ── Jadwal pelajaran: tampilan grid per kelas ──
CRX.jadwal=(c,el)=>{
  const kl=[...new Set(c.rows.map(r=>r.Kelas))].sort();if(!kl.length){el.innerHTML='';return}
  const H=['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  const draw=k=>{
    const rs=c.rows.filter(r=>r.Kelas===k),hs=H.filter(h=>rs.some(r=>r.Hari===h)),jam=[...new Set(rs.map(r=>r.JamKe+'|'+(r.Waktu||'')))].sort((a,b)=>(parseFloat(a)||0)-(parseFloat(b)||0)||a.localeCompare(b));
    $('jg').innerHTML=`<div class="table-responsive"><table class="table table-bordered text-center align-middle"><thead><tr><th>Jam</th>${hs.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${jam.map(j=>{const[ke,w]=j.split('|');return `<tr><td class="small"><b>${esc(ke)}</b><br>${esc(w)}</td>${hs.map(h=>{const x=rs.filter(r=>r.Hari===h&&r.JamKe===ke);return `<td>${x.map(r=>`<div class="fw-semibold">${esc(r.Mapel)}</div><div class="small text-secondary">${esc(r.Guru)}</div>`).join('')}</td>`}).join('')}</tr>`}).join('')}</tbody></table></div>`;
  };
  const def=kl.indexOf(S.user.Kelas)>=0?S.user.Kelas:kl[0];
  el.innerHTML=`<div class="card-x p-3"><div class="d-flex flex-wrap gap-2 align-items-center mb-2"><h2 class="h6 m-0 me-auto">Tampilan Jadwal per Kelas</h2><select id="jk" class="form-select w-auto">${kl.map(k=>`<option ${k===def?'selected':''}>${esc(k)}</option>`).join('')}</select><button class="btn btn-sm btn-outline-secondary" onclick="jadwalCetak()"><i class="bi bi-printer"></i> Cetak</button></div><div id="jg"></div></div>`;
  $('jk').onchange=e=>draw(e.target.value);draw(def);
};
function jadwalCetak(){cetak('<h3>Jadwal Pelajaran Kelas '+esc($('jk').value)+'</h3>'+$('jg').innerHTML)}
// ── Kaldik: kalender bulanan ──
CRX.kaldik=(c,el)=>{
  const WN={'Libur':'#EF4444','Ujian/Asesmen':'#F59E0B','Kegiatan Sekolah':'#7C3AED','Rapat':'#06B6D4','Hari Besar':'#EC4899','Pembagian Rapor':'#10B981'};
  const t=new Date();S.kd={y:t.getFullYear(),m:t.getMonth()};
  const draw=()=>{
    const y=S.kd.y,m=S.kd.m,first=(new Date(y,m,1).getDay()+6)%7,n=new Date(y,m+1,0).getDate(),iso=d=>y+'-'+String(m+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
    const ev=d=>c.rows.filter(r=>r.Tanggal<=iso(d)&&iso(d)<=(r.Sampai||r.Tanggal));
    let cells='';for(let i=0;i<first;i++)cells+='<div class="kc empty"></div>';
    for(let d=1;d<=n;d++){const es=ev(d),mg=(first+d-1)%7===6;cells+=`<div class="kc ${mg?'mg':''}"><b>${d}</b>${es.slice(0,3).map(e=>`<span class="ke" style="background:${WN[e.Jenis]||'#64748b'}" title="${esc(e.Kegiatan)}">${esc(e.Kegiatan)}</span>`).join('')}${es.length>3?'<small>+'+(es.length-3)+'</small>':''}</div>`}
    const list=c.rows.filter(r=>(r.Sampai||r.Tanggal).slice(0,7)>=iso(1).slice(0,7)&&r.Tanggal.slice(0,7)<=iso(1).slice(0,7)).sort((a,b)=>a.Tanggal.localeCompare(b.Tanggal));
    $('kdb').innerHTML=`<div class="d-flex align-items-center gap-2 mb-2"><button class="btn btn-sm btn-light" id="kdP"><i class="bi bi-chevron-left"></i></button><h2 class="h6 m-0 flex-grow-1 text-center">${BLN[m]} ${y}</h2><button class="btn btn-sm btn-light" id="kdN"><i class="bi bi-chevron-right"></i></button></div>
     <div class="kgrid">${['Sen','Sel','Rab','Kam','Jum','Sab','Min'].map(h=>`<div class="kh">${h}</div>`).join('')}${cells}</div>
     <div class="d-flex flex-wrap gap-2 mt-2 small">${Object.keys(WN).map(k=>`<span><i class="bi bi-square-fill" style="color:${WN[k]}"></i> ${k}</span>`).join('')}</div>
     ${list.length?'<div class="mt-2 small">'+list.map(r=>`<div class="py-1 border-top"><b>${fTgl(r.Tanggal)}${r.Sampai&&r.Sampai!==r.Tanggal?' – '+fTgl(r.Sampai):''}</b> ${esc(r.Kegiatan)} <span class="text-secondary">(${esc(r.Jenis)})</span></div>`).join('')+'</div>':''}`;
    $('kdP').onclick=()=>{S.kd.m--;if(S.kd.m<0){S.kd.m=11;S.kd.y--}draw()};$('kdN').onclick=()=>{S.kd.m++;if(S.kd.m>11){S.kd.m=0;S.kd.y++}draw()};
  };
  el.innerHTML='<div class="card-x p-3" id="kdb"></div>';draw();
};
// ── Ice breaking: pengacak ──
const ICE=[
 {Nama:'Tepuk Semangat',Kategori:'Pembuka/Energizer',Durasi:2,Cara:'Guru membuat pola tepukan, siswa menirukan. Pola dibuat makin cepat dan rumit.'},
 {Nama:'Kata Guru',Kategori:'Fokus',Durasi:3,Cara:'Siswa hanya boleh melakukan gerakan jika guru menyebut "Kata guru…". Yang salah mengikuti, duduk sebentar.'},
 {Nama:'Patung Bergerak',Kategori:'Fokus',Durasi:3,Cara:'Putar lagu, siswa bergerak bebas. Saat lagu berhenti, semua membeku seperti patung.'},
 {Nama:'Berdiri Jika…',Kategori:'Pembuka/Energizer',Durasi:3,Cara:'Guru menyebut pernyataan (mis. "Berdiri jika kamu suka bakso"). Siswa yang sesuai berdiri.'},
 {Nama:'Hitung Bersama',Kategori:'Kerja Sama',Durasi:5,Cara:'Kelas menghitung 1 sampai 20 bergantian secara acak tanpa ada dua siswa yang menyebut angka bersamaan. Jika bentrok, mulai dari 1.'},
 {Nama:'Pesan Berbisik',Kategori:'Fokus',Durasi:5,Cara:'Satu kalimat dibisikkan dari siswa ke siswa dalam barisan. Bandingkan kalimat awal dan akhir.'},
 {Nama:'Gambar Buta',Kategori:'Kreativitas',Durasi:7,Cara:'Berpasangan: satu siswa menjelaskan sebuah gambar tanpa menyebut nama benda, pasangannya menggambar tanpa melihat.'},
 {Nama:'Nama dan Gerakan',Kategori:'Pembuka/Energizer',Durasi:5,Cara:'Setiap siswa menyebut namanya sambil membuat gerakan; kelas mengulangi nama dan gerakan itu.'},
 {Nama:'Napas Balon',Kategori:'Tenang/Relaksasi',Durasi:2,Cara:'Tarik napas dalam lewat hidung (4 hitungan) sambil mengangkat tangan seperti balon mengembang, hembuskan perlahan lewat mulut.'},
 {Nama:'Menara Kertas',Kategori:'Kerja Sama',Durasi:10,Cara:'Tiap kelompok membangun menara setinggi mungkin dari kertas koran dan selotip dalam waktu terbatas.'},
 {Nama:'Cerita Sambung Kata',Kategori:'Kreativitas',Durasi:5,Cara:'Siswa menyambung sebuah cerita satu kata atau satu kalimat secara bergiliran.'},
 {Nama:'Peregangan 1 Menit',Kategori:'Tenang/Relaksasi',Durasi:1,Cara:'Pimpin peregangan leher, bahu, tangan, dan punggung sambil menarik napas dalam.'},
 {Nama:'Dua Kebenaran, Satu Kebohongan',Kategori:'Pembuka/Energizer',Durasi:5,Cara:'Siswa menyebut tiga fakta tentang dirinya, satu di antaranya bohong. Teman menebak yang bohong.'},
 {Nama:'Tebak Gerakan',Kategori:'Kreativitas',Durasi:5,Cara:'Satu siswa memeragakan sebuah benda/pekerjaan tanpa suara, kelas menebak.'}];
CRX.icebreaking=(c,el)=>{
  const all=ICE.concat(c.rows.map(r=>({Nama:r.Nama,Kategori:r.Kategori,Durasi:r.Durasi,Cara:r.Cara,own:1})));
  const kat=[...new Set(all.map(x=>x.Kategori))];
  el.innerHTML=`<div class="card-x p-3"><div class="d-flex flex-wrap gap-2 align-items-center mb-3"><h2 class="h6 m-0 me-auto">🎲 Acak Ice Breaking</h2><select id="icK" class="form-select w-auto"><option value="">Semua kategori</option>${kat.map(k=>`<option>${esc(k)}</option>`).join('')}</select><button class="btn btn-pri" id="icGo">Acak!</button></div><div id="icR" class="text-center p-3 rounded-3" style="background:var(--bs-tertiary-bg)">Tekan <b>Acak!</b> untuk mendapat ide permainan. Tersedia ${all.length} permainan (${ICE.length} bawaan + ${c.rows.length} tambahan Anda).</div></div>`;
  $('icGo').onclick=()=>{const l=all.filter(x=>!$('icK').value||x.Kategori===$('icK').value),x=l[Math.floor(Math.random()*l.length)];if(!x)return;
    $('icR').innerHTML=`<div class="fs-4 fw-extra">${esc(x.Nama)}</div><div class="mb-2"><span class="pill bg-body-secondary">${esc(x.Kategori)}</span> <span class="pill bg-body-secondary">${esc(x.Durasi)} menit</span></div><p class="mb-0" style="white-space:pre-line">${esc(x.Cara)}</p>`};
};
// ── Denah: galeri gambar ──
CRX.denah=(c,el)=>{
  const g=c.rows.map((r,i)=>[r,i]).filter(x=>x[0].FotoUrl&&thumb(x[0].FotoUrl));
  el.innerHTML=g.length?`<div class="row g-3">${g.map(x=>`<div class="col-sm-6 col-lg-4"><div class="card-x p-2 h-100"><img alt="${esc(x[0].Nama)}" src="${thumb(x[0].FotoUrl).replace('w400','w800')}" style="width:100%;border-radius:8px;cursor:pointer" onclick="prev(${x[1]},'FotoUrl')"><div class="p-2"><b>${esc(x[0].Nama)}</b><div class="small text-secondary">${esc(x[0].Jenis)}${x[0].Kapasitas?' · '+esc(x[0].Kapasitas):''}</div></div></div></div>`).join('')}</div>`:'';
};
// ── Tabungan & E-Money: tabel saldo ──
function saldoTbl(el,judul,list,kolom){
  const tot=list.reduce((a,x)=>a+x.Saldo,0);
  el.innerHTML=`<div class="card-x p-3"><div class="d-flex flex-wrap mb-2"><h2 class="h6 m-0 me-auto">${judul}</h2><span class="pill bg-body-secondary">Total saldo ${rp(tot)}</span></div><div class="table-responsive" style="max-height:320px"><table class="table table-sm"><thead><tr><th>Nama</th><th>Kelas</th>${kolom.map(k=>`<th class="text-end">${k[0]}</th>`).join('')}<th class="text-end">Saldo</th></tr></thead><tbody>${list.map(x=>`<tr><td>${esc(x.Nama||x.NISN)}</td><td>${esc(x.Kelas)}</td>${kolom.map(k=>`<td class="text-end">${rp(x[k[1]])}</td>`).join('')}<td class="text-end fw-bold ${x.Saldo<0?'text-danger':''}">${rp(x.Saldo)}</td></tr>`).join('')||'<tr><td colspan="9" class="text-center text-secondary">Belum ada data.</td></tr>'}</tbody></table></div></div>`;
}
CRX.tabungan=async(c,el)=>saldoTbl(el,'Saldo Tabungan Siswa',await api('saldoTabungan'),[['Setor','Setor'],['Tarik','Tarik']]);
CRX.emoney=async(c,el)=>saldoTbl(el,'Saldo E-Money Siswa',await api('saldoEmoney'),[['Top Up','TopUp'],['Tarik','Tarik'],['Belanja','Belanja']]);

// ── Aksi baris ──
ROWX.ppdb=(r,i)=>r.Status==='Daftar Ulang'?'':`<button class="btn btn-sm btn-light text-success" title="Jadikan siswa aktif" aria-label="Jadikan siswa" onclick="ppdbTerima(${i})"><i class="bi bi-person-check"></i></button> `;
function ppdbTerima(i){
  const r=S.crud.rows[i];
  openModal('Jadikan Siswa Aktif','<p>Data <b>'+esc(r.NamaCalon)+'</b> akan dipindahkan ke Data Siswa.</p><div class="row g-2"><div class="col-6"><label class="form-label small fw-semibold">Kelas</label><input id="ppK" class="form-control" value="'+esc(r.KelasTujuan||'1-A')+'"></div><div class="col-6"><label class="form-label small fw-semibold">NISN</label><input id="ppN" class="form-control" value="'+esc(r.NISN||'')+'"></div></div>','<button class="btn btn-light" data-bs-dismiss="modal">Batal</button><button class="btn btn-success" id="ppGo">Jadikan Siswa</button>');
  $('ppGo').onclick=async()=>{try{$('ppGo').disabled=true;await api('terimaPPDB',r.ID,$('ppK').value.trim(),$('ppN').value.trim());closeModal();S.sisAll=null;toast('Berhasil','Siswa ditambahkan ke Data Siswa.','success');renderCrud('ppdb')}catch(e){fail(e);$('ppGo').disabled=false}};
}
ROWX.pinjam=(r,i)=>r.Status==='Dipinjam'?`<button class="btn btn-sm btn-light text-success" title="Tandai dikembalikan" aria-label="Kembalikan" onclick="kembalikan(${i})"><i class="bi bi-box-arrow-in-left"></i></button> `:'';
async function kembalikan(i){const r=S.crud.rows[i];try{await api('saveRow','pinjam',Object.assign({},r,{Status:'Dikembalikan',TglKembali:tglIni()}));toast('Berhasil','Buku dikembalikan.','success');renderCrud('pinjam')}catch(e){fail(e)}}
ROWX.perizinan=(r,i)=>(!isOT()&&r.Status==='Diajukan')?`<button class="btn btn-sm btn-light text-success" title="Setujui" aria-label="Setujui" onclick="izinSet(${i},'Disetujui')"><i class="bi bi-check-lg"></i></button> <button class="btn btn-sm btn-light text-danger" title="Tolak" aria-label="Tolak" onclick="izinSet(${i},'Ditolak')"><i class="bi bi-x-lg"></i></button> `:'';
async function izinSet(i,st){const r=S.crud.rows[i];try{await api('saveRow','perizinan',Object.assign({},r,{Status:st}));toast('Berhasil','Perizinan '+st.toLowerCase()+(st==='Disetujui'&&['Izin','Sakit'].indexOf(r.Jenis)>=0?' dan tercatat di Kehadiran Siswa.':'.'),'success');renderCrud('perizinan')}catch(e){fail(e)}}
ROWX.pembayaran=(r,i)=>`<button class="btn btn-sm btn-light" title="Cetak kuitansi" aria-label="Kuitansi" onclick="kuitansi(${i})"><i class="bi bi-printer"></i></button> `;
function kuitansi(i){
  const r=S.crud.rows[i];
  cetak(`<div style="max-width:520px;margin:auto;border:1px solid #000;padding:16px;font-family:Arial">${kop()}<h3 style="text-align:center;margin:0 0 10px">KUITANSI PEMBAYARAN</h3>
  <table style="width:100%;font-size:13px"><tr><td>No.</td><td>: ${esc(r.NoKuitansi)}</td></tr><tr><td>Tanggal</td><td>: ${fTgl(r.Tanggal)}</td></tr><tr><td>Telah diterima dari</td><td>: ${esc(r.Nama)} (NISN ${esc(r.NISN)}, Kelas ${esc(r.Kelas)})</td></tr><tr><td>Untuk pembayaran</td><td>: ${esc(r.Jenis)} ${esc(r.Periode||'')}</td></tr><tr><td>Metode</td><td>: ${esc(r.Metode)}</td></tr><tr><td>Jumlah</td><td>: <b>${rp(r.Jumlah)}</b></td></tr></table>
  <div style="display:flex;justify-content:space-between;margin-top:36px;font-size:13px"><div>Pembayar,<br><br><br>(................)</div><div>Penerima,<br><br><br>(................)</div></div></div>`);
}
ROWX.honorarium=(r,i)=>`<button class="btn btn-sm btn-light" title="Cetak slip" aria-label="Slip" onclick="slipHonor(${i})"><i class="bi bi-printer"></i></button> `;
function slipHonor(i){
  const r=S.crud.rows[i],bl=/^(\d{4})-(\d{2})/.exec(r.Bulan||''),per=bl?BLN[+bl[2]-1]+' '+bl[1]:esc(r.Bulan||'');
  cetak(`<div style="max-width:520px;margin:auto;border:1px solid #000;padding:16px;font-family:Arial">${kop()}<h3 style="text-align:center;margin:0 0 10px">SLIP HONORARIUM — ${per}</h3>
  <table style="width:100%;font-size:13px"><tr><td>Nama</td><td>: ${esc(r.Nama)}</td></tr><tr><td>Jabatan</td><td>: ${esc(r.Jabatan)}</td></tr><tr><td>Jumlah jam/hari × tarif</td><td>: ${esc(r.JmlJam)} × ${rp(r.Tarif)} = ${rp((+r.JmlJam||0)*(+r.Tarif||0))}</td></tr><tr><td>Tunjangan</td><td>: ${rp(r.Tunjangan)}</td></tr><tr><td>Potongan</td><td>: ${rp(r.Potongan)}</td></tr><tr><td><b>Diterima</b></td><td>: <b>${rp(r.Diterima)}</b></td></tr><tr><td>Status</td><td>: ${esc(r.Status)} ${r.TglBayar?'('+fTgl(r.TglBayar)+')':''}</td></tr></table>
  <div style="text-align:right;margin-top:36px;font-size:13px">Bendahara,<br><br><br>(................)</div></div>`);
}

// ── Isi massal presensi (rapat / eskul / kokurikuler) ──
TBX.presensirapat=()=>'<button class="btn btn-outline-success" onclick="bulkUI(\'presensirapat\')"><i class="bi bi-ui-checks"></i> Isi Massal dari Data Guru</button>';
TBX.hadireskul=()=>'<button class="btn btn-outline-success" onclick="bulkUI(\'hadireskul\')"><i class="bi bi-ui-checks"></i> Isi Massal Kehadiran</button>';
TBX.hadirkoku=()=>'<button class="btn btn-outline-success" onclick="bulkUI(\'hadirkoku\')"><i class="bi bi-ui-checks"></i> Isi Massal Kehadiran</button>';
async function bulkUI(mod){
  const guru=mod==='presensirapat',lab=mod==='hadireskul'?'Ekstrakurikuler':mod==='hadirkoku'?'Kegiatan Kokurikuler':'Agenda Rapat';
  let list=[],opts=[];
  try{
    if(guru)list=(await api('listRows','guru')).rows.map(g=>({k:g.Nama,Nama:g.Nama,Jabatan:g.Jabatan||''}));
    else{S.sisAll=S.sisAll||await api('listSiswaRingkas','');list=S.sisAll.map(s=>({k:s.NISN,Nama:s.Nama,NISN:s.NISN,Kelas:s.Kelas}));
      try{opts=(await api('listRows',mod==='hadireskul'?'eskul':'kokurikuler')).rows.map(x=>x.Nama)}catch(e){}}
  }catch(e){return fail(e)}
  const kl=guru?[]:[...new Set(list.map(x=>x.Kelas))].sort();S.bulk={mod:mod,list:list,guru:guru};
  openModal('Isi Massal — '+S.crud.title,`<div class="row g-2 mb-2"><div class="col-6"><label class="form-label small fw-semibold">Tanggal</label><input type="date" id="bkT" class="form-control" value="${tglIni()}"></div>
   <div class="col-6"><label class="form-label small fw-semibold">${lab}</label><input id="bkN" class="form-control" list="bkL" required><datalist id="bkL">${opts.map(o=>`<option value="${esc(o)}">`).join('')}</datalist></div>
   ${guru?'':`<div class="col-6"><label class="form-label small fw-semibold">Kelas</label><select id="bkK" class="form-select"><option value="">Semua kelas</option>${kl.map(k=>`<option>${esc(k)}</option>`).join('')}</select></div>`}
   <div class="col-6"><label class="form-label small fw-semibold">Status awal</label><select id="bkS" class="form-select">${(guru?['Hadir','Izin','Sakit','Tanpa Keterangan']:['Hadir','Izin','Sakit','Alpa']).map(s=>`<option>${s}</option>`).join('')}</select></div></div>
   <div id="bkList" style="max-height:44vh;overflow:auto"></div>`,'<button class="btn btn-light" data-bs-dismiss="modal">Batal</button><button class="btn btn-pri" id="bkGo">Simpan Semua</button>','modal-lg');
  const draw=()=>{const k=guru?'':$('bkK').value,st=$('bkS').value,L=list.filter(x=>!k||x.Kelas===k);
    $('bkList').innerHTML='<table class="table table-sm"><tbody>'+L.map(x=>`<tr data-k="${esc(x.k)}"><td>${esc(x.Nama)}<div class="small text-secondary">${esc(guru?x.Jabatan:x.Kelas+' · '+x.NISN)}</div></td><td style="width:150px"><select class="form-select form-select-sm bs">${(guru?['Hadir','Izin','Sakit','Tanpa Keterangan']:['Hadir','Izin','Sakit','Alpa']).map(s=>`<option ${s===st?'selected':''}>${s}</option>`).join('')}</select></td></tr>`).join('')+'</tbody></table>'};
  if(!guru)$('bkK').onchange=draw;$('bkS').onchange=draw;draw();
  $('bkGo').onclick=async()=>{
    const nm=$('bkN').value.trim();if(!nm)return toast('Lengkapi','Isi nama '+lab.toLowerCase()+'.','warning');
    const rows=[...document.querySelectorAll('#bkList tr')].map(tr=>{const x=list.find(y=>y.k===tr.dataset.k),st=tr.querySelector('.bs').value;
      return guru?{Tanggal:$('bkT').value,Rapat:nm,Nama:x.Nama,Jabatan:x.Jabatan,Status:st}:{Tanggal:$('bkT').value,[mod==='hadireskul'?'Eskul':'Kegiatan']:nm,NISN:x.NISN,Status:st}});
    if(!rows.length)return toast('Kosong','Tidak ada baris.','warning');
    $('bkGo').disabled=true;try{const r=await api('importData',mod,rows);closeModal();toast('Berhasil',r.berhasil+' catatan tersimpan.','success');renderCrud(mod)}catch(e){fail(e);$('bkGo').disabled=false}
  };
}

// ── Nilai: cetak rapor / leger ──
TBX.nilai=()=>'<button class="btn btn-outline-success" onclick="raporUI()"><i class="bi bi-printer"></i> Cetak Rapor</button>';
TBX.nilai.always=true;
function raporUI(){
  const c=S.crud,sw=[...new Map(c.rows.map(r=>[r.NISN,r.Nama])).entries()].sort((a,b)=>String(a[1]).localeCompare(b[1]));
  if(!sw.length)return toast('Kosong','Belum ada data nilai.','warning');
  openModal('Cetak Rapor (Kurikulum Merdeka)',`<div class="row g-2"><div class="col-8"><label class="form-label small fw-semibold">Siswa</label><select id="rpS" class="form-select">${sw.map(x=>`<option value="${esc(x[0])}">${esc(x[1])}</option>`).join('')}</select></div><div class="col-4"><label class="form-label small fw-semibold">Semester</label><select id="rpM" class="form-select"><option>Ganjil</option><option>Genap</option></select></div></div>`,'<button class="btn btn-light" data-bs-dismiss="modal">Batal</button><button class="btn btn-pri" onclick="raporCetak()">Cetak</button>');
}
function raporCetak(){
  const c=S.crud,n=$('rpS').value,sm=$('rpM').value,rs=c.rows.filter(r=>r.NISN===n&&r.Semester===sm);
  if(!rs.length)return toast('Kosong','Tidak ada nilai untuk pilihan ini.','warning');
  const s=rs[0],rata=rs.filter(r=>r.NilaiAkhir!=='').map(r=>+r.NilaiAkhir),avg=rata.length?(rata.reduce((a,b)=>a+b,0)/rata.length).toFixed(1):'-';
  closeModal();
  cetak(`<div style="font-family:Arial;font-size:12px">${kop()}<h3 style="text-align:center;margin:0">LAPORAN HASIL BELAJAR (RAPOR)</h3><p style="text-align:center;margin:2px 0 10px">Semester ${esc(sm)} · Tahun Ajaran ${esc(S.ta||'')}</p>
  <table style="width:100%;margin-bottom:8px"><tr><td style="width:90px">Nama</td><td>: ${esc(s.Nama)}</td><td style="width:90px">Kelas</td><td>: ${esc(s.Kelas)}</td></tr><tr><td>NISN</td><td>: ${esc(s.NISN)}</td><td>Rata-rata</td><td>: ${avg}</td></tr></table>
  <table border="1" cellpadding="5" style="border-collapse:collapse;width:100%"><thead><tr style="background:#eee"><th>No</th><th>Mata Pelajaran</th><th>Nilai Akhir</th><th>Capaian Kompetensi</th></tr></thead><tbody>${rs.map((r,i)=>`<tr><td align="center">${i+1}</td><td>${esc(r.Mapel)}</td><td align="center"><b>${esc(r.NilaiAkhir)}</b></td><td>${esc(r.Capaian)}</td></tr>`).join('')}</tbody></table>
  <div style="display:flex;justify-content:space-between;margin-top:40px"><div>Orang Tua/Wali<br><br><br>(.................)</div><div style="text-align:right">Wali Kelas<br><br><br>(.................)</div></div>
  <div style="text-align:center;margin-top:24px">Kepala Sekolah<br><br><br><u>${esc((S.cfg&&S.cfg.kepsekNama)||'.................')}</u></div></div>`);
}
// ── Bank soal: cetak lembar soal ──
TBX.banksoal=()=>'<button class="btn btn-outline-success" onclick="soalUI()"><i class="bi bi-printer"></i> Cetak Lembar Soal</button>';
function soalUI(){
  const c=S.crud,mp=[...new Set(c.rows.map(r=>r.Mapel))].sort();if(!mp.length)return toast('Kosong','Bank soal masih kosong.','warning');
  openModal('Cetak Lembar Soal',`<div class="row g-2"><div class="col-6"><label class="form-label small fw-semibold">Mata pelajaran</label><select id="soM" class="form-select">${mp.map(m=>`<option>${esc(m)}</option>`).join('')}</select></div><div class="col-3"><label class="form-label small fw-semibold">Jumlah</label><input id="soN" type="number" min="1" value="10" class="form-control"></div><div class="col-3"><label class="form-label small fw-semibold">Level</label><select id="soL" class="form-select"><option value="">Semua</option><option>Mudah</option><option>Sedang</option><option>Sulit</option><option>HOTS</option></select></div></div><div class="form-check mt-2"><input class="form-check-input" type="checkbox" id="soK" checked><label class="form-check-label" for="soK">Sertakan kunci jawaban (halaman terpisah)</label></div>`,'<button class="btn btn-light" data-bs-dismiss="modal">Batal</button><button class="btn btn-pri" onclick="soalCetak()">Cetak</button>');
}
function soalCetak(){
  const c=S.crud,m=$('soM').value,lv=$('soL').value,n=+$('soN').value||10,kunci=$('soK').checked;
  const q=c.rows.filter(r=>r.Mapel===m&&(!lv||r.Level===lv)).sort(()=>Math.random()-.5).slice(0,n);if(!q.length)return toast('Kosong','Tidak ada soal sesuai pilihan.','warning');
  closeModal();
  const so=q.map((r,i)=>`<div style="margin-bottom:10px"><b>${i+1}.</b> ${esc(r.Soal)}${r.Tipe==='Pilihan Ganda'?'<div style="margin-left:18px">'+['A','B','C','D'].filter(k=>r[k]).map(k=>k+'. '+esc(r[k])).join('<br>')+'</div>':r.Tipe==='Benar/Salah'?'<div style="margin-left:18px">( ) Benar &nbsp; ( ) Salah</div>':'<div style="margin-top:22px;border-bottom:1px dotted #000"></div>'}</div>`).join('');
  cetak(`<div style="font-family:Arial;font-size:13px">${kop()}<h3 style="text-align:center;margin:0 0 6px">LEMBAR SOAL — ${esc(m)}</h3><table style="width:100%;margin-bottom:10px"><tr><td>Nama: ..............................</td><td>Kelas: ........</td><td>Tanggal: ............</td></tr></table>${so}</div>`+
   (kunci?`<div style="page-break-before:always;font-family:Arial;font-size:13px"><h3>Kunci Jawaban — ${esc(m)}</h3>${q.map((r,i)=>`<div>${i+1}. ${esc(r.Kunci||'-')}${r.Pembahasan?' — <i>'+esc(r.Pembahasan)+'</i>':''}</div>`).join('')}</div>`:''));
}
