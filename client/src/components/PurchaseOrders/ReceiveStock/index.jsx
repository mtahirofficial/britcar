import React, { useState, useEffect } from "react";
import { TextField, Spinner } from "@shopify/polaris";
import "./style.css";
import actionTypes from "../../../store/actionTypes";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";

const ReceiveStock = (props) => {
  const { receiveQty, setCheckBin, saveSummaryOrders } = actionTypes;
  const { serverLink, shopId } = useSelector((state) => state.ConfigReducer);
  const { checkBin, summaryOrders } = useSelector((state) => state.POReducer);

  const dispatch = useDispatch();

  const [Values, setValues] = useState({
    qtyToShow: 0,
    bin: props.product.sku,
    weight:
      props.product.grams !== null &&
      props.product.grams !== undefined &&
      props.product.grams !== ""
        ? (props.product.grams / 1000).toString()
        : "",
    dimensions: props.product.dimensions,
    part_number: props.product.part_number,
  });
  const [OldValues, setOldValues] = useState({
    bin: "",
    weight: "",
    dimensions: "",
  });
  const [Error, setError] = useState({
    bin: checkBin.binError,
    weight: "",
    dimensions: "",
  });
  const [ValuesUpdating, setValuesUpdating] = useState({
    bin: "",
    weight: false,
    dimensions: false,
  });

  useEffect(() => {
    dispatch({
      type: setCheckBin,
      payload: { bin: props.product.sku, binError: "" },
    });
    dispatch({
      type: receiveQty,
      payload: {
        qtyToShow: Values.qtyToShow,
        received: props.product.received,
      },
    });
  }, [Values.qtyToShow]);

  const handleChange = (key, value) => {
    if (key === "bin" || key === "qtyToShow") {
      let bin = key === "bin" ? value : "";
      let binError = "";
      if (key === "qtyToShow") {
        if (
          value + props.product.received > props.product.qty &&
          (Values.bin === "" || Values.bin === null)
        ) {
          binError = "Destination Bin is required!";
        } else {
          binError = "";
        }
      }
      dispatch({ type: setCheckBin, payload: { bin, binError } });
    }
    setValues({ ...Values, [key]: value });
  };
  let checker = (data) => {
    if (data.length === 3) {
      let check = data.every(
        (item) =>
          item.trim() !== "" &&
          item.trim() !== "undefined" &&
          item.trim() !== undefined &&
          !isNaN(item.trim()),
      );
      return check;
    } else {
      return false;
    }
  };

  const sendRequest = async (options) => {
    return await axios(options)
      .then(({ data }) => {
        if (data) {
          return data;
        }
      })
      .catch((error) => {
        console.log("error", error);
        return false;
      });
  };

  const addMetafields = async (variantId, itemId, requestData, key) => {
    const ifConnected = window.navigator.onLine;
    if (ifConnected) {
      setValuesUpdating({ ...ValuesUpdating, [key]: true });
      if (Values[key] !== "" && Values[key] !== null) {
        const response = await sendRequest({
          method: "POST",
          url: `/product/metafileds/${key}/${variantId}/${shopId}`,
          data: { ...requestData, itemId },
        });

        const updateField = () => {
          const orders = summaryOrders;
          for (const i in orders) {
            for (const j in orders[i].purchaseorderitems) {
              if (orders[i].purchaseorderitems[j].id === itemId) {
                orders[i].purchaseorderitems[j][key] = response.dataForDb[key];
              }
            }
          }
          dispatch({ type: saveSummaryOrders, payload: orders });
        };
        props.product[key] = response.dataForDb[key];
        if (response.isTrue) {
          updateField();

          setOldValues({ ...OldValues, dimensions: response.dataForDb[key] });
        } else {
          if (key === "dimensions") {
            updateField();
          }
          console.log(response.response);
        }
      }
      setValuesUpdating({ ...ValuesUpdating, [key]: false });
    } else {
      console.log("Please, Check Your Internet Connection!");
    }
  };

  const updateSku = async (variantId, requestData, key) => {
    const ifConnected = window.navigator.onLine;
    if (ifConnected) {
      setValuesUpdating({ ...ValuesUpdating, [key]: true });
      const options = {
        method: "PUT",
        url: `/product/sku/${variantId}/${shopId}`,
        data: requestData,
      };
      const response = await sendRequest(options);

      const updateList = (sku) => {
        props.product.sku = sku;
        const orders = summaryOrders;
        for (const odr of orders) {
          for (const item of odr.purchaseorderitems) {
            if (item.id === requestData.poItemId) {
              item.sku = sku;
            }
          }
        }
        dispatch({ type: saveSummaryOrders, payload: orders });
      };

      if (response.isTrue && !response.saved) {
        updateList(response.variant.sku);
        setValues({ ...Values, bin: response.variant.sku });
      } else if (response.isTrue && response.saved) {
        console.log(response.msg);
      } else {
        updateList(response.bin);
        console.log(response.msg);
      }
      setValuesUpdating({ ...ValuesUpdating, [key]: false });
    } else {
      console.log("Please, Check Your Internet Connection!");
    }
  };
  return (
    <table className="receiveTable">
      <tbody className="receiveTBody">
        <tr>
          <td className="receiveTd">Supplier</td>
          <th className="receiveTh">{props.product.vendor.name}</th>
        </tr>
        <tr>
          <td className="receiveTd">Product ID</td>
          <th className="receiveTh">{props.product.part_number}</th>
        </tr>
        <tr>
          <td className="receiveTd">Name</td>
          <th className="receiveTh">
            <span
              style={{
                display: "inline-block",
                maxWidth: "300px",
                whiteSpace: "normal",
              }}
            >
              {props.product.description}
            </span>
          </th>
        </tr>
        <tr>
          <td className="receiveTd">Stock Ordered</td>
          <th className="receiveTh">{props.product.qty}</th>
        </tr>
        <tr>
          <td className="receiveTd">Stock Received</td>
          <th className="receiveTh">{props.product.received}</th>
        </tr>
        <tr>
          <td className="receiveTd">Qty. to show in</td>
          <th className="receiveTh">
            <TextField
              type="number"
              value={Values.qtyToShow.toString()}
              onChange={(value) => handleChange("qtyToShow", Number(value))}
              min={0}
            />
          </th>
        </tr>
        <tr>
          <td className="receiveTd">Notes</td>
          <th className="receiveTh">
            {props.product.notes ? props.product.notes : "-"}
          </th>
        </tr>
        <tr>
          <td className="receiveTd">Part Number</td>
          {/* <th className="receiveTh">{props.product.part_number}</th> */}
          <th className="receiveTh">
            <TextField
              labelHidden
              focused={false}
              name="part_number"
              label="Add part number"
              placeholder="Add part number"
              type="text"
              value={Values.part_number}
              onFocus={() => {
                setOldValues({ ...OldValues, part_number: Values.part_number });
              }}
              onChange={(value) => handleChange("part_number", value)}
              onBlur={({ target }) => {
                if (Values.part_number !== "" && Values.part_number !== null) {
                  if (Values.part_number === OldValues.part_number) {
                    handleChange("part_number", OldValues.part_number);
                  } else {
                    setError({ ...Error, [target.name]: "" });
                    addMetafields(
                      props.product.variantId,
                      props.product.id,
                      { part_number: Values.part_number },
                      "part_number",
                    );
                  }
                }
              }}
              suffix={
                ValuesUpdating.part_number ? (
                  <Spinner
                    accessibilityLabel="part_number spinner"
                    size="small"
                  />
                ) : null
              }
              error={Error.part_number}
            />
          </th>
        </tr>
        <tr>
          <td className="receiveTd">Destination Bin</td>
          <th className="receiveTh">
            <TextField
              labelHidden
              focused={false}
              name="bin"
              label="Add destination bin"
              placeholder="Add destination bin"
              type="text"
              value={Values.bin}
              onFocus={() => {
                setOldValues({ ...OldValues, bin: props.product.sku });
              }}
              onChange={(value) => {
                handleChange("bin", value);
              }}
              onBlur={({ target }) => {
                if (Values.bin !== "") {
                  if (Values.bin === OldValues.bin) {
                    handleChange(target.name, OldValues.bin);
                  } else {
                    updateSku(
                      props.product.variantId,
                      { bin: Values.bin, poItemId: props.product.id },
                      target.name,
                    );
                  }
                }
              }}
              suffix={
                ValuesUpdating.bin ? (
                  <Spinner accessibilityLabel="bin spinner" size="small" />
                ) : null
              }
              error={checkBin.binError}
            />
          </th>
        </tr>
        <tr>
          <td className="receiveTd">Weight</td>
          <th className="receiveTh">
            <TextField
              labelHidden
              focused={false}
              name="weight"
              label="Add Weight"
              placeholder="Add Weight"
              type="text"
              value={Values.weight}
              onFocus={() => {
                setOldValues({ ...OldValues, weight: Values.weight });
              }}
              onChange={(value) => {
                handleChange("weight", value);
                if (!isNaN(value)) {
                  setError({ ...Error, weight: "" });
                } else {
                  setError({ ...Error, weight: "Only Numbers are allowed." });
                }
              }}
              onBlur={({ target }) => {
                if (Values.weight !== "" && Values.weight !== null) {
                  if (Values.weight === OldValues.weight) {
                    handleChange(target.name, OldValues.weight);
                  } else {
                    if (!isNaN(Values.weight)) {
                      setError({ ...Error, [target.name]: "" });
                      addMetafields(
                        props.product.variantId,
                        props.product.id,
                        { weight: Values.weight },
                        target.name,
                      );
                    } else {
                      setError({
                        ...Error,
                        [target.name]: "Only Numbers are allowed.",
                      });
                    }
                  }
                }
              }}
              suffix={
                ValuesUpdating.weight ? (
                  <Spinner accessibilityLabel="weight spinner" size="small" />
                ) : (
                  "kgs"
                )
              }
              // helpText="In kgs."
              error={Error.weight}
            />
          </th>
        </tr>
        <tr>
          <td className="receiveTd">Dimensions</td>
          <th className="receiveTh">
            <TextField
              labelHidden
              focused={false}
              name="dimensions"
              label="Add Dimensions"
              placeholder="Add Dimensions"
              type="text"
              value={Values.dimensions}
              onFocus={() => {
                setOldValues({ ...OldValues, dimensions: Values.dimensions });
              }}
              onChange={(value) => handleChange("dimensions", value)}
              onBlur={({ target }) => {
                if (Values.dimensions !== "" && Values.dimensions !== null) {
                  console.log("Values.dimensions", Values.dimensions);

                  const dimensions = Values.dimensions.split("x");
                  if (Values.dimensions === OldValues.dimensions) {
                    handleChange("dimensions", OldValues.dimensions);
                  } else if (!checker(dimensions)) {
                    setError({
                      ...Error,
                      [target.name]: (
                        <span>
                          Dimensions must be added like <i>5</i>x<i>5</i>x
                          <i>5</i>
                        </span>
                      ),
                    });
                  } else {
                    setError({ ...Error, [target.name]: "" });
                    addMetafields(
                      props.product.variantId,
                      props.product.id,
                      { dimensions_cm: Values.dimensions },
                      // {
                      //   dimensions: {
                      //     width: Number(dimensions[0].trim()),
                      //     height: Number(dimensions[1].trim()),
                      //     length: Number(dimensions[2].trim()),
                      //   },
                      // },
                      "dimensions_cm",
                    );
                  }
                }
              }}
              suffix={
                ValuesUpdating.dimensions_cm ? (
                  <Spinner
                    accessibilityLabel="dimensions spinner"
                    size="small"
                  />
                ) : null
              }
              helpText={
                <span>
                  <i>width</i> x <i>height</i> x <i>length</i> | e.g. <i>5</i> x{" "}
                  <i>5</i> x <i>5</i>
                </span>
              }
              error={Error.dimensions}
            />
          </th>
        </tr>
        <tr>
          <td className="receiveTd" style={{ border: "none" }}>
            Image
          </td>
          <th
            className="receiveTh"
            style={{ border: "none", textAlign: "center" }}
          >
            {props.product.image ? (
              <img src={props.product.image} alt="alt text" />
            ) : (
              "Please take a picture of product"
            )}
          </th>
        </tr>
      </tbody>
    </table>
  );
};

export default ReceiveStock;
