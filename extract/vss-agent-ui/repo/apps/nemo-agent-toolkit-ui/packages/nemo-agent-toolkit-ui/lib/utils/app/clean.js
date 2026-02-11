export const cleanSelectedConversation = (conversation)=>{
    let updatedConversation = conversation;
    if (!updatedConversation.folderId) {
        updatedConversation = {
            ...updatedConversation,
            folderId: updatedConversation.folderId || null
        };
    }
    if (!updatedConversation.messages) {
        updatedConversation = {
            ...updatedConversation,
            messages: updatedConversation.messages || []
        };
    }
    return updatedConversation;
};
export const cleanConversationHistory = (history)=>{
    if (!Array.isArray(history)) {
        console.warn('history is not an array. Returning an empty array.');
        return [];
    }
    return history.reduce((acc, conversation)=>{
        try {
            if (!conversation.folderId) {
                conversation.folderId = null;
            }
            if (!conversation.messages) {
                conversation.messages = [];
            }
            acc.push(conversation);
            return acc;
        } catch (error) {
            console.warn(`error while cleaning conversations' history. Removing culprit`, error);
        }
        return acc;
    }, []);
};

//# sourceMappingURL=clean.js.map