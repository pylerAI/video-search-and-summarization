'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { IconInfoCircle, IconX } from "@tabler/icons-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { toast } from "react-hot-toast";
export const InteractionModal = ({ isOpen, interactionMessage, onClose, onSubmit })=>{
    if (!isOpen || !interactionMessage) return null;
    const { content } = interactionMessage;
    const [userInput, setUserInput] = useState('');
    const [error, setError] = useState('');
    // Validation for Text Input
    const handleTextSubmit = ()=>{
        if (content?.required && !userInput.trim()) {
            setError('This field is required.');
            return;
        }
        setError('');
        onSubmit({
            interactionMessage,
            userResponse: userInput
        });
        onClose();
    };
    // Handle Choice Selection
    const handleChoiceSubmit = (option = '')=>{
        if (content?.required && !option) {
            setError('Please select an option.');
            return;
        }
        setError('');
        onSubmit({
            interactionMessage,
            userResponse: option
        });
        onClose();
    };
    // Handle Radio Selection
    const handleRadioSubmit = ()=>{
        if (content?.required && !userInput) {
            setError('Please select an option.');
            return;
        }
        setError('');
        onSubmit({
            interactionMessage,
            userResponse: userInput
        });
        onClose();
    };
    if (content.input_type === 'notification') {
        toast.custom((t)=>/*#__PURE__*/ _jsxs("div", {
                className: `flex gap-2 items-center justify-evenly bg-white text-slate-800 dark:bg-slate-800 dark:text-slate-100 px-4 py-2 rounded-lg shadow-md ${t.visible ? 'animate-fade-in' : 'animate-fade-out'}`,
                children: [
                    /*#__PURE__*/ _jsx(IconInfoCircle, {
                        size: 16,
                        className: "text-[#76b900]"
                    }),
                    /*#__PURE__*/ _jsx("span", {
                        children: content?.text || 'No content found for this notification'
                    }),
                    /*#__PURE__*/ _jsx("button", {
                        onClick: ()=>toast.dismiss(t.id),
                        className: "text-slate-800 dark:bg-slate-800 dark:text-slate-100 ml-3 hover:bg-slate-300 rounded-full p-1",
                        children: /*#__PURE__*/ _jsx(IconX, {
                            size: 12
                        })
                    })
                ]
            }), {
            position: 'top-right',
            duration: Infinity,
            id: 'notification-toast'
        });
        return null;
    }
    return /*#__PURE__*/ _jsx("div", {
        className: "fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50",
        children: /*#__PURE__*/ _jsxs("div", {
            className: "bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg sm:w-[75%] h-auto",
            children: [
                /*#__PURE__*/ _jsx("div", {
                    className: "mb-4 text-slate-800 dark:text-white prose prose-base dark:prose-invert max-w-none prose-headings:font-semibold prose-p:my-1 max-h-[60vh] overflow-y-auto",
                    children: /*#__PURE__*/ _jsx(ReactMarkdown, {
                        children: content?.text || ''
                    })
                }),
                content.input_type === 'text' && /*#__PURE__*/ _jsxs("div", {
                    children: [
                        /*#__PURE__*/ _jsx("textarea", {
                            className: "w-full border border-gray-300 dark:border-gray-600 p-2 rounded text-black dark:text-white bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400",
                            placeholder: content?.placeholder,
                            value: userInput,
                            onChange: (e)=>setUserInput(e.target.value)
                        }),
                        error && /*#__PURE__*/ _jsx("p", {
                            className: "text-red-500 text-sm mt-2",
                            children: error
                        }),
                        /*#__PURE__*/ _jsxs("div", {
                            className: "flex justify-end mt-4 space-x-2",
                            children: [
                                /*#__PURE__*/ _jsx("button", {
                                    className: "px-4 py-2 bg-gray-500 dark:bg-gray-600 text-white rounded hover:bg-gray-600 dark:hover:bg-gray-500",
                                    onClick: onClose,
                                    children: "Cancel"
                                }),
                                /*#__PURE__*/ _jsx("button", {
                                    className: "px-4 py-2 bg-[#76b900] text-white rounded hover:bg-[#5a8c00]",
                                    onClick: handleTextSubmit,
                                    children: "Submit"
                                })
                            ]
                        })
                    ]
                }),
                content.input_type === 'binary_choice' && /*#__PURE__*/ _jsx("div", {
                    children: /*#__PURE__*/ _jsx("div", {
                        className: "flex justify-end mt-4 space-x-2",
                        children: content.options.map((option)=>/*#__PURE__*/ _jsx("button", {
                                className: `px-4 py-2 ${option?.value?.includes('continue') ? 'bg-[#76b900]' : 'bg-slate-800'} text-white rounded`,
                                onClick: ()=>handleChoiceSubmit(option.value),
                                children: option.label
                            }, option.id))
                    })
                }),
                content.input_type === 'radio' && /*#__PURE__*/ _jsxs("div", {
                    children: [
                        /*#__PURE__*/ _jsx("div", {
                            className: "space-y-3",
                            children: content.options.map((option)=>/*#__PURE__*/ _jsxs("div", {
                                    className: "flex items-center",
                                    children: [
                                        /*#__PURE__*/ _jsx("input", {
                                            type: "radio",
                                            id: option.id,
                                            name: "notification-method",
                                            value: option.value,
                                            checked: userInput === option.value,
                                            onChange: ()=>setUserInput(option.value),
                                            className: "mr-2 text-[#76b900] focus:ring-[#76b900]"
                                        }),
                                        /*#__PURE__*/ _jsx("label", {
                                            htmlFor: option.id,
                                            className: "flex flex-col",
                                            children: /*#__PURE__*/ _jsx("span", {
                                                className: "text-slate-800 dark:text-white",
                                                children: option.label
                                            })
                                        })
                                    ]
                                }, option.id))
                        }),
                        error && /*#__PURE__*/ _jsx("p", {
                            className: "text-red-500 text-sm mt-2",
                            children: error
                        }),
                        /*#__PURE__*/ _jsxs("div", {
                            className: "flex justify-end mt-4 space-x-2",
                            children: [
                                /*#__PURE__*/ _jsx("button", {
                                    className: "px-4 py-2 bg-gray-500 dark:bg-gray-600 text-white rounded hover:bg-gray-600 dark:hover:bg-gray-500",
                                    onClick: onClose,
                                    children: "Cancel"
                                }),
                                /*#__PURE__*/ _jsx("button", {
                                    className: "px-4 py-2 bg-[#76b900] text-white rounded hover:bg-[#5a8c00]",
                                    onClick: handleRadioSubmit,
                                    children: "Submit"
                                })
                            ]
                        })
                    ]
                })
            ]
        })
    });
};

//# sourceMappingURL=ChatInteractionMessage.js.map