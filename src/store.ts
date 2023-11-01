import { configureStore } from "@reduxjs/toolkit";
import loginReducer from "./reducers/login";

const store = configureStore({
    reducer: {
        login: loginReducer
    }
});

type IState = ReturnType<typeof store.getState>
type IDispatch = typeof store.dispatch

export default store;
export type {
    IState,
    IDispatch
}
