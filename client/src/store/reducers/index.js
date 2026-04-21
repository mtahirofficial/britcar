import { combineReducers } from 'redux';
import ConfigReducer from './ConfigReducer';
import SupplierReducer from './SupplierReducer';
import POReducer from './POReducer';

export default combineReducers({ ConfigReducer, SupplierReducer, POReducer })