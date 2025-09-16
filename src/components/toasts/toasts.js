import { toastController } from "@ionic/vue";

export const presentToast = async (bericht) => {
   const toast = await toastController.create({
      message: bericht,
      duration: 1500,
      position: 'top',
      swipeGesture: 'vertical'
   });
   await toast.present();
}