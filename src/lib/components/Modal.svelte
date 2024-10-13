<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let showCloseButton = true;

	function closeModal() {
		dispatch('close');
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			closeModal();
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

<div
	class="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4"
	on:click|self={closeModal}
>
	<div
		class="bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
		on:click|stopPropagation
	>
		<div class="p-6">
			{#if showCloseButton}
				<button
					on:click={closeModal}
					class="absolute top-4 right-4 text-gray-400 hover:text-white"
					aria-label="Close modal"
				>
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			{/if}
			<div class="mb-4">
				<slot name="header" />
			</div>
			<div>
				<slot name="content" />
			</div>
		</div>
	</div>
</div>

<style>
	/* Add any additional styles here if needed */
</style>
