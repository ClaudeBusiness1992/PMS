export default function MietvertraegeLayout({ children }: { children: React.ReactNode }) {
  // Break out of the parent max-w-5xl/px-6/py-10 container
  // so the split panel can fill the full viewport width and height.
  return <div className="-mx-6 -my-10">{children}</div>
}
