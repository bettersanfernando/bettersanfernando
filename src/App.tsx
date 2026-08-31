import { lazy, Suspense } from 'react';
import { NuqsAdapter } from 'nuqs/adapters/react';
import { HelmetProvider } from 'react-helmet-async';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ScrollToTop from './components/ui/ScrollToTop';
import PageLoading from './components/ui/PageLoading';
import { plannedPages } from './data/plannedPages';
import { BrowserRouter as Router, Navigate, Routes, Route } from 'react-router';

// Route-level code splitting: each page ships as its own lazy chunk instead
// of the initial bundle, so e.g. Projects' 239 records only load for
// visitors who actually go to /projects.
const Home = lazy(() => import('./pages/Home'));
const Services = lazy(() => import('./pages/Services'));
const Document = lazy(() => import('./pages/Document'));
const Government = lazy(() => import('./pages/Government'));
const GovernmentOffices = lazy(() => import('./pages/GovernmentOffices'));
const Projects = lazy(() => import('./pages/Projects'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const Search = lazy(() => import('./pages/Search'));
const PlannedPage = lazy(() => import('./pages/PlannedPage'));

function App() {
  return (
    <HelmetProvider>
      <Router>
        <NuqsAdapter>
          <Suspense fallback={<PageLoading />}>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <ScrollToTop />
              <Suspense fallback={<PageLoading />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/services/:category" element={<Services />} />
                  <Route path="/services" element={<Services />} />
                  <Route
                    path="/services/:category/:documentSlug"
                    element={<Document categoryType="service" />}
                  />
                  <Route
                    path="/government/offices"
                    element={<GovernmentOffices />}
                  />
                  <Route
                    path="/government/directory"
                    element={<Navigate to="/government/offices" replace />}
                  />
                  <Route
                    path="/government/contacts"
                    element={<Navigate to="/government/offices" replace />}
                  />
                  <Route
                    path="/government/:category"
                    element={<Government />}
                  />
                  <Route path="/government" element={<Government />} />
                  <Route
                    path="/government/:category/:documentSlug"
                    element={<Document categoryType="government" />}
                  />
                  <Route path="/search" element={<Search />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route
                    path="/projects/:projectId"
                    element={<ProjectDetail />}
                  />
                  {plannedPages.map(page => (
                    <Route
                      key={page.id}
                      path={page.path}
                      element={<PlannedPage pageId={page.id} />}
                    />
                  ))}
                  <Route path="/:lang/:documentSlug" element={<Document />} />
                  <Route path="/:documentSlug" element={<Document />} />
                </Routes>
              </Suspense>
              <Footer />
            </div>
          </Suspense>
        </NuqsAdapter>
      </Router>
    </HelmetProvider>
  );
}

export default App;
