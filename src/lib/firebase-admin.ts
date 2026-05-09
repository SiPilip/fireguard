import * as admin from 'firebase-admin';

/**
 * Initialize Firebase Admin SDK for server-side operations
 * This module provides access to Firebase services including Cloud Messaging (FCM)
 * for sending push notifications to mobile devices.
 * 
 * Configuration:
 * - Service account credentials are loaded from FIREBASE_SERVICE_ACCOUNT_KEY environment variable
 * - The environment variable should contain a JSON string with the service account key
 * 
 * Usage:
 * import { messaging } from '@/lib/firebase-admin';
 * await messaging.send(message);
 */

// Initialize Firebase Admin SDK only once
if (!admin.apps.length) {
  try {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    
    if (serviceAccountKey) {
      // Parse the service account key from JSON string
      const serviceAccount = JSON.parse(serviceAccountKey);

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

      console.log('Firebase Admin SDK initialized successfully');
    } else {
      console.warn('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. Notifications will not work.');
    }
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error);
    // DO NOT throw error here, it will break the build on Vercel
  }
}

/**
 * Firebase Messaging instance for sending push notifications
 * Use this to send notifications to mobile devices via FCM
 */
export const messaging = admin.messaging();

/**
 * Firebase Admin instance
 * Provides access to all Firebase Admin services
 */
export const firebaseAdmin = admin;
