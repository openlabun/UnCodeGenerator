document.getElementById('generateBtn').addEventListener('click', function () {
    const umlInput = document.getElementById('umlInput').value;
    const classData = extractClasses(umlInput);

    const classListElement = document.getElementById('classList');
    classListElement.innerHTML = '';
    classData.forEach(classItem => {
        const listItem = document.createElement('li'); 
        listItem.style.border = "3px solid #ccc"; 
        listItem.style.margin = "10px";
        listItem.style.padding = "10px";
        if (classItem.type === "class") {
            listItem.textContent = generateJavaClass(classItem.className, classItem.attributes, classItem.methods);
        } else if (classItem.type === "enum") {
            listItem.textContent = generateEnum(classItem.enumName, classItem.values);
        }
    
        classListElement.appendChild(listItem);
    });
    
});

function extractClasses(umlText) {
    const classPattern = /class\s+([a-zA-Z0-9_]+)\s*{([^}]*)}/g;
    const enumPattern = /enum\s+([a-zA-Z0-9_]+)\s*{([^}]*)}/g;
    let classData = [];
    let match;

    while ((match = classPattern.exec(umlText)) !== null) {
        const className = match[1];
        const attributeBlock = match[2];
        const { attributes, methods } = extractAttributesAndMethods(attributeBlock, className);
        classData.push({
            type: "class",
            className,
            attributes: attributes || [],
            methods: methods || []
        });
    }

    const enums = extractEnums(umlText, enumPattern);
    classData = classData.concat(enums);

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

function generateEnum(enumName, values) {
    return `
public enum ${enumName} {
    ${values}
}
`.trim();
}

function extractEnums(umlText, enumPattern){
    const enums = [];
    let match;
    while((match = enumPattern.exec(umlText)) !== null){
        const enumName = match[1];
        const values = match[2];  
        
        enums.push({
            type: "enum",
            enumName,
            values
        });
    }

    return enums;

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
