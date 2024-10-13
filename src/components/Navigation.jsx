// src/components/Navigation.jsx
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

const Navigation = () => {
  const navigate =  useNavigate();

  const handleSignOut = () => {
    signOut(auth).then(() => {
      // Sign-out successful.
      navigate("/signin")
    }).catch((error) => {
      // An error happened.
      console.error('Sign out error', error);
    });
  };

  return (
    <nav>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><button onClick={handleSignOut}>Sign Out</button></li>
      </ul>
    </nav>
  );
};

export default Navigation;