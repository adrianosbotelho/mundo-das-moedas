// Sistema de recompensas: estrelas, badges, celebracoes
const Recompensas = {
    BADGES: [
        { id: 'primeiro_acerto', nome: 'Primeiro Passo', icone: '🌱', descricao: 'Primeiro acerto!' },
        { id: 'seq_5', nome: 'Em chamas!', icone: '🔥', descricao: '5 acertos seguidos' },
        { id: 'seq_10', nome: 'Imparável!', icone: '⚡', descricao: '10 acertos seguidos' },
        { id: 'seq_20', nome: 'Lendário!', icone: '🌈', descricao: '20 acertos seguidos' },
        { id: 'nivel_2', nome: 'Moeda de 25', icone: '🥈', descricao: 'Chegou ao nível 2' },
        { id: 'nivel_3', nome: 'Moeda de 50', icone: '🥇', descricao: 'Chegou ao nível 3' },
        { id: 'nivel_4', nome: 'Real!', icone: '💎', descricao: 'Chegou ao nível 4' },
        { id: 'nivel_5', nome: 'Mestre', icone: '👑', descricao: 'Chegou ao nível 5' },
        { id: 'nivel_6', nome: 'Vai-Um!', icone: '🧮', descricao: 'Chegou ao nível 6' },
        { id: 'nivel_7', nome: 'Troco Esperto', icone: '🦉', descricao: 'Chegou ao nível 7' },
        { id: 'nivel_8', nome: 'Mercado', icone: '🛍️', descricao: 'Chegou ao nível 8' },
        { id: 'nivel_9', nome: 'Cabeça', icone: '🧠', descricao: 'Chegou ao nível 9' },
        { id: 'nivel_10', nome: 'Grande Mestre', icone: '🏅', descricao: 'Chegou ao nível 10' },
        { id: 'estrelas_10', nome: 'Colecionador', icone: '⭐', descricao: '10 estrelas' },
        { id: 'estrelas_50', nome: 'Brilhante', icone: '🌟', descricao: '50 estrelas' },
        { id: 'estrelas_100', nome: 'Superestrela', icone: '💫', descricao: '100 estrelas' },
        { id: 'estrelas_200', nome: 'Galáxia', icone: '🌌', descricao: '200 estrelas' },
        { id: 'troco_5', nome: 'Vendedor', icone: '🛒', descricao: '5 trocos corretos' },
        { id: 'sem_dica', nome: 'Independente', icone: '🧠', descricao: '10 sem usar dica' },
        { id: 'minigame', nome: 'Gamer!', icone: '🎮', descricao: 'Desbloqueou o mini-jogo!' },
        { id: 'dino_50', nome: 'Corredor', icone: '🏃', descricao: '50 pontos no mini-jogo' },
        { id: 'dino_100', nome: 'Velocista', icone: '🚀', descricao: '100 pontos no mini-jogo' }
    ],

    verificarBadges(progresso) {
        const novas = [];

        var dinoPontos = parseInt(localStorage.getItem('dino_melhor') || '0');
        const checks = {
            'primeiro_acerto': progresso.acertosTotal >= 1,
            'seq_5': progresso.melhorSequencia >= 5,
            'seq_10': progresso.melhorSequencia >= 10,
            'seq_20': progresso.melhorSequencia >= 20,
            'nivel_2': progresso.nivel >= 2,
            'nivel_3': progresso.nivel >= 3,
            'nivel_4': progresso.nivel >= 4,
            'nivel_5': progresso.nivel >= 5,
            'nivel_6': progresso.nivel >= 6,
            'nivel_7': progresso.nivel >= 7,
            'nivel_8': progresso.nivel >= 8,
            'nivel_9': progresso.nivel >= 9,
            'nivel_10': progresso.nivel >= 10,
            'estrelas_10': progresso.estrelas >= 10,
            'estrelas_50': progresso.estrelas >= 50,
            'estrelas_100': progresso.estrelas >= 100,
            'estrelas_200': progresso.estrelas >= 200,
            'minigame': progresso.acertosTotal >= 10,
            'dino_50': dinoPontos >= 50,
            'dino_100': dinoPontos >= 100
        };

        Object.entries(checks).forEach(([id, condicao]) => {
            if (condicao && !progresso.badges.includes(id)) {
                progresso.badges.push(id);
                novas.push(this.BADGES.find(b => b.id === id));
            }
        });

        return novas;
    },

    animarEstrela(container) {
        const el = container || document.getElementById('estrelas-count');
        if (el) {
            el.classList.add('star-collect');
            setTimeout(() => el.classList.remove('star-collect'), 600);
        }
    },

    mostrarCelebracao(titulo, texto, badge) {
        const overlay = document.getElementById('celebracao-overlay');
        document.getElementById('celebracao-titulo').textContent = titulo;
        document.getElementById('celebracao-texto').textContent = texto;
        document.getElementById('recompensa-badge').textContent = badge || '🏆';
        overlay.classList.add('visivel');
        this._criarConfetes();
        Sons.tocar('nivel');
    },

    fecharCelebracao() {
        document.getElementById('celebracao-overlay').classList.remove('visivel');
    },

    _criarConfetes() {
        const container = document.getElementById('confetes');
        container.innerHTML = '';
        const cores = ['#FF6B35', '#4ECDC4', '#FFD700', '#FF6B6B', '#45B7D1', '#764ba2'];

        for (let i = 0; i < 30; i++) {
            const confete = document.createElement('div');
            confete.className = 'confete';
            confete.style.left = Math.random() * 100 + '%';
            confete.style.top = '-10px';
            confete.style.backgroundColor = cores[Math.floor(Math.random() * cores.length)];
            confete.style.animationDelay = Math.random() * 2 + 's';
            confete.style.animationDuration = (2 + Math.random() * 2) + 's';
            container.appendChild(confete);
        }
    },

    renderizarBadges(progresso) {
        const grid = document.getElementById('badges-grid');
        if (!grid) return;
        grid.innerHTML = '';

        this.BADGES.forEach(badge => {
            const conquistado = progresso.badges.includes(badge.id);
            const el = document.createElement('div');
            el.className = `badge-item ${conquistado ? 'conquistado' : 'bloqueado'}`;
            el.innerHTML = `
                <span class="badge-icone">${badge.icone}</span>
                <span class="badge-nome">${badge.nome}</span>
            `;
            el.title = badge.descricao;
            grid.appendChild(el);
        });
    },

    renderizarStats(progresso) {
        document.getElementById('stat-estrelas').textContent = progresso.estrelas;
        document.getElementById('stat-acertos').textContent = progresso.acertosTotal;
        document.getElementById('stat-nivel').textContent = progresso.nivel;
        document.getElementById('stat-sequencia').textContent = progresso.melhorSequencia;

        const pais = document.getElementById('pais-info');
        if (pais) {
            const taxa = progresso.acertosTotal + progresso.errosTotal > 0
                ? Math.round((progresso.acertosTotal / (progresso.acertosTotal + progresso.errosTotal)) * 100)
                : 0;
            pais.innerHTML = `
                <p>📈 Taxa de acerto: <strong>${taxa}%</strong></p>
                <p>🎯 Total de tentativas: <strong>${progresso.acertosTotal + progresso.errosTotal}</strong></p>
                <p>⭐ Estrelas conquistadas: <strong>${progresso.estrelas}</strong></p>
                <p>🏆 Nível atual: <strong>${progresso.nivel}</strong></p>
                <p>🔥 Melhor sequência: <strong>${progresso.melhorSequencia} acertos</strong></p>
                <p>📅 Última sessão: <strong>${progresso.ultimaSessao ? new Date(progresso.ultimaSessao).toLocaleDateString('pt-BR') : 'Primeira vez!'}</strong></p>
            `;
        }
    }
};
