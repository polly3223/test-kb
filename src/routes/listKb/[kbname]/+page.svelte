<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<svelte:head>
	<title>{data.knowledgeBase.name} - Knowledge Base</title>
</svelte:head>

<div class="min-h-screen bg-gray-900 text-gray-100 p-8">
	<div class="max-w-7xl mx-auto">
		<h1 class="text-4xl font-bold mb-8 text-blue-400">{data.knowledgeBase.name}</h1>

		<div class="flex flex-col md:flex-row gap-8">
			<!-- Left column: KB Description and Fields -->
			<div class="w-full md:w-1/3">
				<div class="bg-gray-800 p-6 rounded-lg mb-8">
					<h2 class="text-2xl font-semibold mb-4 text-blue-300">Description</h2>
					<p class="text-xl text-gray-300">{data.knowledgeBase.description}</p>
				</div>

				<h2 class="text-2xl font-semibold mb-4 text-blue-300">Fields</h2>

				{#if data.knowledgeBase.fields && data.knowledgeBase.fields.length > 0}
					<div class="overflow-x-auto mb-8">
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
					<p class="text-gray-300 bg-gray-800 p-4 rounded-md mb-8">
						No fields found for this knowledge base.
					</p>
				{/if}
			</div>

			<!-- Right column: Rows -->
			<div class="w-full md:w-2/3">
				<!-- <h2 class="text-2xl font-semibold mb-4 text-blue-300">Rows</h2> -->

				{#if data.rows && data.rows.length > 0}
					<div class="overflow-x-auto">
						<table class="w-full bg-gray-800 rounded-lg overflow-hidden">
							<thead>
								<tr class="bg-gray-700">
									{#each data.knowledgeBase.fields as field}
										<th
											class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
											>{field.name}</th
										>
									{/each}
								</tr>
							</thead>
							<tbody class="divide-y divide-gray-700">
								{#each data.rows as row}
									<tr>
										{#each data.knowledgeBase.fields as field}
											<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300"
												>{row[field.name]}</td
											>
										{/each}
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{:else}
					<p class="text-gray-300 bg-gray-800 p-4 rounded-md">
						No rows found for this knowledge base.
					</p>
				{/if}
			</div>
		</div>
	</div>
</div>
