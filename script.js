document.getElementById('generateBtn').addEventListener('click', function() {
  const umlInput = document.getElementById('umlInput').value;
  const classList = getClassesData(umlInput);

  const classListElement = document.getElementById('classList');
  classListElement.innerHTML = '';

  classList.forEach(classData => {
    const {name: className, properties, methods, extends: etx, implements} = classData;

    const span = document.createElement('span');
    let spanTextContext = className;

    if(etx){
      spanTextContext += " extend "+ etx;
    }

    classListElement.appendChild(span);;

    for(const method of methods) {
      const listItem = document.createElement('li');
      listItem.textContent = method.name +' '+ method.returnType + ''
      classListElement.appendChild(listItem);;
    }
    
    for(const prop of properties) {
      const listProperty = document.createElement('li');
      listProperty.textContent = prop.name +'-'+ prop.type + ''
      classListElement.appendChild(listProperty);;
    }

    if(implements.length){
      spanTextContext += " implements "+ implements.join(',');
    }

    span.textContent = spanTextContext;
    
    const breakLine = document.createElement('br');
    classListElement.appendChild(breakLine);;
  });
});

function getClassesData(uml) {
  var classPattern = /class\s+([a-zA-Z_$][a-zA-Z_$0-9]*)\s*{([^}]*)}/g;
  var propertyPattern = /^\s*\+\s*([a-zA-Z_$][a-zA-Z_$0-9]*)\s*:\s*([a-zA-Z_$][a-zA-Z_$0-9]*)/gm;
  var methodPattern = /^\s*\+\s*([a-zA-Z_$][a-zA-Z_$0-9]*)\s*\((.*?)\)\s*:\s*([a-zA-Z_$][a-zA-Z_$0-9]*)/gm;
  var extendsPattern = /^([a-zA-Z_$][a-zA-Z_$0-9]*)\s*-->\s*([a-zA-Z_$][a-zA-Z_$0-9]*)\s*:\s*extends$/gm;
  var implementsPattern = /^([a-zA-Z_$][a-zA-Z_$0-9]*)\s*\.\.\|>\s*([a-zA-Z_$][a-zA-Z_$0-9]*)\s*:\s*implements$/gm;
  
  var classes = [];
  var classMatch;
  
  while ((classMatch = classPattern.exec(uml)) !== null) {
    var className = classMatch[1];
    var classBody = classMatch[2];
    var properties = [];
    var methods = [];
    var match = void 0;
    
    while ((match = propertyPattern.exec(classBody)) !== null) {
      var name_1 = match[1];
      var type = match[2];
      properties.push({ name: name_1, type: type });
    }
    
    while ((match = methodPattern.exec(classBody)) !== null) {
      var name_2 = match[1];
      var parameters = match[2] !== "[object Object]" ? match[2].split(",").map(function (param) { return param.trim(); }) : [];
      var returnType = match[3];
      methods.push({ name: name_2, parameters: parameters, returnType: returnType });
    }
    
    classes.push({
      name: className,
      properties: properties,
      methods: methods,
      extends: undefined,
      implements: [],
    });
  }
  var relationshipMatch;
  var _loop_1 = function () {
    var _ = relationshipMatch[0], child = relationshipMatch[1], parent_1 = relationshipMatch[2];
    var cls = classes.find(function (c) { return c.name === child; });
    if (cls)
        cls.extends = parent_1;
  };
  
  while ((relationshipMatch = extendsPattern.exec(uml)) !== null) {
    _loop_1();
  }
  var _loop_2 = function () {
    var _ = relationshipMatch[0], child = relationshipMatch[1], interfaceName = relationshipMatch[2];
    var cls = classes.find(function (c) { return c.name === child; });
    if (cls)
      cls.implements.push(interfaceName);
  };
  
  while ((relationshipMatch = implementsPattern.exec(uml)) !== null) {
  _loop_2();
  }
  
  return classes;
}

