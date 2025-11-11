// ImagePage.tsx
import ImageSelector from "@/components/bgremover";

export default function ImagePage() {
  return (
    <main className="h-screen w-full bg-black text-gray-900 font-sans flex justify-center items-center p-0 m-0 overflow-hidden">
      <ImageSelector />
    </main>
  );
}