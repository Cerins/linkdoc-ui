import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { SocketMessage } from "../contexts/Socket";

interface CollectionState {
  status: "loading" | "fresh" | "loaded";
  empty: boolean
  collections: {
    uuid: string;
    name: string;
    time: string;
    user: string;
  }[];
  acknowledge?: string;
}

const initialState: CollectionState = {
    status: "fresh",
    collections: [],
    empty: true
};

const collectionsSlice = createSlice({
    name: "collections",
    initialState,
    reducers: {
        landed(state, action: PayloadAction<string>) {
            state.status = "loading";
            state.acknowledge = action.payload;
        },
        onMessage(state, action: PayloadAction<SocketMessage | null>) {
            if(action.payload === null) return
            const { type, payload, acknowledge } = action.payload;
            if (type === "COL.READ.OK" && acknowledge === state.acknowledge) {
                state.status = "loaded";
                state.collections = payload.collections
                state.empty = false
            }
        },
    },
});

export const { onMessage, landed } = collectionsSlice.actions;

const collectionsReducer = collectionsSlice.reducer;
export default collectionsReducer;
