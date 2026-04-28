export const metadata = {
  title: 'NOW Mortgage — Client Agreement',
  description: 'Review and sign your NOW Mortgage client agreement',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700&family=DM+Sans:wght@400;500&family=DM+Mono:wght@400&family=Dancing+Script:wght@600&display=swap"
          rel="stylesheet"
        />
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'DM Sans', sans-serif;
            background: #F7F5F0;
            color: #0F1F3D;
          }
          :root {
            --navy: #0F1F3D;
            --gold: #B8943F;
            --cream: #F7F5F0;
          }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  )
}
