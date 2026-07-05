import Link from 'next/link';

export default function Header({ count }: { count: number }) {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold text-blue-600">
          ParkWhere
        </Link>
        {count > 0 && (
          <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
            {count} 筆
          </span>
        )}
      </div>
    </header>
  );
}
