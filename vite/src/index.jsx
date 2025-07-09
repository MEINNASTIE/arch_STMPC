import { createRoot } from 'react-dom/client';

import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

import App from './App';
import reducer from './store/reducer';

import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/700.css';

import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';

import 'assets/scss/style.scss';

const container = document.getElementById('root');
const root = createRoot(container);
const store = configureStore({ reducer });

root.render(
  <Provider store={store}>
    <App />
  </Provider>
);

// If we want app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
