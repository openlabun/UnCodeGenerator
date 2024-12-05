document.getElementById('generateBtn').addEventListener('click', function () {
    const umlInput = document.getElementById('umlInput').value;
    const parsedClasses = parseUML(umlInput);

    const classListElement = document.getElementById('classList');
    classListElement.innerHTML = '';

    parsedClasses.forEach(javaElement => {
        const listItem = document.createElement('li');
        listItem.textContent = javaElement.name + '.java';
        const pre = document.createElement('pre');
        pre.textContent = javaElement.code;
        listItem.appendChild(pre);
        classListElement.appendChild(listItem);
    });
});

function parseUML(umlText) {
    const lines = umlText.split('\n').map(line => line.trim());
    const elements = {};
    let currentEnum = null;
    let relationships = [];

    lines.forEach(line => {
        if (line.match(/abstract\s+class\s+(\w+)/)) {
            const abstractClassMatch = line.match(/abstract\s+class\s+(\w+)/);
            const className = abstractClassMatch[1];
            elements[className] = {
                type: 'class',
                name: className,
                attributes: [],
                methods: [],
                relationships: [],
                extends: null,
                abstract: true,
            };
            return;
        }

        if (line.match(/class\s+(\w+)(?:\s+extends\s+(\w+))?/)) {
            const classMatch = line.match(/class\s+(\w+)(?:\s+extends\s+(\w+))?/);
            const className = classMatch[1];
            const parentClass = classMatch[2] || null;
            elements[className] = {
                type: 'class',
                name: className,
                attributes: [],
                methods: [],
                relationships: [],
                extends: parentClass,
                abstract: false,
            };
            return;
        }

        if (line.match(/enum\s+(\w+)/)) {
            const enumMatch = line.match(/enum\s+(\w+)/);
            const enumName = enumMatch[1];
            currentEnum = enumName;
            elements[enumName] = {
                type: 'enum',
                name: enumName,
                values: [],
            };
            return;
        }

        if (line === 'enduml' || line === '}') {
            currentEnum = null;
            return;
        }

        if (currentEnum) {
            const currentElement = elements[currentEnum];
            const enumValues = line.split(',').map(v => v.trim()).filter(v => v);
            currentElement.values.push(...enumValues);
            return;
        }

        if (line.match(/(\w+)\s+--\|>\s+(\w+)/)) {
            const inheritanceMatch = line.match(/(\w+)\s+--\|>\s+(\w+)/);
            const [_, childClass, parentClass] = inheritanceMatch;
            if (elements[childClass]) {
                elements[childClass].extends = parentClass;
            }
            return;
        }

        if (line.match(/(\w+)\s+"(\d+|\*)"\s+(-->|<--|--)\s+"(\d+|\*)"\s+(\w+)/)) {
            const relationshipMatch = line.match(/(\w+)\s+"(\d+|\*)"\s+(-->|<--|--)\s+"(\d+|\*)"\s+(\w+)/);
            const [_, class1, cardinality1, direction, cardinality2, class2] = relationshipMatch;
            const cardinality1Final = cardinality1 || '"1"';
            const cardinality2Final = cardinality2 || '"1"';
            relationships.push({
                class1,
                cardinality1: cardinality1Final,
                direction,
                cardinality2: cardinality2Final,
                class2,
            });
            return;
        }

        if (line.match(/([\+\-\#])\s+([\w<>]+)\s+(\w+)\(\)/)) {
            const methodMatch = line.match(/([\+\-\#])\s+([\w<>]+)\s+(\w+)\(\)/);
            const currentClass = getLastClass(elements);
            if (currentClass) {
                currentClass.methods.push({
                    visibility: parseVisibility(methodMatch[1]),
                    returnType: methodMatch[2],
                    name: methodMatch[3],
                });
            }
            return;
        }

        if (line.match(/([\+\-\#])\s+([\w<>]+)\s+(\w+)/)) {
            const attributeMatch = line.match(/([\+\-\#])\s+([\w<>]+)\s+(\w+)/);
            const currentClass = getLastClass(elements);
            if (currentClass) {
                currentClass.attributes.push({
                    visibility: parseVisibility(attributeMatch[1]),
                    type: attributeMatch[2],
                    name: attributeMatch[3],
                });
            }
            return;
        }
    });

    relationships.forEach(rel => {
        const { class1, class2, cardinality1, cardinality2, direction } = rel;
        const class1Element = elements[class1];
        const class2Element = elements[class2];

        if (direction === '-->' || direction === '--') {
            if (class1Element) {
                const cardinality = cardinality2 === '*' ? '[]' : cardinality2 === '1' ? '' : '[1]';
                if (!cardinality2) {
                    cardinality = '[]';
                }
                class1Element.relationships.push({
                    type: class2,
                    cardinality: cardinality,
                });
            }
        }

        if (direction === '<--' || direction === '--') {
            if (class2Element) {
                const cardinality = cardinality1 === '*' ? '[]' : cardinality1 === '1' ? '' : '[1]';
                if (!cardinality1) {
                    cardinality = '[]';
                }
                class2Element.relationships.push({
                    type: class1,
                    cardinality: cardinality,
                });
            }
        }
    });

    return Object.values(elements).map(generateJavaElement);
}

function normalizeCardinality(cardinality) {
    if (cardinality === '*' || cardinality === '1') {
        return cardinality === '*' ? '[]' : '';
    } else if (!cardinality) {
        return '[]';
    } else {
        return '[1]';
    }
}

relationships.forEach(rel => {
    const { class1, class2, cardinality1, cardinality2, direction } = rel;
    const class1Element = elements[class1];
    const class2Element = elements[class2];

    if (direction === '-->' || direction === '--') {
        if (class1Element) {
            class1Element.relationships.push({
                type: class2,
                cardinality: normalizeCardinality(cardinality2),
            });
        }
    }

    if (direction === '<--' || direction === '--') {
        if (class2Element) {
            class2Element.relationships.push({
                type: class1,
                cardinality: normalizeCardinality(cardinality1),
            });
        }
    }
});

function generateJavaClass(classDef) {
    const { name, attributes, methods, relationships, extends: parentClass, abstract } = classDef;

    let code = `public ${abstract ? 'abstract ' : ''}class ${name}${parentClass ? ` extends ${parentClass}` : ''} {\n`;

    attributes.forEach(attr => {
        code += `    ${attr.visibility} ${attr.type} ${attr.name};\n`;
    });

    relationships.forEach(rel => {
        code += `    public ${rel.type}${rel.cardinality} ${rel.type.toLowerCase()};\n`;
    });

    methods.forEach(method => {
        code += `    ${method.visibility} ${method.returnType} ${method.name}() {\n`;
        code += `        // Implemente aquí\n`;
        code += `    }\n`;
    });

    code += '}\n';
    return { name, code };
}

function parseVisibility(symbol) {
    switch (symbol) {
        case '+': return 'public';
        case '-': return 'private';
        case '#': return 'protected';
        default: return 'package-private';
    }
}

function getLastClass(elements) {
    return Object.values(elements).filter(e => e.type === 'class').slice(-1)[0];
}

function generateJavaElement(element) {
    if (element.type === 'class') {
        return generateJavaClass(element);
    } else if (element.type === 'enum') {
        return generateJavaEnum(element);
    }
}


function generateJavaEnum(enumDef) {
    const { name, values } = enumDef;
    let code = `public enum ${name} {\n`;


    values.forEach((value, index) => {
        code += `    ${value.toUpperCase()}${index < values.length - 1 ? ',' : ';'}\n`;
    });

    code += '}\n';
    return { name, code };
}