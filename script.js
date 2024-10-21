document.getElementById('generateBtn').addEventListener('click', function() {
    const umlInput = document.getElementById('umlInput').value;
    const classList = extractClasses(umlInput);

    const classListElement = document.getElementById('classList');
    classListElement.innerHTML = '';

    classList.forEach(className => {
        const listItem = document.createElement('li');
        listItem.textContent = className + '.java';
        classListElement.appendChild(listItem);
    });
});

function extractClasses(umlText) {
    const classPattern = /class\s+([a-zA-Z0-9_]+)/g;
    let classNames = [];
    let match;

    while ((match = classPattern.exec(umlText)) !== null) {
        classNames.push(match[1]);
    }

    return classNames;
}
