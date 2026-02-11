const STORAGE_KEY = 'settings';
// Remove the theme logic - theme should follow the same pattern as other env variables
export const getSettings = ()=>{
    let settings = {
        theme: 'light'
    };
    const settingsJson = sessionStorage.getItem(STORAGE_KEY);
    if (settingsJson) {
        try {
            let savedSettings = JSON.parse(settingsJson);
            settings = Object.assign(settings, savedSettings);
        } catch (e) {
            console.error(e);
        }
    }
    return settings;
};
export const saveSettings = (settings)=>{
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
};

//# sourceMappingURL=settings.js.map