import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { AdminRoute } from "@/routes/AdminRoute";
import { GuestRoute } from "@/routes/GuestRoute";

import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import AuthCallbackPage from "@/pages/AuthCallbackPage";
import DashboardPage from "@/pages/DashboardPage";
import ExplorePage from "@/pages/ExplorePage";
import ExploreCategoryPage from "@/pages/ExploreCategoryPage";
import PracticePage from "@/pages/PracticePage";
import InterviewPage from "@/pages/InterviewPage";
import CaseStudiesPage from "@/pages/CaseStudiesPage";
import ResourcesPage from "@/pages/ResourcesPage";
import LearningPathsPage from "@/pages/LearningPathsPage";
import LearningPathDetailPage from "@/pages/LearningPathDetailPage";
import KnowledgeDetailPage from "@/pages/KnowledgeDetailPage";
import SearchPage from "@/pages/SearchPage";
import RevisionPage from "@/pages/RevisionPage";
import BookmarksPage from "@/pages/BookmarksPage";
import ProfilePage from "@/pages/ProfilePage";
import NotFoundPage from "@/pages/NotFoundPage";

import AdminLayout from "@/pages/admin/AdminLayout";
import AdminOverviewPage from "@/pages/admin/AdminOverviewPage";
import AdminEditorPage from "@/pages/admin/AdminEditorPage";
import AdminDsaImportPage from "@/pages/admin/AdminDsaImportPage";
import AdminCategoriesPage from "@/pages/admin/AdminCategoriesPage";
import AdminLearningPathsPage from "@/pages/admin/AdminLearningPathsPage";
import AdminLearningPathEditorPage from "@/pages/admin/AdminLearningPathEditorPage";
import AdminCompaniesPage from "@/pages/admin/AdminCompaniesPage";
import AdminResourcesPage from "@/pages/admin/AdminResourcesPage";
import AdminCommentsPage from "@/pages/admin/AdminCommentsPage";
import AdminUsersPage from "@/pages/admin/AdminUsersPage";

export default function App() {
    return (
        <>
            <Routes>
                <Route path="/" element={<LandingPage />} />

                <Route element={<GuestRoute />}>
                    <Route path="/login" element={<LoginPage />} />
                </Route>
                <Route path="/auth/callback" element={<AuthCallbackPage />} />

                <Route element={<ProtectedRoute />}>
                    <Route element={<AppLayout />}>
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/explore" element={<ExplorePage />} />
                        <Route path="/explore/:categorySlug" element={<ExploreCategoryPage />} />
                        <Route path="/practice" element={<PracticePage />} />
                        <Route path="/interview" element={<InterviewPage />} />
                        <Route path="/case-studies" element={<CaseStudiesPage />} />
                        <Route path="/projects" element={<Navigate to="/case-studies" replace />} />
                        <Route path="/resources" element={<ResourcesPage />} />
                        <Route path="/paths" element={<LearningPathsPage />} />
                        <Route path="/paths/:slug" element={<LearningPathDetailPage />} />
                        <Route path="/knowledge/:slug" element={<KnowledgeDetailPage />} />
                        <Route path="/search" element={<SearchPage />} />
                        <Route path="/revision" element={<RevisionPage />} />
                        <Route path="/bookmarks" element={<BookmarksPage />} />
                        <Route path="/profile" element={<ProfilePage />} />

                        <Route element={<AdminRoute />}>
                            <Route path="/admin" element={<AdminLayout />}>
                                <Route index element={<AdminOverviewPage />} />
                                <Route path="knowledge/new" element={<AdminEditorPage />} />
                                <Route path="knowledge/:slug/edit" element={<AdminEditorPage />} />
                                <Route path="dsa-import" element={<AdminDsaImportPage />} />
                                <Route path="categories" element={<AdminCategoriesPage />} />
                                <Route path="learning-paths" element={<AdminLearningPathsPage />} />
                                <Route path="learning-paths/new" element={<AdminLearningPathEditorPage />} />
                                <Route path="learning-paths/:slug/edit" element={<AdminLearningPathEditorPage />} />
                                <Route path="companies" element={<AdminCompaniesPage />} />
                                <Route path="resources" element={<AdminResourcesPage />} />
                                <Route path="comments" element={<AdminCommentsPage />} />
                                <Route path="users" element={<AdminUsersPage />} />
                            </Route>
                        </Route>

                        <Route path="*" element={<NotFoundPage />} />
                    </Route>
                </Route>
            </Routes>
            <Toaster />
        </>
    );
}
