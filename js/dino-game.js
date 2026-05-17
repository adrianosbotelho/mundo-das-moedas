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
    chao: 0,
    frameCount: 0,
    nuvens: [],
    tempoUltimoObstaculo: 0,

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
        this.pontos = 0;
        this.velocidade = 4;
        this.gameOver = false;
        this.frameCount = 0;
        this.tempoUltimoObstaculo = 0;
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

        this._configurarControles();
        this._loop();

        document.getElementById('dino-pontos').textContent = '0';
        document.getElementById('dino-melhor').textContent = this.melhorPontuacao;
        document.getElementById('dino-game-over').style.display = 'none';
    },

    _ajustarCanvas: function() {
        var container = this.canvas.parentElement;
        this.canvas.width = Math.min(container.clientWidth - 20, 600);
        this.canvas.height = 250;
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
    },

    _removerControles: function() {
        if (this._onKeyDown) document.removeEventListener('keydown', this._onKeyDown);
        if (this._onTouch) this.canvas.removeEventListener('touchstart', this._onTouch);
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

        // Gerar obstaculos
        this.tempoUltimoObstaculo++;
        var intervaloMin = Math.max(60, 120 - this.pontos);
        if (this.tempoUltimoObstaculo > intervaloMin && Math.random() < 0.03) {
            var tipos = [
                { largura: 20, altura: 30, cor: '#8B4513', emoji: '🌵' },
                { largura: 24, altura: 24, cor: '#FF6347', emoji: '🧱' },
                { largura: 18, altura: 34, cor: '#228B22', emoji: '🌲' }
            ];
            var tipo = tipos[Math.floor(Math.random() * tipos.length)];
            this.obstaculos.push({
                x: this.canvas.width + 10,
                y: this.chao - tipo.altura,
                largura: tipo.largura,
                altura: tipo.altura,
                cor: tipo.cor,
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
                // Particulas de coleta
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

    _desenhar: function() {
        var ctx = this.ctx;
        var w = this.canvas.width;
        var h = this.canvas.height;

        // Ceu gradiente
        var grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#87CEEB');
        grad.addColorStop(1, '#E0F0FF');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Nuvens
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        this.nuvens.forEach(function(n) {
            ctx.beginPath();
            ctx.arc(n.x, n.y, 15, 0, Math.PI * 2);
            ctx.arc(n.x + 15, n.y - 5, 12, 0, Math.PI * 2);
            ctx.arc(n.x + 30, n.y, 15, 0, Math.PI * 2);
            ctx.fill();
        });

        // Chao
        ctx.fillStyle = '#8B7355';
        ctx.fillRect(0, this.chao, w, h - this.chao);
        ctx.fillStyle = '#6B8E23';
        ctx.fillRect(0, this.chao, w, 4);

        // Linhas do chao
        ctx.strokeStyle = '#7A6B4F';
        ctx.lineWidth = 1;
        for (var i = 0; i < w; i += 30) {
            var offset = (this.frameCount * this.velocidade + i) % w;
            ctx.beginPath();
            ctx.moveTo(w - offset, this.chao + 8);
            ctx.lineTo(w - offset + 10, this.chao + 8);
            ctx.stroke();
        }

        // Obstaculos
        var self = this;
        ctx.font = '28px serif';
        ctx.textAlign = 'center';
        this.obstaculos.forEach(function(o) {
            ctx.fillText(o.emoji, o.x + o.largura / 2, o.y + o.altura - 2);
        });

        // Moedas
        this.moedas.forEach(function(m) {
            if (m.coletada) return;
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
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
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
    },

    _fimDeJogo: function() {
        this.gameOver = true;
        Sons.tocar('erro');

        if (this.pontos > this.melhorPontuacao) {
            this.melhorPontuacao = this.pontos;
            localStorage.setItem('dino_melhor', this.melhorPontuacao.toString());
            document.getElementById('dino-melhor').textContent = this.melhorPontuacao;
        }

        // Estrelas bonus por jogar bem
        var estrelasBonus = Math.floor(this.pontos / 20);
        if (estrelasBonus > 0) {
            App.progresso.estrelas += estrelasBonus;
            Storage.salvar(App.progresso);
        }

        var overEl = document.getElementById('dino-game-over');
        document.getElementById('dino-final-pontos').textContent = this.pontos;
        document.getElementById('dino-bonus-estrelas').textContent = estrelasBonus;
        overEl.style.display = 'flex';
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
