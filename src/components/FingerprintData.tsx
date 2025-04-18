
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSession } from '@supabase/auth-helpers-react';
import { getBrowserFingerprint, getCanvasFingerprint } from '@/utils/fingerprint-helpers';
import { SaveIcon, ShieldIcon } from 'lucide-react';
import { toast } from 'sonner';

export const FingerprintData = () => {
  const [loading, setLoading] = useState(false);
  const session = useSession();

  const handleSubmitFingerprint = async () => {
    if (!session) {
      toast.error("Login required", {
        description: "Please login to submit your fingerprint data"
      });
      return;
    }

    setLoading(true);
    
    try {
      // Gather fingerprint data
      const fingerprintData = {
        browserData: getBrowserFingerprint(),
        canvasFingerprint: getCanvasFingerprint(),
        timestamp: new Date().toISOString()
      };

      // Supabase would be used here to submit data
      // const { data, error } = await supabase
      //   .from('fingerprints')
      //   .insert([{ user_id: session.user.id, data: fingerprintData }]);

      // For now just simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Fingerprint submitted", {
        description: "Your browser fingerprint has been successfully saved."
      });
    } catch (error) {
      toast.error("Submission failed", {
        description: (error as Error).message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mt-16 mb-8 dark:bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <ShieldIcon size={20} className="text-blue-400" />
          Submit Your Fingerprint
        </CardTitle>
        <CardDescription className="text-gray-400">
          Login and submit your browser fingerprint for analysis. This helps us better understand the diversity of real user browsers.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-gray-300">
        <p>
          Your fingerprint includes browser information, device capabilities, and unique rendering characteristics.
          All data is anonymized and only used for research purposes.
        </p>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSubmitFingerprint} 
          disabled={!session || loading}
          className="flex items-center gap-2"
          variant="default"
        >
          <SaveIcon size={16} />
          {loading ? "Submitting..." : "Submit My Fingerprint"}
        </Button>
        {!session && (
          <p className="ml-4 text-sm text-yellow-500">Please login to enable submission</p>
        )}
      </CardFooter>
    </Card>
  );
};
