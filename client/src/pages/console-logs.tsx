import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function ConsoleLogs() {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    // Override console.log to capture logs
    const originalLog = console.log;
    const originalError = console.error;
    
    console.log = (...args) => {
      originalLog(...args);
      const logEntry = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      setLogs(prev => [...prev, `[LOG] ${logEntry}`].slice(-100)); // Keep last 100 logs
    };
    
    console.error = (...args) => {
      originalError(...args);
      const logEntry = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      setLogs(prev => [...prev, `[ERROR] ${logEntry}`].slice(-100)); // Keep last 100 logs
    };
    
    // Log initial message
    console.log('Console logs component mounted');
    
    // Cleanup
    return () => {
      console.log = originalLog;
      console.error = originalError;
    };
  }, []);

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Console Logs</h1>
          <Button onClick={clearLogs} variant="outline">Clear Logs</Button>
        </div>
        
        <div className="bg-card rounded-lg p-6">
          <div className="space-y-2 max-h-[70vh] overflow-y-auto">
            {logs.map((log, index) => (
              <div 
                key={index} 
                className={`p-2 rounded font-mono text-sm ${
                  log.startsWith('[ERROR]') ? 'bg-red-500/20 text-red-300' : 'bg-muted'
                }`}
              >
                {log}
              </div>
            ))}
            {logs.length === 0 && (
              <p className="text-muted-foreground text-center py-8">
                No logs yet. Navigate to other pages to see logs.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}