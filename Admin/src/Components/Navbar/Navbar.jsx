import React from 'react'
import './Navbar.css'
import NavLogo from '../../assets/nav-logo.svg'
import NavProfile from '../../assets/nav-profile.svg'
const Navbar = () => {
  return (
    <div className='navbar'>
      <img className='nav-logo' src={NavLogo} alt="" />
       <img className='nav-profile' src={NavProfile} alt="" />
    </div>
  );
};

export default Navbar;