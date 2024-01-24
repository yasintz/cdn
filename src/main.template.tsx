import ReactDOM from 'react-dom/client';
// @ts-ignore
import App from 'src/app/{app-path}';

const element = document.getElementById('root') as HTMLElement;
const root = ReactDOM.createRoot(element);

root.render(<App />);
