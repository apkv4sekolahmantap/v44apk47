// ============================================================
// KUIS BAIS — duel 2 pemain di 2 HP berbeda (kelas 1–6)
// Status ruangan ada di server (cache), HP berkomunikasi lewat polling adaptif.
// ============================================================
const BAIS={poll:null,tick:null,pid:null,kode:null,kelas:4,v:null,key:'',busy:false,deadline:0,answered:-1,pil:-1};
for(let k=1;k<=6;k++)GM['g_bais'+k]=el=>baisMenu(el,k);
function baisStop(leave){
  clearTimeout(BAIS.poll);clearInterval(BAIS.tick);BAIS.poll=null;BAIS.tick=null;
  if(leave&&BAIS.kode&&BAIS.pid&&S.token){net('baisKeluar',BAIS.kode,BAIS.pid).catch(()=>{})}
  BAIS.kode=null;BAIS.pid=null;BAIS.v=null;BAIS.key='';BAIS.answered=-1;BAIS.pil=-1;
}
function baisMenu(el,k){
  baisStop(true);BAIS.kelas=k;S.cleanup=()=>baisStop(true);
  el.innerHTML=`<div class="bais-hero"><div class="bais-logo">🧠⚔️🧠</div><h2 class="fw-extra mb-1">Kuis Bais</h2><div class="text-secondary mb-2">Duel kuis 2 pemain di 2 HP · <b>Kelas ${k}</b></div></div>
   <div class="row g-3 justify-content-center"><div class="col-lg-5"><div class="card-x p-3 h-100"><h3 class="h6">① Buat ruangan</h3>
     <label class="form-label small fw-semibold" for="bN">Nama panggilanmu</label><input id="bN" class="form-control mb-2" maxlength="20" value="${esc((S.user.Nama||'').split(' ')[0])}">
     <div class="row g-2"><div class="col-7"><label class="form-label small fw-semibold" for="bM">Mata pelajaran</label><select id="bM" class="form-select"><option>Campuran</option><option>Matematika</option><option>IPAS</option><option>Bahasa Indonesia</option><option>PKn</option></select></div>
     <div class="col-5"><label class="form-label small fw-semibold" for="bJ">Jumlah soal</label><select id="bJ" class="form-select"><option>5</option><option selected>10</option><option>15</option><option>20</option></select></div></div>
     <button class="btn btn-pri w-100 mt-3" id="bBuat" onclick="baisBuatRuang()"><i class="bi bi-plus-circle"></i> Buat Ruangan</button><div class="form-text">Soal dibuat otomatis (AI/bank soal) sesuai kelas ${k}.</div></div></div>
    <div class="col-lg-5"><div class="card-x p-3 h-100"><h3 class="h6">② Gabung ke ruangan teman</h3>
     <label class="form-label small fw-semibold" for="bK">Kode ruangan (4 angka)</label><input id="bK" class="form-control form-control-lg text-center mb-2" inputmode="numeric" maxlength="4" placeholder="••••" style="letter-spacing:.4em;font-weight:800">
     <label class="form-label small fw-semibold" for="bN2">Nama panggilanmu</label><input id="bN2" class="form-control" maxlength="20" value="${esc((S.user.Nama||'').split(' ')[0])}">
     <button class="btn btn-success w-100 mt-3" onclick="baisGabungRuang()"><i class="bi bi-box-arrow-in-right"></i> Gabung</button></div></div></div>
   <div class="text-center small text-secondary mt-3">Mainkan bersama teman: satu membuat ruangan, yang lain memasukkan kode di HP-nya.</div>${S.user.Role==='Admin'?'<div class="text-center mt-2"><button class="btn btn-sm btn-outline-secondary" onclick="baisAdminUI()"><i class="bi bi-gear"></i> Atur soal AI (Admin)</button></div>':''}`;
}
async function baisBuatRuang(){
  const b=$('bBuat');b.disabled=true;b.innerHTML='<span class="spinner-border spinner-border-sm"></span> Menyiapkan soal…';
  try{const r=await net('baisBuat',BAIS.kelas,$('bM').value,+$('bJ').value,($('bN').value||'').trim());BAIS.kode=r.view.kode;BAIS.pid=r.pid;baisMasuk(r.view)}
  catch(e){fail(e);b.disabled=false;b.innerHTML='<i class="bi bi-plus-circle"></i> Buat Ruangan'}
}
async function baisGabungRuang(){
  const k=($('bK').value||'').trim();if(!/^\d{4}$/.test(k))return toast('Kode','Masukkan kode 4 angka dari temanmu.','warning');
  try{const r=await net('baisGabung',k,($('bN2').value||'').trim());BAIS.kode=r.view.kode;BAIS.pid=r.pid;baisMasuk(r.view)}catch(e){fail(e)}
}
function baisMasuk(v){BAIS.key='';baisRender(v);baisLoop()}
function baisLoop(){
  clearTimeout(BAIS.poll);if(!BAIS.kode)return;
  const v=BAIS.v,hid=document.hidden;
  let ms=v&&v.status==='main'?(v.sudahSaya?800:1100):v&&v.status==='reveal'?700:1600;if(hid)ms=4000;
  BAIS.poll=setTimeout(baisPoll,ms);
}
async function baisPoll(){
  if(!BAIS.kode||BAIS.busy)return baisLoop();BAIS.busy=true;const t0=performance.now();
  try{const v=await net('baisStatus',BAIS.kode,BAIS.pid);v._rtt=performance.now()-t0;if(!BAIS.kode)return;baisRender(v)}
  catch(e){if(BAIS.kode&&/SESI/.test(e.message||''))baisStop(false)}
  finally{BAIS.busy=false;baisLoop()}
}
function baisBar(v){
  const me=v.players.find(p=>p.saya)||{nama:'Aku',skor:0},op=v.players.find(p=>!p.saya)||{nama:'…',skor:0};
  return `<div class="bais-bar"><div class="bais-pl me"><span class="bais-av">${esc((me.nama||'?')[0]||'?')}</span><div><div class="small fw-bold">${esc(me.nama)} (Kamu)</div><div class="bais-sk">${me.skor}</div></div></div>
   <div class="bais-mid"><div class="small text-secondary">Soal</div><b>${Math.min(v.idx+1,v.n)}/${v.n}</b></div>
   <div class="bais-pl op"><div class="text-end"><div class="small fw-bold">${esc(op.nama)}${op.sudah&&v.status==='main'?' ✔':''}</div><div class="bais-sk">${op.skor}</div></div><span class="bais-av op">${esc((op.nama||'?')[0]||'?')}</span></div></div>`;
}
function baisRender(v){
  BAIS.v=v;const el=$('gbody');if(!el)return;
  if(v.status==='batal'){baisStop(false);toast('Ruangan ditutup','Ruangan sudah selesai/ditutup.','warning');return baisMenu(el,BAIS.kelas)}
  const key=v.status+'-'+v.idx+'-'+v.players.length+(v.status==='reveal'||v.status==='selesai'?'-'+v.players.map(p=>p.skor).join(','):'');
  if(v.status==='main'||v.status==='reveal')BAIS.deadline=performance.now()+v.sisa-(v._rtt||0)/2;
  if(key===BAIS.key){ // tidak ada perubahan layar: perbarui penanda lawan saja
    const op=v.players.find(p=>!p.saya);const w=el.querySelector('#bOp');if(w&&op)w.textContent=op.sudah?'Lawan sudah menjawab ✔':'Lawan sedang berpikir…';return}
  BAIS.key=key;clearInterval(BAIS.tick);
  if(v.status==='tunggu')return baisLobby(el,v);
  if(v.status==='main')return baisSoal(el,v);
  if(v.status==='reveal')return baisReveal(el,v);
  if(v.status==='selesai')return baisAkhir(el,v);
}
function baisLobby(el,v){
  const host=v.players.find(p=>p.saya&&p.host),dua=v.players.length>=2;
  el.innerHTML=`<div class="text-center"><div class="text-secondary">Kode ruangan — Kelas ${v.kelas} · ${esc(v.mapel)} · ${v.n} soal ${v.ai?'· ✨ soal AI':''}</div><div class="bais-kode">${esc(v.kode)}</div><div class="small text-secondary mb-3">Minta temanmu membuka <b>Kuis Bais Kelas ${v.kelas}</b> di HP-nya, lalu masukkan kode ini.</div>
   <div class="d-flex justify-content-center gap-3 mb-3 flex-wrap">${v.players.map(p=>`<div class="bais-chip"><span class="bais-av">${esc((p.nama||'?')[0])}</span><b>${esc(p.nama)}</b>${p.host?'<small>pembuat</small>':''}</div>`).join('')}${dua?'':'<div class="bais-chip wait"><span class="spinner-border spinner-border-sm"></span> menunggu lawan…</div>'}</div>
   ${host?`<button class="btn btn-pri btn-lg" ${dua?'':'disabled'} onclick="baisMulaiMain()"><i class="bi bi-play-fill"></i> Mulai Duel!</button>`:'<div class="text-secondary">Menunggu pembuat ruangan memulai…</div>'}
   <div class="mt-3"><button class="btn btn-sm btn-light" onclick="baisMenu($('gbody'),BAIS.kelas)">Batal / keluar</button></div></div>`;
}
async function baisMulaiMain(){try{const v=await net('baisMulai',BAIS.kode,BAIS.pid);baisRender(v)}catch(e){fail(e)}}
function baisSoal(el,v){
  const lbl='ABCD',warna=['#7C3AED','#0EA5A4','#F59E0B','#EC4899'];
  el.innerHTML=baisBar(v)+`<div class="bais-time"><div id="bT" style="width:100%"></div></div><div class="bais-q">${esc(v.soal.q)}</div>
   <div class="bais-opts">${v.soal.o.map((o,i)=>`<button class="bais-opt" style="--c:${warna[i]}" data-i="${i}" ${v.sudahSaya?'disabled':''}><b>${lbl[i]}</b><span>${esc(o)}</span></button>`).join('')}</div>
   <div class="text-center small text-secondary mt-3" id="bOp">${v.sudahSaya?'Jawabanmu terkirim. Menunggu lawan…':'Pilih jawaban secepat mungkin — makin cepat, makin besar poinnya!'}</div>`;
  const total=v.waktu*1000,bar=$('bT');
  BAIS.tick=setInterval(()=>{const sisa=Math.max(0,BAIS.deadline-performance.now()),p=Math.min(100,sisa*100/total);if(bar){bar.style.width=p+'%';bar.style.background=p<25?'#EF4444':p<50?'#F59E0B':'#10B981'}},100);
  el.querySelectorAll('.bais-opt').forEach(b=>b.onclick=async()=>{
    if(BAIS.answered===v.idx)return;BAIS.answered=v.idx;
    el.querySelectorAll('.bais-opt').forEach(x=>{x.disabled=true;if(x===b)x.classList.add('pick')});$('bOp').textContent='Jawabanmu terkirim. Menunggu lawan…';
    try{const r=await net('baisJawab',BAIS.kode,BAIS.pid,v.idx,+b.dataset.i);if(BAIS.kode)baisRender(r)}catch(e){fail(e)}
  });
}
function baisReveal(el,v){
  const lbl='ABCD',rv=v.reveal,saya=v.players.findIndex(p=>p.saya),h=rv.hasil[saya]||{};
  el.innerHTML=baisBar(v)+`<div class="bais-q">${esc(v.soal.q)}</div><div class="bais-opts">${v.soal.o.map((o,i)=>`<div class="bais-opt show ${i===rv.a?'ok':(i===h.pil?'no':'')}"><b>${lbl[i]}</b><span>${esc(o)}</span>${i===rv.a?'<i class="bi bi-check-circle-fill ms-auto"></i>':i===h.pil?'<i class="bi bi-x-circle-fill ms-auto"></i>':''}</div>`).join('')}</div>
   <div class="bais-res">${rv.hasil.map((x,i)=>`<div class="${x.benar?'ok':'no'}"><b>${esc(x.nama)}</b> ${x.pil<0?'tidak menjawab':x.benar?'benar':'salah'} <span>+${x.poin}</span></div>`).join('')}</div>${rv.e?`<div class="text-center small mt-2 text-secondary">💡 ${esc(rv.e)}</div>`:''}`;
  BAIS.answered=-1;
}
function baisAkhir(el,v){
  const s=v.players.slice().sort((a,b)=>b.skor-a.skor),seri=v.menang==='seri',saya=v.players.find(p=>p.saya),menang=!seri&&saya&&saya.nama===v.menang;
  el.innerHTML=`<div class="text-center py-3"><div style="font-size:4rem">${seri?'🤝':menang?'🏆':'👏'}</div><h2 class="fw-extra">${seri?'Seri!':menang?'Kamu menang!':esc(v.menang)+' menang!'}</h2><div class="d-flex justify-content-center gap-3 my-3 flex-wrap">${s.map((p,i)=>`<div class="bais-chip ${i===0&&!seri?'win':''}"><span class="bais-av">${esc((p.nama||'?')[0])}</span><b>${esc(p.nama)}</b><span class="bais-sk">${p.skor}</span></div>`).join('')}</div>
   <button class="btn btn-pri btn-lg" onclick="baisMenu($('gbody'),BAIS.kelas)"><i class="bi bi-arrow-repeat"></i> Main Lagi</button></div>`;
  baisStop(false);
}

async function baisAdminUI(){
  let st={ai:false};try{st=await net('baisInfo')}catch(e){}
  openModal('Soal AI untuk Kuis Bais (Admin)',`<p class="small text-secondary">Soal duel dibuat otomatis oleh <b>Google Gemini dari sisi server</b>. API key disimpan aman di <i>Script Properties</i> Apps Script, tidak pernah dikirim ke peramban pengguna. Tanpa kunci, game memakai bank soal bawaan (kelas 1–6).</p>
   <div class="mb-2">Status: ${st.ai?'<span class="pill" style="background:#ECFDF5;color:#065F46">AI aktif</span>':'<span class="pill bg-body-secondary">Bank soal bawaan</span>'}</div>
   <label class="form-label small fw-semibold" for="gK">Gemini API key (kosongkan untuk menghapus)</label><input id="gK" type="password" class="form-control" autocomplete="off" placeholder="AIza…"><div class="form-text">Buat kunci di <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">Google AI Studio</a>.</div>`,
   '<button class="btn btn-light" data-bs-dismiss="modal">Tutup</button><button class="btn btn-pri" id="gSv">Simpan</button>');
  $('gSv').onclick=async()=>{try{$('gSv').disabled=true;const r=await net('setGeminiKey',$('gK').value.trim());closeModal();toast('Tersimpan',r.ai?'Soal AI diaktifkan.':'Kunci dihapus; memakai bank soal.','success')}catch(e){fail(e);$('gSv').disabled=false}};
}
