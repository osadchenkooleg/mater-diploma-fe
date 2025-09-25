import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getLanguages } from '@/lib/api';
import { Code } from 'lucide-react';

interface LanguageSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const LanguageSelector = ({ value, onChange, disabled }: LanguageSelectorProps) => {
  const [languages, setLanguages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLanguages = async () => {
      try {
        const langs = await getLanguages();
        setLanguages(langs);
        if (!value && langs.length > 0) {
          onChange(langs[0]);
        }
      } catch (error) {
        console.error('Failed to load languages:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLanguages();
  }, [value, onChange]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Code className="h-4 w-4 animate-pulse" />
        <span className="text-sm">Loading languages...</span>
      </div>
    );
  }

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-40 bg-secondary border-border">
        <div className="flex items-center gap-2">
          <Code className="h-4 w-4" />
          <SelectValue placeholder="Language" />
        </div>
      </SelectTrigger>
      <SelectContent className="bg-popover border-border">
        {languages.map((lang) => (
          <SelectItem key={lang} value={lang} className="capitalize">
            {lang}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};