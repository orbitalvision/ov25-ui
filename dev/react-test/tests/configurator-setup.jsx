import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfiguratorSetup } from 'ov25-setup';
import 'ov25-setup/dist/index.css';

const DIAMOND_APIKEY = import.meta.env.VITE_DIAMOND_APIKEY;

function App() {
  return (
    <ConfiguratorSetup apiKey={DIAMOND_APIKEY} />
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

export default App;
