import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk'
import { composeWithDevTools } from 'redux-devtools-extension';
import rootReducers from './reducers'

const middleWare = [thunkMiddleware];
const intialState = {};

let store = createStore(
    rootReducers,
    intialState,
    composeWithDevTools(
        applyMiddleware(...middleWare)
    )
);

export default store