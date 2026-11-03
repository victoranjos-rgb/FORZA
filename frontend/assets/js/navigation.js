import {api} from './api.js';
import {brand,icon,esc,$,today,goals} from './utils.js';

export const pages = {
    dashboard: ['Visão geral', 'dashboard'], treinos: ['Meus treinos', 'workout'],
    alimentacao: ['Alimentação', 'food'], progresso: ['Meu progresso', 'progress'],
    dicas: ['Dicas para você', 'tips'], perfil: ['Meu perfil', 'profile']
};

export function shell(page, user) {
    document.body.classList.add('app-layout');
    const current = pages[page] || pages.treinos;
    const initials = user.nome.trim().split(/\s+/).filter(Boolean).map(n => n[0]).filter((_, i, all) => i === 0 || i === all.length - 1).join('').toUpperCase();
    const dateLabel = new Date(today() + 'T12:00:00').toLocaleDateString('pt-BR', {day:'numeric',month:'long',year:'numeric'});
    const nav = Object.entries(pages).map(([key, [name, glyph]]) => `${key === 'perfil' ? '<div class="nav-divider">CONTA</div>' : ''}<a class="nav-link ${page === key ? 'active' : ''}" ${page === key ? 'aria-current="page"' : ''} href="${key}.html">${icon(glyph)}<span>${name}</span>${page === key ? '<i class="nav-current" aria-hidden="true"></i>' : ''}</a>`).join('');
    document.body.innerHTML = `
        <a class="skip" href="#main">Pular para o conteúdo</a>
        <button id="menu-backdrop" class="menu-backdrop" aria-label="Fechar menu" tabindex="-1" hidden></button>
        <aside class="sidebar" id="sidebar" aria-label="Menu principal">
            <div class="sidebar-brand">${brand()}<span class="product-label">SEU ESPAÇO DE PERFORMANCE</span></div>
            <div class="nav-label">PRINCIPAL</div><nav>${nav}</nav>
            <div class="sidebar-bottom">
                <a class="sidebar-focus" href="perfil.html"><span class="focus-icon">${icon('target')}</span><span><small>Seu foco atual</small><strong>${esc(goals[user.perfil?.objetivo_id] || 'Encontre seu objetivo')}</strong></span>${icon('chevron')}</a>
                <button class="nav-link logout-link" id="logout" type="button">${icon('logout')}<span>Sair da conta</span></button>
                <a class="account" href="perfil.html"><span class="avatar">${esc(initials)}</span><span class="account-text"><b>${esc(user.nome)}</b><small>Minha conta pessoal</small></span>${icon('chevron')}</a>
            </div>
        </aside>
        <div class="main-shell">
            <header class="topbar">
                <div class="topbar-left"><button class="btn secondary menu-toggle" aria-label="Abrir menu" aria-expanded="false" aria-controls="sidebar" id="menu" type="button">${icon('menu')}</button><nav class="breadcrumb" aria-label="Localização"><a href="dashboard.html">Meu espaço</a><span aria-hidden="true">/</span><strong>${esc(current[0])}</strong></nav><a href="dashboard.html" class="brand mobile-brand"><span class="brand-mark" aria-hidden="true">ϟ</span>FORZA</a></div>
                <div class="topbar-right"><span class="date">${icon('calendar')}${esc(dateLabel)}</span>${page === 'dashboard' ? `<a class="btn topbar-action" href="treinos.html" aria-label="Registrar um treino">${icon('plus')}<span>Registrar um treino</span></a>` : ''}<a href="perfil.html" aria-label="Meu perfil" class="avatar topbar-avatar">${esc(initials)}</a></div>
            </header>
            <main class="content" id="main">
                ${!user.perfil && page !== 'perfil' ? `<aside class="onboarding-notice" aria-label="Complete seu perfil"><div><strong>Deixe a FORZA com o seu ritmo</strong><p>Você já pode organizar treinos e refeições. Complete seu perfil para personalizar o objetivo e as dicas.</p></div><a class="btn secondary small" href="perfil.html">Preencher meu perfil</a></aside>` : ''}
                <div id="view" aria-busy="true"><div class="loading" role="status"><span class="loader"></span> Carregando sua jornada…</div></div>
                <footer class="page-footer"><span>FORZA <span aria-hidden="true">/</span> Seu objetivo. Seu ritmo.</span><span>© ${new Date().getFullYear()} · Sua evolução, todos os dias.</span></footer>
            </main>
        </div>`;
    const mobile = matchMedia('(max-width:767px)');
    const syncMenu = () => {
        const open = $('#sidebar').classList.contains('open');
        $('#sidebar').inert = mobile.matches && !open;
        $('#menu-backdrop').hidden = !mobile.matches || !open;
        document.body.classList.toggle('menu-open', mobile.matches && open);
    };
    const closeMenu = () => { $('#sidebar').classList.remove('open'); $('#menu').setAttribute('aria-expanded','false'); $('#menu').setAttribute('aria-label','Abrir menu'); syncMenu(); };
    $('#menu').onclick = () => { const open = $('#sidebar').classList.toggle('open'); $('#menu').setAttribute('aria-expanded',String(open)); $('#menu').setAttribute('aria-label',open?'Fechar menu':'Abrir menu'); syncMenu(); };
    $('#menu-backdrop').onclick = closeMenu;
    mobile.addEventListener('change', syncMenu); syncMenu();
    document.addEventListener('keydown', e => { if(e.key === 'Escape') { closeMenu(); if(mobile.matches) $('#menu').focus(); } });
    $('#logout').onclick = async () => { try { await api('/auth/logout','POST',{}); location.href='login.html'; } catch(e) { const {toast} = await import('./utils.js'); toast(e.message,true); } };
}
export const heading = (tag,title,sub,action='') => `<div class="page-heading"><div><p class="eyebrow">${esc(tag)}</p><h1>${title}</h1><p>${esc(sub)}</p></div>${action}</div>`;
