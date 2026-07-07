import Link from 'next/link';
import { CarFront, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <CarFront className="size-8" />
      </div>
      <h2 className="font-heading mb-2 text-xl font-semibold">
        還沒記錄停車位置
      </h2>
      <p className="mb-8 max-w-xs text-sm text-muted-foreground">
        停好車後，點擊下方按鈕記錄位置，再也不用擔心找不到車！
      </p>
      <Button
        className="h-12 rounded-full px-8 text-base shadow-lg shadow-primary/25"
        nativeButton={false}
        render={<Link href="/park" />}
      >
        <MapPin />
        記錄停車位置
      </Button>
    </div>
  );
}
