<script lang="ts">
	import Modal from '$lib/components/Modal.svelte';
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';

	export let data: PageData;

	let showInsertModal = false;
	let formData: { [key: string]: string } = {};
	let insertStatus: 'idle' | 'loading' | 'success' | 'error' = 'idle';
	let errorMessage = '';

	function openInsertModal() {
		showInsertModal = true;
		formData = {};
		insertStatus = 'idle';
		errorMessage = '';
	}

	function closeInsertModal() {
		showInsertModal = false;
	}

	async function handleInsert(event: Event) {
		event.preventDefault();
		insertStatus = 'loading';

		try {
			const response = await fetch('/api/insertRow', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					knowledgeBase: data.knowledgeBase.name,
					rowData: formData
				})
			});

			const result = await response.json();

			if (result.success) {
				insertStatus = 'success';
				setTimeout(() => {
					closeInsertModal();
					goto(`/listKb/${data.knowledgeBase.name}`, { invalidateAll: true });
				}, 1500);
			} else {
				throw new Error(result.error || 'Failed to insert row');
			}
		} catch (error) {
			insertStatus = 'error';
			errorMessage = error.message || 'An error occurred while inserting the row';
		}
	}
</script>

<svelte:head>
	<title>{data.knowledgeBase.name} - Knowledge Base</title>
</svelte:head>

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
			<div class="flex justify-between items-center mb-4">
				<h2 class="text-2xl font-semibold text-blue-300">Rows</h2>
				<button
					on:click={openInsertModal}
					class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
				>
					Insert Row
				</button>
			</div>

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

<!-- Insert Row Modal -->
{#if showInsertModal}
	<Modal on:close={closeInsertModal}>
		<h2 slot="header" class="text-2xl font-semibold mb-4">Insert Row</h2>
		<div slot="content">
			<form on:submit={handleInsert}>
				{#each data.knowledgeBase.fields as field}
					<div class="mb-4">
						<label for={field.name} class="block text-sm font-medium text-gray-300 mb-2">
							{field.name}
						</label>
						<input
							type="text"
							id={field.name}
							name={field.name}
							bind:value={formData[field.name]}
							class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
							required
						/>
					</div>
				{/each}
				<div class="flex justify-end mt-6">
					<button
						type="submit"
						class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mr-2"
						disabled={insertStatus === 'loading'}
					>
						{insertStatus === 'loading' ? 'Inserting...' : 'Insert'}
					</button>
					<button
						type="button"
						on:click={closeInsertModal}
						class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
						disabled={insertStatus === 'loading'}
					>
						Cancel
					</button>
				</div>
			</form>
			{#if insertStatus === 'success'}
				<p class="mt-4 text-green-400">Row inserted successfully! Refreshing...</p>
			{:else if insertStatus === 'error'}
				<p class="mt-4 text-red-400">{errorMessage}</p>
			{/if}
		</div>
	</Modal>
{/if}
