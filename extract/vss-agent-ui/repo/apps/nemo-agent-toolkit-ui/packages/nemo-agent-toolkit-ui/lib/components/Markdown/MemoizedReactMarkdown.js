import { jsx as _jsx } from "react/jsx-runtime";
import { memo } from "react";
import ReactMarkdown from "react-markdown";
export const MemoizedReactMarkdown = /*#__PURE__*/ memo((props)=>/*#__PURE__*/ _jsx(ReactMarkdown, {
        ...props
    }), (prevProps, nextProps)=>prevProps.children === nextProps.children && prevProps.components === nextProps.components);

//# sourceMappingURL=MemoizedReactMarkdown.js.map