document.getElementById('generateBtn').addEventListener('click', function () {
    const umlInput = document.getElementById('umlInput').value;
    const classList = extractClasses(umlInput);

    const classListElement = document.getElementById('classList');
    classListElement.innerHTML = '';

    const classContent = generateJavaClass(classList);
    const preElement = document.createElement('pre');
    preElement.textContent = classContent;
    classListElement.appendChild(preElement);
});

function generateJavaClass(classDetails) {
    let classCode = '';

    // Importar las colecciones si es necesario
    if (classDetails.some(classDetail => classDetail.attributes.some(attr => attr.type.includes('List')) || classDetail.associations.length > 0)) {
        classCode += 'import java.util.ArrayList;\nimport java.util.List;\n\n';
    }

    classDetails.forEach(classDetail => {
        const {
            name,
            type,
            isAbstract,
            extends: extendsClass,
            implements: implementsInterfaces,
            attributes,
            methods,
            associations
        } = classDetail;

        // Declarar la clase o interfaz
        if (type === 'interface') {
            classCode += `public interface ${name}`;
        } else {
            classCode += `public ${isAbstract ? 'abstract ' : ''}class ${name}`;
        }
        if (extendsClass) {
            classCode += ` extends ${extendsClass}`;
        }
        if (implementsInterfaces && implementsInterfaces.length > 0) {
            classCode += ` implements ${implementsInterfaces.join(', ')}`;
        }
        classCode += ' {\n';

        // Generar atributos
        attributes.forEach(attr => {
            classCode += `    private ${attr.type} ${attr.name};\n`;
        });

        // Generar asociaciones
        associations.forEach(assoc => {
            const pluralizedName = assoc.name.endsWith('s') ? assoc.name : assoc.name + 's'; // Pluralizar correctamente
            classCode += `    private List<${assoc.type}> ${pluralizedName} = new ArrayList<>();\n`;
        });

        // Generar constructor básico
        if (type !== 'interface' && attributes.length > 0) {
            classCode += `\n    public ${name}(${attributes.map(attr => `${attr.type} ${attr.name}`).join(', ')}) {\n`;
            attributes.forEach(attr => {
                classCode += `        this.${attr.name} = ${attr.name};\n`;
            });
            classCode += '    }\n';
        }

        // Generar métodos
        methods.forEach(method => {
            const methodSignature = `public ${method.returnType} ${method.name}(${method.parameters.map(param => `${param.type} ${param.name}`).join(', ')})`;
            if (type === 'interface') {
                classCode += `    ${methodSignature};\n`;
            } else if (method.isAbstract) {
                classCode += `    ${methodSignature};\n`;
            } else {
                classCode += `    ${methodSignature} {\n`;
                classCode += `        // TODO: Implement ${method.name}\n`;
                classCode += '    }\n';
            }
        });

        classCode += '}\n\n';
    });

    return classCode;
}

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function extractClasses(umlText) {
    const classPattern = /(abstract\s+)?(class|interface)\s+([a-zA-Z0-9_]+)\s*(?:extends\s+([a-zA-Z0-9_]+))?\s*(?:implements\s+([a-zA-Z0-9_,\s]+))?\s*{([^}]*)}/g;
    const attributePattern = /[-+]\s*([a-zA-Z0-9_]+)\s*:\s*([a-zA-Z0-9_<>\[\]]+)/g;
    const methodPattern = /\+\s*([a-zA-Z0-9_]+)\s*\(([^)]*)\)\s*:\s*([a-zA-Z0-9_]+)/g;
    const associationPattern = /([a-zA-Z0-9_]+)\s*"1"\s*--\s*"0\.\.\*"\s*([a-zA-Z0-9_]+)/g;

    let classDetails = [];
    let classMatch;

    // Bucle para cada clase encontrada
    while ((classMatch = classPattern.exec(umlText)) !== null) {
        const isAbstract = !!classMatch[1];
        const type = classMatch[2];
        const name = classMatch[3];
        const extendsClass = classMatch[4] || null;
        const implementsInterfaces = classMatch[5] ? classMatch[5].split(',').map(i => i.trim()) : [];
        const body = classMatch[6];

        let attributes = [];
        let methods = [];
        let associations = [];

        let attributeMatch;
        while ((attributeMatch = attributePattern.exec(body)) !== null) {
            attributes.push({
                name: attributeMatch[1],
                type: attributeMatch[2]
            });
        }

        let methodMatch;
        while ((methodMatch = methodPattern.exec(body)) !== null) {
            methods.push({
                name: methodMatch[1],
                parameters: methodMatch[2] ? methodMatch[2].split(',').map(param => {
                    const [name, type] = param.trim().split(/\s*:\s*/);
                    return { type, name };
                }) : [],
                returnType: methodMatch[3],
                isAbstract: type === 'interface' || methodMatch[1] === 'makeSound' // Assuming makeSound is the only abstract method
            });
        }

        let associationMatch;
        while ((associationMatch = associationPattern.exec(umlText)) !== null) {
            if (associationMatch[1] === name) {
                associations.push({
                    name: associationMatch[2].toLowerCase(),
                    type: associationMatch[2]
                });
            } else if (associationMatch[2] === name) {
                associations.push({
                    name: associationMatch[1].toLowerCase(),
                    type: associationMatch[1]
                });
            }
        }

        classDetails.push({
            name,
            type,
            isAbstract,
            extends: extendsClass,
            implements: implementsInterfaces,
            attributes,
            methods,
            associations
        });
    }

    return classDetails;
}
