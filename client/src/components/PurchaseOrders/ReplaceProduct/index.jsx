import React, { useState } from 'react'
import { Button, Card, OptionList, Spinner, TextField } from '@shopify/polaris';
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios';
import './style.css'
import actionTypes from '../../../store/actionTypes';

const ReplaceProduct = props => {

    const { setReplacedProduct } = actionTypes

    const dispatch = useDispatch()
    const { serverLink, shopDomain, moneyFormat } = useSelector(state => state.ConfigReducer)
    const { order, product } = useSelector(state => state.POReducer)

    const [Searching, setSearching] = useState(false);
    const [selected, setSelected] = useState([]);
    const [InputValue, setInputValue] = useState(product.barcode);
    const [Options, setOptions] = useState({ received: false, products: [] });

    const getAlternateProducts = (searchProductQuery, variantId) => {
        const options = {
            method: 'GET',
            url: `/order/replaceProduct/${shopDomain}/${searchProductQuery}/${variantId}`,
        }
        setSearching(true)
        axios(options)
            .then(({ data }) => {
                setSearching(false)
                if (typeof data !== 'string') {
                    setOptions({ received: true, products: data })
                }
            })
            .catch(error => {
                setSearching(false)
                console.log('error', error)
            })
    }

    const pCost = moneyFormat.replace("{{amount}}", product.costPerUnit)

    return <>
        <table className="replaceTable">
            <tbody className="replaceTBody">
                <tr>
                    <td className="replaceTd">Supplier:</td>
                    <th className="replaceTh">{order.vendor.name}</th>
                </tr>
                <tr>
                    <td className="replaceTd">Original Part:</td>
                    <th className="replaceTh">{product.barcode} {product.description}</th>
                </tr>
                <tr>
                    <td className="replaceTd">Quantity:</td>
                    <th className="replaceTh">{product.qty}</th>
                </tr>
                <tr>
                    <td style={{ border: 'none' }} className="replaceTd">Price:</td>
                    <th style={{ border: 'none' }} className="replaceTh">{pCost}</th>
                </tr>
            </tbody>
        </table>
        {
            props.replace ? <div style={{ marginTop: 'none' }}>
                <div style={{ width: "85%", float: 'left' }}>
                    <TextField placeholder="Search product with barcode" value={InputValue} onChange={value => setInputValue(value)} />
                </div>
                <div style={{ display: "inline-block", width: "15%", textAlign: 'right' }}>
                    <Button onClick={() => getAlternateProducts(InputValue, product.variantId)}>
                        {Searching ? <Spinner accessibilityLabel="Search product" size="small" /> : 'Search'}
                    </Button>
                </div>
                <div style={{ width: "85%", }}>
                    <Card>
                        {
                            Options.received ? <OptionList
                                title={`${Options.products.length} Results`}
                                options={Options.products}
                                selected={selected}
                                onChange={value => {
                                    setSelected(value)
                                    dispatch({ type: setReplacedProduct, payload: value[0] })
                                }}
                            /> : null
                        }
                    </Card>
                </div>
            </div> : null
        }
    </>
}

export default ReplaceProduct