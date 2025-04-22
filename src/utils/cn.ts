import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function getFileExtension(path: string): string {
  const match = path.match(/\.([^.]+)$/);
  return match ? match[1].toLowerCase() : '';
}