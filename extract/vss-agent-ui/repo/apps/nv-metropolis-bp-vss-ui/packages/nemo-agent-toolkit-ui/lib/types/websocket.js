/**
 * WebSocket message type definitions and type guards
 * Provides type safety for WebSocket message handling
 */ // Base interface for all WebSocket messages
// Type guards for WebSocket messages
export function isSystemResponseMessage(message) {
    return message?.type === 'system_response_message';
}
export function isSystemResponseInProgress(message) {
    return isSystemResponseMessage(message) && message.status === 'in_progress';
}
export function isSystemResponseComplete(message) {
    return isSystemResponseMessage(message) && message.status === 'complete';
}
export function isSystemIntermediateMessage(message) {
    return message?.type === 'system_intermediate_message';
}
export function isSystemInteractionMessage(message) {
    return message?.type === 'system_interaction_message';
}
export function isErrorMessage(message) {
    return message?.type === 'error';
}
export function isOAuthConsentMessage(message) {
    return isSystemInteractionMessage(message) && message.content?.input_type === 'oauth_consent';
}
/**
 * Validates that a message has a valid conversation ID
 */ export function validateConversationId(message) {
    if (!message || typeof message !== 'object') {
        return false;
    }
    // conversation_id must be present and be a non-empty string
    return typeof message.conversation_id === 'string' && message.conversation_id.trim().length > 0;
}
/**
 * Validates that a message has the minimum required structure
 */ export function validateWebSocketMessage(message) {
    if (!message || typeof message !== 'object') {
        return false;
    }
    return typeof message.type === 'string' && [
        'system_response_message',
        'system_intermediate_message',
        'system_interaction_message',
        'error'
    ].includes(message.type);
}
/**
 * Validates WebSocket message structure AND conversation ID presence
 * Throws descriptive errors for debugging
 */ export function validateWebSocketMessageWithConversationId(message) {
    // First check basic message structure
    if (!validateWebSocketMessage(message)) {
        throw new Error(`Invalid WebSocket message structure. Expected message with valid 'type' field, got: ${JSON.stringify(message)}`);
    }
    // Then check conversation ID
    if (!validateConversationId(message)) {
        throw new Error(`WebSocket message missing required conversation_id. Message type: ${message.type}, message: ${JSON.stringify(message)}`);
    }
    return true;
}
/**
 * Extracts OAuth URL from interaction message safely
 */ export function extractOAuthUrl(message) {
    if (!isOAuthConsentMessage(message)) {
        return null;
    }
    return message.content?.oauth_url || message.content?.redirect_url || message.content?.text || null;
}
/**
 * Determines if a response should append content (type guards + content check)
 */ export function shouldAppendResponseContent(message) {
    return isSystemResponseInProgress(message) && Boolean(message.content?.text?.trim());
}

//# sourceMappingURL=websocket.js.map