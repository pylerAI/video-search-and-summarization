import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { BotAvatar } from "../Avatar/BotAvatar";
export const ChatLoader = ({ statusUpdateText = '' })=>{
    const config = {
        initialDelay: 500,
        delayMultiplier: 6000,
        statusMessages: [
            statusUpdateText
        ]
    };
    const [currentMessage, setCurrentMessage] = useState(''); // Initialize with empty string
    useEffect(()=>{
        const timers = config.statusMessages.map((message, index)=>{
            const delay = index === 0 ? config.initialDelay : config.initialDelay + index * config.delayMultiplier;
            return setTimeout(()=>{
                setCurrentMessage(message);
            }, delay);
        });
        return ()=>{
            timers.forEach((timer)=>clearTimeout(timer));
        };
    }, []);
    return /*#__PURE__*/ _jsx("div", {
        className: "group border-b border-black/10 bg-gray-50 text-gray-800 dark:border-gray-900/50 dark:bg-[#444654] dark:text-gray-100",
        style: {
            overflowWrap: 'anywhere'
        },
        children: /*#__PURE__*/ _jsxs("div", {
            className: "relative m-auto flex p-4 text-base sm:w-[95%] md:w-[92%] lg:w-[93%] 2xl:w-[59%] md:gap-6 md:py-6 lg:px-0",
            children: [
                /*#__PURE__*/ _jsx("div", {
                    className: "min-w-[40px] items-end",
                    children: /*#__PURE__*/ _jsx(BotAvatar, {
                        src: 'nvidia.jpg',
                        size: 30
                    })
                }),
                /*#__PURE__*/ _jsx("div", {
                    className: "flex items-center",
                    children: /*#__PURE__*/ _jsxs("span", {
                        className: "cursor-default",
                        children: [
                            currentMessage,
                            /*#__PURE__*/ _jsx("span", {
                                className: "text-[#76b900] animate-blink",
                                children: "▍"
                            })
                        ]
                    })
                })
            ]
        })
    });
};

//# sourceMappingURL=ChatLoader.js.map