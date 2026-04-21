import React, { useEffect, useState } from 'react'
import { TextField, FormLayout, Icon, Checkbox, InlineError } from '@shopify/polaris';
import { PhoneMajor, EmailMajor } from '@shopify/polaris-icons';
import actionTypes from '../../../store/actionTypes';
// import Timekeeper from 'react-timekeeper';
import { useDispatch, useSelector } from 'react-redux';
import CustomModal from '../../CustomModal';
import './style.css'
import Clock from '../../Clock';
// import TimeKeeper from 'react-timekeeper';

const VendorForm = props => {
    const { saveSupplier } = actionTypes
    const { shopId } = useSelector(state => state.ConfigReducer)
    const dispatch = useDispatch()
    const [Time, setTime] = useState("00:00")
    const [TimePicker, setTimePicker] = useState({ active: false, key: '' })
    const [Supplier, setSupplier] = useState({
        id: props.supplier.id,
        shopId: props.supplier.shopId ? props.supplier.shopId : shopId,
        name: props.supplier.name,
        website: props.supplier.website,
        phone: props.supplier.phone,
        email: props.supplier.email,
        accountNumber: props.supplier.accountNumber,
        enabled: props.supplier.enabled,
        autoSubmit: props.supplier.autoSubmit,
        address: props.supplier.address,
        replyEmail: props.supplier.replyEmail,
        cutoff: props.supplier.cutoff ? props.supplier.cutoff : {},
    })

    const [Error, setError] = useState(props.error)


    useEffect(() => {
        setError(props.error)
    }, [props.error])

    useEffect(() => {
        dispatch({ type: saveSupplier, payload: Supplier })
    }, [Supplier])


    const handleChange = (field, value) => {
        setSupplier({ ...Supplier, [field]: value })
    }
    const handleChangeCutoff = (obj) => {

        setSupplier({ ...Supplier, cutoff: { ...Supplier.cutoff, ...obj } })
    }
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    const rows = days.map(day => {
        const shortDay = day.toLowerCase().slice(0, 3)
        return <tr>
            <td>{day}</td>
            <td>
                <div className='check'><Checkbox
                    checked={Supplier.cutoff[`${shortDay}1stActive`]}
                    onChange={value => handleChangeCutoff({ [`${shortDay}1stActive`]: value })}
                /></div>
                <div className='first-input'>
                    <Clock time={Supplier.cutoff[`${shortDay}1stTime`]} handleChangeCutoff={time => handleChangeCutoff({ [`${shortDay}1stTime`]: time })} />
                </div>
                {/* <div className='input'><TextField
                    type="text"
                    autoComplete="off"
                    readOnly={true}
                    value={Supplier.cutoff[`${shortDay}1stTime`]}
                    onFocus={() => openTimePicker(Supplier.cutoff[`${shortDay}1stTime`], `${shortDay}1stTime`)}
                /></div> */}
            </td>
            <td>
                <div className='check'><Checkbox
                    checked={Supplier.cutoff[`${shortDay}2ndActive`]}
                    onChange={value => handleChangeCutoff({ [`${shortDay}2ndActive`]: value })}
                /></div>
                <div className='second-input'>
                    <Clock time={Supplier.cutoff[`${shortDay}2ndTime`]} handleChangeCutoff={time => handleChangeCutoff({ [`${shortDay}2ndTime`]: time })} />
                </div>
                {/* <div className='input'><TextField
                    type="text"
                    autoComplete="off"
                    readOnly={true}
                    value={Supplier.cutoff[`${shortDay}2ndTime`]}
                    onFocus={() => openTimePicker(Supplier.cutoff[`${shortDay}2ndTime`], `${shortDay}2ndTime`)}
                /></div> */}
            </td>
        </tr>
    })

    const openTimePicker = (time, key) => {
        setTime(time)
        setTimePicker({ active: true, key })
    }
    const closeTimePicker = () => {
        setTime("00:00")
        setTimePicker({ active: false, key: '' })
    }
    const SetNewSize = event => {
        const textArea = document.getElementById(event.target.id)
        textArea.style.height = "106px";
        textArea.style.height = textArea.scrollHeight + "px";
    }
    return <>
        <FormLayout>
            <TextField
                label="Company Name"
                placeholder="Company Name"
                type="text"
                value={Supplier.name}
                onChange={value => {
                    handleChange("name", value)
                    if (value !== '') {
                        setError({ ...Error, name: '' })
                    } else if (value === '') {
                        setError({ ...Error, name: 'Name is required!' })
                    }
                }}
                disabled={Supplier.id !== ''}
                onBlur={() => {
                    if (Supplier.name === '') {
                        setError({ ...Error, name: 'Name is required!' })
                    }
                }}
                error={Error.name}
            />
            <FormLayout.Group>
                <TextField
                    label="Company Website"
                    placeholder="Company Website"
                    type="text"
                    value={Supplier.website}
                    onChange={value => handleChange("website", value)}
                />
                <TextField
                    label="Company Phone no."
                    placeholder="Company Phone no."
                    type="text"
                    value={Supplier.phone}
                    onChange={value => {
                        handleChange("phone", value)
                        if (value !== '') {
                            setError({ ...Error, phone: '' })
                        } else if (value === '') {
                            setError({ ...Error, phone: 'Phone is required!' })
                        }
                    }}
                    prefix={<Icon source={PhoneMajor} />}
                    onBlur={() => {
                        if (Supplier.phone === '') {
                            setError({ ...Error, phone: 'Phone is required!' })
                        }
                    }}
                    error={Error.phone}

                />
            </FormLayout.Group>
            <TextField
                label="Account Number with Supplier"
                placeholder="Account Number with Supplier"
                type="text"
                value={Supplier.accountNumber}
                onChange={value => handleChange("accountNumber", value)}
            />
            <FormLayout.Group>
                <Checkbox
                    label="Active"
                    checked={Supplier.enabled}
                    onChange={value => handleChange("enabled", value)}
                />
                <Checkbox
                    label="Auto Submit Purchase Order"
                    checked={Supplier.autoSubmit}
                    onChange={value => handleChange("autoSubmit", value)}
                />
            </FormLayout.Group>
            <FormLayout.Group>
                <TextField
                    label="Email"
                    placeholder="Email address for orders"
                    type="text"
                    value={Supplier.email}
                    onChange={value => {
                        handleChange("email", value)
                        if (value !== '') {
                            setError({ ...Error, email: '' })
                        } else if (value === '') {
                            setError({ ...Error, email: 'Email is required!' })
                        }
                    }}
                    prefix={<Icon source={EmailMajor} color="base" />}
                    onBlur={() => {
                        if (Supplier.phone === '') {
                            setError({ ...Error, email: 'Email is required!' })
                        }
                    }}
                    error={Error.email}
                />
                <TextField
                    label="Email Reply-to Address"
                    placeholder="Email Reply-to Address"
                    type="text"
                    value={Supplier.replyEmail}
                    onChange={value => {
                        handleChange("replyEmail", value)
                        if (value !== '') {
                            setError({ ...Error, replyEmail: '' })
                        } else if (value === '') {
                            setError({ ...Error, replyEmail: 'Reply-to email is required!' })
                        }
                    }}
                    prefix={<Icon source={EmailMajor} color="base" />}
                    onBlur={() => {
                        if (Supplier.replyEmail === '') {
                            setError({ ...Error, replyEmail: 'Reply-to email is required!' })
                        }
                    }}
                    error={Error.replyEmail}
                />
            </FormLayout.Group>
            <label>Address
                <textarea
                    className={Error.address !== "" ? "address addressError" : "address"}
                    id="address"
                    name="address"
                    value={Supplier.address}
                    onChange={event => {
                        handleChange("address", event.target.value)
                        if (event.target.value !== '') {
                            setError({ ...Error, address: '' })
                        } else if (event.target.value === '') {
                            setError({ ...Error, address: 'Address is required!' })
                        }
                    }}
                    onBlur={() => {
                        if (Supplier.address === '') {
                            setError({ ...Error, address: 'Address is required!' })
                        }
                    }}
                    rows="4"
                    onKeyUp={event => SetNewSize(event)}>
                </textarea>
                <div style={{ marginTop: '4px' }}>
                    <InlineError message={Error.address} fieldID={"address"} />
                </div>
            </label>
            <table className='cutoffTable'>
                <thead>
                    <tr>
                        <th>Days</th>
                        <th>First Cutoff</th>
                        <th>Final Cutoff</th>
                    </tr>
                </thead>
                <tbody>
                    {rows}
                </tbody>
            </table>
            <input
                placeholder="Id"
                type="hidden"
                value={Supplier.id}
            />
        </FormLayout>

        <CustomModal
            active={TimePicker.active}
            onClose={closeTimePicker}
            component={
                <></>
                // <TimeKeeper
                //     switchToMinuteOnHourSelect={true}
                //     closeOnMinuteSelect={false}
                //     time={Time}
                //     onChange={time => {
                //         setTime(time.formatted24)
                //     }}
                //     onDoneClick={() => {
                //         handleChangeCutoff(TimePicker.key, Time)
                //         closeTimePicker()
                //     }}
                // />
            }
        />
    </>
}

export default VendorForm