import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { IconCaretDown, IconCaretRight, IconCheck, IconPencil, IconTrash, IconX } from "@tabler/icons-react";
import { useContext, useEffect, useState } from "react";
import HomeContext from "../../pages/api/home/home.context";
import SidebarActionButton from "../Buttons/SidebarActionButton";
const Folder = ({ currentFolder, searchTerm, handleDrop, folderComponent })=>{
    const homeContext = useContext(HomeContext);
    // Guard against undefined context - component might be rendered outside HomeContext.Provider
    if (!homeContext) {
        return null;
    }
    const { handleDeleteFolder, handleUpdateFolder } = homeContext;
    const [isDeleting, setIsDeleting] = useState(false);
    const [isRenaming, setIsRenaming] = useState(false);
    const [renameValue, setRenameValue] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const handleEnterDown = (e)=>{
        if (e.key === 'Enter') {
            e.preventDefault();
            handleRename();
        }
    };
    const handleRename = ()=>{
        handleUpdateFolder(currentFolder.id, renameValue);
        setRenameValue('');
        setIsRenaming(false);
    };
    const dropHandler = (e)=>{
        if (e.dataTransfer) {
            setIsOpen(true);
            handleDrop(e, currentFolder);
            e.target.style.background = 'none';
        }
    };
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
    useEffect(()=>{
        if (isRenaming) {
            setIsDeleting(false);
        } else if (isDeleting) {
            setIsRenaming(false);
        }
    }, [
        isRenaming,
        isDeleting
    ]);
    useEffect(()=>{
        if (searchTerm) {
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }
    }, [
        searchTerm
    ]);
    return /*#__PURE__*/ _jsxs(_Fragment, {
        children: [
            /*#__PURE__*/ _jsxs("div", {
                className: "relative flex items-center",
                children: [
                    isRenaming ? /*#__PURE__*/ _jsxs("div", {
                        className: "flex w-full items-center gap-3 bg-gray-200 dark:bg-[#343541]/90 p-3 text-gray-900 dark:text-white",
                        children: [
                            isOpen ? /*#__PURE__*/ _jsx(IconCaretDown, {
                                size: 18
                            }) : /*#__PURE__*/ _jsx(IconCaretRight, {
                                size: 18
                            }),
                            /*#__PURE__*/ _jsx("input", {
                                className: "mr-12 flex-1 overflow-hidden overflow-ellipsis border-gray-400 dark:border-neutral-400 bg-transparent text-left text-[12.5px] leading-3 text-gray-900 dark:text-white outline-none focus:border-gray-600 dark:focus:border-neutral-100",
                                type: "text",
                                value: renameValue,
                                onChange: (e)=>setRenameValue(e.target.value),
                                onKeyDown: handleEnterDown,
                                autoFocus: true
                            })
                        ]
                    }) : /*#__PURE__*/ _jsxs("button", {
                        className: `flex w-full cursor-pointer items-center gap-3 rounded-lg p-3 text-sm text-gray-900 dark:text-white transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-[#343541]/90`,
                        onClick: ()=>setIsOpen(!isOpen),
                        onDrop: (e)=>dropHandler(e),
                        onDragOver: allowDrop,
                        onDragEnter: highlightDrop,
                        onDragLeave: removeHighlight,
                        children: [
                            isOpen ? /*#__PURE__*/ _jsx(IconCaretDown, {
                                size: 18
                            }) : /*#__PURE__*/ _jsx(IconCaretRight, {
                                size: 18
                            }),
                            /*#__PURE__*/ _jsx("div", {
                                className: "relative max-h-5 flex-1 overflow-hidden text-ellipsis whitespace-nowrap break-all text-left text-[12.5px] leading-3 text-gray-900 dark:text-white",
                                children: currentFolder.name
                            })
                        ]
                    }),
                    (isDeleting || isRenaming) && /*#__PURE__*/ _jsxs("div", {
                        className: "absolute right-1 z-10 flex text-gray-600 dark:text-gray-300",
                        children: [
                            /*#__PURE__*/ _jsx(SidebarActionButton, {
                                handleClick: (e)=>{
                                    e.stopPropagation();
                                    if (isDeleting) {
                                        handleDeleteFolder(currentFolder.id);
                                    } else if (isRenaming) {
                                        handleRename();
                                    }
                                    setIsDeleting(false);
                                    setIsRenaming(false);
                                },
                                children: /*#__PURE__*/ _jsx(IconCheck, {
                                    size: 18
                                })
                            }),
                            /*#__PURE__*/ _jsx(SidebarActionButton, {
                                handleClick: (e)=>{
                                    e.stopPropagation();
                                    setIsDeleting(false);
                                    setIsRenaming(false);
                                },
                                children: /*#__PURE__*/ _jsx(IconX, {
                                    size: 18
                                })
                            })
                        ]
                    }),
                    !isDeleting && !isRenaming && /*#__PURE__*/ _jsxs("div", {
                        className: "absolute right-1 z-10 flex text-gray-600 dark:text-gray-300",
                        children: [
                            /*#__PURE__*/ _jsx(SidebarActionButton, {
                                handleClick: (e)=>{
                                    e.stopPropagation();
                                    setIsRenaming(true);
                                    setRenameValue(currentFolder.name);
                                },
                                children: /*#__PURE__*/ _jsx(IconPencil, {
                                    size: 18
                                })
                            }),
                            /*#__PURE__*/ _jsx(SidebarActionButton, {
                                handleClick: (e)=>{
                                    e.stopPropagation();
                                    setIsDeleting(true);
                                },
                                children: /*#__PURE__*/ _jsx(IconTrash, {
                                    size: 18
                                })
                            })
                        ]
                    })
                ]
            }),
            isOpen ? folderComponent : null
        ]
    });
};
export default Folder;

//# sourceMappingURL=Folder.js.map