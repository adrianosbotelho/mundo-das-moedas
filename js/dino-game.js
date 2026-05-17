// Mini-jogo runner estilo Chrome Dino como recompensa
var DinoGame = {
    canvas: null,
    ctx: null,
    ativo: false,
    animFrame: null,
    pontos: 0,
    melhorPontuacao: 0,
    velocidade: 4,
    gravidade: 0.6,
    gameOver: false,

    jogador: { x: 60, y: 0, vy: 0, largura: 36, altura: 36, pulando: false },
    obstaculos: [],
    moedas: [],
    particulas: [],
    estrelasCeu: [],
    chao: 0,
    frameCount: 0,
    nuvens: [],
    tempoUltimoObstaculo: 0,

    // Ciclo dia/noite
    fase: 'dia',
    transicao: 0, // 0 = dia puro, 1 = noite pura
    transicaoAlvo: 0,

    iniciar: function() {
        this.canvas = document.getElementById('dino-canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this._ajustarCanvas();

        this.chao = this.canvas.height - 50;
        this.jogador.y = this.chao - this.jogador.altura;
        this.jogador.vy = 0;
        this.jogador.pulando = false;
        this.obstaculos = [];
        this.moedas = [];
        this.particulas = [];
        this.nuvens = [];
        this.estrelasCeu = [];
        this.pontos = 0;
        this.velocidade = 4;
        this.gameOver = false;
        this.frameCount = 0;
        this.tempoUltimoObstaculo = 0;
        this.fase = 'dia';
        this.transicao = 0;
        this.transicaoAlvo = 0;
        this.ativo = true;

        var mp = parseInt(localStorage.getItem('dino_melhor') || '0');
        this.melhorPontuacao = mp;

        for (var i = 0; i < 3; i++) {
            this.nuvens.push({
                x: Math.random() * this.canvas.width,
                y: 30 + Math.random() * 60,
                vel: 0.5 + Math.random() * 0.5
            });
        }

        for (var i = 0; i < 20; i++) {
            this.estrelasCeu.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * (this.chao - 30),
                brilho: Math.random(),
                vel: 0.01 + Math.random() * 0.02
            });
        }

        this._configurarControles();
        this._loop();

        document.getElementById('dino-pontos').textContent = '0';
        document.getElementById('dino-melhor').textContent = this.melhorPontuacao;
        document.getElementById('dino-game-over').style.display = 'none';

        var btnPular = document.getElementById('btn-dino-pular');
        if (btnPular) btnPular.style.display = '';
    },

    _ajustarCanvas: function() {
        var container = this.canvas.parentElement;
        this.canvas.width = Math.min(container.clientWidth - 6, 600);
        var alturaDisponivel = container.clientHeight;
        this.canvas.height = Math.max(120, Math.min(alturaDisponivel - 10, 280));
    },

    _configurarControles: function() {
        var self = this;

        this._onKeyDown = function(e) {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();
                self._pular();
            }
        };

        this._onTouch = function(e) {
            e.preventDefault();
            self._pular();
        };

        document.addEventListener('keydown', this._onKeyDown);
        this.canvas.addEventListener('touchstart', this._onTouch, { passive: false });
        this.canvas.addEventListener('click', function() { self._pular(); });

        var btnPular = document.getElementById('btn-dino-pular');
        if (btnPular) {
            this._onBtnPular = function(e) {
                e.preventDefault();
                e.stopPropagation();
                self._pular();
            };
            btnPular.addEventListener('touchstart', this._onBtnPular, { passive: false });
            btnPular.onclick = this._onBtnPular;
        }
    },

    _removerControles: function() {
        if (this._onKeyDown) document.removeEventListener('keydown', this._onKeyDown);
        if (this._onTouch) this.canvas.removeEventListener('touchstart', this._onTouch);
        var btnPular = document.getElementById('btn-dino-pular');
        if (btnPular && this._onBtnPular) {
            btnPular.removeEventListener('touchstart', this._onBtnPular);
            btnPular.onclick = null;
        }
    },

    _pular: function() {
        if (this.gameOver) {
            this.iniciar();
            return;
        }
        if (!this.jogador.pulando) {
            this.jogador.vy = -12;
            this.jogador.pulando = true;
            Sons.tocar('click');
        }
    },

    _loop: function() {
        if (!this.ativo) return;
        var self = this;

        this._atualizar();
        this._desenhar();

        if (!this.gameOver) {
            this.animFrame = requestAnimationFrame(function() { self._loop(); });
        }
    },

    _atualizar: function() {
        this.frameCount++;

        // Gravidade
        this.jogador.vy += this.gravidade;
        this.jogador.y += this.jogador.vy;
        if (this.jogador.y >= this.chao - this.jogador.altura) {
            this.jogador.y = this.chao - this.jogador.altura;
            this.jogador.vy = 0;
            this.jogador.pulando = false;
        }

        // Velocidade aumenta gradualmente
        if (this.frameCount % 300 === 0) {
            this.velocidade += 0.3;
        }

        // Ciclo dia/noite: alterna a cada 100 pontos
        this._atualizarCiclo();

        // Gerar obstaculos
        this.tempoUltimoObstaculo++;
        var intervaloMin = Math.max(60, 120 - this.pontos);
        if (this.tempoUltimoObstaculo > intervaloMin && Math.random() < 0.03) {
            var tiposDia = [
                { largura: 20, altura: 30, emoji: '🌵' },
                { largura: 24, altura: 24, emoji: '🧱' },
                { largura: 18, altura: 34, emoji: '🌲' }
            ];
            var tiposNoite = [
                { largura: 20, altura: 30, emoji: '👻' },
                { largura: 24, altura: 28, emoji: '🦇' },
                { largura: 18, altura: 34, emoji: '🌲' }
            ];
            var tipos = this.fase === 'noite' ? tiposNoite : tiposDia;
            var tipo = tipos[Math.floor(Math.random() * tipos.length)];
            this.obstaculos.push({
                x: this.canvas.width + 10,
                y: this.chao - tipo.altura,
                largura: tipo.largura,
                altura: tipo.altura,
                emoji: tipo.emoji
            });
            this.tempoUltimoObstaculo = 0;
        }

        // Gerar moedas coletaveis
        if (this.frameCount % 90 === 0 && Math.random() < 0.5) {
            var alturas = [this.chao - 60, this.chao - 90, this.chao - 120];
            this.moedas.push({
                x: this.canvas.width + 10,
                y: alturas[Math.floor(Math.random() * alturas.length)],
                tamanho: 16,
                coletada: false
            });
        }

        // Mover obstaculos
        var self = this;
        this.obstaculos = this.obstaculos.filter(function(o) {
            o.x -= self.velocidade;
            return o.x > -50;
        });

        // Mover moedas
        this.moedas = this.moedas.filter(function(m) {
            m.x -= self.velocidade;
            return m.x > -50 && !m.coletada;
        });

        // Mover nuvens
        this.nuvens.forEach(function(n) {
            n.x -= n.vel;
            if (n.x < -40) {
                n.x = self.canvas.width + 40;
                n.y = 30 + Math.random() * 60;
            }
        });

        // Piscar estrelas do ceu
        this.estrelasCeu.forEach(function(e) {
            e.brilho += e.vel;
            if (e.brilho > 1 || e.brilho < 0) e.vel = -e.vel;
        });

        // Mover particulas
        this.particulas = this.particulas.filter(function(p) {
            p.x += p.vx;
            p.y += p.vy;
            p.vida--;
            return p.vida > 0;
        });

        // Colisao com obstaculos
        var j = this.jogador;
        for (var i = 0; i < this.obstaculos.length; i++) {
            var o = this.obstaculos[i];
            if (j.x + j.largura - 8 > o.x && j.x + 8 < o.x + o.largura &&
                j.y + j.altura - 4 > o.y) {
                this._fimDeJogo();
                return;
            }
        }

        // Coleta de moedas
        for (var i = 0; i < this.moedas.length; i++) {
            var m = this.moedas[i];
            if (!m.coletada &&
                j.x + j.largura > m.x && j.x < m.x + m.tamanho &&
                j.y + j.altura > m.y && j.y < m.y + m.tamanho) {
                m.coletada = true;
                this.pontos += 5;
                Sons.tocar('moeda');
                for (var p = 0; p < 6; p++) {
                    this.particulas.push({
                        x: m.x, y: m.y,
                        vx: (Math.random() - 0.5) * 4,
                        vy: (Math.random() - 0.5) * 4,
                        cor: '#FFD700',
                        vida: 20
                    });
                }
            }
        }

        // Pontos por distancia
        if (this.frameCount % 10 === 0) {
            this.pontos++;
            document.getElementById('dino-pontos').textContent = this.pontos;
        }
    },

    _atualizarCiclo: function() {
        var ciclo = Math.floor(this.pontos / 100) % 2;
        if (ciclo === 1 && this.fase !== 'noite') {
            this.fase = 'noite';
            this.transicaoAlvo = 1;
        } else if (ciclo === 0 && this.fase !== 'dia') {
            this.fase = 'dia';
            this.transicaoAlvo = 0;
        }

        // Transicao suave
        if (this.transicao < this.transicaoAlvo) {
            this.transicao = Math.min(this.transicao + 0.008, 1);
        } else if (this.transicao > this.transicaoAlvo) {
            this.transicao = Math.max(this.transicao - 0.008, 0);
        }
    },

    _lerp: function(a, b, t) {
        return a + (b - a) * t;
    },

    _lerpCor: function(r1, g1, b1, r2, g2, b2, t) {
        return 'rgb(' +
            Math.round(this._lerp(r1, r2, t)) + ',' +
            Math.round(this._lerp(g1, g2, t)) + ',' +
            Math.round(this._lerp(b1, b2, t)) + ')';
    },

    _desenhar: function() {
        var ctx = this.ctx;
        var w = this.canvas.width;
        var h = this.canvas.height;
        var t = this.transicao;

        // Ceu com transicao dia/noite
        var grad = ctx.createLinearGradient(0, 0, 0, h);
        var ceuTopo = this._lerpCor(135, 206, 235, 15, 15, 50, t);
        var ceuBase = this._lerpCor(224, 240, 255, 30, 30, 80, t);
        grad.addColorStop(0, ceuTopo);
        grad.addColorStop(1, ceuBase);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Lua (noite)
        if (t > 0.3) {
            var luaAlpha = Math.min((t - 0.3) / 0.3, 1);
            ctx.globalAlpha = luaAlpha;
            ctx.fillStyle = '#FFFDE7';
            ctx.beginPath();
            ctx.arc(w - 60, 45, 18, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = ceuTopo;
            ctx.beginPath();
            ctx.arc(w - 52, 40, 15, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }

        // Estrelas do ceu (noite)
        if (t > 0.2) {
            var estAlpha = Math.min((t - 0.2) / 0.3, 1);
            var self = this;
            this.estrelasCeu.forEach(function(e) {
                ctx.globalAlpha = estAlpha * e.brilho * 0.8;
                ctx.fillStyle = '#FFF';
                ctx.fillRect(e.x, e.y, 2, 2);
            });
            ctx.globalAlpha = 1;
        }

        // Nuvens (mais escuras a noite)
        var nuvemCor = this._lerpCor(255, 255, 255, 60, 60, 90, t);
        ctx.fillStyle = nuvemCor;
        ctx.globalAlpha = this._lerp(0.8, 0.4, t);
        this.nuvens.forEach(function(n) {
            ctx.beginPath();
            ctx.arc(n.x, n.y, 15, 0, Math.PI * 2);
            ctx.arc(n.x + 15, n.y - 5, 12, 0, Math.PI * 2);
            ctx.arc(n.x + 30, n.y, 15, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;

        // Chao
        var chaoCor = this._lerpCor(139, 115, 85, 50, 40, 30, t);
        ctx.fillStyle = chaoCor;
        ctx.fillRect(0, this.chao, w, h - this.chao);
        var gramaCor = this._lerpCor(107, 142, 35, 30, 60, 20, t);
        ctx.fillStyle = gramaCor;
        ctx.fillRect(0, this.chao, w, 4);

        // Linhas do chao
        var linhaCor = this._lerpCor(122, 107, 79, 40, 35, 25, t);
        ctx.strokeStyle = linhaCor;
        ctx.lineWidth = 1;
        for (var i = 0; i < w; i += 30) {
            var offset = (this.frameCount * this.velocidade + i) % w;
            ctx.beginPath();
            ctx.moveTo(w - offset, this.chao + 8);
            ctx.lineTo(w - offset + 10, this.chao + 8);
            ctx.stroke();
        }

        // Obstaculos
        ctx.font = '28px serif';
        ctx.textAlign = 'center';
        this.obstaculos.forEach(function(o) {
            ctx.fillText(o.emoji, o.x + o.largura / 2, o.y + o.altura - 2);
        });

        // Moedas
        this.moedas.forEach(function(m) {
            if (m.coletada) return;
            // Brilho ao redor da moeda a noite
            if (t > 0.3) {
                ctx.globalAlpha = t * 0.3;
                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                ctx.arc(m.x + 8, m.y + 8, 16, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
            }
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(m.x + 8, m.y + 8, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#B8860B';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = '#8B4513';
            ctx.font = 'bold 10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('$', m.x + 8, m.y + 12);
        });

        // Particulas
        this.particulas.forEach(function(p) {
            ctx.globalAlpha = p.vida / 20;
            ctx.fillStyle = p.cor;
            ctx.fillRect(p.x, p.y, 4, 4);
        });
        ctx.globalAlpha = 1;

        // Jogador (raposa mascote)
        var j = this.jogador;
        ctx.font = '32px serif';
        ctx.textAlign = 'center';

        // Sombra do jogador
        ctx.fillStyle = 'rgba(0,0,0,' + this._lerp(0.15, 0.05, t) + ')';
        ctx.beginPath();
        ctx.ellipse(j.x + j.largura / 2, this.chao + 2, 18, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Animacao de corrida
        var frame = Math.floor(this.frameCount / 6) % 2;
        if (j.pulando) {
            ctx.fillText('🦊', j.x + j.largura / 2, j.y + j.altura - 2);
        } else {
            ctx.save();
            if (frame === 1) ctx.translate(0, -2);
            ctx.fillText('🦊', j.x + j.largura / 2, j.y + j.altura - 2);
            ctx.restore();
        }

        // Indicador dia/noite
        if (t > 0.1 || t < 0.9) {
            ctx.font = '14px Arial';
            ctx.textAlign = 'left';
            ctx.fillStyle = t > 0.5 ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.3)';
            ctx.fillText(t > 0.5 ? '🌙 Noite' : '☀️ Dia', 8, 20);
        }
    },

    _fimDeJogo: function() {
        this.gameOver = true;
        Sons.tocar('erro');

        if (this.pontos > this.melhorPontuacao) {
            this.melhorPontuacao = this.pontos;
            localStorage.setItem('dino_melhor', this.melhorPontuacao.toString());
            document.getElementById('dino-melhor').textContent = this.melhorPontuacao;
        }

        var estrelasBonus = Math.floor(this.pontos / 20);
        if (estrelasBonus > 0) {
            App.progresso.estrelas += estrelasBonus;
            Storage.salvar(App.progresso);
        }

        var overEl = document.getElementById('dino-game-over');
        document.getElementById('dino-final-pontos').textContent = this.pontos;
        document.getElementById('dino-bonus-estrelas').textContent = estrelasBonus;
        overEl.style.display = 'flex';

        var btnPular = document.getElementById('btn-dino-pular');
        if (btnPular) btnPular.style.display = 'none';
    },

    parar: function() {
        this.ativo = false;
        if (this.animFrame) cancelAnimationFrame(this.animFrame);
        this._removerControles();
    },

    voltarMenu: function() {
        this.parar();
        App.voltarInicio();
    }
};
