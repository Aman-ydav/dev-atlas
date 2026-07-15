import { ThemeProvider as NextThemesProvider } from "next-themes";

// index.css defines light tokens on :root and dark overrides on .dark, so
// next-themes must toggle the "class" attribute (not "data-theme").
export function ThemeProvider({ children }) {
    return (
        <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            {children}
        </NextThemesProvider>
    );
}
