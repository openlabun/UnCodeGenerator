document.getElementById('generateBtn').addEventListener('click', function () {
    const umlInput = document.getElementById('umlInput').value;
    const classes = extractClasses(umlInput);
    displayJavaCode(classes);
});
// Encontrar clases definidas en el UML
function extractClasses(umlText) {
    const classPattern = /(abstract\s+)?class\s+([a-zA-Z0-9_]+)(?:\s+extends\s+([a-zA-Z0-9_]+))?/g;
    const enumPattern = /enum\s+([a-zA-Z0-9_]+)\s*\{([^\}]+)\}/g;
    const fieldMethodPattern = /([+#-])\s*(\w+)\s+(\w+)(\((.*?)\))?/g;
    const inheritancePattern = /(\w+)\s*--\|\>\s*(\w+)/g;

    const classes = [];

    let match;

    // Verificar si es enum
    while ((match = enumPattern.exec(umlText)) !== null) {
        const enumName = match[1];
        const values = match[2]
            .split(',')
            .map(value => value.trim())
            .filter(value => value);

        classes.push({
            type: 'enum',
            className: enumName,
            values,
        });
    }

    // Detectar la clase 
    while ((match = classPattern.exec(umlText)) !== null) {
        const isAbstract = !!match[1];
        const className = match[2];
        const parentClass = match[3] || null;
        const body = umlText.substring(match.index, umlText.indexOf('}', match.index) + 1);

        const fields = [];
        const methods = [];

        // Conseguir los metodos de las clases
        let fieldMethodMatch;
        while ((fieldMethodMatch = fieldMethodPattern.exec(body)) !== null) {
            const visibilitySymbol = fieldMethodMatch[1];
            const type = fieldMethodMatch[2];
            const name = fieldMethodMatch[3];
            const isMethod = !!fieldMethodMatch[4];
            const params = fieldMethodMatch[5] || '';
            const visibility = {// Transformar los simbolos en texto
                '+': 'public',
                '-': 'private',
                '#': 'protected',
            }[visibilitySymbol];
            
            if (isMethod) {
                methods.push({
                    visibility,
                    name,
                    params,
                    returnType: type,
                });
            } else {
                fields.push({
                    visibility,
                    name,
                    type,
                });
            }
        }

        classes.push({
            type: 'class',
            className,
            isAbstract,
            parentClass,
            fields,
            methods,
        });
    }

    // Buscar relaciones entre clases por herencia
    while ((match = inheritancePattern.exec(umlText)) !== null) {
        const childClass = match[1];
        const parentClass = match[2];

        const classIndex = classes.findIndex(cls => cls.className === childClass);
        if (classIndex !== -1) {
            classes[classIndex].parentClass = parentClass;
        }
    }

    return classes;
}
//Con la información traducida a Java se genera el texto acorde al lenguaje
function generateJavaCode(classes) {
    return classes.map(({ type, className, isAbstract, parentClass, fields, methods, values }) => {
        if (type === 'enum') {
            const valuesCode = values.join(', ');
            return `public enum ${className} {\n    ${valuesCode}\n}`;
        }

        const classType = isAbstract ? 'abstract class' : 'class';
        const extendsPart = parentClass ? ` extends ${parentClass}` : '';

        const fieldsCode = fields.map(({ visibility, type, name }) => {
            return `${visibility} ${type} ${name};`;
        }).join('\n');

        const methodsCode = methods.map(({ visibility, name, params, returnType }) => {
            const formattedParams = params
                .split(',')
                .map(param => {
                    const [paramName, paramType] = param.split(':').map(p => p.trim());
                    return paramType ? `${paramType} ${paramName}` : '';
                })
                .filter(param => param)
                .join(', ');

            return `${visibility} ${returnType} ${name}(${formattedParams}) {\n    // TODO: Implement\n}`;
        }).join('\n\n');

        const bodyContent = [fieldsCode, methodsCode].filter(section => section).join('\n\n');

        return `public ${classType} ${className}${extendsPart} {\n\n${bodyContent}\n\n}`;
    }).join('\n\n');
}

function displayJavaCode(classes) {
    const classList = document.getElementById('classList');
    classList.innerHTML = ''; // limpiar anterior código entregado

    if (classes.length === 0) {
        classList.innerHTML = '<li>No classes found.</li>';
        return;
    }

    const javaCode = generateJavaCode(classes);
    const preElement = document.createElement('pre');
    preElement.textContent = javaCode;
    classList.appendChild(preElement);
}
