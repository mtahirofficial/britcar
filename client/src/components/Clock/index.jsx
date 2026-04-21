import React, { useState } from 'react'
import { TimePicker } from 'react-ios-time-picker';

const Clock = props => {
    const [value, setValue] = useState(props.time);

    const onChange = (timeValue) => {
        props.handleChangeCutoff(timeValue)
        setValue(timeValue);
    }

    return (
        <TimePicker onChange={onChange} cellHeight={50} value={value} />
    )
}

export default Clock