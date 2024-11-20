import { Provider } from 'react-redux'; // Import Provider từ react-redux
import store from '../src/redux/store'; // Import store của bạn
import { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import ThemeProvider from '../src/theme';
import App from './App';

// ----------------------------------------------------------------------

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <HelmetProvider>
    <BrowserRouter>
      <Suspense>
        <Provider store={store}> 
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </Provider>
      </Suspense>
    </BrowserRouter>
  </HelmetProvider>
);
