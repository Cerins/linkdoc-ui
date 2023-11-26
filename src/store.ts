import { configureStore } from "@reduxjs/toolkit";
import loginReducer from "./reducers/login";
import collectionsReducer from "./reducers/collections";

const store = configureStore({
    reducer: {
        login: loginReducer,
        collections: collectionsReducer
    },
});

type IState = ReturnType<typeof store.getState>;
type IDispatch = typeof store.dispatch;

export default store;
export type { IState, IDispatch };
