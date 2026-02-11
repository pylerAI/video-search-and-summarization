'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { IconCpu, IconTool, IconLoader, IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { useState, useContext, useMemo } from "react";
import HomeContext from "../../pages/api/home/home.context";
// Custom summary with additional props
export const CustomSummary = ({ children, id, index, messageIndex, islast })=>{
    const [checkOpen, setCheckOpen] = useState(false);
    const { state } = useContext(HomeContext);
    // Memoize context values to prevent unnecessary re-renders
    const { messageIsStreaming, selectedConversation } = useMemo(()=>({
            messageIsStreaming: state?.messageIsStreaming,
            selectedConversation: state?.selectedConversation
        }), [
        state?.messageIsStreaming,
        state?.selectedConversation
    ]);
    // Calculate if this step is currently streaming
    const numberTotalMessages = selectedConversation?.messages?.length || 0;
    const isLastMessage = messageIndex === numberTotalMessages - 1;
    // Show spinner only on the step that is currently streaming
    // islast="true" means this step is the last one in the chain (including nested substeps)
    const isStepStreaming = messageIsStreaming && isLastMessage && islast === 'true';
    const shouldOpen = ()=>{
        const savedState = sessionStorage.getItem(`details-${id}`);
        const open = savedState === 'true';
        return open;
    };
    return /*#__PURE__*/ _jsxs("summary", {
        className: `
        cursor-pointer 
        font-normal 
        text-gray-600 
        hover:text-[#76b900] 
        dark:text-neutral-300 
        dark:hover:text-[#76b900]
        list-none 
        flex items-center justify-between 
        p-0 rounded
      `,
        onClick: (e)=>{
            e.preventDefault();
            setCheckOpen(!checkOpen);
        },
        children: [
            /*#__PURE__*/ _jsxs("div", {
                className: "flex items-center flex-1 gap-2",
                children: [
                    children?.toString().toLowerCase()?.includes('tool') ? /*#__PURE__*/ _jsx(IconTool, {
                        size: 16,
                        className: "text-[#76b900]"
                    }) : /*#__PURE__*/ _jsx(IconCpu, {
                        size: 16,
                        className: "text-[#76b900]"
                    }),
                    /*#__PURE__*/ _jsx("span", {
                        children: children
                    })
                ]
            }),
            /*#__PURE__*/ _jsxs("div", {
                className: "flex items-center gap-1",
                children: [
                    isStepStreaming && /*#__PURE__*/ _jsx(IconLoader, {
                        size: 16,
                        className: "animate-spin text-[#76b900]"
                    }),
                    shouldOpen() ? /*#__PURE__*/ _jsx(IconChevronUp, {
                        size: 16,
                        className: "text-gray-500 transition-colors duration-300 dark:text-neutral-300"
                    }) : /*#__PURE__*/ _jsx(IconChevronDown, {
                        size: 16,
                        className: "text-gray-500 transition-colors duration-300 dark:text-neutral-300"
                    })
                ]
            })
        ]
    });
};

//# sourceMappingURL=CustomSummary.js.map