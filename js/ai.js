// ============================================================
// FITUR AI: Generator Soal & LKPD Bergambar
// API key dimasukkan MASING-MASING pengguna dan disimpan hanya di peramban akun tersebut
// (tidak dikirim ke server Apps Script / tidak terlihat Admin). Panggilan langsung dari HP/PC ke penyedia AI.
// ============================================================
const AI={P:{
  gemini:{n:'Google Gemini',m:'gemini-flash-latest',im:'gemini-3.1-flash-image',link:'https://aistudio.google.com/apikey',img:true},
  openai:{n:'OpenAI (ChatGPT)',m:'gpt-5.4-mini',im:'gpt-image-2',link:'https://platform.openai.com/api-keys',img:true},
  anthropic:{n:'Anthropic Claude',m:'claude-sonnet-5-5',im:'',link:'https://console.anthropic.com/settings/keys',img:false}}};
const aiKeyName=()=>'ai_cfg_'+((S.user&&S.user.Username)||'x');
function aiCfg(){for(const st of [localStorage,sessionStorage]){try{const j=JSON.parse(st.getItem(aiKeyName())||'null');if(j&&j.key)return j}catch(e){}}return{}}
function aiSaveCfg(c,ingat){try{localStorage.removeItem(aiKeyName());sessionStorage.removeItem(aiKeyName())}catch(e){}try{(ingat?localStorage:sessionStorage).setItem(aiKeyName(),JSON.stringify(c))}catch(e){}}
const aiHapus=()=>{try{localStorage.removeItem(aiKeyName());sessionStorage.removeItem(aiKeyName())}catch(e){}};
function aiSettingsUI(after){
  const c=aiCfg(),p=c.p||'gemini',ingat=c.ingat!==false;
  openModal('Pengaturan AI — akun '+esc(S.user.Username||''),`<p class="small text-secondary">Masukkan <b>API key milik Anda sendiri</b>. Kunci hanya disimpan di peramban ini untuk akun Anda; tidak dikirim ke server aplikasi dan tidak terlihat pengguna lain atau Admin. Biaya/kuota penggunaan mengikuti akun API Anda.</p>
   <div class="row g-2"><div class="col-12"><label class="form-label small fw-semibold" for="aiP">Penyedia AI</label><select id="aiP" class="form-select" onchange="aiPSel()">${Object.keys(AI.P).map(k=>`<option value="${k}" ${k===p?'selected':''}>${AI.P[k].n}</option>`).join('')}</select><div class="form-text"><a id="aiL" href="${AI.P[p].link}" target="_blank" rel="noopener">Dapatkan API key ↗</a></div></div>
   <div class="col-12"><label class="form-label small fw-semibold" for="aiK">API key</label><input id="aiK" type="password" class="form-control" autocomplete="off" value="${esc(c.key||'')}" placeholder="tempel API key di sini"></div>
   <div class="col-md-6"><label class="form-label small fw-semibold" for="aiM">Model teks</label><input id="aiM" class="form-control" value="${esc(c.m||AI.P[p].m)}"></div>
   <div class="col-md-6"><label class="form-label small fw-semibold" for="aiI">Model gambar</label><input id="aiI" class="form-control" value="${esc(c.im||AI.P[p].im)}" ${AI.P[p].img?'':'disabled'} placeholder="(tidak tersedia)"></div>
   <div class="col-12"><div class="form-check"><input class="form-check-input" type="checkbox" id="aiR" ${ingat?'checked':''}><label class="form-check-label small" for="aiR">Ingat di perangkat ini (matikan bila memakai komputer bersama; kunci terhapus saat peramban ditutup)</label></div></div></div><div id="aiT" class="small mt-2"></div>`,
   '<button class="btn btn-outline-danger me-auto" onclick="aiHapus();closeModal();toast(\'Dihapus\',\'API key dihapus dari peramban ini.\',\'info\')">Hapus kunci</button><button class="btn btn-outline-secondary" onclick="aiUji()">Uji koneksi</button><button class="btn btn-pri" onclick="aiSimpan()">Simpan</button>');
  window.__aiAfter=after;
}
function aiPSel(){const p=$('aiP').value;$('aiL').href=AI.P[p].link;$('aiM').value=AI.P[p].m;$('aiI').value=AI.P[p].im;$('aiI').disabled=!AI.P[p].img}
function aiFormCfg(){return{p:$('aiP').value,key:$('aiK').value.trim(),m:$('aiM').value.trim(),im:$('aiI').value.trim(),ingat:$('aiR').checked}}
function aiSimpan(){const c=aiFormCfg();if(!c.key)return toast('Lengkapi','Isi API key.','warning');aiSaveCfg(c,c.ingat);closeModal();toast('Tersimpan','Pengaturan AI disimpan untuk akun Anda.','success');if(window.__aiAfter)window.__aiAfter()}
async function aiUji(){
  const c=aiFormCfg();if(!c.key)return toast('Lengkapi','Isi API key.','warning');aiSaveCfg(c,c.ingat);$('aiT').innerHTML='<span class="spinner-border spinner-border-sm"></span> Menguji…';
  try{const t=await aiText('Balas hanya dengan kata: SIAP',{max:20});$('aiT').innerHTML='<span class="text-success"><i class="bi bi-check-circle"></i> Terhubung. Balasan: '+esc(String(t).slice(0,40))+'</span>'}catch(e){$('aiT').innerHTML='<span class="text-danger"><i class="bi bi-x-circle"></i> '+esc(e.message)+'</span>'}
}
// ── HTTP & penyedia ──
function aiErr(st,m){
  m=String(m||'');
  if(st===401||st===403||(st===400&&/api[ _]?key|API_KEY/i.test(m)))return 'API key ditolak/tidak valid. Periksa kunci pada Pengaturan AI.';
  if(st===429)return 'Kuota/batas permintaan API tercapai. Tunggu sebentar, atau pakai kunci/akun lain.';
  if(st===404)return 'Model tidak ditemukan. Ubah nama model pada Pengaturan AI. ('+m.slice(0,90)+')';
  return 'Layanan AI: '+m.slice(0,220);
}
async function aiFetch(url,opt){
  let r;try{r=await fetch(url,opt)}catch(e){throw new Error('Tidak dapat menghubungi layanan AI (periksa internet/ blokir jaringan).')}
  const t=await r.text();let j=null;try{j=JSON.parse(t)}catch(e){}
  if(!r.ok){const m=j&&((j.error&&(j.error.message||j.error))||j.message)||t.slice(0,200);throw new Error(aiErr(r.status,typeof m==='string'?m:JSON.stringify(m)))}
  return j;
}
async function aiText(prompt,o){
  o=o||{};const c=aiCfg();if(!c.key)throw new Error('NOKEY');const p=c.p||'gemini',model=c.m||AI.P[p].m,sys=o.system||'';
  if(p==='gemini'){
    const ms=[model];if(model===AI.P.gemini.m)ms.push('gemini-3.5-flash');let last;
    for(const m of ms){try{
      const j=await aiFetch('https://generativelanguage.googleapis.com/v1beta/models/'+encodeURIComponent(m)+':generateContent',{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':c.key},body:JSON.stringify({systemInstruction:sys?{parts:[{text:sys}]}:undefined,contents:[{role:'user',parts:[{text:prompt}]}],generationConfig:Object.assign({temperature:o.temp==null?0.7:o.temp},o.json?{responseMimeType:'application/json'}:{})})});
      const pt=(((j.candidates||[])[0]||{}).content||{}).parts;if(!pt)throw new Error('Respons AI kosong (mungkin ditahan filter keamanan). Ubah topik lalu coba lagi.');return pt.map(x=>x.text||'').join('');
    }catch(e){last=e;if(!/Model tidak ditemukan/.test(e.message))throw e}}throw last;
  }
  if(p==='openai'){
    const j=await aiFetch('https://api.openai.com/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+c.key},body:JSON.stringify(Object.assign({model:model,messages:(sys?[{role:'system',content:sys}]:[]).concat([{role:'user',content:prompt}])},o.json?{response_format:{type:'json_object'}}:{}))});
    return j.choices[0].message.content;
  }
  const j=await aiFetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json','x-api-key':c.key,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},body:JSON.stringify({model:model,max_tokens:o.max||8000,system:sys||undefined,messages:[{role:'user',content:prompt}]})});
  return (j.content||[]).map(x=>x.text||'').join('');
}
function aiJson(t){
  t=String(t||'').replace(/^\s*```(?:json)?/i,'').replace(/```\s*$/,'').trim();
  const a=t.indexOf('{'),b=t.lastIndexOf('}');if(a<0||b<=a)throw new Error('Hasil AI bukan JSON yang valid. Coba buat ulang.');
  try{return JSON.parse(t.slice(a,b+1))}catch(e){throw new Error('Hasil AI terpotong/tidak valid. Kurangi jumlah soal lalu coba lagi.')}
}
const aiStylePrompt='gaya ilustrasi kartun pendidikan untuk anak SD, warna cerah, garis bersih, latar putih polos, TANPA teks atau tulisan apa pun pada gambar';
async function aiImage(desc){
  const c=aiCfg(),p=c.p||'gemini';
  if(p==='gemini'){
    const im=c.im||AI.P.gemini.im,j=await aiFetch('https://generativelanguage.googleapis.com/v1beta/models/'+encodeURIComponent(im)+':generateContent',{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':c.key},body:JSON.stringify({contents:[{role:'user',parts:[{text:'Buat gambar: '+desc+'. '+aiStylePrompt}]}],generationConfig:{responseModalities:['TEXT','IMAGE']}})});
    const pt=(((j.candidates||[])[0]||{}).content||{}).parts||[],x=pt.find(q=>q.inlineData||q.inline_data);if(!x)throw new Error('Model tidak mengembalikan gambar.');
    const d=x.inlineData||x.inline_data;return 'data:'+(d.mimeType||d.mime_type||'image/png')+';base64,'+d.data;
  }
  if(p==='openai'){
    const j=await aiFetch('https://api.openai.com/v1/images/generations',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+c.key},body:JSON.stringify({model:c.im||AI.P.openai.im,prompt:'Buat gambar: '+desc+'. '+aiStylePrompt,size:'1024x1024',n:1})});
    const d=(j.data||[])[0];if(d&&d.b64_json)return 'data:image/png;base64,'+d.b64_json;throw new Error('Model tidak mengembalikan gambar.');
  }
  throw new Error('Penyedia ini tidak mendukung gambar AI.');
}
function svgClean(t){
  const m=/<svg[\s\S]*<\/svg>/i.exec(t||'');if(!m)return null;
  let s=m[0].replace(/<script[\s\S]*?<\/script>/gi,'').replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi,'').replace(/<style[\s\S]*?<\/style>/gi,'').replace(/\son\w+\s*=\s*("[^"]*"|'[^']*')/gi,'').replace(/\s(?:xlink:)?href\s*=\s*("(?!#)[^"]*"|'(?!#)[^']*')/gi,'');
  if(!/viewBox/i.test(s))s=s.replace(/<svg/i,'<svg viewBox="0 0 400 300"');if(!/xmlns=/.test(s))s=s.replace(/<svg/i,'<svg xmlns="http://www.w3.org/2000/svg"');return s;
}
const svgUri=s=>'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s);
async function aiSvg(desc){
  const t=await aiText('Gambar sebuah ilustrasi SVG sederhana, ramah anak SD, untuk: "'+desc+'". Syarat: satu elemen <svg> dengan viewBox="0 0 400 300", bentuk dasar (rect, circle, ellipse, path, polygon, line) berwarna cerah, tanpa teks/huruf, tanpa gambar eksternal, tanpa <script>. Keluarkan HANYA kode SVG.',{temp:0.5,max:4000});
  const s=svgClean(t);if(!s)throw new Error('SVG tidak valid');return svgUri(s);
}
async function aiGambar(desc,mode){
  if(!desc||mode==='none')return '';
  try{
    if(mode==='ai'&&AI.P[aiCfg().p||'gemini'].img){try{return await aiShrink(await aiImage(desc))}catch(e){if(/API key|Kuota/.test(e.message))throw e}}
    return await aiSvg(desc);
  }catch(e){if(/API key|Kuota/.test(e.message))throw e;return ''}
}
function aiShrink(uri,max){ // perkecil gambar AI (hemat memori & ukuran berkas Word)
  max=max||640;return new Promise(ok=>{const im=new Image();im.onload=()=>{const k=Math.min(1,max/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(im,0,0,c.width,c.height);ok(c.toDataURL('image/jpeg',0.85))};im.onerror=()=>ok(uri);im.src=uri})
}
async function aiPool(items,n,fn,prog){let i=0,done=0;const w=async()=>{while(i<items.length){const k=i++;try{await fn(items[k],k)}catch(e){if(/API key|Kuota/.test(e.message))throw e}done++;if(prog)prog(done,items.length)}};await Promise.all(Array.from({length:Math.min(n,items.length)||1},w))}
// ── ekspor: Word (MHT dengan gambar tertanam) & cetak ──
function aiDocHtml(inner,land){return '<div class="ai-doc">'+inner+'</div>'}
const AI_CSS=`body{font-family:'Times New Roman',serif;font-size:12pt;color:#000}.ai-doc{font-family:'Times New Roman',serif;font-size:12pt;line-height:1.35}h2,h3,h4{margin:6px 0}table{border-collapse:collapse}.q{margin:0 0 9px;page-break-inside:avoid}.q img{max-width:55mm;max-height:42mm;display:block;margin:3px 0}.opt{margin-left:18px}.dots{border-bottom:1px dotted #000;height:20px}.sec{background:#e5e7eb;padding:3px 8px;font-weight:bold;margin:10px 0 6px}.kunci{page-break-before:always}`;
function rasterSvg(uri){return new Promise(ok=>{const im=new Image();im.onload=()=>{const w=im.width||400,h=im.height||300,c=document.createElement('canvas');c.width=640;c.height=Math.round(640*h/w);const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(im,0,0,c.width,c.height);ok(c.toDataURL('image/png'))};im.onerror=()=>ok('');im.src=uri})}
async function aiWord(html,fname){
  const imgs=[];let n=0,out=html;const re=/<img\b([^>]*?)src="(data:[^"]+)"([^>]*)>/g,ms=[...html.matchAll(re)];
  const rep=await Promise.all(ms.map(async m=>{let d=m[2];if(/^data:image\/svg/.test(d))d=await rasterSvg(d);const mt=/^data:([^;]+);base64,(.*)$/.exec(d);if(!mt)return'';const nm='img'+(++n)+'.'+(mt[1].split('/')[1]||'png').replace('jpeg','jpg');imgs.push({n:nm,t:mt[1],b:mt[2]});return `<img${m[1]}src="${nm}"${m[3]}>`}));
  let i=0;out=html.replace(re,()=>rep[i++]);
  const doc='<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><style>@page Section1{size:595.3pt 841.9pt;margin:56pt 50pt 56pt 50pt}div.Section1{page:Section1}'+AI_CSS+'</style></head><body><div class="Section1">'+out+'</div></body></html>';
  const b64=s=>btoa(unescape(encodeURIComponent(s))).replace(/(.{76})/g,'$1\r\n'),B='----=_NextPart_APKSM';
  const mht=['MIME-Version: 1.0','Content-Type: multipart/related; boundary="'+B+'"; type="text/html"','','--'+B,'Content-Type: text/html; charset="utf-8"','Content-Transfer-Encoding: base64','Content-Location: file:///C:/dokumen.htm','',b64(doc)].concat(...imgs.map(g=>['--'+B,'Content-Type: '+g.t,'Content-Transfer-Encoding: base64','Content-Location: '+g.n,'',g.b.replace(/(.{76})/g,'$1\r\n')])).concat(['--'+B+'--','']).join('\r\n');
  dlBlob(fname+'.doc',new Blob([mht],{type:'application/msword'}));
}
function aiCetak(html){cetakA4('<style>'+AI_CSS+'</style>'+html)}
const aiKopHtml=()=>{const c=S.cfg||{},lg=thumb(c.logoUrl),l2=[c.alamat,c.telepon?'Telp. '+c.telepon:''].filter(Boolean).join(' | '),id=[c.npsn?'NPSN: '+c.npsn:'',c.nss?'NSS: '+c.nss:''].filter(Boolean).join('   ');
  return `<table style="width:100%;border-bottom:3px double #000;margin-bottom:8px"><tr><td style="width:70px;text-align:center">${lg?'<img alt="" src="'+lg+'" style="height:58px;max-width:60px">':''}</td><td style="text-align:center"><div style="font-size:15pt;font-weight:bold">${esc((c.schoolName||'').toUpperCase())}</div><div style="font-size:9pt">${esc(l2)}</div><div style="font-size:9pt">${esc(id)}</div></td><td style="width:70px"></td></tr></table>`};
const aiShuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const aiImgTag=u=>u?`<img alt="Ilustrasi" src="${u}">`:'';

// ============================================================
// GENERATOR SOAL
// ============================================================
const GS={data:null,f:null};
function renderGenSoal(){
  const c=aiCfg(),nk=!c.key;
  const tipe=(id,jd,def,max,ic)=>`<div class="col-md-6"><div class="card-x p-3 h-100"><div class="form-check form-switch mb-2"><input class="form-check-input" type="checkbox" id="gs_${id}" ${def>0?'checked':''} onchange="gsTog('${id}')"><label class="form-check-label fw-bold" for="gs_${id}"><i class="bi ${ic}"></i> ${jd}</label></div>
   <div class="row g-2 align-items-end" id="gsr_${id}"><div class="col-6"><label class="form-label small" for="gs_${id}_n">Jumlah ${id==='mj'?'pasangan':'soal'}</label><input type="number" min="1" max="${max}" id="gs_${id}_n" class="form-control" value="${def||5}"></div>
   <div class="col-6"><label class="form-label small" for="gs_${id}_g">Soal bergambar</label><input type="number" min="0" max="${max}" id="gs_${id}_g" class="form-control" value="0"></div>${id==='pg'?`<div class="col-12"><label class="form-label small" for="gs_opsi">Jumlah pilihan jawaban</label><select id="gs_opsi" class="form-select"><option>3</option><option selected>4</option><option>5</option></select></div>`:''}</div></div></div>`;
  $('app-container').innerHTML=`<div class="card-x p-3 mb-3"><div class="d-flex flex-wrap gap-2 align-items-center"><h2 class="h6 m-0 me-auto"><i class="bi bi-stars text-primary"></i> Generator Soal AI</h2><span class="pill ${nk?'bg-danger-subtle text-danger':'bg-success-subtle text-success'}">${nk?'API key belum diatur':'AI: '+esc(AI.P[c.p||'gemini'].n)}</span><button class="btn btn-sm btn-outline-primary" onclick="aiSettingsUI(renderGenSoal)"><i class="bi bi-key"></i> Pengaturan AI (API key saya)</button></div>
   <div class="row g-2 mt-1"><div class="col-md-4"><label class="form-label small fw-semibold" for="gsM">Mata pelajaran</label><input id="gsM" class="form-control" placeholder="mis. IPAS"></div><div class="col-6 col-md-2"><label class="form-label small fw-semibold" for="gsK">Kelas</label><select id="gsK" class="form-select">${[1,2,3,4,5,6].map(k=>`<option ${k===4?'selected':''}>${k}</option>`).join('')}</select></div>
   <div class="col-6 col-md-3"><label class="form-label small fw-semibold" for="gsL">Tingkat kesulitan</label><select id="gsL" class="form-select"><option>Campuran</option><option>Mudah</option><option>Sedang</option><option>Sulit (HOTS)</option></select></div>
   <div class="col-12 col-md-3"><label class="form-label small fw-semibold" for="gsJ">Judul naskah</label><input id="gsJ" class="form-control" value="Penilaian Harian"></div>
   <div class="col-12 col-md-8"><label class="form-label small fw-semibold" for="gsT">Topik / materi</label><input id="gsT" class="form-control" placeholder="mis. Siklus air dan perubahan wujud benda"></div>
   <div class="col-12 col-md-4"><label class="form-label small fw-semibold" for="gsW">Waktu</label><input id="gsW" class="form-control" value="60 menit"></div>
   <div class="col-12"><label class="form-label small fw-semibold" for="gsP">Tujuan pembelajaran (opsional)</label><input id="gsP" class="form-control" placeholder="mis. Peserta didik dapat menjelaskan proses siklus air"></div></div></div>
   <div class="row g-3 mb-3">${tipe('pg','Pilihan Ganda',10,40,'bi-ui-radios')}${tipe('is','Isian Singkat',0,30,'bi-pencil')}${tipe('mj','Menjodohkan',0,10,'bi-arrow-left-right')}${tipe('ur','Uraian',0,15,'bi-text-paragraph')}</div>
   <div class="card-x p-3 mb-3"><div class="row g-2 align-items-end"><div class="col-md-5"><label class="form-label small fw-semibold" for="gsG">Jenis gambar</label><select id="gsG" class="form-select"><option value="svg">Ilustrasi vektor (cepat & hemat)</option><option value="ai" ${AI.P[c.p||'gemini'].img?'':'disabled'}>Gambar AI (lebih realistis; butuh model gambar)</option></select></div>
   <div class="col-md-4"><div class="form-check mt-3"><input class="form-check-input" type="checkbox" id="gsKunci" checked><label class="form-check-label" for="gsKunci">Sertakan kunci & pembahasan</label></div></div><div class="col-md-3"><button class="btn btn-pri w-100" id="gsGo" onclick="gsBuat()"><i class="bi bi-magic"></i> Buat Soal</button></div></div>
   <div class="form-text mt-2">Soal bergambar = berapa soal pertama pada jenis itu yang diberi ilustrasi (0 = tanpa gambar). Gambar menambah waktu dan pemakaian kuota API.</div></div>
   <div id="gsOut"></div>`;
  ['pg','is','mj','ur'].forEach(gsTog);
}
function gsTog(id){const on=$('gs_'+id).checked;document.querySelectorAll('#gsr_'+id+' input,#gsr_'+id+' select').forEach(x=>x.disabled=!on);$('gsr_'+id).style.opacity=on?1:.45}
async function gsBuat(){
  if(!aiCfg().key){aiSettingsUI(gsBuat);return}
  const g=id=>$(id).value.trim(),n=(id)=>$('gs_'+id).checked?Math.max(0,Math.min(+$('gs_'+id+'_n').max,+$('gs_'+id+'_n').value||0)):0,gm=(id)=>Math.min(n(id),Math.max(0,+$('gs_'+id+'_g').value||0));
  const f={mapel:g('gsM'),kelas:g('gsK'),topik:g('gsT'),tp:g('gsP'),level:g('gsL'),judul:g('gsJ')||'Penilaian',waktu:g('gsW'),opsi:+$('gs_opsi').value,pg:n('pg'),is:n('is'),mj:n('mj'),ur:n('ur'),gpg:gm('pg'),gis:gm('is'),gmj:gm('mj'),gur:gm('ur'),mode:g('gsG'),kunci:$('gsKunci').checked};
  if(!f.mapel||!f.topik)return toast('Lengkapi','Mata pelajaran dan topik wajib diisi.','warning');
  if(f.pg+f.is+f.mj+f.ur<1)return toast('Pilih jenis soal','Aktifkan minimal satu jenis soal.','warning');
  const b=$('gsGo');b.disabled=true;const st=t=>{b.innerHTML='<span class="spinner-border spinner-border-sm"></span> '+t};st('Menyusun soal…');
  try{
    const sys='Anda guru SD dan penyusun soal ahli Kurikulum Merdeka. Soal harus benar secara konsep, tidak ambigu, sesuai usia, berbahasa Indonesia baku. Keluarkan HANYA JSON valid sesuai skema.';
    const bag=(k,gn,t)=>k?`- ${t}: ${k} butir; isi field "gambar" (deskripsi ilustrasi dalam bahasa Indonesia, maks 20 kata, tanpa teks pada gambar) HANYA untuk ${gn} butir pertama, selebihnya string kosong.\n`:'';
    const prompt=`Susun naskah soal.\nMata pelajaran: ${f.mapel}\nKelas: ${f.kelas} SD\nTopik: ${f.topik}\n${f.tp?'Tujuan pembelajaran: '+f.tp+'\n':''}Tingkat kesulitan: ${f.level}\n\nJenis & jumlah:\n${bag(f.pg,f.gpg,'Pilihan ganda ('+f.opsi+' pilihan: 1 benar, '+(f.opsi-1)+' pengecoh logis; hindari pilihan "semua benar/salah")')}${bag(f.is,f.gis,'Isian singkat (jawaban satu kata/angka/frasa pendek)')}${bag(f.mj,f.gmj,'Menjodohkan (jumlah PASANGAN)')}${bag(f.ur,f.gur,'Uraian (jawaban 2–5 kalimat)')}\nSkema JSON:\n{"pilihan_ganda":[{"soal":"","benar":"teks jawaban benar","salah":["pengecoh1","pengecoh2"],"pembahasan":"","gambar":""}],"isian":[{"soal":"kalimat dengan ........ untuk diisi","kunci":"","pembahasan":"","gambar":""}],"menjodohkan":{"petunjuk":"","pasangan":[{"kiri":"","kanan":"","gambar":""}]},"uraian":[{"soal":"","kunci":"poin-poin jawaban","skor":5,"pembahasan":"","gambar":""}]}\nJenis yang tidak diminta isi dengan array kosong ([]) atau objek menjodohkan dengan pasangan kosong. Jangan menulis apa pun selain JSON.`;
    const raw=await aiText(prompt,{system:sys,json:true,temp:0.7,max:12000});
    const d=aiJson(raw);GS.f=f;GS.data=gsRapikan(d,f);
    const items=[];GS.data.pg.forEach((x,i)=>{if(i<f.gpg&&x.gambar)items.push(x)});GS.data.is.forEach((x,i)=>{if(i<f.gis&&x.gambar)items.push(x)});GS.data.mj.forEach((x,i)=>{if(i<f.gmj&&x.gambar)items.push(x)});GS.data.ur.forEach((x,i)=>{if(i<f.gur&&x.gambar)items.push(x)});
    if(items.length&&f.mode!=='none'){await aiPool(items,2,async x=>{x.img=await aiGambar(x.gambar,f.mode)},(a,t)=>st('Membuat gambar '+a+'/'+t+'…'))}
    gsTampil();toast('Selesai','Naskah soal siap. Anda dapat mengedit langsung sebelum diunduh.','success');
  }catch(e){if(e.message==='NOKEY')aiSettingsUI(gsBuat);else fail(e)}
  finally{b.disabled=false;b.innerHTML='<i class="bi bi-magic"></i> Buat Soal'}
}
function gsRapikan(d,f){
  const L='ABCDE';
  const pg=(d.pilihan_ganda||[]).slice(0,f.pg).filter(x=>x&&x.soal&&x.benar).map(x=>{const op=aiShuf([String(x.benar)].concat((x.salah||[]).map(String).filter(Boolean)).slice(0,f.opsi));return{soal:x.soal,opsi:op,kunci:L[Math.max(0,op.indexOf(String(x.benar)))],benar:String(x.benar),pembahasan:x.pembahasan||'',gambar:x.gambar||''}});
  const is=(d.isian||[]).slice(0,f.is).filter(x=>x&&x.soal).map(x=>({soal:x.soal,kunci:String(x.kunci||''),pembahasan:x.pembahasan||'',gambar:x.gambar||''}));
  const pas=((d.menjodohkan||{}).pasangan||[]).slice(0,f.mj).filter(x=>x&&x.kiri&&x.kanan);
  const kanan=aiShuf(pas.map((x,i)=>({t:String(x.kanan),i:i}))),mj=pas.map((x,i)=>({kiri:String(x.kiri),gambar:x.gambar||'',huruf:L[kanan.findIndex(k=>k.i===i)]}));
  const ur=(d.uraian||[]).slice(0,f.ur).filter(x=>x&&x.soal).map(x=>({soal:x.soal,kunci:String(x.kunci||''),skor:+x.skor||5,pembahasan:x.pembahasan||'',gambar:x.gambar||''}));
  if(!pg.length&&!is.length&&!mj.length&&!ur.length)throw new Error('AI tidak menghasilkan soal yang valid. Coba buat ulang.');
  return{pg:pg,is:is,mj:mj,mjKanan:kanan.map(k=>k.t),mjPetunjuk:(d.menjodohkan||{}).petunjuk||'Jodohkan pernyataan di kiri dengan pasangan yang tepat di kanan dengan menulis hurufnya.',ur:ur};
}
function gsHtml(){
  const d=GS.data,f=GS.f,e=esc,L='ABCDE';let h=aiKopHtml();
  h+=`<div style="text-align:center"><div style="font-size:14pt;font-weight:bold;text-decoration:underline">${e(f.judul.toUpperCase())}</div><div style="font-size:11pt">${e(f.mapel)} — Kelas ${e(f.kelas)} — ${e(f.topik)}</div></div>
   <table style="width:100%;margin:8px 0;font-size:11pt"><tr><td>Nama : ................................</td><td>Kelas : ........</td><td>Hari/Tanggal : ......................</td><td>Waktu : ${e(f.waktu)}</td></tr></table>`;
  let sec='A';
  if(d.pg.length){h+=`<div class="sec">${sec}. PILIHAN GANDA</div><div style="font-size:11pt;margin-bottom:6px"><i>Pilihlah satu jawaban yang paling tepat dengan memberi tanda silang (X) pada huruf A, B, C${f.opsi>3?', D':''}${f.opsi>4?', atau E':''}!</i></div>`;
    h+=d.pg.map((q,i)=>`<div class="q"><div>${i+1}. ${e(q.soal)}</div>${aiImgTag(q.img)}${q.opsi.map((o,j)=>`<div class="opt">${L[j]}. ${e(o)}</div>`).join('')}</div>`).join('');sec=String.fromCharCode(sec.charCodeAt(0)+1)}
  if(d.is.length){h+=`<div class="sec">${sec}. ISIAN SINGKAT</div><div style="font-size:11pt;margin-bottom:6px"><i>Isilah titik-titik berikut dengan jawaban yang benar!</i></div>`+d.is.map((q,i)=>`<div class="q"><div>${i+1}. ${e(q.soal)}</div>${aiImgTag(q.img)}</div>`).join('');sec=String.fromCharCode(sec.charCodeAt(0)+1)}
  if(d.mj.length){h+=`<div class="sec">${sec}. MENJODOHKAN</div><div style="font-size:11pt;margin-bottom:6px"><i>${e(d.mjPetunjuk)}</i></div><table style="width:100%" cellpadding="4"><tr><td style="width:55%;vertical-align:top">${d.mj.map((m,i)=>`<div class="q">( &nbsp; ) ${i+1}. ${e(m.kiri)}${aiImgTag(m.img)}</div>`).join('')}</td><td style="vertical-align:top">${d.mjKanan.map((t,i)=>`<div class="q">${L[i]}. ${e(t)}</div>`).join('')}</td></tr></table>`;sec=String.fromCharCode(sec.charCodeAt(0)+1)}
  if(d.ur.length){h+=`<div class="sec">${sec}. URAIAN</div><div style="font-size:11pt;margin-bottom:6px"><i>Jawablah pertanyaan berikut dengan jelas dan lengkap!</i></div>`+d.ur.map((q,i)=>`<div class="q"><div>${i+1}. ${e(q.soal)}</div>${aiImgTag(q.img)}<div class="dots"></div><div class="dots"></div><div class="dots"></div></div>`).join('')}
  if(f.kunci){h+=`<div class="kunci"><h3 style="text-align:center">KUNCI JAWABAN & PEMBAHASAN</h3><div style="text-align:center;font-size:11pt">${e(f.judul)} — ${e(f.mapel)} Kelas ${e(f.kelas)}</div>`;
    if(d.pg.length)h+=`<div class="sec">A. Pilihan Ganda</div><table cellpadding="3" style="width:100%">${d.pg.map((q,i)=>`<tr><td style="width:40px"><b>${i+1}.</b></td><td style="width:40px"><b>${q.kunci}</b></td><td>${e(q.benar)}${q.pembahasan?' — <i>'+e(q.pembahasan)+'</i>':''}</td></tr>`).join('')}</table>`;
    if(d.is.length)h+=`<div class="sec">Isian Singkat</div><table cellpadding="3" style="width:100%">${d.is.map((q,i)=>`<tr><td style="width:40px"><b>${i+1}.</b></td><td>${e(q.kunci)}${q.pembahasan?' — <i>'+e(q.pembahasan)+'</i>':''}</td></tr>`).join('')}</table>`;
    if(d.mj.length)h+=`<div class="sec">Menjodohkan</div><div>${d.mj.map((m,i)=>`${i+1} – ${m.huruf}`).join(' &nbsp;|&nbsp; ')}</div>`;
    if(d.ur.length)h+=`<div class="sec">Uraian</div>`+d.ur.map((q,i)=>`<div class="q"><b>${i+1}.</b> ${e(q.kunci)} <i>(skor ${q.skor})</i>${q.pembahasan?'<div style="font-size:11pt">'+e(q.pembahasan)+'</div>':''}</div>`).join('');
    h+='</div>'}
  return h;
}
function gsTampil(){
  $('gsOut').innerHTML=`<div class="card-x p-3"><div class="d-flex flex-wrap gap-2 mb-3"><button class="btn btn-sm btn-pri" onclick="aiWord($('gsDoc').innerHTML,'Naskah_Soal_'+gsNama())"><i class="bi bi-file-earmark-word"></i> Unduh Word</button><button class="btn btn-sm btn-outline-secondary" onclick="aiCetak($('gsDoc').innerHTML)"><i class="bi bi-printer"></i> Cetak / PDF</button><button class="btn btn-sm btn-outline-success" onclick="gsBank()"><i class="bi bi-collection"></i> Simpan ke Bank Soal</button><button class="btn btn-sm btn-outline-secondary" onclick="gsSalin()"><i class="bi bi-clipboard"></i> Salin teks</button><span class="small text-secondary ms-auto align-self-center">Klik pada naskah untuk mengedit langsung.</span></div>
   <div id="gsDoc" class="ai-paper" contenteditable="true">${gsHtml()}</div></div>`;
  $('gsOut').scrollIntoView({behavior:'smooth'});
}
const gsNama=()=>String(GS.f.mapel+'_Kelas'+GS.f.kelas).replace(/\W+/g,'_');
const gsSalin=()=>navigator.clipboard.writeText($('gsDoc').innerText).then(()=>toast('Tersalin','Teks naskah disalin.','success'),()=>toast('Gagal','Peramban tidak mengizinkan salin.','warning'));
async function gsBank(){
  const d=GS.data,f=GS.f,rows=[];
  d.pg.forEach(q=>{if(q.opsi.length>4)return;const r={Mapel:f.mapel,Soal:q.soal,Kelas:f.kelas,Topik:f.topik,Tipe:'Pilihan Ganda',A:q.opsi[0]||'',B:q.opsi[1]||'',C:q.opsi[2]||'',D:q.opsi[3]||'',Kunci:q.kunci,Level:f.level==='Campuran'?'Sedang':f.level.replace(' (HOTS)',''),Pembahasan:q.pembahasan};rows.push(r)});
  d.is.forEach(q=>rows.push({Mapel:f.mapel,Soal:q.soal,Kelas:f.kelas,Topik:f.topik,Tipe:'Isian Singkat',Kunci:q.kunci,Level:'Sedang',Pembahasan:q.pembahasan}));
  d.ur.forEach(q=>rows.push({Mapel:f.mapel,Soal:q.soal,Kelas:f.kelas,Topik:f.topik,Tipe:'Uraian',Kunci:q.kunci,Level:'Sedang',Pembahasan:q.pembahasan}));
  if(!rows.length)return toast('Kosong','Tidak ada soal yang dapat disimpan (pilihan ganda 5 opsi tidak didukung Bank Soal).','warning');
  try{const r=await net('importData','banksoal',rows);toast('Tersimpan',r.berhasil+' soal masuk ke Bank Soal (gambar tidak ikut tersimpan).','success')}catch(e){fail(e)}
}

// ============================================================
// GENERATOR LKPD BERGAMBAR
// ============================================================
const LK={data:null,f:null};
const LK_TEMA={Ungu:['#7C3AED','#EDE9FE'],Hijau:['#059669','#D1FAE5'],Oranye:['#EA580C','#FFEDD5'],Biru:['#2563EB','#DBEAFE'],Merah:['#DC2626','#FEE2E2']};
function renderLkpd(){
  const c=aiCfg(),nk=!c.key;
  $('app-container').innerHTML=`<div class="card-x p-3 mb-3"><div class="d-flex flex-wrap gap-2 align-items-center"><h2 class="h6 m-0 me-auto"><i class="bi bi-brush text-primary"></i> Generator LKPD Bergambar (Lembar Kerja Peserta Didik)</h2><span class="pill ${nk?'bg-danger-subtle text-danger':'bg-success-subtle text-success'}">${nk?'API key belum diatur':'AI: '+esc(AI.P[c.p||'gemini'].n)}</span><button class="btn btn-sm btn-outline-primary" onclick="aiSettingsUI(renderLkpd)"><i class="bi bi-key"></i> Pengaturan AI (API key saya)</button></div>
   <div class="row g-2 mt-1"><div class="col-md-4"><label class="form-label small fw-semibold" for="lkM">Mata pelajaran</label><input id="lkM" class="form-control" placeholder="mis. Matematika"></div><div class="col-6 col-md-2"><label class="form-label small fw-semibold" for="lkK">Kelas</label><select id="lkK" class="form-select">${[1,2,3,4,5,6].map(k=>`<option ${k===4?'selected':''}>${k}</option>`).join('')}</select></div>
   <div class="col-6 col-md-3"><label class="form-label small fw-semibold" for="lkN">Jumlah kegiatan</label><select id="lkN" class="form-select">${[1,2,3,4,5].map(k=>`<option ${k===3?'selected':''}>${k}</option>`).join('')}</select></div>
   <div class="col-12 col-md-3"><label class="form-label small fw-semibold" for="lkW">Warna tema</label><select id="lkW" class="form-select">${Object.keys(LK_TEMA).map(k=>`<option>${k}</option>`).join('')}</select></div>
   <div class="col-12 col-md-8"><label class="form-label small fw-semibold" for="lkT">Topik / materi</label><input id="lkT" class="form-control" placeholder="mis. Mengenal pecahan setengah dan seperempat"></div>
   <div class="col-12 col-md-4"><label class="form-label small fw-semibold" for="lkG">Gambar</label><select id="lkG" class="form-select"><option value="svg">Ilustrasi vektor (cepat & hemat)</option><option value="ai" ${AI.P[c.p||'gemini'].img?'':'disabled'}>Gambar AI (lebih realistis)</option><option value="none">Tanpa gambar</option></select></div>
   <div class="col-12"><label class="form-label small fw-semibold" for="lkP">Tujuan pembelajaran (opsional)</label><input id="lkP" class="form-control" placeholder="mis. Peserta didik dapat membagi benda menjadi bagian yang sama besar"></div>
   <div class="col-12"><div class="small fw-semibold mb-1">Jenis aktivitas yang diinginkan</div><div class="d-flex flex-wrap gap-3">${['Mengamati','Menghitung','Menggambar/mewarnai','Menulis/menjawab','Menjodohkan','Percobaan sederhana','Diskusi kelompok'].map((a,i)=>`<div class="form-check"><input class="form-check-input lkA" type="checkbox" value="${esc(a)}" id="lka${i}" ${i<4?'checked':''}><label class="form-check-label small" for="lka${i}">${a}</label></div>`).join('')}</div></div>
   <div class="col-md-8"><div class="d-flex flex-wrap gap-3 mt-1"><div class="form-check"><input class="form-check-input" type="checkbox" id="lkR" checked><label class="form-check-label small" for="lkR">Refleksi (emoji)</label></div><div class="form-check"><input class="form-check-input" type="checkbox" id="lkKg" checked><label class="form-check-label small" for="lkKg">Kunci jawaban guru (halaman terpisah)</label></div><div class="form-check"><input class="form-check-input" type="checkbox" id="lkNl" checked><label class="form-check-label small" for="lkNl">Kolom penilaian guru</label></div></div></div>
   <div class="col-md-4"><button class="btn btn-pri w-100" id="lkGo" onclick="lkBuat()"><i class="bi bi-magic"></i> Buat LKPD</button></div></div></div><div id="lkOut"></div>`;
}
async function lkBuat(){
  if(!aiCfg().key){aiSettingsUI(lkBuat);return}
  const g=id=>$(id).value.trim(),f={mapel:g('lkM'),kelas:g('lkK'),n:+g('lkN'),tema:g('lkW'),topik:g('lkT'),tp:g('lkP'),mode:g('lkG'),akt:[...document.querySelectorAll('.lkA:checked')].map(x=>x.value),refleksi:$('lkR').checked,kunci:$('lkKg').checked,nilai:$('lkNl').checked};
  if(!f.mapel||!f.topik)return toast('Lengkapi','Mata pelajaran dan topik wajib diisi.','warning');
  const b=$('lkGo');b.disabled=true;const st=t=>{b.innerHTML='<span class="spinner-border spinner-border-sm"></span> '+t};st('Menyusun LKPD…');
  try{
    const kecil=+f.kelas<=2;
    const sys='Anda guru SD kreatif penyusun LKPD (Lembar Kerja Peserta Didik) Kurikulum Merdeka yang menarik, runtut, dan sesuai usia. Bahasa Indonesia yang mudah dipahami anak. Keluarkan HANYA JSON valid.';
    const prompt=`Susun LKPD.\nMata pelajaran: ${f.mapel}\nKelas: ${f.kelas} SD${kecil?' (kalimat sangat pendek, banyak aktivitas visual)':''}\nTopik: ${f.topik}\n${f.tp?'Tujuan pembelajaran: '+f.tp+'\n':''}Jumlah kegiatan: ${f.n}\nJenis aktivitas yang boleh dipakai: ${f.akt.join(', ')||'bebas'}\n\nAturan: tiap kegiatan punya cerita pengantar singkat, langkah kerja bernomor, dan 2–4 tugas bervariasi. Field "gambar" = deskripsi ilustrasi dalam bahasa Indonesia (maks 20 kata, tanpa teks pada gambar) yang mendukung kegiatan. Tugas bertipe: "isian" (baris_jawab 1–3), "pilihan" (opsi 3–4), "centang" (opsi 3–5), "tabel" (kolom 2–4 judul, baris 2–5), "gambar" (anak menggambar/mewarnai di kotak), "menjodohkan" (pasangan 3–5 berisi kiri/kanan).\nSkema JSON:\n{"judul":"","subjudul":"","gambar_sampul":"","tujuan":["..."],"alat_bahan":["..."],"petunjuk":["..."],"kegiatan":[{"judul":"","cerita":"","gambar":"","langkah":["..."],"tugas":[{"tipe":"isian","pertanyaan":"","baris_jawab":2,"kunci":""},{"tipe":"pilihan","pertanyaan":"","opsi":["",""],"kunci":""},{"tipe":"centang","pertanyaan":"","opsi":[""]},{"tipe":"tabel","pertanyaan":"","kolom":["",""],"baris":3},{"tipe":"gambar","pertanyaan":""},{"tipe":"menjodohkan","pertanyaan":"","pasangan":[{"kiri":"","kanan":""}]}]}],"refleksi":["..."]}`;
    const d=aiJson(await aiText(prompt,{system:sys,json:true,temp:0.8,max:12000}));
    if(!Array.isArray(d.kegiatan)||!d.kegiatan.length)throw new Error('AI tidak menghasilkan kegiatan. Coba buat ulang.');
    LK.f=f;LK.data=d;
    if(f.mode!=='none'){const items=[];if(d.gambar_sampul)items.push({o:d,k:'imgS',t:d.gambar_sampul});d.kegiatan.forEach(k=>{if(k.gambar)items.push({o:k,k:'img',t:k.gambar})});
      await aiPool(items,2,async x=>{x.o[x.k]=await aiGambar(x.t,f.mode)},(a,t)=>st('Membuat gambar '+a+'/'+t+'…'))}
    lkTampil();toast('Selesai','LKPD siap. Anda dapat mengedit teks langsung sebelum diunduh.','success');
  }catch(e){if(e.message==='NOKEY')aiSettingsUI(lkBuat);else fail(e)}
  finally{b.disabled=false;b.innerHTML='<i class="bi bi-magic"></i> Buat LKPD'}
}
function lkHtml(){
  const d=LK.data,f=LK.f,[c1,c2]=LK_TEMA[f.tema]||LK_TEMA.Ungu,e=esc,li=a=>(a||[]).map(x=>`<li>${e(x)}</li>`).join('');
  const box=(t,ic,body,bg)=>`<div style="border:2px solid ${c1};border-radius:10px;margin:8px 0;page-break-inside:avoid"><div style="background:${bg||c1};color:${bg?c1:'#fff'};font-weight:bold;padding:4px 10px;border-radius:7px 7px 0 0">${ic} ${t}</div><div style="padding:6px 12px">${body}</div></div>`;
  let h=aiKopHtml();
  h+=`<div style="background:${c1};color:#fff;border-radius:14px;padding:10px 14px;margin-bottom:6px"><table style="width:100%"><tr><td><div style="font-size:11pt;opacity:.9">LEMBAR KERJA PESERTA DIDIK (LKPD)</div><div style="font-size:19pt;font-weight:bold;line-height:1.15">${e(d.judul||f.topik)}</div><div style="font-size:11pt">${e(d.subjudul||'')}</div><div style="font-size:11pt;margin-top:3px">${e(f.mapel)} · Kelas ${e(f.kelas)}</div></td>${d.imgS?`<td style="width:140px;text-align:right"><img src="${d.imgS}" alt="" style="max-height:95px;background:#fff;border-radius:10px"></td>`:''}</tr></table></div>
   <table style="width:100%;font-size:11pt;margin:6px 0"><tr><td>Nama : ........................................</td><td>Kelas : ...........</td><td>Tanggal : ...................</td></tr></table>`;
  if((d.tujuan||[]).length)h+=box('Tujuan Belajar','🎯',`<ol style="margin:2px 0 2px 18px">${li(d.tujuan)}</ol>`,c2);
  if((d.alat_bahan||[]).length)h+=box('Alat dan Bahan','🧰',`<ul style="margin:2px 0 2px 18px">${li(d.alat_bahan)}</ul>`,c2);
  if((d.petunjuk||[]).length)h+=box('Petunjuk','📌',`<ol style="margin:2px 0 2px 18px">${li(d.petunjuk)}</ol>`,c2);
  (d.kegiatan||[]).forEach((k,i)=>{
    let body=`<table style="width:100%"><tr><td style="vertical-align:top">${k.cerita?`<div style="margin-bottom:4px">${e(k.cerita)}</div>`:''}${(k.langkah||[]).length?`<div style="font-weight:bold">Langkah kerja:</div><ol style="margin:2px 0 2px 18px">${li(k.langkah)}</ol>`:''}</td>${k.img?`<td style="width:170px;vertical-align:top;text-align:right"><img src="${k.img}" alt="" style="max-width:165px;max-height:125px;border-radius:8px;border:1px solid ${c1}"></td>`:''}</tr></table>`;
    (k.tugas||[]).forEach((t,j)=>{body+=lkTugas(t,j+1,c1,c2)});
    h+=`<div style="border:2px solid ${c1};border-radius:10px;margin:10px 0"><div style="background:${c1};color:#fff;font-weight:bold;padding:5px 10px;border-radius:7px 7px 0 0"><span style="background:#fff;color:${c1};border-radius:50%;padding:1px 8px;margin-right:6px">${i+1}</span>${e((k.judul||'Kegiatan '+(i+1)).replace(/^kegiatan\s*\d+\s*[:.\-]?\s*/i,''))}</div><div style="padding:8px 12px">${body}</div></div>`;
  });
  if(f.refleksi)h+=box('Refleksi — Bagaimana perasaanmu?','💭',`${(d.refleksi||['Apa yang paling kamu sukai hari ini?']).map(r=>`<div style="margin:4px 0">${e(r)} &nbsp; 😀 &nbsp; 🙂 &nbsp; 😐 &nbsp; 🙁</div>`).join('')}`,c2);
  if(f.nilai)h+=`<table border="1" cellpadding="6" style="width:100%;margin-top:8px;font-size:10.5pt;page-break-inside:avoid"><tr style="background:${c2}"><td style="width:35%"><b>Penilaian guru</b></td><td>⭐ Perlu bimbingan &nbsp;&nbsp; ⭐⭐ Cukup &nbsp;&nbsp; ⭐⭐⭐ Baik &nbsp;&nbsp; ⭐⭐⭐⭐ Sangat baik</td></tr><tr><td>Catatan guru</td><td style="height:34px"></td></tr></table>`;
  if(f.kunci){const kj=[];(d.kegiatan||[]).forEach((k,i)=>(k.tugas||[]).forEach((t,j)=>{const a=t.kunci||(t.tipe==='menjodohkan'?(t.pasangan||[]).map(p=>p.kiri+' → '+p.kanan).join('; '):'');if(a)kj.push(`<div><b>Kegiatan ${i+1}, tugas ${j+1}:</b> ${e(a)}</div>`)}));
    h+=`<div class="kunci" style="page-break-before:always"><h3 style="text-align:center">KUNCI JAWABAN (UNTUK GURU)</h3>${kj.join('')||'<div>Jawaban bersifat terbuka; nilai berdasarkan kesesuaian dengan tujuan belajar.</div>'}</div>`}
  return h;
}
function lkTugas(t,no,c1,c2){
  const e=esc,q=`<div style="margin:6px 0 3px"><b>${no}.</b> ${e(t.pertanyaan||'')}</div>`,tp=t.tipe;
  if(tp==='pilihan')return q+(t.opsi||[]).map((o,i)=>`<div style="margin-left:20px">◯ ${'ABCD'[i]||''}. ${e(o)}</div>`).join('');
  if(tp==='centang')return q+(t.opsi||[]).map(o=>`<div style="margin-left:20px">☐ ${e(o)}</div>`).join('');
  if(tp==='tabel'){const cols=(t.kolom||['','']).slice(0,4),n=Math.min(6,Math.max(2,+t.baris||3));return q+`<table border="1" cellpadding="6" style="width:100%;border-collapse:collapse;margin:3px 0"><tr style="background:${c2}">${cols.map(c=>`<th>${e(c)}</th>`).join('')}</tr>${Array.from({length:n},()=>`<tr>${cols.map(()=>'<td style="height:24px"></td>').join('')}</tr>`).join('')}</table>`}
  if(tp==='gambar')return q+`<div style="border:2px dashed ${c1};border-radius:10px;height:110px;margin:3px 0;text-align:center;color:#999;padding-top:45px">Gambar / warnai di sini</div>`;
  if(tp==='menjodohkan'){const ps=(t.pasangan||[]).slice(0,6),r=aiShuf(ps.map(p=>p.kanan));return q+`<table style="width:100%;margin:3px 0"><tr><td style="width:45%">${ps.map(p=>`<div style="margin:5px 0">${e(p.kiri)} <b>●</b></div>`).join('')}</td><td style="width:10%"></td><td>${r.map(x=>`<div style="margin:5px 0"><b>●</b> ${e(x)}</div>`).join('')}</td></tr></table>`}
  const n=Math.min(4,Math.max(1,+t.baris_jawab||2));return q+Array.from({length:n},()=>'<div class="dots"></div>').join('');
}
function lkTampil(){
  $('lkOut').innerHTML=`<div class="card-x p-3"><div class="d-flex flex-wrap gap-2 mb-3"><button class="btn btn-sm btn-pri" onclick="aiWord($('lkDoc').innerHTML,'LKPD_'+lkNama())"><i class="bi bi-file-earmark-word"></i> Unduh Word</button><button class="btn btn-sm btn-outline-secondary" onclick="aiCetak($('lkDoc').innerHTML)"><i class="bi bi-printer"></i> Cetak / PDF</button><span class="small text-secondary ms-auto align-self-center">Klik pada lembar untuk mengedit teks langsung.</span></div><div id="lkDoc" class="ai-paper" contenteditable="true">${lkHtml()}</div></div>`;
  $('lkOut').scrollIntoView({behavior:'smooth'});
}
const lkNama=()=>String(LK.f.mapel+'_'+LK.f.topik).replace(/\W+/g,'_').slice(0,50);
