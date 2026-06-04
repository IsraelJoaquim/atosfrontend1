
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="br-BR">
      <body>{children}</body>
    </html>
  )
}
