import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import RequireAuth from './components/Auth/RequireAuth'
import Register from './components/Auth/Register'
import { ToastContainer } from 'react-toastify';
import Login from './components/Auth/Login'
import Game from './Pages/Game';
import Menu from './Pages/Menu'
// import Game from './Pages/Game'
import { SocketProvider } from './Context/SocketContext'
import 'react-toastify/dist/ReactToastify.css';
import Lobby from './Pages/Lobby';

function App() {

  return (
    <BrowserRouter>
      {/* <Navigation/> */}
        <SocketProvider>
      <Routes>
        <Route index element={<Login />}></Route>
        <Route path="/Register" element={<Register />}></Route>
        <Route path="/Lobby" element={<RequireAuth> <Lobby /></RequireAuth>}></Route>
        <Route path="/game/:roomCode" element={<Game />}></Route>
      </Routes>
        </SocketProvider>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </BrowserRouter>
  )
}

export default App
