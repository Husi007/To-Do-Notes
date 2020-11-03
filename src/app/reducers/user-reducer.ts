import { Store } from '@ngrx/store';

const SET_USER = 'SET_USER_STATE';

function userReducer(state, action): Store {
  switch (action.type) {
    case SET_USER:
      state = action.payload;
      return state;
    default:
      return state;
  }
}

export { userReducer, SET_USER };
