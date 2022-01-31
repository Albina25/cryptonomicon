// export function loadTicker()

const API_KEY =
  'd33aa022c48f34ea62feec55cdafbeba4efc8d1b0368d70a47747aaa90dccecd';

// const tickers = [];
const tickersHandlers = new Map();

// export const loadTickers = (tickers) =>
//   fetch(
//     `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${tickers.join(
//         ','
//     )}&tsyms=USD&api_key=${API_KEY}`
//   )
//     .then(r => r.json())
//     .then(rawData =>
//       Object.fromEntries(
//           Object.entries(rawData).map(([key,value]) => [key, value.USD])
//       )
//     );

const loadTickers = () => {
  if (tickersHandlers.size === 0) {
    return;
  }

  fetch(
    `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${[
      ...tickersHandlers.keys()
    ].join(",")}&tsyms=USD&api_key=${API_KEY}`
  )
    .then(r => r.json())
    .then(rawData => {
      const updatedPrices = Object.fromEntries(
        Object.entries(rawData).map(([key, value]) => [key, value.USD])
      );
      Object.entries(updatedPrices).forEach(([currency, newPrice]) => {
        const handlers = tickersHandlers.get(currency) ?? [];
        handlers.forEach(fn => fn(newPrice));
      });
    });
};

export const subscribeToTicker = (ticker, cb) => {
  const subscribers = tickersHandlers.get(ticker) || [];
    tickersHandlers.set(ticker,[...subscribers,cb]);
};

export const unsubscribeFromTicker = (ticker) => {
  tickersHandlers.delete(ticker);
  // const subscribers = tickersHandlers.get(ticker) || [];
  //   tickersHandlers.set(
  //   ticker,
  //   subscribers.filter(fn => fn !== cb)
  // );
};

setInterval(loadTickers, 5000);
window.tickersHandlers = tickersHandlers;
