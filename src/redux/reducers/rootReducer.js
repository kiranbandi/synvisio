import {combineReducers} from 'redux';  
import session from './sessionReducer';

const rootReducer = combineReducers({  
  // short hand property names
  session
})

export default rootReducer;  