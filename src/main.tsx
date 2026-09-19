import React from 'react';
import ReactDOM from 'react-dom/client';
import { onCLS, onINP, onLCP, type Metric } from 'web-vitals';
import App from './App';
import './styles/tokens.css';
import './styles/base.css';
import './styles/app.css';
import './styles/stats.css';
import './styles/form.css';
import './styles/filters.css';
import './styles/list.css';

function reportWebVitals(metric: Metric) {
  if (import.meta.env.DEV) {
    void metric;
  }
import './styles/breakpoints.css';
}

onCLS(reportWebVitals);
onINP(reportWebVitals);
onLCP(reportWebVitals);

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find the root element to mount React application.');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
