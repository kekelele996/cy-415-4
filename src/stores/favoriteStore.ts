import { defineStore } from 'pinia';
import { orderBy } from 'lodash-es';

import { useAuthStore } from '@/stores/authStore';
import { useItemStore } from '@/stores/itemStore';
import { message } from '@/utils/message';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export interface FavoriteRecord {
  item_id: string;
  user_id: string;
  favorited_at: string;
}

const STORAGE_KEY = 'reswap_favorites_v1';

export const useFavoriteStore = defineStore('favorites', {
  state: () => ({
    records: useLocalStorage<FavoriteRecord[]>(STORAGE_KEY, []),
  }),
  getters: {
    myFavorites(state): FavoriteRecord[] {
      const authStore = useAuthStore();
      if (!authStore.currentUser) return [];
      return orderBy(
        state.records.filter((r) => r.user_id === authStore.currentUser!.id),
        ['favorited_at'],
        ['desc'],
      );
    },
    myFavoriteItemIds(): string[] {
      return this.myFavorites.map((r) => r.item_id);
    },
    myFavoriteItems() {
      const itemStore = useItemStore();
      return this.myFavoriteItemIds
        .map((id) => itemStore.items.find((item) => item.id === id))
        .filter(Boolean);
    },
    isFavorite: (state) => (itemId: string): boolean => {
      const authStore = useAuthStore();
      if (!authStore.currentUser) return false;
      return state.records.some(
        (r) => r.item_id === itemId && r.user_id === authStore.currentUser!.id,
      );
    },
    favoriteCount: (state) => (itemId: string): number => {
      return state.records.filter((r) => r.item_id === itemId).length;
    },
  },
  actions: {
    toggle(itemId: string) {
      const authStore = useAuthStore();
      if (!authStore.currentUser) {
        message('请先登录再收藏', 'error');
        return;
      }
      const userId = authStore.currentUser.id;
      const existingIndex = this.records.findIndex(
        (r) => r.item_id === itemId && r.user_id === userId,
      );
      if (existingIndex >= 0) {
        this.records.splice(existingIndex, 1);
        message('已取消收藏', 'success');
      } else {
        this.records.unshift({
          item_id: itemId,
          user_id: userId,
          favorited_at: new Date().toISOString(),
        });
        message('已添加到心愿单', 'success');
      }
    },
    add(itemId: string) {
      const authStore = useAuthStore();
      if (!authStore.currentUser) {
        message('请先登录再收藏', 'error');
        return;
      }
      const userId = authStore.currentUser.id;
      const exists = this.records.some(
        (r) => r.item_id === itemId && r.user_id === userId,
      );
      if (!exists) {
        this.records.unshift({
          item_id: itemId,
          user_id: userId,
          favorited_at: new Date().toISOString(),
        });
        message('已添加到心愿单', 'success');
      }
    },
    remove(itemId: string) {
      const authStore = useAuthStore();
      if (!authStore.currentUser) return;
      const userId = authStore.currentUser.id;
      const index = this.records.findIndex(
        (r) => r.item_id === itemId && r.user_id === userId,
      );
      if (index >= 0) {
        this.records.splice(index, 1);
        message('已取消收藏', 'success');
      }
    },
    clearAll() {
      const authStore = useAuthStore();
      if (!authStore.currentUser) return;
      const userId = authStore.currentUser.id;
      this.records = this.records.filter((r) => r.user_id !== userId);
      message('心愿单已清空', 'success');
    },
  },
});
