<script lang="ts">
	import { writable, type Writable } from 'svelte/store';

	interface Field {
		name: string;
		description: string;
	}

	interface KnowledgeBase {
		name: string;
		description: string;
		fields: Field[];
	}

	let knowledgeBase: Writable<KnowledgeBase> = writable({
		name: '',
		description: '',
		fields: [{ name: '', description: '' }]
	});

	function addField() {
		$knowledgeBase.fields = [...$knowledgeBase.fields, { name: '', description: '' }];
	}

	function removeField(index) {
		$knowledgeBase.fields = $knowledgeBase.fields.filter((_, i) => i !== index);
	}

	function handleSubmit() {
		console.log('Submitted KnowledgeBase:', $knowledgeBase);
		// Here you would typically send the data to your backend
	}

	// Add a function to handle field updates
	function updateField(index: number, key: 'name' | 'description', value: string) {
		$knowledgeBase.fields[index][key] = value;
		$knowledgeBase = $knowledgeBase;
	}
</script>

<div class="min-h-screen bg-gray-900 text-gray-100 p-8">
	<div class="max-w-3xl mx-auto">
		<h1 class="text-4xl font-bold mb-8 text-blue-400">Create Knowledge Base</h1>

		<form on:submit|preventDefault={handleSubmit} class="space-y-6">
			<div class="space-y-4">
				<label for="name" class="block text-lg font-medium text-blue-300">Name</label>
				<input
					type="text"
					id="name"
					bind:value={$knowledgeBase.name}
					required
					class="w-full px-4 py-2 rounded-md bg-gray-800 border border-gray-700 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
				/>
			</div>

			<div class="space-y-4">
				<label for="description" class="block text-lg font-medium text-blue-300">Description</label>
				<textarea
					id="description"
					bind:value={$knowledgeBase.description}
					rows="3"
					class="w-full px-4 py-2 rounded-md bg-gray-800 border border-gray-700 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
				></textarea>
			</div>

			<div class="space-y-4">
				<label class="block text-lg font-medium text-blue-300">Fields</label>
				{#each $knowledgeBase.fields as field, index (index)}
					<div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
						<div class="flex-1">
							<input
								type="text"
								id={`field-name-${index}`}
								value={field.name}
								on:input={(e) => updateField(index, 'name', e.target.value)}
								placeholder="Field name"
								required={index === 0}
								class="w-full px-4 py-2 rounded-md bg-gray-800 border border-gray-700 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
							/>
							<label for={`field-name-${index}`} class="sr-only">Field name</label>
						</div>
						<div class="flex-1">
							<input
								type="text"
								id={`field-description-${index}`}
								value={field.description}
								on:input={(e) => updateField(index, 'description', e.target.value)}
								placeholder="Field description"
								class="w-full px-4 py-2 rounded-md bg-gray-800 border border-gray-700 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
							/>
							<label for={`field-description-${index}`} class="sr-only">Field description</label>
						</div>
						{#if index > 0}
							<button
								type="button"
								on:click={() => removeField(index)}
								class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-colors duration-200"
							>
								Remove
							</button>
						{/if}
					</div>
				{/each}
				<button
					type="button"
					on:click={addField}
					class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors duration-200"
				>
					Add Field
				</button>
			</div>

			<button
				type="submit"
				class="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200 text-lg font-semibold"
			>
				Create Knowledge Base
			</button>
		</form>
	</div>
</div>
