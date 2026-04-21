import React from 'react'
import './style.css'

const CustomModal = props => {
    return (
        <div className="modal" style={{ display: props.active ? 'block' : 'none' }}>
            <div className="modal-content">
                <span className="close" onClick={props.onClose}>&times;</span>
                {props.component}
            </div>
        </div>
    )
}

export default CustomModal
