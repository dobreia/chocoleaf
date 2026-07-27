import { BrowserRouter, Route, Routes } from "react-router-dom";

import Layout from "./components/Layout";
import Navbar from "./components/Navbar";
import ScrollToTop from "./components/ScrollToTop";
import AboutPage from "./pages/AboutPage";
import AdminBookingsPage from "./pages/AdminBookingsPage";
import AdminCoursesPage from "./pages/AdminCoursePage";
import AdminCourseSlotsPage from "./pages/AdminCourseSlotsPage";
import BookingCalendarPage from "./pages/BookingCalendarPage";
import ContactPage from "./pages/ContactPage";
import CourseDetailsPage from "./pages/CourseDetailsPage";
import CoursesPage from "./pages/CoursesPage";
import GalleryPage from "./pages/GalleryPage";
import GiftCardPage from "./pages/GiftCardPage";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import QuoteRequestPage from "./pages/QuoteRequestPage";
import TransferPage from "./pages/TransferPage";
import CookiePolicyPage from "./pages/legal/CookiePolicyPage";
import ImprintPage from "./pages/legal/ImprintPage";
import PrivacyPolicyPage from "./pages/legal/PrivacyPolicyPage";
import TermsPage from "./pages/legal/TermsPage";

function App() {
  const giftCardRoute = (
    <>
      <Navbar />
      <main className="site-main">
        <GiftCardPage />
      </main>
    </>
  );

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/giftcard" element={giftCardRoute} />
        <Route path="/giftcards" element={giftCardRoute} />

        <Route element={<Layout />}>
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:id" element={<CourseDetailsPage />} />
          <Route path="/courses/:id/book" element={<BookingCalendarPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/quote-request" element={<QuoteRequestPage />} />
          <Route path="/legal/imprint" element={<ImprintPage />} />
          <Route path="/legal/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/legal/terms" element={<TermsPage />} />
          <Route path="/legal/cookies" element={<CookiePolicyPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route path="/transfer" element={<TransferPage />} />
        <Route path="/transfer.html" element={<TransferPage />} />
        <Route path="/admin/courses/:id" element={<AdminCourseSlotsPage />} />
        <Route path="/admin/bookings" element={<AdminBookingsPage />} />
        <Route path="/admin/courses" element={<AdminCoursesPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
