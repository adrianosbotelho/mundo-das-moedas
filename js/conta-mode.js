// Modo Conta: a crianca monta a resposta arrastando algarismos
var ContaMode = {
    desafios: [],
    desafioIdx: 0,
    desafioAtual: null,
    respostaSlots: [],
    tentativas: 0,
    dicaUsada: false,
    fase: 0,

    // Gera desafios baseados no nivel do jogador
    gerarDesafios: function(nivel) {
        var desafios = [];
        var moedas = Niveis.obterNivel(nivel).moedas;

        for (var i = 0; i < 8; i++) {
            var a = moedas[Math.floor(Math.random() * moedas.length)];
            var b = moedas[Math.floor(Math.random() * moedas.length)];
            desafios.push({
                parcela1: a,
                parcela2: b,
                resultado: a + b
            });
        }
        return desafios;
    },

    iniciar: function() {
        var nivel = App.progresso.nivel;
        this.desafios = this.gerarDesafios(nivel);
        this.desafioIdx = 0;
        this.fase = 0;
        this._carregarDesafio();
        this._configurarEventos();
        this._atualizarHeader();
    },

    _carregarDesafio: function() {
        this.desafioAtual = this.desafios[this.desafioIdx % this.desafios.length];
        this.tentativas = 0;
        this.dicaUsada = false;

        this._renderizarProblema();
        this._renderizarSlots();

        var fmt = Adaptativo.formatarValor;
        document.getElementById('conta-instrucao').textContent =
            'Quanto é ' + fmt(this.desafioAtual.parcela1) + ' + ' + fmt(this.desafioAtual.parcela2) + '? Monte a resposta!';
    },

    _renderizarProblema: function() {
        var el = document.getElementById('conta-problema');
        var fmt = function(v) {
            var r = Math.floor(v / 100);
            var c = v % 100;
            return r + ',' + (c < 10 ? '0' + c : c);
        };

        var d = this.desafioAtual;
        el.innerHTML =
            '<div class="conta-problema-linha">' + fmt(d.parcela1) + '</div>' +
            '<div class="conta-problema-linha">' +
                '<span class="conta-problema-operador">+</span>' + fmt(d.parcela2) +
            '</div>' +
            '<div class="conta-problema-traco"></div>' +
            '<div class="conta-problema-linha conta-problema-resultado">?</div>';
    },

    _renderizarSlots: function() {
        var container = document.getElementById('conta-resposta-slots');
        container.innerHTML = '';
        container.classList.remove('conta-resposta-correto');
        this.respostaSlots = [];

        // Determinar quantos digitos a resposta tem
        var resultado = this.desafioAtual.resultado;
        var resStr = this._formatarResultado(resultado);

        for (var i = 0; i < resStr.length; i++) {
            var ch = resStr[i];
            if (ch === ',') {
                var virg = document.createElement('div');
                virg.className = 'slot-resposta virgula-slot';
                virg.textContent = ',';
                container.appendChild(virg);
                this.respostaSlots.push({ tipo: 'virgula', valor: ',', el: virg });
            } else {
                var slot = document.createElement('div');
                slot.className = 'slot-resposta';
                slot.dataset.indice = i;
                slot.dataset.correto = ch;
                container.appendChild(slot);
                this.respostaSlots.push({ tipo: 'digito', valor: null, el: slot, correto: ch });
            }
        }
    },

    _formatarResultado: function(centavos) {
        var r = Math.floor(centavos / 100);
        var c = centavos % 100;
        return r + ',' + (c < 10 ? '0' + c : c);
    },

    _configurarEventos: function() {
        var algarismos = document.getElementById('algarismos-container');
        var slotsContainer = document.getElementById('conta-resposta-slots');
        var self = this;

        // Drag start nos algarismos
        algarismos.addEventListener('dragstart', function(e) {
            var alg = e.target.closest('.algarismo');
            if (alg) {
                e.dataTransfer.setData('text/plain', alg.dataset.valor);
                e.dataTransfer.effectAllowed = 'copy';
                alg.classList.add('dragging');
            }
        });

        algarismos.addEventListener('dragend', function(e) {
            var alg = e.target.closest('.algarismo');
            if (alg) alg.classList.remove('dragging');
        });

        // Click nos algarismos: preenche proximo slot vazio
        algarismos.onclick = function(e) {
            var alg = e.target.closest('.algarismo');
            if (alg) {
                self._preencherProximoSlot(alg.dataset.valor);
                Sons.tocar('moeda');
            }
        };

        // Drag over/drop nos slots
        slotsContainer.addEventListener('dragover', function(e) {
            var slot = e.target.closest('.slot-resposta:not(.virgula-slot)');
            if (slot) {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
                slot.classList.add('drag-over');
            }
        });

        slotsContainer.addEventListener('dragleave', function(e) {
            var slot = e.target.closest('.slot-resposta');
            if (slot) slot.classList.remove('drag-over');
        });

        slotsContainer.addEventListener('drop', function(e) {
            e.preventDefault();
            var slot = e.target.closest('.slot-resposta:not(.virgula-slot)');
            if (slot) {
                slot.classList.remove('drag-over');
                var valor = e.dataTransfer.getData('text/plain');
                self._preencherSlot(slot, valor);
                Sons.tocar('moeda');
            }
        });

        // Click nos slots preenchidos para limpar
        slotsContainer.onclick = function(e) {
            var slot = e.target.closest('.slot-resposta.preenchido');
            if (slot) {
                self._limparSlot(slot);
                Sons.tocar('click');
            }
        };

        // Tornar algarismos draggable
        var algs = algarismos.querySelectorAll('.algarismo');
        algs.forEach(function(a) { a.draggable = true; });
    },

    _preencherProximoSlot: function(valor) {
        for (var i = 0; i < this.respostaSlots.length; i++) {
            var s = this.respostaSlots[i];
            if (s.tipo === 'digito' && s.valor === null) {
                this._preencherSlot(s.el, valor);
                return;
            }
        }
    },

    _preencherSlot: function(slotEl, valor) {
        var indice = slotEl.dataset.indice;
        for (var i = 0; i < this.respostaSlots.length; i++) {
            if (this.respostaSlots[i].el === slotEl && this.respostaSlots[i].tipo === 'digito') {
                this.respostaSlots[i].valor = valor;
                break;
            }
        }
        slotEl.textContent = valor;
        slotEl.classList.add('preenchido');
    },

    _limparSlot: function(slotEl) {
        for (var i = 0; i < this.respostaSlots.length; i++) {
            if (this.respostaSlots[i].el === slotEl) {
                this.respostaSlots[i].valor = null;
                break;
            }
        }
        slotEl.textContent = '';
        slotEl.classList.remove('preenchido');
    },

    limpar: function() {
        for (var i = 0; i < this.respostaSlots.length; i++) {
            var s = this.respostaSlots[i];
            if (s.tipo === 'digito') {
                s.valor = null;
                s.el.textContent = '';
                s.el.classList.remove('preenchido');
            }
        }
        Sons.tocar('click');
    },

    verificar: function() {
        // Verificar se todos os slots estao preenchidos
        var todosPreenchidos = true;
        var respostaMontada = '';
        for (var i = 0; i < this.respostaSlots.length; i++) {
            var s = this.respostaSlots[i];
            if (s.tipo === 'virgula') {
                respostaMontada += ',';
            } else if (s.valor !== null) {
                respostaMontada += s.valor;
            } else {
                todosPreenchidos = false;
            }
        }

        if (!todosPreenchidos) {
            document.getElementById('conta-instrucao').textContent =
                'Preencha todos os espaços antes de confirmar! 😊';
            return;
        }

        this.tentativas++;
        var respostaCorreta = this._formatarResultado(this.desafioAtual.resultado);
        var acertou = respostaMontada === respostaCorreta;

        Storage.registrarTentativa({
            acertou: acertou,
            valorAlvo: this.desafioAtual.resultado,
            valorColocado: respostaMontada,
            nivel: App.progresso.nivel,
            fase: this.fase,
            tentativas: this.tentativas,
            modo: 'conta',
            dicaUsada: this.dicaUsada
        });

        if (acertou) {
            this._acertou();
        } else {
            this._errou(respostaCorreta);
        }
    },

    _acertou: function() {
        App.progresso.acertosTotal++;
        App.progresso.sequenciaAtual++;
        if (App.progresso.sequenciaAtual > App.progresso.melhorSequencia) {
            App.progresso.melhorSequencia = App.progresso.sequenciaAtual;
        }

        var defNivel = Niveis.obterNivel(App.progresso.nivel);
        App.progresso.estrelas += defNivel.estrelasPorAcerto;
        Storage.salvar(App.progresso);
        Recompensas.verificarBadges(App.progresso);

        Sons.tocar('acerto');

        // Pintar slots de verde
        document.getElementById('conta-resposta-slots').classList.add('conta-resposta-correto');

        // Mostrar resultado no problema
        var fmt = this._formatarResultado(this.desafioAtual.resultado);
        var linhaResultado = document.querySelector('.conta-problema-resultado');
        if (linhaResultado) {
            linhaResultado.textContent = fmt;
            linhaResultado.style.color = '#2ECC71';
        }

        var msg = Adaptativo.mensagemIncentivo(App.progresso, true, this.tentativas);
        this._mostrarFeedback(true, msg, '+' + defNivel.estrelasPorAcerto + ' ⭐');
    },

    _errou: function(respostaCorreta) {
        App.progresso.errosTotal++;
        App.progresso.sequenciaAtual = 0;
        Storage.salvar(App.progresso);

        Sons.tocar('erro');

        var msg = Adaptativo.mensagemIncentivo(App.progresso, false, this.tentativas);
        var detalhe = 'A resposta certa é ' + respostaCorreta + '. Tente de novo!';

        if (this.tentativas >= 3) {
            detalhe = 'Dica: ' + this.desafioAtual.parcela1 + ' + ' + this.desafioAtual.parcela2 +
                ' = ' + this.desafioAtual.resultado + ' centavos. Em reais: ' + respostaCorreta;
        }

        this._mostrarFeedback(false, msg, detalhe);

        var container = document.getElementById('conta-resposta-slots');
        container.classList.add('shake');
        setTimeout(function() { container.classList.remove('shake'); }, 400);
    },

    _mostrarFeedback: function(acertou, texto, detalhe) {
        var overlay = document.getElementById('conta-feedback-overlay');
        document.getElementById('conta-feedback-icone').textContent = acertou ? '🎉' : '🤔';
        document.getElementById('conta-feedback-texto').textContent = texto;
        document.getElementById('conta-feedback-detalhe').textContent = detalhe || '';

        var btn = document.getElementById('conta-btn-proximo');
        var self = this;
        if (acertou) {
            btn.textContent = 'Próximo →';
            btn.onclick = function() { self._proximo(); };
        } else {
            btn.textContent = 'Tentar de novo!';
            btn.onclick = function() {
                overlay.classList.remove('visivel');
            };
        }

        overlay.classList.add('visivel');
    },

    _proximo: function() {
        document.getElementById('conta-feedback-overlay').classList.remove('visivel');
        this.desafioIdx++;
        this.fase++;

        if (this.fase >= 8) {
            this.fase = 0;
            this.desafios = this.gerarDesafios(App.progresso.nivel);
            this.desafioIdx = 0;
        }

        this._carregarDesafio();
        this._atualizarHeader();
    },

    _atualizarHeader: function() {
        document.getElementById('conta-nivel-badge').textContent = 'Nível ' + App.progresso.nivel;
        document.getElementById('conta-estrelas').textContent = App.progresso.estrelas;
        document.getElementById('conta-progresso-fill').style.width = (this.fase / 8 * 100) + '%';
        document.getElementById('conta-progresso-texto').textContent = this.fase + '/8';
    },

    dica: function() {
        this.dicaUsada = true;
        Sons.tocar('click');

        var d = this.desafioAtual;
        var fmt = Adaptativo.formatarValor;
        var resposta = this._formatarResultado(d.resultado);

        document.getElementById('conta-instrucao').textContent =
            fmt(d.parcela1) + ' + ' + fmt(d.parcela2) + ' = ' + fmt(d.resultado) +
            '. Coloque: ' + resposta.split('').filter(function(c) { return c !== ','; }).join(', ');
    }
};
