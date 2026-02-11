import toast from "react-hot-toast";
export const updateConversation = (updatedConversation, allConversations)=>{
    const updatedConversations = allConversations.map((c)=>{
        if (c.id === updatedConversation.id) {
            return updatedConversation;
        }
        return c;
    });
    saveConversation(updatedConversation);
    saveConversations(updatedConversations);
    return {
        single: updatedConversation,
        all: updatedConversations
    };
};
export const saveConversation = (conversation)=>{
    try {
        sessionStorage.setItem('selectedConversation', JSON.stringify(conversation));
    } catch (error) {
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
            console.log('Storage quota exceeded, cannot save conversation.');
            toast.error('Storage quota exceeded, cannot save conversation.');
        }
    }
};
export const saveConversations = (conversations)=>{
    try {
        sessionStorage.setItem('conversationHistory', JSON.stringify(conversations));
    } catch (error) {
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
            console.log('Storage quota exceeded, cannot save conversations.');
            toast.error('Storage quota exceeded, cannot save conversation.');
        }
    }
};

//# sourceMappingURL=conversation.js.map