import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const SidebarButton = ({ text, icon, onClick })=>{
    return /*#__PURE__*/ _jsxs("button", {
        className: "flex w-full cursor-pointer select-none items-center gap-3 rounded-md py-3 px-3 text-[14px] leading-3 text-gray-900 dark:text-white transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-gray-500/10",
        onClick: onClick,
        children: [
            /*#__PURE__*/ _jsx("div", {
                children: icon
            }),
            /*#__PURE__*/ _jsx("span", {
                children: text
            })
        ]
    });
};

//# sourceMappingURL=SidebarButton.js.map