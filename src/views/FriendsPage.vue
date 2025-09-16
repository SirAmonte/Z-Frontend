<template>
   <ion-page>
      <ion-content>
         <ion-list>
            <ion-item>
               <ion-avatar slot="start">
                  <!-- <img :src="friend.avatar" /> -->
               </ion-avatar>
               <ion-label>
                  <h2>John Doe</h2>
               </ion-label>
            </ion-item>
         </ion-list>
      </ion-content>
   </ion-page>
</template>

<script setup lang="js">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonAvatar, IonLabel, IonIcon } from '@ionic/vue';
import { logoDeviantart } from 'ionicons/icons';
</script>

<style scoped>
ion-avatar img {
   border-radius: 50%;
}
</style>