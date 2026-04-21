import React from 'react'
import { Switch, Route } from "react-router-dom";
import Navbar from '../components/Navbar';
import PurchaseOrderList from '../components/PurchaseOrders/PurchaseOrderList';
import ViewPurchaseOrder from '../components/PurchaseOrders/ViewPurchaseOrder';
import VendorsList from '../components/Vendors/VendorsList';

const AppRouter = props => {
    const navOptions = [
        {
            text: "Orders",
            url: "/orders",
        },
        {
            text: "Suppliers",
            url: "/suppliers",
        },
    ]

    return (
        <React.Fragment>
            <Navbar options={navOptions} />
            <Switch>
                <Route exact path="/orders">
                    <PurchaseOrderList />
                </Route>
                <Route exact path="/suppliers">
                    <VendorsList />
                </Route>
                <Route exact path="/orders/:orderNumber">
                    <ViewPurchaseOrder />
                </Route>
            </Switch>
        </React.Fragment>
    )
}

export default AppRouter;
