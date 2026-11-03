let csrf='';
export function setCsrf(token){csrf=token;}
export async function api(route,method='GET',body){
 const separator=route.indexOf('?');const path=separator<0?route:route.slice(0,separator);const query=separator<0?'':route.slice(separator+1);
 const url='../backend/public/index.php?route='+encodeURIComponent(path)+(query?'&'+query:'');
 let response;try{response=await fetch(url,{method,credentials:'same-origin',headers:{'Content-Type':'application/json','X-CSRF-Token':csrf},...(body===undefined?{}:{body:JSON.stringify(body)})});}catch{throw new Error('Não foi possível conectar. Verifique sua conexão e o servidor.');}
 let payload;try{payload=await response.json();}catch{throw new Error('O servidor não retornou JSON. Confira a instalação do PHP.');}
 if(!response.ok){if(response.status===401&&!route.startsWith('/auth/'))location.href='login.html';throw new Error(payload.error||'Não foi possível concluir a operação.');}
 if(payload.data?.csrf)setCsrf(payload.data.csrf);return payload.data;
}
