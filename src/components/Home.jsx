// src/components/Home.jsx

import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      <h1>Welcome to Event Management System</h1>
      <p>Manage your events with ease!</p>
      <Link to="/signup">Sign Up</Link>
      <Link to="/signin">Sign In</Link>
    </div>
  );
};

export default Home;