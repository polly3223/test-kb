<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<svelte:head>
	<title>Knowledge Bases</title>
</svelte:head>

<div class="min-h-screen bg-gray-900 text-gray-100 p-8">
	<div class="max-w-3xl mx-auto">
		<h1 class="text-4xl font-bold mb-8 text-blue-400">Knowledge Bases</h1>

		{#if data.error}
			<p class="text-red-500 bg-red-900 p-4 rounded-md">{data.error}</p>
		{:else if data.knowledgeBases.length === 0}
			<p class="text-gray-300 bg-gray-800 p-4 rounded-md">No knowledge bases found.</p>
		{:else}
			<ul class="space-y-4">
				{#each data.knowledgeBases as kb}
					<li
						class="bg-gray-800 shadow rounded-lg border border-gray-700 hover:bg-gray-750 transition-colors duration-200"
					>
						<a href="/listKb/{kb.name}" class="block p-6">
							<h2 class="text-2xl font-semibold text-blue-300 mb-2">{kb.name}</h2>
							<p class="text-gray-300">{kb.description}</p>
						</a>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>
