import { useI18n } from '@/utils/i18n';

export default function MultiLangSwitcher(){
  const { lang, setLang } = useI18n();
  return (
    <div className="flex items-center gap-2">
      <select 
        className="border p-2 rounded bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm" 
        value={lang} 
        onChange={(e)=>setLang(e.target.value)}
        aria-label="Select language"
      >
        <option value="en">🇺🇸 EN</option>
        <option value="ta">🇮🇳 TA</option>
      </select>
    </div>
  );
}
