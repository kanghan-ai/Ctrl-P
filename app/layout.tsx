import type { Metadata } from "next";
import { Inter, Lora, Nunito, Comfortaa } from "next/font/google"; // Import Comfortaa
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const lora = Lora({ subsets: ["latin"], variable: "--font-lora" });
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito" });
const comfortaa = Comfortaa({ subsets: ["latin"], variable: "--font-comfortaa" }); // Configure Comfortaa

export const metadata: Metadata = {
    title: "Ctrl P - Master Your Prompts",
    description: "A gallery for tattoo concepts, a library for industry frameworks, and a repository for core prompting principles.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="zh-CN">
            <body className={`${inter.variable} ${lora.variable} ${nunito.variable} ${comfortaa.variable} font-sans`}>{children}</body>
        </html>
    );
}
