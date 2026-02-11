import { jsx as _jsx } from "react/jsx-runtime";
import { useMemo } from "react";
import { useTranslation } from "next-i18next";
import HomeContext from "../../../pages/api/home/home.context";
import ChatbarContext from "../Chatbar.context";
import { SidebarInner } from "../../Sidebar/SidebarInner";
import { ChatbarSettings } from "./ChatbarSettings";
import { Conversations } from "./Conversations";
import { ChatFolders } from "./ChatFolders";
/**
 * Complete chat sidebar content component.
 * This is a pre-composed component that includes all chat sidebar elements:
 * - Action controls (New Chat, Folder, Search) at the top
 * - Conversations list in the middle (scrollable)
 * - Settings controls (Clear, Import, Export, Settings) at the bottom
 * 
 * Use this component when you want to render the complete chat sidebar
 * in an external container (e.g., main app sidebar).
 * 
 * Requires homeContext and chatbarContext for proper reactivity.
 */ export const ChatSidebarContent = ({ searchTerm, onSearchTermChange, onNewConversation, onCreateFolder, conversations, filteredConversations, onClearConversations, onImportConversations, onExportData, homeContext, chatbarContext })=>{
    const { t } = useTranslation('sidebar');
    // Memoize conversations component to prevent unnecessary re-renders
    const itemComponent = useMemo(()=>{
        if (!homeContext || !chatbarContext) return null;
        return /*#__PURE__*/ _jsx(HomeContext.Provider, {
            value: homeContext,
            children: /*#__PURE__*/ _jsx(ChatbarContext.Provider, {
                value: chatbarContext,
                children: /*#__PURE__*/ _jsx(Conversations, {
                    conversations: filteredConversations
                })
            })
        });
    }, [
        homeContext,
        chatbarContext,
        filteredConversations
    ]);
    // Memoize folders component
    const folderComponent = useMemo(()=>{
        if (!homeContext || !chatbarContext) return null;
        return /*#__PURE__*/ _jsx(HomeContext.Provider, {
            value: homeContext,
            children: /*#__PURE__*/ _jsx(ChatbarContext.Provider, {
                value: chatbarContext,
                children: /*#__PURE__*/ _jsx(ChatFolders, {
                    searchTerm: searchTerm
                })
            })
        });
    }, [
        homeContext,
        chatbarContext,
        searchTerm
    ]);
    // Memoize footer component
    const footerComponent = useMemo(()=>{
        const content = /*#__PURE__*/ _jsx(ChatbarSettings, {
            conversations: conversations,
            onClearConversations: onClearConversations,
            onImportConversations: onImportConversations,
            onExportData: onExportData
        });
        if (homeContext) {
            return /*#__PURE__*/ _jsx(HomeContext.Provider, {
                value: homeContext,
                children: content
            });
        }
        return content;
    }, [
        homeContext,
        conversations,
        onClearConversations,
        onImportConversations,
        onExportData
    ]);
    return /*#__PURE__*/ _jsx(SidebarInner, {
        addItemButtonTitle: t('New chat'),
        items: filteredConversations,
        itemComponent: itemComponent,
        folderComponent: folderComponent,
        footerComponent: footerComponent,
        searchTerm: searchTerm,
        handleSearchTerm: onSearchTermChange,
        handleCreateItem: onNewConversation,
        handleCreateFolder: onCreateFolder,
        enableDragDrop: false
    });
};

//# sourceMappingURL=ChatSidebarContent.js.map