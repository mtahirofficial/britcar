import React from "react";
import { useSelector } from "react-redux";
import "./style.css";

const OrderDetails = (props) => {
  const { moneyFormat } = useSelector((state) => state.ConfigReducer);
  const orderTotal = moneyFormat.replace(
    "{{amount}}",
    (props.item.qty * props.item.costPerUnit).toFixed(2),
  );

  return (
    <div>
      <table className="top" style={{ marginBottom: "5%" }}>
        <tbody className="topTBody">
          <tr>
            <td className="topTd">Supplier</td>
            <th className="topTh">{props.order.vendor.name}</th>
          </tr>
          <tr>
            <td className="topTd">Bin Location</td>
            <th className="topTh">{props.item.sku}</th>
          </tr>
          <tr>
            <td className="topTd">Excess Qty.</td>
            <th className="topTh">
              {props.item.received >= props.item.qty
                ? props.item.received - props.item.qty
                : 0}
            </th>
          </tr>
          <tr>
            <td className="topTd">Code</td>
            <th className="topTh">{props.item.part_number}</th>
          </tr>
          <tr>
            <td className="topTd">Name</td>
            <th className="topTh">{props.item.description}</th>
          </tr>
        </tbody>
      </table>
      <table className="bottom">
        <thead>
          <tr>
            <th className="bottomTh">Order ID</th>
            <th className="bottomTh">Name / Reference</th>
            <th className="bottomTh">Qty. Allocated</th>
            <th className="bottomTh">Received So Far</th>
            <th className="bottomTh">Order Total</th>
            <th className="bottomTh">Dispatch Bay</th>
          </tr>
        </thead>
        <tbody className="bottomTBody">
          <tr>
            <td className="bottomTd">{props.item.orderNumber}</td>
            <td className="bottomTd">
              {props.customer.hasOwnProperty("firstName")
                ? props.customer.firstName + " " + props.customer.lastName
                : ""}
            </td>
            <td className="bottomTd">{props.item.qty}</td>
            <td className="bottomTd">{props.item.received}</td>
            <td className="bottomTd">{orderTotal}</td>
            <td className="bottomTd">{props.dispatchBay}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default OrderDetails;
