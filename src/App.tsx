import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./contexts/AuthContext";
import { Loader2 } from "lucide-react";

// Critical pages — loaded immediately
import Index from "./pages/Index.tsx";
import Auth from "./pages/Auth.tsx";
import NotFound from "./pages/NotFound.tsx";

// All other pages — lazy loaded
const Discover = lazy(() => import("./pages/Discover.tsx"));
const HabitatDetail = lazy(() => import("./pages/HabitatDetail.tsx"));
const ListingDetail = lazy(() => import("./pages/ListingDetail.tsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.tsx"));
const CreatePlace = lazy(() => import("./pages/CreatePlace.tsx"));
const CreateListing = lazy(() => import("./pages/CreateListing.tsx"));
const CreatePlaceQuick = lazy(() => import("./pages/CreatePlaceQuick.tsx"));
const Onboarding = lazy(() => import("./pages/Onboarding.tsx"));
const ResetPassword = lazy(() => import("./pages/ResetPassword.tsx"));
const ConversationDetail = lazy(() => import("./pages/ConversationDetail.tsx"));
const EditPlace = lazy(() => import("./pages/EditPlace.tsx"));
const EditListing = lazy(() => import("./pages/EditListing.tsx"));
const EditProfile = lazy(() => import("./pages/EditProfile.tsx"));
const CalendarPage = lazy(() => import("./pages/CalendarPage.tsx"));
const HowItWorks = lazy(() => import("./pages/HowItWorks.tsx"));
const Resources = lazy(() => import("./pages/Resources.tsx"));
const ResourceDetail = lazy(() => import("./pages/ResourceDetail.tsx"));
const About = lazy(() => import("./pages/About.tsx"));
const Hospitality = lazy(() => import("./pages/Hospitality.tsx"));
const Charter = lazy(() => import("./pages/Charter.tsx"));
const Contact = lazy(() => import("./pages/Contact.tsx"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard.tsx"));
const AdminPlaces = lazy(() => import("./pages/admin/AdminPlaces.tsx"));
const AdminListings = lazy(() => import("./pages/admin/AdminListings.tsx"));
const AdminClaimsPage = lazy(() => import("./pages/admin/AdminClaimsPage.tsx"));
const AdminResources = lazy(() => import("./pages/admin/AdminResources.tsx"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers.tsx"));
const Unsubscribe = lazy(() => import("./pages/Unsubscribe.tsx"));
const Favorites = lazy(() => import("./pages/Favorites.tsx"));
const SharedWishlist = lazy(() => import("./pages/SharedWishlist.tsx"));
const StayRequests = lazy(() => import("./pages/StayRequests.tsx"));
const StayRequestDetail = lazy(() => import("./pages/StayRequestDetail.tsx"));
const PostStayReview = lazy(() => import("./pages/PostStayReview.tsx"));
const MapView = lazy(() => import("./pages/MapView.tsx"));
const CommunityFeed = lazy(() => import("./pages/CommunityFeed.tsx"));
const PublicStats = lazy(() => import("./pages/PublicStats.tsx"));
const AdminStats = lazy(() => import("./pages/admin/AdminStats.tsx"));
const AdminLinkChecker = lazy(() => import("./pages/admin/AdminLinkChecker.tsx"));
const AdminReports = lazy(() => import("./pages/admin/AdminReports.tsx"));
const AdminExchanges = lazy(() => import("./pages/admin/AdminExchanges.tsx"));
const AdminPoints = lazy(() => import("./pages/admin/AdminPoints.tsx"));
const AdminEmails = lazy(() => import("./pages/admin/AdminEmails.tsx"));
const Referrals = lazy(() => import("./pages/Referrals.tsx"));
const MyPoints = lazy(() => import("./pages/MyPoints.tsx"));
const VerifyClaim = lazy(() => import("./pages/VerifyClaim.tsx"));

import ScrollToTop from "./components/ScrollToTop";
import FeedbackButton from "./components/FeedbackButton";

const queryClient = new QueryClient();

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/discover" element={<Discover />} />
              <Route path="/habitat/:id" element={<HabitatDetail />} />
              <Route path="/listing/:id" element={<ListingDetail />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/create-place" element={<CreatePlace />} />
              <Route path="/create-place/quick" element={<CreatePlaceQuick />} />
              <Route path="/create-listing" element={<CreateListing />} />
              <Route path="/messages/:id" element={<ConversationDetail />} />
              <Route path="/edit-place/:id" element={<EditPlace />} />
              <Route path="/edit-listing/:id" element={<EditListing />} />
              <Route path="/edit-profile" element={<EditProfile />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/comment-ca-marche" element={<HowItWorks />} />
              <Route path="/communaute" element={<CommunityFeed />} />
              <Route path="/ressources" element={<Resources />} />
              <Route path="/ressources/:slug" element={<ResourceDetail />} />
              <Route path="/a-propos" element={<About />} />
              <Route path="/hospitalite" element={<Hospitality />} />
              <Route path="/charte" element={<Charter />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/places" element={<AdminPlaces />} />
              <Route path="/admin/listings" element={<AdminListings />} />
              <Route path="/admin/claims" element={<AdminClaimsPage />} />
              <Route path="/admin/resources" element={<AdminResources />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/unsubscribe" element={<Unsubscribe />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/shared-wishlist/:token" element={<SharedWishlist />} />
              <Route path="/stay-requests" element={<StayRequests />} />
              <Route path="/stay-requests/:id" element={<StayRequestDetail />} />
              <Route path="/post-stay-review" element={<PostStayReview />} />
              <Route path="/map" element={<MapView />} />
              <Route path="/statistiques" element={<PublicStats />} />
              <Route path="/admin/stats" element={<AdminStats />} />
              <Route path="/admin/link-checker" element={<AdminLinkChecker />} />
              <Route path="/admin/reports" element={<AdminReports />} />
              <Route path="/admin/exchanges" element={<AdminExchanges />} />
              <Route path="/admin/points" element={<AdminPoints />} />
              <Route path="/admin/emails" element={<AdminEmails />} />
              <Route path="/referrals" element={<Referrals />} />
              <Route path="/points" element={<MyPoints />} />
              <Route path="/verify-claim" element={<VerifyClaim />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <FeedbackButton />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
  </ThemeProvider>
);

export default App;
