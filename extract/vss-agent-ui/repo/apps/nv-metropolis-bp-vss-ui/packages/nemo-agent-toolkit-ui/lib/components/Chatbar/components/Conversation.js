import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { IconCheck, IconMessage, IconPencil, IconTrash, IconX } from "@tabler/icons-react";
import { useContext, useEffect, useState } from "react";
import HomeContext from "../../../pages/api/home/home.context";
import SidebarActionButton from "../../Buttons/SidebarActionButton";
import ChatbarContext from "../Chatbar.context";
export const ConversationComponent = ({ conversation })=>{
    const homeContext = useContext(HomeContext);
    const chatbarContext = useContext(ChatbarContext);
    // Guard against undefined contexts - component might be rendered outside providers
    if (!homeContext || !chatbarContext) {
        return null;
    }
    const { state: { selectedConversation, messageIsStreaming }, handleSelectConversation, handleUpdateConversation } = homeContext;
    const { handleDeleteConversation } = chatbarContext;
    const [isDeleting, setIsDeleting] = useState(false);
    const [isRenaming, setIsRenaming] = useState(false);
    const [renameValue, setRenameValue] = useState('');
    const handleEnterDown = (e)=>{
        if (e.key === 'Enter') {
            e.preventDefault();
            selectedConversation && handleRename(selectedConversation);
        }
    };
    const handleDragStart = (e, conversation)=>{
        if (e.dataTransfer) {
            e.dataTransfer.setData('conversation', JSON.stringify(conversation));
        }
    };
    const handleRename = (conversation)=>{
        if (renameValue.trim().length > 0) {
            handleUpdateConversation(conversation, {
                key: 'name',
                value: renameValue
            });
            setRenameValue('');
            setIsRenaming(false);
        }
    };
    const handleConfirm = (e)=>{
        e.stopPropagation();
        if (isDeleting) {
            handleDeleteConversation(conversation);
        } else if (isRenaming) {
            handleRename(conversation);
        }
        setIsDeleting(false);
        setIsRenaming(false);
    };
    const handleCancel = (e)=>{
        e.stopPropagation();
        setIsDeleting(false);
        setIsRenaming(false);
    };
    const handleOpenRenameModal = (e)=>{
        e.stopPropagation();
        setIsRenaming(true);
        selectedConversation && setRenameValue(selectedConversation.name);
    };
    const handleOpenDeleteModal = (e)=>{
        e.stopPropagation();
        setIsDeleting(true);
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
    return /*#__PURE__*/ _jsxs("div", {
        className: "relative flex items-center",
        children: [
            isRenaming && selectedConversation?.id === conversation.id ? /*#__PURE__*/ _jsxs("div", {
                className: "flex w-full items-center gap-3 rounded-lg bg-gray-200 dark:bg-[#343541]/90 p-3",
                children: [
                    /*#__PURE__*/ _jsx(IconMessage, {
                        size: 18,
                        className: "text-gray-900 dark:text-white"
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
                className: `flex w-full cursor-pointer items-center gap-3 rounded-lg p-3 text-sm transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-[#343541]/90 ${messageIsStreaming ? 'disabled:cursor-not-allowed' : ''} ${selectedConversation?.id === conversation.id ? 'bg-gray-200 dark:bg-[#343541]/90' : ''}`,
                onClick: ()=>handleSelectConversation(conversation),
                disabled: messageIsStreaming,
                draggable: "true",
                onDragStart: (e)=>handleDragStart(e, conversation),
                children: [
                    /*#__PURE__*/ _jsx(IconMessage, {
                        size: 18,
                        className: "text-gray-900 dark:text-white"
                    }),
                    /*#__PURE__*/ _jsx("div", {
                        className: `relative max-h-5 flex-1 overflow-hidden text-ellipsis whitespace-nowrap break-all text-left text-[12.5px] leading-3 text-gray-900 dark:text-white ${selectedConversation?.id === conversation.id ? 'pr-12' : 'pr-1'}`,
                        children: conversation.name
                    })
                ]
            }),
            (isDeleting || isRenaming) && selectedConversation?.id === conversation.id && /*#__PURE__*/ _jsxs("div", {
                className: "absolute right-1 z-10 flex text-gray-600 dark:text-gray-300",
                children: [
                    /*#__PURE__*/ _jsx(SidebarActionButton, {
                        handleClick: handleConfirm,
                        children: /*#__PURE__*/ _jsx(IconCheck, {
                            size: 18
                        })
                    }),
                    /*#__PURE__*/ _jsx(SidebarActionButton, {
                        handleClick: handleCancel,
                        children: /*#__PURE__*/ _jsx(IconX, {
                            size: 18
                        })
                    })
                ]
            }),
            selectedConversation?.id === conversation.id && !isDeleting && !isRenaming && /*#__PURE__*/ _jsxs("div", {
                className: "absolute right-1 z-10 flex text-gray-600 dark:text-gray-300",
                children: [
                    /*#__PURE__*/ _jsx(SidebarActionButton, {
                        handleClick: handleOpenRenameModal,
                        children: /*#__PURE__*/ _jsx(IconPencil, {
                            size: 18
                        })
                    }),
                    /*#__PURE__*/ _jsx(SidebarActionButton, {
                        handleClick: handleOpenDeleteModal,
                        children: /*#__PURE__*/ _jsx(IconTrash, {
                            size: 18
                        })
                    })
                ]
            })
        ]
    });
};

//# sourceMappingURL=Conversation.js.map