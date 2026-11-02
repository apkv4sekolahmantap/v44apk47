// ============================================================
// ALAT PEMBELAJARAN — berjalan di peramban
// ============================================================
const TL={};
const tLoad=(url,css)=>new Promise((ok,no)=>{
  if(css){const l=document.createElement('link');l.rel='stylesheet';l.href=css;document.head.appendChild(l)}
  if(!url)return ok();
  const s=document.createElement('script');s.src=url;s.onload=ok;s.onerror=()=>no(new Error('Gagal memuat pustaka dari internet.'));document.head.appendChild(s);
});
function renderTool(id){
  const f=TL[id];if(!f)throw new Error('Alat belum tersedia.');
  $('app-container').innerHTML='<div class="card-x p-3 p-md-4"><div id="tbody"></div></div>';
  Promise.resolve(f($('tbody'))).catch(fail);
}
const tHead=(ic,t,d)=>`<div class="mb-3"><h2 class="h5 mb-1">${ic} ${t}</h2><p class="text-secondary small mb-0">${d}</p></div>`;
const tWARNA=['#7C3AED','#10B981','#F59E0B','#EF4444','#06B6D4','#EC4899','#6366F1','#84CC16','#F97316','#14B8A6'];
const tShuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
// Kotak daftar nama (dipakai spin wheel, pengacak, pasangan)
const tNamesBox=rows=>`<div class="d-flex gap-2 mb-1 flex-wrap"><select id="tKls" class="form-select form-select-sm w-auto" style="display:none"><option value="">Muat nama dari kelas…</option></select><button class="btn btn-sm btn-light" id="tCon" type="button">Isi contoh</button></div><textarea id="tNm" class="form-control" rows="${rows||8}" placeholder="Satu nama per baris"></textarea>`;
async function tNamesInit(){
  $('tCon').onclick=()=>{$('tNm').value=['Adi','Bunga','Citra','Dimas','Eka','Fajar','Gita','Hana','Indra','Joko','Kiki','Lala'].join('\n');$('tNm').dispatchEvent(new Event('input'))};
  if(!S.user||['Orang Tua','Murid'].indexOf(S.user.Role)>=0)return;
  try{
    if(!S.sisAll)S.sisAll=await api('listSiswaRingkas','');
    const kl=[...new Set(S.sisAll.map(s=>s.Kelas))].sort();if(!kl.length)return;
    const sel=$('tKls');sel.style.display='';sel.innerHTML+=kl.map(k=>`<option>${esc(k)}</option>`).join('');
    sel.onchange=()=>{if(!sel.value)return;$('tNm').value=S.sisAll.filter(s=>s.Kelas===sel.value).map(s=>s.Nama).join('\n');$('tNm').dispatchEvent(new Event('input'))};
  }catch(e){}
}
const tNames=()=>$('tNm').value.split('\n').map(x=>x.trim()).filter(Boolean);

// ── Spin Wheel ──
TL.t_spin=async el=>{
  let ang=0,spin=false;
  el.innerHTML=tHead('🎡','Spin Wheel','Putar roda untuk memilih secara acak.')+`<div class="row g-3"><div class="col-md-5">${tNamesBox(10)}<div class="form-check mt-2"><input class="form-check-input" type="checkbox" id="sRm"><label class="form-check-label" for="sRm">Hapus nama yang terpilih</label></div></div>
   <div class="col-md-7 text-center"><canvas id="sC" width="420" height="420" style="max-width:100%"></canvas><div class="mt-2"><button class="btn btn-pri btn-lg" id="sGo">PUTAR!</button></div><div id="sR" class="display-6 fw-extra mt-2" style="min-height:48px"></div></div></div>`;
  $('tNm').value='Adi\nBunga\nCitra\nDimas\nEka\nFajar';await tNamesInit();
  const c=$('sC'),x=c.getContext('2d');
  const draw=()=>{const n=tNames(),R=200,W=420;x.clearRect(0,0,W,W);x.save();x.translate(W/2,W/2);
    if(!n.length){x.fillStyle='#ccc';x.beginPath();x.arc(0,0,R,0,7);x.fill()}
    else{const a=2*Math.PI/n.length;n.forEach((t,i)=>{x.beginPath();x.moveTo(0,0);x.arc(0,0,R,ang+i*a,ang+(i+1)*a);x.fillStyle=tWARNA[i%tWARNA.length];x.fill();
      x.save();x.rotate(ang+(i+.5)*a);x.fillStyle='#fff';x.font='bold '+Math.max(11,Math.min(20,260/n.length))+'px sans-serif';x.textAlign='right';x.textBaseline='middle';x.fillText(t.slice(0,16),R-12,0);x.restore()})}
    x.restore();x.fillStyle='#111';x.beginPath();x.moveTo(W/2-12,4);x.lineTo(W/2+12,4);x.lineTo(W/2,34);x.fill()};
  $('tNm').addEventListener('input',draw);draw();
  $('sGo').onclick=()=>{
    const n=tNames();if(n.length<2||spin)return toast('Info','Isi minimal 2 nama.','warning');
    spin=true;$('sR').textContent='';const total=(5+Math.random()*4)*2*Math.PI,t0=performance.now(),dur=4500,a0=ang;
    const step=t=>{const p=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-p,3);ang=a0+total*e;draw();
      if(p<1)requestAnimationFrame(step);else{spin=false;const a=2*Math.PI/n.length,k=Math.floor((((-Math.PI/2-ang)%(2*Math.PI))+2*Math.PI)%(2*Math.PI)/a),w=n[k];
        $('sR').innerHTML='🎉 '+esc(w);if($('sRm').checked){n.splice(k,1);$('tNm').value=n.join('\n');draw()}}};
    requestAnimationFrame(step);
  };
};

// ── Pengacak Siswa ──
TL.t_acak=async el=>{
  const hist=new Set();
  el.innerHTML=tHead('🎯','Pengacak Siswa','Pilih siswa secara acak untuk maju, menjawab, atau menjadi petugas.')+`<div class="row g-3"><div class="col-md-5">${tNamesBox(10)}</div><div class="col-md-7">
   <div class="d-flex gap-2 align-items-center mb-3 flex-wrap"><label class="small">Jumlah dipilih</label><input id="aN" type="number" min="1" value="1" class="form-control w-auto" style="width:90px!important"><div class="form-check"><input class="form-check-input" type="checkbox" id="aU" checked><label class="form-check-label small" for="aU">Tanpa pengulangan</label></div><button class="btn btn-pri" id="aGo">Acak!</button><button class="btn btn-light" id="aRs">Reset</button></div>
   <div id="aR" class="text-center p-4 rounded-3" style="background:var(--bs-tertiary-bg);min-height:140px"></div><div class="small text-secondary mt-2" id="aH"></div></div></div>`;
  await tNamesInit();
  $('aRs').onclick=()=>{hist.clear();$('aR').innerHTML='';$('aH').textContent=''};
  $('aGo').onclick=()=>{
    let n=tNames();if(!n.length)return toast('Info','Isi daftar nama.','warning');
    if($('aU').checked){n=n.filter(x=>!hist.has(x));if(!n.length){hist.clear();n=tNames();toast('Info','Semua nama sudah terpilih, putaran baru dimulai.','info')}}
    const k=Math.min(+$('aN').value||1,n.length);let i=0;const iv=setInterval(()=>{$('aR').innerHTML='<div class="display-5 fw-extra">'+esc(n[Math.floor(Math.random()*n.length)])+'</div>';
      if(++i>14){clearInterval(iv);const p=tShuf(n).slice(0,k);p.forEach(x=>hist.add(x));$('aR').innerHTML=p.map(x=>'<div class="display-5 fw-extra text-success">🎉 '+esc(x)+'</div>').join('');$('aH').textContent='Sudah terpilih: '+hist.size+' nama'}},70);
  };
};

// ── Pilih Pasangan Random ──
TL.t_pasang=async el=>{
  el.innerHTML=tHead('👥','Pilih Pasangan Random','Bagi siswa menjadi pasangan atau kelompok secara acak.')+`<div class="row g-3"><div class="col-md-5">${tNamesBox(10)}</div><div class="col-md-7"><div class="d-flex gap-2 align-items-center mb-3"><label class="small">Anggota per kelompok</label><select id="pS" class="form-select w-auto"><option>2</option><option>3</option><option>4</option><option>5</option><option>6</option></select><button class="btn btn-pri" id="pGo">Acak</button></div><div id="pR" class="row g-2"></div></div></div>`;
  await tNamesInit();
  $('pGo').onclick=()=>{
    const n=tShuf(tNames()),s=+$('pS').value;if(n.length<2)return toast('Info','Isi minimal 2 nama.','warning');
    const g=[];for(let i=0;i<n.length;i+=s)g.push(n.slice(i,i+s));
    if(g.length>1&&g[g.length-1].length<Math.ceil(s/2)){const l=g.pop();l.forEach((x,i)=>g[i%g.length].push(x))}
    $('pR').innerHTML=g.map((m,i)=>`<div class="col-sm-6"><div class="card-x p-3" style="border-left:5px solid ${tWARNA[i%tWARNA.length]}"><b>Kelompok ${i+1}</b><ul class="mb-0 ps-3">${m.map(x=>'<li>'+esc(x)+'</li>').join('')}</ul></div></div>`).join('');
  };
};

// ── Alat Peraga 3D (three.js) ──
TL.t_3d=async el=>{
  el.innerHTML=tHead('🧊','Alat Peraga 3D','Putar bangun ruang dengan menyeret, ubah ukurannya, dan lihat rumus volume serta luas permukaannya.')+'<div id="r3" class="text-secondary">Memuat pustaka 3D…</div>';
  await tLoad('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js');
  const P=3.14;
  const SH={kubus:{p:[['s','Sisi',4]],g:v=>new THREE.BoxGeometry(v.s,v.s,v.s),V:v=>v.s**3,L:v=>6*v.s*v.s,fv:'V = s³',fl:'L = 6 × s²'},
   balok:{p:[['p','Panjang',5],['l','Lebar',3],['t','Tinggi',2]],g:v=>new THREE.BoxGeometry(v.p,v.t,v.l),V:v=>v.p*v.l*v.t,L:v=>2*(v.p*v.l+v.p*v.t+v.l*v.t),fv:'V = p × l × t',fl:'L = 2(pl + pt + lt)'},
   tabung:{p:[['r','Jari-jari',2],['t','Tinggi',5]],g:v=>new THREE.CylinderGeometry(v.r,v.r,v.t,48),V:v=>P*v.r*v.r*v.t,L:v=>2*P*v.r*(v.r+v.t),fv:'V = π × r² × t',fl:'L = 2πr(r + t)'},
   kerucut:{p:[['r','Jari-jari',2],['t','Tinggi',5]],g:v=>new THREE.ConeGeometry(v.r,v.t,48),V:v=>P*v.r*v.r*v.t/3,L:v=>P*v.r*(v.r+Math.sqrt(v.r*v.r+v.t*v.t)),fv:'V = ⅓ × π × r² × t',fl:'L = πr(r + s), s = √(r² + t²)'},
   bola:{p:[['r','Jari-jari',3]],g:v=>new THREE.SphereGeometry(v.r,48,32),V:v=>4/3*P*v.r**3,L:v=>4*P*v.r*v.r,fv:'V = ⁴⁄₃ × π × r³',fl:'L = 4 × π × r²'},
   limas:{p:[['s','Sisi alas',4],['t','Tinggi',5]],g:v=>{const g=new THREE.ConeGeometry(v.s/Math.SQRT2,v.t,4);g.rotateY(Math.PI/4);return g},V:v=>v.s*v.s*v.t/3,L:v=>v.s*v.s+2*v.s*Math.sqrt(v.t*v.t+v.s*v.s/4),fv:'V = ⅓ × s² × t',fl:'L = s² + 4 × (½ × s × tₛ), tₛ = √(t² + (s/2)²)'},
   prisma:{p:[['s','Sisi segitiga alas',4],['t','Tinggi prisma',5]],g:v=>new THREE.CylinderGeometry(v.s/Math.sqrt(3),v.s/Math.sqrt(3),v.t,3),V:v=>Math.sqrt(3)/4*v.s*v.s*v.t,L:v=>Math.sqrt(3)/2*v.s*v.s+3*v.s*v.t,fv:'V = luas alas × t = (√3/4 × s²) × t',fl:'L = 2 × luas alas + 3 × s × t'}};
  el.innerHTML=tHead('🧊','Alat Peraga 3D','Seret untuk memutar bangun ruang. Ubah ukuran dengan penggeser. (π = 3,14)')+`<div class="row g-3"><div class="col-lg-7"><div id="r3" style="width:100%;height:380px;border-radius:12px;background:#0f172a;touch-action:none"></div>
   <div class="d-flex gap-3 mt-2 small"><div class="form-check"><input class="form-check-input" type="checkbox" id="r3W"><label for="r3W" class="form-check-label">Kerangka</label></div><div class="form-check"><input class="form-check-input" type="checkbox" id="r3A" checked><label for="r3A" class="form-check-label">Putar otomatis</label></div></div></div>
   <div class="col-lg-5"><select id="r3S" class="form-select mb-2">${Object.keys(SH).map(k=>`<option value="${k}">${k[0].toUpperCase()+k.slice(1)}</option>`).join('')}</select><div id="r3P"></div><div class="card-x p-3 mt-2" id="r3I"></div></div></div>`;
  const box=$('r3'),W=box.clientWidth,H=380,scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(45,W/H,.1,100),ren=new THREE.WebGLRenderer({antialias:true});
  ren.setSize(W,H);box.appendChild(ren.domElement);cam.position.set(0,5,16);cam.lookAt(0,0,0);
  scene.add(new THREE.AmbientLight(0xffffff,.65));const dl=new THREE.DirectionalLight(0xffffff,.8);dl.position.set(6,10,8);scene.add(dl);
  let mesh=null,cur='kubus',val={};
  const build=()=>{
    if(mesh){scene.remove(mesh);mesh.geometry.dispose()}
    const d=SH[cur],g=d.g(val);g.computeBoundingBox();const bb=g.boundingBox,mx=Math.max(bb.max.x-bb.min.x,bb.max.y-bb.min.y,bb.max.z-bb.min.z);
    mesh=new THREE.Mesh(g,new THREE.MeshStandardMaterial({color:0x7C3AED,roughness:.45,metalness:.1,wireframe:$('r3W').checked}));mesh.rotation.set(.4,.6,0);mesh.scale.setScalar(7/Math.max(mx,7)*Math.min(1,7/mx*1.1));scene.add(mesh);
    $('r3I').innerHTML=`<div class="small text-secondary">Rumus</div><div><b>${d.fv}</b></div><div class="mb-2"><b>${d.fl}</b></div><div>Volume = <b>${d.V(val).toFixed(2)}</b> satuan³</div><div>Luas permukaan = <b>${d.L(val).toFixed(2)}</b> satuan²</div>`;
  };
  const setShape=k=>{cur=k;val={};$('r3P').innerHTML=SH[k].p.map(p=>{val[p[0]]=p[2];return `<label class="small d-flex justify-content-between"><span>${p[1]}</span><b id="v_${p[0]}">${p[2]}</b></label><input type="range" class="form-range" min="1" max="10" step="0.5" value="${p[2]}" data-k="${p[0]}">`}).join('');
    $('r3P').querySelectorAll('input').forEach(i=>i.oninput=()=>{val[i.dataset.k]=+i.value;$('v_'+i.dataset.k).textContent=i.value;build()});build()};
  $('r3S').onchange=e=>setShape(e.target.value);$('r3W').onchange=build;setShape('kubus');
  let drag=false,lx=0,ly=0;
  ren.domElement.onpointerdown=e=>{drag=true;lx=e.clientX;ly=e.clientY;$('r3A').checked=false};
  window.addEventListener('pointerup',()=>drag=false);
  ren.domElement.onpointermove=e=>{if(!drag||!mesh)return;mesh.rotation.y+=(e.clientX-lx)*.01;mesh.rotation.x+=(e.clientY-ly)*.01;lx=e.clientX;ly=e.clientY};
  let alive=true;S.cleanup=()=>{alive=false;ren.dispose()};
  const loop=()=>{if(!alive)return;if(mesh&&$('r3A')&&$('r3A').checked)mesh.rotation.y+=.01;ren.render(scene,cam);requestAnimationFrame(loop)};loop();
};

// ── Kalkulator Konversi ──
const KONV={Panjang:{km:1000,hm:100,dam:10,m:1,dm:.1,cm:.01,mm:.001},Massa:{ton:1e6,kuintal:1e5,kg:1000,hg:100,dag:10,g:1,mg:.001},Waktu:{minggu:604800,hari:86400,jam:3600,menit:60,detik:1},
 Luas:{'km²':1e6,ha:1e4,are:100,'m²':1,'dm²':.01,'cm²':1e-4},Volume:{'m³':1000,kL:1000,L:1,dL:.1,cL:.01,mL:.001},Kecepatan:{'km/jam':1/3.6,'m/detik':1,'cm/detik':.01},Data:{TB:1024**4,GB:1024**3,MB:1024**2,KB:1024,Byte:1},Suhu:{'°C':0,'°F':0,K:0,'°R':0}};
TL.t_konversi=el=>{
  el.innerHTML=tHead('🔁','Kalkulator Konversi','Ubah satuan panjang, massa, waktu, luas, volume, kecepatan, data, dan suhu.')+`<div class="row g-2 align-items-end" style="max-width:720px"><div class="col-12 col-md-3"><label class="small">Besaran</label><select id="kB" class="form-select">${Object.keys(KONV).map(k=>`<option>${k}</option>`).join('')}</select></div>
   <div class="col-6 col-md-3"><label class="small">Nilai</label><input id="kV" type="number" class="form-control" value="1" step="any"></div><div class="col-6 col-md-3"><label class="small">Dari</label><select id="kA" class="form-select"></select></div><div class="col-12 col-md-3"><label class="small">Ke</label><select id="kC" class="form-select"></select></div></div><div class="card-x p-3 mt-3" id="kR"></div>`;
  const suhu=(v,a,b)=>{let c=a==='°C'?v:a==='°F'?(v-32)*5/9:a==='K'?v-273.15:v*5/4;return b==='°C'?c:b==='°F'?c*9/5+32:b==='K'?c+273.15:c*4/5};
  const fmt=n=>(Math.abs(n)>=1e9||(Math.abs(n)<1e-4&&n!==0))?n.toExponential(4):String(+n.toPrecision(10));
  const hit=(v,a,b,B)=>B==='Suhu'?suhu(v,a,b):v*KONV[B][a]/KONV[B][b];
  const fill=()=>{const u=Object.keys(KONV[$('kB').value]);$('kA').innerHTML=u.map(x=>`<option>${x}</option>`).join('');$('kC').innerHTML=u.map(x=>`<option>${x}</option>`).join('');$('kC').selectedIndex=Math.min(1,u.length-1);calc()};
  const calc=()=>{const B=$('kB').value,v=+$('kV').value,a=$('kA').value,b=$('kC').value;
    $('kR').innerHTML=`<div class="fs-4 fw-extra mb-2">${fmt(v)} ${esc(a)} = <span class="text-success">${fmt(hit(v,a,b,B))} ${esc(b)}</span></div><div class="row g-1 small">${Object.keys(KONV[B]).map(u=>`<div class="col-6 col-md-4">${fmt(hit(v,a,u,B))} <b>${esc(u)}</b></div>`).join('')}</div>`};
  ['kV','kA','kC'].forEach(i=>$(i).oninput=calc);$('kB').onchange=fill;fill();
};

// ── Papan Tulis ──
TL.t_papan=el=>{
  el.innerHTML=tHead('🖍️','Papan Tulis','Tulis dan gambar langsung dengan jari, mouse, atau pena layar.')+`<div class="d-flex flex-wrap gap-2 align-items-center mb-2" id="wbT">
   ${['#111827','#EF4444','#2563EB','#16A34A','#F59E0B','#7C3AED'].map(c=>`<button class="btn btn-sm border" data-c="${c}" style="background:${c};width:30px;height:30px"></button>`).join('')}
   <button class="btn btn-sm btn-light" id="wbE" title="Penghapus"><i class="bi bi-eraser"></i></button><input type="range" id="wbS" min="2" max="30" value="4" style="width:100px"><select id="wbB" class="form-select form-select-sm w-auto"><option value="#ffffff">Putih</option><option value="#14532d">Hijau papan</option><option value="#111827">Hitam</option><option value="#fef9c3">Kuning</option></select>
   <button class="btn btn-sm btn-light" id="wbU"><i class="bi bi-arrow-counterclockwise"></i> Urungkan</button><button class="btn btn-sm btn-light" id="wbC"><i class="bi bi-trash"></i> Bersihkan</button><button class="btn btn-sm btn-pri" id="wbD"><i class="bi bi-download"></i> Simpan PNG</button></div>
   <canvas id="wb" style="width:100%;height:60vh;border:2px solid var(--bs-border-color);border-radius:12px;touch-action:none;cursor:crosshair"></canvas>`;
  const c=$('wb'),x=c.getContext('2d');let col='#111827',erase=false,draw=false,stack=[],lx=0,ly=0,bg='#ffffff';
  const fit=()=>{const r=c.getBoundingClientRect(),img=c.width?x.getImageData(0,0,c.width,c.height):null;c.width=r.width;c.height=r.height;x.fillStyle=bg;x.fillRect(0,0,c.width,c.height);if(img)x.putImageData(img,0,0)};fit();
  const snap=()=>{stack.push(x.getImageData(0,0,c.width,c.height));if(stack.length>25)stack.shift()};
  const pos=e=>{const r=c.getBoundingClientRect();return[e.clientX-r.left,e.clientY-r.top]};
  c.onpointerdown=e=>{snap();draw=true;[lx,ly]=pos(e);c.setPointerCapture(e.pointerId)};
  c.onpointermove=e=>{if(!draw)return;const[px,py]=pos(e);x.strokeStyle=erase?bg:col;x.lineWidth=erase?+$('wbS').value*3:+$('wbS').value;x.lineCap='round';x.lineJoin='round';x.beginPath();x.moveTo(lx,ly);x.lineTo(px,py);x.stroke();lx=px;ly=py};
  c.onpointerup=c.onpointercancel=()=>draw=false;
  document.querySelectorAll('#wbT [data-c]').forEach(b=>b.onclick=()=>{col=b.dataset.c;erase=false});
  $('wbE').onclick=()=>erase=!erase;$('wbU').onclick=()=>{const s=stack.pop();if(s)x.putImageData(s,0,0)};
  $('wbC').onclick=()=>{snap();x.fillStyle=bg;x.fillRect(0,0,c.width,c.height)};
  $('wbB').onchange=e=>{snap();bg=e.target.value;x.fillStyle=bg;x.fillRect(0,0,c.width,c.height);if(bg==='#14532d'||bg==='#111827')col='#ffffff';else if(col==='#ffffff')col='#111827'};
  $('wbD').onclick=()=>{const a=document.createElement('a');a.download='papan-tulis.png';a.href=c.toDataURL('image/png');a.click()};
};

// ── Mind Mapping ──
TL.t_mind=el=>{
  let id=1,N=[{id:0,t:'Topik Utama',x:400,y:240,p:null}],sel=0;
  try{const sv=JSON.parse(localStorage.getItem('mindmap')||'null');if(sv&&sv.N&&sv.N.length){N=sv.N;id=sv.id;}}catch(e){}
  el.innerHTML=tHead('🧠','Mind Mapping','Pilih simpul, lalu tambah cabang. Seret simpul untuk memindahkan; klik dua kali untuk mengubah teks.')+`<div class="d-flex flex-wrap gap-2 mb-2"><button class="btn btn-sm btn-pri" id="mAdd"><i class="bi bi-plus-lg"></i> Tambah Cabang</button><button class="btn btn-sm btn-light" id="mEd"><i class="bi bi-pencil"></i> Ubah Teks</button><button class="btn btn-sm btn-light text-danger" id="mDel"><i class="bi bi-trash"></i> Hapus Simpul</button><button class="btn btn-sm btn-light" id="mNew">Peta Baru</button><button class="btn btn-sm btn-light" id="mSv"><i class="bi bi-download"></i> Unduh PNG</button></div>
   <svg id="mm" viewBox="0 0 800 480" style="width:100%;height:62vh;border:2px solid var(--bs-border-color);border-radius:12px;background:var(--bs-body-bg);touch-action:none"></svg>`;
  const W=['#7C3AED','#10B981','#F59E0B','#06B6D4','#EC4899','#6366F1'],dep=n=>{let d=0;while(n.p!==null){n=N.find(x=>x.id===n.p);d++}return d};
  const save=()=>{try{localStorage.setItem('mindmap',JSON.stringify({N:N,id:id}))}catch(e){}};
  const draw=()=>{
    $('mm').innerHTML=N.filter(n=>n.p!==null).map(n=>{const p=N.find(x=>x.id===n.p);return `<line x1="${p.x}" y1="${p.y}" x2="${n.x}" y2="${n.y}" stroke="#94a3b8" stroke-width="2"/>`}).join('')+
     N.map(n=>{const d=dep(n),w=Math.max(80,n.t.length*9+24);return `<g data-i="${n.id}" style="cursor:grab"><rect x="${n.x-w/2}" y="${n.y-18}" width="${w}" height="36" rx="18" fill="${W[d%W.length]}" ${n.id===sel?'stroke="#111" stroke-width="3"':''}/><text x="${n.x}" y="${n.y+5}" text-anchor="middle" fill="#fff" font-size="14" font-family="sans-serif" pointer-events="none">${esc(n.t)}</text></g>`}).join('');
    $('mm').querySelectorAll('g').forEach(g=>{
      g.onpointerdown=e=>{sel=+g.dataset.i;const n=N.find(x=>x.id===sel),pt=$('mm').createSVGPoint();let mv=false;
        const move=ev=>{mv=true;pt.x=ev.clientX;pt.y=ev.clientY;const q=pt.matrixTransform($('mm').getScreenCTM().inverse());n.x=Math.max(20,Math.min(780,q.x));n.y=Math.max(20,Math.min(460,q.y));draw()};
        const up=()=>{window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);save();if(!mv)draw()};
        window.addEventListener('pointermove',move);window.addEventListener('pointerup',up);draw()};
      g.ondblclick=()=>ubah(+g.dataset.i);
    });
  };
  const ubah=i=>{const n=N.find(x=>x.id===i),t=prompt('Teks simpul:',n.t);if(t!==null&&t.trim()){n.t=t.trim().slice(0,40);save();draw()}};
  $('mAdd').onclick=()=>{const p=N.find(x=>x.id===sel)||N[0],t=prompt('Teks cabang baru:','Cabang');if(!t)return;const a=Math.random()*Math.PI*2;
    N.push({id:id++,t:t.trim().slice(0,40),x:Math.max(40,Math.min(760,p.x+Math.cos(a)*130)),y:Math.max(30,Math.min(450,p.y+Math.sin(a)*90)),p:p.id});save();draw()};
  $('mEd').onclick=()=>ubah(sel);
  $('mDel').onclick=()=>{if(sel===0)return toast('Info','Simpul utama tidak dapat dihapus.','warning');const del=new Set([sel]);let ch=true;while(ch){ch=false;N.forEach(n=>{if(n.p!==null&&del.has(n.p)&&!del.has(n.id)){del.add(n.id);ch=true}})}N=N.filter(n=>!del.has(n.id));sel=0;save();draw()};
  $('mNew').onclick=()=>{if(confirm('Mulai peta baru? Peta saat ini akan dihapus.')){N=[{id:0,t:'Topik Utama',x:400,y:240,p:null}];id=1;sel=0;save();draw()}};
  $('mSv').onclick=()=>{const s=new XMLSerializer().serializeToString($('mm')),img=new Image(),cv=document.createElement('canvas');cv.width=1600;cv.height=960;
    img.onload=()=>{const k=cv.getContext('2d');k.fillStyle='#fff';k.fillRect(0,0,1600,960);k.drawImage(img,0,0,1600,960);const a=document.createElement('a');a.download='mind-map.png';a.href=cv.toDataURL('image/png');a.click()};
    img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s)};
  draw();
};

// ── Peta Interaktif (Leaflet + OpenStreetMap) ──
const KOTA=[['Banda Aceh',5.55,95.32],['Medan',3.59,98.67],['Padang',-.95,100.35],['Pekanbaru',.51,101.45],['Jambi',-1.6,103.6],['Palembang',-2.98,104.76],['Bengkulu',-3.8,102.26],['Bandar Lampung',-5.43,105.26],['Jakarta',-6.2,106.82],['Bandung',-6.92,107.61],['Semarang',-6.97,110.42],['Yogyakarta',-7.8,110.37],['Surabaya',-7.25,112.75],['Denpasar',-8.65,115.22],['Mataram',-8.58,116.1],['Kupang',-10.18,123.6],['Pontianak',-.03,109.33],['Palangka Raya',-2.21,113.92],['Banjarmasin',-3.32,114.59],['Samarinda',-.5,117.15],['Tanjung Selor',2.84,117.37],['Tarakan',3.3,117.63],['Balikpapan',-1.24,116.83],['Manado',1.47,124.84],['Palu',-.9,119.87],['Makassar',-5.15,119.43],['Kendari',-3.97,122.51],['Gorontalo',.54,123.06],['Ambon',-3.7,128.18],['Ternate',.79,127.38],['Manokwari',-.86,134.06],['Jayapura',-2.53,140.72]];
TL.t_peta=async el=>{
  el.innerHTML=tHead('🗺️','Peta Interaktif','Jelajahi peta, cari tempat, tandai lokasi, dan ukur jarak. (Perlu koneksi internet)')+`<div class="d-flex flex-wrap gap-2 mb-2"><input id="pQ" class="form-control" style="max-width:260px" placeholder="Cari tempat (mis. Tarakan)"><button class="btn btn-pri" id="pS">Cari</button><select id="pK" class="form-select w-auto"><option value="">Kota di Indonesia…</option>${KOTA.map((k,i)=>`<option value="${i}">${k[0]}</option>`).join('')}</select><button class="btn btn-light" id="pM">📏 Ukur jarak: mati</button><button class="btn btn-light" id="pC">Hapus tanda</button></div><div id="pMap" style="height:62vh;border-radius:12px"></div><div id="pI" class="small text-secondary mt-2"></div>`;
  const loaderL=window.L;await tLoad('https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js','https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css');const LL=window.L;if(typeof loaderL==='function')window.L=loaderL;
  const map=LL.map('pMap').setView([-2.5,118],5);LL.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'© OpenStreetMap'}).addTo(map);
  const grp=LL.layerGroup().addTo(map);let ukur=false,pts=[];
  KOTA.forEach(k=>LL.circleMarker([k[1],k[2]],{radius:5,color:'#7C3AED',fillOpacity:.8}).addTo(map).bindTooltip(k[0]));
  const hav=(a,b)=>{const R=6371,r=x=>x*Math.PI/180,dl=r(b.lat-a.lat),dn=r(b.lng-a.lng),h=Math.sin(dl/2)**2+Math.cos(r(a.lat))*Math.cos(r(b.lat))*Math.sin(dn/2)**2;return 2*R*Math.asin(Math.sqrt(h))};
  map.on('click',e=>{
    if(ukur){pts.push(e.latlng);LL.marker(e.latlng).addTo(grp);if(pts.length>=2){const a=pts[pts.length-2],b=pts[pts.length-1];LL.polyline([a,b],{color:'#EF4444'}).addTo(grp);let t=0;for(let i=1;i<pts.length;i++)t+=hav(pts[i-1],pts[i]);$('pI').innerHTML='Jarak garis lurus: <b>'+t.toFixed(1)+' km</b>'}}
    else{LL.marker(e.latlng).addTo(grp).bindPopup('Lat '+e.latlng.lat.toFixed(4)+', Lng '+e.latlng.lng.toFixed(4)).openPopup()}
  });
  $('pM').onclick=()=>{ukur=!ukur;pts=[];$('pM').textContent='📏 Ukur jarak: '+(ukur?'aktif (klik 2+ titik)':'mati');$('pI').textContent=''};
  $('pC').onclick=()=>{grp.clearLayers();pts=[];$('pI').textContent=''};
  $('pK').onchange=e=>{if(e.target.value==='')return;const k=KOTA[+e.target.value];map.setView([k[1],k[2]],10)};
  $('pS').onclick=async()=>{const q=$('pQ').value.trim();if(!q)return;
    try{const r=await (await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&q='+encodeURIComponent(q))).json();
      if(!r.length)return toast('Info','Tempat tidak ditemukan.','warning');const p=r[0];map.setView([+p.lat,+p.lon],13);LL.marker([+p.lat,+p.lon]).addTo(grp).bindPopup(esc(p.display_name)).openPopup()}catch(e){toast('Gagal','Pencarian tidak dapat dilakukan.','danger')}};
  $('pQ').onkeydown=e=>{if(e.key==='Enter')$('pS').click()};
  S.cleanup=()=>map.remove();
};

// ── Virtual Lab ──
const PHZAT=[['Jus lemon',2],['Cuka',2.5],['Minuman bersoda',3],['Jus jeruk',3.5],['Kopi',5],['Susu',6.5],['Air murni',7],['Air laut',8],['Soda kue',9],['Sabun',10],['Amonia rumah tangga',11.5],['Pemutih',12.5]];
const phWarna=p=>['#ff0000','#ff2a00','#ff5500','#ff8800','#ffbb00','#d4d400','#88cc00','#33bb44','#00aa88','#0088cc','#3355cc','#5533bb','#7a2aa8','#8a1a99'][Math.max(0,Math.min(13,Math.round(p)-1))];
TL.t_lab=el=>{
  el.innerHTML=tHead('🧪','Virtual Lab','Eksperimen sains secara virtual: gerak parabola, rangkaian listrik, dan uji pH.')+`<ul class="nav nav-pills mb-3" id="lT"><li class="nav-item"><button class="nav-link active" data-t="par">Gerak Parabola</button></li><li class="nav-item"><button class="nav-link" data-t="lis">Rangkaian Listrik</button></li><li class="nav-item"><button class="nav-link" data-t="ph">Uji pH</button></li></ul><div id="lB"></div>`;
  let raf=0;S.cleanup=()=>cancelAnimationFrame(raf);
  const tab={
   par:b=>{
    b.innerHTML=`<div class="row g-3"><div class="col-lg-4"><label class="small d-flex justify-content-between">Kecepatan awal <b id="pvv">20</b> m/s</label><input type="range" class="form-range" id="pv" min="5" max="40" value="20"><label class="small d-flex justify-content-between">Sudut <b id="paa">45</b>°</label><input type="range" class="form-range" id="pa" min="5" max="85" value="45"><label class="small d-flex justify-content-between">Gravitasi <b id="pgg">9.8</b> m/s²</label><input type="range" class="form-range" id="pg" min="1.6" max="25" step="0.1" value="9.8"><button class="btn btn-pri w-100 mt-2" id="pGo">Luncurkan!</button><div class="card-x p-3 mt-3 small" id="pO"></div><div class="small text-secondary mt-2">Gravitasi Bumi 9,8 · Bulan 1,6 · Jupiter 24,8</div></div><div class="col-lg-8"><canvas id="pc" width="720" height="400" style="width:100%;background:#e0f2fe;border-radius:12px"></canvas></div></div>`;
    const c=$('pc'),x=c.getContext('2d');
    const info=()=>{const v=+$('pv').value,a=+$('pa').value*Math.PI/180,g=+$('pg').value;$('pvv').textContent=v;$('paa').textContent=$('pa').value;$('pgg').textContent=g;
      const T=2*v*Math.sin(a)/g,R=v*v*Math.sin(2*a)/g,H=(v*Math.sin(a))**2/(2*g);$('pO').innerHTML=`Waktu di udara: <b>${T.toFixed(2)} s</b><br>Jarak mendatar (jangkauan): <b>${R.toFixed(1)} m</b><br>Tinggi maksimum: <b>${H.toFixed(1)} m</b>`;return{v:v,a:a,g:g,T:T,R:R,H:H}};
    const base=(R,H)=>{x.clearRect(0,0,720,400);x.fillStyle='#86efac';x.fillRect(0,360,720,40);x.strokeStyle='#64748b';x.setLineDash([4,4]);x.beginPath();x.moveTo(0,360);x.lineTo(720,360);x.stroke();x.setLineDash([])};
    const run=()=>{cancelAnimationFrame(raf);const p=info(),sc=Math.min(640/Math.max(p.R,1),330/Math.max(p.H,1)),t0=performance.now(),tr=[];
      const f=t=>{const s=Math.min(p.T,(t-t0)/1000*Math.max(1,p.T/3)),px=p.v*Math.cos(p.a)*s,py=p.v*Math.sin(p.a)*s-.5*p.g*s*s;tr.push([30+px*sc,360-py*sc]);base();
        x.strokeStyle='#7C3AED';x.lineWidth=2;x.beginPath();tr.forEach((q,i)=>i?x.lineTo(q[0],q[1]):x.moveTo(q[0],q[1]));x.stroke();
        const q=tr[tr.length-1];x.fillStyle='#EF4444';x.beginPath();x.arc(q[0],q[1],8,0,7);x.fill();if(s<p.T)raf=requestAnimationFrame(f)};raf=requestAnimationFrame(f)};
    ['pv','pa','pg'].forEach(i=>$(i).oninput=()=>{info();cancelAnimationFrame(raf);base()});$('pGo').onclick=run;info();base();
   },
   lis:b=>{
    b.innerHTML=`<div class="row g-3"><div class="col-lg-5"><label class="small d-flex justify-content-between">Tegangan sumber <b id="lVv">12</b> V</label><input type="range" class="form-range" id="lV" min="1" max="24" value="12"><label class="small d-flex justify-content-between">Hambatan R₁ <b id="lR1v">10</b> Ω</label><input type="range" class="form-range" id="lR1" min="1" max="100" value="10"><label class="small d-flex justify-content-between">Hambatan R₂ <b id="lR2v">20</b> Ω</label><input type="range" class="form-range" id="lR2" min="1" max="100" value="20"><div class="btn-group w-100 mt-2"><button class="btn btn-pri" id="lS">Seri</button><button class="btn btn-outline-primary" id="lP">Paralel</button></div></div><div class="col-lg-7"><div class="card-x p-3" id="lO"></div></div></div>`;
    let mode='s';const hit=()=>{const V=+$('lV').value,a=+$('lR1').value,c=+$('lR2').value;$('lVv').textContent=V;$('lR1v').textContent=a;$('lR2v').textContent=c;
      let h;if(mode==='s'){const Rt=a+c,I=V/Rt;h=`<h3 class="h6">Rangkaian Seri</h3><div>R total = R₁ + R₂ = <b>${Rt} Ω</b></div><div>Arus I = V / R = <b>${I.toFixed(3)} A</b> (sama di semua komponen)</div><div>V₁ = I × R₁ = <b>${(I*a).toFixed(2)} V</b></div><div>V₂ = I × R₂ = <b>${(I*c).toFixed(2)} V</b></div><div>Daya total = V × I = <b>${(V*I).toFixed(2)} W</b></div>`}
      else{const Rt=a*c/(a+c),I=V/Rt;h=`<h3 class="h6">Rangkaian Paralel</h3><div>1/R total = 1/R₁ + 1/R₂ → R total = <b>${Rt.toFixed(2)} Ω</b></div><div>Arus total I = V / R = <b>${I.toFixed(3)} A</b></div><div>I₁ = V / R₁ = <b>${(V/a).toFixed(3)} A</b></div><div>I₂ = V / R₂ = <b>${(V/c).toFixed(3)} A</b></div><div>Daya total = V × I = <b>${(V*I).toFixed(2)} W</b></div>`}
      $('lO').innerHTML=h+'<div class="small text-secondary mt-2">Hukum Ohm: V = I × R</div>'};
    ['lV','lR1','lR2'].forEach(i=>$(i).oninput=hit);
    $('lS').onclick=()=>{mode='s';$('lS').className='btn btn-pri';$('lP').className='btn btn-outline-primary';hit()};$('lP').onclick=()=>{mode='p';$('lP').className='btn btn-pri';$('lS').className='btn btn-outline-primary';hit()};hit();
   },
   ph:b=>{
    b.innerHTML=`<div class="row g-3"><div class="col-lg-5"><label class="small">Pilih cairan yang diuji</label><div class="d-grid gap-1">${PHZAT.map((z,i)=>`<button class="btn btn-outline-secondary text-start" data-i="${i}">${z[0]}</button>`).join('')}</div></div><div class="col-lg-7"><div class="card-x p-3 text-center"><div id="phT" class="mb-2 text-secondary">Pilih cairan…</div><div id="phC" style="width:110px;height:140px;margin:auto;border-radius:0 0 40px 40px;border:3px solid #64748b;background:#f1f5f9"></div><div class="display-6 fw-extra mt-2" id="phV"></div><div class="d-flex mt-3" style="height:18px;border-radius:9px;overflow:hidden">${Array.from({length:14},(_,i)=>`<div style="flex:1;background:${phWarna(i+1)}"></div>`).join('')}</div><div class="d-flex justify-content-between small text-secondary"><span>0 Asam</span><span>7 Netral</span><span>14 Basa</span></div></div></div></div>`;
    b.querySelectorAll('[data-i]').forEach(t=>t.onclick=()=>{const z=PHZAT[+t.dataset.i];$('phC').style.background=phWarna(z[1]);$('phT').textContent=z[0];$('phV').innerHTML='pH '+z[1]+' <small class="fs-6">'+(z[1]<6.5?'(asam)':z[1]>7.5?'(basa)':'(netral)')+'</small>'});
   }};
  const show=t=>{cancelAnimationFrame(raf);document.querySelectorAll('#lT button').forEach(b=>b.classList.toggle('active',b.dataset.t===t));tab[t]($('lB'))};
  document.querySelectorAll('#lT button').forEach(b=>b.onclick=()=>show(b.dataset.t));show('par');
};
