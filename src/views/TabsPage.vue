<template>
   <ion-page>
      <ion-header>
         <ion-toolbar>
            <div class="toolbar">
               <ion-title>
                  <ion-icon :icon="logoDeviantart" color="danger" size="large" @click="goToHomePage"></ion-icon>
               </ion-title>
               <ion-list v-if="showFilterOption">
                  <ion-item class="filter-item">
                     <ion-select v-model="selectedFilter" @ionChange="showFilter">
                        <ion-select-option value="Alles">Alles</ion-select-option>
                        <ion-select-option value="Favoriet">Favoriet</ion-select-option>
                     </ion-select>
                  </ion-item>
               </ion-list>
            </div>
            <ion-buttons slot="end" v-if="!showMenuButton">
               <ion-menu-button></ion-menu-button>
            </ion-buttons>
            <ion-buttons slot="end" v-if="showMenuButton">
               <ion-button @click="goToNotification">
                  <ion-icon :icon="notificationsOutline" class="icon-size" />
                  <ion-badge color="danger" v-if="unreadNotifications > 0">{{ unreadNotifications }}</ion-badge>
               </ion-button>
            </ion-buttons>
         </ion-toolbar>
      </ion-header>
      <ion-content>
         <ion-tabs>
            <ion-router-outlet></ion-router-outlet>
            <ion-tab-bar slot="bottom">
               <ion-tab-button tab="home" href="/home">
                  <ion-icon aria-hidden="true" :icon="homeOutline" />
               </ion-tab-button>

               <ion-tab-button tab="search" href="/search">
                  <ion-icon aria-hidden="true" :icon="searchOutline" />
               </ion-tab-button>

               <!-- <ion-tab-button tab="notification" href="/notification">
                  <ion-icon aria-hidden="true" :icon="notificationsOutline" />
               </ion-tab-button> -->

               <ion-tab-button tab="message" href="/message">
                  <ion-icon aria-hidden="true" :icon="sendOutline" />
               </ion-tab-button>

               <!-- <ion-tab-button tab="friends" href="/friends">
                  <ion-icon aria-hidden="true" :icon="peopleOutline" />
               </ion-tab-button> -->

               <ion-tab-button tab="profile" href="/profile">
                  <ion-icon aria-hidden="true" :icon="personCircleOutline" />
               </ion-tab-button>
            </ion-tab-bar>
         </ion-tabs>
      </ion-content>
   </ion-page>
</template>

<script setup lang="js">
import { ref } from 'vue';
import { IonTabBar, IonTabButton, IonContent, IonList, IonSelect, IonItem, IonBadge, IonSelectOption, IonToolbar, IonTitle, IonButtons, IonButton, IonMenuButton, IonHeader, IonTabs, IonIcon, IonPage, IonRouterOutlet } from '@ionic/vue';
import { homeOutline, notificationsOutline, personCircleOutline, searchOutline, sendOutline, logoDeviantart } from 'ionicons/icons';
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { totalNotifications } from '../components/notifications/fetchNotifications';
import { watch } from 'vue';

const acc_id = localStorage.getItem('account_id');
const { notifications, getNotifications, updateNotifications, unreadNotifications } = totalNotifications(acc_id);
const route = useRoute();
const router = useRouter();
// computed zorgt om de variabele te manipuleren
const showMenuButton = computed(() => route.path !== '/profile');
const showFilterOption = computed(() => route.path === '/home');
function goToNotification() {
   if (route.path === '/notification') {
      router.push('/home');
   } else {
      router.push('/notification')
   }
}

function goToHomePage() {
   router.push('/home');
}

const selectedFilter = ref(localStorage.getItem('selectedFilter'));

watch(selectedFilter, (newValue) => {
   localStorage.setItem('selectedFilter', newValue);
}, { immediate: true });

function showFilter(event) {
   console.log(selectedFilter.value);
}

</script>

<style scoped>
.icon-size {
   font-size: 30px;
}

.toolbar ion-title {
   flex: 0 0 auto;
   width: 50%;
   max-height: 48;
}

ion-list {
   padding: 0px;
}

.toolbar {
   display: flex;
}

.filter-item {
   width: fit-content;
   padding: 0;
}
</style>
