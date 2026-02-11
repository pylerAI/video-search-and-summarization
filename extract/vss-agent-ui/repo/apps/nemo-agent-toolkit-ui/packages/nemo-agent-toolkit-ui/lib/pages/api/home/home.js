import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useTranslation } from "next-i18next";
import Head from "next/head";
import { useCreateReducer } from "../../../hooks/useCreateReducer";
import { cleanConversationHistory, cleanSelectedConversation } from "../../../utils/app/clean";
import { saveConversation, saveConversations, updateConversation } from "../../../utils/app/conversation";
import { saveFolders } from "../../../utils/app/folders";
import { getWorkflowName } from "../../../utils/app/helper";
// import { getSettings } from '@/utils/app/settings';
import { APPLICATION_NAME } from "../../../constants/constants";
import { Chat } from "../../../components/Chat/Chat";
import { Chatbar } from "../../../components/Chatbar/Chatbar";
import { Navbar } from "../../../components/Mobile/Navbar";
import HomeContext from "./home.context";
import { initialState } from "./home.state";
import { v4 as uuidv4 } from "uuid";
const Home = (props = {})=>{
    const { theme: externalTheme, onThemeChange, renderControlsInLeftSidebar = false, onControlsReady, renderApplicationHead = true, className = '', style = {} } = props;
    const { t } = useTranslation('chat');
    // Initialize state with external theme if provided
    const contextValue = useCreateReducer({
        initialState: externalTheme ? {
            ...initialState,
            lightMode: externalTheme
        } : initialState
    });
    let workflow = APPLICATION_NAME;
    const { state: { lightMode, folders, conversations, selectedConversation }, dispatch } = contextValue;
    const stopConversationRef = useRef(false);
    // Track if we're in the middle of an external theme update to prevent loops
    const isExternalThemeUpdateRef = useRef(false);
    // Track the last external theme to detect changes
    const lastExternalThemeRef = useRef(externalTheme);
    // Apply theme to document root synchronously before paint to avoid flash
    useLayoutEffect(()=>{
        const root = document.documentElement;
        if (lightMode === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [
        lightMode
    ]);
    const handleSelectConversation = useCallback((conversation)=>{
        // Clear any streaming states before switching conversations
        dispatch({
            field: 'messageIsStreaming',
            value: false
        });
        dispatch({
            field: 'loading',
            value: false
        });
        dispatch({
            field: 'selectedConversation',
            value: conversation
        });
        saveConversation(conversation);
    }, [
        dispatch
    ]);
    // FOLDER OPERATIONS  --------------------------------------------
    const handleCreateFolder = useCallback((name, type)=>{
        const newFolder = {
            id: uuidv4(),
            name,
            type
        };
        const updatedFolders = [
            ...folders,
            newFolder
        ];
        dispatch({
            field: 'folders',
            value: updatedFolders
        });
        saveFolders(updatedFolders);
    }, [
        folders,
        dispatch
    ]);
    const handleDeleteFolder = useCallback((folderId)=>{
        const updatedFolders = folders.filter((f)=>f.id !== folderId);
        dispatch({
            field: 'folders',
            value: updatedFolders
        });
        saveFolders(updatedFolders);
        const updatedConversations = conversations.map((c)=>{
            if (c.folderId === folderId) {
                return {
                    ...c,
                    folderId: null
                };
            }
            return c;
        });
        dispatch({
            field: 'conversations',
            value: updatedConversations
        });
        saveConversations(updatedConversations);
    }, [
        folders,
        conversations,
        dispatch
    ]);
    const handleUpdateFolder = useCallback((folderId, name)=>{
        const updatedFolders = folders.map((f)=>{
            if (f.id === folderId) {
                return {
                    ...f,
                    name
                };
            }
            return f;
        });
        dispatch({
            field: 'folders',
            value: updatedFolders
        });
        saveFolders(updatedFolders);
    }, [
        folders,
        dispatch
    ]);
    // CONVERSATION OPERATIONS  --------------------------------------------
    const handleNewConversation = useCallback(()=>{
        // Check if current conversation is a homepage conversation with no messages
        if (selectedConversation?.isHomepageConversation && selectedConversation.messages.length === 0) {
            // Just remove the homepage flag to make it visible in sidebar, don't create a new conversation
            const updatedConversation = {
                ...selectedConversation,
                isHomepageConversation: undefined
            };
            const updatedConversations = conversations.map((c)=>c.id === selectedConversation.id ? updatedConversation : c);
            dispatch({
                field: 'selectedConversation',
                value: updatedConversation
            });
            dispatch({
                field: 'conversations',
                value: updatedConversations
            });
            saveConversation(updatedConversation);
            saveConversations(updatedConversations);
            return;
        }
        const newConversation = {
            id: uuidv4(),
            name: t('New Conversation'),
            messages: [],
            folderId: null
        };
        const updatedConversations = [
            ...conversations,
            newConversation
        ];
        dispatch({
            field: 'selectedConversation',
            value: newConversation
        });
        dispatch({
            field: 'conversations',
            value: updatedConversations
        });
        saveConversation(newConversation);
        saveConversations(updatedConversations);
        dispatch({
            field: 'loading',
            value: false
        });
    }, [
        selectedConversation,
        conversations,
        dispatch,
        t
    ]);
    const handleUpdateConversation = useCallback((conversation, data)=>{
        const updatedConversation = {
            ...conversation,
            [data.key]: data.value
        };
        const { single, all } = updateConversation(updatedConversation, conversations);
        dispatch({
            field: 'selectedConversation',
            value: single
        });
        dispatch({
            field: 'conversations',
            value: all
        });
    }, [
        conversations,
        dispatch
    ]);
    // EFFECTS  --------------------------------------------
    useEffect(()=>{
        workflow = getWorkflowName();
        // Give priority to saved sessionStorage value over environment variable (only when not externally controlled)
        if (!externalTheme) {
            const savedLightMode = sessionStorage.getItem('lightMode');
            if (savedLightMode && (savedLightMode === 'light' || savedLightMode === 'dark')) {
                dispatch({
                    field: 'lightMode',
                    value: savedLightMode
                });
            }
        }
        // Restore sessionStorage override for showChatbar - give priority to user's session preference
        const showChatbar = sessionStorage.getItem('showChatbar');
        if (showChatbar) {
            dispatch({
                field: 'showChatbar',
                value: showChatbar === 'true'
            });
        }
        const folders = sessionStorage.getItem('folders');
        if (folders) {
            dispatch({
                field: 'folders',
                value: JSON.parse(folders)
            });
        }
        const conversationHistory = sessionStorage.getItem('conversationHistory');
        if (conversationHistory) {
            const parsedConversationHistory = JSON.parse(conversationHistory);
            const cleanedConversationHistory = cleanConversationHistory(parsedConversationHistory);
            dispatch({
                field: 'conversations',
                value: cleanedConversationHistory
            });
        }
        const selectedConversation = sessionStorage.getItem('selectedConversation');
        if (selectedConversation) {
            const parsedSelectedConversation = JSON.parse(selectedConversation);
            const cleanedSelectedConversation = cleanSelectedConversation(parsedSelectedConversation);
            dispatch({
                field: 'selectedConversation',
                value: cleanedSelectedConversation
            });
        } else {
            // Create homepage conversation like sidebar does, but mark it as homepage conversation
            const homepageConversation = {
                id: uuidv4(),
                name: t('New Conversation'),
                messages: [],
                folderId: null,
                isHomepageConversation: true
            };
            const updatedConversations = [
                ...conversations,
                homepageConversation
            ];
            dispatch({
                field: 'selectedConversation',
                value: homepageConversation
            });
            dispatch({
                field: 'conversations',
                value: updatedConversations
            });
            saveConversation(homepageConversation);
            saveConversations(updatedConversations);
        }
    }, []); // Only run once on mount
    // Handle external theme prop changes separately
    useEffect(()=>{
        // Handle external theme prop changes
        if (externalTheme && externalTheme !== lastExternalThemeRef.current) {
            lastExternalThemeRef.current = externalTheme;
            isExternalThemeUpdateRef.current = true;
            dispatch({
                field: 'lightMode',
                value: externalTheme
            });
        }
    }, [
        externalTheme
    ]);
    // Handle theme changes - prevent internal changes from propagating to consumer app
    useEffect(()=>{
        // If this is an external theme update, don't notify parent
        if (isExternalThemeUpdateRef.current) {
            isExternalThemeUpdateRef.current = false;
            return;
        }
        // REMOVED: Don't call onThemeChange for internal theme changes to prevent conflicts
        // This ensures one-way data binding - external theme prop controls internal state,
        // but internal changes don't propagate back to consumer app via onThemeChange
        // Only save to sessionStorage if not externally controlled
        if (!externalTheme) {
            sessionStorage.setItem('lightMode', lightMode);
        }
    }, [
        lightMode,
        externalTheme
    ]);
    // Memoize context value to prevent unnecessary re-renders of consumers
    const homeContextValue = useMemo(()=>({
            ...contextValue,
            handleNewConversation,
            handleCreateFolder,
            handleDeleteFolder,
            handleUpdateFolder,
            handleSelectConversation,
            handleUpdateConversation
        }), [
        contextValue,
        handleNewConversation,
        handleCreateFolder,
        handleDeleteFolder,
        handleUpdateFolder,
        handleSelectConversation,
        handleUpdateConversation
    ]);
    return /*#__PURE__*/ _jsxs(HomeContext.Provider, {
        value: homeContextValue,
        children: [
            renderApplicationHead && /*#__PURE__*/ _jsxs(Head, {
                children: [
                    /*#__PURE__*/ _jsx("title", {
                        children: APPLICATION_NAME
                    }),
                    /*#__PURE__*/ _jsx("meta", {
                        name: "description",
                        content: "ChatGPT but better."
                    }),
                    /*#__PURE__*/ _jsx("meta", {
                        name: "viewport",
                        content: "height=device-height ,width=device-width, initial-scale=1, user-scalable=no"
                    }),
                    /*#__PURE__*/ _jsx("link", {
                        rel: "icon",
                        href: "/favicon.ico"
                    })
                ]
            }),
            selectedConversation && /*#__PURE__*/ _jsxs("main", {
                className: `flex h-screen w-screen flex-col text-sm text-white dark:text-white ${lightMode} ${className}`,
                style: style,
                children: [
                    /*#__PURE__*/ _jsx("div", {
                        className: "fixed top-0 w-full sm:hidden",
                        children: /*#__PURE__*/ _jsx(Navbar, {
                            selectedConversation: selectedConversation,
                            onNewConversation: handleNewConversation
                        })
                    }),
                    /*#__PURE__*/ _jsxs("div", {
                        className: "flex h-full w-full sm:pt-0",
                        children: [
                            /*#__PURE__*/ _jsx(Chatbar, {
                                renderControlsInLeftSidebar: renderControlsInLeftSidebar,
                                onControlsReady: onControlsReady
                            }),
                            /*#__PURE__*/ _jsx("div", {
                                className: "flex flex-1",
                                children: /*#__PURE__*/ _jsx(Chat, {})
                            })
                        ]
                    })
                ]
            })
        ]
    });
};
export default Home;

//# sourceMappingURL=home.js.map