import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Check, ExternalLink, AlertCircle, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { UniquenessResponse, CodeRecord, ThresholdsResponse } from '@/types/api';
import { useToast } from '@/hooks/use-toast';

interface ResultsPanelProps {
  result: UniquenessResponse | null;
  nearestCode: CodeRecord | null;
  loading: boolean;
  error: string | null;
  onClear?: () => void;
  thresholds: ThresholdsResponse | null;
  codeChanged?: boolean;
}

export const ResultsPanel = ({ result, nearestCode, loading, error, onClear, thresholds, codeChanged }: ResultsPanelProps) => {
  const [copiedId, setCopiedId] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = async (text: string, type: 'id' | 'code') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'id') {
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
      } else {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      }
      toast({
        title: "Copied to clipboard",
        description: `${type === 'id' ? 'Code ID' : 'Code'} copied successfully`,
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Copy failed",
        description: "Unable to copy to clipboard",
      });
    }
  };

  // Calculate state based on thresholds (uniqueness_percent is 0-100, thresholds are 0-1)
  const getDecisionState = (value: number): 'green' | 'yellow' | 'red' => {
    if (!thresholds) return 'red';
    const normalizedValue = value / 100; // Convert percent to 0-1 scale
    if (normalizedValue >= thresholds.t_high) return 'green';
    if (normalizedValue > thresholds.t_low) return 'yellow';
    return 'red';
  };

  const getUniquenessColor = (state: 'green' | 'yellow' | 'red') => {
    if (state === 'green') return 'text-success';
    if (state === 'yellow') return 'text-warning';
    return 'text-destructive';
  };

  const getUniquenessIcon = (state: 'green' | 'yellow' | 'red') => {
    if (state === 'green') return <CheckCircle className="h-4 w-4" />;
    if (state === 'yellow') return <AlertTriangle className="h-4 w-4" />;
    return <AlertCircle className="h-4 w-4" />;
  };

  const getUniquenessVariant = (state: 'green' | 'yellow' | 'red'): "default" | "secondary" | "destructive" => {
    if (state === 'green') return 'default';
    if (state === 'yellow') return 'secondary';
    return 'destructive';
  };

  const getStateMessage = (state: 'green' | 'yellow' | 'red') => {
    if (state === 'green') return 'Code looks sufficiently unique. You can safely add it to the codebase.';
    if (state === 'yellow') return 'This code is in the gray zone and requires manual review for potential plagiarism.';
    return 'High risk of plagiarism or strong similarity detected. Please revise the code.';
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-160px)] flex flex-col">
        <header className="shrink-0 flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-sm font-medium">Analyzing Code...</span>
          </div>
        </header>
        <Card className="flex-1 bg-gradient-card border-border animate-pulse">
          <CardContent className="p-6 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <div className="h-8 w-8 mx-auto mb-2 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p>Checking uniqueness against codebase...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[calc(100vh-160px)] flex flex-col">
        <header className="shrink-0 flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span className="text-sm font-medium text-destructive">Analysis Failed</span>
          </div>
        </header>
        <Card className="flex-1 bg-gradient-card border-destructive/20">
          <CardContent className="p-6 flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
              <p className="text-destructive font-medium mb-2">Error occurred</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="h-[calc(100vh-160px)] flex flex-col">
        <header className="shrink-0 flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
            <span className="text-lg font-semibold text-muted-foreground">Analysis Results</span>
          </div>
        </header>
        <Card className="flex-1 bg-gradient-card border-border">
          <CardContent className="p-6 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <ExternalLink className="h-12 w-12 mx-auto mb-4" />
              <p className="font-medium mb-2">Ready to analyze</p>
              <p className="text-sm">Select a language and paste your code to check uniqueness</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // uniqueness_percent is already 0-100, use directly for display
  const displayPercent = Math.round(result.uniqueness_percent * 100) / 100;
  const similarityPercent = Math.round(result.similarity * 10000) / 100;
  const decisionState = getDecisionState(result.uniqueness_percent);

  return (
    <div className="h-[calc(100vh-160px)] flex flex-col">
      {/* Results Header */}
      <header className="shrink-0 flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {getUniquenessIcon(decisionState)}
          <span className="text-lg font-semibold">Analysis Results</span>
        </div>
        {onClear && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="h-8 px-3 text-muted-foreground hover:text-foreground"
            aria-label="Clear results and editor"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </header>

      {codeChanged && (
        <Card className="shrink-0 bg-warning/10 border-warning/30 mb-4">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-sm text-warning">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <p>Code has been modified. Run check again before submission.</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex-1 overflow-auto space-y-4">
        {/* Uniqueness Score */}
        <Card className="shrink-0 bg-gradient-card border-border shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              Uniqueness Score
              <Badge variant={getUniquenessVariant(decisionState)} className={getUniquenessColor(decisionState)}>
                {displayPercent.toFixed(1)}%
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Similarity: {similarityPercent.toFixed(2)}%</span>
              <span className={getUniquenessColor(decisionState)}>
                {decisionState === 'green' ? 'Safe to submit' : decisionState === 'yellow' ? 'Needs review' : 'Too similar'}
              </span>
            </div>
            {thresholds && (
              <div className="pt-2 border-t border-border">
                <p className={`text-sm ${getUniquenessColor(decisionState)}`}>
                  {getStateMessage(decisionState)}
                </p>
                <div className="mt-2 text-xs text-muted-foreground">
                  <p>Thresholds: Low ≤ {(thresholds.t_low * 100).toFixed(0)}% | High ≥ {(thresholds.t_high * 100).toFixed(0)}%</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Nearest Match */}
        {result.closest_id && nearestCode ? (
          <Card className="bg-gradient-card border-border shadow-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Nearest Match</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(result.closest_id!, 'id')}
                  className="h-8 px-2"
                  aria-label="Copy code ID"
                >
                  {copiedId ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>
              <div className="flex gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="text-xs">
                  {nearestCode.lang}
                </Badge>
                <span>ID: {result.closest_id.slice(0, 8)}...</span>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="relative">
                <pre
                  className="
                    bg-neutral-900 rounded-xl p-4
                    min-h-[360px] max-h-[60vh]
                    overflow-auto leading-6 text-sm
                    font-mono text-neutral-100
                  "
                  aria-label="Nearest match code"
                >
                  <code>{nearestCode.code || ''}</code>
                </pre>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(nearestCode.code || '', 'code')}
                  className="absolute top-3 right-3 h-8 px-2 bg-secondary/80 hover:bg-secondary"
                  aria-label="Copy nearest match code"
                >
                  {copiedCode ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : result.closest_id === null ? (
          <Card className="bg-gradient-card border-border shadow-card">
            <CardContent className="p-6 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-success" />
                <p className="font-medium mb-2 text-success">No similar code found</p>
                <p className="text-sm">Your code appears to be completely unique!</p>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
};