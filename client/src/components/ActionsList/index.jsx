import React, { useCallback, useState } from 'react'
import { Button, Popover, ActionList } from '@shopify/polaris';

const ActionsList = props => {
    const [active, setActive] = useState(false);

    const toggleActive = useCallback(() => setActive((active) => !active), []);
    const activator = (
        <Button onClick={toggleActive} disclosure>
            Actions
        </Button>
    );
    return (
        <Popover active={active} activator={activator} onClose={toggleActive}>
            <ActionList
                items={props.actionsList}
            />
        </Popover>
    )
}

export default ActionsList
