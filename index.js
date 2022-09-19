// Select the DOM elements
const firstInputEl = document.getElementById('firstInput');
const secondInputEl = document.getElementById('secondInput');

const firstSelectEl = document.getElementById('firstSelect');
const secondSelectEl = document.getElementById('secondSelect');

// Convert one rate into another rate
const convert = async (e) => {
    let fromInput, fromSelect, toInput, toSelect;

    // if the first Input or Select was changed
    // then set it as the base currency
    if (e.target === firstInputEl || e.target === firstSelectEl) {
        fromInput = firstInputEl;
        fromSelect = firstSelectEl;
        toInput = secondInputEl;
        toSelect = secondSelectEl;
    }

    // if the second Input or Select was changed
    // then set it as the base currency
    else {
        fromInput = secondInputEl;
        fromSelect = secondSelectEl;
        toInput = firstInputEl;
        toSelect = firstSelectEl;
    }

    const { [fromSelect.value]: fromCurrency } = await fetchCurrency(fromSelect.value);

    toInput.value = fromInput.value * fromCurrency[toSelect.value];

    fetchHistoryRates(fromSelect.value, toSelect.value);
}

// Register event listeners
firstInputEl.addEventListener('keyup', convert);
firstInputEl.addEventListener('change', convert);
secondInputEl.addEventListener('keyup', convert);
secondInputEl.addEventListener('change', convert);

firstSelectEl.addEventListener('change', convert);
secondSelectEl.addEventListener('change', convert);

// Fetch all the currencies
const fetchCurrencies = async () => {
    const API_URL = 'https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies.json';

    const response = await fetch(API_URL);
    const data = await response.json();

    const selectNodeList = document.querySelectorAll('select');
    selectNodeList.forEach(item => {
        // Populate the select elements
        for (let key in data) {
            const currencyItem = document.createElement('option');
            currencyItem.value = key;
            currencyItem.textContent = data[key];
            item.appendChild(currencyItem)
        };
    })
}
fetchCurrencies();

// Fetch single currency
const fetchCurrency = async (currency) => {
    const API_URL = `https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/${currency}.json`;

    const response = await fetch(API_URL);
    const data = await response.json();

    return data;
}

// Format any date into "YYYY-MM-DD" format
const formatDate = (date) => {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}

// Display the rates chart
const displayChart = async (fromCurrency, toCurrency, historyRates) => {
    const historyRateDates = historyRates.map(rate => rate.date).reverse();
    const historyRateValues = historyRates.map(rate => rate[toCurrency]).reverse();

    let chartStatus = Chart.getChart("currencyChart");
    if (chartStatus != undefined) {
        chartStatus.destroy();
    }

    const label = `"${fromCurrency}" to "${toCurrency}" rate`;
    const ctx = document.getElementById('currencyChart').getContext('2d');
    const currencyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: historyRateDates,
            datasets: [{
                label,
                data: historyRateValues,
                borderWidth: 1,
                fill: true,
            }]
        }
    });
}

const fetchHistoryRates = async (fromCurrency, toCurrency, days = 7) => {
    let dates = [];
    const today = new Date();
    
    for (let i = 0; i < days; i++) {
        const day = new Date(Date.now() - (1000 * 3600 * 24) * i);
        const formattedDay = formatDate(day);

        const promise = fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/${formattedDay}/currencies/${fromCurrency}/${toCurrency}.json`);
        dates.push(promise);
    }

    const historyRates = [];

    const response = await Promise.all(
        dates.map(async (date) => {
            const itemResponse = await date;
            const itemData = await itemResponse.json();
            historyRates.push(itemData);
        })
    );

    displayChart(fromCurrency, toCurrency, historyRates);
}