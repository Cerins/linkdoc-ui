export interface CollectionState {
  status:
    | "fresh"
    | "init"
    | "not found"
    | "forbidden"
    | "bad request"
    | "system error";
  text: string;
  cursor: number;
  visibility: "read" | "write";
}

export function initDocument(document: {
    text: string,
    visibility: "read" | "write"
}) {
    return {
        type: "INIT_DOCUMENT",
        payload: {
            ...document,
        },
    } as const;
}

export function setText(text: string) {
    return {
        type: "SET_TEXT",
        payload: {
            text,
        },
    } as const;
}

export function failedLoad(code: "system error") {
    return {
        type: "FAILED_LOAD",
        payload: {
            code,
        },
    } as const;
}

export function setState(state: CollectionState) {
    return {
        type: "SET_STATE",
        payload: {
            state,
        },
    } as const;
}

export type Transform =
  | {
      type: "WRITE";
      payload: {
        index: number;
        text: string;
      };
    }
  | {
      type: "ERASE";
      payload: {
        index: number;
        count: number;
      };
    };

export function transformText(transform: Transform, self = false) {
    return {
        type: "TRANSFORM_TEXT",
        payload: transform,
        meta: {
            self,
        },
    } as const;
}

export function setCursor(cursor: number) {
    return {
        type: "SET_CURSOR",
        payload: cursor,
    } as const;
}

export type CollectionAction =
  | ReturnType<typeof initDocument>
  | ReturnType<typeof setText>
  | ReturnType<typeof failedLoad>
  | ReturnType<typeof setState>
  | ReturnType<typeof transformText>
  | ReturnType<typeof setCursor>;

export default function collectionReducer(
    state: CollectionState,
    action: CollectionAction
): CollectionState {
    switch (action.type) {
    case "INIT_DOCUMENT": {
        return {
            status: "init",
            text: action.payload.text,
            visibility: action.payload.visibility,
            cursor: 0,
        };
    }
    case "TRANSFORM_TEXT": {
        let nText = state.text;
        let nCursor = state.cursor;
        const { type, payload } = action.payload;
        const self = action.meta.self;
        if (type === "WRITE") {
            nText =
                nText.substring(0, payload.index) +
                payload.text +
                nText.substring(payload.index);
            // Move cursor
            // Take in mind that the cursor can be in the middle of the inserted text
            if (payload.index <= nCursor && !self) {
                nCursor += payload.text.length;
            }
        }
        if (type === "ERASE") {
            nText =
                nText.substring(0, payload.index) +
                nText.substring(payload.index + payload.count);
            // Move cursor
            // Take in mind that the cursor can be in the middle of the erased text
            if (payload.index <= nCursor && !self) {
                nCursor = Math.max(payload.index, nCursor - payload.count);
            }
        }
        return {
            ...state,
            cursor: nCursor,
            text: nText,
        };
    }
    case "SET_TEXT": {
        return {
            ...state,
            text: action.payload.text,
        };
    }
    case "FAILED_LOAD": {
        return {
            ...state,
            status: action.payload.code,
        };
    }
    case "SET_STATE": {
        return action.payload.state;
    }
    case "SET_CURSOR": {
        return {
            ...state,
            cursor: action.payload,
        };
    }
    default:
        throw new Error("Unknown collection type");
    }
}

export const initialState: CollectionState = {
    status: "fresh",
    text: "",
    visibility: "read",
    cursor: 0
};