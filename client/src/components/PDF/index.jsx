import React from 'react'
import { CSVLink } from "react-csv";

function PDF() {
    const headers = [
        { label: "First Name", key: "firstname" },
        { label: "Last Name", key: "lastname" },
        { label: "Email", key: "email" }
    ];

    const data = [
        { firstname: "Ahmed", lastname: "Tomi", email: "ah@smthing.co.com" },
        { firstname: "Raed", lastname: "Labes", email: "rl@smthing.co.com" },
        { firstname: "Yezzi", lastname: "Min l3b", email: "ymin@cocococo.com" }
    ];
    return <CSVLink data={data} headers={headers} filename={"my-file.csv"}>
        Download me
    </CSVLink>;
}

export default PDF
