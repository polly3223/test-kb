<script>
	import '../app.css';
	import { page } from '$app/stores';

	const navItems = [
		{ href: '/createKb', label: 'Create KB' },
		{ href: '/listKb', label: 'List KB' },
		{ href: '/chat', label: 'Chat' }
	];
</script>

<header class="bg-gradient-to-r from-sky-400 via-blue-500 to-blue-700 text-white shadow-lg">
	<nav class="container mx-auto px-4 py-3">
		<div class="flex justify-between items-center">
			<a href="/" class="text-2xl font-bold tracking-tight hover:text-gray-200 transition-colors">
				KB Manager
			</a>
			<ul class="flex space-x-1 md:space-x-4">
				{#each navItems as { href, label }}
					<li>
						<a
							{href}
							class="px-3 py-2 rounded-md text-sm font-medium hover:bg-white hover:bg-opacity-20 transition-colors {$page
								.url.pathname === href
								? 'bg-white bg-opacity-20'
								: ''}"
						>
							{label}
						</a>
					</li>
				{/each}
			</ul>
		</div>
	</nav>
</header>

<div class="p-8">
	<slot />
</div>
