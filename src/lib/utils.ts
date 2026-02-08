import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const markdownToHtml = (text: string): string => {
  return text
    // Heading ### / ## / # -> in đậm
    .replace(/^#{1,4}\s+(.*?)$/gm, '<b>$1</b>')
    // Dấu --- (horizontal rule) -> loại bỏ hoàn toàn
    .replace(/^-{3,}$/gm, '')
    // Bold **text** -> <b>text</b>
    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
};
