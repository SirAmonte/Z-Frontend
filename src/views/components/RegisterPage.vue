<template>
   <ion-page>
      <ion-content>
         <div class="ion-padding center-container">
            <ion-grid>
               <ion-row>
                  <ion-col>
                     <div class="welcome-section">
                        <ion-icon :icon="logoDeviantart" color="danger" size="large"></ion-icon>
                        <h2>Welcome to the App</h2>
                     </div>
                     <ion-item>
                        <!-- <ion-label position="floating">Username</ion-label> -->
                        <ion-input v-model="gebruikerUsername" type="text" required="true" placeholder="Username"></ion-input>
                     </ion-item>
                  </ion-col>
               </ion-row>
               <ion-row>
                  <ion-col>
                     <ion-item>
                        <!-- <ion-label position="floating">Email</ion-label> -->
                        <ion-input v-model="gebruikerEmail" type="email" required="true" placeholder="Email"></ion-input>
                     </ion-item>
                  </ion-col>
               </ion-row>
               <ion-row>
                  <ion-col>
                     <ion-item>
                        <!-- <ion-label position="floating">Password</ion-label> -->
                        <ion-input v-model="gebruikerPassword" type="password" required="true" placeholder="Password"></ion-input>
                     </ion-item>
                  </ion-col>
               </ion-row>
               <ion-row>
                  <ion-col>
                     <ion-button expand="block" @click="voegGebruikerToe()">Register</ion-button>
                     <ion-button expand="block" @click="login">Already Registered?</ion-button>
                  </ion-col>
               </ion-row>
            </ion-grid>
         </div>
      </ion-content>
   </ion-page>
</template>

<script setup lang="js">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonGrid, IonRow, IonCol, IonItem, IonLabel, IonInput, IonButton, IonIcon, toastController } from '@ionic/vue';
import { logoDeviantart } from 'ionicons/icons';
import axios from 'axios';

const router = useRouter();
const gebruikerUsername = ref('');
const gebruikerEmail = ref('');
const gebruikerPassword = ref('');
// const lijstGebruikers = ref([]);

const presentToast = async (bericht) => {
   const toast = await toastController.create({
      message: bericht,
      duration: 3000,
      position: 'top'
   });
   await toast.present();
}

function register() {
   router.push('login');
}

const getLijstGebruikers = async () => {
   return axios
      .get('https://teomanliman.be/zapi/api2/accounts/')
      .then(response => {
         console.log(response);
         console.log(response.data.data);
         return response.data.data;
      })
}

// https://remarkablemark.medium.com/how-to-generate-a-sha-256-hash-with-javascript-d3b2696382fd
const hash = async (string) => {
   const utf8 = new TextEncoder().encode(string);
   const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
   const hashArray = Array.from(new Uint8Array(hashBuffer));
   const hashHex = hashArray
      .map((bytes) => bytes.toString(16).padStart(2, '0'))
      .join('');
   return hashHex;
}



const voegGebruikerToe = async () => {
   const lijstGebruikers = await getLijstGebruikers();
   // const lijstGebruikers = response.data.data;
   console.log(lijstGebruikers.length);
   hash(gebruikerPassword.value).then((hex) => console.log(hex));
   let userExists = false;
   for (let i = 0; i < lijstGebruikers.length; i++) {
      if (lijstGebruikers[i].username === gebruikerUsername.value) {
         userExists = true;
      }
      console.log(lijstGebruikers[i].username);
   }
   console.log(lijstGebruikers);
   if (!userExists) {
      switch (true) {
         case gebruikerEmail.value.length === 0:
            presentToast('Email needs to be entered');
            break;
         case gebruikerUsername.value.length === 0:
            presentToast('Username needs to be entered');
            break;
         case gebruikerPassword.value.length < 8:
            presentToast('Password needs to be atleast 8 characters');
            break;
         default:
            const hashedPassword = await hash(gebruikerPassword.value);
            console.log(hashedPassword);
            axios
               .post('https://teomanliman.be/zapi/api2/accounts/', {
                  username: gebruikerUsername.value,
                  email: gebruikerEmail.value,
                  password: hashedPassword
               })
               .then(response => {
                  console.log(response);
                  if (response.status === 200) {
                     gebruikerUsername.value = '';
                     gebruikerEmail.value = '';
                     gebruikerPassword.value = '';
                     presentToast('Account created');
                     register();
                  }
               })
      }
   } else {
      presentToast('Username is already taken');
   }
}

const palette = localStorage.getItem('paletteToggle');

const isDarkModeEnabled = palette === 'true';

if (isDarkModeEnabled) {
   document.documentElement.classList.add('ion-palette-dark');
} else {
   document.documentElement.classList.remove('ion-palette-dark');
}

function login() {
   router.push('/login');
}
</script>

<style scoped>
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
