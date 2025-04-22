import { Loader2 } from "lucide-react";

export const LoadingIndicator = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-950">
      <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
    </div>
  );
};
