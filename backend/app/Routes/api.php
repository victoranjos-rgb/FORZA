<?php
use App\Controllers\AuthController as A;
use App\Controllers\ProfileController as P;
use App\Controllers\WorkoutController as W;
use App\Controllers\FoodController as F;
use App\Controllers\ProgressController as G;
return [
 ['GET','/auth/me',fn()=>A::me()],
 ['POST','/auth/cadastro',fn()=>A::authenticate(true)],
 ['POST','/auth/login',fn()=>A::authenticate(false)],
 ['POST','/auth/logout',fn()=>A::logout()],
 ['PUT','/auth/senha',fn()=>A::password()],
 ['DELETE','/auth/conta',fn()=>A::delete()],
 ['PUT','/perfil',fn()=>P::save()],
 ['GET','/dashboard',fn()=>G::dashboard()],
 ['GET','/exercicios',fn()=>W::library()],
 ['GET','/treinos',fn()=>W::list()],
 ['POST','/treinos',fn()=>W::save(null)],
 ['PUT','/treinos/(\d+)',fn($id)=>W::save((int)$id)],
 ['DELETE','/treinos/(\d+)',fn($id)=>W::delete((int)$id)],
 ['GET','/sessoes',fn()=>W::sessions()],
 ['POST','/sessoes',fn()=>W::start()],
 ['PUT','/sessoes/(\d+)/series/(\d+)',fn($id,$sid)=>W::set((int)$id,(int)$sid)],
 ['POST','/sessoes/(\d+)/finalizar',fn($id)=>W::finish((int)$id)],
 ['GET','/alimentos',fn()=>F::foods()],
 ['GET','/refeicoes',fn()=>F::list()],
 ['POST','/refeicoes',fn()=>F::save(null)],
 ['PUT','/refeicoes/(\d+)',fn($id)=>F::save((int)$id)],
 ['DELETE','/refeicoes/(\d+)',fn($id)=>F::delete((int)$id)],
 ['GET','/progresso',fn()=>G::list()],
 ['POST','/pesos',fn()=>G::save(false)],
 ['POST','/medidas',fn()=>G::save(true)],
 ['DELETE','/pesos/(\d+)',fn($id)=>G::delete(false,(int)$id)],
 ['DELETE','/medidas/(\d+)',fn($id)=>G::delete(true,(int)$id)],
 ['GET','/dicas',fn()=>G::tips()],
];
