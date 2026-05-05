import en from "../../assets/lang/en.json";
import de from "../../assets/lang/de.json";
import ru from "../../assets/lang/ru.json";
import enImg from "../../assets/flags/en.png"
import deImg from "../../assets/flags/de.png"
import ruImg from "../../assets/flags/ru.png"

const languages = {
  en,
  de,
  ru
};

export function getLangImg(lang: Lang){
  switch (lang){
    case "en": return enImg
    case "de": return deImg
    case "ru": return ruImg
  }
}

export type Lang = keyof typeof languages;

export function textFromLang(lang: Lang, key: string) {
  const text = languages[lang][key as keyof typeof en] || key;

  return text;
}
