document.getElementById('generateBtn').addEventListener('click', function () {
    const umlInput = document.getElementById('umlInput').value;
    const classList = extractClassesAndRelations(umlInput);

    const classListElement = document.getElementById('classList');
    classListElement.innerHTML = ''; // Limpia la lista previa

    classList.forEach(classData => {
        const listItem = document.createElement('li');

        // Crear un elemento <pre> para mostrar el código Java
        const pre = document.createElement('pre');
        pre.textContent = generateJavaCode(classData);

        listItem.appendChild(pre);
        classListElement.appendChild(listItem);
    });
});

function extractClassesAndRelations(umlText) {
    const classPattern = /(?:abstract\s+)?class\s+([a-zA-Z0-9_]+)(?:\s+extends\s+([a-zA-Z0-9_]+))?\s*\{([\s\S]*?)\}/g;
    const attributePattern = /([+|-])\s*([\w\*]+)\s+([\w]+)/g;
    const methodPattern = /([+|-])\s*(void|[\w]+)\s+([\w]+)\(\s*\)/g;
    const relationPattern = /([a-zA-Z0-9_]+)\s*(--|<\|-|-->|\*--|\|>)\s*"?([*0-9]+)?"?\s*([a-zA-Z0-9_]+)/g;

    const classes = [];
    let match;

    // Extraer clases
    while ((match = classPattern.exec(umlText)) !== null) {
        const className = match[1];
        const body = match[3] || '';
        const isAbstract = umlText.includes(`abstract class ${className}`);
        const attributes = [];
        const methods = [];

        // Extraer métodos
        let methodMatch;
        while ((methodMatch = methodPattern.exec(body)) !== null) {
            methods.push({
                visibility: methodMatch[1] === '-' ? 'private' : 'public',
                returnType: methodMatch[2],
                name: methodMatch[3]
            });
        }

        // Extraer atributos
        let attrMatch;
        while ((attrMatch = attributePattern.exec(body)) !== null) {
            const type = attrMatch[2].includes('*') ? attrMatch[2].replace('*', '[]') : attrMatch[2];
            attributes.push({
                visibility: attrMatch[1] === '-' ? 'private' : 'public',
                name: attrMatch[3],
                type: type
            });
        }

        classes.push({
            className,
            isAbstract,
            parentClass: null,
            attributes,
            methods
        });
    }

    // Extraer relaciones
    let relationMatch;
    while ((relationMatch = relationPattern.exec(umlText)) !== null) {
        const classA = relationMatch[1];
        const classB = relationMatch[4];
        const cardinality = relationMatch[3];

        if (cardinality === "*") {
            const classData = classes.find(cls => cls.className === classA);
            if (classData) {
                classData.attributes.push({
                    visibility: 'public',
                    name: classB.toLowerCase(),
                    type: `${classB}[]`
                });
            }
        }
    }

    return classes;
}

function generateJavaCode(classData) {
    let code = '';

    // Si la clase es abstracta
    if (classData.isAbstract) {
        code += `public abstract class ${classData.className}`;
    } else {
        code += `public class ${classData.className}`;
    }

    // Si la clase tiene herencia
    if (classData.parentClass) {
        code += ` extends ${classData.parentClass}`;
    }

    code += ' {\n';

    // Generar atributos
    classData.attributes.forEach(attr => {
        code += `    ${attr.visibility} ${attr.type} ${attr.name};\n`;
    });

    // Generar métodos
    classData.methods.forEach(method => {
        code += `    ${method.visibility} ${method.returnType} ${method.name}() {\n`;
        code += `        // Implementación aqui\n`;
        code += `    }\n`;
    });

    code += '}\n';
    return code;
}
