import { memo } from "react";
import { ChatMessage } from "./ChatMessage";
import isEqual from "lodash/isEqual";
export const MemoizedChatMessage = /*#__PURE__*/ memo(ChatMessage, (prevProps, nextProps)=>{
    // Component should NOT re-render if all props are the same
    const messageEqual = isEqual(prevProps.message, nextProps.message);
    const messageIndexEqual = prevProps.messageIndex === nextProps.messageIndex;
    const onEditEqual = prevProps.onEdit === nextProps.onEdit;
    const onDeleteEqual = prevProps.onDelete === nextProps.onDelete;
    const isStreamingEqual = prevProps.isStreaming === nextProps.isStreaming;
    // Note: totalMessageCount is intentionally excluded from comparison
    // It's only used for edit actions (calculating deleteCount), not for rendering
    // Including it would cause all messages to re-render when a new message is added
    // Return true if all props are equal (don't re-render)
    return messageEqual && messageIndexEqual && onEditEqual && onDeleteEqual && isStreamingEqual;
});

//# sourceMappingURL=MemoizedChatMessage.js.map