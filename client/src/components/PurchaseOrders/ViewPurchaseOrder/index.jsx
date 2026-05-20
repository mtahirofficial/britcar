import React, { useState } from "react";
import { CSVLink } from "react-csv";
import {
  Page,
  Card,
  DataTable,
  Heading,
  DisplayText,
  Icon,
  TextField,
  Toast,
  Spinner,
} from "@shopify/polaris";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import actionTypes from "../../../store/actionTypes";
import ReplaceProduct from "../ReplaceProduct";
import ActionsList from "../../ActionsList";
import ModalComponent from "../../ModalComponent";
import axios from "axios";
import { CircleLeftMajor } from "@shopify/polaris-icons";
import CountDownTimerC from "../../CountDownTimer";
import DeleteWarning from "../../DeleteWarning";

const ViewPurchaseOrder = (props) => {
  const { viewOrder, viewProduct, updateOrder, savePurchaseOrders } =
    actionTypes;
  const dispatch = useDispatch();
  const { serverLink, moneyFormat, shopId } = useSelector(
    (state) => state.ConfigReducer,
  );
  const {
    purchaseOrders,
    order,
    product,
    itemStatus,
    replacedProduct,
    poStatus,
  } = useSelector((state) => state.POReducer);

  const [OrderSubmitting, setOrderSubmitting] = useState(false);
  const [DownloadingCSV, setDownloadingCSV] = useState(false);
  const [Replace, setReplace] = useState(false);
  const [Delete, setDelete] = useState({
    deleting: false,
    isConfirmed: false,
    orderId: "",
    productId: "",
    qty: "",
  });
  const [error, setError] = useState("");
  const [EditNotes, setEditNotes] = useState({});
  const [Notes, setNotes] = useState({});
  const [OldNotes, setOldNotes] = useState({});
  const [NotesUpdating, setNotesUpdating] = useState({});
  const [ReplacingProduct, setReplacingProduct] = useState(false);

  const handleChange = (field, value) => {
    setNotes({ ...Notes, [field]: value });
  };
  const handleEdit = (field, value) => {
    setEditNotes({ ...EditNotes, [field]: value });
  };
  const updateProductNotes = (id, requestData, orderId) => {
    const ifConnected = window.navigator.onLine;
    if (ifConnected) {
      requestData.notes =
        requestData.notes.trim() === "" ? "-" : requestData.notes.trim();
      setNotesUpdating({ ...NotesUpdating, [id]: true });
      const options = {
        method: "PUT",
        url: `/order/item/update/${id}/${shopId}`,
        data: requestData,
      };
      axios(options)
        .then(({ data }) => {
          if (data) {
            const orders = purchaseOrders;
            for (const i in orders) {
              if (orders[i].id === orderId) {
                for (const j in orders[i].purchaseorderitems) {
                  if (orders[i].purchaseorderitems[j].id === id) {
                    orders[i].purchaseorderitems[j].notes = requestData.notes;
                    setOldNotes({
                      ...OldNotes,
                      [orders[i].purchaseorderitems[j].id]: requestData.notes,
                    });
                  }
                }
              }
            }
            dispatch({ type: savePurchaseOrders, payload: orders });
            setNotesUpdating({ ...NotesUpdating, [id]: false });
            handleEdit(id, false);
          }
        })
        .catch((error) => {
          handleChange(id, "-");
          handleEdit(id, false);
          setNotesUpdating({ ...NotesUpdating, [id]: false });
          console.log("error", error);
        });
    } else {
      console.log("Please, Check Your Internet Connection!");
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
  const replaceProduct = async (newProduct, oldProduct, order) => {
    const ifConnected = window.navigator.onLine;
    if (ifConnected) {
      setReplacingProduct(true);
      const SameVendor = newProduct.product.vendor === order.vendor.name;

      const prod = {
        barcode: newProduct.barcode,
        costPerUnit: Number(newProduct.price),
        costPlusTax: Number(newProduct.price) * 0.2,
        description: newProduct.product.title,
        id: oldProduct.id,
        image: newProduct.product.featuredImage
          ? newProduct.product.featuredImage.src
          : null,
        internalRef: oldProduct.internalRef,
        notes: oldProduct.notes,
        orderId: oldProduct.orderId,
        orderNumber: oldProduct.orderNumber,
        patNum: oldProduct.patNum,
        partNumber: oldProduct.partNumber,
        qty: oldProduct.qty,
        received: oldProduct.received,
        shopId: shopId,
        status: "stand",
        variantId: newProduct.id,
      };
      const options = {};
      if (SameVendor && order.status === "null") {
        prod.purchaseorderId = order.id;
        options.method = "PUT";
        options.url = `/order/item/update/${oldProduct.id}/${shopId}`;
        options.data = prod;
      } else {
        options.method = "POST";
        options.url = `/order/purchaseOrders/${newProduct.product.vendor}/${shopId}`;
        options.data = { prod, oldVariantId: oldProduct.variantId };
      }
      const response = await sendRequest(options);
      if (response) {
        const prodCost = prod.costPerUnit * prod.qty;
        const prodCostVat = (prod.costPerUnit + prod.costPlusTax) * prod.qty;
        const pos = purchaseOrders;
        if (response.createdOrder) {
          pos.unshift(response.createdOrder);
        }
        for (const i in pos) {
          if (pos[i].id === order.id) {
            for (const j in pos[i].purchaseorderitems) {
              if (pos[i].purchaseorderitems[j].id === oldProduct.id) {
                pos[i].purchaseorderitems[j].status = "re";
              }
            }
          }
          if (response.createdProduct) {
            if (pos[i].id === response.createdProduct.purchaseorderId) {
              pos[i].purchaseorderitems.push(response.createdProduct);
              pos[i].costValue = pos[i].costValue + prodCost;
              pos[i].costValuePlusVat = pos[i].costValuePlusVat + prodCostVat;
            }
          } else if (response.updated) {
            if (pos[i].id === order.id) {
              for (const j in pos[i].purchaseorderitems) {
                if (pos[i].purchaseorderitems[j].id === oldProduct.id) {
                  pos[i].purchaseorderitems.splice(j, 1, prod);
                  pos[i].costValue = pos[i].costValue + prodCost;
                  pos[i].costValuePlusVat =
                    pos[i].costValuePlusVat + prodCostVat;
                }
              }
            }
            for (const i in order.purchaseorderitems) {
              if (order.purchaseorderitems[i].id === oldProduct.id) {
                order.purchaseorderitems.splice(i, 1, prod);
                order.costValue = order.costValue + prodCost;
                order.costValuePlusVat = order.costValuePlusVat + prodCostVat;
              }
            }
          }
        }
        dispatch({ type: savePurchaseOrders, payload: pos });
        dispatch({ type: viewOrder, payload: order });
        dispatch({ type: viewProduct, payload: {} });
        setReplacingProduct(false);
      }
      setReplacingProduct(false);
    } else {
      console.log("Please, Check Your Internet Connection!");
    }
  };
  const submitOrder = (date) => {
    const submittedDate = new Date(date);
    const submittedAt = `${submittedDate.toDateString()} ${submittedDate.getHours()}:${submittedDate.getMinutes()}`;
    dispatch({
      type: updateOrder,
      payload: { key: "submittedAt", value: submittedAt },
    });
    const pos = purchaseOrders;
    for (const po of pos) {
      if (po.id === order.id) {
        po.submittedAt = submittedAt;
        po.status = "sub";
      }
    }
    dispatch({ type: savePurchaseOrders, payload: pos });
  };
  const deleteItem = (orderId, productId, qty) => {
    const ifConnected = window.navigator.onLine;
    if (ifConnected) {
      setDelete({ ...Delete, deleting: true });
      const options = {
        method: "DELETE",
        url: `/product/delete`,
        data: { orderId, productId, shopId, qty },
      };
      axios(options)
        .then(({ data }) => {
          setDelete({
            deleting: false,
            isConfirmed: false,
            orderId: "",
            productId: "",
            qty: "",
          });
          if (data.dbResponse) {
            const orders = purchaseOrders;
            for (const i in orders) {
              if (orders[i].id === orderId) {
                for (const j in orders[i].purchaseorderitems) {
                  if (orders[i].purchaseorderitems[j].id === productId) {
                    orders[i].purchaseorderitems.splice(j, 1);
                  }
                }
              }
            }
            dispatch({ type: savePurchaseOrders, payload: orders });
          }
        })
        .catch((error) => {
          setDelete({
            deleting: false,
            isConfirmed: false,
            orderId: "",
            productId: "",
            qty: "",
          });
          console.log("error", error);
        });
    } else {
      console.log("Please, Check Your Internet Connection!");
    }
  };

  if (Object.keys(order).length > 0) {
    const products = order.purchaseorderitems;
    const cost = moneyFormat.replace(
      "{{amount}}",
      order.costValue.toFixed(2).toString(),
    );

    const orderDataRows = [
      ["Supplier:", <Heading>{order.vendor.name}</Heading>],
      ["Cost of Order:", <Heading>{cost}</Heading>],
      [
        "Cutoff Time:",
        <Heading>
          {order.status === "null" ? (
            <CountDownTimerC
              orderId={order.id}
              cutoff={order.timeUntilCutoff}
            />
          ) : (
            poStatus[order.status]
          )}
        </Heading>,
      ],
      // ['Cutoff Time:', <Heading>{order.timeUntilCutoff}</Heading>],
      ["Submitted At:", <Heading>{order.submittedAt}</Heading>],
      ["Created At:", <Heading>{order.createdAt}</Heading>],
    ];
    const csvList = [];
    const productDataRows = products.map((product, index) => {
      csvList.push({ code: product.barcode, quantity: product.qty });

      const pCost = moneyFormat.replace("{{amount}}", product.costPerUnit);

      const actionsList = [
        {
          content: "View",
          onAction: () => {
            setReplace(false);
            dispatch({ type: viewProduct, payload: product });
          },
        },
        {
          content: "Replace",
          onAction: () => {
            setReplace(true);
            dispatch({ type: viewProduct, payload: product });
          },
        },
        {
          content: "Delete",
          destructive: true,
          onAction: () => {
            setDelete({
              ...Delete,
              isConfirmed: true,
              orderId: order.id,
              productId: product.id,
              qty: product.qty,
            });
          },
        },
      ];
      return [
        product.barcode,
        <span
          style={{
            display: "inline-block",
            maxWidth: "300px",
            whiteSpace: "normal",
          }}
        >
          {product.description}
        </span>,
        product.orderNumber,
        pCost,
        product.qty,
        product.received,
        <span>
          {EditNotes[product.id] ? (
            <TextField
              labelHidden
              focused={true}
              name="notes"
              label="Add Notes"
              placeholder="Add Notes"
              type="text"
              value={Notes[product.id]}
              onFocus={() => {
                if (product.notes === "-" || product.notes === null) {
                  handleChange(product.id, "");
                } else {
                  handleChange(product.id, product.notes);
                  setOldNotes({ ...OldNotes, [product.id]: product.notes });
                }
              }}
              onChange={(value) => handleChange(product.id, value)}
              onBlur={() => {
                if (!Notes[product.id] && !OldNotes[product.id]) {
                  handleChange(product.id, "-");
                  handleEdit(product.id, false);
                } else if (Notes[product.id] === OldNotes[product.id]) {
                  handleChange(product.id, OldNotes[product.id]);
                  handleEdit(product.id, false);
                } else {
                  updateProductNotes(
                    product.id,
                    { notes: Notes[product.id] },
                    order.id,
                  );
                }
              }}
              suffix={
                NotesUpdating[product.id] ? (
                  <Spinner accessibilityLabel="notes spinner" size="small" />
                ) : null
              }
            />
          ) : (
            <span
              style={{
                display: "inline-block",
                maxWidth: "300px",
                whiteSpace: "normal",
              }}
              onClick={() => handleEdit(product.id, true)}
            >
              {product.notes}
            </span>
          )}
        </span>,
        itemStatus[product.status],
        <ActionsList actionsList={actionsList} />,
      ];
    });

    const csvHeaders = [
      { label: "Code", key: "code" },
      { label: "Qty", key: "quantity" },
      // { label: "Name", key: "name" },
      // { label: "For Orders", key: "forOrders" },
      // { label: "Line Cost", key: "lineCost" },
      // { label: "Notes", key: "notes" },
      // { label: "Qty Submitted", key: "quantitySubmitted" },
      // { label: "Amt Recieved", key: "amountRecieved" },
      // { label: "Status", key: "status" },
    ];
    return (
      <Page fullWidth>
        <Card
          title={`Purchase Order #${order.id}`}
          subdued
          actions={[
            {
              content: (
                <Link to="/orders">
                  <Icon source={CircleLeftMajor} color="base" />
                </Link>
              ),
              onAction: () => dispatch({ type: viewOrder, payload: {} }),
            },
            {
              content: "Submit Order",
              disabled: OrderSubmitting ? true : false,
              loading: OrderSubmitting ? true : false,
              onAction: () => {
                setOrderSubmitting(true);
                const options = {
                  url: `/mail/send/${order.id}`,
                  method: "GET",
                };
                axios(options)
                  .then(({ data }) => {
                    setOrderSubmitting(false);
                    if (data.submittedAt) {
                      submitOrder(data.submittedAt);
                      dispatch({
                        type: actionTypes.setToast,
                        payload: {
                          active: true,
                          content: "Order submitted successfully!",
                          error: false,
                        },
                      });
                    }
                  })
                  .catch((error) => {
                    setOrderSubmitting(false);
                    dispatch({
                      type: actionTypes.setToast,
                      payload: {
                        active: true,
                        content: error.response.data,
                        error: true,
                      },
                    });
                    console.log("error", error.response.data);
                  });
              },
            },
            {
              content: (
                <a
                  href={`${serverLink}/files/generatePDF/${order.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download PDF
                </a>
              ),
            },
            {
              content: DownloadingCSV ? null : (
                <CSVLink
                  data={csvList}
                  headers={csvHeaders}
                  filename={`PO-${order.id}.csv`}
                >
                  Submit & Download CSV
                </CSVLink>
              ),
              disabled: DownloadingCSV ? true : false,
              loading: DownloadingCSV ? true : false,
              onAction: () => {
                setDownloadingCSV(true);
                const options = {
                  url: `${serverLink}/order/submit/${order.id}`,
                  method: "PUT",
                };
                axios(options)
                  .then(({ data }) => {
                    setDownloadingCSV(false);
                    if (data.submittedAt) {
                      submitOrder(data.submittedAt);
                    }
                  })
                  .catch((error) => {
                    setDownloadingCSV(false);
                    dispatch({
                      type: actionTypes.setToast,
                      payload: {
                        active: true,
                        content: error.response.data,
                        error: true,
                      },
                    });
                    console.log("error", error.response.data);
                  });
              },
            },
          ]}
        >
          <Card.Section>
            <DataTable
              columnContentTypes={["text", "text"]}
              headings={["", ""]}
              rows={orderDataRows}
            />
          </Card.Section>
          <Card.Section>
            <DataTable
              columnContentTypes={[
                "text",
                "text",
                "text",
                "text",
                "text",
                "text",
                "text",
                "text",
                "text",
              ]}
              headings={[
                <b>Code</b>,
                <b>Name</b>,
                <b>For Orders</b>,
                <b>Line Cost</b>,
                <b>Qty</b>,
                <b>Received</b>,
                <b>Notes</b>,
                <b>Status</b>,
                <b>Actions</b>,
              ]}
              rows={productDataRows}
            />
          </Card.Section>
        </Card>
        <ModalComponent
          large={false}
          modalTitle={`Purchase Order #${order.id} -- Code #${product.barcode}`}
          active={Object.keys(product).length > 0}
          handleClose={() => dispatch({ type: viewProduct, payload: {} })}
          component={<ReplaceProduct replace={Replace} />}
          primaryAction={{
            // content: Replace ? (ReplacingProduct ? <Spinner accessibilityLabel="Replace Product" size="small" /> : 'Replace') : 'Back',
            content: Replace ? "Replace" : "Back",
            disabled: ReplacingProduct ? true : false,
            loading: ReplacingProduct ? true : false,
            onAction: () => {
              if (Replace) {
                replaceProduct(replacedProduct, product, order);
              } else {
                dispatch({ type: viewProduct, payload: {} });
              }
            },
          }}
        />
        <DeleteWarning
          active={Delete.isConfirmed}
          title="Are you sure you want to delete this product?"
          status="warning"
          no={() =>
            setDelete({
              ...Delete,
              isConfirmed: false,
              orderId: "",
              productId: "",
              qty: "",
            })
          }
          yes={() => deleteItem(Delete.orderId, Delete.productId, Delete.qty)}
          yesLoading={Delete.deleting}
        />
        {/* {error !== "" ? (
          <Toast
            content={error}
            duration={2000}
            error={true}
            onDismiss={() => setError("")}
          />
        ) : null} */}
      </Page>
    );
  } else {
    return (
      <DisplayText>
        No Order Selected! Go to <Link to="/orders">Orders</Link>
      </DisplayText>
    );
  }
};

export default ViewPurchaseOrder;
