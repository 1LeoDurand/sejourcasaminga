import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index.tsx";
import Discover from "./pages/Discover.tsx";
import HabitatDetail from "./pages/HabitatDetail.tsx";
import ListingDetail from "./pages/ListingDetail.tsx";
import Auth from "./pages/Auth.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import CreatePlace from "./pages/CreatePlace.tsx";
import CreateListing from "./pages/CreateListing.tsx";
import CreatePlaceQuick from "./pages/CreatePlaceQuick.tsx";
import Onboarding from "./pages/Onboarding.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import ConversationDetail from "./pages/ConversationDetail.tsx";
import EditPlace from "./pages/EditPlace.tsx";
import EditListing from "./pages/EditListing.tsx";
import EditProfile from "./pages/EditProfile.tsx";
import CalendarPage from "./pages/CalendarPage.tsx";
import HowItWorks from "./pages/HowItWorks.tsx";
import Blog from "./pages/Blog.tsx";
import BlogArticle from "./pages/BlogArticle.tsx";
import Resources from "./pages/Resources.tsx";
import AdminDashboard from "./pages/admin/AdminDashboard.tsx";
import AdminPlaces from "./pages/admin/AdminPlaces.tsx";
import AdminListings from "./pages/admin/AdminListings.tsx";
import AdminClaimsPage from "./pages/admin/AdminClaimsPage.tsx";
import AdminBlog from "./pages/admin/AdminBlog.tsx";
import AdminResources from "./pages/admin/AdminResources.tsx";
import AdminUsers from "./pages/admin/AdminUsers.tsx";
import Unsubscribe from "./pages/Unsubscribe.tsx";
import Favorites from "./pages/Favorites.tsx";
import SharedWishlist from "./pages/SharedWishlist.tsx";
import StayRequests from "./pages/StayRequests.tsx";
import StayRequestDetail from "./pages/StayRequestDetail.tsx";
import PostStayReview from "./pages/PostStayReview.tsx";
import MapView from "./pages/MapView.tsx";
import CommunityFeed from "./pages/CommunityFeed.tsx";
import PublicStats from "./pages/PublicStats.tsx";
import AdminStats from "./pages/admin/AdminStats.tsx";
import AdminLinkChecker from "./pages/admin/AdminLinkChecker.tsx";
import Referrals from "./pages/Referrals.tsx";
import VerifyClaim from "./pages/VerifyClaim.tsx";
import NotFound from "./pages/NotFound.tsx";

import ScrollToTop from "./components/ScrollToTop";
import FeedbackButton from "./components/FeedbackButton";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
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
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogArticle />} />
            <Route path="/communaute" element={<CommunityFeed />} />
            <Route path="/ressources" element={<Resources />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/places" element={<AdminPlaces />} />
            <Route path="/admin/listings" element={<AdminListings />} />
            <Route path="/admin/claims" element={<AdminClaimsPage />} />
            <Route path="/admin/blog" element={<AdminBlog />} />
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
            <Route path="/referrals" element={<Referrals />} />
            <Route path="/verify-claim" element={<VerifyClaim />} />
            <Route path="*" element={<NotFound />} />

          </Routes>
          <FeedbackButton />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
