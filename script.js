//// RECOGE ATRIBUTOS Y METODOS

document.getElementById('generateBtn').addEventListener('click', function () {
    const umlInput = document.getElementById('umlInput').value;
    const classData = extractClassesAndAttributes(umlInput);

    const classListElement = document.getElementById('classList');
    classListElement.innerHTML = '';
    console.log(classData);
    classData.forEach(classItem => {
        const listItem = document.createElement('li');
        listItem.textContent = generateJavaClass(classItem.className, classItem.attributes, classItem.methods);
        classListElement.appendChild(listItem);
    });
});

function extractClassesAndAttributes(umlText) {
    const classPattern = /class\s+([a-zA-Z0-9_]+)\s*{([^}]*)}/g;
    let classData = [];
    let match;

    while ((match = classPattern.exec(umlText)) !== null) {
        const className = match[1];
        const attributeBlock = match[2];
        const { attributes, methods } = extractAttributesAndMethods(attributeBlock, className);
        classData.push({
            className,
            attributes: attributes || [],
            methods: methods || []
        });
    }

    return classData;
}

function extractAttributesAndMethods(block, className) {
    const lines = block.split('\n').map(line => line.trim());
    const attributes = [];
    const methods = [];

    lines.forEach(line => {
        if (/^([\+\-\#]?)\s*(?:void|[a-zA-Z0-9_]+)?\s*([a-zA-Z0-9_]+)\(([^)]*)\)$/.test(line)) {
            const match = line.match(/^([\+\-\#]?)\s*(?:([a-zA-Z0-9_]+)\s+)?([a-zA-Z0-9_]+)\(([^)]*)\)$/);

            if(match[3] == className){
                methods.push({
                    visibility: match[1] || '+',
                    returnType: "", 
                    name: match[3],
                    parameters: match[4] || ''
                })
            } else {
            methods.push({
                visibility: match[1] || '+',
                returnType: match[2] || 'void',
                name: match[3],
                parameters: match[4] || ''
            });}
        } else if (/^([\+\-\#]?)\s*([a-zA-Z0-9_]+)\s+([a-zA-Z0-9_]+)$/.test(line)) {
            const match = line.match(/^([\+\-\#]?)\s*([a-zA-Z0-9_]+)\s+([a-zA-Z0-9_]+)$/); 
            attributes.push({
                visibility: match[1] || '+',
                type: match[2],
                name: match[3]
            });
        } 
    });

    return { attributes, methods };
}

function generateJavaClass(className, attributes, methods) {
    const attributesCode = attributes
        .map(attr => `    ${translateVisibility(attr.visibility)} ${attr.type} ${attr.name};`)
        .join('\n');

    const constructorParams = attributes
        .map(attr => `${attr.type} ${attr.name}`)
        .join(', ');

    const constructorBody = attributes
        .map(attr => `        this.${attr.name} = ${attr.name};`)
        .join('\n');

    const methodsCode = methods
        .map(method => `    ${translateVisibility(method.visibility)} ${method.returnType} ${method.name}(${method.parameters}) {}`)
        .join('\n');

    return `\n
public class ${className} {
\n
${attributesCode}
\n
${methodsCode}
\n
}
\n
`.trim();
}

function translateVisibility(visibilitySymbol) {
    switch (visibilitySymbol) {
        case '+':
            return 'public';
        case '-':
            return 'private';
        case '#':
            return 'protected';
        default:
            return 'private';
    }
}
