<template>
  <div class="item-card">
    <RouterLink class="item-card__link" :to="`/item/${item.id}`">
      <div class="item-card__gallery-wrap">
        <ItemImageGallery :images="item.images" :fallback-text="item.category" />
        <button
          v-if="!isMine"
          class="favorite-btn"
          :class="{ 'favorite-btn--active': isFavorited }"
          type="button"
          :aria-label="isFavorited ? '取消收藏' : '收藏'"
          @click.stop="toggleFavorite"
        >
          <svg v-if="isFavorited" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </button>
      </div>
      <div class="item-card__body">
        <div class="item-card__topline">
          <span class="pill">{{ item.category }}</span>
          <span class="status-pill" :class="statusToneClass(item.status)">{{ formatItemStatus(item.status) }}</span>
        </div>
        <h3>{{ item.title }}</h3>
        <p>{{ item.description }}</p>
        <div class="item-card__meta">
          <span>{{ item.location }}</span>
          <span>{{ formatCondition(item.condition) }}</span>
        </div>
        <div class="item-card__owner">
          <span v-if="owner">{{ owner.nickname }}</span>
          <span v-if="isMine" class="mine">我的</span>
        </div>
      </div>
    </RouterLink>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';

import type { Item } from '@/models/item';
import type { User } from '@/models/user';
import { useAuthStore } from '@/stores/authStore';
import { useFavoriteStore } from '@/stores/favoriteStore';
import { useThemeStore } from '@/stores/themeStore';
import { formatCondition, formatItemStatus, statusToneClass } from '@/utils/formatters';

import ItemImageGallery from './ItemImageGallery.vue';

const props = defineProps<{
  item: Item;
  owner?: User;
}>();

const authStore = useAuthStore();
const favoriteStore = useFavoriteStore();
useThemeStore();
const isMine = computed(() => authStore.currentUser?.id === props.item.user_id);
const isFavorited = computed(() => favoriteStore.isFavorite(props.item.id));

const toggleFavorite = () => {
  favoriteStore.toggle(props.item.id);
};
</script>
