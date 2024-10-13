<script lang="ts">
	import Modal from '$lib/components/Modal.svelte';
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	export let data: PageData;

	let showInsertModal = false;
	let formData: { [key: string]: string } = {};
	let insertStatus: 'idle' | 'loading' | 'success' | 'error' = 'idle';
	let errorMessage = '';

	let fileInput: HTMLInputElement;
	let dragActive = false;

	let processingFile = false;

	let pastedText = '';

	let dropArea: HTMLElement;

	onMount(() => {
		dropArea = document.getElementById('drop-area')!;

		if (dropArea) {
			dropArea.addEventListener('dragenter', handleDragEnter);
			dropArea.addEventListener('dragleave', handleDragLeave);
			dropArea.addEventListener('dragover', handleDragOver);
			dropArea.addEventListener('drop', handleDrop);
		}

		return () => {
			if (dropArea) {
				dropArea.removeEventListener('dragenter', handleDragEnter);
				dropArea.removeEventListener('dragleave', handleDragLeave);
				dropArea.removeEventListener('dragover', handleDragOver);
				dropArea.removeEventListener('drop', handleDrop);
			}
		};
	});

	function handleDragEnter(e: DragEvent) {
		e.preventDefault();
		e.stopPropagation();
		dragActive = true;
	}

	function handleDragLeave(e: DragEvent) {
		e.preventDefault();
		e.stopPropagation();
		dragActive = false;
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		e.stopPropagation();
	}

	async function handleDrop(e: DragEvent) {
		e.preventDefault();
		e.stopPropagation();
		dragActive = false;
		if (e.dataTransfer?.files) {
			await handleFiles(e.dataTransfer.files);
		}
	}

	async function handleFileInput() {
		if (fileInput?.files) {
			await handleFiles(fileInput.files);
		}
	}

	async function handleFiles(files: FileList) {
		const file = files[0];
		if (file) {
			if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
				await processPdfFile(file);
			} else {
				await processFile(file);
			}
		}
	}

	async function handlePastedText() {
		if (pastedText.trim()) {
			await processFile(pastedText);
			pastedText = '';
		}
	}

	async function processFile(content: File | string) {
		processingFile = true;
		try {
			const formDataToSend = new FormData();
			formDataToSend.append('knowledgeBaseName', data.knowledgeBase.name);

			if (typeof content === 'string') {
				formDataToSend.append('pastedText', content);
			} else {
				formDataToSend.append('file', content);
			}

			const response = await fetch('/api/fileToRow', {
				method: 'POST',
				body: formDataToSend
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
			}

			const result = await response.json();

			if (result.success) {
				formData = { ...result.data };
			} else {
				throw new Error(result.error || 'Failed to process file');
			}
		} catch (error) {
			console.error('Error processing file:', error);
			errorMessage = error.message || 'An error occurred while processing the file';
			formData = {};
		} finally {
			processingFile = false;
		}
	}

	async function processPdfFile(file: File) {
		processingFile = true;
		try {
			const formDataToSend = new FormData();
			formDataToSend.append('knowledgeBaseName', data.knowledgeBase.name);
			formDataToSend.append('file', file);

			const response = await fetch('/api/fileToRow', {
				method: 'POST',
				body: formDataToSend
			});

			const result = await response.json();

			if (result.success) {
				formData = { ...result.data };
			} else {
				throw new Error(result.error || 'Failed to process PDF file');
			}
		} catch (error) {
			errorMessage = error.message || 'An error occurred while processing the PDF file';
			formData = {};
		} finally {
			processingFile = false;
		}
	}

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
	<Modal on:close={closeInsertModal} class="w-11/12 max-w-6xl">
		<h2 slot="header" class="text-2xl font-semibold mb-4">Insert Row</h2>
		<div slot="content" class="flex space-x-8">
			<!-- Left column: Drag and drop area and Text input -->
			<div class="w-1/2 space-y-6 relative">
				{#if processingFile}
					<div
						class="absolute inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-10"
					>
						<div class="spinner"></div>
						<p class="ml-2 text-white">Processing...</p>
					</div>
				{/if}
				<div
					id="drop-area"
					class="h-48 flex items-center justify-center border-2 border-dashed border-gray-600 rounded-lg p-4 cursor-pointer"
					class:border-blue-500={dragActive}
					on:click={() => fileInput.click()}
					on:dragenter={handleDragEnter}
					on:dragleave={handleDragLeave}
					on:dragover={handleDragOver}
					on:drop={handleDrop}
				>
					<div class="text-center">
						<svg
							class="mx-auto h-16 w-16 text-gray-400"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
							/>
						</svg>
						<p class="mt-4 text-lg text-gray-300">
							Drag and drop your file here, or click to select
						</p>
						<p class="mt-2 text-sm text-gray-400">Supported file types: .txt, .pdf</p>
					</div>
				</div>
				<input
					type="file"
					accept=".txt,.pdf"
					style="display: none;"
					bind:this={fileInput}
					on:change={handleFileInput}
				/>

				<div class="space-y-2">
					<label for="pastedText" class="block text-sm font-medium text-gray-300">
						Or paste your text here:
					</label>
					<textarea
						id="pastedText"
						bind:value={pastedText}
						class="w-full h-48 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
						placeholder="Paste your text here..."
					></textarea>
					<button
						on:click={handlePastedText}
						class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
						disabled={processingFile}
					>
						Process Pasted Text
					</button>
				</div>
			</div>

			<!-- Right column: Current form -->
			<div class="w-1/2">
				<form on:submit={handleInsert} class="space-y-6">
					{#each data.knowledgeBase.fields as field}
						<div>
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
					<div class="flex justify-end pt-4">
						<button
							type="submit"
							class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded mr-4"
							disabled={insertStatus === 'loading'}
						>
							{insertStatus === 'loading' ? 'Inserting...' : 'Insert'}
						</button>
						<button
							type="button"
							on:click={closeInsertModal}
							class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded"
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
		</div>
	</Modal>
{/if}

<style>
	.spinner {
		border: 4px solid rgba(255, 255, 255, 0.3);
		border-radius: 50%;
		border-top: 4px solid #ffffff;
		width: 60px;
		height: 60px;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
