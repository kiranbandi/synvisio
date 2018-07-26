import { createStore, applyMiddleware } from 'redux';
import rootReducer from '../reducers/rootReducer';
// restricting extension in production - need to set process.env.NODE_ENV to 'production'
import { composeWithDevTools } from 'redux-devtools-extension/logOnlyInProduction';
import thunk from 'redux-thunk';

export default function configureStore() {
  return createStore(
    rootReducer,
    composeWithDevTools(applyMiddleware(thunk))
  );
}