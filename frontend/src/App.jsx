import React from 'react'
import { Route, Routes } from 'react-router'
import ChatPage from './pages/ChatPage'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'
import { useAuthStore } from './store/useAuthStore'

function App() {
  const { authUser, login, isLoggedIn}= useAuthStore();

  console.log("auth user:", authUser);
  console.log("isLoggedIn:", isLoggedIn);
  return (
  <div className="min-h-screen bg-slate-900 relative flex items-center justify-center p-4 overflow-hidden">
  <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 via-purple-900
   to-gray-900 bg-[length:400%_400%] animate-[moveGradient_18s_ease_infinite] opacity-30" /> 
    
    <button onClick={login} className='z-10'>login</button>
    
    <Routes>
      <Route path='/' element={<ChatPage/>} />
      <Route path='/login' element={<LoginPage/>} />
      <Route path='/signup' element={<SignUpPage/>} />
      </Routes>
  </div>
  
    
    
   
  )
}

export default App