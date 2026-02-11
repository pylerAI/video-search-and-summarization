import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { IconCheck, IconTrash, IconX } from "@tabler/icons-react";
import { useState } from "react";
import { useTranslation } from "next-i18next";
import { SidebarButton } from "../../Sidebar/SidebarButton";
export const ClearConversations = ({ onClearConversations })=>{
    const [isConfirming, setIsConfirming] = useState(false);
    const { t } = useTranslation('sidebar');
    const handleClearConversations = ()=>{
        onClearConversations();
        setIsConfirming(false);
    };
    return isConfirming ? /*#__PURE__*/ _jsxs("div", {
        className: "flex w-full cursor-pointer items-center rounded-lg py-3 px-3 hover:bg-gray-200 dark:hover:bg-gray-500/10",
        children: [
            /*#__PURE__*/ _jsx(IconTrash, {
                size: 18,
                className: "text-gray-900 dark:text-white"
            }),
            /*#__PURE__*/ _jsx("div", {
                className: "ml-3 flex-1 text-left text-[12.5px] leading-3 text-gray-900 dark:text-white",
                children: t('Are you sure?')
            }),
            /*#__PURE__*/ _jsxs("div", {
                className: "flex w-[40px]",
                children: [
                    /*#__PURE__*/ _jsx(IconCheck, {
                        className: "ml-auto mr-1 min-w-[20px] text-gray-500 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-neutral-100",
                        size: 18,
                        onClick: (e)=>{
                            e.stopPropagation();
                            handleClearConversations();
                        }
                    }),
                    /*#__PURE__*/ _jsx(IconX, {
                        className: "ml-auto min-w-[20px] text-gray-500 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-neutral-100",
                        size: 18,
                        onClick: (e)=>{
                            e.stopPropagation();
                            setIsConfirming(false);
                        }
                    })
                ]
            })
        ]
    }) : /*#__PURE__*/ _jsx(SidebarButton, {
        text: t('Clear conversations'),
        icon: /*#__PURE__*/ _jsx(IconTrash, {
            size: 18
        }),
        onClick: ()=>setIsConfirming(true)
    });
};

//# sourceMappingURL=ClearConversations.js.map