import React from 'react'
import { Banner } from '@shopify/polaris';
import ModelComponent from "../ModalComponent";

const DeleteWarning = props => {
    return (
        <ModelComponent
            active={props.active}
            modalTitle={props.modalTitle ? props.modalTitle : `Warning`}
            primaryAction={{
                content: 'No',
                onAction: () => props.no(),
            }}
            secondaryActions={[
                {
                    content: 'Yes',
                    destructive: true,
                    onAction: () => props.yes(),
                    disable: props.yesLoading,
                    loading: props.yesLoading
                }
            ]}
            handleClose={() => props.no()}
            component={
                <Banner
                    title={props.title}
                    status={props.status}
                >
                    <div>{props.message}</div>
                </Banner>
            }
        />
    )
}
export default DeleteWarning