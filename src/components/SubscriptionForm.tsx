import { type FC } from 'hono/jsx';

const categories = ['News', 'Blog', 'Social Media', 'Documentation', 'Other'];
const schedules = ['Every hour', 'Every 6 hours', 'Daily', 'Weekly'];

export const SubscriptionForm: FC = () => {
	return (
		<form class="space-y-6 bg-white p-6 rounded-lg shadow">
			<div>
				<label class="block text-sm font-medium text-gray-700">URL</label>
				<input
					type="url"
					required
					class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
					placeholder="https://example.com"
				/>
			</div>

			<div>
				<label class="block text-sm font-medium text-gray-700">Category</label>
				<select
					class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
				>
					{categories.map(category => (
						<option key={category} value={category.toLowerCase()}>
							{category}
						</option>
					))}
				</select>
			</div>

			<div>
				<label class="block text-sm font-medium text-gray-700">Pattern (RegEx)</label>
				<input
					type="text"
					class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
					placeholder=".*\.pdf$"
				/>
				<p class="mt-1 text-sm text-gray-500">Regular expression to match resources</p>
			</div>

			<div>
				<label class="block text-sm font-medium text-gray-700">Check Schedule</label>
				<select
					class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
				>
					{schedules.map(schedule => (
						<option key={schedule} value={schedule.toLowerCase().replace(' ', '-')}>
							{schedule}
						</option>
					))}
				</select>
			</div>

			<div>
				<button
					type="submit"
					class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" class="h-4 w-4 mr-2"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14m-7-7v14" /></svg>
					Add Subscription
				</button>
			</div>
		</form>
	);
};
