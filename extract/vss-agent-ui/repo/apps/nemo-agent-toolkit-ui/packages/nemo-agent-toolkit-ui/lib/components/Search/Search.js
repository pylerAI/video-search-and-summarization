import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { IconX } from "@tabler/icons-react";
import { useTranslation } from "next-i18next";
const Search = ({ placeholder, searchTerm, onSearch })=>{
    const { t } = useTranslation('sidebar');
    const handleSearchChange = (e)=>{
        onSearch(e.target.value);
    };
    const clearSearch = ()=>{
        onSearch('');
    };
    return /*#__PURE__*/ _jsxs("div", {
        className: "relative flex items-center",
        children: [
            /*#__PURE__*/ _jsx("input", {
                className: "w-full flex-1 rounded-md border border-gray-300 dark:border-neutral-600 bg-white dark:bg-[#202123] px-4 py-3 pr-10 text-[14px] leading-3 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400",
                type: "text",
                placeholder: t(placeholder) || '',
                value: searchTerm,
                onChange: handleSearchChange
            }),
            searchTerm && /*#__PURE__*/ _jsx(IconX, {
                className: "absolute right-4 cursor-pointer text-gray-500 hover:text-gray-700 dark:text-neutral-300 dark:hover:text-neutral-400",
                size: 18,
                onClick: clearSearch
            })
        ]
    });
};
export default Search;

//# sourceMappingURL=Search.js.map