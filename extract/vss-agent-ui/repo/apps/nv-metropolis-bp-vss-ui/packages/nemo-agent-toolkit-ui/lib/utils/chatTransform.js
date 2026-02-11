/**
 * Pure transformation functions for chat message processing
 * These functions have no side effects and are easily testable
 */ import { processIntermediateMessage } from "./app/helper";
/**
 * Determines if a WebSocket message should trigger content appending to assistant message
 * Only true for system_response_message with status=in_progress and non-empty text
 */ export function shouldAppendResponse(message) {
    if (message.type !== 'system_response_message') {
        return false;
    }
    const systemResponse = message;
    const text = systemResponse.content?.text;
    return systemResponse.status === 'in_progress' && Boolean(text && text.trim());
}
/**
 * Safely appends new text to existing assistant content
 * Replaces empty/placeholder content, concatenates to existing content
 * Note: Preserves whitespace to maintain proper formatting between content chunks
 */ export function appendAssistantText(previousContent, newText) {
    // Handle null/undefined inputs gracefully
    if (!previousContent) {
        previousContent = '';
    }
    if (!newText) {
        newText = '';
    }
    // Force string materialization to prevent race conditions
    void newText.length;
    const trimmedNew = newText.trim();
    const trimmedPrev = previousContent.trim();
    // If no new text (whitespace only), return previous
    if (!trimmedNew) {
        return previousContent;
    }
    // Replace empty string or placeholder content - preserve original newText with whitespace
    if (!trimmedPrev || trimmedPrev === 'FAIL') {
        return newText; // Return original with whitespace preserved
    }
    // Concatenate to existing content - preserve all whitespace
    return previousContent + newText;
}
/**
 * Merges intermediate steps immutably, respecting override settings
 */ export function mergeIntermediateSteps(existingSteps, incomingStep, intermediateStepOverride) {
    const stepWithIndex = {
        ...incomingStep,
        index: existingSteps.length || 0
    };
    return processIntermediateMessage(existingSteps, stepWithIndex, intermediateStepOverride);
}
/**
 * Immutably applies a message update to a conversation
 * Preserves conversation title update logic
 */ export function applyMessageUpdate(conversation, updatedMessages) {
    let updatedConversation = {
        ...conversation,
        messages: updatedMessages
    };
    // Update conversation title if it's still "New Conversation"
    const firstUserMessage = updatedMessages.find((m)=>m.role === 'user');
    if (firstUserMessage && firstUserMessage.content && updatedConversation.name === 'New Conversation') {
        updatedConversation = {
            ...updatedConversation,
            name: firstUserMessage.content.substring(0, 30)
        };
    }
    return updatedConversation;
}
/**
 * Creates a new assistant message immutably
 */ export function createAssistantMessage(id, parentId, content = '', intermediateSteps = [], humanInteractionMessages = [], errorMessages = []) {
    return {
        role: 'assistant',
        id,
        parentId,
        content,
        intermediateSteps,
        humanInteractionMessages,
        errorMessages,
        timestamp: Date.now()
    };
}
/**
 * Updates assistant message content immutably with proper content merging
 */ export function updateAssistantMessage(message, newContent, newIntermediateSteps) {
    return {
        ...message,
        content: newContent !== undefined ? newContent : message.content || '',
        intermediateSteps: newIntermediateSteps || message.intermediateSteps || [],
        timestamp: Date.now()
    };
}
/**
 * Determines if an assistant message should be rendered
 * Only render if it has content or intermediate steps
 */ export function shouldRenderAssistantMessage(message) {
    if (message.role !== 'assistant') {
        return true; // Always render non-assistant messages
    }
    const content = message.content;
    const hasContent = Boolean(content && content.trim());
    const hasIntermediateSteps = Boolean(message.intermediateSteps?.length);
    return hasContent || hasIntermediateSteps;
}
/**
 * Extracts the final content from a conversation for display
 */ export function extractConversationContent(conversation) {
    const lastMessage = conversation.messages[conversation.messages.length - 1];
    return lastMessage?.content || '';
}

//# sourceMappingURL=chatTransform.js.map