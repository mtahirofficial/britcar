import actionTypes from '../../actionTypes'

const states = {
    // serverLink: 'https://times-beneath-positioning-bishop.trycloudflare.com',
    serverLink: 'https://shopify.britcar.com',
    // serverLink: 'https://po.logiceverest.com',
    shopDomain: '',
    shopId: '',
    currency: '',
    moneyFormat: '',
    serviceId: '',
    fetchingData: false
}

const ConfigReducer = (state = states, action) => {
    const { type, payload } = action
    switch (type) {
        case actionTypes.setShopDomain: return { ...state, shopDomain: payload }
        case actionTypes.setShopId: return { ...state, shopId: payload }
        case actionTypes.saveCurrency: return { ...state, currency: payload.currency, moneyFormat: payload.moneyFormat }
        case actionTypes.setFetchingData: return { ...state, fetchingData: payload }
        default: return state
    }
}

export default ConfigReducer