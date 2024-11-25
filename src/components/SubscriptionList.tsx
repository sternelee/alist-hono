import { type FC } from 'hono/jsx';

export interface Subscription {
	id: string;
	url: string;
	category: string;
	pattern: string;
	schedule: string;
	lastChecked?: string;
	resourceCount: number;
	status: 'active' | 'error' | 'pending';
}

export const SubscriptionList: FC<{ subscriptions: Subscription[] }> = ({ subscriptions }) => {
	return (
		<div class="bg-white shadow overflow-hidden sm:rounded-md">
			<ul class="divide-y divide-gray-200">
				{subscriptions.map((subscription) => (
					<li key={subscription.id}>
						<div class="px-4 py-4 sm:px-6">
							<div class="flex items-center justify-between">
								<div class="flex items-center">
									<p class="text-sm font-medium text-blue-600 truncate">{subscription.url}</p>
									<span class={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${subscription.status === 'active' ? 'bg-green-100 text-green-800' :
											subscription.status === 'error' ? 'bg-red-100 text-red-800' :
												'bg-yellow-100 text-yellow-800'}`}>
										{subscription.status}
									</span>
								</div>
								<div class="ml-2 flex-shrink-0 flex">
									<p class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
										{subscription.category}
									</p>
								</div>
							</div>
							<div class="mt-2 sm:flex sm:justify-between">
								<div class="sm:flex">
									<p class="flex items-center text-sm text-gray-500">
										<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" class="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" ><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></g></svg>
										{subscription.schedule}
									</p>
									<p class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
										Resources: {subscription.resourceCount}
									</p>
								</div>
								<div class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
									<p class="flex items-center">
										{subscription.lastChecked ? (
											<>Last checked: {new Date(subscription.lastChecked).toLocaleString()}</>
										) : (
											<><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" class="mr-1.5 h-4 w-4 text-gray-400" ><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" /></g></svg>Never checked</>
										)}
									</p>
								</div>
							</div>
						</div>
					</li>
				))}
			</ul>
		</div>
	)
}
