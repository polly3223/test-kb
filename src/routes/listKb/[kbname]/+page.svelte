<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<svelte:head>
	<title>{data.knowledgeBase.name} - Knowledge Base</title>
</svelte:head>

<div class="min-h-screen bg-gray-900 text-gray-100 p-8">
	<div class="max-w-6xl mx-auto">
		<h1 class="text-4xl font-bold mb-4 text-blue-400">{data.knowledgeBase.name}</h1>
		<p class="text-xl text-gray-300 mb-8">{data.knowledgeBase.description}</p>

		<h2 class="text-2xl font-semibold mb-4 text-blue-300">Fields</h2>

		{#if data.knowledgeBase.fields && data.knowledgeBase.fields.length > 0}
			<div class="overflow-x-auto">
				<table class="w-full bg-gray-800 rounded-lg overflow-hidden">
					<thead>
						<tr class="bg-gray-700">
							<th
								class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
								>Name</th
							>
							<th
								class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
								>Description</th
							>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-700">
						{#each data.knowledgeBase.fields as field}
							<tr>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{field.name}</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300"
									>{field.description}</td
								>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else}
			<p class="text-gray-300 bg-gray-800 p-4 rounded-md">
				No fields found for this knowledge base.
			</p>
		{/if}
	</div>
</div>
