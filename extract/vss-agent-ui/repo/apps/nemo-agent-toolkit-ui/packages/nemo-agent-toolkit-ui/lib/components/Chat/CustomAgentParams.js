import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useEffect, useRef, useState } from "react";
const generateId = ()=>Math.random().toString(36).substring(2, 11);
// Reusable input styles
const inputClass = "w-full px-2 py-1.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#76b900]";
export const CustomAgentParams = ({ isOpen, onClose, fields, onFieldsChange })=>{
    // Handle escape key
    useEffect(()=>{
        if (!isOpen) return;
        const handleEscape = (event)=>{
            if (event.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEscape);
        return ()=>{
            document.removeEventListener('keydown', handleEscape);
        };
    }, [
        isOpen,
        onClose
    ]);
    const handleFieldChange = useCallback((id, value)=>{
        onFieldsChange(fields.map((f)=>f.id === id ? {
                ...f,
                value
            } : f));
    }, [
        fields,
        onFieldsChange
    ]);
    const renderValueInput = useCallback((field)=>{
        // Check if field is changeable (default: true)
        const isChangeable = field.changeable !== false;
        const disabledClass = !isChangeable ? 'opacity-60 cursor-not-allowed' : '';
        switch(field.type){
            case 'boolean':
                return /*#__PURE__*/ _jsx("button", {
                    type: "button",
                    title: field['tooltip-info'],
                    disabled: !isChangeable,
                    onClick: ()=>isChangeable && handleFieldChange(field.id, !field.value),
                    className: `relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${field.value ? 'bg-[#76b900]' : 'bg-gray-300 dark:bg-gray-600'} ${disabledClass}`,
                    children: /*#__PURE__*/ _jsx("span", {
                        className: `inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${field.value ? 'translate-x-6' : 'translate-x-1'}`
                    })
                });
            case 'select':
                return /*#__PURE__*/ _jsx("select", {
                    title: field['tooltip-info'],
                    disabled: !isChangeable,
                    value: field.value,
                    onChange: (e)=>handleFieldChange(field.id, e.target.value),
                    className: `${inputClass} ${disabledClass}`,
                    children: field.options?.map((option)=>/*#__PURE__*/ _jsx("option", {
                            value: option,
                            children: option
                        }, option))
                });
            case 'number':
                return /*#__PURE__*/ _jsx("input", {
                    type: "number",
                    title: field['tooltip-info'],
                    disabled: !isChangeable,
                    step: "any",
                    value: field.value,
                    onChange: (e)=>handleFieldChange(field.id, parseFloat(e.target.value) || 0),
                    className: `${inputClass} ${disabledClass}`
                });
            default:
                return /*#__PURE__*/ _jsx("input", {
                    type: "text",
                    title: field['tooltip-info'],
                    disabled: !isChangeable,
                    value: field.value,
                    onChange: (e)=>handleFieldChange(field.id, e.target.value),
                    className: `${inputClass} ${disabledClass}`
                });
        }
    }, [
        handleFieldChange
    ]);
    if (!isOpen) return null;
    return /*#__PURE__*/ _jsxs(_Fragment, {
        children: [
            /*#__PURE__*/ _jsx("div", {
                className: "fixed inset-0 z-40",
                onClick: onClose
            }),
            /*#__PURE__*/ _jsx("div", {
                className: "absolute bottom-full right-0 mb-2 min-w-60 max-w-80 bg-white dark:bg-[#2d2d30] rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden",
                children: /*#__PURE__*/ _jsx("div", {
                    className: "p-4 space-y-4 max-h-[400px] overflow-y-auto",
                    children: fields.length === 0 ? /*#__PURE__*/ _jsx("p", {
                        className: "text-sm text-gray-500 dark:text-gray-400 text-center py-4",
                        children: "No parameters configured."
                    }) : fields.map((field)=>/*#__PURE__*/ _jsxs("div", {
                            className: "space-y-1.5",
                            children: [
                                /*#__PURE__*/ _jsxs("div", {
                                    className: "flex items-center justify-between",
                                    children: [
                                        /*#__PURE__*/ _jsx("label", {
                                            className: "text-sm font-medium text-gray-700 dark:text-gray-300",
                                            title: field['tooltip-info'],
                                            children: field.label
                                        }),
                                        field.type === 'boolean' && renderValueInput(field)
                                    ]
                                }),
                                field.type !== 'boolean' && /*#__PURE__*/ _jsx("div", {
                                    children: renderValueInput(field)
                                })
                            ]
                        }, field.id))
                })
            })
        ]
    });
};
// Helper function to convert fields to payload object
export const fieldsToParams = (fields)=>(fields || []).reduce((acc, field)=>{
        if (field.name) {
            acc[field.name] = field.value;
        }
        return acc;
    }, {});
// Parse JSON string to ParamField array
// Format: { "params": [{ "name": "...", "label": "...", "type": "...", "default-value": ... }] }
export const parseParamsJson = (jsonString)=>{
    try {
        if (!jsonString) return [];
        const parsed = JSON.parse(jsonString);
        if (!parsed.params || !Array.isArray(parsed.params)) return [];
        return parsed.params.map((item)=>({
                ...item,
                id: generateId(),
                value: item['default-value']
            }));
    } catch (e) {
        console.error('Failed to parse customAgentParamsJson:', e);
        return [];
    }
};
// Storage key for persisting custom agent params values
const STORAGE_KEY_CUSTOM_AGENT_PARAMS = 'customAgentParamsValues';
/**
 * Load saved param values from sessionStorage
 */ const loadParamValuesFromStorage = ()=>{
    if (typeof window === 'undefined') return {};
    try {
        const stored = sessionStorage.getItem(STORAGE_KEY_CUSTOM_AGENT_PARAMS);
        return stored ? JSON.parse(stored) : {};
    } catch (error) {
        console.warn('Failed to load custom agent params from sessionStorage:', error);
        return {};
    }
};
/**
 * Save param values to sessionStorage
 */ const saveParamValuesToStorage = (fields)=>{
    if (typeof window === 'undefined') return;
    try {
        sessionStorage.setItem(STORAGE_KEY_CUSTOM_AGENT_PARAMS, JSON.stringify(fieldsToParams(fields)));
    } catch (error) {
        console.warn('Failed to save custom agent params to sessionStorage:', error);
    }
};
// Hook to initialize param fields from JSON string (from context/state)
// Values are persisted to sessionStorage and restored on page refresh
export const useInitialParamFields = (customAgentParamsJson)=>{
    const [fields, setFields] = useState([]);
    const initialized = useRef(false);
    // Initialize fields from JSON and restore saved values from sessionStorage
    useEffect(()=>{
        if (!initialized.current && customAgentParamsJson) {
            initialized.current = true;
            const parsedFields = parseParamsJson(customAgentParamsJson);
            // Load saved values from sessionStorage and merge with parsed fields
            // Validate type before applying to prevent injection of malicious values
            const savedValues = loadParamValuesFromStorage();
            const fieldsWithSavedValues = parsedFields.map((field)=>{
                if (!field.name || !(field.name in savedValues)) return field;
                const savedValue = savedValues[field.name];
                const isValidType = field.type === 'boolean' && typeof savedValue === 'boolean' || field.type === 'number' && typeof savedValue === 'number' && !isNaN(savedValue) || (field.type === 'string' || field.type === 'select') && typeof savedValue === 'string';
                return isValidType ? {
                    ...field,
                    value: savedValue
                } : field;
            });
            setFields(fieldsWithSavedValues);
        }
    }, [
        customAgentParamsJson
    ]);
    // Save to sessionStorage whenever fields change (after initialization)
    useEffect(()=>{
        if (initialized.current && fields.length > 0) {
            saveParamValuesToStorage(fields);
        }
    }, [
        fields
    ]);
    return [
        fields,
        setFields
    ];
};
// For backwards compatibility
export const defaultParamFields = [];

//# sourceMappingURL=CustomAgentParams.js.map