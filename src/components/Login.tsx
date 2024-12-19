import { type FC } from 'hono/jsx';

export const Login: FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold text-center mb-8">Welcome Back</h1>
        <div className="space-y-4">
          <form hx-post="/api/auth/sign-in/social" hx-trigger="htmx:afterRequest">
            <input name="provider" type="text" value="github" hidden />
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              Continue with GitHub
            </button>
          </form>
        </div>
      </div>
      <footer className="bg-gray-800 text-white p-4 text-center mt-12 w-full fixed bottom-0">
        <p>&copy; {new Date().getFullYear()} RSS Subscription Service. All rights reserved.</p>
      </footer>
      <script dangerouslySetInnerHTML={{
        __html: `document.addEventListener('htmx:afterRequest', function(evt) {
					console.log(evt);
        });`}}>
      </script>
    </div>
  );
};
