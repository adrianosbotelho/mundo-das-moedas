// Sons do jogo usando Web Audio API (sem arquivos externos)
const Sons = {
    ctx: null,
    ativo: true,

    init() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    },

    garantirCtx() {
        if (!this.ctx) this.init();
        if (this.ctx.state === 'suspended') this.ctx.resume();
    },

    toggle() {
        this.ativo = !this.ativo;
        const btn = document.getElementById('btn-audio');
        if (btn) {
            btn.textContent = this.ativo ? '🔊' : '🔇';
            btn.classList.toggle('mudo', !this.ativo);
        }
    },

    tocar(tipo) {
        if (!this.ativo) return;
        this.garantirCtx();

        switch (tipo) {
            case 'moeda': this._somMoeda(); break;
            case 'acerto': this._somAcerto(); break;
            case 'erro': this._somErro(); break;
            case 'estrela': this._somEstrela(); break;
            case 'nivel': this._somNivel(); break;
            case 'click': this._somClick(); break;
        }
    },

    _criarOsc(freq, tipo, duracao, volume = 0.3) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = tipo;
        osc.frequency.value = freq;
        gain.gain.value = volume;
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duracao);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duracao);
    },

    _somMoeda() {
        this._criarOsc(800, 'sine', 0.1, 0.2);
        setTimeout(() => this._criarOsc(1200, 'sine', 0.1, 0.15), 50);
    },

    _somAcerto() {
        const notas = [523, 659, 784, 1047];
        notas.forEach((f, i) => {
            setTimeout(() => this._criarOsc(f, 'sine', 0.2, 0.2), i * 80);
        });
    },

    _somErro() {
        this._criarOsc(200, 'triangle', 0.3, 0.15);
    },

    _somEstrela() {
        this._criarOsc(880, 'sine', 0.1, 0.2);
        setTimeout(() => this._criarOsc(1100, 'sine', 0.15, 0.2), 80);
        setTimeout(() => this._criarOsc(1320, 'sine', 0.2, 0.2), 160);
    },

    _somNivel() {
        const notas = [523, 587, 659, 784, 880, 1047];
        notas.forEach((f, i) => {
            setTimeout(() => this._criarOsc(f, 'sine', 0.25, 0.2), i * 100);
        });
    },

    _somClick() {
        this._criarOsc(600, 'sine', 0.05, 0.1);
    }
};
