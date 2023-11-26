import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { magicNumberGen } from "../services/login";

// The first argument of the callback function is actually access to the thunkAPI
// But since i do not use, i did not select it
export const increaseByMagicNumber = createAsyncThunk("/login/magic", () => {
    return magicNumberGen();
});
// So with primitives the reducer should simply return the new value
// But with objects and arrays i can use mutations
const loginSlice = createSlice({
    name: "login",
    initialState: {
        val: 0,
    },
    reducers: {
        increase: (state, action: PayloadAction<number>) => {
            state.val += action.payload;
        },
        decrease: (state, action: PayloadAction<number>) => {
            state.val -= action.payload;
        },
        zero: (state) => {
            state.val = 0;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(increaseByMagicNumber.fulfilled, (state, action) => {
            state.val += action.payload;
        });
        builder.addCase(increaseByMagicNumber.rejected, () => {});
        builder.addCase(increaseByMagicNumber.pending, () => {});
    },
});

// This would be an example how it can be used with async operations. Pretty cool, isn't it?

export const { increase, decrease, zero } = loginSlice.actions;

const loginReducer = loginSlice.reducer;
export default loginReducer;
