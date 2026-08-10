const connectors = [];

const removeConnector = (connector) => {
  connectors.splice(connectors.indexOf(connector), 1);
};

export { connectors, removeConnector };
