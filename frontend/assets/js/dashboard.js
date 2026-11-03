import {api} from './api.js';
import {$, $$, esc, icon, num, goals, today, date, totals, weekdays} from './utils.js';

const shortDate = value => new Date(value.slice(0, 10) + 'T12:00:00').toLocaleDateString('pt-BR', {day:'2-digit',month:'short'}).replace('.', '');
const planDays = workout => {
    try { const days = typeof workout.dias === 'string' ? JSON.parse(workout.dias) : workout.dias; return Array.isArray(days) ? days : []; }
    catch { return []; }
};
const numberLabel = (value, singular, plural) => `${num(value)} ${Number(value) === 1 ? singular : plural}`;

function weekModel(sessions, workouts) {
    const current = today();
    const monday = new Date(current + 'T12:00:00');
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
    return Array.from({length:7}, (_, index) => {
        const day = new Date(monday); day.setDate(day.getDate() + index);
        const key = day.toLocaleDateString('en-CA');
        return {date:key, label:weekdays[day.getDay()], day:day.getDate(), current:key === current,
            done:sessions.some(s => s.finalizado_em?.slice(0,10) === key), planned:workouts.some(w => planDays(w).includes(day.getDay()))};
    });
}

function selectedWorkout(data) {
    const active = data.progresso.sessoes.find(s => !s.finalizado_em);
    const weekday = new Date(today() + 'T12:00:00').getDay();
    const match = active && data.treinos.find(w => Number(w.id) === Number(active.treino_id));
    const planned = data.treinos.find(w => planDays(w).includes(weekday));
    if (active) return {workout:match, active, status:'Em andamento', label:active.nome_treino};
    if (planned) { const finished = data.progresso.sessoes.find(s => Number(s.treino_id) === Number(planned.id) && s.finalizado_em?.slice(0,10) === today()); return {workout:planned, finished, status:finished ? 'Concluído hoje' : 'Planejado para hoje', label:planned.nome}; }
    return {workout:null, active:null, status:'Agenda livre', label:'Dê espaço ao seu próximo treino.'};
}

function metric(label, value, unit, note, glyph, extra = '') {
    return `<article class="dashboard-metric"><div class="metric-label">${icon(glyph)}<span>${label}</span></div><div class="metric-number">${value}<span>${unit}</span></div><div class="metric-note">${note}</div>${extra}</article>`;
}

function trainingPanel(data, week, target) {
    const {workout, active, finished, status, label} = selectedWorkout(data);
    const exercises = workout?.exercicios || [];
    const seriesCount = exercises.reduce((sum, e) => sum + Number(e.series), 0);
    const groups = [...new Set(exercises.map(e => e.grupo_muscular))];
    const sessionSets = active?.series || [];
    const doneSets = sessionSets.filter(s => Number(s.concluida)).length;
    const href = active ? `treino-detalhes.html?sessao=${active.id}` : finished ? `treino-detalhes.html?sessao=${finished.id}` : workout ? `treino-detalhes.html?treino=${workout.id}` : 'treinos.html';
    const weekDone = week.filter(day => day.done).length;
    return `<section class="card dashboard-banner training-panel" aria-labelledby="training-title">
        <div class="panel-heading"><div class="section-label">${icon('workout')} TREINO DE HOJE</div><span class="day-status ${active || finished ? 'is-running' : ''}"><i aria-hidden="true"></i>${status}</span></div>
        <div class="training-intro"><div><h2 id="training-title">${esc(label)}</h2><p>${finished ? 'Boa sessão. Seu progresso de hoje está registrado.' : workout ? 'Seu plano está aqui. Um exercício de cada vez.' : active ? 'Continue de onde parou. Cada série fica registrada.' : 'Monte sua rotina com exercícios, séries e dias que fazem sentido para você.'}</p></div><div class="training-emblem" aria-hidden="true">${icon('workout')}</div></div>
        ${groups.length ? `<div class="muscle-tags">${groups.slice(0,4).map(g => `<span>${esc(g)}</span>`).join('')}</div>` : ''}
        <div class="exercise-preview">${exercises.length ? exercises.slice(0,3).map((e,i) => `<div class="exercise-line"><span class="exercise-order">${String(i+1).padStart(2,'0')}</span><div><strong>${esc(e.nome)}</strong><small>${esc(e.grupo_muscular)}</small></div><span class="exercise-prescription">${e.series}<span> × </span>${e.repeticoes}</span></div>`).join('') : active ? `<div class="session-summary"><span>${num(doneSets)}<small> / ${num(sessionSets.length)}</small></span><div><strong>Séries concluídas</strong><small>Retome para continuar sua sessão.</small></div></div>` : `<div class="training-setup"><div><span>01</span><strong>Escolha os exercícios</strong></div><div><span>02</span><strong>Ajuste séries e cargas</strong></div><div><span>03</span><strong>Organize sua semana</strong></div></div>`}</div>
        <div class="training-action"><a class="btn" href="${href}">${icon(active ? 'arrow' : 'plus')}${active ? 'Retomar treino' : finished ? 'Ver minha sessão' : workout ? 'Ver meu treino' : 'Criar meu treino'}${icon('arrow')}</a><span>${workout ? `${numberLabel(exercises.length,'exercício','exercícios')}<i>·</i>${numberLabel(seriesCount,'série','séries')}` : active ? 'Sua sessão está salva' : `${numberLabel(data.treinos.length,'treino criado','treinos criados')}`}</span></div>
        <div class="training-week"><div class="week-heading"><span>Sua semana</span><span><b>${weekDone}</b>${target ? ` de ${target} dias planejados` : ' dias com treino'}</span></div><div class="rhythm-days">${week.map(day => `<div class="rhythm-day ${day.done ? 'is-done' : ''} ${day.current ? 'is-today' : ''} ${day.planned ? 'is-planned' : ''}" ${day.current ? 'aria-current="date"' : ''} title="${date(day.date)}: ${day.done ? 'treino concluído' : day.planned ? 'treino planejado' : 'sem treino planejado'}"><span>${day.label}</span><b>${day.done ? icon('check') : day.day}</b><i aria-hidden="true"></i></div>`).join('')}</div></div>
    </section>`;
}

function nutritionPanel(meals, nutrients) {
    const allGrams = nutrients.proteinas + nutrients.carboidratos + nutrients.gorduras;
    const p = allGrams ? nutrients.proteinas / allGrams * 100 : 0;
    const c = allGrams ? nutrients.carboidratos / allGrams * 100 : 0;
    const ring = allGrams ? `conic-gradient(#6c9aff 0% ${p}%, #65c9b1 ${p}% ${p+c}%, #d1ad72 ${p+c}% 100%)` : '#29354B';
    const macros = [['Proteínas','proteinas','#6c9aff'],['Carboidratos','carboidratos','#65c9b1'],['Gorduras','gorduras','#d1ad72']];
    return `<section class="card nutrition-panel" aria-labelledby="nutrition-title"><div class="panel-heading"><div><span class="section-label">DIÁRIO ALIMENTAR</span><h2 id="nutrition-title">Alimentação de hoje</h2></div><a class="icon-link" href="alimentacao.html" aria-label="Ver diário alimentar">${icon('arrow')}</a></div>
        <div class="nutrition-overview"><div class="nutrient-ring" style="--ring:${ring}" role="img" aria-label="${num(nutrients.calorias)} quilocalorias registradas hoje"><div><strong>${num(nutrients.calorias)}</strong><span>kcal registradas</span></div></div><div class="nutrition-context"><span class="meal-counter">${icon('food')}${numberLabel(meals.length,'refeição','refeições')}</span><p>${meals.length ? 'Um retrato do que fez parte do seu dia.' : 'Cada refeição ajuda a conhecer melhor a sua rotina.'}</p></div></div>
        <div class="nutrition-macros">${macros.map(([label,key,color]) => `<div class="nutrient-row"><div><span><i style="background:${color}" aria-hidden="true"></i>${label}</span><strong>${num(nutrients[key],1)} <small>g</small></strong></div><div class="nutrient-track" aria-hidden="true"><span style="width:${allGrams ? nutrients[key]/allGrams*100 : 0}%;background:${color}"></span></div></div>`).join('')}</div>
        <p class="macro-caption">Distribuição dos gramas registrados, sem meta de consumo.</p>
        <div class="meal-receipt">${meals.length ? `<span>ÚLTIMO REGISTRO</span><div><strong>${esc(meals.at(-1).nome)}</strong><small>${num(totals([meals.at(-1)]).calorias)} kcal</small></div>` : `<span>SEU DIÁRIO COMEÇA AQUI</span><p>Registre sua primeira refeição do dia.</p>`}</div>
        <a class="btn secondary nutrition-cta" href="alimentacao.html">${icon('plus')}Registrar refeição</a>
    </section>`;
}

function chartMarkup(weights) {
    const width = Math.max(240, Math.round($('#dashboard-weight-chart')?.clientWidth || 640));
    const height = 184, left = 43, right = 16, top = 17, bottom = 30;
    const chartBottom = height - bottom;
    const grid = [0,1,2,3].map(i => { const y = top + i * (chartBottom-top) / 3; return `<path d="M${left} ${y}H${width-right}" class="weight-grid"/>`; }).join('');
    if (!weights.length) return `<div class="weight-empty"><svg viewBox="0 0 ${width} ${height}" class="weight-chart" aria-hidden="true">${grid}</svg><div><span class="empty-chart-icon">${icon('progress')}</span><strong>Seu próximo registro começa a história.</strong><span>Acompanhe a evolução do peso ao longo do tempo.</span><a href="progresso.html">Registrar meu peso ${icon('arrow')}</a></div></div>`;
    const values = weights.map(w => Number(w.peso));
    const min = Math.min(...values), max = Math.max(...values), margin = Math.max((max-min)*.25,.5);
    const lo = min-margin, hi=max+margin;
    const firstTime = new Date(weights[0].data+'T12:00:00').getTime();
    const lastTime = new Date(weights.at(-1).data+'T12:00:00').getTime();
    const coordinates = weights.map(w => [left+(lastTime === firstTime ? .5 : (new Date(w.data+'T12:00:00').getTime()-firstTime)/(lastTime-firstTime))*(width-left-right), top+(hi-Number(w.peso))/(hi-lo)*(chartBottom-top)]);
    const line = coordinates.map(([x,y],i) => `${i ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`).join(' ');
    const area = `${line} L${coordinates.at(-1)[0]} ${chartBottom} L${coordinates[0][0]} ${chartBottom} Z`;
    const labels = [...new Set([0,Math.floor((weights.length-1)/2),weights.length-1])];
    return `<svg viewBox="0 0 ${width} ${height}" class="weight-chart" role="img" aria-label="Histórico de peso, ${weights.length} registros de ${date(weights[0].data)} a ${date(weights.at(-1).data)}"><defs><linearGradient id="weight-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#397BFF" stop-opacity=".19"/><stop offset="100%" stop-color="#397BFF" stop-opacity="0"/></linearGradient></defs>${grid}${[0,1,2,3].map(i => `<text x="1" y="${top+i*(chartBottom-top)/3+4}">${num(hi-i*(hi-lo)/3,1)}</text>`).join('')}<path d="${area}" fill="url(#weight-fill)"/><path d="${line}" class="weight-line"/>${coordinates.map(([x,y],i) => `<circle cx="${x}" cy="${y}" r="${i === coordinates.length-1 ? 4 : 2.5}" class="weight-point"><title>${date(weights[i].data)}: ${num(weights[i].peso,1)} kg</title></circle>`).join('')}${labels.map(i => `<text x="${coordinates[i][0]}" y="${height-5}" text-anchor="${i === 0 ? 'start' : i === weights.length-1 ? 'end' : 'middle'}">${esc(shortDate(weights[i].data))}</text>`).join('')}</svg><details class="chart-data"><summary>Consultar registros</summary><div class="table-wrap"><table><thead><tr><th>Data</th><th>Peso</th></tr></thead><tbody>${weights.map(w => `<tr><td>${date(w.data)}</td><td>${num(w.peso,1)} kg</td></tr>`).join('')}</tbody></table></div></details>`;
}

function progressPanel(weights) {
    const latest = weights.at(-1);
    return `<section class="card progress-panel" aria-labelledby="weight-title"><div class="panel-heading"><div><span class="section-label">SEU CORPO, SEU TEMPO</span><h2 id="weight-title">Evolução do peso</h2></div><div class="period-switch" role="group" aria-label="Período do gráfico"><button type="button" data-period="30" aria-pressed="true">30 dias</button><button type="button" data-period="all" aria-pressed="false">Histórico</button></div></div><div class="weight-summary"><strong>${latest ? num(latest.peso,1) : '—'} <span>kg</span></strong><span>${latest ? `Último registro em ${date(latest.data)}` : 'Seu primeiro registro faz a diferença.'}</span></div><div id="dashboard-weight-chart" aria-live="polite"></div><div class="panel-footer"><span>${icon('weight')}Um registro de cada vez.</span><a href="progresso.html">Ver progresso ${icon('arrow')}</a></div></section>`;
}

function activityPanel(data) {
    const events = [
        ...data.progresso.sessoes.filter(s => s.finalizado_em).map(s => ({title:s.nome_treino,note:'Treino concluído',time:s.finalizado_em,glyph:'workout',href:`treino-detalhes.html?sessao=${s.id}`})),
        ...data.progresso.pesos.map(w => ({title:`${num(w.peso,1)} kg registrados`,note:'Registro de peso',time:w.data+' 12:00:00',glyph:'weight',href:'progresso.html'})),
        ...data.refeicoes.map(m => ({title:m.nome,note:'Refeição registrada',time:m.criado_em || m.data+' 12:00:00',glyph:'food',href:'alimentacao.html'}))
    ].sort((a,b) => b.time.localeCompare(a.time)).slice(0,3);
    return `<section class="card activity-panel" aria-labelledby="activity-title"><div class="panel-heading"><div><span class="section-label">SUA ROTINA EM DIA</span><h2 id="activity-title">Últimos registros</h2></div><span class="activity-mark">${icon('clock')}</span></div>${events.length ? `<ol class="activity-list">${events.map(e => `<li><span class="activity-glyph">${icon(e.glyph)}</span><div><a href="${e.href}">${esc(e.title)}</a><span>${esc(e.note)}<i>·</i>${shortDate(e.time)}</span></div>${icon('chevron')}</li>`).join('')}</ol>` : `<div class="activity-empty"><p>Sua rotina ganha forma<br>a cada novo registro.</p><span>Escolha por onde começar:</span><a href="treinos.html">${icon('workout')}Planejar um treino${icon('arrow')}</a><a href="progresso.html">${icon('weight')}Registrar peso ou medidas${icon('arrow')}</a></div>`}<div class="activity-footnote"><i aria-hidden="true"></i>Seus registros ficam salvos na sua conta.</div></section>`;
}

function tipsPanel(tips, goalId) {
    const priorities = [['Treino','workout'],['Alimentação','food'],['Recuperação','recovery']];
    const selected = priorities.map(([category,glyph]) => { const tip = tips.find(t => t.categoria === category); return tip ? {tip,glyph} : null; }).filter(Boolean);
    for (const tip of tips) { if(selected.length === 3) break; if(!selected.some(t => t.tip.id === tip.id)) selected.push({tip,glyph:'tips'}); }
    return `<section class="dashboard-recommendations" aria-labelledby="recommendations-title"><div class="recommendations-heading"><div><span class="section-label">PARA O SEU MOMENTO</span><h2 id="recommendations-title">Boas ideias para a sua rotina<span class="recommendations-dot">.</span></h2></div><a href="dicas.html">Todas as dicas ${icon('arrow')}</a></div>${selected.length ? `<div class="recommendation-grid">${selected.map(({tip,glyph}) => `<article class="recommendation"><div class="recommendation-category">${icon(glyph)}${esc(tip.categoria)}</div><h3>${esc(tip.titulo)}</h3><p>${esc(tip.conteudo)}</p><a href="dicas.html">Ler orientação ${icon('arrow')}</a></article>`).join('')}</div><p class="recommendation-note">Conteúdo educativo para ${esc((goals[goalId] || 'sua rotina').toLowerCase())}. Respeite suas condições e procure orientação profissional.</p>` : `<div class="recommendations-empty"><span>${icon('tips')}Escolha seu objetivo para encontrar conteúdo que combina com sua rotina.</span><a href="perfil.html">Personalizar meu perfil ${icon('arrow')}</a></div>`}</section>`;
}

export async function render(user) {
    const data = await api('/dashboard');
    const nutrients = totals(data.refeicoes);
    const completed = data.progresso.sessoes.filter(s => s.finalizado_em);
    const weights = data.progresso.pesos;
    const last = weights.at(-1);
    const week = weekModel(completed, data.treinos);
    const doneDays = week.filter(day => day.done).length;
    const target = Number(user.perfil?.dias_semana) || 0;
    const weekdayLabel = new Date(today()+'T12:00:00').toLocaleDateString('pt-BR',{weekday:'long'});
    const metrics = [
        metric('Treinos concluídos',num(data.estatisticas.total),'', 'Desde o início da sua jornada','workout'),
        metric('Consistência semanal',num(doneDays),target ? `/ ${target} dias` : 'dias', `${numberLabel(data.estatisticas.semana || 0,'sessão nesta semana','sessões nesta semana')}`,'calendar',`<div class="metric-consistency" aria-hidden="true">${week.map(day => `<i class="${day.done ? 'filled' : ''}"></i>`).join('')}</div>`),
        metric('Calorias registradas',num(nutrients.calorias),'kcal',numberLabel(data.refeicoes.length,'refeição registrada hoje','refeições registradas hoje'),'flame'),
        metric('Último peso',last ? num(last.peso,1) : '—','kg',last ? `Atualizado em ${shortDate(last.data)}` : 'Comece com seu primeiro registro','weight')
    ];
    $('#view').classList.add('dashboard-page');
    $('#view').innerHTML = `<section class="dashboard-welcome"><div class="welcome-copy"><span class="welcome-context"><i aria-hidden="true"></i>${esc(weekdayLabel)}<span aria-hidden="true">/</span>Visão geral</span><h1>Vamos em frente, ${esc(user.nome.trim().split(/\s+/)[0])}<span>.</span></h1><p>Um lugar para organizar o hoje e acompanhar o que vem depois.</p></div><a class="welcome-goal" href="perfil.html"><span class="goal-symbol">${icon('target')}</span><div><span>SEU OBJETIVO ATUAL</span><strong>${esc(goals[user.perfil?.objetivo_id] || 'Encontre seu objetivo')}</strong><small>Ajustar objetivo ${icon('arrow')}</small></div></a></section>
        <section class="dashboard-metrics" aria-label="Resumo da jornada">${metrics.join('')}</section>
        <div class="dashboard-grid">${trainingPanel(data,week,target)}${nutritionPanel(data.refeicoes,nutrients)}${progressPanel(weights)}${activityPanel(data)}</div>
        ${tipsPanel(data.dicas,user.perfil?.objetivo_id)}`;
    let selectedPeriod = '30';
    const updateChart = period => {
        selectedPeriod = period;
        const cutoff = new Date(today()+'T12:00:00'); cutoff.setDate(cutoff.getDate()-29);
        const since = cutoff.toLocaleDateString('en-CA');
        const shown = period === 'all' ? weights : weights.filter(w => w.data >= since);
        $('#dashboard-weight-chart').innerHTML = chartMarkup(shown);
        $$('[data-period]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.period === period)));
    };
    $$('[data-period]').forEach(button => { button.onclick = () => updateChart(button.dataset.period); });
    updateChart('30');
    let chartWidth = $('#dashboard-weight-chart').clientWidth;
    const resize = new ResizeObserver(entries => {
        const width = Math.round(entries[0].contentRect.width);
        if (width !== Math.round(chartWidth)) { chartWidth = width; updateChart(selectedPeriod); }
    });
    resize.observe($('#dashboard-weight-chart'));
}
