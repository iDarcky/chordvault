export default function PageHeader({ title, children }) {
  return (
    <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-accents-2">
      <h1 className="text-xl font-bold text-foreground tracking-tight m-0">
        {title}
      </h1>
      {children && (
        <div className="flex items-center gap-2">
          {children}
        </div>
      )}
    </div>
  );
}
