import * as React from 'react'
import { Link } from 'react-router-dom'
import logo from '../../assets/img/logo.png'
import './index.scss'

const Header = () => {
  return (
    <header className='header'>
      <Link to='/' className='logo'>
        <img src={logo} alt=''/>
      </Link>
    </header>
  )
}

export default Header
