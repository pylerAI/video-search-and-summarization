import { jsx as _jsx } from "react/jsx-runtime";
import { useContext } from "react";
import HomeContext from "../../../pages/api/home/home.context";
import Folder from "../../Folder";
import { ConversationComponent } from "./Conversation";
export const ChatFolders = ({ searchTerm })=>{
    const homeContext = useContext(HomeContext);
    // Guard against undefined context - component might be rendered outside HomeContext.Provider
    if (!homeContext) {
        return null;
    }
    const { state: { folders, conversations }, handleUpdateConversation } = homeContext;
    const handleDrop = (e, folder)=>{
        if (e.dataTransfer) {
            const conversation = JSON.parse(e.dataTransfer.getData('conversation'));
            handleUpdateConversation(conversation, {
                key: 'folderId',
                value: folder.id
            });
        }
    };
    const ChatFolders = (currentFolder)=>{
        return conversations && conversations.filter((conversation)=>conversation.folderId === currentFolder.id).map((conversation)=>/*#__PURE__*/ _jsx("div", {
                className: "ml-5 gap-2 border-l pl-2",
                children: /*#__PURE__*/ _jsx(ConversationComponent, {
                    conversation: conversation
                })
            }, conversation.id));
    };
    return /*#__PURE__*/ _jsx("div", {
        className: "flex w-full flex-col pt-2",
        children: folders.filter((folder)=>folder.type === 'chat').sort((a, b)=>a.name.localeCompare(b.name)).map((folder)=>/*#__PURE__*/ _jsx(Folder, {
                searchTerm: searchTerm,
                currentFolder: folder,
                handleDrop: handleDrop,
                folderComponent: ChatFolders(folder)
            }, folder.id))
    });
};

//# sourceMappingURL=ChatFolders.js.map