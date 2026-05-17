// Mecanica de moedas: drag-and-drop para o caderno + click
const Moedas = {
    INFO: {
        5:   { classe: 'moeda-5',   label: '0,05', cor: '#CD7F32', borda: '#8B4513' },
        10:  { classe: 'moeda-10',  label: '0,10', cor: '#FFD700', borda: '#B8860B' },
        25:  { classe: 'moeda-25',  label: '0,25', cor: '#C0C0C0', borda: '#808080' },
        50:  { classe: 'moeda-50',  label: '0,50', cor: '#FFD700', borda: '#FF8F00' },
        100: { classe: 'moeda-100', label: '1,00', cor: '#C0C0C0', borda: '#FFD700' }
    },

    criarMoeda(valor) {
        var info = this.INFO[valor];
        var el = document.createElement('div');
        el.className = 'moeda ' + info.classe;
        el.dataset.valor = valor;
        el.setAttribute('role', 'button');
        el.draggable = true;
        el.innerHTML = '<span class="moeda-valor">' + info.label + '</span>';
        return el;
    },

    renderizarDisponiveis(moedasPermitidas) {
        var container = document.getElementById('moedas-disponiveis');
        container.innerHTML = '';
        moedasPermitidas.forEach(function(valor) {
            container.appendChild(Moedas.criarMoeda(valor));
        });
    },

    configurarEventos() {
        var disponiveis = document.getElementById('moedas-disponiveis');
        var dropZona = document.getElementById('drop-zona');

        // Click nas moedas para adicionar
        disponiveis.onclick = function(e) {
            var moeda = e.target.closest('.moeda');
            if (moeda) {
                Jogo.adicionarAoCaderno(parseInt(moeda.dataset.valor));
                Sons.tocar('moeda');
            }
        };

        // Drag start nas moedas
        disponiveis.addEventListener('dragstart', function(e) {
            var moeda = e.target.closest('.moeda');
            if (moeda) {
                e.dataTransfer.setData('text/plain', moeda.dataset.valor);
                e.dataTransfer.effectAllowed = 'copy';
                moeda.classList.add('dragging');
            }
        });

        disponiveis.addEventListener('dragend', function(e) {
            var moeda = e.target.closest('.moeda');
            if (moeda) moeda.classList.remove('dragging');
        });

        // Drop zone no caderno
        dropZona.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            dropZona.classList.add('drag-over');
        });

        dropZona.addEventListener('dragleave', function() {
            dropZona.classList.remove('drag-over');
        });

        dropZona.addEventListener('drop', function(e) {
            e.preventDefault();
            dropZona.classList.remove('drag-over');
            var valor = parseInt(e.dataTransfer.getData('text/plain'));
            if (valor) {
                Jogo.adicionarAoCaderno(valor);
                Sons.tocar('moeda');
            }
        });

        // Click nos itens do caderno para remover
        dropZona.onclick = function(e) {
            var item = e.target.closest('.caderno-item');
            if (item) {
                Jogo.removerDoCaderno(item);
                Sons.tocar('click');
            }
        };
    }
};
