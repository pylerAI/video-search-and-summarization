import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { IconPlus } from "@tabler/icons-react";
export const Navbar = ({ selectedConversation, onNewConversation })=>{
    return /*#__PURE__*/ _jsxs("nav", {
        className: "flex w-full justify-between bg-[#202123] py-3 px-4",
        children: [
            /*#__PURE__*/ _jsx("div", {
                className: "mr-4"
            }),
            /*#__PURE__*/ _jsx("div", {
                className: "max-w-[240px] overflow-hidden text-ellipsis whitespace-nowrap",
                children: selectedConversation.name
            }),
            /*#__PURE__*/ _jsx(IconPlus, {
                className: "cursor-pointer hover:text-neutral-400 mr-8",
                onClick: onNewConversation
            })
        ]
    });
};

//# sourceMappingURL=Navbar.js.map