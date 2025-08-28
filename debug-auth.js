// Run this in your browser console to debug authentication
console.log('=== AUTH DEBUG ===');

// Check NextAuth session
if (typeof window !== 'undefined') {
  import('/hooks/use-auth').then(({ useAuth }) => {
    const authData = useAuth();
    console.log('Auth Hook Data:', authData);
  });
}

// Check user store
if (typeof window !== 'undefined') {
  const userStore = JSON.parse(localStorage.getItem('user-store') || '{}');
  console.log('Local Storage User Store:', userStore);
}

// Check session storage
console.log('Session Storage:', sessionStorage);
console.log('Local Storage:', localStorage);
