let memoryValue = null; 
const display = document.getElementById('display');
const syntaxTreeContainer = document.getElementById('syntax-tree-container');
const tokensContainer = document.getElementById('tokens-container');

// Inicializar los contenedores vacíos
function initializeContainers() {
    syntaxTreeContainer.innerHTML = `<p>Árbol de sintaxis</p>`;
    tokensContainer.innerHTML = `<p>Lista de tokens</p>`;
}

initializeContainers();

// Alternar la vista entre Árbol de Sintaxis y Tokens
function showSyntaxTree() {
    syntaxTreeContainer.style.display = 'block';
    tokensContainer.style.display = 'none';
}

function showTokens() {
    syntaxTreeContainer.style.display = 'none';
    tokensContainer.style.display = 'block';
}

// Agregar un número o símbolo al display
function appendToDisplay(value) {
    if (display.innerText === '0' || display.innerText === 'Error') {
        display.innerText = value; 
    } else {
        display.innerText += value; 
    }
}

// Borrar todo el display
function clearDisplay() {
    display.innerText = '0';
    syntaxTreeContainer.innerHTML = `<p>Árbol de sintaxis</p>`;
    tokensContainer.innerHTML = `<p>Lista de tokens</p>`;
}

// Borrar el último carácter ingresado
function deleteLast() {
    if (display.innerText.length > 1) {
        display.innerText = display.innerText.slice(0, -1)
    } else {
        display.innerText = '0'; 
    }
}

// Guardar el valor actual del display en memoria y limpiar la pantalla
function saveToMemory() {
    const currentValue = display.innerText;
    if (!isNaN(currentValue)) {
        memoryValue = currentValue; 
        clearDisplay(); 
        alert(`Guardado en memoria: ${memoryValue}`); 
    } else {
        alert("No se puede guardar un valor inválido.");
    }
}

// Usar el valor guardado en memoria en la operación actual
function useMemory() {
    if (memoryValue !== null) {
        appendToDisplay(memoryValue); 
    } else {
        alert("No hay valor guardado en memoria.");
    }
}

// Calcular el resultado y mostrar el árbol de sintaxis o los tokens
async function calculateResult() {
    const expression = display.innerText;

    try {
        const response = await fetch('http://localhost:5000/evaluate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ expression: expression })
        });

        if (!response.ok) {
            throw new Error('Error en la solicitud al backend');
        }

        const data = await response.json();

        if (data.result !== undefined) {
            display.innerText = data.result;
        } else {
            display.innerText = 'Error';
        }

        renderSyntaxTree(data.syntax_tree);
        renderTokens(data.tokens, data.total_numbers, data.total_operators);
    } catch (error) {
        display.innerText = 'Error';
    }
}

// Renderizar el árbol de sintaxis en el contenedor
function renderSyntaxTree(treeData) {
    const width = 600;
    const height = 400;
    const margin = { top: 50, right: 50, bottom: 50, left: 50 };

    const svg = d3.select("#syntax-tree-container")
        .html("") 
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const root = d3.hierarchy(treeData);
    const treeLayout = d3.tree().size([width - margin.left - margin.right, height - margin.top - margin.bottom]);

    

    treeLayout(root);

    svg.selectAll(".link")
        .data(root.links())
        .enter()
        .append("line")
        .attr("class", "link")
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y)
        .attr("stroke", "#ccc")
        .attr("stroke-width", 2);

    const nodes = svg.selectAll(".node")
        .data(root.descendants())
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", d => "translate(" + d.x + "," + d.y + ")");

    nodes.append("circle")
        .attr("r", 20)
        .attr("fill", "#69b3a2");

    nodes.append("text")
        .attr("dx", 0)
        .attr("dy", 5)
        .style("text-anchor", "middle")
        .text(d => d.data.name);
}

// Renderizar los tokens en el contenedor como tabla
function renderTokens(tokens, totalNumbers, totalOperators) {
    tokensContainer.innerHTML = `
        <h3>Tokens</h3>
        <table>
            <thead>
                <tr>
                    <th>Tipo</th>
                    <th>Valor</th>
                </tr>
            </thead>
            <tbody>
                ${tokens.map(token => `
                    <tr>
                        <td>${token.type}</td>
                        <td>${token.value}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        <p>Total de números: ${totalNumbers}</p>
        <p>Total de operadores: ${totalOperators}</p>
    `;
}
