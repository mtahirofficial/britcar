import React, { useState } from 'react'
import { Page, Card, Icon, Button } from '@shopify/polaris';
import { useDispatch, useSelector } from 'react-redux';
import { EditMinor, ViewMinor } from '@shopify/polaris-icons';
import ModalComponent from '../../ModalComponent'
import VendorForm from '../VendorForm'
import axios from 'axios';
import actionTypes from '../../../store/actionTypes';
import Loader from '../../Loader';
import Summary from '../../PurchaseOrders/Summary';
import './style.css'

function VendorsList() {

    const { saveSuppliers, saveSummaryOrders, savePurchaseOrders } = actionTypes
    const { ConfigReducer, SupplierReducer, POReducer } = useSelector(state => state)
    const { serverLink, shopId } = ConfigReducer
    const { suppliers, supplier } = SupplierReducer
    const { summaryOrders, purchaseOrders } = POReducer
    const dispatch = useDispatch()

    const emptySupplier = {
        id: '',
        shopId: shopId,
        name: '',
        website: '',
        phone: '',
        stockMessage: '',
        sendEmail: '',
        email: '',
        accountNumber: '',
        enabled: '',
        autoSubmit: '',
        address: '',
        replyEmail: '',
    }

    const [Saving, setSaving] = useState(false)
    const [FetchingProducts, setFetchingProducts] = useState(false)
    const [RefreshingVendors, setRefreshingVendors] = useState(false)
    const [SupplierEdit, setSupplierEdit] = useState({ active: false, data: emptySupplier })
    const [Error, setError] = useState({ name: '', phone: '', email: '', replyEmail: '', address: '' })

    const fetchingStyle = {
        width: "20px",
        height: "20px",
        borderWidth: "4px",
        borderStyle: "solid",
        borderColor: "#008060 #008060 #F6F6F7 #F6F6F7",
    }

    const rows = suppliers.map((supplier, i) => {
        return <tr key={i} className="tr">
            <td className="td">{i + 1}</td>
            <td className="td">{supplier.accountNumber !== null ? supplier.accountNumber : "-"}</td>
            <td className="td">{supplier.name}</td>
            <td className="td">{supplier.phone !== null ? supplier.phone : "-"}</td>
            <td className="td">{supplier.email !== null ? supplier.email : "-"}</td>
            <td className="td">{supplier.enabled !== null ? (supplier.enabled ? 'Active' : "Non-Active") : "-"}</td>
            <td className="td">{supplier.autoSubmit !== null ? (supplier.autoSubmit ? 'Active' : "Non-Active") : "-"}</td>
            <td className="td" style={{ textAlign: 'center' }}>
                <Button outline onClick={() => handleOpen(supplier)}><Icon source={EditMinor} color="base" /></Button>
                <Button outline onClick={() => fetchSupplierBaseProducts(supplier.id)}>{FetchingProducts[supplier.id] ? <Loader style={fetchingStyle} /> : <Icon source={ViewMinor} color="base" />}</Button>
            </td>
        </tr >
    })

    const handleOpen = data => setSupplierEdit({ active: true, data })
    const handleClose = () => {
        setSupplierEdit({ active: false, data: emptySupplier })
        setError({ name: '', phone: '', email: '', replyEmail: '', address: '' })
    }
    const refreshVendors = () => {
        const ifConnected = window.navigator.onLine;
        if (ifConnected) {
            setRefreshingVendors(true)
            const options = {
                method: 'GET',
                url: `/suppliers/${shopId}`,
            }
            axios(options)
                .then(({ data }) => {
                    setRefreshingVendors(false)
                    dispatch({ type: saveSuppliers, payload: data })
                })
                .catch(error => {
                    setRefreshingVendors(false)
                    console.log(error)
                })
        } else {
            console.log('Data can not be retrieved, Check Your Internet Connection!');
        }
    }
    const handleSave = vendorData => {
        const ifConnected = window.navigator.onLine;
        if (ifConnected) {
            setSaving(true)
            const options = {
                method: vendorData.id === '' ? 'POST' : 'PUT',
                url: `/suppliers`,
                data: vendorData
            }
            axios(options)
                .then(({ data }) => {
                    setSaving(false)
                    if (data.status === 'saved') {
                        dispatch({ type: saveSuppliers, payload: [...suppliers, data.res] })
                    } else if (data.status === 'updated') {
                        // update suppliers in redux
                        const sups = suppliers
                        let index;
                        for (const i in sups) {
                            if (sups[i].id === data.res.id) {
                                index = i
                            }
                        }
                        sups.splice(index, 1, data.res);
                        dispatch({ type: saveSuppliers, payload: sups })

                        // update vendordata in orders in redux
                        const pos = purchaseOrders
                        for (const i in pos) {
                            if (pos[i].vendor.id === data.res.id) {
                                pos[i].vendor = data.res
                            }
                        }
                        dispatch({ type: savePurchaseOrders, payload: pos })
                    }
                    handleClose()
                })
                .catch(error => {
                    setSaving(false)
                    console.log(error)
                })
        } else {
            console.log('Data can not be saved, Check Your Internet Connection!');
        }
    }
    const fetchSupplierBaseProducts = supplierId => {
        const ifConnected = window.navigator.onLine;
        if (ifConnected) {
            setFetchingProducts({ [supplierId]: true })
            const options = {
                method: 'GET',
                url: `/order/poItems/${supplierId}/${shopId}`,
            }
            axios(options).then(({ data }) => {
                setFetchingProducts({ [supplierId]: false })
                if (data.length > 0) {
                    dispatch({ type: saveSummaryOrders, payload: data })
                } else {
                    console.log('No record found!')
                }
            }).catch(error => {
                setFetchingProducts({ [supplierId]: false })
                console.log("error", error)
            })
        } else {
            console.log('Data can not be saved, Check Your Internet Connection!');
        }
    }

    // const loaderStyle = {
    //     width: "20px",
    //     height: "20px",
    //     borderWidth: "4px",
    //     borderStyle: "double solid solid",
    //     borderColor: "white",
    // }

    return summaryOrders.length > 0 ? <Summary
        summaryOrders={summaryOrders}
    /> : <Page
        fullWidth
        title="Suppliers List"
        primaryAction={{
            content: 'Refresh Suppliers',
            disabled: RefreshingVendors ? true : false,
            loading: RefreshingVendors ? true : false,
            onAction: () => refreshVendors(),
        }}
        secondaryActions={[{
            content: 'Add Supplier',
            onAction: () => handleOpen(emptySupplier),
        }]}
    >
        <Card subdued>
            <Card.Section>
                <div className='tableParent'>
                    <table className="vendorTable" style={{ overflowX: 'auto' }}>
                        <thead className="vendorTableHead">
                            <tr>
                                <th className="th">#</th>
                                <th className="th">A/C</th>
                                <th className="th">Name</th>
                                <th className="th">Phone</th>
                                <th className="th">Email</th>
                                <th className="th">Status</th>
                                <th className="th">Auto Submit</th>
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
            modalTitle={SupplierEdit.data.id === '' ? 'New Supplier' : 'Edit Supplier'}
            active={SupplierEdit.active}
            handleClose={handleClose}
            primaryAction={{
                content: SupplierEdit.data.id === '' ? 'Save Supplier' : 'Update Supplier',
                disabled: Saving ? true : false,
                loading: Saving ? true : false,
                onAction: () => {

                    const name = supplier.name !== '' && supplier.name !== null
                    const phone = supplier.phone !== '' && supplier.phone !== null
                    const email = supplier.email !== '' && supplier.email !== null
                    const replyEmail = supplier.replyEmail !== '' && supplier.replyEmail !== null
                    const address = supplier.address !== '' && supplier.address !== null


                    if (name && phone && email && replyEmail && address) {
                        handleSave(supplier)
                    } else {
                        setError({
                            ...Error,
                            name: !name ? 'Name is required!' : '',
                            phone: !phone ? 'Phone is required!' : '',
                            email: !email ? 'Email is required!' : '',
                            replyEmail: !replyEmail ? 'Reply-to email is required!' : '',
                            address: !address ? 'Address is required!' : ''
                        })
                    }
                }
            }}
            secondaryActions={{
                content: 'Cancel',
                onAction: handleClose,
                destructive: true
            }}
            component={<VendorForm supplier={SupplierEdit.data} error={Error} />}
        />
    </Page >
}

export default VendorsList