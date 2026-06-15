<template>
  <section v-if="currentUser" class="page profile-page">
    <div class="page-heading">
      <div>
        <p class="eyebrow">个人中心</p>
        <h1>资料越完整，交换越容易达成</h1>
      </div>
    </div>

    <div class="profile-layout">
      <form class="profile-form" @submit.prevent="save">
        <label>
          本地模拟登录
          <select v-model="selectedUserId" @change="switchUser">
            <option v-for="user in users" :key="user.id" :value="user.id">
              {{ user.nickname }} · {{ user.location }}
            </option>
          </select>
        </label>
        <AvatarUploader v-model="form.avatar" />
        <label>
          昵称
          <input v-model="form.nickname" />
        </label>
        <label>
          电话
          <input v-model="form.phone" />
        </label>
        <label>
          常用地点
          <input v-model="form.location" />
        </label>
        <button class="primary-button" type="submit">保存资料</button>
      </form>

      <div class="profile-side">
        <UserBrief :user="{ ...currentUser, ...form }" />
        <div class="stats-row">
          <span>发布 {{ myItems.length }}</span>
          <span>可交换 {{ availableCount }}</span>
          <span>信用 {{ currentUser.credit_score }}</span>
        </div>
      </div>
    </div>

    <section class="my-items">
      <div class="section-header">
        <h2>我发布的物品</h2>
      </div>
      <div v-if="myItems.length" class="waterfall waterfall--compact">
        <ItemCard
          v-for="item in myItems"
          :key="item.id"
          :item="item"
          :owner="currentUser"
        />
      </div>
      <EmptyState v-else title="还没有发布物品" description="发布一件闲置后会出现在这里" mark="物" />
    </section>

    <section class="wishlist">
      <div class="section-header">
        <h2>我的心愿单</h2>
        <span class="wishlist-header">
          <span class="section-subtitle">共 {{ favoriteItems.length }} 件收藏</span>
          <button
            v-if="favoriteItems.length"
            class="text-link"
            type="button"
            @click="clearWishlist"
          >
            清空心愿单
          </button>
        </span>
      </div>
      <div v-if="favoriteItems.length" class="waterfall waterfall--compact">
        <ItemCard
          v-for="item in favoriteItems"
          :key="item.id"
          :item="item"
          :owner="getItemOwner(item.user_id)"
        />
      </div>
      <EmptyState
        v-else
        title="心愿单还是空的"
        description="看到心动的物品，点击心形图标就能收藏在这里"
        mark="♥"
      />
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch, watchEffect } from 'vue';

import AvatarUploader from '@/components/common/AvatarUploader.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import ItemCard from '@/components/common/ItemCard.vue';
import UserBrief from '@/components/common/UserBrief.vue';
import { ItemStatus } from '@/constants/item';
import { useAuth } from '@/hooks/useAuth';
import { useFavoriteStore } from '@/stores/favoriteStore';
import { useItemStore } from '@/stores/itemStore';

const { currentUser, users, login, updateProfile } = useAuth();
const itemStore = useItemStore();
const favoriteStore = useFavoriteStore();
const selectedUserId = ref('');

const form = reactive({
  nickname: '',
  avatar: '',
  phone: '',
  location: '',
});

watchEffect(() => {
  if (currentUser.value) {
    selectedUserId.value = currentUser.value.id;
    form.nickname = currentUser.value.nickname;
    form.avatar = currentUser.value.avatar;
    form.phone = currentUser.value.phone;
    form.location = currentUser.value.location;
  }
});

watch(
  () => users.value.length,
  () => {
    if (!selectedUserId.value && currentUser.value) {
      selectedUserId.value = currentUser.value.id;
    }
  },
);

const myItems = computed(() => (currentUser.value ? itemStore.myItems(currentUser.value.id) : []));
const availableCount = computed(() => myItems.value.filter((item) => item.status === ItemStatus.AVAILABLE).length);
const favoriteItems = computed(() => favoriteStore.myFavoriteItems.filter(Boolean));

const getItemOwner = (userId: string) => users.value.find((user) => user.id === userId);

const clearWishlist = () => {
  if (window.confirm('确定要清空心愿单吗？此操作不可撤销。')) {
    favoriteStore.clearAll();
  }
};

const save = async () => {
  await updateProfile({ ...form });
};

const switchUser = async () => {
  if (selectedUserId.value) {
    await login(selectedUserId.value);
  }
};
</script>
