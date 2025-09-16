<template>
   <ion-page>
      <ion-content :fullscreen="true">
         <ion-searchbar :debounce="100" placeholder="Search for users..." v-model="searchText" @ionInput="handleInput($event)" class="searchbar"></ion-searchbar>
         <ion-list v-if="results.length && searchText.length" style="margin-top: 10px;">
            <ion-card v-for="{ username, bio, account_id, profilephoto } in results" :key="account_id" @click="viewProfile(account_id)" class="result-card">
               <img :src="profilephoto || defaultProfilePicture" alt="Profiel Foto" class="profile-photo" />
               <div class="result-info">
                  <p class="username">{{ username }}</p>
                  <p v-if="bio" class="searchbio">{{ bio }}</p>
               </div>
            </ion-card>
         </ion-list>
         <div v-else class="no-results">
            <ion-icon :icon="searchOutline" class="no-results-icon"></ion-icon>
            <p class="no-results-text">No results found</p>
         </div>
      </ion-content>
   </ion-page>
</template>

<script setup lang="js">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router';
import { IonPage, IonContent, IonSearchbar, IonList, IonIcon, IonCard, IonCardHeader, onIonViewWillEnter, onIonViewDidLeave } from '@ionic/vue';
import { searchOutline } from 'ionicons/icons';
import { fetchAccounts } from '@/api/accounts/getAccounts';
import { presentToast } from '@/components/toasts/toasts';
import { onMounted } from 'vue';

const accounts = ref([]);
const results = ref([]);
let searchText = ref('');
const router = useRouter();
const account_id = localStorage.getItem('account_id')
const defaultProfilePicture = 'default_profile_picture.svg';


const viewProfile = (follower_id) => {
   console.log(account_id);
   if (follower_id === parseInt(account_id)) {
      router.push({ path: 'profile' });
   } else {
      router.push({ path: 'otherprofile', query: { account_id: follower_id } })
   }
   console.log(follower_id)
}

const LoadAccounts = async () => {
   try {
      const data = await fetchAccounts();
      accounts.value = data;
      results.value = data;
      console.log(searchText);
   } catch (error) {
      presentToast('Fout bij het ophalen van accounts.');
      console.error(error);
   }
};

const handleInput = (event) => {
   searchText.value = event.target.value.toLowerCase();
   filterResults();
};

const filterResults = () => {
   results.value = accounts.value.filter((account) =>
      account.username.toLowerCase().includes(searchText.value)
   );
}


const palette = localStorage.getItem('paletteToggle');

const isDarkModeEnabled = palette === 'true';

if (isDarkModeEnabled) {
   document.documentElement.classList.add('ion-palette-dark');
} else {
   document.documentElement.classList.remove('ion-palette-dark');
}

onIonViewWillEnter(() => {
   filterResults();
});

LoadAccounts();

// onMounted(LoadAccounts);

</script>

<style scoped>
.searchbar {
   --background: #f4f4f4;
   --color: #333;
   margin-bottom: 10px;
}

.result-card {
   display: flex;
   align-items: center;
   padding: 10px;
   cursor: pointer;
   border: 1px solid #ddd;
   border-radius: 10px;
   margin-bottom: 10px;
}

.profile-photo {
   width: 50px;
   height: 50px;
   border-radius: 50%;
   margin-right: 15px;
}

.result-info {
   display: flex;
   flex-direction: column;
}

.username {
   margin: 0;
   font-size: 1rem;
   font-weight: bold;
}

.searchbio {
   margin: 0;
   font-size: 0.9rem;
   color: #666;
   overflow: hidden;
   text-overflow: ellipsis;
   white-space: nowrap;
}

/* .no-results {
   text-align: center;
   padding: 20px;
   color: gray;
}

.no-results-icon {
   font-size: 2rem;
   margin-bottom: 10px;
   color: #ccc;
}

.no-results-text {
   font-size: 1.2rem;
   color: #666;
} */
</style>
