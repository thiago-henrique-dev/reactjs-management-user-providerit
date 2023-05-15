import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Register from '../pages/Register/Register'
import Admin from '../pages/Admin/Admin';
import Private from './Private'
import Formulario from '../pages/Name/Name';
import Login from '../pages/Home/Login'

export default function ApplicationRouter() {
    return (
            <Router>
                <Routes>
                  <Route exact path="/" element={< Login/>} />
                  <Route exact path="/register" element={< Register/>} />
                  <Route exact path="/info" element={ <Private><Formulario/></Private>} />
                  <Route exact path="/admin" element={ <Private><Admin/></Private>} />
                </Routes>
            </Router>

    )
}

