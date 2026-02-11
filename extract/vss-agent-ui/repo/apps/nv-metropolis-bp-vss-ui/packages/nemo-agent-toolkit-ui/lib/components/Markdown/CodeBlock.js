import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { IconCheck, IconClipboard, IconDownload } from "@tabler/icons-react";
import { memo, useState, useMemo, useEffect, useRef } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { useTranslation } from "next-i18next";
import { generateRandomString, programmingLanguages } from "../../utils/app/codeblock";
// For very large content, use plain text instead of syntax highlighting
const VERY_LARGE_CONTENT_THRESHOLD = 50000;
// Time to wait after content stops changing before applying syntax highlighting
const CONTENT_STABLE_DELAY_MS = 500;
export const CodeBlock = /*#__PURE__*/ memo(({ language, value, isStreaming = false })=>{
    const { t } = useTranslation('markdown');
    const [isCopied, setIsCopied] = useState(false);
    // Track whether content has stabilized (not changing for CONTENT_STABLE_DELAY_MS)
    // This is more reliable than the isStreaming prop which may not update due to parent memoization
    const [contentStable, setContentStable] = useState(false);
    const lastValueRef = useRef(value);
    const stabilityTimerRef = useRef(null);
    // Ensure value is a valid JSON string
    if (language === 'json') {
        try {
            value = value.replaceAll("'", '"');
        } catch (error) {
            console.log(error);
        }
    }
    const formattedValue = useMemo(()=>{
        try {
            return JSON.stringify(JSON.parse(value), null, 2);
        } catch  {
            return value; // Return the original value if parsing fails
        }
    }, [
        value
    ]);
    // Detect when content has stopped changing (streaming complete)
    useEffect(()=>{
        // Content changed - reset stability
        if (lastValueRef.current !== value) {
            lastValueRef.current = value;
            setContentStable(false);
            // Clear existing timer
            if (stabilityTimerRef.current) {
                clearTimeout(stabilityTimerRef.current);
            }
            // Start new timer - if content doesn't change for CONTENT_STABLE_DELAY_MS, mark as stable
            stabilityTimerRef.current = setTimeout(()=>{
                setContentStable(true);
            }, CONTENT_STABLE_DELAY_MS);
        }
        return ()=>{
            if (stabilityTimerRef.current) {
                clearTimeout(stabilityTimerRef.current);
            }
        };
    }, [
        value
    ]);
    // For very large content OR while content is still changing, use plain text rendering
    // Syntax highlighting is expensive and causes lag during streaming
    const isVeryLarge = formattedValue.length > VERY_LARGE_CONTENT_THRESHOLD;
    const usePlainText = isVeryLarge || !contentStable;
    const copyToClipboard = (e)=>{
        e?.preventDefault();
        e?.stopPropagation();
        if (!navigator.clipboard || !navigator.clipboard.writeText) {
            return;
        }
        navigator.clipboard.writeText(formattedValue).then(()=>{
            setIsCopied(true);
            setTimeout(()=>{
                setIsCopied(false);
            }, 2000);
        });
    };
    const downloadAsFile = (e)=>{
        e?.preventDefault();
        e?.stopPropagation();
        const fileExtension = programmingLanguages[language] || '.file';
        const suggestedFileName = `file-${generateRandomString(3, true)}${fileExtension}`;
        if (!suggestedFileName) {
            return;
        }
        const blob = new Blob([
            formattedValue
        ], {
            type: 'text/plain'
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = suggestedFileName;
        link.href = url;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };
    return /*#__PURE__*/ _jsxs("div", {
        className: "codeblock relative font-sans text-[16px] w-full",
        children: [
            /*#__PURE__*/ _jsxs("div", {
                className: "flex items-center justify-between py-1.5 px-4 bg-gray-800 text-white",
                children: [
                    /*#__PURE__*/ _jsxs("span", {
                        className: "text-xs lowercase",
                        children: [
                            language,
                            isVeryLarge && /*#__PURE__*/ _jsx("span", {
                                className: "ml-2 text-yellow-400 text-xs",
                                children: "(Plain text mode - large content)"
                            })
                        ]
                    }),
                    /*#__PURE__*/ _jsxs("div", {
                        className: "flex items-center gap-1",
                        children: [
                            /*#__PURE__*/ _jsxs("button", {
                                className: "flex gap-1.5 items-center rounded bg-none p-1 text-xs text-white hover:bg-gray-700",
                                onClick: (e)=>copyToClipboard(e),
                                children: [
                                    isCopied ? /*#__PURE__*/ _jsx(IconCheck, {
                                        size: 18
                                    }) : /*#__PURE__*/ _jsx(IconClipboard, {
                                        size: 18
                                    }),
                                    isCopied ? t('Copied!') : t('Copy code')
                                ]
                            }),
                            /*#__PURE__*/ _jsx("button", {
                                className: "flex items-center rounded bg-none p-1 text-xs text-white hover:bg-gray-700",
                                onClick: (e)=>downloadAsFile(e),
                                children: /*#__PURE__*/ _jsx(IconDownload, {
                                    size: 18
                                })
                            })
                        ]
                    })
                ]
            }),
            /*#__PURE__*/ _jsx("div", {
                className: "overflow-hidden",
                style: {
                    maxHeight: '50vh',
                    overflowY: 'auto'
                },
                children: usePlainText ? // For very large content, use plain text for performance
                /*#__PURE__*/ _jsx("pre", {
                    style: {
                        margin: 0,
                        padding: '16px',
                        background: '#1f2937',
                        fontSize: '14px',
                        lineHeight: '1.5',
                        fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                        color: '#abb2bf',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word'
                    },
                    children: formattedValue
                }) : // For normal content, use syntax highlighting
                /*#__PURE__*/ _jsx(SyntaxHighlighter, {
                    language: language || 'text',
                    style: oneDark,
                    customStyle: {
                        margin: 0,
                        padding: '16px',
                        background: '#1f2937',
                        fontSize: '14px',
                        lineHeight: '1.5',
                        fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                        width: '100%',
                        maxWidth: '100%',
                        minWidth: 0,
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                        boxSizing: 'border-box',
                        border: 'none',
                        borderRadius: 0
                    },
                    codeTagProps: {
                        style: {
                            fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                            fontSize: '14px'
                        }
                    },
                    wrapLines: true,
                    wrapLongLines: true,
                    children: formattedValue
                })
            })
        ]
    });
});
CodeBlock.displayName = 'CodeBlock';

//# sourceMappingURL=CodeBlock.js.map