import { serverSideTranslations } from "next-i18next/serverSideTranslations";
export const getServerSideProps = async ({ locale })=>{
    const defaultModelId = process.env.DEFAULT_MODEL || '';
    return {
        props: {
            defaultModelId,
            ...await serverSideTranslations(locale ?? 'en', [
                'common',
                'chat',
                'sidebar',
                'markdown',
                'promptbar',
                'settings'
            ])
        }
    };
};

//# sourceMappingURL=home.server.js.map