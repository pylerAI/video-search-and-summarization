export function throttle(func, limit) {
    let lastFunc;
    let lastRan;
    return (...args)=>{
        if (!lastRan) {
            func(...args);
            lastRan = Date.now();
        } else {
            clearTimeout(lastFunc);
            lastFunc = setTimeout(()=>{
                if (Date.now() - lastRan >= limit) {
                    func(...args);
                    lastRan = Date.now();
                }
            }, limit - (Date.now() - lastRan));
        }
    };
}

//# sourceMappingURL=throttle.js.map