import React from "react";
import { Switch, Route } from "react-router-dom";
import Navbar from "../components/Navbar";
import PurchaseOrderList from "../components/PurchaseOrders/PurchaseOrderList";
import ViewPurchaseOrder from "../components/PurchaseOrders/ViewPurchaseOrder";
import VendorsList from "../components/Vendors/VendorsList";
import { Toast } from "@shopify/polaris";
import { useDispatch, useSelector } from "react-redux";
import actionTypes from "../store/actionTypes";

const AppRouter = (props) => {
  const { setToast } = useSelector((state) => state.ConfigReducer);
  const dispatch = useDispatch();
  const navOptions = [
    {
      text: "Orders",
      url: "/orders",
    },
    {
      text: "Suppliers",
      url: "/suppliers",
    },
  ];

  return (
    <React.Fragment>
      <Navbar options={navOptions} />
      <Switch>
        {/* <Route exact path="/">
          <PurchaseOrderList />
        </Route> */}
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
      {setToast.active && (
        <Toast
          content={setToast.content}
          duration={setToast.duration}
          error={setToast.error}
          onDismiss={() => dispatch({ type: actionTypes.dismissToast })}
        />
      )}
    </React.Fragment>
  );
};

export default AppRouter;
