import React from 'react'
import { Modal, TextContainer } from '@shopify/polaris';

const ModalComponent = props => {

    return (
        <Modal
            large={props.large}
            title={props.modalTitle}
            open={props.active}
            onClose={props.handleClose}
            primaryAction={props.primaryAction !== null && props.primaryAction}
            secondaryActions={props.secondaryActions !== null && props.secondaryActions}
        >
            <Modal.Section>
                <TextContainer>
                    {props.component}
                </TextContainer>
            </Modal.Section>
        </Modal >

    );
}
export default ModalComponent;