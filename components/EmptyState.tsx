import Link from 'next/link';

export default function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 text-6xl">🚗</div>
      <h2 className="mb-2 text-xl font-semibold text-gray-800">還沒記錄停車位置</h2>
      <p className="mb-8 max-w-xs text-sm text-gray-500">
        停好車後，點擊下方按鈕記錄位置，再也不用擔心找不到車！
      </p>
      <Link
        href="/park"
        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 active:scale-95"
      >
        📍 記錄停車位置
      </Link>
    </div>
  );
}
