import { type FC } from 'hono/jsx';

export interface DashboardStats {
	totalUrls: number;
	totalResources: number;
	activeSubscriptions: number;
	categoryCounts: Record<string, number>;
}


export const DashboardStats: FC<{ stats: DashboardStats }> = ({ stats }) => {
	return (
		<div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
			<div class="bg-white overflow-hidden shadow rounded-lg">
				<div class="p-5">
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" class="h-6 w-6 text-gray-400"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17H7A5 5 0 0 1 7 7h2m6 0h2a5 5 0 1 1 0 10h-2m-7-5h8" /></svg>
						</div>
						<div class="ml-5 w-0 flex-1">
							<dl>
								<dt class="text-sm font-medium text-gray-500 truncate">Total URLs</dt>
								<dd class="flex items-baseline">
									<div class="text-2xl font-semibold text-gray-900">{stats.totalUrls}</div>
								</dd>
							</dl>
						</div>
					</div>
				</div>
			</div>

			<div class="bg-white overflow-hidden shadow rounded-lg">
				<div class="p-5">
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" class="h-6 w-6 text-gray-400"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4M10 9H8m8 4H8m8 4H8" /></g></svg>
						</div>
						<div class="ml-5 w-0 flex-1">
							<dl>
								<dt class="text-sm font-medium text-gray-500 truncate">Total Resources</dt>
								<dd class="flex items-baseline">
									<div class="text-2xl font-semibold text-gray-900">{stats.totalResources}</div>
								</dd>
							</dl>
						</div>
					</div>
				</div>
			</div>

			<div class="bg-white overflow-hidden shadow rounded-lg">
				<div class="p-5">
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" class="h-6 w-6 text-gray-400"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M21.801 10A10 10 0 1 1 17 3.335" /><path d="m9 11l3 3L22 4" /></g></svg>
						</div>
						<div class="ml-5 w-0 flex-1">
							<dl>
								<dt class="text-sm font-medium text-gray-500 truncate">Active Subscriptions</dt>
								<dd class="flex items-baseline">
									<div class="text-2xl font-semibold text-gray-900">
										{stats.activeSubscriptions}
									</div>
								</dd>
							</dl>
						</div>
					</div>
				</div>
			</div>

			<div class="bg-white overflow-hidden shadow rounded-lg">
				<div class="p-5">
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" class="h-6 w-6 text-gray-400"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" /></g></svg>
						</div>
						<div class="ml-5 w-0 flex-1">
							<dl>
								<dt class="text-sm font-medium text-gray-500 truncate">Categories</dt>
								<dd class="flex items-baseline">
									<div class="text-2xl font-semibold text-gray-900">
										{Object.keys(stats.categoryCounts).length}
									</div>
								</dd>
							</dl>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
