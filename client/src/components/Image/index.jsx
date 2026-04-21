import React from 'react'
const Image = props => {
    return <img
        src={props.src}
        alt={props.alt}
        width="100%"
        style={{
            padding: "10px"
        }}
        onClick={() => props.openImage(props.src)}
    />
}

export default Image
