import { Languages } from "@modules/translations/enums/languages";

export const languageLabelMap: Record< Languages, string> = {
    [Languages.ENGLISH]: 'English',
    [Languages.HINDI]: 'Hindi',
    [Languages.KANNADA]: 'Kannada',
    [Languages.TAMIL]: 'Tamil',
    [Languages.TELUGU]: 'Telugu',
    [Languages.MARATHI]: 'Marathi',
    [Languages.BENGALI]: 'Bengali',
    [Languages.GUJARATI]: 'Gujarati',
    [Languages.MALAYALAM]:  'Malayalam'
}

export const LanguageLabelCodeMap: Record<string, Languages> = {};

for(let key in languageLabelMap) {
    LanguageLabelCodeMap[languageLabelMap[key as Languages]] = key as Languages;
}

export const getLanguageLabel = (lang: Languages) => {
    return languageLabelMap[lang];
}

export const getLanguageCodeByLabel = (name: string): Languages => {
    return LanguageLabelCodeMap[name]
}