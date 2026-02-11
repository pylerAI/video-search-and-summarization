import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useRef, useState, useCallback, useContext, useMemo, useEffect } from "react";
import toast from "react-hot-toast";
import { IconVideoPlus, IconX, IconFileCode, IconCheck, IconChevronDown, IconCopy, IconPlus, IconVideo } from "@tabler/icons-react";
import HomeContext from "../../pages/api/home/home.context";
import { copyToClipboard } from "../../utils/shared/clipboard";
import { uploadFile } from "../../utils/shared/videoUpload";
// CSS class constants
const INPUT_CLASS = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:border-[#76b900] focus:outline-none focus:ring-1 focus:ring-[#76b900] dark:border-gray-600 dark:bg-[#343541] dark:text-gray-300';
const POPUP_OVERLAY_CLASS = 'fixed inset-0 z-50 flex items-center justify-center bg-black/50';
const POPUP_CONTAINER_CLASS = 'mx-4 w-full max-w-xl rounded-lg bg-white p-6 shadow-xl dark:bg-[#343541]';
export const ChatFileUpload = ({ onUploadSuccess, onUploadError, onSendHiddenMessage, disabled = false, accept = '.mp4,.mkv,video/mp4,video/x-matroska', children })=>{
    const { state: { agentApiUrlBase, chatUploadFileConfigTemplateJson, chatUploadFileMetadataEnabled, chatUploadFileHiddenMessageTemplate } } = useContext(HomeContext);
    const videoInputRef = useRef(null);
    const metadataInputRef = useRef(null);
    const [pendingMetadataFileId, setPendingMetadataFileId] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [showProgressPopup, setShowProgressPopup] = useState(false);
    const [allUploadResults, setAllUploadResults] = useState([]);
    const [uploadingFiles, setUploadingFiles] = useState([]);
    const [expandedResults, setExpandedResults] = useState(new Set());
    const [copiedResultIndex, setCopiedResultIndex] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const dragCounterRef = useRef(0);
    // Store AbortControllers for each file to enable cancellation
    const abortControllerMapRef = useRef(new Map());
    // Track cancelled file IDs to prevent upload after cancellation
    const cancelledFileIdsRef = useRef(new Set());
    // File selection popup state
    const [showFileSelectPopup, setShowFileSelectPopup] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    // Drag states for drop zones in popup
    const [isDraggingMedia, setIsDraggingMedia] = useState(false);
    const [draggingMetadataFileId, setDraggingMetadataFileId] = useState(null);
    // Warn user before leaving page while uploading
    useEffect(()=>{
        if (!isUploading) return;
        const handleBeforeUnload = (e)=>{
            e.preventDefault();
            // Required in most browsers to trigger the confirmation dialog
            e.returnValue = '';
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return ()=>window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [
        isUploading
    ]);
    // Parse config template from context (read from env in home.state.tsx)
    const configTemplate = useMemo(()=>{
        if (chatUploadFileConfigTemplateJson) {
            try {
                return JSON.parse(chatUploadFileConfigTemplateJson);
            } catch (error) {
                console.warn('Failed to parse upload file config template:', error);
            }
        }
        return null;
    }, [
        chatUploadFileConfigTemplateJson
    ]);
    // Generate default form data from config template
    const generateDefaultFormData = useCallback(()=>{
        if (!configTemplate || !Array.isArray(configTemplate.fields)) return {};
        return configTemplate.fields.reduce((acc, field)=>{
            acc[field['field-name']] = field['field-default-value'];
            return acc;
        }, {});
    }, [
        configTemplate
    ]);
    // Generate unique ID for file
    const generateFileId = useCallback(()=>{
        return `file_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    }, []);
    // Create FileWithFormData from File
    const createFileWithFormData = useCallback((file)=>({
            id: generateFileId(),
            file,
            formData: generateDefaultFormData(),
            isExpanded: false
        }), [
        generateFileId,
        generateDefaultFormData
    ]);
    // Get field value from formData or default
    const getFieldValue = useCallback((formData, field)=>{
        return formData[field['field-name']] ?? field['field-default-value'];
    }, []);
    const triggerUpload = useCallback(()=>{
        if (disabled || isUploading) return;
        setShowFileSelectPopup(true);
    }, [
        disabled,
        isUploading
    ]);
    // Directly open the native file picker dialog
    const triggerFilePicker = useCallback(()=>{
        if (disabled || isUploading) return;
        videoInputRef.current?.click();
    }, [
        disabled,
        isUploading
    ]);
    const handleCancelFileSelect = useCallback(()=>{
        setShowFileSelectPopup(false);
        setSelectedFiles([]);
    }, []);
    // Check if file is an allowed video format (only .mp4 and .mkv)
    const isAllowedVideoFile = useCallback((file)=>{
        const allowedExtensions = /\.(mp4|mkv)$/i;
        const allowedMimeTypes = [
            'video/mp4',
            'video/x-matroska'
        ];
        return allowedExtensions.test(file.name) || allowedMimeTypes.includes(file.type);
    }, []);
    // Shared logic to process dropped/selected files
    const processDroppedFiles = useCallback((files, openPopup = false)=>{
        const allFiles = Array.from(files);
        const validFiles = allFiles.filter(isAllowedVideoFile);
        const hasInvalidFiles = allFiles.length > validFiles.length;
        if (hasInvalidFiles) {
            toast.error('Please drop video files only (mp4, mkv)');
        }
        if (validFiles.length > 0) {
            const newFiles = validFiles.map(createFileWithFormData);
            setSelectedFiles((prev)=>[
                    ...prev,
                    ...newFiles
                ]);
            if (openPopup) {
                setShowFileSelectPopup(true);
            }
        }
    }, [
        createFileWithFormData,
        isAllowedVideoFile
    ]);
    const handleVideoFileChange = useCallback((event)=>{
        const files = event.target.files;
        if (files && files.length > 0) {
            processDroppedFiles(files, true);
        }
        event.target.value = '';
    }, [
        processDroppedFiles
    ]);
    const handleRemoveFile = useCallback((fileId)=>{
        setSelectedFiles((prev)=>prev.filter((f)=>f.id !== fileId));
    }, []);
    const handleToggleFileExpand = useCallback((fileId)=>{
        setSelectedFiles((prev)=>prev.map((f)=>f.id === fileId ? {
                    ...f,
                    isExpanded: !f.isExpanded
                } : f));
    }, []);
    const handleFileFormDataChange = useCallback((fileId, fieldName, value)=>{
        setSelectedFiles((prev)=>prev.map((f)=>f.id === fileId ? {
                    ...f,
                    formData: {
                        ...f.formData,
                        [fieldName]: value
                    }
                } : f));
    }, []);
    // Toggle metadata section for a file
    const handleToggleFileMetadataExpand = useCallback((fileId)=>{
        setSelectedFiles((prev)=>prev.map((f)=>f.id === fileId ? {
                    ...f,
                    isMetadataExpanded: !f.isMetadataExpanded
                } : f));
    }, []);
    // Validate and set metadata file for a specific file
    const validateAndSetFileMetadata = useCallback(async (fileId, file)=>{
        if (!file.name.endsWith('.json')) {
            toast.error('Please select a JSON file');
            return false;
        }
        try {
            const content = await file.text();
            JSON.parse(content);
            setSelectedFiles((prev)=>prev.map((f)=>f.id === fileId ? {
                        ...f,
                        metadataFile: file
                    } : f));
            return true;
        } catch  {
            toast.error('Invalid JSON format. Please check your file.');
            return false;
        }
    }, []);
    // Remove metadata file from a specific file
    const handleRemoveFileMetadata = useCallback((fileId)=>{
        setSelectedFiles((prev)=>prev.map((f)=>f.id === fileId ? {
                    ...f,
                    metadataFile: null
                } : f));
    }, []);
    // Open file picker for metadata
    const handleMetadataFileSelect = useCallback((fileId)=>{
        setPendingMetadataFileId(fileId);
        metadataInputRef.current?.click();
    }, []);
    // Handle metadata file input change
    const handleMetadataInputChange = useCallback(async (event)=>{
        const file = event.target.files?.[0];
        if (file && pendingMetadataFileId) {
            await validateAndSetFileMetadata(pendingMetadataFileId, file);
        }
        event.target.value = '';
        setPendingMetadataFileId(null);
    }, [
        pendingMetadataFileId,
        validateAndSetFileMetadata
    ]);
    // Common drag prevention handler
    const preventDragDefault = useCallback((e)=>{
        e.preventDefault();
        e.stopPropagation();
    }, []);
    const handleMediaDrop = useCallback((e)=>{
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingMedia(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            processDroppedFiles(files, false);
        }
    }, [
        processDroppedFiles
    ]);
    // Handle metadata drop for a specific file
    const handleFileMetadataDrop = useCallback(async (fileId, e)=>{
        e.preventDefault();
        e.stopPropagation();
        setDraggingMetadataFileId(null);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            await validateAndSetFileMetadata(fileId, files[0]);
        }
    }, [
        validateAndSetFileMetadata
    ]);
    const handleConfirmUpload = useCallback(()=>{
        if (selectedFiles.length === 0) {
            toast.error('Please select at least one file');
            return;
        }
        processFilesParallel(selectedFiles);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        selectedFiles
    ]);
    const handleClosePopup = useCallback(()=>{
        setShowSuccessPopup(false);
        setShowProgressPopup(false);
        setAllUploadResults([]);
        setUploadingFiles([]);
        setExpandedResults(new Set());
        setCopiedResultIndex(null);
    }, []);
    const toggleResultExpanded = useCallback((index)=>{
        setExpandedResults((prev)=>{
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    }, []);
    const handleCopyJson = useCallback(async (text, index)=>{
        const content = text ?? (allUploadResults.length > 0 ? JSON.stringify(allUploadResults, null, 2) : '');
        if (content) {
            const success = await copyToClipboard(content);
            if (success) {
                if (index !== undefined) {
                    setCopiedResultIndex(index);
                    setTimeout(()=>setCopiedResultIndex(null), 2000);
                }
            }
        }
    }, [
        allUploadResults
    ]);
    // Drag and drop handlers
    const handleDragEnter = useCallback((e)=>{
        e.preventDefault();
        e.stopPropagation();
        dragCounterRef.current++;
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setIsDragging(true);
        }
    }, []);
    const handleDragLeave = useCallback((e)=>{
        e.preventDefault();
        e.stopPropagation();
        dragCounterRef.current--;
        if (dragCounterRef.current === 0) {
            setIsDragging(false);
        }
    }, []);
    const handleDrop = useCallback((e)=>{
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        dragCounterRef.current = 0;
        if (disabled || isUploading) return;
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            processDroppedFiles(files, true);
        }
    }, [
        disabled,
        isUploading,
        processDroppedFiles
    ]);
    const dragHandlers = {
        onDragEnter: handleDragEnter,
        onDragLeave: handleDragLeave,
        onDragOver: preventDragDefault,
        onDrop: handleDrop
    };
    // Update uploading files progress (for progress popup)
    const updateUploadingFileProgress = useCallback((fileId, progress)=>{
        setUploadingFiles((prev)=>prev.map((f)=>f.id === fileId ? {
                    ...f,
                    uploadProgress: progress
                } : f));
    }, []);
    // Update uploading files status (for progress popup)
    const updateUploadingFileStatus = useCallback((fileId, status, error)=>{
        setUploadingFiles((prev)=>prev.map((f)=>f.id === fileId ? {
                    ...f,
                    uploadStatus: status,
                    uploadError: error
                } : f));
    }, []);
    // Cancel a single file upload
    const handleCancelSingleUpload = useCallback((fileId)=>{
        // Mark as cancelled to prevent upload from starting
        cancelledFileIdsRef.current.add(fileId);
        // Abort upload if in progress
        abortControllerMapRef.current.get(fileId)?.abort();
        abortControllerMapRef.current.delete(fileId);
        // Update status immediately
        updateUploadingFileStatus(fileId, 'cancelled', 'Cancelled');
    }, [
        updateUploadingFileStatus
    ]);
    // Cancel all uploads
    const handleCancelAllUploads = useCallback(()=>{
        // Mark all pending/uploading files as cancelled and update UI
        setUploadingFiles((prev)=>prev.map((f)=>{
                if (f.uploadStatus === 'pending' || f.uploadStatus === 'uploading') {
                    cancelledFileIdsRef.current.add(f.id);
                    return {
                        ...f,
                        uploadStatus: 'cancelled',
                        uploadError: 'Cancelled'
                    };
                }
                return f;
            }));
        // Abort all uploads and clear map
        abortControllerMapRef.current.forEach((controller)=>controller.abort());
        abortControllerMapRef.current.clear();
    }, []);
    // Helper to check if file is cancelled
    const isFileCancelled = useCallback((fileId)=>cancelledFileIdsRef.current.has(fileId), []);
    // Upload a single file (for progress popup)
    const uploadSingleFileWithTracking = async (fileItem)=>{
        const { id: fileId, file, formData } = fileItem;
        const filename = file.name;
        const cancelledResult = {
            filename,
            error: 'Upload was cancelled',
            cancelled: true
        };
        // Check if already cancelled before starting
        if (isFileCancelled(fileId)) {
            return cancelledResult;
        }
        if (!agentApiUrlBase) {
            const errorMessage = 'Agent API URL is not configured';
            updateUploadingFileStatus(fileId, 'error', errorMessage);
            return {
                filename,
                error: errorMessage,
                cancelled: false
            };
        }
        updateUploadingFileStatus(fileId, 'uploading');
        updateUploadingFileProgress(fileId, 0);
        try {
            // Create AbortController for the upload
            const abortController = new AbortController();
            abortControllerMapRef.current.set(fileId, abortController);
            // Use shared upload utility
            const result = await uploadFile(file, agentApiUrlBase, formData, (progress)=>updateUploadingFileProgress(fileId, progress), abortController.signal);
            // Clean up AbortController after successful upload
            abortControllerMapRef.current.delete(fileId);
            // Check if cancelled after upload
            if (isFileCancelled(fileId)) {
                return cancelledResult;
            }
            updateUploadingFileStatus(fileId, 'success');
            updateUploadingFileProgress(fileId, 100);
            return {
                filename,
                result
            };
        } catch (error) {
            // Clean up AbortController on error
            abortControllerMapRef.current.delete(fileId);
            const isAborted = error instanceof Error && (error.name === 'AbortError' || error.message === 'Upload was cancelled');
            const isCancelled = isAborted || isFileCancelled(fileId);
            if (isCancelled) {
                return cancelledResult;
            }
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            updateUploadingFileStatus(fileId, 'error', errorMessage);
            return {
                filename,
                error: errorMessage,
                cancelled: false
            };
        }
    };
    // Process all files in parallel
    const processFilesParallel = async (files)=>{
        // Close file select popup and show progress popup
        setShowFileSelectPopup(false);
        setShowProgressPopup(true);
        setIsUploading(true);
        setAllUploadResults([]);
        // Clear cancelled file IDs from previous upload session
        cancelledFileIdsRef.current.clear();
        // Initialize uploading files for progress popup
        const filesToUpload = files.map((f)=>({
                ...f,
                uploadStatus: 'pending',
                uploadProgress: 0
            }));
        setUploadingFiles(filesToUpload);
        try {
            // Upload all files in parallel
            const results = await Promise.all(filesToUpload.map((fileItem)=>uploadSingleFileWithTracking(fileItem)));
            // Store all results
            setAllUploadResults(results);
            // Count successes, errors, and cancelled
            const successes = results.filter((r)=>r.result);
            const errors = results.filter((r)=>r.error && !r.cancelled);
            const cancelled = results.filter((r)=>r.cancelled);
            if (errors.length > 0) {
                errors.forEach(({ filename })=>{
                    onUploadError?.(new Error(`Failed to upload ${filename}`));
                });
            }
            if (successes.length > 0) {
                successes.forEach(({ result })=>{
                    if (result) onUploadSuccess?.(result);
                });
                // Send hidden message to chat API with the uploaded video filenames
                if (onSendHiddenMessage && chatUploadFileHiddenMessageTemplate) {
                    // Fallback order: result.filename -> result.video_id -> result.id -> original filename
                    const videoFilenames = successes.map(({ filename, result })=>result?.filename || result?.video_id || result?.id || filename).filter((name)=>!!name);
                    if (videoFilenames.length > 0) {
                        const filenamesStr = videoFilenames.join(' ');
                        // Replace {filenames} placeholder with actual filenames
                        const hiddenMessage = chatUploadFileHiddenMessageTemplate.replaceAll('{filenames}', filenamesStr);
                        onSendHiddenMessage(hiddenMessage);
                    }
                }
            }
            // Show success popup after a short delay (even if some were cancelled)
            setTimeout(()=>{
                setShowProgressPopup(false);
                // Only show success popup if there were any results (not all cancelled)
                if (successes.length > 0 || errors.length > 0 || cancelled.length > 0) {
                    setShowSuccessPopup(true);
                }
            }, 1000);
            // Clear selected files
            setSelectedFiles([]);
        } catch (error) {
            const err = error instanceof Error ? error : new Error('Unknown error');
            toast.error(`Upload failed: ${err.message}`);
            onUploadError?.(err);
            setShowProgressPopup(false);
        } finally{
            setIsUploading(false);
            // Clear all remaining references
            abortControllerMapRef.current.clear();
            cancelledFileIdsRef.current.clear();
        }
    };
    return /*#__PURE__*/ _jsxs(_Fragment, {
        children: [
            /*#__PURE__*/ _jsx("input", {
                type: "file",
                ref: videoInputRef,
                className: "hidden",
                accept: accept,
                onChange: handleVideoFileChange,
                disabled: disabled || isUploading,
                multiple: true
            }),
            /*#__PURE__*/ _jsx("input", {
                type: "file",
                ref: metadataInputRef,
                className: "hidden",
                accept: ".json,application/json",
                onChange: handleMetadataInputChange,
                disabled: disabled || isUploading
            }),
            children({
                triggerUpload,
                triggerFilePicker,
                isUploading,
                uploadProgress: 0,
                isDragging,
                dragHandlers
            }),
            showFileSelectPopup && /*#__PURE__*/ _jsx("div", {
                className: POPUP_OVERLAY_CLASS,
                children: /*#__PURE__*/ _jsxs("div", {
                    className: POPUP_CONTAINER_CLASS,
                    children: [
                        /*#__PURE__*/ _jsx("h3", {
                            className: "mb-6 text-center text-lg font-semibold text-gray-900 dark:text-white",
                            children: "Upload Files"
                        }),
                        /*#__PURE__*/ _jsxs("div", {
                            className: "mb-4",
                            children: [
                                /*#__PURE__*/ _jsxs("div", {
                                    className: "mb-2 flex items-center justify-between",
                                    children: [
                                        /*#__PURE__*/ _jsxs("label", {
                                            className: "block text-sm font-medium text-gray-700 dark:text-gray-300",
                                            children: [
                                                "Files ",
                                                /*#__PURE__*/ _jsx("span", {
                                                    className: "text-red-500",
                                                    children: "*"
                                                }),
                                                selectedFiles.length > 0 && /*#__PURE__*/ _jsx("span", {
                                                    className: "ml-2 rounded-full bg-[#76b900] px-2 py-0.5 text-xs text-white",
                                                    children: selectedFiles.length
                                                })
                                            ]
                                        }),
                                        selectedFiles.length > 0 && /*#__PURE__*/ _jsxs("button", {
                                            onClick: triggerFilePicker,
                                            className: "flex items-center gap-1 rounded-lg bg-[#76b900] px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-[#5a8f00]",
                                            children: [
                                                /*#__PURE__*/ _jsx(IconPlus, {
                                                    size: 14
                                                }),
                                                "Add More"
                                            ]
                                        })
                                    ]
                                }),
                                selectedFiles.length > 0 ? /*#__PURE__*/ _jsx("div", {
                                    className: "max-h-96 space-y-2 overflow-y-auto",
                                    children: selectedFiles.map((fileItem)=>/*#__PURE__*/ _jsx("div", {
                                            className: "overflow-hidden rounded-lg border border-gray-300 dark:border-gray-600",
                                            children: (()=>{
                                                const hasExpandableContent = chatUploadFileMetadataEnabled || configTemplate && Array.isArray(configTemplate.fields) && configTemplate.fields.length > 0;
                                                return /*#__PURE__*/ _jsxs(_Fragment, {
                                                    children: [
                                                        /*#__PURE__*/ _jsxs("div", {
                                                            className: "flex items-center justify-between bg-white p-3 dark:bg-[#343541]",
                                                            children: [
                                                                /*#__PURE__*/ _jsxs("div", {
                                                                    className: `flex flex-1 items-center gap-2 overflow-hidden ${hasExpandableContent ? 'cursor-pointer' : ''}`,
                                                                    onClick: ()=>hasExpandableContent && handleToggleFileExpand(fileItem.id),
                                                                    children: [
                                                                        hasExpandableContent && /*#__PURE__*/ _jsx(IconChevronDown, {
                                                                            size: 16,
                                                                            className: `flex-shrink-0 text-gray-400 transition-transform duration-200 ${fileItem.isExpanded ? 'rotate-180' : ''}`
                                                                        }),
                                                                        /*#__PURE__*/ _jsx(IconVideo, {
                                                                            size: 18,
                                                                            className: "flex-shrink-0 text-[#76b900]"
                                                                        }),
                                                                        /*#__PURE__*/ _jsx("span", {
                                                                            className: "truncate text-sm text-gray-700 dark:text-gray-300",
                                                                            children: fileItem.file.name
                                                                        }),
                                                                        /*#__PURE__*/ _jsxs("span", {
                                                                            className: "flex-shrink-0 text-xs text-gray-400",
                                                                            children: [
                                                                                "(",
                                                                                (fileItem.file.size / 1024 / 1024).toFixed(2),
                                                                                " MB)"
                                                                            ]
                                                                        })
                                                                    ]
                                                                }),
                                                                /*#__PURE__*/ _jsx("button", {
                                                                    onClick: ()=>handleRemoveFile(fileItem.id),
                                                                    className: "ml-2 flex-shrink-0 text-gray-500 hover:text-red-500",
                                                                    children: /*#__PURE__*/ _jsx(IconX, {
                                                                        size: 18
                                                                    })
                                                                })
                                                            ]
                                                        }),
                                                        hasExpandableContent && fileItem.isExpanded && /*#__PURE__*/ _jsxs("div", {
                                                            className: "border-t border-gray-200 bg-gray-50 p-3 dark:border-gray-600 dark:bg-[#2a2a36]",
                                                            children: [
                                                                configTemplate && Array.isArray(configTemplate.fields) && configTemplate.fields.length > 0 && /*#__PURE__*/ _jsx("div", {
                                                                    className: "mb-3 space-y-3",
                                                                    children: configTemplate.fields.map((field)=>{
                                                                        const value = getFieldValue(fileItem.formData, field);
                                                                        const fieldName = field['field-name'];
                                                                        const isChangeable = field['changeable'] !== false;
                                                                        const tooltipInfo = field['tooltip-info'] || '';
                                                                        return /*#__PURE__*/ _jsxs("div", {
                                                                            className: "flex items-center gap-3",
                                                                            children: [
                                                                                /*#__PURE__*/ _jsx("label", {
                                                                                    className: "w-24 flex-shrink-0 text-xs font-medium text-gray-600 dark:text-gray-400",
                                                                                    title: tooltipInfo,
                                                                                    children: fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
                                                                                }),
                                                                                /*#__PURE__*/ _jsx("div", {
                                                                                    className: "flex-1",
                                                                                    title: tooltipInfo,
                                                                                    children: field['field-type'] === 'boolean' ? /*#__PURE__*/ _jsxs("label", {
                                                                                        className: `flex items-center gap-2 ${isChangeable ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`,
                                                                                        children: [
                                                                                            /*#__PURE__*/ _jsx("button", {
                                                                                                type: "button",
                                                                                                role: "switch",
                                                                                                "aria-checked": value,
                                                                                                disabled: !isChangeable,
                                                                                                onClick: ()=>isChangeable && handleFileFormDataChange(fileItem.id, fieldName, !value),
                                                                                                className: `relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#76b900] focus:ring-offset-2 ${value ? 'bg-[#76b900]' : 'bg-gray-300 dark:bg-gray-600'} ${isChangeable ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`,
                                                                                                children: /*#__PURE__*/ _jsx("span", {
                                                                                                    className: `pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${value ? 'translate-x-4' : 'translate-x-0'}`
                                                                                                })
                                                                                            }),
                                                                                            /*#__PURE__*/ _jsx("span", {
                                                                                                className: "text-sm text-gray-700 dark:text-gray-300",
                                                                                                children: value ? 'Yes' : 'No'
                                                                                            })
                                                                                        ]
                                                                                    }) : field['field-type'] === 'select' ? /*#__PURE__*/ _jsx("select", {
                                                                                        value: value,
                                                                                        disabled: !isChangeable,
                                                                                        onChange: (e)=>handleFileFormDataChange(fileItem.id, fieldName, e.target.value),
                                                                                        className: `${INPUT_CLASS} ${!isChangeable ? 'cursor-not-allowed opacity-60' : ''}`,
                                                                                        children: field['field-options']?.map((option)=>/*#__PURE__*/ _jsx("option", {
                                                                                                value: String(option),
                                                                                                children: String(option)
                                                                                            }, String(option)))
                                                                                    }) : field['field-type'] === 'number' ? /*#__PURE__*/ _jsx("input", {
                                                                                        type: "number",
                                                                                        value: value,
                                                                                        disabled: !isChangeable,
                                                                                        onChange: (e)=>handleFileFormDataChange(fileItem.id, fieldName, Number(e.target.value)),
                                                                                        className: `${INPUT_CLASS} ${!isChangeable ? 'cursor-not-allowed opacity-60' : ''}`
                                                                                    }) : /*#__PURE__*/ _jsx("input", {
                                                                                        type: "text",
                                                                                        value: value,
                                                                                        disabled: !isChangeable,
                                                                                        onChange: (e)=>handleFileFormDataChange(fileItem.id, fieldName, e.target.value),
                                                                                        className: `${INPUT_CLASS} ${!isChangeable ? 'cursor-not-allowed opacity-60' : ''}`,
                                                                                        placeholder: `Enter ${fieldName}`
                                                                                    })
                                                                                })
                                                                            ]
                                                                        }, fieldName);
                                                                    })
                                                                }),
                                                                chatUploadFileMetadataEnabled && /*#__PURE__*/ _jsxs("div", {
                                                                    className: "overflow-hidden rounded-lg border border-gray-300 dark:border-gray-600",
                                                                    children: [
                                                                        /*#__PURE__*/ _jsxs("button", {
                                                                            type: "button",
                                                                            onClick: ()=>handleToggleFileMetadataExpand(fileItem.id),
                                                                            className: "flex w-full items-center gap-2 bg-white px-3 py-2 text-left transition-colors hover:bg-gray-50 dark:bg-[#343541] dark:hover:bg-[#3d3d4a]",
                                                                            children: [
                                                                                /*#__PURE__*/ _jsx(IconChevronDown, {
                                                                                    size: 14,
                                                                                    className: `flex-shrink-0 text-gray-400 transition-transform duration-200 ${fileItem.isMetadataExpanded ? 'rotate-180' : ''}`
                                                                                }),
                                                                                /*#__PURE__*/ _jsx("span", {
                                                                                    className: "text-xs font-medium text-gray-700 dark:text-gray-300",
                                                                                    children: "Metadata (JSON)"
                                                                                }),
                                                                                fileItem.metadataFile && /*#__PURE__*/ _jsx("span", {
                                                                                    className: "rounded-full bg-blue-500 px-1.5 py-0.5 text-xs text-white",
                                                                                    children: "1"
                                                                                }),
                                                                                /*#__PURE__*/ _jsx("span", {
                                                                                    className: "text-xs text-gray-400",
                                                                                    children: "(optional)"
                                                                                })
                                                                            ]
                                                                        }),
                                                                        fileItem.isMetadataExpanded && /*#__PURE__*/ _jsx("div", {
                                                                            className: "border-t border-gray-200 bg-white p-2 dark:border-gray-600 dark:bg-[#343541]",
                                                                            children: fileItem.metadataFile ? /*#__PURE__*/ _jsxs("div", {
                                                                                className: "flex items-center justify-between rounded-lg border border-blue-500 bg-blue-500/10 p-2",
                                                                                children: [
                                                                                    /*#__PURE__*/ _jsxs("div", {
                                                                                        className: "flex items-center gap-2 overflow-hidden",
                                                                                        children: [
                                                                                            /*#__PURE__*/ _jsx(IconFileCode, {
                                                                                                size: 16,
                                                                                                className: "flex-shrink-0 text-blue-500"
                                                                                            }),
                                                                                            /*#__PURE__*/ _jsx("span", {
                                                                                                className: "truncate text-xs text-gray-700 dark:text-gray-300",
                                                                                                children: fileItem.metadataFile.name
                                                                                            })
                                                                                        ]
                                                                                    }),
                                                                                    /*#__PURE__*/ _jsx("button", {
                                                                                        onClick: ()=>handleRemoveFileMetadata(fileItem.id),
                                                                                        className: "ml-2 flex-shrink-0 text-gray-500 hover:text-red-500",
                                                                                        children: /*#__PURE__*/ _jsx(IconX, {
                                                                                            size: 16
                                                                                        })
                                                                                    })
                                                                                ]
                                                                            }) : /*#__PURE__*/ _jsxs("div", {
                                                                                onClick: ()=>handleMetadataFileSelect(fileItem.id),
                                                                                onDragOver: preventDragDefault,
                                                                                onDragEnter: (e)=>{
                                                                                    preventDragDefault(e);
                                                                                    setDraggingMetadataFileId(fileItem.id);
                                                                                },
                                                                                onDragLeave: (e)=>{
                                                                                    preventDragDefault(e);
                                                                                    setDraggingMetadataFileId(null);
                                                                                },
                                                                                onDrop: (e)=>handleFileMetadataDrop(fileItem.id, e),
                                                                                className: `w-full cursor-pointer rounded-lg border-2 border-dashed p-3 text-center transition-colors ${draggingMetadataFileId === fileItem.id ? 'border-blue-500 bg-blue-500/10' : 'border-gray-300 hover:border-blue-500 hover:bg-gray-50 dark:border-gray-600 dark:hover:border-blue-500 dark:hover:bg-[#3d3d4a]'}`,
                                                                                children: [
                                                                                    /*#__PURE__*/ _jsx(IconFileCode, {
                                                                                        size: 24,
                                                                                        className: "mx-auto text-gray-400"
                                                                                    }),
                                                                                    /*#__PURE__*/ _jsx("span", {
                                                                                        className: "mt-1 block text-xs text-gray-500 dark:text-gray-400",
                                                                                        children: draggingMetadataFileId === fileItem.id ? 'Drop JSON here' : 'Click or drag JSON metadata'
                                                                                    })
                                                                                ]
                                                                            })
                                                                        })
                                                                    ]
                                                                })
                                                            ]
                                                        })
                                                    ]
                                                });
                                            })()
                                        }, fileItem.id))
                                }) : /*#__PURE__*/ _jsxs("div", {
                                    onClick: triggerFilePicker,
                                    onDragOver: preventDragDefault,
                                    onDragEnter: (e)=>{
                                        preventDragDefault(e);
                                        setIsDraggingMedia(true);
                                    },
                                    onDragLeave: (e)=>{
                                        preventDragDefault(e);
                                        setIsDraggingMedia(false);
                                    },
                                    onDrop: handleMediaDrop,
                                    className: `w-full cursor-pointer rounded-lg border-2 border-dashed p-4 text-center transition-colors ${isDraggingMedia ? 'border-[#76b900] bg-[#76b900]/10' : 'border-gray-300 hover:border-[#76b900] hover:bg-gray-50 dark:border-gray-600 dark:hover:border-[#76b900] dark:hover:bg-gray-800'}`,
                                    children: [
                                        /*#__PURE__*/ _jsx(IconVideoPlus, {
                                            size: 40,
                                            className: "mx-auto text-gray-400"
                                        }),
                                        /*#__PURE__*/ _jsx("span", {
                                            className: "mt-2 block text-sm font-medium text-gray-700 dark:text-gray-300",
                                            children: isDraggingMedia ? 'Drop files here' : 'Click or drag files here'
                                        }),
                                        /*#__PURE__*/ _jsx("div", {
                                            className: "mt-2 flex flex-wrap justify-center gap-2 text-xs text-gray-500 dark:text-gray-400",
                                            children: /*#__PURE__*/ _jsx("span", {
                                                className: "rounded bg-gray-100 px-2 py-0.5 dark:bg-gray-700",
                                                children: "Movie Files (mp4, mkv)"
                                            })
                                        })
                                    ]
                                })
                            ]
                        }),
                        /*#__PURE__*/ _jsxs("div", {
                            className: "flex gap-3",
                            children: [
                                /*#__PURE__*/ _jsx("button", {
                                    onClick: handleCancelFileSelect,
                                    className: "flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600",
                                    children: "Cancel"
                                }),
                                /*#__PURE__*/ _jsxs("button", {
                                    onClick: handleConfirmUpload,
                                    disabled: selectedFiles.length === 0,
                                    className: `flex-1 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${selectedFiles.length > 0 ? 'bg-[#76b900] hover:bg-[#5a8f00]' : 'bg-gray-400'}`,
                                    children: [
                                        "Upload ",
                                        selectedFiles.length > 0 ? `(${selectedFiles.length})` : ''
                                    ]
                                })
                            ]
                        })
                    ]
                })
            }),
            showProgressPopup && /*#__PURE__*/ _jsx("div", {
                className: POPUP_OVERLAY_CLASS,
                children: /*#__PURE__*/ _jsxs("div", {
                    className: POPUP_CONTAINER_CLASS,
                    children: [
                        /*#__PURE__*/ _jsx("h3", {
                            className: "mb-4 text-center text-lg font-semibold text-gray-900 dark:text-white",
                            children: "Uploading Files..."
                        }),
                        uploadingFiles.some((f)=>f.uploadStatus === 'pending' || f.uploadStatus === 'uploading') && /*#__PURE__*/ _jsx("div", {
                            className: "mb-4 flex justify-center",
                            children: /*#__PURE__*/ _jsxs("button", {
                                onClick: handleCancelAllUploads,
                                className: "flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 dark:border-red-700 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40",
                                children: [
                                    /*#__PURE__*/ _jsx(IconX, {
                                        size: 16
                                    }),
                                    "Cancel All"
                                ]
                            })
                        }),
                        /*#__PURE__*/ _jsx("div", {
                            className: "max-h-96 space-y-3 overflow-y-auto",
                            children: uploadingFiles.map((fileItem)=>/*#__PURE__*/ _jsxs("div", {
                                    className: "rounded-lg border border-gray-200 p-3 dark:border-gray-600",
                                    children: [
                                        /*#__PURE__*/ _jsxs("div", {
                                            className: "mb-2 flex items-center justify-between",
                                            children: [
                                                /*#__PURE__*/ _jsxs("div", {
                                                    className: "flex items-center gap-2 overflow-hidden",
                                                    children: [
                                                        fileItem.uploadStatus === 'uploading' ? /*#__PURE__*/ _jsx("div", {
                                                            className: "h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-[#76b900]"
                                                        }) : fileItem.uploadStatus === 'success' ? /*#__PURE__*/ _jsx(IconCheck, {
                                                            size: 16,
                                                            className: "flex-shrink-0 text-green-500"
                                                        }) : fileItem.uploadStatus === 'error' ? /*#__PURE__*/ _jsx(IconX, {
                                                            size: 16,
                                                            className: "flex-shrink-0 text-red-500"
                                                        }) : fileItem.uploadStatus === 'cancelled' ? /*#__PURE__*/ _jsx(IconX, {
                                                            size: 16,
                                                            className: "flex-shrink-0 text-orange-500"
                                                        }) : /*#__PURE__*/ _jsx("div", {
                                                            className: "h-4 w-4 rounded-full border-2 border-gray-300"
                                                        }),
                                                        /*#__PURE__*/ _jsx("span", {
                                                            className: "truncate text-sm text-gray-700 dark:text-gray-300",
                                                            children: fileItem.file.name
                                                        })
                                                    ]
                                                }),
                                                /*#__PURE__*/ _jsxs("div", {
                                                    className: "flex items-center gap-2",
                                                    children: [
                                                        /*#__PURE__*/ _jsx("span", {
                                                            className: `text-xs font-medium ${fileItem.uploadStatus === 'success' ? 'text-green-500' : fileItem.uploadStatus === 'error' ? 'text-red-500' : fileItem.uploadStatus === 'cancelled' ? 'text-orange-500' : fileItem.uploadStatus === 'uploading' ? 'text-[#76b900]' : 'text-gray-400'}`,
                                                            children: fileItem.uploadStatus === 'success' ? 'Done' : fileItem.uploadStatus === 'error' ? 'Failed' : fileItem.uploadStatus === 'cancelled' ? 'Cancelled' : fileItem.uploadStatus === 'uploading' ? `${fileItem.uploadProgress || 0}%` : 'Pending'
                                                        }),
                                                        (fileItem.uploadStatus === 'uploading' || fileItem.uploadStatus === 'pending') && /*#__PURE__*/ _jsx("button", {
                                                            onClick: ()=>handleCancelSingleUpload(fileItem.id),
                                                            className: "flex-shrink-0 rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-500 dark:hover:bg-gray-700",
                                                            title: "Cancel upload",
                                                            children: /*#__PURE__*/ _jsx(IconX, {
                                                                size: 14
                                                            })
                                                        })
                                                    ]
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ _jsx("div", {
                                            className: "h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700",
                                            children: /*#__PURE__*/ _jsx("div", {
                                                className: `h-1.5 rounded-full transition-all duration-300 ${fileItem.uploadStatus === 'success' ? 'bg-green-500' : fileItem.uploadStatus === 'error' ? 'bg-red-500' : fileItem.uploadStatus === 'cancelled' ? 'bg-orange-500' : 'bg-[#76b900]'}`,
                                                style: {
                                                    width: `${fileItem.uploadProgress || 0}%`
                                                }
                                            })
                                        }),
                                        fileItem.uploadError && /*#__PURE__*/ _jsx("p", {
                                            className: "mt-1 text-xs text-red-500",
                                            children: fileItem.uploadError
                                        })
                                    ]
                                }, fileItem.id))
                        })
                    ]
                })
            }),
            showSuccessPopup && allUploadResults.length > 0 && (()=>{
                const successCount = allUploadResults.filter((r)=>r.result).length;
                const cancelledCount = allUploadResults.filter((r)=>r.cancelled).length;
                const failedCount = allUploadResults.length - successCount - cancelledCount;
                const totalCount = allUploadResults.length;
                // Determine overall status
                const allSuccess = successCount === totalCount;
                const allFailed = failedCount === totalCount;
                const allCancelled = cancelledCount === totalCount;
                return /*#__PURE__*/ _jsx("div", {
                    className: POPUP_OVERLAY_CLASS,
                    children: /*#__PURE__*/ _jsxs("div", {
                        className: POPUP_CONTAINER_CLASS,
                        children: [
                            /*#__PURE__*/ _jsx("div", {
                                className: "mb-4 flex justify-center",
                                children: /*#__PURE__*/ _jsx("div", {
                                    className: `flex h-12 w-12 items-center justify-center rounded-full ${allSuccess ? 'bg-green-100 dark:bg-green-900' : allFailed ? 'bg-red-100 dark:bg-red-900' : allCancelled ? 'bg-orange-100 dark:bg-orange-900' : 'bg-orange-100 dark:bg-orange-900'}`,
                                    children: allSuccess ? /*#__PURE__*/ _jsx(IconCheck, {
                                        size: 24,
                                        className: "text-green-600 dark:text-green-400"
                                    }) : allFailed ? /*#__PURE__*/ _jsx(IconX, {
                                        size: 24,
                                        className: "text-red-600 dark:text-red-400"
                                    }) : allCancelled ? /*#__PURE__*/ _jsx(IconX, {
                                        size: 24,
                                        className: "text-orange-600 dark:text-orange-400"
                                    }) : /*#__PURE__*/ _jsx(IconCheck, {
                                        size: 24,
                                        className: "text-orange-600 dark:text-orange-400"
                                    })
                                })
                            }),
                            /*#__PURE__*/ _jsx("h3", {
                                className: `mb-2 text-center text-lg font-semibold ${allSuccess ? 'text-green-700 dark:text-green-400' : allFailed ? 'text-red-700 dark:text-red-400' : allCancelled ? 'text-orange-700 dark:text-orange-400' : 'text-gray-900 dark:text-white'}`,
                                children: allSuccess ? 'Upload Complete!' : allFailed ? 'Upload Failed' : allCancelled ? 'Upload Cancelled' : 'Upload Partially Complete'
                            }),
                            /*#__PURE__*/ _jsxs("p", {
                                className: "mb-4 text-center text-sm text-gray-600 dark:text-gray-400",
                                children: [
                                    successCount,
                                    " / ",
                                    totalCount,
                                    " files uploaded successfully",
                                    cancelledCount > 0 && /*#__PURE__*/ _jsxs("span", {
                                        className: "ml-1 text-orange-500",
                                        children: [
                                            "(",
                                            cancelledCount,
                                            " cancelled)"
                                        ]
                                    }),
                                    failedCount > 0 && /*#__PURE__*/ _jsxs("span", {
                                        className: "ml-1 text-red-500",
                                        children: [
                                            "(",
                                            failedCount,
                                            " failed)"
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ _jsx("div", {
                                className: "mb-4 max-h-96 space-y-2 overflow-y-auto",
                                children: allUploadResults.map((item, index)=>/*#__PURE__*/ _jsxs("div", {
                                        className: `overflow-hidden rounded-lg border ${item.result ? 'border-green-300 dark:border-green-700' : item.cancelled ? 'border-orange-300 dark:border-orange-700' : 'border-red-300 dark:border-red-700'}`,
                                        children: [
                                            /*#__PURE__*/ _jsxs("button", {
                                                type: "button",
                                                onClick: ()=>toggleResultExpanded(index),
                                                className: `flex w-full items-center justify-between p-3 text-left transition-colors ${item.result ? 'bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30' : item.cancelled ? 'bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:hover:bg-orange-900/30' : 'bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30'}`,
                                                children: [
                                                    /*#__PURE__*/ _jsxs("div", {
                                                        className: "flex items-center gap-2 overflow-hidden",
                                                        children: [
                                                            /*#__PURE__*/ _jsx(IconChevronDown, {
                                                                size: 14,
                                                                className: `flex-shrink-0 text-gray-400 transition-transform duration-200 ${expandedResults.has(index) ? 'rotate-180' : ''}`
                                                            }),
                                                            item.result ? /*#__PURE__*/ _jsx(IconCheck, {
                                                                size: 16,
                                                                className: "flex-shrink-0 text-green-500"
                                                            }) : item.cancelled ? /*#__PURE__*/ _jsx(IconX, {
                                                                size: 16,
                                                                className: "flex-shrink-0 text-orange-500"
                                                            }) : /*#__PURE__*/ _jsx(IconX, {
                                                                size: 16,
                                                                className: "flex-shrink-0 text-red-500"
                                                            }),
                                                            /*#__PURE__*/ _jsx("span", {
                                                                className: "truncate text-sm font-medium text-gray-700 dark:text-gray-300",
                                                                children: item.filename
                                                            })
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ _jsx("span", {
                                                        className: `text-xs font-medium ${item.result ? 'text-green-500' : item.cancelled ? 'text-orange-500' : 'text-red-500'}`,
                                                        children: item.result ? 'Success' : item.cancelled ? 'Cancelled' : 'Failed'
                                                    })
                                                ]
                                            }),
                                            expandedResults.has(index) && /*#__PURE__*/ _jsx("div", {
                                                className: "border-t border-gray-200 bg-gray-50 p-2 dark:border-gray-600 dark:bg-[#1e1e28]",
                                                children: /*#__PURE__*/ _jsxs("div", {
                                                    className: "relative",
                                                    children: [
                                                        /*#__PURE__*/ _jsx("button", {
                                                            type: "button",
                                                            onClick: ()=>handleCopyJson(item.result ? JSON.stringify(item.result, null, 2) : item.cancelled ? 'Upload was cancelled' : `Error: ${item.error}`, index),
                                                            className: `absolute right-1 top-1 rounded p-1 transition-colors ${copiedResultIndex === index ? 'text-green-500' : 'text-gray-400 hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300'}`,
                                                            title: copiedResultIndex === index ? 'Copied!' : 'Copy JSON',
                                                            children: copiedResultIndex === index ? /*#__PURE__*/ _jsx(IconCheck, {
                                                                size: 14
                                                            }) : /*#__PURE__*/ _jsx(IconCopy, {
                                                                size: 14
                                                            })
                                                        }),
                                                        /*#__PURE__*/ _jsx("pre", {
                                                            className: "max-h-40 overflow-auto rounded bg-gray-100 p-2 pr-8 text-xs text-gray-800 dark:bg-[#0d0d12] dark:text-gray-300",
                                                            children: item.result ? JSON.stringify(item.result, null, 2) : item.cancelled ? 'Upload was cancelled' : `Error: ${item.error}`
                                                        })
                                                    ]
                                                })
                                            })
                                        ]
                                    }, index))
                            }),
                            /*#__PURE__*/ _jsx("button", {
                                onClick: handleClosePopup,
                                className: "w-full rounded-lg bg-[#76b900] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#5a8f00]",
                                children: "Close"
                            })
                        ]
                    })
                });
            })()
        ]
    });
};
export default ChatFileUpload;

//# sourceMappingURL=ChatFileUpload.js.map