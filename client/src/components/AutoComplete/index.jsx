import React, { useCallback, useState } from 'react'
import { Autocomplete, Icon } from '@shopify/polaris';
import { SearchMinor } from '@shopify/polaris-icons'
import { useDispatch } from 'react-redux';
import actionTypes from "../../store/actionTypes";

const AutoComplete = props => {

    const { searchProduct } = actionTypes

    const dispatch = useDispatch()

    const deselectedOptions = props.options;
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [options, setOptions] = useState(deselectedOptions);

    const updateText = useCallback(
        value => {
            setInputValue(value);
            dispatch({ type: searchProduct, payload: value })

            if (value === '') {
                setOptions(deselectedOptions);
                return;
            }

            const filterRegex = new RegExp(value, 'i');
            const resultOptions = deselectedOptions.filter((option) =>
                option.label.match(filterRegex),
            );
            setOptions(resultOptions);
        },
        [deselectedOptions],
    );

    const updateSelection = useCallback(
        selected => {
            const selectedValue = selected.map(selectedItem => {
                const matchedOption = options.find(option => {
                    return option.value.match(selectedItem);
                });
                return matchedOption && matchedOption.label;
            });
            setSelectedOptions(selected);
            setInputValue(selectedValue[0]);
            dispatch({ type: searchProduct, payload: selectedValue[0] })
        },
        [options],
    );

    const textField = (
        <Autocomplete.TextField
            onChange={updateText}
            value={inputValue}
            prefix={<Icon source={SearchMinor} color="base" />}
            placeholder="Search"
        />
    );

    return (
        <div style={{ width: "90%", float: 'left' }}>
            <Autocomplete
                options={options}
                selected={selectedOptions}
                onSelect={updateSelection}
                textField={textField}
            />
        </div>
    )
}

export default AutoComplete
