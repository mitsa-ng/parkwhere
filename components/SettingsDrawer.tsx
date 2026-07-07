'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { Monitor, Moon, Settings, Sun, Trash2 } from 'lucide-react';
import { clearRecords } from '@/lib/storage';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SettingsDrawer({ count }: { count: number }) {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <Drawer open={open} onOpenChange={setOpen} showSwipeHandle>
      <DrawerTrigger
        render={<Button variant="ghost" size="icon-sm" />}
        aria-label="設定"
      >
        <Settings />
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>設定</DrawerTitle>
          <DrawerDescription>外觀與資料管理</DrawerDescription>
        </DrawerHeader>

        <div className="space-y-5 p-4">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">外觀</p>
            <Tabs
              value={theme ?? 'system'}
              onValueChange={(v) => setTheme(v as string)}
            >
              <TabsList className="w-full">
                <TabsTrigger value="light">
                  <Sun />
                  淺色
                </TabsTrigger>
                <TabsTrigger value="dark">
                  <Moon />
                  深色
                </TabsTrigger>
                <TabsTrigger value="system">
                  <Monitor />
                  系統
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <Separator />

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">資料</p>
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button
                    variant="destructive"
                    className="w-full"
                    disabled={count === 0}
                  />
                }
              >
                <Trash2 />
                清除全部記錄{count > 0 && `（${count} 筆）`}
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogMedia className="bg-destructive/10 text-destructive">
                    <Trash2 />
                  </AlertDialogMedia>
                  <AlertDialogTitle>清除全部停車記錄？</AlertDialogTitle>
                  <AlertDialogDescription>
                    將刪除全部 {count} 筆記錄，此動作無法復原。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-white hover:bg-destructive/90"
                    onClick={() => {
                      clearRecords();
                      setOpen(false);
                    }}
                  >
                    清除
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <p className="text-xs text-muted-foreground">
              所有記錄僅儲存在此裝置的瀏覽器中。
            </p>
          </div>
        </div>

        <p className="pb-4 text-center text-xs text-muted-foreground">
          ParkWhere v0.1.0
        </p>
      </DrawerContent>
    </Drawer>
  );
}
