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
  createActive: boolean
  activeRequests: number
}

const initialState: CollectionState = {
    status: "fresh",
    collections: [],
    empty: true,
    createActive: false,
    activeRequests: 0
};

const collectionsSlice = createSlice({
    name: "collections",
    initialState,
    reducers: {
        landed(state, action: PayloadAction<string>) {
            state.status = "loading";
            state.acknowledge = action.payload;
            state.activeRequests++;
        },
        onMessage(state, action: PayloadAction<SocketMessage | null>) {
            if(action.payload === null) return
            const { type, payload, acknowledge } = action.payload;
            if (type === "COL.READ.OK" && acknowledge === state.acknowledge) {
                state.status = "loaded";
                state.collections = payload.collections
                state.empty = false
                state.activeRequests--;
            }
        },
        startCreateCollection(state) {
            state.activeRequests++;
            state.status = "loading"
            state.createActive = true
        },
        endCreateCollection(state, action: PayloadAction<{
            uuid: string,
            name: string,
            user: string
            time: string
        } | undefined>) {
            if(action.payload !== undefined) {
                state.collections = [...state.collections, action.payload]
            }
            state.createActive = false
            state.status = "loaded"
            state.activeRequests--;
        },
        startDeleteCollection(state) {
            state.status = "loading"
            state.activeRequests++;
        },
        endDeleteCollection(state, action: PayloadAction<string | undefined>) {
            if(action.payload !== undefined) {
                state.collections = state.collections.filter((col)=>col.uuid != action.payload)
            }
            state.status = "loaded"
            state.activeRequests--;
        },
    },
});

export const { 
    onMessage,
    landed, 
    startCreateCollection,
    endCreateCollection,
    startDeleteCollection,
    endDeleteCollection
} = collectionsSlice.actions;

const collectionsReducer = collectionsSlice.reducer;
export default collectionsReducer;
