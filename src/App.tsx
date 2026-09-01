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
const ProjectSources = lazy(() => import('./pages/ProjectSources'));
const ProjectMethodology = lazy(() => import('./pages/ProjectMethodology'));
const ProjectMap = lazy(() => import('./pages/ProjectMap'));
const ProjectStatistics = lazy(() => import('./pages/ProjectStatistics'));
const PopulationStatistics = lazy(() => import('./pages/PopulationStatistics'));
const CityProfile = lazy(() => import('./pages/CityProfile'));
const Barangays = lazy(() => import('./pages/Barangays'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const BidResults = lazy(() => import('./pages/BidResults'));
const Contracts = lazy(() => import('./pages/Contracts'));
const ExecutiveOrders = lazy(() => import('./pages/ExecutiveOrders'));
const Ordinances = lazy(() => import('./pages/Ordinances'));
const TransparencySources = lazy(() => import('./pages/TransparencySources'));
const TransparencyMethodology = lazy(
  () => import('./pages/TransparencyMethodology')
);
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
                    path="/procurement/bid-results"
                    element={<BidResults />}
                  />
                  <Route
                    path="/procurement/contracts"
                    element={<Contracts />}
                  />
                  <Route
                    path="/transparency/contracts"
                    element={<Navigate to="/procurement/contracts" replace />}
                  />
                  <Route
                    path="/projects/sources"
                    element={<ProjectSources />}
                  />
                  <Route
                    path="/projects/methodology"
                    element={<ProjectMethodology />}
                  />
                  <Route
                    path="/projects/data-sources"
                    element={<Navigate to="/projects/sources" replace />}
                  />
                  <Route path="/projects/map" element={<ProjectMap />} />
                  <Route
                    path="/projects/dashboard"
                    element={<Navigate to="/statistics/projects" replace />}
                  />
                  <Route
                    path="/statistics/projects"
                    element={<ProjectStatistics />}
                  />
                  <Route
                    path="/statistics/population/barangays"
                    element={
                      <Navigate to="/statistics/population#barangays" replace />
                    }
                  />
                  <Route
                    path="/statistics/population"
                    element={<PopulationStatistics />}
                  />
                  <Route
                    path="/statistics/city-profile"
                    element={<CityProfile />}
                  />
                  <Route path="/barangays" element={<Barangays />} />
                  <Route
                    path="/projects/:projectId"
                    element={<ProjectDetail />}
                  />
                  <Route
                    path="/legislation/executive-orders"
                    element={<ExecutiveOrders />}
                  />
                  <Route
                    path="/legislation/ordinances"
                    element={<Ordinances />}
                  />
                  <Route
                    path="/transparency/sources"
                    element={<TransparencySources />}
                  />
                  <Route
                    path="/transparency/methodology"
                    element={<TransparencyMethodology />}
                  />
                  <Route
                    path="/transparency/verification"
                    element={
                      <Navigate
                        to="/transparency/methodology#verification"
                        replace
                      />
                    }
                  />
                  <Route
                    path="/transparency/limitations"
                    element={
                      <Navigate
                        to="/transparency/methodology#limitations"
                        replace
                      />
                    }
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
