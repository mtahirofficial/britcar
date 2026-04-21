import React from 'react'
import { Card, EmptyState } from '@shopify/polaris';

const EmptyList = props => {
    // const orderGeneratingStyle = {
    //     width: "20px",
    //     height: "20px",
    //     borderWidth: "2px",
    //     borderStyle: "solid",
    //     borderColor: "#008060 white white",
    // }
    return (
        <Card sectioned>
            <EmptyState
                heading={`There are no Purchase Orders generated yet.`}
                action={{
                    content: 'Generate POs',
                    disabled: props.OrderGenerating ? true : false,
                    loading: props.OrderGenerating ? true : false,
                    onAction: () => {
                        props.generatePurchaseOrders()
                    }
                }}
            >
            </EmptyState>
        </Card>
    )
}

export default EmptyList
