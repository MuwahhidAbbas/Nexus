import { useState } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { setAuthTokenGetter } from "@workspace/api-client-react";

setAuthTokenGetter(() => localStorage.getItem('auth_token'));

import { LoadingScreen } from "./components/loading-screen";
import { Layout } from "./components/layout";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import Learning from "./pages/learning";
import CourseDetail from "./pages/course-detail";
import Tasks from "./pages/tasks";
import Files from "./pages/files";
import Automations from "./pages/automations";
import Users from "./pages/users";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    }
  }
});

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {showSplash ? (
          <LoadingScreen onComplete={() => setShowSplash(false)} />
        ) : (
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Switch>
              <Route path="/login" component={Login} />
              
              <Route path="/">
                 {() => <Layout><Dashboard /></Layout>}
              </Route>

              {/* Protected Routes wrapped in Layout */}
              <Route path="/dashboard">
                 {() => <Layout><Dashboard /></Layout>}
              </Route>
              <Route path="/learning">
                 {() => <Layout><Learning /></Layout>}
              </Route>
              <Route path="/learning/:id">
                 {() => <Layout><CourseDetail /></Layout>}
              </Route>
              <Route path="/tasks">
                 {() => <Layout><Tasks /></Layout>}
              </Route>
              <Route path="/files">
                 {() => <Layout><Files /></Layout>}
              </Route>
              <Route path="/automations">
                 {() => <Layout><Automations /></Layout>}
              </Route>
              <Route path="/users">
                 {() => <Layout><Users /></Layout>}
              </Route>

              {/* Fallback */}
              <Route>
                {() => (
                  <Layout>
                    <div className="p-8 text-center text-muted-foreground">Page not found</div>
                  </Layout>
                )}
              </Route>
            </Switch>
          </WouterRouter>
        )}
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
