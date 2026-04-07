import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfiguratorSetup } from 'ov25-setup';
import 'ov25-setup/dist/index.css';

const BED_PREVIEW_API_KEY =
  '64-cded72a1485f2a14fbc30d0e41dfc702aed35dd77605628a3a839dc8d523ffca';

function App() {
  return (
    <ConfiguratorSetup apiKey={BED_PREVIEW_API_KEY} />
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

export default App;
