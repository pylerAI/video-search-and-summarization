import { jsx as _jsx } from "react/jsx-runtime";
import { useCallback, useContext, useEffect, useMemo } from "react";
import { useTranslation } from "next-i18next";
import { useCreateReducer } from "../../hooks/useCreateReducer";
import { saveConversation, saveConversations } from "../../utils/app/conversation";
import { saveFolders } from "../../utils/app/folders";
import { exportData, importData } from "../../utils/app/importExport";
import HomeContext from "../../pages/api/home/home.context";
import { ChatFolders } from "./components/ChatFolders";
import { ChatbarSettings } from "./components/ChatbarSettings";
import { Conversations } from "./components/Conversations";
import Sidebar from "../Sidebar";
import ChatbarContext from "./Chatbar.context";
import { initialState } from "./Chatbar.state";
import { v4 as uuidv4 } from "uuid";
export const Chatbar = ({ renderControlsInLeftSidebar = false, onControlsReady })=>{
    const { t } = useTranslation('sidebar');
    const chatBarContextValue = useCreateReducer({
        initialState
    });
    const homeContext = useContext(HomeContext);
    // Extract values (with defaults if context is undefined)
    const { state, dispatch: homeDispatch, handleCreateFolder, handleNewConversation, handleUpdateConversation } = homeContext || {};
    const { conversations = [], showChatbar = true, folders = [], lightMode = 'dark' } = state || {};
    const { state: { searchTerm, filteredConversations }, dispatch: chatDispatch } = chatBarContextValue;
    const handleExportData = useCallback(()=>{
        exportData();
    }, []);
    const handleImportConversations = useCallback((data)=>{
        const { history, folders, prompts } = importData(data);
        homeDispatch({
            field: 'conversations',
            value: history
        });
        homeDispatch({
            field: 'selectedConversation',
            value: history[history.length - 1]
        });
        homeDispatch({
            field: 'folders',
            value: folders
        });
        homeDispatch({
            field: 'prompts',
            value: prompts
        });
        window.location.reload();
    }, [
        homeDispatch
    ]);
    const handleClearConversations = useCallback(()=>{
        homeDispatch({
            field: 'selectedConversation',
            value: {
                id: uuidv4(),
                name: t('New Conversation'),
                messages: [],
                folderId: null
            }
        });
        homeDispatch({
            field: 'conversations',
            value: []
        });
        sessionStorage.removeItem('conversationHistory');
        sessionStorage.removeItem('selectedConversation');
        const updatedFolders = folders.filter((f)=>f.type !== 'chat');
        homeDispatch({
            field: 'folders',
            value: updatedFolders
        });
        saveFolders(updatedFolders);
    }, [
        homeDispatch,
        folders,
        t
    ]);
    const handleDeleteConversation = useCallback((conversation)=>{
        const updatedConversations = conversations.filter((c)=>c.id !== conversation.id);
        homeDispatch({
            field: 'conversations',
            value: updatedConversations
        });
        chatDispatch({
            field: 'searchTerm',
            value: ''
        });
        saveConversations(updatedConversations);
        if (updatedConversations.length > 0) {
            homeDispatch({
                field: 'selectedConversation',
                value: updatedConversations[updatedConversations.length - 1]
            });
            saveConversation(updatedConversations[updatedConversations.length - 1]);
        } else {
            homeDispatch({
                field: 'selectedConversation',
                value: {
                    id: uuidv4(),
                    name: t('New Conversation'),
                    messages: [],
                    folderId: null
                }
            });
            sessionStorage.removeItem('selectedConversation');
        }
    }, [
        conversations,
        homeDispatch,
        chatDispatch,
        t
    ]);
    const handleToggleChatbar = ()=>{
        homeDispatch({
            field: 'showChatbar',
            value: !showChatbar
        });
        // Restore sessionStorage persistence - allow user to override environment variable during session
        sessionStorage.setItem('showChatbar', JSON.stringify(!showChatbar));
    };
    const handleDrop = (e)=>{
        if (e.dataTransfer) {
            const conversation = JSON.parse(e.dataTransfer.getData('conversation'));
            handleUpdateConversation(conversation, {
                key: 'folderId',
                value: 0
            });
            chatDispatch({
                field: 'searchTerm',
                value: ''
            });
            e.target.style.background = 'none';
        }
    };
    useEffect(()=>{
        // Filter out homepage conversations that haven't had their first message sent
        const visibleConversations = conversations.filter((conversation)=>!conversation.isHomepageConversation);
        if (searchTerm) {
            chatDispatch({
                field: 'filteredConversations',
                value: visibleConversations.filter((conversation)=>{
                    const searchable = conversation.name.toLocaleLowerCase() + ' ' + conversation.messages.map((message)=>message.content).join(' ');
                    return searchable.toLowerCase().includes(searchTerm.toLowerCase());
                })
            });
        } else {
            chatDispatch({
                field: 'filteredConversations',
                value: visibleConversations
            });
        }
    }, [
        searchTerm,
        conversations,
        chatDispatch
    ]);
    // Create stable context values for external rendering (MUST be before any early returns)
    const chatbarContextForExternal = useMemo(()=>({
            ...chatBarContextValue,
            handleDeleteConversation,
            handleClearConversations,
            handleImportConversations,
            handleExportData
        }), [
        chatBarContextValue,
        handleDeleteConversation,
        handleClearConversations,
        handleImportConversations,
        handleExportData
    ]);
    const homeContextForExternal = useMemo(()=>{
        if (!homeContext) return null;
        return {
            state: homeContext.state,
            dispatch: homeContext.dispatch,
            handleNewConversation,
            handleCreateFolder,
            handleDeleteFolder: homeContext.handleDeleteFolder,
            handleUpdateFolder: homeContext.handleUpdateFolder,
            handleSelectConversation: homeContext.handleSelectConversation,
            handleUpdateConversation
        };
    }, [
        homeContext,
        // Include state values to ensure recalculation when they change
        // (homeContext reference might stay same when values change)
        state,
        handleNewConversation,
        handleCreateFolder,
        handleUpdateConversation
    ]);
    // Memoize search term change handler to prevent recreation on every render
    const handleSearchTermChange = useCallback((term)=>chatDispatch({
            field: 'searchTerm',
            value: term
        }), [
        chatDispatch
    ]);
    // Memoize create folder handler
    const handleCreateFolderForChat = useCallback(()=>handleCreateFolder(t('New folder'), 'chat'), [
        handleCreateFolder,
        t
    ]);
    // Provide control handlers to parent if specified (MUST be before any early returns)
    // This effect runs whenever onControlsReady or data changes
    useEffect(()=>{
        // Only call onControlsReady if all required conditions are met
        if (onControlsReady && renderControlsInLeftSidebar && lightMode && homeContextForExternal) {
            onControlsReady({
                conversations,
                filteredConversations,
                lightMode,
                searchTerm,
                onSearchTermChange: handleSearchTermChange,
                onNewConversation: handleNewConversation,
                onCreateFolder: handleCreateFolderForChat,
                onClearConversations: handleClearConversations,
                onImportConversations: handleImportConversations,
                onExportData: handleExportData,
                // Pass contexts for internal rendering (enables reactivity)
                homeContext: homeContextForExternal,
                chatbarContext: chatbarContextForExternal
            });
        }
    }, [
        onControlsReady,
        renderControlsInLeftSidebar,
        lightMode,
        conversations,
        filteredConversations,
        folders,
        searchTerm,
        chatbarContextForExternal,
        homeContextForExternal,
        handleNewConversation,
        handleCreateFolderForChat,
        handleClearConversations,
        handleImportConversations,
        handleExportData,
        handleSearchTermChange
    ]);
    // Guard against undefined context - return null if not available (AFTER all hooks)
    if (!homeContext) {
        return null;
    }
    // If controls are being rendered in left sidebar externally, don't render the chatbar sidebar at all
    if (renderControlsInLeftSidebar) {
        return null;
    }
    return /*#__PURE__*/ _jsx(ChatbarContext.Provider, {
        value: {
            ...chatBarContextValue,
            handleDeleteConversation,
            handleClearConversations,
            handleImportConversations,
            handleExportData
        },
        children: /*#__PURE__*/ _jsx(Sidebar, {
            side: 'left',
            isOpen: showChatbar,
            addItemButtonTitle: t('New chat'),
            itemComponent: /*#__PURE__*/ _jsx(Conversations, {
                conversations: filteredConversations
            }),
            folderComponent: /*#__PURE__*/ _jsx(ChatFolders, {
                searchTerm: searchTerm
            }),
            items: filteredConversations,
            searchTerm: searchTerm,
            handleSearchTerm: (searchTerm)=>chatDispatch({
                    field: 'searchTerm',
                    value: searchTerm
                }),
            toggleOpen: handleToggleChatbar,
            handleCreateItem: handleNewConversation,
            handleCreateFolder: ()=>handleCreateFolder(t('New folder'), 'chat'),
            handleDrop: handleDrop,
            footerComponent: /*#__PURE__*/ _jsx(ChatbarSettings, {})
        })
    });
};

//# sourceMappingURL=Chatbar.js.map