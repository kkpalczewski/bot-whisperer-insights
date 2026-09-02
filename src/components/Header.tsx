import { FingerprintIcon } from "lucide-react";

export const Header = () => (
  <header className="py-4 px-6 bg-gray-900 border-b border-gray-800">
    <div className="container mx-auto flex justify-between items-center">
      <div className="flex items-center gap-2">
        <FingerprintIcon size={24} className="text-blue-400" />
        <h1 className="text-xl font-bold text-white">
          B2BD - Bot-to-Bot Detector
        </h1>
      </div>
      <span className="text-xs font-mono text-gray-500">v{__APP_VERSION__}</span>
    </div>
  </header>
);
