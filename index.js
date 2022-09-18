const firstInputEl = document.getElementById('firstInput');
const secondInputEl = document.getElementById('secondInput');

const firstSelectEl = document.getElementById('firstSelect');
const secondSelectEl = document.getElementById('secondSelect');

const convert = async (e) => {
    console.log(e.target.id)

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

    // console.log(fromCurrency);
    toInput.value = fromInput.value * fromCurrency[toSelect.value];
}

firstInputEl.addEventListener('keyup', convert);
firstInputEl.addEventListener('change', convert);
secondInputEl.addEventListener('keyup', convert);
secondInputEl.addEventListener('change', convert);

firstSelectEl.addEventListener('change', convert);
secondSelectEl.addEventListener('change', convert);


const fetchCurrencies = async () => {
    const API_URL = 'https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies.json';

    const response = await fetch(API_URL);
    const data = await response.json();

    // console.log(data);

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

const fetchCurrency = async (currency) => {
    const API_URL = `https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/${currency}.json`;

    const response = await fetch(API_URL);
    const data = await response.json();

    // console.log(data);
    return data;
}

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

const fetchHistoryRates = async (currency, days = 7) => {
    let dates = [];
    const today = new Date();
    
    for (let i = 0; i < days; i++) {
        const day = new Date(Date.now() - (1000 * 3600 * 24) * i);
        const formattedDay = formatDate(day);
        const promise = fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/${formattedDay}/currencies/eur.json`);
        dates.push(promise);
    }

    console.log(dates)

    const response = await Promise.all(dates);
    const data = await response;

    const graphEl = document.getElementById('graph');

    data.map(async (item) => {
        const itemData = await item.json();
        console.log(itemData);
        const itemDataEl = document.createElement('p');
        itemDataEl.textContent = itemData.date + ' ' + itemData[currency][currency];
        graphEl.appendChild(itemDataEl);
    })


    // Promise.all()
}

// fetchHistoryRates('eur');