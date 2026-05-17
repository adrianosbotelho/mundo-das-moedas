// Persistencia local do progresso da crianca
const Storage = {
    CHAVE: 'mundo_moedas_v1',

    padrao() {
        return {
            nivel: 1,
            fase: 0,
            estrelas: 0,
            acertosTotal: 0,
            errosTotal: 0,
            melhorSequencia: 0,
            sequenciaAtual: 0,
            badges: [],
            moedasDesbloqueadas: [5, 10],
            historico: [],
            dificuldadesDetectadas: {},
            ultimaSessao: null,
            tempoTotal: 0,
            desafioDesbloqueado: false
        };
    },

    carregar() {
        try {
            const dados = localStorage.getItem(this.CHAVE);
            if (dados) {
                return { ...this.padrao(), ...JSON.parse(dados) };
            }
        } catch (e) {
            console.warn('Erro ao carregar progresso:', e);
        }
        return this.padrao();
    },

    salvar(dados) {
        try {
            dados.ultimaSessao = new Date().toISOString();
            localStorage.setItem(this.CHAVE, JSON.stringify(dados));
        } catch (e) {
            console.warn('Erro ao salvar progresso:', e);
        }
    },

    registrarTentativa(resultado) {
        const dados = this.carregar();
        dados.historico.push({
            timestamp: Date.now(),
            ...resultado
        });
        // Manter apenas ultimas 200 tentativas
        if (dados.historico.length > 200) {
            dados.historico = dados.historico.slice(-200);
        }
        this.salvar(dados);
    },

    resetar() {
        localStorage.removeItem(this.CHAVE);
    }
};
