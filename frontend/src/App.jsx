import React, { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import ChatPage from './pages/ChatPage'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'
import { useAuthStore } from './store/useAuthStore'
import PageLoader from './components/PageLoader'

import {Toaster} from 'react-hot-toast'


function App() {
  const {checkAuth, isCheckingAuth, authUser} = useAuthStore()

  useEffect(() => {
    checkAuth();
  },[checkAuth]);

  
  
  if(isCheckingAuth) return <PageLoader/>

  return (
  <div className="min-h-screen bg-slate-900 relative flex items-center justify-center p-4 overflow-hidden">
  <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 via-purple-900
   to-gray-900 bg-[length:400%_400%] animate-[moveGradient_18s_ease_infinite] opacity-30" /> 
    
    
    <Routes>
      <Route path='/' element={authUser? <ChatPage/> : <Navigate to={"/login"} />} />
      <Route path='/login' element={!authUser ? <LoginPage/> : <Navigate to={"/"} />} />
      <Route path='/signup' element={!authUser ? <SignUpPage/> : <Navigate to={"/"} />} />
      </Routes>

      <Toaster/>
  </div>
  
    
    
   
  )
}

export default App