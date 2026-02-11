import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
export const BotAvatar = ({ height = 30, width = 30, src = '' })=>{
    const onError = (event)=>{
        console.error('error loading bot avatar');
        event.target.src = `nvidia.jpg`;
    };
    return /*#__PURE__*/ _jsx("img", {
        src: src,
        alt: "bot-avatar",
        width: width,
        height: height,
        className: "rounded-full max-w-full h-auto",
        onError: onError
    });
};

//# sourceMappingURL=BotAvatar.js.map