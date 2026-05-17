// Controlador principal do jogo
var App = {
    progresso: null,

    init: function() {
        this.progresso = Storage.carregar();
        Moedas.configurarEventos();
        this.atualizarMascoteInicio();
        this._atualizarBotaoMinigame();
    },

    _atualizarBotaoMinigame: function() {
        var card = document.getElementById('modo-minigame');
        if (!card) return;
        if (this.progresso.acertosTotal >= 10) {
            card.classList.remove('modo-bloqueado');
            var cadeado = card.querySelector('.cadeado');
            if (cadeado) cadeado.style.display = 'none';
            var desc = card.querySelector('p');
            if (desc) desc.textContent = 'Ajude a Moedinha a correr e coletar moedas!';
        }
    },

    mostrarTela: function(id) {
        document.querySelectorAll('.tela').forEach(function(t) { t.classList.remove('ativa'); });
        document.getElementById(id).classList.add('ativa');

        if (id === 'tela-stats') {
            Recompensas.renderizarBadges(this.progresso);
            Recompensas.renderizarStats(this.progresso);
        }
    },

    voltarInicio: function() {
        if (DinoGame.ativo) DinoGame.parar();
        this.mostrarTela('tela-inicio');
        this.atualizarMascoteInicio();
        this._atualizarBotaoMinigame();
    },

    iniciarJogo: function() {
        Sons.tocar('click');
        this.mostrarTela('tela-jogo');
        Jogo.iniciar(this.progresso.nivel, this.progresso.fase);
    },

    iniciarModo: function(modo) {
        Sons.tocar('click');

        if (modo === 'conta') {
            this.mostrarTela('tela-conta');
            ContaMode.iniciar();
            return;
        }

        if (modo === 'minigame') {
            if (this.progresso.acertosTotal < 10) {
                this._mostrarMascoteDica('Você precisa de 10 acertos para desbloquear o mini-jogo! Faltam ' + (10 - this.progresso.acertosTotal) + '! 💪');
                return;
            }
            this.mostrarTela('tela-dino');
            DinoGame.iniciar();
            return;
        }

        this.mostrarTela('tela-jogo');

        switch (modo) {
            case 'aventura':
                Jogo.iniciar(this.progresso.nivel, this.progresso.fase);
                break;
            case 'troco':
                Jogo.iniciarTroco();
                break;
            case 'livre':
                Jogo.iniciarLivre();
                break;
        }
    },

    _mostrarMascoteDica: function(msg) {
        var balao = document.getElementById('balao-inicio');
        if (balao) {
            balao.querySelector('p').textContent = msg;
            balao.classList.add('balao-destaque');
            setTimeout(function() { balao.classList.remove('balao-destaque'); }, 3000);
        }
    },

    atualizarMascoteInicio: function() {
        var msgs = [];
        var p = this.progresso;

        if (p.acertosTotal === 0) {
            msgs = ['Oi! Eu sou a Moedinha! Vamos aprender juntos? 🦊'];
        } else if (p.sequenciaAtual >= 5) {
            msgs = [
                'Você está com tudo! ' + p.sequenciaAtual + ' acertos seguidos! 🔥',
                'Incrível! Continue assim, campeão! ⭐'
            ];
        } else if (p.acertosTotal >= 10 && !p.badges.includes('minigame')) {
            msgs = ['Parabéns! Você desbloqueou o mini-jogo! Vá em Modos de Jogo! 🎮'];
        } else if (p.nivel >= 6) {
            msgs = [
                'Uau! Nível ' + p.nivel + '! Você está ficando fera! 💪',
                'Que orgulho! Já tem ' + p.estrelas + ' estrelas! 🌟',
                'Quer treinar mais? Tem modos novos esperando! 🎯'
            ];
        } else {
            msgs = [
                'Que bom te ver de novo! Vamos jogar? 😊',
                'Você já tem ' + p.estrelas + ' estrelas! Vamos ganhar mais? ⭐',
                'A Moedinha sentiu sua falta! Bora jogar! 🦊',
                'Oi! Pronto para mais desafios? 🎮'
            ];
        }

        var msg = msgs[Math.floor(Math.random() * msgs.length)];
        var balao = document.getElementById('balao-inicio');
        if (balao) balao.querySelector('p').textContent = msg;
    }
};

// Motor do jogo
var Jogo = {
    nivel: 1,
    fase: 0,
    moedasNoDeposito: [],
    valorAtual: 0,
    desafioAtual: null,
    tentativas: 0,
    modo: 'aventura',
    dicaUsada: false,
    acertosSemDica: 0,

    iniciar: function(nivel, fase) {
        this.nivel = nivel;
        this.fase = fase;
        this.modo = 'aventura';
        this._carregarDesafio();
    },

    iniciarTroco: function() {
        this.modo = 'troco';
        this.nivel = App.progresso.nivel;
        this._carregarDesafioTroco();
    },

    iniciarLivre: function() {
        this.modo = 'livre';
        Moedas.renderizarDisponiveis([5, 10, 25, 50, 100]);
        this._resetarCaderno();

        document.getElementById('texto-instrucao').textContent =
            'Brinque à vontade! Arraste moedas para o caderno! 🎨';
        document.getElementById('valor-alvo').style.display = 'none';
        document.getElementById('btn-confirmar').style.display = 'none';
        document.getElementById('btn-dica').style.display = 'none';

        this._atualizarHeader();
    },

    _carregarDesafio: function() {
        var focado = Adaptativo.gerarExercicioFocado(App.progresso, this.nivel);
        var defNivel = Niveis.obterNivel(this.nivel);

        if (focado && Math.random() < 0.3) {
            this.desafioAtual = focado;
        } else {
            this.desafioAtual = Niveis.obterDesafio(this.nivel, this.fase);
        }

        this._resetarCaderno();
        this.tentativas = 0;
        this.dicaUsada = false;

        Moedas.renderizarDisponiveis(defNivel.moedas);
        this._atualizarUI();
        this._atualizarHeader();

        var val = Adaptativo.formatarValor(this.desafioAtual.valor);
        var instrucoes = [
            'Arraste as moedas para o caderno e some até ' + val + '!',
            'Monte a conta no caderno para chegar em ' + val + '!',
            'Coloque moedas no caderno até somar ' + val + '!'
        ];
        document.getElementById('texto-instrucao').textContent =
            instrucoes[Math.floor(Math.random() * instrucoes.length)];

        document.getElementById('valor-alvo').style.display = '';
        document.getElementById('btn-confirmar').style.display = '';
        document.getElementById('btn-dica').style.display = '';
    },

    _carregarDesafioTroco: function() {
        this.desafioAtual = Niveis.gerarDesafioTroco(this.nivel);
        this._resetarCaderno();
        this.tentativas = 0;
        this.dicaUsada = false;

        var defNivel = Niveis.obterNivel(this.nivel);
        Moedas.renderizarDisponiveis(defNivel.moedas);

        var prod = this.desafioAtual.produto;
        document.getElementById('texto-instrucao').innerHTML =
            '<div class="loja-container">' +
                '<div class="produto-imagem">' + prod.emoji + '</div>' +
                '<div class="produto-nome">' + prod.nome + '</div>' +
                '<div class="produto-preco">Preço: ' + Adaptativo.formatarValor(prod.preco) + '</div>' +
                '<div class="pagamento-info">' +
                    'Pagou com: ' + Adaptativo.formatarValor(this.desafioAtual.pagamento) + '<br>' +
                    '<strong>Monte o troco no caderno!</strong>' +
                '</div>' +
            '</div>';

        this._atualizarUI();
        this._atualizarHeader();

        document.getElementById('valor-alvo').style.display = '';
        document.getElementById('btn-confirmar').style.display = '';
        document.getElementById('btn-dica').style.display = '';
    },

    _resetarCaderno: function() {
        this.moedasNoDeposito = [];
        this.valorAtual = 0;

        var dropZona = document.getElementById('drop-zona');
        dropZona.innerHTML = '';
        dropZona.classList.remove('tem-moedas');

        document.getElementById('caderno-total').textContent = '0,00';
        document.getElementById('caderno-total').className = 'caderno-total';
        document.getElementById('caderno-resultado').style.visibility = 'hidden';

        var dicaEl = document.querySelector('.dica-container');
        if (dicaEl) dicaEl.remove();
    },

    _atualizarUI: function() {
        if (!this.desafioAtual) return;
        document.getElementById('valor-numero').textContent =
            Adaptativo.formatarValor(this.desafioAtual.valor);
    },

    _atualizarCaderno: function() {
        var fmt = function(v) {
            var r = Math.floor(v / 100);
            var c = v % 100;
            return r + ',' + (c < 10 ? '0' + c : c);
        };

        var totalEl = document.getElementById('caderno-total');
        totalEl.textContent = fmt(this.valorAtual);

        var resultado = document.getElementById('caderno-resultado');
        if (this.moedasNoDeposito.length > 1) {
            resultado.style.visibility = 'visible';
        } else {
            resultado.style.visibility = 'hidden';
        }

        totalEl.className = 'caderno-total';
        if (this.desafioAtual) {
            if (this.valorAtual > this.desafioAtual.valor) {
                totalEl.classList.add('excedeu');
            } else if (this.valorAtual === this.desafioAtual.valor) {
                totalEl.classList.add('correto');
            }
        }
    },

    _atualizarHeader: function() {
        var defNivel = Niveis.obterNivel(this.nivel);
        document.getElementById('nivel-badge').textContent = 'Nível ' + this.nivel;
        document.getElementById('fase-texto').textContent = defNivel.nome;
        document.getElementById('estrelas-count').textContent = App.progresso.estrelas;

        var total = Niveis.totalFasesNivel(this.nivel);
        var progPct = (this.fase / total) * 100;
        document.getElementById('progresso-fill').style.width = progPct + '%';
        document.getElementById('progresso-texto').textContent = this.fase + '/' + total;
    },

    adicionarAoCaderno: function(valor) {
        this.moedasNoDeposito.push(valor);
        this.valorAtual += valor;

        var dropZona = document.getElementById('drop-zona');
        dropZona.classList.add('tem-moedas');

        var info = Moedas.INFO[valor];
        var fmt = function(v) {
            var r = Math.floor(v / 100);
            var c = v % 100;
            return r + ',' + (c < 10 ? '0' + c : c);
        };

        var item = document.createElement('div');
        item.className = 'caderno-item';
        item.dataset.valor = valor;
        item.dataset.indice = this.moedasNoDeposito.length - 1;
        item.title = 'Clique para remover';

        var isFirst = this.moedasNoDeposito.length === 1;

        item.innerHTML =
            '<span class="caderno-item-moeda" style="background:' + info.cor + ';border-color:' + info.borda + '"></span>' +
            '<span class="caderno-item-operador">' + (isFirst ? '' : '+') + '</span>' +
            '<span class="caderno-item-valor">' + fmt(valor) + '</span>' +
            '<span class="caderno-item-remover">✕</span>';

        dropZona.appendChild(item);
        this._atualizarCaderno();
    },

    removerDoCaderno: function(itemEl) {
        var valor = parseInt(itemEl.dataset.valor);
        var idx = this.moedasNoDeposito.indexOf(valor);
        if (idx >= 0) {
            this.moedasNoDeposito.splice(idx, 1);
            this.valorAtual -= valor;
            itemEl.remove();

            // Reconstruir operadores (primeiro item nao tem +)
            var dropZona = document.getElementById('drop-zona');
            var items = dropZona.querySelectorAll('.caderno-item');
            items.forEach(function(it, i) {
                var op = it.querySelector('.caderno-item-operador');
                op.textContent = i === 0 ? '' : '+';
            });

            if (this.moedasNoDeposito.length === 0) {
                dropZona.classList.remove('tem-moedas');
            }

            this._atualizarCaderno();
        }
    },

    limparDeposito: function() {
        this._resetarCaderno();
        Sons.tocar('click');
    },

    verificarResposta: function() {
        if (this.modo === 'livre') return;
        if (this.valorAtual === 0) return;

        this.tentativas++;
        var acertou = this.valorAtual === this.desafioAtual.valor;

        Storage.registrarTentativa({
            acertou: acertou,
            valorAlvo: this.desafioAtual.valor,
            valorColocado: this.valorAtual,
            nivel: this.nivel,
            fase: this.fase,
            tentativas: this.tentativas,
            modo: this.modo,
            dicaUsada: this.dicaUsada
        });

        if (acertou) {
            this._processarAcerto();
        } else {
            this._processarErro();
        }
    },

    _processarAcerto: function() {
        App.progresso.acertosTotal++;
        App.progresso.sequenciaAtual++;

        if (App.progresso.sequenciaAtual > App.progresso.melhorSequencia) {
            App.progresso.melhorSequencia = App.progresso.sequenciaAtual;
        }

        if (!this.dicaUsada) this.acertosSemDica++;

        var defNivel = Niveis.obterNivel(this.nivel);
        var estrelasGanhas = defNivel.estrelasPorAcerto;
        App.progresso.estrelas += estrelasGanhas;

        Storage.salvar(App.progresso);
        Sons.tocar('acerto');
        Recompensas.animarEstrela();

        Recompensas.verificarBadges(App.progresso);

        var msg = Adaptativo.mensagemIncentivo(App.progresso, true, this.tentativas);
        this._mostrarFeedback(true, msg, '+' + estrelasGanhas + ' ⭐');
    },

    _processarErro: function() {
        App.progresso.errosTotal++;
        App.progresso.sequenciaAtual = 0;
        this.acertosSemDica = 0;

        Storage.salvar(App.progresso);
        Sons.tocar('erro');

        var msg = Adaptativo.mensagemIncentivo(App.progresso, false, this.tentativas);
        var explicacao = Adaptativo.explicarErro(
            this.desafioAtual.valor,
            this.valorAtual,
            this.moedasNoDeposito
        );

        this._mostrarFeedback(false, msg, explicacao);

        var caderno = document.getElementById('caderno');
        caderno.classList.add('shake');
        setTimeout(function() { caderno.classList.remove('shake'); }, 400);
    },

    _mostrarFeedback: function(acertou, texto, detalhe) {
        var overlay = document.getElementById('feedback-overlay');
        document.getElementById('feedback-icone').textContent = acertou ? '🎉' : '🤔';
        document.getElementById('feedback-texto').textContent = texto;
        document.getElementById('feedback-detalhe').textContent = detalhe || '';

        var btnProximo = document.getElementById('btn-proximo');
        if (acertou) {
            btnProximo.textContent = 'Próximo →';
            btnProximo.onclick = function() { Jogo.proximoDesafio(); };
        } else {
            btnProximo.textContent = 'Tentar de novo!';
            btnProximo.onclick = function() { Jogo._fecharFeedback(); };
        }

        overlay.classList.add('visivel');
    },

    _fecharFeedback: function() {
        document.getElementById('feedback-overlay').classList.remove('visivel');
    },

    proximoDesafio: function() {
        this._fecharFeedback();

        if (this.modo === 'troco') {
            this._carregarDesafioTroco();
            return;
        }

        this.fase++;
        App.progresso.fase = this.fase;

        var total = Niveis.totalFasesNivel(this.nivel);
        if (this.fase >= total) {
            this._completarNivel();
            return;
        }

        var analise = Adaptativo.analisar(App.progresso);
        if (analise.acao === 'aumentar' && this.fase >= total - 2) {
            this._completarNivel();
            return;
        }

        Storage.salvar(App.progresso);
        this._carregarDesafio();
    },

    _completarNivel: function() {
        var defNivel = Niveis.obterNivel(this.nivel);
        Recompensas.mostrarCelebracao(
            'Nível ' + this.nivel + ' Completo!',
            'Você dominou: ' + defNivel.nome + '!',
            defNivel.badge
        );

        Sons.tocar('nivel');
    },

    avancarNivel: function() {
        Recompensas.fecharCelebracao();

        this.nivel++;
        this.fase = 0;
        App.progresso.nivel = this.nivel;
        App.progresso.fase = 0;

        var defNivel = Niveis.obterNivel(this.nivel);
        App.progresso.moedasDesbloqueadas = defNivel.moedas;

        if (this.nivel >= 5) {
            App.progresso.desafioDesbloqueado = true;
        }

        Storage.salvar(App.progresso);
        Recompensas.verificarBadges(App.progresso);

        this._carregarDesafio();
    },

    mostrarDica: function() {
        this.dicaUsada = true;
        Sons.tocar('click');

        var dicaAnterior = document.querySelector('.dica-container');
        if (dicaAnterior) dicaAnterior.remove();

        var dica = this.desafioAtual.dica || 'Tente combinar moedas diferentes!';
        var dicaEl = document.createElement('div');
        dicaEl.className = 'dica-container';
        dicaEl.innerHTML =
            '<span class="dica-icone">💡</span>' +
            '<span class="dica-texto">' + dica + '</span>';

        var area = document.querySelector('.jogo-area');
        area.insertBefore(dicaEl, document.querySelector('.acoes-container'));
    }
};

// Scripts carregados no final do body, DOM ja esta pronto
App.init();
