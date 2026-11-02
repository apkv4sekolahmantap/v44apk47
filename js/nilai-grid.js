// ============================================================
// INPUT NILAI MASSAL / INDIVIDU (Kurikulum Merdeka)
// Formatif per BAB -> tiap BAB terdiri dari beberapa TP -> Sumatif Lingkup Materi (LM) = rata-rata TP pada BAB
// -> Sumatif Akhir Semester (SAS) -> Nilai Akhir = rata-rata (rerata LM, SAS)
// ============================================================
const NG={d:null,bab:[4,4,4,4],vals:{},only:'',dirty:false};
const ngNum=v=>{v=String(v==null?'':v).trim().replace(',','.');if(v==='')return null;const x=+v;return isNaN(x)?null:x};
const ngAvg=a=>{const v=a.filter(x=>x!==null);return v.length?Math.round(v.reduce((p,q)=>p+q,0)/v.length*10)/10:null};
function ngHitung(row,bab){ // row={f:[[..]],sas,slm:[]} -> {lm:[..],na}
  const lm=bab.map((n,bi)=>{const a=(row.f[bi]||[]).slice(0,n).map(ngNum);const r=ngAvg(a);if(r!==null)return r;const st=ngNum((row.slm||[])[bi]);return a.some(x=>x!==null)||!row.keepSlm?null:st});
  const rs=ngAvg(lm),sas=ngNum(row.sas);let na=null;
  if(rs!==null&&sas!==null)na=Math.round((rs+sas)/2);else if(rs!==null)na=Math.round(rs);else if(sas!==null)na=Math.round(sas);
  return{lm:lm,na:na};
}
async function renderInputNilai(kelas,mapel,sem){
  const d=await net('nilaiGrid',kelas||NG.kelas||'',mapel!==undefined?mapel:(NG.mapel||''),sem||NG.sem||'');
  NG.d=d;NG.kelas=d.kelas;NG.mapel=d.mapel;NG.sem=d.semester;NG.bab=d.bab.slice();NG.only='';NG.dirty=false;
  NG.vals={};d.siswa.forEach(s=>{NG.vals[s.key]={f:s.f.map(a=>a.map(x=>x===''||x==null?'':String(x))),sas:s.sas===''||s.sas==null?'':String(s.sas),slm:s.slm,keepSlm:!(s.f&&s.f.length)&&s.ada}});
  ngDraw();
}
function ngDraw(){
  const d=NG.d,ro=!d.canWrite;
  $('app-container').innerHTML=`<div class="card-x p-3 mb-3">
   <div class="row g-2 align-items-end">
    <div class="col-6 col-md-2"><label class="form-label small fw-semibold" for="ngK">Kelas</label><select id="ngK" class="form-select" onchange="ngMuat()">${d.kelasList.map(k=>`<option ${k===d.kelas?'selected':''}>${esc(k)}</option>`).join('')||'<option value="">(tidak ada)</option>'}</select></div>
    <div class="col-12 col-md-4"><label class="form-label small fw-semibold" for="ngM">Mata pelajaran</label><input id="ngM" class="form-control" list="ngML" value="${esc(d.mapel)}" placeholder="mis. Matematika" onchange="ngMuat()"><datalist id="ngML">${d.mapelList.map(m=>`<option value="${esc(m)}">`).join('')}</datalist></div>
    <div class="col-6 col-md-2"><label class="form-label small fw-semibold" for="ngS">Semester</label><select id="ngS" class="form-select" onchange="ngMuat()"><option ${d.semester==='Ganjil'?'selected':''}>Ganjil</option><option ${d.semester==='Genap'?'selected':''}>Genap</option></select></div>
    <div class="col-12 col-md-4"><label class="form-label small fw-semibold" for="ngO">Mode input</label><select id="ngO" class="form-select" onchange="ngOnly(this.value)"><option value="">Massal — semua siswa kelas ${esc(d.kelas)}</option>${d.siswa.map(s=>`<option value="${esc(s.key)}" ${NG.only===s.key?'selected':''}>Individu — ${esc(s.Nama)}</option>`).join('')}</select></div>
   </div>
   <div class="d-flex flex-wrap gap-2 align-items-center mt-3"><span class="small fw-semibold">Struktur formatif:</span><label class="small">Jumlah BAB</label><input id="ngNB" type="number" min="1" max="6" class="form-control form-control-sm" style="width:70px" value="${NG.bab.length}" onchange="ngStruktur()">
    <span class="small text-secondary">TP per BAB:</span>${NG.bab.map((n,i)=>`<span class="d-inline-flex align-items-center gap-1"><span class="small">B${i+1}</span><input type="number" min="1" max="10" class="form-control form-control-sm ng-tpn" data-i="${i}" style="width:62px" value="${n}" onchange="ngStruktur()"></span>`).join('')}</div>
   <div class="d-flex flex-wrap gap-2 mt-3 align-items-center">${ro?'<span class="pill bg-body-secondary"><i class="bi bi-eye"></i> Hanya lihat'+(d.tulisKelas.length?' (bukan kelas yang Anda ampu)':' (hak akses input nilai OFF)')+'</span>':'<button class="btn btn-pri" id="ngSv" onclick="ngSimpan()"><i class="bi bi-save"></i> Simpan Nilai</button>'}
    <button class="btn btn-outline-secondary" onclick="ngExcel()"><i class="bi bi-file-earmark-excel"></i> Unduh Excel</button>
    <span class="small text-secondary ms-auto">Nilai 0–100. Tempel (Ctrl+V) dari Excel langsung ke kotak mana pun. Enter / panah bawah = pindah ke siswa berikutnya.</span></div></div>
   <div class="card-x p-0"><div class="ng-wrap" id="ngW"></div></div>
   <div class="small text-secondary mt-2">Sumatif Lingkup Materi (LM) = rata-rata TP pada BAB tersebut. Nilai Akhir = rata-rata dari rerata LM dan Sumatif Akhir Semester (nilai formatif tidak langsung masuk rapor). KKTP & capaian disusun otomatis saat disimpan.</div>`;
  ngTabel();
}
function ngRows(){const d=NG.d;return NG.only?d.siswa.filter(s=>s.key===NG.only):d.siswa}
function ngTabel(){
  const d=NG.d,bab=NG.bab,ro=!d.canWrite,rows=ngRows();
  if(!d.mapel){$('ngW').innerHTML='<div class="p-4 text-center text-secondary">Isi <b>Mata pelajaran</b> terlebih dahulu, lalu daftar siswa kelas ini akan dimuat.</div>';return}
  if(!rows.length){$('ngW').innerHTML='<div class="p-4 text-center text-secondary">Belum ada siswa aktif di kelas ini.</div>';return}
  const nTP=bab.reduce((a,b)=>a+b,0),h1=`<tr><th rowspan="3" class="ng-no">NO</th><th rowspan="3" class="ng-nm">NAMA</th><th colspan="${nTP}">FORMATIF</th><th colspan="${bab.length}" class="ng-lm">SUMATIF LINGKUP MATERI</th><th rowspan="3" class="ng-sas">SUMATIF AKHIR<br>SEMESTER</th><th rowspan="3" class="ng-na">NILAI<br>AKHIR</th></tr>`,
   h2='<tr>'+bab.map((n,i)=>`<th colspan="${n}">BAB ${i+1}</th>`).join('')+bab.map((n,i)=>`<th rowspan="2" class="ng-lm">LM${i+1}</th>`).join('')+'</tr>',
   h3='<tr>'+bab.map((n,i)=>Array.from({length:n},(_,k)=>`<th>${i+1}.${k+1}</th>`).join('')).join('')+'</tr>';
  let nth=0;
  const body=rows.map((s,ri)=>{const v=NG.vals[s.key],c=ngHitung(v,bab);let ci=0;
    return `<tr data-k="${esc(s.key)}"><td class="ng-no">${ri+1}</td><td class="ng-nm">${esc(s.Nama)}</td>`+bab.map((n,bi)=>Array.from({length:n},(_,k)=>`<td><input class="ng-in" ${ro?'disabled':''} inputmode="decimal" autocomplete="off" data-r="${ri}" data-c="${ci++}" data-b="${bi}" data-t="${k}" value="${esc((v.f[bi]||[])[k]||'')}" aria-label="${esc(s.Nama)} TP ${bi+1}.${k+1}"></td>`).join('')).join('')+
     bab.map((n,bi)=>`<td class="ng-lm ng-cl" data-lm="${bi}">${c.lm[bi]===null?'':c.lm[bi]}</td>`).join('')+
     `<td class="ng-sas"><input class="ng-in" ${ro?'disabled':''} inputmode="decimal" autocomplete="off" data-r="${ri}" data-c="${nTP}" data-sas="1" value="${esc(v.sas)}" aria-label="${esc(s.Nama)} Sumatif Akhir"></td><td class="ng-na ng-cl" data-na="1">${c.na===null?'':c.na}</td></tr>`}).join('');
  $('ngW').innerHTML=`<table class="ng"><thead>${h1}${h2}${h3}</thead><tbody>${body}</tbody></table>`;
  $('ngW').querySelectorAll('.ng-in').forEach(inp=>{
    inp.oninput=()=>ngEdit(inp);
    inp.onkeydown=e=>{const r=+inp.dataset.r,c=+inp.dataset.c;let t=null;
      if(e.key==='Enter'||e.key==='ArrowDown'){t=[r+1,c]}else if(e.key==='ArrowUp'){t=[r-1,c]}
      else if(e.key==='ArrowRight'&&inp.selectionStart===inp.value.length){t=[r,c+1]}else if(e.key==='ArrowLeft'&&inp.selectionStart===0){t=[r,c-1]}
      if(t){e.preventDefault();const n=$('ngW').querySelector(`.ng-in[data-r="${t[0]}"][data-c="${t[1]}"]`);if(n){n.focus();n.select()}}};
    inp.onpaste=e=>ngTempel(e,inp);
    inp.onfocus=()=>inp.select();
  });
}
function ngEdit(inp){
  let v=inp.value.replace(/[^0-9.,]/g,'');const x=ngNum(v);inp.classList.toggle('ng-bad',x!==null&&(x<0||x>100));if(v!==inp.value)inp.value=v;
  const tr=inp.closest('tr'),k=tr.dataset.k,row=NG.vals[k];
  if(inp.dataset.sas)row.sas=inp.value;else{const b=+inp.dataset.b,t=+inp.dataset.t;row.f[b]=row.f[b]||[];row.f[b][t]=inp.value}
  NG.dirty=true;const c=ngHitung(row,NG.bab);
  tr.querySelectorAll('[data-lm]').forEach(td=>{const r=c.lm[+td.dataset.lm];td.textContent=r===null?'':r});tr.querySelector('[data-na]').textContent=c.na===null?'':c.na;
}
function ngTempel(e,inp){
  const txt=(e.clipboardData||window.clipboardData).getData('text');if(!/[\t\n]/.test(txt.trim())&&txt.trim().indexOf(' ')<0)return; // tempel satu nilai: biarkan bawaan
  e.preventDefault();
  const m=txt.replace(/\r/g,'').split('\n').filter((l,i,a)=>l!==''||i<a.length-1).map(l=>l.split('\t'));
  let r0=+inp.dataset.r,c0=+inp.dataset.c,n=0;
  m.forEach((row,i)=>row.forEach((val,j)=>{const t=$('ngW').querySelector(`.ng-in[data-r="${r0+i}"][data-c="${c0+j}"]`);if(t&&!t.disabled){t.value=String(val).trim().replace(/[^0-9.,]/g,'');ngEdit(t);n++}}));
  toast('Ditempel',n+' kotak terisi.','success');
}
function ngMuat(){
  if(NG.dirty&&!confirm('Ada nilai yang belum disimpan. Lanjut tanpa menyimpan?')){$('ngK').value=NG.d.kelas;$('ngM').value=NG.d.mapel;$('ngS').value=NG.d.semester;return}
  renderInputNilai($('ngK').value,$('ngM').value.trim(),$('ngS').value).catch(fail);
}
function ngOnly(k){NG.only=k;ngTabel()}
function ngStruktur(){
  let n=Math.max(1,Math.min(6,+$('ngNB').value||1));const old=NG.bab.slice();
  const tp=[...document.querySelectorAll('.ng-tpn')].map(x=>Math.max(1,Math.min(10,+x.value||1)));
  NG.bab=Array.from({length:n},(_,i)=>tp[i]||old[i]||4);NG.dirty=true;ngDraw();
}
async function ngSimpan(){
  const d=NG.d,rows=ngRows();if(!d.mapel)return toast('Lengkapi','Isi mata pelajaran.','warning');
  const bad=[...document.querySelectorAll('.ng-bad')];if(bad.length)return toast('Periksa nilai','Ada nilai di luar 0–100 (ditandai merah).','warning');
  const b=$('ngSv');b.disabled=true;b.innerHTML='<span class="spinner-border spinner-border-sm"></span> Menyimpan…';
  try{
    const r=await net('nilaiSimpan',{kelas:d.kelas,mapel:d.mapel,semester:d.semester,bab:NG.bab,rows:rows.map(s=>({NISN:s.key,f:NG.bab.map((n,bi)=>(NG.vals[s.key].f[bi]||[]).slice(0,n)),sas:NG.vals[s.key].sas}))});
    NG.dirty=false;Object.keys(CACHE).forEach(k=>{if(k.indexOf('listRows|["nilai"')===0)delete CACHE[k]});
    toast('Tersimpan',r.baru+' baru, '+r.diperbarui+' diperbarui'+(r.dilewati?', '+r.dilewati+' dilewati':'')+'.','success');
  }catch(e){fail(e)}finally{b.disabled=false;b.innerHTML='<i class="bi bi-save"></i> Simpan Nilai'}
}
function ngExcel(){
  if(!window.XLSX)return toast('Belum siap','Pustaka Excel masih dimuat, coba lagi.','warning');
  const d=NG.d,bab=NG.bab,rows=ngRows(),nTP=bab.reduce((a,b)=>a+b,0);
  const h1=['NO','NAMA','FORMATIF'].concat(Array(nTP-1).fill(''),['SUMATIF LINGKUP MATERI'],Array(bab.length-1).fill(''),['SUMATIF AKHIR SEMESTER','NILAI AKHIR']);
  const h2=['','']; bab.forEach((n,i)=>{h2.push('BAB '+(i+1));for(let k=1;k<n;k++)h2.push('')});bab.forEach(()=>h2.push(''));h2.push('','');
  const h3=['','']; bab.forEach((n,i)=>{for(let k=0;k<n;k++)h3.push((i+1)+'.'+(k+1))});bab.forEach((n,i)=>h3.push('LM'+(i+1)));h3.push('','');
  const data=rows.map((s,i)=>{const v=NG.vals[s.key],c=ngHitung(v,bab);return[i+1,s.Nama].concat(...bab.map((n,bi)=>Array.from({length:n},(_,k)=>ngNum((v.f[bi]||[])[k]))),c.lm,[ngNum(v.sas),c.na])});
  const ws=XLSX.utils.aoa_to_sheet([['DAFTAR NILAI — '+(d.mapel||'')+' — Kelas '+d.kelas+' — Semester '+d.semester+' — TA '+d.ta],[],h1,h2,h3].concat(data));
  const mg=[{s:{r:2,c:0},e:{r:4,c:0}},{s:{r:2,c:1},e:{r:4,c:1}},{s:{r:2,c:2},e:{r:2,c:1+nTP}},{s:{r:2,c:2+nTP},e:{r:2,c:1+nTP+bab.length}},{s:{r:2,c:2+nTP+bab.length},e:{r:4,c:2+nTP+bab.length}},{s:{r:2,c:3+nTP+bab.length},e:{r:4,c:3+nTP+bab.length}}];
  let c=2;bab.forEach(n=>{mg.push({s:{r:3,c:c},e:{r:3,c:c+n-1}});c+=n});for(let i=0;i<bab.length;i++)mg.push({s:{r:3,c:2+nTP+i},e:{r:4,c:2+nTP+i}});
  ws['!merges']=mg;ws['!cols']=[{wch:5},{wch:30}];
  const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'Nilai');XLSX.writeFile(wb,'Nilai_'+String(d.mapel||'mapel').replace(/\W+/g,'_')+'_'+String(d.kelas).replace(/\W+/g,'_')+'.xlsx');
}
