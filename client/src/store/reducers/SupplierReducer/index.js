import actionTypes from '../../actionTypes'

const states = {
    suppliers: [],
    supplier: {},
}

const SupplierReducer = (state = states, action) => {
    const { type, payload } = action
    switch (type) {
        case actionTypes.saveSupplier: return { ...state, supplier: payload }
        case actionTypes.saveSuppliers: return { ...state, suppliers: payload }
        default: return state
    }
}

export default SupplierReducer