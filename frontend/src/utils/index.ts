import { getPathWithLocale } from '../i18n/utils'

export const hashPassword = async (password: string) => {
    // Use Web Crypto when available. Some old Android WebViews / in-app
    // browsers expose crypto but do not implement crypto.subtle.
    if (!globalThis.crypto?.subtle || typeof TextEncoder === 'undefined') {
        throw new Error('Current browser does not support secure password hashing. Please use a newer browser or update WebView.');
    }
    const digest = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
    const hashArray = Array.from(new Uint8Array(digest));
    return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
}

export const getRouterPathWithLang = (path: string, lang: string) => {
    const normalizedLang = lang === 'en'
        || lang === 'es'
        || lang === 'pt-BR'
        || lang === 'ja'
        || lang === 'de'
        ? lang
        : 'zh';

    return getPathWithLocale(path, normalizedLang);
}

export const utcToLocalDate = (utcDate: string, useUTCDate: boolean) => {
    const utcDateString = `${utcDate} UTC`;
    if (useUTCDate) {
        return utcDateString;
    }
    try {
        const date = new Date(utcDateString);
        // if invalid date string
        if (isNaN(date.getTime())) return utcDateString;

        return date.toLocaleString();
    } catch (e) {
        console.error(e);
    }
    return utcDateString;
}
