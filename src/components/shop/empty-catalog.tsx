export function EmptyCatalog() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-6 py-20 text-center">
      <p className="text-xs tracking-lux uppercase text-muted-foreground">
        Éditions
      </p>
      <h2 className="mt-4 font-display text-3xl font-extrabold tracking-display md:text-4xl">
        Aucun article disponible pour le moment
      </h2>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
        Les prochaines éditions du collectif apparaîtront ici.
      </p>
    </div>
  );
}
