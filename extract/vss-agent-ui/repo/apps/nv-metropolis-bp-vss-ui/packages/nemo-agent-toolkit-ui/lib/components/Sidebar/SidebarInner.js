import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { IconFolderPlus, IconMistOff, IconPlus } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import Search from "../Search";
/**
 * Inner content component for sidebars.
 * Contains the layout structure without positioning/overlay logic.
 * Used by both Sidebar (with positioning) and ChatSidebarContent (embedded).
 */ export const SidebarInner = ({ addItemButtonTitle, items, itemComponent, folderComponent, footerComponent, searchTerm, handleSearchTerm, handleCreateItem, handleCreateFolder, handleDrop, enableDragDrop = true })=>{
    const { t } = useTranslation('promptbar');
    const allowDrop = (e)=>{
        e.preventDefault();
    };
    const highlightDrop = (e)=>{
        const isDark = document.documentElement.classList.contains('dark');
        e.target.style.background = isDark ? '#343541' : '#e5e7eb';
    };
    const removeHighlight = (e)=>{
        e.target.style.background = 'none';
    };
    return /*#__PURE__*/ _jsxs("div", {
        className: "flex h-full w-full flex-col space-y-2 bg-gray-50 dark:bg-[#202123] p-2 text-[14px]",
        children: [
            /*#__PURE__*/ _jsxs("div", {
                className: "flex items-center",
                children: [
                    /*#__PURE__*/ _jsxs("button", {
                        className: "text-sidebar flex w-[190px] flex-shrink-0 cursor-pointer select-none items-center gap-3 rounded-md border border-gray-300 dark:border-white/20 p-3 text-gray-900 dark:text-white transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-gray-500/10",
                        onClick: ()=>{
                            handleCreateItem();
                            handleSearchTerm('');
                        },
                        children: [
                            /*#__PURE__*/ _jsx(IconPlus, {
                                size: 16
                            }),
                            addItemButtonTitle
                        ]
                    }),
                    /*#__PURE__*/ _jsx("button", {
                        className: "ml-2 flex flex-shrink-0 cursor-pointer items-center gap-3 rounded-md border border-gray-300 dark:border-white/20 p-3 text-sm text-gray-900 dark:text-white transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-gray-500/10",
                        onClick: handleCreateFolder,
                        children: /*#__PURE__*/ _jsx(IconFolderPlus, {
                            size: 16
                        })
                    })
                ]
            }),
            /*#__PURE__*/ _jsx(Search, {
                placeholder: t('Search...') || '',
                searchTerm: searchTerm,
                onSearch: handleSearchTerm
            }),
            /*#__PURE__*/ _jsxs("div", {
                className: "flex-grow overflow-auto",
                children: [
                    items?.length > 0 && /*#__PURE__*/ _jsx("div", {
                        className: "flex border-b border-gray-300 dark:border-white/20 pb-2",
                        children: folderComponent
                    }),
                    items?.length > 0 ? /*#__PURE__*/ _jsx("div", {
                        className: "pt-2",
                        onDrop: enableDragDrop && handleDrop ? handleDrop : undefined,
                        onDragOver: enableDragDrop ? allowDrop : undefined,
                        onDragEnter: enableDragDrop ? highlightDrop : undefined,
                        onDragLeave: enableDragDrop ? removeHighlight : undefined,
                        children: itemComponent
                    }) : /*#__PURE__*/ _jsxs("div", {
                        className: "mt-8 select-none text-center text-gray-500 dark:text-white opacity-50",
                        children: [
                            /*#__PURE__*/ _jsx(IconMistOff, {
                                className: "mx-auto mb-3"
                            }),
                            /*#__PURE__*/ _jsx("span", {
                                className: "text-[14px] leading-normal",
                                children: t('No data.')
                            })
                        ]
                    })
                ]
            }),
            footerComponent
        ]
    });
};

//# sourceMappingURL=SidebarInner.js.map