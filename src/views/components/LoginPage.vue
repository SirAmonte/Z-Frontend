<template>
   <ion-page>
      <ion-content>
         <div class="ion-padding center-container">
            <ion-grid>
               <ion-row>
                  <ion-col size="12" size-md="6">
                     <div class="welcome-section">
                        <ion-icon :icon="logoDeviantart" color="danger" size="large"></ion-icon>
                        <h2>Welcome to the App</h2>
                     </div>
                     <ion-item>
                        <!-- <ion-label position="floating">Username</ion-label> -->
                        <ion-input v-model="gebruikerUsername" type="text" placeholder="Username"></ion-input>
                     </ion-item>
                  </ion-col>
               </ion-row>
               <ion-row>
                  <ion-col>
                     <ion-item>
                        <!-- <ion-label position="floating">Password</ion-label> -->
                        <ion-input v-model="gebruikerPassword" type="password" placeholder="Password"></ion-input>
                     </ion-item>
                  </ion-col>
               </ion-row>
               <ion-row>
                  <ion-col>
                     <!-- <ion-button fill="none" style="margin: 0; padding: 0;">
                        <p style="font-size: 12px; color:cyan;">Forgot Password?</p>
                     </ion-button> -->
                     <ion-button expand="block" @click="checkGebruiker()">Login</ion-button>
                     <ion-button expand="block" @click="register">Register</ion-button>
                  </ion-col>
               </ion-row>
            </ion-grid>
         </div>
      </ion-content>
   </ion-page>
</template>

<script setup lang="js">
import { ref } from 'vue';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonGrid, IonRow, IonCol, IonItem, IonLabel, IonInput, IonButton, IonIcon, toastController } from '@ionic/vue';
import { presentToast } from '@/components/toasts/toasts';
import { logoDeviantart } from 'ionicons/icons';
import { totalFollowers } from '@/api/followers/getFollowers';
const { getFollowers } = totalFollowers();

const gebruikerUsername = ref('');
const gebruikerPassword = ref('');

import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();

const hash = async (string) => {
   const utf8 = new TextEncoder().encode(string);
   const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
   const hashArray = Array.from(new Uint8Array(hashBuffer));
   const hashHex = hashArray
      .map((bytes) => bytes.toString(16).padStart(2, '0'))
      .join('');
   return hashHex;
}


const checkGebruiker = async () => {
   console.log(gebruikerPassword.value)
   const unhashedPassword = await hash(gebruikerPassword.value);
   console.log(unhashedPassword);
   axios
      .post('https://teomanliman.be/zapi/api2/login/', {
         username: gebruikerUsername.value.trim(),
         password: unhashedPassword
      })
      .then(response => {
         console.log(gebruikerUsername.value);
         console.log(gebruikerPassword.value);
         console.log(response);
         console.log(response.status);
         console.log(response.data.data);
         const exists = response.data.data;
         console.log(exists.length);
         // https://router.vuejs.org/guide/essentials/navigation.html
         if (exists.length > 0) {
            console.log(exists[0].account_id);
            presentToast(`Welcome ${exists[0].username}`);
            gebruikerUsername.value = '';
            gebruikerPassword.value = '';
            localStorage.setItem('account_id', exists[0].account_id);
            router.push({ path: '/home' })
            // router.push({ path: '/home', query: { account_id: exists[0].account_id } })
         } else {
            presentToast('Username or password is incorrect');
         }
      })
      .catch(error => {
         console.log('Error: ', error);
      })
}

const palette = localStorage.getItem('paletteToggle');

const isDarkModeEnabled = palette === 'true';

if (isDarkModeEnabled) {
   document.documentElement.classList.add('ion-palette-dark');
} else {
   document.documentElement.classList.remove('ion-palette-dark');
}

function register() {
   router.push('/register');
}
</script>

<style scoped>
/* https://forum.ionicframework.com/t/center-grid-in-ion-content/160335/2 */
.center-container {
   height: calc(100vh - 56px);
   display: flex;
   align-items: center;
   justify-content: center;
}

ion-grid {
   background-color: var(--login-background-color);
   padding: 20px;
   border-radius: 8px;
   box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

ion-col ion-item {
   --background: var(--ion-col-background);
   --border-radius: 15px;
   --padding-start: 8px;
   --padding-top: 5px;
   --color: rgb(0, 0, 0);
}

.welcome-section {
   text-align: center;
   margin-bottom: 20px;
   color: var(--welcome-color)
}
</style>