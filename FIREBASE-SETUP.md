# Firebase Setup Instructions

This document provides instructions on how to set up Firebase for your Car Rental Web application.

## 1. Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter a project name (e.g., "Car Rental Web")
4. Enable or disable Google Analytics as per your preference
5. Click "Create project"

## 2. Register Your Web App

1. In the Firebase Console, click on the project you just created
2. Click on the web icon (</>) to add a web app
3. Register your app with a nickname (e.g., "Car Rental Web")
4. Check "Also set up Firebase Hosting" if you plan to use it
5. Click "Register app"
6. Copy the Firebase configuration values

## 3. Configure Your Environment Variables

1. Open the `.env.local` file in your project
2. Fill in the Firebase configuration values:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

3. Generate a secure random string for NEXTAUTH_SECRET:
   - You can use `openssl rand -base64 32` in a terminal
   - Or use an online generator like [Generate Random](https://generate-random.org/encryption-key-generator)

4. Add the generated secret to your .env.local:
```
NEXTAUTH_SECRET=your_generated_secret
```

## 4. Enable Authentication Methods

1. In the Firebase Console, go to "Authentication" > "Sign-in method"
2. Enable the authentication methods you want to use:
   - Email/Password
   - Google
   - GitHub
   - Facebook
   - Twitter
   - etc.

3. For OAuth providers (Google, Facebook, GitHub, etc.):
   - Configure the provider settings in Firebase
   - Add the client ID and secret to your `.env.local` file:
   ```
   AUTH_GOOGLE_ID=your_google_client_id
   AUTH_GOOGLE_SECRET=your_google_client_secret
   AUTH_FACEBOOK_ID=your_facebook_app_id
   AUTH_FACEBOOK_SECRET=your_facebook_app_secret
   AUTH_GITHUB_ID=your_github_client_id
   AUTH_GITHUB_SECRET=your_github_client_secret
   ```

### Facebook OAuth Setup:
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or use existing one
3. Add "Facebook Login" product to your app
4. In Facebook Login settings, add your domain to "Valid OAuth Redirect URIs":
   - For development: `http://localhost:3000/api/auth/callback/facebook`
   - For production: `https://yourdomain.com/api/auth/callback/facebook`
5. Copy the App ID and App Secret to your `.env.local` file
6. In Firebase Console, go to Authentication > Sign-in method > Facebook
7. Enable Facebook and enter your App ID and App Secret

## 5. Set Up Firestore Database

1. In the Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in production mode" or "Start in test mode" (for development)
4. Select a location for your database
5. Click "Enable"

## 6. Set Up Storage

1. In the Firebase Console, go to "Storage"
2. Click "Get started"
3. Review and accept the default rules or modify them
4. Click "Next"
5. Choose a location for your storage bucket
6. Click "Done"

## 7. Deploy Rules (Optional)

1. Create Firestore security rules in a `firestore.rules` file
2. Create Storage security rules in a `storage.rules` file
3. Deploy the rules using the Firebase CLI:
   ```
   firebase deploy --only firestore:rules,storage:rules
   ```

## 8. Additional Configuration

### Firebase Admin SDK (for server-side operations)

If you need to use the Firebase Admin SDK for server-side operations:

1. Generate a new private key in the Firebase Console:
   - Go to Project Settings > Service accounts
   - Click "Generate new private key"
   - Save the JSON file securely

2. Add the private key to your server environment (not in client-side code)

### Firebase Emulator (for local development)

1. Install the Firebase CLI: `npm install -g firebase-tools`
2. Initialize the emulator: `firebase init emulators`
3. Start the emulator: `firebase emulators:start`

## 9. Test Your Setup

1. Run your application: `npm run dev`
2. Test authentication, database operations, and storage operations
3. Check for any errors in the console

## Troubleshooting

- If you encounter CORS issues, check your Firebase security rules
- For authentication issues, verify your OAuth configuration
- For database or storage issues, check your security rules and permissions