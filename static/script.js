
const display = document.getElementById('display');


function appendToDisplay(value) {
    if (display.innerText === '0' || display.innerText === 'Error') {
        display.innerText = value;
    } else {
        display.innerText += value;
    }
}


function clearDisplay() {
    const display = document.querySelector('.display');
    display.innerText = '0';
    
 
    const syntaxTreeContainer = document.querySelector('#syntax-tree-container');
    syntaxTreeContainer.innerHTML = ''; 
}


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

      
        console.log('Árbol de sintaxis:', JSON.stringify(data.syntax_tree, null, 2));

       return renderSyntaxTree(data.syntax_tree)

    } catch (error) {
        display.innerText = 'Error';
    }
}


function renderSyntaxTree(treeData) {
    const width = 500;
    const height = 300;
    const margin = { top: 50, right: 50, bottom: 50, left: 50 };

    const svg = d3.select("#syntax-tree-container")
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