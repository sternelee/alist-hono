import { type FC } from 'hono/jsx';

export const Home: FC = () => {
  return (
    <div class="min-h-screen bg-gray-50">
      <header class="bg-blue-600 text-white p-4">
        <h1 class="text-3xl font-bold">RSS Subscription Movie and TV Drama Resource Automatic Download Service</h1>
      </header>
      <main class="flex flex-col items-center justify-center h-full p-4">
        <section class="bg-white shadow-md rounded-lg p-6 max-w-4xl w-full">
          <h2 class="text-2xl font-semibold mb-4">Features</h2>
          <ul class="list-disc list-inside">
            <li>Automatic download of movies and TV dramas</li>
            <li>Easy RSS feed subscription management</li>
            <li>High-quality content with regular updates</li>
          </ul>
        </section>
        <section class="bg-white shadow-md rounded-lg p-6 max-w-4xl w-full mt-6">
          <h2 class="text-2xl font-semibold mb-4">Interactive Experience</h2>
          <p class="mb-4">Enjoy a seamless and interactive experience with our user-friendly interface.</p>
          <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">Get Started</button>
        </section>
      </main>
      <footer class="bg-gray-800 text-white p-4 text-center">
        <p>&copy; 2024 RSS Subscription Service. All rights reserved.</p>
      </footer>
    </div>
  )
}
