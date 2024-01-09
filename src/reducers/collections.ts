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
    defaultDocument: string | null;
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
        // When the user has landed on the page
        // Then loading happens
        landed(state, action: PayloadAction<string>) {
            state.status = "loading";
            state.acknowledge = action.payload;
            state.activeRequests++;
        },
        // Check if the collection list was loaded
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
        // Create a new collection, the event started
        startCreateCollection(state) {
            state.activeRequests++;
            state.status = "loading"
            state.createActive = true
        },
        // Successfully created a new collection
        endCreateCollection(state, action: PayloadAction<{
            uuid: string,
            name: string,
            user: string
            time: string
            defaultDocument: string | null
        } | undefined>) {
            if(action.payload !== undefined) {
                state.collections = [...state.collections, action.payload]
            }
            state.createActive = false
            state.status = "loaded"
            state.activeRequests--;
        },
        // Delete a collection, the event started
        startDeleteCollection(state) {
            state.status = "loading"
            state.activeRequests++;
        },
        // Successfully deleted a collection
        // Remove the collection from the list
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
