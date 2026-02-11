import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { IconFileExport, IconSettings } from "@tabler/icons-react";
import { useContext, useState } from "react";
import { useTranslation } from "next-i18next";
import HomeContext from "../../../pages/api/home/home.context";
import { SettingDialog } from "../../Settings/SettingDialog";
import { Import } from "../../Settings/Import";
import { SidebarButton } from "../../Sidebar/SidebarButton";
import ChatbarContext from "../Chatbar.context";
import { ClearConversations } from "./ClearConversations";
export const ChatbarSettings = ({ conversations: conversationsProp, onClearConversations: onClearConversationsProp, onImportConversations: onImportConversationsProp, onExportData: onExportDataProp } = {})=>{
    const { t } = useTranslation('sidebar');
    const [isSettingDialogOpen, setIsSettingDialog] = useState(false);
    const homeContext = useContext(HomeContext);
    const chatbarContext = useContext(ChatbarContext);
    // Use props if provided, otherwise fall back to context
    const conversations = conversationsProp ?? homeContext?.state?.conversations ?? [];
    const handleClearConversations = onClearConversationsProp ?? chatbarContext?.handleClearConversations;
    const handleImportConversations = onImportConversationsProp ?? chatbarContext?.handleImportConversations;
    const handleExportData = onExportDataProp ?? chatbarContext?.handleExportData;
    // If neither props nor context available, don't render
    if (!handleClearConversations || !handleImportConversations || !handleExportData) {
        return null;
    }
    return /*#__PURE__*/ _jsxs("div", {
        className: "flex flex-col items-center space-y-1 border-t border-gray-300 dark:border-white/20 pt-1 text-sm",
        children: [
            conversations.length > 0 ? /*#__PURE__*/ _jsx(ClearConversations, {
                onClearConversations: handleClearConversations
            }) : null,
            /*#__PURE__*/ _jsx(Import, {
                onImport: handleImportConversations
            }),
            /*#__PURE__*/ _jsx(SidebarButton, {
                text: t('Export data'),
                icon: /*#__PURE__*/ _jsx(IconFileExport, {
                    size: 18
                }),
                onClick: ()=>handleExportData()
            }),
            homeContext && /*#__PURE__*/ _jsxs(_Fragment, {
                children: [
                    /*#__PURE__*/ _jsx(SidebarButton, {
                        text: t('Settings'),
                        icon: /*#__PURE__*/ _jsx(IconSettings, {
                            size: 18
                        }),
                        onClick: ()=>setIsSettingDialog(true)
                    }),
                    /*#__PURE__*/ _jsx(SettingDialog, {
                        open: isSettingDialogOpen,
                        onClose: ()=>{
                            setIsSettingDialog(false);
                        }
                    })
                ]
            })
        ]
    });
};

//# sourceMappingURL=ChatbarSettings.js.map