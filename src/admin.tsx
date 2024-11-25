import { Hono } from 'hono/quick'
import { AppContextEnv } from './db';

import { Layout } from './components/Layout'
import { AdminLayout } from './components/AdminLayout';
import { DashboardStats } from './components/DashboardStats';
import { SubscriptionList, type Subscription } from './components/SubscriptionList';
import { SubscriptionForm } from './components/SubscriptionForm';

const admin = new Hono<AppContextEnv>()

const navigation = [
	{ name: 'Dashboard', href: '/admin', icon: '' },
	{ name: 'Subscriptions', href: '/admin/subscriptions', icon: '' },
	{ name: 'Settings', href: '/admin/settings', icon: '' },
];

const mockStats = {
	totalUrls: 12,
	totalResources: 156,
	activeSubscriptions: 10,
	categoryCounts: {
		news: 4,
		blog: 3,
		'social-media': 2,
		documentation: 3
	}
};

const mockSubscriptions: Subscription[] = [
	{
		id: '1',
		url: 'https://example.com/blog',
		category: 'Blog',
		pattern: '.*\.md$',
		schedule: 'Daily',
		lastChecked: '2024-03-10T10:00:00Z',
		resourceCount: 15,
		status: 'active'
	},
	{
		id: '2',
		url: 'https://news.example.com',
		category: 'News',
		pattern: '.*\.html$',
		schedule: 'Every hour',
		lastChecked: '2024-03-10T11:00:00Z',
		resourceCount: 42,
		status: 'active'
	}
];

admin.get('/', (c) => {
	const path = c.req.path;
	return c.html(
		<Layout>
			<AdminLayout navigation={navigation} path={path}>
				<div class="space-y-6">
					<div>
						<h1 class="text-2xl font-semibold text-gray-900">Dashboard</h1>
					</div>
					<DashboardStats stats={mockStats} />
					<div class="mt-8">
						<h2 class="text-lg font-medium text-gray-900 mb-4">Recent Subscriptions</h2>
						<SubscriptionList subscriptions={mockSubscriptions} />
					</div>
				</div>
			</AdminLayout>
		</Layout>
	)
})

admin.get('/subscriptions', (c) => {
	const path = c.req.path;
	return c.html(
		<Layout>
			<AdminLayout navigation={navigation} path={path}>
				<div class="space-y-6">
					<div>
						<h1 class="text-2xl font-semibold text-gray-900">Manage Subscriptions</h1>
					</div>

					<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
						<div class="lg:col-span-2">
							<SubscriptionList subscriptions={mockSubscriptions} />
						</div>
						<div>
							<SubscriptionForm />
						</div>
					</div>
				</div>
			</AdminLayout>
		</Layout>
	)
})

export default admin
