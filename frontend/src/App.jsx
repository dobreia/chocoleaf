import { BrowserRouter, Route, Routes } from "react-router-dom";

import Layout from "./components/Layout";
import ScrollToTop from "./components/ScrollToTop";
import AboutPage from "./pages/AboutPage";
import AdminCoursesPage from "./pages/AdminCoursePage";
import ContactPage from "./pages/ContactPage";
import CourseDetailsPage from "./pages/CourseDetailsPage";
import CoursesPage from "./pages/CoursesPage";
import GalleryPage from "./pages/GalleryPage";
import GiftCardPage from "./pages/GiftCardPage";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import QuoteRequestPage from "./pages/QuoteRequestPage";
import CookiePolicyPage from "./pages/legal/CookiePolicyPage";
import ImprintPage from "./pages/legal/ImprintPage";
import PrivacyPolicyPage from "./pages/legal/PrivacyPolicyPage";
import TermsPage from "./pages/legal/TermsPage";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route element={<Layout />}>
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:id" element={<CourseDetailsPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/giftcards" element={<GiftCardPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/quote-request" element={<QuoteRequestPage />} />
          <Route path="/legal/imprint" element={<ImprintPage />} />
          <Route path="/legal/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/legal/terms" element={<TermsPage />} />
          <Route path="/legal/cookies" element={<CookiePolicyPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route path="/admin/courses" element={<AdminCoursesPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
