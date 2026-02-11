'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { IconCheck, IconCopy, IconEdit, IconPlayerPause, IconTrash, IconUser, IconVolume2 } from "@tabler/icons-react";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useTranslation } from "next-i18next";
import { fixMalformedHtml, generateContentIntermediate } from "../../utils/app/helper";
import { BotAvatar } from "../Avatar/BotAvatar";
import { getReactMarkDownCustomComponents } from "../Markdown/CustomComponents";
import { MemoizedReactMarkdown } from "../Markdown/MemoizedReactMarkdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
export const ChatMessage = /*#__PURE__*/ memo(({ message, messageIndex, onEdit, onDelete, totalMessageCount = 0, isStreaming = false })=>{
    const { t } = useTranslation('chat');
    const [isEditing, setIsEditing] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [messageContent, setMessageContent] = useState(message.content);
    const [messagedCopied, setMessageCopied] = useState(false);
    const textareaRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const speechSynthesisRef = useRef(null);
    // Memoize the markdown components - DO NOT include isStreaming in deps
    // Including isStreaming causes the entire markdown tree to be recreated when streaming ends,
    // which unmounts/remounts all elements (images, code blocks, etc.) causing massive lag
    // Instead, isStreaming is passed but components that need it should handle updates internally
    const markdownComponents = useMemo(()=>{
        return getReactMarkDownCustomComponents(messageIndex, message?.id, isStreaming);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        messageIndex,
        message?.id
    ]); // Intentionally excluding isStreaming
    // return if the there is nothing to show
    // no message and no intermediate steps
    if (message?.content === '' && message?.intermediateSteps?.length === 0) {
        return null;
    }
    const toggleEditing = ()=>{
        setIsEditing(!isEditing);
    };
    const handleInputChange = (event)=>{
        setMessageContent(event.target.value);
        if (textareaRef.current) {
            textareaRef.current.style.height = 'inherit';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    };
    const handleEditMessage = ()=>{
        if (message.content != messageContent) {
            if (onEdit) {
                const deleteCount = totalMessageCount - messageIndex;
                onEdit({
                    ...message,
                    content: messageContent
                }, deleteCount);
            }
        }
        setIsEditing(false);
    };
    const handleDeleteMessage = ()=>{
        if (onDelete) {
            onDelete(messageIndex);
        }
    };
    const handlePressEnter = (e)=>{
        if (e.key === 'Enter' && !isTyping && !e.shiftKey) {
            e.preventDefault();
            handleEditMessage();
        }
    };
    const copyOnClick = ()=>{
        if (!navigator.clipboard) return;
        navigator.clipboard.writeText(message.content).then(()=>{
            setMessageCopied(true);
            setTimeout(()=>{
                setMessageCopied(false);
            }, 2000);
        });
    };
    useEffect(()=>{
        setMessageContent(message.content);
    }, [
        message.content
    ]);
    useEffect(()=>{
        if (textareaRef.current) {
            textareaRef.current.style.height = 'inherit';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [
        isEditing
    ]);
    const removeLinks = (text)=>{
        // This regex matches http/https URLs
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.replace(urlRegex, '');
    };
    const handleTextToSpeech = ()=>{
        if ('speechSynthesis' in window) {
            if (isPlaying) {
                window.speechSynthesis.cancel();
                setIsPlaying(false);
            } else {
                const textWithoutLinks = removeLinks(message?.content);
                const utterance = new SpeechSynthesisUtterance(textWithoutLinks);
                utterance.onend = ()=>setIsPlaying(false);
                utterance.onerror = ()=>setIsPlaying(false);
                speechSynthesisRef.current = utterance;
                setIsPlaying(true);
                window.speechSynthesis.speak(utterance);
            }
        } else {
            console.log('Text-to-speech is not supported in your browser.');
        }
    };
    useEffect(()=>{
        return ()=>{
            if (speechSynthesisRef.current) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);
    const prepareContent = ({ message = {}, responseContent = true, intermediateStepsContent = false, role = 'assistant' } = {})=>{
        const { content = '', intermediateSteps = [] } = message;
        if (role === 'user') return content.trim();
        let result = '';
        if (intermediateStepsContent) {
            result += generateContentIntermediate(intermediateSteps);
        }
        if (responseContent) {
            result += result ? `\n\n${content}` : content;
        }
        // fixing malformed html and removing extra spaces to avoid markdown issues
        return fixMalformedHtml(result)?.trim()?.replace(/\n\s+/, '\n ');
    };
    return /*#__PURE__*/ _jsx("div", {
        className: `group md:px-4 ${message.role === 'assistant' ? 'border-b border-black/10 bg-gray-50 text-gray-800 dark:border-gray-900/50 dark:bg-[#444654] dark:text-gray-100' : 'border-b border-black/10 bg-white text-gray-800 dark:border-gray-900/50 dark:bg-[#343541] dark:text-gray-100'}`,
        style: {
            overflowWrap: 'anywhere'
        },
        children: /*#__PURE__*/ _jsxs("div", {
            className: "relative m-auto flex text-base sm:w-[95%] 2xl:w-[60%] md:gap-6 sm:p-2 md:py-6 lg:px-0",
            children: [
                /*#__PURE__*/ _jsx("div", {
                    className: "min-w-[40px] text-right font-bold",
                    children: message.role === 'assistant' ? /*#__PURE__*/ _jsx(BotAvatar, {
                        src: 'nvidia.jpg'
                    }) : /*#__PURE__*/ _jsx(IconUser, {
                        size: 30
                    })
                }),
                /*#__PURE__*/ _jsx("div", {
                    className: "w-full dark:prose-invert overflow-hidden",
                    children: message.role === 'user' ? /*#__PURE__*/ _jsxs("div", {
                        className: "flex w-full",
                        children: [
                            isEditing ? /*#__PURE__*/ _jsxs("div", {
                                className: "flex w-full flex-col",
                                children: [
                                    /*#__PURE__*/ _jsx("textarea", {
                                        ref: textareaRef,
                                        className: "w-full resize-none whitespace-pre-wrap border-none dark:bg-[#343541]",
                                        value: messageContent,
                                        onChange: handleInputChange,
                                        onKeyDown: handlePressEnter,
                                        onCompositionStart: ()=>setIsTyping(true),
                                        onCompositionEnd: ()=>setIsTyping(false),
                                        style: {
                                            fontFamily: 'inherit',
                                            fontSize: 'inherit',
                                            lineHeight: 'inherit',
                                            padding: '0',
                                            margin: '0',
                                            overflow: 'hidden'
                                        }
                                    }),
                                    /*#__PURE__*/ _jsxs("div", {
                                        className: "mt-10 flex justify-center space-x-4",
                                        children: [
                                            /*#__PURE__*/ _jsx("button", {
                                                className: "h-[40px] rounded-md border border-neutral-300 px-4 py-1 text-sm font-medium text-neutral-700 enabled:hover:bg-[#76b900] enabled:hover:text-white disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-300",
                                                onClick: handleEditMessage,
                                                disabled: messageContent.trim().length <= 0,
                                                children: t('Save & Submit')
                                            }),
                                            /*#__PURE__*/ _jsx("button", {
                                                className: "h-[40px] rounded-md border border-neutral-300 px-4 py-1 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800",
                                                onClick: ()=>{
                                                    setMessageContent(message.content);
                                                    setIsEditing(false);
                                                },
                                                children: t('Cancel')
                                            })
                                        ]
                                    })
                                ]
                            }) : /*#__PURE__*/ _jsx("div", {
                                className: "prose whitespace-pre-wrap dark:prose-invert flex-1 w-full overflow-x-auto",
                                children: /*#__PURE__*/ _jsx(ReactMarkdown, {
                                    className: "prose dark:prose-invert flex-1 w-full flex-grow max-w-full whitespace-normal",
                                    remarkPlugins: [
                                        remarkGfm,
                                        remarkMath
                                    ],
                                    rehypePlugins: [
                                        rehypeRaw
                                    ],
                                    linkTarget: "_blank",
                                    components: markdownComponents,
                                    children: prepareContent({
                                        message,
                                        role: 'user'
                                    })
                                })
                            }),
                            !isEditing && /*#__PURE__*/ _jsxs("div", {
                                className: "absolute right-2 flex flex-col md:flex-row gap-1 items-center md:items-start justify-end md:justify-start",
                                children: [
                                    /*#__PURE__*/ _jsx("button", {
                                        className: "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300",
                                        onClick: toggleEditing,
                                        children: /*#__PURE__*/ _jsx(IconEdit, {
                                            size: 20
                                        })
                                    }),
                                    /*#__PURE__*/ _jsx("button", {
                                        className: "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300",
                                        onClick: handleDeleteMessage,
                                        children: /*#__PURE__*/ _jsx(IconTrash, {
                                            size: 20
                                        })
                                    })
                                ]
                            })
                        ]
                    }) : /*#__PURE__*/ _jsx("div", {
                        className: "flex flex-col w-[90%]",
                        children: /*#__PURE__*/ _jsxs("div", {
                            className: "flex flex-col gap-2",
                            children: [
                                /*#__PURE__*/ _jsx("div", {
                                    className: "w-full overflow-x-hidden overflow-y-auto",
                                    children: /*#__PURE__*/ _jsx(MemoizedReactMarkdown, {
                                        className: "prose dark:prose-invert w-full max-w-none break-words",
                                        rehypePlugins: [
                                            rehypeRaw
                                        ],
                                        remarkPlugins: [
                                            remarkGfm,
                                            [
                                                remarkMath,
                                                {
                                                    singleDollarTextMath: false
                                                }
                                            ]
                                        ],
                                        linkTarget: "_blank",
                                        components: markdownComponents,
                                        children: prepareContent({
                                            message,
                                            role: 'assistant',
                                            intermediateStepsContent: true,
                                            responseContent: false
                                        })
                                    })
                                }),
                                /*#__PURE__*/ _jsx("div", {
                                    className: "overflow-x-auto",
                                    children: /*#__PURE__*/ _jsx(MemoizedReactMarkdown, {
                                        className: "prose dark:prose-invert flex-1 w-full flex-grow max-w-full whitespace-normal",
                                        rehypePlugins: [
                                            rehypeRaw
                                        ],
                                        remarkPlugins: [
                                            remarkGfm,
                                            [
                                                remarkMath,
                                                {
                                                    singleDollarTextMath: false
                                                }
                                            ]
                                        ],
                                        linkTarget: "_blank",
                                        components: markdownComponents,
                                        children: prepareContent({
                                            message,
                                            role: 'assistant',
                                            intermediateStepsContent: false,
                                            responseContent: true
                                        })
                                    })
                                }),
                                /*#__PURE__*/ _jsx("div", {
                                    className: "mt-1 flex gap-1",
                                    children: !isStreaming && /*#__PURE__*/ _jsxs(_Fragment, {
                                        children: [
                                            messagedCopied ? /*#__PURE__*/ _jsx(IconCheck, {
                                                size: 20,
                                                className: "text-[#76b900] dark:text-[#76b900]",
                                                id: message?.id
                                            }) : /*#__PURE__*/ _jsx("button", {
                                                className: "text-[#76b900] hover:text-gray-700 dark:text-[#76b900] dark:hover:round-gray-300",
                                                onClick: copyOnClick,
                                                title: "Copy to clipboard",
                                                id: message?.id,
                                                children: /*#__PURE__*/ _jsx(IconCopy, {
                                                    size: 20
                                                })
                                            }),
                                            /*#__PURE__*/ _jsx("button", {
                                                className: "text-[#76b900] hover:text-gray-700 dark:text-[#76b900] dark:hover:text-gray-300",
                                                onClick: handleTextToSpeech,
                                                "aria-label": isPlaying ? 'Stop speaking' : 'Start speaking',
                                                children: isPlaying ? /*#__PURE__*/ _jsx(IconPlayerPause, {
                                                    size: 20,
                                                    className: "animate-pulse text-red-400"
                                                }) : /*#__PURE__*/ _jsx(IconVolume2, {
                                                    size: 20
                                                })
                                            })
                                        ]
                                    })
                                })
                            ]
                        })
                    })
                })
            ]
        })
    });
});
ChatMessage.displayName = 'ChatMessage';

//# sourceMappingURL=ChatMessage.js.map