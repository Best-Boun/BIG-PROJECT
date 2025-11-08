import { useRef } from 'react';
import Form from 'react-bootstrap/Form';
import { verifyUser } from '../data/user';
import './Login.css';

function Login( {setToken, setRole}) {

  const userRef = useRef()
  const passRef = useRef()


  return (
    <div className="Login-con">
      <Form.Label htmlFor="username">Username</Form.Label>
      <Form.Control
        type="text"
        id="username"
        placeholder='Username'
        ref={userRef}
      />

       <Form.Label htmlFor="Password">Password</Form.Label>
      <Form.Control
        type="Password"
        id="Password"
        placeholder='Password'
        ref={passRef}
      />
      <button className='btn btn-secondary' onClick={() => {
        const user = userRef.current.value.trim()
        const pass = passRef.current.value.trim()
        userRef.current.value = ''
        passRef.current.value = ''

        const userInfo = verifyUser(user, pass)
        if(userInfo === null){
          alert('Wrong username or password')
          userRef.current.focus()
        }else{
          setToken(userInfo.token)
          setRole(userInfo.role)
        }

      }}>Login</button>
    </div>
  );
} 

export default Login;