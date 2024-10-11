<script lang="ts">
	import { writable, type Writable } from 'svelte/store';
	import * as changeCase from 'change-case';

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

	// Update the submissionStatus store
	let submissionStatus: Writable<string> = writable('');

	// Add this derived store to check if the form is ready to submit
	$: isReadyToSubmit =
		$knowledgeBase.name.trim() !== '' &&
		$knowledgeBase.fields.some((field) => field.name.trim() !== '');

	// Update the handleSubmit function
	async function handleSubmit() {
		if (!isReadyToSubmit) {
			$submissionStatus = 'Please fill in the required fields.';
			return;
		}

		try {
			$submissionStatus = 'Submitting...';
			const submissionData = {
				...$knowledgeBase,
				name: changeCase.pascalCase($knowledgeBase.name)
			};

			const response = await fetch('/api/createKnowledgeBase', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(submissionData)
			});

			if (!response.ok) {
				throw new Error('Failed to create knowledge base');
				$submissionStatus = 'Error creating knowledge base. Please try again.';
			}

			const result = await response.json();
			console.log('Knowledge Base created:', result);
			$submissionStatus = 'Knowledge Base created successfully!';

			// Reset the form
			$knowledgeBase = {
				name: '',
				description: '',
				fields: [{ name: '', description: '' }]
			};
		} catch (error) {
			console.error('Error creating knowledge base:', error);
			$submissionStatus = 'Error creating knowledge base. Please try again.';
		}
	}

	// Add a function to handle field updates
	function updateField(index: number, key: 'name' | 'description', value: string) {
		$knowledgeBase.fields[index][key] = value;
		$knowledgeBase = $knowledgeBase;
	}

	// Add the addField function
	function addField() {
		$knowledgeBase.fields = [...$knowledgeBase.fields, { name: '', description: '' }];
	}

	// Add the removeField function
	function removeField(index: number) {
		$knowledgeBase.fields = $knowledgeBase.fields.filter((_, i) => i !== index);
	}
</script>

<div class="max-w-3xl mx-auto">
	<h1 class="text-4xl font-bold mb-8 text-blue-400">Create Knowledge Base</h1>

	<form on:submit|preventDefault={handleSubmit} class="space-y-6">
		<div class="space-y-4">
			<label for="name" class="block text-lg font-medium text-blue-300">Name *</label>
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
							placeholder={index === 0 ? 'Field name *' : 'Field name'}
							required={index === 0}
							class="w-full px-4 py-2 rounded-md bg-gray-800 border border-gray-700 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
						/>
						<label for={`field-name-${index}`} class="sr-only"
							>{index === 0 ? 'Field name (required)' : 'Field name'}</label
						>
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
			class={`w-full px-6 py-3 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200 text-lg font-semibold
				${isReadyToSubmit ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
			disabled={!isReadyToSubmit}
		>
			Create Knowledge Base
		</button>

		{#if $submissionStatus}
			<div
				class={`mt-4 p-4 rounded-md ${$submissionStatus.includes('Error') ? 'bg-red-600' : 'bg-green-600'}`}
			>
				{$submissionStatus}
			</div>
		{/if}
	</form>
</div>
