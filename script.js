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
    // Validar delimitadores de PlantUML
    if (!umlText.trim().startsWith('@startuml') || !umlText.trim().endsWith('@enduml')) {
        alert('El diagrama debe comenzar con @startuml y terminar con @enduml.');
        return [];
    }

    const classPattern = /(?:abstract\s+)?class\s+([a-zA-Z0-9_]+)(?:\s+extends\s+([a-zA-Z0-9_]+))?\s*\{([\s\S]*?)\}/g;
    
    // Atributos: Captura atributos tipo +int nombre, pero no captura los métodos que contienen ()
    const attributePattern = /([+|-])\s*([\w\*]+)\s+([\w]+)/g;

    // Métodos: Captura métodos tipo +void hacerSonido() o +void hacerSonido(param1)
    const methodPattern = /([+|-])\s*(void|[\w]+)\s+([\w]+)\(\s*\)/g;

    const relationPattern = /([a-zA-Z0-9_]+)\s*(--\|>)\s*([a-zA-Z0-9_]+)/g; // Solo herencia '--|>'

    const classes = [];
    let match;

    while ((match = classPattern.exec(umlText)) !== null) {
        const className = match[1];
        const body = match[3] || '';
        const isAbstract = umlText.includes(`abstract class ${className}`);
        const attributes = [];
        const methods = [];

        // Extraer métodos primero (evitar que sean capturados como atributos)
        let methodMatch;
        while ((methodMatch = methodPattern.exec(body)) !== null) {
            methods.push({
                visibility: methodMatch[1] === '-' ? 'private' : 'public',
                returnType: methodMatch[2],  // Ahora guarda 'void' o el tipo adecuado
                name: methodMatch[3] // Nombre del método
            });
        }

        // Extraer atributos después de los métodos (evitar duplicación)
        let attrMatch;
        while ((attrMatch = attributePattern.exec(body)) !== null) {
            // Si el atributo es un método (porque tiene paréntesis), lo ignoramos
            if (body.includes(`${attrMatch[3]}()`)) continue; // Ignorar los que ya son métodos

            const type = attrMatch[2].includes('*') ? attrMatch[2].replace('*', '[]') : attrMatch[2];  // Convertir '*' a '[]'
            attributes.push({
                visibility: attrMatch[1] === '-' ? 'private' : 'public',
                name: attrMatch[3],
                type: type
            });
        }

        classes.push({
            className,
            isAbstract,
            parentClass: null,  // Inicialmente no tiene clase padre
            attributes,
            methods
        });
    }

    // Extraer relaciones de herencia '--|>'
    const relations = [];
    let relationMatch;
    while ((relationMatch = relationPattern.exec(umlText)) !== null) {
        const childClass = relationMatch[1];
        const parentClass = relationMatch[3];

        // Asignar la clase padre a la clase hija correspondiente
        const classData = classes.find(cls => cls.className === childClass);
        if (classData) {
            classData.parentClass = parentClass;
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
