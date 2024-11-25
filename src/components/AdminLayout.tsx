import { type FC } from 'hono/jsx';

interface INavItem {
	name: string;
	href: string;
	icon: string;
}

export const AdminLayout: FC<{ children: any; navigation: INavItem[]; path: string; }> = ({ children, navigation, path }) => {
	return (
		<div class="min-h-screen bg-gray-50">
			<div class="flex h-screen">
				<div class="hidden md:flex md:w-64 md:flex-col">
					<div class="flex flex-col flex-grow pt-5 overflow-y-auto bg-white border-r">
						<div class="flex items-center flex-shrink-0 px-4">
							<h1 class="text-xl font-bold">Resource Tracker</h1>
						</div>
						<div class="mt-8 flex-grow flex flex-col">
							<nav class="flex-1 px-2 space-y-1 flex flex-col" >
								{
									navigation.map(nav => <a href={nav.href} key={nav.name} class={path === nav.href ? 'bg-gray-100 text-gray-900' : "text-gray-900 hover:text-gray-600"}>{nav.name}</a>)
								}
							</nav>
						</div>
					</div>
				</div>

				<div class="flex flex-col flex-1 overflow-hidden">
					<main class="flex-1 relative overflow-y-auto focus:outline-none">
						<div class="py-6">
							<div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
								{children}
							</div>
						</div>
					</main>
				</div>
			</div>
		</div>
	)
}
