'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { memo, useMemo, useRef } from "react";
import Loading from "./Loading";
// First, define the Video component at module level
export const Video = /*#__PURE__*/ memo(({ src, controls = true, muted = false, ...props })=>{
    // Use ref to maintain stable reference for video element
    const videoRef = useRef(null);
    // Memoize the video element to prevent re-renders from context changes
    const videoElement = useMemo(()=>{
        if (src === 'loading') {
            return /*#__PURE__*/ _jsx(Loading, {
                message: "Loading...",
                type: "image"
            });
        }
        return /*#__PURE__*/ _jsx("video", {
            ref: videoRef,
            src: src,
            controls: controls,
            autoPlay: false,
            loop: false,
            muted: muted,
            playsInline: false,
            className: "rounded-md border border-slate-400 shadow-sm object-cover",
            ...props,
            children: "Your browser does not support the video tag."
        });
    }, [
        src,
        controls,
        muted
    ]); // Only dependencies that should cause a re-render
    return videoElement;
}, (prevProps, nextProps)=>{
    return prevProps.src === nextProps.src;
});

//# sourceMappingURL=Video.js.map