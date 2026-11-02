// ============================================================
// APK SEKOLAH MANTAP v4.1 — tambahan fitur (dimuat PALING AKHIR, setelah pages.js)
//  1. Hak akses On/Off per pengguna        6. Presensi manual (daftar nama) + notifikasi WhatsApp
//  2. Infaq Siswa (laporan & saldo)        7. Laporan Kehadiran & Jurnal Mengajar A4 (kop surat + TTD)
//  3. Dana BOS (laporan)                   8. Navigasi cepat (skeleton, prefetch saat hover)
//  4. Kondisi Barang (rekap)               9. Rute #/kenaikan-kelas
//  5. Barang Hibah + Berita Acara (BAST)
// ============================================================

// ── Ikon, label status, dan halaman khusus baru ──
Object.assign(IC,{infaqmasuk:'bi-box-arrow-in-down',infaqkeluar:'bi-box-arrow-up',infaqlap:'bi-file-earmark-bar-graph',bosdana:'bi-bank2',bosambil:'bi-cash-stack',bospengeluaran:'bi-receipt-cutoff',boslap:'bi-clipboard-data',kondisibarang:'bi-tools',hibah:'bi-gift',kenaikan:'bi-graph-up-arrow',alumni:'bi-mortarboard-fill'});
Object.assign(PILLMAP,{Alumni:'b',Sudah:'g',Dibatalkan:'r','Usul penghapusan':'r'});
Object.assign(PAGE,{infaqlap:'renderInfaqLap',boslap:'renderBosLap',kenaikan:'renderHalamanKenaikanKelas'});

// ── Utilitas ──
const HARI=['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
function terbilang(n){ // angka → kata (Bahasa Indonesia)
  n=Math.floor(Math.abs(+n||0));const s=['','satu','dua','tiga','empat','lima','enam','tujuh','delapan','sembilan','sepuluh','sebelas'];
  const f=x=>{
    if(x<12)return s[x];if(x<20)return f(x-10)+' belas';
    if(x<100)return f(Math.floor(x/10))+' puluh'+(x%10?' '+f(x%10):'');
    if(x<200)return 'seratus'+(x>100?' '+f(x-100):'');
    if(x<1000)return f(Math.floor(x/100))+' ratus'+(x%100?' '+f(x%100):'');
    if(x<2000)return 'seribu'+(x>1000?' '+f(x-1000):'');
    if(x<1e6)return f(Math.floor(x/1e3))+' ribu'+(x%1e3?' '+f(x%1e3):'');
    if(x<1e9)return f(Math.floor(x/1e6))+' juta'+(x%1e6?' '+f(x%1e6):'');
    if(x<1e12)return f(Math.floor(x/1e9))+' miliar'+(x%1e9?' '+f(x%1e9):'');
    return String(x)};
  return n===0?'nol':f(n).trim();
}
const kapital=t=>String(t).replace(/(^|\s)(\S)/g,(m,a,b)=>a+b.toUpperCase());
function tglPanjang(iso){const m=/^(\d{4})-(\d{2})-(\d{2})/.exec(iso||'');if(!m)return '';return (+m[3])+' '+BLN[+m[2]-1]+' '+m[1]}
function dlB64(r,tipe){const b=atob(r.b64),u=new Uint8Array(b.length);for(let j=0;j<b.length;j++)u[j]=b.charCodeAt(j);dlBlob(r.nama,new Blob([u],{type:tipe||'application/octet-stream'}))}
const kpiH=(l,v,s,c,col)=>`<div class="${col||'col-6 col-lg-3'}"><div class="kpi" style="--c:${c}"><div class="kpi-l">${l}</div><div class="kpi-v" style="font-size:1.3rem">${v}</div><div class="kpi-s">${s||''}</div></div></div>`;
const chartGelap=()=>{if(window.Chart)Chart.defaults.color=document.documentElement.getAttribute('data-theme')==='dark'?'#9FB0CC':'#475569'};
const hapusChart=()=>{Object.values(S.charts).forEach(c=>{try{c.destroy()}catch(e){}});S.charts={}};

// ============================================================
// KERTAS A4 POTRET: kop surat, tabel, tanda tangan  (dipakai laporan, BAST, laporan Infaq/BOS)
// ============================================================
const A4F="font-family:'Times New Roman',Times,serif;font-size:11.5pt;line-height:1.45;color:#000";
function kopCfg(){ // data kop dari pengaturan sekolah (bila tidak ada, pakai bawaan)
  const c=S.cfg||{},pk=(v,d)=>(v===undefined||v==='')?d:v;
  return{nama:c.schoolName||'SD Negeri',alamat:c.alamat||'',nss:c.nss||'',npsn:c.npsn||'',telp:c.telepon||'',email:c.email||'',web:c.website||'',kepsek:c.kepsekNama||'',kepsekNip:c.kepsekNip||'',atas1:pk(c.kopAtas1,'PEMERINTAH KOTA TARAKAN'),atas2:pk(c.kopAtas2,'DINAS PENDIDIKAN'),logo:c.logoUrl||''};
}
function kopA4(k){
  const lg=thumb(k.logo),idl=[k.nss?'NSS: '+esc(k.nss):'',k.npsn?'NPSN: '+esc(k.npsn):''].filter(Boolean).join('&nbsp;&nbsp;&nbsp;'),kon=[k.telp?'Telp. '+esc(k.telp):'',k.email?'Email: '+esc(k.email):'',k.web?esc(k.web):''].filter(Boolean).join(' &nbsp;|&nbsp; ');
  return `<table style="width:100%;border-collapse:collapse;${A4F}"><tr><td style="width:22mm;vertical-align:middle">${lg?'<img alt="" src="'+lg+'" style="width:20mm;height:20mm;object-fit:contain">':''}</td>
   <td style="text-align:center;vertical-align:middle;line-height:1.25">${k.atas1?'<div style="font-size:12pt;font-weight:bold">'+esc(k.atas1)+'</div>':''}${k.atas2?'<div style="font-size:12pt;font-weight:bold">'+esc(k.atas2)+'</div>':''}<div style="font-size:16pt;font-weight:bold">${esc(String(k.nama).toUpperCase())}</div>${k.alamat?'<div style="font-size:9.5pt">'+esc(k.alamat)+'</div>':''}${idl?'<div style="font-size:9.5pt">'+idl+'</div>':''}${kon?'<div style="font-size:9pt">'+kon+'</div>':''}</td><td style="width:22mm"></td></tr></table><div style="border-top:3px double #000;margin:3px 0 10px"></div>`;
}
function ttdA4(t){ // t = {tempat,tanggal,kiri:{atas?,jabatan,nama,nip},kanan:{...}}  — KIRI: tempat & tanggal tepat di atas jabatan; KANAN: "Mengetahui," di atas Kepala Sekolah
  const tk=(t.tempat||'Tarakan')+', '+(t.tanggal||tglPanjang(tglIni())),ki=Object.assign({},t.kiri),ka=Object.assign({},t.kanan),te=t.tengah?Object.assign({},t.tengah):null;
  if(ki.atas===undefined)ki.atas=tk;if(ka.atas===undefined)ka.atas=te?'':'Mengetahui,';if(te&&te.atas===undefined)te.atas='';
  const w=te?'33.33%':'50%',blk=x=>`<td style="width:${w};text-align:center;vertical-align:top;padding:0 6px"><div style="min-height:1.3em">${x.atas?esc(x.atas):'&nbsp;'}</div><div>${esc(x.jabatan||'')}${x.jabatan?',':''}</div><div style="height:22mm"></div><div style="font-weight:bold;text-decoration:underline">${esc(x.nama||'(............................................)')}</div>${x.nip===null?'':'<div>NIP. '+esc(x.nip||'.........................')+'</div>'}</td>`;
  return `<table style="width:100%;margin-top:14px;border-collapse:collapse;page-break-inside:avoid;${A4F}"><tr>${blk(ki)}${te?blk(te):''}${blk(ka)}</tr></table>`;
}
function tabelA4(hdr,rows,o){
  o=o||{};const w=o.widths||[],sum=w.reduce((a,b)=>a+b,0)||1,fs=(o.fontSize||9.5)+'pt',ctr=o.center||[],rgt=o.right||[];
  const td=(x,j,tag)=>`<${tag} style="border:1px solid #000;padding:2px 4px;text-align:${tag==='th'?'center':rgt.indexOf(j)>=0?'right':ctr.indexOf(j)>=0?'center':'left'};vertical-align:top">${esc(x)}</${tag}>`;
  return `<table style="width:100%;border-collapse:collapse;font-size:${fs};${A4F};font-size:${fs}">${w.length?'<colgroup>'+w.map(x=>'<col style="width:'+(x*100/sum).toFixed(1)+'%">').join('')+'</colgroup>':''}<thead><tr style="background:#e5e7eb">${hdr.map((h,j)=>td(h,j,'th')).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map((x,j)=>td(x==null?'':x,j,'td')).join('')}</tr>`).join('')||`<tr><td colspan="${hdr.length}" style="border:1px solid #000;padding:6px;text-align:center">(tidak ada data pada periode ini)</td></tr>`}${o.total?`<tr style="font-weight:bold;background:#f3f4f6">${o.total.map((x,j)=>td(x,j,'td')).join('')}</tr>`:''}</tbody></table>`;
}
function infoA4(info){return `<table style="border-collapse:collapse;margin:4px 0 8px;${A4F};font-size:10.5pt">${info.map(x=>`<tr><td style="width:34mm;padding:0 2px">${esc(x[0])}</td><td style="padding:0 2px">: ${esc(x[1])}</td></tr>`).join('')}</table>`}
function renderSpecA4(sp){ // spesifikasi laporan dari server → HTML kertas A4
  return `<div style="${A4F}">${kopA4(sp.kop)}<div style="text-align:center;font-weight:bold;font-size:13pt;text-decoration:underline">${esc(sp.judul)}</div>${sp.subjudul?'<div style="text-align:center;margin-bottom:6px">'+esc(sp.subjudul)+'</div>':''}${infoA4(sp.info)}${tabelA4(sp.hdr,sp.rows,{widths:sp.widths,center:sp.center,fontSize:sp.fontSize,total:sp.total})}${sp.ringkas?'<div style="text-align:center;font-weight:bold;font-size:10pt;margin:10px 0 3px">'+esc(sp.ringkas.judul)+'</div><div style="width:78%;margin:0 auto">'+tabelA4(sp.ringkas.hdr,sp.ringkas.rows,{widths:[34,11,11,11,11,12],center:[1,2,3,4,5],fontSize:9.5})+'</div>':''}${ttdA4(sp.ttd)}${sp.catatan?'<div style="margin-top:10px;font-size:7.5pt;font-style:italic">'+esc(sp.catatan)+'</div>':''}</div>`;
}
function cetakA4(html){ // cetak ukuran A4 potret dengan margin 14 mm (pilih "Simpan sebagai PDF" untuk berkas PDF)
  const st=document.createElement('style');st.id='a4pg';st.textContent='@page{size:A4 portrait;margin:14mm 14mm 16mm 14mm}';document.head.appendChild(st);
  $('printArea').innerHTML=html;const done=()=>{st.remove();window.removeEventListener('afterprint',done)};window.addEventListener('afterprint',done);setTimeout(()=>window.print(),300);
}

// ============================================================
// 1. HAK AKSES ON / OFF (menu Pengguna & Hak Akses)
// ============================================================
ROWX.users=(r,i)=>`<button class="btn btn-sm btn-light text-primary" title="Atur hak akses (On/Off)" aria-label="Atur hak akses" onclick="hakUI(${i})"><i class="bi bi-toggles"></i></button> `;
CRX.users=(c,el)=>{el.innerHTML=`<div class="alert alert-info small mb-0"><b>Cara kerja hak akses.</b> Semua pengguna dapat <b>melihat</b> semua fitur. Tombol <i class="bi bi-toggles"></i> pada tiap baris mengatur fitur mana yang boleh <b>ditambah / diubah / dihapus</b> oleh pengguna itu: <b>On</b> = boleh, <b>Off</b> = hanya melihat. Game Edukatif dan Alat Pembelajaran bebas dipakai semua pengguna. Guru Kelas tetap hanya mengelola data kelasnya sendiri. Akun <b>demo</b> selalu hanya-lihat.</div>`};
async function hakUI(i){
  const r=S.crud.rows[i];let d;
  try{d=await net('getHakAkses',r.Username)}catch(e){return fail(e)}
  const kunci=!!d.kunci,on=new Set(d.izin),std=new Set(d.standar),grp=[];
  d.fitur.forEach(f=>{let g=grp.find(x=>x.n===f.g);if(!g){g={n:f.g,items:[]};grp.push(g)}g.items.push(f)});
  S.hak={u:d.username,on:on,fitur:d.fitur,locked:kunci};
  const item=f=>`<div class="form-check form-switch py-1 hk-i" data-t="${esc((f.label+' '+f.g).toLowerCase())}"><input class="form-check-input hk-c" type="checkbox" role="switch" id="hk_${esc(f.id)}" data-id="${esc(f.id)}" ${on.has(f.id)?'checked':''} ${kunci?'disabled':''}><label class="form-check-label" for="hk_${esc(f.id)}">${esc(f.label)}${std.has(f.id)?' <span class="badge text-bg-light border">standar</span>':''}</label></div>`;
  openModal('Hak Akses: '+r.Nama,`<div class="small text-secondary mb-2">${esc(d.role)} · ${esc(d.username)} ${d.custom?'· <span class="badge text-bg-warning">diatur khusus</span>':'· memakai standar peran'}</div>
   ${kunci?'<div class="alert alert-secondary small">'+esc(d.kunci)+'</div>':'<div class="alert alert-light border small mb-2"><b>On</b> = boleh menambah, mengubah, dan menghapus data pada fitur itu. <b>Off</b> = hanya melihat. Lencana “standar” menandai fitur yang aktif secara bawaan untuk peran ini.</div>'}
   <div class="d-flex flex-wrap gap-2 mb-2 align-items-center"><input id="hkQ" class="form-control form-control-sm w-auto flex-grow-1" placeholder="Cari fitur…" aria-label="Cari fitur" oninput="hakCari(this.value)">${kunci?'':'<button class="btn btn-sm btn-outline-success" onclick="hakSemua(true)">Semua On</button><button class="btn btn-sm btn-outline-secondary" onclick="hakSemua(false)">Semua Off</button><button class="btn btn-sm btn-outline-primary" onclick="hakStandar()">Standar peran</button>'}<span class="pill bg-body-secondary" id="hkN"></span></div>
   <div style="max-height:52vh;overflow:auto" id="hkL">${grp.map(g=>`<div class="hk-g mb-2"><div class="fw-bold small text-primary border-bottom pb-1 mb-1">${esc(g.n)}</div>${g.items.map(item).join('')}</div>`).join('')}</div>`,
   `<button class="btn btn-light" data-bs-dismiss="modal">${kunci?'Tutup':'Batal'}</button>${kunci?'':'<button class="btn btn-outline-danger" onclick="hakReset()">Kembalikan ke standar</button><button class="btn btn-pri" id="hkSv" onclick="hakSimpan()">Simpan</button>'}`,'modal-lg');
  document.querySelectorAll('.hk-c').forEach(x=>x.onchange=hakHitung);hakHitung();
}
function hakHitung(){const n=document.querySelectorAll('.hk-c:checked').length,t=document.querySelectorAll('.hk-c').length;const e=$('hkN');if(e)e.textContent=n+' dari '+t+' fitur On'}
function hakCari(q){q=q.trim().toLowerCase();document.querySelectorAll('.hk-i').forEach(e=>e.style.display=!q||e.dataset.t.includes(q)?'':'none');document.querySelectorAll('.hk-g').forEach(g=>g.style.display=[...g.querySelectorAll('.hk-i')].some(e=>e.style.display!=='none')?'':'none')}
function hakSemua(v){document.querySelectorAll('.hk-i').forEach(e=>{if(e.style.display!=='none')e.querySelector('.hk-c').checked=v});hakHitung()}
async function hakStandar(){try{const d=await net('getHakAkses',S.hak.u),s=new Set(d.standar);document.querySelectorAll('.hk-c').forEach(x=>x.checked=s.has(x.dataset.id));hakHitung()}catch(e){fail(e)}}
async function hakSimpan(){
  const ids=[...document.querySelectorAll('.hk-c:checked')].map(x=>x.dataset.id),b=$('hkSv');b.disabled=true;
  try{await api('setHakAkses',S.hak.u,ids,false);closeModal();toast('Berhasil','Hak akses disimpan. Berlaku segera.','success')}catch(e){fail(e);b.disabled=false}
}
async function hakReset(){if(!confirm('Kembalikan hak akses pengguna ini ke standar peran?'))return;try{await api('setHakAkses',S.hak.u,[],true);closeModal();toast('Berhasil','Hak akses dikembalikan ke standar peran.','success')}catch(e){fail(e)}}

// ============================================================
// 2. INFAQ SISWA — laporan & saldo (TIDAK masuk Neraca Keuangan)
// ============================================================
async function renderInfaqLap(){
  const d=await api('laporanInfaq');await waitLib('Chart');hapusChart();S.inf=d;
  const L=(a,j)=>`<div class="card-x p-3 h-100"><h2 class="h6">${j}</h2>${a.map(x=>`<div class="d-flex justify-content-between small py-1 border-top"><span>${esc(x[0])}</span><b>${rp(x[1])}</b></div>`).join('')||'<div class="small text-secondary">Belum ada data.</div>'}</div>`;
  $('app-container').innerHTML=`<div class="d-flex flex-wrap gap-2 mb-3 align-items-center"><span class="pill bg-body-secondary">Tahun ajaran ${esc(d.ta)}</span><span class="small text-secondary">Dana infaq dicatat terpisah dan <b>tidak termasuk Neraca Keuangan</b>.</span>
    <div class="ms-auto d-flex flex-wrap gap-2">${S.menu.some(m=>m.id==='infaqmasuk')?'<button class="btn btn-sm btn-outline-success" onclick="navigateTo(\'infaqmasuk\')"><i class="bi bi-plus-circle"></i> Pendapatan</button>':''}${S.menu.some(m=>m.id==='infaqkeluar')?'<button class="btn btn-sm btn-outline-danger" onclick="navigateTo(\'infaqkeluar\')"><i class="bi bi-dash-circle"></i> Pengeluaran</button>':''}<button class="btn btn-sm btn-outline-secondary" onclick="infXls()"><i class="bi bi-file-earmark-excel"></i> Excel</button><button class="btn btn-sm btn-outline-secondary" onclick="infCetak()"><i class="bi bi-printer"></i> Cetak A4</button></div></div>
   <div class="row g-3 mb-3">${kpiH('Pendapatan Infaq',rp(d.totMasuk),'tahun ajaran ini','#10B981')}${kpiH('Pengeluaran Infaq',rp(d.totKeluar),'tahun ajaran ini','#EF4444')}${kpiH('Selisih',rp(d.selisih),d.selisih>=0?'lebih':'kurang','#7C3AED')}${kpiH('Saldo Infaq',rp(d.saldo),'seluruh periode','#06B6D4')}</div>
   <div class="card-x p-3 mb-3"><h2 class="h6">Pendapatan dan pengeluaran per bulan</h2><canvas id="infC" height="110" aria-label="Grafik infaq per bulan" role="img"></canvas></div>
   <div class="row g-3"><div class="col-md-4">${L(d.jenis,'Pendapatan per jenis infaq')}</div><div class="col-md-4">${L(d.kelas,'Pendapatan per kelas')}</div><div class="col-md-4">${L(d.kat,'Pengeluaran per kategori')}</div></div>`;
  chartGelap();S.charts.i=new Chart($('infC'),{type:'bar',data:{labels:d.bulan.map(b=>BLN[+b.slice(5)-1].slice(0,3)+' '+b.slice(2,4)),datasets:[{label:'Pendapatan',data:d.masuk,backgroundColor:'#10B981',borderRadius:4},{label:'Pengeluaran',data:d.keluar,backgroundColor:'#EF4444',borderRadius:4}]},options:{scales:{y:{beginAtZero:true}}}});
}
function infXls(){const d=S.inf;xlsSave('Laporan_Infaq_'+d.ta.replace('/','-')+'.xlsx',[['Ringkasan',[['Tahun ajaran',d.ta],['Pendapatan',d.totMasuk],['Pengeluaran',d.totKeluar],['Selisih',d.selisih],['Saldo infaq (seluruh periode)',d.saldo]]],['Per Bulan',[['Bulan','Pendapatan','Pengeluaran']].concat(d.bulan.map((b,i)=>[b,d.masuk[i],d.keluar[i]]))],['Rincian',[['Kelompok','Uraian','Jumlah']].concat(d.jenis.map(x=>['Jenis infaq',x[0],x[1]]),d.kelas.map(x=>['Kelas',x[0],x[1]]),d.kat.map(x=>['Pengeluaran',x[0],x[1]]))]])}
function infCetak(){
  const d=S.inf,k=kopCfg(),tb=(h,a)=>tabelA4([h,'Jumlah (Rp)'],a.map(x=>[x[0],rp(x[1])]),{widths:[70,30],right:[1],fontSize:10});
  cetakA4(`<div style="${A4F}">${kopA4(k)}<div style="text-align:center;font-weight:bold;font-size:13pt;text-decoration:underline">LAPORAN INFAQ SISWA</div><div style="text-align:center;margin-bottom:8px">Tahun Ajaran ${esc(d.ta)}</div>
   ${infoA4([['Total pendapatan',rp(d.totMasuk)],['Total pengeluaran',rp(d.totKeluar)],['Selisih tahun ajaran',rp(d.selisih)],['Saldo infaq (seluruh periode)',rp(d.saldo)]])}
   <div style="font-weight:bold;margin-top:6px">Rekap per bulan</div>${tabelA4(['Bulan','Pendapatan (Rp)','Pengeluaran (Rp)'],d.bulan.map((b,i)=>[BLN[+b.slice(5)-1]+' '+b.slice(0,4),rp(d.masuk[i]),rp(d.keluar[i])]),{widths:[40,30,30],right:[1,2],fontSize:10,total:['Jumlah',rp(d.totMasuk),rp(d.totKeluar)]})}
   <div style="font-weight:bold;margin-top:8px">Pendapatan per jenis</div>${tb('Jenis infaq',d.jenis)}<div style="font-weight:bold;margin-top:8px">Pengeluaran per kategori</div>${tb('Kategori',d.kat)}
   <div style="font-size:9pt;margin-top:6px"><i>Dana infaq tidak termasuk dalam Neraca Keuangan sekolah.</i></div>${ttdA4({tempat:'Tarakan',tanggal:tglPanjang(tglIni()),kiri:{jabatan:'Bendahara Infaq',nama:'',nip:''},kanan:{jabatan:'Kepala Sekolah',nama:k.kepsek,nip:k.kepsekNip}})}</div>`);
}

// ============================================================
// 3. DANA BOS — laporan: dana awal, penyaluran tahap 1 & 2, pengambilan bertahap, pengeluaran
// ============================================================
async function renderBosLap(){
  const d=await api('laporanBOS',S.bosTh||'');await waitLib('Chart');hapusChart();S.bos=d;S.bosTh=d.tahun;
  const tb=(j,h,rows,rgt)=>`<div class="card-x p-3 mb-3"><h2 class="h6">${j}</h2><div class="table-responsive"><table class="table table-sm"><thead><tr>${h.map(x=>`<th>${x}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map((x,i)=>`<td class="${rgt.indexOf(i)>=0?'text-end':''}">${x}</td>`).join('')}</tr>`).join('')||`<tr><td colspan="${h.length}" class="text-center text-secondary">Belum ada data.</td></tr>`}</tbody></table></div></div>`;
  $('app-container').innerHTML=`<div class="d-flex flex-wrap gap-2 mb-3 align-items-center"><label class="small fw-semibold" for="bosT">Tahun anggaran</label><select id="bosT" class="form-select form-select-sm w-auto" onchange="S.bosTh=this.value;renderBosLap()">${d.tahunList.map(t=>`<option ${t===d.tahun?'selected':''}>${esc(t)}</option>`).join('')}</select><span class="small text-secondary">Dihitung dari menu Dana Awal &amp; Penyaluran, Pengambilan Bertahap, dan Pengeluaran. Tidak masuk Neraca.</span>
    <div class="ms-auto d-flex gap-2"><button class="btn btn-sm btn-outline-secondary" onclick="bosXls()"><i class="bi bi-file-earmark-excel"></i> Excel</button><button class="btn btn-sm btn-outline-secondary" onclick="bosCetak()"><i class="bi bi-printer"></i> Cetak A4</button></div></div>
   <div class="row g-3 mb-3">${kpiH('Dana Awal (SiLPA)',rp(d.awal),'saldo awal tahun','#64748B')}${kpiH('Penyaluran Tahap 1',rp(d.t1),'','#7C3AED')}${kpiH('Penyaluran Tahap 2',rp(d.t2),'','#6366F1')}${kpiH('Total Dana Diterima',rp(d.terima),'awal + tahap 1 + tahap 2','#10B981')}</div>
   <div class="row g-3 mb-3">${kpiH('Diambil dari Rekening',rp(d.ambil),'pengambilan bertahap','#F59E0B')}${kpiH('Dibelanjakan',rp(d.keluar),'serapan '+d.serapan+'%','#EF4444')}${kpiH('Saldo Rekening BOS',rp(d.bank),'diterima − diambil − transfer','#06B6D4')}${kpiH('Kas Tunai BOS',rp(d.kas),'diambil − belanja tunai','#0EA5E9')}</div>
   <div class="card-x p-3 mb-3"><div class="d-flex justify-content-between small mb-1"><span>Serapan anggaran</span><b>${d.serapan}%</b></div><div class="progress" style="height:10px"><div class="progress-bar" style="width:${Math.min(100,d.serapan)}%"></div></div><div class="small text-secondary mt-1">Sisa dana (rekening + kas): <b>${rp(d.sisa)}</b></div></div>
   <div class="card-x p-3 mb-3"><h2 class="h6">Penerimaan dan belanja per bulan</h2><canvas id="bosC" height="110" aria-label="Grafik BOS per bulan" role="img"></canvas></div>
   <div class="row g-3 mb-1"><div class="col-lg-5"><div class="card-x p-3 mb-3 h-100"><h2 class="h6">Belanja per komponen</h2>${d.komponen.map(x=>`<div class="d-flex justify-content-between small py-1 border-top"><span>${esc(x[0])}</span><b>${rp(x[1])}</b></div>`).join('')||'<div class="small text-secondary">Belum ada belanja.</div>'}</div></div>
   <div class="col-lg-7">${tb('Penerimaan dana',['Tanggal','Jenis','No. Bukti','Jumlah'],d.dana.map(r=>[fTgl(r.Tanggal),esc(r.Jenis),esc(r.NoBukti),rp(r.Jumlah)]),[3])}${tb('Pengambilan bertahap',['Tanggal','Tahap','Diambil oleh','Jumlah'],d.ambilList.map(r=>[fTgl(r.Tanggal),esc(r.Tahap),esc(r.Penerima),rp(r.Jumlah)]),[3])}</div></div>
   ${tb('Pengeluaran / belanja',['Tanggal','Komponen','Uraian','Cara bayar','Jumlah'],d.keluarList.map(r=>[fTgl(r.Tanggal),esc(r.Komponen),esc(r.Uraian),esc(r.CaraBayar),rp(r.Jumlah)]),[4])}`;
  chartGelap();S.charts.b=new Chart($('bosC'),{type:'bar',data:{labels:BLN.map(b=>b.slice(0,3)),datasets:[{label:'Penerimaan',data:d.bulanMasuk,backgroundColor:'#10B981',borderRadius:4},{label:'Belanja',data:d.bulanKeluar,backgroundColor:'#EF4444',borderRadius:4}]},options:{scales:{y:{beginAtZero:true}}}});
}
function bosXls(){
  const d=S.bos;xlsSave('Laporan_BOS_'+d.tahun+'.xlsx',[['Ringkasan',[['Tahun anggaran',d.tahun],['Dana awal (SiLPA)',d.awal],['Penyaluran tahap 1',d.t1],['Penyaluran tahap 2',d.t2],['Total diterima',d.terima],['Diambil dari rekening',d.ambil],['Dibelanjakan',d.keluar],['Saldo rekening',d.bank],['Kas tunai',d.kas],['Sisa dana',d.sisa],['Serapan (%)',d.serapan]]],
    ['Penerimaan',[['Tanggal','Jenis','No. Bukti','Jumlah']].concat(d.dana.map(r=>[r.Tanggal,r.Jenis,r.NoBukti,+r.Jumlah||0]))],['Pengambilan',[['Tanggal','Tahap','Diambil oleh','No. Bukti','Jumlah']].concat(d.ambilList.map(r=>[r.Tanggal,r.Tahap,r.Penerima,r.NoBukti,+r.Jumlah||0]))],
    ['Pengeluaran',[['Tanggal','Komponen','Uraian','Cara bayar','Penerima','No. Bukti','Jumlah']].concat(d.keluarList.map(r=>[r.Tanggal,r.Komponen,r.Uraian,r.CaraBayar,r.Penerima,r.NoBukti,+r.Jumlah||0]))]]);
}
function bosCetak(){
  const d=S.bos,k=kopCfg(),T=(j,h,rows,o)=>`<div style="font-weight:bold;margin-top:8px">${j}</div>${tabelA4(h,rows,o)}`;
  cetakA4(`<div style="${A4F}">${kopA4(k)}<div style="text-align:center;font-weight:bold;font-size:13pt;text-decoration:underline">LAPORAN PENGGUNAAN DANA BOS</div><div style="text-align:center;margin-bottom:6px">Tahun Anggaran ${esc(d.tahun)}</div>
   ${infoA4([['Dana awal (SiLPA)',rp(d.awal)],['Penyaluran tahap 1',rp(d.t1)],['Penyaluran tahap 2',rp(d.t2)],['Total dana diterima',rp(d.terima)],['Diambil dari rekening',rp(d.ambil)],['Total belanja',rp(d.keluar)+' ('+d.serapan+'%)'],['Saldo rekening BOS',rp(d.bank)],['Kas tunai BOS',rp(d.kas)]])}
   ${T('A. Penerimaan Dana',['No','Tanggal','Jenis','No. Bukti','Jumlah (Rp)'],d.dana.map((r,i)=>[i+1,fTgl(r.Tanggal),r.Jenis,r.NoBukti,rp(r.Jumlah)]),{widths:[6,16,34,22,22],center:[0],right:[4],fontSize:9.5,total:['','','Jumlah','',rp(d.terima)]})}
   ${T('B. Pengambilan Dana Bertahap',['No','Tanggal','Tahap','Diambil oleh','Jumlah (Rp)'],d.ambilList.map((r,i)=>[i+1,fTgl(r.Tanggal),r.Tahap,r.Penerima,rp(r.Jumlah)]),{widths:[6,16,12,40,26],center:[0,2],right:[4],fontSize:9.5,total:['','','','Jumlah',rp(d.ambil)]})}
   ${T('C. Pengeluaran',['No','Tanggal','Komponen / Uraian','Cara bayar','Jumlah (Rp)'],d.keluarList.map((r,i)=>[i+1,fTgl(r.Tanggal),r.Komponen+' — '+r.Uraian,r.CaraBayar,rp(r.Jumlah)]),{widths:[5,13,42,17,23],center:[0],right:[4],fontSize:9,total:['','','Jumlah','',rp(d.keluar)]})}
   ${ttdA4({tempat:'Tarakan',tanggal:tglPanjang(tglIni()),kiri:{jabatan:'Bendahara BOS',nama:'',nip:''},kanan:{jabatan:'Kepala Sekolah',nama:k.kepsek,nip:k.kepsekNip}})}</div>`);
}

// ============================================================
// 4. KONDISI BARANG — rekap per lokasi
// ============================================================
CRX.kondisibarang=(c,el)=>{
  const by={};let b=0,rr=0,rb=0;
  c.rows.forEach(r=>{const l=r.Lokasi||'(tanpa lokasi)',o=by[l]=by[l]||{b:0,rr:0,rb:0};o.b+=+r.JmlBaik||0;o.rr+=+r.JmlRR||0;o.rb+=+r.JmlRB||0;b+=+r.JmlBaik||0;rr+=+r.JmlRR||0;rb+=+r.JmlRB||0});
  const tot=b+rr+rb,pr=x=>tot?Math.round(x*1000/tot)/10:0;S.kb={by:by,b:b,rr:rr,rb:rb};
  el.innerHTML=`<div class="row g-3">${kpiH('Kondisi Baik',b,pr(b)+'% dari '+tot+' unit','#10B981')}${kpiH('Rusak Ringan',rr,pr(rr)+'%','#F59E0B')}${kpiH('Rusak Berat',rb,pr(rb)+'%','#EF4444')}<div class="col-6 col-lg-3 d-flex align-items-center"><button class="btn btn-outline-secondary w-100" onclick="kbCetak()"><i class="bi bi-printer"></i> Cetak Rekap A4</button></div></div>`;
};
function kbCetak(){
  const x=S.kb,k=kopCfg(),L=Object.keys(x.by).sort(),rows=L.map((l,i)=>{const o=x.by[l];return[i+1,l,o.b,o.rr,o.rb,o.b+o.rr+o.rb]});
  cetakA4(`<div style="${A4F}">${kopA4(k)}<div style="text-align:center;font-weight:bold;font-size:13pt;text-decoration:underline">REKAP KONDISI BARANG</div><div style="text-align:center;margin-bottom:8px">Tahun Ajaran ${esc(S.ta||'')}</div>${tabelA4(['No','Lokasi / Ruang','Baik','Rusak Ringan','Rusak Berat','Jumlah'],rows,{widths:[6,44,12,14,14,10],center:[0,2,3,4,5],fontSize:10,total:['','JUMLAH',x.b,x.rr,x.rb,x.b+x.rr+x.rb]})}${ttdA4({tempat:'Tarakan',tanggal:tglPanjang(tglIni()),kiri:{jabatan:'Pengurus Barang',nama:'',nip:''},kanan:{jabatan:'Kepala Sekolah',nama:k.kepsek,nip:k.kepsekNip}})}</div>`);
}

// ============================================================
// 5. BARANG HIBAH + BERITA ACARA SERAH TERIMA (BAST)
// ============================================================
const nomHibah=s=>{const n=parseFloat(String(s||'').replace(/[^\d,.-]/g,'').replace(/\./g,'').replace(',','.'));return isNaN(n)?0:n};
function hibahItems(txt){return String(txt||'').split(/\r?\n/).map(l=>l.trim()).filter(Boolean).map(l=>{const p=l.split('|').map(x=>x.trim());return{nama:p[0]||'',jml:nomHibah(p[1])||1,satuan:p[2]||'unit',kondisi:p[3]||'Baik',nilai:nomHibah(p[4])}}).filter(x=>x.nama)}
ROWX.hibah=(r,i,c)=>`<button class="btn btn-sm btn-light" title="Cetak Berita Acara Serah Terima" aria-label="Cetak BAST" onclick="bastCetak(${i})"><i class="bi bi-file-earmark-text"></i></button> `+(c.canWrite&&r.Inventaris!=='Sudah'?`<button class="btn btn-sm btn-light text-success" title="Masukkan ke Inventaris" aria-label="Masukkan ke Inventaris" onclick="hibahInv(${i})"><i class="bi bi-box-arrow-in-down"></i></button> `:'');
async function hibahInv(i){
  const r=S.crud.rows[i];if(!confirm('Masukkan semua barang pada '+r.NoBAST+' ke Inventaris Barang? Tindakan ini hanya dapat dilakukan sekali.'))return;
  try{const x=await api('hibahKeInventaris',r.ID);toast('Berhasil',x.n+' barang masuk ke Inventaris.','success');renderCrud('hibah')}catch(e){fail(e)}
}
function bastCetak(i){
  const r=S.crud.rows[i],k=kopCfg(),it=hibahItems(r.Rincian),m=/^(\d{4})-(\d{2})-(\d{2})/.exec(r.Tanggal||'');
  if(!m)return toast('Tanggal kosong','Isi tanggal serah terima dulu.','warning');
  const dt=new Date(+m[1],+m[2]-1,+m[3]),total=it.reduce((a,x)=>a+x.jml*x.nilai,0),pnr=r.Penerima||k.kepsek,P=(x,d)=>esc(x||d);
  const tgl=`${HARI[dt.getDay()]} tanggal ${terbilang(+m[3])} bulan ${BLN[+m[2]-1]} tahun ${terbilang(+m[1])} (${tglPanjang(r.Tanggal)})`;
  const rows=it.map((x,j)=>[j+1,x.nama,x.jml,x.satuan,x.kondisi,x.nilai?rp(x.nilai):'-',x.nilai?rp(x.jml*x.nilai):'-']);
  const para=t=>`<p style="margin:4px 0;text-align:justify">${t}</p>`;
  cetakA4(`<div style="${A4F}">${kopA4(k)}<div style="text-align:center;font-weight:bold;font-size:13pt;text-decoration:underline">BERITA ACARA SERAH TERIMA BARANG HIBAH</div><div style="text-align:center;margin-bottom:10px">Nomor: ${esc(r.NoBAST)}</div>
   ${para('Pada hari ini, <b>'+tgl+'</b>, bertempat di '+esc(k.nama)+(k.alamat?', '+esc(k.alamat):'')+', yang bertanda tangan di bawah ini:')}
   <table style="margin:4px 0 4px 8mm;${A4F}"><tr><td style="width:6mm">1.</td><td style="width:30mm">Nama</td><td>: <b>${P(r.Pemberi)}</b></td></tr><tr><td></td><td>Jabatan/Instansi</td><td>: ${P(r.JabatanPemberi,'-')}</td></tr><tr><td></td><td>Alamat</td><td>: ${P(r.AlamatPemberi,'-')}</td></tr><tr><td colspan="3">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;selanjutnya disebut <b>PIHAK PERTAMA</b> (pemberi hibah).</td></tr></table>
   <table style="margin:4px 0 6px 8mm;${A4F}"><tr><td style="width:6mm">2.</td><td style="width:30mm">Nama</td><td>: <b>${P(pnr,'................................')}</b></td></tr><tr><td></td><td>NIP</td><td>: ${P(r.Penerima&&r.Penerima!==k.kepsek?'':k.kepsekNip,'.........................')}</td></tr><tr><td></td><td>Jabatan</td><td>: Kepala ${esc(k.nama)}</td></tr><tr><td colspan="3">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;selanjutnya disebut <b>PIHAK KEDUA</b> (penerima hibah).</td></tr></table>
   ${para('PIHAK PERTAMA menyerahkan kepada PIHAK KEDUA, dan PIHAK KEDUA menerima dari PIHAK PERTAMA, barang hibah dengan rincian sebagai berikut:')}
   ${tabelA4(['No','Nama Barang','Jml','Satuan','Kondisi','Harga Satuan','Jumlah Nilai'],rows,{widths:[5,31,6,9,11,17,21],center:[0,2,3,4],right:[5,6],fontSize:10,total:['','TOTAL','','','','',rp(total)]})}
   ${total?para('<i>Terbilang: '+esc(kapital(terbilang(total)))+' Rupiah.</i>'):''}
   ${para('Ketentuan: <b>(1)</b> Barang tersebut sejak ditandatanganinya berita acara ini menjadi milik/aset '+esc(k.nama)+' dan dicatat dalam Inventaris Barang sekolah. <b>(2)</b> Barang digunakan '+(r.Peruntukan?'untuk/di <b>'+esc(r.Peruntukan)+'</b> ':'')+'bagi kepentingan pembelajaran dan kegiatan sekolah. <b>(3)</b> Pemeliharaan dan pengamanan barang menjadi tanggung jawab PIHAK KEDUA sejak serah terima.')}
   ${para('Demikian Berita Acara Serah Terima ini dibuat dalam rangkap secukupnya untuk dipergunakan sebagaimana mestinya.')}
   ${ttdA4({tempat:'Tarakan',tanggal:tglPanjang(r.Tanggal),kiri:{jabatan:'PIHAK PERTAMA',atas:'Yang menyerahkan',nama:r.Pemberi||'',nip:null},kanan:{jabatan:'PIHAK KEDUA',atas:'Yang menerima',nama:pnr,nip:(!r.Penerima||r.Penerima===k.kepsek)?k.kepsekNip:''},tengah:r.Saksi?{jabatan:'Saksi',atas:'Mengetahui',nama:r.Saksi,nip:null}:null})}</div>`);
}
// ============================================================
// 6. PRESENSI MANUAL (daftar nama siswa) di halaman Scan + notifikasi WhatsApp
// ============================================================
function waHasil(r){
  const w=r&&r.wa;if(!w)return;const man=(w.manual||[]).filter(m=>/^https:\/\/wa\.me\//.test(m.url));
  if(w.antre)toast('Pesan diproses',w.antre+' pesan WhatsApp/email dikirim di latar belakang (tidak menahan Anda).','info');
  if(!man.length&&!w.terkirim&&!w.gagal&&!w.tanpaNomor)return;
  let h='';
  if(w.terkirim)h+=`<div class="alert alert-success py-2 small"><i class="bi bi-whatsapp"></i> <b>${w.terkirim}</b> pesan WhatsApp terkirim otomatis ke orang tua.</div>`;
  if(w.gagal)h+=`<div class="alert alert-warning py-2 small">${w.gagal} pesan gagal dikirim lewat gateway${man.length?' — gunakan tautan di bawah.':'.'}</div>`;
  if(w.tanpaNomor)h+=`<div class="alert alert-secondary py-2 small">${w.tanpaNomor} siswa tidak punya nomor WhatsApp yang valid. Lengkapi pada Data Siswa (kolom WhatsApp, mis. 0812…).</div>`;
  if(man.length)h+=`<p class="small mb-2">Ketuk tombol untuk membuka WhatsApp dengan pesan yang sudah siap, lalu tekan kirim:</p>`+man.map(m=>`<div class="d-flex align-items-center gap-2 py-2 border-top"><span class="me-auto">${esc(m.nama)}</span><a class="btn btn-sm btn-success" target="_blank" rel="noopener" href="${esc(m.url)}"><i class="bi bi-whatsapp"></i> Kirim</a></div>`).join('');
  openModal('Pemberitahuan WhatsApp Orang Tua',h);
}
saveAbs=async function(){
  const d=S.absD,b=$('bAbs');b.disabled=true;b.innerHTML='<span class="spinner-border spinner-border-sm"></span> Menyimpan…';
  try{
    const r=await api('saveAbsensi',d.kelas,d.tgl,d.siswa.filter(s=>S.abs[s.NISN]).map(s=>({nisn:s.NISN,status:S.abs[s.NISN]})),d.sesi);
    toast('Tersimpan',r.tersimpan+' perubahan disimpan'+(r.email?', '+r.email+' email orang tua dikirim di latar belakang':'')+'.','success');renderAbs(d.kelas,d.tgl,d.sesi);waHasil(r);
  }catch(e){fail(e);b.disabled=false;b.innerHTML='<i class="bi bi-cloud-upload"></i> Simpan'}
};
const _renderScan=renderScan;
renderScan=function(){_renderScan();mnInit()};
function mnInit(){
  const c=$('app-container');if(!c||!scanSesi())return;
  c.insertAdjacentHTML('beforeend','<div class="card-x p-3 mt-3" id="mnBox"><div class="text-center text-secondary py-3"><span class="spinner-border spinner-border-sm"></span> Memuat daftar siswa…</div></div>');
  const sel=c.querySelector('select[aria-label="Sesi"]');if(sel)sel.addEventListener('change',()=>mnLoad(S.mn&&S.mn.d&&S.mn.d.kelas,$('mnT')&&$('mnT').value));
  mnLoad();
}
async function mnLoad(kelas,tgl){
  const box=$('mnBox');if(!box)return;
  try{const d=await net('getAbsensi',kelas||'',tgl||'',scanSesi());S.mn={d:d,abs:{}};d.siswa.forEach(s=>S.mn.abs[s.NISN]=s.Status);mnDraw()}
  catch(e){box.innerHTML='<h2 class="h6"><i class="bi bi-list-check"></i> Presensi Manual</h2><div class="small text-secondary">'+esc(e.message)+'</div>'}
}
function mnDraw(){
  const box=$('mnBox');if(!box||!S.mn)return;const d=S.mn.d,c={Hadir:0,Izin:0,Sakit:0,Alpa:0,Belum:0};d.siswa.forEach(s=>{const v=S.mn.abs[s.NISN];v?c[v]++:c.Belum++});
  box.innerHTML=`<div class="d-flex flex-wrap gap-2 align-items-end mb-2"><h2 class="h6 m-0 me-auto"><i class="bi bi-list-check"></i> Presensi Manual — Daftar Nama Siswa <span class="pill bg-body-secondary">${d.sesi==='Kelas'?'Kelas (harian)':esc(d.sesi)+' (mandiri)'}</span></h2>
    <div><label class="form-label small fw-semibold mb-0" for="mnK">Kelas</label><select id="mnK" class="form-select form-select-sm" onchange="mnLoad(this.value,$('mnT').value)">${d.kelasList.map(k=>`<option ${k===d.kelas?'selected':''}>${esc(k)}</option>`).join('')}</select></div>
    <div><label class="form-label small fw-semibold mb-0" for="mnT">Tanggal</label><input id="mnT" type="date" class="form-control form-control-sm" value="${esc(d.tgl)}" onchange="mnLoad($('mnK').value,this.value)"></div>
    ${d.canEdit?'<button class="btn btn-sm btn-outline-success" onclick="mnSemua()"><i class="bi bi-check2-all"></i> Semua Hadir</button><button class="btn btn-sm btn-pri" id="mnSv" onclick="mnSimpan()"><i class="bi bi-cloud-upload"></i> Simpan</button>':''}</div>
    <div class="d-flex flex-wrap gap-2 mb-2">${Object.keys(ST).map(k=>`<span class="pill" style="background:${ST[k][0]};color:${ST[k][1]}">${k} ${c[k]}</span>`).join('')}<span class="pill bg-body-secondary">Belum ${c.Belum}</span>${d.wa?'<span class="pill" style="background:#ECFDF5;color:#065F46"><i class="bi bi-whatsapp"></i> WA orang tua aktif</span>':''}</div>
    ${d.canEdit?'':'<div class="alert alert-secondary small py-2">Anda hanya dapat melihat daftar ini (hak akses presensi Off / akun demo).</div>'}
    <div style="max-height:60vh;overflow:auto">${d.siswa.map((s,i)=>`<div class="d-flex flex-wrap align-items-center gap-2 py-2 border-top"><div class="avatar">${esc((s.Nama||'?').split(' ').map(w=>w[0]).slice(0,2).join(''))}</div><div class="me-auto"><div class="fw-bold">${i+1}. ${esc(s.Nama)}</div><div class="small text-secondary">NISN ${esc(s.NISN)}${s.Metode?' · '+esc(s.Metode)+' '+esc(s.Jam):''}</div></div>
      ${d.canEdit?'<div class="chips">'+Object.keys(ST).map(k=>`<button class="chip ${S.mn.abs[s.NISN]===k?'on':''}" style="--bg:${ST[k][0]};--fg:${ST[k][1]};--on:${ST[k][2]}" onclick="mnSet(${i},'${k}')">${k}</button>`).join('')+'</div>':`<span class="pill bg-body-secondary">${esc(S.mn.abs[s.NISN]||'-')}</span>`}</div>`).join('')||'<div class="text-center text-secondary py-4">Belum ada siswa di kelas ini.</div>'}</div>`;
}
const mnSet=(i,k)=>{S.mn.abs[S.mn.d.siswa[i].NISN]=k;const y=$('mnBox').querySelector('div[style*="overflow:auto"]').scrollTop;mnDraw();$('mnBox').querySelector('div[style*="overflow:auto"]').scrollTop=y};
const mnSemua=()=>{S.mn.d.siswa.forEach(s=>{if(!S.mn.abs[s.NISN])S.mn.abs[s.NISN]='Hadir'});mnDraw()};
async function mnSimpan(){
  const d=S.mn.d,b=$('mnSv');b.disabled=true;b.innerHTML='<span class="spinner-border spinner-border-sm"></span> Menyimpan…';
  try{
    const r=await api('saveAbsensi',d.kelas,d.tgl,d.siswa.filter(s=>S.mn.abs[s.NISN]).map(s=>({nisn:s.NISN,status:S.mn.abs[s.NISN]})),d.sesi);
    toast('Tersimpan',r.tersimpan+' perubahan disimpan'+(r.email?', '+r.email+' email orang tua dikirim di latar belakang':'')+'.','success');await mnLoad(d.kelas,d.tgl);waHasil(r);
  }catch(e){fail(e);b.disabled=false;b.innerHTML='<i class="bi bi-cloud-upload"></i> Simpan'}
}

// ============================================================
// 7. LAPORAN BULANAN A4 POTRET (Kehadiran & Jurnal Mengajar) — kop surat + TTD Wali Kelas & Kepala Sekolah
// ============================================================
const _renderLap=renderLap;
renderLap=async function(){
  await _renderLap();const c=$('app-container');if(!c||S.cur!=='laporan')return;
  c.insertAdjacentHTML('afterbegin',`<div class="card-x p-3 mb-3 d-flex flex-wrap gap-2 align-items-center"><div class="me-auto"><div class="fw-bold"><i class="bi bi-file-earmark-text"></i> Laporan Bulanan A4 (akhir bulan)</div><div class="small text-secondary">Kop surat, rekap per siswa, dan tanda tangan Wali Kelas &amp; Kepala Sekolah.</div></div><button class="btn btn-pri" onclick="lapA4UI('hadir')"><i class="bi bi-printer"></i> Laporan Kehadiran</button></div>`);
};
CRX.jurnal=(c,el)=>{el.innerHTML=`<div class="card-x p-3 d-flex flex-wrap gap-2 align-items-center"><div class="me-auto"><div class="fw-bold"><i class="bi bi-file-earmark-text"></i> Laporan Jurnal Mengajar Bulanan (A4)</div><div class="small text-secondary">Satu bulan per guru, lengkap kop surat dan tanda tangan Wali Kelas &amp; Kepala Sekolah.</div></div><button class="btn btn-pri" onclick="lapA4UI('jurnal')"><i class="bi bi-printer"></i> Buat Laporan</button></div>`};
async function lapA4UI(kind){
  const hadir=kind==='hadir';let kl=[],sesi=['Kelas'],gurus=[];
  try{const d=await api('getAbsensi','','','');kl=d.kelasList||[];sesi=d.sesiList||sesi}catch(e){if(hadir)return fail(e)}
  if(!hadir&&S.user.Role==='Admin'){try{gurus=(await api('listRows','users')).rows.filter(u=>/Guru/.test(u.Role)&&u.Aktif!=='Tidak')}catch(e){}}
  const lb=(i,t)=>`<label class="form-label small fw-semibold" for="${i}">${t}</label>`;
  S.a4={kind:kind};
  openModal(hadir?'Laporan Kehadiran Siswa — A4':'Laporan Jurnal Mengajar — A4',`<div class="row g-2"><div class="col-6">${lb('a4B','Bulan')}<input id="a4B" type="month" class="form-control" value="${tglIni().slice(0,7)}" placeholder="YYYY-MM"></div>
   <div class="col-6">${lb('a4K','Kelas'+(hadir?'':' (opsional)'))}${kl.length?`<select id="a4K" class="form-select">${hadir?'':'<option value="">Semua kelas</option>'}${kl.map(k=>`<option>${esc(k)}</option>`).join('')}</select>`:`<input id="a4K" class="form-control" placeholder="mis. 4-A">`}</div>
   ${hadir&&sesi.length>1?`<div class="col-12">${lb('a4S','Jenis presensi')}<select id="a4S" class="form-select">${sesi.map(x=>`<option value="${x}">${x==='Kelas'?'Kehadiran harian (Wali Kelas)':'Sesi '+x}</option>`).join('')}</select></div>`:''}
   ${gurus.length?`<div class="col-12">${lb('a4G','Guru')}<select id="a4G" class="form-select"><option value="">Semua guru</option>${gurus.map(g=>`<option value="${esc(g.Username)}">${esc(g.Nama)} (${esc(g.Role)})</option>`).join('')}</select></div>`:''}</div>
   <div class="form-text mt-2">Nama Wali Kelas diambil dari menu Kelas (kolom Wali Kelas); nama dan NIP Kepala Sekolah dari Pengaturan.</div>`,
   `<button class="btn btn-light" data-bs-dismiss="modal">Batal</button><button class="btn btn-outline-secondary" onclick="lapA4Dok('docx')"><i class="bi bi-file-earmark-word"></i> Word</button><button class="btn btn-outline-secondary" onclick="lapA4Dok('pdf')"><i class="bi bi-file-earmark-pdf"></i> PDF</button><button class="btn btn-pri" id="a4Go" onclick="lapA4Cetak()"><i class="bi bi-printer"></i> Cetak / Simpan PDF</button>`);
}
function lapA4Arg(){const v=id=>($(id)||{}).value||'';return{bulan:v('a4B'),kelas:v('a4K'),sesi:v('a4S'),guru:v('a4G')}}
async function lapA4Cetak(){
  const b=$('a4Go');b.disabled=true;
  try{const sp=await net('laporanBulanan',S.a4.kind,lapA4Arg());closeModal();cetakA4(renderSpecA4(sp))}catch(e){fail(e);b.disabled=false}
}
async function lapA4Dok(fmt){
  toast('Menyiapkan '+fmt.toUpperCase(),'Google sedang membuat dokumen A4, mohon tunggu beberapa detik…','primary');
  try{const r=await net('laporanBulananDok',S.a4.kind,lapA4Arg(),fmt);dlB64(r,fmt==='pdf'?'application/pdf':'application/vnd.openxmlformats-officedocument.wordprocessingml.document');toast('Berhasil',r.nama+' diunduh.','success')}catch(e){fail(e)}
}

// ============================================================
// 8. NAVIGASI CEPAT: kerangka (skeleton) seketika, prefetch saat kursor/jari menyentuh menu, rute #/kenaikan-kelas
// ============================================================
function skel(){
  const c=$('app-container');if(!c)return;
  c.innerHTML='<div class="sk" aria-busy="true"><div class="sk-b" style="width:42%;height:26px"></div><div class="row g-3 mb-3"><div class="col-6 col-lg-3"><div class="sk-b" style="height:84px"></div></div><div class="col-6 col-lg-3"><div class="sk-b" style="height:84px"></div></div><div class="col-6 col-lg-3"><div class="sk-b" style="height:84px"></div></div><div class="col-6 col-lg-3"><div class="sk-b" style="height:84px"></div></div></div><div class="sk-b" style="height:240px"></div><span class="spinner-border spinner-border-sm text-secondary" style="position:absolute;opacity:0" aria-hidden="true"></span></div>';
}
const _navigateTo=navigateTo;
navigateTo=function(id){
  if(!S.quiet)skel();
  try{if(id==='kenaikan')history.replaceState(null,'','#/kenaikan-kelas');else if(/^#\/kenaikan/.test(location.hash))history.replaceState(null,'',location.pathname+location.search)}catch(e){}
  return _navigateTo(id);
};
function warm(id){ // hangatkan cache halaman sebelum diklik
  if(!S.token||!id)return;let c=null;
  if(id==='dashboard')c=['getDashboard'];else if(id==='infaqlap')c=['laporanInfaq'];else if(id==='neraca')c=['neracaKeuangan'];else if(id==='perpusdash')c=['getPerpus'];else if(id==='pengaturan'||id==='visimisi')c=['getSettings'];
  else if(!PAGE[id]&&!/^[gt]_/.test(id))c=['listRows',id];
  if(!c)return;const a=c.slice(1),key=c[0]+'|'+JSON.stringify(a);if(CACHE[key]!==undefined||PEND[key]||INF[key])return;
  PEND[key]=net(c[0],...a).finally(()=>{delete PEND[key]});PEND[key].then(r=>{CACHE[key]=JSON.stringify(r);pc()}).catch(()=>{});
}
['mouseover','touchstart'].forEach(ev=>document.addEventListener(ev,e=>{const a=e.target.closest&&e.target.closest('.nl');if(a)warm(a.dataset.id)},{passive:true}));
const _enter=enter;
enter=function(r){_enter(r);if(location.hash==='#/kenaikan-kelas'&&S.menu.some(m=>m.id==='kenaikan'))navigateTo('kenaikan')};
window.addEventListener('hashchange',()=>{if(S.token&&location.hash==='#/kenaikan-kelas'&&S.cur!=='kenaikan'&&S.menu.some(m=>m.id==='kenaikan'))navigateTo('kenaikan')});
