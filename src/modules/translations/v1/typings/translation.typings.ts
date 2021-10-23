import { Languages } from "@modules/translations/enums/languages";


// All the translations for a key
export type KeyTranslations = Record<Languages, string>;

export type KeyTranslationRow = {
    key: string,
    translations: Partial<KeyTranslations>
}