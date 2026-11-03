"""Teste integrado em servidor configurado. Cria e exclui duas contas próprias."""
import json, urllib.request, urllib.error, http.cookiejar, uuid, sys, datetime
BASE=(sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8000').rstrip('/')
checks=0
class Client:
 def __init__(self):
  self.opener=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()));self.csrf='';self.created=False
 def call(self,path,method='GET',data=None,status=200,csrf=True):
  global checks
  route,sep,query=path.partition('?')
  from urllib.parse import quote
  req=urllib.request.Request(BASE+'/backend/public/index.php?route='+quote(route,safe='')+('&'+query if sep else ''),data=None if data is None else json.dumps(data).encode(),method=method,headers={'Content-Type':'application/json','X-CSRF-Token':self.csrf if csrf else ''})
  try:
   response=self.opener.open(req);code=response.status;payload=json.load(response)
  except urllib.error.HTTPError as e:code=e.code;payload=json.load(e)
  assert code==status,(path,code,status,payload)
  checks+=1
  result=payload.get('data',payload)
  if isinstance(result,dict) and result.get('csrf'):self.csrf=result['csrf']
  return result
 def signup(self):
  self.call('/auth/me');self.email='forza-test-'+uuid.uuid4().hex+'@example.test';self.password='TesteSeguro!2026'
  self.call('/auth/cadastro','POST',{'nome':'Teste integração','email':self.email,'senha':self.password});self.created=True
 def cleanup(self):
  if self.created:
   self.call('/auth/conta','DELETE',{'confirmacao':'EXCLUIR','senha':self.password});self.created=False

a,b=Client(),Client()
try:
 a.call('/dashboard',status=401)
 a.call('/auth/login','POST',{'email':'a@example.test','senha':'12345678'},status=403,csrf=False)
 a.signup();b.signup()
 profile={'nome':'Pessoa de teste','idade':24,'altura':175,'peso':70,'objetivo_id':2,'nivel':'iniciante','dias_semana':3,'minutos_treino':45,'equipamentos':'Halteres','unidade_carga':'kg'}
 a.call('/perfil','PUT',{**profile,'idade':12},422)
 a.call('/perfil','PUT',profile)
 tips=a.call('/dicas');assert tips and all(int(t['objetivo_id'])==2 for t in tips)
 a.call('/perfil','PUT',{**profile,'objetivo_id':1})
 assert all(int(t['objetivo_id'])==1 for t in a.call('/dicas'))
 a.call('/perfil','PUT',profile)
 exercises=a.call('/exercicios');assert len(exercises)>=10
 exercise={'exercicio_id':int(exercises[0]['id']),'series':2,'repeticoes':10,'carga':20,'descanso':1}
 workout={'nome':'Treino integração','dias':[1,3,5],'exercicios':[exercise]}
 a.call('/treinos','POST',{**workout,'exercicios':[]},422)
 a.call('/treinos','POST',{**workout,'dias':[8]},422)
 wid=a.call('/treinos','POST',workout)['id']
 assert len(a.call('/treinos'))==1
 b.call('/treinos/'+str(wid),'PUT',workout,404)
 b.call('/treinos/'+str(wid),'DELETE',{},404)
 assert b.call('/treinos')==[]
 sid=a.call('/sessoes','POST',{'treino_id':wid})['id']
 a.call('/sessoes','POST',{'treino_id':wid},409)
 b.call('/sessoes/'+str(sid)+'/finalizar','POST',{},404)
 a.call('/sessoes/'+str(sid)+'/finalizar','POST',{},422)
 session=a.call('/sessoes')[0];assert len(session['series'])==2
 setid=session['series'][0]['id'];path=f'/sessoes/{sid}/series/{setid}'
 b.call(path,'PUT',{'repeticoes':10,'carga':25,'concluida':1},404)
 a.call(path,'PUT',{'repeticoes':10,'carga':-2,'concluida':1},422)
 a.call(path,'PUT',{'repeticoes':12,'carga':25,'concluida':1})
 a.call('/sessoes/'+str(sid)+'/finalizar','POST',{})
 a.call(path,'PUT',{'repeticoes':10,'carga':20,'concluida':0},409)
 a.call('/treinos/'+str(wid),'PUT',{**workout,'nome':'Plano alterado','exercicios':[{**exercise,'carga':30}]})
 assert float(a.call('/sessoes')[0]['series'][0]['carga'])==25
 today=datetime.date.today().isoformat()
 foods=a.call('/alimentos?q=Arroz');assert any(int(f['id'])==3 for f in foods)
 meal={'nome':'Almoço','data':today,'alimentos':[{'alimento_id':3,'gramas':200}]}
 mid=a.call('/refeicoes','POST',meal)['id']
 fetched=a.call('/refeicoes?data='+today);assert float(fetched[0]['alimentos'][0]['calorias'])==256
 b.call('/refeicoes/'+str(mid),'PUT',meal,404)
 a.call('/refeicoes/'+str(mid),'PUT',{**meal,'alimentos':[{'alimento_id':3,'gramas':100}]})
 assert float(a.call('/refeicoes?data='+today)[0]['alimentos'][0]['calorias'])==128
 a.call('/pesos','POST',{'data':'2026-02-30','peso':70},422)
 a.call('/pesos','POST',{'data':today,'peso':70})
 a.call('/pesos','POST',{'data':today,'peso':71})
 a.call('/medidas','POST',{'data':today,'cintura':80,'quadril':95,'braco':32})
 progress=a.call('/progresso');assert len(progress['pesos'])==1 and float(progress['pesos'][0]['peso'])==71
 assert len(progress['cargas'])==1
 b.call('/pesos/'+str(progress['pesos'][0]['id']),'DELETE',{},404)
 dashboard=a.call('/dashboard');assert int(dashboard['estatisticas']['total'])==1
 a.call('/auth/senha','PUT',{'senha_atual':'errada','nova_senha':' NovaSenha!2026 '},422)
 a.call('/auth/senha','PUT',{'senha_atual':a.password,'nova_senha':' NovaSenha!2026 '});a.password=' NovaSenha!2026 '
 a.call('/auth/logout','POST',{});a.call('/progresso',status=401)
 a.call('/auth/me');a.call('/auth/login','POST',{'email':a.email,'senha':a.password})
 a.call('/refeicoes/'+str(mid),'DELETE',{})
 a.call('/treinos/'+str(wid),'DELETE',{})
 assert a.call('/sessoes')[0]['treino_id'] is None
 a.call('/medidas/'+str(progress['medidas'][0]['id']),'DELETE',{})
 a.call('/pesos/'+str(progress['pesos'][0]['id']),'DELETE',{})
 a.cleanup();b.cleanup()
 assert a.call('/auth/me')['user'] is None
 print(json.dumps({'status':'passed','requisicoes_verificadas':checks,'fluxos':'auth, CSRF, perfis, isolamento, treinos, series, refeicoes, calculos, progresso, exclusao'},ensure_ascii=False))
finally:
 for c in (a,b):
  if c.created:
   try:c.cleanup()
   except Exception as e:print('Limpeza da conta de teste falhou:',str(e),file=sys.stderr)
