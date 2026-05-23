import React, { useState } from "react";
import { Page, Card, Toast } from "@shopify/polaris";
import { useSelector, useDispatch } from "react-redux";
import RenderPurchaseOrderList from "../RenderPurchaseOrderList";
import Loader from "../../Loader";
import axios from "axios";
import "./style.css";
import actionTypes from "../../../store/actionTypes";
import EmptyList from "../../EmptyList";
import { getPurchaseOrderList } from "../../../global-functions";

const PurchaseOrderList = (props) => {
  const { savePurchaseOrders } = actionTypes;

  const { serverLink, shopDomain, shopId } = useSelector(
    (state) => state.ConfigReducer,
  );
  const { purchaseOrders, fetchingPos } = useSelector(
    (state) => state.POReducer,
  );
  const dispatch = useDispatch();

  const [OrderGenerating, setOrderGenerating] = useState(false);
  const [message, setMessage] = useState("");
  const generatePurchaseOrders = () => {
    const ifConnected = window.navigator.onLine;
    if (ifConnected) {
      setOrderGenerating(true);
      const options = {
        method: "GET",
        url: `/order/${shopDomain}`,
      };
      axios(options)
        .then((response) => {
          setOrderGenerating(false);
          if (response.data.createdOrders) {
            setMessage("Purchase Orders generated successfully");
            dispatch({
              type: savePurchaseOrders,
              payload: response.data.createdOrders.concat(purchaseOrders),
            });
          } else if (response.data.noOrder) {
            console.log(response.data.noOrder);
            setMessage("No Purchase Orders generated");
          }
        })
        .catch((error) => {
          setOrderGenerating(false);
          console.log("error", error);
        });
    } else {
      console.log("Please, Check Your Internet Connection!");
    }
  };

  const orderLoadingStyle = {
    width: "100px",
    height: "100px",
    margin: "10px auto",
    borderWidth: "12px",
    borderStyle: "double solid solid",
    borderColor: "#008060",
  };

  // const orderGeneratingStyle = {
  //     width: "20px",
  //     height: "20px",
  //     borderWidth: "2px",
  //     borderStyle: "solid",
  //     borderColor: "#008060 white white",
  // }
  return fetchingPos ? (
    <Loader style={orderLoadingStyle} />
  ) : purchaseOrders.length > 0 ? (
    <Page
      fullWidth
      title="Purchase Orders"
      secondaryActions={[
        {
          content: "Refresh List",
          loading: fetchingPos,
          disabled: fetchingPos,
          onAction: () => getPurchaseOrderList(shopId, dispatch, true),
        },
      ]}
      primaryAction={{
        content: "Generate POs",
        disabled: OrderGenerating ? true : false,
        loading: OrderGenerating ? true : false,
        onAction: () => generatePurchaseOrders(),
      }}
    >
      <Card sectioned subdued>
        <table className="tblOrders">
          <thead className="tblHead">
            <tr>
              <th>PO #</th>
              <th>Supplier</th>
              <th>Time Until Cutoff</th>
              <th>Cost</th>
              <th>Cost + VAT</th>
              <th>Notes</th>
              {/* <th>Status</th> */}
              <th>Submitted At</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            <RenderPurchaseOrderList />
          </tbody>
        </table>
      </Card>
      {message !== "" ? (
        <Toast
          content={message}
          duration={2000}
          onDismiss={() => setMessage("")}
        />
      ) : null}
    </Page>
  ) : (
    <Page>
      <EmptyList
        OrderGenerating={OrderGenerating}
        generatePurchaseOrders={generatePurchaseOrders}
        message={message}
        setMessage={setMessage}
      />
    </Page>
  );
};

export default PurchaseOrderList;
