import TestFirebaseConnection from '@/components/test-firebase-connection';

export default function TestFirebasePage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Firebase Connection Test</h1>
      <TestFirebaseConnection />
      
      <div className="mt-8 space-y-4">
        <h2 className="text-xl font-semibold">Test Instructions:</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>Go to <a href="/auth/register" className="text-blue-500 underline">/auth/register</a> to create a new account</li>
          <li>Complete the registration with email and password</li>
          <li>You should be redirected to <a href="/auth/login" className="text-blue-500 underline">/auth/login</a></li>
          <li>Sign in with your credentials</li>
          <li>Return to this page to see if Firebase connection is working</li>
          <li>Test OAuth signin with Google/Facebook buttons</li>
        </ol>
      </div>
    </div>
  );
}