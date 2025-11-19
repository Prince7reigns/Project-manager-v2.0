import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import Login from './pages/auth/login.jsx';
import SignUp from './pages/auth/signup.jsx';

import PrivateRoute from './Routes/PrivateRoute.jsx';
import AdminDashboard from './pages/admin/Dashboard.jsx';
import ManageTasks from './pages/admin/ManageTasks.jsx';
import CreateTask from './pages/admin/CreateTask.jsx';
import ManageUsers from './pages/admin/ManageUsers.jsx';
import UserDashboard from './pages/User/UserDashboard';
import MyTasks from './pages/User/MyTasks.jsx';
import ViewTaksDetails from './pages/User/ViewTaksDetails.jsx';
import UserProvider, { UserContext } from './context/userContext.jsx';
import { Toaster } from 'react-hot-toast';


const App = () => {
  return (
 <UserProvider>
  <div>
    <Router>
      <Routes>
        {/* Public Routes - Accessible to everyone */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        <Route element={<PrivateRoute allowedRoles={['admin']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/tasks" element={<ManageTasks />} />
          <Route path="/admin/create-task" element={<CreateTask />} />
          <Route path="/admin/users" element={<ManageUsers />} />
        </Route>

        <Route element={<PrivateRoute allowedRoles={['user']} />}>
          <Route path="/user/dashboard" element={<UserDashboard />} />
          <Route path="/user/tasks" element={<MyTasks />} />
          <Route path="/user/tasks-details/:id" element={<ViewTaksDetails />} />
        </Route>

       <Route path='/' element={<Root/>}/>
      </Routes>
    </Router>
    </div>

    <Toaster 
    toastOptions={{
      className:"",
      style:{
        fontSize:"13px",
      }
    }}
    
    />
    </UserProvider>
  );
};

export default App;

const Root = () =>{
  const {user,loading} = useContext(UserContext)

  if(loading) return <Outlet />

  if(!user){
    return <Navigate to="/login" />
  }

  return user?.role === "admin" ? <Navigate to="/admin/dashboard"/> : <Navigate to="user/dashboard"/>
}
