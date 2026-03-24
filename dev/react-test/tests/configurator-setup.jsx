import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfiguratorSetup } from 'ov25-setup';
import 'ov25-setup/dist/index.css';

function App() {
  return (
    <ConfiguratorSetup

    />
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

export default App;
