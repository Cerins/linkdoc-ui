import { PayloadAction, createSlice } from "@reduxjs/toolkit";

// The first argument of the callback function is actually access to the thunkAPI
// But since i do not use, i did not select it
// export const increaseByMagicNumber = createAsyncThunk("/login/magic", () => {
//     return magicNumberGen();
// });

const initialState: {
    username: string | null
} = {
    username: null
}

// So with primitives the reducer should simply return the new value
// But with objects and arrays i can use mutations
const loginSlice = createSlice({
    name: "login",
    initialState,
    reducers: {
        setUsername: (state, action: PayloadAction<string>) => {
            state.username = action.payload;
        },
    },
});

// This would be an example how it can be used with async operations. Pretty cool, isn't it?

export const { setUsername } = loginSlice.actions;

const loginReducer = loginSlice.reducer;
export default loginReducer;
