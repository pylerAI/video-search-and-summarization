import { useMemo, useReducer } from "react";
// Returns a typed dispatch and state
export const useCreateReducer = ({ initialState })=>{
    const reducer = (state, action)=>{
        if (!action.type) return {
            ...state,
            [action.field]: action.value
        };
        if (action.type === 'reset') return initialState;
        throw new Error();
    };
    const [state, dispatch] = useReducer(reducer, initialState);
    return useMemo(()=>({
            state,
            dispatch
        }), [
        state,
        dispatch
    ]);
};

//# sourceMappingURL=useCreateReducer.js.map