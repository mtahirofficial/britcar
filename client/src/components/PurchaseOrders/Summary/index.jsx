import React, { useState, useEffect } from 'react'
import { Page, Card, Button } from '@shopify/polaris';
import { useDispatch, useSelector } from 'react-redux';
import actionTypes from '../../../store/actionTypes';
import ModalComponent from '../../ModalComponent';
import ReceiveStock from '../ReceiveStock';
import './style.css'
import axios from 'axios';
import OrderDetails from '../OrderDetails';

const Summary = props => {
    const { saveSummaryOrders, savePurchaseOrders, setCheckBin } = actionTypes

    const { receivedQty, itemStatus, purchaseOrders, checkBin } = useSelector(state => state.POReducer)
    const dispatch = useDispatch()

    const { serverLink, shopId } = useSelector(state => state.ConfigReducer)

    useEffect(() => {
        return () => dispatch({ type: saveSummaryOrders, payload: [] })
    }, [])

    const [StockReceive, setStockReceive] = useState({ active: false, product: {} })
    const [Compeleting, setCompeleting] = useState(false)
    const [Compeleted, setCompeleted] = useState({ dispatchBay: '', order: {}, item: {}, customer: {}, active: false })

    const updateOrderStatus = id => {
        const ifConnected = window.navigator.onLine;
        if (ifConnected) {
            const options = {
                method: 'put',
                url: `/order/statusUpdate/${id}/${shopId}`,
            }
            axios(options)
                .then(({ data }) => {
                    const pos = purchaseOrders
                    for (const i in pos) {
                        if (pos[i].id === id) {
                            pos[i].status = data
                        }
                    }
                    dispatch({ type: savePurchaseOrders, payload: pos })

                })
                .catch(error => {
                    console.log("error", error)
                })
        } else {
            console.log("Please, Check Your Internet Connection!")
        }
    }

    const updateReceivedQty = (id, qty, receivedQty, variantId) => {
        const ifConnected = window.navigator.onLine;
        let selectedItem = {}
        if (ifConnected) {
            setCompeleting(true)
            const options = {
                method: 'put',
                url: `/order/poItem/${id}/${variantId}/${shopId}`,
                data: { ...receivedQty, qty }
            }
            axios(options)
                .then(({ data }) => {
                    console.log(data);
                    setCompeleting(false)
                    if (data.updated) {
                        let poIndex;
                        let itemIndex;
                        for (const i in props.summaryOrders) {
                            const order = props.summaryOrders[i]
                            for (const j in order.purchaseorderitems) {
                                if (order.purchaseorderitems[j].id === id) {
                                    poIndex = i
                                    itemIndex = j
                                    props.summaryOrders[i].purchaseorderitems[j].received = data.receivedQty;
                                    props.summaryOrders[i].purchaseorderitems[j].status = itemStatus[data.status];
                                    selectedItem = order.purchaseorderitems[j]
                                }
                            }
                        }
                        setCompeleted({ dispatchBay: data.dispatchBay, customer: data.customer, order: props.summaryOrders[poIndex], item: selectedItem, active: true })

                        const pos = purchaseOrders
                        for (const orderIndex in pos) {
                            if (pos[orderIndex].id === props.summaryOrders[poIndex].id) {
                                const order = pos[orderIndex]
                                for (const poItemIndex in order.purchaseorderitems) {
                                    if (order.purchaseorderitems[poItemIndex].id === props.summaryOrders[poIndex].purchaseorderitems[itemIndex].id) {
                                        const item = order.purchaseorderitems[poItemIndex]
                                        item.status = data.status
                                        order.purchaseorderitems.splice(poItemIndex, 1, item);
                                    }
                                    if (pos[orderIndex].purchaseorderitems[poItemIndex].id === id) {
                                        pos[orderIndex].purchaseorderitems[poItemIndex].received = data.receivedQty;
                                    }
                                }
                                pos.splice(orderIndex, 1, order);
                            }
                        }
                        dispatch({ type: savePurchaseOrders, payload: pos })

                        if (qty <= data.receivedQty) {
                            props.summaryOrders[poIndex].purchaseorderitems.splice(itemIndex, 1);
                        }

                        dispatch({ type: saveSummaryOrders, payload: props.summaryOrders })

                        updateOrderStatus(props.summaryOrders[poIndex].id)

                        setStockReceive({ active: false, product: {} })
                    } else {
                        console.log(data);
                    }
                })
                .catch(error => {
                    setStockReceive({ active: false, product: {} })
                    setCompeleting(false)
                    console.log("error", error)
                })
        } else {
            console.log("Please, Check Your Internet Connection!")
        }
    }

    let rows = [];
    let counter = 0;
    for (const order of props.summaryOrders) {
        for (const item of order.purchaseorderitems) {
            counter++;
            const createdDate = new Date(order.createdAt)
            order.createdAt = `${createdDate.toDateString()} ${createdDate.getHours()}:${createdDate.getMinutes()}`
            const row = <tr key={counter} className="tr">
                <td className="td">{counter}</td>
                <td className="td">{order.id}</td>
                <td className="td"><span style={{ display: 'inline-block', maxWidth: '300px', whiteSpace: 'normal' }}>{item.description}</span></td>
                <td className="td">{item.orderNumber}</td>
                <td className="td">{item.notes}</td>
                <td className="td">{item.qty}</td>
                <td className="td">{item.received}</td>
                <td className="td">{order.createdAt}</td>
                <td className="td" style={{ textAlign: 'center' }}>
                    <Button outline onClick={() => {
                        dispatch({ type: setCheckBin, payload: { binError: '', bin: item.sku } })
                        setStockReceive({ active: true, product: { ...item, poNum: order.id, vendor: order.vendor } })
                    }}>Receive Stock</Button>
                </td>
            </tr >
            rows.push(row)
        }
    }

    return (
        <Page
            fullWidth
            title={`Purchase Order - Summary for ${props.summaryOrders[0].vendor.name}`}
            primaryAction={{
                content: 'Back',
                onAction: () => dispatch({ type: saveSummaryOrders, payload: [] }),
            }}
        >
            <Card
                subdued
            >
                <Card.Section>
                    <div className='tableParent'>
                        <table className="summaryTable">
                            <thead className="summaryTableHead">
                                <tr>
                                    <th className="th">#</th>
                                    <th className="th">PO #</th>
                                    <th className="th">Name</th>
                                    <th className="th">For Order</th>
                                    <th className="th">Notes</th>
                                    <th className="th">Qty.</th>
                                    <th className="th">Received</th>
                                    <th className="th">Ordered At</th>
                                    <th className="th" style={{ textAlign: 'center' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    rows
                                }
                            </tbody>
                        </table>
                    </div>
                </Card.Section>
            </Card>

            <ModalComponent
                large={false}
                modalTitle={`Receive Purchase Order Line #${StockReceive.product.id}`}
                active={StockReceive.active}
                handleClose={() => {
                    dispatch({ type: setCheckBin, payload: { ...checkBin, binError: '' } })
                    setStockReceive({ active: false, product: {} })
                }}
                primaryAction={{
                    content: 'Complete Line',
                    disabled: Compeleting ? true : false,
                    loading: Compeleting ? true : false,
                    onAction: () => {
                        if (StockReceive.product.qty < (receivedQty.qtyToShow + receivedQty.received) && checkBin.bin === '') {
                            dispatch({ type: setCheckBin, payload: { ...checkBin, binError: 'Destination Bin is required!' } })
                        } else {
                            updateReceivedQty(StockReceive.product.id, StockReceive.product.qty, receivedQty, StockReceive.product.variantId)
                            dispatch({ type: setCheckBin, payload: { ...checkBin, binError: '' } })
                        }
                    }
                }}
                secondaryActions={{
                    content: 'Cancel',
                    onAction: () => setStockReceive({ active: false, product: {} }),
                    destructive: true
                }}
                component={<ReceiveStock product={StockReceive.product} />}
            />
            <ModalComponent
                large={true}
                modalTitle={`Order Details`}
                active={Compeleted.active}
                handleClose={() => {
                    setCompeleted({ dispatchBay: '', order: {}, item: {}, active: false })
                }}
                component={<OrderDetails order={Compeleted.order} item={Compeleted.item} dispatchBay={Compeleted.dispatchBay} customer={Compeleted.customer} />}
            />
        </Page >
    )
}

export default Summary
