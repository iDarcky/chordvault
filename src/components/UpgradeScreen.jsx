import ScreenHeader from './ui/ScreenHeader';
import { Button } from './ui/Button';

const FEATURES = [
  { title: 'Cloud sync', body: 'Keep your library in sync across every device via Google Drive, Dropbox, or OneDrive.' },
  { title: 'Unlimited setlists', body: 'No caps on how many services you can plan ahead.' },
  { title: 'Team sharing', body: 'Share setlists with your band. Coming in v2.' },
];

export default function UpgradeScreen({ onBack }) {
  const feedbackUrl = 'https://github.com/idarcky/setlists-md/issues/new?labels=pro-interest';

  return (
    <div data-theme-variant="modes" className="min-h-screen flex flex-col">
      <ScreenHeader onBack={onBack} title="Setlists MD Pro" />

      <div className="flex-1 flex items-start justify-center px-4 py-6 sm:py-10">
        <div className="w-full max-w-md flex flex-col gap-5">
          <div className="modes-card-strong p-6 flex flex-col gap-3 text-center">
            <h1 className="text-heading-24 font-bold text-[var(--modes-text)] m-0">
              Pro is on the way
            </h1>
            <p className="text-copy-14 text-[var(--modes-text-muted)] m-0">
              Billing is wired up in v1.1. In the meantime, Pro features are available
              to everyone who signs in.
            </p>
          </div>

          <div className="modes-card overflow-hidden divide-y" style={{ borderColor: 'var(--modes-border)' }}>
            {FEATURES.map(f => (
              <div key={f.title} className="p-4 flex flex-col gap-1">
                <h3 className="text-heading-16 text-[var(--modes-text)] m-0 font-semibold">
                  {f.title}
                </h3>
                <p className="text-copy-14 text-[var(--modes-text-muted)] m-0">
                  {f.body}
                </p>
              </div>
            ))}
          </div>

          <Button
            variant="brand"
            size="lg"
            className="w-full"
            onClick={() => window.open(feedbackUrl, '_blank', 'noopener,noreferrer')}
          >
            Tell us what you'd pay for
          </Button>

          <p className="text-copy-12 text-[var(--modes-text-dim)] text-center m-0">
            Opens a GitHub issue. No email required.
          </p>
        </div>
      </div>
    </div>
  );
}
