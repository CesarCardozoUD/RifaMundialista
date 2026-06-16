import { HashRouter, Routes, Route } from "react-router-dom"

import Login from "./pages/Login"
import Home from "./pages/Home"
import Predictions from "./pages/Predictions"
import Error from "./pages/Error"
import Register from "./pages/Register"
import Admin from "./pages/Admin"
import ProtectedRoute from "./pages/ProtectedRoute"

function App() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <HashRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/predictions" element={<ProtectedRoute><Predictions /></ProtectedRoute>} />
          <Route path="/create-user" element={<Register />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<Error />} />
        </Routes>
      </HashRouter>
    </div>
  )
}

export default App