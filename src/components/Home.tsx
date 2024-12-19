import { type FC } from 'hono/jsx';

export const Home: FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <nav className="container mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold">RSS Subscription Service</h1>
          <a href="/login" className="link link-primary bg-white text-blue-600 px-4 py-2 rounded hover:bg-gray-100 transition">
            Sign In
          </a>
        </nav>
      </header>
      <main className="container mx-auto py-12">
        <section className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-gray-800">
            Unlock a World of Entertainment
          </h2>
          <p className="text-lg text-gray-700 mb-8">
            Automatically download your favorite movies and TV dramas with ease.
          </p>
          <button className="bg-purple-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-purple-600 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50">
            Get Started
          </button>
        </section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-2xl font-semibold mb-4 text-gray-800">Features</h3>
            <ul className="list-disc list-inside text-gray-700">
              <li>Automatic download of movies and TV dramas</li>
              <li>Easy RSS feed subscription management</li>
              <li>High-quality content with regular updates</li>
            </ul>
          </section>
          <section className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-2xl font-semibold mb-4 text-gray-800">Interactive Experience</h3>
            <p className="mb-4 text-gray-700">Enjoy a seamless and interactive experience with our user-friendly interface.</p>
          </section>
        </div>
      </main>
      <footer className="bg-gray-800 text-white p-4 text-center mt-12">
        <p>&copy; {new Date().getFullYear()} RSS Subscription Service. All rights reserved.</p>
      </footer>
    </div>
  );
};
