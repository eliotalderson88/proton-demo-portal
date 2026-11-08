'use strict';
const form = document.getElementById('login-form');
const username = document.getElementById('username');
const password = document.getElementById('password');
const keyboardTrigger = document.getElementById('keyboard-trigger');
const keyboardPanel = document.getElementById('virtual-keyboard');
const keyboardRows = document.getElementById('keyboard-rows');
const feedback = document.getElementById('form-feedback');
const togglePassword = document.getElementById('toggle-password');
let activeInput = username;

[username,password].forEach(input=>{
  input.addEventListener('focus',()=>{
    activeInput=input;
    input.closest('.field-group').classList.add('is-active');
  });
  input.addEventListener('blur',()=>input.closest('.field-group').classList.remove('is-active'));
});

togglePassword.addEventListener('click',()=>{
  const visible=password.type==='password';
  password.type=visible?'text':'password';
  togglePassword.setAttribute('aria-pressed',String(visible));
  togglePassword.setAttribute('aria-label',visible?'Ocultar clave':'Mostrar clave');
  password.focus();
});

const rows=[
  ['1','2','3','4','5','6','7','8','9','0'],
  ['q','w','e','r','t','y','u','i','o','p'],
  ['a','s','d','f','g','h','j','k','l','ñ'],
  ['⇧','z','x','c','v','b','n','m','⌫'],
  ['?123',',','ESPACIO','.','↵']
];
rows.forEach((keys,rowIndex)=>{
  const row=document.createElement('div'); row.className='key-row';
  keys.forEach(key=>{
    const button=document.createElement('button'); button.type='button'; button.className='key';
    if(['⇧','⌫','?123','↵'].includes(key)) button.classList.add('wide');
    if(key==='ESPACIO') button.classList.add('space');
    button.textContent=key; button.setAttribute('aria-label',key==='ESPACIO'?'Espacio':key);
    button.addEventListener('click',()=>insertKey(key)); row.appendChild(button);
  });
  keyboardRows.appendChild(row);
});
let shifted=false;
function insertKey(key){
  if(key==='⇧'){shifted=!shifted;return;}
  const start=activeInput.selectionStart??activeInput.value.length;
  const end=activeInput.selectionEnd??activeInput.value.length;
  let next=activeInput.value;
  if(key==='⌫'){
    if(start===end&&start>0) next=next.slice(0,start-1)+next.slice(end);
    else next=next.slice(0,start)+next.slice(end);
    activeInput.value=next; activeInput.setSelectionRange(Math.max(0,start-(start===end?1:0)),Math.max(0,start-(start===end?1:0)));
  }else if(key==='↵'){
    if(activeInput===username){activeInput=password;password.focus();}else{form.requestSubmit();}
  }else{
    let value=key==='ESPACIO'?' ':key;
    if(shifted)value=value.toLocaleUpperCase('es');
    next=next.slice(0,start)+value+next.slice(end);
    activeInput.value=next;const pos=start+value.length;activeInput.setSelectionRange(pos,pos);shifted=false;
  }
  activeInput.dispatchEvent(new Event('input',{bubbles:true})); activeInput.focus();
}
keyboardTrigger.addEventListener('click',()=>{
  const opening=keyboardPanel.hidden;
  keyboardPanel.hidden=!opening;
  keyboardTrigger.setAttribute('aria-expanded',String(opening));
  if(opening){
    requestAnimationFrame(()=>keyboardPanel.scrollIntoView({behavior:'smooth',block:'nearest'}));
  }
});

form.addEventListener('submit',async event=>{
  event.preventDefault(); feedback.textContent='';
  const user=username.value.trim(), pass=password.value;
  document.querySelectorAll('.field-group').forEach(group=>group.classList.remove('is-invalid'));
  if(!user||!pass){
    if(!user)username.closest('.field-group').classList.add('is-invalid');
    if(!pass)password.closest('.field-group').classList.add('is-invalid');
    feedback.textContent='Completá tu usuario y tu clave.'; (!user?username:password).focus(); return;
  }
  const submit=form.querySelector('.submit-button'); submit.disabled=true; submit.textContent='Ingresando…';
  try{
    const response=await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:user,password:pass})});
    const result=await response.json(); feedback.textContent=result.message||'No se pudo iniciar sesión.';
    if(result.ok) feedback.style.color='#008b3b'; else feedback.style.color='#b3261e';
  }catch(error){feedback.textContent='No se pudo conectar con el servidor.';feedback.style.color='#b3261e';}
  finally{submit.disabled=false;submit.textContent='Ingresar';}
});

// Los cuatro enlaces conservan su ubicación y su apariencia; no se inventan destinos.
document.querySelectorAll('.links a').forEach(link=>link.addEventListener('click',event=>{
  event.preventDefault();
  feedback.style.color='#666';
  feedback.textContent='Este acceso necesita que se configure su destino correspondiente.';
}));
