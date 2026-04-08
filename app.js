const display = document.querySelector('.display');
const output = document.querySelector('.output');
const zeroButton = document.querySelector('.zero');

const state = {
    tokens: [],
    currentInput: '',
    displayTokens: '',
    isFirstMinus: false,
    shouldResetDisplay: false,
};

const operators = ['+', '-', '*', '/'];

const calculate = (a, op, b) => {
    a = parseFloat(a);
    b = parseFloat(b);

    if (op === '*') return a * b;
    if (op === '/') return b !== 0 ? a / b : 'Error';
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

const updateZeroButton = () => {
    if (state.tokens[state.tokens.length - 1] ===  '/' && !state.currentInput)
    return zeroButton.disabled = true;
    else return zeroButton.disabled = false;
}

const render = () => {
    updateZeroButton();
    renderDisplay();
};

const renderDisplay = () => {
    if (!state.currentInput && state.tokens.length === 0) output.innerHTML = '';

    if (!state.shouldResetDisplay) {
        state.displayTokens = '';
        for (let value of state.tokens.values()) {
            state.displayTokens += `${value} `;
        };
    };

    display.innerHTML = state.displayTokens + state.currentInput;

    if (state.currentInput !== '-' && !state.currentInput.endsWith('.')) { 
        const result = getResult();
        if (result !== '') output.innerHTML = parseFloat(parseFloat(result).toPrecision(10));
    }
 
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

    return render();
};

const handleOperator = (operator) => {
    if (!state.currentInput && operator === '-' && !state.isFirstMinus) {
        state.currentInput = '-';
        state.shouldResetDisplay = false;
        render();
        state.isFirstMinus = true;
        return;
    };

    if (!state.currentInput || state.currentInput === '-') return;
    if (state.currentInput.endsWith('.')) state.currentInput = state.currentInput.slice(0, -1);

    state.tokens.push(state.currentInput, operator);
    state.currentInput = '';

    state.isFirstMinus = false;
    state.shouldResetDisplay = false;
    render();
};

const handleEquals = () => {
    if (state.tokens.length < 2 || !state.currentInput) return;

    const result = getResult();

    handleReset();
    state.currentInput = String(result);
    state.shouldResetDisplay = false;
    render();
};

const handleFloat = () => {
    if (state.currentInput.includes('.')) return;
    if (state.currentInput === '' || state.currentInput === '-') state.currentInput += '0';

    state.currentInput += '.';
    state.shouldResetDisplay = false;
    render();
};

const handleReset = () => {
    state.tokens.length = 0
    state.isFirstMinus = false;
    state.currentInput = ''
    state.displayTokens = ''
    
    state.shouldResetDisplay = false;
    return render();
};

const switchValue = () => {
    if (!state.currentInput || state.currentInput === '-') return;

    state.currentInput = String(-parseFloat(state.currentInput));

    return render();
};

const handleBackspace = () => {
    if (!state.currentInput && state.tokens.length >= 1) state.currentInput = state.tokens.pop();
    if (state.currentInput) state.currentInput = state.currentInput.slice(0, -1);
    
    state.shouldResetDisplay = false;
    return render();
};