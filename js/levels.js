// Definicao de niveis e fases do jogo
// Valores internos em centavos, exibidos como decimais (R$ 0,05)
const Niveis = {
    definicoes: [
        {
            nivel: 1,
            nome: "Primeiros Passos",
            descricao: "Somando com R$ 0,05 e R$ 0,10",
            moedas: [5, 10],
            desafios: [
                { valor: 10, dica: "0,05 + 0,05 = 0,10" },
                { valor: 5, dica: "Uma moeda de R$ 0,05!" },
                { valor: 15, dica: "0,10 + 0,05 = 0,15" },
                { valor: 20, dica: "0,10 + 0,10 = 0,20" },
                { valor: 25, dica: "0,10 + 0,10 + 0,05 = 0,25" },
                { valor: 30, dica: "0,10 + 0,10 + 0,10 = 0,30" },
                { valor: 20, dica: "0,10 + 0,10 = 0,20 ou 0,05 + 0,05 + 0,05 + 0,05 = 0,20" },
                { valor: 35, dica: "0,10 + 0,10 + 0,10 + 0,05 = 0,35" }
            ],
            estrelasPorAcerto: 1,
            badge: "🌟"
        },
        {
            nivel: 2,
            nome: "Moeda de R$ 0,25!",
            descricao: "Agora com moedas de R$ 0,25",
            moedas: [5, 10, 25],
            desafios: [
                { valor: 25, dica: "Uma moeda de R$ 0,25!" },
                { valor: 30, dica: "0,25 + 0,05 = 0,30" },
                { valor: 35, dica: "0,25 + 0,10 = 0,35" },
                { valor: 50, dica: "0,25 + 0,25 = 0,50 — metade de 1 real!" },
                { valor: 40, dica: "0,25 + 0,10 + 0,05 = 0,40" },
                { valor: 45, dica: "0,25 + 0,10 + 0,10 = 0,45" },
                { valor: 55, dica: "0,25 + 0,25 + 0,05 = 0,55" },
                { valor: 60, dica: "0,25 + 0,25 + 0,10 = 0,60" }
            ],
            estrelasPorAcerto: 1,
            badge: "🥈"
        },
        {
            nivel: 3,
            nome: "Moeda de R$ 0,50!",
            descricao: "A moeda de R$ 0,50 chegou",
            moedas: [5, 10, 25, 50],
            desafios: [
                { valor: 50, dica: "Uma moeda de R$ 0,50!" },
                { valor: 55, dica: "0,50 + 0,05 = 0,55" },
                { valor: 60, dica: "0,50 + 0,10 = 0,60" },
                { valor: 75, dica: "0,50 + 0,25 = 0,75" },
                { valor: 80, dica: "0,50 + 0,25 + 0,05 = 0,80" },
                { valor: 90, dica: "0,50 + 0,25 + 0,10 + 0,05 = 0,90" },
                { valor: 100, dica: "0,50 + 0,50 = 1,00 — isso é R$ 1,00!" },
                { valor: 65, dica: "0,50 + 0,10 + 0,05 = 0,65" }
            ],
            estrelasPorAcerto: 2,
            badge: "🥇"
        },
        {
            nivel: 4,
            nome: "R$ 1,00!",
            descricao: "Usando todas as moedas",
            moedas: [5, 10, 25, 50, 100],
            desafios: [
                { valor: 100, dica: "Uma moeda de R$ 1,00! Ou 0,50 + 0,50 = 1,00" },
                { valor: 125, dica: "1,00 + 0,25 = 1,25" },
                { valor: 150, dica: "1,00 + 0,50 = 1,50" },
                { valor: 175, dica: "1,00 + 0,50 + 0,25 = 1,75" },
                { valor: 200, dica: "1,00 + 1,00 = 2,00" },
                { valor: 110, dica: "1,00 + 0,10 = 1,10" },
                { valor: 130, dica: "1,00 + 0,25 + 0,05 = 1,30" },
                { valor: 155, dica: "1,00 + 0,50 + 0,05 = 1,55" }
            ],
            estrelasPorAcerto: 2,
            badge: "💎"
        },
        {
            nivel: 5,
            nome: "Mestre dos Decimais",
            descricao: "Valores maiores e contas mais complexas",
            moedas: [5, 10, 25, 50, 100],
            desafios: [
                { valor: 235, dica: "1,00 + 1,00 + 0,25 + 0,10 = 2,35" },
                { valor: 180, dica: "1,00 + 0,50 + 0,25 + 0,05 = 1,80" },
                { valor: 275, dica: "1,00 + 1,00 + 0,50 + 0,25 = 2,75" },
                { valor: 310, dica: "1,00 + 1,00 + 1,00 + 0,10 = 3,10" },
                { valor: 195, dica: "1,00 + 0,50 + 0,25 + 0,10 + 0,10 = 1,95" },
                { valor: 250, dica: "1,00 + 1,00 + 0,50 = 2,50" },
                { valor: 340, dica: "1,00 + 1,00 + 1,00 + 0,25 + 0,10 + 0,05 = 3,40" },
                { valor: 400, dica: "1,00 + 1,00 + 1,00 + 1,00 = 4,00" }
            ],
            estrelasPorAcerto: 3,
            badge: "👑"
        },
        {
            nivel: 6,
            nome: "Somando com Vai-Um",
            descricao: "Contas que passam de R$ 1,00 nos centavos",
            moedas: [5, 10, 25, 50, 100],
            desafios: [
                { valor: 105, dica: "0,50 + 0,50 + 0,05 = 1,05 — os centavos somam mais que 100!" },
                { valor: 160, dica: "0,50 + 0,50 + 0,50 + 0,10 = 1,60" },
                { valor: 115, dica: "0,50 + 0,25 + 0,25 + 0,10 + 0,05 = 1,15" },
                { valor: 210, dica: "1,00 + 0,50 + 0,50 + 0,10 = 2,10" },
                { valor: 355, dica: "1,00 + 1,00 + 0,50 + 0,50 + 0,50 + 0,05 = 3,55" },
                { valor: 260, dica: "1,00 + 0,50 + 0,50 + 0,25 + 0,25 + 0,10 = 2,60" },
                { valor: 185, dica: "0,50 + 0,50 + 0,50 + 0,25 + 0,10 = 1,85" },
                { valor: 420, dica: "1,00 + 1,00 + 1,00 + 1,00 + 0,10 + 0,10 = 4,20" },
                { valor: 305, dica: "1,00 + 1,00 + 0,50 + 0,50 + 0,05 = 3,05" },
                { valor: 475, dica: "1,00 + 1,00 + 1,00 + 1,00 + 0,50 + 0,25 = 4,75" }
            ],
            estrelasPorAcerto: 3,
            badge: "🧮"
        },
        {
            nivel: 7,
            nome: "Troco Esperto",
            descricao: "Monte valores usando o menor número de moedas",
            moedas: [5, 10, 25, 50, 100],
            desafios: [
                { valor: 75, dica: "Use 0,50 + 0,25 = 0,75 (só 2 moedas!)" },
                { valor: 150, dica: "Use 1,00 + 0,50 = 1,50 (só 2 moedas!)" },
                { valor: 85, dica: "Use 0,50 + 0,25 + 0,10 = 0,85 (3 moedas)" },
                { valor: 195, dica: "Use 1,00 + 0,50 + 0,25 + 0,10 + 0,10 = 1,95" },
                { valor: 230, dica: "Use 1,00 + 1,00 + 0,25 + 0,05 = 2,30" },
                { valor: 365, dica: "Use 1,00 + 1,00 + 1,00 + 0,50 + 0,10 + 0,05 = 3,65" },
                { valor: 445, dica: "1,00 + 1,00 + 1,00 + 1,00 + 0,25 + 0,10 + 0,10 = 4,45" },
                { valor: 290, dica: "1,00 + 1,00 + 0,50 + 0,25 + 0,10 + 0,05 = 2,90" },
                { valor: 510, dica: "1,00 + 1,00 + 1,00 + 1,00 + 1,00 + 0,10 = 5,10" },
                { valor: 385, dica: "1,00 + 1,00 + 1,00 + 0,50 + 0,25 + 0,10 = 3,85" }
            ],
            estrelasPorAcerto: 4,
            badge: "🦉"
        },
        {
            nivel: 8,
            nome: "Desafio do Mercado",
            descricao: "Valores do dia a dia — compras de verdade!",
            moedas: [5, 10, 25, 50, 100],
            desafios: [
                { valor: 350, dica: "Preço de um salgadinho: R$ 3,50" },
                { valor: 275, dica: "Preço de um suco: R$ 2,75" },
                { valor: 490, dica: "Preço de um doce: R$ 4,90" },
                { valor: 525, dica: "1,00 + 1,00 + 1,00 + 1,00 + 1,00 + 0,25 = 5,25" },
                { valor: 315, dica: "1,00 + 1,00 + 1,00 + 0,10 + 0,05 = 3,15" },
                { valor: 450, dica: "1,00 + 1,00 + 1,00 + 1,00 + 0,50 = 4,50" },
                { valor: 185, dica: "1,00 + 0,50 + 0,25 + 0,10 = 1,85" },
                { valor: 640, dica: "1,00 × 6 + 0,25 + 0,10 + 0,05 = 6,40" },
                { valor: 555, dica: "1,00 × 5 + 0,50 + 0,05 = 5,55" },
                { valor: 720, dica: "1,00 × 7 + 0,10 + 0,10 = 7,20" }
            ],
            estrelasPorAcerto: 4,
            badge: "🛍️"
        },
        {
            nivel: 9,
            nome: "Conta de Cabeça",
            descricao: "Somas rápidas com valores misturados",
            moedas: [5, 10, 25, 50, 100],
            desafios: [
                { valor: 95, dica: "0,50 + 0,25 + 0,10 + 0,10 = 0,95 — quase 1 real!" },
                { valor: 165, dica: "1,00 + 0,50 + 0,10 + 0,05 = 1,65" },
                { valor: 435, dica: "1,00 + 1,00 + 1,00 + 1,00 + 0,25 + 0,10 = 4,35" },
                { valor: 580, dica: "1,00 × 5 + 0,50 + 0,25 + 0,05 = 5,80" },
                { valor: 345, dica: "1,00 + 1,00 + 1,00 + 0,25 + 0,10 + 0,10 = 3,45" },
                { valor: 770, dica: "1,00 × 7 + 0,50 + 0,10 + 0,10 = 7,70" },
                { valor: 215, dica: "1,00 + 1,00 + 0,10 + 0,05 = 2,15" },
                { valor: 660, dica: "1,00 × 6 + 0,50 + 0,10 = 6,60" },
                { valor: 895, dica: "1,00 × 8 + 0,50 + 0,25 + 0,10 + 0,10 = 8,95" },
                { valor: 500, dica: "1,00 × 5 = 5,00 — cinco reais certinhos!" }
            ],
            estrelasPorAcerto: 5,
            badge: "🧠"
        },
        {
            nivel: 10,
            nome: "Grande Mestre das Moedas",
            descricao: "O desafio final! Valores grandes e contas complexas",
            moedas: [5, 10, 25, 50, 100],
            desafios: [
                { valor: 999, dica: "1,00 × 9 + 0,50 + 0,25 + 0,10 + 0,10 + 0,04? Não! 0,99 = 0,50 + 0,25 + 0,10 + 0,10 + 0,04... Use 9 × 1,00 + 0,50 + 0,25 + 0,10 + 0,10 + 0,04" },
                { valor: 750, dica: "1,00 × 7 + 0,50 = 7,50" },
                { valor: 825, dica: "1,00 × 8 + 0,25 = 8,25" },
                { valor: 680, dica: "1,00 × 6 + 0,50 + 0,25 + 0,05 = 6,80" },
                { valor: 935, dica: "1,00 × 9 + 0,25 + 0,10 = 9,35" },
                { valor: 570, dica: "1,00 × 5 + 0,50 + 0,10 + 0,10 = 5,70" },
                { valor: 1000, dica: "1,00 × 10 = 10,00 — dez reais!" },
                { valor: 845, dica: "1,00 × 8 + 0,25 + 0,10 + 0,10 = 8,45" },
                { valor: 615, dica: "1,00 × 6 + 0,10 + 0,05 = 6,15" },
                { valor: 990, dica: "1,00 × 9 + 0,50 + 0,25 + 0,10 + 0,05 = 9,90" }
            ],
            estrelasPorAcerto: 5,
            badge: "🏅"
        }
    ],

    obterNivel(n) {
        return this.definicoes[Math.min(n - 1, this.definicoes.length - 1)];
    },

    obterDesafio(nivel, fase) {
        const def = this.obterNivel(nivel);
        return def.desafios[fase % def.desafios.length];
    },

    totalFasesNivel(nivel) {
        return this.obterNivel(nivel).desafios.length;
    },

    gerarDesafioTroco(nivel) {
        const fmt = Adaptativo.formatarValor;
        const produtos = [
            { nome: "Pirulito", emoji: "🍭", preco: 25 },
            { nome: "Chiclete", emoji: "🫧", preco: 50 },
            { nome: "Bala", emoji: "🍬", preco: 15 },
            { nome: "Biscoito", emoji: "🍪", preco: 75 },
            { nome: "Suco", emoji: "🧃", preco: 150 },
            { nome: "Pipoca", emoji: "🍿", preco: 200 },
            { nome: "Sorvete", emoji: "🍦", preco: 250 },
            { nome: "Chocolate", emoji: "🍫", preco: 175 }
        ];

        const produto = produtos[Math.floor(Math.random() * produtos.length)];
        const pagamentos = [100, 200, 300, 500];
        const pagamento = pagamentos.find(p => p > produto.preco) || 500;
        const troco = pagamento - produto.preco;

        return {
            tipo: 'troco',
            produto,
            pagamento,
            valor: troco,
            dica: `${fmt(pagamento)} - ${fmt(produto.preco)} = ${fmt(troco)}`
        };
    }
};
