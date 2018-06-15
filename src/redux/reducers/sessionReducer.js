import * as types from '../actions/actionTypes';  
import initialState from './initialState';  

export default function sessionReducer(state = initialState.session , action) { 
  switch(action.type) {
    case types.LOG_IN_SUCCESS:
      return Object.assign({},state,{sessionStatus:!!localStorage.jwt},{loginLoader:false})
    case types.LOG_OUT:
      return Object.assign({},state,{sessionStatus:!!localStorage.jwt})
    case types.TOGGLE_LOADER:
      return Object.assign({},state,{loginLoader:!state.loginLoader})
    case types.FIRST_TIME_PASSWORD:
      return Object.assign({},state,{firstTimeUser:!state.firstTimeUser})
    default: 
      return state;
  }
}