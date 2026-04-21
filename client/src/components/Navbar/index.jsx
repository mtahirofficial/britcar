import React, { useState } from 'react'
import { Link } from "react-router-dom";
import './style.css'

const Navbar = props => {
    const [ActiveIndex, setActiveIndex] = useState(0)

    const list = props.options.map((option, i) => {
        return <Link key={i} to={option.url}><li className={ActiveIndex === i ? "active" : ""} onClick={() => setActiveIndex(i)}>{option.text}</li></Link>
    })
    return <ul className="nav">{list}</ul>
}
export default Navbar