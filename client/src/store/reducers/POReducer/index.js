import actionTypes from '../../actionTypes'

const states = {
    itemStatus: {
        full: 'Received',
        part: 'Partially Received',
        sub: 'Submitted',
        stand: 'Outstanding',
        re: 'Re-ordered',
    },
    poStatus: {
        comp: 'Completed',
        sub: 'Submitted',
        null: '',
    },
    purchaseOrders: [],
    summaryOrders: [],
    order: {},
    product: {},
    searchProductQuery: '',
    receivedQty: 0,
    fetchingPos: true,
    replacedProduct: {},
    checkBin: { bin: '', binError: '' }
}

const POReducer = (state = states, action) => {
    const { type, payload } = action
    switch (type) {
        case actionTypes.savePurchaseOrders: return { ...state, purchaseOrders: payload }
        case actionTypes.saveSummaryOrders: return { ...state, summaryOrders: payload }
        case actionTypes.viewOrder: return { ...state, order: payload }
        case actionTypes.updateOrder: return { ...state, order: { ...state.order, [payload.key]: payload.value } }
        case actionTypes.viewProduct: return { ...state, product: payload }
        case actionTypes.searchProduct: return { ...state, searchProductQuery: payload }
        case actionTypes.receiveQty: return { ...state, receivedQty: payload }
        case actionTypes.changeFetchingPos: return { ...state, fetchingPos: payload }
        case actionTypes.setReplacedProduct: return { ...state, replacedProduct: payload }
        case actionTypes.setCheckBin: return { ...state, checkBin: payload }
        default: return state
    }
}

export default POReducer