const  API_KEY = 'ce3fd966e7a1d10d65f907b20bf000552158fd3ed1bd614110baa0ac6cb57a7e';

export const loadTicker = (tickerName) =>
    fetch(
        `https://min-api.cryptocompare.com/data/price?fsym=${tickerName}&tsyms=USD&api_key=${API_KEY}`
    ).then(r => r.json());



