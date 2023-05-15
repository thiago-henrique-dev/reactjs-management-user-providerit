import ApplicationRouter from './router/Router';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import {ToastContainer} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './App.css';

function App() {
  return (
    <div className="App">
      <ToastContainer />
      <ApplicationRouter />
    </div>
  );
}

export default App;
