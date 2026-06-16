import { Analytics } from '@vercel/analytics/next';
import { Inter, Poppins, Geist_Mono } from 'next/font/google';
import './globals.css';
const inter = Inter({ variable: '--font-inter', subsets: ['latin'] });
const poppins = Poppins({
    variable: '--font-poppins',
    subsets: ['latin'],
    weight: ['500', '600', '700'],
});
const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});
export const metadata = {
    title: 'GestorComandas | Sistema de Gerenciamento',
    description: 'Sistema profissional de gerenciamento de comandas para bares e restaurantes.',
    generator: 'v0.app',
    icons: {
        icon: [
            {
                url: '/icon-light-32x32.png',
                media: '(prefers-color-scheme: light)',
            },
            {
                url: '/icon-dark-32x32.png',
                media: '(prefers-color-scheme: dark)',
            },
            {
                url: '/icon.svg',
                type: 'image/svg+xml',
            },
        ],
        apple: '/apple-icon.png',
    },
};
export const viewport = {
    colorScheme: 'light dark',
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: 'white' },
        { media: '(prefers-color-scheme: dark)', color: 'black' },
    ],
};
export default function RootLayout({ children, }) {
    return (<html lang="pt-BR" className={`${inter.variable} ${poppins.variable} ${geistMono.variable} bg-background`}>
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>);
}
