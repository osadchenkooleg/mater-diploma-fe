import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Search, Send, Loader2 } from 'lucide-react';
import { LanguageSelector } from '@/components/LanguageSelector';
import { CodeInput } from '@/components/CodeInput';
import { ResultsPanel } from '@/components/ResultsPanel';
import { checkUniqueness, getCode, saveCode, ApiError } from '@/lib/api';
import { UniquenessResponse, CodeRecord } from '@/types/api';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [selectedLang, setSelectedLang] = useState('');
  const [codeText, setCodeText] = useState('');
  const [uniquenessResult, setUniquenessResult] = useState<UniquenessResponse | null>(null);
  const [nearestCode, setNearestCode] = useState<CodeRecord | null>(null);
  const [loadingCheck, setLoadingCheck] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const canCheck = selectedLang && codeText.trim().length > 0 && !loadingCheck;
  const canSubmit = uniquenessResult && uniquenessResult.uniqueness_percent > 35 && !loadingSubmit;

  const handleCheckUniqueness = async () => {
    if (!canCheck) return;

    setLoadingCheck(true);
    setError(null);
    setUniquenessResult(null);
    setNearestCode(null);

    try {
      const result = await checkUniqueness(codeText.trim(), [selectedLang]);
      setUniquenessResult(result);

      // Fetch nearest code if available
      if (result.closest_id) {
        try {
          const nearest = await getCode(result.closest_id);
          setNearestCode(nearest);
        } catch (err) {
          console.error('Failed to fetch nearest code:', err);
          // Don't fail the whole operation if we can't fetch the nearest code
        }
      }

      toast({
        title: "Analysis complete",
        description: `Uniqueness: ${(result.uniqueness_percent).toFixed(1)}%`,
      });
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? `API Error (${err.status}): ${err.message}`
        : 'Failed to check uniqueness. Please try again.';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Analysis failed",
        description: errorMessage,
      });
    } finally {
      setLoadingCheck(false);
    }
  };

  const handleSubmitCode = async () => {
    if (!canSubmit) return;

    setLoadingSubmit(true);

    try {
      const result = await saveCode(selectedLang, codeText.trim());
      toast({
        title: "Code submitted successfully",
        description: (
          <div className="flex items-center gap-2">
            <span>New ID: {result.id.slice(0, 16)}...</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigator.clipboard.writeText(result.id)}
              className="h-6 px-2 text-xs"
            >
              Copy
            </Button>
          </div>
        ),
      });
      
      // Reset form after successful submission
      setCodeText('');
      setUniquenessResult(null);
      setNearestCode(null);
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? `Submission failed (${err.status}): ${err.message}`
        : 'Failed to submit code. Please try again.';
      toast({
        variant: "destructive",
        title: "Submission failed",
        description: errorMessage,
      });
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Code Uniqueness Checker
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Analyze code similarity and submit unique contributions
              </p>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSelector 
                value={selectedLang} 
                onChange={setSelectedLang} 
                disabled={loadingCheck || loadingSubmit}
              />
              <Button
                onClick={handleCheckUniqueness}
                disabled={!canCheck}
                className="bg-gradient-primary hover:shadow-glow transition-all duration-200"
              >
                {loadingCheck ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Check Uniqueness
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
          {/* Left Panel - Code Input */}
          <Card className="bg-gradient-card border-border shadow-card">
            <CardContent className="p-6 h-full">
              <CodeInput
                value={codeText}
                onChange={setCodeText}
                disabled={loadingCheck || loadingSubmit}
                placeholder={`Paste your ${selectedLang || 'code'} here or upload a file...`}
              />
            </CardContent>
          </Card>

          {/* Right Panel - Results */}
          <Card className="bg-gradient-card border-border shadow-card">
            <CardContent className="p-6 h-full">
              <ResultsPanel
                result={uniquenessResult}
                nearestCode={nearestCode}
                loading={loadingCheck}
                error={error}
              />
            </CardContent>
          </Card>
        </div>

        {/* Submit Button */}
        {uniquenessResult && (
          <div className="mt-6 flex justify-center">
            <div className="flex flex-col items-center gap-3">
              <Separator className="w-24" />
              {canSubmit ? (
                <Button
                  onClick={handleSubmitCode}
                  disabled={loadingSubmit}
                  size="lg"
                  className="bg-gradient-success hover:shadow-glow transition-all duration-200"
                >
                  {loadingSubmit ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      Submit to Codebase
                    </>
                  )}
                </Button>
              ) : (
                <div className="text-center">
                  <Button
                    disabled
                    size="lg"
                    variant="outline"
                    className="opacity-50 cursor-not-allowed"
                  >
                    <Send className="h-5 w-5 mr-2" />
                    Submit to Codebase
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Uniqueness must be above 35% to submit
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
