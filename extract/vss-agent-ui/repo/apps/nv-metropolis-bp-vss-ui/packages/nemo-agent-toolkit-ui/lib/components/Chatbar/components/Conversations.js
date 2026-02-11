import { jsx as _jsx } from "react/jsx-runtime";
import { ConversationComponent } from "./Conversation";
export const Conversations = ({ conversations })=>{
    return /*#__PURE__*/ _jsx("div", {
        className: "flex w-full flex-col gap-1",
        children: conversations.filter((conversation)=>!conversation.folderId).slice().reverse().map((conversation)=>/*#__PURE__*/ _jsx(ConversationComponent, {
                conversation: conversation
            }, conversation.id))
    });
};

//# sourceMappingURL=Conversations.js.map