
import React, { useEffect, useState } from 'react';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { Button } from '@/components/ui/button';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Fingerprint, Save, CheckCircle } from 'lucide-react';
import { detectionFeatures } from '@/config/detectionFeatures';

interface CollectedData {
  [key: string]: any;
  fingerprintjsVisitorId?: string;
  timestamp: number;
}

export const FingerprintData: React.FC = () => {
  const [fingerprint, setFingerprint] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const user = useUser();
  const supabase = useSupabaseClient();

  useEffect(() => {
    const loadFingerprint = async () => {
      try {
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        setFingerprint(result.visitorId);
      } catch (err) {
        console.error('Error loading fingerprint:', err);
      }
    };

    loadFingerprint();
  }, []);

  const collectData = (): CollectedData => {
    // Collect data from all detectionFeatures that can be evaluated
    const data: CollectedData = {
      timestamp: Date.now(),
      fingerprintjsVisitorId: fingerprint || undefined
    };

    detectionFeatures.forEach(feature => {
      try {
        // Skip features that are just comments or require special handling
        if (feature.code.startsWith('//')) return;
        
        const value = new Function(`return ${feature.code}`)();
        data[feature.id] = value;
      } catch (err) {
        // Skip features that can't be evaluated
        console.warn(`Could not evaluate ${feature.name}:`, err);
      }
    });

    return data;
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = collectData();
      
      const { error: dbError } = await supabase
        .from('fingerprints')
        .insert([
          { 
            user_id: user.id,
            data
          }
        ]);
        
      if (dbError) throw dbError;
      
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      console.error('Error submitting data:', err);
      setError('Failed to submit data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fingerprint className="h-5 w-5" />
            Submit Your Fingerprint
          </CardTitle>
          <CardDescription>
            Login to save your device fingerprint for bot detection research.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fingerprint className="h-5 w-5" />
          Submit Your Fingerprint
        </CardTitle>
        <CardDescription>
          Save your device fingerprint for bot detection research.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {fingerprint && (
          <div className="bg-gray-100 p-3 rounded-md">
            <p className="text-sm text-gray-500 mb-1">Your FingerprintJS visitor ID:</p>
            <p className="font-mono text-sm">{fingerprint}</p>
          </div>
        )}
        
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={handleSubmit} 
          disabled={loading || submitted || !fingerprint}
        >
          {submitted ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Submitted
            </>
          ) : loading ? (
            'Submitting...'
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Submit Fingerprint Data
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
