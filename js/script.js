const waitingList = document.getElementById('waitingList');
const serviceList = document.getElementById('serviceList');
const popup = document.getElementById('popup');
const dropZone = document.getElementById('dropZone');
let currentSeller;
let draggedSellerIndex;

// Carregar vendedores do localStorage ou iniciar lista padrão
let sellers = JSON.parse(localStorage.getItem('sellers')) || ['Vendedor 1', 'Vendedor 2', 'Vendedor 3'];
let serviceSellers = JSON.parse(localStorage.getItem('serviceSellers')) || [];

// Dados de conversão
let conversionData = {
    "Vendedor 1": { totalAtendimentos: 10, vendas: 7 },
    "Vendedor 2": { totalAtendimentos: 8, vendas: 4 },
    "Vendedor 3": { totalAtendimentos: 5, vendas: 5 },
};

function saveSellers() {
    localStorage.setItem('sellers', JSON.stringify(sellers));
    localStorage.setItem('serviceSellers', JSON.stringify(serviceSellers));
}

function renderList() {
    waitingList.innerHTML = '';
    sellers.forEach((seller, index) => {
        const li = document.createElement('li');
        li.setAttribute('draggable', true);
        li.dataset.index = index; 
        li.ondragstart = () => {
            draggedSellerIndex = index; 
        };

        const input = document.createElement('input');
        input.type = 'text';
        input.value = seller;
        input.onchange = (e) => updateSeller(index, e.target.value);
        input.disabled = true;  
        li.appendChild(input);

        const editBtn = document.createElement('button');
        editBtn.innerHTML = '✏️';
        editBtn.classList.add('edit-btn');
        editBtn.onclick = (e) => {
            e.stopPropagation();
            input.disabled = !input.disabled;  
            if (!input.disabled) {
                input.focus();
            }
        };
        li.appendChild(editBtn);

        li.onclick = () => moveToService(seller);
        waitingList.appendChild(li);
    });

    serviceList.innerHTML = '';
    serviceSellers.forEach((seller) => {
        const li = document.createElement('li');
        const input = document.createElement('input');
        input.type = 'text';
        input.value = seller;
        input.disabled = true;
        li.appendChild(input);
        
        const editBtn = document.createElement('button');
        editBtn.innerHTML = '✏️';
        editBtn.classList.add('edit-btn');
        editBtn.onclick = (e) => {
            e.stopPropagation();
            input.disabled = !input.disabled;
            if (!input.disabled) {
                input.focus();
            }
        };
        li.appendChild(editBtn);
        
        li.onclick = () => showPopup(seller);
        serviceList.appendChild(li);
    });
}

function updateSeller(index, newName) {
    const oldName = sellers[index];
    sellers[index] = newName;
    if (conversionData[oldName]) {
        conversionData[newName] = conversionData[oldName];
        delete conversionData[oldName];
    }
    saveSellers();
}

function addSeller() {
    const newSeller = prompt("Digite o nome do novo vendedor:");
    if (newSeller && newSeller.trim() !== "") {
        sellers.push(newSeller.trim());
        conversionData[newSeller.trim()] = { totalAtendimentos: 0, vendas: 0 };
        saveSellers();
        renderList();
    } else {
        alert("O nome do vendedor não pode ser vazio.");
    }
}

function moveToService(seller) {
    const index = sellers.indexOf(seller);
    if (index > -1) {
        sellers.splice(index, 1);
        serviceSellers.push(seller);
        // Não contabiliza atendimentos aqui
        saveSellers();
        renderList();
    }
}

function showPopup(seller) {
    currentSeller = seller;
    popup.style.display = 'block';
}

function handleResult(result) {
    popup.style.display = 'none';
    const index = serviceSellers.indexOf(currentSeller);
    if (index > -1) {
        serviceSellers.splice(index, 1);
        
        // O vendedor é retornado à lista de espera
        sellers.unshift(currentSeller); // Adiciona no topo da lista
        
        // Atualiza dados de conversão
        if (conversionData[currentSeller]) {
            if (result === 'success') {
                conversionData[currentSeller].totalAtendimentos += 1; // Incrementa atendimentos para "Sucesso"
                conversionData[currentSeller].vendas += 1; // Incrementa vendas para "Sucesso"
            } else if (result === 'notConverted') {
                conversionData[currentSeller].totalAtendimentos += 1; // Incrementa atendimentos para "Não convertido"
                // Não incrementa vendas para "Não convertido"
            }
            // Para "Troca", não altera atendimentos ou vendas
        }

        saveSellers();
        renderList();
    }
}

// Função para excluir vendedor ao arrastar para a zona de exclusão
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('hover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('hover');
});

dropZone.addEventListener('drop', () => {
    dropZone.classList.remove('hover');
    if (draggedSellerIndex !== undefined) {
        sellers.splice(draggedSellerIndex, 1);
        saveSellers();
        renderList();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    renderList();
});

// Mostrar taxa de conversão ao clicar no botão
document.getElementById('showConversionRateButton').onclick = showConversionRate;

function showConversionRate() {
    const conversionRates = document.getElementById('conversionRates');
    conversionRates.innerHTML = ''; 

    // Calcula e exibe a taxa de conversão de cada vendedor
    for (const seller of sellers) {
        const data = conversionData[seller] || { totalAtendimentos: 0, vendas: 0 };
        const conversionRate = data.totalAtendimentos > 0 ? (data.vendas / data.totalAtendimentos * 100).toFixed(2) : 0;
        
        const div = document.createElement('div');
        div.textContent = `${seller}: ${conversionRate}% (Vendas: ${data.vendas}, Atendimentos: ${data.totalAtendimentos})`;
        conversionRates.appendChild(div);
    }

    document.getElementById('conversionPopup').style.display = 'block'; 
}

function closeConversionPopup() {
    document.getElementById('conversionPopup').style.display = 'none'; 
}
