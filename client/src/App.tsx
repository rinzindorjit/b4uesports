import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PiNetworkProvider } from "./hooks/use-pi-network";
import { SimpleAuthProvider } from "./hooks/use-simple-auth";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import TestDashboard from "@/pages/test-dashboard";
import SimpleTest from "@/pages/simple-test";
import MinimalDashboard from "@/pages/minimal-dashboard";
import AuthTestSimple from "@/pages/auth-test-simple";
import SimpleAuthTest from "@/pages/simple-auth-test";
import AuthDebug from "@/pages/auth-debug";
import ConsoleLogs from "@/pages/console-logs";
import NotFound from "@/pages/not-found";

function App() {
  console.log('App component rendering');
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SimpleAuthProvider>
          <PiNetworkProvider>
            <div className="dark min-h-screen bg-background text-foreground">
              <Toaster />
              <Switch>
                <Route path="/" component={Landing} />
                <Route path="/dashboard" component={Dashboard} />
                <Route path="/test-dashboard" component={TestDashboard} />
                <Route path="/simple-test" component={SimpleTest} />
                <Route path="/minimal-dashboard" component={MinimalDashboard} />
                <Route path="/auth-test-simple" component={AuthTestSimple} />
                <Route path="/simple-auth-test" component={SimpleAuthTest} />
                <Route path="/auth-debug" component={AuthDebug} />
                <Route path="/console-logs" component={ConsoleLogs} />
                <Route component={NotFound} />
              </Switch>
            </div>
          </PiNetworkProvider>
        </SimpleAuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;