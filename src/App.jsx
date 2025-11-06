import {BrowserRouter, Routes, Route} from 'react-router-dom';
import HomePage from "./pages/HomePage.jsx";
import AgendaPage from "./pages/AgendaPage.jsx"
import ProfessorPainel from './pages/ProfessorPainel.jsx'
import Sucess from './pages/Sucess.jsx';

function App ( ) {
    return(
        <BrowserRouter>
            <Routes>
                <Route path="/home" element={<HomePage/>}/>
                <Route path="/agenda" element={<AgendaPage/>} /> 
                <Route path='/professorPainel' element={<ProfessorPainel/>} />
                <Route path="/pagamento-sucesso" element={<Sucess/>}/>
                <Route path="*" element={<HomePage/>}/>
            </Routes>
        </BrowserRouter>
    )
}

export default App;