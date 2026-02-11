'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { fetchLastMessage } from "../../utils/app/helper";
import HomeContext from "../../pages/api/home/home.context";
export const CustomDetails = ({ children, id, messageIndex, index })=>{
    let parsedIndex = index;
    try {
        // index === -1 for top level
        parsedIndex = parseInt(index);
    } catch (error) {
        console.log('error - parsing index');
    }
    const { state } = useContext(HomeContext);
    // Memoize only the values used in rendering to prevent unnecessary re-renders
    const { messageIsStreaming, selectedConversation, expandIntermediateSteps, autoScroll } = useMemo(()=>({
            messageIsStreaming: state?.messageIsStreaming,
            selectedConversation: state?.selectedConversation,
            expandIntermediateSteps: state?.expandIntermediateSteps,
            autoScroll: state?.autoScroll
        }), [
        state?.messageIsStreaming,
        state?.selectedConversation,
        state?.expandIntermediateSteps,
        state?.autoScroll
    ]);
    const numberTotalMessages = selectedConversation?.messages?.length || 0;
    const lastAssistantMessage = fetchLastMessage({
        messages: selectedConversation?.messages,
        role: 'assistant'
    });
    const numberIntermediateMessages = lastAssistantMessage?.intermediateSteps?.length || 0;
    const isLastMessage = messageIndex === numberTotalMessages - 1;
    const isLastIntermediateMessage = parsedIndex === numberIntermediateMessages - 1;
    const shouldOpen = ()=>{
        let isOpen = false;
        const savedState = sessionStorage.getItem(`details-${id}`);
        // user saved state by toggling
        if (savedState) {
            isOpen = savedState === 'true';
        } else {
            isOpen = expandIntermediateSteps && isLastMessage || parsedIndex === -1 || isLastMessage && isLastIntermediateMessage && messageIsStreaming;
        }
        return isOpen;
    };
    // Initialize the open state based on sessionStorage or default from context
    const [isOpen, setIsOpen] = useState(shouldOpen());
    const detailsRef = useRef(null);
    useEffect(()=>{
        setIsOpen(shouldOpen());
        autoScroll && detailsRef?.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'nearest'
        });
    }, [
        isLastIntermediateMessage,
        messageIsStreaming
    ]);
    // Handle manual toggling (optional if you want more control)
    const handleToggle = ()=>{
        setIsOpen((prev)=>{
            sessionStorage.setItem(`details-${id}`, !prev);
            return !prev;
        });
    };
    return /*#__PURE__*/ _jsxs(_Fragment, {
        children: [
            /*#__PURE__*/ _jsx("details", {
                id: id,
                ref: detailsRef,
                open: isOpen,
                className: `
                    m-2 bg-neutral-100 dark:bg-zinc-700 shadow border border-neutral-300 dark:border-zinc-600 rounded-lg p-2 
                    transition-[max-height,opacity,scale] duration-500 ease-in-out overflow-auto
                    ${isOpen ? `opacity-100 h-auto scale-100` : `${messageIsStreaming && isLastMessage && 'opacity-60 scale-95'}`}
                    ${parsedIndex === -1 ? messageIsStreaming && isLastMessage ? 'max-h-[30rem]' : 'h-auto overflow-auto' : ''}
                `,
                onClick: (e)=>{
                    e.preventDefault(); // Prevent default toggle if needed
                    e.stopPropagation(); // Prevent event from bubbling to parent <details>
                    handleToggle();
                },
                children: children
            }),
            /*#__PURE__*/ _jsx("span", {
                className: `text-left font-medium focus:outline-none transition-colors duration-300 hover:text-[#76b900] text-[#76b900]`,
                children: isLastMessage && messageIsStreaming && parsedIndex === -1 && /*#__PURE__*/ _jsx("div", {
                    className: "relative mt-1 mb-2",
                    children: /*#__PURE__*/ _jsx("div", {
                        className: "h-1 bg-gray-200 rounded-full overflow-hidden",
                        children: /*#__PURE__*/ _jsx("div", {
                            className: "h-full bg-[#76b900] animate-loadingBar"
                        })
                    })
                })
            })
        ]
    });
};

//# sourceMappingURL=CustomDetails.js.map