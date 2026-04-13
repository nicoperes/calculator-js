const display = document.querySelector('.display');
const output = document.querySelector('.output');

const state = {
    tokens: [],
    currentInput: '',
    displayTokens: '',
    isFirstMinus: false,
    isEqualsPressed: false,    
    shouldResetDisplay: false,
    error: null,
};

const operators = ['+', '-', '*', '/'];

const calculate = (a, op, b) => {
    a = parseFloat(a);
    b = parseFloat(b);

    if (op === '*') return a * b;
    if (op === '/') {
        if (b === 0) {
            state.error = 'Impossível dividir por zero';
            return null;
        };
       return a / b;
    };
    if (op === '+') return a + b;
    if (op === '-') return a - b;
};

const getResult = () => {
    if (state.tokens.length <= 1) return state.currentInput;

    const lastElement = state.tokens[state.tokens.length - 1];
    const getFallbackValue = (op) => {
        if (state.currentInput !== '') return state.currentInput;
        return (op === '*' || op === '/') ? 1 : 0;
    };

    const terms = [...state.tokens];
    if (operators.includes(lastElement)) {
        terms.push(getFallbackValue(lastElement));
    };

    let i = 1;
    while (i < terms.length - 1) {
        const op = terms[i];
        if (op === '*' || op === '/') {
            const result = calculate(terms[i - 1], op, terms[i + 1]);
            terms.splice(i - 1, 3, result); 
        } else {
            i += 2;
        };
    };

    let result = parseFloat(terms[0]);
    for (let j = 1; j < terms.length - 1; j += 2) {
        result = calculate(result, terms[j], terms[j + 1]);
    };

    return result;
};

const adjustFontSize = (element, maxSize, minSize, startShrinking) => {
    startShrinking ??= 8;
    const elementLength = element.innerHTML.length;

    if (elementLength <= startShrinking) {
        element.style.fontSize = `${maxSize}rem`
        return;
    };

    const ratio = startShrinking / elementLength;
    const size = Math.max(minSize, maxSize * ratio);
    
    element.style.fontSize = `${size}rem`;
}

const renderDisplay = () => {
    if (!state.currentInput && state.tokens.length === 0) output.innerHTML = '';

    if (!state.shouldResetDisplay) {
        state.displayTokens = '';
        for (let value of state.tokens.values()) {
            state.displayTokens += `${value} `;
        };
    };

    display.innerHTML = state.displayTokens + state.currentInput;

    if (state.currentInput !== '-' && !state.isEqualsPressed) {
        state.error = null;

        const result = getResult();
        
        if (state.error) output.innerHTML = state.error;
        else if (result !== '') output.innerHTML = parseFloat(parseFloat(result).toPrecision(10));
    }

    if (state.isEqualsPressed) state.isEqualsPressed = false;

    adjustFontSize(display, 1.6, 1.2, 28);
    adjustFontSize(output, 2.4, 1.8, 16);

    return state.shouldResetDisplay = true;
};

const handleNumber = (n) => {
    if (
        state.tokens.length >= 1
            &&
        !operators.includes(state.tokens[state.tokens.length -1])
    ) {
        state.currentInput = state.tokens.pop();
        state.shouldResetDisplay = false;
    };

    state.currentInput = state.currentInput + n;

    return renderDisplay();
};

const handleOperator = (operator) => {
    if (!state.currentInput && operator === '-' && !state.isFirstMinus) {
        state.currentInput = '-';
        state.shouldResetDisplay = false;
        renderDisplay();
        state.isFirstMinus = true;
        return;
    };

    if (!state.currentInput || state.currentInput === '-') return;
    if (state.currentInput.endsWith('.')) state.currentInput = state.currentInput.slice(0, -1);

    state.tokens.push(state.currentInput, operator);
    state.currentInput = '';

    state.isFirstMinus = false;
    state.shouldResetDisplay = false;
    renderDisplay();
};

const handleEquals = () => {
    if (state.tokens.length < 2 || !state.currentInput) return;

    const result = getResult();

    handleReset();
    state.currentInput = String(result);
    state.shouldResetDisplay = false;
    state.isEqualsPressed = true;
    renderDisplay();
};

const handleFloat = () => {
    if (state.currentInput.includes('.')) return;
    if (state.currentInput === '' || state.currentInput === '-') state.currentInput += '0';

    state.currentInput += '.';
    state.shouldResetDisplay = false;
    renderDisplay();
};

const handleReset = () => {
    state.tokens.length = 0
    state.isFirstMinus = false;
    state.isEqualsPressed = false;
    state.currentInput = '';
    state.displayTokens = '';
    state.error = null;
    
    state.shouldResetDisplay = false;
    return renderDisplay();
};

const switchValue = () => {
    if (!state.currentInput || state.currentInput === '-') return;

    state.currentInput = String(-parseFloat(state.currentInput));

    return renderDisplay();
};

const handleBackspace = () => {
    if (!state.currentInput && state.tokens.length >= 1) state.currentInput = state.tokens.pop();
    if (state.currentInput) state.currentInput = state.currentInput.slice(0, -1);
    
    state.shouldResetDisplay = false;
    return renderDisplay();
};