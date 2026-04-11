export default function PageHeader({ title, children }) {
  return (
    <div className="flex items-center justify-between px-6 pt-6 pb-4 bg-[var(--ds-background-200)] border-b border-[var(--ds-gray-200)]">
      <h1 className="text-heading-24 text-[var(--ds-gray-1000)] m-0">
        {title}
      </h1>
      {children && (
        <div className="flex gap-2 items-center">
          {children}
        </div>
      )}
    </div>
  );
}
