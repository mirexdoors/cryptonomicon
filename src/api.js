export const COINS_API =
  "https://min-api.cryptocompare.com/data/all/coinlist?summary=true";

const tickersHandlers = new Map();

const tickersWorker = new SharedWorker("/worker.js");

tickersWorker.port.onmessage = ({ data }) => {
  invokeHandlers(data.name, data.price);
};

const invokeHandlers = (name, newPrice = undefined) => {
  const handlers = tickersHandlers.get(name) ?? [];

  handlers.forEach((fn) => {
    fn(newPrice);
  });
};

export const subscribeToTicker = (ticker, cb) => {
  const subscribers = tickersHandlers.get(ticker) || [];
  tickersHandlers.set(ticker, [...subscribers, cb]);
  tickersWorker.port.postMessage(JSON.stringify([ticker, true]));
};

export const unsubscribeFromTicker = (ticker) => {
  tickersHandlers.delete(ticker);
  tickersWorker.port.postMessage(JSON.stringify([ticker, false]));
};
