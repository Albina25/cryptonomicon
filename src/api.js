// export function loadTicker()
const API_KEY = 'd33aa022c48f34ea62feec55cdafbeba4efc8d1b0368d70a47747aaa90dccecd';
export const loadTickers = (tickers) =>
  fetch(
    `https://min-api.cryptocompare.com/data/price?fsym=USD&tsyms=${tickers.join(
        ','
    )}&api-key=${API_KEY}`
  )
    .then(r => r.json()
    .then(rawData =>
      Object.fromEntries(
          Object.entries(rawData).map(([key,value]) => [key, 1 / value])
      )
  ));