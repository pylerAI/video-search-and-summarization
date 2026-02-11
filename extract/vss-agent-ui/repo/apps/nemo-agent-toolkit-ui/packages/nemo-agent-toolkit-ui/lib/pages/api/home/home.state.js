import { env } from "next-runtime-env";
const getDefaultLightMode = ()=>{
    const envValue1 = env('NEXT_PUBLIC_DARK_THEME_DEFAULT');
    const envValue2 = process?.env?.NEXT_PUBLIC_DARK_THEME_DEFAULT;
    // Be very explicit about checking for the exact string 'true'
    // Convert to string first to handle any unexpected types
    const envString1 = String(envValue1 || '');
    const envString2 = String(envValue2 || '');
    let isLightMode = true;
    if (envString1 === 'true' || envString2 === 'true') {
        isLightMode = false;
    }
    return isLightMode ? 'light' : 'dark';
};
const getDefaultShowChatbar = ()=>{
    const envValue1 = env('NEXT_PUBLIC_SIDE_CHATBAR_COLLAPSED');
    const envValue2 = process?.env?.NEXT_PUBLIC_SIDE_CHATBAR_COLLAPSED;
    // Convert to string first to handle any unexpected types
    const envString1 = String(envValue1 || '');
    const envString2 = String(envValue2 || '');
    // If environment variable is explicitly set to 'true', chatbar should be collapsed (hidden)
    // Otherwise default to showing the chatbar (not collapsed)
    if (envString1 === 'true' || envString2 === 'true') {
        return false; // Collapsed = true means showChatbar = false
    }
    return true; // Default to showing chatbar (not collapsed)
};
export const initialState = {
    loading: false,
    lightMode: getDefaultLightMode(),
    messageIsStreaming: false,
    folders: [],
    conversations: [],
    selectedConversation: undefined,
    currentMessage: undefined,
    showChatbar: getDefaultShowChatbar(),
    currentFolder: undefined,
    messageError: false,
    searchTerm: '',
    chatHistory: env('NEXT_PUBLIC_CHAT_HISTORY_DEFAULT_ON') === 'true' || process?.env?.NEXT_PUBLIC_CHAT_HISTORY_DEFAULT_ON === 'true' ? true : false,
    chatCompletionURL: env('NEXT_PUBLIC_HTTP_CHAT_COMPLETION_URL') || process?.env?.NEXT_PUBLIC_HTTP_CHAT_COMPLETION_URL || 'http://127.0.0.1:8000/chat/stream',
    webSocketMode: env('NEXT_PUBLIC_WEB_SOCKET_DEFAULT_ON') === 'true' || process?.env?.NEXT_PUBLIC_WEB_SOCKET_DEFAULT_ON === 'true' ? true : false,
    webSocketConnected: false,
    webSocketURL: env('NEXT_PUBLIC_WEBSOCKET_CHAT_COMPLETION_URL') || process?.env?.NEXT_PUBLIC_WEBSOCKET_CHAT_COMPLETION_URL || 'ws://127.0.0.1:8000/websocket',
    webSocketSchema: 'chat_stream',
    webSocketSchemas: [
        'chat_stream',
        'chat',
        'generate_stream',
        'generate'
    ],
    enableIntermediateSteps: env('NEXT_PUBLIC_ENABLE_INTERMEDIATE_STEPS') === 'true' || process?.env?.NEXT_PUBLIC_ENABLE_INTERMEDIATE_STEPS === 'true' ? true : false,
    expandIntermediateSteps: false,
    intermediateStepOverride: true,
    autoScroll: true,
    agentApiUrlBase: env('NEXT_PUBLIC_AGENT_API_URL_BASE') || process?.env?.NEXT_PUBLIC_AGENT_API_URL_BASE || '',
    additionalConfig: {},
    customAgentParamsJson: env('NEXT_PUBLIC_CHAT_API_CUSTOM_AGENT_PARAMS_JSON') || process?.env?.NEXT_PUBLIC_CHAT_API_CUSTOM_AGENT_PARAMS_JSON || '',
    chatUploadFileEnabled: env('NEXT_PUBLIC_CHAT_UPLOAD_FILE_ENABLE') === 'true' || process?.env?.NEXT_PUBLIC_CHAT_UPLOAD_FILE_ENABLE === 'true' ? true : false,
    chatUploadFileConfigTemplateJson: env('NEXT_PUBLIC_CHAT_UPLOAD_FILE_CONFIG_TEMPLATE_JSON') || process?.env?.NEXT_PUBLIC_CHAT_UPLOAD_FILE_CONFIG_TEMPLATE_JSON || '',
    chatUploadFileMetadataEnabled: env('NEXT_PUBLIC_CHAT_UPLOAD_FILE_METADATA_ENABLED') === 'true' || process?.env?.NEXT_PUBLIC_CHAT_UPLOAD_FILE_METADATA_ENABLED === 'true' ? true : false,
    chatUploadFileHiddenMessageTemplate: env('NEXT_PUBLIC_CHAT_UPLOAD_FILE_HIDDEN_MESSAGE_TEMPLATE') || process?.env?.NEXT_PUBLIC_CHAT_UPLOAD_FILE_HIDDEN_MESSAGE_TEMPLATE || '',
    themeChangeButtonEnabled: env('NEXT_PUBLIC_SHOW_THEME_TOGGLE_BUTTON') !== 'false' && process?.env?.NEXT_PUBLIC_SHOW_THEME_TOGGLE_BUTTON !== 'false'
};

//# sourceMappingURL=home.state.js.map