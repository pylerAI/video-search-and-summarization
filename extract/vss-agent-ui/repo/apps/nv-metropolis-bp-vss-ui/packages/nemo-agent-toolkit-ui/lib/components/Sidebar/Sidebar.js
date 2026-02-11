import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { CloseSidebarButton, OpenSidebarButton } from "./components/OpenCloseButton";
import { SidebarInner } from "./SidebarInner";
const Sidebar = ({ isOpen, addItemButtonTitle, side, items, itemComponent, folderComponent, footerComponent, searchTerm, handleSearchTerm, toggleOpen, handleCreateItem, handleCreateFolder, handleDrop })=>{
    return isOpen ? /*#__PURE__*/ _jsxs("div", {
        children: [
            /*#__PURE__*/ _jsx("div", {
                className: `fixed inset-0 z-40 transition-opacity duration-300 ${isOpen ? 'bg-black opacity-70' : 'bg-transparent opacity-0'} md:relative md:w-64`,
                onClick: toggleOpen
            }),
            /*#__PURE__*/ _jsx("div", {
                className: `fixed top-0 ${side}-0 z-40 flex h-full w-[260px] flex-none transition-all`,
                children: /*#__PURE__*/ _jsx(SidebarInner, {
                    addItemButtonTitle: addItemButtonTitle,
                    items: items,
                    itemComponent: itemComponent,
                    folderComponent: folderComponent,
                    footerComponent: footerComponent,
                    searchTerm: searchTerm,
                    handleSearchTerm: handleSearchTerm,
                    handleCreateItem: handleCreateItem,
                    handleCreateFolder: handleCreateFolder,
                    handleDrop: handleDrop,
                    enableDragDrop: true
                })
            }),
            /*#__PURE__*/ _jsx(CloseSidebarButton, {
                onClick: toggleOpen,
                side: side
            })
        ]
    }) : /*#__PURE__*/ _jsx(OpenSidebarButton, {
        onClick: toggleOpen,
        side: side
    });
};
export default Sidebar;

//# sourceMappingURL=Sidebar.js.map