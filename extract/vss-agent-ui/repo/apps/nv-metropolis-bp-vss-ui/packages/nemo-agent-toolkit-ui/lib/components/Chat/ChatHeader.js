'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { IconArrowsSort, IconMobiledataOff, IconSun, IconMoonFilled, IconUserFilled, IconChevronLeft, IconChevronRight, IconUpload } from "@tabler/icons-react";
import React, { useContext, useState, useRef, useEffect } from "react";
import { env } from "next-runtime-env";
import { getWorkflowName } from "../../utils/app/helper";
import ChatFileUpload from "./ChatFileUpload";
import HomeContext from "../../pages/api/home/home.context";
export const ChatHeader = ({ webSocketModeRef = {}, onSend })=>{
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(env('NEXT_PUBLIC_RIGHT_MENU_OPEN') === 'true' || process?.env?.NEXT_PUBLIC_RIGHT_MENU_OPEN === 'true' ? true : false);
    const menuRef = useRef(null);
    const workflow = getWorkflowName();
    const { state: { chatHistory, webSocketMode, webSocketConnected, lightMode, selectedConversation, chatUploadFileEnabled, themeChangeButtonEnabled }, dispatch: homeDispatch } = useContext(HomeContext);
    const handleLogin = ()=>{
        console.log('Login clicked');
        setIsMenuOpen(false);
    };
    useEffect(()=>{
        const handleClickOutside = (event)=>{
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return ()=>document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    const hasMessages = selectedConversation?.messages?.length > 0;
    // Shared content for the header
    const renderHeaderContent = (uploadProps)=>/*#__PURE__*/ _jsxs("div", {
            className: `top-0 z-10 flex justify-center items-center h-12 ${hasMessages ? 'bg-[#76b900] sticky' : 'bg-none'}  py-2 px-4 text-sm text-white dark:border-none dark:bg-black dark:text-neutral-200`,
            children: [
                hasMessages ? /*#__PURE__*/ _jsx("div", {
                    className: `absolute top-6 left-1/2 transform -translate-x-1/2 -translate-y-1/2`,
                    children: /*#__PURE__*/ _jsx("span", {
                        className: "text-lg font-semibold text-white",
                        children: workflow
                    })
                }) : /* Welcome screen */ /*#__PURE__*/ _jsxs("div", {
                    className: "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mx-auto flex flex-col items-center px-3 pt-5 md:pt-12 sm:max-w-[600px] text-center",
                    ...uploadProps?.dragHandlers || {},
                    children: [
                        /*#__PURE__*/ _jsxs("div", {
                            className: "text-3xl font-semibold text-gray-800 dark:text-white mb-4",
                            children: [
                                "Hi, I'm ",
                                workflow
                            ]
                        }),
                        /*#__PURE__*/ _jsx("div", {
                            className: "text-lg text-gray-600 dark:text-gray-400 mb-8",
                            children: "How can I assist you today?"
                        }),
                        chatUploadFileEnabled && uploadProps && /*#__PURE__*/ _jsx("div", {
                            onClick: uploadProps.triggerFilePicker,
                            className: `
                w-full max-w-md cursor-pointer rounded-xl border-2 border-dashed p-8 
                transition-all duration-300 ease-in-out
                ${uploadProps.isDragging ? 'border-[#76b900] bg-[#76b900]/10 scale-105 shadow-lg shadow-[#76b900]/20' : 'border-gray-300 dark:border-gray-600 hover:border-[#76b900] hover:bg-gray-50 dark:hover:bg-gray-800/50'}
                ${uploadProps.isUploading ? 'opacity-50 pointer-events-none' : ''}
              `,
                            children: /*#__PURE__*/ _jsxs("div", {
                                className: "flex flex-col items-center gap-4",
                                children: [
                                    /*#__PURE__*/ _jsx("div", {
                                        className: `
                  p-4 rounded-2xl transition-all duration-300
                  ${uploadProps.isDragging ? 'bg-[#76b900]/20 text-[#76b900]' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'}
                `,
                                        children: /*#__PURE__*/ _jsx(IconUpload, {
                                            size: 48,
                                            stroke: 1.5
                                        })
                                    }),
                                    /*#__PURE__*/ _jsx("div", {
                                        className: "text-center",
                                        children: /*#__PURE__*/ _jsx("p", {
                                            className: `text-base font-medium mb-1 transition-colors duration-300 ${uploadProps.isDragging ? 'text-[#76b900]' : 'text-gray-700 dark:text-gray-300'}`,
                                            children: uploadProps.isDragging ? 'Drop files here' : 'Click or drop files here to upload'
                                        })
                                    }),
                                    /*#__PURE__*/ _jsx("p", {
                                        className: "text-sm text-gray-500 dark:text-gray-400",
                                        children: "Movie Files (mp4, mkv)"
                                    })
                                ]
                            })
                        })
                    ]
                }),
                /*#__PURE__*/ _jsxs("div", {
                    className: "fixed right-0 top-0 h-12 mr-2 flex items-center transition-all duration-300",
                    children: [
                        /*#__PURE__*/ _jsx("button", {
                            onClick: ()=>{
                                setIsExpanded(!isExpanded);
                            },
                            className: "flex p-1 text-black dark:text-white transition-colors",
                            children: isExpanded ? /*#__PURE__*/ _jsx(IconChevronRight, {
                                size: 20
                            }) : /*#__PURE__*/ _jsx(IconChevronLeft, {
                                size: 20
                            })
                        }),
                        /*#__PURE__*/ _jsxs("div", {
                            className: `flex sm: gap-1 md:gap-4 overflow-hidden transition-all duration-300 ${isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0'}`,
                            children: [
                                /*#__PURE__*/ _jsx("div", {
                                    className: "flex items-center gap-2 whitespace-nowrap",
                                    children: /*#__PURE__*/ _jsxs("label", {
                                        className: "flex items-center gap-2 cursor-pointer flex-shrink-0",
                                        children: [
                                            /*#__PURE__*/ _jsx("span", {
                                                className: "text-sm font-medium text-black dark:text-white",
                                                children: "Chat History"
                                            }),
                                            /*#__PURE__*/ _jsx("div", {
                                                onClick: ()=>{
                                                    homeDispatch({
                                                        field: 'chatHistory',
                                                        value: !chatHistory
                                                    });
                                                },
                                                className: `relative inline-flex h-5 w-10 items-center cursor-pointer rounded-full transition-colors duration-300 ease-in-out ${chatHistory ? 'bg-black dark:bg-[#76b900]' : 'bg-gray-200'}`,
                                                children: /*#__PURE__*/ _jsx("span", {
                                                    className: `inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ease-in-out ${chatHistory ? 'translate-x-6' : 'translate-x-0'}`
                                                })
                                            })
                                        ]
                                    })
                                }),
                                /*#__PURE__*/ _jsx("div", {
                                    className: "flex items-center gap-2 whitespace-nowrap",
                                    children: /*#__PURE__*/ _jsxs("label", {
                                        className: "flex items-center gap-2 cursor-pointer flex-shrink-0",
                                        children: [
                                            /*#__PURE__*/ _jsxs("span", {
                                                className: `flex items-center gap-1 justify-evenly text-sm font-medium text-black dark:text-white`,
                                                children: [
                                                    "WebSocket",
                                                    ' ',
                                                    webSocketModeRef?.current && (webSocketConnected ? /*#__PURE__*/ _jsx(IconArrowsSort, {
                                                        size: 18,
                                                        className: "text-black dark:text-white"
                                                    }) : /*#__PURE__*/ _jsx(IconMobiledataOff, {
                                                        size: 18,
                                                        className: "text-black dark:text-white"
                                                    }))
                                                ]
                                            }),
                                            /*#__PURE__*/ _jsx("div", {
                                                onClick: ()=>{
                                                    const newWebSocketMode = !webSocketModeRef.current;
                                                    sessionStorage.setItem('webSocketMode', String(newWebSocketMode));
                                                    webSocketModeRef.current = newWebSocketMode;
                                                    homeDispatch({
                                                        field: 'webSocketMode',
                                                        value: !webSocketMode
                                                    });
                                                },
                                                className: `relative inline-flex h-5 w-10 items-center cursor-pointer rounded-full transition-colors duration-300 ease-in-out ${webSocketModeRef.current ? 'bg-black dark:bg-[#76b900]' : 'bg-gray-200'}`,
                                                children: /*#__PURE__*/ _jsx("span", {
                                                    className: `inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ease-in-out ${webSocketModeRef.current ? 'translate-x-6' : 'translate-x-0'}`
                                                })
                                            })
                                        ]
                                    })
                                }),
                                themeChangeButtonEnabled && /*#__PURE__*/ _jsx("div", {
                                    className: "flex items-center dark:text-white text-black transition-colors duration-300",
                                    children: /*#__PURE__*/ _jsx("button", {
                                        onClick: ()=>{
                                            const newMode = lightMode === 'dark' ? 'light' : 'dark';
                                            homeDispatch({
                                                field: 'lightMode',
                                                value: newMode
                                            });
                                        },
                                        className: "rounded-full flex items-center justify-center bg-none dark:bg-gray-700 transition-colors duration-300 focus:outline-none",
                                        children: lightMode === 'dark' ? /*#__PURE__*/ _jsx(IconSun, {
                                            className: "w-6 h-6 text-yellow-500 transition-transform duration-300"
                                        }) : /*#__PURE__*/ _jsx(IconMoonFilled, {
                                            className: "w-6 h-6 text-gray-800 transition-transform duration-300"
                                        })
                                    })
                                }),
                                /*#__PURE__*/ _jsxs("div", {
                                    className: "relative",
                                    ref: menuRef,
                                    children: [
                                        /*#__PURE__*/ _jsx("button", {
                                            onClick: ()=>setIsMenuOpen(!isMenuOpen),
                                            className: "flex items-center dark:text-white text-black cursor-pointer",
                                            children: /*#__PURE__*/ _jsx(IconUserFilled, {
                                                size: 20
                                            })
                                        }),
                                        isMenuOpen && /*#__PURE__*/ _jsx("div", {
                                            className: "absolute right-0 mt-2 px-2 w-auto rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5",
                                            children: /*#__PURE__*/ _jsx("div", {
                                                className: "py-1",
                                                children: /*#__PURE__*/ _jsx("button", {
                                                    onClick: handleLogin,
                                                    className: "w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700",
                                                    children: "Login"
                                                })
                                            })
                                        })
                                    ]
                                })
                            ]
                        })
                    ]
                })
            ]
        });
    // Conditionally wrap with ChatFileUpload when upload is enabled
    if (chatUploadFileEnabled) {
        return /*#__PURE__*/ _jsx(ChatFileUpload, {
            onSendHiddenMessage: onSend ? (message)=>{
                onSend({
                    role: 'user',
                    content: message,
                    hidden: true
                });
            } : undefined,
            children: ({ triggerFilePicker, isUploading, isDragging, dragHandlers })=>renderHeaderContent({
                    triggerFilePicker,
                    isUploading,
                    isDragging,
                    dragHandlers
                })
        });
    }
    return renderHeaderContent();
};

//# sourceMappingURL=ChatHeader.js.map