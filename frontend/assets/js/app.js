import {api} from './api.js';
import {shell} from './navigation.js';
import {$,esc} from './utils.js';

async function start() {
    const page = document.body.dataset.page;
    try {
        const {user} = await api('/auth/me');
        if (!user) { location.replace('login.html'); return; }
        shell(page, user);
        document.body.dataset.unit = user.perfil?.unidade_carga || 'kg';
        const moduleName = page === 'treino-detalhes' ? 'treinos' : page;
        const module = await import('./' + moduleName + '.js');
        await module.render(user);
    } catch (error) {
        const view = $('#view') || document.body;
        view.innerHTML = `<section class="card" role="alert"><h1>Não foi possível carregar esta tela</h1><p class="muted">${esc(error.message)}</p><div class="actions"><button class="btn" id="retry-page" type="button">Tentar novamente</button><a class="btn secondary" href="perfil.html">Meu perfil</a><a href="dashboard.html">Visão geral</a></div></section>`;
        $('#retry-page').onclick = () => location.reload();
    } finally {
        $('#view')?.setAttribute('aria-busy', 'false');
    }
}
start();
