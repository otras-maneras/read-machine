import { useEffect } from 'react';
import { useReaderStore } from './stores/reader-store';
import { LibraryView } from './components/library/LibraryView';
import { ImportView } from './components/import/ImportView';
import { ReaderView } from './components/reader/ReaderView';

export default function App() {
  const { screen, initialized, init } = useReaderStore();

  useEffect(() => {
    void init();
  }, [init]);

  if (!initialized) {
    return (
      <div className="flex min-h-svh items-center justify-center text-sm text-reader-muted">
        Cargando…
      </div>
    );
  }

  return (
    <div className="min-h-svh w-full">
      {screen === 'library' && <LibraryView />}
      {screen === 'import' && <ImportView />}
      {screen === 'reader' && <ReaderView />}
    </div>
  );
}
