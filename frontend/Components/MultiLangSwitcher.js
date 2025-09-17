import { useI18n } from '@/utils/i18n';
import Dropdown from '@/components/Dropdown';

export default function MultiLangSwitcher(){
  const { lang, setLang } = useI18n();
  return (
    <div className="flex items-center gap-2">
      <Dropdown
        value={lang}
        onChange={(e)=> setLang(e.target.value)}
        options={[
          { value: 'en', label: '🇺🇸 EN' },
          { value: 'ta', label: '🇮🇳 TA' },
        ]}
        placeholder="Language"
        className="min-w-[110px]"
      />
    </div>
  );
}
