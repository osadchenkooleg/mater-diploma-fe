import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CodeInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const CodeInput = ({ value, onChange, placeholder, disabled }: CodeInputProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('text/') && !file.name.match(/\.(txt|js|jsx|ts|tsx|py|go|java|cpp|c|h|rs|md)$/i)) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a text or code file",
      });
      return;
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please upload a file smaller than 5MB",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onChange(content);
      toast({
        title: "File uploaded",
        description: `Loaded ${file.name} (${(file.size / 1024).toFixed(1)}KB)`,
      });
    };
    reader.onerror = () => {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "Failed to read the file",
      });
    };
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3">
        <FileText className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">Code Input</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="ml-auto"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload File
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileUpload}
          accept=".txt,.js,.jsx,.ts,.tsx,.py,.go,.java,.cpp,.c,.h,.rs,.md,text/*"
          className="hidden"
        />
      </div>
      
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Paste your code here or upload a file..."}
        disabled={disabled}
        className="flex-1 min-h-0 font-mono text-sm bg-code-bg border-code-border resize-none focus:ring-primary"
        style={{ minHeight: '400px' }}
      />
      
      {value && (
        <div className="mt-2 text-xs text-muted-foreground">
          {value.split('\n').length} lines, {value.length} characters
        </div>
      )}
    </div>
  );
};