import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PiNetworkProvider } from "./hooks/use-pi-network";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import AdminPanel from "@/pages/admin";
import PrivacyPolicy from "@/pages/privacy-policy";
import TermsOfService from "@/pages/terms-of-service";
import RefundPolicy from "@/pages/refund-policy";
import DataProtection from "@/pages/data-protection";
import UserAgreement from "@/pages/user-agreement";
import AboutUs from "@/pages/about-us";
import OurHistory from "@/pages/our-history";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/admin" component={AdminPanel} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms-of-service" component={TermsOfService} />
      <Route path="/refund-policy" component={RefundPolicy} />
      <Route path="/data-protection" component={DataProtection} />
      <Route path="/user-agreement" component={UserAgreement} />
      <Route path="/about-us" component={AboutUs} />
      <Route path="/our-history" component={OurHistory} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <PiNetworkProvider>
          <div className="dark min-h-screen bg-background text-foreground">
            <Toaster />
            <Router />
          </div>
        </PiNetworkProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
