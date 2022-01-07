const API_KEY =
  "3cb7075ac5e07b2405b946f187ead14834e44832d6caf90a6f5aedcfd41a1f80";

const AGGREGATE_INDEX = "5";
const INVALID_INDEX = "500";

const ports = [];

const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`
);

socket.addEventListener("message", (e) => {
  const {
    TYPE: type,
    FROMSYMBOL: currency,
    PRICE: newPrice,
  } = JSON.parse(e.data);

  if (type !== AGGREGATE_INDEX && type !== INVALID_INDEX) {
    return;
  }

  ports.forEach((port) => {
    port.postMessage({
      name: currency,
      price: newPrice,
    });
  });
});

const sendToWebSocket = (message) => {
  const stringifiedMessage = JSON.stringify(message);
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(stringifiedMessage);
    return;
  }

  socket.addEventListener(
    "open",
    () => {
      socket.send(stringifiedMessage);
    },
    { once: true }
  );
};

const subscribeToTickerOnWs = (ticker) => {
  sendToWebSocket({
    action: "SubAdd",
    subs: [`5~CCCAGG~${ticker}~USD`],
  });
};

const unSubscribeToTickerOnWs = (ticker) => {
  sendToWebSocket({
    action: "SubRemove",
    subs: [`5~CCCAGG~${ticker}~USD`],
  });
};

self.onconnect = function (e) {
  const port = e.ports[0];

  ports.push(port);

  port.addEventListener("message", function (e) {
    const [ticker, isSubscribeOperation] = JSON.parse(e.data);

    if (isSubscribeOperation) {
      return subscribeToTickerOnWs(ticker);
    }

    unSubscribeToTickerOnWs(ticker);
  });

  port.start();
};
