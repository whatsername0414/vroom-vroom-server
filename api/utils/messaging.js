import admin from 'firebase-admin';
import serviceAccount from './../vroomvroomapp-326505-firebase-adminsdk-jd7ch-c45942c2a4.json' assert { type: 'json' };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const getMessaging = async (message) => {
  return admin.messaging().send(message, false);
};
