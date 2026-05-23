import actionTypes from "./store/actionTypes";
import axios from "axios";
const { changeFetchingPos, savePurchaseOrders, setToast } = actionTypes;

export const getPurchaseOrderList = (shopId, dispatch, showToast = false) => {
  const ifConnected = window.navigator.onLine;
  let message = "";
  let error = false;
  if (ifConnected) {
    dispatch({ type: changeFetchingPos, payload: true });
    const options = {
      method: "GET",
      url: `/order/purchaseOrders/${shopId}`,
    };
    axios(options)
      .then(async ({ data }) => {
        dispatch({ type: savePurchaseOrders, payload: data });
        dispatch({ type: changeFetchingPos, payload: false });
        message = "Purchase Orders Synced Successfully";
        error = false;
      })
      .catch((error) => {
        message =
          error.response?.data?.message ||
          error.message ||
          "Error Syncing Purchase Orders";
        error = true;
        dispatch({ type: changeFetchingPos, payload: false });
      });
    if (showToast) {
      dispatch({
        type: setToast,
        payload: {
          message: message,
          isError: error,
        },
      });
    }
  } else {
    dispatch({
      type: setToast,
      payload: {
        message: "Please, Check Your Internet Connection.",
        isError: true,
      },
    });
  }
};
