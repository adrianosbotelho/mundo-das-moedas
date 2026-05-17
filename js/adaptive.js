// Motor adaptativo: ajusta dificuldade baseado no desempenho
const Adaptativo = {
    // Analisa historico recente e decide ajustes
    analisar(progresso) {
        const ultimas = progresso.historico.slice(-10);
        if (ultimas.length < 3) return { acao: 'manter' };

        const acertos = ultimas.filter(t => t.acertou).length;
        const taxa = acertos / ultimas.length;

        if (taxa >= 0.9) {
            return { acao: 'aumentar', motivo: 'Muito bem! Vamos tentar algo mais difícil!' };
        } else if (taxa <= 0.4) {
            return { acao: 'reduzir', motivo: 'Vamos praticar mais um pouquinho!' };
        }
        return { acao: 'manter' };
    },

    // Detecta padroes de erro especificos
    detectarDificuldades(progresso) {
        const erros = progresso.historico
            .filter(t => !t.acertou)
            .slice(-20);

        const dificuldades = {};

        erros.forEach(erro => {
            const chave = `valor_${erro.valorAlvo}`;
            dificuldades[chave] = (dificuldades[chave] || 0) + 1;

            if (erro.valorColocado) {
                const diff = Math.abs(erro.valorAlvo - erro.valorColocado);
                if (diff <= 5) {
                    dificuldades['quase_acertou'] = (dificuldades['quase_acertou'] || 0) + 1;
                }
                if (erro.valorColocado > erro.valorAlvo) {
                    dificuldades['excede_valor'] = (dificuldades['excede_valor'] || 0) + 1;
                }
            }
        });

        return dificuldades;
    },

    // Gera exercicio focado em dificuldades detectadas
    gerarExercicioFocado(progresso, nivel) {
        const dificuldades = this.detectarDificuldades(progresso);
        const defNivel = Niveis.obterNivel(nivel);

        // Se erra muito por exceder valor, dar valores menores
        if (dificuldades['excede_valor'] > 3) {
            const valoresFaceis = defNivel.desafios
                .filter(d => d.valor <= 50)
                .map(d => d.valor);
            if (valoresFaceis.length > 0) {
                const valor = valoresFaceis[Math.floor(Math.random() * valoresFaceis.length)];
                return { valor, dica: 'Tente usar menos moedas!', focado: true };
            }
        }

        // Se erra valores especificos, repetir
        const valoresProblematicos = Object.entries(dificuldades)
            .filter(([k, v]) => k.startsWith('valor_') && v >= 2)
            .map(([k]) => parseInt(k.replace('valor_', '')));

        if (valoresProblematicos.length > 0) {
            const valor = valoresProblematicos[Math.floor(Math.random() * valoresProblematicos.length)];
            return { valor, dica: `Vamos praticar ${this.formatarValor(valor)} de novo!`, focado: true };
        }

        return null;
    },

    mensagemIncentivo(progresso, acertou, tentativas) {
        if (acertou) {
            if (progresso.sequenciaAtual >= 10) {
                return this._sortear([
                    "INACREDITÁVEL! " + progresso.sequenciaAtual + " seguidos! Você é demais! 🌈",
                    "Que coisa mais linda! A Moedinha está orgulhosa! 🦊✨",
                    "Isso é histórico! Ninguém te segura! 🚀🔥"
                ]);
            }
            if (progresso.sequenciaAtual >= 5) {
                return this._sortear([
                    "Incrível! Você está em uma sequência fantástica! 🔥",
                    "Uau! Ninguém te para! 🚀",
                    "Que sequência maravilhosa! Continue assim! ⭐",
                    "A Moedinha está dançando de alegria! 🦊💃"
                ]);
            }
            if (progresso.sequenciaAtual >= 3) {
                return this._sortear([
                    "Muito bem! Você está pegando o jeito! 🌟",
                    "Excelente! Isso aí! 💪",
                    "Boa! Continue assim que está ótimo! 😊",
                    "Tá ficando fera! A Moedinha tá impressionada! 🦊"
                ]);
            }
            if (tentativas === 1) {
                return this._sortear([
                    "Perfeito! De primeira! 🎯",
                    "Acertou de cara! Demais! 🏆",
                    "Parabéns! Certinho! ✨",
                    "Wow! Nem precisou pensar duas vezes! 🧠",
                    "Resposta na lata! Incrível! 🎯"
                ]);
            }
            if (progresso.acertosTotal === 10) {
                return "🎮 PARABÉNS! Você desbloqueou o mini-jogo Corrida da Moedinha! Vá em Modos de Jogo!";
            }
            return this._sortear([
                "Isso! Muito bem! 😊",
                "Boa! Conseguiu! 🎉",
                "Legal! Acertou! ⭐",
                "Mandou bem! 👏",
                "A Moedinha ficou feliz! 🦊",
                "Arrasou! Continue assim! 💪"
            ]);
        }

        if (tentativas >= 3) {
            return this._sortear([
                "Quase lá! Quer uma dica? 💡",
                "Tá pertinho! Vou te ajudar! 🤗",
                "Não desista! Vamos juntos! 💪",
                "A Moedinha acredita em você! Tenta mais uma vez! 🦊",
                "Calma, respira! Você vai conseguir! 🌟"
            ]);
        }
        if (tentativas >= 2) {
            return this._sortear([
                "Quase! Olha bem os valores das moedas! 👀",
                "Tá perto! Conta nos dedinhos se precisar! 🖐️",
                "Hmm, tenta montar de outro jeito! 🔄"
            ]);
        }
        return this._sortear([
            "Ops! Tenta de novo! Você consegue! 😊",
            "Quase! Vamos tentar de novo! 🌟",
            "Hmm, não foi dessa vez. Mais uma tentativa! 💪",
            "Eita! Mas tá no caminho certo! 😄",
            "Opa! Que tal tentar com outras moedas? 🪙"
        ]);
    },

    // Mensagem explicativa quando erra
    explicarErro(valorAlvo, valorColocado, moedasUsadas) {
        const diff = valorAlvo - valorColocado;

        if (valorColocado === 0) {
            return "Arraste moedas para a área acima! Cada moeda tem um valor.";
        }

        if (diff > 0) {
            return `Faltam ${this.formatarValor(diff)}! Tente adicionar mais moedas.`;
        }

        if (diff < 0) {
            return `Passou ${this.formatarValor(-diff)} do valor! Tente tirar uma moeda clicando nela.`;
        }

        return "";
    },

    formatarValor(centavos) {
        const reais = Math.floor(centavos / 100);
        const cents = centavos % 100;
        return `R$ ${reais},${cents.toString().padStart(2, '0')}`;
    },

    formatarContaVertical(moedasUsadas, total) {
        if (moedasUsadas.length === 0) return '';

        const fmt = v => {
            const r = Math.floor(v / 100);
            const c = v % 100;
            return r + ',' + c.toString().padStart(2, '0');
        };

        if (moedasUsadas.length === 1) {
            return `<div class="conta-linha conta-linha-unica">${fmt(moedasUsadas[0])}</div>`;
        }

        let html = `<div class="conta-linha">${fmt(moedasUsadas[0])}</div>`;
        for (let i = 1; i < moedasUsadas.length; i++) {
            html += `<div class="conta-linha conta-linha-operador">${fmt(moedasUsadas[i])}</div>`;
        }
        html += `<div class="conta-linha conta-linha-resultado">${fmt(total)}</div>`;
        return html;
    },

    _sortear(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }
};
