'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import { CarFront, Moon, Sun } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import SettingsDrawer from './SettingsDrawer';

export default function Header({ count }: { count: number }) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <CarFront className="size-4" />
          </span>
          <span className="font-heading text-lg font-semibold tracking-tight">
            ParkWhere
          </span>
        </Link>
        <div className="flex items-center gap-1">
          {count > 0 && (
            <Badge variant="secondary" className="mr-1">
              {count} 筆
            </Badge>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="切換深淺色"
            onClick={() =>
              setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
            }
          >
            <Sun className="dark:hidden" />
            <Moon className="hidden dark:block" />
          </Button>
          <SettingsDrawer count={count} />
        </div>
      </div>
    </header>
  );
}
