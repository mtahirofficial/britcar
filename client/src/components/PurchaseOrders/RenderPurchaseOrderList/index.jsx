import React, { useState } from 'react'
import { Spinner, TextField } from '@shopify/polaris';
import { useDispatch, useSelector } from 'react-redux'
import { Link } from "react-router-dom";
import actionTypes from '../../../store/actionTypes';
import "./style.css";
import axios from 'axios';
import CountDownTimerC from '../../CountDownTimer';

const RenderPurchaseOrderList = props => {
    const { viewOrder, savePurchaseOrders } = actionTypes

    const { moneyFormat, serverLink, shopId } = useSelector(state => state.ConfigReducer)
    const { poStatus, purchaseOrders } = useSelector(state => state.POReducer)
    const dispatch = useDispatch()

    const [EditNotes, setEditNotes] = useState({})
    const [Notes, setNotes] = useState({})
    const [OldNotes, setOldNotes] = useState({})
    const [NotesUpdating, setNotesUpdating] = useState({})

    const handleChange = (field, value) => {
        setNotes({ ...Notes, [field]: value })
    }
    const handleEdit = (field, value) => {
        setEditNotes({ ...EditNotes, [field]: value })
    }

    const updateOrderNotes = (id, requestData) => {
        requestData.notes = requestData.notes.trim() === '' ? '-' : requestData.notes.trim()
        const ifConnected = window.navigator.onLine;
        if (ifConnected) {
            setNotesUpdating({ ...NotesUpdating, [id]: true })
            const options = {
                method: 'PUT',
                url: `/order/update/${id}/${shopId}`,
                data: requestData
            }
            axios(options).then(({ data }) => {
                const orders = purchaseOrders
                for (const i in orders) {
                    if (orders[i].id === id) {
                        orders[i].notes = data.notes
                        setOldNotes({ ...OldNotes, [orders[i].id]: data.notes })
                    }
                }
                dispatch({ type: savePurchaseOrders, payload: orders })
                setNotesUpdating({ ...NotesUpdating, [id]: false })
                handleEdit(id, false)
            }).catch(error => {
                handleChange(id, '-')
                handleEdit(id, false)
                setNotesUpdating({ ...NotesUpdating, [id]: false })
                console.log("error", error)
            })
        } else {
            console.log("Please, Check Your Internet Connection!")
        }
    }
    const rows = purchaseOrders.length > 0 ? purchaseOrders.map((order, index) => {
        const createdDate = new Date(order.createdAt)
        order.createdAt = `${createdDate.toDateString()} ${createdDate.getHours().toString().padStart(2, '0')}:${createdDate.getMinutes().toString().padStart(2, '0')}`

        const submittedDate = order.submittedAt !== null && order.submittedAt !== '' ? new Date(order.submittedAt) : ''
        order.submittedAt = submittedDate !== null && submittedDate !== '' ? `${submittedDate.toDateString()} ${submittedDate.getHours().toString().padStart(2, '0')}:${submittedDate.getMinutes().toString().padStart(2, '0')}` : ''
        const cost = order.costValue ? moneyFormat.replace("{{amount}}", order.costValue.toFixed(2).toString()) : null
        const costPlusTax = order.costValuePlusVat ? moneyFormat.replace("{{amount}}", order.costValuePlusVat.toFixed(2).toString()) : null
        return <tr className={`tr`} key={index}>
            <td className="td">
                <Link
                    className="poNumber"
                    onClick={() => dispatch({ type: viewOrder, payload: order })}
                    to={`/orders/${order.id}`}
                >
                    {order.id}
                </Link>
            </td>
            <td className="td">{order.vendor.name}</td>
            <td className="td">
                {
                    order.status === "null" ?
                        <CountDownTimerC orderId={order.id} cutoff={order.timeUntilCutoff} />
                        : poStatus[order.status]
                }
            </td>
            {/* <td className="td">{order.timeUntilCutoff}</td> */}
            <td className="td">{cost}</td>
            <td className="td">{costPlusTax}</td>
            <td className="td">
                {
                    EditNotes[order.id] ? <TextField labelHidden focused={true} name="notes" label="Add Notes" placeholder="Add Notes" type="text"
                        value={Notes[order.id]}
                        onFocus={() => {
                            if (order.notes === '-' || order.notes === null) {
                                handleChange(order.id, '')
                            } else {
                                handleChange(order.id, order.notes)
                                setOldNotes({ ...OldNotes, [order.id]: order.notes })
                            }
                        }}
                        onChange={value => {
                            handleChange(order.id, value)
                        }}
                        onBlur={() => {
                            // if ((Notes[order.id] === '' || Notes[order.id] === undefined) && (OldNotes[order.id] === '' || OldNotes[order.id] === null)) {
                            if (!Notes[order.id] && !OldNotes[order.id]) {
                                handleChange(order.id, '-')
                                handleEdit(order.id, false)
                            } else if (Notes[order.id] === OldNotes[order.id]) {
                                handleChange(order.id, OldNotes[order.id])
                                handleEdit(order.id, false)
                            } else {
                                updateOrderNotes(order.id, { notes: Notes[order.id] })
                            }
                        }}
                        suffix={NotesUpdating[order.id] ? <Spinner accessibilityLabel="notes spinner" size="small" /> : null}
                    /> : <span style={{ display: 'inline-block', maxWidth: '300px', whiteSpace: 'normal' }} onClick={() => {
                        handleEdit(order.id, true)
                    }}>{order.notes}</span>
                }
            </td>
            {/* <td className="td">{poStatus[order.status]}</td> */}
            <td className="td">{order.submittedAt}</td>
            <td className="td">{order.createdAt}</td>
        </tr>
    })
        : []
    return rows
}

export default RenderPurchaseOrderList
