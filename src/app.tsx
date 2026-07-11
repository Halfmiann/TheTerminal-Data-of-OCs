import { Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import NotFoundPage from '@/pages/NotFoundPage/NotFoundPage';
import HomePage from '@/pages/HomePage/HomePage';
import TimelinePage from '@/pages/TimelinePage/TimelinePage';
import StoryDetailPage from '@/pages/StoryDetailPage/StoryDetailPage';
import OverviewPage from '@/pages/OverviewPage/OverviewPage';
import ArchivePage from '@/pages/ArchivePage/ArchivePage';
import ArchiveSearchPage from '@/pages/ArchivePage/ArchiveSearchPage';
import ArchiveRecentPage from '@/pages/ArchivePage/ArchiveRecentPage';
import RegionMetropoliaPage from '@/pages/ArchivePage/RegionMetropoliaPage';
import CharacterDetailPage from '@/pages/CharacterDetailPage/CharacterDetailPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="timeline" element={<TimelinePage />} />
        <Route path="story/:id" element={<StoryDetailPage />} />
        <Route path="overview" element={<OverviewPage />} />
        <Route path="archive" element={<ArchivePage />} />
        <Route path="archive/search" element={<ArchiveSearchPage />} />
        <Route path="archive/recent" element={<ArchiveRecentPage />} />
        <Route path="archive/region/metropolia" element={<RegionMetropoliaPage />} />
        <Route path="character/:id" element={<CharacterDetailPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
