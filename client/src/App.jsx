import React, { useEffect } from "react";
import axios from "axios";
import actionTypes from "./store/actionTypes";
import AppRouter from "./router";
import { useDispatch, useSelector } from "react-redux";
import { Frame } from "@shopify/polaris";
import { getPurchaseOrderList } from "./global-functions";

const App = (props) => {
  const {
    setShopDomain,
    setShopId,
    setFetchingData,
    saveSuppliers,
    savePurchaseOrders,
    saveCurrency,
    changeFetchingPos,
  } = actionTypes;

  const { serverLink } = useSelector((state) => state.ConfigReducer);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch({ type: setShopDomain, payload: getShopDomain() });
  }, []);

  const getShopDomain = () => {
    let shopDomain;

    const params = new URLSearchParams(window.location.search);

    if (params && params.get("shop") !== undefined) {
      shopDomain = params.get("shop");
    } else if (params.href && params.href.get("shop") !== undefined) {
      shopDomain = params.href.get("shop");
    } else if (window.location.ancestorOrigins !== undefined) {
      shopDomain = window.location.ancestorOrigins["0"].replace("https://", "");
    }
    if (shopDomain) {
      extractVendors(shopDomain);
    }

    return shopDomain;
  };
  const extractVendors = (shopDomain) => {
    const ifConnected = window.navigator.onLine;
    if (ifConnected) {
      dispatch({ type: setFetchingData, payload: true });
      dispatch({ type: changeFetchingPos, payload: true });
      const options = {
        method: "GET",
        url: `/suppliers/extract/${shopDomain}`,
      };
      axios(options)
        .then(({ status, data }) => {
          dispatch({ type: setFetchingData, payload: false });
          if (status >= 500) {
            console.log("Something went wrong! Please try later.");
          } else {
            if (data.length > 0 && typeof data !== "string") {
              dispatch({ type: saveSuppliers, payload: data });
              if (data.length > 0) {
                dispatch({ type: setShopId, payload: data[0].shopId });
                getCurrency(data[0].shopId);
                getPurchaseOrderList(data[0].shopId, dispatch);
              } else {
                dispatch({ type: setFetchingData, payload: false });
              }
            }
          }
        })
        .catch((error) => {
          dispatch({ type: setFetchingData, payload: false });
          console.log("error", error);
        });
    } else {
      console.log("Please, Check Your Internet Connection!");
    }
  };
  const getCurrency = (shopId) => {
    const ifConnected = window.navigator.onLine;
    if (ifConnected) {
      const options = {
        method: "GET",
        url: `/shop/currency/${shopId}`,
      };
      axios(options)
        .then(({ data }) => {
          dispatch({ type: saveCurrency, payload: data });
        })
        .catch((error) => {
          console.log("error", error);
          console.log(error);
        });
    } else {
      console.log("Please, Check Your Internet Connection!");
    }
  };

  // const getPurchaseOrderList = (shopId) => {
  //   const ifConnected = window.navigator.onLine;
  //   if (ifConnected) {
  //     dispatch({ type: changeFetchingPos, payload: true });
  //     const options = {
  //       method: "GET",
  //       url: `/order/purchaseOrders/${shopId}`,
  //     };
  //     axios(options)
  //       .then(async ({ data }) => {
  //         dispatch({ type: savePurchaseOrders, payload: data });
  //         dispatch({ type: changeFetchingPos, payload: false });
  //       })
  //       .catch((error) => {
  //         dispatch({ type: changeFetchingPos, payload: false });
  //         console.log("error", error);
  //         console.log(error);
  //       });
  //   } else {
  //     console.log("Please, Check Your Internet Connection!");
  //   }
  // };

  return (
    <Frame>
      <AppRouter />
    </Frame>
  );
};

export default App;
